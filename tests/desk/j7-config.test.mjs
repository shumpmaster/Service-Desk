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
import { CONFIG, J7_FILE, SRC, withUsage } from './helpers.mjs';

test('J7: the committed config holds the launch values and passes the build\'s check', () => {
  assert.deepEqual(validateConfig(CONFIG), []);
  // From stage 6b, helpers' CONFIG is J7 less its `portfolio` (6a's state); the committed file, with it, passes too.
  assert.deepEqual(validateConfig(J7_FILE), []);
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
  // Rewritten in stage 6b (J7's `portfolio`, specs/S-001.md:9515-9520): the generated config is the committed
  // file whole, its `portfolio` among it; helpers' CONFIG leaves the portfolio out for the cases before 6b.
  assert.deepEqual(GENERATED, J7_FILE, 'lib/config.js is generated from projects.json');
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

// From 2026-10-18 (notifications): `push`, `deploysNeedOwner` and `actionsUsage`, wrong kinds among them.
test('J7 (2026-10-18): deploysNeedOwner on Service-Desk only; actionsUsage as given, in Service-Desk\'s entry (draft 9); push holds the owner\'s public key (Setup N1, CS18) and the preview\'s address', () => {
  assert.deepEqual(CONFIG.projects.map((p) => [p.name, p.deploysNeedOwner === true]), [['Service-Desk', true], ['Personal-Org-Operating-Model', false]]);
  assert.equal('deploysNeedOwner' in CONFIG.projects[1], false, 'absent means false');
  assert.deepEqual(CONFIG.projects[0].actionsUsage, { account: 'shumpmaster', includedMinutes: 3000 });
  assert.equal('actionsUsage' in CONFIG, false, 'not at the top level');
  assert.equal('actionsUsage' in CONFIG.projects[1], false, 'Workflow 4\'s project holds none, so its sender reads no usage');
  assert.deepEqual(CONFIG.push, { vapidPublicKey: 'BFTM_IZawd-WOl_Mgf5RzLMAtGYwL7lIO9y9p2gVOQYwAjjIphr6q_TN4hiLCLasXYhdGhQqDHUuEyX40BMC8bM',
    deskUrl: 'https://service-desk-preview.pages.dev' }, 'J7\'s push, as the owner handed it over; the preview\'s address until launch (Setup N10)');
  assert.deepEqual(GENERATED.push, CONFIG.push, 'and in the generated config the function and the page read');
  // The no-push path, with a fixture config: a missing push alone builds; the desk says "Notifications aren't set up yet".
  const { push: _committed, ...noPush } = CONFIG;
  assert.equal(noPush.push, undefined);
  assert.deepEqual(validateConfig(noPush), [], 'a missing push alone builds; the desk says "Notifications aren\'t set up yet"');
});

test('J7 (2026-10-18): a wrong-kind deploysNeedOwner, actionsUsage or reported fails the build with a message; push missing builds, malformed fails', () => {
  const sd = CONFIG.projects[0];
  for (const v of ['yes', 1, null, 'true']) {
    const errs = validateConfig({ ...CONFIG, projects: [{ ...sd, deploysNeedOwner: v }, CONFIG.projects[1]] });
    assert.ok(errs.some((e) => e === 'projects[0].deploysNeedOwner must be true or false'), `${JSON.stringify(v)}: ${errs.join('; ')}`);
  }
  assert.deepEqual(validateConfig({ ...CONFIG, projects: [{ ...sd, deploysNeedOwner: false }, CONFIG.projects[1]] }), []);
  const au = (a) => validateConfig(withUsage(CONFIG, a));
  const at = 'projects[0].actionsUsage';
  assert.deepEqual(au({ account: 'shumpmaster', includedMinutes: 3000, reported: false }), []);
  assert.deepEqual(validateConfig(withUsage(CONFIG, undefined)), [], 'missing builds: the line reads "not set up yet"');
  assert.ok(au({ account: 'not a login!', includedMinutes: 3000 }).includes(`${at}.account must be a GitHub login`));
  for (const n of [0, -5, 2.5, '3000', null]) assert.ok(au({ account: 'shumpmaster', includedMinutes: n }).includes(`${at}.includedMinutes must be a whole number above 0`), String(n));
  for (const r of ['yes', 1, null]) assert.ok(au({ account: 'shumpmaster', includedMinutes: 3000, reported: r }).includes(`${at}.reported must be true or false`), String(r));
  assert.ok(au('yes').includes(`${at} must be { account, includedMinutes }`));
  // Draft 9 (Sec 5): the old top-level form, or two entries holding it, fails the build.
  const cfg = { account: 'shumpmaster', includedMinutes: 3000 };
  assert.ok(validateConfig({ ...withUsage(CONFIG, undefined), actionsUsage: cfg }).some((e) => /actionsUsage sits in the entry of the project/.test(e)));
  const two = withUsage(CONFIG, cfg);
  two.projects[1] = { ...two.projects[1], actionsUsage: cfg };
  assert.ok(validateConfig(two).some((e) => /only one project's entry may hold actionsUsage/.test(e)));
  assert.ok(validateConfig({ ...CONFIG, push: { vapidPublicKey: 'short', deskUrl: 'https://service-desk-preview.pages.dev' } }).some((e) => e.startsWith('push.vapidPublicKey')));
  // The build itself refuses one, with its message.
});

// From 2026-10-18 (Work ahead by milestones, draft 4): J7's `planning` rules. Plans, estimates and
// the later-work list live in one v3 project's tree, so the build allows one `"planning": true`, on
// a v3 entry; `planning: false` on a v2.5 entry is fine; a value not a boolean fails as before.
test('J7 (Work ahead): two planning entries fail; planning true on a v2.5 entry fails; "yes" fails; planning false on a v2.5 entry builds', () => {
  const [sd, poom] = CONFIG.projects;
  assert.equal(sd.planning, true);
  assert.equal(poom.planning, false);
  assert.deepEqual(validateConfig(CONFIG), [], 'the launch values: planning true on Service-Desk (v3), false on the v2.5 project');
  const two = validateConfig({ ...CONFIG, projects: [sd, { ...sd, name: 'Other', repo: 'shumpmaster/Other' }] });
  assert.ok(two.some((e) => e.includes('only one project may hold "planning": true')), two.join('; '));
  const onV25 = validateConfig({ ...CONFIG, projects: [{ ...sd, planning: false }, { ...poom, planning: true }] });
  assert.ok(onV25.some((e) => e.includes('planning is true on a v2.5 project')), onV25.join('; '));
  const yes = validateConfig({ ...CONFIG, projects: [{ ...sd, planning: 'yes' }, poom] });
  assert.ok(yes.length >= 1 && yes.some((e) => e.includes('planning')), yes.join('; '));
  assert.deepEqual(validateConfig({ ...CONFIG, projects: [sd, { ...poom, planning: false }] }), []);
  assert.deepEqual(validateConfig({ ...CONFIG, projects: [{ ...sd, planning: false }, poom] }), [], 'no planning entry builds: Work ahead says it can\'t record plans');
});
