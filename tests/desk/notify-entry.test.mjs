// The sender's entry point (spec S-001, J16; Workflow 3's step `node src/notify/run.mjs --project
// Service-Desk`): its arguments, its exit codes at the first step, and nothing printed but its own words.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';

const RUN = join(SRC, 'notify', 'run.mjs');
const clean = { PATH: process.env.PATH, HOME: process.env.HOME };
const run = (args, env = {}) => spawnSync(process.execPath, [RUN, ...args], { env: { ...clean, ...env }, encoding: 'utf8', timeout: 30000 });

test('J16: the entry point: a usage line and exit 1 without --project, or with an unknown one', () => {
  let r = run([]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /^usage: node src\/notify\/run\.mjs --project <name>/);
  r = run(['--project']);
  assert.equal(r.status, 1);
  r = run(['--project', 'Nowhere']);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /--project names no entry/);
  r = run(['--project', 'Service-Desk', '--colour']);
  assert.equal(r.status, 1);
});

test('J16: the entry point stops at its first step (exit 1) on the wrong repository, and on J7 with no push key yet', () => {
  let r = run(['--project', 'Service-Desk'], { GITHUB_REPOSITORY: 'someone/else', GITHUB_EVENT_NAME: 'schedule' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /GITHUB_REPOSITORY is not this project's repository/);
  // src/config/projects.json has no `push` until the brief's step 3 (the owner's key, Setup N1).
  r = run(['--project', 'Service-Desk'], { GITHUB_REPOSITORY: 'shumpmaster/Service-Desk', GITHUB_EVENT_NAME: 'schedule', GITHUB_TOKEN: 'made-up' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /stop: push in src\/config\/projects\.json is missing or not in form/);
  assert.equal(r.stderr, '');
  // A workflow_run event with no run id: nothing done, exit 0, before any secret is read.
  r = run(['--project', 'Service-Desk'], { GITHUB_REPOSITORY: 'shumpmaster/Service-Desk', GITHUB_EVENT_NAME: 'workflow_run', GITHUB_TOKEN: 'made-up' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /no triggering run id \(DESK_NOTIFY_RUN_ID\); nothing done/);
});

test('J16: an internal error exits 2 and prints only its kind and where it was thrown, never its message', () => {
  const preload = join(SRC, '..', 'tests', 'desk', 'tools', 'notify-throw-preload.mjs');
  const r = spawnSync(process.execPath, ['--import', preload, RUN, '--project', 'Service-Desk'],
    { env: { ...clean, GITHUB_REPOSITORY: 'shumpmaster/Service-Desk', GITHUB_EVENT_NAME: 'schedule' }, encoding: 'utf8', timeout: 30000 });
  assert.equal(r.status, 2);
  assert.match(r.stdout, /^desk-notify: internal error \(TypeError\)/);
  assert.match(r.stdout, /src\/notify\/run\.mjs/, 'where it was thrown');
  assert.doesNotMatch(r.stdout + r.stderr, /DESK_SECRET_LOOKALIKE|made-up message/, 'never its message');
  assert.equal(r.stdout.trim().split('\n').length, 1, 'one line');
});
