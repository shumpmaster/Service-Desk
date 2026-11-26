# Writes ../index.html and ../README.md: a quick filter for the branch map, and home (round 8, answer 16), options over v38.
# Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
CSS = _ns['CSS']; phone = _ns['phone']
E = html.escape
def ph(tag, h, p, hash, rec=False): return dict(tag=tag, h=h, p=E(p), hash=hash, rec=rec)
ITEMS = [
 dict(id='filter', h='1. A quick filter for the branch map',
  found='In v38 the map shows every event of the phase, and the list every row, with no way to narrow them. What you most often look for, what waits on you and the turning points, sits among routine commits and reviews.',
  ruling='None is removed or moved. A adds one small control on the map card; B adds a row under it (40 points of the band, which you asked to keep slim: round 7 answers 21 and 22, round 8 answer 6, item 8); C makes the lane names tappable. In every option the filter also quiets the list, so the pointer and the map\'s arrow carry on as ruled (round 7 answer 8; round 8 answer 6, items 4 and 5).',
  rec='A. A filter button on the map card: one tap, no room taken, six useful cuts (Everything, Yours, Turning points, Reviews and checks, Research, Main only) each with its count, and the list quiets with the map.',
  opts=[ph('v38 as it is', 'No filter', 'Every event on the map and every row in the list.', 'light'),
        ph('Option A', 'A filter button on the card', 'A small glass button in the card\'s top corner. The right gate\'s caption steps down to make room.', 'f=A.light', True),
        ph('Option A', 'Its panel open', 'Tap it: six cuts, each with how many events it keeps. Tap one and the panel closes.', 'f=A.light.open', True),
        ph('Option A', 'Showing Yours', 'What is left out goes faint on the map and quiet in the list. The button names the filter; its cross shows everything again.', 'f=A.light.pick=you', True),
        ph('Option A', 'Turning points, dark', 'Stops, decisions, merges, gates and what waits on you.', 'f=A.dark.pick=turn', True),
        ph('Option B', 'A segmented row under the card', 'Always in view: All, Yours, Turning points, Main. It costs the band 40 points.', 'f=B.light'),
        ph('Option B', 'Turning points chosen', 'The same dimming as A.', 'f=B.light.pick=turn'),
        ph('Option B', 'Dark', 'Yours chosen.', 'f=B.dark.pick=you'),
        ph('Option C', 'Tap a lane\'s name', 'Each lane\'s name is underlined and can be tapped. Nothing else changes until you do.', 'f=C.light'),
        ph('Option C', 'One sprint alone', 'Tap 2.2.2 S-011: only its events stay bright, on the map and in the list; a chip clears it. It cuts by sprint only, not by kind.', 'f=C.light.solo=2-2-2'),
        ph('Option C', 'Dark', 'The same, in dark.', 'f=C.dark.solo=2-2-2')]),
 dict(id='title', h='2. Home: the title',
  found='In v38 home\'s title is a small "Timeline" with its live line at the top left of the floating bar, the bell and More at the right, the same slim bar a project page uses (round 6, answers 1 and 4). It reads like a label, not the start of the page.',
  ruling='A and B: the slim floating bar of round 6 answers 1 and 4 appears once you scroll; at the top it is clear and a large title starts the page. B also moves round 4 answer 11\'s sentence into the heading. C keeps the bar as ruled and only centres the title.',
  rec='A. A large title that folds into the bar: it is how iPhone apps start a page, it gives home a clear top, and once you scroll it becomes the slim floating bar you ruled.',
  opts=[ph('v38 as it is', 'The small title in the bar', 'Home as it is.', 'light.home'),
        ph('v38 as it is', 'Dark', '', 'dark.home'),
        ph('Option A', 'A large title', '"Timeline" at 34 with the live line under it; the bar above is clear.', 't=A.light.home', True),
        ph('Option A', 'Scrolled', 'Once the large title goes under the bar, the bar takes its glass and a small centred title.', 't=A.light.home.y=300', True),
        ph('Option A', 'Dark', '', 't=A.dark.home', True),
        ph('Option B', 'The sentence as the heading', '"5 things wait on you" becomes the heading, "Timeline · live" a small line above it.', 't=B.light.home'),
        ph('Option B', 'Dark', '', 't=B.dark.home'),
        ph('Option C', 'A centred small title', 'The bar as it is, with the title centred.', 't=C.light.home')]),
 dict(id='search', h='3. Home: the search',
  found='In v38 a full-width search field sits under the bar, 44 high, above what waits on you. It is used now and then, but it takes the first row of the page.',
  ruling='None. The bar keeps its height (round 7 answers 21 and 22 apply to a project page; home\'s bar is the same slim bar).',
  rec='A. A magnifier in the capsule beside the bell: always one tap away, it opens a field over the bar, and the row it frees goes back to what waits on you.',
  opts=[ph('Option A', 'A magnifier in the capsule', 'With the large title of 2A.', 't=A.s=A.light.home', True),
        ph('Option A', 'Opened', 'The field opens over the bar, with Cancel.', 't=A.s=A.sopen.light.home', True),
        ph('Option B', 'Pulled down from the top', 'The field sits above the title, hidden under the bar until you pull the page down, as iPhone lists do. Nothing shows it is there.', 't=A.s=B.light.home'),
        ph('Option B', 'Pulled down', '', 't=A.s=B.light.home.pulled')]),
 dict(id='more', h='4. Home: can more be done?',
  found='Home groups what waits on you by project, says what each answer holds up, shows a slim strip of what mattered, and folds the quiet projects (round 4, answers 7 to 12). It does not say whether anyone is at work, or what changed since you last looked, without opening each project.',
  ruling='B adds one line under each project\'s strip (round 4 answer 12); C adds a card above the groups, where round 4 answer 7 took the old project cards away. "No" is a fair answer.',
  rec='B. One quiet line per project, who is at work and how much is new since you last looked: the two things home cannot tell you today, and they decide which project you open first. A, nothing more, is also sound: home already does its one job well.',
  opts=[ph('Option A', 'Nothing more', 'Home as 2A and 3A leave it: what waits, by project.', 't=A.s=A.light.home'),
        ph('Option B', 'A line per project', '"Chief of Staff at work since 7:52 am · 9 new"; "Nothing at work · it waits on you · nothing new". At work and new since are examples until the records carry them (docs/design/requests/2026-11-26-timeline-records.md).', 't=A.s=A.m=B.light.home', True),
        ph('Option B', 'Dark', '', 't=A.s=A.m=B.dark.home', True),
        ph('Option C', 'The week in one card', 'Merges, reviews, stops and gates this week, and how long things waited. An example: the desk keeps no week\'s tally.', 't=A.s=A.m=C.light.home')]),
 dict(id='together', h='Together: every recommendation',
  found='Filter A, title A, search A and more B on v38.',
  ruling='As each item above.',
  rec='Shown together so you can see them as one page.',
  opts=[ph('Together', 'Home', '', 't=A.s=A.m=B.f=A.light.home', True),
        ph('Together', 'Home, dark', '', 't=A.s=A.m=B.f=A.dark.home', True),
        ph('Together', 'A project, filtered to Yours', '', 't=A.s=A.m=B.f=A.light.pick=you', True)]),
]
def item(it):
    return ('<section class="item" id="' + it['id'] + '"><h2>' + E(it['h']) + '</h2><div class="meta"><span><b>In v38:</b> ' + E(it['found']) + '</span>'
            '<span><b>Touches:</b> ' + E(it['ruling']) + '</span></div><div class="why">Recommended: ' + E(it['rec']) + '</div>'
            '<div class="phones">' + ''.join(phone(o) for o in it['opts']) + '</div></section>')
toc = '<nav class="toc">' + ''.join('<a href="#' + it['id'] + '">' + E(it['h'].split('. ', 1)[-1]) + '</a>' for it in ITEMS) + '</nav>'
body = ('<title>Map filter and home</title>\n' + CSS + '\n<main><div class="lede"><h1>A quick filter for the map, and home</h1>'
        '<p>What you said: “Can you add a quick filtering option for the branch?” and “I want to take a look at the home page. I don’t really like how the title sits. Or that search bar. I’m also wondering if more can be done with the home page? No is an acceptable recommendation as well” (round 8, answer 16). '
        'Each option is drawn on v38, live: scroll and tap inside the phones. v38 as it is comes first, then the options, with the recommended one edged in blue.</p>' + toc + '</div>'
        + ''.join(item(it) for it in ITEMS) + '</main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)
readme = ('# Options: a quick filter for the branch map, and home (round 8, answer 16)\n\n'
  'Built over mockup v38 (`../timeline-v38-craft.html`). `source/build.py` writes `phone.html` (v38 with `source/fh.css` and `source/fh.js`, each option switched on by the phone\'s hash; see the head of `fh.js`); `source/page.py` writes `index.html`, using the round 8 options pages\' stylesheet (`../options-r8/source/pages.py`).\n\n'
  + ''.join('## ' + it['h'] + '\n\n- In v38: ' + it['found'] + '\n- Touches: ' + it['ruling'] + '\n- Recommended: ' + it['rec'] + '\n- Phones: ' + '; '.join(o['tag'] + ', ' + o['h'] + ' (`#' + o['hash'] + '`)' for o in it['opts']) + '\n\n' for it in ITEMS)
  + '## What the filter matches\n\nYours: what waits on you and what is marked Yours. Turning points: stops, decisions, merges and gates, and what waits on you. Reviews and checks. Research. Main only: merges. What is left out goes to 14% on the map and 32% in the list; headings stay. C keeps a sprint\'s events by the list\'s numbers (2.2.2.x), so a commit the map draws as nothing still counts.\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
