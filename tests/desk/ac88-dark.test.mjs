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
import { loadSandbox, findAll, openIdle } from './sandbox-helpers.mjs';
import { NOW, extremes } from './sandbox-fixtures.mjs';
import { textSetup } from './screen-text.mjs';
import { SD3, sdRepo } from './tv2-fixtures.mjs';
import { waSetup, WORKED, memStore } from './wa-fixtures.mjs';
import { cosLanes, ownerStubs, LANES_NOW } from './lanes-fixtures.mjs';
import { CONFIG } from './helpers.mjs';
import { parseCss, treeOf, cascade, nodes, COLOUR_PROPS } from './css-cascade.mjs';
import { hexLab, de2000 } from './ciede2000.mjs';
import { PF_ROWS } from '../../src/public/lib/portfolio.js';
import { OPENED_WORDS, GONE_WORDS } from '../../src/lib/notifyview.js';
import { pfFiles, cardText, withPortfolio, addPortfolio } from './pf-fixtures.mjs';
import { BAD_PR } from './fake-desk.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';

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
/** AC81's roles' sizes (--t-title 24, --t-sheet 18, --t-lead 15, --t-row and --t-body 13, --t-small 12, --t-label and --t-mono 11), and AC63's 16 px text box. */
const ROLE_PX = [24, 18, 15, 13, 12, 11, 16];
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

const inSheet = (n) => { for (let a = n.parent; a; a = a.parent) if (a.cls.has('v2-sheet') || a.cls.has('sb-sheet')) return true; return false; };
const inV2Sheet = (n) => { for (let a = n.parent; a; a = a.parent) if (a.cls.has('v2-sheet')) return true; return false; };
const textOf = (n) => `${n.text}${n.kids.map(textOf).join('')}`.trim();
const pxOf = (v) => { const m = /^([\d.]+)px$/.exec(plain(v || '').trim()); return m ? Number(m[1]) : 0; };
/** A target alone on its row: its parent holds no words of its own and no other element. */
const alone = (n) => n.parent && !n.parent.text.trim() && n.parent.kids.length === 1 && !['main', 'body', 'html'].includes(n.parent.tag);
/** A shorthand's top and bottom (margin: 8px 0 → [8, 8]), in px. */
const edges = (v) => { const p = plain(v || '').trim().split(/\s+/).map((x) => (/^[\d.]+px$/.test(x) ? parseFloat(x) : 0)); return p.length ? [p[0], p.length > 2 ? p[2] : p[0]] : [0, 0]; };
const side = (n, prop, k) => { const one = n.declared.get(`${prop}-${k ? 'bottom' : 'top'}`); return one != null ? pxOf(one) : edges(n.declared.get(prop))[k]; };
const rowGap = (n) => { const g = n.declared.get('row-gap') || n.declared.get('gap'); return /^(grid|flex)$/.test(plain(n.declared.get('display') || '')) ? edges(g)[0] : 0; };
const isTarget = (n) => ['a', 'button', 'summary', 'textarea'].includes(n.tag) && n.attrs.tabindex !== '-1';
const holdsTarget = (n) => isTarget(n) || n.kids.some(holdsTarget);
/** Laid out side by side: a flex row, or a grid with columns. */
const sideways = (n) => { const d = plain(n.declared.get('display') || ''); return /flex/.test(d) ? !/column/.test(plain(n.declared.get('flex-direction') || '')) : /grid/.test(d) && /\S\s+\S/.test(plain(n.declared.get('grid-template-columns') || '').trim()); };
/** The nearest target above or below an undersized one, when it lies within 12 px of its centre (the declared margins, padding and gaps between). */
function crowded(n) {
  const need = 12 - parseFloat(n.style.get('line-height') || '16') / 2;
  for (const k of [0, 1]) {
    let cur = n;
    let space = 0;
    for (let level = 0; cur.parent && level < 5; level++) {
      const p = cur.parent;
      if (sideways(p)) break;
      const sibs = p.kids;
      const i = sibs.indexOf(cur);
      const nb = k ? sibs[i + 1] : sibs[i - 1];
      space += side(cur, 'margin', k);
      if (nb) {
        space += rowGap(p) + side(nb, 'margin', 1 - k);
        if (holdsTarget(nb) && space < need) return `${space} px from the target ${k ? 'below' : 'above'} (${label(nb)}), under the ${need.toFixed(1)} px WCAG's spacing exception needs`;
        break;
      }
      space += side(p, 'padding', k);
      cur = p;
    }
  }
  return null;
}
const stretched = (n) => [n, ...n.kids].some((k) => k.pseudo && k.pseudo.after && /^0(px)?$/.test(plain(k.pseudo.after.declared.get('inset') || '').trim()));

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
    // M3D stage 1 (AC89 (c)): the waits row's short names, cut at two lines, fade into the page's ground too.
    // M3D stage 4 (AC49): a Chief of Staff row's piece, cut at one line, fades into the log's ground too.
    for (const n of nodes(tree)) if (['sb-sumclip', 'sb-lineclip', 'v2-e1', 'v2-wn', 'sb-brow-of'].some((c) => n.cls.has(c))) n.cls.add('over');
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
      // Quoted record text on a sheet keeps a panel of its own, its ground not the sheet's (stage 7's design review, F2);
      // and the whole record looks one way on every card's sheet: on --bg2, as the question's and the gate's folds have it.
      if ((n.cls.has('sb-record') || n.cls.has('sb-quote')) && inSheet(n)) {
        const own = groundOf(n);
        const under = groundOf(n.parent);
        if (!own || own === under) fail(n, `quoted record text on ${own}, the sheet's own ground (${under}): no panel of its own`);
        const first = marks(n.declared.get('background') || n.declared.get('background-color') || '')[0];
        if (n.cls.has('sb-record') && inV2Sheet(n) && (!first || first.name !== '--bg2')) fail(n, `the whole record on ${first ? first.name : 'no ground'}, not --bg2`);
      }
      // A link or button alone on its row is a target at least 24 px tall, or, smaller, has no other target within 12 px of
      // its centre above or below it (WCAG 2.5.8 and its spacing exception; stage 7's design review, F3: a group's first link
      // flush under its summary). A link inside a sentence is WCAG's inline exception; one stretched over its card
      // (::after, inset 0) takes the card's size.
      if (!inSvg && (n.tag === 'a' || n.tag === 'button') && alone(n) && !stretched(n) && n.attrs.tabindex !== '-1') {
        const px = Math.max(pxOf(n.declared.get('min-height')), pxOf(n.declared.get('height')));
        const near = px < 24 ? crowded(n) : null;
        if (near) fail(n, `"${textOf(n).slice(0, 30)}", ${px ? `${px} px` : 'its text\'s height'} tall, ${near}`);
      }
      if (!n.text.trim()) continue;
      let hidden = false;
      for (let a = n; a; a = a.parent) if (a.cls.has('sb-vh')) hidden = true;
      if (hidden) continue;
      const fg = hexOf(n.style.get('color') || '');
      const bg = groundOf(n);
      if (!fg || !bg) { fail(n, `text "${n.text.trim().slice(0, 30)}" with no resolved colour (${n.style.get('color')}) or ground (${bg})`); continue; }
      const size = parseFloat(n.style.get('font-size') || '16');
      const large = size >= 24 || (size >= 18.66 && Number(n.style.get('font-weight')) >= 700);
      // After MD3, stage 8 ((b) item 37; stage 8's review, round 1, B1: `.sb-unb-t` lost its role and no test saw it): every drawn
      // text takes one of AC81's roles' sizes (24, 18, 15, 13, 12 and 11 px; 16 px for text boxes, AC63), never one of its own.
      const fpx = parseFloat(n.style.get('font-size') || '');
      if (!ROLE_PX.includes(fpx)) fail(n, `"${n.text.trim().slice(0, 30)}" at ${n.style.get('font-size')}: no role's size`);
      // After MD3, stage 8 ((b) item 37): a text drawn under an opacity below 1 is a contrast the cascade can't read, so it fails.
      if (n.opacity < 1) { fail(n, `"${n.text.trim().slice(0, 30)}" under opacity ${n.opacity}: its contrast not read`); continue; }
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
async function everyScreen(app, projects, where, fails, seen, counts, check = checkScreen) {
  const visit = async (hash) => {
    await app.go('#/');
    await app.go(hash);
    check(app, `${where} ${hash}`, fails, seen);
    counts.screens++;
    if (/\/team\/[^/]+\/now(\/[^/]+)?$/.test(hash)) counts.now = (counts.now || 0) + 1;
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
    // AC67, changed (stage 4 of "After MD3"): the idle members' cards behind "<n> idle ›", opened, are a screen to check
    // too, and their pages are reached from there.
    if (findAll(app.view, (e) => e.dataset && e.dataset.k === 'team-idle').length) {
      await openIdle(app);
      check(app, `${where} ${base}/team (idle opened)`, fails, seen);
      counts.screens++;
    }
    for (const m of hrefsIn(app, new RegExp(`^${esc(base)}/team/[^/]+$`))) {
      await visit(m);
      // After MD3, stage 8: a Chief of Staff "now" row opens its own piece's sheet at `now/<lane>` (stage 4's design
      // review, B1), so both forms of the Working now sheet's address are walked.
      for (const s of hrefsIn(app, new RegExp(`^${esc(m)}/(now(/[^/]+)?|e/\\d+)$`)).slice(0, 2)) await visit(s);
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
  // The tap's line (AC74), in both of its states, on the screen each opens: "That no longer waits on you" over the
  // project's page, and "Opened from a notification" in a card's sheet (stage 7's design review, F1).
  for (const [key, words, cls] of [['Alpha|question|questions/Alpha-gone.md', GONE_WORDS, 'sb-tap'], ['Alpha|question|questions/Alpha-pick.md', OPENED_WORDS, 'v2-tap']]) {
    app = await loadSandbox({ ...textSetup(), hash: '', search: `?sandbox&open=${encodeURIComponent(key)}`, now: NOW });
    try {
      await app.advance(1000);
      await app.advance(61_000);
      const line = findAll(app.view, (e) => e.dataset && e.dataset.k === 'tap-banner')[0];
      assert.ok(line && line.textContent === words && ` ${line.className} `.includes(` ${cls} `), `the tap's line: ${line ? `${line.className} "${line.textContent}"` : 'none'}`);
      checkScreen(app, `tap ${words} ${app.loc.hash}`, fails, seen);
      counts.screens++;
    } finally {
      app.restore();
    }
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
  // From stage 6b (AC87, J23; "6b, whenever it lands, brings its own parts in both themes", the stage table): the
  // portfolio's parts from a made-up portfolio (NOT real records, tests/desk/pf-fixtures.mjs): the block's 6b rows and
  // their sheets, a card on the board under "Portfolio" and its sheet, Plan's ideas in each state; then a refused read's words.
  for (const [fail, where] of [[null, 'portfolio'], [{ state: 'cant-read', reason: 'no-access' }, 'portfolio refused']]) {
    const p = waSetup({});
    p.config = withPortfolio(p.config);
    const r = addPortfolio(p.repos, pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1), 'PF-002-odd.md': 'Not a card (made up, NOT a real record)\n' } }));
    if (fail) r.fail = fail;
    app = await opened(p, '#/', { now: Date.parse('2026-10-22T18:00:00Z'), store: memStore() });
    try {
      await everyScreen(app, [], where, fails, seen, counts);
    } finally {
      app.restore();
    }
  }
  assert.ok(counts.screens > 150, `${counts.screens} screens and sheets drawn`);
  assert.deepEqual(fails, []);
});

// After MD3, stage 8 ((b) item 37; the plan review of draft 1, B1): where vermilion is drawn on the screens, through the
// cascade, as AC69's note lists it (specs/S-001.md:6219-6236, "Settled after MD3, as main draws it"): only on the ◆ (a
// plain-circle `.sb-ic.i-you`, or the state icon's `.you` diamond), Waiting's badge, and the kind icons of cards in
// "Waiting on you" and "Kicked back". A colour is vermilion when it comes from --you or one of the owner's lane shades
// (--you0 to --you3) as a literal, or has the theme's --you value under any name.
const byClassIn = (root, c) => (root ? findAll(root, (e) => ` ${e.className || ''} `.includes(` ${c} `)) : []);
const VERMILION_NAMES = ['--you', '--you0', '--you1', '--you2', '--you3'];
/** Where a vermilion use sits, by AC69's list, or null when the list has no place for it. */
function vermilionPlace(n) {
  const up = (pred) => { for (let a = n.parent; a; a = a.parent) if (pred(a)) return a; return null; };
  if (n.tag === 'span' && n.cls.has('sb-ic') && n.cls.has('i-you')) return 'the ◆';
  if (n.tag === 'path' && n.cls.has('you') && n.parent && n.parent.tag === 'svg' && n.parent.cls.has('st-you')) return 'the ◆';
  if (n.tag === 'span' && n.cls.has('v2-badge') && up((a) => a.cls.has('v2-bar'))) return "Waiting's badge";
  if (n.tag === 'svg' && n.cls.has('v2-k') && n.parent && n.parent.cls.has('v2-kd') && !n.parent.cls.has('done')) {
    const lane = up((a) => a.tag === 'section' && a.cls.has('v2-lane'));
    if (lane && ['wait', 'kick'].includes(lane.attrs['data-lane'])) return `a card's kind icon in ${lane.attrs['aria-label']}`;
  }
  return null;
}
function vermilionCheck(app, where, fails, seen, places) {
  for (const way of WAYS) {
    const root = document.documentElement;
    const attrs = { ...(root.attrs || {}) };
    if (way.attr) attrs['data-theme'] = way.attr; else delete attrs['data-theme'];
    const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, way.env);
    const you = THEME[way.theme]['--you'].toLowerCase();
    const isYou = (v) => marks(v).some((m) => VERMILION_NAMES.includes(m.name) || m.value.toLowerCase() === you);
    for (const n of nodes(tree)) {
      const uses = [];
      for (const prop of COLOUR_PROPS) if (n.declared.get(prop) != null && isYou(n.declared.get(prop))) uses.push(prop);
      for (const [pe, p] of Object.entries(n.pseudo)) for (const prop of COLOUR_PROPS) if (p.declared.get(prop) != null && isYou(p.declared.get(prop))) uses.push(`::${pe} ${prop}`);
      // A text in vermilion, by its own rule or its parent's.
      if (n.text.trim() && isYou(n.style.get('color') || '')) uses.push('its text');
      if (!uses.length) continue;
      const place = vermilionPlace(n);
      if (place && !uses.includes('its text')) { places.add(place); continue; }
      const k = `${way.theme} ${label(n)} ${uses.join(', ')}`;
      if (!seen.has(k)) { seen.add(k); fails.push(`${where} · ${way.name} · ${label(n)}${n.text.trim() ? ` "${n.text.trim().slice(0, 30)}"` : ''}: vermilion ${uses.join(', ')}, not on AC69's list`); }
    }
  }
}

test('AC88 + AC69 (after MD3, stage 8; (b) item 37, the plan review of draft 1, B1): where vermilion is drawn — on every trial-view screen and sheet, from each fixture, in dark (forced, and the phone\'s own) and light, only on the ◆, Waiting\'s badge, and the kind icons of cards in "Waiting on you" and "Kicked back" (AC69\'s note, specs/S-001.md:6219-6236); never on a board card\'s edge or buttons, the owner\'s Team tile, the waits list or "Your last action"', async () => {
  const fails = [];
  const seen = new Set();
  const places = new Set();
  const counts = { screens: 0 };
  const check = (app, where, f, s) => vermilionCheck(app, where, f, s, places);
  const t = textSetup();
  let app = await opened(t);
  try {
    await everyScreen(app, t.config.projects, 'text', fails, seen, counts, check);
  } finally {
    app.restore();
  }
  const x = extremes();
  app = await opened(x);
  try {
    await everyScreen(app, x.config.projects, 'md-extremes', fails, seen, counts, check);
  } finally {
    app.restore();
  }
  app = await opened({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } });
  try {
    await everyScreen(app, [SD3], 'service-desk + J12', fails, seen, counts, check);
  } finally {
    app.restore();
  }
  const w = waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } });
  app = await opened(w, '#/work', { now: Date.parse('2026-10-18T18:00:00Z'), store: memStore() });
  try {
    await everyScreen(app, [], 'plan', fails, seen, counts, check);
  } finally {
    app.restore();
  }
  // A card kicked back (AC80): marked done in its sheet, and GitHub not showing it done at the first poll after 5 minutes.
  const k = textSetup();
  app = await opened(k, '#/waiting', { store: memStore() });
  try {
    const keyed = (key) => findAll(app.view, (e) => e.dataset && e.dataset.k === key)[0] || null;
    const ids = hrefsIn(app, /^#\/waiting\/card\//);
    let kicked = 0;
    for (const h of ids) {
      if (kicked) break;
      await app.go(h);
      const done = keyed('sheet-done');
      if (!done) continue;
      await app.tap(done);
      await app.go('#/waiting');
      for (let i = 0; i < 6; i++) await app.advance(POLL_MS);
      kicked = byClassIn(findAll(app.view, (e) => e.dataset && e.dataset.lane === 'kick')[0], 'v2-card').length;
    }
    assert.ok(kicked >= 1, 'a card kicked back');
    // And one marked done just now, still confirming in Done (its kind icon grey).
    for (const h of hrefsIn(app, /^#\/waiting\/card\//)) {
      await app.go(h);
      const done = keyed('sheet-done');
      if (!done) continue;
      await app.tap(done);
      break;
    }
    await app.go('#/waiting');
    assert.ok(byClassIn(findAll(app.view, (e) => e.dataset && e.dataset.lane === 'done')[0], 'v2-kd').length >= 1, 'a card confirming in Done');
    await everyScreen(app, [], 'kicked back', fails, seen, counts, check);
  } finally {
    app.restore();
  }
  // The owner's own running log (its lanes take --you0 to --you3's names, each set to a grey on the trial view's screens).
  const o = ownerStubs();
  app = await opened({ config: { ...CONFIG, projects: o.projects }, repos: o.repos }, '#/p/Lanes-owner/team/owner', { now: LANES_NOW });
  try {
    check(app, 'owner log', fails, seen);
    counts.screens++;
  } finally {
    app.restore();
  }
  assert.ok(counts.screens > 250, `${counts.screens} screens and sheets drawn`);
  assert.deepEqual(fails, []);
  // Each place on the list was drawn, so the check read vermilion where it is meant to be.
  for (const want of ['the ◆', "Waiting's badge", 'a card\'s kind icon in Waiting on you', 'a card\'s kind icon in Kicked back']) assert.ok(places.has(want), `${want}: ${JSON.stringify([...places])}`);
});

// Stage 8 (AC44, step 4; the Reviewer's B1, stage 8 round 1): the rules stage 8 removed from sandbox.css were the ones
// nothing draws once the desk is `/`, so taking them out changes nothing the owner sees. Every desk screen and sheet from
// each fixture is cascaded twice, in dark (forced and the phone's own) and light: once with the stylesheets as they stood
// at bd4097d, before stage 8 (tests/desk/fixtures/stage8/sandbox-bd4097d.css, a copy; style.css is unchanged), and once
// with today's. Every property every element is given, its ::before and ::after, and each text's computed font and colour
// must come out the same. Stage 8's own changes (the marker gone, the hold and merge sheets' whole-record fold, AC17's and
// AC18's notes) are new or missing elements, not a different look for the same one, so none is excepted.
const BEFORE_RULES = (() => {
  const a = parseCss(STYLE_CSS, 'style.css');
  const b = parseCss(readFileSync(join(SRC, '..', 'tests', 'desk', 'fixtures', 'stage8', 'sandbox-bd4097d.css'), 'utf8'), 'sandbox.css@bd4097d').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const LOOK = ['font-size', 'font-weight', 'font-family', 'line-height', 'color', 'fill', 'stroke', 'visibility'];
/**
 * The one change stage 8 makes to an element's look on purpose, named here and nothing else excepted: the Design
 * reviewer's round 1 (non-blocking, part B item 26; frames H1, 1, 5 and 11), "Top spacing is tighter than the frames ...
 * Mockup v2's .scr has 14 px top padding (desk-v2.html:97)": every screen's top padding becomes 14 px, and the
 * Timeline's pinned head moves up those 14 px to sit flush at the top, as frame 7b's `.thead` (desk-v2.html:278).
 */
const excepted = new Set();
const STAGE8_TOP = (n, d) => (n.cls.has('sb-screen') && n.parent && n.parent.attrs.id === 'view' && /^padding-top: (4px|\(none\)) → 14px$/.test(d))
  || (n.cls.has('v2-tlhead') && n.parent && n.parent.cls.has('v2-timeline') && d === 'margin-top: (none) → -14px');
/**
 * M3D stage 1's one change to an element's look on purpose (the brief's after-MD3 rule, specs/S-001.md:15549-15553; AC89 (c),
 * :7863-7870): a project page's waits row, its short names cut at two lines (part A item 16). Only the names' own box
 * under a page row's title (`span.v2-small.v2-wn`, in `.v2-prt` of an `a.v2-prow`) takes these four declarations, and
 * nothing else is excepted; the fade at its cut is drawn only once the browser measures it cut, and AC88's test above
 * checks its colour.
 */
const M3D1_WAITS = new Set(['display: (none) → block', 'position: (none) → relative', 'max-height: (none) → calc(2 * 1.4em)', 'overflow: (none) → clip']);
/**
 * M3D stage 3's one change to the look on purpose (the brief's after-MD3 rule, specs/S-001.md:15549-15553; AC90,
 * :8011-8028): a "not yet" reason said once per group — on Plan, the box under a group's head holding its shared reasons
 * (`div.v2-plonce`, in a `.v2-plgrp`), and on the Timeline, the line under a band (`p.v2-msd.gap.v2-tonce`, in a
 * `.v2-tblk`), in line with the rail's milestones. Only these declarations, on only these elements; Home's line takes no
 * rule of its own.
 */
const M3D3_ONCE = new Map([['v2-plonce', new Set(['display: (none) → grid', 'gap: (none) → 2px', 'padding: (none) → 2px 0 4px'])],
  ['v2-tonce', new Set(['padding: (none) → 8px 0 2px 26px'])]]);
const M3D3_EXCEPT = (n, d) => (n.cls.has('v2-plonce') && n.tag === 'div' && n.parent && n.parent.cls.has('v2-plgrp') && M3D3_ONCE.get('v2-plonce').has(d))
  || (n.cls.has('v2-tonce') && n.tag === 'p' && n.cls.has('v2-msd') && n.cls.has('gap') && n.parent && n.parent.cls.has('v2-tblk') && M3D3_ONCE.get('v2-tonce').has(d));
/**
 * M3D stage 4's changes to the look on purpose (the brief's after-MD3 rule, specs/S-001.md:15549-15553; AC67, changed,
 * :6093-6105): on the Team screen, the idle members' one line (`button.sb-idle`, a 44 px control in the meta role and ink,
 * where a button had the browser's own look) and the opened list under it (`div.sb-idlelist`). Each declaration is pinned
 * to its value, before and after, in each theme (the Reviewer's B1, stage 4 round 1: "pin each excepted declaration's
 * value, as M3D1_WAITS and M3D3_ONCE do"); only these, on only these elements. And on the Chief of Staff's log (AC49,
 * changed, :3718-3722), a helper or end row's piece (`span.sb-brow-of`, in a log row's link), cut at one line: from stage
 * 8 the walk reaches it, on the made-up log of four pieces open together, so its four declarations are pinned too, the
 * same in each theme; its fade is drawn only once the browser measures it cut.
 */
const M3D4_FONT = 'font: inherit → 400 12px/1.4 "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const M3D4_IDLE = ['display: (none) → flex', 'align-items: (none) → center', 'width: (none) → 100%', 'min-height: (none) → 44px', 'margin-top: (none) → 8px',
  'text-align: (none) → left', M3D4_FONT, 'computed font-size: 13px → 12px', 'computed line-height: 18.849999999999998px → 16.799999999999997px'];
const M3D4_LIST = ['display: (none) → grid', 'gap: (none) → 8px'];
const M3D4_OF = ['position: (none) → relative', 'flex: (none) → 1 1 100%', 'max-height: (none) → 1.35em', 'overflow: (none) → clip'];
const M3D4_ONCE = new Map([
  ['light', new Set([...M3D4_IDLE, 'color: #1b1b1b → #18191c', 'computed color: #1b1b1b → #18191c'].map((d) => `button.sb-idle ${d}`).concat(M3D4_LIST.map((d) => `div.sb-idlelist ${d}`), M3D4_OF.map((d) => `span.sb-brow-of ${d}`)))],
  ['dark', new Set([...M3D4_IDLE, 'color: #1b1b1b → #ecedef', 'color: #e8e8e8 → #ecedef', 'computed color: #1b1b1b → #ecedef', 'computed color: #e8e8e8 → #ecedef']
    .map((d) => `button.sb-idle ${d}`).concat(M3D4_LIST.map((d) => `div.sb-idlelist ${d}`), M3D4_OF.map((d) => `span.sb-brow-of ${d}`)))]]);
const M3D4_EXCEPT = (n, d, theme) => {
  const k = n.cls.has('sb-idle') && n.tag === 'button' ? `button.sb-idle ${d}` : n.cls.has('sb-idlelist') && n.tag === 'div' ? `div.sb-idlelist ${d}`
    : n.cls.has('sb-brow-of') && n.tag === 'span' && n.parent && n.parent.tag === 'a' && n.parent.parent && n.parent.parent.cls.has('sb-brow') ? `span.sb-brow-of ${d}` : null;
  return Boolean(k && M3D4_ONCE.get(theme) && M3D4_ONCE.get(theme).has(k));
};
/**
 * M3D stage 5's changes to the look on purpose (the brief's after-MD3 rule, specs/S-001.md:15549-15553; AC89 (j),
 * :7920-7921): long titles cut at three lines with the fade — a board card's title in its own box under the card's link
 * (`span.v2-tt`, in an `a.v2-t`), and a gate sheet's title in its three-line clip under the sheet's heading
 * (`span.v2-clip.v2-stt`, in an `h2.v2-stitle`), at the title's own line height. Each declaration pinned to its value,
 * the same in each theme; the fade (a mask) is drawn only once the browser measures the title cut. AC17's "Copy" in each
 * choice's box and AC89 (j)'s quoted DEFAULT words are drawn on no screen this guard walks (no fixture here copies, and
 * none has a DEFAULT naming no letter), so nothing is excepted for them.
 */
const M3D5_ONCE = new Map([['v2-tt', new Set(['display: (none) → block', 'max-height: (none) → calc(3 * 1.33em)', 'overflow: (none) → clip'])],
  ['v2-stt', new Set(['display: (none) → block', 'max-height: calc(3 * 1.45em) → calc(3 * 1.3em)'])]]);
const M3D5_EXCEPT = (n, d) => (n.tag === 'span' && n.cls.has('v2-tt') && n.parent && n.parent.tag === 'a' && n.parent.cls.has('v2-t') && M3D5_ONCE.get('v2-tt').has(d))
  || (n.tag === 'span' && n.cls.has('v2-stt') && n.cls.has('v2-clip') && n.parent && n.parent.tag === 'h2' && n.parent.cls.has('v2-stitle') && M3D5_ONCE.get('v2-stt').has(d));
/**
 * G1 of "After the glance audit"'s changes to Home's look on purpose (the brief's rule, specs/S-001.md:16598-16602; AC91 (a)
 * to (c), :8442-8495), each declaration pinned to its value, before and after, in each theme, on only its own element:
 * - (a) the briefing that says what needs the owner (`a.v2-brief.k-you`): "<n> need you" in the sheet-title role, the ◆
 *   sized to it and, with "Waiting ›", centred on its line; and each settle or undo line (`span.v2-bdue`, a new element),
 *   its clock or lock and its words, in 500 12 px ink;
 * - (b) the stalled line (`p.v2-stall`, directly under a tile's name row), drawn as nothing while it says nothing (on a
 *   tile line, `v2-ln v2-stall`, 500 12 px ink, once it does: no fixture this guard walks has a stopped project, so the
 *   AC91 test, from the `stall` state, locks that look);
 * - (c) the corner of a tile the desk can't read with nothing waiting (`span.v2-wt.bad`): its words in --bad, 500 12 px.
 * The red edge of a tile the desk can't draw went with its rule, and that tile's class with it, so no element differs;
 * the signed-out briefing's ✕ and "Since you last looked"'s "Not read since" take rules that were there (`.v2-brief .v2-k.bad`,
 * `.v2-ql.bad`); "At work:"'s value (d) is a plain span in the line's ink; and (e)'s two-line cut is drawn on no screen
 * this guard walks (no fixture here holds a "last looked"), so AC82's and AC91's own cases lock it.
 */
const G1_FONT = (f) => `${f} "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
const G1_LOOK = (ink, ink2, bad) => new Map([
  ['a.v2-brief.k-you', ['grid-template-columns: 16px minmax(0, 1fr) auto → 18px minmax(0, 1fr) auto']],
  ['span.v2-bi', ['padding-top: 2px → 0', 'align-self: (none) → center']],
  ['svg.v2-s.st-you', ['width: 16px → 18px', 'height: 16px → 18px']],
  ['span.v2-bt1', [`font: ${G1_FONT('500 15px/1.35')} → ${G1_FONT('600 18px/1.3')}`, 'computed font-size: 15px → 18px', 'computed font-weight: 500 → 600',
    'computed line-height: 20.25px → 23.400000000000002px']],
  ['span.v2-go', ['padding-top: 3px → 0', 'align-self: (none) → center']],
  ['span.v2-bdue', ['grid-column: (none) → 2 / 4', 'display: (none) → flex', 'gap: (none) → 4px', 'align-items: (none) → flex-start',
    `font: (none) → ${G1_FONT('500 12px/1.35')}`, `color: (none) → ${ink}`]],
  ['svg.v2-k (due)', ['margin-top: (none) → 1px', `color: (none) → ${ink}`]],
  ['span (due words)', ['computed font-size: 13px → 12px', 'computed font-weight: 400 → 500', 'computed line-height: 18.849999999999998px → 16.200000000000003px']],
  ['p.v2-stall', ['display: (none) → none']],
  ['span.v2-wt.bad', [`font: ${G1_FONT('400 12px/1.3')} → ${G1_FONT('500 12px/1.3')}`, `color: ${ink2} → ${bad}`, 'computed font-weight: 400 → 500', `computed color: ${ink2} → ${bad}`]],
]);
const G1_ONCE = new Map([['light', G1_LOOK('#18191c', '#5c5f66', '#b3162a')], ['dark', G1_LOOK('#ecedef', '#a2a5ac', '#ff6b78')]]);
const G1_KEY = (n) => {
  const p = n.parent;
  const brief = (x) => Boolean(x && x.tag === 'a' && x.cls.has('v2-brief') && x.cls.has('k-you'));
  if (brief(n)) return 'a.v2-brief.k-you';
  if (n.tag === 'span' && brief(p)) for (const c of ['v2-bi', 'v2-bt1', 'v2-go', 'v2-bdue']) if (n.cls.has(c)) return `span.${c}`;
  if (n.tag === 'svg' && n.cls.has('st-you') && p && p.tag === 'span' && p.cls.has('v2-bi') && brief(p.parent)) return 'svg.v2-s.st-you';
  if (p && p.tag === 'span' && p.cls.has('v2-bdue') && brief(p.parent)) return n.tag === 'svg' && n.cls.has('v2-k') ? 'svg.v2-k (due)' : n.tag === 'span' && !n.cls.size ? 'span (due words)' : null;
  if (n.tag === 'p' && n.cls.has('v2-stall') && !n.cls.has('v2-ln') && p && p.cls.has('v2-tile')) return 'p.v2-stall';
  if (n.tag === 'span' && n.cls.has('v2-wt') && n.cls.has('bad') && p && p.cls.has('v2-thd')) return 'span.v2-wt.bad';
  return null;
};
const G1_EXCEPT = (n, d, theme) => {
  const k = G1_KEY(n);
  return Boolean(k && G1_ONCE.get(theme) && (G1_ONCE.get(theme).get(k) || []).includes(d)) ? `G1 ${theme} ${k} ${d}` : null;
};
const M3D1_EXCEPT = (n, d) => n.cls.has('v2-wn') && n.cls.has('v2-small') && n.parent && n.parent.cls.has('v2-prt')
  && n.parent.parent && n.parent.parent.cls.has('v2-prow') && M3D1_WAITS.has(d);
function sameLook(app, where, fails, seen) {
  for (const way of WAYS) {
    const root = document.documentElement;
    const attrs = { ...(root.attrs || {}) };
    if (way.attr) attrs['data-theme'] = way.attr; else delete attrs['data-theme'];
    const draw = (rules) => {
      const tree = treeOf(app.view, { className: root.className, attrs });
      for (const n of nodes(tree)) if (['sb-sumclip', 'sb-lineclip', 'v2-e1'].some((c) => n.cls.has(c))) n.cls.add('over');
      openBubbles(tree);
      return nodes(cascade(tree, rules, way.env));
    };
    const before = draw(BEFORE_RULES);
    const now = draw(RULES);
    assert.equal(before.length, now.length);
    const flat = (m) => Object.fromEntries([...m].map(([k, v]) => [k, plain(v)]));
    for (let i = 0; i < now.length; i++) {
      const [a, b] = [before[i], now[i]];
      const diffs = [];
      const da = flat(a.declared);
      const db = flat(b.declared);
      for (const k of new Set([...Object.keys(da), ...Object.keys(db)])) if (da[k] !== db[k]) diffs.push(`${k}: ${da[k] ?? '(none)'} → ${db[k] ?? '(none)'}`);
      for (const pe of ['before', 'after']) {
        const pa = a.pseudo[pe] ? flat(a.pseudo[pe].declared) : {};
        const pb = b.pseudo[pe] ? flat(b.pseudo[pe].declared) : {};
        for (const k of new Set([...Object.keys(pa), ...Object.keys(pb)])) if (pa[k] !== pb[k]) diffs.push(`::${pe} ${k}: ${pa[k] ?? '(none)'} → ${pb[k] ?? '(none)'}`);
      }
      if (b.text.trim()) for (const k of LOOK) if (plain(a.style.get(k) || '') !== plain(b.style.get(k) || '')) diffs.push(`computed ${k}: ${plain(a.style.get(k) || '(none)')} → ${plain(b.style.get(k) || '(none)')}`);
      for (const d of diffs) {
        if (STAGE8_TOP(b, d)) { excepted.add(`${label(b)} ${d}`); continue; }
        if (M3D1_EXCEPT(b, d)) { excepted.add(`${label(b)} ${d}`); continue; }
        if (M3D3_EXCEPT(b, d)) { excepted.add(`${label(b)} ${d}`); continue; }
        if (M3D4_EXCEPT(b, d, way.theme)) { excepted.add(`M3D4 ${way.theme} ${label(b)} ${d}`); continue; }
        if (M3D5_EXCEPT(b, d)) { excepted.add(`M3D5 ${label(b)} ${d}`); continue; }
        const g1 = G1_EXCEPT(b, d, way.theme);
        if (g1) { excepted.add(g1); continue; }
        const k = `${way.theme} ${label(b)} ${d}`;
        if (!seen.has(k)) { seen.add(k); fails.push(`${where} · ${way.name} · ${label(b)}${b.text.trim() ? ` "${b.text.trim().slice(0, 30)}"` : ''}: ${d}`); }
      }
    }
  }
}

test('AC44 step 4 (stage 8; the Reviewer\'s B1, round 1): the rules stage 8 removed change no element\'s look — every desk screen and sheet from each fixture, in dark (forced, and the phone\'s own) and light, cascaded with bd4097d\'s stylesheets and with today\'s, gives every element, its ::before and ::after the same declarations, and every text the same font and colour', async () => {
  const fails = [];
  const seen = new Set();
  const counts = { screens: 0 };
  const t = textSetup();
  let app = await opened(t);
  try {
    await everyScreen(app, t.config.projects, 'text', fails, seen, counts, sameLook);
  } finally {
    app.restore();
  }
  const x = extremes();
  app = await opened(x);
  try {
    await everyScreen(app, x.config.projects, 'md-extremes', fails, seen, counts, sameLook);
  } finally {
    app.restore();
  }
  app = await opened({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } });
  try {
    await everyScreen(app, [SD3], 'service-desk + J12', fails, seen, counts, sameLook);
  } finally {
    app.restore();
  }
  const w = waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } });
  app = await opened(w, '#/work', { now: Date.parse('2026-10-18T18:00:00Z'), store: memStore() });
  try {
    await everyScreen(app, [], 'plan', fails, seen, counts, sameLook);
  } finally {
    app.restore();
  }
  // After MD3, stage 8 ((b) item 37; stage 8's review, round 2, note 1): the states the walk above never reaches. The
  // tap's line in both its states, on the screen each opens (as AC88's test above draws them); a project that can't be
  // read, one whose drawing throws ("Can't show this project"), and the whole desk signed out, each on Home, Waiting
  // and the project's page.
  for (const [key, words] of [['Alpha|question|questions/Alpha-gone.md', GONE_WORDS], ['Alpha|question|questions/Alpha-pick.md', OPENED_WORDS]]) {
    app = await loadSandbox({ ...textSetup(), hash: '', search: `?sandbox&open=${encodeURIComponent(key)}`, now: NOW });
    try {
      await app.advance(1000);
      await app.advance(61_000);
      const line = findAll(app.view, (e) => e.dataset && e.dataset.k === 'tap-banner')[0];
      assert.equal(line && line.textContent, words, 'the tap\'s line is drawn');
      sameLook(app, `tap ${words} ${app.loc.hash}`, fails, seen);
      counts.screens++;
    } finally {
      app.restore();
    }
  }
  const states = [
    ["can't read", (r) => { r.Alpha.fail = { state: 'cant-read', reason: 'not-found' }; }, /Can't read since \d\d:\d\d/, true],
    ['render error', (r) => { r.Alpha.pulls.push(BAD_PR); }, /Can't show this project: /, false],
    ['signed out', (r) => { for (const x of Object.values(r)) x.fail = { kind: 'signed-out' }; }, /Signed out — reload to sign in/, true],
  ];
  for (const [what, make, shown, later] of states) {
    const st = textSetup();
    if (!later) make(st.repos);
    app = await opened(st);
    try {
      if (later) {
        make(st.repos);
        await app.advance(3 * POLL_MS);
      }
      assert.match(app.text(), shown, `${what}: drawn`);
      for (const hash of ['#/', '#/waiting', '#/p/Alpha']) {
        await app.go(hash);
        sameLook(app, `${what} ${hash}`, fails, seen);
        counts.screens++;
      }
    } finally {
      app.restore();
    }
  }
  // After MD3, stage 8: the Chief of Staff's log with four pieces under way at once (made up, NOT real records,
  // lanes-fixtures.mjs), so the walk reaches its "now" rows' Working now sheets, at `now` or, from stage 4's design
  // review (B1), at `now/<lane>`.
  const cl = cosLanes();
  const four = cl.projects.filter((p) => p.name === 'Lanes-four');
  app = await opened({ config: { ...CONFIG, projects: four }, repos: { 'Lanes-four': cl.repos['Lanes-four'] } }, '#/', { now: LANES_NOW });
  try {
    const before = counts.now || 0;
    await everyScreen(app, four, 'lanes-four', fails, seen, counts, sameLook);
    assert.ok((counts.now || 0) > before, 'a Chief of Staff Working now sheet walked');
  } finally {
    app.restore();
  }
  assert.ok(counts.screens > 250, `${counts.screens} screens and sheets drawn`);
  assert.deepEqual(fails, []);
  // The named exception was met, and only in its own forms: Home, Waiting, Plan, a project, Team and the Timeline.
  for (const want of ['section.sb-screen.v2.v2-home padding-top: 4px → 14px', 'section.sb-screen padding-top: (none) → 14px', 'div.v2-tlhead margin-top: (none) → -14px']) {
    assert.ok(excepted.has(want), `${want}: ${JSON.stringify([...excepted])}`);
  }
  // M3D stage 1's exception was met, in exactly its four declarations, and is the only one beside stage 8's.
  for (const d of M3D1_WAITS) assert.ok(excepted.has(`span.v2-small.v2-wn ${d}`), `${d}: ${JSON.stringify([...excepted])}`);
  // M3D stage 3's exception was met, in exactly its declarations; with stage 1's and stage 8's, nothing else is excepted.
  const m3d3 = [...M3D3_ONCE.get('v2-plonce')].map((d) => `div.v2-plonce ${d}`).concat([...M3D3_ONCE.get('v2-tonce')].map((d) => `p.v2-msd.gap.v2-tonce ${d}`));
  for (const x of m3d3) assert.ok(excepted.has(x), `${x}: ${JSON.stringify([...excepted])}`);
  // M3D stage 4's exception was met on the Team screen's idle line and list, each pinned declaration in each theme, and
  // nothing else of it: the excepted set is exactly the pinned one.
  const m3d4 = [...M3D4_ONCE].flatMap(([theme, set]) => [...set].map((x) => `M3D4 ${theme} ${x}`)).sort();
  assert.deepEqual([...excepted].filter((x) => /^M3D4 /.test(x)).sort(), m3d4);
  // M3D stage 5's exception was met, each pinned declaration on its own element, and nothing else of it.
  const m3d5 = [...[...M3D5_ONCE.get('v2-tt')].map((d) => `M3D5 span.v2-tt ${d}`), ...[...M3D5_ONCE.get('v2-stt')].map((d) => `M3D5 span.v2-clip.v2-stt ${d}`)].sort();
  assert.deepEqual([...excepted].filter((x) => /^M3D5 /.test(x)).sort(), m3d5);
  // G1 of "After the glance audit"'s exception was met, each pinned declaration on its own element in each theme, and
  // nothing else of it: the excepted set is exactly the pinned one.
  const g1 = [...G1_ONCE].flatMap(([theme, look]) => [...look].flatMap(([k, ds]) => ds.map((d) => `G1 ${theme} ${k} ${d}`))).sort();
  assert.deepEqual([...excepted].filter((x) => /^G1 /.test(x)).sort(), g1);
  assert.deepEqual([...excepted].filter((x) => !/^(section\.sb-screen|div\.v2-tlhead|M3D[45] |G1 )/.test(x)).sort(), [...[...M3D1_WAITS].map((d) => `span.v2-small.v2-wn ${d}`), ...m3d3].sort());
});

// The running log's lanes (AC49 with the owner's ruling, decisions/questions/P-001-desk-v2-lanes.md, A: "the work lanes
// take three greys from the new look and each lane also gets its own line style (solid, dashed, dotted), so every lane
// looks different at a glance in light and dark"; the Reviewer's B1, stage 7 round 1).
test('AC49 + AC88 (P-001-desk-v2-lanes, A): on every member page\'s running log, in dark (forced and the phone\'s own) and light, at 360 and 414 px, each lane\'s line, curve and dots take one of AC81\'s greys and its own line style; any two lanes differ in their line or in a grey at least 10 apart; each stub, in its lane\'s grey, is drawn as no line, curve or dot on its log is', async () => {
  const fails = [];
  let pages = 0;
  let fourLanes = 0;
  const stubs = { pages: 0, seen: 0, onDash: new Set() };
  const sig = (n) => ({ grey: hexOf(n.declared.get('stroke') || n.style.get('stroke') || ''), dash: plain(n.declared.get('stroke-dasharray') || 'none').trim(),
    fill: hexOf(n.declared.get('fill') || n.style.get('fill') || ''), width: plain(n.declared.get('stroke-width') || '1').trim() });
  // AC88's three ways of showing a screen, each at both widths.
  const ways = WAYS.flatMap((w) => [360, 414].map((width) => ({ ...w, name: `${w.name}, ${width} px`, env: { ...w.env, width } })));
  const apart = (a, b) => a.dash !== b.dash || de2000(hexLab(a.grey), hexLab(b.grey)) >= 10;
  // From stage 4 of "After MD3" (the amendment's (b) item 30, second part): the made-up logs too, the Chief of Staff's with
  // four, then five, lanes open together, and an owner's log with a stub on lanes 2 and 3 (lanes-fixtures.mjs, NOT real).
  const cl = cosLanes();
  const os = ownerStubs();
  for (const setup of [textSetup(), extremes(), { config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } },
    { config: { ...CONFIG, projects: [...cl.projects, ...os.projects] }, repos: { ...cl.repos, ...os.repos }, now: LANES_NOW }]) {
    const app = await opened(setup, '#/', setup.now ? { now: setup.now } : {});
    try {
      for (const p of setup.config.projects) {
        await app.go(`#/p/${encodeURIComponent(p.name)}/team`);
        await openIdle(app); // AC67, changed (stage 4): every member's log, the idle members' too
        for (const m of hrefsIn(app, new RegExp(`^#/p/${esc(encodeURIComponent(p.name))}/team/[^/]+$`))) {
          await app.go(m);
          for (const way of ways) {
            const attrs = { ...(document.documentElement.attrs || {}) };
            if (way.attr) attrs['data-theme'] = way.attr; else delete attrs['data-theme'];
            const tree = cascade(treeOf(app.view, { className: document.documentElement.className, attrs }), RULES, way.env);
            for (const svg of nodes(tree).filter((n) => n.tag === 'svg' && n.cls.has('sb-lanes'))) {
              pages++;
              const where = `${m} · ${way.name} · ${[...svg.cls].join('.')}`;
              const lines = new Map();
              const dots = new Map();
              const stubList = [];
              const drawn = [];
              for (const n of nodes(svg)) {
                const shade = [...n.cls].find((c) => /^shade-\d$/.test(c));
                if (!shade) continue;
                const s = sig(n);
                for (const w of offTokens(n.declared.get('stroke') || '', way.theme, 'stroke')) fails.push(`${where} · ${shade}: ${w}`);
                if (n.cls.has('stub')) { stubList.push({ shade, s }); continue; }
                drawn.push({ kind: n.attrs['data-kind'], shade, s });
                const into = n.attrs['data-kind'] === 'dot' ? dots : lines;
                const was = into.get(shade);
                // One look per lane: its line and its curves out and back alike, and all its dots alike.
                if (was && (was.grey !== s.grey || was.dash !== s.dash || (into === dots && was.fill !== s.fill))) fails.push(`${where} · ${shade} ${n.attrs['data-kind']}: drawn ${JSON.stringify(s)}, its lane ${JSON.stringify(was)}`);
                if (!was) into.set(shade, s);
              }
              if (lines.size >= 4) fourLanes++;
              // AC49's stub, a piece still under way (stage 7's design review, round 2, R2-1): a short dashed stub in its
              // lane's grey, at a weight and in a dash no line, curve or dot on the log has, whatever its lane's style.
              if (stubList.length) stubs.pages++;
              for (const { shade, s } of stubList) {
                stubs.seen++;
                const own = lines.get(shade);
                if (!own) { fails.push(`${where} · ${shade}: a stub with no lane`); continue; }
                stubs.onDash.add(own.dash);
                if (s.grey !== own.grey) fails.push(`${where} · ${shade}: the stub in ${s.grey}, its lane in ${own.grey}`);
                if (s.dash === 'none') fails.push(`${where} · ${shade}: the stub is not dashed`);
                // "A short dashed stub" (AC49, specs/S-001.md:3295; stage 8's brief): each dash at most 3 px on.
                else {
                  const pattern = String(s.dash).split(/[\s,]+/).map(Number);
                  const on = pattern.length % 2 ? [...pattern, ...pattern].filter((_, i) => i % 2 === 0) : pattern.filter((_, i) => i % 2 === 0);
                  if (!on.length || on.some((x) => !(x > 0 && x <= 3))) fails.push(`${where} · ${shade}: the stub's dash, ${s.dash}, is not short (each dash at most 3 px on)`);
                }
                for (const d of drawn) {
                  if (d.kind !== 'dot' && d.s.width === s.width) fails.push(`${where} · ${shade}: the stub's weight, ${s.width}, is the ${d.shade} ${d.kind}'s`);
                  if (d.s.dash === s.dash) fails.push(`${where} · ${shade}: the stub's dash, ${s.dash}, is the ${d.shade} ${d.kind}'s`);
                }
              }
              const shades = [...lines.keys()].sort();
              for (let i = 0; i < shades.length; i++) {
                for (let j = i + 1; j < shades.length; j++) {
                  const [a, b] = [lines.get(shades[i]), lines.get(shades[j])];
                  if (!apart(a, b)) fails.push(`${where}: ${shades[i]} and ${shades[j]} look alike: ${a.grey} ${a.dash} and ${b.grey} ${b.dash}`);
                  const [da, db] = [dots.get(shades[i]), dots.get(shades[j])];
                  if (da && db && da.fill === db.fill && !apart(da, db)) fails.push(`${where}: ${shades[i]}'s and ${shades[j]}'s dots look alike`);
                }
              }
            }
          }
        }
      }
    } finally {
      app.restore();
    }
  }
  assert.ok(pages > 20, `${pages} running logs drawn`);
  // Rewritten for AC49, changed after MD3 (specs/S-001.md:3709-3716): a lane takes the first look no lane open where it starts
  // is using, so the fixtures' own logs (at most three open together) no longer draw all four; the made-up log of four open
  // together does, in each way of showing it.
  assert.ok(fourLanes >= ways.length, `${fourLanes} with all four lanes, the made-up four-open log among them`);
  assert.ok(stubs.seen > 20 && stubs.pages > 5, `${stubs.seen} stubs on ${stubs.pages} logs`);
  assert.deepEqual([...stubs.onDash].sort(), ['0.01 4', '6 4', 'none'], 'stubs on a solid, a dashed and a dotted lane'); 
  assert.deepEqual(fails, []);
});
