  /* ================= round 8, answer 15: slight colour in the background, options over v37 (decisions/questions/P-005-design-round-8.md)
     The phone's hash: #<option>[.light|.dark][.<start>...]; options: now A B C D. starts: home (stay on home), wd (open the Home-screen widget), y=<px> (scroll by). ================= */
  var GR = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.').filter(function (x) { return x !== 'light' && x !== 'dark'; });
    var o = { opt: h[0] || 'now', st: h.slice(1) };
    if (o.opt !== 'now') document.documentElement.classList.add('gr-' + o.opt);
    return o;
  })();
  /* B: which project is open; D: whether something in it waits on the owner */
  function grSync() {
    var de = document.documentElement, p = (state.view === 'proj' && state.proj) ? state.proj : '';
    if (de.getAttribute('data-gr-proj') !== p) { if (p) de.setAttribute('data-gr-proj', p); else de.removeAttribute('data-gr-proj'); }
    var waits = p ? !!document.querySelector('#v13list [data-kn-wait], #v13list .kn-you') : document.querySelectorAll('.sg-badge').length > 0;
    de.classList.toggle('gr-waits', waits);
  }
  var grObs = new MutationObserver(function () { if (!grObs.raf) grObs.raf = requestAnimationFrame(function () { grObs.raf = 0; grSync(); }); });
  grObs.observe(document.body, { childList: true, subtree: true });
  function grStart() {
    var st = GR.st, i = 0;
    function next() { if (i >= st.length) return; var t = st[i++];
      if (t.indexOf('y=') === 0) { window.scrollBy(0, +t.slice(2)); setTimeout(next, 400); return; }
      next(); }
    next();
  }
  var grTarget = GR.st.indexOf('wd') >= 0 ? 'wd' : 'tl';
  if (GR.st.indexOf('home') < 0) setTimeout(function () { if (!v13on()) openProject(grTarget); setTimeout(function () { grSync(); grStart(); }, REDUCED ? 400 : 1400); }, 300);
  else { grSync(); setTimeout(grStart, 300); }
