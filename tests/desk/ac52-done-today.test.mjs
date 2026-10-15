// AC52, as trial-view note 10 changed it (2026-10-15): each "Done today" row says what was ruled,
// in words, with its code after; only the owner's rulings count.
// ac-test: S-001/AC52
import test from 'node:test';
import assert from 'node:assert/strict';
import { byClass, findAll, loadSandbox, linksIn } from './sandbox-helpers.mjs';
import { NOW, iso, twoProjects } from './sandbox-fixtures.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';

const PICK = 'Ruling: the five agreed screens (Home, Project, Team, Timeline, and Queue with its response card) are the desk\'s one design direction, so the design lab ends (S-001 AC43); the desk uses the phone\'s own font, not Inter\nProxy: done at the owner\'s request\n';
const VERDICT_FILES = 'Ruling: A — reviewer verdict files are committed on the pull request\'s branch\n';

test('AC52 (note 10): two rulings made the same day are two rows, each its line 1 in words then its code; a card answered today in J9\'s words; a Critic\'s verdict is neither shown nor counted', async () => {
  const setup = twoProjects();
  const at = (min) => [{ commit: { committer: { date: iso(NOW - min * 60e3) } } }];
  setup.repos.Alpha.commit({
    'decisions/questions/P-001-design-pick.md': PICK,
    'decisions/questions/P-001-reviewer-verdict-files.md': VERDICT_FILES,
    'decisions/questions/P-001-milestones-adoption-critic-1.md': 'Verdict: FAIL\n\nThe plan misses a screen.\n',
    'decisions/questions/P-001-design-pick-notes.md': 'Notes on the pick.\n',
    'decisions/questions/P-001-old.md': 'Ruling: B\n',
  });
  Object.assign(setup.repos.Alpha.history, {
    'decisions/questions/P-001-design-pick.md': at(40),
    'decisions/questions/P-001-reviewer-verdict-files.md': at(100),
    'decisions/questions/P-001-milestones-adoption-critic-1.md': at(5),
    'decisions/questions/P-001-design-pick-notes.md': at(39),
    'decisions/questions/P-001-old.md': at(3 * 24 * 60),
  });
  // A card answered today: its decision entry in the log.
  const log = `${setup.repos.Alpha.files['dispatch-log/2026-10.jsonl']}${JSON.stringify({ item: 'P-002', trigger: 'decision', gate: 'criteria', card: 1, word: 'proceed', record: 'decisions/P-002/criteria-1.md', proxy: true, time: iso(NOW - 20 * 60e3) })}\n`;
  setup.repos.Alpha.commit({ 'dispatch-log/2026-10.jsonl': log, 'decisions/P-002/criteria-1.md': 'Decision: proceed\n' });
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha/queue', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    const fold = findAll(app.view, (e) => e.dataset && e.dataset.k === 'done-today')[0];
    const rows = byClass(fold, 'sb-done-r');
    const parts = rows.map((r) => [byClass(r, 'sb-done-w')[0].textContent, byClass(r, 'code')[0].textContent]);
    assert.deepEqual(parts, [
      ['P-002: you answered criteria-1 with proceed (proxy)', 'P-002 criteria-1'],
      ['the five agreed screens (Home, Project, Team, Timeline, and Queue with its response card) are the desk\'s one design direction, so the design lab ends (S-001 AC43); the desk uses the phone\'s own font, not Inter (proxy)', 'P-001-design-pick'],
      ['A — reviewer verdict files are committed on the pull request\'s branch', 'P-001-reviewer-verdict-files'],
    ]);
    assert.match(fold.textContent, /^Done today \(3\)/, 'the Critic\'s verdict and the notes file are not counted');
    assert.doesNotMatch(fold.textContent, /Verdict|critic|notes|P-001-old/);
    const links = linksIn(fold).map((l) => l.href);
    assert.ok(links.includes('https://github.com/shumpmaster/Alpha/blob/main/decisions/questions/P-001-design-pick.md'), 'the code links its record');
  } finally {
    app.restore();
  }
});
