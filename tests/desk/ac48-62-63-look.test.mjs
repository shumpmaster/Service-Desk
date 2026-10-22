// AC48's colour-distance rule (plan review round 2, N1; draft 4 and 5), AC62 (one spacing scale, one
// type scale of seven roles, every word kept) and AC63 (no zoom on a text box's tap, pinch left
// alone), trial-view notes 2, notes 3 to 5, 13, 14 and 32 (2026-10-16).
// ac-test: S-001/AC48 ac-test: S-001/AC62 ac-test: S-001/AC63
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SRC, FIX } from './helpers.mjs';
import { screenTexts, NEW_REBUILT } from './screen-text.mjs';

const RAW = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
const JS = readFileSync(`${SRC}/public/sandbox.js`, 'utf8');

// ---------------------------------------------------------------------------
// AC48: CIEDE2000 (sRGB, D65), the formula written here (Sharma, Wu and Dalal, 2005), no package.

function hexLab(hex) {
  const n = hex.replace('#', '');
  const lin = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const [r, g, b] = lin;
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const Y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
  const Z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}

export function de2000([L1, a1, b1], [L2, a2, b2]) {
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const hue = (b, a) => (b === 0 && a === 0 ? 0 : ((Math.atan2(b, a) / rad) + 360) % 360);
  const h1p = hue(b1, a1p);
  const h2p = hue(b2, a2p);
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hbp = (h1p + h2p) / 2;
    else hbp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  }
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad) + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.20 * Math.cos((4 * hbp - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin(2 * dTheta * rad) * Rc;
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));
}

// From stage 3 (S-001 AC84, specs/S-001.md:6923-6926: "gone: ... AC48's Technical slate, Context dusty rose and Why
// muted violet on the Timeline, and their place in AC48's colour-distance rule (AC48, changed)"): the 14 are 12.
const MEANING = ['--you', '--agent', '--pass', '--fail', '--merge', '--block', '--gold', '--ph-disc', '--ph-des', '--ph-build', '--ph-launch', '--muted'];

/** The tokens of a theme's block: the light one (`html.sb {`), and the dark one (`html.sb[data-theme="dark"] {`), with the light's for any it leaves out. */
function theme(which) {
  const block = (open) => {
    const i = RAW.indexOf(open);
    assert.ok(i >= 0, open);
    return RAW.slice(i, RAW.indexOf('}', i));
  };
  const read = (text) => Object.fromEntries([...text.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const light = read(block('html.sb {'));
  const all = which === 'light' ? light : { ...light, ...read(block('html.sb[data-theme="dark"] {')) };
  const out = {};
  for (const k of MEANING) {
    let v = all[k];
    for (let i = 0; i < 4 && /^var\(/.test(v); i++) v = all[/var\((--[a-z0-9-]+)\)/.exec(v)[1]];
    out[k] = v;
  }
  return out;
}

test('AC48: the formula agrees with Sharma, Wu and Dalal\'s published test pairs', () => {
  const pairs = [
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
    [[50, -1.3802, -84.2814], [50, 0, -82.7485], 1.0000],
    [[50, 2.5, 0], [73, 25, -18], 27.1492],
    [[50, 2.5, 0], [61, -5, 29], 22.8977],
    [[50, 2.5, 0], [56, -27, -3], 31.9030],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
    [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373],
    [[2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514], 0.9082],
  ];
  for (const [a, b, want] of pairs) assert.ok(Math.abs(de2000(a, b) - want) < 5e-4, `${a} / ${b}: ${de2000(a, b)} vs ${want}`);
});

test('AC48 (changed by AC84): the 12 colours that carry a meaning are distinct — every pair\'s CIEDE2000 difference at least 10, in the light theme and the dark theme alike (66 pairs each); the Timeline\'s three label colours are gone', () => {
  const want = {
    light: { '--ph-disc': '#0f766e', '--ph-des': '#9d2f7e', '--ph-build': '#5c6a10', '--ph-launch': '#7a5a48', '--muted': '#4b525b' },
    dark: { '--ph-disc': '#65bdb3', '--ph-des': '#f07cca', '--ph-build': '#a4b562', '--ph-launch': '#c6a28f', '--muted': '#a3a9b2', '--gold': '#c9b04f' },
  };
  assert.doesNotMatch(RAW.replace(/\/\*[\s\S]*?\*\//g, ''), /--b-(tech|ctx|why)\b/, 'no Technical, Context or Why colour left in the stylesheet');
  const closest = {};
  for (const which of ['light', 'dark']) {
    const t = theme(which);
    for (const [k, v] of Object.entries(want[which])) assert.equal(t[k], v, `${which} ${k}`);
    assert.equal(Object.keys(t).length, 12);
    let n = 0;
    let min = [Infinity];
    for (let i = 0; i < MEANING.length; i++) {
      for (let j = i + 1; j < MEANING.length; j++) {
        const d = de2000(hexLab(t[MEANING[i]]), hexLab(t[MEANING[j]]));
        n++;
        assert.ok(d >= 10, `${which}: ${MEANING[i]} ${t[MEANING[i]]} and ${MEANING[j]} ${t[MEANING[j]]} differ by ${d.toFixed(2)}`);
        if (d < min[0]) min = [d, MEANING[i], MEANING[j]];
      }
    }
    assert.equal(n, 66);
    closest[which] = min;
  }
  // As the spec measured them on 2026-10-16: coral and red in the light theme (about 11.4), amber and the new gold in the dark (about 11.0).
  assert.deepEqual(closest.light.slice(1), ['--you', '--fail']);
  assert.ok(Math.abs(closest.light[0] - 11.4) < 0.15, String(closest.light[0]));
  assert.deepEqual(closest.dark.slice(1), ['--block', '--gold']);
  assert.ok(Math.abs(closest.dark[0] - 11.0) < 0.15, String(closest.dark[0]));
  // The dark theme's two blocks agree (the media query's and the switch's).
  const media = RAW.slice(RAW.indexOf('html.sb:not([data-theme="light"]) {'));
  for (const k of MEANING) {
    const m = new RegExp(`${k}:\\s*([^;]+);`).exec(media.slice(0, media.indexOf('}')));
    if (m) assert.equal(m[1].trim(), theme('dark')[k], `${k} in both dark blocks`);
  }
});

// ---------------------------------------------------------------------------
// AC62

// From stage 1a (AC80, AC81): mockup v2's rules, in their own block at the stylesheet's end, take
// AC81's type tokens and the sizes AC80 names, which replace AC62's for the board, its sheets and the
// bar (AC62, changed); AC81's test checks them. AC62's scale holds for every rule before the block.
const V2_LINE = RAW.slice(0, RAW.lastIndexOf('/*', RAW.indexOf('Desk mockup v2 (spec S-001, AC80 and AC81'))).split('\n').length - 1;

/** Every declaration in sandbox.css outside the comments and before mockup v2's block, with the rest of its source line (where an AC62 comment sits). */
function declarations() {
  const out = [];
  const lines = RAW.split('\n').slice(0, V2_LINE);
  let inComment = false;
  lines.forEach((line, i) => {
    let code = '';
    for (let k = 0; k < line.length; k++) {
      if (inComment) {
        if (line.startsWith('*/', k)) { inComment = false; k++; }
        continue;
      }
      if (line.startsWith('/*', k)) { inComment = true; k++; continue; }
      code += line[k];
    }
    for (const m of code.matchAll(/(?:^|[{;\s])([a-z-]+)\s*:\s*([^;{}]+?)\s*(?=;|}|$)/g)) {
      const at = line.indexOf(m[0].trim());
      out.push({ prop: m[1], value: m[2].trim(), lineno: i + 1, after: at >= 0 ? line.slice(at) : line });
    }
  });
  return out;
}

const SPACING = /^(margin|padding)(-(top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end))?$|^(gap|row-gap|column-gap)$/;
const ON_SCALE = /^(0|auto|var\(--s[1-5]\))$/;

// Rewritten at stage 8 (AC44, step 4): the rules nothing draws once the desk is `/` went, so the part before mockup v2's
// block is shorter than the 600 lines this case held it to (the count only proved the block was found far down). Its
// criterion, AC62 as AC81 changed it (specs/S-001.md:5267-5276): the block is found, it is the stylesheet's last part,
// and no rule before it is a mockup v2 rule (those before it only ever exclude `.v2`).
test('AC62 + AC81: mockup v2\'s block is the stylesheet\'s last part, so every rule before it keeps AC62\'s scale', () => {
  assert.ok(RAW.includes('Desk mockup v2 (spec S-001, AC80 and AC81') && V2_LINE > 0, `the block starts at line ${V2_LINE + 1}`);
  const before = RAW.split('\n').slice(0, V2_LINE).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const early = [...before.matchAll(/(^|\n)([^{}\n@][^{}]*)\{/g)].map((m) => m[2].trim());
  assert.ok(early.length > 50, `${early.length} rules before it`);
  for (const sel of early) if (/\.v2/.test(sel)) assert.match(sel, /:where\(:not\(\.v2 \*\)\)/, `${sel}: before the block, a rule only for what is not mockup v2`);
  const after = RAW.split('\n').slice(V2_LINE).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const sels = [...after.matchAll(/(^|\n)([^{}\n@][^{}]*)\{/g)].map((m) => m[2].trim()).filter((x) => !/^(from|to|\d+%)$/.test(x));
  assert.ok(sels.length > 50, `${sels.length} rules`);
  for (const sel of sels) {
    for (const one of sel.split(/\s*,\s*(?![^(]*\))/)) assert.match(one, /^(\.v2-|\.v2( |$)|:where\(\.v2\) |html\.sb \.v2|html\.sb\.v2-page|html\.sb body|html\.sb\[data-theme="dark"\] \.v2|html\.sb\[data-theme="dark"\]\.v2-page|:root|html\.sb:not)/, `${one}: a mockup v2 rule only`);
  }
});

test('AC62: the five spacing tokens, 4, 8, 12, 20 and 32 px', () => {
  const root = RAW.slice(RAW.indexOf('html.sb {'));
  assert.match(root, /--s1: 4px; --s2: 8px; --s3: 12px; --s4: 20px; --s5: 32px;/);
});

test('AC62: every margin, padding, gap, row-gap and column-gap is 0, one of the five tokens, or a value with its "AC62:" comment beside it', () => {
  const decls = declarations().filter((d) => SPACING.test(d.prop) && !/^\s*--/.test(d.prop));
  // From stage 8 (AC44, step 4) the dead rules went and fewer than 200 remain; the count only proved the parse read the
  // stylesheet, so it is held to that (AC62's scale, specs/S-001.md:5281-5285): the screen's own gap is among them.
  assert.ok(decls.length > 100, `${decls.length} spacing declarations`);
  assert.ok(decls.some((d) => d.prop === 'gap' && d.value === 'var(--s3)' && /^\.sb-screen \{/.test(RAW.split('\n')[d.lineno - 1])), 'the parse reads .sb-screen\'s gap');
  const excepted = [];
  for (const d of decls) {
    const parts = d.value.split(/\s+(?![^(]*\))/);
    if (parts.every((x) => ON_SCALE.test(x))) continue;
    assert.match(d.after, /\/\* AC62: [^*]+\*\//, `line ${d.lineno}: ${d.prop}: ${d.value} is off the scale with no comment naming why`);
    excepted.push(`${d.lineno}: ${d.prop}: ${d.value}`);
  }
  assert.ok(excepted.length < 40, `${excepted.length} exceptions`);
});

test('AC62: every font and font-size uses one of the seven roles\' tokens, but the text boxes (AC63) and marks drawn as text (with their comment)', () => {
  const roles = ['--t-screen', '--t-section', '--t-item', '--t-body', '--t-meta', '--t-quote', '--t-code'];
  const fonts = declarations().filter((d) => d.prop === 'font' || d.prop === 'font-size');
  // From stage 8 (AC44, step 4) the dead rules went, and with them fonts; the count only proved the parse read the
  // stylesheet, so it is held to that (AC62's type scale, specs/S-001.md:5296-5297): .sb-meta's role is among them.
  assert.ok(fonts.length > 60, `${fonts.length} fonts`);
  assert.ok(fonts.some((d) => d.value === 'var(--t-meta)' && /^\.sb-meta \{/.test(RAW.split('\n')[d.lineno - 1])), 'the parse reads .sb-meta\'s font');
  for (const d of fonts) {
    if (/^var\(--t-(screen|section|item|body|meta|quote|code)\)$/.test(d.value)) continue;
    if (/^400 16px\/1\.4 var\(--(mono|font)\)$/.test(d.value)) {
      assert.match(RAW.split('\n')[d.lineno - 1], /^\.sb-box textarea|^\.sb-words /, `line ${d.lineno}: 16 px for a text box only`);
      continue;
    }
    assert.match(d.after, /\/\* AC62: [^*]*(icon|mark)[^*]*\*\//, `line ${d.lineno}: ${d.prop}: ${d.value} takes a size of its own`);
  }
  // The seven tokens, each its own look.
  const root = RAW.slice(RAW.indexOf('html.sb {'), RAW.indexOf('}', RAW.indexOf('html.sb {')));
  const vals = roles.map((r) => new RegExp(`${r}: ([^;]+);`).exec(root)[1]);
  assert.equal(new Set(vals).size, 7, vals.join(' | '));
  assert.deepEqual(vals, ['800 1.45rem/1.2 var(--font)', '800 .74rem/1.3 var(--font)', '700 1rem/1.3 var(--font)', '400 .94rem/1.5 var(--font)',
    '600 .78rem/1.35 var(--font)', '400 .9rem/1.45 var(--font)', '500 .74rem/1.3 var(--mono)'], 'the mockup\'s --t-* values');
  // The section label: small, upper case and spaced. From stage 3 the Timeline's band name and its Technical,
  // Context and Why labels (`.sb-pband-n`, `.sb-k`, which this case read) are AC84's: "never boxed or in
  // capitals" (:6919-6920), the band's name 600 12 px and each label --t-label in --ink2 (rewritten so).
  for (const [sel, font] of [['.v2-tpn', '600 12px/1.3 var(--font)'], ['.v2-bn', 'var(--t-label)']]) {
    const m = new RegExp(`\\n${sel.replace('.', '\\.')} \\{([^}]*)\\}`).exec(RAW);
    assert.ok(m, sel);
    assert.ok(m[1].includes(`font: ${font}`), `${sel}: ${font}`);
    assert.doesNotMatch(m[1], /text-transform|letter-spacing|border:/, `${sel}: not upper case, spaced or boxed`);
  }
  assert.doesNotMatch(RAW, /\n\.sb-k \{/, 'the boxed label chip is gone');
});

test('AC62: every word kept — each sandbox screen\'s text, outside the parts AC57 to AC60 and AC65 to AC68 rebuild, is the snapshot taken at 2c1acb6, word for word', async () => {
  const snap = JSON.parse(readFileSync(`${FIX}/ac62-text-2c1acb6.json`, 'utf8')).routes;
  const routes = Object.keys(snap);
  assert.equal(routes.length, 55);
  const now = await screenTexts(routes, NEW_REBUILT);
  // From stage 1a (AC80, AC81): the Queue screen goes, the board taking its contents (AC80's test
  // reads the board): its routes open Waiting, so they are not compared. The project screens' bottom
  // bar goes too (AC81, "Until stage 3"): its four words leave the snapshot's end; the bar and top row
  // that replace it are left out (NEW_REBUILT). Every other word is compared, as before.
  const queueRoutes = routes.filter((r) => /\/queue(\/|$)/.test(r));
  assert.equal(queueRoutes.length, 9, queueRoutes.join(' '));
  const BAR = ['Status', 'Timeline', 'Team', 'Queue'];
  // The bar drawn after the screen and before any sheet over it: its one run of four words, and the
  // Queue tab's badge count after them where it had one.
  const lessBar = (runs) => {
    const at = runs.findIndex((_, i) => BAR.every((w, k) => runs[i + k] === w));
    if (at < 0) return runs;
    const n = /^\d+$/.test(runs[at + 4] || '') ? 5 : 4;
    return [...runs.slice(0, at), ...runs.slice(at + n)];
  };
  // From 2026-10-17 (model 3.5.0's records): on a v3 project's Chief of Staff page, AC49 as changed in
  // place rebuilds its status line, its "Responsible for" groups and its running log from the session
  // lines (J13), which NEW_REBUILT leaves out; the snapshot's runs for those parts are left out the same
  // way, and every other word of the page (its header, the two headings, the bottom bar) still compared.
  const cosParts = (runs) => {
    const a = runs.indexOf('Responsible for');
    const b = runs.indexOf('Running log');
    const c = runs.indexOf('Status', b);
    return [...runs.slice(0, runs.indexOf('Chief of Staff') + 1), ...runs.slice(a, a + 1), ...runs.slice(b, b + 1), ...runs.slice(c)];
  };
  const rebuiltCos = ['#/p/Service-Desk/team/chief-of-staff', '#/p/Alpha/team/chief-of-staff'];
  // From stage 2 (AC82): Home is built to mockup v2 (frames H1 to H5), so "every word kept" no longer
  // binds it and stage 2 takes it off the snapshot (AC62, changed by AC81: "each stage's pull request
  // takes its screens off it"); AC82's test reads its words. Every project screen is compared, as before.
  // From stage 3 (AC83, AC84): each project's page (at the Status screen's address, with its "About the
  // phases" sheet) and its Timeline are built to mockup v2 (frames
  // 5 to 8 and 7b), so stage 3 takes them off the snapshot the same way; AC83's and AC84's tests read their
  // words (AC84's: every word AC59 to AC61 show, inside its folds). The Team screen, a member's pages and the
  // detail views are compared as before, less the phase line that replaces AC68's marker (NEW_REBUILT).
  const stage3 = routes.filter((r) => /^#\/p\/[^/]+(\/info|\/timeline)?$/.test(r));
  assert.equal(stage3.length, 9, stage3.join(' '));
  const builtV2 = ['#/', ...stage3];
  assert.deepEqual(routes.filter((r) => !/^#\/p\//.test(r)), ['#/'], 'the one route that is not a project screen is Home');
  // From stage 8 (AC43's marker carried "until stage 8", specs/S-001.md:13702; AC44, step 4, :2918-2921): the trial view is
  // the desk and its marker, "Sandbox: candidate design", leaves every screen: it leaves the snapshot's runs too, and
  // every other word is compared, as before.
  const lessMarker = (runs) => runs.filter((w) => w !== 'Sandbox: candidate design');
  for (const r of routes) {
    if (queueRoutes.includes(r) || builtV2.includes(r)) continue;
    assert.deepEqual(now[r], lessMarker(lessBar(rebuiltCos.includes(r) ? cosParts(snap[r]) : snap[r])), r);
  }
  assert.deepEqual(cosParts(snap[rebuiltCos[0]]), ['Sandbox: candidate design', 'Back', 'Home', 'Service-Desk', 'Chief of Staff', 'Responsible for', 'Running log', 'Status', 'Timeline', 'Team', 'Queue']);
  assert.ok(snap['#/p/Delta/team/chief-of-staff'].includes("Its sessions aren't recorded"), 'the v2.5 project\'s page is compared whole, unchanged');
});

// ---------------------------------------------------------------------------
// AC63

test('AC63 + AC80: every text box\'s text is at least 16 px, from a rule no later rule overrides; the viewport line leaves zoom alone; no touch-action, user-scalable or gesture handler; the drag cancels only a lifted card\'s one-finger move', () => {
  const css = RAW.replace(/\/\*[\s\S]*?\*\//g, '');
  // From stage 1a (AC80, AC81): the Queue's response sheet goes with its answer box and words boxes;
  // the one text box the sandbox draws is the card sheet's own-words box (one per question), in
  // AC81's `--t-input`, 400 16px/1.4.
  assert.doesNotMatch(JS, /h\('textarea', \{ rows: '6'/, 'the Queue\'s answer box is gone');
  assert.match(JS, /h\('textarea', \{ rows: '3', key: `words:\$\{k\}`, class: 'v2-input'/);
  assert.equal((JS.match(/h\('textarea'/g) || []).length, 1, 'one text box');
  assert.doesNotMatch(JS, /h\('input'/, 'no input the owner types into');
  assert.match(css, /--t-input: 400 16px\/1\.4 var\(--font\);/);
  assert.equal((css.match(/--t-input:/g) || []).length, 1, 'set once, in both themes');
  for (const sel of ['.v2-input']) {
    const rules = [...css.matchAll(/(^|\n)([^{}\n]+)\{([^}]*)\}/g)].map((m) => ({ sel: m[2].trim(), body: m[3], at: m.index }));
    const own = rules.filter((r) => r.sel.split(/\s*,\s*/).includes(sel));
    assert.equal(own.length, 1, sel);
    assert.match(own[0].body, /font: var\(--t-input\);/, `${sel}: 16 px`);
    // No later rule that could reach a textarea sets its font or size.
    for (const r of rules.filter((x) => x.at > own[0].at)) {
      const reaches = r.sel.split(/\s*,\s*/).some((x) => /(textarea|\.v2-input|\binput|\*)[^ >+~]*$/.test(x));
      const f = /font(?:-size)?:\s*([^;]+)/.exec(r.body);
      if (reaches && f) assert.ok(f[1] === 'var(--t-input)' || Number((/(\d+)px/.exec(f[1]) || [0, 0])[1]) >= 16, `${r.sel} overrides ${sel} with ${f[1]}`);
    }
  }
  const html = readFileSync(`${SRC}/public/index.html`, 'utf8');
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.doesNotMatch(html, /maximum-scale|minimum-scale|user-scalable/);
  for (const [name, text] of [['sandbox.css', RAW], ['sandbox.js', JS]]) {
    assert.doesNotMatch(text, /touch-action\s*:\s*(none|pan-x|pan-y|manipulation)/, name);
    assert.doesNotMatch(text, /user-scalable/, name);
    assert.doesNotMatch(text, /gesturestart|gesturechange|gestureend/, name);
    assert.doesNotMatch(text, /touches\.length\s*[>=]=?\s*2/, `${name}: no script cancels a two-finger touch`);
  }
  // AC80's drag: once a card is lifted, its one finger moves it, not the page; the one touchmove
  // handler cancels only a one-finger move while a card is lifted, never a touch of two fingers.
  const tm = JS.match(/addEventListener\('touchmove'[\s\S]*?\}, \{ passive: false \}\);/g) || [];
  assert.equal(tm.length, 1, 'one touchmove handler');
  assert.match(tm[0], /if \(drag\.lifted && e && e\.touches && e\.touches\.length === 1 && e\.cancelable && e\.preventDefault\) e\.preventDefault\(\);/);
  assert.equal((JS.match(/touchmove/g) || []).length, 1);
  assert.doesNotMatch(RAW, /touch-action/, 'no rule sets touch-action');
});

test('AC48 + AC57 (draft 6, N4): runs 3 and 4 take their own neutral-tinted shades, each at least 10 from the 14 and from each other in its theme, at least 3:1 against the page and the cards; run 5 on reuse them in turn', async () => {
  const want = { light: { '--run3': '#7b828a', '--run4': '#7f8669' }, dark: { '--run3': '#8d8d77', '--run4': '#c3d0c3' } };
  const block = (open) => { const i = RAW.indexOf(open); return RAW.slice(i, RAW.indexOf('}', i)); };
  const read = (text) => Object.fromEntries([...text.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const lum = (hex) => {
    const c = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  for (const which of ['light', 'dark']) {
    const all = which === 'light' ? read(block('html.sb {')) : { ...read(block('html.sb {')), ...read(block('html.sb[data-theme="dark"] {')) };
    if (which === 'dark') {
      const media = read(block('html.sb:not([data-theme="light"]) {'));
      for (const k of ['--run3', '--run4']) assert.equal(media[k], want.dark[k], `${k} in the media query's dark block`);
    }
    const t = theme(which);
    for (const k of ['--run3', '--run4']) {
      assert.equal(all[k], want[which][k], `${which} ${k}`);
      for (const m of MEANING) {
        const d = de2000(hexLab(all[k]), hexLab(t[m]));
        assert.ok(d >= 10, `${which}: ${k} and ${m} differ by ${d.toFixed(2)}`);
      }
      for (const bg of ['--page', '--surf']) assert.ok(contrast(all[k], all[bg]) >= 3, `${which}: ${k} on ${bg} ${contrast(all[k], all[bg]).toFixed(2)}:1`);
    }
    assert.ok(de2000(hexLab(all['--run3']), hexLab(all['--run4'])) >= 10, `${which}: run 3 and run 4 apart`);
  }
  assert.doesNotMatch(RAW, /--run3: var\(--agent\)/, 'no longer the agent blue');
  // Where the shades are drawn. Stage 8 (AC44, step 4) removed the old Status screen's branch drawing (`.sb-rail`) and its
  // run tags (`.sb-rtag`), which nothing drew once the desk became `/`; the shade stays where it is drawn, AC70's "Run <k>
  // began" line "in its run's own shade" (specs/S-001.md:5735-5736), from run 2 to run 4 and run 5 on by runShade.
  for (const sel of ['.sb-began.run2 { --rk: var(--run2); }', '.sb-began.run3 { --rk: var(--run3); }', '.sb-began.run4 { --rk: var(--run4); }',
    '.sb-began-h, .sb-began-k { color: var(--rk, var(--run2)); }']) assert.ok(RAW.includes(sel), sel);
  assert.doesNotMatch(RAW, /\.sb-rail|\.sb-rtag/, 'the old branch drawing and run tags are gone');
  const { runShade } = await import('../../src/public/sandbox.js');
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map(runShade), ['run1', 'run2', 'run3', 'run4', 'run3', 'run4', 'run3']);
});
