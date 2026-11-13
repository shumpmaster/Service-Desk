// join-test: S-009/J4
// J4: the card list -> the views (queue, Home's count, board, card sheet), and AC11's test: the
// views and the sender handed the same records and one moment, at several moments around a card's
// raise time plus 24 hours, give each decision card one state. Built code, through the adapter.
// Covers: AC1, AC2, AC4, AC11, AC15 (held card's sheet = sheet for a card not on the list), AC16, AC17.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  run, deskCase, openCase, background, withCards, entry, stateOf, assertViewsAgree, hasLine, openProjection,
  MARK, L_QUEUE, L_NOTES, L_LOG,
} from './s009-lib.mjs';

const BG = background();
const R0 = '2026-11-11T12:00:00Z';
const moments = { before: '2026-11-12T11:59:00Z', at: '2026-11-12T12:00:00Z', after: '2026-11-12T13:00:00Z' };
const noNotes = 'P-601-stop-1', withWord = 'P-602-failure-1', unlogged = 'P-603-stop-1';
const recs = withCards(BG, [
  { id: noNotes, raised: R0 },
  { id: withWord, raised: R0, notes: 'Recommendation: `resubmit`\n' },
  { id: unlogged },
]);
const bgOnly = (m) => run(deskCase(`S009-X-j4-bg-${m}`, moments[m], BG)).home_count;
const want = { before: { [noNotes]: 'off', [withWord]: 'rec:resubmit', [unlogged]: 'norec' },
  at: { [noNotes]: 'norec', [withWord]: 'rec:resubmit', [unlogged]: 'norec' },
  after: { [noNotes]: 'norec', [withWord]: 'rec:resubmit', [unlogged]: 'norec' } };

for (const m of Object.keys(moments)) {
  test(`AC11, J4: views, card sheet and sender agree on every decision card (${m} raise + 24h)`, () => {
    const r = run(deskCase(`S009-X-j4-${m}`, moments[m], recs));
    let shown = 0;
    for (const id of [noNotes, withWord, unlogged]) {
      assert.equal(stateOf(r, id), want[m][id], `${id} at ${moments[m]}`);
      assertViewsAgree(r, id); // queue, board, buttons, and the sender's first run
      if (entry(r, id).on_list) shown += 1;
      const o = run(openCase(`S009-X-j4-${m}-${id}`, moments[m], recs, { id, via: 'link' }));
      assert.equal(o.buttons, entry(r, id).on_list, `${id}: the card sheet's buttons disagree with the queue`);
      assert.equal(o.shows.includes(MARK), want[m][id] === 'norec', `${id}: the card sheet's mark disagrees with the state ${want[m][id]}`);
    }
    assert.equal(r.home_count, bgOnly(m) + shown, 'Home\'s count disagrees with the queue');
  });
}

test('J4: the flags show their lines with the exact words', () => {
  assert.ok(hasLine(run(deskCase('S009-X-j4-fq', moments.at, recs, { fail: ['queue'] })), L_QUEUE));
  assert.ok(hasLine(run(deskCase('S009-X-j4-fn', moments.at, recs, { fail: ['notes'] })), L_NOTES));
  const lg = run(deskCase('S009-X-j4-fl', moments.at, recs, { fail: ['log'] }));
  assert.ok(hasLine(lg, L_LOG));
  for (const id of [noNotes, unlogged]) { assert.equal(stateOf(lg, id), 'off'); assertViewsAgree(lg, id, { sender: false }); }
  assert.equal(stateOf(lg, withWord), 'rec:resubmit');
  assertViewsAgree(lg, withWord, { sender: false });
});

test('J4: a held card\'s sheet, by link or notice, is the sheet for a card not on the list', () => {
  const id = 'P-604-stop-1';
  const heldRecs = withCards(BG, [{ id, raised: '2026-11-12T10:00:00Z' }]);
  for (const via of ['link', 'notice']) {
    const held = run(openCase(`S009-X-j4-held-${via}`, moments.at, heldRecs, { id, via }));
    const absent = run(openCase(`S009-X-j4-absent-${via}`, moments.at, BG, { id, via }));
    assert.deepEqual(openProjection(held), openProjection(absent), `held card via ${via} differs from an id not in queue/`);
  }
  // and a card not shown on a failed read
  const failRecs = withCards(BG, [{ id, raised: '2026-11-10T10:00:00Z' }]);
  for (const via of ['link', 'notice']) {
    const off = run(openCase(`S009-X-j4-off-${via}`, moments.at, failRecs, { id, via }, { fail: ['log'] }));
    const absent = run(openCase(`S009-X-j4-absentlog-${via}`, moments.at, BG, { id, via }, { fail: ['log'] }));
    assert.deepEqual(openProjection(off), openProjection(absent), `not-shown card via ${via} differs from an id not in queue/ on the same failed read`);
  }
});

test('AC15: once the card shows again, its notice and link open it as shown', () => {
  const id = 'P-605-stop-1';
  const later = withCards(BG, [{ id, raised: '2026-11-10T10:00:00Z' }]);
  for (const via of ['link', 'notice']) {
    const o = run(openCase(`S009-X-j4-again-${via}`, moments.at, later, { id, via }));
    assert.equal(o.buttons, true, `shown card via ${via} offers no answer buttons`);
    assert.ok(o.shows.includes(MARK), `shown card via ${via} lacks the mark`);
  }
});
