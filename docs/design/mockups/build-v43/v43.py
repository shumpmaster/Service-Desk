"""Build mockup v43 from v42: a layer only. The owner's round 8, answers 24 and 26 (decisions/questions/P-005-design-round-8.md):
"I need the structure to be aimed at events that I'm needed on. Like a priority list for my actions" and, on the options,
"This option A is the one, however. I don't like that pr446 has effectively 3 things associated with it, unless those are all 3
independent questions?" Home becomes option A (one numbered list across projects, the projects below without their waiting rows),
and the three questions of PR #446, answered on 14 November at about 14:47 UTC (decisions/questions/P-005-s011-widths.md,
P-005-s011-m8-reading.md, P-005-definer-pack.md), before the mockup's as-of time (17:25 UTC), no longer wait anywhere.
The code: build-v43/source/ (priority.css, priority.js, answered.css, answered.js), from options-r8-priority/source/.
python3 v43.py ../timeline-v42-craft.html ../timeline-v43-craft.html"""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
H = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding="utf-8").read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)
rd = lambda n: open(os.path.join(H, 'source', n), encoding="utf-8").read()
rep("<title>Desk Timeline v42</title>", "<title>Desk Timeline v43</title>")
rep("Mockup, version 42 (", "Mockup, version 43 (v42 with home as one priority list of the owner's actions across projects, the projects below; and the three questions of PR #446 shown as answered, since the owner answered them at 8:47 am, before this moment; then version 42: ")

# --- the three #446 questions leave everything that shows them as waiting (answered 14:47 UTC, 8:47 am CT) ---
# NEEDS: home, the pill counts, the bell, the filter's Yours cut and the Context view all count from it.
for t in ["Which phone widths must the timeline fit?", "Is the spec’s reading of “each thing reaches my phone” enough for M8?",
          "Let the spec writer see the experiment files and your answers?"]:
    i = s.index("    { p: 'tl', k: 'decision', t: '14:46', title: '" + t + "'")
    j = s.index("\n", s.index("href:", i)) + 1
    s = s[:i] + s[j:]
rep("title: 'Merged PR #446: three questions for you', meta: 'they wait on you',",
    "title: 'Merged PR #446: three questions for you', meta: 'one question each: the phone widths, M8’s reading and the spec writer’s files',")
rep("'Merged PR #446: three questions for you', 'they still wait on you')", "'Merged PR #446: three questions for you', 'one question each: the phone widths, M8’s reading and the spec writer’s files')")
rep("'Spec S-011|Merged PR #446: three questions for you': ['wait', 'Awaiting your answers']",
    "'Spec S-011|Merged PR #446: three questions for you': ['ok', 'Answered']")
rep("['wait', 'Your answers to PR #446’s three questions', S11 + 'Merged PR #446: three questions for you']",
    "['ok', 'Your answers to PR #446’s three questions', S11 + 'Merged PR #446: three questions for you']")
# the widget's plan pointed at NEEDS by position (4); with three entries gone it is 1
rep("name: 'Readiness card: resubmit or stop?', st: 'now', need: 4 }", "name: 'Readiness card: resubmit or stop?', st: 'now', need: 1 }")
# the wait sheet (v36) and its records
i = s.index("    { k: 'q', t: 'Which phone widths must the timeline fit?'"); j = s.index("];", i)
s = s[:i].rstrip().rstrip(',') + ' ' + s[j:]
rep("<h2>4 things wait on you in The timeline</h2>", "<h2>' + PPW.length + (PPW.length === 1 ? ' thing waits' : ' things wait') + ' on you in The timeline</h2>")
rep("PR #446 (the three questions). The question’s Answer is an example.", "PR #446’s three questions, answered at 8:47 am (decisions/questions/P-005-s011-widths.md, P-005-s011-m8-reading.md, P-005-definer-pack.md). Answer is an example.")
rep("'Waiting on you · 4</div>'", "'Waiting on you · ' + PPW.length + '</div>'")
rep("'Merged PR #446: three questions for you': ['waiting 2 h 39 min', 1]", "'Merged PR #446: three questions for you': ['answered at 8:47 am', 0]")
rep("'Spec S-011': 'waiting on you 2 h 39 min so far'", "'Spec S-011': 'waiting on you 1 h 43 min so far'")

i = s.rindex("</style>"); s = s[:i] + rd('priority.css') + rd('answered.css') + s[i:]
a = "\n})();\n</script>"; i = s.rindex(a); s = s[:i] + "\n" + rd('priority.js') + "\n" + rd('answered.js') + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
