  /* Options for the owner's comment on v21's home (round 6, answer 1): "Floating Header here too".
     A layer over v21 inside its script. HOME = 'A' | 'B' | 'C'; in each, home's header floats in the glass band, as a project's does.
     A: the slim bar only: "Timeline" in 17, the live line under it in 12, the bell and More. The search scrolls with the page.
     B: the slim bar, and the search under it, slimmer, floating with it.
     C: the slim bar, and the project pills under it, as on a project's page (none selected); a pill opens its project. */
  function homeInto() {
    var v = document.getElementById('view'), top = v && v.querySelector('header.top');
    if (!v || !top || state.view !== 'desk') return;
    var cap = top.querySelector('.capsule'), h1 = top.querySelector('h1'), live = top.querySelector('.asof');
    var band = document.createElement('div'); band.className = 'v13band hd-band hm-band hm-' + HOME;
    var bar = document.createElement('div'); bar.className = 'hd-bar hd-1';
    var tx = document.createElement('div'); tx.className = 'hd-tx';
    tx.appendChild(h1); tx.appendChild(live); bar.appendChild(tx); bar.appendChild(cap); band.appendChild(bar);
    if (HOME === 'B') { var s = v.querySelector('label.search'); if (s) band.appendChild(s); }
    if (HOME === 'C') { var row = document.createElement('div'); row.className = 'pl-row pl-B'; row.innerHTML = pager(null); band.appendChild(row); }
    top.parentNode.insertBefore(band, top); top.remove();
    v.classList.add('hm-on');
  }
  /* a pill on home opens its project (the page's own handler only switches between projects) */
  window.addEventListener('click', function (e) {
    var go = e.target.closest && e.target.closest('.hm-band [data-goto]'); if (!go || state.view !== 'desk') return;
    e.stopPropagation(); e.preventDefault(); state.mode = 'plan'; openProject(go.dataset.goto);
  }, true);
  var _renderDeskHm = renderDesk;
  renderDesk = function () { var r = _renderDeskHm.apply(this, arguments); homeInto(); return r; };
