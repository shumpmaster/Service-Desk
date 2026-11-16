  /* Round 5, answer 1: "option C is close, we just need to show it in a slightly different more consistent and easily
     graspable manner." Three forms of C, each built from parts the timeline already uses. NEEDS_OPT = 'C1' | 'C2' | 'C3'.
     C1: what it needs, drawn as small event rows (icon, corner mark, the same state tag), hanging from the event.
     C2: what it needs, as a checklist in the same card as the agent's plan.
     C3: one line saying what it waits on; tap it to open the C1 rows. */
  var STW = { ok: ['ok', 'Done'], wait: ['wait', 'Waiting on you'], bad: ['bad', 'Blocked'], pend: ['', 'Planned'] };
  function tgt(d) {
    if (d[2] === 'act') return { k: 'step', word: 'Step 2.7.2.5', title: 'Move the experiments to the new spec' };
    var L = d[2] && locate(d[2]);
    if (!L) return { k: 'decision', word: 'Decision', title: d[1] };
    var x = PLANS[state.proj][L[0]].items[L[1]].sprints[L[2]].events[L[3]];
    return { k: x.k, word: plain(x), title: x.title };
  }
  function ico(k, st) { return '<span class="v13ico nd-sm">' + (k === 'step' ? V13I.step : (ICONS[k] || '')) + mark(st) + '</span>'; }
  function reqRow(d) {
    var t = tgt(d), s = STW[d[0]], L = d[2] && d[2] !== 'act' && locate(d[2]);
    if (L) { var sp0 = PLANS[state.proj][L[0]].items[L[1]].sprints[L[2]]; s = evState(sp0, sp0.events[L[3]]); }   /* the same tag the event wears */
    return '<button type="button" class="nd1-r"' + (d[2] ? ' data-nd-go="' + esc(d[2]) + '"' : '') + '>' + ico(t.k, s[0]) +
      '<span class="tx"><span class="l1"><b>' + esc(t.word) + '</b>' + tag(s[0], s[1]) + '</span><span class="l2">' + esc(d[0] === 'wait' && !d[2] ? d[1] : t.title) + '</span></span></button>';
  }
  function unlRow(k) {
    var L = locate(k), sp = PLANS[state.proj][L[0]].items[L[1]].sprints[L[2]], x = sp.events[L[3]], s = evState(sp, x);
    return '<button type="button" class="nd1-r" data-nd-go="' + esc(k) + '">' + ico(x.k, s[0]) + '<span class="tx"><span class="l1"><b>' + esc(plain(x)) + '</b>' + tag(s[0], s[1]) + '</span><span class="l2">' + esc(x.title) + '</span></span></button>';
  }
  function c1(deps, un, miss) {
    var met = deps.length - miss.length;
    return '<div class="nd1"><div class="nd1-hd">Needs first <span>' + met + ' of ' + deps.length + ' done</span></div>' + deps.map(reqRow).join('') +
      (un.length ? '<div class="nd1-hd">Then unlocks</div>' + un.map(unlRow).join('') : '') + '</div>';
  }
  function c2(deps, un, miss) {
    var met = deps.length - miss.length;
    var li = deps.map(function (d) {
      var mk = d[0] === 'ok' ? V12I.check : d[0] === 'bad' ? V12I.warn : d[0] === 'wait' ? V13I.wait : '';
      var cls = d[0] === 'ok' ? 'ok' : d[0] === 'bad' ? 'blocked' : d[0] === 'wait' ? 'ndwait' : 'ndpend';
      var why = d[0] === 'wait' ? 'Waiting on you' : d[0] === 'bad' ? 'Blocked: they still point at the old spec' : d[0] === 'pend' ? 'Planned' : 'Done';
      return '<li class="' + cls + '"' + (d[2] ? ' data-nd-go="' + esc(d[2]) + '"' : '') + '><span class="mk ' + cls + '">' + mk + '</span><div class="ti">' + esc(d[1]) + '</div><div class="why">' + why + '</div></li>';
    }).join('');
    return '<div class="v12step open v13acts nd2"><div class="nd2-hd">Needs first · ' + met + ' of ' + deps.length + ' done</div><ol class="v12plan">' + li + '</ol>' +
      (un.length ? '<div class="nd2-then">Then unlocks: ' + un.map(function (k) { return '<button type="button" class="linkbtn" data-nd-go="' + esc(k) + '">' + esc(nmOf(k)) + '</button>'; }).join(', ') + '</div>' : '') + '</div>';
  }
  function c3(key, deps, un, miss) {
    var w = miss.filter(function (d) { return d[0] === 'wait'; }).length, bl = miss.filter(function (d) { return d[0] === 'bad'; }).length, nt = miss.length - w - bl;
    var parts = []; if (w) parts.push(w + ' on you'); if (bl) parts.push(bl + ' blocked'); if (nt) parts.push(nt + ' planned');
    var st = bl ? 'bad' : w ? 'wait' : '', open = !!state.open[fk('nd:' + key)];
    return '<div class="nd3' + (open ? ' open' : '') + '"><button type="button" class="nd3-hd" data-nd3="' + esc(key) + '" aria-expanded="' + open + '">' + V13I.link +
      '<span>Needs ' + deps.length + ' first: ' + parts.join(', ') + '</span>' + (st ? '<i class="nd3-dot ' + st + '"></i>' : '') + V12I.caret + '</button>' + (open ? c1(deps, un, miss) : '') + '</div>';
  }
  evRow13 = function (b, i, g, e) {
    var sp = PLANS[state.proj][b].items[i].sprints[g], x = sp.events[e], k = sp.name + '|' + x.title, deps = DEP[k] || [], un = UNL[k] || [], miss = unmet(k);
    var h = _evRow13N(b, i, g, e).replace('<div class="v13ev"', '<div class="v13ev nd-ev" data-ndk="' + esc(k) + '"');
    if (!miss.length) return h;
    return h + (NEEDS_OPT === 'C1' ? c1(deps, un, miss) : NEEDS_OPT === 'C2' ? c2(deps, un, miss) : c3(k, deps, un, miss));
  };
  document.addEventListener('click', function (e) {
    if (!v13on()) return;
    var t = e.target.closest('[data-nd3]'); if (!t) return;
    e.stopImmediatePropagation();
    var key = 'nd:' + t.dataset.nd3; state.open[fk(key)] = !state.open[fk(key)];
    var fresh = relist('[data-nd3="' + t.dataset.nd3.replace(/"/g, '\\"') + '"]');
    var body = fresh && fresh.parentNode.querySelector('.nd1');
    if (body) anim(body, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 240 });
  }, true);
