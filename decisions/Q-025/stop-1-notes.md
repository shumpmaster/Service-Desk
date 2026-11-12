# Q-025 stop-1 — the Chief of Staff's notes

Recommendation: `re-specify`.

Why: Q-025 asks how status and history views show their as-of time, sources and gaps. Seven of its proposed facts passed their source checks and are filed on its branch (research/Q-025-source-check.md on item/Q-025). One stays out: `F-agent-false-success-01`, a single author's preprint (Advani, 2026) whose figures the checker confirmed against the paper's abstract, but which has no second independent source; the Source checker's instructions ask for two independent sources for load-bearing facts (.claude/agents/source-checker.md). Triage traced the stop to that one claim and found the checker working as designed (triage/Q-025.md on item/Q-025).
- `re-specify` sends the memo back to the Researcher with rounds reset, with the source check's reasons. Dropping the claim passes under the rules as they stand, and marking it single-source and not load-bearing should pass, unless the checker reads the risk-and-quality line of the source rule more widely. Nothing tells the Researcher which, so it may hold the claim again and stop the same way; if it does, the card comes back to the owner.
- `confirm` sends the same memo to the same checker unchanged, so it would fail on the same claim.
- `drop` would close the item, and a closed item never merges (governance/checks/orchestrator_git.py, `ready_items`), so the seven filed facts would stay off the main branch.
- Filing the claim as load-bearing on one source would need a waiver written into the source rule, a governance change only the owner can make; this answer does not rule that out later.

`re-specify` is reversible, changes no rule, and is answered as the owner's proxy under L-0047 (decisions/Q-025/stop-1.md). It is logged as a strike on the dispatch line.
