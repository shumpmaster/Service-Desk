Verdict: PASS

The Reviewer's verdicts on VT1 (PR #249), verbatim: round 1 at 1a2f444 (FAIL), round 2 at a092039 (FAIL), round 3 at c43dd4e (PASS). Recorded by the orchestrator.

## Round 1
Verdict: FAIL

**Scope.** I reviewed stage VT1 of S-001 (M3B) on build/builder/vt1, 13 commits over 5935908, at HEAD 1a2f444, in /home/user/sd-vt1. I did not read builder-r1.md. My role card says "Must not see: the builder's summary of its own work", so I judged the work itself against the spec. I could not judge the ten flagged points one by one; please put any of them to me as questions.

**What I ran**
- Full suite (`npm --prefix src test`, one process per file): 1490 of 1490 pass, in 223 s.
- `node src/tools/build.mjs`: PASS (37 page modules in step).
- surface_guard on 5935908..build/builder/vt1: OK, all 13 commits.
- ac88-dark heap, measured with `node --trace-gc`: peak about 1209 MB of 2096 MB, 12 of 12 pass. That is within the file's heap.
- The Chromium capture tool (tests/desk/tools/vt1-shots.mjs), writing to /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1-shots:
  - 0 px sideways scroll on every row and sheet capture, at 360 and 414 px, light and dark;
  - the stop rule shows 3 lines, cut, with "Read it all";
  - the day-5 sheet matches round 2's picture, except where AC97's later answers govern ("Missed", because the check wins).
- I planted 16 bugs, each restored with `git checkout`. 13 were caught. The 3 that survived are B1, N1 and N2 below. `git status` is clean at the end.

**Blocking**

B1. The locked check "no 'so far' after the window" cannot fail.
- The code (src/lib/values.js:298, `verdictWords`) is correct. The test meant to guard it is tests/desk/ac97-values.test.mjs:222.
- It runs on `FINAL`, where every target's latest line is `met` or `missed`. Those replace the desk's own words with "Met" or "Missed", and they agree with the desk, so no "The desk's own reading" line appears either.
- So no test ever reaches the desk's own after-window words: "Within target" or "Outside target" · "goal: …", for V1–V3 and V5.
- Reproduction: change :298 to `phase !== 'before' ? ' so far' : ''`. After the window, V1 with a latest `on track` line then reads "Within target so far". All five VT1 test files still pass (ac97-values, ac97-values-page, j25-value-checks, j12-value-checks, ac83-page).
- VT1's row names "no 'so far' after the window" and the after-window column of the verdict table among the tests to lock.
- Fix: a case after the window where the latest line is `on track` (or there is a figure and no check), asserting the exact verdict words for V1, V2, V3 and V5. A difference line after the window would also do ("The desk's own reading: within target", no "so far").

**Non-blocking (carry as risks or fix in passing)**

N1. No test covers a V4 latest line saying `not measured`.
- src/lib/values.js:480 correctly keeps such a line from counting as the archive. Planting `const archive = known && check ? check : null` (so the line does count) passes every test.
- In the same area, values.js treats any V4 line that is not `not measured` as the archive line. The test at ac97-values.test.mjs:298 pins this for `on track`.
- So a V4 `on track` or `missed` line shows "Old repository archived <date>" and "2 of 2". With `missed` the sheet reads "Missed" next to "archived". J25 only describes V4's archive line, so this is a Definer question (Q2).

N2. The blob cache key move to `desk-blobs-v8` is forced and done right, but no test pins `desk-blobs-v7` among the old keys.
- Dropping v7 from `OLD_BLOB_CACHE_KEYS` (src/lib/scheduler.js:32) passes every test. The only effect would be stale v7 parses left in storage, so nothing is lost.
- The move is forced by J6's own rule ("bump it whenever a parser's output changes"), since docs/PROJECT.md's parse gains `stopRule`. Neither VT1's row nor J6 (spec :14259-14270) records v8, so the Definer should note it.

N3. Other projects can show the wrong words when the planning project fails to draw.
- When the planning project's draw errors, src/public/sandbox.js:1503 returns J25 state `none` instead of `failed`.
- Other projects then read "weekly check not recorded yet" rather than state 0's "weekly checks not available". This is an edge case, and AC97 forbids "not recorded yet" until the read is in.

N4. The left icon's green ✓ is never walked by AC88's cascade check or the stage-8 guard.
- VT1_OPENS (tests/desk/vt1-fixtures.mjs:183-192) never draws the all-met final state, either for Service-Desk or for another project.
- The capture vt1-row-8a covers it by eye. VT1_ONCE pins only "the row's left icon, a ✕".

N5. An addition and a reading beyond the spec's words:
- Another project's row adds a "<k> not recorded yet" part (values.js:639) so the parts add up to the number of targets. AC97's other-project words do not name this part.
- V1's sum lets a later line covering the same days replace the earlier one (values.js:291, `weeksOf`). The spec says "the sum of its window lines' values", but J25 says "the second counting", so this is a defensible reading. Both are worth a line in the PR body.

**The rewritten locked cases.** All are real rewrites; none is a weakening.
- 079ecd0, AC83 :466: still checks every quote word for word, now through "The whole target", and adds the row's marks and icon.
- 987e846 (AC85 :710) and ebb6f3a (S-033 J6 :337): the same strength, now asserting v8, with the v6 and v5 drop checks unchanged.
- 3d741e7, 5f2313a, b3b7f56 and 25a6128 (the J12 key and kept-field cases): the same strength or stronger. They add asserts on `valueCheck` and `valueCheckLine`, and j12-value-checks.test.mjs covers dropping v3.
- 82d9170, the stage-8 guard: admits only VT1 exceptions that VT1_FLAT pins, as QW1's did.
- The brief says "seven", but there are eight such commits. Also, AC85's and S-033's blob-key cases are not in VT1's row, so the PR body must name them (the plan allows that).

**The key moves lose nothing a device needs.**
- `desk-pulls-v4`: v3 is removed on load and every entry is read again from J12, so no entry lacks the two new fields. The extra cost is one J12 read, as on earlier moves.
- `desk-blobs-v8`: the cache holds only parses by sha, and every blob is re-readable from the tree. History, compare and pull-request data live under their own keys.

**Spec reading: the Design reviewer's N1 (state 8, a recorded `not measured` with a figure).** The build reads it correctly.
- :13258-13261 governs when a figure exists: the desk's live verdict is the mark, the check's word is on its own line, and there is no difference line.
- The planned ring is limited to the table row at :13330, which is scoped to "and no figure". :13339-13341 is about whether such a target counts as a check late, which only arises with no figure.
- The Definer should scope :13339 explicitly ("… and no figure").

A related wording conflict: AC83's "Changed for M3B" (:8762-8767) describes "each target's line quoted, three lines on screen … and its measure under it". That contradicts AC97's measure-first block, which rests on the owner's answer B (P-001-m3b-sheet-order.md). The build follows AC97, rightly, and the Definer should align AC83's sentence.

**Questions (asked, not picked)**
- Q1 (orchestrator): do you want the Builder's ten flagged points judged? If so, list them in the brief without the Builder's summary, since my role card keeps the summary out of my pack.
- Q2 (Definer): which V4 lines count as the archive? Options:
  - (a) any V4 line not `not measured`, as built;
  - (b) only `met` lines;
  - (c) any line with `from` = `to` and its state `met` or `missed`.
- Q3 (Definer): should the desk show anything for a V4 `missed` line beyond "Missed"? As built, its steps still say archived.
- Q4 (Definer or owner): another project's row adds "<k> not recorded yet". Keep it, or leave the parts as the Chief of Staff's states only (then they may not add up)?

**Relevant files:** /home/user/sd-vt1/src/lib/values.js, /home/user/sd-vt1/src/public/sandbox.js, /home/user/sd-vt1/tests/desk/ac97-values.test.mjs, /home/user/sd-vt1/tests/desk/vt1-fixtures.mjs. My mutation scripts are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/mut/ (run.mjs, run2.mjs).

## Round 2
Verdict: FAIL

**Scope.** This is round 2 of the Reviewer's check on stage VT1 of S-001 (M3B). I reviewed build/builder/vt1 at a092039 in /home/user/sd-vt1, against draft 11 as merged at 61bb35c and 69904d5. The Builder's round-2 commits are c85438c, 514b33e, e0f87f1, 6450aaf, ffe8898 and a092039. I did not read the Builder's summary. I planted every bug in a `git archive` copy at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/r2copy, not in the worktree. `git status` in the worktree is clean at a092039.

**What I ran**
- Full suite (`npm --prefix src test`): 1499 of 1499 pass, in 294 s. Round 1 had 1490.
- `node src/tools/build.mjs`: PASS (37 page modules in step).
- surface_guard on each Builder commit by itself (`<c>^..<c>`): OK for all six. Run over the whole range, it flags only the definer and chief-of-staff commits brought in by merge (45d7f60 to 12b21be), as the brief expects.
- Comparing test titles between 1a2f444 and a092039: no test was dropped. Nine were added, and one (V4's) was renamed by its rewrite.
- vt1-shots.mjs, writing to /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt1-shots-r2:
  - the new captures 8c, alpha-all-met and the sheet with two final checks `not measured` show 0 px sideways scroll;
  - the stop rule shows 3 lines, cut, with "Read it all";
  - the sheet matches draft 11: the planned ring, grey bars, "Not measured · your Chief of Staff's check, 21 Dec", "Goal: …", and "2 earlier checks" before "The whole target".
- I planted 39 bugs (the runner is /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/mut2/run.mjs). 32 were caught. Of the 7 that survived:
  - N3a–d (4) are the blocking finding below;
  - F6 is equivalent (the filter it removes never has anything to remove);
  - F9 and I3 are N1 and N2 below.

**Check 1: round 1's findings**
- **B1: fixed and tested.** I planted `phase !== 'before' ? ' so far'` at values.js:298. It is caught by the new after-the-window test and two others.
- **N1: fixed and tested.** V4's archive now counts only on `met` (values.js:503), and `missed` reads "Old repository not archived" with ✕. All four plants were caught: the round-1 rule, `met` or `on track`, `met` or `not measured`, and no ✕ on `missed`.
- **N2: fixed and tested.** I dropped `desk-blobs-v7` from scheduler.js:32. It is caught by j25-value-checks.test.mjs:206.
- **N3: the code is fixed, but no test can fail.** This is blocking finding B1 below.
- **N4: fixed and tested.** The all-met state is now in VT1_OPENS (`greenIcon`). I planted three page bugs, each caught by ac88-dark and the page test: the green icon drawn as a half circle, the green icon without its `ok` colour, and bar labels in Plex Mono.
- **N5: fixed and tested.** All three plants were caught: dropping "<k> not recorded yet", counting both lines for the same days, and keeping the earlier of the two.

**Blocking**

B1. The N3 test cannot fail. VT1's row asks for "its row reading 'weekly checks not available' when the planning project can't be read or drawn (N3)". The new test covers only "can't be read". The "drawn" case, which was round 1's bug, has no test.
- The fix is src/public/sandbox.js:1502 and :1506: `if (pb.error || (pb.box && pb.box.drawError)) return { state: 'failed', … }`.
- The test is tests/desk/j25-value-checks.test.mjs:229. It sets `repos['Service-Desk'].fail = { kind: 'network' }`. That path was already 'failed' before round 2, through the `cant-read` branch at :1508, so the test never reaches the new guard.
- Reproduction:
  - Delete line 1506: every test passes.
  - Restore round 1's filter (`… && b.project.model === 'v3' && !b.error)`): every test passes.
- I wrote my own probe with fake-desk.mjs's `BAD_PR` pushed into Service-Desk's pulls, so the planning project can't be drawn. It was a copy of the :229 test, in r2copy/tests/desk/zz-probe-n3.test.mjs.
  - On a092039 it passes: Alpha's row reads "2 targets · weekly checks not available". So the fix works.
  - It fails with the guard deleted, and with round 1's filter restored.
- Fix: add that draw-error case (`BAD_PR` on the planning project) beside :229, asserting state 0's words and no left icon.

**Check 2: the build against AC97 and VT1's row (draft 11)**
Every draft-11 item matches, and every item but N3's "drawn" has a test that fails for its bug:
- the final check (`to` ≥ WN, on WN itself included);
- earlier weeks' `not measured` lines, with and without a figure;
- the grey bars and no difference line;
- the row counts in states 7 and 8;
- V4 by its latest line;
- the same days twice, and the earlier of two equal worst weeks;
- "1 false alarm" in both forms;
- "Weekly check: 1 card", and the figure as written where it gives no count;
- V5 after the window with its log gone;
- bar labels in Plex Sans and values in Plex Mono;
- other projects' "<k> not recorded yet";
- AC66's Done row ("not on the Timeline: a weekly value check": both plants caught);
- `desk-blobs-v8`;
- the all-met icon walked;
- the order "<k> earlier checks ›" then "The whole target ›" (the swap-back plant was caught).

**Check 3: the two rewrites are real**
- **514b33e** (ac97-values.test.mjs, V4): a real rewrite, and stronger.
  - It drops only the two asserts draft 11 overturns: `on track` read as archived, and `missed` with "The desk's own reading".
  - It asserts each state's mark, verdict, step, figure and exact lines, and adds `met`. Nit: its title says `met` gives "Within target", but it asserts "Met", which is right.
- **e0f87f1** (ac97-values-page.test.mjs): only the order changes, `[5]` and `[6]` swapped, with the taps to match. The whole quote word for word and the earlier list, newest first, are still asserted.

**Check 4: suite, build and guard** all pass (above).

**Check 5: regressions.** None found.

**Non-blocking**

N1. V5 with its log gone, whose latest line is the final check `not measured`, has no test.
- The code at values.js:549 is correct: the planned ring, "Not measured · …", never the dashed "?".
- Deleting :549 passes every test (F9). The target then reads "weekly check not recorded yet" with the dashed "?". AC97 rules that out (":13396 never a check late").

N2. Another project's icon guard, `withLine.length === targets.length` at values.js:670, is untested.
- Without it, "3 targets · 2 met · 1 not recorded yet" would get the green ✓.
- The code is correct (my probe gives the half circle), but the plant survives (I3). It matters more now that the "<k> not recorded yet" part exists.

N3. values.js:317-323 has a stale JSDoc block above the newer one. It says the ring applies "after the window even with one [a figure]". The rule is keyed to the final check, not to the phase.

N4. "V4's lines before launch are ignored" (spec :13346, VT1's row) is tested only with no reached date (ac97-values.test.mjs, `L: null`).
- After launch, a V4 `met` line written before launch (from 20 Nov, launch 2 Dec, looked at on 5 Dec) still counts. It reads "Old repository archived 20 Nov", "2 of 2 steps done at launch", "Met".
- This fits AC97's "whatever its dates" and "for V4, any of its lines", but not the plain words of :13346 (see Q1).

**Join-up review (Build: the parts together, for this stage).** I ran these paths through the loaded sandbox page, not each part alone:
- Service-Desk's page → the row → the sheet → the folds → refresh, and Escape (page tests and captures);
- a weekly value check's pull request merged → its Done row → its sheet (j12-value-checks AC66 test);
- the planning project failing to read, or to draw → Alpha's row (j25 :229 and my probe).

All work together. The only gap is B1's missing test; nothing breaks.

**Questions**
- Q1 (Definer): does "V4's lines before launch are ignored" mean (a) ignored only while it is before launch, as built, or (b) lines dated before launch day ignored after launch too? Under (b), the build is wrong for the case in N4.
- Q2 (Orchestrator): this is a stage review inside M3B, not the one closing Build. Should the join-up section be filed, or dropped from this record?

**Files:**
- /home/user/sd-vt1/src/public/sandbox.js
- /home/user/sd-vt1/src/lib/values.js
- /home/user/sd-vt1/tests/desk/j25-value-checks.test.mjs
- /home/user/sd-vt1/tests/desk/ac97-values.test.mjs
- probes and planted bugs: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/mut2/ and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/r2copy/tests/desk/zz-probe-n3.test.mjs

## Round 3
Verdict: PASS

**Scope.** This is round 3 of the Reviewer's check on stage VT1 of S-001 (M3B). I reviewed build/builder/vt1 at c43dd4e in /home/user/sd-vt1: the Builder's commits fa30f72, bbd0e11, 19c2fb2 and c43dd4e, on top of a092039. I planted every bug in a `git archive` copy at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/r3copy, not in the worktree. The worktree is clean at c43dd4e.

**Each round-2 finding is fixed, and each new test fails for its planted bug**
- **B1 (N3's "can't be drawn" half):** the new test is j25-value-checks.test.mjs:245, with `BAD_PR` on the planning project.
  - It first confirms that "Can't show this project" appears on Service-Desk.
  - Deleting the guard at sandbox.js:1506: caught.
  - Restoring round 1's filter (`&& !b.error`, J25 state `none`): caught.
  - Removing just one half of the guard still passes. That is expected, because the two halves always hold together: `draw()` sets `error` whenever `drawError` is set (sandbox.js:5249 and :5253).
- **N1 (V5 with its log gone, the final check `not measured`):** the new test is ac97-values.test.mjs:681. Deleting values.js:549 is caught (it previously survived).
- **N2 (another project's green icon):** the new test is ac97-values.test.mjs:687. Dropping `withLine.length === targets.length` at values.js:670 is caught (it previously survived).
- **N3 (the stale JSDoc):** both blocks are replaced. The comments now say the rule is keyed to the final check, on WN itself or after it. No code changed, and src/lib and src/public/lib are identical.
- **514b33e title nit:** the title now says "Met", matching what the test asserts. Only the title changed.

**Suite, build and guard**
- Full suite (`npm --prefix src test`): 1502 of 1502 pass. That is round 2's 1499 plus the three new tests.
- `node src/tools/build.mjs`: PASS (37 page modules in step).
- surface_guard passes on each of the four commits alone and on a092039..c43dd4e (4 commits). Each commit is authored by `builder` and carries its `Agent-Session` and `Spec: S-001` trailers.

**Nothing regressed**
- I replanted the round-2 bugs on c43dd4e: 38 of 39 caught. The one survivor (F6, the "Weekly check" filter in `notMeasured`) is equivalent: that line never has anything to filter.
- Comparing test titles between a092039 and c43dd4e: three added, one renamed (514b33e's title), none dropped.
- The page and CSS were not touched in round 3. Round 2's page plants (the green icon and the bar-label font) were caught at a092039 by ac88-dark and the page test.

**Join-up review (Build: the parts working together, for this stage)**
I ran these paths through the loaded sandbox page, not each part alone:
- Service-Desk's page → the targets row → the sheet → "<k> earlier checks" and "The whole target" → refresh and Escape (ac97-values-page; round 2's captures);
- a weekly value check's pull request merged → its Done row → its sheet, "not on the Timeline: a weekly value check" (j12-value-checks);
- the planning project failing to read, and failing to draw → another project's row in state 0 (j25-value-checks :229 and :245);
- the all-met state → the green left icon, walked by AC88's cascade and the stage-8 guard (ac88-dark, VT1_OPENS).

All of them work together. No blocking or non-blocking difference.

**Questions:** none. Q1 is settled as built (V4's lines before launch are ignored only while it is before launch, under "whatever its dates"), and Q2 as filed.

**Files:**
- /home/user/sd-vt1/tests/desk/j25-value-checks.test.mjs
- /home/user/sd-vt1/tests/desk/ac97-values.test.mjs
- /home/user/sd-vt1/src/lib/values.js
- my planted-bug runner and lists: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/mut2/
