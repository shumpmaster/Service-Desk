  /* Round 5, answer 2: "I think we mix c1 and c2. I like the look of c1, I like the checklist feel of c2. ... The plan should
     naturally have crossover with what we are working on here right?" NEEDS_OPT = 'M'.
     C1's rows (the small icon, the kind, the same tag the event wears, the title), hung from the event by a thin line,
     with C2's checklist: a check column like the plan's, and "0 of 3 done". The crossover both ways: a requirement that
     is an action of a plan looks like that action (its number), and that action in the plan says which event needs it. */
  function ckMark(st) {
    var g = st === 'ok' ? V12I.check : st === 'bad' ? V12I.warn : st === 'wait' ? V13I.wait : '';
    return '<span class="mk ' + (st === 'bad' ? 'blocked' : st === 'wait' ? 'ndwait' : st === 'ok' ? 'ok' : 'next') + '">' + g + '</span>';
  }
  function mRow(d, unlockKey) {
    var t, s, go;
    if (unlockKey) { var L = locate(unlockKey), sp = PLANS[state.proj][L[0]].items[L[1]].sprints[L[2]], x = sp.events[L[3]]; t = { k: x.k, word: plain(x), title: x.title }; s = evState(sp, x); go = unlockKey; }
    else {
      t = tgt(d); s = STW[d[0]]; go = d[2];
      var L2 = d[2] && d[2] !== 'act' && locate(d[2]);
      if (L2) { var sp2 = PLANS[state.proj][L2[0]].items[L2[1]].sprints[L2[2]]; s = evState(sp2, sp2.events[L2[3]]); }
      if (d[2] === 'act') t.word = 'Action 2.7.2.5.5';
    }
    var st = unlockKey ? '' : d[0];
    return '<li class="ndm-r' + (unlockKey ? ' un' : '') + '"' + (go ? ' data-nd-go="' + esc(go) + '" tabindex="0" role="button"' : '') + '>' + (unlockKey ? '<span class="mk ndarr">' + V12I.arrow + '</span>' : ckMark(st)) +
      '<span class="v13ico nd-sm">' + (t.k === 'step' ? V13I.step : (ICONS[t.k] || '')) + '</span>' +
      '<span class="tx"><span class="l1"><b>' + esc(t.word) + '</b>' + tag(s[0], s[1]) + '</span><span class="l2">' + esc(d && d[0] === 'wait' && !d[2] ? d[1] : t.title) + '</span></span></li>';
  }
  function cm(deps, un, miss) {
    var met = deps.length - miss.length;
    return '<div class="ndm"><div class="nd1-hd">Needs first <span>' + met + ' of ' + deps.length + ' done</span></div><ol class="ndm-l">' + deps.map(function (d) { return mRow(d); }).join('') + '</ol>' +
      (un.length ? '<div class="nd1-hd">Then unlocks</div><ol class="ndm-l">' + un.map(function (k) { return mRow(null, k); }).join('') + '</ol>' : '') + '</div>';
  }
  evRow13 = function (b, i, g, e) {
    var sp = PLANS[state.proj][b].items[i].sprints[g], x = sp.events[e], k = sp.name + '|' + x.title, deps = DEP[k] || [], un = UNL[k] || [], miss = unmet(k);
    var h = _evRow13N(b, i, g, e).replace('<div class="v13ev"', '<div class="v13ev nd-ev" data-ndk="' + esc(k) + '"');
    return miss.length ? h + cm(deps, un, miss) : h;
  };
  /* the crossover from the plan's side: the action an event needs says so, and takes you to it */
  var NEEDED_BY = { 'Move the experiments to the new spec': S11 + 'Spec revised, round 4' };
  var _stepRow13N = stepRow13;
  stepRow13 = function (no, st, key) {
    var h = _stepRow13N(no, st, key);
    Object.keys(NEEDED_BY).forEach(function (t) {
      var a = esc(t), j = h.indexOf(a); if (j < 0) return;
      var end = h.indexOf('</li>', j);
      h = h.slice(0, end) + '<button type="button" class="nd-by" data-nd-go="' + esc(NEEDED_BY[t]) + '">' + V12I.arrow + '<span>Needed by <b>' + esc(nmOf(NEEDED_BY[t])) + '</b></span></button>' + h.slice(end);
    });
    return h;
  };
  document.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.ndm-r[data-nd-go]')) { e.preventDefault(); e.target.click(); } });
