# Builds the live phones for home's floating header (round 5, answer 15): v21 with homehdr.js, three ways.
# Usage: python3 build.py   (writes ../now.html, a copy of v21, and ../home-1.html to ../home-3.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v21 = open(os.path.join(M, 'timeline-v21-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'homehdr.css'), encoding='utf-8').read()
js = open(os.path.join(H, 'homehdr.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + v21)
a = '\n  render();\n})();\n</script>'; assert v21.count(a) == 1
for o in '123':
    s = v21; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    open(os.path.join(H, '../home-%s.html' % o), 'w', encoding='utf-8').write(HEAD + s.replace(a, "\n  var HH = '" + o + "';\n" + js + a))
print('ok')
