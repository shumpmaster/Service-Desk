  /* Options for the owner's round 5, answer 10: "I like the tree, but I don’t like the format of the whys being embedded into
     everything like a step. I thought I would but I want it represented slightly differently". A layer over v20 with the tree
     (options-hierarchy, HIER = '2') inside its script. WHY2 = 'A' | 'B' | 'C'. The why sentences leave the tree in each.
     A: the why is part of the event: it follows "by …" on the event's last line, two lines at most; tap it to read it all.
     B: a small "Why" on the event's first line; tap it and the sentence opens in a bubble pointing at the event, one at a time.
     C: hidden until you ask: a "Why" switch beside the map's chip; on, each sentence sits as a small note on the line between events. */
  var _evRow13W2 = evRow13, WHYKEEP = WHY;
  evRow13 = function (b, i, g, e) {
    WHY = {}; var h; try { h = _evRow13W2(b, i, g, e); } finally { WHY = WHYKEEP; }
    var sp = PLANS[state.proj][b].items[i].sprints[g], x = sp.events[e], k = sp.name + '|' + x.title, w = WHY[k];
    if (!w || x.t === 'planned') return h;
    var l3 = '<div class="l3">', j = h.indexOf(l3);
    if (WHY2 === 'A') {
      var end = h.indexOf('</div>', j), open = !!state.open[fk('w2:' + k)];
      return h.slice(0, j) + '<div class="l3 w2-l3' + (open ? ' open' : '') + '" data-w2="' + esc(k) + '">' + h.slice(j + l3.length, end) + '<span class="w2-why"> · <b>Why:</b> ' + esc(w) + '</span>' + h.slice(end);
    }
    if (WHY2 === 'B') {
      var on = state.w2b === k;
      h = h.replace('<span class="tm">', '<button type="button" class="w2-q' + (on ? ' on' : '') + '" data-w2b="' + esc(k) + '" aria-expanded="' + on + '">Why</button><span class="tm">');
      return on ? h.replace(/<\/div><\/div>$/, '') + '<div class="w2-bub" role="note"><b>Why:</b> ' + esc(w) + '</div></div></div>' : h;
    }
    /* C */
    return state.w2c ? h + '<div class="w2-note"><span>' + esc(w) + '</span></div>' : h;
  };
  /* C: the switch sits beside the map's chip */
  var _drawW2 = typeof drawMap === 'function' ? drawMap : null;
  function w2switch() {
    if (WHY2 !== 'C') return;
    var vp = document.querySelector('#v13band .v13vp'); if (!vp) return;
    var o = vp.querySelector('.w2-sw'); if (o) o.remove();
    vp.insertAdjacentHTML('beforeend', '<button type="button" class="w2-sw' + (state.w2c ? ' on' : '') + '" aria-pressed="' + !!state.w2c + '" data-w2c>Why</button>');
  }
  if (_drawW2) drawMap = function () { var r = _drawW2.apply(this, arguments); w2switch(); return r; };
  var _renderProjectW2 = renderProject;
  renderProject = function () { var r = _renderProjectW2.apply(this, arguments); w2switch(); return r; };
  window.addEventListener('click', function (e) {
    if (!v13on()) return;
    var a = e.target.closest('[data-w2]'), bq = e.target.closest('[data-w2b]'), c = e.target.closest('[data-w2c]');
    if (a && WHY2 === 'A') { e.stopImmediatePropagation(); var key = fk('w2:' + a.dataset.w2); state.open[key] = !state.open[key]; a.classList.toggle('open', state.open[key]); return; }
    if (bq) { e.stopImmediatePropagation(); state.w2b = state.w2b === bq.dataset.w2b ? null : bq.dataset.w2b; var f = relist('[data-w2b="' + bq.dataset.w2b.replace(/"/g, '\\"') + '"]'); var bub = f && f.closest('.v13ev').querySelector('.w2-bub'); if (bub && !REDUCED) anim(bub, [{ opacity: 0, transform: 'translateY(-4px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 200 }); return; }
    if (c) { e.stopImmediatePropagation(); state.w2c = !state.w2c; var l = document.getElementById('v13list'); var y = window.scrollY; l.innerHTML = list13(); window.scrollTo(0, y); w2switch(); v13sync(false); return; }
    if (WHY2 === 'B' && state.w2b && !e.target.closest('.w2-bub')) { state.w2b = null; var l2 = document.getElementById('v13list'), y2 = window.scrollY; l2.innerHTML = list13(); window.scrollTo(0, y2); }
  }, true);
