// AC49, as trial-view note 11 changed it (2026-10-15): the running log's branch drawing, on every
// member's page, read back from the shapes the page drew.
// ac-test: S-001/AC49
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, j11Files, SD3, openIdle } from './sandbox-helpers.mjs';
import { NOW, twoProjects } from './sandbox-fixtures.mjs';
import { branchLayout } from '../../src/lib/sandbox.js';

import { checkDrawing } from './branch-check.mjs';

test('AC49 (note 11): every member\'s running log in the roster fixture, the Chief of Staff\'s included, is drawn as the agreed screen 3 draws it', async () => {
  const config = { ...CONFIG, projects: [SD3] };
  const app = await loadSandbox({ config, repos: { 'Service-Desk': repo(j11Files()) }, hash: '#/p/Service-Desk/team', now: NOW });
  try {
    await app.advance(1000);
    // AC67 (2026-10-16): each card is a box whose name links to the member's page; from stage 4 of "After MD3" (AC67,
    // changed, specs/S-001.md:6093-6105) the idle members' cards are behind "<n> idle ›", opened here.
    await openIdle(app);
    const ids = byClass(app.view, 'sb-tile-n').map((t) => t.attrs.href.split('/').pop());
    assert.ok(ids.includes('chief-of-staff') && ids.includes('researcher') && ids.includes('orchestrator'), ids.join(' '));
    let lanes = 0;
    let drawn = 0;
    for (const id of ['owner', ...ids]) {
      await app.go(`#/p/Service-Desk/team/${id}`);
      const branch = byClass(app.view, 'sb-branch')[0];
      if (id === 'chief-of-staff') {
        // From 2026-10-17 (J13): no session file in this fixture, so no log yet; J13's own test draws its lanes.
        assert.equal(branch, undefined, 'the Chief of Staff has no session file here, so no log');
        assert.match(app.text(), /No session recorded yet/);
        continue;
      }
      if (!branch) continue;
      drawn++;
      const rows = byClass(branch, 'sb-brow').map((li) => byClass(li, 'sb-brow-lane')[0].textContent).map((t) => (t === 'project' ? null : t));
      lanes += checkDrawing(id, branch, rows);
    }
    assert.ok(drawn >= 4, `${drawn} members drawn`);
    assert.ok(lanes >= 10, `${lanes} lanes checked`);
  } finally {
    app.restore();
  }
});

test('AC49 (note 11): the layout\'s rules on small cases — fork at the oldest row, join where filed, a stub otherwise, from the edge when open at the oldest row, places never shared at once', () => {
  const log = (lanes) => lanes.map((lane) => ({ lane }));
  // Newest first: B opens and is filed while A is open; A is open at the oldest row shown.
  const L = branchLayout(log(['A', 'B', 'B', 'A', null, 'A']), (lane) => lane === 'B');
  const A = L.lanes.find((l) => l.id === 'A');
  const B = L.lanes.find((l) => l.id === 'B');
  assert.deepEqual([A.top, A.bottom, A.edge, A.fork, A.join, A.stub], [0, 5, true, false, null, true]);
  assert.deepEqual([B.top, B.bottom, B.edge, B.fork, B.join, B.stub], [1, 2, false, true, 1, false]);
  assert.notEqual(A.slot, B.slot, 'open at once: different places');
  assert.equal(L.dots[4].slot, 0, 'a row with no lane sits on the main line');
  // Lanes that never overlap may share a place, with a row between them.
  const L2 = branchLayout(log(['C', 'C', null, 'D', 'D', null]), () => true);
  assert.equal(L2.lanes.find((l) => l.id === 'C').slot, L2.lanes.find((l) => l.id === 'D').slot);
  const L3 = branchLayout(log(['C', 'D', 'D', 'E']), () => false);
  const at = (id) => L3.lanes.find((l) => l.id === id).slot;
  assert.notEqual(at('C'), at('D'), 'next to each other without a row between: different places');
  assert.notEqual(at('D'), at('E'));
});

test('AC49: the Team member pages of the sandbox fixture still draw without error, the log rows opening their sheets', async () => {
  const app = await loadSandbox({ ...twoProjects(), hash: '#/p/Alpha/team/builder', now: NOW });
  try {
    await app.advance(1000);
    const branch = byClass(app.view, 'sb-branch')[0];
    assert.ok(branch);
    const rows = byClass(branch, 'sb-brow').map((li) => byClass(li, 'sb-brow-lane')[0].textContent).map((t) => (t === 'project' ? null : t));
    checkDrawing('builder', branch, rows);
    assert.ok(findAll(branch, (e) => e.tag === 'a').some((a) => /\/team\/builder\/now$/.test(a.attrs.href)), 'the "now" row opens Working now');
  } finally {
    app.restore();
  }
});

// Added in G4 of "After the glance audit" (AC49's note "After the glance audit": "a team member's page writes a date from
// an earlier day "14 Oct, 09:40", not J9's "Oct 14 09:40", and a time from today "09:30" as now (AC91 (l)); the Team
// screen's cards keep J9's form"). Service-Desk's dispatch log at 3117150 (real), with one made-up outcome line for the
// Definer 30 minutes before NOW (NOT a real record), so its page holds a time from today beside its earlier days'.
test('AC49 (AC91 (l), added in G4): a member\'s page writes an earlier day\'s date "6 Oct, 11:40" and today\'s time "09:30" alone, never J9\'s "Oct 6 11:40"; the Team screen\'s cards keep their form', async () => {
  const files = j11Files();
  const LOG = 'dispatch-log/2026-10.jsonl';
  const made = { item: 'P-001', record: 'docs/reports/P-001-definer.md', result: 'ok', role: 'definer', session: 'P-001:made-up-for-G4',
    time: new Date(NOW - 30 * 60e3).toISOString().replace(/\.\d+Z$/, 'Z'), trigger: 'outcome', verdict: 'none' };
  files[LOG] = `${files[LOG].trimEnd()}\n${JSON.stringify(made)}\n`;
  const J9_FORM = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2} \d\d:\d\d\b/;
  const app = await loadSandbox({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': repo(files) }, hash: '#/p/Service-Desk/team/definer', now: NOW });
  try {
    await app.advance(1000);
    const page = app.text();
    assert.ok(page.includes('P-001: definer finished — ok, 09:30'), 'today: "09:30" alone, as now');
    assert.ok(page.includes('P-001: definer finished — ok, 6 Oct, 11:40'), 'an earlier day: "6 Oct, 11:40"');
    assert.ok(page.includes('P-001: definer started (Define), 5 Oct, 12:20'));
    assert.doesNotMatch(page, J9_FORM, 'never J9\'s "Oct 6 11:40" on the page');
    const rows = byClass(byClass(app.view, 'sb-branch')[0], 'sb-brow-t').map((r) => r.textContent);
    assert.equal(rows[0], 'P-001: definer finished — ok, 09:30', 'the running log\'s newest row');
    assert.equal(rows[1], 'P-001: definer finished — ok, 6 Oct, 11:40');
    // The owner's page: its groups' latest lines and its log, the Rulings group's latest among them.
    await app.go('#/p/Service-Desk/team/owner');
    assert.doesNotMatch(app.text(), J9_FORM);
    assert.match(app.text(), /\b\d{1,2} Oct, \d\d:\d\d\b/);
    // The Team screen's cards keep their form (AC91 (l): "the Team screen's cards keep J9's form"), AC67's day words as built.
    await app.go('#/p/Service-Desk/team');
    await openIdle(app);
    assert.ok(app.text().includes('last: P-001: definer finished — ok, 14 Oct'), 'the card\'s last work, its day as built');
    assert.ok(app.text().includes('last: Q-013 done, 8 Oct'));
  } finally {
    app.restore();
  }
});
