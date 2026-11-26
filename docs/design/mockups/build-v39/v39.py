"""Build mockup v39 from v38: a layer only. The owner's round 8, answer 17, a comment on v38 (decisions/questions/P-005-design-round-8.md):
"The branch map needs more space to breath away from the other elements. And I want the map to entirely fit within its own space within
the outline here if that makes sense? And I want it to have the glass look as well not just flat white". The code: build-v39/source/
(card.css: room, the inner box, glass; inner.js: the map's width is the card's inner width, used where v38 read the card's whole width).
python3 v39.py ../timeline-v38-craft.html ../timeline-v39-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v38</title>", "<title>Desk Timeline v39</title>")
rep("Mockup, version 38 (", "Mockup, version 39 (v38 with the map card given room, the whole map inside its outline, and glass; then version 38: ")
i = s.rindex("</style>"); s = s[:i] + rd('card.css') + s[i:]
# the map's width: the card's inner width (v38 read clientWidth, which now includes the card's padding)
rep("function vpW() { var v = document.querySelector('#v13band .v13vp'); return v && v.clientWidth || 393; }",
    rd('inner.js') + "  function vpW() { var v = document.querySelector('#v13band .v13vp'); return v && __vpIn(v) || 393; }")
rep("vp.clientWidth", "__vpIn(vp)", 3)
# lane names keep clear of the right gate's line and caption, now inside the card
rep("(typeof pan13 === 'number' ? pan13 : 0) + __vpIn(vp)) - 6;", "(typeof pan13 === 'number' ? pan13 : 0) + __vpIn(vp)) - (vp.querySelector('.kn-mgate.r') ? 30 : 6);")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
