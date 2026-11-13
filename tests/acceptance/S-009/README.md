# S-009 locked checks and baseline cases

Written by the Check author from specs/S-009.md (frozen), before any work exists. Locked: never
edited once committed; a new spec supersedes them.

- `cases/baseline/*.json`: the **baseline cases** (spec line 23, J7 lines 149-162). These, and only
  these, are the cases the session runs the adapter on at the base commit to make
  reviews/S-009/baseline/record.json; the record must hash each of them, by its path from the
  repository root (for example `tests/acceptance/S-009/cases/baseline/S009-B-desk-ok.json`), and hold
  one result for each.
- `s009-j7-baseline.test.mjs`: line 23's locked check (`join-test: S-009/J7`): the record and note,
  hashes, coverage, the poison run, then the built code against the record.
- `s009-case-set.test.mjs`: J7's list, the twin rule and the open-card rule, on the case set.
- the other `*.test.mjs`: the criteria and join sheets on the built code, through the adapter with
  cases written inline (their ids start `S009-X-`; they are not baseline cases and are not in the record).
- `s009-lib.mjs`: shared helpers.

Run: `node --test tests/acceptance/` (or `node --test tests/acceptance/S-009/*.test.mjs`) from the
repository root. Until the adapter exists the build checks fail with "output does not exist yet";
until the record exists line 23's check fails with "baseline record not there yet".

## Open points (for the Critic and the session; not resolved here)

1. AC13, J6: the spec fixes no entry point for the rule's handed-over list (id, raise time as
   recorded or `not recorded`, state, or the AC16/AC17 flag). s009-j6-count reads states from J7
   `desk` results and works out the two figures; the list's form, its raise-time field and "at a
   past commit" are left to checks/S-009/review-rubric.md R7.
2. AC3: a J7 decision card file has no `## 5.` section (spec line 150), so no case can carry a
   section 5 naming a word; rubric R1.
3. AC8: the case form holds only the main branch's records; notes on another branch cannot be
   written. The test checks only notes named in a pull request's title; rubric R3.
4. AC4, AC5, J3, J4: a J7 case is one read, so "the next 60-second read without a reload", a sheet
   left open across reads, and a card answered while held (no answer records in the form) are left
   to rubric R2, R9 and R10.
5. AC10, AC12: only partly observable (a notes failure keyed by path takes effect; the unchanged
   adapter runs on the built code); rubric R4 and R6.
6. J1's far-future raise time: the case form puts each `card` entry in its raise time's month file
   (line 150), so a truly far-future entry lands in a month file the desk does not read and becomes
   AC7's case (shown at once). The J1 test keeps it inside the month the desk reads.
7. Interpretations: a `results` entry may be the output object or its text; record hash keys are
   paths from the repository root with "/" separators (a leading "./" is ignored); can't-read lines
   accept either apostrophe; `shows` is compared after removing the AC16/AC17 words and collapsing
   whitespace; `lines` is compared in order with only exact-match AC16/AC17 lines removed; the
   baseline `open` cases are also compared with the record on the built code; a failed notes read on
   the built desk must show a can't-read line (line 165); with queue/ and the notes both failing,
   both AC16 lines must show; the poison run fails if any run writes a result in J7's form, whatever
   its exit code; the files under tests/ the adapter reads are found from its relative imports.
8. AC18: the test asks only that the notes exist and name the mark; the rest is the rubric
   (checks/S-009/AC18-rubric.md).
