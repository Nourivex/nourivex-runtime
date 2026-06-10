---
name: nvx-superpower-memory
description: Actionable persistent memory system — STORE patterns after every GREEN state, RECALL before every planning phase. Writes to .nourivex/memory/ for cross-session and cross-platform knowledge retention.
---

# Superpower Memory

## Overview

Senior engineers are experts because of accumulated experience. This skill is that digitized experience — a **live, persistent knowledge layer** that agents actively write to and read from. It is not a specification; it is an operational protocol.

**Core Principle:** Learn once, apply everywhere. Every session builds on the last.

**Storage Root:** `.nourivex/memory/` (project-level, platform-agnostic)

---

## Storage Structure

```
.nourivex/memory/
├── _index.json                  # Master registry of all entries (REQUIRED)
├── knowledge-vault/
│   ├── patterns/                # Reusable implementation patterns
│   │   └── {YYYY-MM-DD}-{slug}.json
│   └── lessons/                 # Bug post-mortems & lessons learned
│       └── {YYYY-MM-DD}-{slug}.json
├── user-dna/
│   └── profile.json             # User preferences & coding style
└── project-map/
    ├── architecture.json        # Module relationships & key boundaries
    └── domain-rules.json        # Business logic invariants (NEVER violate)
```

---

## Entry Schema

All memory entries follow this structure:

```json
{
  "id": "2026-06-10-express-middleware-chain",
  "type": "pattern",
  "title": "Express Middleware Chain for Auth + Validation",
  "content": "Always place auth middleware before validation. Use early-return pattern inside middleware to avoid nesting.",
  "code": "app.use(authMiddleware).use(validateBody(schema)).post('/resource', handler)",
  "tags": ["express", "middleware", "auth", "pattern"],
  "project": "optional-project-name",
  "created": "2026-06-10T00:00:00Z",
  "lastAccessed": "2026-06-10T00:00:00Z",
  "accessCount": 1,
  "source": "agent"
}
```

**Index entry** (in `_index.json`):
```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-06-10T00:00:00Z",
  "entries": [
    {
      "id": "2026-06-10-express-middleware-chain",
      "type": "pattern",
      "title": "Express Middleware Chain for Auth + Validation",
      "tags": ["express", "middleware"],
      "path": "knowledge-vault/patterns/2026-06-10-express-middleware-chain.json"
    }
  ]
}
```

---

## STORE Protocol (Post-Completion)

**Trigger:** After any task reaches GREEN state and passes `nvx-reviewer`.

**Decision Gate — run this before storing:**
```
MEMORY STORE CHECK:
1. Is there a reusable pattern applicable beyond this task?       [yes/no]
2. Was there a non-obvious bug with a root cause worth recording? [yes/no]
3. Did I learn a critical library constraint or limitation?       [yes/no]
4. Did the user express a preference or correction?               [yes/no]

If any is YES → STORE. If all NO → skip storage this cycle.
```

**STORE Steps:**

1. **Compose the entry** using the schema above. Be specific:
   - ❌ Bad: `"content": "Use middleware correctly"`
   - ✅ Good: `"content": "Express auth middleware must precede body parsers to prevent processing unauthenticated payloads"`

2. **Write the entry file:**
   ```
   File: .nourivex/memory/knowledge-vault/patterns/{YYYY-MM-DD}-{slug}.json
         .nourivex/memory/knowledge-vault/lessons/{YYYY-MM-DD}-{slug}.json
   ```

3. **Update the index:**
   - Read `.nourivex/memory/_index.json`
   - Append new entry to `entries[]`
   - Update `lastUpdated`
   - Write back

4. **Confirm storage:**
   ```
   [MEMORY STORED] ✅
   Type: pattern | lesson | preference | domain-rule
   Title: {title}
   Tags: {tags}
   Path: {path}
   ```

---

## RECALL Protocol (Pre-Planning)

**Trigger:** At the START of the Research Phase — before any architecture or planning decision.

**RECALL Steps:**

1. **Check if index exists:**
   ```
   Does .nourivex/memory/_index.json exist?
   YES → load entries array
   NO  → [MEMORY COLD START] No prior knowledge found. Proceeding fresh.
   ```

2. **Query by relevance:**
   - Read `_index.json`
   - Match tags and title keywords against current task context
   - If index has <20 entries: read all
   - If index has ≥20 entries: filter by tag intersection first

3. **Report recalled memory:**
   ```
   [MEMORY RECALLED] 🧠
   Found {N} relevant entries:

   📦 Pattern: "Express Middleware Chain" [express, auth]
      → "Auth middleware must precede body parsers..."

   🐛 Lesson: "Vitest ESM mock timing" [vitest, testing]
      → "vi.mock() hoisting breaks async imports — use vi.doMock() instead"

   Applying these to current context...
   ```

4. **Always check User DNA:**
   - Read `.nourivex/memory/user-dna/profile.json`
   - Apply preferences to all decisions (style, tooling, patterns)

---

## User DNA Protocol

**File:** `.nourivex/memory/user-dna/profile.json`

**Update when:** User explicitly corrects agent style, expresses preference, or approves/rejects a pattern.

**Schema:**
```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-06-10T00:00:00Z",
  "codingStyle": {
    "paradigm": "functional-first",
    "patterns": ["early-returns", "explicit-typing", "small-functions"],
    "avoid": ["deep-nesting", "magic-numbers", "implicit-any"]
  },
  "toolingPreferences": {
    "testRunner": "vitest",
    "linter": "eslint",
    "formatter": "prettier",
    "packageManager": "npm"
  },
  "communicationStyle": {
    "responseLength": "concise",
    "codeComments": "necessary-only",
    "language": "id"
  },
  "customRules": []
}
```

---

## Domain Rules Protocol

**File:** `.nourivex/memory/project-map/domain-rules.json`

Store invariants that must **never** be violated — business rules, architectural constraints, security policies.

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-06-10T00:00:00Z",
  "rules": [
    {
      "id": "rule-001",
      "title": "Never expose raw DB errors to client",
      "severity": "critical",
      "description": "All database errors must be caught and returned as generic 500 responses. Never pass error.message to the API response.",
      "enforced_since": "2026-06-10T00:00:00Z"
    }
  ]
}
```

`nvx-watchdog` MUST check domain rules before every implementation. Violating a domain rule triggers immediate SCOPE ALARM.

---

## PRUNE Protocol

**Trigger:** When `_index.json` has more than 50 entries, OR when starting a new major project phase.

**Steps:**
1. Review entries with `accessCount === 0` and `created` > 30 days ago
2. Review entries with stale/outdated content (technology superseded)
3. Propose pruning candidates with justification
4. Await user confirmation before deleting
5. Update `_index.json` after pruning

---

## Initialization

If `.nourivex/memory/` does not exist, create it:

```
[MEMORY INIT] Creating .nourivex/memory/ structure...

Directory created: .nourivex/memory/knowledge-vault/patterns/
Directory created: .nourivex/memory/knowledge-vault/lessons/
Directory created: .nourivex/memory/user-dna/
Directory created: .nourivex/memory/project-map/

Writing _index.json (empty index)...
Writing user-dna/profile.json (defaults)...

[MEMORY READY] ✅ Storage initialized.
```

---

## Red Flags — Memory Failures

- Reaching GREEN state without running the STORE Decision Gate
- Starting planning without checking RECALL first
- Writing vague entries: "fixed the bug" — no slug, no root cause, no prevention
- Storing entries without updating `_index.json`
- Ignoring User DNA preferences after they were established

---

## The Bottom Line

Memory without action is a library no one visits. Run STORE after every GREEN. Run RECALL before every plan. The agent who reads memory is always smarter than the one who doesn't.
