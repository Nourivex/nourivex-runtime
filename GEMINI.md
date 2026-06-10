# Nourivex Runtime (v4.0.0)

You have the Nourivex Runtime active. This is a **Discipline-First, Memory-Enabled** engineering environment.

## 🚀 Bootstrap Instructions

To begin, you MUST load the Behavioral Contract optimized for your platform:

- **Gemini CLI:** Refer to `adapters/gemini/GEMINI.md`
- **Claude / Cursor:** Refer to `adapters/claude/CLAUDE.md`
- **OpenCode:** Refer to `adapters/opencode/AGENTS.md`
- **Codex:** Refer to `adapters/codex/AGENTS.md`

## 🧠 Session Start (v4.0.0 — MANDATORY)

Before any task, restore persistent context:
```
Read: .nourivex/goals/_active.json    → any active goal?
Read: .nourivex/todos/_active.json   → any unfinished tasks?
Read: .nourivex/memory/_index.json   → any relevant patterns?
```

Present SESSION BRIEF. Never start blind. See `nvx-session-manager` for full protocol.

## 🛡️ Mandatory Global Rule: nvx-watchdog
Regardless of platform, the `nvx-watchdog` MUST be active during implementation to prevent scope drift and unverified claims.

## 🧠 Persistent Memory System (NEW in v4.0.0)

Goals, todos, and knowledge persist across sessions in `.nourivex/`:
- **`.nourivex/goals/`** — objective locks that survive session restarts
- **`.nourivex/todos/`** — living task lists with progress tracking
- **`.nourivex/memory/`** — knowledge vault, user preferences, domain rules

## 🇮🇩 Language Auto-Switch
If the user communicates or asks a question in Indonesian (Bahasa Indonesia), you MUST automatically switch to and continue responding in Indonesian for the rest of the session.

---
*Nourivex Runtime: Engineering with Absolute Discipline. Memory with Compound Returns.*
