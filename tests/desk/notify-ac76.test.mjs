// ac-test: S-001/AC76 — failures (and, draft 7, the second read's checks, the memory issues' words and
// their closing): a fake push service answering 201, 429 then 201, 503 three times,
// 404, 410, 403 BadJwtToken then 201 after a new JWT, BadJwtToken over five runs in an hour (one new
// JWT only), VapidPkHashMismatch (no new JWT) and `test: fail` (one request); fake GitHub reads
// failing; the 6-hour give-up counted, not named; the issue opened, updated and closed with no item's
// title, path or number in it; the keys' check at the first step; and the state read failing or forged.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { REPO, REPO_ID, MIN, HOUR, checkoutOf, harness, makeSubscription, makeVapid, testConfig, pull, cleanScratch, ownWorkflowRun } from './notify-helpers.mjs';
import { emptyState, stateFiles, datingArtifact } from '../../src/notify/state.mjs';
import { reasonText } from '../../src/notify/issue.mjs';
import { makeZip } from './notify-helpers.mjs';

after(cleanScratch);

const base = { 'questions/_TEMPLATE.md': '# Ruling needed: <title>\n' };
const Q = (t) => `# Ruling needed: ${t}\n\nMilestone: none (made up)\n\nWHY: made up\n`;
const co = (names) => checkoutOf({ base, later: names.map((n, i) => ({ files: { [`questions/${n}.md`]: Q(`Secret-ish title ${n}`) }, date: `2026-10-18T11:${String(10 + i).padStart(2, '0')}:00+00:00` })) });
const jwtOf = (p) => /t=([^,]+),/.exec(p.headers.get('authorization'))[1];
const openIssue = (h) => h.world.issues.find((i) => i.state === 'open');

/** A started harness: the bootstrap is done; then one new question waits each time `add` is called. */
async function started() {
  const h = harness({ checkout: co([]) });
  await h.run();
  h.names = [];
  h.add = (n) => {
    h.names.push(n);
    h.checkout = co(h.names);
  };
  return h;
}

function noItemIn(text) {
  assert.ok(!/Secret-ish|questions\/|N-[a-z]|#\d/.test(text), `an item's words in: ${text.slice(0, 200)}`);
}

test('AC76: 429 then 201 is retried once after 5 seconds; 503 three times, after 5 and 30 seconds, then kept unsent and sent next run', async () => {
  const h = await started();
  h.add('N-a');
  const answers = [{ status: 429 }, { status: 201 }];
  h.world.push = () => answers.shift() || { status: 201 };
  h.clock.sleeps.length = 0;
  const r = await h.run();
  assert.equal(r.pushes.length, 2);
  assert.deepEqual(h.clock.sleeps, [5000]);
  assert.equal(r.pushes[1].at - r.pushes[0].at, 5000);
  h.add('N-b');
  h.world.push = () => ({ status: 503 });
  h.clock.sleeps.length = 0;
  const r2 = await h.run();
  assert.equal(r2.pushes.length, 3);
  assert.deepEqual(h.clock.sleeps, [5000, 30000]);
  assert.equal(r2.code, 0);
  const st = h.state(r2);
  assert.equal(Object.values(st.keys).filter((e) => e.unsent && e.fail === 'later').length, 1);
  h.world.push = () => ({ status: 201 });
  const r3 = await h.run();
  assert.equal(r3.pushes.length, 1);
  assert.equal(r3.payloads[0].notification.body, 'Waits on you: a question: Secret-ish title N-b');
  assert.equal(Object.values(h.state(r3).keys).filter((e) => e.unsent).length, 0);
});

test('AC76: one unsent for 6 hours is given up, counted in the issue by project and number only', async () => {
  const h = await started();
  h.add('N-a');
  h.add('N-b');
  h.world.push = () => ({ status: 503 });
  await h.run({ after: 3 * HOUR });
  const almost = await h.run({ after: 3 * HOUR });
  assert.equal(almost.pushes.length, 3, '3 hours on: still tried');
  const r = await h.run({ after: 5 * MIN });
  assert.equal(r.pushes.length, 0, 'given up: not tried again');
  assert.ok(r.logs.some((l) => /given up: 2 \(2 this run\)/.test(l)));
  const issue = openIssue(h);
  assert.ok(issue);
  assert.match(issue.body, /Service-Desk: 2 notifications were given up after 6 hours/);
  noItemIn(issue.body);
  // Still not sent while they wait, even once the push service answers again.
  h.world.push = () => ({ status: 201 });
  assert.equal((await h.run()).pushes.length, 0);
  // Once they stop waiting, the count goes and the issue closes.
  h.names = [];
  h.checkout = co([]);
  await h.run();
  assert.equal(openIssue(h), undefined);
});

test('AC76: 410 and 404: the issue opens, nothing is sent until DESK_PUSH_SUBSCRIPTION changes, then "Notifications are back on" and it closes', async () => {
  for (const status of [410, 404]) {
    const h = await started();
    h.add('N-a');
    h.world.push = () => ({ status });
    const r = await h.run();
    assert.equal(r.pushes.length, 1);
    const issue = openIssue(h);
    assert.equal(issue.title, 'Desk notifications have stopped');
    assert.deepEqual(issue.labels, ['desk-notify']);
    assert.deepEqual(issue.assignees, ['shumpmaster']);
    assert.match(issue.body, /subscription has expired or is no longer valid/);
    assert.match(issue.body, /Setup N5/);
    assert.match(issue.body, /Setup N6/);
    assert.match(issue.body, /Setup N8/);
    noItemIn(issue.body);
    // Nothing more, run after run, new things included.
    h.add('N-b');
    assert.equal((await h.run()).pushes.length, 0);
    assert.equal((await h.run({ test: 'true' })).pushes.length, 0);
    // The owner turns notifications on again and updates the secret.
    h.sub = makeSubscription();
    h.world.push = () => ({ status: 201 });
    const r4 = await h.run();
    assert.equal(r4.payloads[0].notification.body, 'Notifications are back on');
    assert.deepEqual(r4.payloads.slice(1).map((p) => p.notification.title), ['Service-Desk', 'Service-Desk']);
    assert.equal(openIssue(h), undefined);
    assert.equal(h.world.issues[0].state, 'closed');
  }
});

test('AC76: 403 BadJwtToken: the item kept unsent and tried each run, one new JWT in an hour, then 201 closes the issue', async () => {
  const h = await started();
  h.add('N-a');
  const r0 = await h.run({ after: 1 * MIN }); // sent with the first JWT, minted now
  const first = jwtOf(r0.pushes[0]);
  h.add('N-b');
  h.world.push = () => ({ status: 403, body: { reason: 'BadJwtToken' } });
  const jwts = [];
  const runs = [];
  for (let i = 0; i < 5; i++) {
    const r = await h.run({ after: 15 * MIN });
    runs.push(r);
    jwts.push(...r.pushes.map(jwtOf));
  }
  // Five runs within the hour after the first JWT and one at 61 minutes: one new JWT only, never more.
  assert.ok(runs.every((r) => r.code === 0));
  assert.ok(runs.every((r) => r.pushes.length >= 1));
  assert.equal(new Set(jwts).size, 2);
  assert.equal(jwts[0], first);
  assert.match(openIssue(h).body, /\(403, BadJwtToken\)/);
  assert.match(openIssue(h).body, /at most once an hour/);
  h.world.push = () => ({ status: 201 });
  const r = await h.run();
  assert.equal(r.pushes.length, 1);
  assert.equal(openIssue(h), undefined);
});

test('AC76: 403 VapidPkHashMismatch: no new JWT, the issue says so, and the sender keeps trying each run', async () => {
  const h = await started();
  h.add('N-a');
  h.world.push = () => ({ status: 403, body: { reason: 'VapidPkHashMismatch' } });
  const r1 = await h.run({ after: 61 * MIN });
  const r2 = await h.run();
  assert.equal(r1.pushes.length, 1, 'no retry with a new JWT');
  assert.equal(r2.pushes.length, 1, 'tried again the next run');
  assert.match(openIssue(h).body, /\(403, VapidPkHashMismatch\)/);
  assert.match(openIssue(h).body, /makes no new signature for this/);
  for (const status of [400, 401]) {
    const g = await started();
    g.add('N-a');
    g.world.push = () => ({ status });
    const r = await g.run();
    assert.equal(r.code, 0);
    assert.match(openIssue(g).body, new RegExp(`\\(${status}\\)`));
  }
});

test('AC76: test: fail opens the issue marked "(test)", closed on the next good push', async () => {
  const h = await started();
  h.world.push = () => ({ status: 403, body: { reason: 'VapidPkHashMismatch' } });
  const r = await h.run({ test: 'fail' });
  assert.equal(r.pushes.length, 1);
  assert.match(openIssue(h).body, /^- \(test\) The test from GitHub \(`test: fail`\) was refused by the push service, as a test should be \(403, VapidPkHashMismatch\)/m);
  h.world.push = () => ({ status: 201 });
  await h.run();
  assert.ok(openIssue(h), 'no push yet: still open');
  h.add('N-a');
  await h.run();
  assert.equal(openIssue(h), undefined);
});

test('AC76: the keys\' check at the first step: exit 1, the issue, no push and no state', async () => {
  const vapid = makeVapid();
  const other = makeVapid();
  const h = harness({ checkout: co(['N-a']), vapid, config: testConfig(other) });
  const r = await h.run();
  assert.equal(r.code, 1);
  assert.equal(r.pushes.length, 0);
  assert.equal(r.wrote, false);
  assert.match(openIssue(h).body, /notification keys don't match/);
  // A missing secret: exit 1, named, never printed; no issue for it.
  const g = harness({ checkout: co(['N-a']) });
  g.env.DESK_NOTIFY_STATE_KEY = '';
  const r2 = await g.run();
  assert.equal(r2.code, 1);
  assert.ok(r2.logs.some((l) => /the secret DESK_NOTIFY_STATE_KEY is missing/.test(l)));
  // A malformed subscription.
  const k = harness({ checkout: co(['N-a']) });
  k.env.DESK_PUSH_SUBSCRIPTION = '{"endpoint": "https://push.example.invalid/x", "keys": {}}';
  const r3 = await k.run();
  assert.equal(r3.code, 1);
  assert.ok(r3.logs.some((l) => /the secret DESK_PUSH_SUBSCRIPTION is not in its form/.test(l)));
  assert.ok(!r3.logs.join('\n').includes('push.example.invalid'));
});

test('AC76: a project unread keeps its set; at 30 minutes in a row the issue says so, and closes once it reads again', async () => {
  const h = await started();
  h.add('N-a');
  await h.run();
  h.world.fail[`/repos/${REPO}/pulls?`] = 502;
  h.add('N-b');
  for (let i = 0; i < 6; i++) {
    const r = await h.run();
    assert.equal(r.pushes.length, 0);
  }
  assert.equal(openIssue(h), undefined, '25 minutes: no issue yet');
  await h.run();
  assert.match(openIssue(h).body, /Desk notifications can't read Service-Desk/);
  noItemIn(openIssue(h).body);
  delete h.world.fail[`/repos/${REPO}/pulls?`];
  const r = await h.run();
  assert.equal(r.pushes.length, 1, 'what started waiting meanwhile, once');
  assert.equal(openIssue(h), undefined);
});

test('AC76: the state unreadable sends nothing (issue after 30 minutes in a row); forged, the issue at once', async () => {
  const h = await started();
  h.add('N-a');
  h.world.fail[`/repos/${REPO}/actions/artifacts/`] = 502;
  for (let i = 0; i < 6; i++) {
    const r = await h.run();
    assert.equal(r.pushes.length, 0);
    assert.equal(r.wrote, false);
  }
  assert.equal(openIssue(h), undefined);
  await h.run();
  assert.match(openIssue(h).body, /memory could not be read for 30 minutes/);
  delete h.world.fail[`/repos/${REPO}/actions/artifacts/`];
  const r = await h.run();
  assert.equal(r.pushes.length, 1);
  assert.equal(openIssue(h), undefined);
  // Forged.
  const g = await started();
  const s = emptyState(new Date(g.clock.now()).toISOString());
  const forged = stateFiles('a forger, 32 characters or more, made up', s);
  const id = g.nextRun++;
  g.world.stateRuns.push({ id, path: '.github/workflows/desk-notify.yml', repository: { full_name: REPO }, head_repository: { full_name: REPO },
    head_branch: 'main', event: 'schedule', status: 'completed', conclusion: 'success', created_at: new Date(g.clock.now()).toISOString() });
  g.world.artifacts.push({ id: 90000, name: 'desk-notify-state', expired: false, size_in_bytes: 10, created_at: '2026-10-18T12:00:00Z', workflow_run: { id },
    zip: makeZip({ 'state.json': forged.json, 'state.sig': forged.sig }) });
  g.add('N-a');
  const rf = await g.run();
  assert.equal(rf.pushes.length, 0);
  assert.match(openIssue(g).body, /memory could not be trusted/);
});

test('AC76: the issue updated as its reasons change, and only then; no item\'s title, path or number in any body', async () => {
  const h = await started();
  h.world.pulls = [pull(77, { title: 'Secret-ish pull request' })];
  h.world.push = () => ({ status: 403, body: { reason: 'BadJwtToken' } });
  await h.run();
  const n = h.world.ghCalls.filter((c) => c.method !== 'GET' && c.path.includes('/issues')).length;
  await h.run();
  assert.equal(h.world.ghCalls.filter((c) => c.method !== 'GET' && c.path.includes('/issues')).length, n, 'unchanged: not rewritten');
  h.world.fail[`/repos/${REPO}/pulls?`] = 502;
  for (let i = 0; i < 7; i++) await h.run();
  const issue = openIssue(h);
  assert.match(issue.body, /BadJwtToken/);
  assert.match(issue.body, /can't read Service-Desk/);
  for (const i of h.world.issues) noItemIn(i.body);
});

// The Orchestrator's ruling for AC76 (draft 6): a failed list of the sender's own runs, or of a run's
// artifacts, is dated from the newest desk-notify-state artifact's created time (one page of the
// repository's artifacts by name); more than 30 minutes old, the issue opens; that read failing, or
// finding no artifact, opens it at once; an issue that can't be opened is logged and the run ends as before.
for (const [what, failPrefix] of [
  ['the runs list', `/repos/${REPO}/actions/workflows/desk-notify.yml/runs`],
  ['a run\'s artifact list', `/repos/${REPO}/actions/runs/`],
]) {
  test(`AC76 (draft 6): ${what} failing is dated from the newest state artifact: no issue under 30 minutes, the issue once it is older`, async () => {
    const h = await started();
    h.add('N-a');
    h.world.fail[failPrefix] = 502;
    // The last good artifact was uploaded by the bootstrap run, 5 minutes before this run.
    let r = await h.run({ after: 24 * MIN });
    assert.equal(r.pushes.length, 0);
    assert.equal(r.wrote, false);
    assert.ok(r.ghCalls.some((c) => c.path === `/repos/${REPO}/actions/artifacts?name=desk-notify-state&per_page=100`), 'one page of the artifacts by name');
    assert.equal(openIssue(h), undefined, '5 minutes old: no issue');
    r = await h.run({ after: 2 * MIN }); // 29 minutes old
    assert.equal(openIssue(h), undefined, '29 minutes old: no issue');
    r = await h.run(); // 31 minutes old: "30 minutes or more"
    assert.match(openIssue(h).body, /memory could not be read for 30 minutes/);
    noItemIn(openIssue(h).body);
    assert.equal(r.code, 0);
    delete h.world.fail[failPrefix];
    r = await h.run();
    assert.equal(r.pushes.length, 1);
    assert.equal(openIssue(h), undefined, 'closed once it reads again');
  });
}

test('AC76 (draft 6): a failed runs list whose artifacts read also fails, or finds none, opens the issue at once', async () => {
  const h = await started();
  h.world.fail[`/repos/${REPO}/actions/workflows/desk-notify.yml/runs`] = 502;
  h.world.fail[`/repos/${REPO}/actions/artifacts?name=`] = 503;
  let r = await h.run();
  assert.equal(r.wrote, false);
  assert.match(openIssue(h).body, /memory could not be read/);
  // None found: a world with no artifact at all (seven days without a run, say).
  const g = await started();
  g.world.artifacts.length = 0;
  g.world.fail[`/repos/${REPO}/actions/runs/`] = 502;
  // The runs list answers but every artifact list fails: dated from the artifacts by name, which hold none.
  r = await g.run();
  assert.equal(r.pushes.length, 0);
  assert.match(openIssue(g).body, /memory could not be read/);
});

test('AC76 (draft 6): an issue that can\'t be opened is logged, and the run ends as before (exit 0, nothing sent or saved)', async () => {
  const h = await started();
  h.world.fail[`/repos/${REPO}/actions/workflows/desk-notify.yml/runs`] = 502;
  h.world.fail[`/repos/${REPO}/actions/artifacts?name=`] = 503;
  h.world.fail[`/repos/${REPO}/issues`] = 500;
  const r = await h.run();
  assert.equal(r.code, 0);
  assert.equal(r.wrote, false);
  assert.equal(r.pushes.length, 0);
  assert.ok(r.logs.some((l) => /issue: the open issues could not be read/.test(l)), r.logs.join('\n'));
  assert.equal(h.world.issues.length, 0);
});

// Draft 7 (Critic round 5, finding 1 and note 8): the second read passes over any artifact whose
// `workflow_run` is not on main with this repository's id as both `repository_id` and
// `head_repository_id`, reads no run by id, and takes the newest that passes; a page with none
// passing, or no GITHUB_REPOSITORY_ID, opens the issue at once, in its own words. Each memory line
// goes at the first run whose lookup reads a state again, or answers with none.
const ARTIFACTS_READ = `/repos/${REPO}/actions/artifacts?name=desk-notify-state&per_page=100`;
const RUNS_LIST = `/repos/${REPO}/actions/workflows/desk-notify.yml/runs`;
const WORDS_30 = "The sender's memory could not be read for 30 minutes or more, so it sends nothing until it can.";
const WORDS_AT_ONCE = "The sender's memory could not be read, and GitHub didn't say for how long, so it sends nothing until it can. If this was a passing GitHub failure, this closes by itself.";
const WORDS_FORGED = "The sender's memory could not be trusted: its saved state's signature does not match, so the sender sends nothing until a good state is read.";

/** A newer `desk-notify-state` artifact that is not the sender's own (made up; never readable as a state). */
function otherArtifact(h, o) {
  const id = h.nextRun++;
  h.world.artifacts.push({ id: id + 50000, name: 'desk-notify-state', expired: false, size_in_bytes: 10, created_at: new Date(h.clock.now()).toISOString(),
    workflow_run: ownWorkflowRun(id, o), zip: Buffer.from('not a zip') });
}

test('AC76 (draft 7): a branch\'s, a fork\'s and another repository\'s newer artifacts are passed over; the sender\'s own older artifact dates the failure', async () => {
  for (const o of [{ headBranch: 'cos/made-up' }, { headRepositoryId: 700002 }, { repositoryId: 700002 }]) {
    const h = await started(); // its own artifact at the bootstrap run
    h.add('N-a');
    h.clock.advance(10 * MIN);
    otherArtifact(h, o); // 15 minutes after the bootstrap's
    h.clock.advance(10 * MIN);
    otherArtifact(h, o); // 25 minutes after
    h.world.fail[RUNS_LIST] = 502;
    let r = await h.run({ after: 1 * MIN }); // own artifact 25 minutes old
    assert.equal(openIssue(h), undefined, `${JSON.stringify(o)}: 25 minutes from its own artifact: no issue`);
    assert.equal(r.ghCalls.filter((c) => c.path === ARTIFACTS_READ).length, 1, 'one page, newest first');
    assert.ok(!r.ghCalls.some((c) => /\/actions\/runs\/\d+($|\?)/.test(c.path.split('?')[0]) || /\/actions\/runs\/\d+\/artifacts/.test(c.path)), 'no run read by id');
    r = await h.run({ after: 1 * MIN }); // 26 minutes
    h.clock.advance(3 * MIN);
    r = await h.run(); // 30 minutes: the issue, which a newer look-alike would have kept shut
    assert.equal(r.wrote, false);
    assert.equal(r.pushes.length, 0);
    assert.ok(openIssue(h).body.includes(WORDS_30), JSON.stringify(o));
    assert.ok(!openIssue(h).body.includes(WORDS_AT_ONCE));
  }
  // The checks by themselves: the id compared as GitHub gives it (a number), and as the runner's string.
  const a = { name: 'desk-notify-state', created_at: '2026-10-18T12:00:00Z', workflow_run: ownWorkflowRun(1) };
  assert.equal(datingArtifact(a, String(REPO_ID), 'main'), true);
  assert.equal(datingArtifact({ ...a, workflow_run: { ...a.workflow_run, head_branch: 'dev' } }, String(REPO_ID), 'main'), false);
  assert.equal(datingArtifact({ ...a, workflow_run: { ...a.workflow_run, head_repository_id: 1 } }, String(REPO_ID), 'main'), false);
  assert.equal(datingArtifact({ ...a, workflow_run: { id: 1 } }, String(REPO_ID), 'main'), false, 'no ids listed: passed over');
});

test('AC76 (draft 7): a page with none passing, or no GITHUB_REPOSITORY_ID, opens the issue at once, in its own words', async () => {
  // Only look-alikes on the page: at once.
  let h = await started();
  h.world.artifacts.length = 0;
  otherArtifact(h, { headBranch: 'cos/made-up' });
  otherArtifact(h, { headRepositoryId: 700002 });
  h.world.fail[RUNS_LIST] = 502;
  let r = await h.run();
  assert.equal(r.wrote, false);
  assert.equal(r.pushes.length, 0);
  assert.ok(openIssue(h).body.includes(WORDS_AT_ONCE), openIssue(h) && openIssue(h).body);
  assert.ok(!openIssue(h).body.includes(WORDS_30));
  noItemIn(openIssue(h).body);
  // No repository id from the runner: at once, without the second read.
  h = await started();
  h.env.GITHUB_REPOSITORY_ID = '';
  h.world.fail[RUNS_LIST] = 502;
  r = await h.run();
  assert.ok(!r.ghCalls.some((c) => c.path === ARTIFACTS_READ), 'nothing to check the artifacts against: no read');
  assert.ok(openIssue(h).body.includes(WORDS_AT_ONCE));
  assert.equal(r.code, 0);
});

test('AC76 (draft 7): each memory issue\'s words', () => {
  assert.equal(reasonText({ code: 'state-unread' }), WORDS_30);
  assert.equal(reasonText({ code: 'state-undated' }), WORDS_AT_ONCE);
  assert.equal(reasonText({ code: 'forged' }), WORDS_FORGED);
});

test('AC76 (draft 7): the at-once and 30-minute lines close at the next run that reads a state', async () => {
  // At once (the runs list and the artifacts read failing), then a run whose lookup reads the state.
  let h = await started();
  h.add('N-a');
  h.world.fail[RUNS_LIST] = 502;
  h.world.fail[`/repos/${REPO}/actions/artifacts?name=`] = 503;
  await h.run();
  assert.ok(openIssue(h).body.includes(WORDS_AT_ONCE));
  delete h.world.fail[RUNS_LIST];
  delete h.world.fail[`/repos/${REPO}/actions/artifacts?name=`];
  let r = await h.run();
  assert.equal(r.pushes.length, 1, 'what waited meanwhile, once');
  assert.equal(openIssue(h), undefined, 'closed: the state was read');
  // 30 minutes, then a run that reads the state.
  h = await started();
  h.add('N-a');
  h.world.fail[`/repos/${REPO}/actions/artifacts/`] = 502;
  for (let i = 0; i < 7; i++) await h.run();
  assert.ok(openIssue(h).body.includes(WORDS_30));
  delete h.world.fail[`/repos/${REPO}/actions/artifacts/`];
  r = await h.run();
  assert.equal(openIssue(h), undefined);
});

test('AC76 (draft 7): an at-once line closes at a run that finds "no state", with the project read or not', async () => {
  for (const projectRead of [true, false]) {
    // The first runs: no artifact yet, and the runs list failing gives the issue at once.
    const h = harness({ checkout: co(['N-a']) });
    h.world.fail[RUNS_LIST] = 502;
    let r = await h.run();
    assert.equal(r.wrote, false);
    assert.ok(openIssue(h).body.includes(WORDS_AT_ONCE));
    // The list answers, with no run that saved a state: "no state".
    delete h.world.fail[RUNS_LIST];
    if (!projectRead) h.world.fail[`/repos/${REPO}/pulls?`] = 502;
    r = await h.run();
    assert.ok(r.logs.some((l) => /state: none/.test(l)), r.logs.join('\n'));
    assert.equal(openIssue(h), undefined, `closed (project read: ${projectRead})`);
    assert.equal(r.pushes.length, projectRead ? 1 : 0, projectRead ? 'the start-up summary' : 'nothing sent while not read');
  }
});
