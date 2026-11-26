# Writes ../index.html and ../README.md: slight colour in the background, options over v37 (round 8, answer 15).
# Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
CSS = _ns['CSS']; phone = _ns['phone']
E = html.escape
def ph(tag, h, p, hash, rec=False): return dict(tag=tag, h=h, p=E(p), hash=hash, rec=rec)
CONTRAST = ('Measured on the rendered ground at 393 wide, every 6 points, at its most tinted spot: the words straight on the ground stay 4.5:1 or better in every option. '
  'Light: the grey under titles 4.9 (A, B, C) to 5.5 (D), with the two secondary greys one shade darker on a tinted ground (#5a5c60, #555559); the blue of now 4.9 to 5.4; ink 12.4 or more. '
  'Dark: the grey 6.0 or more, the blue 7.8 or more, white 17 or more. Cards, rows, sheets and the map band keep their own solid colours, so nothing on them changes.')
ITEMS = [
 dict(id='ground', n='1', short='Colour in the background', h='Slight colour in the background',
  found='In v37 the ground is a flat neutral grey (#f2f3f7 in light, black in dark) behind white cards, a solid map band and glass controls. With nothing coloured behind it, the new glass on the top row and the tab bar has nothing to catch, so it reads as frosted white.',
  ruling='P-005-rebrand-style (neutral greys and one blue for selected or now): every option loosens the neutral ground and the one-blue rule for the background only; cards, rows, words, status colours and the blue of now are unchanged. Round 8, answer 14, item 4A (glass on what floats) is what the colour shows through. With reduced transparency or more contrast, the ground turns flat again.',
  rec='A. A soft colour field everywhere: it is the slight variation you asked for, the glass finally has something to catch, and since it is the same on every page it never has to be learned or mistaken for a status.',
  opts=[ph('v37 as it is', 'Flat ground · project', 'The project page as it opens.', 'now.light'),
        ph('v37 as it is', 'Flat ground · dark', 'The same, in dark.', 'now.dark'),
        ph('v37 as it is', 'Flat ground · home', 'Home.', 'now.light.home'),
        ph('Option A', 'A soft colour field · project', 'Three large, pale fields, blue at the top left, lavender at the right, a touch of mint at the foot, blurred together and fixed behind everything; the map band carries the same field.', 'A.light', True),
        ph('Option A', 'A soft colour field · dark', 'In dark, faint deep glows on black.', 'A.dark', True),
        ph('Option A', 'A soft colour field · home', 'Home over the same field; the cards stay white.', 'A.light.home', True),
        ph('Option B', 'Each project its own hue · The timeline', 'The same kind of field, in each project’s own pair of cool hues: The timeline blue and lavender. Home keeps a neutral field.', 'B.light'),
        ph('Option B', 'Each project its own hue · the widget', 'Home-screen widget in teal and blue, so you always know which project you are in.', 'B.light.wd'),
        ph('Option B', 'Each project its own hue · dark', 'The timeline in dark.', 'B.dark'),
        ph('Option C', 'Light from the top · project', 'A wash behind the band and the top of the list, blue into lavender, fading to the plain ground halfway down.', 'C.light'),
        ph('Option C', 'Light from the top · dark', 'The same, in dark.', 'C.dark'),
        ph('Option D', 'A mood that follows what waits · project', 'A faint warm wash from the top while something waits on you, a cool one when everything is moving. Here something waits, so it is warm.', 'D.light'),
        ph('Option D', 'A mood that follows what waits · dark', 'The same, in dark. The warm wash sits near the yellow of waiting, so it can blur what a status means.', 'D.dark')]),
]
def item(it):
    return ('<section class="item" id="' + it['id'] + '"><h2>' + E(it['h']) + '</h2><div class="meta"><span><b>In v37:</b> ' + E(it['found']) + '</span>'
            '<span><b>Touches:</b> ' + E(it['ruling']) + '</span><span><b>Contrast:</b> ' + E(CONTRAST) + '</span></div><div class="why">Recommended: ' + E(it['rec']) + '</div>'
            '<div class="phones">' + ''.join(phone(o) for o in it['opts']) + '</div></section>')
body = ('<title>Colour in the background</title>\n' + CSS + '\n<main><div class="lede"><h1>Colour in the background</h1>'
        '<p>What you said: “when I was saying glass. I more meant how the background was styled. I’m really trying to introduce some slight color variation into the background I think” (round 8, answer 15). '
        'Each option is drawn on v37, live: scroll and tap inside the phones. v37 as it is comes first, then four ways to bring colour into the ground, each in light and dark and on the project page and home where they differ. '
        'Only the ground changes; the glass controls float over it.</p></div>'
        + ''.join(item(it) for it in ITEMS) + '</main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)
readme = ('# Options: colour in the background (round 8, answer 15)\n\n'
  'Built over mockup v37 (`../timeline-v37-craft.html`). `source/build.py` writes `phone.html` (v37 with `source/gr.css` and `source/gr.js`; each option switched on by the phone\'s hash, `.light` or `.dark` fixing the phone\'s theme, `home` staying on home, `wd` opening the Home-screen widget); `source/page.py` writes `index.html`, using the round 8 options pages\' stylesheet (`../options-r8/source/pages.py`).\n\n'
  '| Option | What it is |\n|---|---|\n'
  '| A (recommended) | A soft colour field: three large pale fields (blue, lavender, a touch of mint) fixed behind everything; faint deep glows in dark. ' + ITEMS[0]['rec'] + ' |\n'
  '| B | Each project its own pair of cool hues (The timeline blue and lavender, the widget teal and blue, and so on); home neutral. None is a status colour. |\n'
  '| C | Light from the top: a blue-to-lavender wash behind the band, fading to the plain ground halfway down. |\n'
  '| D | A mood: warm while something waits on you, cool when all is moving. The warm wash sits near the yellow of waiting. |\n\n'
  'Touches: ' + ITEMS[0]['ruling'] + '\n\n' + CONTRAST + ' The label grey (#8e8e93, the map\'s small words) was already under 4.5:1 on the flat ground in light (2.9:1); it is for labels, not words, and is unchanged.\n\n'
  'The map band paints the same field, fixed to the screen, so the colour runs on behind it while rows still pass under it unseen. iPhone Safari does not honour a fixed background on an element; the real desk would draw the band\'s field from the band\'s own top instead, which lines up because the band sits at the top of the screen.\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
