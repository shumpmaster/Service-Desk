  /* Options for the owner's round 6, answers 11 and 12: "the design milestone is all over the place. This is where my brain gets
     thrown off." and "maybe the issue is that I’m picturing the fluid milestones as rigid fixed steps." A layer over order.js
     (ORD = 'A') and due.js (DUE_OPT = 'A') inside v25's script. FL = '1' | '2'. Milestones are outcomes that can run side by
     side, so the page stops numbering them as steps: no position numbers (2.1, 2.2.1, 2.2.2.5) on milestones, sprints, plans
     or the map; each goes by its name only. The list keeps the due-date order and the drag bars.
     1: names only, in due order, with the drag bar.
     2: as 1, and the phase's milestones also sit together at the top as its goals: a wrapping set of chips, each with its state
        and drag, in no implied order; tapping one goes to it in the list. */
  function flStrip(h) {
    return h.replace(/<span class="no">[\d.]+<\/span>/g, '')
            .replace(/(class="lb"[^>]*>)[\d.]+ /g, '$1')
            .replace(/(v13stephd"[\s\S]*?<b>)[\d.]+(<\/b>)/g, '$1Plan$2')
            .replace(/aria-label="Milestone [\d.]+, /g, 'aria-label="Milestone ');
  }
  var _list13Fl = list13; list13 = function () { return flStrip(_list13Fl.apply(this, arguments)); };
  var _mapSVGFl = mapSVG; mapSVG = function () { return flStrip(_mapSVGFl.apply(this, arguments)); };
  if (typeof chipHTML === 'function') { var _chipFl = chipHTML; chipHTML = function () { return _chipFl.apply(this, arguments).replace(/(<span>)[\d.]+ /, '$1'); }; }
  function flGoals() {
    if (FL !== '2') return;
    var L = document.getElementById('v13list'); if (!L || L.querySelector('.fl-goals')) return;
    var ph = L.querySelector('.v13phase.cur > .v13body'); if (!ph) return;
    var ms = [].slice.call(ph.querySelectorAll(':scope > .v13ms'));
    var g = document.createElement('div'); g.className = 'fl-goals';
    g.innerHTML = '<div class="fl-gh">The phase’s goals <span>· reached in any order, some side by side</span></div><div class="fl-gc">' + ms.map(function (m, j) {
      var id = (m.querySelector(':scope > button.v13gr .l1 b') || {}).textContent || '', i = duInfo(id), gauge = m.querySelector(':scope > button.v13gr .v13g');
      return '<button type="button" class="fl-chip" data-fl-go="' + j + '">' + (gauge ? gauge.outerHTML : '') + '<span class="fl-t"><b>' + esc(id) + '</b><span class="du-tag ' + (i ? i.st : '') + '">' + esc(i ? i.word : '') + '</span></span></button>';
    }).join('') + '</div>';
    ph.insertBefore(g, ph.firstChild);
  }
  window.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('[data-fl-go]'); if (!c) return;
    e.stopPropagation(); e.preventDefault();
    var m = document.querySelectorAll('#v13list .v13phase.cur > .v13body > .v13ms')[+c.dataset.flGo], band = document.getElementById('v13band');
    if (m) window.scrollTo({ top: m.getBoundingClientRect().top + scrollY - (band ? band.offsetHeight : 0) - 12, behavior: REDUCED ? 'auto' : 'smooth' });
  }, true);
  var _ord2FixFl = ord2Fix; ord2Fix = function () { _ord2FixFl.apply(this, arguments); flGoals(); };
