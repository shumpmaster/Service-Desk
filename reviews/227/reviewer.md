Verdict: PASS

The Reviewer's verdicts on G6 (PR #227), verbatim: round 1 at 1b81353 (FAIL, B1), then round 2 at 93e06a4 (PASS). Recorded by the orchestrator.

## Round 1
Verdict: FAIL

**Summary.** This is G6 of "S-001 after the glance audit": build/builder/g6 at 1b81353, reviewed in /home/user/sd-g6. I judged G6's work from `git diff e400666 1b81353`, the worktree's specs/S-001.md (the G6 row at :2591, AC92 (d) at :9008-9032 and its test part at :9097-9100), the owner's ruling P-001-glance2-standard.md, R3-b, the round-2 mock (changes2.js q5) and the tests. Of the commit messages I read only the subjects and trailers.

Nearly all of G6 is done and correct:
- The two heads on every run, with the rule above the standard group.
- The fold's words and counts, its ring and chevron, and the three states after its tap.
- The weights, and the Timeline's meta line and gathered line.
- R3-b is picked and tested, and G6_ONCE is exact.

The full suite passes: 1231 pass, 0 fail.

There is one blocking defect, a smaller cousin of G5's B1. The new fold keeps its open-or-closed state under the run's phase and number (for example "Build-i1"), which two or three runs can share. On the reviewed `mix` and `gates` states, tapping one run's fold also opens the other runs' folds, and a refresh keeps those open, so the page is not "as the owner left it". That means the ticked task "listed in place on tap/Enter/Space, kept on refresh" is not fully done.

## Checks run
- `cd src && npm test`: 1231 pass, 0 fail, exit 0, in 872 s.
  - My first run was stopped at its 15-minute limit with no result. It had been slowed by the captures running alongside it. The second run, alone, completed.
  - The log is /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/npmtest.txt.
- `cd src && node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . e400666`: 24 PASS and 1 FAIL. The one failure is `record_checks merges`, and it names only the orchestrator's merge commit 1b81353 ("by orchestrator (no Item: trailer)"). That is the expected local-only flag and nothing else.
- `python3 governance/checks/surface_guard.py diff --range e400666..1b81353 --branch build/builder/g6`: "OK: 6 commit(s) … checked (1 merge(s) skipped …)".
- `python3 governance/checks/review_check.py pr 999 --base e400666`: R1, requires design-reviewer and reviewer. The only failures are those two "missing verdict" lines. No test-weakening flag.
- The changed test files run on their own: 109 pass. ac88-dark.test.mjs: 5 pass.
- `node tests/desk/tools/glance-shots.mjs <scratch>/shots g6-`: 24 captures. None scrolls sideways. Each page capture logs its heads and fold rows, and they match the tests. I looked at g6-page-design-fold-open-360x740-light and g6-page-standard-414x896-dark: both read as the spec says.
- Commits:
  - the five G6 commits are by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers;
  - the merge is by `orchestrator`.
- `cmp`: board.js, model.js, projectpage.js, records.js and feed.js are identical in src/lib and src/public/lib.
- The spec is untouched, and `git status` is clean. I wrote only under /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/.

## Blocking findings
**B1. Runs that share a phase and number share one fold for their untracked rows (AC92 (d): "a tap … opens the list in place … and a refresh keeps it as the owner left it (AC56)").**
- **Where:** src/public/sandbox.js, `untrackedRows`. It uses `const fk = \`untracked:${r.key}\``, and `r.key` is `${phase}-i${iteration}` (src/lib/projectpage.js, `milestonesByPhase`). The made-up project Alpha has two runs keyed "Build-i1" ("Run 3 · planned" and "Run 1 · gone back over"). `gatesState()` also has three runs keyed "Launch-i1" (Runs 4, 3 and 2).
- **Reproduction:** run /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/t/probe1.test.mjs (`node --test`, from /home/user/sd-g6). It opens `#/p/Alpha` on `mixState()` and on `gatesState()`, opens every phase, and taps Run 3's "2 not tracked this run: 2 no record in the model" fold.
  - **Result:** both Build-i1 fold buttons then read `aria-expanded="true"`, and both runs list their rows ("after tapping the first: true,true").
  - **What the spec asks:** the fold that opens is the one tapped. A run the owner left folded comes back open after a refresh, and on `gates` one tap opens three Launch folds.
- **The data is right:** probe2.test.mjs in the same folder shows the two runs' own rows really are identical in the model. Only the shared open state is wrong.
- **Gap in the tests:** ac92-glance-standard.test.mjs:246-249 checks that opening one fold leaves others closed, but only between Design-i1 and Design-i2, whose keys differ. No case has two runs sharing a key.
- **Why this blocks:** it is the class of fault G5's review blocked on (B1), and G5's fix round moved the run heads to run identity for the same reason. G6 adds a new keyed state without it.
- **Route:** Builder. Key the fold by run identity, for example `untracked:${r.key}:${r.k}` (k is unique within a phase). Then add a case on `mix`'s Alpha and on `gates`' Launch: tapping one run's fold leaves the others folded, and a refresh keeps it that way.
- **Related, not G6's:** the Timeline's gathered folds have the same collision, and it predates G6 (feed.js, ``key: `${rk}:gather:${tail}` ``, AC59). On `gates`, Alpha's Timeline taps "Launch-i1:gather:stc" open on all three Launch runs (probe3.test.mjs). Worth fixing in the same round, and naming as outside G6's row.

## What I checked (the planned tasks)
1. **The checklist in a labelled group under two heads on every run, with the rule above it.** Done.
   - "Your milestones · <n>" and "Standard checklist · <n> · <h> tracked" (or "· none tracked this run") on every run, earlier runs included (in `div.v2-oldrun`).
   - The heads are in --t-label --ink. The standard head has `border-top: 1px solid var(--line)` and `margin-top: 8px`. This matches the mock's q5 CSS.
   - Tested in both themes, and the order run head → yours → standard is asserted for every run.
2. **The untracked rows folded into one line worded "not tracked", listed in place on tap, Enter or Space, kept on refresh.** Done, apart from B1.
   - The words and each part left out when 0 are tested pure and on the page. So are "never 'not used'", the dashed ring (`st-planned`), the chevron, --t-small --ink2, the rows in place with Design-1 at the foot, Enter and Space, a second tap folding them, and the same element kept on refresh.
3. **Your milestones at the row weight; standard rows at 400 13 px.** Done. Own rows are 500 13 px and tracked standard rows 400 13 px, with colours as AC83 has them. Earlier runs' rows are 12 px at the same weights, which is the Builder's reading of note 2. Tested in light and dark.
4. **The Timeline's "· standard ·" meta line and "Standard checklist · …" gathered line (AC84 changed).** Done.
   - Meta line: "Design-6 · standard · not reached". A standard name is 400 and an own one stays 500.
   - Gathered line: "Standard checklist · 6 not recorded for this run ›", and the old words are gone.
5. **AC83's opened-phase and three-states cases rewritten.** Done at full strength.
   - The opened-phase case now pins all four heads and the fold's words, then taps the fold and pins the six ids in order. The earlier run's two rows are pinned exactly, and its fold replaces the old gathered line.
   - The three-states case keeps every old pin. It adds Design-5's new "taken on · not recorded by the model" words, and taps the fold before reading the "not recorded yet" and "no record" rows.
6. **AC84's milestone case rewritten.** Done. It adds Design-6's three children, its meta line, the `std` class and the CSS rule, and keeps every old assertion.
7. **R3-b picked and tested.** Picked: a taken-on row outside its run's h reads "taken on · not recorded by the model".
   - Tested pure (a finished phase, an earlier run gone back over, the run now) and on `standard`. On `standard`, finished Discovery's four rows agree with its line's "4 taken on, not recorded by the model", and Design run 1's Design-4 reads the same while run 2's reads "taken on".
   - The R3-a note in `standardClass` was updated to match (ee63fa0).
8. **G6_ONCE exact.** Done.
   - Each declaration is pinned before and after, per theme, on its own element (`G6_KEY`).
   - The walk opens `text` with every phase and all six folds.
   - Set equality asserts that every pin is met and that nothing else of G6's is excepted. The catch-all regex now excludes G1–G6.
9. **The locked cases outside the row, for the Definer.**
   - **98dbef2, AC59's gathered line (ac59-60-61-64-timeline.test.mjs:163-176):** forced by AC92 (d)'s new words. The exact strings are kept and the six gathered items are now asserted too. Full strength.
   - **32e140b, G5's opened-phase row case (ac92-glance-counts.test.mjs:359-361):** forced, since Design-6 is now folded. It taps the fold and keeps the same assertion. Full strength.
   - **9ea7057, AC50's two Launch-5 cases (j11-timeline.test.mjs:286-288 and :309-310):** forced, since Launch-5 is now folded. Both open the fold before reading. The "no Graduated" check is stronger than before, because Launch-5 is now drawn when it is checked. Full strength.
10. **The Builder's readings.**
    - **R3-b:** honest, and the plan review said either form was. One tension: in a live phase, an earlier run's recordable taken-on row says "not recorded by the model" while the phase line counts it as tracked.
    - **What h counts:** this follows the spec's letter. See note 1.
    - **"Your milestones · 0" on a run with none:** the spec says "every run … two heads", so this follows it.
    - **"Standard checklist · <n> still to come":** the spec names only the not-recorded line. The mock's q5 rewrites both lines the same way, so this is supported.
    - **The fold replacing the earlier runs' gathered line:** supported by "every run" and "the standard rows not tracked in that run".
11. **Nothing outside G6.** 16 files: code, the public lib copies, tests, the made-up `standard` fixture (labelled NOT real in glance-fixtures.mjs and the fixtures README), and the capture tool.

## Join-up (the parts working together)
- **The phase line with its opened runs:** on `standard`, Design's line "3 tracked · 2 taken on, not recorded by the model · 1 skipped" sums to 6. Run 2's head reads "6 · 3 tracked", and its rows agree. Discovery's line and its rows agree too.
- **The page with the Timeline:** a run's fold counts the same rows as the Timeline's gathered line. On `text`, Design-i2 is 6 on both, Design-i1 is 4 and Launch-i1 is 5.
- **The fold with refresh (AC56):** correct where run keys are unique. It fails where they are shared (B1).

## Non-blocking notes
1. **h can be larger than the phase line's k in a phase with one run.** The spec defines h as "a state recorded in that run", so "not needed", and "skipped" with a recorded state, count as tracked in the run's head. They are not tracked on the line. Made up, one Build run now (probe4.test.mjs):
   - Build-1 "not needed" and Build-3 "reached": the line reads "Standard checklist: 1 tracked · 3 not tracked · 1 not needed", and the head reads "Standard checklist · 5 · 2 tracked".
   - A skipped Build-2 with "not reached" recorded gives the same disagreement.

   The Builder follows the letter, and the test at ac92-glance-standard.test.mjs:293 asserts it on purpose. Route: the Definer, to confirm or narrow h to classes 2 and 4's states.
2. **The fold row and a taken-on row share one icon.** Both use the plain dashed ring (`st-planned`). The spec says "the dashed ring", so this is as written. Route: the Design reviewer, to judge.
3. **The Timeline's gathered-fold collision** (under B1) predates G6.
4. **The suite takes about 14.5 minutes alone.** A 15-minute limit nearly cuts it off when anything runs beside it.

## Open questions
- Note 1: should a run's h count "not needed", and a skipped one with a recorded state, as tracked, when the phase line does not?
- Should the Timeline's AC59 gathered folds take run identity in this round, as a named change outside the row?

Files:
- /home/user/sd-g6/src/public/sandbox.js (`untrackedRows`)
- /home/user/sd-g6/src/lib/projectpage.js and /home/user/sd-g6/src/public/lib/projectpage.js (`milestonesByPhase`, `trackedInRun`, `stdRow`)
- /home/user/sd-g6/src/lib/feed.js (the gathered folds' key)
- /home/user/sd-g6/tests/desk/ac92-glance-standard.test.mjs
- /home/user/sd-g6/tests/desk/ac88-dark.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/t/probe1.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/t/probe2.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/t/probe3.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/t/probe4.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/shots/
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/npmtest.txt

## Round 2
Verdict: PASS

**Summary.** This is G6 of "S-001 after the glance audit" on build/builder/g6, reviewed in /home/user/sd-g6, covering round 1 (at 1b81353) and this confirmation round (at 93e06a4). I judged from the diffs (`e400666..1b81353` for G6, `1b81353..93e06a4` for the fix round), the spec with the Definer's amendment ff48563 (`/home/user/sd-g6def`, specs/S-001.md), the owner's ruling P-001-glance2-standard.md, the plan review's R3-b, the round-2 mock (changes2.js q5) and the tests. Of the commit messages I read only the subjects and trailers.

Round 1 failed on one blocking defect, B1: runs sharing a `<Phase>-i<n>` key shared one fold. That is fixed, along with the older collisions of the same kind, and the new cases fail on the old code. h is narrowed as the Definer ruled, so a phase with one run now shows the same tracked count in its head and its line. Every ticked task is done. The full suite passes: 1235 pass, 0 fail.

## Checks run (at 93e06a4)
- `cd src && npm test`, run alone with a 25-minute limit: 1235 pass, 0 fail, exit 0, in 884 s. Round 1 had 1231; the fix round adds 4 cases. The log is /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/npmtest-r2.txt.
- `cd src && node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . e400666`: every check passes but `record_checks merges`. That one names only the orchestrator's merge commit 1b81353 ("no Item: trailer"), the expected local-only flag and nothing else.
- `python3 governance/checks/surface_guard.py diff --range e400666..93e06a4 --branch build/builder/g6`: "OK: 12 commit(s) … checked (1 merge(s) skipped, 0 exempt, 0 human)".
- `python3 governance/checks/review_check.py pr 999 --base e400666`: R1, requires design-reviewer and reviewer. The only failures are those two "missing verdict" lines. No test-weakening flag.
- Commits:
  - all eleven non-merge commits (five in G6, six in the fix round) are by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers;
  - the merge is by `orchestrator`.
- `cmp`: board.js, model.js, projectpage.js, records.js and feed.js are identical in src/lib and src/public/lib.
- `git status` in the worktree is clean, and no spec file is touched on the branch.
- Round 1 also made 24 g6- captures with `glance-shots.mjs`. None scrolls sideways, and the two I looked at read as the spec says.
- I wrote only under /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/.

## Round 1's B1, confirmed fixed
- **The page's fold:** it is now keyed by the run, `untracked:${r.key}:run${r.k}`, in src/public/sandbox.js `untrackedRows`. `r.k` is `ctx.cols.k.get(r)`, the run number the head shows, so it is unique within a phase.
- **My round-1 probe:** probe1.test.mjs on `mix`'s and `gates`' Alpha now gives "after tapping the first: true,false". Only the tapped Build-i1 run lists its rows.
- **The new case:** "AC92 (d) and AC56 … runs that share a key keep a fold each" covers both Build-i1 runs on `mix` and all three Launch-i1 runs on `gates`. It checks that one tap opens one fold, a refresh keeps it so, a second run opens beside it with any run between staying folded, and folding the first leaves the last open.
- **The Timeline (outside G6's row, older than G6):** each fold's key now includes the run number:
  - the gathered lines: `${rk}:gather:${tail}:run<k>`;
  - "Not tied to a milestone": `foldKey` `${rk}:untied:run<k>`;
  - a milestone's sprint and named folds: `foldKey` `<Phase>-i<n>:<id>:run<k>`;
  - the sprint index that sprint links use: `openSprintFolds` reads `at.foldKey`.
- **The page's other keys:** `runh:` and `old:` are now keyed by the run too.
- **Timeline checks:**
  - probe3.test.mjs on `gates` now opens only `Launch-i1:gather:stc:run4`;
  - the new gathered-line case gives [false, true, false] and keeps it on refresh;
  - a new case on a made-up `mix` (both Build-i1 runs holding an untied sprint) opens each "Not tied to a milestone" alone, draws only its own sprint (PR #901 or PR #902), and keeps it on refresh.
  - AC66/67's and j12-asks-merge's sprint-link cases still open the right fold.
- **Fold state is kept in the open window only** (`sessionOf(name).folds`, never stored), so renaming the keys loses nothing a device kept.

## The new cases fail on the old code
- **The method:** I exported 1b81353 with `git archive` into scratch (…/g6-review/old/) and put 93e06a4's ac92-glance-standard.test.mjs on top.
- **The result:** 8 of the file's 12 cases fail there.
- **Each new case fails on the behaviour itself:**
  - the h case and the head-against-line case: h is 5 where k is 3;
  - the B1 case: I gave the scratch copy `data-runk` but kept the old fold key, and the case then fails on "only the tapped run's fold opens";
  - the gathered-line and untied cases: these fail on the run-numbered keys. My round-1 probes showed the behaviour fail on the old code (all three Launch-i1 lines opened).
- **The other two failures** (the heads case and the Timeline meta and gathered-line case) come only from the new keys.

## h as narrowed (AC92 (d), ff48563)
- **The code:** `trackedInRun` returns false for a line marked skipped. It counts "reached", "carried over" or "not reached" recorded in the run, and a recordable taken-on one while the run is now or still to come. Nothing else counts. This matches the amendment word for word.
- **My round-1 probe** (probe4.test.mjs): a "not needed" one now gives line "1 tracked" and head "1 tracked". A skipped one with a recorded state gives the same. In round 1 the head read 2.
- **The new case:** h equals k in a phase with one run, for now, still to come, finished and "not recorded", on made-up lines with a skipped and a "not needed" one. It also checks every phase with one run on `text` and `standard`.
- **The rewritten cases:** the h-per-run case and the kept-rows case are rewritten for the narrowing and say so in a comment. Their assertions are exact (h 2, 2, 1, 1; Build h 2).

## The key-only rewrites (93e06a4, df14078)
- I read each hunk in ac56, ac59-60-61-64, ac66-67-68, ac83, ac84, ac89-words-drawing and j12-asks-merge.
- The only changes are a fold or DOM key gaining `:run<k>` (or `old:<key>:run<k>`), plus one comment in df14078. Every assertion, message and expected value is otherwise unchanged.

## Nothing else changed
- The fix round touches 14 files: feed.js and projectpage.js with their public copies, sandbox.js, the seven key-only test files, ac92-glance-standard.test.mjs and the fixtures README.
- The made-up `sharedUntied` state is labelled NOT real in the test and the README.
- ac88-dark.test.mjs is untouched. Its G6_ONCE pins elements by class, not by the changed keys, and its set-equality assertion still passes in the full run, so G6_ONCE is still exact.

## The planned tasks (round 1, still holding)
1. **The checklist under two heads on every run, with the rule above it.** Done: --t-label --ink, with a 1 px --line rule and 8 px, as in the mock's q5.
2. **The untracked rows folded into one line worded "not tracked", listed in place on tap, Enter or Space, kept on refresh.** Done, and now per run (B1 fixed).
3. **Your milestones at the row weight; standard rows at 400 13 px.** Done, in light and dark.
4. **The Timeline's "· standard ·" meta line and both gathered-line forms.** Done. The Definer settled both forms as built.
5. **AC83's opened-phase and three-states cases, and AC84's milestone case, rewritten.** Done at full strength.
6. **R3-b picked and tested.** Picked as "taken on · not recorded by the model", which the Definer settled as built. It is to be named in the PR body.
7. **G6_ONCE.** Exact.
8. **The locked cases outside the row** (98dbef2 AC59, 32e140b G5's opened-phase row case, 9ea7057 AC50's two Launch-5 cases). Each was forced and is full strength, and the amendment now names them in G6's row.
9. **The Builder's readings.** All supported by the spec as amended:
   - "Your milestones · 0" on a run with none;
   - the "still to come" gathered line;
   - the fold replacing the earlier runs' gathered line;
   - the run head kept as built, a call left for G9's Design review.

## Join-up (the parts working together)
- **The phase line with its runs:** in a phase with one run, head h equals line k. On `standard`, Design's line sums to 6, and run 2's head and rows agree with it.
- **The page with the Timeline:** each run's fold counts the same rows as the Timeline's gathered line for that run (Design-i2 6, Design-i1 4, Launch-i1 5 on `text`).
- **Folds with refresh (AC56):** each fold is now kept per run on the page and on the Timeline, including where runs share a key.

## Non-blocking notes
1. **The Timeline's run sections still share DOM keys when runs share a key.** `blk:${b.key}` and `band:${b.key}` (sandbox.js:3198-3199) are siblings with the same key on `gates`' Alpha, as is `data-run`. The same goes for `mile:`/`tasks:` inside them. This predates G6 and is not a fold state. The new cases show the right content drawn in each run. Route: the Builder, when next in the area.
2. **Earlier-run test note from round 1:** the suite takes about 14.5 minutes alone. A 15-minute limit is too tight; 25 minutes worked.

## Open questions
None.

Files:
- /home/user/sd-g6/src/public/sandbox.js
- /home/user/sd-g6/src/lib/feed.js and /home/user/sd-g6/src/public/lib/feed.js
- /home/user/sd-g6/src/lib/projectpage.js and /home/user/sd-g6/src/public/lib/projectpage.js
- /home/user/sd-g6/tests/desk/ac92-glance-standard.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/t/probe1.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/t/probe3.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/t/probe4.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/old/
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-review/npmtest-r2.txt
