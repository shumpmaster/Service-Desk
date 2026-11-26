"""Build mockup v35 from v34: a layer only. The owner's round 8, answers 8 and 9 (decisions/questions/P-005-design-round-8.md):
"Honestly love every option. Especially the research functionality"; "I want you to go with ever option you recommended so if
those are all A then do that". Option A of each kind drawn on options-r8-kinds/: a gate as a row closing its phase with its sheet,
a decision carrying your words, research as its own level with its memo, a stop with its rule, what it holds up and Answer.
The code is the option's own (options-r8-kinds/source/kn.css and kn.js), fixed to A: build-v35/source/ (kinds.css, kinds.js).
python3 v35.py ../timeline-v34-craft.html ../timeline-v35-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v34</title>", "<title>Desk Timeline v35</title>")
rep("Mockup, version 34 (", "Mockup, version 35 (v34 with gates, decisions, research and stops shown as the owner ruled: a gate is a row closing its phase, its state and Yours, marked on the map, opening a sheet; a decision says it carries your words; research is its own level with its memo; a stop says the rule that fired, what it holds up, and offers Answer (an example: it records nothing); then version 34: ")
# the stop's tag now reads "Yours · waiting", so the landing (v34, F2) also knows the waiting stop by its mark
rep("return /Waiting on you/.test(e.textContent) && /Stop card/.test(e.textContent); })[0]", "return (/Waiting on you/.test(e.textContent) || e.dataset.knWait) && /Stop card/.test(e.textContent); })[0]")
i = s.rindex("</style>"); s = s[:i] + rd('kinds.css') + s[i:]
a = '\n})();\n</script>'; i = s.rindex(a)
s = s[:i] + '\n' + rd('kinds.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
