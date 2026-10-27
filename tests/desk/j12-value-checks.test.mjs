// The Chief of Staff's weekly value check pull requests are never a sprint (spec S-001, AC60 and J12, changed for M3B;
// built in stage VT1): J12 keeps, for each pull request, whether it changes `intake/value-checks.jsonl` only
// (`valueCheck`) and whether its `Milestone:` line, trimmed as a whole, is exactly `none (a weekly value check)`
// (`valueCheckLine`), never the paths or the line itself, under `desk-pulls-v4` (an entry kept under `desk-pulls-v3` read
// again, so none lacks them); a merged one of the planning project with both is left off the Timeline as an estimate's
// is; one changing another path, carrying another line, or in another project is placed as any pull request is. Every
// pull request numbered 990 and up here is made up (NOT a real record).
// join-test: S-001/J12 join-test: S-001/J25
// ac-test: S-001/AC60
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, fakeClock } from './helpers.mjs';
import { fakeServer } from './fake-desk.mjs';
import { j11Snapshot, SD3 } from './sandbox-helpers.mjs';
import { sdRepo } from './tv2-fixtures.mjs';
import { pullNodes, answerOf, node } from './j12-fixture.mjs';
import { judgePulls, keptPull, valueCheckOnly, valueCheckLine, PULLS_KEY, OLD_PULLS_KEYS, VALUE_CHECK_PATH, ESTIMATE_PATH } from '../../src/lib/pulls.js';
import { j11Records, timelineOf, phaseView } from '../../src/lib/sandbox.js';
import { runsContext, feedView, valueCheckMerge } from '../../src/lib/feed.js';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';

const NOW18 = Date.parse('2026-10-18T12:00:00Z');
const TZ = 'America/Chicago';
const PLANNER = { ...SD3, planning: true };
const VC_BODY = '## What this means for you\n\nThis week\'s value check.\n\nMilestone: none (a weekly value check)\n';
/** A made-up merged pull request (NOT a real record) with its changed paths. */
const chk = (number, { paths = [VALUE_CHECK_PATH], body = VC_BODY, mergedAt = '2026-10-17T20:00:00Z', files } = {}) => ({
  ...node(number, { title: `Weekly value check, made up ${number}`, body, mergedAt, head: `cos/value-check-${number}` }),
  changedFiles: paths.length, files: files !== undefined ? files : { nodes: paths.slice(0, 2).map((path) => ({ path })) },
});
const block = (feed, key) => feed.blocks.find((b) => b.key === key);
const rowsOf = (b) => [...(b.plannedRows || []), ...b.rows];
const ids = (feed) => feed.blocks.flatMap((b) => rowsOf(b).flatMap((x) => [...(x.sprints || []), ...(x.named || [])].map((s) => s.id)));
function feedOf(answer, { project = PLANNER, now = NOW18 } = {}) {
  const snap = j11Snapshot();
  const v = judgePulls(answer);
  snap.pulls = { list: v.pulls, failure: null, tooMany: false, fieldError: v.fieldError, current: true };
  const j = j11Records(project, snap);
  const tl = timelineOf(j);
  const pv = phaseView(project, tl, snap.tree, j);
  const ctx = runsContext(project, snap, j, tl, pv, now, TZ);
  return { feed: feedView(ctx, { pulls: [] }, now, TZ), list: v.pulls };
}
const untiedIn = (feed) => {
  const u = rowsOf(block(feed, 'Design-i2')).find((x) => x.kind === 'untied');
  return u ? u.sprints.map((s) => s.id) : [];
};

test('J12 (value checks): one changed path, intake/value-checks.jsonl, gives yes; two paths, another path, or paths not read, no; the line matched whole and exactly; the kept entry holds both yes or nos, never the paths', () => {
  assert.equal(VALUE_CHECK_PATH, 'intake/value-checks.jsonl');
  assert.equal(valueCheckOnly(chk(990)), true);
  assert.equal(valueCheckOnly(chk(991, { paths: [VALUE_CHECK_PATH, ESTIMATE_PATH] })), false);
  assert.equal(valueCheckOnly(chk(992, { paths: [ESTIMATE_PATH] })), false);
  assert.equal(valueCheckOnly(chk(993, { paths: ['docs/intake/value-checks.jsonl'] })), false);
  assert.equal(valueCheckOnly(chk(994, { files: null })), false);
  assert.equal(valueCheckOnly(chk(995), true), false, 'a field error on its paths: not read');
  assert.equal(valueCheckLine(VC_BODY), true);
  assert.equal(valueCheckLine('Milestone:   none (a weekly value check)  \n'), true, 'trimmed as a whole');
  assert.equal(valueCheckLine('Milestone: none ( a weekly value check)\n'), false);
  assert.equal(valueCheckLine('Milestone: none (A weekly value check)\n'), false);
  assert.equal(valueCheckLine('Milestone: none (a rough estimate)\n'), false);
  const k = keptPull(chk(990), null);
  assert.deepEqual([k.valueCheck, k.valueCheckLine, k.estimate, k.estimateLine], [true, true, false, false]);
  assert.doesNotMatch(JSON.stringify(k), /value-checks\.jsonl|changedFiles|"files"/, 'never the paths (the `Milestone:` line\'s reason is AC61 (c)\'s, kept as for any pull request)');
  const v = judgePulls(answerOf([chk(990), chk(996, { paths: ['src/x.js'] })]));
  assert.deepEqual(v.pulls.map((p) => [p.number, p.valueCheck, p.valueCheckLine]), [[990, true, true], [996, false, true]]);
  assert.ok(judgePulls(answerOf(pullNodes())).pulls.every((p) => p.valueCheck === false), 'none of the real fixture\'s is one');
});

test('J12 (value checks): the kept list moves to desk-pulls-v4; an entry kept under desk-pulls-v3 is removed on load and read again from J12, so none lacks the two yes or nos; the requests per J12 read are unchanged', async () => {
  assert.equal(PULLS_KEY, 'desk-pulls-v4');
  assert.deepEqual(OLD_PULLS_KEYS, ['desk-pulls-v1', 'desk-pulls-v2', 'desk-pulls-v3']);
  // A v3 entry, as a device that loaded the desk before VT1 holds it: no value-check yes or no.
  const v3 = { [SD3.name]: { day: '2026-10-18', head: null, tooMany: false, pulls: judgePulls(answerOf([chk(990)])).pulls.map((p) => { const q = { ...p }; delete q.valueCheck; delete q.valueCheckLine; return q; }) } };
  const backing = new Map([['desk-pulls-v3', JSON.stringify(v3)]]);
  const storage = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, v), removeItem: (k) => backing.delete(k) };
  const r = sdRepo({ answer: answerOf([chk(990), ...pullNodes()]) });
  const clock = fakeClock(Date.parse('2026-10-18T09:00:00Z'));
  const config = { ...CONFIG, projects: [PLANNER] };
  const server = fakeServer({ [SD3.name]: r }, config, clock);
  const desk = createDesk({ config, call: (p, b) => server.call(p, b), clock, store: createStore(null), pullsStore: createStore(storage), isVisible: () => true, j11: true });
  assert.equal(backing.has('desk-pulls-v3'), false, 'v3 removed on load');
  desk.start();
  await clock.runUntil(clock.now() + 3 * POLL_MS);
  desk.stop();
  assert.equal(server.calls.filter((c) => c.path === '/api/blobs' && c.body.pulls).length, 1, 'one J12 read, as before');
  const kept = JSON.parse(backing.get('desk-pulls-v4'))[SD3.name].pulls;
  assert.ok(kept.every((p) => typeof p.valueCheck === 'boolean' && typeof p.valueCheckLine === 'boolean'), 'every entry read again, with both');
  assert.deepEqual(kept.filter((p) => p.valueCheck && p.valueCheckLine).map((p) => p.number), [990]);
});

test('AC60 (value checks): a merged pull request of the planning project changing only intake/value-checks.jsonl, `Milestone: none (a weekly value check)`, is off the Timeline — on no milestone, under no "Not tied to a milestone" line, giving its run no time', () => {
  const none = feedOf(answerOf([])).feed;
  const { feed, list } = feedOf(answerOf([chk(990)]));
  assert.equal(valueCheckMerge(PLANNER, list[0]), true);
  assert.ok(!ids(feed).includes('PR #990'));
  assert.deepEqual(untiedIn(feed), [], 'never a gap under "Not tied to a milestone"');
  assert.equal(block(feed, 'Design-i2').band.words, block(none, 'Design-i2').band.words, 'no time given to its run');
});

test('AC60 (value checks): placed as any pull request — another changed path, another `Milestone:` line (another letter case included), its paths not read, and one in a project without `planning: true`', () => {
  const cases = [
    ['another path too', chk(991, { paths: [VALUE_CHECK_PATH, 'intake/estimates.jsonl'] })],
    ['another path', chk(992, { paths: ['src/x.js'] })],
    ['Milestone: none (other)', chk(993, { body: 'Milestone: none (other)\n' })],
    ['another letter case', chk(994, { body: 'Milestone: none (A weekly value check)\n' })],
    ['files null', chk(995, { files: null })],
  ];
  for (const [why, n] of cases) assert.deepEqual(untiedIn(feedOf(answerOf([n])).feed), [`PR #${n.number}`], why);
  assert.deepEqual(untiedIn(feedOf(answerOf([chk(996)]), { project: { ...SD3, planning: false } }).feed), ['PR #996'], 'not the planning project');
  assert.equal(valueCheckMerge({ ...SD3, planning: false }, judgePulls(answerOf([chk(996)])).pulls[0]), false);
});
