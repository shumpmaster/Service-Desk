  /* The owner's round 7, answer 13 (with a picture of segmented progress bars, the bottom one chosen): "Shift the sprints to the
     left by removing the current progress box. Then place this progress indicator either as another row on the sprints, or out to
     the right side of the title. Also could we get the actions numbered with a 4th number please so 2.2.2.X? And the tasks actions
     under all of the sprints don't need a colored accent." A layer over the final tweaks (fin). SG = 'R' | 'U'.
     The sprint's square goes; its progress is ten small squares, as many filled as tenths done, in its status colour:
     R, to the right of its title (its event count moves to the line under); U, on a line of its own under the title.
     Every row under a sprint takes a fourth number in order (2.2.2.1 ...); a plan's actions follow it (2.2.2.9.1 ...).
     The rail down a sprint's rows is neutral; the sprint's own accent bar keeps its colour. */
  document.documentElement.classList.add('sg', 'sg-' + SG);
  function sgSeg(pct, st) { var n = Math.round(pct / 10), h = ''; for (var j = 0; j < 10; j++) h += '<i' + (j < n ? ' class="f"' : '') + '></i>'; return '<span class="sg-seg ' + st + '" role="img" aria-label="' + pct + ' percent complete">' + h + '</span>'; }
  function sgFix() {
    var L = document.getElementById('v13list'); if (!L) return;
    [].slice.call(L.querySelectorAll('.v13sp > .v13gr')).forEach(function (bt) {
      if (bt.querySelector('.sg-seg')) return;
      var q = bt.querySelector('.fin-sq'), g = bt.querySelector('.v13g'); if (!g) return;
      var st = (/\b(ok|wait|bad)\b/.exec(g.className) || ['', ''])[1], a = g.querySelector('.arc');
      var pct = a ? Math.round(parseFloat(a.getAttribute('stroke-dasharray')) / (2 * Math.PI * 14) * 100) : 0;
      var l1 = bt.querySelector('.l1'), cnt = l1 && l1.querySelector('.cnt'), l3 = bt.querySelector('.l3');
      if (SG === 'R') { l1.insertAdjacentHTML('beforeend', sgSeg(pct, st)); if (cnt && l3) l3.insertAdjacentHTML('afterbegin', cnt.textContent + ' · '); }
      else l1.insertAdjacentHTML('afterend', '<span class="sg-row">' + sgSeg(pct, st) + '<span>' + pct + '%</span></span>');
    });
    [].slice.call(L.querySelectorAll('.v13sp > .v13body')).forEach(function (body) {
      if (body.dataset.sgNo) return;
      var sp = body.parentNode, no = ((sp.querySelector(':scope > .v13gr .no') || {}).textContent || '').trim(); if (!no) return;
      body.dataset.sgNo = '1';
      var n = 0;
      [].slice.call(body.children).forEach(function (c) {
        if (c.classList.contains('v13step')) {
          n++; var x = no + '.' + n, b = c.querySelector('.v13stephd .l1 > b'); if (b) b.textContent = x;
          [].slice.call(c.querySelectorAll('.v12plan .num')).forEach(function (s) { s.textContent = x + '.' + s.textContent.split('.').pop(); });
        } else if (c.classList.contains('v13ev')) {
          n++; var tx = c.querySelector('.tx'); if (tx) tx.insertAdjacentHTML('afterbegin', '<div class="no4 own">' + no + '.' + n + '</div>');   /* on a line of its own, above the event's lines (round 7, answers 14 and 15) */
        }
      });
    });
  }
  var sgObs = new MutationObserver(function () { sgFix(); });
  var _renderProjectSg = renderProject;
  renderProject = function () { var r = _renderProjectSg.apply(this, arguments); sgFix(); var L = document.getElementById('v13list'); if (L) { sgObs.disconnect(); sgObs.observe(L, { childList: true, subtree: true }); } return r; };
