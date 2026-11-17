  /* Options for the owner's round 5, answer 12: "I love the bubble as a way to link to the next layer - but i dont like the current
     format that is showing once you click it". A layer over v20 with the tree, the why as B and the needs as a tag and bubble
     (options-needs2, NEED4 = 'A'). BUB = '1' | '2' | '3': what the bubble shows. In each, a requirement with needs of its own
     has a chevron; tapping it opens that next layer inside the same bubble, with a trail at the top to go back. Nothing moves the page.
     1: a plain checklist: a mark, the words, and who or what it waits on.
     2: grouped by who has to act: on you, blocked, not started yet, done.
     3: a small flow, top to bottom: what it needs, then this event, then what it lets happen. */
  state.n5 = [];
  var N5W = { ok: 'done', wait: 'on you', bad: 'blocked', pend: 'not started' };
  function n5mark(st) { return '<span class="n5-mk ' + st + '">' + (st === 'ok' ? V12I.check : st === 'bad' ? V12I.warn : st === 'wait' ? V13I.wait : '') + '</span>'; }
  function n5deeper(d) { return d[2] && d[2] !== 'act' && DEP[d[2]] && DEP[d[2]].length ? d[2] : null; }
  function n5item(d) {
    var deep = n5deeper(d), tagn = deep ? 'button type="button" data-n5go="' + esc(deep) + '"' : 'div';
    return '<' + tagn + ' class="n5-it ' + d[0] + (deep ? ' deep' : '') + '">' + n5mark(d[0]) + '<span class="w">' + esc(d[1]) + '</span><span class="s">' + N5W[d[0]] + '</span>' + (deep ? V12I.caret : '') + '</' + (deep ? 'button' : 'div') + '>';
  }
  function n5name(k) { return k === 'act' ? 'Action 2.7.2.5.5' : nmOf(k); }
  n4list = function (root) {
    var path = [root].concat(state.n5), k = path[path.length - 1], deps = DEP[k] || [], miss = unmet(k), un = UNL[k] || [];
    var trail = path.length > 1 ? '<div class="n5-trail">' + path.map(function (p, j) { return j < path.length - 1 ? '<button type="button" data-n5up="' + j + '">' + esc(n5name(p)) + '</button>' : '<b>' + esc(n5name(p)) + '</b>'; }).join('<span>›</span>') + '</div>' : '';
    var done = deps.length - miss.length, body = '';
    if (BUB === '1') {
      body = '<div class="n5-hd">' + (miss.length ? 'Before this can happen' : 'What came first') + ' <span>' + done + ' of ' + deps.length + ' done</span></div>' + deps.map(n5item).join('') +
        (un.length ? '<div class="n5-then">Then: ' + un.map(function (u) { return '<b>' + esc(nmOf(u)) + '</b>'; }).join(', ') + '</div>' : '');
    } else if (BUB === '2') {
      var G = [['wait', 'Waiting on you'], ['bad', 'Blocked'], ['pend', 'Not started yet'], ['ok', 'Done']];
      body = G.map(function (gr) { var its = deps.filter(function (d) { return d[0] === gr[0]; }); return its.length ? '<div class="n5-grp ' + gr[0] + '"><div class="n5-gh">' + gr[1] + ' <span>' + its.length + '</span></div>' + its.map(n5item).join('') + '</div>' : ''; }).join('') +
        (un.length ? '<div class="n5-then">Then: ' + un.map(function (u) { return '<b>' + esc(nmOf(u)) + '</b>'; }).join(', ') + '</div>' : '');
    } else {
      body = '<div class="n5-flow"><div class="n5-col">' + deps.map(n5item).join('') + '</div><div class="n5-arr">' + V12I.arrow + '<span>' + (miss.length ? miss.length + ' still to happen' : 'all done') + '</span></div>' +
        '<div class="n5-me">' + esc(n5name(k)) + '</div>' + (un.length ? '<div class="n5-arr">' + V12I.arrow + '<span>then</span></div><div class="n5-col">' + un.map(function (u) { return '<div class="n5-it un"><span class="w">' + esc(nmOf(u)) + '</span></div>'; }).join('') + '</div>' : '') + '</div>';
    }
    return '<div class="n5">' + trail + body + '</div>';
  };
  window.addEventListener('click', function (e) {
    if (!v13on()) return;
    var go = e.target.closest('[data-n5go]'), up = e.target.closest('[data-n5up]'), tg = e.target.closest('[data-n4]');
    if (tg) { state.n5 = []; return; }   /* a new bubble starts at its own event */
    if (!go && !up) return;
    e.stopImmediatePropagation();
    if (go) state.n5.push(go.dataset.n5go); else state.n5 = state.n5.slice(0, +up.dataset.n5up);
    n4redraw();
    var box = document.querySelector('.n4-bub .n5'); if (box && !REDUCED) anim(box, [{ opacity: 0, transform: go ? 'translateX(16px)' : 'translateX(-16px)' }, { opacity: 1, transform: 'none' }], { duration: 220 });
  }, true);
