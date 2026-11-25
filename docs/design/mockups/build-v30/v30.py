"""Build mockup v30 from v29: a layer only, plus the checked patches of options-select/source/whole.py. The owner's round 7,
answers 18 and 19 (decisions/questions/P-005-design-round-7.md): selecting a milestone no longer zooms the map; the map always
shows the whole current phase, drawn as the fitted map draws a milestone, and the selected milestone is outlined with a chip.
The drawing is the live option's own code: options-select/source/ (sel.css, sel.js with SL = 'A', whole.py).
python3 v30.py ../timeline-v29-craft.html ../timeline-v30-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.path.insert(0, os.path.join(M, 'options-select', 'source')); import whole
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(M, 'options-select', 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v29</title>", "<title>Desk Timeline v30</title>")
rep("Mockup, version 29 (", "Mockup, version 30 (v29 with the whole phase always on the map, drawn in full, and the selected milestone outlined with a chip instead of a zoom; then version 29: ")
s = whole.apply(s)
rep("(function () {\n  var REDUCED", "(function () {\n  var WHOLE = true;   /* v30: the map always holds the whole phase (round 7, answer 19) */\n  var REDUCED")
i = s.rindex("</style>"); s = s[:i] + rd('sel.css') + s[i:]
JS = "\n  /* ================= v30: the whole phase on the map, the milestone outlined (round 7, answers 18 and 19) ================= */\n  var SL = 'A';\n" + whole.JS + rd('sel.js')
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
