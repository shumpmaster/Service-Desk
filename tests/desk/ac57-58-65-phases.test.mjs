// AC57 (the Status screen's phases, read from the bottom up, in boxes with the branch drawing),
// AC58 and AC65 (the Home tile's phases, drawn the same way, compact), trial-view notes 2, notes 1,
// 2, 6, 10 to 13, 15, 16, 19, 20, 25 and 28 (2026-10-16), from J11's fixture (Service-Desk at
// 3117150), AC61's made-up records and made-up projects (NOT real records).
// ac-test: S-001/AC57 ac-test: S-001/AC58 ac-test: S-001/AC65
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SRC, fixture } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { traceNotes, El0 } from './sandbox-helpers.mjs';
import { v3, v25, fullRepo, extremes, opened } from './sandbox-fixtures.mjs';
import { models, openSD, keyed, svgKids, railLayout, ac61Answer, byClass, findAll, SD3 } from './tv2-fixtures.mjs';
import { runsContext, statusPhases, tilePhases, branchShape, STATUS_KEY } from '../../src/lib/feed.js';
import { phaseView, standardWord } from '../../src/lib/sandbox.js';

const css = () => readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
const rule = (sel) => {
  const m = new RegExp(`(?:^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`).exec(css().replace(/\/\*[\s\S]*?\*\//g, ''));
  assert.ok(m, `a rule for ${sel}`);
  return m[1];
};
const boxOf = (sv, phase) => sv.boxes.find((b) => b.phase === phase);
const msOf = (run, code) => [...run.milestones, ...run.standard, ...run.gathered].find((m) => m.code === code);

/** A made-up timeline (NOT a real record): runs in the model's order, each with its project milestones, filed or not. */
function madeUp(spec) {
  const runs = spec.map(([phase, iteration, own = []], i) => ({ phase, iteration, item: null, first: null, routed: [[i * 10, { action: 'dispatch' }]], decisions: [], untagged: [], standard: [],
    project: own.map(([id, filed], i) => ({ id, name: `Made-up milestone ${id}`, lineno: 100 + i, done: 'it is done', dropped: false, why: null, sprints: [] })),
    sprints: Object.fromEntries(own.map(([id, filed]) => [id, filed ? ['PR #1'] : []])), label() { return `${phase} i${iteration}`; } }));
  const tl = { runs: () => runs, first: null, graduated: false, byItem: new Map(), merged: () => false };
  const pv = phaseView(SD3, tl, new Map(), { ready: true });
  return runsContext(SD3, { tree: new Map(), records: new Map() }, { projectDoc: { standard: {} } }, tl, pv);
}

// ---------------------------------------------------------------------------
// AC57: the view model

test('AC57: from the top Done, Launch, Build, Design, Discovery; each box\'s runs latest first; each run\'s milestones the last at the top, the standard ones at the bottom', () => {
  const { ctx } = models();
  const sv = statusPhases(ctx, 'UTC');
  assert.deepEqual(sv.boxes.map((b) => b.phase), ['Done', 'Launch', 'Build', 'Design', 'Discovery']);
  assert.deepEqual(boxOf(sv, 'Design').runs.map((r) => r.head), ['Design i2 · now', 'Design i1 · finished, then gone back over']);
  assert.deepEqual(boxOf(sv, 'Build').runs.map((r) => r.head), ['Build i2 · still to come', 'Build i1 · finished, then gone back over']);
  const d2 = boxOf(sv, 'Design').runs[0];
  assert.deepEqual([...d2.milestones, ...d2.standard].map((m) => m.code), ['MD3', 'MD2', 'MD1', 'Design-6', 'Design-5', 'Design-4', 'Design-3', 'Design-2', 'Design-1']);
  assert.deepEqual(boxOf(sv, 'Discovery').runs[0].standard.map((m) => m.code), ['Discovery-8', 'Discovery-7', 'Discovery-6', 'Discovery-5', 'Discovery-4', 'Discovery-3', 'Discovery-2', 'Discovery-1']);
  // Run tags name the run (the column), never the phase's iteration.
  assert.deepEqual(boxOf(sv, 'Build').runs.map((r) => r.tag), ['Run 2', 'Run 1']);
});

test('AC57: the runs — run 1 is Discovery i1, Design i1 and Build i1; run 2 is Design i2, Build i2, Launch i1 and a still-to-come Done', () => {
  const { ctx } = models();
  const shape = branchShape(ctx);
  assert.equal(shape.cols, 2);
  const col = (k) => shape.dots.filter((d) => d.k === k).map((d) => `${d.phase}${d.run ? ` i${d.run.iteration}` : ''}`);
  assert.deepEqual(col(1), ['Discovery i1', 'Design i1', 'Build i1']);
  assert.deepEqual(col(2), ['Design i2', 'Build i2', 'Launch i1', 'Done']);
});

test('AC57: each dot\'s mark and words — Discovery i1 filled, "finished"; Design i1 and Build i1 the lighter fill, "finished, then gone back over"; Design i2 the gold ring, "now"; Build i2, Launch i1 and Done empty rings, "still to come"', () => {
  const { ctx } = models();
  const shape = branchShape(ctx);
  const mark = (phase, k) => shape.dots.find((d) => d.phase === phase && d.k === k).mark;
  assert.deepEqual([mark('Discovery', 1), mark('Design', 1), mark('Build', 1), mark('Design', 2), mark('Build', 2), mark('Launch', 2), mark('Done', 2)],
    ['filled', 'light', 'light', 'gold', 'todo', 'todo', 'todo']);
  const sv = statusPhases(ctx, 'UTC');
  assert.equal(boxOf(sv, 'Discovery').runs[0].head, 'Discovery i1 · finished');
  assert.equal(boxOf(sv, 'Design').runs[1].head, 'Design i1 · finished, then gone back over');
  assert.equal(boxOf(sv, 'Launch').runs[0].head, 'Launch i1 · still to come');
});

test('AC57 (note 1): each header\'s state word, and no header reads "Finished" for Build', () => {
  const { ctx } = models();
  const sv = statusPhases(ctx, 'UTC');
  assert.deepEqual(sv.boxes.map((b) => [b.phase, b.word]), [['Done', 'After the Launch gate'], ['Launch', 'Not started'], ['Build', 'Run 2 still to come'],
    ['Design', 'Now · run 2'], ['Discovery', 'Finished']]);
  assert.equal(boxOf(sv, 'Design').now, true, 'the now phase is marked where it sits');
  assert.deepEqual(sv.boxes.map((b) => Boolean(b.startFolded)), [false, false, false, false, true], 'Discovery, every run finished and standing, starts folded');
});

test('AC57: every standard milestone\'s state against the fixture\'s NOTE lines; the "not recorded" ones gathered in Design i1 and Build i1, but not in Design i2', () => {
  const { ctx } = models();
  const sv = statusPhases(ctx, 'UTC');
  const expected = new Map();
  let run = null;
  for (const l of traceNotes()) {
    if (/^[A-Z][a-z]+ i\d+/.test(l)) run = l.split(' (')[0];
    const m = /^ {2}([A-Za-z]+-\d) "[^"]+": (.+)$/.exec(l);
    if (m) expected.set(`${run}/${m[1]}`, standardWord(m[2]));
  }
  let n = 0;
  for (const b of sv.boxes) {
    for (const r of b.runs) {
      for (const s of [...r.standard, ...r.gathered]) {
        const want = expected.get(`${r.head.split(' · ')[0]}/${s.code}`);
        const shown = r.state === 'still to come' && want === 'not recorded' ? 'Still to come' : want[0].toUpperCase() + want.slice(1);
        assert.equal(s.words, shown, `${r.head} ${s.code}`);
        n++;
      }
    }
  }
  assert.equal(n, 35);
  assert.equal(boxOf(sv, 'Design').runs[1].gatherWords, '4 not recorded, one tap away');
  assert.deepEqual(boxOf(sv, 'Design').runs[1].gathered.map((s) => s.code), ['Design-5', 'Design-4', 'Design-3', 'Design-2']);
  assert.equal(boxOf(sv, 'Build').runs[1].gatherWords, '5 not recorded, one tap away');
  assert.equal(boxOf(sv, 'Design').runs[0].gatherWords, null, 'in the latest run every one is listed');
  assert.equal(boxOf(sv, 'Discovery').runs[0].stdLine, 'Standard milestones · 4 reached · 4 not recorded');
});

test('AC57: each milestone\'s mark by the ordered rules — MD2 alone the gold ring, MD1 the half-filled circle, M1, M2 and M2B the lighter fill, Build i2\'s and Launch i1\'s empty rings, Design-6 in Design i1 filled red; softened text for rules 1 and 9', () => {
  const { ctx } = models();
  const sv = statusPhases(ctx, 'UTC');
  const all = sv.boxes.flatMap((b) => b.runs.flatMap((r) => [...r.milestones, ...r.standard, ...r.gathered].map((m) => ({ ...m, run: r.head }))));
  assert.deepEqual(all.filter((m) => m.mark === 'gold').map((m) => m.code), ['MD2'], 'the gold ring on one milestone only');
  const [d2, d1] = boxOf(sv, 'Design').runs;
  assert.equal(msOf(d2, 'MD2').words, 'No work filed yet · next to reach');
  assert.equal(msOf(d2, 'MD1').mark, 'half');
  assert.equal(msOf(d2, 'MD1').words, 'Work filed: Q-013');
  assert.equal(msOf(d2, 'MD3').mark, 'empty');
  const b1 = boxOf(sv, 'Build').runs[1];
  for (const [c, w] of [['M1', 'Work filed: PR #40, #41'], ['M2', 'Work filed: PR #44'], ['M2B', 'Work filed: PR #44, #52']]) {
    assert.equal(msOf(b1, c).mark, 'light', c);
    assert.equal(msOf(b1, c).words, w, c);
  }
  const b2 = boxOf(sv, 'Build').runs[0];
  const l1 = boxOf(sv, 'Launch').runs[0];
  for (const m of [...b2.milestones, ...b2.standard, ...l1.milestones, ...l1.standard]) {
    assert.equal(m.mark, 'empty', `${m.code}: an empty ring in a run still to come`);
    assert.equal(m.words, /^M/.test(m.code) ? 'No work filed yet' : 'Still to come', m.code);
  }
  assert.equal(msOf(d1, 'Design-6').mark, 'red');
  assert.equal(msOf(d1, 'Design-6').words, 'Not reached');
  assert.equal(msOf(d1, 'Design-1').mark, 'light', 'reached in a run gone back over');
  assert.equal(msOf(boxOf(sv, 'Discovery').runs[0], 'Discovery-2').mark, 'filled');
  for (const m of all) assert.equal(m.soft, m.mark === 'dashed', `${m.run} ${m.code}: softened only for rules 1 and 9`);
  for (const m of all.filter((x) => /^M/.test(x.code))) assert.doesNotMatch(m.words, /reached/i, 'a project milestone never reads "reached"');
});

test('AC57 (plan review round 2, B2): the key names the gold ring "now: holds the next milestone to reach" and "next to reach", never "now" alone', () => {
  const words = [...STATUS_KEY.runs, ...STATUS_KEY.milestones].map(([, w]) => w);
  assert.deepEqual(STATUS_KEY.runs.map(([, w]) => w), ['finished', 'finished, then gone back over', 'now: holds the next milestone to reach', 'still to come']);
  assert.deepEqual(STATUS_KEY.milestones.map(([, w]) => w), ['reached', 'work under way', 'next to reach', 'no work filed yet', 'not reached', 'not taken on, or not recorded']);
  for (const [m, w] of [...STATUS_KEY.runs, ...STATUS_KEY.milestones]) if (m === 'gold') assert.ok(w === 'next to reach' || w === 'now: holds the next milestone to reach', w);
  assert.ok(!words.includes('now'));
});

test('AC57 (B1): with AC61\'s fixture, where a pull request\'s body says "Milestone: MD3" and no plan line lists it, MD3 still reads "No work filed yet" with an empty ring; the now run and MD2\'s gold ring are unchanged', () => {
  const { ctx, pv } = models({ ac61: true, answer: ac61Answer() });
  assert.equal(pv.nowRun.label(), 'Design i2');
  const d2 = boxOf(statusPhases(ctx, 'UTC'), 'Design').runs[0];
  assert.equal(msOf(d2, 'MD3').words, 'No work filed yet');
  assert.equal(msOf(d2, 'MD3').mark, 'empty');
  assert.equal(msOf(d2, 'MD2').mark, 'gold');
});

test('AC57 (N5): a made-up project whose every project milestone has work filed (NOT a real record): its now run\'s dot is the half-filled circle, "now: work under way", and no gold ring shows', () => {
  const ctx = madeUp([['Discovery', 1], ['Design', 1, [['M1', true]]], ['Build', 1, [['M2', true]]]]);
  assert.equal(ctx.rule, 'latest');
  const shape = branchShape(ctx);
  assert.equal(shape.dots.find((d) => d.run === ctx.now).mark, 'half');
  assert.ok(!shape.dots.some((d) => d.mark === 'gold'));
  const sv = statusPhases(ctx, 'UTC');
  assert.ok(!sv.boxes.some((b) => b.runs.some((r) => r.milestones.some((m) => m.mark === 'gold'))), 'no milestone is next to reach');
});

test('AC57: a made-up project of three runs (NOT a real record) — Discovery i1, Design i1, Build i1, Design i2, Build i2, Launch i1, Build i3 (now) and Launch i2 — gives three columns, run 3 branching right at Build', () => {
  const ctx = madeUp([['Discovery', 1], ['Design', 1], ['Build', 1, [['M1', true]]], ['Design', 2], ['Build', 2, [['M2', true]]], ['Launch', 1],
    ['Build', 3, [['M3', false]]], ['Launch', 2]]);
  const shape = branchShape(ctx);
  assert.equal(shape.cols, 3);
  assert.deepEqual(shape.dots.filter((d) => d.k === 3).map((d) => d.phase), ['Build', 'Launch', 'Done']);
  assert.deepEqual(shape.curves, [{ fromK: 1, fromRow: 2, toK: 2, toRow: 1 }, { fromK: 2, fromRow: 3, toK: 3, toRow: 2 }]);
  assert.equal(shape.dots.find((d) => d.k === 3 && d.phase === 'Build').mark, 'gold');
  const sv = statusPhases(ctx, 'UTC');
  assert.equal(boxOf(sv, 'Launch').word, 'Run 3 still to come');
  assert.equal(boxOf(sv, 'Build').word, 'Now · run 3');
});

test('AC57 + AC61: "why: not recorded" on every milestone with J11\'s fixture; each fixture why line, word for word, with AC61\'s', () => {
  const plain = statusPhases(models().ctx, 'UTC');
  for (const b of plain.boxes) for (const r of b.runs) for (const m of [...r.milestones, ...r.standard, ...r.gathered]) assert.equal(m.why.text, 'why: not recorded', `${r.head} ${m.code}`);
  const sv = statusPhases(models({ ac61: true, answer: ac61Answer() }).ctx, 'UTC');
  const b1 = boxOf(sv, 'Build').runs[1];
  assert.equal(msOf(b1, 'M2B').why.text, 'why: "It\'s important for me to see timelines and context windows to be able to drive things."');
  assert.equal(msOf(boxOf(sv, 'Design').runs[0], 'MD1').why.text, 'why: the desk\'s look rests on published design guidance, not on taste');
  assert.equal(msOf(b1, 'Build-4').why.text, 'why: the desk runs no experiments; each change is checked by its own tests', 'a skipped standard milestone\'s why, in every run of its phase');
  assert.equal(msOf(boxOf(sv, 'Build').runs[0], 'Build-4').why.text, 'why: the desk runs no experiments; each change is checked by its own tests');
  assert.equal(msOf(boxOf(sv, 'Build').runs[0], 'Build-4').words, 'Skipped');
  assert.equal(msOf(boxOf(sv, 'Discovery').runs[0], 'Discovery-1').why.text, 'why: the owner brought the idea to the desk\'s first conversation');
  assert.equal(msOf(boxOf(sv, 'Discovery').runs[0], 'Discovery-2').words, 'Reached · planned as skipped', 'the model\'s word kept, with "planned as skipped"');
  assert.equal(msOf(boxOf(sv, 'Design').runs[0], 'Design-3').why.text, 'why: not recorded', 'a line out of form gives no why');
});

// ---------------------------------------------------------------------------
// AC57: the page

const DESIGN_ROW = { Done: 40, Launch: 140, Build: 300, Design: 560, Discovery: 820 };

test('AC57: on the page — the boxes from the top, their stripes and names in words, the now box\'s gold border, the key, and each run\'s line', async () => {
  const app = await openSD('#/p/Service-Desk');
  try {
    const boxes = byClass(app.view, 'sb-pbox');
    assert.deepEqual(boxes.map((b) => b.attrs['data-phase']), ['Done', 'Launch', 'Build', 'Design', 'Discovery']);
    for (const [b, cls] of boxes.map((x, i) => [x, ['ph-done', 'ph-launch', 'ph-build', 'ph-des', 'ph-disc'][i]])) assert.ok(b.className.split(' ').includes(cls), `${b.attrs['data-phase']}: ${cls}`);
    assert.ok(boxes[3].className.split(' ').includes('now'));
    assert.ok(boxes[0].className.split(' ').includes('end'), 'Done\'s box: dashed, no stripe');
    // The stripe is the phase's colour token (AC48's phase colours), and Done has none.
    assert.match(rule('.sb-pbox'), /box-shadow: inset 3px 0 0 var\(--ph\);/);
    assert.match(rule('.sb-pbox.end'), /border-style: dashed; box-shadow: none;/);
    for (const [cls, tok] of [['ph-disc', '--ph-disc'], ['ph-des', '--ph-des'], ['ph-build', '--ph-build'], ['ph-launch', '--ph-launch']]) assert.match(css(), new RegExp(`\\.${cls} \\{ --ph: var\\(${tok}\\); \\}`));
    assert.match(rule('.sb-pbox.now'), /border-color: var\(--gold\);/);
    assert.match(app.text(), /Runsfinishedfinished, then gone back overnow: holds the next milestone to reachstill to come/);
    assert.match(app.text(), /Run 2 · Design i2 · now/);
    assert.match(app.text(), /Done\s*After the Launch gate/);
    assert.doesNotMatch(app.text(), /of 4 phases finished/);
  } finally {
    app.restore();
  }
});

test('AC57 (note 25): folding — Discovery starts folded and the rest open; a tap, Enter and Space each fold and open a box, with its accessible state and its mark; no other box moves', async () => {
  const app = await openSD('#/p/Service-Desk');
  try {
    const btn = (ph) => findAll(keyed(app, `pbox:${ph}`), (e) => e.tag === 'button' && e.attrs['data-pname'] === ph)[0];
    const runs = (ph) => byClass(keyed(app, `pbox:${ph}`), 'sb-prun').length;
    assert.equal(btn('Discovery').attrs['aria-expanded'], 'false');
    assert.equal(runs('Discovery'), 0, 'folded to its one header line');
    for (const ph of ['Launch', 'Build', 'Design']) assert.equal(btn(ph).attrs['aria-expanded'], 'true', ph);
    assert.equal(byClass(keyed(app, 'pbox:Done'), 'sb-fold').length + findAll(keyed(app, 'pbox:Done'), (e) => e.tag === 'button').length, 0, 'Done has nothing to fold');
    const order = () => byClass(app.view, 'sb-pbox').map((b) => b.attrs['data-phase']).join(',');
    const before = order();
    const b = btn('Design');
    assert.equal(b.textContent.replace(/[▾▸]/g, ''), 'Design', 'its accessible name is the phase\'s name');
    assert.match(b.textContent, /▾/, 'open: its mark');
    await app.tap(b);
    assert.equal(btn('Design').attrs['aria-expanded'], 'false');
    assert.match(btn('Design').textContent, /▸/, 'folded: its mark');
    assert.equal(runs('Design'), 0);
    btn('Design').dispatch('keydown', { key: 'Enter' });
    await app.flush();
    assert.equal(btn('Design').attrs['aria-expanded'], 'true');
    btn('Design').dispatch('keydown', { key: ' ' });
    await app.flush();
    assert.equal(btn('Design').attrs['aria-expanded'], 'false');
    btn('Discovery').dispatch('keydown', { key: ' ' });
    await app.flush();
    assert.equal(btn('Discovery').attrs['aria-expanded'], 'true');
    assert.equal(runs('Discovery'), 1);
    assert.equal(order(), before, 'no other box moves in order');
  } finally {
    app.restore();
  }
});

test('AC57: the drawing\'s shapes — every straight piece vertical, one curve from Build i1\'s dot to Design i2\'s, dashed pieces only into still-to-come dots, every arrowhead pointing up; each dot\'s centre level with its phase name\'s row, and again after a box folds', async () => {
  const app = await openSD('#/p/Service-Desk');
  const undo = railLayout(DESIGN_ROW);
  try {
    const box = keyed(app, 'pboxes');
    app.module.fitRail(box);
    const svg = byClass(box, 'sb-rail')[0];
    const kids = svgKids(svg);
    const lines = kids.filter((e) => e.attrs['data-kind'] === 'line');
    const curves = kids.filter((e) => e.attrs['data-kind'] === 'curve');
    const arrows = kids.filter((e) => e.attrs['data-kind'] === 'arrow');
    const dots = kids.filter((e) => e.attrs['data-kind'] === 'dot');
    for (const l of lines) assert.equal(l.attrs.x1, l.attrs.x2, 'vertical');
    assert.equal(curves.length, 1, 'one curve');
    assert.deepEqual([curves[0].attrs['data-from'], curves[0].attrs['data-to']], ['1', '2']);
    const dot = (ph, k) => dots.find((d) => d.attrs['data-phase'] === ph && d.attrs['data-col'] === String(k));
    assert.ok(curves[0].attrs.d.startsWith(`M${dot('Build', 1).attrs.cx} ${dot('Build', 1).attrs.cy}C`), 'it starts at Build i1\'s dot');
    assert.ok(curves[0].attrs.d.endsWith(` ${dot('Design', 2).attrs.cx} ${dot('Design', 2).attrs.cy}`), 'and ends at Design i2\'s');
    for (const l of lines) {
      const into = dots.find((d) => d.attrs.cx === l.attrs.x1 && d.attrs.cy === l.attrs.y2);
      assert.equal(l.attrs['data-dashed'] === '1', into.attrs['data-mark'] === 'todo', 'dashed only into a still-to-come dot');
      assert.ok(Number(l.attrs.y2) < Number(l.attrs.y1), 'each line runs up to the next dot');
    }
    assert.equal(arrows.length, lines.length, 'an arrowhead half way along each line');
    for (const a of arrows) assert.equal(a.attrs['data-dir'], 'up');
    for (const d of dots) assert.ok(Math.abs(Number(d.attrs.cy) - DESIGN_ROW[d.attrs['data-phase']]) <= 1, `${d.attrs['data-phase']}: level with its name`);
    assert.equal(dots.length, 7);
    // Fold Build: the names move, and the drawing follows them.
    const moved = { ...DESIGN_ROW, Design: 380, Discovery: 640 };
    undo();
    const undo2 = railLayout(moved);
    try {
      await app.tap(findAll(keyed(app, 'pbox:Build'), (e) => e.tag === 'button' && e.attrs['data-pname'] === 'Build')[0]);
      app.module.fitRail(keyed(app, 'pboxes'));
      for (const d of svgKids(byClass(keyed(app, 'pboxes'), 'sb-rail')[0]).filter((e) => e.attrs['data-kind'] === 'dot')) {
        assert.ok(Math.abs(Number(d.attrs.cy) - moved[d.attrs['data-phase']]) <= 1, `after a fold, ${d.attrs['data-phase']}: level with its name`);
      }
    } finally {
      undo2();
    }
  } finally {
    undo();
    app.restore();
  }
});

test('AC57: the lines\' width and opacity (1.25 px at 70%), and the tie line (1 px in the --tie grey, an arrowhead at its top), as version 6 draws them', () => {
  assert.match(rule('.sb-rail .ln, .sb-rail .arr'), /stroke-width: 1\.25px; stroke-opacity: \.7;/);
  assert.match(rule('.sb-mslist::before'), /width: 1px; background: var\(--tie\);/);
  assert.match(rule('.sb-mslist::after'), /border-left: 1px solid var\(--tie\); border-top: 1px solid var\(--tie\); transform: rotate\(45deg\);/, 'its arrowhead points up');
  for (const theme of [/html\.sb \{([^}]*)\}/, /html\.sb:not\(\[data-theme="light"\]\) \{([^}]*)\}/, /html\.sb\[data-theme="dark"\] \{([^}]*)\}/]) {
    assert.match(theme.exec(css())[1], /--tie: #[0-9a-f]{6};/);
  }
});

test('AC57, AC58 and AC60 (Still and plain): no rule sets an animation or transition that runs without the owner acting, none holds "infinite", and no element changes between two renders a minute apart with no new data', async () => {
  const sheet = css().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(sheet, /infinite/);
  assert.doesNotMatch(sheet, /transition\s*:/, 'no transition at all');
  // The only animations are a sheet's and a bubble's, which come in only when the owner opens one.
  const animated = [...sheet.matchAll(/([^{}]+)\{[^{}]*animation:[^{}]*\}/g)].map((m) => m[1].trim());
  assert.deepEqual(animated, ['.sb-bubble', '.sb-sheet']);
  assert.doesNotMatch(readFileSync(`${SRC}/public/sandbox.js`, 'utf8'), /pulse|requestAnimationFrame|\.animate\(/);
  for (const hash of ['#/p/Service-Desk', '#/p/Service-Desk/timeline', '#/']) {
    const app = await openSD(hash);
    try {
      app.desk.stop();
      const before = findAll(app.view, () => true);
      const texts = before.map((e) => `${e.className}|${JSON.stringify(e.attrs)}|${e.text}`);
      await app.advance(60_000);
      app.module.refresh();
      await app.flush();
      const after = findAll(app.view, () => true);
      assert.equal(after.length, before.length, `${hash}: nothing added or removed`);
      after.forEach((e, i) => {
        assert.equal(e, before[i], `${hash}: the same element`);
        if (!e._live) assert.equal(`${e.className}|${JSON.stringify(e.attrs)}|${e.text}`, texts[i], `${hash}: element ${i} unchanged`);
      });
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// AC58 and AC65: the Home tile

test('AC65 (note 28): the tile\'s where-it-is line — "Design, second time through"; "Design" for a first run; "Done"; "where it is: not recorded"; "Phases not tracked"', () => {
  const { ctx } = models();
  assert.equal(tilePhases(ctx).line, 'Design, second time through');
  assert.equal(tilePhases(ctx).cls, 'ph-des', 'after a chip in the now phase\'s colour');
  assert.equal(tilePhases(madeUp([['Discovery', 1], ['Design', 1, [['M1', false]]]])).line, 'Design');
  assert.equal(tilePhases(madeUp([['Discovery', 1], ['Build', 1, [['M1', true]]], ['Design', 2], ['Build', 2], ['Design', 3, [['M2', false]]]])).line, 'Design, third time through');
  const done = models({ extra: { 'decisions/questions/P-001-graduation.md': 'Ruling: proceed\n' } });
  assert.equal(tilePhases(done.ctx).line, 'Done');
  const none = madeUp([]);
  none.pv = { ...none.pv, tracked: true, phases: ['Discovery', 'Design', 'Build', 'Launch'].map((phase) => ({ phase, word: 'not recorded' })) };
  none.tl = { runs: () => [] };
  assert.equal(tilePhases({ ...none, now: null }).line, 'where it is: not recorded');
  const v = { ...SD3, model: 'v2.5' };
  assert.equal(tilePhases({ ...models().ctx, project: v, pv: phaseView(v, null, new Map(), null) }).line, 'Phases not tracked');
});

test('AC65 and AC58: the boxes from the top Done, Launch, Build, Design, Discovery, with the tile\'s words; each box\'s stripe token, the now box\'s gold edge; the dots\' icons; no milestone on the card', async () => {
  const { ctx } = models();
  const tv = tilePhases(ctx);
  assert.deepEqual(tv.rows.map((r) => [r.phase, r.word]), [['Done', ''], ['Launch', 'not started'], ['Build', 'run 2 to come'], ['Design', 'now · run 2'], ['Discovery', 'finished']]);
  const icon = (ph, k) => tv.shape.dots.find((d) => d.phase === ph && d.k === k).icon;
  assert.deepEqual([icon('Discovery', 1), icon('Design', 1), icon('Build', 1), icon('Design', 2), icon('Build', 2), icon('Launch', 2), icon('Done', 2)],
    ['check', 'pastcheck', 'pastcheck', 'next', 'planned', 'planned', 'planned']);
  assert.equal(tilePhases(madeUp([['Discovery', 1], ['Design', 1, [['M1', false]]]])).rows.find((r) => r.phase === 'Design').word, 'now', '"now" alone with one run');
  const app = await openSD('#/');
  try {
    const card = byClass(app.view, 'sb-pc')[0];
    const tile = byClass(card, 'sb-tph')[0];
    const rows = byClass(tile, 'sb-trow');
    assert.deepEqual(rows.map((r) => r.textContent), ['Done', 'Launchnot started', 'Buildrun 2 to come', 'Designnow · run 2', 'Discoveryfinished']);
    assert.deepEqual(rows.map((r) => r.className.split(' ')[1]), ['ph-done', 'ph-launch', 'ph-build', 'ph-des', 'ph-disc']);
    assert.ok(rows[3].className.split(' ').includes('now'));
    assert.match(rule('.sb-trow'), /box-shadow: inset 2px 0 0 var\(--ph, transparent\);/);
    assert.match(rule('.sb-trow.now'), /border-color: var\(--gold\);/);
    assert.match(rule('.sb-trow.end'), /border-style: dashed; box-shadow: none;/);
    assert.equal(byClass(tile, 'sb-where')[0].textContent, 'Design, second time through');
    assert.doesNotMatch(card.textContent, /of 4 phases finished/, '"<n> of 4 phases finished" goes');
    assert.doesNotMatch(card.textContent, /\bM(D|3)?\d[A-Z]?\b|Design-\d/, 'no milestone on the card');
    // The drawing: AC57's shapes, drawn smaller, each dot level with its box's name.
    const ys = { Done: 20, Launch: 45, Build: 70, Design: 95, Discovery: 120 };
    const undo = railLayout(ys);
    try {
      app.module.fitRail(tile);
      const kids = svgKids(byClass(tile, 'sb-rail')[0]);
      const dots = kids.filter((e) => e.attrs['data-kind'] === 'dot');
      for (const d of dots) assert.ok(Math.abs(Number(d.attrs.cy) - ys[d.attrs['data-phase']]) <= 1);
      for (const l of kids.filter((e) => e.attrs['data-kind'] === 'line')) assert.equal(l.attrs.x1, l.attrs.x2);
      assert.equal(kids.filter((e) => e.attrs['data-kind'] === 'curve').length, 1);
      for (const a of kids.filter((e) => e.attrs['data-kind'] === 'arrow')) assert.equal(a.attrs['data-dir'], 'up');
      assert.deepEqual(dots.map((d) => d.attrs['data-mark']), ['check', 'pastcheck', 'pastcheck', 'next', 'planned', 'planned', 'planned']);
    } finally {
      undo();
    }
    // The card's taps are unchanged: the drawing is no control; a tap on it is the card's.
    assert.equal(findAll(tile, (e) => e.tag === 'a' || e.tag === 'button').length, 0);
    assert.match(rule('.sb-pc-rest'), /pointer-events: none;/);
  } finally {
    app.restore();
  }
});

test('AC58 + AC65: "Phases not tracked" with empty rows for the v2.5 fixture; two columns and H5\'s extremes at 360 px', async () => {
  const setup = extremes();
  const app = await opened(setup, '#/');
  try {
    for (const k of ['done', 'closed']) { keyed(app, `hgroup-btn:${k}`).click(); await app.flush(); }
    const delta = byClass(app.view, 'sb-pc').find((c) => c.textContent.includes('Delta'));
    const tile = byClass(delta, 'sb-tph')[0];
    assert.equal(byClass(tile, 'sb-where')[0].textContent, 'Phases not tracked');
    assert.deepEqual(byClass(tile, 'sb-trow').map((r) => r.textContent), ['Done', 'Launch', 'Build', 'Design', 'Discovery'], 'empty rows');
    assert.equal(byClass(tile, 'sb-rail').length, 0, 'no drawing without phase records');
    assert.equal(byClass(app.view, 'sb-pc').length, 5);
    assert.doesNotMatch(app.text(), /Can't show/);
    assert.match(rule('.sb-grid'), /grid-template-columns: 1fr 1fr;/);
    for (const m of css().matchAll(/(?:^|[;{\s])width:\s*(\d+)px/g)) assert.ok(Number(m[1]) <= 360, `fixed width ${m[1]}px`);
  } finally {
    app.restore();
  }
  void v3; void v25; void fullRepo; void repo; void fixture; void El0; void opened;
});
