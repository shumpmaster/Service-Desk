// The sender's entry point (spec S-001, J16; Workflow 3's step `node src/notify/run.mjs --project
// Service-Desk`): its arguments, its exit codes at the first step, and nothing printed but its own words.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SRC, CONFIG } from './helpers.mjs';

const RUN = join(SRC, 'notify', 'run.mjs');
const clean = { PATH: process.env.PATH, HOME: process.env.HOME };
const run = (args, env = {}, program = RUN) => spawnSync(process.execPath, [program, ...args], { env: { ...clean, ...env }, encoding: 'utf8', timeout: 30000 });

// A fixture: the sender's program beside a J7 with no `push` (the committed J7 holds the owner's key,
// Setup N1, CS18). run.mjs reads src/config/projects.json from beside itself, so the fixture is a copy of
// src/notify/ and src/lib/ with its own config/projects.json.
const scratch = [];
after(() => { for (const d of scratch) rmSync(d, { recursive: true, force: true }); });
function programWithConfig(config) {
  const d = mkdtempSync(join(tmpdir(), 'desk-notify-entry-'));
  scratch.push(d);
  for (const sub of ['notify', 'lib']) cpSync(join(SRC, sub), join(d, sub), { recursive: true });
  cpSync(join(SRC, 'package.json'), join(d, 'package.json'));
  mkdirSync(join(d, 'config'));
  writeFileSync(join(d, 'config', 'projects.json'), JSON.stringify(config));
  return join(d, 'notify', 'run.mjs');
}

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

test('J16: the entry point stops at its first step (exit 1) on the wrong repository, on J7 with no push key (a fixture), and, on the committed J7, at the first missing secret', () => {
  let r = run(['--project', 'Service-Desk'], { GITHUB_REPOSITORY: 'someone/else', GITHUB_EVENT_NAME: 'schedule' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /GITHUB_REPOSITORY is not this project's repository/);
  // A J7 with no `push` (a fixture; the committed one holds the owner's key, Setup N1, CS18).
  const { push: _committed, ...noPush } = CONFIG;
  r = run(['--project', 'Service-Desk'], { GITHUB_REPOSITORY: 'shumpmaster/Service-Desk', GITHUB_EVENT_NAME: 'schedule', GITHUB_TOKEN: 'made-up' },
    programWithConfig(noPush));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /stop: push in src\/config\/projects\.json is missing or not in form/);
  assert.equal(r.stderr, '');
  // The committed J7: push is in form, so the first step goes on to the secrets and names the first missing one.
  r = run(['--project', 'Service-Desk'], { GITHUB_REPOSITORY: 'shumpmaster/Service-Desk', GITHUB_EVENT_NAME: 'schedule', GITHUB_TOKEN: 'made-up' });
  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stdout, /push in src\/config\/projects\.json/);
  assert.match(r.stdout, /stop: the secret DESK_VAPID_PRIVATE_KEY is missing/);
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
