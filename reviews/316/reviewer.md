Verdict: PASS

The Reviewer's verdict on PR #316 (R3: governance/SURFACES.md's exempt block gains the Builder's EXP-007 result commit c7086cd, L-0033, by the owner's ruling "Exempt each such commit (Recommended)"; the result file docs/handover/experiments/EXP-007-result.md), read at 46b25f6, verbatim below. Its findings are non-blocking and none was applied: changing the result file would need another exempted Builder commit. Findings 6 to 8 are carried to the second test's registration. Recorded by the orchestrator, session session_01QBwHGJ3UVJ6HY4SS92w7UW, 2026-11-07.

---

Verdict: PASS

I could not refute the PR. Every figure in the result file matches my earlier verdict, the exemption covers exactly one commit, and every check passes except the two verdicts the suite still needs for #316 (mine and the owner's). The findings below are all non-blocking. They go to the gate as risks or notes.

**Basic facts, confirmed**
- `git diff --stat origin/main..HEAD` shows 6 files: `digest/p-004.md`, `docs/DIGEST.md`, `docs/IMPROVEMENT_REGISTER.md`, `docs/LEDGER.md`, `docs/handover/experiments/EXP-007-result.md` and `governance/SURFACES.md`. Nothing under `src/` changes (`git diff --stat origin/main..HEAD -- src` is empty).
- `git show --name-status c7086cd` shows only `A docs/handover/experiments/EXP-007-result.md`. It is authored by `builder <builder@agents.invalid>`, carries no `Spec:` trailer, and its parent is `b6528cb` (origin/main).
- The `SURFACES.md` diff adds exactly one exempt line, `c7086cde9e20d626e204ab7ca89c24b6897f02b5 L-0033`, after the L-0032 line. Nothing else is exempted.
- `surface_guard.py diff --range origin/main..HEAD --branch claude/new-session-afl9uw` exits 0: "OK: 5 commit(s) in origin/main..HEAD checked (2 merge(s) skipped, 1 exempt, 0 human)".
- `digest.py check` exits 0: "OK: docs/DIGEST.md and 3 scope pack(s) match docs/LEDGER.md".
- The ledger check in `check_all` passes: "docs/LEDGER.md has 33 well-formed entries; append-only since the base ref". L-0033 comes right after L-0032. It names the right sha and file, cites the Critic's PASS at round 3 (`reviews/P-004-result-spec/critic.md`, first line "Verdict: PASS"), and quotes the owner's words as they appear in `decisions/questions/P-004-result-spec.md`. That file was committed by shumpmaster in 94b1102, which is on origin/main.
- `experiments/EXP-007-widget-refresh.md` is byte-identical to the frozen copy at ad2709e.

**Findings**

1. **non-blocking: the brief's reason for R3 is wrong.** `check_all` prints "Risk class: R3 / governance/SURFACES.md: R3". The R3 comes from `SURFACES.md`; the PR does not touch `governance/risk-paths.toml`. R3 and the two required verdicts stand.

2. **non-blocking: `check_all.sh . origin/main 316` exits 1, but only on the expected verdicts.** Output: "missing verdict: reviews/316/owner.md (required by R3)", "missing verdict: reviews/316/reviewer.md (required by R3)", "FAIL: 2 violation(s)" and "FAIL review_check pr 316 (exit 1)". There are 24 PASS lines and no other FAIL.

3. **non-blocking: the register row's measured claim holds.**
   - Before the exempt line: I made a throwaway detached worktree at 1b9ed40, the commit before 9cd0b10, and removed it afterwards. `v3_checks.py scope --base origin/main` printed "c7086cde9e20: builder commit by 'builder' has no Spec: trailer — in v3 every piece of built work traces to a spec (D-035)" and "FAIL: 1 violation(s)", exit 1. surface_guard diff printed "OK: 2 commit(s) … (1 merge(s) skipped, 0 exempt, 0 human)", exit 0.
   - At HEAD: scope printed "NOTE: c7086cde9e20: exempt (L-0033) — skipped" and "OK: every spec-scoped commit stays inside its spec's Areas touched", exit 0. surface_guard also exits 0.

4. **non-blocking: the ruling date in L-0033 can't be proven from the repo, but the evidence fits it.** L-0033 says the owner answered on 2026-11-06. The answer came through the session's question tool, so nothing in the repo shows the day. The bounds fit: PR #312, which filed the question, was opened 2026-11-06T18:00:04Z (`gh api …/pulls/312`), and the owner recorded the ruling 2026-11-07T13:35Z (94b1102). Since the ledger is append-only, the date can only be checked against the session, not corrected later.

5. **The result file against my verdict: every figure checks.**
   - The judge's output block is verbatim. The 28-starts table and the "6 match, 25 killed, 3 not judged" total match.
   - Both hashes match: 620e2f4 and `eb53c5b7…2f4f748da`.
   - The verdict and all six reasons from finding 4 match, including the D-047 "no Fail rule invented after the freeze".
   - The deviation (Method 8 names 491baa7, the run used 553bcc6), the `git diff --quiet` command, the pack-only change and the unfinished `test.mjs` run are recorded as I wrote them.
   - Diagnosis items (a) to (e) are stated as observations, with "Strong but indirect: nobody listed the folders".
   - The sizing figures (1,033 requests, 200: 869 and 304: 164, 119.9 s, 8.37 MB, per-repository 796/59/169/5/4, about 2× the plan's "about 400", 85 and 46 requests, 7,388,734 B and 7,847,906 B, 1.05 to 1.08 MB, memory not measured) all match.
   - The plain paragraph matches my "For the result file" text. The file opens with "What this means for you".

6. **non-blocking: some facts from my verdict are left out.** The file does not record:
   - that glue.js was not audited in depth (finding 4; the registration's Method 8 asks the Reviewer to read it);
   - finding 8's context: the busy stretch did happen (merges at 13:05–13:09Z and 13:25Z, about 6 in an hour), and the run was not a full day (about 9¾ h, with the widget on the home screen from 13:13Z). These bear on Method 5.
   - from finding 9: 128 calls, 12 steps, "above the offline 866", 301 bodies, and 3 refreshes with 613, 60 and 21 entries.

   Nothing in the file contradicts the verdict. A later reader just gets less than the verdict gave.

7. **non-blocking: one sentence states the widget lifetimes too strongly.** Line 77–79 says "Each lived at most a few seconds (19 … 2.1 to 4.1 s; others 9.0, 9.8 and 21.3 s)". My finding 6 called the gaps "an upper bound" and set three idle gaps apart (193.7 s, 125.3 s, 3609.6 s). 21.3 s is not "a few seconds", and the starts before the idle gaps, the 14:20 start included, have no measured bound. My own plain summary did say "within seconds, usually 2 to 4", so this stays close to the verdict's spirit.

8. **non-blocking: the Builder's own additions in the clean-up section (lines 131–133).**
   - "Both keys … can be deleted on GitHub now: nothing needs them" is not in my verdict. It also changes the order of Method 7, which puts key deletion after the result is filed. Deleting them early is the safe direction.
   - "The second test makes its own keys" is not in my verdict and not in ruling A of `decisions/questions/P-004-widget-next-step.md`. Ruling A only says the data "comes back by the route you allowed last time" with "about 15 minutes to set up". It is a reasonable guess about a test that has not been written yet, not a recorded fact.

   The clean-up steps themselves (delete the branch exp-007-test-data on portfolio, then "Delete test data (after sending it)" and "Forget keys") match Method 7.

9. **non-blocking: the `spec: none` header line is accurate.** It follows the header format of EXP-004 and EXP-006 (`registration: …   spec: …`), and it is what ruling A describes ("a commit with no spec label, on purpose").

10. **non-blocking: the file is safe to publish.** It holds only repository names and counts. The SD, POOM and ML shas from my finding 1 are left out ("every logged commit is in its clone"). The portfolio branch name and commit 620e2f4 are identifiers, not project content, and are already public on origin/main in `reviews/EXP-007/_reviewer-result.md` and `decisions/questions/P-004-test-data-route.md`.

**Open questions**
- Registration line 80 says that if the token page did not offer Checks, the read key is made without it "and the result notes that". Neither my verdict nor the result file says whether Checks was offered. The owner should confirm it.

Files: `/home/user/Service-Desk/docs/handover/experiments/EXP-007-result.md`, `/home/user/Service-Desk/reviews/EXP-007/_reviewer-result.md`, `/home/user/Service-Desk/docs/LEDGER.md`, `/home/user/Service-Desk/governance/SURFACES.md`, `/home/user/Service-Desk/docs/IMPROVEMENT_REGISTER.md`
