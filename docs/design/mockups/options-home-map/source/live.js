// Live options over B. HM_LIVE: 'row' (a pop-up opens its row in Needs you) or 'card' (Needs you moves into the project cards; a pop-up opens its card's row).
(function () {
  var mode = window.HM_LIVE, band = document.querySelector('.hm-band'), svg = band.querySelector('svg');
  var order = ['tl', 'hw', 'om', 'ml', 'pf'];
  var rows = [].slice.call(document.querySelectorAll('section.needs .need'));
  var rowIco = rows.map(function (r) { return r.querySelector('.ico svg').outerHTML; });
  // what needs you, per project: [status, label, need-row indexes]
  var POP = { tl: [['wait', '3 questions', [1, 2, 3]], ['bad', 'Your call', [0]]], hw: [['bad', 'Failed · your call', [4]]] };
  var wrap = document.createElement('div'); wrap.className = 'hm-mapwrap'; svg.parentNode.insertBefore(wrap, svg); wrap.appendChild(svg);
  var cards = [].slice.call(document.querySelectorAll('.desk .proj'));
  if (mode === 'card') {
    cards.forEach(function (c, i) { var id = order[i], list = POP[id]; if (!list) return;
      var box = document.createElement('div'); box.className = 'hm-items';
      list.slice().reverse().forEach(function (it) { it[2].forEach(function (k) { box.appendChild(rows[k]); }); });
      c.appendChild(box); });
    var ns = document.querySelector('section.needs'); if (ns) ns.hidden = true;
  }
  // the pop-ups: flowing left from the newest thing's place on the lane
  var lit = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); lit.setAttribute('class', 'hm-lit');
  lit.setAttribute('x', 4); lit.setAttribute('width', 393 - 8); lit.setAttribute('height', 28); lit.setAttribute('rx', 9); svg.insertBefore(lit, svg.firstChild);
  var laneY = {}; (window.HM_ICONS || []).forEach(function (ic) { laneY[ic.p] = ic.y; });
  var labels = [].slice.call(svg.querySelectorAll('.hm-lb'));
  order.forEach(function (id, i) { if (laneY[id] == null) laneY[id] = 44 + i * 34; });
  var delay = 0;
  Object.keys(POP).forEach(function (id) {
    var icons = (window.HM_ICONS || []).filter(function (ic) { return ic.p === id; });
    var right = Math.max.apply(null, icons.map(function (ic) { return ic.x; })) + 11;
    POP[id].slice().reverse().forEach(function (it) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'hm-pop ' + it[0];
      b.innerHTML = '<span class="d">' + rowIco[it[2][0]] + '</span>' + it[1];
      b.style.top = laneY[id] + 'px'; b.style.animationDelay = (delay += 120) + 'ms';
      b.setAttribute('aria-label', it[1] + ': open what needs you');
      wrap.appendChild(b);
      var w = b.offsetWidth;
      if (right - w < 60) { var l = Math.max(4, right - 22); b.style.left = l + 'px'; right = l - 4; }   // little room on the left: grow rightward from the icon
      else { b.style.left = (right - w) + 'px'; right = right - w - 4; }
      b.addEventListener('click', function () { go(id, it[2]); });
    });
  });
  function go(id, ks) {
    var r = rows[ks[0]], top = r.getBoundingClientRect().top + scrollY - band.offsetHeight - 16;
    window.scrollTo({ top: top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    ks.forEach(function (k) { rows[k].classList.remove('hm-flash'); void rows[k].offsetWidth; rows[k].classList.add('hm-flash'); });
  }
  // the card in view lights its lane, and tapping a lane's name goes to its card
  function sync() {
    var edge = band.getBoundingClientRect().bottom + 40, at = -1;
    cards.forEach(function (c, i) { if (c.getBoundingClientRect().top < edge + 120) at = i; });
    if (cards[0].getBoundingClientRect().top > innerHeight - 80) at = -1;
    lit.style.opacity = at < 0 ? 0 : 1; if (at >= 0) lit.setAttribute('y', laneY[order[at]] - 21);
    labels.forEach(function (l, i) { l.classList.toggle('on', i === at); });
  }
  addEventListener('scroll', sync, { passive: true }); sync();
})();
