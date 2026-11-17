# Builds the live phones for the home-page map (round 4): v13 with B's map and pop-ups, one page per option.
# Usage: python3 build.py   (writes ../live-now.html, ../live-row.html, ../live-card.html, and ../space-{tall,fold,drawer}.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
v13 = open(os.path.join(H, '../../timeline-v13-craft.html')).read()
rd = lambda n: open(os.path.join(H, n)).read()
for name, live in (('now', None), ('row', 'row'), ('card', 'card')):
    inj = '<style>' + rd('home.css') + (rd('live.css') if live else '') + '</style>'
    js = "window.HM_OPT='B';" + ("window.HM_POP=1;window.HM_LIVE='%s';" % live if live else '')
    inj += '<script>addEventListener("load",function(){setTimeout(function(){' + js + rd('home.js') + (rd('live.js') if live else '') + '},300)});</script>'
    i = v13.rfind('</body>'); out = v13[:i] + inj + v13[i:] if i >= 0 else v13 + inj
    head = '<!doctype html>\n<meta charset="utf-8">\n'   # served as its own page beside the options page
    open(os.path.join(H, '../live-%s.html' % name), 'w').write(head + out)
# the second question: more room for the map, no project cards (map2.css, map2.js)
for m in ('tall', 'fold', 'drawer'):
    inj = '<style>' + rd('map2.css') + '</style><script>addEventListener("load",function(){setTimeout(function(){window.M2="' + m + '";' + rd('map2.js') + '},300)});</script>'
    i = v13.rfind('</body>'); out = v13[:i] + inj + v13[i:] if i >= 0 else v13 + inj
    open(os.path.join(H, '../space-%s.html' % m), 'w').write('<!doctype html>\n<meta charset="utf-8">\n' + out)
