Verdict: FAIL

The change is 047f9ab..build/builder/la1 (03b4874 and 0f65ef1). I reviewed it read-only in /home/user/sd-la1, and nothing in the work was changed. For the simulated owner merge I used a scratch worktree at origin/main (0f7df82) and ran `git merge --no-ff build/builder/la1`. That worktree has been removed.

**What passed (grade A, my own runs and reads):**
- **Full suite on the simulated merge:** `npm --prefix src ci` exited 0, the build printed "build: PASS (2 connected projects; 39 page modules in step)", and the tests ran 1566 of 1566 passing. That is R's 1558 plus the 8 new ones.
- **Governance checks:** `bash governance/checks/check_all.sh . origin/main` exited 0, with all 25 checks PASS.
- **Surface guard:** `surface_guard.py diff --range 047f9ab..build/builder/la1 --branch build/builder/la1` printed OK for 2 commits. Both commits carry `Agent-Session:` and `Spec: S-001` trailers.
- **The tests bite.** I ran 14 mutations against tests/desk/ac27-notes.test.mjs, and 13 were caught:
  - L5 and L6 swapped;
  - L7 and L8 swapped;
  - a heading set to 11 minutes;
  - L6 set to 12 minutes;
  - "Rollback to this deployment" removed;
  - a job heading renamed;
  - the launch heading renamed;
  - "are written with M3's launch work" put back;
  - a package heading renamed;
  - a monitoring cell emptied;
  - L9b deleted;
  - a file path put in the plain paragraph;
  - a rollback part's minutes removed.
  
  The one that survived is in N6.
- **AC26 mark:** tests/desk/j7-config.test.mjs:38 gains only `// ac-test: S-001/AC26` inside the :37 case. Its assertions are unchanged.
- **AC28's order holds.** L5 disables `needs-you-page` (desk-operations.md:313) before L6 approves `production` (:316). L7 checks that needs-you serves the desk (:318-320) before L8 archives (:321).
- **The rollback has all three parts** (:152, :166, :176). The old page's part un-archives before it re-enables the workflow, as AC28 has it. The stopped sitting covers the carried N5 and N7 (:276-277, :341-360). L3's re-check against `^1` covers round 4's N4 (:303-310). The kill path covers round 4's N6 (:285-287).
- **The package meets the template.** It has the seven headings in order and opens with a plain paragraph of 131 words, with no paths or ids, starting with what was skipped. It names the operating team (service-desk.md:43-52) and gives every S5 part a row with a record (:101-110).
  - Records I checked with gh: run 41203166648 (desk-notify, success, 12:54:53Z); run 41161002293 (desk-build on 8492d4a, success); run 41161879935 (preview of b7d22fa); issue #121, the only `desk-notify` issue, closed 2026-10-19.
  - The review files say what the package quotes: 1558 of 1558, and 2413 runs with none failed (reviews/S-001/_reviewer-build.md:9, :29).
- **The unset usage token matches the code.** With no token the desk is in the `not-configured` state (src/lib/usage.js:100-102; src/lib/github.js:951), whose words are "GitHub Actions use: not set up yet (Setup N12)" (src/lib/notifyview.js:253). With no token the sender reads nothing and sends no $50 notification (src/notify/costs.mjs:53). That matches desk-operations.md:467-471 and service-desk.md:85.
- **The four owner rulings are stated faithfully:**
  - graduated-changes A: desk-operations.md:38-52 and service-desk.md:62-71;
  - tokens A: L2a at :292-295, one read token in both projects;
  - weekly trial waiver: service-desk.md:94-97, :105-106;
  - screen names deferred: desk-operations.md:20-26.

**Facts from the Chief of Staff, checked:**
- **Personal-Org-Operating-Model has no desk-notify workflow:** A. Its origin/main holds only ci, launch-trial, pr-body and scrub-proof, and the Actions workflows API lists the same four. I could not read its environments (the proxy refused with 403).
- **CS37's run 41151614374 read "main":** B. The run is real and succeeded, with both read steps successful (A). I could not open its log (403), so "main" rests on the hand-over and on reviews/256/reviewer.md:10. It agrees with desk-deploy.yml:111.
- **The usage token was never made:** B, the owner's words. What the desk then shows is A, from the code above.
- **Whether an Access bypass application exists:** unknown (B, as handed over). O8 (d) handles it (desk-operations.md:268-272).

## Blocking

**B1. Some job headings understate their minutes, and "Adding a project" is over 10 minutes by its own steps.** AC27 and LA1's row need each job headed with its minutes, under 10 (specs/S-001.md:4026, :14117).
- **Adding a project:** headed "(about 5 minutes)" at desk-operations.md:111. Its steps add to 1 + 2 + 2 + (3 + 3) = 11: :117, :119, :124, and :126-127 ("about 3 minutes each" for the preview and production deploys).
- **Switching a project from v2.5 to v3:** headed "(about 4 minutes)" at :132. Its steps add to 2 + 3 + 3 = 8, or 10 with the pin step (:139-144).
- **The tap's address back:** headed "(about 9 minutes)" at :176. Step 1 also says "approve its preview deploy when it is offered" (:184), which is not counted, so the part is about 12.
- **The notes count deploys elsewhere,** so the gap is not a matter of reading: the read-token renewal counts "Both deploys (4 minutes)" (:79), and the key-leak job counts 2 + 3 + 3 = 8 (:451-453).
- **The documents then claim every job is under 10:** desk-operations.md:8-9, service-desk.md:57, and the V3 line at service-desk.md:150. For adding a project that claim is false.
- **The tests don't catch it:** they read headings, as the plan says (spec :4341).
- **Reproduce:** add the step minutes under ## Adding a project and compare them with its heading.
- **Fix needed:** either the steps' minutes are honest and each job's total stays under 10 (for example, by counting a deploy approval as the 1 to 2 minutes it takes), or the job is split.

## Non-blocking

- **N1. The notes knowingly depart from the plan; the spec needs an amendment.** The plan has L9b update the subscription "in both projects" and test in each (spec :4268). N10 at launch says the same (:18532-18538). The after-step merges the operating-model project's pin (:4287), and CS9 checks `notify` in both projects (:18243). The notes do Service-Desk only (desk-operations.md:325-328, :338-339, :212-214, :364-368). That matches the verified fact, but the notes' own rule says the plan is the source (:16-18; spec :4336). The Definer should amend L9b, N10, the after-step, CS9 and the operating team's CS16 line, or the difference is a standing contradiction.
- **N2. The package's plain paragraph leaves out a gap.** The operating-model project never got a sender (Setup N9 and CS16 were never done), so its items don't notify the phone. service-desk.md:7-14 lists "four things" that weren't done and omits this one. It is stated only in "What it does" (:34-36). The template asks for the paragraph to start with what failed or was skipped.
- **N3. Small misstatements in the package:**
  - service-desk.md:13-14 says "Regenerating the tokens at launch can't be undone", but only the read token is regenerated now.
  - :10 says Build checks "are recorded as skipped", but CS40 has not written those lines yet; "will be recorded" would be accurate.
- **N4. Figures the token news made stale:**
  - The sitting is still headed "about 37 minutes" (desk-operations.md:243, :279). With L2b at 0 (:296), L0 to L11 add to 32.
  - The whole rollback is headed "(about 4 minutes…)" (:147), although its parts take 4, 7 and 9.
- **N5. A step that can't be followed as written.** Renewing the read token says "Approve its `preview` job, then its `production` job" in one run (desk-operations.md:79-81; the same at :498-500). A desk-deploy dispatch runs only the one job its `job` input names (desk-deploy.yml:24-28, :42, :96), so the Chief of Staff must start a second run after the preview's. The step should say so.
- **N6. One test assertion is weak.** In tests/desk/ac27-notes.test.mjs:177-178, removing the Builder's line from the operating team still passes, because "the Builder" also appears at service-desk.md:65.
- **N7. The device's notes row cites the wrong test.** service-desk.md:104 cites tests/desk/ac25-weekly.test.mjs, which tests the weekly file. The notes' own recording is tested in tests/desk/ac25-metrics.test.mjs:1 (and ac25-metrics-page). It passes in the suite either way.
- **N8. Two points in EXP-006's result:**
  - EXP-006-result.md:33 grades `DESK_BILLING_TOKEN:` "empty" as "A, as handed over". A hand-over is B, not A.
  - The threshold is correctly "not judged" (:43-45): cases 1 to 4 and case 5's delays have no record, so by the registration (experiments/EXP-006-access-push.md:204-206) it has not passed. That bears on Build-4 ("The experiments are answered"), which question 1's answer has taken on. CS40 and CS41 should say so, and the case's section 5 should carry case 4 (a tap after the Access session ends, on needs-you) as a risk.

## Open questions

1. **The ledger entry from graduated-changes A is not in docs/LEDGER.md yet** (the last entry is L-0019). Its timing is the Orchestrator's.
2. **The `Milestone: M3C` line belongs in the PR body** (spec :4012). That is the Orchestrator's to check when the PR is opened.
3. **Can anyone with log access confirm run 41151614374's printed `production_branch`?** I couldn't open the log (403).
4. **No join-up section is added here.** This is a sprint review of LA1, not the stage 5 join-up (S3, already recorded), and nothing on a screen changes.

Files:
- /home/user/sd-la1/docs/handover/desk-operations.md
- /home/user/sd-la1/docs/handover/service-desk.md
- /home/user/sd-la1/docs/handover/experiments/EXP-006-result.md
- /home/user/sd-la1/docs/handover/experiments/EXP-002-result.md
- /home/user/sd-la1/tests/desk/ac27-notes.test.mjs
- /home/user/sd-la1/tests/desk/j7-config.test.mjs
- /home/user/sd-la1/specs/S-001.md
