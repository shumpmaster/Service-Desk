# M3E stage G2: the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/g2-waiting at 6a5b992 (base e808650).

---

Verdict: PASS

G2 of "S-001 after the glance audit": I reviewed build/builder/g2-waiting at 6a5b992 on e808650, over e808650..6a5b992, in /home/user/sd-g2.

There are no blocking findings. Waiting now has two lanes of equal width at every width. Done keeps its width and its words when it's empty, and it's shaded as AC91 (f) says. Kicked back is a strip above the lanes. When it holds no card it is one quiet line, "Kicked back · none". When it holds cards they sit in one row, newest first, each card naming its project, and the row scrolls sideways inside the strip only. A card can be carried from the strip into Done. "new" shows only on "Waiting on you" cards raised after "last looked", and it updates on the 15-second tick. The badge and Home's count are unchanged.

Every locked test that changed had to change because of the spec's text, and each still checks at least as much as before. The AC81 one-line change is the honest fix. The guard's G2 exception is exact.

I also checked in real Chromium, which the suite can't do. I wrote only scratch files, under /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g2-review/. The page never scrolls sideways, including in the middle of a real touch drag out of the strip.

## Blocking findings
None.

## What I checked
1. **Two equal lanes (f).**
   - `.v2-lanes` is `minmax(0, 1fr) minmax(0, 1fr)`, 6 px apart (sandbox.css:595). No media query touches it, and no `1.18fr` is left.
   - `BOARD_LANES` = wait, done (sandbox.js:2361).
   - In Chromium at 360 px, both lanes measure 161 px, with three kicked-back cards and with an empty Done.
   - Done keeps "Hold a card and drag it here".
2. **Done shaded.**
   - `.lane-done` (css:602) has `--bg2`, a 12 px radius, `0 8px 10px` padding and `align-self: stretch`. Its head has 6 px padding at the top.
   - In Chromium, Done's height equals the "Waiting on you" lane's (1246 px each).
   - The AC92 (e) test finds Done's ground the only `--bg2` on Waiting, in four states and both themes, with no briefing box.
3. **The strip's forms.** `kickStrip` is at sandbox.js:2257.
   - **Empty:** a `p.v2-kq` with "Kicked back" in `--t-label` `--ink2` and " · none" in `--t-mono` `--ink2`. It has no button, link, svg, list or heading.
   - **With cards:** an `h2.v2-kh` (600 12 px ink) with the count in `.v2-lc`, then a hairline, then `ol.v2-krow` holding `li.v2-kslot` places, each 200 px (`flex: 0 0 200px`), snapping to a card.
   - **Order:** the strip is sorted newest first across all projects (board.js:779). Kicked-back rows are never capped (no `more`).
   - **Project names:** each card names its project after " · ", as `stripProject` = the group's label.
   - **Placement:** the strip sits under the quiet lines, or under the chip when one project is shown, and always directly above the lanes. With one project shown it holds only that project's cards.
4. **Sideways scroll.**
   - Captures at 360 and 414, light and dark, on mix, quiet, kicked, kicked with one project shown, and unread: the page scrolls sideways by 0 px in every one. The strip's row scrolls 288/234 px (three cards) and 80/26 px (two cards) inside itself.
   - My own touch probe used CDP touch events, scrolled the row, held 400 ms, then carried the card into Done. Mid-drag the page still scrolled 0 px, the row stayed 328 px wide, and the card followed the finger. The drop marked the card done. A drop outside Done returned the row to its earlier scroll (208 px).
5. **Unknown states (Part A item 5).** `stripEmptyWords` (board.js:68) gives:
   - "not read yet" or "can't read" for the whole board;
   - with one project shown, AC89 (a)'s words, lower-cased: "none", "none when last read", "not read yet" and "can't read".

   It never says "none" for an unknown. These words match the lanes' own empty words in each state.
6. **"new" (g).**
   - `isNewCard` (board.js:85) is true only for lane 'wait', a finite raised time, and a time strictly after the reference. It is false when markers are off: `lastLooked` is null while `seen.off` (sandbox.js:4442).
   - The strip's kind line returns before "new" is added, and Done rows don't use `kindLine`.
   - The word is part of the kind line's text; `.v2-new` is `--t-label` `--ink` with no box (css:617).
   - Its `_live` and `_liveClass` are re-run on the tick. The test forces the drawing out of step and shows the tick alone corrects it, in both directions. After "last looked" moves, the same element changes in place, and "Mark as seen" clears it.
7. **Counts.** The badge equals Waiting plus Kicked back (8 + 3 = 11 in the capture). The briefing reads "11 need you" and "8 waiting, 3 kicked back". The badge code is unchanged.
8. **Nothing outside G2.** All 13 files are in G2's areas. The sandbox.js hunks are the board's imports, `lastLooked`, the drag code, `kindLine`, `cardNode`'s tag, `kickStrip` and `renderWaiting`. For the lanes' own drags `shift` is 0, so they behave as before. `diff` of src/lib/board.js against src/public/lib/board.js finds no difference.
9. **The locked tests that changed.** Each is marked "Rewritten in G2".
   - **ac80-board:** the lane case, the one-project case, the drag case (now extended with the strip carry and its 120 px scroll correction), the CSS case (now also asserts that 1.18fr is gone) and both Part A item 5 cases. These are named or forced by AC91 (f). The mark-judged case's "Kicked back · Example" is forced by "its kind line names its project". None lost an assertion.
   - **ac81 badge case (ac81:73):** an empty strip has no count by spec, so the change was forced. The case still reads every count from the page: "Kicked back · none" counts as 0, and anything else without a count gives NaN and fails. If the strip wrongly said "none" while cards were kicked back, the badge would no longer match and the case would fail. Its strength is kept, and it is the honest fix.
   - **ac66-67-68:** the lane headings are now two, and it asserts the strip's text in addition. Forced.
   - **ac89-after-md3:** states 1, 4 and 5 now assert the strip's exact words in place of the lane's empty words. Forced, and the strength is equal (exact text before and after).
   - **ac88 vermilion case (ac88:480-490):** the "mark one done" loop is now limited to "Waiting on you". Before G2 it hit a waiting card first anyway. Now the strip comes first on the page, and without the limit the loop would mark the only kicked-back card done. Same intent, and the places check still finds the Kicked back kind icon.
10. **The G2_ONCE guard exception.**
    - Each changed declaration is pinned before and after, per theme, to its own element, matched by parent: `div.v2-lanes` in the board, `.lane-done` and its `h2`, `p.v2-kq` and its two spans, and the hidden `span.v2-new.none` in `.v2-kd`.
    - Set equality is asserted (ac88:837), and the catch-all now leaves out `G[12]` (ac88:839). So nothing pinned goes unused and nothing else is excused. A shown "new" or a strip with cards would fail the guard, not be excused.
11. **Mutations, checked by reading the tests.** Each of these would fail a test:
    - 1.18fr restored;
    - Done shrinking when empty, losing its ground or radius, or not stretched;
    - "none" said for an unknown;
    - the strip sorted per project or oldest first;
    - the project name dropped;
    - a wrong head count;
    - `overflow-x` not auto;
    - another element scrolling sideways;
    - the strip made a drop target;
    - "new" in the strip or Done, `>=` in place of `>`, "new" in `--ink2`, "new" without the tick, or "new" kept after "Mark as seen";
    - the badge or briefing changing;
    - the strip in the wrong place, or unfiltered with one project shown;
    - the carry from the strip without the scroll correction.

## Join-up (the parts working together)
- **Kicked back to Done:** a strip card marked by "Done ✓" or by a drag moves into Done as "Confirming with GitHub". The strip closes to its line when none are left, opens again when a card is kicked back, and loses a card once GitHub confirms it (ac91:255-305).
- **Counts:** the badge, Home's count and the strip's head agree.
- **"new" and Home:** "Mark as seen" on Home clears "new" on Waiting.

I checked these on screen in my scratch captures.

## Commands run
- `cd src && npm test`: 1179 pass, 0 fail.
- `node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . e808650`: "OK: all governance checks passed."
- `surface_guard.py diff --range e808650..6a5b992 --branch build/builder/g2-waiting`: "OK: 2 commit(s) … checked".
- `review_check.py pr 999 --base e808650`: risk R1; needs the design-reviewer's and the reviewer's verdicts. Only those two "missing verdict" lines failed, and no test-weakening flag was raised.
- `node tests/desk/tools/glance-shots.mjs <scratch> g2-`: 20 captures, none scrolling sideways.
- Two touch-drag probes in Playwright Chromium (scratch scripts).
- Both commits are by `builder <builder@agents.invalid>` with `Agent-Session` and `Spec: S-001` trailers. I read only their subject lines and trailers, not the message bodies.

## Non-blocking notes
1. **The spec's G2 row names too few rewritten cases.** Besides AC81's, the AC89 (a) cases (ac89-after-md3:132, :153, :203), AC66's lane case, AC80's mark-judged kind line and the ac88 vermilion loop all changed. Each was forced, but the row names only AC80's cases and "AC81's kept". Route: the Definer's parallel amendment names all of them.
2. **The strip's words for an unknown state are the Builder's reading.** AC91 (f) gives only "Kicked back · none". AC89 (a)'s table covers "an empty lane", which the strip no longer is. The Builder's reading ("not read yet", "can't read", "none when last read") is honest and consistent with the lanes, but the spec doesn't word it. Route: the Definer words it in AC91 (f) or AC89 (a).
3. **The project name's look in a strip card isn't locked.** `span.v2-kp` has no rule of its own and takes `.v2-kd`'s `--t-label` `--ink2`, as mock pK draws it. Tests check only its text, and the guard never walks a strip with cards.
4. **For the Design reviewer:** " · none" in mono, in a plain block, reads with wide gaps ("Kicked back  ·  none") in the quiet capture. The spec asks for mono, so this is a look question only.
5. `tests/desk/tools/glance-shots.mjs:50` has a leftover `void MIX_PROJECT2;` (an unused import). Harmless.
6. The pull request's own Chromium captures still need to be made and judged by the Design reviewer. Mine are scratch only, under /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g2-review/shots/.

## Open questions
None beyond notes 1 and 2.

I changed no tracked file, and the worktree is clean (`git status` is empty).
