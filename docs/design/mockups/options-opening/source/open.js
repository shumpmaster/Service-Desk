(function () {
  /* A: a pinned phase opens in place and stops being pinned */
  document.querySelectorAll('.pbh').forEach(function (b) {
    b.addEventListener('click', function () { var p = b.parentNode, on = !p.classList.contains('open'); p.classList.toggle('open', on); b.setAttribute('aria-expanded', String(on)); });
  });
  /* B: a phase in the row opens its milestones above the current phase */
  document.querySelectorAll('.pchip').forEach(function (c) {
    c.addEventListener('click', function () {
      if (c.classList.contains('on')) return;
      var scr = c.closest('.scr'), x = scr.querySelector('.xph[data-ph="' + c.dataset.ph + '"]'), on = x.hidden;
      x.hidden = !on; c.classList.toggle('x', on);
      if (on) scr.scrollTop = x.offsetTop - scr.querySelector('.mapbar').offsetHeight;
    });
  });
  /* both open on the current step: S-011's newest event under the map */
  document.querySelectorAll('.scr').forEach(function (s) { var n = s.querySelector('.nowcard'); s.scrollTop = n.offsetTop - s.querySelector('.mapbar').offsetHeight - (s.querySelector('.pbar.t2') ? 96 : 8); });
})();
