# EXP-008 registration — the Critic's round 2, verbatim

Read: experiments/EXP-008-widget-refresh-documents.md at cd98e5f (build/definer/p004-exp008, Draft 2),
with the test widget at 92caf00 (build/builder/p004-exp008-widget). Recorded by the orchestrator,
session session_01QBwHGJ3CcwMQ1i8bkydhLN, 2026-11-07.

---

Verdict: FAIL

**Critic, round 2 of 3 (D-044).** Two findings are blocking. Both have small fixes, and neither needs an owner's ruling.

I read /home/user/sd-wt-definer/experiments/EXP-008-widget-refresh-documents.md (Draft 2) cold and checked it against:
- PROJECT.md:623;
- ruling A of P-004-widget-next-step, option A in full;
- the other rulings;
- EXP-007 and reviews/EXP-007/;
- the test widget at /home/user/sd-wt-builder/src/widget-test/: entry.js, phone.js, judge.mjs, and send.js in part.

I ran nothing.

**Self-implication flag (D-050).**
- Finding 2 below is in F6, which comes from EXP-007's rule. I passed that rule in reviews/EXP-007/_critic-r3-verbatim.md.
- N10 and the coverage test carry out the fix I proposed in round 1, finding 1. I am now judging how my own suggestion was carried out.

**Round 1 findings: what was answered**
- **1, the busy stretch:** answered. Pass (a) needs a covered stretch, and an uncovered one is N10 (lines 555, 614-615, 654-661). N10 is a not-judged code, not a fail. It only makes the mark stricter, so it needs no ruling.
- **2:** answered. F7 is gone. N4 is not judged, its reasons are on lines 639-645, and no question is left open.
- **3:** answered.
  - (a) There is no time window. N4(b) uses `savedAt` (phone.js:130; entry.js:304).
  - (b) Line 587 adds "No widget start ... ever logged cacheComplete: true".
  - (c) Save before `end`, and a failed save logging "kept copy not saved": both stated (lines 171-181), and they match entry.js:299-340.
- **4:** answered. The daily check runs until the delete, the delete happens once the Reviewer confirms the sent copy, and lines 115-123 and 271-276 say when the switch may go back on.
- **5:** answered for refreshes started before the send. See new finding 1 for refreshes started after it.
- **6, 7, 9, 13:** answered (lines 343-361, 445-449, 194-196, 366-374).
- **8:** answered for rebase merges and for the source of the records. See finding 5 for what is left.
- **10:** answered. The widget has its own folder and keychain names, the handoff confirms EXP-007's clean-up (docs/handoff/2026-11-04-chief-of-staff-widget.md:342-346), and the judge reads only after the last `install`/`reset` (judge.mjs:243-245).
- **11:** answered by checking N0 first. One claim is too broad (finding 4).
- **12:** answered. The quote now matches _critic-r3-verbatim.md:24, ruling A's own words are cited, and the guard points are restated (lines 256-258, consistent with send.js:19-20).

**Findings**

1. **Blocking. A widget refresh that starts after `send-start` can give a false F2, and two claims about the sent log are false.**
   - **What the code does.** In entry.js:408-420, `menuSend` logs `send-start` first. Then, still before the log is built, it may show the send-key prompt (`askKey`, which waits on the owner) and build the test data. Only after that does `allLogText` (phone.js:178-187) read every log file present.
   - **What can happen.** A widget refresh that starts in that gap writes its `start` line at once (phone.js:155-160) and is in the sent log with no `end`.
     - Its kind is `later` (`cacheComplete` true).
     - "Cut off by the send" needs it to have "began before the run's `send-start`" (line 488), so it is not excluded.
     - So it is a counted later refresh that did not finish: F2, a fail.
     - The refresh was cut off by the send, not killed. That fail is one the pass mark's words do not support.
   - **False claims.**
     - Measure, lines 433-434: "The log built for the send stops at its `send-start`". It does not. It holds every line written before `allLogText` runs.
     - Method 8, line 266: "its last action is the `send-start` of this send". This fails whenever such a refresh exists, and the draft does not say what happens then.
   - **Fix.** Either the rules ignore every line after the run's `send-start` (and N0 and the judge's reading say so), or "cut off by the send" also covers any `start` after `send-start`. Then fix lines 266 and 433.
   - **Route:** Definer. Builder only if the fix is made in the widget, for example by building the log before the prompt or cutting it at `send-start`.

2. **Blocking. F6 can call a run a fail after one interrupted first read in the app.**
   - **The rule.** F6 (lines 542-544) fires when no refresh ever ends with `error: null` and "at least one first read in the app ... was made and not excluded". A first read in the app "is a `start` with `context: app` of kind `first`" (line 194).
   - **Why that is too wide.**
     - A first read in the app that the owner interrupts has a `start`, so it counts as "made". The owner might lock the phone or leave Scriptable during a read of about 2 minutes (1,033 requests in EXP-007; line 88).
     - Exclusions cover only offline, a GitHub incident, or the send (lines 479-497), so it is not excluded.
     - Method 6 (lines 198-200) tells the owner to read again in the app only "if the kept copy is lost". It does not say to keep the app open, or to try again if the read did not finish.
   - **Against the words.**
     - The pass mark's allowance is "may still pass if it can be done once inside the Scriptable app and kept". One interrupted attempt does not show that it cannot be done.
     - The draft's own line 516: "A fail is given only where ... the in-app allowance was tried and did not work".
     - Lines 641-643 note that the owner reads "fail" as "the widget route failed".
   - **Fix.**
     - Method 6 tells the owner to keep Scriptable open until the read shows its result, and to try again if it did not finish.
     - F6 needs a first read in the app that reached `end` with an error, or one the owner reports was not interrupted. Any other run goes to N2 or N6.
   - **Route:** Definer.

3. **Non-blocking. N1 and N3 misdescribe the case this test exists to find.**
   - The main point under test is that the widget shares Documents with the app (Hypothesis, line 85; "Strong but indirect", line 76).
   - If it does not, the widget's `start` lines and its own `install` go to a folder the send never reads. The sent log then shows no widget start (N1, explained as "The widget never ran on the home screen", lines 580-581), or none after the kept copy (N3, explained as "the run was too short, or the widget did not refresh", lines 585-586).
   - The draft gives N4 a named code because "the verdict names the code, so the owner sees" what happened (line 643-644). By that same reasoning, these two explanations would mislead the owner.
   - **Fix:** word N1 as "no widget start in the sent log". In both codes, name "the widget may not share the app's Documents" as a possible cause. Have the Reviewer state what the owner saw on the widget, as a fourth kind of owner report (Method 11).
   - **Route:** Definer.

4. **Non-blocking. N0's wording, and its claim that trimming never makes a false fail.**
   - "The run" is defined as the lines *after* the last `install`/`reset` (line 463). Read literally, "The run's log does not begin with an `install` or `reset` line" (line 527) is therefore true of every run. Say "the sent log".
   - Line 523, "trimming ... never makes a false fail", does not hold for F6. Trimming can drop the only `end` with `error: null`, which F6 needs to be absent. Either say that N0 overrides F6, or narrow the claim to F1-F5.
   - **Route:** Definer.

5. **Non-blocking. Counting merges by pull request only can make a pass easier.**
   - The rule: "Commits pushed to a default branch without a pull request are not merges" (lines 568-569). This desk's own mechanics allow merges done locally with `git merge --no-ff` and pushed (CLAUDE.md).
   - Leaving those out can make an hour with a busy stretch count as "no stretch", which sends the run to (b). That contradicts line 664-665: "None makes a pass easier than the words do".
   - Count merge commits on the default branch, from the clones, that belong to no pull request. Or disclose this as a choice that can loosen the mark.
   - The example `gh pr list ... --limit 200` (line 563-564) may miss a pull request opened long ago and merged during the run. Require the list to cover every pull request merged within the run's span.
   - **Route:** Definer.

6. **Non-blocking. Neither a second send nor a failed confirmation is covered.**
   - A first send that fails leaves a `send-start` and a `send-failed` in the log. "The run's `send-start`" (lines 488-490 and 528) then has two possible meanings. Say it is the last one.
   - Nothing says what happens if the Reviewer cannot confirm the sent copy (lines 263-268). The answer should be: the owner sends again, the data stays on the phone, and the daily iCloud check goes on.
   - **Route:** Definer.

7. **Non-blocking. Pass (b) has a condition with no test in log terms.** Lines 556-558: "with the kept copy carried through every change between". Define it, for example by each counted start's `kept.savedId` and where its copy came from. Or drop it, since the 24-hour span is the stated reading.
   - **Route:** Definer.

8. **Non-blocking. Two edges at the ends of the run.**
   - **(a)** A refresh that started more than 120 s before `send-start`, logged all six marks and has no `end` is F2 (lines 496-497). It may still have been running. Disclose this as a choice.
   - **(b)** A stretch whose merges begin before the first counted start, or end after the last, has not "happened in the run" (lines 571-572), so (b) applies. Count a stretch as having happened if any of its merges fall in the span, or disclose this as a choice.
   - **Route:** Definer.

**Is any reading a new rule needing the owner's ruling?**
- These are disclosed readings that only make the mark stricter or send the run to not judged, which ruling A routes to the owner with the two fallbacks:
  - N4 and N10 as not judged;
  - "a day" as 24 hours of counted later refreshes (Sample, lines 464-472; N9 is not judged);
  - "several" as three or more, across the three projects;
  - covered as a counted start within 60 minutes after the last merge;
  - the iCloud check lasting until the delete;
  - the earlier delete after the Reviewer confirms the sent copy (a reading of "you check it daily").
- None of these needs a ruling.
- The only real limits on that are findings 2 (a fail the words don't support) and 5 (a possible loosening). Both can be fixed by the Definer without the owner.

**Placeholders:** none are left. The commit, file size and SHA-256 must be confirmed before the freeze (lines 684-687).

File checked: /home/user/sd-wt-definer/experiments/EXP-008-widget-refresh-documents.md
