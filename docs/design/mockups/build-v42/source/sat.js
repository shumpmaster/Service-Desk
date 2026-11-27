  /* v42: the top inset as the browser reports it, kept for the record (the notes at the foot of the page show it), so a phone's
     screenshot says what the Claude app reports; the page itself only ever uses --sat, capped at 100. */
  (function () {
    var pr = document.createElement('div'); pr.style.cssText = 'position:fixed;top:0;left:0;width:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top, 0px)';
    document.body.appendChild(pr);
    function show() { var raw = Math.round(parseFloat(getComputedStyle(pr).paddingTop) || 0), used = Math.min(raw, 100);
      document.documentElement.setAttribute('data-sat', raw + '/' + used);
      var n = document.getElementById('sat42'); if (!n) { var f = document.querySelector('.r8-about, .foot, footer'); if (!f) return; n = document.createElement('p'); n.id = 'sat42'; n.className = 'sat42'; f.appendChild(n); }
      n.textContent = 'Top inset: the browser reports ' + raw + ' points; the page uses ' + used + '.'; }
    window.addEventListener('resize', show); setTimeout(show, 300);
  })();
