"""Build mockup v44 from v43: a layer only. The owner's round 8, answers 27 and 28 (decisions/questions/P-005-design-round-8.md):
"This is perfect, I approve. Now start the plain words test" and, on the plain-words options, "All recommended. The only thing I want to add
is a branch toggle in the filters. And I want to add an automated session naming and handover required flags."
The plain-words pass, A + B + E + D and the five questions as recommended (build-v44/source/plain.js, plain.css, from options-r8-plain/source/);
the four faults the test found (faults.js); one clock everywhere (times.js); a branch toggle in the map's filter (branches.js); session names
and a handover-required flag (sessions.js; examples, no record carries them). The test: docs/design/audit-2026-11-27-v43-plain-words.md.
python3 v44.py ../timeline-v43-craft.html ../timeline-v44-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v43</title>", "<title>Desk Timeline v44</title>")
rep("Mockup, version 43 (", "Mockup, version 44 (v43 in plain words: plain titles first with codes after them in grey, a line on what each project, phase and sprint is, plain answers with the option beneath, plain role names and a glossary that says the workers are AI; the four faults the plain-words test found fixed; one clock everywhere; a branch toggle in the map's filter; session names and a handover flag, as examples; then version 43: ")
i = s.rindex("</style>"); s = s[:i] + rd('plain.css') + rd('extra.css') + s[i:]
a = "\n})();\n</script>"; i = s.rindex(a)
s = s[:i] + "\n" + "\n".join(rd(n) for n in ['faults.js', 'plain.js', 'times.js', 'branches.js', 'sessions.js']) + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
