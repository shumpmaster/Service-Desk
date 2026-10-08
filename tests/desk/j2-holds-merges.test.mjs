// join-test: S-001/J2 — from M2: the Orchestrator's hold cards and merge cards, in the exact formats
// `hold_card` and `MergeGate.fail` write (governance/checks/orchestrator_git.py:1233–1245 and
// :2887–2910; fixtures under fixtures/orchestrator-m2/), a status/merges.jsonl line in its real form
// (orchestrator_git.py:2873), and recorded compare answers (fixtures/github/compare-*.json).
// join-test: S-001/J1 — the compare request's answers, as the function passes them on.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyQueuePath, parseCardPath, parseHoldCard, parseMergeCard, parseMergeCardPath, parseMerges, compareStatus,
} from '../../src/lib/records.js';
import { compareBody } from '../../src/lib/github.js';
import { buildModel, neededReads, parseRecord, recordKind, newestHold } from '../../src/lib/model.js';
import { fixture, recorded, CONFIG, SD } from './helpers.mjs';

const om = (p) => fixture(`orchestrator-m2/${p}`);
const HOLD_A = 'queue/ci-hold-e2ab9c55e561.md';
const HOLD_B = 'queue/ci-hold-4a2448939173.md';
const CONFLICT = 'queue/P-002-merge-conflict.md';
const BYHAND = 'queue/Q-007-merge-by-hand.md';

test('J2: hold and merge card paths are read here, never as cards or "can\'t parse"', () => {
  assert.deepEqual(classifyQueuePath(HOLD_A), { kind: 'hold' });
  assert.equal(classifyQueuePath(CONFLICT).kind, 'merge-card');
  assert.deepEqual(parseMergeCardPath(BYHAND), { path: BYHAND, item: 'Q-007', step: 'by-hand' });
  assert.equal(parseCardPath(HOLD_A), null);
  assert.equal(parseCardPath(CONFLICT), null);
  assert.equal(classifyQueuePath('queue/merge/P-002-conflict.md').kind, 'merge-note', 'merge-gate notes stay activity');
  assert.equal(classifyQueuePath('queue/ci-hold-E2AB9C55E561.md').kind, 'unparsed');
  assert.equal(classifyQueuePath('queue/P-002-merge-rebase.md').kind, 'unparsed');
  assert.equal(recordKind(HOLD_A, 'v3'), 'hold');
  assert.equal(recordKind(CONFLICT, 'v3'), 'merge-card');
  assert.equal(recordKind('status/merges.jsonl', 'v3'), 'merges');
});

test('J2: a hold card in hold_card\'s form gives its title, tip, state, held for, and "What to do"', () => {
  const h = parseHoldCard(om(HOLD_A));
  assert.equal(h.title, "Hold card — the default branch's governance run is not green");
  assert.equal(h.tip, 'e2ab9c55e561faa25c8186d560fa8bb076c54d32');
  assert.equal(h.state, 'failed');
  assert.equal(h.heldFor, 75);
  assert.match(h.whatToDo, /^Open the governance run for this commit in the Actions tab/);
  assert.match(h.whatToDo, /The loop reads no answer from this card\.$/);
  assert.deepEqual(h.notes, []);
  const broken = parseHoldCard(om(HOLD_A).replace(/^tip: .*$/m, 'tip: unknown'));
  assert.equal(broken.tip, null);
  assert.equal(broken.notes.length, 1);
});

test('J2: a merge card in MergeGate.fail\'s form gives its tip (the Orchestrator\'s pattern) and its three sections', () => {
  const c = parseMergeCard(om(CONFLICT));
  assert.equal(c.title, 'Merge card — P-002 (conflict)');
  assert.equal(c.tip, '0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c');
  assert.equal(c.decision, 'P-002 is done, but the merge conflicts: resolve it on the item branch or the default branch, or merge it by hand.');
  assert.equal(c.why, 'git merge stopped on conflicts in src/lib/model.js');
  assert.match(c.whatToDo, /^Merge item\/P-002 into the default branch by hand/);
  const b = parseMergeCard(om(BYHAND));
  assert.equal(b.tip, '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d');
  assert.match(b.decision, /the gate cannot satisfy what it needs, so the owner merges it by hand/);
  const broken = parseMergeCard(om(BYHAND).replace(/^item: .*$/m, 'item: Q-007   tip: (lost)'));
  assert.equal(broken.tip, null);
  assert.ok(broken.notes[0].includes('tip is unknown'));
});

test('J2: status/merges.jsonl in its real form', () => {
  const { merges, notes } = parseMerges(om('status/merges.jsonl') + 'not json\n{"item":"P-003"}\n');
  assert.deepEqual(merges, [{ item: 'P-002', tip: '0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c' }]);
  assert.equal(notes.length, 2);
});

test('J1/J2: recorded compare answers — the page reads only `status`, as the function passes it on', () => {
  for (const s of ['ahead', 'identical', 'behind', 'diverged']) {
    const rec = recorded(`compare-${s}`);
    assert.equal(JSON.parse(rec.body).status, s);
    assert.equal(compareStatus(compareBody(rec.body)), s);
  }
  assert.equal(compareStatus(null), null);
  assert.equal(compareBody('<html>'), null);
});

const sha = (n) => n.toString(16).padStart(40, '0');
function treeOf(paths) {
  return new Map(paths.map((p, i) => [p, { sha: sha(i + 1) }]));
}

test('J2 + J6: one hold card is read without a history read; with two, both creation times first, then only the newest', () => {
  const now = new Date('2026-10-08T15:00:00Z');
  let need = neededReads(SD, treeOf([HOLD_A]), new Map(), now);
  assert.deepEqual(need.blobs.filter((b) => b.kind === 'hold').map((b) => b.path), [HOLD_A]);
  assert.deepEqual(need.history, []);
  const tree = treeOf([HOLD_A, HOLD_B]);
  need = neededReads(SD, tree, new Map(), now);
  assert.deepEqual(need.blobs.filter((b) => b.kind === 'hold'), [], 'no hold blob until the newest is known');
  assert.deepEqual(need.history.sort(), [HOLD_B, HOLD_A].sort());
  const history = new Map([[HOLD_A, { oldest: '2026-10-07T10:00:00Z' }], [HOLD_B, { oldest: '2026-10-08T09:00:00Z' }]]);
  need = neededReads(SD, tree, new Map(), now, { history });
  assert.deepEqual(need.history, []);
  assert.deepEqual(need.blobs.filter((b) => b.kind === 'hold').map((b) => b.path), [HOLD_B], 'only the newest blob (review N3)');
  assert.deepEqual(newestHold(tree, history), { newest: HOLD_B, older: [HOLD_A], unknown: [] });
});

test('J2 + J6: merge cards are read with merges.jsonl, and one compare per open card at the head', () => {
  const now = new Date('2026-10-08T15:00:00Z');
  const tree = treeOf([CONFLICT, BYHAND, 'status/merges.jsonl', 'status/Q-007.toml']);
  const head = 'c'.repeat(40);
  let need = neededReads(SD, tree, new Map(), now, { head });
  assert.deepEqual(need.blobs.map((b) => b.path).filter((p) => p.startsWith('queue/') || p.includes('merges')).sort(),
    [CONFLICT, BYHAND, 'status/merges.jsonl'].sort());
  assert.deepEqual(need.compare, [], 'no compare before the cards are read');
  const records = new Map([
    [CONFLICT, parseRecord('merge-card', om(CONFLICT), CONFLICT)],
    [BYHAND, parseRecord('merge-card', om(BYHAND), BYHAND)],
    ['status/merges.jsonl', parseRecord('merges', om('status/merges.jsonl'))],
    ['status/Q-007.toml', parseRecord('status', 'kind = "query"\nstate = "done"\n', 'status/Q-007.toml')],
  ]);
  need = neededReads(SD, tree, records, now, { head });
  assert.deepEqual(need.compare, [{ base: '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d', head }],
    'P-002 is in merges.jsonl, so only Q-007 is asked');
  need = neededReads(SD, tree, records, now, { head, compare: new Map([['1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d', 'diverged']]) });
  assert.deepEqual(need.compare, [], 'asked once per head');
  // No merge card: merges.jsonl isn't read.
  assert.ok(!neededReads(SD, treeOf(['status/merges.jsonl']), new Map(), now).blobs.some((b) => b.path === 'status/merges.jsonl'));
});

test('J2: an open merge card is flagged; closed, merged by the gate, or merged by hand (ahead/identical) clears it', () => {
  const tree = treeOf([CONFLICT, BYHAND, 'status/merges.jsonl', 'status/Q-007.toml']);
  const base = { project: SD, config: CONFIG, now: new Date('2026-10-08T15:00:00Z'), pullPages: [], checkPages: [], tree };
  const recs = (state) => new Map([
    [CONFLICT, parseRecord('merge-card', om(CONFLICT), CONFLICT)],
    [BYHAND, parseRecord('merge-card', om(BYHAND), BYHAND)],
    ['status/merges.jsonl', parseRecord('merges', om('status/merges.jsonl'))],
    ['status/Q-007.toml', parseRecord('status', `kind = "query"\nstate = "${state}"\n`, 'status/Q-007.toml')],
  ]);
  const tip = '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d';
  const flags = (m) => m.flagged.filter((f) => f.kind === 'merge').map((f) => f.title);
  assert.deepEqual(flags(buildModel({ ...base, records: recs('done') })), ['Q-007: merge by hand'], '`done` doesn\'t clear it; merges.jsonl clears P-002');
  for (const ans of ['diverged', 'behind', 'failed']) {
    assert.deepEqual(flags(buildModel({ ...base, records: recs('done'), compare: new Map([[tip, ans]]) })), ['Q-007: merge by hand'], ans);
  }
  assert.deepEqual(flags(buildModel({ ...base, records: recs('done'), compare: new Map([[tip, 'merged']]) })), []);
  assert.deepEqual(flags(buildModel({ ...base, records: recs('closed') })), []);
  const m = buildModel({ ...base, records: recs('done') });
  assert.ok(!m.activity.some((a) => a.kind === 'unparsed'), 'never "can\'t parse"');
  assert.ok(m.activity.some((a) => a.text.startsWith('P-002 merge conflict: no longer waiting (merged by the merge gate)')));
});
