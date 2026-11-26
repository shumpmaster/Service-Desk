  /* ================= round 8: how a gate, a decision, research and a stop show (decisions/questions/P-005-design-round-8.md, answer 7)
     Options over v34. The phone's hash names one option and where the phone starts: #<option>.<start>[.<start>]
     options: now fA fB gA gB dA dB rA rB sA sB  (fA = every A, fB = every B)
     starts: at=<text> (that row at the pointer), menu (the phase menu open), disc (Discovery in view), d5 (Discovery-5 opened),
             open=<g|d|r|s>:<key> (that kind's sheet open). Every fact on a sheet is from the records named under it;
             anything the records do not hold is marked as an example. ================= */
  var KN = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.'), o = { opt: h[0] || 'now', st: h.slice(1) };
    var fam = o.opt === 'fA' ? 'A' : o.opt === 'fB' ? 'B' : null;
    o.on = function (k) { return o.opt === k || (fam && k.charAt(1) === fam); };
    ['gA', 'gB', 'dA', 'dB', 'rA', 'rB', 'sA', 'sB'].forEach(function (k) { if (o.on(k)) document.documentElement.classList.add('kn-' + k); });
    return o;
  })();
  var KNI = { you: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="5.5" r="2.6"/><path d="M3 14c.6-2.7 2.6-4.2 5-4.2s4.4 1.5 5 4.2"/></svg>',
    x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    chev: '<svg class="kn-chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5"/></svg>' };
  function knYou(t) { return '<span class="kn-you">' + KNI.you + esc(t || 'Yours') + '</span>'; }
  function knSt(c, t) { return '<span class="kn-st ' + c + '">' + esc(t) + '</span>'; }
  function knRec(list) { return '<h3>Records</h3><p class="rec-l">' + list.map(esc).join('<br>') + '</p>'; }

  /* ---------- what the records say, per thing shown ---------- */
  var KG = {
    'Design gate': { st: 'ok', stw: 'Passed', you: true, l3: 'You said proceed · 13 Nov, 10:10 am · after one hold',
      body: function () { return '<h3>What it decided</h3><p>Whether the timeline work goes from Discovery into Design, on its brief and the case for going on.</p>' +
        '<h3>Your rulings here</h3><ul class="ck"><li><span class="m wait"></span><span>Hold<small>13 Nov, 8:18 am · “Hold for case 2 (Recommended)”: the case gave no reason for two milestones reading not reached</small></span></li>' +
        '<li><span class="m ok"></span><span>Proceed<small>13 Nov, 10:10 am · “Proceed (Recommended)”</small></span></li></ul>' +
        '<h3>What it checked</h3><ul class="ck"><li><span class="m ok"></span><span>The brief’s readiness check<small>failed once, then passed</small></span></li><li><span class="m ok"></span><span>The case, with the Critic’s view beside it<small>written twice; the second answered your hold</small></span></li><li><span class="m"></span><span>A user representative<small>not needed: you are the user</small></span></li><li><span class="m"></span><span>Discovery’s milestones<small>3 of 8 reached; two read not reached though their research passed</small></span></li></ul>' +
        knRec(['docs/gates/P-005/design-gate-1-case.md, design-gate-2-case.md', 'decisions/P-005/dor-2.md (hold), dor-3.md (proceed)', 'docs/LEDGER.md L-0008 (user representative not needed)']); } },
    'Build gate': { st: 'idle', stw: 'Not reached', you: true, next: true, l3: 'You approve Design’s criteria, then they freeze · 1 of 7 milestones reached',
      body: function () { return '<h3>What it decides</h3><p>Whether the work goes into Build. You approve Design’s criteria, scenario by scenario, and then they freeze. Nothing goes into Build until you say proceed.</p>' +
        '<h3>What it waits for</h3><ul class="ck">' + knMs(2) + '</ul>' +
        '<h3>What you will get</h3><p>One case for going on, about 350 words, with the Critic’s view beside it and Design’s join-up review.</p>' +
        '<h3>Your choices, when it opens</h3><div class="opts"><span class="opt off"><b>Proceed</b>into Build</span><span class="opt off"><b>Hold</b>the case is updated and read again</span><span class="opt off"><b>Recycle</b>back into an earlier phase, with a reason</span><span class="opt off"><b>Kill</b>the project closes</span></div>' +
        '<p class="ex">Build alone may be passed as “nothing needed”, in your own words, never by proxy.</p>' +
        knRec(['OPERATING_MODEL.md §4, Phase gates (S-024)', 'docs/projects/P-005.md (the milestones)']); } },
    'Launch gate': { st: 'idle', stw: 'Not reached', you: true, l3: 'The go-live and the graduation · the last ruling on the desk',
      body: function () { return '<h3>What it decides</h3><p>Whether the product goes live and leaves the desk, owning its own running, monitoring and review. Its case covers Build and Launch.</p>' +
        '<h3>What it waits for</h3><ul class="ck">' + knMs(4) + knMs(6) + '</ul>' +
        '<h3>Your choices, when it opens</h3><div class="opts"><span class="opt off"><b>Proceed</b>go live and graduate</span><span class="opt off"><b>Hold</b></span><span class="opt off"><b>Recycle</b></span><span class="opt off"><b>Kill</b></span></div>' +
        '<p class="ex">Launch is never passed as “nothing needed”.</p>' + knRec(['OPERATING_MODEL.md §3, Graduation and re-entry; §4, Phase gates']); } }
  };
  function knMs(b) {
    var sec = document.querySelector('#v13list .v13phase[data-b="' + b + '"]'), blk = PLANS.tl[b]; if (!sec || !blk) return '';
    return [].slice.call(sec.querySelectorAll('.v13ms > .v13gr')).map(function (gr) {
      var nm = gr.querySelector('.nm'), bb = gr.querySelector('.l1 > b'), l3 = gr.querySelector('.l3'), w = l3 ? l3.textContent.split('·')[0].trim() : '';
      var c = /^Reached/.test(w) ? 'ok' : /^Stopped/.test(w) ? 'bad' : /^Waiting/.test(w) ? 'wait' : '';
      return '<li><span class="m ' + c + '"></span><span>' + esc((nm ? nm.textContent : bb ? bb.textContent : '').trim()) + '<small>' + esc(blk.name) + ' · ' + esc(w.toLowerCase() || 'not started') + '</small></span></li>'; }).join('');
  }
  var S4W = 'criteria-wrong (Recommended)';
  var KD = {
    'New spec S-011, rounds reset': { you: 'Your ruling', say: S4W, by: 'Applied by the Orchestrator', short: 'a new spec, rounds reset', title: 'Stop card 4 applied: a new spec, rounds reset',
      when: 'You ruled 13 Nov, 10:58 pm · applied 14 Nov, 6:07 am', changed: 'S-010 is replaced by a new spec, S-011, written again with your six answers. The plan rounds start again at zero, and it is not counted as a strike.',
      opts: [['criteria-wrong', 'a new spec, rounds reset, not a strike', 1], ['re-specify', 'the same new spec, counted as a strike'], ['confirm', 'one focused check, offered once'], ['re-scope or drop', 'closes the timeline work']],
      recs: ['decisions/P-005/stop-4.md (your words)', 'decisions/P-005/stop-4-notes.md (the card’s options)', 'Ledger: no entry; the answer file is the record'] },
    'You said: write a new spec': { you: 'Your ruling', say: S4W, by: 'You', title: 'You said: write a new spec', when: '13 Nov, 10:58 pm', changed: 'Stop card 4 closed with a new spec, and your six answers to S-010’s open questions went to the spec writer.',
      opts: [['criteria-wrong', 'a new spec, rounds reset, not a strike', 1], ['re-specify', 'counted as a strike'], ['confirm', 'one focused check'], ['re-scope or drop', 'closes the work']],
      recs: ['decisions/P-005/stop-4.md'] },
    'You said hold': { you: 'Your ruling', say: 'Hold for case 2 (Recommended)', by: 'You', title: 'Design gate: you said hold', when: '13 Nov, 8:18 am', changed: 'The case was written again: a reason for Discovery-3 and Discovery-5 reading not reached, the copying-job risk out of the appendix, citations fixed.',
      opts: [['proceed', ''], ['hold', 'the case is updated and read again', 1], ['recycle', ''], ['kill', '']], recs: ['decisions/P-005/dor-2.md', 'docs/gates/P-005/design-gate-1-case.md'] },
    'You said resubmit': { you: 'For you, by proxy', say: 'resubmit', by: 'The Chief of Staff, under your standing proxy', title: 'Readiness check: resubmit', when: '12 Nov, 10:48 pm', changed: 'The brief went back for its readiness check, which then passed.',
      proxy: 'Your words behind the proxy: “Honestly you can run autonomously as you did overnight. You stoppage point is our first design mock up” (L-0049).',
      opts: [['resubmit', '', 1], ['stop', '']], recs: ['decisions/P-005/dor-fail-1.md', 'docs/LEDGER.md L-0049 (the proxy)'] },
    'S-011 frozen': { you: 'Yours', planned: true, say: null, by: 'Planned', title: 'S-011 frozen', when: 'planned', changed: 'An example the mockup carries: the spec freezes when its plan review passes; your own ruling on it is the Build gate.', opts: [], recs: ['an example: no record yet'] }
  };
  var KR = { 'Q-028': { q: 'How a job run inside a GitHub repository can keep lasting copies of that repository’s workflow run, check and commit status results, and what it costs.',
      serves: 'Discovery-5, What already exists is known (its request’s milestone tag)', dec: 'The records change that writes lasting copies of run and check results in each repository, put to you as its own ruling.',
      steps: [['ok', 'Memo written', '12 Nov, 11:00 pm'], ['bad', 'Source check failed', '11:14 pm'], ['ok', 'Memo revised', '11:26 pm'], ['bad', 'Source check failed', '11:35 pm'], ['ok', 'Memo revised again', '11:48 pm'], ['ok', 'Source check passed', '13 Nov, 12:03 am']],
      grade: 'Two facts graded A in the memo; one library entry filed, graded B (a single page for the 2,500-run cap)',
      note: 'Read as not reached: its research passed an hour after the readiness pass (lesson LL-051).',
      recs: ['research/Q-028.md, Q-028-memo.md, Q-028-source-check.md', 'intake/requests/Q-028.toml (milestone = "Discovery-5")', 'library/facts/F-gh-runs-count-cap-01.md'] } };
  var KS = {
    'Stop card 5': { wait: true, rule: 'Three plan reviews of S-011 failed', holds: 'M6, M7, M8', title: 'S-011 failed three plan reviews: what happens next?', when: 'since 14 Nov, 9:42 am',
      cause: 'Triage’s root cause: the spec writer’s pack never held the two experiment files the plan reviewer kept asking it to re-point, so every round failed on a fix it could not make.',
      opts: [['criteria-wrong', 'A new spec replaces S-011 and goes back to the spec writer; the plan rounds reset; not a strike.', 1], ['re-specify', 'The same new spec, counted as a strike.'], ['confirm', 'One focused check, offered once; it would find the known faults again.'], ['re-scope', 'Closes the timeline work as it stands; nothing in Triage argues for it.'], ['drop', 'Closes the timeline work.']],
      after: 'Your answer is recorded in your words, through the desk’s answer link, and the Orchestrator applies it on its next run.',
      recs: ['decisions/P-005/stop-5-notes.md (the card)', 'status/P-005.toml (plan_round 3)', 'OPERATING_MODEL.md §4, Stop rule (D-044)'] },
    'Stop card 4': { wait: false, rule: 'Three plan reviews of S-010 failed', holds: 'M6, M7, M8', title: 'Stop card 4: S-010 failed three plan reviews', when: '13 Nov, 7:05 pm · you said criteria-wrong',
      cause: 'Triage’s root cause: the plan reviewer’s pack never held the two experiment files the spec cites, nor its own earlier review.',
      opts: [['criteria-wrong', 'A new spec replaces S-010; rounds reset; not a strike.', 1], ['re-specify', ''], ['confirm', ''], ['re-scope', ''], ['drop', '']], chosen: S4W,
      recs: ['decisions/P-005/stop-4.md (your answer)', 'decisions/P-005/stop-4-notes.md (the card)'] } };

  /* ---------- the sheet ---------- */
  var knSheetEl = null;
  function knClose() {
    if (!knSheetEl) return; var s = knSheetEl; knSheetEl = null;
    s.sheet.classList.remove('on'); s.scrim.classList.remove('on');
    setTimeout(function () { s.sheet.remove(); s.scrim.remove(); }, REDUCED ? 0 : 260);
  }
  function knOpen(id) {
    knClose(); var p = id.split(':'), kind = p[0], key = p.slice(1).join(':'), h = '';
    if (kind === 'g' && KG[key]) { var g = KG[key];
      h = '<div class="kd">' + ICONS.gate + 'Gate</div><h2>' + esc(key) + '</h2><div class="row">' + knSt(g.st, g.stw) + (g.you ? knYou(g.st === 'ok' ? 'Yours' : 'Yours to rule') : '') + '</div>' + g.body(); }
    else if (kind === 'd' && KD[key]) { var d = KD[key];
      h = '<div class="kd">' + ICONS.decision + 'Decision</div><h2>' + esc(d.title) + '</h2><div class="row">' + (d.planned ? knSt('idle', 'Planned') : knSt('ok', 'Done')) + knYou(d.you) + '</div>' +
        (d.say ? '<h3>' + (d.by === 'You' || /Your/.test(d.you) ? 'Your words' : 'The ruling') + '</h3><div class="q">“' + esc(d.say) + '”</div>' : '') + (d.proxy ? '<p class="ex">' + esc(d.proxy) + '</p>' : '') +
        '<p class="ex">' + esc(d.by) + ' · ' + esc(d.when) + '</p><h3>What it changed</h3><p>' + esc(d.changed) + '</p>' +
        (d.opts.length ? '<h3>The choices it had</h3><ul class="ck">' + d.opts.map(function (o) { return '<li><span class="m ' + (o[2] ? 'ok' : '') + '"></span><span>' + esc(o[0]) + (o[2] ? ' · chosen' : '') + (o[1] ? '<small>' + esc(o[1]) + '</small>' : '') + '</span></li>'; }).join('') + '</ul>' : '') + knRec(d.recs); }
    else if (kind === 'r' && KR[key]) { var r = KR[key];
      h = '<div class="kd">' + ICONS.research + 'Research</div><h2>' + esc(key) + ': how long GitHub keeps run results</h2><div class="row">' + knSt('ok', 'Source check passed') + knSt('idle', '3rd try') + '</div>' +
        '<h3>The question</h3><p>' + esc(r.q) + '</p><h3>The decision it serves</h3><p>' + esc(r.dec) + '</p><p class="ex">Serves ' + esc(r.serves) + '.</p>' +
        '<h3>What happened</h3><ul class="ck">' + r.steps.map(function (s) { return '<li><span class="m ' + s[0] + '"></span><span>' + esc(s[1]) + '<small>' + esc(s[2]) + '</small></span></li>'; }).join('') + '</ul>' +
        '<h3>How sure it is</h3><p>' + esc(r.grade) + '.</p><p class="ex">' + esc(r.note) + '</p>' + knRec(r.recs); }
    else if (kind === 's' && KS[key]) { var s = KS[key];
      h = '<div class="kd">' + ICONS.stop + 'Stop</div><h2>' + esc(s.title) + '</h2><div class="row">' + (s.wait ? knSt('wait', 'Waiting on you') : knSt('ok', 'Answered')) + knYou('Yours') + '</div>' +
        '<h3>Why it stopped</h3><ul class="ck"><li><span class="m bad"></span><span>' + esc(s.rule) + '<small>the stop rule: three plan rounds, three build rounds</small></span></li><li><span class="m"></span><span>Holds up ' + esc(s.holds) + '<small>' + esc(s.when) + '</small></span></li></ul><p class="ex">' + esc(s.cause) + '</p>' +
        '<h3>' + (s.wait ? 'Your answer' : 'The choices it had') + '</h3><div class="opts">' + s.opts.map(function (o) { return (s.wait ? '<button type="button" class="opt' + (o[2] ? ' rec' : '') + '" data-knans="' + esc(o[0]) + '">' : '<span class="opt off' + (o[2] ? ' rec' : '') + '">') + '<b>' + esc(o[0]) + '</b>' + esc(o[1]) + (s.wait ? '</button>' : '</span>'); }).join('') + '</div>' +
        (s.wait ? '<p class="ex">' + esc(s.after) + '</p>' : '<p class="ex">You said “' + esc(s.chosen) + '”.</p>') + '<div class="kn-ans"></div>' + knRec(s.recs); }
    else return;
    var scrim = document.createElement('div'), sheet = document.createElement('div');
    scrim.className = 'kn-scrim'; sheet.className = 'kn-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true');
    sheet.innerHTML = '<div class="grab" aria-hidden="true"></div><button type="button" class="x" aria-label="Close"><span>' + KNI.x + '</span></button>' + h;
    document.body.appendChild(scrim); document.body.appendChild(sheet); knSheetEl = { scrim: scrim, sheet: sheet };
    scrim.addEventListener('click', knClose); sheet.querySelector('.x').addEventListener('click', knClose);
    sheet.addEventListener('click', function (e) { var a = e.target.closest('[data-knans]'); if (!a) return; var box = sheet.querySelector('.kn-ans');
      box.innerHTML = '<div class="done">In the desk this records “' + esc(a.dataset.knans) + '” in your words. The mockup sends nothing.</div>'; });
    requestAnimationFrame(function () { requestAnimationFrame(function () { scrim.classList.add('on'); sheet.classList.add('on'); }); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') knClose(); });

  /* ---------- applying the options to the page ---------- */
  function knRowKind(ev) { var b = ev.querySelector('.l1 > b'); return b ? b.textContent : ''; }
  function knRowKey(ev) { var t = ev.querySelector('.l2'); return t ? (t.dataset.knKey || t.textContent.trim()) : ''; }
  function knGates() {
    var plan = PLANS[state.proj]; if (!plan) return;
    [].slice.call(document.querySelectorAll('#v13list .ph-gate')).forEach(function (el) {
      var blk = plan[+el.dataset.b], g = blk && KG[blk.name]; if (!g || el.dataset.kn) return; el.dataset.kn = '1';
      if (KN.on('gA')) {
        el.setAttribute('role', 'button'); el.tabIndex = 0; el.dataset.knopen = 'g:' + blk.name;
        el.innerHTML = '<span class="kn-gico ' + (g.st === 'ok' ? 'ok' : g.next ? 'next' : '') + '">' + ICONS.gate + '</span><span class="kn-gtx"><span class="lv">Gate</span><span class="l1"><b>' + esc(blk.name) + '</b>' + knSt(g.st, g.stw) + (g.you && g.st !== 'ok' ? knYou() : '') + '</span><span class="l3">' + esc(g.l3) + '</span></span>' + KNI.chev;
      }
    });
    if (KN.on('gB')) [].slice.call(document.querySelectorAll('#v13list .v13phase')).forEach(function (sec) {
      var b = +sec.dataset.b, hd = sec.querySelector('.v13phh .tx'); if (!hd || hd.querySelector('.kn-gline')) return;
      var inG = plan[b - 1] && plan[b - 1].type === 'gate' ? plan[b - 1] : null, outG = plan[b + 1] && plan[b + 1].type === 'gate' ? plan[b + 1] : null, s = '';
      if (inG) s += '<span>Entered by the ' + esc(inG.name) + (KG[inG.name].st === 'ok' ? ' · you said proceed · 13 Nov' : '') + '</span>';
      if (outG) s += '<span class="kn-gchip' + (KG[outG.name].st === 'ok' ? ' ok' : '') + '" role="button" tabindex="0" data-knopen="g:' + esc(outG.name) + '">' + ICONS.gate + 'Then: ' + esc(outG.name) + ' · ' + (KG[outG.name].st === 'ok' ? 'passed' : 'yours') + '</span>';
      if (s) { var d = document.createElement('span'); d.className = 'kn-gline'; d.innerHTML = s; hd.appendChild(d); }
    });
  }
  function knMenu() {
    var m = document.querySelector('.tp-menu'); if (!m || m.dataset.kn) return; m.dataset.kn = '1';
    var plan = PLANS[state.proj];
    if (KN.on('gA')) [].slice.call(m.querySelectorAll('.mi.gate')).forEach(function (row) {
      var nm = (row.textContent.split('·')[0] || '').trim(), g = KG[nm]; if (!g) return;
      row.innerHTML = '<span class="kn-gico ' + (g.st === 'ok' ? 'ok' : g.next ? 'next' : '') + '">' + ICONS.gate + '</span><span>' + esc(nm) + ' <span class="kn-msub" style="display:inline">· ' + (g.st === 'ok' ? 'passed 13 Nov' : g.next ? 'yours, next' : 'yours') + '</span></span>';
    });
    if (KN.on('gB')) [].slice.call(m.querySelectorAll('[data-tp-ph]')).forEach(function (row) {
      var b = +row.dataset.tpPh, outG = plan[b + 1] && plan[b + 1].type === 'gate' ? plan[b + 1] : null; if (!outG || row.querySelector('.kn-msub')) return;
      var nm = row.querySelector('span:not(.ring):not(.sub)') || row; nm.insertAdjacentHTML('beforeend', '<span class="kn-msub">then ' + esc(outG.name) + (KG[outG.name].st === 'ok' ? ', passed' : ', yours') + '</span>');
    });
  }
  function knMap() {
    if (!KN.on('gA')) return; var vp = document.querySelector('#v13band .v13vp'); if (!vp) return;
    var plan = PLANS[state.proj], b = (typeof phInView === 'function' ? phInView() : null); if (b === null || b === undefined) b = typeof viewB === 'function' ? viewB() : curB();
    var sig = state.proj + ':' + b; if (vp.dataset.knsig === sig && vp.querySelector('.kn-mgate')) return; vp.dataset.knsig = sig;
    [].slice.call(vp.querySelectorAll('.kn-mgate')).forEach(function (e) { e.remove(); });
    if (getComputedStyle(vp).position === 'static') vp.style.position = 'relative';
    [[plan[b - 1], 'l'], [plan[b + 1], 'r']].forEach(function (x) {
      var g = x[0]; if (!g || g.type !== 'gate' || !KG[g.name]) return; var ok = KG[g.name].st === 'ok', d = document.createElement('div');
      d.className = 'kn-mgate ' + x[1] + (ok ? ' ok' : ''); d.style[x[1] === 'l' ? 'left' : 'right'] = '10px';
      d.innerHTML = '<span>' + esc(g.name) + (ok ? ' · passed' : ' · yours') + '</span><i>' + ICONS.gate + '</i>'; vp.appendChild(d);
    });
  }
  function knRows() {
    [].slice.call(document.querySelectorAll('#v13list .v13ev')).forEach(function (ev) {
      if (ev.dataset.kn) return; var kind = knRowKind(ev), key = knRowKey(ev), l1 = ev.querySelector('.l1'), l2 = ev.querySelector('.l2'), l3 = ev.querySelector('.l3');
      if (kind === 'Decision' && KD[key]) { var d = KD[key]; ev.dataset.kn = '1'; ev.dataset.knopen = 'd:' + key;
        if (KN.on('dA')) { var tg = l1.querySelector('.v13tag'); (tg || l1.querySelector('b')).insertAdjacentHTML('afterend', knYou(d.you === 'For you, by proxy' ? 'By proxy' : 'Yours'));
          if (d.say && l2) l2.insertAdjacentHTML('afterend', '<span class="kn-say">' + (d.by === 'You' ? 'Your words: ' : d.you === 'For you, by proxy' ? 'Under your proxy: ' : 'Applies your words: ') + '<q>' + esc(d.say) + '</q></span>'); }
        if (KN.on('dB') && d.say && l2) { l2.dataset.knKey = key; l2.innerHTML = '<span class="kn-quote">' + esc(d.say) + '</span>'; if (l3) l3.textContent = (d.by === 'You' ? 'You said it' : d.by) + ': ' + (d.short || d.title.replace(/^You said:? ?/, '')); ev.classList.add('kn-dq'); }
      }
      if (kind === 'Stop' && KS[key]) { var s = KS[key]; ev.dataset.kn = '1'; ev.dataset.knopen = 's:' + key;
        if (KN.on('sA')) { if (l3) l3.textContent = s.rule.replace(/ of S-01\d/, '') + ' · holds up ' + s.holds;
          var tg2 = l1.querySelector('.v13tag'); if (s.wait && tg2) { tg2.textContent = 'Yours · waiting'; }
          else if (tg2) tg2.insertAdjacentHTML('afterend', knYou('Yours'));
          if (s.wait && l3) l3.insertAdjacentHTML('afterend', '<button type="button" class="kn-open kn-ansrow" data-knopen="s:' + esc(key) + '">Answer stop card 5</button>'); }
      }
      if (kind === 'Research' && ev.closest('.v13ms') && /What already exists/.test(ev.closest('.v13ms').textContent)) { ev.dataset.kn = '1'; ev.dataset.knopen = 'r:Q-028'; }
    });
  }
  function knResearch() {
    [].slice.call(document.querySelectorAll('#v13list .v13gr')).forEach(function (gr) {
      var bb = gr.querySelector('.l1 > b'); if (!bb || !/^Q-\d+$/.test(bb.textContent) || gr.dataset.kn) return; var key = bb.textContent; if (!KR[key]) return; gr.dataset.kn = '1';
      if (KN.on('rA')) { var lv = gr.querySelector('.lv-w'); if (lv) lv.textContent = 'Research'; var l3 = gr.querySelector('.l3'); if (l3) l3.textContent = 'Passed its source check on the 3rd try · 13 Nov';
        var cnt = gr.querySelector('.cnt'); (cnt || bb).insertAdjacentHTML('afterend', '<span class="kn-memo" role="button" tabindex="0" data-knopen="r:' + key + '">Memo</span>'); }
      if (KN.on('rB')) { var wrap = gr.parentElement, body = gr.nextElementSibling; gr.classList.add('kn-rhide'); if (body && !body.classList.contains('v13gr')) body.classList.add('kn-rhide');
        var row = document.createElement('div'); row.className = 'kn-rrow'; row.setAttribute('role', 'button'); row.tabIndex = 0; row.dataset.knopen = 'r:' + key;
        row.innerHTML = '<span class="ri">' + ICONS.research + '</span><span class="tx"><span class="l1">Research ' + knSt('ok', 'Passed') + '</span><span class="l2">How long GitHub keeps run results</span><span class="l3">' + key + ' · revised twice · checked 13 Nov, 12:03 am</span></span>' + KNI.chev;
        gr.insertAdjacentElement('beforebegin', row); }
    });
    if (KN.on('rA')) [].slice.call(document.querySelectorAll('#v13band svg text')).forEach(function (t) { if (/^1\.5\.1 Q-028$/.test(t.textContent.trim())) t.textContent = '1.5.1 Research Q-028'; });
  }
  function knStopBand() {
    if (!KN.on('sB')) return;
    [].slice.call(document.querySelectorAll('#v13list .v13gr')).forEach(function (gr) {
      var bb = gr.querySelector('.l1 > b'); if (!bb || bb.textContent !== 'Spec S-011' || gr.dataset.knsb) return; gr.dataset.knsb = '1';
      var d = document.createElement('div'); d.className = 'kn-sband'; d.innerHTML = '<span class="tx"><b>Stopped · yours</b><br>Three plan reviews failed · holds up M6, M7, M8 · since 9:42 am</span><button type="button" class="kn-open" data-knopen="s:Stop card 5">Answer</button>';
      gr.insertAdjacentElement('afterend', d);
    });
    var held = false; [].slice.call(document.querySelectorAll('#v13list .v13ev')).forEach(function (ev) { if (/Stop card 5/.test(ev.textContent)) { held = true; return; } if (held && ev.closest('.v13ms') && /S-011/.test(ev.closest('.v13ms').textContent)) ev.classList.add('kn-held'); });
  }
  function knApply() { if (KN.opt === 'now' || !v13on()) return; knGates(); knRows(); knResearch(); knStopBand(); knMenu(); knMap(); }
  window.addEventListener('click', function (e) {
    if (KN.opt === 'now') return; var t = e.target.closest('[data-knopen]'); if (!t) return;
    if (!t.classList.contains('kn-open') && !t.classList.contains('kn-memo') && !t.classList.contains('kn-gchip') && e.target.closest('.w2-q, .ss-q, .nd-tag, [data-ndgo], .v13tag button, a')) return;
    e.stopImmediatePropagation(); e.preventDefault(); knOpen(t.dataset.knopen);
  }, true);
  var knObs = new MutationObserver(function () { if (!knObs.raf) knObs.raf = requestAnimationFrame(function () { knObs.raf = 0; knApply(); }); });
  knObs.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('scroll', function () { if (!knObs.raf2) knObs.raf2 = setTimeout(function () { knObs.raf2 = 0; knMap(); }, 120); }, { passive: true });

  /* ---------- where the phone starts ---------- */
  function knFind(text) { var r = null; [].slice.call(document.querySelectorAll('#v13list .v13gr, #v13list .v13ev, #v13list .ph-gate, #v13list .kn-rrow, #v13list .kn-sband')).forEach(function (el) { if (!r && el.offsetParent && el.textContent.indexOf(text) >= 0) r = el; }); return r; }
  function knCentre(el) { if (!el) return; var c = ctCentre(), r = el.getBoundingClientRect(); window.scrollTo(0, Math.max(0, window.scrollY + r.top + r.height / 2 - c.y)); setTimeout(ctSoon, 30); setTimeout(function () { ctSoon(); knMap(); }, 400); }
  function knStart() {
    var st = KN.st, i = 0;
    function next() {
      if (i >= st.length) return; var t = st[i++];
      if (t === 'disc' || t === 'd5') { var pill = document.querySelector('.tp-pill.ph'); if (pill) pill.click(); setTimeout(function () { var r = document.querySelector('[data-tp-ph="0"]'); if (r) r.click();
          setTimeout(function () { if (t === 'd5') { var g = [].slice.call(document.querySelectorAll('#v13list .v13gr')).filter(function (e) { return /What already exists/.test(e.textContent); })[0]; if (g && g.getAttribute('aria-expanded') !== 'true') g.click(); setTimeout(function () { knCentre(knFind('Q-028') || g); next(); }, 500); } else next(); }, 900); }, 300); return; }
      if (t === 'menu') { setTimeout(function () { var p = document.querySelector('.tp-pill.ph'); if (p) p.click(); setTimeout(next, 300); }, 200); return; }
      if (t.indexOf('at=') === 0) { var x = t.slice(3).replace(/_/g, ' '); knCentre(knFind(x)); setTimeout(next, 500); return; }
      if (t.indexOf('open=') === 0) { var k = t.slice(5).replace(/_/g, ' '); setTimeout(function () { knOpen(k); next(); }, 500); return; }
      next();
    }
    next();
  }
  var _openKN = openProject;
  openProject = function (id) { _openKN(id); setTimeout(function () { knApply(); }, REDUCED ? 40 : 480); };
  if (KN.st.indexOf('home') < 0) setTimeout(function () { if (!v13on()) openProject('tl'); setTimeout(function () { knApply(); knStart(); }, REDUCED ? 300 : 1100); }, 300);
