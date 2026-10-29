// Chromium captures of VT3 of M3B (spec S-001, AC25's third part and J5 as changed for M3B, AC82 changed; the stage's row),
// `vt3-` named, at 360 × 740 and 414 × 896, light and dark, for the stage's pull request. Not a test: run by hand,
// `node tests/desk/tools/vt3-shots.mjs <out dir> [name prefix]` (Playwright and its Chromium as installed in the session).
//
// The page is the desk's own code (src/public/), served as it deploys, started with each state's config, its function calls
// answered by tests/desk/fake-desk.mjs from the state's in-memory repositories (tests/desk/vt3-fixtures.mjs: Service-Desk's
// records, real; the launch days, the cards, the device's notes and the portfolio made up, NOT real, labelled so in
// tests/desk/fixtures/README.md), the notes put in the page's localStorage before it loads. The page's clock is
// Playwright's, set to the state's time. Home's captures have its weekly line in the middle of the screen; the sheet's are
// as the line's tap leaves it, scrolled to "Your weekly figures", with a `-full` one as tall as the whole sheet. Each line
// printed says whether the page or the sheet scrolls sideways (it must not), the line's words and the block's.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fakeServer } from '../fake-desk.mjs';
import { vt3State, notesOf, J5_WEEK, EIGHT, weeksOfWindows, MON16, METRICS_KEY } from '../vt3-fixtures.mjs';

const PUBLIC = resolve(fileURLToPath(new URL('../../../src/public/', import.meta.url)));
const OUT = resolve(process.argv[2] || 'vt3-shots');
const ONLY = process.argv[3] || '';
const SIZES = [[360, 740], [414, 896]];
const THEMES = ['light', 'dark'];
const WEEKLY = '#/p/Service-Desk/values/weekly';
const ONE = () => notesOf({ ...J5_WEEK });
const EIGHT_NOTES = () => notesOf({ from: '2026-09-21', windows: weeksOfWindows(EIGHT) });

/** Each capture: its name, the state, the notes, the screen, and whether storage throws. */
const SHOTS = [
  { name: 'vt3-home-one-week', state: () => vt3State(), notes: ONE, hash: '#/', home: true },
  { name: 'vt3-home-eight-weeks-six-before-launch', state: () => vt3State({ launch: '2026-11-04' }), notes: EIGHT_NOTES, hash: '#/', home: true },
  { name: 'vt3-sheet-weekly-one-week', state: () => vt3State(), notes: ONE, hash: WEEKLY, tap: true },
  { name: 'vt3-sheet-weekly-eight-weeks-trial-grouped', state: () => vt3State({ launch: '2026-11-04' }), notes: EIGHT_NOTES, hash: WEEKLY, tap: true },
  { name: 'vt3-sheet-weekly-before-launch-all-trial', state: () => vt3State({ launch: null }), notes: EIGHT_NOTES, hash: WEEKLY, tap: true },
  { name: 'vt3-sheet-weekly-copy-past-linkcap', state: () => vt3State({ launch: '2026-11-04', linkCap: 200 }), notes: ONE, hash: WEEKLY, tap: true },
  { name: 'vt3-home-storage-throwing-no-line', state: () => vt3State(), notes: ONE, hash: '#/', home: true, blocked: true },
  { name: 'vt3-sheet-storage-throwing-no-block', state: () => vt3State(), notes: ONE, hash: '#/p/Service-Desk/values', blocked: true },
];

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };
const SHELL = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Service Desk</title><link rel="stylesheet" href="style.css"></head><body>
<header id="top" hidden><a class="brand" href="#/">Service Desk</a><p id="screen-state" role="status">Checking…</p></header>
<main id="view"><p>Checking…</p></main><footer id="foot" hidden></footer>
<script type="module">
const config = await (await fetch('/__config')).json();
const call = async (path, body) => (await fetch('/__call', { method: 'POST', body: JSON.stringify({ path, body }) })).json();
const m = await import('/sandbox.js');
m.startSandbox({ config, call });
</script></body></html>`;

function serve(cur) {
  const srv = createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/' || url.pathname === '/index.html') return res.writeHead(200, { 'content-type': 'text/html' }).end(SHELL);
    if (url.pathname === '/__config') return res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(cur.setup.config));
    if (url.pathname === '/__call') {
      let raw = '';
      req.on('data', (c) => { raw += c; });
      req.on('end', async () => {
        const { path, body } = JSON.parse(raw);
        const r = await cur.server.call(path, body);
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(r));
      });
      return undefined;
    }
    const file = join(PUBLIC, decodeURIComponent(url.pathname));
    if (!file.startsWith(PUBLIC) || !existsSync(file) || !statSync(file).isFile()) return res.writeHead(404).end();
    return res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

async function main() {
  const { chromium } = await import('playwright').catch(() => import(pathToFileURL(join(dirname(process.execPath), '..', 'lib', 'node_modules', 'playwright', 'index.mjs')).href));
  mkdirSync(OUT, { recursive: true });
  const cur = { setup: null, server: null, now: 0 };
  const srv = await serve(cur);
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  const lines = [];
  const fails = [];
  try {
    for (const shot of SHOTS.filter((s) => s.name.startsWith(ONLY))) {
      for (const [w, hgt] of SIZES) {
        for (const theme of THEMES) {
          const setup = shot.state();
          cur.setup = setup;
          cur.now = MON16;
          cur.server = fakeServer(setup.repos, setup.config, { now: () => cur.now });
          const ctx = await browser.newContext({ viewport: { width: w, height: hgt }, deviceScaleFactor: 2, colorScheme: theme });
          await ctx.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch { /* blocked below */ } }, [METRICS_KEY, JSON.stringify(shot.notes())]);
          // Storage that throws (a private window, blocked storage; made up): every read and write of localStorage throws.
          if (shot.blocked) await ctx.addInitScript(() => { for (const k of ['getItem', 'setItem', 'removeItem']) Storage.prototype[k] = () => { throw new Error('blocked (made up)'); }; });
          const page = await ctx.newPage();
          await page.clock.install({ time: MON16 });
          await page.goto(`${base}#/`);
          const run = async (ms, step = 1000) => {
            for (let t = 0; t < ms; t += step) {
              await page.clock.runFor(step);
              cur.now += step;
              await page.waitForTimeout(40);
            }
          };
          await run(3000);
          // Every project and the portfolio read: up to 20 more seconds of the page's clock.
          for (let i = 0; i < 20 && !(await page.evaluate(() => Boolean(document.querySelector('.v2-pf') && !/Checking/.test(document.querySelector('.v2-sub') ? document.querySelector('.v2-sub').textContent : 'Checking')))); i++) await run(1000);
          await run(2000);
          if (shot.tap) {
            const ok = await page.evaluate(() => { const a = document.querySelector('[data-k="home-weekly"]'); if (a) a.click(); return Boolean(a); });
            if (!ok) fails.push(`${shot.name}-${w}x${hgt}-${theme}: no weekly line to tap`);
            await run(2000);
          } else if (shot.hash !== '#/') {
            await page.evaluate((x) => { location.hash = x; }, shot.hash);
            await run(2000);
          }
          if (shot.home) {
            await page.evaluate(() => { const e = document.querySelector('[data-k="home-weekly"]') || document.querySelector('[data-k="home-more-detail"]'); if (e) e.scrollIntoView({ block: 'center' }); });
            await run(500);
          }
          const said = await page.evaluate(() => {
            const line = document.querySelector('[data-k="home-weekly"]');
            const blk = document.querySelector('[data-k="vt-weekly"]');
            const s = document.querySelector('.v2-sheet');
            const weeks = blk ? [...blk.querySelectorAll('a')].map((a) => a.textContent.replace('Save the week of ', '').replace(' ↗', '')).join(', ') : '';
            return `${location.hash} · line: ${line ? `"${line.textContent}"` : 'none'} · block: ${blk ? `${weeks}${blk.querySelector('pre') ? ', Copy' : ''}` : 'none'}${s ? ` · sheet sideways ${s.scrollWidth - s.clientWidth} px` : ''}`;
          });
          const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          if (scroll > 0) fails.push(`${shot.name}-${w}x${hgt}-${theme}: the page scrolls sideways by ${scroll} px`);
          if (/sideways [1-9]/.test(said)) fails.push(`${shot.name}-${w}x${hgt}-${theme}: the sheet scrolls sideways`);
          const file = join(OUT, `${shot.name}-${w}x${hgt}-${theme}.png`);
          await page.screenshot({ path: file });
          lines.push(`${file}  (${said}${scroll > 0 ? `; the page scrolls sideways by ${scroll} px` : ''})`);
          const tall = await page.evaluate(() => { const s = document.querySelector('.v2-sheet'); return s ? s.scrollHeight + 80 : 0; });
          if (tall > hgt) {
            await page.setViewportSize({ width: w, height: tall });
            await run(500);
            const full = join(OUT, `${shot.name}-${w}x${hgt}-${theme}-full.png`);
            await page.screenshot({ path: full });
            lines.push(`${full}  (the whole sheet, the window ${tall} px tall)`);
          }
          await ctx.close();
        }
      }
    }
  } finally {
    await browser.close();
    srv.close();
  }
  for (const l of lines) console.log(l);
  if (fails.length) {
    console.log(`FAIL\n${fails.join('\n')}`);
    process.exitCode = 1;
  }
}

main();
