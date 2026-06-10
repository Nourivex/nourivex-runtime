# Nourivex Behavioral Contract: Gemini CLI Adapter (v4.0.0)

You have the **Nourivex Runtime** extension active. This provides strict engineering disciplines, specialized partner agents, and a **persistent memory system** that remembers your goals and progress across sessions.

## 🚀 Session Start: ALWAYS Run This First

Before ANY task, restore session context:

```
activate_skill("nvx-session-manager")
```

This reads your active goals, todo progress, and relevant memory from `.nourivex/`. Never start blind.

---

## 🛡️ Mandatory Activation: nvx-watchdog

Before starting any implementation, activate:
```
activate_skill("nvx-watchdog")
```

It patrols for:
- **Scope Drift:** Detecting changes outside the approved plan
- **Fake Completion:** Rejecting claims of success without evidence from `run_shell_command`
- **Session Patrol:** Reads `.nourivex/goals/_active.json` to know what's in scope

---

## ⚖️ The Nourivex Standard Workflow

For every engineering task (Feature, Bug Fix, Refactor), you MUST follow this sequence:

1. **Session Start:** `activate_skill("nvx-session-manager")` → restore context
2. **Goal Lock:** `activate_skill("nvx-goal-preservation")` → check/create active goal in `.nourivex/goals/`
3. **Memory Recall:** `activate_skill("nvx-superpower-memory")` → RECALL relevant patterns
4. **Research Phase:** Propose technical approaches. Use `nvx-researcher` for deep dives.
5. **Architecture Phase:** Define the blueprint. Use `nvx-architect` for design.
6. **Planning Phase:** Create the TDD roadmap. Use `nvx-planner` → auto-persists as todo list in `.nourivex/todos/`
7. **Execution Phase:** Implement via TDD. Use `nvx-implementer` + track todo progress
8. **Review Phase:** Use `nvx-reviewer` → runs 7 passes including memory capture

---

## 🛠️ Mandatory Skills

Activate via `activate_skill` when trigger conditions are met:

| Skill | When |
|-------|------|
| `nvx-session-manager` | **FIRST** — every session start |
| `nvx-goal-preservation` | Start of every task — persists to `.nourivex/goals/` |
| `nvx-watchdog` | Throughout implementation — logs alerts to goal file |
| `nvx-tdd-enforcer` | Every implementation step |
| `nvx-superpower-memory` | RECALL before planning, STORE after GREEN state |
| `nvx-verification` | Before any completion claim |
| `nvx-reviewer` | After implementation — 7-pass review including memory capture |
| `nvx-agent-synchronizer` | Every agent handoff — use Context Pack v2 with PERSISTENT_REFS |
| `nvx-planner` | Multi-step tasks — auto-creates `.nourivex/todos/` list |
| `nvx-idempotency-guard` | Before destructive CLI commands |
| `nvx-context-pruning` | After task verified GREEN |
| `nvx-dependency-lockdown` | Before adding/changing external dependencies |
| `nvx-reasoning-trace` | Before critical architecture or bug-fix decisions |

---

## 🧠 Persistent Storage (`.nourivex/`)

The runtime maintains persistent state across sessions:

```
.nourivex/
├── goals/           # Active & completed goals (never forget the objective)
├── todos/           # Todo lists with progress tracking
├── memory/          # Knowledge vault, user DNA, domain rules
└── sessions/        # Session summaries
```

**If `.nourivex/` doesn't exist:** `nvx-session-manager` creates it automatically on first run.

---

## 👥 Partner Agents

Manage context flow between specialized agents using `invoke_agent`. Always provide a **Context Pack v2** with `PERSISTENT_REFS` when handing off tasks.

```
CONTEXT PACK v2 format:
CURRENT_STATUS: [factual, specific]
APPROVED_BLUEPRINT: [file path]
PENDING_CHALLENGES: [actual blockers]
NEXT_GOAL: [one sentence]
PERSISTENT_REFS:
  Active Goal: .nourivex/goals/_active.json → ID: {id}
  Active Todos: .nourivex/todos/lists/{id}.json → task-{N}
  Relevant Memory: {pattern/lesson IDs}
```

---

*Engineering is a discipline of evidence. No code without a plan. No plan without verification. No session without memory.*
