// ac-test: S-001/AC92 — G5 of "After the glance audit": every milestone and sprint counted, part (c) (specs/S-001.md,
// AC92 (c); round 2, item 4; P-001-glance2-counts.md, A, the part that needs no model change; AC83 and AC84, changed):
// each milestone once in its phase, an own one counted unless dropped and reached by its ` · reached:` line, a standard
// one by the first of six classes that fits (skipped; reached in any run; not needed; tracked, not reached; taken on, not
// recorded by the model; not tracked), T and R over the phase, k, o, q, j and e for its checklist; each sprint once in its
// phase, s, m (the Timeline's own "✓ merged") and w (pull requests not read); the section's head summed, each phase's two
// lines of detail, the Timeline's fold over the sprints under each milestone, an opened phase's row with its sprints, and
// Details' CI line with its workflows passed. ac-test: S-001/AC83 ac-test: S-001/AC84
//
// Round 2's F1 (a Launch line reading "0 of 5, not recorded yet" while its run lists Launch-3 "not reached") and F2 (the
// line dropping a planned own milestone of an earlier run) are cases, on `mix` with its made-up later Launch run
// (tests/desk/glance-fixtures.mjs, `laterLaunch`, NOT real records). The other records: Service-Desk's at 77bfeae, real
// (tests/desk/fixtures/j11-77bfeae/), with J12's built answer (tests/desk/fixtures/github/j12-pulls-built.json, from REST
// answers, NOT as GitHub sent it) where pull requests are read; ac83-page.test.mjs's `ALL_24` lines (made up); and the
// made-up runs, sprints and workflow runs written below, each NOT a real record. The page is the sandbox's own code under
// the fake DOM; the counts are pure (src/lib/projectpage.js), drawn by src/public/sandbox.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { j77Files, snapOf, SD, TZ } from './wa-fixtures.mjs';
import { textState, mixState, MIX_PROJECT, NOW, LATER_LAUNCH_LINES, laterLaunchLog } from './glance-fixtures.mjs';
import { pullsAnswer } from './j12-fixture.mjs';
import { STANDARD_MILESTONES, NOT_RECORDED_IDS } from '../../src/lib/timeline.js';
import { j11Records, timelineOf, phaseView } from '../../src/lib/sandbox.js';
import { runsContext, feedView } from '../../src/lib/feed.js';
import { phaseCounts, countLines, sprintCount, sprintsWords, milestonesByPhase, milestoneSprints, runSprintViews, blockOf, standardClass, modelRecords, detailLines, ciPassed, ciWords, PAGE_WORDS } from '../../src/lib/projectpage.js';
import { reduceWorkflowRuns, ciCounts } from '../../src/lib/records.js';
import { POLL_MS } from '../../src/lib/scheduler.js';

const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const line = (app, ph) => findAll(keyed(app, 'ms-lines'), (e) => e.attrs && e.attrs['data-phase'] === ph)[0];
const fold = (app, ph) => findAll(line(app, ph), (e) => e.tag === 'button')[0];
const detail = (app, ph) => byClass(byClass(fold(app, ph), 'v2-sd')[0], 'v2-sdl').map((x) => x.textContent);
const PHASES = ['Launch', 'Build', 'Design', 'Discovery'];

/** The page's own context and Timeline for Service-Desk's records at 77bfeae plus `extra` (J12 not read: no pulls). */
function real(extra = {}) {
  const snap = snapOf({ ...j77Files(), ...extra });
  const j = j11Records(SD, snap);
  const tl = timelineOf(j);
  const pv = phaseView(SD, tl, snap.tree, j);
  const ctx = runsContext(SD, snap, j, tl, pv, NOW, TZ);
  return { ctx, feed: feedView(ctx, null, NOW, TZ) };
}

/**
 * A made-up context (NOT real records): runs as { phase, iteration, state (the run's), own: [{ id, reached, dropped }],
 * std: { id: state } }, every other standard milestone of the run "not recorded"; `standard` the section-3 lines
 * ({ id: { state: 'taken on' | 'skipped' } }); `groundwork` the groundwork requests J11 read.
 */
function fake({ runs, standard = {}, groundwork = [] }) {
  const rs = runs.map((r) => ({ phase: r.phase, iteration: r.iteration || 1, project: r.own || [], sprints: {}, untagged: [],
    standard: STANDARD_MILESTONES.filter((m) => m[1] === r.phase).map(([id, , name]) => ({ id, name, state: (r.std || {})[id] || 'not recorded' })) }));
  return { cols: { runs: rs, k: new Map(rs.map((r) => [r, r.iteration])) }, state: new Map(rs.map((r, i) => [r, runs[i].state])), standard, j: { groundwork }, runs: rs };
}
/** Made-up sprint views, as feedView draws them: a merged pull request, one not read, an open one, a pipeline item merged or not. */
const SP = {
  merged: (n) => ({ id: `PR #${n}`, marks: [{ mark: '✓', word: 'merged', why: null }] }),
  unread: (n) => ({ id: `PR #${n}`, missing: 'not available' }),
  open: (n) => ({ id: `PR #${n}`, marks: [{ mark: '', word: 'open', why: null }] }),
  closed: (n) => ({ id: `PR #${n}`, marks: [{ mark: '', word: 'closed, not merged', why: null }] }),
  item: (id) => ({ id, marks: [{ mark: '✓', word: 'merged', why: null }] }),
  itemOpen: (id) => ({ id, marks: [{ mark: '–', word: 'merged', why: 'not merged' }] }),
};
/** A made-up Timeline (NOT real): for each run, its milestone rows' sprints and its "Not tied to a milestone" ones. */
const feedOf = (ctx, rows) => ({ ok: true, blocks: ctx.cols.runs.map((r, i) => ({ run: r, key: `${r.phase}-i${r.iteration}`, plannedRows: [],
  rows: (rows[i] || []).map(([code, sprints]) => (code ? { kind: 'ms', code, sprints } : { kind: 'untied', sprints })) })) });

// ---------------------------------------------------------------------------
// Each milestone once in its phase: T, R, and the checklist's k, o, q, j and e

test('AC92 (c): an own milestone counts once in its phase unless dropped, reached by its ` · reached:` line, over every run — a planned one of an earlier run counted (round 2\'s F2)', () => {
  const ctx = fake({ runs: [
    { phase: 'Build', iteration: 1, state: 'gone back over', own: [{ id: 'B1', reached: '2026-10-07' }, { id: 'B2', dropped: true }, { id: 'B3' }] },
    { phase: 'Build', iteration: 2, state: 'now', own: [{ id: 'B4', reached: '2026-10-12' }, { id: 'B5' }] },
  ] });
  const c = phaseCounts(ctx, 'Build');
  assert.deepEqual([c.R, c.T], [2, 4], 'B1 and B4 reached; B3 (planned, run 1: F2) and B5 counted; B2 dropped, not counted');
  assert.deepEqual([c.k, c.o, c.q, c.j, c.e, c.n], [0, 0, 5, 0, 0, 5], 'no standard line or state: all five not tracked');
  assert.equal(countLines({ ...c, sprints: { s: 0, m: 0, w: 0 } }).reached.bold, '2 of 4');
});

test('AC92 (c): a standard milestone takes the first class that fits — skipped; reached (in any run, "carried over" too, a run gone back over included); not needed; tracked ("not reached" recorded, round 2\'s F1); taken on, not recorded by the model; not tracked — and only classes 2 and 4 are in T', () => {
  const ctx = fake({
    runs: [
      { phase: 'Design', iteration: 1, state: 'gone back over', std: { 'Design-1': 'reached', 'Design-2': 'not reached', 'Design-4': 'reached', 'Design-6': 'not needed' } },
      { phase: 'Design', iteration: 2, state: 'now', std: { 'Design-1': 'not reached', 'Design-2': 'reached (carried over from Design i1)', 'Design-4': 'not reached' } },
    ],
    standard: { 'Design-4': { state: 'skipped' }, 'Design-3': { state: 'taken on' }, 'Design-5': { state: 'skipped' } },
  });
  const cls = Object.fromEntries(STANDARD_MILESTONES.filter((m) => m[1] === 'Design').map(([id]) => [id, standardClass(ctx, ctx.runs, id)]));
  assert.deepEqual(cls, {
    'Design-1': 2, // reached in run 1, "not reached" in run 2: history counts as done
    'Design-2': 2, // carried over, "not reached" in run 1
    'Design-3': 5, // taken on, and one of NOT_RECORDED_IDS: the model can't record it
    'Design-4': 1, // skipped by its line, though a state is recorded: outside R and T
    'Design-5': 1, // skipped, nothing recorded
    'Design-6': 3, // not needed, never reached
  });
  assert.ok(NOT_RECORDED_IDS.has('Design-3'));
  const c = phaseCounts(ctx, 'Design');
  assert.deepEqual([c.R, c.T, c.k, c.o, c.q, c.j, c.e], [2, 2, 2, 1, 0, 2, 1]);
  assert.equal(c.k + c.o + c.q + c.j + c.e, 6, 'every standard milestone of the phase in one class');
  assert.deepEqual(countLines({ ...c, sprints: { s: 0, m: 0, w: 0 } }), {
    reached: { bold: '2 of 2', rest: ' reached · no sprints filed yet' },
    standard: 'Standard checklist: 2 tracked · 1 taken on, not recorded by the model · 2 skipped · 1 not needed',
  });
  // F1: a recorded "not reached" is tracked, counted in T, not in R.
  const f1 = fake({ runs: [{ phase: 'Launch', iteration: 1, state: 'still to come', std: { 'Launch-3': 'not reached' } }] });
  assert.equal(standardClass(f1, f1.runs, 'Launch-3'), 4);
  assert.deepEqual([phaseCounts(f1, 'Launch').R, phaseCounts(f1, 'Launch').T], [0, 1]);
});

test('AC92 (c): a taken-on line — tracked (class 4) where the model can record it and its phase has a run now or still to come; "taken on, not recorded by the model" (class 5) for Launch-4, one of NOT_RECORDED_IDS, Discovery-3 with no groundwork, or a finished phase; and, for R3-a, a phase with no run now or to come (its runs "not recorded")', () => {
  const all = (phase) => Object.fromEntries(STANDARD_MILESTONES.filter((m) => m[1] === phase).map(([id]) => [id, { state: 'taken on' }]));
  const ahead = fake({ runs: [{ phase: 'Launch', iteration: 1, state: 'still to come' }], standard: all('Launch') });
  assert.deepEqual(STANDARD_MILESTONES.filter((m) => m[1] === 'Launch').map(([id]) => standardClass(ahead, ahead.runs, id)), [5, 5, 4, 5, 5],
    'Launch-1, -2 and -5 (NOT_RECORDED_IDS) and Launch-4 (its file part never recorded) in class 5; Launch-3, recordable, in class 4');
  assert.deepEqual([modelRecords(ahead, 'Launch-4'), modelRecords(ahead, 'Launch-3'), modelRecords(ahead, 'Launch-1')], [false, true, false]);
  const c = phaseCounts(ahead, 'Launch');
  assert.deepEqual([c.R, c.T, c.k, c.o, c.q], [0, 1, 1, 4, 0]);
  assert.equal(countLines({ ...c, sprints: { s: 0, m: 0, w: 0 } }).standard, 'Standard checklist: 1 tracked · 4 taken on, not recorded by the model');
  // Discovery-3: recordable only while groundwork is recorded for the project.
  const disc = (groundwork) => fake({ runs: [{ phase: 'Discovery', iteration: 1, state: 'now' }], standard: { 'Discovery-3': { state: 'taken on' } }, groundwork });
  assert.equal(standardClass(disc([]), disc([]).runs, 'Discovery-3'), 5, 'no groundwork: the model can\'t record it');
  const withQ = disc(['Q-001']);
  assert.equal(standardClass(withQ, withQ.runs, 'Discovery-3'), 4, 'groundwork recorded: tracked');
  // A finished phase: a taken-on recordable one with nothing recorded is class 5, so "<T> of <T>" stays.
  const done = fake({ runs: [{ phase: 'Build', iteration: 1, state: 'finished', own: [{ id: 'B1', reached: '2026-10-07' }], std: { 'Build-1': 'reached' } }], standard: all('Build') });
  const d = phaseCounts(done, 'Build');
  assert.deepEqual([d.R, d.T, d.k, d.o], [2, 2, 1, 4], 'a finished phase whose recordable milestones were all reached: "2 of 2", taken-on lines or not');
  // R3-a (the plan review's carried risk): a phase whose only run is "not recorded" (no run now or still to come) — a
  // taken-on recordable one is class 5, "taken on, not recorded by the model", matching its row's "taken on"; never
  // class 6, "not tracked".
  const unrec = fake({ runs: [{ phase: 'Build', iteration: 1, state: 'not recorded' }], standard: { 'Build-1': { state: 'taken on' } } });
  assert.equal(standardClass(unrec, unrec.runs, 'Build-1'), 5);
  assert.deepEqual([phaseCounts(unrec, 'Build').o, phaseCounts(unrec, 'Build').q, phaseCounts(unrec, 'Build').T], [1, 4, 0]);
});

test('AC92 (c): each phase\'s two lines — "<R> of <T> reached · <sprints>" or "no milestones tracked yet · <sprints>" with a T of 0; "Standard checklist: <k> tracked · <o> taken on, not recorded by the model · <q> not tracked · <j> skipped · <e> not needed", each part left out at 0; with k of 0, "none tracked (<n>)" and its other parts; never "0 of <n>"', () => {
  const none = { s: 0, m: 0, w: 0 };
  const L = (c) => countLines({ R: 0, T: 0, n: 5, k: 0, o: 0, q: 0, j: 0, e: 0, sprints: none, ...c });
  assert.deepEqual(L({}).reached, { bold: null, rest: 'no milestones tracked yet · no sprints filed yet' });
  assert.equal(L({ q: 5 }).standard, 'Standard checklist: none tracked (5)', 'as AC92 (c)\'s example: Build "none tracked (5)"');
  assert.equal(L({ q: 3, j: 2 }).standard, 'Standard checklist: none tracked (5) · 2 skipped');
  assert.equal(L({ o: 2, q: 1, e: 2 }).standard, 'Standard checklist: none tracked (5) · 2 taken on, not recorded by the model · 2 not needed');
  assert.equal(L({ n: 8, k: 4, q: 4 }).standard, 'Standard checklist: 4 tracked · 4 not tracked', 'as the example: Discovery');
  assert.equal(L({ n: 8, k: 1, o: 1, q: 1, j: 1, e: 4 }).standard, 'Standard checklist: 1 tracked · 1 taken on, not recorded by the model · 1 not tracked · 1 skipped · 4 not needed');
  assert.deepEqual(L({ R: 3, T: 5, sprints: { s: 4, m: 4, w: 0 } }).reached, { bold: '3 of 5', rest: ' reached · 4 sprints · 4 merged' }, 'the stage table\'s "3 of 5 reached · 4 sprints · 4 merged"');
  assert.deepEqual(L({ R: 0, T: 1 }).reached, { bold: '0 of 1', rest: ' reached · no sprints filed yet' });
  for (const c of [{ q: 5 }, { k: 1, q: 4 }, { j: 5 }]) assert.doesNotMatch(L(c).standard, /\b0 (of|tracked|taken|not|skipped)/, 'no part said as 0');
});

// ---------------------------------------------------------------------------
// Each sprint once in its phase: s, m and w, in the one sprint form

test('AC92 (c): the one sprint form — "<s> sprints · <m> merged, <w> not read", "none merged yet", "no sprints filed yet", and its singulars; each sprint once however many milestones or runs list it; m the Timeline\'s "✓ merged" (a pipeline item\'s merge in the dispatch log among them), w pull requests not read, an open or closed one and an unmerged pipeline item in s only', () => {
  assert.equal(sprintsWords({ s: 4, m: 4, w: 0 }), '4 sprints · 4 merged', 'all merged');
  assert.equal(sprintsWords({ s: 17, m: 9, w: 8 }), '17 sprints · 9 merged, 8 not read', 'some not read');
  assert.equal(sprintsWords({ s: 2, m: 0, w: 0 }), '2 sprints · none merged yet');
  assert.equal(sprintsWords({ s: 1, m: 1, w: 0 }), '1 sprint · 1 merged', 'one');
  assert.equal(sprintsWords({ s: 1, m: 0, w: 1 }), '1 sprint · 1 not read');
  assert.equal(sprintsWords({ s: 0, m: 0, w: 0 }), 'no sprints filed yet', 'no sprints');
  assert.deepEqual(sprintCount([SP.merged(40), SP.merged(41), SP.unread(44), SP.unread(44), SP.open(90), SP.closed(91), SP.item('Q-013'), SP.itemOpen('Q-099')]),
    { s: 7, m: 3, w: 1 }, 'PR #44 once; the open, the closed and the unmerged pipeline item in s only; Q-013 merged in the dispatch log');
  assert.deepEqual(sprintCount([{ id: 'Q-050', missing: 'not available' }]), { s: 1, m: 0, w: 0 }, 'a pipeline item is never in w');
  // A sprint under two milestones and in two runs of one phase: once in the phase, under each fold.
  const ctx = fake({ runs: [{ phase: 'Build', iteration: 1, state: 'finished', own: [{ id: 'B1' }, { id: 'B2' }] }, { phase: 'Build', iteration: 2, state: 'now', own: [{ id: 'B3' }] }] });
  const feed = feedOf(ctx, [[['B1', [SP.merged(44), SP.merged(40)]], ['B2', [SP.merged(44)]], [null, [SP.unread(70)]]], [['B3', [SP.merged(44), SP.open(80)]]]]);
  assert.deepEqual(phaseCounts(ctx, 'Build', feed).sprints, { s: 4, m: 2, w: 1 }, '#44 once; #40; #70 untied, not read; #80 open');
  assert.deepEqual([milestoneSprints(feed, ctx.runs[0], 'B1'), milestoneSprints(feed, ctx.runs[0], 'B2'), milestoneSprints(feed, ctx.runs[1], 'B3')],
    [{ s: 2, m: 2, w: 0 }, { s: 1, m: 1, w: 0 }, { s: 2, m: 1, w: 0 }], '#44 under each fold');
  assert.equal(phaseCounts(ctx, 'Launch', feed).sprints.s, 0, 'a phase with no runs: no sprints');
  assert.equal(phaseCounts(ctx, 'Build', null).sprints, null, 'no Timeline drawn: no count');
  assert.equal(sprintsWords(null), 'sprints not available', 'and in words, never a 0');
});

// Added after G5's review, round 1, note 2 (AC92 (c)'s head, the Definer's note: "where T sums to 0, "Milestones by phase ·
// none tracked yet", never "0 of 0""): the head's three forms, and the sums of a made-up project with nothing counted.
test('AC92 (c) (G5\'s review, note 2): the section\'s head — "Milestones by phase · <R> of <T> reached"; "Milestones by phase · none tracked yet" where every phase\'s T sums to 0, never "0 of 0 reached"; "Milestones by phase" alone where the phases aren\'t tracked', async () => {
  assert.equal(PAGE_WORDS.milestonesHead({ R: 3, T: 5 }), 'Milestones by phase · 3 of 5 reached');
  assert.equal(PAGE_WORDS.milestonesHead({ R: 0, T: 1 }), 'Milestones by phase · 0 of 1 reached');
  assert.equal(PAGE_WORDS.milestonesHead({ R: 0, T: 0 }), 'Milestones by phase · none tracked yet');
  assert.equal(PAGE_WORDS.milestonesHead(null), 'Milestones by phase');
  // A made-up context (NOT real) with runs in every phase and nothing counted: the sums are { R: 0, T: 0 }.
  const ctx = fake({ runs: ['Discovery', 'Design', 'Build', 'Launch'].map((phase) => ({ phase, iteration: 1, state: phase === 'Discovery' ? 'now' : 'still to come' })) });
  const sum = ['Discovery', 'Design', 'Build', 'Launch'].map((ph) => phaseCounts(ctx, ph)).reduce((a, c) => ({ R: a.R + c.R, T: a.T + c.T }), { R: 0, T: 0 });
  assert.deepEqual(sum, { R: 0, T: 0 });
  assert.equal(PAGE_WORDS.milestonesHead(sum), 'Milestones by phase · none tracked yet');
});

// Added after G5's review, round 1 (B1): two runs can share a Timeline block's key, "<Phase>-i<n>" (a project's first
// item's run and a later item's), and the blocks come in display order, so a lookup by key alone gave the other run's
// block, and a phase lost its sprints. Each run's block is now found by the run itself, the key only where none is.
test('AC92 (c) (G5\'s review, B1): two runs sharing a key — each run\'s sprints from its own Timeline block, whichever comes first in the Timeline\'s order; the key only where no block is the run\'s own', () => {
  const ctx = fake({ runs: [
    { phase: 'Build', iteration: 1, state: 'gone back over', own: [{ id: 'B1' }] },
    { phase: 'Build', iteration: 1, state: 'still to come', own: [{ id: 'B9' }] },
  ] });
  const [early, later] = ctx.runs;
  const made = feedOf(ctx, [[['B1', [SP.unread(40), SP.unread(41)]]], [['B9', []]]]);
  // The Timeline draws the run still to come above the earlier one: its block first, with the same key.
  const feed = { ok: true, blocks: [...made.blocks].reverse() };
  assert.equal(feed.blocks[0].key, feed.blocks[1].key, 'one key, two runs');
  assert.equal(blockOf(feed, early).run, early);
  assert.equal(blockOf(feed, later).run, later);
  assert.deepEqual(runSprintViews(feed, early).map((v) => v.id), ['PR #40', 'PR #41']);
  assert.deepEqual(milestoneSprints(feed, early, 'B1'), { s: 2, m: 0, w: 2 });
  assert.deepEqual(phaseCounts(ctx, 'Build', feed).sprints, { s: 2, m: 0, w: 2 }, 'the phase keeps its two sprints');
  // A run from another reading of the records (not the drawn object): its block by key.
  const twin = { ...early };
  assert.equal(blockOf(feed, twin).key, 'Build-i1');
  assert.equal(blockOf(null, early), null);
});

test('AC92 (c) (G5\'s review, B1), on `mix`\'s made-up project (NOT real), whose Build has two "Build-i1" runs: Build\'s line counts the sprints its Timeline folds draw, and its opened rows carry the same, M1, M2 and M2B as on the Timeline', async () => {
  const app = await openPage(mixState(), `#/p/${MIX_PROJECT}/timeline`);
  try {
    const folds = Object.fromEntries(findAll(app.view, (e) => e.tag === 'button' && e.attrs && /^Build-/.test(e.attrs['data-sprints'] || '')).map((f) => [f.attrs['data-sprints'], f.textContent]));
    assert.deepEqual(folds, { 'Build-i1:M1': '2 sprints · 2 not read', 'Build-i1:M2': '1 sprint · 1 not read', 'Build-i1:M2B': '2 sprints · 2 not read' });
    await app.go(`#/p/${MIX_PROJECT}`);
    assert.equal(detail(app, 'Build')[0], '0 of 8 reached · 4 sprints · 4 not read', 'PR #44 under M2 and M2B once: 4, as the Timeline draws them');
    await app.tap(fold(app, 'Build'));
    const open = keyed(app, 'stdl:Build');
    const row = (code) => byClass(findAll(open, (e) => e.attrs && e.attrs['data-ms'] === code)[0], 'v2-sms')[0].textContent;
    assert.deepEqual(['M1', 'M2', 'M2B'].map(row), ['work filed · gone back over · 2 sprints · 2 not read', 'work filed · gone back over · 1 sprint · 1 not read',
      'work filed · gone back over · 2 sprints · 2 not read'], 'each row\'s sprints as its Timeline fold');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// On Service-Desk's records at 77bfeae (real)

test('AC92 (c), on Service-Desk\'s records at 77bfeae (real): AC92 (c)\'s examples, Build "3 of 5 reached" over "Standard checklist: none tracked (5)" and Discovery "4 of 4 reached" over "4 tracked · 4 not tracked"; with every standard line "taken on" (ALL_24), Discovery still "4 of 4"; the head\'s sums; a pipeline item merged in the dispatch log; PR #44 under M2 and M2B, once in Build', () => {
  const { ctx, feed } = real();
  const mv = milestonesByPhase(ctx, { feed });
  const by = Object.fromEntries(mv.lines.map((l) => [l.phase, l]));
  assert.deepEqual(detailLines(by.Build.detail), ['3 of 5 reached · 4 sprints · 4 not read', 'Standard checklist: none tracked (5)']);
  assert.deepEqual(detailLines(by.Discovery.detail), ['4 of 4 reached · 7 sprints · 7 merged', 'Standard checklist: 4 tracked · 4 not tracked'],
    'Discovery\'s seven research items, each merged in the dispatch log');
  assert.deepEqual(mv.sum, { R: 8, T: 15 });
  assert.equal(PAGE_WORDS.milestonesHead(mv.sum), 'Milestones by phase · 8 of 15 reached');
  assert.equal(mv.sum.R, PHASES.reduce((a, ph) => a + by[ph].counts.R, 0));
  // PR #44 is listed under M2 and M2B (run 1): once in Build's count, under each one's fold.
  const b1 = ctx.cols.runs.find((r) => r.phase === 'Build' && r.iteration === 1);
  assert.deepEqual(b1.sprints.M2, ['PR #44']);
  assert.deepEqual(b1.sprints.M2B, ['PR #44', 'PR #52']);
  assert.deepEqual([milestoneSprints(feed, b1, 'M1').s, milestoneSprints(feed, b1, 'M2').s, milestoneSprints(feed, b1, 'M2B').s, by.Build.counts.sprints.s], [2, 1, 2, 4]);
  // Every standard line "taken on" (ac83-page.test.mjs's ALL_24, made up): a finished phase whose recordable ones were all
  // reached still reads "<T> of <T>", where draft 2's rule gave "4 of 8".
  const doc = j77Files()['docs/PROJECT.md'];
  const ALL = doc.replace(/^## 3\. The 25,000-foot plan\n/m, (h) => `${h}${STANDARD_MILESTONES.map(([id]) => `- ${id} (standard) · taken on · why: made up for the test, ${id}`).join('\n')}\n`);
  const all = real({ 'docs/PROJECT.md': ALL });
  const disc = milestonesByPhase(all.ctx, { feed: all.feed }).lines.find((l) => l.phase === 'Discovery');
  assert.equal(detailLines(disc.detail)[0].replace(/ · .*/, ''), '4 of 4 reached');
  assert.equal(detailLines(disc.detail)[1], 'Standard checklist: 4 tracked · 4 taken on, not recorded by the model');
});

/** Opens a project's page on a state and gives the app (its first reads answered). */
async function openPage(state, hash = `#/p/${SD.name}`) {
  const app = await loadSandbox({ ...state, hash, now: NOW });
  await app.advance(1000);
  await app.advance(POLL_MS);
  return app;
}
/** `text` with J12's built answer (NOT as GitHub sent it), so the pull requests are read. */
function withPulls() {
  const s = textState();
  s.repos[SD.name].pullsAnswer = pullsAnswer();
  return s;
}

test('AC92 (c), on the page: each phase\'s two lines and the head, as drawn, with the pull requests read (J12): every sprint the Timeline draws in the phase\'s runs counted, those under "Not tied to a milestone" among them; R and T the bold part', async () => {
  const app = await openPage(withPulls());
  try {
    assert.equal(byClass(keyed(app, 'ms-h'), 'v2-shw')[0].textContent, 'Milestones by phase · 8 of 15 reached');
    assert.deepEqual(PHASES.map((ph) => detail(app, ph)), [
      ['0 of 1 reached · no sprints filed yet', 'Standard checklist: none tracked (5)'],
      ['3 of 5 reached · 16 sprints · 16 merged', 'Standard checklist: none tracked (5)'],
      ['1 of 5 reached · 26 sprints · 26 merged', 'Standard checklist: 2 tracked · 4 not tracked'],
      ['4 of 4 reached · 38 sprints · 38 merged', 'Standard checklist: 4 tracked · 4 not tracked'],
    ]);
    // Build's 16: M1's two, M2's and M2B's three (PR #44 once) and run 1's twelve merged pull requests no plan line lists
    // (ac59-60-61-64-timeline.test.mjs: PR #42 to #58), each drawn under "Not tied to a milestone".
    assert.deepEqual(PHASES.map((ph) => findAll(byClass(fold(app, ph), 'v2-sd')[0], (e) => e.tag === 'b').map((b) => b.textContent)), [['0 of 1'], ['3 of 5'], ['1 of 5'], ['4 of 4']]);
  } finally {
    app.restore();
  }
});

test('AC92 (c), F1 and F2 (round 2\'s "Problems that were already there"), on `mix` with its made-up later Launch run (NOT real): Launch reads "0 of 2 reached" over "Standard checklist: 1 tracked · 4 not tracked" — Launch-3\'s recorded "not reached" tracked (F1), M3C, planned in the earlier run, counted (F2); the head "8 of 16 reached"', async () => {
  // The fixture's made-up lines (NOT real records), as glance-fixtures.mjs adds them.
  assert.equal(LATER_LAUNCH_LINES.length, 5);
  const { ctx, feed } = real({ 'dispatch-log/2026-10.jsonl': laterLaunchLog(j77Files()['dispatch-log/2026-10.jsonl']) });
  const launch = ctx.cols.runs.filter((r) => r.phase === 'Launch');
  assert.deepEqual(launch.map((r) => [r.iteration, ctx.state.get(r), r.project.map((m) => m.id).join(), r.standard.find((s) => s.id === 'Launch-3').state]),
    [[1, 'still to come', 'M3C', 'not recorded'], [2, 'still to come', '', 'not reached']], 'M3C in the earlier Launch run; Launch-3 "not reached" in the later one');
  const c = phaseCounts(ctx, 'Launch', feed);
  assert.deepEqual([c.R, c.T, c.k, c.q], [0, 2, 1, 4]);
  const app = await openPage(mixState({ laterLaunch: true }));
  try {
    assert.deepEqual(detail(app, 'Launch'), ['0 of 2 reached · no sprints filed yet', 'Standard checklist: 1 tracked · 4 not tracked']);
    assert.doesNotMatch(fold(app, 'Launch').textContent, /0 of 5|not recorded yet/, 'F1: never "0 of 5, not recorded yet"');
    assert.equal(byClass(keyed(app, 'ms-h'), 'v2-shw')[0].textContent, 'Milestones by phase · 8 of 16 reached', 'as round 2\'s mock read on its `mix`');
    await app.tap(fold(app, 'Launch'));
    const open = keyed(app, 'stdl:Launch');
    assert.deepEqual(byClass(open, 'v2-runh').map((x) => x.textContent), ['Run 3 · planned', 'Run 2 · planned']);
    assert.match(open.textContent, /Launch-3 It's handed overnot reached/, 'the later run lists Launch-3 "not reached"');
    assert.match(open.textContent, /M3C /, 'and the earlier run M3C');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The Timeline's fold, and an opened phase's row

test('AC92 (c) and AC84, changed: each milestone\'s fold on the Timeline reads its sprints in the one form, "<s> sprints · <m> merged" (the fold mark the chevron), its m equal to the ✓ merged marks it opens; a sprint under two milestones under each fold; "Not tied to a milestone" folds the same way', async () => {
  const app = await openPage(withPulls(), `#/p/${SD.name}/timeline`);
  try {
    const folds = findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['data-sprints'] && !/:named$/.test(e.attrs['data-sprints']));
    assert.ok(folds.length >= 6, `${folds.length} sprint folds`);
    const words = Object.fromEntries(folds.map((f) => [f.attrs['data-sprints'], f.textContent]));
    assert.equal(words['Build-i1:M1'], '2 sprints · 2 merged');
    assert.equal(words['Build-i1:M2'], '1 sprint · 1 merged', 'PR #44 under M2');
    assert.equal(words['Build-i1:M2B'], '2 sprints · 2 merged', 'and under M2B');
    assert.equal(words['Design-i2:MD1'], '1 sprint · 1 merged', 'Q-013, a pipeline item merged in the dispatch log');
    for (const f of folds) {
      const key = f.attrs['data-sprints'];
      assert.equal(byClass(f, 'vi-chev').length, 1, `${key}: its fold mark`);
      await app.tap(f);
      const opened = findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['data-sprints'] === key)[0];
      const box = opened.parent.children[opened.parent.children.indexOf(opened) + 1];
      const sprints = byClass(box, 'v2-sp');
      const ticks = sprints.filter((s) => byClass(s, 'v2-stats')[0].textContent.includes('✓ merged') || /✓\s*merged/.test(byClass(s, 'v2-stats')[0].textContent)).length;
      const m = /· (\d+) merged/.exec(opened.textContent);
      assert.equal(m ? Number(m[1]) : 0, ticks, `${key}: the fold's merged count equals its ✓ merged marks`);
      assert.equal(Number(/^(\d+) sprints?/.exec(opened.textContent)[1]), sprints.length, `${key}: its sprints count equals the sprints it opens`);
      await app.tap(opened);
    }
  } finally {
    app.restore();
  }
});

test('AC92 (c): an opened phase\'s row adds its sprints after its state words, "work filed · 1 sprint · 1 merged", in the one form, as the Timeline\'s fold counts them; a row with none adds nothing', async () => {
  const app = await openPage(withPulls());
  try {
    await app.tap(fold(app, 'Design'));
    const row = (code) => findAll(keyed(app, 'stdl:Design'), (e) => e.attrs && e.attrs['data-ms'] === code)[0];
    assert.equal(byClass(row('MD1'), 'v2-sms')[0].textContent, 'work filed · 1 sprint · 1 merged', 'as AC92 (c) writes it');
    assert.equal(byClass(row('MD2'), 'v2-sms')[0].textContent, 'work filed · 4 sprints · 4 merged');
    assert.equal(byClass(row('MD3'), 'v2-sms')[0].textContent, 'next to reach', 'no sprints: nothing added');
    assert.equal(byClass(row('Design-6'), 'v2-sms')[0].textContent, 'not recorded yet', 'a standard row with none: nothing added');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Details' CI line

/** Made-up workflow runs on the head (NOT real records), as J1 reads them: [path, status, conclusion]. */
const run = (name, status, conclusion, n = 1) => ({ path: `.github/workflows/${name}.yml`, name, status, conclusion, runNumber: n, at: null });

test('AC92 (c): Details\' CI line — "CI on <branch>: <AC29\'s state> · <y> of <x> workflows passed", ", <z> running" when z is 1 or more; y counts success, neutral, skipped, cancelled and stale; the deploy, Orchestrator and notification runs left out; no part when x is 0, AC29\'s state is "none" or the runs aren\'t read', () => {
  const P = { defaultBranch: 'main' };
  const line = (runs) => {
    const red = reduceWorkflowRuns(runs);
    return ciWords(P, { ci: red.ci, ciCounts: red.counts });
  };
  const ACTIVITY = [run('desk-deploy', 'waiting', null), run('orchestrator', 'completed', 'cancelled'), run('desk-notify', 'completed', 'failure')];
  assert.equal(line([run('tests', 'completed', 'success'), run('governance', 'completed', 'success'), ...ACTIVITY]), 'CI on main: passing · 2 of 2 workflows passed', 'passing; the three activity workflows left out');
  assert.equal(line([run('tests', 'completed', 'failure'), run('governance', 'completed', 'success'), ...ACTIVITY]), 'CI on main: failing · 1 of 2 workflows passed', 'failing');
  assert.equal(line([run('tests', 'in_progress', null), run('governance', 'completed', 'success'), run('lint', 'queued', null)]), 'CI on main: running · 1 of 3 workflows passed, 2 running', 'running');
  assert.equal(line([run('tests', 'completed', 'success'), run('docs', 'completed', 'skipped'), run('nightly', 'completed', 'cancelled')]), 'CI on main: passing · 3 of 3 workflows passed',
    'skipped and cancelled count as not failing (NOT_FAILING), so "passing" never stands beside a lower count');
  assert.equal(line([run('tests', 'completed', 'success')]), 'CI on main: passing · 1 of 1 workflow passed', 'one workflow');
  assert.equal(line([run('tests', 'completed', 'success', 1), run('tests', 'completed', 'failure', 2)]), 'CI on main: failing · 0 of 1 workflow passed', 'the latest run per workflow');
  assert.equal(line([run('docs', 'completed', 'skipped')]), 'CI on main: none', 'AC29\'s "none": no part');
  assert.equal(line(ACTIVITY), 'CI on main: none', 'no counted workflow (x of 0): no part');
  assert.deepEqual(ciCounts([run('a', 'completed', 'neutral'), run('b', 'completed', 'stale'), run('c', 'completed', 'timed_out'), run('d', 'waiting', null)]), { x: 4, y: 2, z: 1 });
  assert.equal(ciWords(P, { ci: 'not read yet', ciCounts: null }), 'CI on main: not read yet', 'not read: no part');
  assert.equal(ciWords(P, null), 'CI on main: not available', 'no model: "not available"');
  assert.equal(ciPassed({ ci: 'passing', ciCounts: { x: 2, y: 2, z: 0 } }), ' · 2 of 2 workflows passed');
});

test('AC92 (c), on the page: Details\' CI line from the head\'s workflow runs (made up, NOT real), the counted list kept in the model', async () => {
  const s = textState();
  s.repos[SD.name].runs = [{ name: 'governance', status: 'completed', conclusion: 'success' }, { name: 'desk-tests', status: 'completed', conclusion: 'success' },
    { name: 'lint', status: 'in_progress', conclusion: null }, { name: 'desk-deploy', status: 'waiting', conclusion: null }, { name: 'orchestrator', status: 'completed', conclusion: 'skipped' }];
  const app = await openPage(s);
  try {
    const d = keyed(app, 'more-detail-fold');
    const ci = findAll(d, (e) => e.tag === 'p' && /^CI on /.test(e.textContent))[0];
    assert.equal(ci.textContent, 'CI on main: running · 2 of 3 workflows passed, 1 running');
    assert.match(ci.className, /\bv2-small\b/);
  } finally {
    app.restore();
  }
  const page = readFileSync(join(SRC, 'public', 'sandbox.js'), 'utf8');
  assert.match(page, /`CI on \$\{project\.defaultBranch\}: \$\{model \? model\.ci : NOT_AVAILABLE\}`, ciPassed\(model\)\)/, 'drawn in one line after AC29\'s state');
});
