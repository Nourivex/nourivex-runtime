export function generateSkillContent(platform) {
    return `---
name: nourivex-runtime
description: "Provider-agnostic AI engineering framework with 16 discipline skills and 5 specialized agents. Enforces Research → Architecture → Planning → TDD Execution workflow."
---

# Nourivex Runtime - Engineering Discipline Framework

**Nourivex Runtime** is a provider-agnostic AI engineering framework that enforces a strict **Research → Architecture → Planning → TDD Execution** workflow with 16 built-in skills and 5 specialized agents.

## When to Apply

This skill should be used when the task involves **software engineering, code implementation, debugging, or any technical work that requires disciplined approach**.

### Must Use

This skill must be invoked in the following situations:

- Implementing any new feature or bug fix
- Working on multi-step technical tasks
- Debugging complex issues
- Refactoring existing code
- Any task that requires test-driven development
- Architecture decisions or system design

### Recommended

This skill is recommended in the following situations:

- Code review or quality assurance
- Performance optimization
- Security-related implementations
- Integration with external systems

### Skip

This skill is not needed in the following situations:

- Simple text editing or documentation
- Non-technical tasks
- Quick one-line fixes (though TDD discipline still applies)

## The 5-Phase Workflow

Every task MUST follow this sequence:

\`\`\`
Phase 1: Research → Phase 2: Architecture → Phase 3: Planning → Phase 4: TDD Execution → Phase 5: Review
\`\`\`

### Phase 1: Research (nvx-researcher)
- Explore context using native tools
- Identify existing patterns and constraints
- Analyze dependencies
- Propose 2-3 technical approaches

### Phase 2: Architecture (nvx-architect)
- Define component boundaries
- Design data models
- Specify APIs
- Establish folder structure

### Phase 3: Planning (nvx-planner)
- Break work into atomic tasks
- Create TDD roadmap
- Identify risks
- Define verification steps

### Phase 4: TDD Execution (nvx-implementer)
- Write failing tests first
- Implement minimal code to pass
- Refactor while keeping tests green
- Run full test suite

### Phase 5: Review (nvx-reviewer)
- Critical code review
- Edge case verification
- Scope drift detection
- Architecture consistency check

## The 16 Discipline Skills

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| \`nvx-goal-preservation\` | Lock objective at task start | Start of every task |
| \`nvx-watchdog\` | Patrol for scope drift | During implementation |
| \`nvx-tdd-enforcer\` | Test-first discipline | Before writing any code |
| \`nvx-anti-overengineering\` | Enforce simplicity & YAGNI | Design decisions |
| \`nvx-architectural-consistency\` | Match naming/pattern conventions | Adding files/components |
| \`nvx-verification\` | Verify before completion claims | Before claiming "done" |
| \`nvx-reviewer\` | Adversarial code review | After implementation |
| \`nvx-idempotency-guard\` | Ensure idempotent operations | Script execution |
| \`nvx-context-pruning\` | Keep context window lean | Long workflows |
| \`nvx-dependency-lockdown\` | Control dependency additions | Before npm install |
| \`nvx-superpower-memory\` | Long-term pattern storage | Cross-session learning |
| \`nvx-agent-synchronizer\` | State handoff between agents | Agent transitions |
| \`nvx-reasoning-trace\` | Reasoning transparency | Critical actions |
| \`nvx-systematic-debugging\` | Structured debugging protocol | Bug investigation |
| \`nvx-token-efficiency\` | Token optimization | Long sessions |
| \`nvx-planner\` | Multi-step planning protocol | Complex tasks |

## How to Use in ${platform.charAt(0).toUpperCase() + platform.slice(1)}

### Load the Framework

\`\`\`typescript
skill(name="nourivex-runtime")
\`\`\`

### Load Individual Skills

\`\`\`typescript
skill(name="nvx-goal-preservation")   // Lock objective
skill(name="nvx-watchdog")            // Patrol scope drift
skill(name="nvx-tdd-enforcer")        // Enforce test-first
skill(name="nvx-anti-overengineering") // Enforce simplicity
\`\`\`

### Delegate to Specialized Agents

\`\`\`typescript
// Research
task(category="deep", load_skills=["nvx-researcher"], run_in_background=true, prompt="Explore...")

// Architecture
task(category="deep", load_skills=["nvx-architect"], run_in_background=false, prompt="Design...")

// Planning
task(category="deep", load_skills=["nvx-planner"], run_in_background=false, prompt="Plan...")

// Implementation
task(category="deep", load_skills=["nvx-implementer", "nvx-tdd-enforcer"], run_in_background=false, prompt="Implement...")

// Review
task(subagent_type="oracle", load_skills=["nvx-reviewer"], run_in_background=false, prompt="Review...")
\`\`\`

## Core Principles

1. **Evidence before Implementation:** No code without a plan.
2. **Test-First:** Failing tests are mandatory before production code.
3. **Simplicity Wins:** Abstractions must be earned, not assumed.
4. **Full Traceability:** Every change must trace back to an approved plan.
5. **Zero Scope Drift:** If it wasn't in the plan, it doesn't go in the code.

---

*Part of the Nourivex Runtime framework. No code without a plan. No plan without verification. No verification without evidence.*
`;
}
export function generateAgentConfig(platform) {
    const config = {
        _schema: "https://opencode.ai/config.json",
        _version: "3.2.0",
        _comment: "Nourivex Runtime - Agent Configuration",
        _usage: "Merge the 'agent' field below into your project's opencode.json. These agents become available via task(subagent_type='nvx-researcher', ...).",
        agent: {
            "nvx-researcher": {
                description: "Specialized research agent for codebase exploration, dependency analysis, and technical discovery.",
                prompt: "You are a senior technical researcher and codebase archeologist. Explore context, identify patterns, analyze dependencies, and propose technical approaches.",
                mode: "subagent",
                color: "#4A90D9",
                maxSteps: 15
            },
            "nvx-architect": {
                description: "Specialized system architect for designing component boundaries, APIs, data models, and folder structures.",
                prompt: "You are a principal software architect. Define component boundaries, design data models, specify APIs, and establish folder structure.",
                mode: "subagent",
                color: "#7B68EE",
                maxSteps: 20
            },
            "nvx-planner": {
                description: "Specialized planning agent for creating TDD roadmaps, implementation sequencing, and bite-sized task breakdowns.",
                prompt: "You are a senior software architect and technical planner. Break work into atomic tasks, create TDD roadmaps, and identify risks.",
                mode: "subagent",
                color: "#32CD32",
                maxSteps: 15
            },
            "nvx-implementer": {
                description: "Specialized implementation agent for writing test-driven production code according to approved plans.",
                prompt: "You are a senior product engineer and TDD specialist. Write failing tests first, implement minimal code to pass, and refactor while keeping tests green.",
                mode: "subagent",
                color: "#FF6347",
                maxSteps: 25
            },
            "nvx-reviewer": {
                description: "Specialized code reviewer for catching logic flaws, edge cases, scope violations, and enforcing architectural consistency.",
                prompt: "You are a meticulous senior reviewer and QA lead. Critically analyze code, catch logic errors, and enforce architectural consistency.",
                mode: "subagent",
                color: "#FFD700",
                maxSteps: 15
            }
        }
    };
    return JSON.stringify(config, null, 2);
}
//# sourceMappingURL=template.js.map