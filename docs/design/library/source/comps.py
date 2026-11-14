import os, sys
OUT = sys.argv[1]
I = {
 'back': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
 'check': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 'bell': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>',
 'bellf': '<svg class="dk-ico" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0" fill="none"/></svg>',
 'more': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><circle cx="8" cy="12" r="1.1" fill="currentColor"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/><circle cx="16" cy="12" r="1.1" fill="currentColor"/></svg>',
 'home': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 11L12 4l8.5 7"/><path d="M5.5 9.5V20h5v-5.5h3V20h5V9.5"/></svg>',
 'plan': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="6" r="1.8"/><circle cx="6" cy="18" r="1.8"/><path d="M6 8v8M10 6h10M10 12h10M10 18h10"/></svg>',
 'now': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/></svg>',
 'plus': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
 'search': '<svg class="dk-ico" style="width:17px;height:17px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/></svg>',
 'chev': '<svg class="chev" viewBox="0 0 8 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 1.5l5 5-5 5"/></svg>',
 'rc': '<svg class="rc" viewBox="0 0 7 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.2 1.2l4.3 4.3-4.3 4.3"/></svg>',
 'fold': '<svg class="fold" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 1.5l4.5 4.5 4.5-4.5"/></svg>',
 'inbox': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 13.5L6 5h12l2.5 8.5V19h-17z"/><path d="M3.5 13.5h5a3.5 3.5 0 0 0 7 0h5"/></svg>',
 'flag': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
 'doc': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg>',
 'cal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
 'bold': '<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z"/></svg>',
 'x': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>',
}

def page(group, height, title, body, script="", subtitle="", width=None):
    attrs = f'group="{group}" height={height}' + (f' width={width}' if width else '') + (f' subtitle="{subtitle}"' if subtitle else '')
    return (f'<!-- @dsCard {attrs} -->\n<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><title>{title}</title></head>\n<body>\n'
            + body + ('\n<script>\n' + script + '\n</script>' if script else '') + '\n</body>\n</html>\n')

C = {}
def comp(name, group, height, body, readme, script="", subtitle="", width=None):
    C[name] = (page(group, height, name, body, script, subtitle, width), readme)

PRESS = "document.addEventListener('click', function (e) { var b = e.target.closest('[aria-pressed]'); if (!b) return; var g = b.parentNode; g.querySelectorAll('[aria-pressed]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });"

comp("TopButton", "Navigation", 140,
 f'<div class="dk-stage">\n  <button class="dk-circ" aria-label="Back">{I["back"]}</button>\n  <button class="dk-circ on" aria-label="Done">{I["check"]}</button>\n  <p class="dk-note">Default (back) and on (confirm). 44 round, 16 from the screen edge.</p>\n</div>',
 """# TopButton

One page action or the way back, in a 44-point glass circle at the top corner. From refs 12, 15 and 17.

- Size `size-hit` (44), full radius, `surface-floating` with `shadow-float`; icon 22 with a stroke near 2.
- States: default (icon in `text-1`); on, filled `accent-select` with a white check (ref 15).
- Sits 16 (`space-16`) from the screen edge, level with the capsule on the other side.
- On the desk: the back button inside a project; the confirm in a sheet's top corner.
""")

comp("TopCapsule", "Navigation", 140,
 f'<div class="dk-stage">\n  <div class="dk-capsule"><button aria-label="Needs you">{I["bell"]}</button><button aria-label="More">{I["more"]}</button></div>\n  <div class="dk-capsule"><button class="bell-on" aria-label="Needs you: 3">{I["bellf"]}<span class="dk-dot"></span></button><button aria-label="More">{I["more"]}</button></div>\n  <p class="dk-note">Nothing waiting, and three things waiting (filled bell with a blue dot).</p>\n</div>',
 """# TopCapsule

Two page actions joined in one 105.7 by 44 glass capsule at the top right. From refs 11, 14 and 17.

- Full radius, `surface-floating`, `shadow-float`; the two icons about 53 apart.
- The bell fills with `bell-filled` and gains a 10-point `accent-select` dot when something waits for the owner.
- On the desk: Needs you (bell) and More (the popover menu).
""")

comp("TabBar", "Navigation", 110,
 f'<div class="dk-stage">\n  <nav class="dk-tabbar" aria-label="Tabs"><button class="dk-tab" aria-current="true" aria-label="Desk">{I["home"]}</button><button class="dk-tab" aria-current="false" aria-label="Plan">{I["plan"]}</button><button class="dk-tab" aria-current="false" aria-label="Needs you">{I["inbox"]}</button></nav>\n  <button class="dk-round" aria-label="Now">{I["now"]}</button>\n</div>',
 """# TabBar

The main sections, as icons only, in a floating 280 by 62 capsule. From refs 11 and 12.

- Sits 20 (`space-20`) from the left edge, above the home indicator; `surface-floating`, `shadow-float`.
- The selected tab gets a 74 by 54 pill in `fill-selected` and its icon turns `accent`; the others stay `text-1`.
- No labels in the references; each tab still needs an accessible name.
- On the desk: Desk, Plan and Needs you. Tap any tab here to try it.
""",
 script="document.addEventListener('click', function (e) { var b = e.target.closest('.dk-tab'); if (!b) return; b.parentNode.querySelectorAll('.dk-tab').forEach(function (x) { x.setAttribute('aria-current', String(x === b)); }); });")

comp("RoundButton", "Navigation", 96,
 f'<div class="dk-stage">\n  <button class="dk-round" aria-label="Now">{I["now"]}</button>\n  <button class="dk-round" aria-label="New">{I["plus"]}</button>\n</div>',
 """# RoundButton

The one separate action beside the tab bar, in a 56-point circle. From refs 11 and 12.

- `size-round`, `surface-floating`, `shadow-float`; the glyph about 21 with a 2.5 stroke.
- Craft uses it for "+" (create). The desk uses it for Now, which centres the plan on the current step.
""")

comp("LargeTitle", "Headings", 140,
 '<div class="dk-stage col">\n  <div><p class="dk-crumb">P-005 · Service-Desk</p><h1 class="dk-title">Timeline</h1></div>\n  <h2 class="dk-doc-title">S-011 Plan view</h2>\n</div>',
 """# LargeTitle

Names the screen in 27 bold at 16 from the left, and scrolls away with the page. From refs 11 and 12.

- Style `large-title`; one per screen. A plan or document page uses `document-title` (24 bold) instead (refs 13, 17).
- The crumb above it is the desk's own addition: ids in the `id` style, `text-2`. The references have none.
""")

comp("SectionHeading", "Headings", 190,
 f'<div class="dk-stage col" style="width:361px">\n  <h2 class="dk-head"><span>Needs you</span>{I["chev"]}<span class="grow"></span><span class="more" aria-hidden="true">···</span></h2>\n  <h2 class="dk-head" role="button" tabindex="0" id="fold"><span>Projects</span><span class="grow"></span>{I["fold"]}</h2>\n  <p class="dk-note">Drill-in heading with a menu; collapsible heading (tap it).</p>\n</div>',
 """# SectionHeading

Titles a group of rows in 19 semibold, with a small chevron after the word. From refs 11 and 12.

- Style `section-heading`. The chevron (7 by 12, `text-3`) right after the word drills in.
- Optional `···` at the right opens a menu; a down chevron at the right collapses the group (ref 12).
- On the desk: Needs you, Projects, and each phase on the plan.
""",
 script="var f = document.getElementById('fold'); f.addEventListener('click', function () { f.classList.toggle('closed'); });")

comp("CapsLabel", "Headings", 72,
 '<div class="dk-stage"><p class="dk-caps">Milestones</p><p class="dk-caps">Show on the plan</p></div>',
 """# CapsLabel

Names a group inside a sheet in 13 semibold capitals, tracked. From refs 15 and 16.

- Style `caps-label`, colour `text-2`. Only inside sheets and popovers; the page itself uses SectionHeading.
""")

comp("SearchField", "Lists", 96,
 f'<div class="dk-stage"><label class="dk-search">{I["search"]}<input placeholder="Search the desk" aria-label="Search the desk"></label></div>',
 """# SearchField

Searches the space from a 44-high capsule in `fill`. From ref 11.

- 361 wide (the screen less two 16 margins), full radius; the glass 16.5 at a 15 inset, in `icon`.
- Placeholder in 17 regular, `icon`. Tapping it opens a picker popover (ref 14).
- On the desk: find a spec, sprint or event by id or words.
""")

comp("ListRow", "Lists", 232,
 f'''<div class="dk-stage"><div class="dk-list">
  <div class="dk-row"><span class="ic">{I["inbox"]}</span><span class="tx">Stop card 5 for S-011</span>{I["rc"]}</div>
  <div class="dk-row"><span class="ic">{I["flag"]}</span><span class="tx">Plan review returned three findings</span><span class="ct">3</span>{I["rc"]}</div>
  <div class="dk-row"><span class="ic">{I["doc"]}</span><span class="tx">Handoff, part 11</span>{I["rc"]}</div>
  <div class="dk-row"><span class="ic">{I["doc"]}</span><span class="tx">A row whose words are much too long to fit on one line</span>{I["rc"]}</div>
</div></div>''',
 """# ListRow

One line of navigation: an outline icon, the words, an optional count and a chevron. From refs 11 and 14.

- 48 pitch (`size-row`); 42 inside a popover (`size-row-menu`). Icon 15 to 20 in `icon`; words in `body` from x 59.
- Count in `text-4`, chevron 6 by 10 in `text-3`.
- Rows are split by an inset separator: 1 point of `separator`, starting at the words and stopping 24 from the right. No boxes.
- Long words end in an ellipsis before the chevron.
- On the desk: Needs you rows, events inside a sprint.
""")

comp("TaskRow", "Lists", 130,
 '''<div class="dk-stage col">
  <div class="dk-task"><span class="dk-check"></span><span class="dk-date"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>Today</span><span>Answer the stop card</span></div>
  <div class="dk-task"><span class="dk-check done"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="dk-date soon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>Fri</span><span>Merge #444</span></div>
</div>''',
 """# TaskRow

One task: a checkbox, a date chip and the words, at a 36 pitch. From ref 12.

- Checkbox 16 square, radius 4, 2-point `control-border`; done becomes an 18.7 circle in `accent-select` with a white check.
- Date chip 24 high, radius 6, `fill`, text in `chip` style; soon turns `accent-text`. The references also show a red overdue chip; red is held back until colour is added.
- Words in `body`, `text-1-soft`.
""")

comp("FilterChip", "Chips", 140,
 '''<div class="dk-stage"><div class="dk-chips" role="group" aria-label="Projects">
  <button class="dk-chip" aria-pressed="true"><span class="label">Service-Desk</span><span class="n">2</span></button>
  <button class="dk-chip" aria-pressed="false"><span class="label">Model-Lab</span>ML</button>
  <button class="dk-chip" aria-pressed="false"><span class="label">Operating Model</span>OM</button>
  <button class="dk-chip" aria-pressed="false"><span class="label">Portfolio</span>PF</button>
</div><p class="dk-note">One of many: tap a chip. The selected one widens to show its label.</p></div>''',
 """# FilterChip

Switches the view, one of many, in a 40-high capsule. From ref 12.

- `size-chip` high, at least 68 wide, 8 apart (`space-8`), `fill`, full radius; icon or short text in `text-1-soft`.
- Selected: `accent-tint` with a thin `accent-tint-edge`, the label shown in `label` style and `accent-on-tint`, and the chip widens.
- A waiting count sits beside the label in `small`, `text-2`.
- On the desk: the project switcher inside a project.
""", script=PRESS)

comp("DocumentCard", "Cards", 210,
 '''<div class="dk-stage">
  <div class="dk-doc"><div class="t">Handoff 11</div><div class="c">Today</div></div>
  <div class="dk-doc"><div class="t">S-011 spec</div><div class="c">Frozen</div></div>
  <div class="dk-doc"><div class="t">Craft audit</div><div class="c">Yesterday</div></div>
</div>''',
 """# DocumentCard

A recent document in a 140 by 170 card, in a horizontal carousel. From ref 11.

- `surface`, radius 12, a 1-point `edge` and `shadow-card`; 8 apart. Title in 15 medium, caption in `small`.
- The references give each card a 6-point tinted frame drawn from the document; the desk keeps the frame off until colour is added.
""")

comp("ProjectCard", "Cards", 170,
 '''<div class="dk-stage">
  <div class="dk-card sel"><div class="hd"><span class="th"></span><div><div class="t">Service-Desk</div><div class="c">S-011 · stop card 5</div></div></div></div>
  <div class="dk-card"><div class="hd"><span class="th"></span><div><div class="t">Model-Lab</div><div class="c">Quiet since Tuesday</div></div></div></div>
</div>''',
 """# ProjectCard

A project with its current step, from Craft's pinned card. From ref 12.

- 264 wide, radius 16, `surface`, `shadow-card`, 12 apart; thumbnail 28 by 36; title in `label` (`text-1-soft`), caption in `caption` (`text-2`).
- Selected: a 5-point `selection-frame` around the card.
- On the desk: each project on the Desk; tapping one branches into its plan.
""")

comp("NowBlock", "Selection", 120,
 '''<div class="dk-stage"><div class="dk-now"><div class="t">Stop card 5</div><div class="c">S-011 · Plan view · waits on you</div></div></div>''',
 """# NowBlock

Marks the current step, from Craft's selected block. From ref 13.

- `now-block` tint inside a 6-point `now-halo`, radius 12, with a 4-point `accent-select` bar at the left.
- Title in 17 semibold `now-text` (4.7:1); caption in `caption`, `text-1-soft`.
- Only one per plan. The Now button centres the plan on it.
""")

comp("RadioDot", "Selection", 80,
 '<div class="dk-stage"><span class="dk-radio"></span><span class="dk-radio on"></span><span class="dk-check"></span><span class="dk-check done"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span></div>',
 """# RadioDot

Pick one: an 18-point ring that fills with a 14-point dot. Shown beside the checkbox. From refs 12 and 13.

- Ring 1 point `control-border`; selected dot `accent-select`.
- Checkbox: 16 square, radius 4, 2-point border; done is an 18.7 circle in `accent-select` with a white check.
""")

comp("TextButton", "Buttons", 80,
 '<div class="dk-stage"><button class="dk-text-btn">Reset</button><button class="dk-text-btn grey">Cancel</button></div>',
 """# TextButton

A light action in plain 17 regular words. From refs 13 and 16.

- Blue (`accent-text`, 5.2:1) for an action such as Reset; grey (`text-2`) for Cancel.
- Usually in a sheet's top corners, opposite the Done capsule.
""")

comp("DoneButton", "Buttons", 80,
 '<div class="dk-stage"><button class="dk-done">Done</button></div>',
 """# DoneButton

Confirms and closes a sheet, as a black 70 by 36 capsule. From refs 13 and 16.

- `button-black`, full radius, label in `button-small` (15 semibold) `on-black`.
- One per sheet, at its top right.
""")

comp("CapsulePair", "Buttons", 90,
 '<div class="dk-stage"><div class="dk-pair"><button class="no">Cancel</button><button class="go">Apply</button></div></div>',
 """# CapsulePair

Apply or cancel, as two equal capsules 6 apart at the foot of a sheet. From ref 17.

- Each about 166 by 38, full radius, label in `label` style.
- Apply is `accent` with `on-accent` (4.8:1; the reference blue #3a85f6 gives only 3.6:1, so it is darkened). Cancel is `button-grey` with `on-grey`.
""")

comp("SoftButton", "Buttons", 80,
 f'<div class="dk-stage"><button class="dk-soft">{I["plus"].replace("dk-ico", "dk-ico").replace("22px", "18px")}Add a step</button></div>',
 """# SoftButton

Adds a value inside a sheet, as a 38-high soft rectangle. From ref 17.

- Radius 12, `fill-sheet`, a "+" and 17 medium words in `text-1`.
""")

comp("ToolButton", "Buttons", 90,
 f'<div class="dk-stage"><button class="dk-tool" aria-label="Bold">{I["bold"]}</button><button class="dk-tool on" aria-label="Bold, on">{I["bold"]}</button><button class="dk-tool" disabled aria-label="Bold, unavailable">{I["bold"]}</button><button class="dk-close" aria-label="Close">{I["x"]}</button></div>',
 """# ToolButton

A tool inside a sheet, about 52 by 49. Shown with the small close button. From refs 13, 14 and 17.

- Radius 12, `fill-sheet`, icon 18 to 22 in `text-1`.
- On: `accent-tint` with an `accent-select` edge. Disabled: icon in `text-4`.
- Close button: a 22 circle in `text-4` with a white cross; dismisses a popover.
""")

comp("SegmentedRow", "Sheets", 140,
 '<div class="dk-stage"><div class="dk-seg" style="width:337px" role="group" aria-label="Zoom"><button aria-pressed="false">Phases</button><button aria-pressed="true">Milestones</button><button aria-pressed="false">Sprints</button></div><p class="dk-note">Tap a segment.</p></div>',
 """# SegmentedRow

Picks one of a few words in a white row split by hairlines. From ref 13.

- Height 49, radius 10, `surface`; dividers 1 point `separator-surface`.
- Selected: `accent-tint` with a 1.3-point `accent-select` edge, words in `accent-on-tint`.
- On the desk: how far the plan is zoomed (phases, milestones, sprints).
""", script=PRESS)

comp("SheetField", "Sheets", 130,
 '<div class="dk-stage" style="width:361px"><input class="dk-field" value="S-011 Plan view" aria-label="Name"><input class="dk-field" placeholder="Add a note" aria-label="Note"></div>',
 """# SheetField

Edits a name inside a sheet, 38 to 42 high. From ref 17.

- Radius 10, `surface` with a 1-point `separator-surface` edge; words in `body`, placeholder in `icon`.
""")

comp("BottomSheet", "Sheets", 350,
 '''<div class="dk-stage"><div class="dk-sheet" role="dialog" aria-label="Filter the plan">
  <div class="dk-grab"></div>
  <div class="dk-sheet-top"><button class="dk-text-btn">Reset</button><h3>Filter the plan</h3><button class="dk-done">Done</button></div>
  <p class="dk-caps" style="margin-bottom:8px">Show on the plan</p>
  <div class="dk-seg" role="group" aria-label="Zoom"><button aria-pressed="false">Phases</button><button aria-pressed="true">Milestones</button><button aria-pressed="false">Sprints</button></div>
  <p class="dk-caps" style="margin:16px 0 8px">Hidden</p>
  <div class="dk-list" style="width:auto;background:var(--surface);border-radius:var(--radius-10);padding:0 0 0 0"><div class="dk-row"><span class="ic"><span class="dk-radio on"></span></span><span class="tx">Hide unused milestones</span></div><div class="dk-row"><span class="ic"><span class="dk-radio"></span></span><span class="tx">Show everything</span></div></div>
</div></div>''',
 """# BottomSheet

Tools and settings that rise from the bottom. From refs 13, 15, 16 and 17.

- 369 wide (12 from each side), radius 28, `surface-sheet`, `shadow-sheet`; a 36 by 4 grabber in `grabber`.
- Top line: a TextButton left, the `sheet-title` centred, the DoneButton right.
- Groups inside are named with CapsLabel. Behind it the page dims with `scrim`.
- It rises; drag the grabber to resize or dismiss. Several heights.
""", script=PRESS)

comp("PopoverMenu", "Sheets", 240,
 f'''<div class="dk-stage"><div class="dk-pop" role="menu"><div class="dk-list menu" style="width:auto">
  <div class="dk-row" role="menuitem"><span class="ic">{I["plan"]}</span><span class="tx">Open the plan</span></div>
  <div class="dk-row" role="menuitem"><span class="ic">{I["now"]}</span><span class="tx">Go to Now</span></div>
  <div class="dk-row" role="menuitem"><span class="ic">{I["doc"]}</span><span class="tx">Latest handoff</span></div>
  <div class="dk-row" role="menuitem"><span class="ic">{I["search"]}</span><span class="tx">Search</span></div>
</div></div></div>''',
 """# PopoverMenu

A short menu that opens from the More button. From ref 17.

- 249 wide, radius 28, `surface-sheet`, `shadow-sheet`; rows at `size-row-menu` (42); icons 23 to 26 in `text-1`; separators inset 23.
- Dismiss by tapping outside.
""")

comp("TimelineTrunk", "Desk", 330,
 '''<div class="dk-stage"><div class="dk-trunk">
  <div class="dk-ms next"><span class="t">Build</span><span class="c">M-4 · planned</span></div>
  <div class="dk-ms now"><div class="dk-now" style="width:auto"><div class="t">Design: stop card 5</div><div class="c">S-011 · waits on you</div></div></div>
  <div class="dk-ms done"><span class="t">Plan review</span><span class="c">S-011 · passed</span></div>
  <div class="dk-ms done"><span class="t">Define</span><span class="c">S-010 · done</span></div>
</div><p class="dk-note">Newest first. Assumed: how planned is drawn and the key shapes are still the owner's to choose.</p></div>''',
 """# TimelineTrunk

The desk's own element: the quiet trunk the plan hangs from, with milestone rows on it. Not in the references; built from their pieces.

- A 2-point trunk in `separator`. Done steps: a filled `text-3` node, words in `text-2`. Planned: a dashed ring. Now: the NowBlock, with an `accent-select` node and halo.
- Newest at the top, as the owner asked; unused milestones are hidden by default.
- Open: the key shapes for milestones and sprints, and how planned is drawn, are still the owner's call.
""")

comp("DeskHome", "Compositions", 760,
 f'''<div class="dk-stage phone" style="position:relative;height:740px;overflow:hidden;background:var(--ground)">
  <div style="display:flex;justify-content:space-between;padding:12px 16px 0"><span></span><div class="dk-capsule"><button class="bell-on" aria-label="Needs you: 2">{I["bellf"]}<span class="dk-dot"></span></button><button aria-label="More">{I["more"]}</button></div></div>
  <div style="padding:16px 16px 0"><p class="dk-crumb">Desk · 4 projects</p><h1 class="dk-title">Timeline</h1></div>
  <div style="padding:12px 16px 0"><label class="dk-search">{I["search"]}<input placeholder="Search the desk" aria-label="Search"></label></div>
  <div style="padding:16px 16px 0"><h2 class="dk-head"><span>Needs you</span>{I["chev"]}</h2>
    <div class="dk-list"><div class="dk-row"><span class="ic">{I["inbox"]}</span><span class="tx">Stop card 5 for S-011</span>{I["rc"]}</div><div class="dk-row"><span class="ic">{I["flag"]}</span><span class="tx">Answer the colour question</span>{I["rc"]}</div></div></div>
  <div style="padding:16px 0 0 16px"><h2 class="dk-head" style="padding-right:16px"><span>Projects</span>{I["chev"]}</h2>
    <div style="display:flex;gap:12px;overflow:hidden"><div class="dk-card sel" style="flex:none"><div class="hd"><span class="th"></span><div><div class="t">Service-Desk</div><div class="c">S-011 · stop card 5</div></div></div></div><div class="dk-card" style="flex:none"><div class="hd"><span class="th"></span><div><div class="t">Model-Lab</div><div class="c">Quiet</div></div></div></div></div></div>
  <div style="position:absolute;left:20px;right:16px;bottom:24px;display:flex;justify-content:space-between;align-items:center">
    <nav class="dk-tabbar" aria-label="Tabs"><button class="dk-tab" aria-current="true" aria-label="Desk">{I["home"]}</button><button class="dk-tab" aria-current="false" aria-label="Plan">{I["plan"]}</button><button class="dk-tab" aria-current="false" aria-label="Needs you">{I["inbox"]}</button></nav>
    <button class="dk-round" aria-label="Now">{I["now"]}</button></div>
</div>''',
 """# DeskHome

The Desk's home screen put together from the elements, at phone width (393), to judge positions. A composition, not a new element.

- Top capsule, crumb and large title, search, Needs you rows, the project cards carousel, and the tab bar with the round Now button.
- To move something, comment on this card with what should go where; the positions here are the starting point taken from mockup v8.
""", width=393)

for name, (html, md) in C.items():
    d = os.path.join(OUT, "components", name); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "preview.html"), "w").write(html)
    open(os.path.join(d, "README.md"), "w").write(md)
print(len(C), "components")
