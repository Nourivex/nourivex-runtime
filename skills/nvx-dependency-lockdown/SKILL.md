---
name: nvx-dependency-lockdown
description: Prevent impulsive dependency additions; requires formal research and analysis before any installation.
---

# Dependency Lockdown

## Overview

Adding dependencies is a permanent architectural commitment. Impulsive library additions lead to package bloat, security vulnerabilities, and breaking changes. This skill enforces a "Lockdown" on the supply chain.

**Core Principle:** No library is added until its cost (size, maintenance, security) is justified.

---

## The Lockdown Protocol

Before running ANY command to add a new package (`npm install <pkg>`, `pip install <pkg>`, etc.):

1. **Halt Execution:** The `nvx-implementer` is FORBIDDEN from adding packages directly.
2. **Invoke Researcher:** Control MUST be handed to `nvx-researcher` with the prompt:
   - "Analyze dependency: [package_name]"
   - "Check: Bundle size/impact, Maintenance status (last commit, issues), Security vulnerabilities (CVEs), and compatibility with current project version."
3. **Review Recommendation:** Only if the researcher provides a "GREEN" recommendation can the planner update the task list to include the installation.
4. **Post-Install Check:** Immediately run `npm audit` or equivalent after installation.

---

## Lockdown Exceptions

- Standard library imports (no external installation required).
- Development-only tools (e.g., a local linter) that do not affect the production bundle (still requires minimal check).

---

## Red Flags

- "I'll just add `lodash` to solve this simple array task."
- Installing a package with 0 downloads or no recent maintenance.
- Adding a dependency without checking if an equivalent utility already exists in the codebase.

---

## The Bottom Line

Treat every dependency as a technical debt. Only borrow what you can afford to maintain.
