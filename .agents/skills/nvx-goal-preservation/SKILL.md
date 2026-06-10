---
name: nvx-goal-preservation
description: Use at the START of every task to lock the original objective AND persist it to .nourivex/goals/ for cross-session recall. Prevents scope drift and ensures agents never forget user goals between sessions.
---

# Goal Preservation

## Overview

AI agents drift. They add features you didn't ask for, solve adjacent problems, and arrive at destinations you never requested. Worse, they forget the original mission when a session restarts. Goal Preservation is the anchor that keeps every action tied to the original objective — **across sessions, across agents, across time**.

**Core principle:** Every action must serve the original objective. The objective is persisted. It cannot be lost.

**Storage Root:** `.nourivex/goals/`

---

## The Iron Law

```
NO ACTION IS TAKEN UNLESS IT DIRECTLY SERVES THE ORIGINAL OBJECTIVE.
THE OBJECTIVE IS PERSISTED. IT WILL BE REMEMBERED NEXT SESSION.
```

---

## Step 0: Check Existing Goals (Session Start)

**Before** creating a new objective lock, check if an active goal already exists:

```
[GOAL CHECK] Reading .nourivex/goals/_active.json...

CASE A — Active goal found:
  📋 ACTIVE GOAL: {title}
  📅 Created: {created}
  📊 Status: {status}
  🔗 Linked Plan: {planPath}
  
  ⚠️ An active goal exists from a previous session.
  Options:
  A) Resume this goal → continue where we left off
  B) Complete this goal → mark done, start new
  C) Abandon this goal → archive it, start new
  
  Which do you prefer?

CASE B — No active goal:
  → Proceed to Step 1: Lock the Objective
```

If `.nourivex/goals/` does not exist → skip check, proceed to Step 1, initialize storage at Step 2.

---

## Step 1: Lock the Objective

At the start of EVERY new task, extract and state the objective explicitly.

**Format:**
```
OBJECTIVE LOCK:
- What: [Exact deliverable in one sentence]
- Success criteria: [How we know it's done — measurable]
- Out of scope: [What we are NOT building]
- Linked Plan: [Will be set after nvx-planner runs]
```

**Example:**

User: "Buat Todo API"

```
OBJECTIVE LOCK:
- What: A REST API with CRUD endpoints for a Todo resource
- Success criteria: POST, GET, PUT, DELETE /todos returns correct responses with persistence
- Out of scope: Authentication, WebSocket, AI features, event sourcing, microservices
- Linked Plan: TBD — will update after planning phase
```

Post this lock at the start. Do not skip it.

---

## Step 2: Persist the Goal

After stating the Objective Lock, immediately write to persistent storage.

**File: `.nourivex/goals/_active.json`**

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-06-10T00:00:00Z",
  "activeGoal": {
    "id": "2026-06-10-todo-api",
    "status": "active",
    "title": "Build Todo REST API",
    "objective": "A REST API with CRUD endpoints for a Todo resource",
    "successCriteria": [
      "POST /todos creates a todo with 201 response",
      "GET /todos returns array of todos",
      "PUT /todos/:id updates a todo",
      "DELETE /todos/:id removes a todo"
    ],
    "outOfScope": [
      "Authentication",
      "WebSocket",
      "AI features",
      "Event sourcing"
    ],
    "context": "[Original user request verbatim]",
    "created": "2026-06-10T00:00:00Z",
    "lastUpdated": "2026-06-10T00:00:00Z",
    "linkedPlan": null,
    "linkedTodos": [],
    "scopeAlarms": [],
    "updates": []
  }
}
```

**Confirm persistence:**
```
[GOAL PERSISTED] ✅
ID: 2026-06-10-todo-api
File: .nourivex/goals/_active.json
This goal will be remembered across sessions.
```

---

## Step 3: Continuous Scope Monitoring

Before implementing ANY feature, component, or abstraction, run this check:

```
SCOPE CHECK:
- Is this required by the original objective? [yes/no]
- Did the user request this explicitly? [yes/no]
- Can the objective be achieved WITHOUT this? [yes/no]

If any answer is "no" → STOP. Flag it. Do not implement.
```

**When drift is detected, log it:**
```json
{
  "timestamp": "2026-06-10T01:00:00Z",
  "driftType": "Feature Creep",
  "description": "Was about to add WebSocket support — not in scope",
  "resolution": "skipped"
}
```
Append this to `scopeAlarms[]` in `_active.json`.

---

## Drift Patterns — Recognize and Stop

| Drift Pattern | Example | Correct Response |
|---------------|---------|-----------------|
| **Feature Creep** | Adding WebSocket to a REST API | "Not in scope. Original goal is REST only." |
| **Premature Abstraction** | Creating a plugin system when one impl suffices | "YAGNI. Build the one implementation." |
| **Gold Plating** | Adding caching when response times aren't a requirement | "No performance requirement stated. Skip." |
| **Problem Jumping** | Fixing unrelated code while working on a feature | "Out of scope. Log it, don't touch it." |
| **Requirement Hallucination** | "We'll need auth eventually so I'll add it now" | "Not requested. Not happening." |
| **Tech Novelty** | Switching to a new library because it's "better" | "The existing approach satisfies the objective." |

---

## Scope Alarm Format

When drift is detected, halt immediately and issue:

```
⚠️ SCOPE ALARM:
[Proposed action] is NOT part of the original objective.

Original objective: [restate the lock]
Proposed addition: [what was about to happen]

Options:
A) Skip it — proceed with original scope
B) Update the objective — get explicit user approval first

Which do you prefer?
```

Do NOT silently add things. Do NOT assume "the user would want this."

---

## Goal Lifecycle

### Link to Plan (after nvx-planner runs)
Update `linkedPlan` field in `_active.json` with the plan file path.

### Goal Completion
When all success criteria are met and `nvx-verification` confirms GREEN:

1. Move goal from `_active.json` to `_history.json`
2. Set `status: "completed"`, `completedAt: ISO timestamp`
3. Create detail archive at `.nourivex/goals/archive/{goal-id}.json`

```
[GOAL COMPLETED] ✅
ID: 2026-06-10-todo-api
Duration: 4 hours 23 minutes
Scope alarms: 2 (both skipped)
Archiving to: .nourivex/goals/archive/2026-06-10-todo-api.json
```

### Goal Abandonment
If user decides to cancel:

1. Prompt: "Archive with reason? [yes/no]"
2. Set `status: "abandoned"`, record reason in `updates[]`
3. Move to `_history.json`

---

## Goal History File

**File: `.nourivex/goals/_history.json`**

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-06-10T00:00:00Z",
  "goals": [
    {
      "id": "2026-06-10-todo-api",
      "title": "Build Todo REST API",
      "status": "completed",
      "created": "2026-06-10T00:00:00Z",
      "completedAt": "2026-06-10T04:23:00Z",
      "archivePath": "archive/2026-06-10-todo-api.json"
    }
  ]
}
```

---

## Objective Update Protocol

If the user genuinely wants to extend the scope:

1. **Pause current work** — do not mix old and new scope
2. **Restate the new objective** — update the lock formally
3. **Evaluate impact** — does this invalidate existing work?
4. **Get explicit approval** — "New scope locked. Proceeding." only after confirmation
5. **Update `_active.json`** — append to `updates[]` with old/new values and reason

---

## Quick Reference

| Situation | Action |
|-----------|--------|
| Starting a new session | Check `_active.json` first (Step 0) |
| Starting a new task | Post Objective Lock + Persist (Steps 1-2) |
| Before adding any component | Run Scope Check (Step 3) |
| Detecting drift | Issue Scope Alarm + log to `scopeAlarms[]` |
| User suggests new feature | Pause, update lock, get approval, update file |
| Task complete | Move to `_history.json`, trigger memory store |

---

## Initialization

If `.nourivex/goals/` does not exist, create:
```
.nourivex/goals/
├── _active.json     (empty: { "version": "1.0.0", "activeGoal": null })
├── _history.json    (empty: { "version": "1.0.0", "goals": [] })
└── archive/         (empty directory)
```

---

## Red Flags — STOP Immediately

- "While I'm here, I'll also..." → SCOPE ALARM
- "We'll probably need this later..." → SCOPE ALARM
- "This is a good opportunity to refactor..." → SCOPE ALARM
- Starting a new session without checking `_active.json`
- Completing a goal without archiving it
- Updating scope without recording the change in `updates[]`

---

## The Bottom Line

Build what was asked. Nothing more. Nothing less. And remember it next session.
