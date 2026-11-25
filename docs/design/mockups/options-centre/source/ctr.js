  /* The owner's round 7, answer 8: "can we establish a fixed center, that the scroll moves around? My example would be an arrow fixed
     in the middle of the screen that is always identifying the phase or milestone or task or action that is in line with it. And
     along with it an arrow pops up on the horizontal scrolling branch timeline to match". A layer over v28 inside its script.
     The centre is the middle of the list's window: between the floating band and the tab bar. Whatever row sits level with it (a
     phase heading, a milestone, a sprint, an event, a plan or one of its actions; the smallest that contains the line) is the one
     marked. On the map, a small arrow points down at the matching event: the event itself, the first event of a sprint or milestone,
     or the event a plan follows. CT = 'A' | 'B' | 'C'.
     A: a pointer in the left margin, and the marked row lightly washed in blue.
     B: a thin reading line across the screen with its arrow at the left, and a hairline down from the map's arrow.
     C: an arrow at the right edge carrying the marked row's number, and the same number over the map's arrow. */
  var ctMark = null, ctMap = null, ctRaf = 0, ctLast = null;
  function ctCentre() { var b = document.getElementById('v13band'), top = b ? b.getBoundingClientRect().bottom : 0, bot = window.innerHeight - 96; return { y: (top + bot) / 2, top: top, bot: bot }; }
  function ctNo(el) {
    var n = el.querySelector(':scope .no4.own, :scope > .tx .no4'); if (n) return n.textContent;
    var a = el.querySelector(':scope .l1 > .no, :scope .no, :scope .num'); if (a) return a.textContent.trim();
    var ph = el.closest('.v13phase'); return ph ? (document.querySelector('.v13phases [aria-current="true"] .n, .v13phases .cur .n') || {}).textContent || '' : '';
  }
  function ctPick() {
    var L = document.getElementById('v13list'); if (!L) return null;
    var c = ctCentre(), best = null, near = null, nd = 1e9;
    [].slice.call(L.querySelectorAll('.v13phh, .v13ms > .v13gr, .v13sp > .v13gr, .v13body > .v13ev, .v13stephd, ol.v12plan > li, .v13now')).forEach(function (el) {
      var r = el.getBoundingClientRect(); if (!r.height) return;
      if (r.top <= c.y && r.bottom >= c.y) best = el;
      var d = Math.min(Math.abs(r.top - c.y), Math.abs(r.bottom - c.y)); if (d < nd) { nd = d; near = el; }
    });
    return best || (nd < 40 ? near : null);
  }
  function ctMapKey(el) {
    if (el.dataset.k) return el.dataset.k;
    var sp = el.closest('.v13sp, .v13ms'), step = el.closest('.v13step');
    if (step) { var p = step.previousElementSibling; while (p && !p.dataset.k) p = p.previousElementSibling; if (p) return p.dataset.k; }
    if (el.matches('.v13sp > .v13gr, .v13ms > .v13gr') && sp) { var f = sp.querySelector('[data-k]'); if (f) return f.dataset.k; }
    return null;
  }
  function ctDraw() {
    ctRaf = 0;
    if (!v13on() || state.cx) { if (ctMark) ctMark.classList.add('off'); if (ctMap) ctMap.classList.add('off'); return; }
    if (!ctMark) { ctMark = document.createElement('div'); ctMark.className = 'ct-mark ct-' + CT; ctMark.setAttribute('aria-hidden', 'true'); document.body.appendChild(ctMark); }
    var c = ctCentre(); ctMark.style.top = c.y + 'px';
    var el = ctPick();
    if (ctLast && ctLast !== el) ctLast.classList.remove('ct-on');
    ctLast = el;
    if (!el) { ctMark.classList.add('off'); if (ctMap) ctMap.classList.add('off'); return; }
    ctMark.classList.remove('off');
    if (CT === 'A') el.classList.add('ct-on');
    var no = ctNo(el) || '';
    if (CT === 'C') ctMark.innerHTML = '<b>' + no + '</b>';
    var band = document.getElementById('v13band'), k = ctMapKey(el), dot = k !== null && band && band.querySelector('.v13vp .st[data-k="' + k + '"]');
    if (!ctMap && band) { ctMap = document.createElement('div'); ctMap.className = 'ct-map ct-' + CT; ctMap.setAttribute('aria-hidden', 'true'); band.appendChild(ctMap); }
    if (!ctMap) return;
    if (ctMap.parentNode !== band) band.appendChild(ctMap);
    if (!dot) { ctMap.classList.add('off'); return; }
    var br = band.getBoundingClientRect(), dr = dot.getBoundingClientRect(), vp = band.querySelector('.v13vp').getBoundingClientRect();
    var x = dr.left + dr.width / 2 - br.left;
    ctMap.classList.toggle('off', dr.right < vp.left || dr.left > vp.right);
    ctMap.style.left = x + 'px'; ctMap.style.top = (dr.top - br.top - 2) + 'px';
    ctMap.innerHTML = CT === 'C' ? '<b>' + no + '</b>' : '';
  }
  function ctSoon() { if (!ctRaf) ctRaf = requestAnimationFrame(ctDraw); }
  window.addEventListener('scroll', ctSoon, { passive: true });
  window.addEventListener('resize', ctSoon);
  document.addEventListener('transitionend', function (e) { if (e.target.id === 'v13in') ctSoon(); });
  var _renderProjectCt = renderProject;
  renderProject = function () { var r = _renderProjectCt.apply(this, arguments); if (ctMap && ctMap.parentNode) ctMap.parentNode.removeChild(ctMap); ctMap = null; setTimeout(ctSoon, 50); setTimeout(ctSoon, 400); return r; };
  window.addEventListener('click', function () { setTimeout(ctSoon, 60); setTimeout(ctSoon, 450); setTimeout(ctSoon, 900); });
  setInterval(function () { if (v13on()) ctSoon(); }, 600);   /* the map also redraws on its own (fits, slides); keep the arrow on it */
