"""Build mockup v38 from v37: a layer only. The owner's round 8, answer 16 (decisions/questions/P-005-design-round-8.md):
"I like option a" (the ground, options-r8-ground/: three pale fields fixed behind everything, faint glows in dark) and "For the branch
chart can you put an outline around it and step it out a bit that way it has some depth and doesn't inherently blend in with the
timeline below" (the map as a raised card). The code: build-v38/source/ (ground.css from options-r8-ground/source/gr.css fixed to A;
card.css; ground.js keeps the band's field lined up with the screen). python3 v38.py ../timeline-v37-craft.html ../timeline-v38-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v37</title>", "<title>Desk Timeline v38</title>")
rep("Mockup, version 37 (", "Mockup, version 38 (v37 on a ground of three pale colour fields, with the branch map raised as a card; then version 37: ")
i = s.rindex("</style>"); s = s[:i] + rd('ground.css') + rd('card.css') + s[i:]
a = '\n})();\n</script>'; i = s.rindex(a)
s = s[:i] + '\n' + rd('ground.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
