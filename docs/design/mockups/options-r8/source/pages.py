# Writes the three round 8 options pages: ../../options-r8-top/, ../../options-r8-map/, ../../options-r8-list/
# (index.html, phone.html, README.md each). Run build.py first; this copies ../phone.html into each page.
import os, shutil, html
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(H, '../..')
E = html.escape
CSS = '''<meta name="claude:viewport-fit-sides" content="cover">
<style>/* Layout: each held change in turn: what the review found, the ruling it touches, then v33 as it is and each option as a live phone; phones wrap to one column on a phone. Tokens follow the Desk Element Library (v33). */
:root { --ground:#f2f3f7; --surface:#ffffff; --text-1:#1c1d21; --text-2:#6b6d71; --separator:#e7e9ed; --now-word:#0860c8; --wash:rgba(10,108,255,.10);
  --sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","Inter","Segoe UI",Roboto,sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ground:#000000; --surface:#1c1c1e; --text-1:#f2f2f7; --text-2:#98989f; --separator:#38383a; --now-word:#6cb4ff; --wash:rgba(10,132,255,.20); color-scheme:dark } }
:root[data-theme="dark"] { --ground:#000000; --surface:#1c1c1e; --text-1:#f2f2f7; --text-2:#98989f; --separator:#38383a; --now-word:#6cb4ff; --wash:rgba(10,132,255,.20); color-scheme:dark }
body { background:var(--ground); color:var(--text-1); font:400 17px/1.4 var(--sans);
  padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); padding-block:24px 64px; }
main { max-width:1680px; margin:0 auto; display:flex; flex-direction:column; gap:48px; }
h1 { font:700 28px/1.15 var(--sans); margin:0; text-wrap:balance; }
p { margin:0; max-width:70ch; }
a { color:var(--now-word); }
.lede { display:flex; flex-direction:column; gap:10px; } .lede p { color:var(--text-2); font-size:15px; }
.lede blockquote, .item blockquote { margin:0; padding:10px 14px; border-radius:12px; background:var(--surface); font-size:15px; max-width:70ch; }
nav.toc { display:flex; flex-wrap:wrap; gap:8px; }
nav.toc a { font:600 14px/1 var(--sans); text-decoration:none; padding:9px 12px; border-radius:17px; background:var(--surface); }
.item { display:flex; flex-direction:column; gap:12px; scroll-margin-top:16px; }
.item h2 { font:700 22px/1.2 var(--sans); margin:0; text-wrap:balance; }
.item .meta { font-size:15px; color:var(--text-2); max-width:75ch; display:flex; flex-direction:column; gap:6px; }
.item .meta b { color:var(--text-1); font-weight:600; }
.phones { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 330px), 395px)); gap:20px; align-items:start; margin-top:4px; }
.opt { display:flex; flex-direction:column; gap:8px; min-width:0; }
.tag { font:600 12px/1 var(--sans); letter-spacing:.06em; text-transform:uppercase; color:var(--text-2); }
.tag.rec { color:var(--now-word); }
.opt h3 { font:600 17px/1.25 var(--sans); margin:0; text-wrap:balance; }
.opt p { font-size:14px; color:var(--text-2); min-height:3.9em; }
.opt.is-rec .phone { box-shadow:0 0 0 2px var(--now-word); }
.phone { width:100%; max-width:395px; height:760px; border:1px solid var(--separator); border-radius:24px; overflow:hidden; background:var(--surface); }
.phone iframe { width:393px; max-width:100%; height:100%; border:0; display:block; }
.why { font-size:14px; color:var(--now-word); background:var(--wash); padding:8px 12px; border-radius:12px; max-width:75ch; }
@media (max-width: 700px) { .opt p { min-height:0; } }
</style>'''
def phone(o):
    rec = o.get('rec')
    return ('<div class="opt' + (' is-rec' if rec else '') + '"><span class="tag' + (' rec' if rec else '') + '">' + E(o['tag']) + ('' if not rec else ' · Recommended') + '</span>'
            '<h3>' + E(o['h']) + '</h3><p>' + o['p'] + '</p><div class="phone"><iframe src="phone.html#' + o['hash'] + '" title="' + E(o['tag'] + ': ' + o['h']) + ', live" loading="lazy"></iframe></div></div>')
def item(it):
    return ('<section class="item" id="' + it['id'] + '"><h2>' + E(it['n'] + '. ' + it['h']) + '</h2><div class="meta"><span><b>Found:</b> ' + it['found'] + '</span>'
            '<span><b>Touches:</b> ' + it['ruling'] + '</span></div>' + '<div class="why">Recommended: ' + it['rec'] + '</div>'
            '<div class="phones">' + ''.join(phone(o) for o in it['opts']) + '</div></section>')
def page(folder, title, h1, items, readme):
    d = os.path.join(M, folder); os.makedirs(d, exist_ok=True)
    shutil.copy(os.path.join(H, '..', 'phone.html'), os.path.join(d, 'phone.html'))
    body = ('<title>' + E(title) + '</title>\n' + CSS + '\n<main><div class="lede"><h1>' + E(h1) + '</h1>'
            '<p>What you said: "If you can mockup each of the proposed changes I can give a ruling" (round 8, answer 5). Each change starts with v33 as it is, then each option, live: scroll and tap inside the phones. The recommended one has a blue edge. Built on v33; reviews: docs/design/audit-2026-11-25-v32-review.md and audit-2026-11-25-v32-polish.md.</p>'
            '<nav class="toc">' + ''.join('<a href="#' + it['id'] + '">' + E(it['n'] + '. ' + it['short']) + '</a>' for it in items) + '</nav></div>'
            + ''.join(item(it) for it in items) + '</main>\n')
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(body)
    open(os.path.join(d, 'README.md'), 'w', encoding='utf-8').write(readme)
NOW = 'v33 as it is'
TOP = [
 dict(id='top-row', n='1', short='Top row height', h='How tall the top row is',
  found='Back, the two pills and the bell are 34 points high; your Craft references use 44. The second review (L4) asked whether 38, the height home\'s capsule already uses, is a fair middle.',
  ruling='round 7, answers 21 and 22 (a slim top row, more room for the list).',
  rec='38. Easier to hit and the same as home, for 4 points of list.',
  opts=[dict(tag=NOW, h='34 points', p='The band is 330 points tall.', hash='now'),
        dict(tag='Option A', h='38 points, as home', p='The band grows by 4 points, so the list loses 4.', hash='t38', rec=True),
        dict(tag='Option B', h='44 points, as Craft', p='The band grows by 10 points; the project name has less room in its pill.', hash='t44')]),
 dict(id='why-tag', n='2', short='Why\'s outline', h='How the Why tag looks',
  found='Why is the only outlined tag on a row; the second review (L6) suggested the same quiet fill the link tag uses, which takes away about 19 outlined boxes from each screen.',
  ruling='round 5, answer 10 ("a small outlined Why").',
  rec='the quiet fill. One tag style on every row; the outline comes back only while its bubble is open.',
  opts=[dict(tag=NOW, h='Outlined, as you asked', p='Tap Why: the bubble opens under the row.', hash='now'),
        dict(tag='Option A', h='A quiet fill, like the link tag', p='Same size and place. While its bubble is open it takes a thin blue edge.', hash='whyfill', rec=True)]),
 dict(id='push', n='3', short='Push direction', h='Which side a project comes in from',
  found='v33 slides a project in from the left and back to the right, as you chose in v11. iPhone apps bring a deeper page in from the right, so Back\'s arrow and the edge swipe point the way the page went (second review, M4).',
  ruling='v11, "a push from the left".',
  rec='from the right. Back\'s arrow then points the way you came, as in every other iPhone app.',
  opts=[dict(tag=NOW, h='From the left', p='Tap The timeline on home, then Back at the top left.', hash='now.home'),
        dict(tag='Option A', h='From the right, back to the left', p='Tap The timeline on home, then Back at the top left.', hash='pushR.home', rec=True)]),
]
MAP = [
 dict(id='open', n='4', short='Where it opens', h='Where the page opens, and where Now lands',
  found='The page opens with the pointer on "First draft"; Stop card 5, the thing waiting on you, is about 1,400 points further down. Tapping the round button puts the Now card right under the band, not at the pointer (first review, F2).',
  ruling='round 3, answer 4 (opens on the current step, "Now just under the floating band"), written before the fixed centre (round 7, answer 8).',
  rec='the waiting event at the pointer. The first thing you see is what needs you, with its arrow on the map.',
  opts=[dict(tag=NOW, h='Opens on the current step', p='Then scroll away and tap the round button: Now lands under the band.', hash='now'),
        dict(tag='Option A', h='The waiting event at the pointer', p='Opens with Stop card 5 at the pointer and its arrow on the map. The round button lands it there too.', hash='f2w', rec=True),
        dict(tag='Option B', h='The Now card at the pointer', p='Opens with the Now card at the pointer. The round button lands it there too.', hash='f2n')]),
 dict(id='scale', n='5', short='Map scale', h='How the map behaves as you scroll',
  found='The map spreads out the events in view and squeezes the rest, so as you scroll the window swings between 0 and 309 points wide and the arrow jumps back and forth (first review, F4).',
  ruling='round 5, answers 4 and 7 (spread what is in view; keep the window centred).',
  rec='one scale per phase. Nothing on the map moves except the window and the arrow, and they only move right as you read down.',
  opts=[dict(tag=NOW, h='Spreads what is in view', p='Scroll the list slowly and watch the map.', hash='now'),
        dict(tag='Option A', h='One scale for the whole phase', p='Every event keeps its place; the window and arrow move along it.', hash='f4b', rec=True),
        dict(tag='Option B', h='Holds still inside a plan', p='As now, except the map stops changing while the pointer is inside an agent\'s plan.', hash='f4c')]),
 dict(id='empty-phase', n='6', short='Later phases', h='The map for a phase with nothing done yet',
  found='Scroll to Build or Launch: the pill says Build, but the map still shows Design (first review, F5).',
  ruling='none directly; round 7, answer 19 asked for the whole phase on the map.',
  rec='its planned milestones. The map always matches the pill, and you see what is coming.',
  opts=[dict(tag=NOW, h='Design\'s map stays', p='Starts at the Build heading.', hash='now.at=0_of_9_milestones'),
        dict(tag='Option A', h='Its planned milestones', p='Each milestone as a dashed ring on one line, with its number and name. Scroll back up to Design and its map returns.', hash='f5p.at=0_of_9_milestones', rec=True),
        dict(tag='Option B', h='The band shrinks to the top row', p='No map until a phase has events; a slim line names the phase. Scroll back up and the map returns.', hash='f5s.at=0_of_9_milestones')]),
 dict(id='select', n='7', short='Milestone tap', h='What a second tap on a milestone does',
  found='A tap on a milestone opens it and selects it; a second tap folds it but it stays selected. Only the small cross on the chip clears it (first review, F6).',
  ruling='round 7, answer 19 (option A: an outline and a chip).',
  rec='a second tap clears it. Tap to look, tap again to let go, and the chip\'s cross still works.',
  opts=[dict(tag=NOW, h='Stays selected', p='Tap the M6 row twice and watch the chip on the map.', hash='now.at=The_records_can'),
        dict(tag='Option A', h='A second tap clears it', p='Tap the M6 row: it folds and the chip goes. Tap again: it opens and is selected.', hash='f6c.at=The_records_can', rec=True),
        dict(tag='Option B', h='A bigger chip only', p='As now, with a larger chip and cross that are easier to hit.', hash='f6h.at=The_records_can')]),
 dict(id='room', n='8', short='Room for the list', h='Giving the list more of the screen',
  found='The map and the top row take 330 points, so the list gets about half the screen, less in Safari (first review, U3).',
  ruling='round 3, answer 4 (the map always stays, floating) and round 7, answer 20 ("okay with the taller phase map").',
  rec='a handle you control. The map stays until you put it away, and nothing changes by itself.',
  opts=[dict(tag=NOW, h='The map always shows', p='The list starts 330 points down.', hash='now'),
        dict(tag='Option A', h='A handle to put the map away', p='Tap the grey handle at the band\'s foot: the map folds to one line with the phase and its milestones; tap again for the map.', hash='u3s', rec=True),
        dict(tag='Option B', h='Folds as you scroll down', p='Scroll down: the map folds to one line. Scroll up a little: it comes back.', hash='u3a')]),
]
LIST = [
 dict(id='links', n='9', short='Link labels', h='Telling the sessions apart',
  found='Every link tag says "Claude", though different sessions stand behind them; in the Context view, event rows have a dot where you asked for the number (first review, U5).',
  ruling='round 7, answer 4 ("the number and title plus the link") and its one link per row.',
  rec='the session on the tag, with numbers in the Context view. Every row keeps its own link, as you asked.',
  opts=[dict(tag=NOW, h='"Claude" on every tag', p='Scroll the list; then hold the round button for the Context view.', hash='now'),
        dict(tag='Option A', h='The session on the tag', p='Each tag names the session (CoS and the day it began). Hold the round button: the Context view does the same.', hash='u5n', rec=True),
        dict(tag='Option A, Context view', h='Numbers and sessions in the Context view', p='Every event row gets its number; every link names its session.', hash='u5n.cx'),
        dict(tag='Option B', h='One link for a run of rows', p='Rows in a row from the same session share one tag, with a thin bracket down their right edge and a count.', hash='u5b')]),
 dict(id='names', n='10', short='Milestone names', h='Milestone names cut to one line',
  found='Eight milestone names are cut at 393 and fifteen at 360; M7 shows less than half its name (first review, R1).',
  ruling='round 7, answers 9 and 14 (a label on each level; fourth numbers on their own line).',
  rec='the label on the small line above. The name gets the full width, the way fourth numbers already sit.',
  opts=[dict(tag=NOW, h='One line, cut', p='Starts at M7 in Build.', hash='now.at=Everything_the_agent'),
        dict(tag='Option A', h='The name wraps beside the label', p='Up to two lines, next to MILESTONE and its number.', hash='r1w.at=Everything_the_agent'),
        dict(tag='Option B', h='The label on a small line above', p='MILESTONE and its number above; the name below at full width, up to two lines.', hash='r1a.at=Everything_the_agent', rec=True)]),
 dict(id='zero', n='11', short='Empty rings', h='A ring with nothing on record',
  found='Milestones whose criteria are not on record show "0" in their ring, which reads as none met (first review, R2; the domain pack says an unknown is shown in words, never as zero).',
  ruling='round 7, answer 11 (the number small, no %); the size stays.',
  rec='a dashed empty ring. It reads as "not known yet", and the words beside it already say why.',
  opts=[dict(tag=NOW, h='"0" in the ring', p='Starts at Discovery 1.5.', hash='now.at=What_already_exists'),
        dict(tag='Option A', h='A dashed empty ring', p='No number; the track is dashed.', hash='r2d.at=What_already_exists', rec=True),
        dict(tag='Option B', h='A dash in the ring', p='"–" where the number was.', hash='r2m.at=What_already_exists')]),
 dict(id='time', n='12', short='Dates and time zone', h='Dates on older events, in Chicago time',
  found='Rows show a clock time with no date, in UTC, so "12:07" could be any day (first review, O3; the domain pack asks for America/Chicago).',
  ruling='none; this was left out of v33 by mistake.',
  rec='a date on anything older than today, every time in Chicago. You can tell yesterday from today at a glance.',
  opts=[dict(tag=NOW, h='Clock time, UTC', p='Scroll to S-010, which happened on 13 November.', hash='now'),
        dict(tag='Option A', h='A date when older, Chicago time', p='"6:07 am" for today; "13 Nov, 3:32 pm" for older ones. The mockup\'s today is 14 November.', hash='o3', rec=True)]),
]
R = lambda what: ('# Round 8 options: ' + what + '\n\nLive phones over mockup v33 for the owner\'s round 8, answer 5 ("If you can mockup each of the proposed changes I can give a ruling"). '
  '`phone.html` is v33 with `../options-r8/source/r8.css` and `r8.js`; each phone\'s hash picks one option and where it starts. Rebuild: `python3 ../options-r8/source/build.py && python3 ../options-r8/source/pages.py`.\n')
page('options-r8-top', 'Top Row and Motion', 'Top row, Why, and the push', TOP, R('the top row, Why, and the push (items 1 to 3)'))
page('options-r8-map', 'Map and Landing', 'Where the page lands, and the map', MAP, R('landing, the map and room for the list (items 4 to 8)'))
page('options-r8-list', 'List Labels and Times', 'Links, names, empty rings and times', LIST, R('links, names, rings and times (items 9 to 12)'))
print('ok')
