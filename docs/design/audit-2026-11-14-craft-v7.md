*By the Design reviewer, running on Fable 5.2, at the owner's request ("send your output and my screenshots provided to a critical external auditor running on fable 5.2. Their objective is to identify all of the differences between the two and assemble a library of all of the different elements in my attached screenshots"). It compares the Craft references (docs/design/references/11-17-style-craft.png) with docs/design/mockups/timeline-v7-craft.html. Recorded verbatim by the orchestrator, session session_01QBwHGKbJwQiq23S3G2JJet; its scratch files stayed outside the repository.*

# Craft references vs. mockup v7: external audit (read-only)

## Opening, limits first

I changed no file in any repository; all scratch work is in `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/`. This is an audit, not a pull-request verdict, so there is no PASS or FAIL.

Limits to read the numbers by:

- **Scale.** The seven reference files are 1179–1180 × 2676 px, so the scale is **3.0 image px per point** (393 pt wide). The 881-px figure is the downscaled preview (2.24 px/pt), which gives the same point values. The bottom 40 pt of each file is the Mobbin footer; the phone screen is 393 × 852 pt.
- **Colours** are sampled from compressed video frames, so they are good to about ±3 per channel. Screens 14, 15 and 17 sit under a dimming scrim; their greys are not base tokens.
- **Radii** are read against a 10-pt grid on enlarged crops. Small ones are good to ±2 pt, sheet and menu radii to ±4 pt.
- **Type sizes** come from cap height and string width, good to ±1 pt. Weights are judged by eye and width fit.
- **Typeface is not certain.** Round i-dots and the flat-topped "t" point to the iOS system font (SF Pro) at 17 pt body. Inter at 16 pt fits the same widths, so I cannot rule it out.
- **Mockup capture.** I rendered the mockup at 393 × 852, device scale 1, light and dark, in Chromium on Linux. There the font stack falls through to Inter; on an iPhone it would be SF. Family is therefore not a finding, but glyph widths in my captures are about 6% wider than on the phone.
- **No viewport tag.** The mockup has no `<meta name="viewport">`. Emulated as a phone it lays out 980 px wide; I measured it in a 393-px desktop-mode viewport.

The short answer: the mockup takes Craft's ingredients (grey ground, capsules, floating bar, blue selection) but not its proportions or its calm. Everything floating is about 10 pt too big, the title is a third too large, the side margins are nearly double, and the rows carry three lines where Craft carries one. It also uses small type (11–12 px) and state colours (green, orange, red) the references never show. The elements the references are mostly about are missing or imitated inline: rising sheets with a grabber, popover menus, search fields, the separate round action button, checkboxes, carousels. The trunk line with nodes and dashed connectors has no counterpart at all.

---

## Part 1. Differences, major first

"Ref" cites the screenshot number. "Mockup" values are computed styles at 393 px, light mode, unless stated.

### Major

| # | Element | Reference (measured) | Mockup (computed) | Gap |
|---|---|---|---|---|
| 1 | **Sheets** | 13, 15, 16, 17: a floating panel 369 pt wide (12 pt side margins), bottom edge about 33 pt above the screen bottom, radius about 26–30 pt. Grabber 36 × 4 pt, #d9d8db–#dddddf, 4–6 pt below the top edge. 1 pt white inner highlight plus 1 pt outer edge. Fill translucent near-white (#f5f5f8 in 13, #fefefe in 16). The page behind is dimmed and blurred (15: ground goes to #d9d6da, text behind is blurred). Strong shadow (13: #c5c2c6 at the edge, fading over about 35 pt). | `.pl.open > .rbody > .detail`: an inline accordion panel, 273 px wide, indented to x = 92. Radius 20, white, padding 12/14/8/30, shadow `0 0 0 1px #e6e6eb, 0 6px 20px rgba(0,0,0,.05)`. No grabber, no dim, no blur, does not rise, pushes content down. | Different component. |
| 2 | **Large title** | 11, 12: "Home"/"Tasks" cap height 18.7 pt, so about 26–27 pt bold; #1c1d21–#222124; left edge at x = 16–17. Sits 37 pt below the top buttons; next element starts 30 pt below its baseline. | `h1` 34 px / 700, letter-spacing +0.2 px, line-height 38 px, #1c1c1e, x = 28. Cap height about 24 px. | About 30% larger; 12 pt further in. |
| 3 | **Side margins** | 16 pt everywhere on the page (11, 12: title, search bar, chips, cards, top buttons end at x = 377). Sheets 12 pt. | 28 px: `.page` padding 20 plus the body's default 8 px margin, which is never reset. Row text starts at x = 76; plan rows at x = 92. | 12 pt more each side; content column 337 vs 361 pt. |
| 4 | **Top floating buttons** | 11, 12, 14, 17: single circle 44 × 44; two-button capsule 105.7 × 44, full radius. White #fcfbff on the light ground, glass on dimmed screens, no visible border. Shadow extends about 18 pt below at roughly 3–5% darkening. Icons 22–25 pt, stroke about 2 pt, #17161b. With a notification the bell is **filled** navy #214269 with a 10 pt blue dot #3885fb (11); without, it is a black outline (14). | `.capsule` 106 × 54, radius 26; `.circ` 50 × 50. Fill `rgba(255,255,255,.72)`, blur 20 px saturate 180%, 1 px border `rgba(0,0,0,.06)`, shadow `0 6px 20px rgba(0,0,0,.08)`. Icons 24 px, stroke 1.8 (back 2.2). Bell with dot is a **blue outline** #007aff, dot 9 px. | 10 pt taller capsule, 6 pt larger circle; bell state drawn differently. |
| 5 | **Tab bar and action button** | 11, 12: capsule 280 × 62 at x = 20–300, bottom 20 pt above the screen bottom, white #fcfbfe, full radius. **Icons only, no labels**; 4 tabs at about 61–68 pt pitch; icons 21–30 pt, stroke about 1.7–2 pt. Selected tab: grey pill 74 × 54, #e7e9ed, icon blue #3c85f8 (11) / #008afc (12). A **separate 56 × 56 white circle** with a 21 pt black "+" (stroke about 2.5) at x = 321–377, 21 pt right of the bar. | `.tabbar` 274 × 72, centred (x = 59.5–333.5), radius 36, padding 6. Tabs 84 × 58 with a 26 px icon **and an 11 px / 500 label**. Selected pill #e9e9ee, icon and label #007aff. No separate circular button. | 10 pt taller, labelled, centred, and the companion button is missing. |
| 6 | **List rows** | 11: one line, 17 pt regular, #17181c; row pitch 48 pt (40 in 14, 42 in 17, 36 for task rows in 12). Icon 15–20 pt, plain outline, stroke about 1.7 pt, grey #87898d, **no container**, at x = 26–45; text at x = 59. Chevron only on a drill-in row (6 × 10 pt, #929498) with a count in #caccd0. | `.need .crow`: 66 px high, **three lines** (13/600 blue kind label, 17/400 title, 13/400 grey sub). Icon in a **34 × 34 tinted tile** (#e6f0ff, radius 6), icon 18 px blue, stroke 2.0. Text at x = 76. Chevron 16 px, #6c6c70 at 70% opacity, on every row. Plan rows 58 px, two lines plus a chip. | 18 pt taller; coloured boxed icons; three type styles per row. |
| 7 | **Type scale, small end** | Smallest text seen is about 13 pt (tile labels and caps labels in 15, 16). Nothing at 12 or 11. | 12 px and 11 px used throughout: phase labels 12/400 and 12/600, "last 10" 12, tab labels 11/500, event times 11/400, footer 11, detail lines 12. | Two sizes below the reference floor. |
| 8 | **Weights** | Two levels: regular for rows and body; semibold or bold for titles, headings, selected chip, Done. | Four weights at 13 px alone (400, 500, 600, 700), three at 15, two at 17 and at 20. | Much busier hierarchy. |
| 9 | **Colour beyond neutrals and blue** | Chrome is neutral plus blue. The only other hues are one red alarm icon (#c74765, 12) and document tints inside cards. | Green #34c759 / #248a3d ("Live", Done chips, pulse dots, nodes), orange #ff9500 / #c93400, red #ff3b30 / #d70015, yellow flash #fff3c4. | The owner asked for the neutral base first; the state palette is the mockup's own. |
| 10 | **Trunk, nodes, connectors** | Nothing like it in any of the seven. | 2 px #3a3a3c vertical line; 12 px cap dot; dashed 1.5 px #8e8e93 connectors; 12 px ring nodes; 22 px square gate nodes; a 26 px blue "Now" node with a 6 px ring; "THE DESK" 12/500 label; a line-drawing animation (320 ms). | Reads foreign to the style. |
| 11 | **Popover menu** | 17: 249 pt wide, radius about 28–30, translucent #f2f2f2–#f6f6f6 with a 1 pt white edge, over a dimmed page. Rows 42 pt pitch; icon 23–26 pt, black, stroke about 2.5 pt; text 17 pt regular at x = 133; group separator 1 pt #e3e3e3 inset 23 pt. 14: a picker popover, 369 × 300, with a 50 pt search header. | None. The "More" button changes nothing when tapped. | Missing. |
| 12 | **Search and text fields** | 11: search capsule 361 × 44, fill #ebecf0, 16.5 pt icon #85878b, placeholder 17 pt #7e8084. 15: in-sheet search 337 × 36, radius about 10, fill #e3e1e4. 17: white field 38 pt high, radius about 10–12. | None. | Missing. |

### Moderate

| # | Element | Reference | Mockup | Gap |
|---|---|---|---|---|
| 13 | **Section headings** | 11, 12: cap height 13.7 pt, so about 19 pt semibold/bold, #1c1d21, at x = 22–25 (6–9 pt inside the margin). Row-to-heading 60 pt centre to centre; heading-to-row 46–48. | `h2`, `.desk-label`, `.phname`: 22 px / 700, +0.1 px tracking, at x = 28 (plan phases at x = 92). | About 3 pt larger. |
| 14 | **Heading chevron and right side** | 11: drawn chevron 7.3 × 12.3 pt, stroke about 2, #84868a, 10.7 pt after the word; "···" (15.7 pt wide, 3.3 pt dots, #838589) at the right. 12: "···" after the word, and a **down** chevron (11.3 × 6.7, #a5a5a9) at the far right for collapse. | The character "›" at 26 px / 500, #6c6c70, 6 px gap. Right side is the text "5 waiting" 15/400. No "···", no collapse chevron. Phase headings carry "›" but are not tappable. | A text glyph, darker, and it promises a drill-in that does not exist. |
| 15 | **Separators** | 11: 1 pt, #e7e9ed, from the text edge (x = 56) to 24 pt short of the right edge; only between rows of a group. 16: #efefef on white. 15: #e1dee2 in a sheet. | `.need + .need::before`: 1 px #dcdce1, from x = 78 to the content edge. Plan rows: 1 px #e6e6eb above every row. | About 11 levels darker on the desk; runs to the edge. |
| 16 | **Cards** | 11: 140 × 170, radius about 12, a 6 pt frame in the document's own tint with a 1 pt darker edge, 8 pt gap, in a horizontal carousel; almost no shadow. 12: 264 pt wide, radius about 16–18, 5 pt frame #a0d0e8 when selected, white inside (radius about 12); unselected is plain white with a 1 pt #e6e6e6 edge; 12 pt gap; shadow about 9 pt. Content: thumbnail, 17 pt title, about 15 pt grey caption. | `.pcard`: 297 × 232, radius 22, 1 px #dcdce1 border, a 5 px ring #f6f6f9 (lighter than the ground, so nearly invisible) plus `0 8px 24px rgba(0,0,0,.06)`, padding 18. Six content rows: 20/700 name, 13 repo, 15 text, phase bar with 12 px labels, 13 status line, 7 px colour dots. Stacked vertically on the trunk. | Radius 4–10 pt larger; far denser; not a carousel; frame carries no meaning. |
| 17 | **Status chips** | 12: date chip 24 pt high, radius about 6 (a rounded rectangle), fill #eae9ee, 11–12 pt icon, about 14 pt text **always grey** #808185; only the icon takes colour. | `.crow .s`: 20 px high, radius 10 (capsule), fill #e9e9ee, 13/500, a 7 px dot and the **text in the state colour**. | Shape and colouring both differ. |
| 18 | **Primary button** | 13, 16: "Done" 69–70 × 36 capsule; #000000 in 13, #202226 in 16; white text about 15–16 pt semibold; sits top right. 17: "Apply" about 166 × 38 capsule, #3a85f6, white 17 pt; "Cancel" same size, fill #e3e3e3, text #4b4e4d. | `.btn`: 288 × 46, radius 23, #1c1c1e, text 17/600 #f2f2f6, full width inside the detail. No blue or grey capsule pair. | 10 pt taller, a size larger, different placement. |
| 19 | **Selected block ("Now")** | 13: fill #d6ecff inside a lighter halo #eff7fe (9 pt), a **solid 4 pt blue bar** #0387ff down the left, small radius (about 6–8), no outline, no shadow; title blue #0868bc about 17–18 pt semibold, caption #94aaba; a solid 14 pt blue dot at the right. | `.pl.now > .rbody`: fill #e6f0ff, 1 px #9fc7ff outline, radius 20, shadow `0 8px 24px rgba(0,122,255,.10)`; title 20/600 #0062cc on three lines; "NOW" tag 13/600. The top border is computed `none` (a rule meant for row hairlines removes it). | Outline card with glow vs. bar-and-tint block. |
| 20 | **Secondary grey** | #7e8084–#87898d for icons, placeholders, chip text; lighter tiers #a4a5a9 and #caccd0. | One grey, #6c6c70, for everything (`--ink-3` = `--ink-4`). | Darker and flatter. Note: the reference grey is about 3.5:1 on the ground, under the pack's 4.5:1 (item 10), so matching it exactly is not open without the owner. |
| 21 | **In-flow depth** | Rows sit flat on the ground. Shadow is kept for floating things: buttons, tab bar, sheets, the preview card in 16. | Shadow and ring on in-flow project cards, the Now card and the inline panel. | Depth used where the references have none. |
| 22 | **Vertical rhythm** | 11: title 30 pt, search 24, cards 24, rows at 48. 12: chips 44 pt high block, 45 to heading. | Title, then a 15 px status line 6 px below, then a wrapped row of 32 px demo chips, then headings; rows at 66. | No shared step. |
| 23 | **Row overlap in the opened sprint** | n/a | Measured: the status chip's right edge (x = 306–345) crosses the time's left edge (x = 292) on the same line; titles have 93 px and clip ("Plan revi…"). | A defect inside the mockup. |

### Minor

| # | Element | Reference | Mockup |
|---|---|---|---|
| 24 | Ground | #f2f3f7 (11), #f3f3f7 (12) | #f2f2f6. Match. |
| 25 | Fill | #eae9ee, #ebecf0 | #e9e9ee. Match. |
| 26 | Primary ink | #17181c–#1c1d21; task text #36383c | #1c1c1e; #3a3a3c. Match. |
| 27 | Blue | #3a85f6 (Apply, tab, badge); #0388ff (dot, check); #0a80d7 (text link); #025a9a (text on tint) | #007aff; #0062cc; wash #e6f0ff; ring #9fc7ff. Close; the ring is more saturated than the reference's selected-chip edge #d4dae2. |
| 28 | Filter chips | 68 × 40 capsules, 8 pt gap, icon only when unselected; selected: fill #e7f1f9, thin edge, icon plus 17 pt semibold label #025a9a | 40 px high, padding 16, 15/500 label always shown, selected fill #e6f0ff. Height and gap match; label 2 pt smaller and lighter. |
| 29 | Icon tile radius | n/a | `.need .ico` computes 6 px; the v7 rule asks for 10 but an older `.ico.sq` rule wins. |
| 30 | Sizes that lost the cascade | n/a | Sprint and event titles compute 17 px (v7 comments intend 15); event times compute 11 px (intended 13); need-detail title 14 px. |
| 31 | Dark mode | Not shown in the references | Ground #000, surface #1c1c1e, glass `rgba(44,44,46,.72)`. The selected tab pill (#2c2c2e) is nearly invisible on the dark glass. No reference to judge against. |
| 32 | Letter-spacing, line height | Not measurable to better than ±0.3 pt | +0.2 px on the title, +0.1 on headings; no finding. |

### Interactions the references imply, and what the mockup does

| Reference | Mockup |
|---|---|
| Sheet rises from the bottom over a dimmed, blurred page, with a grabber to drag (13, 15, 16, 17) | Rows expand in place; chevron rotates 90° in 0.2 s. |
| Popover menu anchored to a field (17); picker popover over the keyboard (14) | None. |
| Horizontal carousels with the next card peeking (11, 12, 15); pager dots (16: 5–6 pt dots, 7.7 pt gap, active #232328, others #c5c4c7) | Project chips scroll sideways. Cards do not. |
| Collapsible sections via a down chevron at the right (12); heading chevron drills in (11); "···" section menu | None of the three. |
| Swipe on a block (13: "Swipe ← or → on me") | Present: a 60 px horizontal swipe changes project, but its hint is hidden. |
| Confirm with a blue check circle (15) or black Done (13, 16) | Black button opens GitHub. |
| Tab change moves the grey pill (11 to 12) | Present. |

### In the mockup with no counterpart in the references

The trunk line, nodes, dashed connectors and "THE DESK" label; the drawing animation and yellow flash; green, orange and red states and the 7 px pulse dots; the phase progress bar; the green "Live" line under the title; three-line rows with a blue kind label; boxed tinted icons; labels under tab icons; the glow under the Now card; 11 and 12 px text; the neutral ring around cards.

### For the owner, not for me to pick

- The typeface ruling (P-001-redesign-type.md: IBM Plex, one vermilion accent for "needs you") and this rebrand's system font and blue point different ways.
- The tab ruling (P-001-home-tab.md: Home · Waiting · Plan) and the mockup's Desk · Plan · Now differ.
- The ruled size list (28, 24, 20, 18, 15, 13, 12, 11) does not hold 34, 22, 17 or 14, nor the reference's 26–27, 19 and 17.
- Contrast I measured under 4.5:1 in the mockup: #248a3d "Live" on the ground about 3.9; chip text on #e9e9ee about 3.6–4.3; #007aff link on the ground about 3.6.

---

## Part 2. Element library from the seven references

All values in points, light mode. "Est." marks an estimate.

### Neutral palette (tokens)

| Token | Hex | Where sampled |
|---|---|---|
| Ground | #f2f3f7 | 11, 12 page |
| Ground, document | #fefefe | 13, 16 |
| Surface, floating | #fcfbff | 11 capsule, tab bar; 12 circle |
| Surface, card | #ffffff | 12 card; 15 tiles; 17 field |
| Surface, sheet | #f5f5f8 (13), #fefefe (16) | translucent |
| Fill | #eae9ee / #ebecf0 | 12 chips, date chips; 11 search |
| Fill, in sheet | #e5e7eb | 13 tool buttons |
| Fill, pressed/selected tab | #e7e9ed | 11 tab pill |
| Checkbox fill / border | #f0eff4 / #d5d4d9 | 12 |
| Separator on ground | #e7e9ed | 11 |
| Separator on white | #efefef | 16 |
| Separator in sheet | #e1dee2 (15), #e3e3e3 (17, dimmed) | |
| Card edge | #e6e6e6 | 12 second card |
| Radio ring | #dadada | 13 |
| Grabber | #d9d8db–#dddddf | 13, 15 |
| Text 1 | #17181c–#1c1d21 | 11 rows, headings |
| Text 1, soft | #2c2c2e–#36383c | 12 task text, 16 "Custom" |
| Text 2 | #7e8084–#87898d | icons, placeholder, chip text |
| Text 2 on white | #747478 (16 Cancel), #9d9d9d (16 caps label), #9fa2a1 (12 caption) | |
| Text 3 | #a4a5a9 | 12 dots, collapse chevron |
| Text 4 | #caccd0 | 11 count |
| Black button | #000000 (13), #202226 (16) | Done |
| Grey button | #e3e3e3 fill, #4b4e4d text | 17 (dimmed) |
| Accent blue, solid | #3a85f6 | 17 Apply; 11 tab, badge |
| Accent blue, selection | #0388ff / #008dff | 13 dot, bar; 12 check |
| Accent blue, text | #0a80d7 | 13 Reset |
| Accent blue, text on tint | #025a9a / #0868bc | 12 chip; 13 block |
| Accent tint | #e7f1f9 (chip), #d6ecff (block), #eff7fe (halo) | 12, 13 |
| Accent, bell filled | #214269 | 11 |
| Selection frame | #a0d0e8 | 12 card |
| Scrim result | ground becomes #d9d6da–#e3e2e9 | 14, 15, 17 |

### Type scale

| Role | Size (est.) | Weight | Colour | Seen in |
|---|---|---|---|---|
| Large title | 26–27 | bold | #1c1d21 | 11, 12 |
| Document title | about 24 | bold | #010103 | 13, 17 |
| Tile glyph (H1, P) | about 28 | medium | #37363a | 15 |
| Section heading | about 19 | semibold–bold | #1c1d21 | 11, 12 |
| Sheet title | 17–18 | semibold | #010009 | 16, 17 |
| Row, body, menu | 17 | regular | #17181c | 11, 14, 17 |
| Selected chip, buttons | 17 | medium–semibold | #025a9a / white | 12, 17 |
| Card title | 17 | medium | #2c2e2d | 12 |
| Capsule button (Done) | 15–16 | semibold | white | 13, 16 |
| Caption | about 15 | regular | #9fa2a1 | 12, 13 |
| Chip text, tile label | about 14 | regular | #808185 / #4b4a4d | 12, 15 |
| Caps group label | about 13, tracked | semibold | #939094 / #9d9d9d | 15, 16 |
| Tile label, small | about 13 | regular | grey | 15 |

### Elements

| Element | Shots | Purpose | Anatomy and measures | States seen | Interaction |
|---|---|---|---|---|---|
| Top circle button | 12, 15, 17 | One page action or back | 44 × 44 circle, 16 pt from the edge, white or glass, soft shadow; icon 22 pt, stroke about 2; back chevron 11 × 19 | default; blue filled #0174da with white check (15) | tap |
| Top capsule | 11, 14, 17 | Two page actions | 105.7 × 44, full radius; icons about 53 pt apart | bell outline; bell filled navy with 10 pt blue dot | tap each |
| Large title | 11, 12 | Names the screen | 26–27 bold, x = 16 | one | scrolls with page |
| Search capsule | 11 | Search the space | 361 × 44, fill #ebecf0, 16.5 pt icon at 15 pt inset, placeholder 17 pt | default; dimmed behind a popover (14) | tap opens a picker |
| Document card | 11 | Recent documents | 140 × 170, radius about 12, 6 pt tinted frame, 1 pt edge, 8 pt gap | one | horizontal carousel, tap opens |
| List row | 11, 14 | Navigation | 48 pt pitch (40 in popover); icon 15–20 pt outline #87898d at x = 26–45; 17 pt text at x = 59; optional count and 6 × 10 chevron | one | tap |
| Inset separator | 11 | Splits rows in a group | 1 pt #e7e9ed, from text edge, stops 24 pt from the right | one | none |
| Section heading | 11, 12 | Titles a group | about 19 pt; chevron 7.3 × 12.3 after the word; "···" 15.7 pt wide; down chevron 11.3 × 6.7 at the right (12) | expanded | chevron drills in; down chevron collapses; dots open a menu |
| Filter chip | 12 | Switch task view | 68 × 40 capsule, 8 pt gap, fill #eae9ee, icon about 20 pt #4e4f53 | default; selected: tint #e7f1f9, thin edge, icon plus label, wider | tap, one of many |
| Checkbox | 12 | Complete a task | 16 × 16, radius about 4, 2 pt border; 14 × 14 inside cards | empty; done as an 18.7 pt blue circle with white check (card header) | tap |
| Date chip | 12 | When a task is due | 78.7 × 24, radius about 6, fill #eae9ee, icon 11–12 pt, text about 14 pt | icon grey, blue #4194e0, red #c74765 | tap to set |
| Task row | 12 | One task | 36 pt pitch; checkbox x = 25, chip x = 51, text x = 137, 17 pt #36383c | one | tap, check |
| Pinned card | 12 | Document with its tasks | 264 wide, radius about 16–18, 12 pt gap; thumbnail 28 × 36; title 17, caption about 15 | selected with 5 pt #a0d0e8 frame; plain white | carousel |
| Tab bar | 11, 12 | Main sections | 280 × 62 capsule at x = 20, icons only; pill 74 × 54 #e7e9ed | selected icon blue; others black | tap |
| Round action button | 11, 12 | Create | 56 circle, white, "+" 21 pt, stroke about 2.5 | one | tap |
| Text button | 13, 16 | Light action | 17 pt regular; blue #0a80d7 or grey #747478 | two colours | tap |
| Black capsule button | 13, 16 | Confirm | 69–70 × 36, white 15–16 semibold | one | tap |
| Blue / grey capsule pair | 17 | Apply or cancel | each about 166 × 38, 6–7 pt apart; #3a85f6 with white text; #e3e3e3 with #4b4e4d text | two | tap |
| Soft button | 17 | Add a value | 132 × 38, radius about 10–12, fill #e8e8e8, "+" and 17 pt medium text | one | tap |
| Radio dot | 13 | Pick a block | 18 pt ring, 1 pt #dadada | empty; selected solid 14 pt #0388ff | tap |
| Selected block | 13 | Shows what is being styled | tint #d6ecff, halo #eff7fe, 4 pt blue bar at left, thumbnail 32 × 40 | selected only | swipe left or right |
| Bottom sheet | 13, 15, 16, 17 | Tools and settings | 369 wide, radius about 26–30, grabber 36 × 4, white highlight edge, scrim and blur behind | several heights | rises; drag the grabber |
| Segmented row | 13 | Text style | words at 17–19 pt; 1 pt divider #e0e2e6 | selected: tint #dbe9f7 with about 1.3 pt blue edge, radius about 10, 92 × 49 | tap |
| Tool button | 13 | Formatting | about 52 × 49, radius about 10–12, fill #e5e7eb, 18 pt icon | default; dimmed icon (disabled); blue tint with blue edge (on) | tap |
| Colour ring | 13 | Pick colour | 36.7 pt, rainbow ring, blue centre | one | tap |
| Sheet search field | 15 | Find an insert | 337 × 36, radius about 10, fill #e3e1e4 | one | type |
| Insert tile | 15 | Insert a block | 90 × 90 white, radius about 10–12, faint shadow, 12 pt gap, label about 14 pt below | one | carousel, tap |
| Text-style tile | 15 | Insert a style | 72 × 72 white, 16 pt gap, glyph about 28 pt, label about 13 pt, rows 106 pt apart | default; grey glyph (Caption) | tap |
| Caps group label | 15, 16 | Names a group in a sheet | about 13 pt caps, tracked, grey | one | none |
| Preview card and pager | 16 | Preview a style | card about 150 wide with the largest shadow in the set; 5 dots | active dot dark | swipe |
| Choice tile | 16 | Pick a preview | 99 × 72, radius about 10, 13 pt gap | selected: 2 pt #0c86f1 edge; default: hairline | tap |
| Swatch row | 16 | Custom background | 17 pt label left, 54 × 42 swatch right | one | tap |
| Popover menu | 17 | Choose a type | 249 wide, radius about 28–30, rows 42, icons 23–26 pt stroke about 2.5, separator inset 23 | one | tap; dismiss outside |
| Picker popover | 14 | Choose a folder | 369 × 300, 50 pt search header with 22 pt clear button #c9c9cd, 1 pt full-width rule, rows 40 | one | type, tap |
| Close button | 14, 17 | Dismiss | 22 pt grey circle with white cross | one | tap |
| Sheet text field | 17 | Edit a name | 38–42 pt high, radius about 10–12, white or outlined | filled; empty outlined | type |

---

## What to change first

1. Reset the body margin and take side margins to 16; bring the title to about 26–27 bold.
2. Shrink the floating parts: top buttons to 44, tab bar to about 62 with icons only, and add the separate round action button if the desk has an action for it.
3. Make the opened milestone a real bottom sheet: 12 pt margins, grabber, scrim, blur, rising.
4. Calm the rows: one main line at 17 regular, plain grey outline icons with no tile, about 48 pt pitch, lighter inset separators.
5. Bring the type down to the reference's few sizes and two weights; drop 11 and 12 px.
6. Decide with the owner whether green, orange and red belong in this neutral-first round, and whether the trunk and nodes stay.
7. Fix the mockup's own slips: status chip overlapping the time in sprint events, missing viewport tag, sizes and radii that lost the cascade, the invisible dark-mode tab pill.

## Files

- References: `/home/user/Service-Desk/docs/design/references/11-style-craft.png` to `17-style-craft.png`
- Mockup: `/home/user/Service-Desk/docs/design/mockups/timeline-v7-craft.html`
- Scratch folder: `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/`
- Computed styles: `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/styles-light.json` and `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/styles-dark.json`
- Corner contact sheet: `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/corners.png`
- Mockup captures: `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/desk-light.png`, `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/events-light-full.png`, `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/need-open.png`, `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/need-open-dark.png`, `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/events-dark.png`
- Measuring scripts: `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/m.py`, `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/m2.py`, `/tmp/claude-0/-home-user/c55e457d-b443-565a-8d3a-33bad43081d5/scratchpad/craft-audit/shot.js`
