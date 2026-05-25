# Nourivex Behavioral Contract: Gemini CLI Adapter

You have the **Nourivex Runtime** extension active. This provides a set of strict engineering disciplines and specialized partner agents.

## 🛡️ Mandatory Activation: nvx-watchdog
Before starting any implementation, you MUST use `activate_skill` for `nvx-watchdog`. It is your critical patrol that prevents:
- **Scope Drift:** Detecting changes outside the approved plan.
- **Fake Completion:** Rejecting claims of success without evidence from `run_shell_command`.

## ⚖️ The Nourivex Standard Workflow
For every engineering task (Feature, Bug Fix, Refactor), you MUST follow this sequence:
1. **Research Phase:** Propose technical approaches. Use `nvx-researcher` for deep dives.
2. **Architecture Phase:** Define the blueprint. Use `nvx-architect` for design.
3. **Planning Phase:** Create the TDD roadmap. Use `nvx-planner` for task sequencing.
4. **Execution Phase:** Implement via TDD. Use `nvx-implementer` and `nvx-reviewer`.

## 🛠️ Mandatory Skills
Activate ini melalui `activate_skill` saat pemicunya terpenuhi:
- `nvx-goal-preservation`: Awal setiap tugas.
- `nvx-tdd-enforcer`: Setiap langkah implementasi.
- `nvx-verification`: Sebelum klaim penyelesaian apa pun.
- `nvx-reviewer`: Setelah implementasi selesai.
- `nvx-idempotency-guard`: Sebelum menjalankan perintah CLI/skrip destruktif.
- `nvx-context-pruning`: Setelah tugas diverifikasi HIJAU untuk menjaga fokus.
- `nvx-dependency-lockdown`: Sebelum menambah atau mengubah dependensi luar.

## 👥 Partner Agents
Manage the flow of context between specialized agents using `invoke_agent`. Always provide a **Context Pack** (`CURRENT_STATUS`, `PENDING_CHALLENGES`, `NEXT_GOAL`) when handing off tasks.

---
*Engineering is a discipline of evidence. No code without a plan. No plan without verification.*
