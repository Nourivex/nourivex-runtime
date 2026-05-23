---
name: nvx-planner
description: Use when receiving any multi-step task or feature request — before writing a single line of code, create a structured roadmap with bite-sized tasks and explicit verification steps
---

# Planner

## Overview

Jumping straight to code is the fastest way to write the wrong thing correctly. Planning forces clarity: you can't write a task you can't explain. Every unclear task in the plan is an ambiguity that would have become a bug.

**Core principle:** No code without a plan. No plan without explicit verification steps.

**A plan is not a document you write to feel productive. It is a contract with the codebase.**

---

## The Iron Law

```
NO IMPLEMENTATION WITHOUT AN APPROVED PLAN.
NO PLAN WITHOUT EXPLICIT VERIFICATION FOR EVERY TASK.
```

---

## When to Use

Use for:
- Any feature that touches more than one file
- Any bug fix that requires understanding more than the immediate line
- Any refactoring task
- Any task where the full scope is not immediately obvious

**Exceptions (and only with explicit user approval):**
- Single-line config changes
- Typo fixes
- Documentation-only edits

---

## Planning Protocol

### Step 1: Understand Before Planning

Before opening the plan template:

```
UNDERSTANDING CHECK:
1. What is the exact deliverable? (One sentence)
2. What are the success criteria? (How do we know it's done?)
3. What is explicitly OUT of scope? (What we are NOT building)
4. What do I need to read/explore before planning? (Files, docs, APIs)
```

Explore the codebase. Read relevant files. Identify existing patterns. Then plan.

### Step 2: Map the File Structure

Before defining tasks, decide what changes:

```
FILE MAP:
- CREATE: exact/path/to/new-file.ts  [responsibility: ...]
- MODIFY: exact/path/to/existing.ts  [lines affected: ..., what changes: ...]
- TEST:   exact/path/to/test.ts      [tests covering: ...]
- DELETE: exact/path/to/old.ts       [reason: ...]
```

This is where architecture decisions get locked in. Think carefully here.

### Step 3: Write Bite-Sized Tasks

Each task is 2-5 minutes of work. If a task takes longer, break it down.

**Task granularity:**
- "Write the failing test" → one task
- "Run the test to confirm it fails" → one task
- "Write minimal implementation to pass" → one task
- "Verify all tests pass" → one task
- "Commit" → one task

---

## Plan Document Format

Save to: `docs/nourivex/plans/YYYY-MM-DD-<feature-name>.md`

```markdown
# [Feature Name] — Implementation Plan

**Goal:** [One sentence: what this builds]
**Objective Lock:** See nvx-goal-preservation — scope is locked to this plan.
**Architecture:** [2-3 sentences about approach]
**Stack:** [Key technologies]

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| CREATE | src/... | ... |
| MODIFY | src/... | ... |
| TEST   | tests/... | ... |

---

## Tasks

### Task 1: [Name]

**Files:**
- Modify: `exact/path.ts`
- Test: `tests/exact/path.test.ts`

- [ ] **Step 1:** Write the failing test
  ```typescript
  // [actual test code here — no placeholders]
  ```

- [ ] **Step 2:** Run test — MUST FAIL
  ```bash
  [exact command]
  ```
  Expected: FAIL — "[expected failure message]"

- [ ] **Step 3:** Write minimal implementation
  ```typescript
  // [actual implementation code]
  ```

- [ ] **Step 4:** Run test — MUST PASS
  ```bash
  [exact command]
  ```
  Expected: PASS — [X] tests passed

- [ ] **Step 5:** Commit
  ```bash
  git add [files]
  git commit -m "feat: [description]"
  ```

### Task 2: [Name]
[... same structure ...]

---

## Completion Criteria

- [ ] All tasks checked
- [ ] All tests passing: `[full test suite command]`
- [ ] Linter clean: `[lint command]`
- [ ] Requirements verified against original objective
```

---

## Plan Quality Rules

**NO PLACEHOLDERS.** These are plan failures:
- "TBD", "TODO", "implement later"
- "Add appropriate error handling"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the actual code)
- "Handle edge cases"
- References to types/functions not defined anywhere in the plan

**Every step must contain:**
- The actual code (not a description of what code to write)
- The exact command to run
- The expected output of that command

---

## Self-Review (After Writing the Plan)

Before presenting the plan:

```
PLAN SELF-REVIEW:
1. Spec coverage: Can I point to a task for every requirement?
   Gaps found: [list or "none"]

2. Placeholder scan: Any TBD, TODO, vague steps?
   Violations found: [list or "none"]

3. Type consistency: Do types/names in Task 3 match what Task 1 defined?
   Mismatches found: [list or "none"]

4. Scope check: Does any task go beyond the objective lock?
   Violations found: [list or "none"]
```

Fix all issues before presenting.

---

## Red Flags — Stop and Plan

- Starting to write implementation code without a saved plan
- "The plan is clear in my head" (heads are not version controlled)
- A task that is "write the feature" without sub-steps
- Verification steps that say "check if it works" without a specific command
- Plan that is shorter than the implementation it describes

---

## The Bottom Line

A plan takes 10 minutes. Getting lost in implementation without a plan costs hours.

Write the plan. Get it approved. Then code.
