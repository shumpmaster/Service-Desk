  /* The owner's round 7, answer 21: "Let's redesign the phase tiles to add more space for the text timeline at the bottom of the
     page. We can also get rid of the header on this page to get more space". A layer over answer 20's drawing. HB = 'A' | 'B'.
     Both: the project page's title bar goes; Back moves to the left of the project pills, and the bell (Needs you) and More to
     their right. The project's name stays in its lit pill; the live line is no longer shown.
     A: the four phase tiles become one slim capsule, each phase a small ring with its number and name on one line.
     B: the four become text tabs, the number and name with a thin progress line in its status colour under each; the phase in
        view has its line ringed. */
  document.documentElement.classList.add('hb', 'hb-' + HB);
  function hbFix() {
    var band = document.getElementById('v13band'); if (!band) return;
    var bar = band.querySelector('.hd-bar'), row = band.querySelector('.pl-row'); if (!bar || !row) return;
    var back = bar.querySelector('#back'), cap = bar.querySelector('.capsule');
    if (back && back.parentNode !== row) row.insertBefore(back, row.firstChild);
    if (cap && cap.parentNode !== row) row.appendChild(cap);
    if (HB === 'B') [].slice.call(band.querySelectorAll('.v13phases .v13ph')).forEach(function (p) {
      if (p.querySelector('.hb-bar')) return;
      var g = p.querySelector('.v13g'), st = g && /\b(ok|wait|bad)\b/.exec(g.className), a = g && g.querySelector('.arc');
      var pct = a ? Math.round(parseFloat(a.getAttribute('stroke-dasharray')) / (2 * Math.PI * 14) * 100) : 0;
      var nm = p.querySelector('.nm'), n = (p.querySelector('.pn') || {}).textContent || '';
      if (nm) nm.insertAdjacentHTML('afterbegin', '<span class="hb-no">' + n + '</span>');
      p.insertAdjacentHTML('beforeend', '<span class="hb-bar ' + (st ? st[1] : '') + '"><i style="width:' + pct + '%"></i></span>');
    });
  }
  var hbObs = new MutationObserver(function () { hbFix(); });
  var _renderProjectHb = renderProject;
  renderProject = function () { var r = _renderProjectHb.apply(this, arguments); hbFix(); var b = document.getElementById('v13band'); if (b) { hbObs.disconnect(); hbObs.observe(b, { childList: true, subtree: true }); } return r; };
