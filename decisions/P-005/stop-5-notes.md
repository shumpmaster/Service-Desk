# Chief of Staff's notes — P-005 stop-5 (the stop rule on spec S-011)

**Recommendation: `criteria-wrong`, once the question filed with these notes is ruled and on main.** A new spec replaces S-011, goes back to the Definer, and the plan rounds reset; it is not a strike. This is the owner's ruling: a stop card is never answered by proxy.

## Why the work stopped
- Three plan reviews of S-011 failed (reviews/S-011/plan.md on item/P-005; status/P-005.toml, plan_round 3).
- Triage's root cause is the Definer's pack: it never held the two experiment registrations the plan reviewer kept asking it to re-point, so every round failed on a fix the Definer could not make (triage/P-005.md on item/P-005).
- The third round ran from 15:14 to 15:23 UTC, before the owner's answers and the pack fix reached main; the scheduled run restarted the loop first (dispatch-log/2026-11.jsonl).

## Where the third review's four blockers stand
1. Registrations name S-010: the Definer's pack now holds them (decisions/questions/P-005-definer-pack.md; L-0055, #447). The next Definer re-points both and aligns E1's proxy line with AC40.
2. Widget folder unnamed: filed with these notes as questions/P-005-widget-folder.md.
3. AC17's widths: ruled, "360 and 414 (Recommended)" (decisions/questions/P-005-s011-widths.md).
4. J5 misses a step that leaves the waiting list and returns between two runs: a real spec defect, for the next Definer (triage/P-005.md, section 5).
- The review's open question on M8's reading: ruled, "Accept the reading (Recommended)", confirmed "Yes, all of it (Recommended)" (decisions/questions/P-005-s011-m8-reading.md).

## Why `criteria-wrong`, and not the other words
- `criteria-wrong`: the main fault was the pack's, not the writer's, and two of the four blockers were owner rulings. Rounds reset, so the new spec gets three reviews with a pack that can act on every finding. Not a strike.
- `re-specify`: the same new spec, counted as a strike, for a failure that was mostly not the writer's.
- `confirm`: one focused check by the plan reviewer, offered once. The registrations and J5 still need a Definer's change, so it would spend the one confirmation on a known FAIL.
- `re-scope` or `drop`: closes the timeline work; nothing in Triage's return argues for that.

## What should land first
The answer to questions/P-005-widget-folder.md. If `criteria-wrong` reached main before it, the Definer would start without the folder's name and the next review would fail on it again. The Definer now reads the owner's answers filed under decisions/questions/P-005-*.md (L-0055), so the answer reaches it without another card.
