I made no changes. The four findings stay open, and the reason is the pack.

None of the files I'm asked to revise are in this folder. Nothing exists under `tests/acceptance/` or `checks/`. That means no `README.md`, no `mutants.md`, no rubric and none of the test files the review cites (`j1-…`, `j3-…`, `j4-…`, `ac01-08-…`, `ac09-10-…`, `ac16-17-…`, `baseline-provenance.test.mjs`). The pack holds only the brief, the review, `specs/S-005.md`, the playbooks and the library.

I can't edit files I can't read. Writing new tests blind against a seam whose contract is in the missing README would be guesswork, and it could break the "missing seam fails at import" property the critic confirmed.

**1. What I changed**
Nothing.

**2. Why**
The checks under revision are missing from the pack. Writing replacements from guesses would produce checks that don't match the seam contract, in a lane where locked tests are R3.

**3. What I verified**
- I searched the whole pack (`**/*`, then `{specs,tests,checks,governance,joins}/**/*`). Only `specs/S-005.md` exists in those folders.
- I read the review and the spec in full. Each finding matches the spec text it cites: AC2 at line 27, the base-commit definition at line 23, AC6 and AC17 at lines 31 and 62, J1's duplicate rule at line 80.
- I ran no tests; nothing here can be run.

**4. What is undone: all of it.** This is the revision I would make once I have the files:
- **Finding 1 (AC17 with AC6):**
  - In the AC16/17 test, plus the J1 and J3 tests, add cases where the log read fails and each card has a notes file in the tree but no recommended word:
    - no `Recommendation:` line;
    - the word without backticks;
    - a backticked word that isn't one of the card's words;
    - `` `Drop` `` (wrong case);
    - a prose line that only mentions `Recommendation:`.
  - Expect: none of those cards on the list, the AC17 line shown, no notice sent. A card with a valid word, in the same records, is still shown.
  - In `mutants.md`, add the mutants "show any card whose notes file exists" and "…whose notes have any backticked word", and correct M14 and M15.
- **Finding 2 (AC2 and J4, the sentence check):**
  - Replace the two loose regexes with a phrase that requires "Chief of Staff", "recommend" and the word in one sentence (no full stop or line break between them).
  - Add a control: the same matcher run on a `shown, no recommendation yet` sheet for the same card must not match. That proves the button labels alone can't satisfy it, whatever `Sheet.text` includes.
  - Use a card whose words don't appear in its prose.
- **Finding 3 (base commit not tied to main):** add a test that the base commit is an ancestor of `git merge-base HEAD origin/main`. If `origin/main` can't be resolved the test fails rather than skips, and the message asks for a full-history fetch. Also add a rubric item for the Reviewer to check the same thing by hand.
- **Finding 4 (`duplicates` is self-declared):** in J1, call the real log reader through the seam on a two-entry log, in both orders. Work out the expected value from what it actually returns (the earliest of those), not from the Builder's `duplicates` claim. Add an R1 item: the seam's reader is imported from `src/lib`, not reimplemented, and the declaration matches the code.
- **Smaller issues:**
  - Mark M2's "age clamped at 0" as an equivalent mutant that no check can catch.
  - AC8: add a check that the seam really serves `otherRefs` (the same notes placed on main must show the word), plus an R1 item.
  - AC13:
    - make `fetch` and network calls throw;
    - check that nothing is written;
    - add a temporary git repo fixture with records at two commits, and run the rule at the older one.
  - AC10: count the notes reads across two reads and repeated sheet opens; it should be one per card per read.

**5. What is needed outside my lane**
- The Orchestrator should re-issue this task with a pack that holds the current `tests/acceptance/S-005/**` and `checks/S-005/**`, including the README and rubric.
- Finding 3 needs CI to fetch `origin/main` with full history. CI config is R3, so that needs the owner's approval, or the fallback is a Reviewer rubric item only.

**6. Open questions**
1. My role says never edit a check once locked; a new spec supersedes it. The review's FAIL verdict suggests these checks aren't locked yet. If they are already locked, the revision has to go through a superseding spec, not edits to the files. Which is it?
2. The review's own question 3 (does `Sheet.text` include the button labels?) needs the README. The control in finding 2 makes the answer matter less.
3. Can CI see `origin/main` with its history, or should finding 3 fall back to a rubric item only?