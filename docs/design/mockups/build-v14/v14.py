"""Build mockup v14 from v13: a layer only. The owner's round 4 (decisions/questions/P-005-design-round-4.md):
home becomes the desk map, one lane per project, opening large and folding slim and pinned as the page scrolls;
what waits on the owner pops up on its lane and lights its row in Needs you; the project cards are gone.
python3 v14.py ../timeline-v13-craft.html ../timeline-v14-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

rep("<title>Desk Timeline v13</title>", "<title>Desk Timeline v14</title>")
rep("Mockup, version 13 (", "Mockup, version 14 (v13 with the owner's fourth round: home becomes the desk map, one lane per project on a shared two-week axis, opening large with each project's line and folding slim and pinned as you scroll; what waits on you pops up on its lane in soft red or yellow and, tapped, lights its row in Needs you; the project cards are gone, and tapping a lane opens its project; activity before today is an example; then version 13: ")
CSS = open(os.path.join(HERE, "v14.css"), encoding="utf-8").read()
i = s.rindex("</style>"); s = s[:i] + CSS + s[i:]
JS = open(os.path.join(HERE, "v14.js"), encoding="utf-8").read()
rep("\n  render();\n})();\n</script>", "\n" + JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
