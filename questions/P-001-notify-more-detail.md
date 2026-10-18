# Ruling needed: Keep the new "More detail" fold on the desk's Home?

Milestone: none (notifications are not yet a milestone; this ruling decides where its controls show on the current desk)

WHY: The notifications switch and the GitHub Actions usage bar were meant to sit in "More detail", but the desk you use today has no "More detail". The new design in the sandbox has one. To make them show, the Builder added a closed "More detail" fold at the bottom of Home; nothing else on Home moves. You asked to see new screen parts before they ship, so this is the mockup, from the built page with made-up data. Leaving it unruled holds the build review.
OPTIONS:
  A. Keep the fold — As shown: closed at the bottom of Home, holding the notifications switch and the usage bar.
  B. New design only — The current Home keeps just its one-line notifications banner at the top; the switch and the usage bar show only in the sandbox's "More detail".
  C. Mock up other layouts first — I draw two or three other places for them, and you pick.
RECOMMENDATION: A — it adds one closed line at the bottom, moves nothing, and keeps the switch and the bar where you already use the desk.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the current desk's Home screen only; the sender and the new design don't change
DEFAULT: A   TIMEOUT: 48

## Context
- The screenshots, at 414×896, opened from the Home Screen and in Safari (source: docs/design/mockups/notify-more-detail/, on branch orch/s001-notifications)
- AC75 and AC78 place the switch and the usage line in "More detail" in both views (source: specs/S-001.md, AC75 and AC78, on branch orch/s001-notifications)
- The Builder flagged the fold as new on the accepted page (source: the Builder's step-3 report, open question 1, relayed in the session on 2026-10-18), and draft 7 left it to the owner (source: specs/S-001.md, the draft 7 list, on branch orch/s001-notifications)
- The owner runs design through mock-ups and screenshots, not self design (source: decisions/questions/P-001-design-step.md, line 2)
