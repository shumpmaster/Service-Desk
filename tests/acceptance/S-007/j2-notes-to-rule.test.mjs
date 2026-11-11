// join-test: S-007/J2
// The main branch's file tree and a notes file -> the rule (D1): the recommended word.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seam, T0, at, card, entry, notesPath, records, HELD, rec, stateIn, hasFlag } from './lib.mjs';

const ID = 'Q-019-stop-1'; // words: drop, re-specify, resubmit; section 5 names re-specify
const M = at(T0, 2); // under a day: no notes word -> held

async function stateWith(text) {
  const r = records({ cards: [card(ID)], files: { [notesPath(ID)]: text }, log: [entry(ID, T0)] });
  return stateIn(await seam.ruleList({ records: r, moment: M }), ID);
}

const PRE = '# Chief of Staff notes\n\nSome reading first.\n\n';
// The spec's J2 examples, in its order, then the strip rule's other marks.
const CASES = [
  ['plain', 'Recommendation: `drop`', rec('drop')],
  ['bold label, trailing prose', '**Recommendation:** `drop` — the scope is gone', rec('drop')],
  ['italic label', '_Recommendation:_ `resubmit`', rec('resubmit')],
  ['heading', '## Recommendation: `re-specify`', rec('re-specify')],
  ['first backticked word that is a card word', 'Recommendation: not `proceed`; `drop`', rec('drop')],
  ['case differs: not an exact match', 'Recommendation: `Drop`', HELD],
  ['no backticks', 'Recommendation: drop', HELD],
  ['prose mention earlier, then the line', 'The Recommendation: line below says `resubmit`\nRecommendation: `drop`', rec('drop')],
  ['no Recommendation line', 'We think `drop` is right.', HELD],
  ['two lines: the first decides', 'Recommendation: `resubmit`\nRecommendation: `drop`', rec('resubmit')],
  ['two lines: first has no word -> none, second not read', 'Recommendation: drop it\nRecommendation: `drop`', HELD],
  ['star-italic label', '*Recommendation:* `resubmit`', rec('resubmit')],
  ['level-one heading', '# Recommendation: `drop`', rec('drop')],
  ['heading then bold', '## **Recommendation:** `resubmit`', rec('resubmit')],
  ['mention only later in a line', 'See the Recommendation: `resubmit` above', HELD],
  ['backticked word is a prefix of a card word', 'Recommendation: `re`', HELD],
];

for (const [name, line, want] of CASES) {
  test(`join-test: S-007/J2 — ${name}`, async () => {
    assert.equal(await stateWith(`${PRE}${line}\n\nMore text.\n`), want);
  });
}

test('join-test: S-007/J2 — notes for stop-2 beside a card stop-1 are not its notes', async () => {
  const r = records({ cards: [card(ID)], files: { [notesPath('Q-019-stop-2')]: 'Recommendation: `drop`\n' }, log: [entry(ID, T0)] });
  assert.equal(stateIn(await seam.ruleList({ records: r, moment: M }), ID), HELD);
});

test('join-test: S-007/J2 — notes for another item are not its notes', async () => {
  const r = records({ cards: [card(ID)], files: { [notesPath('Q-018-stop-1')]: 'Recommendation: `drop`\n' }, log: [entry(ID, T0)] });
  assert.equal(stateIn(await seam.ruleList({ records: r, moment: M }), ID), HELD);
});

test('join-test: S-007/J2 — the card\'s words decide: a word another card offers does not count', async () => {
  const other = 'Q-023-stop-1';
  const r = records({
    cards: [card(ID), card(other, 'drop', ['drop', 'abandon'])],
    files: { [notesPath(ID)]: 'Recommendation: `abandon`\n', [notesPath(other)]: 'Recommendation: `abandon`\n' },
    log: [entry(ID, T0), entry(other, T0)],
  });
  const list = await seam.ruleList({ records: r, moment: M });
  assert.equal(stateIn(list, ID), HELD);
  assert.equal(stateIn(list, other), rec('abandon'));
});

test('join-test: S-007/J2 — a notes file in the tree whose content cannot be got is not "no notes"', async () => {
  const r = records({ cards: [card(ID)], files: { [notesPath(ID)]: 'Recommendation: `drop`\n' }, log: [entry(ID, T0)], fail: { files: [notesPath(ID)] } });
  const list = await seam.ruleList({ records: r, moment: at(T0, 30) });
  assert.equal(stateIn(list, ID), undefined, 'no state, not "shown, no recommendation yet"');
  assert.ok(hasFlag(list.flags, 'notes'));
});
