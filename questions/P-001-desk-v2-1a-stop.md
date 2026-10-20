# Ruling needed: Stage 1a of the new desk failed its third review. How should it go on?

Milestone: MD3
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: The stop rule sends a third failed review to you. Both reviewers found every earlier problem fixed and the old screens unchanged. Both found one new problem, caused by the last fix: on the board filtered to one project, when that project was read and then can't be read for a moment, the line "Being asked in your session: 1" (and "Your answer is being recorded") disappears, with its "Answer it here instead" button. The full board still shows it. The fix is small. Left unruled, stage 1a waits.
OPTIONS:
  A. Fix and confirm — The Builder keeps those lines in that view; a fresh reviewer and the Design reviewer check only that fix; then stage 1a comes to you as a pull request with a preview.
  B. One more full round — The same fix, then both full reviews again before it comes to you.
  C. Send it as it is — Stage 1a comes to you now, with this gap written in the pull request; the fix follows in stage 1b's pull request.
RECOMMENDATION: A — the fix is a few lines, everything else passed three rounds, and a narrow check keeps it honest.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: when stage 1a reaches your preview
DEFAULT: B   TIMEOUT: 48

## Context
- The Reviewer's round-3 report (source: reviews/S-001-desk-v2/_build-1a-review-round3-verbatim.md on orch/desk-v2)
- The Design reviewer's round-3 report (source: reviews/S-001-desk-v2/_build-1a-design-round3-verbatim.md on orch/desk-v2)
- The held-question line it hides (source: specs/S-001.md, AC77 as changed by AC80, on orch/desk-v2)
