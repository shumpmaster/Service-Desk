  /* Options for the owner's comment on v21 (round 6, answer 3), on S-011's events: "This entire flow here is solid, but in its current
     visual format every single event has the same weight and means nothing unique, can we change that". A layer over v23 inside its
     script. WT = 'A' | 'B' | 'C'. The order and the tree stay; each event gets a weight from what it is:
       1, a turning point: a stop, a decision, a gate, a merge to main, or anything waiting on you;
       2, a check: a review or a check, passed or failed;
       3, routine: a commit (a draft or a revision) and other agent housekeeping.
     A: three sizes. Turning points larger, routine one quiet line, checks as they are.
     B: as A, and the checks and routine between two turning points fold into one quiet line that says how many, and how many
        reviews failed, in the soft red; it opens in place.
     C: turning points sit on a card; checks and routine are compact lines. */
  var WT_HEAVY = { stop: 1, decision: 1, gate: 1, merge: 1 }, WT_MID = { review: 1, check: 1 };
  function wtOf(sp, x) {
    var s = evState(sp, x);
    if (WT_HEAVY[x.k] || s[0] === 'wait') return 1;
    if (WT_MID[x.k]) return 2;
    return x.k === 'commit' ? 3 : 2;
  }
  var _evRow13Wt = evRow13;
  evRow13 = function (b, i, g, e) {
    var sp = PLANS[state.proj][b].items[i].sprints[g], x = sp.events[e], w = wtOf(sp, x), h = _evRow13Wt(b, i, g, e);
    return h.replace('class="v13ev', 'class="wt-' + w + ' wt-' + WT + ' v13ev');
  };
  /* B: fold what lies between two turning points */
  function wtFold() {
    if (WT !== 'B') return;
    var L = document.getElementById('v13list'); if (!L) return;
    var isLow = function (n) { return n && n.classList && n.classList.contains('v13ev') && (n.classList.contains('wt-2') || n.classList.contains('wt-3')) && !n.querySelector('.v13ico.plan'); };
    [].slice.call(L.querySelectorAll('.v13ev.wt-2, .v13ev.wt-3')).forEach(function (ev) {
      if (ev.dataset.wtDone || !isLow(ev)) return;
      var run = [ev], n = ev.nextElementSibling;
      while (isLow(n)) { run.push(n); n = n.nextElementSibling; }
      if (run.length < 2) return;
      var bad = run.filter(function (r) { return r.querySelector('.l1 > .v13tag.bad'); }).length;
      run.forEach(function (r) { r.dataset.wtDone = '1'; r.classList.add('wt-hid'); });
      var f = document.createElement('button'); f.type = 'button'; f.className = 'wt-fold'; f.setAttribute('aria-expanded', 'false');
      f.innerHTML = '<span class="wt-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>' + run.length + ' steps between</span>' +
        (bad ? '<span class="v13tag bad">' + bad + (bad === 1 ? ' review failed' : ' reviews failed') + '</span>' : '') + (V12I.caret || '');
      f.addEventListener('click', function () { var o = f.getAttribute('aria-expanded') === 'true'; f.setAttribute('aria-expanded', String(!o)); run.forEach(function (r) { r.classList.toggle('wt-hid', o); }); });
      ev.parentNode.insertBefore(f, ev);
    });
  }
  var _renderProjectWt = renderProject;
  renderProject = function () { var r = _renderProjectWt.apply(this, arguments); wtFold(); return r; };
