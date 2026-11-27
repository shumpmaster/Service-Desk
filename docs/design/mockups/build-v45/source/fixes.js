  /* ================= v45: v44's leftovers =================
     - home's two buttons on one line at 393 ("Show on timeline", a little tighter);
     - main's words on the map plain first, the pull request's number under it in grey;
     - the count of hidden rows said once, on the nearest heading that holds them (patched into v41's filter by v45.py);
     - the phase pill shows its number alone below 370 wide, so the project pill keeps its name;
     - the gate captions on the map kept 8 points clear of every station (moved along their line to where there is room, or shortened);
     - the handover tag measured again, and given its own colour in dark. */
  var ML45 = { '#443': 'Notes', '#444': 'Answer', '#445': 'Mockup', '#446': 'Questions' };
  var _shortTitle45 = shortTitle;
  shortTitle = function (x) { var m = x.k === 'merge' && /#(\d+)/.exec(x.title); if (m && ML45['#' + m[1]]) return ML45['#' + m[1]] + '\u00a0\u00a0'; return _shortTitle45(x); };   /* two spaces: v25's spread then keeps 9 points between words */
  var _fitSVG45 = fitSVG;
  fitSVG = function (L) {
    var svg = _fitSVG45(L), code = {};
    L.all.forEach(function (ev) { if (ev.x.k !== 'merge') return; var m = /#\d+/.exec(ev.x.title); if (m && ML45[m[0]]) code[ML45[m[0]]] = m[0]; });
    /* keep main's words left of the right-hand gate's line: shift them, right to left, as v25's spread does */
    var re = /<text class="fl ml" x="([\d.]+)" y="([\d.]+)">([^<]*)<\/text>/g, mm, lbs = [];
    while ((mm = re.exec(svg))) { var nm0 = mm[3].replace(/\u00a0+$/, ''); lbs.push({ x: +mm[1], w: Math.max(nm0.length, (code[nm0] || '').length) * 6.3 + 16 }); }
    for (var j = lbs.length - 1, hi = L.w - 34; j >= 0; j--) { if (lbs[j].x + lbs[j].w / 2 > hi) lbs[j].nx = hi - lbs[j].w / 2; hi = (lbs[j].nx != null ? lbs[j].nx : lbs[j].x) - lbs[j].w / 2; }
    var li = 0;
    svg = svg.replace(re, function (all, x, y, t) { var q = lbs[li++]; if (!q || q.nx == null) return all; var nx = q.nx.toFixed(1);
      return all.replace('x="' + x + '"', 'x="' + nx + '"'); });
    svg = svg.replace(/<path class="ml-lead" d="M([\d.]+) ([\d.]+) C([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"\/>(<text class="fl ml" x="([\d.]+)")/g,
      function (all, a, b, c, d, e, f, g, h, tail, nx) { return '<path class="ml-lead" d="M' + a + ' ' + b + ' C' + c + ' ' + d + ' ' + nx + ' ' + f + ' ' + nx + ' ' + h + '"/>' + tail; });
    return svg.replace(/<text class="fl ml" x="([\d.]+)" y="([\d.]+)">([^<]*)<\/text>/g, function (all, x, y, t) {
      var nm = t.replace(/\u00a0+$/, ''), c = code[nm]; if (!c) return all;
      return '<text class="fl ml ml45" x="' + x + '" y="' + y + '"><tspan x="' + x + '">' + nm + '</tspan><tspan class="ml45n" x="' + x + '" dy="11">' + c + '</tspan></text>';
    });
  };
  var _mapData45 = mapData;
  mapData = function () { var L = _mapData45.apply(this, arguments); if (L && L.fit) L.h += 11; return L; };
  function gc45() {   /* each gate caption: 8 points clear of every station along its line (writes only what changes, so it never feeds itself) */
    [].slice.call(document.querySelectorAll('.kn-mgate')).forEach(function (g) {
      var sp = g.querySelector('span'); if (!sp) return;
      var gb = g.getBoundingClientRect(); if (!gb.height) return;
      if (!sp.dataset.full) { sp.dataset.full = sp.textContent; sp.dataset.fh = sp.getBoundingClientRect().height; }
      var full = sp.dataset.full, short = full.replace(/\s*·.*$/, '');
      if (!sp.dataset.sh) sp.dataset.sh = Math.round(+sp.dataset.fh * short.length / Math.max(1, full.length)) + 8;
      var sb = sp.getBoundingClientRect(), xl = sb.left - 8, xr = sb.right + 8;
      var busy = [].slice.call(document.querySelectorAll('#v13in svg circle, #v13in svg text')).map(function (c) { return c.getBoundingClientRect(); })
        .filter(function (b) { return b.width && b.right > xl && b.left < xr; }).map(function (b) { return [b.top - 8 - gb.top, b.bottom + 8 - gb.top]; })
        .sort(function (a, b) { return a[0] - b[0]; });
      var lo = 2, hi = gb.height - 24, free = [], y = lo;   /* keep clear of the flag at the line's foot */
      busy.forEach(function (b) { if (b[0] > y) free.push([y, Math.min(b[0], hi)]); y = Math.max(y, b[1]); }); if (y < hi) free.push([y, hi]);
      free = free.filter(function (f) { return f[1] > f[0]; });
      var pick = function (h) { return free.filter(function (f) { return f[1] - f[0] >= h; })[0]; };
      var fit = pick(+sp.dataset.fh), txt = full, vis = '';
      if (!fit) { fit = pick(+sp.dataset.sh); txt = short; }
      if (!fit) { vis = 'hidden'; fit = [2]; }
      if (sp.textContent !== txt) sp.textContent = txt;
      var top = Math.round(fit[0]) + 'px'; if (sp.style.top !== top) sp.style.top = top;
      if (sp.style.visibility !== vis) sp.style.visibility = vis;
      if (txt !== full || vis) { if (g.title !== full) g.title = full; } else if (g.title) g.removeAttribute('title');
    });
  }
  var gcObs = new MutationObserver(function () { if (!gcObs.raf) gcObs.raf = requestAnimationFrame(function () { gcObs.raf = 0; try { gc45(); } catch (e) { console.error(e); } }); });
  gcObs.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', function () { requestAnimationFrame(gc45); });
  function btn45() { [].slice.call(document.querySelectorAll('.pr-goto')).forEach(function (b) { if (b.textContent === 'Show on the timeline') { b.textContent = 'Show on timeline'; b.setAttribute('aria-label', 'Show it on the timeline'); } }); }
  var btObs = new MutationObserver(function () { if (!btObs.raf) btObs.raf = requestAnimationFrame(function () { btObs.raf = 0; btn45(); }); });
  btObs.observe(document.body, { childList: true, subtree: true });
  setTimeout(function () { gc45(); btn45(); }, 80);
