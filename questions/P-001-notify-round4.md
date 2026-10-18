# Ruling needed: The notifications plan's fourth review round failed on one test sentence; how to go on?

Milestone: none (notifications are not yet a milestone; this ruling decides how the spec change that adds them proceeds)

WHY: The Critic passed draft 4, and the Reviewer failed it on one point: the test meant to prove the stale-link fix on your real session uses your real question from this morning, which was filed before the "Asked in session" line existed, so the test can't pass as written. The fix is one sentence: a copy of that question with the line added, and the real one kept as a second case. A fail at round 3 or later comes to you. Leaving it unruled holds the build.
OPTIONS:
  A. Fix, then build — The Definer fixes that sentence and folds in the notes from both checks; building starts, and the Reviewer's build review checks the fix with the rest.
  B. Fix, recheck again — As A, but both checks look at the changes once more before building starts.
  C. Pause it — Leave the plan as it is.
RECOMMENDATION: A — the fix is one test sentence, both checks agree everything else is sound, and the build review checks it anyway.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the notifications spec change only; nothing built changes
DEFAULT: B   TIMEOUT: 48

## Context
- The Critic's round 4 passed draft 4 with notes (source: reviews/S-001-notifications/_critic-round4-verbatim.md, on branch orch/s001-notifications)
- The Reviewer's round 4 failed it on one blocking finding, B1: AC77's real-record test expects a question with no "Asked in session:" line to show as held (source: reviews/S-001-notifications/_plan-review-round4-verbatim.md, on branch orch/s001-notifications)
- The owner ruled "Fix, recheck the fixes (Recommended)" on round 3 (source: decisions/questions/P-001-notify-round3.md)
- A fail at plan-review round 3 or later goes to the owner; Service-Desk follows the model repository's rule by choice (source: docs/LEDGER.md, L-0011; Personal-Org-Operating-Model specs/S-030-plan-stop-rule.md)
