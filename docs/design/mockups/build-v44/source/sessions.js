  /* ================= v44, round 8 answer 28: automated session names and a handover-required flag (examples: no record carries either yet)
     Every Claude session is named after what it set out to do (its session lines' first "doing" text), with the day it began small after it,
     wherever the desk names a session: the link tags on the rows, the link bubble, the at-work row and its sheet, home's project line and the
     Context view. A session that must hand over carries a yellow "Handover needed" tag saying why. One session is flagged here, as an example.
     Home's priority list takes a handover only when it needs you: once the session has ended and written its handover, starting the next
     session is yours ("Start the next session"). The flagged session is still at work, so nothing is added to the list. The operating-model
     side is proposed in docs/design/requests/2026-11-27-session-names-and-handover.md. ================= */
  var SN = {   /* short: on a tag; name: everywhere else (made from the session's own "doing" line) */
    c0: { short: 'Numbering fix', name: 'Fixing the plan numbering, part 1', day: '13 Nov' },
    c1: { short: 'Stop card 4 work', name: 'The numbering fix and stop card 4', day: '13 Nov' },
    c2: { short: 'Plan checks', name: 'Following the second plan through its checks', day: '14 Nov',
      handover: 'ending with work open: the second plan waits on your stop-card answer' }
  };
  var SN_TAG = '<span class="sn-ho" title="An example: no record carries a handover flag yet">Handover needed</span>';
  function snOf(key) { var p = SS_PLACES[key]; if (!p) return null; var b = lkBase(key), s = SN[b] || SN[key]; if (s) return s;
    if (p.kind === 'claude') { for (var k in SN) if (SS_PLACES[k] && SS_PLACES[k].id === p.id) return SN[k]; } return null; }
  function snTags() {
    [].slice.call(document.querySelectorAll('.ss-q[data-ssk]')).forEach(function (q) {
      var s = snOf(q.dataset.ssk), p = SS_PLACES[q.dataset.ssk]; if (!s || !p || (p.kind !== 'claude' && !p.base)) return;
      if (p.kind !== 'claude' && SS_PLACES[q.dataset.ssk].kind === 'run') return;   /* a pipeline run keeps "Run" */
      var h = '<i class="ss-dot"></i>' + esc(s.short) + ' <small class="sn-d">' + esc(s.day) + '</small>';
      if (q.__sn !== h) { q.innerHTML = h; q.__sn = h; q.setAttribute('aria-label', 'The Chief of Staff’s session: ' + s.name + ', began ' + s.day); }
    });
  }
  var _ssBubbleSN = ssBubble;
  ssBubble = function (key) {
    var h = _ssBubbleSN(key), p = SS_PLACES[key], s = snOf(key); if (!s || !p) return h;
    h = h.replace(/P-005: /g, 'The timeline: ').replace(/P-005 /g, 'the timeline’s ');
    return h.replace(/<div class="ss-k">A Claude session · [^<]*<\/div>/, '<div class="ss-k">Chief of Staff · ' + esc(s.name) + ' <small class="sn-d">' + esc(s.day) + '</small></div>' +
      (s.handover ? '<div class="sn-hrow">' + SN_TAG + '<span>' + esc(s.handover) + '</span></div>' : '') + '<div class="sn-what">An AI session (a Claude conversation); its name is made from what it set out to do.</div>');
  };
  var _ppWorkSN = ppWork;
  ppWork = function () {
    var s = SN.c2; return _ppWorkSN().replace('<h2>The Chief of Staff, on S-011</h2>', '<h2>' + esc(s.name) + '</h2><div class="sn-hrow">' + SN_TAG + '<span>' + esc(s.handover) + '</span></div>')
      .replace('<b>Chief of Staff</b> · CoS 14 Nov', '<b>Chief of Staff</b> · ' + esc(s.short) + ' <small class="sn-d">' + esc(s.day) + '</small>');
  };
  function snWork() {
    var w = document.querySelector('.pp-work'); if (w && !w.dataset.sn) { w.dataset.sn = '1'; var s = SN.c2;
      w.querySelector('.t').innerHTML = '<b>At work now · ' + esc(s.name) + '</b>' + SN_TAG + '<small>The Chief of Staff, your lead AI assistant · since 7:52 am · ' + esc(s.handover) + '</small>'; }
    var pl = document.querySelector('#view .sg-grp[data-sgg="tl"] .fh-pline'); if (pl && !pl.dataset.sn) { pl.dataset.sn = '1'; var s2 = SN.c2;
      var mid = pl.children[1]; if (mid) mid.innerHTML = '<b>' + esc(s2.short) + '</b> · since 7:52 am ' + SN_TAG; }
    [].slice.call(document.querySelectorAll('#cxview .cx-row a')).forEach(function (a) { if (a.dataset.sn) return; var m = /CoS (\d+ \w{3})/.exec(a.textContent); if (!m) return; a.dataset.sn = '1';
      var s = null; for (var k in SN) if (SN[k].day === m[1]) s = s || SN[k]; if (m[1] === '14 Nov') s = SN.c2; else if (m[1] === '13 Nov') s = SN.c1;
      var tn = [].filter.call(a.childNodes, function (c) { return c.nodeType === 3 && /CoS/.test(c.textContent); })[0]; if (tn && s) tn.textContent = tn.textContent.replace(/CoS \d+ \w{3}/, s.short + ' · ' + m[1]); });
  }
  function snBub() {
    [].slice.call(document.querySelectorAll('.ss-bub')).forEach(function (bb) {
      var k = bb.querySelector('.ss-k'); if (!k || k.dataset.sn || !/A Claude session/.test(k.textContent)) return; var key = bb.dataset.for, s = key && snOf(key); if (!s) return; k.dataset.sn = '1';
      k.innerHTML = 'Chief of Staff · ' + esc(s.name) + ' <small class="sn-d">' + esc(s.day) + '</small>';
      k.insertAdjacentHTML('afterend', (s.handover ? '<div class="sn-hrow">' + SN_TAG + '<span>' + esc(s.handover) + '</span></div>' : '') + '<div class="sn-what">An AI session (a Claude conversation); its name is made from what it set out to do.</div>');
      [].slice.call(bb.querySelectorAll('.ss-d')).forEach(function (d) { d.textContent = d.textContent.replace(/^P-005: /, 'The timeline: ').replace(/P-005 /g, 'the timeline’s '); });
    });
  }
  function snApply() { snTags(); snWork(); snBub(); }
  var snObs = new MutationObserver(function () { if (!snObs.raf) snObs.raf = requestAnimationFrame(function () { snObs.raf = 0; try { snApply(); } catch (e) { console.error(e); } }); });
  snObs.observe(document.body, { childList: true, subtree: true });
  setTimeout(snApply, 60);
