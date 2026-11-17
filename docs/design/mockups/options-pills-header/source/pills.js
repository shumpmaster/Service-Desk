  /* Options for the owner's comment on v15 (round 4, answer 13): "The project pills need to be part of the floating header as well."
     A layer over v15 inside its script. PILLS = 'A' | 'B' | 'C'.
     A: the pills as they are, moved into the floating band above the branch map.
     B: slimmer pills in the band (32 high, 14 type), so the band grows less.
     C: one pill for the project you are in, in the band; tapping it opens the others in a short menu. */
  function pillsInto() {
    var band = document.getElementById('v13band'), view = document.getElementById('view'), chips = view && view.querySelector('.chips');
    if (!band || !chips) return;
    var row = document.createElement('div'); row.className = 'pl-row pl-' + PILLS; band.insertBefore(row, band.firstChild);
    if (PILLS === 'C') {
      var cur = chips.querySelector('.chip[aria-pressed="true"]');
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip pl-cur'; b.setAttribute('aria-pressed', 'true'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-haspopup', 'true');
      b.innerHTML = cur.innerHTML + '<svg class="pl-caret" viewBox="0 0 256 256" aria-hidden="true"><path d="M64 96l64 64 64-64" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var menu = document.createElement('div'); menu.className = 'pl-menu'; menu.hidden = true; menu.setAttribute('role', 'menu');
      [].slice.call(chips.querySelectorAll('.chip')).forEach(function (c) { if (c !== cur) { c.setAttribute('role', 'menuitem'); menu.appendChild(c); } });
      b.addEventListener('click', function () { var o = menu.hidden; menu.hidden = !o; b.setAttribute('aria-expanded', String(o)); });
      row.appendChild(b); row.appendChild(menu); chips.remove();
    } else {
      row.appendChild(chips);
    }
  }
  var _renderProjectPl = renderProject;
  renderProject = function () { var r = _renderProjectPl.apply(this, arguments); pillsInto(); return r; };
