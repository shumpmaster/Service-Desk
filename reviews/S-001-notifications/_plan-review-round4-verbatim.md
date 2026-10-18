Verdict: FAIL

**What this means for the owner.** Draft 4 fixes the stale-link problem you reported. The question stays hidden until an end line written after it was asked, so the 03:08 end line from that morning no longer counts. Every round-3 note from both checks is handled, the new Actions cost bar is sound, and every repository check passes. One thing still has to change before building starts. The test meant to prove the fix on your real session doesn't work as written: it expects your real question to show as "being asked", but that question was filed before the "Asked in session" mark existed, so under the spec's own rule it shows as an ordinary question. Fixing it takes one sentence. A few smaller points are in the notes. One is worth knowing now. At $0.006 a minute, a $50 step needs about 8,300 charged minutes in one month. The minutes counted from run times in round 3 (about 7,500 a month) come to roughly $27 a month in charges, so at that rate you might never get a $50 notification. The bar will still show the estimate.

**Checks run** (origin/main = f063acd; it moved on from round 3's 0bad60a)
- spec_check.py status: OK, rc 0.
- v3_checks.py trace: OK, rc 0, and joins: OK, rc 0. Both check only frozen specs, so neither tests this draft.
- v3_checks.py scope --base origin/main: OK, rc 0. 5 spec-scoped commits; 9 Definer-lane paths, bounded by the surface map.
- surface_guard.py diff --range origin/main..ef9710a --branch build/definer/s001-notifications: OK, 5 commits, rc 0.
  - All five are by definer <definer@agents.invalid>.
  - Each carries `Agent-Session: session_012RJPVKAoLga2RkqLYRDcBY` and `Spec: S-001`.
- check_all.sh: 25 of 25 PASS, rc 0, "OK: all governance checks passed."
  - Clone: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/nr4
  - Merge commit 25f5a6c: `git merge --no-ff` of ef9710a into f063acd, as shumpmaster <furchken@gmail.com>.
  - Run as `GOV_DEFAULT_BRANCH=main check_all.sh . f063acd358baeea00aaa54e4495c396c42e2b332`.
  - Log: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/nr4-checkall.log

**What I verified**
- **(1) Round 3 is handled.**
  - My N1–N10, each in place:
    - N1: the owner's billing answer, 338496b, quoted correctly;
    - N2: the asks-merge admission;
    - N3: the timestamp strip, plus a real-log fixture through CS18;
    - N4: the lasting-refusal rule;
    - N5: job-level concurrency and `status=success`;
    - N6: test_desk_notify_check.py with 16 bad-file fixtures;
    - N7: "two and a half hours", N1–N12, and the budget-stop delay in AC74;
    - N8: A3's 288, and AC14 asserts one J20 read per head change;
    - N9: in v3, a deletion alone is not "being recorded" (AC77, J20, and both tests);
    - N10: CS18 lands before the sender's pull request.
  - The Critic's B1 rule is right:
    - only an end line whose `time` is after the raised time ends the hold;
    - the raised time is committer date on both page and sender: J1 uses `commit.committer.date`, J16 uses `%cI`;
    - CS17 sets the order of the answer's pull request and the end line;
    - the stated gap is added.
  - The Critic's notes 1–8 are all in place:
    - the v2.5 placement is in J2, CS17 and AC77;
    - `src/config/projects.json` is proposed as R3, and the `src/lib/` limit is stated;
    - CS19 puts Q-014's source check before merge;
    - the REST read is the second signal;
    - the open question's touch-ups are made, and its Context order of 4, 54, 6 and 3 minutes matches the owner's report;
    - N10's reference now points to M3's launch pull request.
- **The real records match the spec's account.**
  - Session file on main: line 17 is the end at 03:08:21Z, line 18 a start at 11:26:22Z, line 19 a start at 12:48:51Z.
  - ccf320f (11:26:23Z) added line 18 and questions/P-001-next-work.md together.
  - The cost instruction is quoted verbatim from the record.
- **(2) The new parts mostly hold.**
  - The gate admits a run only with `event == 'workflow_run' && path == '.github/workflows/asks-merge.yml'`. That is safe:
    - asks-merge is the only listened-to workflow that `workflow_run` starts (I read every trigger block on main);
    - a `workflow_run` run always runs the default branch's file (Q-014 F1.3, A);
    - the `head_repository` test still applies.
  - asks_merge.py :632, :636–641 and :149 give the reasons the spec cites.
  - The timestamp regex matches GitHub's log format.
  - `status=success` is a real REST filter. As I remember the REST reference, its `status` parameter also takes a conclusion; I did not re-read it.
  - A job skipped by `if:` not entering a job-level concurrency group is untested (C); see N4.
  - A run whose only job was skipped firing `workflow_run`: I believe it does, though that is not documented (C). Case 9 checks it, and the job never reads the triggering run's conclusion.
- **(3) AC78 and J21 hold up against Q-015.**
  - The endpoints, `year` and `month` always passed, and never `/settings/billing/actions` (F1.1, F1.2, F1.7, F1.8, U-9).
  - The summary falls back to `/usage`.
  - The estimate is the sum of `netAmount`, with the included minutes never subtracted again (F5.1). It covers storage, as the bill does.
  - The minutes are the account's private-repository minutes ÷ 3,000. Public repositories are left out by `repositoryName`; an item with none is counted (F3.5, F5.2).
  - The billing period is the UTC month (F3.1, F3.2).
  - `floor(x/50)` is kept per UTC year-month in J18's encrypted part. The bootstrap gives no burst, and a new month starts at step 0.
  - The token lives only in `DESK_BILLING_TOKEN` (the `notify` Environment) and the `GITHUB_BILLING_TOKEN` Pages secret. It is read server side and never reaches the browser.
  - The function's read rides J6's blob call (3 to 5 of its 25).
  - Workflow 4 never reads it.
  - N12's fallback order is fine-grained, then classic with no scope, then `read:user`, then `user`.
  - Case 11 records no figure in the public result.
  - The AC78 and J21 tests can fail on each rule.
- **(4) Nothing from round 3 is broken,** apart from N1's delay in the operating-model project.

**Findings**

*BLOCKING*
- **B1. AC77's real-record test contradicts AC77** (specs/S-001.md:4798-4801).
  - The test reads "the real session file … and questions/P-001-next-work.md as they stand at ccf320f … giving 'Being asked in your session' and no push".
  - `git show ccf320f:questions/P-001-next-work.md` has no `Asked in session:` line; grep finds none.
  - Under AC77 (:4719-4723, and the stated gap at :4766-4767), a question without the line is ordinary: it shows its link and notifies.
  - So the test as written cannot pass. A Builder must either alter a "real" fixture or assert the opposite of the rule, which would trigger the stop rule during Build.
  - This is the test added to prove the round-3 B1 fix.
  - → Definer: use the real session file with a copy of the question that has the one `Asked in session: session_012RJPVKAoLga2RkqLYRDcBY` line added after `Milestone: M3A`. Label it in tests/desk/fixtures/README.md as real except that line. Keep the unmodified real question as a second case: ordinary, one push.

*NOTE*
- **N1. Workflow 4's cut drops events that do make something wait again** (:7148-7153, :7167-7170).
  - The spec claims "a new head, a merge, a close or a turn to draft changes nothing that notifies". That is false for AC77's answer pull request.
  - Closed unmerged, turned to draft, or given a new head without the deletion, it puts the question back to waiting with one notification (:4762-4763).
  - In the operating-model project that now waits up to about 3 hours for the 3-hourly check.
  - Either name this in AC74's "How soon" for that project, or keep `closed` and `converted_to_draft` (still skipped jobs).
- **N2. The ready workflow's skipped job must still be a valid job** (:7169-7172). Say that it keeps `runs-on` and its `true` step under `if: false`. A job with no steps makes the file invalid, and the run fails at start-up.
- **N3. The lasting-refusal clock has two anchors** (:6551-6557).
  - The rule counts from "the first run that gave" the reason (asks-merge's start), but J18 keeps "when a run of this sender first read" it.
  - Those can be minutes apart, so the test's 14- and 15-minute cases are ambiguous. Store the asks-merge run's `run_started_at`.
  - Also state as a known limit: an API outage longer than 15 minutes ("it could not be judged") notifies for a pull request the job will merge later, against ruling A.
- **N4. EXP-006 case 5 does not check the job-level concurrency claim** (:7081-7083). Case 5 measures delays only.
  - If a skipped job does take a pending real job's place, the cost is a delay of up to the next 5-minute check.
  - Either name that delay, or add the check to case 10.
  - J18's fallback (`status=completed`) also doesn't help if skipped runs turn out to conclude `success`.
- **N5. The page's hourly limit clashes with "nothing kept across openings"** (:4866-4867, :4879). A second opening within the hour has no figures and may not read. Say whether the limit is per opening or per device, and what the line shows.
- **N6. N12's place in the order** (:8773-8774, :8783-8784). The brief puts N12 straight after N7 and N8. But `test: usage` and the line exist only once step 3b is merged and deployed, and 3b may follow later, after Q-015's check. Put N12 after 3b's deploy.
- **N7. A 404 for a fine-grained token isn't covered** (:7539). GitHub may answer 404 rather than 403 for a token kind it doesn't take. Step 4 and case 11's fallback trigger only on 401 or 403, and a 404 reads "not available for this account". Try the classic token on 404 too.
- **N8. Case 11 checks minutes but not dollars** (EXP-006:94-97). The $50 steps rest on `netAmount`, so also compare the desk's estimate with the billing page's metered amount, by percent only.
- **N9. Public logs can show the $50 crossings** (:4904-4905). Service-Desk's records are public, so an observer can predict its ordinary sends from them. A stand-alone extra send in a public run log reveals each $50 crossing, and so the month's spend in $50 bands. Keep the cost push out of the logged send counts, or say so.
- **N10. Small points.**
  - The lead says the usage token shows "nothing more" (:647). That is true only for the fine-grained token; a classic `user` token reaches more (Risks).
  - "Resets … the 1st's 00:00 UTC" (:4829) should say next month's 1st.
  - Renewing the token at expiry (two secrets) is V3 upkeep, and the time table leaves it out.
  - Case 9's second part (EXP-006:126-127) should match the Workflow 4 run by `event == workflow_run` and the ready run's id, not by "followed by".

**Open questions**
- None for the owner. B1 and N1–N10 go to the Definer, and N4, N7 and N8 also to EXP-006's author before it is frozen.
