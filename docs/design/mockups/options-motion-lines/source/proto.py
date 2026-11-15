"""Build the motion and line options playground from mockup v10: a layer, as each version is.
python3 proto.py ../../timeline-v10-craft.html ../playground.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
s = open(SRC, encoding="utf-8").read()
HERE = os.path.dirname(os.path.abspath(__file__))

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

rep("<title>Desk Timeline v10</title>", "<title>Desk Motion Options</title>")
CSS = open(os.path.join(HERE, "proto.css"), encoding="utf-8").read()
i = s.rindex("</style>"); s = s[:i] + CSS + s[i:]
JS = open(os.path.join(HERE, "proto.js"), encoding="utf-8").read()
OPTBAR = "\n  window.OPT_BAR = " + ("true" if "--bar" in sys.argv else "false") + ";\n"
rep("  render();\n})();\n</script>", OPTBAR + JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
