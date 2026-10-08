// The desk keeps reading, and never shows a false "Quiet", when something goes wrong on the page
// side (PR #40 review, N3 to N6): needed blobs that never arrive, a throw while rendering or
// building the model, a call that never answers, and a malformed route.
// ac-test: S-001/AC4 ac-test: S-001/AC5
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk, POLL_MS, callFunction, CALL_TIMEOUT_MS, errorText } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { makeBox, safeBox, boxStateText, screenState, readState } from '../../src/lib/universe.js';
import { routeParts, guardRender, renderErrorState, boot } from '../../src/lib/page.js';
import { fakeClock, fixture, CONFIG } from './helpers.mjs';
import { repo, fakeServer, BAD_PR } from './fake-desk.mjs';

const START = Date.parse('2026-10-06T19:00:00Z');
const MIN = 60_000;
const sd = (p) => fixture(`service-desk/${p}`);


function repos({ badRecord = false } = {}) {
  const log = fixture('service-desk/dispatch-log/2026-10.jsonl');
  return {
    'Service-Desk': repo({
      'queue/README.md': sd('queue/README.md'),
      'governance/ROUTING.toml': sd('governance/ROUTING.toml'),
      'status/P-001.toml': fixture('service-desk/status/P-001@7da0fd7.toml'),
      'dispatch-log/2026-10.jsonl': log,
      'questions/_TEMPLATE.md': sd('questions/_TEMPLATE.md'),
    }, badRecord ? [BAD_PR] : [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]),
    'Personal-Org-Operating-Model': repo({
      'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'),
      'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md'),
    }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]),
  };
}

function setup({ badRecord = false, call: wrap, onChange } = {}) {
  const clock = fakeClock(START);
  const r = repos({ badRecord });
  const server = fakeServer(r, CONFIG, clock);
  const call = wrap ? wrap(server.call) : server.call;
  const ref = {};
  const desk = createDesk({ config: CONFIG, call, clock, store: createStore(null), isVisible: () => true,
    onChange: onChange ? () => onChange(ref.desk) : undefined });
  ref.desk = desk;
  const boxes = () => CONFIG.projects.map((p) => makeBox(desk.model(p.name), desk.states.get(p.name), desk, clock.now()));
  const polls = (name) => server.calls.filter((c) => c.path === '/api/poll' && c.project === name).length;
  return { clock, repos: r, server, desk, boxes, polls };
}

// ---------------------------------------------------------------------------
// N3: the guards behind "read successfully" (AC4).

test('AC4 (review N3): while needed blobs are missing the project is never read — it is can\'t-read, never Quiet', async () => {
  // The blob call answers ok but hands back no text for any blob (as if GitHub returned nothing).
  const s = setup({
    call: (real) => async (path, body) => {
      const r = await real(path, body);
      if (path === '/api/blobs' && r.ok) {
        return { ...r, json: { ...r.json, blobs: Object.fromEntries(Object.keys(r.json.blobs).map((k) => [k, null])) } };
      }
      return r;
    },
  });
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  for (const p of CONFIG.projects) {
    const st = s.desk.states.get(p.name);
    assert.equal(st.lastSuccessAt, null, `${p.name} is not read while its blobs are missing`);
    assert.equal(st.failure && st.failure.reason, 'github', p.name);
    // The blob loop stops at its per-cycle bound; it doesn't spin.
    assert.ok(st.blobCalls >= 1 && st.blobCalls <= 6, `${p.name}: ${st.blobCalls} blob calls`);
  }
  const screen = screenState(s.boxes(), s.desk.signedOut);
  assert.notEqual(screen.text, 'Quiet');
  assert.equal(screen.quiet, false);
  assert.ok(s.boxes().every((b) => b.read.read === 'cant-read'));
  // Still polled on schedule, never sooner.
  await s.clock.runUntil(START + POLL_MS + 1000);
  assert.equal(s.polls('Service-Desk'), 2);
});

test('AC4 (review N3): a success from before this opening does not count — readState says "Checking…", then can\'t-read when stale', () => {
  const desk = { openedAt: START, visibleSince: START };
  const before = { lastSuccessAt: START - 1000, failure: null };
  assert.equal(readState(before, desk, START + 1000).read, 'checking', 'read 1 s before opening is not "read since opening"');
  assert.equal(readState(before, desk, START + 3 * MIN + 1).read, 'cant-read');
  assert.equal(readState(before, desk, START + 3 * MIN + 1).since, START, 'counted from the opening, not the old read');
  // The same read at or after the opening counts.
  assert.equal(readState({ lastSuccessAt: START, failure: null }, desk, START + 1000).read, 'ok');
  assert.equal(readState({ lastSuccessAt: START + 500, failure: null }, desk, START + 1000).read, 'ok');
  const box = (st) => ({ flaggedCount: 0, read: readState(st, desk, START + 1000) });
  assert.equal(screenState([box(before), box({ lastSuccessAt: START + 500, failure: null })], false).text, 'Checking…');
});

// ---------------------------------------------------------------------------
// N4: a throw while rendering or building the model never stops polling.

test('AC5 (review N4) + AC30: a record that makes building the model throw; polling goes on and the screen is never a frozen Quiet', async () => {
  const shown = [];
  let renders = 0;
  // onChange does what the page's render does: build every box (each on its own), and the screen state.
  const s = setup({
    badRecord: true,
    onChange: (desk) => {
      renders++;
      const render = guardRender(() => {
        const bx = CONFIG.projects.map((p) => safeBox(p.name, () => desk.model(p.name), desk.states.get(p.name), desk, START));
        shown.push(screenState(bx, desk.signedOut).text);
      }, (state) => shown.push(state.text));
      render();
    },
  });
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  assert.throws(() => s.desk.model('Service-Desk'), TypeError, 'the example really throws while building the model');
  assert.ok(renders >= 2);
  assert.ok(shown.length >= 2);
  assert.ok(!shown.includes('Quiet'), shown.join(' | '));
  assert.ok(shown.some((t) => t.includes("can't show 1 project")), shown.join(' | '));
  await s.clock.runUntil(START + 3 * POLL_MS + 1000);
  assert.equal(s.polls('Service-Desk'), 4, 'polled every 60 s');
  assert.equal(s.polls('Personal-Org-Operating-Model'), 4);
});

test('AC5 (review N4): an onChange that throws outright still leaves the next poll scheduled', async () => {
  const s = setup({ onChange: () => { throw new Error('render failed'); } });
  s.desk.start();
  // The throw is contained: no unhandled rejection escapes the timer (node:test would fail on one).
  await s.clock.runUntil(START + 2 * POLL_MS + 1000);
  assert.equal(s.polls('Service-Desk'), 3);
  assert.equal(s.polls('Personal-Org-Operating-Model'), 3);
  assert.doesNotThrow(() => s.desk.visibilityChanged(), 'nor from a visibility change');
});

test('AC5 (review N4): a throw inside a project\'s read (here, the call itself) is a can\'t-read cycle, and polling goes on', async () => {
  let n = 0;
  const s = setup({
    call: (real) => async (path, body) => {
      if (body.project === 'Service-Desk' && path === '/api/poll' && n++ === 0) throw new TypeError('boom');
      return real(path, body);
    },
  });
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  const st = s.desk.states.get('Service-Desk');
  assert.equal(st.failure.reason, 'page');
  assert.match(boxStateText(s.boxes().find((b) => b.name === 'Service-Desk'), 'America/Chicago'),
    /^Can't read since 14:00: the desk page hit an error reading this project's records \(boom\)/);
  assert.notEqual(screenState(s.boxes(), false).text, 'Quiet');
  await s.clock.runUntil(START + POLL_MS + 1000);
  assert.equal(st.failure, null, 'the next poll read it');
  assert.equal(screenState(s.boxes(), false).text, 'Quiet');
});

test('Render guard: a throw shows the error state; errorText survives values that cannot be printed', () => {
  const calls = [];
  const render = guardRender(() => { throw new Error('bad'); }, (state, err) => calls.push([state, err.message]));
  render();
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0].quiet, false);
  assert.equal(calls[0][0].className, 'cant-read');
  assert.match(calls[0][0].text, /^Can't show the desk: bad\./);
  // The error handler throwing too is swallowed: render itself never throws.
  assert.doesNotThrow(guardRender(() => { throw new Error('a'); }, () => { throw new Error('b'); }));
  // A thrown value with a hostile message.
  const hostile = { get message() { throw new Error('no'); } };
  assert.equal(errorText(hostile), 'unknown error');
  assert.equal(errorText({ toString: 1, valueOf: 1 }), 'unknown error');
  assert.equal(errorText(null), 'unknown error');
  assert.match(renderErrorState(hostile).text, /unknown error/);
});

// ---------------------------------------------------------------------------
// N5: the page's call has a timeout that maps to the network can't-read path.

test('AC5 (review N5): a call that does not answer within the timeout is aborted and reads as a network failure', async () => {
  assert.equal(CALL_TIMEOUT_MS, 30_000);
  // A fetch that never answers but honours the abort signal.
  let signal = null;
  const hangs = (url, init) => new Promise((resolve, reject) => {
    signal = init.signal;
    init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
  });
  const r1 = await callFunction('/api/poll', {}, hangs, { timeoutMs: 20 });
  assert.equal(r1.ok, false);
  assert.equal(r1.reason, 'network');
  assert.match(r1.words, /^network error: the desk's function could not be reached \(no answer within 0 s\)$/);
  assert.equal(signal.aborted, true);
  // A fetch that ignores the signal entirely: the call still ends.
  const deaf = () => new Promise(() => {});
  assert.equal((await callFunction('/api/poll', {}, deaf, { timeoutMs: 20 })).reason, 'network');
  // Headers arrive, but the body never finishes.
  const slowBody = async () => ({ status: 200, ok: true, type: 'basic', text: () => new Promise(() => {}) });
  assert.equal((await callFunction('/api/poll', {}, slowBody, { timeoutMs: 20 })).reason, 'network');
  // A prompt answer is unaffected, and its timer is cleared (the test would hang otherwise).
  const prompt = async () => ({ status: 200, ok: true, type: 'basic', text: async () => '{"state":"ok"}' });
  assert.deepEqual((await callFunction('/api/poll', {}, prompt)).json, { state: 'ok' });
});

test('AC5 (review N5): through the scheduler, a timed-out call shows "Can\'t read since HH:MM" with the network reason', async () => {
  const s = setup({
    call: (real) => (path, body) => (body.project === 'Service-Desk'
      ? callFunction(path, body, () => new Promise(() => {}), { timeoutMs: 20 })
      : real(path, body)),
  });
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  await new Promise((r) => setTimeout(r, 60));
  await s.clock.flush();
  const box = s.boxes().find((b) => b.name === 'Service-Desk');
  assert.equal(box.read.read, 'cant-read');
  assert.equal(box.read.reason, 'network');
  assert.match(boxStateText(box, 'America/Chicago'), /^Can't read since 14:00: network error: the desk's function could not be reached/);
  assert.equal(s.desk.states.get('Service-Desk').pending, false, 'the cycle ended');
  assert.notEqual(screenState(s.boxes(), false).text, 'Quiet');
});

// ---------------------------------------------------------------------------
// N6: a malformed route never stops the desk from starting.

test('Routes (review N6): a malformed hash falls back to the Universe; good hashes decode as before', () => {
  assert.deepEqual(routeParts('#/p/%E0'), []);
  assert.deepEqual(routeParts('#/p/Service-Desk/card/%E0%A4%A'), []);
  assert.deepEqual(routeParts(''), []);
  assert.deepEqual(routeParts(undefined), []);
  assert.deepEqual(routeParts('#/'), []);
  assert.deepEqual(routeParts('#/p/Service-Desk'), ['p', 'Service-Desk']);
  assert.deepEqual(routeParts(`#/p/${encodeURIComponent('Personal-Org-Operating-Model')}/card/${encodeURIComponent('queue/P-001-stop-6.md')}`),
    ['p', 'Personal-Org-Operating-Model', 'card', 'queue/P-001-stop-6.md']);
});

test('Start-up (review N6): the desk starts even when the first render throws', () => {
  let started = 0;
  boot(() => { throw new Error('first render'); }, { start: () => { started++; } });
  assert.equal(started, 1);
  boot(() => {}, { start: () => { started++; } });
  assert.equal(started, 2);
});
