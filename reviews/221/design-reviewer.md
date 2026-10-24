Verdict: PASS

The Design reviewer's verdicts on G2 (PR #221), verbatim: round 1 at 6a5b992, then the confirmation at 6d776f2 (fix commits 3e20c1e and 6d776f2). Recorded by the orchestrator.

## Round 1
Verdict: PASS

**In plain English.** G2 does what the owner ruled for Waiting, and it matches the accepted mockup (changes pK, pEq, pD and "new") in substance:
- The Kicked back column is gone. When nothing is kicked back, one grey line reads "Kicked back · none". When cards are kicked back, the strip opens by itself: "Kicked back" with its count, a hairline, then one row of 200 px cards that scrolls sideways inside itself. Each card names its project.
- "Waiting on you" and "Done · last 24 h" now have equal widths: 161 px each at 360, 188 px at 414. Done sits on a shaded, rounded ground the full height of the lanes, and keeps its width when empty.
- Cards raised since "last looked" carry "new" in dark ink. "new" never shows in the strip or in Done, or while the device holds no "last looked".
- The badge counts the same as before in every state.
- A real touch drag carries a strip card into Done.

I found nothing that breaks a ruling, the spec or part A. Two drag problems need noting (N1 and N2). Neither breaks a checklist item, so neither blocks; I recommend fixing N1.

Design review of G2, "After the glance audit" (S-001 AC91 (f) and (g); AC80 changed). Branch build/builder/g2-waiting at 6a5b992, compared with e808650.
- I did not see the Builder's summary: I read the diff, not the commit bodies.
- I changed nothing in the repository. Both commits were exported with `git archive` into scratch. `git status` in /home/user/sd-g2 is clean at 6a5b992.

All evidence is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g2-design/:
- **before/ and after/**: 14 states × 360×740 and 414×896 × light and dark, for e808650 and 6a5b992 (112 captures). Each has a full page, a first screen (`-screen1`) and a JSON file. The JSON holds every text run's size, weight, family, colour, effective ground and contrast, plus a G2 probe (lanes, Done's ground, strip, row, slots, "new"). Each folder also has report.json.
- **States:** mix, mix-nolooked, quiet, quiet-one, kicked, kicked-one, kicked-single, kicked-five, unread, unread-one-open, signed-out, pending, ext, text.
- **drag/**: real touch drags (CDP touch events, the 350 ms hold on the page clock):
  - first card, 360 light;
  - second card, 414 dark;
  - third card after scrolling the row (`-scrolled`);
  - a redraw forced mid-carry, after (`midrender-`) and before G2 (`BEFORE-midrender-`);
  - a sideways swipe.
- **scripts/** (outside the repository): cap2.mjs, probe.js, dump.js, drag.mjs, drag2.mjs, dragbefore.mjs, swipe.mjs, redraws.mjs, rowscroll.mjs, iconprobe.mjs. They use the after tree's fake desk and glance-fixtures for both commits.
- **owner-pairs/**, **vs-mock/** (mock shot beside the build), and the two finding composites.

TESTS
- Full suite `node --test tests/desk/` on the exported 6a5b992 tree: 1179 of 1179 pass. Log: g2-design/full-suite.txt.
- The new tests/desk/ac91-glance-waiting.test.mjs covers:
  - (f): lanes 1 : 1 at 360 and 414; "Kicked back · none"; unknowns in words; the strip's head, order, project and buttons; sideways scroll only in `.v2-krow`; open and close; counts unchanged; Done's ground; AC92 (e)'s filled-ground rule.
  - (g): new and not-new cases, strip and Done, no "last looked", "Mark as seen", and the 15-second tick.

EVIDENCE BY CHECKLIST ITEM

**AC91 (f), equal lanes.** Items 1, 21; P-001-glance-lanes.md C, "two state columns equally sized"; mock pEq.
- `grid-template-columns` computes to 161px 161px at 360 and 188px 188px at 414, gap 6px, in every state (probe.lanes). Before it was 117.3 / 99.4 / 99.4.
- An empty Done keeps its width and "Hold a card and drag it here" (quiet, mix, ext).
- Code: sandbox.css:595, sandbox.js:2361.
- Pairs: owner-pairs/02-*.

**AC91 (f), Done shaded.** Items 1, 10, 13; item 4c; mock pD.
- Done's lane: background rgb(247,247,248) light and rgb(20,21,23) dark (`--bg2`); radius 12px; padding 0 8px 10px; head padding-top 6px.
- Its height equals the lanes' height in every state (kicked: 1246 = 1246; quiet: 83, Waiting 73).
- Its cards keep `--card` (#fbfbfb / #17181b).
- This is identical to pD's CSS. Code: sandbox.css:602-603.
- Text on the shaded ground:
  - head 16.42:1 light, 15.6:1 dark;
  - "Hold a card and drag it here" and group counts 5.97:1 light, 7.41:1 dark.
- The meaning "move cards here" is in words, so item 13 holds.
- Waiting has no soft box, so AC92 (e)'s rule holds (the test at :350).

**AC91 (f), the strip, empty.** Items 1, 4, 5, 8, 14; mock pK.
- quiet, mix, text, ext and quiet-one read "Kicked back · none".
  - "Kicked back" is 500 11px Plex Sans `--ink2` (#5c5f66 / #a2a5ac).
  - " · none" is 400 11px Plex Mono `--ink2`.
  - Contrast is 6.18 to 6.4:1 light and 7.2 to 7.72:1 dark.
  - It has no control, no fold mark and no drop target (probe.strip.controls = 0).
- It sits under the quiet lines, or with one project shown under the filter and above the lanes, with the quiet lines under the lanes (frame 2). Probe `order` confirms both.
- Code: sandbox.js:2257-2269, sandbox.css:608-609, board.js:68-79.

**AC91 (f), the strip with cards.** Items 1, 11, 12, 21; mock pK.
- Head "Kicked back" is 600 12px ink, count 400 11px Plex Mono `--ink2`, then a hairline of 1px `--line`.
- The row has `overflow-x: auto` and `scroll-snap-type: x mandatory`. Its slots are 200 px wide with `scroll-snap-align: start`.
- The row's scroll width against its own width:
  - kicked: 616 against 328;
  - kicked-five: 1032 against 328;
  - kicked-single: 328 against 328 (it does not scroll).
- Cards come newest first across both projects:
  - kicked: Alpha PR (1 min ago), Bravo question (3 min), Alpha gate (7 min);
  - with one project shown, only Alpha's 2 cards.
- Each kind line reads "Kicked back · <project>". Each card keeps its reason, its button (gate buttons 90×26, "Open ↗" 57×41) and a tap to its sheet.
- The kick icon stays vermilion, as it was in the old column (iconprobe: rgb(201,56,12) / rgb(255,106,61) before and after). Kicked-back cards count as waiting on the owner (AC81), so items 14 and 29 hold.
- Card type is unchanged apart from width (99 → 200 px).
- A row scrolled to 208 px stays at 208 px through two redraws over 130 s (rowscroll.mjs).
- A fast sideways touch swipe scrolls the row to its end (288) with no lift, and the page does not scroll sideways (drag/swipe-row-360x740-light.png).
- Code: sandbox.css:610-614, sandbox.js:2257-2269, board.js:779.

**AC91 (f), drag into Done.** Items 1, 21; ruling C's "new drag code".
- Touch drag of the first card at 360 light (drag/drag-slot0-360x740-light-*):
  - the hold lifts the card and the row gets `carrying`;
  - the card follows the finger (translate(105px,138px) at mid);
  - dropped over Done, the strip goes 3 → 2, the card shows in Done as "Confirming with GitHub … Open ↗ Undo", and the badge goes 11 → 10.
- The second card at 414 dark lands the same way.
- The page never scrolls sideways during a carry. No page errors.

**AC91 (g), "new".** Items 1, 13, 14, 18; P-001-glance-new.md A; mock "new".
- In mix ("last looked" 5 h ago), "new" shows on the gate (4 h 30 m) and the decision (3 h 20 m). It does not show on the question (6 h 40 m) or the PR (8 d), nor on the hold and merge cards, which have no raised time.
- Style: 500 11px Plex Sans in ink, 16.99:1 light and 15.15:1 dark, no box, on one line.
- It is part of the kind line's text ("Gate · Build new").
- It never shows in the strip or in Done (kicked: 3 shown, all in the Waiting lane). mix-nolooked shows 0. ext ("last looked" 9 days ago) shows 17 of 25.
- Code: board.js:85-89, sandbox.js:2071-2085, 1712, 4442; sandbox.css:617-618.

**Items 3 and 22 (waiting is real; badge).** The badge is identical before and after in every state (11, 12, 6, 25; none when nothing waits).

**Items 4 and 5 (quiet is honest; unknowns in words).**
- pending reads "Kicked back · not read yet".
- signed-out and unread-one-open read "Kicked back · can't read".
- These follow the lanes' own rule (sandbox.js:1876-1884) and AC89 (a)'s table. "none" never shows while nothing is read.

**Items 10 and 25 (contrast, both themes).** No text run under 4.5:1 in any of the 112 captures, before or after (report.json). Done's shaded ground is included. The lowest changed text is 5.97:1.

**Item 12 (width).** scrollWidth equals clientWidth in all 112 captures and in every drag and swipe frame.

**Item 6 (every project).**
- service-desk and poom's placeholder (text) render with no page errors.
- md-extremes (ext: 25 waits, long unbroken titles) renders in the 161 and 188 px lanes with no page errors.

**Items 8, 23, 27 (type roles, typeface, sizes).**
- Fonts loaded: Plex Sans 400/500/600 and Plex Mono 400.
- Every changed run is 11 or 12 px at 400, 500 or 600. Board text at 11 and 12 px is on v2's scale.

**Items 9, 15, 24.** G2 adds no text box and no sheet. Its only motion is scroll snap; `.lifted`'s rotate keeps its reduced-motion rule (sandbox.css:656).

**Part B (item 26) against the mockup** (vs-mock/*). It matches in substance. The differences each follow the spec's words:
- the empty line has " · " and 11 px type (mock: "Kicked back  none" at 12 px);
- there is no chevron on the open strip's head (AC91 (f): "no control folds it");
- "new" sits right beside the label, not pushed to the right edge ("beside its kind label").

**Nothing else moved.** Text, size, weight and colour runs differ between the commits only by the G2 changes and clock noise. Examples: the Kicked back lane's "0" and "Nothing here" are gone; the strip's line is added; the group heads "Alpha" and "Bravo" become "· Alpha" and "· Bravo"; "new" is added.

BUILDER CHOICES, JUDGED
1. **Unknowns in words, not "none".** Correct under items 4 and 5 and the pack's settled conflict 1. Keep it. On its type, see N3.
2. **Project name kept on strip cards with one project shown.** Acceptable. AC91 (f) makes no exception for one project, and the card looks the same in both views. It repeats the filter chip: kicked-one, owner-pairs/04-*.
3. **200 px slots with snap.** This is what AC91 (f) and pK say. At 360 one card shows whole and 120 px of the next shows, so the owner can see there is more.
4. **Done's padding from pD.** Exact.
5. **The row stops scrolling while a card is carried.** It works in the plain case, but it causes N2, and N1 undoes it.

FINDINGS (none blocking)

**N1 (G2 makes an existing weakness worse; recommend fixing).** A redraw during a carry hides the carried strip card.
- What happens: Waiting redraws about once a minute, with each read. redraws.mjs counted 5 redraws in 240 s that wiped added classes. So a 1 to 2 s carry hits one about 2 to 3 % of the time.
- The redraw resets the row's class and drops `carrying` (added at sandbox.js:2014). The row goes back to `overflow-x: auto`, which clips both ways, and the carried card disappears inside the row. The owner's finger is over Done with nothing under it.
- The drop still lands: strip 3 → 2.
- Before G2 the same redraw dropped `.lifted` and the card slid behind Done's cards, still partly visible.
- Evidence: finding-N1-redraw-mid-carry-360-light.png (before, after, and after with no redraw); drag/midrender-drag-slot0-360x740-light.json (rowCls "v2-krow" after the redraw).
- The fake-DOM tests can't see it.

**N2.** Lifting a card after scrolling the row makes it jump off-screen until the finger moves.
- With the row scrolled to the third card (scrollLeft 288), the hold resets the row to 0, so every slot jumps from [-272, -64, 144] to [16, 224, 432].
- The held card's box goes to x = 429, beyond the 360 viewport, because lift() (sandbox.js:2004-2015) sets no transform. Only the first pointermove applies `dx - shift` (sandbox.js:2046).
- On the first move the card is back under the finger (box x = 176).
- Evidence: finding-N2-lift-after-row-scrolled-360-light.png; drag/drag-slot2-scrolled-360x740-light.json.

**N3 (items 8 and 19).** "not read yet" and "can't read" are set in Plex Mono, because they share the " · none" span (`.v2-kn`, sandbox.js:2263).
- "none" in mono follows AC91 (f), where it stands in place of a count. The plain-English unknowns read as code, though.
- Evidence: owner-pairs/06-*.

**N4 (note, as drawn).** Short strip cards stretch to the tallest card in the row, so their lines spread apart.
- `.v2-kslot` is a grid and the card's rows stretch. Mock r4c-cards shows the same, milder.
- Evidence: kicked-360x740-light-screen1.png, the first card.

**N5 (note, as drawn).** Done's shading is very faint: ground against page 1.07:1 light and 1.04:1 dark. Mock pD draws exactly this, and no contrast bar applies to a ground. Whether it reads as "shade the done section" is for the owner to judge on the preview.

OPEN QUESTIONS
- **Q1 (Orchestrator):** fix N1, and perhaps N2, in this stage's next round, or file them as follow-ups? Neither breaks a checklist item.
- **Q2 (Definer):** should an unknown on the strip's line use `--t-label` for its words and keep `--t-mono` for "none" only (N3)? AC91 (f) names only "none".
- **Q3 (Definer, perhaps the owner):** in the whole-board view with one project unreadable (state unread), the strip says "none". That follows the lanes' rule, unchanged from the old column's "Nothing here". But kicked-back state for that project's cards can't be checked while it is unreadable. Should the line say so? This is the same family as G1's Q2.

BEST BEFORE/AFTER PAIRS FOR THE OWNER (BEFORE e808650 / AFTER G2 6a5b992). All are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g2-design/owner-pairs/, most also in the other width or theme:
1. 02-mix-equal-lanes-done-shaded-new-360-light.png: equal lanes, shaded Done, "Kicked back · none" and "new".
2. 03-kicked-strip-3-cards-360-light.png: the column becomes the strip; three cards from two projects, each named.
3. 05-kicked-five-row-scrolls-360-light.png: five kicked back; the row scrolls inside itself while Waiting on you gets the width.
4. 04-kicked-one-project-360-dark.png: one project shown; the strip under the filter.
5. 01-quiet-strip-none-360-dark.png: nothing waiting; the one quiet line and the shaded empty Done.
6. 06-signed-out-strip-cant-read-360-light.png: "Kicked back · can't read", never "none".
7. 07-md-extremes-25-waits-414-light.png: 25 waits and long titles in the wider lane.
8. 09-touch-drag-strip-card-into-Done-360-light.png (after only, four frames): hold, carry, over Done, landed as "Confirming with GitHub".

Mock beside the build: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g2-design/vs-mock/ (r4c-cards, r4c-empty, r4c-dark, 11-new).

## Confirmation (round 2)
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
