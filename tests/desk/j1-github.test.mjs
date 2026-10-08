// join-test: S-001/J1 — GitHub REST → desk function (reader), with recorded GitHub responses:
// a two-page PR list, the workflow-run samples J1 quotes (recorded 2026-10-08; e2ab9c5's
// dispatch-only head among them), a tree, a blob in both media types and a history read. Also the
// CI reduction rule over workflow runs (AC29).
// ac-test: S-001/AC29
import test from 'node:test';
import assert from 'node:assert/strict';
import { pollProject, readBlobs, urlsFor, pageUrl, linkPage, BLOB_BATCH } from '../../src/lib/github.js';
import { reduceChecks, parseWorkflowRuns, reduceWorkflowRuns, parseTree, parseHistory } from '../../src/lib/records.js';
import { recorded, fakeFetch, SD, NOW } from './helpers.mjs';

const U = urlsFor(SD);
const branch = recorded('branch-main');
const head = JSON.parse(branch.body).commit;
const HEAD = head.sha;
const TREE = head.commit.tree.sha;
const pull1 = recorded('pulls-page1');
const pull2 = recorded('pulls-page2');
// The branch fixture's head is 4a24489; the workflow-run lists served at its 3a and 3b URLs are
// the ones recorded for e2ab9c5 (3a empty; 3b governance and orchestrator, both dispatch runs).
const runsPush = recorded('runs-e2ab9c5-push');
const runsDispatch = recorded('runs-e2ab9c5-dispatch');
const R3A = U.runs(HEAD, 'push');
const R3B = U.runs(HEAD, 'workflow_dispatch');
const tree = recorded('tree-e2ab9c5');
const deps = (f) => ({ token: 'test-read-token', fetch: f, now: () => NOW });

// The recorded list was read as state=all&per_page=2; serve its bodies at the URLs the function
// reads, with Link headers in GitHub's numeric-id form.
const nextLink = (n) => `<https://api.github.com/repositories/1398589166/pulls?state=open&per_page=100&page=${n}>; rel="next", <https://api.github.com/repositories/1398589166/pulls?state=open&per_page=100&page=9>; rel="last"`;

function fullRoutes({ etagMatch = false } = {}) {
  return [
    (url, init, h) => (url === U.branch ? (etagMatch && h.get('If-None-Match') ? { status: 304, headers: { ETag: branch.headers.etag } } : branch) : undefined),
    (url, init, h) => (url === U.pulls ? (etagMatch && h.get('If-None-Match') ? { status: 304, headers: { ETag: 'W/"p1"' } }
      : { status: 200, headers: { ETag: 'W/"p1"', Link: nextLink(2) }, body: pull1.body }) : undefined),
    (url, init, h) => (url === pageUrl(U.pulls, 2) ? (etagMatch && h.get('If-None-Match') ? { status: 304, headers: { ETag: 'W/"p2"' } }
      : { status: 200, headers: { ETag: 'W/"p2"' }, body: pull2.body }) : undefined),
    (url, init, h) => (url === R3A ? (etagMatch && h.get('If-None-Match') ? { status: 304, headers: { ETag: 'W/"ra"' } }
      : { status: 200, headers: { ETag: 'W/"ra"' }, body: runsPush.body }) : undefined),
    (url, init, h) => (url === R3B ? (etagMatch && h.get('If-None-Match') ? { status: 304, headers: { ETag: 'W/"rb"' } }
      : { status: 200, headers: { ETag: 'W/"rb"' }, body: runsDispatch.body }) : undefined),
    (url) => (url === U.tree(TREE) ? { status: 200, body: tree.body } : undefined),
  ];
}

test('J1 poll: the first read makes branch, PR pages, workflow runs (3a push, 3b dispatch) and tree requests in order, with the headers', async () => {
  const f = fakeFetch(fullRoutes());
  const r = await pollProject({ project: SD, head: null, etags: {} }, deps(f));
  assert.equal(r.state, 'ok');
  assert.equal(R3A, `https://api.github.com/repos/shumpmaster/Service-Desk/actions/runs?head_sha=${HEAD}&event=push&exclude_pull_requests=true&per_page=100`);
  assert.equal(R3B, `https://api.github.com/repos/shumpmaster/Service-Desk/actions/runs?head_sha=${HEAD}&event=workflow_dispatch&exclude_pull_requests=true&per_page=100`);
  assert.deepEqual(f.calls.map((c) => c.url), [U.branch, U.pulls, pageUrl(U.pulls, 2), R3A, R3B, U.tree(TREE)]);
  assert.ok(!f.calls.some((c) => c.url.includes('check-runs')), 'check runs are no longer read (AC29)');
  for (const c of f.calls) {
    assert.equal(c.headers.get('Authorization'), 'Bearer test-read-token');
    assert.equal(c.headers.get('Accept'), 'application/vnd.github+json');
    assert.equal(c.headers.get('X-GitHub-Api-Version'), '2022-11-28');
    assert.equal(c.headers.get('If-None-Match'), null);
    assert.ok(c.url.startsWith('https://api.github.com/repos/shumpmaster/Service-Desk/'));
  }
  assert.deepEqual(r.head, { sha: HEAD, treeSha: TREE, committedAt: head.commit.committer.date });
  assert.equal(r.pulls.length, 2);
  assert.equal(r.pulls[0], pull1.body); // raw text, unparsed
  assert.deepEqual(r.pullNext, [true, false]);
  assert.deepEqual(r.checks, [runsPush.body, runsDispatch.body], '3a\'s pages, then 3b\'s, raw');
  assert.deepEqual(r.checkUrls, [R3A, R3B]);
  assert.equal(r.tree, tree.body);
  assert.equal(r.githubRequests, 6);
  assert.ok(Object.keys(r.etags).length <= 10);
});

test('J1 poll: a steady poll with every ETag answered 304 is exactly four requests with one-page lists, state unchanged', async () => {
  const routes = [
    (url, init, h) => (url === U.branch && h.get('If-None-Match') === '"b"' ? { status: 304, headers: { ETag: '"b"' } } : undefined),
    (url, init, h) => (url === U.pulls && h.get('If-None-Match') === '"p"' ? { status: 304, headers: { ETag: '"p"' } } : undefined),
    (url, init, h) => (url === R3A && h.get('If-None-Match') === '"a"' ? { status: 304, headers: { ETag: '"a"' } } : undefined),
    (url, init, h) => (url === R3B && h.get('If-None-Match') === '"d"' ? { status: 304, headers: { ETag: '"d"' } } : undefined),
  ];
  const f = fakeFetch(routes);
  const r = await pollProject({ project: SD, head: HEAD, etags: { [U.branch]: '"b"', [U.pulls]: '"p"', [R3A]: '"a"', [R3B]: '"d"' } }, deps(f));
  assert.equal(f.calls.length, 4);
  assert.equal(r.state, 'unchanged');
  assert.equal(r.tree, null);
  assert.deepEqual(r.pulls, [null]);
  assert.deepEqual(r.checks, [null, null]);
});

test('J1 poll: a 304 on page 1 still reads page 2 when the page holds its ETag (a 304 carries no Link)', async () => {
  const f = fakeFetch(fullRoutes({ etagMatch: true }));
  const etags = { [U.branch]: 'x', [U.pulls]: 'W/"p1"', [pageUrl(U.pulls, 2)]: 'W/"p2"', [R3A]: 'W/"ra"', [R3B]: 'W/"rb"' };
  const r = await pollProject({ project: SD, head: HEAD, etags }, deps(f));
  assert.deepEqual(f.calls.map((c) => c.url), [U.branch, U.pulls, pageUrl(U.pulls, 2), R3A, R3B]);
  assert.equal(r.state, 'unchanged');
  assert.deepEqual(r.pulls, [null, null]);
});

test('J1 poll: a 4th page is never read; the poll says partial / too-many', async () => {
  const routes = [
    (url) => (url === U.branch ? branch : undefined),
    (url) => {
      for (const n of [1, 2, 3]) if (url === pageUrl(U.pulls, n)) return { status: 200, headers: { Link: nextLink(n + 1) }, body: '[]' };
      return undefined;
    },
    (url) => (url === R3A || url === R3B ? { status: 200, body: runsPush.body } : undefined),
    (url) => (url === U.tree(TREE) ? { status: 200, body: tree.body } : undefined),
  ];
  const f = fakeFetch(routes);
  const r = await pollProject({ project: SD, head: null, etags: {} }, deps(f));
  assert.equal(r.state, 'partial');
  assert.equal(r.reason, 'too-many');
  assert.ok(!f.calls.some((c) => c.url === pageUrl(U.pulls, 4)));
  assert.ok(f.calls.length <= 11);
});

test('J1 poll: each workflow-run list pages up to 3; a 4th page of 3b makes the poll partial; at most 11 requests', async () => {
  const runsLink = (base, n) => `<${pageUrl(base, n)}>; rel="next"`;
  const routes = [
    (url) => (url === U.branch ? branch : undefined),
    (url) => (url === U.pulls ? { status: 200, body: '[]' } : undefined),
    (url) => {
      for (const base of [R3A, R3B]) {
        for (const n of [1, 2, 3]) {
          if (url === pageUrl(base, n)) return { status: 200, headers: { Link: runsLink(base, n + 1) }, body: runsPush.body };
        }
      }
      return undefined;
    },
    (url) => (url === U.tree(TREE) ? { status: 200, body: tree.body } : undefined),
  ];
  const f = fakeFetch(routes);
  const r = await pollProject({ project: SD, head: null, etags: {} }, deps(f));
  assert.equal(r.state, 'partial');
  assert.equal(r.reason, 'too-many');
  assert.deepEqual(r.checkUrls, [R3A, pageUrl(R3A, 2), pageUrl(R3A, 3), R3B, pageUrl(R3B, 2), pageUrl(R3B, 3)]);
  assert.ok(!f.calls.some((c) => c.url.endsWith('&page=4')));
  assert.equal(f.calls.length, 9, 'branch, one PR page, 3 + 3 run pages, tree');
  assert.ok(f.calls.length <= 11);
});

test('J1 poll: the tree is read only when the head moved', async () => {
  const f = fakeFetch(fullRoutes());
  const r = await pollProject({ project: SD, head: HEAD, etags: {} }, deps(f));
  assert.equal(r.tree, null);
  assert.ok(!f.calls.some((c) => c.url.includes('/git/trees/')));
  const f2 = fakeFetch(fullRoutes());
  const r2 = await pollProject({ project: SD, head: '0'.repeat(40), etags: {} }, deps(f2));
  assert.equal(r2.tree, tree.body);
});

test('J1 poll: awkward cases map to J6 states and reasons, with no retry', async () => {
  const cases = [
    [{ status: 401, body: '{}' }, 'cant-read', 'token'],
    [{ status: 403, body: '{}' }, 'cant-read', 'token'],
    [{ status: 403, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(Math.floor(NOW / 1000) + 600) }, body: '{}' }, 'cant-read', 'rate-limit', 600],
    [{ status: 429, headers: { 'Retry-After': '120' }, body: '{}' }, 'cant-read', 'rate-limit', 120],
    [{ status: 404, body: '{}' }, 'cant-read', 'config'],
    [{ status: 502, body: 'bad gateway' }, 'cant-read', 'github'],
    ['throw', 'cant-read', 'github'],
  ];
  for (const [answer, state, reason, retryAfter] of cases) {
    const f = fakeFetch([(url) => (url === U.branch ? answer : undefined)]);
    const r = await pollProject({ project: SD, head: null, etags: {} }, deps(f));
    assert.equal(r.state, state, JSON.stringify(answer));
    assert.equal(r.reason, reason);
    assert.equal(f.calls.length, 1, 'never retried within an invocation');
    if (retryAfter) assert.equal(r.retryAfter, retryAfter);
    if (reason === 'config') assert.equal(r.words, 'default branch main not found');
  }
});

test('J1/AC29: a 403 on workflow runs only (the token lacks Actions: read) leaves the project readable, checksState cant-read', async () => {
  for (const which of [R3A, R3B]) {
    const routes = fullRoutes();
    routes.unshift((url) => (url === which ? { status: 403, body: '{"message":"Resource not accessible by personal access token"}' } : undefined));
    const f = fakeFetch(routes);
    const r = await pollProject({ project: SD, head: null, etags: {} }, deps(f));
    assert.equal(r.state, 'ok');
    assert.equal(r.checksState, 'cant-read');
    assert.deepEqual(r.checks, [], 'no run pages are passed on when either list was refused');
    assert.equal(r.tree, tree.body);
  }
});

test('J1 poll (review N8): a 401 on workflow runs is the token failing — cant-read, reason token — not "can\'t read CI"', async () => {
  const routes = fullRoutes();
  routes.unshift((url) => (url === R3A ? { status: 401, body: '{"message":"Bad credentials"}' } : undefined));
  const f = fakeFetch(routes);
  const r = await pollProject({ project: SD, head: null, etags: {} }, deps(f));
  assert.equal(r.state, 'cant-read');
  assert.equal(r.reason, 'token');
  assert.ok(!f.calls.some((c) => c.url === U.tree(TREE)), 'nothing more is read after the token fails');
  // A rate-limited 403 on workflow runs is still a rate limit, not "can't read CI".
  const g = fakeFetch([(url) => (url === R3B ? { status: 403, headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': '30' }, body: '{}' } : undefined), ...fullRoutes()]);
  const rl = await pollProject({ project: SD, head: null, etags: {} }, deps(g));
  assert.equal(rl.state, 'cant-read');
  assert.equal(rl.reason, 'rate-limit');
  assert.equal(rl.retryAfter, 30);
});

test('J1 blob call: raw media type, the JSON form decoded from base64, and both give the same text', async () => {
  const raw = recorded('blob-raw-stop-6');
  const json = recorded('blob-json-stop-6');
  const sha = JSON.parse(json.body).sha;
  for (const rec of [raw, json]) {
    const f = fakeFetch([(url) => (url === U.blob(sha) ? rec : undefined)]);
    const r = await readBlobs({ project: SD, blobs: [sha], history: [] }, deps(f));
    assert.equal(r.state, 'ok');
    assert.equal(f.calls[0].headers.get('Accept'), 'application/vnd.github.raw+json');
    assert.ok(r.blobs[sha].startsWith('# Decision card — P-001 stop-6'));
    assert.equal(r.blobs[sha], raw.body);
  }
});

test('J1 history: page 1, plus the rel="last" page when there is one; the oldest commit is the last page\'s last entry', async () => {
  const hq = recorded('history-question-Q-005');
  const path = 'questions/Q-005-sources.md';
  const base = U.history(path);
  assert.equal(base, 'https://api.github.com/repos/shumpmaster/Service-Desk/commits?path=questions%2FQ-005-sources.md&sha=main&per_page=100');
  // One page: one request.
  let f = fakeFetch([(url) => (url === base ? hq : undefined)]);
  let r = await readBlobs({ project: SD, blobs: [], history: [path] }, deps(f));
  assert.equal(f.calls.length, 1);
  let h = parseHistory(r.history[path]);
  assert.equal(h.oldest.toISOString(), '2026-10-01T11:48:24.000Z');
  // Two pages: the function fetches the last page, built from our own URL form.
  const page1 = JSON.parse(hq.body).slice(0, 1);
  const last = JSON.parse(hq.body).slice(1);
  f = fakeFetch([
    (url) => (url === base ? { status: 200, headers: { Link: `<https://api.github.com/repositories/1/commits?path=x&page=2>; rel="next", <https://api.github.com/repositories/1/commits?path=x&page=7>; rel="last"` }, body: JSON.stringify(page1) } : undefined),
    (url) => (url === pageUrl(base, 7) ? { status: 200, body: JSON.stringify(last) } : undefined),
  ]);
  r = await readBlobs({ project: SD, blobs: [], history: [path] }, deps(f));
  assert.equal(f.calls.length, 2);
  h = parseHistory(r.history[path]);
  assert.equal(h.newest.toISOString(), '2026-10-01T12:03:07.000Z');
  assert.equal(h.oldest.toISOString(), '2026-10-01T11:48:24.000Z');
});

test('J1 blob call: at most 25 requests and at most six waiting at once; a failure stops new requests', async () => {
  const shas = Array.from({ length: BLOB_BATCH }, (_, i) => (i + 1).toString(16).padStart(40, 'a'));
  const f = fakeFetch([(url) => (url.includes('/git/blobs/') ? { status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'x' } : undefined)]);
  const r = await readBlobs({ project: SD, blobs: shas, history: [] }, deps(f));
  assert.equal(r.state, 'ok');
  assert.equal(f.calls.length, 25);
  assert.ok(f.maxInFlight <= 6, `in flight ${f.maxInFlight}`);
  const g = fakeFetch([(url) => (url.includes('/git/blobs/') ? { status: 403, headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': '60' }, body: '{}' } : undefined)]);
  const r2 = await readBlobs({ project: SD, blobs: shas, history: [] }, deps(g));
  assert.equal(r2.state, 'cant-read');
  assert.equal(r2.reason, 'rate-limit');
  assert.ok(g.calls.length <= 6, `stopped after the first wave (${g.calls.length})`);
});

test('J1 Link parsing', () => {
  assert.equal(linkPage(pull1.headers.link, 'next'), 2);
  assert.equal(linkPage(pull1.headers.link, 'last'), 18);
  assert.equal(linkPage('', 'next'), null);
});

const runsOf = (...names) => parseWorkflowRuns(names.map((n) => recorded(n).body)).runs;

test('J1/AC29 CI from workflow runs: the real samples of 2026-10-08 reduce as J1 says', () => {
  // e2ab9c5, a head the Orchestrator made: 3a lists nothing, 3b governance and orchestrator.
  let red = reduceWorkflowRuns(runsOf('runs-e2ab9c5-push', 'runs-e2ab9c5-dispatch'));
  assert.equal(red.ci, 'passing', 'passing from governance\'s dispatch run');
  assert.equal(red.governance.runNumber, 292);
  assert.equal(red.governance.event, 'workflow_dispatch');
  assert.deepEqual(red.activity.map((a) => a.text), ['Orchestrator run: success']);
  // With a push filter alone, CI would have read none.
  assert.equal(reduceWorkflowRuns(runsOf('runs-e2ab9c5-push')).ci, 'none');
  // 38722d3 (main): governance push run only.
  red = reduceWorkflowRuns(runsOf('runs-38722d3-push', 'runs-38722d3-dispatch'));
  assert.equal(red.ci, 'passing');
  assert.deepEqual(red.activity, []);
  // bbd7abc (PR #40's merge): desk-build and governance count; the deploy is activity.
  red = reduceWorkflowRuns(runsOf('runs-bbd7abc-push', 'runs-bbd7abc-dispatch'));
  assert.equal(red.ci, 'passing');
  assert.deepEqual([...red.latest.keys()].sort(), ['.github/workflows/desk-build.yml', '.github/workflows/desk-deploy.yml', '.github/workflows/governance.yml']);
  assert.deepEqual(red.activity.map((a) => a.text), [`deploy ${'bbd7abc'}: deployed`]);
  // 98cfcb4: a failed Orchestrator run is activity and never colours CI.
  red = reduceWorkflowRuns(runsOf('runs-98cfcb4-push'));
  assert.equal(red.ci, 'passing');
  assert.deepEqual(red.activity.map((a) => a.text), ['Orchestrator run: failure']);
});

test('J1/AC29: Personal-Org-Operating-Model at 677fe5a — ci, push, success — reads passing', () => {
  // The repository is private, so no recorded body is copied; this is the run J1 quotes, in
  // GitHub's list form.
  const page = JSON.stringify({ total_count: 1, workflow_runs: [{ path: '.github/workflows/ci.yml', name: 'ci', event: 'push',
    status: 'completed', conclusion: 'success', run_number: 40, head_sha: '677fe5aea13b05ec4c29ba583bda87d56794e22f' }] });
  assert.equal(reduceWorkflowRuns(parseWorkflowRuns([page, JSON.stringify({ total_count: 0, workflow_runs: [] })]).runs).ci, 'passing');
});

function run(path, runNumber, status, conclusion, extra = {}) {
  return { path, name: path, event: 'workflow_dispatch', status, conclusion, run_number: runNumber, head_sha: 'a'.repeat(40), ...extra };
}
const pageOf = (...runs) => JSON.stringify({ total_count: runs.length, workflow_runs: runs });

test('J1/AC29: only the latest run per workflow counts; a failing governance dispatch run reads failing', () => {
  const gov = '.github/workflows/governance.yml';
  // Failed, then passed on a later run: passing. Passed, then failed: failing.
  assert.equal(reduceWorkflowRuns(parseWorkflowRuns([pageOf(run(gov, 10, 'completed', 'failure'), run(gov, 11, 'completed', 'success'))]).runs).ci, 'passing');
  const red = reduceWorkflowRuns(parseWorkflowRuns([pageOf(), pageOf(run(gov, 12, 'completed', 'failure'), run(gov, 11, 'completed', 'success'))]).runs);
  assert.equal(red.ci, 'failing', 'a failing governance dispatch run on the head');
  assert.equal(red.governance.runNumber, 12);
  // Order on the page doesn't matter; 3a and 3b are read together.
  assert.equal(reduceWorkflowRuns(parseWorkflowRuns([pageOf(run(gov, 12, 'in_progress', null, { event: 'push' })), pageOf(run(gov, 11, 'completed', 'failure'))]).runs).ci, 'running');
});

test('J1/AC29: desk-deploy waiting and rejected runs, and a failed Orchestrator run, are activity — never CI', () => {
  const dd = '.github/workflows/desk-deploy.yml';
  const orch = '.github/workflows/orchestrator.yml';
  const ok = run('.github/workflows/governance.yml', 3, 'completed', 'success');
  let red = reduceWorkflowRuns(parseWorkflowRuns([pageOf(ok, run(dd, 4, 'waiting', null, { head_sha: '1b4c2031'.padEnd(40, '0') }), run(orch, 9, 'completed', 'failure'))]).runs);
  assert.equal(red.ci, 'passing', 'a waiting deploy is not "running" and a failed Orchestrator run is not "failing"');
  assert.deepEqual(red.activity.map((a) => a.text).sort(), ['Orchestrator run: failure', 'deploy 1b4c203: waiting for approval']);
  red = reduceWorkflowRuns(parseWorkflowRuns([pageOf(ok, run(dd, 5, 'completed', 'failure', { head_sha: 'b'.repeat(40) }))]).runs);
  assert.equal(red.ci, 'passing');
  assert.deepEqual(red.activity.map((a) => a.text), ['deploy bbbbbbb: failed or rejected']);
  // With only activity runs on the head, CI is none.
  assert.equal(reduceWorkflowRuns(parseWorkflowRuns([pageOf(run(dd, 5, 'completed', 'success'))]).runs).ci, 'none');
});

test('J1 CI reduction rule, case by case', () => {
  const r = (status, conclusion) => ({ status, conclusion });
  for (const bad of ['failure', 'timed_out', 'action_required', 'startup_failure']) {
    assert.equal(reduceChecks([r('completed', 'success'), r('completed', bad), r('in_progress', null)]), 'failing');
  }
  assert.equal(reduceChecks([r('completed', 'success'), r('queued', null)]), 'running');
  assert.equal(reduceChecks([r('completed', 'success'), r('completed', 'cancelled'), r('completed', 'stale'), r('completed', 'neutral')]), 'passing');
  assert.equal(reduceChecks([]), 'none');
  assert.equal(reduceChecks([r('completed', 'skipped'), r('completed', 'cancelled')]), 'none');
});

test('J1: workflow-run pages that are not run lists are named in notes, never thrown', () => {
  const { runs, notes } = parseWorkflowRuns(['not json', '{"message":"x"}', pageOf({ path: 3 }), null]);
  assert.deepEqual(runs, []);
  assert.equal(notes.length, 3);
});

test('J1 tree: a truncated tree is detected by the page', () => {
  const t = parseTree(tree.body);
  assert.equal(t.truncated, false);
  assert.ok(t.blobs.has('queue/P-001-stop-6.md'));
  assert.equal(parseTree(JSON.stringify({ truncated: true, tree: [] })).truncated, true);
});
