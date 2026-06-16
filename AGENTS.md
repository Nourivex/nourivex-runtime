# Nourivex Agents: Bootstrap (v5.0.0)

## 🤝 Team Handoff Entry Point
This repository uses specialized agents and discipline adapters, backed by a **persistent memory system** and an **MCP server with 26 tools**.

### 0. Session Start
**ALWAYS** restore session context before any task:
```typescript
skill(name="nvx-session-manager")  // Restore goals, todos, memory
```
Or for Gemini/Claude: read `.nourivex/` persistent state and present SESSION BRIEF.

### 1. Load Your Contract
Identify your platform and load the corresponding handbook:
- **OpenCode:** `adapters/opencode/AGENTS.md` (see also `.opencode/` directory)
- **Codex:** `adapters/codex/AGENTS.md`
- **Gemini:** `adapters/gemini/GEMINI.md`
- **Claude:** `adapters/claude/CLAUDE.md`

### 2. OpenCode Quick Start
If using **OpenCode**, the Nourivex Runtime is available in **two modes**:

#### A. Plugin Mode (Skills + Agents)
Add to `opencode.json`:
```json
{ "plugin": ["nourivex-runtime"] }
```

**Skills** (auto-discovered from `.agents/skills/`):
```typescript
skill(name="nvx-session-manager")    // FIRST — restore session context
skill(name="nourivex-runtime")       // Load full framework
skill(name="nvx-watchdog")           // Scope drift patrol
skill(name="nvx-goal-preservation")  // Lock objective + persist
skill(name="nvx-superpower-memory")  // RECALL/STORE patterns
skill(name="nvx-tdd-enforcer")       // TDD discipline
// See .agents/skills/ for all 17 skills
```

**Sub-agent delegation** (via load_skills):
```typescript
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Research...")
task(category="deep", load_skills=["nvx-architect"], run_in_background=false, prompt="Design...")
task(category="deep", load_skills=["nvx-planner"], run_in_background=false, prompt="Plan...")
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer"], run_in_background=false, prompt="Implement...")
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Review...")
```

#### B. MCP Server Mode (26 Tools)
Add to `opencode.json`:
```json
{
  "mcp": {
    "nourivex": {
      "type": "local",
      "command": ["npx", "-y", "nourivex-mcp-server"],
      "env": { "NOURIVEX_PROJECT_ROOT": "." },
      "enabled": true
    }
  }
}
```

**Available MCP tools:** goals (7), memory (8), sessions (3), todos (8) — see README.md for full list.

> Plugin and MCP modes coexist — the plugin handles agentic workflows, MCP provides atomic tool access to the same `.nourivex/` storage.

#### Custom subagent registration (advanced):
Merge `opencode.agents.json` into your project's `opencode.json` to use `task(subagent_type="nvx-researcher", ...)` directly.

### 3. Mandatory Discipline
Every agent in this repository MUST operate under the **Nourivex Engineering Standard**. 
- Always restore session context before starting (nvx-session-manager).
- Always Research before Architecture.
- Always Architecture before Planning.
- Always Planning before TDD Execution.
- Always use `nvx-watchdog` to patrol your work.
- Always STORE to memory after GREEN states.

---
*Refer to the /agents directory for specific role instructions.*
*OpenCode users: see adapters/opencode/AGENTS.md and .opencode/ for the full reference.*
