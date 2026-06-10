---
name: nvx-agent-synchronizer
description: Ensure state and context synchronization between specialized agents (Researcher, Architect, Planner, Implementer, Reviewer). Context Pack now includes persistent memory references for zero-information-loss handoffs.
---

# Agent Synchronizer

## Overview

When moving between agents, context often leaks or becomes fragmented. The Agent Synchronizer ensures a **Shared Context Pack** is maintained, allowing each agent to start with perfect knowledge of the previous phase's outcomes and constraints.

**Core Principle:** No agent is an island. The output of one is the absolute truth for the next.

**v4.0.0 addition:** Context Packs now reference persistent storage locations, enabling receiving agents to verify and expand context independently.

---

## The Iron Law

```
NO AGENT HANDOFF WITHOUT A COMPLETE CONTEXT PACK.
CONTEXT PACKS REFERENCE PERSISTENT STATE — NOT JUST INLINE SUMMARIES.
```

---

## The Synchronization Protocol

### 1. The Enhanced Context Pack (Mandatory Hand-off)

Every time `invoke_agent` is used, the caller MUST include the **Nourivex Context Pack v2**:

```
CONTEXT PACK v2:
─────────────────────────────────────────────
CURRENT_STATUS:
  What has been achieved so far? (concrete, not vague)
  e.g., "Phase 1 Research complete. Identified 3 approaches. Selected Express + TypeScript."

APPROVED_BLUEPRINT:
  Reference to the latest architecture/plan file.
  e.g., "docs/nourivex/architecture/2026-06-10-todo-api.md"

PENDING_CHALLENGES:
  What obstacles are we currently facing?
  e.g., "TypeScript strict mode breaks the existing router.ts — needs fix before we can add new routes"

NEXT_GOAL:
  Exactly what the target agent needs to do. One sentence.
  e.g., "Implement the POST /todos endpoint following Task 3 in the plan"

PERSISTENT_REFS:
  Active Goal:   .nourivex/goals/_active.json → goal ID: {id}
  Active Todos:  .nourivex/todos/lists/{todo-id}.json → current task: task-{N}
  Relevant Memory:
    - {pattern-id}: "{title}" [{tags}]
    - {lesson-id}: "{title}" [{tags}]
  Domain Rules: .nourivex/memory/project-map/domain-rules.json
─────────────────────────────────────────────
```

### 2. State Verification

The target agent MUST start its response by acknowledging the Context Pack and verifying persistent state:

```
[SYNC] Received Context Pack v2.

Verifying persistent state...
  ✅ Goal: {title} — status: active
  ✅ Todo: task-{N} "{task title}" — status: pending
  ✅ Memory: {N} relevant entries loaded

Locked on: {NEXT_GOAL}

Proceeding with {phase name}...
```

If persistent state is inconsistent with the Context Pack inline summary → **HALT and reconcile** before proceeding.

### 3. Memory-Enhanced Handoff

When handing off to a new agent, include relevant memory that the receiving agent should act on:

```
RELEVANT_MEMORY section guidance:
- Include pattern IDs that directly apply to NEXT_GOAL
- Include lesson IDs for known pitfalls in the target domain
- Limit to 3-5 most relevant entries (not everything)
- If no relevant memory → "RELEVANT_MEMORY: none — fresh ground"
```

---

## Handoff Integrity Check

Before sending a Context Pack, verify:

```
HANDOFF CHECK:
□ CURRENT_STATUS is factual and specific (not "we discussed X")
□ APPROVED_BLUEPRINT references an actual file that exists
□ PENDING_CHALLENGES lists real blockers (not speculation)
□ NEXT_GOAL is one clear sentence, unambiguous
□ PERSISTENT_REFS has the correct IDs from actual files
□ RELEVANT_MEMORY is filtered to genuinely relevant entries

PASS → send Context Pack
FAIL → fix the incomplete fields first
```

---

## Platform-Specific Handoff Format

### OpenCode
```typescript
task(
  category="deep",
  load_skills=["nvx-implementer", "nvx-tdd-enforcer"],
  run_in_background=false,
  prompt=`
    CONTEXT PACK v2:
    CURRENT_STATUS: Planning complete. Plan approved.
    APPROVED_BLUEPRINT: docs/nourivex/plans/2026-06-10-todo-api.md
    PENDING_CHALLENGES: None
    NEXT_GOAL: Implement Task 1 — POST /todos endpoint with TDD
    PERSISTENT_REFS:
      Active Goal: .nourivex/goals/_active.json (id: 2026-06-10-todo-api)
      Active Todos: .nourivex/todos/lists/2026-06-10-todo-api-impl.json (task-001)
      Relevant Memory: none for this domain
  `
)
```

### Gemini CLI / Claude / Codex
Include the Context Pack block at the top of the agent prompt, before any task instructions.

---

## Red Flags

- An Implementer ignoring a constraint defined by the Architect
- A Planner creating a roadmap that contradicts the Researcher's findings
- An agent asking "What should I do?" when a Context Pack should have defined it
- Handoff without `PERSISTENT_REFS` section (v4.0.0+)
- Receiving agent skipping state verification
- `RELEVANT_MEMORY` listing entries that don't relate to `NEXT_GOAL`

---

## The Bottom Line

Synchronization prevents drift. If the chain of truth breaks, the implementation fails.

In v4.0.0, the chain of truth is not just inline context — it is grounded in persistent files that any agent can independently verify. A Context Pack that points to a real file is worth ten times a Context Pack that summarizes from memory.
