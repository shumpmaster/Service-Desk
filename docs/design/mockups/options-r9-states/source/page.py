# Writes ../index.html and ../README.md: a project with no plan, and the empty and can't-read states, options over v48
# (docs/design/audit-2026-11-27-v46-screens.md, section 3, candidate 3). Run build.py first (it writes ../phone.html). Usage: python3 page.py
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
REASON = ('The design reviewer put this third, because “three of five projects show a broken page today” '
          '(docs/design/audit-2026-11-27-v46-screens.md, section 4). The job: “Is this project really quiet, or can the desk not see it?”')
P_FOUND = ('operating model, Model-Lab and portfolio open in an older layout: a large title, project chips, “No plan on record for this project in the mockup”, '
           'a MAIN / BRANCH list, and “undefined” in every row’s state tag. No map card, no pills, no summary line. '
           'The cause: a later layer of the mockup (v30’s) reuses the name of the table of state words, so every row’s state word reads undefined.')
P_TOUCH = ('The design pack’s “Every project, not only Service-Desk”: “The desk shows every project run under the operating model, at any tier, in any phase” (governance/domains/design/README.md). '
           'Its checklist 5, No made-up figures, and 30, the three states (not used, not recorded yet, no record). '
           'R8 answer 28: plain words first, codes after in grey. Answers 31 and 32: the summary line at the head of the map card, opening About this project. '
           'R7 answer 8: “I actually want it from the top down”.')
P_REC = ('A. It is the same page as every other project, so nothing looks broken or different: you learn there is no plan from the one line and the pill, '
         'and the map still shows what the branches did. B drops the map, the one picture of the work; C says in a block what the pill and the line already say.')
P_REAL = ('No status file in the three repositories carries a phase (Model-Lab’s status/ holds only its README; the operating model and portfolio have none), so each says No phases yet. '
          'The events, branches and counts are from each repository’s history as of the mockup’s 14 Nov, 11:25 am: the operating model, 20 pull requests merged from 1 to 14 November and its 13 November '
          '(the spec-number fix, S-038, and pull requests #57 to #59); Model-Lab, 77 merged since 4 November (the copy read here starts then) and its six of 13 November; portfolio, 11 merged from 1 to 12 November. '
          'The purpose lines in the summary sheet are examples.')
S_FOUND = ('no empty or can’t-read state is drawn. Home always has things waiting; a project is shown as read, never as being read or unreadable; '
           'the only error states are the Late and Stopped banners behind More’s “preview the feed”; and every visit shows “new since you last looked” marks, with no first visit.')
S_TOUCH = ('The design pack’s checklist 4, Quiet is honest: “does the screen never say “Quiet” while a project is unread or can’t be read, showing “Checking…” or “Can’t read since HH:MM” instead?” '
           '(S-001 AC4, AC5; PROJECT.md intent, “Missed decisions”). R8 answers 24 and 26: home is a priority list of your actions. Checklist 5: an unknown is shown in words, never as a value or zero.')
S_REC = ('One way each; none had a real choice. Home with nothing waiting keeps its shape and says so in one calm line. Checking dims what was last read under a shimmer instead of blanking it. '
         'Can’t read says since when, what it means for you (something waiting might not show) and the two things to do, on home and on the page, and the project leaves the quiet fold.')
S_REAL = ('The words of these states, the 9:14 am time and the calm and first-open homes are examples: no record carries a read failure, a last-looked time or a welcome. '
          'The pages under them hold the real records above. Try again shows Checking…, then says what happened; the mockup sends nothing.')

Q = 'q='
OPTS1 = [ph('v48 as it is', 'A quiet project today', 'From home: Nothing waits on you in …, then operating model. The older layout, with “undefined” on every row.', Q + 'now.light'),
         ph('Option A', 'The project’s own page · light', 'Back, the project pill, “No phases yet”; the map card with the summary line (tap it) and a branch map of main and its branches; then what happened, top down, each with a real state word.', Q + 'A.light', True),
         ph('Option A', 'The same · dark', 'The same, in dark.', Q + 'A.dark', True),
         ph('Option A', 'The same · 360 wide', 'The same, on the narrowest phone.', Q + 'A.light', True, True),
         ph('Option B', 'A shorter page', 'No map: the summary line, one line saying why there are no phases, and What happened lately.', Q + 'B.light'),
         ph('Option C', 'A, with an empty plan block', 'A, with “No plan yet. When the AI team files one, its phases appear here.” at the head of the list.', Q + 'C.light')]
S = 's='
OPTS2 = [ph('Recommended', 'Home, nothing waiting · example', 'The priority list gives way to one calm line; the projects below, none marked waiting.', S + 'calm.light', True),
         ph('Recommended', 'A project being read', 'portfolio: “Checking portfolio…” in the summary line, a quiet shimmer over what was last read.', S + 'checking.light', True),
         ph('Recommended', 'A project the desk can’t read', 'Model-Lab: “Can’t read since 9:14 am” in the summary line, what it means, Try again and Open on GitHub.', S + 'cant.light', True),
         ph('Recommended', 'Its line on home', 'Model-Lab leaves “Nothing waits on you in …” and gets its own line, with the same two actions.', S + 'cant.home.light', True),
         ph('Recommended', 'The first open', 'No last-looked time yet: no “new since you last looked” marks, and a one-line welcome.', S + 'first.light', True)]

def sec(id_, title, found, touch, rec, real, opts):
    return ('<section class="item" id="' + id_ + '"><h2>' + E(title) + '</h2><div class="meta"><span><b>In v48:</b> ' + E(found) + '</span>'
            '<span><b>Touches:</b> ' + E(touch) + '</span><span><b>The records:</b> ' + E(real) + '</span></div>'
            '<div class="why">Recommended: ' + E(rec) + '</div><div class="phones">' + ''.join(phone2(o) for o in opts) + '</div></section>')
body = ('<title>No plan and empty states</title>\n' + CSS + '\n<main><div class="lede"><h1>A project with no plan, and the empty and can’t-read states</h1>'
        '<blockquote>' + E(OWNER) + '</blockquote><p>' + E(REASON) + '</p>'
        '<p>Two sets of screens, live: scroll and tap inside the phones. Back returns home; a quiet project on home opens the option its phone shows. '
        'The recommended ones have a blue edge.</p><nav class="toc"><a href="#noplan">1. A project with no plan</a><a href="#states">2. Empty and can’t-read</a></nav></div>'
        + sec('noplan', '1. A project with no plan', P_FOUND, P_TOUCH, P_REC, P_REAL, OPTS1)
        + sec('states', '2. The empty and can’t-read states', S_FOUND, S_TOUCH, S_REC, S_REAL, OPTS2) + '</main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)

readme = ('# Options: a project with no plan, and the empty and can’t-read states (round 9)\n\n'
  'The owner’s start prompt for round 9: ' + OWNER + '. ' + REASON + '\n\n'
  'Built over mockup v48 (`../timeline-v48-craft.html`). `source/build.py` writes `phone.html` (v48 with `source/st.css` and `source/st.js`; the option set by the phone\'s hash, `.light` or `.dark` fixing the theme); '
  '`source/page.py` writes `index.html` and this file with the round 8 options pages\' stylesheet.\n\n'
  '| Phone | Hash | What it shows |\n|---|---|---|\n'
  '| v48 | `q=now.light` | a quiet project in the older layout, “undefined” on every row |\n'
  '| A (recommended) | `q=A.light`, `q=A.dark`, 360 wide | the project’s own page: top row with No phases yet, the map card with the summary line and a branch map, the list top down |\n'
  '| B | `q=B.light` | no map: the summary line, one line of why, the list |\n'
  '| C | `q=C.light` | A with an empty plan block |\n'
  '| Home, nothing waiting | `s=calm.light` | one calm line in place of the priority list (example) |\n'
  '| Being read | `s=checking.light` | portfolio, Checking…, a shimmer |\n'
  '| Can’t read | `s=cant.light`, `s=cant.home.light` | Model-Lab, Can’t read since 9:14 am, Try again, Open on GitHub; and its own line on home |\n'
  '| First open | `s=first.light` | no new-since marks, a one-line welcome |\n\n'
  'Hash words: `q=now|A|B|C` the page; `om`, `ml` or `pf` the project it opens on (operating model by default); `s=calm|checking|cant|first` the state; `home` (with `s=cant`) home’s line. '
  'With any option or state, a quiet project tapped on home opens that option’s page (A for the states).\n\n'
  'The records: ' + P_REAL + ' ' + S_REAL + '\n\n'
  'Touches. The page: ' + P_TOUCH + ' The states: ' + S_TOUCH + '\n\n'
  'In v48, a quiet project: ' + P_FOUND + ' The states: ' + S_FOUND + '\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
