  /* The owner's round 7, answer 10, on rails option 1: "For the phase, let’s push the text left aligned, get rid of the progress
     circle and replace it with a milestone indicator, the boxes side by with status color and a current milestone indication as
     well. Then on all of the remainigg by progress circles keep them, but put the percent complete in the circle." A layer over the
     rails (RL = '1'). The phase heading loses its ring and starts at the left; under it, one box per milestone in the list's order,
     tinted by its status (soft green reached, yellow under way, red stopped, outlined planned), a blue tick where Now sits, and the
     current milestone (the one the map is fitted to, else the one in progress) raised and ringed with its number under it. Tap a
     box to go to its milestone. Every milestone and sprint ring keeps its arc and shows its percent complete inside. */
  document.documentElement.classList.add('ph');
  var PH_C = 2 * Math.PI * 14;
  function phFix() {
    var L = document.getElementById('v13list'); if (!L) return;
    [].slice.call(L.querySelectorAll('.v13ms > .v13gr .v13g, .v13sp > .v13gr .v13g')).forEach(function (g) {
      var inn = g.querySelector('.in'); if (!inn || inn.classList.contains('ph-pc')) return;
      var a = g.querySelector('.arc'), pct = a ? Math.round(parseFloat(a.getAttribute('stroke-dasharray')) / PH_C * 100) : 0;
      inn.classList.add('ph-pc'); inn.textContent = String(pct); g.setAttribute('aria-label', pct + ' percent complete');
    });
    [].slice.call(L.querySelectorAll('.v13phase')).forEach(function (ph) {
      var hd = ph.querySelector(':scope > .v13phh'); if (!hd || hd.querySelector('.ph-strip')) return;
      var body = ph.querySelector(':scope > .v13body'); if (!body) return;
      var cur = fitKey(), h = '', any = false;
      if (!cur) { var plan = PLANS[state.proj]; plan.forEach(function (blk, b) { (blk.items || []).forEach(function (it, i) { if (!cur && it.st === 'progress') cur = b + ':' + i; }); }); }
      [].slice.call(body.children).forEach(function (c) {
        if (c.classList.contains('v13now')) { h += '<span class="now" aria-label="Now"></span>'; return; }
        var bt = c.classList.contains('v13ms') && c.querySelector(':scope > button[data-v13fold^="it:"]'); if (!bt) return;
        var g = bt.querySelector('.v13g'), st = g && /\b(ok|wait|bad)\b/.exec(g.className), k = bt.dataset.v13fold.slice(3), no = (bt.querySelector('.no') || {}).textContent || '';
        var isCur = k === cur; any = any || isCur;
        h += '<span class="b ' + (st ? st[1] : '') + (isCur ? ' cur' : '') + '" data-no="' + esc(no) + '" data-phgo="' + esc(bt.dataset.v13fold) + '" role="button" tabindex="0" aria-label="Milestone ' + esc(no) + (isCur ? ', current' : '') + '"></span>';
      });
      if (h) hd.insertAdjacentHTML('beforeend', '<span class="ph-strip' + (any ? ' has-cur' : '') + '" aria-label="Milestones">' + h + '</span>');
    });
  }
  window.addEventListener('click', function (e) {
    var b = e.target.closest('[data-phgo]'); if (!b) return;
    e.stopImmediatePropagation(); e.preventDefault();
    var t = document.querySelector('#v13list button[data-v13fold="' + b.dataset.phgo + '"]'); if (!t) return;
    var band = document.getElementById('v13band'), top = band ? band.getBoundingClientRect().height : 0;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - top - 12, behavior: REDUCED ? 'auto' : 'smooth' });
  }, true);
  var phObs = new MutationObserver(function () { phFix(); });
  var _renderProjectPh = renderProject;
  renderProject = function () { var r = _renderProjectPh.apply(this, arguments); phFix(); var L = document.getElementById('v13list'); if (L) { phObs.disconnect(); phObs.observe(L, { childList: true, subtree: true }); } return r; };
