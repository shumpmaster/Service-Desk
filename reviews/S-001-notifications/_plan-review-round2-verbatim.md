Verdict: FAIL

**What this means for the owner.** Draft 2 fixes all eight problems I found in round 1, and every repository check passes. It still can't go ahead, for four reasons.
- **The operating-model project's own sender may not be possible as planned.** It keeps its secrets in a protected GitHub "Environment". This project's own setup notes say a private repository needs a paid GitHub plan for that, but the spec counts the cost as if you are on the free plan. Either the setup can't be done, or the cost stated to you is wrong.
- **One retry rule goes against Apple's instructions.** Apple asks senders to renew their sign-in token no more than once an hour. When Apple refuses a send, the sender renews it on every run. The same rule would also make the planned "make it fail" test actually reach your phone.
- **One promised safety test can't run where it's placed.** It would read two workflow files: one doesn't exist yet when the test is built, and the other is in your private repository.
- **The experiment's timing contradicts the build order.** The experiment must run before the "question being asked in your session" hold is built, but the build order builds the hold first.

Each fix is small. Below the findings are smaller notes, including that the minutes estimate is labelled an estimate but has no real cap.

**Checks run**
- Base: origin/main is now 0bad60a (#103 merged), not ef8daf4. I used 0bad60a.
- spec_check.py status: OK, rc 0.
- v3_checks.py trace: OK, rc 0. joins: OK, rc 0 ("no joins in 0 frozen spec(s)").
  - Both check only frozen specs, so neither tested S-001's draft.
  - By hand: AC73–AC77 each name an ac-test, and J16–J20 each name a join-test. J20 and AC74–AC77 aren't used elsewhere.
- v3_checks.py scope --base origin/main: OK, rc 0 (3 spec-scoped commits; 5 Definer-lane paths bounded by the surface map).
- surface_guard.py diff --range origin/main..8f8d1ea --branch build/definer/s001-notifications: OK, 3 commits, rc 0.
- check_all.sh: all 25 steps PASS, 0 FAIL, rc 0.
  - Scratch clone: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/nr2
  - Merge commit e4fb304 = `git merge --no-ff` of 8f8d1ea into 0bad60a, committed as shumpmaster <furchken@gmail.com>.
  - Run as `GOV_DEFAULT_BRANCH=main check_all.sh . 0bad60a30d256e2d8c506691005f6bfc3848ccff`.
  - Log: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/nr2-checkall.log
- Extra: the open question, written out in the scratch clone only, passes `governance_checks.py questions`. The quotes of the deploys option match the question filed in #102.

**Round-1 blocking findings: all fixed**
- B1: `test: fail` now signs with a throwaway key; 403 is handled apart from 404 and 410; the first step checks the keys (AC76 :4551-4556, J17 :6259-6261, :6281-6290). The new retry rule brings a new problem (B2 below).
- B2: rule (b) counts only `merge` jobs that ran and succeeded, two runs, with skipped and cancelled cases tested (:6217-6222, :6247-6249).
- B3: state is taken only from desk-notify's own main runs, HMAC-signed, parsed with limits (:6304-6312, test :6331-6332).
- B4: keys are HMAC'd, with a wrong-key test (:6315-6317, :6333-6334).
- B5: the issue gives counts only, and its test checks this (:4545, :4572, :4578-4579).
- B6: fixtures use poom/'s placeholder form (:4417-4426).
- B7: desk-notify's runs are activity in J1, with a test, and exit codes are stated (:4831-4835, :6603-6605).
- B8: the question is answered (B), and the token routes are compared at their true permissions (:714-720).

**What I verified**
- **Rule (b) matches the job's code.**
  - Every asks-merge run judges every open pull request (asks_merge.py:617-623), so "two runs" means two judgements.
  - The job is named `merge`, and its `if:` skips only workflow_run runs not caused by a pull request; cron and manual runs do judge (asks-merge.yml:35-37).
- **The other security rules hold.**
  - No pull_request_target.
  - `${{ }}` is barred from `run:`, with a test.
  - Outside authors (anything but OWNER, MEMBER or COLLABORATOR) get no title; CONTRIBUTOR counts as outside.
  - The switch is a job-level `if:`.
  - CS9 now covers `notify` in both projects.
- **Marked ready is honestly timed.** governance.yml:10-14 and pr-body.yml:8-10 don't run on ready_for_review, so a pull request marked ready waits for the 5-minute check, and AC74 says so.
- **The JWT timing fits Apple's page** (developer.apple.com, "Sending web push notifications in web apps and browsers", fetched 2026-10-18).
  - The page says "Don't refresh your JWT more frequently than once per hour", and that `exp` may be at most one day ahead.
  - A JWT minted at most hourly with a 2-hour `exp` fits both. RFC 8292's 24 hours also holds.
- **Deploys are counted and tested.** Terms, AC52 (:2349-2353, with its test at :2453-2455), J7 (:5442-5447) and AC73's test (:4428-4429) all carry `deploysNeedOwner`, and each test can fail.
- **The owner-time table adds up.** It totals 110–122 minutes. N1 comes before the receiving side, and CS15 can no longer fail before N7.

**Findings**

*BLOCKING*

- **B1. Workflow 4's `notify` Environment needs a paid plan in a private repository, but the spec assumes GitHub Free.**
  - Evidence that it needs a paid plan:
    - Service-Desk docs/SETUP.md:9: "needs GitHub Pro, Team or Enterprise for a private repository".
    - The model's own spec, Personal-Org-Operating-Model specs/S-016-hardening.md:74 and :91: deployment-branch rules "need a paid plan for private repositories".
  - Where the spec relies on it: S-001.md:712, :6620, :6632-6636, CS9 :6716-6718 and N9 :6890-6892, with "2,000 a month on GitHub Free" (Q-011 T11).
  - If the plan is Free:
    - N9 can't be done as written;
    - CS9 has no POOM `notify` to check;
    - the four secrets become repository secrets, which any branch copy of the workflow could read.
  - If the plan is paid, the minutes figure is wrong.
  - Either way, the safety and cost the fast-path ruling asked to be stated are misstated.
  - Fix: record the owner's plan. If it is Free, give Workflow 4's real secret storage and its risk (S-016's "repository mode" accepted risk), and put it to the owner.

- **B2. The 403 rule breaks Apple's once-an-hour rule, and can undo `test: fail`.** AC76 :4551-4554; J17 :6265-6270, :6286-6290; test :6294-6296.
  - The rule is "mints a new JWT once in that run and tries again, and keeps trying each run". So a 403 that lasts means a new JWT every run, about 25 an hour, against Apple's words above.
  - `test: fail`'s refused push falls under the same rule. The retry with J7's key would be accepted, so the test push reaches the phone, EXP-006 case 7's "nothing shows" fails, and the issue closes on that "good push".
  - Q-011 V7 doesn't hold the "403 for a bad or expired JWT" claim cited at :4552 and EXP-006:35. Apple's page says "403 There's an error with your authentication", with reasons such as `BadJwtToken` and `VapidPkHashMismatch`.
  - Fix:
    - re-mint on 403 at most once an hour, and only when the `reason` is `BadJwtToken`;
    - exempt `test: fail` from retries;
    - cite Apple's page;
    - test a 403 lasting several runs, and that `test: fail` makes exactly one request.

- **B3. The workflow-file security test can't run as placed.** :6611-6615 against Areas touched :6687-6689, CS15 :6841-6845, CS16, tests/desk/fixtures/README.md:33-36 and AC76 :4573-4574.
  - The test sits in the Builder's tests, but `.github/workflows/desk-notify.yml` arrives later, in CS15's pull request "once the Builder's sender is on main".
  - So the test would either fail the Builder's pull request, or skip and test nothing.
  - Workflow 4's file is the private project's. Copying it here breaks the fixtures rule and AC76's "no fixture copies a file of the private project".
  - Fix: CS15's pull request carries Workflow 3's check, and Personal-Org-Operating-Model's review or CI carries Workflow 4's.

- **B4. EXP-006's run condition contradicts the brief.**
  - EXP-006:15-16 says it runs "before AC77's session hold is built". The brief builds the hold in step 3 (S-001.md:8000-8003) and runs EXP-006 afterwards (:8009-8011).
  - So the claimed fix for the Critic's N2 (:798) doesn't hold.
  - A case-5b question asked in a session would be held for 30 minutes and fail the 5-minute pass threshold.
  - Fix: case 5b uses a question with no `Asked in session:` line, and the false precondition goes.

*NOTE*

- **N1. Workflow 4's pin has supply-chain gaps.** :6623-6627, CS16 :6846-6849.
  - A sha from a fork of Service-Desk can be fetched through shumpmaster/Service-Desk, so check that the pinned sha is on Service-Desk's main (`merge-base --is-ancestor`).
  - Have the pin-move review read the Service-Desk diff from the old sha to the new one, for src/notify, src/lib and src/config.
  - The runner's Node isn't pinned.
  - Risks :7529 ("could not reach … the other project") ignores a pin move. Pinned code runs there with read access to the private contents.
- **N2. The minutes figure is labelled E (:712-713, :6632-6633) but has no real cap.**
  - The 2,000 minutes are the account's, not "that repository's", and running out stops every private repository on the account.
  - The fallback only lengthens the 3-hourly check, about 240 minutes a month.
  - The events drive the rest: ci runs on main and every `build/**` push, and pr-body on every edit. Filter workflow_run (for example `branches`), and state the account-wide limit.
- **N3. N10 at launch (:6900-6905) doesn't move Workflow 4's pin.** The private project's taps would keep opening the preview's `deskUrl`.
- **N4. The sender's request count has no bound.** :6191-6192.
  - The workflow token's limit, 1,000 an hour per repository, is shared with asks-merge and the Orchestrator.
  - The number of runs isn't bounded: `requested` and `completed` of six workflows, and governance runs on `build/**` pushes.
  - J18's search through runs newest-first is unbounded, for example after the switch was off.
  - Count the worst case and bound both.
- **N5. J20 on the page.**
  - AC14's test doesn't drive head changes of open pull requests, though :7186-7192 claims they're covered.
  - "One request" each (:6367-6368) against "3 pages" (:6363).
  - Its weight in J6's budget of 25 is unstated.
- **N6. AC77's "being recorded" has unstated limits.**
  - It works only in v3, where the answer adds `decisions/questions/<name>.md`. In the v2.5 project the reported window stays open.
  - AC77 says "whoever opened it" (:4597), but J20 ignores pull requests from forks. Say "from the project's own branches".
- **N7. The 30-minute hold (:4608) is shorter than the 54-minute window on record.** At 30 minutes the question would notify mid-session, and could show a stale link again. Make it a known limit, or extend it.
- **N8. Rule (b) has three gaps.**
  - asks-merge's run concludes success even when it read nothing (asks_merge.py:609-620, `return 0`). Two such runs count as "left it".
  - The second run is often the 15-minute cron, so a left pull request's delay isn't stated in AC74.
  - Say every counted check is completed.
- **N9. The tap's origin rule rests on the service worker.** "Only ever opens its own address" (:4471-4472, :7527-7528) relies on the worker refusing other origins. The Declarative path has no service worker, and Q-011 says nothing about `navigate`'s origin. Mark it C, or test it.
- **N10. EXP-006 case 8's fallback, "mints a JWT on every run" (EXP-006:119), goes against Apple's once-an-hour rule.**
- **N11. CS18's change adds no review.** "R2 or higher" (:6855-6859) adds nothing: risk-paths.toml gives R1 and R2 the same review, and `src/**` and `.github/**` are already R1 and R3. So "become Reviewer paths" (:767-768, :7538) is no change. Name a security-domain path table, or drop the claim.
- **N12. The `${{ }}` test (:6615) should cover whole `run: |` blocks.**
- **N13. "Marked ready" in the operating-model project waits up to 3 hours** (POOM ci and pr-body have no ready_for_review trigger). That's against the lead's "usually within a few minutes" in either project (:651-653) and ruling B's "about as fast". A no-secret `pull_request: [ready_for_review]` workflow would let workflow_run catch it.
- **N14. J7's `deploysNeedOwner` has no rule for a value of the wrong kind,** so its test can't fail on one.
- **N15. Two stale or loose lines.**
  - :686 and :7095 still say the deploys record is to land after #102. It landed in #103 (0bad60a); cite its line 1.
  - :704 says "the same notification secrets", while N2 makes a second state key.
- **N16. The time table** leaves out the extra CS9 checks and later pin reviews. "Adds about a week's ceiling" (:7344) is unclear.

**Open questions**
- What GitHub plan is the owner's account on? B1 turns on it.
- I couldn't reach rfc-editor.org or docs.github.com from here, so the RFC 8292 §4.2 status codes and the Environment plan rule are not re-fetched. B1 rests on the project's own SETUP.md and S-016.
