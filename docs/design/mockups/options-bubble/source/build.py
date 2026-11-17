# Builds the live phones for what the needs bubble shows (round 5, answer 12): v20 with the tree (HIER = '2'), the why as B
# (WHY2 = 'B'), the needs as a tag and bubble (NEED4 = 'A') and bubble.js, three ways.
# Usage: python3 build.py   (writes ../now.html, the bubble as it is, and ../bubble-1.html to ../bubble-3.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
HI, W2, N2 = (os.path.join(M, d, 'source') for d in ('options-hierarchy', 'options-why2', 'options-needs2'))
v20 = open(os.path.join(M, 'timeline-v20-craft.html'), encoding='utf-8').read()
rd = lambda d, n: open(os.path.join(d, n), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
a = '\n  render();\n})();\n</script>'; assert v20.count(a) == 1
def build(opt):
    s = v20; i = s.rindex('</style>'); s = s[:i] + rd(HI, 'hier.css') + rd(W2, 'why2.css') + rd(N2, 'needs4.css') + (rd(H, 'bubble.css') if opt else '') + s[i:]
    js = ("\n  var HIER = '2';\n" + rd(HI, 'hier.js') + "\n  var WHY2 = 'B';\n" + rd(W2, 'why2.js') + "\n  var NEED4 = 'A';\n" + rd(N2, 'needs4.js')
          + ("\n  var BUB = '" + opt + "';\n" + rd(H, 'bubble.js') if opt else ''))
    return HEAD + done(s.replace(a, js + a))
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(build(None))
for o in '123': open(os.path.join(H, '../bubble-%s.html' % o), 'w', encoding='utf-8').write(build(o))
print('ok')
