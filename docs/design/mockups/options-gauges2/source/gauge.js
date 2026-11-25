  /* The owner's round 7, answers 25 and 26 (decisions/questions/P-005-design-round-7.md): "C: criteria + work" and "1: what
     happened". A milestone's gauge counts its criteria met: a project milestone, its spec's acceptance criteria passing their
     locked checks; a standard milestone, the checks that define it. A sprint's counts its events done of those it plans. A phase's
     counts its milestones reached. Red: stopped, or a review failed the third time. Yellow: waiting on the owner, or a review
     failed. Green: moving, or done. Grey: not started. A milestone and a phase take the worst colour of what they hold.
     The criteria counts are from the records where they exist (S-011 listed 38 acceptance criteria, none passing); the rest say
     what they would count. */
  var GA_CRIT = {
    'M6': [0, 38, 'criteria met (S-011)'],
    'Design-5': [0, 1, 'join-up review passed'],
    'Design-3': [0, 2, 'experiments answered'],
    'Design-6': [0, 1, 'plan review passed']
  };
  var GA_RANK = { '': 0, ok: 1, wait: 2, bad: 3 };
  function gaWorst(a) { return a.reduce(function (w, s) { return GA_RANK[s] > GA_RANK[w] ? s : w; }, ''); }
  spGauge = function (sp) {
    var evs = sp.events, n = evs.length, done = evs.filter(function (x) { return x.t !== 'planned'; }).length;
    var fails = evs.filter(function (x) { return x.k === 'review' && x.s === 'failed'; }).length;
    var stop = evs.some(function (x) { return x.k === 'stop'; }), wait = evs.some(function (x) { return x.s === 'you'; });
    var last = null; evs.forEach(function (x) { if (x.k === 'review' && x.t !== 'planned') last = x.s; });
    var st = !done ? '' : sp.st === 'done' ? 'ok' : (stop || fails >= 3) ? 'bad' : (wait || last === 'failed') ? 'wait' : 'ok';
    var pct = n ? Math.round(100 * done / n) : 0;
    return { st: st, pct: pct, ex: 0, note: sp.label + ' · ' + done + ' done' };   /* the row already says how many events it has */
  };
  msGauge = function (it) {
    if (it.now) return { st: '', pct: 0, ex: 0, note: '' };
    if (it.st === 'reached') return { st: 'ok', pct: 100, ex: 0, note: 'Reached' };
    var c = GA_CRIT[it.id], sts = (it.sprints || []).map(function (sp) { return spGauge(sp).st; }), st = gaWorst(sts);
    var pct = c ? Math.round(100 * c[0] / c[1]) : 0;
    var why = it.st === 'notreach' ? 'Not reached' : st === 'bad' ? 'Stopped' : st === 'wait' ? 'Waits on you' : it.st === 'progress' ? 'Under way' : it.next ? 'Next · not started' : (it.sprints ? 'Under way' : 'Not started');
    return { st: st, pct: pct, ex: 0, note: why + ' · ' + (c ? c[0] + ' of ' + c[1] + ' ' + c[2] : 'criteria not on record') };
  };
  phGauge = function (b) {
    var blk = PLANS[state.proj][b], its = blk.items.filter(function (x) { return !x.now; }), n = its.length;
    var r = its.filter(function (x) { return x.st === 'reached'; }).length;
    var st = blk.st === 'done' ? 'ok' : gaWorst(its.map(function (it) { return msGauge(it).st; }));
    if (blk.st === 'current' && !st) st = 'ok';
    return { st: st, pct: n ? Math.round(100 * r / n) : 0, r: r, n: n };
  };
