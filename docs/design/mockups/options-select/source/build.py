# Builds the live phones for round 7, answer 18 (selecting a milestone keeps the map's perspective): v29 as it is, and v29 with
# sel.css and sel.js three ways.  Usage: python3 build.py   (writes ../now.html and ../sl-A.html to ../sl-C.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v = open(os.path.join(M, 'timeline-v29-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'sel.css'), encoding='utf-8').read()
js = open(os.path.join(H, 'sel.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v))
a = '\n  render();\n})();\n</script>'; assert v.count(a) == 1
for o in 'ABC':
    s = v; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    s = s.replace(a, "\n  var SL = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../sl-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
import sys; sys.path.insert(0, H); import whole
s = whole.apply(v); i = s.rindex('</style>'); s = s[:i] + css + s[i:]
s = s.replace(a, "\n  var SL = 'A';\n" + whole.JS + js + a).replace("(function () {\n  var REDUCED", "(function () {\n  var WHOLE = true;\n  var REDUCED", 1)
open(os.path.join(H, '../sl-A2.html'), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
