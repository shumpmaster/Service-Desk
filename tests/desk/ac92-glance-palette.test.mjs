// ac-test: S-001/AC92 — G7 of "After the glance audit": a limited status palette, part (a) (specs/S-001.md, AC92 (a); round
// 2, item 1; P-001-glance2-palette.md, A: "a reached or passed mark (✓) is green (--ok) and a failed or not-reached mark
// (✕) red (--bad), on the 14–16 px mark only, never on words, rows or borders; vermilion stays what needs the owner, gold
// stays next to reach; no third colour"; with it, as proposed, "a reached mark in a run later gone back over stays grey,
// and every absence stays grey"), with Plan's "moved" edge in the light line grey, its word "moved" kept
// (P-001-glance-plan-gold.md, A; AC24's note), and the ✕ before each of Home's briefing's can't-read lines (AC91 (c), from
// G7). AC48, AC81 and AC88 are changed with it; AC88's cascade check of where --ok and --bad are drawn is in
// tests/desk/ac88-dark.test.mjs. ac-test: S-001/AC91 ac-test: S-001/AC24 ac-test: S-001/AC81
//
// Each mark is checked where AC92 (a) lists it, its colour in light and in dark, its shape and its word: green, the reached
// check on the Timeline, the page's strip, an opened phase's rows, a Home tile's drawing and Plan's Reached list (a
// "carried over" one too), a sprint's ✓, the Done lane's ✓ and a ✓ before a passing CI line; red, the not-reached cross, a
// sprint's ✕, a ✕ before a failing CI line (a sheet's "What was checked" among them) and a waiting deploy's mismatch mark;
// grey, a reached mark in a run gone back over, and every absence ("Nothing waiting", "Nothing needs you"); a kicked-back
// card's mark vermilion; gold the next to reach alone; and the nine colours' distances unchanged.
//
// The records: Service-Desk's at 77bfeae, real, as `text` holds them, and J11's at 3117150 (tv2-fixtures.mjs, J12's built
// answer, NOT as GitHub sent it); the made-up parts tests/desk/glance-fixtures.mjs builds for G7 (`ciState`'s workflow
// runs, `mismatchState`'s deploy, G7_OPENS' screens) and earlier stages (`mix`, `unread`, `gates`, Done and kicked-back
// marks), each NOT real (tests/desk/fixtures/README.md); and the made-up runs written below, NOT real records. The page is
// the sandbox's own code under the fake DOM; each colour is the cascade of the page's own stylesheets
// (tests/desk/css-cascade.mjs), and the pull request carries the Chromium captures (tests/desk/tools/glance-shots.mjs, g7-).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { memStore, waSetup, WORKED } from './wa-fixtures.mjs';
import { BAD_PR } from './fake-desk.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { hexLab, de2000 } from './ciede2000.mjs';
import { withPortfolio, addPortfolio, pfFiles } from './pf-fixtures.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { STANDARD_MILESTONES } from '../../src/lib/timeline.js';
import { milestonesByPhase } from '../../src/lib/projectpage.js';
import { G7_OPENS, mixState, twoMixState, deviceMarks, KICKED, quietState, stallState, STALL_NOW, MIX_PROJECT, SD, NOW } from './glance-fixtures.mjs';

const CSS = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(CSS, 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
/** AC81's values the palette uses (desk mockup v2, sandbox.css's v2 block), in each theme. */
const T = {
  light: { ink: '#18191c', ink2: '#5c5f66', ok: '#12733a', bad: '#b3162a', you: '#c9380c', gold: '#8a6a10', line2: '#d6d6db' },
  dark: { ink: '#ecedef', ink2: '#a2a5ac', ok: '#4cc06a', bad: '#ff6b78', you: '#ff6a3d', gold: '#c9b04f', line2: '#34363c' },
};
const THEMES = ['light', 'dark'];

/** Each drawn element's cascaded look in a theme, at 360 px: el → { colour, weight, opacity, decl(prop) }. */
function looks(app, theme) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width: 360, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) {
    if (!n.el) continue;
    out.set(n.el, { colour: plain(n.style.get('color')), weight: plain(n.style.get('font-weight')), opacity: n.opacity, decl: (p) => plain(n.declared.get(p)) });
  }
  return out;
}
const cls = (e) => ` ${(e.getAttribute ? e.getAttribute('class') : e.className) || ''} `;
const has = (e, c) => cls(e).includes(` ${c} `);
const svgs = (root, c) => findAll(root, (e) => e.tag === 'svg' && has(e, c));
const svgOf = (el) => (el.children || []).find((c) => c.tag === 'svg') || null;
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const opened = (name) => { const o = G7_OPENS.find(([n]) => n === name); assert.ok(o, name); return o[1](); };
/** The paths each mark is drawn with (sandbox.js, ST_PATHS): its shape, so colour is never the only carrier. */
const CHECK = 'M5 8.2l2 2 4-4.2';
const CROSS = 'M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8';
const pathsOf = (svg) => findAll(svg, (e) => e.tag === 'path').map((p) => p.getAttribute('d'));

async function open(setup, hash, { now = NOW, store = memStore(), polls = 1 } = {}) {
  const app = await loadSandbox({ ...setup, hash, now, store });
  await app.advance(1000);
  for (let i = 0; i < polls; i++) await app.advance(POLL_MS);
  return app;
}

// ---------------------------------------------------------------------------
// Green and red on the milestones' marks

test('AC92 (a), an opened phase (`text`, every phase opened): each reached row\'s check in --ok and each not-reached row\'s cross in --bad, in light and dark, each with its shape and its words in ink or grey; the lighter check of a run gone back over stays grey', async () => {
  const app = await opened('page, every phase opened');
  try {
    const rows = findAll(app.view, (e) => e.tag === 'li' && has(e, 'v2-sm'));
    const kind = (r) => svgOf(r).getAttribute('class').split(' ').find((c) => c.startsWith('st-'));
    const reached = rows.filter((r) => kind(r) === 'st-check');
    const crossed = rows.filter((r) => kind(r) === 'st-cross');
    const past = rows.filter((r) => kind(r) === 'st-pastcheck');
    assert.ok(reached.length >= 4 && crossed.length >= 1, `${reached.length} reached, ${crossed.length} not reached`);
    for (const r of reached) {
      assert.ok(has(svgOf(r), 'ok'), 'a reached row\'s check is a status mark');
      assert.deepEqual(pathsOf(svgOf(r)), [CHECK], 'its tick');
      assert.match(byClass(r, 'v2-sms')[0].textContent, /^(reached|carried over)/, 'and its word');
    }
    for (const r of crossed) {
      assert.ok(has(svgOf(r), 'bad'));
      assert.deepEqual(pathsOf(svgOf(r)), [CROSS], 'its cross');
      assert.match(byClass(r, 'v2-sms')[0].textContent, /^not reached/);
    }
    for (const r of past) assert.ok(!has(svgOf(r), 'ok'), 'the lighter check is no status mark');
    for (const theme of THEMES) {
      const L = looks(app, theme);
      const c = T[theme];
      for (const r of reached) {
        assert.equal(L.get(svgOf(r)).colour, c.ok, `${theme}: ${r.textContent}`);
        assert.ok([c.ink, c.ink2].includes(L.get(byClass(r, 'v2-smn')[0]).colour), `${theme}: its name stays ink or grey`);
        assert.equal(L.get(byClass(r, 'v2-sms')[0]).colour, c.ink2, `${theme}: its state words stay grey`);
      }
      for (const r of crossed) {
        assert.equal(L.get(svgOf(r)).colour, c.bad, `${theme}: ${r.textContent}`);
        assert.equal(L.get(byClass(r, 'v2-sms')[0]).colour, c.ink2);
      }
      for (const r of past) assert.deepEqual([L.get(svgOf(r)).colour, L.get(svgOf(r)).opacity], [c.ink2, 0.5], `${theme}: gone back over, the lighter grey check (notes-2 note 2)`);
    }
  } finally {
    app.restore();
  }
});

test('AC92 (a) with AC83\'s rows (made-up runs, NOT real records): a "carried over" milestone takes the reached check, so it is green (the model\'s word means reached in an earlier run and carried); a reached or carried-over one in a run later gone back over takes the lighter check, grey', () => {
  const runs = [
    { phase: 'Design', iteration: 1, state: 'gone back over', std: { 'Design-1': 'reached', 'Design-4': 'reached (carried over from Discovery i1)', 'Design-6': 'not reached' } },
    { phase: 'Design', iteration: 2, state: 'now', std: { 'Design-1': 'reached (carried over from Design i1)', 'Design-6': 'not reached' } },
  ];
  const rs = runs.map((r) => ({ phase: r.phase, iteration: r.iteration, project: [], sprints: {}, untagged: [],
    standard: STANDARD_MILESTONES.filter((m) => m[1] === r.phase).map(([id, , name]) => ({ id, name, state: r.std[id] || 'not recorded' })) }));
  const state = new Map(rs.map((r, i) => [r, runs[i].state]));
  const ctx = { project: { name: 'Made-up', model: 'v3' }, tl: {}, pv: { tracked: true, done: false }, now: rs[1], cols: { runs: rs, k: new Map(rs.map((r) => [r, r.iteration])) },
    state, standard: {}, j: { groundwork: [] }, runs: rs };
  const line = milestonesByPhase(ctx).lines.find((l) => l.phase === 'Design');
  const icons = (k) => Object.fromEntries(line.runs.find((r) => r.k === k).std.map((x) => [x.id, [x.icon, x.words]]));
  assert.deepEqual(icons(2)['Design-1'], ['check', 'carried over'], 'carried over, in the run now: the reached check (green, drawn as a status mark)');
  assert.deepEqual(icons(2)['Design-6'], ['cross', 'not reached']);
  assert.deepEqual(icons(1)['Design-1'], ['pastcheck', 'reached'], 'gone back over: the lighter check, grey');
  assert.deepEqual(icons(1)['Design-4'], ['pastcheck', 'carried over']);
  assert.deepEqual(icons(1)['Design-6'], ['cross', 'not reached'], 'a recorded failure stays red, in any run');
});

test('AC92 (a), the Timeline (J11\'s 3117150, every sprint opened): each milestone\'s reached check in --ok, its not-reached cross in --bad, the gone-back-over check grey, the gold ring "next to reach" alone; the status icons\' key drawn the same; each sprint\'s ✓ in --ok (600) and ✕ in --bad, every mark\'s word staying --ink2 and "failed checks" still said', async () => {
  const app = await opened('Timeline, every sprint opened');
  try {
    const mile = (c) => findAll(app.view, (e) => e.tag === 'svg' && has(e, c) && e.parent && has(e.parent, 'v2-msi'));
    assert.ok(mile('st-check').length >= 3 && mile('st-cross').length >= 1, 'reached and not-reached milestones on the rail');
    for (const s of mile('st-check')) assert.ok(has(s, 'ok'));
    for (const s of mile('st-cross')) assert.ok(has(s, 'bad'));
    for (const s of mile('st-pastcheck')) assert.ok(!has(s, 'ok'));
    const key = byClass(app.view, 'v2-keyl')[0];
    assert.ok(key, 'the key opened');
    const keyMark = (k) => svgs(key, `st-${k}`)[0];
    const okm = byClass(app.view, 'v2-okm');
    const smk = svgs(app.view, 'v2-smk');
    assert.ok(okm.length >= 10 && smk.length >= 1, `${okm.length} sprint ✓, ${smk.length} sprint ✕`);
    for (const m of okm) assert.equal(m.textContent, '✓', 'the ✓ alone, in its span');
    const said = (el) => (!el.tag ? el.textContent : el.attrs && el.attrs['aria-hidden'] === 'true' ? '' : el.children.map(said).join(''));
    const sp40 = findAll(app.view, (e) => e.attrs && e.attrs['data-sprint'] === 'PR #40')[0];
    const marks40 = byClass(byClass(sp40, 'v2-sph')[0], 'v2-stats')[0].children.filter((c) => c.tag).map((m) => said(m.tag === 'details' ? m.children.find((c) => c.tag === 'summary') : m).replace(/\s+/g, ' ').trim());
    assert.deepEqual(marks40, ['✓ merged', '✓ review', 'failed checks'], 'each mark keeps its word, a failed one named');
    for (const theme of THEMES) {
      const L = looks(app, theme);
      const c = T[theme];
      for (const s of mile('st-check')) assert.equal(L.get(s).colour, c.ok, `${theme}: reached`);
      for (const s of mile('st-cross')) assert.equal(L.get(s).colour, c.bad, `${theme}: not reached`);
      for (const s of mile('st-pastcheck')) assert.equal(L.get(s).colour, c.ink2, `${theme}: gone back over`);
      for (const s of mile('st-next')) assert.equal(L.get(findAll(s, (e) => e.tag === 'circle')[0]).decl('stroke'), c.gold, `${theme}: the gold ring, next to reach`);
      assert.deepEqual([L.get(keyMark('check')).colour, L.get(keyMark('cross')).colour, L.get(keyMark('pastcheck')).colour], [c.ok, c.bad, c.ink2], `${theme}: the key as the rail draws them`);
      for (const m of okm) {
        assert.deepEqual([L.get(m).colour, L.get(m).weight], [c.ok, '600'], `${theme}: a sprint's ✓`);
        assert.equal(L.get(m.parent.tag === 'summary' ? m.parent : m.parent).colour, c.ink2, `${theme}: its word stays --ink2`);
      }
      for (const s of smk) {
        assert.equal(L.get(s).colour, c.bad, `${theme}: a sprint's ✕`);
        assert.equal(L.get(s.parent).colour, c.ink2, `${theme}: its word stays --ink2`);
      }
    }
  } finally {
    app.restore();
  }
});

test('AC92 (a), the page\'s strip (`text`) and a Home tile\'s drawing (`mix`): a finished phase\'s check in --ok, the now phase\'s half circle and the planned ones grey, the phase names in ink', async () => {
  let app = await open(mixState(), `#/p/${SD.name}`);
  try {
    const cells = findAll(keyed(app, 'strip'), (e) => e.tag === 'li');
    const done = cells.filter((c) => svgs(c, 'st-check').length);
    assert.ok(done.length >= 1, 'a finished phase');
    for (const theme of THEMES) {
      const L = looks(app, theme);
      for (const c of cells) {
        const s = byClass(c, 'v2-pn')[0];
        const mark = svgOf(s);
        assert.equal(L.get(mark).colour, has(mark, 'st-check') ? T[theme].ok : has(mark, 'st-cross') ? T[theme].bad : has(mark, 'soft') ? T[theme].ink2 : T[theme].ink, `${theme}: ${c.textContent}`);
        assert.equal(L.get(byClass(s, 'v2-pnm')[0]).colour, T[theme].ink, `${theme}: its name in ink`);
      }
    }
    await app.go('#/');
    const drawn = findAll(app.view, (e) => e.tag === 'svg' && has(e, 'v2-s') && e.parent && has(e.parent, 'v2-c'));
    const checks = drawn.filter((s) => has(s, 'st-check'));
    assert.ok(checks.length >= 1, 'a tile\'s finished phase');
    assert.ok(checks.every((x) => has(x, 'ok')), 'each a status mark');
    const past = drawn.filter((x) => has(x, 'st-pastcheck'));
    assert.ok(past.length >= 1 && past.every((x) => !has(x, 'ok')), 'a run gone back over: the lighter check, no status mark');
    for (const theme of THEMES) {
      const L = looks(app, theme);
      for (const s of checks) assert.equal(L.get(s).colour, T[theme].ok, theme);
      for (const s of drawn.filter((x) => has(x, 'st-half'))) assert.equal(L.get(s).colour, T[theme].ink, `${theme}: the now phase\'s half circle in ink`);
      for (const s of past) assert.deepEqual([L.get(s).colour, L.get(s).opacity], [T[theme].ink2, 0.5], `${theme}: gone back over, grey`);
      assert.equal(L.get(checks[0]).decl('background'), theme === 'light' ? '#fbfbfb' : '#17181b', `${theme}: the mark's own ground, --card, unchanged: colour on the mark only`);
    }
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Plan: the Reached list green, the moved edge in --line2

test('AC92 (a) with AC24, rewritten for the --line2 edge (P-001-glance-plan-gold.md, A): on Plan, the moved row\'s edge is the light line grey, never gold, "moved" kept in its accessible text; the gold ring still marks the next to reach; and the Reached list\'s marks are green, each a check before its name, the words in ink', async () => {
  const app = await opened('Plan, a row moved and Reached opened');
  try {
    const moved = findAll(app.view, (e) => e.tag === 'li' && has(e, 'v2-plli') && has(e, 'moved'));
    assert.equal(moved.length, 1, 'the row moved last');
    assert.match(byClass(moved[0], 'v2-plord')[0].textContent, /, moved$/, '"moved" in its accessible text');
    const reached = findAll(app.view, (e) => e.tag === 'li' && has(e, 'reached') && e.parent && has(e.parent, 'v2-plmini'));
    assert.deepEqual(reached.map((r) => byClass(r, 'v2-plt')[0].textContent).length, 3, 'Reached · 3');
    for (const r of reached) {
      assert.equal(r.children.find((c) => c.tag), svgOf(r), 'its check first, before its name');
      assert.ok(has(svgOf(r), 'st-check') && has(svgOf(r), 'ok'));
      assert.equal(svgOf(r).attrs['aria-hidden'], 'true', 'hidden from assistive technology: the fold says "Reached"');
    }
    for (const theme of THEMES) {
      const L = looks(app, theme);
      const c = T[theme];
      assert.equal(L.get(moved[0]).decl('box-shadow'), `inset 2px 0 0 ${c.line2}`, `${theme}: the moved edge in --line2`);
      assert.doesNotMatch(L.get(moved[0]).decl('box-shadow'), new RegExp(c.gold), `${theme}: never gold`);
      for (const r of reached) {
        assert.equal(L.get(svgOf(r)).colour, c.ok, `${theme}: ${r.textContent}`);
        assert.equal(L.get(byClass(r, 'v2-plt')[0]).colour, c.ink, `${theme}: its name in ink`);
      }
      for (const s of svgs(app.view, 'st-next')) assert.equal(L.get(findAll(s, (e) => e.tag === 'circle')[0]).decl('stroke'), c.gold, `${theme}: gold, next to reach, and only that`);
    }
  } finally {
    app.restore();
  }
  // No rule left gives anything else gold but the next-to-reach ring and the phases' own run colour (AC57's runs).
  const rules = [...CSS.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }));
  assert.deepEqual(rules.filter((r) => /moved/.test(r.sel) && /--gold/.test(r.body)).map((r) => r.sel), [], 'no moved rule in gold');
});

// ---------------------------------------------------------------------------
// CI lines, a deploy's mismatch, the Done lane

test('AC92 (a), CI lines (made-up workflow runs, NOT real): Details\' line, a v2.5 page\'s CI row and a card\'s sheets — a ✓ in --ok before a line that reads passing, a ✕ in --bad before one that reads failing, hidden from assistive technology; the words unchanged and grey; no mark where it reads none', async () => {
  for (const [name, ci] of [['Details, CI passing', 'passing'], ['Details, CI failing', 'failing']]) {
    const app = await opened(name);
    try {
      const line = keyed(app, 'details-ci');
      assert.match(line.textContent, new RegExp(`^CI on main: ${ci}`), 'its words, as before');
      const mark = svgOf(line);
      assert.equal(line.children[0], mark, 'before the words');
      assert.ok(has(mark, ci === 'passing' ? 'vi-done' : 'vi-bad'), ci === 'passing' ? 'a ✓' : 'a ✕');
      assert.equal(mark.attrs['aria-hidden'], 'true');
      for (const theme of THEMES) {
        const L = looks(app, theme);
        assert.equal(L.get(mark).colour, T[theme][ci === 'passing' ? 'ok' : 'bad'], `${theme}: ${ci}`);
        assert.equal(L.get(line).colour, T[theme].ink2, `${theme}: the words stay grey`);
      }
    } finally {
      app.restore();
    }
  }
  let app = await opened('a v2.5 page, CI passing');
  try {
    const row = keyed(app, 'page-ci');
    assert.match(row.textContent, /CI on main: passing/);
    assert.ok(has(svgOf(row), 'st-check') && has(svgOf(row), 'ok'), 'the row\'s check, a status mark');
    for (const theme of THEMES) assert.equal(looks(app, theme).get(svgOf(row)).colour, T[theme].ok, theme);
  } finally {
    app.restore();
  }
  for (const name of ['a question\'s sheet, CI failing', 'a pr\'s sheet, CI failing']) {
    app = await opened(name);
    try {
      const lines = findAll(app.view, (e) => e.tag === 'p' && /CI on main's head: failing$/.test(e.textContent));
      assert.equal(lines.length, 1, `${name}: "What was checked"`);
      const mark = svgs(lines[0], 'v2-cim')[0];
      assert.ok(mark && has(mark, 'vi-bad'), 'a ✕ before its words');
      for (const theme of THEMES) assert.equal(looks(app, theme).get(mark).colour, T[theme].bad, `${name} ${theme}`);
    } finally {
      app.restore();
    }
  }
  // A project with no workflow run read: "none", and no mark.
  app = await open(mixState(), `#/p/${SD.name}`);
  try {
    await app.tap(keyed(app, 'more-detail'));
    const line = keyed(app, 'details-ci');
    assert.match(line.textContent, /^CI on main: (none|not recorded)/);
    assert.equal(svgOf(line), null, 'no mark');
  } finally {
    app.restore();
  }
});

test('AC92 (a) with AC72: a waiting deploy that doesn\'t match a passed pull request — its mismatch mark in --bad, its words in ink; the Done lane\'s ✓ in --ok, as built', async () => {
  let app = await opened('a deploy\'s mismatch');
  try {
    const safe = byClass(byClass(app.view, 'v2-sheet')[0], 'v2-safe')[0];
    assert.ok(has(safe, 'bad'));
    const line = byClass(safe, 'v2-safe-l')[0];
    assert.equal(line.textContent, "Doesn't match a reviewed pull request: don't approve");
    assert.ok(has(svgOf(line), 'vi-x'), 'its ✕, with its words (AC42)');
    for (const theme of THEMES) {
      const L = looks(app, theme);
      assert.equal(L.get(svgOf(line)).colour, T[theme].bad, `${theme}: the mismatch mark`);
      assert.equal(L.get(byClass(line, 'v2-safe-l')[0] || line.children.find((c) => c.tag === 'span')).colour, T[theme].ink, `${theme}: its words in ink`);
    }
  } finally {
    app.restore();
  }
  app = await opened('the Done lane, a confirmed row');
  try {
    const rows = byClass(app.view, 'v2-drow');
    const mark = rows.map((r) => svgs(r, 'ok')[0]).find(Boolean);
    assert.ok(mark, 'a confirmed row\'s ✓');
    for (const theme of THEMES) assert.equal(looks(app, theme).get(mark).colour, T[theme].ok, theme);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// What stays grey, and what stays vermilion

test('AC92 (a): every absence stays grey — "Nothing waiting on you"\'s tick on a page (`quiet`) and "Nothing needs you"\'s on Home (`stall`), never --ok; a kicked-back card\'s mark stays vermilion (AC69: the owner\'s and failing, vermilion wins)', async () => {
  let app = await open(quietState(), `#/p/${SD.name}`);
  try {
    const row = keyed(app, 'page-waits');
    assert.match(row.textContent, /Nothing waiting on you/);
    assert.ok(has(svgOf(row), 'st-check') && !has(svgOf(row), 'ok'), 'its tick, no status mark');
    for (const theme of THEMES) assert.equal(looks(app, theme).get(svgOf(row)).colour, T[theme].ink, `${theme}: ink`);
  } finally {
    app.restore();
  }
  app = await open(stallState(), '#/', { now: STALL_NOW });
  try {
    const b = byClass(app.view, 'v2-brief')[0];
    assert.equal(b.className, 'v2-brief k-quiet');
    const tick = svgOf(byClass(b, 'v2-bi')[0]);
    assert.ok(has(tick, 'st-check') && !has(tick, 'ok'));
    for (const theme of THEMES) assert.equal(looks(app, theme).get(tick).colour, T[theme].ink, `${theme}: "Nothing needs you" in ink`);
  } finally {
    app.restore();
  }
  app = await open(twoMixState(), '#/waiting', { store: memStore(deviceMarks(KICKED)) });
  try {
    const kick = findAll(app.view, (e) => e.dataset && e.dataset.lane === 'kick')[0];
    const icons = findAll(kick, (e) => e.tag === 'svg' && has(e, 'v2-k') && e.parent && has(e.parent, 'v2-kd'));
    assert.ok(icons.length >= 1, 'a kicked-back card\'s mark');
    for (const theme of THEMES) for (const s of icons) assert.equal(looks(app, theme).get(s).colour, T[theme].you, `${theme}: vermilion`);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The briefing's can't-read lines (AC91 (c), from G7)

test('AC91 (c), from G7: each of Home\'s briefing\'s can\'t-read lines carries the ✕ in --bad before its words, in --bad — "Can\'t read <project> since HH:MM", "Can\'t show <project>" and J23\'s "Can\'t read your portfolio" — and where the first line is itself one, its mark is that ✕, as built', async () => {
  // Under the count: Service-Desk's reads failing while the made-up project's cards wait (`unread`).
  let app = await opened('the briefing, a can\'t-read line under its count');
  try {
    const b = byClass(app.view, 'v2-brief')[0];
    assert.equal(b.className, 'v2-brief k-you');
    const lines = byClass(b, 'v2-bcant');
    assert.equal(lines.length, 1);
    assert.match(lines[0].textContent, new RegExp(`^Can't read ${SD.name} since \\d\\d:\\d\\d$`));
    assert.equal(lines[0].children[0], svgOf(lines[0]), 'the ✕ first');
    assert.ok(has(svgOf(lines[0]), 'vi-bad'));
    assert.equal(svgOf(lines[0]).attrs['aria-hidden'], 'true', 'its words say it');
    for (const theme of THEMES) {
      const L = looks(app, theme);
      assert.deepEqual([L.get(svgOf(lines[0])).colour, L.get(lines[0]).colour], [T[theme].bad, T[theme].bad], `${theme}: the ✕ and the words in --bad`);
      assert.equal(L.get(lines[0]).decl('display'), 'flex', `${theme}: the ✕ beside the words, as the due lines`);
    }
  } finally {
    app.restore();
  }
  // "Can't show <project>": the made-up project's drawing throws, beside Service-Desk's can't-read line (the first line
  // then, with nothing waiting): the first line's mark is the ✕; the second carries its own.
  {
    const s = mixState();
    s.repos[MIX_PROJECT].pulls.push(BAD_PR);
    app = await open(s, '#/');
    try {
      s.repos[SD.name].fail = { kind: 'network' };
      await app.advance(3 * POLL_MS);
      const b = byClass(app.view, 'v2-brief')[0];
      const all = [byClass(b, 'v2-bt1')[0].textContent, ...byClass(b, 'v2-bcant').map((l) => l.textContent)];
      assert.ok(all.includes(`Can't show ${MIX_PROJECT}`), JSON.stringify(all));
      assert.ok(all.some((w) => new RegExp(`^Can't read ${SD.name} since`).test(w)), JSON.stringify(all));
      assert.equal(b.className, 'v2-brief k-cant', 'nothing waits: the first line is a can\'t-read line');
      assert.ok(has(svgOf(byClass(b, 'v2-bi')[0]), 'vi-bad'), 'its mark the ✕, as built');
      for (const l of byClass(b, 'v2-bcant')) assert.ok(has(svgOf(l), 'vi-bad'), `${l.textContent}: its ✕`);
      for (const theme of THEMES) for (const l of byClass(b, 'v2-bcant')) assert.equal(looks(app, theme).get(svgOf(l)).colour, T[theme].bad, theme);
    } finally {
      app.restore();
    }
  }
  // J23's "Can't read your portfolio" (made up: the portfolio refused, NOT a real record), under the briefing's first line.
  {
    const p = waSetup({ extra: { 'intake/estimates.jsonl': WORKED() } });
    p.config = withPortfolio(p.config);
    addPortfolio(p.repos, pfFiles({})).fail = { state: 'cant-read', reason: 'no-access' };
    app = await open(p, '#/', { now: Date.parse('2026-10-22T18:00:00Z'), polls: 7 });
    try {
      const b = byClass(app.view, 'v2-brief')[0];
      const first = byClass(b, 'v2-bt1')[0].textContent;
      const under = byClass(b, 'v2-bcant');
      const pf = [first, ...under.map((l) => l.textContent)].find((w) => /^Can't read your portfolio/.test(w));
      assert.ok(pf, JSON.stringify([first, ...under.map((l) => l.textContent)]));
      if (first === pf) assert.ok(has(svgOf(byClass(b, 'v2-bi')[0]), 'vi-bad'), 'the first line: its mark the ✕');
      else assert.ok(has(svgOf(under.find((l) => l.textContent === pf)), 'vi-bad'), 'under the first: its own ✕');
      for (const l of under) assert.ok(has(svgOf(l), 'vi-bad'), `${l.textContent}: its ✕`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// No new token, no third colour, the distances unchanged

test('AC92 (a) with AC81 (unchanged): no new token and no third colour — --ok and --bad keep their values in both themes, and the nine colours\' least distance stays 13.3 in light and 12.2 in dark (CIEDE2000)', () => {
  const block = (open) => { const i = CSS.indexOf(open); assert.ok(i >= 0, open); return CSS.slice(i, CSS.indexOf('}', i)); };
  const tok = (text) => Object.fromEntries([...text.matchAll(/(--[a-z0-9-]+):\s*([^;]+?)\s*(?=;|$)/g)].map((m) => [m[1], m[2].trim()]));
  const light = tok(block('html.sb .v2, html.sb.v2-page {'));
  const dark = tok(block('html.sb[data-theme="dark"] .v2, html.sb.v2-page[data-theme="dark"] {'));
  assert.deepEqual([light['--ok'], light['--bad'], dark['--ok'], dark['--bad']], ['#12733a', '#b3162a', '#4cc06a', '#ff6b78']);
  const NINE = ['--you', '--ok', '--bad', '--gold', '--ph-disc', '--ph-des', '--ph-build', '--ph-launch', '--ink2'];
  const least = (t) => {
    let m = Infinity;
    for (let i = 0; i < NINE.length; i++) for (let j = i + 1; j < NINE.length; j++) m = Math.min(m, de2000(hexLab(t[NINE[i]]), hexLab(t[NINE[j]])));
    return Math.round(m * 10) / 10;
  };
  assert.deepEqual([least(light), least(dark)], [13.3, 12.2]);
  // The rules G7 adds name only --ok and --bad, each on a mark (its icon or its ✓), never a fill, border or row.
  const g7 = [...CSS.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }))
    .filter((r) => /var\(--(ok|bad)\)/.test(r.body) && /st-check\.ok|st-cross\.bad|v2-cim|v2-safe|v2-okm|v2-smk/.test(r.sel));
  assert.deepEqual(g7.map((r) => r.sel).sort(), ['.v2-cim.bad', '.v2-cim.ok', '.v2-s.st-check.ok', '.v2-s.st-cross.bad', '.v2-safe.bad > .v2-safe-l > .v2-k', '.v2-stats .v2-okm', '.v2-stats .v2-smk'].sort());
  for (const r of g7) assert.doesNotMatch(r.body, /(background|border|fill|box-shadow)[^;]*var\(--(ok|bad)\)/, `${r.sel}: colour on the mark only`);
});
