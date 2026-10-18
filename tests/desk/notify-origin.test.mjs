// The program's part of Workflow 3's gates (spec S-001, Workflow 3, J16): the origin gate's second
// signal, read through REST before any secret's value is read; and a requested deploy waited for,
// every 15 seconds for up to 2 minutes, until it turns `waiting` (AC74's "a deploy").

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { REPO, checkoutOf, harness, cleanScratch } from './notify-helpers.mjs';

after(cleanScratch);

const co = () => checkoutOf({ base: { 'questions/_TEMPLATE.md': '#\n' } });
const run = (id, o = {}) => ({ id, path: o.path || '.github/workflows/governance.yml', status: o.status || 'completed', event: 'pull_request',
  repository: { full_name: REPO }, head_repository: { full_name: o.headRepo || REPO } });

test('Workflow 3: a workflow_run from a fork, or one the program cannot read, does nothing; a same-repository one runs', async () => {
  const h = harness({ checkout: co() });
  h.world.runs[11] = run(11, { headRepo: 'someone/Service-Desk' });
  let r = await h.run({ event: 'workflow_run', env: { DESK_NOTIFY_RUN_ID: '11' } });
  assert.equal(r.code, 0);
  assert.equal(r.pushes.length, 0);
  assert.equal(r.wrote, false);
  assert.deepEqual(r.ghCalls.map((c) => c.path), [`/repos/${REPO}/actions/runs/11`]);
  assert.ok(r.logs.some((l) => /not from this repository; nothing done/.test(l)));
  // Unreadable: nothing either; and a malformed id never reaches a URL.
  r = await h.run({ event: 'workflow_run', env: { DESK_NOTIFY_RUN_ID: '12' } });
  assert.equal(r.wrote, false);
  r = await h.run({ event: 'workflow_run', env: { DESK_NOTIFY_RUN_ID: '1/../../x' } });
  assert.equal(r.ghCalls.length, 0);
  // Its own: the run goes on (the bootstrap summary).
  h.world.runs[13] = run(13);
  r = await h.run({ event: 'workflow_run', env: { DESK_NOTIFY_RUN_ID: '13' } });
  assert.equal(r.wrote, true);
  assert.equal(r.pushes.length, 1);
});

test('Workflow 3: the origin check comes before any secret is read: a fork\'s run with a malformed secret still exits 0, doing nothing', async () => {
  const h = harness({ checkout: co() });
  h.world.runs[21] = run(21, { headRepo: 'someone/Service-Desk' });
  h.env.DESK_VAPID_PRIVATE_KEY = 'not a key';
  const r = await h.run({ event: 'workflow_run', env: { DESK_NOTIFY_RUN_ID: '21' } });
  assert.equal(r.code, 0);
  assert.ok(!r.logs.some((l) => /DESK_VAPID_PRIVATE_KEY/.test(l)));
});

test('AC74, J16: a requested deploy: read again every 15 seconds for up to 2 minutes, then notified once waiting', async () => {
  const h = harness({ checkout: co() });
  await h.run();
  h.world.runs[31] = run(31, { path: '.github/workflows/desk-deploy.yml', status: 'queued' });
  let reads = 0;
  const route = h.world.fetch;
  h.world.fetch = async (url, init) => {
    if (String(url).endsWith(`/actions/runs/31`) && ++reads === 4) {
      h.world.runs[31].status = 'waiting';
      h.world.waiting = [{ id: 31, status: 'waiting', display_title: 'deploy 1234567' }];
    }
    return route(url, init);
  };
  h.clock.sleeps.length = 0;
  const r = await h.run({ event: 'workflow_run', env: { DESK_NOTIFY_RUN_ID: '31' } });
  assert.deepEqual(h.clock.sleeps, [15000, 15000]);
  assert.equal(r.payloads[0].notification.body, 'Waits on you: a deploy to approve: deploy 1234567');
  // Still queued after 2 minutes: the run goes on without it; the next run finds it.
  h.world.runs[32] = run(32, { path: '.github/workflows/desk-deploy.yml', status: 'queued' });
  h.clock.sleeps.length = 0;
  const r2 = await h.run({ event: 'workflow_run', env: { DESK_NOTIFY_RUN_ID: '32' } });
  assert.equal(h.clock.sleeps.reduce((a, b) => a + b, 0), 120000);
  assert.equal(r2.code, 0);
});
