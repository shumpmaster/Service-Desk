# The whole-phase map drawn like the fitted one (round 7, answer 19). Patches applied to a built page's script, each checked.
# The fitted map (round 5, MilestoneMap) was built for one milestone; these let it take every milestone of the current phase when
# none is fitted, so the map never zooms and keeps its icons, the words in the window and on main, and the window in the centre.
PATCHES = [
    ("    if (!fk_) { MLANE = 30; return _mapDataFit(); }\n",
     "    if (!fk_ && !WHOLE) { MLANE = 30; return _mapDataFit(); }\n"),
    ("    var p = fk_.split(':'), b = +p[0], i = +p[1], it = PLANS[state.proj][b].items[i], all = [], key = {};\n    (it.sprints || []).forEach(function (sp, g) {\n",
     "    var all = [], key = {}, SEL_ = fk_ ? [fk_] : PLANS[state.proj][curB()].items.map(function (_, j) { return curB() + ':' + j; });\n"
     "    SEL_.forEach(function (fs_) { var p = fs_.split(':'), b = +p[0], i = +p[1], it = PLANS[state.proj][b].items[i];\n"
     "    (it.sprints || []).forEach(function (sp, g) {\n"),
    ("        key[b + ':' + i + ':' + g + ':' + e] = k;\n      });\n    });\n",
     "        key[b + ':' + i + ':' + g + ':' + e] = k;\n      });\n    }); });\n"),
    ("fit: fk_ };", "fit: fk_ || 'phase' };"),

    ("    inn.innerHTML = fitKey() ? fitSVG(MAP) : mapSVG(MAP);", "    inn.innerHTML = MAP && MAP.fit ? fitSVG(MAP) : mapSVG(MAP);"),
    ("if (L && fitKey()) L.h += MLB_H - 12;", "if (L && L.fit) L.h += MLB_H - 12;"),
]
def apply(s):
    for a, b in PATCHES:
        assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)
    return s

# the whole phase holds more lanes, so each sits a little closer; set before the map is built, kept while it is drawn
JS = """
  var WH_FL = FITLANE, _mapDataWh = mapData;
  mapData = function () { FITLANE = fitKey() ? WH_FL : 40; return _mapDataWh.apply(this, arguments); };
"""
