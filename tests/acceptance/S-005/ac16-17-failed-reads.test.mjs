// S-005 AC16 (queue/ or a needed notes file not got) and AC17 (the dispatch log not got).
// AC9 already checks the other kinds against the baseline under each failure.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seam, T0, at, card, gateCard, entry, notes, notesPath, records,
  rec, NOREC, hasLine, ids, noticeIds, stateIn, viewState,
} from './lib.mjs';

const A = 'Q-019-stop-1';    // notes: drop
const B = 'Q-017-failure-2'; // no notes, raised T0 (over a day at M)
const C = 'Q-031-stop-1';    // no notes, raised M - 1h
const G = 'Q-020-dor-1';
const M = at(T0, 30);
const DEC = [A, B, C];

function recs(extra = {}) {
  return records({
    cards: [card(A), card(B), card(C), gateCard(G)],
    files: { [notesPath(A)]: notes('drop'), [notesPath(G)]: notes('drop') },
    log: [entry(A, T0), entry(B, T0), entry(C, at(M, -1)), entry(G, T0)],
    ...extra,
  });
}

async function deskAndSender(r, moment = M) {
  const desk = await seam.openDesk();
  const snap = await desk.read({ records: r, moment });
  const sheets = {};
  for (const id of DEC) sheets[id] = await desk.open(id, 'link');
  await desk.close?.();
  const sender = await seam.openSender();
  const run = await sender.run({ records: r, moment });
  await sender.close?.();
  return { snap, sheets, notified: noticeIds(run) };
}

const AC16_CASES = [
  ['queue/ not got', { queue: true }, ['queue']],
  ['a needed notes file not got', { files: [notesPath(A)] }, ['notes']],
  ['both', { queue: true, files: [notesPath(A)] }, ['queue', 'notes']],
];

for (const [name, fail, lines] of AC16_CASES) {
  test(`AC16 — ${name}: no decision card shown, counted, on the board, answerable or notified; the line(s) on queue and Home`, async () => {
    const v = await deskAndSender(recs({ fail }));
    for (const id of DEC) {
      assert.ok(!ids(v.snap.queue).includes(id), `${id} not on the queue`);
      assert.ok(!ids(v.snap.board).includes(id), `${id} not on the board`);
      assert.equal(v.sheets[id].answerable, false, `${id} offers no answer buttons`);
      assert.ok(!v.notified.includes(id), `${id} not notified`);
    }
    const gateOnly = ids(v.snap.queue).filter((id) => !DEC.includes(id)).length;
    assert.equal(v.snap.homeCount, gateOnly, "Home's count holds no decision card");
    for (const where of ['queue', 'home']) {
      for (const w of ['queue', 'notes', 'log']) assert.equal(hasLine(v.snap.lines[where], w), lines.includes(w), `${where}: line ${w}`);
    }
  });
}

test('AC16 — a notes file the rule does not need (a gate card\'s) failing hides nothing and shows no line', async () => {
  const v = await deskAndSender(recs({ fail: { files: [notesPath(G)] } }));
  assert.ok(ids(v.snap.queue).includes(A) && ids(v.snap.queue).includes(B));
  for (const where of ['queue', 'home']) assert.ok(!hasLine(v.snap.lines[where], 'notes'));
});

test('AC16 — when a later read gets the records, each card is held or shown by its real age', async () => {
  const desk = await seam.openDesk();
  await desk.read({ records: recs({ fail: { queue: true } }), moment: M });
  const snap = await desk.read({ records: recs(), moment: at(M, 0, 5) });
  assert.equal(await viewState(desk, snap, A), rec('drop'));
  assert.equal(await viewState(desk, snap, B), NOREC);
  assert.equal(await viewState(desk, snap, C), 'not shown', 'raised an hour ago: still held');
  for (const where of ['queue', 'home']) for (const w of ['queue', 'notes', 'log']) assert.ok(!hasLine(snap.lines[where], w));
  await desk.close?.();
});

test('AC17 — log not got: cards with a notes word shown exactly as AC2; the rest not shown; the line', async () => {
  const v = await deskAndSender(recs({ fail: { log: true } }));
  assert.ok(ids(v.snap.queue).includes(A) && ids(v.snap.board).includes(A));
  assert.equal(v.sheets[A].answerable, true);
  assert.deepEqual(v.sheets[A].buttons.filter((b) => b.recommended).map((b) => b.word), ['drop']);
  assert.ok(v.notified.includes(A));
  for (const id of [B, C]) {
    assert.ok(!ids(v.snap.queue).includes(id) && !ids(v.snap.board).includes(id), `${id} not shown`);
    assert.equal(v.sheets[id].answerable, false);
    assert.ok(!v.notified.includes(id));
  }
  const gateOnly = ids(v.snap.queue).filter((id) => !DEC.includes(id)).length;
  assert.equal(v.snap.homeCount, gateOnly + 1, "Home counts A only among decision cards");
  for (const where of ['queue', 'home']) {
    assert.ok(hasLine(v.snap.lines[where], 'log'), `${where}: log line`);
    assert.ok(!hasLine(v.snap.lines[where], 'queue') && !hasLine(v.snap.lines[where], 'notes'));
  }
  // Same as when the log is read, for A.
  const full = await deskAndSender(recs());
  assert.deepEqual(v.sheets[A], full.sheets[A]);
});

test('AC17 — no decision card left out: no line', async () => {
  const r = records({ cards: [card(A), gateCard(G)], files: { [notesPath(A)]: notes('drop') }, log: [entry(A, T0), entry(G, T0)], fail: { log: true } });
  const v = await deskAndSender(r);
  for (const where of ['queue', 'home']) assert.ok(!hasLine(v.snap.lines[where], 'log'));
});

test('AC17 — when a later read gets the log, each card is held or shown by its real age', async () => {
  const desk = await seam.openDesk();
  await desk.read({ records: recs({ fail: { log: true } }), moment: M });
  const snap = await desk.read({ records: recs(), moment: at(M, 0, 5) });
  assert.equal(await viewState(desk, snap, B), NOREC);
  assert.equal(await viewState(desk, snap, C), 'not shown');
  assert.equal(stateIn(await seam.ruleList({ records: recs(), moment: at(M, 0, 5) }), C), 'held');
  await desk.close?.();
});
