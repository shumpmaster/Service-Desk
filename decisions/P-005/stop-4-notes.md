# Chief of Staff's notes — P-005 stop-4 (the stop rule on spec S-010)

**Recommendation: `criteria-wrong`, once the two questions filed with these notes are ruled and their changes merged.** A new spec replaces S-010, goes back to the Definer, and the plan rounds reset; it is not a strike. This is the owner's ruling: a stop card is never answered by proxy.

## Why the work stopped
- Three plan reviews of S-010 failed (reviews/S-010/plan.md on item/P-005; status/P-005.toml, plan_round 3).
- Triage's root cause is the plan reviewer's pack: it never held the two experiment files the spec cites, nor its own earlier review, so it failed their criteria as unverifiable (triage/P-005.md on item/P-005). Filed as questions/P-005-critic-pack.md.
- Triage also found real defects that stand whatever the pack holds: AC23's five-minute phone notice cannot be met on a scheduled route (its own facts F-gh-12 and F-gh-12b); AC40 says it reads no clock but reports a wait "so far"; the "owner-approved" heading contradicts `status: draft`.

## Why `criteria-wrong`, and not the other words
- `criteria-wrong`: the spec's criteria need rewriting (the defects above, and the owner's answers to its open questions), the main fault was the pack's, and the rounds reset, so the new spec gets three fair reviews. Not a strike.
- `re-specify`: the same new spec, but counted as a strike, for a failure that was mostly not the writer's.
- `confirm`: one focused check, offered once. With the pack fixed it would still find AC23, AC40 and the heading, so it would spend the one confirmation on a known FAIL.
- `re-scope` or `drop`: closes the timeline work; nothing in Triage's return argues for that.

## What should land first
1. questions/P-005-model-3.7.3.md: the desk takes the operating model's spec-number fix, so the new spec's number is drawn by the new rule.
2. questions/P-005-critic-pack.md: the plan reviewer's pack holds the experiment files and its earlier review.
If the answer `criteria-wrong` reached main before both, the Orchestrator would dispatch the Definer and, after it, a plan review with the old pack, and the old rule would draw the new spec's number.

## What would save a round
S-010's six open questions for the owner (specs/S-010.md, "Open questions for the owner", on item/P-005) carry into the new spec: M9 and M10 moved to a second spec; AC8's 2 hours for "stalled"; AC14's 4 minutes for "late"; the three record writers kept; the weekly device log under value/P-005/ in the portfolio repository; and whether the banner alone will do for a stopped feed if the outside check cannot alert the owner. Answers recorded under decisions/P-005/ are in the Definer's pack (governance/PACKS.toml, `[roles.definer]` include_feedback), so the new spec can carry them instead of asking again.
