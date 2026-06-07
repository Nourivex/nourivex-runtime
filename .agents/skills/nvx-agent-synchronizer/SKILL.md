---
name: nvx-agent-synchronizer
description: Ensure state and context synchronization between specialized agents (Researcher, Architect, Planner, Implementer, Reviewer).
---

# Agent Synchronizer

## Overview

When moving between agents, context often leaks or becomes fragmented. The Agent Synchronizer ensures a "Shared Context Pack" is maintained, allowing each agent to start with perfect knowledge of the previous phase's outcomes and constraints.

**Core Principle:** No agent is an island. The output of one is the absolute truth for the next.

---

## The Synchronization Protocol

### 1. The Context Pack (Mandatory Hand-off)
Every time `invoke_agent` is used, the caller MUST include the **Nourivex Context Pack**:
- **`CURRENT_STATUS`**: What has been achieved so far?
- **`APPROVED_BLUEPRINT`**: Reference to the latest architecture/plan.
- **`PENDING_CHALLENGES`**: What obstacles are we currently facing?
- **`NEXT_GOAL`**: Exactly what the target agent needs to do.

### 2. State Verification
The target agent MUST start its response by acknowledging the Context Pack:
`[SYNC] Received Context Pack. Locked on [NEXT_GOAL].`

---

## Red Flags

- An Implementer ignoring a constraint defined by the Architect.
- A Planner creating a roadmap that contradicts the Researcher's findings.
- An agent asking "What should I do?" when a Context Pack should have defined it.

---

## The Bottom Line

Synchronization prevents drift. If the chain of truth breaks, the implementation fails.
