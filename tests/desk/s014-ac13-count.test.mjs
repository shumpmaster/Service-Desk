// S-014 (P-003) AC13, J6: the operating notes' recipe (docs/handover/P-003/operating-notes.md, "Running the rule at a
// commit") run as written: a detached worktree at a past commit, the sender's own reader of a checkout
// (src/notify/checkout.mjs `openCheckout`, src/notify/collect.mjs `readRecords`, used as they are), and the rule
// (src/lib/model.js `decisionStates`) at a chosen moment. Made-up records in a scratch git repository (NOT real records).

import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { openCheckout } from '../../src/notify/checkout.mjs';
import { readRecords } from '../../src/notify/collect.mjs';
import { decisionStates } from '../../src/lib/model.js';
import { SD } from './helpers.mjs';
import { checkoutOf, tempDir, cleanScratch } from './notify-helpers.mjs';

after(cleanScratch);

const card = '# Card\n\n## 1. The decision\nPick one\n\n## 4. Options\n- `drop` — drop\n- `re-specify` — re-specify\n';
const entry = (item, gate, n, time) => `${JSON.stringify({ action: 'card', time, item, gate, card: n })}\n`;

/** The recipe: the rule's list for the records at `commit`, at `moment` (ISO). */
function listAt(root, commit, moment) {
  const dir = join(tempDir('s014-at-'), 'tree');
  execFileSync('git', ['-C', root, 'worktree', 'add', '-q', '--detach', dir, commit], { stdio: 'pipe' });
  const now = new Date(moment);
  const { tree, records } = readRecords(SD, openCheckout(dir), now);
  const r = decisionStates({ tree, records, now });
  return { list: [...r.cards.values()], flags: { notRead: r.notRead, withoutNotes: r.withoutNotes } };
}

test('AC13, J6: the rule run at a past commit and a moment gives each decision card\'s id, raise time as recorded and state; J6\'s first worked example', () => {
  // (a) arrives 2026-11-10 10:00 with an entry recording 2026-11-11 09:00 (skew); (b) raised and arriving on time;
  // (c) raised before the part of the log that is read (no entry). Then a later commit adds (b)'s notes.
  const c = checkoutOf({
    base: { 'queue/P-801-stop-1.md': card, 'queue/P-802-stop-1.md': card, 'queue/P-803-failure-1.md': card, 'queue/P-804-dor-1.md': card,
      'dispatch-log/2026-11.jsonl': entry('P-801', 'stop', 1, '2026-11-11T09:00:00Z') + entry('P-802', 'stop', 1, '2026-11-10T10:00:00Z') },
    baseDate: '2026-11-10T10:00:00+00:00',
    later: [{ files: { 'decisions/P-802/stop-1-notes.md': '**Recommendation:** `re-specify`\n' }, date: '2026-11-13T08:00:00+00:00' }],
  });
  const first = c.shas.c0;
  const v6Due = listAt(c.root, first, '2026-11-12T09:00:00Z');
  assert.deepEqual(v6Due.list, [
    { id: 'P-801-stop-1', raised: '2026-11-11T09:00:00Z', state: 'shown, no recommendation yet', word: null },
    { id: 'P-802-stop-1', raised: '2026-11-10T10:00:00Z', state: 'shown, no recommendation yet', word: null },
    { id: 'P-803-failure-1', raised: 'not recorded', state: 'shown, no recommendation yet', word: null },
  ]);
  assert.deepEqual(v6Due.flags, { notRead: [], withoutNotes: false });
  // At (a)'s arrival plus 24 hours its age is 1 hour: held, which the second figure reports.
  const arrivalDue = listAt(c.root, first, '2026-11-11T10:00:00Z');
  assert.deepEqual(arrivalDue.list.map((x) => [x.id, x.state]), [['P-801-stop-1', 'held'], ['P-802-stop-1', 'shown, no recommendation yet'],
    ['P-803-failure-1', 'shown, no recommendation yet']]);
  // At the later commit, (b) shows its notes' word.
  assert.equal(listAt(c.root, c.head, '2026-11-13T08:00:00Z').list.find((x) => x.id === 'P-802-stop-1').state, 'shown, recommended re-specify');
});
