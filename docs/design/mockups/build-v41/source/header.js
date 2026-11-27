  /* ================= v41, round 8 answer 20: home's title block rises into the slim bar's slot. --hd41-slot is the slot's height,
     --hd41-pad puts the live label's centre on the capsule's centre. The bar takes over once the title band has nearly condensed
     (52 of its 64 points; 32 with reduced motion, where it snaps there), so the large title and the small one never both vanish or both show. ================= */
  (function () {
    var de = document.documentElement;
    function fit() { var band = document.querySelector('#view .hm-band'), lt = document.querySelector('#view .fh-lt'), cap = band && band.querySelector('.capsule'), as = lt && lt.querySelector('.asof');
      if (!band || !lt || !cap || !as) return;
      var slot = Math.round(band.getBoundingClientRect().height), cr = cap.getBoundingClientRect(), br = band.getBoundingClientRect();
      var pad = Math.round((cr.top - br.top) + cr.height / 2 - as.getBoundingClientRect().height / 2);
      var key = slot + ',' + pad; if (fit.k === key) return; fit.k = key;
      de.style.setProperty('--hd41-slot', slot + 'px'); de.style.setProperty('--hd41-pad', pad + 'px'); }
    function sc() { if (!document.querySelector('#view .fh-lt')) return; de.classList.toggle('fh-scrolled', window.scrollY >= (REDUCED ? 32 : 52)); }
    window.addEventListener('scroll', sc, { passive: true }); window.addEventListener('resize', function () { fit.k = ''; fit(); });
    new MutationObserver(function () { if (!fit.raf) fit.raf = requestAnimationFrame(function () { fit.raf = 0; fit(); sc(); }); }).observe(document.body, { childList: true, subtree: true });
    fit(); sc();
  })();
