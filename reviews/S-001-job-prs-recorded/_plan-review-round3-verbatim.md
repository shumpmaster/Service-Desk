# Plan review (Reviewer), round 3, on S-001 amendment draft 3 (08138e7) (verbatim)

Verdict: PASS with notes

For the owner:
- Draft 3 fixes the one problem left last round. If GitHub keeps failing, the desk now tries again at most three times per pull request, so it stays well inside its free-plan limit: about 7,100 calls on the worst day it is designed for, against a margin of 10,000.
- I checked the new safeguard against real runs of the automatic job. It keeps every genuine run and ignores only test runs started from someone's branch.
- What you chose still holds. These pull requests show as "Being recorded by the automatic job" and don't count. The desk counts a little more than your phone in a few short cases, which the spec now states plainly.
- Nothing here needs your decision. The notes below are small wording and test fixes that can be made before or during the build.

**Your specific checks**

A. Does the `head_branch` filter keep real runs? Yes, it is correct. I listed the latest 30 asks-merge runs with read-only `gh api repos/shumpmaster/Service-Desk/actions/workflows/asks-merge.yml/runs?per_page=30`:
- Every `workflow_run` and `schedule` run reports `head_branch: main`, with main's sha as `head_sha`. Examples: 39267386379 (workflow_run, main, 00be83de8d96, success) and 39267425389 (schedule, main, success).
- A `workflow_run` workflow runs from the default branch, so the filter drops only a `workflow_dispatch` run on another ref, as intended (spec :5578-5582, J16 :7343).
- The same list settles the Critic's R and the spec's "C" at :5594-5598: a run whose only job was skipped reports conclusion `skipped` (39270501721, 39267842850, 39266604105).

B. Does 29 of 30 subrequests tip over?
- **No retry inside a call.** Neither `makeGetter` nor `readList` retries (src/lib/github.js:128-143 and `readList`). The core poll reads are at most 11: branch 1, pulls ≤3, runs 3a/3b ≤3 each, tree 1. Add 16 conditional reads and up to 2 Access key fetches (src/lib/access.js:8-9) and the poll call reaches 29 (spec :5844-5847).
- **The one case that tips over is redirects.** `makeGetter` uses fetch's default `redirect: 'follow'`, and the spec counts redirect hops (F-cf-workers-02, :5848). If the repository were renamed or transferred, GitHub answers 301 to every request, giving 27 × 2 + 2 = 56. That is over J1's own 30 and Free's 50; before this amendment it was 24.
- **The damage is limited.** A fetch error, including Workers' too-many-subrequests error, becomes `null` (:139-141). If the `jobs` part is read after the core reads, an overflow only nulls that part, and the candidates count: the safe side.
- **Note 1:** require the `jobs` part to be read last, and skip it (answer `null`) once the function's request count would pass 30. Then the "within 30" claim holds by code, not only by arithmetic. Nothing enforces 30 today: `counter.n` only counts.
- **Blob call:** 5 log forms × 3 + 5 head times + the ledger = 21 (23 with key fetches), within the budget of 25. Union of logs ≤ 5: at an opening the module reads the newest ≤5 runs after each candidate's `done`, and those are shared. The grant run is the newest of them, so a sixth `jobLog` isn't needed.

C. The 7,077 sum is arithmetically correct: 5,500 + 288 + 60 + 215 + 864 + 50 + 100 = 7,077 (:8905-8916, asserted at :1595).
- **Note 2:** the cap is "per candidate head per opening" (:5604-5611), so a head that lives across an opening boundary gets a fresh cap of 3 in the next opening. The per-opening "1" covers only that head's first judgment there. In AC14's convention (3 pull requests, 10 openings), that adds at most 10 × 3 × 2 = 60 calls, about 7,137. That is still far under 10,000, but the stated figure is slightly low.

**Round 2 findings re-checked**

D. Held-as-left. It is stated in the owner paragraph (:1152-1155) and in AC79's "And the other direction". The cases I found in round 2 match: asks_merge.py:156 and :164, and the description edits at :535-537. The page still counts whenever the sender has left a pull request, so AC79's test claim holds. Resolved.

E(ii) and E(iii). Resolved (:5536-5542, :5590-5594). They match `run` (asks_merge.py:609-616): no grant line when the default branch can't be read.

G. The dry pass (:5553-5560) matches the real module. It calls `readJobs` for every run after `done` and reads up to 5 logs even after a final verdict (my probe asked for logs `[60, 50]`). D1-D3 are unchanged: `created_at` is never after the sender's first sight; `retriedMs: null` in gives non-null out on a retried verdict. D4 is fixed for new heads: the (c) words wait 30 minutes after the page first saw the head (:5626-5630).

H. The "5 to 20" estimate (:1155-1160) is consistent with my round 2 estimate, and is now marked as rough.

**Notes (non-blocking)**

3. **Failed grant read.** It sits outside the per-head cap (:5611), and its retry rule is ambiguous. The text says "read once per opening, and again after each change of the ledger's sha" (:5592), and a failed answer is "kept for that run" (:5606). A builder could read that as "try the next newer judging run". The runs page changes with almost every asks-merge run (about 20 runs in 80 minutes on today's list), so retries could run up to once a poll per project. Say that a failed grant read isn't retried until the next opening or ledger change, or cap it at, say, 3 per project per opening. Make AC14's "one log read failing all day" case (:1594-1595) include the grant read.

4. **J16 test gap.** J16's join test (:7405 on) has no case for the new `head_branch` filter in the sender. It is an R3 behaviour change, tested only on the page in AC79's list (:5676-5677). Add: "a branch's `workflow_dispatch` asks-merge run ignored by the sender".

5. **Module signature.** The filter needs the default branch as a new input to `judgeCandidate` (src/notify/jobcand.mjs:94-111 today has none). The brief should say this, since the module is no longer moved "unchanged".

6. **Live-test caveat (unchanged).** ETag/304 and the free-304 counting were verified with the session's token, not the fine-grained read token from Workers. The spec marks this "C, untested" (:5576-5577), which is right.

Critic round 2's N-S are addressed: N in AC52's test, O by the one cap, P in J1 and J6's `jobs` response field, Q in J6's test, R by the runs list and the 65,536-character cap, S in the owner paragraph.

Open questions:
1. Note 3: should a failed grant read wait for the next opening, or have a small per-project cap?
