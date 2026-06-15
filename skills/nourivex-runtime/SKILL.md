---
name: nourivex-runtime
description: Nourivex Engineering Runtime for OpenCode. Enforces Research → Architecture → Planning → TDD Execution workflow. Provides 16 discipline skills + 5 specialized sub-agents. Use for any software engineering task to ensure quality and discipline.
metadata:
  version: 4.0.0
  author: Nourivex
  opencode: true
---

# Nourivex Runtime for OpenCode v4.0

This skill activates the full Nourivex Engineering Standard within OpenCode. It provides a complete workflow enforcement system for software engineering.

---

## ⚠️ CRITICAL: Agent Integration with OpenCode

**All sub-agents MUST use OpenCode's `task()` function with the correct parameters.**

### Available Agent Types

| Agent Type | Category | Use For |
|------------|----------|---------|
| `explore` | subagent_type | Codebase exploration, file search, pattern discovery |
| `librarian` | subagent_type | External documentation, API references, library research |
| `oracle` | subagent_type | Architecture review, complex debugging, design decisions |
| `general` | category | Multi-step tasks, research, execution |
| `quick` | category | Single-file changes, typos, simple modifications |
| `deep` | category | Goal-oriented autonomous problem-solving |
| `unspecified-high` | category | High-effort tasks not fitting other categories |

### Correct Delegation Pattern

```typescript
// ✅ CORRECT - Use task() with proper parameters
task(subagent_type="explore", load_skills=[], run_in_background=true, prompt="Find auth patterns in src/")

task(category="deep", load_skills=["nvx-tdd-enforcer", "nvx-goal-preservation"], run_in_background=false, prompt="Implement the user service with TDD")

task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Review this architecture for security issues")

// ❌ WRONG - Non-existent agent types
task(subagent_type="nvx-researcher", ...)  // DOES NOT EXIST
task(subagent_type="nvx-implementer", ...) // DOES NOT EXIST
task(subagent_type="nvx-architect", ...)   // DOES NOT EXIST
```

### Skill Loading

Always load relevant skills into your agent delegations:

```typescript
task(category="deep", load_skills=["nvx-tdd-enforcer", "nvx-goal-preservation"], ...)
```

---

## 🏛️ The Nourivex Workflow (Mandatory)

For every non-trivial engineering task, follow this sequence:

### Phase 1: Research
Delegate to `explore` agents for codebase exploration, dependency analysis, and technical discovery.

```typescript
task(subagent_type="explore", load_skills=[], run_in_background=true, 
  prompt="Explore the codebase for [specific pattern/structure]. Find: [concrete items]. Skip: [irrelevant files].")
```

### Phase 2: Architecture
Delegate to `oracle` agent for system design, component boundaries, and data models.

```typescript
task(subagent_type="oracle", load_skills=["nvx-reasoning-trace"], run_in_background=false, 
  prompt="Design the component structure for [feature]. Consider: [constraints].")
```

### Phase 3: Planning
Use `nvx-planner` skill for TDD roadmaps and implementation sequencing.

```typescript
task(category="deep", load_skills=["nvx-planner", "nvx-goal-preservation"], run_in_background=false, 
  prompt="Create implementation plan for [feature]. Files: [scope]. Constraints: [limitations]")
```

### Phase 4: Execution (TDD)
Delegate implementation with TDD enforcement.

```typescript
task(category="deep", load_skills=["nvx-tdd-enforcer", "nvx-watchdog"], run_in_background=false, 
  prompt="Implement [feature] following the approved plan. Write failing test first.")
```

### Phase 5: Review
Delegate review for critical logic verification and edge-case analysis.

```typescript
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, 
  prompt="Review this code for: [security/edge-cases/architecture]. Files: [changed files]")
```

---

## 📏 MANDATORY: Code Size Limit (500 Lines)

### THE IRON LAW

```
NO FILE SHALL EXCEED 500 LINES OF CODE.
IF A FILE APPROACHES 500 LINES → SPLIT IMMEDIATELY.
```

### Why This Rule Exists

| Problem | Solution |
|---------|----------|
| Files > 500 lines are unreadable | Force decomposition into focused modules |
| Large files hide poor architecture | Expose coupling through enforced splitting |
| AI context windows struggle with large files | Keep files small for better AI comprehension |
| Code review becomes impossible | Smaller files = faster, better reviews |
| Merge conflicts multiply | Smaller files = fewer conflicts |

### Automatic Splitting Protocol

**BEFORE writing any file, run this check:**

```
FILE SIZE CHECK:
1. Estimate the total lines of code for this file
2. If estimated > 450 lines → STOP and plan a split
3. Split into logical modules BEFORE writing
```

**WHEN a file approaches 500 lines (450+):**

```
⚠️ CODE SIZE ALERT

File: [path]
Current lines: [count]
Approaching 500-line limit.

ACTION REQUIRED:
1. STOP writing to this file
2. Identify logical components that can be separated
3. Create new focused modules
4. Update imports
5. Continue implementation in smaller files
```

### Splitting Strategy

**Never split arbitrarily. Follow these patterns:**

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Domain Split** | Different business concerns | `UserService` + `UserValidator` + `UserRepository` |
| **Layer Split** | Different architectural layers | `controller/` + `service/` + `repository/` |
| **Feature Split** | Different features | `auth/` + `users/` + `todos/` |
| **Utility Split** | Shared helpers | `helpers/format.ts` + `helpers/validate.ts` |
| **Type Split** | Type definitions | `types/user.ts` + `types/api.ts` |

### File Size Verification

Before completing any task, verify all files:

```bash
# Find files over 450 lines (warning zone)
find src/ -name "*.ts" -o -name "*.tsx" -o -name "*.js" | xargs wc -l | awk '$1 > 450 {print}'

# Find files over 500 lines (violation)
find src/ -name "*.ts" -o -name "*.tsx" -o -name "*.js" | xargs wc -l | awk '$1 > 500 {print}'
```

**If any file exceeds 500 lines → HALT and split before proceeding.**

---

## 🛡️ Mandatory Patrol Skills

Load these skills at appropriate points during your workflow:

| Skill | When to Load | Purpose |
|-------|-------------|---------|
| `nvx-goal-preservation` | Start of every task | Lock the objective, prevent scope drift |
| `nvx-watchdog` | Throughout implementation | Detect requirement drift, hallucinated features |
| `nvx-tdd-enforcer` | Every implementation step | Test-first discipline |
| `nvx-verification` | Before any completion claim | Verify with actual commands |
| `nvx-reviewer` | After implementation | Adversarial review |
| `nvx-idempotency-guard` | Before destructive CLI commands | Prevent state corruption |
| `nvx-context-pruning` | After task verified GREEN | Keep context lean |
| `nvx-dependency-lockdown` | Before adding external dependencies | Prevent impulsive adds |
| `nvx-agent-synchronizer` | During handoff between agents | Maintain state consistency |
| `nvx-reasoning-trace` | Before critical decisions | Document reasoning |
| `nvx-anti-overengineering` | During design/review | Enforce simplicity |
| `nvx-architectural-consistency` | When adding files/modules | Match existing patterns |
| `nvx-superpower-memory` | Store/recall patterns | Cross-session knowledge |
| `nvx-systematic-debugging` | When encountering bugs | Hypothesis-driven debugging |
| `nvx-token-efficiency` | In long workflows | Keep context lean |
| `nvx-planner` | Before multi-step implementation | Create structured roadmap |
| `nvx-code-splitter` | When file exceeds 500 lines | Automatic file decomposition |
| `nvx-project-checklist` | At project start/completion | Best practices verification |
| `nvx-docx-editor` | Creating/editing Word documents | Professional .docx generation |

---

## 🤖 Sub-Agent Delegation (Complete Examples)

### Example 1: Implement a New Feature

```typescript
// Step 1: Research existing patterns
task(subagent_type="explore", load_skills=[], run_in_background=true, 
  prompt="Find existing CRUD patterns in src/. Look for: controller patterns, service patterns, repository patterns. Skip: tests, node_modules.")

// Step 2: Architecture design (wait for research to complete)
task(subagent_type="oracle", load_skills=["nvx-reasoning-trace"], run_in_background=false, 
  prompt="Design the user registration feature. Consider: existing auth patterns, database schema, API conventions.")

// Step 3: Planning
task(category="deep", load_skills=["nvx-planner", "nvx-goal-preservation"], run_in_background=false, 
  prompt="Create TDD plan for user registration. Files to create: [list]. Constraints: 500-line limit, existing patterns.")

// Step 4: Implementation (in batches)
task(category="deep", load_skills=["nvx-tdd-enforcer", "nvx-watchdog", "nvx-code-splitter"], run_in_background=false, 
  prompt="Implement Task 1 from the plan. Write failing test first. Monitor file sizes.")

// Step 5: Review
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, 
  prompt="Review: [list changed files]. Check: security, edge cases, 500-line limit compliance.")
```

### Example 2: Fix a Bug

```typescript
// Reproduce the bug
task(category="quick", load_skills=["nvx-tdd-enforcer"], run_in_background=false, 
  prompt="Write a failing test that reproduces the bug: [description]. Must fail for the RIGHT reason.")

// Implement fix
task(category="quick", load_skills=["nvx-tdd-enforcer"], run_in_background=false, 
  prompt="Implement minimal fix to make the test pass. Do not refactor unrelated code.")
```

### Example 3: Refactor Existing Code

```typescript
// Analyze current state
task(subagent_type="explore", load_skills=[], run_in_background=true, 
  prompt="Analyze [file/module]. Find: dependencies, public API, test coverage. Estimate complexity.")

// Plan the refactor
task(category="deep", load_skills=["nvx-planner", "nvx-anti-overengineering"], run_in_background=false, 
  prompt="Plan refactor of [module]. Goals: [specific]. Constraints: maintain public API, keep tests passing.")

// Execute refactor in small steps
task(category="deep", load_skills=["nvx-tdd-enforcer", "nvx-watchdog"], run_in_background=false, 
  prompt="Execute Step 1 of refactor plan. Run tests after each change.")
```

---

## 📋 Context Pack Protocol

When handing off between agents, always include a Context Pack:

```
CURRENT_STATUS: What has been verified
PENDING_CHALLENGES: Known risks or blockers
NEXT_GOAL: The specific deliverable for the next agent
FILE_SIZE_STATUS: Any files approaching 500-line limit
SCOPE_LOCK: Reference to objective lock from goal-preservation
```

---

## ✅ Project Best Practices Checklist

**At project start, verify these items:**

### Structure
- [ ] `src/` directory organized by feature or layer
- [ ] `tests/` mirrors `src/` structure
- [ ] `docs/` for documentation
- [ ] Configuration files in root (`tsconfig.json`, `.eslintrc`, etc.)

### Code Quality
- [ ] ESLint configured with project rules
- [ ] Prettier configured for consistent formatting
- [ ] TypeScript strict mode enabled (if applicable)
- [ ] No `any` types allowed

### Testing
- [ ] Test framework configured (Jest/Vitest/etc.)
- [ ] Test coverage reporting enabled
- [ ] CI/CD pipeline includes tests

### Documentation
- [ ] README.md with setup instructions
- [ ] API documentation (if applicable)
- [ ] Inline comments for complex logic only

### Security
- [ ] No secrets in code (use env vars)
- [ ] Input validation on all external data
- [ ] Authentication/authorization in place (if applicable)

### Performance
- [ ] No N+1 queries
- [ ] Pagination for large datasets
- [ ] Caching strategy defined (if applicable)

**Before task completion, verify all applicable items.**

---

## 🔍 Verification Protocol (Before Claiming Complete)

```
COMPLETION VERIFICATION:
1. All tests passing: [exact test command]
2. Linter clean: [exact lint command]
3. Type check passing: [exact type check command]
4. File size check: No files > 500 lines
5. Requirements met: Compare against objective lock
6. No scope drift: Compare changes against plan
```

**If any check fails → fix before claiming complete.**

---

## 📄 Document Generation (DOCX)

When the task requires generating professional Word documents (reports, letters, templates), use the `nvx-docx-editor` skill.

### When to Use

| Trigger | Action |
|---------|--------|
| User asks for "report", "memo", "letter" as .docx | Load `nvx-docx-editor` |
| Need to create Indonesian academic report (PKL, skripsi) | Load `nvx-docx-editor` |
| Need to edit existing .docx files | Load `nvx-docx-editor` |
| Need tracked changes or comments in Word | Load `nvx-docx-editor` |

### Delegation Pattern

```typescript
// Creating a new document
task(category="deep", load_skills=["nvx-docx-editor", "nvx-goal-preservation"], 
  run_in_background=false,
  prompt="Create professional PKL report with: cover page, approval page, foreword, TOC, and chapters. Follow Indonesian academic standards from nvx-docx-editor skill.")

// Editing existing document
task(category="quick", load_skills=["nvx-docx-editor"], 
  run_in_background=false,
  prompt="Edit the existing report.docx: update the cover page with new title and add tracked changes for review.")
```

---

## 🚫 Hard Blocks (NEVER Violate)

| Rule | Consequence |
|------|-------------|
| No file > 500 lines | HALT and split immediately |
| No code without a failing test | Delete code, write test first |
| No plan without approval | Cannot proceed with implementation |
| No scope drift without approval | HALT and get explicit approval |
| No `as any` / `@ts-ignore` | Type error must be fixed properly |
| No empty catch blocks | Handle errors or propagate them |
| No secrets in code | Use environment variables |

---

## 📊 Quick Reference

| Situation | Action | Skills to Load |
|-----------|--------|----------------|
| Starting any task | Post Objective Lock | `nvx-goal-preservation` |
| File approaching 500 lines | Plan and execute split | `nvx-code-splitter` |
| Before each commit | Verify scope compliance | `nvx-watchdog` |
| Implementing code | Write test first | `nvx-tdd-enforcer` |
| After implementation | Run verification | `nvx-verification` |
| Reviewing code | Adversarial review | `nvx-reviewer` |
| Adding dependency | Justify and research | `nvx-dependency-lockdown` |
| Long workflow | Prune context | `nvx-context-pruning` |
| Encountering bug | Systematic debugging | `nvx-systematic-debugging` |
| Creating/editing .docx | Document generation | `nvx-docx-editor` |

---

## 🎯 The Bottom Line

```
No code without a test.
No test without a plan.
No plan without verification.
No verification without evidence.
No file over 500 lines.
No scope drift without approval.
```

**The Nourivex Standard: Ship quality code, not fast code.**
