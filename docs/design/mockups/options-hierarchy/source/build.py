# Builds the live phones for a more defined hierarchy, every icon folding (round 5, answer 8): v20 with hier.js, three ways.
# Usage: python3 build.py   (writes ../now.html, a copy of v20, and ../hier-1.html to ../hier-3.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v20 = open(os.path.join(M, 'timeline-v20-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'hier.css'), encoding='utf-8').read()
js = open(os.path.join(H, 'hier.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v20))
for o in '123':
    s = v20; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    a = '\n  render();\n})();\n</script>'; assert s.count(a) == 1
    s = s.replace(a, "\n  var HIER = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../hier-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
