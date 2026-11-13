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
