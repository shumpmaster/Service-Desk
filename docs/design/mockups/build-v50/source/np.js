  /* ================= v50: every project on the same page (round 9, answer 6; decisions/questions/P-005-design-round-9.md):
     "I agree, only caveat is the branch map you drew up looks very different than the others". Read as option A of
     docs/design/mockups/options-r9-states/ for a project with no plan, and the four states as drawn there; the caveat: its branch
     map is the mockup's own map, not a drawing of its own. So a quiet project (operating model, Model-Lab, portfolio) opens through
     the planned projects' own renderProject, fed with a phase-less plan made from its real events: one branch per recent branch,
     main along the bottom, no phase row, no milestone selection, no gates. The renderer draws the lanes, stations, icons, labels,
     main's words, the window over the rows in view, the card, the filter button and the fold handle as for The timeline.
     The list under the map is option A's: what happened, top down, oldest first, a real state word on every row; each row carries
     its station's data-k, so the map follows the scroll as it does on a planned project.
     The four states are not the mockup's normal state: More's "Mockup only" menu previews them, each on and off again live.
     Data from options-r9-states/source/st.js (the three repositories' histories as of the mockup's 14 Nov, 11:25 am). The purposes,
     the state words, the 9:14 am time, the calm and first-open homes are examples and say so. ================= */
  var NP = { s: '' };                                  /* the previewed state: '', calm, checking, cant, first */
  var NP_EX = ' <i class="pw-ex">example</i>', NP_NOW = '11:25 am', NP_CANT = '9:14 am';
  var NPI = {
    ext: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5H3.5v9h9v-3M9.5 2.5h4v4M13.5 2.5 7.5 8.5"/></svg>',
    again: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.6-3.7"/><path d="M13.2 2.6v2.8h-2.8"/></svg>',
    ring: '<span class="np-ring" aria-hidden="true"></span>',
    cv: '<svg class="cv" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"><path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/></svg>'
  };

  /* ---------- the records: each quiet project's real events, oldest first; lanes are its recent branches ---------- */
  var NPD = {
    om: { name: 'operating model', url: 'https://github.com/shumpmaster/Personal-Org-Operating-Model',
      purpose: 'The rules and tools every project’s AI team works by.',
      merged: 20, month: '20 pull requests merged this month', monthShort: '20 merged this month', monthLong: '20 pull requests merged from 1 to 14 November; version 3.7.3 released on 13 November.',
      latest: 'The latest: the spec-number fix, built and merged as version 3.7.3 on 13 November, then two lessons from the timeline work.',
      earlier: 'Earlier this month: 17 more pull requests merged, 4 to 11 Nov',
      words: { '#57': 'Lessons', '#58': 'The fix', '#59': 'More lessons' },
      lanes: { a: 'Four lessons', b: 'The spec-number fix', c: 'Its build', d: 'Two lessons' },
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
    ml: { name: 'Model-Lab', url: 'https://github.com/shumpmaster/Model-Lab',
      purpose: 'A lab where the AI team tries out how models are made to work.',
      merged: 77, month: '77 pull requests merged since 4 November', monthShort: '77 merged since 4 Nov', monthLong: '77 pull requests merged from 4 to 14 November (the copy the desk reads starts on 4 November).',
      latest: 'The latest: six pull requests on 13 November, all on its piece of work P-002 and your answers to its cards.',
      earlier: 'Earlier this month: 71 more pull requests merged, 4 to 13 Nov',
      words: { '#112': 'Answer', '#113': 'Plan', '#118': 'Files' },
      lanes: { a: 'Your answer recorded', b: 'P-002’s plan', c: 'A handoff' },
      ev: [
        { d: '13 Nov', t: '9:32 am', k: 'merge', l: 'm', from: 'a', title: 'Your answer on a card recorded: you confirm each trial look’s touch lines', code: 'PR #112 · P-002', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '5:10 pm', k: 'merge', l: 'm', from: 'b', title: 'The plan passed at its second stop; the touch log’s guard written in', code: 'PR #113 · P-002', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '5:30 pm', k: 'merge', l: 'm', from: 'b', title: 'Your two answers recorded: a focused fix, and a plan a piece’s own work wrote is its own', code: 'PR #114 · P-002', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '5:45 pm', k: 'merge', l: 'm', from: 'b', title: 'The plan’s last points written in and checked', code: 'PR #116 · P-002 · handoffs 20, 21', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '7:02 pm', k: 'merge', l: 'm', from: 'b', title: 'The research question re-quoted at the passed plan', code: 'PR #117 · P-002', st: 'Merged', who: 'you' },
        { d: '13 Nov', t: '7:06 pm', k: 'merge', l: 'm', from: 'c', title: 'Your answer recorded: a piece’s work is its own files', code: 'PR #118', st: 'Merged', who: 'you' }
      ] },
    pf: { name: 'portfolio', url: 'https://github.com/shumpmaster/portfolio',
      purpose: 'Where the ideas for new projects, and the facts behind them, are kept.',
      merged: 11, month: '11 pull requests merged this month', monthShort: '11 merged this month', monthLong: '11 pull requests merged from 1 to 12 November; nothing since.',
      latest: 'The latest: the idea of a listing of every session, logged on 12 November.',
      earlier: 'Earlier this month: 5 more pull requests merged, 1 to 8 Nov',
      words: { '#7': 'Ask', '#12': 'Kick-off', '#13': 'Idea' },
      lanes: { a: 'The screening ask', b: 'Library entries', c: 'The timeline’s kick-off', d: 'An idea' },
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
  var NPST = { Merged: 'ok', Done: 'ok', Passed: 'ok', Answered: 'ok', Failed: 'bad' };
  function npIs(id) { return !!NPD[id]; }
  function npOn() { return state.view === 'proj' && npIs(state.proj) && !!PLANS[state.proj]; }
  function npMode(id) { return NP.s === 'cant' && id === 'ml' ? 'cant' : NP.s === 'checking' && id === 'pf' ? 'checking' : ''; }

  /* ---------- the phase-less plan the renderer is fed: one block, not shown as a phase; one branch per lane ---------- */
  function npT(e) { var m = /^(\d+):(\d\d) (am|pm)$/.exec(e.t), h = +m[1] % 12 + (m[3] === 'pm' ? 12 : 0); return e.d + ' ' + (h < 10 ? '0' : '') + h + ':' + m[2]; }
  function npPlan(id) {
    var d = NPD[id], items = [], by = {};
    Object.keys(d.lanes).forEach(function (k) {
      var sp = { name: d.lanes[k], label: '', st: 'done', events: [] }; by[k] = { i: items.length, sp: sp };
      items.push({ id: 'Branch-' + (items.length + 1), name: d.lanes[k], st: 'reached', sprints: [sp], npLane: k });
    });
    d.ev.forEach(function (e) {
      var main = e.k === 'merge' && e.l === 'm', lane = e.k === 'merge' ? e.from : e.l, pr = (e.code.match(/#\d+/) || [''])[0];
      var x = ev(npT(e), e.k, NPST[e.st] === 'bad' ? 'failed' : 'done', e.who, main && pr ? 'Merged PR ' + pr + ': ' + e.title : e.title, e.code);
      if (e.k === 'merge' && !main) x.into = true;   /* a merge into a branch (the build into the fix's branch) stays on its branch */
      var B = by[lane]; e._i = B.i; e._e = B.sp.events.length; B.sp.events.push(x);
    });
    var plan = [{ type: 'phase', name: d.name, st: 'current', note: 'now', items: items }];
    plan.noPlan = true; return plan;
  }
  /* main's words under each merge: the renderer's own table (v45), given each quiet project's pull requests */
  Object.keys(NPD).forEach(function (id) { var w = NPD[id].words; Object.keys(w).forEach(function (k) { ML45[k] = w[k]; }); });
  /* where main is crowded (Model-Lab's six merges, portfolio's seven) the rest carry their number alone, as v25's labels shorten to it */
  var _shortTitleNp = shortTitle;
  shortTitle = function (x) { var m = npOn() && x.k === 'merge' && !x.into && /#\d+/.exec(x.title); if (m && !ML45[m[0]]) return m[0]; return _shortTitleNp.apply(this, arguments); };

  /* the plan is there only while its page is open: home reads PLANS for its phase strips, and a quiet project has none */
  function npDrop() { Object.keys(NPD).forEach(function (id) { if (PLANS[id] && PLANS[id].noPlan) delete PLANS[id]; }); }
  var _renderProjectNp = renderProject;
  renderProject = function (id) {
    npDrop();
    if (npIs(id)) { PLANS[id] = npPlan(id); state.fitSel[id] = null; state.sl[id] = null; npSm(id); }
    document.documentElement.classList.toggle('np-on', npIs(id));
    var r = _renderProjectNp.apply(this, arguments);
    if (npIs(id)) npAfter(id);
    return r;
  };
  var _renderDeskNp = renderDesk;
  renderDesk = function () { npDrop(); document.documentElement.classList.remove('np-on'); return _renderDeskNp.apply(this, arguments); };

  /* the lanes' names: the branch's name alone (a planned project's lanes carry a sprint number; a branch has none) */
  function npLabels(svg) { return svg.replace(/(<text class="lb"[^>]*>)[\d.]+ /g, '$1').replace(/<text class="fl ml"( x="[\d.]+" y="[\d.]+">#\d+<\/text>)/g, '<text class="fl ml np-no"$1'); }
  var _mapSVGNp = mapSVG; mapSVG = function () { var s = _mapSVGNp.apply(this, arguments); return npOn() ? npLabels(s) : s; };
  var _fitSVGNp = fitSVG; fitSVG = function () { var s = _fitSVGNp.apply(this, arguments); return npOn() ? npLabels(s) : s; };

  /* ---------- the list: option A's rows, each with its station's data-k ---------- */
  function npRow(id, e) {
    var main = e.l === 'm', k = MAP && MAP.key ? MAP.key['0:' + e._i + ':0:' + e._e] : undefined;
    return '<div class="qp-ev' + (main ? ' main' : '') + '"' + (k !== undefined ? ' data-k="' + k + '"' : '') + '><span class="v13ico' + (main ? ' main' : '') + '">' + (ICONS[e.k] || '') + mark(NPST[e.st] || 'ok') + '</span>' +
      '<div class="qp-tx"><div class="qp-meta">' + esc(KL[e.k] || e.k) + ' · ' + esc(e.t) + ' · ' + (main ? 'main' : esc(NPD[id].lanes[e.l])) + '</div>' +
      '<div class="qp-t"><b>' + esc(e.title) + '</b> <span class="pw-code">' + esc(e.code) + '</span></div>' +
      '<div class="qp-by"><span class="qp-st ' + (NPST[e.st] || 'ok') + '">' + esc(e.st) + '</span> by ' + esc(e.who) + '</div></div></div>';
  }
  function npCant(d) {
    return '<div class="qp-cant" role="status"><p><b>The desk can’t read ' + esc(d.name) + ' since ' + NP_CANT + '.</b> What shows here is from then; anything newer, even something waiting on you, would not show.' + NP_EX + '</p>' +
      '<div class="qp-acts"><button type="button" class="qp-btn main" data-npa="again">' + NPI.again + 'Try again</button>' +
      '<a class="qp-btn" href="' + d.url + '" target="_blank" rel="noopener">' + NPI.ext + 'Open on GitHub</a></div><p class="qp-said" aria-live="polite"></p></div>';
  }
  function npList(id) {
    var d = NPD[id], mode = npMode(id), h = mode === 'cant' ? npCant(d) : '';
    h += '<div class="qp-list' + (mode === 'checking' ? ' qp-shim' : '') + '" aria-busy="' + (mode === 'checking') + '"><div class="qp-lh"><h2>What happened lately</h2><span>top down, oldest first</span></div>';
    h += '<p class="qp-earlier">' + esc(d.earlier) + '</p>';
    var day = '';
    d.ev.forEach(function (e) { if (e.d !== day) { day = e.d; h += '<div class="qp-day">' + esc(day) + '</div>'; } h += npRow(id, e); });
    if (mode === 'cant') h += '<div class="qp-end bad"><span class="qp-st bad">Can’t read</span> Nothing newer can be shown: the desk last read ' + esc(d.name) + ' at ' + NP_CANT + '.' + NP_EX + '</div>';
    else if (mode === 'checking') h += '<div class="qp-end"><span class="qp-spin" aria-hidden="true"></span> Checking for anything newer…</div>';
    else h += '<div class="qp-end"><span class="qp-nowdot" aria-hidden="true"></span><b>Now · ' + NP_NOW + '</b> Nothing newer. Read 1 min ago.</div>';
    return h + '</div><div class="v13end"></div>';
  }
  var _list13Np = list13;
  list13 = function () { return npOn() ? npList(state.proj) : _list13Np.apply(this, arguments); };
  /* the map's filter fades option A's rows as it fades a planned project's */
  if (typeof fhApply === 'function') { var _fhApplyNp = fhApply; fhApply = function () { var r = _fhApplyNp.apply(this, arguments);
    if (npOn()) { var info = fhInfo(), p = FH.pick, on = p !== 'all';
      document.querySelectorAll('#v13list .qp-ev[data-k]').forEach(function (e) { var i = info[e.dataset.k]; e.classList.toggle('fh-out', on && !(i && fhMatch(p, i))); }); }
    return r; }; }

  /* ---------- the summary line: v46's own line, written for a project with no plan; it opens About this project ---------- */
  function npLine(d, mode) {
    if (mode === 'checking') return { dot: 'run', long: 'Checking ' + d.name + '…', short: 'Checking…' };
    if (mode === 'cant') return { dot: 'bad', long: 'Can’t read since ' + NP_CANT + ' · tap for what to do', short: 'Can’t read since ' + NP_CANT };
    /* the line is never cut (ProjectSummary): "No plan yet · 20 pull requests merged this month · nothing waits on you" would be, even at 393,
       so it says the count briefly, and below 380 only what matters most; the sheet gives the month in full */
    return { dot: 'np-quiet', long: 'No plan yet · ' + d.merged + ' merged · nothing for you', short: 'No plan yet · nothing waits on you' };
  }
  function npSm(id) { var d = NPD[id], L = npLine(d, npMode(id)); SM46[id] = { name: d.name, dot: L.dot, purpose: d.purpose, line: L.long, short: L.short, np: true }; }
  var _sm46SheetNp = sm46Sheet;
  sm46Sheet = function () { if (npOn()) return npSheet(); return _sm46SheetNp.apply(this, arguments); };
  function npSheet() {
    var id = state.proj, d = NPD[id]; if (!d) return; var mode = npMode(id); if (typeof knClose === 'function') knClose();
    var ex = '<span class="sm-ex">Example</span>', st = [];
    if (mode === 'cant') st = ['The desk can’t read ' + d.name + ' since ' + NP_CANT + ', so this page shows what it read then. Anything newer would not show, even something that waits on you.', 'Try again reads it now; Open on GitHub shows the repository itself.'];
    else if (mode === 'checking') st = ['The desk is reading ' + d.name + ' from GitHub now. What shows is from its last read until this one finishes.'];
    else st = ['No plan on record: the AI team has not filed phases or milestones for this project, so its page shows what happened, top down.', d.latest];
    var h = '<div class="kd">About this project</div><h2>' + esc(d.name) + '</h2><p class="sm-pur">' + esc(d.purpose) + ' ' + ex + '</p>' +
      '<h3>Where it stands</h3>' + st.map(function (s) { return '<p>' + esc(s) + '</p>'; }).join('') +
      (mode === 'cant' ? '<div class="qp-acts"><button type="button" class="qp-btn main" data-npa="again">' + NPI.again + 'Try again</button><a class="qp-btn" href="' + d.url + '" target="_blank" rel="noopener">' + NPI.ext + 'Open on GitHub</a></div><p class="qp-said" aria-live="polite"></p>' : '') +
      '<h3>Its phases</h3><ul class="ck"><li><span class="m qp-none"></span><span>None on record<small>When the AI team files a plan, its phases and gates show here and on the map.</small></span></li></ul>' +
      '<h3>This month</h3><ul class="ck"><li><span class="m ok"></span><span>' + esc(d.monthLong) + '</span></li></ul>' +
      '<h3>What waits on you</h3><ul class="ck"><li><span class="m"></span><span>' + (mode === 'cant' ? 'Unknown while the desk can’t read it' : 'Nothing') + '</span></li></ul>' +
      '<p class="ex">The purpose is an example; the counts and events are from the repository’s history as of 14 Nov, ' + NP_NOW + '.</p>';
    var scrim = document.createElement('div'), sheet = document.createElement('div');
    scrim.className = 'kn-scrim'; sheet.className = 'kn-sheet sm-sheet qp-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'About this project');
    sheet.innerHTML = '<div class="grab" aria-hidden="true"></div><button type="button" class="x" aria-label="Close"><span>' + KNI.x + '</span></button>' + h;
    document.body.appendChild(scrim); document.body.appendChild(sheet); knSheetEl = { scrim: scrim, sheet: sheet };
    scrim.addEventListener('click', knClose); sheet.querySelector('.x').addEventListener('click', knClose);
    requestAnimationFrame(function () { requestAnimationFrame(function () { scrim.classList.add('on'); sheet.classList.add('on'); }); });
  }

  /* ---------- the top row: the phase pill says No phases yet, and its menu says why ---------- */
  var _tpFixNp = tpFix;
  tpFix = function () {
    var r = _tpFixNp.apply(this, arguments); if (!npOn()) return r;
    var ph = document.querySelector('#v13band .pl-row .tp-pill.ph'); if (!ph) return r;
    var h = NPI.ring + '<span class="t">No phases<span class="np-y"> yet</span></span>' + NPI.cv;
    if (ph.dataset.sig !== 'np') { ph.innerHTML = h; ph.dataset.sig = 'np'; ph.classList.add('np-ph'); }
    ph.setAttribute('aria-label', 'No phases yet. What this means');
    /* never cut: where the project's name leaves too little room (operating model at 393), it says "No phases" */
    var t = ph.querySelector('.t'); if (t && !ph.classList.contains('np-tight') && t.scrollWidth > t.clientWidth + 1) ph.classList.add('np-tight');
    return r;
  };
  var _tpOpenNp = tpOpen;
  tpOpen = function (btn, html) {
    if (npOn() && btn && btn.classList.contains('ph')) html = '<div class="mcap">Phases</div><p class="np-mtx">None on record yet. When the AI team files a plan for this project, its phases and gates show here.</p>';
    return _tpOpenNp.call(this, btn, html);
  };

  /* a planned project opens on its Now; a project with no plan has none, so it opens at the top of its list, oldest first (option A) */
  var _v13homeNp = v13home;
  v13home = function () { if (npOn()) { window.scrollTo(0, 0); return; } return _v13homeNp.apply(this, arguments); };

  /* after the renderer: the state's marks on the map and the line */
  function npAfter(id) {
    var mode = npMode(id), inn = document.getElementById('v13in');
    if (inn) inn.classList.toggle('qp-shim', mode === 'checking');
    var b = document.querySelector('#v13band .v13vp .sm-line'); if (b) b.remove();
    if (typeof sm46Line === 'function') sm46Line();
  }

  /* Try again: the line reads Checking…, then says what happened (the mockup sends nothing) */
  function npAgain(btn) {
    var scope = btn.closest('.qp-cant, .qp-sheet, .qp-hcant') || document;
    var said = scope.querySelector('.qp-said'), sums = [].slice.call(document.querySelectorAll('#v13band .sm-line .sm-long, #v13band .sm-line .sm-short, .qp-hcant .qp-hl'));
    var keep = sums.map(function (s) { return s.innerHTML; });
    btn.disabled = true; btn.classList.add('busy');
    sums.forEach(function (s) { s.textContent = 'Checking ' + NPD.ml.name + '…'; });
    document.querySelectorAll('#v13band .sm-line .sm-dot, .qp-hdot').forEach(function (x) { x.classList.add('run'); });
    if (said) said.textContent = 'Checking…';
    setTimeout(function () {
      sums.forEach(function (s, i) { s.innerHTML = keep[i]; });
      document.querySelectorAll('#v13band .sm-line .sm-dot, .qp-hdot').forEach(function (x) { x.classList.remove('run'); });
      btn.disabled = false; btn.classList.remove('busy');
      if (said) said.textContent = 'Tried again at ' + NP_NOW + ': still can’t read it. In the desk this asks GitHub again; the mockup sends nothing.';
    }, REDUCED ? 600 : 1500);
  }

  /* ---------- home in each state ---------- */
  function npHome() {
    var v = document.getElementById('view'); if (!v || !v.querySelector('.pr-wrap')) return;
    [].forEach.call(v.querySelectorAll('.ps45.none .ps45-l'), function (l) { if (!l.dataset.np) { l.dataset.np = '1'; l.textContent = 'No phases yet'; } });
    [].forEach.call(v.querySelectorAll('.ps45.none[aria-label="No phases on record for this project"]'), function (s) { s.setAttribute('aria-label', 'No phases yet for this project'); });
    if (NP.s === 'calm') npCalm(v);
    if (NP.s === 'first') npFirst(v);
    if (NP.s === 'cant') npHomeCant(v);
  }
  function npCalm(v) {
    if (!v.querySelector('.qp-calm')) {
      var sum = v.querySelector('.sg-sum');
      var c = document.createElement('div'); c.className = 'qp-calm'; c.setAttribute('role', 'status');
      c.innerHTML = '<span class="qp-calm-dot" aria-hidden="true"></span><div><p class="qp-calm-1">Nothing needs you.</p><p class="qp-calm-2">The AI team is at work on 1 project; the other 4 are quiet. Read 1 min ago.' + NP_EX + '</p></div>';
      (sum || v.querySelector('.pr-wrap')).insertAdjacentElement('beforebegin', c);
    }
    [].forEach.call(v.querySelectorAll('.sg-grp[data-sgg="tl"] .ps45-l, .sg-grp[data-sgg="wd"] .ps45-l'), function (l) { var b = l.querySelector('b'); if (b && l.childNodes.length > 1) l.innerHTML = '<b>' + esc(b.textContent) + '</b>'; });
    [].forEach.call(v.querySelectorAll('.sg-grp[data-sgg="tl"] .wait, .sg-grp[data-sgg="tl"] .bad, .sg-grp[data-sgg="wd"] .wait, .sg-grp[data-sgg="wd"] .bad'), function (x) {
      if (x.closest('.ps45-bar, .sg-row')) { x.classList.remove('wait'); x.classList.remove('bad'); if (x.classList.contains('cur')) x.classList.add('qp-cur'); } });
    [].forEach.call(v.querySelectorAll('.sg-grp[data-sgg="tl"] .sg-row .l2, .sg-grp[data-sgg="wd"] .sg-row .l2'), function (l) {
      if (l.dataset.np) return; l.dataset.np = '1'; var g = l.closest('.sg-grp').dataset.sgg;
      l.innerHTML = (g === 'tl' ? 'Design: the AI team is writing the next plan.' : 'Discovery: its brief is being reworked.') + NP_EX; });
  }
  function npFirst(v) {
    if (v.querySelector('.qp-welcome')) return;
    var sum = v.querySelector('.sg-sum');
    var c = document.createElement('p'); c.className = 'qp-welcome';
    c.innerHTML = '<b>Welcome.</b> This is all your projects at once. From your next visit, anything new since this one is marked.' + NP_EX;
    (sum || v.querySelector('.pr-wrap')).insertAdjacentElement('beforebegin', c);
  }
  function npHomeCant(v) {
    var q = v.querySelector('.sg-quiet'); if (!q || v.querySelector('.qp-hcant')) return;
    var ml = q.querySelector('.sg-row[data-sgp="ml"]'); if (!ml) return;
    var strip = ml.nextElementSibling && ml.nextElementSibling.classList.contains('sg-strip') ? ml.nextElementSibling : null;
    var sec = document.createElement('section'); sec.className = 'sg-grp qp-hcant'; sec.setAttribute('aria-label', 'Model-Lab: can’t read');
    ml.classList.add('qp-hrow'); sec.appendChild(ml);
    var l2 = ml.querySelector('.l2'); if (l2) l2.innerHTML = '<span class="qp-hdot" aria-hidden="true"></span><span class="qp-hl">Can’t read since ' + NP_CANT + '</span>' + NP_EX;
    if (strip) strip.remove();
    sec.insertAdjacentHTML('beforeend', '<p class="qp-hsub">So nothing from Model-Lab after ' + NP_CANT + ' shows, even something that waits on you.</p>' +
      '<div class="qp-acts"><button type="button" class="qp-btn main" data-npa="again">' + NPI.again + 'Try again</button><a class="qp-btn" href="' + NPD.ml.url + '" target="_blank" rel="noopener">' + NPI.ext + 'Open on GitHub</a></div><p class="qp-said" aria-live="polite"></p>');
    q.insertAdjacentElement('beforebegin', sec);
    var l1 = q.querySelector('[data-sgq] .l1'); if (l1) l1.textContent = 'Nothing waits on you in operating model, portfolio';
  }
  function npFirstMarks() {
    if (NP.s !== 'first') return;
    [].forEach.call(document.querySelectorAll('.pp-dot, .fh-pline .new'), function (x) { x.classList.add('qp-gone'); });
  }
  function npApply() { npHome(); npFirstMarks(); }
  var npObs = new MutationObserver(function () { if (!npObs.raf) npObs.raf = requestAnimationFrame(function () { npObs.raf = 0; try { npApply(); } catch (err) { console.error(err); } }); });
  npObs.observe(document.body, { childList: true, subtree: true });

  /* ---------- More's "Mockup only" menu: the four states, each on, and off again ---------- */
  var NP_STATES = [['calm', 'Nothing waiting'], ['checking', 'Checking'], ['cant', 'Can’t read'], ['first', 'First open']];
  var _openMenuNp = openMenu;
  openMenu = function () {
    var r = _openMenuNp.apply(this, arguments); if (!menuEl) return r;
    var sep = menuEl.querySelector('.msep');
    var h = '<div class="msep"></div><div class="mcap">Mockup only: preview a state</div>' + NP_STATES.map(function (x) {
      return '<button type="button" class="mi" data-npst="' + x[0] + '" aria-pressed="' + (NP.s === x[0]) + '">' + UI.eye + '<span>' + x[1] + '</span>' + (NP.s === x[0] ? '<span class="ck">' + UI.check + '</span>' : '') + '</button>'; }).join('');
    if (sep) sep.insertAdjacentHTML('beforebegin', h); else menuEl.insertAdjacentHTML('beforeend', h);
    var rr = menuEl.getBoundingClientRect(); if (rr.bottom > window.innerHeight - 8) menuEl.style.top = Math.max(8, window.innerHeight - 8 - rr.height) + 'px';
    return r;
  };
  function npSet(s) {
    var de = document.documentElement;
    if (NP.s) de.classList.remove('qp-s-' + NP.s);
    NP.s = NP.s === s ? '' : s;
    if (NP.s) de.classList.add('qp-s-' + NP.s);
    closeLayers(true); if (typeof knClose === 'function') knClose();
    var tb = document.querySelector('#tabbar [data-tab="needs"]'); if (tb) tb.classList.toggle('qp-nobadge', NP.s === 'calm');
    if (state.view === 'desk' || state.view === 'proj') { var y = window.scrollY; render(); if (state.view === 'proj') window.scrollTo(0, y); }
    npApply();
  }
  window.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var st = t.closest('[data-npst]'); if (st) { e.stopImmediatePropagation(); e.preventDefault(); npSet(st.dataset.npst); return; }
    var ag = t.closest('[data-npa="again"]'); if (ag) { e.stopImmediatePropagation(); e.preventDefault(); npAgain(ag); return; }
  }, true);
  window.__np = { NP: NP, set: npSet, NPD: NPD, plan: npPlan };
