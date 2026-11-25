# Builds the live phones for the fixed centre (round 7, answer 8): v28 as it is, and v28 with ctr.css and ctr.js three ways.
# Usage: python3 build.py   (writes ../now.html, a copy of v28, and ../ct-A.html to ../ct-C.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v = open(os.path.join(M, 'timeline-v28-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'ctr.css'), encoding='utf-8').read()
js = open(os.path.join(H, 'ctr.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v))
a = '\n  render();\n})();\n</script>'; assert v.count(a) == 1
for o in 'ABC':
    s = v; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    s = s.replace(a, "\n  var CT = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../ct-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
