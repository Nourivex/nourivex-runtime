# Nourivex Team Handbook: Codex Adapter (v4.0.0)

## Project Mission
We enforce the **Nourivex Engineering Standard**. Discipline is our primary competitive advantage. Memory is our compound interest.

## 🚀 Session Start (Mandatory)
Every session MUST begin with context restoration. Read these files before any work:
- `.nourivex/goals/_active.json` — is there an active goal?
- `.nourivex/todos/_active.json` — is there unfinished work?
- `.nourivex/memory/_index.json` — what patterns are known?

Present a SESSION BRIEF. Never start blind.

## 🛡️ Mandatory Patrol: nvx-watchdog
Every session MUST be patrolled by `nvx-watchdog`.
- **Scope Patrol:** Detect and stop unauthorized file modifications
- **Session Start:** Read `_active.json` to establish patrol boundary
- **Alert Logging:** Every alert is persisted to goal file

## ⚖️ The Nourivex Standard Workflow (v4.0.0)
1. **Session Restore:** Read `.nourivex/` persistent state
2. **Goal Lock:** Check/create in `.nourivex/goals/_active.json`
3. **Memory Recall:** Query `.nourivex/memory/_index.json`
4. **Research Phase:** Analyze patterns and propose 2-3 approaches
5. **Architecture Phase:** Document the component blueprint
6. **Planning Phase:** Create roadmap + persist as todo list in `.nourivex/todos/`
7. **Execution Phase:** Red-Green-Refactor with strict TDD + update todo progress
8. **Review Phase:** 7-pass review including memory capture

## 🛠️ Core Disciplines
Apply these skills for every task:

| Skill | When |
|-------|------|
| `nvx-session-manager` | **ALWAYS FIRST** — every session |
| `nvx-goal-preservation` | Task start — persists to `.nourivex/goals/` |
| `nvx-watchdog` | Throughout implementation |
| `nvx-superpower-memory` | RECALL before plan, STORE after GREEN |
| `nvx-tdd-enforcer` | Test first, implementations minimal |
| `nvx-anti-overengineering` | Keep it simple. Earned abstractions only |
| `nvx-verification` | Evidence before claims |
| `nvx-reviewer` | 7 passes including memory capture |

## 🧠 Persistent Storage
```
.nourivex/goals/      # Goals survive session restarts
.nourivex/todos/      # Todo progress is tracked
.nourivex/memory/     # Patterns and lessons persist
.nourivex/sessions/   # Session summaries
```

---
*Maintain the Standard. Discipline is Portability. Memory is Continuity.*
