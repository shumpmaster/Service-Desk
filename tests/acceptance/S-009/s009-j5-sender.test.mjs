// join-test: S-009/J5
// J5: the card list -> the notification sender. Sender cases at J5's point (J7 line 151), and the
// desk cases' first sender run (`notices`, J7 line 154), on the built code through the adapter.
// The comparison with the baseline run (AC14's two cases) is in the J7 locked check.
// Covers: AC1, AC2, AC4, AC14, AC16, AC17.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, senderCase, deskCase, background, withCards, loadBaselineCases } from './s009-lib.mjs';

const BG = background();
const M = '2026-11-12T12:00:00Z';
const G = { id: 'P-100-dor-1', kind: 'dor', content: 'v1' };
const X = { id: 'P-701-stop-1', kind: 'stop', content: 'recommended-drop' };

test('AC14: no notice while a card is off the list; one at its first showing', () => {
  const r = run(senderCase('S009-X-j5-first', M, [[G], [G], [G, X]]));
  assert.ok(!r.notices[0].includes(X.id) && !r.notices[1].includes(X.id), 'a notice for a card not on the list');
  assert.ok(r.notices[2].includes(X.id), 'no notice at first showing');
});

test('AC14, AC15: nothing is sent while a card is off the list after it was notified', () => {
  const r = run(senderCase('S009-X-j5-leave', M, [[G, X], [G], [G]]));
  assert.ok(r.notices[0].includes(X.id));
  assert.ok(!r.notices[1].includes(X.id) && !r.notices[2].includes(X.id), 'a notice while the card is off the list');
});

test('AC14: the baseline sender cases run on the built code', () => {
  for (const c of loadBaselineCases().filter((c) => c.data.kind === 'sender')) run(c.data);
});

test('J5: the sender takes the same list as the desk (first run of the desk cases)', () => {
  const held = 'P-702-stop-1', shown = 'P-703-stop-1', late = 'P-704-failure-1';
  const recs = withCards(BG, [
    { id: held, raised: '2026-11-12T10:00:00Z' },
    { id: shown, raised: '2026-11-12T10:00:00Z', notes: 'Recommendation: `drop`\n' },
    { id: late, raised: '2026-11-11T11:00:00Z' },
  ]);
  const r = run(deskCase('S009-X-j5-desk', M, recs));
  assert.ok(!r.notices.includes(held), 'a held card is notified (AC1)');
  assert.ok(r.notices.includes(shown), 'a card with a word is not notified at first showing (AC2)');
  assert.ok(r.notices.includes(late), 'a card a day old is not notified at first showing (AC4)');
  assert.ok(r.notices.includes('P-100-dor-1'), 'a gate card is not notified');
  // J5 awkward cases: a failed queue/, notes or log read sends no notice for any card on that run
  for (const f of ['queue', 'notes', 'log']) {
    const x = run(deskCase(`S009-X-j5-fail-${f}`, M, recs, { fail: [f] }));
    assert.deepEqual(x.notices, [], `the sender sends ${JSON.stringify(x.notices)} with ${f} failing (AC16, AC17, J5)`);
  }
});
