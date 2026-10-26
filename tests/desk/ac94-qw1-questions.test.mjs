// ac-test: S-001/AC94 — QW1 of "After the questions request": the "Questions for you" section at the top of Waiting
// (specs/S-001.md, AC94; the owner's "Top of Waiting" and "One tap, then commit"; the approved picture,
// docs/design/builds/m3g-picture/, "Approve (Recommended)", decisions/questions/P-001-m3g-picture.md, A; the first three
// questions with their choices, P-001-m3g-length, B; each question's age with the grey line and the red quiet line both
// kept, P-001-m3g-age-double, A; the sixteen readings standing, P-001-m3g-readings, A), with the changed parts of AC52,
// AC77, AC80, AC89 (j) and AC91 (f) that QW1's row names.
// ac-test: S-001/AC80 ac-test: S-001/AC77 ac-test: S-001/AC52 ac-test: S-001/AC89 ac-test: S-001/AC91
//
// The pure cases are board.js's (src/lib/board.js, with its src/public/lib copy): boardView's section, its lanes and counts,
// waitLaneEmpty, sectionMissingWords, heldCard and sectionMeta. The screen cases are the sandbox's own code under the fake
// DOM, on tests/desk/qw1-fixtures.mjs's states (`kindsState`, every kind of question; `busiestState`, md-extremes/ with five
// made-up questions of four to six choices, one held and one kicked back) and tests/desk/glance-fixtures.mjs's (Service-Desk's
// records at 77bfeae, real, with made-up projects and failures), each made-up part labelled NOT real in
// tests/desk/fixtures/README.md. The suite has no browser, so each look is the cascade of the page's own stylesheets over
// what it drew (tests/desk/css-cascade.mjs), in light and dark, at 360 and 414 px; the stage's pull request carries the
// Chromium captures (`qw1-`, tests/desk/tools/glance-shots.mjs). This file holds QW1's page loads, apart from
// ac88-dark.test.mjs (the suite's memory: each file runs in its own process).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, CONFIG } from './helpers.mjs';
import { repo, pr, BAD_PR, gitSha } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, El0 } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { v3 } from './sandbox-fixtures.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { boardView, noMarks, waitLaneEmpty, sectionMissingWords, heldCard, sectionMeta, isNewCard, SECTION_WORDS, SECTION_CHOICES_SHOWN, WORDS, ONE_WORDS,
  UNREAD_WORDS, oneProjectView, HOLD_MS } from '../../src/lib/board.js';
import * as PUBLIC_BOARD from '../../src/public/lib/board.js';
import { V25_RULING_NOTE } from '../../src/lib/links.js';
import { v25Ruling } from '../../src/lib/sheets.js';
import { quietState, orderState, noneDrawnState, cantShowState, cantShowLastState, failedHeldState, signedOutMixedState, MIX_PROJECT, SD, POOM } from './glance-fixtures.mjs';
import { kindsState, busiestState, qFile, qid, K, KINDS, LEDGER, QPATH, HELD_PATH, Q_HELD, SID, NOW, openFolds } from './qw1-fixtures.mjs';

const H = 3600e3;
const MIN = 60e3;
const TZ = CONFIG.ownerTimeZone;
const enc = encodeURIComponent;
const THEMES = ['light', 'dark'];
const WIDTHS = [360, 414];
const INK = { light: { ink: '#18191c', ink2: '#5c5f66', line: '#e7e7ea', bg: '#ffffff', card: '#fbfbfb' }, dark: { ink: '#ecedef', ink2: '#a2a5ac', line: '#26282c', bg: '#0f1012', card: '#17181b' } };
const RULES = (() => {
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  return [...a, ...b];
})();
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');
/** Each drawn element's cascaded look in a theme and at a width: el → { node, colour, size, weight, decl(prop), raw(prop) }. */
function looks(app, theme, width = 360) {
  const root = document.documentElement;
  const attrs = { ...(root.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: root.className, attrs }), RULES, { scheme: 'light', width, reducedMotion: false });
  const out = new Map();
  for (const n of nodes(tree)) {
    if (!n.el) continue;
    out.set(n.el, { node: n, colour: plain(n.style.get('color')).trim().toLowerCase(), size: plain(n.style.get('font-size')), weight: plain(n.style.get('font-weight')),
      decl: (p) => plain(n.declared.get(p)).trim(), raw: (p) => String(n.declared.get(p) || '') });
  }
  return out;
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const section = (app) => keyed(app, 'qsec');
const qcards = (app) => byClass(section(app), 'v2-qcard');
const qcard = (app, id) => findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === id && / v2-qcard /.test(` ${e.className} `))[0] || null;
const lane = (app, k) => keyed(app, `lane:${k}`);
const laneEmpty = (app) => (byClass(lane(app, 'wait'), 'v2-empty')[0] || { textContent: null }).textContent;
const sheet = (app) => byClass(app.view, 'v2-sheet')[0] || null;
const badge = (app) => { const b = byClass(app.view, 'v2-badge')[0]; return b ? Number(b.children[0].textContent) : 0; };
const headCount = (app) => Number(byClass(keyed(app, 'qhead'), 'v2-lc')[0].textContent);
const newFileLinks = (root) => findAll(root, (e) => e.tag === 'a' && /\/new\/main\?/.test(e.attrs.href || ''));
const choiceLinks = (root) => byClass(root, 'v2-abtn').filter((a) => a.tag === 'a' && /^Answer [A-Z] ↗$/.test(a.textContent));
const seen = (looked = NOW + H, extra = {}) => memStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: looked }), ...extra });
const wordsKey = (id, n = 1) => `${id}#${n}`;
const savedWords = (map) => ({ 'desk-sheet-words-v1': JSON.stringify({ v: 1, words: Object.fromEntries(Object.entries(map).map(([k, text]) => [k, { text, at: NOW - MIN }])) }) });
async function open(setup, { hash = '#/waiting', store = seen(), globals = {}, win = {}, polls = 1 } = {}) {
  const app = await loadSandbox({ ...setup, hash, now: NOW, store, globals, win });
  await app.advance(1000);
  for (let i = 0; i < polls; i++) await app.advance(POLL_MS);
  return app;
}
/** The sheet's own link for a choice, the section open under it: its box's button in the sheet. */
async function sheetLinks(app, id) {
  const back = app.loc.hash;
  await app.go(`#/waiting/card/${enc(id)}`);
  const out = Object.fromEntries(choiceLinks(sheet(app)).map((a) => [a.textContent, a.attrs.href]));
  await app.go(back);
  return out;
}
const sectionLinks = (app, id) => Object.fromEntries(choiceLinks(qcard(app, id)).map((a) => [a.textContent, a.attrs.href]));
const decodeValue = (href) => decodeURIComponent(/[?&]value=([^&]*)$/.exec(href)[1]);

// ---------------------------------------------------------------------------
// The pure cases

const P = { name: 'Alpha', repo: 'shumpmaster/Alpha', defaultBranch: 'main', model: 'v3' };
const P2 = { name: 'Beta', repo: 'shumpmaster/Beta', defaultBranch: 'main', model: 'v3' };
const qc = (project, name, raisedAt) => ({ id: `${project}|question|questions/${name}.md`, key: `q:${name}`, project, kind: 'question', kindWord: 'Question', title: name, name, raisedAt, step: { id: 'answer' }, meta: [] });
const prc = (project, n, raisedAt) => ({ id: `${project}|pr|${n}`, key: `pr:${n}`, project, kind: 'pr', kindWord: 'Pull request', title: `#${n}`, number: n, raisedAt, step: { id: 'open' }, meta: [`#${n}`] });
const held = (name, raisedAt = NOW - H) => ({ name, path: `questions/${name}.md`, title: `${name}, held`, parsed: null, raisedAt: new Date(raisedAt), link: null, state: 'held' });
const entry = (project, cards, { asking = [], read = { ok: true } } = {}) => ({ project, cards, agents: [], read, recording: [], asking, answerRecording: [], recordRows: [], seenRows: [] });
const kickedMarks = (...ids) => ({ v: 1, marks: Object.fromEntries(ids.map((id) => [id, { project: id.split('|')[0], step: 'answer', head: null, at: NOW - 9 * MIN, title: id, kicked: { at: NOW - 3 * MIN, reason: 'made up' },
  prevKick: null, confirmedAt: null, number: null, kind: 'question', name: null }])) });

test('AC94 (pure, boardView): every question leaves "Waiting on you" and the Kicked back strip for the section, grouped by project in J7\'s order, a kicked-back one with its lane; a held question at the head of its group (until QW3); the lanes count what they hold; every count and the badge as before', () => {
  const cards = [prc('Alpha', 7, NOW - 9 * H), qc('Alpha', 'a-late', NOW - H), qc('Alpha', 'a-early', NOW - 5 * H), qc('Alpha', 'a-kicked', NOW - 2 * H), qc('Alpha', 'a-none', null)];
  const v = boardView({ projects: [entry(P, cards, { asking: [held('a-held')] }), entry(P2, [qc('Beta', 'b-one', NOW - 3 * H), prc('Beta', 9, NOW - H)])],
    marks: kickedMarks('Alpha|question|questions/a-kicked.md'), only: null, nowMs: NOW, tz: TZ });
  const wait = v.lanes.find((l) => l.key === 'wait');
  assert.deepEqual(wait.groups.map((g) => [g.project, g.rows.map((c) => c.id)]), [['Alpha', ['Alpha|pr|7']], ['Beta', ['Beta|pr|9']]], 'the lanes hold no question');
  assert.equal(wait.count, 2, 'the lane counts its own cards');
  assert.deepEqual(v.strip, [], 'nor the strip');
  assert.deepEqual(v.questions.groups.map((g) => [g.project, g.held.map((c) => c.id), g.rows.map((c) => [c.id, c.lane]), g.count]), [
    ['Alpha', ['Alpha|question|questions/a-held.md'], [['Alpha|question|questions/a-early.md', 'wait'], ['Alpha|question|questions/a-kicked.md', 'kick'], ['Alpha|question|questions/a-late.md', 'wait'], ['Alpha|question|questions/a-none.md', 'wait']], 4],
    ['Beta', [], [['Beta|question|questions/b-one.md', 'wait']], 1],
  ], 'J7\'s order; in each group the held one first, then AC80\'s lane order (the earliest raised first, none last), the kicked-back one by its own raised time');
  assert.deepEqual(v.questions.order.map((c) => c.name), ['a-held', 'a-early', 'a-kicked', 'a-late', 'a-none', 'b-one'], 'the order it draws them in');
  assert.deepEqual([v.questions.count, v.questions.held], [5, 1], 'the head\'s counts: the counted questions, the held ones apart');
  assert.deepEqual([...v.counts].map(([k, c]) => [k, c.waiting, c.kicked]), [['Alpha', 4, 1], ['Beta', 2, 0]], 'counted exactly as before');
  assert.equal(v.badge, 7, 'the badge: the section\'s, the strip\'s and the lane\'s sum, the held one not counted');
  assert.deepEqual(v.waits.find((l) => l.key === 'wait').groups.map((g) => g.rows.length), [4, 2], 'Home, the page and Plan read the cards as before');
  assert.deepEqual(v.quiet.asking, [], 'the quiet line "Being asked in your session" lists none');
  // One project shown: only its questions.
  const one = boardView({ projects: [entry(P, cards), entry(P2, [qc('Beta', 'b-one', NOW - 3 * H)])], marks: noMarks(), only: 'Beta', nowMs: NOW, tz: TZ });
  assert.deepEqual(one.questions.order.map((c) => c.id), ['Beta|question|questions/b-one.md']);
  // "Nothing waiting: <project>" only with nothing in the section, the strip or any lane: a held question is something.
  const nw = boardView({ projects: [entry(P, [], { asking: [held('x')] }), entry(P2, [])], marks: noMarks(), only: null, nowMs: NOW, tz: TZ });
  assert.deepEqual(nw.nothingWaiting, ['Beta']);
  assert.equal(nw.badge, 0, 'a held question counted nowhere');
});

test('AC94 (pure): an empty "Waiting on you" — "Nothing here; your questions are above" while the section holds questions; one project shown, states 3 and 4 and state 5 so, every other word for the unknown with nothing added', () => {
  const above = (w) => `${w}; ${SECTION_WORDS.above}`;
  assert.equal(SECTION_WORDS.above, 'your questions are above');
  assert.equal(waitLaneEmpty({ questions: true }), 'Nothing here; your questions are above');
  assert.equal(waitLaneEmpty({ questions: false }), WORDS.empty);
  for (const u of ['pending', 'cant', 'cant-read-or-show']) {
    for (const q of [false, true]) assert.equal(waitLaneEmpty({ unread: u, questions: q }), { pending: UNREAD_WORDS.pending, cant: UNREAD_WORDS.cant, 'cant-read-or-show': UNREAD_WORDS.cantReadOrShow }[u], `${u}: nothing added`);
  }
  const one = (read, last, cantShow = false) => oneProjectView({ name: 'Alpha', read, lastSuccessAt: last, tz: TZ, cantShow });
  const states = [
    [one({ read: 'checking' }, null), 'Not read yet', 'Not read yet'],
    [one({ read: 'cant-read', since: NOW - H }, null), "Can't read", "Can't read"],
    [one({ read: 'ok' }, NOW - MIN), 'Nothing here', above('Nothing here')],
    [one({ read: 'checking' }, NOW - MIN), 'Nothing here', above('Nothing here')],
    [one({ read: 'cant-read', since: NOW - H }, NOW - 2 * H), 'Nothing here when last read', above('Nothing here when last read')],
    [one({ read: 'ok' }, NOW - MIN, true), "Can't show", "Can't show"],
    [one({ read: 'cant-read', since: NOW - H }, NOW - 2 * H, true), "Can't show when last read", "Can't show when last read"],
  ];
  for (const [o, none, withQ] of states) {
    assert.equal(waitLaneEmpty({ one: o, questions: false }), none, `state ${o.state}: as built`);
    assert.equal(waitLaneEmpty({ one: o, questions: true }), withQ, `state ${o.state}: with questions`);
  }
  assert.equal(ONE_WORDS.whenLast, 'Nothing here when last read');
});

test('AC94 (pure): the section\'s grey line, G7b\'s form and G8c\'s words — "<project> not read since HH:MM", "not read in this opening", "not shown"; and a held question as the section draws it, and its meta line with its age or "wait not recorded"', () => {
  assert.equal(sectionMissingWords({ project: 'Alpha', since: Date.parse('2026-10-14T15:34:00Z') }, 'UTC'), 'Alpha not read since 15:34, its new questions may be missing');
  assert.equal(sectionMissingWords({ project: 'Alpha', since: NOW, opening: true }, TZ), 'Alpha not read in this opening, its new questions may be missing');
  assert.equal(sectionMissingWords({ project: 'Alpha', show: true }, TZ), 'Alpha not shown, its questions may be missing');
  const row = { name: 'n-x', path: 'questions/n-x.md', title: 'A made-up held question', parsed: null, raisedAt: new Date(NOW - 2 * H), link: 'x' };
  const c = heldCard(P, row, TZ, NOW);
  assert.deepEqual([c.id, c.key, c.kind, c.held, c.raisedAt, c.flag.kind, c.flag.question, c.v25], ['Alpha|question|questions/n-x.md', 'q:n-x', 'question', true, NOW - 2 * H, 'question', row, false]);
  assert.equal(heldCard({ ...P, model: 'v2.5' }, row, TZ, NOW).v25, true);
  assert.equal(sectionMeta(c, NOW), '2 h 0 m');
  assert.equal(sectionMeta({ ...c, meta: ['M3G'] }, NOW), 'M3G · 2 h 0 m');
  assert.equal(sectionMeta({ ...c, raisedAt: null }, NOW), 'wait not recorded', 'P-001-m3g-age-double, A: its age, or "wait not recorded"');
  assert.equal(sectionMeta({ ...c, meta: ['M3G'], raisedAt: null }, NOW), 'M3G · wait not recorded');
  assert.deepEqual([isNewCard({ raisedAt: NOW - H }, 'section', NOW - 2 * H), isNewCard({ raisedAt: NOW - H }, 'section', NOW)], [true, false], '"new" in the section by the lane\'s rule');
  assert.equal(SECTION_CHOICES_SHOWN, 3);
  // The page's copy is the same module (src/public/lib/, kept in step by tools/build.mjs).
  assert.equal(PUBLIC_BOARD.waitLaneEmpty({ questions: true }), waitLaneEmpty({ questions: true }));
  assert.equal(PUBLIC_BOARD.sectionMissingWords({ project: 'A', show: true }, TZ), sectionMissingWords({ project: 'A', show: true }, TZ));
});

// ---------------------------------------------------------------------------
// One place to answer: the links are the sheet's

test('AC94: each section link equal, character for character, to its sheet\'s — a lettered question with and without a `Milestone:` line, with no saved words and with saved words; words typed in the section\'s fold seen in the sheet\'s box, and the reverse', async () => {
  const app = await open(kindsState());
  try {
    for (const path of [K.lettered, K.bare]) {
      const id = qid(KINDS, path);
      const mine = sectionLinks(app, id);
      assert.ok(Object.keys(mine).length >= 2, `${path}: its choices shown`);
      assert.deepEqual(mine, await sheetLinks(app, id), `${path}: the sheet's, with no saved words`);
    }
    // AC53's text, the `Milestone:` line where the file has one.
    const a = decodeValue(sectionLinks(app, qid(KINDS, K.lettered))['Answer A ↗']);
    assert.equal(a.split('\n').slice(0, 5).join('\n'), `Ruling: A\n\nQuestion: ${K.lettered}\nMilestone: M3G\n`);
    assert.ok(!decodeValue(sectionLinks(app, qid(KINDS, K.bare))['Answer A ↗']).includes('Milestone:'), 'none where the file has none');
    // Words typed in the section's fold: the sheet's box shows them, and both links carry them.
    const id = qid(KINDS, K.lettered);
    await app.tap(keyed(app, `fold:qwords:${id}`));
    const box = findAll(qcard(app, id), (e) => e.tag === 'textarea')[0];
    assert.equal(box.attrs['aria-label'], 'Your own words, if you want them in the answer', 'the sheet\'s box');
    box.value = 'Made-up words typed in the section, NOT real.';
    box.dispatch('input');
    await app.flush();
    const typed = sectionLinks(app, id);
    assert.ok(decodeValue(typed['Answer B ↗']).includes('Made-up words typed in the section, NOT real.'));
    assert.deepEqual(typed, await sheetLinks(app, id), 'the sheet\'s, with the saved words');
    await app.go(`#/waiting/card/${enc(id)}`);
    const sheetBox = findAll(sheet(app), (e) => e.tag === 'textarea')[0];
    assert.equal(sheetBox.value, 'Made-up words typed in the section, NOT real.', 'seen in the sheet');
    sheetBox.value = 'Made-up words typed in the sheet, NOT real.';
    sheetBox.dispatch('input');
    await app.flush();
    await app.go('#/waiting');
    assert.equal(findAll(qcard(app, id), (e) => e.tag === 'textarea')[0].value, 'Made-up words typed in the sheet, NOT real.', 'and the reverse');
    assert.ok(decodeValue(sectionLinks(app, id)['Answer A ↗']).includes('Made-up words typed in the sheet, NOT real.'));
    assert.deepEqual(sectionLinks(app, id), await sheetLinks(app, id));
  } finally {
    app.restore();
  }
  // Words a device kept (`desk-sheet-words-v1`), from the first drawing.
  const kept = await open(kindsState(), { store: seen(NOW + H, savedWords({ [wordsKey(qid(KINDS, K.bare))]: 'Kept made-up words, NOT real.' })) });
  try {
    const id = qid(KINDS, K.bare);
    assert.ok(decodeValue(sectionLinks(kept, id)['Answer C ↗']).includes('Kept made-up words, NOT real.'));
    assert.deepEqual(sectionLinks(kept, id), await sheetLinks(kept, id));
  } finally {
    kept.restore();
  }
});

test('AC94 (C, (g)): a v2.5 question\'s "Copy answer <letter>" boxes copy the sheet\'s text, with and without saved words, "Recommended" on the box its RECOMMENDATION: line names, AC19\'s note once under them; one with no letters, "Copy the answer"; no link opens', async () => {
  const copied = [];
  const navigator = { clipboard: { writeText: async (t) => { copied.push(t); } } };
  const app = await open(kindsState(), { globals: { navigator }, store: seen(NOW + H, savedWords({ [wordsKey(qid(LEDGER, K.v25))]: 'Made-up words, NOT real.' })) });
  try {
    await openFolds(app);
    const card = qcard(app, qid(LEDGER, K.v25));
    const opts = byClass(card, 'v2-opt');
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-abtn')[0].textContent), ['Copy answer A', 'Copy answer B']);
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-rec').length), [0, 1], '"Recommended" on B, as its RECOMMENDATION: line starts');
    assert.deepEqual(byClass(opts[1], 'v2-rec').map((r) => r.textContent), ['Recommended']);
    assert.equal(byClass(card, 'v2-abtn')[0].attrs['aria-label'], 'Copy answer A: This sprint.', 'its letter and its words for assistive technology');
    assert.equal(newFileLinks(card).length, 0, 'no link opens');
    assert.deepEqual(byClass(card, 'v2-small').map((p) => p.textContent), [V25_RULING_NOTE], 'AC19\'s note, once, under the choices');
    for (const [i, l] of [[0, 'A'], [1, 'B']]) {
      await app.tap(byClass(opts[i], 'v2-abtn')[0]);
      assert.equal(copied[copied.length - 1], v25Ruling(l, 'Made-up words, NOT real.'), `${l}: the sheet's text, the saved words in it`);
    }
    // The sheet's own button copies the same text.
    await app.go(`#/waiting/card/${enc(qid(LEDGER, K.v25))}`);
    await app.tap(byClass(sheet(app), 'v2-abtn').find((b) => b.textContent === 'Copy answer B'));
    assert.equal(copied[copied.length - 1], v25Ruling('B', 'Made-up words, NOT real.'), 'the sheet\'s');
    await app.go('#/waiting');
    const plainQ = qcard(app, qid(LEDGER, K.v25none));
    assert.deepEqual(byClass(plainQ, 'v2-abtn').map((b) => b.textContent), ['Copy the answer'], 'no letters: one "Copy the answer"');
    await app.tap(byClass(plainQ, 'v2-abtn')[0]);
    assert.equal(copied[copied.length - 1], v25Ruling('', ''));
  } finally {
    app.restore();
  }
});

test('AC94 (C, (h)): a numbered and a can\'t-split question show their parts and choices as text over one "Answer in its sheet ›" that opens their sheet; one with no OPTIONS: block, "Its choices are in its sheet"; no new-file link opens from them', async () => {
  const app = await open(kindsState());
  try {
    await openFolds(app);
    const num = qcard(app, qid(KINDS, K.numbered));
    assert.deepEqual(byClass(num, 'v2-opt').map((o) => o.textContent), ['1. Which day? A. Monday · B. FridayRecommended B', '2. Which hour? A. 08:00 · B. 18:00Recommended A'],
      'each part\'s number and words, with its recommendation, as its sheet\'s numbered boxes');
    assert.equal(findAll(byClass(num, 'v2-opts')[0], (e) => e.tag === 'textarea').length, 0, 'no box for words among them');
    const split = qcard(app, qid(KINDS, K.split));
    assert.deepEqual(byClass(split, 'v2-body').map((p) => p.textContent), ['A. Keep the old form.', '2. Move it to a sheet.', '- or ask me later'], 'its OPTIONS: lines as the file writes them');
    const none = qcard(app, qid(KINDS, K.none));
    assert.deepEqual(byClass(none, 'v2-body').map((p) => p.textContent), [SECTION_WORDS.choicesInSheet]);
    for (const [c, path, sheetHas] of [[num, K.numbered, 'Your answer to 1'], [split, K.split, "This question file couldn't be split"], [none, K.none, "This question file couldn't be split"]]) {
      const btn = byClass(c, 'v2-abtn');
      assert.deepEqual(btn.map((b) => [b.tag, b.textContent]), [['a', 'Answer in its sheet ›']], `${path}: one button`);
      assert.equal(btn[0].attrs.href, `#/waiting/card/${enc(qid(KINDS, path))}`, `${path}: it opens its sheet`);
      assert.equal(newFileLinks(c).length, 0, `${path}: no link opens from the section`);
      await app.go(btn[0].attrs.href);
      assert.ok(sheet(app).textContent.includes(sheetHas), `${path}: answered in its sheet as today`);
      await app.go('#/waiting');
    }
  } finally {
    app.restore();
  }
});

test('AC94 (P-001-m3g-length, B): the first three questions in the section\'s order show their choices, the fourth and later "Show choices ›", a fold closed to start that opens them in place — with every project shown and with one', async () => {
  for (const [hash, firstThree] of [['#/waiting', [K.lettered, K.bare, K.numbered]], [`#/waiting/${KINDS}`, [K.lettered, K.bare, K.numbered]]]) {
    const app = await open(kindsState(), { hash });
    try {
      const order = qcards(app).map((c) => c.attrs['data-card']);
      assert.deepEqual(order.slice(0, 3), firstThree.map((p) => qid(KINDS, p)), `${hash}: the section's order, the earliest raised first`);
      for (const [i, c] of qcards(app).entries()) {
        const fold = findAll(c, (e) => e.dataset && /^fold:qchoices:/.test(e.dataset.k || ''))[0];
        const shown = byClass(c, 'v2-opts').length + byClass(c, 'v2-abtn').length > 0;
        if (i < 3) assert.ok(shown && !fold, `${hash}: question ${i + 1} shows its choices, with no fold`);
        else {
          assert.ok(!shown, `${hash}: question ${i + 1} has none showing`);
          assert.deepEqual([fold.textContent, fold.attrs['aria-expanded']], [SECTION_WORDS.showChoices, 'false']);
        }
      }
      if (hash === '#/waiting') assert.equal(order.length, 7, 'every question shown, with no limit');
      // "Show choices ›" opens them in place.
      const fourth = qcards(app)[3];
      await app.tap(findAll(fourth, (e) => e.dataset && /^fold:qchoices:/.test(e.dataset.k || ''))[0]);
      const again = qcard(app, fourth.attrs['data-card']);
      assert.equal(again, fourth, 'in place');
      assert.ok(byClass(again, 'v2-abtn').length > 0, 'its choices open');
      assert.equal(findAll(again, (e) => e.dataset && /^fold:qchoices:/.test(e.dataset.k || ''))[0].attrs['aria-expanded'], 'true');
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// Each question's parts

test('AC94: each question\'s kind line, title, age ("wait not recorded" where none is read), lock or clock line, "Add your own words", "More about it ›" and "Done ✓"; "new" in the section; "Recommended" on its box; each button\'s name its letter and words', async () => {
  const s = kindsState();
  s.repos[KINDS].historyFail = (path) => path === K.none; // made up: its raised time not read (J2's history read failing)
  const app = await open(s, { store: seen(NOW - 20 * H) });
  try {
    const c = qcard(app, qid(KINDS, K.lettered));
    assert.equal(byClass(c, 'v2-kd')[0].textContent, 'Question new', 'raised after "last looked": "new"');
    assert.equal(byClass(c, 'v2-tt')[0].textContent, 'Which colour should a kicked-back card\'s icon take?');
    assert.equal(byClass(c, 'v2-m')[0].textContent, 'M3G · 10 h 1 m', 'its milestone and its age, the board\'s form');
    assert.equal(byClass(qcard(app, qid(KINDS, K.none)), 'v2-m')[0].textContent, SECTION_WORDS.waitNotRecorded);
    assert.equal(byClass(qcard(app, qid(KINDS, K.none)), 'v2-kd')[0].textContent, 'Question', 'none without a raised time');
    const opts = byClass(c, 'v2-opt');
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-rec').length), [1, 0], '"Recommended" on A only, none picked');
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-ol')[0].textContent), ['A. Vermilion, as now', 'B. Grey.'], 'its letter apart, its words');
    assert.deepEqual(byClass(opts[0], 'v2-od').map((x) => x.textContent), ['it still waits on you.'], 'its description under them');
    assert.deepEqual(choiceLinks(c).map((a) => a.attrs['aria-label']), ['Answer A: Vermilion, as now', 'Answer B: Grey.']);
    assert.deepEqual(byClass(c, 'v2-fold').map((f) => f.textContent), [SECTION_WORDS.ownWords]);
    assert.deepEqual(byClass(c, 'v2-step').map((b) => [b.tag, b.textContent]), [['a', 'More about it ›'], ['button', 'Done ✓']]);
    assert.equal(byClass(c, 'v2-step')[0].attrs.href, `#/waiting/card/${enc(qid(KINDS, K.lettered))}`, 'its sheet');
    // A clock where the file settles itself; a lock where it can't be undone (the busiest state).
  } finally {
    app.restore();
  }
  const b = busiestState();
  const busy = await open(b, { store: seen(NOW + H, b.seed) });
  try {
    assert.equal(byClass(qcard(busy, qid('Alpha', QPATH.Alpha)), 'v2-mk')[0].textContent, "Can't be undone");
    assert.match(byClass(qcard(busy, qid('Beta', QPATH.Beta)), 'v2-mk')[0].textContent, /^Settles as A · \w{3} \d\d:\d\d$/);
  } finally {
    busy.restore();
  }
});

test('AC94 (C, (a)): a kicked-back question in the section — "Kicked back · Question" with the kick icon and its reason, not in the strip, still counted; "Done ✓" on it marks it (into Done, confirming), "Undo" brings it back; never dragged from the section', async () => {
  const b = busiestState();
  const app = await open(b, { store: seen(NOW + H, b.seed) });
  try {
    const id = qid('Beta', QPATH.Beta);
    const c = qcard(app, id);
    assert.equal(c.attrs['data-question'], 'kicked');
    assert.equal(byClass(c, 'v2-kd')[0].textContent, 'Kicked back · Question');
    assert.ok(findAll(byClass(c, 'v2-kd')[0], (e) => e.tag === 'svg' && /vi-kick/.test(e.attrs.class)).length, 'the kick icon');
    assert.match(byClass(c, 'v2-why')[0].textContent, /^GitHub /, 'its reason (here, that the reads it waits on are not current yet)');
    assert.ok(!findAll(lane(app, 'kick'), (e) => e.attrs && e.attrs['data-card'] === id).length, 'not in the strip');
    const before = badge(app);
    // A press and hold on it lifts nothing: it is not dragged.
    c.dispatch('pointerdown', { target: byClass(c, 'v2-t')[0], clientX: 10, clientY: 10, pointerType: 'touch' });
    await app.flush();
    await app.advance(HOLD_MS + 50);
    assert.equal(byClass(app.view, 'lifted').length, 0, 'never dragged from the section');
    await app.tap(keyed(app, `qdone:${id}`));
    assert.equal(qcard(app, id), null, 'out of the section');
    assert.ok(byClass(lane(app, 'done'), 'v2-card conf').some((x) => x.textContent.includes('How long should Done keep its cards?')), 'in Done, confirming');
    assert.equal(badge(app), before - 1, 'left the count at once');
    await app.tap(findAll(lane(app, 'done'), (e) => e.tag === 'button' && e.textContent === 'Undo')[0]);
    assert.equal(qcard(app, id).attrs['data-question'], 'kicked', '"Undo": back in the section, kicked back');
    assert.equal(badge(app), before);
  } finally {
    app.restore();
  }
});

test('AC94 + AC95\'s "A held question" (answer 3; until QW3 at the head of its group): held in the section, "Also asked in your session: answer in one place", its choices live, no "Done ✓", its sheet with no "Move to Done"; the head "· 1 being asked in your session", its group counting its counted questions only; no "Being asked in your session" quiet line', async () => {
  const b = busiestState();
  const app = await open(b, { store: seen(NOW + H, b.seed), hash: '#/waiting/Beta' });
  try {
    const id = qid('Beta', HELD_PATH);
    const ids = qcards(app).map((c) => c.attrs['data-card']);
    assert.deepEqual(ids, [id, qid('Beta', QPATH.Beta)], 'the held question first in its group (no blockers before QW3)');
    const c = qcard(app, id);
    assert.equal(c.attrs['data-question'], 'held');
    assert.equal(byClass(c, 'v2-body')[0].textContent, SECTION_WORDS.heldLine);
    assert.equal(SECTION_WORDS.heldLine, 'Also asked in your session: answer in one place');
    assert.equal(choiceLinks(c).length, 4, 'its choices live');
    assert.equal(keyed(app, `qdone:${id}`), null, 'no "Done ✓"');
    assert.deepEqual(byClass(c, 'v2-step').map((s) => s.textContent), ['More about it ›']);
    assert.equal(keyed(app, 'qhead').textContent, 'Questions for you · 1 · 1 being asked in your session');
    assert.equal(keyed(app, 'ql:asking'), null);
    await app.go('#/waiting');
    assert.equal(keyed(app, 'grp:qsec:Beta').textContent, 'Beta1', 'its group counts the kicked-back one only');
    assert.equal(keyed(app, 'qhead').textContent, 'Questions for you · 5 · 1 being asked in your session');
    // Its sheet, from "More about it ›": its choices, no "Move to Done".
    await app.go(keyed(app, `qmore:${id}`).attrs.href);
    assert.equal(choiceLinks(sheet(app)).length, 4);
    assert.equal(keyed(app, 'sheet-done'), null, 'nothing to mark');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Where it sits, its head and its lines

test('AC94: the section\'s place — under the title and its line, above the quiet lines, the strip and the lanes, with every project shown; with one, under the chip and its can\'t-read line, above the strip, holding only that project\'s questions; its head "Questions for you · <q>" over a hairline, each project\'s group under its name in J7\'s order', async () => {
  const b = busiestState();
  const app = await open(b, { store: seen(NOW + H, b.seed) });
  try {
    const kids = byClass(app.view, 'v2-board')[0].children;
    const at = (cls) => kids.findIndex((c) => c.className.split(' ').includes(cls));
    assert.deepEqual([at('v2-sub') + 1, at('v2-qsec') + 1], [at('v2-qsec'), at('v2-kstrip')], 'title line, section, strip (no quiet line here; with one, below)');
    assert.equal(section(app).tag, 'section');
    assert.equal(section(app).attrs['aria-label'], 'Questions for you', 'a region named so');
    assert.deepEqual(findAll(section(app), (e) => e.dataset && /^grp:qsec:/.test(e.dataset.k || '')).map((g) => g.textContent),
      ['Alpha1', 'Beta1', 'Gamma1', 'Delta1', 'Epsilon-with-a-very-long-project-name-that-wraps1'], 'J7\'s order, each with its count');
    assert.equal(headCount(app), 5);
    assert.equal(keyed(app, 'qhead').tag, 'h2');
    // One project shown.
    await app.go('#/waiting/Gamma');
    const kids1 = byClass(app.view, 'v2-board')[0].children;
    const at1 = (cls) => kids1.findIndex((c) => c.className.split(' ').includes(cls));
    assert.ok(at1('v2-filter') < at1('v2-qsec') && at1('v2-qsec') === at1('v2-kstrip') - 1, 'under the chip, above the strip');
    assert.deepEqual(qcards(app).map((c) => c.attrs['data-card']), [qid('Gamma', QPATH.Gamma)], 'only its questions');
    assert.equal(findAll(section(app), (e) => e.dataset && /^grp:/.test(e.dataset.k || '')).length, 0, 'no group head with one project shown, as the lanes');
    assert.equal(keyed(app, 'qhead').textContent, 'Questions for you · 1');
    assert.equal(byClass(app.view, 'v2-small').find((x) => /of \d projects?$/.test(x.textContent)).textContent, '1 of 5 projects', 'the chip\'s words unchanged');
  } finally {
    app.restore();
  }
  // One project shown that can't be read: under its "Can't read" line.
  const d = busiestState();
  const one = await open(d, { store: seen(NOW + H, d.seed), hash: '#/waiting/Delta' });
  try {
    d.fail();
    await one.advance(3 * POLL_MS);
    const kids = byClass(one.view, 'v2-board')[0].children;
    const iq = kids.findIndex((c) => c.className === 'v2-quiet' && c.dataset.k === 'quiet-cant');
    assert.ok(iq > 0 && kids[iq + 1] === section(one), 'directly under the project\'s can\'t-read line');
    assert.match(byClass(section(one), 'v2-small')[0].textContent, /^Delta not read since \d\d:\d\d, its new questions may be missing$/, 'its grey line');
  } finally {
    one.restore();
  }
});

test('AC94: the grey line for a project the desk can\'t read or can\'t show, beside the red quiet line below — not read since HH:MM (state 5), not read in this opening (state 2), not shown (G8d\'s "Can\'t show"); its questions from its last read kept in its group; none for a project drawn fresh', async () => {
  const b = busiestState();
  const app = await open(b, { store: seen(NOW + H, b.seed) });
  try {
    assert.equal(byClass(section(app), 'v2-small').filter((p) => p.parent === section(app)).length, 0, 'every project read and drawn: no grey line');
    b.fail();
    await app.advance(3 * POLL_MS);
    const grey = byClass(section(app), 'v2-small').filter((p) => p.parent === section(app));
    assert.equal(grey.length, 1);
    const hhmm = /^Delta not read since (\d\d:\d\d), its new questions may be missing$/.exec(grey[0].textContent);
    assert.ok(hhmm, grey[0].textContent);
    assert.equal(findAll(grey[0], (e) => e.tag === 'svg').length, 0, 'no icon');
    assert.equal(keyed(app, 'ql:cant:Delta').textContent, `Can't read Delta since ${hhmm[1]}`, 'the red quiet line kept, G8d\'s words');
    assert.ok(qcard(app, qid('Delta', QPATH.Delta)), 'its question from its last read, kept');
    const kids = byClass(app.view, 'v2-board')[0].children;
    const at = (cls) => kids.findIndex((c) => c.className.split(' ').includes(cls));
    assert.deepEqual([at('v2-sub') + 1, at('v2-qsec') + 1, at('v2-quiet') + 1], [at('v2-qsec'), at('v2-quiet'), at('v2-kstrip')], 'the section above the quiet lines');
    const sec = section(app);
    assert.ok(sec.children.indexOf(grey[0]) === 1, 'under the head');
    for (const theme of THEMES) {
      const L = looks(app, theme);
      assert.equal(L.get(grey[0]).colour, INK[theme].ink2, `${theme}: --ink2`);
    }
  } finally {
    app.restore();
  }
  // State 2: never read in this opening.
  const s2 = kindsState();
  s2.repos[LEDGER].fail = { kind: 'network' };
  const two = await open(s2);
  try {
    assert.deepEqual(byClass(section(two), 'v2-small').filter((p) => p.parent === section(two)).map((p) => p.textContent), ['Ledger not read in this opening, its new questions may be missing']);
    assert.equal(keyed(two, 'ql:cant:Ledger').textContent, "Can't read Ledger in this opening");
  } finally {
    two.restore();
  }
  // Read but not drawn (G8d's "Can't show"; BAD_PR, NOT a real pull request).
  const s3 = kindsState();
  s3.repos[LEDGER].pulls.push(BAD_PR);
  const three = await open(s3);
  try {
    assert.deepEqual(byClass(section(three), 'v2-small').filter((p) => p.parent === section(three)).map((p) => p.textContent), ['Ledger not shown, its questions may be missing']);
    assert.equal(keyed(three, 'ql:show:Ledger').textContent, "Can't show Ledger");
  } finally {
    three.restore();
  }
});

test('AC94 (C, (i)): with no question, one quiet line "Questions for you · none", above "Kicked back · none", no control and no drop target; the words for the unknown where the strip says them — "not read yet", "can\'t read", "can\'t read or show", "can\'t show", "can\'t show when last read" — never "none"; the lanes\' words for the unknown kept with nothing added', async () => {
  const cases = [
    ['quiet', () => quietState(), '#/waiting', 1, null, 'none', 'Nothing here'],
    ['first paint', () => quietState(), '#/waiting', 0, null, 'not read yet', 'Not read yet'],
    ['every project failing', () => orderState(), '#/waiting', 1, null, "can't read", "Can't read"],
    ['none read and drawn', () => noneDrawnState(), '#/waiting', 1, null, "can't read or show", "Can't read or show"],
    ['one shown, can\'t show', () => cantShowState(), `#/waiting/${MIX_PROJECT}`, 1, null, "can't show", "Can't show"],
    ['one shown, can\'t show when last read', () => cantShowLastState(), `#/waiting/${MIX_PROJECT}`, 1, 'later', "can't show when last read", "Can't show when last read"],
  ];
  for (const [what, make, hash, polls, later, words, lane0] of cases) {
    const s = make();
    const app = polls ? await open(s, { hash }) : await loadSandbox({ ...s, hash, now: NOW, store: seen() });
    try {
      if (later) {
        s.fail();
        await app.advance(3 * POLL_MS);
      }
      const line = section(app).children[0];
      assert.equal(line.textContent, `Questions for you · ${words}`, what);
      assert.equal(line.tag, 'p');
      assert.equal(findAll(section(app), (e) => ['a', 'button'].includes(e.tag)).length, 0, `${what}: no control`);
      assert.equal(section(app).dataset.lane, undefined, `${what}: no drop target`);
      if (words !== 'none') assert.doesNotMatch(section(app).textContent, /· none/, `${what}: never "none"`);
      assert.equal(laneEmpty(app), lane0, `${what}: the lane's words, nothing added`);
      const kids = byClass(app.view, 'v2-board')[0].children;
      assert.ok(kids.indexOf(section(app)) < kids.indexOf(lane(app, 'kick')), `${what}: above "Kicked back"`);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// The lanes, the counts, and a question leaving

test('AC94 ("The lanes once the questions leave"): "Waiting on you" and its groups count the cards left in it; an empty lane under questions "Nothing here; your questions are above", and with one project shown its states 3 and 5 so; "Nothing waiting: <project>" only with nothing in the section, the strip or the lanes; the badge the sum, unchanged', async () => {
  const s = kindsState();
  // A third made-up project holding only a held question (Q_HELD, asked in a made-up session), and a fourth holding nothing.
  const heldOnly = repo({ 'governance/ROUTING.toml': s.repos[KINDS].files['governance/ROUTING.toml'], 'questions/Held-only.md': Q_HELD });
  heldOnly.history['questions/Held-only.md'] = [{ commit: { committer: { date: new Date(NOW - H).toISOString() } } }];
  s.repos.Held = heldOnly;
  s.repos.Quiet = repo({ 'README.md': '# Quiet\n\nNOT a real project.\n' });
  s.config = { ...s.config, projects: [...s.config.projects, v3('Held'), v3('Quiet')] };
  const app = await open(s);
  try {
    assert.equal(byClass(lane(app, 'wait'), 'v2-lc')[0].textContent, '0', 'the lane counts its own cards: none');
    assert.equal(laneEmpty(app), 'Nothing here; your questions are above');
    assert.equal(badge(app), 7, 'the badge: the section\'s seven counted questions, the held one not');
    assert.equal(headCount(app), 7);
    assert.equal(byClass(app.view, 'v2-ql').find((x) => / still /.test(` ${x.className} `) && /Nothing waiting/.test(x.textContent)).textContent, 'Nothing waiting: Quiet',
      'never a project with a held question in the section');
    assert.ok(qcards(app).some((c) => c.attrs['data-question'] === 'held' && c.textContent.includes('Should Plan show estimates')), 'its held question in the section');
    await app.go(`#/waiting/${KINDS}`);
    assert.equal(laneEmpty(app), 'Nothing here; your questions are above', 'one project shown, state 3');
    await app.go('#/waiting/Quiet');
    assert.equal(laneEmpty(app), 'Nothing here', 'no question for it: nothing added');
    s.repos[KINDS].fail = { kind: 'network' };
    await app.advance(3 * POLL_MS);
    await app.go(`#/waiting/${KINDS}`);
    assert.equal(laneEmpty(app), 'Nothing here when last read; your questions are above', 'state 5');
  } finally {
    app.restore();
  }
  // State 2 holding a held tree's questions (G8d; made up: Kinds' first read holding its tree and failing on one blob, NOT
  // how any read went): its questions in the section, its lane's "Can't read" and the strip's words with nothing added.
  const s2 = kindsState();
  s2.repos[KINDS].blobFail = [gitSha(s2.repos[KINDS].files['governance/ROUTING.toml'])];
  const two = await open(s2, { hash: `#/waiting/${KINDS}`, polls: 2 });
  try {
    assert.equal(two.desk.states.get(KINDS).lastSuccessAt ?? null, null, 'no read succeeded: state 2');
    assert.equal(headCount(two), 5, 'its questions in the section');
    assert.deepEqual([laneEmpty(two), lane(two, 'kick').textContent], ["Can't read", "Kicked back · can't read"], 'nothing added');
  } finally {
    two.restore();
  }
  // The badge, the section, the strip and the lane on the busiest state: the sum, as before.
  const b = busiestState();
  const busy = await open(b, { store: seen(NOW + H, b.seed) });
  try {
    const ln = Number(byClass(lane(busy, 'wait'), 'v2-lc')[0].textContent);
    const st = Number((byClass(byClass(lane(busy, 'kick'), 'v2-kh')[0] || lane(busy, 'kick'), 'v2-lc')[0] || { textContent: '0' }).textContent);
    assert.equal(badge(busy), ln + st + headCount(busy), 'the badge their sum');
    for (const g of findAll(lane(busy, 'wait'), (e) => e.dataset && /^grp:wait:/.test(e.dataset.k || ''))) {
      const list = keyed(busy, `list:wait:${g.dataset.k.slice('grp:wait:'.length)}`);
      assert.equal(byClass(g, 'v2-gc')[0].textContent, String(byClass(list, 'v2-card').length), `${g.dataset.k}: its group counts its cards`);
      assert.equal(findAll(list, (e) => e.attrs && e.attrs['data-card'] && /\|question\|/.test(e.attrs['data-card'])).length, 0, 'no question in the lane');
    }
    const all = ln + st + headCount(busy);
    await busy.go('#/');
    assert.match(byClass(busy.view, 'v2-brief')[0].textContent, new RegExp(`^${all} need you`), 'Home\'s briefing unchanged');
  } finally {
    busy.restore();
  }
});

test('AC94 (C, (f)): a question stays in the section after a tap on its choice; leaves it once its answer\'s pull request opens ("Your answer is being recorded") and once the answer lands on the default branch', async () => {
  const s = kindsState();
  const id = qid(KINDS, K.lettered);
  const app = await open(s);
  try {
    const link = choiceLinks(qcard(app, id))[0];
    link.dispatch('click');
    await app.flush();
    await app.advance(POLL_MS);
    assert.ok(qcard(app, id), 'a tap marks nothing: still in the section');
    // The answer's pull request opens (made up, NOT a real pull request).
    const answer = { ...pr(70, 'Record the answer, made up', { head: 'cos/answer-70', headRepo: `shumpmaster/${KINDS}` }), head: { ref: 'cos/answer-70', sha: '7'.repeat(40), repo: { full_name: `shumpmaster/${KINDS}` } } };
    s.repos[KINDS].pulls.push(answer);
    s.repos[KINDS].prFiles = { 70: [{ filename: 'decisions/questions/Kinds-lettered.md', status: 'added' }, { filename: K.lettered, status: 'removed' }] };
    await app.advance(2 * POLL_MS);
    assert.equal(qcard(app, id), null, 'its answer\'s pull request open: out of the section');
    assert.equal(keyed(app, 'ql:answerRecording').textContent, 'Your answer is being recorded: 1');
  } finally {
    app.restore();
  }
  const s2 = kindsState();
  const app2 = await open(s2);
  try {
    s2.repos[KINDS].commit({ 'decisions/questions/Kinds-lettered.md': 'Ruling: A\n\nMade up, NOT real.\n' });
    await app2.advance(2 * POLL_MS);
    assert.equal(qcard(app2, id), null, 'the answer on the default branch: gone');
    assert.equal(headCount(app2), 6);
  } finally {
    app2.restore();
  }
});

test('AC94 ("Before and around a link"): AC77\'s re-read before a section link, "Already answered: <ruling>" with nothing opened; AC17\'s Copy inside each box past `linkCap` and with `contentPrefill: false`, the cause\'s words under the choices; AC18\'s message before the links where web commits to the default branch are refused', async () => {
  const opened = [];
  const s = kindsState();
  const app = await open(s, { win: { open: (u) => { opened.push(u); return {}; } } });
  try {
    const id = qid(KINDS, K.lettered);
    await app.advance(31_000);
    s.repos[KINDS].commit({ 'decisions/questions/Kinds-lettered.md': 'Ruling: B — made up, NOT real\n' });
    const link = choiceLinks(qcard(app, id))[0];
    let prevented = false;
    link.dispatch('click', { preventDefault() { prevented = true; } });
    await app.flush();
    assert.equal(prevented, true, 'held back for the re-read');
    assert.deepEqual(opened, [], 'nothing opens');
    assert.equal(qcard(app, id), null, 'answered: it has left the section');
    assert.deepEqual(byClass(section(app), 'v2-recheck').map((x) => x.textContent), ["Which colour should a kicked-back card's icon take?: Already answered: Ruling: B — made up, NOT real"],
      'said in the section, once, with no link');
  } finally {
    app.restore();
  }
  for (const [what, setup] of [['past linkCap', kindsState({ linkCap: 60 })], ['contentPrefill: false', (() => { const k = kindsState(); k.config.projects[0] = { ...k.config.projects[0], contentPrefill: false }; return k; })()]]) {
    const a = await open(setup);
    try {
      const c = qcard(a, qid(KINDS, K.lettered));
      for (const o of byClass(c, 'v2-opt')) assert.deepEqual(byClass(o, 'v2-abtn').map((b) => b.textContent), [byClass(o, 'v2-abtn')[0].textContent, 'Copy'], `${what}: a Copy inside each box`);
      const cause = byClass(c, 'v2-small').filter((p) => p.dataset.k === 'copy-cause');
      assert.equal(cause.length, 1, `${what}: the cause's words under the choices`);
      assert.equal(byClass(c, 'v2-opts')[0].parent.children.indexOf(cause[0]), byClass(c, 'v2-opts')[0].parent.children.indexOf(byClass(c, 'v2-opts')[0]) + 1);
    } finally {
      a.restore();
    }
  }
  const w = kindsState();
  w.config.projects[0] = { ...w.config.projects[0], webCommitsToDefault: false };
  const a18 = await open(w);
  try {
    const c = qcard(a18, qid(KINDS, K.lettered));
    const warn = byClass(c, 'v2-webwarn')[0];
    assert.ok(warn, 'AC18\'s message');
    const body = byClass(c, 'v2-qbody')[0];
    assert.ok(body.children.indexOf(warn) < body.children.indexOf(byClass(c, 'v2-opts')[0]), 'before the links');
  } finally {
    a18.restore();
  }
});

// ---------------------------------------------------------------------------
// Its look, its targets, its region

test('AC94 ("Its look"; AC81; AC88): the head 600 12 px --ink, its count and each " · " --t-mono, " · " --ink2, a hairline under it; each question a board card, its title --t-row cut at three lines; the boxes in the sheet\'s form (10/12 px inside, a 12 px corner, 8 px apart, 36 px buttons); no soft box, no new colour, size or weight, every text at least 4.5:1 — in light and dark, at 360 and 414 px', async () => {
  const b = busiestState();
  const app = await open(b, { store: seen(NOW + H, b.seed) });
  try {
    await openFolds(app);
    const head = keyed(app, 'qhead');
    const sec = section(app);
    const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const ratio = (a, z) => { const [x, y] = [lum(a), lum(z)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    for (const theme of THEMES) {
      for (const w of WIDTHS) {
        const L = looks(app, theme, w);
        const c = INK[theme];
        const at = `${theme}, ${w} px`;
        const h = L.get(head);
        assert.deepEqual([h.size, h.weight, h.colour, h.decl('border-bottom')], ['12px', '600', c.ink, `1px solid ${c.line}`], `${at}: the head`);
        const [, dot, count] = head.children;
        assert.match(L.get(dot).raw('font'), /^400 11px\/1\.4 ⟦--mono\|/, `${at}: " · " in --t-mono`);
        assert.equal(L.get(dot).colour, c.ink2);
        assert.match(L.get(count).raw('font'), /^400 11px\/1\.4 ⟦--mono\|/, `${at}: the count in --t-mono`);
        assert.equal(L.get(sec).decl('background'), '', `${at}: no soft box`);
        for (const card of byClass(sec, 'v2-qcard')) {
          assert.match(L.get(card).raw('background'), /^⟦--card\|/, `${at}: a board card`);
          const t = byClass(card, 'v2-t')[0];
          assert.deepEqual([L.get(t).size, L.get(t).weight], ['13px', '500'], `${at}: its title in --t-row`);
          assert.equal(L.get(byClass(card, 'v2-tt')[0]).decl('max-height'), 'calc(3 * 1.35em)', `${at}: cut at three lines`);
          assert.equal(L.get(byClass(card, 'v2-qbody')[0]).decl('z-index'), '1', `${at}: its controls above the full-card link`);
        }
        for (const o of byClass(sec, 'v2-opt')) assert.deepEqual([L.get(o).decl('padding'), L.get(o).decl('border-radius')], ['10px 12px', '12px'], `${at}: a box`);
        for (const o of byClass(sec, 'v2-opts')) assert.equal(L.get(o).decl('gap'), '8px');
        for (const a of byClass(sec, 'v2-abtn')) assert.equal(L.get(a).decl('min-height'), '36px', `${at}: a 36 px button`);
        // Every text: an existing colour, size and weight, at least 4.5:1 on its ground.
        for (const el of findAll(sec, (e) => (e.children || []).some((x) => x.nodeType === 3 && String(x.text || '').trim()))) {
          const l = L.get(el);
          assert.ok([c.ink, c.ink2].includes(l.colour), `${at}: "${el.textContent.slice(0, 30)}" in ${l.colour}`);
          assert.ok(['11px', '12px', '13px'].includes(l.size), `${at}: "${el.textContent.slice(0, 30)}" at ${l.size}`);
          assert.ok(['400', '500', '600'].includes(l.weight));
          let ground = null;
          for (let n = el; n && !ground; n = n.parent) { const g = L.get(n); const bgv = g && (g.decl('background') || g.decl('background-color')); if (bgv && /^#/.test(bgv)) ground = bgv.toLowerCase(); }
          ground = ground || c.bg;
          assert.ok(ratio(l.colour, ground) >= 4.5, `${at}: "${el.textContent.slice(0, 30)}" ${l.colour} on ${ground}: ${ratio(l.colour, ground).toFixed(2)}`);
        }
        // No sideways scroll at 360 px: nothing in the section scrolls sideways, and every long word may break.
        for (const el of findAll(sec, () => true)) {
          const l = L.get(el);
          if (!l) continue;
          const ox = l.decl('overflow-x') || (l.decl('overflow').split(' ')[0] || '');
          assert.ok(!/auto|scroll/.test(ox), `${at}: ${el.tag}.${el.className} scrolls sideways`);
        }
        for (const el of findAll(sec, (e) => (e.children || []).some((x) => x.nodeType === 3 && /\S{40,}/.test(String(x.text || ''))))) {
          let wraps = false;
          for (let n = el; n && !wraps; n = n.parent) wraps = /anywhere|break-word/.test((L.get(n) && L.get(n).decl('overflow-wrap')) || '');
          assert.ok(wraps, `${at}: "${el.textContent.slice(0, 30)}…" may break`);
        }
      }
    }
  } finally {
    app.restore();
  }
});

test('AC94: each control a target of at least 24 × 24 px ("Done ✓" a 28 px `.v2-step`), each drawn above the card\'s full-card link; the section a region named "Questions for you", first in focus order after the screen\'s title', async () => {
  const app = await open(kindsState());
  try {
    const L = looks(app, 'light');
    const c = qcard(app, qid(KINDS, K.lettered));
    for (const el of [...byClass(c, 'v2-fold'), ...byClass(c, 'v2-step')]) assert.ok(parseFloat(L.get(el).decl('min-height')) >= 24, `${el.textContent}: at least 24 px`);
    assert.equal(L.get(keyed(app, `qdone:${qid(KINDS, K.lettered)}`)).decl('min-height'), '28px');
    const body = byClass(c, 'v2-qbody')[0];
    assert.deepEqual([L.get(body).decl('position'), L.get(body).decl('z-index')], ['relative', '1'], 'above `.v2-t::after`');
    for (const el of [...byClass(c, 'v2-abtn'), ...byClass(c, 'v2-fold'), ...byClass(c, 'v2-step')]) {
      let n = el;
      while (n && n !== body) n = n.parent;
      assert.equal(n, body, `${el.textContent}: inside the raised part`);
    }
    // Focus order: the first focusable element after the title is in the section.
    const all = findAll(app.view, () => true);
    const h1 = all.findIndex((e) => e.tag === 'h1');
    const first = all.slice(h1 + 1).find((e) => ['a', 'button', 'textarea', 'input'].includes(e.tag));
    let inside = false;
    for (let n = first; n; n = n.parent) if (n === section(app)) inside = true;
    assert.ok(inside, `first in focus order after the title: ${first.tag} ${first.textContent}`);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC94's "Settled from QW1's build" (the Definer's notes on the Builder's seven points, each C)

/** `kindsState` cut down to the given Kinds questions and none of Ledger's (made up, NOT real). */
function fewState(keep) {
  const s = kindsState();
  for (const p of Object.values(K)) if (!keep.includes(p)) { delete s.repos[KINDS].files[p]; delete s.repos[LEDGER].files[p]; }
  return s;
}

test('AC94 (settled, 2): AC77\'s re-read words for a question it takes out of the section stay under the head while others are left, and under "Questions for you · none" once none is left, for this opening; "being recorded" with its pull request\'s link; with one project shown, only that project\'s', async () => {
  const s = fewState([K.lettered, K.bare]);
  const opened = [];
  const app = await open(s, { win: { open: (u) => { opened.push(u); return {}; } } });
  try {
    await app.advance(31_000);
    // The first: answered meanwhile.
    s.repos[KINDS].commit({ 'decisions/questions/Kinds-lettered.md': 'Ruling: B — made up, NOT real\n' });
    choiceLinks(qcard(app, qid(KINDS, K.lettered)))[0].dispatch('click', { preventDefault() {} });
    await app.flush();
    const said = () => byClass(section(app), 'v2-recheck').map((x) => x.textContent);
    assert.deepEqual(said(), ["Which colour should a kicked-back card's icon take?: Already answered: Ruling: B — made up, NOT real"], 'under the head, one question left');
    assert.equal(section(app).children[0].dataset.k, 'qhead');
    // The second, the last: its answer's pull request open meanwhile (made up, NOT a real pull request), more than 30 s after
    // the last read (the poll after the first re-read), so the link is re-read again.
    await app.advance(62_000);
    s.repos[KINDS].pulls.push({ ...pr(71, 'Record the answer, made up', { head: 'cos/answer-71' }), head: { ref: 'cos/answer-71', sha: '8'.repeat(40), repo: { full_name: `shumpmaster/${KINDS}` } } });
    s.repos[KINDS].prFiles = { 71: [{ filename: 'decisions/questions/Kinds-bare.md', status: 'added' }, { filename: K.bare, status: 'removed' }] };
    choiceLinks(qcard(app, qid(KINDS, K.bare)))[0].dispatch('click', { preventDefault() {} });
    await app.flush();
    await app.advance(POLL_MS);
    assert.equal(qcards(app).length, 0, 'none left');
    assert.equal(section(app).children[0].textContent, 'Questions for you · none');
    assert.equal(said().length, 2, 'both said under the "none" line');
    assert.equal(said()[0], "Which colour should a kicked-back card's icon take?: Already answered: Ruling: B — made up, NOT real");
    assert.match(said()[1], /^Should the strip scroll by card or by page\?: .*PR #71, which records it$/, 'being recorded, with its link');
    const link = findAll(byClass(section(app), 'v2-recheck')[1], (e) => e.tag === 'a')[0];
    assert.equal(link.attrs.href, s.repos[KINDS].pulls[0].html_url);
    for (const x of byClass(section(app), 'v2-recheck')) assert.equal(x.attrs.role, 'status');
    assert.deepEqual(opened, [], 'nothing opened');
    // Still said at the next polls, in this opening.
    await app.advance(2 * POLL_MS);
    assert.equal(said().length, 2);
    // One project shown: only that project's.
    await app.go(`#/waiting/${LEDGER}`);
    assert.deepEqual(said(), [], 'not Ledger\'s');
    await app.go(`#/waiting/${KINDS}`);
    assert.equal(said().length, 2, 'Kinds\'');
  } finally {
    app.restore();
  }
});

/** A made-up v3 project "Held" with a held numbered question and a held lettered one, and Ledger (v2.5) with a held one (NOT real). */
function heldKindsState() {
  const s = kindsState();
  const at = [{ commit: { committer: { date: new Date(NOW - H).toISOString() } } }];
  const held = repo({ 'governance/ROUTING.toml': s.repos[KINDS].files['governance/ROUTING.toml'],
    'questions/Held-num.md': qFile({ title: 'Two made-up held parts', milestone: 'M3C', asked: SID, options: ['1. Which day? A. Monday · B. Friday', '2. Which hour? A. 08:00 · B. 18:00'], rec: '1 B; 2 A' }),
    'questions/Held-let.md': qFile({ title: 'A made-up held lettered question', milestone: 'M3G', asked: SID, options: ['A. Yes.', 'B. No.'], rec: 'A' }) });
  held.history = { 'questions/Held-num.md': at, 'questions/Held-let.md': at };
  s.repos.Held = held;
  s.repos[LEDGER].commit({ 'questions/Ledger-held.md': qFile({ title: 'A made-up held v2.5 question', asked: SID, options: ['A. This.', 'B. That.'], rec: 'A' }) });
  s.repos[LEDGER].history['questions/Ledger-held.md'] = at;
  s.config = { ...s.config, projects: [v3('Held'), ...s.config.projects] };
  return s;
}
const isHeld = (app, id) => (qcard(app, id) || { attrs: {} }).attrs['data-question'] === 'held';

test('AC94 (settled, 4) with AC77: a held question\'s hold is ended on this device by its answer and copy taps, in the section and in its sheet, and by nothing else — "Answer in its sheet ›", "Show choices ›", "Add your own words" and "More about it ›" end nothing', async () => {
  const copied = [];
  const navigator = { clipboard: { writeText: async (t) => { copied.push(t); } } };
  const NUM = 'Held|question|questions/Held-num.md';
  const LET = 'Held|question|questions/Held-let.md';
  const V25 = `${LEDGER}|question|questions/Ledger-held.md`;
  // Taps that end nothing.
  let app = await open(heldKindsState(), { globals: { navigator } });
  try {
    for (const id of [NUM, LET, V25]) assert.ok(isHeld(app, id), `${id}: held`);
    await app.tap(findAll(qcard(app, NUM), (e) => e.tag === 'a' && e.textContent === SECTION_WORDS.inSheet)[0]);
    await app.go('#/waiting');
    for (const id of [NUM, LET, V25]) {
      for (const k of [`fold:qchoices:${id}`, `fold:qwords:${id}`]) {
        const b = keyed(app, k);
        if (b) await app.tap(b);
      }
      await app.tap(keyed(app, `qmore:${id}`));
      await app.go('#/waiting');
    }
    for (const id of [NUM, LET, V25]) assert.ok(isHeld(app, id), `${id}: still held after "Answer in its sheet ›", "Show choices ›", "Add your own words" and "More about it ›"`);
    assert.equal(copied.length, 0);
    // A copy tap in the section: the v2.5 question's hold ends, then its text is copied.
    await app.tap(byClass(qcard(app, V25), 'v2-abtn').find((b) => b.textContent === 'Copy answer A'));
    assert.equal(isHeld(app, V25), false, 'a copy in the section ends it');
    assert.equal(qcard(app, V25).attrs['data-question'], 'counted');
    assert.equal(copied[0], v25Ruling('A', ''));
  } finally {
    app.restore();
  }
  // Taps in the sheet: an answer link, and a copy.
  app = await open(heldKindsState(), { globals: { navigator } });
  try {
    await app.go(`#/waiting/card/${enc(LET)}`);
    const a = choiceLinks(sheet(app))[0];
    a.dispatch('click', { preventDefault() {} });
    await app.flush();
    await app.go('#/waiting');
    assert.equal(isHeld(app, LET), false, 'an answer link in its sheet ends it');
    await app.go(`#/waiting/card/${enc(V25)}`);
    await app.tap(byClass(sheet(app), 'v2-abtn').find((b) => b.textContent === 'Copy answer B'));
    await app.go('#/waiting');
    assert.equal(isHeld(app, V25), false, 'a copy in its sheet ends it');
    assert.ok(isHeld(app, NUM), 'the other held question untouched');
  } finally {
    app.restore();
  }
});

test('AC94 (settled, 3 and 7): one project shown in state 5 with no question, "Questions for you · none when last read", by the strip\'s rule; the grey line under the "none" line for a project the desk can\'t read', async () => {
  const q = quietState();
  const one = await open(q, { hash: `#/waiting/${MIX_PROJECT}` });
  try {
    q.repos[MIX_PROJECT].fail = { kind: 'network' };
    await one.advance(3 * POLL_MS);
    assert.equal(section(one).children[0].textContent, 'Questions for you · none when last read');
    assert.equal(lane(one, 'kick').textContent, 'Kicked back · none when last read', 'as the strip');
    const grey = section(one).children[1];
    assert.match(grey.textContent, new RegExp(`^${MIX_PROJECT} not read since \\d\\d:\\d\\d, its new questions may be missing$`), 'the grey line under the "none" line');
    assert.equal(grey.className, 'v2-small');
  } finally {
    one.restore();
  }
  const every = quietState();
  const app = await open(every);
  try {
    every.repos[MIX_PROJECT].fail = { kind: 'network' };
    await app.advance(3 * POLL_MS);
    const [line, grey] = section(app).children;
    assert.equal(line.textContent, 'Questions for you · none', 'every project shown: another read, so "none"');
    assert.match(grey.textContent, new RegExp(`^${MIX_PROJECT} not read since (\\d\\d:\\d\\d), its new questions may be missing$`));
    for (const theme of THEMES) assert.equal(looks(app, theme).get(grey).colour, INK[theme].ink2, `${theme}: --ink2`);
    assert.ok(keyed(app, `ql:cant:${MIX_PROJECT}`), 'beside the red quiet line');
  } finally {
    app.restore();
  }
});

test('AC94 (settled, 1): with one project shown, the focus order is the title, the chip and its "×", then the section, before the strip and the lanes', async () => {
  const app = await open(kindsState(), { hash: `#/waiting/${KINDS}` });
  try {
    const all = findAll(app.view, () => true);
    const h1 = all.findIndex((e) => e.tag === 'h1');
    const focusable = all.slice(h1 + 1).filter((e) => ['a', 'button', 'textarea', 'input'].includes(e.tag));
    assert.equal(focusable[0].attrs['aria-label'], 'Show all projects', 'the chip\'s "×" first');
    let inside = false;
    for (let n = focusable[1]; n; n = n.parent) if (n === section(app)) inside = true;
    assert.ok(inside, `then the section: ${focusable[1].tag} ${focusable[1].textContent}`);
    const idx = (el) => all.indexOf(el);
    assert.ok(idx(section(app)) < idx(lane(app, 'kick')) && idx(section(app)) < idx(lane(app, 'wait')), 'before the strip and the lanes');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC94's "What QW1 keeps from stage G9c" (G9c landed before QW1, #243; AC91 (c), "Waiting's quiet lines while a read is on
// its way or signed out"; P-001-glance-waiting-pending.md and -waiting-signed-out.md, each A, with -g9c-signed-out-all.md, A)

const boardKids = (app) => byClass(app.view, 'v2-board')[0].children;
const quietKeys = (app) => { const box = boardKids(app).find((c) => c.className === 'v2-quiet'); return box ? box.children.map((c) => c.dataset.k) : []; };

test('AC94 ("What QW1 keeps from stage G9c"): the section first, then the quiet lines — the red lines, then each "Still reading <project>…" — then the strip and the lanes; the section\'s "none" beside a project still being read, with no grey line of its own for it (state 1)', async () => {
  // failedHeldState (made up, NOT how any read went): the made-up project's first read failing, Service-Desk's held on its way.
  const s = failedHeldState();
  const app = await open(s, { store: seen() });
  try {
    const kids = boardKids(app);
    const at = (cls) => kids.findIndex((c) => c.className.split(' ').includes(cls));
    assert.deepEqual([at('v2-sub') + 1, at('v2-qsec') + 1, at('v2-quiet') + 1], [at('v2-qsec'), at('v2-quiet'), at('v2-kstrip')], 'the section, the quiet lines, the strip');
    assert.deepEqual(quietKeys(app).filter((k) => /^ql:(cant|show|reading|signed-out):/.test(k) || k === 'ql:signed-out'), [`ql:cant:${MIX_PROJECT}`, `ql:reading:${SD.name}`],
      'the red line, then "Still reading"');
    assert.equal(keyed(app, `ql:reading:${SD.name}`).textContent, `Still reading ${SD.name}…`);
    assert.equal(section(app).children[0].textContent, 'Questions for you · none', '"none" while a project is still being read');
    const grey = byClass(section(app), 'v2-small').filter((p) => p.parent === section(app)).map((p) => p.textContent);
    assert.deepEqual(grey, [`${MIX_PROJECT} not read in this opening, its new questions may be missing`], 'a grey line for the project in state 2 only, none for the one on its way');
  } finally {
    s.release();
    app.restore();
  }
});

test('AC94 ("What QW1 keeps from stage G9c"): signed out, the one "Signed out — reload to sign in" line first among the quiet lines, below the section, in place of every red line; the section\'s own grey lines, one per project, as AC94 has them, and its questions from their last read', async () => {
  // signedOutMixedState (made up, NOT how any read went): Service-Desk failing from the start, then every read refused as signed out.
  const s = signedOutMixedState();
  const app = await open(s, { store: seen() });
  try {
    s.fail();
    await app.advance(3 * POLL_MS);
    const keys = quietKeys(app);
    assert.equal(keys[0], 'ql:signed-out', 'first among the quiet lines');
    assert.equal(keyed(app, 'ql:signed-out').textContent, 'Signed out — reload to sign in');
    assert.deepEqual(keys.filter((k) => /^ql:(cant|show):/.test(k)), [], 'no red line per project');
    const kids = boardKids(app);
    assert.ok(kids.indexOf(section(app)) < kids.findIndex((c) => c.className === 'v2-quiet'), 'below the section');
    const grey = byClass(section(app), 'v2-small').filter((p) => p.parent === section(app)).map((p) => p.textContent);
    assert.equal(grey.length, 3, 'one grey line per project');
    assert.equal(grey[0], `${SD.name} not read in this opening, its new questions may be missing`);
    for (const [i, n] of [[1, POOM.name], [2, MIX_PROJECT]]) assert.match(grey[i], new RegExp(`^${n} not read since \\d\\d:\\d\\d, its new questions may be missing$`));
    assert.ok(qcard(app, `${MIX_PROJECT}|question|questions/${MIX_PROJECT}-pick.md`), 'the made-up project\'s question from its last read');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// QW1's round 2 (the Reviewer's B1): only "Already answered" and "being recorded" stay said once a question has left

/** Kinds' reads failing (made up, the network cause), then "Answer A ↗" on Kinds-lettered tapped: AC77's re-read fails. */
async function failedReread(s, app) {
  const id = qid(KINDS, K.lettered);
  s.repos[KINDS].fail = { kind: 'network' };
  await app.advance(POLL_MS);
  await app.advance(31_000);
  choiceLinks(qcard(app, id))[0].dispatch('click', { preventDefault() {} });
  await app.flush();
  assert.match(byClass(qcard(app, id), 'v2-recheck').map((x) => x.textContent).join(' '), /The desk couldn't check just now/, 'the card says it couldn\'t check');
  s.repos[KINDS].fail = null;
  await app.advance(POLL_MS);
  return id;
}

test('AC94 (settled, 2; round 2, B1): a question that leaves the section by "Done ✓" after a re-read that couldn\'t check leaves no "couldn\'t check" line, nor its "Open GitHub anyway"', async () => {
  const s = kindsState();
  const app = await open(s);
  try {
    const id = await failedReread(s, app);
    await app.tap(keyed(app, `qdone:${id}`));
    assert.equal(qcard(app, id), null, 'marked: out of the section');
    assert.doesNotMatch(section(app).textContent, /couldn't check|anyway/i);
    assert.deepEqual(byClass(section(app), 'v2-recheck'), [], 'nothing said for it');
    await app.advance(POLL_MS);
    assert.deepEqual(byClass(section(app), 'v2-recheck'), [], 'and at the next poll');
  } finally {
    app.restore();
  }
});

test('AC94 (settled, 2; round 2, B1): a question answered by an ordinary read after a re-read that couldn\'t check leaves no line — no "couldn\'t check", and no "Already answered", which only a re-read gives', async () => {
  const s = kindsState();
  const app = await open(s);
  try {
    const id = await failedReread(s, app);
    s.repos[KINDS].commit({ 'decisions/questions/Kinds-lettered.md': 'Ruling: A — made up, NOT real\n' });
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.equal(qcard(app, id), null, 'answered: out of the section');
    assert.doesNotMatch(section(app).textContent, /couldn't check|anyway/i);
    assert.deepEqual(byClass(section(app), 'v2-recheck'), [], 'nothing said: no re-read found it answered');
  } finally {
    app.restore();
  }
});

test('AC94 (settled, 2; round 2, B1): a re-read that couldn\'t check, then one that finds the question answered — "Already answered: <ruling>" alone', async () => {
  const s = kindsState();
  const app = await open(s);
  try {
    const id = await failedReread(s, app);
    // Past 30 s since the last read, so the next tap re-reads (AC77).
    for (let i = 0; i < 70 && !app.desk.needsRecheck(KINDS); i++) await app.advance(1000);
    assert.ok(app.desk.needsRecheck(KINDS));
    s.repos[KINDS].commit({ 'decisions/questions/Kinds-lettered.md': 'Ruling: A — made up, NOT real\n' });
    choiceLinks(qcard(app, id))[0].dispatch('click', { preventDefault() {} });
    await app.flush();
    assert.equal(qcard(app, id), null, 'answered: out of the section');
    assert.deepEqual(byClass(section(app), 'v2-recheck').map((x) => x.textContent),
      ["Which colour should a kicked-back card's icon take?: Already answered: Ruling: A — made up, NOT real"], 'alone');
    await app.advance(POLL_MS);
    assert.equal(byClass(section(app), 'v2-recheck').length, 1, 'still said at the next poll');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// QW1's round 2: the owner's answer (decisions/questions/P-001-m3g-reload-fold.md, A) and the reviewers' notes

test('AC94 (the owner\'s reload answer, P-001-m3g-reload-fold.md, A): after a full reload, each "Add your own words" fold holding words this device kept opens again in the first drawing, before AC56 puts the scroll back; one with none stays closed; "Show choices ›" not opened by it; within the opening a fold the owner closed stays closed', async () => {
  const kept = savedWords({ [wordsKey(qid(KINDS, K.bare))]: 'Kept made-up words, NOT real.', [wordsKey(qid(KINDS, K.numbered), 2)]: 'Kept for part 2, NOT real.',
    [wordsKey(qid(KINDS, K.split))]: 'Kept for the split one, NOT real.' });
  const store = seen(NOW + H, { ...kept, 'desk-scroll-v1': JSON.stringify({ hash: '#/waiting', y: 900, sheetY: 0 }) });
  const calls = [];
  const typedShown = () => findAll(document.getElementById('view'), (e) => e.tag === 'textarea' && e.value === 'Kept made-up words, NOT real.').length > 0;
  const app = await open(kindsState(), { store, win: { scrollTo: (x, y) => { calls.push([y, typedShown()]); } } });
  try {
    const fold = (path) => keyed(app, `fold:qwords:${qid(KINDS, path)}`);
    for (const path of [K.bare, K.numbered, K.split]) assert.equal(fold(path).attrs['aria-expanded'], 'true', `${path}: open again`);
    for (const path of [K.lettered, K.none]) assert.equal(fold(path).attrs['aria-expanded'], 'false', `${path}: no kept words, closed`);
    assert.equal(findAll(qcard(app, qid(KINDS, K.bare)), (e) => e.tag === 'textarea')[0].value, 'Kept made-up words, NOT real.', 'the words where they were left');
    assert.deepEqual(findAll(qcard(app, qid(KINDS, K.numbered)), (e) => e.tag === 'textarea').map((t) => t.value), ['', 'Kept for part 2, NOT real.'], 'each part\'s box');
    assert.equal(keyed(app, `fold:qchoices:${qid(KINDS, K.split)}`).attrs['aria-expanded'], 'false', '"Show choices ›" not opened');
    assert.ok(calls.some(([y, shown]) => y === 900 && shown), 'the scroll put back with the words already shown');
    // Closed by the owner: stays closed within the opening.
    await app.tap(fold(K.bare));
    assert.equal(fold(K.bare).attrs['aria-expanded'], 'false');
    await app.advance(POLL_MS);
    assert.equal(fold(K.bare).attrs['aria-expanded'], 'false', 'still closed at the next poll');
    assert.equal(findAll(qcard(app, qid(KINDS, K.bare)), (e) => e.tag === 'textarea').length, 0);
  } finally {
    app.restore();
  }
});

test('AC94 (round 2, N1): a numbered question\'s "Add your own words" holds its sheet\'s boxes, one per part, each its own saved words, the same as the sheet\'s', async () => {
  const id = qid(KINDS, K.numbered);
  const app = await open(kindsState());
  try {
    await app.tap(keyed(app, `fold:qwords:${id}`));
    const boxes = findAll(qcard(app, id), (e) => e.tag === 'textarea');
    assert.deepEqual(boxes.map((b) => b.attrs['aria-label']), ['Your answer to 1', 'Your answer to 2'], 'one box per part, labelled as the sheet\'s');
    boxes[1].value = 'Made-up words for part 2, NOT real.';
    boxes[1].dispatch('input');
    await app.flush();
    await app.go(`#/waiting/card/${enc(id)}`);
    assert.deepEqual(findAll(sheet(app), (e) => e.tag === 'textarea').map((t) => [t.attrs['aria-label'], t.value]),
      [['Your answer to 1', ''], ['Your answer to 2', 'Made-up words for part 2, NOT real.']], 'the sheet\'s boxes, part 2\'s words in it');
  } finally {
    app.restore();
  }
});

test('AC94 + AC77 (round 2, N2): a notification\'s tap on a held question opens Waiting with its card in the section brought into view', async () => {
  const b = busiestState();
  const key = qid('Beta', HELD_PATH);
  const rowOf = `row-q-${key.replace(/[^A-Za-z0-9_-]/g, '-')}`;
  // A layout (made up): the held question's card 1500 px down the page, everything else at the top.
  const saved = Object.getOwnPropertyDescriptor(El0.prototype, 'getBoundingClientRect');
  El0.prototype.getBoundingClientRect = function rect() {
    const top = this.attrs && this.attrs.id === rowOf ? 1500 : 0;
    return { left: 0, right: 0, top, bottom: top, width: 0, height: 0 };
  };
  const app = await loadSandbox({ ...b, hash: '', search: `?open=${enc(key)}`, now: NOW, store: seen(NOW + H, b.seed) });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.equal(app.loc.hash, '#/waiting');
    const card = qcard(app, key);
    assert.equal(card.attrs['data-question'], 'held');
    assert.equal(card.attrs.id, rowOf, 'its card carries the row id the tap scrolls to');
    assert.ok(app.scrolls.some(([x, y]) => x === 0 && y === 1492), `brought into view, 8 px above its top: ${JSON.stringify(app.scrolls)}`);
    assert.equal(keyed(app, 'tap-banner').textContent, 'Opened from a notification');
  } finally {
    if (saved) Object.defineProperty(El0.prototype, 'getBoundingClientRect', saved); else delete El0.prototype.getBoundingClientRect;
    app.restore();
  }
});
