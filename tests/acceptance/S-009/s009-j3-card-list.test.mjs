// join-test: S-009/J3
// J3: the rule -> the one card list every view reads: states from the records and the moment
// alone, the flags, and J3's awkward cases. Run on the built code through the adapter (J7 forms).
// Covers: AC2, AC5, AC11 (same records and moment, same state), AC16, AC17.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, runAdapterRaw, deskCase, background, withCards, entry, stateOf, hasLine, L_QUEUE, L_NOTES, L_LOG } from './s009-lib.mjs';

const BG = background();
const M = '2026-11-12T12:00:00Z';

test('J3: notes arriving as the day passes -> the notes win', () => {
  const id = 'P-501-stop-1';
  const r = run(deskCase('S009-X-j3-both', M, withCards(BG, [{ id, raised: '2026-11-11T12:00:00Z', notes: 'Recommendation: `resubmit`\n' }])));
  assert.equal(stateOf(r, id), 'rec:resubmit');
});

test('J3: notes removed after a card showed -> the state is worked out again', () => {
  const young = 'P-502-stop-1', old = 'P-503-stop-1', unlogged = 'P-504-stop-1';
  const withNotes = withCards(BG, [
    { id: young, raised: '2026-11-12T10:00:00Z', notes: 'Recommendation: `drop`\n' },
    { id: old, raised: '2026-11-10T10:00:00Z', notes: 'Recommendation: `drop`\n' },
    { id: unlogged, notes: 'Recommendation: `drop`\n' },
  ]);
  const a = run(deskCase('S009-X-j3-rm-a', M, withNotes));
  for (const id of [young, old, unlogged]) assert.equal(stateOf(a, id), 'rec:drop');
  const removed = { ...withNotes, notes: {} };
  const b = run(deskCase('S009-X-j3-rm-b', M, removed));
  assert.equal(stateOf(b, young), 'off', 'raised less than a day ago: back to held');
  assert.equal(stateOf(b, old), 'norec');
  assert.equal(stateOf(b, unlogged), 'norec');
});

test('J3: the flags. queue/ or notes not got -> no decision cards; log not got -> only cards with a word', () => {
  const w = 'P-505-stop-1', n = 'P-506-stop-1';
  const recs = withCards(BG, [{ id: w, raised: '2026-11-10T10:00:00Z', notes: 'Recommendation: `drop`\n' }, { id: n, raised: '2026-11-10T10:00:00Z' }]);
  const q = run(deskCase('S009-X-j3-fq', M, recs, { fail: ['queue'] }));
  const no = run(deskCase('S009-X-j3-fn', M, recs, { fail: ['notes'] }));
  const both = run(deskCase('S009-X-j3-fqn', M, recs, { fail: ['queue', 'notes'] }));
  const lg = run(deskCase('S009-X-j3-fl', M, recs, { fail: ['log'] }));
  for (const r of [q, no, both]) { assert.equal(stateOf(r, w), 'off'); assert.equal(stateOf(r, n), 'off'); }
  assert.ok(hasLine(q, L_QUEUE) && !hasLine(q, L_NOTES));
  assert.ok(hasLine(no, L_NOTES) && !hasLine(no, L_QUEUE));
  assert.ok(hasLine(both, L_QUEUE) && hasLine(both, L_NOTES));
  assert.equal(stateOf(lg, w), 'rec:drop');
  assert.equal(stateOf(lg, n), 'off');
  assert.ok(hasLine(lg, L_LOG));
  // no decision card left out -> no log flag
  const allWord = withCards(BG, [{ id: w, raised: '2026-11-10T10:00:00Z', notes: 'Recommendation: `drop`\n' }]);
  const lg2 = run(deskCase('S009-X-j3-fl2', M, allWord, { fail: ['log'] }));
  assert.equal(stateOf(lg2, w), 'rec:drop');
  assert.ok(!hasLine(lg2, L_LOG), 'the log flag shows though no decision card was left out');
});

test('J3: gate cards, questions and pull-request cards carry no new state', () => {
  const id = 'P-507-stop-1';
  const held = run(deskCase('S009-X-j3-g1', M, withCards(BG, [{ id, raised: '2026-11-12T10:00:00Z' }])));
  const shown = run(deskCase('S009-X-j3-g2', M, withCards(BG, [{ id, raised: '2026-11-12T10:00:00Z', notes: 'Recommendation: `drop`\n' }])));
  for (const other of ['P-100-dor-1', 'question:release-timing', 'pr:7']) {
    assert.deepEqual(entry(held, other), entry(shown, other), `${other} differs with a decision card held or shown`);
  }
});

test('J3, AC11: the same records and moment give the same bytes, run after run', () => {
  const c = deskCase('S009-X-j3-det', M, withCards(BG, [{ id: 'P-508-stop-1', raised: '2026-11-11T13:00:00Z' }, { id: 'P-509-stop-1' }]));
  const a = runAdapterRaw(c), b = runAdapterRaw(c);
  assert.ok(a.ok && b.ok, `failed run: ${a.error || b.error}`);
  assert.equal(a.text, b.text);
});
