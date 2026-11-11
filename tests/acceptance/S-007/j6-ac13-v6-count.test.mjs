// join-test: S-007/J6
// The rule (D1) -> the Chief of Staff's V6 count (AC13). The test plays J6's procedure over a
// sample main line, running the real rule (seam.monitor) at each check moment, and works out J6's
// two figures from the states the rule gives. AC13's sample holds three cards:
//   (a) A: card file and `card` entry arrive together at 2026-11-10 10:00, but the entry records
//       2026-11-11 09:00 (skew; J6's first worked example): held a day after reaching the main
//       branch, not a V6 miss;
//   (b) B: raised and shown on time: neither figure;
//   (c) C: raised before the part of the log that is read: raise time `not recorded`, shown at
//       once, neither figure.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seam, card, gateCard, entry, records, HELD, NOREC, STATE_RE,
  hasFlag, sameInstant, at, withFakeClock,
} from './lib.mjs';

const A = 'Q-080-stop-1';
const B = 'Q-081-stop-1';
const C = 'Q-082-stop-1';
const ARRIVE = '2026-11-10T10:00:00.000Z';
const A_RAISED = '2026-11-11T09:00:00.000Z';
const C_ARRIVE = '2026-11-09T08:00:00.000Z';
const EXPECTED_RAISED = { [A]: A_RAISED, [B]: ARRIVE, [C]: 'not recorded' };

// The main line (first-parent): committer time + the records as they stood at that commit.
// Every commit here changes queue/ or the dispatch log, so each one is a check-moment source (J6).
const logAB = [entry(A, A_RAISED), entry(B, ARRIVE)];
const MAIN = [
  { time: C_ARRIVE, records: records({ cards: [card(C)], log: [] }) },
  { time: ARRIVE, records: records({ cards: [card(C), card(A), card(B)], log: logAB }) },
  { time: '2026-11-11T12:00:00.000Z', records: records({ cards: [card(C), card(A), card(B)], log: [...logAB, entry('Q-099-dor-1', '2026-11-11T12:00:00.000Z')] }) },
  { time: '2026-11-12T12:00:00.000Z', records: records({ cards: [card(C), card(A), card(B)], log: [...logAB, entry('Q-099-dor-1', '2026-11-11T12:00:00.000Z'), entry('Q-098-dor-1', '2026-11-12T12:00:00.000Z')] }) },
  // B answered: its card file leaves queue/, so its check moments stop here.
  { time: '2026-11-13T08:00:00.000Z', records: records({ cards: [card(C), card(A)], log: [...logAB, entry('Q-099-dor-1', '2026-11-11T12:00:00.000Z'), entry('Q-098-dor-1', '2026-11-12T12:00:00.000Z')] }) },
];

// ---- J6's procedure, over a given main line ------------------------------------------------------
function j6(main) {
  const hasCard = (c, id) => c.records.cards.some((x) => x.id === id);
  const currentAt = (t) => main.filter((c) => Date.parse(c.time) <= Date.parse(t)).pop();
  const arrival = (id) => main.find((c) => hasCard(c, id)).time;
  const runAt = (m) => seam.monitor({ records: currentAt(m).records, moment: m });

  function checkMoments(id, due) {
    const out = [due];
    for (const c of main) {
      if (Date.parse(c.time) <= Date.parse(due)) continue;
      if (!hasCard(c, id)) break;
      out.push(c.time);
    }
    // The due time itself counts only while the card file is in queue/ at the commit current then.
    const cur = currentAt(due);
    if (!cur || !hasCard(cur, id)) out.shift();
    return out;
  }
  // Every (moment, entry) the rule gives a card at its check moments.
  async function statesAt(id, due) {
    const seen = [];
    for (const m of checkMoments(id, due)) {
      const res = await runAt(m);
      assert.deepEqual(res.flags ?? [], [], `no failed read in this sample (at ${m})`);
      const e = res.entries.find((x) => x.id === id);
      assert.ok(e, `${id} has an entry at ${m}`);
      seen.push({ moment: m, ...e });
    }
    return seen;
  }
  // V6 held-too-long: due = the recorded raise time (as the rule reports it) + 24h.
  async function v6(id) {
    const first = (await runAt(arrival(id))).entries.find((x) => x.id === id);
    if (first.raised === 'not recorded') return { miss: false, seen: [] }; // never held (AC7)
    const seen = await statesAt(id, at(first.raised, 24));
    return { miss: seen.some((s) => s.state === HELD), seen };
  }
  // Held a day after reaching the main branch: due = arrival + 24h.
  async function second(id) {
    const seen = await statesAt(id, at(arrival(id), 24));
    return { reported: seen.some((s) => s.state === HELD), seen };
  }
  return { currentAt, arrival, runAt, checkMoments, v6, second };
}

test('join-test: S-007/J6 — the handed-over list: one entry per decision card in queue/, with id, raise time and state', async () => {
  const P = j6(MAIN);
  const m = at(ARRIVE, 2);
  const res = await P.runAt(m);
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
  assert.deepEqual([by[A].state, by[B].state, by[C].state], [HELD, HELD, NOREC]);
});

test('join-test: S-007/J6 — gate cards and other kinds are not in the handed-over list', async () => {
  const r = records({
    cards: [card(A), gateCard('Q-083-dor-1'), gateCard('Q-083-criteria-1'), gateCard('Q-083-launch-1')],
    others: [{ kind: 'question', id: 'Q-084' }, { kind: 'pr', id: 'pr-7' }],
    log: [entry(A, ARRIVE), entry('Q-083-dor-1', ARRIVE), entry('Q-083-criteria-1', ARRIVE), entry('Q-083-launch-1', ARRIVE)],
  });
  const res = await seam.monitor({ records: r, moment: at(ARRIVE, 1) });
  assert.deepEqual(res.entries.map((e) => e.id), [A]);
});

test('AC13 / join-test: S-007/J6 — three cards at J6\'s check moments: id, raise time, state, and the two figures', async () => {
  const P = j6(MAIN);

  // Each card's id, raise time and state at every check moment of both figures.
  const all = {};
  for (const id of [A, B, C]) {
    const v = await P.v6(id);
    const s = await P.second(id);
    all[id] = { v6: v, second: s };
    for (const e of [...v.seen, ...s.seen]) {
      assert.equal(e.id, id);
      if (EXPECTED_RAISED[id] === 'not recorded') assert.equal(e.raised, 'not recorded', `${id} at ${e.moment}`);
      else assert.ok(sameInstant(e.raised, EXPECTED_RAISED[id]), `${id} at ${e.moment}: raised ${e.raised}`);
      assert.match(e.state, STATE_RE);
    }
  }

  // (a) J6's first worked example.
  assert.equal(P.checkMoments(A, at(A_RAISED, 24))[0], '2026-11-12T09:00:00.000Z', '(a) V6 due time');
  assert.deepEqual(all[A].v6.seen.map((e) => e.state), all[A].v6.seen.map(() => NOREC), '(a) shown at every V6 check moment');
  assert.ok(all[A].v6.seen.length >= 1);
  assert.equal(all[A].v6.miss, false, '(a) is not a V6 miss');
  assert.equal(all[A].second.seen[0].moment, '2026-11-11T10:00:00.000Z', '(a) second figure due time');
  assert.equal(all[A].second.seen[0].state, HELD, '(a) held at 2026-11-11 10:00 (age 1 hour)');
  assert.equal(all[A].second.reported, true, '(a) is reported as held a day after reaching the main branch');

  // (b) raised and shown on time.
  assert.equal(all[B].v6.seen[0].moment, '2026-11-11T10:00:00.000Z');
  assert.equal(all[B].v6.seen[0].state, NOREC);
  assert.equal(all[B].v6.miss, false, '(b) not a V6 miss');
  assert.equal(all[B].second.reported, false, '(b) not reported by the second figure');
  assert.ok(!all[B].v6.seen.some((e) => Date.parse(e.moment) >= Date.parse('2026-11-13T08:00:00.000Z')), '(b) check moments stop when its card file leaves');

  // (c) raised before the part of the log that is read.
  const atArrival = (await P.runAt(C_ARRIVE)).entries.find((e) => e.id === C);
  assert.equal(atArrival.raised, 'not recorded', '(c) raise time reported `not recorded`');
  assert.equal(atArrival.state, NOREC, '(c) shown at once');
  assert.equal(all[C].v6.miss, false, '(c) not a V6 miss');
  assert.equal(all[C].second.reported, false, '(c) not reported by the second figure');

  // The figures over the sample.
  const v6Count = [A, B, C].filter((id) => all[id].v6.miss);
  const secondReport = [A, B, C].filter((id) => all[id].second.reported);
  assert.deepEqual(v6Count, [], 'V6 held-too-long count: 0');
  assert.deepEqual(secondReport, [A], 'held a day after reaching the main branch: case (a) only');
});

test('join-test: S-007/J6 — a raise time far in the future: never a V6 miss; the second figure reports it', async () => {
  const F = 'Q-085-stop-1';
  const FAR = '2030-01-01T00:00:00.000Z';
  const main = [
    { time: ARRIVE, records: records({ cards: [card(F)], log: [entry(F, FAR)] }) },
    { time: '2026-11-12T12:00:00.000Z', records: records({ cards: [card(F)], log: [entry(F, FAR), entry('Q-099-dor-1', '2026-11-12T12:00:00.000Z')] }) },
  ];
  const P = j6(main);
  const v = await P.v6(F);
  assert.equal(v.seen[0].moment, at(FAR, 24));
  assert.equal(v.seen[0].state, NOREC, 'shown at its due time');
  assert.equal(v.miss, false);
  const s = await P.second(F);
  assert.equal(s.reported, true);
});

test('AC13 — the monitoring run reads no clock and keeps nothing: the same records and moment give the same list', async () => {
  const P = j6(MAIN);
  const m = at(ARRIVE, 2);
  const r = P.currentAt(m).records;
  const a = await withFakeClock('2020-01-01T00:00:00Z', () => seam.monitor({ records: r, moment: m }));
  const b = await withFakeClock('2035-01-01T00:00:00Z', () => seam.monitor({ records: r, moment: m }));
  assert.deepEqual(a, b);
  // Other records and moments in between change nothing.
  await seam.monitor({ records: MAIN.at(-1).records, moment: '2026-11-20T00:00:00.000Z' });
  await seam.monitor({ records: { ...r, fail: { queue: true } }, moment: m });
  const c = await seam.monitor({ records: r, moment: m });
  assert.deepEqual(c, a);
});

test('AC13 / J6 — records that cannot be got give the AC16 or AC17 flag instead, reported as a failed read', async () => {
  const P = j6(MAIN);
  const m = at(ARRIVE, 2);
  const base = P.currentAt(m).records;
  const q = await seam.monitor({ records: { ...base, fail: { queue: true } }, moment: m });
  assert.ok(hasFlag(q.flags, 'queue'));
  assert.deepEqual(q.entries ?? [], [], 'queue/ not got: no decision card gets a state');
  const l = await seam.monitor({ records: { ...base, fail: { log: true } }, moment: m });
  assert.ok(hasFlag(l.flags, 'log'));
  assert.ok(!(l.entries ?? []).some((e) => e.state === HELD), 'log not got: no card is reported held');
});
