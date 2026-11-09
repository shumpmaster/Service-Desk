// join-test: S-005/J6
// The rule (D1) -> the Chief of Staff's V6 count (AC13). The test plays J6's procedure over a
// sample main line, running the real rule (seam.monitor) at each check moment.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seam, card, entry, records, HELD, NOREC, hasFlag, sameInstant, at } from './lib.mjs';

const A = 'Q-080-stop-1'; // case (a): entry records a raise time a day after arrival (skew)
const B = 'Q-081-stop-1'; // case (b): raised and shown on time
const C = 'Q-082-stop-1'; // raised before the part of the log that is read
const ARRIVE = '2026-11-10T10:00:00.000Z';
const A_RAISED = '2026-11-11T09:00:00.000Z';
const STATE_RE = /^(held|shown, no recommendation yet|shown, recommended \S+)$/;

// The main line: committer time + records as they stood at that commit.
const cardsNow = [card(A), card(B), card(C)];
const log1 = [entry(A, A_RAISED), entry(B, ARRIVE)];
const MAIN = [
  { time: '2026-11-09T08:00:00.000Z', records: records({ cards: [card(C)], log: [] }) },
  { time: ARRIVE, records: records({ cards: cardsNow, log: log1 }) },
  { time: '2026-11-11T12:00:00.000Z', records: records({ cards: cardsNow, log: [...log1, entry('Q-099-dor-1', '2026-11-11T12:00:00.000Z')] }) },
  { time: '2026-11-12T12:00:00.000Z', records: records({ cards: cardsNow, log: [...log1, entry('Q-099-dor-1', '2026-11-11T12:00:00.000Z'), entry('Q-098-dor-1', '2026-11-12T12:00:00.000Z')] }) },
];
// Every commit here changes queue/ or the log, so each is a check-moment source (J6).
const hasCard = (c, id) => c.records.cards.some((x) => x.id === id);
const currentAt = (t) => [...MAIN].filter((c) => Date.parse(c.time) <= Date.parse(t)).pop();
const arrival = (id) => MAIN.find((c) => hasCard(c, id)).time;

function checkMoments(id, due) {
  const out = [due];
  for (const c of MAIN) {
    if (Date.parse(c.time) <= Date.parse(due)) continue;
    if (!hasCard(c, id)) break;
    out.push(c.time);
  }
  return out;
}
async function heldAtAny(id, due) {
  for (const m of checkMoments(id, due)) {
    const res = await seam.monitor({ records: currentAt(m).records, moment: m });
    assert.ok(!(res.flags ?? []).length, 'no failed read in this sample');
    if (res.entries.find((e) => e.id === id)?.state === HELD) return true;
  }
  return false;
}

test('join-test: S-005/J6 — the handed-over list: id, raise time (ISO or "not recorded"), state', async () => {
  const res = await seam.monitor({ records: currentAt(at(ARRIVE, 2)).records, moment: at(ARRIVE, 2) });
  assert.deepEqual(res.entries.map((e) => e.id).sort(), [A, B, C].sort(), 'one entry per decision card in queue/');
  for (const e of res.entries) {
    assert.match(e.id, /^[A-Z]+-\d+-.+-\d+$/);
    assert.match(e.state, STATE_RE);
    assert.ok(e.raised === 'not recorded' || !Number.isNaN(Date.parse(e.raised)), `${e.id} raised ${e.raised}`);
  }
  const by = Object.fromEntries(res.entries.map((e) => [e.id, e]));
  assert.ok(sameInstant(by[A].raised, A_RAISED));
  assert.ok(sameInstant(by[B].raised, ARRIVE));
  assert.equal(by[C].raised, 'not recorded');
  assert.equal(by[A].state, HELD);
  assert.equal(by[B].state, HELD);
  assert.equal(by[C].state, NOREC, 'raised before the read part: shown');
});

test('join-test: S-005/J6 / AC13 — the two figures at their check moments', async () => {
  const v6Due = (id) => {
    const e = MAIN.at(-1).records.log.find((x) => x.card === id);
    return e ? at(e.raised, 24) : null;
  };
  const v6Miss = async (id) => (v6Due(id) ? heldAtAny(id, v6Due(id)) : false);
  const heldAfterArrival = async (id) => heldAtAny(id, at(arrival(id), 24));

  // (a) worked example 1: V6 due 2026-11-12 09:00 -> shown; second figure due 2026-11-11 10:00 -> held.
  assert.equal(await v6Miss(A), false, '(a) is not a V6 miss');
  assert.equal(await heldAfterArrival(A), true, '(a) is reported as held a day after reaching the main branch');
  const atV6Due = await seam.monitor({ records: currentAt(v6Due(A)).records, moment: v6Due(A) });
  assert.equal(atV6Due.entries.find((e) => e.id === A).state, NOREC);
  // (b) on time: neither figure.
  assert.equal(await v6Miss(B), false);
  assert.equal(await heldAfterArrival(B), false);
  // raised before the read part: neither figure.
  assert.equal(await v6Miss(C), false);
  assert.equal(await heldAfterArrival(C), false);
});

test('AC13 — the monitoring run reads no clock: the same records and moment give the same list', async () => {
  const { withFakeClock } = await import('./lib.mjs');
  const r = currentAt(at(ARRIVE, 2)).records;
  const a = await withFakeClock('2020-01-01T00:00:00Z', () => seam.monitor({ records: r, moment: at(ARRIVE, 2) }));
  const b = await withFakeClock('2035-01-01T00:00:00Z', () => seam.monitor({ records: r, moment: at(ARRIVE, 2) }));
  assert.deepEqual(a, b);
});

test('AC13 / J6 — records that cannot be got give the flag instead, reported as a failed read', async () => {
  const r = { ...currentAt(at(ARRIVE, 2)).records, fail: { queue: true } };
  const res = await seam.monitor({ records: r, moment: at(ARRIVE, 2) });
  assert.ok(hasFlag(res.flags, 'queue'));
  assert.deepEqual(res.entries ?? [], []);
  const l = await seam.monitor({ records: { ...currentAt(at(ARRIVE, 2)).records, fail: { log: true } }, moment: at(ARRIVE, 2) });
  assert.ok(hasFlag(l.flags, 'log'));
});
