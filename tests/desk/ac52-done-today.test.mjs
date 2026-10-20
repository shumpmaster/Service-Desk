// AC52, as trial-view note 10 changed it (2026-10-15): each "Done today" row says what was ruled,
// in words, with its code after; only the owner's rulings count. From stage 1a (AC80, mockup v2) the
// fold goes with the Queue screen: its rows are the board's Done lane's rows from the records, over
// the last 24 hours, each its title (AC52's words) clipped at two lines, its small line (its code)
// and its time, and a tap on a row opens a small sheet with its whole title, its record's link and
// AC66's "On the Timeline" link where AC66 gives one.
// ac-test: S-001/AC52
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { byClass, findAll, loadSandbox, linksIn } from './sandbox-helpers.mjs';
import { NOW, iso, twoProjects, DESIGN_LAB_WORDS, longRuling, findKeyed } from './sandbox-fixtures.mjs';
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
  const app = await loadSandbox({ ...setup, hash: '#/waiting/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    const lane = findAll(app.view, (e) => e.dataset && e.dataset.k === 'lane:done')[0];
    const rows = byClass(lane, 'v2-drow');
    const parts = rows.map((r) => [byClass(r, 'v2-dt')[0].textContent, byClass(r, 'v2-dc')[0].textContent]);
    assert.deepEqual(parts, [
      ['P-002: you answered criteria-1 with proceed (proxy)', 'P-002 criteria-1'],
      ['the five agreed screens (Home, Project, Team, Timeline, and Queue with its response card) are the desk\'s one design direction, so the design lab ends (S-001 AC43); the desk uses the phone\'s own font, not Inter (proxy)', 'P-001-design-pick'],
      ['A — reviewer verdict files are committed on the pull request\'s branch', 'P-001-reviewer-verdict-files'],
    ], 'newest first, each its line 1 in words then its code');
    assert.match(byClass(rows[1], 'v2-m')[0].textContent, /^P-001-design-pick · 09:20$/, 'its small line, then its time');
    assert.doesNotMatch(lane.textContent, /Verdict|critic|notes|P-001-old/, 'the Critic\'s verdict and the notes file are not shown; a ruling older than 24 hours has left');
    // A tap on a row opens its small sheet: its whole title, and its code linking its record.
    await app.tap(byClass(rows[1], 'v2-dt')[0]);
    await app.go(byClass(rows[1], 'v2-dt')[0].attrs.href);
    const sheet = byClass(app.view, 'v2-sheet')[0];
    assert.ok(sheet, 'a small sheet');
    assert.equal(byClass(sheet, 'v2-stitle')[0].textContent, parts[1][0]);
    const links = linksIn(sheet).map((l) => l.href);
    assert.ok(links.includes('https://github.com/shumpmaster/Alpha/blob/main/decisions/questions/P-001-design-pick.md'), 'the code links its record');
  } finally {
    app.restore();
  }
});

for (const [w, h] of [[360, 740], [414, 896]]) {
  test(`AC52 + AC80 (2026-10-16; stage 1a) at ${w}×${h}: with the owner's real record as a fixture, its Done row holds its words whole, clipped at two lines by the CSS with no ellipsis, its code after and outside the row's link; a tap opens a small sheet whose title is the words exactly, scrolling inside itself; a short ruling shows whole`, async () => {
    const setup = longRuling();
    const app = await loadSandbox({ ...setup, hash: '#/waiting/Alpha', now: NOW });
    try {
      window.innerHeight = h;
      await app.advance(1000);
      await app.advance(POLL_MS);
      await app.resize(w);
      const lane = findKeyed(app, 'lane:done');
      const rows = byClass(lane, 'v2-drow');
      const parts = rows.map((r) => [byClass(r, 'v2-dt')[0].textContent, byClass(r, 'v2-dc')[0].textContent]);
      assert.deepEqual(parts, [[DESIGN_LAB_WORDS, 'P-001-design-lab-open'], ['A, as recommended', 'P-001-short']], 'each row its line 1 in words, whole on the page, then its code');
      const [row] = rows;
      const link = byClass(row, 'v2-dt')[0];
      const codeEl = byClass(row, 'v2-dc')[0];
      assert.equal(link.tag, 'a', 'the row\'s title opens its sheet');
      assert.ok(!findAll(link, (e) => e === codeEl).length, 'its code sits after the link, outside it');
      assert.match(byClass(row, 'v2-m')[0].textContent, /^P-001-design-lab-open · 09:50$/);
      await app.go(link.attrs.href);
      const sheet = byClass(app.view, 'v2-sheet')[0];
      assert.ok(sheet, 'a tap opens its small sheet');
      assert.equal(byClass(sheet, 'v2-stitle')[0].textContent, DESIGN_LAB_WORDS, 'the words exactly, from "11 Ruling: 1 I see no need…" to the end of line 1');
      assert.ok(DESIGN_LAB_WORDS.startsWith('11 Ruling: 1 I see no need'));
      // AC66 (2026-10-16): then the row's sprint on the Timeline, or "sprint: not recorded" (a ruling whose question names no milestone).
      assert.match(sheet.textContent, /P-001-design-lab-open · sprint: not recorded/);
      assert.ok(findKeyed(app, 'sheet-close'), '"Close" at its top');
      assert.equal(parts[1][0], 'A, as recommended', 'three lines or fewer: whole');
    } finally {
      app.restore();
    }
  });
}

test('AC52 + AC80 (stage 1a): a Done row\'s title is clipped at two lines, at the line\'s foot, never given an ellipsis; a sheet taller than the screen scrolls up and down inside itself, never sideways (the CSS; the browser check is in the pull request)', () => {
  const css = readFileSync(new URL('../../src/public/sandbox.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (sel) => {
    const m = new RegExp(`(?:^|\\n)${sel.replace(/[.]/g, '\\.')} \\{([^}]*)\\}`).exec(css);
    assert.ok(m, `${sel} has its rule`);
    return m[1];
  };
  assert.match(rule('.v2-dt'), /font: 400 12px\/1\.33 var\(--font\);[^}]*max-height: calc\(2 \* 1\.33em\); overflow: hidden; overflow: clip;/);
  assert.match(rule('.v2-t'), /font: 500 12px\/1\.33 var\(--font\);[^}]*max-height: calc\(3 \* 1\.33em\); overflow: hidden; overflow: clip;/, 'a card\'s title at three');
  assert.match(rule('.v2-sheet'), /max-height: calc\(100% - 56px\); overflow-y: auto; overflow-x: hidden;/);
  assert.doesNotMatch(css, /line-clamp|text-overflow:\s*ellipsis/);
});
