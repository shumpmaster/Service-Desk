  /* The owner's round 7, answers 6 and 7: "the phases and milestones are not oriented bottom up ... the info below the physical
     timeline starts at 1 and requires you to scroll down instead of up"; "Yes, all bottom up". A layer over v27 inside its script.
     Every level reads from the bottom: the phases (Discovery lowest, Launch at the top), a phase's milestones, a milestone's
     sprints, a sprint's events and a plan's actions, each earliest lowest; each heading sits at the foot of what it holds, as its
     root, so going forward in time is scrolling up. The numbers keep following the order of time; the page still opens on Now.
     The Context view reads the same way. */
  function buFix() {
    var L = document.getElementById('v13list'); if (!L || !L.firstElementChild || L.querySelector('[data-bu]')) return;
    var rev = function (c) {
      var kids = [].slice.call(c.children), keep = kids.filter(function (k) { return k.classList.contains('v13unhide'); }).concat([]);
      kids.filter(function (k) { return keep.indexOf(k) < 0; }).reverse().forEach(function (k) { c.appendChild(k); });
      keep.forEach(function (k) { c.insertBefore(k, c.firstChild); });
      kids.filter(function (k) { return k.classList.contains('v13end'); }).forEach(function (k) { c.appendChild(k); });   /* the list's foot stays at the foot */
    };
    [].slice.call(L.querySelectorAll('.v13body, ol.v12plan')).forEach(rev);
    rev(L);
    [].slice.call(L.querySelectorAll('.v13phase, .v13ms, .v13sp, .v13step')).forEach(function (s) {
      var h = s.querySelector(':scope > button'), b = s.querySelector(':scope > .v13body, :scope > .v13acts, :scope > .v12work');
      if (h && b) { s.appendChild(h); s.classList.add('bu-root'); }
    });
    L.classList.add('bu-on');
    if (L.firstElementChild) L.firstElementChild.dataset.bu = '1';
  }
  var buObs = new MutationObserver(function () { buFix(); });
  var _renderProjectBu = renderProject;
  renderProject = function () { var r = _renderProjectBu.apply(this, arguments); buFix(); var L = document.getElementById('v13list'); if (L) { buObs.disconnect(); buObs.observe(L, { childList: true }); } return r; };
  /* the Context view reads bottom up too */
  if (typeof cxHTML === 'function') {
    var _cxHTMLBu = cxHTML;
    cxHTML = function () {
      var h = _cxHTMLBu.apply(this, arguments), a = h.indexOf('<ol class="cx-list">') + 20, z = h.lastIndexOf('</ol>');
      var rows = h.slice(a, z).match(/<li[\s\S]*?<\/li>/g) || [];
      var n = rows.length; rows = rows.reverse().map(function (r, j) { return r.replace(/--i:\d+/, "--i:" + (n - 1 - j)); });
      return h.slice(0, a) + rows.join('') + h.slice(z);
    };
  }
