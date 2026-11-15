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

for name, (html, md) in C.items():
    d = os.path.join(OUT, "components", name); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "preview.html"), "w").write(html)
    open(os.path.join(d, "README.md"), "w").write(md)
print(len(C), "components")
