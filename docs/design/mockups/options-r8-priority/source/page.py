# Writes ../index.html and ../README.md: home as a priority list of the owner's actions (round 8, answer 24), options over v41.
# Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
CSS = _ns['CSS']; phone = _ns['phone']
E = html.escape
def ph(tag, h, p, hash, rec=False): return dict(tag=tag, h=h, p=E(p), hash=hash, rec=rec)
RULE = ('Priority is set from what the records carry, in this order: 1, what it holds up (a whole phase first, then the most milestones); '
        '2, a gate or a stop before a question, since a stop halts the work until you answer; 3, the longest wait. '
        'So: the widget\'s readiness check (holds up the Discovery phase, 9 days), then Stop card 5 (3 milestones, a stop), '
        'then the three questions of PR #446 by how many milestones each holds up (3, 2, 1).')
ITEMS = [
 dict(id='list', h='Home as a priority list of your actions',
  found='In v41 home groups what waits on you by project (round 4, answer 11), the longest wait first (answer 12), each project\'s waiting rows inside its glass card. Five things wait across two projects, so the order you should act in is spread over two cards and not said anywhere.',
  ruling='All three set aside round 4 answer 11 (grouped by project) for the waiting rows: the projects stay, below the list, with their strip and their line (round 8, answer 19), and the waiting rows leave them. Round 4 answer 12 (longest wait first) becomes the third key of the order, after what it holds up. Each row keeps its event line (round 8, answer 22). No old project cards come back (round 4, answer 7): B\'s larger card holds an action, not a project.',
  rec='A. One numbered list across projects, each row saying why it sits where it does ("Holds up the Discovery phase · waiting 9 days"), with Answer and Go to it on every row: it is the priority list you asked for, read top to bottom, and the projects follow it.',
  opts=[ph('v41 as it is', 'Grouped by project', 'What waits sits inside each project\'s card; the order across projects is not said.', 'light'),
        ph('v41 as it is', 'Dark', '', 'dark'),
        ph('Option A', 'One priority list', 'Every action you are needed on, numbered 1 to 5 across projects. Each row: its project, the event behind it, the question, why it ranks there, and how long it has waited. Answer opens the card; Go to it opens the project on it.', 'p=A.light', True),
        ph('Option A', 'Scrolled: the projects below', 'Each project keeps its strip and its at-work line, now without its waiting rows. The quiet projects fold as before.', 'p=A.light.y=640', True),
        ph('Option A', 'Dark', '', 'p=A.dark', True),
        ph('Option B', 'Do this first, then the rest', 'The top action as a larger glass card that says why it is first; the other four as a compact ranked list under "Then".', 'p=B.light'),
        ph('Option B', 'Dark', '', 'p=B.dark'),
        ph('Option C', 'Tiers', 'Blocking work (holds up a phase), Answer soon (holds up milestones), When you can (holds up nothing): each a ranked list across projects, numbered throughout. Today the last tier is empty.', 'p=C.light'),
        ph('Option C', 'Dark', '', 'p=C.dark')]),
]
def item(it):
    return ('<section class="item" id="' + it['id'] + '"><h2>' + E(it['h']) + '</h2><div class="meta"><span><b>In v41:</b> ' + E(it['found']) + '</span>'
            '<span><b>How it is ordered:</b> ' + E(RULE) + '</span>'
            '<span><b>Touches:</b> ' + E(it['ruling']) + '</span>'
            '<span><b>Not in the records:</b> no record ranks your actions, gives a due date or says how long an answer takes; the order is worked out from what each holds up, its kind and its wait. The widget\'s "holds up the Discovery phase" comes from its gate, not a list of milestones. Answer opens the card as home does today; answering from the desk is still an example (docs/design/requests/2026-11-26-timeline-records.md).</span></div>'
            '<div class="why">Recommended: ' + E(it['rec']) + '</div>'
            '<div class="phones">' + ''.join(phone(o) for o in it['opts']) + '</div></section>')
body = ('<title>Home priority list</title>\n' + CSS + '\n<main><div class="lede"><h1>Home as a priority list of your actions</h1>'
        '<p>What you said: “I need the structure to be aimed at events that I’m needed on. Like a priority list for my actions” (round 8, answer 24). '
        'Each option is drawn on v41, live: scroll and tap inside the phones. v41 as it is comes first, then the options, with the recommended one edged in blue.</p></div>'
        + ''.join(item(it) for it in ITEMS) + '</main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)
readme = ('# Options: home as a priority list of the owner\'s actions (round 8, answer 24)\n\n'
  'Built over mockup v41 (`../timeline-v41-craft.html`). `source/build.py` writes `phone.html` (v41 with `source/pr.css` and `source/pr.js`, each option switched on by the phone\'s hash: `p=A|B|C`, `y=<px>`, `light` or `dark`); `source/page.py` writes `index.html`, using the round 8 options pages\' stylesheet (`../options-r8/source/pages.py`).\n\n'
  '## How the order is set\n\n' + RULE + '\n\nNot in the records: no record ranks the owner\'s actions, gives a due date or says how long an answer takes. The widget\'s phase comes from its gate (its `feeds` is empty).\n\n'
  + ''.join('## ' + it['h'] + '\n\n- In v41: ' + it['found'] + '\n- Touches: ' + it['ruling'] + '\n- Recommended: ' + it['rec'] + '\n- Phones: ' + '; '.join(o['tag'] + ', ' + o['h'] + ' (`#' + o['hash'] + '`)' for o in it['opts']) + '\n\n' for it in ITEMS)
  + '## Checks\n\nAt 393 and 360, light and dark: no console errors, no sideways scroll, order 4, 0, 3, 1, 2 (NEEDS indexes) in every option. Answer opens the waiting card; Go to it opens the project. Contrast of the new text on the glass, lowest: light 6.18 (event line), dark 5.37 (event line); the reasons 10.8 or more.\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
