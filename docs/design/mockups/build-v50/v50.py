"""Build mockup v50 from v49: a layer only. The owner's round 9, answer 6 (decisions/questions/P-005-design-round-9.md): "I agree, only
caveat is the branch map you drew up looks very different than the others", read as option A of docs/design/mockups/options-r9-states/ for a
project with no plan (the same page as every planned project: top row with No phases yet, the map card with the summary line, the list of
what happened oldest first with real state words) and the four states as drawn there (nothing waiting, checking, can't read, the first open),
previewed from More's "Mockup only" menu. The caveat: a quiet project's branch map is the mockup's own map, drawn by the same renderer as The
timeline's, fed with a phase-less plan (main and its recent branches; no phase row, no milestone selection, no gates).
np.js and np.css carry option A's list and the states of options-r9-states/source/ st.js and st.css, with no hash switching, no theme script
and no page or map of their own.
python3 v50.py ../timeline-v49-craft.html ../timeline-v50-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v49</title>", "<title>Desk Timeline v50</title>")
rep("Mockup, version 49 (", "Mockup, version 50 (v49 with every project on the same page, its map drawn like the others, and the empty and can't-read states; then version 49: ")

# "undefined" on a quiet project's rows: v30's layer declared `var SL = 'A';` in the same scope as the table of state words `SL`
# (`var SL = { done: 'Done', ... }`), so from then on every SL[x.s] read undefined. v30's option is renamed SLV; every use of it is listed.
assert s.count("var SL = { done: 'Done', running: 'Running', failed: 'Failed', you: 'Waiting on you', idle: 'Not started' };") == 1
rep("  var SL = 'A';\n", "  var SLV = 'A';   /* v50: was SL, which overwrote the table of state words of the same name */\n")
rep("map. A layer over v29. SL = 'A' | 'B' | 'C'.", "map. A layer over v29. SLV = 'A' | 'B' | 'C'.")
rep("function slUnfit() { if (SL === 'B') return false; var k = fitKey(); if (!k) return false; state.sl[state.proj] = SL === 'A' ? k : null;",
    "function slUnfit() { if (SLV === 'B') return false; var k = fitKey(); if (!k) return false; state.sl[state.proj] = SLV === 'A' ? k : null;")
rep("    if (SL === 'B') { slStrip(); return; }\n    var sel = state.sl[state.proj]; if (SL !== 'A' || !sel) return;",
    "    if (SLV === 'B') { slStrip(); return; }\n    var sel = state.sl[state.proj]; if (SLV !== 'A' || !sel) return;")
rep("var _v13syncSl = v13sync; v13sync = function () { var r = _v13syncSl.apply(this, arguments); if (SL === 'A') slMark(); return r; };",
    "var _v13syncSl = v13sync; v13sync = function () { var r = _v13syncSl.apply(this, arguments); if (SLV === 'A') slMark(); return r; };")
import re
assert not re.search(r"\bSL\s*(===|!==|=\s*')", s), "an SL option test is left"

# the one adaptation of the map's renderer: a merge into a branch (operating model's build joining the fix's branch) stays on its
# branch; a planned project has none (x.into is never set on its events), so its map is drawn exactly as before
rep("on = s.evs.filter(function (ev) { return ev.x.k !== 'merge'; });", "on = s.evs.filter(function (ev) { return ev.x.k !== 'merge' || ev.x.into; });")
rep("var main = ev.x.k === 'merge', cx = L.X[ev.k]", "var main = ev.x.k === 'merge' && !ev.x.into, cx = L.X[ev.k]")
rep("var main = ev.x.k === 'merge', s = L.sps", "var main = ev.x.k === 'merge' && !ev.x.into, s = L.sps", 2)
rep("mains = L.all.filter(function (ev) { return ev.x.k === 'merge'; })", "mains = L.all.filter(function (ev) { return ev.x.k === 'merge' && !ev.x.into; })")

i = s.rindex("</style>"); s = s[:i] + rd('np.css') + '\n' + s[i:]
a = "\n})();\n</script>"; i = s.rindex(a)
s = s[:i] + "\n" + rd('np.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
