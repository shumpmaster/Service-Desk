# Builds the live phones for round 7, answers 6 and 7 (the whole list bottom up): v27 as it is, and v27 with bu.js.
# Usage: python3 build.py   (writes ../now.html, a copy of v27, and ../bu.html)
import os
H = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(H, '../..')
v = open(os.path.join(M, 'timeline-v27-craft.html'), encoding='utf-8').read()
js = open(os.path.join(H, 'bu.js'), encoding='utf-8').read()
HEAD = '<!doctype html>\n<meta charset="utf-8">\n'
OPEN = ('<script>addEventListener("load", function () { setTimeout(function () { var r = document.querySelector(\'.sg-row[data-sgp="tl"]\'); if (r) r.click();'
        ' if (/[?&]cx=1/.test(location.search)) setTimeout(function () { var b = document.getElementById("roundbtn"); if (b) b.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true })); }, 500); }, 400); });</script>')
def done(s): i = s.rfind('</body>'); return s[:i] + OPEN + s[i:] if i >= 0 else s + OPEN
open(os.path.join(H, '../now.html'), 'w', encoding='utf-8').write(HEAD + done(v))
a = '\n  render();\n})();\n</script>'; assert v.count(a) == 1
open(os.path.join(H, '../bu.html'), 'w', encoding='utf-8').write(HEAD + done(v.replace(a, '\n' + js + a)))
print('ok')
