# Plan review (Reviewer), round 2, on S-001 amendment draft 2 (733e866) (verbatim)

Verdict: FAIL

For the owner:
- Draft 2 fixes the two big problems from round 1. The desk now uses the automatic job's own statement, printed at the start of each of its runs, of whether its permission stands. It also checks quietly once a minute and calls GitHub for more only when something has changed. Both work as described: I checked them against the job's code and live against GitHub.
- One thing still has to change. If a GitHub read keeps failing, the desk would try again every minute with no limit. On a bad day that could push the desk past its free-plan margin, the same problem fixed earlier for another read. The fix is a small cap on retries.
- Once the job has left a pull request for you, the desk keeps counting it until its contents change, even if the job later merges it on its own. Your phone will already have told you about it, so this only ever shows more, never less. The spec should say so plainly.
- The cost is still tiny, but higher than the "matches 5 to 8 reads" the spec now claims: roughly 10–20 counted GitHub reads per such pull request.
- No new decision is needed from you. The Definer can fix all of this in draft 3.

**Blocking**

A. AC79's limit on desk calls per pull request contradicts itself, and failed reads are retried without limit, so the AC14 sum and its locked check don't hold.
- **Two definitions of "at most 2".** A3 (spec :8848) says the 2 blob calls per head per opening are "its head time and the job's log". AC79 :5580-5584 says they are "the first log; one more only if that run judged nothing". A candidate first seen before its checks start needs the head time, because `judgeCandidate` asks for it only when there are no checks (src/notify/jobcand.mjs:100-101). Add a log, then the "judged nothing" re-read that AC79's own test requires, and the head needs 3 calls. That breaks AC14's assertion at :1593 ("at most 2 AC79 blob calls per candidate head in an opening").
- **Retries are unbounded.** :5553-5555 says a pending or failed read "is made at the next chance", and nothing caps how often. A log read that keeps failing (5xx, or the redirect target refusing) makes a blob call every poll, even when every conditional read answered 304. That contradicts AC14's other assertion at :1592-1593, "no AC79 blob call in a poll whose conditional reads all answered 304". An all-day failure in 5 projects adds up to 5 × 960 = 4,800 calls, so 6,689 + 4,800 is over 10,000. That is the case J12's backoff was added to stop (:8680-8690).
- **Fix:** one cap per head per opening that counts every AC79 blob call, failures included (3 fits). A failed or "too large" answer is kept for that run in the opening, or retried with J12's backoff. Recompute: 288 × 3 = 864, total 6,977, still under 10,000.

**Your specific checks**

B. ETags and 304 (verified live, read-only `gh api`, Service-Desk, head e7e4e1a):
- `commits/<sha>/check-runs`, `commits/<sha>/statuses`, `actions/runs?head_sha=` and `actions/workflows/asks-merge.yml/runs?per_page=30` all return an ETag.
- Each answers 304 to `If-None-Match`. `X-RateLimit-Remaining` was unchanged across two 304s on each endpoint (for example 14682 → 14682 on check-runs).
- J1 already relies on 304s for `actions/runs` (src/lib/github.js:242-306).
- **Not testable here:** the fine-grained read token (I used the session's token), Cloudflare Workers' fetch and `redirect: 'manual'`, and whether the 304 rate exemption applies to a fine-grained token. GitHub's documentation says it applies to any authorized request.

C. Poll-call validator and subrequests:
- `validatePoll` (src/lib/api.js:37-48) ignores unknown fields, so the `jobs` part is new code with no conflict. Its ETags sit outside the 10-entry / 3 KB cap, and the 16 KB body limit leaves room (about 1.5 KB for 5 heads).
- **Poll call:** today it makes at most 11 GitHub requests (branch 1, pulls ≤3, runs 3a/3b ≤3 each, tree 1; github.js:242-310). Adding 16 gives 27, plus up to 2 Access key fetches (src/lib/access.js:8-9, 101) = 29. That is within J1's own limit of 30 (:5802) and Free's 50, but with 1 to spare. The line "a poll call makes at most 11" (:5801) is now stale.
- **Blob call:** 5 log forms × 3 + 5 head times + the ledger = 21 (+2), also fine.
- **Gaps in J6 (:6303-6305):** it doesn't say what a `commitTime` entry costs from the budget, or its maximum. The poll call's lists are first pages only, and the spec doesn't say that a list with a next page counts.

D. "Stays left on that head" vs the sender. The two are not consistent: the sender re-judges with nothing kept from run to run (src/notify/collect.mjs:264-284). These "final" reasons can clear with no new head:
- the filing PR is checked against the tip: `filed, but its answer record … is on the default branch` (governance/checks/asks_merge.py:156);
- a tidy-away opened before its answer lands is too: `deleted, but its answer record … is not on the default branch` (:164);
- description or trailer fixes (:535-537).

In each case the job's next run merges it, and the sender drops it from its set. The page keeps counting it, with "The automatic job left this for you", until it merges, usually within 15 minutes, or until its head changes. So yes, the desk can count something the job then merges.

This is acceptable under the ruling. The phone was already told when the job left it, so the desk shows no more than you were told, and AC79's test, "page counts whenever the sender has left it" (:5616 area), still holds. But it is a second-direction difference that the "bound, honestly" paragraph (:5559-5562) and the owner paragraph don't state. State it, or drop the "left this for you" words once the pull request is no longer being judged anew.

E. The grant line (verified):
- asks_merge.py `run` prints `NOTE: the asks-merge grant is %s` from its own `find_grant(root, "HEAD")` (:611-616), with history, before any `PR #` line. It prints `NOTE: no asks-merge grant stands in docs/LEDGER.md …` otherwise (:613). The workflow checks out the default branch with `fetch-depth: 0` (.github/workflows/asks-merge.yml).
- The page only grants when the job's id and the ledger's form check agree, so it never sees a grant the sender lacks. It errs only toward counting, so it is a sound stand-in for the arrival check.
- **Caveats** (non-blocking):
  - (i) J16's judging runs include `workflow_dispatch` on any branch (:7292; jobcand.mjs:10). Anyone who can push can dispatch a modified asks_merge.py on a branch and print a forged grant line or `PR #` lines. This gap already exists for the sender. Filter the runs to `head_branch` = default branch in both; the sender's side is R3.
  - (ii) "Newest completed judging run" should mean the newest run whose `merge` job ran (run conclusion not `skipped`/`cancelled`).
  - (iii) If the latest form-valid entry is one the job refuses, the job falls back to an earlier entry, the ids mismatch, and the page counts everything while the job keeps merging. That is safe, but option B is then off until the ledger changes. Likewise, after a ledger change the grant line is re-read only when some log is needed. Re-read it when the ledger's sha changes or the ids mismatch.
  - (iv) If `github.event.repository.default_branch` is ever empty, `run` reads the repo first and may print "default branch cannot be read" with no grant line. The page then counts, which is safe.

F. Sums recomputed: 5,500 + 288 + 60 + 215 + 576 + 50 = 6,689. The arithmetic is correct.
- "1 call per project per opening" holds. The module reads the newest ≤5 logs after each candidate's `done`, and those are shared across candidates, so the union is ≤5. A first judgment costs 5 + 15 + 1 = 21 of the budget of 25.
- With A's fix it is 6,977.

G. D1-D4 against the real jobcand.mjs (probe: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probe2.mjs):
- **D1 holds.** `created_at` is never later than the sender's first sight, and it is already in the page's record (src/lib/records.js:779). New PR with an old commit: page and sender both `false`. At 35 minutes: both `true/c`.
- **D2 holds as written (:5553-5555)**, with a gap the spec should state. The module calls `readJobs` for every run after `done`, and reads up to 5 logs even after finding a final verdict in the newest one (probe: logs asked for `[60, 50]`). So the page must:
  - work out the reads the module will ask for (a dry pass);
  - build `readJobs` from the runs list: skipped, cancelled and in-progress runs need no read;
  - fetch the needed logs together, at most 5 a call.
- **D3 holds.** `retriedMs: null` in gives a non-null value out for a retried newest verdict (`false/null/1792410660000`).
- **D4 is fixed for new pull requests, not for new heads.** A new head pushed to an older pull request, whose commit time is over 30 minutes old: the page gives `true/c`, the sender `false`. The desk then shows "No checks have started on it for 30 minutes" (:5606-5607) seconds after the push. It is rare and errs toward counting. Show the (c) words only when 30 minutes have passed since the page first saw that head too.

**Other notes**

H. The owner paragraph says the cost "matches the question's about 5 to 8" (:1158-1160). Every changed conditional answer is a counted 200. While checks run, the check-runs and workflow-runs lists change most polls. The asks-merge runs page also changes most polls, because asks-merge runs on every governance, pr-body and desk-build completion (asks-merge.yml:14-16). Each log form is also 2 GitHub API requests. My rough estimate (E, not measured) is 10-20 counted reads per such pull request per open device: still trivial, but say that rather than claim a match.

I. Round-1 findings that are now resolved:
- `findGrant` stays in src/notify/, and only the pure parts move.
- R3 through CS23 (:8338-8343).
- No token on the redirect, and the 1 MB cap.
- The `PR #` and `NOTE` filter, in order, through `logLines`.
- The private-repository limit is stated.
- AC77's and AC73's tests are corrected.
- The row's behaviour is stated (:5601-5604).
- The stale branch sentence is gone; the ruling is cited at d8026fa.

Open questions:
1. For A: should the cap be 3 per head per opening including retries, or use J12's backoff for failed AC79 reads?
2. For D: keep "The automatic job left this for you" while the pull request is held as left, or drop the words once the job stops leaving it?
