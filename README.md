# Nourivex Runtime

**Nourivex Runtime** is a provider-agnostic AI engineering framework. It enforces a strict **Research → Architecture → Planning → TDD Execution** workflow with **17 discipline skills**, **5 specialized agents**, a **persistent memory system**, and an **MCP server with 25 executable tools** so agents never forget your goals across sessions. Supports **OpenCode**, **Gemini CLI**, **Claude**, and **Codex**.

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
- **MCP Server with 25 Tools:** Available via `npx nourivex-mcp-server` — tools for goals, memory, todos, and session management.
- **CLI Tools:** `nourivex memory`, `nourivex goals`, `nourivex todos`, `nourivex mcp` for inspecting persistent state from terminal.

---

## 🛠️ Installation

Nourivex Runtime has **two modes** that complement each other:

| Mode | What It Does | How |
|------|-------------|-----|
| 🧩 **Plugin** | Provides 17 skills + 5 agents (agentic workflow) | `plugin: ["nourivex-runtime"]` |
| 🔌 **MCP Server** | Exposes 25 tools via MCP protocol (tool-based) | `npx -y nourivex-mcp-server` |

### Step 1: Install the Runtime

```bash
# Install CLI globally (recommended)
npm install -g nourivex-runtime

# Or install in your project
npm install nourivex-runtime
```

### Step 2: Configure

#### For OpenCode users — dual config (`opencode.json`):

Add both **plugin** and **MCP** entries to your `opencode.json`:

```json
{
  "plugin": ["nourivex-runtime"],

  "mcp": {
    "nourivex": {
      "type": "local",
      "command": ["npx", "-y", "nourivex-mcp-server"],
      "enabled": true
    }
  }
}
```

> **Plugin** enables agentic workflow: `skill()`, `task()`, specialized sub-agents.
> **MCP** enables direct tool access: 26 atomic tools for goals/memory/todos/sessions.
> Keduanya coexist — bukan either/or.

#### For CLI-only use:

```bash
# Initialize your project for a specific AI assistant
cd /path/to/your/project
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

#### Or add the MCP server only (no plugin):

Any MCP-compatible client can use just the server:

```json
{
  "mcp": {
    "nourivex": {
      "type": "local",
      "command": ["npx", "-y", "nourivex-mcp-server"]
    }
  }
}
```

#### Local Plugin (development):

```bash
opencode plugin add ./opencode-plugin.mjs
```

#### Register Custom Subagents (Advanced):

To use agents via `task(subagent_type="nvx-researcher", ...)`, merge `opencode.agents.json` into your project's `opencode.json` under the `"agent"` field.

#### Gemini CLI:

```bash
gemini extensions install <path-to-nourivex-runtime> --consent
```

---

## 🎯 OpenCode Quick Start (v5.0.0)

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

## 🔌 MCP Server

> **MCP** (Model Context Protocol) lets any MCP-compatible AI client call tools directly — no plugin or skill system needed.
> Install via: `npx -y nourivex-mcp-server` (no global install required)

### 25 Tools

| Domain | Tool | What It Does |
|--------|------|-------------|
| **Goals** (7) | `goal_get` | Read the current active goal |
| | `goal_create` | Create a new active goal with title, objective, success criteria |
| | `goal_update` | Update a field on the active goal |
| | `goal_complete` | Complete and archive the active goal |
| | `goal_abandon` | Abandon the active goal with a reason |
| | `goal_add_scope_alarm` | Log a scope drift alarm to the active goal |
| | `goal_history` | Read completed and abandoned goals from history |
| **Memory** (8) | `memory_store` | Store a new memory entry (pattern, lesson, or note) |
| | `memory_list` | List all memory entries with search and filter |
| | `memory_get` | Get a specific memory entry by ID |
| | `memory_recall` | Recall patterns before planning — returns relevant memories |
| | `memory_update_user_dna` | Update user preferences and coding style profile |
| | `memory_get_user_dna` | Get stored user preferences and coding profile |
| | `memory_get_domain_rules` | Get stored business domain rules (invariants) |
| | `memory_add_domain_rule` | Add a new business domain rule |
| **Sessions** (3) | `session_init` | Initialize a new session with project context |
| | `session_restore` | Restore session context — returns active goal, todo, and recent memory |
| | `session_save` | Save the current session summary to persistent storage |
| **Todos** (7) | `todo_create` | Create a new todo list from a plan |
| | `todo_get` | Get a todo list by ID |
| | `todo_list` | List all active todo lists |
| | `todo_update_item` | Update a single todo item (status, description, priority) |
| | `todo_add_item` | Add an item to an existing todo list |
| | `todo_complete` | Mark a todo list as completed and archive it |
| | `todo_progress` | Get aggregated progress across all todo lists |

> These tools interact with the same `.nourivex/` persistent storage as the plugin skills — data written via MCP is visible to plugin skills and vice versa.

---

## 🧠 CLI Commands (v5.0.0)

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

# MCP Server
nourivex mcp                      # Spawn MCP server locally (stdio)
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
| `nvx-session-manager` | Restore/save session context (goals, todos, memory) |
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
│   ├── nvx-session-manager/
│   ├── nvx-superpower-memory/
│   ├── nvx-goal-preservation/
│   ├── nvx-planner/
│   ├── nvx-watchdog/
│   ├── nvx-reviewer/
│   └── nvx-agent-synchronizer/
├── .opencode/
│   ├── agents/                  # Agent instruction files (5 agents)
│   └── skills/                  # OpenCode skill entry point
├── .nourivex/                   # Persistent storage (auto-created)
│   ├── goals/                   # Goal tracking
│   ├── todos/                   # Todo lists
│   ├── memory/                  # Knowledge vault
│   └── sessions/                # Session summaries
├── adapters/
│   ├── opencode/AGENTS.md       # OpenCode handbook (v5.0.0)
│   ├── gemini/GEMINI.md         # Gemini CLI handbook (v5.0.0)
│   ├── claude/CLAUDE.md         # Claude adapter (v5.0.0)
│   └── codex/AGENTS.md          # Codex adapter (v5.0.0)
├── agents/                      # Agent role definitions
├── cli/src/
│   ├── commands/
│   │   ├── init.ts              # nourivex init
│   │   ├── memory.ts            # nourivex memory
│   │   ├── goals.ts             # nourivex goals
│   │   ├── todos.ts             # nourivex todos
│   │   └── mcp.ts               # nourivex mcp
│   └── index.ts                 # CLI entry point
├── mcp/                         # MCP server source
│   ├── src/
│   │   ├── server.ts            # MCP entry point (26 tools)
│   │   ├── tools/               # Tool implementations (goals, memory, session, todos)
│   │   ├── prompts/             # MCP prompt definitions
│   │   ├── resources/           # MCP resource definitions
│   │   └── schemas/             # Zod schemas for all operations
│   ├── dist/                    # Build output
│   ├── tsconfig.json
│   └── package.json             # nourivex-mcp-server@5.0.0 (published to npm)
├── opencode-plugin.mjs          # OpenCode plugin entry
├── opencode-mcp.json            # Project-local MCP server config
├── package.json                 # v5.0.0
└── skill.json                   # v5.0.0
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
