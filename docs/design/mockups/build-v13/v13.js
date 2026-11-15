  /* ================= v13: the owner's round 3 (decisions/questions/P-005-design-round-3.md) =================
     Inside a project with a plan: the branch map floats at the top and pans to keep the events in view under
     its window (BranchMap); a row of phase gauges sits under it (PhaseRow); the list shows only the current
     phase and opens on the current step, fully open; no lanes; gauges on phases, milestones and sprints, and
     tapping one opens or folds its section (Gauge); events and steps keep their icon, with a corner mark and a
     state tag (StatusMark). Status colour is soft: red stopped or failed, yellow waiting on you, green on track. */
  var V13I = /*V13ICONS*/{};
  state.v13x = {}; state.v13init = {};
  function v13on() { return state.view === 'proj' && !!PLANS[state.proj]; }
  function fk(k) { return state.proj + '|' + k; }
  function isOpen(k) { return !!state.open[fk(k)]; }
  function curB() { var plan = PLANS[state.proj]; for (var b = 0; b < plan.length; b++) if (plan[b].st === 'current') return b; for (b = 0; b < plan.length; b++) if (plan[b].type === 'phase') return b; return 0; }
  function sm(d) { var m = /^(\d+) Nov (\d\d):(\d\d)$/.exec(d); return m ? (+m[1]) * 1440 + (+m[2]) * 60 + (+m[3]) : null; }

  /* what a gauge shows. A phase counts its milestones reached out of the milestones in it (ruled); a milestone's or a
     sprint's percentage is an example until what a gauge counts is ruled */
  var EX = { tl: {
    ms: { 'M6': ['bad', 30, 1, 'Stopped: three plan reviews failed'], 'Design-5': ['ok', 40, 1, 'Mockups under way'] },
    sp: { 'Spec S-011': ['bad', 60, 1, 'Stopped · your call'], 'Spec S-010': ['ok', 100, 0, 'Merged · superseded by S-011'], 'PR #445': ['ok', 100, 0, 'Merged: the first mockup'],
          'Mockups v2 to v4': ['ok', 70, 1, 'On a branch, not yet in a pull request'] },
    ev: { 'Spec S-011|Merged PR #446: three questions for you': ['wait', 'Awaiting your answers'], 'PR #445|Checks passed': ['ok', 'Checks passed'] } } };
  function ex(kind, key) { var e = EX[state.proj]; return e && e[kind][key]; }
  function msGauge(it) {
    var o = ex('ms', it.id); if (o) return { st: o[0], pct: o[1], ex: o[2], note: o[3] };
    if (it.st === 'reached') return { st: 'ok', pct: 100, ex: 0, note: 'Reached' };
    if (it.st === 'progress') return { st: 'wait', pct: 50, ex: 1, note: 'In progress' };
    return { st: '', pct: 0, ex: 0, note: it.next ? 'Next · not started' : stateOf(it)[1] };
  }
  function spGauge(sp) {
    var o = ex('sp', sp.name); if (o) return { st: o[0], pct: o[1], ex: o[2], note: o[3] };
    if (sp.st === 'done') return { st: 'ok', pct: 100, ex: 0, note: sp.label };
    if (sp.st === 'you') return { st: 'wait', pct: 50, ex: 1, note: sp.label };
    if (sp.st === 'running') return { st: 'ok', pct: 50, ex: 1, note: sp.label };
    return { st: '', pct: 0, ex: 0, note: sp.label };
  }
  function phGauge(b) {
    var blk = PLANS[state.proj][b], its = blk.items.filter(function (x) { return !x.now; }), n = its.length;
    var r = its.filter(function (x) { return x.st === 'reached'; }).length, waits = NEEDS.filter(function (x) { return x.p === state.proj; }).length;
    var st = blk.st === 'done' ? 'ok' : blk.st === 'current' ? (waits ? 'wait' : 'ok') : '';
    return { st: st, pct: n ? Math.round(100 * r / n) : 0, r: r, n: n };
  }
  function evState(sp, x) {
    var o = ex('ev', sp.name + '|' + x.title); if (o) return o;
    if (x.t === 'planned') return ['', 'Planned'];
    return { failed: ['bad', 'Failed'], you: ['wait', 'Waiting on you'], done: ['ok', 'Done'], running: ['run', 'Running'], idle: ['', 'Not started'] }[x.s] || ['', SL[x.s] || ''];
  }
  function g13(pct, st, inner) {
    var c = 2 * Math.PI * 14;
    return '<span class="v13g ' + (st || 'none') + '"><svg viewBox="0 0 34 34" aria-hidden="true"><circle class="trk" cx="17" cy="17" r="14"/>' +
      (pct ? '<circle class="arc" cx="17" cy="17" r="14" stroke-dasharray="' + (c * pct / 100).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 17 17)"/>' : '') +
      '</svg><span class="in">' + inner + '</span></span>';
  }
  function mark(st) { var g = st === 'ok' ? V13I.check : st === 'bad' ? V13I.x : st === 'wait' || st === 'run' ? V13I.wait : ''; return g ? '<span class="v13mk ' + st + '">' + g + '</span>' : ''; }
  function tag(st, word) { return '<span class="v13tag' + (st === 'wait' || st === 'bad' ? ' ' + st : '') + '">' + esc(word) + '</span>'; }
  function pctWords(g) { return g.pct ? g.pct + '%' + (g.ex ? ', example' : '') : ''; }

  /* the branch map: every sprint of the current phase, oldest on the left, main along the bottom */
  var MDX = 30, MPAD = 26, MLANE = 30, MAP = null;
  function mapData() {
    var plan = PLANS[state.proj], b = curB(), all = [], key = {};
    plan[b].items.forEach(function (it, i) { (it.sprints || []).forEach(function (sp, g) {
      if (sp.st === 'planned') return;   /* planned research (Design-3's E1 and E2) is left off the map for now */
      sp.events.forEach(function (x, e) { var t = sm(x.t); if (t === null) return;
        var es = evState(sp, x), k = all.length;
        all.push({ k: k, b: b, i: i, g: g, e: e, t: t, x: x, sp: sp, it: it, sk: i + ':' + g, cls: es[0] === 'bad' || es[0] === 'wait' ? es[0] : '', now: x.s === 'you' && sp.st === 'you' });
        key[b + ':' + i + ':' + g + ':' + e] = k; }); }); });
    var order = all.slice().sort(function (p, q) { return p.t - q.t; }), X = {};
    order.forEach(function (ev, n) { X[ev.k] = MPAD + n * MDX; });
    var sps = [], seen = {};
    all.forEach(function (ev) { if (!seen[ev.sk]) { seen[ev.sk] = { evs: [], ev0: ev }; sps.push(seen[ev.sk]); } seen[ev.sk].evs.push(ev); });
    sps.forEach(function (s) { s.evs.sort(function (p, q) { return p.t - q.t; }); s.a = s.evs[0].t; s.b = s.evs[s.evs.length - 1].t; });
    sps.sort(function (p, q) { return p.a - q.a; });
    var busy = [];
    sps.forEach(function (s) { var l = 1; while (busy[l] !== undefined && busy[l] >= s.a) l++; s.lane = l; busy[l] = s.b; });
    var lanes = Math.max.apply(null, [1].concat(sps.map(function (s) { return s.lane; })));
    var ym = 20 + MLANE * lanes;
    return { all: all, key: key, X: X, sps: sps, lanes: lanes, ym: ym, w: MPAD * 2 + Math.max(0, all.length - 1) * MDX, h: ym + 14 };
  }
  function nest(svg, x, y, s) { return svg.replace('<svg', '<svg x="' + (x - s / 2) + '" y="' + (y - s / 2) + '" width="' + s + '" height="' + s + '"'); }
  function mapSVG(L) {
    var ym = L.ym, p = '<path class="g main" d="M0 ' + ym + ' H' + L.w + '"/>', st = '', lb = '';
    L.sps.forEach(function (s) {
      var y = ym - MLANE * s.lane, on = s.evs.filter(function (ev) { return ev.x.k !== 'merge'; });
      var x0 = L.X[s.evs[0].k], x1 = on.length ? L.X[on[on.length - 1].k] : x0;
      p += '<path class="g" d="M' + (x0 - 16) + ' ' + ym + ' C' + (x0 - 8) + ' ' + ym + ' ' + (x0 - 8) + ' ' + y + ' ' + x0 + ' ' + y + ' H' + x1 + '"/>';
      s.evs.forEach(function (ev, j) {
        var main = ev.x.k === 'merge', cx = L.X[ev.k], cy = main ? ym : y;
        if (main) { var px = j ? L.X[s.evs[j - 1].k] : cx - 16; p += '<path class="g" d="M' + px + ' ' + y + ' C' + (px + cx) / 2 + ' ' + y + ' ' + (px + cx) / 2 + ' ' + ym + ' ' + cx + ' ' + ym + '"/>'; }
        var c = (main ? ' main' : '') + (ev.now ? ' now' : ev.cls ? ' ' + ev.cls : '');
        st += '<g class="st' + c + '" data-k="' + ev.k + '"><title>' + esc(KL[ev.x.k] + ': ' + ev.x.title) + '</title><circle class="dot' + c + '" cx="' + cx + '" cy="' + cy + '" r="' + (ev.now ? 5 : 4) + '"/>' +
          '<g class="ic"><circle class="disc' + c + '" cx="' + cx + '" cy="' + cy + '" r="10.5"/>' + nest(ICONS[ev.x.k] || '', cx, cy, 12) + '</g></g>';
      });
      var it = s.ev0.it, no = msNo(s.ev0.b, s.ev0.i) + '.' + (s.ev0.g + 1);
      lb += '<text class="lb" data-x0="' + x0 + '" data-x1="' + Math.max(x0, x1) + '" x="' + x0 + '" y="' + (y - 9) + '">' + esc(no + ' ' + s.ev0.sp.name.replace(/^Spec /, '')) + '</text>';
    });
    return '<svg class="v13map" width="' + L.w + '" height="' + L.h + '" viewBox="0 0 ' + L.w + ' ' + L.h + '" role="img" aria-label="Branch map of the ' + esc(PLANS[state.proj][curB()].name) + ' phase">' +
      '<rect class="win" x="0" y="' + (ym - MLANE * L.lanes - 13) + '" width="0" height="' + (MLANE * L.lanes + 26) + '" rx="10"/>' + p + st + lb + '</svg>';
  }
  function phaseRowHTML() {
    var plan = PLANS[state.proj], cb = curB();
    return '<div class="v13phases" role="group" aria-label="Phases">' + plan.map(function (blk, b) {
      if (blk.type !== 'phase') return '';
      var g = phGauge(b), cur = b === cb, open = !!state.v13x[fk(b)];
      return '<button type="button" class="v13ph' + (cur ? ' cur' : '') + (open ? ' x' : '') + '" data-v13phase="' + esc(blk.name.toLowerCase()) + '" data-b="' + b + '"' +
        (cur ? ' aria-current="true"' : ' aria-expanded="' + open + '"') + ' aria-label="' + esc(blk.name) + ', ' + g.r + ' of ' + g.n + ' milestones reached' + (cur ? ', current phase' : '') + '">' +
        g13(g.pct, g.st, '<span class="pn">' + phaseNo(b) + '</span>') + '<span class="nm">' + esc(blk.name) + '</span></button>';
    }).join('') + '</div>';
  }
  function bandHTML() {
    return '<div class="v13band" id="v13band"><div class="v13vp"><div class="v13in" id="v13in"></div><span class="v13main">main</span></div>' + phaseRowHTML() + '</div>';
  }

  /* the list: only the current phase, and any phase opened from the row above it */
  function evRow13(b, i, g, e) {
    var it = PLANS[state.proj][b].items[i], sp = it.sprints[g], x = sp.events[e], s = evState(sp, x), main = x.k === 'merge';
    var k = MAP && MAP.key[b + ':' + i + ':' + g + ':' + e], short = x.t.indexOf('14 Nov ') === 0 ? x.t.slice(7) : x.t;
    return '<div class="v13ev"' + (k !== undefined ? ' data-k="' + k + '"' : '') + '><span class="v13ico' + (main ? ' main' : '') + (x.t === 'planned' ? ' plan' : '') + '">' + (ICONS[x.k] || '') + mark(s[0]) + '</span>' +
      '<div class="tx"><div class="l1"><b>' + plain(x) + '</b>' + tag(s[0], s[1]) + '<span class="tm">' + esc(short === 'planned' ? '' : short) + '</span></div>' +
      '<div class="l2">' + esc(x.title) + '</div><div class="l3">by ' + esc(x.who) + (main ? ' · main' : '') + (x.meta ? ' · ' + esc(x.meta) : '') + '</div></div></div>';
  }
  function stepRow13(no, st, key) {
    var n = st.items.length, done = st.items.filter(function (a) { return a[0] === 'ok'; }).length, bl = st.items.filter(function (a) { return a[0] === 'blocked'; }).length;
    var s = bl ? ['bad', bl + ' blocked'] : done === n ? ['ok', 'Done'] : ['run', done + ' of ' + n + ' done'], open = isOpen(key);
    var ol = (/<ol class="v12plan">[\s\S]*<\/ol>/.exec(stepHTML(no, st, key)) || [''])[0];
    return '<div class="v13step' + (open ? ' open' : '') + '"><button type="button" class="v13ev v13stephd" data-v13fold="' + key + '" aria-expanded="' + open + '" aria-label="Step ' + no + ', ' + (open ? 'fold' : 'open') + ' its actions">' +
      '<span class="v13ico">' + V13I.step + mark(s[0]) + '</span><span class="tx"><span class="l1"><b>' + no + '</b>' + tag(s[0], s[1]) + '<span class="tm">' + V12I.caret + '</span></span>' +
      '<span class="l2">' + esc(st.who) + '’s plan · ' + done + ' of ' + n + ' done</span><span class="l3">the work between the two events · an example</span></span></button>' +
      (open ? '<div class="v12step open v13acts">' + ol + '<div class="ex">An example: no agent records its actions yet.</div></div>' : '') + '</div>';
  }
  function sprint13(b, i, g) {
    var it = PLANS[state.proj][b].items[i], sp = it.sprints[g], no = msNo(b, i) + '.' + (g + 1), key = 'sp:' + b + ':' + i + ':' + g, open = isOpen(key), gg = spGauge(sp);
    var h = '<div class="v13sp' + (open ? ' open' : '') + '"><button type="button" class="v13gr" data-v13fold="' + key + '" aria-expanded="' + open + '" aria-label="Sprint ' + no + ', ' + esc(sp.name) + ', ' + (open ? 'fold' : 'open') + '">' +
      g13(gg.pct, gg.st, V13I.branch) + '<span class="tx"><span class="l1"><span class="no">' + no + '</span><b>' + esc(sp.name) + '</b><span class="cnt">' + sp.events.length + ' events</span></span>' +
      '<span class="l3">' + esc(gg.note) + (gg.pct ? ' · ' + pctWords(gg) : '') + '</span></span></button>';
    if (!open) return h + '</div>';
    var evs = sp.events, stepN = 0, nums = [], body = '';
    evs.forEach(function (x, e) { if (agentStep(x)) stepN++; nums[e] = stepN; });
    for (var e = evs.length - 1; e >= 0; e--) {
      body += evRow13(b, i, g, e);
      var st = STEPS[sp.name + '|' + evs[e].title];
      if (st) body += stepRow13(no + '.' + nums[e], st, 'st:' + b + ':' + i + ':' + g + ':' + e);
    }
    return h + '<div class="v13body">' + body + '</div></div>';
  }
  function ms13(b, i) {
    var blk = PLANS[state.proj][b], it = blk.items[i];
    if (it.now) {
      var h = msRow(b, i).replace(/<div class="node m now-node">[\s\S]*?<\/div>/, '').replace('class="pl ', 'class="pl v13now ');
      return h;
    }
    var key = 'it:' + b + ':' + i, open = isOpen(key), gg = msGauge(it), no = msNo(b, i);
    var h2 = '<div class="v13ms' + (open ? ' open' : '') + '"><button type="button" class="v13gr" data-v13fold="' + key + '" aria-expanded="' + open + '" aria-label="Milestone ' + no + ', ' + esc(it.id) + ', ' + (open ? 'fold' : 'open') + '">' +
      g13(gg.pct, gg.st, it.own ? V13I.own : V13I.ms) + '<span class="tx"><span class="l1"><span class="no">' + no + '</span><b>' + esc(it.id) + '</b><span class="nm">' + esc(it.name) + '</span></span>' +
      '<span class="l3">' + esc(gg.note) + (gg.pct ? ' · ' + pctWords(gg) : '') + '</span></span></button>';
    if (!open) return h2 + '</div>';
    var body = it.why ? '<div class="v13why">' + esc(it.why) + '</div>' : '';
    if (it.sprints) for (var g = it.sprints.length - 1; g >= 0; g--) body += sprint13(b, i, g);
    else if (!it.why) body += '<div class="v13why">Nothing on record for it yet.</div>';
    return h2 + '<div class="v13body">' + body + '</div></div>';
  }
  function phase13(b) {
    var blk = PLANS[state.proj][b], cur = b === curB(), g = phGauge(b), key = 'ph:' + b, open = cur ? !state.open[fk(key) + ':shut'] : true;
    var waits = NEEDS.filter(function (x) { return x.p === state.proj; });
    var note = g.r + ' of ' + g.n + ' milestones reached' + (cur && waits.length ? ' · ' + waits.length + (waits.length === 1 ? ' thing waits' : ' things wait') + ' on you' :blk.note && blk.note !== 'now' ? ' · ' + blk.note : '');
    var hd = '<button type="button" class="v13gr v13phh"' + (cur ? ' data-v13fold="' + key + '"' : ' data-v13phase="' + esc(blk.name.toLowerCase()) + '" data-b="' + b + '"') + ' aria-expanded="' + open + '" aria-label="Phase ' + phaseNo(b) + ', ' + esc(blk.name) + ', ' + (open ? 'fold' : 'open') + '">' +
      g13(g.pct, g.st, '<span class="pn">' + phaseNo(b) + '</span>') + '<span class="tx"><span class="l1"><b>' + esc(blk.name) + '</b>' + (cur ? '<span class="now">now</span>' : '') + '<span class="pc">' + g.pct + '%</span></span><span class="l3">' + esc(note) + '</span></span></button>';
    var body = '';
    if (open) {
      var showAll = !!state.unused[b];
      for (var i = blk.items.length - 1; i >= 0; i--) { if (unused(blk.items[i], blk) && !showAll) continue; body += ms13(b, i); }
      if (!blk.items.length) body += '<div class="v13why">' + esc(blk.note === 'planned' ? 'Milestones not written yet.' : blk.note) + '</div>';
      var nU = blk.items.filter(function (it) { return unused(it, blk); }).length;
      if (nU) body += '<div class="v13unhide"><button type="button" class="linkbtn" data-unused="' + b + '">' + (showAll ? 'Hide the ' + nU + ' unused milestones' : 'Show ' + nU + ' unused ' + (nU === 1 ? 'milestone' : 'milestones')) + '</button></div>';
    }
    return '<section class="v13phase' + (cur ? ' cur' : ' xph') + (open ? ' open' : '') + '" data-b="' + b + '">' + hd + (open ? '<div class="v13body">' + body + '</div>' : '') + '</section>';
  }
  function list13() {
    var plan = PLANS[state.proj], cb = curB(), h = '';
    for (var b = plan.length - 1; b >= 0; b--) if (plan[b].type === 'phase' && b !== cb && state.v13x[fk(b)]) h += phase13(b);
    return h + phase13(cb) + '<div class="v13end"></div>';
  }
  var _planHTML = planHTML;
  planHTML = function (id) { return v13on() ? '<div class="v13list" id="v13list">' + list13() + '</div>' : _planHTML(id); };

  /* open on the current step, with everything in it open: the milestone in progress, its open sprints, and their worked steps */
  function initOpen() {
    var id = state.proj; if (state.v13init[id]) return; state.v13init[id] = true;
    var plan = PLANS[id], b = curB();
    plan[b].items.forEach(function (it, i) {
      if (it.st !== 'progress') return;
      state.open[fk('it:' + b + ':' + i)] = true;
      (it.sprints || []).forEach(function (sp, g) {
        if (sp.st === 'done') return;
        state.open[fk('sp:' + b + ':' + i + ':' + g)] = true;
        sp.events.forEach(function (x, e) { if (STEPS[sp.name + '|' + x.title]) state.open[fk('st:' + b + ':' + i + ':' + g + ':' + e)] = true; });
      });
    });
  }
  var _renderProject13 = renderProject;
  renderProject = function (id) {
    var view = document.getElementById('view');
    if (PLANS[id]) { state.proj = id; initOpen(); MAP = mapData(); }
    _renderProject13.apply(this, arguments);
    view.classList.toggle('v13', !!PLANS[id]);
    if (!PLANS[id]) { MAP = null; return; }
    var ptl = document.getElementById('ptl'); ptl.classList.add('v13');
    ptl.insertAdjacentHTML('beforebegin', bandHTML());
    document.getElementById('v13in').innerHTML = mapSVG(MAP);
    v13sync(false);
  };
  var _renderDesk13 = renderDesk;
  renderDesk = function () { var v = document.getElementById('view'); if (v) v.classList.remove('v13'); MAP = null; _renderDesk13.apply(this, arguments); };

  /* the window over the events in view, and the map panned to keep it centred */
  var pan13 = 0;
  function v13sync(animate) {
    var band = document.getElementById('v13band'), inn = document.getElementById('v13in'); if (!band || !inn || !MAP) return;
    var vp = band.querySelector('.v13vp'), top = band.getBoundingClientRect().bottom, bot = window.innerHeight - 96, on = {}, xs = [];
    document.querySelectorAll('#v13list [data-k]').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.bottom > top + 8 && r.top < bot - 8) { on[el.dataset.k] = 1; xs.push(MAP.X[el.dataset.k]); } });
    inn.querySelectorAll('.st').forEach(function (d) { d.classList.toggle('vis', !!on[d.dataset.k]); });
    var win = inn.querySelector('.win'), still = REDUCED || !animate;
    inn.style.transition = still ? 'none' : ''; win.style.transition = still ? 'none' : '';
    if (!xs.length) { win.style.opacity = '0'; return; }
    var a = Math.min.apply(null, xs) - 14, b = Math.max.apply(null, xs) + 14;
    win.style.opacity = ''; win.setAttribute('x', a); win.setAttribute('width', b - a);
    pan13 = Math.max(0, Math.min(Math.max(0, MAP.w - vp.clientWidth), (a + b) / 2 - vp.clientWidth / 2));
    inn.style.transform = 'translateX(' + (-pan13) + 'px)';
    /* each lane keeps its name in sight while any of it is on screen */
    inn.querySelectorAll('text.lb[data-x0]').forEach(function (t) {
      var x0 = +t.dataset.x0, x1 = +t.dataset.x1, w = t.getComputedTextLength ? t.getComputedTextLength() : 60;
      t.setAttribute('x', Math.max(x0, Math.min(pan13 + 30, x1 - w)));
    });
  }
  var raf13 = 0;
  window.addEventListener('scroll', function () { if (!raf13 && v13on()) raf13 = requestAnimationFrame(function () { raf13 = 0; v13sync(true); }); }, { passive: true });
  window.addEventListener('resize', function () { if (v13on()) v13sync(false); });

  /* where the page opens: the Now card just under the floating band, S-011's newest events below it */
  function bandH() { var b = document.getElementById('v13band'); return b ? b.offsetHeight : 0; }
  function v13home(smooth) {
    var now = document.querySelector('#v13list .v13now') || document.querySelector('#v13list .v13phase.cur'); if (!now) return;
    var y = now.getBoundingClientRect().top + window.scrollY - bandH() - 8;
    window.scrollTo({ top: Math.max(0, y), behavior: smooth && !REDUCED ? 'smooth' : 'auto' });
  }
  var _settle13 = settle;
  settle = function () { _settle13(); if (v13on()) { v13home(false); v13sync(false); } };
  var _centerNow13 = centerNow;
  centerNow = function () {
    if (!v13on()) return _centerNow13();
    v13home(true); var now = document.querySelector('#v13list .v13now'); if (now) { now.classList.remove('flash'); void now.offsetWidth; now.classList.add('flash'); }
  };
  var _fadeIn13 = fadeIn;
  fadeIn = function () {
    var band = document.getElementById('v13band');
    if (band && !REDUCED) anim(band, [{ opacity: 0, transform: 'translateX(-40px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: EASE });
    return _fadeIn13();
  };

  /* re-draw the list, keeping what was tapped where it was on screen */
  function relist(anchorSel) {
    var list = document.getElementById('v13list'); if (!list) return null;
    var a = anchorSel && document.querySelector(anchorSel), y0 = a ? a.getBoundingClientRect().top : 0;
    list.innerHTML = list13();
    var a2 = anchorSel && document.querySelector(anchorSel);
    if (a && a2) window.scrollBy(0, a2.getBoundingClientRect().top - y0);
    document.querySelectorAll('.v13phases').forEach(function (r) { r.outerHTML = phaseRowHTML(); });
    v13sync(true);
    return a2;
  }
  document.addEventListener('click', function (e) {
    if (!v13on()) return;
    var f = e.target.closest('[data-v13fold]'), p = e.target.closest('[data-v13phase]');
    if (!f && !p) return;
    e.stopImmediatePropagation();
    if (f) {
      var key = f.dataset.v13fold, opening;
      if (key.indexOf('ph:') === 0) { var sk = fk(key) + ':shut'; state.open[sk] = !state.open[sk]; opening = !state.open[sk]; }
      else { opening = !isOpen(key); state.open[fk(key)] = opening; }
      var fresh = relist('[data-v13fold="' + key + '"]');
      var body = fresh && (fresh.parentNode.querySelector(':scope > .v13body, :scope > .v13acts'));
      if (fresh) anim(fresh.querySelector('.v13g, .v13ico'), [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 280 });
      if (opening && body) anim(body, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 260 });
      return;
    }
    var b = Number(p.dataset.b);
    if (b === curB()) { v13home(true); return; }
    var on = !state.v13x[fk(b)]; state.v13x[fk(b)] = on;
    relist('#v13list .v13phase.cur > .v13gr');
    if (on) {   /* a phase opens above the current one; only now does the page scroll, to bring it under the band */
      var sec = document.querySelector('#v13list .v13phase[data-b="' + b + '"]');
      if (sec) { anim(sec, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 280 });
        window.scrollTo({ top: Math.max(0, sec.getBoundingClientRect().top + window.scrollY - bandH() - 6), behavior: REDUCED ? 'auto' : 'smooth' }); }
    }
  }, true);
