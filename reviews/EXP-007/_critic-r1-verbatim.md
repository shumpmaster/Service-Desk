# EXP-007 registration — the Critic's round 1, verbatim

Read: experiments/EXP-007-widget-refresh.md at ddc67fb (build/definer/p004-widget-exp), with the
test widget at 29941bf (build/builder/p004-test-widget). Recorded by the orchestrator, session
session_01QBwHGNFKViyibzxHx5qTtm, 2026-11-04.

---

Verdict: FAIL

The form is followed and this is not a re-run. Three pass-mark gaps block the freeze. All of them go back to the Definer's pre-registration (D-047): the registration must set the rule before any run.

1. **Blocking: the reading of "every time" loosens the plan's pass mark.** Lines 154–155: "An inconclusive refresh is neither shown correct nor shown incorrect… and lists any it cannot confirm". Line 158: "So the pass needs zero incorrect summaries and zero unfinished later refreshes". Line 159: "not judged" only "If every later refresh in the busy stretch… is unconfirmable".
   - **Against the plan:** PROJECT.md's pass mark is "shows a correct summary every time". The registration's own Measure, line 123, defines "Correct" as a match or a hand check that confirms it. Under this reading, a day where only some refreshes are confirmed and the rest are unconfirmed can still pass. That is a looser mark, not a fair reading.
   - **Why it bites:** judge.mjs:119 rates any project that does not match and has open pull requests as "inconclusive", because the reference reads no pull requests (judge.mjs:44, `pullPages: ['[]']`). Service-Desk nearly always has open pull requests, so most of its results may land in this bucket.
   - **What the plan's mark needs:** each later widget refresh that is counted must be shown correct. Anything unconfirmed makes the result "not judged", not a pass.
   - Route: Definer.

2. **Blocking: the hand check has no rule set before the run.** Method 7: "checks each inconclusive one by hand against GitHub's records of those pull requests and deploys… where possible". Nothing says what evidence confirms or refutes a project's summary, or what happens when a check is not "possible". So whether those projects count as correct is decided after the data are seen, which D-047 does not allow. Route: Definer.

3. **Blocking: "later refresh" is undefined once partial saves exist.** Method 3 says "later ones with what the first kept". But entry.js:211–216 saves the kept data every 5 seconds during a refresh. So a first refresh killed in the widget leaves a partial cache, and the next refresh logs `cache: true`.
   - Under the registration as written, that next refresh counts as a later refresh. If it is killed too, line 153 makes it an unfinished later refresh, which fails the test. Yet the plan allows "A first refresh that cannot finish inside the widget… done once inside the Scriptable app".
   - It can also go the other way: a chain of killed refreshes could build up a full cache and reach a pass by a route the plan never named.
   - The registration must define a later refresh, for example as one that follows a refresh that finished without an error.
   - Route: Definer (and the Builder, if the log needs a marker for it).

4. **Non-blocking: judgment 5 (the Chief of Staff's reading).** The reading fits the plan. The plan's trigger is "if it cannot without changing the desk's code". src/lib ran packed with no change to the desk, and the plan's comparison is "the desk's own code run on the records as they stood then". So no owner ruling is needed before this test.
   - **But one line is partly inaccurate.** Lines 48–50: "The Home tile's own count and its 'Now:' line are page code (src/public/sandbox.js), not in the copy". The tile's count is bd.counts (sandbox.js:939–940). That is built in src/lib/board.js:1209 and sandbox.js adds its waiting and kicked numbers. The test widget logs box.flaggedCount instead (glue.js:175).
   - **The owner should be told plainly** that the widget's "waiting" number may differ from the Home tile's, and that the test checks the src/lib summary against src/lib, not against the tile they chose ("Option 2"; M5 says "as the desk shows them").
   - Whether matching the tile needs a change to the desk's code is for P-004's Design gate. If it does, "What it does not cover" sends it to the owner there.
   - Route: Definer (wording); Chief of Staff (the gate case).

5. **Non-blocking: memory.** The plan says the widget "writes down… how much memory it used". The registration says "Memory, measured only indirectly". That is fair, given Scriptable's limits, it is disclosed, and memory is not in the pass mark. The Design-gate case must still say that the plan's memory measure could not be taken. Route: Chief of Staff.

6. **Non-blocking: exclusions.** Line 135: "recorded and not counted". The precedent, EXP-006, runs an excluded case again once. Two gaps here:
   - It does not say what happens if every refresh in the busy stretch is excluded, which would leave the plan's "includes at least one busy stretch" unmet.
   - It does not say who decides "the phone offline" from the log, or how.
   - Route: Definer.

7. **Non-blocking: owner's time.** The "not judged" repeat run (line 160) and the steps for returning the log through GitHub add owner time beyond the plan's line ("about 15 minutes to install the test widget and, a day later, share its log"). The runner line should say this. Route: Definer.

8. **Non-blocking: plain English in the runner's steps.**
   - **Method 6:** GitHub's upload flow ends on an "Open a pull request" page. If the owner opens one, the pr-body and desk-notify-ready workflows run and it appears on the desk. Say to commit to the new branch and open no pull request.
   - **"the log is not kept in the repository beyond it"** overstates: a deleted branch's commit can still be fetched by its sha for a while. This is harmless only because the log holds no project content.
   - **Method 2:** turning off Scriptable's iCloud Drive may hide the owner's existing iCloud scripts. The ruling does not require it, since FileManager.local() never uses iCloud. Tell the owner what it does, or drop the step.
   - Route: Definer.

9. **Non-blocking: rulings and data.** No new owner ruling is needed:
   - The kept data sit in the Caches folder, which the backup leaves out (entry.js:35–38).
   - The log holds no project content, so the "Not ruled" backup point is not reached.
   - The log goes only to GitHub, within Part 1 section 5's rule. The widget calls only api.github.com (entry.js:110).
   - **Condition:** "holds no project content" depends on the Builder's in-progress change. Today entry.js:220 still produces a raw error message on the error path. Freeze only after that change lands and the Reviewer confirms that no raw state or error text reaches the Documents folder, which the backup copies.
   - **Also say plainly:** the hashes of short titles and headlines can be guessed by anyone who can read the repositories.
   - Route: Builder, then the Reviewer.

10. **Pass on form and re-run.**
    - Every section of experiments/_REGISTRATION.md is present. The header (spec, runner, result, rulings, basis) and the frozen line follow EXP-006's form.
    - It is not a re-run: EXP-001 measured Cloudflare Workers, and none of EXP-001 to EXP-006 tests a Scriptable widget.
    - The rulings are quoted accurately.
    - Keeping the 866/708 request counts outside the pass mark is right. The gate case should say that 708 is above the plan's "up to about 400" for one project.

No finding implicates an earlier check of mine (D-050).

Files read:
- /home/user/sd-wt-definer/experiments/EXP-007-widget-refresh.md
- /home/user/Service-Desk/docs/PROJECT.md (lines 615–664)
- /home/user/sd-wt-builder/src/widget-test/entry.js
- /home/user/sd-wt-builder/src/widget-test/glue.js
- /home/user/sd-wt-builder/src/widget-test/judge.mjs
- /home/user/sd-wt-builder/src/public/sandbox.js (lines 935–964)
