  /* ---- v33 motion: one curve, one spring, four durations (docs/design/audit-2026-11-25-v32-polish.md, section 3; M1 to M8) ---- */
  var V33 = (function () {
    var cs = getComputedStyle(document.documentElement), sp = cs.getPropertyValue('--spring').trim(), bo = cs.getPropertyValue('--spring-bouncy').trim();
    var ok = false; try { document.body.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, easing: sp }).cancel(); ok = /linear\(/.test(sp); } catch (x) { ok = false; }
    return { ease: 'cubic-bezier(.2,.8,.2,1)', exit: 'cubic-bezier(.4,0,1,1)', spring: ok ? sp : 'cubic-bezier(.2,.8,.2,1)', bouncy: ok ? bo : 'cubic-bezier(.34,1.56,.64,1)' };
  })();
  /* M1: iOS only shows :active once a touch listener exists */
  document.addEventListener('touchstart', function () {}, { passive: true });

  /* the Now jump and named jumps: 450 to 600 ms whatever the distance; very long jumps fade, land and settle */
  var v33Scroll = 0;
  function v33ScrollTo(y) {
    y = Math.max(0, Math.min(y, document.documentElement.scrollHeight - window.innerHeight));
    cancelAnimationFrame(v33Scroll); var y0 = window.scrollY, dy = y - y0;
    if (REDUCED || Math.abs(dy) < 2) { finScrollTo(0, y); return; }
    var list = document.getElementById('v13list');
    if (Math.abs(dy) > 2200 && list && list.animate) {
      var a = list.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: V33.exit, fill: 'forwards' });
      a.onfinish = function () { finScrollTo(0, y); a.cancel(); list.animate([{ opacity: 0, transform: 'translateY(' + (dy > 0 ? 12 : -12) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: V33.ease }); };
      return;
    }
    var dur = Math.min(600, 450 + Math.abs(dy) / 20), t0 = performance.now();
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      finScrollTo(0, y0 + dy * e); if (p < 1) v33Scroll = requestAnimationFrame(step);
    })(t0);
  }
  ['wheel', 'touchstart'].forEach(function (n) { window.addEventListener(n, function () { cancelAnimationFrame(v33Scroll); }, { passive: true }); });
  var _v13homeV33 = v13home;
  v13home = function (smooth) {
    if (!smooth || REDUCED || !v13on()) return _v13homeV33(smooth);
    var now = document.querySelector('#v13list .v13now') || document.querySelector('#v13list .v13phase.cur'); if (!now) return;
    v33ScrollTo(now.getBoundingClientRect().top + window.scrollY - bandH() - 8);
  };

  /* M2: the map moves instead of being rebuilt: each event slides from where it was, the window from its old place,
     the lanes and words cross-fade; nothing dips */
  function v33MapSnap() {
    var inn = document.getElementById('v13in'), svg = inn && inn.querySelector('svg'); if (!svg) return null;
    var R = svg.getBoundingClientRect(), s = (+svg.getAttribute('width') || R.width) / (R.width || 1), pos = {};
    [].slice.call(svg.querySelectorAll('g.st[data-k]')).forEach(function (g) { var d = g.querySelector('circle.dot') || g; var r = d.getBoundingClientRect(); pos[g.dataset.k] = [(r.left + r.width / 2 - R.left) * s, (r.top + r.height / 2 - R.top) * s]; });
    var w = svg.querySelector('rect.win'), wr = w && w.getBoundingClientRect();
    return { svg: svg, pos: pos, win: wr && wr.width ? [(wr.left - R.left) * s, wr.width * s] : null };
  }
  function v33MapFlip(o) {
    var inn = document.getElementById('v13in'), svg = inn && inn.querySelector('svg'); if (!o || !svg || svg === o.svg || REDUCED) return;
    var R = svg.getBoundingClientRect(), s = (+svg.getAttribute('width') || R.width) / (R.width || 1);
    [].slice.call(svg.querySelectorAll('g.st[data-k]')).forEach(function (g) {
      var p = o.pos[g.dataset.k]; if (!p) { g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: V33.ease }); return; }
      var d = g.querySelector('circle.dot') || g, r = d.getBoundingClientRect(), nx = (r.left + r.width / 2 - R.left) * s, ny = (r.top + r.height / 2 - R.top) * s;
      var dx = p[0] - nx, dy = p[1] - ny; if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;
      g.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 320, easing: V33.spring });
    });
    [].slice.call(svg.querySelectorAll('path.g, text.fl, text.lb, path.ml-lead, text.ml')).forEach(function (t) { t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: V33.ease }); });
    var ghost = document.createElementNS('http://www.w3.org/2000/svg', 'g'); ghost.setAttribute('aria-hidden', 'true'); ghost.style.pointerEvents = 'none';
    [].slice.call(o.svg.querySelectorAll('path.g, text.fl, text.lb, path.ml-lead')).forEach(function (n) { ghost.appendChild(n.cloneNode(true)); });
    svg.insertBefore(ghost, svg.querySelector('g.st') || null);
    var ga = ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: V33.exit, fill: 'forwards' }); ga.onfinish = ga.oncancel = function () { ghost.remove(); };
    var w = svg.querySelector('rect.win');
    if (w && o.win) {
      [].slice.call(w.getAnimations()).forEach(function (a) { a.cancel(); });
      w.style.transition = 'none'; void w.getBoundingClientRect(); w.style.transition = '';
      var x1 = +w.getAttribute('x'), w1 = +w.getAttribute('width'); if (w1 > 0) {
        var k = o.win[1] / w1, tx = o.win[0] - x1 * k;
        w.style.transformBox = 'view-box'; w.style.transformOrigin = '0 0';
        w.animate([{ transform: 'matrix(' + k + ',0,0,1,' + tx + ',0)' }, { transform: 'none' }], { duration: 320, easing: V33.spring });
      }
    }
  }
  var _v13syncV33 = v13sync;
  v13sync = function (animate) {
    var o = animate ? v33MapSnap() : null, r = _v13syncV33.apply(this, arguments);
    if (o) v33MapFlip(o);
    v33Lanes(); return r;
  };

  /* M3: folds open and close: the body grows or shrinks on the spring, its words fade in over the first 150 ms; the
     tapped row stays put (R7 answer 12) */
  var _relistV33 = relist;
  relist = function (anchorSel) {
    var m = /^\[data-v13fold="([^"]*)"\]$/.exec(anchorSel || ''), before = null;
    if (m && !REDUCED) { var f0 = document.querySelector('#v13list ' + anchorSel), b0 = f0 && f0.parentNode.querySelector(':scope > .v13body, :scope > .v13acts'); before = { key: m[1], body: b0 ? b0.cloneNode(true) : null, h: b0 ? b0.getBoundingClientRect().height : 0 }; }
    var r = _relistV33.apply(this, arguments);
    if (before) setTimeout(function () { requestAnimationFrame(function () { v33Fold(before); }); }, 0);
    return r;
  };
  function v33Fold(b) {
    var f = document.querySelector('#v13list [data-v13fold=' + v33q(b.key) + ']'); if (!f) return;
    var body = f.parentNode.querySelector(':scope > .v13body, :scope > .v13acts');
    if (body && !b.body) {   /* opening */
      var h = body.getBoundingClientRect().height; if (!h) return;
      body.style.overflow = 'hidden';
      var a = body.animate([{ height: '0px' }, { height: h + 'px' }], { duration: 320, easing: V33.spring });
      body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: V33.ease });
      a.onfinish = a.oncancel = function () { body.style.overflow = ''; };
    } else if (!body && b.body && b.h) {   /* closing: what was there folds away */
      var g = b.body; g.setAttribute('aria-hidden', 'true'); g.style.overflow = 'hidden'; g.style.pointerEvents = 'none'; g.classList.add('v33-ghost');
      f.insertAdjacentElement('afterend', g);
      var c = g.animate([{ height: b.h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 240, easing: V33.ease, fill: 'forwards' });
      c.onfinish = c.oncancel = function () { g.remove(); };
    }
  }

  /* M4: opening a project is one continuous push from the left (v11's direction, kept): the project is drawn first, then
     both layers move together on the spring; a second tap, or Back, reverses at once */
  var v33Push = null;
  function v33PushRun(build, dirIn) {
    var view = document.getElementById('view');
    if (v33Push) { v33Push.finish(); }
    if (REDUCED || !view.animate) { build(); return; }
    var r = view.getBoundingClientRect(), g = view.cloneNode(true);
    g.removeAttribute('id'); [].slice.call(g.querySelectorAll('[id]')).forEach(function (n) { n.removeAttribute('id'); });
    g.setAttribute('aria-hidden', 'true'); g.classList.add('v33-ghost');
    g.style.cssText = 'position:fixed;z-index:45;pointer-events:none;margin:0;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;background:var(--ground);';
    document.body.appendChild(g);
    build();
    var W = window.innerWidth, aIn = view.animate([{ transform: 'translateX(' + (dirIn * W) + 'px)' }, { transform: 'none' }], { duration: 420, easing: V33.spring });
    var aOut = g.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(' + (-dirIn * W * .3) + 'px)', opacity: 0 }], { duration: 420, easing: V33.spring, fill: 'forwards' });
    var done = function () { g.remove(); if (v33Push && v33Push.g === g) v33Push = null; };
    aOut.onfinish = aOut.oncancel = done;
    v33Push = { g: g, finish: function () { aIn.finish(); aOut.finish(); done(); } };
  }
  openProject = function (id) {
    busy = false;
    v33PushRun(function () {
      document.querySelectorAll('.proj, .needs, .desk-end, .sect').forEach(function (r) { r.getAnimations().forEach(function (a) { a.cancel(); }); });
      state.view = 'proj'; state.proj = id; renderProject(id, false); settle();
    }, -1);
    setTimeout(function () { var now = document.querySelector('#v13list .v13now'); if (now) { now.classList.remove('flash'); void now.offsetWidth; now.classList.add('flash'); } }, REDUCED ? 0 : 420);
  };
  closeProject = function () {
    busy = false;
    v33PushRun(function () { state.view = 'desk'; state.proj = null; renderDesk(); finScrollTo(0, 0); }, 1);
  };

  /* M5 and C1: menus are one component; they open on the spring from the control that opened them and close as the
     reverse, from the same corner; the sheet closes in 280 ms */
  function v33MenuIn(m, origin) {
    if (!m) return; m.dataset.v33o = origin; [].slice.call(m.getAnimations()).forEach(function (a) { a.cancel(); });
    if (!REDUCED) m.animate([{ opacity: 0, transform: 'scale(.9)', transformOrigin: origin }, { opacity: 1, transform: 'none', transformOrigin: origin }], { duration: 240, easing: V33.spring });
  }
  var _tpOpenV33 = tpOpen;
  tpOpen = function (btn) { var r = _tpOpenV33.apply(this, arguments); v33MenuIn(menuEl, 'top left'); return r; };
  var _openMenuV33 = openMenu;
  openMenu = function () { var r = _openMenuV33.apply(this, arguments); if (menuEl) { menuEl.classList.add('v33-menu'); v33MenuIn(menuEl, 'top right'); } return r; };
  var _openSheetV33 = openSheet;
  openSheet = function () { var r = _openSheetV33.apply(this, arguments); if (sheetEl && !REDUCED) { [].slice.call(sheetEl.getAnimations()).forEach(function (a) { a.cancel(); }); sheetEl.animate([{ transform: 'translateY(105%)' }, { transform: 'none' }], { duration: 450, easing: V33.spring }); } if (scrimEl && !REDUCED) scrimEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: V33.ease }); return r; };
  closeLayers = function (instant) {
    var s = sheetEl, m = menuEl, sc = scrimEl; sheetEl = menuEl = scrimEl = null;
    if (instant || REDUCED) { [s, m, sc].forEach(function (x) { if (x) x.remove(); }); return; }
    var end = function (el, a) { a.onfinish = a.oncancel = function () { el.remove(); }; };
    if (s) end(s, s.animate([{ transform: s.style.transform || 'none' }, { transform: 'translateY(110%)' }], { duration: 280, easing: V33.exit, fill: 'forwards' }));
    if (m) { var o = m.dataset.v33o || 'top right'; end(m, m.animate([{ opacity: 1, transform: 'none', transformOrigin: o }, { opacity: 0, transform: 'scale(.9)', transformOrigin: o }], { duration: 160, easing: V33.exit, fill: 'forwards' })); }
    if (sc) end(sc, sc.animate([{ opacity: getComputedStyle(sc).opacity }, { opacity: 0 }], { duration: 200, easing: V33.exit, fill: 'forwards' }));
  };

  /* M7: the sheet's drag follows the finger with its speed: a flick or a third of its height puts it away; dragging up
     gives a little; the scrim fades with the drag */
  (function () {
    var y0 = null, last = [], h = 1;
    document.addEventListener('pointerdown', function (e) { if (sheetEl && e.target.closest('[data-grab]')) { y0 = e.clientY; last = [[e.clientY, e.timeStamp]]; h = sheetEl.getBoundingClientRect().height || 1; } }, true);
    document.addEventListener('pointermove', function (e) {
      if (y0 === null || !sheetEl) return; e.stopImmediatePropagation();
      var d = e.clientY - y0, t = d < 0 ? d * .3 : d; sheetEl.style.transform = 'translateY(' + t + 'px)';
      if (scrimEl) scrimEl.style.opacity = String(Math.max(0, 1 - Math.max(0, d) / h));
      last.push([e.clientY, e.timeStamp]); if (last.length > 5) last.shift();
    }, true);
    document.addEventListener('pointerup', function (e) {
      if (y0 === null) return; e.stopImmediatePropagation();
      var d = e.clientY - y0, a = last[0], v = a ? (e.clientY - a[0]) / Math.max(1, e.timeStamp - a[1]) : 0; y0 = null;
      if (!sheetEl) return;
      if (v > .5 || d > h / 3) { closeLayers(); return; }
      var from = sheetEl.style.transform; sheetEl.style.transform = '';
      if (scrimEl) { var so = scrimEl.style.opacity; scrimEl.style.opacity = ''; if (!REDUCED) scrimEl.animate([{ opacity: so || 1 }, { opacity: 1 }], { duration: 320, easing: V33.spring }); }
      if (!REDUCED) sheetEl.animate([{ transform: from || 'none' }, { transform: 'none' }], { duration: 320, easing: V33.spring });
    }, true);
  })();
