"""Build mockup v24 from v23: a layer only. The owner's round 6 (decisions/questions/P-005-design-round-6.md, answers 3 and 6):
each event as heavy as it is: turning points larger, checks as they are, routine one quiet line. The drawing is the live option's own code,
options-weight (WT = 'A').
python3 v24.py ../timeline-v23-craft.html ../timeline-v24-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda d, n: open(os.path.join(M, d, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v23</title>", "<title>Desk Timeline v24</title>")
rep("Mockup, version 23 (", "Mockup, version 24 (v23 with each event as heavy as it is: turning points larger, checks as they are, routine one quiet line; then version 23: ")
i = s.rindex("</style>"); s = s[:i] + rd('options-weight', 'weight.css') + s[i:]
JS = "\n  /* ================= v24: each event as heavy as it is (round 6, answers 3 and 6) ================= */\n  var WT = 'A';\n" + rd('options-weight', 'weight.js')
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
