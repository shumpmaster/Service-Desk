  /* ================= v36: what serves no purpose, and what is missing (round 8, answers 10 and 12; decisions/questions/P-005-design-round-8.md)
     Option A of each of the eight items drawn on options-r8-purpose/, from its own code (pp.js), fixed to A:
     1 each count said once; 2 the usual actor's "by" line dropped; 3 no Now card, a NOW tag on the stop; 4 the pill's count opens what waits;
     5 an At work now row; 6 new since you last looked; 7 how long each wait lasted, on its row; 8 tokens and context in the session bubble.
     Facts are from the records named on the options page; the "last looked" time and the context meter are examples. ================= */
  var PPA = { '1A': 1, '2A': 1, '3A': 1, '4A': 1, '5A': 1, '6A': 1, '7A': 1, '8A': 1 };
  ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A'].forEach(function (k) { document.documentElement.classList.add('ppo-' + k); });
  var PPI = {
    stop: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M188,48a27.75,27.75,0,0,0-12,2.71V44a28,28,0,0,0-54.65-8.6A28,28,0,0,0,80,60v64l-3.82-6.13a28,28,0,0,0-48.6,27.82c16,33.77,28.93,57.72,43.72,72.69C86.24,233.54,103.2,240,128,240a88.1,88.1,0,0,0,88-88V76A28,28,0,0,0,188,48Zm12,104a72.08,72.08,0,0,1-72,72c-20.38,0-33.51-4.88-45.33-16.85C69.44,193.74,57.26,171,41.9,138.58a6.36,6.36,0,0,1-.3-.58,12,12,0,0,1,20.79-12,1.76,1.76,0,0,0,.14.23l18.67,30A8,8,0,0,0,96,152V60a12,12,0,0,1,24,0v60a8,8,0,0,0,16,0V44a12,12,0,0,1,24,0v76a8,8,0,0,0,16,0V76a12,12,0,0,1,24,0Z"/></svg>',
    q: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>',
    clock: '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/></svg>',
    x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>'
  };
  /* ---------- the records behind the options ---------- */
  var PPW = [ /* what waits on you in this project, from status/P-005.toml, decisions/P-005/stop-5-notes.md and the questions of PR #446 */
    { k: 'stop', t: 'Stop card 5: S-011 failed three plan reviews. What happens next?', holds: 'M6, M7, M8', since: '9:42 am', w: '1 h 43 min', go: 'Stop card 5', ans: 's:Stop card 5' },
    { k: 'q', t: 'Which phone widths must the timeline fit?', holds: 'M7, M8', since: '8:46 am', w: '2 h 39 min', go: 'Merged PR #446' },
    { k: 'q', t: 'Is the spec’s reading of “each thing reaches my phone” enough for M8?', holds: 'M8', since: '8:46 am', w: '2 h 39 min', go: 'Merged PR #446' },
    { k: 'q', t: 'Let the spec writer see the experiment files and your answers?', holds: 'M6, M7, M8', since: '8:46 am', w: '2 h 39 min', go: 'Merged PR #446' } ];
  /* the usual actor for each kind (2A drops "by" when it says only this) */
  var PPBY = { Commit: /^by spec writer$/, Review: /^by reviewer \(plan\)$/, Decision: /^by orchestrator$/, Check: /^by Actions$/ };
  /* how long each wait lasted: dispatch-log/2026-11.jsonl (card times), decisions/P-005/stop-4.md, PR #446 */
  var PPWAIT = { 'Stop card 4': ['waited 3 h 53 min', 0], 'Stop card 5': ['waiting 1 h 43 min', 1], 'Merged PR #446: three questions for you': ['waiting 2 h 39 min', 1] };
  var PPSPW = { 'Spec S-010': 'waited on you 3 h 53 min', 'Spec S-011': 'waiting on you 2 h 39 min so far' };
  /* usage, from sessions/chief-of-staff/*.jsonl: helpers' reported tokens; every session's end usage (tokens, context window, context peak) is null */
  var PPUSE = {
    'session_01QBwHGL7cLBqyQ4o1BxNuyh': { n: 4, tok: '139,766', role: '4 reviewers, 8:59 to 9:31 am', ctx: 0.62 },
    'session_01QBwHGKbJwQiq23S3G2JJet': { n: 0, tok: '0', role: 'no helpers recorded', ctx: 0.41 },
    'session_01QBwHGNJuJKMoanUDTkkWdq': { n: 0, tok: '0', role: 'no helpers recorded', ctx: 0.35 } };
  var PPSPU = { 'Spec S-010': ['no tokens recorded', 0.41], 'Spec S-011': ['140k tokens by helpers', 0.62] };
  function ppRows() { return [].slice.call(document.querySelectorAll('#v13list .v13ev')); }
  function ppKind(ev) { var b = ev.querySelector('.l1 > b'); return b ? b.textContent.trim() : ''; }
  function ppTitle(ev) { var t = ev.querySelector('.l2'); return t ? t.textContent.trim() : ''; }
  function ppSprint(name) { return [].slice.call(document.querySelectorAll('#v13list .v13gr')).filter(function (g) { var b = g.querySelector('.l1 > b'); return b && b.textContent.trim() === name; })[0]; }
  function ppFind(text) { var r = null; [].slice.call(document.querySelectorAll('#v13list .v13gr, #v13list .v13ev')).forEach(function (el) { if (!r && el.offsetParent && el.textContent.indexOf(text) >= 0) r = el; }); return r; }
  function ppCentre(el) { if (!el) return; var c = ctCentre(), r = el.getBoundingClientRect(); window.scrollTo(0, Math.max(0, window.scrollY + r.top + r.height / 2 - c.y)); setTimeout(ctSoon, 30); setTimeout(ctSoon, 400); }
  function ppGo(text) { ppClose(); setTimeout(function () { ppCentre(ppFind(text)); }, REDUCED ? 0 : 260); }

  /* ---------- a sheet, the same as v35's ---------- */
  var ppSheetEl = null;
  function ppClose() { if (!ppSheetEl) return; var s = ppSheetEl; ppSheetEl = null; s.sheet.classList.remove('on'); s.scrim.classList.remove('on'); setTimeout(function () { s.sheet.remove(); s.scrim.remove(); }, REDUCED ? 0 : 260); }
  function ppSheet(h) {
    ppClose(); var scrim = document.createElement('div'), sheet = document.createElement('div');
    scrim.className = 'kn-scrim'; sheet.className = 'kn-sheet pp-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true');
    sheet.innerHTML = '<div class="grab" aria-hidden="true"></div><button type="button" class="x" aria-label="Close"><span>' + PPI.x + '</span></button>' + h;
    document.body.appendChild(scrim); document.body.appendChild(sheet); ppSheetEl = { scrim: scrim, sheet: sheet };
    scrim.addEventListener('click', ppClose); sheet.querySelector('.x').addEventListener('click', ppClose);
    sheet.addEventListener('click', function (e) {
      var g = e.target.closest('[data-ppgo]'); if (g) { ppGo(g.dataset.ppgo); return; }
      var a = e.target.closest('[data-ppans]'); if (a) { ppClose(); setTimeout(function () { knOpen(a.dataset.ppans); }, REDUCED ? 0 : 280); return; }
      var q = e.target.closest('[data-ppq]'); if (q) { q.outerHTML = '<span class="pp-by">In the desk this opens the question with its choices. The mockup sends nothing.</span>'; }
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { scrim.classList.add('on'); sheet.classList.add('on'); }); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ppClose(); });
  function ppWaits() {
    return '<div class="kd">Waiting on you</div><h2>4 things wait on you in The timeline</h2><p class="pp-by">The longest first among the same kind; each says what it holds up and how long it has waited.</p><ul class="pp-wl">' +
      PPW.map(function (w) { return '<li><span class="ic">' + (w.k === 'stop' ? PPI.stop : PPI.q) + '</span><span class="bd"><span class="t">' + esc(w.t) + '</span><span class="s">Holds up ' + esc(w.holds) + ' · <span class="w">' + esc(w.w) + '</span> · since ' + esc(w.since) + '</span><span class="acts">' +
        (w.ans ? '<button type="button" class="pp-btn main" data-ppans="' + esc(w.ans) + '">Answer</button>' : '<button type="button" class="pp-btn main" data-ppq="1">Answer</button>') +
        '<button type="button" class="pp-btn" data-ppgo="' + esc(w.go) + '">Go to it</button></span></span></li>'; }).join('') + '</ul>' +
      '<h3>Records</h3><p class="rec-l">status/P-005.toml (what waits); decisions/P-005/stop-5-notes.md; PR #446 (the three questions). The question’s Answer is an example.</p>';
  }
  function ppWork() {
    return '<div class="kd">At work now</div><h2>The Chief of Staff, on S-011</h2><p class="pp-by">As of 11:25 am · the pipeline is stopped until you answer stop card 5.</p>' +
      '<table><tr><td><b>Chief of Staff</b> · CoS 14 Nov<br><span class="pp-by">Check #444 and the loop on stop card 4; follow S-011 through its plan reviews; file the rulings its round-2 review raises</span></td><td>since 7:52 am</td></tr>' +
      '<tr><td>Its helpers<br><span class="pp-by">4 reviewers, 8:59 to 9:31 am, all finished</span></td><td>none running</td></tr>' +
      '<tr><td><b>The pipeline</b><br><span class="pp-by">Last: Triage traced the third plan failure, 9:36 to 9:42 am; then stop card 5</span></td><td>stopped</td></tr></table>' +
      '<h3>Records</h3><p class="rec-l">sessions/chief-of-staff/session_01QBwHGL7cLBqyQ4o1BxNuyh.jsonl (start, what it set out to do, helpers); dispatch-log/2026-11.jsonl (the pipeline’s last dispatch and card 5). No record says a pipeline run is under way right now: the desk would read it from GitHub’s run status.</p>';
  }

  /* ---------- each option ---------- */
  function pp1() {
    if (!PPA['1A'] && !PPA['1B']) return;
    [].slice.call(document.querySelectorAll('#v13list .v13gr .l3')).forEach(function (l3) {
      var t = l3.textContent, m = /^(\d+) events · (.*) · (\d+) done · (\d+)%$/.exec(t);
      if (m) l3.textContent = PPA['1A'] ? m[2] + ' · ' + m[3] + ' of ' + m[1] + ' done' : m[2] + ' · ' + m[3] + ' of ' + m[1] + ' done · ' + m[4] + '%';
      else if (PPA['1A'] && / · \d+%$/.test(t)) l3.textContent = t.replace(/ · \d+%$/, '');
    });
  }
  function pp2() {
    if (!PPA['2A'] && !PPA['2B']) return;
    ppRows().forEach(function (ev) {
      var l3 = ev.querySelector('.l3'); if (!l3 || l3.dataset.pp2) return; var k = ppKind(ev), parts = l3.textContent.split(' · '), by = parts[0];
      if (!/^by /.test(by)) return; l3.dataset.pp2 = '1'; ev.dataset.ppby = by.slice(3);
      var drop = PPA['2B'] ? !/^by you$/.test(by) : (PPBY[k] && PPBY[k].test(by));
      if (!drop) return; parts.shift(); if (PPA['2A'] && parts[0] === 'main' && k === 'Merge') parts.shift();
      if (parts.length) l3.textContent = parts.join(' · '); else l3.style.display = 'none';
    });
    var bub = document.querySelector('.ss-bub'); if (PPA['2B'] && bub && !bub.querySelector('.pp-by')) {
      var ev = [].slice.call(document.querySelectorAll('#v13list .v13ev')).filter(function (e) { return e.dataset.ss === bub.dataset.for; })[0];
      if (ev && ev.dataset.ppby) { var d = document.createElement('div'); d.className = 'pp-by'; d.textContent = 'Done by the ' + ev.dataset.ppby + '.'; var k = bub.querySelector('.ss-k'); if (k) k.insertAdjacentElement('afterend', d); }
    }
  }
  var ppBar = null;
  function pp3() {
    if (!PPA['3A'] && !PPA['3B']) return;
    var stop = ppRows().filter(function (e) { return ppTitle(e) === 'Stop card 5'; })[0];
    if (PPA['3A'] && stop && !stop.querySelector('.pp-now')) { var l1 = stop.querySelector('.l1 > b'); if (l1) l1.insertAdjacentHTML('beforebegin', '<span class="pp-now">NOW</span>'); }
    if (PPA['3B']) {
      if (!ppBar) { ppBar = document.createElement('button'); ppBar.type = 'button'; ppBar.className = 'pp-nowbar'; ppBar.innerHTML = '<b>NOW</b><span class="t">Stop card 5 · S-011 failed three plan reviews</span><span class="w">1 h 43 min</span>';
        ppBar.addEventListener('click', function () { ppCentre(ppFind('Stop card 5')); }); document.body.appendChild(ppBar); }
      var b = document.getElementById('v13band'); ppBar.style.top = ((b ? b.getBoundingClientRect().bottom : 100) + 6) + 'px'; ppBar.style.display = v13on() ? '' : 'none';
    }
  }
  function pp4() {
    if (!PPA['4B'] || document.querySelector('.pp-grp')) return;
    var head = document.querySelector('#v13list .v13phase[data-b="2"] > .v13phh'); if (!head) return;
    var g = document.createElement('div'); g.className = 'pp-grp';
    g.innerHTML = '<div class="h">' + PPI.clock.replace('<svg', '<svg width="13" height="13"') + 'Waiting on you · 4</div>' + PPW.map(function (w) {
      return '<button type="button" class="r" data-ppgo="' + esc(w.go) + '"><span class="ic" style="width:20px;height:20px;color:var(--ink-3)">' + (w.k === 'stop' ? PPI.stop : PPI.q).replace('<svg', '<svg width="20" height="20"') + '</span><span class="t">' + esc(w.t) + '<small>Holds up ' + esc(w.holds) + '</small></span><span class="w">' + esc(w.w) + '</span></button>'; }).join('');
    g.addEventListener('click', function (e) { var r = e.target.closest('[data-ppgo]'); if (r) { e.stopPropagation(); ppCentre(ppFind(r.dataset.ppgo)); } });
    head.insertAdjacentElement('afterend', g);
  }
  function pp5() {
    if (PPA['5A'] && !document.querySelector('.pp-work')) {
      var stop = ppRows().filter(function (e) { return ppTitle(e) === 'Stop card 5'; })[0]; if (!stop) return;
      var w = document.createElement('button'); w.type = 'button'; w.className = 'pp-work';
      w.innerHTML = '<span class="d" aria-hidden="true"></span><span class="t"><b>At work now · Chief of Staff</b> (CoS 14 Nov)<small>Following S-011 through its plan reviews · since 7:52 am · the pipeline waits on your answer</small></span>';
      w.addEventListener('click', function (e) { e.stopPropagation(); ppSheet(ppWork()); }); stop.insertAdjacentElement('afterend', w);
    }
    if (PPA['5B'] && !document.querySelector('.pp-band-work')) {
      var strip = document.querySelector('#v13band .v13vp'); if (!strip) return;
      var bw = document.createElement('button'); bw.type = 'button'; bw.className = 'pp-band-work';
      bw.innerHTML = '<span class="d" aria-hidden="true"></span><span><b>At work:</b> Chief of Staff, on S-011 · since 7:52 am · pipeline stopped</span>';
      bw.addEventListener('click', function (e) { e.stopPropagation(); ppSheet(ppWork()); }); strip.insertAdjacentElement('beforebegin', bw);
    }
  }
  function pp6() {
    if (!PPA['6A'] && !PPA['6B']) return;
    var first = null, n = 0;
    ppRows().forEach(function (ev) { var tm = ev.querySelector('.tm'); if (!tm || !tm.textContent.trim() || / Nov/.test(tm.textContent)) return; n++; if (!first) first = ev;
      if (PPA['6A']) { var no = ev.querySelector('.no4'); if (no && !no.querySelector('.pp-dot')) no.insertAdjacentHTML('afterbegin', '<span class="pp-dot" aria-label="New since you last looked"></span>'); } });
    var h = document.querySelector('#v13list .v13phase[data-b="2"] > .v13phh .l3');
    if (PPA['6A'] && h && !h.querySelector('.pp-newc')) h.insertAdjacentHTML('beforeend', ' · <span class="pp-newc">' + n + ' new</span>');
    if (PPA['6B'] && first && !document.querySelector('.pp-newl')) first.insertAdjacentHTML('beforebegin', '<div class="pp-newl">New since you last looked · 13 Nov, 11:00 pm</div>');
  }
  function pp7() {
    if (PPA['7A']) ppRows().forEach(function (ev) { var w = PPWAIT[ppTitle(ev)], l3 = ev.querySelector('.l3'); if (!w || !l3 || l3.querySelector('.pp-wait')) return;
      l3.insertAdjacentHTML('afterbegin', '<span class="pp-wait' + (w[1] ? ' live' : '') + '">' + PPI.clock + esc(w[0]) + '</span><br>'); });
    if (PPA['7B']) Object.keys(PPSPW).forEach(function (k) { var g = ppSprint(k), l3 = g && g.querySelector('.l3'); if (!l3 || l3.querySelector('.pp-wait')) return;
      l3.insertAdjacentHTML('beforeend', '<br><span class="pp-wait' + (/so far/.test(PPSPW[k]) ? ' live' : '') + '">' + PPI.clock + esc(PPSPW[k]) + '</span>'); });
  }
  function pp8() {
    if (PPA['8A']) { var bub = document.querySelector('.ss-bub'); if (bub && !bub.querySelector('.pp-use')) {
      var a = bub.querySelector('a.ss-open'), id = a ? (/session_[A-Za-z0-9]+/.exec(a.href) || [''])[0] : '', u = PPUSE[id], d = document.createElement('div'); d.className = 'pp-use';
      d.innerHTML = u ? '<b>Used:</b> ' + (u.n ? u.n + ' helpers, ' + u.tok + ' tokens' : 'no helper tokens recorded') + ' · the session’s own tokens not recorded<br><b>Context:</b><span class="pp-meter"><i style="width:' + Math.round(u.ctx * 100) + '%"></i></span>' + Math.round(u.ctx * 100) + '% at its peak <span class="ex">(an example: not recorded)</span>'
        : '<b>Used:</b> not recorded <span class="ex">(a pipeline run keeps its model and turn limit, not its tokens)</span>';
      bub.appendChild(d); } }
    if (PPA['8B']) Object.keys(PPSPU).forEach(function (k) { var g = ppSprint(k), l3 = g && g.querySelector('.l3'); if (!l3 || l3.querySelector('.pp-tok')) return;
      l3.insertAdjacentHTML('beforeend', '<br><span class="pp-tok">' + esc(PPSPU[k][0]) + ' · context <span class="pp-meter"><i style="width:' + Math.round(PPSPU[k][1] * 100) + '%"></i></span><span class="ex">e.g.</span></span>'); });
  }
  function ppApply() { if (!v13on()) { if (ppBar) ppBar.style.display = 'none'; return; } pp1(); pp2(); pp3(); pp4(); pp5(); pp6(); pp7(); pp8(); }
  /* 4A: the count on the project pill opens what waits. The top row's own handler (v31) runs on capture before any later layer,
     so v36.py has it ask this first; the pill may be redrawn between press and release, so the count is found by where the tap fell */
  window.__v36count = function (e) {
    var pj = e.target.closest && e.target.closest('.tp-pill.pj'), c = pj && pj.querySelector('.n'), r = c && c.getBoundingClientRect();
    if (!r || !r.width || e.clientX < r.left - 6 || e.clientX > r.right + 6 || e.clientY < r.top - 10 || e.clientY > r.bottom + 10) return false;
    ppSheet(ppWaits()); return true;
  };
  var ppObs = new MutationObserver(function () { if (!ppObs.raf) ppObs.raf = requestAnimationFrame(function () { ppObs.raf = 0; ppApply(); }); });
  ppObs.observe(document.body, { childList: true, subtree: true, characterData: false });
  window.addEventListener('scroll', function () { if (PPA['3B']) pp3(); }, { passive: true });

  var _openPP = openProject;
  openProject = function (id) { _openPP(id); setTimeout(ppApply, REDUCED ? 40 : 480); };
  setTimeout(ppApply, 300);
