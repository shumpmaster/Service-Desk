// ac-test: S-001/AC77 — the desk's reads for a held question (drafts 7 and 8; the hold's words and
// its other ends are in notify-ac77-desk.test.mjs), on the accepted page with a fake clock and the
// fake desk function:
// - the closed read made only once every held question's raised time has arrived (a raised time a
//   cycle late delaying it, none made before), drafts ending nothing, a full first page reading a
//   second, a fourth needed failing, a failed read tried again at the next poll;
// - a recorded answer's pull request leaving the open list read by number: closed unmerged waiting,
//   merged "being recorded" with no link until the tree shows the answer, a failed read kept and
//   tried again at the next poll, and the same at a later opening from the device's record, which
//   holds the pull request's number;
// - a found end kept on the device across openings; device storage refused leaving the next opening
//   to find it again;
// - (draft 8) a tap reaching an already-open desk running the closed read before the question
//   shows, a pull request closed unmerged meanwhile showing it waiting, that read failing showing it
//   held, never "That no longer waits on you"; a return to the foreground running the read again;
//   and a held question whose history read fails: no closed read, the hold standing, a tap showing
//   it held.
// The session file and the question copy are the ac77-real fixtures (real, the copy but for its one
// added line); the pull requests are made up (NOT real).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixture, CONFIG } from './helpers.mjs';
import { repo, pr } from './fake-desk.mjs';
import { loadApp, findAll } from './page-harness.mjs';
import { loadSandbox } from './sandbox-helpers.mjs';
import { NOTIFY_FIX } from './notify-helpers.mjs';
import { OPENED_WORDS, GONE_WORDS } from '../../src/lib/notifyview.js';
import { HELD_WORDS, RECORDING_WORDS } from '../../src/lib/model.js';
import { ASKING_KEY } from '../../src/lib/scheduler.js';

const SID = 'session_012RJPVKAoLga2RkqLYRDcBY';
const SESSION_PATH = `sessions/chief-of-staff/${SID}.jsonl`;
const real = (p) => readFileSync(join(NOTIFY_FIX, 'ac77-real', p), 'utf8');
const ASKED_Q = real('asked/questions/P-001-next-work.md');
const REAL_SESSION = real(SESSION_PATH);
const RAISED = '2026-10-18T11:26:23Z';
const RAISED_MS = Date.parse(RAISED);
const MIN = 60_000;
const QPATH = 'questions/P-001-next-work.md';
const KEY = `Service-Desk|question|${QPATH}`;
const ANSWER_PATH = 'decisions/questions/P-001-next-work.md';
const ADDS_ANSWER = [{ filename: ANSWER_PATH, status: 'added' }, { filename: QPATH, status: 'removed' }];
const FILES = { [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION };

function repos(pulls = [], extra = {}) {
  const sd = repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), ...FILES }, pulls,
    [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  sd.history = { [QPATH]: [{ commit: { committer: { date: RAISED } } }] };
  Object.assign(sd, extra);
  return { 'Service-Desk': sd, 'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]) };
}
const answerPr = (n, o = {}) => ({ ...pr(n, 'Record the answer to the next work', { head: `cos/answer-${n}` }), draft: o.draft ?? false,
  head: { ref: `cos/answer-${n}`, sha: `${n}`.padStart(40, 'a'), repo: { full_name: 'shumpmaster/Service-Desk' } } });
const closedPr = (n, o = {}) => ({ ...answerPr(n, o), state: 'closed', closed_at: o.closed || '2026-10-18T11:40:00Z', merged_at: o.merged || null,
  updated_at: o.updated || o.closed || '2026-10-18T11:40:00Z' });
const merged = (from, count, at = '2026-10-18T13:00:00Z') => Array.from({ length: count }, (_, i) => closedPr(from + i, { merged: at, closed: at, updated: at }));
const text = (app) => app.els.view.textContent;
const answerLinks = (app) => findAll(app.els.view, (e) => e.tag === 'a' && /\/new\/main/.test(e.attrs.href || ''));
const closedCalls = (app) => app.calls().filter((c) => c.path === '/api/blobs' && c.body.closed);
const prsCalls = (app) => app.calls().filter((c) => c.path === '/api/blobs' && c.body.prs);
function storage({ refuse = false } = {}) {
  const backing = new Map();
  return { backing, getItem: (k) => (backing.has(k) ? backing.get(k) : null),
    setItem: (k, v) => { if (refuse) throw new Error('QuotaExceededError'); backing.set(k, v); }, removeItem: (k) => backing.delete(k) };
}
async function open(r, { now = RAISED_MS + 10 * MIN, hash = '#/p/Service-Desk/q/P-001-next-work', local, navigator, search = '' } = {}) {
  const app = await loadApp({ repos: r, now, hash, search, globals: { ...(local ? { localStorage: local } : {}), ...(navigator ? { navigator } : {}) } });
  await app.advance(1000);
  return app;
}
/**
 * From 2026-10-19 a tap opens the sandbox (the owner's ruling "A. Go live now, switch later
 * (Recommended)"): the sandbox loaded, through the same handles as `open` gives.
 */
async function openSb(r, { now = RAISED_MS + 10 * MIN, hash = '#/', navigator, search = '?sandbox' } = {}) {
  const sb = await loadSandbox({ config: CONFIG, repos: r, now, hash, search, globals: { ...(navigator ? { navigator } : {}) } });
  await sb.advance(1000);
  return { ...sb, calls: () => sb.server.calls, state: () => sb.els['screen-state'], advance: (ms) => sb.advance(ms), flush: () => sb.flush(), restore: () => sb.restore() };
}
const SB_WAITING = '#/p/Service-Desk/queue/q%3AP-001-next-work'; // the sandbox's response sheet for the question
const SB_HELD = '#/p/Service-Desk/queue'; // the Queue, where "Asked in your session" shows a held question

/** A page whose service worker can hand it a tap's address (sw.js's handover), and the replies it gave. */
function swNavigator() {
  const nav = { listeners: [], replies: [] };
  nav.serviceWorker = { addEventListener: (t, fn) => { if (t === 'message') nav.listeners.push(fn); } };
  nav.tap = (key) => {
    for (const fn of nav.listeners) fn({ data: { kind: 'desk-open', navigate: `https://desk.example.invalid/?open=${encodeURIComponent(key)}` },
      ports: [{ postMessage: (m) => nav.replies.push(m) }] });
  };
  return nav;
}

// ---------------------------------------------------------------------------
// The closed read: when it is made, its pages, drafts, and a failure

test('AC77 (draft 7): the closed read waits for every held question\'s raised time: none made before, then made with the earliest as its limit', async () => {
  let failing = true;
  const r = repos([], { historyFail: (p) => failing && p === QPATH, closedPulls: [closedPr(98, { closed: '2026-10-18T11:35:00Z' })], prFiles: { 98: ADDS_ANSWER } });
  const app = await open(r);
  try {
    assert.ok(text(app).includes(HELD_WORDS), 'held while the raised time is unread (the 8-hour fallback from first sight)');
    assert.equal(closedCalls(app).length, 0, 'none made before the raised time arrives');
    await app.advance(MIN);
    assert.equal(closedCalls(app).length, 0, 'still none');
    failing = false; // a cycle late
    await app.advance(MIN);
    assert.equal(closedCalls(app).length, 1, 'made in the cycle the raised time arrived');
    assert.deepEqual(closedCalls(app)[0].body.closed, { since: '2026-10-18T11:26:23.000Z' });
    assert.ok(!text(app).includes(HELD_WORDS));
    assert.ok(answerLinks(app).length || text(app).includes('Pick an option'), 'waiting again');
    assert.equal(app.state().textContent, '1 waiting on you');
  } finally {
    app.restore();
  }
});

test('AC77 (draft 7): a closed draft ends nothing; a full first page reads a second; a fourth needed fails and the hold stands', async () => {
  // A draft closed unmerged after the raised time, recording the answer: nothing, its files unread.
  let r = repos([], { closedPulls: [closedPr(97, { draft: true, closed: '2026-10-18T11:35:00Z' })], prFiles: { 97: ADDS_ANSWER } });
  let app = await open(r);
  try {
    assert.ok(text(app).includes(HELD_WORDS));
    assert.ok(!app.calls().some((c) => (c.body.files || []).includes(97)));
  } finally {
    app.restore();
  }
  // A full first page whose last was updated after the raised time: the second is read, and ends it.
  r = repos([], { closedPulls: [...merged(1000, 100), closedPr(98, { closed: '2026-10-18T11:35:00Z' })], prFiles: { 98: ADDS_ANSWER } });
  app = await open(r);
  try {
    assert.equal(r['Service-Desk'].closedPagesRead, 2);
    assert.ok(!text(app).includes(HELD_WORDS));
    assert.equal(app.state().textContent, '1 waiting on you');
  } finally {
    app.restore();
  }
  // Three full pages all after the raised time, more behind: a failed read, the hold standing, "Quiet" kept.
  r = repos([], { closedPulls: [...merged(1000, 350)] });
  app = await open(r);
  try {
    assert.equal(r['Service-Desk'].closedPagesRead, 3, 'never a fourth');
    assert.ok(text(app).includes(HELD_WORDS));
    assert.equal(app.state().textContent, 'Quiet');
    // Tried again at the next poll (draft 8, note B).
    await app.advance(MIN);
    assert.equal(closedCalls(app).length, 2);
  } finally {
    app.restore();
  }
});

test('AC77 (draft 8): a failed closed read is tried again at the next poll, and an answer then ends the hold; answered, it is not made again', async () => {
  const r = repos([], { closedFail: (n) => n === 1, closedPulls: [closedPr(98, { closed: '2026-10-18T11:35:00Z' })], prFiles: { 98: ADDS_ANSWER } });
  const app = await open(r);
  try {
    assert.ok(text(app).includes(HELD_WORDS), 'the first read failed: held');
    assert.equal(app.state().textContent, 'Quiet');
    await app.advance(MIN);
    assert.equal(closedCalls(app).length, 2, 'tried again at the next poll');
    assert.ok(!text(app).includes(HELD_WORDS));
    assert.equal(app.state().textContent, '1 waiting on you');
    await app.advance(3 * MIN);
    assert.equal(closedCalls(app).length, 2, 'answered: not made again at the polls that follow');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// A recorded answer's pull request leaving the open list, read by number

test('AC77 (draft 7): the recorded pull request merged keeps "being recorded" with no link until the tree shows the answer; the device keeps its number', async () => {
  const local = storage();
  const r = repos([answerPr(91)], { prFiles: { 91: ADDS_ANSWER }, prAnswers: { 91: closedPr(91, { merged: '2026-10-18T11:50:00Z', closed: '2026-10-18T11:50:00Z' }) } });
  const app = await open(r, { local });
  try {
    await app.advance(MIN);
    assert.ok(text(app).includes(RECORDING_WORDS));
    assert.deepEqual(JSON.parse(local.backing.get(ASKING_KEY))['Service-Desk'].recorded, { 'P-001-next-work': 91 }, 'the name and the pull request\'s number');
    r['Service-Desk'].pulls = []; // merged; the tree read has not caught it yet
    await app.advance(MIN);
    assert.deepEqual(prsCalls(app).map((c) => c.body.prs), [[91]]);
    assert.ok(text(app).includes(RECORDING_WORDS), 'still being recorded');
    assert.equal(answerLinks(app).length, 0, 'no stale answer link');
    assert.ok(findAll(app.els.view, (e) => e.tag === 'a' && e.attrs.href === 'https://github.com/shumpmaster/Service-Desk/pull/91').length, 'its pull request\'s link');
    await app.advance(MIN);
    assert.equal(prsCalls(app).length, 1, 'merged: not read again');
    r['Service-Desk'].commit({ [QPATH]: null, [ANSWER_PATH]: 'Ruling: A\n' });
    await app.advance(MIN);
    assert.ok(!text(app).includes(RECORDING_WORDS));
    assert.deepEqual(JSON.parse(local.backing.get(ASKING_KEY))['Service-Desk'].recorded, {}, 'pruned once the question is no longer open');
  } finally {
    app.restore();
  }
});

test('AC77 (draft 7): the single read failing keeps "being recorded" and is tried again at the next poll; then closed unmerged shows it waiting', async () => {
  const r = repos([answerPr(91)], { prFiles: { 91: ADDS_ANSWER }, prFail: [91], prAnswers: { 91: closedPr(91, { closed: '2026-10-18T11:50:00Z' }) } });
  const app = await open(r);
  try {
    await app.advance(MIN);
    r['Service-Desk'].pulls = [];
    await app.advance(MIN);
    assert.equal(prsCalls(app).length, 1);
    assert.ok(text(app).includes(RECORDING_WORDS), 'kept');
    assert.equal(answerLinks(app).length, 0);
    assert.equal(app.state().textContent, 'Quiet', 'the question not counted; "read successfully" untouched');
    await app.advance(MIN);
    assert.equal(prsCalls(app).length, 2, 'tried again at the next poll');
    r['Service-Desk'].prFail = [];
    await app.advance(MIN);
    assert.equal(prsCalls(app).length, 3);
    assert.ok(!text(app).includes(RECORDING_WORDS) && !text(app).includes(HELD_WORDS));
    assert.equal(app.state().textContent, '1 waiting on you');
  } finally {
    app.restore();
  }
});

test('AC77 (draft 7): at a later opening, the device\'s recorded pull request no longer open is read by number: closed unmerged waits, merged stays "being recorded"', async () => {
  for (const [answer, waits] of [[closedPr(91, { closed: '2026-10-18T11:50:00Z' }), true], [closedPr(91, { merged: '2026-10-18T11:50:00Z' }), false]]) {
    const local = storage();
    let app = await open(repos([answerPr(91)], { prFiles: { 91: ADDS_ANSWER } }), { local });
    try {
      await app.advance(MIN);
      assert.ok(text(app).includes(RECORDING_WORDS));
    } finally {
      app.restore();
    }
    // The pull request closed while the desk was shut; the closed read's pages don't hold it (made up).
    const r = repos([], { prAnswers: { 91: answer }, closedPulls: [] });
    app = await open(r, { local, now: RAISED_MS + 40 * MIN });
    try {
      await app.advance(MIN);
      assert.deepEqual(prsCalls(app).map((c) => c.body.prs), [[91]]);
      if (waits) {
        assert.ok(!text(app).includes(RECORDING_WORDS) && !text(app).includes(HELD_WORDS));
        assert.equal(app.state().textContent, '1 waiting on you');
        assert.deepEqual(JSON.parse(local.backing.get(ASKING_KEY))['Service-Desk'].ended, ['P-001-next-work'], 'kept as found closed unmerged');
      } else {
        assert.ok(text(app).includes(RECORDING_WORDS));
        assert.equal(answerLinks(app).length, 0);
      }
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// A found end kept on the device

test('AC77 (draft 7): a found end is kept on the device across openings, ended when it drops off the pages; storage refused, the next opening finds it again', async () => {
  const local = storage();
  let app = await open(repos([], { closedPulls: [closedPr(98, { closed: '2026-10-18T11:35:00Z' })], prFiles: { 98: ADDS_ANSWER } }), { local });
  try {
    assert.ok(!text(app).includes(HELD_WORDS));
  } finally {
    app.restore();
  }
  app = await open(repos([], { closedPulls: [] }), { local });
  try {
    assert.ok(!text(app).includes(HELD_WORDS), 'still ended, off the pages');
    assert.equal(app.state().textContent, '1 waiting on you');
  } finally {
    app.restore();
  }
  const refused = storage({ refuse: true });
  app = await open(repos([], { closedPulls: [closedPr(98, { closed: '2026-10-18T11:35:00Z' })], prFiles: { 98: ADDS_ANSWER } }), { local: refused });
  try {
    assert.ok(!text(app).includes(HELD_WORDS), 'found by the reads');
  } finally {
    app.restore();
  }
  app = await open(repos([], { closedPulls: [closedPr(98, { closed: '2026-10-18T11:35:00Z' })], prFiles: { 98: ADDS_ANSWER } }), { local: refused });
  try {
    assert.ok(!text(app).includes(HELD_WORDS), 'nothing kept, so the next opening\'s reads find it again');
    assert.equal(closedCalls(app).length, 1);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Draft 8: a tap on an open desk, and a return to the foreground

test('AC74, AC77 (draft 8): a tap reaching an already-open desk runs the closed read before the question shows; closed unmerged meanwhile, it shows waiting', async () => {
  const nav = swNavigator();
  const r = repos([], { closedPulls: [] });
  const app = await openSb(r, { navigator: nav });
  try {
    await app.advance(MIN);
    assert.equal(closedCalls(app).length, 1, 'the opening\'s read');
    // The answer's pull request opens and closes unmerged between two polls (made up).
    r['Service-Desk'].closedPulls = [closedPr(98, { closed: '2026-10-18T11:45:00Z' })];
    r['Service-Desk'].prFiles = { 98: ADDS_ANSWER };
    nav.tap(KEY);
    assert.deepEqual(nav.replies, [{ ok: true }], 'the page took the address: no reload');
    assert.equal(app.loc.hash, '#/', 'not shown before the read answers');
    assert.ok(!text(app).includes(OPENED_WORDS));
    await app.advance(1000);
    assert.equal(closedCalls(app).length, 2, 'the closed read again, for the arrival');
    assert.equal(app.loc.hash, SB_WAITING);
    assert.ok(text(app).includes(OPENED_WORDS));
    assert.ok(!text(app).includes(HELD_WORDS));
    assert.equal(app.state().textContent, '1 waiting on you', 'waiting, as the phone said');
  } finally {
    app.restore();
  }
});

test('AC74, AC77 (draft 8): that read failing, the tapped question shows held, never "That no longer waits on you"', async () => {
  const nav = swNavigator();
  const r = repos([], { closedPulls: [] });
  const app = await openSb(r, { navigator: nav });
  try {
    await app.advance(MIN);
    r['Service-Desk'].closedFail = true;
    nav.tap(KEY);
    await app.advance(1000);
    assert.equal(closedCalls(app).length, 2);
    assert.equal(app.loc.hash, SB_HELD);
    assert.ok(text(app).includes(HELD_WORDS));
    assert.ok(text(app).includes(OPENED_WORDS));
    assert.ok(!text(app).includes(GONE_WORDS));
  } finally {
    app.restore();
  }
});

test('AC77 (drafts 8 and 9): a return to the foreground runs the closed read again, riding the next poll: at once 60 seconds or more after the last poll, else at its 60-second mark', async () => {
  const r = repos([], { closedPulls: [] });
  const app = await open(r, { hash: '#/' });
  const polls = () => app.calls().filter((c) => c.path === '/api/poll' && c.body.project === 'Service-Desk');
  try {
    await app.advance(MIN);
    assert.equal(closedCalls(app).length, 1);
    const lastPoll = polls()[polls().length - 1].at;
    // Away 70 seconds: the return polls at once, and the closed read rides that poll.
    app.doc.visibilityState = 'hidden';
    app.fire('visibilitychange');
    await app.advance(70_000);
    r['Service-Desk'].closedPulls = [closedPr(98, { closed: '2026-10-18T11:45:00Z' })];
    r['Service-Desk'].prFiles = { 98: ADDS_ANSWER };
    app.doc.visibilityState = 'visible';
    app.fire('visibilitychange');
    await app.advance(1000);
    assert.ok(polls()[polls().length - 1].at > lastPoll + 60_000, 'a poll at once');
    assert.equal(closedCalls(app).length, 2, 'the closed read again, in that poll\'s cycle');
    assert.equal(app.state().textContent, '1 waiting on you');
  } finally {
    app.restore();
  }
});

test('AC77 (draft 9, Desk 5; the Reviewer\'s probe G): five returns within 25 seconds of a poll make no poll of their own; the next poll, at its 60-second mark, carries the closed read', async () => {
  const r = repos([], { closedPulls: [] });
  const app = await open(r, { hash: '#/' });
  const polls = () => app.calls().filter((c) => c.path === '/api/poll' && c.body.project === 'Service-Desk');
  try {
    await app.advance(MIN);
    const n0 = polls().length;
    const c0 = closedCalls(app).length;
    const last = polls()[n0 - 1].at;
    for (let i = 0; i < 5; i++) {
      app.doc.visibilityState = 'hidden';
      app.fire('visibilitychange');
      await app.advance(2000);
      app.doc.visibilityState = 'visible';
      app.fire('visibilitychange');
      await app.advance(3000);
    }
    assert.equal(polls().length, n0, 'no poll of their own: A2\'s one poll a minute holds');
    assert.equal(closedCalls(app).length, c0);
    await app.advance(last + 60_000 - polls()[n0 - 1].at - 25_000 + 1000);
    assert.equal(polls().length, n0 + 1, 'the poll at the 60-second mark');
    assert.equal(polls()[n0].at, last + 60_000);
    assert.equal(closedCalls(app).length, c0 + 1, 'with the closed read riding it');
  } finally {
    app.restore();
  }
});

test('AC74, AC77 (draft 8): a held question whose history read fails: no closed read, the hold standing, and a tap showing it held', async () => {
  const r = repos([], { historyFail: (p) => p === QPATH, closedPulls: [closedPr(98, { closed: '2026-10-18T11:35:00Z' })], prFiles: { 98: ADDS_ANSWER } });
  const app = await openSb(r, { hash: '', search: `?sandbox&open=${encodeURIComponent(KEY)}` });
  try {
    await app.advance(MIN);
    assert.equal(closedCalls(app).length, 0, 'no closed read');
    assert.equal(app.loc.hash, SB_HELD);
    assert.ok(text(app).includes(HELD_WORDS));
    assert.ok(text(app).includes(OPENED_WORDS));
    assert.ok(!text(app).includes(GONE_WORDS));
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Draft 9 (build review round 1, the desk's part)

test('AC74, AC77 (draft 9, Desk 5): a tap\'s closed read is a blob call of its own, made at once, with no poll before it', async () => {
  const nav = swNavigator();
  const r = repos([], { closedPulls: [] });
  const app = await openSb(r, { navigator: nav });
  try {
    await app.advance(MIN);
    const n = app.calls().length;
    r['Service-Desk'].closedPulls = [closedPr(98, { closed: '2026-10-18T11:45:00Z' })];
    r['Service-Desk'].prFiles = { 98: ADDS_ANSWER };
    nav.tap(KEY);
    await app.flush();
    const after = app.calls().slice(n);
    assert.equal(after[0].path, '/api/blobs', 'no poll first');
    assert.deepEqual({ ...after[0].body, project: undefined }, { project: undefined, blobs: [], history: [], closed: { since: '2026-10-18T11:26:23.000Z' } }, 'the closed read alone');
    assert.deepEqual(after[1].body.files, [98], 'then the found pull request\'s files');
    assert.equal(after.filter((c) => c.path === '/api/poll').length, 0);
    assert.equal(app.loc.hash, SB_WAITING);
    assert.equal(app.state().textContent, '1 waiting on you');
  } finally {
    app.restore();
  }
});

test('AC74, AC77 (draft 9, Desk 7): a tap during a closed read in flight waits for a fresh read issued after it; the earlier answer settles nothing', async () => {
  const nav = swNavigator();
  const r = repos([], { closedPulls: [], closedFail: (n) => n === 1 });
  // The second read (the retry at the next poll) is in flight when the pull request closes and the tap arrives.
  r['Service-Desk'].onClosed = (n) => {
    if (n !== 2) return;
    r['Service-Desk'].closedPulls = [closedPr(98, { closed: '2026-10-18T11:45:00Z' })];
    r['Service-Desk'].prFiles = { 98: ADDS_ANSWER };
    nav.tap(KEY);
  };
  const app = await openSb(r, { navigator: nav });
  try {
    assert.equal(closedCalls(app).length, 1, 'the opening\'s read failed');
    await app.advance(MIN);
    assert.equal(closedCalls(app).length, 3, 'the retry, and a fresh read for the tap');
    assert.equal(app.loc.hash, SB_WAITING);
    assert.ok(!text(app).includes(HELD_WORDS), 'shown from the fresh read: waiting, not held');
    assert.equal(app.state().textContent, '1 waiting on you');
  } finally {
    app.restore();
  }
});

test('AC77 (draft 9, Desk 4; the Reviewer\'s probe E): a found closed pull request whose file read fails is read again at the next poll', async () => {
  const r = repos([], { closedPulls: [closedPr(98, { closed: '2026-10-18T11:35:00Z' })], prFiles: { 98: ADDS_ANSWER }, filesFail: [98] });
  const app = await open(r);
  const reads98 = () => app.calls().filter((c) => c.path === '/api/blobs' && (c.body.files || []).includes(98)).length;
  try {
    assert.ok(text(app).includes(HELD_WORDS), 'its file read failed: the hold stands');
    const n = reads98();
    r['Service-Desk'].filesFail = [];
    await app.advance(MIN);
    assert.equal(reads98(), n + 1, 'tried again at the next poll, not after 5 minutes');
    assert.ok(!text(app).includes(HELD_WORDS));
    assert.equal(app.state().textContent, '1 waiting on you');
  } finally {
    app.restore();
  }
});

test('AC77 (draft 9, Desk 3; the Reviewer\'s probe B): a recorded pull request that has left the open list reads "PR #<n>" alone, never ": null"', async () => {
  const r = repos([answerPr(91)], { prFiles: { 91: ADDS_ANSWER }, prAnswers: { 91: closedPr(91, { merged: '2026-10-18T11:50:00Z', closed: '2026-10-18T11:50:00Z' }) } });
  const app = await open(r);
  const prLink = () => findAll(app.els.view, (e) => e.tag === 'a' && /\/pull\/91$/.test(e.attrs.href || '')).map((a) => a.textContent);
  try {
    await app.advance(MIN);
    assert.ok(prLink().some((t) => t === 'PR #91: Record the answer to the next work'), 'open: with its title');
    r['Service-Desk'].pulls = [];
    await app.advance(2 * MIN);
    assert.ok(text(app).includes(RECORDING_WORDS));
    assert.ok(prLink().includes('PR #91'), JSON.stringify(prLink()));
    assert.ok(!text(app).includes('null'));
  } finally {
    app.restore();
  }
});
