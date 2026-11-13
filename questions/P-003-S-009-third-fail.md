# Ruling needed: the card fix's new spec failed its third review; may it have one more short round?

Milestone: M4

WHY: The new spec for the card fix failed its third and last review, so by the plan you approved the build stops here and comes back to you. Nothing has been built, and no code has changed. The third review found two small gaps, each about a sentence to fix. First, the check that the record of today's desk is complete cannot fail when a simulated failed read had no effect, so part of the comparison could pass without testing anything. Second, one sentence states something about today's code that the reading of the code does not show. All the earlier findings are fixed, and the reviewer checked the spec's list of changes line by line. Each round found new gaps in wording added to fix the round before, so another round may also fail; that is the risk in allowing one. While this waits, the card fix waits, and decision cards keep showing without the Chief of Staff's recommendation. Nothing else waits on it.
OPTIONS:
  A. One more round — the Definer adds the two sentences and the reviewer's three small suggestions, and a fresh Critic reads the spec cold. If it passes, you get the criteria question next, as the plan says. If it fails, the build comes back to you again, with no further round. About half a working session. It rules out re-planning now.
  B. Re-plan first — I rework the plan's way of recording today's desk before any more spec work, and bring the new plan to you. Probably a working session or more before the spec is written again.
  C. Stop the card fix for now — nothing more is done, and the spec stays a draft on its branch.
RECOMMENDATION: A — the two gaps are narrow and their fixes are stated, and the round is capped, so a further failure comes straight back to you.
RISK CLASS: R3 (the build's locked checks are under tests/acceptance/**)   REVERSIBILITY: irreversible (computed from R3; a further round changes no code)   BLAST RADIUS: the card fix's spec and its build; no other project
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- The plan you approved stops the build after a third failed plan review and brings it back to you (source: docs/handoff/2026-11-13-P-003-outside-build-plan.md, "Stop rules"; decisions/questions/P-003-outside-build-plan.md)
- The third review failed on two findings: the completeness check cannot fail for simulated read failures or the desk cases' notices, and one sentence about the gate case's read is not shown by the code reading. It suggested one more short fix checked by a fresh reviewer (source: reviews/S-009/plan.md, round 3, findings B1 and B2 and open question 1)
- The first two reviews' findings are fixed, by the third review's check (source: reviews/S-009/plan.md, round 3)
- The third round's list of changed lines matches git's record of the change (source: reviews/S-009/plan.md, the session's note after round 3)
- The spec carries three new questions for you, ruled with the criteria: no notices while a record cannot be read (two cases), and the wording a held card's notice opens to (source: specs/S-009.md on build/definer/S-009 at 09b806ed, open questions 10 to 12)
- Nothing under src/ or tests/ has changed (source: git history of the session branch claude/lucid-noether-vmy2qz)
