  /* Options for the owner's round 4, answer 17 (first half): "some events ultimately are requirements for other events.
     I want to see that somehow." A layer over v16 inside its script. NEEDS_OPT = 'A' | 'B' | 'C'.
     The records do not say which event needs which, so every requirement here is an example, marked so; so are the
     three planned events added to S-011, which show requirements not yet met.
     A: a "Needs" line under every event, and an "Unlocks" line where something later needs it.
     B: trace on tap: an unmet count on the event; tap it and what it needs and what it unlocks light up, joined by a line.
     C: "Before this can happen": only events with something unmet get a small checklist under them. */
  (function () {
    var M6 = null; (PLANS.tl || []).forEach(function (blk) { (blk.items || []).forEach(function (it) { if (it.id === 'M6') M6 = it; }); });
    var s11 = M6 && M6.sprints.filter(function (s) { return s.name === 'Spec S-011'; })[0];
    if (s11) s11.events.push(
      ev('planned', 'commit', 'idle', 'spec writer', 'Spec revised, round 4', 'planned · an example'),
      ev('planned', 'review', 'idle', 'reviewer (plan)', 'Plan review, round 4', 'planned · an example'),
      ev('planned', 'decision', 'idle', 'you', 'S-011 frozen', 'planned · an example'));
  })();
  var S11 = 'Spec S-011|', S10 = 'Spec S-010|', E12 = 'E1 and E2|';
  /* what each event needs: [state, words, the event it points at]. ok met, wait on you, bad blocked, pend not yet */
  var DEP = {};
  DEP[S11 + 'S-011 frozen'] = [['pend', 'Plan review, round 4 passes', S11 + 'Plan review, round 4'], ['wait', 'Your approval to freeze', null]];
  DEP[S11 + 'Plan review, round 4'] = [['pend', 'Spec revised, round 4', S11 + 'Spec revised, round 4']];
  DEP[S11 + 'Spec revised, round 4'] = [['wait', 'Your answer to stop card 5', S11 + 'Stop card 5'], ['wait', 'Your answers to PR #446’s three questions', S11 + 'Merged PR #446: three questions for you'], ['bad', 'The experiments moved to S-011', 'act']];
  DEP[S11 + 'Stop card 5'] = [['ok', 'Plan review failed, round 3', S11 + 'Plan review failed, round 3']];
  DEP[S11 + 'Plan review failed, round 3'] = [['ok', 'Spec revised again', S11 + 'Spec revised again']];
  DEP[S11 + 'Spec revised again'] = [['ok', 'Plan review failed, round 2', S11 + 'Plan review failed, round 2']];
  DEP[S11 + 'Plan review failed, round 2'] = [['ok', 'Spec revised', S11 + 'Spec revised']];
  DEP[S11 + 'Merged PR #446: three questions for you'] = [['ok', 'Plan review failed, round 1', S11 + 'Plan review failed, round 1']];
  DEP[S11 + 'Spec revised'] = [['ok', 'Plan review failed, round 1', S11 + 'Plan review failed, round 1']];
  DEP[S11 + 'Plan review failed, round 1'] = [['ok', 'First draft', S11 + 'First draft']];
  DEP[S11 + 'First draft'] = [['ok', 'New spec S-011, rounds reset', S11 + 'New spec S-011, rounds reset']];
  DEP[S11 + 'New spec S-011, rounds reset'] = [['ok', 'You said: write a new spec', S10 + 'You said: write a new spec'], ['ok', 'Merged PR #444', S10 + 'Merged PR #444: the answer, the number fix, the pack fix']];
  DEP[E12 + 'Run E1: how long your steps wait today'] = [['pend', 'S-011 frozen', S11 + 'S-011 frozen']];
  DEP[E12 + 'Run E2: can the records carry the timeline'] = [['pend', 'S-011 frozen', S11 + 'S-011 frozen']];
  var SHORT = {}; SHORT[E12 + 'Run E1: how long your steps wait today'] = 'Run E1'; SHORT[E12 + 'Run E2: can the records carry the timeline'] = 'Run E2';
  SHORT[S11 + 'Merged PR #446: three questions for you'] = 'PR #446’s questions'; SHORT[S10 + 'Merged PR #444: the answer, the number fix, the pack fix'] = 'Merged PR #444';
  var UNL = {};
  Object.keys(DEP).forEach(function (k) { DEP[k].forEach(function (d) { if (d[2] && d[2] !== 'act') (UNL[d[2]] = UNL[d[2]] || []).push(k); }); });
  function nmOf(k) { return SHORT[k] || k.split('|')[1]; }
  function unmet(k) { return (DEP[k] || []).filter(function (d) { return d[0] !== 'ok'; }); }
  var NDI = { ok: V13I.check, wait: V13I.wait, bad: V13I.x, pend: '' };
  function ndMark(st) { return '<span class="nd-mk ' + st + '">' + NDI[st] + '</span>'; }
  function ndItem(d) { return '<button type="button" class="nd-i ' + d[0] + '"' + (d[2] ? ' data-nd-go="' + esc(d[2]) + '"' : '') + '>' + ndMark(d[0]) + '<span>' + esc(d[1]) + '</span></button>'; }
  function unlItem(k) { return '<button type="button" class="nd-i un" data-nd-go="' + esc(k) + '"><span class="nd-arr">' + V12I.arrow + '</span><span>' + esc(nmOf(k)) + '</span></button>'; }
  function addAfterL3(h, extra) { var j = h.lastIndexOf('</div></div>'); return h.slice(0, j) + extra + h.slice(j); }

  var _evRow13N = evRow13;
  evRow13 = function (b, i, g, e) {
    var sp = PLANS[state.proj][b].items[i].sprints[g], x = sp.events[e], k = sp.name + '|' + x.title, deps = DEP[k] || [], un = UNL[k] || [], miss = unmet(k);
    var h = _evRow13N(b, i, g, e).replace('<div class="v13ev"', '<div class="v13ev nd-ev" data-ndk="' + esc(k) + '"');
    if (NEEDS_OPT === 'A') {
      var add = '';
      if (deps.length) add += '<div class="nd-line"><span class="nd-lb">Needs</span>' + deps.map(ndItem).join('') + '</div>';
      if (un.length) add += '<div class="nd-line"><span class="nd-lb">Unlocks</span>' + un.map(unlItem).join('') + '</div>';
      return add ? addAfterL3(h, add) : h;
    }
    if (NEEDS_OPT === 'B') {
      if (!deps.length && !un.length) return h;
      var cnt = miss.length ? '<span class="nd-cnt' + (miss.some(function (d) { return d[0] === 'bad'; }) ? ' bad' : miss.some(function (d) { return d[0] === 'wait'; }) ? ' wait' : '') + '">' + V13I.link + 'Needs ' + miss.length + '</span>' : '<span class="nd-cnt quiet">' + V13I.link + '</span>';
      return h.replace('<span class="tm">', cnt + '<span class="tm">').replace('<div class="v13ev nd-ev"', '<div class="v13ev nd-ev nd-tap" role="button" tabindex="0" aria-label="Trace what ' + esc(x.title) + ' needs and unlocks"');
    }
    /* C: only events with something unmet */
    if (!miss.length) return h;
    var met = deps.length - miss.length;
    return h + '<div class="nd-box"><div class="nd-hd">Before this can happen <span>' + met + ' of ' + deps.length + ' met</span></div>' +
      deps.map(function (d) { return '<div class="nd-row">' + ndItem(d) + '</div>'; }).join('') +
      (un.length ? '<div class="nd-then">Then it unlocks ' + un.map(unlItem).join('') + '</div>' : '') + '</div>';
  };
  V13I.link = '<svg aria-hidden="true" focusable="false" viewBox="0 0 256 256" fill="currentColor"><path d="M240,88.23a54.43,54.43,0,0,1-16,37L189.25,160a54.27,54.27,0,0,1-38.63,16h-.05A54.63,54.63,0,0,1,96,119.84a8,8,0,0,1,16,.45A38.62,38.62,0,0,0,150.58,160h0a38.39,38.39,0,0,0,27.31-11.31l34.75-34.75a38.63,38.63,0,0,0-54.63-54.63l-11,11A8,8,0,0,1,135.7,59l11-11A54.65,54.65,0,0,1,224,48,54.86,54.86,0,0,1,240,88.23ZM109,185.66l-11,11A38.41,38.41,0,0,1,70.6,208h0a38.63,38.63,0,0,1-27.29-65.94L78,107.31A38.63,38.63,0,0,1,144,135.71a8,8,0,0,0,16,.45A54.86,54.86,0,0,0,144,96a54.65,54.65,0,0,0-77.27,0L32,130.75A54.62,54.62,0,0,0,70.56,224h0a54.28,54.28,0,0,0,38.64-16l11-11A8,8,0,0,0,109,185.66Z"/></svg>';

  /* find where an event lives, open what holds it, and bring it into view */
  function locate(k) {
    var p = k.split('|'), plan = PLANS[state.proj], hit = null;
    plan.forEach(function (blk, b) { (blk.items || []).forEach(function (it, i) { (it.sprints || []).forEach(function (sp, g) { if (sp.name === p[0]) sp.events.forEach(function (x, e) { if (x.title === p[1]) hit = [b, i, g, e]; }); }); }); });
    return hit;
  }
  function ndGo(k) {
    var el, L;
    if (k === 'act') { L = locate(S11 + 'Spec revised again'); state.open[fk('it:' + L[0] + ':' + L[1])] = true; state.open[fk('sp:' + L[0] + ':' + L[1] + ':' + L[2])] = true; state.open[fk('st:' + L.join(':'))] = true; }
    else { L = locate(k); if (!L) return; state.open[fk('it:' + L[0] + ':' + L[1])] = true; state.open[fk('sp:' + L[0] + ':' + L[1] + ':' + L[2])] = true; }
    relist();
    el = k === 'act' ? document.querySelector('#v13list .v13acts li.blocked') : document.querySelector('#v13list [data-ndk="' + k.replace(/"/g, '\\"') + '"]');
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - bandH() - 70;
    window.scrollTo({ top: Math.max(0, y), behavior: REDUCED ? 'auto' : 'smooth' });
    el.classList.remove('nd-flash'); void el.offsetWidth; el.classList.add('nd-flash');
  }
  /* B: trace. The tapped event, what it needs and what it unlocks stay; the rest fades; a line joins their icons */
  var TRACE = null;
  function clearTrace() { TRACE = null; var l = document.getElementById('v13list'); if (!l) return; l.classList.remove('nd-tracing'); l.querySelectorAll('.nd-on, .nd-me').forEach(function (n) { n.classList.remove('nd-on', 'nd-me'); }); var s = l.querySelector('.nd-wire'); if (s) s.remove(); var c = document.getElementById('nd-card'); if (c) c.remove(); }
  function trace(k) {
    clearTrace(); TRACE = k;
    var keys = [k].concat((DEP[k] || []).map(function (d) { return d[2]; }).filter(function (x) { return x && x !== 'act'; }), UNL[k] || []);
    keys.forEach(function (kk) { var L = locate(kk); if (L) { state.open[fk('it:' + L[0] + ':' + L[1])] = true; state.open[fk('sp:' + L[0] + ':' + L[1] + ':' + L[2])] = true; } });
    var me0 = document.querySelector('#v13list [data-ndk="' + k + '"]'), y0 = me0 ? me0.getBoundingClientRect().top : 0;
    var list = document.getElementById('v13list'); list.innerHTML = list13();
    var me = list.querySelector('[data-ndk="' + k + '"]'); if (me0 && me) window.scrollBy(0, me.getBoundingClientRect().top - y0);
    list.classList.add('nd-tracing');
    var nodes = [];
    keys.forEach(function (kk, j) { var n = list.querySelector('[data-ndk="' + kk + '"]'); if (n) { n.classList.add(j ? 'nd-on' : 'nd-me'); nodes.push(n); } });
    var lr = list.getBoundingClientRect(), ys = nodes.map(function (n) { var r = n.querySelector('.v13ico').getBoundingClientRect(); return [r.left - lr.left + r.width / 2, r.top - lr.top + r.height / 2]; });
    var meY = ys[0][1], x0 = Math.min.apply(null, ys.map(function (p) { return p[0]; })) - 22;
    var path = ys.slice(1).map(function (p) { return 'M' + (p[0] - 15) + ' ' + p[1] + ' H' + (x0 + 6) + ' Q' + x0 + ' ' + p[1] + ' ' + x0 + ' ' + (p[1] + (meY > p[1] ? 6 : -6)) + ' V' + (meY + (meY > p[1] ? -6 : 6)) + ' Q' + x0 + ' ' + meY + ' ' + (x0 + 6) + ' ' + meY + ' H' + (ys[0][0] - 15); }).join(' ');
    list.insertAdjacentHTML('afterbegin', '<svg class="nd-wire" width="' + lr.width + '" height="' + list.scrollHeight + '" aria-hidden="true"><path d="' + path + '"/></svg>');
    var deps = DEP[k] || [], miss = unmet(k), un = UNL[k] || [];
    var words = deps.length ? (miss.length ? 'Needs ' + deps.length + ', ' + miss.length + ' not met' : 'Needs ' + deps.length + ', all met') : 'Needs nothing on record';
    var card = '<div id="nd-card" role="status"><div class="nd-ct"><b>' + esc(nmOf(k)) + '</b><button type="button" class="nd-x" aria-label="Stop tracing">' + V13I.x + '</button></div><div class="nd-cw">' + words + (un.length ? ' · unlocks ' + un.length : '') + '</div>' +
      (miss.length ? '<div class="nd-cl">' + miss.map(ndItem).join('') + '</div>' : '') + '<div class="nd-ex">Requirements are an example: no record says yet which event needs which.</div></div>';
    document.body.insertAdjacentHTML('beforeend', card);
  }
  document.addEventListener('click', function (e) {
    if (!v13on()) return;
    var x = e.target.closest('#nd-card .nd-x'); if (x) { clearTrace(); return; }
    var go = e.target.closest('[data-nd-go]'); if (go) { e.stopImmediatePropagation(); var k = go.dataset.ndGo; if (NEEDS_OPT === 'B') { clearTrace(); } ndGo(k); return; }
    if (NEEDS_OPT === 'B') { var t = e.target.closest('.nd-tap'); if (t) { e.stopImmediatePropagation(); if (TRACE === t.dataset.ndk) clearTrace(); else trace(t.dataset.ndk); } }
  }, true);
  var _renderProjectNd = renderProject;
  renderProject = function () { clearTrace(); return _renderProjectNd.apply(this, arguments); };
