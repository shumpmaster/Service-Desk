I've frozen S-005. I couldn't make the commit: this folder isn't a git repository, so there is no commit or hash yet.

## 1. What I changed
I made three edits to `specs/S-005.md` and changed nothing else:
- **Header:** `status: draft` became `status: frozen`. `frozen_at` now points to the freeze commit on `build/definer/P-003` instead of `—`, and says the hash is recorded at merge.
- **Criteria heading:** "for the owner's approval on the scenario card, not yet approved" became "owner-approved, decisions/P-003/criteria-9.md, "proceed"".
- **Builder's brief:** `frozen @ —` became `frozen @ the freeze commit named in the header`.

No criterion, join sheet, fact or risk changed. The spec is the same length as before.

## 2. Why
- The ruling in `decisions/P-003/criteria-8.md` asked for every fact under "Facts relied on" to cite a path and line before the freeze, with no criterion changed. The spec already does this (its line 11 records it).
- The plan review (`reviews/S-005/plan.md`) passed with nothing blocking.
- The owner then approved the criteria in `decisions/P-003/criteria-9.md` ("proceed"). That leaves only the freeze to do.
- This is not a stage-4 defect fix: no ruling record has a `Fixes:` line. So there were no criteria to copy from another frozen spec, and S-005 is frozen as it stands. Its existing "## The defect" section, naming `decisions/questions/P-001-card-recommendation.md`, stays.

## 3. What I verified
I read the files with Read, Grep and Glob; no command could be run.
- **Ruling order:** stop-7 ("criteria-wrong", answered by S-005 superseding S-004), then criteria-8 ("recycle", facts given lines), then criteria-9 ("proceed").
- **Spot-checked citations, all matching:**
  - `docs/projects/P-003.md` lines 15, 21–23, 34, 40, 46, 89, 103–113, 120 and 133.
  - `docs/PROJECT.md` lines 588 and 616.
  - `library/facts/F-cf-02.md` lines 4 and 15, grade A at line 5.
  - The two library patterns cited, each grade B at line 5.
  - `specs/S-004.md` lines 161 and 164. These exist in my pack, so the reviewer's non-blocking finding 1 doesn't apply here.
- **Header:** `milestones: M4` matches `docs/projects/P-003.md:46`.
- **Areas touched:** present (`src/lib/**, src/public/**, tests/desk/**, docs/handover/**`).
- **Not re-checked:** the reviewer's citations into `research/P-003-sizing-findings.md:41`. That file isn't in my pack.

## 4. What is undone
- **The freeze commit:** it still needs to go to `build/definer/P-003` as `definer <definer@agents.invalid>`, with an `Agent-Session:` trailer. Its hash then needs recording as `frozen_at` at merge.
- **A stray empty file:** `specs/S-005.facts.tmp` is in my lane, but I had no way to delete it. It should be removed before or with the freeze commit.

## 5. Needed outside my lane
- **Whoever commits:** make the freeze commit, record its hash and delete `specs/S-005.facts.tmp`.
- **Check author:** lock the checks for S-005 and set their path. The Builder's brief says "path set at freeze".
- **Owner (via the Chief of Staff):** carry these risks into the Build gate: the board and notifications show no line when a read fails (open question 5), and the no-mark half of V6 can't be counted after launch (open question 4).

## 6. Open questions
- Should `frozen_at` hold the freeze commit's own hash, which can only be known after the commit, or the base commit it was frozen from? I left a pointer rather than invent a hash.
- The reviewer asked whether the Builder stating the J1 field names should become a Build-time return item that the Reviewer checks. It is a Build-gate matter now; I changed nothing for it.
- The spec's six owner questions stand as written. None needed a ruling before freeze.