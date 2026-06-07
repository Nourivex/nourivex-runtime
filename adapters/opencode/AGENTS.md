# Nourivex Team Handbook: OpenCode Adapter (v3.2.0)

## Project Mission
We build with **Absolute Discipline**. Every agent in this project is a Partner in the **Nourivex Engineering Standard**.

This handbook maps the Nourivex Runtime to **OpenCode-specific commands**.  
If you are using Gemini CLI, refer to `adapters/gemini/GEMINI.md` instead.

---

## 🚀 Quick Start

### 1. Load the Nourivex Runtime Skill
```typescript
skill(name="nourivex-runtime")
```
This loads the full engineering discipline framework.

### 2. Load Patrol Skills
```typescript
skill(name="nvx-watchdog")         // Scope drift patrol (ALWAYS ON)
skill(name="nvx-goal-preservation") // Lock objective at task start
```

### 3. Choose Your Workflow
- **Simple task** (< 5 min, single file): `skill(name="nvx-goal-preservation")` then implement
- **Complex task** (multi-file, new feature): Follow the 5-phase workflow below

---

## 🏛️ The Nourivex Workflow for OpenCode

### Phase 1: Research
**Load:** `skill(name="nvx-researcher")`  
**Delegate:** 
```typescript
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Research [topic] in the codebase...")
```
Or use built-in explorer:
```typescript
task(subagent_type="explore", run_in_background=true, prompt="Find all files related to X")
```

### Phase 2: Architecture
**Load:** `skill(name="nvx-architect")`  
**Delegate:**
```typescript
task(category="deep", load_skills=["nvx-architect"], run_in_background=false, prompt="Design the architecture for [feature]...")
```

### Phase 3: Planning
**Load:** `skill(name="nvx-planner")` + `skill(name="nvx-goal-preservation")`  
**Delegate:**
```typescript
task(category="deep", load_skills=["nvx-planner", "nvx-goal-preservation"], run_in_background=false, prompt="Create implementation plan for [feature]...")
```

### Phase 4: Execution (TDD)
**Load:** `skill(name="nvx-implementer")` + `skill(name="nvx-tdd-enforcer")` + `skill(name="nvx-watchdog")`  
**Delegate:**
```typescript
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer", "nvx-watchdog"], run_in_background=false, prompt="Implement [task] following TDD...")
```

### Phase 5: Review
**Load:** `skill(name="nvx-reviewer")`  
**Delegate:**
```typescript
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Review this implementation...")
```

---

## 🛡️ Skill Reference (16 Skills)

All skills are registered in `.agents/skills/` and auto-discovered by OpenCode.

### Core Discipline Skills
| Skill | Command | When |
|-------|---------|------|
| `nvx-goal-preservation` | `skill(name="nvx-goal-preservation")` | Start of every task |
| `nvx-watchdog` | `skill(name="nvx-watchdog")` | Throughout implementation |
| `nvx-tdd-enforcer` | `skill(name="nvx-tdd-enforcer")` | Every implementation step |
| `nvx-anti-overengineering` | `skill(name="nvx-anti-overengineering")` | During design/review |
| `nvx-architectural-consistency` | `skill(name="nvx-architectural-consistency")` | Adding new files/modules |
| `nvx-verification` | `skill(name="nvx-verification")` | Before completion claims |
| `nvx-reviewer` | `skill(name="nvx-reviewer")` | After implementation |

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
| `nvx-agent-synchronizer` | `skill(name="nvx-agent-synchronizer")` | Handoff between agents |
| `nvx-reasoning-trace` | `skill(name="nvx-reasoning-trace")` | Before critical decisions |
| `nvx-superpower-memory` | `skill(name="nvx-superpower-memory")` | Store/recall patterns |

### Specialized Skills
| Skill | Command | When |
|-------|---------|------|
| `nvx-systematic-debugging` | `skill(name="nvx-systematic-debugging")` | Encountering bugs |
| `nvx-planner` | `skill(name="nvx-planner")` | Multi-step tasks |

---

## 🤖 Agent Reference (5 Specialized Agents)

For advanced users: Register these as custom subagents in `opencode.json` (see `opencode.agents.json`).

### 1. nvx-researcher
**Role:** Senior technical researcher & codebase archeologist  
**OpenCode delegation:**
```typescript
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Explore the authentication system...")
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
task(category="deep", load_skills=["nvx-planner", "nvx-goal-preservation"], run_in_background=false, prompt="Create implementation plan...")
```

### 4. nvx-implementer
**Role:** Senior product engineer & TDD specialist  
**OpenCode delegation:**
```typescript
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer", "nvx-watchdog"], run_in_background=false, prompt="Implement the feature...")
```

### 5. nvx-reviewer
**Role:** Meticulous senior reviewer & QA lead  
**OpenCode delegation:**
```typescript
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Review this code for edge cases...")
```

---

## 🔄 Gemini → OpenCode Command Mapping

| Gemini CLI | OpenCode Equivalent |
|------------|-------------------|
| `activate_skill("nvx-watchdog")` | `skill(name="nvx-watchdog")` |
| `invoke_agent("nvx-researcher")` | `task(subagent_type="build", load_skills=["nvx-researcher"], ...)` |
| `run_shell_command("...")` | `bash("...")` |
| `read_file("...")` | `read({filePath: "..."})` |
| `Context Pack handoff` | `task(task_id="ses_...", prompt="Context: ...")` |

---

## 📋 Context Pack Protocol (Agent Handoff)

When switching between specialized agents, always pass a Context Pack:

```typescript
CURRENT_STATUS: What has been verified so far
PENDING_CHALLENGES: Known risks, blockers, or unresolved issues
NEXT_GOAL: The specific deliverable for the next agent
```

In OpenCode, handoff via:
```typescript
task(task_id="ses_previous_session", load_skills=[], prompt="Continue from: CURRENT_STATUS: ..., PENDING_CHALLENGES: ..., NEXT_GOAL: ...")
```

---

## 🎯 Example: Full Workflow

```typescript
// 1. Research - explore existing auth system
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Research the current authentication system...")

// 2. After research: Architecture
task(category="deep", load_skills=["nvx-architect"], run_in_background=false, prompt="Design OAuth2 integration based on research findings...")

// 3. After architecture: Plan
task(category="deep", load_skills=["nvx-planner", "nvx-goal-preservation"], run_in_background=false, prompt="Create TDD implementation plan for OAuth2...")

// 4. Implement each task
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer"], run_in_background=false, prompt="Implement OAuth2 login endpoint...")

// 5. Review
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Review the OAuth2 implementation...")
```

---

## 📁 File Structure

```
.agents/skills/                      # OpenCode-discovered skills
├── nourivex-runtime/               # Main entry skill
├── nvx-watchdog/                   # 16 discipline skills
├── nvx-goal-preservation/
└── ...                             

nourivex-runtime/
├── .opencode/
│   ├── agents/                     # Agent instruction files
│   ├── README.md                   # OpenCode integration guide
│   └── plugin.mjs                  # OpenCode plugin entry
├── adapters/opencode/AGENTS.md     # This file
├── opencode.agents.json            # Agent config for opencode.json
└── opencode-plugin.mjs             # Plugin module
```

---

*No code without a plan. No plan without verification. No verification without evidence.*
