// ac-test: S-001/AC97 — each value target against its measure (stage VT1 of "The desk's value targets shown: M3B"): the
// goals and short names fixed for Service-Desk's five, each checked against its section 6 line; each target's scale and
// goal tick; its figure words and verdict line in each phase, before launch, on launch day, in the window and after it,
// as AC97's two tables give them; the desk's verdict at, under and past each goal; the check's met or missed winning, with
// "The desk's own reading"; V4 judged from launch day; V5 grey before W1; a recorded `not measured`; V5 with no figure and
// with its figure gone; other projects; the row's words in each of its states 0 to 8 on a fake clock, day by day, for
// launches on different weekdays, its parts adding up and its left icon by its one rule; no date of the desk's own before
// launch; and the miss and stop rule quoted. Pure: lib/values.js and lib/j11.js on Service-Desk's section 3 and 6 lines
// as CS36 left them at 7b69b2b (tests/desk/fixtures/j11-7b69b2b/, real) and made-up J25 lines and cards (NOT real
// records: tests/desk/vt1-fixtures.mjs). The page's drawing of all this is ac97-values-page.test.mjs's.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, CONFIG } from './helpers.mjs';
import { parseProjectDoc, stopRule } from '../../src/lib/j11.js';
import { parseRecord } from '../../src/lib/model.js';
import { cardRows, v5Waits } from '../../src/lib/asked.js';
import { valuesView, readValueChecks, parseValueChecks, GOALS, windowDays, dueOf, rangeWords, phaseOf, addDays, hm } from '../../src/lib/values.js';
import { restRows } from '../../src/lib/projectpage.js';
import { v3 } from './sandbox-fixtures.mjs';
import { J7B_DOC, J7B_LINES, LAUNCH, withLaunch, chi, vc, jsonl, DAY5, FINAL, cardsLog, windowCards, novemberCards, docWithTargets, ALPHA_TARGETS, SD, POOM, TZ } from './vt1-fixtures.mjs';

const ALPHA = v3('Alpha');
const PROJECTS = [SD, POOM, ALPHA];
const DOC = (L = LAUNCH) => parseProjectDoc(L ? withLaunch(J7B_DOC, L) : J7B_DOC);
const ALPHA_DOC = parseProjectDoc(docWithTargets(ALPHA_TARGETS));
const ids = (doc) => new Set(doc.valueTargets);

/** V5's input (v5Figure's): Service-Desk's cards (made up) as its model holds them, read, and Alpha read with none. */
function v5In(cards, nowMs, { notRead = false } = {}) {
  const months = new Map();
  for (const c of cards) {
    const m = new Date(c.raised).toISOString().slice(0, 7);
    if (!months.has(m)) months.set(m, []);
    months.get(m).push(c);
  }
  let entries = [];
  const tree = new Map();
  for (const [m, cs] of [...months].sort()) {
    const l = cardsLog(cs);
    entries = entries.concat(parseRecord('log', l.log, `dispatch-log/${m}.jsonl`).entries);
    for (const p of Object.keys(l.files)) tree.set(p, { sha: p });
  }
  const model = { logLoaded: true, allEntries: entries, v5Waits: v5Waits(cardRows(entries, tree, nowMs), nowMs, CONFIG) };
  return { config: { ...CONFIG, ownerTimeZone: TZ }, projects: [
    { name: SD.name, v3: true, readOk: !notRead, model, tree },
    { name: POOM.name, v3: false, readOk: true, model: null, tree: new Map() },
  ] };
}

/** The planning project's view on a day (`now` a day, noon in Chicago, or a time), with J25's `lines` and the window's `cards`. */
function sd({ now, L = LAUNCH, lines = [], state = 'ok', cards = windowCards(), notRead = false, doc = null }) {
  const nowMs = typeof now === 'string' ? chi(now) : now;
  const d = doc || DOC(L);
  const read = readValueChecks({ lines: parseValueChecks(jsonl(lines)), nowMs, projects: PROJECTS, targetsOf: (n) => (n === SD.name ? ids(d) : n === 'Alpha' ? ids(ALPHA_DOC) : null) });
  const j25 = state === 'ok' ? { state, ...read } : { state, checks: new Map(), unreadable: new Map() };
  return valuesView({ project: SD, doc: d, planning: true, j25, v5In: v5In(cards, nowMs, { notRead }), nowMs, tz: TZ });
}
/** Alpha's view (another v3 project): its section 6 made up, its lines in Service-Desk's file. */
function alpha({ now = '2026-12-07', lines = [], state = 'ok', doc = ALPHA_DOC }) {
  const nowMs = chi(now);
  const read = readValueChecks({ lines: parseValueChecks(jsonl(lines)), nowMs, projects: PROJECTS, targetsOf: (n) => (n === 'Alpha' ? ids(doc) : ids(DOC())) });
  return valuesView({ project: ALPHA, doc, planning: false, j25: state === 'ok' ? { state, ...read } : { state }, nowMs, tz: TZ });
}
const T = (v, id) => v.targets.find((t) => t.id === id);
const verdict = (t) => `${t.verdict.first}${t.verdict.second ? ` · ${t.verdict.second}` : ''}`;
const fig = (t) => (t.figure ? [t.figure.big, t.figure.words] : null);
const A = (target, o) => vc({ target, project: 'Alpha', ...o });

// ---------------------------------------------------------------------------
// The goals, the scales and the ticks

/** Each goal against the section 6 line it comes from (AC97, "The goals"): a reworded line fails until the goal follows. */
function checkGoals(lines) {
  for (const id of ['V1', 'V2', 'V3', 'V4', 'V5']) {
    const line = lines.find((l) => l.startsWith(`${id}:`));
    assert.equal(line, GOALS[id].line, `${id}'s goal comes from its line as CS36 left it`);
  }
}

test('AC97: the goals and short names fixed for Service-Desk\'s five, each checked against its section 6 line at 7b69b2b (j11-7b69b2b, real); a reworded line fails the check', () => {
  checkGoals(J7B_LINES);
  assert.deepEqual(Object.fromEntries(Object.entries(GOALS).map(([id, g]) => [id, [g.name, g.words]])), {
    V1: ['Missed decisions', 'none missed in the 14 days'], V2: ['False alarms', 'at most 1 a week'], V3: ['Your upkeep', 'at most 30 minutes a week'],
    V4: ['Replacement', 'both at launch'], V5: ['Your response time', 'under 4h'] });
  // Each number the desk judges by is the one its line writes.
  assert.match(GOALS.V1.line, /, 0 over the first 14 days after launch$/);
  assert.equal(GOALS.V1.max, 0);
  assert.match(GOALS.V2.line, /at most 1 a week over/);
  assert.equal(GOALS.V2.max, 1);
  assert.match(GOALS.V3.line, /at most 30 minutes a week after launch$/);
  assert.equal(GOALS.V3.max, 30);
  assert.match(GOALS.V5.line, /, under 4 hours, over the first 14 days after launch$/);
  assert.equal(GOALS.V5.under, 240);
  assert.match(GOALS.V4.line, /the desk serves the Operations-Hub address and the old repository is archived, at launch$/);
  // A reworded line (made up): the check fails until the goal follows.
  assert.throws(() => checkGoals(J7B_LINES.map((l) => l.replace('at most 1 a week', 'at most 2 a week'))), /V2's goal/);
  assert.throws(() => checkGoals(J7B_LINES.map((l) => l.replace('under 4 hours', 'under 3 hours'))), /V5's goal/);
});

test('AC97: each target\'s scale and goal tick as the approved picture draws them — V1 0 to 3, tick at 0; V2 0 to 3, tick at a third; V3 0 to 60 minutes, tick half way; V5 0 to 8 hours, tick half way — with the goal\'s label', () => {
  assert.deepEqual(Object.fromEntries(['V1', 'V2', 'V3', 'V5'].map((id) => [id, [GOALS[id].scale, GOALS[id].tick, GOALS[id].at, GOALS[id].label]])), {
    V1: [3, 0, '0', 'goal 0'], V2: [3, 1, '33', 'goal ≤ 1'], V3: [60, 30, '50', 'goal ≤ 30m'], V5: [480, 240, '50', 'goal < 4h'] });
  for (const id of ['V1', 'V2', 'V3', 'V5']) assert.equal(Math.round((GOALS[id].tick / GOALS[id].scale) * 1000) / 10, { V1: 0, V2: 33.3, V3: 50, V5: 50 }[id], `${id}'s tick`);
  const v = sd({ now: '2026-12-07', lines: DAY5 });
  assert.deepEqual(['V1', 'V2', 'V3', 'V5'].map((id) => [T(v, id).chart.at, T(v, id).chart.label]), [['0', 'goal 0'], ['33', 'goal ≤ 1'], ['50', 'goal ≤ 30m'], ['50', 'goal < 4h']]);
});

test('AC97: the bars — a width by the scale, a measured zero a 4 px stub, a value past the scale filling the track with "<v>, past the scale", one bar per week, V5\'s two labelled bars; no chart for anything unmeasured', () => {
  const lines = [
    vc({ target: 'V1', from: '2026-12-03', to: '2026-12-06', value: 0 }),
    vc({ target: 'V2', from: '2026-12-03', to: '2026-12-06', value: 6 }),
    vc({ target: 'V3', from: '2026-12-03', to: '2026-12-06', value: 45 }),
    vc({ target: 'V3', from: '2026-12-07', to: '2026-12-13', value: 75 }),
    vc({ target: 'V5', from: '2026-12-03', to: '2026-12-06', value: 600 }),
  ];
  const v = sd({ now: '2026-12-14', lines });
  assert.deepEqual(T(v, 'V1').chart.bars.map((b) => [b.label, b.value, b.zero, b.width, b.fill]), [['So far', '0', true, 0, 'ok']]);
  assert.deepEqual(T(v, 'V2').chart.bars.map((b) => [b.label, b.value, b.past, b.width, b.fill]), [['3 – 6 Dec', '6, past the scale', true, 100, 'bad']]);
  assert.deepEqual(T(v, 'V3').chart.bars.map((b) => [b.label, b.value, b.width, b.fill]), [['3 – 6 Dec', '45m', 75, 'bad'], ['7 – 13 Dec', '75m, past the scale', 100, 'bad']]);
  const v5 = T(v, 'V5').chart.bars;
  assert.deepEqual(v5.map((b) => b.label), ['Live so far', 'Weekly check']);
  assert.deepEqual(v5[1], { label: 'Weekly check', value: '10h 00m, past the scale', width: 100, zero: false, past: true, fill: 'bad' });
  // V2's 2 a third of the way past its tick: two thirds of the track.
  const two = sd({ now: '2026-12-07', lines: DAY5 });
  assert.equal(Math.round(T(two, 'V2').chart.bars[0].width * 100) / 100, 66.67);
  assert.equal(T(two, 'V3').chart.bars[0].width, (20 / 60) * 100);
  // Nothing measured, no chart.
  const none = sd({ now: '2026-12-07', lines: [] });
  for (const id of ['V1', 'V2', 'V3']) assert.equal(T(none, id).chart, null, id);
  assert.equal(T(none, 'V4').chart, null, 'V4 has steps, never a bar');
});

// ---------------------------------------------------------------------------
// Each phase's words (AC97's two tables)

test('AC97, before launch: V1 to V3 "Not measured yet · measured from launch" over "Goal: …", no figure or chart; V4\'s two steps "not yet", "Not measured yet · goal: both at launch"; V5 AC21\'s figure in grey, "median, last 14 days, <k> weekday cards", "Before launch, not counted · goal: under 4h", "Measured over the first 14 days after launch"', () => {
  const now = chi('2026-11-27', '15:00');
  const v = sd({ now, L: null, cards: novemberCards() });
  assert.equal(v.phase, 'before');
  for (const id of ['V1', 'V2', 'V3']) {
    const t = T(v, id);
    assert.equal(verdict(t), 'Not measured yet · measured from launch', id);
    assert.equal(t.verdict.mark, 'planned');
    assert.deepEqual(t.lines, [`Goal: ${GOALS[id].words}`]);
    assert.equal(t.figure, null);
    assert.equal(t.chart, null);
  }
  const v4 = T(v, 'V4');
  assert.deepEqual(v4.steps, [{ mark: 'planned', words: 'Serving the Operations-Hub address: not yet' }, { mark: 'planned', words: 'Old repository archived: not yet' }]);
  assert.equal(verdict(v4), 'Not measured yet · goal: both at launch');
  assert.equal(v4.figure, null);
  const v5 = T(v, 'V5');
  // Nine weekday cards (made up), each counted from 10:00: 0.5h to 3h; their median 1h 12m (1.2 h), AC21's rounding.
  assert.deepEqual(fig(v5), ['1h 12m', 'median, last 14 days, 9 weekday cards']);
  assert.deepEqual(v5.chart.bars.map((b) => [b.label, b.value, b.fill]), [['Before launch', '1h 12m', 'grey']]);
  assert.equal(v5.verdict.mark, 'planned', 'the planned ring, never green before W1');
  assert.equal(verdict(v5), 'Before launch, not counted · goal: under 4h');
  assert.deepEqual(v5.lines, ['Measured over the first 14 days after launch']);
  // A reached date still ahead of today leaves the desk before launch (round 4, the Reviewer's N1).
  const ahead = sd({ now, L: '2026-11-30', cards: novemberCards() });
  assert.equal(ahead.phase, 'before');
  assert.equal(ahead.row.words, 'Measured from launch · V4, replacing the old page, at launch');
});

test('AC97, launch day: V1 to V3 "Not measured yet · measured from <W1>"; V4 "1 of 2" "steps done", "Under way · goal: both at launch" with the half circle; V5 "Launch day, not counted", "Measured over the 14 days from <W1>"', () => {
  const v = sd({ now: '2026-12-02', cards: [...novemberCards(), ...windowCards()] });
  assert.equal(v.phase, 'launch');
  for (const id of ['V1', 'V2', 'V3']) assert.equal(verdict(T(v, id)), 'Not measured yet · measured from 3 Dec', id);
  const v4 = T(v, 'V4');
  assert.deepEqual(fig(v4), ['1 of 2', 'steps done']);
  assert.deepEqual(v4.steps, [{ mark: 'check', words: 'Serving the Operations-Hub address since 2 Dec' },
    { mark: 'planned', words: 'Old repository archived: your Chief of Staff checks it after launch' }]);
  assert.equal(verdict(v4), 'Under way · goal: both at launch');
  assert.equal(v4.mark, 'half');
  const v5 = T(v, 'V5');
  assert.equal(verdict(v5), 'Launch day, not counted · goal: under 4h');
  assert.deepEqual(v5.lines, ['Measured over the 14 days from 3 Dec']);
  assert.deepEqual(v5.chart.bars.map((b) => [b.label, b.fill]), [['Launch day', 'grey']]);
  assert.match(v5.figure.words, /^median, last 14 days, \d+ weekday cards$/);
  // Its archive line counts as its check whatever its dates, launch day's included.
  const archived = sd({ now: '2026-12-02', lines: [vc({ target: 'V4', from: '2026-12-02', to: '2026-12-02', state: 'met', at: chi('2026-12-02', '10:00') })] });
  assert.deepEqual(fig(T(archived, 'V4')), ['2 of 2', 'steps done at launch']);
  assert.deepEqual(T(archived, 'V4').steps[1], { mark: 'check', words: 'Old repository archived 2 Dec' }, 'a same-day range as one date');
  assert.equal(T(archived, 'V4').verdict.first, 'Met');
});

test('AC97, in the window (the picture\'s day 5): "0" "missed so far, 3 – 6 Dec", "2" "false alarms, 3 – 6 Dec", "20 min" "your estimate, 3 – 6 Dec", "2 of 2" "steps done at launch", V5 "median, live so far, <k> weekday cards" with "Live so far" and "Weekly check"; each verdict "… so far" (or the check\'s met or missed); "Weekly check: 4 cards, 3 – 6 Dec"', () => {
  const v = sd({ now: '2026-12-07', lines: DAY5 });
  assert.equal(v.phase, 'window');
  assert.deepEqual(fig(T(v, 'V1')), ['0', 'missed so far, 3 – 6 Dec']);
  assert.deepEqual(fig(T(v, 'V2')), ['2', 'false alarms, 3 – 6 Dec']);
  assert.deepEqual(fig(T(v, 'V3')), ['20 min', 'your estimate, 3 – 6 Dec']);
  assert.deepEqual(fig(T(v, 'V4')), ['2 of 2', 'steps done at launch']);
  assert.match(T(v, 'V5').figure.words, /^median, live so far, \d+ weekday cards$/);
  assert.equal(verdict(T(v, 'V1')), 'Within target so far · goal: none missed in the 14 days');
  assert.equal(verdict(T(v, 'V2')), 'Missed · goal: at most 1 a week', 'the check\'s missed sets the words');
  assert.equal(verdict(T(v, 'V3')), 'Within target so far · goal: at most 30 minutes a week');
  assert.equal(verdict(T(v, 'V4')), 'Met · goal: both at launch');
  assert.equal(verdict(T(v, 'V5')), 'Within target so far · goal: under 4h');
  assert.deepEqual(T(v, 'V1').lines, ["Your Chief of Staff's check, 7 Dec: on track"]);
  assert.deepEqual(T(v, 'V5').lines, ['Weekly check: 4 cards, 3 – 6 Dec', "Your Chief of Staff's check, 7 Dec: on track"]);
  assert.deepEqual(T(v, 'V5').chart.bars.map((b) => [b.label, b.value]), [['Live so far', T(v, 'V5').figure.big], ['Weekly check', '1h 50m']]);
  // Two weeks in the window: the worst week's form.
  const two = sd({ now: '2026-12-14', lines: [...DAY5, vc({ target: 'V2', from: '2026-12-07', to: '2026-12-13', value: 1 }), vc({ target: 'V3', from: '2026-12-07', to: '2026-12-13', value: 25 })] });
  assert.deepEqual(fig(T(two, 'V2')), ['2', 'false alarms in a week, the most (3 – 6 Dec)']);
  assert.deepEqual(fig(T(two, 'V3')), ['25 min', 'a week at most, your estimate (7 – 13 Dec)']);
  assert.match(T(two, 'V2').figure.words, /^false alarms in a week/);
});

test('AC97, after the window (the picture\'s after-14-days sheet): "0" "missed, 3 – 16 Dec", "2" "false alarms in a week, the most (3 – 6 Dec)", "25 min" "a week at most, your estimate (7 – 13 Dec)", "2h 20m"-form "median, 3 – 16 Dec, 21 weekday cards"; no "so far"; V5\'s "First 14 days" and "Weekly check"', () => {
  const v = sd({ now: '2026-12-24', lines: FINAL });
  assert.equal(v.phase, 'after');
  assert.deepEqual(fig(T(v, 'V1')), ['0', 'missed, 3 – 16 Dec']);
  assert.deepEqual(fig(T(v, 'V2')), ['2', 'false alarms in a week, the most (3 – 6 Dec)']);
  assert.deepEqual(fig(T(v, 'V3')), ['25 min', 'a week at most, your estimate (7 – 13 Dec)']);
  assert.match(T(v, 'V5').figure.words, /^median, 3 – 16 Dec, 21 weekday cards$/, 'the window\'s 21 cards (made up), the open one and the one answered after it among them; launch day\'s not');
  assert.deepEqual(T(v, 'V1').chart.bars.map((b) => b.label), ['3 – 16 Dec']);
  assert.deepEqual(T(v, 'V2').chart.bars.map((b) => [b.label, b.value, b.fill]), [['3 – 6 Dec', '2', 'bad'], ['7 – 13 Dec', '1', 'ok'], ['14 – 16 Dec', '0', 'ok']], 'one bar a week, newest last, each by its own week');
  assert.deepEqual(T(v, 'V5').chart.bars.map((b) => [b.label, b.value]), [['First 14 days', T(v, 'V5').figure.big], ['Weekly check', '2h 20m']]);
  for (const t of v.targets) assert.doesNotMatch(JSON.stringify([t.figure, t.verdict, t.lines]), /so far/, t.id);
  assert.equal(verdict(T(v, 'V2')), 'Missed · goal: at most 1 a week');
  assert.deepEqual(T(v, 'V2').lines, ["Your Chief of Staff's check, 21 Dec: missed"]);
  assert.equal(T(v, 'V5').lines.some((l) => l.startsWith('Weekly check:')), false, 'the weekly line in the window only');
  assert.deepEqual(T(v, 'V2').earlier, ["14 Dec: 1 false alarm, 7 – 13 Dec · missed", '7 Dec: 2 false alarms, 3 – 6 Dec · missed'], 'its earlier checks, newest first');
});

test('AC97: V5\'s wait counted to the window\'s end for a card open then or answered after it; its median judged "3h 59m" within and "4h 00m" outside', () => {
  // One card (made up), raised Thu 3 Dec 09:00 Chicago, answered after 3h 59m 59s or after 4h: the counted hours only.
  const one = (ms) => [{ n: 1, raised: chi('2026-12-03', '09:00'), answered: chi('2026-12-03', '09:00') + ms }];
  const under = sd({ now: '2026-12-04', cards: one(4 * 3600e3 - 1000) });
  assert.deepEqual([T(under, 'V5').figure.big, T(under, 'V5').verdict.first, T(under, 'V5').mark], ['3h 59m', 'Within target so far', 'check']);
  const at = sd({ now: '2026-12-04', cards: one(4 * 3600e3) });
  assert.deepEqual([T(at, 'V5').figure.big, T(at, 'V5').verdict.first, T(at, 'V5').mark], ['4h 00m', 'Outside target so far', 'cross']);
  // Open at the window's end (raised Wed 16 Dec 21:00, never answered): counted to the window's end, 1 h, after it.
  const open = sd({ now: '2026-12-30', cards: [{ n: 2, raised: chi('2026-12-16', '21:00'), answered: null }] });
  assert.equal(T(open, 'V5').figure.big, '1h 00m');
  // Answered after it (raised 16 Dec 21:00, answered 18 Dec 09:00): the same.
  const late = sd({ now: '2026-12-30', cards: [{ n: 3, raised: chi('2026-12-16', '21:00'), answered: chi('2026-12-18', '09:00') }] });
  assert.equal(T(late, 'V5').figure.big, '1h 00m');
  // Raised on launch day: outside the window.
  const l = sd({ now: '2026-12-30', cards: [{ n: 4, raised: chi('2026-12-02', '09:00'), answered: chi('2026-12-02', '10:00') }] });
  assert.equal(T(l, 'V5').figure, null);
  assert.equal(T(l, 'V5').aside, 'Median, 3 – 16 Dec: no weekday cards');
});

test('AC97: the desk\'s verdict at, under and past each goal — V1 on its total (0 within, 1 outside), a `null` line adding nothing; V2 and V3 week by week, a week of 2 false alarms or 45 minutes outside and staying red after good weeks, the big figure the worst week', () => {
  const W = (target, from, to, value, state = 'on track') => vc({ target, from, to, value, state });
  const w1 = ['2026-12-03', '2026-12-06'];
  const w2 = ['2026-12-07', '2026-12-13'];
  const one = (lines) => sd({ now: '2026-12-14', lines });
  assert.equal(T(one([W('V1', ...w1, 0)]), 'V1').verdict.first, 'Within target so far');
  assert.equal(T(one([W('V1', ...w1, 1)]), 'V1').verdict.first, 'Outside target so far');
  const skip = one([W('V1', ...w1, 0), vc({ target: 'V1', from: w2[0], to: w2[1], value: null, state: 'not measured' })]);
  assert.deepEqual([T(skip, 'V1').figure.big, T(skip, 'V1').verdict.first], ['0', 'Within target so far'], 'the null line adds nothing');
  assert.deepEqual(T(skip, 'V1').lines, ["Your Chief of Staff's check, 14 Dec: not measured"], 'its check line shows the word, no difference line');
  assert.equal(T(one([W('V1', ...w1, 0), W('V1', ...w2, 1)]), 'V1').figure.big, '1', 'the sum of its window lines');
  // V2: at its goal within, past it outside; red stays after a good week; the big figure the worst week.
  assert.equal(T(one([W('V2', ...w1, 1)]), 'V2').verdict.first, 'Within target so far');
  assert.equal(T(one([W('V2', ...w1, 0)]), 'V2').mark, 'check');
  const red = one([W('V2', ...w1, 2), W('V2', ...w2, 0)]);
  assert.deepEqual([T(red, 'V2').verdict.first, T(red, 'V2').figure.big, T(red, 'V2').chart.bars.map((b) => b.fill)], ['Outside target so far', '2', ['bad', 'ok']]);
  // V3: 30 within, 45 outside.
  assert.equal(T(one([W('V3', ...w1, 30)]), 'V3').verdict.first, 'Within target so far');
  const v3w = one([W('V3', ...w1, 45), W('V3', ...w2, 10)]);
  assert.deepEqual([T(v3w, 'V3').verdict.first, T(v3w, 'V3').figure.big], ['Outside target so far', '45 min']);
  // A check repeating the same days takes the earlier one's place (J25: the second counting), never a second week.
  const again = one([W('V2', ...w1, 2), W('V2', ...w1, 1)]);
  assert.deepEqual([T(again, 'V2').figure.big, T(again, 'V2').chart.bars.length], ['1', 1]);
});

test('AC97: the latest window line\'s `met` or `missed` sets the mark over the desk\'s verdict, both ways, with "The desk\'s own reading: …" where they differ; a later `on track` after an earlier `missed` leaves the desk\'s verdict; `on track` or `not measured` show no difference line', () => {
  const w1 = { from: '2026-12-03', to: '2026-12-06' };
  const v1 = (value, state, extra = []) => T(sd({ now: '2026-12-08', lines: [...extra, vc({ target: 'V1', ...w1, value, state })] }), 'V1');
  // Met against outside.
  const m = v1(1, 'met');
  assert.deepEqual([m.mark, m.verdict.mark, m.verdict.first], ['check', 'check', 'Met']);
  assert.deepEqual(m.lines, ["Your Chief of Staff's check, 7 Dec: met", "The desk's own reading: outside target so far"]);
  // Missed against within.
  const x = v1(0, 'missed');
  assert.deepEqual([x.mark, x.verdict.first], ['cross', 'Missed']);
  assert.deepEqual(x.lines, ["Your Chief of Staff's check, 7 Dec: missed", "The desk's own reading: within target so far"]);
  // Agreeing: no difference line.
  assert.deepEqual(v1(0, 'met').lines, ["Your Chief of Staff's check, 7 Dec: met"]);
  // A later on track after an earlier missed: the desk's verdict is the mark.
  const later = T(sd({ now: '2026-12-08', lines: [vc({ target: 'V1', ...w1, value: 0, state: 'missed', at: chi('2026-12-07', '08:00') }), vc({ target: 'V1', ...w1, value: 0, state: 'on track' })] }), 'V1');
  assert.deepEqual([later.mark, later.verdict.first, later.lines], ['check', 'Within target so far', ["Your Chief of Staff's check, 7 Dec: on track"]]);
  const ot = v1(1, 'on track');
  assert.deepEqual([ot.mark, ot.verdict.first, ot.lines], ['cross', 'Outside target so far', ["Your Chief of Staff's check, 7 Dec: on track"]]);
});

test('AC97: V4 judged from launch day — "Under way" with the half circle until the archive is recorded, within only with both steps, never outside; before launch nothing judged', () => {
  for (const day of ['2026-12-02', '2026-12-05', '2026-12-20']) {
    const t = T(sd({ now: day }), 'V4');
    assert.deepEqual([t.mark, verdict(t)], ['half', 'Under way · goal: both at launch'], day);
  }
  const done = T(sd({ now: '2026-12-20', lines: [vc({ target: 'V4', from: '2026-12-09', to: '2026-12-09', state: 'on track' })] }), 'V4');
  assert.deepEqual([done.mark, verdict(done), done.steps[1].words], ['check', 'Within target · goal: both at launch', 'Old repository archived 9 Dec']);
  const missed = T(sd({ now: '2026-12-20', lines: [vc({ target: 'V4', from: '2026-12-09', to: '2026-12-09', state: 'missed' })] }), 'V4');
  assert.deepEqual([missed.mark, missed.verdict.first], ['cross', 'Missed']);
  assert.ok(missed.lines.includes("The desk's own reading: within target"));
  assert.equal(T(sd({ now: '2026-11-20', L: null }), 'V4').mark, 'planned');
});

test('AC97: a target whose latest window line says `not measured` (value null): "Not measured · your Chief of Staff\'s check, <date>" with the planned ring, never the dashed "?", in place of the check line; counted "not measured yet" on the row, not "check late"', () => {
  const lines = [...DAY5.filter((l) => !/"target":"V3"/.test(l)), vc({ target: 'V3', from: '2026-12-03', to: '2026-12-06', value: null, state: 'not measured' })];
  for (const day of ['2026-12-08', '2026-12-12']) {
    const v = sd({ now: day, lines });
    const t = T(v, 'V3');
    assert.deepEqual([t.mark, verdict(t)], ['planned', "Not measured · your Chief of Staff's check, 7 Dec"], day);
    assert.deepEqual(t.lines, ['Goal: at most 30 minutes a week']);
    assert.ok(!t.lines.some((l) => /: not measured$/.test(l)), 'the check said once');
    assert.equal(v.row.words, '5 targets · 1 outside target · 3 within · 1 not measured yet, so far', day);
    assert.doesNotMatch(v.row.words, /check late/);
  }
});

test('AC97: V1 to V3 with no figure — "first check due <D1>" until D1, then the dashed "?" "weekly check not recorded yet", after the window too; V5 in the window with no weekday cards, or the projects not read yet, "Not measured yet · goal: under 4h" with the planned ring under AC21\'s words; V5 with its figure gone (its log no longer read) and no V5 line the dashed "?"', () => {
  assert.deepEqual([T(sd({ now: '2026-12-09' }), 'V1').mark, verdict(T(sd({ now: '2026-12-09' }), 'V1'))], ['planned', 'Not measured yet · first check due 9 Dec']);
  assert.deepEqual([T(sd({ now: '2026-12-10' }), 'V2').mark, verdict(T(sd({ now: '2026-12-10' }), 'V2'))], ['unrec', 'Not measured yet · weekly check not recorded yet']);
  assert.deepEqual(T(sd({ now: '2026-12-10' }), 'V2').lines, ['Goal: at most 1 a week']);
  assert.equal(T(sd({ now: '2026-12-20' }), 'V3').mark, 'unrec');
  const none = T(sd({ now: '2026-12-05', cards: [] }), 'V5');
  assert.deepEqual([none.mark, verdict(none), none.aside, none.chart], ['planned', 'Not measured yet · goal: under 4h', 'Median, live so far: no weekday cards', null]);
  const unread = T(sd({ now: '2026-12-05', notRead: true }), 'V5');
  assert.deepEqual([unread.mark, unread.aside], ['planned', 'Median, live so far: not available until Service-Desk has been read']);
  assert.equal(sd({ now: '2026-12-05', cards: [], lines: [vc({ target: 'V1', from: '2026-12-03', to: '2026-12-04', value: 0, at: chi('2026-12-05', '09:00') })] }).row.words,
    '5 targets · 1 within target · 1 under way · 3 not measured yet, so far', 'V5 counted "not measured yet"');
  // Figure gone: after the window, in February (J2 reads January and February), no V5 line.
  const gone = T(sd({ now: '2027-02-10' }), 'V5');
  assert.deepEqual([gone.mark, verdict(gone)], ['unrec', 'Not measured yet · weekly check not recorded yet']);
  // With one, the figure is its record's.
  const kept = T(sd({ now: '2027-02-10', lines: [vc({ target: 'V5', from: '2026-12-03', to: '2026-12-16', value: 140, state: 'met' })] }), 'V5');
  assert.deepEqual([kept.figure.big, kept.chart.bars.map((b) => b.label), kept.verdict.first], ['2h 20m', ['Weekly check'], 'Met']);
});

// ---------------------------------------------------------------------------
// Other projects

test('AC97, other projects: each target\'s id and the name before its line\'s second colon, its latest J25 line\'s figure with its dates, no chart and no live verdict, the Chief of Staff\'s met or missed as its mark; on track or not measured the half circle or the planned ring; none "Not measured yet · weekly check not recorded yet"', () => {
  const none = alpha({});
  assert.deepEqual(none.targets.map((t) => [t.id, t.name, t.mark, verdict(t), t.chart]), [
    ['V1', 'Signups', 'planned', 'Not measured yet · weekly check not recorded yet', null], ['V2', 'Bounce', 'planned', 'Not measured yet · weekly check not recorded yet', null],
    ['V3', 'Upkeep', 'planned', 'Not measured yet · weekly check not recorded yet', null]]);
  assert.equal(none.small, 'From the project document, section 6');
  assert.deepEqual([none.row.words, none.row.icon], ['3 targets · weekly check not recorded yet', 'planned']);
  const lines = [A('V1', { from: '2026-11-30', to: '2026-12-06', value: 14, figure: '14 signups', state: 'missed' }),
    A('V2', { from: '2026-11-30', to: '2026-12-06', value: null, figure: '1.4% bounced', state: 'met' })];
  const v = alpha({ lines });
  assert.deepEqual(v.targets.map((t) => [t.id, t.mark, t.figure && [t.figure.big, t.figure.words], verdict(t), t.chart]), [
    ['V1', 'cross', ['14 signups', '30 Nov – 6 Dec'], "Missed · your Chief of Staff's check, 7 Dec", null],
    ['V2', 'check', ['1.4% bounced', '30 Nov – 6 Dec'], "Met · your Chief of Staff's check, 7 Dec", null],
    ['V3', 'planned', null, 'Not measured yet · weekly check not recorded yet', null]]);
  assert.deepEqual([v.row.words, v.row.icon], ['3 targets · 1 met · 1 missed · 1 not recorded yet', 'cross']);
  const ot = alpha({ lines: [A('V1', { from: '2026-11-30', to: '2026-12-06', value: 3, figure: '3 signups', state: 'on track' })] });
  assert.deepEqual([T(ot, 'V1').mark, ot.row.icon], ['half', 'half']);
  const nm = alpha({ lines: [A('V1', { from: '2026-11-30', to: '2026-12-06', value: null, figure: 'not counted', state: 'not measured' })] });
  assert.deepEqual([T(nm, 'V1').mark, nm.row.icon], ['planned', 'planned']);
  // Green only with every latest line met.
  const met3 = alpha({ lines: ['V1', 'V2', 'V3'].map((id) => A(id, { from: '2026-11-30', to: '2026-12-06', value: null, figure: 'as aimed', state: 'met' })) });
  assert.deepEqual([met3.row.icon, met3.row.words], ['check', '3 targets · 3 met']);
  // J25 not known: state 0's words, no icon, no mark.
  const fail = alpha({ state: 'failed' });
  assert.deepEqual([fail.row.words, fail.row.icon, fail.targets.map((t) => t.mark), fail.j25Line], ['3 targets · weekly checks not available', null, [null, null, null], 'Weekly checks: not available']);
  assert.equal(alpha({ state: 'pending' }).row.words, '3 targets · weekly checks not read yet');
});

test('AC97, other projects: ids out of order named in the row\'s title, a long target line, and a section 6 with no `V<n>:` line (no row)', () => {
  const odd = parseProjectDoc(docWithTargets(['V2: Bounce: under 2% (made up)', 'V1: Signups: 20 (made up)', `V4: ${'A very long made-up target, '.repeat(12)}at launch`]));
  assert.equal(restRows({ projectDoc: odd }, null).values.title, 'Value targets V2, V1, V4');
  const v = alpha({ doc: odd });
  assert.deepEqual(v.targets.map((t) => t.id), ['V2', 'V1', 'V4'], 'in section 6\'s order');
  assert.equal(T(v, 'V4').name, `${'A very long made-up target, '.repeat(12)}at launch`, 'no second colon: the line\'s words after its id');
  const no = parseProjectDoc(docWithTargets(['Target 1: none in the desk\'s form (made up)']));
  assert.equal(restRows({ projectDoc: no }, null).values, null);
  assert.equal(valuesView({ project: ALPHA, doc: no, planning: false, j25: { state: 'none' }, nowMs: chi('2026-12-07'), tz: TZ }), null);
});

// ---------------------------------------------------------------------------
// The row: its states 0 to 8, day by day, and its left icon

/** The window's days for a launch, worked out here from AC97's words (not from the module's own). */
function days(L) {
  const d = (k, n) => new Date(Date.parse(`${k}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
  const wed = (k) => { const wd = (new Date(`${k}T00:00:00Z`).getUTCDay() + 6) % 7; return d(k, 6 - wd + 3); };
  return { L, W1: d(L, 1), WN: d(L, 14), D1: wed(d(L, 1)), DN: wed(d(L, 14)), d };
}
const DATE_RE = /\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/;
const dw = (k) => `${Number(k.slice(8))} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(k.slice(5, 7)) - 1]}`;

test('AC97: the window\'s days — W1 the day after launch day, WN the 14th day after it, D1 and DN the Wednesday after the Monday-to-Sunday week holding each — for launches on each weekday', () => {
  assert.deepEqual(windowDays('2026-12-02'), { L: '2026-12-02', W1: '2026-12-03', WN: '2026-12-16', D1: '2026-12-09', DN: '2026-12-23' });
  for (let i = 0; i < 7; i++) {
    const L = addDays('2026-11-30', i);
    const e = days(L);
    assert.deepEqual(windowDays(L), { L, W1: e.W1, WN: e.WN, D1: e.D1, DN: e.DN }, L);
  }
  assert.equal(dueOf('2026-12-06'), '2026-12-09', 'a Sunday: its own week\'s Wednesday after');
  assert.equal(dueOf('2026-12-07'), '2026-12-16', 'a Monday: the next week\'s');
  assert.equal(rangeWords('2026-11-28', '2026-12-04'), '28 Nov – 4 Dec');
  assert.equal(rangeWords('2026-12-02', '2026-12-02'), '2 Dec');
  assert.equal(phaseOf('2026-12-01', windowDays('2026-12-02')), 'before');
  assert.equal(phaseOf('2026-12-01', null), 'before');
});

test('AC97: the row\'s words by its strict sequence, one a day on a fake clock from before launch to after DN, for launches on different weekdays — state 1 before launch, 2 on launch day, 3 to D1, 4 after it, 6 after WN with no line; with lines, 5, 7 ("last checks due <DN>", then "not recorded yet") and 8; each state\'s bounds on both sides; never "0 checked", never a due date gone by, never "since" launch day', () => {
  for (const L of ['2026-12-02', '2026-12-06', '2026-12-07', '2027-01-08', '2026-11-28']) {
    const e = days(L);
    for (let i = -2; i <= 26; i++) {
      const today = e.d(L, i);
      const v = sd({ now: today, L });
      let want;
      if (today < L) want = [1, 'Measured from launch · V4, replacing the old page, at launch'];
      else if (today === L) want = [2, `Measured from ${dw(e.W1)} · first weekly check due ${dw(e.D1)}`];
      else if (today <= e.D1) want = [3, `Measured since ${dw(e.W1)} · first weekly check due ${dw(e.D1)}`];
      else if (today <= e.WN) want = [4, `Measured since ${dw(e.W1)} · first weekly check not recorded yet`];
      else want = [6, '5 targets · first 14 days over · no weekly check recorded yet'];
      assert.deepEqual([v.row.state, v.row.words], want, `${L}, ${today}`);
      assert.doesNotMatch(v.row.words, /0 checked/);
      assert.ok(!v.row.words.includes(`since ${dw(L)}`), 'never since launch day');
      const due = /due (\d+ \w+)/.exec(v.row.words);
      if (due) assert.ok(today <= (v.row.state === 7 ? e.DN : e.D1), `${today}: no due date gone by`);
    }
    // With lines: a first window line on W1 + 4 (made up); state 5 to WN, 7 after it to DN and past it, 8 once every latest
    // line covers WN.
    const first = ['V1', 'V2', 'V3', 'V5'].map((id) => vc({ target: id, from: e.W1, to: e.d(L, 4), value: 0, at: chi(e.d(L, 5), '09:00') }));
    const last = ['V1', 'V2', 'V3', 'V5'].map((id) => vc({ target: id, from: e.W1, to: e.WN, value: 0, state: 'met', at: chi(e.d(L, 18), '09:00') }));
    const v4 = vc({ target: 'V4', from: e.d(L, 3), to: e.d(L, 3), state: 'met', at: chi(e.d(L, 3), '12:00') });
    // Cards only for the picture's launch (made up): elsewhere V5 has no figure in the window, its planned ring counted
    // "not measured yet".
    const parts = L === LAUNCH ? '5 within target' : '4 within target · 1 not measured yet';
    for (let i = 5; i <= 24; i++) {
      const today = e.d(L, i);
      const lines = [v4, ...first, ...(i >= 18 ? last : [])];
      const v = sd({ now: today, L, lines, cards: L === LAUNCH ? windowCards() : [] });
      if (today <= e.WN) {
        assert.equal(v.row.state, 5, `${L}, ${today}`);
        assert.equal(v.row.words, L === LAUNCH ? '5 targets · 5 within target so far' : `5 targets · ${parts}, so far`, 'one part with no comma, two with one');
      } else if (i < 18) {
        assert.equal(v.row.state, 7, `${L}, ${today}`);
        assert.equal(v.row.words, `5 targets · first 14 days over · ${parts} · ${today <= e.DN ? `last checks due ${dw(e.DN)}` : 'last checks not recorded yet'}`);
      } else {
        assert.deepEqual([v.row.state, v.row.words, v.row.icon], [8, '5 targets · first 14 days checked · 5 met', 'check'], `${L}, ${today}`);
      }
    }
  }
});

test('AC97: the row\'s parts add up to the number of targets, by each target\'s mark in states 5 and 7 ("<w> check late" counted), by the Chief of Staff\'s states in state 8; "target" said once, "so far" in state 5 with a comma after two parts or more', () => {
  const v5 = sd({ now: '2026-12-07', lines: DAY5 });
  assert.equal(v5.row.words, '5 targets · 1 outside target · 4 within, so far');
  // A late check counted (state 5): V3's first check missing on 10 Dec, its dashed "?".
  const late = sd({ now: '2026-12-10', lines: DAY5.filter((l) => !/"target":"V3"/.test(l)) });
  assert.equal(T(late, 'V3').mark, 'unrec');
  assert.equal(late.row.words, '5 targets · 1 outside target · 3 within · 1 check late, so far');
  const parts = (w) => [...w.matchAll(/(\d+) (outside|within|under way|check late|not measured yet|met|missed|on track|not measured)/g)].reduce((a, m) => a + Number(m[1]), 0);
  for (const v of [v5, late, sd({ now: '2026-12-18', lines: DAY5 }), sd({ now: '2026-12-24', lines: FINAL }), sd({ now: '2026-12-05', cards: [], lines: [vc({ target: 'V1', from: '2026-12-03', to: '2026-12-04', value: 0, at: chi('2026-12-05', '09:00') })] })]) {
    assert.equal(parts(v.row.words.split(' · ').slice(1).join(' · ').replace(/first 14 days (over|checked)/, '')), 5, v.row.words);
    if (v.row.state === 5 || v.row.state === 7) assert.equal((v.row.words.match(/\btarget\b/g) || []).length, 1, `"target" once: ${v.row.words}`);
  }
  assert.equal(sd({ now: '2026-12-24', lines: FINAL }).row.words, '5 targets · first 14 days checked · 4 met · 1 missed');
  // State 7, a late check counted.
  assert.equal(sd({ now: '2026-12-18', lines: DAY5 }).row.words, '5 targets · first 14 days over · 1 outside target · 4 within · last checks due 23 Dec');
});

test('AC97: state 0 — after launch, J25\'s read failed or not yet made: "<n> targets · weekly checks not available" or "… not read yet", no left icon, V1 to V3 with no mark, whichever of states 2 to 8 would apply; before launch state 1; the sheet says it once, and each target that reads J25 says it, with no figure, chart or mark; V4\'s and V5\'s own facts still show', () => {
  for (const day of ['2026-12-02', '2026-12-05', '2026-12-10', '2026-12-20']) {
    for (const [state, word] of [['failed', 'not available'], ['pending', 'not read yet']]) {
      const v = sd({ now: day, state });
      assert.deepEqual([v.row.state, v.row.words, v.row.icon], [0, `5 targets · weekly checks ${word}`, null], `${day} ${state}`);
      assert.deepEqual(v.row.marks.slice(0, 3).map((m) => m.mark), [null, null, null]);
      assert.equal(v.j25Line, `Weekly checks: ${word}`);
      for (const id of ['V1', 'V2', 'V3']) {
        const t = T(v, id);
        assert.deepEqual([t.verdict.first, t.figure, t.chart, t.mark], [word[0].toUpperCase() + word.slice(1), null, null, null], id);
        assert.doesNotMatch(JSON.stringify(t), /not recorded yet|First check due|first check due/);
      }
      assert.equal(T(v, 'V4').mark, 'half', 'serving the address, the desk\'s own fact');
      assert.equal(T(v, 'V4').steps[1].words, `Old repository archived: ${word}`);
      assert.notEqual(T(v, 'V5').figure, null, 'V5 the desk\'s own');
    }
  }
  const before = sd({ now: '2026-11-25', L: null, state: 'failed', cards: novemberCards() });
  assert.equal(before.row.state, 1);
});

test('AC97: the left icon, one rule — red with any red mark; green only in state 8 with every latest line met (never with 4 met and 1 on track, nor after the window with no checks); the dashed "?" in states 4 and 6; the half circle (launch day\'s included); the planned ring; none in state 0; the half circle kept in state 8 with not all met or missed', () => {
  assert.equal(sd({ now: '2026-11-25', L: null }).row.icon, 'planned');
  assert.equal(sd({ now: '2026-12-02' }).row.icon, 'half', 'launch day, V4 under way: the rule, not round 2\'s frame');
  assert.equal(sd({ now: '2026-12-05' }).row.icon, 'half');
  assert.equal(sd({ now: '2026-12-10' }).row.icon, 'unrec', 'state 4');
  assert.equal(sd({ now: '2026-12-18' }).row.icon, 'unrec', 'state 6');
  assert.equal(sd({ now: '2026-12-07', lines: DAY5 }).row.icon, 'cross');
  assert.equal(sd({ now: '2026-12-24', lines: FINAL }).row.icon, 'cross', 'final, one missed');
  const allMet = FINAL.map((l) => l.replace('"state":"missed"', '"state":"met"')).map((l) => (/"target":"V2"/.test(l) ? l.replace(/"value":2,/, '"value":1,') : l));
  assert.equal(sd({ now: '2026-12-24', lines: allMet }).row.icon, 'check');
  const fourAndOnTrack = allMet.map((l, i) => (i === allMet.length - 1 ? l.replace('"state":"met"', '"state":"on track"') : l));
  const v = sd({ now: '2026-12-24', lines: fourAndOnTrack });
  assert.deepEqual([v.row.state, v.row.words, v.row.icon], [8, '5 targets · first 14 days checked · 4 met · 1 on track', 'half']);
  const notMeasured = allMet.map((l) => (/"target":"V(3|5)"/.test(l) && /"to":"2026-12-16"/.test(l) ? l.replace(/"value":\d+/, '"value":null').replace('"state":"met"', '"state":"not measured"') : l));
  const nm = sd({ now: '2026-12-24', lines: notMeasured });
  assert.deepEqual([nm.row.words, nm.row.icon], ['5 targets · first 14 days checked · 3 met · 2 not measured', 'half']);
  assert.equal(sd({ now: '2026-12-10', state: 'failed' }).row.icon, null);
  // Every latest line met but the window's end not yet covered: state 7, not final, so never the green check.
  const notFinal = ['V1', 'V2', 'V3', 'V5'].map((id) => vc({ target: id, from: '2026-12-03', to: '2026-12-13', value: 0, state: 'met', at: chi('2026-12-14', '09:00') }));
  const seven = sd({ now: '2026-12-18', lines: [...notFinal, vc({ target: 'V4', from: '2026-12-02', to: '2026-12-02', state: 'met' })] });
  assert.deepEqual([seven.row.state, seven.row.icon], [7, 'half']);
});

test('AC97: no date of the desk\'s own before launch — the row, every target\'s words and lines, and the sheet\'s; record text quoted as written', () => {
  for (const L of [null, '2026-12-30']) {
    const v = sd({ now: chi('2026-11-27', '15:00'), L, cards: novemberCards(), lines: [vc({ target: 'V1', from: '2026-11-16', to: '2026-11-22', value: 0, at: chi('2026-11-23', '09:00') })] });
    assert.equal(v.phase, 'before');
    const own = [v.row.words, v.small, ...v.targets.flatMap((t) => [t.name, t.figure && t.figure.big, t.figure && t.figure.words, t.aside, verdict(t), ...t.lines,
      ...(t.steps || []).map((s) => s.words), ...(t.chart ? t.chart.bars.map((b) => `${b.label} ${b.value}`) : [])])].filter(Boolean);
    for (const w of own) assert.doesNotMatch(w, DATE_RE, w);
  }
});

test('AC97: the miss and stop rule quoted from after its name to the end of "… where the owner rules continue, re-aim or stop.", its first letter capitalised, the measuring design not quoted; none where section 6 has no such sentence', () => {
  assert.equal(stopRule(J7B_DOC), "A miss is the redesign taking more than about 2 hours a week of the owner's time before launch. At a miss, the owner rules: re-aim (for example, launch read-only and add acting after) or stop. A V1 to V3 miss after launch goes to the stage-8 evidence review, where the owner rules continue, re-aim or stop.");
  assert.equal(DOC().stopRule, stopRule(J7B_DOC));
  assert.doesNotMatch(stopRule(J7B_DOC), /Miss and stop rule|How V1 and V2 are measured/);
  assert.equal(sd({ now: '2026-12-07' }).stop, stopRule(J7B_DOC));
  assert.equal(stopRule(J7B_DOC.replace('where the owner rules continue, re-aim or stop.', 'where the owner rules.')), null);
  assert.equal(stopRule(J7B_DOC.replace('**Miss and stop rule:**', '**Stop rule:**')), null);
});

test('AC97: V5\'s grey fill before W1 is `--ink3` on the `--line` track, 4.19:1 or more in light and 5.44:1 in dark, never `--line2`; the fills `--ok` and `--bad`; the goal line `--ink`', () => {
  const css = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /\.v2-vsvg \.fl\.grey \{ fill: var\(--ink3\); \}/);
  assert.match(css, /\.v2-vsvg \.tr \{ fill: var\(--line\); \}/);
  assert.match(css, /\.v2-vsvg \.fl\.ok \{ fill: var\(--ok\); \}/);
  assert.match(css, /\.v2-vsvg \.fl\.bad \{ fill: var\(--bad\); \}/);
  assert.match(css, /\.v2-vsvg \.gl \{ fill: var\(--ink\); \}/);
  assert.doesNotMatch(css.match(/\.v2-vsvg[^{]*\{[^}]*\}/g).join('\n'), /--line2/);
  const tok = (block) => Object.fromEntries([...block.matchAll(/(--[a-z0-9]+):\s*(#[0-9a-f]{6})/g)].map((m) => [m[1], m[2]]));
  const light = tok(css.slice(css.indexOf('html.sb .v2, html.sb.v2-page {'), css.indexOf('}', css.indexOf('html.sb .v2, html.sb.v2-page {'))));
  const darkAt = css.indexOf('html.sb[data-theme="dark"] .v2, html.sb.v2-page[data-theme="dark"] {');
  const dark = tok(css.slice(darkAt, css.indexOf('}', darkAt)));
  const lum = (hex) => {
    const c = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  assert.ok(ratio(light['--ink3'], light['--line']) >= 4.19, `light ${ratio(light['--ink3'], light['--line'])}`);
  assert.ok(ratio(dark['--ink3'], dark['--line']) >= 5.44, `dark ${ratio(dark['--ink3'], dark['--line'])}`);
  assert.equal(ratio(light['--ink3'], light['--line']).toFixed(2), '4.19');
  assert.equal(ratio(dark['--ink3'], dark['--line']).toFixed(2), '5.44');
  assert.ok(ratio(light['--line2'], light['--line']) < 1.5, '--line2 all but vanishes on the track');
});

// ---------------------------------------------------------------------------
// Draft 11 (VT1's review, round 1, and the owner's answer B)

test('AC97 (VT1 round 2; the Reviewer\'s B1): after the window, the desk\'s own verdict words with no "so far", for V1, V2, V3 and V5 — with a latest `on track` line, and with a figure and no check', () => {
  const W = (target, value, state = 'on track', to = '2026-12-16') => vc({ target, from: '2026-12-03', to, value, state, at: chi('2026-12-21', '09:00') });
  const within = sd({ now: '2026-12-22', lines: [W('V1', 0), W('V2', 1), W('V3', 30), W('V5', 100)] });
  assert.deepEqual(['V1', 'V2', 'V3', 'V5'].map((id) => verdict(T(within, id))), ['Within target · goal: none missed in the 14 days', 'Within target · goal: at most 1 a week',
    'Within target · goal: at most 30 minutes a week', 'Within target · goal: under 4h']);
  const outside = sd({ now: '2026-12-22', lines: [W('V1', 2), W('V2', 3), W('V3', 45)], cards: [{ n: 1, raised: chi('2026-12-03', '07:00'), answered: chi('2026-12-03', '12:00') }] });
  assert.deepEqual(['V1', 'V2', 'V3', 'V5'].map((id) => verdict(T(outside, id))), ['Outside target · goal: none missed in the 14 days', 'Outside target · goal: at most 1 a week',
    'Outside target · goal: at most 30 minutes a week', 'Outside target · goal: under 4h']);
  assert.deepEqual(T(outside, 'V5').lines, [], 'V5 with a figure and no check: no check line');
  for (const v of [within, outside]) for (const t of v.targets) assert.doesNotMatch(JSON.stringify([t.figure, t.verdict, t.lines]), /so far/, t.id);
  // A difference line after the window: no "so far" in it either.
  const diff = T(sd({ now: '2026-12-22', lines: [W('V1', 0, 'missed')] }), 'V1');
  assert.deepEqual(diff.lines, ["Your Chief of Staff's check, 21 Dec: missed", "The desk's own reading: within target"]);
});

test('AC97 (VT1 round 2; the owner\'s answer B, P-001-m3b-not-measured-mark.md, keyed to the final check): after the window, a latest line with its `to` on or after WN saying `not measured` takes the planned ring with or without the desk\'s figure — the figure and a grey `--ink3` bar still shown, "Not measured · your Chief of Staff\'s check, <date>" in place of the check line, then "Goal: …", no difference line — counted "not measured" in state 8 and "not measured yet" in state 7', () => {
  const nm = (target, from, to = '2026-12-16') => vc({ target, from, to, value: null, state: 'not measured', at: chi('2026-12-21', '09:00') });
  const met = (target, value) => vc({ target, from: '2026-12-03', to: '2026-12-16', value, state: 'met', at: chi('2026-12-21', '09:00') });
  // V1 and V3 with figures from earlier weeks, then a final `not measured`; V5 with the desk's own figure; V2 with no figure.
  const lines = [vc({ target: 'V1', from: '2026-12-03', to: '2026-12-06', value: 0 }), vc({ target: 'V3', from: '2026-12-03', to: '2026-12-06', value: 20 }),
    vc({ target: 'V3', from: '2026-12-07', to: '2026-12-13', value: 45 }), nm('V1', '2026-12-07'), nm('V2', '2026-12-03'), nm('V3', '2026-12-14'), nm('V5', '2026-12-03'),
    vc({ target: 'V4', from: '2026-12-02', to: '2026-12-02', state: 'met' })];
  const v = sd({ now: '2026-12-24', lines });
  for (const id of ['V1', 'V2', 'V3', 'V5']) {
    const t = T(v, id);
    assert.deepEqual([t.mark, t.verdict.mark, verdict(t)], ['planned', 'planned', "Not measured · your Chief of Staff's check, 21 Dec"], id);
    assert.deepEqual(t.lines, [`Goal: ${GOALS[id].words}`], `${id}: the check said once, no difference line`);
  }
  assert.deepEqual(fig(T(v, 'V1')), ['0', 'missed, 3 – 16 Dec'], 'the desk\'s figure still shown, to the latest window line\'s `to`');
  assert.deepEqual(T(v, 'V1').chart.bars.map((b) => b.fill), ['grey']);
  assert.deepEqual(fig(T(v, 'V3')), ['45 min', 'a week at most, your estimate (7 – 13 Dec)']);
  assert.deepEqual(T(v, 'V3').chart.bars.map((b) => b.fill), ['grey', 'grey'], 'every bar grey, judged by no one, the 45 too');
  assert.deepEqual([T(v, 'V5').figure.words.startsWith('median, 3 – 16 Dec'), T(v, 'V5').chart.bars.map((b) => [b.label, b.fill])], [true, [['First 14 days', 'grey']]]);
  assert.equal(T(v, 'V2').figure, null);
  assert.deepEqual([v.row.state, v.row.words, v.row.icon], [8, '5 targets · first 14 days checked · 1 met · 4 not measured', 'half']);
  assert.deepEqual(v.row.marks.map((m) => m.mark), ['planned', 'planned', 'planned', 'check', 'planned']);
  // State 7: one target's final check in (`not measured`), the others' not yet: it counts "not measured yet".
  const seven = sd({ now: '2026-12-18', lines: [...DAY5, vc({ target: 'V3', from: '2026-12-07', to: '2026-12-16', value: null, state: 'not measured', at: chi('2026-12-17', '09:00') })] });
  assert.equal(seven.row.state, 7);
  assert.equal(T(seven, 'V3').mark, 'planned');
  assert.equal(seven.row.words, '5 targets · first 14 days over · 1 outside target · 3 within · 1 not measured yet · last checks due 23 Dec');
  // With the rest met: state 8 counts the Chief of Staff's states.
  const eight = sd({ now: '2026-12-24', lines: [met('V1', 0), met('V2', 1), nm('V3', '2026-12-03'), met('V5', 140), vc({ target: 'V4', from: '2026-12-02', to: '2026-12-02', state: 'met' })] });
  assert.deepEqual([eight.row.words, eight.row.icon], ['5 targets · first 14 days checked · 4 met · 1 not measured', 'half']);
});

test('AC97 (VT1 round 2): an earlier week\'s `not measured` after the window (state 7), and a latest `not measured` with a figure in the window, keep draft 10\'s rule — the desk\'s verdict the mark and on the row, the check line "not measured", no difference line; with no figure, in the window, the planned ring and the "Not measured" line (V5 too)', () => {
  const nm = (target, from, to) => vc({ target, from, to, value: null, state: 'not measured' });
  const earlier = [vc({ target: 'V3', from: '2026-12-03', to: '2026-12-06', value: 20 }), nm('V3', '2026-12-07', '2026-12-13')];
  for (const day of ['2026-12-15', '2026-12-18']) {
    const t = T(sd({ now: day, lines: earlier }), 'V3');
    const so = day === '2026-12-15' ? ' so far' : '';
    assert.deepEqual([t.mark, t.verdict.first, t.lines, t.chart.bars.map((b) => b.fill)], ['check', `Within target${so}`, ["Your Chief of Staff's check, 14 Dec: not measured"], ['ok']], day);
  }
  const row = sd({ now: '2026-12-18', lines: [...DAY5.filter((l) => !/"target":"V3"/.test(l)), ...earlier] });
  assert.equal(row.row.words, '5 targets · first 14 days over · 1 outside target · 4 within · last checks due 23 Dec', 'counted by the desk\'s verdict');
  // V5 in the window with no figure and a latest `not measured` line: the "Not measured" line under AC21's words.
  const v5 = T(sd({ now: '2026-12-08', cards: [], lines: [nm('V5', '2026-12-03', '2026-12-06')] }), 'V5');
  assert.deepEqual([v5.mark, verdict(v5), v5.aside, v5.lines], ['planned', "Not measured · your Chief of Staff's check, 7 Dec", 'Median, live so far: no weekday cards', ['Goal: under 4h']]);
  // V5 in the window with a figure: the desk's verdict, the check line "not measured".
  const v5f = T(sd({ now: '2026-12-08', lines: [nm('V5', '2026-12-03', '2026-12-06')] }), 'V5');
  assert.deepEqual([v5f.mark, v5f.lines], ['check', ["Your Chief of Staff's check, 7 Dec: not measured"]]);
});

test('AC97 (VT1 round 2; draft 11, C): the same days twice — a later line with the same `from` and `to` replaces the earlier in V1\'s sum and in V2\'s and V3\'s weeks; of two equal worst weeks the earlier is the figure; "1" "false alarm, …" singular; "Weekly check: 1 card, …", and the figure as written where it gives no count', () => {
  const w1 = { from: '2026-12-03', to: '2026-12-06' };
  const w2 = { from: '2026-12-07', to: '2026-12-13' };
  const v1 = T(sd({ now: '2026-12-15', lines: [vc({ target: 'V1', ...w1, value: 2 }), vc({ target: 'V1', ...w2, value: 1 }), vc({ target: 'V1', ...w1, value: 0, at: chi('2026-12-14', '10:00') })] }), 'V1');
  assert.deepEqual([v1.figure.big, v1.verdict.first], ['1', 'Outside target so far'], '0 for the first week (its re-check) and 1 for the second, never 3');
  const eq = T(sd({ now: '2026-12-15', lines: [vc({ target: 'V3', ...w1, value: 25 }), vc({ target: 'V3', ...w2, value: 25 })] }), 'V3');
  assert.deepEqual(fig(eq), ['25 min', 'a week at most, your estimate (3 – 6 Dec)'], 'the earlier of two equal worst weeks');
  assert.deepEqual(fig(T(sd({ now: '2026-12-08', lines: [vc({ target: 'V2', ...w1, value: 1 })] }), 'V2')), ['1', 'false alarm, 3 – 6 Dec']);
  assert.deepEqual(fig(T(sd({ now: '2026-12-08', lines: [vc({ target: 'V2', ...w1, value: 0 })] }), 'V2')), ['0', 'false alarms, 3 – 6 Dec']);
  const one = T(sd({ now: '2026-12-08', lines: [vc({ target: 'V5', ...w1, value: 90, figure: '1h 30m median, 1 card' })] }), 'V5');
  assert.ok(one.lines.includes('Weekly check: 1 card, 3 – 6 Dec'), one.lines.join(' | '));
  const words = T(sd({ now: '2026-12-08', lines: [vc({ target: 'V5', ...w1, value: 90, figure: '1h 30m median' })] }), 'V5');
  assert.ok(words.lines.includes('Weekly check: 1h 30m median, 3 – 6 Dec'), words.lines.join(' | '));
  // V5 after the window with its log gone and a V5 line in: the check's value, "median, your Chief of Staff's check, …".
  const gone = T(sd({ now: '2027-02-10', lines: [vc({ target: 'V5', from: '2026-12-03', to: '2026-12-16', value: 140, state: 'on track' })] }), 'V5');
  assert.deepEqual([fig(gone), gone.chart.bars.map((b) => [b.label, b.value]), verdict(gone)],
    [['2h 20m', "median, your Chief of Staff's check, 3 – 16 Dec"], [['Weekly check', '2h 20m']], 'Within target · goal: under 4h']);
});
