  /* Options for the owner's comment on v19 (round 5, answer 6): "What are your thoughts on always pulling the highlighted section
     to the center of the slider so you can see the before and after?" A layer over v19 inside its script. CENTRE = '1' | '2'.
     1: the window always sits in the middle; what came before fills the left half, what comes after the right half.
     2: the same, but at either end of the milestone the window slides to that edge instead of leaving a half empty. */
  var _fitXC = fitX;
  fitX = function (L, on) {
    var n = L.order.length, W = vpW(), ins = [];
    L.order.forEach(function (ev, j) { if (on && on[ev.k]) ins.push(j); });
    if (!ins.length || n < 2) return _fitXC(L, on);
    L.w = W;
    var a = ins[0], b = ins[ins.length - 1], STEP = 68, M = Math.min(W - 120, (b - a) * STEP), pre = a, post = n - 1 - b;
    var start = W / 2 - M / 2;
    if (CENTRE === '2') { if (!pre) start = FITPAD + 14; else if (!post) start = W - FITPAD - 14 - M; }
    for (var j = a; j <= b; j++) L.X[L.order[j].k] = b === a ? start : start + M * (j - a) / (b - a);
    var lo = FITPAD, hi = start - 30;          /* before: spread evenly over the left side */
    for (j = 0; j < a; j++) L.X[L.order[j].k] = pre === 1 ? (lo + hi) / 2 : lo + (hi - lo) * j / (pre - 1);
    lo = start + M + 30; hi = W - FITPAD;      /* after: spread evenly over the right side */
    for (j = b + 1; j < n; j++) L.X[L.order[j].k] = post === 1 ? (lo + hi) / 2 : lo + (hi - lo) * (j - b - 1) / (post - 1);
  };
