  /* Options for the owner's round 6, answer 10: "What makes more sense to me conceptually is organizing the timeline by when things
     should have been done then somehow showing where they dragged on and why". A layer over order.js (ORD = 'A') inside v25's
     script. DUE = 'A' | 'B' | 'C'. In all three the milestones run top down by their due date, their numbers follow that order
     (M6 becomes 2.2), and each says whether it finished on time or how long it has dragged past its due date, with a Why that
     opens the reason. Due dates, starts and reasons are EXAMPLES: no record carries them yet. The mockup's clock is 14 Nov 17:25.
     A: a bar on each row: the planned span to a due tick, then the drag past it in the soft status tint, with "11 h 25 min over".
     B: words only: "Due 14 Nov 06:00" and a tinted "11 h 25 min over" tag, no bar.
     N (round 6, answer 13): one plain order, no drag shown: milestones by when their work began or is meant to begin, numbers
        following that order, nothing added; a standard milestone's own id (Design-5) is hidden, so only one number shows.
     C: one shared time axis: every milestone's bar on the same days, the planned window outlined, the actual span filled, the drag
        tinted, and a Now line through every row. */
  var DU_NOW = 2 * 1440 + 17 * 60 + 25;   /* minutes from 12 Nov 00:00 to 14 Nov 17:25 */
  function dm(d, hm) { var p = hm.split(':'); return (d - 12) * 1440 + (+p[0]) * 60 + (+p[1]); }
  var DUE = {
    'Design-1': { s: dm(13, '09:00'), due: dm(13, '18:00'), end: dm(13, '16:10'), why: 'Done defined from the spec’s real scenarios, ahead of time.' },
    'M6': { s: dm(13, '21:00'), due: dm(14, '06:00'), end: null, st: 'bad', why: 'The spec failed plan review three times. The spec writer was never given the experiment files, so the same fix kept failing; it now waits on your call on stop card 5.' },
    'Design-5': { s: dm(14, '12:00'), due: dm(14, '16:00'), end: null, st: 'wait', why: 'The mockups wait on M6: until the records carry the timeline, they run on examples.' },
    'Design-6': { s: dm(14, '18:00'), due: dm(15, '09:00'), end: null, risk: 'Starts only once M6’s spec passes review, so it is at risk.' },
    'Design-3': { s: dm(15, '09:00'), due: dm(15, '18:00'), end: null },
    'Design-2': { s: dm(15, '18:00'), due: dm(16, '12:00'), end: null },
    'Design-4': { s: dm(16, '09:00'), due: dm(16, '18:00'), end: null }
  };
  var DU_KEY = function (x) { return DUE_OPT === 'N' ? x.s : x.due; };
  var DU_ORDER = Object.keys(DUE).sort(function (a, b) { return DU_KEY(DUE[a]) - DU_KEY(DUE[b]); });
  var DU_NUM = {};   /* old number -> new number, by due order */
  var DU_OLD = { 'Design-1': '2.1', 'Design-2': '2.2', 'Design-3': '2.3', 'Design-4': '2.4', 'Design-5': '2.5', 'Design-6': '2.6', 'M6': '2.7' };
  DU_ORDER.forEach(function (id, j) { DU_NUM[DU_OLD[id]] = '2.' + (j + 1); });
  function duRe(s) { return s.replace(/(^|[^\d.])2\.([1-7])(?=\.\d|\b)/g, function (m, pre, d) { return pre + (DU_NUM['2.' + d] || '2.' + d); }); }
  function duNumHTML(h) {
    return h.replace(/(class="no">)([\d.]+)/g, function (m, a, n) { return a + duRe(n); })
            .replace(/(class="lb"[^>]*>)([\d.]+)/g, function (m, a, n) { return a + duRe(n); })
            .replace(/(v13stephd"[\s\S]*?<b>)([\d.]+)/g, function (m, a, n) { return a + duRe(n); })
            .replace(/(aria-label="Milestone )([\d.]+)/g, function (m, a, n) { return a + duRe(n); });
  }
  var _list13Du = list13; list13 = function () { return duNumHTML(_list13Du.apply(this, arguments)); };
  var _mapSVGDu = mapSVG; mapSVG = function () { return duNumHTML(_mapSVGDu.apply(this, arguments)); };
  if (typeof chipHTML === 'function') { var _chipDu = chipHTML; chipHTML = function () { return _chipDu.apply(this, arguments).replace(/(<span>)([\d.]+)/, function (m, a, n) { return a + duRe(n); }); }; }
  function fmtT(t) { var d = Math.floor(t / 1440), m = t - d * 1440; return (12 + d) + ' Nov ' + ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2); }
  function fmtD(m) { m = Math.round(Math.abs(m)); var d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), n = m % 60; return (d ? d + ' d ' : '') + (h ? h + ' h' : '') + (!d && n ? (h ? ' ' : '') + n + ' min' : ''); }
  function duInfo(id) {
    var x = DUE[id]; if (!x) return null;
    var end = x.end !== null ? x.end : DU_NOW, over = end - x.due, open = x.end === null;
    var st = !open ? (over > 0 ? 'wait' : 'ok') : over > 0 ? (x.st || 'wait') : x.risk ? 'risk' : '';
    var word = !open ? (over > 0 ? 'done ' + fmtD(over) + ' late' : 'done ' + fmtD(-over) + ' early') : over > 0 ? fmtD(over) + ' over' : x.risk ? 'at risk' : x.s > DU_NOW ? 'due ' + fmtT(x.due) : 'due in ' + fmtD(-over);
    return { x: x, end: end, over: over, open: open, st: st, word: word, why: x.why || x.risk };
  }
  var DU_A = 0, DU_B = DU_NOW + 2 * 1440;   /* the shared axis for C: 12 Nov to 16 Nov 17:25 */
  function duRow(id) {
    var i = duInfo(id); if (!i || DUE_OPT === 'N') return '';
    var why = i.why ? '<button type="button" class="du-why" data-du-why="' + id + '">Why</button>' : '';
    var tag = '<span class="du-tag ' + i.st + '">' + esc(i.word) + '</span>';
    if (DUE_OPT === 'B') return '<span class="du-line"><span class="du-due">Due ' + esc(fmtT(i.x.due)) + '</span>' + tag + why + '</span>';
    var a = DUE_OPT === 'C' ? DU_A : i.x.s, b = DUE_OPT === 'C' ? DU_B : Math.max(i.x.due, i.end), W = b - a, pc = function (t) { return Math.max(0, Math.min(100, (t - a) / W * 100)); };
    var bar = '<span class="du-bar' + (DUE_OPT === 'C' ? ' axis' : '') + '">' +
      '<i class="plan" style="left:' + pc(i.x.s) + '%;width:' + (pc(i.x.due) - pc(i.x.s)) + '%"></i>' +
      (i.end > i.x.s ? '<i class="act" style="left:' + pc(i.x.s) + '%;width:' + (pc(Math.min(i.end, i.x.due)) - pc(i.x.s)) + '%"></i>' : '') +
      (i.over > 0 ? '<i class="over ' + i.st + '" style="left:' + pc(i.x.due) + '%;width:' + (pc(i.end) - pc(i.x.due)) + '%"></i>' : '') +
      '<i class="tick" style="left:' + pc(i.x.due) + '%"></i>' + (DUE_OPT === 'C' ? '<i class="nowl" style="left:' + pc(DU_NOW) + '%"></i>' : '') + '</span>';
    return '<span class="du-line">' + bar + tag + why + '</span>';
  }
  function ord2Fix() {
    var L = document.getElementById('v13list'); if (!L || !L.firstElementChild || L.firstElementChild.dataset.duDone) return;
    L.firstElementChild.dataset.duDone = '1';
    var ph = L.querySelector('.v13phase.cur > .v13body'); if (!ph) return;
    var ms = [].slice.call(ph.children).filter(function (c) { return c.classList.contains('v13ms'); });
    var now = ph.querySelector(':scope > .v13now'), tail = [].slice.call(ph.children).filter(function (c) { return c.classList.contains('v13unhide'); });
    var idOf = function (m) { var b = m.querySelector(':scope > button.v13gr .l1 b'); return b ? b.textContent : ''; };
    ms.sort(function (a, b) { return DU_KEY(DUE[idOf(a)] || { s: 1e9, due: 1e9 }) - DU_KEY(DUE[idOf(b)] || { s: 1e9, due: 1e9 }); });
    var placed = false;
    ms.forEach(function (m) {
      var x = DUE[idOf(m)];
      if (now && !placed && x && DU_KEY(x) > DU_NOW) { ph.appendChild(now); placed = true; }
      ph.appendChild(m);
      if (DUE_OPT === 'N') { var bb = m.querySelector(':scope > button.v13gr .l1 b'); if (bb && /^(Discovery|Design|Build|Launch)-\d+$/.test(bb.textContent)) bb.classList.add('du-hid'); }
      var hb = m.querySelector(':scope > button.v13gr'); if (hb && DUE_OPT !== 'N' && !m.querySelector(':scope > .du-row')) hb.insertAdjacentHTML('afterend', '<div class="du-row">' + duRow(idOf(m)) + '</div>');
    });
    if (now && !placed) ph.appendChild(now);
    tail.forEach(function (c) { ph.appendChild(c); });
    if (DUE_OPT === 'C' && !ph.querySelector('.du-axis')) {
      var ax = document.createElement('div'); ax.className = 'du-axis'; var days = '';
      for (var d = 12; d <= 16; d++) days += '<span style="left:' + ((dm(d, '00:00') - DU_A) / (DU_B - DU_A) * 100) + '%">' + d + ' Nov</span>';
      ax.innerHTML = '<span class="du-axin">' + days + '<i class="nowl" style="left:' + ((DU_NOW - DU_A) / (DU_B - DU_A) * 100) + '%"></i></span>';
      ph.insertBefore(ax, ph.firstChild);
    }
  }
  /* the Why tag opens its reason in a bubble under the row; it must not fold the milestone, so it runs first, on window */
  window.addEventListener('click', function (e) {
    var w = e.target.closest && e.target.closest('[data-du-why]'); if (!w) { if (!(e.target.closest && e.target.closest('.du-bub'))) { var o = document.querySelector('.du-bub'); if (o) o.remove(); } return; }
    e.stopPropagation(); e.preventDefault();
    var ms = w.closest('.v13ms'), old = document.querySelector('.du-bub'), same = old && old.parentNode === ms; if (old) old.remove(); if (same) return;
    var i = duInfo(w.dataset.duWhy), b = document.createElement('div'); b.className = 'du-bub';
    b.innerHTML = '<b>' + esc(i.open && i.over > 0 ? 'Why it dragged on' : i.open ? 'What could make it late' : i.over > 0 ? 'Why it was late' : 'How it finished') + '</b><p>' + esc(i.why) + '</p><span class="du-ex">Due ' + esc(fmtT(i.x.due)) + ' · an example: no record carries due dates or reasons yet.</span>';
    var r = ms.querySelector(':scope > .du-row'); ms.insertBefore(b, r ? r.nextSibling : ms.querySelector(':scope > button.v13gr').nextSibling);
  }, true);
  var _renderProjectDu = renderProject;
  renderProject = function () { var r = _renderProjectDu.apply(this, arguments); ord2Fix(); return r; };
