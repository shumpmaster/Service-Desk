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
  // Before the first judgment answers (the first cycle reads the tree, the files and the ledger): counted.
  await clock.runUntil(T0 + 1000);
  assert.deepEqual(desk.model('Service-Desk').flagged.filter((f) => f.kind === 'pr').map((f) => f.pr.number), [7], 'counted before the first judgment');
  assert.equal(desk.model('Service-Desk').beingRecorded.length, 0);
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

test('AC79 + AC80 in the sandbox: the board\'s quiet line "Being recorded by the automatic job" holds the pull request, uncounted, no card and no coral, its link only; the counted one a card; quiet kept; not on Home', async () => {
  const pulls = [own(7, 'File a made-up question'), own(8, 'A made-up code change', 'd'.repeat(40))];
  const rs = repos({ pulls, prFiles: { 7: FILING, 8: [{ filename: 'src/x.js', status: 'modified' }] }, jobs: recordingJobs() });
  const app = await loadSandbox({ config: CONFIG, repos: rs, hash: '#/waiting/Service-Desk', now: T0 });
  const lane = (k) => sbFindAll(app.view, (e) => e.dataset && e.dataset.k === `lane:${k}`)[0];
  try {
    for (let i = 0; i < 4; i++) await app.advance(60_000);
    const cards = byClass(lane('wait'), 'v2-card');
    assert.deepEqual(cards.map((c) => byClass(c, 'v2-t')[0].textContent), ['A made-up code change'], 'the counted one a card; the one being recorded none');
    assert.equal(byClass(lane('wait'), 'v2-lc')[0].textContent, '1', 'in no count');
    const ql = sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'ql:recording')[0];
    assert.ok(ql, 'the quiet line');
    assert.equal(ql.textContent, `${BEING_RECORDED_WORDS}: 1`);
    await app.tap(ql);
    const fold = sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'fold:recording')[0];
    assert.ok(fold, 'a tap opens its fold');
    const row = sbFindAll(fold, (e) => e.tag === 'li')[0];
    assert.ok(row.textContent.includes(BEING_RECORDED_WORDS));
    assert.ok(row.textContent.includes('File a made-up question'));
    const links = sbFindAll(row, (e) => e.tag === 'a');
    assert.equal(links.length, 1);
    assert.equal(links[0].attrs.href, 'https://github.com/shumpmaster/Service-Desk/pull/7', 'it opens only its GitHub link');
    assert.equal(byClass(app.view, 'v2-badge')[0].children[0].textContent, '1', 'the badge counts the card alone');
    await app.go(cards[0].attrs['data-href'] || byClass(cards[0], 'v2-t')[0].attrs.href);
    // The counted one's sheet offers its one step (AC80, in place of AC52's verdict box on every pull
    // request): this made-up repository has no risk-paths file, so J22 can't judge it and the step
    // opens the pull request on GitHub.
    const sh = byClass(app.view, 'v2-sheet')[0];
    assert.ok(sh.textContent.includes('Whether it needs your verdict: not known yet'));
    assert.ok(sbFindAll(sh, (e) => e.tag === 'a' && e.textContent === 'Open on GitHub ↗').some((a) => a.attrs.href === 'https://github.com/shumpmaster/Service-Desk/pull/8'));
    assert.ok(!sbFindAll(sh, (e) => e.tag === 'a').some((a) => /owner\.md/.test(a.attrs.href || '')), 'no verdict file offered where J22 can\'t judge');
    await app.go('#/waiting/Service-Desk');
    // With the counted one merged, the project is quiet and the line stays.
    rs['Service-Desk'].pulls = [pulls[0]];
    await app.advance(60_000);
    await app.advance(60_000);
    assert.equal(byClass(lane('wait'), 'v2-card').length, 0);
    assert.ok(lane('wait').textContent.includes('Nothing here'));
    assert.ok(app.text().includes(`${BEING_RECORDED_WORDS}: 1`));
    assert.equal(byClass(app.view, 'v2-badge').length, 0, 'no badge');
    assert.equal(byClass(app.view, 'v2-k you').length, 0, 'no vermilion mark');
    // The old Queue address for it opens Waiting so filtered, with no sheet: no card has its key.
    await app.go('#/p/Service-Desk/queue/pr%3A7');
    assert.equal(app.loc.hash, '#/waiting/Service-Desk');
    assert.equal(byClass(app.view, 'v2-sheet').length, 0, 'no sheet, so no verdict box');
    assert.equal(sbFindAll(app.view, (e) => e.tag === 'textarea').length, 0);
    // Not in Done: it is still open.
    assert.ok(!lane('done').textContent.includes('File a made-up question'));
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

test('AC79 + AC80 in the sandbox: an answer record\'s pull request being recorded reads "Your answer to <question>"; left, it is a card again with "The automatic job left this for you"', async () => {
  const jobs = recordingJobs();
  const rs = repos({ pulls: [own(9, 'Record the answer to the next work')], prFiles: { 9: ANSWER }, jobs, files: { [QPATH]: QTEXT } });
  const app = await loadSandbox({ config: CONFIG, repos: rs, hash: '#/waiting/Service-Desk', now: T0 });
  const lane = (k) => sbFindAll(app.view, (e) => e.dataset && e.dataset.k === `lane:${k}`)[0];
  try {
    for (let i = 0; i < 4; i++) await app.advance(60_000);
    await app.tap(sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'ql:recording')[0]);
    const rec = sbFindAll(sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'fold:recording')[0], (e) => e.tag === 'li')[0];
    assert.ok(rec, 'being recorded');
    assert.ok(rec.textContent.includes(BEING_RECORDED_WORDS));
    assert.ok(rec.textContent.includes('Your answer to Which piece of later work comes next?'));
    assert.ok(!rec.textContent.includes('usually within minutes'));
    assert.ok(app.text().includes('Your answer is being recorded: 1'), 'the question\'s own quiet line');
    assert.equal(byClass(lane('wait'), 'v2-card').length, 0, 'nothing waits on you');
    // The job leaves it (a check failed): a card again, with its words, and its sheet offers the verdict.
    jobs.checks[HEAD].checkRuns = [{ ...ok(1, '2026-10-18T12:04:00Z'), conclusion: 'failure' }];
    await app.advance(60_000);
    await app.advance(60_000);
    const card = byClass(lane('wait'), 'v2-card')[0];
    assert.ok(card, 'a card again in "Waiting on you"');
    assert.ok(app.text().includes(`${BEING_RECORDED_WORDS}: 0`), 'no longer being recorded (frame 2\'s small line keeps its two counts)');
    assert.equal(byClass(app.view, 'v2-badge')[0].children[0].textContent, '1');
    await app.go(byClass(card, 'v2-t')[0].attrs.href);
    const sheet = byClass(app.view, 'v2-sheet')[0];
    assert.ok(sheet.textContent.includes(LEFT_WORDS), 'its sheet says why it is here');
    assert.ok(sheet.textContent.includes('Your answer to Which piece of later work comes next?'), 'and names the answer it carries');
  } finally {
    app.restore();
  }
});

// From stage 8 (AC44, step 4, specs/S-001.md:2918-2921; Terms, "The accepted views count such a pull request until
// stage 8", :13714): the accepted views are gone, and this case is the desk's: the same filing pull request on the
// board, being recorded in its quiet fold, never a card, its link only; once the automatic job leaves it, a card
// waiting on the owner with the job's words, out of the fold.
test('AC79 on the desk (the accepted views\' case until stage 8): a filing pull request being recorded is in the quiet fold, never a card, its link only; once left, a card with its words', async () => {
  const jobs = recordingJobs();
  const rs = repos({ pulls: [own(7, 'File a made-up question')], prFiles: { 7: FILING }, jobs });
  const app = await loadSandbox({ config: CONFIG, repos: rs, now: T0, hash: '#/waiting/Service-Desk' });
  const lane = (k) => sbFindAll(app.view, (e) => e.dataset && e.dataset.k === `lane:${k}`)[0];
  try {
    for (let i = 0; i < 4; i++) await app.advance(60_000);
    assert.equal(byClass(lane('wait'), 'v2-card').length, 0, 'never flagged: no card');
    assert.ok(lane('wait').textContent.includes('Nothing here'));
    const ql = sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'ql:recording')[0];
    assert.equal(ql.textContent, `${BEING_RECORDED_WORDS}: 1`, 'with the agents\' quiet lines');
    await app.tap(ql);
    const row = sbFindAll(sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'fold:recording')[0], (e) => e.tag === 'li')[0];
    assert.ok(row.textContent.includes('File a made-up question') && row.textContent.includes(BEING_RECORDED_WORDS));
    assert.deepEqual(sbFindAll(row, (e) => e.tag === 'a').map((a) => a.attrs.href), ['https://github.com/shumpmaster/Service-Desk/pull/7'], 'its link only');
    jobs.checks[HEAD].checkRuns = [{ ...ok(1, '2026-10-18T12:04:00Z'), conclusion: 'failure' }];
    await app.advance(60_000);
    await app.advance(60_000);
    const cards = byClass(lane('wait'), 'v2-card');
    assert.deepEqual(cards.map((c) => byClass(c, 'v2-t')[0].textContent), ['File a made-up question'], 'left: a card waiting on the owner');
    assert.ok(app.text().includes(`${BEING_RECORDED_WORDS}: 0`), 'no longer being recorded (frame 2\'s small line keeps its count)');
    await app.go(byClass(cards[0], 'v2-t')[0].attrs.href);
    assert.ok(byClass(app.view, 'v2-sheet')[0].textContent.includes(LEFT_WORDS), 'with the job\'s words');
  } finally {
    app.restore();
  }
});

test('AC79 with AC74\'s tap (and AC80): a notified pull request the desk still shows as being recorded shows it being recorded by the automatic job, never "That no longer waits on you"', async () => {
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
    assert.match(app.loc.hash, /^#\/waiting/);
    assert.ok(!app.text().includes('That no longer waits on you'));
    assert.equal(sbFindAll(app.view, (e) => e.tag === 'textarea').length, 0, 'no verdict box');
    // Counted at the first read, its sheet opened; judged being recorded since, the sheet says so, its link only.
    const sheet = byClass(app.view, 'v2-sheet')[0];
    assert.ok(sheet, 'its sheet, still open');
    assert.ok(sheet.textContent.includes(BEING_RECORDED_WORDS) && sheet.textContent.includes('File a made-up question'));
    assert.deepEqual(sbFindAll(sheet, (e) => e.tag === 'a' && /^https:/.test(e.attrs.href || '')).map((a) => a.attrs.href), ['https://github.com/shumpmaster/Service-Desk/pull/7']);
    // And the board: the pull request in the "Being recorded by the automatic job" line, no card.
    // Rewritten in QW2 (forced: it failed once a sheet the page opens straight at holds the first board drawn under it until it closes, AC95's "Settled from QW2's build", 3): the board under the
    // open sheet holds as first drawn under it (its card); closed, the board shows the line.
    assert.ok(!app.text().includes(`${BEING_RECORDED_WORDS}: 1`), 'the board under the open sheet holds');
    await app.go('#/waiting');
    assert.ok(app.text().includes(`${BEING_RECORDED_WORDS}: 1`));
  } finally {
    app.restore();
  }
});
