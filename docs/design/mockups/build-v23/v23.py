"""Build mockup v23 from v22: a layer only. The owner's round 6 (decisions/questions/P-005-design-round-6.md, answers 2 and 5):
the words in the map's window: no kind word, the short title wrapping onto up to three lines. The drawing is the live option's own code,
options-map-wrap (WRAP = 'B').
python3 v23.py ../timeline-v22-craft.html ../timeline-v23-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda d, n: open(os.path.join(M, d, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v22</title>", "<title>Desk Timeline v23</title>")
rep("Mockup, version 22 (", "Mockup, version 23 (v22 with the words in the map's window as the short title alone, wrapped onto up to three lines; then version 22: ")
i = s.rindex("</style>"); s = s[:i] + rd('options-map-wrap', 'wrap.css') + s[i:]
JS = "\n  /* ================= v23: the words in the map's window wrap (round 6, answers 2 and 5) ================= */\n  var WRAP = 'B';\n" + rd('options-map-wrap', 'wrap.js')
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
