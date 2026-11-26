"""Build mockup v37 from v36: a layer only. The owner's round 8, answers 14 and 15 (decisions/questions/P-005-design-round-8.md):
"Draw all 4"; "I like all of them, however when I was saying glass. I more meant how the background was styled. ..." Option A of each
look-and-feel item drawn on options-r8-look/: a calmer map; blue only for now or selected; fewer tags per row (with Answer on a line
of its own); more glass on what floats. The code is the options' own (options-r8-look/source/lk.css and lk.js), fixed to A:
build-v37/source/ (look.css, look.js). python3 v37.py ../timeline-v36-craft.html ../timeline-v37-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v36</title>", "<title>Desk Timeline v37</title>")
rep("Mockup, version 36 (", "Mockup, version 37 (v36 with the look and feel the owner took: a calmer map, blue only for now or selected, fewer tags per row, and glass on what floats; then version 36: ")
# 1A: a routine commit outside the window is a dot; the map's arrow (v29) aims at the station's visible circle, not the whole group, so it never flicks to a label as the window passes
rep("dr = dot.getBoundingClientRect(), vp = band", "dr = (function (g) { var cs = g.querySelectorAll('circle.disc, circle.dot'); for (var i = 0; i < cs.length; i++) { if (getComputedStyle(cs[i]).display !== 'none') return cs[i].getBoundingClientRect(); } return g.getBoundingClientRect(); })(dot), vp = band")
i = s.rindex("</style>"); s = s[:i] + rd('look.css') + s[i:]
a = '\n})();\n</script>'; i = s.rindex(a)
s = s[:i] + '\n' + rd('look.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
