# Builds the live phones for round 7, answer 20: v30 as it is, and v30 with every phase in the list and a roomier map.
# Usage: python3 build.py   (writes ../now.html, a copy of v30, and ../all.html)
import os, sys
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H); import phases
M = os.path.join(H, '../..')
v = open(os.path.join(M, 'timeline-v30-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'phases.css'), encoding='utf-8').read(); js = open(os.path.join(H, 'phases.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v))
a = '\n  render();\n})();\n</script>'; assert v.count(a) == 1
s = phases.apply(v); i = s.rindex('</style>'); s = s[:i] + css + s[i:]
s = s.replace(a, '\n' + js + a)
open(os.path.join(H, '../all.html'), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
