const { chromium } = require('playwright');
const fs = require('fs');
const A = process.env.PHOSPHOR_ASSETS + '/';
const ICON = { tl: 'path', wd: 'squares-four', om: 'tree-structure', ml: 'flask', pf: 'briefcase' };
const svg = (w, n) => fs.readFileSync(A + w + '/' + n + (w === 'fill' ? '-fill' : '') + '.svg', 'utf8').replace('<svg', '<svg class="pi" aria-hidden="true" width="22" height="22" fill="currentColor"');
const icons = {}; for (const [k, n] of Object.entries(ICON)) icons[k] = { off: svg('regular', n), on: svg('fill', n) };
const OPTS = ['now', 'iconname', 'icononly'];
(async () => {
  const b = await chromium.launch();
  for (const theme of ['light', 'dark']) for (const opt of OPTS) {
    const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, colorScheme: theme });
    await p.goto('file:///home/user/Service-Desk/docs/design/mockups/timeline-v9-craft.html'); await p.waitForTimeout(800);
    await p.click('[data-proj="tl"]'); await p.waitForTimeout(2000);
    await p.addStyleTag({ content: 'html,body{scroll-behavior:auto!important} .chip .pi{flex:none;width:22px;height:22px} .chips.io{padding-top:8px;margin-top:-8px} .chips.io .chip{min-width:56px;justify-content:center} .chips.io .chip:not([aria-pressed="true"]) .nm{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)} .chip{position:relative;flex:none} .chips.io .chip:not([aria-pressed="true"]) .n{position:absolute;top:-6px;right:-2px;min-width:18px;height:18px;font-size:11px;padding:0 5px;box-shadow:0 0 0 2px var(--ground)}' });
    if (opt !== 'now') await p.evaluate(([icons, opt]) => {
      const c = document.querySelector('.chips'); if (opt === 'icononly') c.classList.add('io');
      c.querySelectorAll('.chip').forEach(ch => { const id = ch.dataset.goto; const on = ch.getAttribute('aria-pressed') === 'true';
        const n = ch.querySelector('.n'); const name = ch.childNodes[0].textContent;
        ch.innerHTML = (on ? icons[id].on : icons[id].off) + '<span class="nm">' + name + '</span>' + (n ? n.outerHTML : ''); ch.setAttribute('aria-label', name); });
    }, [icons, opt]);
    await p.evaluate(() => { document.body.scrollTop = 0; document.documentElement.scrollTop = 0; }); await p.waitForTimeout(400);
    await p.screenshot({ path: `opts/${opt}-${theme}.png`, clip: { x: 0, y: 0, width: 393, height: 420 } });
    await p.close();
  }
  await b.close();
})();
