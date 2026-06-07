# Nourivex Runtime - OpenCode Integration

This directory contains OpenCode-specific configuration for the Nourivex Runtime.

## Contents

- `agents/` - Agent instruction files for the 5 Nourivex specialized agents
- `plugin.mjs` - OpenCode plugin entry point (coming soon)

## How to Use in OpenCode

### 1. Load Skills

All 16 Nourivex skills are registered in `.agents/skills/` and auto-discovered by OpenCode:

```typescript
skill(name="nvx-watchdog")
skill(name="nvx-goal-preservation")
skill(name="nvx-tdd-enforcer")
// ... etc
```

### 2. Delegate to Agents (via load_skills)

When using `task()`, load the appropriate skill:

```typescript
// Research
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Explore...")

// Architecture
task(category="deep", load_skills=["nvx-architect"], run_in_background=false, prompt="Design...")

// Planning
task(category="deep", load_skills=["nvx-planner"], run_in_background=false, prompt="Plan...")

// Implementation
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer"], run_in_background=false, prompt="Implement...")

// Review
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Review...")
```

### 3. Register as Custom Subagents (Advanced)

To use agents directly via `task(subagent_type="nvx-researcher", ...)`, merge the `agent` config from `opencode.agents.json` into your project's `opencode.json`.

---

*See `adapters/opencode/AGENTS.md` for the full handbook.*
