  /* ================= v44, round 8 answer 28: a branch toggle in the map's filter. Below the six cuts, "Branches": main and each lane the map
     draws in this phase (each sprint's or pull request's branch, named plainly, its number after), each with a switch. Switching one off
     hides its stations on the map (its name and line go faint) and its rows in the list, the headings keeping a count of what is hidden, as the
     cuts do (v41); "Show all" brings every branch back; the filter button says what is hidden ("2 branches hidden"). The pointer, the arrow and
     the landing carry on. The branch names are examples: no record yet lists each sprint's or pull request's branch. ================= */
  FH.hide = {};
  function brHidden() { return Object.keys(FH.hide).filter(function (k) { return FH.hide[k]; }); }
  function brLanes() {
    var svg = document.querySelector('#v13in svg'); if (!svg) return [];
    var out = [{ num: 'main', name: 'Main', code: 'where merged work lands' }], seen = {};
    [].forEach.call(svg.querySelectorAll('text.lb'), function (t) { var m = /^([\d.]+)\s+(.*)$/.exec(t.textContent.trim()); if (!m || seen[m[1]]) return; seen[m[1]] = 1;
      var code = { 'Second plan': 'S-011', 'First plan': 'S-010', 'Two experiments': 'E1, E2', 'First mockup': 'PR #445', 'Mockups 2 to 4': 'v2 to v4', 'Research: run results': 'Q-028' }[m[2]] || '';
      out.push({ num: m[1], name: m[2], code: m[1] + (code ? ' · ' + code : '') }); });
    return out;
  }
  function brSet() {   /* the stations and rows of every hidden branch */
    var set = {}, info = fhInfo();
    brHidden().forEach(function (num) {
      if (num === 'main') { Object.keys(info).forEach(function (k) { if (info[k].main) set[k] = 1; }); return; }
      var l = fhLane(num); if (l) Object.keys(l.set).forEach(function (k) { set[k] = 1; });
      document.querySelectorAll('#v13list .v13ev[data-k]').forEach(function (e) { var n4 = e.querySelector('.no4'), n = n4 ? (n4.dataset.pwn || n4.textContent) : ''; if (n && (n.trim().indexOf(num + '.') === 0)) set[e.dataset.k] = 1; });
    });
    return set;
  }
  fhApply = function () {
    var info = fhInfo(), p = FH.pick, lane = FH.solo ? fhLane(FH.solo) : null, hid = brHidden(), out = hid.length ? brSet() : {}, on = p !== 'all' || !!lane || hid.length > 0;
    Object.keys(info).forEach(function (k) { var keep = (lane ? !!lane.set[k] : fhMatch(p, info[k])) && !out[k]; info[k].g.classList.toggle('fh-out', on && !keep); info[k].g.classList.toggle('br-off', !!out[k]); });
    document.querySelectorAll('#v13in svg text.lb').forEach(function (t) { t.classList.toggle('fh-solo', !!lane && t === lane.lb); var m = /^([\d.]+)/.exec(t.textContent); t.classList.toggle('br-off', !!(m && FH.hide[m[1]])); });
    document.documentElement.classList.toggle('br-mainoff', !!FH.hide.main);
    document.querySelectorAll('#v13list .v13ev, #v13list .v13step, #v13list .ph-gate').forEach(function (e) {
      var k = e.dataset.k, keep;
      if (!on) keep = true;
      else if (e.classList.contains('ph-gate')) keep = !lane && (p === 'you' || p === 'turn' || (p === 'all' && hid.length > 0));
      else if (k) keep = (lane ? !!lane.set[k] : fhMatch(p, info[k])) && !out[k];
      else if (p === 'all' && !lane) { var pv = e.previousElementSibling; while (pv && !(pv.classList.contains('v13ev') && pv.dataset.k)) pv = pv.previousElementSibling; keep = !(pv && out[pv.dataset.k]); }
      else keep = false;
      e.classList.toggle('fh-out', !keep);
    });
    if (window.__fh41) window.__fh41(on);
    fhUI(info, lane);
  };
  var _fhUIBr = fhUI;
  fhUI = function (info, lane) {
    var b = document.querySelector('#v13band .fh-fbtn'), hid = brHidden();
    if (b && !hid.length && b.__h2) { b.__h = ''; b.__h2 = ''; }
    _fhUIBr(info, lane);
    b = document.querySelector('#v13band .fh-fbtn'); if (!b || !hid.length) return;
    var nm = (FH_PICKS.filter(function (x) { return x.id === FH.pick; })[0] || {}).name, t = (FH.pick !== 'all' ? nm + ' · ' : '') + hid.length + (hid.length === 1 ? ' branch hidden' : ' branches hidden');
    var html = FH_IC.funnel + '<span>' + esc(t) + '</span>' + FH_IC.x;
    if (b.__h2 !== html) { b.innerHTML = html; b.__h2 = html; } b.classList.add('on'); b.setAttribute('aria-label', 'Showing ' + t + '; tap the cross to show everything');
  };
  var _fhPanelFillBr = fhPanelFill;
  fhPanelFill = function (pn, info) {
    _fhPanelFillBr(pn, info);
    var pp = pn.querySelector(':scope > p'); if (pp && /goes faint/.test(pp.textContent)) pp.textContent = 'What is left out is hidden from the list and faint on the map; the pointer and the arrow carry on.';
    var lanes = brLanes(), sig = lanes.map(function (l) { return l.num + (FH.hide[l.num] ? '0' : '1'); }).join(',');
    var sec = pn.querySelector('.br-sec'); if (sec && sec.__sig === sig) return; if (sec) sec.remove();
    sec = document.createElement('div'); sec.className = 'br-sec'; sec.__sig = sig;
    sec.innerHTML = '<h4>Branches <button type="button" class="br-all" data-brall="1">Show all</button></h4><ul class="br-list">' + lanes.map(function (l) {
      var on = !FH.hide[l.num];
      return '<li><span class="br-t"><b>' + esc(l.name) + '</b><span class="pw-code">' + esc(l.code) + '</span></span><button type="button" class="br-sw" role="switch" aria-checked="' + on + '" data-brnum="' + esc(l.num) + '" aria-label="' + esc((on ? 'Hide ' : 'Show ') + l.name) + '"><i></i></button></li>'; }).join('') +
      '</ul><p>A branch is a separate line of work; once merged, it joins main. Switching one off hides it on the map and in the list. <i class="pw-ex">names are examples</i></p>';
    pn.appendChild(sec);
  };
  /* the panel's own taps are taken by v40's listener (it stops them at the window), so the switches act on the press */
  function brAct(t) {
    var sw = t.closest && t.closest('.br-sw'), all = t.closest && t.closest('.br-all'); if (!sw && !all) return false;
    if (all) FH.hide = {}; else FH.hide[sw.dataset.brnum] = !FH.hide[sw.dataset.brnum];
    fhApply(); var pn = document.querySelector('.fh-panel'); if (pn) fhPanelFill(pn, fhInfo()); return true;
  }
  window.addEventListener('pointerdown', function (e) { if (e.button === 0 && brAct(e.target)) { e.preventDefault(); } }, true);
  window.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && brAct(e.target)) e.preventDefault(); }, true);
  /* the button's cross and "Everything" clear the branches too */
  var _fhPickBr = fhPick;
  fhPick = function (p) { if (p === 'all') FH.hide = {}; return _fhPickBr(p); };
