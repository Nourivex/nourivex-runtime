# TDD Plan: Secure Config Manager

## Phase 1: Foundation
1. Create `lib/config/manager.py` with `ConfigManager` class boilerplate.
2. Create `tests/test_config_manager.py` with a simple test that instantiates the class.

## Phase 2: Read Logic (TDD)
3. Write a failing test for `get_key` with a mock `.env` content.
4. Implement minimal `get_key` to pass the test.

## Phase 3: Idempotent Write Logic (TDD)
5. Write a failing test for `set_key` where the value is DIFFERENT from existing.
6. Implement `set_key` (Verify it returns `True` and file is updated).
7. Write a test for `set_key` where the value is the SAME as existing.
8. Refactor `set_key` to be idempotent (Verify it returns `False` and NO file write happens - Test via Mocking `builtins.open`).

## Phase 4: Safeguards
9. Write failing test for `create_backup`.
10. Implement `create_backup`.

## Rollback Strategy
If implementation fails at any step:
`git checkout -- lib/config/ tests/test_config_manager.py`
`rm -rf lib/config/ tests/test_config_manager.py` (if new)
