"""Build mockup v42 from v41: a layer only. The owner's round 8, answer 25 (decisions/questions/P-005-design-round-8.md), with a
screenshot of v41's home on the phone inside the Claude app (docs/design/references/2026-11-27-v41-home-on-phone.jpg):
"1 - empty space is definitely not gone 2- can we please increase the glass look as well?" The top inset is counted once and capped
at a phone's own (--sat), the stray 18 margin and the page's 4 above the band are gone; every glass surface is clearly glass.
The code: build-v42/source/ (sat.css, sat.js, glass.css).
python3 v42.py ../timeline-v41-craft.html ../timeline-v42-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v41</title>", "<title>Desk Timeline v42</title>")
rep("Mockup, version 41 (", "Mockup, version 42 (v41 with the top of the screen fixed for phones and the Claude app: the top inset counted once and capped at a phone's own, nothing else above the band; and every glass surface clearly glass, the ground's colours a little stronger; then version 41: ")
i = s.rindex("</style>"); s = s[:i] + rd('sat.css') + rd('glass.css') + s[i:]
a = "\n})();\n</script>"; i = s.rindex(a); s = s[:i] + "\n" + rd('sat.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
