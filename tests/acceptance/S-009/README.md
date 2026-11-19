# S-009 locked checks and baseline cases

Written by the Check author from specs/S-009.md (frozen), before any work exists. Locked: never
edited once committed; a new spec supersedes them.

**Rewritten under specs/S-014.md** (frozen; it supersedes S-009 and changes only how J7 records the
sender's notices), by the owner's ruling decisions/questions/P-003-S-009-adapter-stop.md (:19). Only
the checks S-014 line 173 names changed: `notices` is now a list of notices `{ "words", "opens" }`
(for `sender`, one list per run), read as line 155 says (item, summary or group; its card; its
count); `desk` notices are compared by count (line 164) and `sender` notices as text (line 166);
line 169's coverage and case-set rules are added; AC1, AC2, AC4, AC6, AC7, AC11 and J5 read a
decision card's place on the sender's list by its **count difference** (line 173); and the base
commit is S-014 line 23's. No baseline case file changed. Line numbers in the checks are S-014's
(its lines 1-288 are numbered as S-009's).

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
   Under S-014's notice form: the checks are not told the desk's address the adapter gives the
   sender, so `opens` ending `/?open=<key>` (key decoding to `<project>|<kind>|<id>`) is an item
   notice and `opens` ending `/` is Home, the desk's address being what comes before, and every
   notice in the record must open from one desk address; a notice with any field but `words` and
   `opens` is not in the form; a card's key `<project>|card|queue/<id>.md` (or `gate`) names `<id>`,
   and a question's or pull request's key names the list id `<kind>:<id>`; on `sender` cases built
   in the checks, a first run's summary must count exactly the items on its list ("counts every item
   on that run's list", line 57), while the record is held only to "at least" (line 169).
8. AC18: the test asks only that the notes exist and name the mark; the rest is the rubric
   (checks/S-009/AC18-rubric.md).
