const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  for (const theme of ['light', 'dark']) {
    const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, colorScheme: theme });
    await p.goto('file:///home/user/Service-Desk/docs/design/mockups/timeline-v12-craft.html'); await p.waitForTimeout(1200);
    await p.click('[data-proj="tl"]'); await p.waitForTimeout(2500);
    await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().top > 600).forEach(t => t.style.visibility = 'hidden'));
    // from the Design phase heading down through M6's sprint header and first events
    const y = await p.evaluate(() => { const h = [...document.querySelectorAll('.phname')].find(e => /Design/.test(e.textContent)); return h.getBoundingClientRect().top + window.scrollY; });
    await p.screenshot({ path: `${out}/now-${theme}.png`, fullPage: true, clip: { x: 0, y: y - 16, width: 393, height: 640 } });
    await p.close();
  }
  await b.close();
})();
