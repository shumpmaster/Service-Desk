// join-test: S-001/J1 — GitHub REST → desk function (reader), with recorded GitHub responses:
// a two-page PR list, the 8-run check-run sample (Service-Desk main on 2026-10-06), a tree, a
// blob in both media types and a history read. Also the CI reduction rule.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pollProject, readBlobs, urlsFor, pageUrl, linkPage, BLOB_BATCH } from '../../src/lib/github.js';
import { reduceChecks, parseCheckRuns, parseTree, parseHistory } from '../../src/lib/records.js';
import { recorded, fakeFetch, SD, NOW } from './helpers.mjs';

const U = urlsFor(SD);
const branch = recorded('branch-main');
const head = JSON.parse(branch.body).commit;
const HEAD = head.sha;
const TREE = head.commit.tree.sha;
const pull1 = recorded('pulls-page1');
const pull2 = recorded('pulls-page2');
const checks = recorded('check-runs-e2ab9c5');
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
    (url, init, h) => (url === U.checks(HEAD) ? (etagMatch && h.get('If-None-Match') ? { status: 304, headers: { ETag: 'W/"c1"' } }
      : { status: 200, headers: { ETag: 'W/"c1"' }, body: checks.body }) : undefined),
    (url) => (url === U.tree(TREE) ? { status: 200, body: tree.body } : undefined),
  ];
}

test('J1 poll: the first read makes branch, PR pages, check runs and tree requests in order, with the headers', async () => {
  const f = fakeFetch(fullRoutes());
  const r = await pollProject({ project: SD, head: null, etags: {} }, deps(f));
  assert.equal(r.state, 'ok');
  assert.deepEqual(f.calls.map((c) => c.url), [U.branch, U.pulls, pageUrl(U.pulls, 2), U.checks(HEAD), U.tree(TREE)]);
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
  assert.equal(r.checks[0], checks.body);
  assert.equal(r.tree, tree.body);
  assert.equal(r.githubRequests, 5);
  assert.ok(Object.keys(r.etags).length <= 7);
});

test('J1 poll: a steady poll with every ETag answered 304 is exactly three requests per one-page list, state unchanged', async () => {
  const routes = [
    (url, init, h) => (url === U.branch && h.get('If-None-Match') === '"b"' ? { status: 304, headers: { ETag: '"b"' } } : undefined),
    (url, init, h) => (url === U.pulls && h.get('If-None-Match') === '"p"' ? { status: 304, headers: { ETag: '"p"' } } : undefined),
    (url, init, h) => (url === U.checks(HEAD) && h.get('If-None-Match') === '"c"' ? { status: 304, headers: { ETag: '"c"' } } : undefined),
  ];
  const f = fakeFetch(routes);
  const r = await pollProject({ project: SD, head: HEAD, etags: { [U.branch]: '"b"', [U.pulls]: '"p"', [U.checks(HEAD)]: '"c"' } }, deps(f));
  assert.equal(f.calls.length, 3);
  assert.equal(r.state, 'unchanged');
  assert.equal(r.tree, null);
  assert.deepEqual(r.pulls, [null]);
  assert.deepEqual(r.checks, [null]);
});

test('J1 poll: a 304 on page 1 still reads page 2 when the page holds its ETag (a 304 carries no Link)', async () => {
  const f = fakeFetch(fullRoutes({ etagMatch: true }));
  const etags = { [U.branch]: 'x', [U.pulls]: 'W/"p1"', [pageUrl(U.pulls, 2)]: 'W/"p2"', [U.checks(HEAD)]: 'W/"c1"' };
  const r = await pollProject({ project: SD, head: HEAD, etags }, deps(f));
  assert.deepEqual(f.calls.map((c) => c.url), [U.branch, U.pulls, pageUrl(U.pulls, 2), U.checks(HEAD)]);
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
    (url) => (url === U.checks(HEAD) ? { status: 200, body: checks.body } : undefined),
    (url) => (url === U.tree(TREE) ? { status: 200, body: tree.body } : undefined),
  ];
  const f = fakeFetch(routes);
  const r = await pollProject({ project: SD, head: null, etags: {} }, deps(f));
  assert.equal(r.state, 'partial');
  assert.equal(r.reason, 'too-many');
  assert.ok(!f.calls.some((c) => c.url === pageUrl(U.pulls, 4)));
  assert.ok(f.calls.length <= 8);
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

test('J1 poll: a 403 on check runs only leaves the project readable, CI "can\'t read checks"', async () => {
  const routes = fullRoutes();
  routes.unshift((url) => (url === U.checks(HEAD) ? { status: 403, body: '{"message":"Resource not accessible"}' } : undefined));
  const f = fakeFetch(routes);
  const r = await pollProject({ project: SD, head: null, etags: {} }, deps(f));
  assert.equal(r.state, 'ok');
  assert.equal(r.checksState, 'cant-read');
  assert.equal(r.tree, tree.body);
});

test('J1 poll (review N8): a 401 on check runs is the token failing — cant-read, reason token — not "can\'t read checks"', async () => {
  const routes = fullRoutes();
  routes.unshift((url) => (url === U.checks(HEAD) ? { status: 401, body: '{"message":"Bad credentials"}' } : undefined));
  const f = fakeFetch(routes);
  const r = await pollProject({ project: SD, head: null, etags: {} }, deps(f));
  assert.equal(r.state, 'cant-read');
  assert.equal(r.reason, 'token');
  assert.ok(!f.calls.some((c) => c.url === U.tree(TREE)), 'nothing more is read after the token fails');
  // A rate-limited 403 on check runs is still a rate limit, not "can't read checks".
  const g = fakeFetch([(url) => (url === U.checks(HEAD) ? { status: 403, headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': '30' }, body: '{}' } : undefined), ...fullRoutes()]);
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

test('J1 CI reduction: the 8-run sample of 2026-10-06 reduces to passing', () => {
  const { runs } = parseCheckRuns([checks.body]);
  assert.equal(runs.length, 8);
  assert.deepEqual(runs.map((r) => r.name).sort(), ['collect', 'commit', 'decide', 'governance', 'owner-signal', 'prepare (0)', 'record', 'session']);
  assert.equal(reduceChecks(runs), 'passing');
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

test('J1 tree: a truncated tree is detected by the page', () => {
  const t = parseTree(tree.body);
  assert.equal(t.truncated, false);
  assert.ok(t.blobs.has('queue/P-001-stop-6.md'));
  assert.equal(parseTree(JSON.stringify({ truncated: true, tree: [] })).truncated, true);
});
