// join-test: S-005/J3
// The rule (D1) -> the one card list every view reads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seam, T0, at, card, gateCard, entry, notes, notesPath, records,
  HELD, NOREC, rec, stateIn, decisionStates, hasFlag,
} from './lib.mjs';

const A = 'Q-019-stop-1';
const B = 'Q-017-failure-2';
const C = 'Q-031-dor-fail-1';
const G = 'Q-020-dor-1';
const STATE_RE = /^(held|shown, no recommendation yet|shown, recommended \S+)$/;

function full(extra = {}) {
  return records({
    cards: [card(A), card(B), card(C), gateCard(G)],
    files: { [notesPath(A)]: notes('drop') },
    log: [entry(A, T0), entry(B, at(T0, -30)), entry(C, at(T0, 1)), entry(G, T0)],
    ...extra,
  });
}

test('join-test: S-005/J3 — each decision card carries exactly one of the three states; gate cards none', async () => {
  const list = await seam.ruleList({ records: full(), moment: at(T0, 2) });
  assert.deepEqual(decisionStates(list), { [A]: rec('drop'), [B]: NOREC, [C]: HELD });
  for (const c of list.cards) {
    if (c.kind === 'decision') assert.match(c.state, STATE_RE);
    else assert.ok(c.state == null, `${c.id} (${c.kind}) carries no new state`);
  }
  assert.equal(list.cards.filter((c) => c.id === A).length, 1, 'one entry per card');
  assert.deepEqual(list.flags ?? [], []);
});

test('join-test: S-005/J3 — nothing about earlier reads is carried', async () => {
  const fresh = await seam.ruleList({ records: full(), moment: at(T0, 2) });
  // Disturb any hidden memory: other records, other moments, failed reads.
  await seam.ruleList({ records: full({ files: {} }), moment: at(T0, 40) });
  await seam.ruleList({ records: full({ fail: { queue: true } }), moment: at(T0, 2) });
  await seam.ruleList({ records: full({ fail: { log: true } }), moment: at(T0, 2) });
  const again = await seam.ruleList({ records: full(), moment: at(T0, 2) });
  assert.deepEqual(decisionStates(again), decisionStates(fresh));
});

test('join-test: S-005/J3 — queue/ or notes not got: no decision cards and the flag (either or both)', async () => {
  const q = await seam.ruleList({ records: full({ fail: { queue: true } }), moment: at(T0, 2) });
  assert.deepEqual(decisionStates(q), {});
  assert.ok(hasFlag(q.flags, 'queue'));
  assert.ok(!hasFlag(q.flags, 'notes'));

  const n = await seam.ruleList({ records: full({ fail: { files: [notesPath(A)] } }), moment: at(T0, 2) });
  assert.deepEqual(decisionStates(n), {});
  assert.ok(hasFlag(n.flags, 'notes'));
  assert.ok(!hasFlag(n.flags, 'queue'));

  const both = await seam.ruleList({ records: full({ fail: { queue: true, files: [notesPath(A)] } }), moment: at(T0, 2) });
  assert.deepEqual(decisionStates(both), {});
  assert.ok(hasFlag(both.flags, 'queue') && hasFlag(both.flags, 'notes'));
});

test('join-test: S-005/J3 — log not got: only cards with a notes word, each shown recommended; flag if any left out', async () => {
  const l = await seam.ruleList({ records: full({ fail: { log: true } }), moment: at(T0, 2) });
  assert.deepEqual(decisionStates(l), { [A]: rec('drop') });
  assert.ok(hasFlag(l.flags, 'log'));

  const allNoted = records({ cards: [card(A)], files: { [notesPath(A)]: notes('drop') }, log: [entry(A, T0)], fail: { log: true } });
  const l2 = await seam.ruleList({ records: allNoted, moment: at(T0, 2) });
  assert.deepEqual(decisionStates(l2), { [A]: rec('drop') });
  assert.ok(!hasFlag(l2.flags, 'log'), 'no decision card left out, so no flag');
});

test('join-test: S-005/J3 — a card answered while held leaves the list', async () => {
  const r = records({ cards: [card(A)], log: [entry(A, T0)] });
  assert.equal(stateIn(await seam.ruleList({ records: r, moment: at(T0, 1) }), A), HELD);
  const answered = records({ cards: [], log: [entry(A, T0)] });
  assert.equal(stateIn(await seam.ruleList({ records: answered, moment: at(T0, 2) }), A), undefined);
});

test('join-test: S-005/J3 — notes arriving in the same read as the day passing: the notes win', async () => {
  const r = records({ cards: [card(A)], files: { [notesPath(A)]: notes('resubmit') }, log: [entry(A, T0)] });
  assert.equal(stateIn(await seam.ruleList({ records: r, moment: at(T0, 24) }), A), rec('resubmit'));
});

test('join-test: S-005/J3 — notes removed after showing: the state is worked out again', async () => {
  const noted = (raised) => records({ cards: [card(A)], files: { [notesPath(A)]: notes('drop') }, log: raised ? [entry(A, raised)] : [] });
  const bare = (raised) => records({ cards: [card(A)], log: raised ? [entry(A, raised)] : [] });

  // within the first day -> back to held
  assert.equal(stateIn(await seam.ruleList({ records: noted(T0), moment: at(T0, 2) }), A), rec('drop'));
  assert.equal(stateIn(await seam.ruleList({ records: bare(T0), moment: at(T0, 3) }), A), HELD);
  // a day or more -> shown, no recommendation yet
  assert.equal(stateIn(await seam.ruleList({ records: bare(T0), moment: at(T0, 26) }), A), NOREC);
  // raised before the read part of the log -> shown, no recommendation yet
  assert.equal(stateIn(await seam.ruleList({ records: bare(null), moment: at(T0, 3) }), A), NOREC);
});
