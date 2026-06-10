/**
 * Unit Tests: Goal Tracker (nvx-goal-preservation)
 *
 * Tests verify the persistent goal lifecycle:
 * - Goal creation and persistence
 * - Session resume check
 * - Scope alarm logging
 * - Goal completion and archiving
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

// --- Helpers ---

interface ScopeAlarm {
  timestamp: string;
  driftType: string;
  description: string;
  resolution: 'skipped' | 'approved' | 'escalated';
  notes?: string;
}

interface Goal {
  id: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  title: string;
  objective: string;
  successCriteria: string[];
  outOfScope: string[];
  context: string;
  created: string;
  lastUpdated: string;
  completedAt?: string;
  linkedPlan: string | null;
  linkedTodos: string[];
  scopeAlarms: ScopeAlarm[];
  updates: any[];
}

async function initGoalsStorage(baseDir: string): Promise<void> {
  const goalsDir = path.join(baseDir, '.nourivex', 'goals');
  await fs.ensureDir(path.join(goalsDir, 'archive'));
  await fs.writeJson(path.join(goalsDir, '_active.json'), {
    version: '1.0.0',
    lastUpdated: '',
    activeGoal: null
  }, { spaces: 2 });
  await fs.writeJson(path.join(goalsDir, '_history.json'), {
    version: '1.0.0',
    lastUpdated: '',
    goals: []
  }, { spaces: 2 });
}

async function createGoal(baseDir: string, goal: Goal): Promise<void> {
  const activePath = path.join(baseDir, '.nourivex', 'goals', '_active.json');
  const active = await fs.readJson(activePath);
  active.activeGoal = goal;
  active.lastUpdated = new Date().toISOString();
  await fs.writeJson(activePath, active, { spaces: 2 });
}

async function logScopeAlarm(baseDir: string, alarm: ScopeAlarm): Promise<void> {
  const activePath = path.join(baseDir, '.nourivex', 'goals', '_active.json');
  const active = await fs.readJson(activePath);
  if (active.activeGoal) {
    active.activeGoal.scopeAlarms.push(alarm);
    active.activeGoal.lastUpdated = new Date().toISOString();
    await fs.writeJson(activePath, active, { spaces: 2 });
  }
}

async function completeGoal(baseDir: string, goalId: string): Promise<void> {
  const activePath = path.join(baseDir, '.nourivex', 'goals', '_active.json');
  const historyPath = path.join(baseDir, '.nourivex', 'goals', '_history.json');
  const archiveDir = path.join(baseDir, '.nourivex', 'goals', 'archive');

  const active = await fs.readJson(activePath);
  const goal = { ...active.activeGoal, status: 'completed', completedAt: new Date().toISOString() };

  await fs.writeJson(path.join(archiveDir, `${goalId}.json`), goal, { spaces: 2 });

  const history = await fs.readJson(historyPath);
  history.goals.push({ id: goal.id, title: goal.title, status: 'completed', completedAt: goal.completedAt });
  history.lastUpdated = new Date().toISOString();
  await fs.writeJson(historyPath, history, { spaces: 2 });

  active.activeGoal = null;
  active.lastUpdated = new Date().toISOString();
  await fs.writeJson(activePath, active, { spaces: 2 });
}

// --- Tests ---

describe('Goal Tracker — Persistent Goal Lifecycle', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nvx-goals-test-'));
    await initGoalsStorage(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('Storage Initialization', () => {
    it('creates _active.json with null activeGoal', async () => {
      const active = await fs.readJson(path.join(tempDir, '.nourivex', 'goals', '_active.json'));
      expect(active.version).toBe('1.0.0');
      expect(active.activeGoal).toBeNull();
    });

    it('creates _history.json with empty goals array', async () => {
      const history = await fs.readJson(path.join(tempDir, '.nourivex', 'goals', '_history.json'));
      expect(history.version).toBe('1.0.0');
      expect(history.goals).toHaveLength(0);
    });

    it('creates archive directory', async () => {
      expect(await fs.pathExists(path.join(tempDir, '.nourivex', 'goals', 'archive'))).toBe(true);
    });
  });

  describe('Goal Creation (Step 2 — Persist)', () => {
    it('persists objective lock to _active.json', async () => {
      const goal: Goal = {
        id: '2026-06-10-todo-api',
        status: 'active',
        title: 'Build Todo REST API',
        objective: 'A REST API with CRUD endpoints for a Todo resource',
        successCriteria: ['POST /todos returns 201', 'GET /todos returns array'],
        outOfScope: ['Authentication', 'WebSocket'],
        context: 'User said: Buat Todo API',
        created: '2026-06-10T00:00:00Z',
        lastUpdated: '2026-06-10T00:00:00Z',
        linkedPlan: null,
        linkedTodos: [],
        scopeAlarms: [],
        updates: []
      };

      await createGoal(tempDir, goal);

      const active = await fs.readJson(path.join(tempDir, '.nourivex', 'goals', '_active.json'));
      expect(active.activeGoal).not.toBeNull();
      expect(active.activeGoal.id).toBe('2026-06-10-todo-api');
      expect(active.activeGoal.objective).toBe(goal.objective);
      expect(active.activeGoal.successCriteria).toHaveLength(2);
      expect(active.activeGoal.outOfScope).toContain('Authentication');
    });
  });

  describe('Session Resume (Step 0)', () => {
    it('detects active goal on session start', async () => {
      const goal: Goal = {
        id: '2026-06-10-resume-test',
        status: 'active',
        title: 'Resume Test Goal',
        objective: 'Test session resume',
        successCriteria: [],
        outOfScope: [],
        context: '',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        linkedPlan: null,
        linkedTodos: [],
        scopeAlarms: [],
        updates: []
      };

      await createGoal(tempDir, goal);

      const active = await fs.readJson(path.join(tempDir, '.nourivex', 'goals', '_active.json'));
      expect(active.activeGoal).not.toBeNull();
      expect(active.activeGoal.status).toBe('active');
    });

    it('returns null activeGoal when no session exists', async () => {
      const active = await fs.readJson(path.join(tempDir, '.nourivex', 'goals', '_active.json'));
      expect(active.activeGoal).toBeNull();
    });
  });

  describe('Scope Alarm Logging', () => {
    it('logs scope alarm to active goal', async () => {
      const goal: Goal = {
        id: '2026-06-10-alarm-test',
        status: 'active',
        title: 'Alarm Test Goal',
        objective: 'REST API only',
        successCriteria: [],
        outOfScope: ['WebSocket'],
        context: '',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        linkedPlan: null,
        linkedTodos: [],
        scopeAlarms: [],
        updates: []
      };

      await createGoal(tempDir, goal);

      await logScopeAlarm(tempDir, {
        timestamp: new Date().toISOString(),
        driftType: 'Feature Creep',
        description: 'Was about to add WebSocket support',
        resolution: 'skipped',
        notes: 'User confirmed REST only'
      });

      const active = await fs.readJson(path.join(tempDir, '.nourivex', 'goals', '_active.json'));
      expect(active.activeGoal.scopeAlarms).toHaveLength(1);
      expect(active.activeGoal.scopeAlarms[0].driftType).toBe('Feature Creep');
      expect(active.activeGoal.scopeAlarms[0].resolution).toBe('skipped');
    });

    it('accumulates multiple scope alarms', async () => {
      const goal: Goal = {
        id: '2026-06-10-multi-alarm',
        status: 'active',
        title: 'Multi Alarm Test',
        objective: 'Simple REST API',
        successCriteria: [],
        outOfScope: [],
        context: '',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        linkedPlan: null,
        linkedTodos: [],
        scopeAlarms: [],
        updates: []
      };

      await createGoal(tempDir, goal);

      for (let i = 0; i < 3; i++) {
        await logScopeAlarm(tempDir, {
          timestamp: new Date().toISOString(),
          driftType: 'Feature Creep',
          description: `Drift instance ${i + 1}`,
          resolution: 'skipped'
        });
      }

      const active = await fs.readJson(path.join(tempDir, '.nourivex', 'goals', '_active.json'));
      expect(active.activeGoal.scopeAlarms).toHaveLength(3);
    });
  });

  describe('Goal Completion Lifecycle', () => {
    it('clears active goal after completion', async () => {
      const goal: Goal = {
        id: '2026-06-10-complete-test',
        status: 'active',
        title: 'Complete Test',
        objective: 'Test completion',
        successCriteria: [],
        outOfScope: [],
        context: '',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        linkedPlan: null,
        linkedTodos: [],
        scopeAlarms: [],
        updates: []
      };

      await createGoal(tempDir, goal);
      await completeGoal(tempDir, goal.id);

      const active = await fs.readJson(path.join(tempDir, '.nourivex', 'goals', '_active.json'));
      expect(active.activeGoal).toBeNull();
    });

    it('adds completed goal to history', async () => {
      const goal: Goal = {
        id: '2026-06-10-history-test',
        status: 'active',
        title: 'History Test',
        objective: 'Test history',
        successCriteria: [],
        outOfScope: [],
        context: '',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        linkedPlan: null,
        linkedTodos: [],
        scopeAlarms: [],
        updates: []
      };

      await createGoal(tempDir, goal);
      await completeGoal(tempDir, goal.id);

      const history = await fs.readJson(path.join(tempDir, '.nourivex', 'goals', '_history.json'));
      expect(history.goals).toHaveLength(1);
      expect(history.goals[0].id).toBe(goal.id);
      expect(history.goals[0].status).toBe('completed');
      expect(history.goals[0].completedAt).toBeDefined();
    });

    it('creates archive file for completed goal', async () => {
      const goal: Goal = {
        id: '2026-06-10-archive-test',
        status: 'active',
        title: 'Archive Test',
        objective: 'Test archiving',
        successCriteria: [],
        outOfScope: [],
        context: '',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        linkedPlan: null,
        linkedTodos: [],
        scopeAlarms: [],
        updates: []
      };

      await createGoal(tempDir, goal);
      await completeGoal(tempDir, goal.id);

      const archivePath = path.join(tempDir, '.nourivex', 'goals', 'archive', `${goal.id}.json`);
      expect(await fs.pathExists(archivePath)).toBe(true);

      const archived = await fs.readJson(archivePath);
      expect(archived.status).toBe('completed');
      expect(archived.completedAt).toBeDefined();
    });
  });
});
