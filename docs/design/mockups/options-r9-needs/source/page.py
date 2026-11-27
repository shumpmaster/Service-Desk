# Writes ../index.html and ../README.md: the Needs-you tab, options over v47 (round 9; docs/design/audit-2026-11-27-v46-screens.md, section 3, candidate 1).
# Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
CSS = _ns['CSS']; phone = _ns['phone']
E = html.escape
def ph(tag, h, p, hash, rec=False): return dict(tag=tag, h=h, p=E(p), hash=hash, rec=rec)
FOUND = ('Tapping the Needs-you tab opens an older-style sheet for the first waiting thing only (“S-011 failed three plan reviews”, Around it, Record, Open on GitHub). '
         'It is not the choices sheet home uses and not a list; nothing shows what you already answered, and the tab has no count.')
TOUCHES = ('P-001 design discovery, answer 4: “I want them bucketed by project”, set aside for home by round 8, answer 24 (one priority list of your actions); B brings it back here as a switch. '
           'P-001 board layout: three lanes on the phone (Waiting on you, Kicked back, Done); C keeps lanes. Also P-001 home tab (Waiting keeps its badge), board bounce (about 5 minutes, then a lane of its own), '
           'board done keep (the last 24 hours) and trial-view notes 1 (done rows say what was ruled, the code after it).')
REC = 'A. One list read top down answers both questions at once, what is mine and what did I decide, with the same rows and order as home, so nothing has to be learned twice.'
NOW = 'v47 as it is'
OPTS = [ph(NOW, 'The tab tapped · light', 'The leftover sheet, for the first waiting thing only.', 'now.light'),
        ph(NOW, 'The tab tapped · dark', 'The same, in dark.', 'now.dark'),
        ph('Option A', 'One list · light', 'Waiting on you (home’s rows, in home’s order), Sent, Kicked back, one line for the AI team, then Answered: the last 24 hours open, Earlier folded. Tap an answered row to read it. Desk returns home.', 'A.light', True),
        ph('Option A', 'One list · dark', 'The same, in dark.', 'A.dark', True),
        ph('Option B', 'A with a switch: By project', 'In order | By project. Shown switched to By project: the same rows under each project’s name.', 'B.light.by'),
        ph('Option C', 'The board’s three lanes', 'Yours | With the team | Done, each a list. Tap a lane.', 'C.light')]
KINDS = [ph('Inside A', 'A question', 'Its own answer box: the choices, the recommendation marked but not picked, and your own words.', 'A.light.kinds.sheet=q'),
         ph('Inside A', 'A pull request to merge', 'Merge or Not yet, each saying what follows.', 'A.light.kinds.sheet=pr'),
         ph('Inside A', 'A deploy to approve', 'Approve or Hold, each saying what follows.', 'A.light.kinds.sheet=deploy'),
         ph('Inside A', 'Start the next session', 'The session’s name, why it handed over, the handover’s opening, and the button.', 'A.light.kinds.sheet=session')]
body = ('<title>Needs you, the tab</title>\n' + CSS + '\n<main><div class="lede"><h1>Needs you, the tab</h1>'
        '<blockquote>“Okay the last thing I want is a fable 5.2 review designed to identify any other screens or pages that might be beneficial to add then put it into the handoff” (round 8, answer 33)</blockquote>'
        '<p>The review ranked this tab first. This session’s start: “take up the open items one at a time with pictures, starting with the screens the desk lacks”. '
        'v47 as it is comes first, then three ways to draw the tab, live: scroll and tap inside the phones. The recommended one has a blue edge. '
        'The waiting rows are home’s list itself. The answered rows are your real rulings of 12 to 14 November, the mockup’s own days, in Chicago time. Everything else is an example and is marked so.</p></div>'
        '<section class="item" id="needs"><h2>The Needs-you tab</h2><div class="meta"><span><b>In v47:</b> ' + E(FOUND) + '</span>'
        '<span><b>Touches:</b> ' + E(TOUCHES) + '</span></div>'
        '<div class="why">Recommended: ' + E(REC) + '</div><div class="phones">' + ''.join(phone(o) for o in OPTS) + '</div></section>'
        '<section class="item" id="kinds"><h2>The other kinds of ask, drawn once</h2><div class="meta"><span><b>In v47:</b> ' + E('Sheets exist for a stop, a readiness card and a gate. None for a question, a pull request, a deploy or starting the next session.') + '</span>'
        '<span><b>How:</b> ' + E('In option A, four example rows join the waiting list, each opening its sheet. Every choice says what follows; a tap adds “The mockup sends nothing”.') + '</span></div>'
        '<div class="phones">' + ''.join(phone(o) for o in KINDS) + '</div></section></main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)
readme = ('# Options: the Needs-you tab (round 9)\n\n'
  'Built over mockup v47 (`../timeline-v47-craft.html`), from the advisory review `docs/design/audit-2026-11-27-v46-screens.md`, section 3, candidate 1. '
  '`source/build.py` writes `phone.html` (v47 with `source/ny.css` and `source/ny.js`; the option set by the phone\'s hash, `.light` or `.dark` fixing the theme); '
  '`source/page.py` writes `index.html` with the round 8 options pages\' stylesheet.\n\n'
  '| Phone | Hash | What it shows |\n|---|---|---|\n'
  '| v47 | `now.light`, `now.dark` | the tab tapped: the leftover sheet for the first waiting thing |\n'
  '| A (recommended) | `A.light`, `A.dark` | one list: Waiting on you, Sent, Kicked back, With the AI team: 1, Answered (24 hours open, Earlier folded) |\n'
  '| B | `B.light.by` | A with an In order / By project switch, shown By project |\n'
  '| C | `C.light` | Yours / With the team / Done as a segmented control |\n'
  '| Sheets | `A.light.kinds.sheet=q`, `=pr`, `=deploy`, `=session` | A with four example rows, one sheet open |\n\n'
  'Other hash words: `kinds` adds the four example rows; `home` stays on home with the tab untapped. In A, B and C the tab is a view of its own inside the page, its icon lit and its badge the waiting count; Desk returns home where it was.\n\n'
  'Records behind it: the waiting rows are home\'s priority list, cloned as it stands. The answered rows are the owner\'s rulings in decisions/questions/P-005-s011-widths.md, P-005-s011-m8-reading.md, P-005-definer-pack.md (14 Nov, 8:47 am), '
  'decisions/P-005/stop-4.md, decisions/questions/P-005-model-3.7.3.md, P-005-critic-pack.md (13 Nov, 10:58 pm), and decisions/P-005/dor-3.md, dor-2.md, dor-fail-1.md (folded under Earlier). '
  'With the AI team: 1 is the mockup\'s own at-work session (its name an example since v44).\n\n'
  'Examples, marked so: the Sent and Kicked-back rows, the four other kinds of ask and their sheets, the session name. ' + FOUND + '\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
