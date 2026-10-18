// Model 3.5.0's records on the desk (spec S-001, revision of 2026-10-17; model S-033, L-0016): a
// question's and an answer record's `Milestone:` line and a question's `## Context` (J2, AC3, AC66),
// a card's `Milestone:` line under `answer:` and its `## Context` (J2, AC66), "Done today"'s link from
// the answer record (AC66), the sandbox's answer box carrying the question's line (AC53, J3's sandbox
// part, the accepted link unchanged) and the parsed cache's key (J6).
//
// Fixtures: tests/desk/fixtures/s033/ (tests/desk/fixtures/README.md says how each was made or
// checked: `governance_checks questions`, `card_text`, `closing_problem`; the real template at
// 368effa, the real questions at 3f206a5 and their real answers at d727b64, and
// decisions/questions/P-001-asks-merge.md at 368effa).
// join-test: S-001/J2 join-test: S-001/J3 join-test: S-001/J6
// ac-test: S-001/AC3 ac-test: S-001/AC53 ac-test: S-001/AC66
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIX, CONFIG, fixture, fakeClock } from './helpers.mjs';
import { repo, fakeServer, gitSha } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, linksIn } from './sandbox-helpers.mjs';
import { NOW, iso, twoProjects, opened, v3 } from './sandbox-fixtures.mjs';
import { keyed, SD3, sdRepo } from './tv2-fixtures.mjs';
import { parseCard, parseQuestion, firstMilestoneLine, milestoneValue, cardMilestoneLine } from '../../src/lib/records.js';
import { buildModel, parseRecord, recordKind } from '../../src/lib/model.js';
import { prBodyParts } from '../../src/lib/pulls.js';
import { answerPlan, questionAnswerContent } from '../../src/lib/links.js';
import { questionQuestions, composeAnswer, ruleLine, numberedRuleLine, questionBoxText, boxPlan, milestoneRuleWords } from '../../src/lib/sandbox.js';
import { createDesk, POLL_MS, BLOB_CACHE_KEY, OLD_BLOB_CACHE_KEYS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';

const S = (p) => readFileSync(join(FIX, 's033', p), 'utf8');
const LAB = readFileSync(join(FIX, 'trial-view', 'P-001-design-lab-open.md'), 'utf8');
const QS = { milestone: 'S033-milestone', two: 'S033-two', standard: 'S033-standard', none: 'S033-none' };
const SD = { ...SD3, planning: false };

// ---------------------------------------------------------------------------
// J2: the forms

test('J2 (S-033): the real template at 368effa has the `Milestone:` line after the title and `## Context` after DEFAULT and TIMEOUT; nothing else the desk takes moves', () => {
  const t = S('questions/_TEMPLATE.md');
  const ls = t.split('\n');
  assert.match(ls[0], /^# Ruling needed: /);
  assert.equal(ls[1], '');
  assert.match(ls[2], /^Milestone: /);
  assert.ok(ls.indexOf('## Context') > ls.findIndex((l) => l.startsWith('DEFAULT:')), 'Context after the last labelled line');
  for (const name of Object.values(QS)) {
    const q = parseQuestion(S(`questions/${name}.md`), name);
    assert.match(q.title, /^A made-up question/);
    assert.equal(q.titleFromFile, true);
    assert.match(q.why, /^a made-up question for the desk's tests/);
    assert.deepEqual(q.options.map((o) => o.letter), ['A', 'B']);
    assert.equal(q.recommendationLetter, 'A');
    assert.deepEqual([q.riskClass, q.reversibility, q.blastRadius, q.default, q.timeout], ['R0', 'reversible', "the desk's tests only", 'A', '48']);
  }
});

test('J2 (S-033): each question\'s `Milestone:` value — a project milestone, two ids, a standard id, and `none (<reason>)` — and each Context bullet with its source, against the files', () => {
  const want = { milestone: { ids: ['MD3'] }, two: { ids: ['M2', 'M2B'] }, standard: { ids: ['Design-6'] }, none: { none: 'a records-only question' } };
  for (const [k, name] of Object.entries(QS)) {
    const text = S(`questions/${name}.md`);
    assert.equal(firstMilestoneLine(text), text.split('\n')[2], `${name}: the first column-0 line, as written`);
    assert.deepEqual(milestoneValue(firstMilestoneLine(text)), want[k], name);
    const bullets = text.split('\n').filter((l) => l.startsWith('- '));
    const ctx = prBodyParts(text).context;
    assert.equal(ctx.length, bullets.length, name);
    ctx.forEach((c, i) => {
      assert.equal(`- ${c.fact} (source: ${c.source})`, bullets[i], `${name}: bullet ${i + 1}`);
      assert.equal(c.exception, false);
    });
  }
  // The source is the text inside the bullet's last ` (source: `: a fact holding its own brackets keeps them.
  const two = prBodyParts(S('questions/S033-milestone.md')).context[1];
  assert.deepEqual([two.fact, two.source], ['The sandbox reads the default branch only (it has a second paren (here))', 'specs/S-001.md, J11']);
});

test('J2 (S-033): a question in the old form (the frozen P-001-design-lab-open.md) has neither part; a `Milestone:` line not in column 0 is not read', () => {
  assert.equal(firstMilestoneLine(LAB), null);
  assert.equal(prBodyParts(LAB).context, null);
  assert.equal(firstMilestoneLine('# Ruling needed: x\n\n  Milestone: M1\nWHY: y\n'), null);
  assert.equal(firstMilestoneLine('# x\nMilestone: M1  \t\n'), 'Milestone: M1', 'trailing white space dropped');
  assert.deepEqual(milestoneValue('Milestone: none (because (it) says so)'), { none: 'because (it) says so' });
  assert.equal(milestoneValue(null), null);
});

test('J2 (S-033): the cards card_text wrote — the `Milestone:` line under `answer:`, the `## Context` section stopping before `## 8.`; the seven parts read as before', () => {
  const c1 = S('queue/P-002-stop-1.md');
  const c2 = S('queue/P-003-launch-2.md');
  const c3 = S('queue/Q-013-stop-2.md');
  assert.equal(cardMilestoneLine(c1), 'Milestone: M2');
  assert.equal(cardMilestoneLine(c2), null, 'a gate card with no milestone: no line');
  assert.equal(cardMilestoneLine(c3), null);
  for (const [text, path] of [[c1, 'decisions/P-002/stop-1.md'], [c2, 'decisions/P-003/launch-2.md'], [c3, 'decisions/Q-013/stop-2.md']]) {
    const c = parseCard(text);
    assert.equal(c.answerPath, path);
    assert.deepEqual(c.notes, []);
    assert.ok(c.title && c.options.length >= 3);
  }
  assert.deepEqual(prBodyParts(c1).context.map((x) => [x.fact, x.source]), [
    ['stage 5, role builder, last verdict FAIL', 'status/P-002.toml'], ['plan round 2, build round 3', 'status/P-002.toml'], ['the spec, S-002', 'specs/S-002-made-up.md']]);
  const ctx2 = prBodyParts(c2).context;
  assert.deepEqual(ctx2.map((x) => x.source), ['status/P-003.toml', 'status/P-003.toml', 'docs/gates/P-003/launch-gate-2-case.md'], 'it stops before ## 8.');
  assert.ok(c2.indexOf('## Context') < c2.indexOf('## 8. What approval merges'));
  // Only the line directly under `answer:` is the card's: one anywhere else is not.
  assert.equal(cardMilestoneLine(c2.replace('## 1. The decision', 'Milestone: M9\n## 1. The decision')), null);
  assert.equal(cardMilestoneLine(c3.replace(/\n\n## 1\. The decision/, '\nMilestone: MD1\n\n## 1. The decision')), 'Milestone: MD1');
});

test('J2 (S-033): an answer record\'s milestone — its first column-0 `Milestone:` line after line 1, in each form; none in the real P-001-asks-merge.md and the accepted link\'s form', () => {
  const ruling = (text) => parseRecord('ruling', text, 'decisions/questions/x.md');
  // real: the Chief of Staff's answers, Proxy: on line 2 and Milestone: on line 3 (closing_problem passes them).
  assert.equal(ruling(S('decisions/questions/P-001-asks-merge-on-desk.md')).milestone, 'Milestone: MD2');
  assert.equal(ruling(S('decisions/questions/P-001-cos-sessions-on-desk.md')).milestone, 'Milestone: MD2');
  assert.equal(ruling(S('decisions/questions/S033-milestone.md')).milestone, 'Milestone: MD3', 'the made-up Chief of Staff form closing_problem passes');
  // real, asked before S-033 was adopted: no line.
  const old = ruling(S('decisions/questions/P-001-asks-merge.md'));
  assert.equal(old.milestone, null);
  assert.equal(old.line2Proxy, true);
  // Made from decisions/README.md:43 and J3; no model code checks these forms.
  assert.equal(ruling('Ruling: A\n\nMilestone: MD3\n\nmy words\n').milestone, 'Milestone: MD3', "the owner's own form");
  assert.equal(ruling(questionBoxText('A', 'S033-milestone', 'Milestone: MD3')).milestone, 'Milestone: MD3', "the answer box's form");
  assert.equal(ruling(questionAnswerContent('A', 'S033-milestone', '')).milestone, null, "the accepted link's form");
  assert.equal(ruling('Milestone: MD3\n').milestone, null, 'line 1 is never the answer\'s Milestone line');
  // The fixtures' README records the model's verdicts.
  const readme = readFileSync(join(FIX, 'README.md'), 'utf8');
  assert.match(readme, /closing_problem\(P-001-asks-merge-on-desk[^\n]*\): None/);
  assert.match(readme, /governance_checks\.py questions: exit 0/);
});

// ---------------------------------------------------------------------------
// AC3: flagged as before; answered and still in the tree, answered

function modelOf(files) {
  const tree = new Map(Object.keys(files).map((p, i) => [p, { sha: (i + 1).toString(16).padStart(40, 'a'), size: 1 }]));
  const records = new Map();
  for (const [p, text] of Object.entries(files)) if (text != null) records.set(p, parseRecord(recordKind(p, 'v3'), text, p));
  return buildModel({ project: SD, config: CONFIG, tree, records, history: new Map(), pullPages: [], checkPages: [], checksState: 'ok', now: new Date(NOW) });
}

test('AC3 (S-033): a question in S-033\'s form is flagged by the same rule, with its title; once answered it is answered while its file waits to be tidied away', () => {
  const qp = 'questions/S033-milestone.md';
  const m = modelOf({ [qp]: S(qp), 'questions/_TEMPLATE.md': S('questions/_TEMPLATE.md') });
  const q = m.flagged.filter((f) => f.kind === 'question');
  assert.equal(q.length, 1, 'the template is not a question');
  assert.equal(q[0].title, 'Question: A made-up question naming one project milestone');
  const answered = modelOf({ [qp]: S(qp), 'decisions/questions/S033-milestone.md': S('decisions/questions/S033-milestone.md') });
  assert.equal(answered.flagged.filter((f) => f.kind === 'question').length, 0, 'answered, not flagged');
});

// ---------------------------------------------------------------------------
// AC66 on the page

const qRow = (app, key) => keyed(app, `unb:${key}`);
const unbLine = (app, key) => byClass(qRow(app, key), 'sb-unb-l').map((x) => x.textContent);

function s033Setup() {
  const setup = twoProjects();
  setup.repos.Alpha.commit({
    'questions/S033-milestone.md': S('questions/S033-milestone.md'),
    'questions/S033-two.md': S('questions/S033-two.md'),
    'questions/S033-standard.md': S('questions/S033-standard.md'),
    'questions/S033-none.md': S('questions/S033-none.md'),
    'questions/P-001-design-lab-open.md': LAB,
    'queue/P-002-stop-1.md': S('queue/P-002-stop-1.md'),
    'queue/P-003-launch-2.md': S('queue/P-003-launch-2.md'),
    'queue/Q-013-stop-2.md': S('queue/Q-013-stop-2.md'),
  });
  return setup;
}

test('AC66 (S-033): "Unblocks" and the Context fold from a question\'s own lines; a card\'s from the line under `answer:` and its `## Context` before `## 8.`; a card with no line falling to its item', async () => {
  const app = await opened(s033Setup(), '#/p/Alpha/queue');
  try {
    await app.advance(POLL_MS);
    assert.deepEqual(unbLine(app, 'q:S033-milestone'), ['Unblocks The chosen design running on the real back end MD3']);
    assert.deepEqual(unbLine(app, 'q:S033-two'), ['Unblocks Cards answered straight from the desk M2', 'Unblocks Agent usage shown on the desk M2B']);
    assert.deepEqual(unbLine(app, 'q:S033-standard'), ['Unblocks A plan that passed review Design-6']);
    assert.deepEqual(unbLine(app, 'q:S033-none'), ['Unblocks no milestone: a records-only question']);
    assert.deepEqual(unbLine(app, 'q:P-001-design-lab-open'), ['Unblocks: milestone not recorded'], 'the old form');
    assert.deepEqual(unbLine(app, 'card:queue/P-002-stop-1.md'), ['Unblocks Cards answered straight from the desk M2'], 'the card\'s own line');
    assert.deepEqual(unbLine(app, 'card:queue/Q-013-stop-2.md'), ['Unblocks What a good desk looks like is known MD1'], 'no line: its item Q-013, which MD1 lists');
    assert.deepEqual(unbLine(app, 'card:queue/P-003-launch-2.md'), ['Unblocks: milestone not recorded'], 'no line, and its item in no plan list');
    // The Context folds.
    await app.tap(keyed(app, 'fold:ctx:q:S033-milestone'));
    assert.deepEqual(findAll(keyed(app, 'facts:q:S033-milestone'), (e) => e.tag === 'li').map((x) => x.textContent),
      ['The chosen design is to run on the real back enddocs/PROJECT.md, section 3', 'The sandbox reads the default branch only (it has a second paren (here))specs/S-001.md, J11']);
    await app.tap(keyed(app, 'fold:ctx:card:queue/P-003-launch-2.md'));
    const facts = findAll(keyed(app, 'facts:card:queue/P-003-launch-2.md'), (e) => e.tag === 'li').map((x) => x.textContent);
    assert.deepEqual(facts, ['stage 6, role critic-gate, last verdict PASSstatus/P-003.toml', 'plan round 1, build round 1status/P-003.toml',
      "the Launch gate's case 2docs/gates/P-003/launch-gate-2-case.md"], 'stopping before ## 8.');
    await app.tap(keyed(app, 'fold:ctx:q:P-001-design-lab-open'));
    assert.equal(keyed(app, 'facts:q:P-001-design-lab-open').textContent, 'Context: not recorded');
  } finally {
    app.restore();
  }
});

test('AC66 (S-033): "Done today"\'s link for a ruling — from its answer record\'s `Milestone:` line with no question file in the tree; an accepted-link answer from its question while the tree holds it, from the edited question after an edit, and "sprint: not recorded" once it is gone', async () => {
  const setup = twoProjects();
  const A = setup.repos.Alpha;
  const at = (min) => [{ commit: { committer: { date: iso(NOW - min * 60e3) } } }];
  A.commit({
    // The Chief of Staff's answer (real, Milestone: MD2 on line 3); its question tidied away.
    'decisions/questions/P-001-asks-merge-on-desk.md': S('decisions/questions/P-001-asks-merge-on-desk.md'),
    // An answer made through the accepted views' link: no Milestone: line; its question still in the tree.
    'questions/S033-milestone.md': S('questions/S033-milestone.md'),
    'decisions/questions/S033-milestone.md': questionAnswerContent('A', 'S033-milestone', ''),
  });
  Object.assign(A.history, { 'decisions/questions/P-001-asks-merge-on-desk.md': at(30), 'decisions/questions/S033-milestone.md': at(35) });
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha/queue', now: NOW });
  const rowOf = (codeText) => byClass(keyed(app, 'done-today'), 'sb-done-r').find((r) => byClass(r, 'code').some((c) => c.textContent === codeText));
  const link = (r) => linksIn(r).find((l) => l.text === 'On the Timeline');
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.equal(link(rowOf('P-001-asks-merge-on-desk')).href, '#/p/Alpha/timeline/ms/MD2', 'from the answer record, with no question file');
    assert.equal(link(rowOf('S033-milestone')).href, '#/p/Alpha/timeline/ms/MD3', 'from its question, while the tree holds it');
    // The question is edited after the answer: the desk reads it as the tree holds it now (J2's known limit).
    A.commit({ 'questions/S033-milestone.md': S('questions/S033-milestone.md').replace('Milestone: MD3', 'Milestone: MD1') });
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.equal(link(rowOf('S033-milestone')).href, '#/p/Alpha/timeline/ms/MD1', 'from the edited question');
    // Tidied away: "sprint: not recorded".
    A.commit({ 'questions/S033-milestone.md': null });
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.equal(link(rowOf('S033-milestone')), undefined);
    assert.match(rowOf('S033-milestone').textContent, / · sprint: not recorded$/);
    assert.equal(link(rowOf('P-001-asks-merge-on-desk')).href, '#/p/Alpha/timeline/ms/MD2', 'the answer that carries its line still links');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC53 and J3: the answer box carries the line; the accepted link does not change

test('AC53 (S-033): the answer box carries the question\'s `Milestone:` line after the `Question:` line, value for value, for a lettered, a numbered and an unsplittable question', () => {
  for (const name of Object.values(QS)) {
    const text = S(`questions/${name}.md`);
    const line = firstMilestoneLine(text);
    const qs = questionQuestions(text, parseQuestion(text, name).title);
    assert.equal(qs.form, 'lettered');
    const out = composeAnswer({ kind: 'question', name, qs, milestone: line }, { 1: { choice: 'A', words: 'yes' } }).text;
    assert.equal(out.split('\n').slice(0, 4).join('\n'), `Ruling: A\n\nQuestion: questions/${name}.md\n${line}`, name);
    assert.equal(parseRecord('ruling', out, `decisions/questions/${name}.md`).milestone, line, 'read back as the answer\'s line');
    assert.equal(ruleLine('question', out, { milestone: line, letters: ['A', 'B'] }).ok, true);
  }
  const ms = 'Milestone: M2, M2B';
  const numbered = questionQuestions(LAB, 'eleven');
  const n = composeAnswer({ kind: 'question', name: 'P-001-design-lab-open', qs: numbered, milestone: ms }, { 1: { words: 'leave deferred' } }).text;
  assert.equal(n.split('\n').slice(0, 4).join('\n'), `Ruling: 1 leave deferred\n\nQuestion: questions/P-001-design-lab-open.md\n${ms}`);
  assert.equal(numberedRuleLine(n, numbered, [], ms).ok, true);
  const fb = questionQuestions('# Ruling needed: t\n\nMilestone: none (x)\n\nWHY: y\n', 't');
  assert.equal(fb.form, 'fallback');
  const f = composeAnswer({ kind: 'question', name: 't', qs: fb, milestone: 'Milestone: none (x)' }, { 1: { words: 'mine' } }).text;
  assert.equal(f, 'Ruling: \n\nQuestion: questions/t.md\nMilestone: none (x)\n\nmine\n');
  // A question in the old form gives none.
  const old = composeAnswer({ kind: 'question', name: 'P-001-design-lab-open', qs: numbered, milestone: firstMilestoneLine(LAB) }, {}).text;
  assert.ok(!/Milestone:/.test(old));
  assert.equal(questionBoxText('B', 'x'), 'Ruling: B\n\nQuestion: questions/x.md\n');
  assert.equal(questionBoxText('B', 'x', 'Milestone: MD3'), 'Ruling: B\n\nQuestion: questions/x.md\nMilestone: MD3\n');
});

test('AC53 (S-033): the rule line names a missing or changed `Milestone:` line and leaves the button available; `none (<reason>)` survives the URL round trip', () => {
  const line = 'Milestone: M2';
  const missing = ruleLine('question', 'Ruling: A\n\nQuestion: questions/x.md\n', { milestone: line });
  assert.equal(missing.ok, false);
  assert.equal(missing.words, 'Line 1 is "Ruling: A". The answer\'s Milestone line should read `Milestone: M2`, as the question\'s does.');
  const changed = ruleLine('question', 'Ruling: A\n\nQuestion: questions/x.md\nMilestone: M3\n', { milestone: line });
  assert.match(changed.words, /should read `Milestone: M2`, as the question's does/);
  assert.equal(milestoneRuleWords('Ruling: A\nMilestone:   M2  \n', line), null, 'the value, its spaces aside');
  assert.equal(milestoneRuleWords('Ruling: A\n', null), null, 'a question with no line asks none');
  assert.match(ruleLine('question', 'Ruling: A\n\nQuestion: questions/x.md\nMilestone: M2\n', { milestone: line }).words, /^In form: line 1 is "Ruling: A", and the Milestone line is the question's\.$/);
  assert.match(numberedRuleLine('Ruling: 1 a\n\nQuestion: questions/x.md\n', { questions: [{ n: 1 }] }, [], line).words, /should read `Milestone: M2`/);
  // The button: still a link, whatever the rule line says.
  const plan = boxPlan(SD, CONFIG.linkCap, { form: 'question', path: 'decisions/questions/x.md' }, 'Ruling: A\n\nQuestion: questions/x.md\n');
  assert.equal(plan.offer, 'link');
  // The round trip of `none (<reason>)`, brackets and spaces, through the URL.
  const text = questionBoxText('A', 'S033-none', 'Milestone: none (a records-only question)');
  const url = boxPlan(SD, CONFIG.linkCap, { form: 'question', path: 'decisions/questions/S033-none.md' }, text).url;
  const back = new URL(url).searchParams.get('value');
  assert.equal(back, text);
  assert.equal(parseRecord('ruling', back, 'decisions/questions/S033-none.md').milestone, 'Milestone: none (a records-only question)');
});

test('AC53 (S-033), on the page: a question in S-033\'s form gives a box and a URL with its `Milestone:` line after the `Question:` line; the rule line names a removed line; the accepted view\'s link stays without it (J3)', async () => {
  const config = { ...CONFIG, projects: [v3('Alpha')] };
  const files = { 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), 'questions/S033-two.md': S('questions/S033-two.md') };
  const app = await loadSandbox({ config, repos: { Alpha: repo(files) }, hash: '#/p/Alpha/queue/q%3AS033-two', now: NOW });
  try {
    await app.advance(1000);
    const box = findAll(app.view, (e) => e.tag === 'textarea' && /^box:/.test(e.dataset.k || ''))[0];
    assert.equal(box.value.split('\n').slice(0, 4).join('\n'), 'Ruling: \n\nQuestion: questions/S033-two.md\nMilestone: M2, M2B');
    const chip = byClass(app.view, 'sb-chip')[0];
    chip.click();
    await app.flush();
    const box2 = findAll(app.view, (e) => e.tag === 'textarea' && /^box:/.test(e.dataset.k || ''))[0];
    assert.match(box2.value, /^Ruling: A\n\nQuestion: questions\/S033-two\.md\nMilestone: M2, M2B\n/);
    const go = byClass(app.view, 'sb-go')[0];
    assert.match(go.attrs.href, /value=Ruling%3A%20A%0A%0AQuestion%3A%20questions%2FS033-two\.md%0AMilestone%3A%20M2%2C%20M2B%0A/);
    assert.match(byClass(app.view, 'sb-rule')[0].textContent, /the Milestone line is the question's/);
    box2.value = 'Ruling: A\n\nQuestion: questions/S033-two.md\n';
    box2.dispatch('input', { target: box2 });
    await app.flush();
    assert.match(byClass(app.view, 'sb-rule')[0].textContent, /should read `Milestone: M2, M2B`, as the question's does/);
    assert.equal(byClass(app.view, 'sb-go').length, 1, 'the button stays available');
  } finally {
    app.restore();
  }
  // J3, the accepted views: the same question's answer link has no Milestone: line (AC19's form, unchanged).
  const p = answerPlan(SD, CONFIG.linkCap, { kind: 'question', name: 'S033-two', options: ['A', 'B'], answered: null }, 'A', '');
  assert.equal(p.url, 'https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2Fquestions%2FS033-two.md&value=Ruling%3A%20A%0A%0AQuestion%3A%20questions%2FS033-two.md%0A');
});

// ---------------------------------------------------------------------------
// J6: the parsed cache's key moves on

test('J6 (S-033): the key is not desk-blobs-v5, which is among the old keys; a parse stored under it is dropped and its blob read and parsed again', async () => {
  assert.equal(BLOB_CACHE_KEY, 'desk-blobs-v6');
  assert.notEqual(BLOB_CACHE_KEY, 'desk-blobs-v5');
  assert.ok(OLD_BLOB_CACHE_KEYS.includes('desk-blobs-v5'));
  const doc = readFileSync(join(FIX, 'j11-reached', 'docs', 'PROJECT.md'), 'utf8');
  const r = sdRepo({ extra: { 'docs/PROJECT.md': doc } });
  // The old parse of this very blob, as a device that loaded the desk before this deploy holds it: no `reached`.
  const oldParse = parseRecord('project-doc', doc, 'docs/PROJECT.md');
  for (const m of oldParse.milestones) delete m.reached;
  const backing = new Map([['desk-blobs-v5', JSON.stringify({ [`project-doc:${gitSha(doc)}`]: oldParse })]]);
  const storage = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, v), removeItem: (k) => backing.delete(k) };
  const clock = fakeClock(Date.parse('2026-10-16T15:00:00Z'));
  const config = { ...CONFIG, projects: [SD3] };
  const server = fakeServer({ [SD3.name]: r }, config, clock);
  const desk = createDesk({ config, call: (p, b) => server.call(p, b), clock, store: createStore(storage), pullsStore: createStore(null), isVisible: () => true, j11: true });
  assert.equal(backing.has('desk-blobs-v5'), false, 'the old key is dropped, not left to fill storage');
  desk.start();
  await clock.runUntil(clock.now() + 3 * POLL_MS);
  desk.stop();
  const rec = desk.snapshot(SD3.name).records.get('docs/PROJECT.md');
  assert.equal(rec.milestones.find((m) => m.id === 'M1').reached, '2026-10-07', 'read and parsed afresh');
  assert.ok(server.calls.some((c) => c.path === '/api/blobs' && JSON.stringify(c.body).includes(gitSha(doc))), 'its blob was fetched');
  assert.ok(JSON.parse(backing.get(BLOB_CACHE_KEY))[`project-doc:${gitSha(doc)}`], 'cached under the new key');
});
