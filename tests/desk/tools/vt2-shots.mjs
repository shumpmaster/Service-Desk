// Chromium captures of VT2 of M3B (spec S-001, AC25's first two parts as changed for M3B; the stage's row), `vt2-` named, at
// 360 × 740 and 414 × 896, light and dark, for the stage's pull request. Not a test: run by hand,
// `node tests/desk/tools/vt2-shots.mjs <out dir> [name prefix]` (Playwright and its Chromium as installed in the session).
//
// The page is the desk's own code (src/public/), served as it deploys, started with each state's config, its function calls
// answered by tests/desk/fake-desk.mjs from the state's in-memory repositories (tests/desk/vt2-fixtures.mjs: every kind of
// waiting item in made-up projects, a pull request being recorded, and Service-Desk's targets' sheet before launch on its
// records at 77bfeae with section 6 at 7b69b2b, real; the rest made up, NOT real, labelled so in tests/desk/fixtures/README.md).
// The page's clock is Playwright's, set to the state's time. Each sheet's capture is the sheet scrolled to its end, where
// "Didn't need me" is its last line, and a `-full` one with the window as tall as the whole sheet; the targets' sheet's is its
// first screen. Each line printed says whether the page or the sheet scrolls sideways (it must not), the sheet's last two
// lines, and the control's height.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fakeServer } from '../fake-desk.mjs';
import { NOW, KEYS, REC_KEY, REC_NOW, TARGETS_NOW, everyKind, recordingState, targetsState, withHeld, HELD_KEY } from '../vt2-fixtures.mjs';

const PUBLIC = resolve(fileURLToPath(new URL('../../../src/public/', import.meta.url)));
const OUT = resolve(process.argv[2] || 'vt2-shots');
const ONLY = process.argv[3] || '';
const SIZES = [[360, 740], [414, 896]];
const THEMES = ['light', 'dark'];
const at = (key) => `#/waiting/card/${encodeURIComponent(key)}`;
const KINDS = ['card', 'question', 'gate', 'pr', 'deploy', 'hold', 'merge', 'missing'];

/** Each capture: its name, the state, its clock, the sheet's key, the steps on the page before it, and whether storage throws. */
const SHOTS = [
  ...KINDS.flatMap((k) => [
    { name: `vt2-${k}-sheet`, state: () => everyKind(), now: NOW, key: KEYS[k] },
    { name: `vt2-${k}-sheet-marked`, state: () => everyKind(), now: NOW, key: KEYS[k], steps: ['mark'] },
  ]),
  { name: 'vt2-confirming-sheet-marked', state: () => everyKind(), now: NOW, key: KEYS.card, steps: ['mark', 'done', 'reopen'] },
  { name: 'vt2-kicked-back-sheet-marked', state: () => everyKind(), now: NOW, key: KEYS.card, steps: ['mark', 'done', 'kick', 'reopen'] },
  { name: 'vt2-question-confirming-sheet', state: () => everyKind(), now: NOW, key: KEYS.question, steps: ['move', 'reopen'] },
  // VT2's round 2 (the Reviewer's N3): a gate's confirming and kicked-back sheets, and a question's kicked-back sheet, each marked.
  { name: 'vt2-gate-confirming-sheet-marked', state: () => everyKind(), now: NOW, key: KEYS.gate, steps: ['mark', 'move', 'reopen'] },
  { name: 'vt2-gate-kicked-back-sheet-marked', state: () => everyKind(), now: NOW, key: KEYS.gate, steps: ['mark', 'move', 'kick', 'reopen'] },
  { name: 'vt2-question-kicked-back-sheet-marked', state: () => everyKind(), now: NOW, key: KEYS.question, steps: ['mark', 'move', 'kick', 'reopen'] },
  { name: 'vt2-no-longer-waiting-sheet-marked', state: () => everyKind(), now: NOW, key: KEYS.hold, steps: ['mark', 'gone'] },
  { name: 'vt2-being-recorded-sheet', state: () => recordingState(), now: REC_NOW, key: REC_KEY, steps: ['recorded'] },
  { name: 'vt2-portfolio-sheet-no-control', state: () => everyKind(), now: NOW, key: KEYS.portfolio },
  { name: 'vt2-held-question-sheet-no-control', state: () => withHeld(everyKind()), now: NOW, key: HELD_KEY },
  { name: 'vt2-targets-sheet-not-noted', state: () => targetsState(), now: TARGETS_NOW, hash: '#/p/Service-Desk/values', blocked: true },
  { name: 'vt2-card-sheet-storage-throwing', state: () => everyKind(), now: NOW, key: KEYS.card, blocked: true },
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
          cur.now = shot.now;
          cur.server = fakeServer(setup.repos, setup.config, { now: () => cur.now });
          const ctx = await browser.newContext({ viewport: { width: w, height: hgt }, deviceScaleFactor: 2, colorScheme: theme });
          // Storage that throws (a private window, blocked storage; made up): every read and write of localStorage throws.
          if (shot.blocked) await ctx.addInitScript(() => { for (const k of ['getItem', 'setItem', 'removeItem']) Storage.prototype[k] = () => { throw new Error('blocked (made up)'); }; });
          const page = await ctx.newPage();
          await page.clock.install({ time: shot.now });
          await page.goto(base + '#/waiting');
          const run = async (ms, step = 1000) => {
            for (let t = 0; t < ms; t += step) {
              await page.clock.runFor(step);
              cur.now += step;
              await page.waitForTimeout(40);
            }
          };
          await run(3000);
          const go = async (h) => { await page.evaluate((x) => { location.hash = x; }, h); await run(1000); };
          const hash = shot.hash || at(shot.key);
          await go(hash);
          // The first read in (the board drawn under the sheet): up to 20 more seconds of the page's clock.
          for (let i = 0; i < 20 && !(await page.evaluate(() => Boolean(document.querySelector('.v2-sheet') && document.querySelector('.v2-badge')))); i++) await run(1000);
          await run(1000);
          const click = async (sel, text) => {
            const ok = await page.evaluate(([s, t]) => { const b = [...document.querySelectorAll(s)].find((x) => x.textContent.includes(t)); if (b) b.click(); return Boolean(b); }, [sel, text]);
            if (!ok) fails.push(`${shot.name}-${w}x${hgt}-${theme}: no "${text}" to tap`);
            await run(1000);
          };
          for (const step of shot.steps || []) {
            if (step === 'mark') await click('.v2-sheet .v2-dnmb', "Didn't need me");
            if (step === 'done') await click('.v2-sheet .v2-acts button', 'Done ✓');
            if (step === 'move') await click('.v2-sheet button', 'Move to Done');
            if (step === 'kick') { await go('#/waiting'); await run(8 * 60_000, 5000); }
            if (step === 'reopen') await go(hash);
            if (step === 'gone') { setup.repos.Alpha.commit({ 'queue/ci-hold-4a2448939173.md': null }); await run(62_000, 2000); }
            if (step === 'recorded') await run(4 * 60_000, 5000);
          }
          const said = await page.evaluate(() => {
            const s = document.querySelector('.v2-sheet');
            if (!s) return 'no sheet';
            s.scrollTop = s.scrollHeight;
            const parts = [...s.children].filter((c) => !c.classList.contains('v2-grab'));
            const last2 = parts.slice(-2).map((p) => `"${p.textContent.trim().slice(0, 48)}"`).join(' / ');
            const d = s.querySelector('.v2-dnm');
            const b = d && d.querySelector('button');
            const nn = [...s.querySelectorAll('p')].find((p) => p.textContent === 'Not noted on this device');
            return `last: ${last2}${d ? ` · control ${Math.round(d.getBoundingClientRect().height)} px, its button ${Math.round(b.getBoundingClientRect().height)} px` : ' · no control'}${nn ? ' · "Not noted on this device"' : ''} · sideways ${s.scrollWidth - s.clientWidth} px`;
          });
          await run(300);
          const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          if (scroll > 0) fails.push(`${shot.name}-${w}x${hgt}-${theme}: the page scrolls sideways by ${scroll} px`);
          if (/sideways [1-9]/.test(said)) fails.push(`${shot.name}-${w}x${hgt}-${theme}: the sheet scrolls sideways`);
          if (shot.hash) await page.evaluate(() => { const s = document.querySelector('.v2-sheet'); if (s) s.scrollTop = 0; });
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
