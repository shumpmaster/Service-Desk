// join-test: S-001/J4 — the owner's plan (milestones only, no dates) → Work ahead → Chief of Staff
// join-test: S-001/J14 — the Chief of Staff's estimate record → Work ahead
// join-test: S-001/J15 — the later-work list and its asks → "Not milestones yet" → Chief of Staff
// Spec S-001, "Work ahead by milestones" (2026-10-18, draft 5). Every plan, estimate, list, ask,
// question and answer here is made up (NOT a real record), in J4's, J14's and J15's forms; the
// milestones are Service-Desk's real ones at 77bfeae (tests/desk/fixtures/j11-77bfeae/).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  planFiles, nextPlanName, parsePlan, planBody, planPath, parseEstimates, latestEstimates, parseLaterWork, laterRows, askPath, askBody,
  estimateStanding, ESTIMATES_PATH, LATER_WORK_PATH, PLAN_PATH_RE, SKEW_MS,
} from '../../src/lib/workahead.js';
import { neededReads } from '../../src/lib/model.js';
import { gitSha } from './fake-desk.mjs';
import { loadSandbox, findAll } from './sandbox-helpers.mjs';
import { SD, POOM, TZ, viewOf, finishes, estLine, WORKED, LATER, planText, waSetup, memStore, j77Files, snapOf } from './wa-fixtures.mjs';

const at = (s) => Date.parse(s);
const NOW = at('2026-10-18T18:00:00Z'); // 18 Oct, 13:00 in Chicago
const treeOf = (paths) => new Map(paths.map((p) => [p, { sha: gitSha(p), size: 1 }]));
const SIX = ['MD1', 'MD2', 'MD3', 'M3A', 'M3B', 'M3C'];
const codes = (v) => v.rows.map((r) => r.code);

// ---------------------------------------------------------------------------
// J4

test('J4: the next plan\'s name is the minute in UTC with the lowest free <nn>: -01, then -02; a minute boundary starts again at -01', () => {
  const t = at('2026-11-02T09:30:59.999Z');
  assert.equal(nextPlanName(new Map(), t), '2026-11-02T0930Z-01');
  assert.equal(nextPlanName(treeOf(['docs/planning/2026-11-02T0930Z-01.md']), t), '2026-11-02T0930Z-02');
  assert.equal(nextPlanName(treeOf(['docs/planning/2026-11-02T0930Z-01.md', 'docs/planning/2026-11-02T0930Z-02.md']), t), '2026-11-02T0930Z-03');
  assert.equal(nextPlanName(treeOf(['docs/planning/2026-11-02T0930Z-02.md']), t), '2026-11-02T0930Z-01', 'the lowest free, not the next after the highest');
  assert.equal(nextPlanName(treeOf(['docs/planning/2026-11-02T0930Z-01.md']), t + 1), '2026-11-02T0931Z-01', 'the next minute starts at -01');
  // The minute is UTC's, not Chicago's (at 23:30 in Chicago it is already the next day in UTC).
  assert.equal(nextPlanName(new Map(), at('2026-10-19T04:30:00Z')), '2026-10-19T0430Z-01');
});

test('J4: the current plan is the greatest name in byte order; names out of form are ignored for ordering and named as "can\'t parse"', () => {
  const pf = planFiles(treeOf(['docs/planning/2026-11-02T0930Z-02.md', 'docs/planning/2026-11-02T0931Z-01.md', 'docs/planning/2026-11-02T0930Z-01.md',
    'docs/planning/notes.md', 'docs/planning/2026-11-02T0930Z-1.md', 'docs/PROJECT.md']));
  assert.deepEqual(pf.names, ['2026-11-02T0930Z-01', '2026-11-02T0930Z-02', '2026-11-02T0931Z-01']);
  assert.equal(pf.current, '2026-11-02T0931Z-01');
  assert.deepEqual(pf.odd, ['docs/planning/2026-11-02T0930Z-1.md', 'docs/planning/notes.md']);
  assert.equal(planFiles(new Map()).current, null);
  const v = viewOf({ extra: { 'docs/planning/notes.md': 'x\n' }, nowMs: NOW });
  assert.ok(v.notes.includes("docs/planning/notes.md: can't parse (not a plan's name)"));
});

test('J4: a plan\'s body as the page writes it reads back to the same order; milestones only, with no date and no estimate', () => {
  const rows = ['M3A', 'MD3', 'MD1'].map((id) => ({ project: 'Service-Desk', milestone: id }));
  const body = planBody('2026-10-19T1405Z-01', '2026-10-18T1130Z-01', rows);
  assert.equal(body, 'Plan: 2026-10-19T1405Z-01\nSupersedes: 2026-10-18T1130Z-01\n\n| Order | Project | Milestone |\n|---|---|---|\n'
    + '| 1 | Service-Desk | M3A |\n| 2 | Service-Desk | MD3 |\n| 3 | Service-Desk | MD1 |\n');
  const p = parsePlan(body);
  assert.equal(p.ok, true);
  assert.deepEqual(p.rows.map((r) => [r.order, r.project, r.milestone]), [[1, 'Service-Desk', 'M3A'], [2, 'Service-Desk', 'MD3'], [3, 'Service-Desk', 'MD1']]);
  assert.equal(p.planLine, '2026-10-19T1405Z-01');
  assert.equal(p.supersedes, '2026-10-18T1130Z-01');
  assert.doesNotMatch(body, /Oct|Nov|days|[0-9]{4}-[0-9]{2}-[0-9]{2}(?!T)/, 'no date of work and no estimate');
  assert.equal(planBody('2026-10-19T1405Z-01', null, []).split('\n')[1], 'Supersedes: none');
  // Cells are trimmed; rows are read in their Order.
  const loose = parsePlan('Plan: x\nSupersedes: none\n\n|Order|  Project |Milestone|\n|---|---|---|\n| 2 |Service-Desk| MD3 |\n|1| Service-Desk |M3A|\n');
  assert.deepEqual(loose.rows.map((r) => r.milestone), ['M3A', 'MD3']);
});

test('J4: can\'t parse — the earlier form\'s header, no table, a gap in Order; an empty plan is allowed', () => {
  const old = parsePlan('Plan: x\nSupersedes: none\n\n| Order | Project | Item | Not before (UTC) |\n|---|---|---|---|\n| 1 | Service-Desk | P-001 | 2026-11-02T00:00Z |\n');
  assert.equal(old.ok, false);
  assert.equal(parsePlan('Plan: x\nno table\n').ok, false);
  const gap = parsePlan('| Order | Project | Milestone |\n|---|---|---|\n| 1 | Service-Desk | MD3 |\n| 3 | Service-Desk | M3A |\n');
  assert.equal(gap.ok, false);
  assert.match(gap.why, /1, 2, 3/);
  const empty = parsePlan('Plan: x\nSupersedes: none\n\n| Order | Project | Milestone |\n|---|---|---|\n');
  assert.equal(empty.ok, true);
  assert.deepEqual(empty.rows, []);
  // On the screen: an earlier-form plan is "can't be read", and section 3's order is used.
  const name = '2026-10-18T1130Z-01';
  const v = viewOf({ extra: { [planPath(name)]: '| Order | Project | Item | Not before (UTC) |\n|---|---|---|---|\n' }, nowMs: NOW });
  assert.deepEqual(codes(v), SIX);
  assert.equal(v.orderLine, `Your latest plan can't be read: ${name}; shown in the project document's order`);
  assert.ok(v.rows.every((r) => !r.notInPlan));
  // An empty plan: no ordering preference, section 3's order, no "can't parse" and nothing marked.
  const e = viewOf({ extra: { [planPath(name)]: planText(name, []) }, nowMs: NOW });
  assert.deepEqual(codes(e), SIX);
  assert.equal(e.orderLine, null);
  assert.ok(e.rows.every((r) => !r.notInPlan));
  assert.equal(e.stateLine.lead, 'Current plan');
});

test('J4: rows the desk can\'t place are ignored with a note — an unknown id, a project not connected, a v2.5 project; a repeated row keeps its first place', () => {
  const name = '2026-10-18T1130Z-01';
  const text = 'Plan: 2026-10-18T1130Z-01\nSupersedes: none\n\n| Order | Project | Milestone |\n|---|---|---|\n'
    + '| 1 | Service-Desk | M3B |\n| 2 | Service-Desk | M9Z |\n| 3 | Elsewhere | M1 |\n| 4 | Personal-Org-Operating-Model | M1 |\n| 5 | Service-Desk | MD3 |\n| 6 | Service-Desk | M3B |\n';
  const v = viewOf({ extra: { [planPath(name)]: text }, nowMs: NOW });
  assert.deepEqual(codes(v), ['M3B', 'MD3', 'MD1', 'MD2', 'M3A', 'M3C']);
  for (const n of ['the plan names Service-Desk M9Z, which is not a milestone the desk reads', 'the plan names Elsewhere M1, which is not a milestone the desk reads',
    'the plan names Personal-Org-Operating-Model M1, which is not a milestone the desk reads', 'the plan lists Service-Desk M3B again (row 6); its first place counts']) {
    assert.ok(v.notes.includes(n), n);
  }
  assert.deepEqual(v.rows.filter((r) => r.notInPlan).map((r) => r.code), ['MD1', 'MD2', 'M3A', 'M3C'], 'the unlisted ones, after, in section 3\'s order, marked');
});

test('J4: a plan listing a reached and a dropped milestone leaves both out of the order; a Plan: line that does not match and a missing Supersedes: are named, the table still read', () => {
  const name = '2026-10-18T1130Z-01';
  const doc = j77Files()['docs/PROJECT.md'].replace('· phase: Launch\n', '· phase: Launch\n- An idea let go (M3D) · done when it is let go · phase: Build · dropped\n');
  const text = 'Plan: 2026-10-18T1129Z-01\n\n| Order | Project | Milestone |\n|---|---|---|\n| 1 | Service-Desk | M1 |\n| 2 | Service-Desk | M3D |\n| 3 | Service-Desk | M3C |\n';
  const v = viewOf({ extra: { 'docs/PROJECT.md': doc, [planPath(name)]: text }, nowMs: NOW });
  assert.deepEqual(codes(v), ['M3C', 'MD1', 'MD2', 'MD3', 'M3A', 'M3B']);
  assert.deepEqual(v.reached.map((x) => x.code), ['M1', 'M2', 'M2B']);
  assert.deepEqual(v.dropped.map((x) => x.code), ['M3D']);
  assert.ok(v.notes.includes(`plan ${name}: its Plan: line reads 2026-10-18T1129Z-01, not its name`));
  assert.ok(v.notes.includes(`plan ${name}: no Supersedes: line`));
});

test('J4: the page reads the current plan only, an optional read, in the planning project only', () => {
  const tree = treeOf(['docs/planning/2026-10-18T1130Z-01.md', 'docs/planning/2026-10-19T1405Z-01.md', ESTIMATES_PATH, LATER_WORK_PATH,
    'decisions/questions/P-001-later-work-w2.md', 'questions/P-001-later-work-w1.md']);
  const need = neededReads(SD, tree, new Map(), new Date(NOW), { j11: true });
  const opt = need.optional.blobs.map((b) => b.path);
  assert.ok(opt.includes('docs/planning/2026-10-19T1405Z-01.md'));
  assert.ok(!opt.includes('docs/planning/2026-10-18T1130Z-01.md'), 'earlier plans are not fetched');
  assert.ok(opt.includes(ESTIMATES_PATH) && opt.includes(LATER_WORK_PATH) && opt.includes('decisions/questions/P-001-later-work-w2.md'));
  assert.ok(!need.blobs.some((b) => /planning|intake\//.test(b.path)), 'never a needed read');
  assert.deepEqual(neededReads({ ...SD, planning: false }, tree, new Map(), new Date(NOW), { j11: true }).optional.blobs.filter((b) => /planning|intake\//.test(b.path)), []);
  assert.deepEqual(neededReads(SD, tree, new Map(), new Date(NOW), {}).optional.blobs.filter((b) => /planning|intake\//.test(b.path)), [], 'the sandbox only');
  assert.ok(PLAN_PATH_RE.test('docs/planning/2026-10-19T1405Z-01.md'));
});

// ---------------------------------------------------------------------------
// J14

test('J14: two estimates of one milestone, the second counting; a line dated before the one above it is still read, and named', () => {
  const text = [estLine('MD3', 3, 5, '2026-10-17T17:00:00Z'), estLine('MD3', 2, 4, '2026-10-18T09:00:00Z'), estLine('M3A', 4, 7, '2026-10-18T08:00:00Z')].join('\n');
  const v = viewOf({ extra: { [ESTIMATES_PATH]: text }, nowMs: NOW });
  const md3 = v.rows.find((r) => r.code === 'MD3');
  assert.match(md3.estimate.words, /^about 2–4 days of work · your Chief of Staff, 18 Oct$/);
  assert.ok(v.notes.includes('estimates line 3 is dated before line 2'));
  assert.match(v.rows.find((r) => r.code === 'M3A').estimate.words, /about 4–7 days/);
});

test('J14: an estimate\'s date is its time\'s calendar date in ownerTimeZone — either side of Chicago\'s midnight; Z and +00:00 both read', () => {
  const lines = parseEstimates([estLine('MD3', 1, 2, '2026-10-18T04:59:00Z'), estLine('M3A', 1, 2, '2026-10-18T05:00:00+00:00')].join('\n'));
  assert.ok(lines.every((l) => l.ok));
  const v = viewOf({ extra: { [ESTIMATES_PATH]: [estLine('MD3', 1, 2, '2026-10-18T04:59:00Z'), estLine('M3A', 1, 2, '2026-10-18T05:00:00+00:00')].join('\n') }, nowMs: NOW });
  assert.match(v.rows.find((r) => r.code === 'MD3').estimate.words, /your Chief of Staff, 17 Oct$/);
  assert.match(v.rows.find((r) => r.code === 'M3A').estimate.words, /your Chief of Staff, 18 Oct$/);
});

test('J14: a 0–0 estimate is never stale and never past, however old; a stale one (over 7 days) still counts, marked; one run past counts as none', () => {
  const s0 = estimateStanding({ time: at('2026-09-18T17:00:00Z'), low: 0, high: 0 }, true, '2026-10-18', TZ);
  assert.equal(s0.kind, 'zero');
  assert.equal(s0.stale, false);
  const v = viewOf({ extra: { [ESTIMATES_PATH]: [estLine('MD1', 0, 0, '2026-09-18T17:00:00Z'), estLine('MD2', 1, 2, '2026-10-10T17:00:00Z'),
    estLine('MD3', 3, 5, '2026-10-10T17:00:00Z')].join('\n') }, nowMs: NOW });
  const [md1, md2, md3] = v.rows;
  assert.match(md1.estimate.words, /^no work left · waiting on your acceptance · your Chief of Staff, 18 Sep$/);
  assert.equal(md1.finish.words, 'once you accept it');
  // MD2 is under way (work filed): 8 days since its estimate of 1–2 days, so past it.
  assert.equal(md2.estimate.words, 'past its estimate of 1–2 days, made 10 Oct; waiting on a new one');
  assert.equal(md2.finish.words, 'not available: MD2 is past its estimate');
  // MD3, not under way, 8 days old: "may be out of date", still counted (but after MD2, not available).
  assert.match(md3.estimate.words, /^about 3–5 days of work · your Chief of Staff, 10 Oct · may be out of date$/);
  assert.equal(md3.finish.words, 'not available: MD2 is past its estimate');
  assert.equal(v.card, 'not available: MD2 is past its estimate');
});

test('J14: a time 5 minutes after the page\'s clock is read; 11 minutes after is skipped as malformed and named', () => {
  const t5 = new Date(NOW + 5 * 60e3).toISOString().replace('.000Z', 'Z');
  const t11 = new Date(NOW + 11 * 60e3).toISOString().replace('.000Z', 'Z');
  const v = viewOf({ extra: { [ESTIMATES_PATH]: [estLine('MD3', 3, 5, t5), estLine('M3A', 4, 7, t11)].join('\n') }, nowMs: NOW });
  assert.match(v.rows.find((r) => r.code === 'MD3').estimate.words, /about 3–5 days/);
  assert.equal(v.rows.find((r) => r.code === 'M3A').estimate.words, 'Estimate: not made yet');
  assert.ok(v.notes.includes("estimates line 2: its time is more than 10 minutes after the page's clock"));
  assert.equal(SKEW_MS, 10 * 60e3);
});

test('J14: a malformed line after a good one for the same milestone — the good one shows, with "a newer estimate line could not be read"', () => {
  const bad = JSON.stringify({ time: '2026-10-18T12:00:00Z', project: 'Service-Desk', milestone: 'MD3', low_days: 2.5, high_days: 4, note: '', session: 's' });
  const v = viewOf({ extra: { [ESTIMATES_PATH]: [estLine('MD3', 3, 5, '2026-10-18T10:00:00Z'), bad].join('\n') }, nowMs: NOW });
  const md3 = v.rows.find((r) => r.code === 'MD3');
  assert.match(md3.estimate.words, /about 3–5 days/);
  assert.equal(md3.estimate.newer, true);
  assert.ok(v.notes.includes('estimates line 2: low_days and high_days must be whole numbers from 0 to 365'));
  // A good line after the bad one clears it.
  const v2 = viewOf({ extra: { [ESTIMATES_PATH]: [estLine('MD3', 3, 5, '2026-10-18T10:00:00Z'), bad, estLine('MD3', 1, 2, '2026-10-18T13:00:00Z')].join('\n') }, nowMs: NOW });
  assert.equal(v2.rows.find((r) => r.code === 'MD3').estimate.newer, false);
});

test('J14: each malformed form is skipped and named, the rest still read', () => {
  const base = { time: '2026-10-18T12:00:00Z', project: 'Service-Desk', milestone: 'MD3', low_days: 1, high_days: 2, note: '', session: 's' };
  const cases = [
    ['not json', 'not one JSON object'],
    ['[1,2]', 'not one JSON object'],
    [JSON.stringify({ ...base, session: undefined }), 'missing session'],
    [JSON.stringify({ ...base, extra: 1 }), 'an extra key: extra'],
    [JSON.stringify({ ...base, low_days: 1.5 }), 'low_days and high_days must be whole numbers from 0 to 365'],
    [JSON.stringify({ ...base, low_days: -1 }), 'low_days and high_days must be whole numbers from 0 to 365'],
    [JSON.stringify({ ...base, high_days: 366 }), 'low_days and high_days must be whole numbers from 0 to 365'],
    [JSON.stringify({ ...base, low_days: '1' }), 'low_days and high_days must be whole numbers from 0 to 365'],
    [JSON.stringify({ ...base, low_days: 3 }), 'low_days is above high_days'],
    [JSON.stringify({ ...base, note: null }), 'its note is not a string'],
    [JSON.stringify({ ...base, session: 7 }), 'its session is not a string'],
    [JSON.stringify({ ...base, time: '2026-10-18T12:00:00-05:00' }), 'its time is not a UTC time ending Z or +00:00'],
    [JSON.stringify({ ...base, time: '18 Oct' }), 'its time is not a UTC time ending Z or +00:00'],
  ];
  for (const [line, why] of cases) {
    const l = parseEstimates(`${line}\n${estLine('M3A', 4, 7)}\n`);
    assert.equal(l[0].ok, false, line);
    assert.equal(l[0].why, why, line);
    assert.equal(l[1].ok, true, 'the rest still read');
  }
  const nc = viewOf({ extra: { [ESTIMATES_PATH]: estLine('MD3', 1, 2, '2026-10-18T12:00:00Z', '', 'Elsewhere') }, nowMs: NOW });
  assert.ok(nc.notes.includes('estimates line 1: Elsewhere is not a connected project'));
});

test('J14: an id section 3 does not hold, a v2.5 project\'s line, and a reached milestone\'s lines are ignored (the first two named); an empty file reads "not made yet"', () => {
  const v = viewOf({ extra: { [ESTIMATES_PATH]: [estLine('M9Z', 1, 2), estLine('M1', 1, 2, '2026-10-18T17:00:00Z', '', 'Personal-Org-Operating-Model'),
    estLine('M1', 5, 6), estLine('MD3', 3, 5)].join('\n') }, nowMs: NOW });
  assert.ok(v.notes.includes('estimates line 1: Service-Desk has no milestone M9Z'));
  assert.ok(v.notes.includes('estimates line 2: Personal-Org-Operating-Model is a v2.5 project, which has no milestones to estimate here'));
  assert.ok(!v.notes.some((n) => /line 3/.test(n)), 'a reached milestone\'s line: nothing shows it');
  assert.ok(!v.rows.some((r) => r.code === 'M1'));
  const e = viewOf({ extra: { [ESTIMATES_PATH]: '' }, nowMs: NOW });
  assert.ok(e.rows.every((r) => r.estimate.words === 'Estimate: not made yet'));
  assert.equal(e.card, 'not available: MD1 has no estimate yet');
  const none = viewOf({ nowMs: NOW });
  assert.ok(none.rows.every((r) => r.estimate.words === 'Estimate: not made yet'), 'no file: as no estimate');
});

test('J14: a failed read shows "Estimate: not available" on every row and no rough finish; the project\'s "read successfully" and Home\'s top line are unchanged', async () => {
  const v = viewOf({ extra: { [ESTIMATES_PATH]: WORKED() }, nowMs: NOW, omit: [ESTIMATES_PATH] });
  assert.ok(v.rows.every((r) => r.estimate.words === 'Estimate: not available' && !r.finish));
  assert.equal(v.card, 'not available');
  await failedOptionalRead(ESTIMATES_PATH, WORKED(), (app) => {
    // From stage 5 (AC86, specs/S-001.md:7041-7046): each of Plan's six rows says it, in AC24's words.
    const gaps = findAll(app.view, (e) => /\bv2-plgap\b/.test(e.className || ''));
    assert.equal(gaps.length, 6);
    assert.ok(gaps.every((e) => e.textContent === 'Estimate: not available'));
  });
});

/** Open the sandbox twice, the second time with `path`'s blob failing every read: Home's top line (from stage 2 its briefing, AC82) is the same, never "Can't read". */
async function failedOptionalRead(path, text, onWork) {
  const tops = [];
  for (const fail of [false, true]) {
    const app = await loadSandbox({ ...waSetup({ extra: { [path]: text } }), hash: '#/', now: NOW, store: memStore() });
    if (fail) {
      const orig = app.server.call;
      const bad = gitSha(text);
      app.server.call = async (p, b) => {
        const r = await orig(p, b);
        if (p === '/api/blobs' && r.json && r.json.blobs && bad in r.json.blobs) r.json.blobs[bad] = null;
        return r;
      };
    }
    try {
      await app.advance(1000);
      await app.advance(61_000);
      // From stage 2 (AC82): Home's top line is its briefing, counted as the board counts.
      const top = findAll(app.view, (e) => / v2-brief /.test(` ${e.className} `))[0];
      tops.push(top.textContent);
      assert.doesNotMatch(app.text(), /Can't read/);
      if (fail) {
        await app.go('#/work');
        onWork(app);
      }
    } finally {
      app.restore();
    }
  }
  assert.equal(tops[1], tops[0], 'Home\'s top line, and so "read successfully" and its waits, unchanged');
}

// ---------------------------------------------------------------------------
// J15

test('J15: the list\'s form — lines out of form skipped with a note, a repeated W id\'s second named, other lines ignored', () => {
  const l = parseLaterWork(`${LATER}- Not in form at all\n- Upkeep again (W2) · a note · from: x.md\nA plain line\n- Done one (W3) · a note · from: x.md:3-4 · added as: M3D\n- Turned down (W4) · a note · from: x.md · not added\n`);
  assert.equal(l.title, 'Later work, not milestones yet');
  assert.deepEqual(l.items.map((x) => [x.w, x.name, x.added, x.notAdded]), [['W1', 'Ask or jot box', null, false], ['W2', 'Upkeep fixes', null, false],
    ['W3', 'Done one', 'M3D', false], ['W4', 'Turned down', null, true]]);
  assert.equal(l.items[1].note, "read-access warning, M3B's criteria, more than five projects");
  assert.equal(l.items[0].from, 'decisions/questions/P-001-trial-view-notes-2.md:164');
  assert.deepEqual(l.notes, ['later-work line 4 is out of form', 'later-work line 5: W2 is repeated; the first counts']);
});

/** A J15 state's input: the list, plus tree paths, histories and answers' line 1. */
function later(listText, paths = [], hist = {}, line1 = {}) {
  const list = parseLaterWork(listText);
  const tree = treeOf([LATER_WORK_PATH, ...paths]);
  const history = new Map(Object.entries(hist).map(([p, d]) => [p, { oldest: d, newest: d }]));
  const records = new Map(Object.entries(line1).map(([p, l]) => [p, { line1: l }]));
  return laterRows({ list, tree, history, records, held: new Set(SIX.concat(['M1', 'M2', 'M2B', 'M3D'])), tz: TZ, todayKey: '2026-10-19' });
}

test('J15: each row\'s state, the first that fits — added (out of the group), not added (folded), answered, question filed, asked, otherwise tap', () => {
  const list = `# Later work, not milestones yet
- Added one (W1) · n · from: a.md · added as: M3D
- Not added one (W2) · n · from: a.md · not added
- Answered one (W3) · n · from: a.md
- Filed one (W4) · n · from: a.md
- Asked one (W5) · n · from: a.md
- Open one (W6) · n · from: a.md
`;
  const q = (w) => `questions/P-001-later-work-${w}.md`;
  const a = (w) => `decisions/questions/P-001-later-work-${w}.md`;
  const ask = (w, m) => `intake/milestone-asks/${w}-2026-10-19T${m}Z.md`;
  const paths = [a('w3'), q('w3'), ask('W3', '1000'), q('w4'), ask('W4', '1000'), ask('W5', '1500'), ask('W5', '1400'), a('w1')];
  const r = later(list, paths, { [a('w3')]: '2026-10-19T03:00:00Z' }, { [a('w3')]: 'Ruling: A — add it as a milestone' });
  assert.deepEqual(r.rows.map((x) => [x.item.w, x.state, x.words]), [
    ['W3', 'answered', 'Answered 18 Oct: Ruling: A — add it as a milestone'], // 03:00Z is 18 Oct in Chicago
    ['W4', 'question', 'Question filed · in your Queue'],
    ['W5', 'asked', 'Asked 19 Oct · your Chief of Staff files the question'],
    ['W6', 'tap', 'Tap to ask for it as a milestone'],
  ]);
  assert.deepEqual(r.notAdded.map((x) => x.w), ['W2']);
  assert.ok(r.notes.includes('intake/milestone-asks/W5-2026-10-19T1500Z.md: a second ask for W5; the earliest counts'));
  // An answer not read yet, or with no history yet: said so, never guessed.
  const r2 = later(list, [a('w3')]);
  assert.equal(r2.rows.find((x) => x.item.w === 'W3').words, 'Answered time not recorded: not read yet');
});

test('J15: awkward cases — no list file, added as an id the plan does not hold, an ask for an id the list lacks or out of form', () => {
  const v = viewOf({ nowMs: NOW });
  assert.equal(v.later.kind, 'none');
  const r = later('# L\n- One (W1) · n · from: a.md · added as: M9Z\n- Two (W2) · n · from: a.md\n',
    ['intake/milestone-asks/W7-2026-10-19T1000Z.md', 'intake/milestone-asks/W2-2026-10-19.md']);
  assert.deepEqual(r.rows.map((x) => x.item.w), ['W2']);
  assert.ok(r.notes.includes('W1 says added as M9Z, which the plan does not hold'));
  assert.ok(r.notes.includes('intake/milestone-asks/W7-2026-10-19T1000Z.md: an ask for W7, which the later-work list does not hold'));
  assert.ok(r.notes.includes("intake/milestone-asks/W2-2026-10-19.md: an ask's name out of form"));
  assert.equal(r.rows[0].state, 'tap', 'an ask out of form is not an ask');
});

test('J15: the ask link\'s path (the tap\'s minute in UTC) and body; AC17\'s copy fallback for a link too long', () => {
  const item = parseLaterWork(LATER).items[1];
  assert.equal(askPath('W2', at('2026-10-19T14:05:42Z')), 'intake/milestone-asks/W2-2026-10-19T1405Z.md');
  assert.equal(askBody(item), 'Ask: add W2 as a milestone\nLater work: Upkeep fixes (W2)\nFrom: the owner, through the desk\'s Work ahead\n');
  const v = viewOf({ extra: { [LATER_WORK_PATH]: LATER }, nowMs: at('2026-10-19T14:05:42Z') });
  const row = v.later.rows.find((x) => x.item.w === 'W2');
  const u = new URL(row.ask.link.url);
  assert.equal(u.pathname, '/shumpmaster/Service-Desk/new/main');
  assert.equal(u.searchParams.get('filename'), 'intake/milestone-asks/W2-2026-10-19T1405Z.md');
  assert.equal(u.searchParams.get('value'), askBody(item));
  const tight = viewOf({ extra: { [LATER_WORK_PATH]: LATER }, nowMs: NOW, linkCap: 150 });
  const t = tight.later.rows[0].ask.link;
  assert.equal(t.copy, askBody(parseLaterWork(LATER).items[0]));
  assert.equal(new URL(t.url).searchParams.get('value'), null);
});

test('J15: a failed list read shows "not available" in "Not milestones yet" only; "read successfully" and Home\'s top line unchanged', async () => {
  const v = viewOf({ extra: { [LATER_WORK_PATH]: LATER }, nowMs: NOW, omit: [LATER_WORK_PATH] });
  assert.equal(v.later.kind, 'na');
  await failedOptionalRead(LATER_WORK_PATH, LATER, (app) => {
    assert.match(app.text(), /Later work: not available/);
    assert.match(app.text(), /about 3–5 days|Estimate/);
  });
});

test('J4: a failed read of the current plan leaves "read successfully" and Home\'s top line unchanged; the order is section 3\'s', async () => {
  const name = '2026-10-18T1130Z-01';
  const text = planText(name, ['M3A', 'MD3']);
  await failedOptionalRead(planPath(name), text, (app) => {
    assert.match(app.text(), /Your latest plan, 2026-10-18T1130Z-01: not available; shown in the project document's order/);
  });
  assert.ok(snapOf({ [planPath(name)]: text }).records.get(planPath(name)).ok);
});

test('J4 + J14 + J15: a project not set for planning reads none of them, and the view says so', () => {
  const v = viewOf({ extra: { [ESTIMATES_PATH]: WORKED(), [LATER_WORK_PATH]: LATER }, nowMs: NOW, projects: [{ ...SD, planning: false }, POOM] });
  assert.equal(v.record.ok, false);
  assert.equal(v.record.words, "Can't record plans: no project is set for planning");
  assert.ok(v.rows.every((r) => r.estimate.words === 'Estimate: not available'));
  assert.deepEqual(finishes(v).map((x) => x[1]), [null, null, null, null, null, null]);
});

// Build review round 1, G: a `time` whose fields are no real moment is "not in that form" (J14).
test('J14 (build review round 1, G): an impossible date or hour — 30 Feb, 31 Apr, 24:00, minute 60 — is malformed and named; a real leap day is read', () => {
  for (const time of ['2026-02-30T17:00:00Z', '2026-04-31T17:00:00Z', '2026-10-18T24:00:00Z', '2026-10-18T12:60:00+00:00', '2026-02-29T12:00:00Z']) {
    const [l] = parseEstimates(estLine('MD3', 1, 2, time));
    assert.equal(l.ok, false, time);
    assert.equal(l.why, 'its time is not a UTC time ending Z or +00:00', time);
  }
  assert.equal(parseEstimates(estLine('MD3', 1, 2, '2028-02-29T12:00:00Z'))[0].ok, true, '2028 is a leap year');
  assert.equal(parseEstimates(estLine('MD3', 1, 2, '2026-10-18T12:00:00.250Z'))[0].ok, true, 'fractions of a second still read');
  const v = viewOf({ extra: { [ESTIMATES_PATH]: [estLine('MD3', 3, 5), estLine('MD3', 1, 2, '2026-02-30T17:00:00Z')].join('\n') }, nowMs: NOW });
  assert.ok(v.notes.includes('estimates line 2: its time is not a UTC time ending Z or +00:00'));
  const md3 = v.rows.find((r) => r.code === 'MD3');
  assert.match(md3.estimate.words, /about 3–5 days/);
  assert.equal(md3.estimate.newer, true, 'its project and milestone read: "a newer estimate line could not be read"');
});

// Build review round 1, B: "Record plan" only once the reads are in and a milestone shows.
test('J4 (build review round 1, B): with the milestone list unread, or no milestone to go, "Record plan" is off and no link is built; with everything read it is offered', () => {
  const name = '2026-10-18T1130Z-01';
  const extra = { [planPath(name)]: planText(name, ['M3A', 'MD3']) };
  const unread = viewOf({ extra, nowMs: NOW, omit: ['docs/PROJECT.md'] });
  assert.equal(unread.ready, false);
  assert.deepEqual(unread.record, { ok: false, words: 'Record plan is off until your milestones are read' });
  const planUnread = viewOf({ extra, nowMs: NOW, omit: [planPath(name)] });
  assert.equal(planUnread.record.ok, false, 'the current plan not read yet');
  assert.equal(planUnread.record.words, 'Record plan is off until your milestones are read');
  const allReached = j77Files()['docs/PROJECT.md'].replace(/(\((?:MD1|MD2|MD3|M3A|M3B|M3C)\) · done when [^\n]*?)\n/g, '$1 · reached: 2026-10-18\n');
  const none = viewOf({ extra: { 'docs/PROJECT.md': allReached }, nowMs: NOW });
  assert.equal(none.rows.length, 0);
  assert.equal(none.record.ok, false, 'no row: nothing to record');
  const ok = viewOf({ extra, nowMs: NOW });
  assert.equal(ok.record.ok, true);
  assert.match(ok.record.body, /\| 1 \| Service-Desk \| M3A \|/);
});
