  /* ---- v33 fixes: the first review's findings that make v32 do what the owner already asked for
     (docs/design/audit-2026-11-25-v32-review.md F1, F3, U1, U2, U7, U8, R4, R5, O1, O2) and the second review's L11 and C2 ---- */
  document.documentElement.classList.add('v33');
  var V33X = '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"/></svg>';
  /* C2: the pills' chevron and More from Phosphor (bold for controls) */
  TP_CV = '<svg class="cv" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg>';
  UI.more = '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"><path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm16-84a16,16,0,1,1-16-16A16,16,0,0,1,144,128Zm48,0a16,16,0,1,1-16-16A16,16,0,0,1,192,128Zm-96,0a16,16,0,1,1-16-16A16,16,0,0,1,96,128Z"/></svg>';

  function v33q(v) { return '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }
  /* U1: every bubble carries a close mark */
  var _list13V33 = list13;
  list13 = function () {
    var h = _list13V33.apply(this, arguments), x = '<button type="button" class="v33-x" data-v33x aria-label="Close">' + V33X + '</button>';
    return h.replace(/<div class="w2-bub" role="note">/g, '$&' + x).replace(/<div class="n4-bub">/g, '$&' + x);
  };
  var _ssBubbleV33 = ssBubble;
  ssBubble = function () {   /* F3: the session bubble leads with its link, then says what the session did */
    var h = _ssBubbleV33.apply(this, arguments), m = /<div class="lk-acts">[\s\S]*?<\/a><\/div>|<div class="lk-acts">[\s\S]*<\/a><\/div>/.exec(h);
    if (m) { h = h.replace(m[0], ''); h = h.replace(/^<div class="ss-bub"([^>]*)>/, '<div class="ss-bub"$1>' + m[0].replace('class="lk-acts"', 'class="lk-acts v33-first"')); }
    return h.replace(/^<div class="ss-bub"([^>]*)>/, '$&<button type="button" class="v33-x" data-v33x aria-label="Close">' + V33X + '</button>');
  };

  /* F1: a tap in the list never moves the page. The tapped tag (or row) is put back where it was, for a moment, after
     whatever the handlers before this one redrew. Deliberate jumps (Needed by, a requirement, a chip) are left alone. */
  var v33Pin = null, v33PinT = 0, v33Pre = null;
  function v33Key(t) {
    var tag = t.closest('#v13list .w2-q, #v13list .n4-tag, #v13list .ss-q, #v13list .v33-x');
    var row = t.closest('#v13list [data-ndk]');
    if (tag && row) {
      var bub = tag.closest('.w2-bub, .n4-bub, .ss-bub');
      if (bub) return '#v13list [data-ndk=' + v33q(row.dataset.ndk) + '] .l1';   /* a bubble's own close: keep its row's first line */
      var c = tag.classList.contains('w2-q') ? '.w2-q' : tag.classList.contains('n4-tag') ? '.n4-tag' : '.ss-q';
      return '#v13list [data-ndk=' + v33q(row.dataset.ndk) + '] .l1 ' + c;
    }
    if (row) return '#v13list [data-ndk=' + v33q(row.dataset.ndk) + ']';
    var g = t.closest('#v13list [data-v13fold]'); if (g) return '#v13list [data-v13fold=' + v33q(g.dataset.v13fold) + ']';
    return null;
  }
  function v33Hold() { if (!v33Pin) return; var el = document.querySelector(v33Pin.sel); if (!el) return; var d = el.getBoundingClientRect().top - v33Pin.y; if (Math.abs(d) > .5) finScrollBy(0, d); }
  function v33Bubbles() {
    return [].slice.call(document.querySelectorAll('#v13list .w2-bub, #v13list .n4-bub, #v13list .ss-bub')).map(function (b) {
      var row = b.closest('[data-ndk]'); return { id: (row ? row.dataset.ndk : '') + '|' + b.className.split(' ')[0], el: b, r: b.getBoundingClientRect() };
    });
  }
  function v33Down(t) {
    if (!v13on() || !t.closest) return;
    v33Pre = { bubbles: v33Bubbles(), t: Date.now() };
    if (t.closest('[data-nd-go], [data-v13fold], .v13phases, #v13band')) { v33Pre.sel = null; return; }
    var sel = v33Key(t); if (!sel && document.querySelector('#v13list .w2-bub, #v13list .n4-bub, #v13list .ss-bub') && t.closest('#v13list')) {
      var near = t.closest('#v13list .v13gr, #v13list .v13ev, #v13list li'); if (near && near.dataset.k) sel = '#v13list [data-k=' + v33q(near.dataset.k) + ']';
    }
    var el = sel && document.querySelector(sel); v33Pre.sel = el ? sel : null; v33Pre.y = el ? el.getBoundingClientRect().top : 0;
  }
  document.addEventListener('pointerdown', function (e) { v33Down(e.target); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') v33Down(e.target); }, true);

  /* U1: the close mark, a tap outside and Escape close every bubble */
  function v33CloseAll(except) {
    var changed = false;
    if (state.w2b && except !== 'w2') { state.w2b = null; changed = true; }
    if (state.n4 && except !== 'n4') { state.n4 = null; changed = true; }
    if (changed) { var l = document.getElementById('v13list'); if (l) { l.innerHTML = list13(); if (typeof w2switch === 'function') w2switch(); v13sync(false); } }
    var ob = document.querySelector('.ss-bub'); if (ob && except !== 'ss') { ob.remove(); [].slice.call(document.querySelectorAll('.ss-q.on')).forEach(function (o) { o.classList.remove('on'); o.setAttribute('aria-expanded', 'false'); }); changed = true; }
    return changed;
  }
  /* this runs first of all the page's click handlers (hooked in near the top of the script), so the pin is set before any
     of them redraws or scrolls; the redraw then settles in the next frame, before anything is painted */
  window.__v33click = function (e) {
    if (!v13on()) return;
    if (!v33Pre || Date.now() - v33Pre.t > 1500) v33Down(e.target);
    var x = e.target.closest('[data-v33x]');
    v33Pin0(); var pre = v33Pre;
    if (x) { e.stopImmediatePropagation(); e.preventDefault(); v33CloseAll(); }
    requestAnimationFrame(function () { if (v33Pre === pre) v33After(); });
  };
  window.addEventListener('click', function (e) {   /* a tap outside the Needs bubble closes it too (Why and session already do) */
    if (!v13on() || !document.querySelector('#v13list .n4-bub')) return;
    if (!e.target.closest('.w2-bub, .n4-bub, .ss-bub, .w2-q, .n4-tag, .ss-q, [data-n4], [data-n5go], .sheet, .menu, #n4-sheet, #wy-sheet')) v33CloseAll();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && v13on() && document.querySelector('#v13list .w2-bub, #v13list .n4-bub, #v13list .ss-bub')) { v33Pre = { bubbles: v33Bubbles(), sel: null, t: Date.now() }; v33CloseAll(); var pre = v33Pre; requestAnimationFrame(function () { if (v33Pre === pre) v33After(); }); } });
  function v33Pin0() {
    var pre = v33Pre; if (!pre || !pre.sel) return;
    v33Pin = { sel: pre.sel, y: pre.y }; if (!finPin) finPin = { k: '__v33' };
    clearTimeout(v33PinT); v33PinT = setTimeout(function () { v33Hold(); v33Pin = null; if (finPin && finPin.k === '__v33') finPin = null; }, 420);
  }
  function v33After() {   /* runs in the frame after the tap, before it is painted */
    var pre = v33Pre; v33Pre = null; if (!pre) return;
    if (pre.sel && !v33Pin) { v33Pre = pre; v33Pin0(); v33Pre = null; }
    v33Hold(); v33Bubble(pre); v33Hold(); [16, 60, 150, 300].forEach(function (ms) { setTimeout(v33Hold, ms); });
  }
  /* U2 and F3: a bubble with too little room below opens above its row, if there is room there; M5: bubbles open from
     their tag and close as the reverse of their opening */
  function v33Bubble(pre) {
    var now = v33Bubbles(), was = {}; pre.bubbles.forEach(function (b) { was[b.id] = b; });
    var isNew = {}; now.forEach(function (b) { isNew[b.id] = !was[b.id]; });
    pre.bubbles.forEach(function (b) {
      if (now.some(function (n) { return n.id === b.id; }) || REDUCED || !b.r.height) return;
      var g = b.el.cloneNode(true); g.removeAttribute('role'); g.setAttribute('aria-hidden', 'true'); g.classList.add('v33-ghost');
      g.style.cssText = 'position:fixed;margin:0;z-index:20;pointer-events:none;left:' + b.r.left + 'px;top:' + b.r.top + 'px;width:' + b.r.width + 'px;';
      document.body.appendChild(g);
      var a = g.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 140, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      a.onfinish = a.oncancel = function () { g.remove(); };
    });
    now.forEach(function (b) {
      if (!isNew[b.id]) return;
      var bub = b.el, row = bub.closest('.v13ev'), tag = row && row.querySelector('.l1 ' + (bub.classList.contains('w2-bub') ? '.w2-q' : bub.classList.contains('n4-bub') ? '.n4-tag' : '.ss-q'));
      var r = bub.getBoundingClientRect(), tb = document.querySelector('.tabbar'), limit = (tb ? tb.getBoundingClientRect().top : window.innerHeight - 90) - 8, band = document.getElementById('v13band'), top = band ? band.getBoundingClientRect().bottom : 0;
      if (r.bottom > limit && tag) {
        var tr = tag.getBoundingClientRect(), above = tr.top - top - 16, below = limit - r.top;
        if (above > r.height || above > below) {   /* open it above the row, keeping the tag where it is */
          bub.classList.add('v33-up');
          if (above < r.height) { bub.classList.add('v33-cap'); bub.style.maxHeight = Math.max(120, above) + 'px'; }
          v33Hold();
        } else { bub.classList.add('v33-cap'); bub.style.maxHeight = Math.max(120, below) + 'px'; }
      }
      [].slice.call(bub.getAnimations ? bub.getAnimations() : []).forEach(function (a) { a.cancel(); });
      if (!REDUCED && tag) {
        var r2 = bub.getBoundingClientRect(), t2 = tag.getBoundingClientRect(), up = bub.classList.contains('v33-up');
        var ox = Math.max(0, Math.min(r2.width, t2.left + t2.width / 2 - r2.left));
        bub.animate([{ opacity: 0, transform: 'scale(.96)', transformOrigin: ox + 'px ' + (up ? '100%' : '0') }, { opacity: 1, transform: 'none', transformOrigin: ox + 'px ' + (up ? '100%' : '0') }], { duration: 200, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    });
  }

  /* F1, second half: "Needed by" and the other jumps land the row they name at the fixed centre, its arrow on the map */
  var _ndGoV33 = ndGo;
  ndGo = function (k) {
    var held = finPin; finPin = { k: '__v33ndgo' }; _ndGoV33(k); finPin = held;
    setTimeout(function () { requestAnimationFrame(function () {   /* after the list has settled from the redraw */
      var el = k === 'act' ? document.querySelector('#v13list .v13acts li.blocked') : document.querySelector('#v13list [data-ndk=' + v33q(k) + ']');
      if (!el) return;
      var c = typeof ctCentre === 'function' ? ctCentre().y : window.innerHeight / 2, r = el.getBoundingClientRect();
      v33ScrollTo(window.scrollY + r.top + Math.min(r.height, 40) / 2 - c);
    }); }, 0);
  };

  /* O2: a plan's fold says the number its row shows */
  function v33Aria() {
    [].slice.call(document.querySelectorAll('#v13list [aria-label^="Step "]')).forEach(function (b) {
      var no = b.querySelector('.no4') || b.querySelector('.l1 > b'); if (!no || !/^[\d.]+$/.test(no.textContent.trim())) return;
      var a = b.getAttribute('aria-label'), n = a.replace(/^Step [\d.]+/, 'Step ' + no.textContent.trim()); if (n !== a) b.setAttribute('aria-label', n);
    });
  }
  /* R4: lane names stay inside the map's frame */
  function v33Lanes() {
    var inn = document.getElementById('v13in'), vp = document.querySelector('#v13band .v13vp'); if (!inn || !vp) return;
    var svg = inn.querySelector('svg'); if (!svg) return;
    var W = Math.min(+svg.getAttribute('width') || 1e9, (typeof pan13 === 'number' ? pan13 : 0) + vp.clientWidth) - 6;
    [].slice.call(svg.querySelectorAll('text.lb')).forEach(function (t) {
      var w = t.getComputedTextLength ? t.getComputedTextLength() : 0, x = +t.getAttribute('x');
      if (x + w > W) t.setAttribute('x', Math.max(4, W - w));
    });
  }
  var v33ObsRaf = 0, v33Obs = new MutationObserver(function () { if (!v33ObsRaf) v33ObsRaf = requestAnimationFrame(function () { v33ObsRaf = 0; v33Aria(); }); });
  var _renderProjectV33 = renderProject;
  renderProject = function () {
    var r = _renderProjectV33.apply(this, arguments), L = document.getElementById('v13list');
    if (L) { v33Obs.disconnect(); v33Obs.observe(L, { childList: true, subtree: true }); v33Aria(); }
    v33Lanes(); return r;
  };

  /* L11: the mockup's own notes fold behind one line, so the page's end can be judged */
  (function () {
    var f = document.querySelector('p.foot'); if (!f || f.closest('details')) return;
    var d = document.createElement('details'); d.className = 'v33-about';
    d.innerHTML = '<summary>About this mockup</summary>'; f.parentNode.insertBefore(d, f); d.appendChild(f);
  })();
