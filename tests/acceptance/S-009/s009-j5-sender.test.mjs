// join-test: S-009/J5
// join-test: S-014/J5
// J5: the card list -> the notification sender. Sender cases at J5's point (J7 line 151), and the
// desk cases' first sender run (`notices`, J7 line 154), on the built code through the adapter.
// The comparison with the baseline run (AC14's two cases) is in the J7 locked check.
// Covers: AC1, AC2, AC4, AC14, AC16, AC17.
// Rewritten under specs/S-014.md and decisions/questions/P-003-S-009-adapter-stop.md (:19): notices
// are read in J7's notice form (S-014 line 155), card by card on `sender` cases and by a card's count
// difference on `desk` cases (S-014 lines 57, 173).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, senderCase, deskCase, background, withCards, loadBaselineCases, senderInfos, names, countDifference } from './s009-lib.mjs';

const BG = background();
const M = '2026-11-12T12:00:00Z';
const G = { id: 'P-100-dor-1', kind: 'dor', content: 'v1' };
const X = { id: 'P-701-stop-1', kind: 'stop', content: 'recommended-drop' };

// S-014 line 57, on a `sender` case's lists: (1) no item notice names a card on a run whose list does
// not hold it; (2) the first run's summary counts every item on its list (sender.mjs:269-270), the
// card among them when the list holds it; (3) on a run after the first whose list holds `id` and
// holds one or two items (by id) not on the run just before's list, `id` among them, an item notice
// names `id`. Returns the runs at which (3) applied.
function checkSenderCard(c, r, id) {
  const infos = senderInfos(r);
  assert.equal(infos.length, c.runs.length, `${c.case}: ${infos.length} runs of notices for ${c.runs.length} runs`);
  const allIds = [...new Set(c.runs.flat().map((x) => x.id))];
  c.runs.forEach((list, i) => {
    for (const other of allIds.filter((o) => !list.some((x) => x.id === o))) {
      assert.ok(!infos[i].some((n) => names(n, other)), `${c.case} run ${i + 1}: an item notice names ${other}, which is not on that run's list: ${JSON.stringify(r.notices[i])}`);
    }
  });
  const sums = infos[0].filter((n) => n.kind === 'summary');
  assert.equal(sums.length, 1, `${c.case} run 1: not one summary opening Home: ${JSON.stringify(r.notices[0])}`);
  assert.equal(sums[0].count, c.runs[0].length, `${c.case} run 1: the summary counts ${sums[0].count}, not the ${c.runs[0].length} items on its list${c.runs[0].some((x) => x.id === id) ? `, ${id} among them` : ''}: ${JSON.stringify(r.notices[0])}`);
  const named = [];
  c.runs.forEach((list, i) => {
    if (i === 0 || !list.some((x) => x.id === id)) return;
    const fresh = list.filter((x) => !c.runs[i - 1].some((y) => y.id === x.id));
    if (fresh.length >= 1 && fresh.length <= 2 && fresh.some((x) => x.id === id)) {
      assert.ok(infos[i].some((n) => names(n, id)), `${c.case} run ${i + 1}: no item notice names ${id} at its showing: ${JSON.stringify(r.notices[i])}`);
      named.push(i);
    }
  });
  return named;
}

test('AC14: no notice while a card is off the list; one at its first showing', () => {
  const c = senderCase('S009-X-j5-first', M, [[G], [G], [G, X]]);
  const named = checkSenderCard(c, run(c), X.id);
  assert.deepEqual(named, [2], 'the card\'s first showing, on run 3, was not checked by name');
});

test('AC14, AC15: nothing is sent while a card is off the list after it was notified', () => {
  // run 1 is a first run: its summary counts both items, the card among them; runs 2 and 3 name it not
  const c = senderCase('S009-X-j5-leave', M, [[G, X], [G], [G]]);
  checkSenderCard(c, run(c), X.id);
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
  // each card's count difference (S-014 line 173): 0 for the held card, 1 for each shown one
  const cd = deskCase('S009-X-j5-desk', M, recs);
  assert.equal(countDifference(cd, held), 0, 'a held card is counted in the first run\'s summary (AC1)');
  assert.equal(countDifference(cd, shown), 1, 'a card with a word is not counted once at first showing (AC2)');
  assert.equal(countDifference(cd, late), 1, 'a card a day old is not counted once at first showing (AC4)');
  // a gate card's notice is "as today" (AC9): no baseline case holds these records, so it is left to
  // the J7 locked check's comparison with the record (Critic round 2, N2)
  // J5 awkward cases: a failed queue/, notes or log read sends no notice for any card on that run
  for (const f of ['queue', 'notes', 'log']) {
    const x = run(deskCase(`S009-X-j5-fail-${f}`, M, recs, { fail: [f] }));
    assert.deepEqual(x.notices, [], `the sender sends ${JSON.stringify(x.notices)} with ${f} failing (AC16, AC17, J5)`);
  }
});
