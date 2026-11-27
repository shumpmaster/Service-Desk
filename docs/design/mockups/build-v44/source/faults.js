  /* ================= v44: the four faults the plain-words test found (docs/design/audit-2026-11-27-v43-plain-words.md, section 1)
     1. The widget's page showed the timeline's Design gate (passed 13 Nov, its sheet and its menu line): the gates are now each project's own.
     2. The count on the widget's project pill opened the timeline's wait sheet: it now opens the widget's.
     3. Home's Answer opened a sheet with no choices, while the project page's opened five: both open the same choices sheet.
     4. The widget's waiting item had three names (Review 1.8.1.2, Gate, Readiness card): it is the Readiness card (1.8.1.3) everywhere. ================= */
  /* 4: one name; the card's own sheet, with its two choices (queue/P-004-dor-fail-1.md, the card; the choices are the card's: resubmit or stop) */
  NEEDS.forEach(function (n) { if (n.p === 'wd') n.title = 'Your call: resubmit the widget’s brief, or stop?'; });
  KS['Readiness card'] = { wait: true, rule: 'The widget’s brief failed its readiness check', holds: 'the Discovery phase', title: 'Your call: resubmit the widget’s brief, or stop?', when: 'since 4 Nov, 2:53 pm',
    cause: 'Its first readiness check failed, so the brief cannot go to the Design gate as it stands. Nothing moves until you answer.',
    opts: [['resubmit', 'Send the brief back to be fixed and checked again.'], ['stop', 'Stop the widget project here.']],
    after: 'Your answer is recorded in your words, and the scheduler (an automatic AI process) carries it out on its next run.',
    recs: ['queue/P-004-dor-fail-1.md (the card)', 'status/P-004.toml (what waits)'] };
  /* the sheet knows which thing it shows */
  var _knOpenF = knOpen;
  knOpen = function (id) { _knOpenF(id); var s = document.querySelector('.kn-sheet:not(.pw-glsheet)'); if (s) s.dataset.knkey = id; };

  /* 1: each project's own gates. The timeline's are v35's; the widget's have not opened, and its later milestones are not written yet */
  var KG_TL = { 'Design gate': KG['Design gate'], 'Build gate': KG['Build gate'], 'Launch gate': KG['Launch gate'] };
  function fgOpts(first) { return '<h3>Your choices, when it opens</h3><div class="opts"><span class="opt off"><b>Proceed</b>' + esc(first) + '</span><span class="opt off"><b>Hold</b>the case is updated and read again</span><span class="opt off"><b>Recycle</b>back into an earlier phase</span><span class="opt off"><b>Kill</b>the project ends</span></div>'; }
  var KG_WD = {
    'Design gate': { st: 'idle', stw: 'Not reached', you: true, next: true, l3: 'Your decision: may the widget go into Design? · after its brief is ready',
      body: function () { return '<h3>What it decides</h3><p>Whether the widget work goes from Discovery into Design, on its brief and the case for going on.</p>' +
        '<h3>What it waits for</h3><ul class="ck"><li><span class="m wait"></span><span>The brief, ready to rule on<small>its readiness card waits on you: resubmit or stop</small></span></li><li><span class="m"></span><span>Discovery’s other milestones<small>not recorded yet</small></span></li></ul>' +
        fgOpts('into Design') + knRec(['OPERATING_MODEL.md §4, Phase gates', 'status/P-004.toml']); } },
    'Build gate': { st: 'idle', stw: 'Not reached', you: true, l3: 'Your decision: may the widget go into Build? · its milestones are written at the Design gate',
      body: function () { return '<h3>What it decides</h3><p>Whether the widget work goes into Build. Its milestones are written once the Design gate passes.</p>' + fgOpts('into Build') + knRec(['OPERATING_MODEL.md §4, Phase gates']); } },
    'Launch gate': { st: 'idle', stw: 'Not reached', you: true, l3: 'Your decision: may the widget go live?',
      body: function () { return '<h3>What it decides</h3><p>Whether the widget goes live and leaves the desk, running on its own.</p>' + fgOpts('go live and run on its own') + knRec(['OPERATING_MODEL.md §3 and §4']); } }
  };
  function fgSet(id) { var src = id === 'wd' ? KG_WD : KG_TL; Object.keys(src).forEach(function (k) { KG[k] = src[k]; }); }
  var _openProjectF = openProject;
  openProject = function (id) { fgSet(id); return _openProjectF.apply(this, arguments); };
  /* the widget's gate rows read "Entered by"/"passed" from the plan as well */
  PLANS.wd.forEach(function (b) { if (b.type === 'gate' && b.name === 'Design gate') b.note = 'your decision, after the brief is ready'; });

  /* 2: the count on the project pill opens this project's own wait sheet */
  var _countF = window.__v36count;
  window.__v36count = function (e) {
    if (state.proj !== 'wd') return _countF(e);
    var pj = e.target.closest && e.target.closest('.tp-pill.pj'), c = pj && pj.querySelector('.n'), r = c && c.getBoundingClientRect();
    if (!r || !r.width || e.clientX < r.left - 6 || e.clientX > r.right + 6 || e.clientY < r.top - 10 || e.clientY > r.bottom + 10) return false;
    ppSheet('<div class="kd">Waiting on you</div><h2>1 thing waits on you in Home-screen widget</h2><p class="pp-by">Each says what it holds up and how long it has waited.</p><ul class="pp-wl">' +
      '<li><span class="ic">' + PPI.stop + '</span><span class="bd"><span class="t">Your call: resubmit the widget’s brief, or stop? <span class="pw-code">Readiness card · 1.8.1.3</span></span><span class="s">Holds up the Discovery phase · <span class="w">waiting 9 days</span> · since 4 Nov, 2:53 pm</span><span class="acts">' +
      '<button type="button" class="pp-btn main" data-ppans="s:Readiness card">Choose what happens next</button><button type="button" class="pp-btn" data-ppgo="Readiness card">Go to it</button></span></span></li></ul>' +
      '<h3>Records</h3><p class="rec-l">status/P-004.toml (what waits); queue/P-004-dor-fail-1.md (the card).</p>');
    return true;
  };
  /* the timeline's wait sheet: its Answer says what it does */
  PPW.forEach(function (w) { w.t = 'The plan for the records work failed its third check. What next? (Stop card 5)'; });

  /* 3: home's Answer, and any older "what waits" row, opens the choices sheet the project page uses */
  window.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-pra="sheet"], .need .crow'); if (!t || t.closest('#v13list')) return;
    var row = t.closest('[data-prk]'), nd = t.closest('.need[data-key]'), i = row ? +row.dataset.prk : nd ? +nd.dataset.key.slice(1) : -1;
    var n = NEEDS[i]; if (!n) return;
    e.preventDefault(); e.stopImmediatePropagation();
    knOpen(n.p === 'wd' ? 's:Readiness card' : 's:Stop card 5');
  }, true);
