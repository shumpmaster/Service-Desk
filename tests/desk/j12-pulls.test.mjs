// join-test: S-001/J12 — the desk function's one GraphQL read (pull requests into the default branch)
// → the page's Timeline sprints (AC60, AC61, AC72). Trial-view notes 2, 2026-10-16. With J12's
// fixture (tests/desk/fixtures/github/j12-pulls-built.json, built from REST answers, NOT as GitHub
// sent it) and its made-up answers with an error (fixtures/github/j12-made-up-*.json, MADE UP).
import test from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../../src/lib/api.js';
import { _resetKeyCache } from '../../src/lib/access.js';
import { GRAPHQL_URL, PULLS_QUERY, PULLS_COST } from '../../src/lib/github.js';
import { judgePulls, keptPull, mergePulls, PULLS_KEY, PULLS_MAX, TOO_MANY_WORDS, CANT_READ_CHECKS } from '../../src/lib/pulls.js';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
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
  for (const field of ['number', 'title', 'body', 'state', 'createdAt', 'mergedAt', 'closedAt', 'headRefName', 'mergeCommit { oid }', 'statusCheckRollup { state }', 'hasNextPage', 'endCursor']) assert.ok(PULLS_QUERY.includes(field), field);
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
  assert.deepEqual(Object.keys(k).sort(), ['checks', 'createdAt', 'head', 'mergeCommit', 'mergedAt', 'number', 'parts', 'state', 'title']);
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

test('J12: a rate limit (200 or 403) or a failed read — no J12 read until the next head change or for 60 minutes, whichever is later; the REST polls go on at their pace; the project is never "Can\'t read" for it', async () => {
  for (const answer of [madeUp('rate-limited').body, madeUp('rate-limited-403').body, null, madeUp('data-null').body]) {
    const r = sdRepo();
    let n = 0;
    r.pullsAnswer = () => { n++; return answer; };
    const start = Date.parse('2026-10-14T15:00:00Z');
    const { clock, desk, server } = deskOn(r, { start });
    desk.start();
    await clock.runUntil(clock.now() + 2 * POLL_MS);
    assert.equal(n, 1);
    const snap = desk.snapshot(SD3.name);
    assert.equal(snap.pulls.rate, answer != null && /RATE_LIMITED/.test(answer));
    assert.ok(snap.pulls.failure);
    assert.equal(desk.states.get(SD3.name).failure, null, 'not "Can\'t read"');
    // The read failed at the desk's opening (t0). A head change two minutes later: no read until 60 minutes have passed.
    const t0 = start;
    r.commit({ 'status/P-003.toml': 'kind = "project"\nstage = 5\nstate = "dispatched"\nrole = "builder"\nsessions = 2\n' });
    const pollsBefore = server.calls.filter((c) => c.path === '/api/poll').length;
    await clock.runUntil(t0 + 59 * 60e3);
    assert.equal(n, 1, 'a head change within the 60 minutes: no read');
    const polls = server.calls.filter((c) => c.path === '/api/poll').length - pollsBefore;
    assert.ok(polls >= 56, `${polls} polls in 57 minutes: REST not slowed`);
    await clock.runUntil(t0 + 61 * 60e3);
    assert.equal(n, 2, '60 minutes passed, the head had changed: read again');
    desk.stop();
    // The other way round: 60 minutes pass with no head change, so none until the head changes.
    const r2 = sdRepo();
    let n2 = 0;
    r2.pullsAnswer = () => { n2++; return answer; };
    const b = deskOn(r2, { start });
    b.desk.start();
    await b.clock.runUntil(start + 75 * 60e3);
    assert.equal(n2, 1, 'no head change: no read after 60 minutes');
    r2.commit({ 'status/P-003.toml': 'kind = "project"\nstage = 5\nstate = "dispatched"\nrole = "builder"\nsessions = 3\n' });
    await b.clock.runUntil(b.clock.now() + 2 * POLL_MS);
    assert.equal(n2, 2, 'the head changed after the 60 minutes: read again');
    b.desk.stop();
  }
});

test('J12: a write that fails to desk-pulls-v1 (the storage full) turns off that key only; the blob cache keeps being written and read', async () => {
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
  assert.ok(backing.has('desk-blobs-v5'), 'the blob cache written');
  assert.ok(Object.keys(JSON.parse(backing.get('desk-blobs-v5'))).length > 10);
  assert.equal(backing.has(PULLS_KEY), false);
  assert.equal(desk.snapshot(SD3.name).pulls.list.length, 72, 'held in memory for the open window');
  // A second load reads the blob cache back.
  const again = deskOn(r, { store: createStore(failing), pullsStore: createStore(failing), start: clock.now() });
  assert.ok(again.desk.cacheSize() > 10);
});

test('J12: what is kept on the device under desk-pulls-v1 (a working store) holds no body text beyond AC61\'s parts, and is read again on the next load', async () => {
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
