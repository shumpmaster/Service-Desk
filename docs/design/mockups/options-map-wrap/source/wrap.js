  /* Options for the owner's comment on v21 (round 6, answer 2): "Can we wrap text within the blue box?"
     A layer over v22 inside its script. WRAP = 'A' | 'B' | 'C'. The events in the map's window keep their columns; the words wrap
     by whole words instead of being cut to one short line.
     A: the kind in bold, then the short title wrapping onto up to three lines; the rows of the map sit 12 further apart.
     B: no kind word (the icon already says it); the short title takes its place, wrapping onto up to three tighter lines; the map keeps its height.
     C: the kind in bold, then the whole title, not shortened, wrapping onto up to four lines; the rows sit 24 further apart. */
  FITLANE = WRAP === 'A' ? 62 : WRAP === 'C' ? 74 : 50;
  function wrapWords(s, ch, max) {
    var w = s.split(/\s+/), out = [], cur = '';
    for (var i = 0; i < w.length; i++) {
      var t = cur ? cur + ' ' + w[i] : w[i];
      if (t.length <= ch || !cur) { cur = t; continue; }
      out.push(cur); cur = w[i];
      if (out.length === max) { cur = null; break; }
    }
    if (cur !== null && cur) out.push(cur);
    var more = cur === null || out.length > max;
    out = out.slice(0, max).map(function (l) { return clip(l, ch); });
    if (more) { var z = out.length - 1; out[z] = clip(out[z] + '…', ch); if (!/…$/.test(out[z])) out[z] = out[z].slice(0, -1) + '…'; }
    return out;
  }
  fitSVG = function (L) {
    var svg = mapSVG(L).replace('class="v13map"', 'class="v13map fit"');
    var rows = {};
    L.all.forEach(function (ev) { var main = ev.x.k === 'merge', s = L.sps.filter(function (q) { return q.evs.indexOf(ev) >= 0; })[0], y = main ? L.ym : L.ym - FITLANE * s.lane; (rows[y] = rows[y] || []).push(ev); });
    var lab = '', small = '';
    Object.keys(rows).forEach(function (y) {
      var r = rows[y].slice().sort(function (p_, q) { return L.X[p_.k] - L.X[q.k]; });
      r.forEach(function (ev, j) {
        var x = L.X[ev.k], gl = j ? x - L.X[r[j - 1].k] : 999, gr = j < r.length - 1 ? L.X[r[j + 1].k] - x : 999;
        if (Math.min(gl, gr) < 20) small += '.v13map.fit .st[data-k="' + ev.k + '"] .ic{transform:scale(.72)}';
        if (!(L.on && L.on[ev.k])) return;
        var lv = r.filter(function (q) { return L.on[q.k] && q !== ev; }).map(function (q) { return Math.abs(L.X[q.k] - x); });
        var gap = Math.min.apply(null, [76, 2 * Math.min(x, L.w - x)].concat(lv));
        if (gap < 40) return;
        var ch = Math.floor((gap - 6) / 5.6);
        var title = WRAP === 'C' ? ev.x.title : shortTitle(ev.x);
        var lines = wrapWords(title, ch, WRAP === 'C' ? 4 : 3);
        var t = '<text class="fl wr-' + WRAP + '" x="' + x + '" y="' + (+y + (WRAP === 'B' ? 21 : 22)) + '">';
        if (WRAP !== 'B') t += '<tspan class="k">' + esc(clip(plain(ev.x), ch)) + '</tspan>';
        lines.forEach(function (l, i) { t += '<tspan class="t" x="' + x + '"' + (WRAP === 'B' ? (i ? ' dy="10.5"' : '') : ' dy="11"') + '>' + esc(l) + '</tspan>'; });
        lab += t + '</text>';
      });
    });
    var z = svg.lastIndexOf('</svg>');
    return svg.slice(0, z) + lab + svg.slice(z) + (small ? '<style>' + small + '</st' + 'yle>' : '');
  };
