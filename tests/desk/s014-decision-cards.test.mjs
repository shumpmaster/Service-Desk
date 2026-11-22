// S-014 (P-003, the card fix): the one rule that holds or shows a decision card (src/lib/model.js decisionStates), the
// reads it takes (neededReads), the card list every view and the sender take from it (buildModel, waitingSet), the mark on
// the card sheet (answerButtons, sheetView), a failed poll on the desk (createDesk), and the lines on the queue and Home.
// Made-up records throughout (NOT real records). The locked checks are tests/acceptance/S-009/ (through the adapter).

import test from 'node:test';
import assert from 'node:assert/strict';
import { decisionStates, neededReads, buildModel, parseRecord, COS_NONE, DECISION_LINES } from '../../src/lib/model.js';
import { waitingSet } from '../../src/lib/waiting.js';
import { answerButtons } from '../../src/lib/board.js';
import { sheetView } from '../../src/lib/sandbox.js';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { CONFIG, SD, fakeClock } from './helpers.mjs';
import { repo, fakeServer } from './fake-desk.mjs';
import { loadSandbox, byClass } from './sandbox-helpers.mjs';

const H = 3600e3;
const M = Date.parse('2026-11-12T12:00:00Z');
const iso = (t) => new Date(t).toISOString().replace('.000Z', 'Z');
const WORDS = ['drop', 're-specify', 'resubmit'];
const cardText = (words = WORDS) => `# Card\n\n## 1. The decision\nPick one\n\n## 4. Options\n${words.map((w) => `- \`${w}\` — ${w}`).join('\n')}\n\n## 5. Recommendation\n\`resubmit\`, says the card.\n`;
const parts = (id) => /^([A-Z]+-\d+)-(.+)-(\d+)$/.exec(id).slice(1);
const notesPath = (id) => { const [i, g, n] = parts(id); return `decisions/${i}/${g}-${n}-notes.md`; };
const logLine = (id, time) => { const [item, gate, n] = parts(id); return JSON.stringify({ action: 'card', time, item, gate, card: Number(n) }); };

/** Files for cards [{ id, raised?: [ISO], notes?, words? }]: card files, notes, and the month files of the raise times. */
function files(cards, extra = {}) {
  const f = { ...extra };
  for (const c of cards) {
    f[`queue/${c.id}.md`] = cardText(c.words);
    if (c.notes != null) f[notesPath(c.id)] = c.notes;
    for (const t of c.raised || []) {
      const p = `dispatch-log/${t.slice(0, 7)}.jsonl`;
      f[p] = `${f[p] || ''}${logLine(c.id, t)}\n`;
    }
  }
  return f;
}
const kindOf = (p) => (p.startsWith('queue/') ? 'card' : p.startsWith('dispatch-log/') ? 'log' : p.endsWith('-notes.md') ? 'notes' : null);
/** The tree and records of a read that got every file but `unread` (paths). */
function read(f, unread = []) {
  const tree = new Map(Object.keys(f).map((p, i) => [p, { sha: String(i + 1).padStart(40, '0') }]));
  const records = new Map(Object.entries(f).filter(([p]) => !unread.includes(p) && kindOf(p)).map(([p, t]) => [p, parseRecord(kindOf(p), t, p)]));
  return { tree, records };
}
const states = (f, now = M, unread = [], queueRead = true) => {
  const r = decisionStates({ ...read(f, unread), now: new Date(now), queueRead });
  return { ...r, of: (id) => (r.cards.get(`queue/${id}.md`) || { state: 'off' }).state };
};

test('J2: the notes\' recommended word — the first line that begins "Recommendation:" once heading, bold and italic marks go, its first backquoted word that is one of the card\'s', () => {
  const at = (notes) => states(files([{ id: 'P-1-stop-1', raised: [iso(M - 2 * H)], notes }])).of('P-1-stop-1');
  assert.equal(at('### **Recommendation:** `drop`\n'), 'shown, recommended drop');
  assert.equal(at('**Recommendation: `resubmit`, after the fixes.**\n'), 'shown, recommended resubmit');
  assert.equal(at('_Recommendation:_ not `proceed`; `re-specify`\n'), 'shown, recommended re-specify');
  assert.equal(at('The Recommendation: line says `drop`\n'), 'held', 'a prose mention is not the line');
  assert.equal(at('Recommendation: `Drop`\n'), 'held', 'an exact match only');
  assert.equal(at('Recommendation: none yet\nRecommendation: `drop`\n'), 'held', 'the first line decides');
  assert.equal(at('\r\n## Recommendation: `drop`\r\n'), 'shown, recommended drop');
});

test('J1, AC1, AC4: held under 24 hours from the recorded raise time, shown at 24 hours with no recommendation; a negative age is under a day', () => {
  const f = files([{ id: 'P-1-failure-2', raised: ['2026-11-10T10:00:00Z'] }]);
  for (const [t, want] of [['2026-11-10T09:58:00Z', 'held'], ['2026-11-11T09:59:59Z', 'held'], ['2026-11-11T10:00:00Z', 'shown, no recommendation yet']]) {
    assert.equal(states(f, Date.parse(t)).of('P-1-failure-2'), want, t);
  }
  assert.deepEqual(states(f, Date.parse('2026-11-11T10:00:00Z')).cards.get('queue/P-1-failure-2.md'),
    { id: 'P-1-failure-2', raised: '2026-11-10T10:00:00Z', state: 'shown, no recommendation yet', word: null });
});

test('J1: two card entries — the earliest raise time, in either order and across the two month files', () => {
  const f = files([{ id: 'P-1-stop-1', raised: ['2026-11-11T13:00:00Z', '2026-11-11T11:00:00Z'] }, { id: 'P-2-stop-1', raised: ['2026-10-31T13:00:00Z', '2026-11-01T11:00:00Z'] }]);
  assert.equal(states(f, Date.parse('2026-11-12T11:00:00Z')).of('P-1-stop-1'), 'shown, no recommendation yet');
  assert.equal(states(f, Date.parse('2026-11-12T11:00:00Z')).cards.get('queue/P-1-stop-1.md').raised, '2026-11-11T11:00:00Z');
  assert.equal(states(f, Date.parse('2026-11-12T10:59:00Z')).of('P-1-stop-1'), 'held');
  assert.equal(states(f, Date.parse('2026-11-01T13:00:00Z')).of('P-2-stop-1'), 'shown, no recommendation yet');
});

test('AC7, J1: no card entry in a log that was got — shown at once, raise time "not recorded"; dor-fail is a decision card, dor a gate card', () => {
  const r = states(files([{ id: 'P-1-dor-fail-1' }, { id: 'P-2-dor-1', raised: [iso(M - H)] }], { 'dispatch-log/2026-11.jsonl': '' }));
  assert.deepEqual(r.cards.get('queue/P-1-dor-fail-1.md'), { id: 'P-1-dor-fail-1', raised: 'not recorded', state: 'shown, no recommendation yet', word: null });
  assert.equal(r.cards.has('queue/P-2-dor-1.md'), false, 'a gate card gets no state');
  assert.equal(states(files([{ id: 'P-3-dor-fail-1', raised: [iso(M - H)] }])).of('P-3-dor-fail-1'), 'held');
});

test('AC2, AC5, AC6, J3: notes with a word win over the day; notes without one, or for another card, count as none; notes removed go back by age', () => {
  const young = iso(M - H), old = iso(M - 30 * H);
  const r = states(files([
    { id: 'P-1-stop-1', raised: [young], notes: 'Recommendation: `drop`\n' },
    { id: 'P-2-stop-1', raised: [old], notes: 'Recommendation: `resubmit`\n' },
    { id: 'P-3-stop-1', raised: [young], notes: 'Recommendation: `proceed`\n' },
    { id: 'P-4-stop-1', raised: [old], notes: 'No line here.\n' },
    { id: 'P-5-stop-1', raised: [young] },
  ], { [notesPath('P-5-stop-2')]: 'Recommendation: `drop`\n' }));
  assert.deepEqual(['P-1', 'P-2', 'P-3', 'P-4', 'P-5'].map((p) => r.of(`${p}-stop-1`)),
    ['shown, recommended drop', 'shown, recommended resubmit', 'held', 'shown, no recommendation yet', 'held']);
  assert.equal(states(files([{ id: 'P-1-stop-1', raised: [young] }])).of('P-1-stop-1'), 'held', 'its notes removed, under a day: held again');
});

test('AC16, J8: queue/ not got (a card file unread, or the tree not read) or a needed notes file unread — no decision card gets a state', () => {
  const f = files([{ id: 'P-1-stop-1', raised: [iso(M - 30 * H)], notes: 'Recommendation: `drop`\n' }, { id: 'P-2-dor-1', words: ['proceed'] }]);
  for (const [unread, q, want] of [[['queue/P-2-dor-1.md'], true, ['queue']], [[], false, ['queue']], [[notesPath('P-1-stop-1')], true, ['notes']],
    [['queue/P-1-stop-1.md', notesPath('P-1-stop-1')], true, ['queue', 'notes']]]) {
    const r = states(f, M, unread, q);
    assert.deepEqual([r.cards.size, r.notRead, r.withoutNotes], [0, want, false], JSON.stringify(unread));
  }
  // a notes file the rule does not need (a gate card's, or another n's) fails nothing
  const g = files([{ id: 'P-1-stop-1', raised: [iso(M - 30 * H)] }, { id: 'P-2-criteria-1', words: ['proceed'], notes: 'Recommendation: `proceed`\n' }], { [notesPath('P-1-stop-2')]: 'x' });
  assert.deepEqual(states(g, M, [notesPath('P-2-criteria-1'), notesPath('P-1-stop-2')]).notRead, []);
});

test('AC17, J3: the dispatch log not got — only the cards whose notes have a word, and the flag only while one is left out', () => {
  const f = files([{ id: 'P-1-stop-1', raised: [iso(M - H)], notes: 'Recommendation: `drop`\n' }, { id: 'P-2-stop-1', raised: [iso(M - 30 * H)] }]);
  const r = states(f, M, ['dispatch-log/2026-11.jsonl']);
  assert.deepEqual([r.of('P-1-stop-1'), r.of('P-2-stop-1'), r.withoutNotes, r.notRead], ['shown, recommended drop', 'off', true, []]);
  const only = files([{ id: 'P-1-stop-1', raised: [iso(M - H)], notes: 'Recommendation: `drop`\n' }]);
  assert.equal(states(only, M, ['dispatch-log/2026-11.jsonl']).withoutNotes, false);
});

test('AC11, AC13: the rule reads no clock — the same records and moment give the same list whatever the time is', () => {
  const f = files([{ id: 'P-1-stop-1', raised: [iso(M - 23 * H)] }, { id: 'P-2-stop-1' }]);
  const realNow = Date.now;
  Date.now = () => { throw new Error('the rule read the clock'); };
  try {
    const a = states(f, M), b = states(f, M + 2 * H);
    assert.deepEqual([...a.cards.values()].map((c) => c.state), ['held', 'shown, no recommendation yet']);
    assert.deepEqual([...b.cards.values()].map((c) => c.state), ['shown, no recommendation yet', 'shown, no recommendation yet']);
    const { of: _a, ...same } = a;
    const { of: _b, ...again } = states(f, M);
    assert.deepEqual(again, same);
  } finally {
    Date.now = realNow;
  }
});

test('AC10, J8: neededReads asks for a decision card\'s notes as a needed blob only when they are in the tree; never a gate card\'s or another n\'s', () => {
  const f = files([{ id: 'P-1-stop-1', notes: 'x' }, { id: 'P-2-failure-1' }, { id: 'P-3-launch-1', notes: 'x' }], { [notesPath('P-2-failure-2')]: 'x' });
  const { tree } = read(f);
  const need = neededReads(SD, tree, new Map(), new Date(M), {});
  const asked = [...need.blobs, ...need.optional.blobs].map((b) => b.path).filter((p) => p.endsWith('-notes.md'));
  assert.deepEqual(asked, [notesPath('P-1-stop-1')]);
  assert.equal(need.blobs.find((b) => b.path === notesPath('P-1-stop-1')).kind, 'notes');
});

const model = (f, unread = [], extra = {}) => buildModel({ project: SD, config: CONFIG, ...read(f, unread), now: new Date(M), pullPages: [], checkPages: [], ...extra });

test('J3, J4, J5, AC11: buildModel lists a decision card only as the rule does, and the sender\'s set (waitingSet) holds the same cards', () => {
  const f = files([{ id: 'P-1-stop-1', raised: [iso(M - H)] }, { id: 'P-2-stop-1', raised: [iso(M - H)], notes: 'Recommendation: `drop`\n' },
    { id: 'P-3-failure-1', raised: [iso(M - 25 * H)] }, { id: 'P-4-dor-1', words: ['proceed'], raised: [iso(M - H)] }]);
  const m = model(f);
  const cards = m.flagged.filter((x) => x.kind === 'card');
  assert.deepEqual(cards.map((c) => [c.card.path, c.card.cos]), [['queue/P-2-stop-1.md', { word: 'drop' }], ['queue/P-3-failure-1.md', { word: null }], ['queue/P-4-dor-1.md', undefined]]);
  assert.deepEqual(m.decisionLines, []);
  const set = waitingSet({ project: SD, model: m, deploys: [] }).filter((x) => x.kind === 'card' || x.kind === 'gate').map((x) => x.id);
  assert.deepEqual(set, cards.map((c) => c.card.path));
  assert.deepEqual(model(f, [notesPath('P-2-stop-1')]).decisionLines, [DECISION_LINES.notes]);
  assert.deepEqual(model(f, [], { queueRead: false }).flagged.filter((x) => x.kind === 'card').map((c) => c.card.path), ['queue/P-4-dor-1.md']);
  assert.deepEqual(model(f, ['dispatch-log/2026-11.jsonl']).decisionLines, [DECISION_LINES.log]);
});

test('AC2, AC3, AC4, AC9: the sheet marks only the notes\' word on a decision card, never its section 5, says whose it is, or carries the mark; a gate card as before', () => {
  const f = files([{ id: 'P-1-stop-1', raised: [iso(M - H)], notes: 'Recommendation: `drop`\n' }, { id: 'P-2-stop-1', raised: [iso(M - 25 * H)] },
    { id: 'P-3-criteria-1', words: ['proceed', 'hold', 'resubmit'], raised: [iso(M - H)] }]);
  const m = model(f);
  const at = (path) => m.flagged.find((x) => x.card && x.card.path === path);
  const marked = (flag) => answerButtons(SD, flag, CONFIG.linkCap).filter((b) => b.recommended).map((b) => b.value);
  assert.deepEqual(marked(at('queue/P-1-stop-1.md')), ['drop']);
  assert.deepEqual(marked(at('queue/P-2-stop-1.md')), [], 'section 5 names resubmit, and marks nothing on a decision card');
  assert.deepEqual(marked(at('queue/P-3-criteria-1.md')), ['resubmit'], 'a gate card with no case keeps its section 5');
  const sheet = (flag) => sheetView(SD, m, read(f), null, { key: flag.key, text: flag.title, flag });
  assert.deepEqual([sheet(at('queue/P-1-stop-1.md')).recommendation, sheet(at('queue/P-1-stop-1.md')).cosNone], ['The Chief of Staff recommends drop', false]);
  assert.deepEqual([sheet(at('queue/P-2-stop-1.md')).recommendation, sheet(at('queue/P-2-stop-1.md')).cosNone], [null, true]);
  assert.equal(sheet(at('queue/P-3-criteria-1.md')).cosNone, false);
});

test('J8, AC16: on the desk, a poll that fails after a read hides the decision cards it held; gate cards stay; the next good read brings them back', async () => {
  const start = M;
  const clock = fakeClock(start);
  const r = repo(files([{ id: 'P-1-stop-1', raised: [iso(start - 30 * H)] }, { id: 'P-2-dor-1', words: ['proceed'], raised: [iso(start - H)] }]), [], []);
  const server = fakeServer({ 'Service-Desk': r }, { ...CONFIG, projects: [SD] }, clock);
  const desk = createDesk({ config: { ...CONFIG, projects: [SD] }, call: server.call, clock, store: createStore(null), isVisible: () => true });
  const paths = () => desk.model('Service-Desk').flagged.filter((x) => x.kind === 'card').map((x) => x.card.path);
  desk.start();
  await clock.runUntil(start + 1000);
  assert.deepEqual(paths(), ['queue/P-1-stop-1.md', 'queue/P-2-dor-1.md']);
  r.fail = { kind: 'network' };
  await clock.runUntil(start + POLL_MS + 1000);
  assert.deepEqual(paths(), ['queue/P-2-dor-1.md']);
  assert.deepEqual(desk.model('Service-Desk').decisionLines, [DECISION_LINES.queue]);
  r.fail = null;
  await clock.runUntil(start + 2 * POLL_MS + 1000);
  assert.deepEqual(paths(), ['queue/P-1-stop-1.md', 'queue/P-2-dor-1.md']);
  desk.stop();
});

test('AC16, J4: the lines on the queue and on Home only, never the board; none on a good read; the mark on the card sheet', async () => {
  const project = { ...SD };
  const config = { ...CONFIG, projects: [project] };
  const f = files([{ id: 'P-1-stop-1', raised: [iso(M - 30 * H)], notes: 'Recommendation: `drop`\n' }, { id: 'P-2-stop-1', raised: [iso(M - 30 * H)] }]);
  const r = repo(f, [], []);
  r.blobNull = [notesPath('P-1-stop-1')];
  const app = await loadSandbox({ config, repos: { [project.name]: r }, hash: '#/', now: M });
  try {
    await app.advance(0);
    const home = byClass(app.view, 'v2-bt3').map((e) => e.textContent.trim());
    assert.ok(home.includes(DECISION_LINES.notes), JSON.stringify(home));
    await app.go(`#/waiting/${project.name}`);
    assert.ok(byClass(app.view, 'v2-ql').some((e) => e.textContent.trim() === DECISION_LINES.notes), 'the queue');
    await app.go('#/waiting');
    assert.ok(!byClass(app.view, 'v2-ql').some((e) => e.textContent.trim() === DECISION_LINES.notes), 'never the board');
  } finally {
    app.restore();
  }
  const ok = await loadSandbox({ config, repos: { [project.name]: repo(f, [], []) }, hash: `#/waiting/card/${encodeURIComponent(`${project.name}|card|queue/P-2-stop-1.md`)}`, now: M });
  try {
    await ok.advance(0);
    assert.ok(!byClass(ok.view, 'v2-bt3').some((e) => Object.values(DECISION_LINES).includes(e.textContent.trim())));
    const sheet = byClass(ok.view, 'v2-sheet')[0];
    assert.ok(sheet && sheet.textContent.includes(COS_NONE), 'the card sheet carries the mark');
  } finally {
    ok.restore();
  }
});
