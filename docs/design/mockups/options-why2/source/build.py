# Builds the live phones for the why, represented differently (round 5, answer 10): v20 with the tree (options-hierarchy,
# HIER = '2') and why2.js, three ways.  Usage: python3 build.py   (writes ../now.html and ../why2-A.html to ../why2-C.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
HI = os.path.join(M, 'options-hierarchy', 'source')
v20 = open(os.path.join(M, 'timeline-v20-craft.html'), encoding='utf-8').read()
rd = lambda d, n: open(os.path.join(d, n), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
a = '\n  render();\n})();\n</script>'; assert v20.count(a) == 1
def build(opt):
    s = v20; i = s.rindex('</style>'); s = s[:i] + rd(HI, 'hier.css') + (rd(H, 'why2.css') if opt else '') + s[i:]
    js = "\n  var HIER = '2';\n" + rd(HI, 'hier.js') + ("\n  var WHY2 = '" + opt + "';\n" + rd(H, 'why2.js') if opt else '')
    return HEAD + done(s.replace(a, js + a))
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(build(None))   # the tree as chosen, the why as it is
for o in 'ABC': open(os.path.join(H, '../why2-%s.html' % o), 'w', encoding='utf-8').write(build(o))
print('ok')
