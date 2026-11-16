"""Build mockup v18 from v17: a layer only. The owner's round 5 (decisions/questions/P-005-design-round-5.md, answers 1 and 4):
tapping a milestone's row selects it, and the branch map fits to that milestone: every event an icon, planned ones as open
rings; the events in view spread apart under the window with their kind and a short title; a chip's cross brings back the phase.
The drawing is the live option's own code (options-map-fit/source/: fit.css and fit.js with FIT_OPT = 'C'), so the option the
owner chose and the mockup stay one.
python3 v18.py ../timeline-v17-craft.html ../timeline-v18-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
OPT = os.path.join(HERE, '..', 'options-map-fit', 'source')
s = open(SRC, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

rd = lambda n: open(os.path.join(OPT, n), encoding="utf-8").read()
rep("<title>Desk Timeline v17</title>", "<title>Desk Timeline v18</title>")
rep("Mockup, version 17 (", "Mockup, version 18 (v17 with the branch map fitted to the milestone you select: tapping a milestone's row selects it, and the map shows only its sprints across the width, every event as its icon and planned ones as open rings; the events in view below spread apart under the window with their kind and a short title; a chip names the milestone and its cross brings back the whole phase; the page opens with the milestone in progress selected; then version 17: ")
i = s.rindex("</style>"); s = s[:i] + rd("fit.css") + s[i:]
JS = "\n  /* ================= v18: the branch map fits the selected milestone (round 5, answers 1 and 4) ================= */\n  var FIT_OPT = 'C';\n" + rd("fit.js")
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
