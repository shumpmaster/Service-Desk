// ac-test: S-001/AC90 — a "not yet" reason said once per group (the owner's ruling, "Ruling: A — a repeated "not yet"
// reason on Plan, the Timeline, Home and Team is said once per group or phase, not on every row",
// decisions/questions/P-001-audit-repeat.md, line 1; specs/S-001.md:8001-8040). Stage 3 of "After MD3" builds its Plan,
// Timeline and Home parts (:2325); its Team part is stage 4's. Records: Service-Desk's J11 records at 3117150 and 77bfeae
// (real, `service-desk/` and `j11-77bfeae/`), the operating-model project in poom/'s placeholder form, AC52's one item of
// each kind (made up, NOT real), AC61's made-up why lines, and the estimate lines made up in wa-fixtures.mjs (NOT real).
import test from 'node:test';
import assert from 'node:assert/strict';
import { byClass, findAll, loadSandbox } from './sandbox-helpers.mjs';
import { textSetup } from './screen-text.mjs';
import { NOW } from './sandbox-fixtures.mjs';
import { openSD, ac61Answer } from './tv2-fixtures.mjs';
import { waSetup, WORKED, estLine, memStore } from './wa-fixtures.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { groupOnce, estimateOnce, finishOnce, WA } from '../../src/lib/workahead.js';
import { WHY_BACK_ONCE, nowOwnPart } from '../../src/lib/home.js';

const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const PLAN_NOW = Date.parse('2026-10-18T18:00:00Z');
const planRows = (app) => findAll(app.view, (e) => / v2-plli /.test(` ${e.className} `) && e.attrs && e.attrs['data-row'] != null);
const gaps = (r) => byClass(r, 'v2-plgap').map((g) => g.textContent);
const onceLines = (app, project = 'Service-Desk') => {
  const box = keyed(app, `wa-once:${project}`);
  return box ? byClass(box, 'v2-plgap').map((g) => g.textContent) : [];
};
async function openPlan(extra = {}) {
  const app = await loadSandbox({ ...waSetup({ extra }), hash: '#/work', now: PLAN_NOW, store: memStore() });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}

// ---------------------------------------------------------------------------
// The rule (specs/S-001.md:8011-8018)

test('AC90, the rule: a reason two or more rows share, word for word, said once with the count it covers — "<n> <rows> · <reason>" for every row, "<k> of <n> <rows> · <reason>" otherwise, in its singular; a reason one row shows stays on it; none shared, no line', () => {
  const row = (key, est, fin) => ({ key, estimate: est ? { kind: est === WA.noEstimate ? 'missing' : 'na', words: est } : { kind: 'ok' }, finish: fin ? { na: true, words: fin } : { words: '21–23 Oct' } });
  const all = groupOnce([row('a', WA.noEstimate, 'not available: A has no estimate yet'), row('b', WA.noEstimate, 'not available: A has no estimate yet')]);
  assert.deepEqual(all.lines.map((l) => l.words), ['2 milestones · no estimates yet', '2 rough finishes not available: A has no estimate yet']);
  assert.deepEqual([...all.estimate], ['a', 'b']);
  assert.deepEqual([...all.finish], ['a', 'b']);
  const some = groupOnce([row('a', null, null), row('b', WA.noEstimate, 'not available: B has no estimate yet'), row('c', WA.noEstimate, 'not available: B has no estimate yet')]);
  assert.deepEqual(some.lines.map((l) => l.words), ['2 of 3 milestones · no estimate yet', '2 rough finishes not available: B has no estimate yet'], 'its singular in the "<k> of <n>" form');
  assert.ok(!some.estimate.has('a'));
  const lone = groupOnce([row('a', null, null), row('b', WA.noEstimate, 'not available: B has no estimate yet')]);
  assert.deepEqual(lone.lines, [], 'one row\'s reason stays on that row');
  const differ = groupOnce([row('a', WA.noEstimate, null), row('b', 'past its estimate of 3–5 days, made 18 Oct; waiting on a new one', null), row('c', WA.noEstimate, null)]);
  assert.deepEqual(differ.lines.map((l) => l.words), ['2 of 3 milestones · no estimate yet']);
  assert.ok(!differ.estimate.has('b'), 'a row whose reason differs keeps its own');
  assert.deepEqual(groupOnce([row('a', null, null), row('b', null, null)]).lines, [], 'no shared reason: no head line');
  // J14's read failed (AC24's note, :9250-9253).
  assert.equal(estimateOnce(WA.estimateNA, 6, 6), '6 milestones · estimate not available');
  assert.equal(estimateOnce(WA.estimateNA, 2, 6), '2 of 6 milestones · estimate not available');
  assert.equal(finishOnce('not available: MD3 is past its estimate', 4), '4 rough finishes not available: MD3 is past its estimate');
});

// ---------------------------------------------------------------------------
// Plan (specs/S-001.md:8019-8022; AC24's note, :9240-9246; AC86's, :7678-7681)

test('AC90, Plan: with no estimate file, "6 milestones · no estimates yet" and "6 rough finishes not available: MD1 has no estimate yet" once at the group\'s head, in the agents\' grey; no row repeats either; each milestone\'s sheet still says its state in full', async () => {
  const app = await openPlan();
  try {
    assert.deepEqual(onceLines(app), ['6 milestones · no estimates yet', '6 rough finishes not available: MD1 has no estimate yet']);
    for (const g of byClass(keyed(app, 'wa-once:Service-Desk'), 'v2-plgap')) assert.match(g.className, /\bv2-small\b/, 'the small grey role (AC69)');
    const rs = planRows(app);
    assert.equal(rs.length, 6);
    for (const r of rs) assert.deepEqual(gaps(r), [], `${r.attrs['data-row']}: no repeat`);
    // Its place: under the group's head, before its rows.
    const grp = keyed(app, 'wa-grp:Service-Desk');
    const kids = grp.children.map((c) => c.className);
    assert.ok(kids.indexOf('v2-plonce') === 1 && /v2-plh/.test(kids[0]), JSON.stringify(kids));
    // A row's sheet is one row: unchanged.
    await app.go('#/work/ms/Service-Desk/MD2');
    const sheet = byClass(app.view, 'v2-sheet')[0];
    assert.equal(byClass(sheet, 'v2-plest')[0].textContent, 'Estimate: not made yet');
    assert.equal(byClass(sheet, 'v2-plfin')[0].textContent, 'not available: MD1 has no estimate yet');
    // The operating-model project (poom/'s placeholder form) has no milestones here: no head line for it.
    assert.equal(keyed(app, 'wa-once:Personal-Org-Operating-Model'), null);
  } finally {
    app.restore();
  }
});

test('AC90, Plan: estimates for some rows — "3 of 6 milestones · no estimate yet" for the rest, which drop their line; rows with an estimate show their own finish; with every estimate filed, no head line at all', async () => {
  const part = [estLine('MD1', 0, 0), estLine('MD2', 0, 0), estLine('MD3', 3, 5)].join('\n') + '\n';
  let app = await openPlan({ 'intake/estimates.jsonl': part });
  try {
    assert.deepEqual(onceLines(app), ['3 of 6 milestones · no estimate yet', '3 rough finishes not available: M3A has no estimate yet']);
    const rs = planRows(app);
    assert.deepEqual(rs.map((r) => byClass(r, 'v2-plv')[0].textContent), ['your acceptance', 'your acceptance', '21–23 Oct', '', '', ''], 'each its rough finish once there is one');
    for (const r of rs) assert.deepEqual(gaps(r), []);
  } finally {
    app.restore();
  }
  app = await openPlan({ 'intake/estimates.jsonl': WORKED() });
  try {
    assert.equal(keyed(app, 'wa-once:Service-Desk'), null, 'no shared reason: no line');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The Timeline (specs/S-001.md:8023-8025; AC59's note, :5246-5249; AC84's, :7518)

test('AC90, the Timeline: in each phase run, "Why not recorded yet for <k> of <n> milestones · for the agents to add" once under its band, in the agents\' grey; those milestones show no why line; a milestone alone with none keeps its own; a run with none shared has no line', async () => {
  const app = await openSD('#/p/Service-Desk/timeline');
  try {
    for (const [run, k, n] of [['Design-i2', 3, 3], ['Build-i1', 3, 3]]) {
      const line = keyed(app, `whyonce:${run}`);
      assert.ok(line, run);
      assert.equal(line.textContent, `Why not recorded yet for ${k} of ${n} milestones · for the agents to add`);
      assert.match(line.className, /\bgap\b/, 'the agents\' grey (AC69), and who fills it');
      const blk = findAll(app.view, (e) => e.attrs && e.attrs['data-run'] === run)[0];
      assert.equal(blk.children.indexOf(line), 1, 'under its band');
      for (const m of findAll(blk, (e) => e.attrs && e.attrs['data-ms'] != null && / v2-ms /.test(` ${e.className} `))) {
        assert.doesNotMatch(m.textContent, /Why not recorded/, `${m.attrs['data-ms']}: no why line of its own`);
      }
    }
    const launch = findAll(app.view, (e) => e.attrs && e.attrs['data-ms'] === 'M3C')[0];
    assert.match(launch.textContent, /Why not recorded yet · for the agents to add/, 'alone in its run: its own line');
    const launchBlk = findAll(app.view, (e) => e.attrs && e.attrs['data-run'] && findAll(e, (x) => x === launch).length)[0];
    assert.equal(byClass(launchBlk, 'v2-tonce').length, 0, 'no line where nothing is shared');
  } finally {
    app.restore();
  }
  // A run where one milestone has its why (AC61's made-up lines): the others' line counts only them; its own Why stays.
  const w = await openSD('#/p/Service-Desk/timeline', { repoOpts: { ac61: true, answer: ac61Answer() } });
  try {
    const m2b = keyed(w, 'mile:Build-i1:M2B');
    assert.match(m2b.textContent, /Why "It's important for me to see timelines/, 'a row with its own why keeps it');
    // Build run 1 holds M1, M2, M2B and the standard Build-4 here; M2B and Build-4 have their why, so "2 of 4".
    assert.equal(keyed(w, 'whyonce:Build-i1').textContent, 'Why not recorded yet for 2 of 4 milestones · for the agents to add');
    assert.doesNotMatch(keyed(w, 'mile:Build-i1:M2').textContent, /Why/, 'M2, covered by the line');
  } finally {
    w.restore();
  }
});

// ---------------------------------------------------------------------------
// Home (specs/S-001.md:8026-8028; AC82's note, :7282-7285)

test('AC90, Home: in a group of tiles, "<k> projects · why their run went back: not recorded" once at its head; those tiles\' Now lines keep only their own part; a group with none shared has no line', async () => {
  const app = await loadSandbox({ ...textSetup(), hash: '#/', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const line = keyed(app, 'hgonce:active');
    assert.equal(line.textContent, '2 projects · why their run went back: not recorded');
    assert.match(line.className, /\bgap\b/, 'the agents\' grey (AC69)');
    const nowOf = (name) => byClass(keyed(app, `card:${name}`), 'v2-ln').map((l) => l.textContent).find((t) => /^Now:/.test(t));
    assert.equal(nowOf('Service-Desk'), 'Now: Design, run 2');
    assert.equal(nowOf('Alpha'), 'Now: Design, run 2');
    assert.ok(!/why it went back/.test(keyed(app, 'tiles:active').textContent), 'no tile repeats it');
    assert.equal(keyed(app, 'hgonce:closed'), null, 'a group of one (the v2.5 project): no line');
  } finally {
    app.restore();
  }
  // The words for some of a group's tiles, and a tile keeping its own "went back on <date>".
  assert.equal(WHY_BACK_ONCE(2, 2), '2 projects · why their run went back: not recorded');
  assert.equal(WHY_BACK_ONCE(2, 3), '2 of 3 projects · why their run went back: not recorded');
  assert.deepEqual(nowOwnPart({ lead: 'Now: Design, run 2', rest: 'went back on 8 Oct, why not recorded', missing: true }).rest, 'went back on 8 Oct');
  assert.equal(nowOwnPart({ lead: 'Now: Design, run 2', rest: 'why it went back: not recorded', missing: true }).rest, null);
  const quoted = { lead: 'Now: Design, run 2', rest: '“the owner asked for it”' };
  assert.equal(nowOwnPart(quoted), quoted, 'a recorded why is never dropped');
});
