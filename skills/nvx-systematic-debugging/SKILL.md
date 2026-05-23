---
name: nvx-systematic-debugging
description: Use when encountering any bug, test failure, unexpected behavior, or error — before proposing any fix
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. "Coba restart" and "try changing this" are not debugging — they are guessing with side effects. Systematic debugging finds the root cause before touching a single line of fix code.

**Core principle:** ALWAYS find root cause before attempting any fix. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

---

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE IDENTIFIED FIRST.
```

If you have not completed Phase 1, you cannot propose a fix.

---

## When to Use

Use for ANY technical issue:
- Test failures
- Runtime errors
- Unexpected behavior
- Build failures
- Integration issues
- Performance degradations

**Especially when:**
- Under time pressure (emergencies make guessing tempting — resist it)
- "The fix seems obvious" (obvious fixes mask root causes)
- You've already tried one or more fixes that didn't work
- You don't fully understand the issue yet

---

## The Four Phases

Complete each phase before advancing to the next. No skipping.

---

### Phase 1: Root Cause Investigation

**Before ANY fix attempt:**

**1. Read the Error Message Completely**
- Do not skip past stack traces
- Note: exact error text, file path, line number, error code
- Often the error message IS the root cause

**2. Reproduce Consistently**
```
Reproduction check:
- Can I trigger this reliably? [yes/no]
- What are the exact steps? [list them]
- Does it happen every time? [yes/sometimes/rarely]
- If not reproducible → gather more data, do NOT guess
```

**3. Check Recent Changes**
```bash
git diff HEAD~1
git log --oneline -10
# What changed that could cause this?
```

**4. Evidence Gathering (Multi-Component Systems)**

When the error crosses multiple layers (API → service → database, CI → build → deploy):

```
For EACH component boundary:
  - What data enters this component?
  - What data exits this component?
  - Where does the bad value first appear?

Add diagnostic logging at each boundary.
Run once to gather evidence.
THEN analyze evidence.
THEN identify the failing component.
THEN investigate that specific component.
```

**5. Trace the Data Flow**

```
Backward trace from error:
- Error occurs at: [location]
- Called by: [caller] with [what data]
- Caller received data from: [source] as [what data]
- ... keep tracing up until the source of the bad value is found
- Fix at source, NOT at the point of error
```

---

### Phase 2: Pattern Analysis

**After understanding what is broken, find the pattern:**

1. **Find working examples** — locate similar working code in the same codebase
2. **Compare working vs. broken** — list every difference, however small
3. **Check reference implementation** — if using a library/pattern, read the docs fully
4. **Understand dependencies** — what config, environment, or state does this assume?

---

### Phase 3: Hypothesis Formation

**Scientific method. One hypothesis at a time:**

```
HYPOTHESIS:
- I believe the root cause is: [specific, clear statement]
- Evidence supporting this: [what I observed]
- Test: [smallest change that proves or disproves this]
- Expected result if correct: [specific outcome]
```

Rules:
- One hypothesis at a time
- Make the SMALLEST possible change to test it
- Run and observe
- If wrong → form NEW hypothesis (do NOT stack fixes)

---

### Phase 4: Fix and Verify

**Fix the root cause, not the symptom:**

1. **Write a failing test first** (see `nvx-tdd-enforcer`)
   - Minimal reproduction of the bug
   - Must fail BEFORE the fix

2. **Implement ONE fix**
   - Address the identified root cause
   - One change at a time
   - No "while I'm here" additions

3. **Verify the fix** (see `nvx-verification`)
   - The test now passes?
   - No other tests broke?
   - Original symptom is gone?

---

## The 3-Strike Rule

```
Fixes attempted: [count]

After 2 failed fixes: STOP. Re-do Phase 1 with all new information gathered.
After 3 failed fixes: STOP. Question the architecture.
After 3+ fixes: This is an architectural problem, not a bug fix.
```

**3+ failed fixes = question the pattern, not the implementation:**
- Is this the wrong approach fundamentally?
- Are we fighting the architecture instead of working with it?
- Should we refactor the design vs. continue patching?

**Stop and discuss before attempting any further fix.**

---

## Debugging Communication

Communicate in phases, not guesses:

```
❌ Wrong:
"Mungkin masalahnya di line 42. Coba ganti ini..."
"Kayaknya auth-nya error deh. Try restart."

✅ Correct:
"Phase 1 complete. Root cause identified: [X] because [evidence Y].
Hypothesis: [specific theory]. 
Fix plan: [one specific change]. 
Running test to verify..."
```

---

## Red Flags — Stop and Return to Phase 1

- "Coba..." / "Maybe try..." / "Just change this and see..."
- Proposing a fix before reading the full error message
- Adding multiple changes at once to "see if it works"
- Skipping reproduction ("I think I know what it is")
- Third or fourth fix attempt without architectural review
- Each fix reveals a new problem in a different place (= architectural issue)

---

## Quick Reference

| Phase | Key Activity | Gate |
|-------|-------------|------|
| **1. Root Cause** | Read error, reproduce, trace data flow | Root cause identified with evidence |
| **2. Pattern** | Compare working vs. broken, read references | Differences identified |
| **3. Hypothesis** | Form ONE specific theory, plan minimal test | Hypothesis stated clearly |
| **4. Fix** | Write test, fix root cause, verify | Test passes, symptom gone |

---

## The Bottom Line

Systematic debugging takes 15-30 minutes. Random guessing takes 2-3 hours and introduces new bugs. 

Find the root cause. Fix the root cause. Verify the fix.
