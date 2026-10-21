# S-001 desk v2, stage 2 (Home): the Reviewer's confirmation, verbatim

Dispatched by the orchestrator on 2026-10-21 against build/builder/desk-v2-2 at 818b3b2.

---

Verdict: PASS

**What this means for you.** The two new commits break nothing, so my PASS from round 2 still holds. Each of my four small findings is fixed. Each has a test that fails when its fix is undone. When the reason a finish can't be shown lies in another project, the tile now names that project, and what it says is true. Plan's wording has not changed. No test was weakened. The full suite passes (913 of 913), and so do the build and the governance checks. I found one new small gap, a missing test. It does not block.

## Checks run
I made a detached scratch worktree at 818b3b2 and have removed it. The branch tip is still 818b3b2.
- Full suite: 913 tests, 913 pass, 0 fail. The log is `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv3-suite.txt`.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 32 page modules in step)".
- `check_all.sh . 5a7e55a`: "OK: all governance checks passed."
- `surface_guard.py diff --range 5a7e55a..818b3b2`: "OK: 9 commit(s) … checked".
- `review_check.py pr 999 --base 5a7e55a`: fails on the same three missing verdict files as in round 2 (design-reviewer, owner, reviewer). Its only flag is still the old one, ac54-home's assertion count going from 186 to 174. The two commits raise no new flag. This is expected before review.

## 1. The diff, Plan's words and AC24
- `roughFinish` (`src/lib/workahead.js:339-363`) builds its `words` exactly as before. It only adds a `stop` field: `{index, code, why}`.
- Work ahead (`src/lib/workview.js:214-217`) adds the project's name to that field, as a new object for each row.
- Plan's row draws only `r.finish.words` (`src/public/sandbox.js:2576`), so Plan's words cannot change.
- No AC24 test file changed. All of them pass, including the j4-j14-j15 checks of `finish.words`.
- The `src/public/lib` copies match `src/lib` line for line.
- The new tile line is "MD1 · rough finish: not available: Twin's MD1 has no estimate yet" (or "… is past its estimate"). `src/lib/home.js:574-576` makes it.
  - It is true. AC24 step 4 says that every row after a milestone with no estimate reads not available because of that milestone. The tile gets the project's name from the row its reason names. Nothing is made up.
  - It is used only when that row is in another project. A tile whose reason is its own still reads "MD1 · no estimate yet", or Plan's own words.
- AC82 still gives no tile form for this case. The wording question (my D-a and D-b) stays with **Define**.

## 2. N-1 to N-4: each is fixed and each test catches its mutation
- **N-1** (the overflow rule): mutation B2c fails the new j24-since test ("6 open pull requests of 3 pages each").
- **N-2** (a comment arriving during J20's 5-minute wait after a failed read): mutation B2d fails the new test (no call; `alone` = 0).
- **N-3** (a "Can't read" tile whose records are still held keeps its own lines): mutation D2 fails the new ac82-home test.
- **N-4** (Work ahead's view throws):
  - Fixed: the catch now sets `nextRows = null` (`sandbox.js:975-980`). `nextLine` then returns "not available" (`home.js:561-562`).
  - Mutation N4a, the empty map from round 2, is caught.
  - So are N4b (`unknown` ignored) and N4c (the page not passing `unknown`).
  - Note: the check of the page wiring reads the source text, because the fake DOM can't make the view throw. It is weaker than a behaviour test, but it does catch the mutations.
- The new tile rule: BN1 (the naming branch removed), BN2 (Work ahead not adding the project) and BN3 (naming the project even when it is the tile's own) are all caught. BN3 also fails two older AC82 tests.

## 3. No test weakened
- Neither commit removes a test line.
- Assertion counts rose: ac82-home from 140 to 157, and j24-since from 99 to 109.

## New finding (non-blocking, routes to **Build**)
- **N-5: the rule "the reason's row, by its index" has no test.**
  - Mutation BN4 makes `index: 0` always, in `workahead.js` (`at = { index: i, …`). It survives.
  - It survives because in the new test the row the reason names is always the first row of the view.
  - I wrote probe p9. The order is Service-Desk (all estimated), then Twin (MD1 has no estimate), then Third.
  - The real code is right. Third's tile reads "MD1 · rough finish: not available: Twin's MD1 has no estimate yet".
  - Under BN4 that tile would wrongly name Service-Desk, and p9 fails.
  - Probe: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/p9-stop-later.test.mjs`
  - Mutations: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/m5.json` and `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/m6.json`. Run them with `probes/mutate3.py <absolute root> <file>`.

## Open questions
1. These are still open from round 2:
   - The Chromium captures must be in the pull request before merge. I can't check them.
   - Define's D-a to D-c.
   - The round-1 Define items.
2. Define (a small point): the tile adds "'s" to a project's name. A name ending in "s" would read "Docs's". Does Define want a rule for this?