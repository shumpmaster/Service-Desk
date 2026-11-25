  /* The owner's round 7, answer 22: "Convert the project Pills and the phase pills into two separate pills, that act as dropdown
     filters. And place both of them in the top. Then do a final pass on space optimization and readability." A layer over answer
     21's option A (the title bar gone, Back, the bell and More moved into the pills' row). The row of project pills and the four
     phase tiles leave; in their place, at the top: the project pill (its name and what waits) and the phase pill (the phase in
     view, its number and a small ring), each opening a list. Choosing a project switches to it; choosing a phase goes to it in
     the list. The phase pill follows the phase at the fixed centre. Then smaller gaps above and below the map, slightly larger
     words in the list and on the map. */
  document.documentElement.classList.add('tp');
  var TP_CV = '<svg class="cv" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';
  var TP_CK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';
  function tpRing(g) { return g ? g.outerHTML.replace('class="v13g', 'class="ring v13g') : ''; }
  function tpFix() {
    var band = document.getElementById('v13band'); if (!band) return;
    var row = band.querySelector('.pl-row'); if (!row) return;
    var chip = band.querySelector('.chips .chip[aria-pressed="true"]'), lk = band.querySelector('.v13phases .v13ph.lk') || band.querySelector('.v13phases .v13ph.cur');
    var pp = row.querySelector('.tp-pill.pj'), ph = row.querySelector('.tp-pill.ph');
    if (!pp) {
      var back = row.querySelector('#back');
      row.insertAdjacentHTML(back ? 'afterbegin' : 'afterbegin', '<button type="button" class="tp-pill pj" aria-haspopup="menu" aria-expanded="false"></button><button type="button" class="tp-pill ph" aria-haspopup="menu" aria-expanded="false"></button><span class="tp-spacer"></span>');
      if (back) row.insertBefore(back, row.firstChild);
      pp = row.querySelector('.tp-pill.pj'); ph = row.querySelector('.tp-pill.ph');
      var cap = row.querySelector('.capsule'); if (cap) row.appendChild(cap);
    }
    if (chip) { var n = chip.querySelector('.n'), nm = chip.childNodes[0] ? chip.childNodes[0].textContent : chip.textContent;
      var h1 = '<span class="t">' + esc(nm) + '</span>' + (n ? '<span class="n">' + n.textContent + '</span>' : '') + TP_CV;
      if (pp.dataset.sig !== h1) { pp.innerHTML = h1; pp.dataset.sig = h1; } pp.setAttribute('aria-label', 'Project: ' + nm + '. Choose another'); }
    if (lk) { var no = (lk.querySelector('.pn') || {}).textContent || '', nm2 = (lk.querySelector('.nm') || {}).textContent || '';
      nm2 = nm2.replace(/^\d+/, '');
      var h2 = tpRing(lk.querySelector('.v13g')) + '<span class="t">' + esc(nm2) + '</span>' + TP_CV;
      if (ph.dataset.sig !== no + nm2) { ph.innerHTML = h2; ph.dataset.sig = no + nm2; } ph.setAttribute('aria-label', 'Phase ' + no + ', ' + nm2 + '. Go to another phase'); }
  }
  function tpOpen(btn, html) {
    closeLayers(true);
    var r = btn.getBoundingClientRect(), m = openLayer(html, 'menu');
    m.classList.add('tp-menu'); menuEl = m;   /* so the desk's own closing (a choice, the scrim, Escape) takes it away */
    m.style.top = (r.bottom + 6) + 'px'; m.style.left = Math.max(10, Math.min(window.innerWidth - 280, r.left)) + 'px';
    btn.setAttribute('aria-expanded', 'true');
    var obs = new MutationObserver(function () { if (!document.body.contains(m)) { btn.setAttribute('aria-expanded', 'false'); obs.disconnect(); } }); obs.observe(document.body, { childList: true });
    if (!REDUCED) anim(m, [{ opacity: 0, transform: 'translateY(-6px) scale(.97)', transformOrigin: 'top left' }, { opacity: 1, transform: 'none', transformOrigin: 'top left' }], { duration: 200 });
  }
  window.addEventListener('click', function (e) {
    if (!v13on()) return;
    var pj = e.target.closest('.tp-pill.pj'), ph = e.target.closest('.tp-pill.ph'), pr = e.target.closest('[data-tp-ph]'), go = e.target.closest('.tp-menu [data-goto]');
    if (pj) { e.stopImmediatePropagation();
      var rows = [].slice.call(document.querySelectorAll('#v13band .chips .chip')).map(function (c) { var n = c.querySelector('.n'), on = c.getAttribute('aria-pressed') === 'true', nm = c.childNodes[0] ? c.childNodes[0].textContent : c.textContent;
        return '<button type="button" class="mi' + (on ? ' on' : '') + '" data-goto="' + c.dataset.goto + '"><span>' + esc(nm) + '</span><span class="sub">' + (n ? '<span class="n">' + n.textContent + '</span>' : '') + '</span>' + (on ? '<span class="ck">' + TP_CK + '</span>' : '') + '</button>'; }).join('');
      tpOpen(pj, '<div class="mcap">Projects</div>' + rows); return; }
    if (ph) { e.stopImmediatePropagation();
      var plan = PLANS[state.proj], lk = document.querySelector('#v13band .v13phases .v13ph.lk'), lb = lk ? +lk.dataset.b : -1;
      var rows2 = plan.map(function (blk, b) {
        if (blk.type === 'gate') return '<div class="mi gate' + (blk.st === 'done' ? ' ok' : '') + '"><i></i><span>' + esc(blk.name) + ' · ' + esc(blk.note || '') + '</span></div>';
        var g = phGauge(b), pb = document.querySelector('#v13band .v13phases .v13ph[data-b="' + b + '"]');
        return '<button type="button" class="mi' + (b === lb ? ' on' : '') + '" data-tp-ph="' + b + '">' + tpRing(pb && pb.querySelector('.v13g')) + '<span>' + esc(blk.name) + '</span><span class="sub">' + (b === curB() ? 'now · ' : '') + g.pct + '%</span>' + (b === lb ? '<span class="ck">' + TP_CK + '</span>' : '') + '</button>'; }).join('');
      tpOpen(ph, '<div class="mcap">Phases</div>' + rows2); return; }
    if (pr) { e.stopImmediatePropagation(); closeLayers(true); var t = document.querySelector('#v13band .v13phases .v13ph[data-b="' + pr.dataset.tpPh + '"]'); if (t) t.click(); return; }
    if (go) { closeLayers(true); }
  }, true);
  var tpBusy = false;
  var tpObs = new MutationObserver(function () { if (tpBusy) return; tpBusy = true; try { tpFix(); } finally { tpObs.takeRecords(); tpBusy = false; } });
  var _renderProjectTp = renderProject;
  renderProject = function () { var r = _renderProjectTp.apply(this, arguments); tpFix(); var b = document.getElementById('v13band'); if (b) { tpObs.disconnect(); tpObs.observe(b, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] }); } return r; };
