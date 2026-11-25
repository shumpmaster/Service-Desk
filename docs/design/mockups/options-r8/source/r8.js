  /* ================= round 8 options over v33 (decisions/questions/P-005-design-round-8.md, answer 5) =================
     The phone's hash names one option and where the phone starts: #<option>.<start>[.<start>]
     options: now t38 t44 whyfill pushR f2w f2n f4b f4c f5p f5s f6c f6h u3s u3a u5n u5b r1w r1a r2d r2m o3
     starts: home (stay on home), cx (Context view on), at=<text> (put the row holding <text> at the pointer) */
  var R8 = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.'), o = { opt: h[0] || 'now', home: false, cx: false, at: null };
    h.slice(1).forEach(function (t) { if (t === 'home') o.home = true; else if (t === 'cx') o.cx = true; else if (t.indexOf('at=') === 0) o.at = t.slice(3).replace(/_/g, ' '); });
    document.documentElement.classList.add('o-' + o.opt);
    return o;
  })();
  function r8is(x) { return R8.opt === x; }
  /* put an element's middle at the fixed pointer */
  function r8Centre(el, smooth) {
    if (!el) return; var c = ctCentre(), r = el.getBoundingClientRect(), y = window.scrollY + r.top + r.height / 2 - c.y;
    if (smooth && typeof v33ScrollTo === 'function') v33ScrollTo(y); else finScrollTo(0, Math.max(0, y));
    setTimeout(ctSoon, 30); setTimeout(ctSoon, 650);
  }
  function r8Find(text) {
    var best = null;
    [].slice.call(document.querySelectorAll('#v13list .v13phh, #v13list .v13gr, #v13list .v13ev, #v13list .v13now')).forEach(function (el) { if (!best && el.textContent.indexOf(text) >= 0) best = el; });
    return best;
  }

  /* 3 the push: from the right, back to the left (the iOS way) */
  if (r8is('pushR')) { var _pushR8 = v33PushRun; v33PushRun = function (build, dirIn) { return _pushR8(build, -dirIn); }; }

  /* 4 F2: where the page opens and where a tap on the round button lands */
  function r8Waiting() {
    if (r8is('f2n')) return document.querySelector('#v13list .v13now');
    return [].slice.call(document.querySelectorAll('#v13list .v13ev')).filter(function (e) { return /Waiting on you/.test(e.textContent) && /Stop card/.test(e.textContent); })[0] || document.querySelector('#v13list .v13now');
  }
  if (r8is('f2w') || r8is('f2n')) {
    var _homeR8 = v13home;
    v13home = function (smooth) { if (!v13on()) return _homeR8(smooth); r8Centre(r8Waiting(), smooth); };
  }

  /* 5 F4: the map's scale while you scroll */
  if (r8is('f4b')) { var _fitXR8 = fitX; fitX = function (L, on) { return _fitXR8(L, null); }; }
  if (r8is('f4c')) {
    var _onSetR8 = onSet;
    onSet = function () {
      var el = ctPick(), inPlan = el && el.closest && el.closest('.v13step, ol.v12plan, .v13acts');
      if (inPlan && MAP && MAP.on && lastOn) return { on: MAP.on, sig: lastOn };
      return _onSetR8();
    };
  }

  /* 6 F5 and 8 U3: the band with or without its map */
  function r8Band() { return document.getElementById('v13band'); }
  function r8Slim(on) {
    var b = r8Band(); if (!b || b.classList.contains('r8-slim') === !!on) return;
    var el = ctPick(), r0 = el && el.getBoundingClientRect().top, c0 = ctCentre().y;
    b.classList.toggle('r8-slim', !!on);
    if (el) { var d = el.getBoundingClientRect().top - r0 + (c0 - ctCentre().y); if (Math.abs(d) > .5) finScrollTo(0, window.scrollY + d); }
    r8Strip(); ctSoon();
  }
  function r8Strip() {
    var b = r8Band(); if (!b) return; var s = b.querySelector('.r8-strip');
    if (!s) { s = document.createElement('div'); s.className = 'r8-strip'; b.appendChild(s); }
    var plan = PLANS[state.proj], pb = phInView(); if (pb === null) pb = viewB();
    var blk = plan[pb], dots = (blk.items || []).map(function (it) { return '<i class="' + (it.now || it.st === 'progress' ? 'on' : it.st === 'done' || it.st === 'reached' ? 'ok' : it.st === 'stopped' ? 'bad' : '') + '"></i>'; }).join('');
    var cur = ctPick(), no = cur ? ctNo(cur) : '';
    s.innerHTML = '<span>' + (no ? '<b>' + esc(no) + '</b> · ' : '') + esc(blk.name) + '</span><span class="r8-dots" aria-hidden="true">' + dots + '</span>';
  }
  function r8Handle() {
    var b = r8Band(); if (!b || b.querySelector('.r8-handle')) return;
    var h = document.createElement('button'); h.type = 'button'; h.className = 'r8-handle'; h.setAttribute('aria-label', 'Show or hide the map');
    h.addEventListener('click', function (e) { e.stopPropagation(); r8Slim(!b.classList.contains('r8-slim')); });
    b.appendChild(h);
  }
  if (r8is('u3s')) setInterval(function () { if (v13on()) { r8Handle(); r8Strip(); } }, 400);
  if (r8is('u3a')) {
    var r8y = 0, r8acc = 0;
    window.addEventListener('scroll', function () {
      if (!v13on() || state.cx) return; var y = window.scrollY, d = y - r8y; r8y = y;
      r8acc = (r8acc > 0) === (d > 0) ? r8acc + d : d;
      if (r8acc > 60) r8Slim(true); else if (r8acc < -40) r8Slim(false); else r8Strip();
    }, { passive: true });
  }
  function r8PlanSVG(blk, b) {
    var W = MAP && MAP.w ? Math.min(MAP.w, vpW()) : vpW(), H = MAP && MAP.h ? MAP.h : 250, ym = MAP && MAP.ym ? MAP.ym : H - 50;
    var its = blk.items || [], n = its.length, pad = 30, y = Math.round(ym - 78);
    var s = '<svg class="v13map r8-plan" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(blk.name) + ', its planned milestones">';
    s += '<rect class="win" x="0" y="0" width="0" height="0" style="opacity:0"/>';
    s += '<text class="cap" x="' + W / 2 + '" text-anchor="middle" y="' + (y - 52) + '">' + esc(phaseNo(b) + ' ' + blk.name) + ': ' + n + ' milestones planned, nothing done yet</text>';
    s += '<line class="main" x1="0" y1="' + ym + '" x2="' + W + '" y2="' + ym + '"/>';
    s += '<path class="ln" d="M' + pad + ' ' + y + ' H' + (W - pad) + '"/>';
    its.forEach(function (it, i) {
      var x = n < 2 ? W / 2 : pad + i * (W - 2 * pad) / (n - 1), up = i % 2 === 1, nm = it.name.length > 10 ? it.name.slice(0, 9) + '…' : it.name;
      s += '<circle class="ms" cx="' + x + '" cy="' + y + '" r="12"/>';
      s += '<text class="n" text-anchor="middle" x="' + x + '" y="' + (y + 4) + '" style="font-size:9.5px">' + esc(msNo(b, i)) + '</text>';
      s += '<text text-anchor="middle" x="' + x + '" y="' + (up ? y - 20 : y + 28) + '">' + esc(nm) + '</text>';
    });
    s += '<path class="ln" d="M' + (W - pad) + ' ' + (y + 12) + ' C' + (W - pad) + ' ' + (ym - 10) + ' ' + (W - pad - 10) + ' ' + ym + ' ' + (W - pad - 30) + ' ' + ym + '"/>';
    return s + '</svg>';
  }
  var r8Ph = null, r8PlanB = null, r8Lock = 0;
  function r8Phase() {
    if (!(r8is('f5p') || r8is('f5s')) || !v13on() || state.cx || Date.now() < r8Lock) return;
    var pb = phInView(); if (pb === null || pb === r8Ph) return; r8Ph = pb;
    var blk = PLANS[state.proj][pb], empty = !(blk.items || []).some(function (it) { return it.sprints; });
    if (r8is('f5s')) { r8Lock = Date.now() + 300; r8Slim(empty); return; }
    r8PlanB = empty ? pb : null; r8PlanDraw();
    if (!empty) { MAP = mapData(); drawMap(); v13sync(false); }
  }
  function r8PlanDraw() {
    var inn = document.getElementById('v13in'), bd = document.getElementById('v13band');
    if (bd) bd.classList.toggle('r8-planned', r8PlanB !== null);
    if (inn && r8PlanB !== null) { inn.innerHTML = r8PlanSVG(PLANS[state.proj][r8PlanB], r8PlanB); inn.style.transform = 'none'; }
  }
  if (r8is('f5p')) { var _syncR8 = v13sync; v13sync = function () { var r = _syncR8.apply(this, arguments); if (r8PlanB !== null) r8PlanDraw(); return r; }; }
  window.addEventListener('scroll', function () { r8Phase(); }, { passive: true });

  /* 7 F6: a second tap on the selected milestone clears it, whatever its fold */
  if (r8is('f6c')) {
    window.addEventListener('click', function (e) {
      if (!v13on()) return; var f = e.target.closest('[data-v13fold^="it:"]'); if (!f) return;
      var sel = f.dataset.v13fold.slice(3), was = state.sl && state.sl[state.proj] === sel && f.getAttribute('aria-expanded') === 'true';
      if (was) setTimeout(function () { state.sl[state.proj] = null; drawMap(); v13sync(false); }, 30);
    }, true);
  }

  /* 9 U5: who is behind each link; numbers in the Context view */
  function r8Who(key) {
    var p = SS_PLACES[key]; if (!p) return null;
    if (p.kind !== 'claude') return p.kind === 'run' ? 'Run' : 'PR';
    var b = SS_PLACES[lkBase(key)] || p, at = (b.at || '').split(' ');
    return (b.who === 'Chief of Staff' ? 'CoS' : b.who || 'Claude') + ' ' + at.slice(0, 2).join(' ');
  }
  function r8Tags() {
    if (!(r8is('u5n') || r8is('u5b'))) return;
    var prev = null, grp = [];
    var flush = function () { if (grp.length > 1) grp.forEach(function (e, i) { e.classList.add('r8-grp'); if (i) e.classList.add('r8-cont'); if (!i) e.classList.add('r8-first'); if (i === grp.length - 1) e.classList.add('r8-last'); var q = grp[0].querySelector('.ss-q'); if (q && !q.querySelector('.r8-n')) q.insertAdjacentHTML('beforeend', '<span class="r8-n">· ' + grp.length + '</span>'); }); grp = []; };
    [].slice.call(document.querySelectorAll('#v13list .v13ev')).forEach(function (ev) {
      var q = ev.querySelector('.ss-q'); if (!q) { flush(); prev = null; return; }
      var key = q.dataset.ssk, w = r8Who(key);
      if (r8is('u5n') && w && !q.dataset.r8) { q.dataset.r8 = 1; q.lastChild.textContent = w; }
      if (r8is('u5b')) { var base = lkBase(key); if (base !== prev || ev.previousElementSibling !== (grp[grp.length - 1] || ev.previousElementSibling)) flush(); grp.push(ev); prev = base; }
    });
    flush();
  }
  if (r8is('u5n')) { var _cxLinkR8 = cxLink; cxLink = function (k) { var h = _cxLinkR8(k), w = r8Who(k); return w && SS_PLACES[k] && SS_PLACES[k].kind === 'claude' ? h.replace('</i>Claude', '</i>' + esc(w)) : h; }; }
  function r8Cx() {
    if (!r8is('u5n')) return;
    var sp = null, n = 0;
    [].slice.call(document.querySelectorAll('#cxview .cx-row')).forEach(function (r) {
      if (r.classList.contains('lv3')) { sp = (r.querySelector('.cx-no') || {}).textContent; n = 0; return; }
      if (r.classList.contains('lv4') && sp) { n++; var pip = r.querySelector('.cx-pip'); if (pip) pip.outerHTML = '<span class="cx-no">' + esc(sp + '.' + n) + '</span>'; }
      var a = r.querySelector('a'); if (a && !a.dataset.r8) { a.dataset.r8 = 1; }
    });
  }

  /* 11 R2: rings whose criteria are not on record */
  function r8Norec() {
    [].slice.call(document.querySelectorAll('#v13list .v13gr')).forEach(function (g) { g.classList.toggle('r8-norec', /not on record/.test(g.textContent)); });
  }

  /* 12 O3: a date on what is older than today, every time in Chicago (UTC-6 in November) */
  var R8_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function r8Ct(d, mo, hh, mm) {
    var t = Date.UTC(2026, R8_MON.indexOf(mo), +d, +hh, +mm) - 6 * 3600e3, x = new Date(t), h = x.getUTCHours(), ap = h < 12 ? 'am' : 'pm', h12 = h % 12 || 12;
    return { day: x.getUTCDate(), mon: R8_MON[x.getUTCMonth()], t: h12 + ':' + String(x.getUTCMinutes()).padStart(2, '0') + ' ' + ap };
  }
  function r8Times() {
    if (!r8is('o3')) return;
    var today = 14;   /* the mockup's "now" is 14 Nov, 17:25 UTC: 11:25 am in Chicago */
    [].slice.call(document.querySelectorAll('#v13list .v13ev[data-ss]')).forEach(function (ev) {
      var tm = ev.querySelector('.tm'); if (!tm || tm.dataset.r8) return;
      var m = /(\d{1,2}) ([A-Z][a-z]{2}) (\d{2}):(\d{2})$/.exec(ev.dataset.ss); if (!m) return;
      var c = r8Ct(m[1], m[2], m[3], m[4]); tm.dataset.r8 = 1;
      tm.innerHTML = (c.day !== today ? '<span class="d">' + c.day + ' ' + c.mon + ', </span>' : '') + c.t;
    });
    [].slice.call(document.querySelectorAll('.asof b')).forEach(function (b) { if (/UTC/.test(b.textContent)) b.textContent = '11:25 am CT'; });
    [].slice.call(document.querySelectorAll('.asof span, .hd-tx .asof')).forEach(function (s) { if (/as of 17:25 UTC/.test(s.textContent) && s.children.length === 0) s.textContent = s.textContent.replace('17:25 UTC', '11:25 am CT'); });
  }

  function r8After() { r8Norec(); r8Tags(); r8Cx(); r8Times(); }
  var r8Obs = new MutationObserver(function () { if (!r8Obs.raf) r8Obs.raf = requestAnimationFrame(function () { r8Obs.raf = 0; r8After(); }); });
  r8Obs.observe(document.getElementById('view') || document.body, { childList: true, subtree: true });

  /* start the phone where its option shows */
  function r8Start() {
    if (R8.home) return;
    openProject('tl'); if (v33Push) v33Push.finish();
    setTimeout(function () {
      if (v33Push) v33Push.finish();
      if (R8.at) r8Centre(r8Find(R8.at), false);
      else if (r8is('f2w') || r8is('f2n')) r8Centre(r8Waiting(), false);
      if (R8.cx && typeof cxShow === 'function') { state.cx = true; cxShow(true, false); }
      r8After(); ctSoon(); r8Phase();
    }, 520);
  }
  setTimeout(r8Start, 60);
