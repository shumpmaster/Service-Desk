"""Build mockup v26 from v25: a layer only. The owner's round 6 (decisions/questions/P-005-design-round-6.md, answers 8 to 14):
one order of operations, top down at every level, each thing where it happened or is meant to, the numbers following that order,
a standard milestone's own id hidden. The drawing is the live options' own code: options-order (ORD = 'A') and options-due
(DUE_OPT = 'N'), as shown on options-sequence.
python3 v26.py ../timeline-v25-craft.html ../timeline-v26-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda d, n: open(os.path.join(M, d, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v25</title>", "<title>Desk Timeline v26</title>")
rep("Mockup, version 25 (", "Mockup, version 26 (v25 read in one order of operations: top down at every level, each thing where it happened or is meant to, the numbers following that order; start times are examples; then version 25: ")
i = s.rindex("</style>"); s = s[:i] + rd('options-order', 'order.css') + rd('options-due', 'due.css') + s[i:]
JS = "\n  /* ================= v26: one order of operations (round 6, answers 8 to 14) ================= */\n  var ORD = 'A', DUE_OPT = 'N';\n" + rd('options-order', 'order.js') + rd('options-due', 'due.js')
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
