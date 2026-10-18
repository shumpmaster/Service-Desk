# Ruling needed: Accept M2, cards answered straight from the desk?

Milestone: M2

WHY: M2 is built, reviewed and on the preview, but you have never accepted it, so it can't be marked reached and the desk can't show it as done. Leaving it unruled leaves M2 open on Status and the Timeline.
OPTIONS:
  A. accept M2 — M2 is marked reached today, from your answer. Nothing is built or changed on the desk.
  B. Not yet — M2 stays not reached. Say what is missing and it is filed as a fix.
RECOMMENDATION: A — it passed review and has been live on the preview since 8 October; first open one card's answer link on your phone to confirm it opens the answer page filled in.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: M2's line in the project document and how the desk shows it; nothing built changes
DEFAULT: B   TIMEOUT: 48

## Context
- M2's done-when is "each card on the desk links the owner straight to its answer", and its sprint is PR #44 (source: docs/PROJECT.md, section 3, M2's line)
- PR #44 merged on 2026-10-08 as 0f5c1e9, with the Reviewer's PASS in round 2 and the owner's PASS (source: reviews/44/reviewer.md; reviews/44/owner.md)
- PR #44's preview deploy completed successfully on 2026-10-08 (source: GitHub Actions, desk-deploy run 37790025921)
- No acceptance record for M2 exists in decisions/questions/ (source: decisions/questions/, file list at 283ab4a)
- A milestone is marked reached only from the owner's acceptance record (source: docs/PROJECT.md, section 3's instruction)
- The model 3.5.0 sync asks for M2 and M2B to be put to the owner through filed questions once M1 is marked (source: docs/LEDGER.md, L-0016, licenses_next)
