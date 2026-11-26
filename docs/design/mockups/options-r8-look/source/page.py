# Writes ../index.html and ../README.md: the look and feel, four options over v36 (round 8, answer 14).
# Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
CSS = _ns['CSS']; phone = _ns['phone']
E = html.escape
def ph(tag, h, p, hash, rec=False): return dict(tag=tag, h=h, p=E(p), hash=hash, rec=rec)
ITEMS = [
 dict(id='map', n='1', short='A calmer map', h='A calmer map band',
  found='In v36 the band is the first thing a project shows and the least finished: 7-point grey lanes crossing each other, a ringed icon for every event, a large blue block for the window, a dashed outline over the whole phase, and the gates’ captions standing on their side in a box that reads as a black slab in dark.',
  ruling='round 3, answers 6 and 12 (a soft window; icons on the events in view), round 7, answer 19 (the whole phase, the dashed outline and its chip), round 8, answers 6 and 9 (one scale per phase, planned rings, the fold, gate marks): A keeps them all. B sets aside round 3, answer 12 for commits.',
  rec='A. Thin, light lanes and a dot for each routine commit outside the window take most of the noise out, and every ruling on the map stays as it is.',
  opts=[ph('v36 as it is', 'Light', 'The band as the page opens.', 'now.light'),
        ph('v36 as it is', 'Dark', 'The same, in dark.', 'now.dark'),
        ph('Option A', 'Quiet lines · light', 'Lanes 3 points (main 4) in a lighter grey; routine commits outside the window become small dots; the window a faint tint with a hairline edge; the outline lighter; gate captions in small capitals with no box.', '1A.light', True),
        ph('Option A', 'Quiet lines · dark', 'The same, in dark: lanes a step above black, no slabs behind the captions.', '1A.dark', True),
        ph('Option B', 'Turning points only · light', 'As A, and every commit is a dot, in the window too; the window an outline with no fill; lane names lighter.', '1B.light'),
        ph('Option B', 'Turning points only · dark', 'The same, in dark.', '1B.dark')]),
 dict(id='blue', n='2', short='Blue for now', h='Blue only for “now or selected”',
  found='In v36 the one blue sits on nine things: the pointer, the map’s window and arrow, the selection chip, NOW, the selected tab, and also the project’s count, the bell’s dot, the new-since dots, the session dots, the at-work dot and the Answer button. It was meant to say “you are here”.',
  ruling='P-005-rebrand-style (neutral greys and one blue for selected or now): A carries it out. Round 8, answer 12, items 5 and 6 (the at-work and new-since dots, drawn blue) and answer 9 (the Answer button, drawn blue) change colour only.',
  rec='A. Blue then means one thing, where you are: the pointer, the map’s window and arrow, the selection, NOW and the selected tab. Counts and new marks turn ink, at work turns the soft green of “moving”, Answer an ink button.',
  opts=[ph('v36 as it is', 'Light', 'The stop, the at-work row, the count and the new dots.', 'now.light'),
        ph('v36 as it is', 'Dark', 'The same, in dark.', 'now.dark'),
        ph('Option A', 'Blue only where you are · light', 'Count, bell dot, new dots and session dots in ink; at work in soft green; Answer an ink button.', '2A.light', True),
        ph('Option A', 'Blue only where you are · dark', 'The same, in dark: ink turns white.', '2A.dark', True),
        ph('Option B', 'Where you are, and the one action · light', 'As A, but Answer keeps the blue fill, as an iPhone app tints its main action.', '2B.light'),
        ph('Option B', 'Where you are, and the one action · dark', 'The same, in dark.', '2B.dark')]),
 dict(id='tags', n='3', short='Fewer tags', h='Fewer tags on each row',
  found='In v36 Stop card 5 carries NOW, Stop, Yours · waiting, Why and CoS 14 Nov, then the time, before its title; most rows carry four: the kind, Done, Why and the session.',
  ruling='round 3, answer 9 (each event’s state as a tag, tinted when it matters), round 5, answer 10 and round 8, answer 6, item 2 (Why, a quiet tag), round 7, answers 2 to 4 and round 8, answer 6, item 9 (the session link, named): A keeps every one of them, moving the grey ones and the links. B turns Why and the session into underlined words, setting aside the quiet tag of round 8, answer 6, item 2.',
  rec='A. The kind, a grey state and the time join the small number line (“2.2.2.10 · Stop · 9:42 am”), only the tinted states stay before the title, and Why and the session move to the row’s foot, so a title is never more than one line of tags away.',
  opts=[ph('v36 as it is', 'Five tags before the title', 'Stop card 5 and the rows above it.', 'now.light'),
        ph('Option A', 'States first, links at the foot · light', 'Number line “2.2.2.10 · Stop · 9:42 am”; NOW and Yours · waiting; the title; Why and CoS 14 Nov under the text.', '3A.light', True),
        ph('Option A', 'States first, links at the foot · dark', 'The same, in dark, at 393.', '3A.dark', True),
        ph('Option B', 'Words, not chips', 'Everything stays where it is, but only NOW and the tinted states keep a chip; Done, Why and the session read as words.', '3B.light')]),
 dict(id='glass', n='4', short='More glass', h='More glass on what floats: the top row, the tab bar, the round button, menus and sheets',
  found='In v36 the floating controls are 78% white with a 20-point blur and a flat edge; menus and sheets are solid. The band under the top row is solid on purpose (v33, the second review’s L1), so glass shows most where the tab bar and menus float over the list and the map. Content never takes glass.',
  ruling='round 7, answers 21 and 22 and round 8, answer 6, item 1 (the slim top row, 38 high): sizes unchanged. The second review’s L1 (a solid band under the map) is kept.',
  rec='A. A true glass on what floats: thinner (60% white, 66% grey in dark), a stronger blur, a light edge along the top and a faint shine, menus and sheets glass too; text on it still passes 4.5:1 even over black, and with reduced transparency it turns solid.',
  opts=[ph('v36 as it is', 'Over the list · light', 'Scrolled so the stop’s Answer button passes under the tab bar.', 'now.light.y=-180'),
        ph('v36 as it is', 'Over the list · dark', 'The same, in dark.', 'now.dark.y=-180'),
        ph('Option A', 'Glass with an edge · light', '60% white, 24-point blur, a light top edge and shine on the top row, tab bar and round button.', '4A.light.y=-180', True),
        ph('Option A', 'Glass with an edge · dark, the phase menu', 'The phase menu as glass over the map, in dark.', '4A.dark.menu', True),
        ph('Option A', 'Glass with an edge · the stop’s sheet', 'The sheet of stop card 5’s choices: 80% white with a 30-point blur.', '4A.light.sheet', True),
        ph('Option B', 'Tinted by what is under it · light', 'Thinner still (42% white) with more colour through: the blue Answer button tints the tab bar as it passes.', '4B.light.y=-180'),
        ph('Option B', 'Tinted by what is under it · dark', 'The same, in dark.', '4B.dark.y=-180')]),
]
def item(it):
    return ('<section class="item" id="' + it['id'] + '"><h2>' + E(it['n'] + '. ' + it['h']) + '</h2><div class="meta"><span><b>In v36:</b> ' + E(it['found']) + '</span>'
            '<span><b>Touches:</b> ' + E(it['ruling']) + '</span></div><div class="why">Recommended: ' + E(it['rec']) + '</div>'
            '<div class="phones">' + ''.join(phone(o) for o in it['opts']) + '</div></section>')
body = ('<title>The look and feel</title>\n' + CSS + '\n<main><div class="lede"><h1>The look and feel: a calmer map, one meaning for blue, fewer tags, more glass</h1>'
        '<p>What you said: “Draw all 4” (round 8, answer 14), after asking how the colour and feel look. Each item starts with v36 as it is, then each option, live: scroll and tap inside the phones. Light and dark sit side by side where they differ. The recommended one has a blue edge. '
        'Home stays as it is; the palette stays the soft status colours and the one blue; shapes untouched.</p>'
        '<nav class="toc">' + ''.join('<a href="#' + it['id'] + '">' + E(it['n'] + '. ' + it['short']) + '</a>' for it in ITEMS) + '</nav></div>'
        + ''.join(item(it) for it in ITEMS) + '</main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)
rows = ''.join('| ' + it['n'] + '. ' + it['short'] + ' | ' + it['rec'].replace('|', '/') + ' | ' + it['ruling'].replace('|', '/') + ' |\n' for it in ITEMS)
readme = ('# Options: the look and feel (round 8, answer 14)\n\n'
  'Built over mockup v36 (`../timeline-v36-craft.html`). `source/build.py` writes `phone.html` (v36 with `source/lk.css` and `source/lk.js`; each option switched on by the phone\'s hash, and `.light` or `.dark` in the hash fixing the phone\'s theme); `source/page.py` writes `index.html`, using the round 8 options pages\' stylesheet (`../options-r8/source/pages.py`).\n\n'
  '| Item | Recommended | Rulings touched |\n|---|---|---|\n' + rows +
  '\nGlass contrast, worst case (the control\'s glass over pure black in light, over pure white in dark, before any blur): A light 5.9:1, A dark 4.7:1; B light 3.2:1, B dark 3.0:1, below 4.5:1 for text, which is why A is recommended. '
  'With prefers-reduced-transparency every glass surface turns solid.\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
