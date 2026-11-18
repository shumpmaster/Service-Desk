# Ruling needed: do you approve the card fix's new criteria for its notices, so the checks can be rewritten?

Milestone: M4

WHY: You chose to re-specify how the record of today's desk holds notifications (decisions/questions/P-003-S-009-adapter-stop.md, "My answer is A"). The new spec does that and nothing else. It records each notification as the sender actually sends it: its words and where it opens. From those, the checks read whether it was a summary, a group or one card's notice, and the number it counts. It passed its third and last plan review. The earlier two failed, and each failure was fixed. Approving these criteria lets the Check author rewrite only the affected test cases and checks, which a fresh Critic and Reviewer then review before you approve their lock. Two things change for you. First, on a whole-desk test, today's sender can be compared only by how many things it counts, not by which cards it names (question 14). Second, a few new coverage rules can stop the build if today's sender behaves differently from what its code and one probe show (question 15). Approval leads straight to a rewrite of the locked checks, which is irreversible in practice. The card fix waits until you rule.
OPTIONS:
  A. Approve as written: the new spec's criteria, with A on its questions 14 and 15. The Check author starts the rewrite.
  B. Approve as A, after the spec writer first closes the last review's three small points, without changing any criterion, and a fresh Critic checks only those lines. The three points: question 15 groups one rule under the wrong reason and does not say it stays under option B; a count read from a summary of zero ("nothing waits on you now") is undefined in one built-only check; and one reason in the comparison names the wrong rule. A failed check comes back to you. This adds about one short round before the rewrite.
  C. Approve with changes you name.
  D. Not now: the card fix waits.
RECOMMENDATION: B. The second point is a real, if small, gap in a check the Check author would write. Closing it before the checks are rewritten is cheaper than finding it in their review. The other two make question 15 and the comparison read truly. None changes a criterion.
RISK CLASS: R3 (approval leads to a rewrite of tests/acceptance/**)   REVERSIBILITY: irreversible (computed from R3)   BLAST RADIUS: the card fix's spec, checks and build; no other project, and no change to the sender or anything under src/
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- The new spec, S-014, extends the frozen S-009 and changes only how the record holds notices, AC14's test, and the comparisons and coverage on that form; every other line is carried word for word (source: specs/S-014.md:11, :18)
- The spec was drawn as S-013 when the highest id on main and every item branch was S-012; the loop then gave S-013 to the timeline's new spec, so this one became S-014 (source: specs/S-014.md:3, :11; status/P-005.toml; Personal-Org-Operating-Model docs/LESSONS.md LL-053)
- This question was first filed and put as questions/P-003-S-013-criteria.md, under the spec's earlier number; only the number changed (source: docs/handoff/2026-11-18-chief-of-staff-p002-56.md)
- Plan review round 1 failed: the push is encrypted, AC14's test could not be run by any case kind, and the list of affected checks was incomplete (source: reviews/S-014/plan.md, round 1)
- Plan review round 2 failed on one point: the sender sends a card's own notice for items not on the run just before, not items on no earlier run (source: reviews/S-014/plan.md, round 2)
- Plan review round 3 passed, with three non-blocking points (source: reviews/S-014/plan.md, round 3, N1 to N3)
- On a whole-desk test the sender's notices are compared by count, words and address; card by card only in the sender tests; the built code's per-card sender tests are by count (source: specs/S-014.md:57, :164, :173, :289)
- The new coverage rules rest on the sender's code and one probe run (source: specs/S-014.md:169, :242, :290; docs/handoff/2026-11-13-chief-of-staff-p002-51.md, the Builder's return)
- Today's test cases already meet every rule as worded (source: reviews/S-014/plan.md, round 3, check 4)
