// join-test: S-001/J12 — the desk function's one GraphQL read (pull requests into the default branch)
// → the page's Timeline sprints (AC60, AC61, AC72). Trial-view notes 2, 2026-10-16. With J12's
// fixture (tests/desk/fixtures/github/j12-pulls-built.json, built from REST answers, NOT as GitHub
// sent it) and its made-up answers with an error (fixtures/github/j12-made-up-*.json, MADE UP).
import test from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../../src/lib/api.js';
import { _resetKeyCache } from '../../src/lib/access.js';
import { GRAPHQL_URL, PULLS_QUERY, PULLS_COST } from '../../src/lib/github.js';
import { judgePulls, keptPull, mergePulls, pullsBackoffMs, PULLS_BACKOFF_MS, PULLS_KEY, PULLS_MAX, PULLS_RATE_MS, TOO_MANY_WORDS, CANT_READ_CHECKS } from '../../src/lib/pulls.js';
import { createDesk, POLL_MS, BLOB_CACHE_KEY } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { j11Records, timelineOf, phaseView } from '../../src/lib/sandbox.js';
import { runsContext, feedView } from '../../src/lib/feed.js';
import { makeKey, signJwt, goodClaims, certsRoute, request, fakeFetch, ENV, NOW, CONFIG, fakeClock } from './helpers.mjs';
import { fakeServer } from './fake-desk.mjs';
import { pullsAnswer, pullNodes, madeUp, answerOf, node } from './j12-fixture.mjs';
import { sdRepo, SD3 } from './tv2-fixtures.mjs';

const key = await makeKey('kid-1');
const SDV3 = CONFIG.projects.find((p) => p.model === 'v3');
const V25 = CONFIG.projects.find((p) => p.model === 'v2.5');
const sha = (i) => i.toString(16).padStart(40, 'b');
const call = (body, f) => handle({ request: request('/api/blobs', { jwt: globalThis.__jwt, body }), env: ENV }, 'blobs', { fetch: f, now: () => NOW });
const graphqlCalls = (f) => f.calls.filter((c) => c.url === GRAPHQL_URL);
const blobRoute = (url) => (url.includes('/git/blobs/') ? { status: 200, headers: { 'Content-Type': 'text/plain' }, body: `blob ${url.slice(-40)}` } : undefined);

test.before(async () => {
  _resetKeyCache();
  globalThis.__jwt = await signJwt(key, goodClaims());
});

// ---------------------------------------------------------------------------
// The function

test('J12: the refused cursor — not 1 to 200 of A-Z a-z 0-9 + / = _ -, a field other than `after`, a v2.5 project — is a 400, with no GitHub call', async () => {
  const bad = [
    { after: '' }, { after: 'a'.repeat(201) }, { after: 'abc def' }, { after: 'abc"}' }, { after: 'é' }, { after: 5 }, { after: ['x'] },
    { after: null, query: 'query { viewer { login } }' }, { query: 'query { viewer { login } }' }, 'x', ['x'], true,
  ];
  for (const pulls of bad) {
    const f = fakeFetch([certsRoute([key])]);
    const res = await call({ project: SDV3.name, blobs: [], history: [], pulls }, f);
    assert.equal(res.status, 400, JSON.stringify(pulls));
    assert.equal(f.calls.filter((c) => c.url.startsWith('https://api.github.com/')).length, 0);
  }
  const f = fakeFetch([certsRoute([key])]);
  assert.equal((await call({ project: V25.name, blobs: [], history: [], pulls: { after: null } }, f)).status, 400, 'v3 projects only');
  for (const after of [null, 'Y3Vyc29yOnYyOpK5MjAyNi0xMC0wMVQwMTo0NjoxNVo=', 'a'.repeat(200), 'A-z_0+9/='] ) {
    const g = fakeFetch([certsRoute([key]), (url) => (url === GRAPHQL_URL ? { status: 200, body: pullsAnswer() } : undefined)]);
    assert.equal((await call({ project: SDV3.name, blobs: [], history: [], pulls: { after } }, g)).status, 200, String(after));
  }
});

test('J12: the budget — the read counts 5 of the call\'s 25: 20 blobs and the read pass, 21 do not', async () => {
  assert.equal(PULLS_COST, 5);
  const routes = () => [certsRoute([key]), blobRoute, (url) => (url === GRAPHQL_URL ? { status: 200, body: pullsAnswer() } : undefined)];
  const ok = await call({ project: SDV3.name, blobs: Array.from({ length: 20 }, (_, i) => sha(i)), history: [], pulls: { after: null } }, fakeFetch(routes()));
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).cost.github, 21, '20 blob reads and one GraphQL request');
  const over = fakeFetch(routes());
  assert.equal((await call({ project: SDV3.name, blobs: Array.from({ length: 21 }, (_, i) => sha(i)), history: [], pulls: { after: null } }, over)).status, 400);
  assert.equal(over.calls.filter((c) => c.url.startsWith('https://api.github.com/')).length, 0);
  const hist = (n) => call({ project: SDV3.name, blobs: Array.from({ length: n }, (_, i) => sha(i)), history: ['questions/a.md'], pulls: { after: null } },
    fakeFetch([...routes(), (url) => (url.includes('/commits?path=') ? { status: 200, body: '[]' } : undefined)]));
  assert.equal((await hist(18)).status, 200, '18 + 2 (a history path) + 5 = 25');
  assert.equal((await hist(19)).status, 400, '19 + 2 + 5 = 26');
});

test('J12: the function sends the fixed query text only, with the variables from J7 and the page\'s cursor, and returns the answer raw', async () => {
  const f = fakeFetch([certsRoute([key]), (url) => (url === GRAPHQL_URL ? { status: 200, body: pullsAnswer() } : undefined)]);
  const res = await call({ project: SDV3.name, blobs: [], history: [], pulls: { after: 'Q1VSU09S' } }, f);
  const json = await res.json();
  const [g] = graphqlCalls(f);
  assert.equal(g.init.method, 'POST');
  assert.match(g.headers.get('Authorization'), /^Bearer /);
  const sent = JSON.parse(g.init.body);
  assert.deepEqual(Object.keys(sent).sort(), ['query', 'variables']);
  assert.equal(sent.query, PULLS_QUERY, 'the fixed text, as the function holds it');
  const [owner, name] = SDV3.repo.split('/');
  assert.deepEqual(sent.variables, { owner, name, base: SDV3.defaultBranch, after: 'Q1VSU09S' });
  assert.match(PULLS_QUERY, /pullRequests\(baseRefName: \$base, first: 100, after: \$after, orderBy: \{field: CREATED_AT, direction: DESC\}\)/);
  for (const field of ['number', 'title', 'body', 'state', 'createdAt', 'mergedAt', 'closedAt', 'headRefName', 'mergeCommit { oid message author { name } }', 'statusCheckRollup { state }', 'hasNextPage', 'endCursor']) assert.ok(PULLS_QUERY.includes(field), field);
  assert.equal(json.pulls, pullsAnswer(), 'raw, unparsed');
  assert.equal(json.state, 'ok');
});

test('J12: `null` on a failed read (no answer from GitHub); a 401 stops the call; a RATE_LIMITED answer (200 or 403) goes back raw, and the blob reads go on', async () => {
  const net = fakeFetch([certsRoute([key]), blobRoute, (url) => (url === GRAPHQL_URL ? 'throw' : undefined)]);
  const a = await (await call({ project: SDV3.name, blobs: [sha(1)], history: [], pulls: { after: null } }, net)).json();
  assert.equal(a.pulls, null);
  assert.equal(a.state, 'ok', 'an optional read: the call is not failed for it');
  assert.equal(a.blobs[sha(1)], `blob ${sha(1)}`);
  const unauth = fakeFetch([certsRoute([key]), (url) => (url === GRAPHQL_URL ? { status: 401, body: '{"message":"Bad credentials"}' } : undefined)]);
  const b = await (await call({ project: SDV3.name, blobs: [], history: [], pulls: { after: null } }, unauth)).json();
  assert.equal(b.state, 'cant-read');
  assert.equal(b.pulls, null);
  for (const name of ['rate-limited', 'rate-limited-403']) {
    const m = madeUp(name);
    const f = fakeFetch([certsRoute([key]), blobRoute, (url) => (url === GRAPHQL_URL ? { status: m.status, body: m.body } : undefined)]);
    const c = await (await call({ project: SDV3.name, blobs: [sha(2)], history: [], pulls: { after: null } }, f)).json();
    assert.equal(c.pulls, m.body, `${name}: raw`);
    assert.equal(c.state, 'ok', `${name}: GraphQL's limit is J12's alone`);
    assert.equal(c.blobs[sha(2)], `blob ${sha(2)}`);
  }
});

// ---------------------------------------------------------------------------
// The page's judgement of the answer

test('J12: each of the answer\'s own errors — data null (the first message as the reason), RATE_LIMITED in a 200 and a 403, and the check rollup\'s field error (the rest used)', () => {
  const dn = judgePulls(madeUp('data-null').body);
  assert.deepEqual([dn.ok, dn.rate], [false, false]);
  assert.equal(dn.reason, "the pull requests' read failed: Could not resolve to a Repository with the name 'shumpmaster/Service-Desk'.", 'the first error\'s message as the reason');
  for (const name of ['rate-limited', 'rate-limited-403']) {
    const r = judgePulls(madeUp(name).body);
    assert.equal(r.ok, false);
    assert.equal(r.rate, true, name);
  }
  assert.equal(judgePulls(null).ok, false);
  assert.equal(judgePulls('<html>502</html>').ok, false);
  assert.equal(judgePulls('{"data":{}}').ok, false, 'no repository');
  const fe = judgePulls(madeUp('field-error').body);
  assert.equal(fe.ok, true);
  assert.ok(fe.pulls.length > 0);
  assert.ok(fe.pulls.every((p) => p.checks && p.checks.error), 'each checks mark carries the error');
  assert.equal(fe.pulls.find((p) => p.number === 77).title, "Trial view: roomier answer choices, Home's bar removed, long rulings clipped to three lines", 'the rest is used');
  assert.equal(CANT_READ_CHECKS, "the desk's token can't read checks");
  const ok = judgePulls(pullsAnswer());
  assert.equal(ok.ok, true);
  assert.equal(ok.pulls.length, 72);
  assert.equal(ok.hasNext, false);
});

test('J12: the kept fields only — number, title, state, the times, head branch, merge commit, check state, and AC61\'s parts of the body; never the rest of the body', () => {
  const n = node(950, { body: '## What this means for you\nA paragraph.\n\nMilestone: MD3\n\n## Context\n- A fact (source: docs/PROJECT.md)\n\n## Why\nBecause.\n\n## Changes\nA SECRET-LOOKING LINE THE DESK NEVER KEEPS\n', checks: 'FAILURE' });
  const k = keptPull(n, 'FAILURE');
  // Rewritten in VT1 of M3B (forced: J12, changed for M3B, adds `valueCheck` and `valueCheckLine` to the kept entry).
  assert.deepEqual(Object.keys(k).sort(), ['checks', 'createdAt', 'estimate', 'estimateLine', 'head', 'job', 'mergeCommit', 'mergedAt', 'number', 'parts', 'state', 'title',
    'valueCheck', 'valueCheckLine'],
    'from 2026-10-17 the job\'s yes or no, never the merge commit\'s message; from 2026-10-19 the estimate-only yes or no, never the paths; from VT1 the weekly value check\'s two');
  assert.equal(k.valueCheck, false);
  assert.equal(k.valueCheckLine, false);
  assert.equal(k.job, false);
  assert.equal(k.estimate, false);
  assert.equal(k.estimateLine, false, 'from build review round 1 (A): whether the Milestone: line is exactly AC60\'s, never the line itself');
  assert.deepEqual(k.parts, { milestone: { ids: ['MD3'] }, context: [{ fact: 'A fact', source: 'docs/PROJECT.md', exception: false }], why: ['Because.'] });
  assert.doesNotMatch(JSON.stringify(k), /SECRET-LOOKING|A paragraph|What this means/);
  for (const p of judgePulls(pullsAnswer()).pulls) assert.ok(!('body' in p), `#${p.number}: no body kept`);
  // At most 300 kept, the newest; a page replaces the ones under its numbers and leaves the rest.
  const many = Array.from({ length: 320 }, (_, i) => keptPull(node(1000 + i, { createdAt: new Date(Date.parse('2026-01-01T00:00:00Z') + i * 3600e3).toISOString() }), null));
  const merged = mergePulls([], many);
  assert.equal(merged.length, PULLS_MAX);
  assert.equal(Math.min(...merged.map((p) => p.number)), 1020, 'the newest 300');
  const again = mergePulls(merged, [{ ...merged.find((p) => p.number === 1300), title: 'Edited after the merge' }]);
  assert.equal(again.find((p) => p.number === 1300).title, 'Edited after the merge');
  assert.equal(again.length, 300);
});

// ---------------------------------------------------------------------------
// The page's reads (the scheduler, with the fake desk function)

function pagedAnswer(pages, calls) {
  // A made-up answer of `pages` pages of 100 (NOT a real record), each naming the next.
  return (after) => {
    calls.push(after);
    const i = after == null ? 0 : Number(after.slice(1)) - 1;
    const nodes = Array.from({ length: 100 }, (_, k) => node(5000 - i * 100 - k, { createdAt: new Date(Date.parse('2026-10-15T00:00:00Z') - (i * 100 + k) * 60e3).toISOString() }));
    return answerOf(nodes, { hasNext: i + 1 < pages, cursor: `P${i + 2}` });
  };
}

function deskOn(r, { start = Date.parse('2026-10-14T15:00:00Z'), pullsStore = createStore(null), store = createStore(null) } = {}) {
  const clock = fakeClock(start);
  const config = { ...CONFIG, projects: [SD3] };
  const server = fakeServer({ [SD3.name]: r }, config, clock);
  const desk = createDesk({ config, call: (p, b) => server.call(p, b), clock, store, pullsStore, isVisible: () => true, j11: true });
  return { clock, server, desk, pullCalls: () => server.calls.filter((c) => c.path === '/api/blobs' && c.body.pulls) };
}

test('J12: the cold read follows hasNextPage for at most 3 pages, one page per blob call, and the Timeline says "older pull requests not read (over 300)" once, at the bottom', async () => {
  const asked = [];
  const r = sdRepo();
  r.pullsAnswer = pagedAnswer(5, asked);
  const { clock, desk, pullCalls } = deskOn(r);
  desk.start();
  await clock.runUntil(clock.now() + 5 * POLL_MS);
  desk.stop();
  assert.deepEqual(asked, [null, 'P2', 'P3'], 'three pages, then no more');
  assert.ok(pullCalls().every((c) => Object.keys(c.body.pulls).length === 1 && 'after' in c.body.pulls));
  const snap = desk.snapshot(SD3.name);
  assert.equal(snap.pulls.list.length, 300);
  assert.equal(snap.pulls.tooMany, true);
  const j = j11Records(SD3, snap);
  const tl = timelineOf(j);
  const pv = phaseView(SD3, tl, snap.tree, j);
  const feed = feedView(runsContext(SD3, snap, j, tl, pv), { pulls: [] }, clock.now(), CONFIG.ownerTimeZone);
  assert.deepEqual(feed.notes.filter((x) => x === TOO_MANY_WORDS), [TOO_MANY_WORDS]);
  // A milestone's sprint among the older ones: its code with "not available".
  const m2b = feed.blocks.flatMap((b) => [...(b.plannedRows || []), ...b.rows]).find((x) => x.code === 'M2B');
  assert.ok(m2b.sprints.every((s) => s.missing === 'not available' && s.reason === TOO_MANY_WORDS), JSON.stringify(m2b.sprints[0]));
});

test('J12: a head change reads the first page only, replacing what it holds and keeping the older ones; the next day after midnight in ownerTimeZone is a cold read again', async () => {
  const asked = [];
  const r = sdRepo();
  let titled = 'first';
  r.pullsAnswer = (after) => {
    asked.push(after);
    if (after == null) return answerOf([node(201, { title: `newest, ${titled}` }), node(200)], { hasNext: true, cursor: 'P2' });
    return answerOf([node(150), node(149)], { hasNext: false });
  };
  const { clock, desk } = deskOn(r, { start: Date.parse('2026-10-14T15:00:00Z') });
  desk.start();
  await clock.runUntil(clock.now() + 3 * POLL_MS);
  assert.deepEqual(asked, [null, 'P2'], 'the cold read: both pages');
  asked.length = 0;
  await clock.runUntil(clock.now() + 3 * POLL_MS);
  assert.deepEqual(asked, [], 'no read without a head change');
  titled = 'retitled';
  r.commit({ 'status/P-003.toml': 'kind = "project"\nstage = 5\nstate = "dispatched"\nrole = "builder"\nsessions = 1\n' });
  await clock.runUntil(clock.now() + 3 * POLL_MS);
  assert.deepEqual(asked, [null], 'the head change: the first page only');
  const list = desk.snapshot(SD3.name).pulls.list;
  assert.equal(list.find((p) => p.number === 201).title, 'newest, retitled');
  assert.ok(list.some((p) => p.number === 149), 'the older ones kept stay');
  // Midnight in America/Chicago is 05:00Z on 15 Oct.
  asked.length = 0;
  await clock.runUntil(Date.parse('2026-10-15T04:58:00Z'));
  assert.deepEqual(asked, []);
  await clock.runUntil(Date.parse('2026-10-15T05:03:00Z'));
  assert.deepEqual(asked, [null, 'P2'], 'the first load after midnight: a cold read');
  desk.stop();
});

test('J12 (draft 6, N2): a RATE_LIMITED answer (200 or 403) — no J12 read for 60 minutes, then read again with no head change needed; the REST polls go on at their pace; the project is never "Can\'t read" for it', async () => {
  for (const answer of [madeUp('rate-limited').body, madeUp('rate-limited-403').body]) {
    const r = sdRepo();
    let n = 0;
    r.pullsAnswer = () => { n++; return n === 1 ? answer : pullsAnswer(); };
    const start = Date.parse('2026-10-14T15:00:00Z');
    const { clock, desk, server } = deskOn(r, { start });
    desk.start();
    await clock.runUntil(start + 2 * POLL_MS);
    assert.equal(n, 1);
    const snap = desk.snapshot(SD3.name);
    assert.equal(snap.pulls.rate, true);
    assert.ok(snap.pulls.failure);
    assert.equal(snap.pulls.current, false);
    assert.equal(desk.states.get(SD3.name).failure, null, 'not "Can\'t read"');
    // A head change within the 60 minutes: still no read.
    r.commit({ 'status/P-003.toml': 'kind = "project"\nstage = 5\nstate = "dispatched"\nrole = "builder"\nsessions = 2\n' });
    const pollsBefore = server.calls.filter((c) => c.path === '/api/poll').length;
    await clock.runUntil(start + 59 * 60e3);
    assert.equal(n, 1, 'no read within the 60 minutes, head change or not');
    const polls = server.calls.filter((c) => c.path === '/api/poll').length - pollsBefore;
    assert.ok(polls >= 56, `${polls} polls in 57 minutes: REST not slowed`);
    await clock.runUntil(start + 61 * 60e3);
    assert.equal(n, 2, 'after 60 minutes: read again');
    assert.equal(desk.snapshot(SD3.name).pulls.failure, null);
    desk.stop();
  }
  // A quiet project (no head change at all): read again after the 60 minutes all the same.
  const q = sdRepo();
  let m = 0;
  q.pullsAnswer = () => { m++; return m === 1 ? madeUp('rate-limited').body : pullsAnswer(); };
  const start = Date.parse('2026-10-14T15:00:00Z');
  const b = deskOn(q, { start });
  b.desk.start();
  await b.clock.runUntil(start + 59 * 60e3);
  assert.equal(m, 1);
  await b.clock.runUntil(start + 62 * 60e3);
  assert.equal(m, 2, 'no head change needed');
  assert.ok(b.desk.snapshot(SD3.name).pulls.list.length > 0);
  b.desk.stop();
});

// J12's backoff (2026-10-17, the desk follow-ups; build review round 2 of trial-view notes 2, N1),
// driven by the scheduler's fake clock.
const MIN = 60e3;
const T0 = Date.parse('2026-10-14T15:00:00Z');
const gaps = (at) => at.slice(1).map((t, i) => t - at[i]);
/** Each gap is the wait it should be, within the one poll cycle a due read may wait for. */
function assertWaits(at, waitsMin, what) {
  const g = gaps(at);
  assert.equal(g.length, waitsMin.length, `${what}: ${at.length} reads, gaps ${g.map((x) => x / MIN)}`);
  g.forEach((x, i) => {
    assert.ok(x >= waitsMin[i] * MIN, `${what}: read ${i + 2} came ${x / MIN} min after the last, before the ${waitsMin[i]}-minute wait`);
    assert.ok(x < waitsMin[i] * MIN + POLL_MS, `${what}: read ${i + 2} came ${x / MIN} min after the last, not at the first cycle after the ${waitsMin[i]}-minute wait`);
  });
}

test('J12 backoff: after failures in a row (null, data null, a failed blob call), the next J12 read comes 5, 10, 20 and 40 minutes later, then 60 and 60 again; none in between, no head change needed', async () => {
  assert.deepEqual(PULLS_BACKOFF_MS.map((x) => x / MIN), [5, 10, 20, 40, 60]);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 9].map((k) => pullsBackoffMs(k) / MIN), [5, 10, 20, 40, 60, 60, 60]);
  assert.equal(PULLS_RATE_MS, 60 * MIN, 'no wait in the backoff is longer than a rate limit\'s');
  for (const kind of ['null', 'data-null', 'call-fails']) {
    const r = sdRepo();
    const at = [];
    const box = {};
    r.pullsAnswer = () => { at.push(box.clock.now()); return kind === 'data-null' ? madeUp('data-null').body : null; };
    const d = deskOn(r, { start: T0 });
    box.clock = d.clock;
    let call = d.server.call;
    if (kind === 'call-fails') {
      // The function fails every blob call that carries J12's read (a refusal or a network failure).
      const desk = createDesk({ config: { ...CONFIG, projects: [SD3] }, clock: d.clock, store: createStore(null), pullsStore: createStore(null), isVisible: () => true, j11: true,
        call: async (path, body) => {
          if (path === '/api/blobs' && body.pulls) { at.push(d.clock.now()); return { ok: false, status: 0, reason: 'network' }; }
          return call(path, body);
        } });
      d.desk = desk;
    }
    d.desk.start();
    await d.clock.runUntil(T0 + 200 * MIN);
    d.desk.stop();
    assertWaits(at, [5, 10, 20, 40, 60, 60], kind);
    const snap = d.desk.snapshot(SD3.name).pulls;
    assert.ok(snap.failure, `${kind}: the failure is shown`);
    assert.equal(snap.rate, false);
    assert.equal(d.desk.states.get(SD3.name).failure, null, `${kind}: the project is never "Can't read" for it`);
  }
});

test('J12 backoff: no J12 read during a wait, a head change in the wait included; when it ends, the read is what is due then (the first page, for the head change)', async () => {
  const r = sdRepo();
  const asked = [];
  const box = {};
  let fail = false;
  r.pullsAnswer = (after) => { asked.push({ at: box.clock.now(), after }); return fail ? null : pullsAnswer(); };
  const d = deskOn(r, { start: T0 });
  box.clock = d.clock;
  d.desk.start();
  await d.clock.runUntil(T0 + 2 * MIN);
  assert.equal(asked.length, 1, 'the cold read answered');
  const sessions = (n) => ({ 'status/P-003.toml': `kind = "project"\nstage = 5\nstate = "dispatched"\nrole = "builder"\nsessions = ${n}\n` });
  // A head change whose read fails: a 5-minute wait.
  fail = true;
  r.commit(sessions(3));
  await d.clock.runUntil(T0 + 4 * MIN);
  assert.equal(asked.length, 2, 'the head change read the first page');
  const failedAt = asked[1].at;
  // Two more head changes inside the wait: no read.
  r.commit(sessions(4));
  await d.clock.runUntil(failedAt + 2 * MIN);
  r.commit(sessions(5));
  fail = false;
  await d.clock.runUntil(failedAt + 5 * MIN - 1);
  assert.equal(asked.length, 2, 'no J12 read in the wait, head changes or not');
  await d.clock.runUntil(failedAt + 5 * MIN + POLL_MS);
  assert.equal(asked.length, 3, 'read once when the wait ends');
  assert.ok(asked[2].at - failedAt >= 5 * MIN);
  assert.equal(asked[2].after, null, 'the first page, for the head change');
  const snap = d.desk.snapshot(SD3.name).pulls;
  assert.equal(snap.failure, null);
  assert.equal(snap.current, true, 'at the current head');
  await d.clock.runUntil(d.clock.now() + 5 * MIN);
  assert.equal(asked.length, 3, 'then nothing more without a reason to read');
  d.desk.stop();
});

test('J12 backoff: a read that answers resets it, so the next failure waits 5 minutes again', async () => {
  const r = sdRepo();
  const at = [];
  const box = {};
  // fail, fail, fail (waits 5, 10, 20), answer, then fail and fail again after a head change.
  const plan = [null, null, null, 'ok', null, null];
  r.pullsAnswer = () => { at.push(box.clock.now()); const a = plan[at.length - 1]; return a === 'ok' ? pullsAnswer() : null; };
  const d = deskOn(r, { start: T0 });
  box.clock = d.clock;
  d.desk.start();
  await d.clock.runUntil(T0 + 40 * MIN);
  assertWaits(at, [5, 10, 20], 'before the answer');
  assert.equal(d.desk.snapshot(SD3.name).pulls.failure, null, 'the fourth read answered');
  await d.clock.runUntil(T0 + 50 * MIN);
  assert.equal(at.length, 4, 'no read without a reason to read');
  const changed = d.clock.now();
  r.commit({ 'status/P-003.toml': 'kind = "project"\nstage = 5\nstate = "dispatched"\nrole = "builder"\nsessions = 5\n' });
  await d.clock.runUntil(changed + 10 * MIN);
  d.desk.stop();
  assert.equal(at.length, 6, `the head change's read and one retry: ${gaps(at).map((x) => x / MIN)}`);
  assert.ok(at[4] - changed < 2 * POLL_MS, 'the head change read at once');
  assertWaits(at.slice(4), [5], 'after the reset');
});

test('J12 backoff: a RATE_LIMITED answer waits its plain 60 minutes and leaves the step as it was — neither advances nor resets it', async () => {
  for (const rl of ['rate-limited', 'rate-limited-403']) {
    const r = sdRepo();
    const at = [];
    const box = {};
    // fail (5), fail (10), RATE_LIMITED (60), then fails: 20, 40, 60.
    r.pullsAnswer = () => { at.push(box.clock.now()); return at.length === 3 ? madeUp(rl).body : null; };
    const d = deskOn(r, { start: T0 });
    box.clock = d.clock;
    d.desk.start();
    await d.clock.runUntil(T0 + 20 * MIN);
    assert.equal(at.length, 3);
    assert.equal(d.desk.snapshot(SD3.name).pulls.rate, true);
    await d.clock.runUntil(T0 + 220 * MIN);
    d.desk.stop();
    assertWaits(at, [5, 10, 60, 20, 40, 60], rl);
  }
  // A rate limit on the first read leaves the step at the start: the next failure waits 5.
  const r = sdRepo();
  const at = [];
  const box = {};
  r.pullsAnswer = () => { at.push(box.clock.now()); return at.length === 1 ? madeUp('rate-limited').body : null; };
  const d = deskOn(r, { start: T0 });
  box.clock = d.clock;
  d.desk.start();
  await d.clock.runUntil(T0 + 80 * MIN);
  d.desk.stop();
  assertWaits(at, [60, 5, 10], 'a rate limit first');
});

test('J12 backoff: it lives in memory, so a page reload starts it again at 5 minutes', async () => {
  const r = sdRepo();
  const at = [];
  const box = {};
  r.pullsAnswer = () => { at.push(box.clock.now()); return null; };
  const backing = new Map();
  const st = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, String(v)), removeItem: (k) => backing.delete(k) };
  const first = deskOn(r, { start: T0, store: createStore(st), pullsStore: createStore(st) });
  box.clock = first.clock;
  first.desk.start();
  await first.clock.runUntil(T0 + 40 * MIN);
  first.desk.stop();
  assertWaits(at, [5, 10, 20], 'the first opening');
  assert.ok(!backing.has(PULLS_KEY) || !/"step"|"wait"|"failure"/.test(backing.get(PULLS_KEY)), 'nothing of the backoff is kept on the device');
  at.length = 0;
  const again = deskOn(r, { start: T0 + 41 * MIN, store: createStore(st), pullsStore: createStore(st) });
  box.clock = again.clock;
  again.desk.start();
  await again.clock.runUntil(T0 + 60 * MIN);
  again.desk.stop();
  assertWaits(at, [5, 10], 'after the reload: 5 again, then 10');
});

test('J12: a write that fails to the kept list\'s key (desk-pulls-v3) (the storage full) turns off that key only; the blob cache keeps being written and read', async () => {
  const backing = new Map();
  const failing = {
    getItem: (k) => (backing.has(k) ? backing.get(k) : null),
    setItem: (k, v) => {
      if (k === PULLS_KEY) { const e = new Error('The quota has been exceeded.'); e.name = 'QuotaExceededError'; throw e; }
      backing.set(k, String(v));
    },
    removeItem: (k) => backing.delete(k),
  };
  const store = createStore(failing);
  const pullsStore = createStore(failing);
  const r = sdRepo();
  const { clock, desk } = deskOn(r, { store, pullsStore });
  desk.start();
  await clock.runUntil(clock.now() + 3 * POLL_MS);
  desk.stop();
  assert.equal(pullsStore.usable, false, 'the pulls store turned itself off');
  assert.equal(store.usable, true, 'the blob cache\'s store did not');
  assert.ok(backing.has(BLOB_CACHE_KEY), 'the blob cache written');
  assert.ok(Object.keys(JSON.parse(backing.get(BLOB_CACHE_KEY))).length > 10);
  assert.equal(backing.has(PULLS_KEY), false);
  assert.equal(desk.snapshot(SD3.name).pulls.list.length, 72, 'held in memory for the open window');
  // A second load reads the blob cache back.
  const again = deskOn(r, { store: createStore(failing), pullsStore: createStore(failing), start: clock.now() });
  assert.ok(again.desk.cacheSize() > 10);
});

test('J12: what is kept on the device under the kept list\'s key (desk-pulls-v3) (a working store) holds no body text beyond AC61\'s parts, and is read again on the next load', async () => {
  const backing = new Map();
  const st = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, String(v)), removeItem: (k) => backing.delete(k) };
  const r = sdRepo();
  const { clock, desk } = deskOn(r, { store: createStore(st), pullsStore: createStore(st) });
  desk.start();
  await clock.runUntil(clock.now() + 2 * POLL_MS);
  desk.stop();
  const saved = JSON.parse(backing.get(PULLS_KEY));
  assert.equal(saved[SD3.name].pulls.length, 72);
  const raw = backing.get(PULLS_KEY);
  // #77's body holds a "## Checks" section and a bullet list of changes the desk never shows.
  const body77 = pullNodes().find((n) => n.number === 77).body;
  const unshown = body77.split('\n').filter((l) => l.length > 30 && !/Milestone:|^#|^- .*\(source:/.test(l));
  assert.ok(unshown.length > 0);
  for (const l of unshown) assert.ok(!raw.includes(JSON.stringify(l).slice(1, -1)), `not kept: ${l.slice(0, 50)}`);
  assert.equal(raw.includes('"body"'), false);
  let asked = 0;
  r.pullsAnswer = () => { asked++; return pullsAnswer(); };
  const again = deskOn(r, { store: createStore(st), pullsStore: createStore(st), start: clock.now() });
  assert.equal(again.desk.snapshot(SD3.name).pulls.list.length, 72, 'read again on the next load');
  again.desk.start();
  await again.clock.runUntil(again.clock.now() + 2 * POLL_MS);
  again.desk.stop();
  assert.equal(asked, 0, 'the same day, the same head: no read');
});

test('J12 + AC72 (build review round 1, B1): the snapshot says when the kept list is current — not before the read at this head has answered, not after a failed read, not during a cold read', async () => {
  const backing = new Map();
  const st = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, String(v)), removeItem: (k) => backing.delete(k) };
  const r = sdRepo();
  const first = deskOn(r, { store: createStore(st), pullsStore: createStore(st) });
  first.desk.start();
  await first.clock.runUntil(first.clock.now() + 2 * POLL_MS);
  first.desk.stop();
  assert.equal(first.desk.snapshot(SD3.name).pulls.current, true);
  // The next load: the kept list is read back, but no read at this load's head has answered yet.
  const again = deskOn(r, { store: createStore(st), pullsStore: createStore(st), start: first.clock.now() });
  const before = again.desk.snapshot(SD3.name).pulls;
  assert.equal(before.list.length, 72);
  assert.equal(before.current, false, 'kept, but not yet read at the current head');
  again.desk.start();
  await again.clock.runUntil(again.clock.now() + 2 * POLL_MS);
  assert.equal(again.desk.snapshot(SD3.name).pulls.current, true);
  // A head change whose read fails: the old list is kept, and is not current.
  r.pullsAnswer = null;
  r.commit({ 'status/P-003.toml': 'kind = "project"\nstage = 5\nstate = "dispatched"\nrole = "builder"\nsessions = 9\n' });
  await again.clock.runUntil(again.clock.now() + 2 * POLL_MS);
  again.desk.stop();
  const after = again.desk.snapshot(SD3.name).pulls;
  assert.equal(after.list.length, 72);
  assert.ok(after.failure);
  assert.equal(after.current, false);
  // A cold read under way (page 1 of several answered): not current.
  const asked = [];
  const r3 = sdRepo();
  r3.pullsAnswer = pagedAnswer(3, asked);
  const c = deskOn(r3);
  c.desk.start();
  await c.clock.runUntil(c.clock.now() + 1500);
  const mid = c.desk.snapshot(SD3.name).pulls;
  if (mid.reading) assert.equal(mid.current, false);
  c.desk.stop();
});
