// S-009, J7 (spec lines 159-162, 169): the baseline case set itself. These checks need neither the
// record nor the build, so they pass as soon as the cases are committed, and they lock the case set:
// J7's list of cases, the twin rule and the open-card rule.
// Covers: AC9, AC14, AC15, AC16, AC17 (the cases their baseline comparisons need).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadBaselineCases, twinOf, isDecisionId } from './s009-lib.mjs';

const all = loadBaselineCases().map((c) => c.data);
const desk = all.filter((c) => c.kind === 'desk');
const open = all.filter((c) => c.kind === 'open');
const sender = all.filter((c) => c.kind === 'sender');

test('J7: every case file is in J7\'s case-file form', () => {
  const ids = new Set();
  for (const c of all) {
    assert.ok(typeof c.case === 'string' && !ids.has(c.case), `case id ${c.case} missing or repeated`);
    ids.add(c.case);
    assert.ok(['desk', 'sender', 'open'].includes(c.kind), `${c.case}: kind`);
    assert.ok(!Number.isNaN(Date.parse(c.moment)), `${c.case}: moment`);
    if (c.kind !== 'sender') {
      for (const k of ['queue', 'cases', 'notes', 'log', 'questions', 'pulls']) assert.ok(k in c.records, `${c.case}: records.${k}`);
      assert.ok(Array.isArray(c.fail) && c.fail.every((f) => ['queue', 'notes', 'log'].includes(f)), `${c.case}: fail`);
      assert.ok(['path', 'call', undefined].includes(c.form), `${c.case}: form`);
      for (const k of Object.keys(c.records.cases)) assert.ok(!isDecisionId(k) && k in c.records.queue, `${c.case}: cases names only a gate card in queue/: ${k}`);
    } else {
      assert.ok(Array.isArray(c.runs) && c.runs.every((r) => Array.isArray(r)), `${c.case}: runs`);
    }
    if (c.kind === 'open') assert.ok(['notice', 'link'].includes(c.open.via), `${c.case}: open.via`);
  }
});

test('J7 line 169: twin rule, every desk or open case with a read failing has a no-failure twin', () => {
  for (const c of [...desk, ...open].filter((c) => c.fail.length > 0)) {
    assert.ok(twinOf(c, all), `${c.case} has no no-failure twin (same kind, records, moment${c.kind === 'open' ? ', open' : ''}, empty fail)`);
  }
});

test('J7 line 169: open-card rule, every no-failure desk case holds at least one open card', () => {
  for (const c of desk.filter((c) => c.fail.length === 0)) {
    const n = Object.keys(c.records.queue).length + c.records.questions.length + c.records.pulls.length;
    assert.ok(n > 0, `${c.case} holds no open card`);
  }
});

test('J7 line 160 (AC9, AC16, AC17): the records and failures J7 lists', () => {
  const full = desk.filter((c) => {
    const ids = Object.keys(c.records.queue);
    const gate = (g) => ids.some((id) => new RegExp(`^[A-Z]+-\\d+-${g}-\\d+$`).test(id));
    const dec = ids.filter(isDecisionId);
    const dor = ids.find((id) => /^[A-Z]+-\d+-dor-\d+$/.test(id));
    return gate('dor') && gate('criteria') && gate('launch') && c.records.questions.length > 0 && c.records.pulls.length > 0 &&
      dec.some((id) => id in c.records.notes) && dec.some((id) => !(id in c.records.notes)) &&
      dor && c.records.cases[dor] && c.records.notes[dor] && !c.records.notes[dor].includes('`' + c.records.cases[dor] + '`');
  });
  assert.ok(full.length > 0, 'no desk case holds dor, criteria, launch, a question, a pull request, a decision card with notes and one without, with the dor card\'s gate case and notes recommending different words');
  const has = (fail, form) => full.some((c) => JSON.stringify(c.fail) === JSON.stringify(fail) && (c.form || 'path') === form);
  for (const [fail, form] of [[[], 'path'], [['queue'], 'path'], [['notes'], 'path'], [['log'], 'path'], [['queue'], 'call']]) {
    assert.ok(has(fail, form), `missing J7 case: fail ${JSON.stringify(fail)} in the ${form} form`);
  }
});

test('J7 line 161 (AC14): a sender case for each of AC14\'s two cases', () => {
  const contentChange = sender.some((c) => c.runs.some((run, i) => i > 0 && run.some((x) => c.runs[i - 1].some((y) => y.id === x.id && y.content !== x.content))));
  const leaveReturn = sender.some((c) => c.runs.some((run, i) => run.some((x) => c.runs.slice(0, i).some((r) => r.some((y) => y.id === x.id)) && c.runs.slice(0, i).some((r) => !r.some((y) => y.id === x.id)) && c.runs[i - 1] && !c.runs[i - 1].some((y) => y.id === x.id))));
  assert.ok(contentChange, 'no sender case where a card stays on the list with changed content');
  assert.ok(leaveReturn, 'no sender case where a card leaves the list and comes back');
});

test('J7 line 162 (AC15): open cases by notice and by link, one decision id not in queue/, no failure and log failing', () => {
  const ids = new Set(open.map((c) => c.open.id));
  assert.equal(ids.size, 1, `the AC15 open cases must use one id, got ${[...ids]}`);
  const [id] = ids;
  assert.ok(isDecisionId(id), `${id} is not a decision card's id`);
  for (const c of open) assert.ok(!(id in c.records.queue), `${c.case}: ${id} is in queue/`);
  for (const via of ['notice', 'link']) for (const fail of [[], ['log']]) {
    assert.ok(open.some((c) => c.open.via === via && JSON.stringify(c.fail) === JSON.stringify(fail) && (c.form || 'path') === 'path'), `missing open case via ${via} with fail ${JSON.stringify(fail)}`);
  }
});

test('AC9 (Critic B1): a no-failure desk case holds a criteria or launch card with notes naming one of its words and no gate case', () => {
  const ok = desk.some((c) => c.fail.length === 0 && Object.entries(c.records.queue).some(([id, words]) =>
    /^[A-Z]+-\d+-(criteria|launch)-\d+$/.test(id) && !(id in c.records.cases) && c.records.notes[id] &&
    words.some((w) => c.records.notes[id].includes('`' + w + '`'))));
  assert.ok(ok, 'no criteria or launch card with notes and no gate case: a gate card\'s notes would go untested');
});
