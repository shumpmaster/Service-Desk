  /* ================= v43: "Go to it" on home's priority list opens the project with that event at the pointer
     (round 8, answer 24: "a priority list for my actions"; the event is the one its line names, e.g. "Stop 2.2.2.10 · Stop card 5 · S-011") ================= */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.pr-row [data-pra="go"]'); if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var row = b.closest('.pr-row'), n = NEEDS[+row.dataset.prk], ev = row.querySelector('.ev41');
    var seg = ev ? ev.textContent.split('·').map(function (x) { return x.trim(); }) : [], name = seg[1] || n.title;
    var g = document.querySelector('.sg-row[data-sgp="' + n.p + '"]'); if (!g) return; g.click();
    var t0 = Date.now(), wait = REDUCED ? 300 : 1300;
    (function find() {
      var el = Date.now() - t0 >= wait ? ppFind(name) : null;
      if (el) { ppCentre(el); return; }
      if (Date.now() - t0 < 4000) setTimeout(find, 120);
    })();
  }, true);
