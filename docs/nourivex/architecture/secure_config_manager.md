# Architecture: Secure Config Manager (v1.0.0)

## Overview
A lightweight Python utility for idempotent key-value updates in `.env` files with automated rollback capabilities.

## Components
- `ConfigManager`: Core class responsible for parsing, updating, and backing up configurations.

## Data Model (Interface)
### ConfigManager
- `set_key(key: str, value: str) -> bool`: Updates or adds a key-value pair. Returns `True` if a change was made, `False` if already identical (Idempotent).
- `get_key(key: str) -> str | None`: Retrieves a value by key.
- `create_backup() -> str`: Creates a timestamped backup of the current config.
- `rollback(backup_path: str) -> bool`: Restores config from a specific backup.

## Error & Failure Boundaries
- **IOError (File Locked/Missing):** System must log the error and halt the current operation without corrupting the original file.
- **Malformed Line:** Skip and log lines that do not follow `KEY=VALUE` format; do not attempt auto-fix to avoid data loss.
- **Disk Full:** `create_backup` must verify available space (mocked for simulation) or handle write failure gracefully.

## Folder Structure
```
lib/
└── config/
    ├── __init__.py
    └── manager.py
tests/
└── test_config_manager.py
```
