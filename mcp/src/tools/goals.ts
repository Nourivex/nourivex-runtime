import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod/v3';
import * as path from 'node:path';
import type { Goal } from '../schemas/goal.js';
import { ScopeAlarmStatusSchema } from '../schemas/goal.js';
import { resolveGoalsDir } from '../utils/resolver.js';
import { readJsonSafe, writeJsonAtomic, ensureDirExists } from '../utils/fs-ops.js';

// ---------- Internal types (file shapes) ----------

interface ActiveGoalFile {
  activeGoal: Goal | null;
  lastUpdated: string;
}

interface HistoryEntry {
  id: string;
  title: string;
  status: string;
  created: string;
  completedAt: string;
  archivePath: string;
}

interface HistoryFile {
  version: string;
  lastUpdated: string;
  goals: HistoryEntry[];
}

// ---------- Helpers ----------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

function timestamp(): string {
  return new Date().toISOString();
}

function stringifyValue(v: unknown): string {
  return typeof v === 'string' ? v : JSON.stringify(v);
}

// ---------- Registration ----------

export function registerGoalTools(server: McpServer): void {
  // ── goal_get ──────────────────────────────────────────────
  server.tool(
    'goal_get',
    'Read the current active goal',
    {},
    async () => {
      const activePath = path.join(resolveGoalsDir(), '_active.json');
      const { data, error } = await readJsonSafe<ActiveGoalFile>(activePath);

      if (error || !data) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ goal: null, error: 'No goals storage found' }, null, 2) }],
        };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ goal: data.activeGoal }, null, 2) }],
      };
    },
  );

  // ── goal_create ───────────────────────────────────────────
  server.tool(
    'goal_create',
    'Create a new active goal',
    {
      title: z.string().min(1, 'Title is required'),
      objective: z.string().min(1, 'Objective is required'),
      successCriteria: z.array(z.string()).min(1, 'At least one success criterion required'),
      outOfScope: z.array(z.string()),
    },
    async (input) => {
      const goalsDir = resolveGoalsDir();
      const activePath = path.join(goalsDir, '_active.json');

      // 1. Check if active goal already exists
      const { data: existing } = await readJsonSafe<ActiveGoalFile>(activePath);
      if (existing?.activeGoal) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: 'Active goal already exists. Complete or abandon it first.' }, null, 2) }],
          isError: true,
        };
      }

      // 2. Generate ID
      const dateStr = new Date().toISOString().split('T')[0]!;
      const id = `${dateStr}-${slugify(input.title)}`;

      // 3. Build goal object
      const ts = timestamp();
      const goal: Goal = {
        id,
        status: 'active',
        title: input.title,
        objective: input.objective,
        successCriteria: input.successCriteria,
        outOfScope: input.outOfScope,
        created: ts,
        lastUpdated: ts,
        linkedTodos: [],
        scopeAlarms: [],
        updates: [],
      };

      // 4. Write _active.json
      const activeData: ActiveGoalFile = { activeGoal: goal, lastUpdated: ts };
      const writeResult = await writeJsonAtomic(activePath, activeData);
      if (!writeResult.success) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: writeResult.error }, null, 2) }],
          isError: true,
        };
      }

      // 5. Ensure archive dir
      await ensureDirExists(path.join(goalsDir, 'archive'));

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ goal }, null, 2) }],
      };
    },
  );

  // ── goal_update ───────────────────────────────────────────
  server.tool(
    'goal_update',
    'Update a field on the active goal',
    {
      field: z.string().min(1, 'Field name is required'),
      value: z.any(),
      reason: z.string().min(1, 'Reason is required'),
    },
    async (input) => {
      const activePath = path.join(resolveGoalsDir(), '_active.json');
      const { data: activeFile, error } = await readJsonSafe<ActiveGoalFile>(activePath);

      if (error || !activeFile?.activeGoal) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: 'No active goal found' }, null, 2) }],
          isError: true,
        };
      }

      const goal = activeFile.activeGoal;

      // Validate field exists on the goal
      if (!(input.field in goal)) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: `Invalid field: ${input.field}` }, null, 2) }],
          isError: true,
        };
      }

      // Create GoalUpdate entry
      const ts = timestamp();
      const goalRecord = goal as unknown as Record<string, unknown>;
      const oldValue = goalRecord[input.field];
      goal.updates.push({
        timestamp: ts,
        field: input.field,
        oldValue: stringifyValue(oldValue),
        newValue: stringifyValue(input.value),
        reason: input.reason,
      });

      // Mutate field + lastUpdated
      goalRecord[input.field] = input.value;
      goal.lastUpdated = ts;
      activeFile.lastUpdated = ts;

      const writeResult = await writeJsonAtomic(activePath, activeFile);
      if (!writeResult.success) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: writeResult.error }, null, 2) }],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ goal }, null, 2) }],
      };
    },
  );

  // ── goal_complete ─────────────────────────────────────────
  server.tool(
    'goal_complete',
    'Complete and archive the active goal',
    {
      id: z.string().min(1, 'Goal ID is required'),
    },
    async (input) => {
      const goalsDir = resolveGoalsDir();
      const activePath = path.join(goalsDir, '_active.json');
      const historyPath = path.join(goalsDir, '_history.json');

      // 1. Read active goal
      const { data: activeFile, error } = await readJsonSafe<ActiveGoalFile>(activePath);
      if (error || !activeFile?.activeGoal) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: 'No active goal found' }, null, 2) }],
          isError: true,
        };
      }

      if (activeFile.activeGoal.id !== input.id) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: `Goal ID mismatch: expected ${activeFile.activeGoal.id}, got ${input.id}` }, null, 2) }],
          isError: true,
        };
      }

      const ts = timestamp();
      const archived: Goal & { completedAt: string } = {
        ...activeFile.activeGoal,
        status: 'completed',
        completedAt: ts,
      };

      // 2. Write archive file
      await ensureDirExists(path.join(goalsDir, 'archive'));
      const archiveResult = await writeJsonAtomic(path.join(goalsDir, 'archive', `${input.id}.json`), archived);
      if (!archiveResult.success) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: archiveResult.error }, null, 2) }],
          isError: true,
        };
      }

      // 3. Update history
      const { data: historyFile } = await readJsonSafe<HistoryFile>(historyPath);
      const history: HistoryFile = historyFile ?? { version: '1.0.0', lastUpdated: '', goals: [] };
      history.goals.push({
        id: archived.id,
        title: archived.title,
        status: 'completed',
        created: archived.created,
        completedAt: ts,
        archivePath: `archive/${input.id}.json`,
      });
      history.lastUpdated = ts;
      await writeJsonAtomic(historyPath, history);

      // 4. Clear active
      activeFile.activeGoal = null;
      activeFile.lastUpdated = ts;
      await writeJsonAtomic(activePath, activeFile);

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ goal: archived }, null, 2) }],
      };
    },
  );

  // ── goal_abandon ──────────────────────────────────────────
  server.tool(
    'goal_abandon',
    'Abandon the active goal',
    {
      id: z.string().min(1, 'Goal ID is required'),
      reason: z.string().min(1, 'Reason is required'),
    },
    async (input) => {
      const goalsDir = resolveGoalsDir();
      const activePath = path.join(goalsDir, '_active.json');
      const historyPath = path.join(goalsDir, '_history.json');

      // 1. Read active goal
      const { data: activeFile, error } = await readJsonSafe<ActiveGoalFile>(activePath);
      if (error || !activeFile?.activeGoal) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: 'No active goal found' }, null, 2) }],
          isError: true,
        };
      }

      if (activeFile.activeGoal.id !== input.id) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: `Goal ID mismatch: expected ${activeFile.activeGoal.id}, got ${input.id}` }, null, 2) }],
          isError: true,
        };
      }

      const ts = timestamp();
      const archived: Goal & { completedAt: string } = {
        ...activeFile.activeGoal,
        status: 'abandoned',
        completedAt: ts,
      };

      // Add reason to updates
      archived.updates.push({
        timestamp: ts,
        field: 'status',
        oldValue: 'active',
        newValue: 'abandoned',
        reason: input.reason,
      });

      // 2. Write archive file
      await ensureDirExists(path.join(goalsDir, 'archive'));
      const archiveResult = await writeJsonAtomic(path.join(goalsDir, 'archive', `${input.id}.json`), archived);
      if (!archiveResult.success) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: archiveResult.error }, null, 2) }],
          isError: true,
        };
      }

      // 3. Update history
      const { data: historyFile } = await readJsonSafe<HistoryFile>(historyPath);
      const history: HistoryFile = historyFile ?? { version: '1.0.0', lastUpdated: '', goals: [] };
      history.goals.push({
        id: archived.id,
        title: archived.title,
        status: 'abandoned',
        created: archived.created,
        completedAt: ts,
        archivePath: `archive/${input.id}.json`,
      });
      history.lastUpdated = ts;
      await writeJsonAtomic(historyPath, history);

      // 4. Clear active
      activeFile.activeGoal = null;
      activeFile.lastUpdated = ts;
      await writeJsonAtomic(activePath, activeFile);

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ goal: archived }, null, 2) }],
      };
    },
  );

  // ── goal_add_scope_alarm ──────────────────────────────────
  server.tool(
    'goal_add_scope_alarm',
    'Add a scope alarm to the active goal',
    {
      driftType: z.string().min(1, 'Drift type is required'),
      description: z.string().min(1, 'Description is required'),
      resolution: ScopeAlarmStatusSchema,
    },
    async (input) => {
      const activePath = path.join(resolveGoalsDir(), '_active.json');
      const { data: activeFile, error } = await readJsonSafe<ActiveGoalFile>(activePath);

      if (error || !activeFile?.activeGoal) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: 'No active goal found' }, null, 2) }],
          isError: true,
        };
      }

      const ts = timestamp();
      activeFile.activeGoal.scopeAlarms.push({
        timestamp: ts,
        driftType: input.driftType,
        description: input.description,
        resolution: input.resolution,
      });
      activeFile.activeGoal.lastUpdated = ts;
      activeFile.lastUpdated = ts;

      const writeResult = await writeJsonAtomic(activePath, activeFile);
      if (!writeResult.success) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: writeResult.error }, null, 2) }],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ scopeAlarms: activeFile.activeGoal.scopeAlarms }, null, 2) }],
      };
    },
  );

  // ── goal_history ──────────────────────────────────────────
  server.tool(
    'goal_history',
    'Read the goal history (completed and abandoned goals)',
    {},
    async () => {
      const historyPath = path.join(resolveGoalsDir(), '_history.json');
      const { data, error } = await readJsonSafe<HistoryFile>(historyPath);

      if (error || !data) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ goals: [] }, null, 2) }],
        };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ goals: data.goals }, null, 2) }],
      };
    },
  );
}
