// ac-test: S-001/AC88 — dark mode and the screens no frame redraws (desk mockup v2, stage 7; specs/S-001.md:7152-7177):
// every trial-view screen on AC81's tokens, in both themes. The suite has no browser (AC80's method), so the
// page is the sandbox's own code under the fake DOM, and the stylesheets the page loads (style.css, then
// sandbox.css) are read as files and cascaded over what it drew (tests/desk/css-cascade.mjs): every screen and
// sheet from each fixture, with the dark theme forced as the mockup's frames force it (`data-theme="dark"`,
// the phone left light), then by the phone's own setting, and in light. For each, every `color`,
// `background` and border colour (and an SVG mark's fill and stroke, and each shadow) must resolve to one of
// AC81's tokens with the theme's value (docs/design/mockups/desk-v2.html:18-53); from those values every text's
// contrast is at least 4.5:1 (3:1 at 24 px), the nine colours that carry a meaning at least 10 apart by CIEDE2000,
// a text box's text 16 px, and the fade at a clipped text's cut the colour of the ground it sits on. The
// Chromium captures at 360 x 740 and 414 x 896, light and dark, beside frames H2 and 12, are the pull
// request's (AC88, the test's last clause; AC81's "No sideways scroll").
//
// Fixtures: AC62's and AC81's (screen-text.mjs: Service-Desk at 3117150, a project with one item of each kind,
// made up, and a v2.5 project in poom/'s placeholder form), md-extremes (sandbox-fixtures.mjs's five projects,
// long titles), Service-Desk with J12's built pull requests (tv2-fixtures.mjs), and Plan's (wa-fixtures.mjs:
// Service-Desk at 77bfeae with made-up estimates, NOT real records).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox } from './sandbox-helpers.mjs';
import { NOW, extremes } from './sandbox-fixtures.mjs';
import { textSetup } from './screen-text.mjs';
import { SD3, sdRepo } from './tv2-fixtures.mjs';
import { waSetup, WORKED, memStore } from './wa-fixtures.mjs';
import { CONFIG } from './helpers.mjs';
import { parseCss, treeOf, cascade, nodes, COLOUR_PROPS } from './css-cascade.mjs';
import { hexLab, de2000 } from './ciede2000.mjs';
import { PF_ROWS } from '../../src/public/lib/portfolio.js';

const SANDBOX_CSS = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const STYLE_CSS = readFileSync(join(SRC, 'public', 'style.css'), 'utf8');
const JS = readFileSync(join(SRC, 'public', 'sandbox.js'), 'utf8');
const MOCKUP = readFileSync(join(SRC, '..', 'docs', 'design', 'mockups', 'desk-v2.html'), 'utf8');
// The page loads style.css, then sandbox.css (src/public/index.html; sandbox.js adds the second): their rules in that order.
const RULES = (() => {
  const a = parseCss(STYLE_CSS, 'style.css');
  const b = parseCss(SANDBOX_CSS, 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();

// AC81's tokens: mockup v2's colours, its shadow and its scrim (desk-v2.html:18-53), with each theme's value.
const AC81 = ['--bg', '--bg2', '--card', '--chip', '--line', '--line2', '--ink', '--ink2', '--ink3', '--you', '--on-you', '--ok', '--bad', '--gold',
  '--ph-disc', '--ph-des', '--ph-build', '--ph-launch', '--shadow', '--scrim'];
const mockBlock = (open) => { const i = MOCKUP.indexOf(open); assert.ok(i >= 0, open); return MOCKUP.slice(i, MOCKUP.indexOf('}', i)); };
const mockTokens = (text) => Object.fromEntries([...text.matchAll(/(--[a-z0-9-]+):\s*([^;]+?)\s*(?=;|$)/g)].map((m) => [m[1], m[2].trim()]));
const THEME = { light: mockTokens(mockBlock(':root {')), dark: mockTokens(mockBlock(':root[data-theme="dark"] {')) };
// The mockup's one literal shadow, a segment's current tab (desk-v2.html: `.seg a.on`).
const MOCK_SHADOWS = [...MOCKUP.matchAll(/box-shadow:\s*([^;}]+)/g)].map((m) => m[1].trim()).filter((v) => !/var\(/.test(v) && v !== 'none');
const NINE = ['--you', '--ok', '--bad', '--gold', '--ph-disc', '--ph-des', '--ph-build', '--ph-launch', '--ink2'];

/** The three ways a screen is shown: dark forced on a light phone (the frames' way), the phone's own dark, and light. */
const WAYS = [
  { name: 'dark (data-theme)', theme: 'dark', env: { scheme: 'light', width: 360, reducedMotion: false }, attr: 'dark' },
  { name: 'dark (the phone)', theme: 'dark', env: { scheme: 'dark', width: 414, reducedMotion: false }, attr: null },
  { name: 'light', theme: 'light', env: { scheme: 'light', width: 360, reducedMotion: false }, attr: null },
];

const marks = (text) => [...String(text).matchAll(/⟦([^|⟧]*)\|([^⟧]*)⟧/g)].map((m) => ({ name: m[1], value: m[2] }));
const plain = (text) => String(text).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
const COLOUR_WORD = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\b(white|black|red|green|blue|gray|grey|silver|orange|yellow|purple|navy|teal)\b/i;
const label = (n) => `${n.tag}${[...n.cls].slice(0, 3).map((c) => `.${c}`).join('')}`;

/** What does not resolve to one of AC81's tokens in a declared value: [] when every colour in it does. */
function offTokens(value, theme, prop) {
  const bad = [];
  for (const m of marks(value)) {
    if (!AC81.includes(m.name)) bad.push(`${m.name} (${m.value}) is not one of AC81's tokens`);
    else if (m.value !== THEME[theme][m.name]) bad.push(`${m.name} is ${m.value}, mockup v2's ${theme} value is ${THEME[theme][m.name]}`);
  }
  if (/⟦invalid⟧/.test(value)) bad.push('a var() with no value');
  let rest = String(value).replace(/⟦[^|⟧]*\|[^⟧]*⟧/g, ' ');
  if (prop === 'box-shadow') for (const s of MOCK_SHADOWS) rest = rest.split(s).join(' ');
  if (COLOUR_WORD.test(rest)) bad.push(`a colour of its own: ${rest.trim()}`);
  return bad;
}

const hexOf = (text) => { const m = /#[0-9a-f]{6}\b/i.exec(plain(text)); return m ? m[0].toLowerCase() : null; };
const lum = (hex) => {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/** A node's own ground: its background's first colour when that is opaque (a token's six-digit value). */
function groundOf(n) {
  for (let a = n; a; a = a.parent) {
    const v = a.declared.get('background-color') || a.declared.get('background');
    if (!v) continue;
    const first = marks(v)[0];
    if (first && /^#[0-9a-f]{6}$/i.test(first.value) && !/gradient/.test(plain(v).split(first.value)[0])) return first.value.toLowerCase();
  }
  return null;
}

/** The markup the page gives a bubble (sandbox.js, summaryBox and lineBox), opened in place inside each box that holds one. */
function openBubbles(tree) {
  const mk = (tag, cls, parent) => { const n = { tag, cls: new Set(cls), attrs: {}, parent, kids: [], text: '', el: null }; parent.kids.push(n); return n; };
  for (const box of nodes(tree).filter((n) => n.cls.has('sb-sumbox') || n.cls.has('sb-linebox'))) {
    const b = mk('div', ['sb-bubble', 'down', ...(box.cls.has('sb-linebox') ? ['sb-linebub'] : ['col-l'])], box);
    const top = mk('div', ['sb-bubble-top'], b);
    mk('p', ['sb-eyebrow'], top).text = 'Summary';
    mk('button', ['sb-close'], top);
    mk('p', ['sb-bubble-t'], b).text = 'The whole text, word for word.';
  }
}

/** Check one drawn screen in each of the three ways; failures are pushed as words. */
function checkScreen(app, where, fails, seen) {
  for (const way of WAYS) {
    const root = document.documentElement;
    const attrs = { ...(root.attrs || {}) };
    if (way.attr) attrs['data-theme'] = way.attr; else delete attrs['data-theme'];
    const tree = treeOf(app.view, { className: root.className, attrs });
    // A clipped text's fade is drawn only once the browser measures the text as cut (`over`): read every box as cut.
    for (const n of nodes(tree)) if (['sb-sumclip', 'sb-lineclip', 'v2-e1'].some((c) => n.cls.has(c))) n.cls.add('over');
    openBubbles(tree);
    cascade(tree, RULES, way.env);
    const fail = (n, words) => { const k = `${way.theme} ${label(n)} ${words}`; if (!seen.has(k)) { seen.add(k); fails.push(`${where} · ${way.name} · ${label(n)}: ${words}`); } };
    if (!tree.cls.has('sb') || !tree.cls.has('v2-page')) fail(tree, 'the screen is not on mockup v2\'s ground (html.sb.v2-page)');
    // The nine colours, from the values the screen resolves to.
    const t = Object.fromEntries(NINE.map((k) => [k, hexOf((tree.custom.get(k) || {}).value || '')]));
    for (const k of NINE) if (!t[k]) fail(tree, `${k} has no value`);
    for (let i = 0; i < NINE.length && NINE.every((k) => t[k]); i++) {
      for (let j = i + 1; j < NINE.length; j++) {
        const d = de2000(hexLab(t[NINE[i]]), hexLab(t[NINE[j]]));
        if (d < 10) fail(tree, `${NINE[i]} and ${NINE[j]} only ${d.toFixed(1)} apart`);
      }
    }
    for (const n of nodes(tree)) {
      // A shape inside an SVG paints only its fill and stroke: a background or border reaching it (style.css's
      // `.bar`, the accepted view's) draws nothing.
      let inSvg = false;
      for (let a = n.parent; a; a = a.parent) if (a.tag === 'svg') inSvg = true;
      for (const prop of inSvg ? ['fill', 'stroke'] : COLOUR_PROPS) {
        const v = n.declared.get(prop);
        if (v != null) for (const w of offTokens(v, way.theme, prop)) fail(n, `${prop}: ${w} (${n.decl.get(prop).sel})`);
      }
      for (const [pe, p] of Object.entries(n.pseudo)) {
        for (const prop of COLOUR_PROPS) {
          const v = p.declared.get(prop);
          if (v != null) for (const w of offTokens(v, way.theme, prop)) fail(n, `::${pe} ${prop}: ${w} (${p.decl.get(prop).sel})`);
        }
      }
      // The fade at a clipped text's cut ends in the colour of the ground behind it (AC88: "the dark card's colour").
      const after = n.pseudo.after && n.pseudo.after.declared.get('background');
      if (n.cls.has('over') && after && /gradient/.test(plain(after))) {
        const end = marks(after).pop();
        const ground = groundOf(n);
        if (!end || !ground || end.value.toLowerCase() !== ground) fail(n, `the fade ends in ${end ? `${end.name} ${end.value}` : 'nothing'}, the ground behind it is ${ground}`);
      }
      if (n.tag === 'textarea' && parseFloat(n.style.get('font-size')) < 16) fail(n, `a text box at ${n.style.get('font-size')}`);
      if (!n.text.trim()) continue;
      let hidden = false;
      for (let a = n; a; a = a.parent) if (a.cls.has('sb-vh')) hidden = true;
      if (hidden) continue;
      const fg = hexOf(n.style.get('color') || '');
      const bg = groundOf(n);
      if (!fg || !bg) { fail(n, `text "${n.text.trim().slice(0, 30)}" with no resolved colour (${n.style.get('color')}) or ground (${bg})`); continue; }
      const size = parseFloat(n.style.get('font-size') || '16');
      const large = size >= 24 || (size >= 18.66 && Number(n.style.get('font-weight')) >= 700);
      const r = contrast(fg, bg);
      if (r < (large ? 3 : 4.5)) fail(n, `"${n.text.trim().slice(0, 30)}" ${fg} on ${bg}: ${r.toFixed(2)}:1`);
    }
  }
}

async function opened(setup, hash = '#/', { now = NOW, store = null } = {}) {
  const app = await loadSandbox({ ...setup, hash, now, store });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
const hrefsIn = (app, re) => {
  const out = [];
  const walk = (n) => { for (const c of n.children || []) { if (c.tag === 'a' && re.test(c.attrs.href || '') && !out.includes(c.attrs.href)) out.push(c.attrs.href); walk(c); } };
  walk(app.view);
  return out;
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Every trial-view screen and sheet the fixtures reach: Home and its sheets, Waiting and each card's sheet, Plan and its sheets, and each project's screens. */
async function everyScreen(app, projects, where, fails, seen, counts) {
  const visit = async (hash) => {
    await app.go('#/');
    await app.go(hash);
    checkScreen(app, `${where} ${hash}`, fails, seen);
    counts.screens++;
  };
  await visit('#/');
  await visit('#/since');
  for (const r of PF_ROWS) await visit(`#/pf/${r}`);
  await visit('#/waiting');
  for (const h of hrefsIn(app, /^#\/waiting\/card\//)) await visit(h);
  await visit('#/work');
  for (const h of hrefsIn(app, /^#\/work\/ms\//).slice(0, 3)) await visit(h);
  for (const p of projects) {
    const base = `#/p/${encodeURIComponent(p.name)}`;
    await visit(base);
    await visit(`#/waiting/${encodeURIComponent(p.name)}`);
    if (p.model === 'v3') for (const s of ['info', 'values', 'experiments', 'timeline', 'notes']) await visit(`${base}/${s}`);
    else await visit(`${base}/pipeline`);
    for (const s of ['asked', 'agents', 'team']) await visit(`${base}/${s}`);
    await app.go(`${base}/team`);
    for (const m of hrefsIn(app, new RegExp(`^${esc(base)}/team/[^/]+$`))) {
      await visit(m);
      for (const s of hrefsIn(app, new RegExp(`^${esc(m)}/(now|e/\\d+)$`)).slice(0, 2)) await visit(s);
    }
  }
  await visit('#/p/No-such-project');
}

test('AC88: the theme is the phone\'s own setting, followed at once, with no switch on the desk; mockup v2\'s dark tokens in both dark blocks, the vermilion #ff6a3d with --on-you #0f1012 on it (6.69:1)', () => {
  const css = SANDBOX_CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  const block = (open) => { const i = css.indexOf(open); assert.ok(i >= 0, open); return css.slice(i, css.indexOf('}', i)); };
  const pick = (text) => Object.fromEntries([...text.matchAll(/(--[a-z0-9-]+):\s*([^;]+?)\s*(?=;|$)/g)].map((m) => [m[1], m[2].trim()]));
  const media = pick(block('html.sb:not([data-theme="light"]) .v2, html.sb.v2-page:not([data-theme="light"]) {'));
  const forced = pick(block('html.sb[data-theme="dark"] .v2, html.sb.v2-page[data-theme="dark"] {'));
  for (const k of AC81) assert.equal(media[k], THEME.dark[k], `${k}: the phone's dark setting`);
  for (const k of AC81) assert.equal(forced[k], THEME.dark[k], `${k}: data-theme="dark"`);
  assert.match(css, /@media \(prefers-color-scheme: dark\) \{\s*html\.sb:not\(\[data-theme="light"\]\) \.v2, html\.sb\.v2-page:not\(\[data-theme="light"\]\)/, 'the phone\'s setting, as a media query the browser follows the moment it changes');
  assert.equal(THEME.dark['--you'], '#ff6a3d');
  assert.equal(THEME.dark['--on-you'], '#0f1012');
  assert.equal(contrast('#0f1012', '#ff6a3d').toFixed(2), '6.69', 'as measured (Facts relied on)');
  // No switch: the desk never sets a theme of its own.
  assert.doesNotMatch(JS, /data-theme|colorScheme|prefers-color-scheme/, 'sandbox.js sets no theme');
  assert.doesNotMatch(readFileSync(join(SRC, 'public', 'index.html'), 'utf8'), /data-theme/);
  // Every trial-view screen on mockup v2's ground (stage 7): the root takes `v2-page` when the sandbox starts and on every drawing.
  assert.match(JS, /document\.documentElement\.classList\.add\('sb'\);\n[^\n]*\n[^\n]*\n\s*document\.documentElement\.classList\.add\('v2-page'\);/);
  assert.doesNotMatch(JS, /classList\.toggle\('v2-page'/, 'never taken off for a screen no frame redraws');
});

test('AC88: every trial-view screen and sheet, from each fixture, in dark (forced, and the phone\'s own) and light — every colour, background, border, mark and shadow resolves to one of AC81\'s tokens with the theme\'s value; every text at least 4.5:1 (3:1 at 24 px); the nine colours 10 apart; text boxes 16 px; each fade the colour of its ground', async () => {
  const fails = [];
  const seen = new Set();
  const counts = { screens: 0 };
  // AC62's and AC81's fixtures: Service-Desk at 3117150, Alpha (one of each kind, made up), Delta (v2.5, poom/'s placeholder form).
  const t = textSetup();
  let app = await opened(t);
  try {
    await everyScreen(app, t.config.projects, 'text', fails, seen, counts);
  } finally {
    app.restore();
  }
  // md-extremes: five projects, long titles and long records.
  const x = extremes();
  app = await opened(x);
  try {
    await everyScreen(app, x.config.projects.filter((p) => ['Delta', 'Epsilon-with-a-very-long-project-name-that-wraps'].includes(p.name)), 'md-extremes', fails, seen, counts);
  } finally {
    app.restore();
  }
  // Service-Desk with J12's built pull requests (its Timeline's sprints and checks, its Team's sessions).
  app = await opened({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } });
  try {
    await everyScreen(app, [SD3], 'service-desk + J12', fails, seen, counts);
  } finally {
    app.restore();
  }
  // Plan's fixtures (Service-Desk at 77bfeae, the planning project, with made-up estimates).
  const w = waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } });
  app = await opened(w, '#/work', { now: Date.parse('2026-10-18T18:00:00Z'), store: memStore() });
  try {
    await everyScreen(app, [], 'plan', fails, seen, counts);
  } finally {
    app.restore();
  }
  assert.ok(counts.screens > 150, `${counts.screens} screens and sheets drawn`);
  assert.deepEqual(fails, []);
});
