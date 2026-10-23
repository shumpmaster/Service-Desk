# M3D stage 2 (S-001 after MD3): the Reviewer's round 2, with stage 6a round 2 and stage 6b round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 as one hand-back of three reviews: A, stage 2 at 75572bc; B, stage 6a at f5cac07; C, stage 6b at 1946e27 (head 18fa305). Part A is stage 2's.

---

All three reviews pass. There are no blocking findings, and nothing needs to go back to Define or Build. I found two small test gaps, listed as notes under B and C. All the scratch worktrees and copies I made are removed. I changed no repo files and made no commits.

## A. Stage 2 confirmation: build/builder/m3d-2 at 75572bc, on a57ad0e
Verdict: PASS

**Blocking findings:** none.

**Evidence:**
- My mutations D1, D7, D9, F1 and F2 were all caught.
- Suite: 1087 pass, 0 fail.
- build: PASS. check_all: OK.
- surface_guard: OK, 1 commit.
- review_check: R1, with only the expected missing verdict files.
- Only sandbox.js and two test files changed, and no test lines were removed.

**Non-blocking note:** `closedFoldControl` handles only `<details>` folds and the Done lane's "<n> more". A fold drawn by a button draws nothing while closed, so an opener inside one would not be found. No sheet opens from such a fold today.

## B. Stage 6a, round 2: build/builder/m3d-6a at f5cac07, on dc6325c (range db1474e..f5cac07)
Verdict: PASS

**Blocking findings:** none. B1 and B2 are fixed.

**Evidence:**
- **My two-gate probe** (P-003 and P-004, both M3A) now shows both gate cards on Plan, in the board's order. It printed `GATE ROWS ["Service-Desk|gate|queue/P-003-launch-1.md","Service-Desk|gate|queue/P-004-launch-1.md"]`, and BOARD GATES was the same. At dc6325c, P-004 was hidden.
- **W1** (no card counted on a milestone row) is caught by ac89-words-drawing.
- **New mutations:**
  - X1 (keep only the first gate row) is caught by the new B1 case.
  - X3 (reverse the gate order) is caught by the same case.
- **Home's tile agrees with Plan's first gate row.** The tile uses `gateCardOf = gateCardsOf(bd, name)[0]` (sandbox.js:830). Plan maps the same `gateCardsOf` list in the same order (sandbox.js:3403 into workview.js `list.map(gateRow)`).
- **Nothing else changed.** Round 2 touches only workview.js and its copy (byte-identical by `cmp`), sandbox.js, and ac89-words-drawing.test.mjs (+55 lines, nothing removed). The other `.gate` use, sandbox.js:2536 `v.gate`, is the gate sheet's own view and is unrelated.
- **Checks with base db1474e:**
  - Suite: 1123 pass, 0 fail.
  - build: PASS.
  - `check_all.sh . db1474e`: OK.
  - `surface_guard diff --range db1474e..f5cac07 --branch build/builder/m3d-6a`: OK, 2 commits.
  - `review_check.py pr 999 --base db1474e`: R1, no "Flag:" lines, only the expected missing verdicts.

**Non-blocking note (carry as a risk):** mutation X2 survives. X2 makes the tile take the *last* gate card (`.slice(-1)[0]`). The B1 test's tile check only matches "Next: the launch gate, after your ruling". Both made-up cards are Launch gates, so nothing pins *which* card the tile names. The code is right as written. A case with two different gate kinds would close the gap.

## C. Stage 6b: build/builder/m3d-6b, change dc6325c..1946e27, head 18fa305
Verdict: PASS

**Blocking findings:** none.

**Evidence:**
- **Order and merge.** 1946e27's parent is dc6325c. 18fa305 has parents 1946e27 and f5cac07. `git diff 1946e27..18fa305` is identical to `git diff dc6325c..f5cac07`, so the merge adds only f5cac07's change.
- **No R3 path is touched.** No file under src/notify changed in dc6325c..18fa305.
- **Taps stay on the desk's own origin.**
  - sw.js:91-98 now keeps a window only when `u.origin === origin() && !u.searchParams.has('exp')`. `safeAddress` is unchanged.
  - Mutation S3 (drop the origin check) is caught by notify-ac75's AC75 case.
- **The `exp` test can't be fooled.**
  - sw.js reads `exp` through `URLSearchParams`, the same way app.js does (`params.get('exp')`). So encoded forms such as `%65xp` are judged alike in both places, and a window that runs a panel always has `exp` in its address.
  - S1 (no `exp` filter) is caught.
  - S2 (`exp` anywhere in the address) is caught by the `/#/p/exp` case.
  - S4 (filter only `001`) is caught by the `?exp=004#/` case.
- **The hidden header and footer hide nothing the owner needs.**
  - sandbox.css:72 already hid both once the desk started (`html.sb header#top, html.sb footer#foot { display: none; }`). So the new `hidden` attributes in index.html only change the time before the load and the failed-load screen.
  - While loading, the view still says "Checking…".
  - On a failed load, the words are said once, in the view. The state line that also holds them sits in the hidden header.
  - S5, S6 and S11 are caught.
- **Both experiment panels still work.** I ran app.js through its entry with `?exp=004` and `?exp=001`, using a scratch copy of the fake DOM with a hidden `#top` added. Both showed the header (`top.hidden= false`) with their titles, "EXP-004 — prefilled links" and "EXP-001 — CPU and wall time", and drew their content. With no `exp`, the desk kept the header hidden.
- **EXP-004's words are true.** The new Q4 line points to the project page's "Details". The CI line really is in that sheet (`detailsNode`, sandbox.js:1285-1293). No "Universe" is left in app.js.
- **The failed-load screen uses the v2 look.** It adds `sb` and `v2-page`, which are the desk's own classes (sandbox.js:4274-4277; sandbox.css:490 and 499 for dark). It adds sandbox.css if missing, and uses the desk's own error screen markup. S8 and S9 are caught.
- **The rewritten cases hold.**
  - The two removed assert lines are exactly the AC42 and AC89 (h) rewrites.
  - The AC42 case still pins every other line of index.html, CSP included, against the accepted page.
  - The AC89 (h) case pins the new screen markup.
  - The cited lines are correct: specs/S-001.md:7963-7968 is AC89 (m), and :7810-7811 is "Every screen keeps AC81's tokens and AC88's dark theme".
- **Checks:**
  - Suite at 18fa305: 1128 pass, 0 fail.
  - build: PASS.
  - `check_all.sh . dc6325c`: OK.
  - `surface_guard diff --range dc6325c..1946e27 --branch build/builder/m3d-6b`: OK, 1 commit.
  - `review_check.py pr 999 --base dc6325c`: R1, no "Flag:" lines, only the expected missing verdicts.

**Non-blocking note (carry as a risk):** mutation S10 survives. S10 makes `showHeader` set `top.hidden = true`, so the header never shows. The fake DOM in tests/desk/sandbox-helpers.mjs:144 has no `top` element, so the `if (top)` guard skips it in every test. The new test only counts `showHeader();` calls in the text. Nothing checks at runtime that a panel shows its title. My probe shows it works today.

## Open questions
None.

Mutation scripts are kept in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/ (mutate14.py for X1-X3, mutate15.py for S1-S11).