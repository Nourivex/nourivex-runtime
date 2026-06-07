# Nourivex Runtime

**Nourivex Runtime** is a provider-agnostic AI engineering framework. It enforces a strict **Research → Architecture → Planning → TDD Execution** workflow with 16 discipline skills and 5 specialized agents. Supports **OpenCode**, **Gemini CLI**, **Claude**, and **Codex**.

## 🚀 Key Features

- **Engineering Discipline:** 16 built-in skills for TDD, Goal Preservation, Scope Watchdog, Anti-Overengineering, and more.
- **Collaborative Team:** 5 specialized agents (Researcher, Architect, Planner, Implementer, Reviewer) that work as partners.
- **Multi-Platform:** Works with OpenCode, Gemini CLI, Claude, and Codex via platform adapters.
- **Auto-Discovery:** OpenCode auto-discovers skills from `.agents/skills/` and agents from `.opencode/agents/`.
- **npm Installable:** Can be installed via npm and used as a plugin/MCP.

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

## 🎯 OpenCode Quick Start

```typescript
// 1. Load the framework
skill(name="nourivex-runtime")

// 2. Load discipline skills
skill(name="nvx-goal-preservation")   // Lock objective
skill(name="nvx-watchdog")            // Patrol scope drift
skill(name="nvx-tdd-enforcer")        // Enforce test-first

// 3. Delegate to specialized agents
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Research...")
task(category="deep", load_skills=["nvx-architect"], run_in_background=false, prompt="Design...")
task(category="deep", load_skills=["nvx-planner"], run_in_background=false, prompt="Plan...")
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer"], run_in_background=false, prompt="Implement...")
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Review...")
```

See `adapters/opencode/AGENTS.md` for the full OpenCode handbook.

---

## 👥 The Dream Team

| Agent | Role | Phase |
|-------|------|-------|
| 🕵️ **nvx-researcher** | Deep technical discovery & approach proposals | Phase 1: Research |
| 📐 **nvx-architect** | System design & structural blueprints | Phase 2: Architecture |
| 📝 **nvx-planner** | Task breakdown & TDD roadmap creation | Phase 3: Planning |
| 💻 **nvx-implementer** | TDD code execution with strict discipline | Phase 4: Execution |
| 🧐 **nvx-reviewer** | Critical logic & edge-case verification | Phase 5: Review |

## 📦 Available Skills (16)

All skills are registered in `.agents/skills/` for OpenCode auto-discovery.

| Skill | Description |
|-------|-------------|
| `nvx-goal-preservation` | Lock objective at task start |
| `nvx-watchdog` | Patrol for scope drift during implementation |
| `nvx-tdd-enforcer` | Test-first discipline enforcement |
| `nvx-anti-overengineering` | Enforce simplicity & YAGNI |
| `nvx-architectural-consistency` | Match naming/pattern conventions |
| `nvx-verification` | Verify before completion claims |
| `nvx-reviewer` | Adversarial code review |
| `nvx-idempotency-guard` | Ensure idempotent operations |
| `nvx-context-pruning` | Keep context window lean |
| `nvx-dependency-lockdown` | Control dependency additions |
| `nvx-superpower-memory` | Long-term pattern storage |
| `nvx-agent-synchronizer` | State handoff between agents |
| `nvx-reasoning-trace` | Reasoning transparency |
| `nvx-systematic-debugging` | Structured debugging protocol |
| `nvx-token-efficiency` | Token optimization |
| `nvx-planner` | Multi-step planning protocol |

## 📁 Project Structure

```
nourivex-runtime/
├── .agents/skills/              # OpenCode skill definitions (16 skills)
├── .opencode/
│   ├── agents/                  # Agent instruction files (5 agents)
│   ├── skills/                  # OpenCode skill entry point
│   │   └── nourivex-runtime/
│   │       ├── SKILL.md         # Main skill file
│   │       └── references/      # Detailed guides
│   └── README.md                # OpenCode integration guide
├── adapters/
│   ├── opencode/AGENTS.md       # OpenCode handbook
│   ├── gemini/GEMINI.md         # Gemini CLI handbook
│   ├── claude/CLAUDE.md         # Claude adapter
│   └── codex/AGENTS.md          # Codex adapter
├── agents/                      # Agent role definitions
├── skills/                      # Skill source files
├── opencode-plugin.mjs          # OpenCode plugin entry
├── opencode.agents.json         # Agent config for opencode.json
├── skill.json                   # Skill metadata for discovery
├── package.json                 # npm package config
├── nourivex-runtime.skill       # Gemini CLI extension
└── gemini-extension.json        # Gemini extension manifest
```

## 📜 Principles

1. **Evidence before Implementation:** No code without a plan.
2. **Test-First:** Failing tests are mandatory before production code.
3. **Simplicity Wins:** Abstractions must be earned, not assumed.
4. **Full Traceability:** Every change must trace back to an approved plan.

---

*Maintained by Nourivex — No code without a plan. No plan without verification. No verification without evidence.*
