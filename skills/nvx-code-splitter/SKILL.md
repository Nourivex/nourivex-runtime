---
name: nvx-code-splitter
description: Use when any file exceeds 500 lines or when code needs decomposition — automatic file splitting with clear module boundaries and proper imports
---

# Code Splitter

## Overview

Large files are a code smell. They hide poor architecture, make reviews impossible, and break AI context windows. Code Splitter enforces decomposition by automatically splitting files that exceed 500 lines into focused, cohesive modules.

**Core principle:** Every file should have ONE responsibility. If it's doing more than one thing, it's doing too many things.

---

## The Iron Law

```
NO FILE SHALL EXCEED 500 LINES.
WHEN A FILE APPROACHES 500 LINES → STOP AND SPLIT.
```

---

## When to Use

Trigger this skill when:
- A file exceeds 450 lines (warning zone)
- A file exceeds 500 lines (violation - MUST split)
- During code review when files are too large
- During refactoring to improve module structure
- When planning new features that might create large files

---

## Splitting Strategies

### Strategy 1: Domain Split (Recommended)

Split by business domain/concern.

**Before (500+ lines):**
```typescript
// src/services/UserService.ts - 600 lines
export class UserService {
  // Validation logic (150 lines)
  // Database operations (200 lines)
  // Email sending (100 lines)
  // API transformations (150 lines)
}
```

**After (3 focused files):**
```typescript
// src/services/user/UserValidator.ts - 150 lines
export class UserValidator {
  validateEmail(email: string): boolean { ... }
  validatePassword(password: string): ValidationResult { ... }
  validateRegistration(data: RegistrationData): ValidationResult { ... }
}

// src/services/user/UserRepository.ts - 200 lines
export class UserRepository {
  async findById(id: string): Promise<User | null> { ... }
  async create(data: CreateUserDTO): Promise<User> { ... }
  async update(id: string, data: UpdateUserDTO): Promise<User> { ... }
}

// src/services/user/UserService.ts - 250 lines
export class UserService {
  constructor(
    private validator: UserValidator,
    private repository: UserRepository
  ) {}
  
  async register(data: RegistrationData): Promise<User> {
    const validation = this.validator.validateRegistration(data);
    if (!validation.valid) throw new ValidationError(validation.errors);
    return this.repository.create(data);
  }
}
```

### Strategy 2: Layer Split

Split by architectural layer.

**Before:**
```typescript
// src/UserHandler.ts - 500+ lines
// Contains: controller logic + service logic + data access
```

**After:**
```typescript
// src/controllers/UserController.ts
// src/services/UserService.ts
// src/repositories/UserRepository.ts
// src/dto/UserDTOs.ts
```

### Strategy 3: Feature Split

Split by feature when a file handles multiple features.

**Before:**
```typescript
// src/handlers/ApiHandler.ts - 600 lines
// User endpoints, Todo endpoints, Auth endpoints
```

**After:**
```typescript
// src/handlers/users/UserHandler.ts
// src/handlers/todos/TodoHandler.ts
// src/handlers/auth/AuthHandler.ts
```

### Strategy 4: Utility Split

Split utility/helper files by function category.

**Before:**
```typescript
// src/utils/helpers.ts - 500 lines
// String utils, Date utils, Validation utils, Format utils
```

**After:**
```typescript
// src/utils/string.ts
// src/utils/date.ts
// src/utils/validation.ts
// src/utils/format.ts
```

---

## Splitting Protocol

### Step 1: Analyze the File

```
FILE ANALYSIS:
1. Count total lines
2. Identify logical components (classes, functions, groups)
3. Map dependencies between components
4. Identify the split strategy (domain/layer/feature/utility)
```

### Step 2: Design the Split

```
SPLIT PLAN:
- Component A → file1.ts (lines 1-150)
- Component B → file2.ts (lines 151-300)
- Component C → file3.ts (lines 301-450)
- Shared types → types.ts
- Index file → barrel export
```

### Step 3: Execute the Split

1. **Create new files** with extracted components
2. **Update imports** in all dependent files
3. **Create index.ts** barrel export (if needed)
4. **Run tests** to verify nothing broke
5. **Delete original file** if fully extracted

### Step 4: Verify

```bash
# Check file sizes after split
wc -l src/**/*.ts | sort -rn | head -20

# Verify no imports broke
npm run typecheck  # or tsc --noEmit
npm test           # or equivalent
```

---

## Import Patterns for Split Files

### Pattern 1: Barrel Export (Recommended)

```typescript
// src/services/user/index.ts
export { UserValidator } from './UserValidator';
export { UserRepository } from './UserRepository';
export { UserService } from './UserService';
export type { User, CreateUserDTO, UpdateUserDTO } from './types';
```

### Pattern 2: Direct Import

```typescript
// Use when barrel creates circular dependencies
import { UserValidator } from './services/user/UserValidator';
import { UserRepository } from './services/user/UserRepository';
```

### Pattern 3: Module Import

```typescript
// Use for large feature modules
import * as UserService from './services/user';
UserService.UserService.register(data);
```

---

## Common Splitting Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Splitting by line count only | Creates incoherent modules | Split by logical responsibility |
| No barrel export | Clutters imports | Create index.ts for clean imports |
| Circular dependencies | Breaks module system | Identify true boundaries, extract shared types |
| Duplicating types | Type drift | Create shared types file |
| Not updating tests | Broken tests | Update test imports immediately |

---

## File Size Monitoring

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

MAX_LINES=500

for file in $(git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$'); do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt "$MAX_LINES" ]; then
    echo "❌ ERROR: $file has $lines lines (max: $MAX_LINES)"
    echo "Split this file before committing."
    exit 1
  fi
done
```

### CI Check

```yaml
# .github/workflows/size-check.yml
name: File Size Check
on: [pull_request]
jobs:
  check-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check file sizes
        run: |
          find src/ -name "*.ts" -o -name "*.tsx" | while read file; do
            lines=$(wc -l < "$file")
            if [ "$lines" -gt 500 ]; then
              echo "❌ $file: $lines lines"
              exit 1
            fi
          done
          echo "✅ All files under 500 lines"
```

---

## Red Flags — Immediate Split Required

- File exceeds 500 lines
- File has more than 3 classes/functions
- File mixes business logic with data access
- File handles multiple unrelated features
- File has more than 10 imports
- Review comments mention "hard to follow"
- Merge conflicts frequently occur in this file

---

## The Bottom Line

```
500 lines is not a suggestion. It's a limit.
If you're approaching it, split now.
Don't wait. Don't "finish this feature first." Split now.
```

**Small files = clear code = happy developers = happy AI = quality software.**
