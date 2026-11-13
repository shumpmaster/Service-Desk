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
