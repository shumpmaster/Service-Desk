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
