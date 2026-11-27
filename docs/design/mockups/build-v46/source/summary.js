  /* ================= v46: one line at the head of the map card, opening "About this project" (round 8, answers 31 and 32,
     option C of options-r8-summary/; decisions/questions/P-005-design-round-8.md). Per project: its purpose, a one-line "where it stands",
     a snapshot of the bigger picture, its phases at a glance and what waits on you. Every word is an example, written from the page and the
     records at the mockup's moment (14 November): no record holds a project's purpose or a snapshot yet (records request item 17). ================= */
  var SM46 = {
    tl: { name: 'The timeline', dot: 'bad', purpose: 'One timeline of everything the AI team does, on your phone.',
      line: 'Design · the records plan stopped · your call', short: 'Design · plan stopped · your call',
      snap: ['It is in Design, the second of four phases: 1 of its 7 milestones is reached.',
             'The AI team is writing the plan for changing the records, so the desk can draw every event from what really happened (the second plan, S-011).',
             'That plan failed its third check, so the work has stopped and waits on your decision.',
             'Once a plan passes, the Build gate is yours; then the timeline itself is built, and after it, what needs you reaching your phone first.'],
      phases: [['ok', 'Discovery', 'Done 13 Nov · 3 of 8 milestones reached'], ['bad', 'Design', 'Now · 1 of 7 reached · stopped, your decision'],
               ['', 'Build', 'Planned · 9 milestones'], ['', 'Launch', 'Planned · it goes live']],
      wait: ['Work stopped: the plan failed its third check', 'Holds up the records, one timeline, what needs you first · waiting 1 h 43 min'], open: 's:Stop card 5' },
    wd: { name: 'Home-screen widget', dot: 'wait', purpose: 'A widget for your phone’s home screen.',
      line: 'Discovery · the brief failed · your call', short: 'Discovery · brief failed · your call',
      snap: ['It is in Discovery, the first of four phases; its milestones are written once Discovery is approved.',
             'Its brief, the short case for building it, was checked for readiness on 4 November and failed.',
             'So the work has stopped and waits on your decision: rework and resubmit the brief, or stop the project.',
             'Once the brief passes, the Discovery gate is yours; then Design decides exactly what will be built.'],
      phases: [['wait', 'Discovery', 'Now · the brief failed its readiness check · waiting on you'], ['', 'Design', 'Planned'],
               ['', 'Build', 'Planned'], ['', 'Launch', 'Planned']],
      wait: ['Your call: resubmit the widget’s brief, or stop?', 'Holds up the Discovery phase · waiting 9 days'], open: 's:Readiness card' }
  };
  var SM46BY = 'An example. In the desk this would be written from the records: the purpose once, when the project starts; the one line by the pipeline at each change of state; the snapshot by the Chief of Staff at each session’s end and by the pipeline at each gate or stop.';
  function sm46Cur() { return (typeof state !== 'undefined' && state.proj && SM46[state.proj]) ? SM46[state.proj] : null; }
  function sm46Sheet() {
    var P = sm46Cur(); if (!P) return; if (typeof knClose === 'function') knClose();
    var ex = '<span class="sm-ex">Example</span>';
    var h = '<div class="kd">About this project</div><h2>' + esc(P.name) + '</h2><p class="sm-pur">' + esc(P.purpose) + ' ' + ex + '</p>' +
      '<h3>Where it stands</h3>' + P.snap.map(function (s) { return '<p>' + esc(s) + '</p>'; }).join('') +
      '<h3>Its phases</h3><ul class="ck">' + P.phases.map(function (p) { return '<li><span class="m ' + p[0] + '"></span><span>' + esc(p[1]) + '<small>' + esc(p[2]) + '</small></span></li>'; }).join('') + '</ul>' +
      '<h3>What waits on you</h3><ul class="ck"><li><span class="m wait"></span><span>' + esc(P.wait[0]) + '<small>' + esc(P.wait[1]) + '</small></span></li></ul>' +
      '<div class="sm-acts"><button type="button" class="sm-go" data-sm46="go">Choose what happens next</button></div>' +
      '<p class="ex">' + esc(SM46BY) + '</p>';
    var scrim = document.createElement('div'), sheet = document.createElement('div');
    scrim.className = 'kn-scrim'; sheet.className = 'kn-sheet sm-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'About this project');
    sheet.innerHTML = '<div class="grab" aria-hidden="true"></div><button type="button" class="x" aria-label="Close"><span>' + KNI.x + '</span></button>' + h;
    document.body.appendChild(scrim); document.body.appendChild(sheet); knSheetEl = { scrim: scrim, sheet: sheet };
    scrim.addEventListener('click', knClose); sheet.querySelector('.x').addEventListener('click', knClose);
    var op = P.open; sheet.querySelector('[data-sm46="go"]').addEventListener('click', function () { knOpen(op); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { scrim.classList.add('on'); sheet.classList.add('on'); }); });
  }
  function sm46Line() {
    var P = sm46Cur(), vp = document.querySelector('#v13band .v13vp');
    document.documentElement.classList.toggle('sm46-on', !!(P && vp));
    if (!P || !vp) return;
    var b = vp.querySelector('.sm-line');
    if (b && b.dataset.p === state.proj) return;
    if (b) b.remove();
    b = document.createElement('button'); b.type = 'button'; b.className = 'sm-line'; b.dataset.p = state.proj;
    b.setAttribute('aria-label', 'About this project: ' + P.line + '. Open the summary');
    b.innerHTML = '<span class="sm-dot ' + P.dot + '"></span><span class="sm-lt"><span class="sm-long">' + esc(P.line) + '</span><span class="sm-short">' + esc(P.short) + '</span></span><span class="sm-chev" aria-hidden="true">›</span>';
    vp.insertBefore(b, vp.firstChild);
    b.addEventListener('click', function (e) { e.stopPropagation(); sm46Sheet(); });
  }
  setInterval(sm46Line, 300);
  window.__sm46 = { sheet: sm46Sheet, line: sm46Line };
