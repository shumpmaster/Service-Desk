# Builds ../phone.html: mockup v34 with the round 8 options for gates, decisions, research and stops, each switched on by the phone's hash (see kn.js).
# Usage: python3 build.py   (from anywhere)
import os
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(H, '../..')
s = open(os.path.join(M, 'timeline-v34-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'kn.css'), encoding='utf-8').read(); js = open(os.path.join(H, 'kn.js'), encoding='utf-8').read()
a = '\n})();\n</script>'; i = s.rindex(a); assert s.count('<title>Desk Timeline v34</title>') == 1
s = s[:i] + '\n' + js + s[i:]
j = s.rindex('</style>'); s = s[:j] + css + s[j:]
s = s.replace('<title>Desk Timeline v34</title>', '<title>Desk Timeline v34, gate, decision, research and stop options</title>')
if not s.lstrip().lower().startswith('<!doctype'):
    s = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n' + s + '\n</body></html>\n'
open(os.path.join(H, '..', 'phone.html'), 'w', encoding='utf-8').write(s)
print('ok', len(s))
