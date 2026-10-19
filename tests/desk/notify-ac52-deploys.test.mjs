// ac-test: S-001/AC52 (from 2026-10-18, the deploys answer, Terms): a waiting deploy in a project J7
// marks `deploysNeedOwner` counts as needing the owner: in its group's count, the pill, Home's top
// line, and it stops "Quiet"; one in a project without it is shown and not counted. In both views.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixture, CONFIG } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadApp } from './page-harness.mjs';
import { loadSandbox, byClass } from './sandbox-helpers.mjs';
import { buildModel } from '../../src/lib/model.js';
import { queueView, pillView } from '../../src/lib/sandbox.js';

const WAITING = { path: '.github/workflows/desk-deploy.yml', name: 'desk-deploy', status: 'waiting', conclusion: null, id: 7001, run_number: 40 };
function repos(waitingIn = 'Service-Desk') {
  const runs = (name) => [{ name: 'governance', status: 'completed', conclusion: 'success' }, ...(name === waitingIn ? [WAITING] : [])];
  return {
    'Service-Desk': repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml') }, [], runs('Service-Desk')),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], runs('Personal-Org-Operating-Model')),
  };
}

test('AC52 (2026-10-18): in the accepted view a waiting deploy in Service-Desk (deploysNeedOwner) is counted and stops Quiet, with its run link', async () => {
  const app = await loadApp({ repos: repos() });
  try {
    await app.advance(1000);
    assert.equal(app.state().textContent, '1 waiting on you');
    assert.match(app.els.view.textContent, /desk-deploy: waiting for your approval/);
  } finally {
    app.restore();
  }
});

test('AC52 (2026-10-18): a waiting run in a project not marked deploysNeedOwner is not counted: Quiet', async () => {
  const app = await loadApp({ repos: repos('Personal-Org-Operating-Model') });
  try {
    await app.advance(1000);
    assert.equal(app.state().textContent, 'Quiet');
  } finally {
    app.restore();
  }
});

test('AC52 (2026-10-18): the queue: counted in the Deploys group, the pill and the waiting count where marked; shown, not counted, where not', () => {
  const runs = JSON.stringify({ workflow_runs: [{ ...WAITING, html_url: 'https://github.com/x/actions/runs/7001', head_sha: 'a'.repeat(40) }] });
  const model = (project) => buildModel({ project, config: CONFIG, tree: new Map(), records: new Map(), history: new Map(), pullPages: [], checkPages: [runs, '{"workflow_runs":[]}'],
    checksState: 'ok', now: new Date('2026-10-18T12:00:00Z'), withdrawn: [] });
  const sd = CONFIG.projects[0];
  const m = model(sd);
  assert.deepEqual(m.flagged.map((f) => [f.kind, f.key]), [['deploy', 'deploy:.github/workflows/desk-deploy.yml:40']]);
  const q = queueView(sd, m, { checkPages: [runs] }, Date.now());
  assert.equal(q.waiting, 1);
  assert.equal(q.groups.find((g) => g.key === 'deploys').count, 1);
  assert.equal(pillView({ read: { read: 'ok', since: Date.now() } }, q, Date.now()).text, '1 deploy to approve');
  const unmarked = { ...sd, deploysNeedOwner: false };
  const m2 = model(unmarked);
  assert.equal(m2.flagged.length, 0);
  const q2 = queueView(unmarked, m2, { checkPages: [runs] }, Date.now());
  assert.equal(q2.waiting, 0);
  assert.equal(q2.groups.find((g) => g.key === 'deploys').items.length, 1, 'shown');
});

test('AC52 (2026-10-18): in the sandbox, the Deploys group counted with "needs you", and Home\'s top line counts it', async () => {
  const app = await loadSandbox({ config: CONFIG, repos: repos(), hash: '#/p/Service-Desk/queue' });
  try {
    await app.advance(1000);
    await app.advance(60_000);
    const g = byClass(app.view, 'g-deploys').find((e) => e.tag === 'section');
    assert.ok(g.textContent.includes('needs you'));
    assert.ok(g.textContent.includes('Each waits for your approval on GitHub'));
    assert.ok(!g.textContent.includes('Shown, not counted'));
    await app.go('#/');
    assert.match(app.text(), /1 waiting on you in all/);
  } finally {
    app.restore();
  }
});
