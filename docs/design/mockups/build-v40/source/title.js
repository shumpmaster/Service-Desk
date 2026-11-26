  /* ================= v40, round 8 answers 18 and 19: home's title band. --tt-p runs 0 to 1 over the first 64 points of scroll; the band
     reaches the top of the screen and both its edges (--tt-up, --tt-l, --tt-r); the accent mark sits under the title. ================= */
  (function () {
    var de = document.documentElement, RM = REDUCED, R = 64;
    function p() { var y = Math.max(0, window.scrollY), v = Math.min(1, y / R); if (RM) v = y > R / 2 ? 1 : 0; de.style.setProperty('--tt-p', v.toFixed(3)); }
    function fit() { var lt = document.querySelector('#view .fh-lt'); if (!lt) return;
      if (!lt.querySelector('.tt-mark')) { var m = document.createElement('i'); m.className = 'tt-mark'; m.setAttribute('aria-hidden', 'true'); lt.appendChild(m); }
      var r = lt.getBoundingClientRect(), up = Math.round(r.top + window.scrollY), l = Math.round(r.left), rr = Math.round(window.innerWidth - r.right);
      if (lt.__f !== up + ',' + l + ',' + rr) { lt.__f = up + ',' + l + ',' + rr; de.style.setProperty('--tt-up', up + 'px'); de.style.setProperty('--tt-l', l + 'px'); de.style.setProperty('--tt-r', rr + 'px'); } }
    window.addEventListener('scroll', p, { passive: true }); window.addEventListener('resize', fit);
    new MutationObserver(function () { if (!fit.raf) fit.raf = requestAnimationFrame(function () { fit.raf = 0; fit(); }); }).observe(document.body, { childList: true, subtree: true });
    p(); fit();
  })();
