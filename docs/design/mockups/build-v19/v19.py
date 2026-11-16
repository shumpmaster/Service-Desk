"""Build mockup v19 from v18: a layer only. The owner's round 5 (decisions/questions/P-005-design-round-5.md, answer 5), on round 4,
answer 17: each event that happened carries one plain sentence under it saying why, on a dotted line down to the event before it.
The drawing is the live option's own code (options-why/source/: why.css and why.js with WHY_OPT = 'C'), so the option the owner
chose and the mockup stay one. The reasons are examples.
python3 v19.py ../timeline-v18-craft.html ../timeline-v19-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
OPT = os.path.join(HERE, '..', 'options-why', 'source')
s = open(SRC, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

rd = lambda n: open(os.path.join(OPT, n), encoding="utf-8").read()
rep("<title>Desk Timeline v18</title>", "<title>Desk Timeline v19</title>")
rep("Mockup, version 18 (", "Mockup, version 19 (v18 with why things happen: under each event that happened, one plain sentence says why, on a dotted line down to the event before it, so the plan reads as a story; the agent's plan stays as the detail of how; the reasons are examples, since no record says yet why an event happened; then version 18: ")
i = s.rindex("</style>"); s = s[:i] + rd("why.css") + s[i:]
JS = "\n  /* ================= v19: why things happen (round 5, answer 5) ================= */\n  var WHY_OPT = 'C';\n" + rd("why.js")
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
