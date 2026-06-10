# Nourivex Runtime

**Nourivex Runtime** is a provider-agnostic AI engineering framework. It enforces a strict **Research → Architecture → Planning → TDD Execution** workflow with **17 discipline skills**, **5 specialized agents**, and a **persistent memory system** so agents never forget your goals across sessions. Supports **OpenCode**, **Gemini CLI**, **Claude**, and **Codex**.

## 🚀 Key Features

- **Engineering Discipline:** 17 built-in skills for TDD, Goal Preservation, Scope Watchdog, Anti-Overengineering, and more.
- **Persistent Memory:** Agents store and recall patterns, lessons, and user preferences across sessions via `.nourivex/`.
- **Goal Tracking:** Objective locks survive session restarts — agents always remember what you're building.
- **Living Todo Lists:** Plans automatically become tracked todo lists with progress that persists across sessions.
- **Session Manager:** Every session starts with a brief of active goals, unfinished tasks, and relevant memory.
- **Collaborative Team:** 5 specialized agents (Researcher, Architect, Planner, Implementer, Reviewer) that work as partners.
- **Multi-Platform:** Works with OpenCode, Gemini CLI, Claude, and Codex via platform adapters.
- **Auto-Discovery:** OpenCode auto-discovers skills from `.agents/skills/` and agents from `.opencode/agents/`.
- **npm Installable:** Can be installed via npm and used as a plugin/MCP.
- **CLI Tools:** `nourivex memory`, `nourivex goals`, `nourivex todos` for inspecting persistent state from terminal.

---

## 🛠️ Installation

### Option A: CLI (Recommended)

```bash
# Install CLI globally
npm install -g nourivex-runtime

# Go to your project
cd /path/to/your/project

# Install for your AI assistant
nourivex init --ai opencode      # OpenCode
nourivex init --ai claude        # Claude Code
nourivex init --ai gemini        # Gemini CLI
nourivex init --ai codex         # Codex CLI
nourivex init --ai cursor        # Cursor
nourivex init --ai windsurf      # Windsurf
nourivex init --ai copilot       # GitHub Copilot
nourivex init --ai continue      # Continue
nourivex init --ai all           # All assistants
```

### Option B: npm Install (Manual)

```bash
# Install globally
npm install -g nourivex-runtime

# Or install in your project
npm install nourivex-runtime
```

Then add to your `opencode.json`:

```json
{
  "plugin": ["nourivex-runtime"]
}
```

### Option C: Local Plugin

```bash
# From the nourivex-runtime directory
opencode plugin add ./opencode-plugin.mjs
```

### Option D: Manual via opencode.json

Add to your project's `opencode.json`:

```json
{
  "plugin": ["path/to/nourivex-runtime/opencode-plugin.mjs"]
}
```

### Option E: Register Custom Subagents (Advanced)

To use agents via `task(subagent_type="nvx-researcher", ...)`, merge the contents of `opencode.agents.json` into your project's `opencode.json` under the `"agent"` field.

### Option F: Gemini CLI

```bash
gemini extensions install <path-to-nourivex-runtime> --consent
```

---

## 🎯 OpenCode Quick Start (v4.0.0)

```typescript
// 0. ALWAYS FIRST — restore session context
skill(name="nvx-session-manager")
// → SESSION BRIEF shows active goal, todo progress, relevant memory

// 1. Load discipline skills
skill(name="nvx-goal-preservation")   // Lock objective + persist to .nourivex/goals/
skill(name="nvx-watchdog")            // Patrol scope drift + log alerts
skill(name="nvx-superpower-memory")   // RECALL patterns, STORE lessons

// 2. Delegate to specialized agents
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Research...")
task(category="deep", load_skills=["nvx-architect"], run_in_background=false, prompt="Design...")
task(category="deep", load_skills=["nvx-planner"], run_in_background=false, prompt="Plan...")
// → Plan auto-persists as .nourivex/todos/ living list

task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer"], run_in_background=false, prompt="Implement...")
// → Todo progress updated automatically

task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Review...")
// → 7 passes including memory capture (Pass 7)
```

See `adapters/opencode/AGENTS.md` for the full OpenCode handbook.

---

## 🧠 CLI Commands (v4.0.0)

Inspect and manage your persistent state from the terminal:

```bash
# Memory vault
nourivex memory list              # List all stored patterns & lessons
nourivex memory --search express  # Search by keyword or tag
nourivex memory --show <id>       # Full entry detail

# Goals
nourivex goals                    # Show active goal + scope alarm history
nourivex goals --complete <id>    # Archive completed goal
nourivex goals --history          # Show all past goals

# Todos
nourivex todos                    # Show active todo list
nourivex todos --progress         # Visual progress bar
nourivex todos --show <id>        # Detailed view
```

---

## 🗂️ Persistent Storage (`.nourivex/`)

```
.nourivex/
├── goals/
│   ├── _active.json        # Current active goal + scope alarm log
│   ├── _history.json       # Completed and abandoned goals
│   └── archive/            # Full goal details
├── todos/
│   ├── _active.json        # Pointer to active todo list
│   ├── _completed.json     # Index of completed lists
│   └── lists/              # Individual todo lists with progress
│       └── {id}.json
├── memory/
│   ├── _index.json         # Master registry of all memory entries
│   ├── knowledge-vault/
│   │   ├── patterns/       # Reusable implementation patterns
│   │   └── lessons/        # Bug post-mortems & lessons learned
│   ├── user-dna/
│   │   └── profile.json    # User preferences & coding style
│   └── project-map/
│       ├── architecture.json   # Module relationships
│       └── domain-rules.json   # Business invariants (never violate)
└── sessions/
    └── latest.json         # Most recent session summary
```

---

## 👥 The Dream Team

| Agent | Role | Phase |
|-------|------|-------|
| 🕵️ **nvx-researcher** | Deep technical discovery & approach proposals | Phase 1: Research |
| 📐 **nvx-architect** | System design & structural blueprints | Phase 2: Architecture |
| 📝 **nvx-planner** | Task breakdown & TDD roadmap + todo list creation | Phase 3: Planning |
| 💻 **nvx-implementer** | TDD code execution + todo progress tracking | Phase 4: Execution |
| 🧐 **nvx-reviewer** | 7-pass review + memory capture (Pass 7) | Phase 5: Review |

## 📦 Available Skills (17)

All skills are registered in `.agents/skills/` for OpenCode auto-discovery.

| Skill | Description |
|-------|-------------|
| `nvx-session-manager` | **NEW** — Restore/save session context (goals, todos, memory) |
| `nvx-goal-preservation` | Lock objective + persist to `.nourivex/goals/` — survives restarts |
| `nvx-superpower-memory` | STORE patterns after GREEN, RECALL before planning |
| `nvx-watchdog` | Scope patrol + logs all alerts to goal file |
| `nvx-planner` | Plan + auto-persist as living todo list |
| `nvx-reviewer` | 7-pass review including memory capture (Pass 7) |
| `nvx-agent-synchronizer` | Context Pack v2 with PERSISTENT_REFS for handoffs |
| `nvx-tdd-enforcer` | Test-first discipline enforcement |
| `nvx-anti-overengineering` | Enforce simplicity & YAGNI |
| `nvx-architectural-consistency` | Match naming/pattern conventions |
| `nvx-verification` | Verify before completion claims |
| `nvx-idempotency-guard` | Ensure idempotent operations |
| `nvx-context-pruning` | Keep context window lean |
| `nvx-dependency-lockdown` | Control dependency additions |
| `nvx-reasoning-trace` | Reasoning transparency |
| `nvx-systematic-debugging` | Structured debugging protocol |
| `nvx-token-efficiency` | Token optimization |

## 📁 Project Structure

```
nourivex-runtime/
├── .agents/skills/              # 17 skill definitions (OpenCode auto-discovered)
│   ├── nvx-session-manager/     # NEW in v4.0.0
│   ├── nvx-superpower-memory/   # UPGRADED: actionable STORE/RECALL
│   ├── nvx-goal-preservation/   # UPGRADED: persists to .nourivex/goals/
│   ├── nvx-planner/             # UPGRADED: persists todo list
│   ├── nvx-watchdog/            # UPGRADED: logs alerts to goal file
│   ├── nvx-reviewer/            # UPGRADED: Pass 7 memory capture
│   └── nvx-agent-synchronizer/  # UPGRADED: Context Pack v2
├── .opencode/
│   ├── agents/                  # Agent instruction files (5 agents)
│   └── skills/                  # OpenCode skill entry point
├── .nourivex/                   # NEW: Persistent storage (auto-created)
│   ├── goals/                   # Goal tracking
│   ├── todos/                   # Todo lists
│   ├── memory/                  # Knowledge vault
│   └── sessions/                # Session summaries
├── adapters/
│   ├── opencode/AGENTS.md       # OpenCode handbook (v4.0.0)
│   ├── gemini/GEMINI.md         # Gemini CLI handbook (v4.0.0)
│   ├── claude/CLAUDE.md         # Claude adapter (v4.0.0)
│   └── codex/AGENTS.md          # Codex adapter (v4.0.0)
├── agents/                      # Agent role definitions
├── cli/src/
│   ├── commands/
│   │   ├── init.ts              # nourivex init
│   │   ├── memory.ts            # NEW: nourivex memory
│   │   ├── goals.ts             # NEW: nourivex goals
│   │   └── todos.ts             # NEW: nourivex todos
│   └── index.ts                 # CLI entry point
├── opencode-plugin.mjs          # OpenCode plugin entry
├── package.json                 # v4.0.0
└── skill.json                   # v4.0.0
```

## 📜 Principles

1. **Evidence before Implementation:** No code without a plan.
2. **Test-First:** Failing tests are mandatory before production code.
3. **Simplicity Wins:** Abstractions must be earned, not assumed.
4. **Full Traceability:** Every change must trace back to an approved plan.
5. **Memory Compounds:** Every session builds on the last. Store lessons. Recall patterns.
6. **Goals Persist:** Objectives are never lost to session restarts.

---

*Maintained by Nourivex — No code without a plan. No plan without verification. No session without memory.*
