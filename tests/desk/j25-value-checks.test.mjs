// join-test: S-001/J25 — the Chief of Staff's weekly value check → the targets' sheet (stage VT1 of "The desk's value
// targets shown: M3B"): `intake/value-checks.jsonl` in the planning project, one JSON object a line with exactly its ten
// keys, `value` among them; its lines read in file order, a target's latest check its last readable line; each awkward
// case skipped or ignored and named in the planning project's notes, the rest read; and a failed read leaving "read
// successfully" and Quiet unchanged. Every line here is made up (NOT a real record: tests/desk/vt1-fixtures.mjs), as is
// the launch (the approved picture's Wed 2 Dec 2026, not a plan); Service-Desk's section 3 and 6 are 7b69b2b's (real).
import test from 'node:test';
import assert from 'node:assert/strict';
import { gitSha } from './fake-desk.mjs';
import { loadSandbox, findAll, byClass } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { parseProjectDoc } from '../../src/lib/j11.js';
import { recordKind, parseRecord, neededReads } from '../../src/lib/model.js';
import { parseValueChecks, readValueChecks, valuesView, VALUE_CHECKS_PATH, targetKey } from '../../src/lib/values.js';
import { v3, v25 } from './sandbox-fixtures.mjs';
import { J7B_DOC, withLaunch, chi, vc, jsonl, DAY5, vt1State, windowCards, SD, POOM, TZ, isoZ } from './vt1-fixtures.mjs';

const ALPHA = v3('Alpha');
const LEDGER = v25('Ledger');
const PROJECTS = [SD, POOM, ALPHA, LEDGER];
const SD_IDS = new Set(['V1', 'V2', 'V3', 'V4', 'V5']);
const targetsOf = (n) => (n === SD.name ? SD_IDS : n === 'Alpha' ? new Set(['V1', 'V2']) : null);
const NOW = chi('2026-12-08', '12:00');
const read = (lines, nowMs = NOW) => readValueChecks({ lines: parseValueChecks(Array.isArray(lines) ? jsonl(lines) : lines), nowMs, projects: PROJECTS, targetsOf });
const base = { target: 'V1', from: '2026-12-03', to: '2026-12-06', value: 0 };
/** A line's object with some keys changed (`undefined` drops one): NOT a real record. */
const raw = (over) => {
  const o = JSON.parse(vc(base));
  for (const [k, v] of Object.entries(over)) if (v === undefined) delete o[k]; else o[k] = v;
  return JSON.stringify(o);
};
const view = (lines, nowMs = NOW) => {
  const doc = parseProjectDoc(withLaunch(J7B_DOC));
  return valuesView({ project: SD, doc, planning: true, j25: { state: 'ok', ...read(lines, nowMs) }, nowMs, tz: TZ });
};
const V = (v, id) => v.targets.find((t) => t.id === id);

test('J25: the path is the planning project\'s intake/value-checks.jsonl, read as an optional blob in the planning project only (J7\'s `"planning": true`), parsed as its own kind', () => {
  assert.equal(VALUE_CHECKS_PATH, 'intake/value-checks.jsonl');
  assert.equal(recordKind(VALUE_CHECKS_PATH, 'v3'), 'value-checks');
  assert.equal(recordKind(VALUE_CHECKS_PATH, 'v2.5'), null);
  const tree = new Map([[VALUE_CHECKS_PATH, { sha: 'a'.repeat(40) }], ['docs/PROJECT.md', { sha: 'b'.repeat(40) }]]);
  const opt = (project) => neededReads(project, tree, new Map(), new Date(NOW), { history: new Map(), head: 'f'.repeat(40), compare: new Map(), j11: true }).optional.blobs.map((b) => b.path);
  assert.ok(opt(SD).includes(VALUE_CHECKS_PATH), 'the planning project');
  assert.ok(!opt({ ...SD, planning: false }).includes(VALUE_CHECKS_PATH), 'no other project');
  const needed = neededReads(SD, tree, new Map(), new Date(NOW), { history: new Map(), head: 'f'.repeat(40), compare: new Map(), j11: true });
  assert.ok(!needed.blobs.some((b) => b.path === VALUE_CHECKS_PATH), 'never a required read');
  assert.deepEqual(parseRecord('value-checks', `${vc(base)}\n`, VALUE_CHECKS_PATH).lines.map((l) => l.ok), [true]);
});

test('J25: one JSON object per line with exactly its ten keys — two checks of one target, the second counting; both `Z` and `+00:00`; an empty file; blank lines passed over', () => {
  const two = read([vc({ ...base, value: 0, at: chi('2026-12-07', '09:00') }), vc({ ...base, value: 1, state: 'missed', at: chi('2026-12-07', '10:00').valueOf() })]);
  const k = targetKey('Service-Desk', 'V1');
  assert.deepEqual(two.checks.get(k).map((x) => [x.n, x.value, x.state]), [[1, 0, 'on track'], [2, 1, 'missed']]);
  assert.equal(V(view([vc({ ...base, value: 0, at: chi('2026-12-07', '09:00') }), vc({ ...base, value: 1, state: 'missed', at: chi('2026-12-07', '10:00') })]), 'V1').figure.big, '1', 'the second counting');
  const plus = raw({ time: '2026-12-07T15:00:00+00:00' });
  assert.deepEqual(read([plus, vc(base)]).checks.get(k).map((x) => x.time), [Date.parse('2026-12-07T15:00:00Z'), Date.parse('2026-12-07T15:00:00Z')]);
  const empty = read('');
  assert.deepEqual([empty.checks.size, empty.notes], [0, []]);
  assert.equal(V(view([]), 'V1').verdict.first, 'Not measured yet', 'an empty file: nothing measured yet');
  assert.deepEqual(parseValueChecks(`\n${vc(base)}\n\n${vc(base)}\n`).map((l) => l.n), [2, 4], 'line numbers as in the file');
});

test('J25: a check\'s date is its time\'s calendar date in ownerTimeZone — a time either side of midnight in Chicago', () => {
  const before = view([vc({ ...base, at: '2026-12-08T05:59:00Z' })]);
  const after = view([vc({ ...base, at: '2026-12-08T06:01:00Z' })]);
  assert.deepEqual(V(before, 'V1').lines, ["Your Chief of Staff's check, 7 Dec: on track"], '23:59 on 7 Dec in Chicago');
  assert.deepEqual(V(after, 'V1').lines, ["Your Chief of Staff's check, 8 Dec: on track"], '00:01 on 8 Dec in Chicago');
});

test('J25: a malformed line is skipped and named in the notes, "value checks line <n>: <reason>", the rest read — not one JSON object, a key missing or extra (`value` among them), each value of the wrong kind or out of its form', () => {
  const cases = [
    ['not json', 'not one JSON object'],
    ['[1, 2]', 'not one JSON object'],
    [raw({ value: undefined }), 'missing value'],
    [raw({ extra: 1 }), 'an extra key: extra'],
    [raw({ time: '2026-12-07 15:00:00' }), 'its time is not a UTC time ending Z or +00:00'],
    [raw({ time: '2026-12-07T15:00:00-06:00' }), 'its time is not a UTC time ending Z or +00:00'],
    [raw({ time: '2026-02-30T15:00:00Z' }), 'its time is not a UTC time ending Z or +00:00'],
    [raw({ project: 7 }), 'its project is not a name'],
    [raw({ target: '' }), 'its target is not an id'],
    [raw({ from: '2026-12-32' }), 'its from and to are not real dates (yyyy-mm-dd)'],
    [raw({ to: '6 Dec' }), 'its from and to are not real dates (yyyy-mm-dd)'],
    [raw({ from: '2026-12-07', to: '2026-12-06' }), 'its from is after its to'],
    [raw({ figure: 'x'.repeat(61) }), 'its figure is over 60 characters'],
    [raw({ figure: '0 missed · 3 weeks' }), 'its figure holds " · "'],
    [raw({ value: 0.5 }), 'its value is not a whole number from 0 to 100,000, or null'],
    [raw({ value: -1 }), 'its value is not a whole number from 0 to 100,000, or null'],
    [raw({ value: 100001 }), 'its value is not a whole number from 0 to 100,000, or null'],
    [raw({ value: '0' }), 'its value is not a whole number from 0 to 100,000, or null'],
    [raw({ state: 'done' }), 'its state is not on track, met, missed or not measured'],
    [raw({ state: 'Met' }), 'its state is not on track, met, missed or not measured'],
    [raw({ source: '' }), 'its source is not words'],
    [raw({ session: 3 }), 'its session is not a string'],
  ];
  for (const [line, why] of cases) {
    const r = read([vc({ ...base, target: 'V2', value: 0 }), line]);
    assert.deepEqual(r.notes, [`value checks line 2: ${why}`], line);
    assert.equal(r.checks.get(targetKey('Service-Desk', 'V2')).length, 1, 'the rest read');
  }
  // From draft 7: `value` at 0, at a goal, past it and past the chart's scale are read; `null` on a V4 line and a not
  // measured line are read; `null` with another state on a V1 line is malformed.
  const ok = read([vc({ ...base, value: 0 }), vc({ ...base, target: 'V2', value: 1 }), vc({ ...base, target: 'V2', value: 2 }), vc({ ...base, target: 'V3', value: 100000 }),
    vc({ ...base, target: 'V4', from: '2026-12-02', to: '2026-12-02', value: null, state: 'met' }), vc({ ...base, value: null, state: 'not measured' })]);
  assert.deepEqual(ok.notes, []);
  assert.equal([...ok.checks.values()].flat().length, 6);
  const nullV1 = read([vc({ ...base, value: null, state: 'on track' })]);
  assert.deepEqual(nullV1.notes, ['value checks line 1: its value is null with the state on track: only a not measured line has no number']);
  assert.equal(nullV1.checks.size, 0);
  // Another project's line may give no number (its Chief of Staff gives none).
  assert.deepEqual(read([vc({ ...base, project: 'Alpha', value: null, figure: '14 signups', state: 'missed' })]).notes, []);
});

test('J25: a time more than 10 minutes after the page\'s clock is skipped (11 minutes), 5 minutes after it is read; a project not connected is skipped; a target section 6 does not hold, and a v2.5 project\'s line, are ignored and named; a line dated before an earlier line is still read, and named', () => {
  const r = read([vc({ ...base, at: NOW + 5 * 60e3 }), vc({ ...base, target: 'V2', at: NOW + 11 * 60e3 }), vc({ ...base, project: 'Nowhere', at: NOW + 6 * 60e3 }),
    vc({ ...base, target: 'V9', at: NOW + 6 * 60e3 }), vc({ ...base, project: 'Ledger', at: NOW + 6 * 60e3 }), vc({ ...base, target: 'V3', at: chi('2026-12-07', '08:00') })]);
  assert.deepEqual(r.notes, [
    "value checks line 2: its time is more than 10 minutes after the page's clock",
    'value checks line 3: Nowhere is not a connected project',
    "value checks line 4: Service-Desk's section 6 has no target V9",
    'value checks line 5: Ledger is a v2.5 project, which shows no value targets',
    'value checks line 6 is dated before line 5',
  ]);
  assert.deepEqual([...r.checks.keys()], [targetKey('Service-Desk', 'V1'), targetKey('Service-Desk', 'V3')]);
  // A target no line names: AC97's words for nothing measured yet.
  assert.equal(V(view([vc(base)]), 'V2').verdict.first, 'Not measured yet');
});

test('J25: a malformed line after a good one for the same target — the good one stays its latest check, and its measure adds "a newer check could not be read"; a later good line takes it away', () => {
  const bad = raw({ value: 0.5 });
  const v = view([vc(base), bad]);
  assert.equal(V(v, 'V1').figure.big, '0', 'the good line still counts');
  assert.equal(V(v, 'V1').newer, true);
  assert.equal(V(v, 'V2').newer, false);
  assert.equal(V(view([vc(base), bad, vc({ ...base, at: chi('2026-12-07', '11:00') })]), 'V1').newer, false);
  // An unreadable line naming no project and target marks none.
  assert.equal(V(view([vc(base), 'not json']), 'V1').newer, false);
});

/** Service-Desk's page, launched (made up), with DAY5's lines; `fail` makes the J25 blob's every read fail (null). */
async function page({ fail = false, lines = DAY5, hash = '#/p/Service-Desk' } = {}) {
  const st = vt1State({ lines, cards: windowCards() });
  const app = await loadSandbox({ ...st, hash, now: chi('2026-12-07', '15:00'), store: memStore() });
  if (fail) {
    const orig = app.server.call;
    const bad = gitSha(jsonl(lines));
    app.server.call = async (p, b) => {
      const r = await orig(p, b);
      if (p === '/api/blobs' && r.json && r.json.blobs && bad in r.json.blobs) r.json.blobs[bad] = null;
      return r;
    };
  }
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;

test('J25: a failed read — the row reads state 0, "5 targets · weekly checks not available", with no left icon and V1 to V3 with no mark; the sheet says "Weekly checks: not available" once; "read successfully" and Quiet are unchanged, never "Can\'t read"', async () => {
  const tops = [];
  for (const fail of [false, true]) {
    const app = await page({ fail });
    try {
      const row = keyed(app, 'rest:values');
      if (fail) {
        assert.equal(byClass(row, 'v2-small')[0].textContent, '5 targets · weekly checks not available');
        assert.equal(row.children[0].className, 'v2-pmk', 'no left icon');
        const marks = byClass(row, 'v2-vmk');
        assert.deepEqual(marks.map((m) => findAll(m, (e) => e.tag === 'svg').length), [0, 0, 0, 1, 1]);
      } else assert.equal(byClass(row, 'v2-small')[0].textContent, '5 targets · 1 outside target · 4 within, so far');
      const st = app.desk.states.get('Service-Desk');
      assert.ok(st.failure === null && st.lastSuccessAt != null, 'read successfully');
      assert.doesNotMatch(app.text(), /Can't read/);
      await app.go('#/');
      tops.push(findAll(app.view, (e) => / v2-brief /.test(` ${e.className} `))[0].textContent);
      if (fail) {
        await app.go('#/p/Service-Desk/values');
        const sheet = byClass(app.view, 'v2-sheet')[0];
        assert.deepEqual(byClass(sheet, 'v2-small').map((x) => x.textContent).filter((t) => /^Weekly checks/.test(t)), ['Weekly checks: not available']);
      }
    } finally {
      app.restore();
    }
  }
  assert.equal(tops[1], tops[0], 'Home\'s top line, and so Quiet and "read successfully", unchanged');
});

test('J25: its notes go to the planning project\'s record notes, "value checks line <n>: <reason>"', async () => {
  const app = await page({ lines: [...DAY5, raw({ value: -2 }), vc({ ...base, project: 'Nowhere' })] });
  try {
    await app.go('#/p/Service-Desk/notes');
    const notes = findAll(app.view, (e) => e.tag === 'li').map((li) => li.textContent);
    assert.ok(notes.includes('value checks line 6: its value is not a whole number from 0 to 100,000, or null'), notes.join('\n'));
    assert.ok(notes.includes('value checks line 7: Nowhere is not a connected project'));
  } finally {
    app.restore();
  }
});

test('J25: a newer line\'s malformed time is skipped, never silently replacing its target\'s latest check with an older line', () => {
  const v = view([vc({ ...base, value: 1, state: 'missed', at: chi('2026-12-07', '09:00') }), raw({ time: 'yesterday', value: 0 })]);
  assert.deepEqual([V(v, 'V1').figure.big, V(v, 'V1').verdict.first, V(v, 'V1').newer], ['1', 'Missed', true]);
  assert.equal(isoZ(chi('2026-12-07', '09:00')), '2026-12-07T15:00:00Z');
});

test('J6 (VT1; draft 11, the Reviewer\'s N2): the blob cache key is desk-blobs-v8, docs/PROJECT.md\'s parse having gained section 6\'s quoted stop rule; desk-blobs-v7 is among the old keys and dropped on load, its parse read afresh', async () => {
  const { BLOB_CACHE_KEY, OLD_BLOB_CACHE_KEYS, createDesk, POLL_MS } = await import('../../src/lib/scheduler.js');
  const { createStore } = await import('../../src/lib/store.js');
  const { fakeServer, repo } = await import('./fake-desk.mjs');
  const { CONFIG, fakeClock } = await import('./helpers.mjs');
  assert.equal(BLOB_CACHE_KEY, 'desk-blobs-v8');
  assert.ok(OLD_BLOB_CACHE_KEYS.includes('desk-blobs-v7'));
  const doc = withLaunch(J7B_DOC);
  // A v7 parse of this very blob, as a device that loaded the desk before VT1 holds it: no `stopRule`.
  const old = parseRecord('project-doc', doc, 'docs/PROJECT.md');
  delete old.stopRule;
  const backing = new Map([['desk-blobs-v7', JSON.stringify({ [`project-doc:${gitSha(doc)}`]: old })]]);
  const storage = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, v), removeItem: (k) => backing.delete(k) };
  const clock = fakeClock(NOW);
  const config = { ...CONFIG, projects: [SD] };
  const server = fakeServer({ [SD.name]: repo({ 'docs/PROJECT.md': doc }) }, config, clock);
  const desk = createDesk({ config, call: (p, b) => server.call(p, b), clock, store: createStore(storage), pullsStore: createStore(null), isVisible: () => true, j11: true });
  assert.equal(backing.has('desk-blobs-v7'), false, 'the v7 key dropped, not left to fill storage');
  desk.start();
  await clock.runUntil(clock.now() + 2 * POLL_MS);
  desk.stop();
  assert.match(desk.snapshot(SD.name).records.get('docs/PROJECT.md').stopRule, /^A miss is /, 'read and parsed afresh, its stop rule with it');
});

test('AC97 (draft 11, the Reviewer\'s N3): another project\'s row reads state 0\'s "weekly checks not available", never "not recorded yet", when the planning project can\'t be read', async () => {
  const st = vt1State({ lines: [], alpha: ['V1: Signups: 20 (made up)', 'V2: Bounce: under 2% (made up)'] });
  st.repos['Service-Desk'].fail = { kind: 'network' };
  const app = await loadSandbox({ ...st, hash: '#/p/Alpha', now: chi('2026-12-07', '15:00'), store: memStore() });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    const row = keyed(app, 'rest:values');
    assert.equal(byClass(row, 'v2-small')[0].textContent, '2 targets · weekly checks not available');
    assert.equal(row.children[0].className, 'v2-pmk', 'no left icon');
  } finally {
    app.restore();
  }
});
