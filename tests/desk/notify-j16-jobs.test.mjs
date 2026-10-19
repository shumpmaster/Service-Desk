// join-test: S-001/J16 — the asks-merge job's candidates: the four kinds by path against the model's
// `classify`; rule (b)'s reading of the job's log against the model's own `run` (each of its waits
// reasons, written into a log in GitHub's form); one real asks-merge job log; a retried reason that
// lasts; rules (a) to (d) on made-up runs, jobs, logs and statuses; `find_grant`'s verdicts; (draft
// 7) the candidate's lists read to 10 pages, the job's own cap; and (2026-10-19, AC79) the judgment and
// the ledger's form check imported from src/lib/, judging runs on the default branch only: an
// asks-merge run from `workflow_dispatch` on a branch, its `PR #` and grant lines ignored by the sender,
// the same run on the default branch counted.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { jobKindsByPath, splitChanges } from '../../src/lib/prfiles.js';
import { logVerdict, logLines, reasonKind, judgeCandidate, latestChecks, isJudgingRun, logWellFormed } from '../../src/lib/jobcand.js';
import { findGrant } from '../../src/notify/grant.mjs';
import { openCheckout } from '../../src/notify/checkout.mjs';
import { collect, CANDIDATE_MAX_PAGES } from '../../src/notify/collect.mjs';
import { makeGitHub } from '../../src/notify/gh.mjs';
import { FIX } from './helpers.mjs';
import { NOTIFY_FIX, T0, MIN, buildRepo, checkoutOf, filesUnder, makeWorld, pull, testConfig, makeVapid, cleanScratch } from './notify-helpers.mjs';

after(cleanScratch);

const oracle = (name) => JSON.parse(readFileSync(join(NOTIFY_FIX, name), 'utf8'));
const REAL_LOG = readFileSync(join(FIX, 'github', 'asks-merge-job-117691950060-excerpt.log'), 'utf8');

test('J16: the four kinds by path, against the model\'s classify: every diff classify passes is a candidate', () => {
  const { cases } = oracle('model-classify.json');
  const js = {};
  for (const c of cases) {
    const cand = jobKindsByPath(c.changes);
    js[c.case] = cand;
    if (c.problems.length === 0) assert.equal(cand, true, `${c.case}: classify passes it, so it is a candidate`);
    if (!cand) assert.ok(c.problems.length > 0, `${c.case}: not a candidate by path, and classify reports a problem`);
  }
  assert.deepEqual(js, {
    filing: true, closing: true, 'session added': true, 'session lines added': true, tidying: true, 'filing and a session': true,
    code: false, 'filing and code': false, 'a question changed': false, 'the template': false,
    // By path only: the job's finer rule refuses it, and rule (b) then sees the job leave it.
    'an answer alone': true,
    'a question in a folder': false, 'a session file deleted': false, 'an answer named _x': false, 'a card': false,
    'a session file badly named': false, "a decision card's answer": false, empty: false,
  });
  // A rename is split as asks-merge splits it.
  assert.deepEqual(splitChanges([{ filename: 'questions/b.md', status: 'renamed', previous: 'questions/a.md' }]), [['D', 'questions/a.md'], ['A', 'questions/b.md']]);
  assert.equal(jobKindsByPath(splitChanges([{ filename: 'questions/b.md', status: 'copied' }])), false);
});

// Each waits reason the model's run printed, and what rule (b) makes of it (J16).
const KIND = {
  'head unreadable': 'retried', "a fork's branch": 'final', 'another base': 'final', 'no title': 'retried',
  'a trailer line in the description': 'final', 'the tip unreadable': 'retried', 'the compare unreadable': 'retried', '300 files': 'final',
  'commits not all listed': 'final', 'code in the diff': 'final', 'not text': 'retried', 'a file unreadable': 'retried',
  'could not be judged': 'retried', 'checks unreadable': 'retried', 'a check run unreadable': 'retried', 'no check run yet': 'transient',
  "only the Orchestrator's check": 'transient', 'a check running': 'transient', 'a check queued': 'transient', 'a check failed': 'final',
  "an app's check failed": 'final', 'a status pending': 'transient', 'a status failed': 'final', 'a status in error': 'final',
  'a status unreadable': 'retried', 'the grant withdrawn': 'final', 'GitHub refused the merge': 'retried',
};

test('J16: rule (b) reads the model\'s own run\'s lines, a timestamp before each, as leaving the pull request or not', () => {
  const { scenarios } = oracle('model-waits.json');
  let seen = 0;
  for (const s of scenarios) {
    const v = logVerdict(s.log, 7);
    for (const l of s.log.trimEnd().split('\n')) assert.match(l, /^\d{4}-\d\d-\d\dT[0-9:.]+Z /);
    if (s.merged) assert.deepEqual(v, { merged: true }, s.scenario);
    else if (s.reason == null) assert.equal(v, null, `${s.scenario}: a run that judged nothing`);
    else {
      assert.deepEqual(v, { waits: s.reason }, s.scenario);
      assert.ok(KIND[s.scenario], `${s.scenario} has an expected kind`);
      assert.equal(reasonKind(s.reason), KIND[s.scenario], `${s.scenario}: ${s.reason}`);
      seen++;
    }
    assert.equal(logVerdict(s.log, 8), null, 'another pull request\'s number finds nothing');
  }
  assert.equal(seen, Object.keys(KIND).length);
});

test('J16: the real asks-merge job log (job 117691950060): its PR line found, nothing else mistaken for one', () => {
  assert.deepEqual(logVerdict(REAL_LOG, 103), { waits: "check run 'build' (.github/workflows/desk-build.yml) is in_progress/None" });
  assert.equal(reasonKind(logVerdict(REAL_LOG, 103).waits), 'transient');
  for (const n of [1, 2, 7, 17, 102, 104, 2026, 117691950060]) assert.equal(logVerdict(REAL_LOG, n), null, String(n));
  const lines = logLines(REAL_LOG).filter(Boolean);
  assert.equal(lines.length, 13);
  assert.equal(lines.filter((l) => /^PR #/.test(l)).length, 1);
  assert.ok(lines.includes('NOTE: the asks-merge grant is L-0017'));
  // A made-up log built from the real one's form, a waits line added (NOT real): found.
  const madeUp = REAL_LOG.replace('2026-10-18T13:47:05.1494526Z Post job cleanup.',
    '2026-10-18T13:47:05.1300000Z PR #104: waits: its diff lists 300 files or more, more than the compare shows whole\n2026-10-18T13:47:05.1494526Z Post job cleanup.');
  assert.deepEqual(logVerdict(madeUp, 104), { waits: 'its diff lists 300 files or more, more than the compare shows whole' });
  assert.equal(reasonKind(logVerdict(madeUp, 104).waits), 'final');
  // A line with no timestamp: found.
  assert.deepEqual(logVerdict('PR #5: waits: GitHub refused the merge (HTTP 409)\n', 5), { waits: 'GitHub refused the merge (HTTP 409)' });
});

const SHA = 'c'.repeat(40);
const ok = (id, done = '2026-10-18T11:40:00Z', name = 'build') => ({ id, name, status: 'completed', conclusion: 'success', completed_at: done, check_suite: { id: 10 } });
const WR = [{ check_suite_id: 10, path: '.github/workflows/desk-build.yml' }, { check_suite_id: 11, path: '.github/workflows/orchestrator.yml' }];
const stamp = (line) => `2026-10-18T11:50:00.0000000Z ${line}\n`;

function input(o = {}) {
  const logs = o.logs || {};
  return { number: 7, checkRuns: o.checkRuns || [ok(1)], workflowRuns: WR, statuses: o.statuses || [], asksRuns: o.asksRuns || [],
    readJobs: async (id) => (o.jobs || {})[id] || [{ id: id + 100, name: 'merge', status: 'completed', conclusion: 'success' }],
    readLog: async (id) => (Object.prototype.hasOwnProperty.call(logs, id) ? logs[id] : null),
    headTime: async () => (o.headTime === undefined ? null : o.headTime), seenMs: o.seenMs ?? T0 - 10 * MIN, retriedMs: o.retriedMs ?? null, nowMs: o.nowMs ?? T0,
    defaultBranch: o.defaultBranch ?? 'main' };
}
// Real workflow_run and schedule runs report the default branch (Facts relied on, 2026-10-19).
const arun = (id, at, event = 'workflow_run', branch = 'main') => ({ id, event, run_started_at: at, head_branch: branch });

test('J16 (a): a counted check not success, or a counted status failed, leaves it at once; the Orchestrator\'s runs and owner-questions are not counted', async () => {
  assert.equal((await judgeCandidate(input({ checkRuns: [{ ...ok(1), conclusion: 'failure' }] }))).rule, 'a');
  assert.equal((await judgeCandidate(input({ checkRuns: [{ ...ok(1), conclusion: 'cancelled' }] }))).rule, 'a');
  assert.equal((await judgeCandidate(input({ statuses: [{ id: 1, context: 'ci/x', state: 'error' }] }))).rule, 'a');
  assert.equal((await judgeCandidate(input({ statuses: [{ id: 1, context: 'ci/x', state: 'failure' }, { id: 2, context: 'ci/x', state: 'success' }] }))).left, false,
    'only the latest status per context counts');
  assert.equal((await judgeCandidate(input({ statuses: [{ id: 1, context: 'owner-questions', state: 'failure' }] }))).left, false);
  // A cancelled check run again to success: only the latest per key counts (check_state).
  assert.equal((await judgeCandidate(input({ checkRuns: [{ ...ok(1), conclusion: 'cancelled' }, ok(3)] }))).left, false);
  assert.equal(latestChecks([{ ...ok(1), conclusion: 'cancelled' }, ok(3)], WR).length, 1);
  // The Orchestrator's own check run is never counted, cancelled as it may be.
  const orch = { id: 4, name: 'loop', status: 'completed', conclusion: 'cancelled', check_suite: { id: 11 } };
  assert.equal((await judgeCandidate(input({ checkRuns: [ok(1), orch] }))).left, false);
});

test('J16 (b): left by a judging run after the checks; skipped, cancelled, unread or nothing-judged runs do not count', async () => {
  const final = stamp('PR #7: waits: src/x.js (added) is not a change the asks-merge delegation covers');
  // A judging run after the last check, with a final reason: left.
  let v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z')], logs: { 101: final } }));
  assert.deepEqual([v.left, v.rule], [true, 'b']);
  // A run that started before the checks finished does not count.
  v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:39:00Z')], logs: { 101: final } }));
  assert.equal(v.left, false);
  // A pushed run of asks-merge (not one of its own triggers) does not count.
  v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z', 'push')], logs: { 101: final } }));
  assert.equal(v.left, false);
  // Its merge job skipped, or cancelled: no.
  for (const conclusion of ['skipped', 'cancelled']) {
    v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z')], jobs: { 1: [{ id: 101, name: 'merge', status: 'completed', conclusion }] }, logs: { 101: final } }));
    assert.equal(v.left, false, conclusion);
  }
  // A log that cannot be read, and a run that judged nothing: no.
  v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z')], logs: {} }));
  assert.equal(v.left, false);
  v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z')], logs: { 101: stamp('NOTE: the open pull requests cannot be read; nothing is merged') } }));
  assert.equal(v.left, false);
  // A transient reason: not left.
  v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z')], logs: { 101: stamp("PR #7: waits: status 'ci/x' is pending") } }));
  assert.equal(v.left, false);
  // The newest judging run decides: an older final reason, then a newer transient one.
  v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z'), arun(2, '2026-10-18T11:45:00Z')],
    logs: { 101: final, 102: stamp('PR #7: waits: no counted check run on the head yet') } }));
  assert.equal(v.left, false);
  // While a check is still running, no judging run is looked for.
  v = await judgeCandidate(input({ checkRuns: [{ ...ok(1), status: 'in_progress', conclusion: null }], asksRuns: [arun(1, '2026-10-18T11:41:00Z')], logs: { 101: final } }));
  assert.equal(v.left, false);
});

test('J16 (b): a retried reason left after 15 minutes by run_started_at, not 14; kept across runs per head; a lasting conflict', async () => {
  const conflict = stamp('PR #7: waits: GitHub refused the merge (HTTP 405: merge conflict)');
  const notText = stamp('PR #7: waits: questions/N1.md in the head cannot be read as text');
  // Two judging runs in one read, 14 and 15 minutes apart.
  let v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z'), arun(2, '2026-10-18T11:55:00Z')], logs: { 101: notText, 102: notText } }));
  assert.deepEqual([v.left, v.retriedMs], [false, Date.parse('2026-10-18T11:41:00Z')]);
  v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z'), arun(2, '2026-10-18T11:56:00Z')], logs: { 101: notText, 102: notText } }));
  assert.deepEqual([v.left, v.rule], [true, 'b']);
  // The first time kept from an earlier run of the sender (J18), the later run's own run_started_at.
  v = await judgeCandidate(input({ asksRuns: [arun(2, '2026-10-18T11:55:59Z')], logs: { 102: conflict }, retriedMs: Date.parse('2026-10-18T11:41:00Z') }));
  assert.equal(v.left, false, '14 minutes 59 seconds');
  v = await judgeCandidate(input({ asksRuns: [arun(2, '2026-10-18T11:56:00Z')], logs: { 102: conflict }, retriedMs: Date.parse('2026-10-18T11:41:00Z') }));
  assert.equal(v.left, true, 'a lasting conflict, 15 minutes on');
});

test('J16 (b), J18: a candidate\'s head and its retried reason kept across runs; a new head starts again', async () => {
  const records = filesUnder(join(NOTIFY_FIX, 'sd-ef8daf4'));
  const co = checkoutOf({ base: records });
  const config = testConfig(makeVapid());
  const project = config.projects[0];
  const w = makeWorld();
  const head1 = '1'.repeat(40);
  w.pulls = [pull(7, { sha: head1 })];
  w.files[7] = [{ filename: 'questions/N1.md', status: 'added' }];
  w.checks[head1] = { checkRuns: [ok(1)], workflowRuns: WR, statuses: [] };
  w.asksRuns = [arun(1, '2026-10-18T11:41:00Z')];
  w.jobs[1] = [{ id: 101, name: 'merge', status: 'completed', conclusion: 'success' }];
  w.logs[101] = stamp('PR #7: waits: questions/N1.md in the head cannot be read as text');
  const run = (cand, nowMs) => {
    for (const r of w.asksRuns) r.head_sha = r.head_sha || co.head; // a judging run's commit is on the default branch (security C)
    return collect({ project, config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs, stateKey: 'k'.repeat(64), cand });
  };
  const r1 = await run({}, T0);
  assert.ok(!r1.set.some((x) => x.kind === 'pr'), 'held: the first retried reason');
  const [hk] = Object.keys(r1.cand);
  assert.match(hk, /^[0-9a-f]{32}$/);
  assert.equal(r1.cand[hk].retried, '2026-10-18T11:41:00.000Z');
  // The job's next run (its 15-minute fallback) gives it again: only that run is listed now.
  w.asksRuns = [arun(2, '2026-10-18T11:56:00Z', 'schedule')];
  w.jobs[2] = [{ id: 102, name: 'merge', status: 'completed', conclusion: 'success' }];
  w.logs[102] = w.logs[101];
  const r2 = await run(r1.cand, T0 + 5 * MIN);
  assert.ok(r2.set.some((x) => x.key === 'Service-Desk|pr|7'), 'left, 15 minutes after the first');
  // A new head starts again.
  const head2 = '2'.repeat(40);
  w.pulls = [pull(7, { sha: head2 })];
  w.checks[head2] = { checkRuns: [ok(5, '2026-10-18T11:57:00Z')], workflowRuns: WR, statuses: [] };
  w.asksRuns = [arun(3, '2026-10-18T11:58:00Z')];
  w.jobs[3] = [{ id: 103, name: 'merge', status: 'completed', conclusion: 'success' }];
  w.logs[103] = w.logs[101];
  const r3 = await run({ ...r1.cand, ...r2.cand }, T0 + 10 * MIN);
  assert.ok(!r3.set.some((x) => x.kind === 'pr'), 'held again on its new head');
  assert.equal(Object.keys(r3.cand).length, 1);
  assert.notEqual(Object.keys(r3.cand)[0], hk);
});

test('J16 (c): 30 minutes with no counted check, from the later of the head commit\'s time and the first run that saw it', async () => {
  const none = { checkRuns: [] };
  assert.equal((await judgeCandidate(input({ ...none, seenMs: T0 - 29 * MIN, headTime: T0 - 60 * MIN }))).left, false);
  assert.equal((await judgeCandidate(input({ ...none, seenMs: T0 - 30 * MIN, headTime: T0 - 60 * MIN }))).rule, 'c');
  // A head commit older than the pull request: the first run that saw it counts.
  assert.equal((await judgeCandidate(input({ ...none, seenMs: T0 - 20 * MIN, headTime: Date.parse('2026-10-01T00:00:00Z') }))).left, false);
  // A head commit's time later than the first sight (a clock ahead): the commit's time counts.
  assert.equal((await judgeCandidate(input({ ...none, seenMs: T0 - 40 * MIN, headTime: T0 - 10 * MIN }))).left, false);
  // Only the Orchestrator's check run on the head: no counted check.
  const orch = { id: 4, name: 'loop', status: 'completed', conclusion: 'cancelled', check_suite: { id: 11 } };
  assert.equal((await judgeCandidate(input({ checkRuns: [orch], seenMs: T0 - 31 * MIN }))).rule, 'c');
});

test('J16 (d): find_grant\'s verdicts matched, on the real ledger at ef8daf4 and on made-up histories', async () => {
  const { cases } = oracle('grant-cases.json');
  const { verdicts } = oracle('model-grants.json');
  for (const c of cases) {
    const { root } = buildRepo(c);
    const got = findGrant(openCheckout(root));
    const want = verdicts.find((v) => v.case === c.name);
    assert.equal(got.grant ? got.grant.id : null, want.grant, c.name);
  }
  // The real records at ef8daf4, one commit: L-0017 (the model's verdict on this repository at ef8daf4, README).
  const co = checkoutOf({ base: filesUnder(join(NOTIFY_FIX, 'sd-ef8daf4')) });
  assert.deepEqual(findGrant(co.open()).grant, { id: 'L-0017' });
});

test('J16 (d): with no standing grant, a pull request of the job\'s kinds waits as any pull request', async () => {
  const records = filesUnder(join(NOTIFY_FIX, 'sd-ef8daf4'));
  const ledger = records['docs/LEDGER.md'].toString().replace('## L-0017', '## L-0917').replace('asks-merge: granted', 'not a grant');
  const co = checkoutOf({ base: { ...records, 'docs/LEDGER.md': ledger } });
  const w = makeWorld();
  w.pulls = [pull(7, { sha: SHA })];
  w.files[7] = [{ filename: 'questions/N1.md', status: 'added' }];
  w.checks[SHA] = { checkRuns: [{ ...ok(1), status: 'in_progress', conclusion: null }], workflowRuns: WR, statuses: [] };
  const config = testConfig(makeVapid());
  const c = await collect({ project: config.projects[0], config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: 'k'.repeat(64), cand: {} });
  assert.ok(c.set.some((x) => x.key === 'Service-Desk|pr|7'));
  assert.ok(!w.ghCalls.some((x) => /check-runs|asks-merge/.test(x.path)));
  // And with 300 files or more listed, no job candidate either.
  const co2 = checkoutOf({ base: records });
  w.files[7] = Array.from({ length: 300 }, (_, i) => ({ filename: `questions/N${i}.md`, status: 'added' }));
  const c2 = await collect({ project: config.projects[0], config, checkout: co2.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: 'k'.repeat(64), cand: {} });
  assert.ok(c2.set.some((x) => x.key === 'Service-Desk|pr|7'));
});

// Draft 7 (Critic round 5, note 12): a candidate's check runs, statuses and workflow runs are read to
// 10 pages of 100, the job's own `PAGES = 10` (asks_merge.py:79); more than that is no job candidate,
// so it waits as any pull request (the job can't read further either, so it won't merge it).
test('J16 (draft 7): a candidate\'s check runs, statuses and workflow runs read to 10 pages; an eleventh needed makes it no candidate', async () => {
  assert.equal(CANDIDATE_MAX_PAGES, 10);
  const records = filesUnder(join(NOTIFY_FIX, 'sd-ef8daf4'));
  const config = testConfig(makeVapid());
  const many = {
    checkRuns: (n) => Array.from({ length: n }, (_, i) => ok(i + 1, '2026-10-18T11:40:00Z', `build-${i}`)),
    statuses: (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, context: `ci/made-up-${i}`, state: 'success' })),
    workflowRuns: (n) => [...WR, ...Array.from({ length: n - WR.length }, (_, i) => ({ check_suite_id: 1000 + i, path: '.github/workflows/made-up.yml' }))],
  };
  const lists = { checkRuns: 'check-runs', statuses: 'statuses', workflowRuns: 'actions/runs?head_sha' };
  for (const kind of Object.keys(many)) {
    for (const [count, candidate] of [[1000, true], [1001, false]]) {
      const w = makeWorld();
      w.pulls = [pull(7, { sha: SHA })];
      w.files[7] = [{ filename: 'questions/N1.md', status: 'added' }];
      w.checks[SHA] = { checkRuns: [ok(1)], workflowRuns: WR, statuses: [], [kind]: many[kind](count) };
      const c = await collect({ project: config.projects[0], config, checkout: checkoutOf({ base: records }).open(),
        gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: 'k'.repeat(64), cand: {} });
      assert.equal(c.read, true);
      const pages = w.ghCalls.filter((x) => x.path.includes(lists[kind]) && x.path.includes(SHA)).length;
      assert.equal(pages, 10, `${kind} ${count}: ten pages read, never an eleventh`);
      // A candidate whose checks all passed, with no judging run since, is left to the job; no candidate waits as any pull request.
      assert.equal(c.set.some((x) => x.key === 'Service-Desk|pr|7'), !candidate, `${kind} ${count}`);
      assert.equal(Object.keys(c.cand).length, candidate ? 1 : 0, `${kind} ${count}`);
    }
  }
});

// 2026-10-19 (AC79; the plan review's E(i), round 2): judging runs are those on the default branch only,
// in the shared judgment, so in the sender too (R3). A `workflow_dispatch` of a changed job on a branch
// can print a grant line or a `PR #` line that neither the sender nor the page takes.
test('J16 (AC79): an asks-merge run from workflow_dispatch on a branch is ignored, its PR and grant lines with it; the same run on the default branch counts', async () => {
  const final = '2026-10-18T11:50:00.0000000Z NOTE: the asks-merge grant is L-0017\n'
    + stamp('PR #7: waits: src/x.js (added) is not a change the asks-merge delegation covers');
  let v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z', 'workflow_dispatch', 'cos/try-a-changed-job')], logs: { 101: final } }));
  assert.equal(v.left, false, 'a branch\'s dispatch judges nothing');
  v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z', 'workflow_dispatch', 'main')], logs: { 101: final } }));
  assert.deepEqual([v.left, v.rule], [true, 'b'], 'the same run on the default branch');
  // A run with no head_branch judges nothing; the default branch is the project's, from J7.
  v = await judgeCandidate(input({ asksRuns: [{ id: 1, event: 'schedule', run_started_at: '2026-10-18T11:41:00Z' }], logs: { 101: final } }));
  assert.equal(v.left, false);
  v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z', 'schedule', 'trunk')], logs: { 101: final }, defaultBranch: 'trunk' }));
  assert.equal(v.left, true);
  assert.equal(isJudgingRun(arun(1, 'x', 'push', 'main'), 'main'), false, 'a push run is never a judging run');
  // Without the default branch, the judgment refuses loudly rather than leave nothing.
  await assert.rejects(judgeCandidate(input({ defaultBranch: '' })), /defaultBranch/);
  // The sender, end to end: the branch's dispatch run is not read at all; on main it leaves the pull request.
  const records = filesUnder(join(NOTIFY_FIX, 'sd-ef8daf4'));
  const config = testConfig(makeVapid());
  for (const [branch, left] of [['cos/try-a-changed-job', false], ['main', true]]) {
    const w = makeWorld();
    w.pulls = [pull(7, { sha: SHA })];
    w.files[7] = [{ filename: 'questions/N1.md', status: 'added' }];
    w.checks[SHA] = { checkRuns: [ok(1)], workflowRuns: WR, statuses: [] };
    const co = checkoutOf({ base: records });
    w.asksRuns = [{ ...arun(1, '2026-10-18T11:41:00Z', 'workflow_dispatch', branch), head_sha: co.head }];
    w.jobs[1] = [{ id: 101, name: 'merge', status: 'completed', conclusion: 'success' }];
    w.logs[101] = final;
    const c = await collect({ project: config.projects[0], config, checkout: co.open(),
      gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: 'k'.repeat(64), cand: {} });
    assert.equal(c.read, true);
    assert.equal(c.set.some((x) => x.key === 'Service-Desk|pr|7'), left, branch);
    assert.equal(w.ghCalls.some((x) => /\/actions\/jobs\/101\/logs/.test(x.path)), left, `${branch}: its log read only on the default branch`);
  }
});

// Security review round 1, A: a pushed file name holding a line break forges a `PR #n:` line in the job's
// log. A log whose `PR #n:` lines repeat a number or go out of order is no one's words: it judges
// nothing, and each candidate it names waits on the owner until a later well-formed run judges it.
test('J16 (security A): a forged PR line from a file name with a line break: the log is no one\'s words, and both candidates it names wait', async () => {
  const GRANT_LINE = 'NOTE: the asks-merge grant is L-0017';
  const real = 'PR #3: waits: decisions/questions/N1-notes.md: a notes or Critic record, which waits for the owner';
  for (const [eol, label] of [['\n', 'LF'], ['\r\n', 'CRLF']]) {
    const forged = `x${eol}PR #3: merged`;
    const text = [GRANT_LINE, real, `PR #9: waits: ${forged} (A) is not a change the asks-merge delegation covers`].join('\n')
      .split('\n').map((l) => `2026-10-18T11:41:05.1234567Z ${l}`).join(eol === '\r\n' ? '\r\n' : '\n') + '\n';
    assert.equal(logWellFormed(text), false, label);
    assert.equal(logWellFormed(REAL_LOG), true, 'the real log is well formed');
    // The sender, end to end: PR #3, which the job left, and PR #9 with the forging file name.
    const records = filesUnder(join(NOTIFY_FIX, 'sd-ef8daf4'));
    const co = checkoutOf({ base: records });
    const w = makeWorld();
    const s3 = '3'.repeat(40);
    const s9 = '9'.repeat(40);
    w.pulls = [pull(3, { sha: s3 }), pull(9, { sha: s9 })];
    w.files[3] = [{ filename: 'decisions/questions/N1-notes.md', status: 'added' }, { filename: 'questions/N1-notes.md', status: 'removed' }];
    w.files[9] = [{ filename: `questions/${forged}.md`, status: 'added' }];
    for (const s of [s3, s9]) w.checks[s] = { checkRuns: [ok(1)], workflowRuns: WR, statuses: [] };
    w.asksRuns = [{ ...arun(1, '2026-10-18T11:41:00Z'), head_sha: co.head }];
    w.jobs[1] = [{ id: 101, name: 'merge', status: 'completed', conclusion: 'success' }];
    w.logs[101] = text;
    const config = testConfig(makeVapid());
    const c = await collect({ project: config.projects[0], config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: 'k'.repeat(64), cand: {} });
    assert.equal(c.read, true);
    assert.ok(c.set.some((x) => x.key === 'Service-Desk|pr|3'), `${label}: #3, which the job left, still counts`);
    // #9 is named by the forged log too, so it counts as well.
    assert.ok(c.set.some((x) => x.key === 'Service-Desk|pr|9'), `${label}: #9 counts`);
    // A later well-formed run judges it again.
    let v = await judgeCandidate(input({ asksRuns: [arun(2, '2026-10-18T11:56:00Z'), arun(1, '2026-10-18T11:41:00Z')],
      logs: { 102: stamp("PR #7: waits: status 'ci/x' is pending"), 101: stamp('PR #9: waits: x').replace('\n', '') + '\n' + stamp('PR #7: merged') } }));
    assert.equal(v.left, false, 'a newer well-formed run decides');
    v = await judgeCandidate(input({ asksRuns: [arun(1, '2026-10-18T11:41:00Z')], logs: { 101: stamp('PR #9: waits: x') + stamp('PR #7: merged') } }));
    assert.deepEqual([v.left, v.forged], [true, true], 'out of order: it names #7, which then waits');
  }
});

// Security review round 1, C: a judging run's commit must be the checkout's HEAD or an ancestor of it.
test('J16 (security C): an asks-merge run named for the default branch but on a commit not in its history judges nothing', async () => {
  const records = filesUnder(join(NOTIFY_FIX, 'sd-ef8daf4'));
  const config = testConfig(makeVapid());
  const co = checkoutOf({ base: records });
  for (const [sha, left] of [['f'.repeat(40), false], [co.head, true]]) {
    const w = makeWorld();
    w.pulls = [pull(7, { sha: SHA })];
    w.files[7] = [{ filename: 'questions/N1.md', status: 'added' }];
    w.checks[SHA] = { checkRuns: [ok(1)], workflowRuns: WR, statuses: [] };
    w.asksRuns = [{ ...arun(1, '2026-10-18T11:41:00Z', 'workflow_dispatch'), head_sha: sha }];
    w.jobs[1] = [{ id: 101, name: 'merge', status: 'completed', conclusion: 'success' }];
    w.logs[101] = stamp('PR #7: waits: src/x.js (added) is not a change the asks-merge delegation covers');
    const c = await collect({ project: config.projects[0], config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: 'k'.repeat(64), cand: {} });
    assert.equal(c.set.some((x) => x.key === 'Service-Desk|pr|7'), left, sha.slice(0, 8));
  }
});

// Security review round 1, D: a head commit dated more than 10 minutes after the reader's clock is no head time.
test('J16 (security D): a future-dated head commit is no head time: rule (c) runs from the first sight', async () => {
  const none = { checkRuns: [], seenMs: T0 - 31 * MIN };
  assert.equal((await judgeCandidate(input({ ...none, headTime: Date.parse('2030-01-01T00:00:00Z') }))).rule, 'c');
  assert.equal((await judgeCandidate(input({ ...none, headTime: T0 + 11 * MIN }))).rule, 'c', '11 minutes ahead: ignored');
  assert.equal((await judgeCandidate(input({ ...none, headTime: T0 + 9 * MIN }))).left, false, '9 minutes ahead: taken (a clock a little behind)');
});
