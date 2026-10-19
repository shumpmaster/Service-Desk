# Ruling needed: Should a card you've just moved to Done keep its button until GitHub confirms it?

Milestone: MD2
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: You said you move a card over first and then do the step ("if i move a card over and then pass my verdict or update"). On the approved board, a card in Done keeps only "Undo" while it is being confirmed, so its one button (Merge, Verdict, Answer) is gone just when you'd tap it. Left unruled, the button stays, so moving first and acting second works.
OPTIONS:
  A. Keep the button until confirmed — A card in Done shows its step button and "Undo" while it says "confirming with GitHub"; once GitHub confirms, only "Done ✓ <time>" is left.
  B. Act first, then move — As the mockup draws it: do the step from the card's button, then move the card; in Done only "Undo" shows.
RECOMMENDATION: A — it matches the order you work in, and costs nothing.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: what an unconfirmed Done card shows
DEFAULT: A   TIMEOUT: 48

## Context
- The owner's words: "I drag and drop a “waiting on me” card to complete and then I click the one link" and "if i move a card over and then pass my verdict or update" (source: docs/design/references/owner-request-2026-10-19-board.md on orch/board-mockup)
- The Critic noticed an unconfirmed Done card offers only "Undo" in the approved mockup and in the plan's draft (source: specs/S-001.md on build/definer/s001-board, AC80)
