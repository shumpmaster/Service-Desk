# Builds ../phone.html: mockup v47 with the round 9 Needs-you tab options (ny.css, ny.js), each switched on by the phone's hash (see ny.js).
# A ".light" or ".dark" in the hash fixes the phone's theme, so light and dark can sit side by side on the options page.
# Usage: python3 build.py   (from anywhere)
import os
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(H, '../..')
s = open(os.path.join(M, 'timeline-v47-craft.html'), encoding='utf-8').read()
css = open(os.path.join(H, 'ny.css'), encoding='utf-8').read(); js = open(os.path.join(H, 'ny.js'), encoding='utf-8').read()
assert s.count('<title>Desk Timeline v47</title>') == 1
a = '\n})();\n</script>'; i = s.rindex(a); s = s[:i] + '\n' + js + s[i:]
j = s.rindex('</style>'); s = s[:j] + css + s[j:]
THEME = '''<script>/* the phone's theme from its hash (.light or .dark): each colour-scheme media rule is switched on or off */
(function () { var h = decodeURIComponent(location.hash.slice(1)).split('.'), t = h.indexOf('dark') >= 0 ? 'dark' : h.indexOf('light') >= 0 ? 'light' : '';
  if (!t) return; var de = document.documentElement; de.setAttribute('data-theme', t); de.style.colorScheme = t;
  function walk(rs) { for (var i = 0; i < rs.length; i++) { var r = rs[i];
    if (r.media && /prefers-color-scheme/.test(r.media.mediaText) && !r.__gr) { var on = /prefers-color-scheme:\\s*dark/.test(r.media.mediaText) === (t === 'dark');
      var rest = r.media.mediaText.replace(/\\s*and\\s*\\(prefers-color-scheme:\\s*\\w+\\)|\\(prefers-color-scheme:\\s*\\w+\\)\\s*(and\\s*)?/g, '').trim();
      r.media.mediaText = on ? (rest || 'all') : 'not all'; r.__gr = 1; }
    if (r.cssRules) walk(r.cssRules); } }
  function fix() { [].forEach.call(document.styleSheets, function (ss) { try { walk(ss.cssRules); } catch (e) {} }); }
  fix(); document.addEventListener('DOMContentLoaded', fix); window.addEventListener('load', fix);
})();</script>
'''
k = s.index('<script'); s = s[:k] + THEME + s[k:]
s = s.replace('<title>Desk Timeline v47</title>', '<title>Desk Timeline v47, the Needs-you tab: options</title>')
if not s.lstrip().lower().startswith('<!doctype'):
    s = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n' + s + '\n</body></html>\n'
open(os.path.join(H, '..', 'phone.html'), 'w', encoding='utf-8').write(s)
print('ok', len(s))
