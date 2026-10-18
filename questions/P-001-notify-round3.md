# Ruling needed: The notifications plan's third review round failed on one point; how to go on?

Milestone: none (notifications are not yet a milestone; this ruling decides how the spec change that adds them proceeds)

WHY: In round 3 the Reviewer passed the notifications plan, but the Critic failed it on one point, which is the stale link you reported: the plan ends a question's hold at "that session's end line", and a session log can already hold an earlier end line, so the hold would end at once. The fix is one condition. A fail at round 3 or later comes to you. Leaving it unruled holds the build.
OPTIONS:
  A. Fix, recheck the fixes — The Definer fixes that point and folds in the notes from both checks, and the Critic and the Reviewer check just those changes once more. Then the plan goes to build.
  B. Fix, then build — The Definer fixes it and the notes, and building starts with no further check of the plan.
  C. Pause it — Leave the plan as it is.
RECOMMENDATION: A — the fix is small, it touches the very problem you reported, and one short recheck confirms it.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the notifications spec change only; nothing built changes
DEFAULT: A   TIMEOUT: 48

## Context
- The Critic's round 3 failed on one blocking finding, B1: the hold ends at "that session's end line", and the reported session already has an end line from 03:08:21Z, before any of the questions was filed (source: reviews/S-001-notifications/_critic-round3-verbatim.md, on branch orch/s001-notifications)
- The Reviewer's round 3 passed, with notes, and every repository check passed (source: reviews/S-001-notifications/_plan-review-round3-verbatim.md, on branch orch/s001-notifications)
- A fail at plan-review round 3 or later goes to the owner; Service-Desk follows the model repository's rule by choice (source: docs/LEDGER.md, L-0011; Personal-Org-Operating-Model specs/S-030-plan-stop-rule.md)
