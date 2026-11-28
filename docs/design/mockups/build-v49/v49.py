"""Build mockup v49 from v48: a layer only. The owner's round 9, answer 5 (decisions/questions/P-005-design-round-9.md): "I approve all
of your recommendations", read as option A of docs/design/mockups/options-r9-gate/ for both: the open gate a sheet (the ask; the case's
opening with Read the whole case; what the Critic says; the user representative, not needed as the owner is the user; each choice with what
follows; Kill marked "Can't be undone"; records as rows), its row "Yours · open" on the timeline's list and row 1 on home with its four
choices as buttons and "Read the case and rule"; the reader one plain page for any record, opened from every sheet's Records rows. Records
are read inside the desk with GitHub one tap away (setting aside P-001-design-lab-open answer 9, "Linked", for the timeline design).
gate.js and gate.css are option A of options-r9-gate/source/ gr.js and gr.css, with no hash switching and no theme-by-hash script.
python3 v49.py ../timeline-v48-craft.html ../timeline-v49-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v48</title>", "<title>Desk Timeline v49</title>")
rep("Mockup, version 48 (", "Mockup, version 49 (v48 with a gate open for your ruling and a reader for any record; then version 48: ")
# v35's map marks: each gate's mark carries its name as a data attribute, so the open gate's mark is found by it, not by its words
rep("d.className = 'kn-mgate ' + x[1] + (ok ? ' ok' : ''); d.style[x[1] === 'l' ? 'left' : 'right'] = '10px';",
    "d.className = 'kn-mgate ' + x[1] + (ok ? ' ok' : ''); d.setAttribute('data-kngate', g.name); d.style[x[1] === 'l' ? 'left' : 'right'] = '10px';")
# the At-work sheet says what it is by a data attribute, so its Records can take the handover it started from
rep("'<div class=\"kd\">At work now</div>", "'<div class=\"kd\" data-ppk=\"work\">At work now</div>")
i = s.rindex("</style>"); s = s[:i] + rd('gate.css') + '\n' + s[i:]
a = "\n})();\n</script>"; i = s.rindex(a)
s = s[:i] + "\n" + rd('gate.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
