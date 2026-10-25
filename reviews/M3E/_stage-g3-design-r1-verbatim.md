# M3E stage G3: the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/g3-gate-titles at da491c2 (base 648dcd2).

---

Verdict: PASS

**In plain English.** G3 gives every gate one short title taken from its own card, and that title now reads the same in all four places:
- **On Waiting:** "The Launch gate, case 1 · P-004", "The Launch gate, case 2 · P-005", or "The Build gate · P-002" for a card with no case line.
- **As its sheet's title.**
- **On Plan's gate row.**
- **On its Done row.**

Two cards at the same gate can now be told apart at a glance. Before, both read "The Launch gate: the launch review passed…", cut off after three lines. Each title fits in one or two lines at 360 px. The gate's full question still opens the sheet, in the larger lead type, cut at three lines with a fade and "Read it all". Home, "Since you last looked" and the project page did not change. The build matches the accepted mockup (item 5) in substance. The only difference is the words: the spec takes them from the record instead of the mockup's stand-in "ready to go live?". I found nothing that breaks a ruling, the spec or part A. The four notes below do not block.

Design review of G3, "After the glance audit" (S-001 AC91 (h); AC80, AC85, AC86 and AC89 (j) changed). Branch build/builder/g3-gate-titles at da491c2, compared with 648dcd2.
- I did not see the Builder's summary: I read the diff, not the commit bodies.
- I changed nothing in the repository. Both commits were exported with `git archive` into scratch. /home/user/sd-g3 is clean at da491c2.

All evidence is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g3-design/:
- **before/ and after/**: 20 states × 360×740 and 414×896 × light and dark, for 648dcd2 and da491c2 (146 captures each side).
  - Each capture has a full page, a first screen (`-screen1`) and a JSON file.
  - The JSON holds every text run's size, weight, family, colour, effective ground and contrast. It also holds a G3 probe: each gate title's text, lines, cut, max-height and mask; `.v2-gitem`; the sheet's meta, title, opening and folds; Plan's gate rows; Done rows.
  - Each folder has report.json.
- **States:**
  - Waiting: waiting-gates, waiting-nocase, mix-waiting, ext-waiting.
  - Sheets: sheet-case1, sheet-case1-leadopen, sheet-build-nocase, sheet-case1-nocaseline, plan-sheet-case2.
  - Plan: plan-gates, plan-nocase, plan-gates-scrolled, plan-nocase-scrolled.
  - Elsewhere: done-gate, home-gates, project-alpha.
  - longitem-waiting, longitem-sheet, longitem-sheet-titleopen and longitem-plan use a made-up card whose `item:` is "P-004-a-made-up-long-unbroken-item-name-for-the-cut", to force the two-line cut. This is scratch only, NOT a real record.
- **tool-after/**: the Builder's own tool, `node tests/desk/tools/glance-shots.mjs <out> g3-`, run on the after tree (8 states × 4).
- **mock/**: the mockup's 05a, 05b and 05c before and after shots, as PNG with side-by-side pairs.
- **scripts/**: cap3.mjs, cap3s.mjs, cap3p.mjs, probe3.js, dump.js and pairs.py. They serve each commit's src/public with the after tree's fake desk and glance fixtures.

TESTS
- Full suite `node --test tests/desk/` on the exported da491c2 tree: 1186 of 1186 pass. Log: g3-design/full-suite.txt.
- Run directly, `gateTitle` behaves as specified:
  - "The Launch gate, case 1." gives "The Launch gate, case 1 · P-004".
  - "case 12" with no full stop is accepted. Leading and trailing spaces are trimmed.
  - Each of these falls back to "The Launch gate · P-004": "…, case 1, again.", a lower-case line, a Build case line on a Launch card, and no line at all.
  - A card not read yet gives "The Launch gate · P-007", and its opening is null.
  - An empty section 1 gives the opening "not recorded".
- `GATE_TITLE` in j11.js:30 is the same as orchestrator.py:105, and the case line is the one written at :894-895.

EVIDENCE BY CHECKLIST ITEM

**AC91 (h), the short title on the board.** Items 1, 2, 21; mock 05a.
- waiting-gates gives "The Build gate · P-002" (1 line), "The Launch gate, case 1 · P-004" (2 lines) and "The Launch gate, case 2 · P-005" (2 lines) at both widths.
  - The title is 500 12px Plex Sans in `--ink`: 17.58:1 light, 15.x:1 dark.
  - Before, the two Launch cards read the same, cut at 3 lines with the fade.
- waiting-nocase gives "The Launch gate · P-004" and "· P-005", each on 1 line.
- `.v2-card.gate .v2-tt` max-height is 31.92px (2 × 1.33em) and is used on every gate card. Every other card title keeps 47.88px (3 lines; ext-waiting and mix-waiting probe.otherTitles).
- Kind line, Critic and User rep lines, meta, buttons and badge are unchanged. The text-run diff before and after differs only in the title runs.
- Code: board.js:394-395, sandbox.js:2183-2195, sandbox.css:1263-1269.
- Pairs: owner-pairs-final/01-*, 06-*.

**AC91 (h), the sheet's title and opening.** Items 1, 8, 15, 16; part B item 33; mock 05b.
- Title: "The Launch gate, case 1 · P-004" in 600 18px (`--t-sheet`). It takes 2 lines at 360 and 1 at 414, with max-height 46.8px (2 × 1.3em). It shows no fold when it fits.
  - The sheet's label is the same short title.
- The opening comes next: the card's whole first line, word for word ("The Launch gate: the launch review passed. … Proceed, hold, recycle or kill?").
  - Type: 400 15px/1.45 (`--t-lead`), ink.
  - It is cut at 3 lines (65.25px) with the 60% mask, with "Read it all" under it.
  - Opened, it shows 5 lines at 360 and 4 at 414, with "Show less" (sheet-case1-leadopen).
- Order (probe.sheet.order): head, opening, "Read it all", "The case opens" (quote 400 13px `--t-body`, still 3 lines faded, "Read the whole case ↗"), "Their views", then the four choices with "Can't be undone" on Kill.
- The Build card's opening, "The plan passed review. Pass the Build gate, hold, recycle or kill?", takes 2 lines with no cut and no fold.
- The ✕ stays 44×44. "Read it all" is 64×28.
- Code: sheets.js:217-250, sandbox.js:2686-2694, 2803.
- Pairs: 02-*, 03-*.

**AC91 (h), Plan's gate row.** Items 1, 2; AC86; mock 05c.
- The title is "The Build gate · P-002" / "The Launch gate, case 1 · P-004" / "The Launch gate, case 2 · P-005", one line each at 360 and 414. It is 500 13px ink.
  - Before, each took 2 to 3 lines, the two Launch rows read alike, and both were cut.
- The row's max-height is 35.1px (2 lines).
- Under each title the mono line still reads "<Phase> gate · waits on you", and "after your ruling" sits on the right, as the brief asks.
- Code: sandbox.css:1186-1188, sandbox.js:3666-3673, workview.js:76-86.
- Pair: 04-*.

**The cut at two lines and the item kept whole.** Items 12, 16; AC42.
- With the made-up long item, the board card, the sheet title and the Plan row each show 2 lines, are cut, and carry the mask.
- The sheet title gets its own "Read it all". Opened, it shows 4 lines at 360 and 3 at 414 with "Show less".
- `.v2-gitem` (inline-block) moves "P-004" or "P-005" to the next line as one piece in every normal case.
- An over-long item still wraps inside itself, with no sideways scroll (finding-longitem-after-360-light.png).

**Builder choices, judged.**
1. **The case line is taken only when it reads exactly "<GATE_TITLE>, case <n>"** (full stop optional): correct; see TESTS.
2. **Plan still says "<Phase> gate · waits on you" under the title, so the phase is said twice:** acceptable. AC86's mono line is unchanged and AC91 (h) changes only the title. See N1.
3. **Done rows show the short title** ("The Launch gate, case 1 · P-004", 400 12px `--ink2`, 6.18:1 light, 7.2:1 dark): correct. Done takes the board's card title (pair 05-*).
4. **Home's tile line is unchanged.** In this fixture it reads "the Build gate, after your ruling" for Alpha. **"Since you last looked" keeps the long first line** ("New card: The Launch gate: the launch review passed…"). Home's 113 text runs are the same before and after (home-gates). The project page's 66 runs are also the same (project-alpha).
5. **The item kept whole with an inline block, not `nowrap`:** correct under AC42, as shown above.
6. **For an unread card, "The card's file: not available" in place of the opening:** acceptable. The unknown is in words (item 5). I could not reach it on screen with the fixtures; it is checked in code only (sandbox.js:2694).

**Items 3 and 22 (waiting is real; badge).** The badge is the same before and after in every state (8, or 7 with the Done mark). No card's lane or count changed.

**Items 5 and 19.**
- The title's words come from the record, never reworded. The mockup's "ready to go live?" is not used, as the spec says.
- Plain words come first and the code after them.
- In the title the item is in Plex Sans, not mono. AC91 (h) makes it part of the title, and mock 05a/05b draw it the same way, so the spec governs; see N2.

**Items 10 and 25 (contrast).** No text run under 4.5:1 in any of the 292 captures, before or after. The lowest changed run is 6.18:1 light and 7.2:1 dark (the Done row).

**Item 12 (width).** scrollWidth equals clientWidth in all 292 captures, the long-item state included. The Builder's tool reports no sideways scroll either.

**Item 6 (every project).**
- service-desk and Alpha (mix, gates) render with no page errors.
- md-extremes (ext-waiting): four Build-gate cards read "The Build gate · P-002", each under its own project's head, with no errors.
- The poom placeholder is not touched by G3.

**Items 8, 23, 27 (type roles, typeface, sizes).**
- Fonts loaded: Plex Sans 400/500/600 and Plex Mono 400.
- The changed runs are 18/600, 15/400, 13/500 and 12/500 or 400, all on v2's scale.
- Title, lead and quote are three distinct roles.

**Items 9, 11, 13, 14, 24.**
- G3 adds no text box, no colour, no vermilion and no motion.
- Tap targets: ✕ 44×44, fold 64×28, gate buttons unchanged.

**Part B (items 26 and 33) against the mockup.** It matches 05a, 05b and 05c in substance: a two-line title on the card, a short sheet title with the long sentence moved into the lead, and a one-line Plan row. Each difference follows the spec's words:
- the title is "The Launch gate, case 1 · P-004", not "P-003: ready to go live?";
- the sheet's lead keeps "The Launch gate:" at its start, because AC91 (h) says "word for word";
- as the mock's README saw too, the choices do not move up. On the Build sheet they sit about 20 px lower (pair 03-*).

FINDINGS (none blocking)

**N1 (note; items 1 and 19).** The gate is named twice on the board card ("Gate · Build" kind line, then "The Build gate · P-002") and twice on Plan (title, then "Build gate · waits on you"). The item is also named twice on the card (title, then the meta "P-002 · 4 h 30 m") and in the sheet (meta, then title).
- This is the spec's own choice of words, not a fault, and the audit's goal of telling two cards apart is met.
- Evidence: pairs 01-*, 03-*, 04-*.

**N2 (note; item 19).** The item inside the short title is set in Plex Sans at title size, not small mono. AC91 (h) and the mockup both put it in the title, so the spec governs.

**N3 (note).** With an over-long title, the sheet shows two "Read it all" folds one after another: the title's, then the opening's. Only my made-up long item triggers it; real items like "P-004" never do.
- Evidence: finding-longitem-after-360-light.png.

**N4 (note).** The Done row's title (a.v2-t) does not use `.v2-gitem`. A wrap could therefore split "P-" from "004" there. In practice it wraps "…case / 1 · P-004" at 360 and keeps the item whole.

**Pre-existing, not changed by G3.**
- Gate sheets drop the user rep's verdict when the owner is the user. The card says "User rep: reject"; the sheet's "Their views" shows the Critic only. This is already in docs/design/audit-2026-10-24.md, around line 197.
- The project page's waits row still reads "the Launch gate · the Launch gate" for two cards at one gate (project-alpha). AC91 (h) does not name that row.

OPEN QUESTIONS
- **Q1 (Definer):** should the gate card's meta drop its repeated item, or Plan's mono line its repeated "<Phase> gate", now that the title carries both (N1)? AC80 and AC86 keep them as they are.
- **Q2 (Definer, perhaps the owner):** should the project page's waits row also name the case for two cards at one gate? It is outside AC91 (h).

BEST BEFORE/AFTER PAIRS FOR THE OWNER (BEFORE 648dcd2 | AFTER G3 da491c2), labelled side by side, in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g3-design/owner-pairs-final/:
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g3-design/owner-pairs-final/01-waiting-gate-cards-360x740-light.png: three gate cards. The two Launch cards stop reading alike: "case 1 · P-004" and "case 2 · P-005".
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g3-design/owner-pairs-final/02-gate-sheet-title-and-opening-360x740-light.png: the sheet's short title, then the whole question as the opening (3 lines, faded, "Read it all").
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g3-design/owner-pairs-final/03-gate-sheet-no-case-line-414x896-dark.png: a card with no case line, "The Build gate · P-002".
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g3-design/owner-pairs-final/04-plan-gate-rows-360x740-light.png: Plan's three gate rows, one line each, "Launch gate · waits on you" under them.
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g3-design/owner-pairs-final/05-done-row-short-title-360x740-dark.png: a gate card marked Done shows the short title.
6. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g3-design/owner-pairs-final/06-waiting-cards-without-case-lines-414x896-light.png: cards written before the case line existed, "The Launch gate · P-004" and "· P-005".

Mock beside the build: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g3-design/mock/ (05a-gate-board-pair.png, 05b-gate-sheet-pair.png, 05c-gate-plan-pair.png).
