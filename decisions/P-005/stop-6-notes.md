# Chief of Staff's notes — P-005 stop-6 (the stop rule on spec S-012)

**Recommendation: `criteria-wrong`, both answers being on main.** A new spec replaces S-012, goes back to the Definer, and the plan rounds reset; it is not a strike. This is the owner's ruling: a stop card is never answered by proxy.

## Why the work stopped
- Three plan reviews of S-012 failed: 20:06, 23:09 and 23:30 UTC on 15 November (reviews/S-012/plan.md on item/P-005; dispatch-log/2026-11.jsonl; status/P-005.toml, plan_round 3).
- Each round fixed the last round's blockers, and the reviewer found new ones. Every blocker in rounds 2 and 3 sat in AC40 and AC41, the two counts behind V7 and V8.
- Triage's root cause is the pull-request rule in experiment E1's registration (line 26), which the Definer copied into AC40. It counts a pull request only if it is listed at the window's end, so no pull-request wait can end inside a window (triage/P-005.md on item/P-005).
- Unlike stop-5, this was not a pack fault: both Definer manifests held the registrations, and the Definer did edit E1 (triage/P-005.md, section 2).

## Where the third review's four blockers stand
1. Which pull requests count: ruled, "Any moment while open (Recommended)" (decisions/questions/P-005-s012-pr-counted.md). The next Definer fixes AC40 and E1 line 26 together. E1 has not run (experiments/P-005-E1.md line 3).
2. A pull request that returns to ready: ruled, "Two waits (Recommended)" (decisions/questions/P-005-s012-pr-return.md). The next Definer bounds AC41's matching to lines dated inside each wait.
3. Cause (d) when the run named by `from_run` has no log: a spec gap with no ruling needed. The next Definer states the case and adds it to AC41's test. Following the spec's own rule that a missing record can only add a finding, never hide one, it should be listed under its own cause, not as "unexplained".
4. Join-up rows 1, 2, 3 and 5: not this spec's to close. The reviewer and the spec agree they close at the Critic's review that ends Design, once the mockups and E2's result exist.
- The review's non-blocking note, which the next Definer should fix while there: the repeat count reads only runs that started in the window, so a first send before the window and a second inside it is missed.

## Why `criteria-wrong`, and not the other words
- `criteria-wrong`: two of the three spec blockers turned on what the owner's own targets mean, which no one had ruled. The third is small. The rule behind finding 1 came from E1, registered on 13 November before any plan reviewer could read the registrations (L-0055 came later). A new spec with both answers in its pack is the fix. Not a strike.
- `re-specify`: the same new spec, counted as a strike. It is a fair reading too. Triage calls this "a genuine spec failure, not a pack fault", and finding 1 is the Definer's own logic, copied from its own registration. A strike is only recorded on the card's decision line; it changes no route. I recommend against it because the two definitions were the owner's to give.
- `confirm`: one focused check by the plan reviewer, offered once. All three blockers need a Definer's change, so it would spend the one confirmation on a known FAIL.
- `re-scope` or `drop`: closes the timeline work. Nothing in Triage's return argues for that.

## Something to weigh
This is the item's third stop card on the same three milestones (stop-4 on S-010, stop-5 on S-011, stop-6 on S-012). Each round now passes what earlier rounds failed, and the blockers are narrowing to the two monitoring counts. If the next spec stops again on AC40 or AC41, it may be worth asking whether those counts belong in a spec of their own, as M9 and M10 were split out. That would be a re-scope ruling, and it is not recommended now.

## What should land first
Both answers are on main (#454, merged at 13:37Z on 17 November), ahead of this card's answer: the Definer reads decisions/questions/P-005-*.md (L-0055), so the answers reach it without another card. The session budget is not a concern: every decision resets the stage's session count (governance/checks/orchestrator.py:594).
