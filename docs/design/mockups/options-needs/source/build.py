# Builds the live phones for what an event needs (round 4, answer 17, first half): v16 with needs.js, three ways.
# Usage: python3 build.py   (writes ../now.html, a copy of v16, and ../needs-A.html to ../needs-C.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v16 = open(os.path.join(M, 'timeline-v16-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'needs.css'), encoding='utf-8').read()
js = open(os.path.join(H, 'needs.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
# every phone opens on the timeline project, on the current step
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v16))
for o in 'ABC':
    s = v16; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    a = '\n  render();\n})();\n</script>'; assert s.count(a) == 1
    s = s.replace(a, "\n  var NEEDS_OPT = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../needs-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
# round 5, answer 1: three forms of C (needs2.css, needs2.js)
css2 = open(os.path.join(H, 'needs2.css'), encoding='utf-8').read()
js2 = open(os.path.join(H, 'needs2.js'), encoding='utf-8').read()
for o in ('C1', 'C2', 'C3'):
    s = v16; i = s.rindex('</style>'); s = s[:i] + css + css2 + s[i:]
    a = '\n  render();\n})();\n</script>'
    s = s.replace(a, "\n  var NEEDS_OPT = '" + o + "';\n" + js + js2 + a)
    open(os.path.join(H, '../needs-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
# round 5, answer 2: C1's look with C2's checklist, and the plan's crossover (needs3.css, needs3.js)
css3 = open(os.path.join(H, 'needs3.css'), encoding='utf-8').read()
js3 = open(os.path.join(H, 'needs3.js'), encoding='utf-8').read()
s = v16; i = s.rindex('</style>'); s = s[:i] + css + css2 + css3 + s[i:]
a = '\n  render();\n})();\n</script>'
s = s.replace(a, "\n  var NEEDS_OPT = 'M';\n" + js + js2 + js3 + a)
open(os.path.join(H, '../needs-M.html'), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
