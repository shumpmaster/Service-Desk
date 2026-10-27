# M3B stage VT1: the Reviewer's round 2 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/builder/vt1 at a092039 (VT1 round 2, over 5935908 with draft 11 merged).

---

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
