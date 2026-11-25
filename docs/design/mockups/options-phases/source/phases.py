# Round 7, answer 20 (decisions/questions/P-005-design-round-7.md): every phase stays in the list, and the whole-phase map gets more
# room. Checked patches to a built v30 page's script.
LANE = "    sps.forEach(function (s) { var l = 1; while (busy[l] !== undefined && busy[l] >= s.a) l++; s.lane = l; busy[l] = s.b; });\n"
PATCHES = [
    # the list: every phase and gate, top down, in place; none swapped out
    ("    for (var b = plan.length - 1; b >= 0; b--) if (plan[b].type === 'phase' && b !== cb && state.v13x[fk(b)]) h += phase13(b);\n    return h + phase13(cb) + '<div class=\"v13end\"></div>';\n",
     "    for (var b = 0; b < plan.length; b++) h += plan[b].type === 'phase' ? phase13(b) : gate13(b);   /* every phase, in place (round 7, answer 20) */\n    return h + '<div class=\"v13end\"></div>';\n"),
    # every phase heading folds and opens the same way; each starts open, its milestones folded
    ("    var blk = PLANS[state.proj][b], cur = b === curB(), g = phGauge(b), key = 'ph:' + b, open = cur ? !state.open[fk(key) + ':shut'] : true;\n",
     "    var blk = PLANS[state.proj][b], cur = b === curB(), g = phGauge(b), key = 'ph:' + b, open = !state.open[fk(key) + ':shut'];\n"),
    ("(cur ? ' data-v13fold=\"' + key + '\"' : ' data-v13phase=\"' + esc(blk.name.toLowerCase()) + '\" data-b=\"' + b + '\"')",
     "' data-v13fold=\"' + key + '\"'"),
    # the whole-phase map's lanes a little further apart (40, each sprint on a lane of its own)
    ("FITLANE = fitKey() ? WH_FL : 40;", "FITLANE = fitKey() ? WH_FL : 40;"),
    # the map: the phase in view, not only the current one
    ("PLANS[state.proj][curB()].items.map(function (_, j) { return curB() + ':' + j; })",
     "PLANS[state.proj][viewB()].items.map(function (_, j) { return viewB() + ':' + j; })"),
]
def apply(s):
    for a, b in PATCHES:
        assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)
    # in the whole-phase map each sprint takes a lane of its own, so no two sprint names share a line
    i = s.index("SEL_ = fk_"); j = s.index(LANE, i)
    s = s[:j] + LANE.replace("busy[l] >= s.a", "(!fk_ || busy[l] >= s.a)") + s[j + len(LANE):]
    return s
