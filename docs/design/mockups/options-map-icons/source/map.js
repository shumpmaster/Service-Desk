(function () {
  var DX = 22, PAD = 26, YMAIN = 76, LANE = 28;
  function nest(svgStr, x, y, s) { return svgStr.replace('<svg', '<svg x="' + (x - s / 2) + '" y="' + (y - s / 2) + '" width="' + s + '" height="' + s + '"'); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hm(m) { var d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mi = m % 60; return (d === 0 ? '13 Nov ' : '') + (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi; }
  var KL = { commit: 'Commit', check: 'Check', review: 'Review', merge: 'Merge', decision: 'Decision', stop: 'Stop' };

  /* every event once, with its milestone and sprint */
  var ALL = [];
  DATA.forEach(function (m, mi) { (m.sprints || []).forEach(function (s, si) { s.ev.forEach(function (e, ei) {
    ALL.push({ k: ALL.length, mi: mi, si: si, t: e[0], kind: e[1], st: e[2], who: e[3], title: e[4], sp: s, ms: m, now: e[1] === 'stop' && e[2] === 'Waiting on you' });
  }); }); });

  /* a map of some events: x by time order, a lane per sprint (reused once a sprint has merged) */
  function layout(evs) {
    var order = evs.slice().sort(function (a, b) { return a.t - b.t; }), x = {};
    order.forEach(function (e, i) { x[e.k] = PAD + i * DX; });
    var sps = [], seen = {};
    evs.forEach(function (e) { var key = e.mi + ':' + e.si; if (!seen[key]) { seen[key] = { key: key, sp: e.sp, evs: [] }; sps.push(seen[key]); } seen[key].evs.push(e); });
    sps.forEach(function (s) { s.evs.sort(function (a, b) { return a.t - b.t; }); s.a = s.evs[0].t; s.b = s.evs[s.evs.length - 1].t; });
    sps.sort(function (a, b) { return a.a - b.a; });
    var busy = [];
    sps.forEach(function (s) { var l = 1; while (busy[l] && busy[l] >= s.a) l++; s.lane = l; busy[l] = s.b; });
    var lanes = Math.max.apply(null, sps.map(function (s) { return s.lane; }));
    return { x: x, sps: sps, w: PAD * 2 + (order.length - 1) * DX, h: YMAIN + 26, lanes: lanes };
  }
  function svg(L) {
    var p = '<path class="g main" d="M0 ' + YMAIN + ' H' + L.w + '"/>', dots = '', labs = '';
    L.sps.forEach(function (s) {
      var y = YMAIN - LANE * s.lane, onLane = s.evs.filter(function (e) { return e.kind !== 'merge'; });
      var x0 = L.x[s.evs[0].k], x1 = onLane.length ? L.x[onLane[onLane.length - 1].k] : x0;
      p += '<path class="g" d="M' + (x0 - 16) + ' ' + YMAIN + ' C' + (x0 - 8) + ' ' + YMAIN + ' ' + (x0 - 8) + ' ' + y + ' ' + x0 + ' ' + y + ' H' + x1 + '"/>';
      s.evs.forEach(function (e, i) {
        if (e.kind === 'merge') { var px = i ? L.x[s.evs[i - 1].k] : L.x[e.k] - 16, mx = L.x[e.k];
          p += '<path class="g" d="M' + px + ' ' + y + ' C' + (px + mx) / 2 + ' ' + y + ' ' + (px + mx) / 2 + ' ' + YMAIN + ' ' + mx + ' ' + YMAIN + '"/>'; }
        var cy = e.kind === 'merge' ? YMAIN : y, cx = L.x[e.k], mn = e.kind === 'merge' ? ' main' : '';
        var sc = e.st === 'Failed' ? ' bad' : e.st === 'Waiting on you' ? ' wait' : '';
        dots += '<g class="st' + mn + sc + (e.now ? ' now' : '') + '" data-k="' + e.k + '"><circle class="dot' + mn + (e.now ? ' now' : '') + '" cx="' + cx + '" cy="' + cy + '" r="' + (e.now ? 5 : 4) + '"/>' +
          '<g class="ic"><circle class="disc' + mn + (e.now ? ' now' : '') + '" cx="' + cx + '" cy="' + cy + '" r="10.5"/>' + nest(ICONS[e.kind], cx, cy, 12) + '</g></g>';
      });
      labs += '<text class="lb" x="' + x0 + '" y="' + (y - 9) + '">' + esc(s.sp.no + ' ' + s.sp.name.replace('Spec ', '')) + '</text>';
    });
    return '<svg width="' + L.w + '" height="' + L.h + '" viewBox="0 0 ' + L.w + ' ' + L.h + '"><rect class="win" x="0" y="' + (YMAIN - LANE * L.lanes - 10) + '" width="0" height="' + (LANE * L.lanes + 20) + '" rx="10"/>' + p + dots + labs +
      '<text class="lb main" x="4" y="' + (YMAIN + 20) + '">main</text></svg>';
  }
  function row(e) {
    var m = e.kind === 'merge';
    return '<div class="row" data-k="' + e.k + '"><span class="ico' + (m ? ' main' : '') + '">' + ICONS[e.kind] + '</span><div class="tx"><div class="l1"><b>' + KL[e.kind] + '</b><span class="st">' + esc(e.st) +
      '</span><span class="tm">' + hm(e.t) + '</span></div><div class="l2">' + esc(e.title) + '</div><div class="l3">by ' + esc(e.who) + (m ? ' · main' : '') + '</div></div></div>';
  }
  function list() {
    var h = '<div class="phase"><span class="pno">2</span>Design<span class="pnow">now</span></div>';
    DATA.forEach(function (m, mi) {
      if (m.now) { h += '<div class="nowcard"><span>Now</span>Stop card 5: S-011 failed three plan reviews. What happens next?</div>'; return; }
      h += '<div class="msh" data-mi="' + mi + '"><span class="no">' + m.no + '</span><span class="id">' + m.id + '</span><span class="nm">' + esc(m.name) + '</span></div>';
      if (m.why) h += '<div class="why">' + esc(m.why) + '</div>';
      (m.sprints || []).forEach(function (s, si) {
        h += '<div class="sph"><span class="ico sm">' + ICONS.branch + '</span><span class="no">' + s.no + '</span><b>' + esc(s.name) + '</b><span class="lab">· ' + esc(s.label) + '</span></div>';
        ALL.filter(function (e) { return e.mi === mi && e.si === si; }).slice().reverse().forEach(function (e) { h += row(e); });
      });
    });
    return h + '<div class="endpad"></div>';
  }

  document.querySelectorAll('.phone[data-mode]').forEach(function (ph) {
    var mode = ph.dataset.mode, bottom = mode === 'c', big = ph.dataset.st !== 'dots';
    DX = big ? 30 : 22; LANE = big ? 32 : 28; YMAIN = big ? 86 : 76;
    ph.innerHTML = '<div class="scr">' + (bottom ? '' : '<div class="mapbar top"><div class="mapvp"><div class="mapin"></div></div></div>') + '<div class="list">' + list() + '</div>' +
      (bottom ? '<div class="mapbar bot"><div class="grip"></div><div class="mapvp"><div class="mapin"></div></div></div>' : '') + '</div>';
    var scr = ph.querySelector('.scr'), bar = ph.querySelector('.mapbar'), vp = ph.querySelector('.mapvp'), inn = ph.querySelector('.mapin');
    var L = null, cur = null, pan = 0, dragging = false;
    function draw(evs, push) {
      L = layout(evs); inn.innerHTML = svg(L);
      if (push && !reduce && inn.animate) inn.firstChild.animate([{ opacity: 0, transform: 'translateX(-28px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    if (mode !== 'b') draw(ALL, false);
    function visible() {
      var r = scr.getBoundingClientRect(), top = r.top + (bottom ? 0 : bar.offsetHeight), bot = r.bottom - (bottom ? bar.offsetHeight : 0);
      return [].slice.call(ph.querySelectorAll('.row')).filter(function (el) { var b = el.getBoundingClientRect(); return b.bottom > top + 8 && b.top < bot - 8; }).map(function (el) { return +el.dataset.k; });
    }
    function currentMs(vis) { return vis.length ? ALL[vis[0]].mi : 0; }
    function setPan(v, animate) {
      var max = Math.max(0, L.w - vp.clientWidth); pan = Math.max(0, Math.min(max, v));
      inn.style.transition = animate && !reduce ? 'transform .45s cubic-bezier(.2,.8,.2,1)' : 'none';
      inn.style.transform = 'translateX(' + (-pan) + 'px)';
    }
    function sync() {
      var vis = visible();
      if (mode === 'b') { var mi = currentMs(vis); if (mi !== cur) { cur = mi; draw(ALL.filter(function (e) { return e.mi === mi; }), true); } }
      var on = {}; vis.forEach(function (k) { on[k] = 1; });
      var xs = vis.map(function (k) { return L.x[k]; }).filter(function (x) { return x !== undefined; });
      inn.querySelectorAll('.st').forEach(function (d) { d.classList.toggle('vis', !!on[d.dataset.k]); });
      var win = inn.querySelector('.win');
      if (xs.length) { var a = Math.min.apply(null, xs) - 10, b = Math.max.apply(null, xs) + 10; win.setAttribute('x', a); win.setAttribute('width', b - a);
        if (!dragging) setPan((a + b) / 2 - vp.clientWidth / 2, true); }
    }
    var raf = 0; scr.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; sync(); }); });
    /* C: drag the map sideways and the timeline follows */
    if (bottom) {
      var sx = 0, sp = 0;
      vp.addEventListener('pointerdown', function (e) { dragging = true; sx = e.clientX; sp = pan; vp.setPointerCapture(e.pointerId); });
      vp.addEventListener('pointermove', function (e) {
        if (!dragging) return; setPan(sp - (e.clientX - sx), false);
        var cx = pan + vp.clientWidth / 2, best = null, bd = 1e9;
        Object.keys(L.x).forEach(function (k) { var d = Math.abs(L.x[k] - cx); if (d < bd) { bd = d; best = k; } });
        var el = ph.querySelector('.row[data-k="' + best + '"]'); if (el) scr.scrollTop = el.offsetTop - scr.clientHeight / 2 + el.offsetHeight / 2;
      });
      ['pointerup', 'pointercancel'].forEach(function (n) { vp.addEventListener(n, function () { dragging = false; }); });
    }
    /* start on Now: S-011's newest event under the map */
    var start = ph.querySelector('.nowcard'); scr.scrollTop = start.offsetTop - (bottom ? 8 : bar.offsetHeight + 8);
    sync();
  });
})();
