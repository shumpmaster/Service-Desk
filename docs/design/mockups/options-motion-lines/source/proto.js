
  /* ================= options: motion and branch lines =================
     Motion m0 is v10 as it is: the pen draws the plan from the top down while the page scrolls.
     m1: the whole plan fades in from the left at once, already centred on Now.
     m2: the same, but the rows ripple in, Now first and outwards.
     m3: the lines fade in from the left first, then the rows. */
  var OPT = { m: 'm1', l: 'l1' };
  var CURVES = {
    l0: { conn: 'M14.5 0 V18 Q14.5 34 30 34 H42', bo: 'M14.5 0 V8 Q14.5 22 30 22 H48.5 V34' },
    l1: { conn: 'M14.5 0 C14.5 26 24 34 49 34', bo: 'M14.5 0 C14.5 20 48 14 48 34' },
    l2: { conn: 'M14.5 0 C14.5 26 24 34 47 34', bo: 'M14.5 0 C14.5 20 48 14 48 34' },
    l3: { conn: 'M14.5 0 C14.5 26 24 34 49 34', bo: 'M14.5 0 C14.5 20 48 14 48 34' }
  };
  function applyOpt() {
    document.body.classList.remove('m0', 'm1', 'm2', 'm3', 'l0', 'l1', 'l2', 'l3');
    document.body.classList.add(OPT.m, OPT.l);
    var c = CURVES[OPT.l];
    document.querySelectorAll('.proj svg.conn path').forEach(function (p) { p.setAttribute('d', c.conn); });
    var bo = document.getElementById('bo-path'); if (bo) bo.setAttribute('d', c.bo);
  }
  function readHash() {
    var h = (location.hash || '').slice(1).split('-');
    h.forEach(function (x) { if (/^m[0-3]$/.test(x)) OPT.m = x; if (/^l[0-3]$/.test(x)) OPT.l = x; });
  }
  readHash();
  var _renderDesk = renderDesk, _renderProject = renderProject, _open = openProject, _close = closeProject, _step = step;
  renderDesk = function () { _renderDesk.apply(this, arguments); applyOpt(); };
  renderProject = function () { _renderProject.apply(this, arguments); applyOpt(); };

  /* lay the plan out complete, at once, with Now in the middle of the screen */
  function settle() {
    items().forEach(function (r) { r.style.opacity = ''; });
    var pm = document.getElementById('pmain'), pb = document.getElementById('pbr');
    pm.style.bottom = '0'; pm.style.height = 'auto'; pb.style.bottom = '0'; pb.style.height = 'auto';
    var bo = document.getElementById('bo-path'); if (bo) { bo.style.strokeDasharray = ''; bo.style.strokeDashoffset = ''; }
    layoutCut();
    var now = document.querySelector('#ptl .pl.now');
    if (now) now.scrollIntoView({ behavior: 'auto', block: 'center' });
  }
  var FROM = { opacity: 0, transform: 'translateX(-16px)' }, TO = { opacity: 1, transform: 'none' }, EASE = 'cubic-bezier(.2,.7,.2,1)';
  function inView(el) { var r = el.getBoundingClientRect(); return r.bottom > -40 && r.top < window.innerHeight + 40; }
  function fadeIn() {
    var top = Array.prototype.slice.call(document.querySelectorAll('#view > header, #view .branchoff, #view .chips'));
    var lines = Array.prototype.slice.call(document.querySelectorAll('#ptl > .faint, #ptl > .pmain, #ptl > .pfut, #ptl > .pbr'));
    var rows = items().filter(inView);
    if (REDUCED) return Promise.resolve();
    if (OPT.m === 'm1') {
      return Promise.all(top.concat([document.getElementById('ptl')]).map(function (el) { return anim(el, [FROM, TO], { duration: 280, easing: EASE }); }));
    }
    if (OPT.m === 'm2') {
      var now = document.querySelector('#ptl .pl.now'), ni = Math.max(0, rows.indexOf(now));
      rows.forEach(function (r) { r.style.opacity = '0'; });
      var ps = top.concat(lines).map(function (el) { return anim(el, [FROM, TO], { duration: 240, easing: EASE }); });
      rows.forEach(function (r, i) {
        var d = Math.abs(i - ni) * 22;
        ps.push(anim(r, [FROM, TO], { duration: 240, delay: d, easing: EASE, fill: 'backwards' }).then(function () { r.style.opacity = ''; }));
        r.style.opacity = '';
      });
      return Promise.all(ps);
    }
    /* m3: lines first, then the rows */
    rows.forEach(function (r) { r.style.opacity = '0'; });
    return Promise.all(top.concat(lines).map(function (el) { return anim(el, [FROM, TO], { duration: 200, easing: EASE }); })).then(function () {
      return Promise.all(rows.map(function (r) { r.style.opacity = ''; return anim(r, [FROM, TO], { duration: 240, easing: EASE }); }));
    });
  }
  openProject = function (id) {
    if (OPT.m === 'm0') return _open(id);
    if (busy) return; busy = true;
    var view = document.getElementById('view');
    anim(view, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }).then(function () {
      state.view = 'proj'; state.proj = id;
      renderProject(id, false); settle();
      view.getAnimations().forEach(function (a) { a.cancel(); });
      return fadeIn();
    }).then(function () { var now = document.querySelector('#ptl .pl.now'); if (now) { now.classList.remove('flash'); void now.offsetWidth; now.classList.add('flash'); } busy = false; });
  };
  closeProject = function () {
    if (OPT.m === 'm0') return _close();
    if (busy) return; busy = true;
    var view = document.getElementById('view');
    anim(view, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-16px)' }], { duration: 160, easing: 'ease-in', fill: 'forwards' }).then(function () {
      state.view = 'desk'; state.proj = null; renderDesk(); window.scrollTo(0, 0);
      view.getAnimations().forEach(function (a) { a.cancel(); });
      return anim(view, [FROM, TO], { duration: 260, easing: EASE });
    }).then(function () { busy = false; });
  };
  step = function (dir, target) {
    if (OPT.m === 'm0') return _step(dir, target);
    if (busy || state.view !== 'proj') return; busy = true;
    var o = order(), i = o.map(function (p) { return p.id; }).indexOf(state.proj), next = target || o[(i + dir + o.length) % o.length].id;
    var view = document.getElementById('view');
    anim(view, [{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }).then(function () {
      state.proj = next; renderProject(next, false); settle();
      view.getAnimations().forEach(function (a) { a.cancel(); });
      return fadeIn();
    }).then(function () { busy = false; });
  };

  /* the playground's switcher */
  if (window.OPT_BAR) {
    var bar = document.createElement('div'); bar.className = 'optbar';
    bar.innerHTML = '<label>Motion <select id="opt-m"><option value="m0">Now (v10)</option><option value="m1">1 all at once</option><option value="m2">2 ripple</option><option value="m3">3 lines first</option></select></label>' +
      '<label>Lines <select id="opt-l"><option value="l0">Now (v10)</option><option value="l1">1 hairline</option><option value="l2">2 soft rail</option><option value="l3">3 no connectors</option></select></label>';
    document.body.appendChild(bar);
    var sm = bar.querySelector('#opt-m'), sl = bar.querySelector('#opt-l');
    sm.value = OPT.m; sl.value = OPT.l;
    sm.addEventListener('change', function () { OPT.m = sm.value; applyOpt(); });
    sl.addEventListener('change', function () { OPT.l = sl.value; applyOpt(); });
  }
