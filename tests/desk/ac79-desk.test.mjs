// ac-test: S-001/AC79 — the desk's side, through the page's real scheduler and both views, with a fake
// clock and the fake desk function (tests/desk/fake-desk.mjs, which honours the ETags as the function
// does): the poll call's conditional reads answering 304 with no blob call made, and a 200 leading to
// one; a completed run's log read once an opening and again at a new opening; a failing head-time read
// not asked in a poll whose reads all answered 304; and the words: "Being recorded by the automatic job"
// in the sandbox's Queue under Merges, after the counted ones, uncounted, with no coral, opening only its
// GitHub link, "Quiet" kept, not on Home's top line or the owner's tile; the same row among the accepted
// views' activity; "The automatic job left this for you" once left; "Your answer to <question>" on an
// answer record's pull request (AC77). The jobs reads are made up (NOT real records); the ledger and its
// grant are Service-Desk's real records at ef8daf4.
// ac-test: S-001/AC52 (from 2026-10-19: a pull request being recorded offers no verdict box or response
// sheet; each counted one in Merges still does).
// ac-test: S-001/AC77 (from 2026-10-19: the answer record's pull request in Merges as "Being recorded by
// the automatic job", not counted, counted again once the job leaves it, with its added words).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createDesk } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { BEING_RECORDED_WORDS } from '../../src/lib/model.js';
import { LEFT_WORDS } from '../../src/lib/jobwatch.js';
import { fakeClock, fixture, CONFIG } from './helpers.mjs';
import { repo, fakeServer } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll as sbFindAll } from './sandbox-helpers.mjs';
import { loadApp, findAll } from './page-harness.mjs';
import { NOTIFY_FIX } from './notify-helpers.mjs';

const T0 = Date.parse('2026-10-18T12:00:00Z');
const MIN = 60_000;
const sd = (p) => readFileSync(join(NOTIFY_FIX, 'sd-ef8daf4', p), 'utf8');
const HEAD = 'c'.repeat(40);
const ok = (id, done = '2026-10-18T11:40:00Z') => ({ id, name: 'build', status: 'completed', conclusion: 'success', completed_at: done, check_suite: { id: 10 } });
const running = (id) => ({ ...ok(id), status: 'in_progress', conclusion: null, completed_at: null });
const WR = [{ check_suite_id: 10, path: '.github/workflows/desk-build.yml' }];
const arun = (id, at, o = {}) => ({ id, event: 'workflow_run', head_branch: 'main', status: o.status || 'completed', conclusion: o.conclusion === undefined ? 'success' : o.conclusion,
  run_started_at: at, updated_at: at });
const stamped = (...lines) => lines.map((l) => `2026-10-18T11:41:05.1234567Z ${l}`).join('\n') + '\n';
const GRANT = 'NOTE: the asks-merge grant is L-0017';
const QPATH = 'questions/P-001-next-work.md';
const QTEXT = readFileSync(join(NOTIFY_FIX, 'ac77-real', QPATH), 'utf8');

/** A pull request from the project's own branch (REST's form), made up. */
const own = (n, title, sha = HEAD) => ({ number: n, title, html_url: `https://github.com/shumpmaster/Service-Desk/pull/${n}`, draft: false, base: { ref: 'main' },
  head: { ref: `cos/made-up-${n}`, sha, repo: { full_name: 'shumpmaster/Service-Desk' } }, user: { login: 'shumpmaster' }, author_association: 'OWNER',
  created_at: '2026-10-18T11:00:00Z', state: 'open' });

/** Service-Desk with the asks-merge job, its real ledger and grant record, and one candidate; the operating-model project quiet. */
function repos({ pulls, prFiles, jobs, files = {} }) {
  const r = repo({
    'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
    'docs/LEDGER.md': sd('docs/LEDGER.md'),
    'decisions/questions/P-001-asks-merge.md': sd('decisions/questions/P-001-asks-merge.md'),
    '.github/workflows/asks-merge.yml': sd('.github/workflows/asks-merge.yml'),
    ...files,
  }, pulls, [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  r.prFiles = prFiles;
  r.jobs = jobs;
  r.history = { [QPATH]: [{ commit: { committer: { date: '2026-10-18T11:00:00Z' } } }] };
  return { 'Service-Desk': r, 'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]) };
}

const FILING = [{ filename: 'questions/N-filed.md', status: 'added' }];
const ANSWER = [{ filename: 'decisions/questions/P-001-next-work.md', status: 'added' }, { filename: QPATH, status: 'removed' }];
const recordingJobs = () => ({ asksRuns: [arun(1, '2026-10-18T11:30:00Z')], checks: { [HEAD]: { checkRuns: [running(1)], statuses: [], workflowRuns: WR } },
  runJobs: { 1: [{ id: 101, name: 'merge', status: 'completed', conclusion: 'success' }] }, logs: { 101: stamped(GRANT) }, commits: {} });


function openDesk(rs, clock) {
  const server = fakeServer(rs, CONFIG, clock);
  const desk = createDesk({ config: CONFIG, call: server.call, clock, store: createStore(null), isVisible: () => true });
  desk.start();
  return { server, desk };
}

test('AC79 on the scheduler: 304s make no blob call, a 200 makes one; a run\'s log read once an opening and again at a new opening', async () => {
  const clock = fakeClock(T0);
  const rs = repos({ pulls: [own(7, 'File a made-up question')], prFiles: { 7: FILING }, jobs: recordingJobs() });
  let { server, desk } = openDesk(rs, clock);
  await clock.runUntil(T0 + 4 * MIN);
  const model = desk.model('Service-Desk');
  assert.equal(model.flagged.filter((f) => f.kind === 'pr').length, 0, 'not counted');
  assert.deepEqual(model.beingRecorded.map((f) => f.pr.number), [7]);
  const jobsBlob = (c) => c.path === '/api/blobs' && (c.body.jobLog || c.body.commitTime);
  const polls = () => server.calls.filter((c) => c.path === '/api/poll' && c.project === 'Service-Desk');
  assert.ok(polls().some((c) => c.body.jobs && c.body.jobs.heads.length === 1), 'the conditional reads ride the poll call');
  const logsRead = () => server.calls.filter(jobsBlob).flatMap((c) => c.body.jobLog || []);
  assert.deepEqual(logsRead(), ['1'], 'the grant line, once');
  // Steady: every conditional read answers 304, and no AC79 blob call is made.
  const before = server.calls.filter((c) => c.path === '/api/blobs').length;
  await clock.runUntil(T0 + 10 * MIN);
  assert.equal(server.calls.filter((c) => c.path === '/api/blobs').length, before, 'no blob call while nothing changed');
  // A check finishes and the job judges: a 200, and one blob call.
  rs['Service-Desk'].jobs.checks[HEAD].checkRuns = [ok(1, '2026-10-18T12:10:30Z')];
  rs['Service-Desk'].jobs.asksRuns = [arun(2, '2026-10-18T12:11:00Z'), arun(1, '2026-10-18T11:30:00Z')];
  rs['Service-Desk'].jobs.runJobs[2] = [{ id: 102, name: 'merge', status: 'completed', conclusion: 'success' }];
  rs['Service-Desk'].jobs.logs[102] = stamped(GRANT, 'PR #7: waits: questions/N-filed.md: a made-up reason, which waits for the owner');
  await clock.runUntil(T0 + 12 * MIN);
  assert.deepEqual(logsRead(), ['1', '2']);
  const m2 = desk.model('Service-Desk');
  const f = m2.flagged.find((x) => x.kind === 'pr');
  assert.equal(f.leftWords, LEFT_WORDS);
  assert.equal(m2.beingRecorded.length, 0);
  // Logs are read once an opening.
  await clock.runUntil(T0 + 20 * MIN);
  assert.deepEqual(logsRead(), ['1', '2']);
  desk.stop();
  // A new opening reads again, once, the logs it needs: run 2 (the grant line, and the only run since the checks).
  ({ server, desk } = openDesk(rs, clock));
  await clock.runUntil(T0 + 30 * MIN);
  assert.deepEqual(server.calls.filter(jobsBlob).flatMap((c) => c.body.jobLog || []), ['2']);
  assert.equal(desk.model('Service-Desk').flagged.find((x) => x.kind === 'pr').leftWords, LEFT_WORDS);
  desk.stop();
});

test('AC79 on the scheduler: a failing head-time read is not asked in a poll whose reads all answered 304', async () => {
  const clock = fakeClock(T0);
  const jobs = recordingJobs();
  jobs.checks[HEAD] = { checkRuns: [], statuses: [], workflowRuns: [] };
  jobs.fail = { commitTime: [HEAD] };
  const pulls = [{ ...own(7, 'File a made-up question'), created_at: '2026-10-18T11:55:00Z' }];
  const rs = repos({ pulls, prFiles: { 7: FILING }, jobs });
  const { server, desk } = openDesk(rs, clock);
  await clock.runUntil(T0 + 15 * MIN);
  const asked = server.calls.filter((c) => c.path === '/api/blobs' && c.body.commitTime).length;
  assert.equal(asked, 1, 'asked in the one poll where something changed, then not in the 304 polls');
  const f = desk.model('Service-Desk').flagged.find((x) => x.kind === 'pr');
  assert.ok(f, 'counted while its head time is unread');
  assert.equal(f.leftWords, undefined, 'a count the page makes on its own has no words');
  desk.stop();
});

test('AC79 in the sandbox: the Queue\'s Merges shows "Being recorded by the automatic job" after the counted ones, uncounted, no coral, its link only; Quiet kept; not on Home', async () => {
  const pulls = [own(7, 'File a made-up question'), own(8, 'A made-up code change', 'd'.repeat(40))];
  const rs = repos({ pulls, prFiles: { 7: FILING, 8: [{ filename: 'src/x.js', status: 'modified' }] }, jobs: recordingJobs() });
  const app = await loadSandbox({ config: CONFIG, repos: rs, hash: '#/p/Service-Desk/queue', now: T0 });
  try {
    for (let i = 0; i < 4; i++) await app.advance(60_000);
    const merges = byClass(app.view, 'g-merges').find((e) => e.tag === 'section');
    assert.ok(merges, 'the Merges group');
    const rows = byClass(merges, 'sb-qrow');
    assert.equal(rows.length, 2);
    assert.ok(!rows[0].className.includes('sb-recrow'), 'the counted one first');
    assert.ok(rows[1].className.includes('sb-recrow'), 'then the one being recorded');
    assert.ok(rows[1].textContent.includes(BEING_RECORDED_WORDS));
    assert.ok(rows[1].textContent.includes('File a made-up question'));
    const links = sbFindAll(rows[1], (e) => e.tag === 'a');
    assert.equal(links.length, 1);
    assert.equal(links[0].attrs.href, 'https://github.com/shumpmaster/Service-Desk/pull/7', 'it opens only its GitHub link');
    assert.equal(byClass(merges, 'sb-gcount')[0].textContent, '1', 'in no count');
    assert.ok(app.text().includes('1 waiting on you'));
    await app.go('#/p/Service-Desk/queue/pr%3A8');
    assert.ok(byClass(app.view, 'sb-go').some((a) => /reviews%2F8%2Fowner\.md/.test(a.attrs.href || '')), 'the counted one offers the owner\'s verdict box');
    await app.go('#/p/Service-Desk/queue');
    // With the counted one merged, the project is quiet and the row stays.
    rs['Service-Desk'].pulls = [pulls[0]];
    await app.advance(60_000);
    await app.advance(60_000);
    assert.ok(app.text().includes('Nothing waits on you in Service-Desk'));
    assert.ok(app.text().includes(BEING_RECORDED_WORDS));
    assert.equal(byClass(app.view, 'sb-gmark you').length, 0, 'no coral "needs you" mark');
    assert.ok(!byClass(app.view, 'sb-recrow')[0].className.includes('g-merges'), 'no coral edge');
    // Home: not on the top line, not in the owner's tile.
    // Its sheet's address opens no response sheet and no verdict box; a counted one's does.
    await app.go('#/p/Service-Desk/queue/pr%3A7');
    assert.equal(sbFindAll(app.view, (e) => e.tag === 'textarea').length, 0, 'no verdict box');
    assert.ok(!byClass(app.view, 'sb-go').some((a) => /reviews%2F7%2Fowner\.md/.test(a.attrs.href || '')));
    await app.go('#/p/Service-Desk/queue');
    // Not "no longer open" in Done today: it is still open.
    assert.ok(!app.text().includes('File a made-up question PR #7 no longer open'));
    assert.ok(!/File a made-up question.*no longer open/.test(byClass(app.view, 'sb-done-r').map((e) => e.textContent).join('|')));
    await app.go('#/');
    assert.ok(!app.text().includes('File a made-up question'), 'not on Home');
    assert.ok(!/waiting on you/i.test(app.text()), 'Home reads nothing waiting');
    // The Team screen: the owner's tile is idle, with no next line for it, and nobody "Waiting on you".
    await app.go('#/p/Service-Desk/team');
    assert.ok(app.text().includes('Idle: nothing in your queue'));
    assert.ok(!app.text().includes('File a made-up question'));
  } finally {
    app.restore();
  }
});

test('AC79 in the sandbox: an answer record\'s pull request being recorded reads "Your answer to <question>"; left, it counts with "The automatic job left this for you"', async () => {
  const jobs = recordingJobs();
  const rs = repos({ pulls: [own(9, 'Record the answer to the next work')], prFiles: { 9: ANSWER }, jobs, files: { [QPATH]: QTEXT } });
  const app = await loadSandbox({ config: CONFIG, repos: rs, hash: '#/p/Service-Desk/queue', now: T0 });
  try {
    for (let i = 0; i < 4; i++) await app.advance(60_000);
    const rec = byClass(app.view, 'sb-recrow')[0];
    assert.ok(rec, 'being recorded');
    assert.ok(rec.textContent.includes(BEING_RECORDED_WORDS));
    assert.ok(rec.textContent.includes('Your answer to Which piece of later work comes next?'));
    assert.ok(!rec.textContent.includes('usually within minutes'));
    assert.ok(byClass(app.view, 'sb-asking')[0].textContent.includes('Your answer is being recorded'));
    assert.ok(app.text().includes('Nothing waits on you in Service-Desk'));
    // The job leaves it (a check failed): counted again, with its words, and its verdict box opens.
    jobs.checks[HEAD].checkRuns = [{ ...ok(1, '2026-10-18T12:04:00Z'), conclusion: 'failure' }];
    await app.advance(60_000);
    await app.advance(60_000);
    const row = byClass(app.view, 'sb-qrow').find((e) => e.className.includes('g-merges') && !e.className.includes('sb-recrow'));
    assert.ok(row, 'counted again under Merges');
    assert.ok(row.textContent.includes(LEFT_WORDS));
    assert.ok(row.textContent.includes('Your answer to Which piece of later work comes next?'));
    assert.equal(byClass(app.view, 'sb-recrow').length, 0);
    assert.ok(app.text().includes('1 waiting on you'));
  } finally {
    app.restore();
  }
});

test('AC79 in the accepted views: the row among the activity, never flagged, its link only; once left, flagged with its words', async () => {
  const jobs = recordingJobs();
  const rs = repos({ pulls: [own(7, 'File a made-up question')], prFiles: { 7: FILING }, jobs });
  const app = await loadApp({ repos: rs, now: T0, hash: '#/p/Service-Desk' });
  try {
    for (let i = 0; i < 4; i++) await app.advance(60_000);
    const view = app.els.view.textContent;
    assert.ok(view.includes('Nothing waiting on you here.'));
    const rows = findAll(app.els.view, (e) => e.tag === 'li' && e.className === 'recording');
    assert.equal(rows.length, 1, 'among the activity');
    assert.ok(rows[0].textContent.includes(`PR #7: File a made-up question · ${BEING_RECORDED_WORDS}`));
    assert.equal(findAll(rows[0], (e) => e.tag === 'a')[0].attrs.href, 'https://github.com/shumpmaster/Service-Desk/pull/7');
    assert.equal(findAll(app.els.view, (e) => e.className === 'flagged-list').length, 0);
    jobs.checks[HEAD].checkRuns = [{ ...ok(1, '2026-10-18T12:04:00Z'), conclusion: 'failure' }];
    await app.advance(60_000);
    await app.advance(60_000);
    const flagged = findAll(app.els.view, (e) => e.tag === 'ul' && /flagged-list/.test(e.className || ''));
    assert.equal(flagged.length, 1);
    assert.ok(flagged[0].textContent.includes(LEFT_WORDS));
    assert.equal(findAll(app.els.view, (e) => e.tag === 'li' && e.className === 'recording').length, 0);
  } finally {
    app.restore();
  }
});

test('AC79 with AC74\'s tap: a notified pull request the desk still shows as being recorded opens its row, never "That no longer waits on you"', async () => {
  const { tapDecision, openTarget } = await import('../../src/lib/notifyview.js');
  const target = openTarget('?sandbox&open=Service-Desk|pr|7');
  const rec = { key: 'pr:7', kind: 'pr-recording', pr: { number: 7 } };
  const box = (beingRecorded) => () => ({ read: { read: 'ok' }, model: { flagged: [], asking: [], beingRecorded } });
  let d = tapDecision({ target, projects: CONFIG.projects, box: box([rec]), settled: () => true });
  assert.equal(d.kind, 'recording');
  assert.equal(d.row, rec);
  d = tapDecision({ target, projects: CONFIG.projects, box: box([]), settled: () => true });
  assert.equal(d.kind, 'gone', 'gone only when the desk no longer shows it at all');
  // In the sandbox: the tap follows once the project is read (counted then, before the first judgment, so
  // its sheet); once the desk judges it being recorded, the sheet shows that, with its link only.
  const rs = repos({ pulls: [own(7, 'File a made-up question')], prFiles: { 7: FILING }, jobs: recordingJobs() });
  const app = await loadSandbox({ config: CONFIG, repos: rs, hash: '', search: '?sandbox&open=Service-Desk%7Cpr%7C7', now: T0 });
  try {
    for (let i = 0; i < 4; i++) await app.advance(60_000);
    assert.match(app.loc.hash, /^#\/p\/Service-Desk\/queue/);
    assert.ok(!app.text().includes('That no longer waits on you'));
    assert.equal(sbFindAll(app.view, (e) => e.tag === 'textarea').length, 0, 'no verdict box');
    assert.ok(app.text().includes(BEING_RECORDED_WORDS));
  } finally {
    app.restore();
  }
});
