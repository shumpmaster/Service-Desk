Verdict: FAIL

The locked checks are mostly sound: they cover AC1–AC17 and J1–J6, and they compare against a recorded baseline. But I found four broken versions that would still pass, and two claims in `checks/S-005/mutants.md` that I could not support. I read every file in `tests/acceptance/S-005/`, `checks/S-005/` and `specs/S-005.md`. I did not run anything, because there is no seam (`tests/desk/s005-seam.mjs`) or `src/` in this pack.

## Findings that fail the checks

1. **AC17: the "notes file with no recommended word" case is never tested when the log is unreadable.**
   - Spec: AC17 (specs/S-005.md:62) shows a card from a log-less read only if its notes have a recommended word.
   - Tests: `j1-queue-log-to-rule.test.mjs:57-65`, `j3-rule-to-list.test.mjs:62-71` and `ac16-17-failed-reads.test.mjs:78-98` give the notes-less cards no notes file at all. No test combines a failed log with a notes file that is in the tree but has no `Recommendation:` line, no backticked word, or a word that is not one of the card's words (AC6).
   - Broken version that survives: "log not got → show any card whose notes file exists". M14 and M15 in `mutants.md` claim to cover this area, but they don't catch it.

2. **AC2 and J4: the check that the sheet "says the Chief of Staff recommends that word" is too loose to fail.**
   - `ac01-08-hold-and-show.test.mjs:51` and `j4-list-to-views.test.mjs:44` only test `/Chief of Staff/.test(text) && /\bdrop\b/.test(text)`.
   - `Sheet.text` is "the sheet's visible text" (README.md:72), and the sheet already shows the button words and card prose. A build that marks the button but drops the sentence would likely pass.
   - The sentence is part of AC2 (specs/S-005.md:27). The check should match a Chief-of-Staff-and-word phrase, or a baseline-shaped line, that cannot come from the button labels.

3. **The baseline provenance check does not tie the base commit to the main branch.**
   - Spec: "the main-branch commit the build starts from, before any change for this fix" (specs/S-005.md:23).
   - `baseline-provenance.test.mjs:11-36` checks only these things:
     - `baseCommit` is an ancestor of HEAD.
     - The baseline file was added after it.
     - No `src/` change lies between them.
   - A Builder who names a build-branch commit that already holds the `src/` changes passes every test, so the AC9, AC14 and AC15 comparisons would then run against changed code. M32 in `mutants.md` ("baseline re-recorded after src changes") does not cover this.
   - A test is needed that the base commit is on the main line, for example an ancestor of `origin/main` that is not on the build branch only. Alternatively, `src/` at the base commit should be matched to the main-branch tree at the branch point.

4. **`seam.logReader.duplicates` is self-declared by the Builder and cannot be checked.**
   - `j1-queue-log-to-rule.test.mjs:75-90` builds its expected value from that declaration. If the Builder declares `last`, the test expects the later entry.
   - M19 is caught only when the value is `all` (`mutants.md:28`). The spec's rule (specs/S-005.md:80) is "the earliest among the entries the reader returns". The check can't show what the reader returns, so it only verifies consistency with the seam's claim.
   - The rubric (R1) has no item for verifying this claim against `src/lib`. Add one, or lock a reader fact that can be tested directly.

## Smaller issues

- **M2 in `mutants.md:11` is wrong.** "Age clamped at 0" gives the same answer as the correct rule. An age of 0 is under a day, so the card stays held in the same cases, and the J1 skew test (`j1:92-99`) cannot fail on it. The other two variants in that row are caught: "negative age shows at once" and "measured from the read". The row should be corrected, because it overstates what the checks catch.
- **AC8 (M12) depends on the seam actually serving `otherRefs`.** Nothing in the checks, or in rubric R1, requires it. If the seam ignores `otherRefs`, "read notes from any ref" survives. Add an R1 item and a self-check that the seam does serve other refs.
- **AC13 "no network, nothing stored" is untested.** Only the clock is faked (`j6:85-91`). `seam.monitor` is also fed neutral records, not a git commit, so running the rule at a past commit exists only in the rubric (R4).
- **AC10 counts the notes reads in one `read` call only** (`ac09-10-unchanged.test.mjs:65-87`). A read repeated on each sheet open is not exercised. This is minor.
- **Some criteria are covered only by the reviewer rubric:** AC10's static part, AC12, AC18 and AC19. The README says so openly, so I don't count it as a defect.

## What I checked and found sound

- Kind from `<gate>`, including the `dor-fail` versus `dor` case (J1).
- The 24-hour boundary at 23:59 and 24:00, and negative and far-future raise times.
- Every case in J2's line rule, including the two-line cases, other-card words and notes content that can't be read.
- AC1, AC3–AC8, AC11 (multiple moments, a long-open desk, a faked clock and a partial read), AC14–AC16, and the J3–J6 states and flags.
- A missing seam fails every test file at import (README.md:34), so "no seam, no pass".

## Open questions

1. Should the Builder's `logReader.duplicates` and `cardFileForm` statements be checked against `src/lib` by the Reviewer, with an R1 rubric item?
2. Is a tie of the base commit to the main branch possible in CI, or does it need a rubric item for the Reviewer?
3. Does `Sheet.text` include the button labels? That decides how loose finding 2 is.