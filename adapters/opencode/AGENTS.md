# Nourivex Team Handbook: OpenCode Adapter (v4.0.0)

## Project Mission
We build with **Absolute Discipline**. Every agent in this project is a Partner in the **Nourivex Engineering Standard**. Memory is not optional — it is the compound interest of every session.

This handbook maps the Nourivex Runtime to **OpenCode-specific commands**.  
If you are using Gemini CLI, refer to `adapters/gemini/GEMINI.md` instead.

---

## 🚀 Quick Start (v4.0.0)

### 1. Session Start — ALWAYS First
```typescript
skill(name="nvx-session-manager")
```
This restores your active goals, todos, and memory. Never start without it.

### 2. Load Core Discipline Skills
```typescript
skill(name="nvx-watchdog")          // Scope drift patrol (ALWAYS ON)
skill(name="nvx-goal-preservation") // Lock objective + persist to .nourivex/goals/
skill(name="nvx-superpower-memory") // RECALL relevant patterns
```

### 3. Choose Your Workflow
- **Simple task** (< 5 min, single file): `skill(name="nvx-goal-preservation")` then implement
- **Complex task** (multi-file, new feature): Follow the 8-phase workflow below

---

## 🏛️ The Nourivex Workflow for OpenCode (v4.0.0)

### Phase 0: Session Restore
```typescript
skill(name="nvx-session-manager")
// Reads .nourivex/ persistent state — goals, todos, memory
// Presents SESSION BRIEF and asks: resume or start fresh?
```

### Phase 1: Goal Lock
```typescript
skill(name="nvx-goal-preservation")
// Checks _active.json, creates/resumes goal, persists objective lock
```

### Phase 2: Memory Recall
```typescript
skill(name="nvx-superpower-memory")
// RECALL: query .nourivex/memory/_index.json for relevant patterns
```

### Phase 3: Research
**Load:** `skill(name="nvx-researcher")`  
**Delegate:** 
```typescript
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Research [topic] informed by recalled memory patterns...")
```

### Phase 4: Architecture
**Load:** `skill(name="nvx-architect")`  
**Delegate:**
```typescript
task(category="deep", load_skills=["nvx-architect"], run_in_background=false, prompt="Design the architecture for [feature]...")
```

### Phase 5: Planning
**Load:** `skill(name="nvx-planner")` + `skill(name="nvx-goal-preservation")`  
**Delegate:**
```typescript
task(category="deep", load_skills=["nvx-planner", "nvx-goal-preservation"], run_in_background=false, prompt="Create implementation plan — it will auto-persist as a todo list in .nourivex/todos/")
```

### Phase 6: Execution (TDD)
**Load:** `skill(name="nvx-implementer")` + `skill(name="nvx-tdd-enforcer")` + `skill(name="nvx-watchdog")`  
**Delegate:**
```typescript
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer", "nvx-watchdog"], run_in_background=false, prompt="Implement [task] following TDD — update todo progress after each task")
```

### Phase 7: Review + Memory Capture
**Load:** `skill(name="nvx-reviewer")`  
**Delegate:**
```typescript
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Run 7-pass review including memory capture for reusable patterns")
```

### Phase 8: Session End
```typescript
skill(name="nvx-session-manager")
// Save progress, write session summary, confirm what's remembered
```

---

## 🛡️ Skill Reference (17 Skills)

All skills are registered in `.agents/skills/` and auto-discovered by OpenCode.

### Core Discipline Skills
| Skill | Command | When |
|-------|---------|------|
| `nvx-session-manager` | `skill(name="nvx-session-manager")` | **FIRST** — every session |
| `nvx-goal-preservation` | `skill(name="nvx-goal-preservation")` | Every task start |
| `nvx-watchdog` | `skill(name="nvx-watchdog")` | Throughout implementation |
| `nvx-tdd-enforcer` | `skill(name="nvx-tdd-enforcer")` | Every implementation step |
| `nvx-anti-overengineering` | `skill(name="nvx-anti-overengineering")` | During design/review |
| `nvx-architectural-consistency` | `skill(name="nvx-architectural-consistency")` | Adding new files/modules |
| `nvx-verification` | `skill(name="nvx-verification")` | Before completion claims |
| `nvx-reviewer` | `skill(name="nvx-reviewer")` | After implementation (7 passes) |

### Memory & Persistence Skills ✨ NEW in v4.0.0
| Skill | Command | When |
|-------|---------|------|
| `nvx-superpower-memory` | `skill(name="nvx-superpower-memory")` | RECALL before planning, STORE after GREEN |

### Safety Skills
| Skill | Command | When |
|-------|---------|------|
| `nvx-idempotency-guard` | `skill(name="nvx-idempotency-guard")` | Before destructive commands |
| `nvx-dependency-lockdown` | `skill(name="nvx-dependency-lockdown")` | Before adding dependencies |
| `nvx-context-pruning` | `skill(name="nvx-context-pruning")` | After task verified GREEN |
| `nvx-token-efficiency` | `skill(name="nvx-token-efficiency")` | Long workflows |

### Collaboration Skills
| Skill | Command | When |
|-------|---------|------|
| `nvx-agent-synchronizer` | `skill(name="nvx-agent-synchronizer")` | Handoff between agents — use Context Pack v2 |
| `nvx-reasoning-trace` | `skill(name="nvx-reasoning-trace")` | Before critical decisions |

### Specialized Skills
| Skill | Command | When |
|-------|---------|------|
| `nvx-systematic-debugging` | `skill(name="nvx-systematic-debugging")` | Encountering bugs |
| `nvx-planner` | `skill(name="nvx-planner")` | Multi-step tasks — auto-persists todo list |

---

## 🤖 Agent Reference (5 Specialized Agents)

For advanced users: Register these as custom subagents in `opencode.json` (see `opencode.agents.json`).

### 1. nvx-researcher
**Role:** Senior technical researcher & codebase archeologist  
**OpenCode delegation:**
```typescript
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Research [topic]...")
```

### 2. nvx-architect
**Role:** Principal software architect  
**OpenCode delegation:**
```typescript
task(category="deep", load_skills=["nvx-architect"], run_in_background=false, prompt="Design the component architecture...")
```

### 3. nvx-planner
**Role:** Senior technical planner  
**OpenCode delegation:**
```typescript
task(category="deep", load_skills=["nvx-planner", "nvx-goal-preservation"], run_in_background=false, prompt="Create implementation plan (will persist as .nourivex/todos/)...")
```

### 4. nvx-implementer
**Role:** Senior product engineer & TDD specialist  
**OpenCode delegation:**
```typescript
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer", "nvx-watchdog"], run_in_background=false, prompt="Implement [task], update todo progress after each step...")
```

### 5. nvx-reviewer
**Role:** Meticulous senior reviewer & QA lead  
**OpenCode delegation:**
```typescript
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Run 7-pass review including Pass 7 memory capture...")
```

---

## 🔄 Gemini → OpenCode Command Mapping

| Gemini CLI | OpenCode Equivalent |
|------------|-------------------|
| `activate_skill("nvx-session-manager")` | `skill(name="nvx-session-manager")` |
| `activate_skill("nvx-watchdog")` | `skill(name="nvx-watchdog")` |
| `invoke_agent("nvx-researcher")` | `task(subagent_type="build", load_skills=["nvx-researcher"], ...)` |
| `run_shell_command("...")` | `bash("...")` |
| `read_file("...")` | `read({filePath: "..."})` |
| `Context Pack v2 handoff` | `task(task_id="ses_...", prompt="CONTEXT PACK v2: ...")` |

---

## 📋 Context Pack v2 Protocol (Agent Handoff)

When switching between specialized agents, always pass a Context Pack v2:

```typescript
CURRENT_STATUS: What has been verified so far (factual)
APPROVED_BLUEPRINT: Path to architecture/plan file
PENDING_CHALLENGES: Known risks, blockers, or unresolved issues
NEXT_GOAL: Specific deliverable for the next agent (one sentence)
PERSISTENT_REFS:
  Active Goal: .nourivex/goals/_active.json → ID: {id}
  Active Todos: .nourivex/todos/lists/{id}.json → task-{N}
  Relevant Memory: {list of relevant memory IDs}
```

In OpenCode, handoff via:
```typescript
task(
  task_id="ses_previous_session",
  load_skills=[],
  prompt=`
    CONTEXT PACK v2:
    CURRENT_STATUS: ...
    APPROVED_BLUEPRINT: docs/nourivex/plans/...
    PENDING_CHALLENGES: ...
    NEXT_GOAL: ...
    PERSISTENT_REFS:
      Active Goal: .nourivex/goals/_active.json → ID: ...
      Active Todos: .nourivex/todos/lists/...
      Relevant Memory: none / [list]
  `
)
```

---

## 🧠 Persistent Storage (`.nourivex/`)

```
.nourivex/
├── goals/
│   ├── _active.json     # Current active goal + scope alarms
│   ├── _history.json    # Completed goals
│   └── archive/         # Full goal details
├── todos/
│   ├── _active.json     # Active todo list pointer
│   ├── _completed.json  # Completed lists
│   └── lists/           # Individual todo lists with progress
│       └── {id}.json
├── memory/
│   ├── _index.json      # Master memory registry
│   ├── knowledge-vault/ # Patterns & lessons
│   ├── user-dna/        # User preferences
│   └── project-map/     # Domain rules & architecture
└── sessions/
    └── latest.json      # Most recent session summary
```

**If `.nourivex/` doesn't exist:** `nvx-session-manager` creates it automatically.

---

## 🎯 Example: Full v4.0.0 Workflow

```typescript
// Phase 0: Restore session
skill(name="nvx-session-manager")
// → SESSION BRIEF presented. User says "start fresh"

// Phase 1: Lock goal
skill(name="nvx-goal-preservation")
// → Objective locked & persisted to .nourivex/goals/_active.json

// Phase 2: Recall memory
skill(name="nvx-superpower-memory")
// → 2 relevant patterns recalled from previous sessions

// Phase 3: Research
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Research current auth system...")

// Phase 4: Architecture
task(category="deep", load_skills=["nvx-architect"], run_in_background=false, prompt="Design OAuth2 integration...")

// Phase 5: Plan (auto-creates todo list)
task(category="deep", load_skills=["nvx-planner", "nvx-goal-preservation"], run_in_background=false, prompt="Create TDD plan...")
// → .nourivex/todos/lists/2026-06-10-oauth2.json created with 12 tasks

// Phase 6: Implement (tracks todo progress)
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer", "nvx-watchdog"], run_in_background=false, prompt="Implement OAuth2 login endpoint...")
// → tasks 1-4 marked complete, progress 33%

// Phase 7: Review + capture memory
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="7-pass review...")
// → Pass 7: pattern stored to .nourivex/memory/

// Phase 8: Session end
skill(name="nvx-session-manager")
// → Progress saved, next session will resume from task-005
```

---

## 📁 File Structure

```
.agents/skills/                      # OpenCode-discovered skills (17 total)
├── nvx-session-manager/             # NEW: Session context restore/save
├── nvx-superpower-memory/           # UPGRADED: Actionable STORE/RECALL
├── nvx-goal-preservation/           # UPGRADED: Persists to .nourivex/goals/
├── nvx-planner/                     # UPGRADED: Persists todo list
├── nvx-watchdog/                    # UPGRADED: Logs alerts to goal file
├── nvx-reviewer/                    # UPGRADED: Pass 7 memory capture
├── nvx-agent-synchronizer/          # UPGRADED: Context Pack v2
└── ... (10 more unchanged skills)

.nourivex/                           # NEW: Persistent storage (auto-created)
├── goals/ todos/ memory/ sessions/
```

---

*No code without a plan. No plan without verification. No session without memory. No memory without action.*
