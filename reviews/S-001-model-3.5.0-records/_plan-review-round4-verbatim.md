Verdict: FAIL

Plan review round 4 (a recheck of draft 4 only) of specs/S-001.md at 2cdb884 (build/definer/s001-model-3.5.0-records, worktree /home/user/sd-def350). I changed no files. To see origin/main I ran `git fetch origin` in the worktree, which moved its remote-tracking refs to d727b64; nothing else there was touched. Scratch clone and merge: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r4/sd; check_all log: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r4/check_all.log.

What this means for you: draft 4 builds your answer B as you chose it. Once merged, the job's pull requests come off the Timeline. While open, they still show as waiting on you. The questions and answers they carry still show in the Queue and in "Done today", and the desk makes no extra requests. Answer A changes nothing that is built. All the checks pass. One gap must be fixed before the freeze: "Done today" changes for the job's pull requests, but nothing tests that change. Five smaller notes follow.

**Checks run**
- `spec_check.py status`: OK.
- `v3_checks.py trace`: OK.
- `v3_checks.py joins`: OK.
- `v3_checks.py scope --base origin/main`: OK (7 commits, 6 spec-scoped).
- `surface_guard.py diff --range origin/main..2cdb884 --branch build/definer/s001-model-3.5.0-records`: OK, 7 commits, 1 merge skipped.
- `check_all.sh . origin/main` on a scratch `merge --no-ff` of 2cdb884 into origin/main (d727b64), made as shumpmaster <furchken@gmail.com>: rc 0, "OK: all governance checks passed", `record_checks merges` included.

**Verified**
- **Quotes match the records.**
  - Both line 1s, in the Answered entry (S-001.md:6572-6586) and Facts relied on (:6111-6117), match decisions/questions/P-001-asks-merge-on-desk.md:1 and P-001-cos-sessions-on-desk.md:1 word for word.
  - B's option text "as put" (:6576-6578) matches the record exactly.
  - The picks "B. Off the Timeline (Recommended)" and "A. Team screen only (Recommended)" match in the lineage, the Draft 4 note (:588-595), the AC60 and J12 headers, and the answer records.
  - Lines 2 and 3 are Proxy: and `Milestone: MD2`, as the Answered heading says.
  - #85 is 7d634d9 and #86 is d727b64. Both are github-actions[bot] merges with `Merged-By: orchestrator`.
- **Nothing you must act on is hidden.**
  - Terms, AC2 and AC52 are unchanged. The lead (:456-477) tells you the "waiting on you" while open stays, and why.
  - No stale "until you answer" wording is left; only the earlier drafts' history notes mention the open questions.
- **A changes nothing built.** AC22, AC23, J10, J13 and AC49 are not in the diff.
- **The selection is right in shape.**
  - REST gives 21bc250 `commit.author.name` = "github-actions[bot]" and `author.type` = "Bot". `git show` gives the same %an (the committer is "GitHub").
  - GraphQL's `GitActor.user` is a `User`, and a bot is not one. So `author { user { login } }` would be null here, and `author { name }` (the git author name) is the right field.
  - `mergeCommit { oid message author { name } }` is valid against GitHub's documented schema (`Commit.message`, `Commit.author: GitActor`, `GitActor.name`).
  - Live check: **unverified**. `gh api graphql` answers 403 ("GitHub GraphQL is not available from Claude Code sessions"), and the schema downloads were refused as well. J12 already marks this "Not known yet (C) … Setup CS13's recording confirms it" (:5382-5384); see note 4.
- **The trailer rule matches the model.**
  - It matches `govlib.parse_trailers` (govlib.py:660), the case-insensitive key match in `trailer_values` (govlib.py:730), and `merged_by_problems` (asks_merge.py:371-382: the BOT author at :76, and `trailer("Merged-By") != ["orchestrator"]` at :381).
  - It matches S-033 AC4 (S-033:124).
  - `parse_trailers` on 21bc250's message gives exactly the list J12's fixture expects (:5420-5421).
  - The not-the-job's cases are correct. A wrong author fails `record_checks merges`, so it shows red in CI.
  - #84's body has `Milestone: none (…)`, as AC60's test assumes.
- **The request count is unchanged.** The fields ride the one fixed query (src/lib/github.js:31), and GraphQL's cost counts connections, not fields. A3's added sentence and the untouched AC14 agree. The size note matches the data: 79 merged descriptions total 129,359 characters today, the largest 5,655.
- **The model's timeline is unaffected.** `v3_checks trace` lists no #84, #85 or #86, so "never a sprint" does not conflict with what J11 reads.
- **No earlier pass is broken.** The diff touches only the lead, the asks-merge note, Draft 4's note, AC59, AC60, AC66, J12, Areas touched, Facts relied on, A3, the open questions and the brief.

**Findings**

1. **BLOCKING: AC66's change has no test, but the spec says it does.**
   - AC66's "Done today" link changed (:3766-3768): a job-merged pull request's row gets no link and reads "not on the Timeline: merged by the automatic job".
   - AC66's `ac-test` (:3781-3798) was not extended, and neither J12's nor AC60's added cases cover it.
   - Yet the Answered entry says "AC66's 'Done today' link, with their tests" (:6580), and the brief lists AC66 under the job's merges (:6841).
   - As written, a build that links such a row to a sprint that no longer exists passes every locked check.
   - Fix: add the case to AC66's test, with a job's merge seen leaving the queue. Optionally say what the row shows while J12 has not yet read that merge (AC60's C rule, :3303-3305, already places it as any pull request until then).
2. **NOTE: J12 sums up `parse_trailers` in fewer rules than it has (:5359-5360).**
   - J12 describes it as "the last paragraph after the title, every line of it a trailer or a continuation". The real function also:
     - normalises CRLF;
     - drops trailing `#` comment lines;
     - accepts a final paragraph that holds a git-generated line (Signed-off-by, "(cherry picked from commit …"), when at least a quarter of it is trailers.
   - Checked: `T\n\nbody\n\nMerged-By: orchestrator\n\n# heading` gives `[('Merged-By','orchestrator')]`.
   - The binding phrase "as the model's `parse_trailers` finds it" and the agreement test cover this only for the messages in the fixture.
   - Add a `#`-ending message and a Signed-off-by mix to the made-up cases, or say the summary is partial. No merge commit on origin/main holds a CR.
3. **NOTE: the kept list keeps its key, `desk-pulls-v1` (:5316).**
   - Entries kept before the build carry no yes or no. Unless the reader treats a missing field as "not yet read", the job's merges stay on the Timeline until the next head change (the newest 100) or the day's cold read.
   - Say how a missing field is read, or move the key on, as J6 does for the blob cache.
4. **NOTE: CS13 (:5906-5918) doesn't name the author check.** J12 relies on Setup CS13 to confirm `author.name`. The confirmation does happen, because the swapped-in real recording must still pass J12's "#84's merge is the job's" test. CS13 step 1 could say so outright. If the name ever differs, the job's merges simply stay on the Timeline (answer A's behaviour), so nothing is hidden.
5. **NOTE: a plan-listed job merge gets two rules.** AC60 says such a merge is "never a sprint" and gives "no part of a run's times", but also that a plan line naming one "still lists it" (:3312-3313). That leaves open whether a listed one counts toward its run's times. No plan line names one today. Say which rule wins.
6. **NOTE: Areas touched's test list (:5788-5789) names neither J12 nor AC60**, yet both get the new cases. This is not a scope problem: tests/desk is the binding area.

**Open questions:** none for the owner. GraphQL's `author.name` stays unverified from here until Setup CS13 runs (see Verified and note 4).
