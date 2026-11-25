  /* The owner's round 7, answer 18: "On the 1/2/3/4 section I don't like how the timeline perspective gets thrown off when you
     select a milestone". Today tapping a milestone fits the branch map to that milestone alone, so the rest of the phase leaves the
     map. A layer over v29. SL = 'A' | 'B' | 'C'.
     A: the map always shows the whole phase; the selected milestone's stretch of it is tinted and outlined in blue, with a chip
        naming it (its cross clears it). The window and the centre arrow follow the scroll as before.
     B: the map still fits the milestone, but the band shows the phase's milestones as a strip, the fitted one ringed, so you can see
        where you are and tap another box to move; the chip's cross brings back the whole phase.
     C: no selection at all: tapping a milestone only folds or opens it; the map always shows the whole phase, following the scroll. */
  state.sl = {};
  var SL_X = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
  function slUnfit() { if (SL === 'B') return false; var k = fitKey(); if (!k) return false; state.sl[state.proj] = SL === 'A' ? k : null; state.fitSel[state.proj] = null; return true; }
  function slMark() {
    var inn = document.getElementById('v13in'), vp = document.querySelector('#v13band .v13vp'); if (!inn || !vp || !MAP) return;
    var old = vp.querySelector('.sl-chip'); if (old) old.remove();
    var svg = inn.querySelector('svg'); if (!svg) return;
    [].slice.call(svg.querySelectorAll('.sl-band, .sl-edge')).forEach(function (n) { n.remove(); });
    if (SL === 'B') { slStrip(); return; }
    var sel = state.sl[state.proj]; if (SL !== 'A' || !sel) return;
    var keys = Object.keys(MAP.key || {}).filter(function (k) { return k.indexOf(sel + ':') === 0; }).map(function (k) { return MAP.key[k]; });
    var x0 = 1e9, x1 = -1e9;
    keys.forEach(function (k) { var g = svg.querySelector('.st[data-k="' + k + '"]'); if (!g) return; g.classList.add('sl-on'); var bb = g.getBBox(); x0 = Math.min(x0, bb.x); x1 = Math.max(x1, bb.x + bb.width); });
    if (x0 > x1) return;
    var vb = svg.viewBox.baseVal, h = vb && vb.height ? vb.height : svg.getBBox().height, NS = 'http://www.w3.org/2000/svg';
    var r = document.createElementNS(NS, 'rect'); r.setAttribute('class', 'sl-band'); r.setAttribute('x', x0 - 6); r.setAttribute('y', 2); r.setAttribute('width', x1 - x0 + 12); r.setAttribute('height', h - 4); r.setAttribute('rx', 8);
    var e = r.cloneNode(); e.setAttribute('class', 'sl-edge');
    svg.insertBefore(e, svg.firstChild); svg.insertBefore(r, svg.firstChild);
    var p = sel.split(':'), it = PLANS[state.proj][+p[0]].items[+p[1]], no = typeof duRe === 'function' ? duRe(msNo(+p[0], +p[1])) : msNo(+p[0], +p[1]);
    vp.insertAdjacentHTML('beforeend', '<button type="button" class="sl-chip" data-sl-off aria-label="Clear the selected milestone">' + esc(no + ' ' + (it.own ? it.id : it.name)) + SL_X + '</button>');
  }
  function slStrip() {
    var vp = document.querySelector('#v13band .v13vp'); if (!vp) return;
    var o = vp.querySelector('.sl-strip'); if (o) o.remove();
    var b = curB(), blk = PLANS[state.proj][b], fk2 = fitKey(), h = '';
    var L = document.getElementById('v13list'), order = L ? [].slice.call(L.querySelectorAll('.v13phase.cur > .v13body > .v13ms > button[data-v13fold^="it:"], .v13phase.cur > .v13body > .v13now')) : [];
    order.forEach(function (bt) {
      if (bt.classList.contains('v13now')) { h += '<span class="nw"></span>'; return; }
      var k = bt.dataset.v13fold.slice(3), g = bt.querySelector('.v13g'), st = g && /\b(ok|wait|bad)\b/.exec(g.className);
      h += '<i class="' + (st ? st[1] : '') + (k === fk2 ? ' fit' : '') + '" data-sl-fit="' + k + '" title="' + esc((bt.querySelector('.no') || {}).textContent || '') + '"></i>';
    });
    if (h) vp.insertAdjacentHTML('beforeend', '<span class="sl-strip" aria-label="The phase\'s milestones">' + h + '</span>');
  }
  if (typeof drawMap === 'function') { var _drawMapSl = drawMap; drawMap = function () { var r = _drawMapSl.apply(this, arguments); slMark(); return r; }; }
  var _v13syncSl = v13sync; v13sync = function () { var r = _v13syncSl.apply(this, arguments); if (SL === 'A') slMark(); return r; };
  var _renderProjectSl = renderProject;
  renderProject = function () { var r = _renderProjectSl.apply(this, arguments); if (slUnfit()) refit(); else slMark(); setTimeout(slMark, 60); return r; };
  window.addEventListener('click', function (e) {
    if (!v13on()) return;
    if (e.target.closest('[data-sl-off]')) { e.stopImmediatePropagation(); state.sl[state.proj] = null; drawMap(); v13sync(false); return; }
    var s = e.target.closest('[data-sl-fit]'); if (s) { e.stopImmediatePropagation(); state.fitSel[state.proj] = s.dataset.slFit; refit(); return; }
    if (e.target.closest('[data-v13fold^="it:"]')) setTimeout(function () { if (slUnfit()) refit(); else slMark(); }, 0);
  }, true);   /* on capture: the list's own fold handler stops the click before it would bubble here */
