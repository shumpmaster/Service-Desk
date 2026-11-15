"""Build mockup v12 from v11: a layer only. A milestone opens in place with its sprints as lanes beside main,
the agent's plan between events, and numbers from phase down to action.
python3 v12.py ../timeline-v11-craft.html ../timeline-v12-craft.html <phosphor assets>"""
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

rep("<title>Desk Timeline v11</title>", "<title>Desk Timeline v12</title>")
rep("Mockup, version 11 (", "Mockup, version 12 (v11 with the lanes and the actions: a milestone opens in place, its sprints run as lanes beside main, merges sit on main on dark discs, the agent's plan sits between events with any problem in red, and every level is numbered from phase down to action; the actions shown are an example, since no agent records them yet; then version 11: ")
CSS = open(os.path.join(HERE, "v12.css"), encoding="utf-8").read()
i = s.rindex("</style>"); s = s[:i] + CSS + s[i:]
IC = {"check": ph("check", "bold"), "warn": ph("warning", "fill"), "arrow": ph("arrow-bend-down-right", "bold"), "caret": ph("caret-down", "bold")}
JS = open(os.path.join(HERE, "v12.js"), encoding="utf-8").read().replace("/*V12ICONS*/{}", json.dumps(IC))
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
