  /* ================= v37: the look and feel, option A of each (round 8, answers 14 and 15): routine commits outside the window as dots; the kind, a grey state and the time on the number line ================= */
  /* routine events (commits) on the map, from each station's title */
  function lkMap() {
    [].slice.call(document.querySelectorAll('#v13in svg g.st:not([data-lk])')).forEach(function (g) {
      var t = g.querySelector('title'); g.setAttribute('data-lk', '1');
      if (t && /^Commit:/.test(t.textContent)) g.classList.add('lk-r');
    });
  }
  /* 3A: the kind, a grey state and the time, said once on the small number line */
  function lkRows() {
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
  lkApply();
