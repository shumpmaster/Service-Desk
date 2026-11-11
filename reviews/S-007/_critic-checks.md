Verdict: PASS

I read every file in `tests/acceptance/S-007/`, plus `checks/S-007/rubric.md`, `checks/S-007/mutants.md` and `specs/S-007.md`. I ran nothing: the pack holds no `src/` and no `tests/desk/` (the glob for `tests/desk/**/*` finds nothing). So this judges the checks against the spec on paper, not by running them.

**What changed, and whether it is checked: AC13 (spec lines 45–48)**
- `j6-ac13-v6-count.test.mjs:111-156` builds a sample of exactly three cards, as the spec's line 45 says. Each case is checked against what the spec says.
  - **Case (a), skewed raise time:** card A arrives 2026-11-10 10:00 and records 2026-11-11 09:00, as in J6's first worked example.
    - The V6 due time is asserted to be 2026-11-12T09:00 (line 129), and the card is shown at every V6 check moment (line 130), so it is not a V6 miss (line 132).
    - The second figure's due time is asserted to be 2026-11-11T10:00, where the card must be held (lines 133–135).
    - The two figures come out as V6 = [] and held-after-arrival = [A] (lines 154–155).
  - **Case (b), on time:** card B is shown at its due moment (line 139). Its check moments are asserted to stop once its card file leaves queue/ (line 142). Neither figure reports it (lines 140–141).
  - **Case (c), raised before the log:** card C has no log entry. Its raise time is asserted to be `not recorded` and its state "shown at once" (lines 145–147). Neither figure reports it (lines 148–149).
- The id, raise time and state of each card are checked at every check moment of both figures (lines 116–126). That is the check the old line 48 asked for, now inside the last sentence of line 45, as the spec's supersession note says.
- The other J6 and AC13 tests cover the rest of the criterion.
  - The list contains only decision cards (lines 101–109).
  - A raise time far in the future is never a V6 miss, and the second figure reports it (lines 158–172).
  - The clock-independence and nothing-stored test (lines 174–186) moves the process clock between 2020 and 2035. At the moment it uses, a rule that read the clock would give different states, so it would be caught.
  - A failed read gives the flag and no "held" entries (lines 188–198).
- The positive-detection path is exercised, and it is not a test that can only pass. The second figure's use of `statesAt` finds `held` in case (a), and the V6 figure uses the same function. A broken `statesAt` would therefore fail case (a).

**Carried-over criteria, spot-checked against the spec**
- **J2 (notes parsing):** `j2-notes-to-rule.test.mjs:17-34` covers every example in the spec, plus star-italic, level-one heading, heading then bold, a prefix word, and a mention only later in the line. The check that a notes file whose content cannot be read gives no state, not "no notes", is at line 64.
- **J1 (age and day boundary):** it tests 23:59 against 24:00 (lines 43–45) and the exact skew example (lines 109–111). It also covers a far-future raise time, `dor-fail` kind, no entry in a log that was read, a log not read, and a duplicate entry in either order.
- **AC9, AC14 and AC15:** these are compared against a baseline. The baseline file must name an ancestor of HEAD, and it must have been committed with no change under `src/` before it. It must never change afterwards (`baseline-provenance.test.mjs:30-41`). `src/notify/` is diffed against the base commit (`ac14-15-notices.test.mjs:16-21`).
- **AC16, AC17 and AC10:** AC16 and AC17 are covered, including the exact lines and the cases where a failing notes file hides nothing (`ac16-17-failed-reads.test.mjs:62-69`). AC10 allows only one content read for each decision card with a notes file in the tree.
- **Mutant table:** I checked the mappings I could trace, and they hold. M2, M3 and M14 are caught by the J1 and J6 cases named. M20 is caught by the duplicate-entry test in either order (`j1…:87-103`). M21 is caught by the clock tests.

**Weaknesses, none blocking**
1. **The adapter file is not locked.** Every test imports the file `tests/desk/s007-seam.mjs` (`lib.mjs:13-18`), which the Builder writes. The baseline is also recorded through it. A dishonest or mistaken adapter could therefore pass the tests. Only rubric R1 and R9 (`rubric.md:7-12, 50-53`) guard this, and those are Reviewer judgement. This is stated openly in the README, but it is the main route by which a broken build could slip through.
2. **There is no evidence that the mutants were run.** `mutants.md` is a plan. Its mapping looks right for the rows I traced, but I have no kill results.
3. **Some of the AC13 criterion is checked only by the rubric:** "no network" and "works on records from before M4" (rubric R4). The clock test does not cover those.
4. **The J6 helper's rules are not checked against the spec's wording in a separate test.** They are the test's own code (lines 39–82): main line, commit current, arrival, check moments. They match the spec's wording as I read it. The line-142 assertion, that check moments stop when the card file leaves, tests the helper, not the rule. That is harmless but adds no protection.

**Open questions**
- Should the retired `tests/acceptance/S-005/` and `checks/S-005/` be removed or excluded? `P-003-critic-superseded-specs.md` exists but I did not weigh it. A bare `node --test tests/acceptance/` would run S-005's checks against a seam that may not exist.
- Does the Builder's return state the log reader's `duplicates` behaviour? If it is `first` or `last`, the check for "earliest of two entries" (M20) cannot tell a correct rule from a broken one, because the reader hands over only one entry (`j1…:94-95`).