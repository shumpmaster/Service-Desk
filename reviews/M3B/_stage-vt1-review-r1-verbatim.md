# M3B stage VT1: the Reviewer's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/builder/vt1 at 1a2f444 (VT1's work over 5935908).

---

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
