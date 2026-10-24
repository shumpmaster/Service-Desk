# M3E stage G2: the Design reviewer's confirmation (round 2), verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/g2-waiting at 6d776f2 (fix commits 3e20c1e and 6d776f2, on 6a5b992) (base e808650).

---

Verdict: PASS

**In plain English.** I checked commits 3e20c1e and 6d776f2 and found nothing to fix. A strip card you're dragging now stays visible and lifted under your finger even when the page redraws mid-drag (N1). When the row has been scrolled, the card starts right under your finger the moment the hold lifts it (N2). When the desk can't tell what the strip holds, its words now use the label typeface; only " · " and "none" stay in mono (N3). The suite passes and nothing else on screen changed from round 1.

I judged from `git diff 6a5b992 6d776f2` and the screen, not the commit bodies, and changed no repository file. Everything is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g2-design/confirm/: `after/`, `drag/`, `scripts/`, and the suite log `full-suite.txt`.

**Tests.** `node --test tests/desk/` on the exported 6d776f2 tree passes 1181 of 1181.

**N1, a redraw mid-carry (fixed).** I forced a read and redraw mid-carry (`drag/midrender-drag-slot0-360x740-light-*`).
- After the redraw the row is still `carrying` and the card still `lifted`, at translate(105px,138px). Round 1 had lost both.
- Frame `-3-over-done.png` shows the card carried over Done.
- On release it lands: strip 3 → 2, badge 11 → 10, and the card shows in Done as "Confirming with GitHub".
- Cause of the fix: `keepDrag()` runs after each morph (sandbox.js:2008-2015, 4506).

**N2, lifting from a scrolled row (fixed).** I scrolled the row to the third card (scrollLeft 288), then held it (`drag/drag-slot2-scrolled-360x740-light-*`).
- At the hold the card gets translate(-291px,0) and sits at x 139–344, under the finger and inside the 360 viewport. In round 1 it jumped to x 429, off screen.
- It follows the finger and lands in Done.
- Cause of the fix: `lift()` calls `place()` (sandbox.js:2035).

**The plain drags** at 360 light and 414 dark keep `lifted` throughout and land in Done. No page errors.

**N3, the strip's words (fixed, matches the amended AC91 (f), S-001:8534-8554).**
- "Kicked back" is 500 11px Plex Sans `--ink2`.
- " · " and "none" are 400 11px Plex Mono `--ink2`.
- "not read yet" (pending), "can't read" (signed-out, unread-one-open) and " when last read" are now 500 11px Plex Sans `--ink2`. That is the label role, in all 4 width × theme sets.
- " when last read" shows in a new state I added, unread-one-later: one project shown, readable at first and failing later. The line reads "Kicked back · none when last read".
- Contrast is 6.4:1 light and 7.72:1 dark.
- Code: board.js:85-91 (`stripEmptyParts`), sandbox.js:2284-2287. `.v2-kw` inherits `.v2-kq`'s label role.

**Nothing else changed.** Across 60 captures (15 states × 360/414 × light/dark), every rendered text run (text, size, weight, colour) matches round 1, except:
- the strip's unknown-words runs above, in pending, signed-out and unread-one-open;
- the new state, unread-one-later.

**Part A holds.**
- No sideways page scroll in any of the 60 captures.
- No text under 4.5:1.
- Badges match round 1.
- No page errors.

**Findings.** None.

**Final owner pairs.** Eight PNGs in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g2-design/owner-pairs-final/, each labelled BEFORE e808650 | AFTER G2 6d776f2:
1. 01-equal-lanes-done-shaded-new-360x740-light.png
2. 02-kicked-back-strip-3-cards-360x740-light.png
3. 03-kicked-back-5-cards-row-scrolls-360x740-light.png
4. 04-kicked-back-one-project-360x740-dark.png
5. 05-quiet-kicked-back-none-360x740-dark.png
6. 06-signed-out-kicked-back-cant-read-360x740-light.png
7. 07-md-extremes-25-waits-414x896-light.png
8. 08-touch-drag-into-done-360x740-light.png

Pair 8 has three panels: before, the card carried in the old column; after, carried over Done; after, landed in Done.
