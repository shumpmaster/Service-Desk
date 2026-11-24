  /* The owner's round 7, answer 12: "I want the text and lines pushed a little bit more to the left ... Then for the sprint progress
     bars let’s replace them with thin accent bars that are Red Yello or green and attach a square progress indicator ... just make
     sure it’s color coded. And last thing whenever something is expanded or collapsed don’t let the whole screen move around with
     it." A layer over the revised rails (ph). The page's margins and the indents shrink; a sprint's ring gives way to a thin accent
     bar in its status colour, which carries on down as the sprint's rail, and a small rounded square that fills clockwise with its
     percent, in the same colour; folding or opening anything keeps the tapped row exactly where it was on the screen. */
  document.documentElement.classList.add('fin');
  function finFix() {
    var L = document.getElementById('v13list'); if (!L) return;
    [].slice.call(L.querySelectorAll('.v13sp > .v13gr')).forEach(function (bt) {
      if (bt.querySelector('.fin-sq')) return;
      var g = bt.querySelector('.v13g'); if (!g) return;
      var st = (/\b(ok|wait|bad)\b/.exec(g.className) || ['', ''])[1], a = g.querySelector('.arc');
      var pct = a ? Math.round(parseFloat(a.getAttribute('stroke-dasharray')) / (2 * Math.PI * 14) * 100) : 0;
      bt.closest('.v13sp').classList.add('fin-' + (st || 'none'));
      g.insertAdjacentHTML('beforebegin', '<span class="fin-acc ' + st + '" aria-hidden="true"></span><span class="fin-sq ' + st + '" aria-label="' + pct + ' percent complete">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="trk" x="2" y="2" width="20" height="20" rx="5"/>' +
        (pct ? '<rect class="arc" x="2" y="2" width="20" height="20" rx="5" pathLength="100" stroke-dasharray="' + pct + ' 100" transform="rotate(90 12 12) scale(-1 1) translate(-24 0)"/>' : '') +
        '</svg><b>' + pct + '</b></span>');
    });
  }
  var finObs = new MutationObserver(function () { finFix(); });
  var _renderProjectFin = renderProject;
  renderProject = function () { var r = _renderProjectFin.apply(this, arguments); finFix(); var L = document.getElementById('v13list'); if (L) { finObs.disconnect(); finObs.observe(L, { childList: true, subtree: true }); } return r; };
  /* nothing moves on a fold: for a moment after the tap, other scrolling is held, and the tapped row is put back where it was */
  var finPin = null, finScrollTo = window.scrollTo.bind(window), finScrollBy = window.scrollBy.bind(window), finSIV = Element.prototype.scrollIntoView;
  window.scrollTo = function () { if (finPin) return; return finScrollTo.apply(window, arguments); };
  window.scrollBy = function () { if (finPin) return; return finScrollBy.apply(window, arguments); };
  Element.prototype.scrollIntoView = function () { if (finPin) return; return finSIV.apply(this, arguments); };
  function finHold() {
    if (!finPin) return;
    var el = document.querySelector('#v13list [data-v13fold="' + finPin.k + '"]'); if (!el) return;
    var d = el.getBoundingClientRect().top - finPin.y; if (Math.abs(d) > 0.5) finScrollBy(0, d);
  }
  window.addEventListener('click', function (e) {
    var t = e.target.closest('#v13list [data-v13fold]'); if (!t) return;
    finPin = { k: t.dataset.v13fold, y: t.getBoundingClientRect().top };
    [0, 16, 60, 150, 300, 500, 750].forEach(function (ms) { setTimeout(finHold, ms); });
    requestAnimationFrame(finHold);
    setTimeout(function () { finHold(); finPin = null; }, 800);
  }, true);
