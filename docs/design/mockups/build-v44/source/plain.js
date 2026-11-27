  /* ================= v44, round 8 answers 27 and 28 (decisions/questions/P-005-design-round-8.md): the plain-words pass, A + B + E + D, and the
     five questions as recommended: plain titles first with codes and numbers after them in grey; a "what this is" line under each project, phase
     and sprint; plain answer labels with the system's key beneath; "You chose" in place of "your words"; plain role names; a "?" glossary and
     cast sheet that says the workers are AI sessions; Why stays a tag. From options-r8-plain/source/pw.js, made to cover every row, not only
     S-011's, and fixed on (no hash). The plain text is written from words already on the page; nothing here is a record. Where a line is the
     mockup's own example (a project's or a sprint's "what this is"), it says so. Test: docs/design/audit-2026-11-27-v43-plain-words.md. ================= */
  ['pw-on', 'pw-titles', 'pw-code2', 'pw-what', 'pw-gloss', 'pw-roles', 'pw-words', 'pw-tag', 'pw-ai'].forEach(function (c) { document.documentElement.classList.add(c); });
  function pwOn() { return true; }

  /* ---------- event titles, plain first: 'sprint|title' (as the list keys them), or the title alone ---------- */
  var PWT = {
    /* Discovery: the research (Q-028) and the brief */
    'Q-028|Memo written': 'The researcher wrote the memo',
    'Q-028|Source check failed': 'The memo’s sources were checked, and the check failed',
    'Q-028|Memo revised': 'The researcher revised the memo',
    'Q-028|Memo revised again': 'The researcher revised the memo again',
    'Q-028|Source check passed': 'The memo passed its source check',
    'The brief|Readiness check failed': 'The brief failed its readiness check',
    'The brief|You said resubmit': 'The brief was sent back to be fixed',
    'The brief|Readiness check passed': 'The brief passed its readiness check',
    'The brief|Gate case reviewed': 'The case for the Design gate was reviewed',
    'The brief|You said hold': 'You held the Design gate and asked for a better case',
    'The brief|Gate case reviewed again': 'The better case was reviewed',
    'The brief|You said proceed': 'You let the timeline work go into Design',
    /* the widget's brief */
    'The brief|Readiness check started': 'The widget’s brief went to its readiness check',
    'The brief|Readiness check failed, round 1': 'The widget’s brief failed its readiness check',
    'The brief|Readiness card': 'Your call: resubmit the widget’s brief, or stop?',
    /* Design: the first plan (S-010) */
    'Spec S-010|First draft, and experiments E1 and E2 registered': 'The spec writer wrote the first plan and wrote down two experiments',
    'Spec S-010|Plan review failed': 'A check of the first plan failed',
    'Spec S-010|Spec revised': 'The spec writer fixed what the check found',
    'Spec S-010|Stop card 4': 'Work stopped: the first plan failed three checks',
    'Spec S-010|Merged PR #443: the card’s notes and two questions': 'The stop’s notes and two questions for you were added',
    'Spec S-010|You said: write a new spec': 'You said: write a fresh plan',
    'Spec S-010|Merged PR #444: the answer, the number fix, the pack fix': 'Your answer and two fixes were added: the plan numbers, and the files the spec writer is given',
    /* the second plan (S-011) */
    'Spec S-011|New spec S-011, rounds reset': 'A fresh plan was started, as you asked',
    'Spec S-011|First draft': 'The spec writer wrote the first draft from your six answers',
    'Spec S-011|Plan review failed, round 1': 'Check 1 of the plan failed: the experiments still pointed at the old plan',
    'Spec S-011|Spec revised': 'The spec writer fixed what check 1 found',
    'Spec S-011|Merged PR #446: three questions for you': 'Three questions were sent to you, and you answered them',
    'Spec S-011|Plan review failed, round 2': 'Check 2 of the plan failed: two wordings still clashed',
    'Spec S-011|Spec revised again': 'The spec writer worked through six fixes; one stayed blocked',
    'Spec S-011|Plan review failed, round 3': 'Check 3 of the plan failed: the experiments still hadn’t moved',
    'Spec S-011|Stop card 5': 'Work stopped: the plan failed its third check. Your call.',
    'Spec S-011|Spec revised, round 4': 'The spec writer revises the plan again',
    'Spec S-011|Plan review, round 4': 'The plan’s fourth check',
    'Spec S-011|S-011 frozen': 'You approve the plan and it is locked',
    /* the experiments, and the mockups */
    'E1 and E2|Both experiments registered': 'Both experiments were written down, not yet run',
    'E1 and E2|Run E1: how long your steps wait today': 'Experiment 1: measure how long your steps wait today',
    'E1 and E2|Run E2: can the records carry the timeline': 'Experiment 2: test whether the records can carry the timeline',
    'PR #445|First timeline mockup': 'The Chief of Staff drew the first timeline mockup',
    'PR #445|Checks passed': 'The first mockup passed its automatic checks',
    'PR #445|Merged PR #445': 'The first mockup was added to the project',
    'Mockups v2 to v4|Motion map': 'The Chief of Staff drew a map of the motion',
    'Mockups v2 to v4|v2: the desk as a trunk': 'Second mockup drawn: the desk as a trunk',
    'Mockups v2 to v4|v3: the motion pass': 'Third mockup: the motion pass',
    'Mockups v2 to v4|v3: the past shaded lighter': 'Third mockup: the past shaded lighter',
    'Mockups v2 to v4|v4: projects open on their plan': 'Fourth mockup: projects open on their plan'
  };
  var PWCODE = { 'Stop card 5': 'Stop card 5', 'Stop card 4': 'Stop card 4', 'Readiness card': 'Readiness card', 'New spec S-011, rounds reset': 'S-011',
    'Merged PR #446: three questions for you': 'PR #446', 'Merged PR #445': 'PR #445', 'Merged PR #443: the card’s notes and two questions': 'PR #443',
    'Merged PR #444: the answer, the number fix, the pack fix': 'PR #444', 'S-011 frozen': 'S-011', 'Run E1: how long your steps wait today': 'E1', 'Run E2: can the records carry the timeline': 'E2' };
  /* sprints: [plain name, its code, what this is (an example: no record holds it)] */
  var PWSP = {
    'Spec S-011': ['Second plan for the records work', 'S-011', 'The written plan for changing the records so the timeline can be drawn from them.'],
    'Spec S-010': ['First plan for the records work', 'S-010', 'The first version of that plan, replaced by the second.'],
    'Q-028': ['How long GitHub keeps run results', 'Research · Q-028', 'A question the researcher answered for Discovery, with its sources checked.'],
    'The brief': ['The brief', '', 'The one-page case for doing the work, checked before you rule on it.'],
    'E1 and E2': ['Two experiments', 'E1, E2', 'How long your steps wait today, and whether the records can carry the timeline.'],
    'PR #445': ['The first mockup', 'PR #445', 'The first drawing of the timeline, added to the project.'],
    'Mockups v2 to v4': ['Mockups two to four', 'v2 to v4', 'The next drawings, on a branch, not yet proposed.']
  };
  var PWPH = { Discovery: 'Shape the idea: what success means, what already exists, the risks and the scope, into a brief you rule on.',
               Design: 'Decide exactly what will be built and how it will be checked, for you to approve before Build.',
               Build: 'Write the checks first, then build the work and have it reviewed independently.',
               Launch: 'Put it live and hand it over; you rule whether it goes live and leaves the desk.' };
  var PWPROJ = { tl: 'One timeline of everything the AI team does, on your phone.', wd: 'A widget for your phone’s home screen.' };
  var PWMS = { M6: 'the records', M7: 'one timeline', M8: 'what needs you first' };
  /* answers: [plain label, plain consequence]; the system's key beneath */
  var PWANS = {
    'criteria-wrong': ['Start a fresh plan', 'The count of failed checks goes back to zero, and it is not held against the project.'],
    're-specify': ['Start a fresh plan, counted against the project', 'Counted as a strike. What a strike costs is not recorded.'],
    'confirm': ['Run one more check', 'Offered once; it is expected to find the same faults again.'],
    're-scope': ['Close this work as it stands, to be redefined', 'Nothing in the traced cause argues for it.'],
    'drop': ['Close this work', 'The work ends.'],
    'resubmit': ['Send the brief back to be fixed', 'It is fixed and goes to its readiness check again.'],
    'stop': ['Stop this project', 'The widget work ends here.']
  };
  var PWGATE = { Proceed: ['Go on into the next phase', ''], Hold: ['Wait: the case is updated and read again', ''], Recycle: ['Send it back to an earlier phase', ''], Kill: ['End the project', ''] };
  /* what you chose, said plainly: the option's own words beneath */
  var PWSAY = {
    'criteria-wrong (Recommended)': 'start a fresh plan; failed checks back to zero',
    'Hold for case 2 (Recommended)': 'hold the gate until the case is written again',
    'resubmit': 'send the brief back to be fixed'
  };
  var PWROLE = [[/^by orchestrator\b/, 'by the scheduler'], [/^by reviewer \(plan\)/, 'by the plan reviewer'], [/^by reviewer \(readiness\)/, 'by the readiness reviewer'],
    [/^by gate reviewer/, 'by the gate reviewer'], [/^by chief of staff/, 'by the Chief of Staff'], [/^by a read-only helper/, 'by an AI helper'], [/^by Actions/, 'by the automatic checks'],
    [/^by source checker/, 'by the source checker'], [/^by researcher/, 'by the researcher'], [/^by spec writer/, 'by the spec writer']];
  var PWGL = [
    ['Who does the work', [
      ['The workers are AI', 'Everyone named below is an AI assistant (a Claude session), not a person. You make the calls; they do the rest.'],
      ['Chief of Staff', 'Your lead AI assistant. It talks with you and runs the projects.'],
      ['Scheduler (the Orchestrator)', 'The automatic AI process that moves work along and stops to ask you.'],
      ['Spec writer', 'Writes the plan for a piece of work.'],
      ['Plan reviewer', 'Checks the plan. Three failed checks stop the work.'],
      ['Triage', 'Traces the cause after work stops.'],
      ['The Critic', 'A second opinion that argues against a case.'],
      ['Helpers', 'Short AI runs a session starts for one job.'],
      ['Session names', 'Each AI session is named after what it set out to do, with the day it began.'],
      ['Handover needed', 'A session that must pass its work to a new one before it ends: its memory is nearly full, or it is ending with work open.']]],
    ['Words', [
      ['Spec', 'The written plan for a piece of work.'],
      ['Plan review, round', 'One check of the plan. Each try is a round.'],
      ['Stop card', 'The question you get when work stops after three failed checks.'],
      ['Readiness card', 'The question you get when a brief fails its readiness check: resubmit it, or stop.'],
      ['Strike', 'A stop counted against the project. What it costs is not recorded yet.'],
      ['Freeze', 'You approve the plan and it is locked.'],
      ['Gate', 'Your decision whether a project moves into its next phase.'],
      ['Milestone', 'A major achievement within a phase.'],
      ['Sprint', 'One reviewed piece of work.'],
      ['Criteria, checks', 'The tests that prove a milestone is reached.'],
      ['Branch', 'A separate line of work; once merged, it joins the main line.'],
      ['Pull request (PR)', 'A proposed change to the project; once merged, it is part of it.'],
      ['Main', 'The project’s finished line, where merged work lands.']]],
    ['Codes', [
      ['M6, M7, M8', 'A milestone’s own id. Its plain name comes first.'],
      ['S-011', 'A plan’s id (a spec).'],
      ['2.2.2.10', 'Where it sits: phase 2, milestone 2, sprint 2, event 10.']]]
  ];
  var PWDOT = [[/\b(Spec S-01[01])\b/, 'Spec'], [/\b(Check \d)\b/, 'Plan review, round'], [/\b(third check)\b/, 'Plan review, round'], [/\b(Stop card)\b/, 'Stop card'],
    [/\b(readiness check)\b/, 'Readiness card'], [/\b(spec writer)\b/i, 'Spec writer']];
  /* words fixed in place, on the project page, home and the sheets (the test's sections C and E) */
  var PWX = [
    [/criteria not on record/g, 'its checks aren’t written yet'], [/(\d+) of (\d+) criteria met/g, '$1 of $2 checks passed'],
    [/Show (\d+) unused milestones?/g, 'Show $1 milestones with nothing recorded yet'], [/Hide the (\d+) unused milestones/g, 'Hide the $1 milestones with nothing recorded yet'],
    [/superseded by S-011/g, 'replaced by the second plan'], [/^Nothing at work$/, 'Nobody is working on this'], [/^(\d+) new$/, '$1 new since you looked'],
    [/join-up review/g, 'check that the parts fit together'], [/Triage’s root cause:/g, 'The cause, as traced after the stop:'], [/Applied by the Orchestrator/g, 'Carried out by the scheduler'],
    [/the Orchestrator applies it on its next run/g, 'the scheduler (an automatic AI process) carries it out on its next run'], [/the pipeline waits on your answer/g, 'the automatic work is paused until you answer'],
    [/Feeds not recorded/g, 'Holds up: not recorded'], [/^Yours to rule$/, 'Your decision to make'], [/^Yours · waiting$/, 'Waiting for your decision'], [/^Yours$/, 'Your decision'], [/^By proxy$/, 'Decided for you'],
    [/^Your ruling$/, 'Your decision'], [/^For you, by proxy$/, 'Decided for you, under your standing instruction']
  ];

  /* ---------- helpers ---------- */
  function pwDot(s) { for (var i = 0; i < PWDOT.length; i++) { var m = PWDOT[i][0].exec(s); if (m) return esc(s.slice(0, m.index)) + '<span class="pw-dot" role="button" tabindex="0" data-pwgl="' + esc(PWDOT[i][1]) + '">' + esc(m[1]) + '</span>' + esc(s.slice(m.index + m[1].length)); } return esc(s); }
  function pwKey(ev) { var l2 = ev.querySelector('.l2'); if (!l2) return ''; if (!l2.dataset.pwo) l2.dataset.pwo = l2.dataset.knKey || l2.textContent.trim(); return l2.dataset.pwo; }
  function pwSpr(ev) { var n = ev.dataset.ndk || ''; return n.split('|')[0]; }
  function pwText(root) {
    if (!root) return; var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, todo = [];
    while ((n = tw.nextNode())) { var p = n.parentElement; if (!p || p.closest('.pw-code, .pw-key, script, style, svg, .pw-glsheet')) continue; todo.push(n); }
    todo.forEach(function (n) { var t = n.textContent, o = t; PWX.forEach(function (r) { t = t.replace(r[0], r[1]); }); if (t !== o) n.textContent = t; });
  }
  /* other layers read an event's title from the page: give them the title the records use */
  ppTitle = function (ev) { var t = ev.querySelector('.l2'); return t ? (t.dataset.knKey || t.dataset.pwo || t.textContent.trim()) : ''; };

  /* ---------- the project page's rows ---------- */
  function pwRows() {
    [].slice.call(document.querySelectorAll('#v13list .v13ev')).forEach(function (ev) {
      var k = pwKey(ev); if (!k || ev.dataset.pw) return; ev.dataset.pw = '1';
      var l2 = ev.querySelector('.l2'); l2.dataset.knKey = k;
      var plain = PWT[pwSpr(ev) + '|' + k] || PWT[k];
      if (plain) l2.innerHTML = pwDot(plain) + (PWCODE[k] ? ' <span class="pw-code">' + esc(PWCODE[k]) + '</span>' : '');
      else l2.innerHTML = pwDot(k);
      var say = ev.querySelector('.kn-say');
      if (say && !say.dataset.pw) { say.dataset.pw = '1'; var q = say.querySelector('q'), raw = q ? q.textContent : '', pl = PWSAY[raw] || raw, proxy = /proxy/i.test(say.textContent);
        say.innerHTML = (proxy ? 'Chosen for you, under your standing instruction: ' : 'You chose: ') + '<b>' + esc(pl) + '</b><span class="pw-key">The option ' + (proxy ? 'chosen' : 'you tapped') + ': ' + esc(raw) + '</span>'; }
      var l3 = ev.querySelector('.l3'); if (l3 && !l3.dataset.pwr) { l3.dataset.pwr = '1'; var t = l3.textContent; PWROLE.forEach(function (r) { t = t.replace(r[0], r[1]); }); if (t !== l3.textContent) l3.textContent = t; }
      if (ev.dataset.knWait && k === 'Stop card 5' && l3 && !l3.dataset.pwh) { l3.dataset.pwh = '1'; l3.textContent = 'Three checks failed · holds up the records, one timeline, what needs you first'; }
      /* the widget's card: one name everywhere ("Readiness card"), a card not a gate, and an answer one tap away */
      if (k === 'Readiness card') { ev.dataset.knWait = '1'; ev.dataset.knopen = 's:Readiness card';
        var b1 = ev.querySelector('.l1 > b'); if (b1 && b1.textContent === 'Gate') b1.textContent = 'Card';
        if (!ev.querySelector('.kn-ansrow')) (l3 || l2).insertAdjacentHTML('afterend', '<button type="button" class="kn-open kn-ansrow" data-knopen="s:Readiness card">Choose what happens next</button>'); }
    });
    /* the number line: the kind, its state and time first; the number after, in grey; a stop or a decision that is done is "Answered" */
    [].slice.call(document.querySelectorAll('#v13list .v13ev > .tx > .no4')).forEach(function (n4) {
      var meta = n4.querySelector('.lk-meta'); if (!meta) return; var num = n4.dataset.pwn;
      if (!num) { num = ''; [].slice.call(n4.childNodes).forEach(function (c) { if (c.nodeType === 3 && /\d/.test(c.textContent)) { num += c.textContent.trim(); var sp = document.createElement('span'); sp.className = 'pw-nhide'; sp.textContent = c.textContent; c.replaceWith(sp); } }); n4.dataset.pwn = num || '-'; }
      var mt = meta.textContent.replace(/^\s*·\s*/, '').replace(/^(Stop|Decision) · Done\b/, '$1 · Answered').replace(/^Gate(?= · )/, n4.closest('.v13ev').dataset.knopen === 's:Readiness card' ? 'Card' : 'Gate');
      var txt = mt + (num === '-' ? '' : ' · ');
      var pm = n4.querySelector('.pw-meta'); if (!pm) { pm = document.createElement('span'); pm.className = 'pw-meta'; n4.appendChild(pm); }
      var html = esc(txt) + (num === '-' ? '' : '<span class="pw-code">' + esc(num) + '</span>'); if (pm.innerHTML !== html) pm.innerHTML = html;
    });
    [].slice.call(document.querySelectorAll('#v13list .v13gr')).forEach(function (gr) {
      var bb = gr.querySelector('.l1 > b'); if (!bb || gr.dataset.pw) return; var key = bb.dataset.pwo || bb.textContent.trim();
      if (PWSP[key]) { gr.dataset.pw = '1'; bb.dataset.pwo = key; var s = PWSP[key];
        bb.innerHTML = pwDot(s[0]); var l3 = gr.querySelector('.l3'); if (l3 && s[1]) l3.insertAdjacentHTML('beforeend', ' <span class="pw-code">· ' + esc(s[1]) + '</span>');
        var tx = gr.querySelector('.tx'); if (tx && !tx.querySelector('.pw-what')) tx.insertAdjacentHTML('beforeend', '<span class="pw-what">' + esc(s[2]) + ' <i class="pw-ex">example</i></span>'); }
      else if (/^M\d+$/.test(key)) { gr.dataset.pw = '1'; var nm = gr.querySelector('.nm');
        if (nm) { bb.style.display = 'none'; nm.insertAdjacentHTML('beforeend', ' <span class="pw-code">' + esc(key) + '</span>'); } }
      else if (/^(Discovery|Design|Build|Launch)-\d$/.test(key)) { gr.dataset.pw = '1'; bb.style.display = 'none'; }   /* a standard milestone's own id stays hidden (R6 answers 13 and 14) */
    });
    [].slice.call(document.querySelectorAll('#v13list .v13phase')).forEach(function (ph) {
      var hd = ph.firstElementChild; if (!hd || hd.dataset.pw) return; var m = /(Discovery|Design|Build|Launch)/.exec(hd.textContent); if (!m) return; hd.dataset.pw = '1';
      hd.insertAdjacentHTML('afterend', '<p class="pw-phase"><b>' + esc(m[1]) + ':</b> ' + esc(PWPH[m[1]]) + '</p>');
    });
    /* a plan's actions: the action first, its number after it in grey */
    [].slice.call(document.querySelectorAll('#v13list .ti > .num')).forEach(function (n) { if (n.dataset.pw) return; n.dataset.pw = '1'; var ti = n.parentElement; ti.appendChild(n); n.classList.add('pw-code', 'pw-anum'); });
    var L = document.getElementById('v13list');
    if (L && state.proj && PWPROJ[state.proj] && !L.querySelector(':scope > .pw-proj')) L.insertAdjacentHTML('afterbegin', '<p class="pw-proj"><b>' + esc(proj(state.proj).name) + ':</b> ' + esc(PWPROJ[state.proj]) + ' <i class="pw-ex">example</i></p>');
    pwText(L);
  }
  /* the folded map's strip reads the row's number */
  var _ctNoPW = ctNo;
  ctNo = function (el) { var n = el.querySelector(':scope .no4.own, :scope > .tx .no4'); if (n && n.dataset.pwn) { var m = n.querySelector('.lk-meta'); return (n.dataset.pwn !== '-' ? n.dataset.pwn : '') + (m ? m.textContent : ''); } return _ctNoPW(el); };
  /* a waiting row is the stop card, or the widget's readiness card */
  var _r8WaitingPW = r8Waiting;
  r8Waiting = function () { var w = document.querySelector('#v13list .v13ev[data-kn-wait]'); return w || _r8WaitingPW(); };

  /* ---------- the map: lane names plain, the number kept first (the filter finds a lane by its number) ---------- */
  var PWLANE = [[/ S-011$/, ' Second plan'], [/ S-010$/, ' First plan'], [/ E1 and E2$/, ' Two experiments'], [/ PR #445$/, ' First mockup'], [/ Mockups v2 to v4$/, ' Mockups 2 to 4'], [/ Research Q-028$/, ' Research: run results'], [/ Q-028$/, ' Research: run results']];
  function pwMap() {
    [].slice.call(document.querySelectorAll('#v13in svg text.lb')).forEach(function (t) { var s = t.textContent, o = s; PWLANE.forEach(function (r) { s = s.replace(r[0], r[1]); }); if (s !== o) t.textContent = s; });
  }

  /* ---------- home ---------- */
  function pwHome() {
    var view = document.getElementById('view'); if (!view) return;
    [].slice.call(view.querySelectorAll('.pr-row')).forEach(function (r) {
      if (r.dataset.pw) return; var n = NEEDS[+r.dataset.prk], ev = r.querySelector('.ev41'), q = r.querySelector('.pr-q'), why = r.querySelector('.pr-why b'); if (!ev || !q || !n) return; r.dataset.pw = '1';
      if (n.p === 'tl') { ev.innerHTML = '<b>Work stopped</b> <span class="pw-code">Stop card 5 · 2.2.2.10 · S-011</span>'; q.innerHTML = pwDot('The plan for the records work failed its third check. What next?');
        if (why) why.textContent = 'Holds up 3 milestones: ' + PWMS.M6 + ', ' + PWMS.M7 + ', ' + PWMS.M8; }
      else { ev.innerHTML = '<b>The widget’s brief failed its readiness check</b> <span class="pw-code">Readiness card · 1.8.1.3</span>'; q.innerHTML = pwDot('Your call: resubmit the widget’s brief, or stop?'); }
      var chip = r.querySelector('.pr-top'); if (chip && !r.querySelector('.pw-what')) chip.insertAdjacentHTML('afterend', '<span class="pw-what">' + esc(PWPROJ[n.p] || '') + ' <i class="pw-ex">example</i></span>');
      var ans = r.querySelector('.pr-ans'); if (ans) ans.textContent = 'Decide what’s next'; var go = r.querySelector('.pr-goto'); if (go) go.textContent = 'Show on the timeline';
    });
    [].slice.call(view.querySelectorAll('.sg-grp[data-sgg]')).forEach(function (g) {
      if (g.classList.contains('pr-card') || g.dataset.pw) return; g.dataset.pw = '1'; var id = g.dataset.sgg;
      if (PWPROJ[id]) { var row = g.querySelector('.sg-row'); if (row) row.insertAdjacentHTML('afterend', '<p class="pw-what pw-pcard">' + esc(PWPROJ[id]) + ' <i class="pw-ex">example</i></p>'); }
    });
    var sum = view.querySelector('.sg-sum'); if (sum && !view.querySelector('.pw-ai')) sum.insertAdjacentHTML('afterend', '<p class="pw-ai">The work is done by AI assistants; you make the calls.</p>');
    pwText(view);
  }

  /* ---------- sheets, when they open ---------- */
  function pwSheet() {
    var sh = document.querySelector('.kn-sheet:not(.pw-glsheet)'); if (!sh || sh.dataset.pw) return; var h2 = sh.querySelector('h2'); if (!h2) return; sh.dataset.pw = '1';
    var kd = (sh.querySelector('.kd') || {}).textContent || '';
    /* a decision: what you chose, plainly, the option beneath */
    var q0 = sh.querySelector('.q');
    if (q0 && /Your words|The ruling/.test(sh.textContent)) { var raw = q0.textContent.replace(/[“”]/g, ''); var h3 = q0.previousElementSibling; if (h3 && h3.tagName === 'H3') h3.textContent = 'You chose';
      q0.textContent = '“' + (PWSAY[raw] || raw) + '”'; q0.insertAdjacentHTML('afterend', '<p class="pw-key">The option you tapped: ' + esc(raw) + '</p>'); }
    /* a gate: what it is, and its choices plainly */
    if (/Gate/.test(kd)) { var kdE = sh.querySelector('.kd'); kdE.insertAdjacentHTML('afterend', ''); h2.insertAdjacentHTML('afterend', '<p class="pw-what">A gate is your decision whether a project moves into its next phase.</p>');
      [].slice.call(sh.querySelectorAll('.opts .opt')).forEach(function (o) { var b = o.querySelector('b'); if (!b) return; var k = b.textContent.trim(), p = PWGATE[k]; if (!p) return;
        var rest = o.textContent.replace(k, '').trim(); o.innerHTML = '<b>' + esc(p[0]) + '</b>' + esc(rest) + '<span class="pw-key">' + esc(k) + '</span>'; }); }
    /* a stop or a card */
    var key = sh.dataset.knkey || '';
    var stop = key === 's:Stop card 5' || /S-011 failed three plan reviews/.test(h2.textContent), stop4 = key === 's:Stop card 4' || /Stop card 4/.test(h2.textContent), card = key === 's:Readiness card';
    if (stop || stop4) {
      sh.querySelector('.kd').insertAdjacentHTML('afterend', '<p class="pw-what">What a stop is: after three failed checks of a plan, work stops and asks you what to do.</p>');
      if (stop) { h2.innerHTML = pwDot('The plan for the records work failed its third check. What next?'); h2.insertAdjacentHTML('afterend', '<p class="pw-code pw-sub">Stop card 5 · S-011</p>'); }
      else { h2.innerHTML = pwDot('Work stopped: the first plan failed three checks'); h2.insertAdjacentHTML('afterend', '<p class="pw-code pw-sub">Stop card 4 · S-010</p>'); }
      var li = sh.querySelectorAll('.ck li'); if (li[0]) li[0].innerHTML = '<span class="m bad"></span><span>The plan failed three checks in a row<small>the stop rule: after three failed checks, work stops and asks you</small></span>';
      if (li[1] && stop) li[1].innerHTML = '<span class="m"></span><span>Holds up 3 milestones: ' + PWMS.M6 + ', ' + PWMS.M7 + ', ' + PWMS.M8 + '<small>since 14 Nov, 9:42 am</small></span>';
    }
    if (card) { sh.querySelector('.kd').innerHTML = (ICONS.gate || '') + 'Readiness card';
      sh.querySelector('.kd').insertAdjacentHTML('afterend', '<p class="pw-what">What a readiness card is: a brief failed its readiness check, so work waits for you to send it back or stop.</p>');
      h2.insertAdjacentHTML('afterend', '<p class="pw-code pw-sub">Readiness card · 1.8.1.3 · Home-screen widget</p>');
      var li2 = sh.querySelectorAll('.ck li'); if (li2[0]) li2[0].innerHTML = '<span class="m bad"></span><span>The widget’s brief failed its readiness check<small>its first check, 4 Nov, 2:52 pm</small></span>'; }
    [].slice.call(sh.querySelectorAll('.opts .opt')).forEach(function (o) {
      var b = o.querySelector('b'); if (!b || o.querySelector('.pw-key')) return; var k = b.textContent.trim(), p = PWANS[k]; if (!p) return;
      o.innerHTML = '<b>' + esc(p[0]) + '</b>' + esc(p[1]) + '<span class="pw-key">' + esc(k) + '</span>'; });
    [].slice.call(sh.querySelectorAll('.ck li > span:last-child')).forEach(function (sp) { var f = sp.firstChild; if (f && f.nodeType === 3 && PWANS[f.textContent.trim()]) f.textContent = PWANS[f.textContent.trim()][0] + ' (' + f.textContent.trim() + ')'; });
    pwText(sh);
  }
  /* the answer buttons say what they do */
  function pwButtons() { [].slice.call(document.querySelectorAll('.kn-ansrow')).forEach(function (b) { if (b.textContent !== 'Choose what happens next') b.textContent = 'Choose what happens next'; }); }

  /* ---------- D: the glossary and cast sheet ---------- */
  var pwGlEl = null;
  function pwGlClose() { if (!pwGlEl) return; var s = pwGlEl; pwGlEl = null; s.sheet.classList.remove('on'); s.scrim.classList.remove('on'); setTimeout(function () { s.sheet.remove(); s.scrim.remove(); }, REDUCED ? 0 : 260); }
  function pwGloss(entry) {
    pwGlClose();
    var h = '<div class="kd">Words and who does the work</div><h2>What the words mean</h2>' + PWGL.map(function (sec) {
      return '<h3>' + esc(sec[0]) + '</h3><dl class="pw-gl">' + sec[1].map(function (e) { return '<div data-pwe="' + esc(e[0]) + '"><dt>' + esc(e[0]) + '</dt><dd>' + esc(e[1]) + '</dd></div>'; }).join('') + '</dl>'; }).join('');
    var scrim = document.createElement('div'), sheet = document.createElement('div'); scrim.className = 'kn-scrim'; sheet.className = 'kn-sheet pw-glsheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'What the words mean');
    sheet.innerHTML = '<div class="grab" aria-hidden="true"></div><button type="button" class="x" aria-label="Close"><span><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></span></button>' + h;
    document.body.appendChild(scrim); document.body.appendChild(sheet); pwGlEl = { scrim: scrim, sheet: sheet };
    scrim.addEventListener('click', pwGlClose); sheet.querySelector('.x').addEventListener('click', pwGlClose);
    requestAnimationFrame(function () { requestAnimationFrame(function () { scrim.classList.add('on'); sheet.classList.add('on');
      if (entry) { var e = sheet.querySelector('[data-pwe="' + entry + '"]'); if (e) { e.classList.add('hit'); setTimeout(function () { sheet.scrollTop = Math.max(0, e.offsetTop - 80); }, REDUCED ? 0 : 330); } } }); });
  }
  function pwCaps() {
    if (v13on()) return;   /* home's capsule only: the project's top row has no room (the dotted words open it there) */
    [].slice.call(document.querySelectorAll('#view .hm-band .capsule')).forEach(function (c) { if (c.querySelector('.pw-qbtn')) return;
      c.insertAdjacentHTML('afterbegin', '<button type="button" class="cbtn pw-qbtn" aria-label="What the words mean"><span aria-hidden="true">?</span></button>'); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') pwGlClose(); });
  window.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.pw-qbtn, .pw-dot'); if (!t) return;
    e.stopImmediatePropagation(); e.preventDefault(); pwGloss(t.dataset.pwgl || '');
  }, true);

  /* ---------- the filter's cuts, said plainly ---------- */
  FH_PICKS.forEach(function (x) { x.name = { all: 'Everything', you: 'Your decisions', turn: 'Big moments', review: 'Reviews and checks', research: 'Research', main: 'Only what was merged' }[x.id] || x.name; });

  /* ---------- applying ---------- */
  function pwApply() { pwHome(); pwRows(); pwMap(); pwSheet(); pwButtons(); pwCaps(); var pp = document.querySelector('.pp-sheet'); if (pp) pwText(pp); }
  var pwObs = new MutationObserver(function () { if (!pwObs.raf) pwObs.raf = requestAnimationFrame(function () { pwObs.raf = 0; try { pwApply(); } catch (e) { console.error(e); } }); });
  pwObs.observe(document.body, { childList: true, subtree: true });
  setTimeout(pwApply, 50);
