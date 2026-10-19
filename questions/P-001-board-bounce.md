# Ruling needed: When should a card you marked done come back if GitHub doesn't show it done?

Milestone: MD2
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: A card you drag to Done shows "Checking…" until GitHub confirms it, since the desk itself can't record anything. If GitHub still shows it waiting, for example a merge that didn't go through, the card should come back to "Waiting on you" with "Still waiting: GitHub doesn't show it done yet". Left unruled, it comes back after about 5 minutes.
OPTIONS:
  A. After about 5 minutes — The desk checks GitHub every minute or so, so 5 minutes catches a step that didn't go through while you're still on the phone.
  B. After 15 minutes — Allows for GitHub's slower moments, like today's.
  C. Never — It stays under "Checking…" with a "Still waiting" note.
RECOMMENDATION: A — it catches a missed step while you're still holding the phone.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: when a card marked done returns to waiting
DEFAULT: A   TIMEOUT: 48

## Context
- The owner asked for the desk as a board: drag a "waiting on me" card to done, and one link straight to what is needed, prefilled as far as possible (source: docs/design/references/owner-request-2026-10-19-board.md on orch/board-mockup)
- Three pull requests stayed waiting because the desk offered a verdict box where only a merge was needed (source: docs/design/references/owner-request-2026-10-19-board.md on orch/board-mockup)
- The mockup shows two lanes and one step per card (source: docs/design/mockups/board.html on orch/board-mockup)
