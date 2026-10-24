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

(Recorded verbatim by the orchestrator from reviews/M3D/_stage-2-review-r2-verbatim.md, part C, which is stage 6b's.)
