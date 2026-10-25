// ac-test: S-001/AC77 — the desk's side (the sender's side is notify-ac77.test.mjs), on the desk
// (from stage 8, AC44 step 4, specs/S-001.md:2918-2921, the accepted page's cases are the desk's), with a fake clock and the fake desk function: a question asked in a
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
import { loadSandbox, byClass, findAll as sbFindAll } from './sandbox-helpers.mjs';
import { NOTIFY_FIX } from './notify-helpers.mjs';
import { RECHECK_WORDS } from '../../src/lib/notifyview.js';
import { HELD_WORDS, RECORDING_WORDS } from '../../src/lib/model.js';
import { SECTION_WORDS } from '../../src/lib/board.js';

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

// From stage 8 the accepted project page and question view are gone (AC44, step 4); each case below is theirs, on the
// desk: the project's Waiting board (AC80) with its "Being asked in your session" and "Your answer is being recorded"
// lines, and the question's sheet over it (AC85) with its answer buttons (AC77: "every answer link").
const qCard = (name, project = 'Service-Desk') => `#/waiting/card/${encodeURIComponent(`${project}|question|questions/${name}.md`)}`;
const board = (project = 'Service-Desk') => `#/waiting/${project}`;
/** Everything the screen shows, with the board's held and being-recorded lines opened (AC80's folds). */
async function projectText(app) {
  for (const k of ['asking', 'answerRecording', 'recording']) {
    const ql = sbFindAll(app.view, (e) => e.dataset && e.dataset.k === `ql:${k}`)[0];
    if (ql && ql.attrs['aria-expanded'] === 'false') await app.tap(ql);
  }
  return app.view.textContent;
}
const answerLinks = (app) => sbFindAll(app.view, (e) => e.tag === 'a' && /\/new\/main/.test(e.attrs.href || ''));
const stateOf = (app) => app.els['screen-state'].textContent;
const waitCards = (app) => byClass(sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'lane:wait')[0], 'v2-card');
// From QW1 (AC77, changed by AC94 and AC95; the owner's answer 3, "In the section"): a held question shows in the "Questions
// for you" section, "Also asked in your session: answer in one place" under its title, its choices live, and no longer in the
// quiet line "Being asked in your session" (whose words, HELD_WORDS, the model and AC77's re-read keep).
const HELD_SHOWN = SECTION_WORDS.heldLine;
const heldCards = (app) => sbFindAll(app.view, (e) => e.attrs && e.attrs['data-question'] === 'held');
async function open(files, { now = RAISED_MS + 10 * MIN, pulls = [], name = 'P-001-next-work', extra = {}, store = null, win = {}, rs = null } = {}) {
  const app = await loadSandbox({ config: CONFIG, repos: rs || repos(files, pulls, extra), now, hash: board(), store, win });
  app.qname = name;
  await app.advance(1000);
  return app;
}
/** Open the question's sheet (AC85) and give its first answer button, "Answer A ↗", or null when it has none. */
async function pick(app, name = app.qname) {
  await app.go(qCard(name));
  const sheet = byClass(app.view, 'v2-sheet')[0];
  return (sheet && byClass(sheet, 'v2-abtn').find((x) => x.tag === 'a' && /^Answer A/.test(x.textContent))) || null;
}
/** A click whose preventDefault is recorded (the answer link holds GitHub back for AC77's re-read). */
const clickOf = (el) => el.dispatch('click', { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } });

// Rewritten in QW1 (AC77, changed by AC94 and AC95; the owner's answer 3, "In the section (Recommended)": "with its answer
// buttons, unnumbered, marked "Also asked in your session: answer in one place""): the held question shows in the "Questions
// for you" section, its options as live buttons, never counted; the quiet line "Being asked in your session" is gone.
test('AC77 (the desk from stage 8), rewritten in QW1: a question with the line is held — in the "Questions for you" section, "Also asked in your session: answer in one place", its title and its options as live answer buttons, with no "Done ✓", not counted', async () => {
  const app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, { now: RAISED_MS + 54 * MIN });
  try {
    const v = await projectText(app);
    assert.ok(v.includes(HELD_SHOWN));
    assert.equal(HELD_WORDS, 'Being asked in your session: answer there', 'the model\'s words, kept for AC77\'s re-read');
    assert.ok(v.includes('Which piece of later work comes next?'));
    const [card] = heldCards(app);
    assert.ok(card, 'in the section');
    assert.ok(card.textContent.includes('Plan M3A around milestones, mockup first'), 'its options, as boxes');
    assert.equal(sbFindAll(app.view, (e) => e.tag === 'textarea' || e.tag === 'input').length, 0, 'no answer box open ("Add your own words" folded)');
    assert.equal(answerLinks(app).length, 5, 'its five choices\' answer links, live (answer 3)');
    assert.equal(sbFindAll(card, (e) => e.textContent === 'Done ✓').length, 0, 'no "Done ✓"');
    assert.ok(!v.includes('Open the question on GitHub'), 'no "Open in GitHub" to answer');
    assert.equal(stateOf(app), 'Quiet', 'not counted: the 03:08:21Z end line, before the raised time, ends nothing');
    assert.equal(waitCards(app).length, 0, 'nothing waiting on you here');
    assert.equal(sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'ql:asking').length, 0, 'no "Being asked in your session" line');
    assert.equal(sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'qhead')[0].textContent, 'Questions for you · 0 · 1 being asked in your session');
  } finally {
    app.restore();
  }
});

test('AC77 (the desk): still held at 7 hours 59 minutes; ordinary at 8 hours, with its answer link and counted', async () => {
  let app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, { now: RAISED_MS + 8 * 60 * MIN - MIN });
  try {
    assert.ok((await projectText(app)).includes(HELD_SHOWN));
  } finally {
    app.restore();
  }
  app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, { now: RAISED_MS + 8 * 60 * MIN });
  try {
    assert.ok(!(await projectText(app)).includes(HELD_SHOWN));
    assert.equal(stateOf(app), '1 waiting on you');
    assert.ok(await pick(app), 'the answer link');
  } finally {
    app.restore();
  }
});

test('AC77 (the desk): the real question unchanged (no line) is an ordinary waiting question, with its answer link', async () => {
  const app = await open({ [QPATH]: REAL_Q, [SESSION_PATH]: REAL_SESSION });
  try {
    assert.ok(!(await projectText(app)).includes(HELD_SHOWN));
    assert.equal(stateOf(app), '1 waiting on you');
    assert.ok(await pick(app));
  } finally {
    app.restore();
  }
});

test('AC77 (the desk): end lines in the session file: one before the raised time, a start after it and one at exactly it end nothing; one after it ends the hold', async () => {
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
    const app = await open({ 'questions/N-x.md': v3q('Asked in session: s-x'), [sp]: `${lines.join('\n')}\n` }, { name: 'N-x' });
    try {
      assert.equal((await projectText(app)).includes(HELD_SHOWN), held, label);
      assert.equal(stateOf(app), held ? 'Quiet' : '1 waiting on you', label);
    } finally {
      app.restore();
    }
  }
});

test('AC77 (the desk): a line in another form or place is ignored: the question is ordinary', async () => {
  for (const q of [v3q('Asked in session:s-x'), v3q(' Asked in session: s-x'), '# Ruling needed: x\n\nMilestone: M1\n\nAsked in session: s-x\nOPTIONS:\n  A. a\n']) {
    const app = await open({ 'questions/N-x.md': q }, { name: 'N-x' });
    try {
      assert.ok(!(await projectText(app)).includes(HELD_SHOWN), q);
      assert.equal(stateOf(app), '1 waiting on you');
    } finally {
      app.restore();
    }
  }
});

const answerPr = (n, o = {}) => ({ ...pr(n, o.title || 'Record the answer to the next work', { head: `cos/answer-${n}`, headRepo: o.headRepo }),
  head: { ref: `cos/answer-${n}`, sha: o.sha || `${n}`.padStart(40, 'a'), repo: o.headRepo === null ? null : { full_name: o.headRepo || 'shumpmaster/Service-Desk' } } });
const ADDS_ANSWER = [{ filename: 'decisions/questions/P-001-next-work.md', status: 'added' }, { filename: QPATH, status: 'removed' }];

test('AC77 (the desk): the answer\'s pull request opening: "Your answer is being recorded", its link, no answer link; the pull request itself a card, counted, with its added words', async () => {
  const app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION, '.github/workflows/asks-merge.yml': 'name: asks-merge\n' },
    { pulls: [answerPr(90)], extra: { repo: { prFiles: { 90: ADDS_ANSWER } } } });
  try {
    await app.advance(60_000); // the optional J20 read rides a blob call after the needed reads
    const v = await projectText(app);
    assert.ok(v.includes(RECORDING_WORDS));
    assert.equal(RECORDING_WORDS, 'Your answer is being recorded');
    assert.ok(sbFindAll(app.view, (e) => e.tag === 'a' && e.attrs.href === 'https://github.com/shumpmaster/Service-Desk/pull/90').length, 'the pull request\'s link');
    assert.equal(answerLinks(app).length, 0);
    assert.equal(stateOf(app), '1 waiting on you', 'the pull request counts; the question does not');
    const cards = waitCards(app);
    assert.equal(cards.length, 1, 'the pull request, a card');
    await app.go(byClass(cards[0], 'v2-t')[0].attrs.href);
    assert.ok(byClass(app.view, 'v2-sheet')[0].textContent.includes('Your answer to Which piece of later work comes next?'));
    assert.ok(!app.text().includes('the automatic job merges it, usually within minutes'), 'the 17 October words are gone (AC79)');
  } finally {
    app.restore();
  }
});

test('AC77 (the desk): within one opening, the answer\'s pull request merging leaves the question answered; closing unmerged (read by number, draft 7) shows it waiting again, with its link', async () => {
  const r = repos({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, [answerPr(91)]);
  r['Service-Desk'].prFiles = { 91: ADDS_ANSWER };
  r['Service-Desk'].prAnswers = { 91: { ...answerPr(91), state: 'closed', closed_at: '2026-10-18T11:45:00Z', merged_at: null } };
  const app = await open(null, { rs: r });
  try {
    await app.advance(60_000);
    assert.ok((await projectText(app)).includes(RECORDING_WORDS));
    r['Service-Desk'].pulls = []; // closed unmerged: the question still open on the default branch
    await app.advance(60_000);
    const v = await projectText(app);
    assert.ok(!v.includes(RECORDING_WORDS) && !v.includes(HELD_SHOWN));
    assert.equal(stateOf(app), '1 waiting on you');
    assert.ok(await pick(app), 'waiting, with its answer link');
    assert.deepEqual(app.server.calls.filter((c) => c.body.prs).map((c) => c.body.prs), [[91]], 'one read by number');
  } finally {
    app.restore();
  }
  const r2 = repos({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, [answerPr(92)]);
  r2['Service-Desk'].prFiles = { 92: ADDS_ANSWER };
  const app2 = await open(null, { rs: r2 });
  try {
    await app2.advance(60_000);
    r2['Service-Desk'].pulls = [];
    r2['Service-Desk'].commit({ [QPATH]: null, 'decisions/questions/P-001-next-work.md': 'Ruling: A\n' });
    await app2.advance(60_000);
    // Merged: answered. On the desk the held question was never a card (AC80), so "already answered" is: nothing waits on
    // you, neither line stands, the answer's pull request is in Done, and the question's own address offers no answer.
    const v = await projectText(app2);
    assert.ok(!v.includes(RECORDING_WORDS) && !v.includes(HELD_SHOWN), 'merged: answered');
    assert.equal(waitCards(app2).length, 0);
    assert.equal(stateOf(app2), 'Quiet');
    const done = sbFindAll(app2.view, (e) => e.dataset && e.dataset.k === 'lane:done')[0];
    assert.ok(done.textContent.includes('Record the answer to the next work#92'), 'its pull request in Done');
    assert.equal(await pick(app2), null);
    assert.equal(answerLinks(app2).length, 0);
  } finally {
    app2.restore();
  }
});

test('AC77, J20 (the desk): a fork\'s pull request adding the answer is ignored; a v3 withdrawal is not "being recorded"; a draft neither', async () => {
  for (const [p, files, label] of [
    [answerPr(93, { headRepo: 'someone/Service-Desk' }), ADDS_ANSWER, 'a fork'],
    [answerPr(94), [{ filename: QPATH, status: 'removed' }], 'a v3 withdrawal'],
    [{ ...answerPr(95), draft: true }, ADDS_ANSWER, 'a draft']]) {
    const app = await open({ [QPATH]: REAL_Q }, { pulls: [p], extra: { repo: { prFiles: { [p.number]: files } } } });
    try {
      await app.advance(60_000);
      assert.ok(!(await projectText(app)).includes(RECORDING_WORDS), label);
      assert.ok(await pick(app), `${label}: still its answer link`);
    } finally {
      app.restore();
    }
  }
});

test('AC77 (the desk): in a v2.5 project (poom/\'s placeholder form) the line holds, and an own-branch deletion reads as being recorded', async () => {
  const poomQ = (line) => `# Ruling needed: A made-up v2.5 question\n\n${line}\nWHY: made up\nOPTIONS:\n  A. a\n`;
  const poom = repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), 'questions/N-v25-held.md': poomQ('Asked in session: s-v25'),
    'questions/N-v25-recorded.md': poomQ('') }, [{ ...answerPr(96), head: { ref: 'cos/x', sha: 'b'.repeat(40), repo: { full_name: 'shumpmaster/Personal-Org-Operating-Model' } } }]);
  poom.prFiles = { 96: [{ filename: 'questions/N-v25-recorded.md', status: 'removed' }] };
  poom.history = { 'questions/N-v25-held.md': hist(RAISED), 'questions/N-v25-recorded.md': hist(RAISED) };
  const r = repos({});
  r['Personal-Org-Operating-Model'] = poom;
  const app = await loadSandbox({ config: CONFIG, repos: r, now: RAISED_MS + 10 * MIN, hash: board('Personal-Org-Operating-Model') });
  try {
    await app.advance(1000);
    await app.advance(60_000);
    const v = await projectText(app);
    assert.ok(v.includes(HELD_SHOWN));
    assert.ok(v.includes(RECORDING_WORDS));
    assert.equal(stateOf(app), '1 waiting on you', 'only the pull request counts');
  } finally {
    app.restore();
  }
});

// Rewritten in QW1 (AC77, changed by AC94 and AC95: "a tap ending the hold on that device as "Answer it here instead"
// does"): the held question's choice, in the section, ends the hold on this device, where "Answer it here instead" did.
test('AC77 (the desk), rewritten in QW1: a tap on a held question\'s choice in the section ends the hold on this device only, as "Answer it here instead" did', async () => {
  const backing = new Map();
  const local = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, v), removeItem: (k) => backing.delete(k) };
  const files = { [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION };
  let app = await open(files, { store: local });
  try {
    await projectText(app);
    const choice = byClass(heldCards(app)[0], 'v2-abtn').find((a) => a.tag === 'a' && /^Answer A/.test(a.textContent));
    clickOf(choice);
    await app.flush();
    assert.ok(!(await projectText(app)).includes(HELD_SHOWN));
    assert.ok(await pick(app), 'the answer link');
  } finally {
    app.restore();
  }
  app = await open(files, { store: local });
  try {
    assert.ok(!(await projectText(app)).includes(HELD_SHOWN), 'kept on this device');
  } finally {
    app.restore();
  }
  app = await open(files);
  try {
    assert.ok((await projectText(app)).includes(HELD_SHOWN), 'another device still holds it');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The re-read before an answer link opens

test('AC77 (the desk): the re-read at 31 seconds gives each of its four outcomes; at 29 seconds none is made', async () => {
  // 29 seconds: no re-read; the link opens as today.
  let app = await open({ 'questions/N-x.md': v3q('') }, { name: 'N-x' });
  try {
    const link = await pick(app);
    await app.advance(29_000);
    const before = app.server.calls.length;
    const e = clickOf(link);
    assert.equal(e.defaultPrevented, false, 'GitHub opens as today');
    await app.flush();
    assert.equal(app.server.calls.length, before, 'no call made');
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
    app = await open(null, { rs, name: 'N-x', win: { open: (u) => { opened2.push(u); return {}; } } });
    try {
      const link = await pick(app);
      await app.advance(31_000);
      change(rs['Service-Desk']);
      const polls = app.server.calls.filter((c) => c.path === '/api/poll').length;
      const blobs0 = app.server.calls.filter((c) => c.path === '/api/blobs').length;
      const e = clickOf(link);
      assert.equal(e.defaultPrevented, true, `${kind}: held back for the re-read`);
      await app.flush();
      assert.equal(app.server.calls.filter((c) => c.path === '/api/poll').length, polls + 1, `${kind}: one poll call`);
      const said = byClass(app.view, 'v2-recheck')[0];
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
      assert.ok(app.server.calls.filter((c) => c.path === '/api/blobs').length <= blobs0 + 1, `${kind}: at most one blob call`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// Draft 6: the closed read, once an opening, for a project with a held question

const closedPr = (n, o = {}) => ({ ...answerPr(n, o), state: 'closed', closed_at: o.closed || '2026-10-18T11:40:00Z', merged_at: o.merged || null,
  base: { ref: o.base || 'main' } });

test('AC77 (draft 6; the desk): at a new opening, an answer\'s own-branch pull request closed unmerged after the raised time ends the hold: waiting, with its answer link', async () => {
  const app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION },
    { extra: { repo: { closedPulls: [closedPr(98, { closed: '2026-10-18T11:35:00Z' })], prFiles: { 98: ADDS_ANSWER } } } });
  try {
    await app.advance(60_000);
    assert.ok(!(await projectText(app)).includes(HELD_WORDS));
    assert.equal(stateOf(app), '1 waiting on you');
    const closedCalls = app.server.calls.filter((c) => c.path === '/api/blobs' && c.body.closed);
    assert.equal(closedCalls.length, 1, 'the closed read, once');
    await app.advance(5 * 60_000);
    assert.equal(app.server.calls.filter((c) => c.path === '/api/blobs' && c.body.closed).length, 1, 'once an opening');
    assert.ok(await pick(app), 'waiting, with its answer link');
  } finally {
    app.restore();
  }
});

test('AC77 (draft 6; the desk): closed before the raised time, merged, from a fork, or into another branch: none ends the hold; the read failing leaves it standing; no read without a held question', async () => {
  const closed = [closedPr(80, { closed: '2026-10-18T11:00:00Z' }), closedPr(81, { merged: '2026-10-18T11:40:00Z' }),
    closedPr(82, { headRepo: 'someone/Service-Desk' }), closedPr(83, { base: 'dev' })];
  const files = { 80: ADDS_ANSWER, 81: ADDS_ANSWER, 82: ADDS_ANSWER, 83: ADDS_ANSWER };
  let app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, { extra: { repo: { closedPulls: closed, prFiles: files } } });
  try {
    await app.advance(60_000);
    assert.ok((await projectText(app)).includes(HELD_WORDS));
    assert.ok(!app.server.calls.some((c) => c.path === '/api/blobs' && (c.body.files || []).some((n) => n >= 80 && n <= 83)), 'their files are not read');
  } finally {
    app.restore();
  }
  app = await open({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, { extra: { repo: { closedFail: true, closedPulls: [closedPr(98)], prFiles: { 98: ADDS_ANSWER } } } });
  try {
    await app.advance(3 * 60_000);
    assert.ok((await projectText(app)).includes(HELD_WORDS), 'the hold stands');
    assert.equal(stateOf(app), 'Quiet', '"read successfully" and the counts untouched');
    // Draft 8 (note B): tried again at each next poll, once a poll.
    assert.equal(app.server.calls.filter((c) => c.path === '/api/blobs' && c.body.closed).length, 4, 'the first cycle and each of the three polls after');
  } finally {
    app.restore();
  }
  app = await open({ [QPATH]: REAL_Q }, { extra: { repo: { closedPulls: [closedPr(98)], prFiles: { 98: ADDS_ANSWER } } } });
  try {
    await app.advance(3 * 60_000);
    assert.ok(!app.server.calls.some((c) => c.path === '/api/blobs' && c.body.closed), 'no held question: no closed read');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The desk's board and sheets (AC80, AC85): AC77's lines and the re-read

test('AC77 + AC80 on the desk: the held question is no card and in no count, in the board\'s "Being asked in your session" line with no answer box; "Answer it here instead" brings it back as a card', async () => {
  const config = { ...CONFIG };
  const app = await loadSandbox({ config, repos: repos({ [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }), hash: '#/waiting/Service-Desk', now: RAISED_MS + 10 * MIN });
  const lane = () => sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'lane:wait')[0];
  try {
    await app.advance(1000);
    await app.advance(60_000);
    const ql = sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'ql:asking')[0];
    assert.ok(ql, 'Being asked in your session');
    assert.equal(ql.textContent, 'Being asked in your session: 1');
    await app.tap(ql);
    const fold = sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'fold:asking')[0];
    assert.ok(fold.textContent.includes(HELD_WORDS));
    assert.ok(fold.textContent.includes('Which piece of later work comes next?'));
    assert.ok(!sbFindAll(app.view, (e) => e.tag === 'textarea').length, 'no answer box');
    assert.ok(!sbFindAll(fold, (e) => e.tag === 'a' && /\/new\//.test(e.attrs.href || '')).length, 'no answer link');
    assert.equal(byClass(lane(), 'v2-card').length, 0, 'not a card');
    assert.equal(byClass(app.view, 'v2-badge').length, 0, 'not counted');
    const btn = sbFindAll(app.view, (e) => e.tag === 'button' && e.textContent === 'Answer it here instead')[0];
    btn.click();
    await app.flush();
    assert.equal(sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'ql:asking').length, 0);
    assert.ok(byClass(lane(), 'v2-card').some((c) => c.textContent.includes('Which piece of later work comes next?')), 'a card again');
    assert.equal(byClass(app.view, 'v2-badge')[0].children[0].textContent, '1');
  } finally {
    app.restore();
  }
});

test('AC77 + AC80 on the desk: the answer\'s pull request with its added words, the question in "Your answer is being recorded"; the re-read on a stale answer button says "Already answered" and opens nothing', async () => {
  const files = { [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION, '.github/workflows/asks-merge.yml': 'name: asks-merge\n' };
  let app = await loadSandbox({ config: CONFIG, repos: repos(files, [answerPr(90)], { repo: { prFiles: { 90: ADDS_ANSWER } } }), hash: '#/waiting/Service-Desk', now: RAISED_MS + 10 * MIN });
  try {
    await app.advance(1000);
    await app.advance(60_000);
    for (const k of ['answerRecording', 'recording']) {
      const ql = sbFindAll(app.view, (e) => e.dataset && e.dataset.k === `ql:${k}`)[0];
      if (ql && ql.attrs['aria-expanded'] === 'false') await app.tap(ql);
    }
    const cards = byClass(sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'lane:wait')[0], 'v2-card');
    assert.equal(cards.length, 1, 'the answer\'s pull request, a card');
    for (const c of cards) {
      await app.go(byClass(c, 'v2-t')[0].attrs.href);
      assert.ok(byClass(app.view, 'v2-sheet')[0].textContent.includes('Your answer to Which piece of later work comes next?'), 'the pull request\'s sheet names the answer');
      await app.go('#/waiting/Service-Desk');
    }
    assert.ok(!app.text().includes('the automatic job merges it, usually within minutes'), 'the 17 October words are gone (AC79)');
    const fold = sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'fold:answerRecording')[0];
    assert.ok(fold && fold.textContent.includes(RECORDING_WORDS));
  } finally {
    app.restore();
  }
  const opened = [];
  const rs = repos({ 'questions/N-x.md': v3q('') });
  app = await loadSandbox({ config: CONFIG, repos: rs, hash: '#/p/Service-Desk/queue/q%3AN-x', now: RAISED_MS + 10 * MIN, win: { open: (u) => { opened.push(u); return {}; } } });
  try {
    await app.advance(1000);
    await app.advance(60_000);
    const sheet = byClass(app.view, 'v2-sheet')[0];
    assert.ok(sheet, 'the old Queue address opens its sheet over Waiting');
    const go = byClass(sheet, 'v2-abtn').find((a) => a.tag === 'a' && /^Answer/.test(a.textContent));
    assert.ok(go, 'an answer button');
    await app.advance(31_000);
    rs['Service-Desk'].commit({ 'decisions/questions/N-x.md': 'Ruling: A — made up\n' });
    const e = go.dispatch('click');
    await app.flush();
    assert.equal(opened.length, 0, 'nothing opens');
    assert.ok(app.text().includes('Already answered: Ruling: A — made up'), 'said in the sheet, which stays open (AC56)');
    void e;
  } finally {
    app.restore();
  }
});

// Draft 9 (build review round 1, Desk 1; the Reviewer's probe C): the re-read before an answer link
// needs each open pull request's files read at its current head. A pull request read at an older head
// whose read at the new head fails is a failed re-read: "The desk couldn't check just now", and
// GitHub's answer page does not open.
test('AC77 (draft 9; the desk): the re-read with a pull request\'s files failing at its new head says "The desk couldn\'t check just now" and opens nothing', async () => {
  const opened = [];
  const at = (sha) => ({ ...answerPr(97), head: { ref: 'cos/a', sha, repo: { full_name: 'shumpmaster/Service-Desk' } } });
  const rs = repos({ [QPATH]: REAL_Q }, [at('c'.repeat(40))], { repo: { prFiles: { 97: [{ filename: 'README.md', status: 'modified' }] } } });
  const app = await open(null, { rs, win: { open: (u) => { opened.push(u); return {}; } } });
  try {
    const link = await pick(app);
    assert.ok(link, 'an ordinary question: its answer link');
    await app.advance(31_000);
    // A new head that records the answer; its files read fails.
    rs['Service-Desk'].pulls = [at('d'.repeat(40))];
    rs['Service-Desk'].prFiles = { 97: ADDS_ANSWER };
    rs['Service-Desk'].filesFail = [97];
    const e = clickOf(link);
    assert.equal(e.defaultPrevented, true);
    await app.flush();
    const said = byClass(app.view, 'v2-recheck')[0];
    assert.ok(said && said.textContent.includes("The desk couldn't check just now"), said ? said.textContent : 'nothing said');
    assert.deepEqual(opened, [], 'no stale answer link opened');
  } finally {
    app.restore();
  }
});

// Rewritten for AC89 (a) (specs/S-001.md:7823-7852, the table's state 5; AC80, changed, :6503-6506): once the reads fail
// after a success, the two counts' small line gives way to "Can't read <project> since HH:MM" above the lanes; the held
// question's and the recorded answer's lines still stay, as round 3's finding 1 has them.
test('AC77 + AC80 (stage 1a\'s build review, round 3, finding 1), rewritten for AC89 (a): filtered to the project, the "Being asked in your session" and "Your answer is being recorded" lines stay when its reads then fail; the two counts give way to "Can\'t read <project> since HH:MM" above the lanes; the held question\'s fold keeps "Answer it here instead"', async () => {
  const cases = [
    ['ql:asking', 'Being asked in your session: 1', { [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION }, [], {}],
    ['ql:answerRecording', 'Your answer is being recorded: 1', { [QPATH]: ASKED_Q, [SESSION_PATH]: REAL_SESSION, '.github/workflows/asks-merge.yml': 'name: asks-merge\n' },
      [answerPr(90)], { repo: { prFiles: { 90: ADDS_ANSWER } } }],
  ];
  for (const [key, words, files, pulls, extra] of cases) {
    const rs = repos(files, pulls, extra);
    const app = await loadSandbox({ config: CONFIG, repos: rs, hash: '#/waiting/Service-Desk', now: RAISED_MS + 10 * MIN });
    const line = () => sbFindAll(app.view, (e) => e.dataset && e.dataset.k === key)[0] || null;
    const small = () => (byClass(app.view, 'v2-qsmall')[0] || { textContent: null }).textContent;
    try {
      await app.advance(1000);
      await app.advance(60_000);
      assert.equal(line().textContent, words, `${key}: read`);
      assert.equal(small(), 'With the agents: 0 · Being recorded by the automatic job: 0');
      rs['Service-Desk'].fail = { kind: 'network' };
      await app.advance(60_000);
      await app.advance(60_000);
      assert.equal(small(), null, `${key}: no counts while it can't be read`);
      assert.match(byClass(app.view, 'v2-board')[0].textContent, /Can't read Service-Desk since \d\d:\d\d: network error/, `${key}: said above the lanes`);
      assert.ok(line(), `${key}: the line stays while the project can't be read`);
      assert.equal(line().textContent, words);
      if (key === 'ql:asking') {
        await app.tap(line());
        const fold = sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'fold:asking')[0];
        assert.ok(fold && fold.textContent.includes(HELD_WORDS));
        assert.ok(sbFindAll(fold, (e) => e.tag === 'button' && e.textContent === 'Answer it here instead').length, '"Answer it here instead" stays');
      } else {
        await app.tap(line());
        assert.ok(sbFindAll(app.view, (e) => e.dataset && e.dataset.k === 'fold:answerRecording')[0].textContent.includes(RECORDING_WORDS));
      }
    } finally {
      app.restore();
    }
  }
});
