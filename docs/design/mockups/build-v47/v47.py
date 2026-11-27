"""Build mockup v47 from v46: a layer only. The owner's round 9, answers 1 and 2 (decisions/questions/P-005-design-round-9.md):
"It looks great so far, maybe just lighten the background up a tad?", then "C": in light, the ground half a step lighter and its colour
fields a little softer (options-r9-lighter/, option C). Dark is unchanged. python3 v47.py ../timeline-v46-craft.html ../timeline-v47-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v46</title>", "<title>Desk Timeline v47</title>")
rep("Mockup, version 46 (", "Mockup, version 47 (v46 with the background a tad lighter in light; then version 46: ")
i = s.rindex("</style>"); s = s[:i] + rd('ground.css') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
