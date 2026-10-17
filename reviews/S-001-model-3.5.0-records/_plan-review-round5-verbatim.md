Verdict: PASS

Plan review round 5 of specs/S-001.md: a recheck of draft 5 at 7ee7760 (build/definer/s001-model-3.5.0-records, worktree /home/user/sd-def350) against draft 4 at 2cdb884. I changed no files in the worktree or the repo; `git status` is clean in both and HEAD is still 7ee7760. origin/main has moved since round 4, from d727b64 to aad1acb. The two new commits are 038a763 and #87, which files the round-4 question (questions/P-001-s001-round4.md). Neither touches the spec.

**What this means for the owner:** draft 5 fixes the one gap that stopped round 4. A test now checks that the automatic job's merged pull requests show in "Done today" with no Timeline link and the words "not on the Timeline: merged by the automatic job". All five smaller notes are dealt with too, and nothing that passed before is broken. All the checks pass. You have nothing to decide here. Three small wording loose ends remain. The main one only matters if someone one day lists one of the job's pull requests in the plan, which nobody has done. The Definer can tidy them before the freeze; none of them stops the merge.

**Checks run**
- `spec_check.py status`: OK.
- `v3_checks.py trace`: OK. #84 to #87 are not in the model's timeline.
- `v3_checks.py joins`: OK.
- `v3_checks.py scope --base origin/main`: OK (8 commits, 7 spec-scoped, 1 merge skipped).
- `surface_guard.py diff --range origin/main..7ee7760 --branch build/definer/s001-model-3.5.0-records`: OK (8 commits, 1 merge skipped).
- `check_all.sh . aad1acb3cd0518bf789360c3fc0c1c1a9f9f78cc`: rc 0, "OK: all governance checks passed", with `record_checks merges` among them.
  - It ran on scratch merge e7774b5, a `merge --no-ff` of 7ee7760 into aad1acb made as shumpmaster <furchken@gmail.com>.
  - Clone: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r5/sd
  - Log: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r5/check_all.log
- `parse_trailers` script: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r5/pt.py, run with `python3 -I` against origin/main's govlib.py.

**Verified** (line numbers are in S-001.md at 7ee7760)
- **Round 4's blocking finding is fixed.** AC66's test (:3812-3820) now covers a job's merge leaving the queue:
  - before J12 has read it, the row reads "no longer open, time not recorded" with no link and "sprint: not recorded";
  - after J12's read marks it the job's, the row has no Timeline link and reads "not on the Timeline: merged by the automatic job";
  - the question or answer it carried keeps its own row and link throughout;
  - a merge that is not the job's (a description quoting the line mid-text) still links to its sprint.
- **The new test fails a build that links a job-merged row to a sprint.** #84's body is `Milestone: none (…)`, so a build that skipped the job check would put it under "Not tied to a milestone" and link the row. The test's "no Timeline link" plus the exact words fails that build. A build with no link but the wrong words fails too.
- **Choice (a) is sound and hides nothing** (:3779-3782). Until J12 reads a merge, AC60 cannot place it (merged pull requests are placed from J12, :3326-3327), so no Timeline row holds it. It then reads like any unlinked row (AC66 :3792; AC52 :2145-2147), and the text changes after the next J12 read. The owner has nothing to act on. Finding 1 adds one caveat for a pull request a plan line lists.
- **Choice (b) is sound** (:3317-3320, :3128-3129). The plan is the record the model's timeline and AC50 count, so leaving out a sprint the plan lists would make a milestone disagree with its own sprints. No plan line lists one today: the trace above confirms docs/PROJECT.md lists only #40, #41, #44, #52, #72, #74, #75 and #77. It is marked (C) and told to the owner in Draft 5's note (:606-607). It is not yet consistent or tested everywhere; see finding 1.
- **J12's fixture outputs match `parse_trailers`.** I ran govlib.py at origin/main on each case:
  - 21bc250's real message (from git and in its REST form) gives `[('Merged-By','orchestrator'),('Delegation','L-0017'),('Merged-Head','6c34acb6…')]`, as :5450-5451 expects.
  - The mid-text quote gives `[]`; `someone` gives `['someone']`; two trailers give two values; the mixed final paragraph gives `[]` (:5455); the MD3 body gives `orchestrator`.
  - New: a trailer paragraph followed by a `#` line, as its own paragraph or in the same paragraph, gives `[('Merged-By','orchestrator')]`.
  - New: `Signed-off-by: A <a@x>`, `Merged-By: orchestrator` and two non-trailer lines give exactly `[('Signed-off-by','A <a@x>'),('Merged-By','orchestrator')]` (:5458-5460), in either order.
  - The "quarter" rule in the summary (:5385-5389) is right: 2 trailers with 4 other lines is accepted, and 2 with 7 gives `[]`. CRLF gives the trailer.
- **The `desk-pulls-v2` key is named the same way everywhere in the spec** (:604, :5338-5342, :5480, :6888). The J12 test's write-failure case now says "the kept list's key" (:5465). The only `desk-pulls-v1` mentions left are the history notes, past reviews, and src/lib/pulls.js:11, src/public/lib/pulls.js:11 and tests/desk/j12-pulls.test.mjs:431,459, which the Builder changes as part of the work (Areas touched lists src/lib/pulls.js and tests/desk).
- **Notes 4 and 6 are done.** CS13 step 1 names the author check and what happens if the name differs (:5953-5958). Areas touched lists J12 and AC60 (:5824-5825).
- **Nothing that passed before is broken.** The diff touches only:
  - the header line and the lead's heading (:454);
  - Draft 5's note (:599-607);
  - AC59's sentence on run times (:3128-3129);
  - AC60's exception (:3317-3320);
  - AC66's bullet and its test;
  - J12's key, trailer summary, fixture and test;
  - Areas touched, CS13 and the brief (:6888).

  Terms, AC2, AC52, AC14, A3, AC60's test and the quotes in the Answered entry are not in the diff.

**Findings**

1. **NOTE: the "plan wins" exception is stated in AC60 but missing elsewhere and untested.**
   - AC60 (:3317-3320) now says a job's merge that a plan line lists is that milestone's sprint, and its merge time counts toward its run's times.
   - AC66 (:3777-3779) still says every merge J12 marks as the job's has no sprint, so no link and "not on the Timeline". For a listed one, "Done today" would say "not on the Timeline" while the Timeline shows it.
   - AC66's new sentence "no Timeline row holds it" (:3780) is also untrue for a listed pull request J12 has not read yet: the plan's list puts it on the Timeline with "not recorded in what the desk reads" (:5427-5428).
   - "Never a sprint" still has no exception in the lead (:554), J12 (:5381), the Answered entry (:6619) and the brief (:6885).
   - Neither AC60's test (:3424-3430) nor AC59's covers a listed job merge, so a build that ignores the exception passes.
   - Nothing like this exists today, and nothing is hidden from the owner, so it is not blocking.
   - Fix before the freeze: in AC66, add "unless a plan line lists it: then its sprint"; qualify "never a sprint" where it is repeated; and add one made-up listed job merge to AC60's test.
2. **NOTE: J12's "lacks the field" sentence can be read two ways** (:5340-5342). "Placed as AC60 places a merge J12 lacks" could mean not placed at all, as AC66 :3780 assumes, or "placed by the rules above" like any merged pull request (:3325-3327). Under the new key the case should not happen, because a `null` merge commit is a "no" (:5397). One clause saying which reading is meant would settle it.
3. **NOTE: CS13's "the Builder corrects J12's author check"** (:5955-5956) lets the author name change with no limit. It should say the corrected value is the name GraphQL gives for those same commits, whose git author is `github-actions[bot]` (asks_merge.py:76), and that the pull request records it.
4. **NOTE: J12's test names the two new cases only through its "agrees for every message" clause** (:5476-5477). Listing "the `#`-ending and the Signed-off-by mix are the job's" next to the cases that are not would make the coverage explicit. Optional.
5. **NOTE: the owner's round-4 ruling is not yet on file.** Draft 5's note (:600) quotes "Fix, recheck the fixes (Recommended)" with no source. At aad1acb, questions/P-001-s001-round4.md is still open and decisions/questions/P-001-s001-round4.md does not exist. The Chief of Staff should file the answer record before this merges, so the quote has a record behind it.

**Open questions:** none for the owner.
