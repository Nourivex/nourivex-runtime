import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Register all Nourivex static resources on the MCP server.
 *
 * Resources provide read-only knowledge content (checklists, principles,
 * conventions) that clients can fetch for reference.
 */
export function registerResources(server: McpServer): void {
  // ── 1. Project Checklist ──────────────────────────────────────────
  server.resource(
    'checklist',
    'nourivex://checklist',
    { mimeType: 'text/markdown', description: 'Engineering quality checklist for project verification' },
    async () => ({
      contents: [
        {
          uri: 'nourivex://checklist',
          mimeType: 'text/markdown',
          text: CHECKLIST_CONTENT,
        },
      ],
    }),
  );

  // ── 2. YAGNI Principles ───────────────────────────────────────────
  server.resource(
    'yagni',
    'nourivex://principles/yagni',
    { mimeType: 'text/markdown', description: 'Anti-overengineering rules and simplicity principles' },
    async () => ({
      contents: [
        {
          uri: 'nourivex://principles/yagni',
          mimeType: 'text/markdown',
          text: YAGNI_CONTENT,
        },
      ],
    }),
  );

  // ── 3. Architecture Conventions ────────────────────────────────────
  server.resource(
    'conventions',
    'nourivex://conventions',
    { mimeType: 'text/markdown', description: 'Naming conventions, folder structure, and pattern rules' },
    async () => ({
      contents: [
        {
          uri: 'nourivex://conventions',
          mimeType: 'text/markdown',
          text: CONVENTIONS_CONTENT,
        },
      ],
    }),
  );

  // ── 4. Workflow ────────────────────────────────────────────────────
  server.resource(
    'workflow',
    'nourivex://workflow',
    { mimeType: 'text/markdown', description: '5-phase Research → Architecture → Planning → TDD → Review workflow' },
    async () => ({
      contents: [
        {
          uri: 'nourivex://workflow',
          mimeType: 'text/markdown',
          text: WORKFLOW_CONTENT,
        },
      ],
    }),
  );

  // ── 5. Agent Roles ────────────────────────────────────────────────
  server.resource(
    'agents',
    'nourivex://agents',
    { mimeType: 'text/markdown', description: 'Available specialized agent roles and their capabilities' },
    async () => ({
      contents: [
        {
          uri: 'nourivex://agents',
          mimeType: 'text/markdown',
          text: AGENTS_CONTENT,
        },
      ],
    }),
  );
}

// ─── Static Content ───────────────────────────────────────────────────

const CHECKLIST_CONTENT = `# Nourivex Project Checklist

Verify all applicable categories before declaring work complete.

## Structure
- src/ directory exists and is organized
- tests/ directory exists and mirrors src/
- docs/ directory exists (if needed)
- Configuration files in root (.gitignore, package.json, tsconfig)
- README.md exists with setup instructions

## Code Quality
- Linter and formatter configured
- No \`any\` types or \`@ts-ignore\`
- No \`console.log\` in production code
- No hardcoded secrets (use env vars)
- All functions have clear, descriptive names
- No magic numbers (use named constants)

## Testing
- Test framework configured and working
- All new code has tests
- Edge cases and error cases covered
- Coverage reporting enabled
- No flaky tests

## Security
- No secrets in source code
- Environment variables for all config
- Input validation on external data
- SQL injection / XSS prevention in place

## Performance
- No N+1 queries
- Pagination for large datasets
- Database indexes in place
- No synchronous blocking in hot paths

## Architecture
- Consistent patterns used throughout
- Clear module boundaries
- No circular dependencies
- Single responsibility per module
- Files under 500 lines

## Documentation
- README has setup and usage examples
- Complex functions documented inline
- API docs maintained (if applicable)`;

const YAGNI_CONTENT = `# YAGNI & Anti-Overengineering Principles

**Core:** The simplest correct solution wins. Always.

## The YAGNI Test

Before adding any abstraction, pattern, or optimization:
1. Is there a current, stated requirement that necessitates this?
2. Does the simpler version fail to satisfy the requirement?
3. Will removing this break the objective?

If any answer is "no" → Remove it.

## Patterns to Eliminate

- **Premature Abstraction:** Abstract classes with one implementation → use a function
- **Plugin Systems for N=1:** Registries/factories when only one variant exists → direct call
- **Premature Optimization:** Caching/layers without measured performance problems → simple query
- **Config Over Implementation:** Config objects for fixed values → named constants
- **Event-Driven for Sequential Logic:** EventBus for simple call chains → direct function calls

## Complexity Budget

| Addition | Cost |
|----------|------|
| New abstraction layer | High |
| New pattern (factory, observer) | High — only if multiple implementations exist today |
| New dependency | Medium — justify against native alternatives |
| Configuration option | Medium — only if value genuinely varies |
| New file/module | Low — but must have single clear responsibility |

## Simplicity Signals

**Right track:** implementation reads like prose, junior dev understands in 5 min
**Overengineered:** needs a diagram, more files than requirements, "flexibility" is the main justification

## The Bottom Line

Write the dumbest code that works. Add complexity only when the requirement demands it.`;

const CONVENTIONS_CONTENT = `# Nourivex Architecture Conventions

Every addition must follow existing patterns. When no pattern exists, establish one explicitly.

## Consistency Audit (Before Writing Code)

1. **Folder structure:** Where do controllers/services/models live?
2. **Naming conventions:** camelCase? PascalCase? kebab-case?
3. **File naming:** [feature].service.ts? [feature]Service.ts?
4. **Module boundaries:** Grouped by layer or by domain?
5. **Error handling:** How are errors propagated and formatted?
6. **Export patterns:** Named exports? Default exports? Barrel files?
7. **Test location:** Co-located? Separate __tests__? Mirrored structure?
8. **Configuration:** Where do constants live? .env? config files?

## Consistency Checklist

Before creating any file:
- **Location:** Does this belong in an existing folder?
- **Name format:** Does the filename match the directory convention?
- **Naming:** Does the class/function name match similar items?
- **Exports:** Named or default? Barrel file needed?
- **Imports:** Does the import pattern match other modules?
- **Error handling:** Consistent with neighboring code?

## Architecture Boundaries

| Layer | Responsibility | May Import From |
|-------|---------------|-----------------|
| Controllers/Routes | HTTP handling, validation | Services only |
| Services | Business logic | Repositories, other services |
| Repositories | Data access | Database clients only |
| Models/Entities | Data shapes | Nothing (pure types) |
| Utils/Helpers | Stateless utilities | Nothing domain-specific |

## Red Flags

- Creating a folder with no parallel in existing structure
- Naming convention different from neighboring files
- Importing across architectural layer boundaries
- Mixing two different patterns in the same module

**When in doubt, grep the codebase.**`;

const WORKFLOW_CONTENT = `# Nourivex Engineering Workflow

A mandatory 5-phase workflow for every non-trivial engineering task.

## Phase 1: Research

Explore the codebase. Understand existing patterns, dependencies, and constraints.

\`\`\`
task(subagent_type="explore", load_skills=[], run_in_background=true,
  prompt="Explore [pattern/structure]. Find: [items].")
\`\`\`

**Gate:** Codebase understanding confirmed. Existing patterns documented.

## Phase 2: Architecture

Design system structure, component boundaries, and data models.

\`\`\`
task(subagent_type="oracle", load_skills=["nvx-reasoning-trace"],
  prompt="Design [feature] considering [constraints].")
\`\`\`

**Gate:** Architecture approved. Component boundaries defined.

## Phase 3: Planning

Break work into atomic TDD tasks with explicit verification steps.

\`\`\`
task(category="deep", load_skills=["nvx-planner", "nvx-goal-preservation"],
  prompt="Create implementation plan for [feature].")
\`\`\`

**Gate:** Plan approved. Todo list persisted to .nourivex/todos/.

## Phase 4: TDD Execution

Implement following the red-green-refactor cycle.

\`\`\`
task(category="deep", load_skills=["nvx-tdd-enforcer", "nvx-watchdog"],
  prompt="Implement [task] following the approved plan.")
\`\`\`

**Gate:** All tasks complete. All tests passing.

## Phase 5: Review

7-pass adversarial review before declaring complete.

\`\`\`
task(subagent_type="oracle", load_skills=["nvx-reviewer"],
  prompt="Review [files] for [security/edge-cases/architecture].")
\`\`\`

**Gate:** All 7 passes clean. Memory patterns captured.

## Iron Laws

- No code without a plan
- No plan without verification
- No completion without review
- No review without evidence
- Every phase has a gate that must pass`;

const AGENTS_CONTENT = `# Nourivex Agent Roles

5 specialized agents that work as collaborative partners.

## 🕵️ Researcher (Phase 1: Research)

**Role:** Deep technical discovery and approach proposals.

Responsibilities:
- Explore codebase for existing patterns and dependencies
- Research external libraries, APIs, and best practices
- Identify technical constraints and risks
- Propose approaches with trade-off analysis

Delegation:
\`\`\`
task(subagent_type="explore", load_skills=[], run_in_background=true,
  prompt="Research [topic]. Find [items].")
\`\`\`

## 📐 Architect (Phase 2: Architecture)

**Role:** System design and structural blueprints.

Responsibilities:
- Design component boundaries and interfaces
- Define data models and API contracts
- Enforce architectural patterns and consistency
- Review for security and performance implications

Delegation:
\`\`\`
task(subagent_type="oracle", load_skills=["nvx-reasoning-trace"],
  prompt="Design [feature] considering [constraints].")
\`\`\`

## 📝 Planner (Phase 3: Planning)

**Role:** Task breakdown and TDD roadmap with persistent todo lists.

Responsibilities:
- Break features into atomic 2-5 minute tasks
- Write explicit verification steps for each task
- Persist plans as living todo lists in .nourivex/todos/
- Track progress across sessions

Delegation:
\`\`\`
task(category="deep", load_skills=["nvx-planner", "nvx-goal-preservation"],
  prompt="Plan [feature]. Files: [scope].")
\`\`\`

## 💻 Implementer (Phase 4: Execution)

**Role:** TDD code execution with todo progress tracking.

Responsibilities:
- Write failing tests before implementation
- Implement minimal code to pass tests
- Update todo progress during implementation
- Follow scope watchdog enforcement

Delegation:
\`\`\`
task(category="deep", load_skills=["nvx-tdd-enforcer", "nvx-watchdog"],
  prompt="Implement [task] per approved plan.")
\`\`\`

## 🧐 Reviewer (Phase 5: Review)

**Role:** 7-pass adversarial review with memory capture.

Responsibilities:
- Correctness, logic, edge case, abstraction review
- Scope verification against objective lock
- Consistency check against codebase conventions
- Memory capture of reusable patterns (Pass 7)

Delegation:
\`\`\`
task(subagent_type="oracle", load_skills=["nvx-reviewer"],
  prompt="Review [files] for [concerns].")
\`\`\`

## Handoff Protocol

Agents use Context Packs for zero-information-loss handoffs:
\`\`\`
CURRENT_STATUS: What has been verified
PENDING_CHALLENGES: Known risks or blockers
NEXT_GOAL: Specific deliverable for next agent
SCOPE_LOCK: Reference to objective lock
\`\`\``;
