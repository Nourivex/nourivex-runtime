---
name: nvx-reasoning-trace
description: Force agents to output an internal reasoning trace before critical actions to improve transparency and debugging.
---

# Reasoning Trace

## Overview

Complex decisions (architectural choices, bug fix hypotheses) can seem like "black box" outcomes. Reasoning Trace forces agents to externalize their logical chain *before* taking action, allowing for better human oversight and easier debugging of the agent's thought process.

**Core Principle:** Show your work. Logic must be traceable before it is executable.

---

## The Trace Protocol

Before any **Critical Action** (e.g., creating a new architecture, proposing a complex fix, choosing a dependency), the agent MUST output a `[REASONING TRACE]`:

1. **Observations:** What facts are we looking at?
2. **Constraints:** What limits our options?
3. **Inference:** Based on observations + constraints, what is the logical conclusion?
4. **Decision:** What is the chosen action and why?

---

## Example Trace

```
[REASONING TRACE]
- Observations: Error is 'Module not found', but file exists at lib/config.
- Constraints: Project uses relative imports in manager.py.
- Inference: The PYTHONPATH might not include the root directory when running tests.
- Decision: Hypothesis is a missing __init__.py or incorrect test execution command. Action: Add __init__.py.
```

---

## Red Flags

- "I think X is the problem, fixing it now" (Missing the logical trace).
- Changing an architectural pattern without explaining the trade-off.

---

## The Bottom Line

Transparency builds trust. A trace makes the "why" as important as the "what."
