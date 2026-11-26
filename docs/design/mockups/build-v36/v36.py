"""Build mockup v36 from v35: a layer only. The owner's round 8, answers 10 and 12 (decisions/questions/P-005-design-round-8.md):
"Draw those options next"; "I want all 8 as recommended". Option A of each item drawn on options-r8-purpose/: each count said once;
the usual actor's "by" line dropped; no Now card, a NOW tag on the stop; the pill's count opens what waits; an At work now row;
new since you last looked; how long each wait lasted; tokens and context in the session bubble.
The code is the options' own (options-r8-purpose/source/pp.css and pp.js), fixed to A: build-v36/source/ (purpose.css, purpose.js).
python3 v36.py ../timeline-v35-craft.html ../timeline-v36-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v35</title>", "<title>Desk Timeline v36</title>")
rep("Mockup, version 35 (", "Mockup, version 36 (v35 with what serves no purpose cut and what was missing added, as the owner ruled: each count said once; the usual actor's line dropped; no Now card, a NOW tag on the stop; the pill's count opens what waits on you; who is at work now; new since you last looked; how long each wait lasted; tokens and context in the session bubble (the last-looked time and the context meter are examples); then version 35: ")
# 4A: the top row's handler (v31) asks v36 first whether the tap fell on the count
rep("    if (pj) { e.stopImmediatePropagation();", "    if (pj && window.__v36count && window.__v36count(e)) { e.stopImmediatePropagation(); e.preventDefault(); return; }\n    if (pj) { e.stopImmediatePropagation();")
i = s.rindex("</style>"); s = s[:i] + rd('purpose.css') + s[i:]
a = '\n})();\n</script>'; i = s.rindex(a)
s = s[:i] + '\n' + rd('purpose.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
