---
name: nvx-verification
description: Use before claiming any work is complete, fixed, or passing — requires running actual verification commands and reading output before any success claim; no "should work" allowed
---

# Verification Before Completion

## Overview

Claiming work is done without proof is not confidence — it is deception. Whether from laziness, time pressure, or false certainty, unverified completion claims destroy trust and ship broken code.

**Core principle:** Evidence before claims. Always. No exceptions.

**Violating the letter of this rule is violating the spirit of this rule.**

---

## The Iron Law

```
NO COMPLETION CLAIM WITHOUT FRESH VERIFICATION EVIDENCE IN THIS SESSION.
```

If you did not run the command in this message, you cannot claim it passes.

---

## The Gate Function

Before claiming ANY form of completion, run this protocol:

```
VERIFICATION GATE:
1. IDENTIFY  → What command proves this claim?
2. RUN       → Execute the FULL command now (not cached, not assumed)
3. READ      → Read the COMPLETE output — exit code, error count, warnings
4. EVALUATE  → Does output confirm the claim?
   - NO  → Report actual state with evidence
   - YES → State claim WITH the evidence attached
5. CLAIM     → Only now may you state completion
```

Skipping any step = lying, not verifying.

---

## Verification Matrix

| Claim | Required Evidence | NOT Sufficient |
|-------|-------------------|----------------|
| "Tests pass" | Test runner output: 0 failures | Previous run, "should pass", code looks right |
| "Linter clean" | Linter output: 0 errors/warnings | Partial check, file-by-file assumption |
| "Build succeeds" | Build command: exit code 0 | Linter passing, logs look okay |
| "Bug is fixed" | Original symptom reproduced and resolved | Code changed, "should be fixed" |
| "API works" | Actual HTTP request + response captured | "Endpoint looks correct" |
| "No regressions" | Full test suite passed | Subset passed |
| "Agent completed" | VCS diff reviewed + output read | Agent self-report of "success" |
| "Requirements met" | Line-by-line checklist verified | "Tests pass" |

---

## Forbidden Phrases

These phrases are banned before verification is complete:

- "Should work now"
- "Looks good"
- "Seems fine"
- "Probably fixed"
- "I'm confident this is correct"
- "This should pass"
- "I believe it works"
- "It appears to be working"
- "Done!" / "Complete!" / "Finished!" / "Perfect!" ← before running verification

Every one of these triggers the Gate Function. No exceptions.

---

## Verification by Category

### Code Implementation
```bash
# Run the specific test for what you just implemented
[test command] [specific test path]

# Expected output to look for:
# ✅ X tests passed, 0 failed
# ❌ Any failure = not complete
```

### Bug Fix (TDD Red-Green Verification)
```
1. Write regression test → RUN → MUST FAIL (proves test catches the bug)
2. Apply fix
3. RUN SAME TEST → MUST PASS (proves fix works)
4. RUN FULL SUITE → MUST PASS (proves no regressions)
```

Skipping the RED phase means you don't know if your test actually catches the bug.

### Build Verification
```bash
[build command]
# Read: exit code, error count, warning count
# PASS = exit 0, 0 errors
# Not PASS = incomplete
```

### API / Integration Verification
```bash
curl -X [METHOD] [URL] -H "Content-Type: application/json" -d '[payload]'
# Read: status code, response body
# Expected: [specific expected response]
```

### Requirements Checklist
```
REQUIREMENTS VERIFICATION:
[ ] Requirement 1: [how verified] → [result]
[ ] Requirement 2: [how verified] → [result]
[ ] Requirement N: [how verified] → [result]

All checked? → Complete
Any unchecked? → Incomplete
```

---

## Agent Delegation Protocol

When a subagent or tool reports "success":

```
AGENT VERIFICATION:
1. Do NOT trust the agent's self-report
2. Read the actual VCS diff — what changed?
3. Run the verification command independently
4. Read the output yourself
5. ONLY THEN accept or reject the agent's work
```

"The agent said it succeeded" is not evidence.

---

## When Verification Fails

If verification reveals failure after you thought it was complete:

1. **Do not hide it** — state the actual result with evidence
2. **Return to debugging** — use `nvx-systematic-debugging`
3. **Do not claim partial completion** — "70% done" is not done
4. **Fix and re-verify** — run the full gate again from scratch

---

## Red Flags — Stop and Verify

If you catch yourself:
- Expressing satisfaction before running a command
- About to say "done" based on visual inspection
- Trusting a cached test result from earlier
- Relying on partial verification ("this file looks right")
- Being tired and wanting to wrap up
- Thinking "just this once, skip verification"

**ALL of these mean: Run the verification command. Right now.**

---

## The Bottom Line

Run the command. Read the output. THEN make the claim.

This is non-negotiable. No shortcuts. No exceptions.

Evidence before claims, always.
