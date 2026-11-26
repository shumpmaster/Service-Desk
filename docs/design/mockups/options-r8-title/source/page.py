# Writes ../index.html and ../README.md: an accent reserved for home's large title (round 8, answer 18), options over v39 with title A and search A.
# Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
CSS = _ns['CSS']; phone = _ns['phone']
E = html.escape
def ph(tag, h, p, hash, rec=False): return dict(tag=tag, h=h, p=E(p), hash=hash, rec=rec)
B = 't=A.s=A.home.'
OPTS = [
 ('now', 'Title A as it is', 'The large "Timeline" and its live line sit straight on the ground; once they go under the bar, the bar takes its glass and a small title.', '', False),
 ('P', 'A: a glass plate for the title', 'The title and its live line on a glass panel of their own, the same glass as the map card. As you scroll, the plate lifts and fades as the bar takes the same glass, so the title moves from one glass to the other.', 'a=P', True),
 ('H', 'B: the colour gathered behind the title', 'The ground\'s blue and lavender gather more strongly behind the title, fading down into the page. As you scroll the glow fades, and a faint blue-to-lavender tint stays on the bar.', 'a=H', False),
 ('M', 'C: an eyebrow and a mark', 'The live line becomes a small-caps line above a heavier title, with a short blue-to-lavender mark under it. Scrolled, the mark sits at the left of the bar\'s small title.', 'a=M', False),
 ('W', 'D: a two-tone wordmark', 'The large title is drawn in a deep blue-to-violet from the ground\'s colours, light blue to lilac in dark. The bar keeps a plain ink title.', 'a=W', False),
]
phones = []
for k, h, p, a, rec in OPTS:
    tag = 'Title A as it is' if k == 'now' else h.split(':')[0]
    hh = h if k == 'now' else h.split(': ', 1)[1]
    for th in ('light', 'dark'):
        phones.append(ph(tag, hh + (', dark' if th == 'dark' else ''), p if th == 'light' else '', B + (a + '.' if a else '') + th, rec))
    phones.append(ph(tag, hh + ', scrolled', 'Scrolled: the title condensed into the bar.', B + (a + '.' if a else '') + 'light.y=140', rec))
ITEM = dict(id='accent', h='An accent reserved for the title',
  found='Title A puts a large "Timeline" at 34 on the ground, with the live line under it, and condenses into the slim glass bar as you scroll. Nothing sets it apart from the groups below it but its size.',
  ruling='All four keep title A and search A (round 8, answer 16, as drawn) and the slim floating bar once you scroll (round 6, answers 1 and 4). B and D use the ground\'s field colours (round 8, answers 15 and 16) more strongly at the top; C\'s mark and D\'s wordmark bring the ground\'s blue and lavender into type, beside the one blue that round 8, answer 14 (option 2A) keeps for now or selected, which P-005-rebrand-style\'s one blue does not foresee. A adds no colour.',
  rec='A, the glass plate: it gives the title a surface that is its own, in the same glass as the map card and the bar, and it condenses by handing its glass to the bar, without adding a colour.')
def phone_html(o): return phone(o)
body = ('<title>Home title accent</title>\n' + CSS + '\n<main><div class="lede"><h1>An accent for home\'s title</h1>'
        '<p>What you said, on title A: “I like option a here, but I want a better visual segregation of the title. Effectively some accenting or something that is reserved for the title and just condenses when scrolled as shown” (round 8, answer 18). '
        'Each option is drawn on v39 with title A and the search magnifier, live: scroll inside the phones to see it condense. Title A as it is comes first; the recommended option is edged in blue.</p></div>'
        '<section class="item" id="accent"><h2>' + E(ITEM['h']) + '</h2><div class="meta"><span><b>In title A:</b> ' + E(ITEM['found']) + '</span>'
        '<span><b>Touches:</b> ' + E(ITEM['ruling']) + '</span></div><div class="why">Recommended: ' + E(ITEM['rec']) + '</div>'
        '<div class="phones">' + ''.join(phone_html(o) for o in phones) + '</div></section></main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)
readme = ('# Options: an accent reserved for home\'s title (round 8, answer 18)\n\n'
  'Built over mockup v39 (`../timeline-v39-craft.html`) with title A and search A from `../options-r8-filter-home/source/` (fh.css, fh.js). `source/build.py` writes `phone.html`, adding `source/tt.css` and `source/tt.js`; the hash token `a=P|H|M|W` picks the accent, `y=<px>` scrolls, `light` or `dark` sets the theme. `source/page.py` writes `index.html`.\n\n'
  '- In title A: ' + ITEM['found'] + '\n- Touches: ' + ITEM['ruling'] + '\n- Recommended: ' + ITEM['rec'] + '\n\n'
  + ''.join('## ' + h + '\n\n' + p + '\n\n' for k, h, p, a, rec in OPTS)
  + '## How it condenses\n\n`--tt-p` runs from 0 to 1 over the first 64 points of scroll; the title lifts 10 points, shrinks 6% and fades as the bar takes its small title. With reduced motion it snaps at 32 points. With reduced transparency or more contrast, A\'s plate is solid and B\'s glow and tint are off.\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body), len(phones))
