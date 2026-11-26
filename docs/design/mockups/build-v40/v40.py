"""Build mockup v40 from v39: a layer only. The owner's round 8, answers 18 and 19 (decisions/questions/P-005-design-round-8.md):
"On the titles could we combine A, b and c somehow, my current concern is how the title looks identical to the cards / Go with the
recommendations on the others". The code: build-v40/source/ (filter-home.css and filter-home.js: the map filter A, home's search A and
more on home B, from options-r8-filter-home/source/; title.css and title.js: home's large title on a full-width glass band with the
ground's glow behind it, a small-caps live line and an accent mark, condensing into the slim bar, from options-r8-title/source/).
python3 v40.py ../timeline-v39-craft.html ../timeline-v40-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v39</title>", "<title>Desk Timeline v40</title>")
rep("Mockup, version 39 (", "Mockup, version 40 (v39 with a quick filter on the map card, home's search in the capsule, a line per project of who is at work and what is new, and home's title on a glass band of its own; then version 39: ")
i = s.rindex("</style>"); s = s[:i] + rd('filter-home.css') + rd('title.css') + s[i:]
a = "\n})();\n</script>"; i = s.rindex(a); s = s[:i] + "\n" + rd('filter-home.js') + "\n" + rd('title.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
