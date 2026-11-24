  /* The owner's round 7, answer 9: "I’m more inclined towards the rails, with a label of some sort and a more subtle & modern icon
     set with proper indentation and text sizing". A layer over v27 inside its script. RL = '1' | '2'. Rails: each level hangs an
     even 20 in from its parent on a rail through the parent's mark; a small capital word names the phase, milestone and sprint; one
     size per level; thinner, smaller rings. 1: events keep their kind's icon, drawn thin with no disc. 2: an event is a status dot
     on its sprint's rail, its kind word the label. Order and everything else as in v27. */
  document.documentElement.classList.add('rl', 'rl-' + RL);
  function rlWords() {
    var L = document.getElementById('v13list'); if (!L) return;
    [].slice.call(L.querySelectorAll('.v13phh .l1, .v13ms > .v13gr .l1, .v13sp > .v13gr .l1')).forEach(function (l) {
      if (l.querySelector('.lv-w')) return;
      var w = l.closest('.v13phh') ? 'Phase' : l.closest('.v13sp') ? 'Sprint' : 'Milestone';
      l.insertAdjacentHTML('afterbegin', '<span class="lv-w">' + w + '</span>');
    });
  }
  var rlObs = new MutationObserver(function () { rlWords(); });
  var _renderProjectRl = renderProject;
  renderProject = function () { var r = _renderProjectRl.apply(this, arguments); rlWords(); var L = document.getElementById('v13list'); if (L) { rlObs.disconnect(); rlObs.observe(L, { childList: true, subtree: true }); } return r; };
