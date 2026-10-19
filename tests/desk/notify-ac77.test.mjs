// ac-test: S-001/AC77 — the sender's side (the desk's words, its answer link and its re-read are the
// brief's step 3): a question asked in a session held, still held at 54 minutes and at 7 hours 59
// minutes, ordinary at 8 hours with one push; end lines before, at and after the raised time; the
// real session file at ccf320f with the real question, unchanged and with the one added line; the
// answer's pull request opening, merging and closing unmerged; a fork's ignored; a v3 withdrawal and
// a v2.5 deletion; a line in another form or place ignored; in a v3 and a v2.5 project; and (draft
// 7) the closed read's drafts, its pages and their timing, and a found end kept in J18.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { askedInSession, questionHold, endedAfter } from '../../src/lib/asking.js';
import { parseSessionFile } from '../../src/lib/cos.js';
import { FIX } from './helpers.mjs';
import { NOTIFY_FIX, REPO, MIN, HOUR, checkoutOf, filesUnder, harness, clock, pull, cleanScratch } from './notify-helpers.mjs';
import { readRecorded } from '../../src/notify/state.mjs';

after(cleanScratch);

const SID = 'session_012RJPVKAoLga2RkqLYRDcBY';
const SESSION_PATH = `sessions/chief-of-staff/${SID}.jsonl`;
const realQuestion = readFileSync(join(NOTIFY_FIX, 'ac77-real/questions/P-001-next-work.md'), 'utf8');
const askedQuestion = readFileSync(join(NOTIFY_FIX, 'ac77-real/asked/questions/P-001-next-work.md'), 'utf8');
const realSession = readFileSync(join(NOTIFY_FIX, `ac77-real/${SESSION_PATH}`), 'utf8');
const RAISED = '2026-10-18T11:26:23+00:00'; // ccf320f's commit time
const RAISED_MS = Date.parse(RAISED);
const base = { 'questions/_TEMPLATE.md': '# Ruling needed: <title>\n' };
const v3q = (line) => `# Ruling needed: A made-up question\n\nMilestone: none (made up)\n${line}\nWHY: made up\n`;
const start = (t) => `{"event": "start", "session": "s-x", "time": "${t}", "doing": "made-up work"}`;
const end = (t) => `{"event": "end", "session": "s-x", "time": "${t}", "usage": null}`;

test('AC77: the line is read only in its model\'s place and form', () => {
  assert.equal(askedInSession(askedQuestion, 'v3'), SID);
  assert.equal(askedInSession(realQuestion, 'v3'), null);
  assert.equal(askedInSession(v3q('Asked in session: s-x'), 'v3'), 's-x');
  for (const bad of ['Asked in session: s x', ' Asked in session: s-x', 'Asked in session:s-x', 'Asked in session: s-x ', 'asked in session: s-x',
    `Asked in session: ${'x'.repeat(101)}`]) {
    assert.equal(askedInSession(v3q(bad), 'v3'), null, bad);
  }
  // Not directly after the Milestone line: ignored.
  assert.equal(askedInSession('# Ruling needed: x\n\nMilestone: M1\n\nAsked in session: s-x\n', 'v3'), null);
  assert.equal(askedInSession('# Ruling needed: x\n\nAsked in session: s-x\n', 'v3'), null, 'no Milestone line in v3');
  // v2.5: the first line after `# Ruling needed:` that is not blank.
  assert.equal(askedInSession('# Ruling needed: x\n\n\nAsked in session: s-x\nWHY: y\n', 'v2.5'), 's-x');
  assert.equal(askedInSession('# Ruling needed: x\n\nWHY: y\nAsked in session: s-x\n', 'v2.5'), null);
  assert.equal(askedInSession('# Ruling needed: x\r\n\r\nAsked in session: s-x\r\n', 'v2.5'), 's-x');
});

test('AC77: the hold ends only at an end line after the raised time, or 8 hours on', () => {
  const raised = Date.parse('2026-10-18T11:00:00Z');
  const file = (...lines) => parseSessionFile(`${lines.join('\n')}\n`, 'sessions/chief-of-staff/s-x.jsonl');
  const hold = (f, nowMs) => questionHold({ model: 'v3', text: v3q('Asked in session: s-x'), raisedMs: raised, nowMs, sessionFile: f }).state;
  const at = (m) => raised + m * MIN;
  assert.equal(hold(null, at(54)), 'held');
  assert.equal(hold(null, at(8 * 60 - 1)), 'held');
  assert.equal(hold(null, at(8 * 60)), 'open');
  assert.equal(hold(file(start('2026-10-18T10:00:00Z'), end('2026-10-18T10:59:59Z')), at(10)), 'held', 'an earlier piece\'s end line');
  assert.equal(hold(file(start('2026-10-18T11:05:00Z')), at(10)), 'held', 'a start line after the raised time');
  assert.equal(hold(file(start('2026-10-18T10:00:00Z'), end('2026-10-18T11:00:00Z')), at(10)), 'held', 'an end line at exactly the raised time');
  assert.equal(hold(file(start('2026-10-18T10:00:00Z'), end('2026-10-18T11:00:00.000001Z')), at(10)), 'open', 'a microsecond after');
  assert.equal(hold(file(start('2026-10-18T10:00:00Z'), end('2026-10-18T11:20:00Z')), at(30)), 'open');
  // A line out of form ends nothing.
  assert.equal(hold(file('{"event": "end", "session": "s-x", "time": "2026-10-18T11:20:00Z"}'), at(30)), 'held');
  // The raised time unread (the page only): no end line ends it; the 8 hours run from first sight.
  assert.equal(questionHold({ model: 'v3', text: v3q('Asked in session: s-x'), raisedMs: null, seenMs: at(0), nowMs: at(30),
    sessionFile: file(end('2026-10-18T11:20:00Z')) }).state, 'held');
  // v2.5: sessions are not recorded there; only the 8 hours end it.
  assert.equal(questionHold({ model: 'v2.5', text: '# Ruling needed: x\n\nAsked in session: s-x\n', raisedMs: raised, nowMs: at(30),
    sessionFile: file(end('2026-10-18T11:20:00Z')) }).state, 'held');
  assert.equal(endedAfter(null, raised), false);
  assert.equal(questionHold({ model: 'v3', text: v3q(''), raisedMs: raised, nowMs: at(1), recording: true }).state, 'recording');
});

/** A harness on a fake clock from `startMs`, its bootstrap done on records with no question in them. */
async function startedAt(startMs, project = 'Service-Desk', baseFiles = base) {
  const h = harness({ checkout: checkoutOf({ base: baseFiles }), clock: clock(startMs), project });
  const r = await h.run({ after: 1 * MIN });
  assert.equal(r.pushes.length, 1);
  return h;
}

test('AC77: the real session file at ccf320f, with the real question: the copy with the line held and no push; the unchanged one ordinary, one push', async () => {
  // (i) the copy that adds the one line: held; the 03:08:21Z end line ends nothing.
  const h = await startedAt(RAISED_MS - 2 * MIN);
  h.checkout = checkoutOf({ base: { ...base, [SESSION_PATH]: realSession }, later: [{ files: { 'questions/P-001-next-work.md': askedQuestion }, date: RAISED }] });
  h.clock.t = RAISED_MS + 54 * MIN;
  const r = await h.run();
  assert.equal(r.pushes.length, 0, 'held at 54 minutes');
  assert.ok(r.logs.some((l) => /1 held in a session/.test(l)));
  // 7 hours 59 minutes after the raised time: still held. Then 8 hours: ordinary, one push.
  h.clock.t = RAISED_MS + 8 * HOUR - 1 * MIN;
  assert.equal((await h.run({ after: 1 * MIN })).pushes.length, 0, 'held at 7 hours 59 minutes');
  const r8 = await h.run();
  assert.equal(r8.pushes.length, 1, 'ordinary at 8 hours');
  assert.equal(r8.payloads[0].notification.body, 'Waits on you: a question: Which piece of later work comes next?');
  assert.equal((await h.run()).pushes.length, 0, 'once');
  // (ii) the real question unchanged: ordinary, one push.
  const g = await startedAt(RAISED_MS - 2 * MIN);
  g.checkout = checkoutOf({ base: { ...base, [SESSION_PATH]: realSession }, later: [{ files: { 'questions/P-001-next-work.md': realQuestion }, date: RAISED }] });
  const rg = await g.run();
  assert.equal(rg.pushes.length, 1);
  assert.equal(rg.payloads[0].notification.navigate, `https://desk.example.invalid/?sandbox&open=${encodeURIComponent('Service-Desk|question|questions/P-001-next-work.md')}`);
});

test('AC77: an end line after the raised time, landing later, ends the hold with one push', async () => {
  const h = await startedAt(RAISED_MS - 2 * MIN);
  const files0 = { ...base, [SESSION_PATH]: realSession };
  const q = { 'questions/P-001-next-work.md': askedQuestion };
  h.checkout = checkoutOf({ base: files0, later: [{ files: q, date: RAISED }] });
  assert.equal((await h.run()).pushes.length, 0);
  const ended = `${realSession}{"event": "end", "session": "${SID}", "time": "2026-10-18T12:10:00Z", "usage": null}\n`;
  h.checkout = checkoutOf({ base: files0, later: [{ files: q, date: RAISED }, { files: { [SESSION_PATH]: ended }, date: '2026-10-18T12:10:30+00:00' }] });
  const r = await h.run();
  assert.equal(r.pushes.length, 1);
  assert.equal(r.payloads[0].notification.body, 'Waits on you: a question: Which piece of later work comes next?');
});

test('AC77: the answer\'s pull request: opening holds it as "being recorded" (no push); merging ends it; closing unmerged opens it again, one push', async () => {
  const h = await startedAt(RAISED_MS - 2 * MIN);
  const files0 = { ...base, [SESSION_PATH]: realSession };
  h.checkout = checkoutOf({ base: files0, later: [{ files: { 'questions/P-001-next-work.md': askedQuestion }, date: RAISED }] });
  assert.equal((await h.run()).pushes.length, 0);
  // The answer's pull request opens: being recorded, though the 8 hours pass.
  h.world.pulls = [pull(90, { title: 'Your answer on the next work' })];
  h.world.files[90] = [{ filename: 'decisions/questions/P-001-next-work.md', status: 'added' }, { filename: 'questions/P-001-next-work.md', status: 'removed' }];
  // No grant in these records, so the answer's pull request itself waits as any pull request (AC77: it still shows in Merges).
  const r = await h.run();
  assert.ok(r.logs.some((l) => /1 being recorded/.test(l)));
  assert.deepEqual(r.payloads.map((p) => p.notification.body), ['Waits on you: a pull request to merge: Your answer on the next work']);
  assert.equal((await h.run()).pushes.length, 0, 'still being recorded');
  // It closes unmerged, well inside the 8 hours and with no end line: the hold ended when it opened,
  // so the question waits from that moment, one push. The sender reads it by number (draft 9).
  h.world.pulls = [];
  h.world.prs = { 90: { ...pull(90), state: 'closed', closed_at: '2026-10-18T12:20:00Z', merged_at: null } };
  const rc = await h.run();
  assert.equal(rc.ghCalls.filter((c) => c.path === `/repos/${REPO}/pulls/90`).length, 1, 'read by number, not inferred');
  assert.deepEqual(rc.payloads.map((p) => p.notification.body), ['Waits on you: a question: Which piece of later work comes next?']);
  assert.equal((await h.run()).pushes.length, 0, 'once');
  // Being recorded outlasts the 8 hours.
  const k = await startedAt(RAISED_MS - 2 * MIN);
  k.checkout = checkoutOf({ base: files0, later: [{ files: { 'questions/P-001-next-work.md': askedQuestion }, date: RAISED }] });
  k.world.pulls = [pull(95)];
  k.world.files[95] = [{ filename: 'decisions/questions/P-001-next-work.md', status: 'added' }];
  await k.run();
  k.clock.t = RAISED_MS + 9 * HOUR;
  const rk = await k.run();
  assert.ok(!rk.payloads.some((p) => /a question/.test(p.notification.body)), 'still being recorded after 8 hours');
  // Merged instead: the question is answered and gone, nothing sent.
  const g = await startedAt(RAISED_MS - 2 * MIN);
  g.checkout = checkoutOf({ base: files0, later: [{ files: { 'questions/P-001-next-work.md': askedQuestion }, date: RAISED }] });
  g.world.pulls = [pull(91)];
  g.world.files[91] = [{ filename: 'decisions/questions/P-001-next-work.md', status: 'added' }];
  await g.run();
  g.world.pulls = [];
  g.checkout = checkoutOf({ base: files0, later: [{ files: { 'questions/P-001-next-work.md': askedQuestion }, date: RAISED },
    { files: { 'decisions/questions/P-001-next-work.md': 'Ruling: A\n' }, date: '2026-10-18T12:30:00+00:00' }] });
  assert.equal((await g.run()).pushes.length, 0);
});

test('AC77: a fork\'s pull request adding the answer is ignored; a v3 withdrawal is not "being recorded"', async () => {
  for (const [files, headRepo, label] of [
    [[{ filename: 'decisions/questions/N-open.md', status: 'added' }], 'someone/Service-Desk', 'a fork'],
    [[{ filename: 'questions/N-open.md', status: 'removed' }], undefined, 'a withdrawal in v3'],
    [[{ filename: 'decisions/questions/N-open-notes.md', status: 'added' }], undefined, 'a notes file']]) {
    const h = await startedAt(Date.parse('2026-10-18T12:00:00Z'));
    h.world.pulls = [pull(92, { headRepo, association: headRepo ? 'NONE' : 'OWNER' })];
    h.world.files[92] = files;
    h.checkout = checkoutOf({ base, later: [{ files: { 'questions/N-open.md': v3q('') }, date: '2026-10-18T12:00:30+00:00' }] });
    const r = await h.run();
    assert.ok(r.payloads.some((p) => p.notification.body === 'Waits on you: a question: A made-up question'), label);
  }
  // A draft adding the answer is not "being recorded" either.
  const h = await startedAt(Date.parse('2026-10-18T12:00:00Z'));
  h.world.pulls = [pull(93, { draft: true })];
  h.world.files[93] = [{ filename: 'decisions/questions/N-open.md', status: 'added' }];
  h.checkout = checkoutOf({ base, later: [{ files: { 'questions/N-open.md': v3q('') }, date: '2026-10-18T12:00:30+00:00' }] });
  assert.equal((await h.run()).pushes.length, 1);
});

test('AC77: in a v2.5 project (poom/\'s placeholder form): the line held; a deletion reads as being recorded', async () => {
  const poom = filesUnder(join(FIX, 'poom'));
  const v25 = filesUnder(join(NOTIFY_FIX, 'poom-made-up'));
  const fetchFor = (h) => {
    const f = h.world.fetch;
    h.world.fetch = (url, init) => f(String(url).replace('/repos/shumpmaster/Personal-Org-Operating-Model/', '/repos/shumpmaster/Service-Desk/'), init);
  };
  const h = harness({ checkout: checkoutOf({ base: poom }), clock: clock(Date.parse('2026-10-18T11:20:00Z')), project: 'Personal-Org-Operating-Model' });
  fetchFor(h);
  await h.run({ after: 1 * MIN });
  h.world.pulls = [pull(94, { headRepo: 'shumpmaster/Personal-Org-Operating-Model' })];
  h.world.files[94] = [{ filename: 'questions/N-v25-recorded.md', status: 'removed' }];
  h.checkout = checkoutOf({ base: poom, later: [{ files: v25, date: '2026-10-18T11:30:00+00:00' }] });
  const r = await h.run();
  assert.deepEqual(r.payloads.map((p) => p.notification.body).sort(), ['Waits on you: a pull request to merge: A made-up pull request #94',
    'Waits on you: a question: A made-up v2.5 question']);
  assert.ok(r.logs.some((l) => /1 held in a session, 1 being recorded, 0 the automatic job/.test(l)));
  // 8 hours on, the v2.5 hold ends: one push.
  h.clock.t = Date.parse('2026-10-18T19:30:00Z');
  const r2 = await h.run();
  assert.deepEqual(r2.payloads.map((p) => p.notification.body), ['Waits on you: a question: A made-up v2.5 question being asked in a session']);
});

// The Orchestrator's ruling (draft 6): for a project with a question still held, the sender reads one
// page of its closed pull requests each run; an answer's pull request closed unmerged after the raised
// time ends the hold, and the question waits again and notifies; a failed read keeps the hold and is a
// failed read under AC76 (the project "not read").
const closedPull = (n, o = {}) => ({ ...pull(n, o), state: 'closed', closed_at: o.closed ?? '2026-10-18T11:40:00Z', merged_at: o.merged ?? null });

test('AC77 (draft 6): an answer\'s pull request opened and closed unmerged between two runs ends the hold, one push; the closed read only while a question is held', async () => {
  const h = await startedAt(RAISED_MS - 2 * MIN);
  const files0 = { ...base, [SESSION_PATH]: realSession };
  assert.ok(!h.runs[0].ghCalls.some((c) => /state=closed/.test(c.path)), 'no held question: no closed read');
  h.checkout = checkoutOf({ base: files0, later: [{ files: { 'questions/P-001-next-work.md': askedQuestion }, date: RAISED }] });
  let r = await h.run();
  assert.equal(r.pushes.length, 0);
  assert.equal(r.ghCalls.filter((c) => c.path === `/repos/${REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=100`).length, 1, 'one page, each run');
  // Closed before the raised time, merged, from a fork, or into another branch: none ends it.
  h.world.closed = [closedPull(80, { closed: '2026-10-18T11:00:00Z' }), closedPull(81, { merged: '2026-10-18T11:40:00Z' }),
    closedPull(82, { headRepo: 'someone/Service-Desk' }), closedPull(83, { base: 'dev' })];
  for (const n of [80, 81, 82, 83]) h.world.files[n] = [{ filename: 'decisions/questions/P-001-next-work.md', status: 'added' }];
  r = await h.run();
  assert.equal(r.pushes.length, 0, 'still held');
  assert.ok(!r.ghCalls.some((c) => /pulls\/(80|81|82|83)\/files/.test(c.path)), 'their files are not read');
  // An own-branch one, closed unmerged after the raised time, that records the answer: the hold ends.
  h.world.closed.push(closedPull(84, { closed: '2026-10-18T12:30:00Z' }));
  h.world.files[84] = [{ filename: 'decisions/questions/P-001-next-work.md', status: 'added' }];
  r = await h.run();
  assert.deepEqual(r.payloads.map((p) => p.notification.body), ['Waits on you: a question: Which piece of later work comes next?']);
  r = await h.run();
  assert.equal(r.pushes.length, 0, 'once');
  assert.ok(!r.ghCalls.some((c) => /state=closed/.test(c.path)), 'no question held now: no closed read');
});

test('AC77 (draft 6): a closed pull request that only withdraws the question (v3) ends nothing; a failed closed read keeps the hold and the project is not read', async () => {
  const h = await startedAt(RAISED_MS - 2 * MIN);
  const files0 = { ...base, [SESSION_PATH]: realSession };
  h.checkout = checkoutOf({ base: files0, later: [{ files: { 'questions/P-001-next-work.md': askedQuestion }, date: RAISED }] });
  await h.run();
  h.world.closed = [closedPull(85, { closed: '2026-10-18T12:30:00Z' })];
  h.world.files[85] = [{ filename: 'questions/P-001-next-work.md', status: 'removed' }];
  let r = await h.run();
  assert.equal(r.pushes.length, 0, 'a withdrawal is not an answer in v3');
  h.world.fail[`/repos/${REPO}/pulls?state=closed`] = 502;
  h.world.closed.push(closedPull(86, { closed: '2026-10-18T12:40:00Z' }));
  h.world.files[86] = [{ filename: 'decisions/questions/P-001-next-work.md', status: 'added' }];
  r = await h.run();
  assert.equal(r.pushes.length, 0, 'the hold kept');
  assert.ok(r.logs.some((l) => /not read/.test(l)), r.logs.join('\n'));
  assert.equal(h.state(r).project.read, false);
  delete h.world.fail[`/repos/${REPO}/pulls?state=closed`];
  r = await h.run();
  assert.deepEqual(r.payloads.map((p) => p.notification.body), ['Waits on you: a question: Which piece of later work comes next?']);
});

// Draft 7 (Critic round 5, notes 5 and 6): a closed draft ends nothing; the next page is read only
// while a full page's last pull request was updated after the earliest raised time, up to 3 pages,
// a fourth needed a failed read; a found end is kept in J18, so the next run needs no find.
const CLOSED = `/repos/${REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=100`;
const ANSWER_FILE = [{ filename: 'decisions/questions/P-001-next-work.md', status: 'added' }];
/** Made-up merged pull requests (they end nothing and their files are never read), updated at `at`. */
const fillers = (from, count, at) => Array.from({ length: count }, (_, i) => closedPull(from + i, { merged: at, closed: at, updated: at }));
async function heldRun() {
  const h = await startedAt(RAISED_MS - 2 * MIN);
  h.checkout = checkoutOf({ base: { ...base, [SESSION_PATH]: realSession }, later: [{ files: { 'questions/P-001-next-work.md': askedQuestion }, date: RAISED }] });
  const r = await h.run();
  assert.equal(r.pushes.length, 0, 'held');
  return h;
}
const closedPages = (r) => r.ghCalls.filter((c) => c.path.startsWith(CLOSED)).map((c) => c.path.slice(CLOSED.length) || '&page=1');

test('AC77 (draft 7): a closed draft that records the answer ends nothing, and its files are not read', async () => {
  const h = await heldRun();
  h.world.closed = [closedPull(87, { draft: true, closed: '2026-10-18T12:30:00Z', updated: '2026-10-18T12:30:00Z' })];
  h.world.files[87] = ANSWER_FILE;
  const r = await h.run();
  assert.equal(r.pushes.length, 0, 'still held');
  assert.ok(r.logs.some((l) => /1 held in a session/.test(l)));
  assert.ok(!r.ghCalls.some((c) => /pulls\/87\/files/.test(c.path)));
});

test('AC77 (draft 7): a full first page whose last was updated after the raised time reads a second, which finds the end; the end kept in J18, so the next run needs no find', async () => {
  const h = await heldRun();
  h.world.closed = [...fillers(1000, 100, '2026-10-18T13:00:00Z'), closedPull(88, { closed: '2026-10-18T12:30:00Z', updated: '2026-10-18T12:30:00Z' })];
  h.world.files[88] = ANSWER_FILE;
  let r = await h.run();
  assert.deepEqual(closedPages(r), ['&page=1', '&page=2']);
  assert.deepEqual(r.payloads.map((p) => p.notification.body), ['Waits on you: a question: Which piece of later work comes next?']);
  assert.equal(Object.keys(h.state(r).recorded).length, 1, 'the found end, kept by keyed hash');
  // The pull request drops off the pages: the end stands, with no find and no second push.
  h.world.closed = [];
  r = await h.run();
  assert.equal(r.pushes.length, 0);
  assert.deepEqual(closedPages(r), [], 'no question held now: no closed read');
  assert.equal(Object.keys(h.state(r).recorded).length, 1);
});

test('AC77 (draft 7): a full page whose last was updated at or before the raised time ends the read there', async () => {
  const h = await heldRun();
  h.world.closed = [...fillers(1000, 99, '2026-10-18T13:00:00Z'), ...fillers(1099, 1, RAISED), ...fillers(1100, 50, '2026-10-18T10:00:00Z')];
  const r = await h.run();
  assert.deepEqual(closedPages(r), ['&page=1'], 'the second page is older than the raised time: not read');
  assert.equal(h.state(r).project.read, true);
});

test('AC77 (draft 7): a fourth page needed is a failed read: the hold kept, the project "not read", three pages and never a fourth', async () => {
  const h = await heldRun();
  h.world.closed = fillers(1000, 350, '2026-10-18T13:00:00Z');
  const r = await h.run();
  assert.deepEqual(closedPages(r), ['&page=1', '&page=2', '&page=3']);
  assert.equal(r.pushes.length, 0);
  assert.ok(r.logs.some((l) => /not read \(closed pull requests \(over 3 pages\)\)/.test(l)), r.logs.join('\n'));
  assert.equal(h.state(r).project.read, false);
});

// Draft 9 (build review round 1, Sec 1, the Reviewer's race.mjs): an answer's pull request that merges
// after the run's checkout and before its open-pulls read. The question is still in the checkout with
// no answer, and no open pull request records it; the sender reads that pull request by number rather
// than inferring "closed unmerged": merged, the question is answered and not notified; closed unmerged,
// it waits again; a failed read makes the project "not read".
const RACE_Q = (asked) => `# Ruling needed: A made-up question\n\nMilestone: none (made up)\n${asked ? 'Asked in session: s-x\n' : ''}WHY: made up\n`;
const RACE_FILES = [{ filename: 'decisions/questions/P-900-x.md', status: 'added' }, { filename: 'questions/P-900-x.md', status: 'removed' }];
async function raceSetUp(asked) {
  const h = harness({ checkout: checkoutOf({ base }), clock: clock(Date.parse('2026-10-18T12:00:00Z')) });
  await h.run({ after: MIN });
  h.checkout = checkoutOf({ base, later: [{ files: { 'questions/P-900-x.md': RACE_Q(asked) }, date: '2026-10-18T12:00:30+00:00' }] });
  const r1 = await h.run();
  assert.equal(r1.pushes.length, asked ? 0 : 1, 'filed: held, or one push');
  h.world.pulls = [pull(5, { head: 'cos/answer', title: 'Record the answer' })];
  h.world.files = { 5: RACE_FILES };
  const r2 = await h.run();
  assert.ok(r2.logs.some((l) => /1 being recorded/.test(l)));
  h.world.pulls = []; // it merges after the next run's checkout: the checkout is unchanged
  return h;
}

test('AC77 (draft 9): an answer\'s pull request merged between the checkout and the open-pulls read: read by number, not notified', async () => {
  for (const asked of [false, true]) {
    const h = await raceSetUp(asked);
    h.world.prs = { 5: { ...pull(5), state: 'closed', merged_at: '2026-10-18T12:20:00Z', closed_at: '2026-10-18T12:20:00Z' } };
    const r3 = await h.run();
    assert.equal(r3.pushes.length, 0, `asked=${asked}: an answered question is never notified`);
    assert.equal(r3.ghCalls.filter((c) => c.path === `/repos/${REPO}/pulls/5`).length, 1);
    assert.ok(r3.logs.some((l) => /1 being recorded/.test(l)), r3.logs.join('\n'));
    // The next run's checkout holds the answer: nothing sent, the entry dropped, no read by number.
    h.checkout = checkoutOf({ base, later: [{ files: { 'questions/P-900-x.md': RACE_Q(asked) }, date: '2026-10-18T12:00:30+00:00' },
      { files: { 'questions/P-900-x.md': null, 'decisions/questions/P-900-x.md': 'Ruling: A\n' }, date: '2026-10-18T12:20:00+00:00' }] });
    const r4 = await h.run();
    assert.equal(r4.pushes.length, 0);
    assert.ok(!r4.ghCalls.some((c) => c.path === `/repos/${REPO}/pulls/5`));
    assert.deepEqual(h.state(r4).recorded, {});
  }
});

test('AC77 (draft 9): closed unmerged instead, it waits again with one push; the read failing makes the project "not read"', async () => {
  let h = await raceSetUp(true);
  h.world.prs = { 5: { ...pull(5), state: 'closed', merged_at: null, closed_at: '2026-10-18T12:20:00Z' } };
  let r = await h.run();
  assert.deepEqual(r.payloads.map((p) => p.notification.body), ['Waits on you: a question: A made-up question']);
  r = await h.run();
  assert.equal(r.pushes.length, 0, 'once');
  assert.ok(!r.ghCalls.some((c) => c.path === `/repos/${REPO}/pulls/5`), 'the end kept: no read again');
  h = await raceSetUp(true);
  h.world.fail[`/repos/${REPO}/pulls/5`] = 502;
  r = await h.run();
  assert.equal(r.pushes.length, 0);
  assert.ok(r.logs.some((l) => /not read \(a recorded pull request\)/.test(l)), r.logs.join('\n'));
  assert.equal(h.state(r).project.read, false);
});

test('J18 (draft 9): the recorded pull request\'s number is kept sealed: not in the state in clear, readable only with the state key', async () => {
  const h = await raceSetUp(false);
  const s = h.state(h.runs[h.runs.length - 1]);
  const [[qh, v]] = Object.entries(s.recorded);
  // In clear: the keyed hash and when it was first seen; the number sealed, as the JWT is.
  assert.match(qh, /^[0-9a-f]{32}$/);
  assert.deepEqual(Object.keys(v).sort(), ['pr', 'seen']);
  assert.match(v.seen, /^\d{4}-\d\d-\d\dT[0-9:.]+Z$/);
  assert.equal(typeof v.pr, 'string');
  assert.ok(!JSON.stringify(v).includes('"n"'), 'nothing of the number in clear');
  assert.deepEqual(readRecorded(h.stateKey, v), { seen: v.seen, number: 5 });
  assert.equal(readRecorded('another key, 32 characters or more, made up', v).number, null, 'unreadable without the state key');
});
