// Round-2 mock: one function per idea. Stand-in words where noted; everything else from the page's own DOM.
window.__mock2 = (() => {
  const css = (t) => { const s = document.createElement('style'); s.textContent = t; document.head.appendChild(s); };
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const TRI_R = 'clip-path:polygon(0 0,100% 50%,0 100%);background:var(--ink);';
  const TRI_D = 'clip-path:polygon(0 0,100% 0,50% 100%);background:var(--ink);';
  return {
    q1() { // status palette: --ok on finished/verified marks, --bad on failed marks; words unchanged
      css(`.v2 .v2-s.st-check{color:var(--ok)!important} .v2 .v2-s.st-cross{color:var(--bad)!important} .v2 .v2-smk{color:var(--bad)!important} .mk-okm{color:var(--ok);font-weight:600}`);
      for (const s of $$('.v2-stats .sb-mkw, .v2-stats .sb-mkw > summary')) for (const n of [...s.childNodes]) if (n.nodeType === 3 && n.textContent.includes('✓')) { const sp = document.createElement('span'); sp.className = 'mk-okm'; sp.textContent = '✓'; const rest = document.createTextNode(n.textContent.replace('✓', '')); n.replaceWith(sp, rest); }
    },
    q2() { // one anchor per screen: --bg2 fill + 1px --line2 outline, radius 12, padding 12
      css(`.mk-anchor{display:grid;gap:6px;padding:12px;border-radius:12px;background:var(--bg2)}`);
      const lead = document.querySelector('.v2-proj .v2-lead, .sb-screen .v2-lead'); const strip = document.querySelector('.v2-strip');
      if (lead && strip && lead.nextElementSibling === strip) { const d = document.createElement('div'); d.className = 'mk-anchor'; lead.before(d); d.append(lead); if (window.__tally) { const p = document.createElement('p'); p.className = 'v2-small mk-tally'; p.innerHTML = window.__tally; d.append(p); } }
    },
    q3() { // "you are here": a small filled ink triangle pointing at the present, right on vertical drawings, down on horizontal ones
      css(`.v2-nowl::before{width:8px!important;height:10px!important;margin-left:4px;${TRI_R}}
        .v2-ph.now{position:relative} .v2-ph.now::before{content:"";position:absolute;top:-9px;left:50%;margin-left:-5px;width:10px;height:6px;${TRI_D}}
        .mk-here{position:absolute;width:6px;height:8px;${TRI_R}z-index:2}
        .v2-arrow{display:none!important}`);
      for (const c of $$('.v2-tile .v2-c.s-now')) { const a = document.createElement('span'); a.className = 'mk-here'; a.style.cssText = 'right:calc(50% + 10px);top:50%;margin-top:-4px;'; c.append(a); }
      for (const r of $$('.v2-plrow')) if (r.querySelector('.st-next')) { r.style.position = 'relative'; const a = document.createElement('span'); a.className = 'mk-here'; a.style.cssText = 'left:-12px;top:14px;'; r.append(a); }
      for (const r of $$('.v2-stdl .v2-sm')) if (r.querySelector('.st-next')) { r.style.position = 'relative'; const a = document.createElement('span'); a.className = 'mk-here'; a.style.cssText = 'left:-19px;top:10px;'; r.append(a); }
    },
    q4(tally) { // counts across all milestones (stand-in words given by the capture, per fixture)
      for (const li of $$('.v2-std > li')) { const ph = li.getAttribute('data-phase'); const t = tally[ph]; if (!t) continue; const sd = li.querySelector('.v2-sd');
        sd.innerHTML = t; }
      const h = document.querySelector('.v2-sh .v2-shw'); if (h && tally.head) h.textContent = tally.head;
    },
    q5() { // the standard checklist set apart: labelled groups, a rule, the unused ones folded to one line
      css(`.v2-subh.mk-g{font:500 11px/1.35 var(--font)!important;color:var(--ink)!important;padding-top:10px} .v2-subh.mk-std{margin-top:8px;border-top:1px solid var(--line);} .mk-out{display:grid;grid-template-columns:16px minmax(0,1fr) 10px;gap:8px;align-items:center;min-height:32px;font:var(--t-small);color:var(--ink2)} .mk-stdtag{font:var(--t-mono);color:var(--ink2)}`);
      for (const s of $$('.v2-subh')) { if (/^Yours$/.test(s.textContent)) { const n = s.nextElementSibling.children.length; s.textContent = `Your milestones · ${n}`; s.classList.add('mk-g'); }
        else if (/standard/.test(s.textContent)) { const ol = s.nextElementSibling; const rows = [...ol.children]; const out = rows.filter((r) => /not recorded yet|no record for this/.test(r.textContent));
          const nr = out.filter((r) => /not recorded yet/.test(r.textContent)).length, nm = out.length - nr; const inUse = rows.length - out.length;
          s.textContent = `Standard checklist · ${rows.length} · ${inUse ? inUse + ' tracked' : 'none tracked this run'}`; s.classList.add('mk-g', 'mk-std');
          if (out.length) { out.forEach((r) => r.remove()); const li = document.createElement('li'); li.className = 'mk-out';
            li.innerHTML = `<svg viewBox="0 0 16 16" class="v2-s soft" style="color:var(--ink2)"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.2 2"/></svg><span>${out.length} not tracked this run: ${[nr ? nr + ' not recorded yet' : null, nm ? nm + ' no record in the model' : null].filter(Boolean).join(', ')}</span><svg viewBox="0 0 10 10" width="10" height="10"><path d="M3.5 2l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`; ol.append(li); } } }
      for (const m of $$('.v2-ms[data-ms]')) { const c = m.getAttribute('data-ms'); if (!/^(Discovery|Design|Build|Launch)-\d$/.test(c)) continue; const meta = m.querySelector('.v2-msm'); meta.textContent = meta.textContent.replace(c, `${c} · standard`); }
      for (const g of $$('.v2-gather .v2-fold')) g.textContent = g.textContent.replace(/^(\d+) standard (\w+) milestones? · (.*)$/, 'Standard checklist · $1 $3');
    },
  };
})();
