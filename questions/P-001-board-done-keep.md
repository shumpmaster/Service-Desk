# Ruling needed: How long do finished cards stay in Done?

Milestone: MD2
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: Cards GitHub confirms as done stay in the Done lane for a while, then leave. Left unruled, they stay for 24 hours.
OPTIONS:
  A. Today only — Done empties at midnight, your time.
  B. The last 24 hours — Last night's work is still there in the morning.
  C. The last 10 — The ten most recent, however old.
RECOMMENDATION: B — you still see last night's work in the morning, and the list stays short.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the Done lane's length
DEFAULT: B   TIMEOUT: 48

## Context
- The owner asked for the desk as a board: drag a "waiting on me" card to done, and one link straight to what is needed, prefilled as far as possible (source: docs/design/references/owner-request-2026-10-19-board.md on orch/board-mockup)
- Three pull requests stayed waiting because the desk offered a verdict box where only a merge was needed (source: docs/design/references/owner-request-2026-10-19-board.md on orch/board-mockup)
- The mockup shows two lanes and one step per card (source: docs/design/mockups/board.html on orch/board-mockup)
