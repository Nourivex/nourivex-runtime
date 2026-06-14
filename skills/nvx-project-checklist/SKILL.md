---
name: nvx-project-checklist
description: Use at project start and completion to verify best practices — structure, quality, testing, security, performance, and documentation standards
---

# Project Checklist

## Overview

Best practices aren't optional. They're the difference between code that works and code that's maintainable, secure, and performant. This checklist ensures every project meets engineering standards before it's considered complete.

**Core principle:** If it's not checked, it's not done.

---

## The Iron Law

```
NO PROJECT IS COMPLETE UNTIL ALL APPLICABLE CHECKS PASS.
NO EXCEPTIONS.
```

---

## When to Use

- **Project Start:** Verify structure before writing code
- **Mid-Project:** Periodic checks during implementation
- **Before Commit:** Quick verification of standards
- **Task Completion:** Full checklist before declaring done
- **Code Review:** Verify before approving PRs

---

## Checklist Categories

### 📁 Structure (Project Setup)

| Check | Status | Notes |
|-------|--------|-------|
| `src/` directory exists | [ ] | |
| `tests/` directory exists | [ ] | |
| `docs/` directory exists (if needed) | [ ] | |
| Configuration files in root | [ ] | |
| `.gitignore` configured | [ ] | |
| `package.json` or equivalent | [ ] | |
| README.md exists | [ ] | |

**Verification:**
```bash
# Check structure
ls -la
ls -la src/
ls -la tests/
```

### 🔧 Code Quality

| Check | Status | Notes |
|-------|--------|-------|
| Linter configured (ESLint/etc.) | [ ] | |
| Formatter configured (Prettier/etc.) | [ ] | |
| No `any` types (TypeScript) | [ ] | |
| No `@ts-ignore` or `@ts-expect-error` | [ ] | |
| No `console.log` in production code | [ ] | |
| No hardcoded values (use constants/env) | [ ] | |
| All functions have clear names | [ ] | |
| No magic numbers | [ ] | |

**Verification:**
```bash
# TypeScript strict mode check
grep -r "strict" tsconfig.json

# Find any types
grep -rn "as any" src/
grep -rn "@ts-ignore" src/

# Find console.log
grep -rn "console.log" src/
```

### 🧪 Testing

| Check | Status | Notes |
|-------|--------|-------|
| Test framework configured | [ ] | |
| Test runner works | [ ] | |
| All new code has tests | [ ] | |
| Tests are meaningful (not trivial) | [ ] | |
| Edge cases covered | [ ] | |
| Error cases covered | [ ] | |
| Coverage reporting enabled | [ ] | |
| No flaky tests | [ ] | |

**Verification:**
```bash
# Run tests
npm test  # or equivalent

# Check coverage
npm run test:coverage  # if configured
```

### 🔒 Security

| Check | Status | Notes |
|-------|--------|-------|
| No secrets in code | [ ] | |
| Environment variables for config | [ ] | |
| Input validation present | [ ] | |
| SQL injection prevention | [ ] | |
| XSS prevention | [ ] | |
| CSRF protection (if applicable) | [ ] | |
| Authentication in place (if needed) | [ ] | |
| Authorization checks (if needed) | [ ] | |

**Verification:**
```bash
# Check for secrets
grep -rn "password" src/
grep -rn "api_key" src/
grep -rn "secret" src/

# Check for .env in git
git ls-files | grep "\.env$"
```

### ⚡ Performance

| Check | Status | Notes |
|-------|--------|-------|
| No N+1 queries | [ ] | |
| Pagination for large datasets | [ ] | |
| Caching strategy defined | [ ] | |
| Database indexes in place | [ ] | |
| No synchronous blocking | [ ] | |
| Images optimized | [ ] | |
| Bundle size reasonable | [ ] | |

**Verification:**
```bash
# Check for N+1 (example patterns)
grep -rn "\.find(" src/ | grep -v "test" | wc -l

# Check bundle size
npm run build  # then check output
```

### 📚 Documentation

| Check | Status | Notes |
|-------|--------|-------|
| README.md has setup instructions | [ ] | |
| README.md has usage examples | [ ] | |
| API documentation (if applicable) | [ ] | |
| Complex functions documented | [ ] | |
| README.md has contributing guide | [ ] | |
| Changelog maintained | [ ] | |

**Verification:**
```bash
# Check README exists and has content
wc -l README.md

# Check for API docs
ls docs/api/  # if applicable
```

### 🏗️ Architecture

| Check | Status | Notes |
|-------|--------|-------|
| Consistent patterns used | [ ] | |
| Clear module boundaries | [ ] | |
| No circular dependencies | [ ] | |
| Separation of concerns | [ ] | |
| Single responsibility principle | [ ] | |
| Dependency injection (if applicable) | [ ] | |

**Verification:**
```bash
# Check for circular dependencies
npx madge --circular src/

# Check file sizes (500-line limit)
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -10
```

### 🚀 Deployment

| Check | Status | Notes |
|-------|--------|-------|
| Build script works | [ ] | |
| Environment config defined | [ ] | |
| Error handling in production | [ ] | |
| Logging configured | [ ] | |
| Health check endpoint (if API) | [ ] | |
| Graceful shutdown handling | [ ] | |

**Verification:**
```bash
# Build check
npm run build  # or equivalent

# Check for error handling
grep -rn "catch" src/ | wc -l
grep -rn "throw" src/ | wc -l
```

---

## Quick Check (Before Each Commit)

```
QUICK VERIFICATION:
1. Linter passes: npm run lint
2. Tests pass: npm test
3. No files > 500 lines: find src/ -name "*.ts" | xargs wc -l | awk '$1 > 500'
4. No secrets: grep -rn "password\|api_key\|secret" src/
5. Types clean: npm run typecheck  # if TypeScript
```

---

## Full Check (Before Task Completion)

```
FULL VERIFICATION:
1. All structure checks pass
2. All quality checks pass
3. All tests pass with coverage
4. No security issues
5. Performance acceptable
6. Documentation complete
7. Architecture sound
8. Deployment ready
9. File size limit respected
10. No scope drift
```

---

## Check Report Format

```markdown
# Project Check Report

**Date:** [DATE]
**Project:** [NAME]
**Checked by:** [AGENT/USER]

## Summary
- ✅ Passed: [N] checks
- ❌ Failed: [N] checks
- ⚠️ Warnings: [N]

## Failed Items
1. [ ] [Check name] - [Issue description]
   - File: [path]
   - Fix: [suggested fix]

## Warnings
1. [ ] [Check name] - [Warning description]
   - File: [path]
   - Recommendation: [suggestion]

## Verification Commands
```bash
[Commands used to verify]
```

## Next Steps
1. [Action item 1]
2. [Action item 2]
```

---

## Common Issues and Fixes

| Issue | Fix |
|-------|-----|
| File > 500 lines | Use nvx-code-splitter to decompose |
| No tests | Write tests with nvx-tdd-enforcer |
| Hardcoded secrets | Move to environment variables |
| Missing docs | Add to README.md |
| Circular deps | Extract shared types/interfaces |
| `any` types | Add proper type annotations |
| Console.log | Remove or replace with logger |

---

## Red Flags — Stop and Fix

- Any check fails before completing a task
- Files exceed 500-line limit
- Tests are skipped or deleted to pass
- Security vulnerabilities found
- Documentation is missing or outdated
- Architecture violations detected

---

## The Bottom Line

```
If it's not checked, it's not done.
If it fails, fix it before moving on.
No shortcuts. No "we'll fix it later."
```

**Check early. Check often. Check everything.**
