# Ruling needed: Accept M2B, agent usage shown on the desk?

Milestone: M2B

WHY: M2B is built, reviewed and on the preview, but you have never accepted it, so it can't be marked reached and the desk can't show it as done. Leaving it unruled leaves M2B open on Status and the Timeline.
OPTIONS:
  A. accept M2B — M2B is marked reached today, from your answer. Nothing is built or changed on the desk.
  B. Not yet — M2B stays not reached. Say what is missing and it is filed as a fix.
RECOMMENDATION: A — it passed review and has been live on the preview since 8 October; first open the Agents view on your phone to confirm each session shows its tokens, run time, context use and cost estimate.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: M2B's line in the project document and how the desk shows it; nothing built changes
DEFAULT: B   TIMEOUT: 48

## Context
- M2B's done-when is "each agent session's usage and context figures show on the desk", and its sprints are PR #44 and PR #52 (source: docs/PROJECT.md, section 3, M2B's line)
- PR #44 merged on 2026-10-08 as 0f5c1e9, with the Reviewer's and the owner's PASS (source: reviews/44/reviewer.md; reviews/44/owner.md)
- PR #52, "the Agents view shows each session's tokens, run time, context use and cost estimate", merged on 2026-10-08 as a86a2f4, with the Reviewer's PASS in round 3 and the owner's PASS (source: reviews/52/reviewer.md; reviews/52/owner.md)
- PR #44's and PR #52's preview deploys completed successfully on 2026-10-08 (source: GitHub Actions, desk-deploy runs 37790025921 and 37819772787)
- No acceptance record for M2B exists in decisions/questions/ (source: decisions/questions/, file list at 283ab4a)
- The model 3.5.0 sync asks for M2 and M2B to be put to the owner through filed questions once M1 is marked (source: docs/LEDGER.md, L-0016, licenses_next)
