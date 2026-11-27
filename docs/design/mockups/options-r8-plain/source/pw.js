  /* ================= round 8, answers 11 and 27: the plain-words options (over v43; docs/design/audit-2026-11-27-v43-plain-words.md)
     The phone's hash, tokens joined by dots: o=v|A|B|C|D|E|F|R (the approach), f=<flag>+<flag> (single changes, for the open questions),
     at=home|proj|sheet|dec|gloss|menu (where the phone starts), light or dark (set by the theme script).
     Flags: titles (plain titles), code2 (numbers and codes after the name, in grey), what ("what this is" lines), why (the Why's first sentence on the row),
     gloss (a "?" glossary and cast sheet, dotted words), roles (plain role names and plain answers), words ("your words" as a plain sentence, the key beneath),
     tag (the session tag as "Conversation · date"), ai (the page says the workers are AI), plain (F: the plain-words switch in More is on), hide (F: numbers, tags and records hidden). ================= */
  var PW = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.'), t = {};
    h.forEach(function (x) { var i = x.indexOf('='); if (i > 0) t[x.slice(0, i)] = x.slice(i + 1); });
    var o = t.o || 'v', fl = {}, SETS = { v: [], A: ['titles', 'code2'], B: ['what'], C: ['why'], D: ['gloss'], E: ['roles', 'words'], F: [],
      R: ['titles', 'code2', 'what', 'gloss', 'roles', 'words', 'tag', 'ai'] };
    (SETS[o] || []).forEach(function (k) { fl[k] = 1; });
    (t.f || '').split('+').forEach(function (k) { if (k) fl[k] = 1; });
    if (o === 'F' && t.mode !== 'detailed') ['plain', 'titles', 'what', 'roles', 'words', 'hide'].forEach(function (k) { fl[k] = 1; });
    var on = Object.keys(fl).length || o === 'F';
    if (on) document.documentElement.classList.add('pw-on');
    Object.keys(fl).forEach(function (k) { document.documentElement.classList.add('pw-' + k); });
    return { o: o, at: t.at || 'home', f: fl, mode: t.mode || 'plain' };
  })();
  function pwOn(k) { return !!PW.f[k]; }

  /* ---------- the plain text, written from words already on the page (the Why sentences, the sheets); examples are marked ---------- */
  var PWT = {   /* event titles, plain first */
    'New spec S-011, rounds reset': 'A fresh plan was started, as you asked',
    'First draft': 'The spec writer wrote the first draft from your six answers',
    'Plan review failed, round 1': 'Check 1 of the plan failed: the experiments still pointed at the old plan',
    'Spec revised': 'The spec writer fixed what check 1 found',
    'Merged PR #446: three questions for you': 'Three questions were sent to you, and you answered them',
    'Plan review failed, round 2': 'Check 2 of the plan failed: two wordings still clashed',
    'Spec revised again': 'The spec writer worked through six fixes; one stayed blocked',
    'Plan review failed, round 3': 'Check 3 of the plan failed: the experiments still hadn’t moved',
    'Stop card 5': 'Work stopped: the plan failed its third check. Your call.',
    'Spec revised, round 4': 'The spec writer revises the plan again',
    'Plan review, round 4': 'The plan’s fourth check',
    'S-011 frozen': 'You approve the plan and it is locked'
  };
  var PWCODE = { 'Stop card 5': 'Stop card 5', 'Merged PR #446: three questions for you': 'PR #446', 'New spec S-011, rounds reset': 'S-011' };
  var PWWHY = {  /* the Why's first sentence (the page's own Why text) */
    'New spec S-011, rounds reset': 'You said to write a new spec after stop card 4, so a fresh spec began with the review rounds back at zero.',
    'First draft': 'A new spec starts as a draft.',
    'Plan review failed, round 1': 'Every draft goes to plan review before it can freeze.',
    'Spec revised': 'The spec writer fixed what round 1 found.',
    'Merged PR #446: three questions for you': 'Round 1 raised three things only you can decide, so they went to you as questions.',
    'Plan review failed, round 2': 'The revised spec went back to review.',
    'Spec revised again': 'The spec writer worked through six actions to answer round 2; one stayed blocked.',
    'Plan review failed, round 3': 'Review again.',
    'Stop card 5': 'Three failed reviews trip the stop rule, so the orchestrator stopped and asked you what next.'
  };
  var PWSP = { 'Spec S-011': ['Second plan for the records work', 'S-011', 'The written plan for changing the records so the timeline can be drawn from them.'],
               'Spec S-010': ['First plan for the records work', 'S-010', 'The first version of that plan, replaced by the second.'] };
  var PWPH = { Discovery: 'Shape the idea: what success means, what already exists, the risks and the scope, into a brief you rule on.',
               Design: 'Decide exactly what will be built and how it will be checked, for you to approve before Build.',
               Build: 'Write the checks first, then build the work and have it reviewed independently.',
               Launch: 'Put it live and hand it over; you rule whether it goes live and leaves the desk.' };
  var PWPROJ = { tl: 'One timeline of everything the AI team does, on your phone.',
                 wg: 'A widget for your phone’s home screen.' };
  var PWMS = { M6: 'the records', M7: 'one timeline', M8: 'what needs you first' };
  var PWANS = {  /* the stop card's answers, plain first, the system's key beneath */
    'criteria-wrong': ['Start a fresh plan', 'The count of failed checks goes back to zero, and it is not held against the project.'],
    're-specify': ['Start a fresh plan, counted against the project', 'Counted as a strike. What a strike costs is not recorded.'],
    'confirm': ['Run one more check', 'Offered once; it is expected to find the same faults again.'],
    're-scope': ['Close this work as it stands, to be redefined', 'Nothing in the traced cause argues for it.'],
    'drop': ['Close this work', 'The timeline work ends.']
  };
  var PWGL = [
    ['Who does the work', [
      ['The workers are AI', 'Everyone named below is an AI assistant (a Claude session), not a person. You make the calls; they do the rest.'],
      ['Chief of Staff', 'Your lead AI assistant. It talks with you and runs the projects.'],
      ['Orchestrator', 'The automatic scheduler. It moves work along and stops to ask you.'],
      ['Spec writer', 'Writes the plan for a piece of work.'],
      ['Plan reviewer', 'Checks the plan. Three failed checks stop the work.'],
      ['Triage', 'Traces the cause after work stops.'],
      ['The Critic', 'A second opinion that argues against a case.'],
      ['Helpers', 'Short AI runs a session starts for one job.']]],
    ['Words', [
      ['Spec', 'The written plan for a piece of work.'],
      ['Plan review, round', 'One check of the plan. Each try is a round.'],
      ['Stop card', 'The question you get when work stops after three failed checks.'],
      ['Strike', 'A stop counted against the project. What it costs is not recorded yet.'],
      ['Freeze', 'You approve the plan and it is locked.'],
      ['Gate', 'Your decision whether a project moves into its next phase.'],
      ['Milestone', 'A major achievement within a phase.'],
      ['Sprint', 'One reviewed piece of work.'],
      ['Criteria', 'The checks that prove a milestone is reached.'],
      ['Pull request (PR)', 'A proposed change to the project; once merged, it is part of it.'],
      ['Main', 'The project’s finished line, where merged work lands.']]],
    ['Codes', [
      ['M6, M7, M8', 'A milestone’s own id. Its plain name sits beside it.'],
      ['S-011', 'A plan’s id (a spec).'],
      ['2.2.2.10', 'Where it sits: phase 2, milestone 2, sprint 2, event 10.'],
      ['CoS 14 Nov', 'The Chief of Staff’s conversation that began on 14 Nov.']]]
  ];
  var PWDOT = [[/\b(Spec S-01[01])\b/, 'Spec'], [/\b(Check \d)\b/, 'Plan review, round'], [/\b(third check)\b/, 'Plan review, round'], [/\b(Plan review)\b/, 'Plan review, round'], [/\b(plan reviews)\b/, 'Plan review, round'], [/\b(Stop card)\b/, 'Stop card'], [/\b(spec writer)\b/i, 'Spec writer']];

  /* ---------- small helpers ---------- */
  function pwT(el, s) { if (el && el.textContent !== s) el.textContent = s; }
  function pwKey(ev) { var l2 = ev.querySelector('.l2'); if (!l2) return ''; if (!l2.dataset.pwo) l2.dataset.pwo = l2.dataset.knKey || l2.textContent.trim(); return l2.dataset.pwo; }
  function pwDot(s) { if (!pwOn('gloss')) return esc(s); for (var i = 0; i < PWDOT.length; i++) { var m = PWDOT[i][0].exec(s); if (m) return esc(s.slice(0, m.index)) + '<span class="pw-dot" role="button" tabindex="0" data-pwgl="' + esc(PWDOT[i][1]) + '">' + esc(m[1]) + '</span>' + esc(s.slice(m.index + m[1].length)); } return esc(s); }

  /* ---------- the project page's rows ---------- */
  function pwRows() {
    [].slice.call(document.querySelectorAll('#v13list .v13ev')).forEach(function (ev) {
      var k = pwKey(ev); if (!k || ev.dataset.pw) return; if (!/^Spec S-011\|/.test(ev.dataset.ndk || '')) return; ev.dataset.pw = '1';
      var l2 = ev.querySelector('.l2'); l2.dataset.knKey = k;
      if (pwOn('titles') && PWT[k]) { l2.innerHTML = pwDot(PWT[k]) + (PWCODE[k] && !pwOn('hide') ? ' <span class="pw-code">' + esc(PWCODE[k]) + '</span>' : ''); }
      else if (pwOn('gloss')) l2.innerHTML = pwDot(k);
      if (pwOn('why') && PWWHY[k] && !ev.querySelector('.pw-why')) { var tx = ev.querySelector('.tx'); var w = document.createElement('div'); w.className = 'pw-why'; w.textContent = PWWHY[k]; l2.insertAdjacentElement('afterend', w); }
      var say = ev.querySelector('.kn-say');
      if (say && (pwOn('words') || pwOn('roles'))) say.innerHTML = 'You chose: <b>start a fresh plan; failed checks back to zero</b><span class="pw-key">The option you tapped: criteria-wrong (Recommended)</span>';
      if (pwOn('tag') || pwOn('hide')) [].slice.call(ev.querySelectorAll('.ss-q')).forEach(function (b) { if (pwOn('hide')) { b.style.display = 'none'; return; } var m = /(\d+ \w{3})/.exec(b.textContent); if (m && !b.dataset.pw) { b.dataset.pw = '1'; b.innerHTML = '<i class="ss-dot"></i>Conversation · ' + esc(m[1]); } });
    });
    if (pwOn('code2') || pwOn('hide')) [].slice.call(document.querySelectorAll('#v13list .v13ev > .tx > .no4')).forEach(function (n4) {
      var meta = n4.querySelector('.lk-meta'); if (!meta) return; var num = n4.dataset.pwn;
      if (!num) { num = ''; [].slice.call(n4.childNodes).forEach(function (c) { if (c.nodeType === 3 && /\d/.test(c.textContent)) { num += c.textContent.trim(); var sp = document.createElement('span'); sp.className = 'pw-nhide'; sp.textContent = c.textContent; c.replaceWith(sp); } }); n4.dataset.pwn = num || '-'; }
      var txt = meta.textContent.replace(/^\s*·\s*/, '') + (pwOn('hide') || num === '-' ? '' : ' · ');
      var pm = n4.querySelector('.pw-meta'); if (!pm) { pm = document.createElement('span'); pm.className = 'pw-meta'; n4.appendChild(pm); }
      var html = esc(txt) + (pwOn('hide') || num === '-' ? '' : '<span class="pw-code">' + esc(num) + '</span>'); if (pm.innerHTML !== html) pm.innerHTML = html;
    });
    [].slice.call(document.querySelectorAll('#v13list .v13gr')).forEach(function (gr) {
      var bb = gr.querySelector('.l1 > b'); if (!bb || gr.dataset.pw) return; var key = bb.dataset.pwo || bb.textContent.trim();
      if (PWSP[key]) { gr.dataset.pw = '1'; bb.dataset.pwo = key; var s = PWSP[key];
        if (pwOn('titles')) { bb.innerHTML = pwDot(s[0]); var l3 = gr.querySelector('.l3'); if (l3) l3.innerHTML = esc(l3.textContent.replace('superseded by S-011', 'replaced by the second plan')) + (pwOn('hide') ? '' : ' <span class="pw-code">· ' + esc(s[1]) + '</span>'); }
        else if (pwOn('gloss')) bb.innerHTML = pwDot(key);
        if (pwOn('what')) { var tx = gr.querySelector('.tx'); if (tx && !tx.querySelector('.pw-what')) tx.insertAdjacentHTML('beforeend', '<span class="pw-what">' + esc(s[2]) + ' <i class="pw-ex">example</i></span>'); } }
      if (/^M\d+$/.test(key) && (pwOn('code2') || pwOn('hide')) && !gr.dataset.pw) { gr.dataset.pw = '1'; var nm = gr.querySelector('.nm');
        if (nm) { bb.style.display = 'none'; if (!pwOn('hide')) nm.insertAdjacentHTML('beforeend', ' <span class="pw-code">' + esc(key) + '</span>'); } }
    });
    if (pwOn('what')) [].slice.call(document.querySelectorAll('#v13list .v13phase')).forEach(function (ph) {
      var hd = ph.firstElementChild; if (!hd || hd.dataset.pw) return; var m = /(Discovery|Design|Build|Launch)/.exec(hd.textContent); if (!m) return; hd.dataset.pw = '1';
      hd.insertAdjacentHTML('afterend', '<p class="pw-phase"><b>' + esc(m[1]) + ':</b> ' + esc(PWPH[m[1]]) + '</p>');
    });
    var wk = document.querySelector('#v13list .pp-work b');
    if (wk && !wk.dataset.pw && (pwOn('roles') || pwOn('ai'))) { wk.dataset.pw = '1'; wk.textContent = 'At work now · Chief of Staff, your lead AI assistant';
      var par = wk.parentElement; [].slice.call(par.childNodes).forEach(function (c) { if (c.nodeType === 3 && /CoS/.test(c.textContent)) c.textContent = ' '; });
      var sm = par.querySelector('small'); if (sm && pwOn('roles')) sm.textContent = sm.textContent.replace('the pipeline waits on your answer', 'the automatic work is paused until you answer'); }
  }

  /* the folded map's strip reads the row's number: give it the number, not the moved line */
  var _ctNoPW = ctNo;
  ctNo = function (el) { var n = el.querySelector(':scope .no4.own, :scope > .tx .no4'); if (n && n.dataset.pwn && (pwOn('code2') || pwOn('hide'))) { var m = n.querySelector('.lk-meta'); return (n.dataset.pwn !== '-' && !pwOn('hide') ? n.dataset.pwn : '') + (m ? (pwOn('hide') ? m.textContent.replace(/^\s*·\s*/, '') : m.textContent) : ''); } return _ctNoPW(el); };

  /* ---------- home ---------- */
  function pwHome() {
    var view = document.getElementById('view'); if (!view) return;
    [].slice.call(view.querySelectorAll('.pr-row')).forEach(function (r) {
      if (r.dataset.pw) return; var stop = r.dataset.prk === '0', ev = r.querySelector('.ev41'), q = r.querySelector('.pr-q'), why = r.querySelector('.pr-why b'); if (!ev || !q) return; r.dataset.pw = '1';
      if (pwOn('titles')) {
        if (stop) { ev.innerHTML = '<b>Work stopped</b>' + (pwOn('hide') ? '' : ' <span class="pw-code">Stop card 5 · 2.2.2.10 · S-011</span>'); q.innerHTML = pwDot('The plan for the records work failed its third check. What next?');
          if (why) why.textContent = 'Holds up 3 milestones: ' + PWMS.M6 + ', ' + PWMS.M7 + ', ' + PWMS.M8; }
        else { ev.innerHTML = '<b>The check of the brief failed</b>' + (pwOn('hide') ? '' : ' <span class="pw-code">1.8.1.2</span>'); }
      } else if (pwOn('code2') && stop) ev.innerHTML = '<b>Stop card 5</b> <span class="pw-code">Stop · 2.2.2.10 · S-011</span>';
      else if (pwOn('gloss') && stop) q.innerHTML = pwDot(q.textContent);
      if (pwOn('why') && stop && !r.querySelector('.pw-why')) q.insertAdjacentHTML('afterend', '<span class="pw-why">' + esc(PWWHY['Stop card 5']) + '</span>');
      if (pwOn('what')) { var chip = r.querySelector('.pr-top'); if (chip && !r.querySelector('.pw-what')) chip.insertAdjacentHTML('afterend', '<span class="pw-what">' + esc(PWPROJ[stop ? 'tl' : 'wg']) + ' <i class="pw-ex">example</i></span>'); }
    });
    [].slice.call(view.querySelectorAll('.sg-grp[data-sgg]')).forEach(function (g) {
      if (g.classList.contains('pr-card') || g.dataset.pw) return; g.dataset.pw = '1'; var id = g.dataset.sgg;
      if (pwOn('what') && PWPROJ[id]) { var row = g.querySelector('.sg-row'); if (row) row.insertAdjacentHTML('afterend', '<p class="pw-what pw-pcard">' + esc(PWPROJ[id]) + ' <i class="pw-ex">example</i></p>'); }
      var pl = g.querySelector('.fh-pline b'); if (pl && (pwOn('roles') || pwOn('ai'))) pl.textContent = 'Chief of Staff (your lead AI assistant)';
    });
    var sum = view.querySelector('.sg-sum'); if (sum && pwOn('ai') && !view.querySelector('.pw-ai')) sum.insertAdjacentHTML('afterend', '<p class="pw-ai">The work is done by AI assistants; you make the calls.</p>');
  }

  /* ---------- the stop sheet, when it opens ---------- */
  function pwSheet() {
    var sh = document.querySelector('.kn-sheet'); if (!sh || sh.dataset.pw) return; var h2 = sh.querySelector('h2'); if (!h2) return; sh.dataset.pw = '1';
    var stop = /Stop card 5|S-011 failed three plan reviews/.test(h2.textContent) || /S-011 failed three/.test(sh.textContent);
    if (pwOn('words') && /Your words/.test(sh.textContent)) { var q0 = sh.querySelector('.q'); if (q0) q0.insertAdjacentHTML('afterend', '<p class="pw-key">The option you tapped: ' + esc(q0.textContent.replace(/[“”]/g, '')) + '</p>'), q0.textContent = '“Start a fresh plan; failed checks back to zero”'; }
    if (!stop) return;
    if (pwOn('what')) sh.querySelector('.kd').insertAdjacentHTML('afterend', '<p class="pw-what">What a stop is: after three failed checks of a plan, work stops and asks you what to do.</p>');
    if (pwOn('titles')) { h2.innerHTML = pwDot('The plan for the records work failed its third check. What next?'); if (!pwOn('hide')) h2.insertAdjacentHTML('afterend', '<p class="pw-code pw-sub">Stop card 5 · S-011</p>');
      var li = sh.querySelectorAll('.ck li'); if (li[0]) li[0].innerHTML = '<span class="m bad"></span><span>The plan failed three checks in a row<small>the stop rule: after three failed checks, work stops and asks you</small></span>';
      if (li[1]) li[1].innerHTML = '<span class="m"></span><span>Holds up 3 milestones: ' + PWMS.M6 + ', ' + PWMS.M7 + ', ' + PWMS.M8 + '<small>since 14 Nov, 9:42 am</small></span>'; }
    else if (pwOn('gloss')) h2.innerHTML = pwDot(h2.textContent);
    if (pwOn('why')) { var r0 = sh.querySelector('.row'); if (r0) r0.insertAdjacentHTML('afterend', '<p class="pw-why">' + esc(PWWHY['Stop card 5']) + '</p>'); }
    if (pwOn('roles') || pwOn('titles')) { [].slice.call(sh.querySelectorAll('p.ex')).forEach(function (p) {
        if (/Triage’s root cause/.test(p.textContent)) p.textContent = 'The cause, as traced after the stop: the spec writer was never given the two experiment files the reviewer kept asking it to update, so every check failed on a fix it could not make.';
        if (/Orchestrator applies/.test(p.textContent) && pwOn('roles')) p.textContent = 'Your answer is recorded in your words, and the scheduler (an automatic AI process) carries it out on its next run.'; }); }
    if (pwOn('roles')) [].slice.call(sh.querySelectorAll('.opts .opt')).forEach(function (o) {
      var b = o.querySelector('b'); if (!b) return; var key = b.textContent.trim(), p = PWANS[key]; if (!p) return;
      o.innerHTML = '<b>' + esc(p[0]) + '</b>' + esc(p[1]) + '<span class="pw-key">' + esc(key) + (o.classList.contains('rec') ? ' · recommended' : '') + '</span>'; });
    if (pwOn('hide')) [].slice.call(sh.querySelectorAll('.kn-rec, .recs, h3')).forEach(function (h) { if (/Records|Where/.test(h.textContent) || h.classList.contains('kn-rec')) h.style.display = 'none'; });
  }

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
    if (!pwOn('gloss')) return;
    [].slice.call(document.querySelectorAll('.capsule')).forEach(function (c) { if (c.querySelector('.pw-qbtn')) return;
      c.insertAdjacentHTML('afterbegin', '<button type="button" class="cbtn pw-qbtn" aria-label="What the words mean"><span aria-hidden="true">?</span></button>'); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') pwGlClose(); });
  window.addEventListener('click', function (e) {
    var t = e.target.closest('.pw-qbtn, .pw-dot'); if (!t) return;
    e.stopImmediatePropagation(); e.preventDefault(); pwGloss(t.dataset.pwgl || '');
  }, true);

  /* ---------- F: the switch in More ---------- */
  function pwMenu() {
    if (PW.o !== 'F') return; var cap = document.querySelector('.mcap:not([data-pw])'); if (!cap || document.querySelector('.pw-seg')) return; cap.dataset.pw = '1';
    var plain = PW.mode !== 'detailed';
    cap.insertAdjacentHTML('beforebegin', '<div class="mcap" data-pw="1">How the desk reads</div><div class="pw-seg" role="radiogroup" aria-label="How the desk reads">' +
      '<button type="button" role="radio" aria-checked="' + plain + '" data-pwmode="plain">Plain words</button><button type="button" role="radio" aria-checked="' + !plain + '" data-pwmode="detailed">Detailed</button></div><div class="msep"></div>');
  }
  window.addEventListener('click', function (e) {
    var t = e.target.closest('[data-pwmode]'); if (!t) return; e.stopImmediatePropagation(); e.preventDefault();
    var h = decodeURIComponent(location.hash.slice(1)).split('.').filter(function (x) { return x.indexOf('mode=') !== 0 && x.indexOf('at=') !== 0; });
    h.push('mode=' + t.dataset.pwmode, 'at=proj'); location.hash = h.join('.'); location.reload();
  }, true);

  /* ---------- applying, and where the phone starts ---------- */
  function pwApply() { if (!document.documentElement.classList.contains('pw-on') && PW.o !== 'F') return; pwHome(); pwRows(); pwSheet(); pwCaps(); pwMenu(); }
  var pwObs = new MutationObserver(function () { if (!pwObs.raf) pwObs.raf = requestAnimationFrame(function () { pwObs.raf = 0; pwApply(); }); });
  pwObs.observe(document.body, { childList: true, subtree: true });
  function pwTop(el) { if (!el) return; var band = document.getElementById('v13band'), b = band ? band.getBoundingClientRect().bottom : 0; window.scrollTo(0, Math.max(0, window.scrollY + el.getBoundingClientRect().top - b - 10)); }
  function pwFind(re) { var r = null; [].slice.call(document.querySelectorAll('#v13list .v13gr, #v13list .v13ev')).forEach(function (el) { if (!r && el.offsetParent && re.test(el.textContent)) r = el; }); return r; }
  function pwStart() {
    pwApply(); var at = PW.at, wait = REDUCED ? 300 : 1600;
    if (at === 'home') return;
    if (at === 'gloss') { setTimeout(function () { pwGloss(''); }, 400); return; }
    var go = document.querySelector('.pr-row[data-prk="0"] .pr-goto'); if (!go) return; go.click();
    setTimeout(function () {
      pwApply();
      if (at === 'sheet') { knOpen('s:Stop card 5'); return; }
      if (at === 'dsheet') { knOpen('d:New spec S-011, rounds reset'); return; }
      if (at === 'menu') { var m = [].slice.call(document.querySelectorAll('button[data-menu][aria-label="More"]')).filter(function (b) { return b.getBoundingClientRect().width > 0; })[0]; if (m) m.click(); return; }
      var h = document.querySelector('.r8-handle'); if (h) h.click();
      setTimeout(function () {
        if (at === 'dec') pwTop(pwFind(/2\.2\.2\.1\b/));
        else if (at === 'stop') { var s = document.querySelector('[data-kn-wait]'); pwTop(s && s.previousElementSibling ? s.previousElementSibling : s); }
        else pwTop(pwFind(/The records can carry the timeline/));
      }, REDUCED ? 60 : 500);
    }, wait);
  }
  setTimeout(pwStart, REDUCED ? 200 : 900);
