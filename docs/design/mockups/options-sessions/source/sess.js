  /* Options for the owner's round 7, answer 2: "some way to go back and forth between the desk and Claude code sessions ... projects
     get blurred or missed ... structure the desk with links back to the Claude sessions where the things happened". A layer over v26
     inside its script. SS = 'A' | 'B' | 'C'. Every link is real: the sessions and runs below are the ones named in the commits'
     Agent-Session trailers and the Chief of Staff's session lines (sessions/chief-of-staff/), matched to M6's and Design-5's events.
     Three kinds of place stand behind an event: a Claude session (the Chief of Staff's, which you can open and talk to), a pipeline
     run (a GitHub Actions run, where the pipeline's agents worked; a log, not a conversation), and a pull request (your merges).
     A: a small tag on each event's first line names where it happened; tap it for a bubble with that place's line and its link.
     B: an event's tag as in A, and the events one Claude session made sit together under a slim header row for that session.
     C: as A, and a Sessions button beside the map's chip opens a list of the Claude sessions behind this project, in order, each
        with the places on the desk it touched (tap one to go there) and a link to open it in Claude. */
  var SS_REPO = 'https://github.com/shumpmaster/Service-Desk';
  var SS_PLACES = {
    c1: { kind: 'claude', id: 'session_01QBwHGKbJwQiq23S3G2JJet', who: 'Chief of Staff', at: '13 Nov 23:20', end: 'no end recorded',
      doing: 'Step 2 of the owner’s ruling on the doubled spec id (the fix in the operating model, S-038, merged as 3.7.3 in #58); then P-005 stop card 4: the desk’s update to 3.7.3, the plan reviewer’s pack, and the card’s notes' },
    c2: { kind: 'claude', id: 'session_01QBwHGL7cLBqyQ4o1BxNuyh', who: 'Chief of Staff', at: '14 Nov 13:52', end: '15 Nov 19:55',
      doing: 'P-005: check #444 and the loop on stop card 4; follow S-011 through its plan reviews; file the rulings its round-2 review raises' }
  };
  function ssRun(id, at, what) { SS_PLACES['r' + id] = { kind: 'run', id: id, who: 'the pipeline', at: at, doing: what }; return 'r' + id; }
  function ssPR(n, what, by) { SS_PLACES['p' + n] = { kind: 'pr', id: n, who: 'you', doing: what, by: by }; return 'p' + n; }
  var SS_EV = {
    'Spec S-010|13 Nov 21:32': ssRun('43509671104', '13 Nov 21:27', 'The Orchestrator dispatched the spec writer: S-010’s first draft, with experiments E1 and E2'),
    'Spec S-010|13 Nov 21:44': ssRun('43512705665', '13 Nov 21:44', 'The plan reviewer’s first round on S-010'),
    'Spec S-010|13 Nov 23:45': ssRun('43527693393', '13 Nov 23:41', 'The spec writer revised S-010 after the failed review'),
    'Spec S-010|13 Nov 23:51': ssRun('43529705075', '13 Nov 23:52', 'The plan reviewer’s second round; the stop rule’s third round'),
    'Spec S-010|14 Nov 01:05': ssRun('43537907741', '14 Nov 01:05', 'The Orchestrator stopped S-010 and wrote stop card 4'),
    'Spec S-010|14 Nov 04:56': ssPR(443, 'Stop card 4’s notes and two questions', 'c1'),
    'Spec S-010|14 Nov 04:58': 'c1',
    'Spec S-010|14 Nov 12:04': ssPR(444, 'The answer, the number fix, the pack fix', 'c1'),
    'Spec S-011|14 Nov 12:07': ssRun('43592987967', '14 Nov 12:12', 'The Orchestrator recorded S-010 superseded and dispatched the spec writer on S-011'),
    'Spec S-011|14 Nov 12:16': 'r43592987967',
    'Spec S-011|14 Nov 12:29': ssRun('43594764477', '14 Nov 12:33', 'The plan reviewer’s first round on S-011'),
    'Spec S-011|14 Nov 12:37': ssRun('43595460260', '14 Nov 12:40', 'The spec writer revised S-011 after round 1'),
    'Spec S-011|14 Nov 14:46': ssPR(446, 'Three questions for you, from S-011’s round-2 review', 'c2'),
    'Spec S-011|14 Nov 15:14': ssRun('43609057956', '14 Nov 15:18', 'The plan reviewer’s second round on S-011'),
    'Spec S-011|14 Nov 15:23': ssRun('43610412101', '14 Nov 15:32', 'The spec writer revised S-011 again'),
    'Spec S-011|14 Nov 15:36': ssRun('43610713171', '14 Nov 15:38', 'The plan reviewer’s third round on S-011'),
    'Spec S-011|14 Nov 15:42': ssRun('43611248340', '14 Nov 15:42', 'The Orchestrator stopped S-011 and wrote stop card 5'),
    'E1 and E2|13 Nov 21:32': 'r43509671104',
    'PR #445|14 Nov 12:05': 'c1',
    'PR #445|14 Nov 12:12': ssPR(445, 'The first timeline mockup', 'c1'),
    'PR #445|14 Nov 13:54': 'p445',
    'Mockups v2 to v4|14 Nov 14:56': 'c1', 'Mockups v2 to v4|14 Nov 15:26': 'c1', 'Mockups v2 to v4|14 Nov 15:52': 'c1',
    'Mockups v2 to v4|14 Nov 16:00': 'c1', 'Mockups v2 to v4|14 Nov 16:14': 'c1'
  };
  function ssURL(p) { return p.kind === 'claude' ? 'https://claude.ai/code/' + p.id : p.kind === 'run' ? SS_REPO + '/actions/runs/' + p.id : SS_REPO + '/pull/' + p.id; }
  function ssTagWord(p) { return p.kind === 'claude' ? 'Claude' : p.kind === 'run' ? 'Run' : 'PR'; }
  function ssOpenWord(p) { return p.kind === 'claude' ? 'Open in Claude' : p.kind === 'run' ? 'Open the run' : 'Open PR #' + p.id; }
  var SS_ARROW = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M5 3h8v8M13 3 3 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  /* where on this page each place left events: "M6 · Spec S-010", in the list's own order */
  function ssWhere(key) {
    var out = [], seen = {}, plan = PLANS[state.proj] || [];
    plan.forEach(function (ph, b) { (ph.items || []).forEach(function (it, i) { (it.sprints || []).forEach(function (sp, g) { sp.events.forEach(function (x, e) {
      var k = SS_EV[sp.name + '|' + x.t]; if (k !== key && !(SS_PLACES[k] && SS_PLACES[k].by === key)) return;
      var w = (typeof duRe === 'function' ? duRe(msNo(b, i) + '.' + (g + 1)) : msNo(b, i) + '.' + (g + 1)) + ' ' + sp.name;
      if (!seen[w]) { seen[w] = { w: w, n: 0, go: b + ':' + i + ':' + g + ':' + e }; out.push(seen[w]); }
      seen[w].n++;
    }); }); }); });
    return out;
  }
  function ssBubble(key) {
    var p = SS_PLACES[key], kindW = p.kind === 'claude' ? 'A Claude session · ' + p.who : p.kind === 'run' ? 'A pipeline run on GitHub · a log, not a conversation' : 'Your pull request on GitHub';
    var when = p.kind === 'claude' ? 'Started ' + p.at + ' · ' + p.end : p.kind === 'run' ? 'Ran ' + p.at : '';
    var by = p.by ? '<div class="ss-by">Made in a Claude session: <button type="button" class="ss-q" data-ssk="' + p.by + '">Claude</button></div>' : '';
    var wh = ssWhere(key), also = wh.length > 1 || (wh[0] && wh[0].n > 1) ? '<div class="ss-also">On this page: ' + wh.map(function (x) { return esc(x.w) + (x.n > 1 ? ' (' + x.n + ')' : ''); }).join(', ') + '</div>' : '';
    return '<div class="ss-bub" role="note"><div class="ss-k">' + esc(kindW) + '</div><div class="ss-d">' + esc(p.doing) + '</div>' +
      (when ? '<div class="ss-w">' + esc(when) + '</div>' : '') + also + by +
      '<a class="ss-open" href="' + ssURL(p) + '" target="_blank" rel="noopener">' + ssOpenWord(p) + SS_ARROW + '</a></div>';
  }
  var _evRow13Ss = evRow13;
  evRow13 = function (b, i, g, e) {
    var h = _evRow13Ss(b, i, g, e), sp = PLANS[state.proj][b].items[i].sprints[g], x = sp.events[e], key = SS_EV[sp.name + '|' + x.t], p = SS_PLACES[key];
    if (!p) return h;
    /* earlier layers put their own classes before v13ev (the weight's wt-1 to wt-3), so find the row's class wherever v13ev sits in it */
    h = h.replace(/class="([^"]*\bv13ev\b)/, function (m, c) { return 'data-ss="' + key + '" data-ssgo="' + b + ':' + i + ':' + g + ':' + e + '" class="ss-' + p.kind + ' ' + c; });
    return h.replace('<span class="tm">', '<button type="button" class="ss-q ss-' + p.kind + '" data-ssk="' + key + '" aria-expanded="false">' + (p.kind === 'claude' ? '<i class="ss-dot"></i>' : '') + ssTagWord(p) + '</button><span class="tm">');
  };
  /* B: a slim header over the events one Claude session made, in the list's order */
  function ssGroup() {
    if (SS !== 'B') return;
    var L = document.getElementById('v13list'); if (!L) return;
    [].slice.call(L.querySelectorAll('.v13body')).forEach(function (body) {
      if (body.dataset.ssDone) return; body.dataset.ssDone = '1';
      var kids = [].slice.call(body.children), run = null;
      kids.forEach(function (c) {
        var k = c.dataset && c.dataset.ss, p = SS_PLACES[k];
        if (p && p.kind === 'claude') {
          if (!run || run.k !== k) { var hd = document.createElement('div'); hd.className = 'ss-head'; hd.innerHTML = '<i class="ss-dot"></i><span class="ss-ht"><b>Claude session</b> · ' + esc(p.who) + ' · from ' + esc(p.at) + '</span><a href="' + ssURL(p) + '" target="_blank" rel="noopener" aria-label="Open this session in Claude">Open' + SS_ARROW + '</a>'; body.insertBefore(hd, c); run = { k: k, hd: hd }; }
          c.classList.add('ss-in'); var t = c.querySelector('.l1 .ss-q'); if (t) t.remove();   /* the header says it once */
        } else run = null;
      });
    });
  }
  /* C: the Sessions button beside the map's chip, and its sheet */
  function ssButton() {
    if (SS !== 'C') return;
    var vp = document.querySelector('#v13band .v13vp'); if (!vp || vp.querySelector('.ss-sw')) return;
    vp.insertAdjacentHTML('beforeend', '<button type="button" class="ss-sw" data-sssheet><i class="ss-dot"></i>Sessions</button>');
  }
  function ssSheet() {
    var keys = Object.keys(SS_PLACES).filter(function (k) { return SS_PLACES[k].kind === 'claude'; });
    var rows = keys.map(function (k) {
      var p = SS_PLACES[k], wh = ssWhere(k);
      return '<li class="ss-srow"><div class="ss-k"><i class="ss-dot"></i>' + esc(p.who) + ' · started ' + esc(p.at) + ' · ' + esc(p.end) + '</div><div class="ss-d">' + esc(p.doing) + '</div>' +
        '<div class="ss-touch">' + wh.map(function (x) { return '<button type="button" class="ss-chip" data-ssjump="' + x.go + '">' + esc(x.w) + (x.n > 1 ? ' · ' + x.n : '') + '</button>'; }).join('') + '</div>' +
        '<a class="ss-open" href="' + ssURL(p) + '" target="_blank" rel="noopener">Open in Claude' + SS_ARROW + '</a></li>';
    }).join('');
    var d = document.createElement('div'); d.className = 'ss-scrim'; d.setAttribute('data-ssclose', '');
    d.innerHTML = '<div class="ss-sheet" role="dialog" aria-label="Sessions behind this project"><div class="ss-grab"></div><div class="ss-st"><b>Sessions behind this project</b><button type="button" class="ss-x" data-ssclose aria-label="Close">Done</button></div>' +
      '<p class="ss-note">The Claude sessions you can open and talk to, first to last. Tap a place to go to it on the desk. The pipeline’s own runs are on each event’s Run tag.</p><ol class="ss-list">' + rows + '</ol></div>';
    document.body.appendChild(d);
    if (!REDUCED) anim(d.firstChild, [{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  function ssJump(go) {
    var a = go.split(':').map(Number), it = PLANS[state.proj][a[0]].items[a[1]];
    state.open[fk('ph:' + a[0])] = true; state.open[fk('it:' + a[0] + ':' + a[1])] = true; state.open[fk('sp:' + a[0] + ':' + a[1] + ':' + a[2])] = true;
    var L = document.getElementById('v13list'), y = window.scrollY; L.innerHTML = list13(); window.scrollTo(0, y);
    /* the order layer sorts a fresh drawing just after this; find the row once it has */
    setTimeout(function () { var el = L.querySelector('[data-ssgo="' + go + '"]');
    if (el) { el.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' }); el.classList.add('ss-flash'); setTimeout(function () { el.classList.remove('ss-flash'); }, 1600); } }, 60);
    return it;
  }
  var _renderProjectSs = renderProject;
  var ssObs = new MutationObserver(function () { ssGroup(); });
  renderProject = function () { var r = _renderProjectSs.apply(this, arguments); ssGroup(); ssButton(); var L = document.getElementById('v13list'); if (L) { ssObs.disconnect(); ssObs.observe(L, { childList: true }); } return r; };
  if (typeof drawMap === 'function') { var _drawMapSs = drawMap; drawMap = function () { var r = _drawMapSs.apply(this, arguments); ssButton(); return r; }; }
  window.addEventListener('click', function (e) {
    var q = e.target.closest('[data-ssk]'), sh = e.target.closest('[data-sssheet]'), cl = e.target.closest('[data-ssclose]'), j = e.target.closest('[data-ssjump]');
    if (e.target.closest('.ss-open, .ss-head a')) { e.stopImmediatePropagation(); return; }
    if (j) { e.stopImmediatePropagation(); var s = document.querySelector('.ss-scrim'); if (s) s.remove(); ssJump(j.dataset.ssjump); return; }
    if (cl && (e.target === cl || e.target.closest('.ss-x'))) { e.stopImmediatePropagation(); cl.closest('.ss-scrim').remove(); return; }
    if (e.target.closest('.ss-sheet')) { e.stopImmediatePropagation(); return; }
    if (sh) { e.stopImmediatePropagation(); ssSheet(); return; }
    if (q) {
      e.stopImmediatePropagation();
      var row = q.closest('.v13ev'), tx = row && row.querySelector('.tx'), old = document.querySelector('.ss-bub'), same = old && old.dataset.for === q.dataset.ssk && old.parentNode === tx;
      if (old) { old.remove(); [].slice.call(document.querySelectorAll('.ss-q.on')).forEach(function (o) { o.classList.remove('on'); o.setAttribute('aria-expanded', 'false'); }); }
      if (same) return;
      if (q.closest('.ss-bub') && tx) { /* the "made in" tag inside a bubble swaps the bubble for that session */ }
      if (!tx) return;
      tx.insertAdjacentHTML('beforeend', ssBubble(q.dataset.ssk)); var nb = tx.querySelector('.ss-bub'); nb.dataset.for = q.dataset.ssk;
      var own = row.querySelector('.l1 .ss-q'); if (own) { own.classList.add('on'); own.setAttribute('aria-expanded', 'true'); }
      if (!REDUCED) anim(nb, [{ opacity: 0, transform: 'translateY(-4px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: 'ease-out' });
      return;
    }
    var ob = document.querySelector('.ss-bub'); if (ob && !e.target.closest('.ss-bub')) { ob.remove(); [].slice.call(document.querySelectorAll('.ss-q.on')).forEach(function (o) { o.classList.remove('on'); }); }
  }, true);
