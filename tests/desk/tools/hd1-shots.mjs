// Chromium captures of HD1 (spec S-001, AC98; the stage's row: "`hd1-` before/after captures"), and its measures: each
// screen and sheet the brief names (Home and its foot, Waiting, a project's page, Plan, a gate's sheet and the targets'
// sheet) at 360 × 740 and 414 × 896 (the captures at 360 alone), light and dark, before (the desk's code at the base,
// `--before <dir>`, src/public as it was at 2c20c9a) and after (src/public now). Not a test: run by hand,
// `node tests/desk/tools/hd1-shots.mjs <out dir> --before <dir> [name prefix]` (Playwright and its Chromium as installed).
//
// The page is the desk's own code, served as it deploys, its function calls answered by tests/desk/fake-desk.mjs from the
// state's in-memory repositories (glance-fixtures.mjs's `mix` and `gates`, and vt1-fixtures.mjs's day 5: Service-Desk's
// records, real; the made-up project, cards and checks NOT real, labelled so in tests/desk/fixtures/README.md). Each line
// printed says whether the page or a sheet scrolls sideways (it must not), and, after, each section head's lines: the two
// headings, "Since you last looked · <time>" and "Milestones by phase · <count>", must be one line at 360 px, or the run fails.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fakeServer } from '../fake-desk.mjs';
import { mixState, gatesState, GATE_KEY, GATE4, MIX_PROJECT, NOW } from '../glance-fixtures.mjs';
import { vt1State, DAY5, windowCards, chi } from '../vt1-fixtures.mjs';

const AFTER = resolve(fileURLToPath(new URL('../../../src/public/', import.meta.url)));
const args = process.argv.slice(2);
const bi = args.indexOf('--before');
const BEFORE = bi >= 0 ? resolve(args[bi + 1]) : null;
const rest = bi >= 0 ? args.filter((x, i) => i !== bi && i !== bi + 1) : args;
const OUT = resolve(rest[0] || 'hd1-shots');
const ONLY = rest[1] || '';
const H = 3600e3;
const seen = (ms) => ({ 'desk-seen-v1': JSON.stringify({ lastLooked: ms }) });
/** Each screen: its name, the state, its clock, its address, what is kept on the device, and where to scroll. */
const SHOTS = [
  { name: 'hd1-home', state: () => mixState(), now: NOW, hash: '#/', store: seen(NOW - 20 * H), at: '[data-k="since-h"]' },
  { name: 'hd1-home-last-7-days', state: () => mixState(), now: NOW, hash: '#/', store: seen(NOW - 9 * 24 * H), at: '[data-k="since-h"]' },
  { name: 'hd1-home-foot', state: () => mixState(), now: NOW, hash: '#/', store: seen(NOW - 20 * H), at: '[data-k="home-more-detail"]' },
  { name: 'hd1-waiting', state: () => mixState(), now: NOW, hash: '#/waiting', store: {}, at: null },
  { name: 'hd1-project-page', state: () => mixState(), now: NOW, hash: '#/p/Service-Desk', store: {}, at: '[data-k="ms-h"]', open: true },
  { name: 'hd1-plan', state: () => mixState(), now: NOW, hash: '#/work', store: {}, at: null },
  { name: 'hd1-gate-sheet', state: () => gatesState(), now: NOW, hash: `#/waiting/card/${encodeURIComponent(GATE_KEY(MIX_PROJECT, GATE4))}`, store: {}, at: null },
  { name: 'hd1-targets-sheet', state: () => vt1State({ lines: DAY5, cards: windowCards() }), now: chi('2026-12-07', '15:00'), hash: '#/p/Service-Desk/values', store: {}, at: null },
];
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
    const file = join(cur.public, decodeURIComponent(url.pathname));
    if (!file.startsWith(cur.public) || !existsSync(file) || !statSync(file).isFile()) return res.writeHead(404).end();
    return res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

async function main() {
  const { chromium } = await import('playwright').catch(() => import(pathToFileURL(join(dirname(process.execPath), '..', 'lib', 'node_modules', 'playwright', 'index.mjs')).href));
  mkdirSync(OUT, { recursive: true });
  const cur = { setup: null, server: null, now: 0, public: AFTER };
  const srv = await serve(cur);
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  const lines = [];
  const fails = [];
  try {
    for (const shot of SHOTS.filter((s) => s.name.startsWith(ONLY))) {
      for (const [when, dir] of [['after', AFTER], ...(BEFORE ? [['before', BEFORE]] : [])]) {
        for (const [w, hgt] of SIZES) {
          for (const theme of THEMES) {
            const setup = shot.state();
            cur.setup = setup;
            cur.now = shot.now;
            cur.public = dir;
            cur.server = fakeServer(setup.repos, setup.config, { now: () => cur.now });
            const ctx = await browser.newContext({ viewport: { width: w, height: hgt }, deviceScaleFactor: 2, colorScheme: theme });
            await ctx.addInitScript((kv) => { for (const [k, v] of Object.entries(kv)) { try { localStorage.setItem(k, v); } catch { /* none */ } } }, shot.store);
            const page = await ctx.newPage();
            await page.clock.install({ time: shot.now });
            await page.goto(`${base}${shot.hash}`);
            const run = async (ms, step = 1000) => {
              for (let t = 0; t < ms; t += step) {
                await page.clock.runFor(step);
                cur.now += step;
                await page.waitForTimeout(40);
              }
            };
            await run(3000);
            const settled = () => page.evaluate(() => Boolean(document.querySelector('.v2-sheet')) || !/Checking/.test((document.querySelector('.v2-sub') || { textContent: '' }).textContent));
            for (let i = 0; i < 20 && !(await settled()); i++) await run(1000);
            await run(62_000, 2000);
            if (shot.open) {
              await page.evaluate(() => { for (const b of document.querySelectorAll('.v2-std [aria-expanded="false"]')) b.click(); });
              await run(1000);
            }
            if (shot.at) {
              await page.evaluate((sel) => { const e = document.querySelector(sel); if (e) e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -60); }, shot.at);
              await run(300);
            }
            const said = await page.evaluate(() => {
              const heads = [...document.querySelectorAll('.v2-sh')].map((sh) => {
                const h2 = sh.tagName === 'H2' ? sh : sh.querySelector('h2');
                if (!h2) return null;
                // Its lines: the text's line boxes, by where each piece of text sits (two pieces whose vertical middles are
                // within 6 px of each other share a line, whatever their sizes); the h2's padding left out.
                const mids = [];
                const walk = (n) => {
                  for (const c of n.childNodes) {
                    if (c.nodeType === 3 && c.textContent.trim()) {
                      const r = document.createRange();
                      r.selectNodeContents(c);
                      for (const x of r.getClientRects()) if (x.width > 0) mids.push((x.top + x.bottom) / 2);
                    } else if (c.nodeType === 1) walk(c);
                  }
                };
                walk(h2);
                mids.sort((p, q) => p - q);
                let n = 0;
                let last = -1e9;
                for (const m of mids) { if (m - last > 6) n++; last = m; }
                const words = [...h2.childNodes].map((c) => Math.round(c.nodeType === 3 ? (() => { const q = document.createRange(); q.selectNodeContents(c); return q.getBoundingClientRect().width; })() : c.getBoundingClientRect().width));
                return { words: h2.textContent, lines: n, size: getComputedStyle(h2).fontSize, widths: words, room: Math.round(sh.getBoundingClientRect().width) };
              }).filter(Boolean);
              const s = document.querySelector('.v2-sheet');
              return { heads, sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth, sheet: s ? s.scrollWidth - s.clientWidth : 0 };
            });
            if (said.sideways > 0) fails.push(`${shot.name} ${when} ${w} ${theme}: the page scrolls sideways by ${said.sideways} px`);
            if (said.sheet > 0) fails.push(`${shot.name} ${when} ${w} ${theme}: the sheet scrolls sideways by ${said.sheet} px`);
            if (when === 'after') for (const x of said.heads) if (/^(Since you last looked|Milestones by phase) · /.test(x.words) && x.lines !== 1) fails.push(`${shot.name} ${w} ${theme}: "${x.words}" on ${x.lines} lines`);
            if (w === 360) {
              const file = join(OUT, `${shot.name}-${when}-${w}x${hgt}-${theme}.png`);
              await page.screenshot({ path: file });
              lines.push(`${file}  (${said.heads.map((x) => `"${x.words}" ${x.size} ${x.lines} line${x.lines === 1 ? '' : 's'} [${x.widths.join('+')} of ${x.room}]`).join('; ') || 'no section head'})`);
            } else lines.push(`${shot.name}-${when}-${w}x${hgt}-${theme}: ${said.heads.map((x) => `"${x.words}" ${x.lines}`).join('; ')}`);
            await ctx.close();
          }
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
