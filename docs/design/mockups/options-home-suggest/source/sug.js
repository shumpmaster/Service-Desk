  /* Suggestions for the home page (round 4, answer 10), a layer over v13 inside its script. SUG = 'A' | 'B' | 'C'.
     A: Needs you first, then each project as one quiet row with its phase gauge.
     B: as A, with a slim strip of the events that matter under each project (real events only).
     C: what waits on you grouped by project; the projects with nothing waiting folded into one row. */
  var SUG_NOW = 14 * 1440 + 17 * 60 + 25;   // the mockup's now: 14 Nov, 17:25
  function sugGauge(pid) {   // the project's current phase, by v13's rule: milestones reached; yellow if anything waits
    var plan = PLANS[pid]; if (!plan) return null;
    var b = 0; for (var i = 0; i < plan.length; i++) if (plan[i].type === 'phase' && plan[i].st === 'current') { b = i; break; }
    var blk = plan[b], its = blk.items.filter(function (x) { return !x.now; }), r = its.filter(function (x) { return x.st === 'reached'; }).length;
    var no = 0; for (i = 0; i <= b; i++) if (plan[i].type === 'phase') no++;
    var waits = NEEDS.filter(function (x) { return x.p === pid; }).length;
    return { no: no, name: blk.name, st: waits ? 'wait' : 'ok', pct: its.length ? Math.round(100 * r / its.length) : 0, r: r, n: its.length };
  }
  function sugEvents(p) {   // each event's time as minutes, from the day headers ('Today, 14 Nov', '4 Nov') and its HH:MM
    var day = 14, out = [];
    p.events.forEach(function (e) {
      if (e.day) { var m = /(\d+) Nov/.exec(e.day); if (m) day = +m[1]; return; }
      var t = /^(\d\d):(\d\d)$/.exec(e.t); if (t) out.push({ m: day * 1440 + (+t[1]) * 60 + (+t[2]), e: e });
    });
    return out;
  }
  function sugLast(p) {
    var ev = sugEvents(p); if (!ev.length) return '';
    var m = ev[0].m, d = Math.floor(m / 1440);
    return d === 14 ? ev[0].e.t : d === 13 ? 'yesterday' : d + ' Nov';
  }
  var SUG_CHEV = '<svg class="chev" viewBox="0 0 256 256" aria-hidden="true"><path d="M96 48l80 80-80 80" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function sugRow(p, extra) {
    var g = sugGauge(p.id), n = NEEDS.filter(function (x) { return x.p === p.id; }).length;
    var gh = g ? g13(g.pct, g.st, '<span class="pn">' + g.no + '</span>') : '<span class="sg-dotg"><i></i></span>';
    var l3 = g ? g.name + ' · ' + g.r + ' of ' + g.n + ' milestones' : 'No plan on record in this mockup';
    return '<button type="button" class="sg-row" data-sgp="' + p.id + '" aria-label="Open ' + esc(p.name) + '">' + gh +
      '<span class="tx"><span class="l1">' + esc(p.name) + (n ? '<span class="sg-badge">' + n + '</span>' : '') + '<span class="tm">' + sugLast(p) + '</span></span>' +
      '<span class="l2">' + esc(p.what) + '</span>' + (extra === 'l3' ? '<span class="l3">' + esc(l3) + '</span>' : '') + '</span>' + SUG_CHEV + '</button>';
  }
  function sugStrip(p) {   // B: the last 14 days, the time stretched toward now; merges, stops, gates and decisions only
    var W = 300, x0 = 4, x1 = W - 8, X = function (m) { return x1 - Math.sqrt(Math.min(14, (SUG_NOW - m) / 1440) / 14) * (x1 - x0); };
    var o = '<line class="ln" x1="' + x0 + '" x2="' + x1 + '" y1="14" y2="14"/>';
    sugEvents(p).forEach(function (x) {
      var k = x.e.k; if (!/^(merge|stop|gate|decision)$/.test(k)) return;
      var cls = x.e.s === 'you' ? (k === 'decision' ? 'wait' : 'bad') : k === 'merge' ? 'merge' : '';
      o += '<circle class="ev ' + cls + ' ' + k + '" cx="' + X(x.m).toFixed(1) + '" cy="14" r="' + (cls === 'bad' || cls === 'wait' ? 4.5 : 3) + '"><title>' + esc(x.e.title) + '</title></circle>';
    });
    o += '<circle class="now" cx="' + x1 + '" cy="14" r="3"/><text class="ax" x="' + x0 + '" y="4">31 Oct</text><text class="ax" x="' + x1 + '" y="4" text-anchor="end">now</text>';
    return '<span class="sg-strip" aria-hidden="true"><svg width="' + W + '" height="20" viewBox="0 0 ' + W + ' 20">' + o + '</svg></span>';
  }
  function sugOrder() { return PROJECTS.slice().sort(function (a, b) { return NEEDS.filter(function (x) { return x.p === b.id; }).length - NEEDS.filter(function (x) { return x.p === a.id; }).length; }); }
  function sugDraw() {
    var view = document.getElementById('view'), needs = view.querySelector('section.needs'), h = '';
    view.classList.add('sug', 'sug' + SUG);
    if (SUG === 'A' || SUG === 'B') {
      h = '<section class="sg" aria-label="Projects"><div class="sg-h">Projects</div>' + sugOrder().map(function (p) { return sugRow(p, 'l3') + (SUG === 'B' ? sugStrip(p) : ''); }).join('') + '</section>';
      view.querySelector('.desk').insertAdjacentHTML('beforebegin', h);
    } else {
      var waiting = sugOrder().filter(function (p) { return NEEDS.some(function (x) { return x.p === p.id; }); }), quiet = sugOrder().filter(function (p) { return waiting.indexOf(p) < 0; });
      h = '<p class="sg-sum"><b>' + NEEDS.length + ' things wait on you</b>, in ' + waiting.length + ' projects. ' + quiet.length + ' projects are quiet.</p>' +
        waiting.map(function (p) { return '<section class="sg-grp" data-sgg="' + p.id + '">' + sugRow(p) + '</section>'; }).join('') +
        '<section class="sg-quiet"><button type="button" class="sg-row" data-sgq aria-expanded="false"><span class="sg-dotg"><i></i></span><span class="tx"><span class="l1">Nothing waits on you in ' +
        quiet.map(function (p) { return esc(p.name); }).join(', ') + '</span></span>' + SUG_CHEV + '</button><div class="sg-quiet-list" hidden>' + quiet.map(function (p) { return sugRow(p); }).join('') + '</div></section>';
      view.querySelector('.desk').insertAdjacentHTML('beforebegin', h);
      if (needs) [].slice.call(needs.querySelectorAll('.need')).forEach(function (r) {   // move each waiting row under its project, keeping its own behaviour
        var i = +r.dataset.key.slice(1), g = view.querySelector('[data-sgg="' + NEEDS[i].p + '"]'); if (g) g.appendChild(r); });
    }
    view.insertAdjacentHTML('beforeend', '<div class="sg-foot" aria-hidden="true"></div>');
  }
  document.addEventListener('click', function (e) {
    var r = e.target.closest('.sg-row[data-sgp]'); if (r) { var c = document.querySelector('.desk .pcard[data-proj="' + r.dataset.sgp + '"]'); if (c) c.click(); return; }
    var q = e.target.closest('[data-sgq]'); if (q) { var l = q.nextElementSibling, o = l.hidden; l.hidden = !o; q.setAttribute('aria-expanded', o); }
  });
  var _renderDeskSug = renderDesk;
  renderDesk = function () { var r = _renderDeskSug.apply(this, arguments); sugDraw(); return r; };
  var _renderProjectSug = renderProject;
  renderProject = function () { var v = document.getElementById('view'); if (v) v.classList.remove('sug', 'sugA', 'sugB', 'sugC'); return _renderProjectSug.apply(this, arguments); };
