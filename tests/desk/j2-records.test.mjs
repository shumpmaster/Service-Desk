// join-test: S-001/J2 — cards, answers and owner questions → read model (page side), using the
// real files: queue/P-001-stop-6.md, queue/P-001-dor-fail-2.md, queue/Q-003-failure-1.md,
// decisions/P-001/stop-6.md, decisions/P-001/dor-fail-2.md, decisions/P-001/dor-fail-1-notes.md,
// queue/README.md, questions/_TEMPLATE.md, questions/Q-005-sources.md at 4f2439a and
// decisions/questions/Q-005-sources.md, plus the dispatch-log lines J2 quotes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCardPath, parseAnswerPath, classifyQueuePath, questionName, questionAnswerName, parseCard, parseAnswer,
  parseRuling, parseQuestion, defaultLabel, parseHistory, parseLog, parsePulls, classifyPull,
} from '../../src/lib/records.js';
import { buildModel, neededReads, parseRecord, recordKind } from '../../src/lib/model.js';
import { fixture, recorded, CONFIG, SD, POOM } from './helpers.mjs';

const sd = (p) => fixture(`service-desk/${p}`);

test('J2 card paths: groups, hyphenated gates, and what is not a card', () => {
  assert.deepEqual(parseCardPath('queue/P-001-stop-6.md'), { path: 'queue/P-001-stop-6.md', item: 'P-001', gate: 'stop', n: 6, answerPath: 'decisions/P-001/stop-6.md' });
  const dor = parseCardPath('queue/P-001-dor-fail-2.md');
  assert.equal(dor.item, 'P-001');
  assert.equal(dor.gate, 'dor-fail');
  assert.equal(dor.n, 2);
  assert.equal(dor.answerPath, 'decisions/P-001/dor-fail-2.md');
  assert.equal(classifyQueuePath('queue/README.md').kind, 'readme');
  assert.equal(classifyQueuePath('queue/merge/P-001-merge.md').kind, 'merge-note');
  assert.equal(parseCardPath('queue/merge/P-001-stop-1.md'), null);
  assert.equal(classifyQueuePath('queue/notes.md').kind, 'unparsed');
  assert.equal(classifyQueuePath('status/P-001.toml'), null);
});

test('J2 answers: answer paths, -notes.md files, and decisions/questions/ is not a card answer', () => {
  assert.deepEqual(parseAnswerPath('decisions/P-001/stop-6.md'), { path: 'decisions/P-001/stop-6.md', item: 'P-001', gate: 'stop', n: 6 });
  assert.equal(parseAnswerPath('decisions/P-001/dor-fail-1-notes.md'), null);
  assert.equal(parseAnswerPath('decisions/questions/Q-005-sources.md'), null);
  assert.equal(parseAnswer(sd('decisions/P-001/stop-6.md')), 're-scope');
  assert.equal(parseAnswer(sd('decisions/P-001/dor-fail-2.md')), 'resubmit'); // its Proxy: line is ignored
  assert.equal(parseAnswer(sd('decisions/P-001/dor-fail-1-notes.md')), null);
});

test('J2 card text: title, options and answer path from the real card form', () => {
  const c = parseCard(sd('queue/P-001-stop-6.md'));
  assert.equal(c.heading, 'Decision card — P-001 stop-6');
  assert.equal(c.title, 'The work reached the stop rule. What happens next?');
  assert.deepEqual(c.options.map((o) => o.word), ['re-specify', 'criteria-wrong', 'confirm', 're-scope', 'drop']);
  assert.equal(c.answerPath, 'decisions/P-001/stop-6.md');
  assert.deepEqual(c.notes, []);
  const d = parseCard(sd('queue/P-001-dor-fail-2.md'));
  assert.deepEqual(d.options.map((o) => o.word), ['resubmit', 'stop']);
  assert.equal(d.answerPath, 'decisions/P-001/dor-fail-2.md');
  const q = parseCard(sd('queue/Q-003-failure-1.md'));
  assert.equal(q.answerPath, 'decisions/Q-003/failure-1.md');
  assert.ok(q.options.length >= 2);
  assert.ok(q.title);
});

test('J2 owner questions: the template is not a question; Q-005-sources at 4f2439a parses fully', () => {
  assert.equal(questionName('questions/_TEMPLATE.md'), null);
  assert.equal(questionName('questions/Q-005-sources.md'), 'Q-005-sources');
  assert.equal(questionName('questions/sub/x.md'), null);
  assert.equal(questionAnswerName('decisions/questions/Q-005-sources.md'), 'Q-005-sources');
  assert.equal(questionAnswerName('decisions/questions/Q-005-sources-notes.md'), null);
  const q = parseQuestion(sd('questions/Q-005-sources.md'), 'Q-005-sources');
  assert.equal(q.title, 'do two Anthropic pages count as two sources?');
  assert.deepEqual(q.options.map((o) => o.letter), ['A', 'B']);
  assert.ok(q.options[0].text.startsWith('Accept'));
  assert.ok(q.options[1].text.startsWith('Strict'));
  assert.equal(q.recommendationLetter, 'A');
  assert.equal(q.riskClass, 'R0');
  assert.equal(q.reversibility, 'reversible');
  assert.ok(q.blastRadius.startsWith('the research library'));
  assert.equal(q.default, 'A');
  assert.equal(q.timeout, '24');
  assert.ok(q.why.startsWith('The Q-005 source check'));
  assert.equal(parseRuling(sd('decisions/questions/Q-005-sources.md')), 'A');
});

test('J2 owner questions: missing labels are null ("not given"), and the file name stands in for a missing title', () => {
  const q = parseQuestion('Some text with no form at all\n', 'Q-099-loose');
  assert.equal(q.title, 'Q-099-loose');
  assert.equal(q.why, null);
  assert.deepEqual(q.options, []);
  assert.equal(q.default, null);
  const t = parseQuestion(sd('questions/_TEMPLATE.md'), '_TEMPLATE');
  assert.equal(t.title, '<plain-English title>');
  assert.equal(t.options.length, 2);
});

test('AC12 DEFAULT label: reversible gives the time, irreversible never defaults, nothing implies enforcement', () => {
  const q = parseQuestion(sd('questions/Q-005-sources.md'), 'Q-005-sources');
  const raised = new Date('2026-10-01T11:48:24Z');
  assert.equal(defaultLabel(q, raised), 'per the question file: defaults to A at 2026-10-02T11:48:24.000Z');
  assert.equal(defaultLabel({ ...q, reversibility: 'irreversible' }, raised), 'per the question file: never defaults');
  assert.match(defaultLabel(q, null), /raised time not recorded/);
  assert.equal(defaultLabel({ ...q, default: null }, raised), 'not given');
});

test('J2 history: a deleted path\'s history (questions/Q-005-sources.md) gives its raised time', () => {
  const h = parseHistory([recorded('history-question-Q-005').body]);
  assert.equal(h.oldest.toISOString(), '2026-10-01T11:48:24.000Z');
  const a = parseHistory([recorded('history-ruling-Q-005').body]);
  assert.ok(a.oldest instanceof Date);
  assert.equal(parseHistory(['[]']).oldest, null);
});

// A small v3 tree built from the real files, keyed by path → { sha, size }.
function sdTree(paths) {
  const m = new Map();
  let i = 0;
  for (const p of paths) m.set(p, { sha: (++i).toString(16).padStart(40, 'd'), size: 100 });
  return m;
}
const LOG_LINES = [
  '{"action":"card","card":6,"gate":"stop","item":"P-001","prev":"x","reason":"r","role":"critic-triage","route":"triage-return","stage":3,"time":"2026-10-06T18:51:54Z","trigger":"outcome:P-001:third-fail:2026-10-06T18:48:58Z"}',
  '{"card":6,"gate":"stop","item":"P-001","prev":"y","proxy":false,"record":"decisions/P-001/stop-6.md","result":"closed/3/critic-triage","time":"2026-10-06T21:31:02Z","trigger":"decision","word":"re-scope"}',
].join('\n');

function model(tree, texts, extra = {}) {
  const records = new Map();
  for (const [path, text] of Object.entries(texts)) records.set(path, parseRecord(recordKind(path, 'v3'), text, path));
  return buildModel({ project: SD, config: CONFIG, tree, records, history: new Map(), pullPages: [], checkPages: [],
    checksState: 'ok', now: new Date('2026-10-06T19:00:00Z'), ...extra });
}

test('J2 + AC1: an open card is flagged with its title and raised time; AC7: its answer file unflags it', () => {
  const tree = sdTree(['queue/README.md', 'queue/P-001-stop-6.md', 'dispatch-log/2026-10.jsonl', 'dispatch-log/2026-09.jsonl']);
  const m = model(tree, { 'queue/P-001-stop-6.md': sd('queue/P-001-stop-6.md'), 'dispatch-log/2026-10.jsonl': LOG_LINES.split('\n')[0], 'dispatch-log/2026-09.jsonl': '' });
  const cards = m.flagged.filter((f) => f.kind === 'card');
  assert.equal(cards.length, 1);
  assert.equal(cards[0].title, 'P-001 stop-6: The work reached the stop rule. What happens next?');
  assert.equal(cards[0].raisedAt.toISOString(), '2026-10-06T18:51:54.000Z');
  assert.equal(cards[0].link, 'https://github.com/shumpmaster/Service-Desk/blob/main/queue/P-001-stop-6.md');
  // Answered: the answer path is in the tree, whether or not the card file still exists.
  tree.set('decisions/P-001/stop-6.md', { sha: 'e'.repeat(40) });
  assert.equal(model(tree, {}).flagged.filter((f) => f.kind === 'card').length, 0);
  tree.delete('queue/P-001-stop-6.md');
  assert.equal(model(tree, {}).flagged.length, 0);
});

test('J2 awkward cases: a card with no log entry, a misparse, an answer committed first', () => {
  // No `card` log entry: raised "not recorded", still flagged.
  let tree = sdTree(['queue/P-001-dor-fail-2.md']);
  let m = model(tree, { 'queue/P-001-dor-fail-2.md': sd('queue/P-001-dor-fail-2.md') });
  assert.equal(m.flagged.length, 1);
  assert.equal(m.flagged[0].raisedAt, null);
  assert.match(m.flagged[0].words, /not recorded/);
  // A card whose answer line names another path: "can't parse", still flagged.
  const odd = sd('queue/P-001-stop-6.md').replace('decisions/P-001/stop-6.md', 'decisions/P-001/elsewhere.md');
  tree = sdTree(['queue/P-001-stop-6.md']);
  m = model(tree, { 'queue/P-001-stop-6.md': odd });
  assert.equal(m.flagged.length, 1);
  assert.match(m.flagged[0].card.cantParse, /names decisions\/P-001\/elsewhere\.md/);
  assert.ok(m.activity.some((a) => a.kind === 'unparsed'));
  // Unread card text (blob not fetched yet): still flagged by its path.
  m = model(sdTree(['queue/Q-003-failure-1.md']), {});
  assert.equal(m.flagged.length, 1);
  assert.equal(m.flagged[0].title, 'Q-003 failure-1: card failure-1');
  // The answer committed before the card: still answered.
  m = model(sdTree(['decisions/Q-003/failure-1.md', 'queue/Q-003-failure-1.md']), {});
  assert.equal(m.flagged.length, 0);
});

test('J2: an unparseable queue path and queue/merge/ notes are activity, never flagged or dropped; README is ignored', () => {
  const m = model(sdTree(['queue/README.md', 'queue/merge/P-001-merge-1.md', 'queue/odd file.md']), {});
  assert.equal(m.flagged.length, 0);
  assert.ok(m.activity.some((a) => a.text === 'merge-gate note: queue/merge/P-001-merge-1.md'));
  assert.ok(m.activity.some((a) => a.text === "can't parse: queue/odd file.md"));
  assert.ok(!m.activity.some((a) => a.text.includes('README')));
});

test('J2 + AC3: an owner question is flagged with its title until its answer (v3) or its deletion', () => {
  const tree = sdTree(['questions/_TEMPLATE.md', 'questions/Q-005-sources.md']);
  const m = model(tree, { 'questions/Q-005-sources.md': sd('questions/Q-005-sources.md') });
  const q = m.flagged.filter((f) => f.kind === 'question');
  assert.equal(q.length, 1);
  assert.equal(q[0].title, 'Question: do two Anthropic pages count as two sources?');
  tree.set('decisions/questions/Q-005-sources.md', { sha: 'f'.repeat(40) });
  assert.equal(model(tree, {}).flagged.length, 0, 'answered (v3)');
  tree.delete('decisions/questions/Q-005-sources.md');
  tree.delete('questions/Q-005-sources.md');
  assert.equal(model(tree, {}).flagged.length, 0, 'deleted');
  // v2.5: a ruling file doesn't answer it; deleting the question does.
  const t25 = sdTree(['questions/Q-020-x.md', 'decisions/questions/Q-020-x.md']);
  const m25 = buildModel({ project: POOM, config: CONFIG, tree: t25, records: new Map(), now: new Date() });
  assert.equal(m25.flagged.length, 1);
  t25.delete('questions/Q-020-x.md');
  assert.equal(buildModel({ project: POOM, config: CONFIG, tree: t25, records: new Map(), now: new Date() }).flagged.length, 0);
});

test('J2: dispatch-log decision entries give answered times, words and proxy, and parse without notes', () => {
  const { entries, notes } = parseLog(LOG_LINES);
  assert.deepEqual(notes, []);
  assert.equal(entries[0].shape, 'card');
  assert.equal(entries[1].shape, 'decision');
  assert.equal(entries[1].record, 'decisions/P-001/stop-6.md');
  assert.equal(entries[1].word, 're-scope');
  assert.equal(entries[1].proxy, false);
});

test('J2 + J6: which blobs a v3 project needs — status, ROUTING, two log months, outcomes (M2), open cards and open questions (with history)', () => {
  const tree = sdTree(['status/P-001.toml', 'status/README.md', 'status/outcomes.jsonl', 'governance/ROUTING.toml',
    'dispatch-log/2026-09.jsonl', 'dispatch-log/2026-10.jsonl', 'dispatch-log/2026-08.jsonl', 'queue/P-001-stop-6.md',
    'queue/Q-003-failure-1.md', 'decisions/Q-003/failure-1.md', 'questions/_TEMPLATE.md', 'questions/Q-005-sources.md', 'docs/LEDGER.md']);
  const need = neededReads(SD, tree, new Map(), new Date('2026-10-06T19:00:00Z'));
  assert.deepEqual(need.blobs.map((b) => b.path).sort(), ['dispatch-log/2026-09.jsonl', 'dispatch-log/2026-10.jsonl',
    'governance/ROUTING.toml', 'questions/Q-005-sources.md', 'queue/P-001-stop-6.md', 'status/P-001.toml', 'status/outcomes.jsonl']);
  assert.deepEqual(need.history, ['questions/Q-005-sources.md']);
  assert.deepEqual(need.compare, []);
  // Across a year boundary the months are December and January.
  const jan = neededReads(SD, sdTree(['dispatch-log/2025-12.jsonl', 'dispatch-log/2026-01.jsonl']), new Map(), new Date('2026-01-03T00:00:00Z'));
  assert.deepEqual(jan.blobs.map((b) => b.path), ['dispatch-log/2025-12.jsonl', 'dispatch-log/2026-01.jsonl']);
});

test('J2: an answer committed before its decision is logged — answered, verdict read from the answer, "recording…"', () => {
  const tree = sdTree(['status/P-001.toml', 'decisions/P-001/stop-6.md', 'queue/P-001-stop-6.md', 'dispatch-log/2026-10.jsonl']);
  const status = fixture('service-desk/status/P-001@def1e83.toml');
  const records = new Map([['status/P-001.toml', parseRecord('status', status)],
    ['dispatch-log/2026-10.jsonl', parseRecord('log', LOG_LINES.split('\n')[0], 'dispatch-log/2026-10.jsonl')]]);
  const need = neededReads(SD, tree, records, new Date('2026-10-06T21:31:00Z'));
  assert.ok(need.blobs.some((b) => b.path === 'decisions/P-001/stop-6.md'));
  records.set('decisions/P-001/stop-6.md', parseRecord('answer', sd('decisions/P-001/stop-6.md')));
  const m = buildModel({ project: SD, config: CONFIG, tree, records, now: new Date('2026-10-06T21:31:00Z') });
  assert.equal(m.flagged.length, 0);
  const item = m.items.find((i) => i.id === 'P-001');
  assert.equal(item.waiting.answered, true);
  assert.equal(item.waiting.verdict, 're-scope');
  assert.equal(item.waiting.recording, true);
});

test('J2 pull requests: the fields the desk reads, from the recorded PR pages', () => {
  const { pulls } = parsePulls([recorded('pulls-page1').body, recorded('pulls-page2').body]);
  assert.equal(pulls.length, 4);
  for (const p of pulls) {
    assert.equal(typeof p.number, 'number');
    assert.ok(p.title && p.url.startsWith('https://github.com/shumpmaster/Service-Desk/pull/'));
    assert.equal(p.base, 'main');
    assert.equal(p.login, 'shumpmaster');
    assert.ok(p.createdAt);
  }
  assert.equal(classifyPull(pulls[0], SD).flagged, true);
  assert.equal(pulls[0].headRepo, 'shumpmaster/Service-Desk', 'the head repository comes from the same list response');
});

test('J2/AC2 pull requests (review N7): only item/<id> from the project\'s own repository is exempt; a fork\'s item/x is flagged', () => {
  const raw = (head, repo, extra = {}) => ({ number: 7, title: 't', html_url: 'https://github.com/shumpmaster/Service-Desk/pull/7', draft: false,
    base: { ref: 'main' }, head: { ref: head, repo: repo === undefined ? undefined : repo }, user: { login: 'x' }, created_at: '2026-10-06T12:00:00Z', ...extra });
  const one = (head, repo) => parsePulls([JSON.stringify([raw(head, repo)])]).pulls[0];
  // Same repository, a well-formed item branch: activity (the Orchestrator merges it).
  assert.equal(classifyPull(one('item/P-002', { full_name: 'shumpmaster/Service-Desk' }), SD).flagged, false);
  assert.equal(classifyPull(one('item/S-1.2_a', { full_name: 'ShumpMaster/service-desk' }), SD).flagged, false, 'GitHub names compare without case');
  // A fork's PR from item/x, or a PR whose head repository is unknown: flagged.
  const flagged = [
    ['item/x', { full_name: 'outsider/Service-Desk' }],
    ['item/P-002', null],
    ['item/P-002', undefined],
    // Not the item/<id> form, even from the same repository.
    ['item/', { full_name: 'shumpmaster/Service-Desk' }],
    ['item/a/b', { full_name: 'shumpmaster/Service-Desk' }],
    ['item/P 2', { full_name: 'shumpmaster/Service-Desk' }],
    ['items/P-002', { full_name: 'shumpmaster/Service-Desk' }],
    ['xitem/P-002', { full_name: 'shumpmaster/Service-Desk' }],
  ];
  for (const [head, repo] of flagged) {
    const c = classifyPull(one(head, repo), SD);
    assert.equal(c.flagged, true, `${head} from ${JSON.stringify(repo)}`);
  }
  // v2.5 projects have no item branches: flagged even from the same repository.
  const poomPr = parsePulls([JSON.stringify([raw('item/P-002', { full_name: POOM.repo })])]).pulls[0];
  assert.equal(classifyPull(poomPr, POOM).flagged, true);
});
