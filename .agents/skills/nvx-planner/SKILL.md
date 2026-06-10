---
name: nvx-planner
description: Use when receiving any multi-step task or feature request — before writing a single line of code, create a structured roadmap AND persist it as a living Todo list in .nourivex/todos/ for cross-session progress tracking.
---

# Planner

## Overview

Jumping straight to code is the fastest way to write the wrong thing correctly. Planning forces clarity: you can't write a task you can't explain. Every unclear task in the plan is an ambiguity that would have become a bug.

**Core principle:** No code without a plan. No plan without explicit verification steps. **Plans are persisted — progress survives session restarts.**

**A plan is not a document you write to feel productive. It is a contract with the codebase — and it's tracked until completion.**

---

## The Iron Law

```
NO IMPLEMENTATION WITHOUT AN APPROVED PLAN.
NO PLAN WITHOUT EXPLICIT VERIFICATION FOR EVERY TASK.
EVERY APPROVED PLAN IS PERSISTED AS A LIVE TODO LIST.
```

---

## When to Use

Use for:
- Any feature that touches more than one file
- Any bug fix that requires understanding more than the immediate line
- Any refactoring task
- Any task where the full scope is not immediately obvious

**Exceptions (and only with explicit user approval):**
- Single-line config changes
- Typo fixes
- Documentation-only edits

---

## Planning Protocol

### Step 0: Check Existing Active Todos

Before planning a new task, check if there's unfinished work:

```
[TODO CHECK] Reading .nourivex/todos/_active.json...

CASE A — Active todo list found:
  📝 TODO LIST: {title}
  📊 Progress: {completed}/{total} tasks ({percentage}%)
  🔗 Linked Goal: {goalTitle}
  
  ⚠️ Unfinished work found from a previous session.
  Options:
  A) Resume this todo list → continue implementation
  B) Start a new plan → archive current todos
  
  Which do you prefer?

CASE B — No active todos:
  → Proceed to planning
```

### Step 1: Understand Before Planning

Before opening the plan template:

```
UNDERSTANDING CHECK:
1. What is the exact deliverable? (One sentence)
2. What are the success criteria? (How do we know it's done?)
3. What is explicitly OUT of scope? (What we are NOT building)
4. What do I need to read/explore before planning? (Files, docs, APIs)
5. Is there relevant memory? (Check .nourivex/memory/_index.json via nvx-superpower-memory RECALL)
```

Explore the codebase. Read relevant files. Recall memory. Then plan.

### Step 2: Map the File Structure

Before defining tasks, decide what changes:

```
FILE MAP:
- CREATE: exact/path/to/new-file.ts  [responsibility: ...]
- MODIFY: exact/path/to/existing.ts  [lines affected: ..., what changes: ...]
- TEST:   exact/path/to/test.ts      [tests covering: ...]
- DELETE: exact/path/to/old.ts       [reason: ...]
```

This is where architecture decisions get locked in. Think carefully here.

### Step 3: Write Bite-Sized Tasks

Each task is 2-5 minutes of work. If a task takes longer, break it down.

**Task granularity:**
- "Write the failing test" → one task
- "Run the test to confirm it fails" → one task
- "Write minimal implementation to pass" → one task
- "Verify all tests pass" → one task
- "Commit" → one task

### Step 4: Persist Plan as Todo List (MANDATORY)

After the plan is approved by the user, immediately create the persistent todo list.

**File: `.nourivex/todos/_active.json`**

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-06-10T00:00:00Z",
  "activeTodoId": "2026-06-10-todo-api-implementation",
  "activeTodoPath": "lists/2026-06-10-todo-api-implementation.json"
}
```

**File: `.nourivex/todos/lists/{YYYY-MM-DD}-{slug}.json`**

```json
{
  "id": "2026-06-10-todo-api-implementation",
  "goalId": "2026-06-10-todo-api",
  "planPath": "docs/nourivex/plans/2026-06-10-todo-api.md",
  "title": "Todo API — Implementation",
  "status": "active",
  "created": "2026-06-10T00:00:00Z",
  "lastUpdated": "2026-06-10T00:00:00Z",
  "progress": {
    "total": 8,
    "completed": 0,
    "inProgress": 0,
    "percentage": 0
  },
  "items": [
    {
      "id": "task-001",
      "title": "Write failing test for POST /todos",
      "status": "pending",
      "priority": "high",
      "created": "2026-06-10T00:00:00Z",
      "verificationCommand": "npm test -- --grep 'POST /todos'",
      "children": []
    },
    {
      "id": "task-002",
      "title": "Implement POST /todos handler",
      "status": "pending",
      "priority": "high",
      "created": "2026-06-10T00:00:00Z",
      "blockedBy": "task-001",
      "children": []
    }
  ]
}
```

**Confirm persistence:**
```
[TODO LIST CREATED] ✅
ID: 2026-06-10-todo-api-implementation
Tasks: 8
File: .nourivex/todos/lists/2026-06-10-todo-api-implementation.json
Progress will be tracked automatically.
```

### Step 5: Update Progress During Implementation

As each task is worked on, update its status in the todo file:

| Before starting a task | Set `status: "in-progress"` |
| After completing a task | Set `status: "completed"`, add `completedAt` |
| If blocked | Set `status: "blocked"`, add `blockedBy` ID |

Also recalculate `progress.completed`, `progress.inProgress`, `progress.percentage`.

**Announce updates:**
```
[TODO UPDATE] ✅ task-001 → completed
Progress: 1/8 (12.5%)
Next: task-002 — Implement POST /todos handler
```

---

## Plan Document Format

Save markdown plan to: `docs/nourivex/plans/YYYY-MM-DD-<feature-name>.md`

```markdown
# [Feature Name] — Implementation Plan

**Goal:** [One sentence: what this builds]
**Objective Lock:** See nvx-goal-preservation — scope is locked to this plan.
**Architecture:** [2-3 sentences about approach]
**Stack:** [Key technologies]
**Todo List:** `.nourivex/todos/lists/{id}.json`

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| CREATE | src/... | ... |
| MODIFY | src/... | ... |
| TEST   | tests/... | ... |

---

## Tasks

### Task 1: [Name]

**Files:**
- Modify: `exact/path.ts`
- Test: `tests/exact/path.test.ts`

- [ ] **Step 1:** Write the failing test
  ```typescript
  // [actual test code here — no placeholders]
  ```

- [ ] **Step 2:** Run test — MUST FAIL
  ```bash
  [exact command]
  ```
  Expected: FAIL — "[expected failure message]"

- [ ] **Step 3:** Write minimal implementation
  ```typescript
  // [actual implementation code]
  ```

- [ ] **Step 4:** Run test — MUST PASS
  ```bash
  [exact command]
  ```
  Expected: PASS — [X] tests passed

- [ ] **Step 5:** Update todo status
  ```
  [TODO UPDATE] task-00X → completed
  ```

- [ ] **Step 6:** Commit
  ```bash
  git add [files]
  git commit -m "feat: [description]"
  ```

---

## Completion Criteria

- [ ] All tasks checked
- [ ] All tests passing: `[full test suite command]`
- [ ] Linter clean: `[lint command]`
- [ ] Requirements verified against original objective
- [ ] Todo list status: 100% — trigger nvx-superpower-memory STORE
```

---

## Plan Quality Rules

**NO PLACEHOLDERS.** These are plan failures:
- "TBD", "TODO", "implement later"
- "Add appropriate error handling"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the actual code)
- "Handle edge cases"
- References to types/functions not defined anywhere in the plan

**Every step must contain:**
- The actual code (not a description of what code to write)
- The exact command to run
- The expected output of that command
- The todo update command

---

## Resume Protocol (Session Restart)

When a session resumes and active todos are found:

```
[PLAN RESUME] 📋
Todo List: {title}
Progress: {completed}/{total} ({percentage}%)

Completed:
  ✅ task-001: Write failing test for POST /todos
  ✅ task-002: Implement POST /todos handler

Current:
  🔄 task-003: Write failing test for GET /todos (in-progress)

Remaining:
  ⏳ task-004 through task-008

Continue from task-003? [yes/no]
```

---

## Self-Review (After Writing the Plan)

Before presenting the plan:

```
PLAN SELF-REVIEW:
1. Spec coverage: Can I point to a task for every requirement?
   Gaps found: [list or "none"]

2. Placeholder scan: Any TBD, TODO, vague steps?
   Violations found: [list or "none"]

3. Type consistency: Do types/names in Task 3 match what Task 1 defined?
   Mismatches found: [list or "none"]

4. Scope check: Does any task go beyond the objective lock?
   Violations found: [list or "none"]

5. Todo coverage: Does every plan task map to a todo item?
   Missing mappings: [list or "none"]
```

Fix all issues before presenting.

---

## Todo Completion

When all items reach `completed`:

1. Set todo list `status: "completed"`, add `completedAt`
2. Update `_active.json`: set `activeTodoId: null`
3. Move to `_completed.json`
4. Trigger `nvx-superpower-memory` STORE protocol
5. Trigger `nvx-goal-preservation` Goal Completion protocol

```
[TODO LIST COMPLETE] 🎉
All 8 tasks completed.
Duration: 3h 45m
Triggering memory store and goal completion...
```

---

## Red Flags — Stop and Plan

- Starting to write implementation code without a saved plan
- "The plan is clear in my head" (heads are not version controlled)
- A task that is "write the feature" without sub-steps
- Verification steps that say "check if it works" without a specific command
- Plan approved but no todo file created

---

## The Bottom Line

A plan takes 10 minutes. Getting lost in implementation without a plan costs hours. A persisted plan survives session restarts and keeps you on track regardless of how many sessions it takes.

Write the plan. Persist it. Track it. Complete it.
