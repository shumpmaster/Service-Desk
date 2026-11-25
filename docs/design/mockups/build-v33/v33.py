"""Build mockup v33 from v32: a layer only. The owner's round 8, answers 1 to 3 (decisions/questions/P-005-design-round-8.md):
the first review's fixes (docs/design/audit-2026-11-25-v32-review.md) and the second review's polish and motion within the
owner's rulings (docs/design/audit-2026-11-25-v32-polish.md). The code is build-v33/source/ (tokens.css, polish.css,
fixes.js, motion.js). python3 v33.py ../timeline-v32-craft.html ../timeline-v33-craft.html"""
import os, re, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()

rep("<title>Desk Timeline v32</title>", "<title>Desk Timeline v33</title>")
rep("Mockup, version 32 (", "Mockup, version 33 (v32 with the two design reviews of 25 November built in: a tap never moves the page, every bubble closes and leads with its link, one blue, one type ramp, one radius scale, press states, a map that moves instead of rebuilding, folds that open and close, one continuous push; then version 32: ")

# F1: the first click handler of all, so a tap's pin is set before any handler redraws or scrolls (fixes.js)
rep("  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n",
    "  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n  window.addEventListener('click', function (e) { if (window.__v33click) window.__v33click(e); }, true);\n")
# O1: a row whose event is not on this map (another phase's) no longer feeds the window a NaN position
rep("on[el.dataset.k] = 1; xs.push(MAP.X[el.dataset.k]);", "on[el.dataset.k] = 1; if (isFinite(MAP.X[el.dataset.k])) xs.push(MAP.X[el.dataset.k]);")
# M2: the map no longer dips to 55% when the events in view change (motion.js slides it instead)
rep("if (animate && !REDUCED) anim(inn.firstChild, [{ opacity: .55 }, { opacity: 1 }], { duration: 220 }); ", "")
# M3: a fold no longer pulses its gauge or fades its body from above (motion.js grows and shrinks it)
rep("if (fresh) anim(fresh.querySelector('.v13g, .v13ico'), [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 280 });", "")
rep("if (opening && body) anim(body, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 260 });", "")
# M8: the Context view lands first, then its rows settle
rep("behavior: animate && !REDUCED ? 'smooth' : 'auto'", "behavior: 'auto'")
# M7: the old fixed-distance drag gives way to motion.js's
rep("if (sheetEl && e.target.closest('[data-grab]')) { y0 = e.clientY;", "if (false && sheetEl) { y0 = e.clientY;")
# R4: words on main keep a clear gap, measured for the 11 px they now use
rep("t.length * 5.4 + 8", "t.length * 5.8 + 14")

# L3: one type ramp (11, 12, 13, 15, 17, 20, 22, 28); the ring's 7.5 stays (R7 answer 11). Weights 400 and 600; 700 only
# for the large titles, put back in polish.css.
SIZE = {'9.5': '11', '10': '11', '10.5': '11', '11.5': '12', '12.5': '13', '13.5': '13', '14': '15', '15.5': '15', '16': '17', '19': '20', '27': '28'}
def fs(m): return m.group(1) + SIZE.get(m.group(2), m.group(2)) + 'px'
s, n1 = re.subn(r'(font-size:\s*)(\d+(?:\.\d+)?)px', fs, s)
s, n2 = re.subn(r'(font:\s*(?:\d00\s+)?)(\d+(?:\.\d+)?)px', fs, s)
s, n3 = re.subn(r'font-weight:\s*(500|700)\b', 'font-weight: 600', s)
s, n4 = re.subn(r'(font:\s*)(500|700)(\s+\d)', lambda m: m.group(1) + '600' + m.group(3), s)

i = s.rindex("</style>"); s = s[:i] + rd('tokens.css') + rd('polish.css') + s[i:]
JS = "\n  /* ================= v33: the two reviews of 25 November, fixes, polish and motion (round 8, answers 1 to 3) ================= */\n" + rd('fixes.js') + rd('motion.js')
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s), "sizes", n1 + n2, "weights", n3 + n4)
