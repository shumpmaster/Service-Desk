  /* Options for the owner's comment on the weight options (round 6, answer 6): "Any situation where something touches main branch
     should get a label. Anything not on main should only get labels if it is inside the blue box." A layer over v24 inside its
     script. MLB = '1' | '2'. On the fitted map, a sprint's events keep their words only inside the window (as now); every event on
     main carries its words wherever it sits, in a strip under main that the map grows by to hold them.
     1: under each icon. The short title wraps onto up to two lines; where neighbours on main are too close it shortens to the
        number (#443), and where even that would touch, every other label drops a line.
     2: spread along main. Each label sits as near its icon as it can without touching the one before, in one row, joined to
        its icon by a thin line. */
  var MLB_H = MLB === '1' ? 32 : 26;
  var _mapDataMl = mapData;
  mapData = function () { var L = _mapDataMl.apply(this, arguments); if (L && fitKey()) L.h += MLB_H - 12; return L; };
  var _fitSVGMl = fitSVG;
  fitSVG = function (L) {
    var on = L.on, mains = L.all.filter(function (ev) { return ev.x.k === 'merge'; }).sort(function (a, b) { return L.X[a.k] - L.X[b.k]; });
    if (on) { var o2 = {}; Object.keys(on).forEach(function (k) { if (!mains.some(function (m) { return String(m.k) === k; })) o2[k] = on[k]; }); L.on = o2; }
    var svg = _fitSVGMl(L); L.on = on;
    var y = L.ym + 21, lab = '', words = function (ev) { return shortTitle(ev.x); }, num = function (ev) { var m = /#\d+/.exec(ev.x.title); return m ? m[0] : words(ev); };
    if (MLB === '1') {
      mains.forEach(function (ev, j) {
        var x = L.X[ev.k], gl = j ? x - L.X[mains[j - 1].k] : 999, gr = j < mains.length - 1 ? L.X[mains[j + 1].k] - x : 999;
        var gap = Math.min(gl, gr, 76, 2 * Math.min(x, L.w - x)), ch = Math.floor((gap - 6) / 5.6);
        var lines = ch >= 7 ? wrapWords(words(ev), ch, 2) : [num(ev)];
        var drop = ch < 7 && gap < 28 && j % 2 === 1 ? 11 : 0;
        lab += '<text class="fl ml" x="' + x + '" y="' + (y + drop) + '">' + lines.map(function (l, i) { return '<tspan x="' + x + '"' + (i ? ' dy="10.5"' : '') + '>' + esc(l) + '</tspan>'; }).join('') + '</text>';
      });
    } else {
      var pos = [], lo = 40;
      mains.forEach(function (ev) { var t = clip(words(ev), 14), w = t.length * 5.4 + 8, x = Math.max(L.X[ev.k], lo + w / 2); pos.push({ ev: ev, t: t, w: w, x: x }); lo = x + w / 2; });
      for (var j = pos.length - 1, hi = L.w - 6; j >= 0; j--) { if (pos[j].x + pos[j].w / 2 > hi) pos[j].x = hi - pos[j].w / 2; hi = pos[j].x - pos[j].w / 2; }
      pos.forEach(function (q) {
        var x0 = L.X[q.ev.k];
        lab += '<path class="ml-lead" d="M' + x0 + ' ' + (L.ym + 11) + ' C' + x0 + ' ' + (L.ym + 15) + ' ' + q.x + ' ' + (L.ym + 11) + ' ' + q.x + ' ' + (L.ym + 15) + '"/>' +
          '<text class="fl ml" x="' + q.x + '" y="' + (y + 3) + '">' + esc(q.t) + '</text>';
      });
    }
    var z = svg.lastIndexOf('</svg>');
    return svg.slice(0, z) + lab + svg.slice(z);
  };
