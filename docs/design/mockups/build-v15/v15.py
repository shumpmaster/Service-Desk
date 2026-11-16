"""Build mockup v15 from v14: a layer only. The owner's round 4, later (decisions/questions/P-005-design-round-4.md, answers 9 to 12):
home is grouped by what waits, with what each answer holds up and a slim strip of the events that matter; v14's desk map leaves home.
The home drawing is the live option's own code (options-home-suggest/source/sug.js and sug.css, SUG = 'C23'), so the two stay one.
python3 v15.py ../timeline-v14-craft.html ../timeline-v15-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
OPT = os.path.join(HERE, '..', 'options-home-suggest', 'source')
s = open(SRC, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

rd = lambda d, n: open(os.path.join(d, n), encoding="utf-8").read()
rep("<title>Desk Timeline v14</title>", "<title>Desk Timeline v15</title>")
rep("Mockup, version 14 (", "Mockup, version 15 (v14 with home grouped by what waits: one sentence, then a group for each project with something waiting, its row with a slim two-week strip of the events that matter and its waiting rows, each saying what it holds up, the longest wait first and marked; the quiet projects fold into one row; v14's desk map leaves home; then version 14: ")
CSS = rd(OPT, "sug.css") + rd(HERE, "v15.css")
i = s.rindex("</style>"); s = s[:i] + CSS + s[i:]
JS = "\n  var SUG = 'C23';\n" + rd(OPT, "sug.js") + "\n" + rd(HERE, "v15.js")
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
