// ac-test: S-001/AC73 — what waits on the owner, kind by kind: J16's set step on Service-Desk's real
// records at ef8daf4 with made-up records for the kinds no record on main holds, against the desk's
// own flagged items for the same records; and a v2.5 project in poom/'s placeholder form.
// join-test: S-001/J16 (the set the sender builds equals the desk's, the budget guard, a failed read).

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { neededReads, buildModel, parseRecord } from '../../src/lib/model.js';
import { collect } from '../../src/notify/collect.mjs';
import { makeGitHub, BudgetStop } from '../../src/notify/gh.mjs';
import { FIX } from './helpers.mjs';
import { NOTIFY_FIX, REPO, T0, checkoutOf, filesUnder, makeWorld, pull, testConfig, makeVapid, cleanScratch, harness } from './notify-helpers.mjs';

after(cleanScratch);

const real = filesUnder(join(NOTIFY_FIX, 'sd-ef8daf4'));
const madeUp = filesUnder(join(NOTIFY_FIX, 'made-up'));
const m2 = {
  'queue/ci-hold-e2ab9c55e561.md': readFileSync(join(FIX, 'orchestrator-m2/queue/ci-hold-e2ab9c55e561.md')),
  'queue/Q-007-merge-by-hand.md': readFileSync(join(FIX, 'orchestrator-m2/queue/Q-007-merge-by-hand.md')),
};
const recorded = (name) => JSON.parse(JSON.parse(readFileSync(join(FIX, 'github', `${name}.json`), 'utf8')).body);
const recent = recorded('notify-pulls-recent');
const realPull = (n) => recent.find((p) => p.number === n);
const BASE_DATE = '2026-10-17T00:00:00+00:00';
const LATER_DATE = '2026-10-18T11:30:00+00:00';
const KEY_STATE = 'k'.repeat(64);
const sha = (c) => c.repeat(40);

function sdCheckout() {
  return checkoutOf({ base: real, baseDate: BASE_DATE, later: [{ files: { ...madeUp, ...m2 }, date: LATER_DATE }] });
}

/** The world for Service-Desk: real and made-up pull requests, checks, the job's runs and logs, a deploy. */
function sdWorld(head) {
  const w = makeWorld();
  const p107 = { ...realPull(107), state: 'open' };
  const p108 = { ...realPull(108), state: 'open' };
  w.pulls = [p107, p108,
    pull(960, { draft: true }), pull(961, { head: 'item/P-951' }),
    pull(962, { headRepo: 'someone/Service-Desk', association: 'NONE', login: 'someone', title: 'A stranger\'s words' }),
    pull(963, { sha: sha('3'), title: 'Record your made-up answer' }), pull(964, { sha: sha('4') }), pull(965, { sha: sha('5') })];
  w.files[107] = recorded('notify-pull-107-files');
  w.files[108] = recorded('notify-pull-108-files');
  w.files[961] = [{ filename: 'src/x.js', status: 'added' }];
  w.files[963] = [{ filename: 'decisions/questions/N-recorded.md', status: 'added' }, { filename: 'questions/N-recorded.md', status: 'removed' }];
  w.files[964] = recorded('notify-pull-84-files');
  w.files[965] = recorded('notify-pull-84-files');
  const build = (id, status, conclusion, completed) => ({ id, name: 'build', status, conclusion, completed_at: completed, check_suite: { id: 10 } });
  const wruns = [{ check_suite_id: 10, path: '.github/workflows/desk-build.yml' }];
  w.checks[p107.head.sha] = { checkRuns: [build(1, 'in_progress', null, null)], workflowRuns: wruns, statuses: [] };
  w.checks[sha('3')] = { checkRuns: [build(2, 'completed', 'success', '2026-10-18T11:40:00Z')], workflowRuns: wruns, statuses: [] };
  w.checks[sha('4')] = { checkRuns: [build(3, 'completed', 'failure', '2026-10-18T11:40:00Z')], workflowRuns: wruns, statuses: [] };
  w.checks[sha('5')] = { checkRuns: [], workflowRuns: [], statuses: [] };
  w.commits[sha('5')] = '2026-10-18T11:55:00Z';
  w.asksRuns = [{ id: 501, event: 'workflow_run', run_started_at: '2026-10-18T11:41:00Z' }];
  w.jobs[501] = [{ id: 601, name: 'merge', status: 'completed', conclusion: 'success' }];
  w.logs[601] = '2026-10-18T11:41:05.1234567Z NOTE: the asks-merge grant is L-0017\n'
    + '2026-10-18T11:41:05.2234567Z PR #963: waits: decisions/questions/N-recorded.md: a notes or Critic record, which waits for the owner\n';
  // The default branch's head: governance failed, so the hold card is open (J2's rule).
  w.headRuns = { push: [{ path: '.github/workflows/governance.yml', name: 'governance', event: 'push', status: 'completed', conclusion: 'failure', run_number: 9, head_sha: head }],
    workflow_dispatch: [] };
  w.waiting = [{ id: 7001, status: 'waiting', display_title: 'deploy 1234567', head_sha: head },
    { id: 7002, status: 'waiting', display_title: 'deploy 89abcde', head_sha: sha('9') }];
  return w;
}

const expectedSd = [
  'Service-Desk|card|queue/P-951-stop-1.md',
  'Service-Desk|deploy|7001',
  'Service-Desk|deploy|7002',
  'Service-Desk|gate|queue/P-952-criteria-1.md',
  'Service-Desk|hold|queue/ci-hold-e2ab9c55e561.md',
  'Service-Desk|merge|queue/Q-007-merge-by-hand.md',
  'Service-Desk|missing-card|status/P-950.toml',
  'Service-Desk|pr|108',
  'Service-Desk|pr|962',
  'Service-Desk|pr|963',
  'Service-Desk|pr|964',
  'Service-Desk|question|questions/N-open.md',
];

/** The desk's page layer: the same files, read as J6 hands them to the page (no git), into buildModel. */
function deskModel(project, files, dates, pullPages, checkPages, compareMap) {
  const tree = new Map(Object.keys(files).map((p) => [p, { sha: `blob-${p}`, size: files[p].length }]));
  const records = new Map();
  const history = new Map();
  for (let i = 0; i < 4; i++) {
    const need = neededReads(project, tree, records, new Date(T0), { head: 'h', history, compare: compareMap });
    for (const b of need.blobs) if (!records.has(b.path)) records.set(b.path, parseRecord(b.kind, files[b.path].toString('utf8'), b.path));
    for (const p of need.history) if (!history.has(p)) history.set(p, { oldest: dates(p), newest: null });
  }
  return buildModel({ project, config: testConfig(makeVapid()), tree, records, history, pullPages, checkPages, checksState: 'ok', compare: compareMap,
    now: new Date(T0), withdrawn: [] });
}

/** Each desk flagged item's key, written out here from AC73's table (not from src/lib/waiting.js). */
function deskKey(name, f) {
  if (f.kind === 'card') return `${name}|${['dor', 'criteria', 'launch'].includes(f.card.gate) ? 'gate' : 'card'}|${f.card.path}`;
  if (f.kind === 'hold') return `${name}|hold|${f.hold.path}`;
  if (f.kind === 'merge') return `${name}|merge|${f.merge.path}`;
  if (f.kind === 'status-card') return `${name}|missing-card|status/${f.key.slice('status:'.length)}.toml`;
  if (f.kind === 'question') return `${name}|question|${f.question.path}`;
  if (f.kind === 'pr') return `${name}|pr|${f.pr.number}`;
  if (f.kind === 'deploy') return `${name}|deploy|${f.deploy.id}`;
  throw new Error(f.kind);
}

test('AC73, J16: the set from real records at ef8daf4 and made-up ones: each key and kind, and nothing not counted', async () => {
  const co = sdCheckout();
  const w = sdWorld(co.head);
  const config = testConfig(makeVapid());
  const project = config.projects[0];
  const gh = makeGitHub({ token: 't', fetch: w.fetch });
  const c = await collect({ project, config, checkout: co.open(), gh, nowMs: T0, stateKey: KEY_STATE, cand: {} });
  assert.equal(c.read, true, c.why);
  assert.deepEqual(c.set.map((x) => x.key), expectedSd);
  const kinds = Object.fromEntries(c.set.map((x) => [x.key, x.kind]));
  assert.equal(kinds['Service-Desk|gate|queue/P-952-criteria-1.md'], 'gate');
  assert.equal(c.set.find((x) => x.id === '962').outside, true);
  assert.equal(c.set.find((x) => x.id === '962').what, null);
  assert.equal(c.set.find((x) => x.id === '108').what, realPull(108).title);
  assert.equal(c.set.find((x) => x.kind === 'card').what, "A made-up decision for the sender's tests: what happens next?");
  assert.equal(c.set.find((x) => x.kind === 'deploy' && x.id === '7001').what, 'deploy 1234567');
  // Not counted: a draft, an item branch, the job's candidates it may still merge, a held question,
  // one being recorded, and every real card (all answered at ef8daf4).
  for (const k of ['Service-Desk|pr|960', 'Service-Desk|pr|961', 'Service-Desk|pr|107', 'Service-Desk|pr|965',
    'Service-Desk|question|questions/N-held.md', 'Service-Desk|question|questions/N-recorded.md', 'Service-Desk|card|queue/P-001-stop-6.md']) {
    assert.ok(!c.set.some((x) => x.key === k), k);
  }
  assert.deepEqual(c.counts, { waiting: expectedSd.length, held: 1, recording: 1, jobCandidates: 2 });
});

test('AC73, J16: the sender\'s set equals the desk\'s flagged items for the same records, less the job\'s candidates and AC77\'s questions', async () => {
  const co = sdCheckout();
  const w = sdWorld(co.head);
  // Every fixture deploy on the current head, so the desk's head-only list and the sender's agree.
  w.waiting = w.waiting.slice(0, 1);
  const config = testConfig(makeVapid());
  const project = config.projects[0];
  const c = await collect({ project, config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: KEY_STATE, cand: {} });
  const files = { ...real, ...madeUp, ...m2 };
  const dates = (p) => (Object.prototype.hasOwnProperty.call(real, p) && !Object.prototype.hasOwnProperty.call(madeUp, p) ? BASE_DATE : LATER_DATE);
  // From 2026-10-18 the desk counts AC52's Deploys itself: the waiting runs on the head, in J1's lists.
  const deployRuns = w.waiting.filter((r) => r.head_sha === co.head).map((r, i) => ({ ...r, path: '.github/workflows/desk-deploy.yml', name: 'desk-deploy',
    event: 'push', run_number: 40 + i }));
  const model = deskModel(project, files, dates, [JSON.stringify(w.pulls)],
    [JSON.stringify({ workflow_runs: [...w.headRuns.push, ...deployRuns] }), JSON.stringify({ workflow_runs: [] })], new Map([['1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d', 'failed']]));
  const desk = model.flagged.map((f) => deskKey(project.name, f));
  assert.ok(desk.includes('Service-Desk|deploy|7001'), 'the desk\'s own flagged items hold the deploy');
  const less = new Set(['Service-Desk|pr|107', 'Service-Desk|pr|965', 'Service-Desk|question|questions/N-held.md', 'Service-Desk|question|questions/N-recorded.md']);
  const expected = desk.filter((k) => !less.has(k)).sort();
  assert.deepEqual(c.set.map((x) => x.key), expected);
  assert.ok(less.size === [...less].filter((k) => desk.includes(k)).length, 'each left-out item is one the desk flags');
});

test('AC73: a deploy still waiting on an earlier head counts for the sender (the known difference from the desk\'s head-only list)', async () => {
  const co = sdCheckout();
  const w = sdWorld(co.head);
  w.waiting = [{ id: 7002, status: 'waiting', display_title: 'deploy 89abcde', head_sha: sha('9') }];
  const config = testConfig(makeVapid());
  const c = await collect({ project: config.projects[0], config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: KEY_STATE, cand: {} });
  assert.ok(c.set.some((x) => x.key === 'Service-Desk|deploy|7002'));
});

test('AC73: a waiting deploy counts in a project marked deploysNeedOwner and not in one without it', async () => {
  const co = sdCheckout();
  const w = sdWorld(co.head);
  const config = testConfig(makeVapid());
  const project = { ...config.projects[0], deploysNeedOwner: false };
  const c = await collect({ project, config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: KEY_STATE, cand: {} });
  assert.ok(!c.set.some((x) => x.kind === 'deploy'));
  assert.ok(!w.ghCalls.some((x) => x.path.includes('status=waiting')), 'no waiting-runs read without deploysNeedOwner');
  const unmarked = { ...config.projects[0] };
  delete unmarked.deploysNeedOwner;
  const c2 = await collect({ project: unmarked, config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: KEY_STATE, cand: {} });
  assert.ok(!c2.set.some((x) => x.kind === 'deploy'));
});

test('AC73: a v2.5 project in poom/\'s placeholder form: questions and pull requests only', async () => {
  const poom = filesUnder(join(FIX, 'poom'));
  const v25 = filesUnder(join(NOTIFY_FIX, 'poom-made-up'));
  const co = checkoutOf({ base: poom, baseDate: BASE_DATE, later: [{ files: v25, date: LATER_DATE }] });
  const w = makeWorld();
  const repo = 'shumpmaster/Personal-Org-Operating-Model';
  w.pulls = [pull(970, { headRepo: repo }), pull(971, { headRepo: repo })];
  w.files[970] = [{ filename: 'questions/N-v25-recorded.md', status: 'removed' }, { filename: 'docs/LEDGER.md', status: 'modified' }];
  w.files[971] = [{ filename: 'questions/N-another.md', status: 'added' }];
  w.waiting = [{ id: 7003, status: 'waiting', display_title: 'a run waiting' }];
  // The fake answers this project's paths as it answers Service-Desk's.
  const fetch2 = (url, init) => w.fetch(String(url).replace('/repos/shumpmaster/Personal-Org-Operating-Model/', `/repos/${REPO}/`), init);
  const config = testConfig(makeVapid());
  const project = config.projects[1];
  const c = await collect({ project, config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: fetch2 }), nowMs: T0, stateKey: KEY_STATE, cand: {} });
  assert.equal(c.read, true, c.why);
  assert.deepEqual(c.set.map((x) => x.key), [
    'Personal-Org-Operating-Model|pr|970',
    'Personal-Org-Operating-Model|pr|971',
    'Personal-Org-Operating-Model|question|questions/N-v25.md',
  ]);
  assert.deepEqual(c.counts, { waiting: 3, held: 1, recording: 1, jobCandidates: 0 });
  assert.ok(!w.ghCalls.some((x) => /asks-merge|check-runs|status=waiting/.test(x.path)), 'no job-candidate or deploy reads in a v2.5 project');
});

test('J16: a failed read makes the project "not read"; the budget guard stops at 299 remaining', async () => {
  const co = sdCheckout();
  const config = testConfig(makeVapid());
  for (const prefix of [`/repos/${REPO}/pulls?`, `/repos/${REPO}/pulls/108/files`, `/repos/${REPO}/actions/runs?status=waiting`, `/repos/${REPO}/commits/${sha('3')}/check-runs`]) {
    const w = sdWorld(co.head);
    w.fail[prefix] = 502;
    const c = await collect({ project: config.projects[0], config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: KEY_STATE, cand: {} });
    assert.equal(c.read, false, prefix);
  }
  // The budget guard: below 300 on the first answer, no further request.
  const w = sdWorld(co.head);
  w.remaining = '299';
  const gh = makeGitHub({ token: 't', fetch: w.fetch });
  await assert.rejects(collect({ project: config.projects[0], config, checkout: co.open(), gh, nowMs: T0, stateKey: KEY_STATE, cand: {} }), BudgetStop);
  assert.equal(w.ghCalls.length, 1);
  // 300 is enough.
  const w3 = sdWorld(co.head);
  w3.remaining = '300';
  const c3 = await collect({ project: config.projects[0], config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w3.fetch }), nowMs: T0, stateKey: KEY_STATE, cand: {} });
  assert.equal(c3.read, true);
});

test('J16: the budget stop in a whole run sends nothing and uploads no state', async () => {
  const h = harness({ checkout: sdCheckout() });
  h.world.remaining = '299';
  const r = await h.run();
  assert.equal(r.code, 0);
  assert.equal(r.pushes.length, 0);
  assert.equal(r.wrote, false);
  assert.equal(r.ghCalls.length, 1);
  assert.ok(r.logs.some((l) => /budget/.test(l)));
});
