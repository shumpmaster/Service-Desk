// join-test: S-001/J6 — desk page ↔ desk function: request checks, bodies, refusals and the cost field.
// join-test: S-001/J8 — Cloudflare Access → desk function: the JWT check on every request.
// ac-test: S-001/AC13 — without a valid Access JWT for the owner the function answers 403 and makes
// no GitHub call; a POST without a JSON content type, or with a foreign Origin, is refused.
import test from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../../src/lib/api.js';
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
