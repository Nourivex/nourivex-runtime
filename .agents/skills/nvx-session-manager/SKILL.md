---
name: nvx-session-manager
description: Use at the START of every session to restore context from persistent storage — reads active goals, todos, and relevant memory so agents never start blind. Also runs END-OF-SESSION protocol to save progress before context is lost.
---

# Session Manager

## Overview

Every session starts the same tragic way: the agent has no memory of what was discussed, what goals were set, what tasks are in progress. Session Manager eliminates that. It is the **first skill to load** and the **last protocol to run** in every session.

**Core principle:** Context is not rebuilt from scratch every session. It is restored from persistent state.

**This skill is the glue that connects Memory, Goals, and Todos into a unified session experience.**

---

## The Iron Law

```
NO SESSION STARTS WITHOUT READING PERSISTENT STATE.
NO SESSION ENDS WITHOUT SAVING PROGRESS.
```

---

## SESSION START Protocol

Run this at the very beginning of every agent session, before any task work begins.

### Step 1: Load Persistent State

Read all three persistent stores in parallel:

```
[SESSION MANAGER] 🔄 Restoring session context...
Reading .nourivex/goals/_active.json...
Reading .nourivex/todos/_active.json...
Reading .nourivex/memory/_index.json...
```

Handle missing files gracefully:
- File not found → treat as empty/null (fresh start for that component)
- Invalid JSON → warn user, treat as empty

### Step 2: Assemble Session Brief

Present a structured brief to the user:

```
╔══════════════════════════════════════════╗
║          📋 SESSION BRIEF                ║
╠══════════════════════════════════════════╣
║                                          ║
║  🎯 ACTIVE GOAL                          ║
║  ─────────────────────────────────────  ║
║  {title}                                 ║
║  Created: {created}                      ║
║  Status: {status}                        ║
║  Scope alarms: {N} on record             ║
║                                          ║
║  📝 ACTIVE TODO LIST                     ║
║  ─────────────────────────────────────  ║
║  {todoTitle}                             ║
║  Progress: {completed}/{total} ({pct}%) ║
║  Next task: {nextPendingTask}            ║
║                                          ║
║  🧠 RELEVANT MEMORY                      ║
║  ─────────────────────────────────────  ║
║  {N} patterns/lessons in knowledge vault ║
║  User DNA: loaded ({N} preferences)      ║
║  Domain rules: {N} active rules          ║
║                                          ║
╚══════════════════════════════════════════╝

Continue from where we left off? [yes/resume | no/start fresh]
```

### Step 3A: Resume Existing Work

If user says YES to resume:

```
[SESSION RESUMED] ✅
Goal: {title} — LOCKED
Todo: resuming from task-{N} "{nextTask}"
Memory: {N} relevant entries loaded
Watchdog: ACTIVE — patrolling against "{objective}"

Ready to continue. What would you like to do?
```

Activate:
- `nvx-goal-preservation` Step 0 → confirm active goal
- `nvx-watchdog` Session Start Patrol
- `nvx-planner` Step 0 → show todo resume state
- `nvx-superpower-memory` RECALL on current context

### Step 3B: Start Fresh

If user says NO (start fresh):

```
[FRESH START] 🆕
Archiving previous state...
  Goal "{title}" → status: paused (not abandoned)
  Todo list → preserved, marked as paused

Ready for new task. Please describe what you'd like to build.
```

Then proceed with normal `nvx-goal-preservation` Step 1 (new objective lock).

### Step 3C: Cold Start (No Persistent State)

If `.nourivex/` doesn't exist or all files are empty:

```
[COLD START] 🌱
No previous session state found.
Initializing .nourivex/ structure...

Created: .nourivex/goals/_active.json
Created: .nourivex/goals/_history.json
Created: .nourivex/todos/_active.json
Created: .nourivex/todos/_completed.json
Created: .nourivex/memory/_index.json
Created: .nourivex/memory/user-dna/profile.json
Created: .nourivex/memory/knowledge-vault/patterns/ (empty)
Created: .nourivex/memory/knowledge-vault/lessons/ (empty)
Created: .nourivex/memory/project-map/ (empty)

[SESSION READY] ✅ Fresh session initialized.
Please describe your task to get started.
```

---

## SESSION END Protocol

Run this when any of these occur:
- User explicitly ends the session
- Agent is about to lose context (long session, approaching token limit)
- Task reaches a natural stopping point

### Step 1: Snapshot Current State

```
[SESSION END] 💾 Saving session progress...
```

1. **Update todo progress** — ensure all in-progress items are accurately reflected
2. **Update goal `lastUpdated`** in `_active.json`
3. **Evaluate memory** — run STORE Decision Gate from `nvx-superpower-memory`
4. **Write session summary** to `.nourivex/sessions/latest.json`

### Step 2: Write Session Summary

**File: `.nourivex/sessions/latest.json`**

```json
{
  "version": "1.0.0",
  "sessionEnd": "2026-06-10T03:45:00Z",
  "duration": "2h 15m",
  "goal": {
    "id": "2026-06-10-todo-api",
    "title": "Build Todo REST API",
    "status": "active"
  },
  "todoProgress": {
    "id": "2026-06-10-todo-api-implementation",
    "completed": 4,
    "total": 8,
    "percentage": 50,
    "lastCompletedTask": "task-004: Implement GET /todos"
  },
  "memoryStored": [
    {
      "type": "pattern",
      "title": "Express route handler with async error boundary",
      "stored": true
    }
  ],
  "scopeAlerts": 1,
  "nextSteps": "Continue with task-005: Write failing test for PUT /todos"
}
```

### Step 3: Confirm Saved

```
[SESSION SAVED] ✅
Progress: 4/8 tasks (50%)
Memory stored: 1 new pattern
Session summary: .nourivex/sessions/latest.json

Next session: continue from task-005
"Write failing test for PUT /todos"

See you next time! 👋
```

---

## Storage Structure

```
.nourivex/
├── goals/
│   ├── _active.json        # Current active goal
│   ├── _history.json       # Completed/abandoned goals
│   └── archive/            # Full detail of past goals
├── todos/
│   ├── _active.json        # Pointer to active todo list
│   ├── _completed.json     # Index of completed todo lists
│   └── lists/              # Individual todo list files
│       └── {id}.json
├── memory/
│   ├── _index.json         # Master memory registry
│   ├── knowledge-vault/
│   │   ├── patterns/       # Reusable implementation patterns
│   │   └── lessons/        # Bug post-mortems
│   ├── user-dna/
│   │   └── profile.json    # User preferences
│   └── project-map/
│       ├── architecture.json
│       └── domain-rules.json
└── sessions/
    └── latest.json         # Most recent session summary
```

---

## Platform-Specific Instructions

### Gemini CLI
Load via `activate_skill`:
```
activate_skill("nvx-session-manager")
```
Run Session Start Protocol before any other skill.

### OpenCode
Load via `skill()`:
```typescript
skill(name="nvx-session-manager")
```
Or delegate:
```typescript
task(category="quick", load_skills=["nvx-session-manager"], run_in_background=false, prompt="Start session — restore context")
```

### Claude / Codex
Load the Session Manager instructions and run Session Start Protocol as the first action.

---

## Skill Load Order (Mandatory)

1. `nvx-session-manager` ← **ALWAYS FIRST**
2. `nvx-goal-preservation` (restore or create goal)
3. `nvx-watchdog` (start patrol)
4. `nvx-superpower-memory` (RECALL)
5. `nvx-planner` (check active todos)
6. [task-specific skills]

---

## Red Flags

- Starting implementation without running Session Start Protocol
- Ending a session without saving progress
- Creating a new goal without checking if one already exists
- Answering "what should I work on?" without reading `_active.json`
- Claiming "no context" when `.nourivex/` has persistent state

---

## The Bottom Line

An agent that reads memory is smarter than one who doesn't. An agent that reads session state is smarter than one who reinvents context every time. Session Manager is the difference between an assistant who forgets and one who remembers.

Load it first. Always.
