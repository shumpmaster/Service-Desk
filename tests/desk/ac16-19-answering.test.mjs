// Answering cards and owner questions from the desk (AC16–AC19) through J3's prefilled links: the
// plan the desk offers, its fallbacks (AC17 copy, AC18 web-commit message, AC19 v2.5 copy-only),
// "already answered", and the page's real answer box under a fake DOM.
// ac-test: S-001/AC16 ac-test: S-001/AC17 ac-test: S-001/AC18 ac-test: S-001/AC19
// join-test: S-001/J3
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  answerPlan, cardAnswerContent, questionAnswerContent, v25RulingText, newFileUrl, HOLD_NO_ANSWER, mergeNoAnswer,
} from '../../src/lib/links.js';
import { buildModel, parseRecord } from '../../src/lib/model.js';
import { fixture, CONFIG, SD, POOM } from './helpers.mjs';
import { loadApp, find, findAll } from './page-harness.mjs';
import { repo } from './fake-desk.mjs';

const CAP = CONFIG.linkCap;
const card = (over = {}) => ({ kind: 'card', answerPath: 'decisions/P-001/dor-4.md', item: 'P-001', options: ['build', 'stop'], answered: null, ...over });
const question = (over = {}) => ({ kind: 'question', name: 'Q-005-sources', options: ['A', 'B'], answered: null, ...over });

test('AC16 + J3: picking an option opens GitHub\'s new-file page for the answer path with J3\'s content — the spec\'s example', () => {
  assert.deepEqual(answerPlan(SD, CAP, card(), null, ''), { offer: 'choose' });
  assert.deepEqual(answerPlan(SD, CAP, card(), 'not-an-option', ''), { offer: 'choose' }, 'only the card\'s own words');
  const p = answerPlan(SD, CAP, card(), 'build', '');
  assert.equal(p.offer, 'link');
  assert.equal(p.url, 'https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2FP-001%2Fdor-4.md&value=Decision%3A%20build%0A');
  assert.equal(p.copy, null);
  assert.equal(p.warning, null);
  assert.equal(p.path, 'decisions/P-001/dor-4.md');
  assert.equal(p.content, 'Decision: build\n');
});

test('J3: a note follows a blank line; &, #, %, emoji and newlines survive the round trip', () => {
  const note = 'Ship it & see #3 — 100% \u{1F680}\r\nsecond line\n\n';
  assert.equal(cardAnswerContent('build', note), 'Decision: build\n\nShip it & see #3 — 100% \u{1F680}\nsecond line\n');
  assert.equal(cardAnswerContent('build', '   \n'), 'Decision: build\n', 'a blank note is no note');
  const p = answerPlan(SD, CAP, card(), 'build', note);
  const u = new URL(p.url);
  assert.equal(u.searchParams.get('value'), cardAnswerContent('build', note));
  assert.equal(u.searchParams.get('filename'), 'decisions/P-001/dor-4.md');
  // A default branch that is not main comes from J7.
  assert.ok(answerPlan({ ...SD, defaultBranch: 'trunk' }, CAP, card(), 'build', '').url.startsWith('https://github.com/shumpmaster/Service-Desk/new/trunk?'));
});

test('AC16: an answer file that already exists shows "already answered: <verdict>" and offers no link', () => {
  const p = answerPlan(SD, CAP, card({ answered: { verdict: 're-scope' } }), 'build', '');
  assert.deepEqual(p, { offer: 'none', words: 'already answered: re-scope' });
  // The model says which cards are answered, and with what: from the log, or from the answer file.
  const tree = new Map([['queue/P-001-stop-6.md', { sha: '1'.repeat(40) }], ['decisions/P-001/stop-6.md', { sha: '2'.repeat(40) }],
    ['queue/P-001-dor-fail-2.md', { sha: '3'.repeat(40) }], ['decisions/P-001/dor-fail-2.md', { sha: '4'.repeat(40) }],
    ['dispatch-log/2026-10.jsonl', { sha: '5'.repeat(40) }]]);
  const records = new Map([
    ['dispatch-log/2026-10.jsonl', parseRecord('log', fixture('service-desk/dispatch-log/2026-10.jsonl'), 'dispatch-log/2026-10.jsonl')],
    ['decisions/P-001/dor-fail-2.md', parseRecord('answer', fixture('service-desk/decisions/P-001/dor-fail-2.md'))],
  ]);
  const m = buildModel({ project: SD, config: CONFIG, tree, records, now: new Date('2026-10-07T12:00:00Z'), pullPages: [], checkPages: [] });
  assert.equal(m.answeredCards['queue/P-001-stop-6.md'].verdict, 're-scope');
  assert.ok(m.answeredCards['queue/P-001-dor-fail-2.md'].verdict);
  assert.ok(!m.flagged.some((f) => f.kind === 'card'));
});

test('AC17: a link longer than linkCap, or contentPrefill false, shows the answer text with "Copy" and fills only the file name', () => {
  const long = answerPlan(SD, CAP, card(), 'build', 'x'.repeat(CAP));
  assert.equal(long.offer, 'link');
  assert.equal(long.url, 'https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2FP-001%2Fdor-4.md');
  assert.equal(long.copy, cardAnswerContent('build', 'x'.repeat(CAP)));
  assert.match(long.words, /copy it/);
  // Just under the cap still prefills; just over doesn't.
  const fits = (n) => answerPlan(SD, CAP, card(), 'build', 'y'.repeat(n)).copy === null;
  let n = 0;
  while (fits(n + 1)) n++;
  assert.ok(newFileUrl(SD, 'decisions/P-001/dor-4.md', cardAnswerContent('build', 'y'.repeat(n))).length <= CAP);
  assert.ok(newFileUrl(SD, 'decisions/P-001/dor-4.md', cardAnswerContent('build', 'y'.repeat(n + 1))).length > CAP);
  const off = answerPlan({ ...SD, contentPrefill: false }, CAP, card(), 'build', '');
  assert.equal(off.url, 'https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2FP-001%2Fdor-4.md');
  assert.equal(off.copy, 'Decision: build\n');
  // Questions too.
  assert.equal(answerPlan({ ...SD, contentPrefill: false }, CAP, question(), 'A', '').copy, questionAnswerContent('A', 'Q-005-sources', ''));
});

test('AC18: webCommitsToDefault false — the desk says so before the link, and the link is J3\'s, unchanged', () => {
  const closed = { ...SD, webCommitsToDefault: false };
  const p = answerPlan(closed, CAP, card(), 'build', '');
  assert.equal(p.warning, "This repository doesn't take commits to main from the web. On GitHub, choose 'Create a new branch' and then open the pull request GitHub offers; the card stays flagged until that pull request is merged.");
  assert.equal(p.url, answerPlan(SD, CAP, card(), 'build', '').url, 'the same URL: the desk creates no branch and opens no PR');
  assert.match(answerPlan(closed, CAP, question(), 'A', '').warning, /the question stays flagged/);
  assert.equal(answerPlan(SD, CAP, card(), 'build', '').warning, null);
});

test('AC19 + J3: a v3 owner question — decisions/questions/<name>.md with Ruling, Question and the note; the spec\'s example', () => {
  const p = answerPlan(SD, CAP, question(), 'A', '');
  assert.equal(p.url, 'https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2Fquestions%2FQ-005-sources.md&value=Ruling%3A%20A%0A%0AQuestion%3A%20questions%2FQ-005-sources.md%0A');
  assert.equal(questionAnswerContent('B', 'Q-005-sources', 'because'), 'Ruling: B\n\nQuestion: questions/Q-005-sources.md\n\nbecause\n');
  assert.deepEqual(answerPlan(SD, CAP, question({ answered: { verdict: 'A' } }), 'A', ''), { offer: 'none', words: 'already answered: A' });
});

test('AC19: a v2.5 question — the ruling text with "Copy" and the ledger note; no link at all', () => {
  const p = answerPlan(POOM, CAP, question(), 'B', 'see L-0124');
  assert.deepEqual(p, { offer: 'copy', copy: 'Ruling: B\n\nsee L-0124\n', words: "this repository records rulings in its ledger; give this to your session" });
  assert.equal(v25RulingText('A', ''), 'Ruling: A\n');
  assert.equal('url' in p, false);
});

test('AC46/AC47 in the answer plan: hold and merge cards are never offered an answer link', () => {
  assert.deepEqual(answerPlan(SD, CAP, { kind: 'hold' }, 'x', ''), { offer: 'none', words: HOLD_NO_ANSWER });
  assert.equal(HOLD_NO_ANSWER, 'No answer needed: fix or re-run the governance run; this clears once it passes.');
  assert.deepEqual(answerPlan(SD, CAP, { kind: 'merge', item: 'P-002' }, 'x', ''), { offer: 'none', words: mergeNoAnswer('P-002') });
  assert.equal(mergeNoAnswer('P-002'), 'No answer needed: merge item/P-002 by hand, or change the item and let the merge gate try again.');
});

// ---------------------------------------------------------------------------
// The page's answer box (src/public/app.js) under the fake DOM.

function sdRepos(extra = {}) {
  return {
    'Service-Desk': repo({
      'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
      'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
      'queue/P-001-stop-6.md': fixture('service-desk/queue/P-001-stop-6.md'),
      'questions/Q-005-sources.md': fixture('service-desk/questions/Q-005-sources.md'),
      ...extra,
    }, [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'),
      'questions/Q-020-x.md': fixture('service-desk/questions/Q-005-sources.md') }, [], []),
  };
}

test('Page AC16: the card view offers the card\'s options; picking one and typing a note gives J3\'s link, kept across re-renders', async () => {
  const app = await loadApp({ hash: '#/p/Service-Desk/card/queue%2FP-001-stop-6.md', repos: sdRepos() });
  try {
    await app.advance(1000);
    const radios = findAll(app.els.view, (e) => e.tag === 'input' && e.attrs.type === 'radio');
    assert.deepEqual(radios.map((r) => r.attrs.value), ['re-specify', 'criteria-wrong', 'confirm', 're-scope', 'drop']);
    assert.equal(find(app.els.view, (e) => e.className === 'go'), null, 'no link before an option is picked');
    const pick = radios.find((r) => r.attrs.value === 're-scope');
    pick.listeners.change[0]();
    const note = find(app.els.view, (e) => e.tag === 'textarea');
    note.value = 'as agreed';
    note.listeners.input[0]();
    const go = find(app.els.view, (e) => e.className === 'go');
    assert.equal(go.attrs.href, answerPlan(SD, CAP,
      { kind: 'card', answerPath: 'decisions/P-001/stop-6.md', options: ['re-scope'] }, 're-scope', 'as agreed').url);
    assert.equal(go.attrs.target, '_blank');
    // The next poll redraws the view; the draft is kept.
    await app.advance(60_000);
    const go2 = find(app.els.view, (e) => e.className === 'go');
    assert.ok(go2 && go2.attrs.href.includes('as%20agreed'));
  } finally {
    app.restore();
  }
});

test('Page AC16: once the answer file is on main the card view says "already answered: <verdict>" and has no link', async () => {
  const repos = sdRepos();
  const app = await loadApp({ hash: '#/p/Service-Desk/card/queue%2FP-001-stop-6.md', repos });
  try {
    await app.advance(1000);
    repos['Service-Desk'].commit({ 'decisions/P-001/stop-6.md': 'Decision: re-scope\n' });
    await app.advance(60_000);
    const text = app.els.view.textContent;
    assert.match(text, /already answered: re-scope/, 'the verdict the log records for this answer');
    assert.equal(find(app.els.view, (e) => e.className === 'go'), null);
    assert.equal(findAll(app.els.view, (e) => e.tag === 'input').length, 0);
  } finally {
    app.restore();
  }
});

test('Page AC19: a v2.5 question view offers the ruling to copy, with the ledger note, and no link', async () => {
  const app = await loadApp({ hash: '#/p/Personal-Org-Operating-Model/q/Q-020-x', repos: sdRepos() });
  try {
    await app.advance(1000);
    const radios = findAll(app.els.view, (e) => e.tag === 'input' && e.attrs.type === 'radio');
    assert.deepEqual(radios.map((r) => r.attrs.value), ['A', 'B']);
    radios[0].listeners.change[0]();
    assert.match(app.els.view.textContent, /this repository records rulings in its ledger; give this to your session/);
    assert.ok(find(app.els.view, (e) => e.tag === 'pre' && e.textContent === 'Ruling: A\n'));
    assert.ok(find(app.els.view, (e) => e.tag === 'button' && e.textContent === 'Copy'));
    assert.equal(find(app.els.view, (e) => e.className === 'go'), null);
  } finally {
    app.restore();
  }
});
