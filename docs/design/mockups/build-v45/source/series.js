  /* ================= v45, round 8 answer 30: "Could we maybe concert this single phase indicator to a smaller series of the phases? Or
     something of the sort. And then put the waiting time on the line"
     On home, each project's head trades its single ring (the current phase's number) for a small series of its four phases, with a tick for
     each gate between them: done green, the current one in its state's colour and named beside the series, not started grey. A project with
     no plan on record shows the four as dashed outlines. Its strip, the line from 31 October to now, carries the wait on the line itself: a
     stretch in the waiting colour from when the thing began to wait to now, labelled with how long. ================= */
  var PS_WAIT = { tl: 14 * 1440 + 15 * 60 + 42, wd: 4 * 1440 + 20 * 60 + 53 };   /* when each waiting thing began to wait (stop card 5; the readiness card) */
  var PS_NAMES = ['Discovery', 'Design', 'Build', 'Launch'];
  function psState(pid) {
    var n = NEEDS.filter(function (x) { return x.p === pid; });
    if (n.some(function (x) { return x.k === 'stop'; })) return { c: 'bad', w: 'stopped, your call' };
    if (n.length) return { c: 'wait', w: 'waiting on you' };
    return { c: 'ok', w: 'moving' };
  }
  function psHTML(pid) {
    var plan = PLANS[pid];
    if (!plan) return '<span class="ps45 none" role="img" aria-label="No phases on record for this project"><span class="ps45-bar">' +
      PS_NAMES.map(function (n, i) { return (i ? '<b class="g"></b>' : '') + '<i class="s"></i>'; }).join('') + '</span><span class="ps45-l">No phases on record</span></span>';
    var ph = [], gates = {}, k = -1;
    plan.forEach(function (b) { if (b.type === 'phase') { ph.push(b); k = ph.length - 1; } else if (b.type === 'gate') gates[k + 1] = b; });
    var cur = 0; ph.forEach(function (b, i) { if (b.st === 'current') cur = i; });
    var st = psState(pid), bar = '';
    ph.forEach(function (b, i) {
      if (i) { var g = gates[i]; bar += '<b class="g' + (g && g.st === 'done' ? ' ok' : '') + '" title="' + esc((g && g.name) || PS_NAMES[i] + ' gate') + '"></b>'; }
      var c = b.st === 'done' ? 'ok' : i === cur ? st.c + ' cur' : '';
      bar += '<i class="s ' + c + '" title="' + esc(b.name) + '"></i>';
    });
    var label = 'Phase ' + (cur + 1) + ' of ' + ph.length + ', ' + ph[cur].name + ', ' + st.w;
    return '<span class="ps45" role="img" aria-label="' + esc(label) + '"><span class="ps45-bar">' + bar + '</span><span class="ps45-l"><b>' + esc(ph[cur].name) + '</b> · ' + esc(st.w) + '</span></span>';
  }
  function psWait(pid, svg) {   /* the wait, as a stretch on the strip's line, labelled */
    var m = PS_WAIT[pid], n = NEEDS.filter(function (x) { return x.p === pid; })[0]; if (m == null || !n) return;
    if (svg.querySelector('.w45')) return;
    var W = 300, x0 = 4, x1 = W - 8, X = function (t) { return x1 - Math.sqrt(Math.min(14, (SUG_NOW - t) / 1440) / 14) * (x1 - x0); };
    var xs = Math.min(X(m), x1 - 6), NS = 'http://www.w3.org/2000/svg', ln = svg.querySelector('.ln');
    var s = document.createElementNS(NS, 'line'); s.setAttribute('class', 'w45 wait');
    s.setAttribute('x1', xs.toFixed(1)); s.setAttribute('x2', x1); s.setAttribute('y1', 14); s.setAttribute('y2', 14);
    if (ln && ln.nextSibling) svg.insertBefore(s, ln.nextSibling); else svg.appendChild(s);
    var t = document.createElementNS(NS, 'text'), txt = n.age || 'waiting';
    t.setAttribute('class', 'w45t'); t.setAttribute('y', 4); t.textContent = txt;
    var w = txt.length * 5.9, mid = (xs + x1) / 2, x;
    if (mid - w / 2 >= 48 && mid + w / 2 <= x1 - 30) { x = mid; t.setAttribute('text-anchor', 'middle'); }
    else { x = x1 - 30; t.setAttribute('text-anchor', 'end'); }
    t.setAttribute('x', x.toFixed(1)); svg.appendChild(t);
    var sp = svg.closest('.sg-strip'); if (sp) { sp.removeAttribute('aria-hidden'); sp.setAttribute('role', 'img'); sp.setAttribute('aria-label', 'From 31 October to now; ' + txt + ' since ' + (pid === 'wd' ? '4 November' : '9:42 am')); }
  }
  function psApply() {
    var view = document.getElementById('view'); if (!view) return;
    document.documentElement.classList.add('ps45-on');
    [].slice.call(view.querySelectorAll('.sg-grp .sg-row[data-sgp], .sg-quiet-list .sg-row[data-sgp]')).forEach(function (r) {
      var pid = r.dataset.sgp; if (r.querySelector('.ps45')) return;
      var tx = r.querySelector('.tx'), l1 = tx && tx.querySelector('.l1'); if (!l1) return;
      l1.insertAdjacentHTML('afterend', psHTML(pid));
    });
    [].slice.call(view.querySelectorAll('.sg-grp[data-sgg]')).forEach(function (g) { var sv = g.querySelector('.sg-strip svg'); if (sv) psWait(g.dataset.sgg, sv); });
  }
  var psObs = new MutationObserver(function () { if (!psObs.raf) psObs.raf = requestAnimationFrame(function () { psObs.raf = 0; try { psApply(); } catch (e) { console.error(e); } }); });
  psObs.observe(document.body, { childList: true, subtree: true });
  setTimeout(psApply, 60);
