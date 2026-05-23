---
name: nvx-reviewer
description: Use after completing any implementation — perform a structured self-review to catch logic issues, edge cases, bad abstractions, duplicated logic, and scope violations before declaring completion
---

# Reviewer

## Overview

Shipping unreviewed code is shipping unchecked assumptions. A self-review after implementation is not optional — it is the final engineering gate before declaring work done. The reviewer catches what the implementer misses because implementation mode is focused on making things work; review mode is focused on whether things are right.

**Core principle:** No completion without a structured self-review. Evidence, not confidence.

---

## The Iron Law

```
NO COMPLETION CLAIM WITHOUT A COMPLETED SELF-REVIEW.
REVIEW IS NOT OPTIONAL. IT IS THE FINAL GATE.
```

---

## When to Use

- After completing any task in an implementation plan
- Before any commit that introduces new logic
- Before closing a bug fix
- After any refactoring

---

## Review Protocol

### Pass 1: Correctness Review

Read every new/modified line with fresh eyes and verify:

```
CORRECTNESS CHECK:
□ Does this actually solve the stated requirement?
□ Are there off-by-one errors, boundary conditions, null cases?
□ Are all error paths handled explicitly?
□ Could this fail silently without any visible error?
□ Are all async operations awaited?
□ Are all conditional branches covered?
```

**How to read:** Pretend you are reading code written by someone else. Question every assumption.

---

### Pass 2: Logic Review

```
LOGIC CHECK:
□ Does the flow make logical sense end-to-end?
□ Are there any dead code paths?
□ Are there any impossible conditions (always true/false)?
□ Are there any race conditions or ordering dependencies?
□ Would this behave correctly under concurrent execution?
□ Would this behave correctly with empty inputs?
□ Would this behave correctly with maximum/extreme inputs?
```

---

### Pass 3: Edge Case Review

Explicitly think through:

```
EDGE CASES:
□ Empty input (empty string, empty array, null, undefined, 0)
□ Single item (array of 1, string of 1 char)
□ Maximum/boundary values
□ Invalid/malformed input
□ Network failures (if applicable)
□ Database failures (if applicable)
□ Concurrent execution (if applicable)
□ Partial success (if applicable)
```

For each unhandled edge case found: add handling or document the decision not to.

---

### Pass 4: Abstraction Review

```
ABSTRACTION CHECK:
□ Is there any duplicated logic that should be extracted?
□ Is there any extracted abstraction that serves only one caller? (inline it)
□ Are abstractions named for what they DO, not how they work?
□ Is any function longer than it needs to be?
□ Does each function have one clear responsibility?
□ Are there any hidden dependencies (global state, implicit assumptions)?
```

---

### Pass 5: Scope Review

```
SCOPE CHECK (against nvx-goal-preservation):
□ Does every line serve the original objective?
□ Were any features added that weren't in the plan?
□ Were any dependencies added that weren't planned?
□ Does the implementation match what the plan said to implement?
```

If scope drift is found: remove the addition or escalate for approval.

---

### Pass 6: Consistency Review

```
CONSISTENCY CHECK (against nvx-architectural-consistency):
□ Do new file names match the project's naming convention?
□ Do new functions follow existing naming patterns?
□ Is error handling consistent with the rest of the codebase?
□ Are imports ordered consistently?
□ Do types follow existing naming patterns?
```

---

## Review Output Format

After completing all passes, produce:

```
SELF-REVIEW REPORT:

Pass 1 — Correctness: [PASS / ISSUES FOUND]
  Issues: [list or "none"]

Pass 2 — Logic: [PASS / ISSUES FOUND]
  Issues: [list or "none"]

Pass 3 — Edge Cases: [PASS / ISSUES FOUND]
  Missing coverage: [list or "none"]

Pass 4 — Abstraction: [PASS / ISSUES FOUND]
  Issues: [list or "none"]

Pass 5 — Scope: [PASS / ISSUES FOUND]
  Drift detected: [list or "none"]

Pass 6 — Consistency: [PASS / ISSUES FOUND]
  Violations: [list or "none"]

OVERALL: [APPROVED FOR COMPLETION / REQUIRES FIXES]
Fixes required before completion: [list or "none"]
```

---

## When Issues Are Found

1. **Do not skip fixes** — every issue found in review must be resolved before completion
2. **Do not rationalize** — "it's minor" is not a valid reason to ship a known bug
3. **Fix the issue** → re-run the affected test → verify → continue review
4. **Re-run the impacted review pass** after fixing to confirm the fix is correct

---

## Red Flags — Review Required

- "The code looks right" (without reading it line by line)
- "I already tested it" (testing ≠ review)
- "It's a small change" (small changes have edge cases too)
- Completing a task without the self-review report
- Committing before review is complete

---

## Integration with Other Skills

Review does NOT replace:
- `nvx-verification` — still run commands and read output
- `nvx-tdd-enforcer` — tests must exist before review begins
- `nvx-goal-preservation` — scope is verified in Pass 5, not instead of it

Review IS the final check before `verification-before-completion` runs.

---

## The Bottom Line

Code that passes review is code you understand. Code you understand is code you can defend.

Read your own code. Find the problems before your users do.
