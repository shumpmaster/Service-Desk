"""Build mockup v20 from v19: a layer only. The owner's round 5 (decisions/questions/P-005-design-round-5.md, answers 6 and 7):
on the fitted map the window over the events in view sits in the middle, before on the left and after on the right; at either end
of the milestone it slides to that edge. The drawing is the live option's own code (options-map-centre/source/centre.js with
CENTRE = '2'), so the option the owner chose and the mockup stay one.
python3 v20.py ../timeline-v19-craft.html ../timeline-v20-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
OPT = os.path.join(HERE, '..', 'options-map-centre', 'source')
s = open(SRC, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

rep("<title>Desk Timeline v19</title>", "<title>Desk Timeline v20</title>")
rep("Mockup, version 19 (", "Mockup, version 20 (v19 with the map's window in the centre: on the map fitted to a milestone, the window over the events in view sits in the middle, what came before on the left and what comes after on the right, sliding to an edge only at either end of the milestone; then version 19: ")
JS = "\n  /* ================= v20: the map's window in the centre (round 5, answers 6 and 7) ================= */\n  var CENTRE = '2';\n" + open(os.path.join(OPT, "centre.js"), encoding="utf-8").read()
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
