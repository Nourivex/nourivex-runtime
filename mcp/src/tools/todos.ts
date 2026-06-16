import { z } from 'zod/v3';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { resolveTodosDir } from '../utils/resolver.js';
import { readJsonSafe, writeJsonAtomic, ensureDirExists } from '../utils/fs-ops.js';
import type { TodoItem, TodoList, TodoProgress, TodoActive } from '../schemas/todo.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function generateId(title: string): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  return `${date}-${slugify(title)}`;
}

function todosDir(): string {
  return resolveTodosDir();
}

function activePath(): string {
  return `${todosDir()}/_active.json`;
}

function completedPath(): string {
  return `${todosDir()}/_completed.json`;
}

function todoFilePath(id: string): string {
  return `${todosDir()}/lists/${id}.json`;
}

function recalculateProgress(items: TodoItem[]): TodoProgress {
  const total = items.length;
  const completed = items.filter((i: TodoItem) => i.status === 'completed').length;
  const inProgress = items.filter((i: TodoItem) => i.status === 'in-progress').length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, inProgress, percentage };
}

async function readActive(): Promise<TodoActive | null> {
  const { data } = await readJsonSafe<TodoActive>(activePath());
  return data;
}

async function writeActive(active: TodoActive | null): Promise<void> {
  const target = active ?? { activeTodoId: '', activeTodoPath: '' };
  const result = await writeJsonAtomic(activePath(), target);
  if (!result.success) {
    throw new Error(result.error ?? 'Failed to write active todos');
  }
}

async function readCompleted(): Promise<{ completedLists: string[] }> {
  const { data } = await readJsonSafe<{ completedLists: string[] }>(completedPath());
  return data ?? { completedLists: [] };
}

async function writeCompleted(completed: { completedLists: string[] }): Promise<void> {
  const result = await writeJsonAtomic(completedPath(), completed);
  if (!result.success) {
    throw new Error(result.error ?? 'Failed to write completed todos');
  }
}

async function readTodoList(id: string): Promise<TodoList | null> {
  const { data } = await readJsonSafe<TodoList>(todoFilePath(id));
  return data;
}

async function writeTodoList(list: TodoList): Promise<void> {
  list.progress = recalculateProgress(list.items);
  const result = await writeJsonAtomic(todoFilePath(list.id), list);
  if (!result.success) {
    throw new Error(result.error ?? 'Failed to write todo list');
  }
}

// ---------------------------------------------------------------------------
// Tool registration
// ---------------------------------------------------------------------------

export function registerTodoTools(server: McpServer): void {
  // ── todo_create ──────────────────────────────────────────────────────────
  server.registerTool(
    'todo_create',
    {
      description: 'Create a new todo list with initial items',
      inputSchema: z.object({
        title: z.string(),
        goalId: z.string().optional(),
        planPath: z.string().optional(),
        items: z.array(
          z.object({
            title: z.string(),
            priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
          }),
        ).min(1),
      }),
    },
    async (input) => {
      const id = generateId(input.title);
      await ensureDirExists(`${todosDir()}/lists`);

      const items: TodoItem[] = input.items.map((item, idx: number) => ({
        id: `${id}-item-${idx}`,
        title: item.title,
        status: 'pending' as const,
        priority: item.priority,
      }));

      const list: TodoList = {
        id,
        title: input.title,
        goalId: input.goalId,
        planPath: input.planPath,
        items,
        progress: recalculateProgress(items),
      };

      await writeTodoList(list);
      await writeActive({ activeTodoId: id, activeTodoPath: `lists/${id}.json` });

      return { content: [{ type: 'text' as const, text: JSON.stringify(list) }] };
    },
  );

  // ── todo_get ─────────────────────────────────────────────────────────────
  server.registerTool(
    'todo_get',
    {
      description: 'Get a todo list by ID, or the active todo list if no ID given',
      inputSchema: z.object({
        id: z.string().optional(),
      }),
    },
    async (input) => {
      let id = input.id;
      if (!id) {
        const active = await readActive();
        if (!active?.activeTodoId) {
          return { content: [{ type: 'text' as const, text: JSON.stringify({ error: 'No active todo list' }) }] };
        }
        id = active.activeTodoId;
      }

      const list = await readTodoList(id);
      if (!list) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: `Todo list not found: ${id}` }) }] };
      }

      list.progress = recalculateProgress(list.items);
      return { content: [{ type: 'text' as const, text: JSON.stringify(list) }] };
    },
  );

  // ── todo_list ────────────────────────────────────────────────────────────
  server.registerTool(
    'todo_list',
    {
      description: 'List the active todo and recently completed todo lists',
    },
    async () => {
      const active = await readActive();
      let activeList: TodoList | null = null;
      if (active?.activeTodoId) {
        activeList = await readTodoList(active.activeTodoId);
        if (activeList) {
          activeList.progress = recalculateProgress(activeList.items);
        }
      }

      const completed = await readCompleted();
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ active: activeList, completed: completed.completedLists }),
          },
        ],
      };
    },
  );

  // ── todo_update_item ─────────────────────────────────────────────────────
  server.registerTool(
    'todo_update_item',
    {
      description: 'Update the status of a specific todo item',
      inputSchema: z.object({
        todoId: z.string(),
        itemId: z.string(),
        status: z.enum(['pending', 'in-progress', 'completed', 'blocked']),
        completedAt: z.string().optional(),
      }),
    },
    async (input) => {
      const list = await readTodoList(input.todoId);
      if (!list) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: `Todo list not found: ${input.todoId}` }) }] };
      }

      const item = list.items.find((i: TodoItem) => i.id === input.itemId);
      if (!item) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: `Item not found: ${input.itemId}` }) }] };
      }

      item.status = input.status;
      if (input.status === 'completed') {
        item.completedAt = input.completedAt ?? new Date().toISOString();
      }

      await writeTodoList(list);
      return { content: [{ type: 'text' as const, text: JSON.stringify(list) }] };
    },
  );

  // ── todo_add_item ────────────────────────────────────────────────────────
  server.registerTool(
    'todo_add_item',
    {
      description: 'Add a new item to an existing todo list',
      inputSchema: z.object({
        todoId: z.string(),
        title: z.string(),
        priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
        blockedBy: z.string().optional(),
      }),
    },
    async (input) => {
      const list = await readTodoList(input.todoId);
      if (!list) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: `Todo list not found: ${input.todoId}` }) }] };
      }

      const newItem: TodoItem = {
        id: `${input.todoId}-item-${list.items.length}`,
        title: input.title,
        status: 'pending',
        priority: input.priority ?? 'medium',
        blockedBy: input.blockedBy,
      };

      list.items.push(newItem);
      await writeTodoList(list);
      return { content: [{ type: 'text' as const, text: JSON.stringify(list) }] };
    },
  );

  // ── todo_complete ────────────────────────────────────────────────────────
  server.registerTool(
    'todo_complete',
    {
      description: 'Mark a todo list as completed and archive it',
      inputSchema: z.object({
        id: z.string(),
      }),
    },
    async (input) => {
      const list = await readTodoList(input.id);
      if (!list) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: `Todo list not found: ${input.id}` }) }] };
      }

      for (const item of list.items) {
        if (item.status !== 'completed') {
          item.status = 'completed';
          item.completedAt = new Date().toISOString();
        }
      }
      list.progress = recalculateProgress(list.items);
      await writeTodoList(list);

      const completed = await readCompleted();
      if (!completed.completedLists.includes(input.id)) {
        completed.completedLists.push(input.id);
      }
      await writeCompleted(completed);

      const active = await readActive();
      if (active?.activeTodoId === input.id) {
        await writeActive(null);
      }

      return { content: [{ type: 'text' as const, text: JSON.stringify(list) }] };
    },
  );

  // ── todo_progress ────────────────────────────────────────────────────────
  server.registerTool(
    'todo_progress',
    {
      description: 'Get progress stats for a todo list (active by default)',
      inputSchema: z.object({
        id: z.string().optional(),
      }),
    },
    async (input) => {
      let id = input.id;
      if (!id) {
        const active = await readActive();
        if (!active?.activeTodoId) {
          return { content: [{ type: 'text' as const, text: JSON.stringify({ error: 'No active todo list' }) }] };
        }
        id = active.activeTodoId;
      }

      const list = await readTodoList(id);
      if (!list) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: `Todo list not found: ${id}` }) }] };
      }

      const progress = recalculateProgress(list.items);
      const blocked = list.items.filter((i: TodoItem) => i.status === 'blocked').length;
      const pending = list.items.filter((i: TodoItem) => i.status === 'pending').length;

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              id: list.id,
              title: list.title,
              ...progress,
              blocked,
              pending,
            }),
          },
        ],
      };
    },
  );
}
