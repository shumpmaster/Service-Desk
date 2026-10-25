Verdict: PASS

The Design reviewer's verdicts on G7b (PR #230), verbatim: round 1 at 4167c78 (PASS), then round 2 at 9fcc448 (PASS). Recorded by the orchestrator.

## Round 1
Verdict: PASS

**Summary for the owner.** One gap in my checks first: I couldn't finish the full desk test suite. The run was stopped from outside after 1,014 tests had passed and none had failed. The stage's own tests and the colour-guard tests all passed (16 of 16). Nothing else was skipped.

The change does what your ruling asked. When a project can't be read, "Since you last looked" now ends with one plain grey line per project, for example "Alpha not read since 10:01, its lines may be missing". The lines come in the order of the project tiles. They have no icon, no red and no link, and they are not counted in "37 more". They wrap at 360 px wide, nothing is cut, and the page never scrolls sideways.

They read as a footnote, not as an error. They are smaller and greyer than the red "Not read since…" line above them, sit close under the list, and are clearly set apart from the projects below.

The page does now say "can't read" several times: in the summary box at the top, in the red line, in the grey lines, and on each tile. You chose that knowingly: option B, which you turned down, said the summary box and the tile already say it. Three small inconsistencies follow from the spec as written, not from the build, so I've put them to you as questions rather than failures. The change is fully reversible.

**Blocking findings**
None.

**Evidence, per checklist item** (captures at 360×740 and 414×896, light and dark, with Chromium. IBM Plex Sans 400/500/600 and Plex Mono were confirmed loaded before judging type.)
- **Spec, AC91 (c), as changed (item 2):** all parts hold.
  - Words, verified in the rendered text: "Service-Desk not read since 10:01, its lines may be missing", "Service-Desk not read in this opening, its lines may be missing" and the long name "Epsilon-with-a-very-long-project-name-that-wraps not read since 10:02, its lines may be missing".
  - Each project's own time equals the summary box's "Can't read <project> since HH:MM" in every capture.
  - Order follows the tiles: Alpha, Service-Desk, Personal-Org-Operating-Model; and in md-extremes, Beta then Epsilon.
  - "37 more in the last 7 days" and "12 more…" are the same before and after.
  - No line while a project is still "Checking…", and a line goes once its read succeeds: covered by tests/desk/ac91-g7b-since-missing.test.mjs (16/16 pass with ac88-dark).
  - Code: src/public/lib/home.js:692-697; src/public/sandbox.js:840-846 and :1021-1031; src/public/sandbox.css:799.
  - src/lib and src/public/lib copies of home.js are identical.
- **The ruling (item 1):** P-001-glance-since-incomplete.md, A — "one grey line under it … one line per unreadable project". Kept.
- **Quiet is honest (item 4):** the red "✕ Not read since HH:MM" / "Not read in this opening" line is unchanged. "Nothing new since" never shows.
- **No made-up figures (item 5):** each time comes from that project's read. Where no read succeeded in this opening, it says so in words.
- **Every project (item 6):** service-desk (unread states), poom (Personal-Org-Operating-Model's line when signed out) and md-extremes (ext, ext-more). Sideways scroll is 0 px in all 24 of mine and all 20 of glance-shots' g7b- captures, and no line is cut.
- **Type roles and sizes (items 8 and 27):** 400, 12 px / 16.8 px, IBM Plex Sans, that is `--t-small`. On the mockup's scale, and distinct from the 13 px list rows and the 11 px/500 head.
- **Contrast (items 10 and 25):**
  - Light: `--ink2` #5c5f66 on #fff is 6.40:1.
  - Dark: #a2a5ac on rgb(15,16,18) is 7.72:1.
  - The red line beside it is 6.85:1 light and 6.91:1 dark.
- **Colour (items 13, 14 and 29):** no svg, no `--bad`, no `--you`. The meaning is carried in words.
- **Spacing:** the lines start 6 px under the box of the red line or of "<n> more" (about 11–12 px between the texts), with 2 px between lines. The section heading below starts 12 px after them (about 22 px visually). So they group with the list, not with the tiles. The page grows 23 px for each one-line entry and 34–36 px for each that wraps.
- **Wrapping:** the 360 px lines break at spaces (style.css's `overflow-wrap: anywhere` on p); the long name stays whole on one line.
- **Screen reader:** these come after the "Since you last looked" heading, in visual order: the red paragraph or the "<n> more" link, then one plain paragraph per project. None is a link.
- **Items 9, 11, 15, 16, 17, 18, 21, 22, 24:** not touched (no text box, tap target, sheet or motion added).
- **Item 20 (times):** times are in the desk's Chicago zone, the same function the summary box uses.
- **Part B:** mockup v2 doesn't draw this line, so it is judged by part A alone.
- **Tests:** G7b and ac88-dark 16/16 pass. The full suite (`node --test tests/desk/`, in the exported after tree) reached 1,014 ok and 0 not ok before it was stopped from outside (exit 144), so it is unfinished.

**Non-blocking notes**
- N1. **The page says "can't read" several times.** With one project failing and nothing new, the first screen has:
  - the summary box's red "✕ Can't read Service-Desk since 10:01";
  - the red "✕ Not read since 10:01";
  - the grey "Service-Desk not read since 10:01, its lines may be missing";
  - the group head's red "1 can't be read";
  - the tile.

  Signed out, it is the red "Not read in this opening" followed by three grey "…not read in this opening…" lines. The grey lines are clearly the weaker voice and don't compete. But the red line and the grey lines now carry nearly the same words. The spec keeps both, so this is Q1, not a finding.
- N2. **Two orders on one screen** (pair 01). The summary box lists "Service-Desk, Alpha" (config order) while the grey lines list "Alpha, Service-Desk" (tile order, because Alpha has cards waiting). AC91 (c) sets tile order for the grey lines; the summary box's order is older and not changed here. See Q2.
- N3. **Two times for one project** (pair 01). For a project failing since the desk opened, the summary box and tile say "Can't read Service-Desk since 10:00", while the grey line says "Service-Desk not read in this opening". Both follow the spec; read together, the two seem to disagree. See Q3.
- N4. A project the desk can't draw ("Can't show Alpha" in the summary box) adds no lines to the list (sandbox.js:773, `b.error`), yet gets no grey line. The spec limits the line to "can't be read", so this is within the spec. See Q4.
- N5. The full list behind "<n> more" doesn't carry the lines. The spec says Home's list only; the test checks the sheet leaves them out.
- N6. Already there before this change, not made worse: the "Checking…" status under "Home" stays while signed out or failing. In full-page captures the floating tab bar sits over content; that is how a full-page capture draws a fixed bar, and I made the pairs with a taller window so the section isn't covered.

**Questions for the owner (asked, not picked)**
- Q1. When the list is empty, should the red "Not read since 10:01" line stay above the grey per-project lines (as built and as the spec says), or should the grey lines replace it there?
- Q2. Should the summary box's red "Can't read <project>" lines follow the tiles' order too, so both lists name projects in the same order?
- Q3. For a project never read since the desk opened: should the summary box and tile keep "since 10:00" (the opening time) while the list says "not read in this opening", or should they share one wording?
- Q4. Should a project the desk can't draw ("Can't show <project>") also get a grey "its lines may be missing" line, since its lines are missing from the list too?

**Pairs for the owner** (each is before at 39da454 beside after at 4167c78, labelled MADE-UP FIXTURE — NOT REAL). In:
/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7b-design/owner-pairs-final/
- 01-two-unreadable-tile-order-NOT-real-360-light.png: two projects failing, one "since 10:01" and one "in this opening". The lines follow tile order while the summary box above lists them the other way round.
- 02-signed-out-three-projects-NOT-real-360-dark.png: signed out, one grey line per project under the red line; the long names wrap.
- 03-list-full-under-more-NOT-real-414-light.png: the list full; the grey line sits under "37 more", and the count is unchanged.
- 04-long-name-wraps-NOT-real-360-dark.png: md-extremes, with a long project name wrapping whole at 360 px and no sideways scroll.

Other evidence in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7b-design/:
- shots-before/ and shots-after/: the glance-shots g7b- captures at 360×740 and 414×896, light and dark.
- measure-after/report.json: rendered text, computed styles, contrast, positions and screen-reader snapshot.
- crop-before/ and crop-after/: section crops, plus a "can't show" case.
- scripts/: my capture scripts.

## Round 2
Verdict: PASS

**Round 2 for G7b (9fcc448), for the owner.** Nothing failed and nothing was skipped. As asked, I ran only the stage's own test file and the colour-guard file: 17 of 17 pass. I did not run the full suite; the Builder reports 1,257 of 1,257.

The fix closes a real gap. Before it, the desk could be failing to read a project whose tile it also couldn't draw, and "Since you last looked" would still say "Nothing new since 18 Oct, 19:00", which reads as all clear. That had been there since the first glance stage, before this one; my round-1 review didn't catch it, the Reviewer did.

Now that state shows the red "✕ Not read since 10:02" line, then the grey "Alpha not read since 10:02, its lines may be missing". Its time is the same as in the summary box above ("Can't read Alpha since 10:02"). Every other state looks as it did in round 1. The change is fully reversible.

**What changed.** One function in src/public/sandbox.js (`sinceReads`). A project the desk can't draw now keeps its read when that read is failing, so it counts as "can't read", as the summary box already counts it. While its read succeeds, it still gets no line. src/lib/home.js and src/public/lib/home.js are still identical.

**Evidence** (the same captures as round 1, at 9fcc448; 360 and 414 px, light and dark; fonts confirmed loaded):
- **The five round-1 states** (unread, unread-more, unread-two, signed-out, ext, plus my ext-more) match my round-1 captures in text, computed styles, contrast, icons and links.
  - The only differences are the capture clock's minute (10:01 against 10:02), and the summary box always moves with it.
  - Sideways scroll is 0 px everywhere, and no line is cut.
- **New state: a project that can't be drawn and whose read then fails**, at all four sizes and themes, with one, two and a full list (part A items 2, 4, 5, 10, 13 and 14).
  - The words: "Alpha not read since HH:MM, its lines may be missing", with the summary box's own time.
  - With two projects failing, the lines run Alpha then Service-Desk, which is the tile order.
  - The empty list's line is the red "Not read since HH:MM", never "Nothing new since".
  - With a full list, the grey line sits under "33 more in the last 7 days", and the count is unchanged.
  - Style: 400 12 px Plex Sans in `--ink2`. Contrast is 6.40:1 light and 7.72:1 dark. No icon, not a link.
  - The tile still says "✕ Can't show this project: …".
- **Before, at 39da454**, the same state showed "Nothing new since 18 Oct, 19:00" at all four sizes and themes. That is part A item 4 failing before G7b; the fix removes it.
- **A project that can't be drawn but whose read works:** still "Nothing new since 18 Oct, 19:00" with no grey line, the same at 39da454, 4167c78 and 9fcc448.
- **Tests:** the stage's file and the colour-guard file give 17 of 17 pass, including the new case for the Reviewer's first blocking finding (B1).

**Blocking findings**
None.

**Non-blocking notes**
- My round-1 notes N1 to N6 stand. In the new two-project state, N2 shows again: the summary box lists Service-Desk first, while the grey lines follow tile order (Alpha first).
- My round-1 review missed the "Nothing new since" problem in this state. I raised the can't-draw case only as a question (Q4) and didn't test the version where the read also fails. The pack's measure for this agent should record that.

**Q4 after the fix: narrowed, still open.** The half where the read fails is settled. The other half isn't: a project the desk can't draw whose read works adds nothing to the list (sandbox.js:773 skips it), yet the list can still say "Nothing new since 18 Oct, 19:00" with no grey line. The spec gives the grey line only to a project that "can't be read", and this was already so before G7b. So it isn't a finding against this change. The open question for the owner: should a project the desk can't draw also get "<project> not shown, its lines may be missing", or some such line? Q1 to Q3 go to the owner as desk questions, as you said.

**Owner pairs**, in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7b-design/owner-pairs-final/:
- 01 to 04 are unchanged from round 1. The fix changes nothing they show beyond the clock minute.
- New: 05-cant-show-and-cant-read-NOT-real-360-light.png. It sets the desk now (39da454), showing "Nothing new since 18 Oct, 19:00" for a project it can't draw or read, beside 9fcc448, showing the red "Not read since 10:02" and the grey "Alpha not read since 10:02, its lines may be missing". Labelled MADE-UP FIXTURE — NOT REAL.

Round-2 captures and dumps, in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7b-design/:
- r2-after/: all states at 9fcc448, crops and full pages, with report.json.
- r1-after/: the new states at 4167c78.
- r0-before/: the new states at 39da454.
- scripts/crop2.mjs: the capture script.
