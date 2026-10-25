// ac-test: S-001/AC92 — G9 of "After the glance audit": a soft box for the set of the most important things on a page, part
// (e) (specs/S-001.md, AC92 (e); P-001-glance2-anchor.md, A, widened by the owner: "It should be for the set of most
// important things on a page. It definitely shouldn't be overdone"; AC83, changed: "the sentence and its tally in a soft
// box, and the why line plain"). ac-test: S-001/AC83
//
// The test (AC92's last list, (e)): "a box only on the screens the table names, never inside a card, tile or sheet, never
// around an agents' gap, and no box on Waiting beside the Done lane's ground; Home's briefing with five lines; and the why
// line with no filled ground". The table, as the Design reviewer's list names it (AC92 (e); round 2's per-screen list,
// docs/design/audit-2026-10-24-round-2.md, section 2): Home, the briefing as built; a project's page, the one sentence with
// a one-line tally under it, "<R> of <T> milestones reached · <sprints>"; every other screen none. The box is the briefing's
// own look (`.v2-brief`: the --bg2 ground, its radius, padding and gap; no edge, no shadow, never vermilion). The Done
// lane's ground, the Timeline's two goal boxes and Plan's card are filled grounds the criterion names as not boxes; a text
// box, a sheet's record and the like are the sheets' own parts, inside a sheet.
//
// The records: Service-Desk's at 77bfeae, real, with Personal-Org-Operating-Model in poom/'s placeholder form; the made-up
// parts tests/desk/glance-fixtures.mjs builds (`mix`'s made-up project and its later Launch run, `gates`, `quiet`, `ext`,
// Home's five lines, the screens of G9_OPENS, a device's Done marks), each NOT real (tests/desk/fixtures/README.md); the
// sprint views of the pure cases below, made up here (NOT real). The suite has no browser, so each look is the cascade of
// the page's own stylesheets over what it drew (tests/desk/css-cascade.mjs), in light and dark; the pull request carries
// the Chromium captures at 360 × 740 and 414 × 896 (tests/desk/tools/glance-shots.mjs, g9-). AC88's cascade want-list
// and the stage-8 guard's G9_ONCE are in tests/desk/ac88-dark.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, findAll, byClass } from './sandbox-helpers.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { waSetup, memStore } from './wa-fixtures.mjs';
import { pfFiles, cardText, withPortfolio, addPortfolio } from './pf-fixtures.mjs';
import { PF_ROWS } from '../../src/public/lib/portfolio.js';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { pageTally, pageSprints, sprintsWords } from '../../src/lib/projectpage.js';
import { G9_OPENS, textState, mixState, gatesState, quietState, extState, fiveLinesState, NOW, SD, MIX_PROJECT } from './glance-fixtures.mjs';

const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1').trim();
const marks = (v) => [...String(v || '').matchAll(/⟦([^|⟧]*)\|([^⟧]*)⟧/g)].map((m) => m[1]);
/** AC81's values (desk mockup v2), in each theme. */
const T = {
  light: { ink: '#18191c', ink2: '#5c5f66', bg2: '#f7f7f8' },
  dark: { ink: '#ecedef', ink2: '#a2a5ac', bg2: '#141517' },
};
const THEMES = ['light', 'dark'];
const opened = (name) => { const o = G9_OPENS.find(([n]) => n === name); assert.ok(o, name); return o[1](); };
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const has = (n, c) => n.cls.has(c);

/** The cascaded tree of what the page drew, in a theme, at 360 px. */
function treeIn(app, theme) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  return cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width: 360, reducedMotion: false });
}
const nodeOf = (tree, el) => nodes(tree).find((n) => n.el === el);
const up = (n, pred) => { for (let x = n.parent; x; x = x.parent) if (pred(x)) return x; return null; };
const within = (n) => { const out = []; const walk = (x) => { out.push(x); x.kids.forEach(walk); }; n.kids.forEach(walk); return out; };

// ---------------------------------------------------------------------------
// The tally's words (pure)

test('AC92 (e): the tally — "<R> of <T> milestones reached · <sprints>", R and T the bold part, the sprints in (c)\'s one form; "no milestones tracked yet · <sprints>" where T sums to 0, never "0 of 0"; "sprints not available" where the Timeline isn\'t drawn; none where the phases aren\'t tracked', () => {
  const mv = (R, Tt, sprints) => ({ tracked: true, sum: { R, T: Tt }, sprints });
  assert.deepEqual(pageTally(mv(8, 16, { s: 17, m: 9, w: 8 })), { bold: '8 of 16', rest: ' milestones reached · 17 sprints · 9 merged, 8 not read' }, 'the spec\'s example');
  assert.deepEqual(pageTally(mv(0, 14, { s: 5, m: 0, w: 4 })), { bold: '0 of 14', rest: ' milestones reached · 5 sprints · 4 not read' });
  assert.deepEqual(pageTally(mv(3, 3, { s: 1, m: 1, w: 0 })), { bold: '3 of 3', rest: ' milestones reached · 1 sprint · 1 merged' }, 'one sprint');
  assert.deepEqual(pageTally(mv(1, 2, { s: 2, m: 0, w: 0 })), { bold: '1 of 2', rest: ' milestones reached · 2 sprints · none merged yet' });
  assert.deepEqual(pageTally(mv(0, 0, { s: 0, m: 0, w: 0 })), { bold: null, rest: 'no milestones tracked yet · no sprints filed yet' }, 'T of 0: never "0 of 0"');
  assert.deepEqual(pageTally(mv(2, 5, null)), { bold: '2 of 5', rest: ` milestones reached · ${sprintsWords(null)}` });
  assert.equal(sprintsWords(null), 'sprints not available');
  assert.equal(pageTally({ tracked: false, words: 'Phases not tracked' }), null, 'phases not tracked: no tally, the box holds the sentence alone');
  assert.equal(pageTally(null), null, 'a v2.5 page: no tally');
});

test('AC92 (e): the tally\'s sprints are summed over the page, each sprint once — a sprint drawn in two runs (or phases) counts once; merged and not read as the Timeline marks them; no run, none; the Timeline not drawn, not available (made-up sprint views, NOT real)', () => {
  const r1 = { phase: 'Build', iteration: 1 };
  const r2 = { phase: 'Launch', iteration: 1 };
  const merged = (id) => ({ id, marks: [{ word: 'merged', mark: '✓' }] });
  const feed = { ok: true, blocks: [
    { run: r1, key: 'Build-i1', rows: [{ sprints: [merged('PR #1'), { id: 'PR #2', missing: true }] }] },
    { run: r2, key: 'Launch-i1', plannedRows: [{ sprints: [merged('PR #1')] }], rows: [{ sprints: [{ id: 'P-003', marks: [] }], named: [merged('PR #4')] }] },
  ] };
  assert.deepEqual(pageSprints({ cols: { runs: [r1, r2] } }, feed), { s: 4, m: 2, w: 1 }, 'PR #1 in both runs, once');
  assert.deepEqual(pageSprints({ cols: { runs: [] } }, null), { s: 0, m: 0, w: 0 }, 'no run: no sprints filed yet');
  assert.equal(pageSprints({ cols: { runs: [r1] } }, null), null, 'the Timeline not drawn: not available');
  assert.equal(pageSprints({ cols: { runs: [r1] } }, { ok: false }), null);
});

test('AC92 (e) + AC92 (c): on the page, the tally agrees with the section\'s head and its phases — its R and T the head\'s sums, its sprints the phases\' sprints each once (`mix` with its made-up later Launch run, NOT real: the spec\'s example; Service-Desk at 77bfeae; the made-up project)', async () => {
  for (const [name, want] of [['a v3 page, its sentence and tally boxed', '8 of 16 milestones reached · 17 sprints · 9 merged, 8 not read'],
    ['the made-up project\'s page, its sentence and tally boxed', '0 of 14 milestones reached · 5 sprints · 4 not read']]) {
    const app = await opened(name);
    try {
      const tally = keyed(app, 'tally');
      assert.equal(tally.textContent, want, name);
      const [, R, Tt] = /^(\d+) of (\d+) /.exec(tally.textContent);
      assert.equal(keyed(app, 'ms-h').children[0].textContent, `Milestones by phase · ${R} of ${Tt} reached`, `${name}: the head's sums`);
      // Each phase's own count, summed: R and T add up; the sprints, each once, are no more than the phases' sum.
      const lines = findAll(keyed(app, 'ms-lines'), (e) => e.attrs && e.attrs['data-phase']).map((li) => byClass(li, 'v2-sdl')[0].textContent);
      const sum = lines.reduce((a, l) => { const m = /^(\d+) of (\d+) reached/.exec(l); return m ? [a[0] + Number(m[1]), a[1] + Number(m[2])] : a; }, [0, 0]);
      assert.deepEqual(sum, [Number(R), Number(Tt)], `${name}: the phases' lines sum to it`);
      const s = Number(/ · (\d+) sprints? · /.exec(tally.textContent)[1]);
      const phaseS = lines.reduce((a, l) => a + Number((/ · (\d+) sprints? · /.exec(l) || [0, 0])[1]), 0);
      assert.ok(s <= phaseS && s > 0, `${name}: ${s} sprints, each once, of the phases' ${phaseS}`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// The box: the briefing's own look

test('AC92 (e): the page\'s soft box is the briefing\'s own look, in light and dark — the --bg2 ground, 12 px radius, 12 px padding, the briefing\'s gap; no border, outline or shadow, never vermilion; the sentence in --t-lead ink, the tally --t-small --ink2 with "<R> of <T>" in 500 ink; a v2.5 page\'s and one never read hold the sentence alone; a page with nothing recorded reads "no milestones tracked yet", never "0 of 0"', async () => {
  const brief = await opened('Home, the briefing holding five lines');
  const looksOf = {};
  try {
    for (const theme of THEMES) {
      const n = nodeOf(treeIn(brief, theme), byClass(brief.view, 'v2-brief')[0]);
      looksOf[theme] = Object.fromEntries(['background', 'border-radius', 'padding', 'gap'].map((p) => [p, plain(n.declared.get(p))]));
    }
  } finally {
    brief.restore();
  }
  for (const [name, tallied] of [['a v3 page, its sentence and tally boxed', true], ['the made-up project\'s page, its sentence and tally boxed', true],
    ['a v2.5 page, its sentence alone boxed', false], ['a v3 page with nothing recorded, its tally "no milestones tracked yet"', true],
    ['a v3 page never read in this opening, its sentence alone boxed', false]]) {
    const app = await opened(name);
    try {
      const boxes = byClass(app.view, 'v2-anchor');
      assert.equal(boxes.length, 1, `${name}: one box on the page`);
      assert.deepEqual(boxes[0].children.map((c) => c.dataset.k), tallied ? ['sentence', 'tally'] : ['sentence'], name);
      if (!tallied) assert.match(boxes[0].textContent, /^(Sprint |No open sprint|Which sprint|Where it's heading: not available)/, `${name}: the sentence`);
      for (const theme of THEMES) {
        const tree = treeIn(app, theme);
        const n = nodeOf(tree, boxes[0]);
        const d = (p) => plain(n.declared.get(p));
        assert.deepEqual(Object.fromEntries(['background', 'border-radius', 'padding', 'gap'].map((p) => [p, d(p)])), looksOf[theme], `${name}, ${theme}: the briefing's own look`);
        assert.equal(d('background'), T[theme].bg2, `${name}, ${theme}: --bg2`);
        assert.deepEqual(marks(n.declared.get('background')), ['--bg2'], `${name}, ${theme}: its ground from --bg2, not --you`);
        for (const p of ['border', 'border-color', 'outline', 'box-shadow']) assert.ok(!n.declared.get(p) || /^(none|0)$/.test(d(p)), `${name}, ${theme}: no ${p}`);
        const lead = nodeOf(tree, keyed(app, 'sentence'));
        assert.deepEqual([plain(lead.style.get('font-size')), plain(lead.style.get('font-weight')), plain(lead.style.get('color'))], ['15px', '400', T[theme].ink], `${name}, ${theme}: the sentence --t-lead ink`);
        if (tallied) {
          const t = nodeOf(tree, keyed(app, 'tally'));
          assert.deepEqual([plain(t.style.get('font-size')), plain(t.style.get('font-weight')), plain(t.style.get('color'))], ['12px', '400', T[theme].ink2], `${name}, ${theme}: the tally --t-small --ink2`);
          const b = t.kids.find((x) => x.tag === 'b');
          if (/nothing recorded/.test(name)) {
            assert.equal(keyed(app, 'tally').textContent, 'no milestones tracked yet · no sprints filed yet', `${name}: never "0 of 0"`);
            assert.equal(b, undefined, `${name}: nothing bold`);
          } else {
            assert.deepEqual([plain(b.style.get('font-size')), plain(b.style.get('font-weight')), plain(b.style.get('color'))], ['12px', '500', T[theme].ink], `${name}, ${theme}: "<R> of <T>" 500 12 px ink`);
          }
        }
        // Never vermilion, green or red in it (AC92 (a) and (e)).
        for (const x of [n, ...within(n)]) for (const p of ['color', 'background', 'border-color', 'fill', 'stroke']) {
          assert.ok(!marks(x.declared.get(p)).some((m) => ['--you', '--ok', '--bad'].includes(m)), `${name}, ${theme}: ${x.tag} ${p} not --you, --ok or --bad`);
        }
      }
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// A box only on the screens the table names

/** The filled grounds (--bg2) the criterion names that are not soft boxes, and the sheets' own parts, by element. */
const NOT_BOXES = [
  ['the Done lane\'s ground', (n) => n.tag === 'section' && has(n, 'v2-lane') && has(n, 'lane-done')],
  ['a Timeline goal box', (n) => has(n, 'v2-goal')],
  ['Plan\'s card', (n) => has(n, 'v2-plcard')],
  ['a sheet\'s text box', (n) => n.tag === 'textarea' && has(n, 'v2-input')],
  ['a sheet\'s record', (n) => has(n, 'sb-record')],
  ['a sheet\'s value', (n) => has(n, 'sb-value')],
  ['a sheet\'s code', (n) => has(n, 'v2-pre')],
  ['the tap\'s line', (n) => has(n, 'v2-tap')],
  ['Plan\'s notice', (n) => has(n, 'v2-plnotice')],
  ['Plan\'s move button, off', (n) => n.tag === 'button' && has(n, 'v2-plmv')],
];
const isBox = (n) => (n.tag === 'a' && has(n, 'v2-brief')) || (n.tag === 'div' && has(n, 'v2-anchor'));
const SHEET_PART = new Set(['a sheet\'s text box', 'a sheet\'s record', 'a sheet\'s value', 'a sheet\'s code', 'the tap\'s line']);
/** Every screen's filled grounds, checked against the table and the rule; `seen` collects what was met where. */
function boxCheck(app, where, fails, seen) {
  const tree = treeIn(app, 'light');
  const screen = nodes(tree).find((n) => n.tag === 'section' && has(n, 'sb-screen'));
  const all = nodes(tree);
  const grounds = all.filter((n) => [n.declared.get('background'), n.declared.get('background-color')].some((v) => marks(v).includes('--bg2')));
  const boxes = grounds.filter(isBox);
  for (const n of grounds) {
    if (isBox(n)) continue;
    const named = NOT_BOXES.find(([, is]) => is(n));
    if (!named) { fails.push(`${where}: ${n.tag}.${[...n.cls].join('.')} on --bg2, neither a box the table names nor a ground the criterion names`); continue; }
    if (SHEET_PART.has(named[0]) && !up(n, (x) => has(x, 'v2-sheet'))) fails.push(`${where}: ${named[0]} outside a sheet`);
    seen.add(`not a box: ${named[0]}`);
  }
  for (const n of boxes) {
    const what = has(n, 'v2-brief') ? 'Home\'s briefing' : 'a project page\'s sentence and tally';
    // The table: the briefing on Home only, the sentence's box on a project's page only, each the screen's own (never in a sheet).
    const home = Boolean(screen && has(screen, 'v2-home'));
    const page = Boolean(screen && has(screen, 'v2-proj'));
    if (has(n, 'v2-brief') ? !home : !page) fails.push(`${where}: ${what} on a screen the table doesn't name for it (${screen ? [...screen.cls].join('.') : 'none'})`);
    if (up(n, (x) => has(x, 'v2-card') || has(x, 'v2-tile') || has(x, 'v2-sheet') || isBox(x) || has(x, 'v2-lane'))) fails.push(`${where}: ${what} inside a card, tile, sheet, lane or box`);
    const inside = within(n);
    if (inside.some((x) => has(x, 'gap'))) fails.push(`${where}: ${what} around an agents' gap`);
    if (inside.some((x) => ['ol', 'ul', 'li'].includes(x.tag) || has(x, 'v2-card') || has(x, 'v2-tile'))) fails.push(`${where}: ${what} around a list of rows or a card`);
    if (has(n, 'v2-anchor') && inside.filter((x) => x.parent === n).some((x) => !has(x, 'v2-lead') && !has(x, 'v2-tally'))) fails.push(`${where}: the page's box holds more than its sentence and tally`);
    seen.add(`box: ${what}`);
  }
  if (boxes.length > 1) fails.push(`${where}: ${boxes.length} boxes on one screen`);
  // Waiting holds no box, so a filled ground there means only "move cards here" (reading (c)).
  if (grounds.some((n) => has(n, 'lane-done')) && boxes.length) fails.push(`${where}: a box beside the Done lane's ground`);
  seen.add(boxes.length ? 'a screen with a box' : 'a screen with none');
  if (boxes.length) seen.add(`box on ${screen && has(screen, 'v2-home') ? 'Home' : 'a project page'}`);
}
const hrefs = (app, re) => [...new Set(findAll(app.view, (e) => e.tag === 'a' && re.test((e.attrs && e.attrs.href) || '')).map((e) => e.attrs.href))];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Every screen and sheet of a desk, as the owner reaches them (AC88's walk): Home, Waiting and its sheets, Plan and its sheets, each project's page, its sheets, Timeline, Team, members' pages, Details opened, every phase opened, and the portfolio's rows. */
async function everyScreen(app, projects, where, fails, seen, counts) {
  const visit = async (hash, then = null) => {
    await app.go('#/');
    await app.go(hash);
    if (then) await then();
    boxCheck(app, `${where} ${hash}${then ? ' (opened)' : ''}`, fails, seen);
    counts.screens++;
  };
  await visit('#/');
  await visit('#/since');
  for (const r of PF_ROWS) await visit(`#/pf/${r}`);
  await visit('#/waiting');
  for (const h of hrefs(app, /^#\/waiting\/card\//)) await visit(h);
  await visit('#/work');
  for (const h of hrefs(app, /^#\/work\/(ms|card)\//).slice(0, 4)) await visit(h);
  for (const p of projects) {
    const base = `#/p/${encodeURIComponent(p.name)}`;
    await visit(base);
    await visit(base, async () => {
      const more = keyed(app, 'more-detail');
      if (more) await app.tap(more);
      for (const b of findAll(app.view, (e) => e.tag === 'button' && e.attrs && ['Launch', 'Build', 'Design', 'Discovery'].includes(e.attrs['aria-label']))) await app.tap(b);
    });
    await visit(`#/waiting/${encodeURIComponent(p.name)}`);
    if (p.model === 'v3') for (const s of ['info', 'values', 'experiments', 'timeline', 'notes']) await visit(`${base}/${s}`);
    else await visit(`${base}/pipeline`);
    for (const s of ['asked', 'agents', 'team']) await visit(`${base}/${s}`);
    await app.go(`${base}/team`);
    for (const m of hrefs(app, new RegExp(`^${esc(base)}/team/[^/]+$`))) await visit(m);
  }
}

test('AC92 (e): a box only on the screens the table names — Home\'s briefing on Home, the sentence and tally on a project\'s page, one at most on a screen, and none on the Timeline, Plan, Waiting, a sheet, Team, a member\'s page, Details or the portfolio; never inside a card, tile, sheet or box, never around an agents\' gap or a list of rows; no box on Waiting beside the Done lane\'s ground; every other filled ground one the criterion names (`text`, `mix`, `gates`, `quiet`, `ext`, the portfolio, G9\'s screens; made-up parts NOT real)', async () => {
  const fails = [];
  const seen = new Set();
  const counts = { screens: 0 };
  for (const [where, state] of [['text', textState], ['mix', () => mixState()], ['gates', () => gatesState()], ['quiet', quietState], ['ext', extState]]) {
    const s = state();
    const app = await loadSandbox({ ...s, hash: '#/', now: NOW, store: memStore() });
    try {
      await app.advance(1000);
      await app.advance(POLL_MS);
      await everyScreen(app, s.config.projects, where, fails, seen, counts);
    } finally {
      app.restore();
    }
  }
  // The portfolio (made up, NOT real records, tests/desk/pf-fixtures.mjs): its block, its rows' sheets and Plan's ideas.
  {
    const p = waSetup({});
    p.config = withPortfolio(p.config);
    addPortfolio(p.repos, pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1) } }));
    const app = await loadSandbox({ ...p, hash: '#/', now: Date.parse('2026-10-22T18:00:00Z'), store: memStore() });
    try {
      await app.advance(1000);
      await app.advance(POLL_MS);
      await everyScreen(app, [], 'portfolio', fails, seen, counts);
    } finally {
      app.restore();
    }
  }
  for (const [where, open] of G9_OPENS) {
    const app = await open();
    try {
      boxCheck(app, `G9 ${where}`, fails, seen);
      counts.screens++;
    } finally {
      app.restore();
    }
  }
  assert.deepEqual(fails, []);
  assert.ok(counts.screens > 150, `${counts.screens} screens and sheets checked`);
  for (const want of ['box: Home\'s briefing', 'box: a project page\'s sentence and tally', 'box on Home', 'box on a project page', 'a screen with none',
    'not a box: the Done lane\'s ground', 'not a box: a Timeline goal box', 'not a box: a sheet\'s text box', 'not a box: a sheet\'s record']) {
    assert.ok(seen.has(want), `${want}: ${JSON.stringify([...seen])}`);
  }
});

test('AC92 (e): Waiting holds no box — the Done lane\'s ground, a lane holding cards on --bg2, is the only filled ground there, with the board, the strip and a card\'s sheet over it (`gates` with a device\'s made-up Done marks, NOT real)', async () => {
  const app = await opened('Waiting, the Done lane\'s ground and no box');
  try {
    assert.equal(byClass(app.view, 'v2-brief').length, 0, 'no briefing on Waiting');
    assert.equal(byClass(app.view, 'v2-anchor').length, 0, 'no soft box on Waiting');
    const lane = findAll(app.view, (e) => e.tag === 'section' && / lane-done /.test(` ${e.className} `))[0];
    assert.ok(lane, 'the Done lane drawn');
    assert.ok(byClass(lane, 'v2-drow').length + byClass(lane, 'v2-card').length > 0, 'holding the confirmed row');
    for (const theme of THEMES) {
      const tree = treeIn(app, theme);
      const grounds = nodes(tree).filter((n) => marks(n.declared.get('background')).includes('--bg2'));
      assert.deepEqual(grounds.map((n) => `${n.tag}.${[...n.cls].join('.')}`), ['section.v2-lane.lane-done'], `${theme}: the one filled ground`);
    }
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Home's briefing, a box the ruling names, holding every line

test('AC92 (e) + AC91 (a): Home\'s briefing, the box the ruling names, as built, holds five lines — its count, its parts, a time past, a time to come and what can\'t be undone, each a line of its own in the one box, and no count of lines limits it (`mix` with three made-up questions, NOT real)', async () => {
  const app = await opened('Home, the briefing holding five lines');
  try {
    const boxes = byClass(app.view, 'v2-brief');
    assert.equal(boxes.length, 1, 'one briefing');
    const b = boxes[0];
    assert.equal(b.className, 'v2-brief k-you');
    const lines = [...byClass(b, 'v2-bt1'), ...byClass(b, 'v2-bt2'), ...byClass(b, 'v2-bdue').filter((d) => !d.className.split(' ').includes('none'))];
    assert.equal(lines.length, 5, `five lines: ${lines.map((l) => l.textContent).join(' | ')}`);
    assert.match(lines[0].textContent, /^\d+ need you$/);
    assert.match(lines[1].textContent, /waiting/);
    assert.deepEqual(lines.slice(2).map((l) => l.textContent.replace(/ \d.*$|settles itself .*$/, '')), ['One question was due to settle itself', 'One question ', "One can't be undone"]);
    assert.ok(lines.every((l) => l.parent === b), 'each in the one box, none in a box of its own');
    assert.equal(byClass(app.view, 'v2-anchor').length, 0, 'no other box on Home');
    for (const theme of THEMES) {
      const n = nodeOf(treeIn(app, theme), b);
      assert.equal(plain(n.declared.get('background')), T[theme].bg2, `${theme}: on --bg2, as built`);
      for (const p of ['max-height', 'overflow', '-webkit-line-clamp']) assert.ok(!n.declared.get(p), `${theme}: no ${p} cuts its lines`);
    }
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The why line, plain

test('AC92 (e): the why line has no filled ground — on Service-Desk\'s page with every phase opened (77bfeae: no why written), each phase\'s "Why each is taken on or skipped: not written yet. …" a --t-small line in --ink2 with its eye icon, on the page\'s own ground, in light and dark; no --bg2 anywhere in an opened phase', async () => {
  const app = await opened('a v3 page, every phase opened, each why line plain');
  try {
    const lines = byClass(app.view, 'v2-callout');
    assert.equal(lines.length, 4, 'one in each opened phase');
    for (const l of lines) assert.match(l.textContent, /^Why each is taken on or skipped: not written yet\. Service-Desk's Chief of Staff writes its lines/);
    for (const theme of THEMES) {
      const tree = treeIn(app, theme);
      for (const l of lines) {
        const n = nodeOf(tree, l);
        for (const p of ['background', 'background-color', 'padding', 'border-radius', 'border', 'box-shadow']) assert.equal(n.declared.get(p), undefined, `${theme}: no ${p}`);
        assert.deepEqual([plain(n.style.get('font-size')), plain(n.style.get('font-weight')), plain(n.style.get('color'))], ['12px', '400', T[theme].ink2], `${theme}: --t-small --ink2`);
        assert.match(n.kids[0].attrs.class, /\bvi-eye\b/, `${theme}: its eye icon first`);
        const phase = up(n, (x) => has(x, 'v2-stdl'));
        assert.ok(phase, 'in an opened phase');
        for (const x of [phase, ...within(phase)]) assert.ok(!marks(x.declared.get('background')).includes('--bg2'), `${theme}: no filled ground in an opened phase (${x.tag}.${[...x.cls].join('.')})`);
      }
    }
  } finally {
    app.restore();
  }
});

// The made-up names this file relies on stay as glance-fixtures.mjs builds them.
test('AC92 (e): G9\'s screens open as named (tests/desk/glance-fixtures.mjs\'s G9_OPENS, made up, NOT real)', async () => {
  assert.deepEqual(G9_OPENS.map(([n]) => n), ['a v3 page, its sentence and tally boxed', 'the made-up project\'s page, its sentence and tally boxed', 'a v3 page, every phase opened, each why line plain',
    'a v2.5 page, its sentence alone boxed', 'a v3 page with nothing recorded, its tally "no milestones tracked yet"', 'a v3 page never read in this opening, its sentence alone boxed',
    'Home, the briefing holding five lines', 'Waiting, the Done lane\'s ground and no box']);
  assert.equal(typeof fiveLinesState, 'function');
  assert.equal(MIX_PROJECT, 'Alpha');
  assert.equal(SD.name, 'Service-Desk');
});
