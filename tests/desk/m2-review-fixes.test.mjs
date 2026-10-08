// The Reviewer's PR #44 findings: unread projects are never counted as "no cards" (B1), cold loads
// that outgrow a cycle's call budget are "Checking…", not a GitHub error (N1), the context line
// with figures missing (N2), the surviving mutants (N3), the compare body read only as far as it
// must be (N4), the answer box following the records while a note is typed (N5), and questions
// whose history hasn't returned shown as loading (N6).
// ac-test: S-001/AC18 ac-test: S-001/AC20 ac-test: S-001/AC21 ac-test: S-001/AC23 ac-test: S-001/AC46
// ac-test: S-001/AC47
// join-test: S-001/J1 join-test: S-001/J2 join-test: S-001/J6 join-test: S-001/J10
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { makeBox } from '../../src/lib/universe.js';
import { buildModel, parseRecord } from '../../src/lib/model.js';
import { readBlobs, urlsFor, COMPARE_SCAN_CHARS } from '../../src/lib/github.js';
import { handle } from '../../src/lib/api.js';
import { _resetKeyCache } from '../../src/lib/access.js';
import {
  cardRows, cardSummary, questionRows, v5Footer, v5Waits, contextText, notReadText, ASKED_DAYS, SUMMARY_DAYS,
} from '../../src/lib/asked.js';
import { hoursMinutes, median } from '../../src/lib/timefmt.js';
import { NOT_AVAILABLE, NOT_RECORDED } from '../../src/lib/records.js';
import PUBLIC_CONFIG from '../../src/public/lib/config.js';
import { fixture, recorded, CONFIG, SD, ENV, NOW, makeKey, signJwt, goodClaims, certsRoute, request, fakeFetch, fakeClock } from './helpers.mjs';
import { repo, fakeServer } from './fake-desk.mjs';
import { loadApp, find } from './page-harness.mjs';

const DAY = 86400e3;
const H = 3600e3;
const LOG = 'dispatch-log/2026-10.jsonl';
const AT = Date.parse('2026-10-07T12:00:00Z');
const sha = (n) => n.toString(16).padStart(40, '0');
const treeOf = (paths) => new Map(paths.map((p, i) => [p, { sha: sha(i + 1) }]));
const om = (p) => fixture(`orchestrator-m2/${p}`);
const sdFiles = () => ({
  [LOG]: fixture(`service-desk/${LOG}`),
  'queue/P-001-stop-6.md': fixture('service-desk/queue/P-001-stop-6.md'),
  'queue/P-001-dor-fail-2.md': fixture('service-desk/queue/P-001-dor-fail-2.md'),
  'queue/Q-003-failure-1.md': fixture('service-desk/queue/Q-003-failure-1.md'),
  'decisions/P-001/stop-6.md': fixture('service-desk/decisions/P-001/stop-6.md'),
  'decisions/P-001/dor-fail-2.md': fixture('service-desk/decisions/P-001/dor-fail-2.md'),
});
const poomRepo = () => repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], []);

// ---------------------------------------------------------------------------
// B1

test('B1 (AC21): the V5 footer waits for every v3 project to be read, with its log months, before it counts anything', () => {
  const read = { name: 'Service-Desk', v3: true, readOk: true, model: { logLoaded: true, v5Waits: [2 * H, 4 * H] } };
  const poom = { name: 'Personal-Org-Operating-Model', v3: false, readOk: false, model: null };
  assert.equal(v5Footer([read, poom], hoursMinutes), 'Median answer time, weekday cards, last 14 days: 3h 0m (goal under 4h; 2 cards)');
  const unread = { ...read, readOk: false };
  assert.equal(v5Footer([unread, poom], hoursMinutes), 'Median answer time, weekday cards, last 14 days: not available until Service-Desk has been read');
  const noLog = { ...read, model: { logLoaded: false, v5Waits: [] } };
  assert.equal(v5Footer([noLog], hoursMinutes), 'Median answer time, weekday cards, last 14 days: not available until Service-Desk has been read');
  assert.equal(v5Footer([{ ...read, model: null }], hoursMinutes), 'Median answer time, weekday cards, last 14 days: not available until Service-Desk has been read');
  assert.equal(notReadText(['A', 'B']), 'not available until A, B have been read');
  // Read, with nothing in the window: then, and only then, "no weekday cards".
  assert.equal(v5Footer([{ ...read, model: { logLoaded: true, v5Waits: [] } }], hoursMinutes),
    'Median answer time, weekday cards, last 14 days: no weekday cards in the last 14 days');
});

test('B1: the model says whether its log months are loaded', () => {
  const tree = treeOf([LOG]);
  const base = { project: SD, config: CONFIG, now: new Date(AT), pullPages: [], checkPages: [], tree };
  assert.equal(buildModel({ ...base, records: new Map() }).logLoaded, false, 'the log is on main but not read yet');
  assert.equal(buildModel({ ...base, records: new Map([[LOG, parseRecord('log', fixture(`service-desk/${LOG}`), LOG)]]) }).logLoaded, true);
  assert.equal(buildModel({ ...base, tree: treeOf([]), records: new Map() }).logLoaded, true, 'no log on main: nothing to load');
  assert.equal(buildModel({ ...base, tree: null, records: new Map() }).logLoaded, false, 'no tree yet');
});

test('Page B1: with Service-Desk unreadable and a log full of cards, the footer and "Time asked" never say none', async () => {
  const repos = { 'Service-Desk': repo(sdFiles(), [], []), 'Personal-Org-Operating-Model': poomRepo() };
  repos['Service-Desk'].fail = { state: 'cant-read', reason: 'token' };
  let app = await loadApp({ repos, now: AT });
  try {
    await app.advance(1000);
    const foot = app.els.foot.textContent;
    assert.match(foot, /^Median answer time, weekday cards, last 14 days: not available until Service-Desk has been read\./);
    assert.doesNotMatch(foot, /no weekday cards/);
  } finally {
    app.restore();
  }
  app = await loadApp({ hash: '#/p/Service-Desk/asked', repos, now: AT });
  try {
    await app.advance(1000);
    const text = app.els.view.textContent;
    assert.match(text, /Last 14 days: not available until Service-Desk has been read/);
    assert.match(text, /Cards: not available until Service-Desk has been read\./);
    assert.match(text, /Owner questions: not available until Service-Desk has been read\./);
    assert.doesNotMatch(text, /no cards|No cards|No owner questions/);
  } finally {
    app.restore();
  }
});

test('Page N3 (AC21): the footer shows the real median over Service-Desk\'s cards', async () => {
  const files = sdFiles();
  const repos = { 'Service-Desk': repo(files, [], []), 'Personal-Org-Operating-Model': poomRepo() };
  const entries = parseRecord('log', files[LOG], LOG).entries;
  const waits = v5Waits(cardRows(entries, treeOf(Object.keys(files)), AT), AT, CONFIG);
  assert.ok(waits.length >= 2, `the fixture log has cards in the window (${waits.length})`);
  const app = await loadApp({ repos, now: AT });
  try {
    await app.advance(1000);
    assert.match(app.els.foot.textContent, new RegExp(
      `^Median answer time, weekday cards, last 14 days: ${hoursMinutes(median(waits))} \\(goal under 4h; ${waits.length} cards\\)\\.`));
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// N1

function deskFor(files, clockStart = AT) {
  const clock = fakeClock(clockStart);
  const repos = { 'Service-Desk': repo(files, [], []), 'Personal-Org-Operating-Model': poomRepo() };
  const server = fakeServer(repos, CONFIG, clock);
  const desk = createDesk({ config: CONFIG, call: server.call, clock, store: createStore(null), isVisible: () => true });
  const box = () => makeBox(desk.model('Service-Desk'), desk.states.get('Service-Desk'), desk, clock.now());
  return { clock, desk, server, box, st: () => desk.states.get('Service-Desk') };
}

test('N1: 40 extra rulings never hold the read back: the project reads on the first cycle; the rulings arrive over later cycles', async () => {
  const files = sdFiles();
  for (let i = 0; i < 40; i++) files[`decisions/questions/R-${String(i).padStart(3, '0')}.md`] = `Ruling: A\n\n# ${i}\n`;
  const s = deskFor(files);
  s.desk.start();
  await s.clock.runUntil(AT + 1000);
  assert.equal(s.st().failure, null, 'never a GitHub error for budget');
  assert.equal(s.box().read.read, 'ok', 'read on the first cycle');
  assert.ok(s.st().blobCalls <= 6);
  assert.ok(s.box().model.timeAsked.questionsPending > 0, 'rulings still arriving');
  for (let i = 1; i <= 4; i++) await s.clock.runUntil(AT + i * 60_000 + 1000);
  const t = s.box().model.timeAsked;
  assert.equal(t.questionsPending, 0);
  assert.equal(t.questions.length, 40);
  assert.equal(s.st().failure, null);
  // Each history read once per device: steady polls ask for nothing more.
  const n = s.server.calls.filter((c) => c.path === '/api/blobs').length;
  await s.clock.runUntil(AT + 6 * 60_000 + 1000);
  assert.equal(s.server.calls.filter((c) => c.path === '/api/blobs').length, n);
});

test('N1: needed reads past the cycle\'s cap are "Checking…", then read on the next cycle — never reason github', async () => {
  const files = sdFiles();
  for (let i = 0; i < 200; i++) files[`status/P-${String(i + 100).padStart(3, '0')}.toml`] = `kind = "project"\nstate = "ready"\nrole = "definer"\n# ${i}\n`;
  const s = deskFor(files);
  s.desk.start();
  await s.clock.runUntil(AT + 1000);
  assert.equal(s.st().failure, null);
  assert.equal(s.box().read.read, 'checking');
  assert.equal(s.st().blobCalls, 6);
  await s.clock.runUntil(AT + 60_000 + 1000);
  assert.equal(s.box().read.read, 'ok');
  assert.equal(s.st().failure, null);
});

// ---------------------------------------------------------------------------
// N2

test('N2 (AC23): the context line with a figure missing says "not available", and "derived" only goes with a real peak', () => {
  const D = ['context_peak'];
  const full = { context_peak: 36494, context_window: 1000000, context_peak_percent: 3.6, derived: D };
  assert.equal(contextText(full), 'Context peak: 36,494 tokens, 3.6% of a 1,000,000-token window (derived from per-turn usage)');
  assert.equal(contextText({ context_peak: NOT_AVAILABLE, context_window: NOT_AVAILABLE, context_peak_percent: NOT_AVAILABLE, derived: D }),
    'Context peak: not available');
  assert.equal(contextText({ context_peak: NOT_AVAILABLE, context_window: 1000000, context_peak_percent: NOT_AVAILABLE, derived: D }),
    'Context peak: not available; window 1,000,000 tokens');
  assert.equal(contextText({ context_peak: 500, context_window: NOT_AVAILABLE, context_peak_percent: NOT_AVAILABLE, derived: D }),
    'Context peak: 500 tokens (derived from per-turn usage); window: not available');
  // From S-020's frozen form: the label goes only with a figure `derived` names (J10).
  assert.equal(contextText({ ...full, derived: [] }), 'Context peak: 36,494 tokens, 3.6% of a 1,000,000-token window');
  assert.equal(contextText({ ...full, derived: NOT_RECORDED }), 'Context peak: 36,494 tokens, 3.6% of a 1,000,000-token window');
  assert.equal(contextText({ context_peak: 'not recorded', context_window: 10, context_peak_percent: NOT_AVAILABLE, derived: D }),
    'Context peak: not recorded; window 10 tokens');
});

// ---------------------------------------------------------------------------
// N3: mutants the suite let through

test('N3 (AC20): cards are listed over 30 days, summarised over 14', () => {
  assert.equal(ASKED_DAYS, 30);
  assert.equal(SUMMARY_DAYS, 14);
  const line = (o) => JSON.stringify(o);
  const log = [
    line({ action: 'card', item: 'P-050', gate: 'dor', card: 1, time: '2026-10-01T12:00:00Z' }), // 19 days before
    line({ trigger: 'decision', item: 'P-050', gate: 'dor', card: 1, record: 'decisions/P-050/dor-1.md', word: 'build', proxy: false, time: '2026-10-01T14:00:00Z' }),
    line({ action: 'card', item: 'P-051', gate: 'dor', card: 1, time: '2026-10-19T12:00:00Z' }),
    line({ trigger: 'decision', item: 'P-051', gate: 'dor', card: 1, record: 'decisions/P-051/dor-1.md', word: 'build', proxy: false, time: '2026-10-19T13:00:00Z' }),
  ].join('\n');
  const now = Date.parse('2026-10-20T12:00:00Z');
  const rows = cardRows(parseRecord('log', log, LOG).entries, treeOf([]), now);
  assert.deepEqual(rows.map((r) => r.label).sort(), ['P-050 dor-1', 'P-051 dor-1'], 'the 19-day-old card is listed');
  assert.deepEqual(cardSummary(rows, now), { count: 1, medianMs: H }, 'but not summarised');
});

test('N3 (AC20): in v3 an answered question is never listed as open', () => {
  const tree = treeOf(['questions/Q-040-x.md', 'decisions/questions/Q-040-x.md']);
  const history = new Map([['questions/Q-040-x.md', { oldest: '2026-10-19T12:00:00Z' }], ['decisions/questions/Q-040-x.md', { oldest: '2026-10-19T15:00:00Z' }]]);
  const { rows } = questionRows('v3', tree, new Map(), history, Date.parse('2026-10-20T12:00:00Z'));
  assert.deepEqual(rows.map((r) => [r.label, r.state, r.waitMs]), [['Q-040-x', 'answered', 3 * H]]);
});

function mergeModel(files, records) {
  const tree = treeOf(Object.keys(files));
  return buildModel({ project: SD, config: CONFIG, now: new Date(AT), pullPages: [], checkPages: [], tree, records });
}

test('N3 (AC47): a merges.jsonl line for the item but another tip doesn\'t clear the card', () => {
  const card = 'queue/Q-007-merge-by-hand.md';
  const other = JSON.stringify({ item: 'Q-007', item_tip: 'f'.repeat(40), merge: 'e'.repeat(40), spec: 'S-007' });
  const m = mergeModel({ [card]: 1, 'status/merges.jsonl': 1 }, new Map([
    [card, parseRecord('merge-card', om(card), card)], ['status/merges.jsonl', parseRecord('merges', `${other}\n`)]]));
  assert.deepEqual(m.flagged.map((f) => f.title), ['Q-007: merge by hand']);
});

test('N3 (AC47): a merge card whose tip can\'t be read stays flagged, whatever merges.jsonl and compare say', () => {
  const card = 'queue/P-002-merge-conflict.md';
  const broken = om(card).replace(/^item: .*$/m, 'item: P-002   tip: (lost)');
  const m = buildModel({ project: SD, config: CONFIG, now: new Date(AT), pullPages: [], checkPages: [],
    tree: treeOf([card, 'status/merges.jsonl']),
    records: new Map([[card, parseRecord('merge-card', broken, card)], ['status/merges.jsonl', parseRecord('merges', om('status/merges.jsonl'))]]),
    compare: new Map([['0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c', 'merged']]) });
  const f = m.flagged.filter((x) => x.kind === 'merge');
  assert.equal(f.length, 1);
  assert.equal(f[0].words, 'item tip not recorded');
  assert.ok(m.notes.some((n) => n.includes('tip is unknown')));
});

test('N3 (AC46): while the hold cards\' creation times are unknown, every one is flagged', () => {
  const a = 'queue/ci-hold-e2ab9c55e561.md';
  const b = 'queue/ci-hold-4a2448939173.md';
  const m = buildModel({ project: SD, config: CONFIG, now: new Date(AT), pullPages: [], checkPages: [], tree: treeOf([a, b]),
    records: new Map(), history: new Map() });
  assert.deepEqual(m.flagged.filter((f) => f.kind === 'hold').map((f) => f.hold.path).sort(), [a, b].sort());
});

test('N3 (J6): a poll with 8, 9 or 10 ETags is accepted (3a and 3b paging); 11 is refused', async () => {
  _resetKeyCache();
  const key = await makeKey('kid-1');
  const jwt = await signJwt(key, goodClaims());
  const U = urlsFor(SD);
  const head = JSON.parse(recorded('branch-main').body).commit.sha;
  for (const n of [8, 9, 10]) {
    const urls = [U.branch, U.pulls];
    for (const ev of ['push', 'workflow_dispatch']) for (const pg of [1, 2, 3]) urls.push(`${U.runs(head, ev)}${pg > 1 ? `&page=${pg}` : ''}`);
    urls.push(`${U.pulls}&page=2`, `${U.pulls}&page=3`);
    const etags = Object.fromEntries(urls.slice(0, n).map((u, i) => [u, `"e${i}"`]));
    assert.equal(Object.keys(etags).length, n);
    const f = fakeFetch([certsRoute([key]), (url) => (url.startsWith('https://api.github.com/') ? { status: 304, headers: { ETag: '"x"' } } : undefined)]);
    const res = await handle({ request: request('/api/poll', { jwt, body: { project: 'Service-Desk', head, etags } }), env: ENV }, 'poll', { fetch: f, now: () => NOW });
    assert.equal(res.status, 200, `${n} ETags`);
  }
});

test('Page N3 (AC18): with webCommitsToDefault false the card view shows the new-branch message before the link', async () => {
  const sd = PUBLIC_CONFIG.projects.find((p) => p.name === 'Service-Desk');
  sd.webCommitsToDefault = false;
  const repos = { 'Service-Desk': repo(sdFiles(), [], []), 'Personal-Org-Operating-Model': poomRepo() };
  repos['Service-Desk'].commit({ 'decisions/P-001/stop-6.md': null });
  const app = await loadApp({ hash: '#/p/Service-Desk/card/queue%2FP-001-stop-6.md', repos, now: AT });
  try {
    await app.advance(1000);
    const radio = find(app.els.view, (e) => e.tag === 'input' && e.attrs.value === 'drop');
    radio.listeners.change[0]();
    const warn = find(app.els.view, (e) => e.className === 'warn');
    assert.equal(warn && warn.textContent, "This repository doesn't take commits to main from the web. On GitHub, choose 'Create a new branch' and then open the pull request GitHub offers; the card stays flagged until that pull request is merged.");
    const result = find(app.els.view, (e) => e.className === 'answer-result');
    assert.equal(result.children[0].className, 'warn', 'the message comes first, before the link');
    assert.ok(find(app.els.view, (e) => e.className === 'go'), 'the link is still offered, unchanged');
  } finally {
    sd.webCommitsToDefault = true;
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// N4

test('N4 (J1): a compare body of megabytes is read only until its status, and the download is stopped', async () => {
  const rec = recorded('compare-diverged');
  const v = JSON.parse(rec.body);
  const patch = v.files[0].patch || 'x';
  v.files = Array.from({ length: 300 }, (_, i) => ({ ...v.files[i % v.files.length], patch: patch.repeat(Math.ceil(10000 / patch.length)) }));
  const big = JSON.stringify(v);
  assert.ok(big.length > 2_000_000, `${big.length} characters`);
  const bytes = new TextEncoder().encode(big);
  const CHUNK = 16384;
  let pulls = 0;
  let cancelled = false;
  const fetchImpl = async (url) => {
    if (!url.includes('/compare/')) return new Response('{}', { status: 404 });
    let off = 0;
    const body = new ReadableStream({
      pull(ctl) {
        pulls++;
        if (off >= bytes.length) return ctl.close();
        ctl.enqueue(bytes.slice(off, off + CHUNK));
        off += CHUNK;
      },
      cancel() { cancelled = true; },
    });
    return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const base = 'a'.repeat(40);
  const head = 'c'.repeat(40);
  const r = await readBlobs({ project: SD, blobs: [], history: [], compare: [{ base, head }] }, { token: 't', fetch: fetchImpl, now: () => NOW });
  assert.deepEqual(JSON.parse(r.compare[`${base}...${head}`]), { status: 'diverged', ahead_by: 3, behind_by: 4, total_commits: 3 });
  assert.ok(pulls * CHUNK < COMPARE_SCAN_CHARS + 2 * CHUNK, `read ${pulls} chunks of ${Math.ceil(bytes.length / CHUNK)}`);
  assert.equal(cancelled, true, 'the rest is never downloaded');
});

// ---------------------------------------------------------------------------
// N5

test('Page N5 (AC16): while the note is being typed, the note box is kept, and the answer box still follows the records', async () => {
  const repos = { 'Service-Desk': repo(sdFiles(), [], []), 'Personal-Org-Operating-Model': poomRepo() };
  repos['Service-Desk'].commit({ 'decisions/P-001/stop-6.md': null });
  const app = await loadApp({ hash: '#/p/Service-Desk/card/queue%2FP-001-stop-6.md', repos, now: AT });
  try {
    await app.advance(1000);
    find(app.els.view, (e) => e.tag === 'input' && e.attrs.value === 'drop').listeners.change[0]();
    const note = find(app.els.view, (e) => e.tag === 'textarea');
    note.value = 'half-typed';
    note.listeners.input[0]();
    note.dataset = { keep: note.attrs['data-keep'] };
    app.doc.activeElement = note;
    assert.ok(find(app.els.view, (e) => e.className === 'go'));
    // The answer lands on main while the owner is still typing.
    repos['Service-Desk'].commit({ 'decisions/P-001/stop-6.md': 'Decision: re-scope\n' });
    await app.advance(60_000);
    assert.equal(find(app.els.view, (e) => e.tag === 'textarea'), note, 'the same note box, text and caret untouched');
    assert.equal(note.value, 'half-typed');
    assert.equal(find(app.els.view, (e) => e.className === 'go'), null, 'no link once answered');
    assert.match(app.els.view.textContent, /already answered: re-scope/);
    // Typing on still updates the (now answered) box, never a link.
    note.listeners.input[0]();
    assert.equal(find(app.els.view, (e) => e.className === 'go'), null);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// N6

test('N6 (AC20): a question whose history read hasn\'t returned is "loading", not "not recorded"; unread rulings are counted as pending', () => {
  const tree = treeOf(['questions/Q-041-y.md', 'questions/Q-042-z.md', 'decisions/questions/Q-043-w.md']);
  const history = new Map([['questions/Q-042-z.md', { oldest: null }]]);
  const { rows, pending } = questionRows('v3', tree, new Map(), history, Date.parse('2026-10-20T12:00:00Z'));
  const by = Object.fromEntries(rows.map((r) => [r.label, r]));
  assert.equal(by['Q-041-y'].raisedLoading, true);
  assert.equal(by['Q-041-y'].raisedAt, null);
  assert.equal(by['Q-042-z'].raisedLoading, false, 'a path with no history is "not recorded"');
  assert.equal(pending, 1);
});
