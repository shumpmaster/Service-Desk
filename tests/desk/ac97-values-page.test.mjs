// ac-test: S-001/AC97 — the value targets on the page (stage VT1 of "The desk's value targets shown: M3B"): Service-Desk's
// "Value targets V1 to V5" row with its five marks, each the sheet's, its words and its left icon; the sheet's small line,
// each target's block in its order (its id and short name, the figure in `--t-title`, the chart, the verdict, the check's
// line, "The whole target ›", "<k> earlier checks ›"), the quote whole when opened and the opened states kept through a
// refresh, the sheet's close and Escape (AC56); the charts drawn (the track, the fill by its verdict, V5's grey, the goal
// line at its tick, a zero's 4 px stub); green and red only with ✓ or ✕ and words; the miss and stop rule held to exactly
// three lines with "Read it all ›" (sandbox.css's quote padding against the clip's, fixed for it); and another project's
// row and sheet. The page is the sandbox's own code under the fake DOM, on Service-Desk's records at 77bfeae with section 3
// and 6 at 7b69b2b (real) and made-up J25 lines, cards and a made-up launch (NOT real: tests/desk/vt1-fixtures.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { stopRule } from '../../src/lib/j11.js';
import { vt1State, chi, vc, DAY5, FINAL, windowCards, novemberCards, J7B_DOC, J7B_LINES, ALPHA_TARGETS } from './vt1-fixtures.mjs';

const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const svgKind = (el) => (el && el.tag === 'svg' ? el.attrs.class.split(' ').find((c) => c.startsWith('st-')).slice(3) : null);
const sheet = (app) => byClass(app.view, 'v2-sheet')[0];
const block = (app, id) => findAll(sheet(app), (e) => e.attrs && e.attrs['data-target'] === id)[0];
async function open(st, now, hash = '#/p/Service-Desk') {
  const app = await loadSandbox({ ...st, hash, now, store: memStore() });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v || '').replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
/** The page cascaded (light, 360 px): each drawn element's node, with its declared values. */
function cascaded(app) {
  const tree = treeOf(app.view, { className: document.documentElement.className, attrs: {} });
  return nodes(cascade(tree, RULES, { scheme: 'light', width: 360, reducedMotion: false }));
}

test('AC97: Service-Desk\'s "Value targets V1 to V5" row — five marks under its title, each its icon and its id in Plex Mono, each the sheet\'s; its words by its state; its left icon by the one rule (the picture\'s day 5: red)', async () => {
  const app = await open(vt1State({ lines: DAY5, cards: windowCards() }), chi('2026-12-07', '15:00'));
  try {
    const row = keyed(app, 'rest:values');
    assert.equal(byClass(row, 'v2-prtt')[0].textContent, 'Value targets V1 to V5');
    const marks = byClass(row, 'v2-vmk');
    assert.deepEqual(marks.map((m) => byClass(m, 'v2-mono')[0].textContent), ['V1', 'V2', 'V3', 'V4', 'V5']);
    const rowKinds = marks.map((m) => svgKind(m.children[0]));
    assert.deepEqual(rowKinds, ['check', 'cross', 'check', 'check', 'check']);
    assert.deepEqual(marks.map((m) => byClass(m, 'sb-vh')[0].textContent), [' within target so far,', ' missed,', ' within target so far,', ' met,', ' within target so far,'], 'each mark said in words');
    assert.equal(byClass(row, 'v2-small')[0].textContent, '5 targets · 1 outside target · 4 within, so far');
    assert.equal(svgKind(row.children[0]), 'cross');
    assert.match(row.children[0].attrs.class, /\bbad\b/, 'the red cross');
    await app.go(row.attrs.href);
    const sheetKinds = ['V1', 'V2', 'V3', 'V4', 'V5'].map((id) => svgKind(byClass(block(app, id), 'v2-vverd')[0].children[0]));
    assert.deepEqual(sheetKinds, rowKinds, 'the same marks the sheet shows');
  } finally {
    app.restore();
  }
  // Before launch (made up: no reached date), with the planned ring and the fixed words; on launch day, the half circle.
  const before = await open(vt1State({ launch: null, nov: novemberCards() }), chi('2026-11-27', '15:00'));
  try {
    const row = keyed(before, 'rest:values');
    assert.equal(byClass(row, 'v2-small')[0].textContent, 'Measured from launch · V4, replacing the old page, at launch');
    assert.deepEqual(byClass(row, 'v2-vmk').map((m) => svgKind(m.children[0])), ['planned', 'planned', 'planned', 'planned', 'planned'], 'V5 grey with the planned ring');
    assert.equal(svgKind(row.children[0]), 'planned');
  } finally {
    before.restore();
  }
});

test('AC97: the sheet — "From the project document, section 6 · weekly checks by your Chief of Staff"; each target\'s block in order (its id in Plex Mono and its short name, the figure, the chart, the verdict, the check\'s line, "The whole target ›", "<k> earlier checks ›"); the quote whole when opened; the opened states kept through a refresh; Escape closes it (AC56)', async () => {
  const app = await open(vt1State({ lines: FINAL, cards: windowCards() }), chi('2026-12-24', '15:00'), '#/p/Service-Desk/values');
  try {
    const sh = sheet(app);
    assert.equal(byClass(sh, 'v2-stitle')[0].textContent, 'Value targets V1 to V5');
    assert.equal(byClass(sh, 'v2-small')[0].textContent, 'From the project document, section 6 · weekly checks by your Chief of Staff');
    assert.deepEqual(byClass(sh, 'v2-tgt').map((b) => b.attrs['data-target']), ['V1', 'V2', 'V3', 'V4', 'V5'], 'section 6\'s order');
    const v2 = block(app, 'V2');
    const parts = v2.children.map((c) => (c.className || c.tag).split(' ')[0]);
    assert.deepEqual(parts, ['v2-vth', 'v2-vfig', 'v2-vchart', 'v2-vverd', 'v2-vline', 'v2-fold', 'v2-fold']);
    assert.deepEqual([byClass(v2.children[0], 'v2-mono')[0].textContent, v2.children[0].textContent], ['V2', 'V2 False alarms']);
    assert.equal(byClass(v2, 'v2-vbig')[0].textContent, '2');
    assert.equal(byClass(v2, 'v2-vfw')[0].textContent, 'false alarms in a week, the most (3 – 6 Dec)');
    assert.equal(byClass(v2, 'v2-vverd')[0].textContent, 'Missed · goal: at most 1 a week');
    assert.equal(findAll(byClass(v2, 'v2-vverd')[0], (e) => e.tag === 'b')[0].textContent, 'Missed');
    assert.equal(v2.children[4].textContent, "Your Chief of Staff's check, 21 Dec: missed");
    assert.deepEqual([v2.children[5].textContent, v2.children[6].textContent], ['The whole target', '2 earlier checks']);
    // The figure in --t-title, its words in --t-small.
    const n = cascaded(app);
    const big = n.find((x) => x.el === byClass(v2, 'v2-vbig')[0]);
    assert.equal(plain(big.declared.get('font')), '600 24px/1.2 "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif');
    assert.equal(plain(n.find((x) => x.el === byClass(v2, 'v2-vfw')[0]).declared.get('font')), '400 12px/1.4 "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif');
    // Opened: the line quoted whole; the earlier checks listed, newest first.
    await app.tap(v2.children[5]);
    await app.tap(block(app, 'V2').children[block(app, 'V2').children.length - 1]);
    const opened = block(app, 'V2');
    assert.equal(byClass(opened, 'v2-quote')[0].textContent, J7B_LINES[1], 'word for word');
    assert.deepEqual(findAll(byClass(opened, 'v2-vearly')[0], (e) => e.tag === 'li').map((x) => x.textContent),
      ['14 Dec: 1 false alarm, 7 – 13 Dec · missed', '7 Dec: 2 false alarms, 3 – 6 Dec · missed']);
    // A refresh (AC56) keeps both open.
    await app.advance(2 * POLL_MS);
    assert.equal(byClass(block(app, 'V2'), 'v2-quote')[0].textContent, J7B_LINES[1]);
    assert.ok(byClass(block(app, 'V2'), 'v2-vearly')[0]);
    assert.equal(byClass(block(app, 'V1'), 'v2-quote').length, 0, 'only the one opened');
    await app.key('Escape');
    assert.equal(sheet(app), undefined, 'Escape closes the sheet');
    assert.ok(keyed(app, 'rest:values'), 'back on the page');
    await app.go('#/p/Service-Desk/values');
    assert.ok(byClass(block(app, 'V2'), 'v2-quote')[0], 'the opened quote kept for the window');
    assert.equal(keyed(app, 'sheet-close').attrs['aria-label'], 'Close');
  } finally {
    app.restore();
  }
});

test('AC97: the charts drawn — a `--line` track, the fill by its verdict (V5 `--ink3` before W1), the goal\'s 2 px line at its tick and its label above, each bar\'s label at its left and its value at its right in Plex Mono, a measured zero a 4 px stub; V4\'s two steps; no chart for anything unmeasured', async () => {
  const app = await open(vt1State({ lines: FINAL, cards: windowCards() }), chi('2026-12-24', '15:00'), '#/p/Service-Desk/values');
  try {
    const bars = (id) => byClass(block(app, id), 'v2-vsvg').map((s) => {
      const r = findAll(s, (e) => e.tag === 'rect');
      return [r[0].attrs.class, r[1].attrs.class, r[1].attrs.width, r[2].attrs.class, r[2].attrs.x, r[2].attrs.width];
    });
    assert.deepEqual(bars('V1'), [['tr', 'fl ok', '4', 'gl', '0', '2']], 'a zero: the stub, the tick at 0');
    assert.deepEqual(bars('V2'), [['tr', 'fl bad', '66.67%', 'gl', '33.333%', '2'], ['tr', 'fl ok', '33.33%', 'gl', '33.333%', '2'], ['tr', 'fl ok', '4', 'gl', '33.333%', '2']]);
    assert.deepEqual(bars('V3').map((b) => [b[1], b[2], b[4]]), [['fl ok', '33.33%', '50%'], ['fl ok', '41.67%', '50%'], ['fl ok', '25%', '50%']]);
    assert.deepEqual(byClass(block(app, 'V2'), 'v2-vgl').map((x) => [x.textContent, x.className]), [['goal ≤ 1', 'v2-vgl at33']]);
    assert.deepEqual(byClass(block(app, 'V3'), 'v2-vbl').map((x) => x.textContent), ['', '3 – 6 Dec', '7 – 13 Dec', '14 – 16 Dec']);
    assert.deepEqual(byClass(block(app, 'V3'), 'v2-vbv').map((x) => x.textContent), ['20m', '25m', '15m']);
    assert.deepEqual(byClass(block(app, 'V5'), 'v2-vbl').map((x) => x.textContent).filter(Boolean), ['First 14 days', 'Weekly check']);
    assert.deepEqual(findAll(byClass(block(app, 'V4'), 'v2-vsteps')[0], (e) => e.tag === 'li').map((li) => [svgKind(li.children[0]), li.textContent]),
      [['check', 'Serving the Operations-Hub address since 2 Dec'], ['check', 'Old repository archived 2 Dec']]);
    assert.equal(byClass(block(app, 'V4'), 'v2-vchart').length, 0);
    // The cascade: the track --line, the fills --ok and --bad, the goal line --ink, the labels --t-label at 400 in --ink2,
    // the values --t-mono in --ink.
    const n = cascaded(app);
    const decl = (el, p) => plain(n.find((x) => x.el === el).declared.get(p));
    const r2 = findAll(byClass(block(app, 'V2'), 'v2-vsvg')[0], (e) => e.tag === 'rect');
    assert.deepEqual(r2.map((r) => decl(r, 'fill')), ['#e7e7ea', '#b3162a', '#18191c']);
    assert.equal(decl(byClass(block(app, 'V2'), 'v2-vbv')[0], 'font'), '400 11px/1.4 "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace');
  } finally {
    app.restore();
  }
  // Before launch: V5's one bar grey, --ink3; V1 to V3 with no chart.
  const before = await open(vt1State({ launch: null, nov: novemberCards() }), chi('2026-11-27', '15:00'), '#/p/Service-Desk/values');
  try {
    const r = findAll(byClass(block(before, 'V5'), 'v2-vsvg')[0], (e) => e.tag === 'rect');
    assert.equal(r[1].attrs.class, 'fl grey');
    assert.equal(plain(cascaded(before).find((x) => x.el === r[1]).declared.get('fill')), '#6a6d75', '--ink3, light');
    assert.deepEqual(byClass(block(before, 'V5'), 'v2-vbl').map((x) => x.textContent).filter(Boolean), ['Before launch']);
    for (const id of ['V1', 'V2', 'V3']) assert.equal(byClass(block(before, id), 'v2-vchart').length, 0, id);
    assert.equal(svgKind(byClass(block(before, 'V5'), 'v2-vverd')[0].children[0]), 'planned');
    assert.equal(byClass(block(before, 'V5'), 'v2-vverd')[0].textContent, 'Before launch, not counted · goal: under 4h');
  } finally {
    before.restore();
  }
});

test('AC97 + AC69: green and red only on a ✓ or ✕ with its words beside it, and on a chart\'s fill beside its value; no vermilion in the row or the sheet', async () => {
  const app = await open(vt1State({ lines: DAY5, cards: windowCards() }), chi('2026-12-07', '15:00'), '#/p/Service-Desk/values');
  try {
    const n = cascaded(app);
    const inSheetOrRow = (x) => { for (let a = x; a; a = a.parent) if (a.el === sheet(app) || a.el === keyed(app, 'rest:values')) return true; return false; };
    const coloured = n.filter((x) => inSheetOrRow(x) && ['color', 'fill'].some((p) => /#(12733a|b3162a|c9380c)/.test(plain(x.style.get(p) || x.declared.get(p) || ''))));
    assert.ok(coloured.length > 0);
    for (const x of coloured) {
      const v = plain(x.style.get('color') || '') + plain(x.declared.get('fill') || '');
      assert.doesNotMatch(v, /#c9380c/, 'no vermilion');
      if (x.tag === 'svg') assert.ok(/\bst-(check|cross)\b/.test(x.attrs.class), `${x.attrs.class}: a ✓ or ✕ only`);
      else if (x.tag === 'rect') assert.ok(x.parent.parent && x.parent.parent.kids.some((k) => k.cls.has('v2-vbv') && k.text.trim()), 'a fill beside its value');
      else if (!(x.parent && x.parent.tag === 'svg')) assert.fail(`${x.tag}.${[...x.cls].join('.')}: green or red words`);
    }
  } finally {
    app.restore();
  }
});

test('AC97: the miss and stop rule — "Miss and stop rule", the rule quoted from "A miss is …", held to three lines with "Read it all ›", whole when opened; its clip exact: the clip\'s padding (none over or under) wins over the sheet\'s quote padding (2 px, sandbox.css `.v2-sheet .v2-quote`), so a quote of exactly three lines is not cut', async () => {
  const app = await open(vt1State({ lines: DAY5, cards: windowCards() }), chi('2026-12-07', '15:00'), '#/p/Service-Desk/values');
  try {
    const stop = byClass(sheet(app), 'v2-vstop')[0];
    assert.equal(byClass(stop, 'v2-bh')[0].textContent, 'Miss and stop rule');
    const clip = keyed(app, 'clip:vt-stop:Service-Desk');
    assert.equal(clip.textContent, stopRule(J7B_DOC));
    assert.match(clip.textContent, /^A miss is the redesign/);
    assert.equal(sheet(app).children.at(-1), stop, 'after the last target, last on the sheet');
    // The cascade: the stop quote's own padding and its three lines; the target quote keeps the sheet's.
    const n = cascaded(app);
    const c = n.find((x) => x.el === clip);
    assert.equal(plain(c.declared.get('padding')), '0 0 0 10px', 'the clip\'s padding wins');
    assert.equal(plain(c.declared.get('max-height')), 'calc(3 * 1.45em)');
    assert.match(plain(c.declared.get('font')), /^400 13px\/1\.45 /, 'its line height the clip\'s 1.45');
    // Three lines (the browser measures them; the fake DOM lays out no text): no fade, no control.
    const LINE = 13 * 1.45;
    clip.clientHeight = Math.round(3 * LINE);
    clip.scrollHeight = Math.round(3 * LINE);
    await app.resize(360);
    assert.doesNotMatch(keyed(app, 'clip:vt-stop:Service-Desk').className, /\bover\b/);
    assert.equal(keyed(app, 'clipbtn:vt-stop:Service-Desk'), null);
    // More: faded, "Read it all", then whole.
    const c2 = keyed(app, 'clip:vt-stop:Service-Desk');
    c2.clientHeight = Math.round(3 * LINE);
    c2.scrollHeight = Math.round(5 * LINE);
    await app.resize(360);
    assert.match(keyed(app, 'clip:vt-stop:Service-Desk').className, /\bover\b/);
    const more = keyed(app, 'clipbtn:vt-stop:Service-Desk');
    assert.equal(more.textContent, 'Read it all');
    await app.tap(more);
    assert.match(keyed(app, 'clip:vt-stop:Service-Desk').className, /\bopen\b/);
    assert.equal(keyed(app, 'clip:vt-stop:Service-Desk').textContent, stopRule(J7B_DOC));
  } finally {
    app.restore();
  }
  // Before the fix (made up: the rule taken out), the sheet's quote padding wins and a three-line quote is cut by 4 px.
  const css = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
  assert.match(css, /\n\.v2-vstop \.v2-clip\.v2-quote \{ padding: 0 0 0 10px; \}/);
  assert.match(css, /\n\.v2-sheet \.v2-quote \{[^}]*padding: 2px 0 2px 10px;/);
});

test('AC97: another v3 project\'s row and sheet — its targets with no J25 line, "3 targets · weekly check not recorded yet" and the planned ring; with lines, the Chief of Staff\'s met or missed, the figure with its dates, no chart; its sheet\'s small line "From the project document, section 6"', async () => {
  const lines = [vc({ target: 'V1', project: 'Alpha', from: '2026-11-30', to: '2026-12-06', value: 14, figure: '14 signups', state: 'missed' })];
  for (const withLines of [false, true]) {
    const app = await open(vt1State({ lines: withLines ? lines : [], alpha: ALPHA_TARGETS }), chi('2026-12-07', '15:00'), '#/p/Alpha');
    try {
      const row = keyed(app, 'rest:values');
      assert.equal(byClass(row, 'v2-prtt')[0].textContent, 'Value targets V1 to V3');
      assert.equal(byClass(row, 'v2-small')[0].textContent, withLines ? '3 targets · 1 missed · 2 not recorded yet' : '3 targets · weekly check not recorded yet');
      assert.equal(svgKind(row.children[0]), withLines ? 'cross' : 'planned');
      await app.go(row.attrs.href);
      const sh = sheet(app);
      assert.equal(byClass(sh, 'v2-small')[0].textContent, 'From the project document, section 6');
      assert.equal(byClass(sh, 'v2-vchart').length, 0, 'no chart');
      assert.equal(byClass(sh, 'v2-vstop').length, 0, 'its section 6 holds no rule in that form');
      const v1 = block(app, 'V1');
      assert.equal(v1.children[0].textContent, 'V1 Signups');
      if (withLines) {
        assert.equal(byClass(v1, 'v2-vfig')[0].textContent, '14 signups 30 Nov – 6 Dec');
        assert.equal(byClass(v1, 'v2-vverd')[0].textContent, "Missed · your Chief of Staff's check, 7 Dec");
      } else assert.equal(byClass(v1, 'v2-vverd')[0].textContent, 'Not measured yet · weekly check not recorded yet');
    } finally {
      app.restore();
    }
  }
});
