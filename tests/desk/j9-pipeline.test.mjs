// join-test: S-001/J9 — pipeline records → read model (page side), with the samples J9 quotes:
// status/P-001.toml at d4d0110, def1e83, b787280 and on main; dispatch-log/2026-10.jsonl (192
// lines); governance/ROUTING.toml; and the v2.5 sprint and ledger lines from
// Personal-Org-Operating-Model at 677fe5a.
// ac-test: S-001/AC9 — the v3 pipeline view. ac-test: S-001/AC10 — the v2.5 reduced view.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStatus, parseRouting, timeLimitMinutes, parseLog, entryWords, markRetries, stageName, parseSprint, parseLedger } from '../../src/lib/records.js';
import { buildModel, parseRecord, neededReads, V25_NOT_RECORDED } from '../../src/lib/model.js';
import { whenText } from '../../src/lib/timefmt.js';
import { fixture, CONFIG, SD, POOM } from './helpers.mjs';

const status = (c) => fixture(`service-desk/status/P-001@${c}.toml`);
const LOG = fixture('service-desk/dispatch-log/2026-10.jsonl');
const ROUTING = fixture('service-desk/governance/ROUTING.toml');
const TZ = 'America/Chicago';

test('J9 status files: the dump_status subset parses, every line accounted for', () => {
  const s = parseStatus(status('d4d0110'));
  assert.equal(s.ok, true);
  assert.deepEqual(s.notes, []);
  assert.deepEqual(s.fields, { kind: 'project', stage: 3, state: 'dispatched', role: 'critic-triage', last_verdict: 'none',
    plan_round: 3, build_round: 0, confirm_used: false, attempts: 0, sessions: 6, dispatched_at: '2026-10-06T18:48:58Z', card: 5, spec: 'S-001' });
  assert.equal(parseStatus(status('def1e83')).fields.state, 'waiting-owner');
  assert.equal(parseStatus(status('b787280')).fields.role, 'definer');
  assert.equal(parseStatus(status('7da0fd7')).fields.outcome, 're-scope');
  const bad = parseStatus('# c\nstate = "dispatched"\nweird line\nkind = not-json\n');
  assert.equal(bad.notes.length, 2);
  assert.equal(parseStatus('nonsense').ok, false);
});

test('J9 stage names', () => {
  assert.equal(stageName(2), '2 Shape');
  assert.equal(stageName(3), '3 Define');
  assert.equal(stageName(4), '4 Lock the checks');
  assert.equal(stageName(5), '5 Produce');
  assert.equal(stageName(6), '6 Launch');
  assert.equal(stageName(8), '8 Evidence');
  assert.equal(stageName(7), 'stage 7');
});

test('J9 ROUTING.toml: [limits] and [time_limits] as integers; 30 + 15 when unreadable', () => {
  const r = parseRouting(ROUTING);
  assert.equal(r.timeLimits.default, 30);
  assert.equal(r.limits.stall_grace_minutes, 15);
  assert.equal(timeLimitMinutes(r, 'critic').minutes, 45);
  const none = timeLimitMinutes(null, 'critic');
  assert.equal(none.minutes, 45);
  assert.equal(none.notes.length, 1);
});

test('J9 dispatch log: the 192 lines of 2026-10.jsonl all match a known shape', () => {
  const { entries, notes } = parseLog(LOG);
  assert.equal(entries.length, 192);
  assert.deepEqual(notes, []);
  const shapes = new Set(entries.map((e) => e.shape));
  assert.deepEqual([...shapes].sort(), ['anomaly', 'card', 'decision', 'dispatch', 'done', 'outcome', 'request']);
  const bad = parseLog('not json\n{"time":"2026-10-01T00:00:00Z","trigger":"mystery"}\n');
  assert.equal(bad.entries.length, 0);
  assert.equal(bad.notes.length, 2);
});

test('J9 headline: the last line of 2026-10.jsonl reads "P-001 closed: re-scope (card stop-6), 16:31" at UTC−5', () => {
  const { entries } = parseLog(LOG);
  const last = entries[entries.length - 1];
  const now = new Date('2026-10-06T23:00:00Z');
  assert.equal(entryWords(last, whenText(new Date(last.time), now, TZ)), 'P-001 closed: re-scope (card stop-6), 16:31');
  assert.equal(whenText(new Date(last.time), new Date('2026-10-08T15:00:00Z'), TZ), 'Oct 6 16:31');
  const t = 'T';
  assert.equal(entryWords({ shape: 'request', item: 'Q-001' }, t), 'Q-001 created, T');
  assert.equal(entryWords({ shape: 'dispatch', item: 'P-001', role: 'definer', stage: 3 }, t), 'P-001: definer started (Define), T');
  assert.equal(entryWords({ shape: 'outcome', item: 'P-001', role: 'critic', result: 'ok', verdict: 'FAIL' }, t), 'P-001: critic finished — ok, verdict FAIL, T');
  assert.equal(entryWords({ shape: 'outcome', item: 'Q-001', role: 'researcher', result: 'ok', verdict: 'none' }, t), 'Q-001: researcher finished — ok, T');
  assert.equal(entryWords({ shape: 'card', item: 'P-001', gate: 'stop', card: 6 }, t), 'P-001: waiting on you — card stop-6, T');
  assert.equal(entryWords({ shape: 'decision', item: 'Q-002', gate: 'stop', card: 1, word: 're-specify', result: 'ready/2/researcher', proxy: true }, t),
    'Q-002: you answered stop-1 with re-specify, T (proxy)');
  assert.equal(entryWords({ shape: 'done', item: 'Q-001' }, t), 'Q-001 done, T');
  assert.equal(entryWords({ shape: 'anomaly', item: 'Q-006' }, t), 'Q-006: Orchestrator anomaly, T');
});

test('J9 retries: the P-001 definer re-dispatched at 2026-10-05T22:50:13Z after an error is a retry', () => {
  const { entries } = parseLog(LOG);
  markRetries(entries);
  const retry = entries.find((e) => e.shape === 'dispatch' && e.time === '2026-10-05T22:50:13Z');
  assert.equal(retry.item, 'P-001');
  assert.equal(retry.role, 'definer');
  assert.equal(retry.retry, true);
  const first = entries.find((e) => e.shape === 'dispatch' && e.time === '2026-10-01T01:46:42Z');
  assert.equal(first.retry, undefined);
});

function sdTree(paths) {
  const m = new Map();
  let i = 0;
  for (const p of paths) m.set(p, { sha: (++i).toString(16).padStart(40, '9'), size: 100 });
  return m;
}
function v3Model(statusText, now, extraTree = [], extraRecords = {}) {
  const tree = sdTree(['status/P-001.toml', 'governance/ROUTING.toml', 'dispatch-log/2026-10.jsonl', 'dispatch-log/2026-09.jsonl', ...extraTree]);
  const records = new Map([
    ['status/P-001.toml', parseRecord('status', statusText)],
    ['governance/ROUTING.toml', parseRecord('routing', ROUTING)],
    ['dispatch-log/2026-10.jsonl', parseRecord('log', LOG, 'dispatch-log/2026-10.jsonl')],
    ['dispatch-log/2026-09.jsonl', parseRecord('log', '', 'dispatch-log/2026-09.jsonl')],
    ...Object.entries(extraRecords),
  ]);
  return buildModel({ project: SD, config: CONFIG, tree, records, now, pullPages: [], checkPages: [] });
}

test('AC9: dispatched — running now with role and how long; past its limit becomes activity', () => {
  let m = v3Model(status('d4d0110'), new Date('2026-10-06T19:00:00Z'));
  let item = m.items[0];
  assert.equal(item.id, 'P-001');
  assert.equal(item.kind, 'project');
  assert.equal(item.stage, '3 Define');
  assert.equal(item.running.role, 'critic-triage');
  assert.equal(item.running.elapsed, '11 min');
  assert.equal(item.running.pastLimit, false);
  assert.equal(item.asOf.toISOString(), '2026-10-06T21:31:02.000Z'); // the item's latest dispatch-log entry
  m = v3Model(status('d4d0110'), new Date('2026-10-06T19:40:00Z'));
  assert.equal(m.items[0].running.pastLimit, true);
  assert.ok(m.activity.some((a) => a.text === 'P-001: critic-triage running for 51 min, past its limit'));
  assert.equal(m.flagged.length, 0, 'an overrun is activity, not a flag');
});

test('AC9: waiting-owner — the card, flagged and linked; with no card file, the safety-net flag', () => {
  let m = v3Model(status('def1e83'), new Date('2026-10-06T19:00:00Z'), ['queue/P-001-stop-6.md']);
  const item = m.items[0];
  assert.equal(item.waiting.path, 'queue/P-001-stop-6.md');
  assert.equal(item.waiting.answered, false);
  assert.deepEqual(m.flagged.map((f) => f.kind), ['card']);
  m = v3Model(status('def1e83'), new Date('2026-10-06T19:00:00Z'));
  assert.deepEqual(m.flagged.map((f) => f.title), ['P-001: waiting on you: card stop-6 (card file not found)']);
});

test('AC9: ready and returned give what is next; done and closed fold into one line with the outcome', () => {
  let m = v3Model(status('b787280'), new Date('2026-10-06T19:00:00Z'));
  assert.equal(m.items[0].next, 'next: definer (Define)');
  const returned = status('d4d0110').replace('state = "dispatched"', 'state = "returned"').replace('last_verdict = "none"', 'last_verdict = "FAIL"');
  m = v3Model(returned, new Date('2026-10-06T19:00:00Z'));
  assert.equal(m.items[0].next, "next: the Orchestrator routes the critic-triage's return (verdict FAIL)");
  m = v3Model(status('7da0fd7'), new Date('2026-10-06T22:00:00Z'));
  assert.equal(m.items[0].finished, 'closed: re-scope');
  assert.equal(m.openItems.length, 0);
  m = v3Model('kind = "research"\nstage = 2\nstate = "done"\n', new Date('2026-10-06T22:00:00Z'));
  assert.equal(m.items[0].finished, 'done');
});

test('AC9: a field the records don\'t give is "not recorded"; a status file that won\'t parse is kept, "can\'t read status"', () => {
  let m = v3Model('state = "ready"\n', new Date('2026-10-06T19:00:00Z'));
  assert.equal(m.items[0].kind, 'not recorded');
  assert.equal(m.items[0].stage, 'not recorded');
  assert.equal(m.items[0].next, 'next: not recorded (not recorded)');
  m = v3Model('garbage', new Date('2026-10-06T19:00:00Z'));
  assert.equal(m.items[0].unreadable, true);
  assert.ok(m.activity.some((a) => a.text === "P-001: can't read status"));
});

test('J9: the headline is the latest entry; anomalies, retries and dispatches without an outcome are activity', () => {
  const m = v3Model(status('7da0fd7'), new Date('2026-10-06T23:00:00Z'));
  assert.equal(m.headline.text, 'P-001 closed: re-scope (card stop-6), 16:31');
  // The last 15 entries are listed; check the shapes the log ends with.
  assert.ok(m.activity.some((a) => a.kind === 'log' && a.text.startsWith('P-001 closed: re-scope')));
  // Q-006's anomaly and its dispatch with no outcome (line 121 and its dispatch) are in an older window:
  const all = parseLog(LOG).entries;
  const upto = all.findIndex((e) => e.shape === 'anomaly') + 1;
  const m2 = v3Model(status('7da0fd7'), new Date('2026-10-04T02:00:00Z'), [], {
    'dispatch-log/2026-10.jsonl': parseRecord('log', LOG.split('\n').slice(0, upto).join('\n'), 'dispatch-log/2026-10.jsonl') });
  assert.ok(m2.activity.some((a) => a.text.startsWith('Q-006: Orchestrator anomaly') && a.text.includes('the item is returned, not dispatched')));
  assert.ok(m2.activity.some((a) => a.text.startsWith('Q-006: source-checker started') && a.text.endsWith('no outcome recorded')));
});

test('J9: a missing record shows "not found" in the notes; the project is not can\'t-read', () => {
  const m = buildModel({ project: SD, config: CONFIG, tree: sdTree(['status/P-001.toml']), records: new Map([['status/P-001.toml', parseRecord('status', status('b787280'))]]),
    now: new Date('2026-10-06T19:00:00Z'), pullPages: [], checkPages: [] });
  assert.ok(m.notes.includes('dispatch log: not found'));
  assert.ok(m.notes.includes('governance/ROUTING.toml: not found'));
  assert.equal(m.headline.text, 'not recorded');
});

const poom = (p) => fixture(`poom/${p}`);
function v25Tree(open = ['m1.4-v3-build.md']) {
  const files = ['m1.1-foundation.md', 'm1.2-enforcement-and-pilot.md', 'm1.3-pilot-and-s004.md', 'm1.4-v3-build.md'];
  const tree = new Map();
  const records = new Map();
  let i = 0;
  for (const f of [...files, 'PROGRESS.md', 'SPRINT_PLAN.md']) tree.set(`docs/sprints/${f}`, { sha: (++i).toString(16).padStart(40, '7') });
  tree.set('docs/LEDGER.md', { sha: 'a'.repeat(40) });
  for (const f of files) {
    let text = poom(`docs/sprints/${f}`);
    text = open.includes(f) ? text.replace('status: closed', 'status: open') : text.replace('status: open', 'status: closed');
    records.set(`docs/sprints/${f}`, parseRecord('sprint', text));
  }
  records.set('docs/LEDGER.md', parseRecord('ledger', poom('docs/LEDGER.md')));
  return { tree, records };
}

test('AC10 + J9 v2.5: sprint, headline, next and as of from the ledger; items and running now "not recorded"', () => {
  assert.deepEqual(parseSprint(poom('docs/sprints/m1.4-v3-build.md')), { title: 'm1.4 — v3 build: specs, tools, template and agent files', open: true });
  assert.equal(parseSprint(poom('docs/sprints/m1.1-foundation.md')).open, false);
  const l = parseLedger(poom('docs/LEDGER.md'));
  assert.equal(l.id, 'L-0124');
  assert.equal(l.title, "Continue Service-Desk under the full process, with a checkpoint; S-017's supersession covers two more token pins");
  assert.equal(l.next, "S-017 build review round 2; then the owner's verdict on PR 20 and Service-Desk's adoption.");
  assert.equal(l.date, '2026-10-05');
  const { tree, records } = v25Tree();
  const m = buildModel({ project: POOM, config: CONFIG, tree, records, now: new Date('2026-10-06T19:00:00Z'), pullPages: [], checkPages: [] });
  assert.equal(m.sprint.title, 'm1.4 — v3 build: specs, tools, template and agent files');
  assert.equal(m.headline.text, `L-0124 — ${l.title}`);
  assert.equal(m.headline.next, l.next);
  assert.equal(m.headline.asOf, '2026-10-05');
  assert.equal(m.itemsText, V25_NOT_RECORDED);
  assert.equal(m.runningText, "not recorded in this repository's records (operating model v2.5.1)");
  assert.equal(m.items, null);
  // Zero or two open sprints: "sprint unclear", a note, not a flag.
  for (const open of [[], ['m1.3-pilot-and-s004.md', 'm1.4-v3-build.md']]) {
    const t = v25Tree(open);
    const mm = buildModel({ project: POOM, config: CONFIG, tree: t.tree, records: t.records, now: new Date(), pullPages: [], checkPages: [] });
    assert.equal(mm.sprint.note, 'sprint unclear');
    assert.equal(mm.flagged.length, 0);
  }
});

test('J9 + J6 v2.5: the blobs needed are the ledger and the sprint files other than PROGRESS.md and SPRINT_PLAN.md', () => {
  const { tree } = v25Tree();
  tree.set('status/P-001.toml', { sha: 'b'.repeat(40) }); // not read in a v2.5 project
  const need = neededReads(POOM, tree, new Map(), new Date());
  assert.deepEqual(need.blobs.map((b) => b.path).sort(), ['docs/LEDGER.md', 'docs/sprints/m1.1-foundation.md',
    'docs/sprints/m1.2-enforcement-and-pilot.md', 'docs/sprints/m1.3-pilot-and-s004.md', 'docs/sprints/m1.4-v3-build.md']);
});
