import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod/v3';

/**
 * Register all Nourivex prompt templates on the MCP server.
 *
 * Prompts are structured workflow guides that return actionable checklists.
 * Each prompt accepts typed arguments and returns a user message with
 * context-injected instructions.
 */
export function registerPrompts(server: McpServer): void {
  // ── 1. Watchdog ────────────────────────────────────────────────────
  server.prompt(
    'watchdog',
    'Scope drift detection checklist — use during implementation to patrol against requirement drift',
    { objective: z.string(), outOfScope: z.array(z.string()) },
    ({ objective, outOfScope }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `## Scope Watchdog Patrol

**Objective:** ${objective}

**Out of Scope:**
${outOfScope.length > 0 ? outOfScope.map((o) => `- ${o}`).join('\n') : '- (none specified)'}

---

### Detection Checklist

Run this check at every implementation step:

| Check Point | Action |
|---|---|
| Before creating a new file | Is this file in the plan's file map? |
| Before adding a new function | Was this function specified in the plan? |
| Before adding a dependency | Was this dependency planned? |
| Before touching a file not in the plan | Is this modification required? |
| Before adding error handling | Was this error case in scope? |
| After writing a function | Does this function do ONLY what the plan said? |
| Before each commit | Do staged changes contain ONLY planned work? |

### Trigger Conditions — Halt if ANY detected:

**Hallucinated Requirements**
- Implementing a feature the user never mentioned
- Adding "just in case" handling not in the spec

**Requirement Drift**
- Objective subtly shifted from original
- Feature implemented "better" than requested without approval
- Solution more general than the problem required

**Unrelated Implementation**
- Touching files not in the plan's file map
- Refactoring code not scheduled for changes
- "While I'm here" fixes unrelated to the task

**Over-completion**
- Building v2 when v1 was approved
- Implementing full feature set when MVP was approved
- Building for scale when no scale requirement exists

### Alert Format

When scope drift is detected:

\`\`\`
SCOPE WATCHDOG ALERT

Drift type: [Hallucinated / Drift / Unrelated / Over-completion]
What was being added: [description]
Where: [file/function/line]

Original scope:
  Plan reference: [current task/step]
  Approved objective: [restate the lock]

Is this addition covered by the approved plan?
  YES — proceed (explain which plan item)
  NO  — HALT. Choose:
    A) Remove the addition → continue with approved scope
    B) Escalate → pause, get explicit user approval
\`\`\`

### Resolution Options

1. **Remove** — delete the addition, continue with approved scope
2. **Escalate** — pause, present justification to user, get explicit approval
3. **Document** — if the deviation is a legitimate discovery (security vulnerability, critical bug), document and proceed

### The Iron Law

If it wasn't in the plan, it doesn't go in the code. The burden of proof is on the addition, not the alarm.`,
          },
        },
      ],
    }),
  );

  // ── 2. TDD Cycle ──────────────────────────────────────────────────
  server.prompt(
    'tdd-cycle',
    'TDD red-green-refactor workflow — write failing test first, then implement',
    {
      taskTitle: z.string(),
      testFile: z.string(),
      implFile: z.string(),
    },
    ({ taskTitle, testFile, implFile }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `## TDD Red-Green-Refactor Cycle

**Task:** ${taskTitle}
**Test file:** \`${testFile}\`
**Implementation file:** \`${implFile}\`

---

### Phase 1: RED — Write the Failing Test

Write the smallest test that describes the desired behavior in \`${testFile}\`.

**Requirements:**
- One behavior per test
- Name must describe what SHOULD happen
- No mocks unless the real dependency is external/unavoidable
- Must be runnable immediately (before implementation exists)

**Good test:**
\`\`\`typescript
test('returns 404 when todo not found', async () => {
  const response = await request(app).get('/todos/nonexistent-id');
  expect(response.status).toBe(404);
  expect(response.body.error).toBe('Todo not found');
});
\`\`\`

**Verify RED:**
\`\`\`bash
# Run the test — it MUST FAIL
npm test -- --grep '${taskTitle}'
\`\`\`

**Valid RED state:** Test FAILS (not errors). Failure comes from an assertion failing or the deliberate absence of business logic.

**If test passes:** You're testing existing behavior. Rewrite the test.
**If test errors:** Fix the error (import, syntax, config). Do not proceed until it FAILS correctly.

---

### Phase 2: GREEN — Minimal Implementation

Write the simplest code that makes the test pass in \`${implFile}\`.

**Rules:**
- Write ONLY what is needed to pass this specific test
- Do NOT add features not covered by a test
- Do NOT refactor other code "while you're here"
- Do NOT add configuration, options, or extensibility not required

**Verify GREEN:**
\`\`\`bash
# Run the test — it MUST PASS
npm test -- --grep '${taskTitle}'

# Run full suite — no regressions
npm test
\`\`\`

**Valid GREEN state:** New test passes AND all previously passing tests still pass.

---

### Phase 3: REFACTOR — Clean Up

After GREEN only. Keep tests passing throughout.

**Allowed:**
- Remove duplication
- Improve naming
- Extract well-named helpers
- Improve readability

**NOT allowed:**
- Adding new behavior
- Adding new abstraction without a failing test
- Changing what the code does (only HOW it does it)

**After every refactor change:** run tests to confirm still GREEN.

---

### Verification Checklist

- [ ] Every new function/method has at least one test
- [ ] Watched every test FAIL before implementing
- [ ] Every test failed for the RIGHT reason
- [ ] Wrote MINIMAL code to pass each test
- [ ] All tests pass (including pre-existing ones)
- [ ] No warnings in test output

---

### The Iron Law

No production code without a prior failing test. If you wrote code before the test, delete it and start over.`,
          },
        },
      ],
    }),
  );

  // ── 3. Review 7-Pass ──────────────────────────────────────────────
  server.prompt(
    'review-7pass',
    '7-pass code review protocol — catch logic flaws, edge cases, scope violations',
    {
      files: z.array(z.string()),
      objective: z.string(),
    },
    ({ files, objective }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `## 7-Pass Code Review Protocol

**Objective:** ${objective}
**Files to review:**
${files.map((f) => `- \`${f}\``).join('\n')}

---

### Pass 1: Correctness Review

Read every new/modified line with fresh eyes:

\`\`\`
CORRECTNESS CHECK:
□ Does this actually solve the stated requirement?
□ Are there off-by-one errors, boundary conditions, null cases?
□ Are all error paths handled explicitly?
□ Could this fail silently without any visible error?
□ Are all async operations awaited?
□ Are all conditional branches covered?
\`\`\`

### Pass 2: Logic Review

\`\`\`
LOGIC CHECK:
□ Does the flow make logical sense end-to-end?
□ Are there any dead code paths?
□ Are there any impossible conditions (always true/false)?
□ Are there any race conditions or ordering dependencies?
□ Would this behave correctly with empty inputs?
□ Would this behave correctly with maximum/extreme inputs?
\`\`\`

### Pass 3: Edge Case Review

\`\`\`
EDGE CASES:
□ Empty input (empty string, empty array, null, undefined, 0)
□ Single item (array of 1, string of 1 char)
□ Maximum/boundary values
□ Invalid/malformed input
□ Network/database failures (if applicable)
□ Concurrent execution (if applicable)
\`\`\`

### Pass 4: Abstraction Review

\`\`\`
ABSTRACTION CHECK:
□ Is there any duplicated logic that should be extracted?
□ Is there any extracted abstraction that serves only one caller? (inline it)
□ Are abstractions named for what they DO, not how they work?
□ Is any function longer than it needs to be?
□ Does each function have one clear responsibility?
□ Are there any hidden dependencies?
\`\`\`

### Pass 5: Scope Review

\`\`\`
SCOPE CHECK (against objective lock):
□ Does every line serve the original objective?
□ Were any features added that weren't in the plan?
□ Were any dependencies added that weren't planned?
□ Does the implementation match what the plan said to implement?
\`\`\`

### Pass 6: Consistency Review

\`\`\`
CONSISTENCY CHECK (against codebase conventions):
□ Do new file names match the project's naming convention?
□ Do new functions follow existing naming patterns?
□ Is error handling consistent with the rest of the codebase?
□ Are imports ordered consistently?
□ Do types follow existing naming patterns?
\`\`\`

### Pass 7: Memory Capture

After all prior passes are clean:

\`\`\`
MEMORY CAPTURE GATE:
□ Is there a reusable implementation pattern?       [yes/no]
□ Was there a non-obvious bug worth recording?      [yes/no]
□ Did we discover a library constraint?             [yes/no]
□ Did the user approve a specific pattern?          [yes/no]

If any YES → store to persistent memory.
If all NO  → no memory capture needed.
\`\`\`

---

### Output Format

\`\`\`
SELF-REVIEW REPORT:

Pass 1 — Correctness: [PASS / ISSUES FOUND]
Pass 2 — Logic: [PASS / ISSUES FOUND]
Pass 3 — Edge Cases: [PASS / ISSUES FOUND]
Pass 4 — Abstraction: [PASS / ISSUES FOUND]
Pass 5 — Scope: [PASS / ISSUES FOUND]
Pass 6 — Consistency: [PASS / ISSUES FOUND]
Pass 7 — Memory Capture: [STORED / SKIPPED]

OVERALL: [APPROVED FOR COMPLETION / REQUIRES FIXES]
\`\`\`

**No completion claim without a completed self-review.**`,
          },
        },
      ],
    }),
  );

  // ── 4. Debugging ──────────────────────────────────────────────────
  server.prompt(
    'debugging',
    'Hypothesis-driven debugging protocol — systematic bug investigation',
    {
      symptom: z.string(),
      expectedBehavior: z.string(),
    },
    ({ symptom, expectedBehavior }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `## Systematic Debugging Protocol

**Symptom:** ${symptom}
**Expected behavior:** ${expectedBehavior}

---

### Phase 1: Root Cause Investigation

**Before ANY fix attempt:**

**1. Read the Error Message Completely**
- Note: exact error text, file path, line number, error code
- Often the error message IS the root cause

**2. Reproduce Consistently**
\`\`\`
Reproduction check:
- Can I trigger this reliably? [yes/no]
- What are the exact steps? [list them]
- Does it happen every time? [yes/sometimes/rarely]
- If not reproducible → gather more data, do NOT guess
\`\`\`

**3. Check Recent Changes**
\`\`\`bash
git diff HEAD~1
git log --oneline -10
\`\`\`

**4. Trace the Data Flow**
\`\`\`
Backward trace from error:
- Error occurs at: [location]
- Called by: [caller] with [what data]
- Caller received data from: [source] as [what data]
- ... keep tracing until the source of the bad value is found
- Fix at source, NOT at the point of error
\`\`\`

### Phase 2: Pattern Analysis

1. Find working examples — similar working code in the codebase
2. Compare working vs. broken — list every difference
3. Check reference implementation — read the docs fully
4. Understand dependencies — config, environment, state assumptions

### Phase 3: Hypothesis Formation

Form ONE hypothesis at a time:

\`\`\`
HYPOTHESIS:
- Root cause: [specific, clear statement]
- Evidence: [what I observed]
- Test: [smallest change that proves/disproves]
- Expected result if correct: [specific outcome]
\`\`\`

Rules:
- One hypothesis at a time
- Make the SMALLEST possible change to test it
- If wrong → form NEW hypothesis (do NOT stack fixes)

### Phase 4: Fix and Verify

1. **Write a failing test first** — minimal reproduction of the bug
2. **Implement ONE fix** — address root cause, one change at a time
3. **Verify the fix:**
\`\`\`bash
# Test passes?
npm test -- --grep 'bug description'

# No regressions?
npm test

# Original symptom gone?
# Manual verification
\`\`\`

---

### 3-Strike Rule

\`\`\`
After 2 failed fixes: STOP. Run State Dump Protocol.
After 3 failed fixes: STOP. Question the architecture.
\`\`\`

**State Dump (mandatory on 2nd strike):**
- Variable values right before the crash
- Exact input that triggered the error
- Call stack and structural state at failure moment

**3+ failed fixes = architectural problem, not a bug fix.**

---

### The Iron Law

No fixes without root cause identified first. Random guessing wastes time and introduces new bugs.`,
          },
        },
      ],
    }),
  );

  // ── 5. Planning ───────────────────────────────────────────────────
  server.prompt(
    'planning',
    'Implementation planning workflow — break work into atomic TDD tasks',
    {
      objective: z.string(),
      successCriteria: z.array(z.string()),
    },
    ({ objective, successCriteria }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `## Implementation Planning Workflow

**Objective:** ${objective}

**Success Criteria:**
${successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

---

### Step 1: Understand Before Planning

\`\`\`
UNDERSTANDING CHECK:
1. What is the exact deliverable? (One sentence)
2. What are the success criteria?
3. What is explicitly OUT of scope?
4. What do I need to read before planning? (Files, docs, APIs)
5. Is there relevant memory to recall?
\`\`\`

### Step 2: Map the File Structure

\`\`\`
FILE MAP:
- CREATE: exact/path/to/new-file.ts  [responsibility: ...]
- MODIFY: exact/path/to/existing.ts  [what changes: ...]
- TEST:   exact/path/to/test.ts      [tests covering: ...]
\`\`\`

### Step 3: Write Bite-Sized Tasks

Each task is 2-5 minutes of work. If it takes longer, break it down.

**Task granularity:**
- "Write the failing test" → one task
- "Run the test to confirm it fails" → one task
- "Write minimal implementation to pass" → one task
- "Verify all tests pass" → one task
- "Commit" → one task

**Task format:**
\`\`\`
Task N: [Name]
Files: [exact paths]
Steps:
  1. [Write failing test] — code: [...]
  2. [Run test] — command: [exact command], expected: FAIL
  3. [Implement] — code: [...]
  4. [Run test] — command: [exact command], expected: PASS
  5. [Update todo] — [TODO UPDATE] task-N → completed
  6. [Commit] — git add [...] && git commit -m "feat: [...]"
\`\`\`

### Step 4: Risk Identification

For each task, identify:
- Dependencies on other tasks (blocking relationships)
- Potential pitfalls or unknowns
- Estimated complexity (low/medium/high)

### Step 5: Plan Self-Review

Before presenting the plan:

\`\`\`
PLAN SELF-REVIEW:
1. Spec coverage: Can I point to a task for every requirement?
2. Placeholder scan: Any TBD, TODO, vague steps?
3. Type consistency: Do types/names match across tasks?
4. Scope check: Does any task go beyond the objective?
5. Todo coverage: Does every plan task map to a todo item?
\`\`\`

### Step 6: Persist as Todo List

After plan approval, create the persistent todo list in \`.nourivex/todos/\`:
- Each task gets a unique ID
- Progress is tracked automatically
- Survives session restarts

---

### Plan Quality Rules

**NO PLACEHOLDERS.** These are plan failures:
- "TBD", "TODO", "implement later"
- "Add appropriate error handling"
- "Write tests for the above" (without actual test code)
- "Handle edge cases"

**Every step must contain:**
- The actual code (not a description)
- The exact command to run
- The expected output of that command

---

### The Iron Law

No implementation without an approved plan. No plan without explicit verification for every task.`,
          },
        },
      ],
    }),
  );
}
