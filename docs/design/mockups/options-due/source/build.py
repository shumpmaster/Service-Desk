# Builds the live phones for ordering by due date and showing the drag (round 6, answer 10): v25 with order.js (ORD = 'A') and due.js.
# Usage: python3 build.py   (writes ../now.html, a copy of v25, and ../due-A.html to ../due-C.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v = open(os.path.join(M, 'timeline-v25-craft.html'), encoding='utf-8').read()
O = os.path.join(M, 'options-order', 'source')
css = open(os.path.join(O, 'order.css'), encoding='utf-8').read() + open(os.path.join(H, 'due.css'), encoding='utf-8').read()
js = open(os.path.join(O, 'order.js'), encoding='utf-8').read() + open(os.path.join(H, 'due.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v))
for o in 'ABC':
    s = v; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    a = '\n  render();\n})();\n</script>'; assert s.count(a) == 1
    s = s.replace(a, "\n  var ORD = 'A', DUE_OPT = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../due-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
