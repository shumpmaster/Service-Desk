# Builds the live phones for the project pills in the floating header (round 4, answer 13): v15 with pills.js, three ways.
# Usage: python3 build.py   (writes ../now.html, a copy of v15, ../pills-A.html to ../pills-C.html, and ../header-1.html to ../header-3.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v15 = open(os.path.join(M, 'timeline-v15-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'pills.css'), encoding='utf-8').read()
js = open(os.path.join(H, 'pills.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
# every phone opens on the timeline project, where the floating band is
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v15))
for o in 'ABC':
    s = v15; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    a = '\n  render();\n})();\n</script>'; assert s.count(a) == 1
    s = s.replace(a, "\n  var PILLS = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../pills-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))

# answer 14: option B with a sleek floating header, three ways (hdr.css, hdr.js)
hcss = open(os.path.join(H, 'hdr.css'), encoding='utf-8').read()
hjs = open(os.path.join(H, 'hdr.js'), encoding='utf-8').read()
for o in '123':
    s = v15; i = s.rindex('</style>'); s = s[:i] + css + hcss + s[i:]
    a = '\n  render();\n})();\n</script>'
    s = s.replace(a, "\n  var PILLS = 'B', HDR = '" + o + "';\n" + js + hjs + a)
    open(os.path.join(H, '../header-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
