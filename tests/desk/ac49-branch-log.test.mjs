// AC49, as trial-view note 11 changed it (2026-10-15): the running log's branch drawing, on every
// member's page, read back from the shapes the page drew.
// ac-test: S-001/AC49
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, j11Files, SD3 } from './sandbox-helpers.mjs';
import { NOW, twoProjects } from './sandbox-fixtures.mjs';
import { branchLayout } from '../../src/lib/sandbox.js';

import { checkDrawing } from './branch-check.mjs';

test('AC49 (note 11): every member\'s running log in the roster fixture, the Chief of Staff\'s included, is drawn as the agreed screen 3 draws it', async () => {
  const config = { ...CONFIG, projects: [SD3] };
  const app = await loadSandbox({ config, repos: { 'Service-Desk': repo(j11Files()) }, hash: '#/p/Service-Desk/team', now: NOW });
  try {
    await app.advance(1000);
    // AC67 (2026-10-16): each card is a box whose name links to the member's page.
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
