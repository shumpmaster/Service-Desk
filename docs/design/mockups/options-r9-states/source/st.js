  /* ================= round 9: a project with no plan, and the empty and can't-read states (st.js). Options over v48
     (docs/design/audit-2026-11-27-v46-screens.md, section 3, candidate 3; item 3 in its order).
     The phone's hash, tokens joined by dots:
       q=now|A|B|C   a project with no plan: now = v48's older layout (with "undefined"); A = the planned project's shell
                     (top row, map card with the summary line, a branch map of main and its branches, a plain list);
                     B = a shorter page, no map; C = A with an empty plan block at the top
       om|ml|pf      which quiet project the page opens on (operating model, the default; Model-Lab; portfolio)
       s=calm        home with nothing waiting (an example)
       s=checking    a project being read: portfolio, "Checking…" in its summary line, a shimmer on its list
       s=cant        a project the desk cannot read: Model-Lab, "Can't read since 9:14 am", Try again, Open on GitHub
       home          (with s=cant) home's line for it instead of its page
       s=first       the first open: no last-looked time, so no "new since you last looked" marks, and a one-line welcome
       light | dark  the theme (build.py's script)
     The events, counts and branches are real (the three repositories' histories, as of the mockup's 14 Nov, 11:25 am);
     the purposes, the calm and first-open words, and the can't-read time are examples and say so. ================= */
  var QP = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.'), o = { q: '', s: '', home: false, proj: 'om' };
    h.forEach(function (t) {
      if (/^q=/.test(t)) o.q = t.slice(2); else if (/^s=/.test(t)) o.s = t.slice(2);
      else if (t === 'home') o.home = true; else if (t === 'om' || t === 'ml' || t === 'pf') o.proj = t;
    });
    if (['now', 'A', 'B', 'C'].indexOf(o.q) < 0) o.q = '';
    if (['calm', 'checking', 'cant', 'first'].indexOf(o.s) < 0) o.s = '';
    o.opt = (o.q && o.q !== 'now') ? o.q : (o.s ? 'A' : '');          /* the page a quiet project opens on */
    o.mode = { om: '', ml: o.s === 'cant' ? 'cant' : '', pf: o.s === 'checking' ? 'checking' : '' };
    if (o.opt) document.documentElement.classList.add('qp-on');
    if (o.s) document.documentElement.classList.add('qp-s-' + o.s);
    return o;
  })();
  var QP_EX = ' <i class="pw-ex">example</i>';
  var QP_NOW = '11:25 am';
  var QP_CANT = '9:14 am';
  var QPI = {
    back: '<svg aria-hidden="true" focusable="false" viewBox="0 0 256 256" fill="currentColor"><path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z"/></svg>',
    cv: '<svg class="cv" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg>',
    ext: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5H3.5v9h9v-3M9.5 2.5h4v4M13.5 2.5 7.5 8.5"/></svg>',
    again: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.6-3.7"/><path d="M13.2 2.6v2.8h-2.8"/></svg>'
  };

  /* ---------- the records: each quiet project's real events, oldest first (the timeline reads top down, R7 answer 8) ---------- */
  var QPD = {
    om: { name: 'operating model', repo: 'Personal-Org-Operating-Model', url: 'https://github.com/shumpmaster/Personal-Org-Operating-Model',
      purpose: 'The rules and tools every project’s AI team works by.',
      month: '20 pull requests merged this month', monthShort: '20 merged this month', monthLong: '20 pull requests merged from 1 to 14 November; version 3.7.3 released on 13 November.',
      latest: 'The latest: the spec-number fix, built and merged as version 3.7.3 on 13 November, then two lessons from the timeline work.',
      earlier: 'Earlier this month: 17 more pull requests merged, 4 to 11 Nov',
      lanes: { a: { label: 'Four lessons', code: 'PR #57', row: 1 }, b: { label: 'The spec-number fix', code: 'S-038', row: 1 }, c: { label: 'Its build', code: 'tools-builder', row: 2, parent: 'b' }, d: { label: 'Two lessons', code: 'PR #59', row: 1 } },
      ev: [
        { d: '13 Nov', t: '10:00 am', k: 'commit', l: 'a', title: 'Three lessons from the timeline work written', code: 'LL-050 to LL-052', st: 'Done', who: 'the Chief of Staff' },
        { d: '13 Nov', t: '11:04 am', k: 'commit', l: 'a', title: 'A lesson: a new spec was given a number another spec held', code: 'LL-053', st: 'Done', who: 'the Chief of Staff' },
        { d: '13 Nov', t: '11:22 am', k: 'merge', l: 'm', from: 'a', title: 'Four lessons from the timeline work merged', code: 'PR #57', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '5:36 pm', k: 'commit', l: 'b', title: 'The spec-number fix drafted', code: 'S-038 draft 1', st: 'Done', who: 'the spec writer' },
        { d: '13 Nov', t: '6:05 pm', k: 'review', l: 'b', title: 'Its plan check failed, round 1', code: 'S-038 · B1', st: 'Failed', who: 'the plan reviewer' },
        { d: '13 Nov', t: '6:26 pm', k: 'review', l: 'b', title: 'Its plan check passed, round 2', code: 'S-038', st: 'Passed', who: 'the plan reviewer' },
        { d: '13 Nov', t: '6:53 pm', k: 'decision', l: 'b', title: 'You approved the fix for building', code: 'Q-032 · L-0158', st: 'Answered', who: 'you' },
        { d: '13 Nov', t: '6:56 pm', k: 'commit', l: 'c', title: 'Tests written first: the desk’s case gives S-009', code: 'S-038 AC4', st: 'Done', who: 'the builder' },
        { d: '13 Nov', t: '7:07 pm', k: 'commit', l: 'c', title: 'The tools changed', code: 'S-038', st: 'Done', who: 'the builder' },
        { d: '13 Nov', t: '7:16 pm', k: 'merge', l: 'b', from: 'c', title: 'The build joined the fix’s branch', code: 'build/tools-builder/s038', st: 'Merged', who: 'the orchestrator' },
        { d: '13 Nov', t: '7:19 pm', k: 'review', l: 'b', title: 'Its build check passed', code: 'S-038 · round 1', st: 'Passed', who: 'the reviewer' },
        { d: '13 Nov', t: '7:57 pm', k: 'review', l: 'b', title: 'The pull request’s review failed, round 1', code: 'PR #58 · B1', st: 'Failed', who: 'the reviewer' },
        { d: '13 Nov', t: '8:08 pm', k: 'review', l: 'b', title: 'The pull request’s review passed, round 2', code: 'PR #58', st: 'Passed', who: 'the reviewer' },
        { d: '13 Nov', t: '8:24 pm', k: 'check', l: 'b', title: 'Its three automatic checks passed', code: 'PR #58', st: 'Passed', who: 'GitHub' },
        { d: '13 Nov', t: '8:55 pm', k: 'merge', l: 'm', from: 'b', title: 'A new spec number now counts every spec: released as 3.7.3', code: 'PR #58 · S-038', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '9:40 pm', k: 'commit', l: 'd', title: 'Two lessons written: the fix done, and the plan reviewer’s missing files', code: 'LL-053, LL-054', st: 'Done', who: 'the Chief of Staff' },
        { d: '13 Nov', t: '10:56 pm', k: 'merge', l: 'm', from: 'd', title: 'Two lessons merged', code: 'PR #59', st: 'Merged', who: 'you' }
      ] },
    ml: { name: 'Model-Lab', repo: 'Model-Lab', url: 'https://github.com/shumpmaster/Model-Lab',
      purpose: 'A lab where the AI team tries out how models are made to work.',
      month: '77 pull requests merged since 4 November', monthShort: '77 merged since 4 Nov', monthLong: '77 pull requests merged from 4 to 14 November (the copy the desk reads starts on 4 November).',
      latest: 'The latest: six pull requests on 13 November, all on its piece of work P-002 and your answers to its cards.',
      earlier: 'Earlier this month: 71 more pull requests merged, 4 to 13 Nov',
      lanes: { a: { label: 'Your answer recorded', code: 'PR #112', row: 1 }, b: { label: 'P-002’s plan', code: 'PRs #113 to #117', row: 1 }, c: { label: 'A handoff', code: 'PR #118', row: 2 } },
      ev: [
        { d: '13 Nov', t: '9:32 am', k: 'merge', l: 'm', from: 'a', title: 'Your answer on a card recorded: you confirm each trial look’s touch lines', code: 'PR #112 · P-002', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '5:10 pm', k: 'merge', l: 'm', from: 'b', title: 'The plan passed at its second stop; the touch log’s guard written in', code: 'PR #113 · P-002', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '5:30 pm', k: 'merge', l: 'm', from: 'b', title: 'Your two answers recorded: a focused fix, and a plan a piece’s own work wrote is its own', code: 'PR #114 · P-002', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '5:45 pm', k: 'merge', l: 'm', from: 'b', title: 'The plan’s last points written in and checked', code: 'PR #116 · P-002 · handoffs 20, 21', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '7:02 pm', k: 'merge', l: 'm', from: 'b', title: 'The research question re-quoted at the passed plan', code: 'PR #117 · P-002', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '7:06 pm', k: 'merge', l: 'm', from: 'c', title: 'Your answer recorded: a piece’s work is its own files', code: 'PR #118', st: 'Merged', who: 'you' }
      ] },
    pf: { name: 'portfolio', repo: 'portfolio', url: 'https://github.com/shumpmaster/portfolio',
      purpose: 'Where the ideas for new projects, and the facts behind them, are kept.',
      month: '11 pull requests merged this month', monthShort: '11 merged this month', monthLong: '11 pull requests merged from 1 to 12 November; nothing since.',
      latest: 'The latest: the idea of a listing of every session, logged on 12 November.',
      earlier: 'Earlier this month: 5 more pull requests merged, 1 to 8 Nov',
      lanes: { a: { label: 'The screening ask', code: 'PR #7', row: 1 }, b: { label: 'Library entries', code: 'PRs #8 to #11', row: 2 }, c: { label: 'The timeline’s kick-off', code: 'PR #12', row: 1 }, d: { label: 'An idea', code: 'PR #13', row: 1 } },
      ev: [
        { d: '8 Nov', t: '10:05 am', k: 'merge', l: 'm', from: 'a', title: 'Your ask to start the cutting-edge screening logged, with its session’s kick-off', code: 'PR #7', st: 'Merged', who: 'you' },
        { d: '8 Nov', t: '6:57 pm', k: 'merge', l: 'm', from: 'b', title: 'Library entries filed from one research question', code: 'PR #8 · Q-009', st: 'Merged', who: 'you' },
        { d: '8 Nov', t: '7:03 pm', k: 'merge', l: 'm', from: 'b', title: 'Library entries filed from three more', code: 'PR #9 · Q-010, Q-011, Q-013', st: 'Merged', who: 'you' },
        { d: '8 Nov', t: '9:04 pm', k: 'merge', l: 'm', from: 'b', title: 'Library entries filed after their deciding check', code: 'PR #10 · Q-012, Q-014', st: 'Merged', who: 'you' },
        { d: '9 Nov', t: '8:04 am', k: 'merge', l: 'm', from: 'b', title: '49 checked entries on how AI teams are run and their work measured', code: 'PR #11', st: 'Merged', who: 'you' },
        { d: '10 Nov', t: '9:29 pm', k: 'merge', l: 'm', from: 'c', title: 'The desk timeline handed over: its kick-off, and the idea log updated', code: 'PR #12', st: 'Merged', who: 'you' },
        { d: '12 Nov', t: '10:03 am', k: 'merge', l: 'm', from: 'd', title: 'The idea logged: a listing of every session, and whether it is archived', code: 'PR #13', st: 'Merged', who: 'you' }
      ] }
  };
  var QPST = { Merged: 'ok', Done: 'ok', Passed: 'ok', Answered: 'ok', Failed: 'bad' };

  function qpLine(d, mode) {
    if (mode === 'checking') return { dot: 'run', long: 'Checking ' + d.name + '…', short: 'Checking…' };
    if (mode === 'cant') return { dot: 'bad', long: 'Can’t read since ' + QP_CANT + ' · tap for what to do', short: 'Can’t read since ' + QP_CANT };
    return { dot: '', long: 'No plan yet · ' + d.month + ' · nothing waits on you', short: 'No plan yet · ' + d.monthShort + ' · nothing for you' };
  }

  /* ---------- the branch map: main and its recent branches, no phase or milestone lanes ---------- */
  function qpMap(d) {
    var W = 340, H = 122, mainY = 88, padL = 30, padR = 30, n = d.ev.length, step = (W - padL - padR) / Math.max(1, n);
    function x(i) { return padL + step * (i + .5); }
    function ly(l) { return l === 'm' ? mainY : mainY - 30 * d.lanes[l].row; }
    var span = {};
    d.ev.forEach(function (e, i) { if (e.l !== 'm') { var s = span[e.l] || (span[e.l] = { a: i, b: i }); s.b = i; } if (e.from) { var s2 = span[e.from] || (span[e.from] = { a: i, b: i }); s2.b = i; } });
    var rows = {};
    var g = '<line class="qm-main" x1="10" y1="' + mainY + '" x2="' + (W - 14) + '" y2="' + mainY + '"/>', lab = '', dots = '';
    Object.keys(d.lanes).forEach(function (k) {
      var s = span[k]; if (!s) return; var L = d.lanes[k], py = ly(L.parent || 'm'), y = ly(k);
      var xa = x(s.a) - step * .55, xb = x(s.b); var only = s.a === s.b;   /* a branch whose only event is its merge */
      if (only) xa = x(s.a) - step * .9;
      var r = Math.min(10, (py - y) / 2);
      var p = 'M' + (xa - 8) + ',' + py + ' C' + xa + ',' + py + ' ' + xa + ',' + y + ' ' + (xa + 8) + ',' + y + ' L' + (xb - 8) + ',' + y + ' C' + xb + ',' + y + ' ' + xb + ',' + py + ' ' + (xb + 1) + ',' + py;
      g += '<path class="qm-br" d="' + p + '"/>';
      var lx = xa + 6, lw = L.label.length * 5.8, tier = 0, used = rows[y] || (rows[y] = []);
      while (used.some(function (u) { return u.t === tier && lx < u.b + 6 && lx + lw > u.a - 6; }) && tier < 2) tier++;
      used.push({ a: lx, b: lx + lw, t: tier });
      lab += '<text class="qm-lab" x="' + lx + '" y="' + (y - 7 - 11 * tier) + '">' + esc(L.label) + '</text>';
    });
    d.ev.forEach(function (e, i) {
      var cx = x(i), cy = ly(e.l);
      if (e.k === 'merge' && e.l === 'm') {
        dots += '<circle class="qm-mg" cx="' + cx + '" cy="' + cy + '" r="5.5"/>';
        var c = (e.code.match(/#\d+/) || [''])[0]; if (c) lab += '<text class="qm-no" x="' + cx + '" y="' + (mainY + 18) + '" text-anchor="middle">' + c + '</text>';
      } else if (e.k === 'merge') dots += '<circle class="qm-mg sm" cx="' + cx + '" cy="' + cy + '" r="4"/>';
      else dots += '<circle class="qm-ev' + (QPST[e.st] === 'bad' ? ' bad' : '') + '" cx="' + cx + '" cy="' + cy + '" r="3.6"/>';
    });
    var first = d.ev[0].d, last = d.ev[d.ev.length - 1].d;
    lab += '<text class="qm-main-l" x="10" y="' + (mainY - 6) + '">main</text>';
    lab += '<text class="qm-day" x="' + (padL - 4) + '" y="' + (H - 4) + '">' + esc(first) + '</text>';
    if (last !== first) lab += '<text class="qm-day" x="' + Math.min(x(n - 1), W - 52) + '" y="' + (H - 4) + '" text-anchor="' + (x(n - 1) > W - 52 ? 'end' : 'middle') + '">' + esc(last) + '</text>';
    var now = '<line class="qm-now" x1="' + (W - 12) + '" y1="' + (mainY - 9) + '" x2="' + (W - 12) + '" y2="' + (mainY + 9) + '"/><text class="qm-nowt" x="' + (W - 12) + '" y="' + (H - 4) + '" text-anchor="end">now</text>';
    return '<svg class="qp-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Branch map: main and ' + Object.keys(d.lanes).length + ' recent branches, ' + esc(first) + ' to now">' + g + dots + lab + now + '</svg>';
  }

  /* ---------- the list: a plain title, its codes in grey, a real state word ---------- */
  function qpRow(e) {
    var main = e.l === 'm';
    return '<div class="qp-ev' + (main ? ' main' : '') + '"><span class="v13ico' + (main ? ' main' : '') + '">' + (ICONS[e.k] || '') + mark(QPST[e.st] || 'ok') + '</span>' +
      '<div class="qp-tx"><div class="qp-meta">' + esc(KL[e.k] || e.k) + ' · ' + esc(e.t) + ' · ' + (main ? 'main' : 'a branch') + '</div>' +
      '<div class="qp-t"><b>' + esc(e.title) + '</b> <span class="pw-code">' + esc(e.code) + '</span></div>' +
      '<div class="qp-by"><span class="qp-st ' + (QPST[e.st] || 'ok') + '">' + esc(e.st) + '</span> by ' + esc(e.who) + '</div></div></div>';
  }
  function qpList(d, mode) {
    var h = '<div class="qp-lh"><h2>What happened lately</h2><span>top down, oldest first</span></div>';
    h += '<p class="qp-earlier">' + esc(d.earlier) + '</p>';
    var day = '';
    d.ev.forEach(function (e) { if (e.d !== day) { day = e.d; h += '<div class="qp-day">' + esc(day) + '</div>'; } h += qpRow(e); });
    if (mode === 'cant') h += '<div class="qp-end bad"><span class="qp-st bad">Can’t read</span> Nothing newer can be shown: the desk last read ' + esc(d.name) + ' at ' + QP_CANT + '.' + QP_EX + '</div>';
    else if (mode === 'checking') h += '<div class="qp-end"><span class="qp-spin" aria-hidden="true"></span> Checking for anything newer…</div>';
    else h += '<div class="qp-end"><span class="qp-nowdot" aria-hidden="true"></span><b>Now · ' + QP_NOW + '</b> Nothing newer. Read 1 min ago.</div>';
    return '<div class="qp-list' + (mode === 'checking' ? ' qp-shim' : '') + '" aria-busy="' + (mode === 'checking') + '">' + h + '</div>';
  }
  function qpCant(d) {
    return '<div class="qp-cant" role="status"><p><b>The desk can’t read ' + esc(d.name) + ' since ' + QP_CANT + '.</b> What shows here is from then; anything newer, even something waiting on you, would not show.' + QP_EX + '</p>' +
      '<div class="qp-acts"><button type="button" class="qp-btn main" data-qpa="again">' + QPI.again + 'Try again</button>' +
      '<a class="qp-btn" href="' + d.url + '" target="_blank" rel="noopener">' + QPI.ext + 'Open on GitHub</a></div><p class="qp-said" aria-live="polite"></p></div>';
  }

  /* ---------- the page ---------- */
  var qpEl = null, qpCur = null;
  function qpTop(d, mode) {
    return '<div class="pl-row pl-B qp-row"><button type="button" class="circ qp-back" data-qpa="back" aria-label="All projects">' + QPI.back + '</button>' +
      '<button type="button" class="tp-pill pj" data-qpa="proj" aria-haspopup="menu" aria-expanded="false" aria-label="Project: ' + esc(d.name) + '. Choose another"><span class="t">' + esc(d.name) + '</span>' + QPI.cv + '</button>' +
      '<button type="button" class="tp-pill ph qp-ph" data-qpa="phase" aria-haspopup="menu" aria-expanded="false" aria-label="No phases yet. What this means"><span class="qp-ring" aria-hidden="true"></span><span class="t">No phases yet</span>' + QPI.cv + '</button></div>';
  }
  function qpSum(d, mode, plain) {
    var L = qpLine(d, mode);
    return '<button type="button" class="sm-line qp-sum' + (plain ? ' qp-sum-b' : '') + '" data-qpa="sum" aria-label="About this project: ' + esc(L.long) + '. Open the summary">' +
      '<span class="sm-dot qp-dot ' + L.dot + '"></span><span class="sm-lt"><span class="sm-long">' + esc(L.long) + '</span><span class="sm-short">' + esc(L.short) + '</span></span><span class="sm-chev" aria-hidden="true">›</span></button>';
  }
  function qpHTML(id, opt, mode) {
    var d = QPD[id], h = '<div class="qp-head">' + qpTop(d, mode);
    if (opt === 'B') {
      h += '</div><div class="qp-body">' + qpSum(d, mode, true);
      if (mode === 'cant') h += qpCant(d);
      h += '<p class="qp-why">No plan on record: the AI team has not filed one, so there are no phases or milestones to show, only what happened.</p>';
    } else {
      h += '<div class="v13vp qp-card">' + qpSum(d, mode) + '<div class="qp-map' + (mode === 'checking' ? ' qp-shim' : '') + '">' + qpMap(d) + '</div></div></div><div class="qp-body">';
      if (mode === 'cant') h += qpCant(d);
      if (opt === 'C') h += '<div class="qp-plan"><b>No plan yet.</b> When the AI team files one, its phases appear here.</div>';
    }
    return h + qpList(d, mode) + '</div>';
  }
  function qpOpen(id, instant) {
    if (!QPD[id]) return; var opt = QP.opt || 'A', mode = QP.mode[id];
    if (typeof closeLayers === 'function') closeLayers(true);
    if (!qpEl) { qpEl = document.createElement('div'); qpEl.className = 'qp-page'; qpEl.setAttribute('role', 'region'); document.body.appendChild(qpEl); }
    qpCur = id; qpEl.setAttribute('aria-label', QPD[id].name); qpEl.dataset.opt = opt;
    qpEl.innerHTML = qpHTML(id, opt, mode);
    document.documentElement.classList.add('qp-open');
    var go = function () { qpEl.classList.add('on'); var l = qpEl.querySelector('.qp-list'); if (l && !instant) qpEl.scrollTop = 0; };
    if (instant || REDUCED) { qpEl.style.transition = 'none'; go(); requestAnimationFrame(function () { qpEl.style.transition = ''; }); }
    else requestAnimationFrame(function () { requestAnimationFrame(go); });
  }
  function qpClose() {
    if (!qpEl) return; if (typeof knClose === 'function') knClose(); if (typeof closeLayers === 'function') closeLayers(true);
    qpEl.classList.remove('on'); document.documentElement.classList.remove('qp-open'); qpCur = null;
  }

  /* About this project: the summary line's sheet, as v46's (sm46Sheet), for a project with no plan */
  function qpSheet() {
    var d = QPD[qpCur]; if (!d) return; var mode = QP.mode[qpCur]; if (typeof knClose === 'function') knClose();
    var ex = '<span class="sm-ex">Example</span>', st = [];
    if (mode === 'cant') st = ['The desk can’t read ' + d.name + ' since ' + QP_CANT + ', so this page shows what it read then. Anything newer would not show, even something that waits on you.', 'Try again reads it now; Open on GitHub shows the repository itself.'];
    else if (mode === 'checking') st = ['The desk is reading ' + d.name + ' from GitHub now. What shows is from its last read until this one finishes.'];
    else st = ['No plan on record: the AI team has not filed phases or milestones for this project, so its page shows what happened, top down.', d.latest];
    var h = '<div class="kd">About this project</div><h2>' + esc(d.name) + '</h2><p class="sm-pur">' + esc(d.purpose) + ' ' + ex + '</p>' +
      '<h3>Where it stands</h3>' + st.map(function (s) { return '<p>' + esc(s) + '</p>'; }).join('') +
      (mode === 'cant' ? '<div class="qp-acts"><button type="button" class="qp-btn main" data-qpa="again">' + QPI.again + 'Try again</button><a class="qp-btn" href="' + d.url + '" target="_blank" rel="noopener">' + QPI.ext + 'Open on GitHub</a></div><p class="qp-said" aria-live="polite"></p>' : '') +
      '<h3>Its phases</h3><ul class="ck"><li><span class="m qp-none"></span><span>None on record<small>When the AI team files a plan, its phases and gates show here and on the map.</small></span></li></ul>' +
      '<h3>This month</h3><ul class="ck"><li><span class="m ok"></span><span>' + esc(d.monthLong) + '</span></li></ul>' +
      '<h3>What waits on you</h3><ul class="ck"><li><span class="m"></span><span>' + (mode === 'cant' ? 'Unknown while the desk can’t read it' : 'Nothing') + '</span></li></ul>' +
      '<p class="ex">The purpose is an example; the counts and events are from the repository’s history as of 14 Nov, ' + QP_NOW + '.</p>';
    var scrim = document.createElement('div'), sheet = document.createElement('div');
    scrim.className = 'kn-scrim'; sheet.className = 'kn-sheet sm-sheet qp-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'About this project');
    sheet.innerHTML = '<div class="grab" aria-hidden="true"></div><button type="button" class="x" aria-label="Close"><span>' + KNI.x + '</span></button>' + h;
    document.body.appendChild(scrim); document.body.appendChild(sheet); knSheetEl = { scrim: scrim, sheet: sheet };
    scrim.addEventListener('click', knClose); sheet.querySelector('.x').addEventListener('click', knClose);
    requestAnimationFrame(function () { requestAnimationFrame(function () { scrim.classList.add('on'); sheet.classList.add('on'); }); });
  }

  /* Try again: the line reads Checking…, then says what happened (the mockup sends nothing) */
  function qpAgain(btn) {
    var scope = btn.closest('.qp-cant, .qp-sheet, .qp-hcant') || document;
    var said = scope.querySelector('.qp-said'), sums = [].slice.call(document.querySelectorAll('.qp-sum .sm-long, .qp-hcant .qp-hl'));
    var keep = sums.map(function (s) { return s.innerHTML; });
    btn.disabled = true; btn.classList.add('busy');
    sums.forEach(function (s) { s.textContent = 'Checking ' + QPD.ml.name + '…'; });
    document.querySelectorAll('.qp-dot, .qp-hdot').forEach(function (x) { x.classList.add('run'); });
    if (said) said.textContent = 'Checking…';
    setTimeout(function () {
      sums.forEach(function (s, i) { s.innerHTML = keep[i]; });
      document.querySelectorAll('.qp-dot, .qp-hdot').forEach(function (x) { x.classList.remove('run'); });
      btn.disabled = false; btn.classList.remove('busy');
      if (said) said.textContent = 'Tried again at ' + QP_NOW + ': still can’t read it. In the desk this asks GitHub again; the mockup sends nothing.';
    }, REDUCED ? 600 : 1500);
  }

  function qpMenu(btn, kind) {
    if (typeof tpOpen !== 'function') return;
    if (kind === 'proj') {
      var rows = [['tl', 'The timeline', 1], ['wd', 'Home-screen widget', 1], ['om', 'operating model'], ['ml', 'Model-Lab'], ['pf', 'portfolio']].map(function (p) {
        var on = p[0] === qpCur; return '<button type="button" class="mi qp-mi' + (on ? ' on' : '') + '" data-qpgo="' + p[0] + '"><span>' + esc(p[1]) + '</span><span class="sub">' + (p[2] ? '<span class="n">' + p[2] + '</span>' : '') + '</span></button>'; }).join('');
      tpOpen(btn, '<div class="mcap">Projects</div>' + rows);
    } else tpOpen(btn, '<div class="mcap">Phases</div><p class="qp-mtx">None on record yet. When the AI team files a plan for this project, its phases and gates show here.</p>');
  }

  /* the clicks: on capture, before any of v48's own (build.py's early script calls this first) */
  window.__qpClick = function (e) {
    var t = e.target; if (!t || !t.closest) return;
    if (qpEl && qpEl.classList.contains('on') && t.closest('#tabbar')) { qpClose(); return; }
    var mi = t.closest('.qp-mi');
    if (mi) { e.stopImmediatePropagation(); e.preventDefault(); closeLayers(true); var id = mi.dataset.qpgo;
      if (QPD[id]) { qpOpen(id, true); return; }
      qpClose(); var r = document.querySelector('.sg-row[data-sgp="' + id + '"]'); if (r) r.click(); return; }
    var ag = t.closest('[data-qpa="again"]'); if (ag && !t.closest('.qp-page')) { e.stopImmediatePropagation(); e.preventDefault(); qpAgain(ag); return; }
    if (QP.opt) {
      var row = t.closest('.sg-row[data-sgp]'); if (row && QPD[row.dataset.sgp]) { e.stopImmediatePropagation(); e.preventDefault(); qpOpen(row.dataset.sgp); return; }
    }
    if (!qpEl || !qpEl.contains(t)) return;
    if (t.closest('a[href]')) { e.stopImmediatePropagation(); return; }
    e.stopImmediatePropagation();
    var a = t.closest('[data-qpa]'); if (!a) return; e.preventDefault();
    var k = a.dataset.qpa;
    if (k === 'back') qpClose(); else if (k === 'sum') qpSheet(); else if (k === 'again') qpAgain(a); else qpMenu(a, k);
  };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && qpEl && qpEl.classList.contains('on') && !knSheetEl && !document.querySelector('.tp-menu')) qpClose(); });

  /* ---------- home in each state ---------- */
  function qpHome() {
    var v = document.getElementById('view'); if (!v || !v.querySelector('.pr-wrap')) return;
    if (QP.s === 'calm') qpCalm(v);
    if (QP.s === 'first') qpFirst(v);
    if (QP.s === 'cant') qpHomeCant(v);
    if (QP.opt) [].forEach.call(v.querySelectorAll('.sg-quiet-list .ps45-l, .sg-grp .ps45-l'), function (l) { if (/No phases on record/.test(l.textContent) && !l.dataset.qp) { l.dataset.qp = '1'; l.textContent = 'No phases yet'; } });
  }
  function qpCalm(v) {
    if (!v.querySelector('.qp-calm')) {
      var sum = v.querySelector('.sg-sum');
      var c = document.createElement('div'); c.className = 'qp-calm'; c.setAttribute('role', 'status');
      c.innerHTML = '<span class="qp-calm-dot" aria-hidden="true"></span><div><p class="qp-calm-1">Nothing needs you.</p><p class="qp-calm-2">The AI team is at work on 1 project; the other 4 are quiet. Read 1 min ago.' + QP_EX + '</p></div>';
      (sum || v.querySelector('.pr-wrap')).insertAdjacentElement('beforebegin', c);
    }
    var tb = document.querySelector('#tabbar [data-tab="needs"]'); if (tb) tb.classList.add('qp-nobadge');
    [].forEach.call(v.querySelectorAll('.sg-grp[data-sgg="tl"] .ps45-l, .sg-grp[data-sgg="wd"] .ps45-l'), function (l) { var b = l.querySelector('b'); if (b && l.childNodes.length > 1) l.innerHTML = '<b>' + esc(b.textContent) + '</b>'; });
    [].forEach.call(v.querySelectorAll('.sg-grp[data-sgg="tl"] .wait, .sg-grp[data-sgg="tl"] .bad, .sg-grp[data-sgg="wd"] .wait, .sg-grp[data-sgg="wd"] .bad'), function (x) {
      if (x.closest('.ps45-bar, .sg-row')) { x.classList.remove('wait'); x.classList.remove('bad'); if (x.classList.contains('cur')) x.classList.add('qp-cur'); } });
    [].forEach.call(v.querySelectorAll('.sg-grp[data-sgg="tl"] .sg-row .l2, .sg-grp[data-sgg="wd"] .sg-row .l2'), function (l) {
      if (l.dataset.qp) return; l.dataset.qp = '1'; var g = l.closest('.sg-grp').dataset.sgg;
      l.innerHTML = (g === 'tl' ? 'Design: the AI team is writing the next plan.' : 'Discovery: its brief is being reworked.') + QP_EX; });
  }
  function qpFirst(v) {
    if (v.querySelector('.qp-welcome')) return;
    var sum = v.querySelector('.sg-sum');
    var c = document.createElement('p'); c.className = 'qp-welcome';
    c.innerHTML = '<b>Welcome.</b> This is all your projects at once. From your next visit, anything new since this one is marked.' + QP_EX;
    (sum || v.querySelector('.pr-wrap')).insertAdjacentElement('beforebegin', c);
  }
  function qpHomeCant(v) {
    var q = v.querySelector('.sg-quiet'); if (!q || v.querySelector('.qp-hcant')) return;
    var ml = q.querySelector('.sg-row[data-sgp="ml"]'); if (!ml) return;
    var strip = ml.nextElementSibling && ml.nextElementSibling.classList.contains('sg-strip') ? ml.nextElementSibling : null;
    var sec = document.createElement('section'); sec.className = 'sg-grp qp-hcant'; sec.setAttribute('aria-label', 'Model-Lab: can’t read');
    ml.classList.add('qp-hrow'); sec.appendChild(ml);
    var l2 = ml.querySelector('.l2'); if (l2) l2.innerHTML = '<span class="qp-hdot" aria-hidden="true"></span><span class="qp-hl">Can’t read since ' + QP_CANT + '</span>' + QP_EX;
    if (strip) strip.remove();
    sec.insertAdjacentHTML('beforeend', '<p class="qp-hsub">So nothing from Model-Lab after ' + QP_CANT + ' shows, even something that waits on you.</p>' +
      '<div class="qp-acts"><button type="button" class="qp-btn main" data-qpa="again">' + QPI.again + 'Try again</button><a class="qp-btn" href="' + QPD.ml.url + '" target="_blank" rel="noopener">' + QPI.ext + 'Open on GitHub</a></div><p class="qp-said" aria-live="polite"></p>');
    q.insertAdjacentElement('beforebegin', sec);
    var l1 = q.querySelector('[data-sgq] .l1'); if (l1) l1.textContent = 'Nothing waits on you in operating model, portfolio';
  }
  function qpFirstMarks() {
    if (QP.s !== 'first') return;
    [].forEach.call(document.querySelectorAll('.pp-dot, .fh-pline .new'), function (x) { x.classList.add('qp-gone'); });
  }

  function qpApply() { qpHome(); qpFirstMarks(); }
  var qpObs = new MutationObserver(function () { if (!qpObs.raf) qpObs.raf = requestAnimationFrame(function () { qpObs.raf = 0; try { qpApply(); } catch (err) { console.error(err); } }); });
  qpObs.observe(document.body, { childList: true, subtree: true });
  window.__qp = { open: qpOpen, close: qpClose, sheet: qpSheet, QP: QP };

  /* ---------- the phone's hash opens its state ---------- */
  (function () {
    if (!QP.q && !QP.s) return;
    var t0 = Date.now();
    (function boot() {
      var ready = document.querySelector('#view .pr-list .pr-row[data-pw]');
      if (!ready && Date.now() - t0 < 6000) { setTimeout(boot, 120); return; }
      qpApply();
      if (QP.q === 'now') {
        var f = document.querySelector('[data-sgq]'); if (f && f.getAttribute('aria-expanded') !== 'true') f.click();
        setTimeout(function () { var r = document.querySelector('.sg-row[data-sgp="' + QP.proj + '"]'); if (r) r.click(); }, 250); return;
      }
      if (QP.q) { qpOpen(QP.proj, true); return; }
      if (QP.s === 'checking') { qpOpen('pf', true); return; }
      if (QP.s === 'cant' && !QP.home) { qpOpen('ml', true); return; }
      if (QP.s === 'cant' && QP.home) setTimeout(function () { var s = document.querySelector('.qp-hcant'); if (s) window.scrollTo(0, Math.max(0, s.getBoundingClientRect().top + window.scrollY - 300)); }, 300);
    })();
  })();
