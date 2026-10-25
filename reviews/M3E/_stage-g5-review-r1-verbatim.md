# M3E stage G5: the Reviewer's round 1 (FAIL, B1), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g5 at f5be3a8 (base 87bac4d).

---

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
