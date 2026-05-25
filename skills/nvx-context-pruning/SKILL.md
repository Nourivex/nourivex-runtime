---
name: nvx-context-pruning
description: Manage active context window by discarding irrelevant failure logs and intermediate RED states once a task is resolved.
---

# Context Pruning (Dynamic GC)

## Overview

In long sessions, accumulated logs of failed tests and intermediate "RED" states dilute model attention. Context Pruning ensures the agent stays focused on the *current* objective and the *clean* state of the codebase.

**Core Principle:** Once a task is GREEN, the history of the RED state is garbage. Keep the context lean.

---

## The Pruning Protocol

Whenever a task in the `nvx-planner` is marked **COMPLETED** and **VERIFIED GREEN** by `nvx-watchdog`:

1. **Discard Intermediate Logs:** You must stop referring to or quoting long error messages from the implementation phase of that specific task.
2. **Focus on Final State:** Treat the new "GREEN" state as the only source of truth moving forward.
3. **Summarize & Reset:** In your next turn, provide a concise summary of the *final change* only, ignoring the "trial and error" history.

---

## Operational Guidelines

- **Do NOT reload:** Do not re-read files you just edited unless a new task requires it.
- **Limit Feedback:** When reporting success, do not include the full verbose output of a passing test suite—only the final "PASS" line and the count of tests.
- **Attention Focus:** If context usage is high, explicitly state: `[CONTEXT PRUNING] Moving forward from clean state of [Component X]. Ignoring previous failure logs.`

---

## Red Flags

- Quoting error messages from three tasks ago.
- Carrying over large chunks of "what went wrong" into the strategy for the "next step."
- Including repetitive `npm test` outputs in every turn response.

---

## The Bottom Line

Clean code requires a clean mind. Prune the noise to maintain precision.
