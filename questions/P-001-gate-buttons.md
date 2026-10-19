# Ruling needed: Should a gate card show its choices as buttons on the board, as well as in its sheet?

Milestone: MD2
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: Mockup v2 puts a gate's four choices (Proceed, Hold, Recycle, Kill) on the card itself (frame 1) and in its sheet with the full case (frame 4). A tap only opens a filled-in answer on GitHub that you still save, so a mis-tap changes nothing. Left unruled, the choices show only in the sheet, after you've seen the case.
OPTIONS:
  A. On the card and in the sheet — One tap from the board when you already know your answer.
  B. In the sheet only — You always see the case before choosing.
RECOMMENDATION: A — nothing is decided until you save the answer on GitHub, so the shortcut costs nothing.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: where a gate's choices show
DEFAULT: B   TIMEOUT: 48

## Context
- Frames 1 and 4 (source: docs/design/mockups/desk-v2/README.md on orch/desk-mockup-v2)
- The owner's answer giving gates their own card (source: decisions/questions/P-001-gate-card.md)
