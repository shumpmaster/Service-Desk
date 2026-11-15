"""Build mockup v11 from v10: a layer only. It takes the options layer (../options-motion-lines/source/)
fixed to the owner's choices of 15 November 2026: motion 5, push; lines 4, groove. No switcher."""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__)); OPTS = os.path.join(HERE, "..", "options-motion-lines", "source")
s = open(SRC, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

rep("<title>Desk Timeline v10</title>", "<title>Desk Timeline v11</title>")
rep("Mockup, version 10 (", "Mockup, version 11 (v10 with the owner's motion and lines: opening a project pushes the plan in from the left, already on Now, and the timeline's track is a groove pressed into the page; then ")
CSS = open(os.path.join(OPTS, "proto.css"), encoding="utf-8").read()
i = s.rindex("</style>"); s = s[:i] + CSS + s[i:]
JS = open(os.path.join(OPTS, "proto.js"), encoding="utf-8").read()
a = "var OPT = { m: 'm1', l: 'l1' };"; assert JS.count(a) == 1; JS = JS.replace(a, "var OPT = { m: 'm5', l: 'l4' };")
a = "  readHash();\n"; assert JS.count(a) == 1; JS = JS.replace(a, "")
rep("  render();\n})();\n</script>", "\n  window.OPT_BAR = false;\n" + JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
