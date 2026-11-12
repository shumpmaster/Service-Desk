# Q-027 stop-1 — the Chief of Staff's notes

Recommendation: `re-specify`.

Why: Q-027 asks what access a view across the owner's repositories needs to read, and what acting from it would add. Its third source check confirmed every claim the memo makes about GitHub's and Cloudflare's pages, and 16 of its facts are already filed on its branch (research/Q-027-source-check.md on item/Q-027). The one failure is a citation: the pattern `P-gh-cross-repo-alerts-01` gives `F-Q004-3a`, a fact about delivery delay, as its reason that webhooks are not retried, where the library's fact for that is `F-Q004-1`. The Researcher can correct it in one revision. `confirm` sends the same memo to the same checker unchanged, so it would fail on the same line. `drop` would close the item, and a closed item never merges (governance/checks/orchestrator_git.py, `ready_items`), so the 16 filed facts would stay off the main branch.

Triage did not find this: its return (triage/Q-027.md on item/Q-027) says its folder held no source check and no verdict, so it traced nothing. This is the same gap seen on Q-019's triage (decisions/Q-019/stop-1-notes.md), filed for the Orchestrator as a defect of the triage dispatch, not of Q-027.

`re-specify` is reversible and is answered as the owner's proxy under L-0047 (decisions/Q-027/stop-1.md).
