Verdict: PASS

**What this means for you:** The two desk follow-ups do what the spec asks. When the desk fails to read a project's pull requests, it now waits 5, 10, 20 and 40 minutes between tries, then an hour each time. On a day when those reads fail all day, the desk makes about 5,180 calls against a limit of 10,000. The title change for push deploys is correct, and both pieces of code that read the title accept the old form and the new one. I found nothing that blocks the merge. There are three small notes below, and none of them stops this work.

**Scope reviewed:** the Builder's commits 2170e52 and 914c06d (range 706eb45..914c06d) and the Chief of Staff's commit 2b81fa8, checked against the S-001 amendment of 2026-10-17 (J12, A3, AC14, AC61, AC72, Setup CS14). I worked in a scratch clone: orch/desk-followups with build/builder/j12-backoff merged `--no-ff` as orchestrator (a012aed), at /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/merged. Mutations ran in a separate copy at /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/mut.

**Evidence**
- **Tests and build:** `cd src && npm test` gives 410 pass, 0 fail. `npm run build` gives "build: PASS (2 connected projects; 18 page modules in step)". src/lib/pulls.js and src/lib/scheduler.js match their src/public/lib copies byte for byte.
- **J12's timing and resets**, in src/lib/scheduler.js:176-223 and src/lib/pulls.js:13-23:
  - The waits are `[5,10,20,40,60]` minutes, staying at 60.
  - `pullsDue` returns nothing while `now < j.wait.until`, before any cold or head-change branch, so no read happens during a wait even when the head changes (:180).
  - A RATE_LIMITED answer sets a plain `PULLS_RATE_MS` wait and leaves `step` alone (:196-198).
  - An answer resets `step` to 0 (:209).
  - `step` lives only in `newProjectState` (:87). `persistPulls` still writes only `{day, head, tooMany, pulls}` (:158) and only on an answer, so nothing of the backoff goes to desk-pulls-v1.
  - A failed blob call with J12 attached also counts as a failure (:359).
  - A failed cold-read page clears `j.cold`, so the next read starts again from page 1, as the spec says.
- **AC14's numbers:** the J12-failing day ran with `"pulls": null` and with `data: null`. Each gave 5,180 calls (4,850 polls, 330 blob calls) and at most 50 J12 reads a project, which is 40 after a failed one. The test asserts fewer than 10,000 calls, gaps of at least the backoff within each opening, at most 43 reads after a failed one and at most 53 in all (tests/desk/ac14-budget.test.mjs:141-171).
- **The tests fail when the scheduler is broken.** I used the new pulls.js in every run and changed only the scheduler:

| What I broke | Tests that failed |
|---|---|
| Put back the old scheduler (706eb45) | AC14 J12 ×2 ("J12 read 2 came 1 min after the last") and all 5 backoff tests |
| A rate limit moves the step on | the rate-limit test |
| A rate limit resets the step | the rate-limit test |
| A head change skips the wait | 8 tests, AC14 included |
| An answer doesn't reset the step | the reset test |
| The first wait starts at 10 minutes | 5 tests |
| A rate limit uses the backoff in place of 60 minutes | 2 tests |
| The step is saved to desk-pulls-v1 on failure and loaded back | the reload test |

- **AC61:** the test at tests/desk/ac59-60-61-64-timeline.test.mjs:501 covers the spec's three leniencies (specs/S-001.md:3178-3180): `## Context ##` / `### Why ###`, `Milestone:M2` and `Milestone:none (…)`, and Why before Context with the Milestone line after both. It also checks that J12 keeps the same parts. The two known limits are not pinned, as the spec says. The reader code is unchanged; only the comment at pulls.js:31-36 changed.
- **AC72:** the test at tests/desk/ac69-72-audit-additions.test.mjs:303-337 uses a push run whose `name` and `display_title` (through fake-desk.mjs:62) are both `deploy <sha>`. Its row reads "deploy <sha>: waiting for approval", with no " — ", a link to the run, "Matches PR #77's merge · Reviewer PASS" and both source links. The hand-started run keeps `deploy <sha> — preview redeploy` and is matched through its title. No row offers an approval.
- **No other behaviour change:** the only src diffs are the backoff, its constants and comments, and the removal of `failedCycle`, which nothing else reads.
- **CS14:** desk-deploy.yml:15 is now `deploy ${{ github.event_name == 'push' && github.sha || format('{0} — {1}', inputs.sha, inputs.note) }}`, which is the spec's own example (specs/S-001.md:4937). It parses as YAML. On a push it gives `deploy <sha>`; on a dispatch it gives `deploy <inputs.sha> — <note>`. The header's "(in the run name)" (:6) is still true. I tested both title readers on `deploy <sha40>` and `deploy <sha40> — PR #80`: both match. Both reject a 41st hex character and a 39-character sha. The readers are `TITLE` (now at desk_preview_check.py:29) and feed.js:766 `SHA40`. The docstring (:15-16) names both forms. The commit has no `Spec:` trailer, as CS14 says (specs/S-001.md:5188).
- **Lanes and identities:** `surface_guard.py diff --range 706eb45..build/builder/j12-backoff` passes for 2 commits. The same check on 706eb45..2b81fa8 passes for 1 commit. The builder commits are `builder <builder@agents.invalid>` with `Agent-Session` and `Spec: S-001` trailers and no co-author lines.
- **check_all:** `GOV_BRANCH=orch/desk-followups bash governance/checks/check_all.sh . origin/main` gave 23 PASS and 1 FAIL, the `record_checks merges` step. It flags 51ce253, ca548de and 706eb45, plus my scratch merge, because they are orchestrator commits with no `Item:` trailer. This is the known push-run quirk (reviews/79/reviewer.md:43). When I simulated the owner's PR merge onto origin/main, check_all printed "OK: all governance checks passed."

**Findings**
- **N1 (non-blocking):** one check in the reload test proves nothing. At tests/desk/j12-pulls.test.mjs:421, every read in the first opening fails, so desk-pulls-v1 is never written and the check passes no matter what. The timing checks do catch a step that is saved on the device (mutation M7 above), so nothing is untested in practice. Fix: let the first opening answer once and then fail. Then assert the stored entry holds only `day`, `head`, `tooMany` and `pulls`.
- **N2 (non-blocking; the Definer's, the spec text only):** after 2b81fa8, the preview rule's `TITLE` is at desk_preview_check.py:29, not :28, and the docstring now runs over :15-16. specs/S-001.md:3654 and :5185 still say `:28` (and :5186 says `:15`). Fix: update the line references at the next spec touch.
- **N3 (record):** carry the `record_checks merges` failure from check_all into the build review's record as expected, as reviews/79 did. No branch change is needed.

**Note on my run:** I ran `python3 -m py_compile` on .github/scripts/desk_preview_check.py in /home/user/sd-fu, which creates `.github/scripts/__pycache__`. I then removed that folder with `rm -rf`. If an ignored copy was already there, I deleted it too; it is only a build artifact. `git status` is clean in both worktrees, and their heads are unchanged (2b81fa8, 914c06d).

**Open questions:** none.
