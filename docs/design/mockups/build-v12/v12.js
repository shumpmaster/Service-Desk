
  /* ================= v12: the lanes, the actions between events, and the numbers =================
     A milestone opens in place (not in a sheet). Its sprints run as lanes beside the project's main line,
     each event's icon on its lane; merges sit on main, on a dark disc. Between two events, a step shows
     the agent's plan (Desk Element Library: LaneGraph, ActionPlan). Every level is numbered inside the one above. */
  var V12I = /*V12ICONS*/{};
  var MAINX = 48, DX = 26, ROWH = 64;
  function plain(x) { return x.k === 'stop' ? 'Stop' : KL[x.k]; }
  function phaseNo(b) { var n = 0, plan = PLANS[state.proj]; for (var j = 0; j <= b; j++) if (plan[j].type !== 'gate') n++; return n; }
  function msNo(b, i) {
    var blk = PLANS[state.proj][b], it = blk.items[i], m = /^[A-Za-z]+-(\d+)$/.exec(it.id);
    if (m) return phaseNo(b) + '.' + m[1];
    var std = 0; blk.items.forEach(function (x) { var mm = /^[A-Za-z]+-(\d+)$/.exec(x.id); if (mm) std = Math.max(std, +mm[1]); });
    var own = blk.items.filter(function (x) { return x.own; }).map(function (x) { return x.id; }).sort(function (a, c) { return (+a.replace(/\D/g, '')) - (+c.replace(/\D/g, '')); });
    return phaseNo(b) + '.' + (std + own.indexOf(it.id) + 1);
  }
  /* the one step with its actions written out: an example, pieced together from the spec writer's real rework of S-011 */
  var STEPS = {
    'Spec S-011|Spec revised again': { who: 'The spec writer', items: [
      ['ok', 'Settle what “acting for you” means', 'Two wordings clash, and a check needs one.'],
      ['blocked', 'Move the experiments to the new spec', 'They prove the milestone, but still point at the old spec.', 'They weren’t in what the spec writer was given.', 'Made it a condition: no freeze until they move.'],
      ['ok', 'Say which version the check tests', 'Your phone test hasn’t run, so it tests the normal version until then.'],
      ['ok', 'Hold the phone-width check', 'It needs your widths first.'],
      ['ok', 'Let the builder update the widget’s copy', 'The spec requires it, but that folder was off limits.', 'Its exact location isn’t on record.', 'Allowed it, and asked you to confirm the location before freezing.'],
      ['ok', 'Make sure no alert is missed', 'The milestone promises anything that needs you reaches your phone. A late step could slip through.']
    ] }
  };
  function agentStep(x) { return (x.k === 'commit' || x.k === 'review') && x.who !== 'you' && x.who !== 'orchestrator'; }
  function stepHTML(no, st, key) {
    var n = st.items.length, done = st.items.filter(function (a) { return a[0] === 'ok'; }).length, bl = st.items.filter(function (a) { return a[0] === 'blocked'; }).length;
    var stepNo = no.split('.').pop(), open = !!state.open[key];
    var li = st.items.map(function (a, j) {
      var num = stepNo + '.' + (n - j);
      var mk = a[0] === 'ok' ? V12I.check : a[0] === 'blocked' ? V12I.warn : '';
      var h = '<li class="' + a[0] + '"><span class="mk ' + a[0] + '">' + mk + '</span><div class="ti"><span class="num">' + num + '</span>' + esc(a[1]) + (a[0] === 'now' ? '<span class="nowtag">Now</span>' : '') + '</div><div class="why">' + esc(a[2]) + '</div>';
      if (a[3]) h += '<div class="pr"><div class="p">' + V12I.warn + esc(a[3]) + '</div><div>' + V12I.arrow + esc(a[4]) + '</div></div>';
      return h + '</li>';
    }).join('');
    return '<div class="v12step' + (open ? ' open' : '') + '" data-v12step="' + key + '"><button type="button" class="sthd" aria-expanded="' + open + '"><span class="stno">' + no + '</span><span class="stwho">' + esc(st.who) + ' · ' + done + ' of ' + n + ' done' + (bl ? ' · <span class="bl">' + bl + ' blocked</span>' : '') + '</span>' + V12I.caret + '</button>' +
      '<ol class="v12plan">' + li + '</ol><div class="ex">An example: no agent records its actions yet.</div></div>';
  }
  function workHTML(b, i) {
    var it = PLANS[state.proj][b].items[i], no = msNo(b, i);
    if (!it.sprints) return '<div class="v12work none"><div class="why">' + esc(it.why || 'Nothing on record for it yet.') + '</div></div>';
    var sps = it.sprints, col = {}, used = {}, maxc = 1;
    sps.forEach(function (sp, g) { var c = 1; while (used[c]) c++; col[g] = c; maxc = Math.max(maxc, c); if (sp.st !== 'done') used[c] = true; });
    var rows = [];
    for (var g = sps.length - 1; g >= 0; g--) {
      rows.push({ t: 'head', g: g });
      var evs = sps[g].events, stepN = 0, nums = [];
      evs.forEach(function (x, e) { if (agentStep(x)) stepN++; nums[e] = stepN; });
      for (var e = evs.length - 1; e >= 0; e--) {
        rows.push({ t: 'ev', g: g, e: e });
        var st = STEPS[sps[g].name + '|' + evs[e].title];
        if (st) rows.push({ t: 'step', g: g, e: e, no: no + '.' + (g + 1) + '.' + nums[e], st: st });
      }
    }
    /* each sprint's span of rows: its lane runs from its oldest event up to its newest, or to its last merge */
    var span = {};
    rows.forEach(function (r, k) { if (r.t === 'head') return; var s = span[r.g] || (span[r.g] = { top: k, bot: k }); s.top = Math.min(s.top, k); s.bot = Math.max(s.bot, k); });
    sps.forEach(function (sp, g) { var evs = sp.events; span[g].closed = sp.st === 'done' && evs[evs.length - 1].k === 'merge'; });
    var txt = MAINX + DX * maxc + 22;
    var html = rows.map(function (r, k) {
      var segs = '', curve = '';
      sps.forEach(function (sp, g) {
        var s = span[g], x = MAINX + DX * col[g];
        if (k > s.top && k < s.bot) segs += '<i class="seg" style="left:' + x + 'px"></i>';
        if (k === s.top && !s.closed && s.top !== s.bot) segs += '<i class="seg half-lo" style="left:' + x + 'px"></i>';
        if (k === s.bot && k !== s.top) segs += '<i class="seg half-hi" style="left:' + x + 'px"></i>';
        if (r.g === g && r.t === 'head' && !s.closed) segs += '<i class="seg half-lo cap" style="left:' + x + 'px"></i>';
        if (r.g === g && r.t === 'ev') {
          var ex = sp.events[r.e];
          if (k === s.bot) curve += '<path d="M' + MAINX + ' ' + ROWH + ' C' + MAINX + ' ' + (ROWH * .62) + ' ' + x + ' ' + (ROWH * .78) + ' ' + x + ' ' + (ROWH / 2) + '"/>';
          if (ex.k === 'merge') curve += '<path d="M' + x + ' ' + ROWH + ' C' + x + ' ' + (ROWH * .62) + ' ' + MAINX + ' ' + (ROWH * .78) + ' ' + MAINX + ' ' + (ROWH / 2) + '"/>';
        }
      });
      if (r.t === 'head') {
        var sp = sps[r.g];
        return '<div class="v12row head">' + segs + '<div class="tx" style="left:' + txt + 'px"><span class="spno">' + no + '.' + (r.g + 1) + '</span>' + esc(sp.name) + ' <span class="splab">· ' + esc(sp.label) + '</span></div></div>';
      }
      if (r.t === 'step') return '<div class="v12row steprow">' + segs + '<div class="stwrap" style="margin-left:' + (txt - 4) + 'px">' + stepHTML(r.no, r.st, 'st:' + b + ':' + i + ':' + r.g + ':' + r.e) + '</div></div>';
      var x = sps[r.g].events[r.e], onMain = x.k === 'merge', ix = onMain ? MAINX : MAINX + DX * col[r.g];
      var short = x.t.indexOf('14 Nov ') === 0 ? x.t.slice(7) : x.t;
      return '<div class="v12row ev">' + segs + (curve ? '<svg class="cv" width="' + txt + '" height="' + ROWH + '" aria-hidden="true">' + curve + '</svg>' : '') +
        '<span class="v12ico' + (onMain ? ' main' : '') + (x.s === 'idle' ? ' run' : '') + '" style="left:' + ix + 'px">' + (ICONS[x.k] || '') + '</span>' +
        '<div class="tx" style="left:' + txt + 'px"><div class="l1"><b>' + plain(x) + '</b><span class="st">' + (x.t === 'planned' ? 'Planned' : SL[x.s]) + '</span><span class="tm">' + esc(short) + '</span></div>' +
        '<div class="l2">' + esc(x.title) + '</div><div class="l3">by ' + esc(x.who) + (onMain ? ' · main' : '') + '</div></div></div>';
    }).join('');
    return '<div class="v12work">' + (it.why ? '<div class="why top">' + esc(it.why) + '</div>' : '') + html + '</div>';
  }
  var _msRow = msRow, _phaseRow = phaseRow;
  phaseRow = function (b) { return _phaseRow(b).replace('<span class="phname">', '<span class="phname"><span class="phno">' + phaseNo(b) + '</span>'); };
  msRow = function (b, i) {
    var it = PLANS[state.proj][b].items[i], key = 'it:' + b + ':' + i;
    if (it.now) return _msRow(b, i);
    var open = !!state.open[key]; state.open[key] = false; var h = _msRow(b, i); state.open[key] = open;
    h = h.replace('<span class="k mid">' + esc(it.id) + '</span>', '<span class="k mid"><span class="msno">' + msNo(b, i) + '</span>' + esc(it.id) + '</span>');
    if (open) { h = h.replace('class="pl ', 'class="pl open '); var k = h.lastIndexOf('</div></div>'); h = h.slice(0, k) + workHTML(b, i) + h.slice(k); }
    return h;
  };
  milestoneSheet = function (b, i) { var item = document.querySelector('#ptl .pl[data-key="it:' + b + ':' + i + '"]'); if (item) toggleInline(item); };
  document.addEventListener('click', function (e) {
    var hd = e.target.closest('.v12step > .sthd'); if (!hd) return;
    e.stopImmediatePropagation();
    var st = hd.parentNode, key = st.dataset.v12step, opening = !state.open[key];
    state.open[key] = opening; st.classList.toggle('open', opening); hd.setAttribute('aria-expanded', String(opening));
    if (opening) anim(st.querySelector('.v12plan'), [{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 260 });
  }, true);
  /* open the milestone with the worked example, and its step, so the mockup starts on it */
  (function () {
    var plan = PLANS.tl; if (!plan) return;
    plan.forEach(function (blk, b) { (blk.items || []).forEach(function (it, i) {
      if (it.id === 'M6') { state.open['it:' + b + ':' + i] = true; (it.sprints || []).forEach(function (sp, g) { sp.events.forEach(function (x, e) { if (STEPS[sp.name + '|' + x.title]) state.open['st:' + b + ':' + i + ':' + g + ':' + e] = true; }); }); }
    }); });
  })();
