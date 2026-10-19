// join-test: S-001/J6 — desk page ↔ desk function: request checks, bodies, refusals and the cost field.
// join-test: S-001/J8 — Cloudflare Access → desk function: the JWT check on every request.
// ac-test: S-001/AC13 — without a valid Access JWT for the owner the function answers 403 and makes
// no GitHub call; a POST without a JSON content type, or with a foreign Origin, is refused.
import test from 'node:test';
import assert from 'node:assert/strict';
import { handle, jobsPart } from '../../src/lib/api.js';
import { _resetKeyCache, accessSettings } from '../../src/lib/access.js';
import { urlsFor } from '../../src/lib/github.js';
import { onRequest as pollFn } from '../../src/functions/api/poll.js';
import { onRequest as blobsFn } from '../../src/functions/api/blobs.js';
import { makeKey, signJwt, goodClaims, certsRoute, request, fakeFetch, ENV, NOW, SD, recorded } from './helpers.mjs';

const key = await makeKey('kid-1');
const otherKey = await makeKey('kid-1'); // same kid, different key: a wrong signature
const U = urlsFor(SD);
const branch = recorded('branch-main');

function githubCalls(f) {
  return f.calls.filter((c) => c.url.startsWith('https://api.github.com/'));
}
function steadyRoutes() {
  return [
    certsRoute([key]),
    (url) => (url === U.branch ? branch : undefined),
    (url) => (url.startsWith(U.pulls) ? { status: 200, body: '[]' } : undefined),
    (url) => (url.includes('/actions/runs?') ? { status: 200, body: '{"total_count":0,"workflow_runs":[]}' } : undefined),
    (url) => (url.includes('/git/trees/') ? { status: 200, body: '{"tree":[],"truncated":false}' } : undefined),
  ];
}
async function call(kind, req, f) {
  return handle({ request: req, env: ENV }, kind, { fetch: f, now: () => NOW });
}

test('AC13/J8: no JWT, expired, wrong audience, wrong signature, another email or a bad algorithm → 403, no GitHub call', async () => {
  _resetKeyCache();
  const cases = {
    missing: null,
    expired: await signJwt(key, goodClaims({ exp: Math.floor(NOW / 1000) - 1 })),
    'wrong audience': await signJwt(key, goodClaims({ aud: ['someone-else'] })),
    'wrong signature': await signJwt(otherKey, goodClaims()),
    'another email': await signJwt(key, goodClaims({ email: 'intruder@example.com' })),
    'no email (a service token)': await signJwt(key, goodClaims({ email: undefined, common_name: 'svc' })),
    'alg none': (await signJwt(key, goodClaims(), { alg: 'none' })),
    garbage: 'not.a.jwt',
  };
  for (const [name, jwt] of Object.entries(cases)) {
    for (const kind of ['poll', 'blobs']) {
      const f = fakeFetch(steadyRoutes());
      const res = await call(kind, request(`/api/${kind}`, { jwt, body: { project: 'Service-Desk', head: null, etags: {}, blobs: [], history: [] } }), f);
      assert.equal(res.status, 403, `${name} (${kind})`);
      assert.equal(githubCalls(f).length, 0, `${name}: no GitHub call`);
      assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
    }
  }
});

test('J8 (review N1): a token not valid until two minutes from now (nbf = now + 120) → 403, no GitHub call; nbf within the 60 s skew passes', async () => {
  _resetKeyCache();
  const nowSec = Math.floor(NOW / 1000);
  const body = { project: 'Service-Desk', head: null, etags: {} };
  const f = fakeFetch(steadyRoutes());
  const res = await call('poll', request('/api/poll', { jwt: await signJwt(key, goodClaims({ nbf: nowSec + 120 })), body }), f);
  assert.equal(res.status, 403);
  assert.equal(f.calls.length, 0, 'refused on the claims, before any key fetch or GitHub call');
  const g = fakeFetch(steadyRoutes());
  const ok = await call('poll', request('/api/poll', { jwt: await signJwt(key, goodClaims({ nbf: nowSec + 30 })), body }), g);
  assert.equal(ok.status, 200);
});

test('J8 (review N9): iss must equal https:// + ACCESS_TEAM_DOMAIN; another team, http, a missing iss → 403', async () => {
  _resetKeyCache();
  const body = { project: 'Service-Desk', head: null, etags: {} };
  const bad = {
    'another team': 'https://other.cloudflareaccess.com',
    'http scheme': 'http://team.cloudflareaccess.com',
    'trailing slash': 'https://team.cloudflareaccess.com/',
    'bare host': 'team.cloudflareaccess.com',
    missing: undefined,
  };
  for (const [name, iss] of Object.entries(bad)) {
    const f = fakeFetch(steadyRoutes());
    const res = await call('poll', request('/api/poll', { jwt: await signJwt(key, goodClaims({ iss })), body }), f);
    assert.equal(res.status, 403, name);
    assert.equal(githubCalls(f).length, 0, `${name}: no GitHub call`);
  }
  const f = fakeFetch(steadyRoutes());
  const ok = await call('poll', request('/api/poll', { jwt: await signJwt(key, goodClaims({ iss: 'https://team.cloudflareaccess.com' })), body }), f);
  assert.equal(ok.status, 200);
});

test('AC33/J8: ACCESS_TEAM_DOMAIN with capitals and a trailing space is trimmed and lowercased; another team is still refused', async () => {
  // ac-test: S-001/AC33
  _resetKeyCache();
  const env = { ...ENV, ACCESS_TEAM_DOMAIN: ' Team.CloudflareAccess.COM ' };
  assert.equal(accessSettings(env).team, 'team.cloudflareaccess.com');
  const body = { project: 'Service-Desk', head: null, etags: {} };
  const f = fakeFetch(steadyRoutes());
  const ok = await handle({ request: request('/api/poll', { jwt: await signJwt(key, goodClaims()), body }), env }, 'poll', { fetch: f, now: () => NOW });
  assert.equal(ok.status, 200, 'the owner\'s valid session is accepted');
  assert.ok(f.calls.some((c) => c.url === 'https://team.cloudflareaccess.com/cdn-cgi/access/certs'), 'keys from the lowercased team');
  for (const iss of ['https://other.cloudflareaccess.com', 'https://Team.CloudflareAccess.COM ']) {
    const g = fakeFetch(steadyRoutes());
    const no = await handle({ request: request('/api/poll', { jwt: await signJwt(key, goodClaims({ iss })), body }), env }, 'poll', { fetch: g, now: () => NOW });
    assert.equal(no.status, 403, iss);
    assert.equal(githubCalls(g).length, 0);
  }
});

test('AC13/J8: any method other than POST is refused too, and without a JWT it is 403 first', async () => {
  _resetKeyCache();
  const jwt = await signJwt(key, goodClaims());
  for (const method of ['GET', 'PUT', 'DELETE', 'PATCH']) {
    const f = fakeFetch(steadyRoutes());
    assert.equal((await call('poll', request('/api/poll', { method }), f)).status, 403);
    const res = await call('poll', request('/api/poll', { method, jwt }), f);
    assert.equal(res.status, 405, method);
    assert.equal(githubCalls(f).length, 0);
  }
});

test('AC13/J6: a POST without Content-Type application/json → 415; a foreign Origin → 403; the same origin passes', async () => {
  _resetKeyCache();
  const jwt = await signJwt(key, goodClaims());
  const body = { project: 'Service-Desk', head: null, etags: {} };
  for (const ct of [null, 'text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data']) {
    const f = fakeFetch(steadyRoutes());
    const res = await call('poll', request('/api/poll', { jwt, contentType: ct, body }), f);
    assert.equal(res.status, 415, String(ct));
    assert.equal(githubCalls(f).length, 0);
  }
  for (const origin of ['https://evil.example', 'http://service-desk-preview.pages.dev', 'https://service-desk-preview.pages.dev:8443', 'null']) {
    const f = fakeFetch(steadyRoutes());
    const res = await call('poll', request('/api/poll', { jwt, origin, body }), f);
    assert.equal(res.status, 403, origin);
    assert.equal(githubCalls(f).length, 0);
  }
  const f = fakeFetch(steadyRoutes());
  const ok = await call('poll', request('/api/poll', { jwt, origin: 'https://service-desk-preview.pages.dev', contentType: 'application/json; charset=utf-8', body }), f);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(ok.headers.get('Cache-Control'), 'no-store');
  const json = await ok.json();
  assert.equal(json.state, 'ok');
  assert.equal(json.project, 'Service-Desk');
  assert.ok(json.cost.github >= 4 && json.cost.github <= 11);
  assert.ok(json.cost.bytes > 0);
});

test('J8: ACCESS_AUD holds one or more comma-separated tags; spaces are trimmed; email compares without case', async () => {
  _resetKeyCache();
  assert.deepEqual(accessSettings({ ...ENV, ACCESS_AUD: ' aud-a , aud-tag-1 ,' }).auds, ['aud-a', 'aud-tag-1']);
  const env = { ...ENV, ACCESS_AUD: 'aud-preview, aud-tag-1', OWNER_EMAIL: 'Owner@Example.com' };
  const jwt = await signJwt(key, goodClaims({ aud: 'aud-tag-1' }));
  const f = fakeFetch(steadyRoutes());
  const res = await handle({ request: request('/api/poll', { jwt, body: { project: 'Service-Desk', head: null } }), env }, 'poll', { fetch: f, now: () => NOW });
  assert.equal(res.status, 200);
  // Missing settings refuse everything.
  for (const k of ['OWNER_EMAIL', 'ACCESS_TEAM_DOMAIN', 'ACCESS_AUD']) {
    const g = fakeFetch(steadyRoutes());
    const r = await handle({ request: request('/api/poll', { jwt, body: { project: 'Service-Desk' } }), env: { ...env, [k]: '' } }, 'poll', { fetch: g, now: () => NOW });
    assert.equal(r.status, 403, k);
    assert.equal(g.calls.length, 0);
  }
});

test('J8: the keys are fetched once and kept by the isolate; a new key id refetches once, then 403', async () => {
  _resetKeyCache();
  const jwt = await signJwt(key, goodClaims());
  const body = { project: 'Service-Desk', head: null, etags: {} };
  const f = fakeFetch(steadyRoutes());
  await call('poll', request('/api/poll', { jwt, body }), f);
  await call('poll', request('/api/poll', { jwt, body }), f);
  assert.equal(f.calls.filter((c) => c.url.endsWith('/cdn-cgi/access/certs')).length, 1);
  // Rotation: a token with a key id the isolate doesn't hold.
  const rotated = await makeKey('kid-2');
  const g = fakeFetch([certsRoute([key, rotated]), ...steadyRoutes().slice(1)]);
  const ok = await call('poll', request('/api/poll', { jwt: await signJwt(rotated, goodClaims()), body }), g);
  assert.equal(ok.status, 200);
  assert.equal(g.calls.filter((c) => c.url.endsWith('/cdn-cgi/access/certs')).length, 1);
  const unknown = await makeKey('kid-3');
  const h = fakeFetch([certsRoute([key, rotated]), ...steadyRoutes().slice(1)]);
  const no = await call('poll', request('/api/poll', { jwt: await signJwt(unknown, goodClaims()), body }), h);
  assert.equal(no.status, 403);
  assert.equal(h.calls.length, 1, 'one refetch, then 403, no GitHub call');
});

test('J6: refusals (400): unknown project, bad sha, bad history path, budget over 25, bad etags', async () => {
  _resetKeyCache();
  const jwt = await signJwt(key, goodClaims());
  const sha = 'a'.repeat(40);
  const bad = [
    ['blobs', { project: 'Nope', blobs: [sha], history: [] }],
    ['blobs', { project: 'Service-Desk', blobs: ['abc'], history: [] }],
    ['blobs', { project: 'Service-Desk', blobs: ['A'.repeat(40)], history: [] }],
    ['blobs', { project: 'Service-Desk', blobs: [], history: ['status/P-001.toml'] }],
    ['blobs', { project: 'Service-Desk', blobs: [], history: ['questions/../x.md'] }],
    ['blobs', { project: 'Service-Desk', blobs: Array.from({ length: 26 }, (_, i) => i.toString(16).padStart(40, 'b')), history: [] }],
    ['blobs', { project: 'Service-Desk', blobs: Array.from({ length: 22 }, (_, i) => i.toString(16).padStart(40, 'b')), history: ['questions/a.md', 'questions/b.md'] }],
    ['poll', { project: 'Nope', head: null }],
    ['poll', { project: 'Service-Desk', head: 'xyz' }],
    ['poll', { project: 'Service-Desk', head: null, etags: Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`u${i}`, 'e'])) }],
    ['poll', { project: 'Service-Desk', head: null, etags: { u: 'e'.repeat(3100) } }],
    // From M2 (AC46, AC47): history paths for hold cards only; compare pairs of 40 lowercase hex.
    ['blobs', { project: 'Service-Desk', blobs: [], history: ['queue/ci-hold-ABCDEF123456.md'] }],
    ['blobs', { project: 'Service-Desk', blobs: [], history: ['queue/ci-hold-abc.md'] }],
    ['blobs', { project: 'Service-Desk', blobs: [], history: ['queue/P-001-merge-conflict.md'] }],
    ['blobs', { project: 'Service-Desk', blobs: [], history: [], compare: [{ base: sha, head: 'B'.repeat(40) }] }],
    ['blobs', { project: 'Service-Desk', blobs: [], history: [], compare: [{ base: 'main', head: sha }] }],
    ['blobs', { project: 'Service-Desk', blobs: [], history: [], compare: [{ base: sha }] }],
    ['blobs', { project: 'Service-Desk', blobs: [], history: [], compare: [`${sha}...${sha}`] }],
    ['blobs', { project: 'Service-Desk', blobs: [], history: [], compare: { base: sha, head: sha } }],
    ['blobs', { project: 'Service-Desk', blobs: Array.from({ length: 24 }, (_, i) => i.toString(16).padStart(40, 'b')), history: [],
      compare: [{ base: sha, head: 'c'.repeat(40) }, { base: 'd'.repeat(40), head: 'c'.repeat(40) }] }],
  ];
  for (const [kind, body] of bad) {
    const f = fakeFetch(steadyRoutes());
    const res = await call(kind, request(`/api/${kind}`, { jwt, body }), f);
    assert.equal(res.status, 400, JSON.stringify(body).slice(0, 80));
    assert.equal(githubCalls(f).length, 0);
  }
  const f = fakeFetch(steadyRoutes());
  const res = await call('blobs', request('/api/blobs', { jwt, body: 'not json' }), f);
  assert.equal(res.status, 400);
});

test('J6: a blob call within the budget (1 per blob, 2 per history path) returns blobs and history by key', async () => {
  _resetKeyCache();
  const jwt = await signJwt(key, goodClaims());
  const shas = Array.from({ length: 21 }, (_, i) => i.toString(16).padStart(40, 'c'));
  const f = fakeFetch([certsRoute([key]),
    (url) => (url.includes('/git/blobs/') ? { status: 200, headers: { 'Content-Type': 'text/plain' }, body: `blob ${url.slice(-40)}` } : undefined),
    (url) => (url.includes('/commits?path=') ? { status: 200, body: '[]' } : undefined)]);
  const res = await call('blobs', request('/api/blobs', { jwt, body: { project: 'Service-Desk', blobs: shas, history: ['questions/a.md', 'decisions/questions/a.md'] } }), f);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.state, 'ok');
  assert.equal(json.blobs[shas[0]], `blob ${shas[0]}`);
  assert.deepEqual(json.history['questions/a.md'], ['[]']);
  assert.equal(json.cost.github, 23);
});

test('J6 (M2): hold-card history paths are accepted; each compare counts 1; the answer is keyed base...head, cut to its status (N1)', async () => {
  _resetKeyCache();
  const jwt = await signJwt(key, goodClaims());
  const ahead = recorded('compare-ahead');
  const diverged = recorded('compare-diverged');
  const tipA = 'a'.repeat(40);
  const tipB = 'b'.repeat(40);
  const tipC = 'e'.repeat(40);
  const head = 'c'.repeat(40);
  const f = fakeFetch([certsRoute([key]),
    (url) => (url === U.compare(tipA, head) ? ahead : undefined),
    (url) => (url === U.compare(tipB, head) ? diverged : undefined),
    (url) => (url === U.compare(tipC, head) ? { status: 404, body: '{"message":"Not Found"}' } : undefined),
    (url) => (url.includes('/commits?path=') ? { status: 200, body: '[]' } : undefined),
    (url) => (url.includes('/git/blobs/') ? { status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'x' } : undefined)]);
  const shas = Array.from({ length: 20 }, (_, i) => i.toString(16).padStart(40, 'f'));
  const res = await call('blobs', request('/api/blobs', { jwt, body: { project: 'Service-Desk', blobs: shas,
    history: ['queue/ci-hold-0123456789ab.md'], compare: [{ base: tipA, head }, { base: tipB, head }, { base: tipC, head }] } }), f);
  assert.equal(res.status, 200, 'budget 20 + 2 + 3 = 25');
  assert.equal(U.compare(tipA, head), `https://api.github.com/repos/shumpmaster/Service-Desk/compare/${tipA}...${head}?per_page=1`);
  const json = await res.json();
  assert.equal(json.state, 'ok', 'a failed compare is a null answer, not a failed call');
  assert.deepEqual(json.history['queue/ci-hold-0123456789ab.md'], ['[]']);
  assert.equal(JSON.parse(json.compare[`${tipA}...${head}`]).status, 'ahead');
  assert.equal(JSON.parse(json.compare[`${tipB}...${head}`]).status, 'diverged');
  assert.equal(json.compare[`${tipC}...${head}`], null);
  // N1: the files with their patches (and the commit list) are not passed on.
  const kept = json.compare[`${tipB}...${head}`];
  assert.equal(kept.includes('"files"'), false);
  assert.equal(kept.includes('"commits"'), false);
  assert.ok(kept.length < 200, `${kept.length} bytes`);
  assert.ok(diverged.body.length > 20000, 'the recorded answer itself is large');
  assert.ok(json.cost.bytes < 3000, `cost.bytes ${json.cost.bytes}`);
  // A rate-limited compare stops the call, as any read does.
  const g = fakeFetch([certsRoute([key]), (url) => (url.includes('/compare/') ? { status: 429, headers: { 'Retry-After': '30' }, body: '{}' } : undefined)]);
  const rl = await (await call('blobs', request('/api/blobs', { jwt, body: { project: 'Service-Desk', compare: [{ base: tipA, head }] } }), g)).json();
  assert.equal(rl.state, 'cant-read');
  assert.equal(rl.reason, 'rate-limit');
});

test('J6: the Pages Functions route to the handler (file-based routing: functions/api/poll.js and blobs.js)', async () => {
  _resetKeyCache();
  for (const fn of [pollFn, blobsFn]) {
    const res = await fn({ request: request('/api/poll', {}), env: ENV });
    assert.equal(res.status, 403); // no JWT: refused before anything else
  }
});

// ---------------------------------------------------------------------------
// From 2026-10-19 (AC79): the poll call's optional `jobs` part, and the blob call's `commitTime` and `jobLog`.

const HEADS = ['1', '2', '3', '4', '5', '6'].map((c) => c.repeat(40));
const jobsRoutes = (extra = []) => [
  ...extra,
  ...steadyRoutes(),
  (url) => (/\/commits\/[0-9a-f]{40}\/check-runs\?per_page=100$/.test(url) ? { status: 200, headers: { ETag: '"cr"' }, body: '{"total_count":0,"check_runs":[]}' } : undefined),
  (url) => (/\/commits\/[0-9a-f]{40}\/statuses\?per_page=100$/.test(url) ? { status: 200, headers: { ETag: '"st"' }, body: '[]' } : undefined),
];

test('J6 (AC79): a malformed jobs part, and a sixth head, are answered null, the poll\'s other parts intact and the project read', async () => {
  _resetKeyCache();
  const jwt = await signJwt(key, goodClaims());
  for (const jobs of [42, { heads: 'x' }, { heads: [{ sha: 'nope' }] }, { runs: { etag: 7 } }, { other: true }, { heads: [{ sha: HEADS[0], etags: { files: 'x' } }] }]) {
    const f = fakeFetch(jobsRoutes());
    const res = await call('poll', request('/api/poll', { jwt, body: { project: 'Service-Desk', head: null, etags: {}, jobs } }), f);
    assert.equal(res.status, 200, JSON.stringify(jobs));
    const body = await res.json();
    assert.equal(body.state, 'ok');
    assert.equal(body.jobs, null, `${JSON.stringify(jobs)}: answered null, never refused`);
    assert.ok(body.head && body.tree != null, 'the core reads intact');
    assert.ok(!githubCalls(f).some((c) => /check-runs|statuses|asks-merge/.test(c.url)), 'nothing of the part read');
  }
  // A sixth head: the first five read, the sixth answered null.
  const f = fakeFetch(jobsRoutes());
  const res = await call('poll', request('/api/poll', { jwt, body: { project: 'Service-Desk', head: null, etags: {}, jobs: { heads: HEADS.map((sha) => ({ sha })) } } }), f);
  const body = await res.json();
  assert.equal(body.state, 'ok');
  assert.deepEqual(Object.keys(body.jobs.heads).sort(), [...HEADS].sort());
  assert.equal(body.jobs.heads[HEADS[5]], null);
  for (const sha of HEADS.slice(0, 5)) assert.equal(typeof body.jobs.heads[sha].checkRuns, 'string');
  // A v2.5 project's part is malformed (no asks-merge job there).
  assert.equal(jobsPart({ heads: [{ sha: HEADS[0] }] }, { model: 'v2.5' }), null);
  assert.deepEqual(jobsPart({ heads: [{ sha: HEADS[0] }, { sha: HEADS[0] }] }, SD).heads.length, 1, 'a head named twice is read once');
});

test('J6 (AC79): each conditional list answered 304 as null with its ETag; a failed one false; a next page named; no redirect followed', async () => {
  _resetKeyCache();
  const jwt = await signJwt(key, goodClaims());
  const sha = HEADS[0];
  const f = fakeFetch(jobsRoutes([
    (url, init, h) => (url.endsWith('/actions/workflows/asks-merge.yml/runs?per_page=30') ? (h.get('If-None-Match') === '"runs"' ? { status: 304, headers: { ETag: '"runs"' } } : { status: 200, headers: { ETag: '"runs"' }, body: '{"workflow_runs":[]}' }) : undefined),
    (url, init, h) => (url === `${U.checkRuns(sha)}` && h.get('If-None-Match') === '"cr"' ? { status: 304, headers: { ETag: '"cr"' } } : undefined),
    (url) => (url === U.statuses(sha) ? { status: 200, headers: { ETag: '"st2"', Link: `<${U.statuses(sha)}&page=2>; rel="next"` }, body: '[]' } : undefined),
    (url) => (url === U.workflowRuns(sha) ? { status: 301, headers: { Location: 'https://api.github.com/repositories/1/actions/runs' } } : undefined),
  ]));
  const res = await call('poll', request('/api/poll', { jwt, body: { project: 'Service-Desk', head: null, etags: {},
    jobs: { runs: { etag: '"runs"' }, heads: [{ sha, etags: { checkRuns: '"cr"' } }] } } }), f);
  const body = await res.json();
  assert.equal(body.jobs.runs, null, '304: null');
  assert.equal(body.jobs.etags.runs, '"runs"');
  assert.equal(body.jobs.heads[sha].checkRuns, null);
  assert.equal(body.jobs.heads[sha].statuses, '[]');
  assert.equal(body.jobs.etags.heads[sha].statuses, '"st2"');
  assert.deepEqual(body.jobs.next[sha], ['statuses']);
  assert.equal(body.jobs.heads[sha].workflowRuns, false, 'a redirect is a failed read, never followed');
  const wr = f.calls.filter((c) => c.url === U.workflowRuns(sha));
  assert.equal(wr.length, 1);
  assert.equal(wr[0].init.redirect, 'manual');
  assert.ok(!f.calls.some((c) => c.url.startsWith('https://api.github.com/repositories/')));
  assert.equal(body.state, 'ok', 'the project still read');
});

test('J1 (AC79): the jobs part is read last and answered null when it would take the call past 30 GitHub requests', async () => {
  _resetKeyCache();
  const jwt = await signJwt(key, goodClaims());
  // Full core lists (3 pages each of PRs, 3a and 3b: 11 requests with the branch and the tree) leave 19: a full part needs 16.
  const paged = (base) => (url) => {
    if (!url.startsWith(base)) return undefined;
    const p = Number((/[?&]page=(\d)/.exec(url) || [0, 1])[1]);
    return { status: 200, headers: p < 3 ? { Link: `<${base}&page=${p + 1}>; rel="next"` } : {}, body: '[]' };
  };
  const head = JSON.parse(branch.body).commit.sha;
  const core = [paged(U.pulls), paged(U.runs(head, 'push')), paged(U.runs(head, 'workflow_dispatch'))];
  const jobs = { runs: { etag: null }, heads: HEADS.slice(0, 5).map((sha) => ({ sha })) };
  let f = fakeFetch(jobsRoutes(core));
  let body = await (await call('poll', request('/api/poll', { jwt, body: { project: 'Service-Desk', head: null, etags: {}, jobs } }), f)).json();
  assert.ok(body.jobs && Object.keys(body.jobs.heads).length === 5, '11 + 16 = 27: within 30');
  assert.ok(body.cost.github <= 30, `${body.cost.github} requests`);
  // Each core list request redirected once (a renamed repository): the counts pass 30, so the part is null, the core intact.
  f = fakeFetch(jobsRoutes(core));
  const wrap = async (url, init) => {
    const res = await f(url, init);
    if (/\/pulls\?|\/actions\/runs\?head_sha=[0-9a-f]{40}&event=/.test(url)) Object.defineProperty(res, 'redirected', { value: true });
    return res;
  };
  wrap.calls = f.calls;
  body = await (await call('poll', request('/api/poll', { jwt, body: { project: 'Service-Desk', head: null, etags: {}, jobs } }), wrap)).json();
  assert.equal(body.jobs, null, 'its requests would pass 30');
  assert.equal(body.state, 'ok');
  assert.ok(body.cost.github <= 30);
});

test('J6 (AC79): commitTime and jobLog: a sixth answered null, a jobLog entry not digits null; 1 and 3 of the budget each; the log\'s redirect fetched with no Authorization', async () => {
  _resetKeyCache();
  const jwt = await signJwt(key, goodClaims());
  const shas = HEADS;
  const runs = ['11', '12', '13', '14', '15', '16'];
  const f = fakeFetch([
    certsRoute([key]),
    (url) => (/\/commits\/[0-9a-f]{40}$/.test(url) ? { status: 200, body: JSON.stringify({ commit: { committer: { date: '2026-10-18T11:20:00Z' } } }) } : undefined),
    (url) => {
      const m = /\/actions\/runs\/(\d+)\/jobs\?per_page=30$/.exec(url);
      return m ? { status: 200, body: JSON.stringify({ jobs: [{ id: Number(m[1]) * 10, name: 'merge', status: 'completed', conclusion: 'success' }] }) } : undefined;
    },
    (url) => {
      const m = /\/actions\/jobs\/(\d+)\/logs$/.exec(url);
      return m ? { status: 302, headers: { Location: `https://logs.example.invalid/${m[1]}` } } : undefined;
    },
    (url) => (url.startsWith('https://logs.example.invalid/') ? { status: 200, body: '2026-10-18T11:41:05.1Z NOTE: the asks-merge grant is L-0017\r\n2026-10-18T11:41:05.2Z noise\r\n2026-10-18T11:41:05.3Z PR #7: waits: x\r\n' } : undefined),
  ]);
  const res = await call('blobs', request('/api/blobs', { jwt, body: { project: 'Service-Desk', blobs: [], history: [], commitTime: shas, jobLog: [...runs.slice(0, 2), 'x1', ...runs.slice(2)] } }), f);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.commitTime[shas[5]], null, 'a sixth commitTime answered null');
  assert.equal(body.commitTime[shas[0]], '2026-10-18T11:20:00Z');
  assert.equal(body.jobLog.x1, null, 'not digits: null');
  assert.equal(body.jobLog['16'], null, 'a sixth jobLog answered null');
  assert.deepEqual(body.jobLog['11'], { job: { status: 'completed', conclusion: 'success' }, ran: true, lines: ['NOTE: the asks-merge grant is L-0017', 'PR #7: waits: x'], tooLarge: false });
  assert.equal(body.cost.github, 5 + 5 * 3, '1 per head time, 3 per log form');
  const target = f.calls.filter((c) => c.url.startsWith('https://logs.example.invalid/'));
  assert.equal(target.length, 5);
  assert.ok(target.every((c) => c.headers.get('Authorization') == null), 'no token on the redirect\'s address');
  assert.ok(f.calls.filter((c) => /\/logs$/.test(c.url)).every((c) => c.init.redirect === 'manual' && /^Bearer /.test(c.headers.get('Authorization'))));
  // The budget: 5 head times and 5 logs are 20; with 6 blobs, 26 is refused.
  const over = await call('blobs', request('/api/blobs', { jwt, body: { project: 'Service-Desk', blobs: shas, history: [], commitTime: shas.slice(0, 5), jobLog: runs.slice(0, 5) } }), fakeFetch([certsRoute([key])]));
  assert.equal(over.status, 400);
  assert.match((await over.json()).error, /budget 26/);
  // A log longer than 65,536 characters answers "too large".
  const g = fakeFetch([certsRoute([key]),
    (url) => (/\/jobs\?per_page=30$/.test(url) ? { status: 200, body: JSON.stringify({ jobs: [{ id: 5, name: 'merge', status: 'completed', conclusion: 'success' }] }) } : undefined),
    (url) => (/\/jobs\/5\/logs$/.test(url) ? { status: 302, headers: { Location: 'https://logs.example.invalid/5' } } : undefined),
    (url) => (url === 'https://logs.example.invalid/5' ? { status: 200, body: 'x'.repeat(65537) } : undefined)]);
  const big = await (await call('blobs', request('/api/blobs', { jwt, body: { project: 'Service-Desk', blobs: [], history: [], jobLog: ['1'] } }), g)).json();
  assert.deepEqual(big.jobLog['1'], { job: { status: 'completed', conclusion: 'success' }, ran: true, lines: null, tooLarge: true });
  // A merge job skipped: no log asked for.
  const k = fakeFetch([certsRoute([key]),
    (url) => (/\/jobs\?per_page=30$/.test(url) ? { status: 200, body: JSON.stringify({ jobs: [{ id: 5, name: 'merge', status: 'completed', conclusion: 'skipped' }] }) } : undefined)]);
  const sk = await (await call('blobs', request('/api/blobs', { jwt, body: { project: 'Service-Desk', blobs: [], history: [], jobLog: ['1'] } }), k)).json();
  assert.deepEqual(sk.jobLog['1'], { job: { status: 'completed', conclusion: 'skipped' }, ran: false, lines: null, tooLarge: false });
  assert.ok(!k.calls.some((c) => /\/logs$/.test(c.url)));
});

test('J6 (AC79; security review round 1, F and G): the commit and jobs reads refuse redirects; odd entries answer null, never a 400; jobLog null for a v2.5 project', async () => {
  _resetKeyCache();
  const jwt = await signJwt(key, goodClaims());
  const sha = HEADS[0];
  const f = fakeFetch([certsRoute([key]),
    (url) => (/\/commits\/[0-9a-f]{40}$/.test(url) ? { status: 301, headers: { Location: 'https://api.github.com/repositories/1/commits/x' } } : undefined),
    (url) => (/\/actions\/runs\/\d+\/jobs\?per_page=30$/.test(url) ? { status: 302, headers: { Location: 'https://elsewhere.example.invalid/jobs' } } : undefined)]);
  const res = await call('blobs', request('/api/blobs', { jwt, body: { project: 'Service-Desk', blobs: [], history: [],
    commitTime: [sha, 7, 'x'.repeat(101), { a: 1 }], jobLog: ['11', 12, 'y'.repeat(101), null] } }), f);
  assert.equal(res.status, 200, 'never a 400 for an odd entry');
  const body = await res.json();
  assert.equal(body.commitTime[sha], null, 'a redirected commit read is a failed read');
  assert.equal(body.jobLog['11'], null, 'a redirected jobs read is a failed read');
  for (const k of ['7', '{"a":1}']) assert.equal(body.commitTime[k], null, k);
  assert.equal(body.commitTime['x'.repeat(100)], null, 'an over-long entry answers null');
  for (const k of ['12', 'null']) assert.equal(body.jobLog[k], null, k);
  assert.ok(f.calls.filter((c) => c.url.startsWith('https://api.github.com/repos/')).every((c) => c.init.redirect === 'manual'));
  assert.ok(!f.calls.some((c) => /repositories\/1|elsewhere/.test(c.url)), 'no redirect followed');
  assert.equal(body.cost.github, 2, 'one commit read and one jobs read');
  // A v2.5 project: every jobLog entry answers null, and nothing is read.
  const g = fakeFetch([certsRoute([key])]);
  const r2 = await call('blobs', request('/api/blobs', { jwt, body: { project: 'Personal-Org-Operating-Model', blobs: [], history: [], jobLog: ['11'] } }), g);
  assert.equal(r2.status, 200);
  assert.equal((await r2.json()).jobLog['11'], null);
  assert.equal(githubCalls(g).length, 0);
});
