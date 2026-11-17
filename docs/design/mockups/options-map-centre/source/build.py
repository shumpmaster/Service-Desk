# Builds the live phones for the centred map window (round 5, answer 6): v19 with centre.js, two ways.
# Usage: python3 build.py   (writes ../now.html, a copy of v19, and ../centre-1.html, ../centre-2.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v19 = open(os.path.join(M, 'timeline-v19-craft.html'), encoding='utf-8').read()
js = open(os.path.join(H, 'centre.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v19))
for o in '12':
    a = '\n  render();\n})();\n</script>'; assert v19.count(a) == 1
    s = v19.replace(a, "\n  var CENTRE = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../centre-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
