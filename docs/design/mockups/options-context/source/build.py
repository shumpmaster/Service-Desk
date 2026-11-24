# Builds the live phones for round 7, answer 4: v26 with options-sessions' tag (SS = 'A'), the links tweak, and the Context view, two ways.
# Usage: python3 build.py   (writes ../now.html, a copy of v26, ../cx-A.html and ../cx-B.html;
# cx-*.html?cx=1 opens straight in Context view)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v = open(os.path.join(M, 'timeline-v26-craft.html'), encoding='utf-8').read()
rd = lambda d, n: open(os.path.join(M, d, 'source', n), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = ('<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click();'
        ' if (/[?&]cx=1/.test(location.search)) setTimeout(function () { var b = document.getElementById("roundbtn"); if (b) b.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true })); }, 500); }, 400); });</script>')
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v))
for name, o in (('cx-A', 'A'), ('cx-B', 'B')):
    s = v; i = s.rindex('</style>'); s = s[:i] + rd('options-sessions', 'sess.css') + rd('options-context', 'ctx.css') + s[i:]
    a = '\n  render();\n})();\n</script>'; assert s.count(a) == 1
    js = "\n  var SS = 'A', CX = '" + o + "';\n" + rd('options-sessions', 'sess.js') + rd('options-context', 'ctx.js')
    s = s.replace(a, js + a)
    open(os.path.join(H, '../%s.html' % name), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
