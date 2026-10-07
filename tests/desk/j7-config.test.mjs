// join-test: S-001/J7 — src/config/projects.json → function and page: the launch values, the
// build's checks (6 entries, an unknown model), and that the function and the page read the same
// generated config.
// ac-test: S-001/AC15 — what the Builder's side of the first deploy needs: the deploy reads only
// src/wrangler.toml's three keys, src/package.json has no dependencies or lifecycle scripts, and
// everything served is committed (the deploy job runs no build).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateConfig, MAX_PROJECTS } from '../../src/lib/configcheck.js';
import GENERATED from '../../src/lib/config.js';
import { CONFIG, SRC } from './helpers.mjs';

test('J7: the committed config holds the launch values and passes the build\'s check', () => {
  assert.deepEqual(validateConfig(CONFIG), []);
  assert.equal(CONFIG.ownerLogin, 'shumpmaster');
  assert.equal(CONFIG.ownerTimeZone, 'America/Chicago');
  assert.deepEqual(CONFIG.v5Clock, { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], from: '07:00', to: '22:00' });
  assert.equal(CONFIG.linkCap, 6000);
  assert.deepEqual(CONFIG.projects.map((p) => [p.name, p.repo, p.defaultBranch, p.model, p.planning]), [
    ['Service-Desk', 'shumpmaster/Service-Desk', 'main', 'v3', true],
    ['Personal-Org-Operating-Model', 'shumpmaster/Personal-Org-Operating-Model', 'main', 'v2.5', false]]);
  for (const p of CONFIG.projects) {
    assert.equal(p.webCommitsToDefault, true);
    assert.equal(p.contentPrefill, true);
    assert.equal(p.contentParam, 'value');
  }
  assert.deepEqual(GENERATED, CONFIG, 'lib/config.js is generated from projects.json');
});

test('J7: a 6th entry fails with a message saying 5 is the limit; a model other than v3 or v2.5 fails', () => {
  const six = { ...CONFIG, projects: Array.from({ length: 6 }, (_, i) => ({ ...CONFIG.projects[0], name: `P${i}` })) };
  const errs = validateConfig(six);
  assert.equal(MAX_PROJECTS, 5);
  assert.ok(errs.some((e) => e.includes('5 is the limit')), errs.join('; '));
  const badModel = { ...CONFIG, projects: [{ ...CONFIG.projects[0], model: 'v4' }] };
  assert.ok(validateConfig(badModel).some((e) => e.includes('model must be "v3" or "v2.5"')));
  assert.ok(validateConfig({ ...CONFIG, v5Clock: null }).length === 0, 'v5Clock null turns the clock off');
  assert.ok(validateConfig({ ...CONFIG, ownerTimeZone: 'Mars/Olympus' }).length === 1);
  assert.ok(validateConfig({ ...CONFIG, projects: [CONFIG.projects[0], CONFIG.projects[0]] }).some((e) => e.includes('used twice')));
});

test('J7: the build passes on the committed tree (config valid, generated files in step, imports inside src/)', () => {
  const r = spawnSync(process.execPath, [join(SRC, 'tools', 'build.mjs')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /build: PASS/);
});

test('J7: the page\'s copies under public/lib/ are byte-identical to lib/', () => {
  for (const f of readdirSync(join(SRC, 'public', 'lib'))) {
    assert.equal(readFileSync(join(SRC, 'public', 'lib', f), 'utf8'), readFileSync(join(SRC, 'lib', f), 'utf8'), f);
  }
});

test('AC15: wrangler.toml holds only name, pages_build_output_dir = "public" and compatibility_date', () => {
  const toml = readFileSync(join(SRC, 'wrangler.toml'), 'utf8');
  const keys = toml.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).map((l) => l.split('=')[0].trim());
  assert.deepEqual(keys.sort(), ['compatibility_date', 'name', 'pages_build_output_dir']);
  assert.match(toml, /^name = "service-desk-preview"$/m);
  assert.match(toml, /^pages_build_output_dir = "public"$/m);
});

test('AC15: package.json has no dependency block or lifecycle script, wrangler pinned to 4.148.0, and the build and test scripts', () => {
  const pkg = JSON.parse(readFileSync(join(SRC, 'package.json'), 'utf8'));
  for (const b of ['dependencies', 'optionalDependencies', 'peerDependencies', 'bundleDependencies', 'bundledDependencies']) {
    assert.ok(!(b in pkg), b);
  }
  for (const s of ['preinstall', 'install', 'postinstall', 'preprepare', 'prepare', 'postprepare', 'prepack', 'postpack',
    'prepublish', 'prepublishOnly', 'publish', 'postpublish']) assert.ok(!(s in pkg.scripts), s);
  assert.deepEqual(pkg.devDependencies, { wrangler: '4.148.0' });
  assert.equal(pkg.scripts.test, 'node --test ../tests/desk/');
  assert.ok(pkg.scripts.build);
  const lock = JSON.parse(readFileSync(join(SRC, 'package-lock.json'), 'utf8'));
  assert.equal(lock.packages['node_modules/wrangler'].version, '4.148.0');
  for (const [name, p] of Object.entries(lock.packages)) {
    if (p.resolved) assert.ok(p.resolved.startsWith('https://registry.npmjs.org/'), name);
  }
});
