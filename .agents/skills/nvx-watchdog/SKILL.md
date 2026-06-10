---
name: nvx-watchdog
description: Use aggressively throughout implementation to detect requirement drift, hallucinated features, and unrelated implementation — more aggressive than goal-preservation. Logs all alerts to persistent goal file for cross-session audit trail.
---

# Scope Watchdog

## Overview

Scope Watchdog is the aggressive enforcement arm of goal-preservation. Where goal-preservation locks the objective at the start, Scope Watchdog patrols continuously during implementation — file by file, function by function — and triggers an immediate halt when anything appears that was not explicitly requested.

**Core principle:** If it wasn't in the plan, it doesn't go in the code. Zero tolerance.

**Every alert is logged to `.nourivex/goals/_active.json` for audit trail.**

**This skill is intentionally aggressive. False positives (raising alarm on legitimate work) are acceptable. False negatives (missing scope drift) are not.**

---

## The Iron Law

```
ANYTHING NOT EXPLICITLY IN THE APPROVED PLAN IS UNAUTHORIZED UNTIL APPROVED.
ALL ALERTS ARE PERSISTED. THE AUDIT TRAIL IS PERMANENT.
```

The burden of proof is on the addition, not the alarm.

---

## Session Start Patrol

At the beginning of every session, before any implementation:

```
[WATCHDOG BOOT] 🐕 Scope Watchdog is active.

Reading .nourivex/goals/_active.json...

CASE A — Active goal found:
  🎯 Active Goal: {title}
  📜 Objective: {objective}
  ⚠️ Previous Scope Alarms: {N} alerts on record
  
  [WATCHDOG LOCKED] Patrolling against: {objective}
  
  Last 3 alerts (if any):
  - [{timestamp}] {driftType}: {description} → {resolution}
  
  Continuing patrol...

CASE B — No active goal:
  ⚠️ No active goal found in .nourivex/goals/_active.json
  Recommend running nvx-goal-preservation first.
  Proceeding without goal lock — Watchdog in permissive mode.
```

---

## Scope Watchdog Trigger Conditions

The Watchdog activates (halts and raises alarm) when ANY of the following is detected:

### Category 1: Hallucinated Requirements
- Implementing a feature the user never mentioned
- Assuming "they probably want X too"
- Adding "just in case" handling for scenarios not in the spec
- Implementing behaviors not validated in any approved test

### Category 2: Requirement Drift
- The objective has subtly shifted from what was originally locked
- A feature is being implemented "better" than requested without approval
- The solution is more general than the problem required
- Edge cases being handled that the user never mentioned

### Category 3: Unrelated Implementation
- Touching files not in the plan's file map
- Refactoring code that wasn't scheduled for changes
- Fixing "while I'm here" issues unrelated to the task
- Adding imports/dependencies not in the plan

### Category 4: Over-completion
- Building the v2 version when v1 was approved
- Implementing the full feature set when MVP was approved
- Adding configuration for things that should be constants
- Building for scale when no scale requirement exists

---

## Watchdog Alert Format + Persistence

When scope drift is detected, halt immediately and:

**1. Issue the alert:**

```
🚨 SCOPE WATCHDOG ALERT 🚨

Drift type: [Hallucinated Requirement / Requirement Drift / Unrelated Implementation / Over-completion]

What was being added: [specific description]
Where: [file/function/line]

Original scope:
  Plan reference: [task/step that is currently being executed]
  Approved objective: [restate the lock from goal-preservation]

Is this addition covered by the approved plan?
  [ ] YES — proceed (explain which plan item covers it)
  [ ] NO  — HALT. Choose:
    A) Remove the addition → continue with approved scope
    B) Escalate → pause, get explicit user approval, update plan
```

**2. Log to persistent goal file (always, regardless of resolution):**

Append to `scopeAlarms[]` in `.nourivex/goals/_active.json`:

```json
{
  "timestamp": "2026-06-10T01:30:00Z",
  "driftType": "Feature Creep",
  "description": "Was about to add WebSocket support to the REST API handler",
  "where": "src/routes/todos.ts:45",
  "planReference": "Task 3: Implement GET /todos",
  "resolution": "skipped",
  "notes": "User confirmed: REST only, no WebSocket needed"
}
```

**3. Confirm logging:**
```
[WATCHDOG LOGGED] 🐕 Alert recorded in .nourivex/goals/_active.json
scopeAlarms: {N} total alerts on record
```

Do NOT proceed past a Watchdog Alert without resolution.

---

## Continuous Monitoring Points

Run a Watchdog check at each of these points:

| Point | Check |
|-------|-------|
| Before creating a new file | Is this file in the plan's file map? |
| Before adding a new function | Was this function specified in the plan? |
| Before adding a dependency | Was this dependency planned? |
| Before touching a file not in the plan | Is this modification required? |
| Before adding error handling | Was this error case in scope? |
| After writing a function | Does this function do ONLY what the plan said? |
| Before each commit | Do the staged changes contain ONLY planned work? |

---

## Domain Rules Check

Before every implementation cycle, check `.nourivex/memory/project-map/domain-rules.json` (if it exists):

```
[DOMAIN RULES CHECK] 📋
Loading .nourivex/memory/project-map/domain-rules.json...

Active rules:
- rule-001 [CRITICAL]: Never expose raw DB errors to client
- rule-002 [HIGH]: All timestamps must be UTC ISO 8601

Current implementation... ✅ complies with all domain rules.
```

If a domain rule would be violated → **immediate SCOPE ALARM**, severity: CRITICAL.

---

## Drift vs. Legitimate Discovery

Not all deviations from the plan are drift. Some are legitimate discoveries:

**Legitimate (proceed with documentation):**
- A security vulnerability that makes the feature unsafe to ship as-is
- A critical bug in a dependency that blocks the planned approach
- A technical impossibility with the planned approach

**NOT Legitimate (Watchdog triggers):**
- "This way is cleaner"
- "We'll need this eventually"
- "The user would appreciate this"
- "This is standard practice"
- "It only adds a few lines"

**The test:** Would a user who reads only the original request understand why this code exists? If not — Watchdog alert.

---

## Automated Hook Guidelines

Before claiming any task is complete or switching to a new context, the Watchdog MUST enforce an automated verification hook.

**Protocol:** Execute strict CLI commands to verify system state:
1. Run `git status --porcelain` or `git diff --name-only`
2. Compare the output strictly against the approved FILE MAP
3. If any file outside the FILE MAP is modified → HALT immediately, raise Watchdog Alert, log it

## Commit Scope Verification

Before every commit, run:

```
COMMIT SCOPE VERIFICATION:
1. Run: git diff --stat
2. For every changed file: is it in the plan's file map?
3. For every added function: is it covered by an approved test?
4. For every new dependency: was it planned?

PASS: All changes trace to the approved plan → proceed to commit
FAIL: Watchdog alert — identify, log, then remove/escalate unplanned changes
```

---

## Escalation Protocol

When a Watchdog alert is raised and the addition might be genuinely valuable:

1. **STOP all implementation** — do not mix approved and unapproved work
2. **Document the proposed addition** with exact description and justification
3. **Present to user** for explicit approval
4. **If approved:** Update plan, update objective lock in `_active.json`, then implement
5. **If not approved:** Remove the addition, log resolution as "rejected"

There is no "implement now, ask forgiveness later."

---

## Relationship to Other Skills

| Skill | Role |
|-------|------|
| `nvx-goal-preservation` | Locks the objective, maintains `_active.json` |
| `nvx-watchdog` | Enforces the lock, logs all alerts to `_active.json` |
| `nvx-reviewer` | Reviews for scope violations in Pass 5 after implementation |
| `nvx-planner` | Defines the approved scope, FILE MAP is the law |
| `nvx-superpower-memory` | Domain rules in `project-map/` are additional constraints |

Watchdog is the runtime enforcement of the plan. Goal-preservation is the contract; Watchdog is the auditor. Memory is the constitution.

---

## Red Flags — Immediate Watchdog Trigger

- Any new file not in the plan's file map
- Any function not covered by an approved failing test
- Any "improvement" that wasn't asked for
- "I noticed X so I fixed it" → ALERT
- "I added Y because it seemed useful" → ALERT
- The implementation is larger than the plan suggested
- Adding logging/metrics/monitoring that wasn't planned
- "Future-proofing" anything

---

## The Bottom Line

You are not building what you think is best. You are building what was approved.

If you think something should be added, stop and ask. The user decides. Not you. And every alert you raise is recorded — so the discipline is auditable.
