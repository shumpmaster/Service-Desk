  /* ================= round 8, answer 18: home's title accent. Hash token a=P|H|M|W (plate, halo, mark, wordmark). ================= */
  (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.'), a = '';
    h.forEach(function (t) { if (t.indexOf('a=') === 0) a = t.slice(2); });
    var de = document.documentElement; if (a) de.classList.add('tt-a' + a);
    var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, R = 64;
    function p() { var y = Math.max(0, window.scrollY), v = Math.min(1, y / R); if (RM) v = y > R / 2 ? 1 : 0; de.style.setProperty('--tt-p', v.toFixed(3)); }
    window.addEventListener('scroll', p, { passive: true }); p();
    function mark() { if (a !== 'M') return; var lt = document.querySelector('#view .fh-lt'); if (lt && !lt.querySelector('.tt-mark')) { var m = document.createElement('i'); m.className = 'tt-mark'; m.setAttribute('aria-hidden', 'true'); lt.appendChild(m); } }
    new MutationObserver(function () { mark(); }).observe(document.body, { childList: true, subtree: true }); mark();
  })();
