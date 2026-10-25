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
import { gatesState, deviceMarks, GATE4, GATE_KEY, MIX_PROJECT, textState, SD, G7_OPENS, G7B_OPENS } from './glance-fixtures.mjs';

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
    // And one marked done just now, still confirming in Done (its kind icon grey). Rewritten in G2 (AC91 (f)): taken from
    // "Waiting on you", since the Kicked back strip, above the lanes, now comes first on the page and its card is the one
    // kept kicked back.
    const waitLane = findAll(app.view, (e) => e.dataset && e.dataset.lane === 'wait')[0];
    for (const h of findAll(waitLane, (e) => e.tag === 'a' && /^#\/waiting\/card\//.test(e.attrs.href || '')).map((a) => a.attrs.href)) {
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
  // G6 of "After the glance audit" (AC92 (d)): a project's page with every phase opened and every run's untracked rows
  // listed (Service-Desk's records at 77bfeae, real, as tests/desk/glance-fixtures.mjs's `text` holds them), so the walk
  // reaches an opened phase's heads, the rule above the standard group, the fold row and the rows' weights, which no
  // screen above opens.
  {
    app = await loadSandbox({ ...textState(), hash: `#/p/${SD.name}`, now: NOW, store: memStore() });
    try {
      await app.advance(1000);
      await app.advance(POLL_MS);
      for (const ph of ['Launch', 'Build', 'Design', 'Discovery']) await app.tap(findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['aria-label'] === ph)[0]);
      for (const b of findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['data-untracked'])) await app.tap(findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['data-untracked'] === b.attrs['data-untracked'])[0]);
      assert.equal(findAll(app.view, (e) => e.attrs && e.attrs['data-untracked'] && e.attrs['aria-expanded'] === 'true').length, 6, 'six runs\' untracked rows listed');
      sameLook(app, 'text phases opened #/p/Service-Desk', fails, seen);
      counts.screens++;
    } finally {
      app.restore();
    }
  }
  assert.ok(counts.screens > 250, `${counts.screens} screens and sheets drawn`);
  assert.deepEqual(fails, []);
  // Each place on the list was drawn, so the check read vermilion where it is meant to be.
  for (const want of ['the ◆', "Waiting's badge", 'a card\'s kind icon in Waiting on you', 'a card\'s kind icon in Kicked back']) assert.ok(places.has(want), `${want}: ${JSON.stringify([...places])}`);
});

// G7 of "After the glance audit" (AC92 (a); AC88, changed: "the cascade check also checks where `--ok` and `--bad` are
// drawn, in both themes: on status marks and the named error and can't-read states only"): every element whose colour,
// ground, border colour or fill (its ::before and ::after too) resolves to --ok or --bad — by name (with the old look's
// --pass, --fail and --block, which the trial view sets to them) or by the theme's value — and every text drawn in either,
// is a status mark AC92 (a) lists or one of its named exceptions, and nothing else; the only border is AC75's warning's.
const OKBAD_NAMES = ['--ok', '--bad', '--pass', '--fail', '--block'];
/** Where a use of --ok or --bad sits, by AC92 (a)'s lists, or null when they have no place for it. */
function okBadPlace(n) {
  const up = (pred) => { for (let a = n.parent; a; a = a.parent) if (pred(a)) return a; return null; };
  const p = n.parent;
  const svg = n.tag === 'svg';
  // Green, on the mark only.
  if (svg && n.cls.has('v2-s') && n.cls.has('st-check') && n.cls.has('ok')) {
    if (p && p.cls.has('v2-msi')) return 'mark: a reached check on the Timeline';
    if (p && p.tag === 'li' && up((a) => a.cls.has('v2-keyl'))) return 'mark: the Timeline key\'s check';
    if (p && p.cls.has('v2-pn')) return 'mark: a finished phase on the page\'s strip';
    if (p && p.cls.has('v2-sm')) return 'mark: a reached check in an opened phase';
    if (p && p.cls.has('v2-c')) return 'mark: a reached check on a Home tile\'s drawing';
    if (p && p.tag === 'li' && up((a) => a.cls.has('v2-plmini'))) return 'mark: a check in Plan\'s Reached list';
    if (p && p.cls.has('v2-prow') && p.attrs['data-k'] === 'page-ci') return 'mark: a passing CI row\'s check';
    return null;
  }
  if (n.tag === 'span' && n.cls.has('v2-okm') && up((a) => a.cls.has('v2-stats'))) return 'mark: a sprint\'s ✓';
  if (svg && n.cls.has('v2-k') && n.cls.has('ok') && p && p.cls.has('v2-drow')) return 'mark: the Done lane\'s ✓';
  if (svg && n.cls.has('v2-cim') && n.cls.has('ok')) return 'mark: a passing CI line\'s ✓';
  // Red, on the mark only.
  if (svg && n.cls.has('v2-s') && n.cls.has('st-cross') && n.cls.has('bad')) {
    if (p && (p.cls.has('v2-msi') || p.cls.has('v2-sm') || p.cls.has('v2-c') || p.cls.has('v2-pn'))) return 'mark: a not-reached cross';
    if (p && p.tag === 'li' && up((a) => a.cls.has('v2-keyl'))) return 'mark: the Timeline key\'s cross';
    if (p && p.cls.has('v2-prow') && p.attrs['data-k'] === 'page-ci') return 'mark: a failing CI row\'s cross';
    return null;
  }
  if (svg && n.cls.has('v2-smk') && up((a) => a.cls.has('v2-stats'))) return 'mark: a sprint\'s ✕';
  if (svg && n.cls.has('v2-cim') && n.cls.has('bad')) return 'mark: a failing CI line\'s ✕';
  if (svg && n.cls.has('v2-k') && p && p.cls.has('v2-safe-l') && p.parent && p.parent.cls.has('v2-safe') && p.parent.cls.has('bad')) return 'mark: a deploy\'s mismatch';
  // The named exceptions: can't-read lines, words and ✕ (ruled).
  const brief = up((a) => a.cls.has('v2-brief'));
  if (brief && svg && n.cls.has('v2-k') && n.cls.has('bad') && p && (p.cls.has('v2-bi') || p.cls.has('v2-bcant'))) return 'ruled: the briefing\'s ✕';
  if (brief && n.tag === 'span' && n.cls.has('v2-bt3') && n.cls.has('bad')) return 'ruled: the briefing\'s can\'t-read line';
  if (n.tag === 'span' && n.cls.has('v2-wt') && n.cls.has('bad')) return 'ruled: a tile\'s corner';
  if (n.tag === 'p' && n.cls.has('v2-ln') && n.cls.has('bad')) return 'ruled: a tile\'s foot or a tile the desk can\'t draw';
  if (svg && n.cls.has('v2-k') && p && p.tag === 'p' && p.cls.has('v2-ln') && p.cls.has('bad')) return 'ruled: a tile\'s foot or a tile the desk can\'t draw';
  if (n.cls.has('v2-prow') && n.cls.has('bad')) return 'ruled: a page\'s waits row';
  if (svg && n.cls.has('v2-k') && p && p.cls.has('v2-prow') && p.cls.has('bad')) return 'ruled: a page\'s waits row';
  if (n.tag === 'p' && n.cls.has('v2-ql') && n.cls.has('bad')) return 'ruled: Waiting\'s and "Since you last looked"\'s quiet line';
  if (n.tag === 'span' && n.cls.has('v2-hgb')) return 'ruled: a group head\'s can\'t-read count';
  // A failed read in "Since you last looked" (reading (e)).
  if (svg && n.cls.has('v2-k') && n.cls.has('bad') && p && p.cls.has('v2-ev')) return 'reading (e): a failed read\'s ✕';
  // Error states (reading (e)).
  if (n.tag === 'p' && n.cls.has('sb-stale')) return 'reading (e): a render-error screen';
  if (n.cls.has('sb-warn') && up((a) => a.cls.has('sb-notify'))) return 'reading (e): the notifications warning';
  if (svg && n.cls.has('v2-lfx')) return 'reading (e): the failed-load screen\'s ✕';
  return null;
}
/** The lines AC92 (a) keeps ink or grey that G7's check names, or null: the portfolio's ink lines, its block's marks and Plan's ideas. */
function okBadInk(n) {
  const k = n.attrs['data-k'];
  if (n.tag === 'p' && n.cls.has('v2-mark') && k === 'pfs-problem') return 'ink: the portfolio\'s problem line';
  if (n.tag === 'p' && n.cls.has('v2-mark') && k === 'pf-note') return 'ink: a portfolio card\'s note';
  if (n.tag === 'span' && n.cls.has('v2-pfnb')) {
    for (const c of n.kids) if (c.tag === 'svg' && c.cls.has('st-check')) return 'ink: the portfolio block\'s "nothing queued" tick';
    return 'ink: a portfolio block\'s mark';
  }
  if (n.cls.has('v2-plrow') && n.cls.has('v2-plidea')) return 'ink: Plan\'s ideas';
  return null;
}
function okBadCheck(app, where, fails, seen, places) {
  for (const way of WAYS) {
    const root = document.documentElement;
    const attrs = { ...(root.attrs || {}) };
    if (way.attr) attrs['data-theme'] = way.attr; else delete attrs['data-theme'];
    const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, way.env);
    const vals = [THEME[way.theme]['--ok'].toLowerCase(), THEME[way.theme]['--bad'].toLowerCase()];
    const isOkBad = (v) => marks(v).some((m) => OKBAD_NAMES.includes(m.name) || vals.includes(m.value.toLowerCase()));
    const fail = (n, words) => { const k = `${way.theme} ${label(n)} ${words}`; if (!seen.has(k)) { seen.add(k); fails.push(`${where} · ${way.name} · ${label(n)}${n.text.trim() ? ` "${n.text.trim().slice(0, 30)}"` : ''}: ${words}`); } };
    for (const n of nodes(tree)) {
      // The ink portfolio lines (AC92 (a): "the portfolio block's problem line and a card's note at Home's foot …
      // `.v2-mark`, ink, their ✕ uncoloured, stay as built"), the portfolio block's own marks (its "nothing queued" tick an
      // absence, never green) and Plan's ideas (not a status mark AC92 (a) lists): each drawn, and nothing in it --ok or
      // --bad (the Reviewer's B1, G7 round 1).
      const ink = okBadInk(n);
      if (ink) {
        const inside = [];
        const walkIn = (x) => { inside.push(x); x.kids.forEach(walkIn); };
        walkIn(n);
        const red = inside.filter((x) => COLOUR_PROPS.some((prop) => x.declared.get(prop) != null && isOkBad(x.declared.get(prop))) || isOkBad(x.style.get('color') || ''));
        if (red.length) fail(n, `${ink}: ${red.map(label).join(', ')} in --ok or --bad, where AC92 (a) keeps ink or grey`);
        else places.add(ink);
      }
      // G7b (AC92 (a)'s "Stays grey": "Since you last looked"'s "<project> not read since HH:MM, its lines may be missing"
      // lines, grey as the owner ruled, AC91 (c)): each in --ink2, never --ok or --bad, and with no icon.
      if (n.tag === 'p' && n.cls.has('v2-small') && n.parent && n.parent.tag === 'div' && n.parent.cls.has('v2-smiss')) {
        const raw = n.style.get('color') || '';
        const col = plain(raw).trim().toLowerCase();
        if (isOkBad(raw) || col !== THEME[way.theme]['--ink2'].toLowerCase()) fail(n, `"Since you last looked"'s missing line in ${col}: it stays --ink2`);
        else if (n.kids.some((c) => c.tag === 'svg')) fail(n, '"Since you last looked"\'s missing line with an icon: it has none');
        else places.add('grey: "Since you last looked"\'s missing line');
      }
      // The grey "Can't show this" lines and the rules that draw nothing: never red, and never matched.
      if (n.cls.has('v2-small') && n.cls.has('bad') && n.text.trim()) {
        if (isOkBad(n.style.get('color') || '')) fail(n, 'a "Can\'t show this" line in --ok or --bad: it stays grey');
        else places.add('grey: a "Can\'t show this" line');
      }
      if ((n.cls.has('v2-why') && n.cls.has('bad')) || (n.cls.has('circ') && n.cls.has('tick'))) fail(n, 'drawn by a rule AC92 (a) says draws nothing');
      const uses = [];
      for (const prop of COLOUR_PROPS) if (n.declared.get(prop) != null && isOkBad(n.declared.get(prop))) uses.push(prop);
      for (const [pe, ps] of Object.entries(n.pseudo)) for (const prop of COLOUR_PROPS) if (ps.declared.get(prop) != null && isOkBad(ps.declared.get(prop))) uses.push(`::${pe} ${prop}`);
      // A text in --ok or --bad, by its own rule or one above it: the element that gives it the colour must have a place.
      let owner = null;
      if (n.text.trim() && isOkBad(n.style.get('color') || '')) {
        for (let a = n; a && !owner; a = a.parent) if (a.declared.get('color') != null && isOkBad(a.declared.get('color'))) owner = a;
        if (!owner || !okBadPlace(owner)) fail(n, `its text in --ok or --bad${owner ? ` (from ${label(owner)})` : ''}, not a mark or exception AC92 (a) names`);
      }
      if (!uses.length) continue;
      const place = okBadPlace(n);
      if (!place) { fail(n, `--ok or --bad on ${uses.join(', ')}, not a mark or exception AC92 (a) names`); continue; }
      places.add(place);
      if (uses.some((u) => /border/.test(u)) && !n.cls.has('sb-warn')) fail(n, `a border in --ok or --bad (${uses.join(', ')}): AC75's warning's is the only one`);
      if (uses.some((u) => /background|::/.test(u))) fail(n, `--ok or --bad on ${uses.join(', ')}: never on a fill`);
    }
  }
}

test('AC88 + AC92 (a) (G7 of "After the glance audit"; AC88, changed): where --ok and --bad are drawn — on every trial-view screen and sheet AC88\'s walks draw, from each of its fixtures (its portfolio states among them, with one nothing queued), the states where reads fail, the notifications refused and G7\'s own screens, in dark (forced, and the phone\'s own) and light, only on the status marks AC92 (a) lists and its named exceptions (the can\'t-read lines, a failed read in "Since you last looked", the error states and AC75\'s warning, its border the only one); never on a fill, a row, a heading or other words; the grey "Can\'t show this" lines still not red', async () => {
  const fails = [];
  const seen = new Set();
  const places = new Set();
  const counts = { screens: 0 };
  const check = (app, where, f, s) => okBadCheck(app, where, f, s, places);
  const walk = async (setup, projects, where, { hash = '#/', now = NOW, store = null } = {}) => {
    const app = await opened(setup, hash, { now, store });
    try {
      await everyScreen(app, projects, where, fails, seen, counts, check);
    } finally {
      app.restore();
    }
  };
  const t = textSetup();
  await walk(t, t.config.projects, 'text');
  const x = extremes();
  await walk(x, x.config.projects, 'md-extremes');
  await walk({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } }, [SD3], 'service-desk + J12');
  await walk(waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } }), [], 'plan', { hash: '#/work', now: Date.parse('2026-10-18T18:00:00Z'), store: memStore() });
  // The states the walk above never reaches: a project that can't be read, one whose drawing throws, the whole desk signed
  // out, and the portfolio refused, each on Home, Waiting and the project's page.
  const states = [
    ["can't read", (r) => { r.Alpha.fail = { state: 'cant-read', reason: 'not-found' }; }, true],
    ['render error', (r) => { r.Alpha.pulls.push(BAD_PR); }, false],
    ['signed out', (r) => { for (const v of Object.values(r)) v.fail = { kind: 'signed-out' }; }, true],
  ];
  for (const [what, make, later] of states) {
    const st = textSetup();
    if (!later) make(st.repos);
    const app = await opened(st);
    try {
      if (later) {
        make(st.repos);
        await app.advance(3 * POLL_MS);
      }
      for (const hash of ['#/', '#/waiting', '#/p/Alpha']) {
        await app.go(hash);
        check(app, `${what} ${hash}`, fails, seen);
        counts.screens++;
      }
    } finally {
      app.restore();
    }
  }
  // The portfolio (from stage 6b, AC87, J23; made up, NOT real records, tests/desk/pf-fixtures.mjs), as AC88's own test
  // walks it: a queued card and an odd one (the block's rows and sheets, a card under "Portfolio" with its note, Plan's
  // ideas in each state); nothing queued (the block's "nothing queued" tick, an absence); and refused (its can't-read words).
  // The Reviewer's B1 (G7 round 1): the first two were not walked, so an ink line or an absence could turn green unseen.
  for (const [files, fail, where] of [
    [{ queue: { 'PF-001-explore-1.md': cardText(1), 'PF-002-odd.md': 'Not a card (made up, NOT a real record)\n' } }, null, 'portfolio'],
    [{}, null, 'portfolio, nothing queued'],
    [{}, { state: 'cant-read', reason: 'no-access' }, 'portfolio refused']]) {
    const p = waSetup({});
    p.config = withPortfolio(p.config);
    const r = addPortfolio(p.repos, pfFiles(files));
    if (fail) r.fail = fail;
    await walk(p, [], where, { now: Date.parse('2026-10-22T18:00:00Z'), store: memStore() });
  }
  // AC75's warning (made up: the desk added to the Home Screen, notifications refused in the phone's settings): its words
  // and its 1 px border in --bad, the one red border (reading (e)), on Home and in a project's Details.
  {
    const app = await loadSandbox({ ...textSetup(), hash: '#/', now: NOW, win: { matchMedia: () => ({ matches: true }) }, globals: { Notification: { permission: 'denied' } } });
    try {
      await app.advance(1000);
      await app.advance(61_000);
      check(app, 'notifications refused #/', fails, seen);
      await app.go('#/p/Service-Desk');
      await app.tap(findAll(app.view, (e) => e.dataset && e.dataset.k === 'more-detail')[0]);
      check(app, 'notifications refused #/p/Service-Desk Details', fails, seen);
      counts.screens += 2;
    } finally {
      app.restore();
    }
  }
  // Each mark AC92 (a) lists, drawn where the walk above doesn't open it, from the states G7's own test opens
  // (tests/desk/ac92-glance-palette.test.mjs): an opened phase's rows and every sprint's marks; Plan's moved row and its
  // Reached list; Details' and the sheets' CI lines, passing and failing; a deploy's mismatch; and the Done lane's ✓.
  for (const [where, open] of G7_OPENS) {
    const app = await open();
    try {
      check(app, `G7 ${where}`, fails, seen);
      counts.screens++;
    } finally {
      app.restore();
    }
  }
  // G7b (AC91 (c); P-001-glance-since-incomplete.md, A): Home with a "last looked" held and a project that can't be read, so
  // "Since you last looked" ends in its grey missing lines (tests/desk/glance-fixtures.mjs's G7B_OPENS, its made-up
  // failures NOT real), which no screen above draws: the walk above opens Home with no "last looked", markers off.
  for (const [where, open] of G7B_OPENS) {
    const app = await open();
    try {
      check(app, `G7b ${where}`, fails, seen);
      counts.screens++;
    } finally {
      app.restore();
    }
  }
  assert.ok(counts.screens > 250, `${counts.screens} screens and sheets drawn`);
  assert.deepEqual(fails, []);
  // Each mark on AC92 (a)'s list and each exception the fixtures reach was drawn, so the check read them where they are meant to be.
  for (const want of ['mark: a reached check on the Timeline', 'mark: a finished phase on the page\'s strip', 'mark: a reached check in an opened phase',
    'mark: a reached check on a Home tile\'s drawing', 'mark: a check in Plan\'s Reached list', 'mark: a not-reached cross', 'mark: a sprint\'s ✓', 'mark: a sprint\'s ✕',
    'mark: the Done lane\'s ✓', 'mark: a passing CI line\'s ✓', 'mark: a failing CI line\'s ✕', 'mark: a deploy\'s mismatch', 'mark: the Timeline key\'s check',
    'mark: the Timeline key\'s cross', 'ruled: the briefing\'s ✕', 'ruled: the briefing\'s can\'t-read line', 'ruled: a tile\'s corner',
    'ruled: a tile\'s foot or a tile the desk can\'t draw', 'ruled: a page\'s waits row', 'ruled: Waiting\'s and "Since you last looked"\'s quiet line',
    'ruled: a group head\'s can\'t-read count', 'reading (e): the notifications warning', 'grey: a "Can\'t show this" line',
    'ink: the portfolio\'s problem line', 'ink: a portfolio card\'s note', 'ink: the portfolio block\'s "nothing queued" tick', 'ink: a portfolio block\'s mark',
    'ink: Plan\'s ideas', 'grey: "Since you last looked"\'s missing line']) {
    assert.ok(places.has(want), `${want}: ${JSON.stringify([...places])}`);
  }
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
// Rewritten in G3 (AC91 (h)): a gate sheet's title is the only sheet title held to lines, and G3 holds it to two, so its
// max-height is G3's exception (G3_ONCE, below) and no longer stage 5's; its `display` stays stage 5's.
const M3D5_ONCE = new Map([['v2-tt', new Set(['display: (none) → block', 'max-height: (none) → calc(3 * 1.33em)', 'overflow: (none) → clip'])],
  ['v2-stt', new Set(['display: (none) → block'])]]);
const M3D5_EXCEPT = (n, d) => (n.tag === 'span' && n.cls.has('v2-tt') && n.parent && n.parent.tag === 'a' && n.parent.cls.has('v2-t') && M3D5_ONCE.get('v2-tt').has(d))
  || (n.tag === 'span' && n.cls.has('v2-stt') && n.cls.has('v2-clip') && n.parent && n.parent.tag === 'h2' && n.parent.cls.has('v2-stitle') && M3D5_ONCE.get('v2-stt').has(d));
/**
 * G1 of "After the glance audit"'s changes to Home's look on purpose (the brief's rule, specs/S-001.md:16598-16602; AC91 (a)
 * to (c), :8442-8495), each declaration pinned to its value, before and after, in each theme, on only its own element:
 * - (a) the briefing that says what needs the owner (`a.v2-brief.k-you`): "<n> need you" in the sheet-title role, the ◆
 *   sized to it and, with "Waiting ›", centred on its line; and each settle or undo line (`span.v2-bdue`, a new element),
 *   its clock or lock and its words, in 500 12 px ink, a place with no line drawn as nothing (`span.v2-bdue.none`: the
 *   three places are always there while something needs the owner, so the tick can fill or empty each);
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
  ['span.v2-bdue.none', ['grid-column: (none) → 2 / 4', 'display: (none) → none', 'gap: (none) → 4px', 'align-items: (none) → flex-start',
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
  if (n.tag === 'span' && brief(p) && n.cls.has('v2-bdue')) return n.cls.has('none') ? 'span.v2-bdue.none' : 'span.v2-bdue';
  if (n.tag === 'span' && brief(p)) for (const c of ['v2-bi', 'v2-bt1', 'v2-go']) if (n.cls.has(c)) return `span.${c}`;
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
/**
 * G2 of "After the glance audit"'s changes to Waiting's look on purpose (the brief's rule; AC91 (f) and (g), with AC80's
 * changed parts), each declaration pinned to its value, before and after, in each theme, on only its own element:
 * - (f) the two lanes of equal width (`div.v2-lanes` in the board): AC80's 1.18 : 1 : 1 gone for 1 : 1;
 * - (f), item 4c, Done shaded: the Done lane (`section.v2-lane.lane-done` in the lanes) on --bg2, 12 px round, 8 px inside
 *   its sides and 10 px at its foot, stretched to the taller lane, and its head (`h2.v2-lh` in it) 6 px from its top;
 * - (f), the Kicked back strip's one quiet line (`p.v2-kq`, a new element, in `section.v2-kstrip`), "Kicked back"
 *   (`span.v2-kl`) in --t-label --ink2 and " · none" (`span.v2-kn`) in --t-mono --ink2; and, as AC91 (f) was amended after G2's
 *   reviews, the words that are not a count ("can't read" here, signed out; `span.v2-kw`) in --t-label --ink2, as "Kicked back";
 * - (g), "new"'s place in a card's kind line (`span.v2-new`, a new element, in `span.v2-kd`), drawn as nothing while the
 *   card is not new (`.none`): no fixture this guard walks holds a "last looked", so none is new here.
 * The strip with cards (its head, row and 200 px places) and a shown "new" are drawn on no screen this guard walks (no
 * fixture here keeps a kicked-back mark or a "last looked"), so AC91's own cases (tests/desk/ac91-glance-waiting.test.mjs)
 * lock their look; the strip's section takes `.v2-lane`'s rules, as the middle lane did, so its own look is unchanged.
 */
const G2_FONT = G1_FONT;
const G2_LOOK = (ink, ink2, bg2) => new Map([
  ['div.v2-lanes', ['grid-template-columns: minmax(0, 1.18fr) minmax(0, 1fr) minmax(0, 1fr) → minmax(0, 1fr) minmax(0, 1fr)']],
  ['section.v2-lane.lane-done', [`background: (none) → ${bg2}`, 'border-radius: (none) → 12px', 'padding: (none) → 0 8px 10px', 'align-self: (none) → stretch']],
  ['h2.v2-lh (Done)', ['padding-top: (none) → 6px']],
  ['p.v2-kq', [`font: (none) → ${G2_FONT('500 11px/1.35')}`, `color: (none) → ${ink2}`, 'padding: (none) → 4px 0']],
  ['span.v2-kl', ['computed font-size: 13px → 11px', 'computed font-weight: 400 → 500', 'computed line-height: 18.849999999999998px → 14.850000000000001px',
    `computed color: ${ink} → ${ink2}`]],
  ['span.v2-kw', ['computed font-size: 13px → 11px', 'computed font-weight: 400 → 500', 'computed line-height: 18.849999999999998px → 14.850000000000001px',
    `computed color: ${ink} → ${ink2}`]],
  ['span.v2-kn', ['font: (none) → 400 11px/1.4 "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace', `color: (none) → ${ink2}`,
    'computed font-size: 13px → 11px', 'computed line-height: 18.849999999999998px → 15.399999999999999px',
    'computed font-family: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif → "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace',
    `computed color: ${ink} → ${ink2}`]],
  ['span.v2-new.none', [`font: (none) → ${G2_FONT('500 11px/1.35')}`, `color: (none) → ${ink}`, 'flex: (none) → none', 'display: (none) → none']],
]);
const G2_ONCE = new Map([['light', G2_LOOK('#18191c', '#5c5f66', '#f7f7f8')], ['dark', G2_LOOK('#ecedef', '#a2a5ac', '#141517')]]);
const G2_KEY = (n) => {
  const p = n.parent;
  if (n.tag === 'div' && n.cls.has('v2-lanes') && p && p.cls.has('v2-board')) return 'div.v2-lanes';
  if (n.tag === 'section' && n.cls.has('v2-lane') && n.cls.has('lane-done') && p && p.cls.has('v2-lanes')) return 'section.v2-lane.lane-done';
  if (n.tag === 'h2' && n.cls.has('v2-lh') && p && p.tag === 'section' && p.cls.has('lane-done')) return 'h2.v2-lh (Done)';
  if (n.tag === 'p' && n.cls.has('v2-kq') && p && p.tag === 'section' && p.cls.has('v2-kstrip')) return 'p.v2-kq';
  if (n.tag === 'span' && p && p.tag === 'p' && p.cls.has('v2-kq')) for (const c of ['v2-kl', 'v2-kw', 'v2-kn']) if (n.cls.has(c)) return `span.${c}`;
  if (n.tag === 'span' && n.cls.has('v2-new') && n.cls.has('none') && p && p.tag === 'span' && p.cls.has('v2-kd')) return 'span.v2-new.none';
  return null;
};
const G2_EXCEPT = (n, d, theme) => {
  const k = G2_KEY(n);
  return Boolean(k && G2_ONCE.get(theme) && (G2_ONCE.get(theme).get(k) || []).includes(d)) ? `G2 ${theme} ${k} ${d}` : null;
};
/**
 * G3 of "After the glance audit"'s changes to the look on purpose (the brief's rule; AC91 (h), with AC89 (j)'s note "After
 * the glance audit": "a gate sheet's title, Plan's gate row and a gate card's title take the gate's short title, cut at two
 * lines only where it doesn't fit; the three-line cut still applies to the board's other card titles"), each declaration
 * pinned to its value, before and after, the same in each theme, on only its own element:
 * - a gate card's title on the board (`span.v2-tt` in the `a.v2-t` of an `li.v2-card.gate`) held to two lines, where the
 *   board's other card titles keep stage 5's three;
 * - a gate sheet's title (`span.v2-clip.v2-stt` in an `h2.v2-stitle`) held to two lines, at the title's line height;
 * - Plan's gate row's title (`span.v2-plname` in an `li.v2-plli.gate`) held to two lines;
 * - in each of the three, the item ending the short title (`span.v2-gitem`, a new element) an inline block, moving to
 *   the next line as one piece, so a wrap never splits "P-004" at its hyphen.
 * The gate sheet's opening (section 1's whole first line) takes the question sheet's opening rules (`.v2-clip.v2-lead`),
 * which were there, so it adds no exception; its text is AC91 (h)'s test's (tests/desk/ac91-glance-gates.test.mjs).
 */
const G3_ONCE = new Map([
  ['span.v2-tt (gate card)', ['max-height: (none) → calc(2 * 1.33em)']],
  ['span.v2-clip.v2-stt', ['max-height: calc(3 * 1.45em) → calc(2 * 1.3em)']],
  ['span.v2-plname (gate row)', ['max-height: calc(3 * 1.35em) → calc(2 * 1.35em)']],
  ['span.v2-gitem', ['display: (none) → inline-block']],
]);
const G3_KEY = (n) => {
  const up = (x, k) => { let a = x; for (let i = 0; i < k && a; i++) a = a.parent; return a; };
  const p = n.parent;
  if (n.tag === 'span' && n.cls.has('v2-gitem') && p && (p.cls.has('v2-tt') || p.cls.has('v2-stt') || p.cls.has('v2-plname'))) return 'span.v2-gitem';
  if (n.tag === 'span' && n.cls.has('v2-tt') && p && p.tag === 'a' && p.cls.has('v2-t')) {
    for (let a = p.parent; a; a = a.parent) if (a.cls.has('v2-card')) return a.cls.has('gate') ? 'span.v2-tt (gate card)' : null;
    return null;
  }
  if (n.tag === 'span' && n.cls.has('v2-stt') && n.cls.has('v2-clip') && p && p.tag === 'h2' && p.cls.has('v2-stitle')) return 'span.v2-clip.v2-stt';
  const li = up(n, 3);
  if (n.tag === 'span' && n.cls.has('v2-plname') && p && p.cls.has('v2-prt') && li && li.tag === 'li' && li.cls.has('v2-plli') && li.cls.has('gate')) return 'span.v2-plname (gate row)';
  return null;
};
const G3_EXCEPT = (n, d) => {
  const k = G3_KEY(n);
  return Boolean(k && (G3_ONCE.get(k) || []).includes(d)) ? `G3 ${k} ${d}` : null;
};
/**
 * G4 of "After the glance audit"'s one change to the look on purpose (the brief's rule; AC91 (h), from G4, after G3's
 * reviews: "a gate card's Done row takes the short title as the board's card title … From G4 its item is kept whole there
 * as in the three places (`.v2-gitem`), on the card while it is confirmed with GitHub and on the confirmed row"), pinned
 * to its value, before and after, the same in each theme, on only its own two elements: the item ending a gate card's
 * short title (`span.v2-gitem`) in the confirming card's title link (`a.v2-t` in an `li.v2-card.conf`) and in the
 * confirmed row's (`a.v2-dt` in an `li.v2-drow`), each an inline block, as G3 made it in the other three places. The
 * rule is G3's (`.v2-gitem`); G4 adds only the element. Every other part of G4 (the calm row's soft title, the ran-again
 * line said once, the waits row's gate names, the Timeline's opening scroll, the one date form) uses rules that were
 * there, and the failed-load screen's new rules draw only on a screen no fixture's desk reaches (its code failed), which
 * AC91 (k)'s own case locks (tests/desk/ac91-glance-load.test.mjs). This guard reaches the two Done rows in the walk's
 * `gates` state with a device's Done marks (tests/desk/glance-fixtures.mjs, NOT real), below.
 * From G4's fix round (AC89 (c)'s note "After G4's reviews": "each id in the row … is kept whole … as an inline block, as
 * `.v2-gitem` keeps a gate's item"), one more, the same in each theme: each id in a project page's waits row
 * (`span.v2-mono`, a direct child of the row's `span.v2-small.v2-wn` in a `.v2-prt`) an inline block; the walk reaches it
 * on every page with something waiting (the made-up project's, among them).
 */
const G4_ONCE = new Map([
  ['span.v2-gitem (confirming card)', ['display: (none) → inline-block']],
  ['span.v2-gitem (confirmed row)', ['display: (none) → inline-block']],
  ['span.v2-mono (waits row id)', ['display: (none) → inline-block']],
]);
const G4_KEY = (n) => {
  const p = n.parent;
  if (n.tag === 'span' && n.cls.has('v2-mono') && p && p.tag === 'span' && p.cls.has('v2-wn') && p.cls.has('v2-small') && p.parent && p.parent.cls.has('v2-prt')) {
    return 'span.v2-mono (waits row id)';
  }
  if (!(n.tag === 'span' && n.cls.has('v2-gitem') && p && p.tag === 'a' && p.parent && p.parent.tag === 'li')) return null;
  if (p.cls.has('v2-t') && p.parent.cls.has('v2-card') && p.parent.cls.has('conf')) return 'span.v2-gitem (confirming card)';
  if (p.cls.has('v2-dt') && p.parent.cls.has('v2-drow')) return 'span.v2-gitem (confirmed row)';
  return null;
};
const G4_EXCEPT = (n, d) => {
  const k = G4_KEY(n);
  return Boolean(k && (G4_ONCE.get(k) || []).includes(d)) ? `G4 ${k} ${d}` : null;
};
/**
 * G5 of "After the glance audit"'s one change to the look on purpose (the brief's rule; AC92 (c): "each phase's folded
 * line, under its name and state word, takes two lines of detail"), pinned to its value, before and after, the same in
 * each theme, on only its own element: each of the two lines (`span.v2-sdl`, a new element) inside a phase line's detail
 * (`span.v2-sd`, in the fold `button.v2-stdr`) a block, so "<R> of <T> reached · <sprints>" and "Standard checklist: …"
 * stand one over the other. Every other part of G5 (the head's sums, the Timeline's fold words, an opened phase's row
 * words, Details' CI line, the waits row's gate names said once) is words in elements and rules that were there.
 */
const G5_ONCE = new Map([
  ['span.v2-sdl (phase line)', ['display: (none) → block']],
]);
const G5_KEY = (n) => {
  const p = n.parent;
  return n.tag === 'span' && n.cls.has('v2-sdl') && p && p.tag === 'span' && p.cls.has('v2-sd') && p.parent && p.parent.cls.has('v2-stdr') ? 'span.v2-sdl (phase line)' : null;
};
const G5_EXCEPT = (n, d) => {
  const k = G5_KEY(n);
  return Boolean(k && (G5_ONCE.get(k) || []).includes(d)) ? `G5 ${k} ${d}` : null;
};
/**
 * G6 of "After the glance audit"'s changes to the look on purpose (the brief's rule; AC92 (d): "two heads in `--t-label`
 * `--ink` … the standard group with a 1 px `--line` rule above its head and 8 px over it"; "the untracked ones folded …
 * in `--t-small` `--ink2`"; "weights: the owner's own rows' names in `--t-row` (500 13 px); a tracked standard row's name in
 * 400 13 px"; on the Timeline "its name 400 13 px"), each declaration pinned to its value, before and after, in each theme,
 * on only its own element. The walk reaches the page's in an opened phase (the `text` page with every phase and every
 * run's untracked rows opened, below):
 * - an opened phase's two heads (`p.v2-subh`, "Your milestones · <n>", and `p.v2-subh.std`, "Standard checklist · …") in
 *   --t-label --ink, 10 px over them, as round 2's mock (changes2.js q5), the standard one with its rule and 8 px;
 * - an own row's name (`span.v2-smn` in an `li.v2-sm.own`) in --t-row, 500 13 px; in an earlier run's row (`.old`), still
 *   12 px (note 2), at 500;
 * - the fold row (`li.v2-untr`, a new element) a grid; its button (`button.v2-fold.v2-untrb`) the ring, the words and the
 *   chevron in three columns, a 32 px target, in --t-small; its words (`span.v2-untrw`) taking it;
 * - an earlier run's heads and lists in a grid of their own (`div.v2-oldrun`, a new element);
 * - on the Timeline, a standard milestone's name (`p.v2-mstt` in a `div.v2-ms.std`) at 400.
 * A standard row's name keeps its 400 13 px (`--t-body`), so it adds none.
 */
const G6_HEAD = (ink, ink2) => [`font: ${G1_FONT('400 11px/1.35')} → ${G1_FONT('500 11px/1.35')}`, `color: ${ink2} → ${ink}`, 'padding: 6px 0 0 → 10px 0 0',
  'computed font-weight: 400 → 500', `computed color: ${ink2} → ${ink}`];
const G6_LOOK = (ink, ink2, line) => new Map([
  ['p.v2-subh', G6_HEAD(ink, ink2)],
  ['p.v2-subh.std', [...G6_HEAD(ink, ink2), 'margin-top: (none) → 8px', `border-top: (none) → 1px solid ${line}`]],
  ['span.v2-smn (own row)', [`font: ${G1_FONT('400 13px/1.45')} → ${G1_FONT('500 13px/1.35')}`, 'computed font-weight: 400 → 500', 'computed line-height: 18.849999999999998px → 17.55px']],
  ['span.v2-smn (earlier run\'s own row)', ['font-weight: (none) → 500', 'computed font-weight: 400 → 500']],
  ['li.v2-untr', ['display: (none) → grid']],
  ['button.v2-fold.v2-untrb', [`font: ${G1_FONT('500 11px/1.35')} → ${G1_FONT('400 12px/1.4')}`, 'padding: 0 → 4px 0', 'display: inline-flex → grid', 'gap: 4px → 8px',
    'min-height: 28px → 32px', 'grid-template-columns: (none) → 16px minmax(0, 1fr) 10px', 'width: (none) → 100%']],
  ['span.v2-untrw', ['computed font-size: 11px → 12px', 'computed font-weight: 500 → 400', 'computed line-height: 14.850000000000001px → 16.799999999999997px']],
  ['div.v2-oldrun', ['display: (none) → grid']],
  ['p.v2-mstt (standard milestone)', ['font-weight: (none) → 400', 'computed font-weight: 500 → 400']],
]);
const G6_ONCE = new Map([['light', G6_LOOK('#18191c', '#5c5f66', '#e7e7ea')], ['dark', G6_LOOK('#ecedef', '#a2a5ac', '#26282c')]]);
const G6_KEY = (n) => {
  const p = n.parent;
  const phase = (x) => Boolean(x && x.tag === 'div' && (x.cls.has('v2-stdl') || (x.cls.has('v2-oldrun') && x.parent && x.parent.cls.has('v2-stdl'))));
  if (n.tag === 'p' && n.cls.has('v2-subh') && phase(p)) return n.cls.has('std') ? 'p.v2-subh.std' : 'p.v2-subh';
  if (n.tag === 'div' && n.cls.has('v2-oldrun') && p && p.cls.has('v2-stdl')) return 'div.v2-oldrun';
  if (n.tag === 'span' && n.cls.has('v2-smn') && p && p.cls.has('v2-smt')) {
    const li = p.parent;
    if (li && li.tag === 'li' && li.cls.has('v2-sm') && li.cls.has('own')) return li.cls.has('old') ? 'span.v2-smn (earlier run\'s own row)' : 'span.v2-smn (own row)';
    return null;
  }
  if (n.tag === 'li' && n.cls.has('v2-untr') && p && p.tag === 'ol' && p.cls.has('v2-sml')) return 'li.v2-untr';
  if (n.tag === 'button' && n.cls.has('v2-untrb') && n.cls.has('v2-fold') && p && p.cls.has('v2-untr')) return 'button.v2-fold.v2-untrb';
  if (n.tag === 'span' && n.cls.has('v2-untrw') && p && p.cls.has('v2-untrb')) return 'span.v2-untrw';
  if (n.tag === 'p' && n.cls.has('v2-mstt') && p && p.tag === 'div' && p.cls.has('v2-ms') && p.cls.has('std')) return 'p.v2-mstt (standard milestone)';
  return null;
};
const G6_EXCEPT = (n, d, theme) => {
  const k = G6_KEY(n);
  return Boolean(k && G6_ONCE.get(theme) && (G6_ONCE.get(theme).get(k) || []).includes(d)) ? `G6 ${theme} ${k} ${d}` : null;
};
/**
 * G7 of "After the glance audit"'s changes to the look on purpose (the brief's rule; AC92 (a): "Green, `--ok`, on the mark
 * only … Red, `--bad`, on the mark only"; AC24's note: "the edge is `--line2`, the light line grey, not gold"; AC91 (c): "each
 * carries the ✕ icon in `--bad` before it"), each declaration pinned to its value, before and after, in each theme, on only
 * its own element:
 * - a status mark (sandbox.js's smk): the reached check (`svg.v2-s.st-check.ok`) in --ok and the not-reached cross
 *   (`svg.v2-s.st-cross.bad`) in --bad, where AC92 (a) lists them — on the Timeline's rail (`.v2-msi`) and its key
 *   (`.v2-keyl`), the page's strip (`.v2-pn`), an opened phase's rows (`li.v2-sm`), a Home tile's drawing (`.v2-c`) and a
 *   v2.5 page's CI row (`page-ci`); and in Plan's Reached list (`ul.v2-plmini`, a new element there), the check at 14 px in
 *   the line's text, 6 px before the name;
 * - a CI line's ✓ or ✕ (`svg.v2-k.v2-cim`, a new element: Details' line, a sheet's "What was checked"), in the line's text,
 *   4 px before its words, in --ok or --bad;
 * - a waiting deploy's mismatch mark (`svg.v2-k.vi-x` in the `p.v2-safe-l` of a `.v2-safe.bad`) in --bad;
 * - the briefing's can't-read line under its first (`span.v2-bt3.bad.v2-bcant`), the ✕ (`svg.v2-k.bad`, a new element) and
 *   the words side by side, as a due line (`.v2-bdue`), the ✕ 1 px down;
 * - Plan's moved row (`li.v2-plli.moved`): its edge --line2, not --gold.
 * The walk reaches each on G7's screens (tests/desk/glance-fixtures.mjs's G7_OPENS, below) and the states above. A sprint's ✓
 * (`span.v2-okm`, a new element) and ✕ (`.v2-stats .v2-smk`) are drawn only with a sprint opened, which this walk leaves
 * out (see below), so tests/desk/ac92-glance-palette.test.mjs and AC84's cases lock them.
 */
const G7_LOOK = (ink, ok, bad, gold, line2) => new Map([
  ['svg.v2-s.st-check.ok (a status mark)', [`color: ${ink} → ${ok}`]],
  ['svg.v2-s.st-check.ok (Plan\'s Reached list)', [`color: ${ink} → ${ok}`, 'width: 16px → 14px', 'height: 16px → 14px', 'vertical-align: (none) → -2px', 'margin-right: (none) → 6px']],
  ['svg.v2-s.st-cross.bad (a status mark)', [`color: ${ink} → ${bad}`]],
  ['svg.v2-k.v2-cim.ok (a CI line passing)', ['vertical-align: (none) → -2px', 'margin-right: (none) → 4px', `color: (none) → ${ok}`]],
  ['svg.v2-k.v2-cim.bad (a CI line failing)', ['vertical-align: (none) → -2px', 'margin-right: (none) → 4px', `color: (none) → ${bad}`]],
  ['svg.v2-k.vi-x (a deploy\'s mismatch)', [`color: (none) → ${bad}`]],
  ['span.v2-bt3.bad.v2-bcant', ['display: (none) → flex', 'gap: (none) → 4px', 'align-items: (none) → flex-start']],
  ['svg.v2-k.bad (the briefing\'s can\'t-read line)', ['margin-top: (none) → 1px']],
  ['li.v2-plli.moved', [`box-shadow: inset 2px 0 0 ${gold} → inset 2px 0 0 ${line2}`]],
]);
const G7_ONCE = new Map([['light', G7_LOOK('#18191c', '#12733a', '#b3162a', '#8a6a10', '#d6d6db')], ['dark', G7_LOOK('#ecedef', '#4cc06a', '#ff6b78', '#c9b04f', '#34363c')]]);
const G7_KEY = (n) => {
  const p = n.parent;
  const svg = n.tag === 'svg';
  const at = (x) => Boolean(p && (p.cls.has('v2-msi') || p.cls.has('v2-pn') || p.cls.has('v2-c') || (p.tag === 'li' && p.cls.has('v2-sm'))
    || (p.tag === 'li' && p.parent && p.parent.cls.has('v2-keyl')) || (p.cls.has('v2-prow') && p.attrs['data-k'] === 'page-ci')) && x);
  if (svg && n.cls.has('v2-s') && n.cls.has('st-check') && n.cls.has('ok')) {
    if (p && p.tag === 'li' && p.parent && p.parent.tag === 'ul' && p.parent.cls.has('v2-plmini')) return 'svg.v2-s.st-check.ok (Plan\'s Reached list)';
    return at(true) ? 'svg.v2-s.st-check.ok (a status mark)' : null;
  }
  if (svg && n.cls.has('v2-s') && n.cls.has('st-cross') && n.cls.has('bad')) return at(true) ? 'svg.v2-s.st-cross.bad (a status mark)' : null;
  if (svg && n.cls.has('v2-k') && n.cls.has('v2-cim') && p && p.tag === 'p') return n.cls.has('ok') ? 'svg.v2-k.v2-cim.ok (a CI line passing)' : n.cls.has('bad') ? 'svg.v2-k.v2-cim.bad (a CI line failing)' : null;
  if (svg && n.cls.has('v2-k') && n.cls.has('vi-x') && p && p.cls.has('v2-safe-l') && p.parent && p.parent.cls.has('v2-safe') && p.parent.cls.has('bad')) return 'svg.v2-k.vi-x (a deploy\'s mismatch)';
  const bcant = (x) => Boolean(x && x.tag === 'span' && x.cls.has('v2-bt3') && x.cls.has('bad') && x.cls.has('v2-bcant') && x.parent && x.parent.cls.has('v2-brief'));
  if (bcant(n)) return 'span.v2-bt3.bad.v2-bcant';
  if (svg && n.cls.has('v2-k') && n.cls.has('bad') && bcant(p)) return 'svg.v2-k.bad (the briefing\'s can\'t-read line)';
  if (n.tag === 'li' && n.cls.has('v2-plli') && n.cls.has('moved')) return 'li.v2-plli.moved';
  return null;
};
const G7_EXCEPT = (n, d, theme) => {
  const k = G7_KEY(n);
  return Boolean(k && G7_ONCE.get(theme) && (G7_ONCE.get(theme).get(k) || []).includes(d)) ? `G7 ${theme} ${k} ${d}` : null;
};
/**
 * G7b of "After the glance audit"'s changes to the look on purpose (the brief's rule; AC91 (c): "the list ends with one
 * line for each such project … each in `--t-small` `--ink2`, grey, with no icon … wrapped at 360 px, never cut"), each
 * declaration pinned to its value, before and after, on only its own element, the same in each theme: the box of the
 * lines that end "Since you last looked" (`div.v2-smiss`, a new element under the list), its lines 2 px apart and 6 px
 * under the list's last line; and each line (`p.v2-small` in it) wrapping at a long name. Each line's font and colour are
 * `.v2-small`'s, a rule that was there. The walk reaches them on G7b's screens (tests/desk/glance-fixtures.mjs's
 * G7B_OPENS, below).
 */
const G7B_ONCE = new Map([
  ['div.v2-smiss', ['display: (none) → grid', 'gap: (none) → 2px', 'margin-top: (none) → -6px']],
  ['p.v2-small (a missing line)', ['overflow-wrap: (none) → anywhere']],
]);
const G7B_KEY = (n) => {
  const box = (x) => Boolean(x && x.tag === 'div' && x.cls.has('v2-smiss') && x.parent && x.parent.cls.has('v2-home'));
  if (box(n)) return 'div.v2-smiss';
  if (n.tag === 'p' && n.cls.has('v2-small') && box(n.parent)) return 'p.v2-small (a missing line)';
  return null;
};
const G7B_EXCEPT = (n, d) => {
  const k = G7B_KEY(n);
  return Boolean(k && (G7B_ONCE.get(k) || []).includes(d)) ? `G7B ${k} ${d}` : null;
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
        const g2 = G2_EXCEPT(b, d, way.theme);
        if (g2) { excepted.add(g2); continue; }
        const g3 = G3_EXCEPT(b, d);
        if (g3) { excepted.add(g3); continue; }
        const g4 = G4_EXCEPT(b, d);
        if (g4) { excepted.add(g4); continue; }
        const g5 = G5_EXCEPT(b, d);
        if (g5) { excepted.add(g5); continue; }
        const g6 = G6_EXCEPT(b, d, way.theme);
        if (g6) { excepted.add(g6); continue; }
        const g7 = G7_EXCEPT(b, d, way.theme);
        if (g7) { excepted.add(g7); continue; }
        const g7b = G7B_EXCEPT(b, d);
        if (g7b) { excepted.add(g7b); continue; }
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
  // G4 of "After the glance audit" (AC91 (h), from G4): Waiting with a gate card's Done rows, the one confirming and the one
  // confirmed (made up, NOT real records or marks: tests/desk/glance-fixtures.mjs's `gates` and deviceMarks), so the walk
  // reaches the item kept whole in each.
  {
    const P9 = GATE_KEY(MIX_PROJECT, 'queue/P-009-launch-1.md');
    const seed = deviceMarks([
      { project: MIX_PROJECT, kind: 'gate', id: GATE_KEY(MIX_PROJECT, GATE4), at: NOW - 60e3 },
      { project: MIX_PROJECT, kind: 'gate', id: P9, title: 'The Launch gate, case 1 · P-009', at: NOW - 3 * 3600e3, confirmedAt: NOW - 2 * 3600e3 },
    ]);
    app = await loadSandbox({ ...gatesState(), hash: '#/waiting', now: NOW, store: memStore(seed) });
    try {
      await app.advance(1000);
      assert.equal(findAll(app.view, (e) => / v2-gitem /.test(` ${e.className || ''} `) && e.parent && ['v2-t', 'v2-dt'].includes(e.parent.className)).length, 2,
        'both Done rows drawn, each with its item');
      sameLook(app, 'gates Done rows #/waiting', fails, seen);
      counts.screens++;
    } finally {
      app.restore();
    }
  }
  // G6 of "After the glance audit" (AC92 (d)): a project's page with every phase opened and every run's untracked rows
  // listed (Service-Desk's records at 77bfeae, real, as tests/desk/glance-fixtures.mjs's `text` holds them), so the walk
  // reaches an opened phase's heads, the rule above the standard group, the fold row and the rows' weights, which no
  // screen above opens.
  {
    app = await loadSandbox({ ...textState(), hash: `#/p/${SD.name}`, now: NOW, store: memStore() });
    try {
      await app.advance(1000);
      await app.advance(POLL_MS);
      for (const ph of ['Launch', 'Build', 'Design', 'Discovery']) await app.tap(findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['aria-label'] === ph)[0]);
      for (const b of findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['data-untracked'])) await app.tap(findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['data-untracked'] === b.attrs['data-untracked'])[0]);
      assert.equal(findAll(app.view, (e) => e.attrs && e.attrs['data-untracked'] && e.attrs['aria-expanded'] === 'true').length, 6, 'six runs\' untracked rows listed');
      sameLook(app, 'text phases opened #/p/Service-Desk', fails, seen);
      counts.screens++;
    } finally {
      app.restore();
    }
  }
  // G7 of "After the glance audit" (AC92 (a)): the screens its marks are drawn on that the walk above doesn't open
  // (tests/desk/glance-fixtures.mjs's G7_OPENS, its made-up parts NOT real), so the walk reaches each mark G7 colours, the
  // moved row's edge and the briefing's can't-read lines. The Timeline with its sprints opened is left out here: there
  // every sprint mark's `span.sb-mkw` also takes the 24 px target `.v2-timeline .v2-stats span.sb-mkw` gave it after
  // bd4097d, a change of no stage of G7's that this walk never reached; G7's sprint ✓ and ✕ are locked by its own test
  // (tests/desk/ac92-glance-palette.test.mjs) and AC84's (tests/desk/ac84-timeline.test.mjs).
  for (const [where, open] of G7_OPENS.filter(([w]) => w !== 'Timeline, every sprint opened')) {
    const g7 = await open();
    try {
      sameLook(g7, `G7 ${where}`, fails, seen);
      counts.screens++;
    } finally {
      g7.restore();
    }
  }
  // G7b of "After the glance audit" (AC91 (c)): Home with a "last looked" held and a project that can't be read
  // (tests/desk/glance-fixtures.mjs's G7B_OPENS, its made-up failures NOT real), so the walk reaches the grey lines that
  // end "Since you last looked", which the walk above, holding no "last looked", never draws. The list holding its four
  // lines and "<n> more" is left out here: there each line's two-line cut (`span.v2-e1`, G1's AC91 (e), calc(3 * 1.45em) →
  // calc(2 * 1.45em)) differs too, a change of G1's that this walk never reached and G1_ONCE doesn't pin; AC82's and AC91's
  // own cases lock it, and G7b's own test (tests/desk/ac91-g7b-since-missing.test.mjs) and the cascade check above draw
  // its missing line there.
  for (const [where, open] of G7B_OPENS.filter(([w]) => !/"<n> more"/.test(w))) {
    const g7b = await open();
    try {
      assert.ok(findAll(g7b.view, (e) => e.dataset && e.dataset.k === 'since-miss').length === 1, `${where}: the missing lines drawn`);
      sameLook(g7b, `G7b ${where}`, fails, seen);
      counts.screens++;
    } finally {
      g7b.restore();
    }
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
  // G2's exception was met, each pinned declaration on its own element in each theme, and nothing else of it.
  const g2 = [...G2_ONCE].flatMap(([theme, look]) => [...look].flatMap(([k, ds]) => ds.map((d) => `G2 ${theme} ${k} ${d}`))).sort();
  assert.deepEqual([...excepted].filter((x) => /^G2 /.test(x)).sort(), g2);
  // G3's exception was met, each pinned declaration on its own element, and nothing else of it.
  const g3 = [...G3_ONCE].flatMap(([k, ds]) => ds.map((d) => `G3 ${k} ${d}`)).sort();
  assert.deepEqual([...excepted].filter((x) => /^G3 /.test(x)).sort(), g3);
  // G4's exception was met, each pinned declaration on its own element, and nothing else of it.
  const g4 = [...G4_ONCE].flatMap(([k, ds]) => ds.map((d) => `G4 ${k} ${d}`)).sort();
  assert.deepEqual([...excepted].filter((x) => /^G4 /.test(x)).sort(), g4);
  // G5's exception was met, its pinned declaration on its own element, and nothing else of it.
  const g5 = [...G5_ONCE].flatMap(([k, ds]) => ds.map((d) => `G5 ${k} ${d}`)).sort();
  assert.deepEqual([...excepted].filter((x) => /^G5 /.test(x)).sort(), g5);
  // G6's exception was met, each pinned declaration on its own element in each theme, and nothing else of it.
  const g6 = [...G6_ONCE].flatMap(([theme, look]) => [...look].flatMap(([k, ds]) => ds.map((d) => `G6 ${theme} ${k} ${d}`))).sort();
  assert.deepEqual([...excepted].filter((x) => /^G6 /.test(x)).sort(), g6);
  // G7's exception was met, each pinned declaration on its own element in each theme, and nothing else of it.
  const g7 = [...G7_ONCE].flatMap(([theme, look]) => [...look].flatMap(([k, ds]) => ds.map((d) => `G7 ${theme} ${k} ${d}`))).sort();
  assert.deepEqual([...excepted].filter((x) => /^G7 /.test(x)).sort(), g7);
  // G7b's exception was met, each pinned declaration on its own element, and nothing else of it.
  const g7b = [...G7B_ONCE].flatMap(([k, ds]) => ds.map((d) => `G7B ${k} ${d}`)).sort();
  assert.deepEqual([...excepted].filter((x) => /^G7B /.test(x)).sort(), g7b);
  assert.deepEqual([...excepted].filter((x) => !/^(section\.sb-screen|div\.v2-tlhead|M3D[45] |G[1234567] |G7B )/.test(x)).sort(), [...[...M3D1_WAITS].map((d) => `span.v2-small.v2-wn ${d}`), ...m3d3].sort());
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
