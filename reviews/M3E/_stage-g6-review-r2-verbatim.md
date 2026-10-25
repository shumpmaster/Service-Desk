# M3E stage G6: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g6 at 93e06a4 (fix commits a234793, 6eddd9e, df14078, a334674, f4770ee and 93e06a4, on 1b81353) (G6's work over e400666).

---

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
