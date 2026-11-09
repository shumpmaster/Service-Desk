Verdict: FAIL

I could not run any of the checks. The pack has no `src/`, no `tests/desk/`, no seam (`tests/desk/s005-seam.mjs`) and no `package.json`. So I judged the checks by reading them, not by running them against a good build or against the mutants. I read all 12 files under `tests/acceptance/S-005/`, `checks/S-005/mutants.md` and `checks/S-005/rubric.md`.

## Findings

**1. The stated run command probably includes helper scripts, which would make a good build fail (blocking).**
- `tests/acceptance/S-005/README.md:7` says to run `node --test tests/acceptance/S-005/`.
- That folder also holds `record-baseline.mjs`, `lib.mjs` and `scenarios.mjs`, which are not tests.
- As I recall, Node 20 runs every `.mjs` file in a directory you name. If so, `record-baseline.mjs` runs as a test. Its guard at lines 19–21 throws once `src/` differs from the base commit, so every build that changes `src/` fails.
- Under Node 22 and later, a bare directory argument may match nothing or error. I could not check which Node version applies; the README only says "Node 20+".
- Fix: name the files in the run command, or move the helpers out of the folder.

**2. The count (`seam.monitor`) is never compared with the rule (`seam.ruleList`) (non-blocking, but a real gap).**
- `j6-ac13-v6-count.test.mjs` checks the monitor's states only for the three sample cards A, B and C at chosen moments.
- No test asserts that the monitor and `ruleList` give the same state for the same records and moment. The spec says AC13's count is "the one rule" (J6).
- A separately written monitor could drift on `shown, recommended <word>` states, notes handling or the failed-read flags and still pass.
- `shown, recommended` is never asserted in J6 at all.

**3. The "says the Chief of Staff recommends that word" checks are too loose.**
- `ac01-08-hold-and-show.test.mjs:51` and `j4-list-to-views.test.mjs:44` only test that the sheet text matches `/Chief of Staff/` and `/drop/`.
- The word "drop" is also the button label, so that test passes with or without the sentence AC2 requires.
- Mutant M23 ("card sheet drops the mark") is therefore only caught for the no-recommendation mark, not for the recommended-word statement.

**4. Mutant M19 depends on a declaration by the Builder.**
- `mutants.md:28` catches "latest of two entries picked" only when `seam.logReader.duplicates` is `'all'`.
- In `j1-queue-log-to-rule.test.mjs:79–82` the expected raise time is computed from the Builder's own declaration. With `'first'` or `'last'`, picking the wrong entry cannot be told apart.

**5. The baseline and the seam are Builder-written and only partly guarded.**
- `baseline-provenance.test.mjs` proves commit order only: the baseline was added after the base commit, with no `src/` change before it, and was never changed afterwards.
- It cannot prove the JSON was produced by base code, and the seam itself is not locked.
- The seam's honesty rests on rubric R1, which is a human review step. That is acceptable only if the Reviewer actually applies it.

**6. Smaller gaps.**
- A log that was read but is empty (`log: []`) is not tested against the "log not got" path (AC7 versus AC17). The J6 sample's first commit has `log: []` but never runs the monitor.
- J2 never combines heading, bold and italic marks (such as `## **Recommendation:**`), though the spec strips them in sequence.

## What the checks do well
- J1 pins the strict edge exactly: held at 23:59 and shown at 24:00, with the 10:00 skew example.
- J2 covers 13 line-form cases, plus wrong-card notes and a notes-content read failure.
- AC9, AC14 and AC15 compare against a recorded baseline, as the spec's "baseline run" definition requires.
- AC11 moves the process clock and also checks a desk left open for hours.
- The mutant table maps M1–M32 to tests that, on a reading, would fail for each.
- The criteria that tests cannot fully check (AC10 static part, AC12, AC18, AC19) go to the rubric.

## Open questions
1. Which Node version does CI use, and does `node --test <dir>` run `record-baseline.mjs` there? This decides whether finding 1 is blocking.
2. Will the Reviewer check the seam against rubric R1, since the seam is neither locked nor covered by a mutant?
3. Can a monitor-versus-rule equality test be added through a new superseding check? The locked checks cannot be edited.