# EXP-008 registration — the Critic's round 1, verbatim

Read: experiments/EXP-008-widget-refresh-documents.md at 712c951 (build/definer/p004-exp008, Draft 1),
with the test widget not yet named. Recorded by the orchestrator, session
session_01QBwHGJ3CcwMQ1i8bkydhLN, 2026-11-07.

---

Verdict: FAIL

Critic, round 1 of 3 (D-044). I read experiments/EXP-008-widget-refresh-documents.md, Draft 1, at /home/user/sd-wt-definer. I checked it against experiments/_REGISTRATION.md, docs/PROJECT.md:619-625, the five rulings, EXP-007 (frozen), its result, reviews/EXP-007/ and reviews/316/_reviewer-verbatim.md. I ran nothing.

**Self-implication flag (D-050):** the gap this draft closes was in EXP-007, which I passed at round 3. In reviews/EXP-007/_critic-r3-verbatim.md, section 2, I wrote "Nothing in it loosens the mark" and did not notice that there was no outcome for a run with no counted later refresh. This check is on a new document, but Triage should note that my earlier check missed it.

**What holds**
- **Pass mark:** lines 322-329 match PROJECT.md:623 word for word.
- **Form:** all the sections of _REGISTRATION.md are present, and there is a frozen line.
- **New test, not a re-run (D-047):** lines 54-63 hold. The storage moves, the log has new fields and the outcome rules are new, and no EXP-007 refresh is counted.
- **Data:**
  - Storage is local Documents only (Method 4), and the Reviewer confirms the widget writes nowhere else.
  - Both keys are new, with 7-day expiries (Method 2 and Method 8).
  - The data goes only to the private portfolio, branch `exp-008-test-data`, with the guard limited to that ref. Line 159 says "Service-Desk ... never receives the test data or the log."
  - The file holds no private project content.
- **Carry-overs:**
  - Finding 6: the adapter is audited in full twice (lines 211-221).
  - Finding 7: widget lifetimes are given as bounds (lines 278-283).
  - Finding 8: the Builder adds nothing to the result (Method 10).
  - Open question: whether the token page offered Checks is noted (Method 2).
- **Not judged goes to the owner** with the two fallbacks (lines 414-419). This is a correct reading of ruling A's "a fail or another not-judged result comes back to you".

**Findings**

1. **Blocking. The busy-stretch reading loosens the pass mark.** (Deciding threshold, "The day and the busy stretch", lines 380-385; claim at lines 331-332; restated at 451-453.)
   - The pass mark asks for "a day of normal refreshes that includes at least one busy stretch ... or, if no such stretch happens, a refresh after a whole day's changes".
   - The draft treats a stretch that happened but that no counted refresh covered as "no such stretch", and concludes "the busy stretch does not change the outcome".
   - Read literally, a run whose stretch happened but went uncovered meets neither branch: the stretch did happen. So it cannot pass.
   - The draft turns that run into a pass, which contradicts its own line 331-332: "adds no condition that could make a run pass that the words would not". It also takes out of the mark, in substance, a condition the plan names.
   - Fix: either make a covered stretch a pass condition (uncovered → a not-judged code), or have the owner rule on this reading before the freeze.
   - Route: Definer (pre-registration); the Chief of Staff if the owner is asked.

2. **Blocking. F7 is a new fail rule, and the draft leaves it open.** (Lines 350-359 and 430-440, ending "The owner may rule F7 a not-judged instead (open question for the Critic and the owner)".)
   - A frozen registration cannot carry an open question about its own outcome rules. If the owner settles it after the run, that is a rule chosen after the run (D-047).
   - On substance: the pass mark's fail clause is "If the later refresh fails", and under F7 no later refresh exists.
   - Calling a blind widget a fail is a defensible reading: the "done once inside the Scriptable app and kept" allowance was not met for the widget. But it is a choice of label, not a reading forced by the words.
   - The label matters to the owner even though the next step is the same. Options B and C on the next-step card were worded "though the test didn't fail it", so a "fail" here tells the owner the widget route failed.
   - Fix, before the freeze: either the owner rules on F7 through a question, or F7 is turned into a named not-judged code. Ruling A gives a not-judged code the same route and fallbacks.
   - Route: Definer; the Chief of Staff for the owner's ruling if F7 stays a fail.

3. **Blocking. F7's conditions can fire falsely.**
   - **(a) The 60-second guard is too short** (line 356). A refresh that started more than 60 s before E's `end` and was still running can overwrite the copy after E saved it. EXP-008 itself cites an app refresh of 137.5 s (lines 314-315). The `alive` marks stop at about 30 s (line 251), so they cannot show that a refresh lived past 60 s, contrary to lines 438-439. Fix: the guard should cover every refresh that started before E's `end` and has no `end` before it, with no time window.
   - **(b) F7 does not require that no widget start ever saw a complete copy.** In a run whose widget starts with `cacheComplete: true` were all excluded or cut off (which is N4), one blind start still fires F7 first (fail rules come first, line 334), although that run shows the widget can see the copy. Fix: add the condition "no widget `start` ever logged a complete kept copy".
   - **(c) The order of save and `end` is not stated.** Method 5 says the copy is marked complete "exactly when a refresh ends with no error". It does not say that the save is done before `end` is logged, or that a failed save puts an error in `end`. F7 depends on both.
   - Route: Definer; Builder for (c).

4. **Blocking. The iCloud Backup check stops before the data leaves the phone.**
   - Method 1 (line 96) has the daily check run only "while the test runs". But the snapshots, the kept copy and the log stay in Documents until clean-up, which comes "after the result is filed" (Method 8, line 183). That could be days after the send.
   - Ruling A's switch-off and daily check exist "to keep it out of iCloud for this test". The switch "can turn itself back on", so the draft's own timing leaves a window.
   - Fix: keep the daily check (and the report rule) until "Delete test data (after sending it)" has run, or delete the phone's data once the send is confirmed. Say whether, and when, the owner may turn the switch back on.
   - Route: Definer.

5. **Non-blocking. Exclusions contradict themselves, and the 120-second cut-off can hide a real kill.**
   - Lines 308-311 say an exclusion is decided "from three things only" (the log's fixed words, GitHub's status history, the owner's word). Lines 312-315 then add a fourth, the log's timing.
   - That rule also excludes a counted widget refresh that was really killed (for example at 2 s) if it started within 120 s of the log's last line. That case should be an F2.
   - Fix: allow the timing reason in the "three things" line, and narrow the rule, for example with a provisional `send-start` line and "no later `start` of any context".
   - Route: Definer; Builder.

6. **Non-blocking. The run's facts leave out the plan's own measures.** (Method 9, lines 227-233.)
   - The plan asks the test to write down "how long it took, how much memory it used and how many GitHub requests it made".
   - The list does not ask the Reviewer to state, by kind of refresh, the requests, time, bytes and kept-copy size. Nor does it ask for the sizing figures from reviews/316 finding 6, third bullet (calls, steps, bodies, entries).
   - Method 10 lets the result hold only what the verdict says, so without this the result will lack them again.
   - Route: Definer.

7. **Non-blocking. The upper bound on a widget's lifetime counts the next start "of any context"** (lines 280-282). A widget refresh can run while the app runs; the draft's own F7 guard assumes refreshes can overlap. So the next app start does not bound a widget refresh. Bound by the next widget start only, or say why runs cannot overlap. Route: Definer.

8. **Non-blocking (blocking if finding 1 is fixed by keeping the stretch as a condition). Merges cannot all be counted from the clones.** (Lines 371-375.)
   - "the merge commit GitHub records for a merged pull request" needs GitHub's pull request records, not the clones. Line 371 says "counted from the clones".
   - Rebase merges add several commits and are not covered.
   - Route: Definer.

9. **Non-blocking. F6 and N2 turn on "a first read in the app was made"** (lines 348, 392), which has no definition in log terms. Define it as, for example, "a `start` with `context: app` of kind `first`". Route: Definer.

10. **Non-blocking. Nothing requires a clean start.**
    - "Delete test data" runs only "before any repeat run" (line 146).
    - Nothing requires EXP-007's leftovers to be gone before install: its private snapshots in Caches, and its log in Documents. The EXP-007 result's clean-up may not have been done.
    - Nothing requires EXP-008's files to have names of their own, or the judge to ignore lines from before the install.
    - Route: Definer; Builder.

11. **Non-blocking. Log trimming is checked after the fail rules** (line 334; N9). Dropped lines can hide a counted refresh's fail or create a false one, and the run is then labelled by whichever rule is reached first. Check `log-trimmed` before applying F1 to F7, or say that trimming makes F2 undecidable. Route: Definer.

12. **Non-blocking. Citations and disclosures.**
    - Line 422 quotes "add only failures"; the record says "adds only failures".
    - Lines 60-62 support the "new test" claim with option D, which the owner did not choose. Ruling A's own words, "The second test is written down as a new test", are the right citation.
    - Method 8's "each once" (line 167) drops two looser points EXP-007 disclosed: a failed blob may be sent again, and blobs are not tied to paths. Restate them unless the rebuilt guard fixes them; the Reviewer's widget check confirms either way.
    - Route: Definer.

13. **Non-blocking. Owner reports have no stated route to the Reviewer.**
    - Method 1 sends the iCloud reports to the Chief of Staff.
    - Method 2's "install report" names no recipient.
    - Method 9 needs the Reviewer to state both, so say how they reach the Reviewer's session.
    - Route: Definer.

**Placeholders.** The widget commit, the judge's file and command, and the adapter's file name are expected placeholders. None of the rules depends on anything the widget cannot log: the `kept`, `alive`, `heads` and `context` fields can all be logged by a Scriptable script. The placeholders must be filled before the freeze (lines 470-475).

**Owner readability.** The outcome table (lines 455-465) and the "What follows each outcome" section are clear. Findings 1 and 2 are the two places where the owner would be told something the pass mark does not say.

File checked: /home/user/sd-wt-definer/experiments/EXP-008-widget-refresh-documents.md
