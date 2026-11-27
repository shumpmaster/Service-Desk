  /* ================= round 9: the Needs-you tab, options over v47 (docs/design/audit-2026-11-27-v46-screens.md, section 3, candidate 1).
     The phone's hash, tokens joined by dots: now | A | B | C (the option; now = v47 as it is, the tab tapped);
     light or dark (set by the theme script); kinds (four example rows for the other kinds of ask); sheet=q|pr|deploy|session (that sheet open);
     by (B: grouped by project); home (stay on home, the tab not yet tapped).
     The waiting rows are home's priority list itself, cloned as it stands. The answered rows are the owner's real rulings of 12 to 14 Nov,
     the mockup's own days, with their times in Chicago time; everything else the tab draws is an example and says so. ================= */
  var NY = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.').filter(function (x) { return x !== 'light' && x !== 'dark'; });
    var o = { opt: h[0] || 'now', kinds: false, sheet: '', by: false, home: false, open: false, seg: 'yours', earlier: false, team: false, y: 0, rows: '', asof: '', tried: false };
    h.slice(1).forEach(function (t) { if (t === 'kinds') o.kinds = true; else if (t === 'by') o.by = true; else if (t === 'home') o.home = true; else if (/^sheet=/.test(t)) o.sheet = t.slice(6); });
    if (['now', 'A', 'B', 'C'].indexOf(o.opt) < 0) o.opt = 'now';
    if (o.by) o.seg = 'by'; else if (o.opt === 'B') o.seg = 'order';
    document.documentElement.classList.add('ny-' + o.opt);
    return o;
  })();
  var NYI = {
    ok: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.4l2.9 2.8 6.1-6.4"/></svg>',
    wait: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="5.6"/><path d="M8 4.8V8l2.2 1.4"/></svg>',
    back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.2 6.2A5.2 5.2 0 1 1 3 9.6"/><path d="M2.8 2.8v3.6h3.6"/></svg>',
    team: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="5.6" r="2.3"/><path d="M1.8 13.4c.5-2.4 2.2-3.7 4.2-3.7s3.7 1.3 4.2 3.7"/><path d="M10.6 3.6a2.2 2.2 0 0 1 0 4.2M12.2 10c1.1.5 1.8 1.6 2 3.4"/></svg>',
    session: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 3.5h11v7.5H8l-3 2.5V11H2.5z"/><path d="M6.6 5.6L9.4 7.3 6.6 9z"/></svg>',
    chev: '<svg class="ny-chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5"/></svg>'
  };
  var NY_EX = ' <i class="pw-ex">example</i>';
  var NY_PN = { tl: 'The timeline', wd: 'Home-screen widget', om: 'operating model', ml: 'Model-Lab', pf: 'portfolio' };

  /* ---------- what the owner already ruled: the records, newest first (14 Nov 14:47Z and 04:58Z, 13 Nov, 12 Nov; Chicago is UTC-6) ---------- */
  var NY_ANS = [
    { p: 'tl', t: '8:47 am', say: 'You chose “360 and 414”', what: 'the timeline fits phones 360 and 414 points wide, with no sideways scroll', code: 'S-011 widths · A',
      read: { q: 'Which phone widths must the timeline fit with no sideways scrolling?', opts: [['360 and 414 (Recommended)', 1], ['375 and 430']], words: ['360 and 414 (Recommended)'],
        then: 'S-011 names 360 and 414 as yours, and its open question 1 is closed. A later spec may change the widths.', rec: 'decisions/questions/P-005-s011-widths.md' } },
    { p: 'tl', t: '8:47 am', say: 'You chose “Accept the reading”', what: 'every waiting thing reaches your phone by name, aiming at 5 minutes, with no promised time', code: 'S-011 M8 reading · A',
      read: { q: 'For “each thing that needs you reaches your phone”, is it enough that every waiting thing is sent by name, aiming at 5 minutes and counting every late or missed alert, without a guaranteed time?',
        opts: [['Accept the reading (Recommended)', 1], ['Not enough']], words: ['What does a time promise mean? Like how long a task should take?', 'Accept the reading (Recommended)', 'Yes, all of it (Recommended)'],
        then: 'S-011’s reading of M8 stands as yours: sent by name, aiming at 5 minutes, every late or missed alert counted; the normal alert level if Time Sensitive is not available; no daily cap.', rec: 'decisions/questions/P-005-s011-m8-reading.md' } },
    { p: 'tl', t: '8:47 am', say: 'You chose “Fix the pack”', what: 'the spec writer may read the work’s experiment files and your answers', code: 'Definer pack · A',
      read: { q: 'Let the spec writer see the work’s own experiment files and your answers filed under its name, so it can act on them?', opts: [['Fix the pack (Recommended)', 1], ['No fix']], words: ['Fix the pack (Recommended)'],
        then: 'The spec writer’s reading list gains the work’s experiment files and your answers (governance/PACKS.toml); ledger L-0055.', rec: 'decisions/questions/P-005-definer-pack.md' } },
    { p: 'tl', t: '13 Nov, 10:58 pm', say: 'You chose “criteria-wrong”', what: 'a new spec replaces the first plan, its checks start again, and it is not a strike', code: 'Stop card 4 · S-010', kn: 's:Stop card 4' },
    { p: 'tl', t: '13 Nov, 10:58 pm', say: 'You chose “Take 3.7.3 now”', what: 'the desk takes the operating model’s spec-number fix before any new spec is numbered', code: 'Model 3.7.3 · A',
      read: { q: 'Should the desk take the operating model’s spec-number fix (version 3.7.3) now?', opts: [['Take 3.7.3 now (Recommended)', 1], ['Wait for a full sync']], words: ['Take 3.7.3 now (Recommended)'],
        then: 'The desk’s two orchestrator tools took the fix; the desk now reads version 3.7.3.', rec: 'decisions/questions/P-005-model-3.7.3.md' } },
    { p: 'tl', t: '13 Nov, 10:58 pm', say: 'You chose “Fix the pack”', what: 'the plan reviewer may read the experiment files and its own earlier review', code: 'Critic pack · A',
      read: { q: 'Should the timeline’s plan reviewer be allowed to see the work’s own experiment files and its own earlier plan review?', opts: [['Fix the pack (Recommended)', 1], ['No fix']], words: ['Fix the pack (Recommended)'],
        then: 'The plan reviewer’s reading list gains the experiment files and its own earlier review: three more files on the timeline’s case. Ledger L-0053.', rec: 'decisions/questions/P-005-critic-pack.md' } },
    /* older than 24 hours: folded under Earlier */
    { p: 'tl', t: '13 Nov, 10:10 am', say: 'You chose “Proceed”', what: 'the timeline work went from Discovery into Design', code: 'Design gate · dor-3', kn: 'g:Design gate', old: 1 },
    { p: 'tl', t: '13 Nov, 8:18 am', say: 'You chose “Hold for case 2”', what: 'the case for going on was written again and read again', code: 'Design gate · dor-2', kn: 'd:You said hold', old: 1 },
    { p: 'tl', t: '12 Nov, 10:48 pm', say: 'Resubmit, for you under your standing proxy', what: 'the brief went back for its readiness check, which then passed', code: 'Readiness card · dor-fail-1', kn: 'd:You said resubmit', old: 1 }
  ];
  /* examples: an answer sent but not yet recorded, and one kicked back (P-005-acting: each answer finishes with one tap on GitHub's page;
     P-001-board-bounce: not confirmed after about 5 minutes, it moves to a lane of its own, never back to Waiting) */
  var NY_SENT = { p: 'om', say: 'You chose “Merge”', what: 'two new lessons go into the operating model', code: 'Pull request',
    meta: 'Sent 11:24 am · finished on GitHub; the desk shows it as answered once it reads the record (it reads every 2 minutes)' };
  var NY_KICK = { p: 'pf', say: 'You chose “Merge”', what: 'the portfolio’s yearly summary page', code: 'Pull request',
    meta: 'Sent 11:12 am · not recorded after 5 minutes, so nothing changed' };
  var NY_TEAM = { name: 'Following the second plan through its checks', day: '14 Nov', who: 'the Chief of Staff, your lead AI assistant', since: 'since 7:52 am', p: 'tl' };
  /* examples: the other kinds of ask, one each (audit section 3, candidate 1, "Also missing inside it") */
  var NY_KINDS = [
    { k: 'q', p: 'tl', ev: 'A question for you', code: 'Question', q: 'Should every merge send a phone alert, or only what needs you?', why: 'Holds up nothing yet', wait: '20 min', btn: 'Answer' },
    { k: 'pr', p: 'om', ev: 'A pull request to merge', code: 'Pull request', q: 'Merge the session names and the handover flag into the operating model?', why: 'Holds up the desk’s session names', wait: '1 h 5 min', btn: 'Merge or not' },
    { k: 'deploy', p: 'tl', ev: 'A deploy to approve', code: 'Deploy', q: 'The desk’s new version is ready to go live. Approve it?', why: 'Holds up nothing else', wait: '6 min', btn: 'Approve or hold' },
    { k: 'session', p: 'ml', ev: 'A session handed over', code: 'Handover', q: 'Start the next session for Model-Lab’s Chief of Staff?', why: 'Its session ended with work open', wait: '35 min', btn: 'See the handover' }
  ];

  function nyChip(p) { return '<span class="pr-chip">' + esc(NY_PN[p] || p) + '</span>'; }
  function nyCount() { return NY.rowsN + (NY.kinds ? NY_KINDS.length : 0); }
  function nyCache() {
    var l = document.querySelector('#view > .pr-wrap .pr-list'); if (!l || !l.querySelector('.pr-row .pw-what')) return false;
    NY.rows = [].map.call(l.querySelectorAll(':scope > .pr-row'), function (r) { return r.outerHTML; }); NY.rowsN = NY.rows.length;
    var a = document.querySelector('#view > .fh-lt .asof'); if (a) NY.asof = a.textContent.trim();
    return true;
  }
  function nyRowsOf(p) { /* home's rows for one project, by their chip */
    return NY.rows.filter(function (h) { return !p || h.indexOf('<span class="pr-chip">' + esc(NY_PN[p])) >= 0; });
  }
  function nyKindRow(x, n) {
    return '<div class="pr-row ny-krow" data-pw="1" data-nyk="' + x.k + '"><span class="pr-n">' + n + '</span><div style="flex:1;min-width:0">' +
      '<button type="button" class="pr-b" data-nyopen="' + x.k + '"><span class="pr-top">' + nyChip(x.p) + '</span>' +
      '<span class="ev41"><b>' + esc(x.ev) + '</b> <span class="pw-code">' + esc(x.code) + '</span>' + NY_EX + '</span>' +
      '<span class="pr-q">' + esc(x.q) + '</span><span class="pr-why"><b>' + esc(x.why) + '</b> · <span>waiting ' + esc(x.wait) + '</span></span></button>' +
      '<span class="pr-acts"><button type="button" class="pr-ans" data-nyopen="' + x.k + '">' + esc(x.btn) + '</button></span></div></div>';
  }
  function nyWaitRows(p) {
    var h = nyRowsOf(p).join(''), n = NY.rowsN;
    if (NY.kinds) NY_KINDS.forEach(function (x) { n++; if (!p || x.p === p) h += nyKindRow(x, n); });
    return h;
  }
  function nyAnsRow(a, i, label) {
    return '<button type="button" class="ny-row" data-nyans="' + i + '"><span class="ny-m ok">' + NYI.ok + '</span><span class="ny-bd">' +
      '<span class="ny-top">' + (label ? '<span class="ny-st ok">' + esc(label) + '</span>' : nyChip(a.p)) + '<span class="ny-tm">' + esc(a.t) + '</span></span>' +
      '<span class="ny-t"><b>' + esc(a.say) + ':</b> ' + esc(a.what) + ' <span class="pw-code">' + esc(a.code) + '</span></span></span>' + NYI.chev + '</button>';
  }
  function nySentRow(label) { var s = NY_SENT;
    return '<div class="ny-row"><span class="ny-m wait">' + NYI.wait + '</span><span class="ny-bd"><span class="ny-top">' + (label ? '<span class="ny-st wait">' + esc(label) + '</span>' : nyChip(s.p)) + NY_EX + '</span>' +
      '<span class="ny-t"><b>' + esc(s.say) + ':</b> ' + esc(s.what) + ' <span class="pw-code">' + esc(s.code) + '</span></span><span class="ny-meta">' + esc(s.meta) + '</span></span></div>'; }
  function nyKickRow(label) { var s = NY_KICK;
    return '<div class="ny-row ny-kick"><span class="ny-m bad">' + NYI.back + '</span><span class="ny-bd"><span class="ny-top">' + (label ? '<span class="ny-st bad">' + esc(label) + '</span>' : nyChip(s.p)) + NY_EX + '</span>' +
      '<span class="ny-t"><b>' + esc(s.say) + ':</b> ' + esc(s.what) + ' <span class="pw-code">' + esc(s.code) + '</span></span><span class="ny-meta">' + esc(s.meta) + '</span>' +
      '<span class="pr-acts"><button type="button" class="pr-ans" data-nyretry>Try again</button></span><span class="ny-said"></span></span></div>'; }
  function nyTeamRow() { var s = NY_TEAM;
    return '<div class="ny-row"><span class="ny-m team">' + NYI.team + '</span><span class="ny-bd"><span class="ny-top">' + nyChip(s.p) + '<span class="ny-tm">' + esc(s.since) + '</span></span>' +
      '<span class="ny-t"><b>' + esc(s.name) + '</b> <small class="sn-d">' + esc(s.day) + '</small>' + NY_EX + '</span><span class="ny-meta">' + esc(s.who) + '; the work waits on your answer to the stop</span></span></div>'; }
  function nyTeamLine() {
    return '<button type="button" class="ny-quiet" data-nyteam aria-expanded="' + NY.team + '"><span class="ny-dot"></span><span>With the AI team: <b>1</b></span>' + NYI.chev + '</button>' +
      (NY.team ? '<section class="sg-grp pr-card ny-card">' + nyTeamRow() + '</section>' : '');
  }
  function nyAnswered(p) {
    var now = [], old = [];
    NY_ANS.forEach(function (a, i) { if (p && a.p !== p) return; (a.old ? old : now).push(nyAnsRow(a, i)); });
    var h = now.join('');
    if (old.length) h += '<button type="button" class="ny-fold" data-nyearlier aria-expanded="' + NY.earlier + '"><span>Earlier</span><small>' + old.length + '</small>' + NYI.chev + '</button>' + (NY.earlier ? old.join('') : '');
    return h;
  }
  function nyH(t, n) { return '<div class="pr-h">' + esc(t) + (n !== undefined ? '<small>' + esc(String(n)) + '</small>' : '') + '</div>'; }
  function nyCard(h, cls) { return '<section class="sg-grp pr-card ny-card' + (cls ? ' ' + cls : '') + '">' + h + '</section>'; }
  function nySeg(items) {
    return '<div class="ny-seg" role="tablist">' + items.map(function (x) { var on = NY.seg === x[0];
      return '<button type="button" role="tab" data-nyseg="' + x[0] + '" aria-selected="' + on + '">' + esc(x[1]) + (x[2] !== undefined ? ' <small>' + x[2] + '</small>' : '') + '</button>'; }).join('') + '</div>';
  }
  function nyInOrder() {
    var nNow = NY_ANS.filter(function (a) { return !a.old; }).length;
    return nyH('Waiting on you', nyCount()) + nyCard(nyWaitRows(), 'pr-list') +
      nyH('Sent, being recorded', 1) + nyCard(nySentRow()) +
      nyH('Kicked back', 1) + '<p class="ny-note">Not recorded after about 5 minutes. Nothing changed; it stays here until you try again.</p>' + nyCard(nyKickRow()) +
      nyTeamLine() +
      nyH('Answered', 'last 24 hours · ' + nNow) + nyCard(nyAnswered());
  }
  function nyByProject() {
    var order = ['wd', 'tl', 'om', 'pf', 'ml'], h = '';
    if (!NY.kinds) order = ['wd', 'tl', 'om', 'pf'];
    order.forEach(function (p) {
      var w = nyWaitRows(p), rows = '';
      if (w) rows += w;
      if (NY_SENT.p === p) rows += nySentRow('Being recorded');
      if (NY_KICK.p === p) rows += nyKickRow('Kicked back');
      var a = nyAnswered(p); if (a) rows += a;
      var nw = nyRowsOf(p).length + (NY.kinds ? NY_KINDS.filter(function (x) { return x.p === p; }).length : 0);
      h += nyH(NY_PN[p], nw ? nw + ' waiting' : 'nothing waiting') + nyCard(rows, nw ? 'pr-list' : '');
    });
    if (!NY.kinds) h += '<p class="ny-note">Nothing waits on you in Model-Lab.</p>';
    return h + nyTeamLine();
  }
  function nyLanes() {
    var nNow = NY_ANS.length, h = nySeg([['yours', 'Yours', nyCount() + 1], ['team', 'With the team', 2], ['done', 'Done', nNow]]);
    if (NY.seg === 'team') h += nyH('Sent, being recorded', 1) + nyCard(nySentRow()) + nyH('At work', 1) + nyCard(nyTeamRow());
    else if (NY.seg === 'done') h += nyH('Answered', 'last 24 hours · ' + NY_ANS.filter(function (a) { return !a.old; }).length) + nyCard(nyAnswered());
    else h += nyH('Waiting on you', nyCount()) + nyCard(nyWaitRows(), 'pr-list') + nyH('Kicked back', 1) + '<p class="ny-note">Not recorded after about 5 minutes. Nothing changed.</p>' + nyCard(nyKickRow());
    return h;
  }
  function nyHtml() {
    var n = nyCount(), nNow = NY_ANS.filter(function (a) { return !a.old; }).length;
    var h = '<div class="ny-bar" aria-hidden="true">Needs you</div><div class="ny-lt"><div class="asof"><i></i>' + esc(NY.asof || 'Live · as of 11:25 am CT') + '</div><h1>Needs you</h1><i class="tt-mark" aria-hidden="true"></i></div>' +
      '<p class="ny-sum"><b>' + n + (n === 1 ? ' thing waits' : ' things wait') + ' on you.</b> You answered ' + nNow + ' in the last 24 hours.</p>';
    if (NY.opt === 'B') h += nySeg([['order', 'In order'], ['by', 'By project']]) + (NY.seg === 'by' ? nyByProject() : nyInOrder());
    else if (NY.opt === 'C') h += nyLanes();
    else h += nyInOrder();
    return h + '<p class="ny-foot">Waiting: home’s list, as it stands. Answered: your rulings of 12 to 14 Nov, from decisions/. Rows marked example: no record carries them yet.</p>';
  }
  function nyDraw(keepY) {
    var v = document.getElementById('view'); if (!v) return;
    var el = v.querySelector(':scope > .ny-view');
    if (!el) { el = document.createElement('div'); el.className = 'ny-view'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Needs you'); v.appendChild(el); }
    var y = window.scrollY; el.innerHTML = nyHtml(); if (keepY) window.scrollTo(0, y);
  }
  function nyTabs() {
    var t = document.getElementById('tabbar'); if (!t || NY.opt === 'now') return;
    [].forEach.call(t.querySelectorAll('[data-tab]'), function (b) {
      var k = b.dataset.tab;
      if (NY.open) { var want = k === 'needs' ? 'true' : 'false'; if (b.getAttribute('aria-current') !== want) b.setAttribute('aria-current', want); if (k === 'plan' && !b.disabled) b.disabled = true; }
      if (k === 'needs') { var bd = b.querySelector('.ny-badge'), n = String(nyCount());
        if (!bd) { bd = document.createElement('span'); bd.className = 'ny-badge'; bd.setAttribute('aria-hidden', 'true'); b.appendChild(bd); }
        if (bd.textContent !== n) bd.textContent = n; var lab = 'Needs you, ' + n + ' waiting'; if (b.getAttribute('aria-label') !== lab) b.setAttribute('aria-label', lab); }
    });
  }
  function nyOpen() {
    if (NY.open) { window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); return; }
    if (!NY.rows) nyCache();
    if (state.view === 'proj') { closeProject(); if (v33Push) v33Push.finish(); NY.y = 0; } else NY.y = window.scrollY;
    nyShClose(true); if (typeof knClose === 'function') knClose();
    NY.open = true; document.documentElement.classList.add('ny-open'); nyDraw(); window.scrollTo(0, 0); nyScroll(); nyTabs();
  }
  function nyClose() {
    if (!NY.open) return; NY.open = false; document.documentElement.classList.remove('ny-open', 'ny-scrolled');
    var el = document.querySelector('#view > .ny-view'); if (el) el.remove();
    var t = document.getElementById('tabbar'); if (t) { var d = t.querySelector('[data-tab="desk"]'), n = t.querySelector('[data-tab="needs"]');
      if (d) d.setAttribute('aria-current', String(state.view === 'desk')); if (n) n.setAttribute('aria-current', 'false'); }
    window.scrollTo(0, NY.y); window.dispatchEvent(new Event('scroll'));
  }
  function nyScroll() { if (NY.open) document.documentElement.classList.toggle('ny-scrolled', window.scrollY > 64); }
  window.addEventListener('scroll', nyScroll, { passive: true });

  /* ---------- the sheets for the other kinds of ask, and a reader for a ruling with no sheet of its own ---------- */
  var nyShEl = null;
  function nyShClose(instant) {
    if (!nyShEl) return; var s = nyShEl; nyShEl = null; s.sheet.classList.remove('on'); s.scrim.classList.remove('on');
    setTimeout(function () { s.sheet.remove(); s.scrim.remove(); }, instant || REDUCED ? 0 : 260);
  }
  function nySheetOpen(h, label) {
    nyShClose(true);
    var scrim = document.createElement('div'), sheet = document.createElement('div');
    scrim.className = 'kn-scrim'; sheet.className = 'kn-sheet ny-sheet'; sheet.dataset.pw = '1'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', label);
    sheet.innerHTML = '<div class="grab" aria-hidden="true"></div><button type="button" class="x" aria-label="Close"><span>' + KNI.x + '</span></button>' + h;
    document.body.appendChild(scrim); document.body.appendChild(sheet); nyShEl = { scrim: scrim, sheet: sheet };
    scrim.addEventListener('click', function () { nyShClose(); }); sheet.querySelector('.x').addEventListener('click', function () { nyShClose(); });
    sheet.addEventListener('click', function (e) {
      var a = e.target.closest('[data-nysay]'); if (!a) return; var box = sheet.querySelector('.kn-ans');
      box.innerHTML = '<div class="done">' + esc(a.dataset.nysay) + ' The mockup sends nothing.</div>';
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { scrim.classList.add('on'); sheet.classList.add('on'); }); });
    return sheet;
  }
  function nyOpt(label, follows, key, say, rec) {
    return '<button type="button" class="opt' + (rec ? ' rec' : '') + '" data-nysay="' + esc(say) + '"><b>' + esc(label) + '</b>' + esc(follows) + '<span class="pw-key">' + esc(key) + '</span></button>';
  }
  var NY_SHEETS = {
    q: function () { return '<div class="kd">' + ICONS.decision + 'Question</div><p class="pw-what">A question: the AI team needs your call before it goes on. Each question has its own answer.</p>' +
      '<h2>Should every merge send a phone alert, or only what needs you?</h2><p class="pw-code pw-sub">Question · The timeline' + NY_EX + '</p>' +
      '<div class="row">' + knSt('wait', 'Waiting on you') + knYou('Yours') + '</div>' +
      '<h3>Why it is asked</h3><p>Everything that waits on you sends an alert to your phone. Merges, yours or the AI team’s, could alert too, or only show here and on the bell.</p>' +
      '<h3>Your answer</h3><div class="opts">' +
        nyOpt('Only what needs you', 'Merges show here and on the bell; your phone stays quiet for them.', 'only-needs', 'In the desk this opens GitHub’s page with “Only what needs you” filled in; one tap there records it, and it shows under Sent until the record lands.', 1) +
        nyOpt('Every merge too', 'Each merge also sends an alert to your phone.', 'every-merge', 'In the desk this opens GitHub’s page with “Every merge too” filled in; one tap there records it.') + '</div>' +
      '<h3>Or in your own words</h3><textarea class="ny-own" rows="3" placeholder="Say it your way; it is recorded as you write it" aria-label="Your answer in your own words"></textarea>' +
      '<div class="ny-acts"><button type="button" class="ny-main" data-nysay="In the desk this opens GitHub’s page with your words filled in; one tap there records them.">Send your words</button></div>' +
      '<p class="ex">The recommendation is marked, not picked. Your answer finishes with one tap on GitHub’s page; the desk holds no key that writes.</p><div class="kn-ans"></div>' +
      knRec(['An example: no question file carries it', 'decisions/questions/P-001-trial-view-notes-1.md, note 15 (each question its own answer box)', 'decisions/questions/P-005-acting.md (finish on GitHub)']); },
    pr: function () { return '<div class="kd">' + ICONS.pr + 'Pull request</div><p class="pw-what">A pull request is a set of changes waiting to be merged into a project.</p>' +
      '<h2>Merge the session names and the handover flag into the operating model?</h2><p class="pw-code pw-sub">Pull request · operating model' + NY_EX + '</p>' +
      '<div class="row">' + knSt('wait', 'Waiting on you') + knYou('Yours') + '</div>' +
      '<h3>What it is</h3><ul class="ck"><li><span class="m ok"></span><span>Its checks passed<small>the three automatic checks</small></span></li><li><span class="m ok"></span><span>The AI reviewer passed it<small>its build review</small></span></li>' +
      '<li><span class="m"></span><span>What it changes<small>each session writes a plain name and, when it must, a handover flag</small></span></li></ul>' +
      '<h3>Your answer</h3><div class="opts">' +
        nyOpt('Merge', 'Opens the pull request on GitHub at its merge button; one tap there merges it, and the session names reach the desk.', 'merge', 'In the desk this opens the pull request at its merge button.') +
        nyOpt('Not yet', 'It stays open and stays here. The AI team is told you held it; nothing changes.', 'hold', 'In the desk this tells the AI team you held it.') + '</div><div class="kn-ans"></div>' +
      knRec(['An example: no pull request carries it', 'docs/design/requests/2026-11-27-session-names-and-handover.md (what it would hold)']); },
    deploy: function () { return '<div class="kd">' + ICONS.deploy + 'Deploy</div><p class="pw-what">A deploy puts a new version live. The desk’s deploys wait for your approval.</p>' +
      '<h2>The desk’s new version is ready to go live</h2><p class="pw-code pw-sub">Deploy · The timeline' + NY_EX + '</p>' +
      '<div class="row">' + knSt('wait', 'Waiting on you') + knYou('Yours') + '</div>' +
      '<h3>What goes live</h3><ul class="ck"><li><span class="m ok"></span><span>Built and checked<small>its run passed</small></span></li>' +
      '<li><span class="m"></span><span>The timeline page on the desk<small>what you see changes; nothing is lost</small></span></li></ul>' +
      '<h3>Your answer</h3><div class="opts">' +
        nyOpt('Approve', 'Opens the run’s approval page on GitHub; one tap there sends it live, and the desk shows it within a few minutes.', 'approve', 'In the desk this opens the run’s approval page.') +
        nyOpt('Hold', 'Nothing goes live. It waits here until you approve, and the AI team is told.', 'hold', 'In the desk this holds the deploy and tells the AI team.') + '</div><div class="kn-ans"></div>' +
      knRec(['An example: no deploy waits', 'decisions/questions/P-001-notify-deploys.md (a waiting deploy counts as waiting on you)']); },
    session: function () { return '<div class="kd">' + NYI.session + 'Start the next session</div><p class="pw-what">An AI session works until its conversation is full or its work is handed on. Starting the next one is yours.</p>' +
      '<h2>Start the next session for Model-Lab’s Chief of Staff?</h2><p class="pw-code pw-sub">Handover · Model-Lab' + NY_EX + '</p>' +
      '<div class="row">' + knSt('wait', 'Waiting on you') + knYou('Yours') + '</div>' +
      '<h3>The session</h3><ul class="ck"><li><span class="m"></span><span>Writing up the lab’s overnight merges <small>Chief of Staff · began 13 Nov, 6:40 pm · ended 14 Nov, 10:50 am</small></span></li></ul>' +
      '<h3>Why a handover is needed</h3><div class="sn-hrow"><span class="sn-ho">Handover needed</span><span>its conversation was nearly full, so it ended with work open and wrote a handover</span></div>' +
      '<h3>The handover opens</h3><div class="q ny-ho">Where things stand: four pull requests merged overnight. Next: check the lab’s results page against the new runs, then put the summary to you.</div>' +
      '<div class="ny-acts"><button type="button" class="ny-main" data-nysay="In the desk this opens a new Claude session for Model-Lab’s Chief of Staff with this handover as its first message.">Start the next session</button></div>' +
      '<p class="ex">Opens a new Claude session for Model-Lab’s Chief of Staff, with this handover as its first message. Its name is made from what it sets out to do.</p><div class="kn-ans"></div>' +
      knRec(['An example: no record carries a handover flag yet', 'docs/design/requests/2026-11-27-session-names-and-handover.md', 'decisions/questions/P-005-design-round-8.md, answer 28']); }
  };
  function nySheet(k) { var f = NY_SHEETS[k]; if (f) nySheetOpen(f(), k); }
  function nyRead(i) {
    var a = NY_ANS[i]; if (!a) return;
    if (a.kn) { if (/^g:/.test(a.kn) && typeof fgSet === 'function') fgSet('tl'); knOpen(a.kn); return; }
    var r = a.read;
    nySheetOpen('<div class="kd">' + ICONS.decision + 'Question · answered</div><h2>' + esc(a.say + ': ' + a.what) + '</h2><p class="pw-code pw-sub">' + esc(a.code) + ' · ' + esc(NY_PN[a.p]) + ' · ' + esc(a.t) + '</p>' +
      '<div class="row">' + knSt('ok', 'Answered') + knYou('Yours') + '</div><h3>The question</h3><p>' + esc(r.q) + '</p>' +
      '<h3>Your words</h3>' + r.words.map(function (w) { return '<div class="q">“' + esc(w) + '”</div>'; }).join('') +
      '<h3>The choices it had</h3><ul class="ck">' + r.opts.map(function (o) { return '<li><span class="m ' + (o[1] ? 'ok' : '') + '"></span><span>' + esc(o[0]) + (o[1] ? ' · chosen' : '') + '</span></li>'; }).join('') + '</ul>' +
      '<h3>What it changed</h3><p>' + esc(r.then) + '</p>' + knRec([r.rec]), a.say);
  }

  /* ---------- taps ---------- */
  window.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest) return;
    var tab = t.closest('#tabbar [data-tab]');
    if (tab && NY.opt !== 'now') {
      var k = tab.dataset.tab;
      if (k === 'needs') { e.preventDefault(); e.stopImmediatePropagation(); nyOpen(); return; }
      if (k === 'desk' && NY.open) { e.preventDefault(); e.stopImmediatePropagation(); nyClose(); return; }
      return;
    }
    if (!t.closest('.ny-view')) return;
    if (t.closest('.pr-row [data-pra="go"]')) { nyClose(); return; }   /* Show on timeline: home's own handler opens the project */
    var o = t.closest('[data-nyopen]'); if (o) { e.preventDefault(); nySheet(o.dataset.nyopen); return; }
    var a = t.closest('[data-nyans]'); if (a) { e.preventDefault(); nyRead(+a.dataset.nyans); return; }
    var s = t.closest('[data-nyseg]'); if (s) { NY.seg = s.dataset.nyseg; nyDraw(true); return; }
    if (t.closest('[data-nyteam]')) { NY.team = !NY.team; nyDraw(true); return; }
    if (t.closest('[data-nyearlier]')) { NY.earlier = !NY.earlier; nyDraw(true); return; }
    var r = t.closest('[data-nyretry]'); if (r) { var said = r.closest('.ny-bd').querySelector('.ny-said'); said.innerHTML = '<span class="done">In the desk this opens GitHub’s page again with your answer filled in. The mockup sends nothing.</span>'; return; }
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nyShEl) nyShClose(); });

  /* ---------- keep the view, the lit tab and the badge through re-renders ---------- */
  (function () {
    var v = document.getElementById('view');
    if (v) new MutationObserver(function () { if (NY.open && !v.querySelector(':scope > .ny-view')) nyDraw(); }).observe(v, { childList: true });
    var tbObs = new MutationObserver(function () { if (!tbObs.raf) tbObs.raf = requestAnimationFrame(function () { tbObs.raf = 0; nyTabs(); }); });
    tbObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current', 'disabled'] });
    var t0 = Date.now();
    (function boot() {
      var ok = nyCache(); nyTabs();
      if (!ok && Date.now() - t0 < 6000) { setTimeout(boot, 120); return; }
      if (NY.home) return;
      setTimeout(function () {
        if (NY.opt === 'now') { var b = document.querySelector('#tabbar [data-tab="needs"]'); if (b) b.click(); return; }
        nyOpen(); if (NY.sheet) setTimeout(function () { nySheet(NY.sheet); }, 250);
      }, 300);
    })();
  })();
