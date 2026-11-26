import os, re, sys
OUT, ICONS = sys.argv[1], sys.argv[2]   # library folder; Phosphor assets folder (npm pack @phosphor-icons/core@2.1.1)

def ic(name, w="regular", cls="i"):
    f = os.path.join(ICONS, w, name + ("" if w == "regular" else "-" + w) + ".svg")
    svg = open(f).read().strip()
    return svg.replace('<svg xmlns="http://www.w3.org/2000/svg"', f'<svg class="{cls}" aria-hidden="true" focusable="false"', 1)

def page(group, height, title, body, script="", width=None):
    attrs = f'group="{group}" height={height}' + (f' width={width}' if width else '')
    return (f'<!-- @dsCard {attrs} -->\n<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><title>{title}</title></head>\n<body>\n'
            + body + ('\n<script>\n' + script + '\n</script>' if script else '') + '\n</body>\n</html>\n')

C = {}
MORE = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><circle cx="12" cy="12" r="9.6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7.6" cy="12" r="1.45"/><circle cx="12" cy="12" r="1.45"/><circle cx="16.4" cy="12" r="1.45"/></svg>'
def comp(name, group, height, body, readme, script="", width=None):
    C[name] = (page(group, height, name, body, script, width), readme)

PRESS = "document.addEventListener('click', function (e) { var b = e.target.closest('[aria-pressed]'); if (!b) return; b.parentNode.querySelectorAll('[aria-pressed]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });"
TABS = "document.addEventListener('click', function (e) { var b = e.target.closest('.dk-tab'); if (!b) return; b.parentNode.querySelectorAll('.dk-tab').forEach(function (x) { x.setAttribute('aria-current', String(x === b)); }); });"
TH = '<span class="th"><span></span><span></span><span></span><span></span></span>'
SRC = "Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use."

def capsule(waiting):
    b = (f'<button class="bell-on" aria-label="Needs you: {waiting}">{ic("bell", "fill")}<span class="dk-dot"></span></button>' if waiting
         else f'<button aria-label="Needs you">{ic("bell", "bold")}</button>')
    return f'<div class="dk-capsule glass">{b}<button aria-label="More">{MORE}</button></div>'

def tabbar(sel="desk"):
    t = [("desk", "Desk", "house"), ("plan", "Plan", "calendar-dots"), ("needs", "Needs you", "tray")]
    return ('<nav class="dk-tabbar glass" aria-label="Tabs">' + "".join(
        f'<button class="dk-tab" aria-current="{str(k == sel).lower()}" aria-label="{l}">{ic(n, "bold", "i off")}{ic(n, "fill", "i on")}</button>' for k, l, n in t) + '</nav>')

def row(icon, words, count=None):
    return (f'<div class="dk-row"><span class="ic">{ic(icon)}</span><span class="tx">{words}</span>'
            + (f'<span class="ct">{count}</span>' if count else '') + ic("caret-right", "bold", "rc") + '</div>')

def card(title, caption, steps, sel=False, done=False):
    head = (f'<div class="hd">{TH}<div class="hx"><div class="t">{title}</div><div class="c">{caption}</div></div>'
            + (f'<span class="dk-check done">{ic("check", "bold")}</span>' if done else '') + '</div>')
    st = "".join(f'<div class="dk-task"><span class="dk-check"></span><span>{s}</span></div>' for s in steps)
    return f'<div class="dk-card{" sel" if sel else ""}">{head}<div class="steps">{st}</div></div>'

comp("TopButton", "Navigation", 140,
 f'<div class="dk-stage">\n  <button class="dk-circ glass" aria-label="Back">{ic("caret-left", "bold")}</button>\n  <button class="dk-circ glass" aria-label="More">{MORE}</button>\n  <button class="dk-circ on" aria-label="Done">{ic("check", "bold")}</button>\n  <p class="dk-note">Back, a single page action, and on (confirm, ref 15). 44 round glass, 16 from the screen edge.</p>\n</div>',
 f"""# TopButton

One page action or the way back, in a 44-point glass circle at the top corner. From refs 12, 15 and 17.

- Size `size-hit`, full radius, glass: `surface-floating` (78% opaque) blurring what is behind, with `shadow-float` and its white inner edge.
- Icon 24, bold, `text-1`. On: filled `accent-select` with a white check (ref 15).
- Sits 16 (`space-16`) from the screen edge, 6 below the status bar.
- {SRC}
""")

comp("TopCapsule", "Navigation", 140,
 f'<div class="dk-stage">\n  {capsule(0)}\n  {capsule(3)}\n  <p class="dk-note">Nothing waiting, and three things waiting: the bell fills navy and gains a blue dot.</p>\n</div>',
 f"""# TopCapsule

Two page actions joined in one 105.7 by 44 glass capsule at the top right. From refs 11, 14 and 17.

- Glass as TopButton; icons 26, bold, about 53 apart.
- Waiting: the bell switches to its filled form in `bell-filled`, with a 10-point `accent-select` dot on its shoulder.
- On the desk: Needs you (bell) and More (the popover menu).
- {SRC}
""")

comp("TabBar", "Navigation", 120,
 f'<div class="dk-stage" style="justify-content:space-between;width:357px">\n  {tabbar()}\n  <button class="dk-round glass" aria-label="Now">{ic("record", "bold")}</button>\n</div>',
 f"""# TabBar

The main sections as icons only, in a floating 62-high glass capsule, with the round button beside it. From refs 11 and 12.

- 20 (`space-20`) from the left, 34 above the bottom edge; glass as TopButton.
- Icons 27, bold, `text-1`. The selected tab sits in a 74 by 54 `fill-selected` pill and switches to its filled icon in `accent`.
- Craft has four tabs; the desk has three (Desk, Plan, Needs you), so the bar is narrower. Each tab keeps an accessible name.
- Tap a tab here to try it. {SRC}
""", script=TABS)

comp("RoundButton", "Navigation", 110,
 f'<div class="dk-stage">\n  <button class="dk-round glass" aria-label="Now">{ic("record", "bold")}</button>\n  <button class="dk-round glass" aria-label="New">{ic("plus", "bold")}</button>\n</div>',
 """# RoundButton

The one separate action beside the tab bar, in a 56-point glass circle. From refs 11 and 12.

- `size-round`, glass; the glyph 26, bold, `text-1`.
- Craft uses it for "+" (create). The desk uses it for Now, which centres the plan on the current step.
- Held for about half a second, it turns the ContextView on or off (round 7, answers 4 and 5); it is filled blue while the ContextView is on.
""")

comp("LargeTitle", "Headings", 120,
 '<div class="dk-stage col">\n  <h1 class="dk-title">Timeline</h1>\n  <h2 class="dk-doc-title">S-011 Plan view</h2>\n</div>',
 """# LargeTitle

Names the screen in 27 bold at 16 from the left, and scrolls away with the page. From refs 11 and 12.

- Style `large-title`; one per screen, its top about 82 below the status bar (y 136 on a 393 by 852 screen).
- A plan or document page uses `document-title` (24 bold) instead (refs 13, 17).
- No crumb above it: the references have none, so the desk's breadcrumb is dropped. Ids go in captions.
""")

comp("SectionHeading", "Headings", 200,
 f'<div class="dk-stage col" style="width:361px">\n  <h2 class="dk-head"><span>Needs you</span>{ic("caret-right", "bold", "chev")}<span class="grow"></span>{ic("dots-three", "bold", "more")}</h2>\n  <h2 class="dk-head" role="button" tabindex="0" id="fold"><span>Projects</span>{ic("dots-three", "bold", "more")}<span class="grow"></span>{ic("caret-down", "bold", "fold")}</h2>\n  <p class="dk-note">Drill-in heading with its menu at the right (ref 11); collapsible heading with its menu beside the word (ref 12). Tap the second.</p>\n</div>',
 """# SectionHeading

Titles a group of rows in 19 semibold, indented 8 more than the title. From refs 11 and 12.

- Style `section-heading`, at x 24 (the title is at 16). 44 high.
- Drill-in form (ref 11): a small chevron right after the word, `···` at the right edge.
- Collapsible form (ref 12): `···` right after the word, a down chevron at the right edge that folds the group.
- Marks in `text-3`. On the desk: Needs you, Projects, and each phase on the plan.
""",
 script="var f = document.getElementById('fold'); f.addEventListener('click', function () { f.classList.toggle('closed'); });")

comp("CapsLabel", "Headings", 72,
 '<div class="dk-stage"><p class="dk-caps">Milestones</p><p class="dk-caps">Show on the plan</p></div>',
 """# CapsLabel

Names a group inside a sheet in 13 semibold capitals, tracked. From refs 15 and 16.

- Style `caps-label`, colour `text-2`. Only inside sheets and popovers; the page itself uses SectionHeading.
""")

comp("SearchField", "Lists", 96,
 f'<div class="dk-stage"><label class="dk-search">{ic("magnifying-glass", "bold")}<input placeholder="Search the desk" aria-label="Search the desk"></label></div>',
 """# SearchField

Searches the space from a 44-high capsule in `fill`. From ref 11.

- 361 wide (the screen less two 16 margins), full radius; the glass icon 19, bold, `icon`, at a 14 inset.
- Placeholder in 17 regular, `icon`. Tapping it opens a picker popover (ref 14).
""")

comp("ListRow", "Lists", 232,
 '<div class="dk-stage"><div class="dk-list">\n  ' + row("tray", "Stop card 5 for S-011") + '\n  ' + row("flag", "Plan review returned three findings", 3)
 + '\n  ' + row("file-text", "Handoff, part 11") + '\n  ' + row("file-text", "A row whose words are much too long to fit on one line") + '\n</div></div>',
 f"""# ListRow

One line of navigation: an outline icon, the words, an optional count and a chevron. From refs 11 and 14.

- 48 pitch (`size-row`); 42 inside a popover. Icon 22, regular weight, `icon`, at x 26; words in `body` from x 59.
- Count in `text-4`, chevron in `text-3`.
- Rows are split by a 1-point `separator` that starts at the words and stops short of the right. No boxes, no fills.
- {SRC}
""")

comp("TaskRow", "Lists", 130,
 f'''<div class="dk-stage col">
  <div class="dk-task"><span class="dk-check"></span><span class="dk-date">{ic("alarm")}Nov 28</span><span>Answer the stop card</span></div>
  <div class="dk-task"><span class="dk-check"></span><span class="dk-date soon">{ic("alarm")}Nov 27</span><span>Merge #444</span></div>
</div>''',
 """# TaskRow

One task: a checkbox, a date chip and the words, at a 36 pitch. From ref 12.

- Checkbox 16 square, radius 4, a 1.5 `control-border` round a `checkbox-fill`; checkbox at x 25.
- Date chip 24 high, radius 6, `fill`, an alarm icon and the date in `chip` style. The icon turns `accent-select` when it is soon. Craft also shows a red overdue icon; red waits until colour is added.
- Words in `body`, `text-1-soft`.
""")

PROJ = [("The timeline", 4), ("Home-screen widget", 1), ("Operating model", 0), ("Model-Lab", 0), ("Portfolio", 0)]
FILTERS = [("Needs you", "tray"), ("Today", "sun-horizon"), ("Plan", "calendar-dots"), ("All projects", "clipboard-text")]
comp("FilterChip", "Chips", 200,
 '<div class="dk-stage"><div class="dk-chips" role="group" aria-label="Show">' + "".join(
  f'<button class="dk-chip" aria-pressed="{str(i == 3).lower()}" aria-label="{l}">{ic(n, "regular", "i off")}{ic(n, "fill", "i on")}<span class="label">{l}</span></button>'
  for i, (l, n) in enumerate(FILTERS)) + '</div><p class="dk-note">One of many: tap a chip. Unselected chips are icons only; the selected one tints, fills its icon and shows its label.</p>'
 + '<div class="dk-chips named" role="group" aria-label="Projects">' + "".join(
  f'<button class="dk-chip" aria-pressed="{str(i == 0).lower()}"><span class="label">{l}</span>' + (f'<span class="dk-count" aria-label="{c} need you">{c}</span>' if c and i == 0 else '') + '</button>'
  for i, (l, c) in enumerate(PROJ)) + '</div><p class="dk-note">Named: the project switcher. Every chip shows its project&#8217;s name; the selected one adds how many things need you.</p></div>',
 """# FilterChip

Switches the view, one of many, in a 40-high capsule. From ref 12.

- `size-chip` high, at least 68 wide, 8 apart, `fill`, full radius; an icon only, 22, regular, in `chip-icon`.
- Selected: `accent-tint` with a thin `accent-tint-edge` and a light top edge; the icon switches to its filled form in `accent-select`, and the label appears in 17 semibold `accent-on-tint`.
- Every chip is raised a little: `shadow-chip` gives a light top edge, a darker bottom edge and a small drop; the selected one takes `shadow-chip-selected`, a white top edge, a rim darker at the bottom and a soft drop below, as in ref 12.
- Named, for switching projects (the owner chose this on 15 November 2026: "Option A but they are missing that slight element of shadow or whatever that makes them look 3d"): every chip shows its project's name in 15 regular `text-1`, no icon; the selected one is 17 semibold `accent-on-tint` and adds a count badge, 22 high, white on `accent` (4.8:1). The row scrolls sideways.
""", script=PRESS)

comp("DocumentCard", "Cards", 210,
 '<div class="dk-stage">' + "".join(f'<div class="dk-doc"><div class="t">{t}</div><div class="pg">' + '<span></span>' * 9 + '</div></div>' for t in ("Handoff 11", "S-011 spec", "Craft audit")) + '</div>',
 """# DocumentCard

A recent document as a 140 by 170 page preview, in a horizontal carousel. From ref 11.

- An outer frame in `fill` with a 1-point `edge`, radius 12; the title in 15 semibold at the top; the page itself white below, showing its first lines.
- Craft tints each frame from the document's own colour; the desk keeps it neutral until colour is added. 8 apart, no shadow.
""")

comp("ProjectCard", "Cards", 250,
 '<div class="dk-stage" style="gap:12px">' + card("Service-Desk", "S-011 · stop card 5", ["Answer stop card 5", "Plan review", "Build the plan view"], sel=True)
 + card("Model-Lab", "All steps done", [], done=True) + '</div>',
 """# ProjectCard

**Not used on home from round 4.** The owner did not want "the existing old cards sticking around" (decisions/questions/P-005-design-round-4.md, answer 7); home shows DeskMap instead.

A project with its next steps, from Craft's pinned card. From ref 12.

- 264 by 210, radius 18, `surface`, `shadow-card`, 12 apart in a carousel.
- Header: a page thumbnail 28 by 36, title in 17 medium `text-1-soft`, caption in `caption` `text-2`; a blue done mark at the right when every step is done.
- Below: the next steps as small task rows (14 checkboxes, 15 words).
- Selected: a 5-point `selection-frame` round the card.
""")

comp("NowBlock", "Selection", 120,
 f'<div class="dk-stage"><div class="dk-nowwrap"><div class="dk-now">{TH}<div class="hx"><div class="t">Stop card 5</div><div class="c">S-011 · Plan view · waits on you</div></div><span class="dk-radio on"></span></div></div></div>',
 """# NowBlock

Marks the current step, from Craft's selected block. From ref 13.

- A 4-point `accent-select` bar in the margin, a little taller than the block.
- The block: `now-block` tint in a 6-point `now-halo`, radius 10; a page thumbnail 32 by 40; title in 17 medium `now-text`; caption in `text-2`; a selected radio dot at the right.
- Only one per plan. The Now button centres the plan on it.
""")

comp("RadioDot", "Selection", 80,
 f'<div class="dk-stage"><span class="dk-radio"></span><span class="dk-radio on"></span><span class="dk-check"></span><span class="dk-check done">{ic("check", "bold")}</span></div>',
 """# RadioDot

Pick one: an 18-point ring, and a 14-point dot when chosen. Shown beside the checkbox. From refs 12 and 13.

- Ring 1 point `control-border`; the chosen dot `accent-select`.
- Checkbox: 16 square, radius 4. Done (as on a card's header) is a 22 circle in `accent-select` with a white check.
""")

comp("TextButton", "Buttons", 80,
 '<div class="dk-stage"><button class="dk-text-btn">Reset</button><button class="dk-text-btn grey">Cancel</button></div>',
 """# TextButton

A light action in plain 17 regular words. From refs 13 and 16.

- Blue (`accent-text`) for an action such as Reset; grey (`text-2`) for Cancel. At a sheet's top left, opposite Done.
""")

comp("DoneButton", "Buttons", 80,
 '<div class="dk-stage"><button class="dk-done">Done</button></div>',
 """# DoneButton

Confirms and closes a sheet, as a black 70 by 36 capsule. From refs 13 and 16.

- `button-black`, full radius, 17 semibold `on-black`. One per sheet, at its top right.
""")

comp("CapsulePair", "Buttons", 90,
 '<div class="dk-stage"><div class="dk-pair"><button class="no">Cancel</button><button class="go">Apply</button></div></div>',
 """# CapsulePair

Apply or cancel, as two equal capsules 6 apart at the foot of a sheet. From ref 17.

- Each about 166 by 40, full radius, 17.
- Apply: `accent` with `on-accent`, medium. Cancel: `button-grey` with a hairline edge and `on-grey`, regular.
""")

comp("SoftButton", "Buttons", 80,
 f'<div class="dk-stage"><button class="dk-soft">{ic("plus", "bold")}Add a step</button></div>',
 """# SoftButton

Adds a value inside a sheet. From ref 17.

- 40 high, radius 10, white with a hairline `separator-sheet` edge; a grey "+" and 17 regular words.
""")

comp("ToolButton", "Buttons", 90,
 f'<div class="dk-stage"><div class="dk-tools"><button class="dk-tool" aria-label="Checklist">{ic("check-square", "bold")}</button><button class="dk-tool" aria-label="Play">{ic("play", "fill")}</button><button class="dk-tool on" aria-label="Bullets, on">{ic("list-bullets", "bold")}</button><button class="dk-tool" disabled aria-label="Numbers, unavailable">{ic("list-numbers", "bold")}</button></div><button class="dk-close" aria-label="Close">{ic("x-circle", "fill")}</button></div>',
 """# ToolButton

A tool inside a sheet, about 52 by 46, in a row 6 apart. Shown with the small close button. From refs 13, 14 and 17.

- Radius 12, `fill-sheet` with a light top edge; icon 20, bold, `text-1`.
- On: `segment-on` with an `accent-select` edge. Disabled: icon in `text-4`.
- Close: a 24 filled circle with a cross, in `close`; dismisses a popover.
""")

comp("SegmentedRow", "Sheets", 120,
 f'<div class="dk-stage"><div class="dk-seg" role="group" aria-label="Zoom"><button aria-pressed="false">Phases</button><button aria-pressed="true">{ic("calendar-dots", "fill")}Milestones</button><button aria-pressed="false">Sprints</button><button aria-pressed="false">More…</button></div><p class="dk-note">Tap a segment.</p></div>',
 """# SegmentedRow

Picks one of a few words, straight on the sheet, split by short hairlines. From ref 13.

- 49 high; words in 17; short dividers in `separator-sheet` between unselected words.
- Selected: a `segment-on` tile, radius 10, with a 1.3-point `accent-select` edge, an icon and the word in semibold.
- On the desk: how far the plan is zoomed (phases, milestones, sprints).
""", script=PRESS)

comp("SheetField", "Sheets", 130,
 '<div class="dk-stage" style="width:361px"><input class="dk-field" value="S-011 Plan view" aria-label="Name"><input class="dk-field" placeholder="Add a note" aria-label="Note"></div>',
 """# SheetField

Edits a name inside a sheet, 40 high. From ref 17.

- Radius 10, `surface` with a 1-point `separator-sheet` edge; words in `body`, placeholder in `icon`.
""")

comp("BottomSheet", "Sheets", 360,
 f'''<div class="dk-stage" style="background:var(--ground-document)"><div class="dk-sheet" role="dialog" aria-label="Plan tools">
  <div class="dk-grab"></div>
  <div class="dk-sheet-top"><button class="dk-text-btn">Reset</button><h3>Show on the plan</h3><button class="dk-done">Done</button></div>
  <div class="dk-seg" role="group" aria-label="Zoom"><button aria-pressed="false">Phases</button><button aria-pressed="true">{ic("calendar-dots", "fill")}Milestones</button><button aria-pressed="false">Sprints</button></div>
  <div class="dk-tools" style="margin:8px 0 16px"><button class="dk-tool" aria-label="Checklist">{ic("check-square", "bold")}</button><button class="dk-tool" aria-label="Play">{ic("play", "fill")}</button><button class="dk-tool on" aria-label="Bullets">{ic("list-bullets", "bold")}</button><button class="dk-tool" aria-label="Numbers">{ic("list-numbers", "bold")}</button><button class="dk-tool" disabled aria-label="Outdent">{ic("text-b", "bold")}</button><button class="dk-tool" aria-label="More">{ic("dots-three", "bold")}</button></div>
  <div class="dk-pair" style="width:auto"><button class="no">Cancel</button><button class="go">Apply</button></div>
</div></div>''',
 """# BottomSheet

Tools and settings that rise from the bottom. From refs 13, 15, 16 and 17.

- 369 wide (12 from each side), radius 28, frosted: `surface-sheet` (88% opaque) blurring the page behind, `shadow-sheet` with a white inner edge; a 36 by 4 grabber.
- Top line: a TextButton left, the `sheet-title` centred, the DoneButton right.
- Inside: SegmentedRow, ToolButtons, CapsLabels, fields and a CapsulePair at the foot.
- Behind it the page dims with `scrim`. It rises; drag the grabber to resize or dismiss.
""", script=PRESS)

comp("PopoverMenu", "Sheets", 330,
 f'''<div class="dk-stage"><div class="dk-pop" role="menu"><div class="dk-list" style="width:auto">
  <div class="dk-row" role="menuitem"><span class="ic">{ic("calendar-dots", "bold")}</span><span class="tx">Open the plan</span></div>
  <div class="dk-row" role="menuitem"><span class="ic">{ic("record", "bold")}</span><span class="tx">Go to Now</span></div>
  <div class="dk-row" role="menuitem"><span class="ic">{ic("tray", "bold")}</span><span class="tx">Needs you</span></div>
  <div class="dk-row" role="menuitem"><span class="ic">{ic("file-text", "bold")}</span><span class="tx">Latest handoff</span></div>
  </div><hr><div class="dk-list" style="width:auto">
  <div class="dk-row" role="menuitem"><span class="ic">{ic("magnifying-glass", "bold")}</span><span class="tx">Search</span></div>
  <div class="dk-row" role="menuitem"><span class="ic">{ic("export", "bold")}</span><span class="tx">Share</span></div>
</div></div></div>''',
 """# PopoverMenu

A short menu that opens from the button that asked. From ref 17.

- 249 wide, radius 28, frosted white (`surface-popover`), `shadow-sheet`.
- Rows 42 (`size-row-menu`), no lines between them; icons 26, bold, `text-1`; words 17.
- One inset hairline separates groups. Dismiss by tapping outside.
""")

comp("TimelineTrunk", "Desk", 430,
 f'''<div class="dk-stage"><div class="dk-trunk">
  <div class="dk-ms next"><span class="t">Build</span><span class="c">M-4 · planned</span></div>
  <div class="dk-ms now"><div class="dk-nowwrap" style="width:auto"><div class="dk-now">{TH}<div class="hx"><div class="t">Design: stop card 5</div><div class="c">S-011 · waits on you</div></div><span class="dk-radio on"></span></div></div></div>
  <div class="dk-ms done"><span class="t">Plan review</span><span class="c">S-011 · passed</span></div>
  <div class="dk-ms done"><span class="t">Define</span><span class="c">S-010 · done</span></div>
</div><p class="dk-note">Newest first. The trunk is a groove; done work fills it. The node shapes and how "planned" is drawn are placeholders, on hold.</p>
<svg class="dk-branch" width="120" height="44" viewBox="0 0 120 44" aria-hidden="true"><path d="M15 0 C15 30 26 38 60 38 H110"/></svg><p class="dk-note">A branch: the same groove, one smooth curve.</p></div>''',
 """# TimelineTrunk

The desk's own element: the quiet trunk the plan hangs from, with milestone rows on it. Not in the references; built from their pieces.

- The trunk is a groove, chosen by the owner on 15 November 2026 (option 4 of the line options): a 6-point track in `groove`, pressed into the page by `shadow-groove`, the opposite of the raised chips. Work that is done fills it in `groove-fill`, like a slider's fill.
- Branches, from the desk's trunk to each project and from the desk's line into a project's, are the same 6-point groove drawn as one smooth curve with round ends (an SVG stroke in `groove`; a 1-point light lower edge stands in for the inner shadow).
- Done: a filled `text-3` node, words in `text-2`. Planned: a dashed ring. Now: the NowBlock, whose blue bar sits on the trunk.
- Newest at the top; unused milestones hidden by default.
- Motion: opening a project pushes. The desk slides 40 out to the right and fades, and the plan slides in 40 from the left, already centred on Now, in about half a second (owner, 15 November 2026: option 5). Closing reverses it. Nothing draws from the top down. Reduced motion turns it off.
- On hold, in the owner's words: the key shapes for milestones and sprints, and how planned is drawn ("I think that will get changed around a bit as well").
""")


LANE_EV = [(None, "git-commit"), ("a", "git-branch"), ("a", "git-commit"), ("b", "git-branch"), ("a", "eye"), ("b", "git-commit"),
           (None, "git-merge", "a"), ("c", "git-branch"), ("b", "git-pull-request"), ("c", "git-commit"), (None, "git-merge", "b"),
           ("c", "play-circle", None, True), (None, "rocket-launch")]
def lanes_html():
    col, used, maxc = {}, {}, 0
    for e in LANE_EV:
        if e[1] == "git-branch":
            c = 1
            while used.get(c): c += 1
            used[c] = e[0]; col[e[0]] = c; maxc = max(maxc, c)
        if len(e) > 2 and e[2]: used[col[e[2]]] = None
    RH, X0, DX, TOP = 40, 24, 30, 8
    N = len(LANE_EV); H = TOP + N * RH; W = X0 + maxc * DX + 20
    y = lambda i: TOP + (N - 1 - i) * RH + RH / 2
    x = lambda c: X0 + c * DX
    paths = [f'<path class="main" d="M{X0} {TOP - 4} V{H - 4}"/>']
    for b, c in col.items():
        s_ = next(i for i, e in enumerate(LANE_EV) if e[0] == b and e[1] == "git-branch")
        e_ = next((i for i, e in enumerate(LANE_EV) if len(e) > 2 and e[2] == b), -1)
        xl, ys = x(c), y(s_)
        paths.append(f'<path d="M{X0} {ys + RH * .8} C{X0} {ys + RH * .35} {xl} {ys + RH * .45} {xl} {ys}"/>')
        if e_ >= 0:
            ye = y(e_); paths.append(f'<path d="M{xl} {ys} V{ye + RH * .8} C{xl} {ye + RH * .35} {X0} {ye + RH * .45} {X0} {ye}"/>')
        else:
            paths.append(f'<path d="M{xl} {ys} V{TOP - 4}"/>')
    icons = "".join(f'<span class="dk-lane-ico{" main" if e[0] is None else ""}{" run" if len(e) > 3 and e[3] else ""}" style="left:{x(col[e[0]]) if e[0] else X0}px;top:{y(i)}px">{ic(e[1])}</span>' for i, e in enumerate(LANE_EV))
    return f'<div class="dk-lanes" style="width:{W}px;height:{H}px"><svg class="lines" width="{W}" height="{H}" aria-hidden="true">{"".join(paths)}</svg>{icons}</div>'

comp("LaneGraph", "Desk", 600,
 '<div class="dk-stage">' + lanes_html() + '<p class="dk-note">Newest at the top. Main on the left, darker and wider, with dark icons. Each open branch takes the next free lane; a merged branch frees its lane.</p></div>',
 """# LaneGraph

How several branches show at once on the timeline: a git graph drawn in the library's groove. Chosen by the owner on 15 November 2026 ("Option C is my choice", of the lane options).

**On the timeline it is replaced by BranchMap.** The owner found the lanes took too much room left to right (decisions/questions/P-005-design-round-3.md, answers 1 to 3) and chose a branch map floating at the top instead, showing the whole phase and panning with the page (answer 6). The card is kept for the record and for any place that needs a vertical git graph; timeline mockups from v13 on draw no lanes beside the list.

- Main is the left lane. Its groove is 8 wide in `groove-main`, and its event icons sit on dark `main-mark` discs in `on-main-mark`. Branch grooves are 6 wide in `groove`, and their icons sit on `fill`.
- A branch opens the lowest free lane to the right where it starts, curving out of main, and keeps it while it is open. Branches open at the same time sit side by side.
- A merge curves the branch back into main. From a far lane, the curve crosses the lanes between. A merged branch frees its lane for the next branch. A branch still open runs to the top.
- Each icon is one event, in its kind's shape: the seven GitHub kinds only (the owner, 15 November 2026: "The only thing I really want to keep is the different 7 constants."). States are neutral; a running event is an outlined ring.
- Icons 26 round with a 15 glyph, a 3-point ring of `ground`; lanes 30 apart; rows 40 apart.
""")


def plan_item(state, n, title, why, prob=None, fix=None):
    mk = {"ok": ic("check", "bold"), "blocked": ic("warning", "fill"), "now": "", "next": ""}[state]
    h = f'<li class="{state}"><span class="mk {state}">{mk}</span><div class="ti"><span class="num">{n}</span>{title}' + ('<span class="nowtag">Now</span>' if state == "now" else '') + f'</div><div class="why">{why}</div>'
    if prob:
        h += f'<div class="pr"><div class="p">{ic("warning", "fill")}{prob}</div><div>{ic("arrow-bend-down-right", "bold")}{fix}</div></div>'
    return h + '</li>'
PLAN = [
  ("next", "5.4", "Say which version the check tests", "Your phone test hasn&#8217;t run, so it tests the normal version until then."),
  ("now", "5.3", "Hold the phone-width check", "It needs your widths first."),
  ("ok", "5.2", "Let the builder update the widget&#8217;s copy", "The spec requires it, but that folder was off limits.", "Its exact location isn&#8217;t on record.", "Allowed it, and asked you to confirm the location before freezing."),
  ("ok", "5.1", "Make sure no alert is missed", "The milestone promises anything that needs you reaches your phone. A late step could slip through."),
]
PLAN_DONE = [("blocked", "5.5", "Move the experiments to the new spec", "They prove the milestone, but still point at the old spec.", "They weren&#8217;t in what the spec writer was given.", "Made it a condition: no freeze until they move.")]
comp("ActionPlan", "Desk", 680,
 '<div class="dk-stage col" style="max-width:420px">'
 '<div class="dk-step"><div class="hd">2.7.2.5 · The spec writer · 2 of 4 done</div><ol class="dk-plan">' + "".join(plan_item(*x) for x in PLAN) + '</ol></div>'
 '<div class="dk-step"><div class="hd">A problem that stopped an action</div><ol class="dk-plan">' + "".join(plan_item(*x) for x in PLAN_DONE) + '</ol></div>'
 '<p class="dk-note">Newest at the top. Each action is the agent&#8217;s plan, ticked off as it goes.</p></div>',
 """# ActionPlan

The work between two events: what the agent planned to do, why, and any problem with what was done about it, in plain English. Chosen by the owner on 15 November 2026 (decisions/questions/P-005-design-round-2.md, answers 14 to 23).

- Sits on the timeline between the two events it connects, inside a `dk-step` card headed by the step's number, who, and how much is done.
- Each action: a number (the step's number and its place, shown as 5.3 inside step 2.7.2.5), a title in 15 semibold, and one line of why in 14 `text-2`. Concise.
- Marks: a check when done; a blue dot in a soft ring with the word Now for the one under way; an open dot, with a grey title, for those still to come; a red warning in `problem` for one that could not be finished.
- A problem that came up sits in a `problem-wash` box: the problem in `problem` with a warning sign, then what was done about it after an arrow.
- Newest at the top, like the rest of the timeline: the first action is at the bottom, next to the event that started the step.
- Planned ahead and ticked off; the agent writes its own lines in this fixed form (the owner: "Yes I do"). Until the agents record actions, a mockup shows them as examples.
- Numbers: each level counted inside the one above, never reused: phase 2, milestone 2.7, sprint 2.7.2, step 2.7.2.5, action 2.7.2.5.3.
""")

# ---- round 3 (owner, 15 November 2026): status colour, gauges, marks, the branch map and the phase row ----
def gauge(pct, st, inner, tag="span", attrs=""):
    c = 2 * 3.14159 * 14
    arc = f'<circle class="arc" cx="17" cy="17" r="14" stroke-dasharray="{c * pct / 100:.1f} {c:.1f}" transform="rotate(-90 17 17)"/>' if pct else ''
    return (f'<{tag} class="dk-gauge {st}"{attrs}><svg class="ring" viewBox="0 0 34 34" aria-hidden="true"><circle class="trk" cx="17" cy="17" r="14"/>{arc}</svg>'
            f'<span class="in">{inner}</span></{tag}>')
MS_IC = ic("circle", "fill", "i sm")
OWN_IC = ic("square", "fill", "i sm")
SP_IC = ic("git-branch")
def grow(pct, st, inner, no, name, meta, note, label):
    return (f'<button class="dk-grow" aria-expanded="true" aria-label="{label}">{gauge(pct, st, inner)}<span class="tx"><span class="l1"><span class="no">{no}</span><b>{name}</b>'
            f'<span class="tm">{meta}</span></span><span class="l3" style="display:block">{note}</span></span></button>')
MK = {"ok": ic("check", "bold"), "wait": ic("hourglass-medium", "fill"), "bad": ic("x", "bold"), "run": ic("hourglass-medium", "fill")}
EVI = {"commit": "git-commit", "review": "eye", "stop": "hand-palm", "merge": "git-merge", "step": "list-checks", "check": "play-circle", "decision": "chat-circle-text"}
def mark_ev(kind, st, tag, t, title, who, main=False, label=None):
    return (f'<div class="dk-ev"><span class="dk-ev-ico{" main" if main else ""}">{ic(EVI[kind])}<span class="dk-mark {st}">{MK[st]}</span></span>'
            f'<div class="tx"><div class="l1"><b>{label or kind.title()}</b><span class="dk-tag {st if st in ("wait", "bad") else ""}">{tag}</span><span class="tm">{t}</span></div>'
            f'<div class="l2">{title}</div><div class="l3">by {who}{" · main" if main else ""}</div></div></div>')
FOLD = "document.addEventListener('click', function (e) { var b = e.target.closest('.dk-grow'); if (!b) return; var s = b.parentNode, on = !s.classList.contains('open'); s.classList.toggle('open', on); b.setAttribute('aria-expanded', String(on)); });"

comp("Gauge", "Desk", 460,
 '<div class="dk-stage col" style="max-width:393px">'
 '<div style="display:flex;gap:14px;align-items:center">' + gauge(14, "wait", '<span class="pn">2</span>') + gauge(100, "ok", MS_IC) + gauge(30, "bad", OWN_IC) + gauge(60, "bad", SP_IC) + gauge(0, "", MS_IC) + '</div>'
 '<div class="dk-gsec open">' + grow(30, "bad", OWN_IC, "2.7", "M6", "example", "Stopped: three plan reviews failed", "M6, fold") +
 '<div class="body"><div class="dk-gsec open">' + grow(60, "bad", SP_IC, "2.7.2", "Spec S-011", "example", "Stopped · your call", "Spec S-011, fold") +
 '<div class="body">' + mark_ev("stop", "wait", "Waiting on you", "15:42", "Stop card 5", "orchestrator") + '</div></div>'
 '<div class="dk-gsec">' + grow(100, "ok", SP_IC, "2.7.1", "Spec S-010", "merged", "Superseded by S-011", "Spec S-010, open") + '<div class="body">' + mark_ev("merge", "ok", "Done", "12:04", "Merged PR #444", "you", True) + '</div></div></div></div>'
 '<div class="dk-gsec">' + grow(0, "", MS_IC, "2.6", "Design-6", "not started", "A plan that passed review", "Design-6") + '<div class="body"></div></div>'
 '<p class="dk-note">The Design phase (yellow, 1 of 7 reached), a milestone reached, the owner&#8217;s milestone M6 and sprint S-011 stopped (red), not started (no colour). Tap a gauge row to fold or open it. Percentages marked example are made up.</p></div>',
 """# Gauge

How far a phase, milestone or sprint has got, and whether it is all right: a tinted ring filled by percent, with its icon inside. Chosen by the owner on 15 November 2026 (decisions/questions/P-005-design-round-3.md, answers 4, 6 to 8: "A - but let's make the color gauge softer", "I like the tinted ring. Do a slightly thinner line.").

- 34 round, line 3.5. The arc starts at the top and runs clockwise; it is filled by percent with round ends. The inside of the ring takes an 8% wash of the status colour, the track 16% and the arc 55% (`status-*-wash`, `status-*-track`, `status-*-arc`), so the colour stays soft.
- Only phases, milestones and sprints wear it (the owner: "only phases, milestones and sprints get the gauges"). Events and steps use StatusMark.
- Inside: a phase's number; a small filled circle for a standard milestone, a small square for one of the project's own; the git-branch icon for a sprint.
- **What it counts** (the owner, 25 November 2026, decisions/questions/P-005-design-round-7.md, answer 25, "C: criteria + work"): a phase, its milestones reached of the milestones in the phase; a milestone, its criteria met (a project milestone, its spec's acceptance criteria passing their locked checks; a standard milestone, the checks that define it); a sprint, its events done of those it plans. Side by side they show work moving against what is truly done.
- **Its colour** (answer 26, "1: what happened"): red (`status-bad`) stopped (a stop card), or a review failed the third time; yellow (`status-wait`) waiting on you, or a review failed; green (`status-ok`) moving, or done; no colour when not started. A milestone and a phase take the worst colour of what they hold. The track takes the soft status colour too, so a gauge at 0 still shows its state. Due dates play no part; no record carries them.
- Tapping the gauge opens or folds its section (the owner, round 3: "the icons on the timeline should expand or collapse sections"). The whole row is the button, with the gauge as its mark; it carries aria-expanded.
- Milestone and sprint shapes are still on hold (round 2): the circle and square inside are placeholders.
""", script=FOLD)

comp("StatusMark", "Desk", 520,
 '<div class="dk-stage col" style="max-width:393px"><div>'
 + mark_ev("stop", "wait", "Waiting on you", "15:42", "Stop card 5", "orchestrator")
 + mark_ev("review", "bad", "Failed", "15:36", "Plan review failed, round 3", "reviewer (plan)")
 + mark_ev("commit", "ok", "Done", "15:23", "Spec revised again", "spec writer")
 + mark_ev("step", "bad", "1 blocked", "", "The spec writer&#8217;s plan · 5 of 6 done", "spec writer", label="2.7.2.5")
 + mark_ev("merge", "wait", "Awaiting your answers", "14:46", "Merged PR #446: three questions for you", "you", True)
 + mark_ev("check", "run", "Checks running", "12:10", "Checks on PR #445", "Actions")
 + '</div><p class="dk-note">The kind&#8217;s icon stays; a small check, hourglass or cross on its corner; the state as a tag, tinted for waiting on you and for failed or blocked, plain grey when done or under way.</p></div>',
 f"""# StatusMark

The state of an event or a step, without a gauge. Chosen by the owner on 15 November 2026 (decisions/questions/P-005-design-round-3.md, answers 8 and 9: "I like option 2 with the text tags as shown in option 1. To indicate things like awaiting merge, check status etc..").

- The event keeps its kind's icon on a 26 `fill` disc (a merge on main keeps its dark `main-mark` disc). A step, the agent's plan between events, is shown the same way with the list-checks icon.
- A 14 round mark on the icon's lower right corner, ringed in `ground`: a check in `status-ok` on `status-ok-mark` (done, fine); an hourglass in `status-wait-tag` on `status-wait-mark` (waiting on you); a cross in `status-bad` on `status-bad-mark` (failed or blocked); a grey hourglass in `text-2` on `surface` for work under way that waits on no one (checks running). The state reads without colour too.
- The state as a text tag after the kind: waiting tinted yellow (`status-wait-tag` on `status-wait-tag-bg`, 4.7:1), failed or blocked tinted red (`status-bad-tag` on `status-bad-tag-bg`, 4.7:1), done or under way a plain grey word in `text-2`. Tags can name the state in the desk's words: Awaiting merge, Awaiting your answers, Checks running, 1 blocked.
- Red keeps meaning a problem (`status-bad` has the same value as `problem`).
- How gate, decision, research and stop show (the model's own steps) is still to be discussed; they keep their own icons for now.
- {SRC}
""")

# how heavy an event is (round 6, answers 3 and 6): turning points larger, checks as they are, routine one quiet line
def wt(h, w): return h.replace('<div class="dk-ev">', f'<div class="dk-ev wt-{w}">', 1)
EWT = ('<div class="dk-stage col" style="max-width:393px"><div>'
  + wt(mark_ev("stop", "wait", "Waiting on you", "15:42", "Stop card 5", "orchestrator"), 1)
  + wt(mark_ev("review", "bad", "Failed", "15:36", "Plan review failed, round 3", "reviewer (plan)"), 2)
  + wt(mark_ev("commit", "ok", "Done", "15:23", "Spec revised again", "spec writer"), 3)
  + wt(mark_ev("review", "bad", "Failed", "15:14", "Plan review failed, round 2", "reviewer (plan)"), 2)
  + wt(mark_ev("merge", "wait", "Awaiting your answers", "14:46", "Merged PR #446: three questions for you", "you", True), 1)
  + wt(mark_ev("commit", "ok", "Done", "12:37", "Spec revised", "spec writer"), 3)
  + '</div><p class="dk-note">Read down S-011: the stop and the merge stand out, the reviews keep their row, the revisions recede. The weight comes from a rule, not a choice per event.</p></div>')
comp("EventWeight", "Desk", 470, EWT,
 """# EventWeight

How heavy an event looks in a project's list comes from what it is, so the few that matter stand out. Chosen by the owner on 17 November 2026 (decisions/questions/P-005-design-round-6.md: answer 3, a comment on v21, "This entire flow here is solid, but in its current visual format every single event has the same weight and means nothing unique, can we change that"; answer 6, "I want to go with Option A").

- **Turning points**: a stop, a decision, a gate, a merge to main, or anything waiting on you. The icon disc grows to 34 (its icon 19), the title is 17 semibold and wraps, and the row takes 12 above and 10 below.
- **Checks**: a review or a check, passed or failed. The StatusMark row as it was: 26 disc, kind and tag, title in 15, the by-line.
- **Routine**: a commit (a draft or a revision) and other agent housekeeping. One quiet line: a 20 outlined icon in `text-2` with no corner mark, the title in 14 `text-2`, then any Needs or Why tag and the time in 12; the kind word, the plain Done tag and the by-line go. A failed or waiting tag would still show.
- Colour does not change: neutral greys and the soft status tints only. The order and the tree stay.
- {SRC}
""".replace("{SRC}", SRC))

# one order of operations (round 6, answers 8 to 14): top down, where it happened or is meant to, numbers in that order
RO = ('<div class="dk-stage col" style="max-width:393px"><div>'
  + grow(14, "wait", '<span class="pn">2</span>', "", "Design", "14%", "1 of 7 milestones reached · 4 things wait on you", "Design phase")
  + '<div style="padding-left:12px">'
  + grow(100, "ok", MS_IC, "2.1", "Done defined in real scenarios", "", "Reached · 100%", "Milestone 2.1")
  + grow(30, "bad", OWN_IC, "2.2", "M6 · The records can carry the timeline", "", "Stopped: three plan reviews failed · 30%, example", "Milestone 2.2, M6")
  + grow(40, "ok", MS_IC, "2.3", "The design fits together", "", "Mockups under way · 40%, example", "Milestone 2.3")
  + f'<div class="dk-nowwrap" style="margin:6px 0"><div class="dk-now">{TH}<div class="hx"><div class="t">Stop card 5</div><div class="c">Now · waits on you</div></div><span class="dk-radio on"></span></div></div>'
  + grow(0, "", MS_IC, "2.4", "A plan that passed review", "", "Next · not started", "Milestone 2.4")
  + grow(0, "", MS_IC, "2.5", "Every unknown has a test", "", "Planned", "Milestone 2.5")
  + '</div></div><p class="dk-note">Read down: what happened, Now, then what is meant to come. The numbers follow that order, so they never jump.</p></div>')
comp("ReadingOrder", "Desk", 520, RO,
 """# ReadingOrder

One order of operations for a project's list, at every level. Chosen by the owner on 17 and 18 November 2026 (decisions/questions/P-005-design-round-6.md: answer 8, "The Phase reads top down, then the milestones read bottom up - that needs to be fixed"; answer 13, "all I really want is an established order of operations basically so I can read things in the order they occurred or were meant to I guess?"; answer 14, "Yes, that's it (Recommended)").

- **Top down, everywhere**: the phase, its milestones, a sprint's events and a plan's actions all read from the earliest to the latest. Something that has happened sits where it happened; something that has not sits where it is meant to happen.
- **Milestones** are placed by when their work began, or is meant to begin. Now sits at the clock: after what has begun, before what is still to come.
- **One number**: the numbers (2.1, 2.2, 2.2.1, 2.2.2.5) follow that same order, so they never jump. A standard milestone's own id from the operating model (Design-5) is not shown in the row, since it carries a different order; its plain name is. A project's own milestone keeps its name (M6).
- Nothing else is added for order: no bars, no group headings. When work began or is meant to begin is not yet in the records; mockups use examples.
- {SRC}
""".replace("{SRC}", SRC))

# the branch map, drawn from the Design phase's real sprints (timeline mockup v12's records, 13 and 14 November 2026)
def _t(d, hm): h, m = hm.split(":"); return (d - 13) * 1440 + int(h) * 60 + int(m)
MAP_SP = [("2.7.1 S-010", [(13, "21:32", "commit", ""), (13, "21:44", "review", "bad"), (13, "23:45", "commit", ""), (13, "23:51", "review", "bad"), (14, "01:05", "stop", ""), (14, "04:56", "merge", ""), (14, "04:58", "decision", ""), (14, "12:04", "merge", "")]),
          ("2.5.1 PR #445", [(14, "12:05", "commit", ""), (14, "12:12", "check", ""), (14, "13:54", "merge", "")]),
          ("2.7.2 S-011", [(14, "12:07", "decision", ""), (14, "12:16", "commit", ""), (14, "12:29", "review", "bad"), (14, "12:37", "commit", ""), (14, "14:46", "merge", "wait"), (14, "15:14", "review", "bad"), (14, "15:23", "commit", ""), (14, "15:36", "review", "bad"), (14, "15:42", "stop", "now")]),
          ("2.5.2 Mockups v2 to v4", [(14, "14:56", "commit", ""), (14, "15:26", "commit", ""), (14, "15:52", "commit", ""), (14, "16:00", "commit", ""), (14, "16:14", "commit", "")])]
def branch_map(view=("15:14", "15:23", "15:36", "15:42"), vw=393):
    DX, PAD, LANE = 30, 26, 32
    evs = [dict(sp=si, t=_t(d, hm), hm=hm, k=k, st=st) for si, (_, es) in enumerate(MAP_SP) for d, hm, k, st in es]
    order = sorted(range(len(evs)), key=lambda i: evs[i]["t"])
    for n, i in enumerate(order): evs[i]["x"] = PAD + n * DX
    sps = []
    for si, (lab, _) in enumerate(MAP_SP):
        es = sorted([e for e in evs if e["sp"] == si], key=lambda e: e["t"]); sps.append(dict(lab=lab, evs=es, a=es[0]["t"], b=es[-1]["t"]))
    busy = {}
    for s in sorted(sps, key=lambda s: s["a"]):
        l = 1
        while busy.get(l, -1) >= s["a"]: l += 1
        s["lane"] = l; busy[l] = s["b"]
    lanes = max(s["lane"] for s in sps); YM = 22 + LANE * lanes; W = PAD * 2 + (len(evs) - 1) * DX; H = YM + 24
    vis = [e for e in evs if e["sp"] == 2 and e["hm"] in view]
    a, b = min(e["x"] for e in vis) - 14, max(e["x"] for e in vis) + 14
    pan = max(0, min(W - vw, (a + b) / 2 - vw / 2))
    p = f'<path class="g main" d="M0 {YM} H{W}"/>'; st_ = ""; lb = ""
    for s in sps:
        y = YM - LANE * s["lane"]; on = [e for e in s["evs"] if e["k"] != "merge"]
        x0 = s["evs"][0]["x"]; x1 = on[-1]["x"] if on else x0
        p += f'<path class="g" d="M{x0 - 16} {YM} C{x0 - 8} {YM} {x0 - 8} {y} {x0} {y} H{x1}"/>'
        for j, e in enumerate(s["evs"]):
            main = e["k"] == "merge"; cy = YM if main else y
            if main:
                px = s["evs"][j - 1]["x"] if j else e["x"] - 16
                p += f'<path class="g" d="M{px} {y} C{(px + e["x"]) / 2} {y} {(px + e["x"]) / 2} {YM} {e["x"]} {YM}"/>'
            cls = " ".join(c for c in ["main" if main else "", e["st"]] if c)
            if e in vis or e["st"] == "now":
                svg = ic(EVI[e["k"]], cls="ic " + cls).replace('<svg class', f'<svg x="{e["x"] - 6}" y="{cy - 6}" width="12" height="12" class', 1)
                st_ += f'<circle class="disc {cls}" cx="{e["x"]}" cy="{cy}" r="10.5"/>{svg}'
            else:
                st_ += f'<circle class="dot {cls}" cx="{e["x"]}" cy="{cy}" r="4"/>'
        lb += f'<text class="lb" x="{x0}" y="{y - 9}">{s["lab"]}</text>'
    win = f'<rect class="win" x="{a}" y="{YM - LANE * lanes - 12}" width="{b - a}" height="{LANE * lanes + 24}" rx="10"/>'
    return (f'<div class="dk-mapbar"><div class="dk-mapvp"><div class="dk-mapin" style="transform:translateX({-pan:.0f}px)"><svg class="dk-map" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="Branch map of the Design phase">'
            f'{win}{p}{st_}{lb}<text class="lb main" x="{pan + 6:.0f}" y="{YM + 19}">main</text></svg></div></div></div>')

comp("BranchMap", "Desk", 330,
 '<div class="dk-stage col" style="max-width:393px;padding:16px 0">' + branch_map() + '<p class="dk-note" style="padding:0 16px">The Design phase&#8217;s four sprints, oldest on the left. The window sits over S-011&#8217;s newest events, which the list below shows; they wear their icons, the rest are dots. Red for the failed reviews, yellow for PR #446 still awaiting your answers, Now blue.</p></div>',
 """# BranchMap

Every sprint of the current phase at once, floating at the top of a project's timeline. It replaces the lanes down the left (LaneGraph) on the timeline. Chosen by the owner on 15 November 2026 (decisions/questions/P-005-design-round-3.md: answers 1 to 3, the branch map on top; 4 to 6, "A: whole phase, panning"; 10 to 13, icons where you are, with colour).

- Floats: it sits at the top of the project's timeline, under the page's header and chips, and stays there however far the page scrolls (sticky, glass: `surface-floating` blurred, a `separator` hairline below).
- Shows the whole current phase: every sprint, oldest on the left, time running left to right. Main runs along the bottom, 7 wide in `groove-main`, darker than the sprints' 5-wide `groove`. Each sprint is a lane above main, curving out where it starts and back down at each merge; a merged sprint frees its lane for the next. Each lane is labelled with the sprint's number and name.
- Merges sit on main, on dark `main-mark` discs.
- A soft blue window (`map-window`) marks the events in view in the list below. As the page scrolls, the window moves and the map slides sideways to keep it centred (it moves with the timeline: the owner, round 3, answer 4).
- Events in view show their kind's icon on a 21 disc; the rest of the phase is 8-point dots.
- Status colour on both icons and dots, the same soft tones as the rows: red (`status-bad-dot`, an icon in `status-bad` on `status-bad-track`) for failed or blocked, yellow (`status-wait-dot`, `status-wait-tag` on `status-wait-tag-bg`) for waiting on you. Done stays grey. Now stays blue (`accent-select` in a `now-block` ring).
- Below it, in the same floating band, sits the PhaseRow.
- Motion: the window and the pan ease over about 0.45 s; reduced motion moves them at once.
""")

PH_ROW = [("1", "Discovery", 38, "ok", False), ("2", "Design", 14, "wait", True), ("3", "Build", 0, "", False), ("4", "Launch", 0, "", False)]
comp("PhaseRow", "Desk", 190,
 '<div class="dk-stage col" style="max-width:393px"><div class="dk-phases" role="group" aria-label="Phases">' +
 "".join(f'<button class="dk-phase" data-ph="{n}"{" aria-current=&quot;true&quot;" if cur else " aria-expanded=&quot;false&quot;"} aria-label="{nm}, {p} percent">{gauge(p, st, f"<span class=pn>{n}</span>")}<span>{nm}</span></button>' for n, nm, p, st, cur in PH_ROW).replace("&quot;", '"') +
 '</div><p class="dk-note">Discovery done (3 of 8 milestones on record as reached), Design current and waiting on you (1 of 7), Build and Launch not started. Tap Build or Launch: it shows as opened.</p></div>',
 """# PhaseRow

All of a project's phases in one row of gauges, under the BranchMap in the same floating band. Chosen by the owner on 15 November 2026 (decisions/questions/P-005-design-round-3.md, answers 4, 5 and 10: "Phase gauges row").

- One Gauge per phase, its number inside, its name below in 12 `text-2`; oldest on the left, like the map. Each phase's percentage is its milestones reached out of the milestones in it.
- The current phase is picked out: raised on `surface` with `shadow-chip-selected`, its name in `text-1` semibold.
- The timeline opens on the current step with everything in it open, and lists only the current phase. Tapping another phase opens its milestones above the current phase (the button turns `fill`, aria-expanded true), and only then does the page scroll, to bring them under the band. Tapping it again folds them away. Tapping the current phase goes back to the current step.
- Gates are not shown in the row; how a gate shows is still to be discussed.
""", script="document.addEventListener('click', function (e) { var b = e.target.closest('.dk-phase[aria-expanded]'); if (b) b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true')); });")

# the desk map: home's map of every project, one lane each (round 4, answers 6 to 8)
import math
DESK = [("The timeline", "Design · Service-Desk", "Design: the spec stopped again after three plan reviews. Your call.", "4",
         [13.5, 12, 11, 9.5, 8, 6.5, 5, 3.2, 2, 1.2, .5, .25], None, [(9, 5), (4.5, 0)], [("wait", "chat-circle-text", "3 questions", .11), ("bad", "hand-palm", "Your call", .07)]),
        ("Home-screen widget", "Discovery · Service-Desk", "Discovery: its readiness check failed on 4 November. Your call.", "1",
         [14, 13], None, [], [("bad", "flag", "Failed · your call", 12.2)]),
        ("operating model", "Personal-Org-Operating-Model", "The spec-number fix is released as 3.7.3.", "", [13, 11.5, 10, 7, 6, 4, 2.5], 1.4, [(7, 4)], []),
        ("Model-Lab", "Model-Lab", "Four pull requests merged overnight.", "", [12, 9, 6, 3, .8, .6, .45, .3], None, [(3, .3)], []),
        ("portfolio", "portfolio", "Quiet since 12 November.", "", [13, 8.5, 4.2], None, [], [])]
def desk_map(folded=False, W=393):
    x0, x1, top = 16, W - 22, 22
    gap = 34 if folded else 62
    X = lambda t: x1 - math.sqrt(t / 14) * (x1 - x0)
    H = top + len(DESK) * gap + 4
    o = f'<line class="nowl" x1="{x1}" x2="{x1}" y1="4" y2="{H - 4}"/>'
    for t, w in ((14, "31 Oct"), (7, "7 Nov"), (1, "yesterday"), (0, "now")):
        o += f'<text class="ax" x="{X(t):.1f}" y="12" text-anchor="{"start" if t == 14 else "middle" if t else "end"}">{w}</text>'
    pops = ""
    for i, (nm, sub, what, bd, ev, ok, br, pp) in enumerate(DESK):
        y = top + (i + 1) * gap - 6
        o += f'<g class="ln" transform="translate(0 {y})"><path class="g main" d="M{x0} 0H{x1}"/>'
        for a, c in br:
            a, c = X(a), X(c)
            o += f'<path class="g" d="M{a:.1f} 0C{a + 6:.1f} 0 {a + 4:.1f} -9 {a + 12:.1f} -9H{c - 12:.1f}C{c - 4:.1f} -9 {c - 6:.1f} 0 {c:.1f} 0"/>'
        o += "".join(f'<circle class="dot" cx="{X(t):.1f}" cy="0" r="3"/>' for t in ev)
        if ok: o += f'<circle class="dot ok" cx="{X(ok):.1f}" cy="0" r="4"/>'
        o += f'<circle class="now" cx="{x1}" cy="0" r="3"/>'
        ny = -12 if folded else -32
        o += f'<text class="nm" x="{x0}" y="{ny}">{nm}</text>'
        if bd: o += f'<circle class="bdc" cx="{x0 + len(nm) * 6.9 + 13:.0f}" cy="{ny - 4.5}" r="7.5"/><text class="bd" x="{x0 + len(nm) * 6.9 + 13:.0f}" y="{ny - .5}" text-anchor="middle">{bd}</text>'
        if not folded: o += f'<text class="sm" x="{x0}" y="-17">{what}</text>'
        o += '</g>'
        right = min(X(min(q[3] for q in pp)) + 11, x1 - 2) if pp else 0
        for st, icn, tag, t in sorted(pp, key=lambda q: q[3]):
            w = 30 + len(tag) * 6.6
            if right - w < 60: left = max(4, right - 22); right = left - 4
            else: left = right - w; right = left - 4
            pops += f'<button class="dk-pop {st}" style="left:{left:.0f}px;top:{y}px" aria-label="{tag}: show what needs you"><span class="d">{ic(icn)}</span>{tag}</button>'
    return (f'<div class="dk-deskmap{" folded" if folded else ""}"><div class="wrap" style="height:{H}px"><svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" '
            f'aria-label="Desk map: every project over the last two weeks">{o}</svg>{pops}</div></div>')

comp("DeskMap", "Desk", 700,
 '<div class="dk-stage col" style="max-width:393px;padding:16px 0;gap:14px">' + desk_map() + '<p class="dk-note" style="padding:0 16px">Open, as home opens. Below: folded, once you scroll down to Needs you.</p>' + desk_map(True) + '<p class="dk-note" style="padding:0 16px">The activity before today is an example; what waits on you is the desk&#8217;s.</p></div>',
 """# DeskMap

**Not used on home from mockup v15.** The owner asked whether the home page really worked (decisions/questions/P-005-design-round-4.md, answer 9) and chose WaitGroup instead (answers 11 and 12). The card is kept for the record.

Every project on the desk as one lane of a small branch map, at the top of the home page. It takes the place of the project cards. Chosen by the owner on 15 and 16 November 2026 (decisions/questions/P-005-design-round-4.md: answer 6, "show what you have pinned at the top, the maps - but things that need me will popup in their usually color and format"; answer 7, option 1, with "the map needs more space" and no "old cards"; answer 8, "B: opens large, folds slim").

- One lane per project, in the desk's order, on one shared time axis: two weeks ago on the left, now on the right, the time stretched toward now (square root) so today's events have room. Axis words in 10 `text-3` (the mockup's dates): 31 Oct, 7 Nov, yesterday, now; a dotted `accent-select` line at now.
- Each lane is the project's main in `groove-main`, 5 wide, its branches as 4-wide `groove` loops above, its events as 6-point dots, done green (`status-ok-arc`) where a release landed, and a Now dot at the right end.
- **Open** (as the page opens): 62 per lane. The project's name in 13 semibold `text-1`, its waiting count in the blue badge, and its one line in 12 `text-2` under the name.
- **Folded** (once scrolled to Needs you): 34 per lane, the name and badge only, pinned at the top in the glass band (`surface-floating`, blurred, a `separator` hairline below). Scrolling back to the top opens it again. Lanes, names and pop-ups slide between the two over about 0.4 s; reduced motion swaps at once.
- **Pop-ups**: each thing waiting on the owner sits on its project's lane as a capsule, its icon on a `surface` disc and its tag in the StatusMark tint: red (`status-bad-tag` on `status-bad-tag-bg`) for stopped or failed, yellow (`status-wait-tag` on `status-wait-tag-bg`) for questions. The newest sits at its place in time and the others flow left from it; one with no room to its left grows rightward from its icon. They pop in on load.
- Tapping a pop-up scrolls to its own row in Needs you and lights it in `map-window` for about 1.5 s; several rows (the three questions) light together. Needs you stays one list, in order of waiting.
- Tapping a lane opens its project.
- {SRC}
""".replace("{SRC}", SRC), script="document.querySelectorAll('.dk-deskmap .ln').forEach(function (g) { var t = g.querySelector('.nm'), c = g.querySelector('.bdc'), n = g.querySelector('.bd'); if (!c) return; var x = +t.getAttribute('x') + t.getComputedTextLength() + 13; c.setAttribute('cx', x); n.setAttribute('x', x); });")

# home, grouped by what waits (round 4, answers 11 and 12): the desk's real records as of 14 November, 17:25
NOW_M = 14 * 1440 + 17 * 60 + 25
def _m(d, hm): h, m = hm.split(":"); return d * 1440 + int(h) * 60 + int(m)
STRIP = {"tl": [(14, "15:42", "bad"), (14, "14:46", "merge"), (14, "13:54", "merge"), (14, "12:07", ""), (14, "12:04", "merge"), (14, "01:05", ""), (13, "16:10", "")],
         "wd": [(4, "20:53", "bad")],
         "om": [(14, "04:56", "merge"), (14, "02:55", "merge"), (14, "01:16", "merge")],
         "ml": [(14, "01:06", "merge"), (14, "01:02", "merge"), (13, "23:45", "merge")],
         "pf": [(12, "16:03", "merge")]}
def strip(pid, W=260):
    x0, x1 = 4, W - 8
    X = lambda m: x1 - math.sqrt(min(14, (NOW_M - m) / 1440) / 14) * (x1 - x0)
    o = f'<line class="ln" x1="{x0}" x2="{x1}" y1="14" y2="14"/>'
    for d, hm, c in STRIP[pid]:
        o += f'<circle class="ev {c}" cx="{X(_m(d, hm)):.1f}" cy="14" r="{4.5 if c == "bad" else 3}"/>'
    o += f'<circle class="now" cx="{x1}" cy="14" r="3"/><text class="ax" x="{x0}" y="4">31 Oct</text><text class="ax" x="{x1}" y="4" text-anchor="end">now</text>'
    return f'<span class="dk-strip" aria-hidden="true"><svg width="{W}" height="20" viewBox="0 0 {W} 20">{o}</svg></span>'
def prow(pid, g, name, n, tm, what):
    return (f'<button class="dk-prow" aria-label="Open {name}">{g}<span class="tx"><span class="l1">{name}' + (f'<span class="dk-badge">{n}</span>' if n else '') +
            f'<span class="tm">{tm}</span></span><span class="l2">{what}</span>{strip(pid)}</span>{ic("caret-right", "bold", "rc")}</button>')
def wrow(icon, title, hold, age, long=False):
    return (f'<button class="dk-wrow"><span class="ic">{ic(icon)}</span><span class="tx">' + ('<span class="dk-tag bad">Longest wait</span>' if long else '') +
            f'<span class="t">{title}</span><span class="h">{hold}</span></span><span class="ct">{age}</span>{ic("caret-right", "bold", "rc")}</button>')
QUIET_DOT = '<span class="dk-qdot"><i></i></span>'
WG = ('<div class="dk-stage col" style="width:393px;max-width:100%;box-sizing:border-box;gap:10px;flex-wrap:nowrap">'
      '<p class="dk-sum"><b>5 things wait on you</b>, in 2 projects. 3 projects are quiet.</p>'
      '<section class="dk-wgroup">' + prow("wd", gauge(0, "wait", '<span class="pn">1</span>'), "Home-screen widget", 1, "4 Nov", "Discovery: its readiness check failed on 4 November. Your call.")
      + wrow("flag", "The widget failed its readiness check: resubmit or stop?", "Holds up Home-screen widget’s Discovery phase", "9 days", True) + '</section>'
      '<section class="dk-wgroup">' + prow("tl", gauge(14, "wait", '<span class="pn">2</span>'), "The timeline", 4, "15:42", "Design: the spec stopped again after three plan reviews. Your call.")
      + wrow("hand-palm", "S-011 failed three plan reviews: what happens next?", "Holds up M6, M7, M8", "1 h 43 min")
      + wrow("chat-circle-text", "Which phone widths must the timeline fit?", "Holds up M7, M8", "2 h 39 min")
      + wrow("chat-circle-text", "Is the spec’s reading of “each thing reaches my phone” enough for M8?", "Holds up M8", "2 h 39 min")
      + wrow("chat-circle-text", "Let the spec writer see the experiment files and your answers?", "Holds up M6, M7, M8", "2 h 39 min") + '</section>'
      '<section class="dk-quiet"><button class="dk-prow quiet" aria-expanded="true">' + QUIET_DOT + '<span class="tx"><span class="l1">Nothing waits on you in operating model, Model-Lab, portfolio</span></span>' + ic("caret-right", "bold", "rc") + '</button>'
      + prow("om", QUIET_DOT, "operating model", 0, "04:56", "The spec-number fix is released as 3.7.3.") + prow("ml", QUIET_DOT, "Model-Lab", 0, "01:06", "Four pull requests merged overnight.")
      + prow("pf", QUIET_DOT, "portfolio", 0, "12 Nov", "Quiet since 12 November.") + '</section></div>')
comp("WaitGroup", "Desk", 1100, WG,
 """# WaitGroup

Home, grouped by what waits on the owner: one summary sentence, then a group for each project with something waiting, then the quiet projects folded into one row. It replaces the project cards and the separate Needs you list on home, and the desk map tried in mockup v14. Chosen by the owner on 16 November 2026 (decisions/questions/P-005-design-round-4.md: answer 9, "Does the home page really work?"; answer 11, "C is where I’m leaning but I feel like it’s missing something"; answer 12, "C2: what each answer holds up (Recommended), C3: a slim strip of what mattered").

- **The sentence**: 17 `text-1`, the count in semibold: how many things wait, in how many projects, and how many projects are quiet.
- **A group** is one `surface` block, radius 18, 12 inside: the project's row, then its waiting rows. Groups are ordered by their longest wait, oldest first.
- **The project row**: the current phase's Gauge with its number (v13's rule: milestones reached, yellow while anything waits), the name in 16 semibold with the waiting count in the blue badge, when it last moved at the right in 13 `text-2`, its one line in 14 `text-2`, and under it the strip. Tapping it opens the project.
- **The strip**: the last two weeks, 31 October to now, the time stretched toward now (square root), a 3-wide `groove` line; only the events that matter: merges as `main-mark` dots, a stop or gate waiting on the owner in `status-bad-dot`, a question waiting in `status-wait-dot`, others `text-3`; now in `accent-select`. Axis words in 9.5 `text-3`.
- **A waiting row**: the kind's icon, the question in 15 `text-1` on up to two lines, under it what it holds up in 12.5 `text-2` ("Holds up M6, M7, M8", or the phase when it feeds no milestone), its age at the right. The longest wait on the desk, a week or more, wears a red "Longest wait" tag above its question. Each thing waiting is shown once on home.
- **The quiet row**: a grey dot and "Nothing waits on you in …"; tapped, it opens the quiet projects as project rows, each with its strip. Shown here open.
- {SRC}
""".replace("{SRC}", SRC))

def wrap_words(t, ch, mx):
    out, cur = [], ""
    for w in t.split():
        if not cur or len(cur) + 1 + len(w) <= ch: cur = (cur + " " + w).strip(); continue
        out.append(cur); cur = w
    if cur: out.append(cur)
    if len(out) > mx: out = out[:mx]; out[-1] = out[-1][:max(1, ch - 1)] + "&#8230;"
    return [l if len(l) <= ch else l[:ch - 1] + "&#8230;" for l in out]
# the branch map fitted to a selected milestone (round 5, answer 4): M6 only, every event an icon, the events in view spread with words
def milestone_map(view=("15:14", "15:23", "15:36", "15:42"), vw=393):
    PAD, LANE = 22, 50
    sp = [MAP_SP[0], MAP_SP[2]]
    evs = [dict(sp=si, t=_t(d, hm), hm=hm, k=k, st=st, ttl=tt) for si, (_, es) in enumerate(sp) for (d, hm, k, st), tt in zip(es, TITLES[si])]
    evs += [dict(sp=1, t=10**7 + j, hm="", k=k, st="plan", ttl=tt) for j, (k, tt) in enumerate([("commit", "Spec revised, round 4"), ("review", "Review, round 4"), ("decision", "S-011 frozen")])]
    evs.sort(key=lambda e: e["t"])
    ins = [j for j, e in enumerate(evs) if e["sp"] == 1 and e["hm"] in view]; a, b = ins[0], ins[-1]; n = len(evs)
    M = min(vw - 120, (b - a) * 68); start = vw / 2 - M / 2                  # the window in the centre (round 5, answer 7)
    if a == 0: start = PAD + 14
    elif b == n - 1: start = vw - PAD - 14 - M                               # except at either end
    for j in range(a, b + 1): evs[j]["x"] = start + M * (j - a) / max(1, b - a)
    for j in range(a): evs[j]["x"] = PAD + (start - 30 - PAD) * j / max(1, a - 1)
    for j in range(b + 1, n): evs[j]["x"] = start + M + 30 + (vw - PAD - start - M - 30) * (j - b - 1) / max(1, n - b - 2)
    YM = 26 + LANE; y = YM - LANE; H = YM + 54                               # +14: the strip of words under main (round 6, answer 7)
    p = f'<path class="g main" d="M0 {YM} H{vw}"/>'; st_ = ""; lb = ""; fl = ""
    for si, (lab, _) in enumerate(sp):
        es = [e for e in evs if e["sp"] == si]; on = [e for e in es if e["k"] != "merge"]
        x0, x1 = es[0]["x"], on[-1]["x"]
        p += f'<path class="g" d="M{x0 - 16:.1f} {YM} C{x0 - 8:.1f} {YM} {x0 - 8:.1f} {y} {x0:.1f} {y} H{x1:.1f}"/>'
        for j, e in enumerate(es):
            main = e["k"] == "merge"; cy = YM if main else y
            if main:
                px = es[j - 1]["x"] if j else e["x"] - 16
                p += f'<path class="g" d="M{px:.1f} {y} C{(px + e["x"]) / 2:.1f} {y} {(px + e["x"]) / 2:.1f} {YM} {e["x"]:.1f} {YM}"/>'
            cls = " ".join(c for c in ["main" if main else "", e["st"]] if c)
            near = min([abs(q["x"] - e["x"]) for q in evs if q is not e and (q["k"] == "merge") == main] + [99])
            sc = 1 if near >= 20 else .72; r = 10.5 * sc; s_ = 12 * sc
            svg = ic(EVI[e["k"]], cls="ic " + cls).replace('<svg class', f'<svg x="{e["x"] - s_ / 2:.1f}" y="{cy - s_ / 2:.1f}" width="{s_:.1f}" height="{s_:.1f}" class', 1)
            st_ += f'<circle class="disc {cls}" cx="{e["x"]:.1f}" cy="{cy}" r="{r:.1f}"/>{svg}'
            if e["sp"] == 1 and e["hm"] in view:
                w = min([abs(q["x"] - e["x"]) for q in evs if q is not e and q["sp"] == 1 and q["hm"] in view] + [76]); ch = int((w - 6) / 5.6)
                ls = wrap_words(e["ttl"], ch, 3)                                    # round 6, answer 5: the title alone, wrapped
                fl += f'<text class="fl wr" x="{e["x"]:.1f}" y="{cy + 21}">' + "".join(f'<tspan x="{e["x"]:.1f}"{" dy=&quot;10.5&quot;" if i else ""}>{l}</tspan>' for i, l in enumerate(ls)).replace("&quot;", '"') + '</text>'
        lb += f'<text class="lb" x="{x0:.1f}" y="{y - 9}">{lab}</text>'
    lo = 40.0                                                                # every event on main carries its words, spread along main
    for e in sorted([e for e in evs if e["k"] == "merge"], key=lambda e: e["x"]):
        w = len(e["ttl"]) * 5.4 + 8; lx = max(e["x"], lo + w / 2); lo = lx + w / 2
        fl += (f'<path class="ml-lead" d="M{e["x"]:.1f} {YM + 11} C{e["x"]:.1f} {YM + 15} {lx:.1f} {YM + 11} {lx:.1f} {YM + 15}"/>'
               f'<text class="fl ml" x="{lx:.1f}" y="{YM + 24}">{e["ttl"]}</text>')
    vis = [e for e in evs if e["sp"] == 1 and e["hm"] in view]; a, b = vis[0]["x"] - 30, vis[-1]["x"] + 30
    win = f'<rect class="win" x="{a:.1f}" y="{y - 22}" width="{b - a:.1f}" height="{LANE + 44}" rx="10"/>'
    chip = f'<button class="dk-mapchip" aria-label="Show the whole phase on the map">2.7 M6{ic("x", "bold")}</button>'
    return (f'<div class="dk-mapbar"><div class="dk-mapvp" style="position:relative"><svg class="dk-map" width="{vw}" height="{H}" viewBox="0 0 {vw} {H}" role="img" aria-label="Branch map of milestone M6">'
            f'{win}{p}{st_}{lb}{fl}<text class="lb main" x="6" y="{YM + 19}">main</text></svg>{chip}</div></div>')
TITLES = [["First draft", "Failed", "Spec revised", "Failed", "Stop card 4", "PR #443", "Write a new spec", "PR #444"],
          ["New spec S-011", "First draft", "Failed, round 1", "Spec revised", "PR #446", "Failed, round 2", "Spec revised again", "Failed, round 3", "Stop card 5"]]
comp("MilestoneMap", "Desk", 320,
 '<div class="dk-stage col" style="max-width:393px;padding:16px 0">' + milestone_map() + '<p class="dk-note" style="padding:0 16px">M6 selected: its two sprints fill the width, every event an icon, the three planned ones as open rings at the right. The four events in view below spread apart under the window, in the centre, each with its short title wrapped onto up to three lines (round 6); what came before squeezes to the left, the planned events to the right. The chip&#8217;s cross brings back the whole phase.</p></div>',
 """# MilestoneMap

The BranchMap fitted to one milestone. Chosen by the owner on 16 November 2026 (decisions/questions/P-005-design-round-5.md: answer 1, "can we make it so whenever a milestone is selected, the branch map fits to the events in that milestone and expands the dots to our icons with descriptions if we can fit them?"; answer 4, "C: fit, spread what's in view").

- **Selecting**: tapping a milestone's row selects it (and opens it). The page opens with the milestone in progress selected. Folding the selected milestone, or the chip's cross, brings back the whole phase (BranchMap).
- **Fitted**: only the selected milestone's sprints, across the full width with nothing to pan; lanes 50 apart, so words fit under the icons. Every event wears its icon on a disc; planned events sit at the right as open rings (`text-3` ring on `ground`).
- **Spread what is in view**: the events shown in the list below spread 68 apart under the soft window, each with its short title in 9.5 medium `text-1`, wrapped by whole words onto up to three lines 10.5 apart, under the icon; no kind word, since the icon says it (17 November 2026, decisions/questions/P-005-design-round-6.md: answer 2, a comment on v21, "Can we wrap text within the blue box?"; answer 5, "B: only the title, wrapped (Recommended)"). The map keeps its height. As the list scrolls, the spread follows.
- **The window in the centre**: it sits in the middle of the map; what came before is spread evenly over the left side and what comes after over the right, so you always see both. At either end of the milestone it slides to that edge, so no half sits empty (round 5, answer 6: "What are your thoughts on always pulling the highlighted section to the center of the slider so you can see the before and after?"; answer 7, "2: centred, except at ends"). Where it sits no longer says how far along the milestone you are; an icon closer than 20 to its neighbour shrinks to 72%.
- **Words on main** (17 November 2026, decisions/questions/P-005-design-round-6.md: answer 6, "Any situation where something touches main branch should get a label. Anything not on main should only get labels if it is inside the blue box."; answer 7, "option 2 please"): every event on main carries its short title wherever it sits, in one row in a 14-high strip under main, in 9.5 medium `text-1`; each label sits as near its icon as it can without touching the one before (from x 40, clear of the word "main"), joined to it by a thin 1.2 `text-3` line. A sprint's events carry words only inside the window.
- **The chip**: the milestone's number and id in 11.5 semibold on `fill`, bottom right of the map, with a cross.
- Colour as in BranchMap and StatusMark: red failed, yellow waiting on you, Now blue, main dark.
- {SRC}
""".replace("{SRC}", SRC))

# why each event happened (round 5, answer 5): the story between events
def why(t): return f'<div class="dk-why"><span class="ar">{ic("arrow-elbow-down-right", "bold")}</span><p><b>Why:</b> {t}</p></div>'
WHYC = ('<div class="dk-stage col" style="max-width:393px"><div>'
  + mark_ev("stop", "wait", "Waiting on you", "15:42", "Stop card 5", "orchestrator") + why("Three failed reviews trip the stop rule, so the orchestrator stopped and asked you what next.")
  + mark_ev("review", "bad", "Failed", "15:36", "Plan review failed, round 3", "reviewer (plan)") + why("Review again. The experiments still hadn&#8217;t moved, because the spec writer was never given them.")
  + mark_ev("commit", "ok", "Done", "15:23", "Spec revised again", "spec writer") + why("The spec writer worked through six actions to answer round 2; one stayed blocked.")
  + mark_ev("step", "bad", "1 blocked", "", "The spec writer&#8217;s plan · 5 of 6 done", "spec writer", label="2.7.2.5")
  + '</div><p class="dk-note">Read down, it is the story of the spec: each sentence says how the event below led to the one above. The agent&#8217;s plan stays as the detail of how. Reasons are examples until the records carry them.</p></div>')
comp("WhyLine", "Desk", 560, WHYC,
 """# WhyLine

Replaced by EventBubble on 17 November 2026 (round 5, answers 10 and 11); kept for the record.

Why an event happened, in one plain sentence under it, so the plan reads as a story while you scroll. Chosen by the owner on 16 November 2026 (decisions/questions/P-005-design-round-4.md, answer 17: "the one thing I always struggle understanding is how actions task events feed into one another. So when I’m perusing the plan I will want to see the context behind how or why things are happening the way they are?"; decisions/questions/P-005-design-round-5.md, answer 5, "C: the story between events").

- **Under each event that happened**, after its "by" line: an elbow arrow turned upward in `text-2`, then the sentence on a 1.5 dotted `text-3` line that runs down toward the event before it.
- **The sentence**: "Why:" in 13 semibold `text-1`, then one plain sentence in 13 `text-2`, naming what led to this event and, where it matters, why it went the way it did. No ids unless the owner knows them by name.
- **With the plan**: the ActionPlan stays where it is, between the two events, as the detail of how; the WhyLine above it says why in one line.
- **Planned events** carry a NeedsList instead: what must happen first. Together the two say what led here and what comes next.
- Reasons are not yet on record; until an agent writes its own "why" with each event, a mockup's sentences are examples, marked so.
- {SRC}
""".replace("{SRC}", SRC))

# the event's tags and bubble (round 5, answers 10 to 14): Needs and Why on the event, a checklist bubble, the tree, the chain
def ev_tags(kind, st, tag, t, title, who, tags, ring=False, chain=False):
    cls = " ring" if ring else ""; cls += " chain" if chain else ""
    return (f'<div class="dk-ev"><span class="dk-ev-ico{cls}">{ic(EVI[kind])}' + (f'<span class="dk-mark {st}">{MK[st]}</span>' if st in MK else '') + '</span>'
            f'<div class="tx"><div class="l1"><b>{kind.title()}</b><span class="dk-tag {st if st in ("wait", "bad") else ""}">{tag}</span>{tags}<span class="tm">{t}</span></div>'
            f'<div class="l2">{title}</div><div class="l3">by {who}</div>')
def bub_item(st, words, state, deep=False):
    mk = {"ok": ic("check", "bold"), "wait": ic("hourglass-medium", "fill"), "bad": ic("warning", "fill")}.get(st, '<span style="width:10px;height:10px;border-radius:5px;box-shadow:inset 0 0 0 1.5px var(--text-3)"></span>')
    return f'<div class="it {st}"><span class="mk">{mk}</span><span class="w">{words}</span><span class="s">{state}</span>' + (ic("caret-right", "bold", "i chev") if deep else '') + '</div>'
LINK = ic("link", "bold")
EVB = ('<div class="dk-stage col" style="max-width:393px"><div>'
  + ev_tags("commit", "", "Planned", "", "Spec revised, round 4", "spec writer · planned · an example", f'<span class="dk-tg bad on">{LINK}Needs 3</span>', ring=True, chain=True)
  + '<div class="dk-bub"><div class="hd">Before this can happen <span>0 of 3 done</span></div>'
  + bub_item("wait", "Your answer to stop card 5", "on you", True) + bub_item("wait", "Your answers to PR #446&#8217;s three questions", "on you", True)
  + bub_item("bad", "The experiments moved to S-011", "blocked") + '<div class="then">Then: <b>Plan review, round 4</b></div></div></div></div>'
  + ev_tags("stop", "wait", "Waiting on you", "15:42", "Stop card 5", "orchestrator", '<span class="dk-tg">Why</span>', chain=True) + '</div></div>'
  + ev_tags("review", "bad", "Failed", "15:36", "Plan review failed, round 3", "reviewer (plan)", '<span class="dk-tg on">Why</span>')
  + '<div class="dk-bub"><b>Why:</b> Review again. The experiments still hadn&#8217;t moved, because the spec writer was never given them.</div></div></div>'
  + '<p class="dk-note">The Needs bubble open on a planned event: a checklist, the chevrons open the next layer in the bubble. Its chain (here Stop card 5) is ringed in blue in the list, and on the map. Below, a Why bubble open. Requirements and reasons are examples.</p></div>')
comp("EventBubble", "Desk", 620, EVB,
 """# EventBubble

What an event needs and why it happened, carried on the event itself as two small tags that open a bubble, inside a list drawn as a tree. Chosen by the owner on 16 and 17 November 2026 (decisions/questions/P-005-design-round-5.md: answer 10, "I like the tree, but I don’t like the format of the whys being embedded into everything like a step"; answer 11, "I like what you did with the whhy but originally i was asking about the needs first and such. I dont want clicking on this type of card to move the flow back"; answer 12, "I love the bubble as a way to link to the next layer - but i dont like the current format that is showing once you click it"; answer 13, "I love 1 - the only thing im wanting is to show the visual connection as the chain is selected on the branch list"; answer 14, "C: both"). It replaces NeedsList and WhyLine.

- **The tree**: one 1.5 `text-3` line runs down from an event's icon with a short elbow into each row under it; rows a level down are a size smaller and the event's title semibold. An icon with a ring (`text-3`, 1.5) has something under it: tapping it folds or opens that; folded, one quiet line says what is there.
- **Needs tag**: on the event's first line after its state, "Needs" and how many are still to happen, with a link icon. Tinted by the worst of them: `status-bad-tag` on `status-bad-tag-bg` if one is blocked, `status-wait-tag` if one waits on you, otherwise an outlined grey tag. Only on events with something unmet.
- **Why tag**: an outlined grey "Why" in 12 on events with a reason. Tapping it opens the sentence in the bubble, "Why:" in semibold.
- **The bubble**: `surface`, radius 12, a hairline and a soft shadow, a small pointer toward its tag; it opens under the event's title, one at a time; tapping elsewhere closes it. Nothing in it moves the page.
- **The checklist inside**: "Before this can happen" in 14 semibold with "0 of 3 done" at the right (for an event whose needs are all done, "What came first"), then a line each: the ActionPlan's mark (check done, yellow hourglass on you, red warning blocked, open ring not started), the need in plain words, and who or what it waits on in 12 at the right ("on you", "blocked", "done"), tinted to match. "Then:" and what it lets happen close it.
- **The next layer**: a need with needs of its own has a chevron; tapping it opens that layer inside the same bubble, with a trail at the top (the earlier layers in `accent-text`, tappable) to step back.
- **The chain**: while the bubble is open, the event, the layers opened and what the current layer needs are ringed in `accent-select` on the MilestoneMap, joined by dotted arcs over the lanes, and in the list, joined by a dotted line in the left margin; everything else fades. Closing the bubble clears it.
- Requirements and reasons are not yet on record; until agents write them, a mockup's are examples, marked so.
- {SRC}
""".replace("{SRC}", SRC))

# a project's floating header (round 4, answers 13 to 16): one slim bar, the slim pills, the branch map and the phase row, floating together
PH_PILLS = [("The timeline", 4, True), ("Home-screen widget", 1, False), ("operating model", 0, False), ("Model-Lab", 0, False), ("portfolio", 0, False)]
PHEAD = ('<div class="dk-stage col" style="width:393px;max-width:100%;box-sizing:border-box;padding:0;flex-wrap:nowrap"><div class="dk-phead">'
  f'<div class="bar"><button class="dk-circ glass sm" aria-label="All projects">{ic("caret-left", "bold")}</button>'
  '<div class="tx"><h1>The timeline</h1><div class="asof"><i></i>Live · as of <b>17:25 UTC</b></div></div>' + capsule(5) + '</div>'
  '<div class="dk-chips named slim" role="group" aria-label="Projects">' + "".join(
    f'<button class="dk-chip" aria-pressed="{str(on).lower()}"><span class="label">{l}</span>' + (f'<span class="dk-count">{c}</span>' if c else '') + '</button>' for l, c, on in PH_PILLS) + '</div>'
  + branch_map() + '<div class="dk-phases" role="group" aria-label="Phases" style="padding:8px 16px 4px;width:auto">' +
  "".join(f'<button class="dk-phase"{" aria-current=&quot;true&quot;" if cur else ""}>{gauge(p_, st, f"<span class=pn>{n}</span>")}<span>{nm}</span></button>' for n, nm, p_, st, cur in PH_ROW).replace("&quot;", '"') +
  '</div></div><p class="dk-note" style="padding:12px 16px">All of this floats at the top of a project&#8217;s page as you scroll: about 275 points on a 393 by 852 phone.</p>'
  '<div class="dk-phead"><div class="bar" style="padding-left:20px">'
  '<div class="tx"><h1>Timeline</h1><div class="asof"><i></i>Live · as of <b>17:25 UTC</b></div></div>' + capsule(5) + '</div></div>'
  '<p class="dk-note" style="padding:12px 16px">Home (round 6): the same bar without Back, floating alone at about 57 points; the search and the rest of home scroll under it.</p></div>')
comp("ProjectHeader", "Desk", 520, PHEAD,
 """# ProjectHeader

A project's page has one floating header: a slim bar with the title and status, the project pills right under it, then the BranchMap and the PhaseRow, all in one glass band that stays at the top as the page scrolls. Chosen by the owner on 16 November 2026 (decisions/questions/P-005-design-round-4.md: answer 13, "The project pills need to be part of the floating header as well."; answer 14, "Option B but you need to get rid of that gap of space between the title and pills. Honestly we can maybe shrink the title and update status and just convert it into a sleek header that stays with the pills and branch chart"; answer 16, option 1, "I like this option.").

- **The bar**, about 50 high: a 38 round Back on the left (glass); the project's name in 17 bold `text-1` with the status under it in 12 `text-2` ("Live · as of 17:25 UTC", the live dot in its colour; "read 1 min ago" drops here); the bell and More capsule at the right, a little smaller than on home (86%).
- **The pills**, right under the bar with no gap: the named FilterChips, slimmer (32 high, 14 type), in one row that scrolls sideways; the project you are in is picked out, with its waiting count.
- **Then the BranchMap and the PhaseRow**, as before.
- The whole band is `surface-floating`, blurred, with a `separator` hairline below; it is sticky at the top of the page from the first scroll. The large title no longer appears on a project's page.
- **Home takes the bar too** (17 November 2026, decisions/questions/P-005-design-round-6.md: answer 1, a comment on v21's home, "Floating Header here too"; answer 4, "A: the slim bar only (Recommended)"): the same slim bar without Back, "Timeline" in 17 with the status under it in 12, the bell and More; it floats alone in the glass band, about 57 high. The search, the summary sentence and the groups scroll under it. LargeTitle no longer appears on the desk.
- {SRC}
""".replace("{SRC}", SRC))

# what an event still needs (round 5, answers 1 to 3): C1's rows with C2's checklist, and the crossover with the plan
NMK = {"ok": ("ok", ic("check", "bold")), "wait": ("wait", ic("hourglass-medium", "fill")), "bad": ("blocked", ic("warning", "fill")), "pend": ("next", "")}
def need_row(st, kind, word, tag_st, tag, title, unlock=False):
    mk = f'<span class="mk un">{ic("arrow-elbow-down-right", "bold")}</span>' if unlock else f'<span class="mk {NMK[st][0]}">{NMK[st][1]}</span>'
    return (f'<li>{mk}<span class="dk-ev-ico">{ic(EVI[kind])}</span><span class="tx"><span class="l1"><b>{word}</b>'
            f'<span class="dk-tag {tag_st}">{tag}</span></span><span class="l2">{title}</span></span></li>')
def needs_list(rows, unl, done):
    return ('<div class="dk-needs"><div class="nh">Needs first<span>' + f'{done} of {len(rows)} done</span></div><ol>' + "".join(need_row(*r) for r in rows) + '</ol>'
            + ('<div class="nh">Then unlocks</div><ol>' + "".join(need_row("", *r, unlock=True) for r in unl) + '</ol>' if unl else '') + '</div>')
def plan_ev(kind, title, who):
    return (f'<div class="dk-ev"><span class="dk-ev-ico" style="background:var(--ground);box-shadow:inset 0 0 0 1.5px var(--text-3)">{ic(EVI[kind])}</span>'
            f'<div class="tx"><div class="l1"><b>{kind.title()}</b><span class="dk-tag">Planned</span></div><div class="l2">{title}</div><div class="l3">by {who} · planned · an example</div></div></div>')
NEEDS = ('<div class="dk-stage col" style="max-width:393px"><div>'
  + plan_ev("commit", "Spec revised, round 4", "spec writer")
  + needs_list([("wait", "stop", "Stop", "wait", "Waiting on you", "Stop card 5"),
                ("wait", "merge", "Merge", "wait", "Awaiting your answers", "Merged PR #446: three questions for you"),
                ("bad", "step", "Action 2.7.2.5.5", "bad", "Blocked", "Move the experiments to the new spec")],
               [("review", "Review", "", "Planned", "Plan review, round 4")], 0)
  + mark_ev("stop", "wait", "Waiting on you", "15:42", "Stop card 5", "orchestrator")
  + '</div><div class="dk-step"><div class="hd">2.7.2.5 · The spec writer · the plan, crossing over</div><ol class="dk-plan"><li class="blocked"><span class="mk blocked">' + ic("warning", "fill") + '</span>'
  '<div class="ti"><span class="num">5.5</span>Move the experiments to the new spec</div><div class="why">They prove the milestone, but still point at the old spec.</div>'
  '<span class="by">' + ic("arrow-elbow-down-right", "bold") + '<span>Needed by <b>Spec revised, round 4</b></span></span></li></ol></div>'
  '<p class="dk-note">A planned event with three things still to happen first: two wait on you, one is an action of the plan that is blocked. Done events show nothing extra. Requirements are examples until the records carry them.</p></div>')
comp("NeedsList", "Desk", 690, NEEDS,
 """# NeedsList

Replaced by EventBubble on 17 November 2026 (round 5, answers 10 to 14); kept for the record.

What an event still needs before it can happen, and what it then unlocks, hung from the event as a short checklist. Chosen by the owner on 16 November 2026 (decisions/questions/P-005-design-round-5.md: answer 1, "option C is close, we just need to show it in a slightly different more consistent and easily graspable manner"; answer 2, "I think we mix c1 and c2. I like the look of c1, I like the checklist feel of c2"; answer 3, "Yes, take the mix").

- **Only where something is unmet.** An event whose requirements are all done shows nothing extra; why done things happened is a separate question.
- **Hung from the event**: indented to the event's icon, a 1.5 `text-3` line down the left.
- **"Needs first"** in 12 semibold caps `text-2`, with "0 of 3 done" at the right in plain 12.
- **Each requirement is a row**, as the event it points to looks, smaller: the ActionPlan's check column on the left (a check done, a yellow hourglass waiting on you, a red warning blocked, an open ring planned), the kind's icon on a 22 `fill` disc with no corner mark (the check column carries the state), the kind in 14 semibold with the same StatusMark tag that event wears, then its title in 14 `text-2`. Rows are split by the `separator-surface` hairline. Tapping one goes to that event, opening what holds it, and lights it for a moment.
- **"Then unlocks"**: the events that need this one, the same rows with an elbow arrow in place of the check.
- **The crossover with the plan**: a requirement that is an action of an agent's plan reads as that action ("Action 2.7.2.5.5", the list-checks icon), and that action in the ActionPlan carries "Needed by" and the event, in a small `fill` chip that goes to it.
- The records do not yet say which event needs which; until they do, a mockup's requirements are examples, marked so.
- {SRC}
""".replace("{SRC}", SRC))

HOME = f'''<div class="dk-stage phone">
  <div class="dk-status">9:41</div>
  <div class="dk-topbar"><span></span>{capsule(2)}</div>
  <div style="padding:32px 16px 0"><h1 class="dk-title">Timeline</h1></div>
  <div style="padding:19px 16px 0"><label class="dk-search">{ic("magnifying-glass", "bold")}<input placeholder="Search the desk" aria-label="Search"></label></div>
  <div style="display:flex;gap:8px;padding:16px 0 0 16px;overflow:hidden">''' + "".join(f'<div class="dk-doc"><div class="t">{t}</div><div class="pg">' + '<span></span>' * 9 + '</div></div>' for t in ("Handoff 11", "S-011 spec", "Craft audit")) + f'''</div>
  <div style="padding:12px 16px 0"><div class="dk-list">{row("tray", "Stop card 5 for S-011")}{row("flag", "Answer the colour question")}</div></div>
  <div style="padding:12px 16px 0"><h2 class="dk-head"><span>Projects</span>{ic("caret-right", "bold", "chev")}<span class="grow"></span>{ic("dots-three", "bold", "more")}</h2></div>
  <div style="padding:0 16px"><div class="dk-list">{row("squares-four", "Service-Desk", 2)}{row("squares-four", "Model-Lab")}</div></div>
  <div class="dk-dock">{tabbar()}<button class="dk-round glass" aria-label="Now">{ic("record", "bold")}</button></div>
</div>'''
comp("DeskHome", "Compositions", 852, HOME,
 """# DeskHome

The Desk's home screen assembled from the elements on a 393 by 852 phone, laid out like Craft's Home (ref 11), to judge positions. A composition, not a new element.

- Status bar 54; the capsule 6 below it; the large title at y 136; search at y 188; recent documents as a carousel; Needs you rows; Projects as a section with rows; the tab bar and the round Now button floating at the foot.
- To move something, comment on this card with what should go where.
""", width=393)

# round 7 (decisions/questions/P-005-design-round-7.md)
comp("SessionLink", "Desk", 390, '<div class="dk-stage col" style="max-width:393px">\n  <div style="display:flex;gap:8px;align-items:center"><span class="dk-sl claude"><i class="d"></i>Claude</span><span class="dk-sl">Run</span><span class="dk-sl">PR</span></div>\n  <p class="dk-note">Claude when a conversation stands behind the event; otherwise the run, then the pull request.</p>\n  <div><div style="display:flex;align-items:baseline;gap:6px;font:600 15px/19px var(--font-sans);color:var(--text-1)">Review <span class="dk-tag bad">Failed</span><span class="dk-sl claude on"><i class="d"></i>Claude</span><span style="margin-left:auto;font:400 13px var(--font-sans);color:var(--text-2)">15:14</span></div>\n  <div style="font:400 15px/19px var(--font-sans);color:var(--text-1)">Plan review failed, round 2</div>\n  <div class="dk-slbub"><button class="dk-x" aria-label="Close"><svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"/></svg></button><div class="acts first"><a class="open" href="#">Open in Claude<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M5 3h8v8M13 3 3 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a><a class="alt" href="#">The run on GitHub<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M5 3h8v8M13 3 3 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div><div class="k"><span class="dk-sl claude" style="box-shadow:none;padding:0"><i class="d"></i></span>A Claude session · Chief of Staff</div><div class="w">This step ran on its own on GitHub. The Claude session at work on this project then:</div><div>P-005: check #444 and the loop on stop card 4; follow S-011 through its plan reviews; file the rulings its round-2 review raises</div><div class="w">Started 14 Nov 13:52 · 15 Nov 19:55 · matched by time</div></div></div>\n</div>', '# SessionLink\n\nWhere an event happened, one tap away. Chosen by the owner on 24 November 2026 (decisions/questions/P-005-design-round-7.md: answer 2, "structure the desk with links back to the Claude sessions where the things happened"; answer 4, "provide links back to the Claude conversation when available, then when not to the GitHub agent run result or whatever is available there"; answer 5).\n\n- **One tag per event**, on its first line beside Why: **Claude** (with a blue dot) whenever a conversation stands behind the event, otherwise **Run**, otherwise **PR**.\n- **Claude first.** The session that did it; for a pipeline step, which runs on its own on GitHub, the Chief of Staff session at work on the project when it ran (matched by time from the session lines); for the owner\'s merge, the session that prepared it.\n- **The bubble** says what that session set out to do, when it started and ended, and what else on the page it touched; its button opens the conversation, and the run or pull request is a quieter link beside it.\n- The links are real: sessions from the commits\' `Agent-Session:` trailers and `sessions/chief-of-staff/`; runs and pull requests from GitHub. A pipeline run is a log, not a conversation.\n- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft\'s own are Apple\'s SF Symbols, which a web page cannot use.\n')

# round 7 (decisions/questions/P-005-design-round-7.md)
comp('ContextView', "Desk", 560, '<div class="dk-stage col" style="max-width:393px">\n<ol class="dk-cx">\n<li class="l1"><span class="no">1</span><span class="t"><b>Discovery</b></span></li>\n<li class="l1 gate"><span class="pip"></span><span class="t">Design gate · you said proceed</span><span class="dk-sl">PR</span></li>\n<li class="l1 cur"><span class="no">2</span><span class="t"><b>Design</b> <span style="color:var(--accent-text);font-size:13px;font-weight:600">now</span></span></li>\n<li class="l2"><span class="no">2.1</span><span class="t">Done defined in real scenarios</span></li>\n<li class="l2"><span class="no">2.2</span><span class="t">M6 The records can carry the timeline</span><span class="dk-sl claude"><i class="d"></i>Claude</span></li>\n<li class="l3"><span class="no">2.2.2</span><span class="t">Spec S-011</span><span class="dk-sl claude"><i class="d"></i>Claude</span></li>\n<li class="l4"><span class="pip ok"></span><span class="t">Spec revised again</span><span class="dk-sl claude"><i class="d"></i>Claude</span></li>\n<li class="l4"><span class="pip bad"></span><span class="t">Plan review failed, round 3</span><span class="dk-sl claude"><i class="d"></i>Claude</span></li>\n<li class="l4"><span class="pip now"></span><span class="t">Stop card 5</span><span class="dk-sl claude"><i class="d"></i>Claude</span></li>\n<li class="l2 nowrow"><span class="pip now"></span><span class="t">Now · Stop card 5: what happens next?</span><span class="dk-sl claude"><i class="d"></i>Claude</span></li>\n<li class="l2"><span class="no">2.4</span><span class="t">A plan that passed review</span></li>\n<li class="l1 gate"><span class="pip"></span><span class="t">Build gate · yours</span></li>\n<li class="l1"><span class="no">3</span><span class="t"><b>Build</b></span></li>\n</ol>\n<div style="display:flex;align-items:center;gap:10px"><span class="dk-round cx" aria-label="Now, Context view on"><svg class="i" aria-hidden="true" focusable="false" viewBox="0 0 256 256" fill="currentColor"><path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm0-148a64,64,0,1,0,64,64A64.07,64.07,0,0,0,128,64Zm0,104a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"/></svg></span><p class="dk-note" style="width:auto">Hold the round button to turn it on or off. A tap still jumps to Now.</p></div>\n</div>', '# ContextView\n\nThe project at a glance, held from the round button. Chosen by the owner on 24 November 2026 (decisions/questions/P-005-design-round-7.md: answer 4, "a page toggle ... that filters the view to a scaled down timeline with simple motion that shows our same current phase/milestone/ task etc but simple the number and title plus the link ... Call this context view"; answer 5, "A: current phase open (Recommended)").\n\n- **Turned on and off by holding the RoundButton** (about half a second); a tap still jumps to Now. The button turns blue while it is on, and a small label says which view you are in. On a keyboard, Shift with Enter or Space.\n- **What it shows:** the same order and numbers as the full list (ReadingOrder). Every phase and gate is one line; the current phase opens to its milestones, sprints and events. Each row is a number (events have none, a status dot instead), a title, and its SessionLink. A milestone or sprint links to the Claude session most of its events link to; a gate links to the owner\'s ruling.\n- **What steps aside:** the branch map and the phase row; the slim bar, the project pills and the tab bar stay.\n- **Motion:** the list settles in from slightly larger, each row a beat after the one above, then lands on Now. The reduced-motion setting turns it off.\n- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft\'s own are Apple\'s SF Symbols, which a web page cannot use.\n')

# round 7, answers 8 to 15 (decisions/questions/P-005-design-round-7.md)
comp("LevelRails", "Desk", 600, '<div class="dk-stage col" style="max-width:393px"><div class="dk-rl"><div class="ph"><div class="t"><span class="w">Phase</span><b>Design</b><span class="now">now</span><span class="pc">14%</span></div><div class="s">1 of 7 milestones reached · 4 things wait on you</div><div class="strip"><i class="ok" data-no="2.1"></i><i class="bad cur" data-no="2.2"></i><i class="ok" data-no="2.3"></i><span class="nw"></span><i data-no="2.4"></i><i data-no="2.5"></i></div></div><div class="row ms"><span class="ring ok"><svg viewBox="0 0 34 34" aria-hidden="true"><circle class="trk" cx="17" cy="17" r="14"/><circle class="arc" cx="17" cy="17" r="14" stroke-dasharray="88.0 88.0" transform="rotate(-90 17 17)"/></svg><b>100</b></span><div class="tx"><div class="l1"><span class="w">Milestone</span><span class="no">2.1</span>Done defined in real scenarios</div><div class="s">Reached · 100%</div></div></div><div class="row ms"><span class="ring bad"><svg viewBox="0 0 34 34" aria-hidden="true"><circle class="trk" cx="17" cy="17" r="14"/><circle class="arc" cx="17" cy="17" r="14" stroke-dasharray="26.4 88.0" transform="rotate(-90 17 17)"/></svg><b>30</b></span><div class="tx"><div class="l1"><span class="w">Milestone</span><span class="no">2.2</span><b>M6</b> The records can carry…</div><div class="s">Stopped: three plan reviews failed · 30%</div></div></div><div class="msb"><div class="row sp"><span class="acc ok"></span><div class="tx"><div class="l1"><span class="w">Sprint</span><span class="no">2.2.1</span><b>Spec S-010</b><span class="seg ok" role="img" aria-label="100 percent complete"><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i></span></div><div class="s">8 events · Merged · superseded by S-011</div></div></div><div class="row sp"><span class="acc bad"></span><div class="tx"><div class="l1"><span class="w">Sprint</span><span class="no">2.2.2</span><b>Spec S-011</b><span class="seg bad" role="img" aria-label="60 percent complete"><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i></i><i></i><i></i><i></i></span></div><div class="s">12 events · Stopped · your call</div></div></div><div class="spb"><div class="ev"><span class="ic"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.2 8S3.8 3.5 8 3.5 14.8 8 14.8 8 12.2 12.5 8 12.5 1.2 8 1.2 8z"/><circle cx="8" cy="8" r="2"/></svg></span><div class="tx"><div class="n4">2.2.2.3</div><div class="k">Review<span class="dk-tag bad">Failed</span><span class="tm">12:29</span></div><div class="t">Plan review failed, round 1</div><div class="s">by reviewer (plan)</div></div></div><div class="ev tp"><span class="ic"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.2 8S3.8 3.5 8 3.5 14.8 8 14.8 8 12.2 12.5 8 12.5 1.2 8 1.2 8z"/><circle cx="8" cy="8" r="2"/></svg></span><div class="tx"><div class="n4">2.2.2.13</div><div class="k">Stop<span class="dk-tag wait">Waiting on you</span><span class="tm">15:42</span></div><div class="t">Stop card 5</div><div class="s">by orchestrator · waits on you</div></div></div></div></div></div><p class="dk-note">Each level steps in on its own rail, says what it is, and has its own size. Numbers run from phase to action.</p></div>', '# LevelRails\n\nHow a project\'s list tells its levels apart: rails, a label for each level, one size per level, and quiet marks. Chosen by the owner on 24 November 2026 (decisions/questions/P-005-design-round-7.md: answer 8, "a better visual delineation on the different hierarchy elements"; answer 9, "the rails, with a label of some sort and a more subtle & modern icon set with proper indentation and text sizing"; answers 10 to 15, the revisions).\n\n- **Top down** (ReadingOrder), every level numbered from phase to action: 2, 2.2, 2.2.2, 2.2.2.3, 2.2.2.7.1.\n- **The phase heading** starts at the left with no ring: PHASE, its name in 22 bold, Now and its percent; a soft grey rule under it. Under the heading, one box per milestone in the list\'s order, in its status colour (outlined if planned), a blue tick where Now sits, and the current milestone (the one the map is fitted to) raised and ringed with its number. Tapping a box goes to its milestone.\n- **A milestone**: MILESTONE, its number and name in 17 semibold; a thin 30 ring with its percent inside, no % sign. Its sprints hang from a 2-point rail through the ring.\n- **A sprint**: a thin accent bar in its status colour, SPRINT, its number and name in 15 semibold, and ten small squares to the right of the title, as many filled as tenths done, in the same colour (the owner\'s picture, docs/design/references/2026-11-24-segmented-progress.jpg, its lower style); the event count moves to the line under. Its rows hang from a neutral 1-point rail.\n- **A row under a sprint** (an event, or an agent\'s plan): its fourth number on a line of its own at the top, then the kind and tags, the title in 15 (turning points semibold), the details in 12. Icons are thin line icons with no disc, in the quieter ink; main\'s in full ink.\n- **Nothing moves**: folding or opening a row keeps the tapped row where it was on the screen.\n- Colour: only the soft status colours and the one blue.\n- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft\'s own are Apple\'s SF Symbols, which a web page cannot use.\n')

# round 7, answers 8, 16 and 17 (decisions/questions/P-005-design-round-7.md)
comp("FixedCentre", "Desk", 360, '<div class="dk-stage col" style="max-width:393px"><div class="dk-fc"><div class="map"><div class="main"></div><span class="d" style="left:20%"></span><span class="d" style="left:38%"></span><span class="d on" style="left:56%"></span><span class="arw" style="left:56%"></span><span class="d" style="left:74%"></span></div><div style="position:relative;padding-left:16px"><div class="row"><div class="n4">2.2.2.2</div><div class="k">Commit</div><div class="t">First draft</div></div><span class="ptr" style="left:0;top:66px"></span><div class="row on"><div class="n4">2.2.2.3</div><div class="k">Review · Failed</div><div class="t">Plan review failed, round 1</div></div><div class="row"><div class="n4">2.2.2.4</div><div class="k">Commit</div><div class="t">Spec revised</div></div></div></div><p class="dk-note">The pointer stays put; the list moves under it. The row it meets is washed, and the map points at the same event.</p></div>', '# FixedCentre\n\nA fixed point the list scrolls past, and its match on the branch map. Chosen by the owner on 24 and 25 November 2026 (decisions/questions/P-005-design-round-7.md: answer 8, "an arrow fixed in the middle of the screen that is always identifying the phase or milestone or task or action that is in line with it. And along with it an arrow pops up on the horizontal scrolling branch timeline to match"; answer 17, "Option A for sure").\n\n- **The centre** is the middle of the list\'s window, between the floating band and the tab bar. A small pointer in the one blue sits fixed in the left margin there.\n- **The marked row** is the smallest row the centre line crosses: a phase heading, a milestone, a sprint, an event, a plan or one of its actions. It takes a light blue wash; nothing else changes.\n- **On the map**, a small blue arrow points down at the matching event: the event itself, a sprint\'s or milestone\'s first event, or the event a plan follows. It moves with the scroll and hides when the event is off the map\'s edge.\n- Hidden while the ContextView is on, and on home.\n- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft\'s own are Apple\'s SF Symbols, which a web page cannot use.\n')

# round 7, answers 18 and 19 (decisions/questions/P-005-design-round-7.md)
comp("MilestoneSelect", "Desk", 200, '<div class="dk-stage col" style="max-width:393px"><div class="dk-msel"><span class="sel" style="left:44%;right:6%"></span><span class="lb" style="left:12px;top:16px">2.2.2 S-011</span><span class="ln" style="left:12px;right:30%;top:32px"></span><span class="d" style="left:8%;top:33px"></span><span class="d" style="left:18%;top:33px"></span><span class="d" style="left:28%;top:33px"></span><span class="d" style="left:38%;top:33px"></span><span class="d" style="left:48%;top:33px"></span><span class="d" style="left:58%;top:33px"></span><span class="lb" style="left:12px;top:50px">2.2.1 S-010</span><span class="ln" style="left:12px;right:70%;top:66px"></span><span class="d" style="left:6%;top:67px"></span><span class="d" style="left:14%;top:67px"></span><span class="d" style="left:22%;top:67px"></span><span class="lb" style="left:50%;top:50px">2.3.1 PR #445 · 2.3.2 Mockups</span><span class="ln" style="left:50%;right:10%;top:66px"></span><span class="d" style="left:54%;top:67px"></span><span class="d" style="left:64%;top:67px"></span><span class="d" style="left:74%;top:67px"></span><span class="d" style="left:84%;top:67px"></span><span class="ln main"></span><span class="chip">2.3 The design fits together ×</span></div><p class="dk-note">The whole phase stays on the map; the selected milestone is outlined, and its chip clears it.</p></div>', '# MilestoneSelect\n\nSelecting a milestone without losing the phase. Chosen by the owner on 25 November 2026 (decisions/questions/P-005-design-round-7.md: answer 18, "I don\'t like how the timeline perspective gets thrown off when you select a milestone"; answer 19, "A is good, but yeah we need the whole phase map").\n\n- **The map never zooms.** It always shows the whole current phase, drawn as MilestoneMap draws a milestone: each sprint on its own lane (a little closer, 40 apart), every event as its icon, the words in the window and on main, the window in the centre.\n- **The selected milestone** (tapped in the list; the one in progress when the page opens) has its stretch of the map outlined with a dashed blue line over a faint tint, and a chip names it; the chip\'s cross clears it.\n- The FixedCentre arrow and the window follow the scroll as before.\n- Replaces MilestoneMap\'s zoom; MilestoneMap\'s drawing stays.\n- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft\'s own are Apple\'s SF Symbols, which a web page cannot use.\n')

# round 7, answers 20 to 23 (decisions/questions/P-005-design-round-7.md)
comp("TopPills", "Desk", 400, '<div class="dk-stage col" style="max-width:393px"><div class="dk-tp"><span class="bk" aria-label="All projects">‹</span><span class="pill">The timeline<span class="n">4</span><span class="cv">▾</span></span><span class="pill"><span class="rg">2</span>Design<span class="cv">▾</span></span><span class="sp"></span><span class="ic" aria-label="Needs you">•</span><span class="ic" aria-label="More">⋯</span></div><div class="dk-tpm" style="margin-left:150px"><div class="cap">Phases</div><div class="mi">Discovery<span class="s">38%</span></div><div class="mi gt">◆ Design gate · you said proceed</div><div class="mi on">Design<span class="s">now · 14%</span><span class="ck">✓</span></div><div class="mi gt">◇ Build gate · yours</div><div class="mi">Build<span class="s">0%</span></div><div class="mi">Launch<span class="s">0%</span></div></div><p class="dk-note">Back, the project, the phase in view, the bell and More, in one row. Each pill opens its list.</p></div>', '# TopPills\n\nA project page\'s top: one row, and every phase kept in the list below it. Chosen by the owner on 25 November 2026 (decisions/questions/P-005-design-round-7.md: answer 20, "I want every phase, milestone combination shown on the table, I just want the ones we aren\'t looking at collapsed"; answer 21, "redesign the phase tiles to add more space for the text timeline ... get rid of the header on this page"; answer 22, "Convert the project Pills and the phase pills into two separate pills, that act as dropdown filters. And place both of them in the top. Then do a final pass on space optimization and readability."; answer 23, "Yes, build it into v31").\n\n- **One row at the top**, floating with the map: Back, the **project pill** (the project\'s name and how many things wait on you), the **phase pill** (the phase in view, its small progress ring and name), then the bell (Needs you) and More. The slim title bar (ProjectHeader on a project\'s page), the row of project pills and the four phase tiles (PhaseRow) are gone; the live line is no longer shown.\n- **The project pill** opens the list of projects with what waits in each; choosing one switches to it.\n- **The phase pill** opens the phases, top down, with the gates between them and each phase\'s percent; choosing one goes to it in the list. As the list scrolls, the pill follows the phase at the FixedCentre, and so does the map (MilestoneSelect).\n- **Every phase stays in the list**, top down, with the gates between them: each phase with all its milestones as rows, folded unless opened. Nothing is swapped out.\n- **The map** gives each sprint a lane of its own, 40 apart; a sprint\'s name steps aside where it would sit on an event\'s words.\n- **Legibility**: the list\'s titles 15.5 and detail lines 12.5, the map\'s words 10.5; an event\'s first line wraps rather than cut its status. The floating top is about 339 high on a 393 by 852 screen.\n- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft\'s own are Apple\'s SF Symbols, which a web page cannot use.\n')


# round 8 (decisions/questions/P-005-design-round-8.md; docs/design/audit-2026-11-25-v32-polish.md, section 3)
MOTION_JS = """
var R = matchMedia('(prefers-reduced-motion: reduce)').matches, S = getComputedStyle(document.documentElement).getPropertyValue('--spring').trim() || 'cubic-bezier(.2,.8,.2,1)';
document.getElementById('mo-slide').onclick = function () { document.querySelectorAll('.dk-mo .lane i').forEach(function (d, i) { var from = d.offsetLeft, to = from > 150 ? 12 + i * 22 : 220 + i * 22; d.style.left = to + 'px'; if (!R) d.animate([{ transform: 'translateX(' + (from - to) + 'px)' }, { transform: 'none' }], { duration: 320, easing: S }); }); };
document.querySelector('.dk-mo .fold button').onclick = function () { var b = this.nextElementSibling, open = b.hidden; if (open) { b.hidden = false; var h = b.scrollHeight; if (!R) b.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 320, easing: S }); } else { var h2 = b.offsetHeight; if (R) { b.hidden = true; return; } var a = b.animate([{ height: h2 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 240, easing: 'cubic-bezier(.4,0,1,1)' }); a.onfinish = function () { b.hidden = true; }; } };
"""
comp("Motion", "Foundations", 420, '<div class="dk-stage col"><div class="dk-mo">'
  '<div class="lane"><i style="left:12px"></i><i style="left:34px"></i><i style="left:56px"></i><span>the map\'s events slide, 320 spring</span></div>'
  '<div class="acts"><button class="dk-circ glass dk-press" id="mo-slide" aria-label="Slide the events">' + ic("arrows-left-right", "bold") + '</button><span class="dk-sl claude dk-tagbtn"><i class="d"></i>Claude</span><span class="dk-sl">Why</span></div>'
  '<div class="fold"><button type="button">Sprint 2.2.2 · tap to fold</button><div class="b"><p>Opens on the spring in 320 ms, its words fading in over the first 150; closes in 240 on the exit curve. The row you tapped stays put.</p></div></div>'
  '<p class="dk-note">Press anything: controls dip to .96 and spring back; rows take a grey fill; tags dim.</p></div></div>',
 """# Motion

One set of timings for the whole desk (v33; decisions/questions/P-005-design-round-8.md, answers 2 and 3; docs/design/audit-2026-11-25-v32-polish.md, section 3).

- **Curves:** `ease` cubic-bezier(.2,.8,.2,1) for anything that enters or moves; `ease-exit` cubic-bezier(.4,0,1,1) for anything that leaves; `spring` (stiffness 300, damping 30, mass 1: about 0.35 s, no visible overshoot) for folds, menus, sheets, the page push and the map; `spring-bouncy` (380, 24) only for a press releasing and a gauge landing.
- **Durations:** 100 press, 200 small (bubbles, the pointer's wash with the map's arrow), 320 standard (folds open, the map's events slide; folds close in 240), 450 page (sheets; the push 420; the Now jump 450 to 600 whatever the distance, a very long one fades, lands and settles).
- **Press (M1):** every control dips to scale .96 and brightness .96 in 80 ms and springs back; a row takes `press-fill` at radius 12; a tag dims to 60%. No grey tap flash.
- **The map (M2):** never rebuilt in sight: each event slides from where it was, the window from its old place, lanes and words cross-fade in 150; nothing dips.
- **Folds (M3):** the body grows or shrinks; the tapped row stays where it was (R7 answer 12). The gauge no longer pulses.
- **The push (M4):** opening a project is one movement from the left (v11's direction), both layers together on the spring; Back or a second tap reverses at once.
- **Overlays (M5):** bubbles open from their tag and close as the reverse; both menus open from the control that opened them and close back into it; a sheet closes in 280.
- **The fixed centre (M6):** the row's wash fades in 120 and out 200, with the map's arrow. After the Now jump, one 400 ms pulse on the Now card.
- **The sheet (M7):** follows the finger; a flick or a third of its height puts it away; dragging up gives a little; the scrim fades with the drag.
- **The Context view (M8):** holding the round button fills a ring around it in 450 ms; the view lands first, then the first eight rows settle, 14 ms apart.
- **Reduced motion:** no transforms or scroll animation; a 120 ms fade instead; a press stays as colour.
""", script=MOTION_JS)

V33 = {
 "Gauge": "- **v33 (round 8):** every ring is drawn the same: round caps on track and arc, the stroke at about 9% of the diameter; a value that changes lands on the bouncy spring (C3). The 7.5 number inside stays (R7 answer 11).",
 "TopPills": "- **v33 (round 8):** Back, both pills and the bell capsule share one material (the floating glass and its shadow) and one height, 34 (L4; the height is the owner's, R7 answers 21 and 22). The project's name takes the spare width and the phase pill keeps its own, so a long name loses fewer letters (U8). The chevron and More are Phosphor (C2). Both menus are one component: radius 28, opening from the pill's corner on the spring and closing back into it (C1, M5); a gate line wraps rather than being cut (U7). The list's titles are 15 and detail lines 13, the map's words 11 (L3).",
 "EventBubble": "- **v33 (round 8):** every bubble has a close mark, and a tap outside or Escape closes it (U1); it opens from its tag and closes as the reverse (M5). Tapping a tag never moves the page: the tag stays where it was (F1). A bubble with too little room below opens above its row, or keeps to the room there is and scrolls inside (U2). The Needs tag stays on its row's line while its bubble is open.",
 "SessionLink": "- **v33 (round 8):** the bubble leads with **Open in Claude** and the run or pull request beside it, then what the session did (F3). Every tag is 20 high, radius 6, 12 text, on one baseline; Claude is a quiet grey fill, Why keeps its outline (L6; R5 answer 10).",
 "BranchMap": "- **v33 (round 8):** as the events in view change, the map moves instead of being rebuilt: each event slides from where it was on the spring, the window from its old place, the lanes and words cross-fade; nothing dips (M2). Words on main keep a clear gap; a lane's name stays inside the frame (R4). The band behind the map is solid, with a soft fade where rows slide under it (L1); in dark it is a step lighter than the ground, done merges recede and Now stays the brightest mark (D1, D3).",
 "MilestoneMap": "- **v33 (round 8):** see BranchMap: the map moves instead of being rebuilt (M2); the dashed outline of a selected milestone is 1 point, 3 on 3 off, at 60% (L10).",
 "FixedCentre": "- **v33 (round 8):** the pointer stands 4 in from the edge with a rounded tip (L9); the row's wash fades in 120 and out 200, with the map's arrow (M6). \"Needed by\" and the other jumps land the row they name at the centre, its arrow on the map (F1).",
 "LevelRails": "- **v33 (round 8):** the phase strip's current segment is raised by a soft shadow, not a black ring, and a washed heading hides its rule (L7); routine rows' words sit on the same column as every other event's (L8); one separator colour, a hairline on retina (L9); 700 only for the phase's name (L3).",
 "RoundButton": "- **v33 (round 8):** holding it fills a ring around it in 450 ms, so the press visibly charges before the Context view turns on (M8). It dips and springs back like every control (M1).",
 "ContextView": "- **v33 (round 8):** the view lands first, then only the first eight rows settle, 14 ms apart (M8).",
 "BottomSheet": "- **v33 (round 8):** opens on the spring in 450, closes in 280; the drag follows the finger with its speed, a flick or a third of the height puts it away, dragging up gives a little, the scrim fades with the drag (M5, M7).",
 "PopoverMenu": "- **v33 (round 8):** one menu component with the project and phase menus: radius 28, opening from the control that opened it on the spring, closing back into it (C1, M5).",
 "WaitGroup": "- **v33 (round 8):** the strip fits its card at 360; the wait time sits under the question, so the question keeps up to three lines (R5).",
}

for _k, _v in V33.items():
    _h, _r = C[_k]; C[_k] = (_h, _r.rstrip() + '\n' + _v + '\n')


# round 8, answer 6 (decisions/questions/P-005-design-round-8.md): the 12 held changes, each as recommended (v34)
comp("MapFold", "Desk", 300, '<div class="dk-stage col" style="max-width:393px">'
  '<div class="dk-mf"><div class="map"><span>the branch map</span></div><button type="button" class="hd" aria-label="Show or hide the map"></button></div>'
  '<div class="dk-mf slim"><div class="strip"><b>2.2.2.10</b> · Design<span class="dots"><i class="ok"></i><i class="bad"></i><i class="on"></i><i></i><i></i><i></i><i></i></span></div><button type="button" class="hd" aria-label="Show or hide the map"></button></div>'
  '<p class="dk-note">A handle at the band\'s foot folds the map to one line, the row at the pointer and the phase\'s milestones, and back.</p></div>',
 """# MapFold

Room for the list when you want it. Chosen by the owner on 26 November 2026 (decisions/questions/P-005-design-round-8.md, answer 6: "I approve all as recommended", item 8, the first review's U3).

- **A handle** at the foot of the floating band, 36 by 5, grey at 45%, with a 44-point target.
- **Tapped**, the map folds to one line: the number of the row at the pointer, the phase's name, and a small square per milestone in its status colour, Now in blue. Tapped again, the map comes back. The row at the pointer stays where it was.
- **Still floating**, with the top row; nothing folds on its own as you scroll (the other option, folding on scroll, was not chosen).
- The band is 334 open and 76 folded on a 393 by 852 phone.
""")

V34 = {
 "TopPills": "- **v34 (round 8, answer 6):** Back, both pills and the bell capsule are 38 high, the same as home's capsule (item 1; it sets aside R7 answers 21 and 22's 34). A long project name such as Home-screen widget is still cut at 393: the phase pill would have to give up its name for it.",
 "EventBubble": "- **v34 (round 8, answer 6):** Why is a quiet grey fill like the link tag, with no outline, and wears a thin blue edge while its bubble is open (item 2; it sets aside R5 answer 10's outline).",
 "SessionLink": "- **v34 (round 8, answer 6):** each tag names its session, such as \"CoS 14 Nov\" for a Chief of Staff session started that day; Run and PR stay as they are (item 9).",
 "ContextView": "- **v34 (round 8, answer 6):** event rows carry their fourth number (2.2.1.1) in place of the dot, and each link names its session (item 9).",
 "FixedCentre": "- **v34 (round 8, answer 6):** the project opens, and a tap on the round button lands, with what waits on you (Stop card 5) at the pointer and its arrow on the map (item 4; it sets aside round 3 answer 4's \"Now just under the floating band\").",
 "BranchMap": "- **v34 (round 8, answer 6):** one scale for the whole phase: the map no longer re-fits to the events in view, so as you read down the arrow only moves right (item 5; it sets aside R5 answers 4 and 7's fit to what is in view). A phase with no events yet draws its planned milestones as dashed rings on a dotted line, numbered, names cut to about nine letters (item 6).",
 "MilestoneMap": "- **v34 (round 8, answer 6):** see BranchMap: one scale per phase, and planned milestones as dashed rings where a phase has no events.",
 "MilestoneSelect": "- **v34 (round 8, answer 6):** a second tap on the selected milestone folds it and clears the selection; a third opens and selects it again (item 7).",
 "LevelRails": "- **v34 (round 8, answer 6):** a milestone's label and number (MILESTONE 3.6) sit on a small line above, as fourth numbers do, and its name takes the full width on up to two lines (item 10). Times are in Chicago time, with a date on anything older than today, such as \"13 Nov, 3:32 pm\" (item 12).",
 "Gauge": "- **v34 (round 8, answer 6):** where a milestone's criteria are not on record, the ring is dashed and empty, with no number (item 11). The 7.5 number stays everywhere else.",
 "Motion": "- **v34 (round 8, answer 6):** the push now comes in from the right and goes back to the left, as other iPhone apps do, so Back's arrow points the way you came (item 3; it sets aside v11's push from the left).",
 "WaitGroup": "- **v34 (round 8, answer 6):** times read in Chicago time; a clock time from before today carries its date (item 12).",
}
for _k, _v in V34.items():
    _h, _r = C[_k]; C[_k] = (_h, _r.rstrip() + '\n' + _v + '\n')

# round 8, answers 8 and 9 (decisions/questions/P-005-design-round-8.md): gates, decisions, research and stops, option A of each (v35)
def you(t="Yours"): return f'<span class="dk-you">{ic("user", "bold")}{t}</span>'
def kst(c, t): return f'<span class="dk-kst {c}">{t}</span>'
def gate_row(st, name, l3, ico, mark=True):
    return (f'<div class="dk-gate" role="button" tabindex="0"><span class="dk-gico {ico}">{ic("flag")}</span><span class="dk-gtx"><span class="lv">Gate</span>'
            f'<span class="l1"><b>{name}</b>{kst(st[0], st[1])}{you() if mark else ""}</span><span class="l3">{l3}</span></span>{ic("caret-right", "bold", "i chev")}</div>')
comp("YoursMark", "Desk", 120, '<div class="dk-stage col" style="max-width:393px;gap:10px"><div style="display:flex;gap:8px;flex-wrap:wrap">'
  + you() + you("By proxy") + you("Yours to rule") + '<span class="dk-kst wait">Yours · waiting</span></div>'
  + '<p class="dk-note">One mark on what is the owner\'s: a gate, a decision of yours, a stop waiting on you.</p></div>',
 """# YoursMark

One mark on what is the owner's own. Chosen by the owner on 26 November 2026 (decisions/questions/P-005-design-round-8.md, answers 8 and 9: "Honestly love every option. Especially the research functionality"; "I want you to go with ever option you recommended so if those are all A then do that").

- **Yours**: a quiet grey fill (the press fill), 12 semibold, a small Phosphor `user` (bold), radius 6, the same height as every tag.
- **By proxy**: a decision made for the owner under a standing proxy (the Chief of Staff, L-0049).
- **Yours to rule**: on a gate's sheet before it opens.
- **Yours · waiting**: a stop waiting on the owner takes the waiting tag's colour with these words.
- No new colour: the mark is neutral, the state keeps the soft status colours.
""")
comp("GateRow", "Desk", 440, '<div class="dk-stage col" style="max-width:393px">'
  + gate_row(("ok", "Passed"), "Design gate", "You said proceed · 13 Nov, 10:10 am · after one hold", "ok", False)
  + gate_row(("idle", "Not reached"), "Build gate", "You approve Design’s criteria, then they freeze · 1 of 7 milestones reached", "next")
  + gate_row(("idle", "Not reached"), "Launch gate", "The go-live and the graduation · the last ruling on the desk", "")
  + f'<div style="display:flex;justify-content:space-between;margin-top:14px"><span class="dk-mgate ok">{ic("flag")}Design gate · passed</span><span class="dk-mgate">Build gate · yours{ic("flag")}</span></div>'
  + '<p class="dk-note">On the map, the gate in and the gate out mark the band\'s edges; in the phase menu each gate row says passed, yours, or yours, next.</p></div>',
 """# GateRow

A gate is the owner's ruling on a whole phase, so it is a row of its own, closing the phase it ends. Chosen on 26 November 2026 (round 8, answers 8 and 9; option A on docs/design/mockups/options-r8-kinds/).

- **The row**: a 30 ring with Phosphor `flag`; GATE in the level label; the gate's name, its state (Passed, Not reached, Waiting on you) and Yours while it is still the owner's to rule; one line under it (your ruling and when, or what it decides); a chevron. Hairlines above and below.
- **The ring**: a passed gate washed green; the next gate dashed; a later one plain.
- **On the map**: the gate into the phase marks the band's left edge, the gate out its right edge, each with its name and passed or yours.
- **In the phase menu**: each gate row carries its flag and passed (with the date), yours, or yours, next.
- **Tapped**, it opens its sheet (KindSheet): what it decides, what it waits for (each milestone and its state), what the owner will get, and the four choices: proceed, hold, recycle, kill.
- Times in Chicago time, as everywhere (round 8, answer 6, item 12).
- Records: OPERATING_MODEL.md §3 and §4 (phase gates, S-024); docs/gates/P-005/; decisions/P-005/dor-2.md, dor-3.md.
""")
def kev(kind_ico, kind, tags, title, l3, extra="", tm=""):
    return (f'<div class="dk-ev"><span class="dk-ev-ico">{ic(kind_ico)}</span><span class="tx"><span class="l1"><b>{kind}</b>{tags}<span class="tm">{tm}</span></span>'
            f'<span class="l2" style="display:block">{title}</span>{extra}<span class="l3" style="display:block">{l3}</span></span></div>')
comp("KindRows", "Desk", 420, '<div class="dk-stage col" style="max-width:393px">'
  + kev("chat-circle-text", "Decision", kst("ok", "Done") + you(), "New spec S-011, rounds reset", "by orchestrator", '<span class="dk-say">Applies your words: <q>criteria-wrong (Recommended)</q></span>', "6:07 am")
  + kev("chat-circle-text", "Decision", kst("ok", "Done") + you("By proxy"), "You said resubmit", "by the Chief of Staff", '<span class="dk-say">Under your proxy: <q>resubmit</q></span>', "12 Nov, 10:48 pm")
  + '<div class="dk-ev"><span class="dk-ev-ico">' + ic("magnifying-glass") + '</span><span class="tx"><span class="l1"><b style="font:600 11px/14px var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--text-2)">Research</b><b>Q-028</b><span class="dk-memo">Memo</span></span><span class="l3">Passed its source check on the 3rd try · 13 Nov</span></span></div>'
  + kev("hand-palm", "Stop", '<span class="dk-kst wait">Yours · waiting</span>', "Stop card 5", "Three plan reviews failed · holds up M6, M7, M8", '', "9:42 am").replace('</span></span></div>', '</span><button type="button" class="dk-kopen big">Answer stop card 5</button></span></div>', 1)
  + '</div>',
 """# KindRows

How a decision, research and a stop read in the list. Chosen on 26 November 2026 (round 8, answers 8 and 9; option A of each on docs/design/mockups/options-r8-kinds/).

- **Decision**: Done and Yours (or By proxy) on its first line; under the title, the owner's own words it applies, quoted: "Applies your words: “criteria-wrong (Recommended)”", "Your words:" where the owner said it, "Under your proxy:" for a proxy ruling. Tapped, its sheet shows the ruling, what it changed, the choices it had and its record.
- **Research**: RESEARCH in place of SPRINT, its id and a Memo tag; the line under it says how its source check went. On the map its lane reads "Research Q-028". Tapped (or its Memo), its sheet shows the question, the decision it serves, what happened step by step, how sure it is, and its records.
- **Stop**: Yours · waiting in the waiting tag's colour; the line under it says the rule that fired and what it holds up; an Answer button opens the card's choices with the recommended one edged in blue. The button is an example: no record says the desk's answer link can record a stop card's answer, so the mockup sends nothing.
- Each kind keeps its own Phosphor icon (chat-circle-text, magnifying-glass, hand-palm); the milestone and sprint shapes stay on hold.
- Records: decisions/P-005/ (stop-4, dor-fail-1, stop-5-notes); docs/LEDGER.md L-0049; research/Q-028*.md, intake/requests/Q-028.toml; status/P-005.toml; OPERATING_MODEL.md §4, the stop rule (D-044).
""")
comp("KindSheet", "Desk", 560, '<div class="dk-stage col" style="max-width:393px"><div class="dk-ksheet"><div class="grab"></div><span class="x" aria-label="Close">' + ic("x", "bold") + '</span>'
  + '<div class="kd">' + ic("hand-palm") + 'Stop</div><h2>S-011 failed three plan reviews: what happens next?</h2><div class="row"><span class="dk-kst wait">Waiting on you</span>' + you() + '</div>'
  + '<h3>Why it stopped</h3><p>Three plan reviews of S-011 failed · holds up M6, M7, M8</p>'
  + '<h3>Your answer</h3><div class="opts"><span class="opt rec"><b>criteria-wrong</b>A new spec replaces S-011; the plan rounds reset; not a strike.</span><span class="opt"><b>re-specify</b>The same new spec, counted as a strike.</span><span class="opt"><b>confirm</b>One focused check, offered once.</span></div>'
  + '<p class="ex">An example: the mockup records nothing.</p></div></div>',
 """# KindSheet

The sheet a gate, a decision, research or a stop opens when tapped: one shape for all four. Chosen on 26 November 2026 (round 8, answers 8 and 9).

- A bottom sheet (BottomSheet's motion: opens on the spring in 450, closes in 280; a close mark, a tap on the scrim and Escape each close it).
- **Top**: the kind's icon and word, the title, its state and Yours.
- **Then, by kind**: a gate, what it decides, what it waits for, what you will get and the four choices; a decision, your words, who applied it and when, what it changed, the choices it had; research, the question, the decision it serves, what happened (each step with its state), how sure it is; a stop, why it stopped, what it holds up, and your answer (the recommended choice edged in blue).
- **Last**: Records, the files behind every fact on the sheet. Anything the records do not hold is marked as an example.
""")
V35 = {
 "EventWeight": "- **v35 (round 8, answers 8 and 9):** a decision of the owner's says so (Yours, By proxy) and quotes the words it applies; a stop waiting on the owner reads Yours · waiting, the rule that fired and what it holds up, with Answer. See KindRows and YoursMark.",
 "BranchMap": "- **v35 (round 8, answers 8 and 9):** the gate into the phase and the gate out mark the band's edges (GateRow); a research lane reads \"Research Q-028\".",
 "PopoverMenu": "- **v35 (round 8, answers 8 and 9):** in the phase menu each gate row carries its flag and passed (with its date), yours, or yours, next (GateRow).",
 "LevelRails": "- **v35 (round 8, answers 8 and 9):** a gate is a row of its own closing its phase (GateRow); research takes RESEARCH in place of SPRINT, with a Memo tag (KindRows).",
 "BottomSheet": "- **v35 (round 8, answers 8 and 9):** gates, decisions, research and stops open as sheets of one shape (KindSheet).",
}
for _k, _v in V35.items():
    _h, _r = C[_k]; C[_k] = (_h, _r.rstrip() + '\n' + _v + '\n')

for name, (html, md) in C.items():
    d = os.path.join(OUT, "components", name); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "preview.html"), "w").write(html)
    open(os.path.join(d, "README.md"), "w").write(md)
print(len(C), "components")
