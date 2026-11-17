# Builds the live phones for one reading direction (round 6, answer 8): v25 with order.js, three ways.
# Usage: python3 build.py   (writes ../now.html, a copy of v25, and ../ord-A.html and ../ord-B.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v = open(os.path.join(M, 'timeline-v25-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'order.css'), encoding='utf-8').read()
js = open(os.path.join(H, 'order.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
# every phone opens on the timeline project, where the map is fitted to M6
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v))
for o in 'AB':
    s = v; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    a = '\n  render();\n})();\n</script>'; assert s.count(a) == 1
    s = s.replace(a, "\n  var ORD = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../ord-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
