  /* ================= round 8, answer 24: home as a priority list of the owner's actions (options over v41; decisions/questions/P-005-design-round-8.md)
     The phone's hash, tokens joined by dots: p=A|B|C (the option; none = v41 as it is); y=<px> (scroll by); light or dark (set by the theme script).
     Priority, from what the records carry: 1, what it holds up (a whole phase, then the most milestones); 2, a gate or stop before a question (a stop halts the pipeline);
     3, the longest wait. No record ranks the owner's actions or gives a due date. ================= */
  var PR = (function () {
    var h = decodeURIComponent((location.hash || '').slice(1)).split('.'), o = { tok: {} };
    h.forEach(function (t) { var i = t.indexOf('='); if (i > 0) o.tok[t.slice(0, i)] = t.slice(i + 1); });
    o.p = o.tok.p || ''; if (o.p) document.documentElement.classList.add('pr-on', 'pr-' + o.p);
    return o;
  })();
  function prMins(age) { var d = /(\d+)\s*day/.exec(age), hh = /(\d+)\s*h/.exec(age), m = /(\d+)\s*min/.exec(age);
    return (d ? +d[1] * 1440 : 0) + (hh ? +hh[1] * 60 : 0) + (m ? +m[1] : 0); }
  function prItems(view) {
    return [].slice.call(view.querySelectorAll('.sg-grp[data-sgg] .need[data-key]')).map(function (r) {
      var i = +r.dataset.key.slice(1), n = NEEDS[i], hold = (r.querySelector('.sg-hold') || {}).textContent || '';
      var phase = !n.feeds, mm = phase ? 0 : n.feeds.length, hard = n.k === 'stop' || n.k === 'gate';
      var ph = (/’s (\w+) phase/.exec(hold) || [])[1] || 'its';
      var holds = phase ? 'Holds up the ' + ph + ' phase' : 'Holds up ' + mm + (mm === 1 ? ' milestone' : ' milestones') + ' (' + n.feeds.join(', ') + ')';
      var wait = n.age.replace(/^waiting\s*/, '');
      return { r: r, i: i, n: n, phase: phase, mm: mm, hard: hard, holds: holds, wait: wait, mins: prMins(n.age),
        ev: (r.querySelector('.ev41') || {}).outerHTML || '', proj: proj(n.p).name,
        score: (phase ? 100000 : 0) + mm * 1000 + (hard ? 500 : 0) + Math.min(prMins(n.age), 499) };
    }).sort(function (a, b) { return b.score - a.score || b.mins - a.mins; });
  }
  function prWhy(x, i, list) {
    if (x.phase) return 'It holds up a whole phase, and it has waited longest (' + x.wait + ').';
    var tie = list.filter(function (y) { return y !== x && y.mm === x.mm && !y.phase; });
    if (x.hard && tie.length) return 'It holds up ' + x.mm + ' milestones, and a stop halts the work until you answer.';
    return 'It holds up the most milestones (' + x.mm + ').';
  }
  function prRow(x, n, opt) {
    return '<div class="pr-row" data-prk="' + x.i + '"><span class="pr-n">' + n + '</span><div style="flex:1;min-width:0">' +
      '<button type="button" class="pr-b" data-pra="sheet" aria-label="' + esc(n + '. ' + x.n.title) + '"><span class="pr-top"><span class="pr-chip">' + esc(x.proj) + '</span></span>' + x.ev +
      '<span class="pr-q">' + esc(x.n.title) + '</span><span class="pr-why"><b>' + esc(x.holds) + '</b> · <span>waiting ' + esc(x.wait) + '</span></span></button>' +
      (opt && opt.acts ? '<span class="pr-acts"><button type="button" class="pr-ans" data-pra="sheet">Answer</button><button type="button" class="pr-goto" data-pra="go">Go to it</button></span>' : '') +
      '</div></div>';
  }
  function prBuild() {
    if (!PR.p) return;
    var view = document.getElementById('view'); if (!view || view.querySelector('.pr-wrap')) return;
    var groups = view.querySelectorAll('.sg-grp[data-sgg]'); if (!groups.length) return;
    var list = prItems(view); if (!list.length || list.some(function (x) { return !x.ev; })) return;  /* wait for v41's event lines */
    var sum = view.querySelector('.sg-sum'), h = '<div class="pr-wrap">';
    if (PR.p === 'A') {
      h += '<div class="pr-h">Your actions, most important first<small>' + list.length + '</small></div><section class="sg-grp pr-card pr-list">' +
        list.map(function (x, k) { return prRow(x, k + 1, { acts: true }); }).join('') + '</section>';
    } else if (PR.p === 'B') {
      var f = list[0];
      h += '<section class="sg-grp pr-card pr-first" data-prk="' + f.i + '"><div class="pr-eyebrow">Do this first</div><span class="pr-top"><span class="pr-chip">' + esc(f.proj) + '</span></span>' + f.ev +
        '<button type="button" class="pr-b" data-pra="sheet"><span class="pr-q">' + esc(f.n.title) + '</span></button><div class="pr-whyfirst">' + esc(prWhy(f, 0, list)) + '</div>' +
        '<span class="pr-acts"><button type="button" class="pr-ans" data-pra="sheet">Answer</button><button type="button" class="pr-goto" data-pra="go">Go to it</button></span></section>' +
        '<div class="pr-h">Then<small>' + (list.length - 1) + '</small></div><section class="sg-grp pr-card pr-compact">' +
        list.slice(1).map(function (x, k) { return prRow(x, k + 2); }).join('') + '</section>';
    } else if (PR.p === 'C') {
      var tiers = [['Blocking work', 'holds up a phase', list.filter(function (x) { return x.phase; })],
                   ['Answer soon', 'holds up milestones', list.filter(function (x) { return !x.phase && x.mm; })],
                   ['When you can', 'holds up nothing yet', list.filter(function (x) { return !x.phase && !x.mm; })]], k = 0;
      tiers.forEach(function (t) {
        h += '<div class="pr-h">' + esc(t[0]) + '<small>' + esc(t[1]) + '</small></div><section class="sg-grp pr-card pr-tier">' +
          (t[2].length ? t[2].map(function (x) { k++; return prRow(x, k, { acts: true }); }).join('') : '<div class="pr-empty">Nothing here now.</div>') + '</section>';
      });
    }
    h += '<div class="pr-h">Projects</div></div>';
    if (sum) { sum.innerHTML = '<b>' + list.length + ' things need you</b>, in ' + groups.length + ' projects. Start at the top.'; sum.insertAdjacentHTML('afterend', h); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pra]'); if (!b) return;
    var row = b.closest('[data-prk]'); if (!row) return; e.preventDefault();
    var i = +row.dataset.prk, n = NEEDS[i];
    if (b.dataset.pra === 'go') { var g = document.querySelector('.sg-row[data-sgp="' + n.p + '"]'); if (g) g.click(); return; }
    var c = document.querySelector('.sg-grp .need[data-key="n' + i + '"] .crow'); if (c) c.click();
  });
  (function () {
    if (!PR.p) return;
    var run = function () { try { prBuild(); } catch (e) { console.error(e); } };
    var v = document.getElementById('view'); if (v) new MutationObserver(function () { setTimeout(run, 30); }).observe(v, { childList: true });
    [0, 150, 500, 1200].forEach(function (t) { setTimeout(run, t); });
    if (PR.tok.y) setTimeout(function () { window.scrollTo(0, +PR.tok.y); }, 900);
  })();
