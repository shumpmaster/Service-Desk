// Chromium captures of Home on the fixture states of "After the glance audit" (spec S-001, AC91's note; the stage
// table's "Chromium captures at 360 × 740 and 414 × 896, light and dark"), for a stage's pull request. Not a test: run by
// hand, `node tests/desk/tools/glance-shots.mjs <out dir> [name prefix]` (Playwright and its Chromium as installed in the
// session); a name prefix, such as `g2-`, takes only those captures.
//
// The page is the desk's own code (src/public/), served as it deploys, started with each state's config, its function
// calls answered by tests/desk/fake-desk.mjs from the state's in-memory repositories (tests/desk/glance-fixtures.mjs,
// whose made-up parts tests/desk/fixtures/README.md labels NOT real). The page's clock is Playwright's, set to the
// state's time; the fake desk's clock follows it. Each capture's file names its state, width and theme. Each line printed
// says whether the page scrolls sideways (it must not), and, where the Kicked back strip holds cards (G2, AC91 (f)), how
// far its row scrolls sideways inside itself, and, where gate titles are drawn (G3, AC91 (h)), how many lines each takes
// and whether any is cut at its two.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fakeServer } from '../fake-desk.mjs';
import { mixState, unreadState, signedOutState, stallState, extState, quietState, twoMixState, gatesState, deviceMarks, KICKED, CARD, GATE4, GATE5, GATE_KEY, MIX_PROJECT, NOW, STALL_NOW } from '../glance-fixtures.mjs';

const PUBLIC = resolve(fileURLToPath(new URL('../../../src/public/', import.meta.url)));
const OUT = resolve(process.argv[2] || 'glance-shots');
const POLL = 60_000;
const H = 3600e3;
const LATE = Date.parse('2026-10-19T00:00:00Z'); // made up: a "last looked" after the records' last dates, so nothing is new

// The briefing's three lines (made up, NOT real records), as the AC91 test adds them to `mix`'s made-up project.
const Q = (title, rev, def, timeout) => `# Ruling needed: ${title}\n\nWHY: a test.\nOPTIONS:\n  A. Yes.\n  B. No.\nRECOMMENDATION: A — yes.\nRISK CLASS: R0\nREVERSIBILITY: ${rev}\nBLAST RADIUS: none\nDEFAULT: ${def}\nTIMEOUT: ${timeout}\n`;
const THREE = { extra: { 'questions/Alpha-past.md': Q('a made-up question past its time', 'reversible', 'A', '24'), 'questions/Alpha-final.md': Q('a made-up choice that can\'t be undone', 'irreversible', 'none', 'none') },
  raised: { 'questions/Alpha-past.md': Date.parse('2026-10-06T15:00:00Z'), 'questions/Alpha-final.md': NOW - 2 * H } };

/**
 * Each capture: its name, the state, its clock, "last looked", the screen (`hash`, Home by default), what the device keeps
 * besides (`seed`, made up: G2's Done marks), and what fails before the page opens or after its first reads.
 */
const SHOTS = [
  { name: 'g1-count-mix', state: () => mixState(THREE), now: NOW, looked: NOW - H },
  { name: 'g1-stall', state: stallState, now: STALL_NOW, looked: LATE },
  { name: 'g1-unread-nothing-waiting', state: () => unreadState(), now: NOW, looked: LATE, later: true },
  { name: 'g1-unread-cards-waiting', state: () => unreadState({ who: MIX_PROJECT }), now: NOW, looked: NOW - H, later: true },
  { name: 'g1-signed-out', state: signedOutState, now: NOW, looked: NOW - H, before: true },
  { name: 'g1-ext', state: extState, now: NOW, looked: NOW - 9 * 24 * H },
  // G2: Waiting (AC91 (f) and (g)). `mix` with "last looked" 5 hours back, so two cards are new; `quiet`, with nothing
  // waiting ("Kicked back · none", an empty Done shaded); two made-up projects with three cards kicked back on the device
  // and one confirming in Done, on the whole board and with one project shown; and `unread` on Waiting.
  { name: 'g2-waiting-mix', state: () => mixState(), now: NOW, looked: NOW - 5 * H, hash: '#/waiting' },
  { name: 'g2-waiting-quiet', state: quietState, now: NOW, looked: NOW - 5 * H, hash: '#/waiting' },
  { name: 'g2-waiting-kicked', state: () => twoMixState(), now: NOW, looked: NOW - 5 * H, hash: '#/waiting', seed: deviceMarks(KICKED) },
  { name: 'g2-waiting-kicked-one', state: () => twoMixState(), now: NOW, looked: NOW - 5 * H, hash: `#/waiting/${MIX_PROJECT}`, seed: deviceMarks(KICKED) },
  { name: 'g2-waiting-unread', state: () => unreadState({ who: MIX_PROJECT }), now: NOW, looked: NOW - 5 * H, later: true, hash: '#/waiting' },
  // G3: gate titles (AC91 (h)). `gates`: the made-up project's Build-gate card with no case line and two made-up Launch-gate
  // cards at one gate, cases 1 and 2, on Waiting, in each sheet (one with its case line, one without) and on Plan, a sheet
  // opened over Plan too; the two Launch cards written without their case lines, on Waiting and Plan; and `ext`'s long gate
  // card on Waiting.
  { name: 'g3-waiting-gates', state: () => gatesState(), now: NOW, looked: LATE, hash: '#/waiting' },
  { name: 'g3-sheet-gate-case', state: () => gatesState(), now: NOW, looked: LATE, hash: `#/waiting/card/${encodeURIComponent(GATE_KEY(MIX_PROJECT, GATE4))}` },
  { name: 'g3-sheet-gate-nocase', state: () => gatesState(), now: NOW, looked: LATE, hash: `#/waiting/card/${encodeURIComponent(CARD.gate(MIX_PROJECT))}` },
  { name: 'g3-plan-gates', state: () => gatesState(), now: NOW, looked: LATE, hash: '#/work' },
  { name: 'g3-plan-sheet', state: () => gatesState(), now: NOW, looked: LATE, hash: `#/work/card/${encodeURIComponent(GATE_KEY(MIX_PROJECT, GATE5))}` },
  { name: 'g3-waiting-nocase', state: () => gatesState({ caseLines: false }), now: NOW, looked: LATE, hash: '#/waiting' },
  { name: 'g3-plan-nocase', state: () => gatesState({ caseLines: false }), now: NOW, looked: LATE, hash: '#/work' },
  { name: 'g3-waiting-ext', state: extState, now: NOW, looked: LATE, hash: '#/waiting' },
].filter((s) => !process.argv[3] || s.name.startsWith(process.argv[3]));
const SIZES = [[360, 740], [414, 896]];
const THEMES = ['light', 'dark'];

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
  // Playwright as installed for the session: a local install if there is one, else the global one beside node.
  const { chromium } = await import('playwright').catch(() => import(pathToFileURL(join(dirname(process.execPath), '..', 'lib', 'node_modules', 'playwright', 'index.mjs')).href));
  mkdirSync(OUT, { recursive: true });
  const cur = { setup: null, server: null, now: 0 };
  const srv = await serve(cur);
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  const made = [];
  try {
    for (const shot of SHOTS) {
      for (const [w, hgt] of SIZES) {
        for (const theme of THEMES) {
          const setup = shot.state();
          cur.setup = setup;
          cur.now = shot.now;
          cur.server = fakeServer(setup.repos, setup.config, { now: () => cur.now });
          if (shot.before) setup.fail();
          const ctx = await browser.newContext({ viewport: { width: w, height: hgt }, deviceScaleFactor: 2, colorScheme: theme });
          const page = await ctx.newPage();
          await page.clock.install({ time: shot.now });
          await page.addInitScript(([looked, seed]) => {
            try {
              localStorage.setItem('desk-seen-v1', JSON.stringify({ lastLooked: looked }));
              for (const [k, v] of Object.entries(seed || {})) localStorage.setItem(k, v);
            } catch { /* none */ }
          }, [shot.looked, shot.seed || null]);
          await page.goto(base + (shot.hash || ''));
          const run = async (ms) => {
            for (let t = 0; t < ms; t += 1000) {
              await page.clock.runFor(1000);
              cur.now += 1000;
              await page.waitForTimeout(25);
            }
          };
          await run(62_000);
          if (shot.later) {
            setup.fail();
            await run(3 * POLL);
          }
          await page.waitForTimeout(300);
          const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          const strip = await page.evaluate(() => { const r = document.querySelector('.v2-krow'); return r ? r.scrollWidth - r.clientWidth : null; });
          const gates = await page.evaluate(() => [...document.querySelectorAll('.v2-card.gate .v2-tt, .v2-sheet .v2-stt, .v2-plli.gate .v2-plname')].map((e) => {
            const lh = parseFloat(getComputedStyle(e).lineHeight) || 1;
            return `${Math.round(e.getBoundingClientRect().height / lh)} line(s)${e.scrollHeight > e.clientHeight + 1 ? ', cut' : ''}`;
          }));
          const file = join(OUT, `${shot.name}-${w}x${hgt}-${theme}.png`);
          await page.screenshot({ path: file, fullPage: true });
          made.push(`${file}${scroll > 0 ? `  (scrolls sideways by ${scroll} px)` : ''}${strip != null ? `  (the strip's row scrolls ${strip} px inside itself)` : ''}${gates.length ? `  (gate titles: ${gates.join('; ')})` : ''}`);
          await ctx.close();
        }
      }
    }
  } finally {
    await browser.close();
    srv.close();
  }
  console.log(made.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
