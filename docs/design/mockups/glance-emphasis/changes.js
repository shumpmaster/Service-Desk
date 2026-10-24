// In-page mockup changes, one per audit proposal (docs/design/audit-2026-10-24.md).
// Each changes only what its proposal names, using the desk's own classes, tokens and icons.
window.__mock = (() => {
  const SVG = {
    bad: '<svg viewBox="0 0 16 16" class="v2-k vi-bad" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"></path></svg>',
    clock: '<svg viewBox="0 0 16 16" class="v2-k vi-clock" aria-hidden="true"><circle cx="8" cy="8" r="6.2"></circle><path d="M8 4.6V8l2.4 1.6"></path></svg>',
    lock: '<svg viewBox="0 0 16 16" class="v2-k vi-lock" aria-hidden="true"><rect x="3.5" y="7" width="9" height="7" rx="1.5"></rect><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"></path></svg>',
  };
  const css = (t) => { const s = document.createElement('style'); s.textContent = t; document.head.appendChild(s); };
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const itemOf = (el) => { const a = el.closest('[data-k], a[href]'); const k = (a && (a.getAttribute('data-k') || a.getAttribute('href'))) || ''; const m = decodeURIComponent(k).match(/([A-Z]{1,3}-\d{3})/); return m ? m[1] : ''; };
  const GATE_Q = { Launch: 'ready to go live?', Build: 'ready to build?', Design: 'ready to design?', Discovery: 'worth starting?' };
  const gateOf = (t) => (t.match(/\b(Launch|Build|Design|Discovery) gate\b/) || [])[1];
  const sinceOf = () => { for (const p of $$('.v2-ln.bad, .v2-bt3.bad, .v2-ql.bad')) { const m = p.textContent.match(/since (\d{1,2}:\d{2}|[^:·]+?\d{1,2}:\d{2})/); if (m) return m[1]; } return ''; };
  return {
    p1() { // stopped project: ink + clock, under the tile's name row
      css('.mk-stall{font:500 12px/1.3 var(--font)!important;color:var(--ink)!important;} .mk-stall > .v2-k{color:var(--ink)!important;}');
      for (const s of $$('.v2-tile .sb-stall')) { if (!s.textContent.trim()) continue; const tile = s.closest('.v2-tile');
        const p = document.createElement('p'); p.className = 'v2-ln mk-stall'; p.innerHTML = SVG.clock + '<span></span>'; p.lastChild.textContent = s.textContent.trim();
        tile.querySelector('.v2-thd').after(p); s.style.display = 'none'; }
    },
    p2() { // one "can't read" treatment everywhere
      css('.mk-bad{color:var(--bad)!important;font-weight:500!important;} .mk-bad > .v2-k, .mk-badi .v2-k{color:var(--bad)!important;}');
      for (const wt of $$('.v2-tile .v2-wt')) { if (!/Can't read/.test(wt.textContent)) continue; const tile = wt.closest('.v2-tile');
        const bad = tile.querySelector('.v2-ln.bad'); const m = bad && bad.textContent.match(/since ([^:]*?\d{1,2}:\d{2})/);
        wt.className = 'v2-wt mk-bad'; wt.innerHTML = SVG.bad + '<span></span>'; wt.lastChild.textContent = "Can't read" + (m ? ' since ' + m[1] : ''); }
      const so = document.querySelector('.v2-brief.k-signed-out');
      if (so) { so.querySelector('.v2-bi').innerHTML = SVG.bad; so.querySelector('.v2-bi').classList.add('mk-badi'); }
      const anyUnread = so || $$('.v2-tile .v2-ln.bad').length;
      for (const p of $$('.v2-home > p.v2-small')) { if (!/^Nothing new since/.test(p.textContent) || !anyUnread) continue;
        const t = sinceOf() || p.textContent.replace(/^Nothing new since /, '');
        p.className = 'v2-ql still bad'; p.innerHTML = SVG.bad + '<span></span>'; p.lastChild.textContent = 'Not read since ' + t; }
    },
    p3() { // the count in the sheet-title role; the due/undo part on its own marked line
      css('.v2-brief .v2-bt1{font:var(--t-sheet)!important;} .mk-due{grid-column:2/4;display:flex;gap:4px;align-items:flex-start;font:500 12px/1.35 var(--font);color:var(--ink);margin-top:2px;} .mk-due > .v2-k{color:var(--ink);flex:none;margin-top:1px;}');
      for (const b2 of $$('.v2-brief .v2-bt2')) { const parts = b2.textContent.split(' · '); const keep = [], due = [];
        for (const x of parts) (/settle|undone|was due/.test(x) ? due : keep).push(x);
        if (!due.length) continue; b2.textContent = keep.join(' · ');
        for (const d of due) { const s = document.createElement('span'); s.className = 'mk-due'; s.innerHTML = (/undone/.test(d) ? SVG.lock : SVG.clock) + '<span></span>';
          s.lastChild.textContent = d.charAt(0).toUpperCase() + d.slice(1); b2.after(s); } }
    },
    p4() { // empty lanes shrink to header + count
      for (const lanes of $$('.v2-lanes')) { const ls = $$(':scope > .v2-lane', lanes);
        const cols = ls.map((l, i) => (i === 0 || l.querySelector('.v2-card') ? 'minmax(0,1fr)' : '64px'));
        lanes.style.gridTemplateColumns = cols.join(' ');
        ls.forEach((l, i) => { if (i && !l.querySelector('.v2-card')) for (const c of l.children) if (!c.matches('.v2-lh')) c.style.display = 'none'; }); }
    },
    p5() { // short gate titles (placeholder words: the Definer picks the line from the record)
      for (const c of $$('.v2-card.gate')) { const kd = c.querySelector('.v2-kd').textContent; const g = (kd.match(/Gate · (\w+)/) || [])[1];
        const tt = c.querySelector('.v2-tt'); const it = itemOf(tt); if (g && GATE_Q[g]) { tt.textContent = `${it}: ${GATE_Q[g]}`; tt.classList.remove('over'); } }
      for (const st of $$('.v2-sheet .v2-stt')) { const full = st.textContent; const g = gateOf(full); if (!g) continue;
        const it = (document.querySelector('.v2-sheet .v2-mono').textContent.match(/([A-Z]-\d{3})/) || [])[1] || '';
        st.textContent = `${g} gate · ${it}: ${GATE_Q[g]}`; st.classList.remove('over');
        const fold = st.closest('.v2-blk').querySelector('.v2-fold'); if (fold) fold.style.display = 'none';
        const lead = document.createElement('p'); lead.className = 'v2-lead mk-lead';
        lead.textContent = full.replace(/^\w+ gate:\s*/, '');
        css('.mk-lead{margin:8px 0 0;max-height:calc(3*1.45em);overflow:hidden;-webkit-mask-image:linear-gradient(#000 55%,transparent);mask-image:linear-gradient(#000 55%,transparent);}');
        st.closest('.v2-shead').after(lead); }
      for (const n of $$('.v2-plli.gate .v2-plname')) { const g = gateOf(n.closest('.v2-plli').textContent); const it = itemOf(n);
        if (g) { n.textContent = `${it}: ${GATE_Q[g]}`; n.classList.remove('over'); } }
    },
    p6() { css('.v2-e1{max-height:calc(2 * 1.45em)!important;}'); },
    p7() { const n = document.querySelector('.v2-nowl'); if (n) window.scrollBy(0, n.getBoundingClientRect().top - Math.round(innerHeight / 3)); },
    p8a() { for (const t of $$('.v2-prow .v2-prtt')) if (/^Nothing waiting on you/.test(t.textContent)) t.classList.add('soft'); },
    p8b() { for (const u of $$('.v2-under')) { const ps = $$(':scope > p.v2-small.gap', u).filter((p) => /ran again.*why it went back: not recorded/.test(p.textContent));
        if (ps.length < 2) continue; const names = ps.map((p) => p.textContent.split(' ran again')[0]);
        ps[0].textContent = names.slice(0, -1).join(', ') + ' and ' + names.at(-1) + ' ran again · why: not recorded'; ps.slice(1).forEach((p) => p.remove()); } },
    p9() { for (const g of $$('.v2-tile .v2-ln > .v2-g')) { const m = g.textContent.match(/^At work: (.+)$/); if (!m || /not available/.test(m[1])) continue;
        const s = document.createElement('span'); s.innerHTML = '<span class="v2-g">At work:</span> '; s.append(m[1]); g.replaceWith(s); } },
    p10() { const p = document.querySelector('.sb-stale'); if (!p) return;
      css('.mk-fail{display:grid;gap:12px;padding-top:8px;} .mk-fail p{margin:0;display:flex;gap:8px;align-items:flex-start;font:var(--t-lead);color:var(--ink);} .mk-fail svg{width:18px;height:18px;flex:none;margin-top:2px;stroke:var(--bad);fill:none;stroke-width:1.6;stroke-linecap:round;} .mk-fail button{min-height:44px;padding:0 20px;border-radius:10px;border:1px solid var(--line2,#d5d7db);background:var(--bg,#fff);color:var(--ink);font:500 15px/1 var(--font);justify-self:start;}');
      const d = document.createElement('div'); d.className = 'mk-fail'; d.innerHTML = '<p>' + SVG.bad + '<span>The desk couldn\'t load.</span></p><button type="button">Reload</button>'; p.replaceWith(d); },
    p11(lookedHoursAgo = 26) { css('.mk-new{font:var(--t-label);color:var(--ink);white-space:nowrap;flex:none;}');
      for (const c of $$('.v2-lane.lane-wait .v2-card')) { const m = (c.querySelector('.v2-m') || {}).textContent || ''; const d = +(m.match(/(\d+) d/) || [0, 0])[1]; const h = +(m.match(/(\d+) h/) || [0, 0])[1];
        if (d * 24 + h < lookedHoursAgo) { const s = document.createElement('span'); s.className = 'mk-new'; s.textContent = 'new'; c.querySelector('.v2-kd').append(s); } } },
  };
})();
