I'm plan-reviewing S-003 against the plan, the sizing findings and the owner's ruling records. I've finished reading them, so here is the verdict.

Verdict: FAIL

**Findings**

1. **Blocking: the clock-skew rule in J1 contradicts itself and can hold a card for good** (specs/S-003.md:46).
   - J1 says a raise time later than the current time is "treated as raised at the current time of that read, so held while it stays within a day of the recorded time".
   - Read the first way, the raise time is reset to "now" on every read. Age is then always 0, so the card is held for good with no notes. That breaks AC4, plan §1 line 21 ("no card is ever held for good") and the V6 miss definition (docs/projects/P-003.md:90).
   - Read the second way, the recorded time counts, so the card shows 24 hours after that time. The wording does not say which reading is meant.
   - A test for J1 cannot be written from this text. Fix: state one rule, for example "age is measured from the recorded time; a negative age is held until recorded time + 24h".

2. **Blocking: a notification already sent for a card that then goes back to held is not covered** (specs/S-003.md:58, 60, 83).
   - research/P-003-sizing-findings.md:67 says a sent notification for a card that is then held would re-check as "gone" (notifyview.js:337).
   - J3 allows this: notes are removed, or the log read changes, and the card goes back to held.
   - J5 only covers not re-notifying. It does not say what happens to the notice already sent.
   - Say what the sender does with that notice, or put it in the open questions.

3. **Non-blocking: AC11 and J5 sit uneasily together** (specs/S-003.md:38, 60).
   - AC11 says state comes "on nothing else" than the records and the moment. It also promises "at most once" notification, which needs the sender to remember what it has sent.
   - J5 does separate "what it has sent" from the hold rule.
   - Even so, "at most once" cannot be checked from the records alone. AC13 says V6 can be worked out from the records, but it does not cover notifications.
   - Spec line 75 admits it does not know how the sender avoids repeats today. That leaves the J5 test unspecified.

4. **Non-blocking: AC7 and J3 let the same records give two different states, and the spec accepts this** (specs/S-003.md:30, 58, 83).
   - A read without the log shows a card at once. The next read, with the log, can hold it again.
   - AC11 treats "the log not read in that read" as part of the records. That is defensible, but it is what makes a card vanish.
   - This is correctly raised as open question 3.
   - Plan §1 line 21 is the rule it relies on, so no plan change is needed unless the owner picks the second option.

5. **Non-blocking: the record for the owner's ruling is not at source** (specs/S-003.md:14, 75).
   - The ruling record is in the pack and I read it. Its quotations of the owner ("Proceed with the fix", "Show it after a day, flagged (Recommended)", "A: own addition now (Recommended)") match the plan.
   - The "Well then we need to make sure…" quotation also matches.
   - The limit noted at line 75 is therefore partly out of date.

**Checked and found sound**
- The header names M4, which is in plan §3 line 44 as a milestone.
- decisions/P-003/stop-5.md matches the supersession note at line 11.
- The decision-card and gate-card split and the `dor-fail` versus `dor` trap match findings §1.
- The recommended-word examples in J2 match the four real forms in findings §4.
- The size and the stop rule match plan §6.

**Open questions**
- Which clock-skew rule is intended (finding 1)?
- Should a notice already sent for a card that goes back to held be withdrawn, left alone, or covered by an owner ruling (finding 2)?
- How does the sender avoid repeats today? J5 needs this before its test can be written.
- The spec's own open questions 1 to 3 remain for the owner. I found no reason to block on them.