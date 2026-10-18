Verdict: PASS

**What this means for the owner:** all three fixes from round 2 work, and nothing else broke. J11's test now checks the model's timeline for both practice files, which the plan promised. I broke that check on purpose 14 different ways (a line missing, out of order, in the wrong phase, or not recorded), and it caught every one. I also reran the model's own `trace` on the second file: the desk prints exactly what the model prints. A status file can no longer use the odd `__proto__` line to show a state it does not hold, and the label fix now has its own test. Every check passes, including the full governance checks on a trial merge into main. One small note follows. It changes nothing you would see.

## Checks run
- **Setup:**
  - I worked only in a scratch clone, /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/br3/repo. I fetched GitHub there, not in /home/user/Service-Desk, so the repo stays unchanged.
  - `git ls-remote` gives main = b873590368d2e8dfb65e1419e53f0a23cc81e62c and orch/s001-model-3.5.0-records = 0a372c7. I read round 2's verdict from 0a372c7.
- **surface_guard:** `python3 governance/checks/surface_guard.py diff --range 0a372c7..92eea63 --branch build/builder/s001-model-3.5.0-records` gave "OK: 8 commit(s) in 0a372c7..92eea63 checked (1 merge(s) skipped, 0 exempt, 0 human)", exit 0. The result was the same run in the scratch clone and in /home/user/sd-bld350.
- **The merge f431856:** I redid the merge of 0a372c7 into d925d19 in scratch. Its tree is identical to f431856's, so the orchestrator's merge carries no hidden changes.
- **npm at 92eea63:**
  - `npm --prefix src ci` exit 0.
  - `run build` exit 0 ("build: PASS (2 connected projects; 19 page modules in step)").
  - `npm --prefix src test` exit 0: 468 tests, 468 pass, 0 fail. That is 466 plus the 2 new tests (N4, N5); B2 extends an existing test.
- **npm on a scratch landing merge:**
  - I merged 92eea63 into 0a372c7 with `git merge --no-ff`, as `orchestrator` (scratch commit ab8f2d7). It merged cleanly, and its tree equals 92eea63's.
  - ci, build and test all exit 0: 468 tests, 468 pass, 0 fail.
- **check_all.sh:**
  - I merged ab8f2d7 into b873590 with `git -c user.name=shumpmaster -c user.email=furchken@gmail.com merge --no-ff` (scratch commit e0ae4df).
  - `bash governance/checks/check_all.sh . b873590368d2e8dfb65e1419e53f0a23cc81e62c` passed all 25 steps ("OK: all governance checks passed.", exit 0).
  - surface_guard inside it: "32 commit(s) … checked (7 merge(s) skipped, 0 exempt, 0 human)".
- **Commits:**
  - 92eea63 is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.
  - f431856 is by `orchestrator` and has an `Agent-Session` trailer.
- **Nothing changed:** /home/user/sd-bld350 (still at 92eea63) and /home/user/Service-Desk both have a clean `git status`. Every mutation was made in the scratch clone and reverted.

## What I verified
- **B2 is fixed** (tests/desk/j11-reached.test.mjs:105-112).
  - **The test:** it builds the expected timeline as `traceNotes()` with the three lines inserted after MD3, before "Build i2". It deep-equals that against `reachedModels(BOTH).tl.lines()`, and checks that the README records each of the three lines (README.md:105-106).
  - **Against the model:** I reran `v3_checks.py trace` (3117150 with 9f5fa73's governance/checks/) on both fixtures.
    - With the first file, the `NOTE:` lines are unchanged.
    - With both/, the only `NOTE:` lines added are `  MX5 "A milestone both reached and dropped" (dropped)`, `  MX6 "A milestone reached with its why"` and `    sprint PR #54`, after MD3. The indentation matches the test's hard-coded lines.
    - A probe compares the desk's both/ timeline with the live trace's timeline `NOTE:` lines. They are equal, in order (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/br3/probe/both.test.mjs).
  - **Mutations:** every one fails the trace test (test 4) at the new assertion. The first file's assertion still passes, because none of these touch it.
    - Desk code:
      - drop the ` (dropped)` suffix (timeline.js:466);
      - skip dropped project milestones (timeline.js:465).
    - Fixture both/:
      - remove MX5;
      - remove MX6;
      - remove MX6's ` · sprints: PR #54`;
      - change it to PR #55;
      - swap MX5 and MX6;
      - move MX5 or MX6 to phase Build;
      - put MX5 before MD3.
    - README: remove each of the three recorded lines in turn.
- **N4 is fixed** (src/lib/records.js:427-433; the src/public/lib copy is byte-identical).
  - The new test is at tests/desk/ac30-34-robustness.test.mjs:114.
  - **Fuzz:** 100,000 parses of random multi-line status files (both copies). The keys include `__proto__`, `constructor`, `state` and `gate`; the values include `{"state":"done"}`, null and arrays. I compared each against a Map-based reference.
    - 0 differences.
    - The prototype is always Object.prototype.
    - `ok` holds only for an own, valid state.
    - The parsed-cache round trip keeps state, gate and card.
  - **Mutations:** with the `__proto__` guard removed, the fuzz finds 15,544 differences and the new test fails.
- **N5 is fixed** (tests/desk/j13-sessions.test.mjs:410). Reverting the label() fix (sandbox.js:1084, both copies) fails that test: the label is `[Function: Object]`, not `'Constructor'`.
- **No regressions:** the full suite passes, the build passes, check_all passes and surface_guard passes.

## Findings
- **N6 (NOTE): the own-property half of N4 has no test.**
  - **Where:** src/lib/records.js:433.
  - **The test does not catch it:** reverting `Object.prototype.hasOwnProperty.call(STATUS_TYPES, m[1]) ? … : null` to `STATUS_TYPES[m[1]]` leaves 468 of 468 passing. The test's `constructor = 5` reads the same either way.
  - **What it changes:** with the revert, `constructor = null` is skipped with the note "field constructor: expected undefined; skipped". With the fix, it is read as an unknown field. My fuzz shows 3,070 differences, all of this kind.
  - **Why it is only a note:** the only lowercase inherited names the key pattern `[a-z_]+` can match are `constructor` and `__proto__`, so this is the whole effect. No state changes and nothing shows to the owner.
  - **Fix:** adding a `constructor = null` case to that test would pin it. It can be filed for later.
- **Earlier notes:** N2 (the model's `\d`) still belongs to the model, as in rounds 1 and 2.

## Open questions
None.
