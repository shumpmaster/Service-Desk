// AC53, as trial-view note 15 extended it (2026-10-15): wherever a ruling is asked of the owner, each
// question on its own with its own answer box, and the answers prefilling the ruling file.
// ac-test: S-001/AC53 join-test: S-001/J3
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIX, CONFIG, fixture } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { NOW, v3 } from './sandbox-fixtures.mjs';
import { questionQuestions, composeAnswer, numberedRuleLine, oneLine, numberRecommendation, ruleLine, boxPlan, CANT_SPLIT } from '../../src/lib/sandbox.js';

const LAB = readFileSync(join(FIX, 'trial-view', 'P-001-design-lab-open.md'), 'utf8');
const LAB_TITLE = "eleven short questions on the desk's screens";
const LAB_BLOCK = LAB.split('\n').filter((l) => /^ {2}\d+\. /.test(l));
const LETTERED = "# Ruling needed: which sources count\n\nWHY: a test.\nOPTIONS:\n  A. Only primary sources — slower.\n  B. Primary and vendor sources —\n     faster, with a label.\nRECOMMENDATION: B — the label keeps it honest.\nRISK CLASS: R0\n";

// ---------------------------------------------------------------------------
// Where the questions come from

test('AC53 (note 15): a lettered question file is one question, its letters as choices, its recommendation the letter starting RECOMMENDATION:', () => {
  const qs = questionQuestions(LETTERED, 'which sources count');
  assert.equal(qs.form, 'lettered');
  assert.equal(qs.questions.length, 1);
  assert.equal(qs.questions[0].text, 'which sources count');
  assert.deepEqual(qs.questions[0].choices, [{ value: 'A', text: 'Only primary sources — slower.' }, { value: 'B', text: 'Primary and vendor sources — faster, with a label.' }], 'a line indented further continues the one above');
  assert.equal(qs.recLetter, 'B');
  assert.equal(qs.questions[0].recommendation, 'B — the label keeps it honest.');
  assert.deepEqual(qs.block, ['  A. Only primary sources — slower.', '  B. Primary and vendor sources —', '     faster, with a label.']);
});

test('AC53 (note 15): questions/P-001-design-lab-open.md is numbered — eleven pairs, each with its own recommendation, "1 " never matching "10 " or "11 "', () => {
  const qs = questionQuestions(LAB, LAB_TITLE);
  assert.equal(qs.form, 'numbered');
  assert.equal(qs.questions.length, 11);
  assert.deepEqual(qs.questions.map((q) => q.n), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.match(qs.questions[0].text, /^Home's "Tell your Chief of Staff…" bar: keep it/);
  assert.ok(qs.questions.every((q) => q.choices.length === 0), 'no choices: the file lists none per number');
  assert.deepEqual(qs.questions.map((q) => q.recommendation), ['leave deferred', 'yes', 'agree', 'agree', 'yes', 'yes', 'under Decisions', 'keep', 'linked only',
    "your Chief of Staff's sessions recorded first", 'yes, Active']);
  assert.equal(numberRecommendation('1 a; 10 b; 11 c.', 1), 'a');
  assert.equal(numberRecommendation('10 b; 11 c.', 1), null, '"1 " never matches "10 "');
  assert.equal(numberRecommendation('1 a; 11 c.', 11), 'c', 'a final full stop dropped');
  assert.equal(numberRecommendation(null, 1), null);
});

test('AC53 (note 15): the one-box fallback — no OPTIONS: line, an empty block, mixed lines, and a number missing, repeated or out of order', () => {
  const base = '# Ruling needed: t\n\nWHY: x\n';
  for (const [text, why] of [
    [`${base}RECOMMENDATION: A\n`, /no OPTIONS: line/],
    [`${base}OPTIONS:\nRECOMMENDATION: A\n`, /empty/],
    [`${base}OPTIONS:\n  A. one\n  2. two\nRECOMMENDATION: A\n`, /mixed/],
    [`${base}OPTIONS:\n  1. one\n  3. three\nRECOMMENDATION: 1 x\n`, /missing or out of order/],
    [`${base}OPTIONS:\n  1. one\n  1. again\n`, /repeated/],
    [`${base}OPTIONS:\n  2. two\n  1. one\n`, /out of order/],
  ]) {
    const qs = questionQuestions(text, 't');
    assert.equal(qs.form, 'fallback', text);
    assert.match(qs.why, why);
  }
});

// ---------------------------------------------------------------------------
// What the answers prefill, character for character

test('AC53 (note 15): a numbered ruling — answered numbers in order joined by "; ", a blank number left out, line breaks and "; " joined; "a;", a line break and "b" give "a, b"', () => {
  const qs = questionQuestions(LAB, LAB_TITLE);
  const c = composeAnswer({ kind: 'question', name: 'P-001-design-lab-open', qs },
    { 3: { words: 'agree' }, 1: { words: '  leave it\n   deferred for now ' }, 2: { words: '' }, 7: { words: 'a;\nb' }, 9: { words: 'linked; shown later' } });
  assert.equal(c.text, `Ruling: 1 leave it deferred for now; 3 agree; 7 a, b; 9 linked, shown later\n\nQuestion: questions/P-001-design-lab-open.md\n\nQuestions, as put:\n${LAB_BLOCK.join('\n')}\n`);
  assert.deepEqual(c.joined, [1, 7, 9]);
  assert.ok(!c.text.includes('leave deferred'), 'no recommendation is copied in');
  assert.deepEqual(oneLine('a;\nb'), { text: 'a, b', joined: true }, 'line breaks joined first, then "; "');
  assert.deepEqual(oneLine('plain'), { text: 'plain', joined: false });
  // The rule line: line 1 starts "Ruling: ", names the numbers with no answer yet, and says what was joined.
  const r = numberedRuleLine(c.text, qs, c.joined);
  assert.equal(r.ok, true);
  assert.equal(r.words, 'In form: line 1 is "Ruling: " with 4 answers. No answer yet for 2, 4, 5, 6, 8, 10 and 11. '
    + 'Answer 1 joined into one line (line breaks became spaces, "; " became ", "). Answer 7 joined into one line (line breaks became spaces, "; " became ", "). '
    + 'Answer 9 joined into one line (line breaks became spaces, "; " became ", ").');
  const two = composeAnswer({ kind: 'question', name: 'x', qs: { ...qs, questions: qs.questions.slice(0, 7) } }, { 1: { words: 'a' }, 2: { words: 'b' }, 4: { words: 'c' }, 5: { words: 'd' }, 6: { words: 'e' } });
  assert.match(numberedRuleLine(two.text, { questions: qs.questions.slice(0, 7) }, []).words, /No answer yet for 3 and 7\./);
  assert.equal(numberedRuleLine('Decision: 1 x\n', qs).ok, false);
  assert.match(numberedRuleLine('Ruling: \n', qs).words, /No answer yet/);
});

test('AC53 (note 15): a lettered ruling — "Ruling: <letter>", J3\'s Question line, then the question and its options as they were put, then the owner\'s words', () => {
  const qs = questionQuestions(LETTERED, 'which sources count');
  const c = composeAnswer({ kind: 'question', name: 'Q-005-sources', qs }, { 1: { choice: 'A', words: 'Keep it strict.\n' } });
  assert.equal(c.text, 'Ruling: A\n\nQuestion: questions/Q-005-sources.md\n\nQuestion, as put: which sources count\nOptions, as put:\n'
    + '  A. Only primary sources — slower.\n  B. Primary and vendor sources —\n     faster, with a label.\n\nKeep it strict.\n');
  assert.ok(!c.text.includes('label keeps it honest'), 'never the recommendation');
  assert.equal(ruleLine('question', c.text).ok, true);
  assert.match(ruleLine('question', composeAnswer({ kind: 'question', name: 'Q-005-sources', qs }, {}).text, { letters: ['A', 'B'] }).words, /pick A or B above/);
  // The URL form is J3's, at the default branch.
  const plan = boxPlan(v3('Service-Desk'), 6000, { form: 'question', path: 'decisions/questions/Q-005-sources.md' }, c.text);
  assert.equal(plan.url, `https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2Fquestions%2FQ-005-sources.md&value=${encodeURIComponent(c.text)}`);
});

test('AC53 (note 15): a card carries only its card form; the owner\'s words go in Reason: with hold and recycle, else after the empty line 2; on a phase-gate card each note line is indented two spaces', () => {
  assert.equal(composeAnswer({ kind: 'card', gateCard: false }, { 1: { choice: 'build' } }).text, 'Decision: build\n\n');
  assert.equal(composeAnswer({ kind: 'card', gateCard: false }, { 1: { choice: 're-scope', words: 'Lighter path.\nSee the notes.' } }).text, 'Decision: re-scope\n\nLighter path.\nSee the notes.\n');
  assert.equal(composeAnswer({ kind: 'card', gateCard: true }, { 1: { choice: 'hold', words: 'waiting for\nthe screens' } }).text, 'Decision: hold\n\nReason: waiting for the screens\n');
  assert.equal(composeAnswer({ kind: 'card', gateCard: true }, { 1: { choice: 'recycle', words: 'the plan missed a screen' } }).text, 'Decision: recycle\n\nInto: \nReason: the plan missed a screen\n');
  // Build review N2: Reason: joins line breaks only; "; " stays as written (the ", " rule is for numbered rulings).
  assert.equal(composeAnswer({ kind: 'card', gateCard: true }, { 1: { choice: 'hold', words: 'the screens first; then the copy\n  and the  tests;\r\nlater' } }).text,
    'Decision: hold\n\nReason: the screens first; then the copy and the  tests; later\n');
  assert.equal(composeAnswer({ kind: 'card', gateCard: true }, { 1: { choice: 'recycle', words: 'a; b' } }).text, 'Decision: recycle\n\nInto: \nReason: a; b\n');
  const note = composeAnswer({ kind: 'card', gateCard: true }, { 1: { choice: 'proceed', words: 'Into: build\nReason: none\nNothing needed: x\nUser-Override: y' } }).text;
  assert.equal(note, 'Decision: proceed\n\n  Into: build\n  Reason: none\n  Nothing needed: x\n  User-Override: y\n');
  // No note line can be read as a field: none starts a line with a gate card's field words.
  assert.ok(note.split('\n').slice(1).every((l) => !/^(Into|Reason|Nothing needed|User-Override):/.test(l)));
  assert.equal(ruleLine('card', note, { words: ['proceed', 'hold', 'recycle', 'kill'], gateCard: true }).ok, true);
  assert.match(ruleLine('card', 'Decision: hold\n\n  Reason: indented is not a field\n', { words: ['proceed', 'hold'], gateCard: true }).words, /needs a "Reason:" line/);
  assert.match(ruleLine('card', 'Decision: \n\n', { words: ['proceed', 'hold'], gateCard: true }).words, /Pick one of the card's words above: proceed, hold\./);
});

test('AC53 (note 15): a file that couldn\'t be split takes J3\'s question form with the owner\'s words after it', () => {
  const qs = questionQuestions('# Ruling needed: t\n\nWHY: x\n', 't');
  assert.equal(composeAnswer({ kind: 'question', name: 'P-009-x', qs }, { 1: { words: 'Do the smaller one.' } }).text, 'Ruling: \n\nQuestion: questions/P-009-x.md\n\nDo the smaller one.\n');
});

// ---------------------------------------------------------------------------
// On the page

function sheetRepo(extra) {
  return repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), ...extra });
}
async function openSheet(files, hash) {
  const config = { ...CONFIG, projects: [v3('Alpha')] };
  const app = await loadSandbox({ config, repos: { Alpha: sheetRepo(files) }, hash, now: NOW });
  await app.advance(1000);
  return app;
}
const finalBox = (app) => findAll(app.view, (e) => e.tag === 'textarea' && /^box:/.test(e.dataset.k || ''))[0];
const words = (app, n) => findAll(app.view, (e) => e.tag === 'textarea' && new RegExp(`^words:.*:${n}$`).test(e.dataset.k || ''))[0];
const type = (ta, text) => { ta.value = text; ta.dispatch('input', { target: ta }); };

test('AC53 (note 15), on the page: a card\'s question from its "## 1. The decision" section, its option words as choices, the recommendation labelled and not picked, and a text box', async () => {
  const app = await openSheet({ 'queue/P-001-stop-6.md': fixture('service-desk/queue/P-001-stop-6.md') }, '#/p/Alpha/queue/card%3Aqueue%2FP-001-stop-6.md');
  try {
    const qsec = byClass(app.view, 'sb-q');
    assert.equal(qsec.length, 1, 'one question for a card');
    assert.equal(byClass(qsec[0], 'sb-q-t')[0].textContent, 'The work reached the stop rule. What happens next?');
    const chips = byClass(qsec[0], 'sb-chip');
    assert.deepEqual(chips.map((c) => c.textContent), ['re-specify', 'criteria-wrong', 'confirm', 're-scope', 'drop']);
    assert.ok(chips.every((c) => c.attrs['aria-checked'] === 'false'), 'nothing picked');
    assert.match(byClass(qsec[0], 'sb-rec')[0].textContent, /^Recommended The Chief of Staff's part/);
    assert.ok(words(app, 1), 'its own text box');
    chips[3].click();
    await app.flush();
    type(words(app, 1), 'Go the lighter way.');
    await app.flush();
    assert.equal(finalBox(app).value, 'Decision: re-scope\n\nGo the lighter way.\n');
    assert.match(byClass(app.view, 'sb-rule')[0].textContent, /In form: line 1 is "Decision: re-scope"/);
  } finally {
    app.restore();
  }
});

test('AC53 (note 15), on the page: the numbered question file shows eleven question-and-answer pairs, none picked, and prefills the ruling as the owner types', async () => {
  const app = await openSheet({ 'questions/P-001-design-lab-open.md': LAB }, '#/p/Alpha/queue/q%3AP-001-design-lab-open');
  try {
    const qsec = byClass(app.view, 'sb-q');
    assert.equal(qsec.length, 11);
    qsec.forEach((q, i) => {
      assert.equal(findAll(q, (e) => e.tag === 'h3')[0].textContent, `Question ${i + 1}`);
      assert.equal(byClass(q, 'sb-chip').length, 0);
      assert.match(byClass(q, 'sb-rec')[0].textContent, /^Recommended /);
    });
    assert.match(byClass(qsec[10], 'sb-rec')[0].textContent, /^Recommended yes, Active/);
    assert.match(finalBox(app).value, /^Ruling: \n\nQuestion: questions\/P-001-design-lab-open\.md\n\nQuestions, as put:\n {2}1\. /, 'nothing prefilled from the recommendations');
    type(words(app, 1), 'leave deferred');
    type(words(app, 4), 'a;\nb');
    await app.flush();
    assert.equal(finalBox(app).value.split('\n')[0], 'Ruling: 1 leave deferred; 4 a, b');
    const rule = byClass(app.view, 'sb-rule')[0].textContent;
    assert.match(rule, /No answer yet for 2, 3, 5, 6, 7, 8, 9, 10 and 11\./);
    assert.match(rule, /Answer 4 joined into one line/);
    assert.equal(byClass(app.view, 'sb-go').length, 1, 'the button stays available');
    assert.match(byClass(app.view, 'sb-go')[0].attrs.href, /^https:\/\/github\.com\/shumpmaster\/Alpha\/new\/main\?filename=decisions%2Fquestions%2FP-001-design-lab-open\.md&value=Ruling%3A%201%20leave%20deferred%3B%204%20a%2C%20b%0A/);
  } finally {
    app.restore();
  }
});

test('AC53 (note 15), on the page: a file that can\'t be split shows the file whole, its link, one text box and the line saying so', async () => {
  const app = await openSheet({ 'questions/P-009-mixed.md': '# Ruling needed: a mixed file\n\nWHY: x\nOPTIONS:\n  A. one\n  2. two\nRECOMMENDATION: A\n' }, '#/p/Alpha/queue/q%3AP-009-mixed');
  try {
    assert.match(app.text(), new RegExp(CANT_SPLIT));
    assert.equal(byClass(app.view, 'sb-q').length, 1);
    assert.ok(words(app, 1));
    assert.ok(byClass(app.view, 'sb-record')[0].innerHTML.includes('a mixed file'), 'the file shown whole');
    type(words(app, 1), 'A, but smaller.');
    await app.flush();
    assert.equal(finalBox(app).value, 'Ruling: \n\nQuestion: questions/P-009-mixed.md\n\nA, but smaller.\n');
  } finally {
    app.restore();
  }
});

test('AC53 (note 15) + AC56: each answer box keeps what the owner typed or picked through a refresh; editing the file by hand keeps the edit, with a way to rebuild it', async () => {
  const app = await openSheet({ 'questions/P-001-design-lab-open.md': LAB }, '#/p/Alpha/queue/q%3AP-001-design-lab-open');
  try {
    type(words(app, 2), 'yes');
    await app.flush();
    const w2 = words(app, 2);
    await app.advance(60_000);
    await app.tick();
    app.module.refresh();
    await app.flush();
    assert.equal(words(app, 2), w2, 'the same box');
    assert.equal(w2.value, 'yes');
    type(finalBox(app), 'Ruling: 2 yes, and a note by hand\n');
    await app.flush();
    type(words(app, 3), 'agree');
    await app.flush();
    assert.equal(finalBox(app).value, 'Ruling: 2 yes, and a note by hand\n', 'an edit by hand is never overwritten');
    const rebuild = byClass(app.view, 'sb-btn').find((b) => b.textContent === 'Rebuild from my answers');
    rebuild.click();
    await app.flush();
    assert.equal(finalBox(app).value.split('\n')[0], 'Ruling: 2 yes; 3 agree');
  } finally {
    app.restore();
  }
});
