// AC29: CI is read from the workflow runs of the default-branch head (J1's 3a and 3b), for every
// connected project, through the page's real scheduler and a fake desk function.
// ac-test: S-001/AC29
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { makeBox, orderBoxes, boxRank, boxStateText } from '../../src/lib/universe.js';
import { CI_CANT_READ } from '../../src/lib/model.js';
import { fakeClock, fixture, CONFIG } from './helpers.mjs';
import { repo, fakeServer } from './fake-desk.mjs';

const START = Date.parse('2026-10-08T15:00:00Z');
const GOV = '.github/workflows/governance.yml';

function setup(sdRuns, poomRuns, { forbidden = false } = {}) {
  const clock = fakeClock(START);
  const repos = {
    'Service-Desk': repo({
      'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
      'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
    }, [], sdRuns),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'),
      'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md') }, [], poomRuns),
  };
  if (forbidden) for (const r of Object.values(repos)) r.checksForbidden = true;
  const server = fakeServer(repos, CONFIG, clock);
  const desk = createDesk({ config: CONFIG, call: server.call, clock, store: createStore(null), isVisible: () => true });
  const boxes = () => CONFIG.projects.map((p) => makeBox(desk.model(p.name), desk.states.get(p.name), desk, clock.now()));
  return { clock, desk, boxes, server };
}

test('AC29: a head the Orchestrator made — governance as a dispatch run — shows its result; a failing one ranks the box third, unflagged', async () => {
  const s = setup([
    { path: GOV, event: 'workflow_dispatch', status: 'completed', conclusion: 'failure', run_number: 293 },
    { path: '.github/workflows/orchestrator.yml', event: 'workflow_dispatch', status: 'completed', conclusion: 'success', run_number: 189 },
  ], [{ path: '.github/workflows/ci.yml', event: 'push', status: 'completed', conclusion: 'success', run_number: 1 }]);
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  const [sd, poom] = s.boxes();
  assert.equal(sd.ci, 'failing');
  assert.equal(sd.flaggedCount, 0, 'a failing default branch is not a flag');
  assert.equal(boxRank(sd), 2);
  assert.equal(poom.ci, 'passing');
  assert.equal(orderBoxes(s.boxes())[0].name, 'Service-Desk', 'failing ranks above the rest');
  assert.ok(sd.model.activity.some((a) => a.text === 'Orchestrator run: success'), 'the Orchestrator run is activity');
  // The function was asked for both lists for every project.
  const poll = s.server.calls.find((c) => c.path === '/api/poll');
  assert.ok(poll);
  assert.ok(s.desk.states.get('Service-Desk').checkUrls.some((u) => u.includes('event=workflow_dispatch')));
  assert.ok(s.desk.states.get('Personal-Org-Operating-Model').checkUrls.some((u) => u.includes('event=push')));
});

test('AC29: without Actions: read (a 403 on workflow runs) CI says so and every project stays readable', async () => {
  const s = setup([{ path: GOV, status: 'completed', conclusion: 'success' }], [], { forbidden: true });
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  for (const b of s.boxes()) {
    assert.equal(b.ci, CI_CANT_READ);
    assert.equal(b.ci, "can't read CI (the read token needs Actions: read)");
    assert.equal(b.read.read, 'ok', `${b.name} is read`);
    assert.equal(boxStateText(b, CONFIG.ownerTimeZone), 'quiet');
  }
});

test('AC29: desk-deploy runs are activity (waiting for approval), never CI; push and dispatch runs are read together', async () => {
  const s = setup([
    { path: '.github/workflows/desk-deploy.yml', event: 'push', status: 'waiting', conclusion: null, run_number: 4 },
    { path: GOV, event: 'push', status: 'completed', conclusion: 'success', run_number: 300 },
    { path: '.github/workflows/desk-build.yml', event: 'push', status: 'in_progress', conclusion: null, run_number: 12 },
  ], []);
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  const sd = s.boxes()[0];
  assert.equal(sd.ci, 'running', 'desk-build still running; the waiting deploy is not counted');
  assert.ok(sd.model.activity.some((a) => /^deploy [0-9a-f]{7}: waiting for approval$/.test(a.text)));
  assert.equal(s.boxes()[1].ci, 'none', 'no runs on the head: none');
});
