  /* Options for the owner's round 5, answer 11 (on answer 10): "originally i was asking about the needs first and such. I dont want
     clicking on this type of card to move the flow back". A layer over v20 with the tree (HIER = '2') and the why as B (WHY2 = 'B').
     NEED4 = 'A' | 'B' | 'C'. The "Needs first" list leaves the space under the event and becomes part of the event; the tree stays
     inside it, so a requirement's icon still opens what it needs in turn; tapping a requirement never moves the page.
     A: a "Needs 3" tag on the event's first line, tinted by the worst state; tap it and the list opens in a bubble under the title.
     B: the requirements as small chips on the event's last line; tap any to open the same bubble.
     C: a "Needs 3" tag as in A; tap it and the list rises in a sheet over the page, which stays where it was. */
  function n4cut(h) {   /* take the needs (hk-kids or its folded line) out of the tree's wrapper, leaving the event's row */
    if (h.indexOf('<div class="hk-ev">') !== 0) return h;
    var body = h.slice('<div class="hk-ev">'.length, -'</div>'.length), j = body.search(/<div class="hk-kids">|<button type="button" class="hk-sum"/);
    var row = j < 0 ? body : body.slice(0, j);
    return row.replace(' hk-has', '').replace(' hk-open', '').replace(/<span data-hk="[^"]*" role="button" tabindex="0" aria-expanded="[^"]*" aria-label="[^"]*" class="v13ico hk-tw/, '<span class="v13ico');
  }
  function n4worst(miss) { return miss.some(function (d) { return d[0] === 'bad'; }) ? 'bad' : miss.some(function (d) { return d[0] === 'wait'; }) ? 'wait' : ''; }
  function n4list(k) { return '<div class="hk-kids n4-in">' + cmH(DEP[k] || [], UNL[k] || [], unmet(k), k, 0) + '</div>'; }
  var _evRow13N4 = evRow13;
  evRow13 = function (b, i, g, e) {
    var sp = PLANS[state.proj][b].items[i].sprints[g], x = sp.events[e], k = sp.name + '|' + x.title, deps = DEP[k] || [], miss = unmet(k);
    var h = _evRow13N4(b, i, g, e);
    if (!miss.length) return h;
    h = n4cut(h);
    var on = state.n4 === k, w = n4worst(miss), tagH = '<button type="button" class="n4-tag ' + w + (on ? ' on' : '') + '" data-n4="' + esc(k) + '" aria-expanded="' + on + '">' + V13I.link + 'Needs ' + miss.length + '</button>';
    if (NEED4 === 'B') {
      var chips = '<div class="n4-chips">' + miss.map(function (d) { return '<button type="button" class="n4-chip ' + d[0] + '" data-n4="' + esc(k) + '">' + (d[0] === 'bad' ? V12I.warn : d[0] === 'wait' ? V13I.wait : '<i></i>') + '<span>' + esc(d[1]) + '</span></button>'; }).join('') + '</div>';
      var j = h.lastIndexOf('</div></div>'); h = h.slice(0, j) + chips + h.slice(j);
    } else h = h.replace('<span class="tm">', tagH + '<span class="tm">');
    if (on && NEED4 !== 'C') { var z = h.lastIndexOf('</div></div>'); h = h.slice(0, z) + '<div class="n4-bub">' + n4list(k) + '</div>' + h.slice(z); }
    return h;
  };
  function n4sheet() {
    var o = document.getElementById('n4-sheet'); if (o) o.remove();
    if (NEED4 !== 'C' || !state.n4) return;
    var p = state.n4.split('|');
    document.body.insertAdjacentHTML('beforeend', '<div id="n4-sheet" role="dialog" aria-label="What ' + esc(p[1]) + ' needs"><div class="wy-hd"><b>' + esc(p[1]) + '</b><button type="button" class="nd-x" data-n4x aria-label="Close">' + V13I.x + '</button></div>' + n4list(state.n4) + '<div class="nd-ex">Requirements are an example: no record says yet which event needs which.</div></div>');
  }
  function n4redraw() { var l = document.getElementById('v13list'), y = window.scrollY; if (!l) return; l.innerHTML = list13(); window.scrollTo(0, y); n4sheet(); v13sync(false); }
  window.addEventListener('click', function (e) {
    if (!v13on()) return;
    if (e.target.closest('[data-n4x]')) { e.stopImmediatePropagation(); state.n4 = null; n4redraw(); return; }
    var t = e.target.closest('[data-n4]');
    if (t) { e.stopImmediatePropagation(); state.n4 = state.n4 === t.dataset.n4 ? null : t.dataset.n4; n4redraw();
      var box = state.n4 && (document.querySelector('.n4-bub') || document.getElementById('n4-sheet')); if (box && !REDUCED) anim(box, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 200 }); return; }
    var inside = e.target.closest('.n4-bub, #n4-sheet');
    if (inside) {   /* the tree's icons open in place (handled before this); the rows themselves never move the page */
      if (e.target.closest('[data-hn]')) { setTimeout(n4sheet, 0); return; }
      if (e.target.closest('[data-nd-go]')) { e.stopImmediatePropagation(); e.preventDefault(); }
      return;
    }
  }, true);
  /* the tree's icon inside a sheet re-draws the sheet too */
  var _relistN4 = relist;
  relist = function (sel) { var r = _relistN4(sel); if (NEED4 === 'C') n4sheet(); return r; };
  var _renderProjectN4 = renderProject;
  renderProject = function () { state.n4 = null; var s = document.getElementById('n4-sheet'); if (s) s.remove(); return _renderProjectN4.apply(this, arguments); };
