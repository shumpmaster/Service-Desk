const { chromium } = require('playwright');
const PAGE = 'file:///home/user/Service-Desk/docs/design/mockups/options-motion-lines/playground.html';
const OUT = process.argv[2];
const FR = [0, 70, 140, 210, 280, 350, 440, 700];
(async () => {
  const b = await chromium.launch();
  const errs = [];
  async function page(hash, theme) {
    const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, colorScheme: theme || 'light' });
    p.on('pageerror', e => errs.push(hash + ': ' + e.message));
    await p.goto(PAGE + '#' + hash); await p.waitForTimeout(700);
    await p.addStyleTag({ content: '.optbar{display:none!important}' });
    return p;
  }
  for (const m of ['m1', 'm2', 'm3']) {
    const p = await page(m + '-l1');
    const t0 = Date.now(); p.click('[data-proj="tl"]');
    for (const ms of FR) { while (Date.now() - t0 < ms) await p.waitForTimeout(3); await p.screenshot({ path: `${OUT}/${m}-f${String(ms).padStart(3, '0')}.png` }); }
    await p.close();
  }
  for (const l of ['l0', 'l1', 'l2', 'l3']) for (const th of ['light', 'dark']) {
    const p = await page('m1-' + l, th);
    const pr = await (await p.$('[data-row="tl"]')).boundingBox();
    await p.evaluate(y => window.scrollTo(0, y - 140), pr.y); await p.waitForTimeout(300);
    await p.screenshot({ path: `${OUT}/${l}-${th}-desk.png`, clip: { x: 0, y: 0, width: 393, height: 520 } });
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.click('[data-proj="tl"]'); await p.waitForTimeout(900);
    await p.addStyleTag({ content: 'html,body{scroll-behavior:auto!important}' });
    await p.evaluate(() => { document.body.scrollTop = 0; document.documentElement.scrollTop = 0; }); await p.waitForTimeout(200);
    await p.screenshot({ path: `${OUT}/${l}-${th}-top.png`, clip: { x: 0, y: 0, width: 393, height: 520 } });
    await p.evaluate(() => { const n = document.querySelector('#ptl .pl.now'); n.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(2000);
    await p.screenshot({ path: `${OUT}/${l}-${th}-now.png` });
    await p.close();
  }
  console.log('errors', errs); await b.close();
})();
