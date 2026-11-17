"""Build mockup v21 from v20: a layer only. The owner's round 5 (decisions/questions/P-005-design-round-5.md, answers 8 and 10 to 14):
the list is a tree whose ringed icons fold what sits under them; a "Why" tag and a "Needs" tag on the event open a bubble; the Needs
bubble is a plain checklist that opens the next layer in place; while it is open, its chain is ringed and joined on the map and in the list.
The drawing is the live options' own code, in the order they were chosen: options-hierarchy (HIER = '2'), options-why2 (WHY2 = 'B'),
options-needs2 (NEED4 = 'A'), options-bubble (BUB = '1'), options-chain (CHAIN = 'C').
python3 v21.py ../timeline-v20-craft.html ../timeline-v21-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda d, n: open(os.path.join(M, d, 'source', n), encoding="utf-8").read()
L = [('options-hierarchy', 'hier', "HIER = '2'"), ('options-why2', 'why2', "WHY2 = 'B'"), ('options-needs2', 'needs4', "NEED4 = 'A'"),
     ('options-bubble', 'bubble', "BUB = '1'"), ('options-chain', 'chain', "CHAIN = 'C'")]
rep("<title>Desk Timeline v20</title>", "<title>Desk Timeline v21</title>")
rep("Mockup, version 20 (", "Mockup, version 21 (v20 with the list as a tree, its ringed icons folding what sits under them; a Why tag and a Needs tag on each event open a bubble; the Needs bubble is a plain checklist, a chevron opening the next layer in place without moving the page; while it is open, its chain is ringed and joined on the map and in the list; requirements and reasons are examples; then version 20: ")
CSS = "".join(rd(d, n + '.css') for d, n, _ in L)
i = s.rindex("</style>"); s = s[:i] + CSS + s[i:]
JS = "\n  /* ================= v21: the tree, the event's tags and bubbles, the chain (round 5, answers 8, 10 to 14) ================= */\n" + "".join("\n  var " + v + ";\n" + rd(d, n + '.js') for d, n, v in L)
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
