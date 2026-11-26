  /* ================= round 8, answer 14: the look and feel, four options over v36 (decisions/questions/P-005-design-round-8.md)
     The phone's hash: #<option>[.light|.dark][.<start>...]; options: now 1A 1B 2A 2B 3A 3B 4A 4B.
     starts: home (stay on home), at=<text> (that row at the pointer), menu (the phase menu open), sheet (stop card 5's choices open), y=<px> (scroll by). ================= */
  var LK = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.').filter(function (x) { return x !== 'light' && x !== 'dark'; });
    var o = { opt: h[0] || 'now', st: h.slice(1) };
    document.documentElement.classList.add('lk-' + o.opt);
    return o;
  })();
  /* routine events (commits) on the map, from each station's title */
  function lkMap() {
    if (!/^(1A|1B)$/.test(LK.opt)) return;
    [].slice.call(document.querySelectorAll('#v13in svg g.st:not([data-lk])')).forEach(function (g) {
      var t = g.querySelector('title'); g.setAttribute('data-lk', '1');
      if (t && /^Commit:/.test(t.textContent)) g.classList.add('lk-r');
    });
  }
  /* 3A: the kind, a grey state and the time, said once on the small number line */
  function lkRows() {
    if (LK.opt !== '3A') return;
    [].slice.call(document.querySelectorAll('#v13list .v13ev > .tx > .no4')).forEach(function (n) {
      var l1 = n.parentNode.querySelector(':scope > .l1'); if (!l1) return;
      var k = l1.querySelector(':scope > b'), tm = l1.querySelector(':scope > .tm'), st = l1.querySelector(':scope > .v13tag:not(.bad):not(.wait)');
      var parts = []; if (k && k.textContent.trim()) parts.push(k.textContent.trim()); if (st && st.textContent.trim()) parts.push(st.textContent.trim()); if (tm && tm.textContent.trim()) parts.push(tm.textContent.trim());
      var txt = parts.length ? ' · ' + parts.join(' · ') : '';
      var m = n.querySelector('.lk-meta'); if (!m) { m = document.createElement('span'); m.className = 'lk-meta'; n.appendChild(m); }
      if (m.textContent !== txt) m.textContent = txt;
    });
  }
  function lkApply() { lkMap(); lkRows(); }
  var lkObs = new MutationObserver(function () { if (!lkObs.raf) lkObs.raf = requestAnimationFrame(function () { lkObs.raf = 0; lkApply(); }); });
  lkObs.observe(document.body, { childList: true, subtree: true });
  function lkStart() {
    var st = LK.st, i = 0;
    function next() {
      if (i >= st.length) return; var t = st[i++];
      if (t.indexOf('at=') === 0) { ppCentre(ppFind(t.slice(3).replace(/_/g, ' '))); setTimeout(next, 500); return; }
      if (t.indexOf('y=') === 0) { window.scrollBy(0, +t.slice(2)); setTimeout(next, 400); return; }
      if (t === 'menu') { var ph = document.querySelector('.pl-row .tp-pill.ph'); if (ph) ph.click(); setTimeout(next, 500); return; }
      if (t === 'sheet') { knOpen('s:Stop card 5'); setTimeout(next, 500); return; }
      next();
    }
    next();
  }
  if (LK.st.indexOf('home') < 0) setTimeout(function () { if (!v13on()) openProject('tl'); setTimeout(function () { lkApply(); lkStart(); }, REDUCED ? 400 : 1400); }, 300);
  else lkApply();
