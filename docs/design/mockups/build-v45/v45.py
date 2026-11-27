"""Build mockup v45 from v44: a layer only. The owner's round 8, answer 30 (decisions/questions/P-005-design-round-8.md), a comment on
v44's home: "Could we maybe concert this single phase indicator to a smaller series of the phases? Or something of the sort. And then put
the waiting time on the line". Each project's ring becomes a small series of its four phases with the gates between (series.js, series.css);
its strip carries the wait as a stretch on the line, labelled. And v44's leftovers (fixes.js, fixes.css; one text patch to v41's filter so
the hidden count is said once, on the nearest heading). python3 v45.py ../timeline-v44-craft.html ../timeline-v45-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v44</title>", "<title>Desk Timeline v45</title>")
rep("Mockup, version 44 (", "Mockup, version 45 (v44 with a small series of each project's four phases on home in place of its ring, and the wait drawn on the project's line; the hidden count said once; main's words plain on the map; the gate captions kept clear; then version 44: ")
# the hidden count, once: a heading counts only the hidden rows that no heading inside it holds (a heading folded away passes its count up)
rep("var hid = rows.filter(function (e) { return e.__fh41h; }).length, keep = rows.length - hid;",
    "var inner = [].filter.call(bk.querySelectorAll('.v13gr'), function (x) { return x !== h; }).map(block).filter(function (b) { return b && b !== bk && !b.__fh41g; });"
    " var hidAll = rows.filter(function (e) { return e.__fh41h; }).length, keep = rows.length - hidAll;"
    " var hid = rows.filter(function (e) { return e.__fh41h && !inner.some(function (b) { return b.contains(e); }); }).length;")
i = s.rindex("</style>"); s = s[:i] + rd('series.css') + rd('fixes.css') + s[i:]
a = "\n})();\n</script>"; i = s.rindex(a)
s = s[:i] + "\n" + rd('series.js') + "\n" + rd('fixes.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
