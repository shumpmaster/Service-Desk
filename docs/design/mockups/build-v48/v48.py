"""Build mockup v48 from v47: a layer only. The owner's round 9, answers 3 and 4 (decisions/questions/P-005-design-round-9.md): "I like the
earlier option you recommended. For this one, can you find a way to incorporate the actual checks instead of just “checks passed”", then
"A and no". The Needs-you tab as option A of options-r9-needs/ (needs.js, needs.css), with the sheets for each kind of ask; the pull request's
checks as option A of options-r9-pr-checks/ (checks.js, checks.css), the owner's own say folded into the Merge answer, not shown as a check;
and the fault found on the way: home's priority list kept on coming back from a project (keep.js, and the renamed widget row's event line).
python3 v48.py ../timeline-v47-craft.html ../timeline-v48-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v47</title>", "<title>Desk Timeline v48</title>")
rep("Mockup, version 47 (", "Mockup, version 48 (v47 with the Needs-you tab, the sheets for each kind of ask, the pull request's checks named, and home's list kept on coming back; then version 47: ")
# v41's event lines: the widget's row under the title v44 gave it, so home's list can be built again after a re-draw
rep("      'The widget failed its readiness check: resubmit or stop?': ['Review', '1.8.1.2', 'Readiness check failed', 'The brief']\n",
    "      'The widget failed its readiness check: resubmit or stop?': ['Review', '1.8.1.2', 'Readiness check failed', 'The brief'],\n"
    "      'Your call: resubmit the widget’s brief, or stop?': ['Review', '1.8.1.2', 'Readiness check failed', 'The brief']   /* v48: the title v44 gave it */\n")
i = s.rindex("</style>"); s = s[:i] + rd('needs.css') + '\n' + rd('checks.css') + s[i:]
a = "\n})();\n</script>"; i = s.rindex(a)
s = s[:i] + "\n" + rd('needs.js') + "\n" + rd('checks.js') + "\n" + rd('keep.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
