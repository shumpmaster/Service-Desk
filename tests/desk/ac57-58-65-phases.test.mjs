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
import { tileTimeline } from '../../src/lib/home.js';

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
//
// From stage 3 (S-001 AC57, "Changed by AC83", specs/S-001.md:4478-4488): "in the trial view the Status
// screen's phase boxes and branch drawing give way to the project page's phase strip and its milestones
// by phase, one folded line per phase, read from the bottom up (frames 5, 6 and 6b), and the branch
// drawing moves to the Home tile's timeline (AC82, frame H5). This criterion's rules for each run's and
// each milestone's state ... still decide what both show. Two parts go: the key above the phase boxes ...
// and "why: not recorded" on every milestone". The three cases below checked the boxes, their folding
// and their drawing on the Status screen; each is rewritten one for one for what takes its place.

const lineOf = (app, ph) => findAll(keyed(app, 'ms-lines'), (e) => e.attrs && e.attrs['data-phase'] === ph)[0];
const foldOf = (app, ph) => findAll(lineOf(app, ph), (e) => e.tag === 'button')[0];

test('AC57, changed by AC83 (rewrites "the boxes from the top"): on the page, one line per phase from the top, Launch, Build, Design, Discovery, each with its phase\'s square in its colour token and its name in words, its state word from AC57\'s run states, the now phase\'s "run 2 · now"; Done is no line (the strip ends at Launch, AC83); no key (AC83, "no key")', async () => {
  const app = await openSD('#/p/Service-Desk');
  try {
    const lines = findAll(keyed(app, 'ms-lines'), (e) => e.attrs && e.attrs['data-phase']);
    assert.deepEqual(lines.map((l) => l.attrs['data-phase']), ['Launch', 'Build', 'Design', 'Discovery'], 'read from the bottom up: Discovery at the foot, no Done line');
    for (const [ph, cls] of [['Launch', 'ph-launch'], ['Build', 'ph-build'], ['Design', 'ph-des'], ['Discovery', 'ph-disc']]) {
      assert.ok(foldOf(app, ph).className.split(' ').includes(cls), `${ph}: ${cls}`);
      assert.equal(byClass(foldOf(app, ph), 'v2-sn')[0].textContent, ph, `${ph}: its name in words, beside its square`);
      assert.equal(byClass(foldOf(app, ph), 'v2-dot').length, 1);
    }
    // The square is the phase's colour token (AC81's four phase colours), each with its phase's name.
    for (const [cls, tok] of [['ph-disc', '--ph-disc'], ['ph-des', '--ph-des'], ['ph-build', '--ph-build'], ['ph-launch', '--ph-launch']]) assert.match(css(), new RegExp(`\\.v2 \\.${cls} \\{ --phc: var\\(${tok}\\); \\}`));
    assert.match(rule('.v2-dot'), /background: var\(--phc, var\(--ink2\)\);/);
    assert.deepEqual(['Launch', 'Build', 'Design', 'Discovery'].map((ph) => byClass(foldOf(app, ph), 'v2-sv')[0].textContent), ['planned', 'run 2 ahead', 'run 2 · now', 'finished'],
      'each line\'s state word, as AC57\'s run states give it (Design i2 now; Build i2 still to come after Build i1; Launch i1 only still to come; Discovery i1 finished)');
    assert.equal(byClass(app.view, 'sb-pbox').length + byClass(app.view, 'sb-skey').length, 0, 'no boxes and no key');
    assert.doesNotMatch(app.text(), /Runsfinishedfinished, then gone back over|now: holds the next milestone to reach/, 'AC57\'s key is not built (AC83)');
    assert.doesNotMatch(app.text(), /After the Launch gate|of 4 phases finished/);
  } finally {
    app.restore();
  }
});

test('AC57 (note 25), changed by AC83 (rewrites "folding"): every phase line starts folded; a tap, Enter and Space each open and fold one, the phase\'s name its accessible name and its state its accessible state, with its mark; opening or folding one never moves another', async () => {
  const app = await openSD('#/p/Service-Desk');
  try {
    for (const ph of ['Launch', 'Build', 'Design', 'Discovery']) {
      assert.equal(foldOf(app, ph).attrs['aria-expanded'], 'false', `${ph} starts folded`);
      assert.equal(foldOf(app, ph).attrs['aria-label'], ph, `${ph}: its accessible name is the phase's name`);
    }
    assert.equal(byClass(app.view, 'v2-stdl').length, 0, 'folded to one line each');
    const order = () => findAll(keyed(app, 'ms-lines'), (e) => e.attrs && e.attrs['data-phase']).map((l) => l.attrs['data-phase']).join(',');
    const before = order();
    assert.equal(byClass(foldOf(app, 'Design'), 'vi-chev').length, 1, 'folded: its mark');
    await app.tap(foldOf(app, 'Design'));
    assert.equal(foldOf(app, 'Design').attrs['aria-expanded'], 'true');
    assert.equal(byClass(foldOf(app, 'Design'), 'vi-chevdown').length, 1, 'open: its mark');
    assert.equal(byClass(lineOf(app, 'Design'), 'v2-stdl').length, 1, 'it opens below itself');
    foldOf(app, 'Design').dispatch('keydown', { key: 'Enter' });
    await app.flush();
    assert.equal(foldOf(app, 'Design').attrs['aria-expanded'], 'false');
    assert.equal(byClass(lineOf(app, 'Design'), 'v2-stdl').length, 0);
    foldOf(app, 'Design').dispatch('keydown', { key: ' ' });
    await app.flush();
    assert.equal(foldOf(app, 'Design').attrs['aria-expanded'], 'true');
    foldOf(app, 'Discovery').dispatch('keydown', { key: ' ' });
    await app.flush();
    assert.equal(foldOf(app, 'Discovery').attrs['aria-expanded'], 'true');
    assert.equal(foldOf(app, 'Design').attrs['aria-expanded'], 'true', 'opening one leaves the other as it was');
    assert.equal(order(), before, 'no other line moves in order');
  } finally {
    app.restore();
  }
});

test('AC57, changed by AC83 (rewrites "the drawing\'s shapes"): the branch drawing has moved to the Home tile\'s timeline (AC82, frame H5) — run 1 Discovery, Design and Build; run 2 from Design to Done, dropping under Design from run 1 (the one curve from Build i1 to Design i2), still to come dashed, gone back over lighter; and the page draws none', async () => {
  const { ctx } = models();
  const tl = tileTimeline(ctx);
  const cells = (k) => tl.rows[k - 1].cells.map((c) => (c ? `${c.phase}:${c.state}` : '-'));
  assert.deepEqual(cells(1), ['Discovery:done', 'Design:gone', 'Build:gone', '-', '-'], 'run 1, as the drawing\'s first column');
  assert.deepEqual(cells(2), ['-', 'Design:now', 'Build:ahead', 'Launch:ahead', 'Done:ahead'], 'run 2, as its second column, still-to-come dots dashed');
  assert.equal(tl.rows[1].up, 1, 'run 2 starts under Design');
  assert.equal(tl.rows[0].down, 1, 'joined by one drop from run 1, where the curve ran from Build i1\'s dot to Design i2\'s');
  const app = await openSD('#/p/Service-Desk');
  try {
    assert.equal(byClass(app.view, 'sb-rail').length + byClass(app.view, 'sb-pboxes').length, 0, 'no branch drawing on the page');
    assert.equal(app.module.fitRail, undefined, 'and no code left to fit one');
  } finally {
    app.restore();
  }
});

// Rewritten in stage 3 (S-001 AC57, changed by AC83; AC83's opened line, specs/S-001.md:6798-6801: "a thin line with
// an arrow pointing up (notes 12 and 19)"): the Status screen's drawing and its tie line give way to the page's
// opened phase, and the drawing to the Home tile's timeline (AC82, frame H5).
test('AC57, changed by AC83: the opened phase\'s line — 1 px in --line2, with an arrowhead pointing up at its top, drawn as an icon; the tile\'s lines 2 px in the phase\'s colour, dashed ahead and lighter gone back over (AC82)', async () => {
  assert.match(rule('.v2-stdl::before'), /width: 1px; background: var\(--line2\);/);
  assert.match(rule('.v2-arrow'), /position: absolute; left: -1px; top: -2px;/, 'the arrowhead at the line\'s top');
  assert.match(rule('.v2-c.l::before, .v2-c.r::after'), /height: 2px; margin-top: -1px; background: var\(--phc\);/);
  assert.match(rule('.v2-c.s-ahead.l::before, .v2-c.s-ahead.r::after'), /repeating-linear-gradient/);
  assert.match(rule('.v2-c.s-gone.l::before, .v2-c.s-gone.r::after'), /opacity: \.4;/);
  const app = await openSD('#/p/Service-Desk');
  try {
    await app.tap(findAll(app.view, (e) => e.tag === 'button' && e.attrs['aria-label'] === 'Design')[0]);
    const arrow = byClass(keyed(app, 'stdl:Design'), 'v2-arrow')[0];
    assert.equal(arrow.attrs['aria-hidden'], 'true');
    assert.equal(byClass(arrow, 'vi-up').length, 1, 'an icon pointing up, never ▲ as text (AC81)');
    assert.equal(keyed(app, 'stdl:Design').children[0], arrow, 'at the list\'s top');
  } finally {
    app.restore();
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

test('AC65 and AC58, changed by AC82 (frame H5; P-001-tile-direction.md, A): the tile\'s phases as a timeline, left to right — one row per run, a cell per phase, each icon, its line\'s style and colour, the drop to run 2, the names once with the now phase bold, and one sentence carrying it; no "<n> of 4 phases finished"', async () => {
  const app = await openSD('#/');
  try {
    const card = keyed(app, 'card:Service-Desk');
    const ptl = byClass(card, 'v2-ptl')[0];
    assert.equal(ptl.attrs['aria-hidden'], 'true', 'the drawing is hidden from assistive technology');
    assert.equal(findAll(ptl, (e) => e.tag === 'a' || e.tag === 'button').length, 0, 'no control: a tap on it is the tile\'s');
    const rows = byClass(ptl, 'v2-rwl');
    assert.deepEqual(rows.map((r) => byClass(r, 'v2-rk')[0].textContent), ['run 1', 'run 2']);
    const cells = (r) => byClass(r, 'v2-c').map((c) => {
      const svg = c.children.find((x) => x.tag === 'svg');
      return svg ? `${c.className.split(' ')[1]}:${/st-([a-z]+)/.exec(svg.getAttribute('class'))[1]}` : '-';
    });
    // Left to right in time: Discovery, Design, Build, Launch, Done.
    assert.deepEqual(cells(rows[0]), ['ph-disc:check', 'ph-des:pastcheck', 'ph-build:pastcheck', '-', '-'], 'run 1: Discovery finished, Design and Build gone back over (a lighter check)');
    assert.deepEqual(cells(rows[1]), ['-', 'ph-des:half', 'ph-build:planned', 'ph-launch:planned', 'ph-done:planned'], 'run 2: Design now (half-filled), the rest a dashed ring');
    const state = (r, i) => byClass(r, 'v2-c')[i].className.split(' ');
    assert.ok(state(rows[0], 0).includes('s-done') && state(rows[0], 1).includes('s-gone') && state(rows[1], 2).includes('s-ahead'));
    assert.ok(state(rows[0], 1).includes('dn') && state(rows[1], 1).includes('up'), 'a short dashed drop from run 1\'s Design to run 2\'s, the phase it went back to');
    assert.ok(state(rows[1], 1).includes('r') && state(rows[1], 2).includes('l'), 'joined to its neighbours');
    const lb = byClass(ptl, 'v2-lb')[0];
    assert.deepEqual(lb.children.map((x) => x.textContent), ['Discovery', 'Design', 'Build', 'Launch', 'Done'], 'each phase\'s name once, under the rows');
    assert.deepEqual(lb.children.map((x) => x.tag), ['span', 'b', 'span', 'span', 'span'], 'the now phase\'s in bold');
    assert.equal(keyed(app, 'ptl-words:Service-Desk').textContent,
      'Phases: Discovery finished; Design and Build run 1 gone back over; now Design run 2; Build, Launch and Done ahead', 'the sentence, as drawn');
    assert.ok(keyed(app, 'ptl-words:Service-Desk').className.split(' ').includes('sb-vh'));
    // The lines: in the phase's colour, solid where finished, dashed where still to come, lighter where gone back over.
    assert.match(rule('.v2-c.l::before, .v2-c.r::after'), /background: var\(--phc\);/);
    assert.match(rule('.v2-c.s-ahead.l::before, .v2-c.s-ahead.r::after'), /repeating-linear-gradient\(90deg, var\(--phc\) 0 3px, transparent 3px 6px\)/);
    assert.match(rule('.v2-c.s-gone.l::before, .v2-c.s-gone.r::after'), /opacity: \.4;/);
    assert.match(rule('.v2-c.ph-des'), /--phc: var\(--ph-des\);/);
    assert.match(rule('.v2-c.dn > i, .v2-c.up > i'), /border-left: 1\.5px dashed var\(--ink2\);/);
    assert.doesNotMatch(card.textContent, /of 4 phases finished/, '"<n> of 4 phases finished" goes');
    assert.equal(byClass(card, 'sb-tph').length + byClass(card, 'sb-rail').length, 0, 'no bottom-up boxes or branch drawing on the tile (AC65, changed)');
  } finally {
    app.restore();
  }
});

test('AC58 + AC65, changed by AC82: a v2.5 tile draws its sprint files in place of phases, at most the last four, closed ones checked, the open one half-filled; one tile a row and H5\'s extremes at 360 px', async () => {
  const setup = extremes();
  setup.repos.Delta.commit({ 'docs/sprints/m1.1-foundation.md': '# m1.1\n\nstatus: closed\n', 'docs/sprints/m1.2-x.md': '# m1.2\n\nstatus: closed\n',
    'docs/sprints/m1.3-y.md': '# m1.3\n\nstatus: closed\n', 'docs/sprints/m1.0-old.md': '# m1.0\n\nstatus: closed\n' });
  const app = await opened(setup, '#/');
  try {
    await app.advance(61_000);
    keyed(app, 'hgroup-btn:done').click();
    await app.flush();
    const delta = keyed(app, 'card:Delta');
    const ptl = byClass(delta, 'v2-ptl')[0];
    assert.ok(ptl.className.split(' ').includes('sprints'));
    assert.deepEqual(byClass(ptl, 'v2-rk').map((x) => x.textContent), ['sprints'], 'labelled "sprints"');
    assert.deepEqual(byClass(ptl, 'v2-lb')[0].children.map((x) => x.textContent), ['m1.1', 'm1.2', 'm1.3', 'm1.4'], 'the last four, by id');
    assert.deepEqual(byClass(ptl, 'v2-c').map((c) => /st-([a-z]+)/.exec(c.children.find((x) => x.tag === 'svg').getAttribute('class'))[1]), ['check', 'check', 'check', 'half']);
    assert.equal(byClass(ptl, 'v2-lb')[0].children[3].tag, 'b', 'the open one in bold');
    assert.match(rule('.v2-ptl.sprints .v2-lb'), /font: var\(--t-mono\);/, 'each id in Plex Mono');
    assert.equal(keyed(app, 'ptl-words:Delta').textContent, 'Sprints: m1.1, m1.2 and m1.3 closed; m1.4 open');
    assert.match(delta.textContent, /Now: sprint m1\.4 · older pipeline: sprints, not phases/);
    assert.match(delta.textContent, /No dispatch log: not used here/);
    assert.match(delta.textContent, /Next: sprint m1\.4 · no estimate filed/);
    assert.equal(byClass(app.view, 'v2-tile').length, 5);
    assert.doesNotMatch(app.text(), /Can't show/);
    assert.match(rule('.v2-tiles'), /grid-template-columns: minmax\(0, 1fr\);/, 'one tile a row at 360 px');
    // The whole sheet, as at the base (restored after the Reviewer's note on stage 2 round 1's narrowing).
    for (const m of css().matchAll(/(?:^|[;{\s])width:\s*(\d+)px/g)) assert.ok(Number(m[1]) <= 360, `fixed width ${m[1]}px`);
  } finally {
    app.restore();
  }
  void v3; void v25; void fullRepo; void repo; void fixture; void El0; void opened;
});

