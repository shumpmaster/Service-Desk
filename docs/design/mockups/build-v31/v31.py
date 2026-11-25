"""Build mockup v31 from v30: the checked patches of options-phases/source/phases.py, then layers. The owner's round 7, answers
20 to 23 (decisions/questions/P-005-design-round-7.md): every phase kept in the list, folded unless opened; a lane per sprint on
the whole-phase map; the title bar, the project pills and the phase tiles gone; the project and the phase as two dropdown pills
at the top; a pass for room and legibility. The drawing is the live options' own code: options-phases/source/ (phases.py,
phases.css, phases.js), options-slim/source/ (slim.css, slim.js with HB = 'A'), options-top/source/ (top.css, top.js).
python3 v31.py ../timeline-v30-craft.html ../timeline-v31-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.path.insert(0, os.path.join(M, 'options-phases', 'source')); import phases
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda d, n: open(os.path.join(M, d, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v30</title>", "<title>Desk Timeline v31</title>")
rep("Mockup, version 30 (", "Mockup, version 31 (v30 with every phase kept in the list, a lane per sprint on the map, and one row at the top: Back, the project pill, the phase pill, the bell and More; then version 30: ")
s = phases.apply(s)
i = s.rindex("</style>"); s = s[:i] + rd('options-phases', 'phases.css') + rd('options-slim', 'slim.css') + rd('options-top', 'top.css') + s[i:]
JS = ("\n  /* ================= v31: every phase kept, two pills at the top (round 7, answers 20 to 23) ================= */\n" + rd('options-phases', 'phases.js')
      + "\n  var HB = 'A';\n" + rd('options-slim', 'slim.js') + rd('options-top', 'top.js'))
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
