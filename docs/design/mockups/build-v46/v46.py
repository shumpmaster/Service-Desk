"""Build mockup v46 from v45: a layer only. The owner's round 8, answers 31 and 32 (decisions/questions/P-005-design-round-8.md): "Is there
any room to put a quick summary of what the project is about, and a kind of snapshot text summary of the bigger picture we are working on",
then "Option C please": one line at the head of the map card, saying where the project stands, opening "About this project" (its purpose, a
snapshot, its phases at a glance, what waits on you). The code is options-r8-summary/source/ (sm.js, sm.css), option C only, here per project
(summary.js, summary.css). python3 v46.py ../timeline-v45-craft.html ../timeline-v46-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v45</title>", "<title>Desk Timeline v46</title>")
rep("Mockup, version 45 (", "Mockup, version 46 (v45 with one line at the head of the map card saying where the project stands, opening a summary of what the project is about and the bigger picture; then version 45: ")
i = s.rindex("</style>"); s = s[:i] + rd('summary.css') + s[i:]
a = "\n})();\n</script>"; i = s.rindex(a)
s = s[:i] + "\n" + rd('summary.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
