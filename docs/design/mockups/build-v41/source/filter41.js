  /* ================= v41, round 8 answer 23, a comment on the map card's filter: "When things are filtered I would like the table to
     adjust and show me only that filtered view." v40 quieted what a cut leaves out; now the list shows only what matches. Rows that do
     not match are hidden; the phase, milestone and sprint headings that hold matches stay as context, each with a small count of what
     is hidden under it; headings with no match fold away; a plan's actions hide with their plan. The map still fades what is left out.
     The row at the pointer keeps its place while rows go and come back (with "Yours", Stop card 5 stays at the pointer); clearing the
     cut brings back the whole list the same way. Hiding and showing take the fold's timing; reduced motion snaps. ================= */
  (function () {
    var RM = REDUCED, OPEN = 320, CLOSE = 240, EASE = 'cubic-bezier(.2,.8,.2,1)';
    function list() { return document.getElementById('v13list'); }
    function centreY() { try { if (typeof ctCentre === 'function') return ctCentre().y; } catch (e) {}
      var b = document.getElementById('v13band'), t = b ? b.getBoundingClientRect().bottom : 0; return (t + window.innerHeight - 96) / 2; }
    function shown(e) { return e.offsetParent !== null; }
    /* the row level with the pointer: the smallest shown row whose box holds the centre line, else the nearest one */
    function anchor() { var L = list(); if (!L) return null; var y = centreY(), best = null, bd = 1e9;
      L.querySelectorAll('.v13ev, .v13gr, .ph-gate').forEach(function (e) { if (!shown(e)) return; var r = e.getBoundingClientRect(); if (!r.height) return;
        var d = y < r.top ? r.top - y : (y > r.bottom ? y - r.bottom : 0); if (d < bd || (d === 0 && bd === 0 && r.height < best.h)) { bd = d; best = { e: e, h: r.height }; } });
      return best && best.e; }
    var PIN = 0; ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (t) { window.addEventListener(t, function () { PIN++; }, { passive: true, capture: true }); });   /* a hand on the page ends the hold */
    function pin(el, y0, ms) { if (!el) return; var end = performance.now() + ms, my = ++PIN;
      (function step() { if (my !== PIN || !el.isConnected || !shown(el)) return; var dy = el.getBoundingClientRect().top - y0; if (Math.abs(dy) > .5) window.scrollBy(0, dy);
        if (performance.now() < end) requestAnimationFrame(step); })(); }
    function fold(e, hide) {
      var fresh = !e.__fh41seen; e.__fh41seen = true;   /* a row drawn anew takes its state at once; only a change moves */
      if (RM || fresh || !e.animate) { e.classList.toggle('fh41-hide', hide); return; }
      if (hide) { var h = e.getBoundingClientRect().height; e.style.overflow = 'hidden';
        var a = e.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: CLOSE, easing: EASE });
        a.onfinish = function () { e.classList.add('fh41-hide'); e.style.overflow = ''; }; }
      else { e.classList.remove('fh41-hide'); var h2 = e.getBoundingClientRect().height; e.style.overflow = 'hidden';
        var b = e.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: OPEN, easing: EASE });
        b.onfinish = function () { e.style.overflow = ''; }; } }
    /* a heading's block: the heading and what sits under it */
    function block(h) { return h.classList.contains('v13phh') ? h.closest('.v13phase') : h.parentElement; }
    window.__fh41 = function (on) {
      var L = list(); if (!L) return;
      var a = anchor();
      var y0 = a ? a.getBoundingClientRect().top : 0, changed = false;
      /* rows: hidden when left out, shown again when not */
      L.querySelectorAll('.v13ev, .v13step, .ph-gate').forEach(function (e) {
        if (e.parentElement && e.parentElement.closest('.v13step') && !e.classList.contains('v13step')) return;   /* a plan's own rows go with it */
        var out = on && e.classList.contains('fh-out'), was = e.classList.contains('fh41-hide') || e.__fh41h;
        if (out !== !!was || !e.__fh41seen) { var mv = out !== !!was; e.__fh41h = out; fold(e, out); if (mv) changed = true; } });
      /* headings: kept as context when they hold a match, with a count of what is hidden; folded away when they hold none */
      var hs = [].slice.call(L.querySelectorAll('.v13gr')).reverse();   /* innermost first */
      hs.forEach(function (h) { var bk = block(h); if (!bk) return;
        var rows = [].filter.call(bk.querySelectorAll('.v13ev, .v13step, .ph-gate'), function (e) { return e !== h && !(e.parentElement && e.parentElement.closest('.v13step') && !e.classList.contains('v13step')); });
        var hid = rows.filter(function (e) { return e.__fh41h; }).length, keep = rows.length - hid;
        var n = h.querySelector(':scope .fh41-n');
        if (on && hid) { if (!n) { n = document.createElement('span'); n.className = 'fh41-n'; (h.querySelector(':scope > .tx, :scope .ttl, :scope .t1') || h).appendChild(n); } var tx = hid + ' hidden'; if (n.textContent !== tx) n.textContent = tx; }
        else if (n) n.remove();
        var gone = !!(on && !keep);
        if (gone !== !!bk.__fh41g || !bk.__fh41seen) { var mv2 = gone !== !!bk.__fh41g; bk.__fh41g = gone; fold(bk, gone); if (mv2) changed = true; } });
      /* nothing open matches: say so, and how to see everything again */
      var any = [].some.call(L.querySelectorAll('.v13ev, .ph-gate'), function (e) { return !e.__fh41h && !(e.closest('.fh41-hide')); });
      var em = L.querySelector(':scope > .fh41-empty');
      if (on && !any) { var nm = (document.querySelector('.fh-fbtn') || {}).textContent || 'this cut'; nm = nm.replace(/\s*[×✕]\s*$/, '').trim() || 'this cut';
        var tx2 = 'Nothing open matches \u201c' + nm + '\u201d. What it would show sits in folded milestones; clear the cut to see everything.';
        if (!em) { em = document.createElement('p'); em.className = 'fh41-empty'; L.insertBefore(em, L.firstChild); } if (em.textContent !== tx2) em.textContent = tx2; }
      else if (em) em.remove();
      document.documentElement.classList.toggle('fh41-on', !!on);
      if (changed && a) pin(a, y0, (RM ? 0 : Math.max(OPEN, CLOSE)) + 80);
      try { if (typeof ctSoon === 'function') setTimeout(ctSoon, (RM ? 0 : OPEN) + 100); } catch (e) {}
    };
  })();
