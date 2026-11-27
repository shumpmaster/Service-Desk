# Writes ../index.html and ../README.md: a lighter background, options over v46 (round 9, answer 1).
# Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
CSS = _ns['CSS']; phone = _ns['phone']
E = html.escape
def ph(tag, h, p, hash, rec=False): return dict(tag=tag, h=h, p=E(p), hash=hash, rec=rec)
FOUND = ('In v46, in light, the ground is a pale grey (#f2f3f7) under three soft colour fields, blue at the top left, lavender at the right and a touch of mint at the foot. '
         'v42 made the fields stronger (blue 22%, lavender 21%, mint 15%) so the glass had colour to catch. Dark is not changed by any option.')
REC = 'C. A little of each keeps the colour you asked for in round 8 and the glass still has something to catch, while the whole screen reads a step brighter. A alone keeps the colour as strong as now on a whiter base; B alone keeps the grey and fades the colour.'
OPTS = [ph('v46 as it is', 'Now · home', 'Home as it is today.', 'now.light.home'),
        ph('v46 as it is', 'Now · project', 'The project page as it opens.', 'now.light'),
        ph('Option A', 'A lighter base · home', 'The grey under the colour one step lighter (#f7f8fb); the colour fields as they are.', 'A.light.home'),
        ph('Option A', 'A lighter base · project', 'The same, on the project page.', 'A.light'),
        ph('Option B', 'Softer colour · home', 'The grey as it is; the colour fields about a third softer (blue 15%, lavender 14%, mint 10%), close to v38 before v42 strengthened them.', 'B.light.home'),
        ph('Option B', 'Softer colour · project', 'The same, on the project page.', 'B.light'),
        ph('Option C', 'A little of each · home', 'The grey a half step lighter (#f6f7fa) and the colour a little softer (blue 18%, lavender 17%, mint 12%).', 'C.light.home', True),
        ph('Option C', 'A little of each · project', 'The same, on the project page.', 'C.light', True),
        ph('Option D', 'Lighter still · home', 'For range: the grey near white (#fafbfd) and the colour about half (blue 12%, lavender 11%, mint 8%). The glass has less to catch here.', 'D.light.home'),
        ph('Option D', 'Lighter still · project', 'The same, on the project page.', 'D.light')]
body = ('<title>A lighter background</title>\n' + CSS + '\n<main><div class="lede"><h1>A lighter background</h1>'
        '<p>What you said: “It looks great so far, maybe just lighten the background up a tad?” (round 9, answer 1). '
        'v46 as it is comes first, then four ways to lighten it, the last a step further for range, each on home and on a project’s page, live: scroll and tap inside the phones. The recommended one has a blue edge. '
        'Only the background changes, in light; cards, rows, words, status colours and the one blue are untouched, and dark stays as it is. A lighter ground only raises the contrast of the words on it.</p></div>'
        '<section class="item" id="ground"><h2>The background, a tad lighter</h2><div class="meta"><span><b>In v46:</b> ' + E(FOUND) + '</span>'
        '<span><b>Touches:</b> ' + E('Round 8, answers 15 and 16 (a soft colour field, option A) and answer 25 (more glass, which strengthened the fields). Every option keeps the field; none changes the status colours or the one blue.') + '</span></div>'
        '<div class="why">Recommended: ' + E(REC) + '</div><div class="phones">' + ''.join(phone(o) for o in OPTS) + '</div></section></main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)
readme = ('# Options: a lighter background (round 9, answer 1)\n\n'
  'Built over mockup v46 (`../timeline-v46-craft.html`). `source/build.py` writes `phone.html` (v46 with `source/lt.css` and `source/lt.js`; the option set by the phone\'s hash, `.light` fixing the theme, `home` staying on home); `source/page.py` writes `index.html` with the round 8 options pages\' stylesheet.\n\n'
  '| Option | Ground (light) | Fields: blue, lavender, mint |\n|---|---|---|\n'
  '| v46 | #f2f3f7 | .22, .21, .15 |\n| A | #f7f8fb | .22, .21, .15 |\n| B | #f2f3f7 | .15, .14, .10 |\n| C (recommended) | #f6f7fa | .18, .17, .12 |\n| D | #fafbfd | .12, .11, .08 |\n\n'
  'Dark is unchanged in every option. ' + FOUND + '\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
