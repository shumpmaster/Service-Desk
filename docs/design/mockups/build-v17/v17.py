"""Build mockup v17 from v16: a layer only. The owner's round 5 (decisions/questions/P-005-design-round-5.md, answers 1 to 3):
an event that still needs something shows it, hung from it as a checklist of small event rows (C1's look with C2's checks),
then what it unlocks; a requirement that is a plan's action reads as that action, and the action says which event needs it.
The drawing is the live option's own code (options-needs/source/: needs*.css and needs*.js with NEEDS_OPT = 'M'), so the
option the owner chose and the mockup stay one. Requirements, and the three planned events added to S-011, are examples.
python3 v17.py ../timeline-v16-craft.html ../timeline-v17-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
OPT = os.path.join(HERE, '..', 'options-needs', 'source')
s = open(SRC, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

rd = lambda n: open(os.path.join(OPT, n), encoding="utf-8").read()
rep("<title>Desk Timeline v16</title>", "<title>Desk Timeline v17</title>")
rep("Mockup, version 16 (", "Mockup, version 17 (v16 with what an event needs: an event that still needs something shows, hung from it, a checklist of small event rows, each wearing the tag of the event it points to, then what it unlocks; tapping one goes to it; a requirement that is an action of the agent's plan reads as that action, and the action says which event needs it; requirements, and three planned events at the top of S-011, are examples, since no record says yet which event needs which; then version 16: ")
CSS = rd("needs.css") + rd("needs2.css") + rd("needs3.css")
i = s.rindex("</style>"); s = s[:i] + CSS + s[i:]
JS = "\n  /* ================= v17: what an event needs (round 5, answers 1 to 3) ================= */\n  var NEEDS_OPT = 'M';\n" + rd("needs.js") + rd("needs2.js") + rd("needs3.js")
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
