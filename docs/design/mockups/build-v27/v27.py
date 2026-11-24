"""Build mockup v27 from v26: a layer only. The owner's round 7 (decisions/questions/P-005-design-round-7.md, answers 2 to 5):
each event links back to where it happened, its Claude conversation first (for a pipeline step, the Chief of Staff session at work
on the project when it ran), then the GitHub run, then the pull request; and the Context view, held from the round button, the
current phase open. The drawing is the live options' own code: options-sessions (SS = 'A') and options-context (CX = 'A').
python3 v27.py ../timeline-v26-craft.html ../timeline-v27-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda d, n: open(os.path.join(M, d, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v26</title>", "<title>Desk Timeline v27</title>")
rep("Mockup, version 26 (", "Mockup, version 27 (v26 with each event linked back to where it happened, its Claude conversation first, then the GitHub run, then the pull request; and the Context view, held from the round button; then version 26: ")
i = s.rindex("</style>"); s = s[:i] + rd('options-sessions', 'sess.css') + rd('options-context', 'ctx.css') + s[i:]
JS = "\n  /* ================= v27: links back, and the Context view (round 7, answers 2 to 5) ================= */\n  var SS = 'A', CX = 'A';\n" + rd('options-sessions', 'sess.js') + rd('options-context', 'ctx.js')
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
