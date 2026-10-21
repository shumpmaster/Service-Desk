// ac-test: S-001/AC81 — the bar Home · Waiting · Plan at every screen's foot, mockup v2's type and
// colour, and IBM Plex served by the desk (desk mockup v2, frames H1, 1, 5 and 12; stage 1a, "Until
// stage 3"). The page is the sandbox's own code under the fake DOM, from the fixtures AC62's test
// draws (screen-text.mjs: Service-Desk at 3117150, AC52's one-of-each project, a v2.5 project) and
// AC80's made-up Example project (NOT real records, tests/desk/fixtures/README.md); the stylesheet
// and the fonts are read as files, as AC42's and AC62's tests read them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { CONFIG, FIX, SRC } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { NOW, v3 } from './sandbox-fixtures.mjs';
import { textSetup } from './screen-text.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { hexLab, de2000 } from './ciede2000.mjs';

const CSS_RAW = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const CSS = CSS_RAW.replace(/\/\*[\s\S]*?\*\//g, '');
const V2 = CSS.slice(CSS.indexOf('@font-face')); // mockup v2's block: the stylesheet's last part (AC62's test)
const MOCKUP = readFileSync(join(SRC, '..', 'docs', 'design', 'mockups', 'desk-v2.html'), 'utf8');
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;

async function opened(hash = '#/', extra = {}) {
  const app = await loadSandbox({ ...textSetup(), hash, now: NOW, ...extra });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
const bar = (app) => byClass(app.view, 'v2-bar');
const tabs = (app) => byClass(bar(app)[0], 'v2-tab');
const current = (app) => tabs(app).filter((t) => t.attrs['aria-current'] === 'page').map((t) => byClass(t, 'v2-tabw')[0].textContent);

test('AC81: the trial view opens on Home; every screen carries the one bar Home · Waiting · Plan at its foot, its current tab named so; no Projects or Portfolio tab', async () => {
  const app = await opened('');
  try {
    assert.ok(byClass(app.view, 'v2-home').length && byClass(app.view, 'v2-tile').length, 'Home, with its tiles (AC82)');
    for (const [hash, want, row] of [
      ['#/', 'Home', false],
      ['#/p/Service-Desk', 'Home', true], ['#/p/Service-Desk/timeline', 'Home', true], ['#/p/Service-Desk/team', 'Home', true],
      ['#/p/Service-Desk/team/chief-of-staff', 'Home', false], ['#/p/Service-Desk/asked', 'Home', false], ['#/p/Service-Desk/agents', 'Home', false],
      ['#/p/Alpha/notes', 'Home', false], ['#/p/Delta/pipeline', 'Home', false], ['#/p/Delta', 'Home', true],
      ['#/waiting', 'Waiting', false], ['#/waiting/Alpha', 'Waiting', false], ['#/work', 'Plan', false],
    ]) {
      await app.go(hash);
      assert.equal(bar(app).length, 1, `${hash}: one bar`);
      const t = tabs(app);
      assert.deepEqual(t.map((x) => byClass(x, 'v2-tabw')[0].textContent), ['Home', 'Waiting', 'Plan'], `${hash}: three tabs, in order`);
      assert.deepEqual(t.map((x) => x.attrs.href), ['#/', '#/waiting', '#/work']);
      assert.deepEqual(current(app), [want], `${hash}: ${want} current`);
      assert.equal(byClass(app.view, 'sb-dock').length + byClass(app.view, 'sb-tab').length, 0, `${hash}: no Status · Timeline · Team · Queue bar`);
      assert.equal(byClass(app.view, 'v2-row').length, row ? 1 : 0, `${hash}: ${row ? 'the' : 'no'} top row`);
      assert.doesNotMatch(bar(app)[0].textContent, /Projects|Portfolio/);
      assert.equal(app.view.children[app.view.children.length - 1], bar(app)[0], `${hash}: the bar last, at the foot`);
    }
  } finally {
    app.restore();
  }
});

test('AC81: Waiting\'s badge is the board\'s own "Waiting on you" plus "Kicked back", shown only when 1 or more; a refresh keeps the tab', async () => {
  const app = await opened('#/waiting');
  try {
    const n = ['wait', 'kick'].map((k) => Number(byClass(keyed(app, `lane:${k}`), 'v2-lc')[0].textContent)).reduce((a, b) => a + b, 0);
    assert.ok(n > 0);
    assert.equal(byClass(bar(app)[0], 'v2-badge')[0].children[0].textContent, String(n));
    await app.go('#/work');
    app.module.refresh();
    await app.flush();
    assert.deepEqual(current(app), ['Plan'], 'a refresh keeps the tab');
  } finally {
    app.restore();
  }
  const quiet = await loadSandbox({ config: { ...CONFIG, projects: [v3('Quiet')] }, repos: { Quiet: repo({ 'README.md': '# Quiet\n' }) }, hash: '#/', now: NOW });
  try {
    await quiet.advance(1000);
    await quiet.advance(POLL_MS);
    assert.equal(byClass(quiet.view, 'v2-badge').length, 0, 'none at 0');
  } finally {
    quiet.restore();
  }
});

test('AC81 (until stage 3): `p/<name>/queue` opens `waiting/<name>` without adding a history step; a wait row\'s `p/<name>/queue/<key>` opens it with that card\'s sheet, a key no card has with none; from stage 2 Home\'s tiles open the Status screen and Home has no "Work ahead ›"', async () => {
  const app = await opened('#/');
  const replaced = [];
  location.replace = (h) => { replaced.push(h); location.hash = h; };
  try {
    // Stage 2 (AC82; this case as AC81's test says, "none on stage 2's Home"): the control goes with today's Home.
    assert.equal(byClass(app.view, 'sb-wa-link').length + findAll(app.view, (e) => e.dataset && e.dataset.k === 'work-ahead').length, 0, 'no "Work ahead ›" on Home');
    assert.deepEqual(byClass(app.view, 'v2-ta').map((a) => a.attrs.href).sort(), ['#/p/Alpha', '#/p/Delta', '#/p/Service-Desk'], 'a tap on a tile opens the project\'s Status screen, as built, until stage 3');
    await app.go('#/p/Alpha/queue');
    assert.deepEqual(replaced, ['#/waiting/Alpha'], 'in place of its history entry');
    assert.equal(byClass(app.view, 'v2-filter').length, 1);
    await app.go('#/p/Alpha/queue/q%3AAlpha-pick');
    assert.match(replaced.at(-1), /^#\/waiting\/Alpha\/card\//);
    assert.ok(byClass(app.view, 'v2-sheet').length, 'that card\'s sheet open over it');
    assert.equal(byClass(byClass(app.view, 'v2-sheet')[0], 'v2-stitle')[0].textContent, "Alpha's question");
    await app.go('#/p/Alpha/queue/q%3Anothing-has-this');
    await app.advance(POLL_MS);
    assert.equal(app.loc.hash, '#/waiting/Alpha', 'a key no card has: Waiting so filtered, no sheet');
    assert.equal(byClass(app.view, 'v2-sheet').length, 0);
  } finally {
    delete location.replace;
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Type, colour and the fonts, from the stylesheet and the files

/** The pairs AC81 allows beside the tokens, where desk-v2.html's own CSS sets them (Plex Sans; then Plex Mono). */
const PAIRS = { font: ['600 11', '400 11', '500 12', '400 12', '600 12', '600 13', '500 15', '600 15'], mono: ['500 11'] };

test('AC81: every font on the new screens is a token or one of the pairs desk-v2.html sets (frame 1\'s 400 11 px among them); the only sizes 24, 18, 15, 13, 12 and 11 px with 16 px for text boxes, the only weights 400, 500 and 600', () => {
  const decls = [...V2.matchAll(/(?:^|[{;\s])(font|font-size|font-weight)\s*:\s*([^;{}]+?)\s*(?=;|})/g)].map((m) => [m[1], m[2].trim()]);
  assert.ok(decls.length > 40, `${decls.length} declarations`);
  for (const [prop, v] of decls) {
    if (prop === 'font-size') assert.fail(`font-size: ${v}: sizes come from the tokens and pairs`);
    if (prop === 'font-weight') { assert.match(v, /^(400|500|600)$/, `font-weight: ${v}`); continue; }
    if (/^var\(--t-(title|sheet|lead|row|body|small|label|mono|input)\)$/.test(v) || v === 'inherit') continue;
    const m = /^(\d{3}) (\d+)px\/[\d.]+(?:px)? var\(--(font|mono)\)$/.exec(v);
    assert.ok(m, `font: ${v}: a token or a weight, size and family`);
    assert.ok(PAIRS[m[3]].includes(`${m[1]} ${m[2]}`), `font: ${v}: a pair desk-v2.html sets`);
  }
  const tok = Object.fromEntries([...CSS.slice(CSS.indexOf('html.sb .v2, html.sb.v2-page {')).matchAll(/(--t-[a-z]+): ([^;]+);/g)].slice(0, 9).map((m) => [m[1], m[2]]));
  assert.deepEqual(tok, {
    '--t-title': '600 24px/1.2 var(--font)', '--t-sheet': '600 18px/1.3 var(--font)', '--t-lead': '400 15px/1.45 var(--font)',
    '--t-row': '500 13px/1.35 var(--font)', '--t-body': '400 13px/1.45 var(--font)', '--t-small': '400 12px/1.4 var(--font)',
    '--t-label': '500 11px/1.35 var(--font)', '--t-mono': '400 11px/1.4 var(--mono)', '--t-input': '400 16px/1.4 var(--font)',
  });
});

/** A theme's tokens from a block of CSS text. */
const tokensIn = (text) => Object.fromEntries([...text.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-f]{6})/g)].map((m) => [m[1], m[2]]));
const block = (text, open) => { const i = text.indexOf(open); assert.ok(i >= 0, open); return text.slice(i, text.indexOf('}', i)); };
const COLOURS = ['--bg', '--bg2', '--card', '--chip', '--line', '--line2', '--ink', '--ink2', '--ink3', '--you', '--on-you', '--ok', '--bad', '--gold',
  '--ph-disc', '--ph-des', '--ph-build', '--ph-launch'];

test('AC81: the tokens hold desk-v2.html:18-53\'s values, in light and dark (the phone\'s setting, and data-theme)', () => {
  const pick = (o) => Object.fromEntries(COLOURS.map((k) => [k, o[k]]));
  const mLight = pick(tokensIn(block(MOCKUP, ':root {')));
  const mDark = pick(tokensIn(block(MOCKUP, ':root[data-theme="dark"] {')));
  assert.equal(mLight['--you'], '#c9380c');
  assert.equal(mDark['--you'], '#ff6a3d');
  assert.deepEqual(pick(tokensIn(block(CSS, 'html.sb .v2, html.sb.v2-page {'))), mLight);
  assert.deepEqual(pick(tokensIn(block(CSS, 'html.sb:not([data-theme="light"]) .v2, html.sb.v2-page:not([data-theme="light"]) {'))), mDark, 'the phone\'s dark setting');
  assert.deepEqual(pick(tokensIn(block(CSS, 'html.sb[data-theme="dark"] .v2, html.sb.v2-page[data-theme="dark"] {'))), mDark, 'data-theme="dark"');
  assert.match(block(CSS, 'html.sb .v2, html.sb.v2-page {'), /--font: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;/, 'the mockup\'s fallback stack');
  assert.match(block(CSS, 'html.sb .v2, html.sb.v2-page {'), /--mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;/);
});

test('AC81 with AC48\'s rule: the nine colours that carry a meaning are at least 10 apart by CIEDE2000 in each theme (36 pairs a theme)', () => {
  const NINE = ['--you', '--ok', '--bad', '--gold', '--ph-disc', '--ph-des', '--ph-build', '--ph-launch', '--ink2'];
  const lows = [];
  for (const [name, open] of [['light', 'html.sb .v2, html.sb.v2-page {'], ['dark', 'html.sb[data-theme="dark"] .v2, html.sb.v2-page[data-theme="dark"] {']]) {
    const t = tokensIn(block(CSS, open));
    let low = Infinity;
    let pairs = 0;
    for (let i = 0; i < NINE.length; i++) {
      for (let j = i + 1; j < NINE.length; j++) {
        const d = de2000(hexLab(t[NINE[i]]), hexLab(t[NINE[j]]));
        pairs++;
        low = Math.min(low, d);
        assert.ok(d >= 10, `${name}: ${NINE[i]} ${t[NINE[i]]} and ${NINE[j]} ${t[NINE[j]]}: ${d.toFixed(1)}`);
      }
    }
    assert.equal(pairs, 36);
    lows.push(Number(low.toFixed(1)));
  }
  assert.deepEqual(lows, [13.3, 12.2], 'the lowest, as measured on 2026-10-20 (Facts relied on)');
});

test('AC81 + AC42: IBM Plex from the desk itself — each @font-face names only fonts/IBMPlex… on this origin, font-display swap, no local(); no url( names another origin; each file\'s SHA-256 the published package\'s (README); the licence shipped', () => {
  const faces = [...CSS.matchAll(/@font-face \{([^}]*)\}/g)].map((m) => m[1]);
  assert.equal(faces.length, 10, 'Sans 400, 500 and 600, Mono 400 and 500, each its Latin1 and Pi');
  for (const f of faces) {
    assert.match(f, /src: url\("fonts\/IBMPlex(Sans|Mono)-(Regular|Medium|SemiBold)-(Latin1|Pi)\.woff2"\) format\("woff2"\);/);
    assert.match(f, /font-display: swap;/);
    assert.doesNotMatch(f, /local\(/);
    assert.match(f, /unicode-range: U\+/);
  }
  for (const m of CSS.matchAll(/url\(([^)]*)\)/g)) assert.match(m[1], /^"fonts\/IBMPlex[A-Za-z0-9-]+\.woff2"$/, `url(${m[1]}): this origin's fonts only`);
  const readme = readFileSync(join(FIX, 'README.md'), 'utf8');
  const dir = join(SRC, 'public', 'fonts');
  const files = readdirSync(dir).sort();
  assert.deepEqual(files, ['IBMPlexMono-Medium-Latin1.woff2', 'IBMPlexMono-Medium-Pi.woff2', 'IBMPlexMono-Regular-Latin1.woff2', 'IBMPlexMono-Regular-Pi.woff2',
    'IBMPlexSans-Medium-Latin1.woff2', 'IBMPlexSans-Medium-Pi.woff2', 'IBMPlexSans-Regular-Latin1.woff2', 'IBMPlexSans-Regular-Pi.woff2',
    'IBMPlexSans-SemiBold-Latin1.woff2', 'IBMPlexSans-SemiBold-Pi.woff2', 'LICENSE.txt']);
  for (const f of files) {
    const h = createHash('sha256').update(readFileSync(join(dir, f))).digest('hex');
    assert.ok(readme.includes(`${h}  ${f}`), `${f}: ${h}, as recorded from the package`);
  }
  assert.match(readFileSync(join(dir, 'LICENSE.txt'), 'utf8'), /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(readFileSync(join(SRC, 'public', 'index.html'), 'utf8'), /default-src 'self'/, 'the page\'s Content-Security-Policy, unchanged');
});

/** The code points a unicode-range list covers. */
function ranges(list) {
  return list.split(/,\s*/).map((r) => {
    const [a, b] = r.replace(/^U\+/, '').split('-');
    return [parseInt(a, 16), parseInt(b || a, 16)];
  });
}

test('AC81: every character of the board\'s, its sheets\', the bar\'s and the top row\'s own words lies in a served subset\'s unicode-range; ◆, ✕, ▸ and ⇅ appear only as SVG icons', async () => {
  const sans = [...CSS.matchAll(/@font-face \{ font-family: "IBM Plex Sans"; font-style: normal; font-weight: 400;[^}]*unicode-range: ([^;]+);/g)].flatMap((m) => ranges(m[1]));
  const ok = (cp) => sans.some(([a, b]) => cp >= a && cp <= b);
  assert.ok(ok(0x2197) && ok(0x2713) && ok(0x00b7) && ok(0x2026), '↗, ✓, · and … served');
  for (const c of ['◆', '✕', '▸', '⇅']) assert.ok(!ok(c.codePointAt(0)), `${c} in neither subset`);
  const app = await opened('#/waiting');
  const texts = [];
  const take = () => {
    for (const cls of ['v2-board', 'v2-bar', 'v2-row', 'v2-sheet']) for (const el of byClass(app.view, cls)) texts.push(el.textContent);
  };
  try {
    take();
    const hrefs = byClass(app.view, 'v2-t').map((t) => t.attrs.href).filter(Boolean);
    for (const h of hrefs) {
      await app.go(h);
      for (const b of findAll(app.view, (e) => e.tag === 'button' && e.attrs['aria-expanded'] === 'false')) { b.click(); await app.flush(); }
      take();
    }
    for (const r of ['#/p/Alpha', '#/p/Alpha/timeline', '#/p/Alpha/team']) { await app.go(r); take(); }
  } finally {
    app.restore();
  }
  const all = texts.join('\n');
  for (const c of ['◆', '✕', '▸', '⇅']) assert.ok(!all.includes(c), `${c} never as text`);
  // The records' own text may hold any character (it shows in the fallback font); the fixtures' do not.
  const outside = [...new Set([...all].filter((c) => c !== '\n' && !ok(c.codePointAt(0))))];
  assert.deepEqual(outside, [], `outside the served subsets: ${outside.map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase()}`).join(' ')}`);
});

test('AC81: no rule on the new screens sets a width wider than 360 px outside a media query for a wider screen', () => {
  const outsideMedia = V2.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, '');
  for (const m of outsideMedia.matchAll(/(?:^|[;{\s])((?:min-|max-)?width):\s*([^;}]+)/g)) {
    const px = [...m[2].matchAll(/(\d+(?:\.\d+)?)px/g)].map((x) => Number(x[1]));
    for (const v of px) assert.ok(v <= 360 || m[1] === 'max-width', `${m[1]}: ${m[2]}`);
  }
});

// ---------------------------------------------------------------------------
// The cascade (the design reviewer's F1, stage 1a's build review, round 1): the fake DOM has no
// cascade, so the stylesheet is read for rules that could out-rank mockup v2's classes.

/** A selector's specificity [ids, classes, elements]; :where() counts nothing, :is() and :not() their weightiest argument. */
function specificity(sel) {
  let s = sel;
  let extra = [0, 0, 0];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const top = (list) => list.split(/,(?![^(]*\))/).map((x) => specificity(x.trim())).reduce((m, x) => (cmp(x, m) > 0 ? x : m), [0, 0, 0]);
  for (;;) {
    const m = /:(where|is|not)\(((?:[^()]|\([^()]*\))*)\)/.exec(s);
    if (!m) break;
    if (m[1] !== 'where') extra = add(extra, top(m[2]));
    s = s.slice(0, m.index) + s.slice(m.index + m[0].length);
  }
  const ids = (s.match(/#[\w-]+/g) || []).length;
  const classes = (s.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+/g) || []).length;
  const els = (s.replace(/\[[^\]]*\]/g, '').match(/(^|[\s>+~])[a-z][\w-]*|::[\w-]+/gi) || []).length;
  return add(extra, [ids, classes, els]);
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

test('AC81 (stage 1a\'s build review, round 1, F1): no rule that reaches mockup v2\'s buttons, links and paragraphs by their element alone out-ranks a v2 class — the resets carry no weight, so the board\'s and the sheet\'s own classes set their type, colour, padding and background', () => {
  assert.deepEqual(specificity('.v2 button'), [0, 1, 1]);
  assert.deepEqual(specificity(':where(.v2) button'), [0, 0, 1]);
  assert.deepEqual(specificity('html.sb a:where(:not(.v2 *))'), [0, 1, 2]);
  assert.deepEqual(specificity('.v2-tab[aria-current="page"]'), [0, 2, 0]);
  const PROPS = /(^|;)\s*(font|font-size|font-weight|color|background|background-color|padding[\w-]*|border[\w-]*|margin[\w-]*|list-style|text-decoration)\s*:/;
  const rules = [...CSS.replace(/@media[^{]*\{/g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }));
  const offenders = [];
  for (const r of rules) {
    if (r.sel.startsWith('@') || !PROPS.test(r.body)) continue;
    for (const one of r.sel.split(/\s*,\s*(?![^(]*\))/)) {
      const parts = one.split(/\s*[\s>+~]\s*(?![^(]*\))/);
      const subject = parts.pop();
      // Only the scopes that reach every element of mockup v2's screens; a rule inside a container class
      // of its own (".sb-why p", ".v2-ql b") reaches only that container's elements, as it means to.
      if (!parts.every((x) => /^(html|html\.sb|body|html\.sb body|\.v2|:where\(\.v2\)|\*)$/.test(x))) continue;
      // A subject with a class, an id or an attribute of its own reaches only its own elements.
      if (/[.#[]/.test(subject.replace(/:(where|is|not)\([^)]*\)/g, ''))) continue;
      if (!/^(a|button|p|h[1-6]|ol|ul|li|b|strong|summary|details|span|svg|textarea)\b/.test(subject)) continue;
      if (/:not\(\.v2 \*\)/.test(one)) continue; // stops at mockup v2's screens
      if (cmp(specificity(one), [0, 1, 0]) >= 0) offenders.push(`${one} ${JSON.stringify(specificity(one))}`);
    }
  }
  assert.deepEqual(offenders, [], 'element rules that would out-rank a single v2 class');
  // And the classes themselves set what the frames draw (AC80; AC81 as settled after round 1).
  const rule = (sel) => (rules.find((r) => r.sel === sel) || { body: '' }).body;
  assert.match(rule('.v2-grp'), /font: var\(--t-label\)/, 'a group\'s name 500 11 px');
  assert.match(rule('.v2-ql'), /font: var\(--t-small\)/, 'a quiet line 400 12 px');
  assert.match(rule('.v2-undo'), /font: var\(--t-label\)/, '"Undo" 500 11 px');
  assert.match(rule('.v2-more'), /font: var\(--t-label\)/, '"<n> more" 500 11 px');
  assert.match(rule('.v2-step'), /font: var\(--t-label\)/, 'a board button 500 11 px');
  assert.match(rule('.v2-x44'), /background: var\(--chip\)/, 'the sheet\'s close on the --chip circle');
  assert.match(rule('.v2-abtn'), /padding: 0 12px; border-radius: 18px; background: var\(--chip\)/, '"Done ✓" a pill');
  assert.match(rule('.v2-abtn.ghost'), /box-shadow: inset 0 0 0 1px var\(--line2\); background: var\(--bg\)/, '"Close" a pill, outlined');
});

test('AC81 (settled after round 1, F2): text no frame draws takes the nearest role — the record fold\'s headings --t-row, the rest --t-body; the sandbox\'s marker on mockup v2\'s screens --t-label', () => {
  assert.match(CSS, /\n\.v2-sheet \.sb-record :is\(h1, h2, h3, h4, h5, h6\) \{ font: var\(--t-row\);/);
  assert.match(CSS, /\n\.v2-sheet \.sb-record \{ font: var\(--t-body\);/);
  assert.match(CSS, /\n\.v2 \.sb-marker \{ font: var\(--t-label\);/);
  // Nothing else in the sheet's record sets a size of its own after these.
  const after = CSS.slice(CSS.indexOf('.v2-sheet .sb-record :is('));
  assert.doesNotMatch(after, /\.sb-record[^{]*\{[^}]*font(-size)?: (?!var\(--t-(row|body)\))/);
});
