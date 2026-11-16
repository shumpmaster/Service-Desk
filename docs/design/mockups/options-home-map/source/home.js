// Draws option A, B or C over v13's home page. window.HM_OPT = 'A' | 'B' | 'C'.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var needIcons = [].map.call(document.querySelectorAll('section.needs .need .ico svg'), function (s) { return s.outerHTML; });
  // the needs rows' icons, in order: 0 stop (S-011), 1-3 questions, 4 flag (widget readiness)
  var ICON = { stop: needIcons[0], q: needIcons[1], flag: needIcons[4] };
  // days back from now (0 = now); kinds: '' done, bad, wait, ok
  var P = {
    tl:  { short: 'The timeline', ev: [[13.5,''],[12,''],[11,''],[9.5,''],[8,''],[6.5,''],[5,''],[3.2,''],[2,''],[1.2,''],[.5,''],[.25,''],[.11,'wait','q'],[.07,'bad','stop']], tag: ['bad', 'Stopped · your call'], br: [[9,5],[4.5,0]] },
    hw:  { short: 'Home-screen widget', ev: [[14,''],[13,''],[12.2,'bad','flag']], tag: ['bad', 'Failed · your call'], br: [] },
    om:  { short: 'operating model', ev: [[13,''],[11.5,''],[10,''],[7,''],[6,''],[4,''],[2.5,''],[1.4,'ok']], tag: null, br: [[7,4]] },
    ml:  { short: 'Model-Lab', ev: [[12,''],[9,''],[6,''],[3,''],[.8,''],[.6,''],[.45,''],[.3,'']], tag: null, br: [[3,.3]] },
    pf:  { short: 'portfolio', ev: [[13,''],[8.5,''],[4.2,'']], tag: null, br: [] }
  };
  var ids = [].map.call(document.querySelectorAll('.desk .proj'), function (e) { return e.dataset.row; });
  var order = ['tl', 'hw', 'om', 'ml', 'pf'];
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function lane(svg, d, y, x0, x1, label, iconsOn) {
    var X = function (t) { return x1 - Math.sqrt(t / 14) * (x1 - x0); };   // time stretched toward Now
    el('path', { class: 'hm-g main', d: 'M' + x0 + ' ' + y + 'H' + x1 }, svg);
    d.br.forEach(function (b) { var a = X(b[0]), c = X(b[1]), yy = y - 9;
      el('path', { class: 'hm-g', d: 'M' + a + ' ' + y + 'C' + (a + 6) + ' ' + y + ' ' + (a + 4) + ' ' + yy + ' ' + (a + 12) + ' ' + yy + 'H' + (c - 12) + 'C' + (c - 4) + ' ' + yy + ' ' + (c - 6) + ' ' + y + ' ' + c + ' ' + y }, svg); });
    if (label) el('text', { class: 'hm-lb', x: x0, y: y - 12 }, svg).textContent = label;
    var lastIc = 1e9, icons = [];
    d.ev.slice().sort(function (a, b) { return a[0] - b[0]; }).forEach(function (e) {
      var x = X(e[0]);
      if (iconsOn && e[2]) { x = Math.min(x, lastIc - 21, x1 - 13); lastIc = x; icons.push([x, e]); }
      else el('circle', { class: 'hm-dot ' + e[1], cx: x, cy: y, r: e[1] ? 4 : 3 }, svg);
    });
    icons.forEach(function (ic) { var x = ic[0], e = ic[1];   // icons over the dots
      (window.HM_ICONS = window.HM_ICONS || []).push({ p: d.id, k: e[2], st: e[1], x: x, y: y });
      if (window.HM_POP) return;   // the live options draw these as pop-ups instead
      el('circle', { class: 'hm-disc ' + e[1], cx: x, cy: y, r: 9.5 }, svg);
      var f = el('foreignObject', { x: x - 6.5, y: y - 6.5, width: 13, height: 13 }, svg);
      f.innerHTML = '<div xmlns="http://www.w3.org/1999/xhtml" class="hm-ic ' + e[1] + '" style="width:13px;height:13px;display:grid;place-items:center">' + ICON[e[2]].replace('<svg', '<svg width="13" height="13"') + '</div>';
    });
  }
  var opt = window.HM_OPT;
  if (opt === 'A') {
    document.querySelectorAll('.desk .proj').forEach(function (pr, i) {
      var d = P[order[i]], card = pr.querySelector('.pcard'), what = card.querySelector('.p-what');
      var w = 280, s = document.createElement('span'); s.className = 'hm-strip';
      var svg = el('svg', { width: w, height: 26, viewBox: '0 0 ' + w + ' 26' }); s.appendChild(svg);
      lane(svg, d, 16, 6, w - 8, '', true);
      el('circle', { class: 'hm-now', cx: w - 8, cy: 16, r: 3 }, svg);
      what.replaceWith(s);
      if (d.tag) { var t = document.createElement('span'); t.className = 'hm-tagrow'; t.innerHTML = '<span class="hm-tag ' + d.tag[0] + '">' + d.tag[1] + '</span>'; s.after(t); }
    });
  }
  if (opt === 'B') {
    var band = document.createElement('div'); band.className = 'hm-band';
    var W = 393, x0 = 16, x1 = W - 22, top = 26, gap = window.HM_POP ? 34 : 30, H = top + gap * 5 + 2;
    var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }); band.appendChild(svg);
    el('line', { class: 'hm-nowline', x1: x1, y1: 4, x2: x1, y2: H - 4 }, svg);
    [[14, '2 Nov'], [7, '9 Nov'], [1, 'yesterday'], [0, 'now']].forEach(function (a) { var x = x1 - Math.sqrt(a[0] / 14) * (x1 - x0);
      el('text', { class: 'hm-ax', x: x, y: 12, 'text-anchor': a[0] === 14 ? 'start' : a[0] ? 'middle' : 'end' }, svg).textContent = a[1]; });
    order.forEach(function (id, i) { P[id].id = id; lane(svg, P[id], top + 18 + i * gap, x0, x1, P[id].short, true); el('circle', { class: 'hm-now', cx: x1, cy: top + 18 + i * gap, r: 3 }, svg); });
    var needs = document.querySelector('section.needs'); needs.parentNode.insertBefore(band, needs);
    document.querySelectorAll('.desk .p-what').forEach(function (w) { w.style.display = 'none'; });
  }
  if (opt === 'C') {
    var PH = { tl: [['ok', 38, 'Discovery'], ['wait', 14, 'Design', 1], ['', 0, 'Build'], ['', 0, 'Launch']],
               hw: [['bad', 60, 'Discovery', 1], ['', 0, 'Design'], ['', 0, 'Build'], ['', 0, 'Launch']],
               om: [['ok', 100, 'Shape'], ['ok', 100, 'Build'], ['ok', 70, 'Run', 1]],
               ml: [['ok', 100, 'Setup'], ['ok', 55, 'Experiments', 1], ['', 0, 'Report']],
               pf: [['ok', 100, 'Draft'], ['', 0, 'Publish']] };
    document.querySelectorAll('.desk .proj').forEach(function (pr, i) {
      var id = order[i], card = pr.querySelector('.pcard'), what = card.querySelector('.p-what');
      var row = document.createElement('span'); row.className = 'hm-ph';
      row.innerHTML = PH[id].map(function (p, j) {
        var r = 13.25, c = 2 * Math.PI * r, arc = p[1] ? '<circle class="arc" cx="17" cy="17" r="' + r + '" stroke-dasharray="' + (c * p[1] / 100) + ' ' + c + '" transform="rotate(-90 17 17)"></circle>' : '';
        return '<span class="v13ph' + (p[3] ? ' cur' : '') + '"><span class="v13g ' + (p[0] || 'none') + '"><svg viewBox="0 0 34 34"><circle class="trk" cx="17" cy="17" r="' + r + '"></circle>' + arc + '</svg><span class="in"><span class="pn">' + (j + 1) + '</span></span></span><span class="nm">' + p[2] + '</span></span>';
      }).join('');
      what.replaceWith(row);
      if (id !== 'tl' && id !== 'hw') { var ex = document.createElement('span'); ex.className = 'hm-ex'; ex.textContent = 'phases are an example: no plan on record in this mockup'; row.after(ex); }
    });
  }
})();
