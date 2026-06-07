---
name: nvx-architectural-consistency
description: Use when adding files, components, or modules to enforce naming conventions, folder structure, and architectural patterns that match the existing codebase
---

# Architectural Consistency

## Overview

Half a clean architecture is worse than no architecture. Inconsistency is technical debt that compounds: the next developer (or next AI session) sees two competing patterns and picks the wrong one, creating a third. Over time, the codebase becomes a patchwork of unrelated decisions.

**Core principle:** Every addition must follow the existing patterns of the codebase. When no pattern exists, establish one explicitly and document it.

**Consistency is not conformism — it is respect for the system as a whole.**

---

## The Iron Law

```
BEFORE CREATING ANY FILE, VERIFY THE EXISTING PATTERN.
MATCH IT. DO NOT INVENT A NEW ONE WITHOUT EXPLICIT JUSTIFICATION.
```

---

## Step 1: Pattern Discovery (Before Writing Any Code)

When entering any codebase, run this audit:

```
CONSISTENCY AUDIT:
1. Folder structure: Where do [controllers/services/models/etc.] live?
2. Naming conventions: camelCase? PascalCase? kebab-case? snake_case?
3. File naming: [feature].service.ts? [feature]Service.ts? service-[feature].ts?
4. Module boundaries: How are features grouped? By layer or by domain?
5. Error handling: How are errors propagated and formatted?
6. Export patterns: Named exports? Default exports? Barrel files?
7. Test location: Co-located? Separate __tests__ folder? Mirrored structure?
8. Configuration: Where do constants live? .env? config files?
```

**Run this before writing a single file.**

---

## Step 2: Pattern Matching

When adding new code, match the discovered patterns explicitly:

### Folder Structure
```
❌ Inconsistent:
src/
  controllers/UserController.ts   ← existing pattern
  auth/                           ← new random structure you invented
    login.ts

✅ Consistent:
src/
  controllers/UserController.ts
  controllers/AuthController.ts   ← matches existing pattern
```

### Naming Conventions
```
❌ Inconsistent:
# Existing files use: user.service.ts, product.service.ts
# You add: AuthService.ts  ← different convention

✅ Consistent:
# Add: auth.service.ts  ← matches pattern
```

### Error Handling
```
❌ Inconsistent:
# Existing code throws: throw new AppError('NOT_FOUND', 404)
# You write: res.status(404).json({ error: 'not found' })

✅ Consistent:
throw new AppError('NOT_FOUND', 404)  ← matches existing pattern
```

---

## Consistency Checklist (Before Every File Creation)

Before creating any new file or module:

- [ ] **Location**: Does this belong in an existing folder, or does a new folder need justification?
- [ ] **Name format**: Does the filename match the convention in that directory?
- [ ] **Class/function naming**: Does it match how similar items are named?
- [ ] **Exports**: Named or default? Barrel file needed?
- [ ] **Dependencies**: Does this import pattern match how other modules import?
- [ ] **Error handling**: Does this propagate errors the same way as neighboring code?
- [ ] **Types/interfaces**: Do new types follow existing naming patterns (`IUser`? `UserType`? `User`)?

---

## When Patterns Conflict

Sometimes an existing codebase has TWO competing patterns (e.g., some files use clean architecture, others are random). Handle this:

```
PATTERN CONFLICT DETECTED:
- Pattern A: [describe, location, example]
- Pattern B: [describe, location, example]

Recommendation: Follow Pattern A because [reason].
Action: Apply Pattern A for new code. Flag Pattern B files for future refactoring.

Do NOT: Mix both patterns in the new code.
```

Always pick one and document the choice. Never create a third pattern.

---

## Establishing New Patterns

When the codebase has NO existing pattern for something you need to add:

```
NEW PATTERN PROPOSAL:
- What needs a pattern: [e.g., "background job handling"]
- Proposed pattern: [e.g., "jobs/ folder, [name].job.ts naming, BullMQ"]
- Rationale: [why this fits the existing architectural style]
- Reference example: [how the first file will look]

Get approval before implementing.
```

Document the new pattern in `docs/nourivex/architecture/patterns.md`.

---

## Architecture Boundaries

Enforce clear layer boundaries:

| Layer | Responsibility | May Import From |
|-------|---------------|-----------------|
| **Controllers/Routes** | HTTP handling, input validation | Services only |
| **Services** | Business logic | Repositories, other services |
| **Repositories** | Data access | Database clients only |
| **Models/Entities** | Data shape definitions | Nothing (pure types) |
| **Utils/Helpers** | Stateless utilities | Nothing domain-specific |

**A controller importing a repository directly is an architectural violation.**

---

## Red Flags — Investigate Before Proceeding

- Creating a folder with no parallel in the existing structure
- Using a naming convention different from neighboring files
- Importing across architectural layer boundaries
- Mixing two different patterns in the same module
- "I'll restructure this later" → restructure NOW or don't restructure at all
- Creating a new config pattern when one already exists

---

## Consistency Report (When Reviewing)

When reviewing a PR or existing code for consistency:

```
CONSISTENCY REPORT:
Violations found:
1. [File path]: [violation] → Correct to: [correct pattern]
2. [File path]: [violation] → Correct to: [correct pattern]

Patterns confirmed consistent:
- [What matched well]
```

---

## The Bottom Line

When in doubt, grep the codebase. Find how existing, similar things are done. Do it the same way.

A codebase that looks like one person wrote it — even when many people (and agents) contributed — is a maintainable codebase.
