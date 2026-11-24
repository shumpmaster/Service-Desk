  /* The owner's round 7, answer 8: "I want a better visual delineation on the different hierarchy elements". A layer over v27
     inside its script. LV = 'A' | 'B' | 'C', set as a class on the page; A and C also put the level's name in small capitals
     before a milestone's and a sprint's number. The order (top down) and everything else stay as in v27.
     A: rails. B: cards. C: type and labels. */
  document.documentElement.classList.add('lv-' + LV);
  function lvWords() {
    if (LV === 'B') return;
    var L = document.getElementById('v13list'); if (!L) return;
    [].slice.call(L.querySelectorAll('.v13ms > .v13gr .l1, .v13sp > .v13gr .l1')).forEach(function (l) {
      if (l.querySelector('.lv-w')) return;
      var w = l.closest('.v13sp') ? 'Sprint' : 'Milestone';
      l.insertAdjacentHTML('afterbegin', '<span class="lv-w">' + w + '</span>');
    });
  }
  var lvObs = new MutationObserver(function () { lvWords(); });
  var _renderProjectLv = renderProject;
  renderProject = function () { var r = _renderProjectLv.apply(this, arguments); lvWords(); var L = document.getElementById('v13list'); if (L) { lvObs.disconnect(); lvObs.observe(L, { childList: true, subtree: true }); } return r; };
