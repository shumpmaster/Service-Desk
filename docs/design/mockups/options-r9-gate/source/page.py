# Writes ../index.html and ../README.md: a gate open for your ruling, and a reader for any record, options over v48
# (docs/design/audit-2026-11-27-v46-screens.md, section 3, candidate 2). Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
CSS = _ns['CSS'].replace('</style>', '.phone.w360 { max-width:362px; } .phone.w360 iframe { width:360px; }\n</style>'); phone = _ns['phone']
E = html.escape
def ph(tag, h, p, hash, rec=False, w360=False): return dict(tag=tag, h=h, p=E(p), hash=hash, rec=rec, w360=w360)
def phone2(o):
    s = phone(o)
    return s.replace('<div class="phone">', '<div class="phone w360">') if o['w360'] else s

OWNER = '“take up the open items one at a time with pictures, starting with the screens the desk lacks” (your round 9 start prompt, docs/handoff/2026-11-27-chief-of-staff-p005-19.md)'
REASON = ('The design reviewer put this second: “the highest-stakes action is undrawn, and every sheet’s records become readable with one template” '
          '(docs/design/audit-2026-11-27-v46-screens.md, section 4).')
G_FOUND = ('the timeline’s gates show only as passed (the Design gate: what it decided, your two rulings, what it checked) or not reached (Build, Launch: what each will decide, the four choices greyed). '
           'No gate is drawn open for your ruling, so nothing shows the case, the Critic’s view or the user representative beside the choices you would tap.')
G_TOUCH = ('P-001-gate-card, A: “It shows the gate case’s opening, the Critic’s view and, where one runs, the user representative’s verdict, with your choices as buttons.” '
           'P-001-gate-buttons, A: choices as buttons on the card and in its sheet; “a tap only opens a filled-in answer you still save on GitHub”. '
           'Gates are never answered by proxy (L-0049). OPERATING_MODEL §4: proceed, hold, recycle, kill (“the project closes”).')
G_REC = ('A. It is the card you already chose in P-001-gate-card, in the sheet every other ask uses: the ask, then the case’s opening, the Critic, the user representative and the four choices on one scroll, '
         'with the whole case one tap away. B buries the choices under a long page; C makes you open three things before you know what the Critic said.')
G_REAL = ('The gate drawn open is the timeline’s real Design gate as it stood on 13 November, after case 2 and before you said proceed: its words are from docs/gates/P-005/design-gate-2-case.md, '
          'the Chief of Staff’s notes on it (decisions/P-005/dor-3-notes.md, which quote the gate Critic’s verdict) and the project document (section 9: “The owner is the user.”, so the user representative is not needed). '
          'Its open state, its row 1 on home and its waiting time are examples and say so: today no gate is open.')
R_FOUND = ('every sheet ends with a Records line in grey: file paths, several to a line, that cannot be tapped. '
           'The gate case, the stop card, the memo, a ruling or a handover cannot be read from the phone; v48’s pull-request sheet alone opens a run or a review record, with “‹ The pull request” to come back.')
R_TOUCH = ('R8 answer 11: “Honestly I would want them to be so clear and descriptive that I could hand someone my phone and let them see exactly what’s going on.” '
           'AGENTS.md §4, Plain English first: every record written for you opens with one plain paragraph (in a gate case, the ask); the reader shows it first. '
           'P-001-design-lab-open, answer 9: asked “The gate document: shown inside the desk too, or only linked on GitHub?”, you answered “Linked”. Both readers show it inside the desk, with Open on GitHub at the foot, so they need your word to set that answer aside.')
R_REC = ('A. One template for every record, opened the same way from every Records line, with the plain paragraph first and big enough to read standing up, and ‹ back to exactly where you were. '
         'B keeps the sheet in view, but two stacked sheets leave the record half a screen to read in.')
R_REAL = ('The readers hold real records, trimmed, with codes after the words in grey: the gate case (case 2), the Chief of Staff’s notes on it, the stop card’s notes (decisions/P-005/stop-5-notes.md), '
          'the research memo Q-028 (research/Q-028-memo.md, which has no plain paragraph of its own, so its Summary goes first and says so), a ruling (decisions/questions/P-005-s011-widths.md), '
          'a handover (docs/handoff/2026-11-14-chief-of-staff-p005-11.md), ledger L-0008 and the model’s Phase gates. Any other record opens a short reader that says the mockup holds only its name. '
          'The handover line on the At-work sheet’s Records is added here (the last handover before that session).')

G = 'g='
OPTS1 = [ph('v48 as it is', 'The gate sheet today', 'The Design gate, passed: what it decided, your two rulings, what it checked. Records as plain text. No gate is drawn open.', G + 'now.light'),
         ph('Option A', 'The sheet, open · light', 'The ask in one paragraph; the case’s opening, faded, and Read the whole case; the Critic; the user representative; each choice with what follows, Kill marked Can’t be undone; Records you can tap.', G + 'A.light', True),
         ph('Option A', 'The sheet, open · dark', 'The same, in dark.', G + 'A.dark', True),
         ph('Option A', 'The sheet, open · 360 wide', 'The same, on the narrowest phone.', G + 'A.light', True, True),
         ph('Option A', 'On the list', 'The gate row marked Yours · open in the wait colour, under the map; tap it for the sheet.', G + 'A.list.light'),
         ph('Option A', 'On home, as row 1 · example', 'The gate first in your list, with its four choices as buttons (P-001-gate-buttons) and Read the case and rule. No gate is open today.', G + 'A.home.light'),
         ph('Option B', 'A full page', 'Pushed from the right like a project’s page: the ask, the Critic, the user representative, then the whole case; the four choices pinned at the foot. Tap a choice to see what follows.', G + 'B.light'),
         ph('Option C', 'A short sheet', 'The ask and the choices only, and one row per piece of evidence (the case, the Critic, the user representative), each opening the reader.', G + 'C.light')]
R = 'rd='
OPTS2 = [ph('v48 as it is', 'A Records line today', 'The research sheet, scrolled to its foot: three lines of file paths, none of which opens.', R + 'now.light'),
         ph('Option A', 'A reader page · the gate case', 'From Read the whole case: kind, plain title, the file in grey, the ask first in larger text, then each section; Open on GitHub at the foot; ‹ Design gate returns to the sheet.', R + 'A.case.light', True),
         ph('Option A', 'A reader page · a handover', 'From the At-work sheet’s Records: “What this means for you” first, then Done, Who does what, Next and Faults.', R + 'A.ho.light', True),
         ph('Option A', 'The gate case · dark', 'The same reader, in dark.', R + 'A.case.dark', True),
         ph('Option A', 'The handover · 360 wide', 'The same reader, on the narrowest phone.', R + 'A.ho.light', True, True),
         ph('Option B', 'A sheet over the sheet', 'The record opens over the gate sheet, which steps back; it stops at the first paragraph.', R + 'B.case.light'),
         ph('Option B', 'Swiped up', 'Swipe up (or tap) for the rest: the sheet grows to nearly the full screen.', R + 'B.case.up.light')]

def sec(id_, title, found, touch, rec, real, opts):
    return ('<section class="item" id="' + id_ + '"><h2>' + E(title) + '</h2><div class="meta"><span><b>In v48:</b> ' + E(found) + '</span>'
            '<span><b>Touches:</b> ' + E(touch) + '</span><span><b>The records:</b> ' + E(real) + '</span></div>'
            '<div class="why">Recommended: ' + E(rec) + '</div><div class="phones">' + ''.join(phone2(o) for o in opts) + '</div></section>')
body = ('<title>Gate and reader</title>\n' + CSS + '\n<main><div class="lede"><h1>A gate open for your ruling, and a reader for any record</h1>'
        '<blockquote>' + E(OWNER) + '</blockquote><p>' + E(REASON) + '</p>'
        '<p>Two screens the desk lacks, each drawn as v48 as it is and then its options, live: scroll and tap inside the phones. A tap on a choice says what would happen; the mockup sends nothing. '
        'The recommended ones have a blue edge.</p><nav class="toc"><a href="#gate">1. The gate, open</a><a href="#reader">2. The reader</a></nav></div>'
        + sec('gate', '1. A gate open for your ruling', G_FOUND, G_TOUCH, G_REC, G_REAL, OPTS1)
        + sec('reader', '2. A reader for any record', R_FOUND, R_TOUCH, R_REC, R_REAL, OPTS2) + '</main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)

readme = ('# Options: a gate open for your ruling, and a reader for any record (round 9)\n\n'
  'The owner’s start prompt for round 9: ' + OWNER + '. ' + REASON + '\n\n'
  'Built over mockup v48 (`../timeline-v48-craft.html`). `source/build.py` writes `phone.html` (v48 with `source/gr.css` and `source/gr.js`; the option set by the phone\'s hash, `.light` or `.dark` fixing the theme); '
  '`source/page.py` writes `index.html` and this file with the round 8 options pages\' stylesheet.\n\n'
  '| Phone | Hash | What it shows |\n|---|---|---|\n'
  '| v48, gate | `g=now.light` | the passed Design gate’s sheet; Records as plain text |\n'
  '| A (recommended) | `g=A.light`, `g=A.dark`, 360 wide | the gate sheet open: the ask, the case’s opening (Read the whole case), the Critic, the user representative, four choices with what follows (Kill: Can’t be undone), Records rows |\n'
  '| A on the list | `g=A.list.light` | the gate row Yours · open, in the wait colour |\n'
  '| A on home | `g=A.home.light` | the gate as row 1 (example), its choices as buttons |\n'
  '| B | `g=B.light` | a full page from the right, the case inline, the choices pinned at the foot |\n'
  '| C | `g=C.light` | a short sheet: the ask, three evidence rows, the choices |\n'
  '| v48, reader | `rd=now.light` | the research sheet’s Records line, plain text |\n'
  '| A (recommended) | `rd=A.case.light`, `rd=A.ho.light`, `rd=A.case.dark`, 360 wide | a reader page: kind, title, file, the opening first and larger, sections, Open on GitHub, ‹ back |\n'
  '| B | `rd=B.case.light`, `rd=B.case.up.light` | the reader as a sheet over the sheet, opening at the first paragraph; swiped up |\n\n'
  'Hash words: `g=now|A|B|C` the gate; `list`, `home` where the open gate shows; `rd=now|A|B` the reader; `case` or `ho` the record; `up` the stacked sheet swiped up. '
  'With any option, every Records line in every sheet becomes one row per record, its plain name first and its file in grey, opening the reader.\n\n'
  'The gate: ' + G_REAL + '\n\n'
  'The readers: ' + R_REAL + '\n\n'
  'Touches. The gate: ' + G_TOUCH + ' The reader: ' + R_TOUCH + '\n\n'
  'In v48, the gate: ' + G_FOUND + ' The reader: ' + R_FOUND + '\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
