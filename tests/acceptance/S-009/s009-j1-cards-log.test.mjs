// join-test: S-009/J1
// J1: queue/ and the dispatch log on the main branch -> the rule. Run on the built code through the
// adapter (J7 forms). Covers: AC1, AC4, AC7, AC9 (dor-fail is not a dor gate card), AC17.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, deskCase, background, withCards, entry, stateOf, hasLine, L_LOG, L_QUEUE, GATE_WORDS } from './s009-lib.mjs';

const BG = background();

test('J1: a dor-fail card is a decision card, not a dor gate card', () => {
  const df = 'P-301-dor-fail-1', dor = 'P-302-dor-1';
  const recs = withCards(BG, [{ id: df, raised: '2026-11-12T10:00:00Z' }, { id: dor, words: GATE_WORDS, raised: '2026-11-12T10:00:00Z' }]);
  const r = run(deskCase('S009-X-j1-dorfail', '2026-11-12T12:00:00Z', recs));
  assert.equal(stateOf(r, df), 'off', 'a dor-fail card raised two hours ago with no notes is shown, as if it were a dor gate card');
  assert.equal(entry(r, dor).on_list, true, 'a dor gate card raised two hours ago is held, as if it were a decision card');
});

test('J1: no card entry in the part of the log that was read -> shown at once', () => {
  const id = 'P-303-stop-1';
  const r = run(deskCase('S009-X-j1-noentry', '2026-11-12T12:00:00Z', withCards(BG, [{ id }])));
  assert.equal(stateOf(r, id), 'norec');
});

test('J1: the log not got -> shown only with notes that have a recommended word', () => {
  const a = 'P-304-stop-1', b = 'P-305-stop-1';
  const recs = withCards(BG, [{ id: a, raised: '2026-11-12T10:00:00Z', notes: 'Recommendation: `drop`\n' }, { id: b, raised: '2026-11-10T10:00:00Z' }]);
  const r = run(deskCase('S009-X-j1-nolog', '2026-11-12T12:00:00Z', recs, { fail: ['log'] }));
  assert.equal(stateOf(r, a), 'rec:drop');
  assert.equal(stateOf(r, b), 'off', 'a card without notes is shown though the log was not got');
  assert.ok(hasLine(r, L_LOG));
});

test('J1: queue/ not got -> no decision card gets a state', () => {
  const a = 'P-306-stop-1';
  const recs = withCards(BG, [{ id: a, raised: '2026-11-10T10:00:00Z', notes: 'Recommendation: `drop`\n' }]);
  const r = run(deskCase('S009-X-j1-noqueue', '2026-11-12T12:00:00Z', recs, { fail: ['queue'] }));
  assert.equal(stateOf(r, a), 'off');
  assert.ok(hasLine(r, L_QUEUE));
});

test('J1: two card entries -> the earliest raise time, whatever their order', () => {
  // In one month file, in order and reversed; and across the previous month's file and this one.
  const inOrder = 'P-310-stop-1', reversed = 'P-311-stop-1';
  const recs = withCards(BG, [
    { id: inOrder, raisedAll: ['2026-11-11T10:00:00Z', '2026-11-12T10:00:00Z'] },
    { id: reversed, raisedAll: ['2026-11-12T10:00:00Z', '2026-11-11T10:00:00Z'] },
  ]);
  const shown = run(deskCase('S009-X-j1-two-shown', '2026-11-12T10:30:00Z', recs));
  assert.equal(stateOf(shown, inOrder), 'norec', 'held past a day from the earlier entry');
  assert.equal(stateOf(shown, reversed), 'norec', 'held past a day from the earlier entry (entries reversed)');
  const held = run(deskCase('S009-X-j1-two-held', '2026-11-12T09:30:00Z', recs));
  assert.equal(stateOf(held, inOrder), 'off', 'shown before a day from the earlier entry');
  assert.equal(stateOf(held, reversed), 'off');

  const cross = 'P-312-stop-1';
  const recs2 = withCards(BG, [{ id: cross, raisedAll: ['2026-10-31T22:00:00Z', '2026-11-01T20:00:00Z'] }]);
  assert.equal(stateOf(run(deskCase('S009-X-j1-two-month', '2026-11-01T22:30:00Z', recs2)), cross), 'norec', 'across month files: not from the earliest entry');
});

test('J1: a recorded raise time later than the moment (skew) -> held until it plus 24 hours', () => {
  const id = 'P-320-stop-1';
  const recs = withCards(BG, [{ id, raised: '2026-11-10T10:00:00Z' }]);
  assert.equal(stateOf(run(deskCase('S009-X-j1-skew-a', '2026-11-10T09:58:00Z', recs)), id), 'off', 'negative age not held');
  assert.equal(stateOf(run(deskCase('S009-X-j1-skew-b', '2026-11-11T09:59:00Z', recs)), id), 'off', '23h59m not held');
  assert.equal(stateOf(run(deskCase('S009-X-j1-skew-c', '2026-11-11T10:00:00Z', recs)), id), 'norec', '24h not shown');
});

test('J1: a raise time far ahead of the moment -> held until it plus 24 hours', () => {
  // Kept inside one month file the desk reads (the case form puts each entry in its raise time's
  // month file, J7 line 150).
  const id = 'P-321-failure-1';
  const recs = withCards(BG, [{ id, raised: '2026-11-28T00:00:00Z' }]);
  assert.equal(stateOf(run(deskCase('S009-X-j1-far-a', '2026-11-02T00:00:00Z', recs)), id), 'off');
  assert.equal(stateOf(run(deskCase('S009-X-j1-far-b', '2026-11-29T00:00:00Z', recs)), id), 'norec');
});
