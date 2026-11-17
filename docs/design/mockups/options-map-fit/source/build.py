# Builds the live phones for the branch map fitted to a selected milestone (round 5, answer 1, second half): v17 with fit.js, three ways.
# Usage: python3 build.py   (writes ../now.html, a copy of v17, and ../fit-A.html to ../fit-C.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v17 = open(os.path.join(M, 'timeline-v17-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'fit.css'), encoding='utf-8').read()
js = open(os.path.join(H, 'fit.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v17))
for o in 'ABC':
    s = v17; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    a = '\n  render();\n})();\n</script>'; assert s.count(a) == 1
    s = s.replace(a, "\n  var FIT_OPT = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../fit-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
