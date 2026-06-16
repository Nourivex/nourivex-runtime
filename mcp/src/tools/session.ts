import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod/v3';
import * as path from 'node:path';
import type { Goal, GoalStatus } from '../schemas/goal.js';
import type { TodoList } from '../schemas/todo.js';
import type { SessionSummary } from '../schemas/session.js';
import { resolveGoalsDir, resolveTodosDir, resolveMemoryDir, resolveSessionsDir } from '../utils/resolver.js';
import { readJsonSafe, writeJsonAtomic, ensureDirExists, fileExists } from '../utils/fs-ops.js';

// ---------- Internal file-shape types ----------

interface ActiveGoalFile {
  activeGoal: Goal | null;
  lastUpdated: string;
}

interface ActiveTodoFile {
  activeTodoId: string;
  activeTodoPath: string;
}

interface MemoryIndexFile {
  version: string;
  lastUpdated: string;
  entries: Array<{ id: string; type: string; title: string; tags: string[]; path: string }>;
}

// ---------- Registration ----------

export function registerSessionTools(server: McpServer): void {
  // ── session_init ──────────────────────────────────────────
  server.tool(
    'session_init',
    'Initialize the .nourivex/ directory structure and scaffold files',
    {},
    async () => {
      const goalsDir = resolveGoalsDir();
      const memoryDir = resolveMemoryDir();
      const todosDir = resolveTodosDir();
      const sessionsDir = resolveSessionsDir();

      // Ensure all directories
      const dirs = [
        goalsDir,
        path.join(goalsDir, 'archive'),
        memoryDir,
        path.join(memoryDir, 'knowledge-vault', 'patterns'),
        path.join(memoryDir, 'knowledge-vault', 'lessons'),
        path.join(memoryDir, 'user-dna'),
        path.join(memoryDir, 'project-map'),
        todosDir,
        path.join(todosDir, 'lists'),
        sessionsDir,
      ];

      for (const dir of dirs) {
        await ensureDirExists(dir);
      }

      const ts = new Date().toISOString();
      const created: string[] = [];

      // Scaffold goals/_active.json
      const goalsActivePath = path.join(goalsDir, '_active.json');
      if (!(await fileExists(goalsActivePath))) {
        await writeJsonAtomic(goalsActivePath, { activeGoal: null, lastUpdated: ts });
        created.push('goals/_active.json');
      }

      // Scaffold goals/_history.json
      const goalsHistoryPath = path.join(goalsDir, '_history.json');
      if (!(await fileExists(goalsHistoryPath))) {
        await writeJsonAtomic(goalsHistoryPath, { version: '1.0.0', lastUpdated: '', goals: [] });
        created.push('goals/_history.json');
      }

      // Scaffold memory/_index.json
      const memoryIndexPath = path.join(memoryDir, '_index.json');
      if (!(await fileExists(memoryIndexPath))) {
        await writeJsonAtomic(memoryIndexPath, { version: '1.0.0', lastUpdated: '', entries: [] });
        created.push('memory/_index.json');
      }

      // Scaffold memory/user-dna/profile.json
      const profilePath = path.join(memoryDir, 'user-dna', 'profile.json');
      if (!(await fileExists(profilePath))) {
        await writeJsonAtomic(profilePath, { preferences: {}, codingStyle: {} });
        created.push('memory/user-dna/profile.json');
      }

      // Scaffold todos/_completed.json
      const todosCompletedPath = path.join(todosDir, '_completed.json');
      if (!(await fileExists(todosCompletedPath))) {
        await writeJsonAtomic(todosCompletedPath, { completedLists: [] });
        created.push('todos/_completed.json');
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            initialized: true,
            structure: {
              goals: ['_active.json', '_history.json', 'archive/'],
              memory: ['_index.json', 'knowledge-vault/patterns/', 'knowledge-vault/lessons/', 'user-dna/profile.json', 'project-map/'],
              todos: ['_completed.json', 'lists/'],
              sessions: [],
            },
            created,
          }, null, 2),
        }],
      };
    },
  );

  // ── session_restore ───────────────────────────────────────
  server.tool(
    'session_restore',
    'Restore session context from persistent storage (goals, todos, memory)',
    {},
    async () => {
      // 1. Read goal
      let goalSummary: { id: string; title: string; status: string } | null = null;
      const { data: goalFile } = await readJsonSafe<ActiveGoalFile>(path.join(resolveGoalsDir(), '_active.json'));
      if (goalFile?.activeGoal) {
        goalSummary = {
          id: goalFile.activeGoal.id,
          title: goalFile.activeGoal.title,
          status: goalFile.activeGoal.status,
        };
      }

      // 2. Read todos
      let todoProgress: { id: string; completed: number; total: number; percentage: number } | null = null;
      const { data: todoActive } = await readJsonSafe<ActiveTodoFile>(path.join(resolveTodosDir(), '_active.json'));
      if (todoActive?.activeTodoId) {
        const todoListPath = path.join(resolveTodosDir(), todoActive.activeTodoPath);
        const { data: todoList } = await readJsonSafe<TodoList>(todoListPath);
        if (todoList) {
          todoProgress = {
            id: todoList.id,
            completed: todoList.progress.completed,
            total: todoList.progress.total,
            percentage: todoList.progress.percentage,
          };
        }
      }

      // 3. Read memory summary
      let memorySummary: { count: number; recentPatterns: string[] } = { count: 0, recentPatterns: [] };
      const { data: memoryIndex } = await readJsonSafe<MemoryIndexFile>(path.join(resolveMemoryDir(), '_index.json'));
      if (memoryIndex) {
        const patterns = memoryIndex.entries.filter((e) => e.type === 'pattern');
        memorySummary = {
          count: memoryIndex.entries.length,
          recentPatterns: patterns.slice(-5).map((p) => p.title),
        };
      }

      // 4. Determine recommendation
      const recommendation: 'resume' | 'fresh' = goalSummary ? 'resume' : 'fresh';

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            goal: goalSummary,
            todos: todoProgress,
            memory: memorySummary,
            recommendation,
          }, null, 2),
        }],
      };
    },
  );

  // ── session_save ──────────────────────────────────────────
  server.tool(
    'session_save',
    'Save current session summary to persistent storage',
    {
      nextSteps: z.string().optional(),
    },
    async (input) => {
      const ts = new Date().toISOString();

      let goalSummary: SessionSummary['goal'] = { id: '', title: 'No active goal', status: 'active' };
      let scopeAlerts = 0;
      const { data: goalFile } = await readJsonSafe<ActiveGoalFile>(path.join(resolveGoalsDir(), '_active.json'));
      if (goalFile?.activeGoal) {
        goalSummary = {
          id: goalFile.activeGoal.id,
          title: goalFile.activeGoal.title,
          status: goalFile.activeGoal.status,
        };
        scopeAlerts = goalFile.activeGoal.scopeAlarms.length;
      }

      // Read current todo state
      let todoProgress = { id: '', completed: 0, total: 0, percentage: 0, lastCompletedTask: undefined as string | undefined };
      const { data: todoActive } = await readJsonSafe<ActiveTodoFile>(path.join(resolveTodosDir(), '_active.json'));
      if (todoActive?.activeTodoId) {
        const { data: todoList } = await readJsonSafe<TodoList>(path.join(resolveTodosDir(), todoActive.activeTodoPath));
        if (todoList) {
          const lastCompleted = todoList.items.filter((i) => i.status === 'completed').pop();
          todoProgress = {
            id: todoList.id,
            completed: todoList.progress.completed,
            total: todoList.progress.total,
            percentage: todoList.progress.percentage,
            lastCompletedTask: lastCompleted?.title,
          };
        }
      }

      // Read memory entries stored this session
      let memoryStored: string[] = [];
      const { data: memoryIndex } = await readJsonSafe<MemoryIndexFile>(path.join(resolveMemoryDir(), '_index.json'));
      if (memoryIndex) {
        memoryStored = memoryIndex.entries.map((e) => e.title);
      }

      // Parse nextSteps
      const nextSteps = input.nextSteps
        ? input.nextSteps.split('\n').map((s) => s.trim()).filter(Boolean)
        : [];

      // Build and write SessionSummary
      const summary: SessionSummary = {
        version: '1.0.0',
        sessionEnd: ts,
        duration: 'unknown',
        goal: goalSummary,
        todoProgress: {
          id: todoProgress.id,
          completed: todoProgress.completed,
          total: todoProgress.total,
          percentage: todoProgress.percentage,
          lastCompletedTask: todoProgress.lastCompletedTask,
        },
        memoryStored,
        scopeAlerts,
        nextSteps,
      };

      const sessionsDir = resolveSessionsDir();
      await ensureDirExists(sessionsDir);
      const writeResult = await writeJsonAtomic(path.join(sessionsDir, 'latest.json'), summary);
      if (!writeResult.success) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: writeResult.error }, null, 2) }],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ summary }, null, 2) }],
      };
    },
  );
}
