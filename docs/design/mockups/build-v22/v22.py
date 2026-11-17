"""Build mockup v22 from v21: a layer only. The owner's round 6 (decisions/questions/P-005-design-round-6.md, answers 1 and 4):
home's header floats as the same slim bar a project's page uses, without Back. The drawing is the live option's own code,
options-home-header (HOME = 'A').
python3 v22.py ../timeline-v21-craft.html ../timeline-v22-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda d, n: open(os.path.join(M, d, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v21</title>", "<title>Desk Timeline v22</title>")
rep("Mockup, version 21 (", "Mockup, version 22 (v21 with home's header floating as the same slim bar a project's page uses, without Back; then version 21: ")
i = s.rindex("</style>"); s = s[:i] + rd('options-home-header', 'home.css') + s[i:]
JS = "\n  /* ================= v22: home's floating header (round 6, answers 1 and 4) ================= */\n  var HOME = 'A';\n" + rd('options-home-header', 'home.js')
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
