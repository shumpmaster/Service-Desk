// join-test: S-009/J2
// J2: the main branch's tree and a notes file -> the rule: each of J2's examples, run on the built
// code through the adapter (J7 forms). Covers: AC2, AC6, AC16 (a listed notes file not read).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, deskCase, background, withCards, stateOf, hasLine, L_NOTES } from './s009-lib.mjs';

const BG = background();
const M = '2026-11-12T12:00:00Z';
const OLD = '2026-11-10T12:00:00Z'; // over a day: no word -> 'norec', a word -> 'rec:<word>'
const YOUNG = '2026-11-12T10:00:00Z'; // under a day: no word -> held

// Cards' words are drop, re-specify, resubmit (J2).
const examples = [
  ['P-401-stop-1', 'Recommendation: `drop`\n', 'rec:drop'],
  ['P-402-stop-1', '**Recommendation:** `drop` — the scope is gone\n', 'rec:drop'],
  ['P-403-stop-1', '_Recommendation:_ `resubmit`\n', 'rec:resubmit'],
  ['P-404-stop-1', '## Recommendation: `re-specify`\n', 'rec:re-specify'],
  ['P-405-stop-1', 'Recommendation: not `proceed`; `drop`\n', 'rec:drop'],
  ['P-406-stop-1', 'Recommendation: `Drop`\n', 'norec'],
  ['P-407-stop-1', 'Recommendation: drop\n', 'norec'],
  ['P-408-stop-1', 'The Recommendation: line below says `resubmit`\nRecommendation: `drop`\n', 'rec:drop'],
  ['P-409-stop-1', '# Notes\n\nWe looked at it and lean to `drop`.\n', 'norec'],
  ['P-410-stop-1', 'Recommendation: none yet\nRecommendation: `drop`\n', 'norec'],
  ['P-411-stop-1', 'Recommendation: `resubmit`\nRecommendation: `drop`\n', 'rec:resubmit'],
  ['P-412-failure-1', '*Recommendation:* `re-specify`\n', 'rec:re-specify'],
  ['P-413-dor-fail-1', '### **Recommendation:** `drop`\n', 'rec:drop'],
];

test('J2: each example gives the word J2 gives it', () => {
  const r = run(deskCase('S009-X-j2-old', M, withCards(BG, examples.map(([id, notes]) => ({ id, raised: OLD, notes })))));
  for (const [id, notes, want] of examples) assert.equal(stateOf(r, id), want, `${id} notes ${JSON.stringify(notes)}`);
  const y = run(deskCase('S009-X-j2-young', M, withCards(BG, examples.map(([id, notes]) => ({ id, raised: YOUNG, notes })))));
  for (const [id, notes, want] of examples) assert.equal(stateOf(y, id), want === 'norec' ? 'off' : want, `${id} (young) notes ${JSON.stringify(notes)}`);
});

test('J2: notes for stop-2 beside a card stop-1 are not this card\'s notes', () => {
  const recs = withCards(BG, [{ id: 'P-420-stop-1', raised: YOUNG }]);
  recs.notes['P-420-stop-2'] = 'Recommendation: `drop`\n';
  const r = run(deskCase('S009-X-j2-other-n', M, recs));
  assert.equal(stateOf(r, 'P-420-stop-1'), 'off');
});

test('J2: a notes file in the tree whose content the read did not get is not "no notes"', () => {
  const id = 'P-421-stop-1';
  const r = run(deskCase('S009-X-j2-unread', M, withCards(BG, [{ id, raised: OLD, notes: 'Recommendation: `drop`\n' }]), { fail: ['notes'] }));
  assert.equal(stateOf(r, id), 'off', 'shown as if it had no notes');
  assert.ok(hasLine(r, L_NOTES), `no notes line in ${JSON.stringify(r.lines)}`);
});
