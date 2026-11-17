# Builds the live phones for the chain's connection (round 5, answer 13): v20 with the tree, the why as B, the needs as a tag and
# bubble, the bubble as a plain checklist (options-bubble, BUB = '1'), and chain.js, three ways.
# Usage: python3 build.py   (writes ../now.html, the bubble as chosen, and ../chain-A.html to ../chain-C.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
HI, W2, N2, BU = (os.path.join(M, d, 'source') for d in ('options-hierarchy', 'options-why2', 'options-needs2', 'options-bubble'))
v20 = open(os.path.join(M, 'timeline-v20-craft.html'), encoding='utf-8').read()
rd = lambda d, n: open(os.path.join(d, n), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
a = '\n  render();\n})();\n</script>'; assert v20.count(a) == 1
def build(opt):
    s = v20; i = s.rindex('</style>'); s = s[:i] + rd(HI, 'hier.css') + rd(W2, 'why2.css') + rd(N2, 'needs4.css') + rd(BU, 'bubble.css') + (rd(H, 'chain.css') if opt else '') + s[i:]
    js = ("\n  var HIER = '2';\n" + rd(HI, 'hier.js') + "\n  var WHY2 = 'B';\n" + rd(W2, 'why2.js') + "\n  var NEED4 = 'A';\n" + rd(N2, 'needs4.js')
          + "\n  var BUB = '1';\n" + rd(BU, 'bubble.js') + ("\n  var CHAIN = '" + opt + "';\n" + rd(H, 'chain.js') if opt else ''))
    return HEAD + done(s.replace(a, js + a))
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(build(None))
for o in 'ABC': open(os.path.join(H, '../chain-%s.html' % o), 'w', encoding='utf-8').write(build(o))
print('ok')
