# Ruling needed: Which left-to-right board layout should your phone use?

Milestone: MD2
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: You asked for the board's lanes left to right, not stacked. On a phone, three lanes side by side leave each about a third of the screen, so mockup version 4 shows two ways. Left unruled, nothing on the board is planned.
OPTIONS:
  A. All three lanes at once — Waiting on you, Kicked back and Done share the screen. Cards are compact: the title, the pull request number and one short button ("Merge ↗", "Verdict ↗", "Answer ↗"); tap a card for its details and "Done ✓". You see everything at a glance.
  B. Swipe between lanes — Each lane fills most of the screen, the next one peeking in at the right edge, with tabs and counts on top. Cards are full size with their buttons; drag one to the right edge, or tap "Done ✓", to move it.
RECOMMENDATION: A — it is the board you described, everything on one screen, and each card still has its one button.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the board's layout on a phone; wider screens show three columns either way
DEFAULT: A   TIMEOUT: 48

## Context
- The owner asked for left-to-right lanes, not vertical (source: docs/design/references/owner-request-2026-10-19-board.md on orch/board-mockup)
- The two options are drawn in mockup version 4 (source: docs/design/mockups/board.html on orch/board-mockup)
- The owner chose to build the board, with a kicked-back lane (source: decisions/questions/P-001-board-direction.md, pull request #134)
