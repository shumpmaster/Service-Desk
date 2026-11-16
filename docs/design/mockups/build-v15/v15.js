  /* ================= v15: the owner's round 4, later (decisions/questions/P-005-design-round-4.md, answers 9 to 12) =================
     Home is grouped by what waits (the library's WaitGroup), drawn by options-home-suggest/source/sug.js with SUG = 'C23':
     a summary sentence; a group per project with something waiting, its row with a slim strip of the events that matter, and
     its waiting rows, each saying what it holds up, the longest wait first and marked; the quiet projects folded into one row.
     v14's desk map leaves home: this layer removes its band after v14 draws it. */
  var _renderDesk15 = renderDesk;
  renderDesk = function () {
    var r = _renderDesk15.apply(this, arguments), v = document.getElementById('view');
    var band = document.getElementById('v14band'); if (band) band.remove();
    if (v) { v.classList.remove('v14'); var f = v.querySelector('.v14foot'); if (f) f.remove(); }
    V14S = null;
    return r;
  };
