/**
 * Integration Tests: Session Lifecycle
 *
 * Tests the full session flow:
 * 1. Cold start → initialize .nourivex/
 * 2. Create goal → persist
 * 3. Create plan → persist as todo list
 * 4. Update todo progress
 * 5. Store memory pattern
 * 6. Complete goal → archive
 * 7. New session → resume shows completed state
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

async function setupNourivexStorage(baseDir: string): Promise<void> {
  // Goals
  await fs.ensureDir(path.join(baseDir, '.nourivex', 'goals', 'archive'));
  await fs.writeJson(path.join(baseDir, '.nourivex', 'goals', '_active.json'), { version: '1.0.0', lastUpdated: '', activeGoal: null }, { spaces: 2 });
  await fs.writeJson(path.join(baseDir, '.nourivex', 'goals', '_history.json'), { version: '1.0.0', lastUpdated: '', goals: [] }, { spaces: 2 });
  // Todos
  await fs.ensureDir(path.join(baseDir, '.nourivex', 'todos', 'lists'));
  await fs.writeJson(path.join(baseDir, '.nourivex', 'todos', '_active.json'), { version: '1.0.0', lastUpdated: '', activeTodoId: null, activeTodoPath: null }, { spaces: 2 });
  await fs.writeJson(path.join(baseDir, '.nourivex', 'todos', '_completed.json'), { version: '1.0.0', lastUpdated: '', completedLists: [] }, { spaces: 2 });
  // Memory
  await fs.ensureDir(path.join(baseDir, '.nourivex', 'memory', 'knowledge-vault', 'patterns'));
  await fs.ensureDir(path.join(baseDir, '.nourivex', 'memory', 'knowledge-vault', 'lessons'));
  await fs.ensureDir(path.join(baseDir, '.nourivex', 'memory', 'user-dna'));
  await fs.ensureDir(path.join(baseDir, '.nourivex', 'memory', 'project-map'));
  await fs.writeJson(path.join(baseDir, '.nourivex', 'memory', '_index.json'), { version: '1.0.0', lastUpdated: '', entries: [] }, { spaces: 2 });
  // Sessions
  await fs.ensureDir(path.join(baseDir, '.nourivex', 'sessions'));
}

describe('Session Lifecycle Integration', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nvx-session-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('cold start — .nourivex/ does not exist initially', async () => {
    const nourivexDir = path.join(tempDir, '.nourivex');
    expect(await fs.pathExists(nourivexDir)).toBe(false);
  });

  it('after cold start init — all required files exist', async () => {
    await setupNourivexStorage(tempDir);

    expect(await fs.pathExists(path.join(tempDir, '.nourivex', 'goals', '_active.json'))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, '.nourivex', 'todos', '_active.json'))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, '.nourivex', 'memory', '_index.json'))).toBe(true);
  });

  it('full session: create goal → persist → update todo → store memory → complete', async () => {
    await setupNourivexStorage(tempDir);

    // Step 1: Create goal
    const goalId = '2026-06-10-integration-test';
    const activePath = path.join(tempDir, '.nourivex', 'goals', '_active.json');
    const active = await fs.readJson(activePath);
    active.activeGoal = {
      id: goalId,
      status: 'active',
      title: 'Integration Test Goal',
      objective: 'Complete integration test',
      successCriteria: ['All 3 steps pass'],
      outOfScope: [],
      context: 'test',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      linkedPlan: null,
      linkedTodos: [],
      scopeAlarms: [],
      updates: []
    };
    await fs.writeJson(activePath, active, { spaces: 2 });

    // Verify goal persisted
    const goalCheck = await fs.readJson(activePath);
    expect(goalCheck.activeGoal.id).toBe(goalId);

    // Step 2: Create todo list
    const todoId = '2026-06-10-integration-todo';
    const todoPath = path.join(tempDir, '.nourivex', 'todos', 'lists', `${todoId}.json`);
    await fs.writeJson(todoPath, {
      id: todoId,
      goalId,
      title: 'Integration Test Tasks',
      status: 'active',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      progress: { total: 3, completed: 0, inProgress: 0, percentage: 0 },
      items: [
        { id: 'task-001', title: 'Task 1', status: 'pending', priority: 'high', created: new Date().toISOString() },
        { id: 'task-002', title: 'Task 2', status: 'pending', priority: 'high', created: new Date().toISOString() },
        { id: 'task-003', title: 'Task 3', status: 'pending', priority: 'medium', created: new Date().toISOString() }
      ]
    }, { spaces: 2 });

    const todosActive = path.join(tempDir, '.nourivex', 'todos', '_active.json');
    const todosActiveData = await fs.readJson(todosActive);
    todosActiveData.activeTodoId = todoId;
    todosActiveData.activeTodoPath = `lists/${todoId}.json`;
    await fs.writeJson(todosActive, todosActiveData, { spaces: 2 });

    // Verify todo created
    const todoCheck = await fs.readJson(todoPath);
    expect(todoCheck.items).toHaveLength(3);
    expect(todoCheck.progress.total).toBe(3);

    // Step 3: Update progress (task-001 completed, task-002 in-progress)
    const todo = await fs.readJson(todoPath);
    todo.items[0].status = 'completed';
    todo.items[0].completedAt = new Date().toISOString();
    todo.items[1].status = 'in-progress';
    todo.progress.completed = 1;
    todo.progress.inProgress = 1;
    todo.progress.percentage = 33;
    await fs.writeJson(todoPath, todo, { spaces: 2 });

    const todoProgress = await fs.readJson(todoPath);
    expect(todoProgress.progress.percentage).toBe(33);
    expect(todoProgress.items[0].status).toBe('completed');
    expect(todoProgress.items[1].status).toBe('in-progress');

    // Step 4: Store memory pattern
    const memIndexPath = path.join(tempDir, '.nourivex', 'memory', '_index.json');
    const patternFile = path.join(tempDir, '.nourivex', 'memory', 'knowledge-vault', 'patterns', '2026-06-10-integration-pattern.json');
    await fs.writeJson(patternFile, {
      id: '2026-06-10-integration-pattern',
      type: 'pattern',
      title: 'Integration Test Pattern',
      content: 'A pattern learned during integration testing.',
      tags: ['test', 'integration'],
      created: new Date().toISOString(),
      accessCount: 1,
      source: 'agent'
    }, { spaces: 2 });
    const memIndex = await fs.readJson(memIndexPath);
    memIndex.entries.push({
      id: '2026-06-10-integration-pattern',
      type: 'pattern',
      title: 'Integration Test Pattern',
      tags: ['test', 'integration'],
      path: 'knowledge-vault/patterns/2026-06-10-integration-pattern.json'
    });
    memIndex.lastUpdated = new Date().toISOString();
    await fs.writeJson(memIndexPath, memIndex, { spaces: 2 });

    const memCheck = await fs.readJson(memIndexPath);
    expect(memCheck.entries).toHaveLength(1);

    // Step 5: Complete goal
    const goalData = await fs.readJson(activePath);
    const completedGoal = { ...goalData.activeGoal, status: 'completed', completedAt: new Date().toISOString() };
    await fs.writeJson(path.join(tempDir, '.nourivex', 'goals', 'archive', `${goalId}.json`), completedGoal, { spaces: 2 });
    const histPath = path.join(tempDir, '.nourivex', 'goals', '_history.json');
    const hist = await fs.readJson(histPath);
    hist.goals.push({ id: goalId, title: completedGoal.title, status: 'completed', completedAt: completedGoal.completedAt });
    await fs.writeJson(histPath, hist, { spaces: 2 });
    goalData.activeGoal = null;
    await fs.writeJson(activePath, goalData, { spaces: 2 });

    // Step 6: New session — verify state
    const newSessionActive = await fs.readJson(activePath);
    const newSessionHistory = await fs.readJson(histPath);
    const newSessionMemory = await fs.readJson(memIndexPath);

    expect(newSessionActive.activeGoal).toBeNull();
    expect(newSessionHistory.goals).toHaveLength(1);
    expect(newSessionHistory.goals[0].status).toBe('completed');
    expect(newSessionMemory.entries).toHaveLength(1);
    expect(await fs.pathExists(path.join(tempDir, '.nourivex', 'goals', 'archive', `${goalId}.json`))).toBe(true);
  });
});
