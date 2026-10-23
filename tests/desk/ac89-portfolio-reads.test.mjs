// ac-test: S-001/AC89 join-test: S-001/J23 — after MD3, stage 7 (the amendment "After MD3", specs/S-001.md:2330): AC89 (l),
// the portfolio's reads (specs/S-001.md:7944-7962; the test's list at :7992-7994), and J23 as changed after MD3
// (:12334-12354): a portfolio Done mark kicked back at the read due 5 minutes after it; the 11th mark of a day judged at
// the 5-minute reads; the day turning at midnight in `ownerTimeZone`; no such read without device storage; the template's
// own file names; which queue files are cards; and a read that stays pending counted as failed. AC14's day with A3's 9,952
// is in tests/desk/ac14-budget.test.mjs. Records: the made-up portfolio of pf-fixtures.mjs (NOT real records) and, for
// the template's own names, made-up files in the model portfolio template's form (labelled so in fixtures/README.md).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSandbox, findAll, byClass } from './sandbox-helpers.mjs';
import { findKeyed } from './sandbox-fixtures.mjs';
import { CONFIG, fakeClock } from './helpers.mjs';
import { fakeServer, repo, PORTFOLIO_REPO } from './fake-desk.mjs';
import { waSetup, memStore } from './wa-fixtures.mjs';
import { pfFiles, cardText, MADE_UP, withPortfolio, addPortfolio } from './pf-fixtures.mjs';
import { createDesk, PORTFOLIO_POLL_MS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { KICK_BACK_MINUTES, kickReadSlot, KICK_READS_KEY, KICK_READS_A_DAY } from '../../src/lib/board.js';
import { rareView, intentLine, portfolioKind, QUEUE_FILE_RE, portfolioRead, PF_BOARD, PF_WORDS } from '../../src/lib/portfolio.js';

const NOW = Date.parse('2026-10-22T18:00:00Z'); // 13:00 in ownerTimeZone (America/Chicago)
const TZ = CONFIG.ownerTimeZone;
const CARD = 'queue/PF-001-explore-1.md';
const CARD_ID = `${PF_BOARD}|portfolio|${CARD}`;
const ONE = () => pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1) } });
const lane = (app, k) => findKeyed(app, `lane:${k}`);
/** A device's storage the page reads and writes, as localStorage. */
function device() {
  const m = new Map();
  const s = { m, throws: false,
    getItem(k) { if (s.throws) throw new Error('blocked'); return m.has(k) ? m.get(k) : null; },
    setItem(k, v) { if (s.throws) throw new Error('blocked'); m.set(k, String(v)); },
    removeItem(k) { if (s.throws) throw new Error('blocked'); m.delete(k); } };
  return s;
}
async function open({ pf = ONE(), hash = `#/waiting/card/${encodeURIComponent(CARD_ID)}`, store = memStore(), now = NOW } = {}) {
  const setup = waSetup({});
  setup.config = withPortfolio(setup.config);
  const r = addPortfolio(setup.repos, pf);
  const app = await loadSandbox({ ...setup, hash, now, store });
  await app.advance(1000);
  await app.advance(61_000);
  app.pf = r;
  return app;
}
const pfPolls = (app) => app.server.calls.filter((c) => c.target === 'portfolio' && c.path === '/api/poll').map((c) => c.at);

// ---------------------------------------------------------------------------
// AC89 (l): a Done mark judged about 5 minutes after it

test('AC89 (l): a portfolio Done mark the queue still holds is kicked back at the read due KICK_BACK_MINUTES after it — "The card file is still in the portfolio\'s queue" — not at the second 5-minute read; that read is made once, for that mark', async () => {
  assert.equal(KICK_BACK_MINUTES, 5);
  const app = await open();
  try {
    // The page's own 5-minute reads: at the opening (NOW + 1 s) and then each 5 minutes; the mark at 62 s, between them.
    const markAt = app.now;
    await app.tap(findKeyed(app, 'sheet-done'));
    await app.go('#/waiting');
    assert.match(lane(app, 'done').textContent, /Confirming with GitHub/);
    const before = pfPolls(app).length;
    await app.advance(KICK_BACK_MINUTES * 60_000 - 2_000);
    assert.match(lane(app, 'done').textContent, /Confirming with GitHub/, 'not yet: under 5 minutes');
    await app.advance(4_000);
    await app.go('#/waiting');
    assert.match(lane(app, 'kick').textContent, /The card file is still in the portfolio's queue/, 'kicked back at about 5 minutes');
    const extra = pfPolls(app).filter((t) => t >= markAt + KICK_BACK_MINUTES * 60_000 - 1 && t <= markAt + KICK_BACK_MINUTES * 60_000 + 1_000);
    assert.equal(extra.length, 1, 'one read, due 5 minutes after the mark');
    assert.ok(pfPolls(app).length - before <= 2, 'and no more than the 5-minute read beside it');
  } finally {
    app.restore();
  }
  // The file leaves the queue before the 5 minutes: confirmed at that read, never kicked back.
  const ok = await open();
  try {
    await ok.tap(findKeyed(ok, 'sheet-done'));
    ok.pf.commit({ [CARD]: null });
    await ok.advance(KICK_BACK_MINUTES * 60_000 + 2_000);
    await ok.go('#/waiting');
    assert.doesNotMatch(lane(ok, 'done').textContent, /Confirming/);
    assert.match(lane(ok, 'done').textContent, /Whether to explore the made-up reading-list app as a project/, 'confirmed');
    assert.doesNotMatch(lane(ok, 'kick').textContent, /still in the portfolio's queue/);
  } finally {
    ok.restore();
  }
});

test('AC89 (l): the 11th mark of a day on this device has no read of its own — judged at the 5-minute reads as before, up to about 10 minutes; the count is the device\'s, under its own key', async () => {
  const store = device();
  // Ten marks already made today on this device (made up): the cap reached.
  store.m.set(KICK_READS_KEY, JSON.stringify({ day: '2026-10-22', n: KICK_READS_A_DAY }));
  const app = await open({ store });
  try {
    await app.tap(findKeyed(app, 'sheet-done'));
    await app.advance(KICK_BACK_MINUTES * 60_000 + 2_000);
    await app.go('#/waiting');
    assert.match(lane(app, 'done').textContent, /Confirming with GitHub/, 'no read at 5 minutes: still confirming');
    assert.deepEqual(JSON.parse(store.m.get(KICK_READS_KEY)), { day: '2026-10-22', n: 10 }, 'not counted past 10');
    // Its next 5-minute read judges it.
    await app.advance(5 * 60_000);
    await app.go('#/waiting');
    assert.match(lane(app, 'kick').textContent, /The card file is still in the portfolio's queue/, 'kicked back at the 5-minute read');
  } finally {
    app.restore();
  }
  // Pure: ten reads a day, then none; each counted.
  const s = createStore(device());
  const t = Date.parse('2026-10-22T18:00:00Z');
  const got = Array.from({ length: 12 }, () => kickReadSlot(s, t, TZ));
  assert.deepEqual(got, [...Array(10).fill(true), false, false]);
  assert.deepEqual(s.getJSON(KICK_READS_KEY, null), { day: '2026-10-22', n: 10 });
});

test('AC89 (l): the day turns at midnight in ownerTimeZone (America/Chicago), not at UTC\'s — ten marks at 23:30 on 22 Oct leave none for 23:59, and 00:00 on 23 Oct starts a new day of ten', () => {
  const s = createStore(device());
  const at = (iso) => Date.parse(iso);
  // 23:30 CDT on 22 Oct is 04:30Z on 23 Oct: still 22 Oct on the owner's clock.
  for (let i = 0; i < 10; i++) assert.equal(kickReadSlot(s, at('2026-10-23T04:30:00Z'), TZ), true);
  assert.equal(kickReadSlot(s, at('2026-10-23T04:59:00Z'), TZ), false, '23:59 CDT on 22 Oct: the day\'s ten used');
  assert.deepEqual(s.getJSON(KICK_READS_KEY, null), { day: '2026-10-22', n: 10 });
  assert.equal(kickReadSlot(s, at('2026-10-23T05:00:00Z'), TZ), true, '00:00 CDT on 23 Oct: a new day');
  assert.deepEqual(s.getJSON(KICK_READS_KEY, null), { day: '2026-10-23', n: 1 });
});

test('AC89 (l): with no device storage, or storage that refuses a read or a write, no such read is made, and every mark is judged at the 5-minute reads', async () => {
  const refusing = device();
  refusing.throws = true;
  assert.equal(kickReadSlot(createStore(refusing), NOW, TZ), false, 'a read refused');
  assert.equal(kickReadSlot(createStore(null), NOW, TZ), false, 'no storage');
  const half = device();
  half.setItem = () => { throw new Error('full'); };
  assert.equal(kickReadSlot(createStore(half), NOW, TZ), false, 'a write refused: the read not counted, so not made');
  const store = device();
  store.throws = true;
  const app = await open({ store });
  try {
    const before = pfPolls(app).length;
    await app.tap(findKeyed(app, 'sheet-done'));
    await app.advance(KICK_BACK_MINUTES * 60_000 + 2_000);
    assert.equal(pfPolls(app).length - before, 1, 'only the 5-minute read in those 5 minutes');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// J23, changed after MD3

/** The model portfolio template's own files, in its form (made up for the test, NOT real records). */
const TEMPLATE = () => pfFiles({ more: { 'library/facts/_TEMPLATE.md': `# A fact's template (${MADE_UP})\n`, 'intent/PORTFOLIO-INTENT.md': `# Standing intent (${MADE_UP})\n` } });

test('J23 (changed after MD3): the template\'s own files — library/facts/_TEMPLATE.md is no fact ("Library facts: none yet"); intent/PORTFOLIO-INTENT.md is named apart, "Standing intent: intent/PORTFOLIO-INTENT.md (its words not read)"', async () => {
  const tree = new Map(Object.keys(TEMPLATE()).map((p) => [p, { sha: 'x', size: 1 }]));
  const r = rareView(tree);
  assert.deepEqual(r.facts, [], 'its README and its template only');
  assert.equal(r.intentFile, true);
  assert.deepEqual(r.intent, []);
  assert.equal(intentLine(r), 'Standing intent: intent/PORTFOLIO-INTENT.md (its words not read)');
  assert.equal(intentLine({ ...r, intentFile: false }), 'Standing intent: none yet');
  assert.equal(intentLine({ ...r, intent: ['2026-standing.md'] }), 'Standing intent: intent/PORTFOLIO-INTENT.md (its words not read); 1 more · 2026-standing.md');
  const withFact = rareView(new Map([...tree, ['library/facts/F-001-made-up.md', { sha: 'y', size: 1 }]]));
  assert.deepEqual(withFact.facts, ['F-001-made-up.md'], 'a fact beside the template counts');
  // On the rarer records' sheet.
  const app = await open({ pf: TEMPLATE(), hash: '#/pf/rare' });
  try {
    const items = byClass(byClass(app.view, 'v2-sheet')[0], 'v2-pfsi').map((li) => li.textContent);
    assert.ok(items.includes('Library facts: none yet'), items.join(' | '));
    assert.ok(items.includes('Standing intent: intent/PORTFOLIO-INTENT.md (its words not read)'), items.join(' | '));
  } finally {
    app.restore();
  }
});

test('J23 (changed after MD3): a card is a Markdown file directly under queue/ whose name does not start with `_` and is not README.md — a README.md, a .gitkeep or any other file is never a card', async () => {
  for (const [p, card] of [['queue/PF-001-explore-1.md', true], ['queue/README.md', false], ['queue/.gitkeep', false], ['queue/_DECISION_CARD.md', false],
    ['queue/notes.txt', false], ['queue/sub/PF-002.md', false], ['queue/PF-003.MD', false], ['queue/READMEs.md', true]]) {
    assert.equal(QUEUE_FILE_RE.test(p), card, p);
    assert.equal(portfolioKind(p), card ? 'pf-card' : null, p);
  }
  const app = await open({ pf: pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1), 'README.md': `# The queue (${MADE_UP})\n`, '.gitkeep': '' } }), hash: '#/waiting' });
  try {
    const cards = findAll(app.view, (e) => e.attrs && /\|portfolio\|/.test(e.attrs['data-card'] || '')).map((e) => e.attrs['data-card']);
    assert.deepEqual(cards, [CARD_ID], 'one card: its README and .gitkeep are not cards');
    assert.ok(!app.server.calls.some((c) => c.target === 'portfolio' && c.path === '/api/blobs' && JSON.stringify(c.body).includes('gitkeep')), 'never read as one');
  } finally {
    app.restore();
  }
});

test('J23 (changed after MD3): a portfolio read that has not answered when the next 5-minute read falls due counts as failed — "Can\'t read your portfolio since HH:MM", from the time it was asked — and the next read is made as due; inside those 5 minutes, "Checking…"; its late answer never applied; the projects\' reads untouched', async () => {
  const clock = fakeClock(NOW);
  const config = withPortfolio();
  const repos = { 'Service-Desk': repo({ 'governance/ROUTING.toml': '[time_limits]\n' }), 'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': '# Ledger\n' }), [PORTFOLIO_REPO]: repo(pfFiles()) };
  const server = fakeServer(repos, config, clock);
  let hang = false;
  const held = [];
  const call = (path, body) => {
    if (hang && body && body.target === 'portfolio') return new Promise((resolve) => { held.push(() => server.call(path, body).then(resolve)); });
    return server.call(path, body);
  };
  const desk = createDesk({ config, call, clock, store: createStore(null), isVisible: () => true, j11: true });
  desk.start();
  await clock.runUntil(NOW + 1_000);
  assert.equal(desk.portfolio().failure, null, 'read once');
  const projectPolls = () => server.calls.filter((c) => c.path === '/api/poll' && c.project).length;
  hang = true;
  await clock.runUntil(NOW + PORTFOLIO_POLL_MS + 1_000); // the 5-minute read is asked, and never answers
  const askedAt = NOW + PORTFOLIO_POLL_MS;
  assert.equal(held.length, 1, 'the read asked');
  assert.equal(desk.portfolio().failure, null, 'inside its 5 minutes: not yet failed');
  const r1 = portfolioRead(desk.portfolio(), clock.now(), TZ);
  assert.notEqual(r1.state, 'cant');
  const polls0 = projectPolls();
  await clock.runUntil(askedAt + PORTFOLIO_POLL_MS + 1_000);
  const f = desk.portfolio().failure;
  assert.ok(f, 'failed once the next read fell due');
  assert.equal(f.since, askedAt, 'since the time it was asked');
  assert.match(portfolioRead(desk.portfolio(), clock.now(), TZ).problem, /^Can't read your portfolio since \d\d:\d\d$/);
  assert.equal(held.length, 2, 'the next read made as due');
  assert.ok(projectPolls() - polls0 >= 4, 'the projects polled every minute throughout');
  // The late answer of the first read arrives: never applied (the read is the second's now).
  hang = false;
  const before = JSON.stringify(desk.portfolio().failure);
  await held[0]();
  await clock.flush();
  assert.equal(JSON.stringify(desk.portfolio().failure), before, 'a late answer changes nothing');
  await held[1]();
  await clock.flush();
  assert.equal(desk.portfolio().failure, null, 'the read made as due answered: read again');
  desk.stop();
  assert.equal(PF_WORDS.intentFile, 'intent/PORTFOLIO-INTENT.md');
});
