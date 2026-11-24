  /* The owner's round 7, answer 4. A layer over v26 with options-sessions' sess.js (SS = 'A') inside its script.
     1, links: "provide links back to the Claude conversation when available, then when not to the GitHub agent run result or whatever
        is available there". Each event keeps one tag. A pipeline step, which runs headless on GitHub, links to the Chief of Staff
        session that was working on P-005 when it ran (matched by time from sessions/chief-of-staff/); a pull request links to the
        session that prepared it. The run or the pull request stays one tap further, in the bubble. Only where no session was running
        does the tag fall back to the run, and then to the pull request.
     2, Context view: "a page toggle ... a hold press or click on the little circle icon on the bottom of the page that filters the view
        to a scaled down timeline with simple motion that shows our same current phase/milestone/ task etc but simple the number and
        title plus the link". Hold the round button to turn it on or off; a tap still jumps to Now. CX = 'A' | 'B':
        A: the current phase open to its events, the other phases one line each.
        B: everything open, every phase. */
  SS_PLACES.c0 = { kind: 'claude', id: 'session_01QBwHGNJuJKMoanUDTkkWdq', who: 'Chief of Staff', at: '13 Nov 17:40', end: '13 Nov 23:13',
    doing: 'Carrying out step 1 of the owner’s ruling on the doubled spec id (P-005-spec-id-fix): the one-line S-010 correction, and the previous session’s owed end line' };
  /* which Claude session was at work on P-005 when each pipeline step ran (by the session lines' start and end) */
  var LK_WATCH = {
    'Spec S-010|13 Nov 21:32': 'c0', 'Spec S-010|13 Nov 21:44': 'c0', 'E1 and E2|13 Nov 21:32': 'c0',
    'Spec S-010|13 Nov 23:45': 'c1', 'Spec S-010|13 Nov 23:51': 'c1', 'Spec S-010|14 Nov 01:05': 'c1',
    'Spec S-011|14 Nov 12:07': 'c1', 'Spec S-011|14 Nov 12:16': 'c1', 'Spec S-011|14 Nov 12:29': 'c1', 'Spec S-011|14 Nov 12:37': 'c1',
    'Spec S-011|14 Nov 15:14': 'c2', 'Spec S-011|14 Nov 15:23': 'c2', 'Spec S-011|14 Nov 15:36': 'c2', 'Spec S-011|14 Nov 15:42': 'c2'
  };
  Object.keys(SS_EV).forEach(function (k) {
    var cur = SS_EV[k], p = SS_PLACES[cur]; if (!p || p.kind === 'claude') return;
    var c = p.kind === 'run' ? LK_WATCH[k] : p.by; if (!c) return;
    var nk = 'w:' + k; SS_PLACES[nk] = { kind: 'claude', id: SS_PLACES[c].id, who: SS_PLACES[c].who, at: SS_PLACES[c].at, end: SS_PLACES[c].end, doing: SS_PLACES[c].doing, base: c, alt: cur, how: p.kind === 'run' ? 'watched' : 'made' };
    SS_EV[k] = nk;
  });
  var LK_GATE = { 'Design gate': ssPR(428, 'Your answer on the Design gate: proceed', null) };
  function lkBase(k) { var p = SS_PLACES[k]; return p && p.base ? p.base : k; }
  ssWhere = function (key) {
    var out = [], seen = {}, plan = PLANS[state.proj] || [];
    plan.forEach(function (ph, b) { (ph.items || []).forEach(function (it, i) { (it.sprints || []).forEach(function (sp, g) { sp.events.forEach(function (x, e) {
      if (lkBase(SS_EV[sp.name + '|' + x.t]) !== key) return;
      var w = (typeof duRe === 'function' ? duRe(msNo(b, i) + '.' + (g + 1)) : msNo(b, i) + '.' + (g + 1)) + ' ' + sp.name;
      if (!seen[w]) { seen[w] = { w: w, n: 0, go: b + ':' + i + ':' + g + ':' + e }; out.push(seen[w]); }
      seen[w].n++;
    }); }); }); });
    return out;
  };
  var _ssBubbleLk = ssBubble;
  ssBubble = function (key) {
    var p = SS_PLACES[key]; if (!p.alt) return _ssBubbleLk(key);
    var a = SS_PLACES[p.alt], wh = ssWhere(p.base);
    var how = p.how === 'watched' ? 'This step ran on its own on GitHub. The Claude session at work on this project then:' : 'Prepared in this Claude session, then merged by you:';
    return '<div class="ss-bub" role="note"><div class="ss-k"><i class="ss-dot"></i>A Claude session · ' + esc(p.who) + '</div><div class="ss-w">' + how + '</div><div class="ss-d">' + esc(p.doing) + '</div>' +
      '<div class="ss-w">Started ' + esc(p.at) + ' · ' + esc(p.end) + (p.how === 'watched' ? ' · matched by time' : '') + '</div>' +
      (wh.length ? '<div class="ss-also">On this page: ' + wh.map(function (x) { return esc(x.w) + ' (' + x.n + ')'; }).join(', ') + '</div>' : '') +
      '<div class="lk-acts"><a class="ss-open" href="' + ssURL(p) + '" target="_blank" rel="noopener">Open in Claude' + SS_ARROW + '</a>' +
      '<a class="lk-alt" href="' + ssURL(a) + '" target="_blank" rel="noopener">' + (a.kind === 'run' ? 'The run on GitHub' : 'PR #' + a.id + ' on GitHub') + SS_ARROW + '</a></div></div>';
  };

  /* ================= Context view ================= */
  state.cx = false;
  function cxLink(k) {
    var p = SS_PLACES[k]; if (!p) return '';
    var w = p.kind === 'claude' ? 'Claude' : p.kind === 'run' ? 'Run' : 'PR #' + p.id;
    return '<a class="cx-l cx-' + p.kind + '" href="' + ssURL(p) + '" target="_blank" rel="noopener" aria-label="' + esc(ssOpenWord(p)) + '">' + (p.kind === 'claude' ? '<i class="ss-dot"></i>' : '') + w + SS_ARROW + '</a>';
  }
  /* a sprint or milestone links to the Claude session most of its events link to */
  function cxMost(evKeys) {
    var n = {}, best = null; evKeys.forEach(function (k) { var b = lkBase(k); if (!b || SS_PLACES[b].kind !== 'claude') return; n[b] = (n[b] || 0) + 1; if (!best || n[b] > n[best]) best = b; });
    return best;
  }
  function cxNo(b, i, g) { var s = msNo(b, i) + (g === undefined ? '' : '.' + (g + 1)); return typeof duRe === 'function' ? duRe(s) : s; }
  function cxItems(blk, b) {
    var idx = blk.items.map(function (it, i) { return i; }).filter(function (i) { return !unused(blk.items[i], blk); });
    var at = function (it) { if (it.now) return typeof DU_NOW === 'number' ? DU_NOW : 0; var d = typeof DUE === 'object' && DUE[it.id]; return d ? d.s : null; };
    if (blk.items.some(function (it) { return at(it) !== null && !it.now; })) idx.sort(function (x, y) { var ax = at(blk.items[x]), ay = at(blk.items[y]); return (ax === null ? 1e9 : ax) - (ay === null ? 1e9 : ay) || x - y; });
    return idx;
  }
  function cxHTML() {
    var plan = PLANS[state.proj], cb = curB(), h = '', k = 0, row = function (lv, cls, no, t, link, extra) {
      return '<li class="cx-row lv' + lv + (cls ? ' ' + cls : '') + '" style="--i:' + (k++) + '">' + (no ? '<span class="cx-no">' + esc(no) + '</span>' : '<span class="cx-pip"></span>') +
        '<span class="cx-t">' + t + '</span>' + (extra || '') + (link || '') + '</li>';
    };
    plan.forEach(function (blk, b) {
      if (blk.type === 'gate') { h += row(1, 'cx-gate st-' + blk.st, '', esc(blk.name) + ' <span class="cx-s">' + esc(blk.note || '') + '</span>', cxLink(LK_GATE[blk.name])); return; }
      var open = CX === 'B' || b === cb;
      h += row(1, 'cx-ph' + (b === cb ? ' cur' : ''), String(phaseNo(b)), '<b>' + esc(blk.name) + '</b>' + (b === cb ? ' <span class="cx-now">now</span>' : ''), '');
      if (!open) return;
      cxItems(blk, b).forEach(function (i) {
        var it = blk.items[i];
        if (it.now) { h += row(2, 'cx-nowrow', '', 'Now · ' + esc(it.name), cxLink(lkBase(SS_EV['Spec S-011|14 Nov 15:42']) && state.proj === 'tl' ? SS_EV['Spec S-011|14 Nov 15:42'] : null)); return; }
        var evk = []; (it.sprints || []).forEach(function (sp) { sp.events.forEach(function (x) { evk.push(SS_EV[sp.name + '|' + x.t]); }); });
        h += row(2, 'cx-ms st-' + it.st, cxNo(b, i), esc((it.own ? it.id + ' ' : '') + it.name), cxLink(cxMost(evk)));
        (it.sprints || []).forEach(function (sp, g) {
          var sk = sp.events.map(function (x) { return SS_EV[sp.name + '|' + x.t]; });
          h += row(3, 'cx-sp', cxNo(b, i, g), esc(sp.name), cxLink(cxMost(sk)));
          sp.events.forEach(function (x) { h += row(4, 'cx-ev s-' + (x.s || ''), '', esc(x.title), cxLink(SS_EV[sp.name + '|' + x.t]), x.t === 'planned' ? '<span class="cx-s">planned</span>' : ''); });
        });
      });
    });
    return '<div id="cxview" class="cxview"><div class="cx-hd"><b>Context view</b><span>Hold the round button to leave</span></div><ol class="cx-list">' + h + '</ol></div>';
  }
  function cxShow(on, animate) {
    state.cx = on;
    var L = document.getElementById('v13list'), old = document.getElementById('cxview'), r = document.getElementById('roundbtn');
    document.body.classList.toggle('cx-on', on);
    if (r) { r.classList.toggle('cx-btn', on); r.setAttribute('aria-pressed', String(on)); }
    if (old) old.remove();
    if (!L) return;
    if (on) {
      L.insertAdjacentHTML('beforebegin', cxHTML());
      var v = document.getElementById('cxview'), nowR = v.querySelector('.cx-nowrow');
      if (animate && !REDUCED) { v.classList.add('cx-in'); setTimeout(function () { v.classList.remove('cx-in'); }, 900); }
      var band = document.getElementById('v13band'), top = band ? band.getBoundingClientRect().height : 0;
      window.scrollTo(0, Math.max(0, v.getBoundingClientRect().top + window.scrollY - top - 8));
      if (nowR) { var y = nowR.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.45; if (y > window.scrollY) window.scrollTo({ top: y, behavior: animate && !REDUCED ? 'smooth' : 'auto' }); }
    }
  }
  function cxToast(t) {
    var o = document.querySelector('.cx-toast'); if (o) o.remove();
    var d = document.createElement('div'); d.className = 'cx-toast'; d.setAttribute('role', 'status'); d.textContent = t; document.body.appendChild(d);
    setTimeout(function () { d.classList.add('out'); }, 1400); setTimeout(function () { d.remove(); }, 1800);
  }
  /* hold to toggle; a tap still jumps to Now (and, in Context view, to the Now row) */
  var cxTimer = null, cxHeld = false;
  document.addEventListener('pointerdown', function (e) {
    var r = e.target.closest('#roundbtn'); if (!r || r.disabled) return;
    cxHeld = false; r.classList.add('cx-press');
    cxTimer = setTimeout(function () { cxHeld = true; r.classList.remove('cx-press'); if (navigator.vibrate) try { navigator.vibrate(10); } catch (x) {}
      cxShow(!state.cx, true); cxToast(state.cx ? 'Context view' : 'Full view'); }, 450);
  }, true);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { document.addEventListener(n, function () { clearTimeout(cxTimer); var r = document.getElementById('roundbtn'); if (r) r.classList.remove('cx-press'); }, true); });
  document.addEventListener('contextmenu', function (e) { if (e.target.closest('#roundbtn')) e.preventDefault(); }, true);
  window.addEventListener('click', function (e) {
    var r = e.target.closest('#roundbtn'); if (!r) return;
    if (cxHeld) { cxHeld = false; e.stopImmediatePropagation(); e.preventDefault(); return; }
    if (state.cx) { e.stopImmediatePropagation(); var n = document.querySelector('#cxview .cx-nowrow'); if (n) n.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' }); }
  }, true);
  /* keyboards have no hold: Shift with Enter or Space on the button does the same */
  document.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.shiftKey && e.target.id === 'roundbtn') { e.preventDefault(); cxShow(!state.cx, true); } }, true);
  var _renderProjectCx = renderProject;
  renderProject = function () { var r = _renderProjectCx.apply(this, arguments); var b = document.getElementById('roundbtn'); if (b) b.setAttribute('aria-label', 'Jump to Now. Hold for Context view'); if (state.cx) cxShow(true, false); return r; };
