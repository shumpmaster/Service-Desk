# Builds the live phones for round 7, answer 22: answer 21's option A as it is, and with top.css and top.js.
# Usage: python3 build.py   (writes ../now.html, a copy of options-slim/hb-A.html, and ../top.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v = open(os.path.join(M, 'options-slim', 'hb-A.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'top.css'), encoding='utf-8').read(); js = open(os.path.join(H, 'top.js'), encoding='utf-8').read()
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(v)
a = '\n  render();\n})();\n</script>'; assert v.count(a) == 1
s = v; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
s = s.replace(a, '\n' + js + a)
open(os.path.join(H, '../top.html'), 'w', encoding='utf-8').write(s)
print('ok')
