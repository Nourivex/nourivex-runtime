---
name: nourivex-runtime
description: "Provider-agnostic AI engineering framework with 16 discipline skills and 5 specialized agents. Enforces Research → Architecture → Planning → TDD Execution workflow. Use for any software engineering task to ensure quality and discipline."
---

# Nourivex Runtime - Engineering Discipline Framework

**Nourivex Runtime** is a provider-agnostic AI engineering framework that enforces a strict **Research → Architecture → Planning → TDD Execution** workflow with 16 built-in skills and 5 specialized agents.

## When to Apply

This skill should be used when the task involves **software engineering, code implementation, debugging, or any technical work that requires disciplined approach**.

### Must Use

This skill must be invoked in the following situations:

- Implementing any new feature or bug fix
- Working on multi-step technical tasks
- Debugging complex issues
- Refactoring existing code
- Any task that requires test-driven development
- Architecture decisions or system design

### Recommended

This skill is recommended in the following situations:

- Code review or quality assurance
- Performance optimization
- Security-related implementations
- Integration with external systems

### Skip

This skill is not needed in the following situations:

- Simple text editing or documentation
- Non-technical tasks
- Quick one-line fixes (though TDD discipline still applies)

## The 5-Phase Workflow

Every task MUST follow this sequence:

```
Phase 1: Research → Phase 2: Architecture → Phase 3: Planning → Phase 4: TDD Execution → Phase 5: Review
```

### Phase 1: Research (nvx-researcher)
- Explore context using native tools
- Identify existing patterns and constraints
- Analyze dependencies
- Propose 2-3 technical approaches

### Phase 2: Architecture (nvx-architect)
- Define component boundaries
- Design data models
- Specify APIs
- Establish folder structure

### Phase 3: Planning (nvx-planner)
- Break work into atomic tasks
- Create TDD roadmap
- Identify risks
- Define verification steps

### Phase 4: TDD Execution (nvx-implementer)
- Write failing tests first
- Implement minimal code to pass
- Refactor while keeping tests green
- Run full test suite

### Phase 5: Review (nvx-reviewer)
- Critical code review
- Edge case verification
- Scope drift detection
- Architecture consistency check

## The 16 Discipline Skills

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `nvx-goal-preservation` | Lock objective at task start | Start of every task |
| `nvx-watchdog` | Patrol for scope drift | During implementation |
| `nvx-tdd-enforcer` | Test-first discipline | Before writing any code |
| `nvx-anti-overengineering` | Enforce simplicity & YAGNI | Design decisions |
| `nvx-architectural-consistency` | Match naming/pattern conventions | Adding files/components |
| `nvx-verification` | Verify before completion claims | Before claiming "done" |
| `nvx-reviewer` | Adversarial code review | After implementation |
| `nvx-idempotency-guard` | Ensure idempotent operations | Script execution |
| `nvx-context-pruning` | Keep context window lean | Long workflows |
| `nvx-dependency-lockdown` | Control dependency additions | Before npm install |
| `nvx-superpower-memory` | Long-term pattern storage | Cross-session learning |
| `nvx-agent-synchronizer` | State handoff between agents | Agent transitions |
| `nvx-reasoning-trace` | Reasoning transparency | Critical actions |
| `nvx-systematic-debugging` | Structured debugging protocol | Bug investigation |
| `nvx-token-efficiency` | Token optimization | Long sessions |
| `nvx-planner` | Multi-step planning protocol | Complex tasks |

## How to Use in OpenCode

### Load the Framework

```typescript
skill(name="nourivex-runtime")
```

### Load Individual Skills

```typescript
skill(name="nvx-goal-preservation")   // Lock objective
skill(name="nvx-watchdog")            // Patrol scope drift
skill(name="nvx-tdd-enforcer")        // Enforce test-first
skill(name="nvx-anti-overengineering") // Enforce simplicity
```

### Delegate to Specialized Agents

```typescript
// Research
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Explore...")

// Architecture
task(category="deep", load_skills=["nvx-architect"], run_in_background=false, prompt="Design...")

// Planning
task(category="deep", load_skills=["nvx-planner"], run_in_background=false, prompt="Plan...")

// Implementation
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer"], run_in_background=false, prompt="Implement...")

// Review
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Review...")
```

### Register Custom Subagents (Advanced)

To use agents via `task(subagent_type="nvx-researcher", ...)`, merge the contents of `opencode.agents.json` into your project's `opencode.json` under the `"agent"` field.

## Example Workflow

**User request:** "Add email validation to the signup form"

### Step 1: Research (nvx-researcher)
```
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, 
     prompt="Research existing email validation patterns in this codebase. Find how forms are validated, what utilities exist, and what libraries are used.")
```

### Step 2: Architecture (nvx-architect)
```
task(category="deep", load_skills=["nvx-architect"], run_in_background=false,
     prompt="Design the email validation architecture. Should we create a new validation utility? Where should it live? What's the interface?")
```

### Step 3: Planning (nvx-planner)
```
task(category="deep", load_skills=["nvx-planner"], run_in_background=false,
     prompt="Create a TDD implementation plan for email validation. Break into atomic tasks with test-first approach.")
```

### Step 4: Implementation (nvx-implementer)
```
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer"], run_in_background=false,
     prompt="Implement email validation following the approved plan. Write failing tests first, then minimal implementation.")
```

### Step 5: Review (nvx-reviewer)
```
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false,
     prompt="Review the email validation implementation. Check for edge cases, scope drift, and architectural consistency.")
```

## Core Principles

1. **Evidence before Implementation:** No code without a plan.
2. **Test-First:** Failing tests are mandatory before production code.
3. **Simplicity Wins:** Abstractions must be earned, not assumed.
4. **Full Traceability:** Every change must trace back to an approved plan.
5. **Zero Scope Drift:** If it wasn't in the plan, it doesn't go in the code.

## Files in This Skill

```
.opencode/skills/nourivex-runtime/
├── SKILL.md                    # This file
└── references/
    ├── agents.md               # Agent configuration details
    └── skills-guide.md         # Detailed skill usage guide
```

---

*Part of the Nourivex Runtime framework. No code without a plan. No plan without verification. No verification without evidence.*
