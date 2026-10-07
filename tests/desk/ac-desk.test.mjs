// The desk end to end on the page side: the real scheduler, reader, read model and Universe state,
// driven by a fake clock and a fake desk function.
// ac-test: S-001/AC1 ac-test: S-001/AC2 ac-test: S-001/AC3 ac-test: S-001/AC4 ac-test: S-001/AC5
// ac-test: S-001/AC6 ac-test: S-001/AC7 ac-test: S-001/AC8
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk, POLL_MS, callFunction } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { makeBox, orderBoxes, boxStateText, screenState } from '../../src/lib/universe.js';
import { fakeClock, fixture, CONFIG } from './helpers.mjs';
import { repo, pr, fakeServer } from './fake-desk.mjs';

const START = Date.parse('2026-10-06T19:00:00Z');
const MIN = 60_000;
const sd = (p) => fixture(`service-desk/${p}`);

function sdRepo() {
  return repo({
    'queue/README.md': sd('queue/README.md'),
    'governance/ROUTING.toml': sd('governance/ROUTING.toml'),
    'status/P-001.toml': fixture('service-desk/status/P-001@7da0fd7.toml'),
    'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
    'questions/_TEMPLATE.md': sd('questions/_TEMPLATE.md'),
  }, [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
}
function poomRepo() {
  return repo({
    'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'),
    'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md'),
    'docs/sprints/m1.1-foundation.md': fixture('poom/docs/sprints/m1.1-foundation.md'),
  }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]);
}

function setup({ visible = true } = {}) {
  const clock = fakeClock(START);
  const repos = { 'Service-Desk': sdRepo(), 'Personal-Org-Operating-Model': poomRepo() };
  const server = fakeServer(repos, CONFIG, clock);
  const vis = { v: visible };
  const desk = createDesk({ config: CONFIG, call: server.call, clock, store: createStore(null), isVisible: () => vis.v });
  const boxes = () => CONFIG.projects.map((p) => makeBox(desk.model(p.name), desk.states.get(p.name), desk, clock.now()));
  const screen = () => screenState(boxes(), desk.signedOut);
  return { clock, repos, server, desk, boxes, screen, vis, sd: repos['Service-Desk'], poom: repos['Personal-Org-Operating-Model'] };
}

test('AC4: on opening the screen says "Checking…", never "Quiet", until every project has been read', async () => {
  const s = setup();
  // Hold the second project's first answer back.
  const realCall = s.server.call;
  let release;
  const gate = new Promise((r) => { release = r; });
  s.desk.stop();
  const desk = createDesk({ config: CONFIG, clock: s.clock, store: createStore(null), isVisible: () => true,
    call: async (path, body) => { if (body.project === 'Personal-Org-Operating-Model') await gate; return realCall(path, body); } });
  const boxes = () => CONFIG.projects.map((p) => makeBox(desk.model(p.name), desk.states.get(p.name), desk, s.clock.now()));
  assert.equal(screenState(boxes(), false).text, 'Checking…');
  desk.start();
  await s.clock.runUntil(START + 1000);
  assert.equal(screenState(boxes(), false).text, 'Checking…', 'one project read, one not');
  release();
  await s.clock.flush();
  assert.equal(screenState(boxes(), false).text, 'Quiet');
});

test('AC1 + AC7 + AC8: a committed card is flagged within one poll and its box moves to the top; its answer unflags it', async () => {
  const s = setup();
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  assert.equal(s.screen().text, 'Quiet');
  assert.deepEqual(orderBoxes(s.boxes()).map((b) => b.name), ['Personal-Org-Operating-Model', 'Service-Desk'], 'by name when nothing is wrong');
  s.sd.commit({ 'queue/P-001-stop-6.md': sd('queue/P-001-stop-6.md') });
  const committedAt = s.clock.now();
  await s.clock.runUntil(committedAt + POLL_MS + 1000);
  const top = orderBoxes(s.boxes())[0];
  assert.equal(top.name, 'Service-Desk');
  assert.equal(top.flaggedCount, 1);
  assert.equal(top.model.flagged[0].title, 'P-001 stop-6: The work reached the stop rule. What happens next?');
  assert.ok(s.screen().text.startsWith('1 waiting on you'));
  assert.ok(s.clock.now() - committedAt <= 5 * MIN);
  // AC7: the answer file, committed by any route.
  s.sd.commit({ 'decisions/P-001/stop-6.md': sd('decisions/P-001/stop-6.md') });
  await s.clock.runUntil(s.clock.now() + POLL_MS + 1000);
  assert.equal(s.screen().text, 'Quiet');
  // ...and on the next opening it is not flagged.
  const again = createDesk({ config: CONFIG, call: s.server.call, clock: s.clock, store: createStore(null), isVisible: () => true });
  again.start();
  await s.clock.runUntil(s.clock.now() + 1000);
  assert.equal(again.model('Service-Desk').flagged.length, 0);
});

test('AC2: an open non-draft PR into the default branch is flagged with its title and link, the owner\'s own too; draft, other base and item/ PRs are activity', async () => {
  const s = setup();
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  s.sd.pulls.push(pr(40, 'Desk M1', { login: 'shumpmaster' }), pr(41, 'Draft work', { draft: true }),
    pr(42, 'Into a branch', { base: 'build/x' }), pr(43, 'Item merge', { head: 'item/P-002' }), pr(44, 'Someone else', { login: 'other' }),
    pr(45, 'Fork named like an item', { head: 'item/x', headRepo: 'outsider/Service-Desk', login: 'outsider' }));
  await s.clock.runUntil(START + POLL_MS + 1000);
  const m = s.desk.model('Service-Desk');
  const flagged = m.flagged.filter((f) => f.kind === 'pr');
  assert.deepEqual(flagged.map((f) => f.title), ['PR #40: Desk M1', 'PR #44: Someone else', 'PR #45: Fork named like an item']);
  assert.equal(flagged[0].link, 'https://github.com/shumpmaster/Service-Desk/pull/40');
  assert.match(flagged[0].words, /^yours/);
  assert.match(flagged[1].words, /^opened by other/);
  for (const n of [41, 42, 43]) assert.ok(m.activity.some((a) => a.text.startsWith(`PR #${n} `)), `#${n} is activity`);
  // Merged, closed or turned back into a draft: no longer flagged at the next poll.
  s.sd.pulls.splice(0, 1);
  s.sd.pulls.find((p) => p.number === 44).draft = true;
  s.sd.pulls.splice(s.sd.pulls.findIndex((p) => p.number === 45), 1);
  await s.clock.runUntil(s.clock.now() + POLL_MS + 1000);
  assert.equal(s.desk.model('Service-Desk').flagged.length, 0);
  // A draft marked ready is flagged again.
  s.sd.pulls.find((p) => p.number === 41).draft = false;
  await s.clock.runUntil(s.clock.now() + POLL_MS + 1000);
  assert.deepEqual(s.desk.model('Service-Desk').flagged.map((f) => f.title), ['PR #41: Draft work']);
});

test('AC3: an owner question is flagged with its title; its answer file (v3) or its deletion (either model) unflags it', async () => {
  const s = setup();
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  s.sd.commit({ 'questions/Q-005-sources.md': sd('questions/Q-005-sources.md') });
  s.poom.commit({ 'questions/Q-020-x.md': '# Ruling needed: pick one\n' });
  await s.clock.runUntil(START + POLL_MS + 1000);
  assert.deepEqual(s.desk.model('Service-Desk').flagged.map((f) => f.title), ['Question: do two Anthropic pages count as two sources?']);
  assert.deepEqual(s.desk.model('Personal-Org-Operating-Model').flagged.map((f) => f.title), ['Question: pick one']);
  assert.equal(s.desk.model('Service-Desk').flagged[0].raisedAt.toISOString(), '2026-10-06T10:00:00.000Z', 'raised time from history');
  s.sd.commit({ 'decisions/questions/Q-005-sources.md': 'Ruling: A\n' });
  s.poom.commit({ 'questions/Q-020-x.md': null });
  await s.clock.runUntil(s.clock.now() + POLL_MS + 1000);
  assert.equal(s.screen().text, 'Quiet');
});

test('AC5: each cause shows "Can\'t read since HH:MM" with the reason in words, sorts above all but flagged boxes, and the screen isn\'t Quiet', async () => {
  const causes = [
    [{ state: 'cant-read', reason: 'token' }, 'the read token was rejected or has expired'],
    [{ state: 'cant-read', reason: 'rate-limit', retryAfter: 600 }, "GitHub's rate limit"],
    [{ state: 'cant-read', reason: 'github' }, 'GitHub error'],
    [{ kind: 'cloudflare' }, 'Error 1102'],
    [{ kind: 'network' }, "network error: the desk's function could not be reached"],
    [{ state: 'cant-read', reason: 'config' }, 'the configured default branch was not found'],
    [{ state: 'partial' }, 'more open PRs, check runs or tree entries than one read can page through'],
  ];
  for (const [fail, words] of causes) {
    const s = setup();
    s.desk.start();
    await s.clock.runUntil(START + 1000);
    s.poom.commit({ 'questions/Q-021-y.md': '# Ruling needed: y\n' }); // POOM flagged, so it stays on top
    s.repos['Service-Desk'].fail = fail;
    await s.clock.runUntil(START + POLL_MS + 1000);
    const order = orderBoxes(s.boxes());
    assert.deepEqual(order.map((b) => b.name), ['Personal-Org-Operating-Model', 'Service-Desk']);
    const box = order[1];
    assert.equal(box.read.read, 'cant-read', JSON.stringify(fail));
    const text = boxStateText(box, 'America/Chicago');
    assert.ok(text.startsWith("Can't read since 14:01: "), text);
    assert.ok(text.includes(words), `${text} has "${words}"`);
    assert.notEqual(s.screen().text, 'Quiet');
    // ...and above a box with nothing wrong.
    s.poom.commit({ 'questions/Q-021-y.md': null });
    await s.clock.runUntil(s.clock.now() + POLL_MS + 1000);
    assert.equal(orderBoxes(s.boxes())[0].name, 'Service-Desk');
    assert.match(s.screen().text, /^Not quiet: can't read 1 project/);
  }
});

test('AC5: a truncated tree is partial; no successful read for 3 minutes is can\'t-read; a 403 from the function says "Signed out"', async () => {
  let s = setup();
  s.sd.truncated = true;
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  assert.equal(s.boxes()[0].read.reason, 'too-many');
  // Stale: the function stops answering (calls never finish).
  s = setup();
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  s.desk.stop();
  const hung = createDesk({ config: CONFIG, clock: s.clock, store: createStore(null), isVisible: () => true, call: () => new Promise(() => {}) });
  hung.start();
  await s.clock.runUntil(START + 3 * MIN + 2000);
  const b = makeBox(hung.model('Service-Desk'), hung.states.get('Service-Desk'), hung, s.clock.now());
  assert.equal(b.read.reason, 'stale');
  assert.match(boxStateText(b, 'America/Chicago'), /^Can't read since 14:00: no successful read for 3 minutes/);
  // Signed out.
  s = setup();
  s.repos['Service-Desk'].fail = { kind: 'signed-out' };
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  assert.equal(s.screen().text, 'Signed out — reload to sign in');
});

test('AC5/J1: a rate-limited project is not polled again before retryAfter', async () => {
  const s = setup();
  s.repos['Service-Desk'].fail = { state: 'cant-read', reason: 'rate-limit', retryAfter: 600 };
  s.desk.start();
  await s.clock.runUntil(START + 15 * MIN);
  const polls = s.server.calls.filter((c) => c.project === 'Service-Desk').map((c) => c.at);
  assert.deepEqual(polls.map((t) => (t - START) / 1000), [0, 600]);
});

test('AC6: failing CI, draft PRs, log events, overruns and unparseable queue files are activity — not flagged, not counted, the box not moved up for them', async () => {
  const s = setup();
  s.sd.runs.push({ name: 'governance', status: 'completed', conclusion: 'failure' });
  s.sd.pulls.push(pr(50, 'WIP', { draft: true }));
  s.sd.commit({ 'queue/odd.md': 'x', 'status/P-002.toml': 'kind = "project"\nstage = 5\nstate = "dispatched"\nrole = "builder"\ndispatched_at = "2026-10-06T17:00:00Z"\n' });
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  const m = s.desk.model('Service-Desk');
  assert.equal(m.flagged.length, 0);
  assert.equal(m.ci, 'failing');
  for (const want of ["CI failing on main's head", 'PR #50 (draft): WIP', "can't parse: queue/odd.md", 'P-002: builder running for 2 h 0 min, past its limit']) {
    assert.ok(m.activity.some((a) => a.text === want), want);
  }
  assert.ok(m.activity.some((a) => a.kind === 'log'));
  assert.equal(s.screen().text, 'Quiet', 'activity never breaks quiet');
  // AC8: a failing default branch ranks third: below flagged and can't-read, above the rest.
  assert.equal(orderBoxes(s.boxes())[0].name, 'Service-Desk');
  s.poom.commit({ 'questions/Q-022.md': '# Ruling needed: z\n' });
  await s.clock.runUntil(START + POLL_MS + 1000);
  assert.deepEqual(orderBoxes(s.boxes()).map((b) => b.name), ['Personal-Org-Operating-Model', 'Service-Desk']);
});

test('AC8: each box shows its state, headline, sprint (v2.5) or open items with stages (v3), and CI', async () => {
  const s = setup();
  s.sd.commit({ 'status/P-002.toml': 'kind = "project"\nstage = 4\nstate = "ready"\nrole = "check-author"\n' });
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  const [poom, sdb] = orderBoxes(s.boxes());
  assert.equal(boxStateText(poom, 'America/Chicago'), 'quiet');
  assert.equal(poom.model.headline.text.slice(0, 8), 'L-0124 —');
  assert.equal(poom.model.sprint.title, 'm1.4 — v3 build: specs, tools, template and agent files');
  assert.equal(poom.ci, 'passing');
  assert.equal(sdb.model.headline.text, 'P-001 closed: re-scope (card stop-6), Oct 6 16:31'.replace('Oct 6 ', ''));
  assert.deepEqual(sdb.model.openItems.map((i) => `${i.id} ${i.stage}`), ['P-002 4 Lock the checks']);
});

test('Visibility: hidden pauses polling; visible again resumes, never sooner than 60 s after the last poll', async () => {
  const s = setup();
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  s.vis.v = false;
  s.desk.visibilityChanged();
  await s.clock.runUntil(START + 10 * MIN);
  assert.equal(s.server.calls.filter((c) => c.path === '/api/poll').length, 2);
  s.vis.v = true;
  s.desk.visibilityChanged();
  assert.equal(s.screen().text, 'Checking…', 'after a long hidden spell, not Quiet until read again');
  await s.clock.runUntil(START + 10 * MIN + 1000);
  assert.equal(s.server.calls.filter((c) => c.path === '/api/poll').length, 4);
  assert.equal(s.screen().text, 'Quiet');
});

test('The page\'s call: 403 → signed out; 5xx or a Cloudflare error page → cloudflare with its code; a failed fetch → network', async () => {
  const mk = (status, body, type) => async () => ({ status, ok: status >= 200 && status < 300, type: type || 'basic', text: async () => body });
  assert.equal((await callFunction('/api/poll', {}, mk(403, 'Forbidden'))).reason, 'signed-out');
  assert.equal((await callFunction('/api/poll', {}, mk(0, '', 'opaqueredirect'))).reason, 'signed-out');
  const cf = await callFunction('/api/poll', {}, mk(503, '<html>error code: 1102</html>'));
  assert.equal(cf.reason, 'cloudflare');
  assert.equal(cf.cfError, 1102);
  assert.equal((await callFunction('/api/poll', {}, mk(200, '<html>Error 1027</html>'))).cfError, 1027);
  assert.equal((await callFunction('/api/poll', {}, async () => { throw new TypeError('offline'); })).reason, 'network');
  const ok = await callFunction('/api/poll', { a: 1 }, async (url, init) => {
    assert.equal(init.method, 'POST');
    assert.equal(init.headers['Content-Type'], 'application/json');
    assert.equal(init.body, '{"a":1}');
    return { status: 200, ok: true, type: 'basic', text: async () => '{"state":"ok"}' };
  });
  assert.deepEqual(ok.json, { state: 'ok' });
});

test('A card file deleted without an answer is no longer flagged and shows as "withdrawn"', async () => {
  const s = setup();
  s.sd.commit({ 'queue/P-001-stop-6.md': sd('queue/P-001-stop-6.md') });
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  assert.equal(s.desk.model('Service-Desk').flagged.length, 1);
  s.sd.commit({ 'queue/P-001-stop-6.md': null });
  await s.clock.runUntil(START + POLL_MS + 1000);
  const m = s.desk.model('Service-Desk');
  assert.equal(m.flagged.length, 0);
  assert.ok(m.activity.some((a) => a.text === 'withdrawn: queue/P-001-stop-6.md'));
});

test('The cache: blobs are fetched by sha once and kept in storage; a broken storage only costs the cache', async () => {
  const backing = new Map();
  const storage = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, v) };
  const s = setup();
  s.desk.stop();
  const d1 = createDesk({ config: CONFIG, call: s.server.call, clock: s.clock, store: createStore(storage), isVisible: () => true });
  d1.start();
  await s.clock.runUntil(START + 1000);
  d1.stop();
  const blobCalls = () => s.server.calls.filter((c) => c.path === '/api/blobs').length;
  const before = blobCalls();
  const d2 = createDesk({ config: CONFIG, call: s.server.call, clock: s.clock, store: createStore(storage), isVisible: () => true });
  d2.start();
  await s.clock.runUntil(START + 2000);
  assert.equal(blobCalls(), before, 'a second opening needs no blob call');
  assert.equal(d2.model('Service-Desk').headline.text.startsWith('P-001 closed'), true);
  d2.stop();
  const broken = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
  const st = createStore(broken);
  const d3 = createDesk({ config: CONFIG, call: s.server.call, clock: s.clock, store: st, isVisible: () => true });
  d3.start();
  await s.clock.runUntil(START + 3000);
  assert.equal(st.usable, false);
  assert.equal(screenState(CONFIG.projects.map((p) => makeBox(d3.model(p.name), d3.states.get(p.name), d3, s.clock.now())), false).text, 'Quiet');
});
