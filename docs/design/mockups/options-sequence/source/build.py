# Builds the live phone for one order of operations (round 6, answer 13): v25 with order.js (ORD = 'A') and due.js (DUE_OPT = 'N').
# Usage: python3 build.py   (writes ../now.html, a copy of v25, and ../seq.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v = open(os.path.join(M, 'timeline-v25-craft.html'), encoding='utf-8').read()
rd = lambda d, n: open(os.path.join(M, d, 'source', n), encoding='utf-8').read()
css = rd('options-order', 'order.css') + rd('options-due', 'due.css')
js = rd('options-order', 'order.js') + rd('options-due', 'due.js')
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v))
s = v; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
a = '\n  render();\n})();\n</script>'; assert s.count(a) == 1
s = s.replace(a, "\n  var ORD = 'A', DUE_OPT = 'N';\n" + js + a)
open(os.path.join(H, '../seq.html'), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
