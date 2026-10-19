# Ruling needed: Is the board mockup the direction for the desk's waiting-on-you screen?

Milestone: MD2
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: You asked for the desk to work like a board: a card for each thing waiting on you, one link straight to what is needed, and a drag to Done. The mockup shows two lanes, "Waiting on you" and "Done", each card with one button for the step that actually clears it ("Merge on GitHub", "Answer", "Approve the deploy", or "Step 1 of 2: add your verdict" only where a verdict is needed), and a drag or a "Done ✓" tap that moves it to Done as "Checking…" until GitHub confirms. Left unruled, nothing is built and the present screens stay.
OPTIONS:
  A. Yes, build this — The board replaces the waiting-on-you part of your page (the trial view first), through the usual plan, checks and build. The other screens stay as they are for now.
  B. Yes, with changes — Tell me what to change and I'll redo the mockup before anything is planned.
  C. Not now — Keep the present screens; I fix only the wrong verdict button.
RECOMMENDATION: A — it is what you asked for, and it fixes the verdict-button mix-up at the root.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the waiting-on-you screen of the owner's page; no other screen
DEFAULT: C   TIMEOUT: 48

## Context
- The owner asked for the desk as a board: drag a "waiting on me" card to done, and one link straight to what is needed, prefilled as far as possible (source: docs/design/references/owner-request-2026-10-19-board.md on orch/board-mockup)
- Three pull requests stayed waiting because the desk offered a verdict box where only a merge was needed (source: docs/design/references/owner-request-2026-10-19-board.md on orch/board-mockup)
- The mockup shows two lanes and one step per card (source: docs/design/mockups/board.html on orch/board-mockup)
