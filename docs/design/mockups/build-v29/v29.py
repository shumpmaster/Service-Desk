"""Build mockup v29 from v28: a layer only. The owner's round 7, answers 8, 16 and 17 (decisions/questions/P-005-design-round-7.md):
a fixed centre, a blue pointer in the left margin at the middle of the list's window, the row level with it washed in blue, and a
small blue arrow on the branch map over its event. The drawing is the live option's own code: options-centre/source/ (CT = 'A').
python3 v29.py ../timeline-v28-craft.html ../timeline-v29-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(M, 'options-centre', 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v28</title>", "<title>Desk Timeline v29</title>")
rep("Mockup, version 28 (", "Mockup, version 29 (v28 with a fixed centre: a blue pointer at the middle of the list, the row it meets washed in blue, and an arrow on the branch map over its event; then version 28: ")
i = s.rindex("</style>"); s = s[:i] + rd('ctr.css') + s[i:]
JS = "\n  /* ================= v29: a fixed centre (round 7, answers 8, 16 and 17) ================= */\n  var CT = 'A';\n" + rd('ctr.js')
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
