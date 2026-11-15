(function () {
  function set(sec, on) { sec.classList.toggle('open', on); var t = sec.querySelector(':scope > .hdrow .tog'); if (t) t.setAttribute('aria-expanded', String(on)); }
  /* C: siblings of the open section are hidden and summed up in one line */
  function summarise(parent) {
    var secs = [].slice.call(parent.children).filter(function (e) { return e.classList.contains('sec'); });
    var old = parent.querySelector(':scope > .sum'); if (old) old.remove();
    var open = secs.filter(function (s) { return s.classList.contains('open'); });
    secs.forEach(function (s) { s.classList.toggle('hid', open.length > 0 && !s.classList.contains('open')); });
    var hidden = secs.filter(function (s) { return s.classList.contains('hid'); }).length;
    if (open.length && hidden) {
      var d = document.createElement('div'); d.className = 'sum'; var lv = +(secs[0].className.match(/lv(\d)/) || [0, 2])[1], nouns = [, 'phase', 'milestone', 'sprint', 'step'];
      d.textContent = hidden + ' more ' + nouns[lv] + (hidden > 1 ? 's' : '') + ' here'; d.tabIndex = 0;
      d.onclick = function () { secs.forEach(function (s) { set(s, false); }); summarise(parent); };
      parent.appendChild(d);
    }
  }
  document.querySelectorAll('.phone').forEach(function (ph) {
    var mode = ph.dataset.mode;
    if (mode === 'c') ph.querySelectorAll('.sec').forEach(function (s) { summarise(s.parentNode); });
    ph.addEventListener('click', function (e) {
      var hit = mode === 'b' ? e.target.closest('.hdrow') : e.target.closest('.tog');
      if (!hit) return;
      var sec = hit.closest('.sec'), on = !sec.classList.contains('open');
      if (mode === 'c' && on) [].slice.call(sec.parentNode.children).forEach(function (s) { if (s !== sec && s.classList && s.classList.contains('sec')) set(s, false); });
      set(sec, on);
      if (mode === 'c') summarise(sec.parentNode);
    });
  });
})();
