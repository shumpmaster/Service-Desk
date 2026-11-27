  /* ================= round 8, answer 31: a summary of what the project is about and a snapshot of the bigger picture (options over v45;
     decisions/questions/P-005-design-round-8.md). The phone's hash, tokens joined by dots: sm=A|B|C (the option; none = v45 as it is);
     at=top (the list scrolled to its top) or land (where the page lands, on Stop card 5); sheet (the summary sheet open); more (A's card opened);
     menu (B's project menu open); light or dark (set by the theme script). The words are written from the page and status/P-005.toml at the
     mockup's moment; they are examples: no record holds a project's purpose or a snapshot yet. ================= */
  var SM = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.'), t = {};
    h.forEach(function (x) { var i = x.indexOf('='); if (i > 0) t[x.slice(0, i)] = x.slice(i + 1); else if (x) t[x] = '1'; });
    var o = t.sm || ''; if (o) document.documentElement.classList.add('sm-on', 'sm-' + o);
    return { o: o, at: t.at || 'land', sheet: !!t.sheet, more: !!t.more, menu: !!t.menu };
  })();
  var SMT = {
    name: 'The timeline',
    purpose: 'One timeline of everything the AI team does, on your phone.',
    line: 'Design · the records plan stopped · your call',
    snap: ['It is in Design, the second of four phases: 1 of its 7 milestones is reached.',
           'The AI team is writing the plan for changing the records, so the desk can draw every event from what really happened (the second plan, S-011).',
           'That plan failed its third check, so the work has stopped and waits on your decision.',
           'Once a plan passes, the Build gate is yours; then the timeline itself is built, and after it, what needs you reaching your phone first.'],
    phases: [['ok', 'Discovery', 'Done 13 Nov · 3 of 8 milestones reached'], ['bad', 'Design', 'Now · 1 of 7 reached · stopped, your decision'],
             ['', 'Build', 'Planned · 9 milestones'], ['', 'Launch', 'Planned · it goes live']],
    wait: ['Work stopped: the plan failed its third check', 'Holds up the records, one timeline, what needs you first · waiting 1 h 43 min'],
    by: 'An example. In the desk this would be written from the records: the purpose once, when the project starts; the snapshot at each step that changes where it stands.'
  };
  function smTag() { return '<span class="sm-ex">Example</span>'; }
  function smSheet() {
    if (typeof knClose === 'function') knClose();
    var h = '<div class="kd">About this project</div><h2>' + esc(SMT.name) + '</h2><p class="sm-pur">' + esc(SMT.purpose) + ' ' + smTag() + '</p>' +
      '<h3>Where it stands</h3>' + SMT.snap.map(function (s) { return '<p>' + esc(s) + '</p>'; }).join('') +
      '<h3>Its phases</h3><ul class="ck">' + SMT.phases.map(function (p) { return '<li><span class="m ' + p[0] + '"></span><span>' + esc(p[1]) + '<small>' + esc(p[2]) + '</small></span></li>'; }).join('') + '</ul>' +
      '<h3>What waits on you</h3><ul class="ck"><li><span class="m wait"></span><span>' + esc(SMT.wait[0]) + '<small>' + esc(SMT.wait[1]) + '</small></span></li></ul>' +
      '<div class="sm-acts"><button type="button" class="sm-go" data-sm="stop">Choose what happens next</button></div>' +
      '<p class="ex">' + esc(SMT.by) + '</p>';
    var scrim = document.createElement('div'), sheet = document.createElement('div');
    scrim.className = 'kn-scrim'; sheet.className = 'kn-sheet sm-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'About this project');
    sheet.innerHTML = '<div class="grab" aria-hidden="true"></div><button type="button" class="x" aria-label="Close"><span>' + KNI.x + '</span></button>' + h;
    document.body.appendChild(scrim); document.body.appendChild(sheet); knSheetEl = { scrim: scrim, sheet: sheet };
    scrim.addEventListener('click', knClose); sheet.querySelector('.x').addEventListener('click', knClose);
    sheet.querySelector('[data-sm="stop"]').addEventListener('click', function () { knOpen('s:Stop card 5'); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { scrim.classList.add('on'); sheet.classList.add('on'); }); });
  }
  function smCard() {
    var list = document.getElementById('v13list'); if (!list || list.querySelector('.sm-card')) return;
    var c = document.createElement('div'); c.className = 'sm-card' + (SM.more ? ' open' : '');
    c.innerHTML = '<div class="sm-cap">About this project ' + smTag() + '</div><p class="sm-pur">' + esc(SMT.purpose) + '</p>' +
      '<p class="sm-snap">' + esc(SMT.snap[0]) + ' ' + esc(SMT.snap[2]) + '</p>' +
      '<div class="sm-more-tx">' + '<p class="sm-snap">' + esc(SMT.snap[1]) + '</p><p class="sm-snap">' + esc(SMT.snap[3]) + '</p></div>' +
      '<button type="button" class="sm-more" aria-expanded="' + (SM.more ? 'true' : 'false') + '">' + (SM.more ? 'Less' : 'More') + '</button>';
    list.insertBefore(c, list.firstChild);
    c.querySelector('.sm-more').addEventListener('click', function (e) { e.stopPropagation(); var on = c.classList.toggle('open'); this.textContent = on ? 'Less' : 'More'; this.setAttribute('aria-expanded', on ? 'true' : 'false'); });
  }
  function smLine() {
    var vp = document.querySelector('#v13band .v13vp'); if (!vp || vp.querySelector('.sm-line')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sm-line'; b.setAttribute('aria-label', 'About this project: ' + SMT.line + '. Open the summary');
    b.innerHTML = '<span class="sm-dot"></span><span class="sm-lt">' + esc(SMT.line) + '</span><span class="sm-chev" aria-hidden="true">›</span>';
    vp.insertBefore(b, vp.firstChild);
    b.addEventListener('click', function (e) { e.stopPropagation(); smSheet(); });
  }
  function smMenu() {
    var m = [].slice.call(document.querySelectorAll('.menu.tp-menu')).filter(function (x) { return x.querySelector('[data-goto="tl"]') && !x.querySelector('.sm-about'); })[0];
    if (!m) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'mi sm-about';
    b.innerHTML = '<span>About this project<span class="sm-sub">' + esc(SMT.line) + '</span></span><span class="sm-i" aria-hidden="true">i</span>';
    m.insertBefore(b, m.firstChild);
    b.addEventListener('click', function (e) { e.stopPropagation(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); setTimeout(smSheet, 60); });
  }
  function smOnProject() { return typeof state !== 'undefined' && state.proj === 'tl' && document.getElementById('v13list'); }
  function smTick() {
    if (!SM.o || !smOnProject()) return;
    if (SM.o === 'A') smCard();
    if (SM.o === 'C') smLine();
    if (SM.o === 'B') smMenu();
  }
  setInterval(smTick, 300);
  (function smStart() {
    if (!SM.o && SM.at === 'land') { }
    var go = function () { var r = [].slice.call(document.querySelectorAll('.pr-row')).filter(function (x) { return /The timeline/.test(x.textContent); })[0];
      var g = r && r.querySelector('.pr-goto'); if (g) g.click(); };
    setTimeout(function () {
      go();
      setTimeout(function () {
        smTick();
        if (SM.at === 'top') { var l = document.getElementById('v13list'); window.scrollTo(0, 0); if (l) { var band = document.getElementById('v13band'); var bb = band ? band.getBoundingClientRect().bottom : 0; window.scrollTo(0, Math.max(0, l.getBoundingClientRect().top + scrollY - bb - 8)); } }
        if (SM.menu) { var pj = document.querySelector('.tp-pill.pj'); if (pj) pj.click(); setTimeout(smTick, 120); }
        if (SM.sheet) setTimeout(smSheet, 250);
      }, REDUCED ? 400 : 1800);
    }, 500);
  })();
