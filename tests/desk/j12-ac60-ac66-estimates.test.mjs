// The Chief of Staff's estimate pull requests are never a sprint (spec S-001, draft 4 and 5 of "Work
// ahead by milestones", 2026-10-19): J12 reads each pull request's changed paths (`changedFiles` and
// `files(first: 2) { nodes { path } }`) and keeps only whether it changes `intake/estimates.jsonl`
// only; a merged one of the planning project whose `Milestone:` line, trimmed, is exactly
// `none (a rough estimate)` is left off the Timeline as the job's merges are (AC60), and its "Done
// today" row reads "not on the Timeline: a rough estimate" (AC66). Changed paths not read are not
// estimate-only. Every pull request numbered 970 and up here is made up (NOT a real record); the
// built fixture's changed paths are REST's (tests/desk/tools/j12-fixture.mjs, 2026-10-19).
// join-test: S-001/J12
// ac-test: S-001/AC60 ac-test: S-001/AC66
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, fakeClock } from './helpers.mjs';
import { pr, fakeServer } from './fake-desk.mjs';
import { loadSandbox, byClass, linksIn, j11Snapshot, SD3, j11Files } from './sandbox-helpers.mjs';
import { NOW } from './sandbox-fixtures.mjs';
import { keyed, sdRepo } from './tv2-fixtures.mjs';
import { pullsAnswer, pullNodes, answerOf, node } from './j12-fixture.mjs';
import { PULLS_QUERY } from '../../src/lib/github.js';
import { judgePulls, keptPull, estimateOnly, PULLS_KEY, OLD_PULLS_KEYS, ESTIMATE_PATH } from '../../src/lib/pulls.js';
import { j11Records, timelineOf, phaseView } from '../../src/lib/sandbox.js';
import { runsContext, feedView, estimateMerge, ESTIMATE_MERGE_WORDS } from '../../src/lib/feed.js';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';

const NOW18 = Date.parse('2026-10-18T12:00:00Z');
const TZ = 'America/Chicago';
const PLANNER = { ...SD3, planning: true };
const EST_BODY = '## What this means for you\n\nA rough estimate for MD3.\n\nMilestone: none (a rough estimate)\n';
/** A made-up merged pull request (NOT a real record) with its changed paths. */
const est = (number, { paths = [ESTIMATE_PATH], body = EST_BODY, mergedAt = '2026-10-17T20:00:00Z', files } = {}) => ({
  ...node(number, { title: `Rough estimates, made up ${number}`, body, mergedAt, head: `cos/estimates-${number}` }),
  changedFiles: paths.length, files: files !== undefined ? files : { nodes: paths.slice(0, 2).map((path) => ({ path })) },
});
const block = (feed, key) => feed.blocks.find((b) => b.key === key);
const rowsOf = (b) => [...(b.plannedRows || []), ...b.rows];
const ids = (feed) => feed.blocks.flatMap((b) => rowsOf(b).flatMap((x) => [...(x.sprints || []), ...(x.named || [])].map((s) => s.id)));
const DOC = j11Files()['docs/PROJECT.md'];
const listing = (n) => DOC.replace(/(\(MD3\) · done when [^\n]* · phase: Design)\n/, `$1 · sprints: PR #${n}\n`);

/** The Timeline's model for Service-Desk at 3117150 with J12's answer, as `project` (the planning one by default). */
function feedOf(answer, { project = PLANNER, extra = {}, now = NOW18 } = {}) {
  const snap = j11Snapshot(extra);
  const v = judgePulls(typeof answer === 'string' ? answer : answer);
  snap.pulls = { list: v.pulls, failure: null, tooMany: false, fieldError: v.fieldError, current: true };
  const j = j11Records(project, snap);
  const tl = timelineOf(j);
  const pv = phaseView(project, tl, snap.tree, j);
  const ctx = runsContext(project, snap, j, tl, pv, now, TZ);
  return { feed: feedView(ctx, { pulls: [] }, now, TZ), list: v.pulls };
}

// ---------------------------------------------------------------------------
// J12

test('J12 (estimates): the fixed query asks for `changedFiles` and `files(first: 2) { nodes { path } }`, in the same one query', () => {
  assert.ok(PULLS_QUERY.includes('changedFiles files(first: 2) { nodes { path } }'));
  assert.equal((PULLS_QUERY.match(/pullRequests\(/g) || []).length, 1, 'one connection: no request is added');
});

test('J12 (estimates): one changed path, intake/estimates.jsonl, gives yes; two paths, or another path, no; the kept entry holds the yes or no and never the paths', () => {
  assert.equal(estimateOnly(est(970)), true);
  assert.equal(estimateOnly(est(971, { paths: [ESTIMATE_PATH, 'intake/later-work.md'] })), false);
  assert.equal(estimateOnly(est(972, { paths: ['intake/later-work.md'] })), false);
  assert.equal(estimateOnly(est(973, { paths: ['docs/intake/estimates.jsonl'] })), false);
  assert.equal(estimateOnly({ ...est(974), changedFiles: 2 }), false, 'changedFiles 2 with one path listed: no');
  const v = judgePulls(answerOf([est(970), est(971, { paths: [ESTIMATE_PATH, 'intake/later-work.md'] })]));
  assert.deepEqual(v.pulls.map((p) => [p.number, p.estimate]), [[970, true], [971, false]]);
  for (const p of v.pulls) {
    assert.doesNotMatch(JSON.stringify(p), /intake\/estimates\.jsonl|later-work\.md|changedFiles|"files"/, `#${p.number}: no paths kept`);
  }
  assert.deepEqual(Object.keys(keptPull(est(970), null)).sort(), ['checks', 'createdAt', 'estimate', 'estimateLine', 'head', 'job', 'mergeCommit', 'mergedAt', 'number', 'parts', 'state', 'title']);
});

test('J12 (estimates): `files` null, missing, and a field error whose path ends in `files` or `changedFiles`, each give "not estimate-only" for every pull request, the rest of the answer used', () => {
  assert.equal(estimateOnly(est(970, { files: null })), false);
  const bare = est(975);
  delete bare.changedFiles;
  delete bare.files;
  assert.equal(estimateOnly(bare), false, 'an answer lacking the fields');
  for (const last of ['files', 'changedFiles']) {
    const body = JSON.parse(answerOf([est(970), est(976, { paths: ['src/x.js'] })]));
    body.data.repository.pullRequests.nodes[0].files = null;
    body.errors = [{ type: 'SOMETHING', path: ['repository', 'pullRequests', 'nodes', 0, last], message: 'made up: could not read the files' }];
    const v = judgePulls(JSON.stringify(body));
    assert.equal(v.ok, true, 'the rest is used');
    assert.equal(v.pulls.length, 2);
    assert.ok(v.pulls.every((p) => p.estimate === false), last);
    assert.equal(v.fieldError, null, 'the checks are not touched');
    assert.ok(v.pulls.every((p) => p.checks && p.checks.state === 'SUCCESS'));
  }
});

test('J12 (estimates): the rebuilt real fixture holds REST\'s changed paths for its 72 pull requests, and none is estimate-only', () => {
  const nodes = pullNodes();
  assert.equal(nodes.length, 72);
  for (const n of nodes) {
    assert.ok(Number.isInteger(n.changedFiles) && n.changedFiles >= 1, `#${n.number}`);
    assert.equal(n.files.nodes.length, Math.min(2, n.changedFiles), `#${n.number}: the first two paths`);
  }
  // As REST's pulls/<n> and pulls/<n>/files gave them on 2026-10-19.
  const by = new Map(nodes.map((n) => [n.number, n]));
  assert.deepEqual([by.get(76).changedFiles, by.get(76).files.nodes.map((x) => x.path)], [1, ['decisions/questions/P-001-github-app-links.md']]);
  assert.deepEqual([by.get(77).changedFiles, by.get(77).files.nodes.map((x) => x.path)],
    [22, ['decisions/questions/P-001-answer-choice-spacing.md', 'decisions/questions/P-001-design-lab-answers-followup.md']]);
  assert.deepEqual([by.get(5).changedFiles, by.get(5).files.nodes.map((x) => x.path)], [1, ['governance/PACKS.toml']]);
  assert.equal(by.get(44).changedFiles, 63);
  assert.ok(judgePulls(pullsAnswer()).pulls.every((p) => p.estimate === false));
});

test('J12 (estimates): the kept list is under desk-pulls-v3; desk-pulls-v2 (and v1) are removed on load and their entries read again from J12; the requests per J12 read are unchanged', async () => {
  assert.equal(PULLS_KEY, 'desk-pulls-v3');
  assert.deepEqual(OLD_PULLS_KEYS, ['desk-pulls-v1', 'desk-pulls-v2']);
  // A v2 entry, as a device that loaded the desk before this deploy holds it: no estimate-only yes or no.
  const v2 = { [SD3.name]: { day: '2026-10-18', head: null, tooMany: false, pulls: judgePulls(answerOf([est(970)])).pulls.map((p) => { const q = { ...p }; delete q.estimate; return q; }) } };
  const backing = new Map([['desk-pulls-v2', JSON.stringify(v2)], ['desk-pulls-v1', '{}']]);
  const storage = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, v), removeItem: (k) => backing.delete(k) };
  const r = sdRepo({ answer: answerOf([est(970), ...pullNodes()]) });
  const clock = fakeClock(Date.parse('2026-10-18T09:00:00Z'));
  const config = { ...CONFIG, projects: [PLANNER] };
  const server = fakeServer({ [SD3.name]: r }, config, clock);
  const desk = createDesk({ config, call: (p, b) => server.call(p, b), clock, store: createStore(null), pullsStore: createStore(storage), isVisible: () => true, j11: true });
  assert.equal(backing.has('desk-pulls-v2'), false, 'v2 removed on load');
  assert.equal(backing.has('desk-pulls-v1'), false, 'v1 removed on load');
  desk.start();
  await clock.runUntil(clock.now() + 3 * POLL_MS);
  desk.stop();
  assert.equal(server.calls.filter((c) => c.path === '/api/blobs' && c.body.pulls).length, 1, 'one J12 read, as before');
  const kept = JSON.parse(backing.get('desk-pulls-v3'))[SD3.name].pulls;
  assert.ok(kept.every((p) => typeof p.estimate === 'boolean'), 'every entry read again, with its yes or no');
  assert.deepEqual(kept.filter((p) => p.estimate).map((p) => p.number), [970]);
});

// ---------------------------------------------------------------------------
// AC60

test('AC60 (estimates): an estimate-only merge by the owner, `Milestone: none (a rough estimate)`, is on no milestone, under no "Not tied to a milestone" line, and gives its run no time', () => {
  const none = feedOf(answerOf([])).feed;
  const { feed, list } = feedOf(answerOf([est(970)]));
  assert.equal(list[0].job, false, 'merged by the owner, not the job');
  assert.equal(estimateMerge(PLANNER, list[0]), true);
  assert.ok(!ids(feed).includes('PR #970'));
  const d2 = block(feed, 'Design-i2');
  assert.equal(rowsOf(d2).find((x) => x.kind === 'untied'), undefined, 'no such line');
  assert.equal(d2.band.words, block(none, 'Design-i2').band.words, 'no time given to its run');
});

test('AC60 (estimates): placed as any pull request — a second changed path, `Milestone: none (other)`, `none (A rough estimate)`, `files` null, a field error on `files`, and an estimate-only one in a project without `planning: true`', () => {
  const untiedIn = (feed) => {
    const u = rowsOf(block(feed, 'Design-i2')).find((x) => x.kind === 'untied');
    return u ? u.sprints.map((s) => s.id) : [];
  };
  const cases = [
    ['a second changed path', est(971, { paths: [ESTIMATE_PATH, 'intake/later-work.md'] })],
    ['Milestone: none (other)', est(972, { body: 'Milestone: none (other)\n' })],
    ['another letter case', est(973, { body: 'Milestone: none (A rough estimate)\n' })],
    ['files null', est(974, { files: null })],
  ];
  for (const [why, n] of cases) assert.deepEqual(untiedIn(feedOf(answerOf([n])).feed), [`PR #${n.number}`], why);
  // A field error on `files`, with another untied pull request and a Milestone:-placed one still shown.
  const body = JSON.parse(answerOf([est(975), est(976, { paths: ['src/x.js'], body: 'Milestone: none (a tidy-up)\n' }),
    est(977, { paths: ['src/y.js'], body: 'Milestone: MD3\n' })]));
  body.errors = [{ path: ['repository', 'pullRequests', 'nodes', 0, 'files'], message: 'made up' }];
  const fe = feedOf(JSON.stringify(body)).feed;
  assert.deepEqual(untiedIn(fe).sort(), ['PR #975', 'PR #976']);
  const md3 = rowsOf(block(fe, 'Design-i2')).find((x) => x.code === 'MD3');
  assert.deepEqual(md3.named.map((s) => s.id), ['PR #977'], 'the Milestone:-placed one still shown');
  // Not the planning project.
  assert.deepEqual(untiedIn(feedOf(answerOf([est(978)]), { project: { ...SD3, planning: false } }).feed), ['PR #978']);
});

test('AC60 (estimates): an estimate-only merge a plan line lists under MD3 is MD3\'s sprint, with its merge time among its run\'s times (the plan wins)', () => {
  const { feed } = feedOf(answerOf([est(979)]), { extra: { 'docs/PROJECT.md': listing(979) } });
  const md3 = rowsOf(block(feed, 'Design-i2')).find((x) => x.code === 'MD3');
  assert.deepEqual(md3.sprints.map((s) => s.id), ['PR #979']);
  assert.ok(!md3.sprints[0].missing);
  assert.equal(block(feed, 'Design-i2').band.words, '8 Oct to 17 Oct · now');
});

// ---------------------------------------------------------------------------
// AC66

test('AC66 (estimates): an estimate-only merge by the owner leaving the queue — its "Done today" row has no Timeline link and reads "not on the Timeline: a rough estimate"; with its changed paths not read, it links to its sprint under "Not tied to a milestone"', async () => {
  for (const unread of [false, true]) {
    const repo = sdRepo({ answer: answerOf(pullNodes()) });
    repo.pulls.push(pr(980, 'Rough estimates for MD3 and M3A', { head: 'cos/estimates-980' }));
    const project = { ...SD3, planning: true };
    const page = await loadSandbox({ config: { ...CONFIG, projects: [project] }, repos: { 'Service-Desk': repo }, hash: '#/p/Service-Desk/queue', now: NOW });
    const rowOf = (codeText) => byClass(keyed(page, 'done-today'), 'sb-done-r').find((x) => byClass(x, 'code').some((c) => c.textContent === codeText));
    const tl = (x) => linksIn(x).find((l) => l.text === 'On the Timeline');
    try {
      await page.advance(1000);
      await page.advance(POLL_MS);
      assert.ok(keyed(page, 'qrow:pr:980'), 'while open: in the Queue as any pull request');
      repo.pulls = repo.pulls.filter((x) => x.number !== 980);
      const merged = est(980, { mergedAt: new Date(page.now).toISOString().replace(/\.\d+Z$/, 'Z'), files: unread ? null : undefined });
      repo.pullsAnswer = answerOf([merged, ...pullNodes()]);
      repo.commit({ 'intake/estimates.jsonl': '{"made up": true}\n' });
      await page.advance(POLL_MS);
      await page.advance(POLL_MS);
      if (!unread) {
        assert.match(rowOf('PR #980').textContent, new RegExp(`no longer open, time not recorded · ${ESTIMATE_MERGE_WORDS}$`));
        assert.equal(tl(rowOf('PR #980')), undefined, 'no Timeline link');
      } else {
        assert.match(tl(rowOf('PR #980')).href, /^#\/p\/Service-Desk\/timeline\/sprint\/PR(%20| )(%23|#)980$/, 'placed as any pull request: linked to its sprint');
      }
    } finally {
      page.restore();
    }
  }
});

// Build review round 1, A: the `Milestone:` line is compared whole, trimmed, against exactly
// `none (a rough estimate)`; a space inside the brackets, or another letter case, is another line.
test('AC60 (estimates; build review round 1, A): the exact match — `none ( a rough estimate)` and `none (a rough estimate )` are placed as any pull request; `none (a rough estimate)`, with spaces around the line, is the exception; `none (A rough estimate)` and `none  (a rough estimate)` are not', () => {
  const cases = [
    ['Milestone: none ( a rough estimate)\n', false],
    ['Milestone: none (a rough estimate )\n', false],
    ['Milestone: none (A rough estimate)\n', false],
    ['Milestone: none  (a rough estimate)\n', false],
    ['Milestone: none (a rough estimate)\n', true],
    ['Milestone:   none (a rough estimate)  \t\n', true],
  ];
  let n = 980;
  for (const [body, want] of cases) {
    const kept = keptPull(est(++n, { body }), null);
    assert.equal(kept.estimate, true, 'its only changed path is the estimates');
    assert.equal(kept.estimateLine, want, JSON.stringify(body));
    assert.equal(estimateMerge(PLANNER, kept), want, JSON.stringify(body));
    const { feed } = feedOf(answerOf([est(n, { body })]));
    assert.equal(ids(feed).includes(`PR #${n}`), !want, `${JSON.stringify(body)}: ${want ? 'off the Timeline' : 'placed as any pull request'}`);
  }
});
