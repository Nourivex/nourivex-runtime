---
name: nvx-goal-preservation
description: Use at the START of every task and continuously throughout to lock the original objective and prevent scope drift, feature creep, or overengineering from derailing the mission
---

# Goal Preservation

## Overview

AI agents drift. They add features you didn't ask for, solve adjacent problems, and arrive at destinations you never requested. Goal Preservation is the anchor that keeps every action tied to the original objective.

**Core principle:** Every action, every file change, every line of code must serve the original objective. If it doesn't, it doesn't happen.

**Violating the letter of this rule is violating the spirit of engineering discipline.**

---

## The Iron Law

```
NO ACTION IS TAKEN UNLESS IT DIRECTLY SERVES THE ORIGINAL OBJECTIVE.
```

If you cannot draw a direct line from an action to the stated goal, **stop and ask**.

---

## Step 1: Lock the Objective

At the start of EVERY task, extract and state the objective explicitly.

**Format:**
```
OBJECTIVE LOCK:
- What: [Exact deliverable in one sentence]
- Success criteria: [How we know it's done]
- Out of scope: [What we are NOT building]
```

**Example:**

User: "Buat Todo API"

```
OBJECTIVE LOCK:
- What: A REST API with CRUD endpoints for a Todo resource
- Success criteria: POST, GET, PUT, DELETE /todos returns correct responses with persistence
- Out of scope: Authentication, WebSocket, AI features, event sourcing, microservices, recommendation engine
```

Post this lock at the start. Do not skip it.

---

## Step 2: Continuous Scope Monitoring

Before implementing ANY feature, component, or abstraction, run this check:

```
SCOPE CHECK:
- Is this required by the original objective? [yes/no]
- Did the user request this explicitly? [yes/no]
- Can the objective be achieved WITHOUT this? [yes/no]

If any answer is "no" → STOP. Flag it. Do not implement.
```

---

## Drift Patterns — Recognize and Stop

These are the most common drift patterns. When you see them, halt immediately:

| Drift Pattern | Example | Correct Response |
|---------------|---------|-----------------|
| **Feature Creep** | Adding WebSocket to a REST API | "Not in scope. Original goal is REST only." |
| **Premature Abstraction** | Creating a plugin system when one implementation suffices | "YAGNI. Build the one implementation." |
| **Gold Plating** | Adding caching when response times aren't a requirement | "No performance requirement stated. Skip." |
| **Problem Jumping** | Fixing unrelated code while working on a feature | "Out of scope. Log it, don't touch it." |
| **Requirement Hallucination** | "We'll need auth eventually so I'll add it now" | "Not requested. Not happening." |
| **Tech Novelty** | Switching to a new library because it's "better" | "The existing approach satisfies the objective." |

---

## When to Raise a Scope Alarm

Announce clearly when drift is detected:

```
⚠️ SCOPE ALARM:
[Proposed action] is NOT part of the original objective.

Original objective: [restate the lock]
Proposed addition: [what was about to happen]

Options:
A) Skip it — proceed with original scope
B) Update the objective — get explicit user approval first

Which do you prefer?
```

Do NOT silently add things. Do NOT assume "the user would want this."

---

## Red Flags — STOP Immediately

- "While I'm here, I'll also..."
- "We'll probably need this later..."
- "This is a good opportunity to refactor..."
- "Let me add a more robust solution..."
- "I'll make this more flexible/scalable/extensible..."
- "This pattern would be cleaner if..."
- Adding dependencies not in the original requirements
- Changing architecture "to support future requirements"

Every one of these means: **STOP. Return to the Objective Lock.**

---

## Objective Update Protocol

If the user genuinely wants to extend the scope:

1. **Pause current work** — do not mix old and new scope
2. **Restate the new objective** — update the lock formally
3. **Evaluate impact** — does this invalidate existing work?
4. **Get explicit approval** — "New scope locked. Proceeding." only after confirmation

---

## Quick Reference

| Situation | Action |
|-----------|--------|
| Starting a task | Post Objective Lock immediately |
| Before adding any component | Run Scope Check |
| Detecting drift | Issue Scope Alarm, wait for approval |
| User suggests new feature | Pause, update lock, get approval |
| Uncertain if in scope | Default to NO, ask first |

---

## The Bottom Line

Build what was asked. Nothing more. Nothing less.

Every extra feature is a liability: more bugs, more maintenance, more complexity, less focus. The best code is the code that wasn't written.
