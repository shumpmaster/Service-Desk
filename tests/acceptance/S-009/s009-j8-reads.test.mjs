// join-test: S-009/J8
// J8: the read places -> the rule. On the built desk and sender, a card file, a notes file and a
// log file fail in turn in the `path` form (the fake server's `blobNull`, the checkout's throwing
// `blobs`), and the check reads which records the rule was handed as not got from the flags' lines,
// the decision cards' states and the sender's notices. Built code, through the adapter.
// Covers: AC16, AC17, AC10 (a notes file's text comes by the existing blob read: failing it there,
// keyed by path, takes effect), AC9 (the can't-read line on a failed notes read, as on a failed log read).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, deskCase, background, withCards, entry, stateOf, hasLine, isCantReadLine, L_QUEUE, L_NOTES, L_LOG, GATE_WORDS } from './s009-lib.mjs';

const BG = background();
const M = '2026-11-12T12:00:00Z';
const w = 'P-901-stop-1', n = 'P-902-failure-1';
const recs = withCards(BG, [{ id: w, raised: '2026-11-10T10:00:00Z', notes: 'Recommendation: `drop`\n' }, { id: n, raised: '2026-11-10T10:00:00Z' }]);

test('J8, AC16: a card file not got -> queue/ not got', () => {
  const r = run(deskCase('S009-X-j8-q', M, recs, { fail: ['queue'] }));
  assert.ok(hasLine(r, L_QUEUE), JSON.stringify(r.lines));
  assert.ok(!hasLine(r, L_NOTES) && !hasLine(r, L_LOG));
  for (const id of [w, n]) { const e = entry(r, id); assert.deepEqual([e.on_list, e.on_board, e.buttons], [false, false, false], id); }
  assert.deepEqual(r.notices, []);
});

test('J8, AC16, AC10: a notes file not got -> the notes not got', () => {
  const r = run(deskCase('S009-X-j8-n', M, recs, { fail: ['notes'] }));
  assert.ok(hasLine(r, L_NOTES), JSON.stringify(r.lines));
  assert.ok(!hasLine(r, L_QUEUE) && !hasLine(r, L_LOG));
  for (const id of [w, n]) { const e = entry(r, id); assert.deepEqual([e.on_list, e.on_board, e.buttons], [false, false, false], id); }
  assert.ok(r.lines.some(isCantReadLine), 'a failed notes read is not handled as a failed log read is today (no "Can\'t read" line)');
  assert.deepEqual(r.notices, [], 'the sender sends on a failed notes read');
});

test('J8, AC17: a log file not got -> the dispatch log not got', () => {
  const r = run(deskCase('S009-X-j8-l', M, recs, { fail: ['log'] }));
  assert.ok(hasLine(r, L_LOG), JSON.stringify(r.lines));
  assert.ok(!hasLine(r, L_QUEUE) && !hasLine(r, L_NOTES));
  assert.equal(stateOf(r, w), 'rec:drop');
  const e = entry(r, w); assert.deepEqual([e.on_list, e.on_board, e.buttons], [true, true, true]);
  assert.equal(stateOf(r, n), 'off');
  assert.deepEqual(r.notices, [], 'the sender sends on a failed log read (AC17: nothing for any card)');
});

test('J8: the real server\'s whole-call form -> queue/ not got', () => {
  const r = run(deskCase('S009-X-j8-qcall', M, recs, { fail: ['queue'], form: 'call' }));
  assert.ok(hasLine(r, L_QUEUE));
  for (const id of [w, n]) assert.equal(stateOf(r, id), 'off');
  assert.deepEqual(r.notices, []);
});

test('J8: a failing notes file the rule does not need fails no read', () => {
  // only notes for a card not in queue/ (stop-2 beside stop-1): no notes file is in the tree for a
  // decision card in queue/, so the notes are got
  const r2 = withCards(BG, [{ id: 'P-903-stop-1', raised: '2026-11-12T10:00:00Z' }]);
  r2.notes['P-903-stop-2'] = 'Recommendation: `drop`\n';
  const r = run(deskCase('S009-X-j8-unneeded', M, r2, { fail: ['notes'] }));
  assert.ok(!hasLine(r, L_NOTES), 'the notes line shows though no notes file the rule needs failed');
  assert.equal(stateOf(r, 'P-903-stop-1'), 'off');
  assert.ok(!r.lines.some(isCantReadLine), 'a can\'t-read line though no read failed');
  assert.ok(r.notices.length > 0, 'the sender sends nothing though no read failed');
});

test('J8, AC16: a later read that gets the records holds or shows each card by its real age', () => {
  const r = run(deskCase('S009-X-j8-ok', M, recs));
  assert.equal(stateOf(r, w), 'rec:drop');
  assert.equal(stateOf(r, n), 'norec');
  assert.ok(!hasLine(r, L_QUEUE) && !hasLine(r, L_NOTES) && !hasLine(r, L_LOG));
});

test('J8, AC9 (Critic B1): a failing gate card\'s notes file fails no read', () => {
  // the only notes are gate cards' (no gate case): the rule needs no notes file, so failing them
  // hides nothing, shows no line, and the sender still sends
  const r2 = withCards(BG, [
    { id: 'P-904-criteria-1', words: GATE_WORDS, raised: '2026-11-12T10:00:00Z', notes: 'Recommendation: `kill`\n' },
    { id: 'P-905-stop-1', raised: '2026-11-10T10:00:00Z' },
  ]);
  r2.notes['P-100-dor-1'] = 'Recommendation: `hold`\n';
  const r = run(deskCase('S009-X-j8-gatenotes', M, r2, { fail: ['notes'] }));
  assert.ok(!hasLine(r, L_NOTES), 'the notes line shows though only gate cards\' notes failed');
  assert.ok(!r.lines.some(isCantReadLine), 'a can\'t-read line though only gate cards\' notes failed');
  assert.ok(r.notices.length > 0, 'the sender sends nothing though only gate cards\' notes failed');
  assert.equal(entry(r, 'P-904-criteria-1').on_list, true);
  assert.equal(entry(r, 'P-904-criteria-1').marked, null);
  assert.equal(stateOf(r, 'P-905-stop-1'), 'norec');
});
