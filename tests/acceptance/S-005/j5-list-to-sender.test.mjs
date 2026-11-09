// join-test: S-005/J5
// The card list -> the notification sender (src/notify/**, unchanged), through the seam's real sender.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seam, T0, at, card, gateCard, entry, notes, notesPath, records,
  HELD, rec, decisionStates, hasFlag, noticeIds,
} from './lib.mjs';

const A = 'Q-019-stop-1';   // notes: drop
const B = 'Q-017-failure-2'; // no notes, raised over a day ago
const C = 'Q-031-stop-1';   // no notes, raised an hour ago -> held
const G = 'Q-020-dor-1';
const M = at(T0, 30);

function recs(extra = {}) {
  return records({
    cards: [card(A), card(B), card(C), gateCard(G)],
    files: { [notesPath(A)]: notes('drop') },
    log: [entry(A, at(T0, 29)), entry(B, T0), entry(C, at(T0, 29)), entry(G, T0)],
    ...extra,
  });
}
const shownOnly = (list) => Object.fromEntries(Object.entries(decisionStates(list)).filter(([, s]) => s !== HELD));

test('join-test: S-005/J5 — the sender takes the same list: id, kind and state; held cards not on it', async () => {
  const sender = await seam.openSender();
  const fromSender = await sender.list({ records: recs(), moment: M });
  const fromRule = await seam.ruleList({ records: recs(), moment: M });
  assert.deepEqual(shownOnly(fromSender), shownOnly(fromRule));
  assert.ok(!(fromSender.cards ?? []).some((c) => c.id === C && c.state !== HELD), 'held card is not on the list it notifies from');
  for (const c of fromSender.cards ?? []) assert.ok(c.id && c.kind, 'each card carries id and kind');
  const run = await sender.run({ records: recs(), moment: M });
  const notified = noticeIds(run);
  assert.ok(notified.includes(A) && notified.includes(B), 'shown decision cards notified');
  assert.ok(!notified.includes(C), 'held card not notified');
  await sender.close?.();
});

test('join-test: S-005/J5 — the sender\'s read does not get queue/ or the notes: no decision notice; gate cards as a full read', async () => {
  for (const fail of [{ queue: true }, { files: [notesPath(A)] }]) {
    const sender = await seam.openSender();
    const list = await sender.list({ records: recs({ fail }), moment: M });
    assert.deepEqual(decisionStates(list), {});
    assert.ok(hasFlag(list.flags, fail.queue ? 'queue' : 'notes'), 'flag handed over');
    const run = await sender.run({ records: recs({ fail }), moment: M });
    for (const id of [A, B, C]) assert.ok(!noticeIds(run).includes(id), `${JSON.stringify(fail)}: no notice for ${id}`);
    await sender.close?.();
  }
});

test('join-test: S-005/J5 — the sender\'s read does not get the log: notices only for cards with a notes word', async () => {
  const sender = await seam.openSender();
  const list = await sender.list({ records: recs({ fail: { log: true } }), moment: M });
  assert.deepEqual(decisionStates(list), { [A]: rec('drop') });
  assert.ok(hasFlag(list.flags, 'log'));
  const run = await sender.run({ records: recs({ fail: { log: true } }), moment: M });
  assert.ok(noticeIds(run).includes(A));
  assert.ok(!noticeIds(run).includes(B) && !noticeIds(run).includes(C));
  await sender.close?.();
});

test('join-test: S-005/J5 — a card shows and is answered between two runs: no notice owed', async () => {
  const sender = await seam.openSender();
  const r1 = await sender.run({ records: records({ cards: [card(C)], log: [entry(C, T0)] }), moment: at(T0, 1) });
  const r2 = await sender.run({ records: records({ cards: [], log: [entry(C, T0)] }), moment: at(T0, 30) });
  assert.ok(!noticeIds(r1).includes(C) && !noticeIds(r2).includes(C));
  await sender.close?.();
});

test('join-test: S-005/J5 — a notice already sent, then the card leaves the list: nothing sent while off it', async () => {
  const sender = await seam.openSender();
  const shown = records({ cards: [card(A)], files: { [notesPath(A)]: notes('drop') }, log: [entry(A, T0)] });
  const first = await sender.run({ records: shown, moment: at(T0, 2) });
  assert.ok(noticeIds(first).includes(A));
  const held = records({ cards: [card(A)], log: [entry(A, T0)] });
  const off1 = await sender.run({ records: held, moment: at(T0, 3) });
  const off2 = await sender.run({ records: { ...shown, fail: { queue: true } }, moment: at(T0, 4) });
  assert.ok(!noticeIds(off1).includes(A) && !noticeIds(off2).includes(A));
  assert.deepEqual((off1.withdrawn ?? []), [], 'nothing withdrawn');
  await sender.close?.();
});
