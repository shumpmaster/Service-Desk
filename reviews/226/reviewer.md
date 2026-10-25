Verdict: PASS

The Reviewer's verdicts on G5 (PR #226), verbatim: round 1 at f5be3a8 (FAIL, B1), then round 2 at e400666 (PASS). Recorded by the orchestrator.

## Round 1
Verdict: FAIL

**Summary.** This is G5 of "S-001 after the glance audit": build/builder/g5 at f5be3a8 on base 87bac4d, reviewed in /home/user/sd-g5. I judged it from the diff, the spec in the worktree, the rulings and the tests. Of the commit messages I read only the subjects and trailers.

Almost everything in G5 is done and correct:
- The milestone classes, R and T, and the one sprint form.
- The head's sums.
- The Timeline's fold words.
- Details' CI line.
- The ruling-B names in the waits row, with every Definer settling.
- G5_ONCE, the public lib copies, and R3-a.

The full suite passes: 1219 pass, 0 fail.

There is one blocking defect. The page's sprint counts come from looking up a Timeline block by a key that two runs can share. When they do, a phase loses its sprints. This happens on the reviewed `mix` and `gates` states: the made-up project Alpha's Build line reads "no sprints filed yet" while its Timeline draws four sprints. So two ticked tasks are not fully done: "each sprint counted once per phase" and "an opened phase's rows add their sprints".

## Checks run
- `cd src && npm test`: 1219 pass, 0 fail. This run comes after the Builder's last fixture change.
- `cd src && node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 87bac4d`: "OK: all governance checks passed."
- `python3 governance/checks/surface_guard.py diff --range 87bac4d..f5be3a8 --branch build/builder/g5`: "OK: 3 commit(s) … checked".
- `python3 governance/checks/review_check.py pr 999 --base 87bac4d`: R1, requires design-reviewer and reviewer. The only failures are those two "missing verdict" lines. No test-weakening flag.
- `node tests/desk/tools/glance-shots.mjs <scratch>/shots g5-`: 36 captures. None scrolls sideways. Each gates capture logs its waits-row words, all marked [cut].
- Commits: all three are by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.
- `cmp`: board.js, model.js, projectpage.js and records.js are identical in src/lib and src/public/lib.
- `git status` in the worktree is clean. I wrote only scratch files under /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/.

## Blocking findings
**B1. A phase's sprints and an opened row's sprints are lost when two runs share a phase and iteration (AC92 (c)).**
- **Where:** src/lib/projectpage.js:271 (`runSprintViews`) and :279 (`milestoneSprints`), and the same lines in the src/public/lib copy. Both use `feed.blocks.find((x) => x.run === run || x.key === \`${run.phase}-i${run.iteration}\`)`. Blocks come in display order, so where two runs share a key, the key fallback returns the other run's block before the identity match is reached.
- **What `mix` holds:** the made-up project Alpha (`mixState()`, MIX_PROJECT) has runs "Build-i1 (gone back over)" and a later "Build-i1 (still to come)", plus Build-i2. `gatesState()` also holds three "Launch-i1" runs.
- **Reproduction 1, the page:** open `#/p/Alpha` on `mixState()` or `gatesState()`.
  - Build's line reads "0 of 8 reached · no sprints filed yet".
  - Opened, the rows M1, M2 and M2B read "work filed · gone back over", with no sprints after them.
- **Reproduction 2, the Timeline:** open `#/p/Alpha/timeline` on the same state. It draws the folds Build-i1:M1 "2 sprints · 2 not read", M2 "1 sprint · 1 not read" and M2B "2 sprints · 2 not read". That is four distinct sprints.
- **What the spec asks:** "s is the sprints the Timeline draws in the phase's runs", "so the count and the ticks never disagree", and the opened phase's row "adds the same" as the fold. The page contradicts the Timeline here.
- **Captures:** the g5-page-gates-* captures are this page, so the defect is on a reviewed state.
- **Proof the lookup is the cause:** in a scratch copy I matched by identity first and fell back to the key only when nothing matched. Alpha's Build then gives `{ s: 4, m: 0, w: 4 }`, the Timeline's own four.
- **Gap in the tests:** no test covers duplicate keys. ac92-glance-counts.test.mjs's `feedOf` gives every run a unique key.
- **Route:** Builder. Look blocks up by run identity. Then add cases on `mix`'s Alpha: Build's line against its Timeline folds, and its opened rows.
- **Related, not G5's:** `bandLookup` (sandbox.js:1212-1213) matches by key only. As a result, Alpha's opened Build shows run heads "Run 3 · planned | Run 2 · planned | Run 1 · planned", although run 1 was gone back over. Worth fixing in the same round, and naming.

## What I checked (planned tasks)
1. **Milestones once per phase, R of T, the checklist in words.** Correct, apart from B1.
   - `standardClass` takes the six classes in the spec's order.
   - `phaseCounts` counts own milestones once over every run, which covers F2, and leaves dropped ones out.
   - Pure cases cover:
     - reached in run 1 and "not reached" in run 2, and a carried-over one;
     - not needed, and skipped with a recorded state;
     - F1, Launch-4, NOT_RECORDED_IDS, and Discovery-3 with and without groundwork;
     - a finished phase, and ALL_24's Discovery "4 of 4".
   - No "0 of <n>" appears anywhere; a regex asserts it.
   - On the page, F1 and F2 on `mix` with `laterLaunch` read Launch "0 of 2 reached" over "1 tracked · 4 not tracked".
2. **The one sprint form.** `sprintsWords` and `sprintCount` give the right words and singulars, "none merged yet" and "no sprints filed yet". Each id counts once. w holds unread pull requests only, never a pipeline item. A pipeline item merged in the dispatch log counts in m.
   - On `text` with pulls: Build 16, Design 26, Discovery 38. I re-added these from the Timeline's folds: 12+2+1+2 less #44 = 16, and 4+14+1+7 = 26.
   - The failure is in B1.
3. **The head's sums (AC83 changed).** "Milestones by phase · 8 of 15 reached" on `text`: 0+3+1+4 of 1+5+5+4.
4. **The Timeline's fold (AC84 changed).** `foldWords` puts every milestone fold and "Not tied to a milestone" in the one form. A test taps every fold and checks the merged count against its ✓ merged marks.
5. **An opened phase's rows.** "work filed · 1 sprint · 1 merged" on `text` with pulls. Fails on Alpha (B1).
6. **Details' CI line.** Correct.
   - `ciCounts` works on the counted list `reduceWorkflowRuns` already builds, so deploy, Orchestrator and notification runs stay out of x.
   - y is `NOT_FAILING`, so skipped and cancelled count as passed, as the spec says (they are counted, not left out).
   - Running workflows add ", <z> running"; "1 of 1 workflow passed" is singular.
   - No part when AC29's state is "none" or x is 0, and none when nothing is read.
   - The v2.5 model passes `ciCounts` through too.
   - The page case reads "running · 2 of 3 workflows passed, 1 running".
7. **F1 and F2 as cases.** Done, pure and on the page.
8. **Ruling B and the settlings (AC89 (c)).** All done as cases.
   - `shortNames` groups by gate and stands the name in the place of the first card. Later cards return `false`, and `pageWaits` drops them while the count still counts each card ("8 wait on you" over 7 names).
   - Every settling is a case: three items and three cases, mixed case lines, cases before one item and before two, rising order (cases and card numbers), two gates, an unread gate card left unjoined, and cards split between Waiting on you and Kicked back on the page, both ways round.
   - Ids and words are asserted. The cut and the tap are unchanged.
9. **R3-a.** Class 5 for a phase whose runs are all "not recorded", in the code comment and in a case. It still needs naming in the PR body, as the plan review asks.
10. **R3-b, not done, as G6's.** The deferral is right: the plan review r3 says "G6 should pick one and test it" (reviews/S-001-after-glance/_plan-review-r3-verbatim.md:85).
11. **G5_ONCE.** Exact: one declaration, `display: (none) → block`, pinned to `span.v2-sdl` in `span.v2-sd` in `.v2-stdr`. Set equality is asserted, and the catch-all excludes G1–G5.
12. **g5- captures.** The tool adds nine states. I made them in scratch; the PR's own captures are still to make and judge.
13. **The two locked cases outside the row, for the Definer.**
    - **7137571, AC83+AC29 (ac83-page.test.mjs:672-680):** forced, since the line now ends with `ciPassed(model)`. The old pin is kept whole, and `ciPassed(null) === ''` is added. Full strength.
    - **f5be3a8, AC57 reached (j11-reached.test.mjs:187-206):** forced, since "Yours: …" and "run 1: M1 reached" no longer exist. The line checks are now exact counts, and M1 and MD2 are still asserted on their rows. M1's row is now exact with its sprints. Full strength.
    - The other rewrites are all named by G5's row: AC60/AC84 folds, AC83, AC89 (c), and the G4 fix-round id list.
14. **Nothing outside G5.** The diff is 20 files, all G5 code, copies, tests, fixtures, README and the capture tool. The made-up parts are labelled NOT real. The spec is untouched.

## Join-up (the parts working together)
- **The page with the Timeline:** on `text` (with and without pulls) and on Service-Desk in `mix`, each phase's count equals the Timeline's folds and the opened rows. On Alpha (`mix`, `gates`) they disagree (B1).
- **The waits row with the board:** names, count and order agree with Waiting, including a card kicked back.
- **Details with the CI state:** the CI line agrees with AC29's state in every case.

## Non-blocking notes
1. **"none tracked (n)" drops the not-tracked part.** With k of 0, `countLines` leaves the not-tracked part out, so it reads "none tracked (5) · 2 skipped" rather than "… · 3 not tracked · 2 skipped" (projectpage.js:352). The spec's own Build example supports this reading, but "then its other parts" read literally includes it. Route: the Definer, to confirm.
2. **A head with nothing tracked reads "0 of 0".** Where every phase has a T of 0, the head reads "Milestones by phase · 0 of 0 reached" (`milestonesHead({R:0,T:0})`). Phases say "no milestones tracked yet" in that case. Route: the Definer.
3. **One fold is not in the one sprint form.** The Timeline's "<n> named by its pull request, not yet in the plan" fold (feed.js:704) shows a sprint count outside the one form. Its sprints count in the phase's s but not in the milestone's fold or row. The spec names only sandbox.js:2879, yet says "This one form is used everywhere a sprint count shows". Route: the Definer.
4. **The joined gate name falls past the cut at 360 px.** In g5-page-gates-two-360x740-light, the row is cut at "the Launch gate for P-00…", so ruling B's "both usually show" is not reached in this fixture. The cut itself is unchanged, as ruled. Route: the Design reviewer.
5. **The run-head key collision** described under B1 (`bandLookup`) predates G5.

## Open questions
- Note 1: with k of 0, should the checklist line say "<q> not tracked"?
- Note 2: what should the head read when T sums to 0?
- Note 3: should the "named by its pull request" fold, and the milestone's count, take the one sprint form?

Files:
- /home/user/sd-g5/src/lib/projectpage.js
- /home/user/sd-g5/src/public/lib/projectpage.js
- /home/user/sd-g5/src/public/sandbox.js
- /home/user/sd-g5/tests/desk/ac92-glance-counts.test.mjs
- /home/user/sd-g5/tests/desk/glance-fixtures.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/t/probe1.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/t/probe2.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/t/probe2b.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/t/probe3.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/shots/
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/npmtest.txt

## Round 2
Verdict: PASS

**Summary.** This verdict covers all of G5: round 1 (f5be3a8, which failed on B1) and this round's confirmation. The branch is build/builder/g5 at e400666, on base 87bac4d, in /home/user/sd-g5. I judged it from `git diff f5be3a8 e400666`, the spec, the Definer's amendment 0300026 (build/definer/g5-notes) and the tests. Of the commit messages I read only the subjects and trailers.

**B1 is fixed.** The counts now find each run's own Timeline block, and fall back to the `<Phase>-i<n>` key only when no block is the run's own. On `mix` and `gates`, the made-up project Alpha's Build line now matches its Timeline folds:
- Build's line reads "0 of 8 reached · 4 sprints · 4 not read".
- The folds read M1 "2 sprints · 2 not read", M2 "1 sprint · 1 not read" and M2B "2 sprints · 2 not read". #44 sits under M2 and M2B and counts once, which makes 4.
- Opened, rows M1, M2 and M2B each carry their fold's sprints, for example "work filed · gone back over · 2 sprints · 2 not read".

The run heads now take their own run's band: "Run 3 · planned | Run 2 · planned | Run 1 · dates not recorded · gone back over". Before, run 1 read "planned".

The head has its three forms:
- "Milestones by phase · <R> of <T> reached";
- "Milestones by phase · none tracked yet" where T sums to 0, never "0 of 0";
- "Milestones by phase" alone where the phases aren't tracked.

These match the Definer's amendment. Notes 1 and 3 stand as built, and the amendment writes them into AC92 (c). Everything else from round 1 still holds.

## Checks run (at e400666)
- `cd src && npm test`: 1223 pass, 0 fail. It was 1219 at f5be3a8; this round adds 4 cases.
- `cd src && node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 87bac4d`: "OK: all governance checks passed."
- `surface_guard.py diff --range 87bac4d..e400666 --branch build/builder/g5`: "OK: 6 commit(s) … checked".
- `review_check.py pr 999 --base 87bac4d`: R1, requires design-reviewer and reviewer. The only failures are those two "missing verdict" lines. No test-weakening flag.
- **The new cases fail on the old lookup.** In a scratch copy of the whole tree at e400666, I put back the old `x.run === run || key` lookup and `bandLookup`'s key-only find. All three new cases then fail:
  - the pure two-runs-one-key case (wrong block);
  - Alpha's page case (actual "0 of 8 reached · no sprints filed yet");
  - the AC83 run-heads case (actual "Run 1 · planned").

  The head case tests e400666's change, which that mutation left in place. On the old head it would give "0 of 0 reached".
- I also checked `gates`: Build is fixed as above, and Launch's three "Launch-i1" runs each head their own band.
- Round 1 (f5be3a8): 1219 pass. The 36 g5- Chromium captures had nothing scrolling sideways.
- **Commits:** all six are by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.
- `cmp`: board.js, model.js, projectpage.js and records.js are identical in src/lib and src/public/lib.
- The worktree is clean. I wrote only scratch files.

## Blocking findings
None. Round 1's B1 is fixed and locked, as above:
- `blockOf` is at src/lib/projectpage.js:276-279 and is used at :283 and :291, and in sandbox.js `bandLookup` at :1215.
- The new cases are in ac92-glance-counts.test.mjs (the two B1 cases and the head's forms) and ac83-page.test.mjs (the run heads).

## What I checked (planned tasks, both rounds)
1. **Every milestone once per phase, R of T, the checklist in words (AC92 (c)).**
   - The six classes are in the spec's order.
   - Own milestones count once over every run, which covers F2, and dropped ones are left out.
   - F1, Launch-4, NOT_RECORDED_IDS, Discovery-3, the finished phase and ALL_24's "4 of 4" are all cases.
   - Nothing reads "0 of <n>".
   - With k of 0 the not-tracked part is left out ("none tracked (5) · 2 skipped"), as the amendment now writes it, and a case covers it.
2. **Each sprint once per phase, in the one sprint form.** s, m and w are right, and now right on runs that share a key.
   - On `text` with pulls: Build 16, Design 26 and Discovery 38 equal the Timeline's folds.
   - Alpha: 4, as its Timeline.
3. **The head's sums (AC83 changed):** "8 of 15 reached" on `text`, plus the three forms above.
4. **The Timeline's fold (AC84 changed):** every milestone fold and "Not tied to a milestone" use the one form. Each fold's merged count is checked against its ✓ marks.
   - AC60's "named by its pull request" fold keeps its words, as the amendment rules.
5. **An opened phase's rows add their sprints:** "work filed · 1 sprint · 1 merged" on `text`, and Alpha's M1, M2 and M2B as above.
6. **Details' CI line:** "y of x workflows passed[, z running]".
   - Deploy, Orchestrator and notification runs are left out of x.
   - Skipped and cancelled are counted as passed (`NOT_FAILING`), as the spec says.
   - No part when AC29's state is "none" or x is 0, and none when the runs aren't read.
7. **F1 and F2:** both are cases, pure and on the page (`mix` with `laterLaunch`): Launch "0 of 2 reached" over "1 tracked · 4 not tracked".
8. **Ruling B and every settling (AC89 (c)):**
   - The name stands in the place of the first card, and the count still counts each card ("8 wait on you" over 7 names).
   - Cases cover three items and three cases, mixed case lines, cases before one item and before two, rising order, two gates, an unread gate card left unjoined, and cards split across Kicked back and Waiting on you.
   - Ids and words are asserted. The cut and the tap are unchanged.
9. **R3-a:** class 5, now written into AC92 (c) by the amendment. **R3-b** is not done, as G6's. The deferral is right: the plan review r3 says "G6 should pick one and test it".
10. **G5_ONCE:** still exact. ac88-dark.test.mjs is unchanged this round: one declaration, `display: (none) → block`, on `span.v2-sdl` in `span.v2-sd` in `.v2-stdr`, with set equality asserted.
11. **g5- captures:** the tool adds nine states. The PR's own captures are still to make and judge.
12. **The locked cases outside the row, for the Definer.** Each was forced and keeps its full strength:
    - **7137571, AC83+AC29:** the old CI pin is kept whole, `ciPassed(model)` is added, and `ciPassed(null) === ''` is asserted.
    - **f5be3a8, AC57 reached on the page:** "Yours: …" and "run 1: M1 reached" no longer exist. The line is now asserted as an exact count, and M1's and MD2's rows are still asserted.

    The amendment now names "the locked cases G5 changed outside its row".
13. **Nothing outside G5, no locked test weakened.** This round changes only the 5 files above. Its test diff removes no line except two import lines that were widened. 5c095d5 (`bandLookup`) fixes a fault from before G5, with the same root cause, and is locked by its own case. Across all of G5, the 20 files are all G5 code, copies, tests, fixtures, README and the capture tool. The spec is untouched on the branch.

## Join-up (the parts working together)
- **The page and the Timeline** agree on every reviewed state: `text` with and without pulls, `mix` with Service-Desk and Alpha, and `gates`. They agree on each phase's sprints, each opened row's sprints, and each run head's band.
- **The waits row** matches the board's names, count and order, including a card kicked back.
- **The CI line** matches AC29's state.
- **Differences found:** none blocking. See note 1.

## Non-blocking notes (carried as risks)
1. **The joined gate name falls past the cut at 360 px.** In round 1's g5-page-gates-two-360x740-light, the waits row is cut at "the Launch gate for P-00…", so ruling B's "both usually show" is not reached in that fixture. The cut itself is unchanged, as ruled. Route: the Design reviewer.
2. **What the PR body must say.** It names R3-a's choice, which the amendment now writes in. It marks R3-b not done, as G6's. It names 5c095d5 as a fix to code from before G5, and the head's "none tracked yet" as the Definer's note 2.

## Open questions
None. Round 1's three are settled by amendment 0300026.

Files:
- /home/user/sd-g5/src/lib/projectpage.js
- /home/user/sd-g5/src/public/lib/projectpage.js
- /home/user/sd-g5/src/public/sandbox.js
- /home/user/sd-g5/tests/desk/ac92-glance-counts.test.mjs
- /home/user/sd-g5/tests/desk/ac83-page.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/mut/
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/t/probe3.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/npmtest3.txt
