// S-009: holding and showing (D1, D2), run on the built code through the adapter (J7 forms).
// Covers: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC19.
// Until the build exists these fail with "output does not exist yet" (no adapter); that is right.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  run, deskCase, openCase, background, withCards, entry, stateOf, assertViewsAgree,
  MARK, NEW_LINES, GATE_WORDS,
} from './s009-lib.mjs';

const M = '2026-11-12T12:00:00Z';
const before = (h, m = M) => new Date(Date.parse(m) - h * 3600e3).toISOString();
const BG = background();

const noNewLines = (r) => assert.ok(!r.lines.some((l) => NEW_LINES.includes(l.trim())), `unexpected AC16/AC17 line in ${JSON.stringify(r.lines)}`);
const baseCount = () => run(deskCase('S009-X-bg', M, BG)).home_count;

test('AC1: a decision card with no notes, raised less than a day ago, is held everywhere', () => {
  const id = 'P-201-stop-1';
  const r = run(deskCase('S009-X-ac1', M, withCards(BG, [{ id, raised: before(3) }])));
  const e = entry(r, id);
  assert.deepEqual([e.on_list, e.on_board, e.buttons, e.marked], [false, false, false, null], `${id} not held: ${JSON.stringify(e)}`);
  assert.equal(r.home_count, baseCount(), 'a held card is in Home\'s count');
  assert.ok(!r.notices.includes(id), 'a notice is sent for a held card');
  noNewLines(r);
  // its link opens no answer buttons (what the desk opens for a card not on its list: AC15, J7 test)
  const o = run(openCase('S009-X-ac1-link', M, withCards(BG, [{ id, raised: before(3) }]), { id, via: 'link' }));
  assert.equal(o.buttons, false, 'a held card\'s link offers answer buttons');
  const n = run(openCase('S009-X-ac1-notice', M, withCards(BG, [{ id, raised: before(3) }]), { id, via: 'notice' }));
  assert.equal(n.buttons, false, 'a held card\'s notice offers answer buttons');
});

test('AC2: notes with a recommended word show the card with that word, and only that button, marked', () => {
  const id = 'P-202-failure-1';
  const recs = withCards(BG, [{ id, raised: before(3), notes: 'Recommendation: `re-specify`\n' }]);
  const r = run(deskCase('S009-X-ac2', M, recs));
  const e = entry(r, id);
  assert.deepEqual([e.on_list, e.on_board, e.buttons, e.marked], [true, true, true, 're-specify'], JSON.stringify(e));
  assert.equal(r.home_count, baseCount() + 1, 'a shown card is not in Home\'s count once');
  assert.ok(r.notices.includes(id), 'no notice at first showing (AC14)');
  const o = run(openCase('S009-X-ac2-link', M, recs, { id, via: 'link' }));
  assert.equal(o.buttons, true);
  assert.ok(o.shows.includes('re-specify'), 'the card sheet does not name the recommended word');
  assert.ok(!o.shows.includes(MARK), 'a card with a recommended word carries the no-recommendation mark');
});

test('AC3: on a decision card no mark comes from anything but the notes\' word', () => {
  // The case form gives decision card files no section 5 (J7 line 150), so this checks that with no
  // notes a shown decision card has no marked button, and with notes only the notes' word.
  const a = 'P-203-stop-1', b = 'P-204-stop-1';
  const r = run(deskCase('S009-X-ac3', M, withCards(BG, [{ id: a, raised: before(30) }, { id: b, raised: before(30), notes: 'Recommendation: `resubmit`\n' }])));
  assert.equal(entry(r, a).marked, null);
  assert.equal(entry(r, b).marked, 'resubmit');
});

test('AC4: a day or more with no notes shows the card with the mark and no marked button', () => {
  const id = 'P-205-stop-1';
  const raised = '2026-11-11T12:00:00Z';
  const recs = withCards(BG, [{ id, raised }]);
  const at = run(deskCase('S009-X-ac4-24h', '2026-11-12T12:00:00Z', recs));
  const e = entry(at, id);
  assert.deepEqual([e.on_list, e.on_board, e.buttons, e.marked], [true, true, true, null], `at exactly 24 hours: ${JSON.stringify(e)}`);
  assert.ok(at.notices.includes(id), 'no notice at first showing (AC14)');
  const o = run(openCase('S009-X-ac4-link', '2026-11-12T12:00:00Z', recs, { id, via: 'link' }));
  assert.equal(o.buttons, true);
  assert.ok(o.shows.includes(MARK), `the card sheet lacks "${MARK}": ${o.shows}`);
  const early = run(deskCase('S009-X-ac4-23h59', '2026-11-12T11:59:00Z', recs));
  assert.equal(stateOf(early, id), 'off', 'shown before 24 hours with no notes');
});

test('AC5: the mark gives way when notes with a recommended word arrive', () => {
  const id = 'P-206-failure-1';
  const raised = before(30);
  const r1 = run(deskCase('S009-X-ac5-a', M, withCards(BG, [{ id, raised }])));
  assert.equal(stateOf(r1, id), 'norec');
  const recs2 = withCards(BG, [{ id, raised, notes: '## Recommendation: `drop`\n' }]);
  const r2 = run(deskCase('S009-X-ac5-b', M, recs2));
  assert.equal(stateOf(r2, id), 'rec:drop');
  const o = run(openCase('S009-X-ac5-link', M, recs2, { id, via: 'link' }));
  assert.ok(!o.shows.includes(MARK), 'the mark did not give way');
});

test('AC6: notes with no recommended word count as no notes', () => {
  const variants = [
    'No recommendation line here.\n',
    'Recommendation: drop\n',
    'Recommendation: `Drop`\n',
    'Recommendation: `proceed`\n',
    'Some text\n\nThe Recommendation: is `drop` (mentioned in prose)\n',
  ];
  const cards = variants.map((notes, i) => ({ id: `P-21${i}-stop-1`, notes }));
  const young = run(deskCase('S009-X-ac6-young', M, withCards(BG, cards.map((c) => ({ ...c, raised: before(2) })))));
  const old = run(deskCase('S009-X-ac6-old', M, withCards(BG, cards.map((c) => ({ ...c, raised: before(25) })))));
  for (const c of cards) {
    assert.equal(stateOf(young, c.id), 'off', `${c.id} (${JSON.stringify(c.notes)}) not held within its first day`);
    assert.equal(stateOf(old, c.id), 'norec', `${c.id} (${JSON.stringify(c.notes)}) not shown with the mark after a day`);
    assertViewsAgree(young, c.id);
    assertViewsAgree(old, c.id);
  }
});

test('AC7: a card with no card entry in the log that was read is shown at once', () => {
  const a = 'P-220-stop-1', b = 'P-221-failure-1';
  const r = run(deskCase('S009-X-ac7', M, withCards(BG, [{ id: a }, { id: b, notes: 'Recommendation: `drop`\n' }])));
  assert.equal(stateOf(r, a), 'norec', 'a card raised before the log that is read is not shown at once with the mark');
  assert.equal(stateOf(r, b), 'rec:drop', 'as AC2 when its notes are there');
  noNewLines(r);
  assertViewsAgree(r, a); assertViewsAgree(r, b);
});

test('AC8 (partial; the rest is rubric R3): a card whose notes are named only in a pull request\'s title is held', () => {
  // The case form holds only the main branch's records and gives a pull request only a number and a
  // title, so this checks only that notes named in a pull request do not count. Notes on another
  // branch's tree cannot be expressed in J7's form: checks/S-009/review-rubric.md R3.
  const id = 'P-230-stop-1';
  const recs = withCards({ ...BG, pulls: [...BG.pulls, { number: 8, title: 'Notes for P-230 stop-1: Recommendation: `drop`' }] }, [{ id, raised: before(2) }]);
  const r = run(deskCase('S009-X-ac8', M, recs));
  assert.equal(stateOf(r, id), 'off');
});

test('AC19: a question shows as today, and a review card that is a decision card waits like any', () => {
  const q = 'v6-feedback', rv = 'P-240-stop-1';
  const recs = withCards({ ...BG, questions: [...BG.questions, q] }, [{ id: rv, raised: before(2) }]);
  const r = run(deskCase('S009-X-ac19', M, recs));
  assert.equal(entry(r, `question:${q}`).on_list, true, 'the feedback question is not shown');
  // Whether it is notified is "as today" (AC9); no baseline case holds these records, so it is left
  // to the J7 locked check's comparison with the record (Critic round 2, N2).
  assert.equal(stateOf(r, rv), 'off', 'the review card is not held for its notes');
  const later = run(deskCase('S009-X-ac19-later', M, withCards({ ...BG, questions: [...BG.questions, q] }, [{ id: rv, raised: before(24) }])));
  assert.equal(stateOf(later, rv), 'norec', 'the review card does not show after a day');
  assert.equal(entry(later, 'P-100-dor-1').on_list, true, 'a gate card is not shown');
});


test('AC9 (Critic B1): a gate card\'s notes mark no button; with no gate case and no section 5 it is unmarked', () => {
  // AC9 fixes only that a gate card is listed and its mark comes from its gate case; its board,
  // buttons and notice are "as today", which no baseline case gives for these records, so they are
  // left to the J7 locked check's comparison with the record (Critic round 2, N2).
  const crit = 'P-250-criteria-1', launch = 'P-251-launch-1', dorNotes = 'P-253-dor-1';
  const recs = withCards(BG, [
    { id: crit, words: GATE_WORDS, raised: before(2), notes: 'Recommendation: `kill`\n' },
    { id: launch, words: GATE_WORDS, raised: before(30), notes: '**Recommendation:** `hold`\n' },
    // a dor card with notes and no gate case, on a read with no failure (Critic round 2, N1)
    { id: dorNotes, words: GATE_WORDS, raised: before(2), notes: 'Recommendation: `recycle`\n' },
  ]);
  const r = run(deskCase('S009-X-ac9-gatenotes', M, recs));
  for (const id of [crit, launch, dorNotes]) {
    const e = entry(r, id);
    assert.deepEqual([e.on_list, e.marked], [true, null], `${id}: ${JSON.stringify(e)}`);
  }
  // a dor card with a gate case keeps the gate case's word, not its notes'
  const dor = 'P-252-dor-1';
  const recs2 = withCards(BG, [{ id: dor, words: GATE_WORDS, raised: before(2), notes: 'Recommendation: `kill`\n' }]);
  recs2.cases[dor] = 'proceed';
  assert.equal(entry(run(deskCase('S009-X-ac9-dorcase', M, recs2)), dor).marked, 'proceed');
});
