// J11's reached part (spec S-001, model 3.5.0's records, 2026-10-17; model S-033 AC7, L-0016): the
// milestone reader takes ` · reached: <yyyy-mm-dd>` where the model's form puts it and skips exactly
// the lines the model's reader skips; AC50, AC57, AC59, AC65 and AC68 show "reached" with its date,
// the lighter fill in a run gone back over, and count a reached milestone as work filed for the now
// run and the next to reach.
//
// J11's reached fixture (tests/desk/fixtures/j11-reached/, NOT a real record): J11's docs/PROJECT.md
// with M1's line ending ` · reached: 2026-10-07` and MD2's ` · reached: 2026-10-16`, plus four lines
// out of form; its `both/` copy adds a line both reached and dropped and a reached line with a why.
// The model's verdict on every line is model-verdicts.json, made by `milestone_lines` itself
// (tests/desk/fixtures/README.md gives the command).
// join-test: S-001/J11
// ac-test: S-001/AC50 ac-test: S-001/AC57 ac-test: S-001/AC59 ac-test: S-001/AC65 ac-test: S-001/AC68
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIX } from './helpers.mjs';
import { traceNotes, j11Files } from './sandbox-helpers.mjs';
import { models, openSD, keyed, byClass, findAll } from './tv2-fixtures.mjs';
import { milestoneLines, parseProjectDoc, validDate } from '../../src/lib/j11.js';
import { nowRun, nowRule, whereLine, reachedDateWords, projectMilestoneWord } from '../../src/lib/sandbox.js';
import { statusPhases, tilePhases, markerView, STATUS_KEY, FEED_ICONS_KEY } from '../../src/lib/feed.js';

const DIR = join(FIX, 'j11-reached');
const REACHED = readFileSync(join(DIR, 'docs', 'PROJECT.md'), 'utf8');
const BOTH = readFileSync(join(DIR, 'both', 'docs', 'PROJECT.md'), 'utf8');
const VERDICTS = JSON.parse(readFileSync(join(DIR, 'model-verdicts.json'), 'utf8'));
const verdict = (which) => VERDICTS[`tests/desk/fixtures/j11-reached/${which}docs/PROJECT.md`];
const NOW16 = Date.parse('2026-10-16T18:00:00Z');
const reachedModels = (doc = REACHED, now = NOW16) => models({ extra: { 'docs/PROJECT.md': doc }, now });

const boxOf = (sv, phase) => sv.boxes.find((b) => b.phase === phase);
const runOf = (sv, phase, i) => boxOf(sv, phase).runs.find((r) => r.head.startsWith(`${phase} i${i} `));
const msOf = (run, code) => [...run.milestones, ...run.standard, ...run.gathered].find((m) => m.code === code);
const block = (feed, key) => feed.blocks.find((b) => b.key === key);
const rowsOf = (b) => [...(b.plannedRows || []), ...b.rows];
const feedRow = (feed, key, code) => rowsOf(block(feed, key)).find((x) => x.code === code);

// ---------------------------------------------------------------------------
// J11: the reader, against the model's own

test('J11 (reached): the desk reads and skips exactly the lines the model\'s `milestone_lines` reads and skips, with each date, in both fixtures', () => {
  for (const [which, text] of [['', REACHED], ['both/', BOTH]]) {
    const model = verdict(which);
    const desk = milestoneLines(text);
    assert.deepEqual(desk.milestones.map((m) => [m.lineno, m.id, m.reached, m.dropped, m.why, m.sprints]),
      model.read.map((m) => [m.lineno, m.id, m.reached, m.dropped, m.why, m.sprints]), `${which || 'main'}: the lines read, with their parts`);
    const skipped = desk.problems.filter((p) => !/marked both reached and dropped/.test(p.message)).map((p) => p.lineno);
    assert.deepEqual(skipped, model.skipped.map((p) => p.lineno), `${which || 'main'}: the lines skipped`);
  }
  const ms = milestoneLines(REACHED).milestones;
  assert.equal(ms.find((m) => m.id === 'M1').reached, '2026-10-07');
  assert.deepEqual(ms.find((m) => m.id === 'M1').sprints, ['PR #40', 'PR #41'], 'its sprints still read');
  assert.equal(ms.find((m) => m.id === 'MD2').reached, '2026-10-16');
  assert.equal(ms.find((m) => m.id === 'MD3').reached, null);
  for (const id of ['MX1', 'MX2', 'MX3', 'MX4']) assert.ok(!ms.some((m) => m.id === id), `${id} is out of form: skipped`);
});

test('J11 (reached): each out-of-form case on its own — no real date, before ` · sprints:`, after ` · dropped`, after ` · why:` — skipped with a note; the rest still shown', () => {
  const doc = (line) => `# Part 1\n\n## 3. The plan\n\n- A real one (MA1) · done when it is · phase: Build\n${line}\n`;
  const cases = {
    'no real date': '- Bad date (MB1) · done when x · phase: Build · reached: 2026-02-30',
    'not a date at all': '- Bad date (MB1) · done when x · phase: Build · reached: 7 Oct',
    'before sprints': '- Early (MB1) · done when x · phase: Build · reached: 2026-10-07 · sprints: PR #40',
    'after dropped': '- Late (MB1) · done when x · phase: Build · dropped · reached: 2026-10-07',
    'after why': '- After why (MB1) · done when x · phase: Build · why: a reason · reached: 2026-10-07',
  };
  for (const [what, line] of Object.entries(cases)) {
    const r = milestoneLines(doc(line));
    assert.deepEqual(r.milestones.map((m) => m.id), ['MA1'], `${what}: the rest still shown`);
    assert.equal(r.problems.length, 1, `${what}: one note`);
    assert.equal(r.problems[0].lineno, 6);
  }
  // In its place, after sprints and before dropped and why, it is read.
  const ok = milestoneLines(doc('- Fine (MB1) · done when x · phase: Build · for: P-002 · sprints: PR #40 · reached: 2024-02-29 · why: the owner said so'));
  assert.deepEqual(ok.milestones.map((m) => [m.id, m.forItem, m.sprints, m.reached, m.why]), [['MA1', null, [], null, null], ['MB1', 'P-002', ['PR #40'], '2024-02-29', 'the owner said so']]);
  assert.equal(ok.problems.length, 0, 'a leap day is a real date');
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(validDate('2024-02-29'), true);
  assert.equal(validDate('2026-13-01'), false);
  assert.equal(validDate('2026-10-00'), false);
});

test('J11 (reached): a line both reached and dropped is read, shown as dropped, and named in the project\'s notes', () => {
  const doc = parseProjectDoc(BOTH);
  const mx5 = doc.milestones.find((m) => m.id === 'MX5');
  assert.deepEqual([mx5.reached, mx5.dropped], ['2026-10-07', true]);
  const note = doc.problems.find((p) => p.lineno === mx5.lineno);
  assert.ok(note && /MX5 is marked both reached and dropped/.test(note.message), 'named in the record notes');
  const { ctx } = reachedModels(BOTH);
  const d2 = runOf(statusPhases(ctx, 'UTC'), 'Design', 2);
  assert.deepEqual([msOf(d2, 'MX5').words, msOf(d2, 'MX5').mark], ['Dropped', 'dashed'], 'AC57\'s rule 1');
  assert.equal(projectMilestoneWord(d2, mx5), 'dropped');
  // The reached line with a why keeps its why.
  assert.equal(msOf(d2, 'MX6').why.text, 'why: the owner accepted it in the trial view');
  assert.equal(msOf(d2, 'MX6').words, 'Reached 15 Oct · work filed: PR #54');
});

test('J11 (reached): `v3_checks.py trace` printed J11\'s NOTE lines unchanged for the reached fixture (recorded); the page\'s timeline agrees', () => {
  const { tl } = reachedModels();
  assert.deepEqual(tl.lines(), traceNotes(), 'the page\'s timeline for the reached fixture prints J11\'s NOTE lines');
  const readme = readFileSync(join(FIX, 'README.md'), 'utf8');
  assert.match(readme, /j11-reached\/docs\/PROJECT\.md[\s\S]*prints J11's `NOTE:` lines unchanged/, 'the recording is listed with its command');
});

// ---------------------------------------------------------------------------
// AC50: the now run, the next to reach, the date

test('AC50 (reached): M1 "reached 7 Oct" with its sprints; MD2 "reached 16 Oct"; MD2 neither makes its run now nor is next to reach (MD3 is); with J11\'s fixture as it is, nothing reads "reached"', () => {
  const { ctx, tl, pv } = reachedModels();
  assert.equal(nowRun(tl).label(), 'Design i2', 'MD3 still has no work filed, so Design i2 is still now');
  assert.equal(nowRule(tl), 'open');
  assert.equal(ctx.next.id, 'MD3', 'MD2, marked reached, counts as work filed');
  const sv = statusPhases(ctx, 'UTC');
  assert.equal(msOf(runOf(sv, 'Build', 1), 'M1').words, 'Reached 7 Oct · work filed: PR #40, #41');
  assert.equal(msOf(runOf(sv, 'Design', 2), 'MD2').words, 'Reached 16 Oct');
  assert.equal(msOf(runOf(sv, 'Design', 2), 'MD3').words, 'No work filed yet · next to reach');
  const b1 = tl.runs().find((r) => r.label() === 'Build i1');
  assert.equal(projectMilestoneWord(b1, b1.project.find((m) => m.id === 'M1'), NOW16, 'UTC'), 'reached 7 Oct');
  // AC37 / AC50: a reached milestone is never upcoming work.
  assert.deepEqual(whereLine({ model: 'v3' }, null, tl, pv).parts.find((p) => p.label === 'Upcoming').text, "The chosen design running on the real back end");
  // With J11's fixture as it is, no milestone reads "reached".
  const plain = models({ now: NOW16 });
  const all = statusPhases(plain.ctx, 'UTC').boxes.flatMap((b) => b.runs.flatMap((r) => r.milestones));
  assert.ok(all.length > 0 && all.every((m) => !/reached/i.test(m.words)), 'no project milestone says "reached"');
  assert.equal(plain.ctx.next.id, 'MD2');
});

test('AC50 (reached): the date as written, "7 Oct", with the year when it is not this year, never moved by a time zone', () => {
  assert.equal(reachedDateWords('2026-10-07', NOW16, 'UTC'), '7 Oct');
  assert.equal(reachedDateWords('2026-10-07', NOW16, 'Pacific/Kiritimati'), '7 Oct', 'the calendar date, not a time');
  assert.equal(reachedDateWords('2026-10-07', NOW16, 'Pacific/Pago_Pago'), '7 Oct');
  assert.equal(reachedDateWords('2025-12-31', NOW16, 'UTC'), '31 Dec 2025');
  assert.equal(reachedDateWords('2027-01-02', NOW16, 'UTC'), '2 Jan 2027');
  // "This year" is the owner's: on 31 Dec 23:30 in Chicago it is still 2026 there.
  assert.equal(reachedDateWords('2026-12-31', Date.parse('2027-01-01T05:30:00Z'), 'America/Chicago'), '31 Dec');
});

test('AC50 (reached): every milestone of the now run reached moves the now run on: Build i2, next to reach M3A', () => {
  const doc = REACHED.replace(/(\(MD3\) · done when [^\n]* · phase: Design)\n/, '$1 · reached: 2026-10-16\n');
  const { ctx, tl } = reachedModels(doc);
  assert.equal(nowRun(tl).label(), 'Build i2');
  assert.equal(ctx.next.id, 'M3A');
  assert.equal(markerView(ctx).next, 'now · next to reach: M3A', 'AC68');
  assert.equal(tilePhases(ctx).line, 'Build, second time through', 'AC65: only through the now run');
});

// ---------------------------------------------------------------------------
// AC57: the Status screen's words and marks

test('AC57 (reached): M1 in Build i1 the lighter fill with "Reached 7 Oct · work filed: PR #40, #41"; MD2 filled, "Reached 16 Oct"; MD3 the one gold ring; the key\'s "reached" entry unchanged', () => {
  const { ctx } = reachedModels();
  const sv = statusPhases(ctx, 'UTC');
  const m1 = msOf(runOf(sv, 'Build', 1), 'M1');
  assert.deepEqual([m1.mark, m1.words, m1.rule], ['light', 'Reached 7 Oct · work filed: PR #40, #41', 4]);
  const md2 = msOf(runOf(sv, 'Design', 2), 'MD2');
  assert.deepEqual([md2.mark, md2.words, md2.rule], ['filled', 'Reached 16 Oct', 5]);
  const golds = sv.boxes.flatMap((b) => b.runs.flatMap((r) => r.milestones)).filter((m) => m.mark === 'gold');
  assert.deepEqual(golds.map((m) => m.code), ['MD3']);
  assert.deepEqual(STATUS_KEY.milestones.find(([, w]) => w === 'reached'), ['filled', 'reached']);
  // M2, with work filed and not reached, keeps its words.
  assert.equal(msOf(runOf(sv, 'Build', 1), 'M2').words, 'Work filed: PR #44');
});

test('AC57 (reached): M3A in Build i2, a run still to come, marked ` · reached: 2026-10-16` in a copy made for this case alone, filled with "Reached 16 Oct", not "Still to come"', () => {
  const doc = REACHED.replace(/(\(M3A\) · done when [^\n]* · phase: Build)\n/, '$1 · reached: 2026-10-16\n');
  assert.notEqual(doc, REACHED);
  const { ctx } = reachedModels(doc);
  const b2 = runOf(statusPhases(ctx, 'UTC'), 'Build', 2);
  assert.ok(b2.head.endsWith('still to come'));
  assert.deepEqual([msOf(b2, 'M3A').mark, msOf(b2, 'M3A').words], ['filled', 'Reached 16 Oct']);
  assert.deepEqual([msOf(b2, 'M3B').mark, msOf(b2, 'M3B').words], ['empty', 'No work filed yet'], 'its neighbour is still to come');
});

test('AC57 (reached): the page draws the words and marks on the Status screen', async () => {
  const app = await openSD('#/p/Service-Desk', { repoOpts: { extra: { 'docs/PROJECT.md': REACHED } } });
  try {
    const text = app.text();
    assert.ok(text.includes('Reached 7 Oct · work filed: PR #40, #41'), 'M1');
    assert.ok(text.includes('Reached 16 Oct'), 'MD2');
    assert.ok(text.includes('No work filed yet · next to reach'), 'MD3');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC59: the Timeline

test('AC59 (reached): M1\'s lighter check "reached 7 Oct · gone back over"; MD2 a check "reached 16 Oct", below the Now line by that date; MD3 the one gold ring; J11\'s fixture as it is reads no "reached"', () => {
  const { feed } = reachedModels();
  const m1 = feedRow(feed, 'Build-i1', 'M1');
  assert.deepEqual([m1.icon, m1.words], ['pastcheck', 'reached 7 Oct · gone back over']);
  const d2 = block(feed, 'Design-i2');
  const md2 = feedRow(feed, 'Design-i2', 'MD2');
  assert.deepEqual([md2.icon, md2.words, md2.fold], ['check', 'reached 16 Oct', 'No sprints filed yet']);
  assert.deepEqual(d2.plannedRows.map((x) => x.code), ['MD3'], 'MD2 is no longer planned above Now');
  assert.ok(d2.rows.some((x) => x.code === 'MD2'), 'MD2 sits below the Now line');
  const below = d2.rows.map((x) => x.code || x.kind);
  assert.ok(below.indexOf('MD2') < below.indexOf('MD1'), 'by its date (16 Oct), above MD1, whose sprint is dated earlier');
  const golds = feed.blocks.flatMap((b) => rowsOf(b)).filter((x) => x.icon === 'next');
  assert.deepEqual(golds.map((x) => x.code), ['MD3']);
  assert.deepEqual(FEED_ICONS_KEY.find(([k]) => k === 'check'), ['check', 'reached']);
  // M1's place is its latest sprint's date, as before: marking it reached never moves it.
  const plain = models({ now: NOW16 }).feed;
  assert.deepEqual(rowsOf(block(feed, 'Build-i1')).map((x) => x.code || x.kind), rowsOf(block(plain, 'Build-i1')).map((x) => x.code || x.kind));
  assert.ok(plain.blocks.flatMap((b) => rowsOf(b)).filter((x) => x.kind === 'ms' && /^M/.test(x.code)).every((x) => !/reached/.test(x.words)));
});

test('AC59 (reached): the page draws "reached 16 Oct" on the Timeline', async () => {
  const app = await openSD('#/p/Service-Desk/timeline', { repoOpts: { extra: { 'docs/PROJECT.md': REACHED } } });
  try {
    assert.ok(app.text().includes('reached 16 Oct'));
    assert.ok(app.text().includes('reached 7 Oct · gone back over'));
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC65 and AC68: only through the now run and the ring

test('AC65 and AC68 (reached): the Home tile and the phase marker show no "reached" of their own; with M1 and MD2 reached they read as before', () => {
  const plain = models({ now: NOW16 });
  const { ctx } = reachedModels();
  const a = tilePhases(plain.ctx);
  const b = tilePhases(ctx);
  assert.equal(b.line, a.line);
  assert.deepEqual(b.rows.map((r) => r.word), a.rows.map((r) => r.word));
  assert.deepEqual(b.shape.dots.map((d) => d.icon), a.shape.dots.map((d) => d.icon), 'the gold ring stays on the now run: MD3 is next to reach');
  assert.ok(![b.line, ...b.rows.map((r) => r.word)].some((w) => /reached/i.test(w)), 'no "reached" on the card');
  assert.equal(markerView(ctx).next, 'now · next to reach: MD3');
  assert.equal(markerView(plain.ctx).next, 'now · next to reach: MD2');
});

test('AC68 (reached): every milestone reached or with work filed gives "now · next to reach: none, every milestone has work filed"', () => {
  let doc = REACHED;
  for (const id of ['MD3', 'M3A', 'M3B', 'M3C']) doc = doc.replace(new RegExp(`(\\(${id}\\) · done when [^\\n]* · phase: \\w+)\\n`), '$1 · reached: 2026-10-16\n');
  const { ctx } = reachedModels(doc);
  assert.equal(ctx.rule, 'latest');
  assert.equal(markerView(ctx).next, 'now · next to reach: none, every milestone has work filed');
});

test('J11 (reached): the page\'s record notes name the line both reached and dropped', async () => {
  const app = await openSD('#/p/Service-Desk/notes', { repoOpts: { extra: { 'docs/PROJECT.md': BOTH } } });
  try {
    assert.ok(/MX5 is marked both reached and dropped/.test(app.text()), app.text().slice(0, 400));
  } finally {
    app.restore();
  }
});

test('J11 (reached): the fixture files are J11\'s docs/PROJECT.md with only the reached parts and the listed lines added', () => {
  const orig = j11Files()['docs/PROJECT.md'].split('\n');
  const mine = REACHED.split('\n');
  const changed = mine.filter((l) => !orig.includes(l));
  assert.equal(changed.length, 6, 'M1, MD2 and four out-of-form lines');
  assert.ok(changed.every((l) => / · reached: /.test(l)));
  const gone = orig.filter((l) => !mine.includes(l));
  assert.deepEqual(gone.map((l) => /\((M1|MD2)\)/.exec(l)[1]), ['M1', 'MD2']);
});
