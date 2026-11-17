# Builds the live phones for the home-page suggestions (round 4, answer 10): v13's home redrawn three ways, as layers inside its script.
# Usage: python3 build.py   (writes ../sug-A.html to ../sug-C3.html; the page as it is now is v14, copied to ../now.html)
import os, shutil
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v13 = open(os.path.join(M, 'timeline-v13-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'sug.css'), encoding='utf-8').read()
js = open(os.path.join(H, 'sug.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
for o in ('A', 'B', 'C', 'C1', 'C2', 'C3'):
    s = v13; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    a = '\n  render();\n})();\n</script>'; assert s.count(a) == 1
    s = s.replace(a, "\n  var SUG = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../sug-%s.html' % o), 'w', encoding='utf-8').write(HEAD + s)
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + open(os.path.join(M, 'timeline-v14-craft.html'), encoding='utf-8').read())
