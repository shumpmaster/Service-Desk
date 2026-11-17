  /* Options for the owner's round 5, answer 13: "I love 1 - the only thing im wanting is to show the visual connection as the chain is
     selected on the branch list". A layer over v20 with the tree, the why as B, the needs as a tag and bubble, and the bubble as a plain
     checklist (BUB = '1'). CHAIN = 'A' | 'B' | 'C'. While a bubble is open, the chain it shows (the event, the layers opened with the
     chevrons, and what the current layer needs) lights up and is joined; everything else steps back. Closing the bubble clears it.
     A: on the floating branch map: the chain's icons ringed, joined by arcs over the lanes.
     B: in the list: the chain's rows lit, joined by a line in the left margin.
     C: both at once. */
  function chainKeys() {
    if (!state.n4) return null;
    var path = [state.n4].concat(state.n5), cur = path[path.length - 1], links = [];
    for (var j = 1; j < path.length; j++) links.push([path[j], path[j - 1]]);
    (DEP[cur] || []).forEach(function (d) { if (d[2] && d[2] !== 'act') links.push([d[2], cur]); });
    var all = {}; path.forEach(function (k) { all[k] = 1; }); links.forEach(function (l) { all[l[0]] = all[l[1]] = 1; });
    return { keys: Object.keys(all), links: links, cur: cur };
  }
  function mapK(k) { var L = locate(k); return L && MAP && MAP.key[L.join(':')]; }
  function chainMap(c) {
    var svg = document.querySelector('#v13in svg.v13map'); if (!svg) return;
    var old = svg.querySelector('g.ch'); if (old) old.remove();
    svg.classList.toggle('chaining', !!c);
    svg.querySelectorAll('.st.lit, .st.cur').forEach(function (n) { n.classList.remove('lit', 'cur'); });
    if (!c) return;
    var pos = {};
    c.keys.forEach(function (k) { var mk = mapK(k); if (mk === undefined || mk === null) return; var st = svg.querySelector('.st[data-k="' + mk + '"]'); if (!st) return;
      st.classList.add(k === c.cur ? 'cur' : 'lit'); var ci = st.querySelector('circle.disc') || st.querySelector('circle'); pos[k] = [+ci.getAttribute('cx'), +ci.getAttribute('cy')]; });
    var d = c.links.map(function (l) { var a = pos[l[0]], b = pos[l[1]]; if (!a || !b) return ''; var top = Math.min(a[1], b[1]) - 16 - Math.min(26, Math.abs(b[0] - a[0]) / 5); return 'M' + a[0] + ' ' + (a[1] - 11) + ' C' + a[0] + ' ' + top + ' ' + b[0] + ' ' + top + ' ' + b[0] + ' ' + (b[1] - 11); }).join(' ');
    svg.insertAdjacentHTML('beforeend', '<g class="ch"><path d="' + d + '"/></g>');
  }
  function chainList(c) {
    var list = document.getElementById('v13list'); if (!list) return;
    var old = list.querySelector('.ch-wire'); if (old) old.remove();
    list.classList.toggle('chaining', !!c);
    list.querySelectorAll('.ch-lit, .ch-cur').forEach(function (n) { n.classList.remove('ch-lit', 'ch-cur'); });
    if (!c) return;
    var lr = list.getBoundingClientRect(), ys = {};
    c.keys.forEach(function (k) { var row = list.querySelector('.v13ev[data-ndk="' + k.replace(/"/g, '\\"') + '"]'); if (!row) return; row.classList.add(k === c.cur ? 'ch-cur' : 'ch-lit');
      var r = row.querySelector('.v13ico').getBoundingClientRect(); ys[k] = [r.left - lr.left, r.top - lr.top + r.height / 2]; });
    var x0 = Math.min.apply(null, [999].concat(Object.keys(ys).map(function (k) { return ys[k][0]; }))) - 9;
    var d = c.links.map(function (l) { var a = ys[l[0]], b = ys[l[1]]; if (!a || !b) return ''; return 'M' + (a[0] - 2) + ' ' + a[1] + ' H' + (x0 + 5) + ' Q' + x0 + ' ' + a[1] + ' ' + x0 + ' ' + (a[1] + (b[1] > a[1] ? 5 : -5)) + ' V' + (b[1] + (b[1] > a[1] ? -5 : 5)) + ' Q' + x0 + ' ' + b[1] + ' ' + (x0 + 5) + ' ' + b[1] + ' H' + (b[0] - 2); }).join(' ');
    list.insertAdjacentHTML('afterbegin', '<svg class="ch-wire" width="' + lr.width + '" height="' + list.scrollHeight + '" aria-hidden="true"><path d="' + d + '"/></svg>');
  }
  function chainDraw() { var c = chainKeys(); if (CHAIN !== 'B') chainMap(c); if (CHAIN !== 'A') chainList(c); }
  var _v13syncCh = v13sync;
  v13sync = function () { var r = _v13syncCh.apply(this, arguments); if (CHAIN !== 'B') chainMap(chainKeys()); return r; };
  var _n4redrawCh = n4redraw;
  n4redraw = function () { var r = _n4redrawCh.apply(this, arguments); chainDraw(); return r; };
  var _relistCh = relist;
  relist = function () { var r = _relistCh.apply(this, arguments); chainDraw(); return r; };
