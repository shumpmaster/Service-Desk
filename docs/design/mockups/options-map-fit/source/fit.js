  /* Options for the owner's round 5, answer 1 (second half): "can we make it so whenever a milestone is selected, the branch map
     fits to the events in that milestone and expands the dots to our icons with descriptions if we can fit them?"
     A layer over v17 inside its script. FIT_OPT = 'A' | 'B' | 'C'. A milestone is selected by tapping its row (the page opens
     with the milestone in progress selected); a chip on the map shows which, and its cross goes back to the whole phase.
     Every event of the milestone wears its icon; planned ones sit at the right as open rings.
     A: the whole milestone fitted to the width; a description under an icon only where there is room.
     B: the milestone at a readable size, every icon with its description; the map pans with the list as before.
     C: the whole milestone fitted, and the events in view below spread apart to carry their descriptions. */
  state.fitSel = {};
  var FITPAD = 22, FITLANE = 50;
  function fitKey() { return state.fitSel[state.proj]; }
  function vpW() { var v = document.querySelector('#v13band .v13vp'); return v && v.clientWidth || 393; }
  var _mapDataFit = mapData;
  mapData = function () {
    var fk_ = fitKey();
    if (!fk_) { MLANE = 30; return _mapDataFit(); }
    MLANE = FITLANE;
    var p = fk_.split(':'), b = +p[0], i = +p[1], it = PLANS[state.proj][b].items[i], all = [], key = {};
    (it.sprints || []).forEach(function (sp, g) {
      sp.events.forEach(function (x, e) {
        var t = sm(x.t), plan = t === null && x.t === 'planned'; if (t === null && !plan) return;
        var es = evState(sp, x), k = all.length;
        all.push({ k: k, b: b, i: i, g: g, e: e, t: plan ? 1e7 + k : t, x: x, sp: sp, it: it, sk: i + ':' + g, cls: plan ? 'plan' : es[0] === 'bad' || es[0] === 'wait' ? es[0] : '', now: x.s === 'you' && sp.st === 'you' });
        key[b + ':' + i + ':' + g + ':' + e] = k;
      });
    });
    var order = all.slice().sort(function (p_, q) { return p_.t - q.t; });
    var sps = [], seen = {};
    all.forEach(function (ev) { if (!seen[ev.sk]) { seen[ev.sk] = { evs: [], ev0: ev }; sps.push(seen[ev.sk]); } seen[ev.sk].evs.push(ev); });
    sps.forEach(function (s) { s.evs.sort(function (p_, q) { return p_.t - q.t; }); s.a = s.evs[0].t; s.b = s.evs[s.evs.length - 1].t; });
    sps.sort(function (p_, q) { return p_.a - q.a; });
    var busy = [];
    sps.forEach(function (s) { var l = 1; while (busy[l] !== undefined && busy[l] >= s.a) l++; s.lane = l; busy[l] = s.b; });
    var lanes = Math.max.apply(null, [1].concat(sps.map(function (s) { return s.lane; }))), ym = 26 + FITLANE * lanes;
    var L = { all: all, key: key, X: {}, order: order, sps: sps, lanes: lanes, ym: ym, h: ym + 40, fit: fk_ };
    fitX(L, null); return L;
  };
  /* where each event sits along the map */
  function fitX(L, on) {
    var n = L.order.length, W = vpW(), avail = W - 2 * FITPAD;
    if (FIT_OPT === 'B') { L.order.forEach(function (ev, j) { L.X[ev.k] = FITPAD + 14 + j * 76; }); L.w = Math.max(W, FITPAD * 2 + 28 + (n - 1) * 76); return; }
    L.w = W;
    if (n < 2) { if (n) L.X[L.order[0].k] = W / 2; return; }
    var wt = L.order.map(function (ev) { return FIT_OPT === 'C' && on && on[ev.k] ? 6.5 : 1; }), gaps = [], tot = 0;
    for (var j = 1; j < n; j++) { gaps[j] = (wt[j - 1] + wt[j]) / 2; tot += gaps[j]; }
    var x = FITPAD; L.X[L.order[0].k] = x;
    for (j = 1; j < n; j++) { x += avail * gaps[j] / tot; L.X[L.order[j].k] = x; }
  }
  /* a short description under an icon, two lines, only where it fits */
  function shortTitle(x) { return x.title.replace(/^Merged /, '').replace(/^Plan review failed, /, 'Failed, ').replace(/^Plan review, /, 'Review, ').replace(/: .*$/, ''); }
  function clip(s, n) { return s.length <= n ? s : s.slice(0, Math.max(1, n - 1)) + '…'; }
  function fitSVG(L) {
    var svg = mapSVG(L).replace('class="v13map"', 'class="v13map fit"');
    var rows = {}, ev2y = {};
    L.all.forEach(function (ev) { var main = ev.x.k === 'merge', s = L.sps.filter(function (q) { return q.evs.indexOf(ev) >= 0; })[0], y = main ? L.ym : L.ym - FITLANE * s.lane; ev2y[ev.k] = y; (rows[y] = rows[y] || []).push(ev); });
    var lab = '', small = '';
    Object.keys(rows).forEach(function (y) {
      var r = rows[y].slice().sort(function (p_, q) { return L.X[p_.k] - L.X[q.k]; });
      r.forEach(function (ev, j) {
        var x = L.X[ev.k], gl = j ? x - L.X[r[j - 1].k] : 999, gr = j < r.length - 1 ? L.X[r[j + 1].k] - x : 999, gap = Math.min(gl, gr, 2 * Math.min(x, L.w - x));
        if (Math.min(gl, gr) < 20) small += '.v13map.fit .st[data-k="' + ev.k + '"] .ic{transform:scale(.72)}';
        if (FIT_OPT === 'C') {   /* C: only the events in view carry words, so only they can collide */
          if (!(L.on && L.on[ev.k])) return;
          var lv = r.filter(function (q) { return L.on[q.k] && q !== ev; }).map(function (q) { return Math.abs(L.X[q.k] - x); });
          gap = Math.min.apply(null, [76, 2 * Math.min(x, L.w - x)].concat(lv));
        }
        if (gap < 40) return;
        var ch = Math.floor((gap - 6) / 5.6), es = evState(ev.sp, ev.x);
        lab += '<text class="fl" x="' + x + '" y="' + (+y + 22) + '"><tspan class="k">' + esc(clip(plain(ev.x), ch)) + '</tspan><tspan x="' + x + '" dy="11">' + esc(clip(shortTitle(ev.x), ch)) + '</tspan></text>';
      });
    });
    var z = svg.lastIndexOf('</svg>');
    return svg.slice(0, z) + lab + svg.slice(z) + (small ? '<style>' + small + '</style>' : '');
  }
  function chipHTML() {
    var k = fitKey(); if (!k) return '';
    var p = k.split(':'), it = PLANS[state.proj][+p[0]].items[+p[1]];
    return '<button type="button" class="fit-chip" data-fit-off aria-label="Show the whole phase on the map"><span>' + esc(msNo(+p[0], +p[1]) + ' ' + it.id) + '</span>' + V13I.x + '</button>';
  }
  var lastOn = '';
  function drawMap() {
    var inn = document.getElementById('v13in'); if (!inn) return;
    inn.innerHTML = fitKey() ? fitSVG(MAP) : mapSVG(MAP);
    var vp = document.querySelector('#v13band .v13vp'), c = vp && vp.querySelector('.fit-chip'); if (c) c.remove();
    if (vp && fitKey()) vp.insertAdjacentHTML('beforeend', chipHTML());
    lastOn = '';
  }
  function onSet() {
    var band = document.getElementById('v13band'), top = band.getBoundingClientRect().bottom, bot = window.innerHeight - 96, on = {}, s = [];
    document.querySelectorAll('#v13list [data-k]').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.bottom > top + 8 && r.top < bot - 8) { on[el.dataset.k] = 1; s.push(el.dataset.k); } });
    return { on: on, sig: s.join(',') };
  }
  var _v13syncFit = v13sync;
  v13sync = function (animate) {
    if (MAP && MAP.fit && FIT_OPT === 'C' && document.getElementById('v13band')) {
      var o = onSet();
      if (o.sig !== lastOn) { fitX(MAP, o.on); MAP.on = o.on; var inn = document.getElementById('v13in'); inn.innerHTML = fitSVG(MAP); lastOn = o.sig; if (animate && !REDUCED) anim(inn.firstChild, [{ opacity: .55 }, { opacity: 1 }], { duration: 220 }); }
    }
    return _v13syncFit(animate);
  };
  function refit(anchor) {
    MAP = mapData(); drawMap();
    if (anchor) relist(anchor); else { var l = document.getElementById('v13list'); if (l) l.innerHTML = list13(); }
    v13sync(true);
    var inn = document.getElementById('v13in'); if (inn && !REDUCED) anim(inn, [{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: EASE });
  }
  var _renderProjectFit = renderProject;
  renderProject = function (id) {
    if (PLANS[id] && state.fitSel[id] === undefined) {   /* opens with the milestone in progress selected */
      var plan = PLANS[id], b = (function () { for (var q = 0; q < plan.length; q++) if (plan[q].st === 'current') return q; return 0; })();
      state.proj = id; state.fitSel[id] = null;
      plan[b].items.forEach(function (it, i) { if (it.st === 'progress' && it.sprints) state.fitSel[id] = b + ':' + i; });
    }
    var r = _renderProjectFit.apply(this, arguments);
    if (PLANS[id]) { drawMap(); var l = document.getElementById('v13list'); if (l) l.innerHTML = list13(); v13sync(false); }
    return r;
  };
  /* tapping a milestone's row selects it; folding the selected one, or the chip's cross, shows the whole phase again */
  window.addEventListener('click', function (e) {
    if (!v13on()) return;
    if (e.target.closest('[data-fit-off]')) { e.stopPropagation(); state.fitSel[state.proj] = null; refit(); return; }
    var f = e.target.closest('[data-v13fold^="it:"]'); if (!f) return;
    var key = f.dataset.v13fold, sel = key.slice(3), it = PLANS[state.proj][+sel.split(':')[0]].items[+sel.split(':')[1]];
    var opening = !isOpen(key);
    if (opening && it.sprints) state.fitSel[state.proj] = sel; else if (!opening && fitKey() === sel) state.fitSel[state.proj] = null; else return;
    setTimeout(function () { refit('[data-v13fold="' + key + '"]'); }, 0);
  }, true);
