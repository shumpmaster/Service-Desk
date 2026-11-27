  /* ================= v48: home keeps its priority list on coming back (the fault found with round 9, answer 3; options-r9-needs/README.md).
     Since v45, Back from a project's page (or Desk) re-drew home with the older grouped cards: v44 renamed the widget's waiting row
     ("Your call: resubmit the widget’s brief, or stop?"), so on the re-draw v41 found no event line for it, and v43's prBuild, which waits
     for every row's event line, gave up and was not run again (it only re-ran when #view's own children changed). v48.py adds the renamed
     row to v41's event lines; here prBuild is run again whenever home shows without its list. ================= */
  (function () {
    var v = document.getElementById('view'); if (!v) return;
    function keep() {
      if (typeof state === 'undefined' || state.view !== 'desk' || v.querySelector(':scope > .pr-wrap')) return;
      if (!v.querySelector(':scope > .sg-grp[data-sgg]')) return;
      try { prBuild(); } catch (e) { console.error(e); }
    }
    new MutationObserver(function () { if (!keep.raf) keep.raf = requestAnimationFrame(function () { keep.raf = 0; keep(); }); }).observe(v, { childList: true, subtree: true });
  })();
