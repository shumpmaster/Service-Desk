Verdict: PASS

# Launch review (S5), M3C, 2026-10-31

**What this means for you.** The handover package meets the spec and the template. Every part listed under its monitoring section has a record dated after R that shows the part working. The weekly file and the weekly check count through the owner's waiver and their tests, as S5 allows. Nothing blocks. Six non-blocking findings follow, for the gate's case as risks.

Reviewed at HEAD c6ddf82, on branch claude/ui-visual-emphasis-vfrpri. R = b7d22fa0e1d02aa890672ba0d346c00443f680f4. `git diff --quiet R HEAD -- src .github/workflows .github/deploy-tools .github/scripts` holds (exit 0). Between R and HEAD, the only test changes are a new tests/desk/ac27-notes.test.mjs (LA1) and one `ac-test` comment line in tests/desk/j7-config.test.mjs:38. None of the test files the monitoring section names changed. The preview's last deploy is still R: desk-deploy has had no run after 41161879935.

**CI after R: I used both sources.**
- **My own full suite at HEAD**, in a clean `git archive` copy in the scratchpad (since deleted), at about 16:17–16:21Z: `npm --prefix src ci` exit 0; `run build` gave "build: PASS (2 connected projects; 39 page modules in step)", exit 0; `npm test` ran 1568 tests, 1568 pass, 0 fail, exit 0. That is Build's 1558 plus LA1's new cases.
- **desk-build's push run 41218828445** on #257's merge: event `push`, head_sha c6ddf827a72d5aa51a706d3168d356f9e7dce66f, completed success at 2026-10-31T16:21:05Z. Every step succeeded, "Build and test" included. I read it with read-only `gh api`.

## The monitoring parts (docs/handover/service-desk.md:103-112)

| Part | Record dated after R that shows it did its job | Grade | Running? |
|---|---|---|---|
| Value targets' sheet (AC97) | ac97-values.test.mjs and ac97-values-page.test.mjs, unchanged since R, pass in my run at HEAD (src = R) and in Build's run at R. W4, corrected to the "measured from launch" words (_owner-walkthrough.md:24, :27). | Tests A; W4 medium-low (N2) | Yes |
| Device's notes (AC25 metrics) | ac25-metrics.test.mjs and ac25-metrics-page.test.mjs pass in both runs. W4 does not observe the notes themselves (N1). | Tests A | Yes, on the tests |
| Weekly file (AC25) | The owner's ruling, P-001-m3c-weekly-trial-waive.md:1-7, stands in for the trial commit. ac25-weekly.test.mjs and ac25-weekly-page.test.mjs pass. weekly.js:62 and :136 confirm no week can be offered before 2 Nov. | Ruling A (verbatim record); tests A | Yes, by the ruling |
| Weekly value check (CS34, J25) | The same ruling stands in for the dry run. j25-value-checks.test.mjs passes. | Ruling A; tests A | Yes, by the ruling |
| Sender (AC73–78) | desk-notify on main: 0 runs with conclusion failure, timed_out, action_required or startup_failure from 2026-10-24T00:00Z to now (16:2xZ). 73 runs since R, 33 of them success. Test run 41203166648: workflow_dispatch on main at 0f7df82, its "Send" step success, completed 2026-10-31T12:54:53Z, after R (02:51:33Z). W3 "as said". | Run history A; `test = true` medium (N5); W3 medium-low | Yes |
| "Stopped" issue (AC76) | notify-ac76.test.mjs (marked `ac-test: S-001/AC76`) passes in both runs. No open issue labelled `desk-notify`; the only one, #121, closed 2026-10-19T13:27:51Z. The issue is assigned to the owner (src/notify/issue.mjs:92). | Tests A | Yes, on the tests |
| Can't-read lines (AC5, AC89) | ac89-after-md3.test.mjs, ac83-page.test.mjs and ac82-home.test.mjs pass. W1 reports no "Can't read", which only shows the line didn't fire. | Tests A | Yes, on the tests |
| CI (AC29) | My run at HEAD, and push run 41218828445 (success, 16:21:05Z). Supporting: PR run 41161002293 on #256, head 8492d4a. Its src and tests trees equal R's, but it is dated before R (N3). | A | Yes |

## The package against the spec and the template
- **First paragraph:** plain, 144 words (inside 15 to 150), no paths, code or ids (service-desk.md:7-15). It opens with what wasn't done the usual way (five items) and says what can't be undone. Pass.
- **Headings:** the template's seven, in order. ac27-notes.test.mjs passes on this.
- **"How to run it":** names the operating team as spec S-001.md:4030-4038 has it (service-desk.md:44-53). It also names the four settings jobs, matching P-001-graduated-changes.md (A) and LEDGER L-0020.
- **Monitoring section:** not empty. For each part it names where it runs and its record, in before-launch form (spec :4026, N6 at :4425). It also says how feedback reaches the team and when the product's own review runs.
- **Value targets:** match docs/PROJECT.md §6 (:180-189).

## Blocking findings
None.

## Non-blocking findings (carried into the gate's case as risks)
- **N1. The device's notes rest on their tests alone.** W4 as corrected (_owner-walkthrough.md:27) saw only the sheet's words, not the notes. "The notes began this week" (service-desk.md:106) is an inference from code that landed on 2026-10-28 (9d01eb4), not something observed on the phone. The notes are first seen working live when a week is offered on Monday 2 November.
- **N2. The owner's ticks are weak evidence (Build's N2 still holds).** All four steps were ticked in one line (_owner-walkthrough.md:19). W4 was ticked "as said" for a trial line that could not have shown. The narrowing to "measured from launch" is the Orchestrator's correction (:27); the owner did not confirm it again. So W4's evidence for the targets sheet is medium-low; the sheet's tests carry it.
- **N3. The package's CI row (service-desk.md:112) needs updating.** Its #256 run is dated 02:39:44Z, before R, so it counts only through tree equality. Spec :4396 (N2) asks for a record dated after R. The row names the push run before that run existed. It now does exist: 41218828445, success. The case should cite that id. reviews/S-001/_launch-evidence.md:8-9 still reads "to be confirmed by the Reviewer"; this review confirms it.
- **N4. The first paragraph leaves out the unanswered notifications experiment.** EXP-006 was not judged against its threshold (EXP-006-result.md:47). Case 4, a tap after the Access session has ended, was never tested (:66-68). Build-4 is taken on regardless (:70-71). The template says to start with anything that failed or was skipped (_TEMPLATE.md:6). I rate it non-blocking because EXP-006 itself records it and it is carried into the case's section 5.
- **N5. Test run 41203166648's `test = true` is unverified.** REST does not show dispatch inputs, and the run's log returned 403 from the results host. What I can confirm: workflow_dispatch, actor shumpmaster, "Send" step success. The input rests on _launch-evidence.md:7 and W3.
- **N6. The operating-model project has no sender.** Its items reach the desk but not the phone (service-desk.md:9-10, :36-37, :109). The package says so plainly. V1 counts what the desk shows, not what notifies, so the monitoring is not hollowed out. It is a risk for the case.

## Open questions
1. Should the case's section 4 cite push run 41218828445 by id in place of the package's forward reference (N3)?
2. The spec's header still reads `status: draft  frozen_at: —`. The case explains this through Build-2's "skipped" line (P-001-launch-standard-lines.md, A).

I changed nothing in the repository. My suite logs are at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/s5-ci.log, /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/s5-build.log and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/s5-test.log.
