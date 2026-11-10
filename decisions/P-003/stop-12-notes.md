# Chief of Staff's notes — P-003 stop-12 (the stop rule, Design: S-006's plan review)

**Recommendation: `criteria-wrong`.** The new spec failed its plan review on two wording slips in one criterion, AC13, and on a claim the Critic could not check. The slips were already in S-005, word for word, so copying S-005 forward unchanged, as stop 11 asked, could only carry them along. Fixing them is a change to a criterion, which is what `criteria-wrong` is for. It counts no strike, and the rounds start again. The record's lines would be:
```
Decision: criteria-wrong

Fix AC13 only. Say how many cards its sample holds, so that the third case it tests (a card raised before the part of the log that is read) is one of them. In case (a), say what the raise time is a day later than: the card's arrival on the main branch, as J6's first worked example has it. Carry everything else from S-006 unchanged, and list every changed line. Do not grow it.
```
The second paragraph is optional, in your own words. It matters, because the Definer reads your record and nothing else from this stop.

## What happened (dispatch-log/2026-11.jsonl; reviews/S-006/plan.md and triage/P-003.md on item/P-003)
- **20:18Z:** your `checks-wrong` answer on stop 11 sent P-003 to the Definer with a new spec, S-006.
- **The first two rounds, 20:41Z and 21:16Z:** the Critic failed S-006. Each time it said it could not see specs/S-005.md, so it could not check the claim that only the id, the supersedes line and the marks that name the spec had changed. Round 2 also found that S-006 cited its own earlier review, which your stop-7 ruling forbids.
- **21:17Z to 03:14Z:** the pipeline stood still for six hours until the next run started.
- **The third round, 03:28Z:** the Critic failed it again. This time it also found two slips in AC13:
  - the sample is said to hold "two cards", but the test also checks a third;
  - case (a) reads "a day later than that", and nothing says what "that" is.
- **03:40Z:** Triage ran and this card came to you.

## What I checked that Triage could not
- **The AC13 slips were already in S-005.** AC13's lines are identical in the two specs (specs/S-005.md and specs/S-006.md on item/P-003, lines 44 to 49). This answers Triage's open question 1. S-005's plan review passed these slips, so they reached the Check author too. That may be part of why its tests drew findings about the counts.
- **S-006 really is S-005 with only its own marks changed.** Fourteen lines differ, all holding the new id, the supersedes line, the join marks and one Risks item. So the "unchanged" claim was true; it just could not be checked.
- **You have approved the fix for that** (decisions/questions/P-003-critic-superseded-specs.md, in #346). The Critic may now read the specs a new spec replaces. With it, the next plan review can compare S-007 with S-006 line by line.

## Why `criteria-wrong`
- **Not `confirm`.** It sends S-006 back to the Critic unchanged, and the two AC13 slips are still in it, so it would fail again and stop.
- **Not `re-specify`.** It counts a strike against the Definer. The Definer did what your ruling asked, and the slips came through an earlier review that passed them.
- **Not `re-scope` or `drop`.** Every finding in three reviews is about wording, or about what the Critic could see, not about the design. The fix still answers the defect the project exists for: a decision card shown, then gone.
- **This answer is an exception to your stop-11 instruction.** That instruction said to carry S-005 forward unchanged. This one carries S-006 forward with AC13 fixed. Fixing AC13 also means the next criteria card asks you to approve one changed criterion.

## The risk to weigh
This is P-003's fifth stop card (5, 6, 7, 11 and 12, with failure card 10 besides), and S-007 would be its seventh spec. Each recent stop has had a cause outside the spec's design: a pack that left out what a role needed, twice, and two old slips that an earlier review passed. The two pack gaps are fixed now (L-0039, and L-0040 in #346). If S-007 stops again on something new, I would recommend narrowing the work (`re-scope`) rather than another rewrite.

The pipeline stood still again overnight, from 21:17Z to 03:14Z. Expect to start it by hand while S-007 is written and reviewed.

Nothing here is irreversible.
