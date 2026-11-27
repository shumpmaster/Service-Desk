  /* ================= v44: one clock everywhere (round 8, answer 6 item 12, and the plain-words test's "three clocks on one phone").
     Every time the records hold is UTC; the desk shows it in Chicago (UTC-6 in November) with am or pm, and a date when it is not today
     (14 Nov). v34 did the list's rows; this catches the rest: the widget's rows, the sheets, the bubbles, the banners and the Context view. ================= */
  function tmFix(root) {
    if (!root) return; var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, todo = [];
    while ((n = tw.nextNode())) { var p = n.parentElement; if (!p || p.closest('script, style, .pw-code, .rec-l')) continue; if (/\d{2}:\d{2}/.test(n.textContent)) todo.push(n); }
    todo.forEach(function (n) {
      var t = n.textContent, o = t, inTm = n.parentElement.closest('#v13list .tm');
      t = t.replace(/\b(\d{1,2}) (Oct|Nov) (\d{2}):(\d{2})( UTC)?(?!\s?[ap]m)/g, function (_, d, mo, hh, mm) { var c = r8Ct(d, mo, hh, mm); return (c.day === 14 && c.mon === 'Nov' ? '' : c.day + ' ' + c.mon + ', ') + c.t; });
      if (!inTm) t = t.replace(/(^|[^\d:.])(\d{2}):(\d{2})( UTC)?(?!\s?[ap]m)(?![\d:])/g, function (_, pre, hh, mm) { var c = r8Ct('14', 'Nov', hh, mm); return pre + (c.day === 14 ? '' : c.day + ' ' + c.mon + ', ') + c.t + (_.indexOf('UTC') > 0 ? ' CT' : ''); });
      if (t !== o) n.textContent = t;
    });
  }
  function tmApply() { ['#v13list', '.kn-sheet', '.pp-sheet', '.ss-bub', '#cxview', '.sheet', '.feedbar', '.banner', '#view .sg-strip'].forEach(function (s) { [].forEach.call(document.querySelectorAll(s), tmFix); }); }
  var tmObs = new MutationObserver(function () { if (!tmObs.raf) tmObs.raf = requestAnimationFrame(function () { tmObs.raf = 0; try { tmApply(); } catch (e) { console.error(e); } }); });
  tmObs.observe(document.body, { childList: true, subtree: true, characterData: true });
  setTimeout(tmApply, 80);
