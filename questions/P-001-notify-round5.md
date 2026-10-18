# Ruling needed: The notifications plan's fifth check failed on two gaps; how to go on?

Milestone: none (notifications are not yet a milestone; this ruling decides how the spec change that adds them proceeds)

WHY: Building the sender raised 15 small questions, so the Definer wrote draft 6 to settle them, with three rulings from the Orchestrator that keep the spec's promise to you. The Critic failed draft 6 on two gaps. First, the alert that tells you notifications have stopped could be held shut by a saved file from a branch or a stranger's pull request. Second, the spec doesn't pin down when the desk checks for an answer closed without merging, so it could keep hiding a question your phone has just told you about. It also gave ten smaller notes. A fail at round 3 or later comes to you. Leaving it unruled holds the build review.
OPTIONS:
  A. Fix, recheck the fixes — The Definer fixes both gaps and the ten notes, and the Critic checks only the fixes. The Builder keeps building meanwhile, so it costs no time.
  B. Fix, then build — As A, but with no recheck; the Reviewer's build review checks the fixes with the rest.
  C. Pause it — Leave the plan as it is.
RECOMMENDATION: A — the first gap is a security hole, and the recheck runs alongside the build, so it adds no delay.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the notifications spec change only; nothing built changes
DEFAULT: A   TIMEOUT: 48

## Context
- The Critic's check of draft 6 failed it on two blocking findings and ten notes (source: reviews/S-001-notifications/_critic-round5-verbatim.md, on branch orch/s001-notifications)
- Draft 6 is three Definer commits, 4d32f0d, 9f43c5c and afb32da (source: branch build/definer/s001-notifications)
- The Builder's 15 open questions from building the sender (source: the Builder's step-2 report, relayed in the session on 2026-10-18; settled in specs/S-001.md's "Draft 6: the sender's open questions" list on branch orch/s001-notifications)
- The owner ruled "Fix, then build (Recommended)" on round 4 (source: decisions/questions/P-001-notify-round4.md)
- A fail at plan-review round 3 or later goes to the owner; Service-Desk follows the model repository's rule by choice (source: docs/LEDGER.md, L-0011; Personal-Org-Operating-Model specs/S-030-plan-stop-rule.md)
