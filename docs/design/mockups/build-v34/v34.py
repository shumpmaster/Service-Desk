"""Build mockup v34 from v33: a layer only. The owner's round 8, answer 6 (decisions/questions/P-005-design-round-8.md):
"I approve all as recommended", the recommended option of each of the 12 held changes drawn on options-r8-top/, -map/ and
-list/. The code is the options' own (options-r8/source/r8.css and r8.js), fixed to those options: build-v34/source/
(r8v34.css, r8v34.js). python3 v34.py ../timeline-v33-craft.html ../timeline-v34-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v33</title>", "<title>Desk Timeline v34</title>")
rep("Mockup, version 33 (", "Mockup, version 34 (v33 with the owner's round 8 rulings: a 38-point top row; Why a quiet fill like the link tag; a project pushes in from the right; the page opens on what waits on you; one map scale per phase; planned milestones on the map of a phase with no events; a second tap clears a milestone's selection; a handle folds the map to one line; each link names its session; milestone names in full; a dashed ring where nothing is on record; times in Chicago with a date on older events; then version 33: ")
rep("times in UTC.", "times in Chicago time (America/Chicago).")
i = s.rindex("</style>"); s = s[:i] + rd('r8v34.css') + s[i:]
a = '\n  render();\n})();\n</script>'
rep(a, '\n  render();\n' + rd('r8v34.js') + '\n})();\n</script>')
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
