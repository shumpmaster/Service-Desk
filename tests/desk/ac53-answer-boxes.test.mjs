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
// From stage 1a (AC80): the card's sheet over Waiting. Each answer button opens a fully filled-in
// file; the owner's words go into each file from the sheet's box (AC85's box, one per question for a
// numbered one); no rule line.
const sheet = (app) => byClass(app.view, 'v2-sheet')[0];
const words = (app, n) => findAll(sheet(app), (e) => e.tag === 'textarea' && new RegExp(`^words:.*#${n}$`).test(e.dataset.k || ''))[0];
const type = (ta, text) => { ta.value = text; ta.dispatch('input', { target: ta }); };
/** The file a sheet's button opens: its `value`, decoded. */
const fileOf = (app, label) => {
  const a = byClass(sheet(app), 'v2-abtn').find((x) => x.textContent === label);
  assert.ok(a, `a button "${label}"`);
  return decodeURIComponent(/&value=([^&]*)$/.exec(a.attrs.href)[1]);
};

test('AC53 (note 15) + AC80, on the page: a card\'s question from its "## 1. The decision" section, one button per option word, the recommendation labelled and not picked, and a text box whose words go into each file', async () => {
  const app = await openSheet({ 'queue/P-001-stop-6.md': fixture('service-desk/queue/P-001-stop-6.md') }, '#/p/Alpha/queue/card%3Aqueue%2FP-001-stop-6.md');
  try {
    assert.equal(byClass(sheet(app), 'v2-lead')[0].textContent, 'The work reached the stop rule. What happens next?');
    const btns = byClass(sheet(app), 'v2-abtn').filter((x) => x.tag === 'a');
    assert.deepEqual(btns.map((c) => c.textContent), ['Answer: re-specify ↗', 'Answer: criteria-wrong ↗', 'Answer: confirm ↗', 'Answer: re-scope ↗', 'Answer: drop ↗']);
    assert.equal(findAll(sheet(app), (e) => e.attrs['aria-checked'] === 'true').length, 0, 'nothing picked');
    assert.match(sheet(app).textContent, /Recommended The Chief of Staff's part/);
    assert.ok(words(app, 1), 'its own text box');
    assert.equal(fileOf(app, 'Answer: re-scope ↗'), 'Decision: re-scope\n\n', 'with the box empty, exactly AC80\'s file');
    type(words(app, 1), 'Go the lighter way.');
    await app.flush();
    assert.equal(fileOf(app, 'Answer: re-scope ↗'), 'Decision: re-scope\n\nGo the lighter way.\n');
    assert.equal(byClass(app.view, 'sb-rule').length, 0, 'no rule line on the board');
  } finally {
    app.restore();
  }
});

test('AC53 (note 15) + AC80, on the page: the numbered question file shows eleven question-and-answer pairs, each its box, none picked, and one "Answer ↗" whose ruling follows the boxes', async () => {
  const app = await openSheet({ 'questions/P-001-design-lab-open.md': LAB }, '#/p/Alpha/queue/q%3AP-001-design-lab-open');
  try {
    const opts = byClass(sheet(app), 'v2-opt');
    assert.equal(opts.length, 11);
    opts.forEach((q, i) => {
      assert.match(byClass(q, 'v2-ol')[0].textContent, new RegExp(`^${i + 1}\\. `));
      assert.match(byClass(q, 'v2-od')[0].textContent, /^Recommended /);
      assert.ok(words(app, i + 1), `question ${i + 1}: its own box`);
    });
    assert.match(byClass(opts[10], 'v2-od')[0].textContent, /^Recommended yes, Active/);
    assert.match(fileOf(app, 'Answer ↗'), /^Ruling: \n\nQuestion: questions\/P-001-design-lab-open\.md\n\nQuestions, as put:\n {2}1\. /, 'nothing prefilled from the recommendations');
    type(words(app, 1), 'leave deferred');
    type(words(app, 4), 'a;\nb');
    await app.flush();
    assert.equal(fileOf(app, 'Answer ↗').split('\n')[0], 'Ruling: 1 leave deferred; 4 a, b');
    assert.equal(byClass(sheet(app), 'v2-abtn').filter((x) => x.textContent === 'Answer ↗').length, 1, 'one button');
    assert.match(byClass(sheet(app), 'v2-abtn').find((x) => x.textContent === 'Answer ↗').attrs.href, /^https:\/\/github\.com\/shumpmaster\/Alpha\/new\/main\?filename=decisions%2Fquestions%2FP-001-design-lab-open\.md&value=Ruling%3A%201%20leave%20deferred%3B%204%20a%2C%20b%0A/);
  } finally {
    app.restore();
  }
});

// The owner's note of 16 Oct (decisions/questions/P-001-answer-choice-spacing.md): the answer
// choices get more room. Each letter is its own element in its own column, apart from its text, and
// a real space between them, so the choice reads "C Drop it", never "CDrop it". Card chips (option
// words, no text) keep their own look.
const LONG = `# Ruling needed: approve S-031, so the false red check on working branches is fixed

WHY: a test.
OPTIONS:
  A. Approve and build — the spec is frozen as reviewed (round 3 PASS), the Tools builder writes the test then the three trigger lines, the Reviewer checks it, and you merge.
  B. Change it first — say what; it goes back to plan review, and the builder waits for the new draft before writing anything.
  C. Drop it — push runs stay as they are, and each false red on a working branch keeps needing a note saying nothing is wrong.
RECOMMENDATION: A. The full suite passed on the reviewer's prototype.
RISK CLASS: R0
`;

test('AC53 (owner\'s note, 16 Oct) + AC80: each lettered choice holds its letter as its own element, set apart from its words by a real space, each in its own box with room', async () => {
  const app = await openSheet({ 'questions/P-001-long-choices.md': LONG }, '#/p/Alpha/queue/q%3AP-001-long-choices');
  try {
    const opts = byClass(sheet(app), 'v2-opt');
    assert.equal(opts.length, 3);
    const choices = questionQuestions(LONG, 'approve S-031, so the false red check on working branches is fixed').questions[0].choices;
    opts.forEach((o, i) => {
      const name = byClass(o, 'v2-ol')[0];
      const parts = name.children;
      assert.equal(parts[0].attrs.class === undefined ? parts[0].className : parts[0].attrs.class, 'v2-letter', 'the letter its own element');
      assert.equal(parts[0].textContent, `${choices[i].value}.`);
      assert.equal(parts[1].textContent, ' ', 'a real space between');
      assert.equal(parts[2].textContent, choices[i].text, 'the words exactly as in the file');
      assert.doesNotMatch(name.textContent, /^[A-Z]\.\S/, 'never "C.Drop it"');
      assert.equal(name.textContent, `${choices[i].value}. ${choices[i].text}`, 'its accessible name: the letter, a space, the text');
    });
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-abtn')[0].textContent), ['Answer A ↗', 'Answer B ↗', 'Answer C ↗']);
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-rec').length), [1, 0, 0], 'the "Recommended" label stays, on A only');
    assert.ok(words(app, 1), 'the own-words box stays');
    assert.match(fileOf(app, 'Answer C ↗'), /^Ruling: C\n/);
  } finally {
    app.restore();
  }
  // The look, pinned in the stylesheet (P-001-answer-choice-spacing: each choice gets more room): each
  // option its own box with padding and space between, its button at least 36 px tall.
  const css = readFileSync(new URL('../../src/public/sandbox.css', import.meta.url), 'utf8');
  const rule = (sel) => {
    const m = css.match(new RegExp(`(?:^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`));
    assert.ok(m, `a rule for ${sel}`);
    return m[1];
  };
  assert.match(rule('.v2-opts'), /gap: 8px/);
  assert.match(rule('.v2-opt'), /padding: 10px 12px/);
  assert.match(rule('.v2-opt'), /border-radius: 12px/);
  assert.match(rule('.v2-abtn'), /min-height: 36px/);
});

test('AC53 (owner\'s note, 16 Oct) + AC80: a card\'s option words keep their own buttons, with no letter', async () => {
  const app = await openSheet({ 'queue/P-001-stop-6.md': fixture('service-desk/queue/P-001-stop-6.md') }, '#/p/Alpha/queue/card%3Aqueue%2FP-001-stop-6.md');
  try {
    assert.equal(byClass(sheet(app), 'v2-letter').length, 0);
    assert.deepEqual(byClass(sheet(app), 'v2-ol').map((c) => c.textContent), ['re-specify', 'criteria-wrong', 'confirm', 're-scope', 'drop']);
  } finally {
    app.restore();
  }
});

test('AC53 (note 15) + AC80, on the page: a file that can\'t be split shows the file whole, its link, one text box, one button and the line saying so', async () => {
  const app = await openSheet({ 'questions/P-009-mixed.md': '# Ruling needed: a mixed file\n\nWHY: x\nOPTIONS:\n  A. one\n  2. two\nRECOMMENDATION: A\n' }, '#/p/Alpha/queue/q%3AP-009-mixed');
  try {
    assert.match(sheet(app).textContent, new RegExp(CANT_SPLIT));
    assert.equal(findAll(sheet(app), (e) => e.tag === 'textarea').length, 1);
    assert.ok(words(app, 1));
    assert.ok(byClass(sheet(app), 'sb-record')[0].innerHTML.includes('a mixed file'), 'the file shown whole');
    type(words(app, 1), 'A, but smaller.');
    await app.flush();
    assert.equal(fileOf(app, 'Answer ↗'), 'Ruling: \n\nQuestion: questions/P-009-mixed.md\n\nA, but smaller.\n');
  } finally {
    app.restore();
  }
});

test('AC53 (note 15) + AC56 + AC80: each answer box keeps what the owner typed through a refresh, and the button\'s file follows every box', async () => {
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
    type(words(app, 3), 'agree');
    await app.flush();
    assert.equal(fileOf(app, 'Answer ↗').split('\n')[0], 'Ruling: 2 yes; 3 agree');
  } finally {
    app.restore();
  }
});
