Verdict: PASS

Plan review round 6 of specs/S-001.md: a recheck of draft 6 (7b5b2a7) against draft 5 (7ee7760), under the owner's ruling "Fix, recheck the fixes (Recommended)". That ruling is on file at origin/main b873590 as decisions/questions/P-001-s001-round4.md. I changed no files: the worktree /home/user/sd-def350 is clean and HEAD is still 7b5b2a7. Line numbers below are in specs/S-001.md at 7b5b2a7.

**What this means for the owner:** draft 6 deals with all five of round 5's notes and breaks nothing that passed before. Every check passes. You have nothing to decide. Here is the one rule that was tidied: if one of the automatic job's merged pull requests is ever listed in the plan, it shows on the Timeline like any other listed piece of work. Until the desk has read that merge, it doesn't show anywhere else. No plan line lists one today. Two small wording gaps are left, both about that same case that doesn't exist yet. The Definer can fix them before the freeze; neither stops the merge.

**Checks run** (all rc 0)
- `spec_check.py status`: OK.
- `v3_checks.py trace`: OK. docs/PROJECT.md lists only PR #40, #41, #44, #52, #72, #74, #75 and #77 as sprints.
- `v3_checks.py joins`: OK.
- `v3_checks.py scope --base origin/main`: OK (9 commits, 8 spec-scoped, 1 merge skipped).
- `surface_guard.py diff --range origin/main..7b5b2a7 --branch build/definer/s001-model-3.5.0-records`: OK (9 commits, 1 merge skipped).
- `check_all.sh . b873590368d2e8dfb65e1419e53f0a23cc81e62c`: "OK: all governance checks passed". 25 steps passed, none warned, `record_checks merges` included.
  - It ran on scratch merge 8176a45, a `merge --no-ff` of 7b5b2a7 into b873590 made as shumpmaster <furchken@gmail.com>.
  - Clone: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r6/sd
  - Log: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r6/check_all.log

**Verified**
- **Note 1 is settled.** The plan-listed exception is now carried everywhere round 5 named:
  - the lead (:554-555), AC66 (:3790-3793), J12 (:5398), the Answered entry (:6641-6642) and the brief (:6909-6910);
  - AC59 (:3138) already had it;
  - AC60's test has the new case: a made-up job's merge that a made-up plan line lists under MD3 shows as MD3's sprint, with its merge time among its run's times (:3433-3434). A build that ignores the exception now fails that test.
- **Note 2 is settled.** J12 (:5356-5360) now gives one reading: an entry lacking the field is treated as not yet read. That matches AC60 (:3332-3335).
- **Note 3 is settled.** CS13 (:5976-5979) limits the corrected author name to the one GraphQL gives for commits whose git author is `github-actions[bot]`, and to no other value, recorded in that pull request. I checked that asks_merge.py:76 is `BOT = "github-actions[bot]"`.
- **Note 4 is settled.** J12's test now lists the `#`-ending case and the Signed-off-by mix as the job's (:5494-5496).
- **Note 5 is settled.** Draft 5's note cites decisions/questions/P-001-s001-round4.md (:601-602), and that file exists on origin/main.
- **Nothing that passed before is broken.** The diff touches only:
  - the header line and the lead's heading (:455);
  - the lead (:554);
  - the Draft 5 and Draft 6 notes (:601-617);
  - AC60's last sentence (:3332-3335) and its test (:3433-3434);
  - AC66's link bullet (:3790-3797);
  - J12's key sentence, rule heading and test;
  - CS13;
  - the Answered entry and the brief.

  AC66's round-4 test (:3827-3835) is unchanged and still agrees with the text. #84 is not plan-listed, so its row stays unlinked.
- **The new choice (C) is sound.** A merge J12 has not read can be placed only under a plan line that lists it, and adds no run time. That follows from rules already in the spec:
  - placement by `Milestone:` line and under "Not tied" both need J12's body or merge time (:3304-3312; J12's intro :5310-5313);
  - a run's times use J12's merge times only (:3133-3134);
  - the model's `untagged` list holds pipeline items only, never `PR #` sprints (v3_checks.py:1037-1071), so "nowhere else" is true.

  It hides nothing the owner must act on. A merged pull request waits on no one. The questions and answers it carried keep their own Queue and "Done today" rows. A missing or failed read heals at the next head-change or daily cold read. Pull requests past 300 get the "over 300" line.
- **The Definer's claim about "never a sprint" is confirmed.** I searched the whole file, across line breaks. The phrase is left unqualified only in:
  - AC60's heading (:3313), whose body adds "Except where the plan lists it" (:3326);
  - draft 4's history note (:595).

  The AC66 mention (:3790) is qualified in the same sentence (:3792). Line :3681 ("never a sprint's first bullet") is unrelated.

**Findings**
1. **NOTE: AC60 and AC66 give the wrong label for an unread, plan-listed merge.**
   - AC60 (:3332-3335) says a merge J12 hasn't read, because "its read failed, or it is older than the 300 kept", sits under its plan line with "not recorded in what the desk reads" (J12). AC66 (:3794-3795) repeats that label.
   - J12's awkward cases say otherwise:
     - over 300 gives "not available" (:5438-5440);
     - a refusal, rate limit or network failure gives "not available" (:5441-5442);
     - "not recorded in what the desk reads" is only for a pull request J12 does not hold at all (:5444-5445).
   - The desk can't tell a job's merge apart before reading it, so it must use J12's general labels here.
   - Fix: say "shown as J12's awkward cases show a listed pull request it lacks", or drop the quoted label.
2. **NOTE: AC66's new "plan wins" branch has no test.** AC66 (:3791-3793) now says a job's merge that a plan line lists links to its sprint from "Done today". AC66's test (:3827-3835) covers only the unlisted job's merge. A build that checks "is it the job's?" before "is it listed?" in "Done today" would still pass. Nothing like this exists today, so this is not blocking. Fix: add one plan-listed job's merge, linked, to AC66's test.
3. **NOTE (optional): the plain-English lead to the owner states rule B without the exception.** It says the job's merged pull requests come "off the Timeline once merged" (:462-463) and "no longer show as work on the Timeline" (:475-477). That wording is the owner's ruling, and the exception was already disclosed in Draft 5's note (:608). Adding "unless the plan lists one" would make the lead match.

**Open questions:** none for the owner.
