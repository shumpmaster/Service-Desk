// AC52, as trial-view note 10 changed it (2026-10-15): each "Done today" row says what was ruled,
// in words, with its code after; only the owner's rulings count.
// ac-test: S-001/AC52
import test from 'node:test';
import assert from 'node:assert/strict';
import { byClass, findAll, loadSandbox, linksIn, El0 } from './sandbox-helpers.mjs';
import { NOW, iso, twoProjects, DESIGN_LAB_WORDS, longRuling, lineLines, findKeyed, layout } from './sandbox-fixtures.mjs';
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

for (const [w, h] of [[360, 740], [414, 896]]) {
  test(`AC52 (2026-10-16) at ${w}×${h}: with the owner's real record as a fixture, its "Done today" row shows the first three lines of its words, faded, with its code after and outside the control; the control opens a bubble whose text is the words exactly, held in the viewport above the bottom bar; a short ruling shows whole (AC56's test checks the close and refresh rules)`, async () => {
    const setup = longRuling();
    const app = await loadSandbox({ ...setup, hash: '#/p/Alpha/queue', now: NOW });
    const undo = layout(El0);
    try {
      window.innerHeight = h;
      await app.advance(1000);
      await app.advance(POLL_MS);
      const fold = findKeyed(app, 'done-today');
      fold.setAttribute('open', '');
      fold.dispatch('toggle');
      lineLines(app, 'done:P-001-design-lab-open', 47);
      lineLines(app, 'done:P-001-short', 1);
      await app.resize(w);
      const rows = byClass(fold, 'sb-done-r');
      const parts = rows.map((r) => [byClass(r, 'sb-done-w')[0].textContent, byClass(r, 'code')[0].textContent]);
      assert.deepEqual(parts, [[DESIGN_LAB_WORDS, 'P-001-design-lab-open'], ['A, as recommended', 'P-001-short']], 'each row its line 1 in words, whole on the page, then its code');
      const ctl = findKeyed(app, 'line:done:P-001-design-lab-open');
      assert.ok(ctl && ctl.tag === 'button', 'the long row is a control');
      assert.equal(ctl.attrs['aria-label'], 'Show the whole of P-001-design-lab-open');
      assert.ok(findKeyed(app, 'lineclip:done:P-001-design-lab-open').className.split(' ').includes('over'), 'faded at the cut');
      const [row] = rows;
      const codeEl = byClass(row, 'code')[0];
      assert.ok(!findAll(ctl, (e) => e === codeEl).length, 'its code sits after the control, outside it');
      // AC66 (2026-10-16): then the row's sprint on the Timeline, or "sprint: not recorded" (a ruling whose question names no milestone).
      assert.match(row.textContent, /P-001-design-lab-open at 09:50 · sprint: not recorded$/);
      await app.tap(codeEl);
      assert.equal(findKeyed(app, 'linebubble:done:P-001-design-lab-open'), null, 'a tap on the code opens no bubble');
      await app.tap(ctl);
      const bub = findKeyed(app, 'linebubble:done:P-001-design-lab-open');
      assert.ok(bub, 'a tap opens its bubble');
      assert.equal(byClass(bub, 'sb-bubble-t')[0].textContent, DESIGN_LAB_WORDS, 'the words exactly, from "11 Ruling: 1 I see no need…" to the end of line 1');
      assert.ok(DESIGN_LAB_WORDS.startsWith('11 Ruling: 1 I see no need'));
      assert.ok(bub.className.split(' ').includes('held'), `taller than the viewport: held in it, clear of the bottom bar (${bub.className})`);
      assert.equal(bub.children[0], byClass(bub, 'sb-bubble-top')[0], '"Close" at its top');
      assert.equal(app.loc.hash, '#/p/Alpha/queue', 'no sheet opens');
      // Three lines or fewer: whole, no fade, no control.
      assert.equal(findKeyed(app, 'line:done:P-001-short'), null);
      assert.ok(!findKeyed(app, 'lineclip:done:P-001-short').className.includes('over'));
      // A card answered today is never clipped: rulings only.
      assert.equal(findKeyed(app, 'lineclip:done:P-002 criteria-1'), null);
    } finally {
      undo();
      app.restore();
    }
  });
}
