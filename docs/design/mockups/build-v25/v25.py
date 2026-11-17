"""Build mockup v25 from v24: a layer only. The owner's round 6 (decisions/questions/P-005-design-round-6.md, answers 6 and 7):
every event on main carries its words, spread in a strip under main and joined to its icon by a thin line. The drawing is the live option's own code,
options-main-labels (MLB = '2').
python3 v25.py ../timeline-v24-craft.html ../timeline-v25-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda d, n: open(os.path.join(M, d, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v24</title>", "<title>Desk Timeline v25</title>")
rep("Mockup, version 24 (", "Mockup, version 25 (v24 with every event on main carrying its words in a strip under main; then version 24: ")
i = s.rindex("</style>"); s = s[:i] + rd('options-main-labels', 'mainlbl.css') + s[i:]
JS = "\n  /* ================= v25: words on main (round 6, answers 6 and 7) ================= */\n  var MLB = '2';\n" + rd('options-main-labels', 'mainlbl.js')
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
