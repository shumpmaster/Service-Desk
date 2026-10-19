# Ruling needed: The Design reviewer's setup failed its third review. How should it go on?

Milestone: none (a governance change the owner asked for)
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: The stop rule sends a third failed review to you. Rounds 1 and 2 found real gaps, all now fixed. Round 3 found two small ones: the ledger line says changes are checked against three test projects, but the made-up one has no test data yet; and the rulebook enforces "sized like Linear" with nothing written down to measure it against. Left unruled, the setup waits.
OPTIONS:
  A. Fix and send it to you — I fix both (the ledger line names the test data that exists; "sized like Linear" is measured against the mockup you approve next, and not enforced until then), plus the small notes, and send it straight to you for your verdict.
  B. One more review round — The same fixes, then a fourth review before it comes to you.
  C. Hold it — Wait until you've approved the new mockup, so the sizes are written down first.
RECOMMENDATION: A — both fixes are wording, the rest passed three reviews, and your verdict is the final check anyway.
RISK CLASS: R3   REVERSIBILITY: reversible   BLAST RADIUS: when the Design reviewer starts checking page changes
DEFAULT: C   TIMEOUT: 48

## Context
- The Reviewer's round-3 report (source: reviews/design-reviewer-setup/_review-round3-verbatim.md on orch/design-reviewer)
- The earlier rounds (source: reviews/design-reviewer-setup/_review-round1-verbatim.md and _review-round2-verbatim.md on orch/design-reviewer)
- The pull request (source: pull request #148)
