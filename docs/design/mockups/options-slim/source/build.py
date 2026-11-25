# Builds the live phones for round 7, answer 21: answer 20's drawing (options-phases/all.html) as it is, and with slim.css and
# slim.js two ways.  Usage: python3 build.py   (writes ../now.html, a copy of options-phases/all.html, and ../hb-A.html, ../hb-B.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v = open(os.path.join(M, 'options-phases', 'all.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'slim.css'), encoding='utf-8').read(); js = open(os.path.join(H, 'slim.js'), encoding='utf-8').read()
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(v)
a = '\n  render();\n})();\n</script>'; assert v.count(a) == 1
for o in 'AB':
    s = v; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    s = s.replace(a, "\n  var HB = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../hb-%s.html' % o), 'w', encoding='utf-8').write(s)
print('ok')
