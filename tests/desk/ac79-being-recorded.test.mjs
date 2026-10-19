// ac-test: S-001/AC79 — the asks-merge job's pull requests, being recorded (2026-10-19; the owner's ruling
// decisions/questions/P-001-answer-pr-on-desk.md, line 1). The page is driven with fake reads (NOT real
// records: made up from J16's fixtures, with J16's real job log as the log, and Service-Desk's real
// records at ef8daf4 for the ledger and its grant), and over a matrix of inputs it asserts that the page
// counts whenever the sender's J16 judgment, on the same records, has left the pull request (not that
// the two agree: the page may count earlier). Then the staged reads (the conditional reads, the blob call
// only when something changed, the dry pass, the cap of 3 per head per opening), the grant on the page,
// the log form, and both views' words.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { collect } from '../../src/notify/collect.mjs';
import { makeGitHub } from '../../src/notify/gh.mjs';
import { findGrant } from '../../src/notify/grant.mjs';
import { openCheckout } from '../../src/notify/checkout.mjs';
import { logVerdict } from '../../src/lib/jobcand.js';
import { formGrant } from '../../src/lib/ledgergrant.js';
import { keptLogLines, JOB_LOG_CHARS } from '../../src/lib/github.js';
import { parsePulls } from '../../src/lib/records.js';
import { parseFilePages, splitChanges } from '../../src/lib/prfiles.js';
import { LEFT_WORDS, NO_CHECK_WORDS, CALLS_PER_HEAD } from '../../src/lib/jobwatch.js';
import { BEING_RECORDED_WORDS } from '../../src/lib/model.js';
import { FIX } from './helpers.mjs';
import { NOTIFY_FIX, T0, MIN, REPO, buildRepo, checkoutOf, filesUnder, makeWorld, pull, testConfig, makeVapid, cleanScratch } from './notify-helpers.mjs';
import { settledVerdicts, pageJobs } from './jobs-page.mjs';

after(cleanScratch);

const REAL_LOG = readFileSync(join(FIX, 'github', 'asks-merge-job-117691950060-excerpt.log'), 'utf8');
const RECORDS = filesUnder(join(NOTIFY_FIX, 'sd-ef8daf4'));
const CONFIG = testConfig(makeVapid());
const PROJECT = CONFIG.projects[0];
const SHA = 'c'.repeat(40);
const ok = (id, done = '2026-10-18T11:40:00Z', name = 'build') => ({ id, name, status: 'completed', conclusion: 'success', completed_at: done, check_suite: { id: 10 } });
const WR = [{ check_suite_id: 10, path: '.github/workflows/desk-build.yml' }];
const arun = (id, at, o = {}) => ({ id, event: o.event || 'workflow_run', head_branch: o.branch || 'main', status: o.status || 'completed',
  conclusion: o.conclusion === undefined ? 'success' : o.conclusion, run_started_at: at, updated_at: at });
// J16's real job log's form: each line a timestamp, then the program's own output. NOT real lines but for REAL_LOG.
const log = (...lines) => lines.map((l, i) => `2026-10-18T11:41:0${i}.1234567Z ${l}`).join('\n') + '\n';
const GRANT = 'NOTE: the asks-merge grant is L-0017';

const checkouts = new Map();
function checkout(records) {
  const k = records === RECORDS ? 'real' : JSON.stringify(Object.keys(records).sort()) + String(records['docs/LEDGER.md'] || '').length;
  if (!checkouts.has(k)) checkouts.set(k, checkoutOf({ base: records }));
  return checkouts.get(k);
}

/** A world with one job candidate, #7, a filing pull request, at T0 = 12:00. */
function world(o = {}) {
  const w = makeWorld();
  w.pulls = o.pulls || [pull(7, { sha: SHA, created: o.created || '2026-10-18T11:00:00Z' })];
  w.files[7] = o.files || [{ filename: 'questions/N1.md', status: 'added' }];
  w.checks[SHA] = { checkRuns: o.checkRuns || [ok(1)], workflowRuns: o.workflowRuns || WR, statuses: o.statuses || [] };
  w.asksRuns = o.asksRuns || [];
  for (const [id, jobs] of Object.entries(o.jobs || {})) w.jobs[id] = jobs;
  for (const r of w.asksRuns) if (!w.jobs[r.id]) w.jobs[r.id] = [{ id: r.id + 100, name: 'merge', status: r.status, conclusion: r.conclusion }];
  Object.assign(w.logs, o.logs || {});
  Object.assign(w.commits, o.commits || {});
  return w;
}

function pageCtx(w, records) {
  const tree = new Map(Object.keys(records).map((p) => [p, { sha: `blob-${p}` }]));
  const { pulls } = parsePulls([JSON.stringify(w.pulls)]);
  const files = new Map();
  for (const p of pulls) {
    if (!w.files[p.number]) continue;
    const parsed = parseFilePages([JSON.stringify(w.files[p.number])]);
    files.set(p.number, { headSha: p.headSha, changes: splitChanges(parsed.files), capped: parsed.capped });
  }
  return { project: PROJECT, world: w, tree, ledgerText: records['docs/LEDGER.md'] ? records['docs/LEDGER.md'].toString('utf8') : null, pulls, files };
}

/**
 * The sender and the page on the same records and reads. Asserts AC79's promise: whenever the sender has
 * left #n, the page counts it. Returns { senderLeft, v (the page's verdict, or undefined: no candidate), counts }.
 */
async function both(w, { records = RECORDS, nowMs = T0, n = 7 } = {}) {
  // A judging run's commit is the default branch's head unless the case says otherwise (security C).
  const co = checkout(records);
  for (const r of w.asksRuns) if (!r.head_sha) r.head_sha = co.head;
  const c = await collect({ project: PROJECT, config: CONFIG, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }),
    nowMs, stateKey: 'k'.repeat(64), cand: {} });
  assert.equal(c.read, true, c.why);
  const { verdicts, page } = await settledVerdicts(pageCtx(w, records), nowMs);
  const senderLeft = c.set.some((x) => x.key === `Service-Desk|pr|${n}`);
  const v = verdicts.get(n);
  const counts = !v || v.state === 'count';
  if (senderLeft) assert.ok(counts, 'the page counts whenever the sender has left it');
  return { senderLeft, v, counts, page };
}

// ---------------------------------------------------------------------------
// The matrix: the page counts whenever the sender has left it.

test('AC79: a filing and an answer record\'s pull request, each a candidate while its checks run: being recorded, not counted', async () => {
  const running = [{ ...ok(1), status: 'in_progress', conclusion: null, completed_at: null }];
  for (const files of [[{ filename: 'questions/N1.md', status: 'added' }],
    [{ filename: 'decisions/questions/N1.md', status: 'added' }, { filename: 'questions/N1.md', status: 'removed' }]]) {
    const r = await both(world({ files, checkRuns: running, asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT, 'PR #3: merged (kinds a) at aaaaaaaaaaaa under L-0017') } }));
    assert.equal(r.senderLeft, false);
    assert.equal(r.v.state, 'recording', files[0].filename);
  }
});

test('AC79 rule (a): a check run failing and a status failing count, with the words; a cancelled check re-run to success does not', async () => {
  const grantRun = { asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT) } };
  let r = await both(world({ ...grantRun, checkRuns: [{ ...ok(1), conclusion: 'failure' }] }));
  assert.deepEqual([r.senderLeft, r.v.state, r.v.words, r.v.rule], [true, 'count', LEFT_WORDS, 'a']);
  r = await both(world({ ...grantRun, statuses: [{ id: 1, context: 'ci/x', state: 'failure' }] }));
  assert.deepEqual([r.senderLeft, r.v.state, r.v.rule], [true, 'count', 'a']);
  r = await both(world({ ...grantRun, checkRuns: [{ ...ok(1), conclusion: 'cancelled' }, ok(3)] }));
  assert.deepEqual([r.senderLeft, r.v.state], [false, 'recording']);
});

test('AC79 rule (b): final, transient, retried and merged verdicts; skipped, cancelled and unfinished runs read nothing; a run that judged nothing', async () => {
  const at = '2026-10-18T11:41:00Z';
  const one = (line, o = {}) => world({ asksRuns: [arun(1, at, o)], logs: { 101: log(GRANT, ...[].concat(line)) }, ...o.extra });
  let r = await both(one('PR #7: waits: src/x.js (added) is not a change the asks-merge delegation covers'));
  assert.deepEqual([r.senderLeft, r.v.state, r.v.words, r.v.rule], [true, 'count', LEFT_WORDS, 'b']);
  r = await both(one("PR #7: waits: status 'ci/x' is pending"));
  assert.deepEqual([r.senderLeft, r.v.state], [false, 'recording'], 'a transient reason: not left');
  // A retried reason: the sender waits 15 minutes; the page counts at once, with no words of its own.
  r = await both(one('PR #7: waits: GitHub refused the merge (HTTP 409: conflict)'));
  assert.deepEqual([r.senderLeft, r.v.state, r.v.words, r.v.why], [false, 'count', null, 'retried']);
  r = await both(one('PR #7: merged (kinds a) at cccccccccccc under L-0017'));
  assert.deepEqual([r.senderLeft, r.v.state], [false, 'recording'], 'a merged line waits for the pull request to leave the open list');
  // A skipped and a cancelled asks-merge run need no read; the grant comes from an earlier run.
  for (const conclusion of ['skipped', 'cancelled']) {
    const w = world({ asksRuns: [arun(2, '2026-10-18T11:45:00Z', { conclusion }), arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT), 102: log(GRANT, 'PR #7: waits: x is final') } });
    r = await both(w);
    assert.deepEqual([r.senderLeft, r.v.state], [false, 'recording'], conclusion);
    assert.ok(!r.page.calls.jobLog.includes('2'), `${conclusion}: no log form asked for it`);
  }
  // A run still in progress: no log read; read once it completes.
  const w = world({ asksRuns: [arun(2, '2026-10-18T11:45:00Z', { status: 'in_progress', conclusion: null }), arun(1, '2026-10-18T11:30:00Z')],
    logs: { 101: log(GRANT), 102: log(GRANT, 'PR #7: waits: src/x.js (added) is not a change the asks-merge delegation covers') } });
  const p = pageJobs(pageCtx(w, RECORDS));
  for (let i = 0; i < 3; i++) await p.poll(T0);
  assert.ok(!p.calls.jobLog.includes('2'));
  assert.equal(p.js.verdicts.get(7).state, 'recording');
  w.asksRuns[0] = arun(2, '2026-10-18T11:45:00Z');
  w.jobs[2] = [{ id: 102, name: 'merge', status: 'completed', conclusion: 'success' }];
  await p.poll(T0 + MIN);
  await p.poll(T0 + 2 * MIN);
  assert.ok(p.calls.jobLog.includes('2'), 'read once it completed');
  assert.deepEqual([p.js.verdicts.get(7).state, p.js.verdicts.get(7).rule], ['count', 'b']);
  // A run that judged nothing (the open pull requests unread): no PR line, not left.
  r = await both(one('NOTE: the open pull requests cannot be read; nothing is merged'));
  assert.deepEqual([r.senderLeft, r.v.state], [false, 'recording']);
});

test('AC79 rule (c): 30 minutes from the later of the head time and created_at; a head older than its pull request; a failed head-time read counts', async () => {
  const none = { checkRuns: [], workflowRuns: [], asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT) } };
  let r = await both(world({ ...none, commits: { [SHA]: '2026-10-18T11:20:00Z' } }));
  assert.deepEqual([r.senderLeft, r.v.state, r.v.rule], [false, 'count', 'c'], 'the page counts from created_at, before the sender\'s first sight');
  assert.equal(r.v.words, null, 'the rule (c) words wait 30 minutes from when the page first saw the head');
  r = await both(world({ ...none, commits: { [SHA]: '2026-10-18T11:40:00Z' } }));
  assert.deepEqual([r.senderLeft, r.v.state], [false, 'recording'], '20 minutes: not yet');
  // A head commit older than the pull request: the pull request's creation counts.
  r = await both(world({ ...none, created: '2026-10-18T11:45:00Z', commits: { [SHA]: '2026-10-01T00:00:00Z' } }));
  assert.deepEqual([r.senderLeft, r.v.state], [false, 'recording']);
  r = await both(world({ ...none, created: '2026-10-18T11:29:00Z', commits: { [SHA]: '2026-10-01T00:00:00Z' } }));
  assert.deepEqual([r.v.state, r.v.rule], ['count', 'c']);
  // A failed head-time read: counted.
  r = await both(world({ ...none }));
  assert.deepEqual([r.senderLeft, r.v.state], [false, 'count']);
});

test('AC79 rule (d): the job\'s grant line naming the ledger\'s entry stands; "no grant stands", another id, no line yet or no asks-merge.yml count', async () => {
  const running = [{ ...ok(1), status: 'in_progress', conclusion: null, completed_at: null }];
  let r = await both(world({ checkRuns: running, asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT) } }));
  assert.equal(r.v.state, 'recording', 'the grant stands');
  r = await both(world({ checkRuns: running, asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log('NOTE: no asks-merge grant stands in docs/LEDGER.md (L-0017: its scope is not project)') } }));
  assert.deepEqual([r.v.state, r.v.words, r.v.rule], ['count', LEFT_WORDS, 'd'], 'the job\'s own log: no grant');
  r = await both(world({ checkRuns: running, asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log('NOTE: the asks-merge grant is L-0009') } }));
  assert.deepEqual([r.v.state, r.v.words, r.v.why], ['count', null, 'grant'], 'a stable mismatch: the job falls back to another entry');
  r = await both(world({ checkRuns: running }));
  assert.deepEqual([r.v.state, r.v.why], ['count', 'grant'], 'no grant line read yet');
  r = await both(world({ checkRuns: running, asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log('NOTE: the open pull requests cannot be read') } }));
  assert.deepEqual([r.v.state, r.v.why], ['count', 'grant'], 'a run that printed no grant line');
  const noJob = { ...RECORDS };
  delete noJob['.github/workflows/asks-merge.yml'];
  r = await both(world({ checkRuns: running, asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT) } }), { records: noJob });
  assert.equal(r.senderLeft, true);
  assert.equal(r.v, undefined, 'no asks-merge.yml: no candidate, counted as any pull request');
});

test('AC79 rule (d): the ledger\'s form check never trusts more than find_grant; a grant that arrived through a Merged-By: merge, as the job reports it, counts', async () => {
  const { cases } = JSON.parse(readFileSync(join(NOTIFY_FIX, 'grant-cases.json'), 'utf8'));
  for (const c of cases) {
    const { root } = buildRepo(c);
    const co = openCheckout(root);
    const found = findGrant(co).grant;
    const text = co.tree.has('docs/LEDGER.md') ? co.blobs(['docs/LEDGER.md']).get('docs/LEDGER.md') : null;
    const form = formGrant(text, (p) => co.tree.has(p));
    if (found) assert.deepEqual(form, found, `${c.name}: the form check finds find_grant's entry`);
    if (c.name === 'arrived in a merge carrying Merged-By') {
      assert.equal(found, null);
      assert.deepEqual(form, { id: 'L-0017' }, 'the page cannot see the arrival');
    } else assert.deepEqual(form, found, c.name);
  }
  // The job, which sees the arrival, prints that no grant stands (or falls back to an earlier id): the page counts.
  const running = [{ ...ok(1), status: 'in_progress', conclusion: null, completed_at: null }];
  for (const line of ['NOTE: no asks-merge grant stands in docs/LEDGER.md (L-0017: it arrived in merge cccccccccccc, which carries a Merged-By: trailer)', 'NOTE: the asks-merge grant is L-0005']) {
    const { verdicts } = await settledVerdicts(pageCtx(world({ checkRuns: running, asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(line) } }), RECORDS), T0);
    assert.equal(verdicts.get(7).state, 'count', line);
  }
});

test('AC79: non-candidates count as before: another path, a fork\'s, 300 files; more than 10 pages, a list with a next page, and a sixth candidate count', async () => {
  const running = [{ ...ok(1), status: 'in_progress', conclusion: null, completed_at: null }];
  const base = { checkRuns: running, asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT) } };
  let r = await both(world({ ...base, files: [{ filename: 'src/x.js', status: 'modified' }] }));
  assert.deepEqual([r.senderLeft, r.v], [true, undefined]);
  r = await both(world({ ...base, pulls: [pull(7, { sha: SHA, headRepo: 'someone/Service-Desk', association: 'NONE' })] }));
  assert.deepEqual([r.senderLeft, r.v], [true, undefined]);
  r = await both(world({ ...base, files: Array.from({ length: 300 }, (_, i) => ({ filename: `questions/N${i}.md`, status: 'added' })) }));
  assert.deepEqual([r.senderLeft, r.v], [true, undefined]);
  // A draft is activity, as before: neither counts it, and it is no candidate.
  r = await both(world({ ...base, pulls: [pull(7, { sha: SHA, draft: true })] }));
  assert.deepEqual([r.senderLeft, r.v], [false, undefined]);
  // A list with a next page (101 check runs): the page reads first pages only, so it counts.
  r = await both(world({ ...base, checkRuns: [...running, ...Array.from({ length: 100 }, (_, i) => ok(10 + i, '2026-10-18T11:40:00Z', `b${i}`))] }));
  assert.deepEqual([r.v.state, r.v.why], ['count', 'next-page']);
  // More than 10 pages: no candidate for the sender (the job's own cap), counted on the page too.
  r = await both(world({ ...base, statuses: Array.from({ length: 1001 }, (_, i) => ({ id: i + 1, context: `ci/m${i}`, state: 'success' })) }));
  assert.equal(r.senderLeft, true);
  assert.equal(r.v.state, 'count');
  // A sixth candidate counts until one closes.
  const shas = [1, 2, 3, 4, 5, 6].map((i) => String(i).repeat(40));
  const w = world(base);
  w.pulls = shas.map((s, i) => pull(10 + i, { sha: s }));
  for (let i = 0; i < 6; i++) {
    w.files[10 + i] = [{ filename: `questions/N${i}.md`, status: 'added' }];
    w.checks[shas[i]] = { checkRuns: running, workflowRuns: WR, statuses: [] };
  }
  const { verdicts } = await settledVerdicts(pageCtx(w, RECORDS), T0);
  assert.deepEqual([10, 11, 12, 13, 14].map((n) => verdicts.get(n).state), Array(5).fill('recording'));
  assert.deepEqual([verdicts.get(15).state, verdicts.get(15).why], ['count', 'sixth']);
});

test('AC79: an asks-merge run from workflow_dispatch on a branch: its grant line and PR line ignored by the page', async () => {
  const running = [{ ...ok(1), status: 'in_progress', conclusion: null, completed_at: null }];
  let r = await both(world({ checkRuns: running, asksRuns: [arun(2, '2026-10-18T11:50:00Z', { event: 'workflow_dispatch', branch: 'cos/a-changed-job' }), arun(1, '2026-10-18T11:30:00Z')],
    logs: { 101: log(GRANT), 102: log('NOTE: no asks-merge grant stands') } }));
  assert.equal(r.v.state, 'recording', 'the branch\'s run is not the newest judging run');
  assert.ok(!r.page.calls.jobLog.includes('2'), 'not read');
  r = await both(world({ asksRuns: [arun(2, '2026-10-18T11:50:00Z', { event: 'workflow_dispatch', branch: 'cos/a-changed-job' }), arun(1, '2026-10-18T11:30:00Z')],
    logs: { 101: log(GRANT), 102: log(GRANT, 'PR #7: waits: x is not a change the delegation covers') } }));
  assert.deepEqual([r.senderLeft, r.v.state], [false, 'recording'], 'its PR line is ignored by both');
});

// ---------------------------------------------------------------------------
// The log form (J6): the redirect with no token, the cap, and the filtered lines.

test('AC79\'s log form: filtered lines give the same logVerdict as the whole log, on the real log and a CRLF log, the grant line kept; over 65,536 characters is too large', async () => {
  const lines = keptLogLines(REAL_LOG);
  assert.deepEqual(lines, ['NOTE: the asks-merge grant is L-0017', "PR #103: waits: check run 'build' (.github/workflows/desk-build.yml) is in_progress/None"]);
  for (const n of [103, 7, 104]) assert.deepEqual(logVerdict(lines.join('\n'), n), logVerdict(REAL_LOG, n), String(n));
  const crlf = REAL_LOG.replace(/\n/g, '\r\n').replace('2026-10-18T13:47:05.1494526Z Post job cleanup.', '2026-10-18T13:47:05.1300000Z PR #104: merged (kinds a) at aaaaaaaaaaaa under L-0017\r\n2026-10-18T13:47:05.1494526Z Post job cleanup.');
  const kept = keptLogLines(crlf);
  assert.equal(kept.length, 3);
  for (const n of [103, 104, 7]) assert.deepEqual(logVerdict(kept.join('\n'), n), logVerdict(crlf, n), `CRLF ${n}`);
  assert.equal(JOB_LOG_CHARS, 65536);
  // Too large: the function answers so, and the candidate counts; the run is not asked again in the opening.
  const big = `${log(GRANT, 'PR #7: waits: x is final')}${'x'.repeat(JOB_LOG_CHARS)}\n`;
  const w = world({ asksRuns: [arun(1, '2026-10-18T11:41:00Z')], logs: { 101: big } });
  const p = pageJobs(pageCtx(w, RECORDS));
  for (let i = 0; i < 4; i++) await p.poll(T0 + i * MIN);
  assert.equal(p.js.logs.get('1').state, 'too-large');
  assert.equal(p.calls.jobLog.filter((x) => x === '1').length, 1);
  assert.equal(p.js.verdicts.get(7).state, 'count');
  // The redirect's address was fetched with no token: the world's log store saw no Authorization header.
  const seen = [];
  const f = w.fetch;
  w.fetch = async (url, init = {}) => {
    if (String(url).startsWith('https://blobs.example.invalid/')) seen.push(new Headers(init.headers || {}).get('authorization'));
    return f(url, init);
  };
  const p2 = pageJobs(pageCtx(w, RECORDS));
  await p2.poll(T0);
  await p2.poll(T0);
  assert.ok(seen.length >= 1);
  assert.ok(seen.every((x) => x == null), 'no Authorization on the redirect');
});

// ---------------------------------------------------------------------------
// The staged reads, the cap and the grant's epoch, on the page's own module.

test('AC79: the cap: a head needing its head time, a log and a re-read (3 calls, judged); a fourth needed counts until its head changes, the same head too; a new head in the same opening is judged', async () => {
  // No counted check: the head time is needed, and fails every time; each poll changes (a new runs page).
  const w = world({ checkRuns: [], workflowRuns: [], created: '2026-10-18T11:55:00Z', asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT) } });
  const p = pageJobs(pageCtx(w, RECORDS));
  for (let i = 0; i < 8; i++) {
    w.asksRuns = [arun(100 + i, `2026-10-18T11:3${i}:30Z`, { conclusion: 'skipped' }), arun(1, '2026-10-18T11:30:00Z')];
    await p.poll(T0 + i * MIN);
  }
  const h = p.js.heads.get(SHA);
  assert.equal(h.calls, CALLS_PER_HEAD, 'at most 3 AC79 blob calls for the head, failures included');
  assert.equal(p.calls.commitTime.filter((x) => x === SHA).length, 3);
  assert.equal(h.capped, true);
  assert.deepEqual([p.js.verdicts.get(7).state, p.js.verdicts.get(7).why], ['count', 'capped']);
  // The same head after the cap: a check run starts, which would let it be judged; it still counts until its head changes.
  w.checks[SHA] = { checkRuns: [{ ...ok(4), status: 'in_progress', conclusion: null, completed_at: null }], workflowRuns: WR, statuses: [] };
  for (let i = 8; i < 11; i++) await p.poll(T0 + i * MIN);
  assert.deepEqual([p.js.verdicts.get(7).state, p.js.verdicts.get(7).why], ['count', 'capped'], 'the same head stays counted');
  assert.equal(p.js.heads.get(SHA).calls, CALLS_PER_HEAD, 'and no fourth call');
  // A new head in the same opening starts again, and is judged.
  const sha2 = 'd'.repeat(40);
  w.pulls = [pull(7, { sha: sha2, created: '2026-10-18T11:55:00Z' })];
  w.files[7] = [{ filename: 'questions/N1.md', status: 'added' }];
  w.checks[sha2] = { checkRuns: [{ ...ok(5), status: 'in_progress', conclusion: null, completed_at: null }], workflowRuns: WR, statuses: [] };
  Object.assign(p.ctxRef, pageCtx(w, RECORDS)); // the same opening, its pull request now at the new head
  for (let i = 11; i < 14; i++) await p.poll(T0 + i * MIN);
  assert.equal(p.js.verdicts.get(7).head, sha2);
  assert.equal(p.js.verdicts.get(7).state, 'recording', 'a new head within the same opening is judged');
  assert.equal(p.js.heads.get(SHA).capped, true, 'the old head keeps its cap for the opening');
});

test('AC79: a failed log answer kept for its run and not asked again; the grant read failing waits for the next opening or ledger change', async () => {
  const w = world({ asksRuns: [arun(1, '2026-10-18T11:41:00Z')], logs: {} }); // the log is not there: a failed read
  const ctx = pageCtx(w, RECORDS);
  const p = pageJobs(ctx);
  for (let i = 0; i < 5; i++) await p.poll(T0 + i * MIN);
  assert.equal(p.js.logs.get('1').state, 'failed');
  assert.equal(p.calls.jobLog.filter((x) => x === '1').length, 1, 'asked once');
  assert.equal(p.js.grant.failed, true);
  assert.deepEqual([p.js.verdicts.get(7).state, p.js.verdicts.get(7).why], ['count', 'failed']);
  // A newer run's log arrives; the failed grant read is still not retried in this opening.
  w.asksRuns = [arun(2, '2026-10-18T11:55:00Z'), arun(1, '2026-10-18T11:41:00Z')];
  w.jobs[2] = [{ id: 102, name: 'merge', status: 'completed', conclusion: 'success' }];
  w.logs[102] = log(GRANT, "PR #7: waits: status 'ci/x' is pending");
  await p.poll(T0 + 6 * MIN);
  await p.poll(T0 + 7 * MIN);
  assert.equal(p.js.verdicts.get(7).state, 'count');
  assert.equal(p.js.grant.failed, true, 'not retried in this opening');
  assert.equal(p.calls.jobLog.filter((x) => x === '1').length, 1, 'still asked once');
  // A ledger change starts the grant line's epoch again: read from a run that started after the page saw it.
  ctx.tree = new Map(ctx.tree);
  ctx.tree.set('docs/LEDGER.md', { sha: 'blob-ledger-2' });
  await p.poll(T0 + 8 * MIN);
  assert.equal(p.js.grant.failed, false);
  assert.equal(p.js.grant.since, T0 + 8 * MIN);
  assert.equal(p.calls.ledger, 2, 'the ledger read again');
  assert.equal(p.js.verdicts.get(7).state, 'count', 'no run since the ledger changed: counted');
  w.asksRuns = [arun(3, new Date(T0 + 9 * MIN).toISOString()), ...w.asksRuns];
  w.jobs[3] = [{ id: 103, name: 'merge', status: 'completed', conclusion: 'success' }];
  w.logs[103] = log(GRANT, "PR #7: waits: status 'ci/x' is pending");
  await p.poll(T0 + 10 * MIN);
  await p.poll(T0 + 11 * MIN);
  assert.ok(p.calls.jobLog.includes('3'), 'the grant line read from the run after the change');
  // Run 1's log failed and is still among the five newest after the checks: the candidate counts.
  assert.deepEqual([p.js.verdicts.get(7).state, p.js.verdicts.get(7).why], ['count', 'failed']);
  // A new opening reads every log again, once.
  const fresh = pageJobs(pageCtx(w, RECORDS));
  w.logs[101] = log(GRANT);
  for (let i = 0; i < 3; i++) await fresh.poll(T0 + 12 * MIN);
  assert.equal(fresh.calls.jobLog.filter((x) => x === '1').length, 1);
  assert.equal(fresh.calls.jobLog.filter((x) => x === '3').length, 1);
  assert.equal(fresh.js.verdicts.get(7).state, 'recording');
});

test('AC79: the grant line from the newest judging run whose merge job ran; a stable id mismatch counts', async () => {
  const running = [{ ...ok(1), status: 'in_progress', conclusion: null, completed_at: null }];
  // The newest run skipped: the grant line comes from the one before.
  let { verdicts, page } = await settledVerdicts(pageCtx(world({ checkRuns: running, asksRuns: [arun(2, '2026-10-18T11:50:00Z', { conclusion: 'skipped' }), arun(1, '2026-10-18T11:30:00Z')],
    logs: { 101: log(GRANT) } }), RECORDS), T0);
  assert.equal(verdicts.get(7).state, 'recording');
  assert.ok(!page.calls.jobLog.includes('2'));
  ({ verdicts } = await settledVerdicts(pageCtx(world({ checkRuns: running, asksRuns: [arun(2, '2026-10-18T11:50:00Z'), arun(1, '2026-10-18T11:30:00Z')],
    logs: { 101: log(GRANT), 102: log('NOTE: the asks-merge grant is L-0003') } }), RECORDS), T0));
  assert.deepEqual([verdicts.get(7).state, verdicts.get(7).why], ['count', 'grant'], 'the newest run names another entry');
});

test('AC79: a left pull request the job\'s next run merges stays counted, "The automatic job left this for you", until it leaves the open list', async () => {
  const w = world({ asksRuns: [arun(1, '2026-10-18T11:41:00Z')], logs: { 101: log(GRANT, 'PR #7: waits: questions/N1.md: its title cannot be parsed, which waits for the owner') } });
  const ctx = pageCtx(w, RECORDS);
  const p = pageJobs(ctx);
  for (let i = 0; i < 3; i++) await p.poll(T0 + i * MIN);
  assert.deepEqual([p.js.verdicts.get(7).state, p.js.verdicts.get(7).words], ['count', LEFT_WORDS]);
  const asked = p.calls.jobLog.length;
  // A fix on the default branch, and the job's next run merges it: the page keeps it, reading no more logs for it.
  w.asksRuns = [arun(2, '2026-10-18T12:05:00Z'), ...w.asksRuns];
  w.jobs[2] = [{ id: 102, name: 'merge', status: 'completed', conclusion: 'success' }];
  w.logs[102] = log(GRANT, 'PR #7: merged (kinds a) at cccccccccccc under L-0017');
  await p.poll(T0 + 6 * MIN);
  await p.poll(T0 + 7 * MIN);
  assert.deepEqual([p.js.verdicts.get(7).state, p.js.verdicts.get(7).words], ['count', LEFT_WORDS]);
  assert.equal(p.calls.jobLog.length, asked, 'no more logs read for it on this head');
  // It leaves the open list: gone.
  ctx.pulls = [];
  assert.equal((await p.poll(T0 + 8 * MIN)).size, 0);
});

test('AC79: a new head with an older commit counts at once without the rule (c) words, which show 30 minutes after the page first saw it', async () => {
  const w = world({ checkRuns: [], workflowRuns: [], created: '2026-10-18T10:00:00Z', commits: { [SHA]: '2026-10-01T00:00:00Z' },
    asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT) } });
  const p = pageJobs(pageCtx(w, RECORDS));
  for (let i = 0; i < 3; i++) await p.poll(T0 + i * MIN);
  assert.deepEqual([p.js.verdicts.get(7).state, p.js.verdicts.get(7).rule, p.js.verdicts.get(7).words], ['count', 'c', null]);
  await p.poll(T0 + 29 * MIN);
  assert.equal(p.js.verdicts.get(7).words, null);
  await p.poll(T0 + 30 * MIN);
  assert.equal(p.js.verdicts.get(7).words, NO_CHECK_WORDS);
});

test('AC79: the dry pass asks for the logs the module will read, together, at most 5 a call, even after a final verdict', async () => {
  const runs = [1, 2, 3, 4, 5, 6].map((i) => arun(i, `2026-10-18T11:4${i}:00Z`));
  const logs = Object.fromEntries(runs.map((r) => [r.id + 100, log(GRANT, "PR #7: waits: status 'ci/x' is pending")]));
  logs[106] = log(GRANT, 'PR #7: waits: x is final');
  const w = world({ asksRuns: runs, logs });
  const p = pageJobs(pageCtx(w, RECORDS));
  for (let i = 0; i < 3; i++) await p.poll(T0 + i * MIN);
  assert.equal(p.calls.blob, 2, 'the ledger, then one call for the logs');
  assert.deepEqual([...p.calls.jobLog].sort(), ['2', '3', '4', '5', '6'], 'the five newest, in one call');
  assert.equal(p.js.verdicts.get(7).rule, 'b');
});

test('AC79: a failed or refused poll part counts every candidate and leaves the reads as they were', async () => {
  const running = [{ ...ok(1), status: 'in_progress', conclusion: null, completed_at: null }];
  const w = world({ checkRuns: running, asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT) } });
  const p = pageJobs(pageCtx(w, RECORDS));
  for (let i = 0; i < 3; i++) await p.poll(T0 + i * MIN);
  assert.equal(p.js.verdicts.get(7).state, 'recording');
  w.fail[`/repos/${REPO}/commits/${SHA}/check-runs`] = 502;
  await p.poll(T0 + 3 * MIN);
  assert.deepEqual([p.js.verdicts.get(7).state, p.js.verdicts.get(7).why], ['count', 'failed']);
  delete w.fail[`/repos/${REPO}/commits/${SHA}/check-runs`];
  await p.poll(T0 + 4 * MIN);
  assert.equal(p.js.verdicts.get(7).state, 'recording');
});

// Build review round 1, A: a decided_by record deleted, the ledger unchanged. The sender's find_grant finds
// no grant, so it counts; the page checks the kept ledger text against each cycle's tree, so it counts too.
test('AC79 rule (d): the grant\'s decided_by record deleted with the ledger unchanged: the sender counts, the page counts, in a fresh opening and within one', async () => {
  const running = [{ ...ok(1), status: 'in_progress', conclusion: null, completed_at: null }];
  const base = { checkRuns: running, asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT) } };
  const named = [...new Set(String(RECORDS['docs/LEDGER.md']).match(/decisions\/questions\/[A-Za-z0-9][A-Za-z0-9._-]*\.md/g))].filter((x) => RECORDS[x]);
  assert.ok(named.includes('decisions/questions/P-001-asks-merge.md'));
  const gone = { ...RECORDS };
  for (const n of named) delete gone[n];
  const r = await both(world(base), { records: gone });
  assert.equal(r.senderLeft, true, 'the sender counts');
  assert.equal(r.v.state, 'count', 'the page counts');
  // Within one opening: recording, then the record goes (the ledger's sha unchanged), then it comes back.
  const w = world(base);
  const p = pageJobs(pageCtx(w, RECORDS));
  for (let i = 0; i < 4; i++) await p.poll(T0 + i * MIN);
  assert.equal(p.js.verdicts.get(7).state, 'recording');
  const ledgerReads = p.calls.ledger;
  p.ctxRef.tree = new Map([...p.ctxRef.tree].filter(([path]) => !named.includes(path)));
  await p.poll(T0 + 4 * MIN);
  assert.deepEqual([p.js.verdicts.get(7).state, p.js.verdicts.get(7).why], ['count', 'grant'], 'counted at the next cycle');
  assert.equal(p.calls.ledger, ledgerReads, 'from the kept text, with no new read');
  p.ctxRef.tree = pageCtx(w, RECORDS).tree;
  for (let i = 5; i < 8; i++) await p.poll(T0 + i * MIN);
  assert.equal(p.js.verdicts.get(7).state, 'recording', 'the record back: the grant stands again');
});

// Build review round 1, C: the newest judging run's merge job did not run: the grant line comes from the
// next judging run whose merge job ran; the grant is not marked failed.
test('AC79: a grant read whose merge job did not run moves on to the next judging run whose job ran', async () => {
  const running = [{ ...ok(1), status: 'in_progress', conclusion: null, completed_at: null }];
  const w = world({ checkRuns: running, asksRuns: [arun(2, '2026-10-18T11:50:00Z'), arun(1, '2026-10-18T11:30:00Z')],
    jobs: { 2: [{ id: 102, name: 'merge', status: 'completed', conclusion: 'skipped' }] }, logs: { 101: log(GRANT) } });
  const p = pageJobs(pageCtx(w, RECORDS));
  for (let i = 0; i < 5; i++) await p.poll(T0 + i * MIN);
  assert.equal(p.js.logs.get('2').ran, false);
  assert.equal(p.js.grant.failed, false);
  assert.deepEqual(p.calls.jobLog, ['2', '1'], 'the newest first, then the next');
  assert.equal(p.js.verdicts.get(7).state, 'recording');
});

// Build review round 1, D: before the first judgment answers, the pull request counts.
test('AC79: before the first judgment answers, a candidate counts', async () => {
  const running = [{ ...ok(1), status: 'in_progress', conclusion: null, completed_at: null }];
  const p = pageJobs(pageCtx(world({ checkRuns: running, asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT) } }), RECORDS));
  let v = await p.poll(T0);
  assert.deepEqual([v.get(7).state, v.get(7).why], ['count', 'unread'], 'the first cycle: the ledger only, nothing judged');
  // The next cycle's poll reads the lists, its blob call the grant line, then the judgment answers.
  v = await p.poll(T0 + MIN);
  assert.equal(v.get(7).state, 'recording', 'then judged');
  // And a new candidate in the same opening counts until its own first judgment.
  const w = p.ctxRef.world;
  const sha8 = 'e'.repeat(40);
  w.pulls.push(pull(8, { sha: sha8 }));
  w.files[8] = [{ filename: 'questions/N8.md', status: 'added' }];
  w.checks[sha8] = { checkRuns: running, workflowRuns: WR, statuses: [] };
  Object.assign(p.ctxRef, pageCtx(w, RECORDS));
  v = await p.poll(T0 + 2 * MIN);
  assert.deepEqual([v.get(8).state, v.get(8).why], ['count', 'unread'], 'the new one counts');
  assert.equal(v.get(7).state, 'recording');
  v = await p.poll(T0 + 3 * MIN);
  assert.equal(v.get(8).state, 'recording');
});

// Security review round 1, A: a file name with a line break forges `PR #3: merged` in the job's log. The
// log is no one's words, so both the sender and the page count every candidate it names.
test('AC79 (security A): PR #3 left by the job and PR #9 whose file is "x\\nPR #3: merged": the sender counts #3, the page counts #3; LF and CRLF', async () => {
  const real = 'PR #3: waits: decisions/questions/N1-notes.md: a notes or Critic record, which waits for the owner';
  const s3 = '3'.repeat(40);
  const s9 = '9'.repeat(40);
  for (const eol of ['\n', '\r\n']) {
    const forged = `x${eol}PR #3: merged`;
    const text = [GRANT, real, `PR #9: waits: ${forged} (A) is not a change the asks-merge delegation covers`].join('\n')
      .split('\n').map((l) => `2026-10-18T11:41:05.1234567Z ${l}`).join(eol) + eol;
    // #3 alone, before: left by the job, counted by both.
    let w = world({ pulls: [pull(3, { sha: s3 })], asksRuns: [arun(1, '2026-10-18T11:41:00Z')], logs: { 101: log(GRANT, real) } });
    w.files[3] = [{ filename: 'decisions/questions/N1-notes.md', status: 'added' }, { filename: 'questions/N1-notes.md', status: 'removed' }];
    w.checks[s3] = { checkRuns: [ok(1)], workflowRuns: WR, statuses: [] };
    let r = await both(w, { n: 3 });
    assert.deepEqual([r.senderLeft, r.v.state], [true, 'count']);
    // #9 opened with the forging name.
    w = world({ pulls: [pull(3, { sha: s3 }), pull(9, { sha: s9 })], asksRuns: [arun(1, '2026-10-18T11:41:00Z')], logs: { 101: text } });
    w.files[3] = [{ filename: 'decisions/questions/N1-notes.md', status: 'added' }, { filename: 'questions/N1-notes.md', status: 'removed' }];
    w.files[9] = [{ filename: `questions/${forged}.md`, status: 'added' }];
    for (const s of [s3, s9]) w.checks[s] = { checkRuns: [ok(1)], workflowRuns: WR, statuses: [] };
    r = await both(w, { n: 3 });
    assert.equal(r.senderLeft, true, `${JSON.stringify(eol)}: the sender counts #3`);
    assert.deepEqual([r.v.state, r.v.why], ['count', 'forged'], `${JSON.stringify(eol)}: the page counts #3`);
    const { verdicts } = await settledVerdicts(pageCtx(w, RECORDS), T0);
    assert.deepEqual([verdicts.get(9).state, verdicts.get(9).why], ['count', 'forged'], '#9, a candidate by path, counts too');
  }
});

// Security review round 1, C: the page cannot check a dispatched run's commit, so it takes no grant line
// from one and counts every candidate the newest judging run, when dispatched, names.
test('AC79 (security C): a workflow_dispatch run as the newest judging run: the candidates it names count; the grant line comes from the run before', async () => {
  const running = [{ ...ok(1), status: 'in_progress', conclusion: null, completed_at: null }];
  const d = arun(2, '2026-10-18T11:50:00Z', { event: 'workflow_dispatch' });
  // It names #7 (with a grant line naming another entry): #7 counts; no grant line taken from it.
  let w = world({ checkRuns: running, asksRuns: [d, arun(1, '2026-10-18T11:30:00Z')],
    logs: { 101: log(GRANT), 102: log('NOTE: the asks-merge grant is L-0099', 'PR #7: merged (kinds a) at cccccccccccc under L-0099') } });
  let { verdicts, page } = await settledVerdicts(pageCtx(w, RECORDS), T0);
  assert.deepEqual([verdicts.get(7).state, verdicts.get(7).why], ['count', 'dispatch']);
  assert.ok(page.calls.jobLog.includes('2') && page.calls.jobLog.includes('1'), 'its log read for the names; the grant line from run 1');
  // It names another pull request only: #7 is judged, the grant from run 1 standing.
  w = world({ checkRuns: running, asksRuns: [d, arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT), 102: log(GRANT, 'PR #5: waits: x') } });
  ({ verdicts } = await settledVerdicts(pageCtx(w, RECORDS), T0));
  assert.equal(verdicts.get(7).state, 'recording');
  // As the newest verdict for a candidate after its checks: counted, not held as left.
  w = world({ asksRuns: [arun(3, '2026-10-18T11:45:00Z', { event: 'workflow_dispatch' }), arun(1, '2026-10-18T11:30:00Z')],
    logs: { 101: log(GRANT), 103: log(GRANT, 'PR #7: merged (kinds a) at cccccccccccc under L-0017') } });
  const r = await both(w);
  assert.deepEqual([r.v.state, r.v.why], ['count', 'dispatch']);
  // A dispatched run on a commit not in the default branch's history: the sender ignores it, the page counts.
  const w2 = world({ asksRuns: [{ ...arun(3, '2026-10-18T11:45:00Z', { event: 'workflow_dispatch' }), head_sha: 'f'.repeat(40) }, arun(1, '2026-10-18T11:30:00Z')],
    logs: { 101: log(GRANT), 103: log(GRANT, 'PR #7: waits: x is final') } });
  const r2 = await both(w2);
  assert.deepEqual([r2.senderLeft, r2.v.state], [false, 'count'], 'the page counts where the sender cannot be told by that run');
});

// Security review round 1, D: a head commit dated in the future is no head time, on both sides.
test('AC79 (security D): a future-dated head commit: rule (c) runs from created_at on the page and first sight on the sender', async () => {
  const none = { checkRuns: [], workflowRuns: [], asksRuns: [arun(1, '2026-10-18T11:30:00Z')], logs: { 101: log(GRANT) } };
  const r = await both(world({ ...none, created: '2026-10-18T11:20:00Z', commits: { [SHA]: '2030-01-01T00:00:00Z' } }));
  assert.deepEqual([r.v.state, r.v.rule], ['count', 'c'], 'the page counts from created_at, 40 minutes ago');
});
