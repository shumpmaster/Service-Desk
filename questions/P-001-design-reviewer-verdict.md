# Ruling needed: The Design reviewer's setup can't merge while the Reviewer's last verdict is FAIL. How should it get one?

Milestone: none (a governance change the owner asked for)
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: You chose to have the last two findings fixed and the setup sent straight to you, with no fourth review. The fixes are in. But the project's checks require a passing verdict from the Reviewer on this kind of change, and its last verdict is FAIL, so the check stays red and the pull request can't merge. Left unruled, it waits.
OPTIONS:
  A. A short confirmation — A fresh Reviewer checks only that the round-3 findings are fixed, not the whole change again; its verdict is recorded, and the setup comes to you.
  B. You merge over the red check — The record keeps the Reviewer's FAIL and your ruling; GitHub lets you merge as the repository's owner.
RECOMMENDATION: A — it takes minutes, keeps the checks honest, and is narrower than the fourth review you turned down.
RISK CLASS: R3   REVERSIBILITY: reversible   BLAST RADIUS: how the Design reviewer's setup gets its required verdict
DEFAULT: A   TIMEOUT: 48

## Context
- The owner's earlier answer: fix and send it, no fourth review (source: decisions/questions/P-001-design-reviewer-stop.md, pull request #154)
- The Reviewer's round-3 report (source: reviews/design-reviewer-setup/_review-round3-verbatim.md on orch/design-reviewer)
- The check that requires a passing verdict (source: governance/checks/review_check.py)
