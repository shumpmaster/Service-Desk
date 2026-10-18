# Ruling needed: The recheck of the notifications plan found one new gap; how to go on?

Milestone: none (notifications are not yet a milestone; this ruling decides how the spec change that adds them proceeds)

WHY: The Critic's recheck confirmed both earlier gaps are fixed, and nine of the ten notes. It failed draft 7 on one new gap the fixes made. If the desk is already open on your phone and you tap a notification, nothing makes the desk check again, so for a moment it could say "That no longer waits on you" about the thing your phone just told you waits. The fix is a sentence or two: tapping a notification, or bringing the desk back to the front, makes it re-check before it shows the item. There are also three small wording notes. A fail at round 3 or later comes to you. Leaving it unruled holds the build review.
OPTIONS:
  A. Fix, then build — The Definer makes that fix and the three notes; the Reviewer's build review checks them with the rest.
  B. Fix, recheck again — As A, but the Critic checks the fix once more first.
  C. Pause it — Leave the plan as it is.
RECOMMENDATION: A — the fix is a sentence or two, the Critic found nothing else wrong with the earlier fixes, and the build review reads the spec and the code together anyway.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the notifications spec change only; the code built so far changes in one place
DEFAULT: B   TIMEOUT: 48

## Context
- The Critic's recheck failed draft 7 on one blocking finding, A, and three notes (source: reviews/S-001-notifications/_critic-round6-verbatim.md, on branch orch/s001-notifications)
- The owner ruled "Fix, recheck the fixes (Recommended)" on round 5 (source: decisions/questions/P-001-notify-round5.md)
- A fail at plan-review round 3 or later goes to the owner; Service-Desk follows the model repository's rule by choice (source: docs/LEDGER.md, L-0011; Personal-Org-Operating-Model specs/S-030-plan-stop-rule.md)
