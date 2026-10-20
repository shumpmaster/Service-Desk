// join-test: S-001/J22 — the page's reads for J22 through its real scheduler (AC80; desk mockup v2,
// 2026-10-20), with the fake desk function and made-up repositories (NOT real records): the owner-check
// part of the poll call, at most 3 heads a public v3 project, conditional, a 304 keeping the last and a
// refusal not asked again in the opening; the risk-paths file as an optional blob for every project;
// each head's verdict blobs in a call of its own after a blob phase that returned `ok` (none when it
// failed or is pending), a failing one costing only its head's verdicts; and the waited J20 read.
// join-test: S-001/J20 (the verdict files' blob `sha`, kept for J22's reads).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk, POLL_MS, FILES_RETRY_MS, HEAD_POLLS, WAITS_KEY } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { CONFIG, fakeClock, NOW } from './helpers.mjs';
import { repo, pr, fakeServer, gitSha } from './fake-desk.mjs';
import { RISK_PATHS_PATH } from '../../src/lib/j22.js';

const v3 = (name, extra = {}) => ({ name, repo: `shumpmaster/${name}`, defaultBranch: 'main', model: 'v3', planning: false, webCommitsToDefault: true,
  contentPrefill: true, contentParam: 'value', ...extra });
const RISK = 'unmatched = "R1"\n[classes]\nR3 = [".claude/**"]\nR1 = ["src/**"]\n[reviews]\nR0 = []\nR1 = ["reviewer"]\nR2 = ["reviewer"]\nR3 = ["reviewer", "owner"]\n';
const H = (n) => `${String(n).padStart(3, '0')}${'d'.repeat(37)}`;
const V = (c) => c.repeat(40);

/** A browser's local storage in memory (`refuse`: every call throws), shared across openings. */
function backing({ refuse = false } = {}) {
  const m = new Map();
  const no = () => { throw new Error('storage refused'); };
  return { m, getItem: refuse ? no : (k) => (m.has(k) ? m.get(k) : null), setItem: refuse ? no : (k, v) => { m.set(k, String(v)); }, removeItem: refuse ? no : (k) => { m.delete(k); } };
}

function setup({ pulls, files = {}, priv = false, extraFiles = {}, project = v3('Alpha'), waits = backing(), at = NOW } = {}) {
  const r = repo({ [RISK_PATHS_PATH]: RISK, 'README.md': '# Alpha\n\nA project.\n', ...extraFiles },
    pulls.map(([n, created]) => pr(n, `PR ${n}`, { headRepo: project.repo, sha: H(n), createdAt: created, private: priv })));
  r.prFiles = files;
  const config = { ...CONFIG, projects: [project] };
  const clock = fakeClock(at);
  const server = fakeServer({ [project.name]: r }, config, clock);
  const desk = createDesk({ config, call: (p, b) => server.call(p, b), clock, store: null, waitsStore: createStore(waits), isVisible: () => true, j11: true });
  return { r, desk, clock, server, config, name: project.name, waits };
}
const polls = (s) => s.server.calls.filter((c) => c.path === '/api/poll');

test('J22: the owner-check part rides the poll call for the heads ownerCheckHeads chooses (at most 3), only in a public v3 project; never for a private or v2.5 one', async () => {
  const s = setup({ pulls: [[1, '2026-10-19T10:00:00Z'], [2, '2026-10-19T11:00:00Z'], [3, '2026-10-19T12:00:00Z'], [4, '2026-10-19T13:00:00Z']] });
  s.desk.start();
  await s.clock.runUntil(NOW + 1000);
  assert.equal(polls(s)[0].body.ownerChecks, undefined, 'the first poll knows no pull request yet');
  await s.clock.runUntil(NOW + POLL_MS + 1000);
  assert.deepEqual(polls(s)[1].body.ownerChecks.map((x) => x.sha), [H(1), H(2), H(3)], 'the first 3 in AC52\'s order; the fourth not read');
  // A private repository: no part sent.
  const p = setup({ pulls: [[1, '2026-10-19T10:00:00Z']], priv: true });
  p.desk.start();
  await p.clock.runUntil(NOW + 2 * POLL_MS + 1000);
  assert.ok(polls(p).every((c) => c.body.ownerChecks === undefined));
  // A v2.5 project: none.
  const q = setup({ pulls: [[1, '2026-10-19T10:00:00Z']], project: { ...v3('Delta'), model: 'v2.5' } });
  q.desk.start();
  await q.clock.runUntil(NOW + 2 * POLL_MS + 1000);
  assert.ok(polls(q).every((c) => c.body.ownerChecks === undefined));
});

test('J22: the owner check read, then a 304 keeping the last answer (its ETag sent back); a refused read is "not read", not asked again before 5 minutes', async () => {
  const s = setup({ pulls: [[1, '2026-10-19T10:00:00Z'], [2, '2026-10-19T11:00:00Z']] });
  s.r.statuses = { [H(1)]: { state: 'pending', description: 'Owner: after agents · 2 other finding(s)' } };
  s.r.statusFail = [H(2)];
  s.desk.start();
  await s.clock.runUntil(NOW + 2 * POLL_MS + 1000);
  const c = s.desk.j22('Alpha');
  assert.deepEqual(c.ownerCheck(H(1)), { read: true, state: 'pending', description: 'Owner: after agents · 2 other finding(s)', etag: c.ownerCheck(H(1)).etag });
  assert.equal(c.ownerCheck(H(2)), null, 'refused: not read');
  await s.clock.runUntil(NOW + 3 * POLL_MS + 1000);
  const last = polls(s).at(-1).body.ownerChecks;
  assert.deepEqual(last.map((x) => x.sha), [H(1)], 'the refused head is not asked again before 5 minutes (J22, as settled after round 1)');
  assert.ok(last[0].etag, 'its ETag sent back');
  assert.equal(s.desk.j22('Alpha').ownerCheck(H(1)).state, 'pending', 'a 304 keeps the last answer');
});

test('J20 + J22: each head\'s verdict blobs, by the sha J20 keeps, in one call of their own after an ok blob phase; one failing costs only its head; asked again at J20\'s 5 minutes, inside the head\'s 5', async () => {
  const files = {
    1: [{ filename: 'src/lib/a.js', status: 'modified' }, { filename: 'reviews/1/reviewer.md', status: 'added', sha: V('1') }],
    2: [{ filename: 'src/lib/b.js', status: 'modified' }, { filename: 'reviews/2/reviewer.md', status: 'added', sha: V('2') }, { filename: 'reviews/2/owner.md', status: 'added', sha: V('3') }],
  };
  for (const failFirst of [true, false]) {
    const s = setup({ pulls: [[1, '2026-10-19T10:00:00Z'], [2, '2026-10-19T11:00:00Z']], files });
    s.r.blobs = { [V('1')]: 'Verdict: PASS\n', [V('2')]: 'Verdict: PASS\n', [V('3')]: 'Verdict: PASS\n' };
    // The failing head first in AC52's order, then second (draft 3: the calls are made outside the optional loop).
    s.r.blobFail = failFirst ? [V('1')] : [V('2')];
    s.desk.start();
    await s.clock.runUntil(NOW + 1000);
    const verdictCalls = () => s.r.blobCalls.filter((b) => b.some((x) => [V('1'), V('2'), V('3')].includes(x)));
    assert.deepEqual(verdictCalls().map((b) => [...b].sort()), [[V('1')], [V('2'), V('3')]], 'one call a head, its verdict blobs and nothing else');
    const c = s.desk.j22('Alpha');
    const failed = failFirst ? V('1') : V('2');
    const kept = failFirst ? V('2') : V('1');
    assert.equal(c.verdictBlob(failed).state, 'failed');
    assert.deepEqual(c.verdictBlob(kept), { state: 'read', verdict: 'PASS' }, 'the other head\'s answer kept');
    // Read once per sha in an opening: the next polls ask only the failed one, and only after J20's 5 minutes.
    await s.clock.runUntil(NOW + 4 * POLL_MS + 1000);
    assert.equal(verdictCalls().length, 2, 'no retry before FILES_RETRY_MS');
    s.r.blobFail = [];
    await s.clock.runUntil(NOW + FILES_RETRY_MS + POLL_MS + 1000);
    assert.equal(verdictCalls().length, 3);
    assert.equal(s.desk.j22('Alpha').verdictBlob(failed).state, 'read');
    assert.equal(s.desk.j22('Alpha').headPolls({ number: failFirst ? 1 : 2, headSha: H(failFirst ? 1 : 2) }), 1, 'the retry used one of the head\'s 5');
    s.desk.stop();
  }
  assert.equal(HEAD_POLLS, 5);
});

test('J22: a cycle whose blob phase fails, and one whose blob phase is pending, make no verdict call; the next ok cycle makes them, using none of the head\'s 5', async () => {
  const files = { 1: [{ filename: 'src/lib/a.js', status: 'modified' }, { filename: 'reviews/1/reviewer.md', status: 'added', sha: V('1') }] };
  // Failing: a needed blob (a status file) fails the blob phase.
  const s = setup({ pulls: [[1, '2026-10-19T10:00:00Z']], files, extraFiles: { 'status/P-001.toml': 'kind = "project"\nstage = 5\nstate = "ready"\nrole = "builder"\n' } });
  s.r.blobs = { [V('1')]: 'Verdict: PASS\n' };
  s.r.blobFail = [gitSha('kind = "project"\nstage = 5\nstate = "ready"\nrole = "builder"\n')];
  s.desk.start();
  await s.clock.runUntil(NOW + 2 * POLL_MS + 1000);
  assert.ok(!s.r.blobCalls.some((b) => b.includes(V('1'))), 'no verdict call while the blob phase fails');
  s.r.blobFail = [];
  await s.clock.runUntil(NOW + 3 * POLL_MS + 1000);
  assert.ok(s.r.blobCalls.some((b) => b.length === 1 && b[0] === V('1')), 'made at the next ok cycle');
  assert.equal(s.desk.j22('Alpha').headPolls({ number: 1, headSha: H(1) }), 0);
  // Pending: more needed blobs than a cycle's 6 calls of 25 hold.
  const many = {};
  for (let i = 0; i < 160; i++) many[`status/P-${String(i).padStart(3, '0')}.toml`] = `kind = "project"\nstage = 5\nstate = "ready"\nrole = "r${i}"\n`;
  const p = setup({ pulls: [[1, '2026-10-19T10:00:00Z']], files, extraFiles: many });
  p.r.blobs = { [V('1')]: 'Verdict: PASS\n' };
  p.desk.start();
  await p.clock.runUntil(NOW + 1000);
  assert.ok(!p.r.blobCalls.some((b) => b.includes(V('1'))), 'pending: no verdict call');
  await p.clock.runUntil(NOW + POLL_MS + 1000);
  assert.ok(p.r.blobCalls.some((b) => b.length === 1 && b[0] === V('1')), 'the next ok cycle makes it');
  assert.equal(p.desk.j22('Alpha').headPolls({ number: 1, headSha: H(1) }), 0, 'a skipped call is not a failed one');
});

test('AC80: a mark waiting on a failed J20 read asks it at each poll in a blob call of its own, at most 5 polls for that head, then only at J20\'s own retry', async () => {
  const s = setup({ pulls: [[1, '2026-10-19T10:00:00Z']], files: { 1: [{ filename: 'src/lib/a.js', status: 'modified' }] } });
  s.r.filesFail = [1];
  s.desk.start();
  await s.clock.runUntil(NOW + 1000);
  s.desk.setWaited('Alpha', [1]);
  const solo = () => s.server.calls.filter((c) => c.path === '/api/blobs' && Array.isArray(c.body.files) && c.body.files.length === 1 && c.body.files[0] === 1
    && c.body.blobs.length === 0 && !c.body.pulls && !c.body.usage).length;
  const before = solo();
  for (let i = 1; i <= 8; i++) await s.clock.runUntil(NOW + i * POLL_MS + 1000);
  const after = solo() - before;
  // Five waited calls at the five polls, plus J20's own retries at its 5-minute wait (the existing cadence).
  assert.ok(after >= 5 && after <= 7, `${after} solo reads in 8 polls`);
  assert.equal(s.desk.j22('Alpha').headPolls({ number: 1, headSha: H(1) }), 5, 'the head\'s 5, and no more');
  assert.equal(s.desk.j22('Alpha').soloCalls.waited, 5);
});

test('J20 (2026-10-20): the blob `sha` kept for `reviews/<n>/<id>.md` files only, from the real #148 pages; a removed verdict file present no longer; a verdict file renamed away leaves its old path absent', async () => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { FIX } = await import('./helpers.mjs');
  const { parseFilePages, verdictFiles } = await import('../../src/lib/prfiles.js');
  const pages = [1, 2].map((p) => readFileSync(join(FIX, 'j22', `files-148-p${p}.json`), 'utf8'));
  const fp = parseFilePages(pages);
  assert.equal(fp.ok, true);
  const withSha = fp.files.filter((f) => f.sha);
  assert.ok(fp.files.length > 100, `${fp.files.length} files over two pages`);
  assert.ok(withSha.every((f) => /^reviews\/\d+\/[a-z0-9-]+\.md$/.test(f.filename)), 'only verdict files keep their sha');
  const raw = pages.flatMap((p) => JSON.parse(p));
  for (const f of withSha) assert.equal(f.sha, raw.find((x) => x.filename === f.filename).sha, `${f.filename}: GitHub's blob sha`);
  // Made up (NOT real): a removed verdict file, and one renamed away.
  const made = parseFilePages([JSON.stringify([
    { filename: 'reviews/9/owner.md', status: 'removed', sha: 'a'.repeat(40) },
    { filename: 'reviews/9/reviewer.md', status: 'added', sha: 'b'.repeat(40) },
    { filename: 'notes/old.md', status: 'renamed', previous_filename: 'reviews/9/design.md', sha: 'c'.repeat(40) },
    { filename: 'src/x.js', status: 'modified', sha: 'd'.repeat(40) },
  ])]);
  assert.equal(made.files.find((f) => f.filename === 'src/x.js').sha, undefined);
  const v = verdictFiles(made.files);
  assert.deepEqual(Object.fromEntries(v), {
    'reviews/9/owner.md': { present: false, sha: null },
    'reviews/9/reviewer.md': { present: true, sha: 'b'.repeat(40) },
    'reviews/9/design.md': { present: false, sha: null },
  });
});

/** The waited J20 read's solo calls for pull request n. */
const soloFor = (s, n) => s.server.calls.filter((c) => c.path === '/api/blobs' && Array.isArray(c.body.files) && c.body.files.length === 1 && c.body.files[0] === n
  && c.body.blobs.length === 0 && !c.body.pulls && !c.body.usage).length;

test('AC80 (settled after stage 1a\'s build review, round 1, finding 3): a head\'s 5 hold across openings under desk-board-waits-v1 — 3 in one opening, at most 2 in the next; dropped once the head is no longer open; with local storage throwing, no waited read at all', async () => {
  const waits = backing();
  const files = { 1: [{ filename: 'src/lib/a.js', status: 'modified' }] };
  // Opening 1: three polls waited on the failing read.
  let s = setup({ pulls: [[1, '2026-10-19T10:00:00Z']], files, waits });
  s.r.filesFail = [1];
  s.desk.start();
  await s.clock.runUntil(NOW + 1000);
  s.desk.setWaited('Alpha', [1]);
  for (let i = 1; i <= 3; i++) await s.clock.runUntil(NOW + i * POLL_MS + 1000);
  assert.equal(s.desk.j22('Alpha').soloCalls.waited, 3);
  s.desk.stop();
  const kept = JSON.parse(waits.m.get(WAITS_KEY));
  assert.deepEqual(kept, { Alpha: { [`1@${H(1)}`]: 3 } }, 'by project, pull request number and head sha');
  // Opening 2, an hour later, the same head still open and still failing: 2 more, never 5 more.
  s = setup({ pulls: [[1, '2026-10-19T10:00:00Z']], files, waits, at: NOW + 3600e3 });
  s.r.filesFail = [1];
  s.desk.start();
  await s.clock.runUntil(NOW + 3600e3 + 1000);
  s.desk.setWaited('Alpha', [1]);
  for (let i = 1; i <= 8; i++) await s.clock.runUntil(NOW + 3600e3 + i * POLL_MS + 1000);
  assert.equal(s.desk.j22('Alpha').soloCalls.waited, 2, 'goes on from its count, never from 0');
  assert.equal(JSON.parse(waits.m.get(WAITS_KEY)).Alpha[`1@${H(1)}`], HEAD_POLLS);
  // The pull request closes: a successful read of the open list drops its entry.
  s.r.pulls = [];
  await s.clock.runUntil(NOW + 3600e3 + 10 * POLL_MS + 1000);
  assert.deepEqual(JSON.parse(waits.m.get(WAITS_KEY)), { Alpha: {} }, 'open heads only');
  s.desk.stop();
  // Local storage throwing: no waited read at all; J20's own retry still at its 5 minutes.
  s = setup({ pulls: [[1, '2026-10-19T10:00:00Z']], files, waits: backing({ refuse: true }) });
  s.r.filesFail = [1];
  s.desk.start();
  await s.clock.runUntil(NOW + 1000);
  s.desk.setWaited('Alpha', [1]);
  const before = soloFor(s, 1);
  for (let i = 1; i <= 8; i++) await s.clock.runUntil(NOW + i * POLL_MS + 1000);
  assert.equal(s.desk.j22('Alpha').soloCalls.waited, 0, 'no waited read without device storage');
  assert.ok(soloFor(s, 1) - before <= 2, 'only J20\'s own retries, at its 5-minute wait');
  s.desk.stop();
});

test('J22 (settled after round 1, finding 4): an owner-check read answered `false` (a 403 or a 5xx alike) is asked again at the first poll 5 minutes later, never sooner, inside the poll call; the head keeps its place among the 3', async () => {
  const s = setup({ pulls: [[1, '2026-10-19T10:00:00Z'], [2, '2026-10-19T11:00:00Z'], [3, '2026-10-19T12:00:00Z'], [4, '2026-10-19T13:00:00Z']] });
  s.r.statusFail = [H(2)];
  s.desk.start();
  await s.clock.runUntil(NOW + POLL_MS + 1000);
  const sent = () => polls(s).map((c) => (c.body.ownerChecks || []).map((x) => x.sha));
  assert.deepEqual(sent().at(-1), [H(1), H(2), H(3)]);
  const failedAt = polls(s).at(-1).at;
  // The next polls before 5 minutes: the head is not asked, and the fourth never takes its place.
  for (let i = 2; i <= 5; i++) await s.clock.runUntil(NOW + i * POLL_MS + 1000);
  const between = polls(s).filter((x) => x.at > failedAt && x.at - failedAt < FILES_RETRY_MS);
  assert.ok(between.length >= 3, `${between.length} polls before 5 minutes`);
  for (const c of between) {
    assert.deepEqual((c.body.ownerChecks || []).map((x) => x.sha), [H(1), H(3)], 'not sooner; no fourth head');
  }
  assert.equal(s.desk.j22('Alpha').ownerCheck(H(2)), null, 'not read meanwhile');
  // At the first poll 5 minutes on: asked again, in the poll call (no call of its own).
  s.r.statusFail = [];
  s.r.statuses = { [H(2)]: { state: 'success', description: 'Owner not required' } };
  const calls = s.server.calls.length;
  await s.clock.runUntil(NOW + 7 * POLL_MS + 1000);
  const again = polls(s).find((c) => c.at - failedAt >= FILES_RETRY_MS);
  assert.ok(again && again.body.ownerChecks.some((x) => x.sha === H(2)), 'asked again at the first poll 5 minutes on');
  assert.equal(s.desk.j22('Alpha').ownerCheck(H(2)).description, 'Owner not required', 'a 200 ends the wait');
  assert.ok(s.server.calls.slice(calls).every((c) => c.path === '/api/poll' || c.path === '/api/blobs'), 'no call of its own');
});
