"""Build mockup v32 from v31: a layer only. The owner's round 7, answers 24 to 26 (decisions/questions/P-005-design-round-7.md):
what a gauge counts (a milestone its criteria met, a sprint its events done, a phase its milestones reached) and when it is
green, yellow or red (by what happened; a milestone and a phase take the worst of what they hold). The code is
options-gauges2/source/ (gauge.css, gauge.js). python3 v32.py ../timeline-v31-craft.html ../timeline-v32-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(M, 'options-gauges2', 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v31</title>", "<title>Desk Timeline v32</title>")
rep("Mockup, version 31 (", "Mockup, version 32 (v31 with every gauge following the owner's rule: a milestone counts its criteria met, a sprint its events done, a phase its milestones reached; red stopped, yellow waiting on you or a failed review, green moving, grey not started; then version 31: ")
i = s.rindex("</style>"); s = s[:i] + rd('gauge.css') + s[i:]
JS = "\n  /* ================= v32: what a gauge counts and when it changes colour (round 7, answers 24 to 26) ================= */\n" + rd('gauge.js')
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
