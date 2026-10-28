// Chromium captures of VT1 of M3B (spec S-001, AC97; the stage's row: "Chromium captures at 360 × 740 and 414 × 896, light
// and dark, `vt1-` named"), for the stage's pull request. Not a test: run by hand,
// `node tests/desk/tools/vt1-shots.mjs <out dir> [name prefix]` (Playwright and its Chromium as installed in the session).
//
// The page is the desk's own code (src/public/), served as it deploys, started with each state's config, its function calls
// answered by tests/desk/fake-desk.mjs from the state's in-memory repositories (tests/desk/vt1-fixtures.mjs: Service-Desk's
// records at 77bfeae with section 3 and 6 at 7b69b2b, real; the launch, the J25 lines, the cards and Alpha made up, NOT real,
// labelled so in tests/desk/fixtures/README.md). The page's clock is Playwright's, set to the state's time. Each capture's
// file names its state, width and theme: a row's capture is the first screen with the "Value targets" row in its middle; a
// sheet's is its first screen, and a `-full` one at the same width with the window as tall as the whole sheet. Each line
// printed says whether the page or the sheet scrolls sideways (it must not), the row's words and marks, and on a sheet the
// stop rule's lines and whether it is cut.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fakeServer } from '../fake-desk.mjs';
import { vt1State, chi, vc, DAY5, FINAL, ALL_MET, FINAL_NOT_MEASURED, windowCards, novemberCards, ALPHA_TARGETS } from '../vt1-fixtures.mjs';

const PUBLIC = resolve(fileURLToPath(new URL('../../../src/public/', import.meta.url)));
const OUT = resolve(process.argv[2] || 'vt1-shots');
const ONLY = process.argv[3] || '';
const SIZES = [[360, 740], [414, 896]];
const THEMES = ['light', 'dark'];
const SD = '#/p/Service-Desk';

const DAY5_IN = DAY5.map((l) => (/"target":"V2"/.test(l) ? l.replace('"value":2', '"value":1').replace('"state":"missed"', '"state":"on track"') : l));
const ALPHA_LINE = vc({ target: 'V1', project: 'Alpha', from: '2026-11-30', to: '2026-12-06', value: 14, figure: '14 signups', state: 'missed' });

/** Each capture: its name, the state, its clock, the screen, what is opened on it, and whether the J25 blob's reads fail. */
const SHOTS = [
  // The row in each of AC97's states, as round 2's row frames draw them.
  { name: 'vt1-row-1-before-launch', state: () => vt1State({ launch: null, nov: novemberCards() }), now: chi('2026-11-27', '15:00'), row: true },
  { name: 'vt1-row-2-launch-day', state: () => vt1State({ nov: novemberCards(), cards: windowCards() }), now: chi('2026-12-02', '15:00'), row: true },
  { name: 'vt1-row-3-day3', state: () => vt1State({ cards: windowCards() }), now: chi('2026-12-05', '15:00'), row: true },
  { name: 'vt1-row-5a-day5-all-within', state: () => vt1State({ lines: DAY5_IN, cards: windowCards() }), now: chi('2026-12-07', '15:00'), row: true },
  { name: 'vt1-row-5b-day5-one-outside', state: () => vt1State({ lines: DAY5, cards: windowCards() }), now: chi('2026-12-07', '15:00'), row: true },
  { name: 'vt1-row-4-day8-no-check', state: () => vt1State({ lines: [], cards: windowCards() }), now: chi('2026-12-10', '15:00'), row: true },
  { name: 'vt1-row-7-over-last-checks-due', state: () => vt1State({ lines: DAY5_IN, cards: windowCards() }), now: chi('2026-12-17', '15:00'), row: true },
  { name: 'vt1-row-6-over-no-check', state: () => vt1State({ lines: [], cards: windowCards() }), now: chi('2026-12-17', '15:00'), row: true },
  { name: 'vt1-row-8a-final-all-met', state: () => vt1State({ lines: ALL_MET, cards: windowCards() }), now: chi('2026-12-24', '15:00'), row: true },
  { name: 'vt1-row-8b-final-one-missed', state: () => vt1State({ lines: FINAL, cards: windowCards() }), now: chi('2026-12-24', '15:00'), row: true },
  { name: 'vt1-row-8c-final-not-measured', state: () => vt1State({ lines: FINAL_NOT_MEASURED, cards: windowCards() }), now: chi('2026-12-24', '15:00'), row: true },
  { name: 'vt1-row-0-checks-unreadable', state: () => vt1State({ lines: DAY5, cards: windowCards() }), now: chi('2026-12-07', '15:00'), row: true, failJ25: true },
  { name: 'vt1-row-alpha-all-met', state: () => vt1State({ lines: ['V1', 'V2', 'V3'].map((id) => vc({ target: id, project: 'Alpha', from: '2026-11-30', to: '2026-12-06', value: null, figure: 'as aimed', state: 'met' })), alpha: ALPHA_TARGETS }), now: chi('2026-12-07', '15:00'), row: true, hash: '#/p/Alpha' },
  { name: 'vt1-row-alpha-no-check', state: () => vt1State({ lines: [], alpha: ALPHA_TARGETS }), now: chi('2026-12-07', '15:00'), row: true, hash: '#/p/Alpha' },
  // The sheet: before launch, on day 5 with one target outside (its whole line opened), after the 14 days with one missed.
  { name: 'vt1-sheet-before-launch', state: () => vt1State({ launch: null, nov: novemberCards() }), now: chi('2026-11-27', '15:00'), sheet: true },
  { name: 'vt1-sheet-launch-week-day3', state: () => vt1State({ cards: windowCards() }), now: chi('2026-12-05', '15:00'), sheet: true },
  { name: 'vt1-sheet-day5-one-outside', state: () => vt1State({ lines: DAY5, cards: windowCards() }), now: chi('2026-12-07', '15:00'), sheet: true, open: ['V2'] },
  { name: 'vt1-sheet-after-14-days-two-not-measured', state: () => vt1State({ lines: FINAL_NOT_MEASURED, cards: windowCards() }), now: chi('2026-12-24', '15:00'), sheet: true },
  { name: 'vt1-sheet-after-14-days-one-missed', state: () => vt1State({ lines: FINAL, cards: windowCards() }), now: chi('2026-12-24', '15:00'), sheet: true },
  { name: 'vt1-sheet-checks-unreadable', state: () => vt1State({ lines: DAY5, cards: windowCards() }), now: chi('2026-12-07', '15:00'), sheet: true, failJ25: true },
  { name: 'vt1-sheet-alpha', state: () => vt1State({ lines: [ALPHA_LINE], alpha: ALPHA_TARGETS }), now: chi('2026-12-07', '15:00'), sheet: true, hash: '#/p/Alpha' },
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
        // The J25 blob's every read failing (made up): its text answered null, as J14's failed read is made.
        if (cur.failJ25 && path === '/api/blobs' && r.json && r.json.blobs) {
          const sha = cur.setup.repos['Service-Desk'].files['intake/value-checks.jsonl'] != null ? cur.j25sha : null;
          if (sha && sha in r.json.blobs) r.json.blobs[sha] = null;
        }
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
  const { gitSha } = await import('../fake-desk.mjs');
  mkdirSync(OUT, { recursive: true });
  const cur = { setup: null, server: null, now: 0, failJ25: false, j25sha: null };
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
          cur.now = shot.now;
          cur.failJ25 = Boolean(shot.failJ25);
          const j25 = setup.repos['Service-Desk'].files['intake/value-checks.jsonl'];
          cur.j25sha = j25 != null ? gitSha(j25) : null;
          cur.server = fakeServer(setup.repos, setup.config, { now: () => cur.now });
          const ctx = await browser.newContext({ viewport: { width: w, height: hgt }, deviceScaleFactor: 2, colorScheme: theme });
          const page = await ctx.newPage();
          await page.clock.install({ time: shot.now });
          const hash = shot.hash || SD;
          await page.goto(base + hash);
          const run = async (ms) => {
            for (let t = 0; t < ms; t += 1000) {
              await page.clock.runFor(1000);
              cur.now += 1000;
              await page.waitForTimeout(20);
            }
          };
          await run(2000 + 60_000);
          let said = '';
          if (shot.row) {
            await page.evaluate(() => { const e = document.querySelector('[data-k="rest:values"]'); if (e) e.scrollIntoView({ block: 'center' }); });
            await run(500);
            said = await page.evaluate(() => {
              const r = document.querySelector('[data-k="rest:values"]');
              if (!r) return 'no row';
              const marks = [...r.querySelectorAll('.v2-vmk')].map((m) => `${m.querySelector('.v2-mono').textContent}:${(m.querySelector('svg') || { getAttribute: () => 'none' }).getAttribute('class').replace(/.*st-(\w+).*/, '$1')}`);
              const icon = r.firstElementChild.tagName === 'svg' ? r.firstElementChild.getAttribute('class').replace(/.*st-(\w+).*/, '$1') : 'none';
              return `row: "${r.querySelector('.v2-small').textContent}" · icon ${icon} · marks ${marks.join(' ')}`;
            });
          }
          if (shot.sheet) {
            await page.evaluate((h) => { location.hash = `${h}/values`; }, hash);
            await run(2000);
            for (const id of shot.open || []) {
              await page.evaluate((t) => { const b = [...document.querySelectorAll(`[data-target="${t}"] button`)].find((x) => x.textContent === 'The whole target'); if (b) b.click(); }, id);
              await run(500);
            }
            said = await page.evaluate(() => {
              const s = document.querySelector('.v2-sheet');
              const q = document.querySelector('.v2-vstop .v2-clip');
              const lh = q ? parseFloat(getComputedStyle(q).lineHeight) : 0;
              const stop = q ? `stop rule ${Math.round(q.getBoundingClientRect().height / lh)} line(s)${q.scrollHeight > q.clientHeight + 1 ? ', cut, "Read it all"' : ', whole'}` : 'no stop rule';
              return `sheet ${s ? s.scrollHeight : 0} px tall · ${stop} · sideways ${s ? s.scrollWidth - s.clientWidth : 0} px`;
            });
          }
          const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          if (scroll > 0) fails.push(`${shot.name}-${w}x${hgt}-${theme}: the page scrolls sideways by ${scroll} px`);
          if (/sideways [1-9]/.test(said)) fails.push(`${shot.name}-${w}x${hgt}-${theme}: the sheet scrolls sideways`);
          const file = join(OUT, `${shot.name}-${w}x${hgt}-${theme}.png`);
          await page.screenshot({ path: file });
          lines.push(`${file}  (${said}${scroll > 0 ? `; the page scrolls sideways by ${scroll} px` : ''})`);
          if (shot.sheet) {
            const tall = await page.evaluate(() => { const s = document.querySelector('.v2-sheet'); return s ? s.scrollHeight + 80 : 0; });
            if (tall > hgt) {
              await page.setViewportSize({ width: w, height: tall });
              await run(500);
              const full = join(OUT, `${shot.name}-${w}x${hgt}-${theme}-full.png`);
              await page.screenshot({ path: full });
              lines.push(`${full}  (the whole sheet, the window ${tall} px tall)`);
            }
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
