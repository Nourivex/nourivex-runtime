---
name: nourivex-runtime
description: A provider-agnostic engineering runtime for AI agents. Enforces a strict Research -> Architecture -> Planning -> TDD Execution workflow. Use this for all software engineering tasks to ensure consistency, quality, and portability across different AI CLI environments.
---

# Nourivex Runtime: Shared Behavioral Contract (v1)

This skill establishes a standardized engineering lifecycle. You MUST follow these phases in order for every task. Do not skip phases or combine them unless the task is trivial (e.g., single-line config change).

## Phase 1: Research & Brainstorming
**Goal:** Align on intent and eliminate unexamined assumptions.

1. **Explore Context:** Read relevant files, check for existing patterns, and understand the current workspace state.
2. **Clarify:** Ask clarifying questions one at a time. Do not overwhelm the user.
3. **Propose Approaches:** Present 2-3 technical approaches with trade-offs. Recommend one.
4. **Hard Gate:** You MUST NOT proceed to architecture or implementation until the user approves an approach.

## Phase 2: Architecture Documentation
**Goal:** Define the system's "bones" before writing code.

1. **Document Structure:** Define component boundaries, folder structure, and interfaces.
2. **Data Model:** Define entities, storage strategy (e.g., PostgreSQL), and relationships.
3. **API Specification:** Define endpoints, request/response formats, and error handling.
4. **Save:** Write this to `docs/nourivex/architecture/<timestamp>-<topic>.md`.
5. **Hard Gate:** You MUST NOT proceed to planning until the architecture document is reviewed and approved by the user.

## Phase 3: Implementation Planning
**Goal:** Create a granular, testable roadmap.

1. **TDD Mapping:** Every implementation step must be paired with a verification step (test).
2. **Bite-sized Tasks:** Break the work into 2-5 minute tasks.
3. **Structure:**
   - **Task N:** Description
   - **Verification:** Specific test command and expected output.
4. **Save:** Write this to `docs/nourivex/plans/<timestamp>-<topic>.md`.
5. **Hard Gate:** You MUST NOT start coding until the plan is approved.

## Phase 4: Execution (TDD Cycle)
**Goal:** Iterative, verified implementation.

1. **Test First:** Write the failing test case.
2. **Verify Failure:** Run the test and confirm it fails for the expected reason.
3. **Implement:** Write the minimal code to make the test pass.
4. **Verify Success:** Run the test and confirm it passes.
5. **Review:** Check for architectural consistency and edge cases.
6. **Commit:** Commit after every successful TDD cycle.

## Behavioral Mandates

- **Provider Agnostic:** Use generic terms for tools (e.g., "Read File", "Run Command") rather than provider-specific tool names.
- **Portability:** Keep this skill as pure Markdown. No scripts, no hidden logic.
- **Enforcement:** If the user asks for code directly, gently remind them of the "Nourivex Runtime" contract and start at Phase 1.
- **Validation:** Your work is not complete until every task in the plan is verified by a passing test.
