  /* ================= round 8, answer 16: a quick filter for the branch map, and home (options over v38; decisions/questions/P-005-design-round-8.md)
     The phone's hash, tokens joined by dots: f=A|B|C (the filter), pick=you|turn|review|research|main, open (the filter's panel open), solo=<lane number with dashes, 2-2-2>;
     t=A|B|C (home's title), s=A|B (home's search), sopen (search A open), pulled (search B pulled down), m=B|C (more on home); home (stay on home);
     y=<px> (scroll by); light or dark (the phone's theme, set by the theme script). ================= */
  var FH = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.'), o = { tok: {}, flags: {} };
    h.forEach(function (t) { var i = t.indexOf('='); if (i > 0) o.tok[t.slice(0, i)] = t.slice(i + 1); else if (t) o.flags[t] = 1; });
    var de = document.documentElement;
    ['f', 't', 's', 'm'].forEach(function (k) { if (o.tok[k]) de.classList.add('fh-' + k + o.tok[k]); });
    o.pick = o.tok.pick || 'all'; o.solo = (o.tok.solo || '').replace(/-/g, '.');
    return o;
  })();
  var FH_IC = {
    funnel: '<svg class="fh-ic" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M204,136a12,12,0,0,1-12,12H64a12,12,0,0,1,0-24H192A12,12,0,0,1,204,136Zm28-60H24a12,12,0,0,0,0,24H232a12,12,0,0,0,0-24Zm-80,96H104a12,12,0,0,0,0,24h48a12,12,0,0,0,0-24Z"/></svg>',
    x: '<svg class="x" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"/></svg>',
    search: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z"/></svg>'
  };
  var FH_PICKS = [
    { id: 'all', name: 'Everything' },
    { id: 'you', name: 'Yours' },
    { id: 'turn', name: 'Turning points' },
    { id: 'review', name: 'Reviews and checks' },
    { id: 'research', name: 'Research' },
    { id: 'main', name: 'Main only' }
  ];
  var FH_SEG = ['all', 'you', 'turn', 'main'], FH_SEGNAME = { all: 'All', you: 'Yours', turn: 'Turning points', main: 'Main' };
  function fhInfo() {
    var info = {};
    document.querySelectorAll('#v13in svg g.st[data-k]').forEach(function (g) {
      var t = (g.querySelector('title') || {}).textContent || '', kind = t.split(':')[0].trim();
      info[g.dataset.k] = { kind: kind, main: g.classList.contains('main'), you: g.classList.contains('wait') || g.classList.contains('now'), g: g };
    });
    document.querySelectorAll('#v13list [data-k]').forEach(function (e) { var i = info[e.dataset.k]; if (i && (e.querySelector('.kn-you') || e.hasAttribute('data-kn-wait'))) i.you = true; });
    return info;
  }
  function fhMatch(p, i) {
    if (!i) return p === 'all';
    if (p === 'you') return !!i.you;
    if (p === 'turn') return /^(Stop|Decision|Merge|Gate)$/.test(i.kind) || i.you;
    if (p === 'review') return /^(Review|Check)$/.test(i.kind);
    if (p === 'research') return i.kind === 'Research';
    if (p === 'main') return i.main;
    return true;
  }
  /* which stations belong to the lane whose name was tapped (1C): the lane's name sits just above its line, and the line runs to the name's data-x1 */
  function fhLane(num) {
    var svg = document.querySelector('#v13in svg'); if (!svg) return null;
    var lb = [].filter.call(svg.querySelectorAll('text.lb'), function (t) { return t.textContent.indexOf(num) === 0; })[0]; if (!lb) return null;
    var lr = lb.getBoundingClientRect(), m = svg.getScreenCTM(), x1 = m ? m.a * (+lb.getAttribute('data-x1') || 0) + m.e : lr.right + 400;
    var set = {};
    svg.querySelectorAll('g.st[data-k]').forEach(function (g) { if (g.classList.contains('main')) return;
      var r = (function () { var cs = g.querySelectorAll('circle'); for (var i = 0; i < cs.length; i++) { var q = cs[i].getBoundingClientRect(); if (q.width > 0) return q; } return g.getBoundingClientRect(); })(), cy = r.top + r.height / 2, cx = r.left + r.width / 2;
      if (cy > lr.bottom - 2 && cy - lr.bottom < 26 && cx >= lr.left - 14 && cx <= x1 + 14) set[g.dataset.k] = 1; });
    /* a station drawn as nothing at the moment (a routine commit folded away) still belongs to its sprint: the list's number says so */
    document.querySelectorAll('#v13list .v13ev[data-k]').forEach(function (e) { var m = (e.textContent.match(/^\s*(\d+(?:\.\d+)+)/) || [])[1]; if (m && m.indexOf(num + '.') === 0) set[e.dataset.k] = 1; });
    return { lb: lb, set: set, name: lb.textContent };
  }
  function fhApply() {
    var info = fhInfo(), p = FH.pick, lane = FH.solo ? fhLane(FH.solo) : null, on = p !== 'all' || !!lane;
    Object.keys(info).forEach(function (k) { var keep = lane ? !!lane.set[k] : fhMatch(p, info[k]); info[k].g.classList.toggle('fh-out', on && !keep); });
    document.querySelectorAll('#v13in svg text.lb').forEach(function (t) { t.classList.toggle('fh-solo', !!lane && t === lane.lb); });
    document.querySelectorAll('#v13list .v13ev, #v13list .v13step, #v13list .ph-gate').forEach(function (e) {
      var k = e.dataset.k, keep;
      if (!on) keep = true;
      else if (e.classList.contains('ph-gate')) keep = !lane && (p === 'you' || p === 'turn');
      else if (k) keep = lane ? !!lane.set[k] : fhMatch(p, info[k]);
      else keep = false;
      e.classList.toggle('fh-out', !keep);
    });
    fhUI(info, lane);
  }
  function fhCount(info, p) { var n = 0; Object.keys(info).forEach(function (k) { if (fhMatch(p, info[k])) n++; }); return n; }
  function fhUI(info, lane) {
    var de = document.documentElement, vp = document.querySelector('#v13band .v13vp'); if (!vp) return;
    if (de.classList.contains('fh-fA')) {
      var b = vp.querySelector('.fh-fbtn');
      if (!b) { b = document.createElement('button'); b.type = 'button'; b.className = 'fh-fbtn'; vp.appendChild(b); }
      var nm = (FH_PICKS.filter(function (x) { return x.id === FH.pick; })[0] || {}).name;
      var html = FH.pick === 'all' ? FH_IC.funnel : FH_IC.funnel + '<span>' + nm + '</span>' + FH_IC.x;
      if (b.__h !== html) { b.innerHTML = html; b.__h = html; }
      b.classList.toggle('on', FH.pick !== 'all');
      b.setAttribute('aria-label', FH.pick === 'all' ? 'Filter the map and the list' : 'Showing ' + nm + '; tap the cross to show everything');
      var pn = document.querySelector('.fh-panel'); if (pn) fhPanelFill(pn, info);
    }
    if (de.classList.contains('fh-fB')) {
      var band = document.getElementById('v13band'), sg = band && band.querySelector('.fh-seg');
      if (band && !sg) { sg = document.createElement('div'); sg.className = 'fh-seg'; sg.setAttribute('role', 'group'); sg.setAttribute('aria-label', 'Show on the map and in the list');
        sg.innerHTML = FH_SEG.map(function (id) { return '<button type="button" data-fhpick="' + id + '">' + FH_SEGNAME[id] + '</button>'; }).join('');
        vp.parentNode.insertBefore(sg, vp.nextSibling); }
      if (sg) sg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.fhpick === FH.pick)); });
    }
    if (de.classList.contains('fh-fC')) {
      var c = vp.querySelector('.fh-solochip');
      if (lane) { if (!c) { c = document.createElement('button'); c.type = 'button'; c.className = 'fh-solochip'; vp.appendChild(c); }
        var t = 'Only ' + lane.name.replace(/^[\d.]+\s*/, '') + FH_IC.x; if (c.__h !== t) { c.innerHTML = t; c.__h = t; } c.setAttribute('aria-label', 'Showing ' + lane.name + ' alone; tap to show every lane'); }
      else if (c) c.remove();
      var lg = document.querySelector('#v13band .kn-mgate.l > span'); if (lg) lg.style.transform = lane ? 'translateY(34px)' : '';
    }
  }
  function fhPanelFill(pn, info) {
    pn.innerHTML = '<h4>Show on the map and in the list</h4><div class="fh-chips">' + FH_PICKS.map(function (x) {
      return '<button type="button" class="fh-chip" data-fhpick="' + x.id + '" aria-pressed="' + (x.id === FH.pick) + '">' + x.name + (x.id === 'all' ? '' : ' <span class="n">' + fhCount(info, x.id) + '</span>') + '</button>'; }).join('') +
      '</div><p>What is left out goes faint on the map and quiet in the list; the pointer and the arrow carry on.</p>';
  }
  function fhPanel(open) {
    var pn = document.querySelector('.fh-panel');
    if (!open) { if (pn) pn.remove(); return; }
    var b = document.querySelector('#v13band .fh-fbtn'); if (!b) return;
    if (!pn) { pn = document.createElement('div'); pn.className = 'fh-panel'; pn.setAttribute('role', 'dialog'); pn.setAttribute('aria-label', 'Filter the map'); document.body.appendChild(pn); }
    fhPanelFill(pn, fhInfo());
    var r = b.getBoundingClientRect(); pn.style.top = Math.round(r.bottom + 8) + 'px'; pn.style.left = Math.round(Math.max(10, Math.min(window.innerWidth - 272, r.right - 262))) + 'px';
  }
  function fhPick(p) { FH.pick = p; FH.solo = ''; fhApply(); }
  /* taps on the options' own controls are taken first, before the page's own handlers */
  window.addEventListener('click', function (e) {
    var t = e.target;
    var stop = function () { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); };
    var fb = t.closest && t.closest('.fh-fbtn');
    if (fb) { stop(); if (t.closest('.x')) { fhPanel(false); fhPick('all'); } else fhPanel(!document.querySelector('.fh-panel')); return; }
    var ch = t.closest && t.closest('[data-fhpick]');
    if (ch) { stop(); fhPick(ch.dataset.fhpick); if (ch.closest('.fh-panel')) setTimeout(function () { fhPanel(false); }, REDUCED ? 0 : 180); return; }
    if (t.closest && t.closest('.fh-panel')) { stop(); return; }
    if (document.querySelector('.fh-panel')) { stop(); fhPanel(false); return; }
    var sc = t.closest && t.closest('.fh-solochip');
    if (sc) { stop(); FH.solo = ''; fhApply(); return; }
    if (document.documentElement.classList.contains('fh-fC')) { var lb = t.closest && t.closest('#v13in svg text.lb');
      if (lb) { stop(); var num = (lb.textContent.match(/^[\d.]+/) || [lb.textContent])[0]; FH.solo = FH.solo === num ? '' : num; FH.pick = 'all'; fhApply(); return; } }
    var sb = t.closest && t.closest('.fh-sbtn');
    if (sb) { stop(); fhSearch(true); return; }
    var sx = t.closest && t.closest('.fh-sfield button');
    if (sx) { stop(); fhSearch(false); return; }
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fhPanel(false); fhSearch(false); } });

  /* ---------------- home ---------------- */
  function fhHome() {
    var de = document.documentElement, v = document.getElementById('view'); if (!v || !v.classList.contains('hm-on') || v13on()) return;
    var band = v.querySelector('.hm-band'), sum = v.querySelector('.sg-sum'), srch = v.querySelector(':scope > .search');
    if (de.classList.contains('fh-tA') && band && !v.querySelector('.fh-lt')) {
      var lt = document.createElement('div'); lt.className = 'fh-lt';
      var asof = band.querySelector('.asof'); lt.innerHTML = '<h1>Timeline</h1><div class="asof"><i></i>' + (asof ? asof.innerText.replace(/^\s*Live\s*·?\s*/, 'Live · ') : 'Live') + '</div>';
      band.parentNode.insertBefore(lt, band.nextSibling);
    }
    if (de.classList.contains('fh-tB') && band && sum && !v.querySelector('.fh-hero')) {
      var b = sum.querySelector('b'), lead = b ? b.textContent : '', rest = sum.textContent.replace(lead, '').replace(/^[\s,]+/, '');
      var hero = document.createElement('div'); hero.className = 'fh-hero'; var asof2 = band.querySelector('.asof');
      hero.innerHTML = '<div class="cap"><i></i>Timeline · ' + (asof2 ? asof2.innerText.replace(/^\s*Live\s*·?\s*/, 'live, ') : 'live') + '</div><h1>' + lead + '</h1><p>' + rest.charAt(0).toUpperCase() + rest.slice(1) + '</p>';
      band.parentNode.insertBefore(hero, band.nextSibling);
    }
    if (de.classList.contains('fh-sA') && band) { var cap = band.querySelector('.capsule');
      if (cap && !cap.querySelector('.fh-sbtn')) { var sb = document.createElement('button'); sb.type = 'button'; sb.className = 'cbtn fh-sbtn'; sb.setAttribute('aria-label', 'Search projects and what needs you'); sb.innerHTML = FH_IC.search; cap.insertBefore(sb, cap.firstChild); } }
    if (de.classList.contains('fh-mB')) {
      v.querySelectorAll('.sg-grp').forEach(function (g) { if (g.querySelector('.fh-pline')) return; var row = g.querySelector('.sg-row'), id = row && row.getAttribute('data-sgp'); if (!id) return;
        var st = g.querySelector('.sg-strip'), ln = document.createElement('div'); ln.className = 'fh-pline';
        ln.innerHTML = id === 'tl' ? '<span class="d"></span><span><b>Chief of Staff</b> at work since 7:52 am</span><span class="new"><i></i>9 new</span>'
          : '<span class="d idle"></span><span>Nothing at work · it waits on you</span><span class="new">nothing new</span>';
        (st || row).parentNode.insertBefore(ln, (st || row).nextSibling); });
    }
    if (de.classList.contains('fh-mC') && !v.querySelector('.fh-week')) { var g1 = v.querySelector('.sg-grp'); if (g1) { var wk = document.createElement('section'); wk.className = 'fh-week';
      wk.innerHTML = '<h3>This week <span>Mon 23 Nov to today</span></h3><div class="grid"><div><b>4</b><span>merges</span></div><div><b>6</b><span>reviews · 5 failed</span></div><div><b>2</b><span>stops</span></div><div><b>1</b><span>gate passed</span></div></div>' +
        '<p>You answered 3 things; the longest wait is 9 days (the widget). <span class="ex">An example: the desk keeps no week’s tally yet.</span></p>';
      g1.parentNode.insertBefore(wk, g1); } }
    /* search B: the field sits above the title, hidden under the bar until you pull down, as iPhone lists do */
    if (srch && de.classList.contains('fh-sB') && band && srch.previousElementSibling !== band) band.parentNode.insertBefore(srch, band.nextSibling);
  }
  function fhSearch(open) {
    var de = document.documentElement, band = document.querySelector('#view .hm-band'); if (!band) return;
    var bar = band.querySelector('.hd-bar'), f = bar && bar.querySelector('.fh-sfield');
    if (!open) { if (f) f.remove(); de.classList.remove('fh-sopen'); return; }
    if (!bar || f) return;
    f = document.createElement('div'); f.className = 'fh-sfield';
    f.innerHTML = '<label>' + FH_IC.search + '<input type="search" placeholder="Projects and what needs you" aria-label="Search projects and what needs you"></label><button type="button">Cancel</button>';
    bar.appendChild(f); de.classList.add('fh-sopen'); var inp = f.querySelector('input'); try { inp.focus({ preventScroll: true }); } catch (e) {}
  }
  /* the small title shows in the bar once the large one has gone under it */
  function fhScroll() { var h = document.querySelector('#view .fh-lt h1, #view .fh-hero h1'), b = document.querySelector('#view .hm-band');
    document.documentElement.classList.toggle('fh-scrolled', h && b ? h.getBoundingClientRect().bottom < b.getBoundingClientRect().bottom + 4 : window.scrollY > 44); }
  window.addEventListener('scroll', fhScroll, { passive: true });

  var fhObs = new MutationObserver(function () { if (!fhObs.raf) fhObs.raf = requestAnimationFrame(function () { fhObs.raf = 0; if (v13on()) fhApply(); else fhHome(); }); });
  fhObs.observe(document.body, { childList: true, subtree: true });
  function fhStart() {
    var y = +(FH.tok.y || 0);
    if (v13on()) { fhApply(); if (FH.flags.open) setTimeout(function () { fhPanel(true); }, 200); if (y) window.scrollBy(0, y); return; }
    fhHome(); fhScroll();
    if (FH.flags.sopen) fhSearch(true);
    if (document.documentElement.classList.contains('fh-sB') && !FH.flags.pulled) { var s = document.querySelector('#view > .search'), b = document.querySelector('#view .hm-band');
      if (s && b) window.scrollTo(0, Math.max(0, s.getBoundingClientRect().bottom + window.scrollY - b.offsetHeight + 8)); }
    if (y) window.scrollBy(0, y);
    fhScroll();
  }
  if (!FH.flags.home) setTimeout(function () { if (!v13on()) openProject('tl'); setTimeout(fhStart, REDUCED ? 400 : 1400); }, 300);
  else setTimeout(fhStart, 350);
