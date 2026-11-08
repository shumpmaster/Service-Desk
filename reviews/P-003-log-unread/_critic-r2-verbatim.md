Verdict: FAIL

All eleven round-1 findings are resolved. Option B does keep AC11 and the ruling, and it creates no disagreement of its own. Three new blocking points remain: the recommendation compares the options unfairly, a cost difference between A and B is misstated, and B's proposed plan wording contradicts itself.

## Findings

1. **BLOCKING: the recommendation's "hides the fewest cards" is false.** questions/P-003-log-unread.md:13
   - Option C hides fewer cards than B. Under C, a read without the log shows every card at once (:11).
   - B hides the fewest only among the options that keep the ruling. As written, the line favours B over C with a claim that is not true.

2. **BLOCKING: the cost difference between A and B is misstated, and the recommendation rests on it.** questions/P-003-log-unread.md:7, :10, :13
   - **A changes the spec too.** A is offered as "what the rewritten spec says now" (:7). The recommendation would switch to A "if you would rather the spec not change again before its review" (:13).
     - But the spec says twice that a card hidden by a failed read is a V6 miss: specs/S-003.md:90 ("a card held this way more than a day after it was raised is a V6 miss"), and :21 read with AC16.
     - The question's own section 6 wording (:35) says such a card "is not counted as a miss". So under A the spec must also change before freeze, or round 3 will find the spec and the plan contradicting each other.
   - **Every option gets a third review.** The revised S-003 has not yet been reviewed (dispatch-log/2026-11.jsonl:156, plan-fail sent back to the definer). So "reviewed again" in B's cost (:10) is not a cost only B carries.
   - **B's real extra cost goes unsaid.** B rewrites AC11's and line 23's "a read that did not get the records gives no decision card a state", plus AC16, J3, J4, J5 and the AC16 line text. That new, unreviewed wording goes into the round whose failure stops the work.

3. **BLOCKING: B's plan wording contradicts itself and is incomplete.** questions/P-003-log-unread.md:33, also :9
   - The bullet says that while the dispatch log cannot be read, the read "shows no decision card and sends no notice for one". B's add-on then says such a card "still shows", with no "except".
   - It does not say whether the sender sends that card's notice on a run without the log. It also does not say whether the card is counted in Home, put on the board or offered with answer buttons. AC16 lists all of these, and the plan's own section 1 (P-003.md:19) ties the notice to showing.
   - Option B's text (:9) has the same gap on notices.
   - The B-only wording that would be adopted by default (:15) must say all this exactly, or the spec has to guess it.
   - Under B, AC16's fixed line "Decision cards not shown: …" (S-003.md:41) also becomes untrue while some decision cards do show. B does not mention that the line changes.

4. **NON-BLOCKING: a Context citation is too narrow.** questions/P-003-log-unread.md:24
   - "Shows whatever its age" is cited to AC2 alone. AC2 covers a held card whose notes arrive, and does not say "whatever its age".
   - The claim holds only with AC5, AC7 and J3 (S-003.md:30, :32, :67) read alongside it. Cite those as well.

5. **NON-BLOCKING: some cost wording is imprecise.**
   - :8 calls "no card is hidden for more than a day" "the plan's promise". It is the owner's preference in Part 2 (P-003.md:129). The plan's own promises are "never held for good" and "cannot leave a card hidden" (:21, :102, :114).
   - :10 says "so far fewer are hidden", but no record supports "far". The precise effect is that, during an outage, B hides only the cards with no notes. Of those, the ones that would otherwise be on the desk are the ones past their day and the ones with no recorded raise time; the rest are held anyway.

6. **NON-BLOCKING: section 1's promise is dropped without saying so.** questions/P-003-log-unread.md:32
   - The new first bullet drops "so no card is ever held for good" with no exception clause and no word to the owner.
   - Sections 7 and 8 keep their promises and add an "except" clause (:37, :39). The handling should be the same everywhere, and the owner should be told.

7. **NON-BLOCKING: C's text covers only the missing raise-time record.** questions/P-003-log-unread.md:11, :43
   - The title (:1) and AC16 cover all three records: the queue, the notes and the log.
   - C, and "the plan is unchanged" under C, do not say what happens when the queue or the notes cannot be read.

## Round-1 findings
1. A's "Rules out": resolved (:8).
2. A's cost had no duration: resolved ("with no time limit", :8). See finding 5 for the wording.
3. The V6 miss was claimed as certain: resolved in the question (:8, :35). The spec still makes the claim (finding 2).
4. A missing third choice: resolved (B added, "only choice" removed).
5. The plan wording did not match AC16 and left other sections contradicted: resolved. It now covers queue/, the notes and the log, names what could not be read, and handles sections 6, 7, 8 and Part 2. A residue remains (finding 6).
6. DEFAULT: resolved (B, 72 hours, :15; reversible, so §5 applies).
7. The "gha-" citation: resolved. It now cites 00:15:45Z and 00:40:05Z, which match dispatch-log lines 151 and 155, both critic FAIL on reviews/S-003/plan.md.
8. "Twice": resolved ("the new spec at both of its reviews" is correct).
9. Old B's "Rules out: nothing": resolved (C now rules out a card hidden more than a day by an outage).
10. Round 3 not mentioned: resolved (:5).
11. Form: resolved. The CHECKED line is gone, and the opening paragraph states reversibility.

## What I checked and found sound
- **B and AC11, and the ruling.** A decision card whose notes with a recommended word are on main has the state "shown, recommended <word>" at every age and whatever the log holds (AC2, AC5, AC7, J3).
  - So under B, a read without the log gives those cards exactly the state a full read gives. Every other decision card gets no state.
  - "Never a different one" (AC11) holds, and the views and the sender cannot disagree on state. B's "Rules out: the same as A" is true.
  - The caveat is that the spec's definitions must be rewritten (finding 2). Not verified: that nothing else in the card rule, such as which cards are still open, reads the dispatch log. J1 suggests it does not.
- **A's and C's costs.**
  - A's "no time limit" and "the value check cannot count these" are sound under AC13 (S-003.md:46).
  - C's "show and then vanish", "views disagree" and "sets aside part of your re-specify ruling" are true (review r2 finding 1; stop-5.md:3).
- **The A wording.** Section 1 bullet 2 (:33) matches AC16: no cards shown, none counted, no notices, the line on the queue and Home naming what could not be read, and real ages once the records are read. Gate cards stay unaffected through section 1's Out list. The section 6, 7, 8 and Part 2 wording (:35–41) is consistent.
- **Quotes.** stop-5.md:3; P-003.md:21, :102, :114, :129; S-003 AC13 (:46), AC16 and open question 1 (:41, :105); review r2 finding 1 (:5–6).
- **The stop rule.** "The next review is the third" counts S-003's own rounds after the stop-5 strike (dispatch-log:147). The log's routing supports that count: :156 sent the second FAIL back to the definer, not to triage.
- **Form.** It follows the template, the title is plain English, Milestone M4 is real (P-003.md:44), and the WHY leads with the failure, has no paths, gives the timeout consequence and states reversibility.
- **R0.** The ruling changes only docs/** and specs/**, both R0 in governance/risk-paths.toml:28. The blast radius is accurate.
