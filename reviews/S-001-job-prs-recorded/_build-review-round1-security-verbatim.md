# Build review (Reviewer, security), round 1, of the being-recorded build at 8317f02 (verbatim)

Verdict: FAIL

For the owner:
- **The part the brief worried about most is safe.** The function never sends its GitHub read token anywhere but GitHub. The job log's redirect is followed once, to an `https` address only, with no token. Every other new read refuses redirects or stays on GitHub. A visitor to the page can't steer the function to other addresses. Only the job's verdict lines and its grant line ever reach the page. Nothing new is kept on your device.
- **The sender change is as small as promised.** The rules for reading the grant were moved, not changed: old and new code gave the same answer on every test history and on 20,000 made-up ledgers. Nothing new runs with the notification secrets.
- **One thing fails.** Anyone who can push a branch to the repository (any agent) can open a pull request with a file whose name contains a line break. The automatic job prints that name into its log, which plants a fake "PR #3: merged" line. Both your phone and the desk then treat PR #3 as something the job is handling, even when the job actually left it for you. I reproduced this end to end on the test fakes; the one piece I couldn't confirm is whether GitHub accepts such a file name.
- **Before this change the desk would still have shown PR #3 as waiting on you; now it says "Being recorded".** The phone already had this weakness; this work extends it to the desk.
- **Separate from the code:** the step that marks the two new shared files as high-risk (pull request #130) is still open. The spec says this work waits until that lands.

What I ran: the full suite, 687 of 687 passing; `node tools/build.mjs`, PASS; `surface_guard.py diff --range 97f39cf..8317f02`, OK. I also ran six read-only probes, kept in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/apr/probes/ (redirect.mjs, validate.mjs, jobspart.mjs, forge.mjs, grantdiff.mjs, e2e.mjs). The worktree at 8317f02 is unchanged.

## Findings

**A. BLOCKING: a pushed file name forges the job's verdict lines, hiding a pull request from both the phone and the desk.** Route: Definer (J16/AC79's log-reading rule), with a model note for whoever owns asks_merge.py.
- **The source.** asks_merge.py prints file paths from the pull request unescaped:
  - governance/checks/asks_merge.py:135-136 puts the path into the problem text, e.g. "%s (%s) is not a change the asks-merge delegation covers".
  - :632 prints it as `PR #N: waits: <path>…`.
  - A path holding `\n` (or `\r`, which `logLines` also splits on, src/lib/jobcand.js:26) therefore starts a new log line.
- **Why the fake line wins.** src/lib/jobcand.js:30-38 `logVerdict` keeps the *last* line for a number, and :143 stops at a `merged` line. src/lib/github.js:52 and :442 keep every line starting `PR #`, so the page gets the fake line too. The job judges pull requests in ascending number order, so a higher-numbered pull request can overwrite the verdict of any lower one.
- **Reproduced.** `node …/probes/e2e.mjs` on the test fakes (sender `collect()` and the page's `pageJobs`), with PR #3 left by the job ("a notes or Critic record, which waits for the owner"):
  - PR #3 alone: the sender's set is `["Service-Desk|pr|3"]` and the page counts it.
  - Add PR #9, whose one file is `x\nPR #3: merged`: the sender's set is `["Service-Desk|pr|9"]` and the page shows #3 as `recording`.
  - This lasts for every 15-minute run while #9 stays open. forge.mjs shows the same thing on the module directly.
- **Who can do it.** Only authors who can push a branch here; a fork's pull request stops at "its branch is not in this repository" before any path is printed.
- **Not confirmed in this session:** whether GitHub accepts a path containing a control character on push and returns it in the compare API. Git itself allows it.
- **Suggested fixes:**
  - Reader side, both sides: the job prints exactly one `PR #n:` line per open pull request, in ascending order. Treat a log with a repeated or out-of-order `PR #n:` line as not the job's words, and count that pull request.
  - Model side: print paths with `%r`, or refuse control characters.

**B. Gate condition (Orchestrator): CS23 hasn't landed.**
- governance/risk-paths.toml at 8317f02 and on main lists only `src/notify/**`.
- The change making src/lib/jobcand.js and src/lib/ledgergrant.js high-risk is commit 2462c1f on cos/cs23-r3-paths, pull request #130, still open and unmerged.
- The spec (Setup CS23) says: "Until it lands, the move waits." Don't merge this branch to main before #130.

**C. Non-blocking (Definer, owner setting): the default-branch filter checks only the run's branch name.**
- src/lib/jobcand.js:98-101 accepts any run whose `head_branch === defaultBranch`.
- A `workflow_dispatch` on a *tag* named `main` would likely report `head_branch: "main"`, since GitHub reports the tag name there. I couldn't confirm this here: the only other public repository I tried wasn't readable from this session.
- A dispatched run uses that ref's own asks-merge.yml, so it could print any `PR #` line or a fake grant line. The page takes the grant from that newest run (src/lib/jobwatch.js:203-207, :237-247).
- Needs Actions write access plus tag creation. GitHub's real list for this repository shows only `workflow_run main` (95) and `schedule main` (5).
- Fixes: a tag rule blocking tags named `main`, or, in the sender, also requiring the run's `head_sha` to be an ancestor of the checkout's HEAD.

**D. Non-blocking (Definer): rule (c) can be held off forever by a commit dated in the future.**
- src/lib/jobcand.js:119-123 counts from `max(headTime, seen)`, and the head time is the committer date, which the author sets.
- `node …/probes/forge.mjs` case 3: with no checks and a head dated 2030, the answer is `left:false`.
- So a candidate whose checks never start (for example a `[skip ci]` commit) is never notified, and since this change the desk shows it as "Being recorded" too.
- The phone already had this; the desk is new. Fix: ignore a head time later than now.

**E. Non-blocking (Builder): the page's grant form goes stale when only the tree changes.**
- src/lib/jobwatch.js:189-197 resets the form only when the ledger's sha changes. applyReads (:358) checks the record that `decided_by` names (`has`) once.
- If that record is deleted from main mid-opening, the sender drops the grant and counts the pull request, but the page keeps `recording`. The e2e.mjs case B1 "during the opening" prints `{"3":"recording/recording"}`.
- It lasts until a later job log is read, which can be well past AC79's "about a minute", e.g. while checks run. This is rare.
- Fix: keep the ledger text and run `formGrant` again whenever the tree changes.

**F. Non-blocking hardening (Builder): two new reads follow redirects with the token.**
- `u.commit` (src/lib/github.js:742) and `u.runJobs` (:454) use the default redirect mode, as all the older reads do.
- GitHub's redirects for these are same-origin in practice (repository renames). Passing `redirect: 'manual'`, as the `jobs` part does at :376, would close it.

**G. Note (Definer/Builder): two minor differences from J6's wording.**
- src/lib/api.js:143 and :151 *refuse* the blob call (400) for a non-string `commitTime`/`jobLog` entry, or one over 100 characters, where J6 says such an entry answers `null`. This is the safe side and only a hand-made request reaches it.
- `jobLog` accepts any run id, and also a v2.5 project. The output is limited to the kept lines and the caller must pass Access, so the exposure is negligible.

## Checked and found sound
- **The log form.**
  - Calls: jobs (with token), then the log at :474 (with token, `redirect: 'manual'`), then the redirect target at :482 (no Authorization, `redirect: 'manual'`). That is 3 requests, counted.
  - An `http:` address, a relative address, no Location header, or a second redirect each answer `null` (redirect.mjs B to E).
  - The size cap: exactly 65,536 characters is read; 65,537 answers "too large"; so does a Content-Length over 4×65,536 or a 16 MB streamed body (cut off while streaming). The timestamp pattern can't backtrack badly.
  - Only `PR #` and the two `NOTE:` grant lines are kept. `GH_TOKEN: ***`, `secret=…` and `Authorization:` lines are dropped.
- **Input checks.**
  - `jobs`: only 40-character lowercase-hex shas, the allowed keys and ETags of at most 200 characters are taken; anything else answers `null`, never a refusal. The sixth head and later go to `extra`. Duplicates are merged. A v2.5 project gets `null`.
  - The part answers `null` past J1's limit of 30 requests (15 used plus 16 needed gives null; 14 plus 16 is read).
  - An ETag holding CR/LF can't inject a header: `Headers` throws, which the read turns into a failed list.
  - `jobLog`: digits only, 1 to 20 of them; `../`, `?`, `%2e`, non-ASCII digits and a leading space all answer `null`, as do a sixth and later. `commitTime`: lowercase shas only, at most 5. The budget counts 3 and 1.
- **The grant split.**
  - The old src/notify/grant.mjs at 97f39cf against the new one: 7 of 7 `findGrant` history cases match, the real ef8daf4 ledger gives L-0017 both ways, and 20,000 fuzzed ledgers show 0 mismatches.
  - The exports it dropped have no remaining importers.
- **The sender diff** is the import move plus `defaultBranch: project.defaultBranch` (src/notify/collect.mjs:13 and :284). `defaultBranch` comes from the project config, which the build requires to be non-empty (src/lib/configcheck.js:77). `judgeCandidate` throws without it, and `isJudgingRun` is false for an empty branch.
- **What the sender loads.** jobcand.js imports nothing. ledgergrant.js imports only ./pulls.js, which the sender already loaded. So nothing new runs with the secrets.
- **Page vs sender.** On the paths I traced, the page counts at least as early as the sender: its rule (c) runs from the pull request's creation, a retried reason counts at once, a list with a next page counts, and a read that failed or hasn't been made yet counts unless the job already left the pull request.
- **Page side.**
  - The new rows add text as text nodes (src/public/sandbox.js:327-331, src/public/app.js:275-276). No AC79 text goes through `html`.
  - jobwatch.js is pure and stores nothing. The ledger and log answers bypass the blob cache, which keeps only blobs that are live in the tree (src/lib/scheduler.js:415-427).

## Open questions
- Finding A needs the Definer to pick the reader rule, and to say whether asks_merge.py is fixed upstream in the model. Whether GitHub accepts a control character in a path is worth one read-only check by someone with a scratch repository.
- Finding C: whether to rely on a tag rule (an owner setting) or add the ancestry check in the sender.
