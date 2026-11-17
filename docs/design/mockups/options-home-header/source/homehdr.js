  /* Options for the owner's comment on v21's home page (round 5, answer 15): "Floating Header here too". A layer over v21 inside its
     script. HH = '1' | '2' | '3'. Home's header floats in the same glass band as a project's (ProjectHeader); the search scrolls away.
     1: one slim bar: "Timeline" in 17 with the status in 12 under it, the bell and More at the right, floating from the start.
     2: large at the top as now, shrinking into that slim bar once you scroll, and growing again at the top.
     3: the slim bar of 1, with the summary sentence ("5 things wait on you ...") floating under it. */
  function hhApply() {
    var view = document.getElementById('view'), top = view && view.querySelector(':scope > header.top');
    if (!top || state.view !== 'desk') return;
    var cap = top.querySelector('.capsule'), h1 = top.querySelector('h1'), asof = top.querySelector('.asof');
    var band = document.createElement('div'); band.className = 'hh-band hh-' + HH + (HH === '2' ? '' : ' slim'); band.id = 'hh-band';
    band.innerHTML = '<div class="hd-bar"><div class="hd-tx"><h1>' + h1.innerHTML + '</h1>' + asof.outerHTML + '</div></div>';
    band.querySelector('.hd-bar').appendChild(cap);
    top.replaceWith(band);
    if (HH === '3') { var sum = view.querySelector('.sg-sum'); if (sum) { var c = sum.cloneNode(true); c.classList.add('hh-sum'); band.appendChild(c); sum.classList.add('hh-gone'); } }
    hhScroll();
  }
  function hhScroll() { var b = document.getElementById('hh-band'); if (b && HH === '2') b.classList.toggle('slim', window.scrollY > 40); }
  window.addEventListener('scroll', hhScroll, { passive: true });
  var _renderDeskHH = renderDesk;
  renderDesk = function () { var r = _renderDeskHH.apply(this, arguments); hhApply(); return r; };
