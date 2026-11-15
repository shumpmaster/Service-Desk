"""Build mockup v13 from v12: a layer only. The owner's round 3 (decisions/questions/P-005-design-round-3.md):
the branch map floats at the top, a row of phase gauges under it, the page opens on the current step fully open,
no lanes in the list, gauges on phases, milestones and sprints, and marks and tags on events and steps.
python3 v13.py ../timeline-v12-craft.html ../timeline-v13-craft.html <phosphor assets>"""
import json, os, sys
SRC, DST, ICONS = sys.argv[1], sys.argv[2], sys.argv[3]
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

def ph(name, w="regular"):
    f = os.path.join(ICONS, w, name + ("" if w == "regular" else "-" + w) + ".svg")
    return open(f).read().strip().replace('<svg xmlns="http://www.w3.org/2000/svg"', '<svg aria-hidden="true" focusable="false"', 1)

rep("<title>Desk Timeline v12</title>", "<title>Desk Timeline v13</title>")
rep("Mockup, version 12 (", "Mockup, version 13 (v12 rebuilt on the owner's third round: the branch map floats at the top of a project and pans with the page, a row of phase gauges sits under it, the page opens on the current step with everything in it open and lists only the current phase, the lanes are gone, phases, milestones and sprints wear soft red, yellow and green gauges that open and fold their sections, and events and steps carry a corner mark and a state tag; milestone and sprint percentages are examples, since what a gauge counts is not yet ruled; then version 12: ")
CSS = open(os.path.join(HERE, "v13.css"), encoding="utf-8").read()
i = s.rindex("</style>"); s = s[:i] + CSS + s[i:]
IC = {"check": ph("check", "bold"), "wait": ph("hourglass-medium", "fill"), "x": ph("x", "bold"),
      "ms": ph("circle", "fill"), "own": ph("square", "fill"), "branch": ph("git-branch"), "step": ph("list-checks")}
JS = open(os.path.join(HERE, "v13.js"), encoding="utf-8").read().replace("/*V13ICONS*/{}", json.dumps(IC))
rep("\n  render();\n})();\n</script>", "\n" + JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
