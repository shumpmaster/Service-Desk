  /* ================= v38: the band paints the ground's field lined up with the screen (ground.css). A fixed background on an element is
     not kept by iPhone Safari, so the band's own place on the screen is written to --gr-x and --gr-y as the page scrolls or redraws. ================= */
  (function () {
    var raf = 0;
    function line() { raf = 0; var bs = document.querySelectorAll('#v13band, .v13band');
      for (var i = 0; i < bs.length; i++) { var r = bs[i].getBoundingClientRect(); bs[i].style.setProperty('--gr-x', Math.round(r.left) + 'px'); bs[i].style.setProperty('--gr-y', Math.round(r.top) + 'px'); } }
    function soon() { if (!raf) raf = requestAnimationFrame(line); }
    window.addEventListener('scroll', soon, { passive: true }); window.addEventListener('resize', soon);
    new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
    soon();
  })();
