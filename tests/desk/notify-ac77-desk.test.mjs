// ac-test: S-001/AC77 — the desk's side (the sender's side is notify-ac77.test.mjs), on the accepted
// page and in the sandbox, with a fake clock and the fake desk function: a question asked in a
// session held ("Being asked in your session: answer there", no answer link, not counted), still
// held at 54 minutes and 7 hours 59 minutes, ordinary at 8 hours; end lines before, at and after the
// raised time; the real session file at ccf320f with the real question, unchanged and with the one
// added line; the answer's pull request opening ("Your answer is being recorded", no link), merging
// and closing unmerged; a fork's ignored; a v3 withdrawal and a v2.5 deletion; "Answer it here
// instead" on the device only; a line in another form or place ignored; the answer record's pull
// request still in Merges, counted, with its added words; the re-read at 31 seconds giving each of
// its four outcomes, and none at 29; and (draft 6) the closed read once an opening.
// Made-up records are labelled NOT real in tests/desk/fixtures/README.md; the ac77-real files are
// real, the `asked/` copy real but for its one added line.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixture, CONFIG } from './helpers.mjs';
import { repo, pr } from './fake-desk.mjs';
import { loadApp, findAll } from './page-harness.mjs';
import { loadSandbox, byClass, findAll as sbFindAll } from './sandbox-helpers.mjs';
import { NOTIFY_FIX } from './notify-helpers.mjs';
import { RECHECK_WORDS } from '../../src/lib/notifyview.js';
import { HELD_WORDS, RECORDING_WORDS } from '../../src/lib/model.js';

const SID = 'session_012RJPVKAoLga2RkqLYRDcBY';
const SESSION_PATH = `sessions/chief-of-staff/${SID}.jsonl`;
const real = (p) => readFileSync(join(NOTIFY_FIX, 'ac77-real', p), 'utf8');
const REAL_Q = real('questions/P-001-next-work.md');
const ASKED_Q = real('asked/questions/P-001-next-work.md');
const REAL_SESSION = real(SESSION_PATH);
const RAISED = '2026-10-18T11:26:23Z';
const RAISED_MS = Date.parse(RAISED);
const MIN = 60_000;
const QPATH = 'questions/P-001-next-work.md';
const v3q = (line) => `# Ruling needed: A made-up question\n\nMilestone: none (made up)\n${line}\nWHY: made up\nOPTIONS:\n  A. Yes — made up.\n  B. No — made up.\nRECOMMENDATION: A\n`;
const hist = (date) => [{ commit: { committer: { date } } }];

/** Service-Desk with the given files and pull requests; the operating-model project quiet. */
function repos(files, pulls = [], extra = {}) {
  const sd = repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), ...files }, pulls,
    [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  sd.history = { [QPATH]: hist(RAISED), 'questions/N-x.md': hist(RAISED), ...(extra.history || {}) };
  Object.assign(sd, extra.repo || {});
  return { 'Service-Desk': sd, 'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]) };
}

const projectText = (app) => app.els.view.textContent;
const answerLinks = (app) => findAll(app.els.view, (e) => e.tag === 'a' && /\/new\/main/.test(e.attrs.href || '') || (e.tag === 'a' && /Open GitHub to commit/.test(e.textContent)));
async function open(files, { now = RAISED_MS + 10 * MIN, pulls = [], hash = '#/p/Service-Desk/q/P-001-next-work', extra = {}, globals = {}, win = {} } = {}) {
  const app = await loadApp({ repos: repos(files, pulls, extra), now, hash, globals, win });
  await app.advance(1000);
  return app;
}
/** Pick option A in the accepted view's answer box, so its link shows. */
function pick(app) {
  const radio = findAll(app.els.view, (e) => e.tag === 'input' && e.attrs.value === 'A')[0];
  for (const fn of radio.listeners.change || []) fn({});
  return findAll(app.els.view, (e) => e.tag === 'a' && e.className === 'go')[0];
}

test('AC77: a question with the line is held: "Being asked in your session: answer there", its title and options to read, no answer link, not counted', async () => {
  const app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, { now: RAISED_MS + 54 * MIN });
  try {
    const v = projectText(app);
    assert.ok(v.includes(HELD_WORDS));
    assert.equal(HELD_WORDS, 'Being asked in your session: answer there');
    assert.ok(v.includes('Which piece of later work comes next?'));
    assert.ok(v.includes('A. Plan M3A around milestones'), 'its options, to read');
    assert.equal(findAll(app.els.view, (e) => e.tag === 'input').length, 0, 'no answer box');
    assert.equal(answerLinks(app).length, 0, 'no answer link');
    assert.ok(!v.includes('Open the question on GitHub'), 'no "Open in GitHub" to answer');
    assert.equal(app.state().textContent, 'Quiet', 'not counted: the 03:08:21Z end line, before the raised time, ends nothing');
    app.loc.hash = '#/p/Service-Desk';
    await app.advance(60_000);
    const p = projectText(app);
    assert.match(p, /Waiting on you\s*Nothing waiting on you here\./);
    assert.ok(p.includes('Asked in your session'));
  } finally {
    app.restore();
  }
});

test('AC77: still held at 7 hours 59 minutes; ordinary at 8 hours, with its answer link and counted', async () => {
  let app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, { now: RAISED_MS + 8 * 60 * MIN - MIN });
  try {
    assert.ok(projectText(app).includes(HELD_WORDS));
  } finally {
    app.restore();
  }
  app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, { now: RAISED_MS + 8 * 60 * MIN });
  try {
    assert.ok(!projectText(app).includes(HELD_WORDS));
    assert.ok(pick(app), 'the answer link');
    assert.equal(app.state().textContent, '1 waiting on you');
  } finally {
    app.restore();
  }
});

test('AC77: the real question unchanged (no line) is an ordinary waiting question, with its answer link', async () => {
  const app = await open({ [QPATH]: REAL_Q, [SESSION_PATH]: REAL_SESSION });
  try {
    assert.ok(!projectText(app).includes(HELD_WORDS));
    assert.ok(pick(app));
    assert.equal(app.state().textContent, '1 waiting on you');
  } finally {
    app.restore();
  }
});

test('AC77: end lines in the session file: one before the raised time, a start after it and one at exactly it end nothing; one after it ends the hold', async () => {
  const start = (t) => `{"event": "start", "session": "s-x", "time": "${t}", "doing": "made up"}`;
  const end = (t) => `{"event": "end", "session": "s-x", "time": "${t}", "usage": null}`;
  const sp = 'sessions/chief-of-staff/s-x.jsonl';
  const cases = [
    [[start('2026-10-18T10:00:00Z'), end('2026-10-18T11:00:00Z')], true, 'an earlier piece\'s end line'],
    [[start('2026-10-18T11:30:00Z')], true, 'a start line after the raised time'],
    [[start('2026-10-18T11:00:00Z'), end(RAISED)], true, 'an end line at exactly the raised time'],
    [[start('2026-10-18T11:00:00Z'), end('2026-10-18T11:40:00Z')], false, 'an end line after the raised time'],
  ];
  for (const [lines, held, label] of cases) {
    const app = await open({ 'questions/N-x.md': v3q('Asked in session: s-x'), [sp]: `${lines.join('\n')}\n` }, { hash: '#/p/Service-Desk/q/N-x' });
    try {
      assert.equal(projectText(app).includes(HELD_WORDS), held, label);
      assert.equal(app.state().textContent, held ? 'Quiet' : '1 waiting on you', label);
    } finally {
      app.restore();
    }
  }
});

test('AC77: a line in another form or place is ignored: the question is ordinary', async () => {
  for (const q of [v3q('Asked in session:s-x'), v3q(' Asked in session: s-x'), '# Ruling needed: x\n\nMilestone: M1\n\nAsked in session: s-x\nOPTIONS:\n  A. a\n']) {
    const app = await open({ 'questions/N-x.md': q }, { hash: '#/p/Service-Desk/q/N-x' });
    try {
      assert.ok(!projectText(app).includes(HELD_WORDS), q);
      assert.equal(app.state().textContent, '1 waiting on you');
    } finally {
      app.restore();
    }
  }
});

const answerPr = (n, o = {}) => ({ ...pr(n, o.title || 'Record the answer to the next work', { head: `cos/answer-${n}`, headRepo: o.headRepo }),
  head: { ref: `cos/answer-${n}`, sha: o.sha || `${n}`.padStart(40, 'a'), repo: o.headRepo === null ? null : { full_name: o.headRepo || 'shumpmaster/Service-Desk' } } });
const ADDS_ANSWER = [{ filename: 'decisions/questions/P-001-next-work.md', status: 'added' }, { filename: QPATH, status: 'removed' }];

test('AC77: the answer\'s pull request opening: "Your answer is being recorded", its link, no answer link; the pull request itself in Merges, counted, with its added words', async () => {
  const app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION, '.github/workflows/asks-merge.yml': 'name: asks-merge\n' },
    { pulls: [answerPr(90)], extra: { repo: { prFiles: { 90: ADDS_ANSWER } } } });
  try {
    await app.advance(60_000); // the optional J20 read rides a blob call after the needed reads
    const v = projectText(app);
    assert.ok(v.includes(RECORDING_WORDS));
    assert.equal(RECORDING_WORDS, 'Your answer is being recorded');
    assert.ok(findAll(app.els.view, (e) => e.tag === 'a' && e.attrs.href === 'https://github.com/shumpmaster/Service-Desk/pull/90').length, 'the pull request\'s link');
    assert.equal(answerLinks(app).length, 0);
    assert.equal(app.state().textContent, '1 waiting on you', 'the pull request counts; the question does not');
    app.loc.hash = '#/p/Service-Desk';
    await app.advance(60_000);
    assert.ok(projectText(app).includes('Your answer to Which piece of later work comes next?: the automatic job merges it, usually within minutes'));
  } finally {
    app.restore();
  }
});

test('AC77: within one opening, the answer\'s pull request merging leaves the question answered; closing unmerged (read by number, draft 7) shows it waiting again, with its link', async () => {
  const r = repos({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, [answerPr(91)]);
  r['Service-Desk'].prFiles = { 91: ADDS_ANSWER };
  r['Service-Desk'].prAnswers = { 91: { ...answerPr(91), state: 'closed', closed_at: '2026-10-18T11:45:00Z', merged_at: null } };
  const app = await loadApp({ repos: r, now: RAISED_MS + 10 * MIN, hash: '#/p/Service-Desk/q/P-001-next-work' });
  try {
    await app.advance(1000);
    await app.advance(60_000);
    assert.ok(projectText(app).includes(RECORDING_WORDS));
    r['Service-Desk'].pulls = []; // closed unmerged: the question still open on the default branch
    await app.advance(60_000);
    assert.ok(!projectText(app).includes(RECORDING_WORDS) && !projectText(app).includes(HELD_WORDS));
    assert.ok(pick(app), 'waiting, with its answer link');
    assert.equal(app.state().textContent, '1 waiting on you');
    assert.deepEqual(app.calls().filter((c) => c.body.prs).map((c) => c.body.prs), [[91]], 'one read by number');
  } finally {
    app.restore();
  }
  const r2 = repos({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, [answerPr(92)]);
  r2['Service-Desk'].prFiles = { 92: ADDS_ANSWER };
  const app2 = await loadApp({ repos: r2, now: RAISED_MS + 10 * MIN, hash: '#/p/Service-Desk/q/P-001-next-work' });
  try {
    await app2.advance(61_000);
    r2['Service-Desk'].pulls = [];
    r2['Service-Desk'].commit({ [QPATH]: null, 'decisions/questions/P-001-next-work.md': 'Ruling: A\n' });
    await app2.advance(60_000);
    assert.ok(projectText(app2).includes('already answered'), 'merged: answered');
  } finally {
    app2.restore();
  }
});

test('AC77, J20: a fork\'s pull request adding the answer is ignored; a v3 withdrawal is not "being recorded"; a draft neither', async () => {
  for (const [p, files, label] of [
    [answerPr(93, { headRepo: 'someone/Service-Desk' }), ADDS_ANSWER, 'a fork'],
    [answerPr(94), [{ filename: QPATH, status: 'removed' }], 'a v3 withdrawal'],
    [{ ...answerPr(95), draft: true }, ADDS_ANSWER, 'a draft']]) {
    const app = await open({ [QPATH]: REAL_Q }, { pulls: [p], extra: { repo: { prFiles: { [p.number]: files } } } });
    try {
      await app.advance(60_000);
      assert.ok(!projectText(app).includes(RECORDING_WORDS), label);
      assert.ok(pick(app), `${label}: still its answer link`);
    } finally {
      app.restore();
    }
  }
});

test('AC77: in a v2.5 project (poom/\'s placeholder form) the line holds, and an own-branch deletion reads as being recorded', async () => {
  const poomQ = (line) => `# Ruling needed: A made-up v2.5 question\n\n${line}\nWHY: made up\nOPTIONS:\n  A. a\n`;
  const poom = repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), 'questions/N-v25-held.md': poomQ('Asked in session: s-v25'),
    'questions/N-v25-recorded.md': poomQ('') }, [{ ...answerPr(96), head: { ref: 'cos/x', sha: 'b'.repeat(40), repo: { full_name: 'shumpmaster/Personal-Org-Operating-Model' } } }]);
  poom.prFiles = { 96: [{ filename: 'questions/N-v25-recorded.md', status: 'removed' }] };
  poom.history = { 'questions/N-v25-held.md': hist(RAISED), 'questions/N-v25-recorded.md': hist(RAISED) };
  const r = repos({});
  r['Personal-Org-Operating-Model'] = poom;
  const app = await loadApp({ repos: r, now: RAISED_MS + 10 * MIN, hash: '#/p/Personal-Org-Operating-Model' });
  try {
    await app.advance(61_000);
    const v = projectText(app);
    assert.ok(v.includes(HELD_WORDS));
    assert.ok(v.includes(RECORDING_WORDS));
    assert.equal(app.state().textContent, '1 waiting on you', 'only the pull request counts');
  } finally {
    app.restore();
  }
});

test('AC77: "Answer it here instead" ends the hold on this device only', async () => {
  const backing = new Map();
  const local = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, v), removeItem: (k) => backing.delete(k) };
  const files = { [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION };
  let app = await open(files, { globals: { localStorage: local } });
  try {
    const btn = findAll(app.els.view, (e) => e.tag === 'button' && e.textContent === 'Answer it here instead')[0];
    btn.click();
    await app.flush();
    assert.ok(!projectText(app).includes(HELD_WORDS));
    assert.ok(pick(app), 'the answer link');
  } finally {
    app.restore();
  }
  app = await open(files, { globals: { localStorage: local } });
  try {
    assert.ok(!projectText(app).includes(HELD_WORDS), 'kept on this device');
  } finally {
    app.restore();
  }
  app = await open(files);
  try {
    assert.ok(projectText(app).includes(HELD_WORDS), 'another device still holds it');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The re-read before an answer link opens

test('AC77: the re-read at 31 seconds gives each of its four outcomes; at 29 seconds none is made', async () => {
  const run = async (change) => {
    const opened = [];
    const app = await open({ 'questions/N-x.md': v3q('') }, { hash: '#/p/Service-Desk/q/N-x', win: { open: (u) => { opened.push(u); return {}; } } });
    const link = pick(app);
    return { app, link, opened };
  };
  // 29 seconds: no re-read; the link opens as today.
  let { app, link } = await run();
  try {
    await app.advance(29_000);
    const before = app.fetchCalls.length;
    const e = link.click();
    assert.equal(e.defaultPrevented, false, 'GitHub opens as today');
    await app.flush();
    assert.equal(app.fetchCalls.length, before, 'no call made');
  } finally {
    app.restore();
  }
  const outcomes = {
    open: () => {},
    answered: (r) => r.commit({ 'decisions/questions/N-x.md': 'Ruling: B — made up\n' }),
    recording: (r) => {
      r.pulls.push({ ...answerPr(97), head: { ref: 'cos/a', sha: 'c'.repeat(40), repo: { full_name: 'shumpmaster/Service-Desk' } } });
      r.prFiles = { 97: [{ filename: 'decisions/questions/N-x.md', status: 'added' }] };
    },
    failed: (r) => { r.fail = { kind: 'network' }; },
  };
  for (const [kind, change] of Object.entries(outcomes)) {
    const opened2 = [];
    const rs = repos({ 'questions/N-x.md': v3q('') });
    app = await loadApp({ repos: rs, now: RAISED_MS + 10 * MIN, hash: '#/p/Service-Desk/q/N-x', win: { open: (u) => { opened2.push(u); return {}; } } });
    try {
      await app.advance(1000);
      link = pick(app);
      await app.advance(31_000);
      change(rs['Service-Desk']);
      const polls = app.fetchCalls.filter((c) => c.path === '/api/poll').length;
      const blobs0 = app.fetchCalls.filter((c) => c.path === '/api/blobs').length;
      const e = link.click();
      assert.equal(e.defaultPrevented, true, `${kind}: held back for the re-read`);
      await app.flush();
      assert.equal(app.fetchCalls.filter((c) => c.path === '/api/poll').length, polls + 1, `${kind}: one poll call`);
      const said = findAll(app.els.view, (x) => x.className === 'recheck')[0];
      const text = said ? said.textContent : '';
      if (kind === 'open') {
        assert.deepEqual(opened2, [link.attrs.href], 'still open: GitHub opens');
      } else if (kind === 'answered') {
        assert.equal(text, 'Already answered: Ruling: B — made up');
        assert.deepEqual(opened2, []);
      } else if (kind === 'recording') {
        assert.ok(text.includes(RECHECK_WORDS.recording));
        assert.ok(text.includes('PR #97'));
        assert.deepEqual(opened2, []);
      } else {
        assert.ok(text.includes("The desk couldn't check just now"));
        assert.ok(text.includes('Open GitHub anyway'));
        assert.deepEqual(opened2, []);
      }
      assert.ok(app.fetchCalls.filter((c) => c.path === '/api/blobs').length <= blobs0 + 1, `${kind}: at most one blob call`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// Draft 6: the closed read, once an opening, for a project with a held question

const closedPr = (n, o = {}) => ({ ...answerPr(n, o), state: 'closed', closed_at: o.closed || '2026-10-18T11:40:00Z', merged_at: o.merged || null,
  base: { ref: o.base || 'main' } });

test('AC77 (draft 6): at a new opening, an answer\'s own-branch pull request closed unmerged after the raised time ends the hold: waiting, with its answer link', async () => {
  const app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION },
    { extra: { repo: { closedPulls: [closedPr(98, { closed: '2026-10-18T11:35:00Z' })], prFiles: { 98: ADDS_ANSWER } } } });
  try {
    await app.advance(60_000);
    assert.ok(!projectText(app).includes(HELD_WORDS));
    assert.ok(pick(app), 'waiting, with its answer link');
    assert.equal(app.state().textContent, '1 waiting on you');
    const closedCalls = app.calls().filter((c) => c.path === '/api/blobs' && c.body.closed);
    assert.equal(closedCalls.length, 1, 'the closed read, once');
    await app.advance(5 * 60_000);
    assert.equal(app.calls().filter((c) => c.path === '/api/blobs' && c.body.closed).length, 1, 'once an opening');
  } finally {
    app.restore();
  }
});

test('AC77 (draft 6): closed before the raised time, merged, from a fork, or into another branch: none ends the hold; the read failing leaves it standing; no read without a held question', async () => {
  const closed = [closedPr(80, { closed: '2026-10-18T11:00:00Z' }), closedPr(81, { merged: '2026-10-18T11:40:00Z' }),
    closedPr(82, { headRepo: 'someone/Service-Desk' }), closedPr(83, { base: 'dev' })];
  const files = { 80: ADDS_ANSWER, 81: ADDS_ANSWER, 82: ADDS_ANSWER, 83: ADDS_ANSWER };
  let app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, { extra: { repo: { closedPulls: closed, prFiles: files } } });
  try {
    await app.advance(60_000);
    assert.ok(projectText(app).includes(HELD_WORDS));
    assert.ok(!app.calls().some((c) => c.path === '/api/blobs' && (c.body.files || []).some((n) => n >= 80 && n <= 83)), 'their files are not read');
  } finally {
    app.restore();
  }
  app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, { extra: { repo: { closedFail: true, closedPulls: [closedPr(98)], prFiles: { 98: ADDS_ANSWER } } } });
  try {
    await app.advance(3 * 60_000);
    assert.ok(projectText(app).includes(HELD_WORDS), 'the hold stands');
    assert.equal(app.state().textContent, 'Quiet', '"read successfully" and the counts untouched');
    // Draft 8 (note B): tried again at each next poll, once a poll.
    assert.equal(app.calls().filter((c) => c.path === '/api/blobs' && c.body.closed).length, 4, 'the first cycle and each of the three polls after');
  } finally {
    app.restore();
  }
  app = await open({ [QPATH]: REAL_Q }, { extra: { repo: { closedPulls: [closedPr(98)], prFiles: { 98: ADDS_ANSWER } } } });
  try {
    await app.advance(3 * 60_000);
    assert.ok(!app.calls().some((c) => c.path === '/api/blobs' && c.body.closed), 'no held question: no closed read');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The sandbox: AC77 shows in both views

test('AC77 in the sandbox: the held question is out of the Queue\'s Decisions and its count, under "Asked in your session" with no answer box; "Answer it here instead" brings it back', async () => {
  const config = { ...CONFIG };
  const app = await loadSandbox({ config, repos: repos({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }), hash: '#/p/Service-Desk/queue', now: RAISED_MS + 10 * MIN });
  try {
    await app.advance(1000);
    await app.advance(60_000);
    const asking = byClass(app.view, 'sb-asking')[0];
    assert.ok(asking, 'Asked in your session');
    assert.ok(asking.textContent.includes(HELD_WORDS));
    assert.ok(asking.textContent.includes('Which piece of later work comes next?'));
    assert.ok(!sbFindAll(app.view, (e) => e.tag === 'textarea').length, 'no answer box');
    assert.ok(app.text().includes('Nothing waits on you in Service-Desk'), 'not counted');
    const btn = sbFindAll(app.view, (e) => e.tag === 'button' && e.textContent === 'Answer it here instead')[0];
    btn.click();
    await app.flush();
    assert.equal(byClass(app.view, 'sb-asking').length, 0);
    assert.ok(app.text().includes('1 waiting on you'));
  } finally {
    app.restore();
  }
});

test('AC77 in the sandbox: the answer\'s pull request in Merges with its added words; the re-read on a stale answer link says "Already answered" and opens nothing', async () => {
  const files = { [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION, '.github/workflows/asks-merge.yml': 'name: asks-merge\n' };
  let app = await loadSandbox({ config: CONFIG, repos: repos(files, [answerPr(90)], { repo: { prFiles: { 90: ADDS_ANSWER } } }), hash: '#/p/Service-Desk/queue', now: RAISED_MS + 10 * MIN });
  try {
    await app.advance(1000);
    await app.advance(60_000);
    assert.ok(app.text().includes('Your answer to Which piece of later work comes next?: the automatic job merges it, usually within minutes'));
    assert.ok(byClass(app.view, 'sb-asking')[0].textContent.includes(RECORDING_WORDS));
  } finally {
    app.restore();
  }
  const opened = [];
  const rs = repos({ 'questions/N-x.md': v3q('') });
  app = await loadSandbox({ config: CONFIG, repos: rs, hash: '#/p/Service-Desk/queue/q%3AN-x', now: RAISED_MS + 10 * MIN, win: { open: (u) => { opened.push(u); return {}; } } });
  try {
    await app.advance(1000);
    await app.advance(60_000);
    const chip = sbFindAll(app.view, (e) => e.tag === 'button' && e.attrs.role === 'radio')[0];
    await app.tap(chip);
    const go = byClass(app.view, 'sb-go')[0];
    assert.ok(go, 'the answer link');
    await app.advance(31_000);
    rs['Service-Desk'].commit({ 'decisions/questions/N-x.md': 'Ruling: A — made up\n' });
    const e = go.dispatch('click');
    await app.flush();
    assert.equal(opened.length, 0, 'nothing opens');
    assert.ok(app.text().includes('Already answered: Ruling: A — made up'));
    void e;
  } finally {
    app.restore();
  }
});

// Draft 9 (build review round 1, Desk 1; the Reviewer's probe C): the re-read before an answer link
// needs each open pull request's files read at its current head. A pull request read at an older head
// whose read at the new head fails is a failed re-read: "The desk couldn't check just now", and
// GitHub's answer page does not open.
test('AC77 (draft 9): the re-read with a pull request\'s files failing at its new head says "The desk couldn\'t check just now" and opens nothing', async () => {
  const opened = [];
  const at = (sha) => ({ ...answerPr(97), head: { ref: 'cos/a', sha, repo: { full_name: 'shumpmaster/Service-Desk' } } });
  const rs = repos({ [QPATH]: REAL_Q }, [at('c'.repeat(40))], { repo: { prFiles: { 97: [{ filename: 'README.md', status: 'modified' }] } } });
  const app = await loadApp({ repos: rs, now: RAISED_MS + 10 * MIN, hash: '#/p/Service-Desk/q/P-001-next-work', win: { open: (u) => { opened.push(u); return {}; } } });
  try {
    await app.advance(1000);
    const link = pick(app);
    assert.ok(link, 'an ordinary question: its answer link');
    await app.advance(31_000);
    // A new head that records the answer; its files read fails.
    rs['Service-Desk'].pulls = [at('d'.repeat(40))];
    rs['Service-Desk'].prFiles = { 97: ADDS_ANSWER };
    rs['Service-Desk'].filesFail = [97];
    const e = link.click();
    assert.equal(e.defaultPrevented, true);
    await app.flush();
    const said = findAll(app.els.view, (x) => x.className === 'recheck')[0];
    assert.ok(said && said.textContent.includes("The desk couldn't check just now"), said ? said.textContent : 'nothing said');
    assert.deepEqual(opened, [], 'no stale answer link opened');
  } finally {
    app.restore();
  }
});
