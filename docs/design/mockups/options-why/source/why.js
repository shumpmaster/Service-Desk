  /* Options for the owner's round 4, answer 17 (second half): "the one thing I always struggle understanding is how actions task
     events feed into one another. So when I'm perusing the plan I will want to see the context behind how or why things are
     happening the way they are?" A layer over v18 inside its script. WHY_OPT = 'A' | 'B' | 'C'.
     The records do not say why an event happened; every reason here is an example, written from the records by the Chief of Staff.
     A: a "Because" line under each event, naming the events that led to it, tappable.
     B: tap an event for "Why this happened": the chain back from it to the milestone's goal, one plain sentence per link.
     C: a plain sentence between events, saying how the one before led to this one; the agent's plan stays as the detail. */
  var WHY = {};
  WHY[S11 + 'New spec S-011, rounds reset'] = 'You said to write a new spec after stop card 4, so a fresh spec began with the review rounds back at zero.';
  WHY[S11 + 'First draft'] = 'A new spec starts as a draft. The spec writer wrote it from your six answers.';
  WHY[S11 + 'Plan review failed, round 1'] = 'Every draft goes to plan review before it can freeze. The reviewer found the experiments still pointed at the old spec.';
  WHY[S11 + 'Spec revised'] = 'The spec writer fixed what round 1 found.';
  WHY[S11 + 'Merged PR #446: three questions for you'] = 'Round 1 raised three things only you can decide, so they went to you as questions.';
  WHY[S11 + 'Plan review failed, round 2'] = 'The revised spec went back to review. Two wordings still clashed.';
  WHY[S11 + 'Spec revised again'] = 'The spec writer worked through six actions to answer round 2; one stayed blocked.';
  WHY[S11 + 'Plan review failed, round 3'] = 'Review again. The experiments still hadn’t moved, because the spec writer was never given them.';
  WHY[S11 + 'Stop card 5'] = 'Three failed reviews trip the stop rule, so the orchestrator stopped and asked you what next.';
  var GOAL = 'M6 · The records can carry the timeline: S-011 is the spec that says how.';
  function evAt(k) { var L = locate(k); if (!L) return null; var sp = PLANS[state.proj][L[0]].items[L[1]].sprints[L[2]]; return { sp: sp, x: sp.events[L[3]], L: L }; }
  function causes(k) { return (DEP[k] || []).filter(function (d) { return d[0] === 'ok' && d[2] && d[2] !== 'act'; }).map(function (d) { return d[2]; }); }
  function chip(k) { var o = evAt(k); return o ? '<button type="button" class="wy-chip" data-nd-go="' + esc(k) + '"><span class="v13ico wy-ico">' + (ICONS[o.x.k] || '') + '</span><span>' + esc(nmOf(k)) + '</span></button>' : ''; }

  var _evRow13W = evRow13;
  evRow13 = function (b, i, g, e) {
    var sp = PLANS[state.proj][b].items[i].sprints[g], x = sp.events[e], k = sp.name + '|' + x.title, h = _evRow13W(b, i, g, e);
    if (x.t === 'planned') return h;
    if (WHY_OPT === 'A') {
      var cs = causes(k); if (!cs.length) return h;
      var j = h.indexOf('</div></div>'); return h.slice(0, j) + '<div class="wy-line"><span class="wy-lb">Because</span>' + cs.map(chip).join('') + '</div>' + h.slice(j);
    }
    if (WHY_OPT === 'B') {
      if (!WHY[k]) return h;
      return h.replace('<div class="v13ev nd-ev"', '<div class="v13ev nd-ev wy-tap" role="button" tabindex="0" aria-label="Why ' + esc(x.title) + ' happened"').replace('<span class="tm">', '<span class="wy-q">Why</span><span class="tm">');
    }
    if (!WHY[k]) return h;   /* C */
    return h + '<div class="wy-story"><span class="wy-arr">' + V12I.arrow + '</span><p><b>Why:</b> ' + esc(WHY[k]) + '</p></div>';
  };

  /* B: the chain back to the goal, in a card that rises from the foot */
  function chainHTML(k) {
    var chain = [], cur = k, guard = 0;
    while (cur && guard++ < 5) { chain.push(cur); var c = causes(cur); cur = c.length ? c[0] : null; }
    var rows = chain.map(function (kk, n) {
      var o = evAt(kk), s = evState(o.sp, o.x);
      return '<li><span class="v13ico">' + (ICONS[o.x.k] || '') + mark(s[0]) + '</span><div class="tx"><div class="l1"><b>' + esc(plain(o.x)) + '</b>' + tag(s[0], s[1]) + '</div><div class="l2">' + esc(o.x.title) + '</div>' +
        (WHY[kk] ? '<div class="wy-why">' + esc(WHY[kk]) + '</div>' : '') + '</div></li>';
    }).reverse();
    var un = UNL[k] || [];
    return '<div id="wy-sheet" role="dialog" aria-label="Why this happened"><div class="wy-hd"><b>Why this happened</b><button type="button" class="nd-x" data-wy-x aria-label="Close">' + V13I.x + '</button></div>' +
      '<div class="wy-goal">' + esc(GOAL) + '</div><ol class="wy-chain">' + rows.join('') + '</ol>' +
      (un.length ? '<div class="wy-led"><span>Led to</span>' + un.map(chip).join('') + '</div>' : '') +
      '<div class="nd-ex">Reasons are an example, written from the records: no record says yet why an event happened.</div></div>';
  }
  function closeSheet() { var s = document.getElementById('wy-sheet'); if (s) s.remove(); }
  document.addEventListener('click', function (e) {
    if (!v13on()) return;
    if (e.target.closest('[data-wy-x]')) { closeSheet(); return; }
    if (WHY_OPT === 'B') {
      var go = e.target.closest('#wy-sheet [data-nd-go]'); if (go) { closeSheet(); return; }
      var t = e.target.closest('.wy-tap'); if (!t || e.target.closest('[data-nd-go]')) return;
      e.stopImmediatePropagation(); closeSheet();
      document.body.insertAdjacentHTML('beforeend', chainHTML(t.dataset.ndk));
      var sh = document.getElementById('wy-sheet'); if (!REDUCED) anim(sh, [{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: EASE });
    }
  }, true);
  var _renderProjectW = renderProject;
  renderProject = function () { closeSheet(); return _renderProjectW.apply(this, arguments); };
