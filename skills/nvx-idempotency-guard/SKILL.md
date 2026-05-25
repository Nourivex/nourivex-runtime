---
name: nvx-idempotency-guard
description: Ensure every action or script execution is idempotent to prevent state corruption during repeated runs.
---

# Idempotency Guard

## Overview

Repetitive execution of destructive commands (migration, file deletion, configuration updates) without checking current state leads to environment corruption. The Idempotency Guard ensures that any action taken by the agent is safe to repeat or skip if already completed.

**Core Principle:** Check twice, execute once. Never assume the environment is in a "clean" or "starting" state.

---

## The Idempotency Protocol

Before executing ANY command that modifies state (CLI scripts, database changes, global configs), you MUST follow this sequence:

### 1. Pre-condition Check (Verify Current State)
- Use read-only tools (`run_shell_command` with status checks, `read_file`, `list_directory`) to verify if the change has ALREADY been applied.
- **Example:** Before running a database migration, check the current schema version or table existence.
- **Example:** Before running `npm install`, check `package.json` and `node_modules` to see if the package is already there.

### 2. Guard Logic (The Decision)
- **IF condition is already met:** SKIP the command. Log: `[IDEMPOTENCY] Action skipped: [reason]. Current state matches desired state.`
- **IF condition is NOT met:** PROCEED with execution.

### 3. Verification Post-Execution
- Verify that the command actually resulted in the desired state.

---

## Mandatory Guard Triggers

The following actions REQUIRE a Pre-condition Check:
- `npm install` / `pip install` / `go get` (Adding dependencies)
- Database migrations (`db:migrate`, `alembic upgrade`, etc.)
- File deletions (`rm`, `del`, `unlink`)
- Changing system environment variables
- Global configuration updates (changing `.env`, `tsconfig.json`, `package.json`)

---

## Red Flags

- Executing a `write_file` or `replace` without first checking if the file/content exists.
- Running a migration script blindly after a failed turn.
- Deleting a directory without checking if it contains critical untracked files.

---

## The Bottom Line

A senior engineer never assumes. Verify the state before you touch the state.
