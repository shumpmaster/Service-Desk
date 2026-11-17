"""Build mockup v16 from v15: a layer only. The owner's round 4 (decisions/questions/P-005-design-round-4.md, answers 13 to 16):
a project's page has one floating header: a slim bar (back, the title in 17 with the status in 12, the bell and More), the
slim project pills right under it, then the branch map and the phase row, all floating together.
The drawing is the live option's own code (options-pills-header/source/: pills.css and pills.js with PILLS = 'B', hdr.css and
hdr.js with HDR = '1'), so the option the owner chose and the mockup stay one.
python3 v16.py ../timeline-v15-craft.html ../timeline-v16-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
OPT = os.path.join(HERE, '..', 'options-pills-header', 'source')
s = open(SRC, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

rd = lambda n: open(os.path.join(OPT, n), encoding="utf-8").read()
rep("<title>Desk Timeline v15</title>", "<title>Desk Timeline v16</title>")
rep("Mockup, version 15 (", "Mockup, version 16 (v15 with one floating header on a project's page: a slim bar with the title and status, the slim project pills right under it, then the branch map and the phase row, all floating together; the large title leaves a project's page; then version 15: ")
CSS = rd("pills.css") + rd("hdr.css")
i = s.rindex("</style>"); s = s[:i] + CSS + s[i:]
JS = "\n  /* ================= v16: the project's floating header (round 4, answers 13 to 16) ================= */\n  var PILLS = 'B', HDR = '1';\n" + rd("pills.js") + rd("hdr.js")
rep("\n  render();\n})();\n</script>", JS + "\n  render();\n})();\n</script>")
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
