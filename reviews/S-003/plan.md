Verdict: FAIL

I tried to refute the spec and found three blocking problems and one smaller one. None of them can be waved through as "checked at source" when the check isn't in the pack.

**Blocking findings**

1. **The spec contradicts itself on AC16 (specs/S-003.md:23 against :40–41).**
   - Line 23 says "nothing about how a read went" decides a card's state.
   - AC16 makes a card's state depend on whether a read got the log: a failed read means no card gets a state.
   - AC11 (line 40) claims the same records and moment always give the same state. The records are the same in both cases, yet a read that failed shows nothing while a read that succeeded shows cards.
   - A reader could not write one consistent test from these three passages.

2. **The spec cannot be frozen as written (specs/S-003.md:3, :41, :105).**
   - Open question 1 says AC16 "departs from the plan's §1" (docs/projects/P-003.md:21, "or the log not yet read … shows at once").
   - The plan's Part 1 was approved with that rule (decisions/P-003/dor-4.md).
   - M4's "done when" and V6 (plan §3 and §6) were approved against the plan's rule.
   - The spec says the plan "needs the Chief of Staff to bring it in line". That has not happened, so the spec and its approved plan conflict.
   - I read decisions/P-003/stop-5.md. It supports "from the records on main", but it does not explicitly rule that a failed log read shows no cards.
   - AC16 is therefore the spec's own interpretation, and the spec itself says it needs a ruling.

3. **AC16 can break the plan's V6 miss definition without the spec saying how it is counted.**
   - The plan counts any card held more than a day after it was raised as a miss (plan:90).
   - AC16 can hide every decision card for as long as the log read fails, and the spec only says that is a miss (line 90).
   - AC13 (line 46) says V6 can be worked out from the records alone, but a failed read leaves no record. So AC13 does not cover the AC16 hiding.

4. **Evidence the spec leans on is not in the pack.**
   - The spec cites reviews/S-003/plan.md for the plan review's findings and its "checked at source" claims (lines 13, 16, 50, 80, 82, 86). That file is not in the pack, and I found no reviews/ folder at all. These claims are unverifiable here.
   - AC15 and J4 depend on what the desk "opens today" for a link to a card not on its list. That rests on one line, research/P-003-sizing-findings.md:67, which only says such a notice "would re-check as 'gone'". The pack has no source file to check it against.
   - AC14's "same notices as the sender of before this fix" and J5's "existing way of not repeating a notice" depend on sender behaviour the spec admits it doesn't know (line 86).

**Smaller finding**

- AC4 (line 29) promises "the card shows on the desk's next read, without a reload" when the day passes. The findings (:29) say only that "the model is rebuilt each read cycle". That does not show the open desk re-evaluates on the clock when the records are unchanged. The spec needs to name where the time input comes from.

**What checked out**

- The header names M4, which is in the plan's §3 (specs/S-003.md:7, docs/projects/P-003.md:44).
- The J2 examples match the real note forms in research/P-003-sizing-findings.md:32–39.
- docs/PROJECT.md:127 and :588 say what the spec cites them for.
- The sizing of 60 to 90 lines and 8 to 12 tests is correctly restated as an estimate rather than a measurement.

**Open questions**

- Does the owner confirm that a failed log read hides all decision cards (AC16 as written), or should the plan's "shows at once" rule stand? If the owner confirms AC16, the plan's §1 and V6 need amending first.
- Could the Chief of Staff supply reviews/S-003/plan.md, or the source for research/P-003-sizing-findings.md:67 (notifyview.js:337), so that AC15 and AC14 can be checked?
- Is the sender's duplicate-notice mechanism known? If not, AC14's before-and-after comparison test needs an explicit harness.