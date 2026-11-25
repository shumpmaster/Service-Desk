  /* The owner's round 7, answer 20: "I'm okay with the taller phase map, but maybe we scale it to fit the details in a little bit
     better? ... the original problem I wanted fixed was actually the disappearing of phases when you click around. I want every
     phase, milestone combination shown on the table, I just want the ones we aren't looking at collapsed". A layer over v30.
     Every phase and gate stays in the list, top down, each phase with all its milestones, folded unless opened (the one in progress
     opens when the page does). Tapping 1, 2, 3 or 4 scrolls to that phase where it sits and opens it if folded; nothing is swapped
     out. The phase pill that is lit, and the whole-phase map, follow the phase at the fixed centre. The map gives each sprint its
     own lane, a little further apart. */
  state.viewB = {};
  function viewB() { var v = state.viewB[state.proj]; return v === undefined ? curB() : v; }
  function gate13(b) {
    var blk = PLANS[state.proj][b], st = blk.st === 'done' ? 'ok' : '';
    return '<div class="ph-gate ' + st + '" data-b="' + b + '"><span class="gd" aria-hidden="true"></span><span class="gt"><b>' + esc(blk.name) + '</b> · ' + esc(blk.note || '') + '</span></div>';
  }
  function phInView() {
    var L = document.getElementById('v13list'); if (!L) return null;
    var c = ctCentre(), hit = null;
    [].slice.call(L.querySelectorAll('.v13phase')).forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= c.y) hit = s; });
    return hit ? +hit.dataset.b : null;
  }
  /* a standard milestone's own id (Discovery-2) stays hidden in every phase, as in Design (round 6, answer 14) */
  function phIds() {
    [].slice.call(document.querySelectorAll('#v13list .v13ms > .v13gr .l1 b')).forEach(function (bb) { if (/^(Discovery|Design|Build|Launch)-\d+$/.test(bb.textContent)) bb.classList.add('du-hid'); });
  }
  var phObs2 = new MutationObserver(function () { phIds(); });
  function phLook() {
    if (!v13on() || state.cx) return;
    var b = phInView(); if (b === null) return;
    [].slice.call(document.querySelectorAll('.v13phases .v13ph')).forEach(function (p) { p.classList.toggle('lk', +p.dataset.b === b); });
    if (b !== viewB() && PLANS[state.proj][b].items.some(function (it) { return it.sprints; })) {
      state.viewB[state.proj] = b; MAP = mapData(); drawMap(); v13sync(false);
    }
  }
  var phRaf = 0;
  window.addEventListener('scroll', function () { if (!phRaf) phRaf = requestAnimationFrame(function () { phRaf = 0; phLook(); }); }, { passive: true });
  var _renderProjectPh2 = renderProject;
  renderProject = function () { var r = _renderProjectPh2.apply(this, arguments); phIds(); var L = document.getElementById('v13list'); if (L) { phObs2.disconnect(); phObs2.observe(L, { childList: true, subtree: true }); } setTimeout(phLook, 80); return r; };
  /* 1, 2, 3, 4: go to the phase where it sits, opening it if folded */
  window.addEventListener('click', function (e) {
    if (!v13on()) return;
    var p = e.target.closest('.v13phases [data-v13phase]'); if (!p) return;
    e.stopImmediatePropagation(); e.preventDefault();
    var b = +p.dataset.b, sk = fk('ph:' + b) + ':shut';
    if (state.open[sk]) { state.open[sk] = false; relist(); }
    var sec = document.querySelector('#v13list .v13phase[data-b="' + b + '"]'); if (!sec) return;
    var y = sec.getBoundingClientRect().top + window.scrollY - bandH() - 6;
    (window.scrollTo).call(window, { top: Math.max(0, y), behavior: REDUCED ? 'auto' : 'smooth' });
  }, true);
  /* the map's words come first: a sprint's name that would sit on an event's words steps aside while they are there */
  function phClear() {
    var inn = document.getElementById('v13in'); if (!inn) return;
    var words = [].slice.call(inn.querySelectorAll('text.fl')).map(function (t) { return t.getBoundingClientRect(); }).filter(function (r) { return r.width; });
    [].slice.call(inn.querySelectorAll('text.lb')).forEach(function (t) {
      t.style.opacity = ''; var a = t.getBoundingClientRect();
      var hit = words.some(function (w) { return a.left < w.right + 2 && a.right > w.left - 2 && a.top < w.bottom && a.bottom > w.top; });
      t.style.opacity = hit ? '0' : '';
    });
  }
  var _v13syncPh2 = v13sync; v13sync = function () { var r = _v13syncPh2.apply(this, arguments); phClear(); return r; };
  var _drawMapPh2 = drawMap; drawMap = function () { var r = _drawMapPh2.apply(this, arguments); phClear(); return r; };
