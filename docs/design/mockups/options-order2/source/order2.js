  /* Options for the owner's answer on reading order (round 6, answer 9): "Where I struggle with this is that it looks like milestones
     were performed out of order? So neither options really work for me". A layer over order.js (ORD = 'A': top down, oldest first
     inside every sprint and plan) inside v25's script. ORD2 = '1' | '2' | '3'. The milestones are numbered in the plan's order
     (2.1 to 2.7) but are worked in another order and partly side by side, so a list by time makes the numbers jump.
     1: the plan's order. Milestones run 2.1 to 2.7 top down, each with its state; Now sits under the milestone it belongs to.
     2: grouped by state. Done, In progress, Next, Planned, each a small heading, the plan's order inside each group; M6 and
        Design-5 sit together under In progress, which shows they run side by side.
     3: the order of work without numbers: done, in progress, next, planned, as in 2 but with no group headings, and the
        milestone numbers go, so nothing reads as a sequence it isn't. */
  function msNum(m) { var n = m.querySelector(':scope > button.v13gr .no'); return n ? parseFloat(n.textContent.split('.').slice(1).join('.')) || 0 : 0; }
  function msState(m) {
    var t = (m.querySelector(':scope > button.v13gr .l3') || {}).textContent || '';
    return /Reached/.test(t) ? 0 : /^Next/.test(t) ? 2 : /^Planned/.test(t) ? 3 : 1;
  }
  function ord2Fix() {
    var L = document.getElementById('v13list'); if (!L || !L.firstElementChild || L.firstElementChild.dataset.ord2Done) return;
    L.firstElementChild.dataset.ord2Done = '1';
    var ph = L.querySelector('.v13phase.cur > .v13body'); if (!ph) return;
    var ms = [].slice.call(ph.children).filter(function (c) { return c.classList.contains('v13ms'); });
    var now = ph.querySelector(':scope > .v13now'), tail = [].slice.call(ph.children).filter(function (c) { return c.classList.contains('v13unhide'); });
    var lit = function (m) { return ((m.querySelector(':scope > button.v13gr .l3') || {}).textContent || ''); };
    var nowMs = ms.filter(function (m) { return msState(m) === 1 && /Stopped|waits on you/.test(lit(m)); })[0] || ms.filter(function (m) { return m.classList.contains('open') && msState(m) === 1; })[0];
    var byNum = function (a, b) { return msNum(a) - msNum(b); };
    var seq = [];
    if (ORD2 === '1') seq = ms.slice().sort(byNum);
    else {
      var names = ['Done', 'In progress', 'Next', 'Planned'];
      [0, 1, 2, 3].forEach(function (s) {
        var g = ms.filter(function (m) { return msState(m) === s; }).sort(byNum); if (!g.length) return;
        if (ORD2 === '2') { var h = document.createElement('div'); h.className = 'o2-head'; h.textContent = names[s] + (s === 1 && g.length > 1 ? ' · side by side' : ''); seq.push(h); }
        seq = seq.concat(g);
      });
    }
    seq.forEach(function (c) { ph.appendChild(c); if (now && c === nowMs) ph.appendChild(now); });
    tail.forEach(function (c) { ph.appendChild(c); });
    if (ORD2 === '3') ms.forEach(function (m) { var n = m.querySelector(':scope > button.v13gr .no'); if (n) n.remove(); });
  }
  var _renderProjectO2 = renderProject;
  renderProject = function () { var r = _renderProjectO2.apply(this, arguments); ord2Fix(); return r; };
