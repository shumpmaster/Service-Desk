"""Build mockup v28 from v27: a layer only. The owner's round 7, answers 8 to 15 (decisions/questions/P-005-design-round-7.md):
the list stays top down; its levels on rails, each labelled, with one size per level and thin line icons; the phase heading flush
left with a strip of its milestones; percents inside the milestone rings; a sprint's accent bar and ten squares to the right of its
title; every row under a sprint with its fourth number on a line of its own; folds that keep the tapped row in place.
The drawing is the live options' own code: options-rails/source/ (rail RL = '1', ph, fin, sg SG = 'R').
python3 v28.py ../timeline-v27-craft.html ../timeline-v28-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(M, 'options-rails', 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v27</title>", "<title>Desk Timeline v28</title>")
rep("Mockup, version 27 (", "Mockup, version 28 (v27 with the list's levels on rails: labels, one size per level, thin line icons, the phase's milestone strip, percents in the rings, a sprint's accent bar and squares, fourth numbers on their own line, folds that keep their place; then version 27: ")
i = s.rindex("</style>"); s = s[:i] + rd('rail.css') + rd('ph.css') + rd('fin.css') + rd('sg.css') + s[i:]
JS = "\n  /* ================= v28: the levels on rails (round 7, answers 8 to 15) ================= */\n  var RL = '1', SG = 'R';\n" + rd('rail.js') + rd('ph.js') + rd('fin.js') + rd('sg.js')
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
