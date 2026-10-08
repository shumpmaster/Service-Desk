// Time asked of you (AC20), V5 on the Universe footer (AC21), the Agents view (AC22) and usage and
// context figures (AC23), from the dispatch log, history reads and status/outcomes.jsonl.
// ac-test: S-001/AC20 ac-test: S-001/AC21 ac-test: S-001/AC22 ac-test: S-001/AC23
// join-test: S-001/J10 — the sample dispatch/outcome pair J10 quotes (from the real
// dispatch-log/2026-10.jsonl), the real status/outcomes.jsonl at dd71b14 (no usage yet), and J10's
// three outcomes.jsonl lines with their exact expected drill-downs (sample line 1 without usage; the
// fixture line in model S-020's frozen form; the real Q-011 line with three nulls).
// join-test: S-001/J2 — raised and answered times, waits, proxy, and V5's counted time.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildModel, parseRecord } from '../../src/lib/model.js';
import { parseOutcomes, markRetries, NOT_AVAILABLE, NOT_RECORDED, USAGE_KEYS, USAGE_OTHER_KEYS } from '../../src/lib/records.js';
import { cardRows, cardSummary, v5Waits, v5Line, sessionRows, timelines, usageView, usageLines, V25_NO_CARDS, V25_ANSWERED } from '../../src/lib/asked.js';
import { countedMs, hoursMinutes, median } from '../../src/lib/timefmt.js';
import { fixture, CONFIG, SD, POOM } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadApp } from './page-harness.mjs';

const H = 3600e3;
const LOG = 'dispatch-log/2026-10.jsonl';
const realLog = () => {
  const r = parseRecord('log', fixture(`service-desk/${LOG}`), LOG);
  markRetries(r.entries); // as buildModel does
  return r;
};
const sha = (n) => n.toString(16).padStart(40, '0');
const treeOf = (paths) => new Map(paths.map((p, i) => [p, { sha: sha(i + 1) }]));
const line = (o) => JSON.stringify(o);

// A small log around 2026-10-20 (a Tuesday), in the real shapes.
const synth = [
  line({ action: 'card', item: 'P-007', gate: 'dor', card: 1, time: '2026-10-16T13:00:00Z' }), // Fri 08:00 CDT
  line({ trigger: 'decision', item: 'P-007', gate: 'dor', card: 1, record: 'decisions/P-007/dor-1.md', word: 'build', proxy: false, result: 'ready', time: '2026-10-16T15:00:00Z' }),
  line({ action: 'card', item: 'P-008', gate: 'stop', card: 2, time: '2026-10-17T02:00:00Z' }), // Fri 21:00 CDT
  line({ trigger: 'decision', item: 'P-008', gate: 'stop', card: 2, record: 'decisions/P-008/stop-2.md', word: 'drop', proxy: true, result: 'closed/drop', time: '2026-10-19T13:00:00Z' }), // Mon 08:00 CDT
  line({ action: 'card', item: 'P-009', gate: 'dor', card: 1, time: '2026-10-20T14:00:00Z' }), // open, Tue 09:00 CDT
  line({ action: 'card', item: 'P-010', gate: 'dor', card: 1, time: '2026-10-19T14:00:00Z' }), // answer on main, not logged
  line({ action: 'card', item: 'P-011', gate: 'dor', card: 1, time: '2026-10-18T14:00:00Z' }), // withdrawn
  line({ action: 'card', item: 'P-001', gate: 'stop', card: 9, time: '2026-09-01T14:00:00Z' }), // older than 30 days
].join('\n');
const NOW = new Date('2026-10-20T16:00:00Z'); // Tue 11:00 CDT

function synthModel(extra = {}) {
  const tree = treeOf([LOG, 'queue/P-007-dor-1.md', 'decisions/P-007/dor-1.md', 'queue/P-008-stop-2.md', 'decisions/P-008/stop-2.md',
    'queue/P-009-dor-1.md', 'queue/P-010-dor-1.md', 'decisions/P-010/dor-1.md', 'decisions/questions/Q-020-a.md',
    'decisions/questions/P-001-session.md', 'questions/Q-021-b.md', ...(extra.paths || [])]);
  const records = new Map([[LOG, parseRecord('log', synth, LOG)],
    ['decisions/questions/Q-020-a.md', parseRecord('ruling', 'Ruling: B\nProxy: done at the owner\'s request\n')]]);
  const history = new Map([
    ['decisions/questions/Q-020-a.md', { oldest: '2026-10-15T20:00:00Z' }], ['questions/Q-020-a.md', { oldest: '2026-10-15T14:00:00Z' }],
    ['decisions/questions/P-001-session.md', { oldest: '2026-10-15T20:00:00Z' }], ['questions/P-001-session.md', { oldest: null }],
    ['questions/Q-021-b.md', { oldest: '2026-10-20T12:00:00Z' }],
  ]);
  return buildModel({ project: SD, config: CONFIG, tree, records, history, now: NOW, pullPages: [], checkPages: [] });
}

test('AC20 + J2: cards raised in the last 30 days, with raised, answered, wait and proxy; open, recording… and withdrawn', () => {
  const t = synthModel().timeAsked;
  const by = Object.fromEntries(t.cards.map((r) => [r.label, r]));
  assert.deepEqual(Object.keys(by).sort(), ['P-007 dor-1', 'P-008 stop-2', 'P-009 dor-1', 'P-010 dor-1', 'P-011 dor-1']);
  assert.equal(by['P-007 dor-1'].waitMs, 2 * H);
  assert.equal(by['P-007 dor-1'].proxy, false);
  assert.equal(by['P-008 stop-2'].proxy, true);
  assert.equal(by['P-008 stop-2'].waitMs, 59 * H);
  assert.equal(by['P-009 dor-1'].state, 'open');
  assert.equal(by['P-009 dor-1'].waitMs, 2 * H, 'an open card shows its wait so far');
  assert.equal(by['P-010 dor-1'].state, 'recording');
  assert.equal(by['P-010 dor-1'].waitMs, null);
  assert.equal(by['P-011 dor-1'].state, 'withdrawn');
  // The summary: last 14 days, open cards included, "recording…" and withdrawn left out.
  assert.deepEqual(t.summary, { count: 3, medianMs: 2 * H });
});

test('AC20: owner questions — open with their wait so far, answered from their rulings; a ruling with no question history isn\'t listed', () => {
  const qs = synthModel().timeAsked.questions;
  assert.deepEqual(qs.map((q) => [q.label, q.state]), [['Q-021-b', 'open'], ['Q-020-a', 'answered']]);
  assert.equal(qs[0].waitMs, 4 * H);
  assert.equal(qs[1].waitMs, 6 * H);
  assert.equal(qs[1].ruling, 'B');
  assert.equal(qs[1].proxy, true);
});

test('AC20: a v2.5 project shows "no cards", its open questions only, and the ledger note', () => {
  const tree = treeOf(['docs/LEDGER.md', 'questions/Q-030-x.md']);
  const history = new Map([['questions/Q-030-x.md', { oldest: '2026-10-20T15:00:00Z' }]]);
  const m = buildModel({ project: POOM, config: CONFIG, tree, records: new Map(), history, now: NOW, pullPages: [], checkPages: [] });
  assert.equal(m.timeAsked.cards, null);
  assert.equal(m.timeAsked.cardsText, V25_NO_CARDS);
  assert.equal(V25_NO_CARDS, 'no cards in operating model v2.5.1');
  assert.equal(m.timeAsked.answeredText, 'answered questions: not recorded (operating model v2.5.1 records rulings in the ledger)');
  assert.equal(V25_ANSWERED, m.timeAsked.answeredText);
  assert.deepEqual(m.timeAsked.questions.map((q) => [q.label, q.waitMs]), [['Q-030-x', H]]);
  assert.deepEqual(m.v5Waits, [], 'V5 covers v3 projects only');
});

test('AC21 + J2: V5\'s counted time — Friday 21:00 to Monday 08:00 counts 2 h; nights and weekends don\'t count; DST is handled', () => {
  const clock = CONFIG.v5Clock;
  const tz = CONFIG.ownerTimeZone;
  assert.equal(countedMs(Date.parse('2026-10-17T02:00:00Z'), Date.parse('2026-10-19T13:00:00Z'), clock, tz), 2 * H);
  // Across the end of daylight saving (1 November 2026): Friday 21:00 CDT to Monday 08:00 CST.
  assert.equal(countedMs(Date.parse('2026-10-31T02:00:00Z'), Date.parse('2026-11-02T14:00:00Z'), clock, tz), 2 * H);
  assert.equal(countedMs(Date.parse('2026-10-17T04:00:00Z'), Date.parse('2026-10-19T11:00:00Z'), clock, tz), 0, 'Fri 23:00 to Mon 06:00');
  assert.equal(countedMs(0, 5 * H, null, tz), 5 * H, 'v5Clock null: elapsed time');
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 3, 2]), 2.5);
});

test('AC21: the footer line — median counted wait over every v3 project\'s cards of the last 14 days, open ones so far', () => {
  const m = synthModel();
  // P-007 2 h, P-008 2 h counted, P-009 open Tue 09:00–11:00 CDT 2 h; P-010 (recording) and P-011 (withdrawn) left out.
  assert.deepEqual(m.v5Waits, [2 * H, 2 * H, 2 * H]);
  assert.equal(v5Line(m.v5Waits, hoursMinutes), 'Median answer time, weekday cards, last 14 days: 2h 0m (goal under 4h; 3 cards)');
  assert.equal(v5Line([], hoursMinutes), 'Median answer time, weekday cards, last 14 days: no weekday cards in the last 14 days');
  assert.equal(v5Line([90 * 60e3, 5 * H + 1000], hoursMinutes), 'Median answer time, weekday cards, last 14 days: 3h 15m (goal under 4h; 2 cards)');
  // Hold and merge cards have no `card` entry, so they never count.
  const rows = cardRows(parseRecord('log', synth, LOG).entries, treeOf([]), NOW.getTime());
  assert.equal(v5Waits(rows, NOW.getTime(), CONFIG).length, 2, 'with no card files on main, only answered cards count');
});

test('Page AC21: the Universe footer carries the V5 line', async () => {
  const repos = {
    'Service-Desk': repo({ 'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl') }, [], []),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], []),
  };
  const app = await loadApp({ repos });
  try {
    await app.advance(1000);
    assert.match(app.els.foot.textContent, /^Median answer time, weekday cards, last 14 days: /);
  } finally {
    app.restore();
  }
});

test('AC22 + J10: the sample pair — P-001 critic, 16:40:19 to 18:48:58, 2 h 8 min 39 s, ok, verdict FAIL', () => {
  const entries = realLog().entries;
  const rows = sessionRows(entries, null, new Map(), Date.parse('2026-10-07T12:00:00Z'));
  const s = rows.find((r) => r.session === 'P-001:define-to-plan-review:2026-10-06T16:40:19Z');
  assert.equal(s.item, 'P-001');
  assert.equal(s.role, 'critic');
  assert.equal(s.start, Date.parse('2026-10-06T16:40:19Z'));
  assert.equal(s.end, Date.parse('2026-10-06T18:48:58Z'));
  assert.equal(s.runMs, (2 * 3600 + 8 * 60 + 39) * 1000);
  assert.equal(s.result, 'ok');
  assert.equal(s.verdict, 'FAIL');
  assert.equal(s.usage, null);
  // The retry J9 names: the P-001 definer re-dispatched at 2026-10-05T22:50:13Z after an error.
  const retry = rows.find((r) => r.start === Date.parse('2026-10-05T22:50:13Z'));
  assert.equal(retry.retry, true);
  assert.equal(retry.role, 'definer');
  // Only the last 14 days.
  assert.ok(rows.every((r) => Date.parse('2026-10-07T12:00:00Z') - r.start <= 14 * 86400e3));
});

test('AC22: a running session shows its elapsed time; a dispatch with no outcome otherwise says so; timelines are in time order', () => {
  const log = parseRecord('log', [
    line({ action: 'dispatch', item: 'P-020', role: 'builder', route: 'build', stage: 5, time: '2026-10-20T14:00:00Z' }),
    line({ action: 'dispatch', item: 'P-021', role: 'critic', route: 'review', stage: 3, time: '2026-10-20T10:00:00Z' }),
    line({ action: 'card', item: 'P-020', gate: 'dor', card: 1, time: '2026-10-20T12:00:00Z' }),
    line({ trigger: 'decision', item: 'P-020', gate: 'dor', card: 1, record: 'decisions/P-020/dor-1.md', word: 'build', proxy: false, time: '2026-10-20T13:00:00Z' }),
  ].join('\n'), LOG).entries;
  const now = NOW.getTime();
  const rows = sessionRows(log, null, new Map([['P-020', '2026-10-20T14:00:00Z']]), now);
  const running = rows.find((r) => r.item === 'P-020');
  assert.equal(running.running, true);
  assert.equal(running.runMs, 2 * H);
  assert.equal(rows.find((r) => r.item === 'P-021').noOutcome, true);
  const cards = cardRows(log, treeOf(['queue/P-020-dor-1.md', 'decisions/P-020/dor-1.md']), now);
  const tl = timelines(rows, cards, now).find((x) => x.item === 'P-020');
  assert.deepEqual(tl.events.map((e) => [e.kind, e.start]), [['card', Date.parse('2026-10-20T12:00:00Z')], ['session', Date.parse('2026-10-20T14:00:00Z')]]);
  assert.equal(tl.events[0].end, Date.parse('2026-10-20T13:00:00Z'));
  assert.equal(tl.events[1].end, now, 'a running session runs to now');
});

test('AC23 + J10: usage in the frozen form shows tokens by kind, turns, and the peak as tokens and percentages', () => {
  const { bySession, notes } = parseOutcomes(fixture('service-desk/status/outcomes-usage-frozen.jsonl'));
  assert.deepEqual(notes, []);
  const rows = sessionRows(realLog().entries, bySession, new Map(), Date.parse('2026-10-07T12:00:00Z'));
  const s = rows.find((r) => r.session === 'P-001:define-to-plan-review:2026-10-06T16:40:19Z');
  const u = usageView(s);
  assert.deepEqual(u, { recorded: true, input_tokens: 10, output_tokens: 707, cache_read_input_tokens: 168160,
    cache_creation_input_tokens: 11120, num_turns: 7, duration_ms: 18392, context_window: 1000000,
    autocompact_threshold: 784000, context_peak: 36494, compactions: 0, derived: ['context_peak'],
    would_have_stopped: false, cost_usd_estimate: 0.0854731, context_peak_percent: 3.6, threshold_percent: 4.7 });
  // A session in the log with no outcomes.jsonl line: timeline only, usage "not recorded".
  const other = rows.find((r) => r.session !== s.session);
  assert.deepEqual(usageView(other), { recorded: false, words: 'not recorded' });
});

test('AC23 + J10: the real outcomes.jsonl (no usage yet) shows "not recorded"; null or unreported is "not available"; a non-integer is named and "not recorded"', () => {
  const real = parseOutcomes(fixture('service-desk/status/outcomes.jsonl'));
  assert.deepEqual(real.notes, []);
  assert.ok(Object.keys(real.bySession).length >= 70);
  assert.ok(Object.values(real.bySession).every((r) => r.usage === null), 'none carry usage yet: "not recorded"');
  const odd = parseOutcomes([
    line({ session: 'S:1', usage: { input_tokens: 5, output_tokens: null, cache_read_input_tokens: 1.5, num_turns: 2, context_peak: 100 } }),
    line({ session: 42, usage: {} }),
    line({ session: 'S:3', usage: 'lots' }),
  ].join('\n'));
  const u = usageView({ usage: odd.bySession['S:1'].usage });
  assert.equal(u.input_tokens, 5);
  assert.equal(u.output_tokens, NOT_AVAILABLE, 'null: not available');
  assert.equal(u.cache_creation_input_tokens, NOT_AVAILABLE, 'a figure the record lacks: not available');
  assert.equal(u.cache_read_input_tokens, 'not recorded');
  assert.equal(u.context_window, NOT_AVAILABLE);
  assert.equal(u.context_peak_percent, NOT_AVAILABLE, 'the percentage only when both are present');
  assert.ok(odd.notes.some((n) => n === 'status/outcomes.jsonl line 1 field usage.cache_read_input_tokens: expected a whole number; shown as not recorded'));
  assert.ok(odd.notes.some((n) => n === 'status/outcomes.jsonl line 2 field session: expected a string; line skipped'), 'AC31\'s example');
  assert.equal(odd.bySession['S:3'].usage, null);
  assert.ok(odd.notes.some((n) => n.startsWith('status/outcomes.jsonl line 3 field usage')));
});

test('Page AC22/AC23: the Agents view lists sessions with run time, result, verdict and usage words', async () => {
  const repos = {
    'Service-Desk': repo({
      'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
      'status/outcomes.jsonl': fixture('service-desk/status/outcomes-usage-frozen.jsonl'),
    }, [], []),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], []),
  };
  const realNow = Date.now;
  const app = await loadApp({ hash: '#/p/Service-Desk/agents', repos, now: Date.parse('2026-10-07T12:00:00Z') });
  try {
    await app.advance(1000);
    const text = app.els.view.textContent;
    assert.match(text, /P-001 critic/);
    assert.match(text, /ran 2 h 8 min/);
    assert.match(text, /ok, verdict FAIL/);
    assert.match(text, /Tokens: input 10, output 707, cache read 168,160, cache write 11,120 · turns 7/);
    assert.match(text, /Context peak: 36,494 tokens, 3.6% of a 1,000,000-token window/);
    assert.match(text, /Usage: not recorded/);
    assert.match(text, /Timeline by item/);
  } finally {
    app.restore();
    Date.now = realNow;
  }
});

// ---------------------------------------------------------------------------
// join-test: S-001/J10 — J10's three outcomes.jsonl lines (tests/desk/fixtures/service-desk/status/
// outcomes-j10.jsonl), each with the exact drill-down J10 states for it.

const J10_LINES = () => parseOutcomes(fixture('service-desk/status/outcomes-j10.jsonl'));

test('J10 join test, line 1: sample line 1 (real, no usage) — every usage figure "not recorded"', () => {
  const { bySession, notes } = J10_LINES();
  assert.deepEqual(notes, []);
  const row = bySession['Q-001:ready-dispatch:2026-10-01T01:46:42Z'];
  assert.equal(row.usage, null);
  assert.deepEqual(usageView(row), { recorded: false, words: 'not recorded' });
  assert.deepEqual(usageLines(row), ['Usage: not recorded']);
});

test('J10 join test, line 2: the fixture line in the frozen form — every figure, the derived label, both percentages, "estimate $0.09"', () => {
  const row = J10_LINES().bySession['P-001:define-to-plan-review:2026-10-09T09:00:00Z'];
  const u = usageView(row);
  // input 10, output 707, cache read 168,160, cache write 11,120; 7 turns; run time 18 s; peak
  // 36,494 tokens, derived from per-turn usage, 3.6 % of the window, 4.7 % of the compaction
  // threshold; would have stopped: no; 0 compactions; estimate $0.09.
  assert.equal(u.context_peak_percent, 3.6);
  assert.equal(u.threshold_percent, 4.7);
  assert.deepEqual(usageLines(row), [
    'Tokens: input 10, output 707, cache read 168,160, cache write 11,120 · turns 7',
    'Run time (agent tool): 18 s',
    'Context peak: 36,494 tokens, 3.6% of a 1,000,000-token window (derived from per-turn usage)',
    'Peak, share of the compaction threshold: 4.7% of 784,000 tokens',
    'Would have stopped: no',
    'Compactions: 0',
    'Cost: estimate $0.09',
  ]);
});

test('J10 join test, line 3: the real Q-011 line with three nulls — threshold %, would have stopped and compactions "not available"', () => {
  const row = J10_LINES().bySession['Q-011:research-to-source:2026-10-08T16:59:31Z'];
  const u = usageView(row);
  assert.equal(u.autocompact_threshold, NOT_AVAILABLE);
  assert.equal(u.would_have_stopped, NOT_AVAILABLE);
  assert.equal(u.compactions, NOT_AVAILABLE);
  // input 8, output 2,418, cache read 29,181, cache write 20,367; 11 turns; run time 41 s; peak
  // 20,369 tokens, derived from per-turn usage, 2.0 % of the window; % of the compaction threshold
  // "not available"; would have stopped "not available"; compactions "not available"; estimate $0.16.
  assert.deepEqual(usageLines(row), [
    'Tokens: input 8, output 2,418, cache read 29,181, cache write 20,367 · turns 11',
    'Run time (agent tool): 41 s',
    'Context peak: 20,369 tokens, 2.0% of a 1,000,000-token window (derived from per-turn usage)',
    'Peak, share of the compaction threshold: not available',
    'Would have stopped: not available',
    'Compactions: not available',
    'Cost: estimate $0.16',
  ]);
});

test('AC23 + J10: the frozen form\'s keys, and the three keys that are not whole numbers', () => {
  assert.deepEqual(USAGE_KEYS, ['input_tokens', 'output_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens',
    'num_turns', 'duration_ms', 'context_window', 'autocompact_threshold', 'context_peak', 'compactions']);
  assert.deepEqual(USAGE_OTHER_KEYS, ['derived', 'would_have_stopped', 'cost_usd_estimate']);
  // would have stopped: yes; a cost is never a charge; a figure `derived` names carries the label.
  const yes = usageLines({ usage: { ...J10_LINES().bySession['P-001:define-to-plan-review:2026-10-09T09:00:00Z'].usage,
    would_have_stopped: true, derived: ['context_peak', 'num_turns'] } });
  assert.ok(yes.includes('Would have stopped: yes'));
  assert.match(yes[0], / · turns 7 \(derived from per-turn usage\)$/);
  assert.ok(yes.every((l) => !/charge|charged|billed/i.test(l)));
  // No label when `derived` doesn't name the peak.
  const plain = usageLines({ usage: { ...J10_LINES().bySession['P-001:define-to-plan-review:2026-10-09T09:00:00Z'].usage, derived: [] } });
  assert.ok(plain.every((l) => !l.includes('derived from per-turn usage')));
  // A percentage needs both its figures: no window or no peak, no percentages.
  const noWin = usageView({ usage: { context_peak: 5, context_window: NOT_AVAILABLE, autocompact_threshold: 100 } });
  assert.equal(noWin.context_peak_percent, NOT_AVAILABLE);
  assert.equal(noWin.threshold_percent, 5);
  const noPeak = usageView({ usage: { context_peak: NOT_AVAILABLE, context_window: 100, autocompact_threshold: 100 } });
  assert.equal(noPeak.context_peak_percent, NOT_AVAILABLE);
  assert.equal(noPeak.threshold_percent, NOT_AVAILABLE);
  // Run time to the nearest second.
  assert.deepEqual([18392, 40999, 499, 125400, 3603000].map((ms) => usageLines({ usage: { duration_ms: ms } })[1]),
    ['Run time (agent tool): 18 s', 'Run time (agent tool): 41 s', 'Run time (agent tool): 0 s',
      'Run time (agent tool): 2 min 5 s', 'Run time (agent tool): 1 h 0 min 3 s']);
  assert.equal(usageLines({ usage: { cost_usd_estimate: NOT_AVAILABLE } })[6], 'Cost: not available');
});

test('AC23 + J10: a usage key of the wrong kind is named in notes and shown "not recorded"; only that key, the rest still show', () => {
  const { bySession, notes } = parseOutcomes([
    line({ session: 'W:1', usage: { input_tokens: 3, derived: 'context_peak', context_peak: 50, context_window: 100 } }),
    line({ session: 'W:2', usage: { input_tokens: 3, derived: ['context_peak', 7] } }),
    line({ session: 'W:3', usage: { would_have_stopped: 'no', compactions: 0 } }),
    line({ session: 'W:4', usage: { cost_usd_estimate: '0.08', num_turns: 2 } }),
    line({ session: 'W:5', usage: { autocompact_threshold: 784000.5, context_peak: 10, cost_usd_estimate: 1 } }),
  ].join('\n'));
  assert.deepEqual(notes, [
    'status/outcomes.jsonl line 1 field usage.derived: expected a list of figure names; shown as not recorded',
    'status/outcomes.jsonl line 2 field usage.derived: expected a list of figure names; shown as not recorded',
    'status/outcomes.jsonl line 3 field usage.would_have_stopped: expected true, false or null; shown as not recorded',
    'status/outcomes.jsonl line 4 field usage.cost_usd_estimate: expected a number or null; shown as not recorded',
    'status/outcomes.jsonl line 5 field usage.autocompact_threshold: expected a whole number; shown as not recorded',
  ]);
  const w1 = usageLines(bySession['W:1']);
  assert.match(w1[0], /^Tokens: input 3, /);
  assert.equal(w1[2], 'Context peak: 50 tokens, 50.0% of a 100-token window', 'no derived list, no label');
  assert.equal(w1[w1.length - 1], 'Which figures are derived: not recorded');
  assert.equal(bySession['W:2'].usage.derived, NOT_RECORDED);
  const w3 = usageLines(bySession['W:3']);
  assert.ok(w3.includes('Would have stopped: not recorded'));
  assert.ok(w3.includes('Compactions: 0'));
  const w4 = usageLines(bySession['W:4']);
  assert.ok(w4.includes('Cost: not recorded'));
  assert.match(w4[0], / · turns 2$/);
  const w5 = usageView(bySession['W:5']);
  assert.equal(w5.autocompact_threshold, NOT_RECORDED);
  assert.equal(w5.threshold_percent, NOT_AVAILABLE, 'a percentage needs both its figures');
  assert.equal(usageLines(bySession['W:5'])[6], 'Cost: estimate $1.00');
});

/** Every element under `node` (the fake DOM's tree). */
function allElements(node, out = []) {
  for (const c of node.children || []) {
    if (c.tag) out.push(c);
    allElements(c, out);
  }
  return out;
}

test('Page AC23: the figures sit behind each session\'s drill-down, not on its timeline row', async () => {
  const repos = {
    'Service-Desk': repo({
      'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
      'status/outcomes.jsonl': fixture('service-desk/status/outcomes-usage-frozen.jsonl'),
    }, [], []),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], []),
  };
  const realNow = Date.now;
  const app = await loadApp({ hash: '#/p/Service-Desk/agents', repos, now: Date.parse('2026-10-07T12:00:00Z') });
  try {
    await app.advance(1000);
    const els = allElements(app.els.view);
    const details = els.filter((e) => e.tag === 'details');
    const critic = details.find((d) => d.children[0].tag === 'summary' && d.children[0].textContent.includes('P-001 critic')
      && d.textContent.includes('Tokens:'));
    assert.ok(critic, 'the session is a drill-down whose summary is the session row');
    const summary = critic.children[0].textContent;
    assert.match(summary, /ok, verdict FAIL/);
    assert.ok(!/Tokens|Context peak|estimate \$/.test(summary), 'figures are not on the session row itself');
    const body = critic.children.slice(1).map((c) => c.textContent).join('\n');
    for (const l of ['Run time (agent tool): 18 s', 'Peak, share of the compaction threshold: 4.7% of 784,000 tokens',
      'Would have stopped: no', 'Compactions: 0', 'Cost: estimate $0.09']) assert.ok(body.includes(l), l);
    const timeline = els.filter((e) => e.tag === 'ol' && e.className === 'timeline').map((e) => e.textContent).join('\n');
    assert.ok(timeline.length > 0);
    assert.ok(!/Tokens|Context peak|estimate \$|not recorded|not available/.test(timeline), 'no figures on the timeline rows');
  } finally {
    app.restore();
    Date.now = realNow;
  }
});

test('Page AC20: "Time asked of you" for a v3 and a v2.5 project', async () => {
  const repos = {
    'Service-Desk': repo({ 'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
      'queue/P-001-stop-6.md': fixture('service-desk/queue/P-001-stop-6.md'), 'decisions/P-001/stop-6.md': 'Decision: re-scope\n' }, [], []),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'),
      'questions/Q-030-x.md': fixture('service-desk/questions/Q-005-sources.md') }, [], []),
  };
  let app = await loadApp({ hash: '#/p/Service-Desk/asked', repos, now: Date.parse('2026-10-07T12:00:00Z') });
  try {
    await app.advance(1000);
    const text = app.els.view.textContent;
    assert.match(text, /Last 14 days: \d+ cards?, median wait /);
    assert.match(text, /P-001 stop-6raised Oct 6 13:51 · answered Oct 6 16:31 · wait 2 h 39 min · not a proxy · re-scope/);
  } finally {
    app.restore();
  }
  app = await loadApp({ hash: '#/p/Personal-Org-Operating-Model/asked', repos, now: Date.parse('2026-10-07T12:00:00Z') });
  try {
    await app.advance(1000);
    const text = app.els.view.textContent;
    assert.match(text, /no cards in operating model v2\.5\.1/);
    assert.match(text, /Q-030-x/);
    assert.match(text, /answered questions: not recorded \(operating model v2\.5\.1 records rulings in the ledger\)/);
  } finally {
    app.restore();
  }
});
