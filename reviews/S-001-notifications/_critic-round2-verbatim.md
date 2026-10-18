Verdict: FAIL

**For the owner.** Draft 2 fixes almost everything from round 1. Deploys follow your answer, the security gaps are closed, the failure test can now actually fail, and the limits you should know about are in the opening paragraph. It still isn't ready, for four reasons:
- **The stale link you reported can still happen.** If you answer a question in a session more than 30 minutes after it was filed, the desk shows its answer link again until your Chief of Staff opens the pull request that records your answer. Your 54-minute question is exactly that case.
- **The operating-model project's route doesn't state its full cost.** Its GitHub minutes come out of your whole account's 2,000 free minutes, shared by every private repository you have, not that one repository's. If they run out, every private repository's checks stop until the month ends. Some of its items can also take up to 3 hours to notify, which is not "about as fast".
- **One GitHub behaviour the design depends on is unconfirmed.** It isn't confirmed that runs started by other runs count as running on main. If they don't, many notifications would either fail or arrive twice.
- **Two small inconsistencies.** The experiment can't run in the order the plan builds things. And the remaining question tells you the stale link is "gone either way", which isn't yet true.

I read the worktree at /home/user/sd-def-notify, the round-1 verdicts, the owner's report (/home/user/sd-orch-notify) and the four answer records (in /home/user/sd-q103; the deploys question in /home/user/sd-q102). Line numbers are specs/S-001.md unless named. I have no shell, so I ran no checks and didn't check the commits.

**Round-1 findings, how each was fixed**
- 1 (deploys): put to you and answered A; Service-Desk only, through J7's `deploysNeedOwner` (:1016-1022, :2349-2353, :5442-5445). Fixed; one citation is out of date (note 1).
- 2 (limits): the lead now names "verdicts to write", the held loop's hour, things outside the records, and a sender that can't run (:640-643). Fixed.
- 3 (the stale link): fixed for the time while the answer's pull request is open (J20; AC77 :4595-4602), and the false sentence about GitHub's guard is gone. Not fixed once the 30-minute hold has ended (B1).
- 4 ("2 to 4 minutes"): dropped; the windows are now cited from the recorded report (:689-694). Fixed.
- 5 (question 2's sources): the report is now a record, but it is on a branch (B5).
- 6 (the token): your fast-path answer replaces question 1, and both token routes are given their true power (:714-720). Fixed.
- 7 (`test: fail`): it now signs with a throwaway key; 403 is told apart from 404 and 410, and the keys are checked at the first step (J17 :6259-6261, :6286-6290). Fixed, with one interaction to settle (note 3).
- 8 (the token's hourly refresh): fixed (:6265-6270).
- 9 (secrets on code that reaches main): the risk is stated, CS9 now checks `notify`, CS18 makes the sender's code a security-review path, and a switch turns each sender off. Fixed, but the stated risk is too narrow (note 4).
- 10 (strangers' pull requests): `pull_request_target` is dropped; no `${{ }}` in any `run:` line, with a test; an outside author's title never reaches the lock screen. Fixed.
- 11 (hashed keys): keys are now HMAC-SHA-256 with a secret, issues name counts only, and the operating-model project's items stay in its own repository. Fixed.
- 12 (AC73's fixtures): real records where they exist, made-up ones labelled, and the placeholder form for the private project. Fixed.
- 13 (silent stop): the token across projects is gone; a project unread for 30 minutes opens the issue. Fixed.
- 14 (setup steps): the order is right, the switch prevents early failed runs, and the Access step uses one application per path. Fixed (one stale step number, note 8).
- 15 (your time and the date): a new table (110–122 minutes, :7327-7345), the date named at risk, and a rollback step. Fixed.
- Notes 1–10: fixed, except my round-1 note 2, whose fix doesn't hold (B4).
- Plan review: B1–B8 and N1–N17 are fixed as the list at :783-805 says, as far as I checked. B3's fix depends on the unconfirmed GitHub behaviour in B3 below.

**BLOCKING**

**B1. AC77 still promises more than it delivers** (lead :655-656; AC77 :4584-4587, :4603-4612).
- The hold ends 30 minutes after the question was raised. "Being recorded" starts only once the answer's pull request is open.
- Between those two moments, the question is ordinary again with a live answer link. A re-read on tap finds it "still open" and opens GitHub as today (:4627).
- The report's 54-minute window falls in exactly that gap (owner-report :20, "the answers came after the owner viewed the mockup").
- So the lead's "no longer offers a stale link" and AC77's own When/Then ("answered there with its answer record not yet on the default branch … no answer link") are not met.
- → Definer: close the gap (for example, hold until the session's end line or the answer's pull request, with the 30 minutes only as a fallback), or state the remaining window in the lead and in the question.
- Self-implication flag (D-050): my round-1 finding 3 checked AC77's hold and did not name this window.

**B2. The fast path's cost and risk are not fully stated to the owner** (:702-713, :654-655, :6632-6636, :7565-7567). The fast-path ruling (decisions/questions/P-001-notify-poom-fast-path.md:1, :9) asks for the cost to be stated before anything is built.
- **The minutes belong to the account.** Q-011 T11 (research/Q-011-memo.md:90) says only "Private repos on GitHub Free get 2,000 minutes a month". GitHub's included minutes are shared by every private repository in the account, yet the spec calls them "that repository's". Running out stops Actions in every private repository, not only that project's CI. EXP-006 already reads "the account's Actions usage" (EXP-006:81-82).
- **The lead says only "some" of the minutes** (:654-655), with no figure (300–900 of 2,000) and no word on what happens when they run out.
- **Not "about as fast".** In that project a pull request marked ready, and anything its events miss, waits for the 3-hourly check (:4452-4454). Its `ci` and `pr-body` workflows don't run on `ready_for_review` (Personal-Org-Operating-Model .github/workflows/pr-body.yml:10, ci.yml:5-7). That contradicts the ruling's "about as fast as Service-Desk's" and the lead's "usually within a few minutes … in either project" (:651-653). EXP-006 measures no delay in that project.
- **The launch step is missing.** Workflow 4 runs Service-Desk's code at a pinned commit, so J7's `deskUrl` change at launch (N10, :6901-6905) reaches that project only when its pin moves. N10 doesn't say so; until then its taps would open the preview's address.
- → Definer.

**B3. A load-bearing GitHub behaviour has no source and no fallback** (Workflow 3 :6586-6588, "Every trigger above runs on main, so the rule admits them"; J18 :6304-6308, `runs?branch=main` and the artifact's "head branch `main`"). This is C: I couldn't reach GitHub's docs.
- As far as I know, a run started by `workflow_run` carries the triggering run's `head_branch` (a pull request's or a `build/**` branch; governance.yml:12-14 runs on both). Environment branch rules have been reported to refuse such runs.
- If so, every pull-request-started sender run either fails at the `notify` Environment, with a failure notice each time, or its state is never read, so later runs send the same keys again.
- → Definer: cite a source, or add an EXP-006 case with a fallback (for example, filter by event and `head_repository`, not by branch).

**B4. EXP-006 can't run as registered** (EXP-006:15-16; :7421 against the brief :8000-8003, :8008-8010).
- The registration says it runs "before AC77's session hold is built".
- The brief builds the hold in step 3, which is deployed before N5 and EXP-006.
- So the round-1 note 2 fix claimed at :798 doesn't hold. → Definer, and the EXP-006 author: drop the condition (5b's question carries no `Asked in session:` line), or reorder the brief.

**B5. P-001-answer-pr-on-desk is not ready to file** (:7692-7714). Its form matches questions/_TEMPLATE.md, but:
- **WHY overclaims.** "so the stale link you followed is gone either way" (:7699) is false while B1 stands.
- **Three sources aren't on main.**
  - Bullets 1 and 2 cite docs/design/references/owner-report-2026-10-18-stale-answer-link.md, which exists only on orch/s001-notifications.
  - Bullet 6 cites "specs/S-001.md, AC77", which exists only on this Definer branch.
  - A question filed on main would cite records that don't exist there. Name the branch, or file the question after both have landed.
- **Option B has no cost and an unclear scope.**
  - B speaks of "it", the answer's pull request, but BLAST RADIUS says "the automatic job's open pull requests" (:7702, :7704).
  - The desk would need J16's job-candidate reads (check runs, asks-merge runs and their jobs) on the page. The 17 October option sold "No extra reads by the desk" (:7673). B states none of this.
- → Chief of Staff, to land the report on main; then the Definer.

**NOTE**
1. The deploys answer record now exists (decisions/questions/P-001-notify-deploys.md, landing with #103). :685-686, :1016-1019 and :7094-7095 still say it is "to land". Cite its line 1, and quote your actual pick, "A. Notify and count now (Recommended)" (record :12), not the filed option's text.
2. AC76's opening promises the owner is told "when … the sender itself has" stopped (:4542). Its own bullet (:4565-4568) says that is a known limit. Make the opening match.
3. `test: fail` and the 403 rule. AC76 retries a 403 with a newly minted JWT (:4551-4554). If that retry uses the real key, the test push arrives and EXP-006 case 7 fails. Say the retry stays on the throwaway key. A lasting 403 also mints a new JWT every run, against V8's at-most-hourly refresh.
4. The misuse risk (lead :644-646, Risks :7527-7529) leaves out the worst case. Code on main could copy the VAPID key and subscription out (Service-Desk's logs are public), and anyone could then notify your phone until you make new keys and a new subscription. Rollback (:7554-7558) has no step for that. Both projects hold the same keys and subscription (N9), so a leak in either touches both.
5. In the operating-model project (v2.5), questions have no `Milestone:` line, so the `Asked in session:` line has no place (J2 :5021-5023). A question asked in a session there notifies at once. Limit AC77 to v3 projects, or say so.
6. AC73's test says the sender's set equals the desk's flagged items (:4428-4431). But the sender lists every waiting deploy, and the desk only those on the current head (:4411-4413).
7. AC76's test reads "Workflow 4's file, from the Chief of Staff's hand-over" (:6611-6612). That puts a copy of a private project's file in the public repository (against :4573-4574), and it tests the hand-over, not the file that project merges. CS16 (:6846-6849) should also say that a pin move's review there reads Service-Desk's changes between the two pins.
8. Stale references:
   - J7 :5438 says "Setup N9" for launch; it is now N10.
   - The fix list at :778-779 says "N9's Access step"; it is N10.
   - The lead says "one switch stops the senders" (:657-658), but rollback says to clear the switch "in each project" (:7554-7555). That is two switches.
9. EXP-006's exclusion "A run GitHub delayed by more than 15 minutes is recorded and run again once" (EXP-006:98) throws out the very delay case 5 measures. Count it in the result.
10. AC77's "whoever opened it" (:4597) should say what J20 says (:6362-6366): a pull request from a fork is never read as recording an answer.

**Routing:** B1–B4 and every note go to the Definer, the stage that failed; B4 and note 9 also to the EXP-006 author, since the registration is not frozen yet. B5 goes to the Chief of Staff (land the owner's report on main), then the Definer. B3 may need a sourced research answer from the Chief of Staff. Root cause: the draft-2 fixes were checked against the round-1 findings, not against the new records. The report's 54-minute window, the account-wide minutes and the cross-project pin all arrived with draft 2.
