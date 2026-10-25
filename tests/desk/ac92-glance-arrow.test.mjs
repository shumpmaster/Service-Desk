// ac-test: S-001/AC92 — G8 of "After the glance audit": where the project is now, one small arrow, part (b) (specs/S-001.md,
// AC92 (b); round 2, item 3; P-001-glance2-arrow.md, A: "one small filled ink triangle points at the present on the
// Timeline's Now line, the project page's phase strip, each Home tile's drawing, Plan's next-to-reach row and an opened
// phase; the ▲ reading arrow is removed"). AC82, AC83, AC84 and AC86 are changed with it; the stage-8 guard's G8_ONCE is in
// tests/desk/ac88-dark.test.mjs. ac-test: S-001/AC82 ac-test: S-001/AC83 ac-test: S-001/AC84 ac-test: S-001/AC86
//
// AC92 (b)'s test: "exactly one triangle on each drawing that has a now, none where none is, each hidden from assistive
// technology, pointing as above, and no reading-arrow icon left in an opened phase". Each drawing is checked for its
// arrow's place (the element it sits in, so the run it points at), its shape and size (the cascade of the page's own
// stylesheets, tests/desk/css-cascade.mjs, in light and dark), and that it is hidden and still. G5's and G6's reviews found
// lookups keyed by a run's "<Phase>-i<n>", which two runs can share, so each drawing is also checked where the now run
// shares its key with later runs: `mix`'s made-up project's two "Build-i1" runs and `gates`' three "Launch-i1" runs, with
// the now run moved onto one of them (`nowShared`).
//
// The records: Service-Desk's at 77bfeae, real, as `text` holds them, and Personal-Org-Operating-Model in poom/'s
// placeholder form (its m1.4 sprint, real); the made-up parts tests/desk/glance-fixtures.mjs builds (`mix`, `gates`,
// `nowShared`, `sprintsState`), each NOT real (tests/desk/fixtures/README.md); and the made-up graduation ruling written
// below, NOT a real record. The page is the sandbox's own code under the fake DOM; the pull request carries the Chromium
// captures, each arrow's size and place against what it points at measured in the browser (tests/desk/tools/glance-shots.mjs,
// g8-).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { mixState, gatesState, textState, extState, nowShared, sprintsState, MIX_PROJECT, SD, POOM, NOW } from './glance-fixtures.mjs';

const CSS = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8');
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(CSS, 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1').trim();
const INK = { light: '#18191c', dark: '#ecedef' };
const RIGHT = 'polygon(0 0, 100% 50%, 0 100%)';
const DOWN = 'polygon(0 0, 100% 0, 50% 100%)';
/** Each drawing's arrow as AC92 (b) sets it: its direction, its size, and where it sits in its drawing. */
const WANT = {
  timeline: { clip: RIGHT, width: '8px', height: '10px', place: { 'margin-left': '4px', flex: 'none' } },
  strip: { clip: DOWN, width: '10px', height: '6px', place: { position: 'absolute', top: '-9px', left: '50%', 'margin-left': '-5px' } },
  tile: { clip: RIGHT, width: '6px', height: '8px', place: { position: 'absolute', top: '50%', right: 'calc(50% + 10px)', 'margin-top': '-4px' } },
  plan: { clip: RIGHT, width: '6px', height: '8px', place: { position: 'absolute', top: '14px', left: '-12px' } },
  phase: { clip: RIGHT, width: '6px', height: '8px', place: { position: 'absolute', top: '10px', left: '-19px' } },
};

const cls = (e) => ` ${(e && (e.getAttribute ? e.getAttribute('class') : e.className)) || ''} `;
const has = (e, c) => cls(e).includes(` ${c} `);
const arrows = (root) => (root ? findAll(root, (e) => has(e, 'v2-here')) : []);
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const kOf = (e) => (e && e.dataset && e.dataset.k) || '';
const up = (e, pred) => { for (let x = e; x; x = x.parent) if (pred(x)) return x; return null; };
const phaseButton = (app, ph) => findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['aria-label'] === ph)[0];

async function open(setup, hash, { now = NOW, store = memStore() } = {}) {
  const app = await loadSandbox({ ...setup, hash, now, store });
  await app.advance(1000);
  await app.advance(POLL_MS);
  return app;
}

/** The cascaded declarations of each arrow in a theme: el → (prop) → its value, var() resolved. */
function declared(app, theme) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width: 360, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) if (n.el) out.set(n.el, { decl: (p) => plain(n.declared.get(p)), pseudo: n.pseudo });
  return out;
}

/** Every arrow is hidden from assistive technology, holds no text and no character, and in each theme is the drawing's own shape, size and place in --ink, still. */
function checkShape(app, list, kind, where) {
  const w = WANT[kind];
  for (const a of list) {
    assert.equal(a.tag, 'span', `${where}: a span (a <i> in a tile's cell would be its dashed drop)`);
    assert.equal(a.attrs['aria-hidden'], 'true', `${where}: hidden from assistive technology`);
    assert.equal(a.textContent, '', `${where}: no character, so no font can change it`);
    assert.equal(a.children.length, 0, `${where}: drawn as a shape, nothing inside it`);
    assert.ok(has(a, w.clip === RIGHT ? 'r' : 'd'), `${where}: ${w.clip === RIGHT ? 'right' : 'down'}`);
  }
  for (const theme of ['light', 'dark']) {
    const D = declared(app, theme);
    for (const a of list) {
      const d = D.get(a);
      assert.equal(d.decl('clip-path'), w.clip, `${where}, ${theme}: pointing ${w.clip === RIGHT ? 'right' : 'down'}, never up`);
      assert.equal(d.decl('background'), INK[theme], `${where}, ${theme}: filled in --ink`);
      assert.equal(d.decl('display'), 'block', `${where}, ${theme}`);
      assert.deepEqual([d.decl('width'), d.decl('height')], [w.width, w.height], `${where}, ${theme}: ${w.width} × ${w.height}`);
      for (const [p, v] of Object.entries(w.place)) assert.equal(d.decl(p), v, `${where}, ${theme}: ${p}`);
      for (const p of ['animation', 'animation-name', 'transition', 'opacity', 'color']) assert.equal(d.decl(p), '', `${where}, ${theme}: no ${p}: still, and ink`);
    }
  }
}

// ---------------------------------------------------------------------------
// The stylesheet: one shape, two directions, never up; the bar and the reading arrow gone

test('AC92 (b), the shape: one filled triangle in --ink, a clip-path on an empty span, pointing right (`.r`) or down (`.d`) and never up; each drawing\'s size and place as AC92 (b) sets them; the Now line\'s 16 × 2 px bar and the opened phase\'s reading arrow gone from sandbox.css; no animation or transition', () => {
  const sheet = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (sel) => {
    const m = new RegExp(`(?:^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`).exec(sheet);
    assert.ok(m, sel);
    return m[1].trim();
  };
  assert.equal(rule('.v2-here'), 'display: block; background: var(--ink);');
  assert.equal(rule('.v2-here.r'), `clip-path: ${RIGHT};`);
  assert.equal(rule('.v2-here.d'), `clip-path: ${DOWN};`);
  // Every clip-path the arrow is given points right or down: no polygon whose tip is at its top.
  const clips = [...sheet.matchAll(/([^{}]*v2-here[^{}]*)\{([^}]*)\}/g)].flatMap((m) => [...m[2].matchAll(/clip-path:\s*([^;]+);/g)].map((x) => x[1].trim()));
  assert.deepEqual(clips.sort(), [DOWN, RIGHT].sort());
  assert.doesNotMatch(sheet, /\.v2-nowl::before/, 'the Now line\'s bar is gone: the arrow is its mark');
  assert.doesNotMatch(sheet, /\.v2-arrow\b/, 'the opened phase\'s reading arrow is gone');
  for (const m of sheet.matchAll(/([^{}]*v2-here[^{}]*)\{([^}]*)\}/g)) assert.doesNotMatch(m[2], /animation|transition/, `${m[1].trim()}: still`);
  assert.doesNotMatch(readFileSync(join(SRC, 'public', 'sandbox.js'), 'utf8'), /v2-arrow|vi\('up', 'v2-k'\)\)\];/, 'no reading-arrow icon drawn');
});

// ---------------------------------------------------------------------------
// The Timeline

test('AC92 (b), the Timeline (`text`): the Now line\'s mark is the arrow, 8 × 10 px pointing right, first in the line where its bar was, one on the Timeline, hidden; the line keeps its words ("Now · <date>"), and draws no ::before', async () => {
  const app = await open(textState(), `#/p/${SD.name}/timeline`);
  try {
    const all = arrows(app.view);
    assert.equal(all.length, 1, 'one arrow on a Timeline');
    const now = keyed(app, 'nowline');
    assert.equal(all[0].parent, now, 'on the Now line');
    assert.equal(now.children[0], all[0], 'first in the line, where its bar was');
    assert.match(now.textContent, /^Now · 14 Oct ahead above · done below$/, 'the words beside it say Now');
    checkShape(app, all, 'timeline', 'Timeline');
    for (const theme of ['light', 'dark']) {
      const before = declared(app, theme).get(now).pseudo.before;
      assert.equal(before ? plain(before.declared.get('content')) : '', '', `${theme}: no bar drawn before the line (no ::before content)`);
    }
  } finally {
    app.restore();
  }
});

test('AC92 (b), the Timeline where the now run shares its key (`nowShared`, NOT real): the arrow is on the Now line of the now run\'s own block — run 1\'s "Build-i1", not run 3\'s; run 2\'s "Launch-i1", not runs 3\'s and 4\'s — the other blocks with the key drawing none', async () => {
  for (const [at, key, n, k] of [['build', 'Build-i1', 2, 1], ['launch', 'Launch-i1', 3, 2]]) {
    const app = await open(nowShared(at), `#/p/${MIX_PROJECT}/timeline`);
    try {
      const all = arrows(app.view);
      assert.equal(all.length, 1, `${at}: one arrow`);
      const blocks = findAll(app.view, (e) => e.tag === 'section' && has(e, 'v2-tblk') && e.attrs['data-run'] === key);
      assert.equal(blocks.length, n, `${at}: ${n} runs with the key ${key}`);
      const mine = up(all[0], (e) => has(e, 'v2-tblk'));
      assert.ok(blocks.includes(mine), `${at}: in a ${key} block`);
      // Top down, the runs still to come come first (AC84): the now run's block is the last with the key.
      assert.equal(blocks.indexOf(mine), n - 1, `${at}: the now run's block, the earliest run with the key (run ${k})`);
      for (const b of blocks.filter((x) => x !== mine)) {
        assert.equal(arrows(b).length, 0, `${at}: a later ${key} block draws none`);
        assert.ok(has(b, 'plan'), `${at}: the later ${key} block is a run still to come`);
      }
      assert.ok(!has(mine, 'plan'), `${at}: the arrow's block is no run still to come`);
      checkShape(app, all, 'timeline', `${at} Timeline`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// The page's strip

test('AC92 (b), the page\'s strip: a 10 × 6 px arrow pointing down, centred 9 px above the now phase\'s bar, on the cell whose words say "now" and on no other; the v2.5 strip\'s open sprint where one alone is open; none on a Done project, with two sprints open, or none open', async () => {
  const strip = (app) => keyed(app, 'strip');
  const cells = (app) => findAll(strip(app), (e) => e.tag === 'li');
  const cases = [
    ['text', textState, SD.name, 'Design', 'run 2 · now'],
    ['mix', mixState, MIX_PROJECT, 'Design', 'run 2 · now'],
    ['nowShared build', () => nowShared('build'), MIX_PROJECT, 'Build', 'run 1 · now'],
    ['nowShared launch', () => nowShared('launch'), MIX_PROJECT, 'Launch', 'run 2 · now'],
    ['v2.5, m1.4 open', textState, POOM.name, 'm1.4', 'open'],
    // Made up, NOT a real record: a graduation ruling, so Service-Desk is Done (AC50) and no phase is now.
    ['Done', () => { const s = textState(); s.repos[SD.name].commit({ 'decisions/questions/P-001-graduation.md': 'Ruling: proceed\n(made up for G8\'s test, NOT a real record)\n' }); return s; }, SD.name, null, null],
    ['v2.5, two sprints open', () => sprintsState(2), POOM.name, null, null],
    ['v2.5, none open', () => sprintsState(0), POOM.name, null, null],
  ];
  for (const [label, state, name, phase, words] of cases) {
    const app = await open(state(), `#/p/${encodeURIComponent(name)}`);
    try {
      const all = arrows(app.view);
      if (!phase) {
        assert.equal(all.length, 0, `${label}: none where none is`);
        assert.ok(cells(app).length > 0, `${label}: the strip is drawn`);
        if (label === 'v2.5, two sprints open') assert.equal(keyed(app, 'sentence').textContent.split('. ')[0], 'Which sprint is open is unclear', 'the page says which is now is unclear');
        continue;
      }
      assert.equal(all.length, 1, `${label}: one arrow on the page, on its strip (no phase opened)`);
      const cell = all[0].parent;
      assert.ok(cells(app).includes(cell), `${label}: in a strip cell`);
      assert.equal(byClass(cell, 'v2-pnm')[0].textContent, phase, `${label}: the ${phase} cell`);
      assert.equal(byClass(cell, 'v2-ps')[0].textContent, words, `${label}: the words beside it say now`);
      assert.ok(has(cell, 'now') && has(cell, 'here'), label);
      for (const c of cells(app).filter((x) => x !== cell)) assert.ok(!has(c, 'here') && arrows(c).length === 0, `${label}: none on ${c.textContent}`);
      checkShape(app, all, 'strip', `${label} strip`);
      for (const theme of ['light', 'dark']) assert.equal(declared(app, theme).get(cell).decl('position'), 'relative', `${label}, ${theme}: the cell holds it`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// Home's tiles

test('AC92 (b), each Home tile\'s drawing: a 6 × 8 px arrow pointing right, 3 px left of the now run\'s icon, in the now run\'s own row — `mix`\'s made-up project on run 2\'s Design, never on a "Build-i1" run; `nowShared` on run 1\'s "Build-i1" (not run 3\'s) and run 2\'s "Launch-i1" (not runs 3\'s and 4\'s); a v2.5 tile on its open sprint, none with two open or none open', async () => {
  // The drawing's rows, each [its label, the cells' phases], and the cell holding the arrow.
  const tileOf = (app, name) => keyed(app, `card:${name}`);
  const placeOf = (tile) => arrows(tile).map((a) => {
    const row = up(a, (e) => has(e, 'v2-rwl'));
    const cell = a.parent;
    const i = row ? byClass(row, 'v2-rw')[0].children.indexOf(cell) : -1;
    return { row: byClass(row, 'v2-rk')[0].textContent, i, cell };
  });
  const PH = ['Discovery', 'Design', 'Build', 'Launch', 'Done'];
  const cases = [
    ['mix', mixState, [[MIX_PROJECT, 'run 2', 'Design'], [SD.name, 'run 2', 'Design'], [POOM.name, 'sprints', 0]]],
    ['gates', gatesState, [[MIX_PROJECT, 'run 2', 'Design'], [SD.name, 'run 2', 'Design']]],
    ['nowShared build', () => nowShared('build'), [[MIX_PROJECT, 'run 1', 'Build']]],
    ['nowShared launch', () => nowShared('launch'), [[MIX_PROJECT, 'run 2', 'Launch']]],
    ['v2.5, two sprints open', () => sprintsState(2), [[SD.name, 'run 2', 'Design'], [POOM.name, null, null]]],
    // G8's round 2 (from G8's review, round 1, N4): no sprint open, so no sprint is now and the v2.5 tile draws none.
    ['v2.5, none open', () => sprintsState(0), [[SD.name, 'run 2', 'Design'], [POOM.name, null, null]]],
  ];
  for (const [label, state, want] of cases) {
    const app = await open(state(), '#/');
    try {
      for (const [name, row, phase] of want) {
        const tile = tileOf(app, name);
        assert.ok(tile, `${label}: ${name}'s tile`);
        const got = placeOf(tile);
        if (!row) {
          assert.equal(got.length, 0, `${label}, ${name}: none where no sprint is now`);
          assert.ok(findAll(tile, (e) => has(e, 'v2-c')).length > 0, `${label}, ${name}: the drawing is drawn`);
          continue;
        }
        assert.equal(got.length, 1, `${label}, ${name}: exactly one`);
        assert.equal(got[0].row, row, `${label}, ${name}: in ${row}'s row`);
        if (typeof phase === 'string') assert.equal(PH[got[0].i], phase, `${label}, ${name}: on ${phase}`);
        assert.ok(has(got[0].cell, 's-now'), `${label}, ${name}: on the now run's cell`);
        assert.ok(has(got[0].cell, 'v2-c'), label);
        // The tile's words carry it: its sentence says now (the drawing's own words, AC82).
        assert.match(keyed(app, `ptl-words:${name}`).textContent, name === POOM.name ? /^Sprints: m1\.4 open$/ : /\bnow \w+ run \d\b/, `${label}, ${name}: the sentence says now (a v2.5 tile, its sprint open)`);
        // No other cell with the same phase holds one: the later runs sharing the now run's key draw none.
        for (const c of findAll(tile, (e) => has(e, 'v2-c') && e !== got[0].cell)) assert.equal(arrows(c).length, 0, `${label}, ${name}: none elsewhere`);
        checkShape(app, arrows(tile), 'tile', `${label}, ${name}'s tile`);
        assert.equal(kOf(up(got[0].cell, (e) => e.attrs && e.attrs['aria-hidden'] === 'true')), `ptl:${name}`, 'the drawing as a whole is hidden too');
      }
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// Plan

test('AC92 (b), Plan: a 6 × 8 px arrow pointing right in the page\'s margin, level with the icon of the row that is next to reach (its gold ring, "next to reach" in its words), one in each project\'s group, none on a gate card\'s row; the same rows in the ordering (⇅)', async () => {
  const groupsOf = (app) => findAll(app.view, (e) => e.tag === 'section' && has(e, 'v2-plgrp') && kOf(e).startsWith('wa-grp:'));
  const cases = [
    ['mix', mixState, { [SD.name]: 'MD3', [MIX_PROJECT]: 'MD2' }],
    ['gates', gatesState, { [SD.name]: 'MD3', [MIX_PROJECT]: 'MD2' }],
    ['nowShared build', () => nowShared('build'), { [SD.name]: 'MD3', [MIX_PROJECT]: 'M2' }],
    ['nowShared launch', () => nowShared('launch'), { [SD.name]: 'MD3', [MIX_PROJECT]: 'M3C' }],
  ];
  for (const [label, state, want] of cases) {
    const app = await open(state(), '#/work');
    try {
      const groups = groupsOf(app);
      assert.deepEqual(groups.map((g) => kOf(g).slice('wa-grp:'.length)).sort(), Object.keys(want).sort(), `${label}: a group for each project`);
      for (const g of groups) {
        const name = kOf(g).slice('wa-grp:'.length);
        const all = arrows(g);
        assert.equal(all.length, 1, `${label}, ${name}: one in its group`);
        const row = all[0].parent;
        assert.ok(row.tag === 'a' && has(row, 'v2-plrow') && has(row, 'here'), `${label}, ${name}: on a milestone's row`);
        assert.equal(up(row, (e) => e.tag === 'li').attrs['data-row'], want[name], `${label}, ${name}: on ${want[name]}`);
        assert.ok(has(findAll(row, (e) => e.tag === 'svg')[0], 'st-next'), `${label}, ${name}: beside the next-to-reach ring`);
        assert.match(row.textContent, /next to reach/, `${label}, ${name}: its words say next to reach`);
        for (const r of findAll(g, (e) => has(e, 'v2-plrow') && e !== row)) assert.equal(arrows(r).length, 0, `${label}, ${name}: none on ${r.textContent.slice(0, 40)}`);
        for (const r of findAll(g, (e) => e.tag === 'li' && has(e, 'gate'))) assert.equal(arrows(r).length, 0, `${label}, ${name}: none on a gate card's row`);
      }
      checkShape(app, arrows(app.view), 'plan', `${label} Plan`);
      // The ordering: the same rows keep it.
      await app.tap(keyed(app, 'plan-order'));
      const flat = keyed(app, 'wa-plan');
      assert.deepEqual(arrows(flat).map((a) => up(a, (e) => e.tag === 'li').attrs['data-row']).sort(), Object.values(want).sort(), `${label}: the ordering, the same rows`);
      checkShape(app, arrows(app.view), 'plan', `${label} Plan, the ordering`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// An opened phase

test('AC92 (b), an opened phase: the reading arrow pointing up is gone from every opened phase; a 6 × 8 px arrow pointing right sits on the phase\'s thin line beside the now run\'s next-to-reach row, in the now phase only — `text`\'s Design (MD3), `mix`\'s made-up Design (MD2); with the now run sharing its key, in run 1\'s "Build-i1" (M2), never run 3\'s, and run 2\'s "Launch-i1" (M3C), never runs 3\'s or 4\'s', async () => {
  const PHASES = ['Launch', 'Build', 'Design', 'Discovery'];
  const cases = [
    ['text', textState, SD.name, 'Design', 'MD3', null],
    ['mix', mixState, MIX_PROJECT, 'Design', 'MD2', null],
    ['nowShared build', () => nowShared('build'), MIX_PROJECT, 'Build', 'M2', ['Build-i1', 1, [3]]],
    ['nowShared launch', () => nowShared('launch'), MIX_PROJECT, 'Launch', 'M3C', ['Launch-i1', 2, [3, 4]]],
  ];
  for (const [label, state, name, phase, id, shared] of cases) {
    const app = await open(state(), `#/p/${encodeURIComponent(name)}`);
    try {
      for (const ph of PHASES) await app.tap(phaseButton(app, ph));
      const opened = byClass(app.view, 'v2-stdl');
      assert.equal(opened.length, 4, `${label}: every phase opened`);
      for (const o of opened) {
        assert.equal(byClass(o, 'v2-arrow').length + byClass(o, 'vi-up').length, 0, `${label}, ${o.attrs.id}: no reading-arrow icon left`);
        assert.equal(o.attrs['aria-label'].endsWith('read from the bottom up'), true, `${label}: the reading order still said, in words`);
      }
      const all = opened.flatMap((o) => arrows(o));
      assert.equal(all.length, 1, `${label}: one, in the now phase only`);
      const row = all[0].parent;
      assert.equal(up(row, (e) => has(e, 'v2-stdl')).attrs.id, `phase-${phase}`, `${label}: in ${phase}, the now phase`);
      assert.ok(row.tag === 'li' && has(row, 'v2-sm') && has(row, 'own') && has(row, 'here'), `${label}: on an own milestone's row`);
      assert.equal(row.attrs['data-ms'], id, `${label}: beside ${id}`);
      assert.ok(has(findAll(row, (e) => e.tag === 'svg')[0], 'st-next'), `${label}: its ring the next to reach`);
      assert.match(byClass(row, 'v2-sms')[0].textContent, /^next to reach/, `${label}: its words say next to reach`);
      assert.equal(row.children[row.children.length - 1], all[0], `${label}: after the row's icon and words`);
      if (shared) {
        const [key, k, later] = shared;
        const mine = keyed(app, `old:${key}:run${k}`);
        assert.ok(mine && arrows(mine).includes(all[0]), `${label}: in run ${k}'s own ${key}, an earlier run under the later ones`);
        assert.equal(keyed(app, `runh:${key}:run${k}`).textContent.endsWith('· now'), true, `${label}: run ${k}'s head says now`);
        for (const j of later) {
          assert.match(keyed(app, `runh:${key}:run${j}`).textContent, /^Run \d+ · planned$/, `${label}: run ${j} shares the key ${key}`);
          const box = keyed(app, `old:${key}:run${j}`) || null;
          if (box) assert.equal(arrows(box).length, 0, `${label}: none in run ${j}`);
        }
        // The latest run's rows, drawn outside any `.v2-oldrun`, hold none.
        const top = findAll(keyed(app, `stdl:${phase}`), (e) => has(e, 'v2-sm') && !up(e, (x) => has(x, 'v2-oldrun')));
        assert.ok(top.length > 0 || later.length > 0, label);
        for (const r of top) assert.equal(arrows(r).length, 0, `${label}: none in the latest run`);
      }
      checkShape(app, all, 'phase', `${label} opened ${phase}`);
      for (const theme of ['light', 'dark']) assert.equal(declared(app, theme).get(row).decl('position'), 'relative', `${label}, ${theme}: the row holds it`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// One on each drawing that has a now, none where none is: every fixture state's screens

test('AC92 (b), every drawing on `text`, `mix`, `gates` and `ext` (Home, each page with every phase opened, each Timeline, Plan): an arrow exactly where the drawing has a now — a tile\'s now cell, a strip\'s now cell (a v2.5 strip\'s one open sprint), Plan\'s next-to-reach row, an opened now phase\'s next-to-reach row, a Timeline\'s Now line — and none anywhere else; each hidden, with no text', async () => {
  for (const [label, state] of [['text', textState], ['mix', mixState], ['gates', gatesState], ['ext', extState]]) {
    const setup = state();
    const app = await open(setup, '#/');
    try {
      const check = (where) => {
        const all = arrows(app.view);
        for (const a of all) {
          assert.equal(a.attrs['aria-hidden'], 'true', `${label} ${where}: hidden`);
          assert.equal(a.textContent, '', `${label} ${where}: no text`);
        }
        const nowCells = findAll(app.view, (e) => has(e, 'v2-c') && has(e, 's-now'));
        const stripNow = findAll(app.view, (e) => has(e, 'v2-ph') && has(e, 'now'));
        const nextRows = findAll(app.view, (e) => has(e, 'v2-plrow') && findAll(e, (x) => x.tag === 'svg').some((s) => has(s, 'st-next')));
        const phaseNext = findAll(app.view, (e) => has(e, 'v2-sm') && findAll(e, (x) => x.tag === 'svg').some((s) => has(s, 'st-next')));
        const nowLines = findAll(app.view, (e) => e.dataset && e.dataset.k === 'nowline');
        // A v2.5 tile's or strip's open sprints: two or more, which is now is unclear, so none is pointed at.
        const sprintsOf = (c) => up(c, (x) => has(x, 'sprints'));
        const one = (list) => list.filter((c) => !sprintsOf(c) || list.filter((d) => sprintsOf(d) === sprintsOf(c)).length === 1);
        const want = new Set([...one(nowCells), ...one(stripNow), ...nextRows, ...phaseNext, ...nowLines]);
        const got = new Set(all.map((a) => a.parent));
        for (const w of want) assert.ok(got.has(w), `${label} ${where}: an arrow on ${w.className} "${w.textContent.slice(0, 40)}"`);
        for (const g of got) assert.ok(want.has(g), `${label} ${where}: an arrow on ${g.className} "${g.textContent.slice(0, 40)}", which has no now`);
        assert.equal(all.length, got.size, `${label} ${where}: one arrow each`);
      };
      check('Home');
      for (const p of setup.config.projects) {
        await app.go(`#/p/${encodeURIComponent(p.name)}`);
        for (const ph of ['Launch', 'Build', 'Design', 'Discovery']) { const b = phaseButton(app, ph); if (b) await app.tap(b); }
        check(p.name);
        await app.go(`#/p/${encodeURIComponent(p.name)}/timeline`);
        check(`${p.name}'s Timeline`);
      }
      await app.go('#/work');
      check('Plan');
    } finally {
      app.restore();
    }
  }
});
