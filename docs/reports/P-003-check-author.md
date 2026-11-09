I've written the locked checks for S-005, but none of them has been run, and they aren't committed to `build/check-author/P-003`. I have no shell here and the folder isn't a git repository, so I couldn't run Node or git. Nothing can pass until the Builder writes the seam adapter and records the baseline (part 5).

**1. What I changed** (all new files, inside my lane)
- **`tests/acceptance/S-005/`** holds the locked checks:
  - **Join tests:** six real-on-real test files, one per join, marked `join-test: S-005/J1` to `J6`. The J6 file also covers AC13.
  - **Criteria tests:** five files covering AC1–AC11 and AC13–AC17.
  - **Baseline-provenance test:** checks that the recorded baseline names the base commit, was committed before any change under src/, and was never re-recorded.
  - **Support files:** shared helpers (`lib.mjs`), the shared baseline inputs (`scenarios.mjs`), a recorder the Builder runs at the base commit (`record-baseline.mjs`), and `README.md`.
- **`checks/S-005/rubric.md`:** a Reviewer rubric for what a test can't fully check. It covers the access side of AC10, plus AC12, AC18, AC19, mark and line style, and a check that the adapter does no logic of its own.
- **`checks/S-005/mutants.md`:** 32 deliberately broken versions, each naming the test that must catch it (the D-046 measure).

**2. Why**
- **Duties:** my role writes the locked checks from the frozen spec before any work exists, with a join test per join.
- **The adapter (seam):** I can't see src/, so the tests can't name the desk's code. They reach it through one adapter the Builder writes at `tests/desk/s005-seam.mjs`. It turns neutral test records into the desk's real inputs and reports what the real code returns. Its contract is in the README.
- **Baseline inputs:** the inputs live in my lane and are shared by the recorder and the tests, so "the same inputs" holds by construction.
- **Not a fix-spec job:** S-005 says `work-type: fix` but has no `fixes:` line, and the owner's ruling record isn't in my pack. So I didn't do the fix-spec duty. Instead, AC3 includes the reported defect as a regression case: section 5 names `re-specify`, the notes recommend `drop`, and only `drop` may be marked.

**3. What I verified**
- **Not done:** I couldn't run `node --test tests/acceptance/S-005/`, any git command, or the mutant runs.
- **Done by hand:** I checked each expected value against the spec's worked examples: J1's clock-skew times, J2's thirteen line examples, and both J6 worked examples traced through the sample history (case (a): not a V6 miss, reported as held a day after arrival; case (b) and the old-log card: neither figure).
- **Still needed:** the first real run, and the mutant runs, before the checks are relied on.

**4. What is undone**
- Commit on `build/check-author/P-003` with an `Agent-Session:` trailer and `Spec: S-005`.
- Any run of the checks, including the mutant runs.
- The hidden holdout set, which isn't my lane.

**5. What is needed outside my lane**
- **Builder:**
  - Write `tests/desk/s005-seam.mjs` to the README's contract. It must also work on the base code for `openDesk`, `openSender().run` and `senderFromLists`.
  - Run `record-baseline.mjs` at the base commit, then commit `tests/desk/S-005-baseline.json` before touching src/.
  - Fill in `logReader` and `cardFileForm` in the seam. The spec says the Builder states the log reader's field names "in the J1 test", but that file is locked, so I moved the statement into the seam.
- **CI:** run `node --test tests/acceptance/S-005/` with full git history (`fetch-depth: 0`).
- **Reviewer:** apply `checks/S-005/rubric.md`, especially the item requiring the adapter to carry no rule logic.
- **Orchestrator:** the brief's "path set at freeze" for the locked checks needs recording. I used `tests/acceptance/S-005/` and `checks/S-005/`.

**6. Open questions**
1. Should S-005 have had a `fixes:` header? If yes, I need the ruling record (decisions/questions/P-001-card-recommendation.md) to write the defect's check under its copied criterion.
2. The adapter contract fixes an interface the spec doesn't name. Is that acceptable, or should it go to the owner as a criteria question?
3. The not-on-list checks (AC15, J4) compare the card sheet's visible text exactly with the baseline. If today's sheet shows anything time-dependent, they will fail for the wrong reason.
4. AC9's Home-count comparison assumes Home counts each queue item once. I couldn't confirm that without src/.
5. AC10's "same credential" check depends on the adapter reporting a hash of the credential sent with each request. Is that an acceptable thing to ask of it?