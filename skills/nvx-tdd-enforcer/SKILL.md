---
name: nvx-tdd-enforcer
description: Use when implementing any feature or fixing any bug — write the failing test FIRST, watch it fail, then write minimal implementation to pass; no production code without a prior failing test
---

# TDD Enforcer

## Overview

Writing code before a test is writing code without proof. You don't know if the code does what you think, you don't know if future changes break it, and you don't have documentation of intended behavior. Test-first development forces you to define what "correct" means before writing what "correct" looks like.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

**Violating the letter of this rule is violating the spirit of this rule.**

---

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A PRIOR FAILING TEST.
```

If you wrote code before the test, delete it. Start over.

This is not negotiable:
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Don't look at it to "stay efficient"
- Delete means delete

---

## The Red-Green-Refactor Cycle

```
RED → VERIFY RED → GREEN → VERIFY GREEN → REFACTOR → REPEAT
```

Each arrow is a mandatory step. No skipping.

---

### RED — Write the Failing Test

Write the smallest test that describes the desired behavior.

**Good test:**
```typescript
test('returns 404 when todo not found', async () => {
  const response = await request(app).get('/todos/nonexistent-id');
  expect(response.status).toBe(404);
  expect(response.body.error).toBe('Todo not found');
});
```
- One behavior
- Clear name (describes what should happen)
- Tests real behavior (not implementation details)

**Bad test:**
```typescript
test('todo works', async () => {
  const mock = jest.fn().mockResolvedValue(null);
  await getTodo(mock, 'id');
  expect(mock).toHaveBeenCalled();
});
```
- Vague name
- Tests mock behavior, not actual code
- No meaningful assertion

**Test Requirements:**
- One behavior per test
- Name must describe what SHOULD happen
- No mocks unless the real dependency is external/unavoidable
- Must be runnable immediately (before implementation exists)

---

### VERIFY RED — Watch It Fail

**MANDATORY. Never skip.**

```bash
[test command] [specific test file or test name]
```

**Confirm:**
- Test FAILS (not errors — a compile error is not a test failure)
- Failure message is what you expected
- Fails because the FEATURE IS MISSING, not due to syntax errors or wrong imports

**Test passes immediately?** You are testing existing behavior. Rewrite the test.

**Test errors (not fails)?** Fix the error (import, syntax, config). Rerun. Do not proceed until it FAILS correctly.

---

### GREEN — Minimal Implementation

Write the simplest code that makes the test pass.

**Good:**
```typescript
app.get('/todos/:id', async (req, res) => {
  const todo = await db.todos.findById(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  return res.json(todo);
});
```

**Bad (over-implemented):**
```typescript
app.get('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `todo:${id}`;
  const cached = await redis.get(cacheKey);  // ← not required by any test
  if (cached) return res.json(JSON.parse(cached));
  const todo = await db.todos.findById(id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  await redis.set(cacheKey, JSON.stringify(todo), 'EX', 300);  // ← not required
  return res.json(todo);
});
```

**Rules for GREEN:**
- Write ONLY what is needed to pass this specific test
- Do NOT add features not covered by a test
- Do NOT refactor other code "while you're here"
- Do NOT add configuration, options, or extensibility not required

---

### VERIFY GREEN — Watch It Pass

**MANDATORY.**

```bash
[test command]
```

**Confirm:**
- The new test PASSES
- All previously passing tests STILL PASS
- No new warnings or errors in output

**If the new test fails:** Fix the implementation. Do not modify the test.

**If other tests break:** Fix now. Do not move forward with broken tests.

---

### REFACTOR — Clean Up

After GREEN only. Keep tests passing throughout.

Allowed in refactor:
- Remove duplication
- Improve naming
- Extract well-named helpers
- Improve readability

NOT allowed in refactor:
- Adding new behavior
- Adding new abstraction without a failing test
- Changing what the code does (only HOW it does it)

After every refactor change: run tests to confirm still GREEN.

---

## Handling Existing Code (No Tests)

When adding to untested code:

1. **Write a characterization test first** — a test that documents current behavior
2. **Run it** — confirm it passes (documents what IS, not what should be)
3. **Now write the failing test** for the new behavior
4. **Proceed with TDD cycle normally**

You cannot TDD-extend code you don't understand. Characterize it first.

---

## TDD for Bug Fixes

```
Bug reported: [description]

1. REPRODUCE: Write a test that reproduces the bug → MUST FAIL
2. VERIFY FAIL: Run the test → confirm it fails (proves you caught the bug)
3. FIX: Implement the fix
4. VERIFY PASS: Run the test → confirm it passes (proves fix works)
5. REGRESSION: Run full suite → confirm nothing else broke
```

**Never fix a bug without a failing test first.**

---

## Common Rationalizations — All Rejected

| Rationalization | Reality |
|-----------------|---------|
| "Too simple to need a test" | Simple code breaks. Test takes 60 seconds. |
| "I'll write the test after to verify" | Tests written after code pass immediately. Proves nothing. |
| "I already manually tested it" | Manual testing doesn't prove edge cases and can't be re-run. |
| "Deleting X hours of work is wasteful" | Sunk cost. Keep it and you ship untested code. Delete and TDD. |
| "Tests after achieve the same goals" | Tests-after ask "what does it do?". Tests-first ask "what SHOULD it do?". |
| "This is different because..." | No exceptions without explicit approval. |

---

## Verification Checklist (Before Marking Complete)

- [ ] Every new function/method has at least one test
- [ ] Watched every test FAIL before implementing
- [ ] Every test failed for the RIGHT reason (missing feature, not syntax error)
- [ ] Wrote MINIMAL code to pass each test
- [ ] All tests pass (including pre-existing ones)
- [ ] No warnings in test output
- [ ] No mocks that test mock behavior instead of real behavior

Can't check all boxes? You skipped TDD. Delete and start over.

---

## Red Flags — Delete and Restart

- Writing production code before any test exists
- Test passes on first run before implementation
- "I'll add tests at the end"
- Keeping implementation code as "reference" while writing tests
- Mocking the unit under test
- Test is longer and more complex than the implementation
- "TDD doesn't make sense for this case"

**All of these mean: Delete the code. Start with the test.**

---

## The Bottom Line

```
Test exists and failed first → Production code
Otherwise → Not TDD → Not allowed
```
