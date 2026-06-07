---
name: nvx-superpower-memory
description: Long-term reasoning and pattern storage system for agents to leverage cross-session knowledge and user preferences.
---

# Superpower Memory

## Overview

Agents often lose context between sessions or repeat mistakes. Superpower Memory is a persistent knowledge layer that stores "learned patterns," "user-specific coding styles," and "architectural blueprints." This allows agents to act with "superpowers" by tapping into a collective memory of past successes.

**Core Principle:** Learn once, apply everywhere. Knowledge is cumulative, not transient.

---

## Memory Categories

### 1. The Knowledge Vault (`knowledge-vault/`)
- **Success Patterns:** Snippets of high-quality implementations (e.g., "The perfect Express middleware chain").
- **Bug Lessons:** Post-mortems of complex bugs and their root causes to prevent recurrence.
- **Library Constraints:** Documented limitations of dependencies found during research.

### 2. User DNA (`user-dna/`)
- **Coding Style:** Preferences (e.g., "prefer functional over OOP," "always use early returns").
- **Tooling Preferences:** Preferred test runners, linters, or deployment scripts.

### 3. Project Archeology (`project-archeology/`)
- **Module Graph:** High-level mapping of how modules interact.
- **Business Logic Rules:** Core domain rules that must never be violated.

---

## The Superpower Protocol

### 1. Store (Post-Completion)
After every major task (GREEN state), the `nvx-reviewer` or `nvx-implementer` MUST evaluate:
- "Is there a reusable pattern here?"
- "Did I learn a critical constraint?"
- If yes, write to `.gemini/superpowers/`.

### 2. Recall (Pre-Planning)
At the start of the **Research Phase**, the `nvx-researcher` MUST query the Superpower Memory:
- "Have we built something similar before?"
- "What are the user's preferred patterns for this?"

---

## Storage Structure (Root: `.gemini/superpowers/`)

```
.gemini/superpowers/
├── knowledge-vault/
│   ├── patterns/
│   └── bug-lessons/
├── user-dna/
│   └── preferences.json
└── project-archeology/
    └── domain-rules.md
```

---

## Red Flags

- Agents forgetting a previously discussed architectural constraint.
- Re-implementing a utility that was already optimized and stored in the Vault.
- Ignoring user's explicit coding style preferences stored in DNA.

---

## The Bottom Line

A senior engineer is an expert because of their experience. Superpower Memory is the digitized experience of the Nourivex agents.
