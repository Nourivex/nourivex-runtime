---
name: nvx-anti-overengineering
description: Use when designing or reviewing any implementation to enforce simplicity, YAGNI, and fit-for-purpose solutions over abstractions, patterns, and premature optimization
---

# Anti-Overengineering

## Overview

Modern AI agents have a chronic illness: they over-architect. They reach for factories when a function suffices, build plugin systems for a single use case, and apply design patterns because they've seen them in training data — not because the problem needs them.

**Core principle:** The simplest solution that satisfies the requirement IS the correct solution. Complexity must be earned, not assumed.

**Every abstraction is debt. Justify it or eliminate it.**

---

## The Iron Law

```
THE SIMPLEST CORRECT SOLUTION WINS. ALWAYS.
```

Complexity requires explicit justification tied to a real, current requirement.

---

## The YAGNI Test

Before adding ANY abstraction, pattern, or optimization, answer:

```
YAGNI CHECK:
- Is there a current, stated requirement that necessitates this? [yes/no]
- Does the simpler version fail to satisfy the requirement? [yes/no]
- Will removing this break the objective? [yes/no]

If any answer is "no" → Remove it. It's overengineering.
```

"We might need it later" is not a justification. "Later" never comes, or when it does, the requirement is different than you imagined.

---

## Overengineering Patterns — Detect and Eliminate

### Pattern 1: Premature Abstraction
```
❌ Overengineered:
class BaseRepository<T> {
  abstract findById(id: string): Promise<T>;
  abstract findAll(): Promise<T[]>;
  // ... 20 abstract methods
}

class TodoRepository extends BaseRepository<Todo> { ... }

✅ Correct (if only one entity needed):
async function getTodo(id: string): Promise<Todo> { ... }
async function getAllTodos(): Promise<Todo[]> { ... }
```

**Ask:** Is there more than one implementation right now? No? No abstract class.

---

### Pattern 2: Plugin / Extension Systems for N=1
```
❌ Overengineered:
interface AuthProvider { ... }
class AuthRegistry { register(name, provider) { ... } }
const registry = new AuthRegistry();
registry.register('jwt', new JWTProvider());

✅ Correct (if only JWT is needed now):
function verifyToken(token: string): User { ... }
```

**Ask:** Do we have multiple implementations TODAY? No? No registry.

---

### Pattern 3: Premature Optimization
```
❌ Overengineered (no performance requirement stated):
// Redis cache layer, connection pooling, query optimization...
const result = await cache.get(key) ?? await db.findWithIndex(id);

✅ Correct:
const result = await db.find(id);
```

**Ask:** Is there a measured performance problem? No? No optimization.

---

### Pattern 4: Configuration Over Implementation
```
❌ Overengineered:
const config = {
  features: {
    todo: { enabled: true, maxItems: 100, pagination: { enabled: true, default: 20 } }
  }
}

✅ Correct (if requirements are fixed):
const MAX_TODOS = 100;
```

**Ask:** Will this config actually change? No? Hardcode it.

---

### Pattern 5: Event-Driven for Simple Sequential Logic
```
❌ Overengineered:
eventBus.emit('todo:created', todo);
eventBus.on('todo:created', (todo) => notifyUser(todo));

✅ Correct:
const todo = await createTodo(data);
await notifyUser(todo);
```

**Ask:** Do multiple unrelated systems need to react to this? No? Direct call.

---

## Complexity Budget

Every system has a complexity budget. Each addition costs:

| Addition | Cost |
|----------|------|
| New abstraction layer | High — must justify against current requirement |
| New pattern (factory, observer, strategy) | High — only if multiple implementations exist today |
| New dependency | Medium — must justify against native alternatives |
| Configuration option | Medium — only if the value genuinely varies |
| New file/module | Low — but must have single clear responsibility |

If you're over budget on a feature with no complex requirements, you've overengineered it.

---

## The Complexity Justification Protocol

When you feel the urge to add complexity, complete this before proceeding:

```
COMPLEXITY JUSTIFICATION:
- What I want to add: [abstraction/pattern/optimization]
- Current requirement that necessitates it: [exact requirement]
- What breaks without it right now: [specific failure]
- Simpler alternative I considered: [simpler option]
- Why simpler alternative is insufficient: [specific reason]

If you cannot complete this → Do NOT add the complexity.
```

---

## Code Review Checklist (Anti-Overengineering)

Before finalizing any implementation:

- [ ] Can any abstraction layer be removed without breaking requirements?
- [ ] Does every interface have more than one current implementation?
- [ ] Is every config option actually varied in practice?
- [ ] Does every dependency earn its place (vs. native solution)?
- [ ] Is every design pattern justified by the CURRENT problem complexity?
- [ ] Could a junior developer understand this without reading docs?
- [ ] Would the next maintainer curse you for the complexity?

---

## Simplicity Signals

You're on the right track when:
- The implementation reads like prose
- A junior developer can understand it in 5 minutes
- Removing a component breaks something (meaning it earns its place)
- You can explain the architecture in one sentence

You've overengineered when:
- You need a diagram to explain a simple feature
- There are more files than requirements
- "Flexibility" is the main justification
- The abstraction only has one implementation

---

## Red Flags — Stop and Simplify

- "This will be more flexible/extensible/scalable..."
- "We might need to swap this out later..."
- "This follows the [Enterprise Pattern Name]..."
- "This is cleaner architecturally..."
- Adding interfaces where there's one implementation
- Creating registries, factories, or builders for N=1 use cases
- Adding config options that won't vary
- "Future-proofing" any component

**All of these mean: Stop. Write the simplest version first.**

---

## The Bottom Line

Write the dumbest code that works. Add complexity only when the requirement demands it, not when you imagine it might be needed.

Simple code ships. Simple code is debugged. Simple code is maintained. Clever code is a liability.
