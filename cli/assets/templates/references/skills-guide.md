# Nourivex Skills Guide

## Overview

The 16 discipline skills form the backbone of the Nourivex Engineering Standard. Each skill enforces a specific aspect of quality software development.

## Skill Categories

### 🔒 Goal & Scope Management
- **nvx-goal-preservation** - Lock objective at task start
- **nvx-watchdog** - Patrol for scope drift during implementation

### 🧪 Testing & Quality
- **nvx-tdd-enforcer** - Test-first discipline enforcement
- **nvx-verification** - Verify before completion claims
- **nvx-reviewer** - Adversarial code review

### 🏗️ Architecture & Design
- **nvx-anti-overengineering** - Enforce simplicity & YAGNI
- **nvx-architectural-consistency** - Match naming/pattern conventions

### 🔧 Implementation Support
- **nvx-idempotency-guard** - Ensure idempotent operations
- **nvx-systematic-debugging** - Structured debugging protocol

### 🧠 Context & Memory
- **nvx-context-pruning** - Keep context window lean
- **nvx-superpower-memory** - Long-term pattern storage
- **nvx-token-efficiency** - Token optimization

### 🤝 Agent Coordination
- **nvx-agent-synchronizer** - State handoff between agents
- **nvx-reasoning-trace** - Reasoning transparency

### 📦 Dependency Management
- **nvx-dependency-lockdown** - Control dependency additions

### 📋 Planning
- **nvx-planner** - Multi-step planning protocol

## Detailed Skill Usage

### nvx-goal-preservation
**When:** Start of every task  
**Purpose:** Lock the original objective and prevent scope drift

```typescript
skill(name="nvx-goal-preservation")
```

**What it does:**
- Captures the exact user request
- Creates an objective lock
- Prevents feature creep
- Ensures every action traces back to the original goal

### nvx-watchdog
**When:** During implementation  
**Purpose:** Aggressively patrol for scope drift

```typescript
skill(name="nvx-watchdog")
```

**What it does:**
- Monitors every file change
- Checks if changes are in scope
- Triggers alerts on unauthorized additions
- Enforces "if it's not in the plan, it doesn't go in the code"

### nvx-tdd-enforcer
**When:** Before writing any code  
**Purpose:** Enforce test-first development

```typescript
skill(name="nvx-tdd-enforcer")
```

**What it does:**
- Requires failing test before implementation
- Validates test coverage
- Prevents code without tests
- Enforces minimal implementation

### nvx-anti-overengineering
**When:** Design decisions  
**Purpose:** Enforce simplicity and YAGNI principle

```typescript
skill(name="nvx-anti-overengineering")
```

**What it does:**
- Questions unnecessary abstractions
- Prevents premature optimization
- Enforces "You Aren't Gonna Need It"
- Keeps solutions fit-for-purpose

### nvx-architectural-consistency
**When:** Adding files/components  
**Purpose:** Match existing patterns and conventions

```typescript
skill(name="nvx-architectural-consistency")
```

**What it does:**
- Enforces naming conventions
- Validates folder structure
- Ensures pattern consistency
- Prevents architectural drift

### nvx-verification
**When:** Before claiming "done"  
**Purpose:** Verify before success claims

```typescript
skill(name="nvx-verification")
```

**What it does:**
- Requires actual verification commands
- Prevents "should work" claims
- Validates with real output
- No claims without evidence

### nvx-reviewer
**When:** After implementation  
**Purpose:** Adversarial code review

```typescript
skill(name="nvx-reviewer")
```

**What it does:**
- Catches logic flaws
- Identifies edge cases
- Validates architectural consistency
- Enforces scope boundaries

### nvx-idempotency-guard
**When:** Script execution  
**Purpose:** Ensure idempotent operations

```typescript
skill(name="nvx-idempotency-guard")
```

**What it does:**
- Validates scripts can run multiple times
- Prevents state corruption
- Ensures consistent results
- Handles partial failures gracefully

### nvx-context-pruning
**When:** Long workflows  
**Purpose:** Keep context window lean

```typescript
skill(name="nvx-context-pruning")
```

**What it does:**
- Discards irrelevant failure logs
- Removes intermediate states
- Keeps only resolved context
- Optimizes token usage

### nvx-dependency-lockdown
**When:** Before npm install  
**Purpose:** Control dependency additions

```typescript
skill(name="nvx-dependency-lockdown")
```

**What it does:**
- Requires formal research before adding
- Analyzes dependency necessity
- Checks for existing alternatives
- Prevents dependency bloat

### nvx-superpower-memory
**When:** Cross-session learning  
**Purpose:** Long-term pattern storage

```typescript
skill(name="nvx-superpower-memory")
```

**What it does:**
- Stores successful patterns
- Remembers user preferences
- Enables cross-session learning
- Builds institutional knowledge

### nvx-agent-synchronizer
**When:** Agent transitions  
**Purpose:** State handoff between agents

```typescript
skill(name="nvx-agent-synchronizer")
```

**What it does:**
- Synchronizes context between agents
- Ensures seamless handoffs
- Maintains state consistency
- Prevents information loss

### nvx-reasoning-trace
**When:** Critical actions  
**Purpose:** Reasoning transparency

```typescript
skill(name="nvx-reasoning-trace")
```

**What it does:**
- Forces internal reasoning output
- Improves transparency
- Aids debugging
- Documents decision process

### nvx-systematic-debugging
**When:** Bug investigation  
**Purpose:** Structured debugging protocol

```typescript
skill(name="nvx-systematic-debugging")
```

**What it does:**
- Provides systematic approach
- Prevents random fixes
- Ensures root cause analysis
- Documents investigation process

### nvx-token-efficiency
**When:** Long sessions  
**Purpose:** Token optimization

```typescript
skill(name="nvx-token-efficiency")
```

**What it does:**
- Prioritizes relevant files
- Avoids reloading context
- Communicates concisely
- Optimizes tool usage

### nvx-planner
**When:** Complex tasks  
**Purpose:** Multi-step planning protocol

```typescript
skill(name="nvx-planner")
```

**What it does:**
- Breaks work into atomic tasks
- Creates TDD roadmaps
- Identifies risks
- Defines verification steps

## Combining Skills

Skills work best when combined. Here are common combinations:

```typescript
// Full implementation workflow
skill(name="nourivex-runtime")
skill(name="nvx-goal-preservation")
skill(name="nvx-tdd-enforcer")
skill(name="nvx-watchdog")

// Debugging session
skill(name="nvx-systematic-debugging")
skill(name="nvx-reasoning-trace")
skill(name="nvx-verification")

// Architecture review
skill(name="nvx-anti-overengineering")
skill(name="nvx-architectural-consistency")
skill(name="nvx-reviewer")
```
