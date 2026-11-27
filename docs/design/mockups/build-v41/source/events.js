  /* ================= v41, round 8 answer 22, a comment on home's waiting row: "Can you add the title of the “event” or step that is
     waiting on me on the main page?" Each waiting row on home names the timeline event it hangs from: its kind, its number and title,
     and where it sits. From the timeline's own rows: Stop card 5 is 2.2.2.10 in S-011 (M6); PR #446's three questions hang from the
     merge 2.2.2.5 in S-011; the widget's call hangs from 1.8.1.2, its readiness check, in The brief (Discovery-8). ================= */
  (function () {
    var EV41 = {
      'S-011 failed three plan reviews: what happens next?': ['Stop', '2.2.2.10', 'Stop card 5', 'S-011'],
      'Which phone widths must the timeline fit?': ['Merge', '2.2.2.5', 'PR #446’s questions', 'S-011'],
      'Is the spec’s reading of “each thing reaches my phone” enough for M8?': ['Merge', '2.2.2.5', 'PR #446’s questions', 'S-011'],
      'Let the spec writer see the experiment files and your answers?': ['Merge', '2.2.2.5', 'PR #446’s questions', 'S-011'],
      'The widget failed its readiness check: resubmit or stop?': ['Review', '1.8.1.2', 'Readiness check failed', 'The brief']
    };
    function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function ev41() { document.querySelectorAll('#view .sg-grp .need').forEach(function (n) { if (n.querySelector('.ev41')) return;
      var tt = n.querySelector('.tt'), e = tt && EV41[tt.textContent.trim()]; if (!e) return;
      var line = document.createElement('span'); line.className = 'ev41';
      line.innerHTML = '<b>' + esc(e[0]) + ' ' + esc(e[1]) + '</b> · ' + esc(e[2]) + ' <i>· ' + esc(e[3]) + '</i>';
      line.title = e[0] + ' ' + e[1] + ', ' + e[2] + ', in ' + e[3];
      var before = n.querySelector('.sg-long') || tt; before.parentNode.insertBefore(line, before); }); }
    new MutationObserver(function () { if (!ev41.raf) ev41.raf = requestAnimationFrame(function () { ev41.raf = 0; ev41(); }); }).observe(document.body, { childList: true, subtree: true });
    ev41();
  })();
