# S-009 — plan reviews (the outside-build plan, step 3)

*Recorded by the Chief of Staff's session (session_01QBwHGJGmgrBkfU9PjLST43) as `orchestrator`, under L-0051. Each round's Critic return, verbatim under its heading. At most three rounds; a third failure goes back to the owner.*

## Round 1 — spec at build/definer/S-009 23256968; dispatched 2026-11-13T04:48:41Z, returned 04:54:48Z

Verdict: FAIL

S-009 fixes both blocking findings from S-008's plan review, and all three non-blocking fixes the plan asked for. Its list of lines changed from S-008 is accurate. It still fails on three points. Two are wording added for finding 2 that contradict the spec's own criteria. The third is a gap in the baseline case form that leaves part of AC9 unable to fail.

**Method.** I had no shell, so I could not run `diff`. Instead I read S-008 (the scratchpad copy, 259 lines) and S-009 (284 lines) in full, line against line.

**Carry-over from S-008 (line 11): accurate.**
- Every line that changed is in the list: 1, 4, 11, 14, 18, 23, 29, 36, 61, 75, 79, 80, 148, 150, 154, 158, 160, 165, 169–172, 174–181, 202, 215, 216, 218, 223–228, 230–232, 234, 236–238, 252–258, 262, 267, 274–277, 282 and 283, plus the join-test marks at 83, 97, 106, 116, 122, 145 and 173.
- I found no change outside the list. The line counts (259 and 284) are right.
- Line 18's summary of which criteria changed matches the criterion lines (AC4's last two sentences, AC9, AC16). It does not cover the AC17 effect in B1.

**Plan step 3 fixes** (docs/handoff/2026-11-13-P-003-outside-build-plan.md:51-65):
- Finding 1 is resolved. Line 23, line 232 and the brief at :282 match plan :52-57, :79-81 and :91:
  - the session runs the adapter and commits the record as `orchestrator` at reviews/S-009/baseline/;
  - the Reviewer confirms the adapter before the run and re-runs it at review;
  - the Builder's lane holds no reviews/ path;
  - the second dispatch waits for the record.
- Finding 2 is resolved:
  - J8 (lines 174-181) gives the read places and the failure forms.
  - Line 180 says a failed notes read does nothing at the base commit.
  - J7:169 checks that.
  - J7 states the `path` and `call` forms.
  - B1 and B2 below are side effects of this new wording.
- The poison run now covers every file under src/ (line 171).
- AC4 is reworded to the reading (line 29).
- The stop rule is kept, with the adapter outside the count (lines 218 and 262).

**Claims about today's code.** Every citation I checked is supported by reviews/S-009/src-reading.md: lines 23, 29, 75, 80, 148, 154, 175-180 and 223-238. The small inaccuracies are in N5.

## Blocking findings

**B1. On the sender, AC17's notices can never be sent, and nothing tells the owner.**
- AC17 (line 62) says that when the log cannot be read, a decision card with notes is "notified exactly as in AC2". J5's second awkward case (line 119) says the same: "notices as usual for cards whose notes with a recommended word are on the main branch".
- The plan's approved scope promises this too: docs/projects/P-003.md:23, "notified as when the log is read".
- But J8 (line 179), resting on src-reading.md:79 and :84, says a failed read on the sender returns `{ read:false }`, so "the sender is never in AC17's case by this form", and "the sender sends no notice for any card until a read gets the records".
- So line 119 is unreachable and AC17's notice promise does not hold on the sender.
- Neither line 18's list of changed criteria nor any open question says so. Question 10 (line 277) and the risk at line 254 cover only a failed notes read.
- The owner would rule AC17 believing they get those notices.
- Fix: say in AC17, or in a new open question ruled with the criteria, that on the sender a failed log read sends no notice for any card. Note that changing this needs a change to src/notify/**. Delete or reword line 119.

**B2. Read literally, J8's definition of "queue/ is got" breaks AC4.**
- Line 175 says the poll "gives the tree when the branch's head has moved". Line 177 says "queue/ is got when the read got the tree and the text of every card file", and that a failed poll has not got queue/ "whatever tree the desk keeps".
- The clause that lets a read use what it already holds ("kept by the page from an earlier read") covers blob texts, not the tree.
- So a successful poll with an unmoved head has not got the tree, which means queue/ is not got. AC16 then hides every decision card.
- That is the normal case of AC4 (line 29): a card shows "on the desk's next scheduled read" as its day passes, usually with no new commit. It also hits AC2 and AC5 on any read where the head has not moved.
- Fix: one sentence in J8 saying a successful poll with an unmoved head gets the tree the desk holds.

**B3. AC9's checks on gate cards cannot fail.**
- AC9 (line 36) says a gate card keeps "its Recommended mark from its gate case as today" and that "the desk does not look for notes for it". It also lists "the marked button" among the fields compared.
- J7's case form (line 150) gives each queue entry only its words. It has no field for a gate case, or for a gate card's recommended word. Plan §1 (P-003.md:15) says that is where a gate card's recommendation comes from.
- The minimum cases at line 160 put notes only beside decision cards.
- The coverage check (line 169) requires gate cards to be `on_list`, but never requires a non-null `marked`.
- So the record is expected to hold `marked: null` for every gate card. A build that breaks gate-card marks, or marks a gate card from notes, still passes.
- This is exactly the code the fix changes (AC3: section 5 no longer marks a decision card) and the regression the Risks rely on AC9 to catch (line 249).
- Fix:
  - add a gate-case field (text, or a recommended word) to the `desk` and `open` records;
  - add a minimum case with a gate card that has a gate-case recommendation and a notes file recommending a different word;
  - make coverage fail if that gate card's `marked` is null.

## Non-blocking findings and risks

**N1. The new AC9/AC16 comparison is attributed to the plan approval, but the plan does not contain it (lines 18, 36, 61, 165).**
- Plan :61 says only that a failed notes read's baseline result is the no-failure run's. Comparing the built code's failed notes read with the base's failed log read is new wording.
- I judge it a change the fixes need. Compared against the no-failure run, the sender (src-reading.md:79, :84) would force a change to src/notify/**.
- It is still a criterion change the owner must see. That a failed notes read now stops every notice on the sender, gate cards included, departs from plan §1's "Gate cards … unchanged" (P-003.md:26).
- Question 10 does put it to the owner, which is good. But:
  - line 18 should say this is new wording ruled by question 10, not cover it with the approval at :14;
  - question 10 offers no options;
  - question 10 says the "Can't read" line shows on the queue and Home, but today it also shows on the board (src-reading.md:68).

**N2. The adapter's files differ from the plan.**
- Plan step 6 (:78): "writes tests/desk/baseline/adapter.mjs only".
- Brief (line 282): "(any other adapter file under tests/desk/baseline/)".
- Two further pieces must exist before the record: the checkout-shaped object (line 218) and AC14's stand-in "under tests/desk/" (line 57).
- Reconcile these with the plan, or say they all live in the adapter's files.

**N3. The stop-rule line (262) is incomplete.** It leaves out four stops stated elsewhere:
- a limit on the read path stopping the notes reads (lines 237, 282);
- a record showing the base commit reads notes (line 169);
- gate cards on a failed notes read differing from the base's failed log read (line 254);
- a stale reading at the freeze (line 23).

These are stricter than the plan, which is fine, but should be listed in one place.

**N4. Gate wording is stale against the plan.**
- Lines 190, 199, 244 and 258 speak of "the Build gate's case" and a decision record under decisions/P-003/.
- Plan :73 and :138 say there is no gate case: the Build gate is the criteria question, answered in decisions/questions/.

**N5. Small citation inaccuracies.**
- Line 175 says "except those whose blob the page already holds" and "keeps each text by path". src-reading.md:34 shows the cache keyed by `cacheKey(kind, e.sha)`, and :38 names `missing` without saying it leaves out what is cached.
- Line 177 cites :60 for a failed poll. The poll's `cant-read` is :59.
- Line 178 says "no blob of that call is got". :55 says only that "the other shas stay null".

**N6. Some entry points are not in the reading.**
- J7:148 says the adapter calls only entry points "from those the reading names (:138-160)". The `open` case's notice or link route has none there; :110 names only `desk.arrival()` on a service-worker tap.
- Home's inputs are "wide" and not fully traced (:69, :149, :179), yet `in_home_count`, `home_count` and Home's `lines` depend on them.
- Name both under Known limits or Risks. The stop at line 172 covers what happens if they fail.

**N7. How the sender keeps its last set between runs is not in the reading.**
- The reading shows the sender keeps `prev.keys` (src-reading.md:84) but not where it stores them.
- `sender` cases need several runs, and J7:148 says the adapter "reads no file but…". The two may clash.
- Note it as a risk.

**N8. J7 and J8 do not say which paths a `queue`, `log` or `notes` failure targets** (every card file, or one; every month file). Both runs use the same adapter, so the results are consistent. But the Reviewer's step-7 confirmation and the Check author's cases would benefit from it being stated.

**N9. A failed poll now hides every decision card.**
- New wording at J1:79 and J8:177: every failed poll (phone offline, signed out) hides all decision cards, while gate cards stay shown from the kept tree with the "Can't read" line.
- This is within AC16 and plan §1:22, and needed for finding 2. It is visible to the owner, so the criteria question and AC18's notes should say it plainly.

**N10. The freeze condition at line 23 may be too broad.** "If src/ or tests/ have moved" includes tests/acceptance/, which other items' locked checks may change. Consider narrowing it to src/ and tests/desk/, or say that a fresh reading follows.

## Open questions
1. Where does a gate card's Recommended mark come from at the base commit (which file, and in what form)? The case form needs this to fix B3, and neither the reading nor the spec says. A short addition to the step-2 reading may be needed.
2. B1 means the sender cannot deliver plan §1's sixth bullet (P-003.md:23) without a change to src/notify/**. Should this be put to the owner with the criteria, as question 10 is, or does it need the Chief of Staff to raise it against the approved plan first?

Files:
- /home/user/wt-critic/specs/S-009.md
- /home/user/wt-critic/reviews/S-009/src-reading.md
- /home/user/wt-critic/docs/handoff/2026-11-13-P-003-outside-build-plan.md
- /home/user/wt-critic/docs/projects/P-003.md
- /tmp/claude-0/-home-user/ac6bc9b8-20ad-59d2-b4af-fac3ee45c43c/scratchpad/definer-inputs/S-008.md
- /tmp/claude-0/-home-user/ac6bc9b8-20ad-59d2-b4af-fac3ee45c43c/scratchpad/definer-inputs/S-008-plan-review.md

## Round 2 — spec at build/definer/S-009 fa98acd8 (session branch 37d88090); dispatched 2026-11-13T05:04:25Z, returned 05:10:39Z

Verdict: FAIL

S-009 round 2 fixes round 1's three blocking findings (B1 to B3), and every non-blocking finding is fixed or honestly left. The plan's step-3 fixes still hold. Both change lists on line 11 check out as far as I could check them. It still fails on two points in J7's baseline-case form, both new this round:
- the `open` output is not defined for a notice, and AC15's comparison can fail a correct build;
- questions and pull-request cards rest on an unsupported claim about today's tests and have no output id, so the coverage check cannot be written for them.

Both fixes are a few sentences.

**How I checked (no shell).**
- **S-008 → S-009.** I read the S-008 copy (259 lines) and S-009 (293 lines) in full, line against line, using these offsets:
  - lines 1–164 match one for one;
  - S-009 165 is new;
  - S-009 166–173 = S-008 165–172; 174–181 (J8) are new;
  - S-009 183–222 = S-008 174–213; 223–232 are new;
  - S-009 233–240 = S-008 214–221; 241–243 are new;
  - S-009 245–257 = S-008 223–235; 258–264 are new;
  - S-009 265–281 = S-008 236–252; 282–286 are new;
  - S-009 287–293 = S-008 253–259.
  
  Every changed line I found is in the first list, and I found no change outside it. The line counts (259, 293) are right.
- **Round 1 → round 2.** I could not see round 1's text, so I mapped every line round 1's verdict cites onto today's numbering:
  - same numbers up to 228;
  - +4 from 229, after the new 229–232;
  - +5 after the new 243;
  - +7 after the new 263–264;
  - +9 after the new 285–286.
  
  284 + 9 = 293. Each quote round 1 objected to (old 62, 119, 175, 177, 178, 277, 282) is gone and its line is listed. Lines round 1 cited without objection (36, 61, 165, 179) are unlisted and still read as round 1 described. So "No other line changed" fits every reference I have, but I cannot prove it.

## Blocking findings

**B1. AC15's `open` output is undefined for a notice, and the comparison as written would fail a correct build.**
- J7:156 defines `shows` as "the card sheet's visible text". But a notice for a card not on the list opens no card sheet. On a good read it goes "to the project's page, or `#/`" with "That no longer waits on you", or to the card's Done row if this device marked it done. On a failed read it goes to the project's page with a can't-read message (src-reading.md:288-289). So for `via: notice` the field has nothing to point at, and the Check author cannot know what is compared.
- J7:162 and :167 (changed this round) add a built-only case: a decision card without notes, with `log` failing. It "must equal" the record's `open` result. If `shows` is read as the page's text, the built desk must show AC17's line, "Decision cards without Chief of Staff notes not shown: the dispatch log could not be read", on the queue and Home (AC17, line 62; J4:111). The notice may land on `#/`, which the reading does not identify further. The baseline has no such line.
- J7:164 strips the AC16 and AC17 lines for `desk` cases. Line 167 strips nothing for `open` cases. Line 58 also drops the reading's "or `#/`" and Done-row routes.
- The adapter and cases cannot change after the record (line 23), so a correct build would fail its locked check and stop.
- Fix:
  - define `shows` for each route: for a notice, the arrival words and the view it lands on; for a link, the sheet's text;
  - remove the AC16 and AC17 lines before the `open` comparison, as J7:164 does;
  - quote :289 in full at line 58.

**B2. Questions and pull-request cards in the case form rest on an unsupported claim, and have no output id.**
- J7:150 says the adapter writes the owner question file and the open pull request "each written as the tests in tests/desk/ already write that kind". The reading never says tests/desk/ writes either. It also does not show `fakeServer` or `loadSandbox` serving pull requests, or the sender's fake `fetch` answering them. Answer 1 (:28) says only that the poll reads PRs, and :43 that the sender reads REST through `makeGitHub`. Known limits (241-243) do not name this gap. The brief makes an unverifiable claim a FAIL.
- The output form gives an id form only for queue cards (`<item>-<gate>-<n>`, J7:150, :154). It gives none for a question or a pull request, in `cards[].id` or in `notices`. The coverage check (J7:169) fails if a question or pull-request card "is not `on_list`". It cannot do that for an entry it cannot find. An adapter that leaves those entries out passes, which is the same gap round 1 closed for gate cards (round 1 B3).
- Fix:
  - reword J7:150 as an instruction: the adapter's header comment names the src/ or tests/desk/ form it follows;
  - add a known limit that the reading does not show questions or PRs through these routes (the stop at line 172 covers failure);
  - fix the output ids, for example `question:<name>` and `pr:<number>`;
  - make coverage fail unless every `queue`, `questions` and `pulls` entry of the case has its entry.

## Non-blocking findings and risks

**Round 1, checked:**
- **B1:** resolved.
  - AC17 (line 62) now says the sender sends nothing on a failed log read, and why.
  - J5:119 is reworded.
  - Risk 263 and question 11 (line 285) give options A and B, and line 18 names it as new wording.
- **B2:** resolved. J8:177 says "A successful poll whose branch head has not moved gets the tree the desk already holds".
- **B3:** resolved.
  - J7:150 adds `cases` and the gate-case form, matching src-reading.md:215-216.
  - J7:160 adds a `dor` card with a gate case and different notes.
  - J7:169 adds the coverage rule on `marked`.
  - Line 229 adds the fact, citing :205-255.
- **N1 to N10:** fixed.
  - N1: lines 18 and 284. Question 10 now has options and names the board.
  - N2: lines 23, 148 and 291 say one file. Line 57's stand-in "under tests/desk/" still fits, since the adapter sits there.
  - N3: line 269 lists every stop in one place.
  - N4: lines 190, 199, 249 and 265.
  - N5: lines 175, 177 and 178.
  - N6: line 148 and Known limits 243.
  - N7: lines 148 and 264.
  - N8: J7:150.
  - N9: AC18 (line 68).
  - N10: lines 23, 262 and 269.

**Plan step 3 still holds.**
- Finding 1 (plan :52-57) is in line 23, the facts at 228 and 236, and the brief at 291.
- Finding 2 (plan :58-61) is in J8:174, where no read fails inside the rule; J8:175-178 for the read place and forms; and J8:180 with J7:165 and :169, where the base commit's notes failure equals its no-failure result.
- Every file under src/ is poisoned (171).
- AC4 matches the reading (29, citing :104-106).
- The stop rule is kept, with the adapter outside the count (218, 269).

**New this round:**
- **N1. A coverage failure has no stated route.** J7:169 says only that the check fails when a gate card's `marked` is not its gate case's word, a `sender` case sends nothing, or a card is not `on_list`. Only the notes-reading case says "the build stops and returns". The adapter and cases are frozen after the record (line 23), so such a record can never pass. Add "the record fails coverage" to line 269.
- **N2. Who assembles record.json is not stated.** J7:147 runs the adapter once per case and writes one output. The record (J7:158) adds `base_commit`, `node` and `hashes`, and no one is named to compute or wrap them. Line 23 says the session commits "the output, unedited". Say that the session's script wraps the per-case outputs unchanged, in a fixed order (by case id), and adds those fields. Say also that the step-11 re-run compares each result's bytes.
- **N3. The Builder's brief (291) lacks two of line 269's stops:**
  - the built desk showing gate cards on a failed notes read otherwise than the base commit on a failed log read;
  - a record that fails coverage.
  
  Left out, the Builder would rework the code until its three build rounds run out, instead of stopping.
- **N4. The join-up review was not updated for a fact found this round.** "That no longer waits on you", and the "No longer waiting" sheet, now also mean "held, will show again" (line 58, question 12, src-reading.md:289-290). The "One meaning per status signal" row (190) still lists only board and notification absence. I rate it non-blocking: it is reversible and question 12 covers it. Add it as a second difference carried into the criteria question.
- **N5. Small citation inaccuracies:**
  - Line 148: "the sender's `runSender` … handed a checkout-shaped object". `runSender` takes `openCheckout` (src-reading.md:156, :269).
  - Line 236: it cites plan :56 for the surface guard keeping the Builder out of tests/acceptance/**, but :56 covers only reviews/. The tests/acceptance/** rule is in AGENTS.md §1.
  - Line 175: the list of what `neededReads` asks omits the answer paths it pushes for each log entry (:136).
- **N6. Line 147, carried from S-008, is a risk.** "Fixes the process clock … by replacing the global `Date`" may not govern the injected clocks the reading shows: `createDesk({clock})`, `fakeServer(…, clock)`, `runSender({now})` (:159, :269). The stop at line 172 covers it. The adapter's header should say how the moment reaches each entry point.
- **N7. A failed poll now hides every decision card** (J1:79, J8:177; AC18 at 68). This follows plan §1:22's words and is now in the operating notes. Line 18 lists it only as "AC18's third bullet". The criteria question should say it plainly, because an offline phone hides decision cards that today stay shown.

**Criteria:** every criterion is a When/then scenario with a `[trace: V6 → ACn]` tag. AC9, AC16 and AC17 carry test mechanics, which is acceptable.

**Areas touched** (202) match plan step 9, including docs/handover/P-003/**.

## Open questions
1. If the owner chooses A on question 10 or 11, the ruled criteria will contradict P-003 Part 1: §1:23 ("notified as when the log is read") and §1 Out:26 ("Gate cards … unchanged"). Should the Chief of Staff note the ruling against Part 1, or amend it?
2. Should the criteria question list N7, decision cards hidden whenever the desk is offline or signed out, as its own item rather than inside AC18?

Files:
- /home/user/wt-critic/specs/S-009.md
- /home/user/wt-critic/reviews/S-009/src-reading.md
- /home/user/wt-critic/reviews/S-009/plan.md
- /home/user/wt-critic/docs/handoff/2026-11-13-P-003-outside-build-plan.md
- /home/user/wt-critic/docs/projects/P-003.md
- /home/user/wt-critic/decisions/questions/P-003-outside-build-plan.md
- /tmp/claude-0/-home-user/ac6bc9b8-20ad-59d2-b4af-fac3ee45c43c/scratchpad/definer-inputs/S-008.md

## Round 3 — spec at build/definer/S-009 09b806ed (session branch a08f666a); dispatched 2026-11-13T05:13:23Z, returned 05:18:12Z

Verdict: FAIL

Round 2's blocking findings B1 and B2 are fixed, and its N1 to N6 are fixed. Round 1's fixes and the plan's step-3 fixes still hold. The first list on line 11 is accurate. Every citation of the reading I checked is quoted correctly. All criteria are When/then scenarios traced to V6.

The spec still fails on two points, both in J7/J8:
- **B1:** the coverage check cannot fail when a listed read failure, or the desk cases' notices, never took effect. That leaves the failed-read parts of AC9, AC16 and AC17 open to passing vacuously.
- **B2:** one claim about today's code is unverified, and probably false for the `call` form.

Both fixes are one or two sentences. Both gaps were already in the text rounds 1 and 2 passed, so I flag them as implicating this role's earlier checks (D-050).

**How I checked line 11's three lists (no shell, no diff).**
- **List 1, S-008 → S-009: true.** I read the S-008 copy (259 lines) and S-009 (294 lines) in full, line against line, with these offsets:
  - 1–164 match one for one;
  - 165 is new; 166–173 = S-008 165–172;
  - 174–181 are new; 182–222 = S-008 173–213;
  - 223–232 are new; 233–240 = S-008 214–221;
  - 241–244 are new; 245–258 = S-008 222–235;
  - 259–265 are new; 266–282 = S-008 236–252;
  - 283–287 are new; 288–294 = S-008 253–259.

  259 + 35 new lines = 294. Every changed or new line I found is in the list, and every line outside it is word-for-word S-008's. "No other criterion, join sheet, fact, risk or open question changed" holds.
- **Lists 2 and 3: consistent, but only partly verifiable.** My pack holds neither 23256968 nor fa98acd8.
  - Every line the round-1 and round-2 verdicts objected to is listed under its present number. That includes the +1 shift after the new line 244: round 2's 263, 265, 269, 284–286 and 291 are now 264, 266, 270, 285–287 and 292.
  - Each round-2 finding maps to a listed round-3 line:
    - B1 → 58, 156, 167;
    - B2 → 150, 154, 169, 244;
    - N1 → 270; N2 → 23, 158; N3 → 292; N4 → 190;
    - N5 → 148, 175, 236; N6 → 147.
  - Every line outside list 1 still equals S-008, so no unlisted change exists outside list 1. Inside list 1, I cannot prove that unlisted lines did not change between rounds (see N4 below).

## Blocking findings

**B1. The coverage check cannot fail for the `fail` entries, or for the desk cases' `notices`, so the failed-read parts of AC9, AC16 and AC17 can pass vacuously (specs/S-009.md:169, :150, :154, :160).**
- The coverage rules at J7:169:
  - every `queue`, `questions` and `pulls` entry has a `cards` entry;
  - in a no-failure case, gate cards, questions and pull requests are `on_list`;
  - each `sender` case sends a notice;
  - a `notes`-failing result equals the no-failure result;
  - the `dor` card's `marked` is the gate case's word.
- No rule fails a record in which a listed `queue` or `log` failure (path or call form) changed nothing at the base commit. No rule fails a desk case whose `notices` is empty because the adapter's `runSender` route sent nothing.
- The same adapter runs the record and the built code (line 23). Suppose it does not apply `fail`, or catches no push call. Then:
  - the record's failing cases equal its no-failure cases;
  - the built code is never failed in the locked check;
  - a build that changes gate cards' behaviour on a failed read, or their notices, still passes.
- The poison run does not catch this, because the adapter still needs src/. Only the Reviewer's judgement before the record does (line 23), and the Builder writes the adapter.
- This is the same class of gap round 1 rated blocking (round 1 B3, reviews/S-009/plan.md:54-64). The brief asks for a coverage check that can fail for each kind of entry. `fail`, `log` and the desk `notices` have none.
- The spec already states today's behaviour, from the reading:
  - J8:178: a `path`-form failure on the desk ends can't-read with today's "Can't read" line (src-reading.md:61-63, :74-75). The real server's whole-call form is also can't-read (:55).
  - J8:179: on the sender, any failed read sends nothing (:79, :84).
- Fix: add to J7:169 that coverage also fails unless:
  - (a) each `queue`- or `log`-failing `desk` case, in either form, has in `lines` a line its no-failure result lacks, and has empty `notices`;
  - (b) each no-failure `desk` case has non-empty `notices` and no can't-read line in `lines`. This also shows the log entries reached the code (src-reading.md:70).

  The stop for a record that fails coverage is already at :270 and :292.

**B2. An unverified, probably false, claim about today's code (specs/S-009.md:175).**
- The line says: "On the desk only, `neededReads` also asks, as an optional read, for each gate card's gate case (:252-254); the sender never reads one, and no J7 case makes a gate case's read fail."
- J7:160 sets a case with `queue` failing in the `call` form. In that form "one failed blob makes its whole blob call can't-read, and the call's other blobs come back null" (J8:178; src-reading.md:55, :87-88).
- The reading does not say whether the optional gate-case read goes in the same blob call as the card files. :38 says the scheduler maps the needed reads to shas in `missing` and makes one `blobCall`. So in the `call` form the gate case's read likely does fail.
- The comparison itself is unharmed: the same adapter runs both sides, and no coverage rule covers `marked` in failing cases. But the brief makes an unverifiable claim a FAIL.
- Fix: "no J7 case names a gate case's path as failing; in the `call` form a gate case fetched in the same blob call may also come back unread (:55, :38)."

## Non-blocking findings and risks

**Earlier fixes, checked:**
- **Round 2 B1: resolved.**
  - J7:156 defines `lands` and `shows` for each route: for a notice, the view it lands on and its arrival words; for a link, its address and the sheet's text.
  - J7:167 strips the AC16 and AC17 lines from `shows`.
  - Line 58 quotes src-reading.md:289 word for word. It also quotes :288 and :290 accurately.
- **Round 2 B2: resolved.**
  - J7:150 is now an instruction (the header comment names the form and the file it follows).
  - Known limit 244 is new, and it quotes :28 and :43 accurately.
  - J7:154 adds the ids `question:<name>` and `pr:<number>`.
  - J7:169 requires a `cards` entry for every `queue`, `questions` and `pulls` entry.
- **Round 2 N1 to N6: fixed.**
  - N1: 270, "or otherwise fails coverage".
  - N2: 158 (the session's script, results in case-id order) and 23 (bytes compared case by case).
  - N3: 292 now holds both stops.
  - N4: 190 adds the second difference, carried into question 12.
  - N5: 148 (`openCheckout`), 236 (AGENTS.md:38, which I confirmed) and 175 (answer paths, :136).
  - N6: 147 (the header says how the moment reaches each entry point; :159, :269).
- **Round 2 N7 and its open questions:** left for the criteria question, as briefed.
- **Round 1 B1 to B3 still hold:** 62 and 119; 177's unmoved-head sentence; 150, 160, 169 and 229.
- **Plan step 3 (docs/handoff/2026-11-13-P-003-outside-build-plan.md:51-65) still holds:**
  - finding 1: line 23 and the fact at :228;
  - finding 2: J8 174-180, J7:165 and :169;
  - the poison run covers every file under src/ (171);
  - AC4 matches the reading (29, citing :104-106);
  - the stop rule is kept, with the adapter outside the count (218, 270).

**Claims about today's code:** these are quoted accurately from reviews/S-009/src-reading.md:
- 29; 75 (:118-124, :131); 80 (:131-135); 147 (:159, :269);
- 148 (:156, :266, :269-274, :278-292, :301-305, :322); 150 (:215-222, :248);
- 152 (:278); 154 (:68-69); 169 (:93-100, :205-219);
- 175-180, except B2; 223-232; 241-244; 265.

**Line 18 and the open questions:**
- Line 18 names the new wording that the plan's approval does not contain (AC9 and AC16; AC17 and J5) and sends it to questions 10 and 11, which both give options A and B.
- Line 275 is consistent with them.
- Areas touched (202) match plan step 9.
- The stop rules at 270 match 23, J5, J7, Known limits and Risks.

**N1. The brief (292) does not tell the first dispatch what to do if no adapter can run at the base commit.**
- An example is `loadSandbox` not passing `blobNull` or `blobFail` on (Known limits 243).
- Lines 270 and J7:172 put that stop on the session. The Builder might instead hand back an adapter that cannot run.
- Add "or stop and return if the adapter cannot be written to run at the base commit".

**N2. AC15's link comparison could fail a correct build.**
- The baseline's `open` case is for an id not in queue/ (J7:162). The built held-card case has a card file.
- The reading gives only part of the "No longer waiting" sheet's text (:290). If that sheet shows the card's title from its file, `shows` differs, and the build stops.
- Consider saying the card's title is removed or written as `<id>` like the key.

**N3. Per-card `in_home_count` may not be readable from the page.**
- J7:148 forbids the adapter working out a field. The reading shows Home's head count (`bd.badge`, :297) but not which cards Home draws (:69, :179, :330).
- Known limit 243 covers Home's count not being driven in a run, but not this per-card field. The stop at 172 covers the failure, but a false stop goes to the owner.

**N4. Lists 2 and 3 on line 11 are only partly verifiable from my pack.**
- Before recording, the session could confirm them with `git diff 23256968 fa98acd8 -- specs/S-009.md` and `git diff fa98acd8 <this commit> -- specs/S-009.md`.

**N5. A departure from the earlier ruling.** Line 23's "no copy of the record is kept with the locked checks" departs from decisions/P-003/failure-15.md:4 ("kept with the locked tests"). The approved plan (:76) and L-0051 cover it, and line 11 lists it. The criteria question should still say plainly that the place has moved.

**Self-implication (D-050).** B1's gap was in J7:169 as rounds 1 and 2 read it. B2's sentence came in with round 2's B3 fix, and round 2 passed it. This role's earlier checks missed both.

## Open questions
1. This is the third failed round, so it goes back to the owner. Both fixes are a sentence each in J7:169 and J8:175. Should the session ask the owner to allow one short definer fix, checked by a fresh Critic, rather than a re-plan?
2. B1's fix writes today's failed-read behaviour from the reading into the coverage rules. If the base commit behaves otherwise, the record fails coverage and the build stops. Should the criteria question say so beside questions 10 and 11?

Files:
- /home/user/wt-critic/specs/S-009.md
- /home/user/wt-critic/reviews/S-009/plan.md
- /home/user/wt-critic/reviews/S-009/src-reading.md
- /home/user/wt-critic/docs/handoff/2026-11-13-P-003-outside-build-plan.md
- /home/user/wt-critic/decisions/questions/P-003-outside-build-plan.md
- /home/user/wt-critic/decisions/questions/P-001-card-recommendation.md
- /home/user/wt-critic/decisions/P-003/failure-15.md
- /home/user/wt-critic/AGENTS.md
- /tmp/claude-0/-home-user/ac6bc9b8-20ad-59d2-b4af-fac3ee45c43c/scratchpad/definer-inputs/S-008.md
- /tmp/claude-0/-home-user/ac6bc9b8-20ad-59d2-b4af-fac3ee45c43c/scratchpad/definer-inputs/S-008-plan-review.md

*The session's check of round 3's N4, made after the return and not part of it: `git diff -U0 fa98acd8 09b806ed -- specs/S-009.md` gives hunks at lines 11, 23, 58, 147-148, 150, 154, 156, 158, 167, 169, 175, 190, 236, 244, 270 and 292, the round-3 list on line 11 exactly. This is the third failed round: by the plan's stop rule the build stops here and goes back to the owner (questions/P-003-S-009-third-fail.md).*

## Round 4 — spec at build/definer/S-009 71ea17d2 (session branch 2d91daad); dispatched 2026-11-13T14:18:45Z, returned 14:22:32Z

*The one further round the owner allowed (decisions/questions/P-003-S-009-third-fail.md); a fresh Critic, recorded by session_01QBwHGJGYoFwkxVunu5XDbF as `orchestrator`.*

Verdict: PASS

S-009 round 4 fixes round 3's B1 and B2 and its N1 to N3. None of the earlier fixes has regressed. Every citation of today's code that I checked is supported by reviews/S-009/_src-reading.md. The header names `milestones: M4`, and M4 is a milestone of docs/projects/P-003.md (:46). The join-up review section is present and in form (specs/S-009.md:183-199). Nothing contradicts the approved plan (docs/handoff/2026-11-13-P-003-outside-build-plan.md, steps 3, 4 and 6, and its stop rules) or the owner's rulings (decisions/questions/P-003-outside-build-plan.md:1, :14; decisions/questions/P-003-S-009-third-fail.md:1, :17-21; decisions/P-003/failure-15.md:4).

I found nothing that meets the round's blocking bar:
- no false or unverifiable claim about today's code;
- no check that can pass vacuously on its own terms;
- no check that cannot be built;
- no contradiction with the plan or the rulings;
- no break in the spec form.

The findings below are non-blocking. Most are risks that the build stops when it need not, and they should be carried into the criteria question (plan step 4).

**Method.** I read the spec, the reading and the plan cold. Only then did I read reviews/S-009/plan.md. I did not re-prove the diff hunks, as briefed. I checked the content of every changed line, and compared line 164 with S-008:164.

## Blocking findings
None.

**Round 3, checked (reviews/S-009/plan.md:281-363):**
- **B1: fixed.** specs/S-009.md:169 adds rules (a) and (b), as proposed. Their citations hold:
  - _src-reading.md:61-63, :68 and :74-75 for the path-form "Can't read" line;
  - :55 for the whole-call form;
  - :79 and :84 for the sender sending nothing;
  - :70 for the no-failure case.
- **B2: fixed.** :175 now reads "no J7 case names a gate case's path as failing; in the `call` form a gate case fetched in the same blob call may also come back unread (:55, :38)". That is hedged and supported.
- **N1: fixed.** :293 adds "or stop and return if the adapter cannot be written to run at the base commit". This matches plan :166 and specs/S-009.md:172 and :270.
- **N2: fixed.** :156 writes the key, the id and the title as `<id>`. N3 and N4 below give the caveats.
- **N3: fixed.** :154 drops the per-card Home field and says why. The citations hold: :297 for the head count; :69, :179 and :330 for what was not traced.
- **Round 3, open question 2** is now open question 13 (:288).

**Regression check (all still in place):**
- Round 1:
  - B1 at :62 and :119;
  - B2 at :177, on the unmoved head;
  - B3 at :150, :160, :169 and :229.
- Round 2:
  - B1 at :156 and :167;
  - B2 at :150, :154, :169 and :244.
- Round 2's N1 to N6 and round 3's notes (:270 lists every stop; :293 holds them for the Builder).
- Plan step 3: line 23 and :228, J8 at :174-180, the poison run on every src/ file (:171), AC4 against :104-106 (:29), and the stop rule with the adapter outside the count (:218, :270).

**Citations on the round-4 lines, all supported:**
- :29 (:104-106)
- :58 (quotes :288, :289 and :290 word for word)
- :75 (:118-124, :131)
- :80 (:131-135)
- :147 (:159, :269)
- :148 (:156, :266, :269-274, :278-292, :301-305, :322)
- :150 (:205-250)
- :152 (:278)
- :154 (:68-69, :297, :69, :179, :330)
- :169 (:93-100, :205-219, :61-63, :68, :74-75, :55, :79, :84, :70)
- :175 (:28, :33-38, :55, :136, :252-254, :16, :100)
- :190 (:289-290)
- :215 (:118-125)
- :223-232
- :234-236 (:164, :118-124, :126, :3)
- :238 (:129-136)
- :241-244 (:186, :166, :178, :87-88, :322, :290, :329-330, :339, :28, :43)
- :265 (:257-266, :329)

## Non-blocking findings and risks

**N1. :164's Home-count comparison rests on an unstated assumption about today's Home. It is a false-stop risk only, not a blocker.**
- The parenthetical says "a decision card is in Home's count exactly when it is on the queue". It is justified "by AC1, AC2, AC4, AC16 and AC17", which bind only the built code.
- The same subtraction is applied to the record's result. For the base commit, the reading shows that Home's head count takes `bd.badge` (_src-reading.md:297), but not what `bd.badge` counts. It is also explicitly untraced on a can't-read project (:69, :179) and was never driven in a run (:330).
- **Why it is not a blocker:**
  - If the assumption is false, the derived figures differ between the record and the build, and the check fails. It never passes wrongly.
  - The subtraction even catches a held card counted in Home: the built count rises and `on_list` does not.
  - A false pass needs two offsetting bugs, one of which AC1's own tests catch.
- **The real risk is the failed-read cases.** At the base commit, decision cards stay flagged from the tree on a failed read (:66, :68). If the base's Home head count leaves out a can't-read project's cards, then no build that meets AC16 or AC17 can match the record.
- **No stop is named for this.** It is not in :270 or :293, so the Builder would use up its three build rounds before it stopped.
- **Fix:**
  - name the assumption in Known limits or Risks;
  - add a stop for "the Home-count comparison cannot be met by a build that meets AC1, AC4, AC16 and AC17";
  - carry it into the criteria question.
- Route: Definer.

**N2. Coverage has no rule for `open` cases with `log` failing (:162, :167, :169).**
- Rules (a) and (b) cover only `desk` cases. Suppose the adapter's `open` route ignored `fail`. Then:
  - the record's log-failing `open` result would equal its good-read one, "That no longer waits on you";
  - the built-only case at :167 would also pass, with the AC15 failed-read half never exercised.
- **Why non-blocking:**
  - The adapter is one file (:23, :148), and both kinds load the page through `loadSandbox` with the fake server's `blobNull`.
  - Rule (a) shows that this route applies `fail` for `desk` cases.
  - The Reviewer confirms the adapter before the record (:23).
- Escaping all of that needs deliberately separate handling for `open` cases.
- **Fix:** a one-line rule that each `open` case with `log` failing has `shows` or `lands` differing from its no-failure twin. The base gives the can't-read words, _src-reading.md:288.
- **D-050:** this gap is in round 3's own B1 fix proposal (reviews/S-009/plan.md:298-300), which covered `desk` cases only. That implicates this role's earlier check.
- Route: Definer.

**N3. :156's title rule has nothing definite to act on, and :148 still lists only the id as rewritten.**
- J7's card file has no title line: only `## 4. Options` lines and no `## 5.` (:150). So "its title from its card file" is whatever the desk derives. The reading shows only the fallback `card <gate>-<n>` when the file is unread (:66).
- :148 says the adapter "only picks fields, sorts and writes `<id>` for the card id". It does not mention the key or the title, which :156 now adds. The Reviewer's check against :148 could refuse the adapter.
- **Possible false stops in the same field:**
  - the encoded key in an address (`encodeURIComponent`, :278) does not match the raw key;
  - part-forms such as `<gate>-<n>` are not rewritten.
- This bites if the baseline's id (one "not in queue/", :162) differs from the built held card's id.
- **Fix:**
  - give J7's card file a fixed title line;
  - align :148 with :156;
  - or require the built-only AC15 cases to use the same id as the baseline `open` cases, which makes the rewrite unneeded.
- **D-050:** this came from round 3's N2 suggestion (plan.md:356-359).
- Route: Definer.

**N4. Line 11's first list ("What changed from S-008") is now incomplete, and its closing sentence is now false.**
- Round 4 changed :164, which was S-008:164 ("`home_count` less the decision cards counted"), and added open question 13 at :288. Neither is in the first list.
- The first list still ends "No other criterion, join sheet, fact, risk or open question changed."
- The round-4 list does name both, so the record taken as a whole is complete. A reader comparing S-008 with S-009 by the first list alone is misled.
- **Fix:** add 164 and 288 to the first list, or scope its closing sentence to "before round 4".
- The session's diff check covered only the round-4 list.
- Route: Definer.

**N5. Open question 13 (:288) offers no options, unlike questions 10 and 11 (:285-286).**
- It describes the rule accurately, matching :169, and says "You rule this with the criteria". It never says what the owner chooses between.
- For example:
  - A: accept, so a base that behaves otherwise stops the build;
  - B: drop rules (a) and (b), accepting that the failed-read checks may pass vacuously (round 3 B1).
- Round 2 found the same gap in question 10 (plan.md:74).
- Route: Definer. The criteria question's author should fix it there too.

**N6. Rules (a) and (b) assume cases are written to suit them.**
- (a) needs "its no-failure result for the same records". Nothing requires every `queue`- or `log`-failing `desk` case to have a no-failure twin.
- (b) fails any no-failure `desk` case whose first sender run sends nothing, such as a case with no open cards.
- (b) also assumes that today's sender sends on its first run, from `emptyState` (:265). The reading does not show that. A first run that sends nothing for the whole set would stop the build.
- "Can't-read line" is not defined by its words.
- All of these give false stops only, and question 13 covers the class.
- **Fix:** state that every failing case has a no-failure twin, and that every no-failure `desk` case holds at least one open card. Name the first-run assumption in Known limits.
- Route: Definer.

**N7. :175's `call`-form note leaves a small false-stop risk.**
- Suppose the built code moves the optional gate-case read into a separate blob call. Then in the `call` case the built gate card's `marked` could be the gate case's word, where the base gives `null`, and the check would fail.
- The build has no reason to do that, and :148 asks it to keep its entry points. Mentioned for completeness.

## Open questions
1. N1: should the criteria question say plainly that the Home-count comparison assumes today's Home counts each listed decision card exactly once, including on a can't-read project? And that if it does not, the build stops?
2. N2 and N3 are each one sentence in J7. Since a PASS sends the spec on to the criteria question with no further plan-review round, should the session ask the Definer to fold them in before freeze? Or should they be carried as risks into the criteria question?

**Self-implication (D-050):** N2 and N3 implicate this role's round-3 check: its B1 fix proposal and its N2 suggestion.

Files:
- /home/user/wt-critic/specs/S-009.md
- /home/user/wt-critic/reviews/S-009/_src-reading.md
- /home/user/wt-critic/reviews/S-009/plan.md
- /home/user/wt-critic/docs/handoff/2026-11-13-P-003-outside-build-plan.md
- /home/user/wt-critic/decisions/questions/P-003-outside-build-plan.md
- /home/user/wt-critic/decisions/questions/P-003-S-009-third-fail.md
- /home/user/wt-critic/decisions/P-003/failure-15.md
- /home/user/wt-critic/docs/projects/P-003.md
- /tmp/claude-0/-home-user/2aa7e563-9eb8-5f6c-8b1b-50ea8df7b370/scratchpad/critic-inputs/S-008.md

*The session's note after the return, not part of it: the round passed. The Critic's open question 2 asks whether N2 and N3 should be folded into the spec before freeze. The owner allowed one round only, so the session does not run another; N1 to N7 and both open questions are carried into the criteria question for the owner to rule.*

## Round 5 — the lines that close round 4's gaps only, spec at build/definer/S-009 f39133ec (session branch bba779f5); dispatched 2026-11-13T14:33:20Z, returned 14:35:23Z

*Under the owner's criteria answer, given in session at about 14:29Z: "B: close gaps first (Recommended)" (to be recorded in decisions/questions/P-003-S-009-criteria.md once the question is on main). A fresh Critic, checking only the changed lines; recorded by session_01QBwHGJGYoFwkxVunu5XDbF as `orchestrator`.*

Verdict: PASS

S-009 round 5 closes round 4's N1 to N6. I checked only the changed lines (specs/S-009.md:11, 148, 150, 156, 162, 164, 167, 169, 242, 243, 270, 275, 288, 293), and read other lines only where I needed them to judge those.
- No changed line makes a claim about today's code that reviews/S-009/_src-reading.md does not support.
- No criterion's meaning changed, and no check can now pass vacuously or cannot be built.
- Nothing contradicts the rest of the spec or the owner's criteria answer.

Two of the findings below are worth carrying to the owner or the criteria record, though neither blocks:
- New rule (c) will probably stop the build for its direct-link case, at the coverage check, before src/ changes.
- Question 13 does not yet describe rule (c).

**How each round-4 gap was closed**
- **N1, closed.** :164 states the Home-count assumption, says the reading does not show it, and names the stop. :243 adds it to Known limits. The stop is in :270 ("if the Home-count comparison (J7, line 164) cannot be met by a build that meets AC1, AC4, AC16 and AC17") and in :293.
- **N2, closed.** :169 rule (c): "each `open` case with `log` failing has `shows` or `lands` differing from its no-failure twin". For notices this is supported by _src-reading.md:288, with :70 and :75 showing that a failed log read makes the project read can't-read. See N-A for direct links.
- **N3, closed.**
  - :150 gives every card file a fixed title line, `# Card` then `## 1. The decision` then `Pick one`. That follows the reading's sample card (:229-236), and :75 shows "Pick one" drawn as the title.
  - :148 now lists the key and the title as rewritten to `<id>`, which matches :156.
  - :162 and :167 use the same decision-card id in the baseline cases and the built-only cases.
  - :156 covers the `encodeURIComponent` key, supported by :278.
- **N4, closed.** I checked the first list on line 11 against every round's list. It now has 164 and 288, and every line named in rounds 2 to 5 is in it. Its closing sentence ("Counting every round to round 5 below, no other criterion … differs from S-008") is true.
- **N5, closed.** :288 now offers options A and B. :275 records the owner's choice of A on questions 10, 11 and 13 as "to be recorded", which is correct per the brief.
- **N6, closed.**
  - The can't-read line is defined by its words (:169), supported by :68-69.
  - Every failing `desk` or `open` case must have a no-failure twin.
  - Every no-failure `desk` case must hold an open card, and a case set that breaks either rule fails.
  - :242 names the first-run assumption (from `emptyState`, :265) and its stop (:270).
  - The AC15 cases at :162 and the AC9/16/17 cases at :160 already meet the twin rule.

## Blocking findings
None.

## Non-blocking findings and risks

**N-A. Rule (c) is backed for notices only, but it also applies to direct links, and the spec's own account suggests links do not differ (specs/S-009.md:169; :58; _src-reading.md:288, :290).** This is a false-stop risk and probably a real one.
- The rule's parenthetical cites only :288, which covers the notice route.
- For a direct link, :156 sets `lands` to "the link's address", which is the same on both reads. `shows` is the sheet's visible text.
- The reading shows only one link sheet for a card not on the board, "No longer waiting" / "That no longer waits on you" (:290). It does not show that sheet's text changing when the read fails.
- AC15 (:58) describes the link sheet the same way and makes no difference by read state.
- So the base commit's log-failing link case may well equal its no-failure twin. The record would then fail coverage, and the build would stop under :270 ("otherwise fails coverage") after the adapter and record are made.
- This cannot let a wrong build pass. Unlike rule (b)'s assumption (:242), though, this one is not named in Known limits.
- Possible fix, not made by me: limit (c) to `via: "notice"` cases, or name the link-route assumption beside :242 and :243.
- **D-050:** this gap is in this role's own round-4 fix proposal (reviews/S-009/plan.md:481), which cited only :288. That implicates this role's earlier check.

**N-B. Question 13 (:288) does not describe rule (c), the twin rule or the open-card rule (specs/S-009.md:288 vs :169).**
- It describes the coverage check as only rules (a) and (b), and its option B drops only those two.
- The owner's "A on 13" was given before rule (c) existed. Rule (c) is within the owner's B answer (questions/P-003-S-009-criteria.md:25, "changes only the comparison's wording … and question 13's options"), so this is not a contradiction.
- Still, the question the owner's A is recorded against now understates the coverage stops, and N-A's likely stop comes from the rule it leaves out. This matters for how the answer is recorded under decisions/questions/.

**N-C. One phrase in :156 understates the reading.** It says "the reading shows only the title the desk falls back to when the file is unread, `card <gate>-<n>` (:66)". But _src-reading.md:74-75 also shows a title drawn from a card file that was read ("P-001 dor-2: Pick one"). The mistake is harmless, since it understates rather than overclaims and the fixed title line makes the rewrite safe either way. It is still not accurate as written.

**N-D. The Home-count stop (:164, :243, :270, :293) is still the likeliest false stop.** If today's Home leaves a can't-read project's cards out of its count, the base subtracts all decision cards while the build subtracts only those with notes, and the build stops. It is now named, with its stop, as N1 asked. It stays a risk for the criteria record.

## Open questions
1. Should rule (c) be limited to notice `open` cases before freeze (N-A)? Or should its link-route assumption be named and carried as a risk, as rule (b)'s first-run assumption is (:242)?
2. Should the recorded answer to question 13, or question 13's text, say that rule (c), the twin rule and the open-card rule are part of the coverage the owner's A accepts (N-B)?

**Self-implication (D-050):** N-A implicates this role's round-4 check (reviews/S-009/plan.md:481).

Files:
- /home/user/wt-critic/specs/S-009.md
- /home/user/wt-critic/reviews/S-009/_src-reading.md
- /home/user/wt-critic/reviews/S-009/plan.md
- /home/user/wt-critic/questions/P-003-S-009-criteria.md

*The session's note after the return, not part of it: the check passed, so by the owner's answer B the spec is frozen as in A once the answer is recorded under decisions/questions/. The question is not yet on main (#419), so the answer is not recorded and the spec is not frozen. N-A and N-B are put to the owner before freeze.*

## Round 6 — the pre-freeze lines only (round 5's N-A, N-B, N-C), spec at build/definer/S-009 84b3891 (session branch a0d8ab6); dispatched 2026-11-13T14:47:10Z, returned 14:48:40Z

*Under the owner's pre-freeze answer "Fix both first (Recommended)" (decisions/questions/P-003-S-009-pre-freeze.md). A fresh Critic, checking only the changed lines; recorded by session_01QBwHGMmHGgB3fLufS5ELH2 as `orchestrator`.*

Verdict: PASS

**Scope and one limit.** This is plan review round 6 of S-009. I checked only specs/S-009.md:11, :156, :169 and :288, against:
- the owner's ruling, decisions/questions/P-003-S-009-pre-freeze.md:1 and :17;
- round 5's N-A, N-B and N-C, reviews/S-009/plan.md:584-599;
- the reading, reviews/S-009/_src-reading.md:66, :70, :74-75, :288, :290.

I could not run `git diff f39133e 84b3891`. I have no shell, and Read cannot open the compressed objects in /home/user/Service-Desk/.git. So for check 4 I compared the current text with the old wording that round 5 quotes (plan.md:564, :594, :599). I read AC1 to AC19 (:26-72) in full and found nothing that mentions round 6's changes. I could not prove byte by byte that those lines are untouched (open question 1).

**1. Line 169, rule (c): met.**
- Rule (c) now reads: "each `open` case with `via: "notice"` and `log` failing has `shows` or `lands` differing from its no-failure twin". Direct links are left out explicitly. This matches the ruling (P-003-S-009-pre-freeze.md:17) and N-A's suggested fix (plan.md:591).
- The reason given for leaving links out is supported:
  - For a link, `lands` is defined as the link's address (:156), so it is the same on both reads.
  - _src-reading.md:290 shows only one sheet for a link to a card not on the board, "No longer waiting".
- The kept notice rule is still backed. :288 gives the can't-read words on a cant-read project, and :70 and :75 show that a failed log read makes the project read can't-read.
- No new way for a wrong build to pass:
  - Rule (c) only checks that the baseline record shows the failure taking effect. It never compared built output. The built output is still judged by :167.
  - Notice cases still go through rule (c). They load the page through the same `loadSandbox` and fake-server failure (:148, J8), so the adapter's log failure is still shown to work on the opening route.
  - The twin rule still covers link cases.
  - A built desk whose log failure does not take effect would show the not-shown card's sheet, with buttons, by link. That differs from the record's "No longer waiting" result, so :167 catches it.
  - Before this change, rule (c) on links could only cause a false stop, never a false pass.

**2. Line 288, question 13: met.**
- It now names rules (a), (b) and (c), the twin rule and the open-card rule. Each matches :169:
  - (a): a new line and empty `notices` when `queue` or `log` fails.
  - (b): non-empty `notices` and no can't-read line when every read succeeds.
  - (c): notice only; direct links not held to it.
  - The twin rule: same records, moment and opening. "Same kind" is left out but implied.
  - The open-card rule.
- The options' meaning is unchanged. A accepts. B still drops only rules (a) and (b) (compare plan.md:595), so (c) and the two case-set rules stay under B.
- This closes N-B.

**3. Line 156: met.**
- "the title the desk falls back to when the file is unread, `card <gate>-<n>` (:66)" is supported by _src-reading.md:66 and by the `blobNull-card` run at :74 ("card dor-2").
- "a title drawn from a card file that was read, "Pick one" in "P-001 dor-2: Pick one" (:74-75)" is supported by the `blobNull-log` run at :75, where the card file was read and the log was not.
- This closes N-C.

**4. Line 11, the round-6 entry: met, as far as the content shows.**
- The entry names the note itself, :156, :169 and :288, and gives the reason for each change. Each matches what the current lines hold, set against round 5's quotes of the old wording.
- The first list's closing sentence now reads "Counting every round to round 6 below".
- The entry says "no criterion changed". Nothing in :26-72 refers to the round-6 changes. The diff check is open question 1.

## Blocking findings
None.

## Non-blocking findings
- **N1. Line 169 says a little more than the reading.** It says the link sheet is the same "whatever the read state (:290)". _src-reading.md:290 shows one sheet branch but says nothing about read state. It names no variant for a failed read; it does not show the sheet is unaffected by one. This does no harm, because the clause only allows a link case to equal its twin ("may equal its twin"). A truer wording would be "and names no other for a failed read".
- **N2. Question 13 leaves out one coverage rule that is also about failed reads.**
  - It says the check works "by five rules" (:288). But :169 also fails the record when a `notes`-failing result differs from the no-failure result, which stops the build (:270, "if the record shows the base commit reading notes").
  - :169 also has case-set rules that are not about failed reads: a result for every case, a `cards` entry for every entry, an `on_list` gate card or question in no-failure cases, a notice in every `sender` case, and the `dor` mark taken from its gate case. These are fairly outside a question framed as being about failed reads.
  - The ruling's headline (P-003-S-009-pre-freeze.md:1) says "name every coverage rule". Its carrying-out line (:17) names only (c), the twin rule and the open-card rule. The line meets the carrying-out line, not the literal headline.
  - Options A and B are unaffected, and the notes rule is shown to the owner at :270 and in Risks :260.

## Open questions
1. Before freeze, can the Orchestrator run `git -C /home/user/Service-Desk diff -U0 f39133e 84b3891 -- specs/S-009.md` and confirm the changed hunks are only at lines 11, 156, 169 and 288? I could not run it, so check 4's statement that no AC1 to AC19 line changed rests on reading the content, not on the diff.
2. The owner's A on question 13, listed at :275 as "to be recorded", was given before this rewording. When decisions/questions/P-003-S-009-criteria.md records it, should it name the question-13 text as of this commit? The pre-freeze ruling ordered the rewording, so this is a recording point, not a conflict.

**Self-implication (D-050):** none. This role's earlier checks (plan.md:481, :584-599) raised these issues; this round checks how they were fixed.

*The session's note after the return, not part of it: open question 1 is answered: `git diff -U0 f39133e 84b3891 -- specs/S-009.md` shows exactly four hunks, at lines 11, 156, 169 and 288, so no line of AC1 to AC19 changed. On open question 2, the criteria record (decisions/questions/P-003-S-009-criteria.md) already notes that the A on question 13 was given before rule (c) existed and that the pre-freeze ruling rewords the question; the question-13 text the owner's A is held to is that at 84b3891. N2 is carried as a risk: the notes-failing rule is shown to the owner at :270 and :260 but not named in question 13. By the owner's answers, the PASS lets the Definer freeze S-009.*
