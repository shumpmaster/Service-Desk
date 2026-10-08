// The Reviewer's PR #41 findings, as M2's criteria: one project's bad record never blanks another
// (AC30), record fields are type-checked (AC31), "Signed out" survives a render error (AC32), and a
// changing page error shows its latest words (AC34). AC33 is in j6-j8-function.test.mjs.
// ac-test: S-001/AC30 ac-test: S-001/AC31 ac-test: S-001/AC32 ac-test: S-001/AC34
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { safeBox, boxStateText, screenState, orderBoxes } from '../../src/lib/universe.js';
import { guardRender, SIGNED_OUT_STATE } from '../../src/lib/page.js';
import { parseStatus, parseLog } from '../../src/lib/records.js';
import { buildModel } from '../../src/lib/model.js';
import { fakeClock, fixture, CONFIG, SD } from './helpers.mjs';
import { repo, fakeServer, BAD_PR, BAD_LOG_LINE, gitSha } from './fake-desk.mjs';

const START = Date.parse('2026-10-06T19:00:00Z');
const TZ = CONFIG.ownerTimeZone;

function setup({ wrap } = {}) {
  const clock = fakeClock(START);
  const repos = {
    'Service-Desk': repo({
      'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
      'status/P-001.toml': fixture('service-desk/status/P-001@7da0fd7.toml'),
      'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
    }, [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]),
    'Personal-Org-Operating-Model': repo({
      'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'),
      'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md'),
    }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]),
  };
  const server = fakeServer(repos, CONFIG, clock);
  const ctl = { wrap: null };
  const call = async (path, body) => (ctl.wrap ? ctl.wrap(server.call, path, body) : server.call(path, body));
  const desk = createDesk({ config: CONFIG, call, clock, store: createStore(null), isVisible: () => true });
  const boxes = () => CONFIG.projects.map((p) => safeBox(p.name, () => desk.model(p.name), desk.states.get(p.name), desk, clock.now()));
  const view = (b) => ({ state: boxStateText(b, TZ), headline: b.model && b.model.headline.text, ci: b.ci, flagged: b.flaggedCount,
    sprint: b.model && b.model.sprint && b.model.sprint.title });
  return { clock, repos, desk, boxes, view, ctl, sd: repos['Service-Desk'] };
}

test('AC30: a record that throws in parsing, then one that throws in drawing: only that project\'s box shows it; the other is unchanged', async () => {
  const s = setup();
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  const before = s.view(s.boxes()[1]);
  assert.equal(before.state, 'quiet');
  assert.equal(screenState(s.boxes(), false).text, 'Quiet');

  // 1. Parsing: a new status file whose blob comes back as a value the parser can't turn into text.
  s.sd.commit({ 'status/P-002.toml': 'kind = "project"\nstate = "ready"\n' });
  const bad = gitSha('kind = "project"\nstate = "ready"\n');
  s.ctl.wrap = async (real, path, body) => {
    const r = await real(path, body);
    if (path === '/api/blobs' && r.ok && bad in (r.json.blobs || {})) r.json.blobs[bad] = { toString: 1, valueOf: 1 };
    return r;
  };
  await s.clock.runUntil(START + POLL_MS + 1000);
  let [sd, poom] = s.boxes();
  assert.equal(sd.read.read, 'cant-read');
  assert.equal(sd.read.reason, 'page');
  assert.match(boxStateText(sd, TZ), /^Can't read since \d\d:\d\d: the desk page hit an error reading this project's records \(/);
  assert.deepEqual(s.view(poom), before, 'the other box is unchanged');
  assert.equal(screenState(s.boxes(), false).quiet, false);

  // 2. Drawing: the parse problem is gone, but a pull request's title throws while the box is built.
  s.ctl.wrap = null;
  s.sd.pulls.push(BAD_PR);
  s.sd.commit({ 'status/P-002.toml': null });
  await s.clock.runUntil(START + 2 * POLL_MS + 1000);
  [sd, poom] = s.boxes();
  assert.equal(sd.read.read, 'ok', 'the project was read');
  assert.match(sd.drawError, /^Can't show this project: /);
  assert.match(boxStateText(sd, TZ), /^Can't show this project: /);
  assert.deepEqual(s.view(poom), before, 'the other box is unchanged');
  const screen = screenState(s.boxes(), false);
  assert.equal(screen.quiet, false);
  assert.equal(screen.text, "Not quiet: can't show 1 project");
  assert.equal(orderBoxes(s.boxes())[0].name, 'Service-Desk', 'ranked with can\'t-read boxes');
});

test('AC31: each J9 status field type with a wrong-typed value is named (file, line, field) and skipped; the rest is used', () => {
  const text = [
    '# Written only by the Orchestrator (model S-012 AC1).',
    'kind = 3',
    'stage = "three"',
    'state = "waiting-owner"',
    'role = false',
    'last_verdict = 1',
    'plan_round = "3"',
    'build_round = 1.5',
    'confirm_used = "no"',
    'attempts = null',
    'sessions = [6]',
    'dispatched_at = "yesterday"',
    'card = "6"',
    'gate = "stop"',
    'spec = 1',
    'outcome = {}',
    'mystery = "ignored"',
  ].join('\n');
  const r = parseStatus(text, 'status/P-001.toml');
  assert.equal(r.ok, true);
  assert.deepEqual(r.fields, { state: 'waiting-owner', gate: 'stop', mystery: 'ignored' });
  for (const [line, field] of [[2, 'kind'], [3, 'stage'], [5, 'role'], [6, 'last_verdict'], [7, 'plan_round'], [8, 'build_round'],
    [9, 'confirm_used'], [10, 'attempts'], [11, 'sessions'], [12, 'dispatched_at'], [13, 'card'], [15, 'spec'], [16, 'outcome']]) {
    assert.ok(r.notes.some((n) => n.startsWith(`status/P-001.toml line ${line} field ${field}: expected `)), `${field}: ${r.notes.join(' | ')}`);
  }
  const bad = parseStatus('state = "sleeping"\n', 'status/P-009.toml');
  assert.equal(bad.ok, false, 'a state outside the six is skipped too');
  assert.ok(bad.notes.some((n) => n.startsWith('status/P-009.toml line 1 field state: expected one of ready,')));
});

test('AC31: a skipped field shows "not recorded", never a wrong value or zero, and a skipped card never un-flags', () => {
  const status = 'kind = "project"\nstage = "three"\nstate = "waiting-owner"\ngate = "stop"\ncard = "6"\n';
  const base = { project: SD, config: CONFIG, now: new Date(START), pullPages: [], checkPages: [] };
  const mk = (files) => {
    const tree = new Map(Object.keys(files).map((p) => [p, { sha: gitSha(files[p]) }]));
    const records = new Map([['status/P-001.toml', parseStatus(status, 'status/P-001.toml')]]);
    return buildModel({ ...base, tree, records });
  };
  // With the card file on main: flagged through J2.
  let m = mk({ 'status/P-001.toml': status, 'queue/P-001-stop-6.md': fixture('service-desk/queue/P-001-stop-6.md') });
  const item = m.items.find((i) => i.id === 'P-001');
  assert.equal(item.stage, 'not recorded');
  assert.equal(item.waiting.card, 'not recorded');
  assert.ok(m.flagged.some((f) => f.kind === 'card' && f.card.path === 'queue/P-001-stop-6.md'));
  assert.ok(m.notes.some((n) => n.includes('status/P-001.toml line 2 field stage')));
  // Without it: the safety net still flags the status.
  m = mk({ 'status/P-001.toml': status });
  assert.deepEqual(m.flagged.map((f) => f.title), ['P-001: waiting on you: card stop-not recorded (card file not found)']);
});

test('AC31: dispatch-log lines with wrong-typed keys — `time` not a string skips the line; a non-needed key is dropped and named', () => {
  const text = [
    '{"action":"dispatch","item":"P-001","role":"critic","route":"r","stage":3,"time":1760000000}',
    '{"action":"dispatch","item":"P-001","role":"critic","route":"r","stage":"three","time":"2026-10-06T16:40:19Z"}',
    '{"trigger":"outcome","item":"P-001","role":"critic","session":42,"result":"ok","time":"2026-10-06T18:48:58Z"}',
    '{"trigger":"decision","record":"decisions/P-001/stop-6.md","proxy":"no","word":"re-scope","card":6,"gate":"stop","item":"P-001","time":"2026-10-06T21:31:02Z"}',
    '{"action":"card","item":"P-001","gate":"stop","card":"6","time":"2026-10-06T18:51:54Z"}',
    BAD_LOG_LINE,
  ].join('\n');
  const { entries, notes } = parseLog(text, 'dispatch-log/2026-10.jsonl');
  assert.deepEqual(entries.map((e) => e.line), [2, 4]);
  assert.equal(entries[0].stage, undefined, 'stage skipped: "not recorded", not "three" or 0');
  assert.equal(entries[1].proxy, undefined);
  for (const [line, field] of [[1, 'time'], [2, 'stage'], [3, 'session'], [4, 'proxy'], [5, 'card'], [6, 'item']]) {
    assert.ok(notes.some((n) => n.startsWith(`dispatch-log/2026-10.jsonl line ${line} field ${field}: expected `)), `${line} ${field}: ${notes.join(' | ')}`);
  }
});

test('AC32: while signed out the state line says so, even when building a box or the whole screen throws', () => {
  // The page's render: the line is set first, then the boxes; here the draw throws after that.
  const shown = [];
  const render = guardRender(() => {
    shown.push(SIGNED_OUT_STATE.text);
    safeBox('Service-Desk', () => { throw new TypeError('box broke'); }, { failure: null, lastSuccessAt: null }, { openedAt: 0, visibleSince: 0 }, 1);
    throw new Error('screen broke');
  }, (state) => shown.push(state.text), () => true);
  render();
  assert.deepEqual(shown, ['Signed out — reload to sign in', 'Signed out — reload to sign in']);
  // Not signed out: the render error shows as before.
  const other = [];
  guardRender(() => { throw new Error('screen broke'); }, (state) => other.push(state.text), () => false)();
  assert.match(other[0], /^Can't show the desk: screen broke/);
  // screenState says it whatever the boxes hold.
  const box = safeBox('X', () => { throw new Error('x'); }, { failure: null, lastSuccessAt: null }, { openedAt: 0, visibleSince: 0 }, 1);
  assert.equal(screenState([box], true).text, 'Signed out — reload to sign in');
});

test('AC34: two different page errors in two polls — the box shows the latest error, "since" keeps the first failure\'s time', async () => {
  const s = setup();
  let n = 0;
  s.ctl.wrap = async (real, path, body) => {
    if (body.project === 'Service-Desk' && path === '/api/poll') {
      n++;
      throw new Error(n === 1 ? 'first broken record' : 'second, different error');
    }
    return real(path, body);
  };
  s.desk.start();
  await s.clock.runUntil(START + 1000);
  let sd = s.boxes()[0];
  assert.equal(sd.read.reason, 'page');
  assert.match(sd.read.words, /first broken record/);
  const since = sd.read.since;
  await s.clock.runUntil(START + POLL_MS + 1000);
  sd = s.boxes()[0];
  assert.match(sd.read.words, /second, different error/);
  assert.doesNotMatch(sd.read.words, /first broken record/);
  assert.equal(sd.read.since, since, 'since keeps the first failure in the run');
  assert.match(boxStateText(sd, TZ), /second, different error/);
  // A success ends the run; the next failure starts a new "since".
  s.ctl.wrap = null;
  await s.clock.runUntil(START + 2 * POLL_MS + 1000);
  assert.equal(s.boxes()[0].read.read, 'ok');
});
