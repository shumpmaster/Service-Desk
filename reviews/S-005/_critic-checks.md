Verdict: FAIL

I read S-005 and every locked check. Almost everything is sound, but one gap lets a broken build pass. Nothing could be run: the pack has no `src/` and no seam (`tests/desk/s005-seam.mjs`).

**Blocking finding: nothing independent fixes the base commit.**
- `baseline-provenance.test.mjs:11-35` takes `b.baseCommit` from the baseline file. `record-baseline.mjs:16` takes it from `seam.baseCommit`, and the Builder writes that seam (README.md:114).
- The only checks on it are that it is an ancestor of HEAD, that no `src/` change falls between it and the commit that added the baseline, and that the baseline file is unchanged afterwards.
- `ac14-15-notices.test.mjs:16-19` ("src/notify/** is unchanged") diffs against the same self-declared commit.
- A build can therefore declare a recent commit as the base and re-record the baseline from changed code, with the baseline file committed after the declared base. All three checks still pass.
- That defeats AC9, AC14, AC15 and the "no change under `src/notify/**`" guard. Mutants M31 and M32 in `mutants.md:40-41` are claimed caught, but a mutant that moves the base commit survives.
- Fix: the locked checks should anchor `baseCommit` independently, for example equal to `git merge-base origin/main HEAD` or to a commit hash fixed at freeze. The spec header says no hash exists yet (`specs/S-005.md:3`), so this is for the check author or a new spec.

**Non-blocking gaps (the first three are in the tests; the last concerns the mutant table):**
- `tests/acceptance/S-005/ac16-17-failed-reads.test.mjs` never fails the queue and the log together.
- It also never tests AC17 with a notes file that has no recommended word while the log fails. AC6 combined with AC17 is spec-implied (`specs/S-005.md:31`, `:62`).
- AC13's "runs on records from before M4 was live" (`specs/S-005/spec:45`) has no test.
- AC12, AC18 and AC19, and the static part of AC10, are covered only by the rubric (`checks/S-005/rubric.md`). That is a manual Reviewer review, not a locked check, and a reviewer who skips it lets a broken build through.
- The mutants table (`checks/S-005/mutants.md`) has never been run. I traced M1–M30 to specific tests by reading them and found each caught, so the claim holds on inspection only.

**Checks that hold up:**
- **Boundaries and skew:** J1 tests 23:59 vs 24:00, negative age (09:58), 09:59 vs 10:00 the next day, and a far-future raise time (`j1-queue-log-to-rule.test.mjs:38-108`).
- **Notes line:** J2 has 13 table cases for the `Recommendation:` line, plus tests for another card's notes and unreadable notes content (`j2-notes-to-rule.test.mjs:16-65`).
- **Views and failed reads:** J3, J4 and J5 cover the views and the sender, and AC16 and AC17 cover failed reads, including the exact line text.
- **The reported defect:** AC3 reproduces it, with section 5 saying `re-specify` and the notes saying `drop` (`ac01-08-hold-and-show.test.mjs:59-71`).
- **No clock, no memory:** AC11 and the AC13 clock test move the process clock.
- **AC10 reads:** AC10 counts new reads exactly and checks origin, method and credential (`ac09-10-unchanged.test.mjs:65-87`).

**Open questions:**
1. How should `baseCommit` be anchored, and does that need a new spec, since the checks are locked once frozen (README.md:5-6)?
2. Should the rubric items (AC12, AC18, AC19, AC10's static part) be recorded as reviewer-only coverage in the Build gate case, so the owner knows no test guards them?
3. Is the first `card` entry the right pick when the log holds two entries for one card? This is the spec's own open question 6, and the checks follow whatever the seam reports (`j1…test.mjs:75-90`).