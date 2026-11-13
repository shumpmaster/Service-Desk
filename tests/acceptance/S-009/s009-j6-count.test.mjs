// join-test: S-009/J6
// J6 and AC13: the rule run at J6's check moments on sample records holding AC13's three cards,
// J6's two figures worked out from the states, and J6's first worked example.
// The spec fixes no entry point for the rule's handed-over list (id, raise time, state) other than
// the J7 forms, so the states here are read from J7 `desk` results (held = not on the list;
// `shown, recommended <word>` = marked <word>; `shown, no recommendation yet` = on the list, no mark).
// The list's own form and its raise-time field are not reachable through the J7 forms; see the
// Check author's return. Built code, through the adapter.
// Covers: AC13, AC7 (case (c)), AC4.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, deskCase, background, withCards, stateOf } from './s009-lib.mjs';

const H = 3600e3;
const iso = (t) => new Date(t).toISOString();
// The sample records: each card file and its card entry arrive together at 2026-11-10 10:00, and no
// later commit changes them, so each card's check moments from a due time are the due time alone.
const arrival = Date.parse('2026-11-10T10:00:00Z');
const cards = {
  a: { id: 'P-801-stop-1', raised: '2026-11-11T09:00:00Z' }, // (a) skew: recorded almost a day late
  b: { id: 'P-802-stop-1', raised: '2026-11-10T10:00:00Z' }, // (b) raised and shown on time
  c: { id: 'P-803-failure-1' },                              // (c) raised before the log that is read
};
const recs = withCards(background(), Object.values(cards));

const stateAt = (t) => run(deskCase(`S009-X-j6-${iso(t).replace(/[:.]/g, '')}`, iso(t), recs));
const held = (t, k) => stateOf(stateAt(t), cards[k].id) === 'off';

test('AC13, J6: the two figures at J6\'s check moments', () => {
  // V6 held-too-long: due = recorded raise time + 24h; a card with no recorded raise time is never held.
  const v6 = Object.keys(cards).filter((k) => cards[k].raised && held(Date.parse(cards[k].raised) + 24 * H, k));
  // Held a day after reaching the main branch: due = arrival + 24h.
  const second = Object.keys(cards).filter((k) => held(arrival + 24 * H, k));
  assert.deepEqual(v6, [], 'V6 held-too-long figure');
  assert.deepEqual(second, ['a'], 'held-a-day-after-arrival figure');
});

test('J6: the first worked example', () => {
  assert.equal(stateOf(stateAt(Date.parse('2026-11-12T09:00:00Z')), cards.a.id), 'norec', 'at the V6 due time');
  assert.equal(stateOf(stateAt(Date.parse('2026-11-11T10:00:00Z')), cards.a.id), 'off', 'at arrival + 24h (age 1 hour)');
});

test('AC13: each card\'s state at the check moments', () => {
  const at1 = stateAt(arrival + 24 * H), at2 = stateAt(Date.parse('2026-11-12T09:00:00Z'));
  assert.equal(stateOf(at1, cards.b.id), 'norec');
  assert.equal(stateOf(at1, cards.c.id), 'norec');
  assert.equal(stateOf(at2, cards.b.id), 'norec');
  assert.equal(stateOf(at2, cards.c.id), 'norec');
  assert.equal(stateOf(stateAt(arrival), cards.c.id), 'norec', '(c) is not shown at once');
});
