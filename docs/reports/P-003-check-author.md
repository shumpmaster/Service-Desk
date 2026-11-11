I've written the locked checks for S-007, but none of them has been run, and nothing is committed. I only had file read/write/search tools here, with no shell, Node or git, and this folder isn't a git repository.

**1. What I changed**
- I added a new folder, `tests/acceptance/S-007/`, with 15 files:
  - one test file for each join sheet, each marked `join-test: S-007/J<n>` for J1 to J6;
  - test files for AC1–AC8, AC9–AC10, AC11, AC14–AC15 and AC16–AC17;
  - a check that the baseline file was recorded properly;
  - the baseline recorder, the shared inputs, helpers, and a README that sets out what the Builder's adapter must provide.
- I added `checks/S-007/rubric.md`: a checklist for the reviewer covering the criteria a test can't fully check (AC10's static part, AC12, AC13's static part, AC18, AC19, "one rule in one place", and that the locked checks and baseline are untouched).
- I added `checks/S-007/mutants.md`: 37 deliberately broken versions, each tied to the test that must catch it.
- I left the existing S-005 checks alone, since they are locked.

**2. Why**
- The spec is frozen. Its header says `work-type: fix` but has no `fixes:` line, so I wrote a complete set of checks for it rather than a single defect check.
- **AC13, the one criterion S-007 changed, now has three cases.** The test builds a sample main-branch history and works out J6's check moments from it. At each moment it runs the real rule through the adapter and checks each card's id, raise time and state. It then checks both figures:
  - V6 held-too-long: none;
  - held a day after reaching the main branch: case (a) only.
  - Case (a) is J6's first worked example: the card arrives at 2026-11-10 10:00, its log entry records 2026-11-11 09:00, it is held at 2026-11-11 10:00 and shown at 2026-11-12 09:00.
  - Case (c) is reported as `not recorded`, shown at once, and in neither figure.
- **Where I tightened the checks compared with S-005's:**
  - the V6 due time comes from the raise time the rule reports, so it is always the rule's own pick;
  - the monitoring run must exclude gate cards and keep nothing between runs;
  - AC2's "says the Chief of Staff recommends that word" is checked properly, not by any mention of the word;
  - new sender sequences cover a card first shown after a day, and a card leaving the list because its notes couldn't be read;
  - a failed notes file for a card no longer in queue/ must hide nothing;
  - new J2 cases: `# Recommendation:`, `## **Recommendation:**`, and a word that only matches the start of a card word.

**3. What I verified**
- I read the spec, the playbook, the README of locked tests and every S-005 check file.
- I searched the S-007 folder: all six join marks are present, and nothing imports S-005.
- I checked every import against what the helper file exports.
- I traced each J6 check moment and expected state by hand, including that M3 (`>` instead of `>=`) makes case (b) a V6 miss, so it gets caught.
- I could not run `node --test`, and could not test the broken versions against a build, because no build exists yet.

**4. What is undone**
- Committing to `build/check-author/P-003` as `check-author <check-author@agents.invalid>` with the `Agent-Session:` trailer. I had no git, and I don't know the session id.
- A first run of the suite and of the broken versions once the Builder's adapter (`tests/desk/s007-seam.mjs`) and the baseline file exist.

**5. Needed outside my lane**
- **Orchestrator:** commit these files on my build branch with my identity and session id, and record the "path set at freeze" as `tests/acceptance/S-007/` plus `checks/S-007/`.
- **Builder:**
  - write the adapter at the base commit (README, "The seam contract"), with the card sheet's text split into its visual lines;
  - run `record-baseline.mjs` and commit `tests/desk/S-007-baseline.json` before any change under src/.
- **CI:** run with full git history (`fetch-depth: 0`).

**6. Open questions**
1. I read J2's strip rule as allowing heading marks followed by bold marks (`## **Recommendation:**` gives `drop`). If the spec meant only one kind of mark, that test is stricter than intended.
2. J5 says a held card "is not on the list" the sender takes, but J3's list carries held cards with the state `held`. The tests accept either, as long as no held card is notified or listed as shown.
3. The AC2 test needs a line naming the Chief of Staff and saying "recommend", with the word on that line or the next. The spec doesn't fix the wording, so the Builder should know this is what's checked.