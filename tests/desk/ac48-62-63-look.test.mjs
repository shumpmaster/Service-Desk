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

const MEANING = ['--you', '--agent', '--pass', '--fail', '--merge', '--block', '--gold', '--ph-disc', '--ph-des', '--ph-build', '--ph-launch', '--b-ctx', '--b-why', '--muted'];

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

test('AC48: the 14 colours that carry a meaning are distinct — every pair\'s CIEDE2000 difference at least 10, in the light theme and the dark theme alike (91 pairs each)', () => {
  const want = {
    light: { '--ph-disc': '#0f766e', '--ph-des': '#9d2f7e', '--ph-build': '#5c6a10', '--ph-launch': '#7a5a48', '--muted': '#4b525b', '--b-ctx': '#ad606a', '--b-why': '#756592' },
    dark: { '--ph-disc': '#65bdb3', '--ph-des': '#f07cca', '--ph-build': '#a4b562', '--ph-launch': '#c6a28f', '--muted': '#a3a9b2', '--b-ctx': '#bc7e8d', '--b-why': '#c7adcb', '--gold': '#c9b04f' },
  };
  const closest = {};
  for (const which of ['light', 'dark']) {
    const t = theme(which);
    for (const [k, v] of Object.entries(want[which])) assert.equal(t[k], v, `${which} ${k}`);
    assert.equal(Object.keys(t).length, 14);
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
    assert.equal(n, 91);
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

/** Every declaration in sandbox.css outside the comments, with the rest of its source line (where an AC62 comment sits). */
function declarations() {
  const out = [];
  const lines = RAW.split('\n');
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

test('AC62: the five spacing tokens, 4, 8, 12, 20 and 32 px', () => {
  const root = RAW.slice(RAW.indexOf('html.sb {'));
  assert.match(root, /--s1: 4px; --s2: 8px; --s3: 12px; --s4: 20px; --s5: 32px;/);
});

test('AC62: every margin, padding, gap, row-gap and column-gap is 0, one of the five tokens, or a value with its "AC62:" comment beside it', () => {
  const decls = declarations().filter((d) => SPACING.test(d.prop) && !/^\s*--/.test(d.prop));
  assert.ok(decls.length > 200, `${decls.length} spacing declarations`);
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
  assert.ok(fonts.length > 100);
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
  // The section label: small, upper case and spaced.
  for (const sel of ['.sb-pband-n', '.sb-k']) {
    const m = new RegExp(`\\n${sel.replace('.', '\\.')} \\{([^}]*)\\}`).exec(RAW);
    assert.ok(m, sel);
    assert.match(m[1], /font: var\(--t-section\)/);
    assert.match(m[1], /text-transform: uppercase/);
    assert.match(m[1], /letter-spacing: var\(--track\)/);
  }
});

test('AC62: every word kept — each sandbox screen\'s text, outside the parts AC57 to AC60 and AC65 to AC68 rebuild, is the snapshot taken at 2c1acb6, word for word', async () => {
  const snap = JSON.parse(readFileSync(`${FIX}/ac62-text-2c1acb6.json`, 'utf8')).routes;
  const routes = Object.keys(snap);
  assert.equal(routes.length, 55);
  const now = await screenTexts(routes, NEW_REBUILT);
  for (const r of routes) assert.deepEqual(now[r], snap[r], r);
});

// ---------------------------------------------------------------------------
// AC63

test('AC63: every text box\'s text is at least 16 px, from a rule no later rule overrides; the viewport line leaves zoom alone; no touch-action, user-scalable or gesture handler', () => {
  const css = RAW.replace(/\/\*[\s\S]*?\*\//g, '');
  // The two text boxes the sandbox draws: the response sheet's answer box and the per-question words box.
  assert.match(JS, /h\('textarea', \{ rows: '6'/);
  assert.match(JS, /h\('textarea', \{ rows: '3'.*class: 'sb-words'/);
  assert.doesNotMatch(JS, /h\('input'/, 'no input the owner types into');
  for (const sel of ['.sb-box textarea', '.sb-words']) {
    const rules = [...css.matchAll(/(^|\n)([^{}\n]+)\{([^}]*)\}/g)].map((m) => ({ sel: m[2].trim(), body: m[3], at: m.index }));
    const own = rules.filter((r) => r.sel.split(/\s*,\s*/).includes(sel));
    assert.equal(own.length, 1, sel);
    const px = /font: 400 (\d+)px\/1\.4/.exec(own[0].body);
    assert.ok(px && Number(px[1]) >= 16, `${sel}: ${px && px[1]} px`);
    // No later rule that could reach a textarea sets its font or size.
    for (const r of rules.filter((x) => x.at > own[0].at)) {
      const reaches = r.sel.split(/\s*,\s*/).some((x) => /(textarea|\.sb-words|\binput|\*)[^ >+~]*$/.test(x));
      const f = /font(?:-size)?:\s*([^;]+)/.exec(r.body);
      if (reaches && f) assert.ok(Number((/(\d+)px/.exec(f[1]) || [0, 0])[1]) >= 16, `${r.sel} overrides ${sel} with ${f[1]}`);
    }
  }
  const html = readFileSync(`${SRC}/public/index.html`, 'utf8');
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.doesNotMatch(html, /maximum-scale|minimum-scale|user-scalable/);
  for (const [name, text] of [['sandbox.css', RAW], ['sandbox.js', JS]]) {
    assert.doesNotMatch(text, /touch-action\s*:\s*(none|pan-x|pan-y|manipulation)/, name);
    assert.doesNotMatch(text, /user-scalable/, name);
    assert.doesNotMatch(text, /gesturestart|gesturechange|gestureend/, name);
    assert.doesNotMatch(text, /touches\.length\s*[>=]=?\s*2|touchmove/, `${name}: no script cancels a two-finger touch`);
  }
});
