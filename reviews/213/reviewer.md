Verdict: PASS

## Stage 8: build/builder/m3d-8 at 6768dc7, range 3cc503c..6768dc7 (d01eede, 6768dc7)

Stage 8 passes. All eleven tests in (b) item 37 exist, and each catches the fault it names. There are no blocking findings. I'm carrying three non-blocking notes, listed below.

**Blocking findings:** none.

**Evidence: each test in (b) item 37 (specs/S-001.md:2248-2258).** I ran each mutation on a scratch copy.
1. **J18's bad head key** (notify-j18-rule0, the new `[{ v: {}, h: { [hex(1)]: good } }, 'a head']` case). J1, which drops `HASH_RE.test(k)` from src/notify/state.mjs:120, is caught.
2. **The reason row's index, probe p9** (new AC82 with AC24 case in ac82-home). P1, `rows[0]` in place of `rows[r.finish.stop.index]` (workview.js:250), is caught.
3. **The `^` anchor and the lone backtick** (new AC85 case in ac85-sheets). L1, `\b` in place of `^` in `defaultLetter` (records.js:327), is caught.
4. **The ✕ icon's colour as drawn, and Details' CI line.**
   - The new ac84 case catches a heavier rule giving the icon `--ink`, both for `color` (X2) and for `stroke` (X3). My first try, X1, used a selector that didn't match the icon, so it proves nothing.
   - The new ac83 case catches C1 (the CI line back to `NOT_RECORDED`).
5. **AC87's version-read case and its record slips** (6a-R1, notes 5 and 6). These were already done in desk v2's stage 6a round-1 fix, 361b6b7: the A3 case at ac87-portfolio:359, the README line at 543, and the "More detail" comment at sandbox.css:855. V1, which makes every project read the root `VERSION` (model.js:364), is caught by the A3 case.
6. **The tile's and the cap's "since" in `ownerTimeZone`** (ac87-portfolio, +4 lines). Z1 (the tile, sandbox.js:872, in UTC) and Z2 (the cap, sandbox.js:978, in UTC) are both caught.
7. **The css-cascade helper failing loudly.** The new css-cascade.test.mjs catches K1 (an unknown pseudo-class back to `return false`), K2 (no shorthand merge) and K3 (opacity not multiplied down the tree).
   - **Honest cases still read.** The desk's stylesheets use only @font-face, @keyframes, @media and the pseudos the helper knows: `::before`, `::after`, `::placeholder` and `::-webkit-details-marker`.
   - **The merge agrees with today's CSS.** The one colour longhand, `.sb-qrow.g-decisions { border-left-color }` at sandbox.css:236, is more specific than `.sb-qrow`'s `border-left`, so it rightly wins.
8. **A guard on each role's font size** (ac88-dark, `ROLE_PX`). F1 (a text at 14 px) is caught by the AC88 test.
9. **The stage-8 guard walking the new states** (tap banner, render error, signed out, can't read).
   - T1 (`.sb-tap.gone { padding-top: 3px }`) is caught at 6768dc7 and **survives at 3cc503c**. So the new walk adds real coverage.
   - Each state is asserted as drawn before it is compared.
10. **The AC18 note's eye** (ac17-18-sheets). E1 (`vi('bad')` in place of `vi('eye')`, sandbox.js:2304) is caught.
11. **Vermilion, as AC69's note lists it** (the new ac88 test, citing :6219-6236, correctly). R1 (vermilion text on `.v2-plv`) and R2 (a vermilion chevron) are both caught. The test also asserts that each of the four listed places was met.

**The pinned exception is exact.**
- `M3D4_OF` pins `position`, `flex`, `max-height` and `overflow: clip` on `span.sb-brow-of`, in both themes.
- The rule's other two declarations, `min-width: 0` and `overflow-wrap: anywhere`, already come from `.sb-screen *` (sandbox.css:81), so they are not differences.
- The fade (`.over::after`) is not drawn at rest.
- The excepted set still equals the pinned set (the `deepEqual` on `/^M3D4 /`). T2 (`max-height: 2em`) is caught.

**Nothing was weakened or dropped, and no src/ file changed.**
- Every removed line in the range is rewritten or extended in place: the walk regex, the M3D4 maps and their comment, the helper's lines, and the J18 list's closing line. No assert is dropped.
- `git diff --name-only 3cc503c..6768dc7` lists only tests/desk files.

**It holds once stage 4 (7349555) is merged.** On an uncommitted scratch copy, c4b66e9..7349555 applied cleanly onto 6768dc7 (c4b66e9 is an ancestor; one import hunk needed fuzz, and the result was correct). The full suite there passes 1146 of 1146, including the walk over `now/<lane>` and the exact M3D4 pin.

**Checks at 6768dc7:**
- Suite: 1145 pass, 0 fail.
- build: PASS.
- `check_all.sh . 3cc503c`: OK.
- `surface_guard diff --range 3cc503c..6768dc7 --branch build/builder/m3d-8`: OK, 2 commits.
- `review_check.py pr 999 --base 3cc503c`: R1, no "Flag:" lines. The only verdict it requires is reviewer.md, as the spec says for a stage that doesn't touch src/public.

**Non-blocking notes (carry as risks):**
1. **A wrong spec citation (route: Build).** The new ac84 case (ac84-timeline.test.mjs:483) cites "specs/S-001.md:6512-6516 (AC81: a mark keeps its word, in the marks' colour)". At 6768dc7 those lines are Waiting's "Kicked back" lane. The rule is at :7072-7074 ("drawn as a small inline SVG icon in `currentColor` … each keeps its word"). The neighbouring older ac84 cases (:65, :477, :514) carry the same out-of-date line numbers.
2. **The font-size guard lets 16 px through for any text.** `ROLE_PX` includes 16 for text boxes (AC63) but applies it everywhere. F2 (`.v2-plv` at 16 px) passes the AC88 size check and is caught only by the stage-8 look guard, which a later stage may rewrite or retire.
3. **The helper's loud failure has edges.**
   - A pseudo-class throws only when it is matched against a drawn node, and the "read whole" case only parses. So an unknown pseudo-class on an element no walked screen draws stays silent, though it can't misread anything walked.
   - `border-left` and the other side and logical border shorthands are not keys in `SHORTHANDS`, so a later `border-left` wouldn't reset an earlier `border-left-color`. Nothing in today's CSS hits this.

## Open questions
None.

My scratch worktree, copies and the scratch merge are removed. I changed no repo files and made no commits. The mutation script is kept at /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/mutate17.py.
(Recorded verbatim by the orchestrator from reviews/M3D/_stage-8-review-r1-verbatim.md. The Reviewer's two later confirmations, both passes, are _stage-8-review-r2-verbatim.md and _stage-8-review-r3-verbatim.md.)
