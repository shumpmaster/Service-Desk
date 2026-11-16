  /* ================= v14: the owner's round 4 (decisions/questions/P-005-design-round-4.md) =================
     Home becomes the desk map (DeskMap): one lane per project on a shared two-week axis, time stretched toward now.
     It opens large, with each project's name, waiting count and one line, and folds slim and pinned once you
     scroll down to Needs you (answer 8). What waits on the owner pops up on its project's lane in the StatusMark
     tint; tapping it scrolls to its row in Needs you and lights it (answer 7, option 1). The project cards are gone
     (answer 7); tapping a lane opens its project. Activity before today is an example; what waits is NEEDS. */
  var V14 = { W: 393, x0: 16, top: 22, open: 62, slim: 34, nowM: 14 * 1440 + 17 * 60 + 25 };   // the mockup's now: 14 Nov, 17:25
  V14.x1 = V14.W - 22;
  /* example activity, days back from now: dots, a release (green) and branch loops */
  var V14ACT = { tl: { ev: [13.5, 12, 11, 9.5, 8, 6.5, 5, 3.2, 2, 1.2, .5, .25], br: [[9, 5], [4.5, 0]] }, wd: { ev: [14, 13], br: [] },
    om: { ev: [13, 11.5, 10, 7, 6, 4, 2.5], ok: 1.4, br: [[7, 4]] }, ml: { ev: [12, 9, 6, 3, .8, .6, .45, .3], br: [[3, .3]] }, pf: { ev: [13, 8.5, 4.2], br: [] } };
  function v14X(t) { return V14.x1 - Math.sqrt(Math.min(t, 14) / 14) * (V14.x1 - V14.x0); }
  function v14ago(t) {   // a NEEDS time ('15:42' today, or '4 Nov') as days back from the mockup's now
    var m = /^(\d\d):(\d\d)$/.exec(t); if (m) return Math.max(0, (V14.nowM - (14 * 1440 + (+m[1]) * 60 + (+m[2]))) / 1440);
    m = /^(\d+) Nov$/.exec(t); return m ? V14.nowM / 1440 - (+m[1]) - .5 : 1;
  }
  function v14pops(pid) {   // what waits on the owner in one project, grouped by kind: [state, words, need indexes, days back]
    var by = {}, out = [];
    NEEDS.forEach(function (n, i) { if (n.p !== pid) return; (by[n.k] = by[n.k] || []).push(i); });
    Object.keys(by).forEach(function (k) {
      var ix = by[k], n = NEEDS[ix[0]], st = k === 'decision' ? 'wait' : 'bad';
      var words = k === 'decision' ? (ix.length > 1 ? ix.length + ' questions' : 'Your answer') : k === 'gate' ? (/fail/i.test(n.title) ? 'Failed · your call' : 'Gate · your call') : 'Your call';
      out.push([st, words, ix, Math.min.apply(null, ix.map(function (i) { return v14ago(NEEDS[i].t); })), k]);
    });
    return out.sort(function (a, b) { return a[3] - b[3]; });
  }
  function v14svg(n, a, p) { var e = document.createElementNS('http://www.w3.org/2000/svg', n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  var V14S = null;   // the drawn map: lanes, pop-ups, folded or not
  function v14draw() {
    var view = document.getElementById('view'), needs = view.querySelector('section.needs');
    var order = [].map.call(view.querySelectorAll('.desk .proj'), function (r) { return r.dataset.row; });
    var band = document.createElement('div'); band.className = 'v14band'; band.id = 'v14band';
    var wrap = document.createElement('div'); wrap.className = 'v14wrap'; band.appendChild(wrap);
    var svg = v14svg('svg', { width: V14.W, role: 'group', 'aria-label': 'Desk map: every project over the last two weeks' }); wrap.appendChild(svg);
    if (needs) needs.parentNode.insertBefore(band, needs); else view.querySelector('.desk').insertAdjacentElement('beforebegin', band);
    var nowl = v14svg('line', { class: 'v14nowl', x1: V14.x1, x2: V14.x1, y1: 4 }, svg);
    [[14, '31 Oct'], [7, '7 Nov'], [1, 'yesterday'], [0, 'now']].forEach(function (a) {
      v14svg('text', { class: 'v14ax', x: v14X(a[0]), y: 12, 'text-anchor': a[0] === 14 ? 'start' : a[0] ? 'middle' : 'end' }, svg).textContent = a[1]; });
    var lanes = {}, pops = [], delay = 0;
    order.forEach(function (id) {
      var p = proj(id), act = V14ACT[id] || { ev: [], br: [] }, g = v14svg('g', { class: 'v14lane', tabindex: 0, role: 'button', 'aria-label': 'Open ' + p.name }, svg);
      var nw = NEEDS.filter(function (x) { return x.p === id; }).length;
      lanes[id] = g;
      v14svg('rect', { class: 'hit', x: 4, y: -V14.open + 10, width: V14.W - 8, height: V14.open, rx: 10 }, g);
      v14svg('path', { class: 'v14g main', d: 'M' + V14.x0 + ' 0H' + V14.x1 }, g);
      act.br.forEach(function (b) { var a = v14X(b[0]), c = v14X(b[1]);
        v14svg('path', { class: 'v14g', d: 'M' + a + ' 0C' + (a + 6) + ' 0 ' + (a + 4) + ' -9 ' + (a + 12) + ' -9H' + (c - 12) + 'C' + (c - 4) + ' -9 ' + (c - 6) + ' 0 ' + c + ' 0' }, g); });
      act.ev.forEach(function (t) { v14svg('circle', { class: 'v14dot', cx: v14X(t), cy: 0, r: 3 }, g); });
      if (act.ok) v14svg('circle', { class: 'v14dot ok', cx: v14X(act.ok), cy: 0, r: 4 }, g);
      v14svg('circle', { class: 'v14now', cx: V14.x1, cy: 0, r: 3 }, g);
      var hd = v14svg('g', { class: 'v14head' }, g), nm = v14svg('text', { class: 'v14nm', x: V14.x0, y: -32 }, hd); nm.textContent = p.name;
      if (nw) { var bx = V14.x0 + nm.getComputedTextLength() + 13; v14svg('circle', { class: 'v14bdc', cx: bx, cy: -36.5, r: 7.5 }, hd); v14svg('text', { class: 'v14bd', x: bx, y: -32.5, 'text-anchor': 'middle' }, hd).textContent = nw; }
      v14svg('text', { class: 'v14sm', x: V14.x0, y: -17 }, g).textContent = p.what.length > 54 ? p.what.slice(0, 53) + '…' : p.what;
      function go() { var c = document.querySelector('.desk .pcard[data-proj="' + id + '"]'); if (c) c.click(); }
      g.addEventListener('click', function (e) { if (!e.target.closest('.v14pop')) go(); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      var right = null;
      v14pops(id).forEach(function (it) {
        if (right === null) right = Math.min(v14X(it[3]) + 11, V14.x1 - 2);
        var b = document.createElement('button'); b.type = 'button'; b.className = 'v14pop ' + it[0];
        b.innerHTML = '<span class="d">' + ICONS[it[4]] + '</span>' + esc(it[1]);
        b.setAttribute('aria-label', p.name + ', ' + it[1] + ': show what needs you');
        b.style.animationDelay = REDUCED ? '0ms' : (delay += 120) + 'ms'; wrap.appendChild(b);
        var w = b.offsetWidth;
        if (right - w < 60) { var l = Math.max(4, right - 22); b.style.left = l + 'px'; right = l - 4; } else { b.style.left = (right - w) + 'px'; right = right - w - 4; }
        b.addEventListener('click', function (e) { e.stopPropagation(); v14toRow(it[2]); });
        pops.push({ id: id, b: b });
      });
    });
    if (!view.querySelector('.v14foot')) view.insertAdjacentHTML('beforeend', '<div class="v14foot" aria-hidden="true"></div>');
    V14S = { band: band, wrap: wrap, svg: svg, nowl: nowl, lanes: lanes, pops: pops, order: order, folded: null };
    v14fold(false);
  }
  function v14fold(f) {
    var S = V14S; if (!S || S.folded === f) return; S.folded = f;
    var gap = f ? V14.slim : V14.open, h = V14.top + S.order.length * gap + 4;
    S.band.classList.toggle('folded', f);
    S.order.forEach(function (id, i) { var y = V14.top + (i + 1) * gap - 6; S.lanes[id].style.transform = 'translateY(' + y + 'px)'; S.lanes[id].dataset.y = y; });
    S.pops.forEach(function (p) { p.b.style.top = S.lanes[p.id].dataset.y + 'px'; });
    S.svg.setAttribute('height', h); S.svg.setAttribute('viewBox', '0 0 ' + V14.W + ' ' + h); S.wrap.style.height = h + 'px'; S.nowl.setAttribute('y2', h - 4);
  }
  function v14toRow(ix) {
    var rows = ix.map(function (i) { return document.querySelector('section.needs .need[data-key="n' + i + '"]'); }).filter(Boolean);
    if (!rows.length) return;   // Needs you folded away: nothing to light
    var slimH = V14.top + V14S.order.length * V14.slim + 12;
    window.scrollTo({ top: Math.max(0, rows[0].getBoundingClientRect().top + window.scrollY - slimH - 16), behavior: REDUCED ? 'auto' : 'smooth' });
    rows.forEach(function (r) { r.classList.remove('v14lit'); void r.offsetWidth; r.classList.add('v14lit'); });
  }
  var _renderDesk14 = renderDesk;
  renderDesk = function () {
    var r = _renderDesk14.apply(this, arguments), v = document.getElementById('view');
    V14S = null; if (v) { v.classList.add('v14'); v14draw(); }
    return r;
  };
  var _renderProject14 = renderProject;
  renderProject = function () { var v = document.getElementById('view'); if (v) v.classList.remove('v14'); V14S = null; return _renderProject14.apply(this, arguments); };
  window.addEventListener('scroll', function () { if (V14S && state.view === 'desk') v14fold(window.scrollY > (V14S.folded ? 20 : 60)); }, { passive: true });
