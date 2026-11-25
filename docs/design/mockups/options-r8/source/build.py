# Builds options-r8/phone.html: mockup v33 with every round 8 option, each switched on by the phone's hash (see r8.js).
# Usage: python3 build.py   (from anywhere)
import os
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(H, '../..')
s = open(os.path.join(M, 'timeline-v33-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'r8.css'), encoding='utf-8').read(); js = open(os.path.join(H, 'r8.js'), encoding='utf-8').read()
a = '\n  render();\n})();\n</script>'; assert s.count(a) == 1
i = s.rindex('</style>'); s = s[:i] + css + s[i:]
s = s.replace(a, '\n  render();\n' + js + '\n})();\n</script>')
s = s.replace('<title>Desk Timeline v33</title>', '<title>Desk Timeline v33, round 8 options</title>')
s = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n' + s + '\n</body></html>\n'
open(os.path.join(H, '..', 'phone.html'), 'w', encoding='utf-8').write(s)
print('ok', len(s))
