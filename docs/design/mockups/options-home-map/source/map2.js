// Round 4, second question: the desk map with more room, and the project cards gone. Drawn over v13's home page.
// window.M2 = 'now' (option 1 as chosen: pinned, cards below), 'tall' (a taller pinned map), 'fold' (opens large, folds slim as you scroll),
// 'drawer' (the map fills the page; Needs you is a sheet that pulls up). Pop-ups tie to their rows in Needs you (round 4, answer 7).
(function () {
  var NS = 'http://www.w3.org/2000/svg', mode = window.M2;
  var rows = [].slice.call(document.querySelectorAll('section.needs .need'));
  var rowIco = rows.map(function (r) { return r.querySelector('.ico svg').outerHTML; });
  var cards = [].slice.call(document.querySelectorAll('.desk .proj'));
  var order = ['tl', 'hw', 'om', 'ml', 'pf'];
  // days back from now (0 = now); the activity before today is an example
  var P = {
    tl: { ev: [13.5, 12, 11, 9.5, 8, 6.5, 5, 3.2, 2, 1.2, .5, .25], br: [[9, 5], [4.5, 0]], pop: [['wait', '3 questions', [1, 2, 3], .11], ['bad', 'Your call', [0], .07]] },
    hw: { ev: [14, 13], br: [], pop: [['bad', 'Failed · your call', [4], 12.2]] },
    om: { ev: [13, 11.5, 10, 7, 6, 4, 2.5], ok: 1.4, br: [[7, 4]] },
    ml: { ev: [12, 9, 6, 3, .8, .6, .45, .3], br: [[3, .3]] },
    pf: { ev: [13, 8.5, 4.2], br: [] }
  };
  order.forEach(function (id, i) { var c = cards[i]; if (!c) return; var d = P[id];
    d.card = c.querySelector('.pcard'); d.name = c.querySelector('.p-name').textContent; d.sub = c.querySelector('.p-sub').textContent;
    d.what = c.querySelector('.p-what').textContent; var b = c.querySelector('.p-badge'); d.badge = b ? b.textContent : ''; });
  var LAY = { now: { gap: 30, sum: 0 }, tall: { gap: 56, sum: 1 }, fold: { gap: 62, sum: 1, slim: 34 }, drawer: { gap: 82, sum: 2 } }[mode];
  var W = 393, x0 = 16, x1 = W - 22, top = 22;
  var X = function (t) { return x1 - Math.sqrt(t / 14) * (x1 - x0); };   // time stretched toward now
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function trunc(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  var band = document.createElement('div'); band.className = 'm2band' + (mode === 'drawer' ? ' static' : '');
  var wrap = document.createElement('div'); wrap.className = 'm2wrap'; band.appendChild(wrap);
  var svg = el('svg', { width: W }); wrap.appendChild(svg);
  var needs = document.querySelector('section.needs'); needs.parentNode.insertBefore(band, needs);
  var nowline = el('line', { class: 'm2nowline', x1: x1, x2: x1, y1: 4 }, svg);
  [[14, '2 Nov'], [7, '9 Nov'], [1, 'yesterday'], [0, 'now']].forEach(function (a) {
    el('text', { class: 'm2ax', x: X(a[0]), y: 12, 'text-anchor': a[0] === 14 ? 'start' : a[0] ? 'middle' : 'end' }, svg).textContent = a[1]; });
  var lanes = {}, pops = [];
  order.forEach(function (id) {
    var d = P[id], g = el('g', { class: 'm2lane' }, svg); lanes[id] = g;
    el('rect', { class: 'hit', x: 4, y: -LAY.gap + 10, width: W - 8, height: LAY.gap, rx: 10 }, g);
    el('path', { class: 'm2g main', d: 'M' + x0 + ' 0H' + x1 }, g);
    d.br.forEach(function (b) { var a = X(b[0]), c = X(b[1]);
      el('path', { class: 'm2g', d: 'M' + a + ' 0C' + (a + 6) + ' 0 ' + (a + 4) + ' -9 ' + (a + 12) + ' -9H' + (c - 12) + 'C' + (c - 4) + ' -9 ' + (c - 6) + ' 0 ' + c + ' 0' }, g); });
    d.ev.forEach(function (t) { el('circle', { class: 'm2dot', cx: X(t), cy: 0, r: 3 }, g); });
    if (d.ok) el('circle', { class: 'm2dot ok', cx: X(d.ok), cy: 0, r: 4 }, g);
    el('circle', { class: 'm2now', cx: x1, cy: 0, r: 3 }, g);
    var NY = LAY.sum === 2 ? -48 : LAY.sum ? -32 : -12;   // name first, then its line
    var nm = el('text', { class: 'm2nm', x: x0, y: NY }, g); nm.textContent = d.name || id; d.nm = nm;
    if (d.badge) { var bx = x0 + nm.getComputedTextLength() + 14; d.bd = el('g', {}, g); el('circle', { class: 'm2bdc', cx: bx, cy: NY - 4.5, r: 7.5 }, d.bd); el('text', { class: 'm2bd', x: bx, y: NY - .5, 'text-anchor': 'middle' }, d.bd).textContent = d.badge; }
    if (LAY.sum) {
      if (LAY.sum === 2) el('text', { class: 'm2sub', x: x0, y: -33 }, g).textContent = d.sub;
      el('text', { class: 'm2sm', x: x0, y: -17 }, g).textContent = trunc(d.what, 54);
    }
    g.addEventListener('click', function (e) { if (!e.target.closest('.hm-pop') && d.card) d.card.click(); });
    (d.pop || []).forEach(function (it) { pops.push({ id: id, it: it }); });
  });
  // the pop-ups: each thing that needs you, on its lane, in its tag's colour; newest at its place, the rest flowing left
  var delay = 0, byLane = {};
  pops.forEach(function (p) { (byLane[p.id] = byLane[p.id] || []).push(p); });
  Object.keys(byLane).forEach(function (id) {
    var list = byLane[id].slice().sort(function (a, b) { return a.it[3] - b.it[3]; }), right = Math.min(X(list[0].it[3]) + 11, x1 - 2);
    list.forEach(function (p) {
      var it = p.it, b = document.createElement('button'); b.type = 'button'; b.className = 'hm-pop ' + it[0];
      b.innerHTML = '<span class="d">' + rowIco[it[2][0]] + '</span>' + it[1]; b.setAttribute('aria-label', it[1] + ': show what needs you');
      b.style.animationDelay = (delay += 120) + 'ms'; wrap.appendChild(b);
      var w = b.offsetWidth;
      if (right - w < 60) { var l = Math.max(4, right - 22); b.style.left = l + 'px'; right = l - 4; } else { b.style.left = (right - w) + 'px'; right = right - w - 4; }
      b.addEventListener('click', function (e) { e.stopPropagation(); go(it[2]); });
      p.b = b;
    });
  });
  function layout(gap) {
    var h = top + order.length * gap + 4;
    order.forEach(function (id, i) { var y = top + (i + 1) * gap - 6; lanes[id].style.transform = 'translateY(' + y + 'px)'; lanes[id].dataset.y = y; });
    pops.forEach(function (p) { p.b.style.top = lanes[p.id].dataset.y + 'px'; });
    svg.setAttribute('height', h); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + h); wrap.style.height = h + 'px'; nowline.setAttribute('y2', h - 4);
  }
  layout(LAY.gap);
  if (mode === 'fold') {
    var folded = false;
    addEventListener('scroll', function () {
      var f = scrollY > (folded ? 20 : 60); if (f === folded) return; folded = f;
      band.classList.toggle('folded', f); layout(f ? LAY.slim : LAY.gap);
      order.forEach(function (id) { var d = P[id], dy = f ? 20 : 0; d.nm.style.transform = 'translateY(' + dy + 'px)'; if (d.bd) d.bd.style.transform = 'translateY(' + dy + 'px)'; });
    }, { passive: true });
  }
  var drawer;
  if (mode === 'drawer') {
    drawer = document.createElement('div'); drawer.className = 'm2drawer';
    drawer.innerHTML = '<button type="button" class="grab" aria-expanded="false"><i></i><span>Needs you<em>' + rows.length + ' waiting</em></span></button>';
    document.body.appendChild(drawer); drawer.appendChild(needs);
    drawer.querySelector('.grab').addEventListener('click', function () { setDrawer(!drawer.classList.contains('open')); });
  }
  function setDrawer(o) { drawer.classList.toggle('open', o); drawer.querySelector('.grab').setAttribute('aria-expanded', o); if (!o) drawer.scrollTop = 0; }
  function go(ks) {
    var r = rows[ks[0]], smooth = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (drawer) { setDrawer(true); setTimeout(function () { drawer.scrollTo({ top: r.offsetTop - 70, behavior: smooth }); }, 380); }
    else { var bh = mode === 'fold' ? top + order.length * LAY.slim + 10 : band.offsetHeight;
      window.scrollTo({ top: r.getBoundingClientRect().top + scrollY - bh - 16, behavior: smooth }); }
    ks.forEach(function (k) { rows[k].classList.remove('hm-flash'); void rows[k].offsetWidth; rows[k].classList.add('hm-flash'); });
  }
})();
