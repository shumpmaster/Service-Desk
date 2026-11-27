"""Build mockup v41 from v40: a layer only. The owner's round 8, answer 20 (decisions/questions/P-005-design-round-8.md), a comment on
v40's home title band: "Why so much empty space here?" The title block rises into the slim bar's slot: the live label on the capsule's
row, the title under it, the mark under the title, the band 14 below the mark; the slot catches no taps but the capsule's until the bar
takes over. The project lines on home are worded to read on one line. Answer 21, a comment on v40's Longest wait row ("Can we make this Liquid Glass style too?"): home's project groups become glass like
the map card. Answer 22 ("Can you add the title of the “event” or step that is waiting on me on the main page?"): each waiting row on home
names the event it hangs from. Answer 23 ("When things are filtered I would like the table to adjust and show me only that filtered
view."): the list shows only what a cut matches. The code: build-v41/source/ (header.css, header.js, cards.css, events.js,
filter41.css, filter41.js).
python3 v41.py ../timeline-v40-craft.html ../timeline-v41-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v40</title>", "<title>Desk Timeline v41</title>")
rep("Mockup, version 40 (", "Mockup, version 41 (v40 with home's title band closed up: the live label on the capsule's row, the title under it, no empty slot above; each project line on one line, home's project cards in glass, each waiting row naming the event it hangs from, and the filtered list showing only what matches; then version 40: ")
# the project lines: who is at work and what is new, short enough for one line at 393
rep("<span><b>Chief of Staff</b> at work since 7:52 am</span>", "<span><b>Chief of Staff</b> · since 7:52 am</span>")
rep("<span>Nothing at work · it waits on you</span><span class=\"new\">nothing new</span>", "<span>Nothing at work</span><span class=\"new\">nothing new</span>")
# the filter (answer 23): what each station is (its kind, whether it is yours) is kept across the map's redraws, so a cut keeps
# matching rows of a phase the map is not drawing at the moment (the list now shortens, and the map follows the phase in view)
rep("    return info;\n  }\n  function fhMatch(p, i) {", "    var C41 = window.__fhC41 || (window.__fhC41 = {}); Object.keys(info).forEach(function (k) { C41[k] = info[k]; });\n    Object.keys(C41).forEach(function (k) { if (!info[k]) info[k] = { kind: C41[k].kind, you: C41[k].you, main: C41[k].main, g: document.createElement('i') }; });\n    return info;\n  }\n  function fhMatch(p, i) {")
# the phase in view skips a phase the filtered list has folded away (a hidden section measures 0 high)
rep("[].slice.call(L.querySelectorAll('.v13phase')).forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= c.y) hit = s; });", "[].slice.call(L.querySelectorAll('.v13phase')).forEach(function (s) { var r = s.getBoundingClientRect(); if (r.height && r.top <= c.y) hit = s; });")
# v40's fhApply hands the list to v41's __fh41 once it has marked what a cut leaves out
rep("      e.classList.toggle('fh-out', !keep);\n    });\n    fhUI(info, lane);", "      e.classList.toggle('fh-out', !keep);\n    });\n    if (window.__fh41) window.__fh41(on);\n    fhUI(info, lane);")
i = s.rindex("</style>"); s = s[:i] + rd('header.css') + rd('cards.css') + rd('filter41.css') + s[i:]
a = "\n})();\n</script>"; i = s.rindex(a); s = s[:i] + "\n" + rd('header.js') + "\n" + rd('events.js') + "\n" + rd('filter41.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
