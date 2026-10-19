# Build review (Reviewer, security), round 2, of the being-recorded build at 739f98e (verbatim)

Verdict: PASS

For the owner:
- **Each round-1 fix holds against my probes.** Planting a fake verdict line through a file name now makes both your phone and the desk count the pull requests that log names. A run started by hand on a tag named `main` is ignored by the sender, and the desk counts what it names. A commit dated in the future no longer holds a pull request back. The two remaining reads no longer follow redirects. Odd entries get an empty answer instead of an error.
- **The token is still safe.** No secret or token leaves GitHub, and nothing new is kept on your device. The sender's change is still small, and nothing new runs with the notification secrets.
- **The ordering rule alone doesn't close A.** It can still be fooled if a run of the automatic job stops right after the planted line, before it prints the next pull request's real line. That could happen if a run is killed at its 15-minute limit. The fake line then wins on both sides. It needs a deliberately slow pull request, and it depends on how GitHub labels a run that hit its time limit, which I couldn't confirm. I rate it a risk to carry, not a blocker. It has a one-line fix, below. The pending model change (printing file names safely) closes it fully.

What I ran, at 739f98e in /home/user/sd-orch-apr, which I left unchanged:
- Full suite: 763/763 pass. `node tools/build.mjs`: PASS. `surface_guard.py diff --range 97f39cf..739f98e`: OK.
- Probes are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/apr/probes/. New this round: e2e2.mjs and round2-misc.mjs. Re-run from round 1: e2e.mjs, validate.mjs and redirect.mjs.

## The fixes, one by one
- **A (well-formed logs): fixed as ruled, with a residual (finding R1).**
  - `logWellFormed` and `logNames` are at src/lib/jobcand.js:51-69. A forged log answers `left:true, forged:true` (:173-178) when it names the candidate and no newer verdict exists.
  - e2e2.mjs A1 (PR #9's file name forges "PR #3: merged"): the sender's set is `["3","9"]`, and the page shows `{"3":"count/forged"}`. A forged result is not held as left (src/lib/jobwatch.js, `p.v.forged`).
- **The Builder's note is correct.**
  - The new sender filter (src/notify/collect.mjs:249-257) drops every run that has no `head_sha`, because `isAncestor(undefined, …)` returns null and so fails the `=== true` test. My round-1 probe's runs had no `head_sha`.
  - e2e2.mjs A0: without `head_sha` the sender's set is `[]`; with `head_sha` = HEAD it is `["3"]`.
  - Real runs always carry `head_sha`. Dropping one that lacks it does no harm: the run judges nothing, so the sender just uses older runs.
- **C, sender:** `checkout.isAncestor` (src/notify/checkout.mjs:80-84, unchanged since 97f39cf) checks both shas are 40 hex characters and calls git without a shell. In e2e2.mjs C1, a dispatch run on a commit off main forges "PR #3: merged"; the sender drops it and still counts #3.
- **C, page:**
  - The grant line never comes from a dispatch run. In C2, where the only run is a dispatch, the page shows `count/grant`.
  - A dispatch run on top makes the candidates it names count (C1: `count/dispatch`).
  - Only `workflow_dispatch` can run a changed asks-merge.yml. `workflow_run` and `schedule` runs use the default branch's file, so the event check is enough.
- **D:** with no checks and first sight 40 minutes ago, a head time 5 or 10 minutes ahead is used (not left), while 11 minutes ahead or a year ahead is ignored (left by rule (c)). That matches "more than 10 minutes" (jobcand.js:150-152).
- **E:** the grant's record deleted mid-opening: in e2e.mjs case B1 the page now shows `{"3":"count/grant"}` (round 1: `recording`).
- **F:** a 301 answer to `/commits/<sha>` or `/actions/runs/42/jobs` is now a null answer, and both calls are made with `redirect: 'manual'` (round2-misc.mjs).
- **G:** a non-string, a number or a 101-character entry now answers `null` with status 200. Only a non-array field is still refused (400), which is fine: it isn't an entry. A v2.5 project's `jobLog` answers `null`.
- **The secrets and the src/notify diff:**
  - src/notify/grant.mjs, src/lib/ledgergrant.js, checkout.mjs and gh.mjs are unchanged since round 1, so last round's differential result for the grant split (7/7 history cases, 0 fuzz mismatches) still holds.
  - The only src/notify change since round 1 is the 9-line ancestry filter in collect.mjs, using a function that already existed.
  - jobcand.js still imports nothing, and ledgergrant.js imports only ./pulls.js, as before.
  - governance/risk-paths.toml at 739f98e lists both new paths as R3 (lines 22-23).

## Findings
**R1. Non-blocking, carried as a risk (Definer, Orchestrator): a run that stops right after the forged line still fools both sides.**
- **How it works.** The job judges pull requests in ascending order. An injector, say #9, can forge a line for a higher number, say #12. If the run stops before #12's real line, the log is still in ascending order, so it counts as well formed. The fake "merged" line then overrides an earlier run's real "left" verdict.
- **Reproduce.** `node …/probes/e2e2.mjs` case A2:
  - the newest run (merge job conclusion `failure`) has the #9 line holding "PR #12: merged";
  - an older run left #12 with a final reason;
  - the result: the sender's set is `["3","9"]` with #12 missing, and the page shows `"12":"recording/recording"`.
- **Which conclusions it works for.** round2-misc.mjs shows the forged line wins when the stopped job concludes `failure` or `timed_out`, and is ignored when it concludes `cancelled`.
- **Ways to stop a run there:**
  - Killing it at `timeout-minutes: 15` (.github/workflows/asks-merge.yml) by making the PR after the injector slow to judge. Each `gh` call can take up to 60 s (asks_merge.py:78), and a 300-file PR needs hundreds of reads. Which conclusion GitHub gives a timed-out job is unconfirmed.
  - An uncaught crash. The only call outside the job's per-pull-request `try` is `say`/`print` (asks_merge.py:632), and I found no practical way to make it fail.
- **Suggested reader-side fix:** take verdicts only from a `merge` job whose conclusion is `success`. Judge any other completed conclusion (`failure`, `timed_out`, …) as the forged case: every candidate it names counts. The real job ends non-success only after an error.
- **Answer to your question:** the reader-side rule alone doesn't close A. With the success-only rule it would close the cases I found. The model change closes the cause.

**R2. Note (Definer), not new in this work: a candidate the job never reaches stays "Being recorded".**
- e2e2.mjs A3: when every run stops before #12 (or the job is broken or disabled), #12 is never judged. The sender never notifies it, and the desk shows it as "Being recorded" with no time limit.
- This was J16's design on the sender; AC79 now shows it on the desk.
- A stalled job also uses about 15 Actions minutes per run, which would show on AC78's cost bar.
- A bound would close it, for example: count a candidate whose checks have passed but which no run has judged within 45 minutes.

**R3. Note (Builder/Definer): the sender may run one round behind when main moves.**
- A judging run whose `head_sha` is newer than the sender's checkout (main moved after the checkout) fails the ancestry test and is dropped for that sender run.
- Its verdict waits for the next sender run with a newer checkout. That is a short delay, not a loss. Worth one sentence in J16.

## Open questions
- What conclusion does GitHub's jobs API give a job that hits `timeout-minutes`: `cancelled`, `failure` or `timed_out`? This decides whether R1 can be reached by a timeout. The success-only rule makes the answer irrelevant.
- Whether the asks_merge.py model change (`repr` paths, or refusing control characters) has a date. Until then, R1's fix is the cheaper way to close the gap.
