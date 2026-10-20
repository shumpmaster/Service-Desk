# S-001, desk mockup v2, draft 2: the plan review's round-2 report, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/build/definer/s001-desk-v2 at dce34bb, by a fresh Reviewer.

---

Verdict: FAIL

**For the owner:**
- Draft 2 fixes all 19 findings from round 1 (4 of the plan review's were blocking, and 4 of the Critic's).
- The cost recount is correct: 9,817 calls a day, 183 under our own 10,000 limit.
- All governance checks pass.
- One new problem stops the build from starting. A reviewer's verdict file can carry an invisible stray character: a space after "PASS", a Windows-style line ending, or a hidden byte-order mark at the start. GitHub's own check still reads such a file as a pass. The plan's wording reads it as neither pass nor fail. The pull request would then sit in "With the agents", hidden from your count and your phone, for good, while it actually waits on you.
  - None of the roughly 200 verdict files in either project has one of these characters today.
  - The desk already has the right reader for verdict files. The fix is one sentence telling the build to use it, plus four test cases.

Spec lines are specs/S-001.md at dce34bb. Code is cited at the same commit.

**Round-1 findings, plan review**
1. Rule 0 carried across heads: **resolved.**
   - J22 :10727-10738 says rule 0 is never kept across heads. A head whose files are unread, a fork, a list of 300 files or more, or an unreadable risk-paths file is judged by (i) alone.
   - AC80 :5803-5805 and :5998 say the same.
   - J22's test (:10878-10883) adds the head A → head B case with a failed read.
2. Stage 3 depending on stage 6a: **resolved.** The stage table (:1754), AC83 (:6447-6453), J23 (:10887-10901) and the brief all put J23's version reads and `publishesModel` in stage 3.
3. Per-head cost, J24, the portfolio and AC14's test: **resolved.**
   - One verdict call per head (J22 :10742-10750). A3 counts +200 for openings, +50 for J24 and +212 for the portfolio (:12509-12541).
   - AC14's test now asserts bounds rather than "no call added" (:2376-2388).
4. The sender's rule 0 reads: **resolved,** apart from non-blocking finding 5.
   - J16 :10208-10242 adds: verdict blobs read by sha and kept in J18; an ETag'd owner-check read only where the page reads it; failed, refused, 404, oversize and non-text reads counting as given; forks, 300-file lists and a missing risk-paths file judged by (i) alone; and rule 0 test cases.
   - J18 :10531-10537 and :10572-10575 count the new entries toward its 5,000 keys.
   - collect.mjs:113 confirms that a failed file list stops the whole project's read.
5. The 1a/1b order and the operating-model pin: **resolved.** 1a merges, then 1b, then one preview deploy (:1752, :13759-13767, Risks :13085-13094). CS27 moves Workflow 4's pin (:11942-11951).
6. Operating-model evidence: **resolved** (:12683-12694). I re-ran it in /home/user/Personal-Org-Operating-Model:
   - `git show --stat 5f5546f dd362ac f441025` shows each adds `reviews/33/`, `/34/` or `/35/reviewer.md`.
   - `merge-base --is-ancestor` exits 0 against aba7fab^2, c816cec^2 and 90f53e3^2, and 1 against each first parent.
   - Its `[reviews]` block (lines 34-38) matches.
7. The phase marker: **resolved** by the owner's ruling (P-001-timeline-marker.md: A). AC81 keeps the marker on the Team screen.
8. PR #166 and the waits: **resolved.** All eleven rulings are cited (:1712-1729, :13298-13342). I read line 1 of each file. No stage waits on a question. AC82 cites P-001-tile-summary-clip.md for the three lines.
9. P1's token permissions: **resolved.** P1 (:11956-11961) now lists the same four as G1 (:11609).
10. A mark confirmed by rule 0: **resolved** (AC80 :5989-5993).
11. A named method for the layout checks: **resolved** (AC81 :6282-6285, AC82 :6422-6428, AC84 :6629-6634). The rulebook (README:466) says Chromium and Playwright are pre-installed in the cloud session.
12. The `tier:` comment and the v3-only merges: **resolved** (J23 :10892-10895, J24 :10970-10973).
13. The Pi subset: **resolved.**
    - ◆, ✕, ▸ and ⇅ are drawn as SVG icons (AC81).
    - I re-checked the ranges (:12606-12612) against the IBMPlexSans-Regular.css in the round-1 tarballs.

**Round-1 findings, Critic**
1. The "Latest" bubble: **resolved.** The owner ruled (P-001-latest-bubble.md: A).
2. Sender rollout: **resolved** (plan review 5 above).
3. Sender failure handling and tests: **resolved** (plan review 4 above).
4. Operating-model evidence: **resolved** (plan review 6 above).
5. Disagreeing waits: **resolved.** No stage waits on a question.
6. The 1a sheet's box and frame 12: **resolved.** The box is in 1a and AC85's layout in stage 4 (:13724-13727). Each stage builds both themes (:1742-1744).
7. Whether AC44's step 2 includes 6b: **resolved** (:2795-2797).
8. Frame 1's 400 11 px: **resolved** (AC81's list).
9. The stale top-line marks: **resolved.**
10. The "from 2026-10-20" dating in Terms: **resolved** (:2101-2104, :2202).
11. The "⋯ More" pill: **resolved** under P-001-settings-place.md.
12. The Pi marks: **resolved** (same as plan review 13).
13. The colour computation's command: **resolved.** The program and its output are in the spec (:12613-12659).
14. Codes in the questions: **resolved.** All eleven were filed in plain words and answered.
15. AC80's V2 trace: **resolved** (:5728).

**New findings**

BLOCKING
1. **Rule 0's verdict reading is pinned only to "the first column-0 `Verdict:` line". That can read as "neither" a file that review_check passes, and "neither" is the side that hides a pull request.**
   - J22 :10724-10725 and J16 :10214 say "its first column-0 `Verdict:` line … as rule 1 reads the owner's". Rule 1 (:10761-10766) says the same, and a file reading "neither" goes to "With the agents".
   - The model's reader is looser than that: governance/checks/review_check.py:67-87 drops a leading byte-order mark, drops a trailing CR, and allows trailing spaces or tabs.
   - The desk already has an exact port of it: `verdictOf`, src/lib/j11.js:56-74. The spec never names it for rule 0 or for the sender.
   - Reproduced with `python3 -I -c` running review_check.parse_verdict beside a literal reading of the spec:

     | File text | review_check | Literal reading |
     |---|---|---|
     | `"Verdict: PASS \n"` | PASS | neither |
     | `"Verdict: PASS\r\n…"` | PASS | neither |
     | `"Verdict: PASS\t\n"` | PASS | neither |
     | `"﻿Verdict: PASS\n"` | PASS | missing |

     `node` running j11.js `verdictOf` gives PASS for all four.
   - In each case an R1 pull request whose governance check is green, and which needs the owner's merge, sits in "With the agents" with no end, on the board and on the phone. That is a miss of V1's 5 minutes. No failed read is needed to cause it.
   - No current verdict file in either project has these forms (`grep -rlP '\r$'`, a BOM search and a trailing-blank search found none). So the risk is real but rare.
   - Fix: J22 rule 0 (and rule 1), and J16, decide verdicts with `verdictOf` (equal to review_check's `parse_verdict`). Its 'other' and `null` are rule 0's "neither". J22's and J16's tests add these four cases, real-on-real against `parse_verdict`.

Non-blocking
2. **A3's per-cycle bound still assumes 3 open pull requests.** :12367-12370 gives "6 + 2 × the open pull requests … in AC14's case of 3 open pull requests a project, 12". This draft's openings case uses 5 a project (:12519, :2384), which gives 16. Make them agree.
3. **J22's "a card shows between two judgements only when that read fails" (:10738-10739) overstates. The error is on the safe side.**
   - J20's read is optional. It runs only after the needed reads are in. A cycle whose needed reads fail or hit the cap stops first (scheduler.js:758-768).
   - The optional loop also stops at its first failed call (scheduler.js:790-794).
   - So a new head is judged by (i) alone in those cycles too. That gives a brief false card, never a hide.
   - The Builder also needs telling that the per-head verdict calls must not ride that loop as it is. Otherwise J22's test "two heads' verdict calls in one cycle, one failing, the other's answer kept" fails when the failing head goes first.
4. **The sender and the board are not "fed the same inputs" for (i).**
   - J16 :10216-10223 has the sender read (i) for every open own-branch head in a public v3 project.
   - The page reads it for at most 3 heads, and never for a head already "Verdict ↗" by its class (J22 :10839-10842).
   - Example: an R3 change outside the signal-code paths (AGENTS.md, governance/risk-paths.toml, as in CS24's own pull request) with "Owner: after agents · other checks failing". The board shows a "Verdict ↗" card; the phone stays silent.
   - Only the board's false-alarm side is affected. Either apply the page's selection in the sender, or state the difference and drop "the board and the phone judge … alike".
5. **The sender's "mostly free 304s" (J16 :10223, :10239-10242; Risks :13095-13099) has no evidence behind it.**
   - Each run gets a new GITHUB_TOKEN, and the ETag comes from the previous run's token. The facts cited (:11995-11996, :12257) are about the page's own token, and `Vary: Authorization` is on the answer (`gh api -i …/commits/7b795ad…/status`).
   - Worst case, every read is a counted 200: about one read per run per open own-branch head.
   - 990 desk-notify runs started on 2026-10-19; about 30% of a 100-run sample succeeded, so roughly 300 real runs.
   - That is roughly 300 to 900 reads a day, about 40 an hour. That is far below the guard's trip point, so nothing is silenced. But "a few dozen a day" is unverified: state this bound, or verify the 304 in EXP-006.
6. **AC81 in stage 1a says the project screens' bar goes** (:6191-6198). Its replacement, AC83's "Overview | Timeline" and the Team link from "At work now", is stage 3. Say that stage 3 removes the bar, or the Timeline and Team are unreachable in the trial view during stages 1a to 2.
7. **J24 never says when a failed commits read is retried** (:10994-10998). As written it is never retried at that head while the desk stays open. A Builder who adds a retry in calls of its own makes calls A3 doesn't count, and the margin is only 183.
8. **(ii) asks for the verdict file in J20's list only. review_check reads the checked-out tree, which includes the default branch.**
   - A `reviews/<n>/<id>.md` landed on main would pass review_check but read as missing on the desk. That is the hiding side.
   - Today none exists: the verdict files of the last 12 numbered PRs with a reviewer.md, 80 to 148, are all in their PRs' files (`gh api …/pulls/<n>/files`).
   - The fix costs nothing extra: also count a verdict file that is in the default-branch tree J1 already reads.

**The recount** (question 2): 9,355 − 50 + 250 + 50 + 212 = 9,817, leaving 183. My own count agrees on AC14's assumed busy day:
- At each opening, the per-head verdict calls are 10 × 5 × 5 = 250.
- J24 at openings: 5 pull requests × (3 + 3) pages = 30, over one call's 25, so one more call a project an opening: 50.
- The portfolio: 16 × 12 = 192, plus each opening's first read (10) and its cold blob read (10). Today the portfolio tree holds only ideas/IDEAS.md (`gh api …/git/trees/main?recursive=1`), so one cold blob call is enough.
- First verdict reads and their retries stay inside the counted 288 and 1,440.

So 183 is real on that assumed day. It is safe: 10,000 is our own margin, a tenth of Free's 100,000. Findings 2 and 7 are where it could slip.

**What holds** (checked)
- `GOV_BRANCH=build/definer/s001-desk-v2 GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main`: all 25 PASS, exit 0.
- `spec_check.py status`: OK. `spec_check.py facts --base origin/main`: OK.
- The code citations hold: github.js:626-633, scheduler.js:110-112, :415, :772-799, collect.mjs:113, api.js:108, AGENTS.md:3, OPERATING_MODEL_VERSION 3.5.0.
- #148's 8ef060d and d1d964b are ancestors of e4ccb86's second parent, not its first.
- **Security:**
  - A token-pattern scan of the diff against main found nothing.
  - desk-notify.yml already grants `contents`, `pull-requests`, `actions`, `checks` and `statuses` read, so nothing is widened.
  - The fonts come from the desk itself under `default-src 'self'` (index.html:7).
  - P1 equals G1, and the portfolio is limited to branch, tree and blob reads.
- **Staging:** each stage stands alone, with only findings 6 and 3 as gaps. 1b's wait on CS24, the one-deploy order and CS27 are consistent across the table, the brief and Risks.

**Open questions**
- Does a 304 come back, uncounted, for an ETag obtained under an earlier run's GITHUB_TOKEN? (finding 5)
- Should the sender apply the page's 3-head selection for (i), or should the spec state the difference? (finding 4)

I changed and committed nothing. The scratch worktree is removed (`git worktree list` no longer shows it).
