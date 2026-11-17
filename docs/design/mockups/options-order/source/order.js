  /* Options for the owner's view of v25 (round 6, answer 8): "The Phase reads top down, then the milestones read bottom up - that
     needs to be fixed". A layer over v25 inside its script. ORD = 'A' | 'B'. The list should read one way at every level.
     A: top down, oldest first, everywhere: under the phase, Design-1 first and the planned milestones last; in a sprint, its first
        event first and the planned ones last; a plan's actions from the first to the last. The page still opens on Now.
     B: newest first, everywhere: the order inside stays as it is, and each heading (phase, milestone, sprint) moves to the foot of
        what it holds, as its root, so every level reads upward from where it began. */
  function ordFix() {
    var L = document.getElementById('v13list'); if (!L) return;
    if (ORD === 'A') {
      [].slice.call(L.querySelectorAll('.v13body')).forEach(function (b) {
        var kids = [].slice.call(b.children), tail = kids.filter(function (c) { return c.classList.contains('v13unhide'); });
        kids.filter(function (c) { return tail.indexOf(c) < 0; }).reverse().concat(tail).forEach(function (c) { b.appendChild(c); });
      });
      [].slice.call(L.querySelectorAll('ol.v12plan')).forEach(function (o) { [].slice.call(o.children).reverse().forEach(function (c) { o.appendChild(c); }); });
    } else {
      [].slice.call(L.querySelectorAll('.v13phase, .v13ms, .v13sp')).forEach(function (s) {
        var h = s.querySelector(':scope > button.v13gr'), b = s.querySelector(':scope > .v13body');
        if (h && b) { s.appendChild(h); s.classList.add('ord-up'); }
      });
    }
    L.classList.add('ord-' + ORD);
  }
  var _renderProjectOrd = renderProject;
  renderProject = function () { var r = _renderProjectOrd.apply(this, arguments); ordFix(); return r; };
