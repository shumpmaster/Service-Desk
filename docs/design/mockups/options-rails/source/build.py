# Builds the live phones for round 7, answer 8 (rails refined, round 7 answer 9): v27 as it is, and v27 with rail.css and rail.js three ways.
# Usage: python3 build.py   (writes ../now.html, a copy of v27, and ../rl-1.html and ../rl-2.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v = open(os.path.join(M, 'timeline-v27-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'rail.css'), encoding='utf-8').read()
js = open(os.path.join(H, 'rail.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = '<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click(); }, 400); });</script>'
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v))
a = '\n  render();\n})();\n</script>'; assert v.count(a) == 1
for o in '12':
    s = v; i = s.rindex('</style>'); s = s[:i] + css + s[i:]
    s = s.replace(a, "\n  var RL = '" + o + "';\n" + js + a)
    open(os.path.join(H, '../rl-%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
ph_css = open(os.path.join(H, 'ph.css'), encoding='utf-8').read(); ph_js = open(os.path.join(H, 'ph.js'), encoding='utf-8').read()
s = v; i = s.rindex('</style>'); s = s[:i] + css + ph_css + s[i:]
s = s.replace(a, "\n  var RL = '1';\n" + js + ph_js + a)
open(os.path.join(H, '../rl-1ph.html'), 'w', encoding='utf-8').write(HEAD + done(s))
fin_css = open(os.path.join(H, 'fin.css'), encoding='utf-8').read(); fin_js = open(os.path.join(H, 'fin.js'), encoding='utf-8').read()
s = v; i = s.rindex('</style>'); s = s[:i] + css + ph_css + fin_css + s[i:]
s = s.replace(a, "\n  var RL = '1';\n" + js + ph_js + fin_js + a)
open(os.path.join(H, '../rl-1fin.html'), 'w', encoding='utf-8').write(HEAD + done(s))
sg_css = open(os.path.join(H, 'sg.css'), encoding='utf-8').read(); sg_js = open(os.path.join(H, 'sg.js'), encoding='utf-8').read()
for o in 'RU':
    s = v; i = s.rindex('</style>'); s = s[:i] + css + ph_css + fin_css + sg_css + s[i:]
    s = s.replace(a, "\n  var RL = '1', SG = '" + o + "';\n" + js + ph_js + fin_js + sg_js + a)
    open(os.path.join(H, '../rl-sg%s.html' % o), 'w', encoding='utf-8').write(HEAD + done(s))
print('ok')
