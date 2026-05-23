---
name: nvx-token-efficiency
description: Use in long workflows and multi-step sessions to keep context lean — prioritize relevant files, avoid reloading full context, and communicate concisely without losing precision
---

# Token Efficiency

## Overview

Long sessions accumulate dead weight: files read at the start that are no longer relevant, context repeated in every message, verbose explanations for simple decisions. This dead weight degrades response quality, increases latency, and risks losing the thread on what actually matters.

**Core principle:** Load only what you need. Say only what matters. Keep the working set lean.

**Verbosity is not thoroughness. Precision is.**

---

## The Iron Law

```
NEVER RELOAD CONTEXT THAT IS ALREADY IN THE SESSION.
NEVER INCLUDE INFORMATION NOT RELEVANT TO THE CURRENT TASK.
NEVER EXPLAIN DECISIONS MORE THAN ONCE.
```

---

## Context Management Rules

### Rule 1: Read Once, Reference Later

```
❌ Wrong (reading same file multiple times):
Message 3: [reads auth.service.ts]
Message 7: [reads auth.service.ts again]
Message 12: [reads auth.service.ts again]

✅ Correct:
Message 3: [reads auth.service.ts]
Message 7: "Referencing auth.service.ts from earlier — the relevant section is the verifyToken function"
Message 12: "Same auth.service.ts pattern applies here"
```

Once a file is read, it stays in context. Reference the relevant section, don't reload.

---

### Rule 2: Targeted File Reading

```
❌ Wrong: Reading entire files when only one function matters
[reads 500-line user.service.ts to find the createUser function]

✅ Correct:
[grep for 'createUser' → identify lines 45-72 → read only lines 45-72]
```

Use search/grep to locate relevant sections. Read only the relevant sections. Never read a whole file when a section will do.

---

### Rule 3: Progressive Context Loading

Load context in layers:
```
Layer 1: File map (structure) — always load at session start
Layer 2: Relevant module (when entering that domain) — load once
Layer 3: Specific function (when working on that function) — load only when needed
Layer 4: Full file — only when Layer 3 is insufficient and specific to the task
```

Never start at Layer 4 when Layer 2 or 3 is sufficient.

---

### Rule 4: Context Pruning

In long sessions, periodically assess what is still relevant:

```
CONTEXT AUDIT:
Currently holding:
- [File A] — still relevant to current task? [yes/no]
- [File B] — still relevant to current task? [yes/no]
- [Context from N messages ago] — still active? [yes/no]

If no → do not reference or re-read. Let it drop from active consideration.
```

---

## Communication Efficiency Rules

### Rule 5: No Redundant Preamble

```
❌ Wrong:
"Great question! I'll now look at the codebase to understand the existing patterns, 
then I'll analyze the requirements, formulate an approach, and implement a solution..."

✅ Correct:
[immediately starts doing the work]
```

Don't narrate what you're about to do. Do it.

---

### Rule 6: Decisions Explained Once

```
❌ Wrong (explaining the same decision three times):
"I'm using async/await because it's cleaner than callbacks [Task 1]"
"As I mentioned before, async/await is being used because [Task 2]"
"Continuing with the async/await approach as established [Task 3]"

✅ Correct:
"Using async/await throughout. [Task 1]" 
[subsequent tasks just use it, no re-explanation]
```

---

### Rule 7: Concise Status Updates

```
❌ Wrong:
"I have now successfully completed Task 3 which involved writing the failing test 
for the user authentication endpoint. The test correctly fails because the endpoint 
does not yet exist, confirming our TDD approach is working as intended..."

✅ Correct:
"Task 3 done: test written, confirmed FAIL. Proceeding to implementation."
```

Status updates should be one line unless something unexpected happened.

---

### Rule 8: No Performative Enthusiasm

```
❌ Wrong:
"Absolutely! Great idea! I'll be happy to help with that!"
"This is a really interesting problem! Let me dive in!"
"Perfect! That makes sense! Here's what I'll do:"

✅ Correct:
[starts doing the work]
```

Enthusiasm burns tokens and adds no value. Start working.

---

## Session Hygiene for Long Workflows

### At Session Start
```
SESSION INIT:
1. Load file map (structure overview) — one time
2. Identify relevant modules for current task
3. Load only those modules
4. Lock objective (nvx-goal-preservation)
5. Begin work
```

### At Task Boundaries
```
TASK BOUNDARY:
1. Mark previous task complete (one line)
2. Identify what context from previous task is relevant to next task
3. Drop what's no longer relevant
4. Load what the next task needs
5. Begin next task
```

### Every 10+ Messages
```
CONTEXT AUDIT:
- Current objective: [restate briefly]
- Current task: [task N of M]
- Active files in context: [list — prune irrelevant]
- Pending decisions: [list — resolve or drop]
```

---

## Information Priority Hierarchy

When multiple pieces of information could be included, prioritize:

1. **Current task requirements** — always include
2. **Direct blockers / errors** — always include
3. **Recent relevant decisions** — include only if they affect current task
4. **Background context** — include only if needed to understand current decision
5. **Historical decisions** — reference only if explicitly relevant, never repeat in full
6. **General knowledge** — never repeat unless the user asks

---

## Verbosity Anti-Patterns

| Anti-Pattern | Fix |
|-------------|-----|
| Re-explaining established decisions | Reference once. Move on. |
| Full file reads for small changes | Grep → targeted section → read only that |
| Multi-paragraph status updates | One-line status. Exception only if unexpected. |
| Explaining obvious next steps | Just do them. |
| Re-reading files already in context | Reference the content from earlier. |
| Lengthy preambles before action | Start the action. |
| Summarizing what you're about to do | Do it, then summarize what was done. |

---

## Efficient Error Reporting

```
❌ Wrong:
"I encountered an error while trying to run the test suite. The error message 
indicates that there is a problem with the TypeScript compiler finding the module. 
This is a common issue in TypeScript projects and typically occurs when..."

✅ Correct:
"Error: Module not found — 'src/auth/auth.service'. 
Cause: barrel file missing. Fix: add export to index.ts."
```

Error → cause → fix. Three parts. Done.

---

## Red Flags — Apply Efficiency Rules

- Reading a file you've already read this session
- Explaining a decision you already explained
- Writing more than one sentence of preamble before starting work
- Summarizing a plan before executing it (just execute)
- Re-reading the full objective when it was already locked
- Repeating context that hasn't changed

---

## The Bottom Line

Lean context = clear thinking = better output.

Say what matters. Load what's needed. Skip everything else.
