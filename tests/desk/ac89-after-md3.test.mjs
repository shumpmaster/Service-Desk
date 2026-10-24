// ac-test: S-001/AC89 — after MD3 (the amendment "After MD3", stage 1, specs/S-001.md:2323-2326): whatever the desk
// can't read says so with its time, and every screen says each thing once and in true words. Stage 1 builds parts
// (a), (b), (c) and (h) (specs/S-001.md:7823-7896, the test's list at :7969-7983). The suite has no browser: the page
// is the desk's own code under the fake DOM, the fake desk function and the scheduler's fake clock. Records: AC52's
// one item of each kind (sandbox-fixtures.mjs's `fullRepo`, made up, NOT real), Service-Desk's J11 records at 3117150
// and J12's built answer (real, as AC72's test uses them), AC77's real asked question, and the made-up records named
// in tests/desk/fixtures/README.md ("After MD3, stage 1"), each NOT a real record.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG, SRC, fixture } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, linksIn } from './sandbox-helpers.mjs';
import { NOW, fullRepo, v3, v25 } from './sandbox-fixtures.mjs';
import { textSetup } from './screen-text.mjs';
import { sdRepo, SD3, NOW as SD_NOW, pullNodes, answerOf } from './tv2-fixtures.mjs';
import { NOTIFY_FIX } from './notify-helpers.mjs';
import { POLL_MS, STALE_MS, REASON_WORDS } from '../../src/lib/scheduler.js';
import { oneProjectView, ONE_WORDS, shortName, WORDS } from '../../src/lib/board.js';
import { capView, versionsView } from '../../src/lib/portfolio.js';
import { DEPLOY_SHEET, phaseView, PHASES_NOT_AVAILABLE, PHASES_READING } from '../../src/lib/sandbox.js';
import { startDesk, LOAD_FAILED_WORDS } from '../../src/lib/page.js';
import { hhmm } from '../../src/lib/timefmt.js';

const TZ = CONFIG.ownerTimeZone;
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const lane = (app, k) => keyed(app, `lane:${k}`);
const cardsIn = (app, k) => byClass(lane(app, k), 'v2-card');
const sub = (app) => byClass(app.view, 'v2-sub')[0].textContent;
const smallLine = (app) => (byClass(app.view, 'v2-qsmall')[0] || { textContent: null }).textContent;
const empty = (app, k) => (byClass(lane(app, k), 'v2-empty')[0] || { textContent: null }).textContent;
/** Rewritten in G2 (AC91 (f)): Kicked back is a strip above the lanes, its empty state one quiet line, "Kicked back · <words>". */
const strip = (app) => lane(app, 'kick').textContent;
const count = (app, k) => (byClass(lane(app, k), 'v2-lc')[0] || { textContent: null }).textContent;
/** The line above the lanes (AC89 (a), states 2 and 5): the quiet lines' box that comes before the lanes, or null. */
function aboveLanes(app) {
  const kids = byClass(app.view, 'v2-board')[0].children;
  const at = kids.findIndex((c) => /\bv2-lanes\b/.test(c.className));
  const q = kids.slice(0, at).find((c) => /\bv2-quiet\b/.test(c.className));
  return q ? q.textContent : null;
}
const noChecking = (app, why) => assert.doesNotMatch(byClass(app.view, 'v2-board')[0].textContent, /checking…|Checking…/, `${why}: a failed read is never "checking…"`);

/** Alpha (AC52's one of each kind, made up) and a quiet made-up v3 project, Beta, so the page draws on Beta's polls too. */
function boardSetup() {
  const beta = repo({ 'README.md': '# Beta\n\nNOT a real project: made up for AC89\'s test.\n' });
  return { config: { ...CONFIG, projects: [v3('Alpha'), v3('Beta')] }, repos: { Alpha: fullRepo('Alpha'), Beta: beta } };
}
/** A project's calls left unanswered while `on()` says so (a read in flight, or a first read that never answers). */
function hang(app, name, on) {
  const real = app.server.call;
  app.server.call = (path, body) => (body && body.project === name && on() ? new Promise(() => {}) : real(path, body));
}
async function redraw(app) {
  app.module.refresh();
  await app.flush();
}

// ---------------------------------------------------------------------------
// (a) Waiting for one project the desk can't read (specs/S-001.md:7823-7852)

test('AC89 (a): the five states as a pure view, from readState — each one\'s line under the title, the line above the lanes, the cards and an empty lane\'s word; "HH:MM" in ownerTimeZone', () => {
  const at = Date.parse('2026-10-14T15:02:00Z');
  const v = (read, last) => oneProjectView({ name: 'Alpha', read, lastSuccessAt: last, tz: TZ });
  const s1 = v({ read: 'checking', since: null }, null);
  assert.deepEqual([s1.state, s1.under(at), s1.cant, s1.cards, s1.empty, s1.counts], [1, 'Checking…', null, false, 'Not read yet', null]);
  const s2 = v({ read: 'cant-read', since: Date.parse('2026-10-14T15:00:00Z'), words: REASON_WORDS.stale }, null);
  assert.deepEqual([s2.state, s2.under(at), s2.cant, s2.cards, s2.empty, s2.counts],
    [2, 'Not read in this opening', "Can't read Alpha since 10:00: no successful read for 3 minutes", false, "Can't read", null]);
  const s3 = v({ read: 'ok', since: at - 30e3 }, at - 30e3);
  assert.deepEqual([s3.state, s3.under(at), s3.cant, s3.cards, s3.empty, s3.counts], [3, 'checked 30 s ago', null, true, 'Nothing here', 'read']);
  const s4 = v({ read: 'checking', since: null }, at - 10 * 60e3);
  assert.deepEqual([s4.state, s4.under(at), s4.cant, s4.cards, s4.empty, s4.counts], [4, 'checked 10 min ago', null, true, 'Nothing here', 'checking']);
  const s5 = v({ read: 'cant-read', since: at - 60e3, words: REASON_WORDS.network }, at - 2 * 60e3);
  assert.deepEqual([s5.state, s5.under(at), s5.cant, s5.cards, s5.empty, s5.counts],
    [5, 'checked 2 min ago', `Can't read Alpha since 10:01: ${REASON_WORDS.network}`, true, 'Nothing here when last read', null]);
  assert.equal(ONE_WORDS.whenLast, 'Nothing here when last read');
  assert.equal(WORDS.empty, 'Nothing here');
});

test('AC89 (a), state 3: fresh — "checked <age> ago", its cards and counts, "Nothing here"; a routine poll in flight leaves it fresh, its counts never "checking…"; a 0 on the small line is words that open nothing', async () => {
  const s = boardSetup();
  const app = await loadSandbox({ ...s, hash: '#/waiting/Beta', now: NOW });
  let inFlight = false;
  hang(app, 'Beta', () => inFlight);
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.match(sub(app), /^checked \d+ s ago$/);
    assert.equal(aboveLanes(app), null, 'nothing above the lanes');
    assert.equal(smallLine(app), 'With the agents: 0 · Being recorded by the automatic job: 0');
    assert.equal(findAll(byClass(app.view, 'v2-qsmall')[0], (e) => e.tag === 'button').length, 0, 'a 0 opens nothing');
    assert.equal(empty(app, 'wait'), 'Nothing here');
    assert.equal(count(app, 'wait'), '0');
    // A routine poll in flight: Beta's next call is not answered yet.
    inFlight = true;
    await app.advance(POLL_MS + 5000);
    await redraw(app);
    assert.match(sub(app), /^checked 1 min ago$/, 'still fresh');
    assert.equal(smallLine(app), 'With the agents: 0 · Being recorded by the automatic job: 0', 'the counts unchanged');
    assert.equal(empty(app, 'wait'), 'Nothing here');
    noChecking(app, 'in flight');
  } finally {
    app.restore();
  }
  // A count that is not 0 is a control opening its fold (AC80): Alpha's pull request with the agents is made up in sandbox-fixtures.
  const a = await loadSandbox({ ...boardSetup(), hash: '#/waiting/Alpha', now: NOW });
  try {
    await a.advance(1000);
    await a.advance(POLL_MS);
    assert.equal(cardsIn(a, 'wait').length > 0, true, 'its cards');
    for (const b of findAll(byClass(a.view, 'v2-qsmall')[0], (e) => e.tag === 'button')) assert.doesNotMatch(b.textContent, /: 0$/, 'only a count above 0 is a control');
  } finally {
    a.restore();
  }
});

test('AC89 (a), state 4: back in view after 10 minutes — "checked 10 min ago", its last read\'s cards, the two counts "checking…", an empty lane "Nothing here"; read again, state 3', async () => {
  const app = await loadSandbox({ ...boardSetup(), hash: '#/waiting/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const n = cardsIn(app, 'wait').length;
    assert.ok(n > 0);
    await app.visibility('hidden');
    await app.advance(10 * 60e3);
    await app.visibility('visible');
    assert.match(sub(app), /^checked 1[01] min ago$/, sub(app));
    assert.equal(cardsIn(app, 'wait').length, n, 'its last read\'s cards');
    assert.equal(smallLine(app), 'With the agents: checking… · Being recorded by the automatic job: checking…');
    assert.equal(strip(app), 'Kicked back · none', 'rewritten in G2: the strip\'s "none" for the lanes\' "Nothing here"');
    assert.equal(aboveLanes(app), null);
    await app.advance(POLL_MS);
    assert.match(sub(app), /^checked \d+ s ago$/, 'read again: state 3');
    assert.match(smallLine(app), /^With the agents: \d+ · Being recorded by the automatic job: \d+$/);
  } finally {
    app.restore();
  }
});

test('AC89 (a), states 1 then 2: a first read unanswered for 3 minutes in view — "Checking…", nothing above the lanes, no cards, "Not read yet"; then "Not read in this opening", "Can\'t read <project> since HH:MM" from the opening\'s start with AC5\'s reason, "Can\'t read", and never "checking…"', async () => {
  const app = await loadSandbox({ ...boardSetup(), hash: '#/waiting/Alpha', now: NOW });
  hang(app, 'Alpha', () => true);
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    await redraw(app);
    assert.equal(sub(app), 'Checking…', 'state 1');
    assert.equal(aboveLanes(app), null, 'nothing above the lanes');
    assert.equal(cardsIn(app, 'wait').length, 0, 'no cards');
    assert.equal(empty(app, 'wait'), 'Not read yet');
    assert.equal(strip(app), 'Kicked back · not read yet', 'rewritten in G2: the strip says the unknown in the state\'s words');
    assert.equal(count(app, 'wait'), null, 'no count for an unknown');
    assert.equal(smallLine(app), null, 'no counts under the lanes');
    await app.advance(STALE_MS - POLL_MS);
    await redraw(app);
    assert.equal(sub(app), 'Not read in this opening', 'state 2, after 3 minutes in view');
    assert.equal(aboveLanes(app), `Can't read Alpha since ${hhmm(new Date(NOW), TZ)}: ${REASON_WORDS.stale}`, 'since the opening\'s start');
    assert.equal(cardsIn(app, 'wait').length, 0);
    assert.equal(empty(app, 'wait'), "Can't read");
    assert.equal(count(app, 'wait'), null);
    assert.equal(smallLine(app), null);
    noChecking(app, 'state 2');
  } finally {
    app.restore();
  }
});

test('AC89 (a), state 2 for a failed read: "Can\'t read <project> since HH:MM" with the failure\'s reason in words, above the lanes', async () => {
  const s = boardSetup();
  s.repos.Alpha.fail = { kind: 'network' };
  const app = await loadSandbox({ ...s, hash: '#/waiting/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.equal(sub(app), 'Not read in this opening');
    assert.equal(aboveLanes(app), `Can't read Alpha since ${hhmm(new Date(NOW + 1000), TZ)}: ${REASON_WORDS.network}`);
    assert.equal(empty(app, 'wait'), "Can't read");
    noChecking(app, 'failed');
  } finally {
    app.restore();
  }
});

test('AC89 (a), state 5: a failure after a success — "checked <age> ago" from that success, "Can\'t read <project> since HH:MM" from the failure, its last read\'s cards kept, an empty lane "Nothing here when last read", no "checking…"', async () => {
  const s = boardSetup();
  const app = await loadSandbox({ ...s, hash: '#/waiting/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const ids = cardsIn(app, 'wait').map((c) => c.dataset.k);
    const n = count(app, 'wait');
    assert.ok(ids.length);
    s.repos.Alpha.fail = { kind: 'network' };
    await app.advance(POLL_MS);
    const failedAt = app.server.calls.filter((c) => c.project === 'Alpha').at(-1).at;
    await app.advance(POLL_MS);
    assert.match(sub(app), /^checked 2 min ago$/, sub(app));
    assert.equal(aboveLanes(app), `Can't read Alpha since ${hhmm(new Date(failedAt), TZ)}: ${REASON_WORDS.network}`, 'since the first failure');
    assert.deepEqual(cardsIn(app, 'wait').map((c) => c.dataset.k), ids, 'no card ever hides');
    assert.equal(count(app, 'wait'), n);
    assert.equal(strip(app), 'Kicked back · none when last read', 'rewritten in G2: the strip in the state\'s words');
    assert.equal(smallLine(app), null, 'no counts under the lanes: the line above says it can\'t be read');
    noChecking(app, 'state 5');
    // The whole board, every project shown, is unchanged by AC89 (a): its own quiet line, as AC80 says.
    await app.go('#/waiting');
    assert.match(app.text(), /Can't read Alpha since \d\d:\d\d/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// (b) The deploy sheet (specs/S-001.md:7853-7862)

function deployRepos() {
  const r = sdRepo({ extra: { 'reviews/77/reviewer.md': 'Verdict: PASS\n\nMade up for the test (NOT a real record).\n' } });
  const head = r.head();
  // J12's built answer with PR #77's merge commit made the fake repository's head (NOT as GitHub sent it), as AC72's test does.
  r.pullsAnswer = answerOf(pullNodes().map((n) => (n.number === 77 ? { ...n, mergeCommit: { oid: head } } : n)));
  // A made-up waiting push run in Setup CS14's title form (NOT a real record).
  r.runs.push({ name: `deploy ${head}`, title: `deploy ${head}`, path: '.github/workflows/desk-deploy.yml', status: 'waiting', conclusion: null, event: 'push', run_number: 12 });
  return { r, head };
}

test('AC89 (b): the deploy sheet says each thing once — AC72\'s row words once, under "Whether it matches a reviewed pull request"; "What it is" and "Why it is here" in their own words, without the run\'s title or number; its last link "The run on GitHub", never "Its status file"', async () => {
  const { r, head } = deployRepos();
  const app = await loadSandbox({ config: { ...CONFIG, projects: [{ ...SD3, deploysNeedOwner: true }] }, repos: { 'Service-Desk': r }, hash: '#/waiting/Service-Desk', now: SD_NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    await app.advance(61_000);
    const card = cardsIn(app, 'wait').find((c) => byClass(c, 'v2-kd')[0].textContent === 'Deploy');
    await app.go(byClass(card, 'v2-t')[0].attrs.href);
    const sheet = byClass(app.view, 'v2-sheet')[0];
    const block = (head) => byClass(sheet, 'v2-blk').find((b) => (b.children[0] || {}).textContent === head);
    assert.equal(DEPLOY_SHEET.what, 'A deploy waiting for your approval on GitHub');
    assert.equal(block('What it is').textContent, 'What it isA deploy waiting for your approval on GitHub ');
    assert.equal(block('Why it is here').textContent, 'Why it is hereIts approver: not recorded (no record the desk reads names who approves a deploy)');
    for (const h of ['What it is', 'Why it is here']) assert.doesNotMatch(block(h).textContent, /run 12|deploy [0-9a-f]{40}/, `${h}: no run title or number again`);
    // AC72's row words, word for word, once.
    const safe = byClass(sheet, 'v2-safe')[0];
    assert.equal(byClass(safe, 'v2-bh')[0].textContent, 'Whether it matches a reviewed pull request');
    assert.equal(byClass(safe, 'v2-deploy-l')[0].textContent, `deploy ${head}: waiting for approval run 12`);
    assert.ok(linksIn(byClass(safe, 'v2-deploy-l')[0]).some((l) => /\/actions\/runs\/\d+$/.test(l.href)), 'linked to the run');
    assert.equal(byClass(safe, 'v2-safe-l')[0].textContent, "Matches PR #77's merge · Reviewer PASS");
    const body = sheet.textContent.replace(byClass(sheet, 'v2-shead')[0].textContent, '');
    assert.equal(body.split(`deploy ${head}: waiting for approval`).length - 1, 1, 'the run\'s row once');
    assert.equal(body.split('run 12').length - 1, 1, 'its number once, with its row');
    // Its last link: the run's page.
    const links = linksIn(sheet).filter((l) => !/v2-abtn/.test(l.el.className));
    const last = links.at(-1);
    assert.equal(last.text, 'The run on GitHub');
    assert.match(last.href, /\/actions\/runs\/\d+$/);
    assert.ok(!sheet.textContent.includes('Its status file'));
  } finally {
    app.restore();
  }
});

/** A made-up project with a card that went missing (its status file waits on stop-6, with no card file; NOT a real record). */
function missingRepo() {
  return repo({ 'status/P-001.toml': 'kind = "project"\nstate = "waiting-owner"\ngate = "stop"\ncard = 6\n',
    'README.md': '# Gamma\n\nNOT a real project: made up for AC89\'s test.\n' });
}

test('AC89 (b): a sheet\'s link says "Its status file" only where it opens one — a card that went missing', async () => {
  const app = await loadSandbox({ config: { ...CONFIG, projects: [v3('Gamma')] }, repos: { Gamma: missingRepo() }, hash: '#/waiting/Gamma', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const card = cardsIn(app, 'wait')[0];
    assert.ok(card, app.text());
    await app.go(byClass(card, 'v2-t')[0].attrs.href);
    const sheet = byClass(app.view, 'v2-sheet')[0];
    const l = linksIn(sheet).find((x) => x.text === 'Its status file');
    assert.ok(l, sheet.textContent);
    assert.match(l.href, /status\/P-001\.toml$/, 'it opens the status file');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// (c) A project page's waits row by short names (specs/S-001.md:7863-7870)

test('AC89 (c): the waits row names each item by its kind and its own id — "#<n>", "question <name>", "<item> <gate>-<n>", "the <Phase> gate", "a governance hold", "a merge of <item>", "a deploy, run <n>" — joined by " · ", the ids in Plex Mono, never a title', async () => {
  // Pure, one of each kind (as the board's cards give them).
  const named = (c) => shortName(c).map((x) => (x.id ? `[${x.text}]` : x.text)).join('');
  assert.equal(named({ kind: 'pr', number: 80 }), '[#80]');
  assert.equal(named({ kind: 'question', name: 'P-001-next-work' }), 'question [P-001-next-work]');
  assert.equal(named({ kind: 'card', flag: { card: { item: 'Q-020', gate: 'stop', n: 1 } } }), '[Q-020 stop-1]');
  assert.equal(named({ kind: 'gate', flag: { card: { item: 'P-002', gate: 'criteria', n: 1 } } }), 'the Build gate');
  assert.equal(named({ kind: 'gate', flag: { card: { item: 'P-002', gate: 'dor', n: 1 } } }), 'the Design gate');
  assert.equal(named({ kind: 'hold', flag: {} }), 'a governance hold');
  assert.equal(named({ kind: 'merge', flag: { merge: { item: 'P-002' } } }), 'a merge of [P-002]');
  assert.equal(named({ kind: 'deploy', flag: { deploy: { runNumber: 12 } } }), 'a deploy, [run 12]');
  assert.equal(named({ kind: 'missing', flag: { key: 'status:P-001', title: 'P-001: waiting on you: card stop-6 (card file not found)' } }), '[P-001 stop-6]');
  // On the page: Alpha's one of each kind (AC52's fixture).
  const t = textSetup();
  const app = await loadSandbox({ ...t, hash: '#/p/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const waits = keyed(app, 'page-waits');
    const small = byClass(waits, 'v2-wn')[0];
    assert.equal(small.textContent, '#80 · question Alpha-pick · the Build gate · Q-020 stop-1 · a governance hold · a merge of P-002');
    assert.deepEqual(byClass(small, 'v2-mono').map((x) => x.textContent), ['#80', 'Alpha-pick', 'Q-020 stop-1', 'P-002'], 'each id in Plex Mono (AC48)');
    for (const title of ['Alpha: a change to merge', "Alpha's question", 'The plan passed review']) assert.ok(!small.textContent.includes(title), `no title: ${title}`);
    assert.equal(waits.attrs.href, '#/waiting/Alpha', 'its tap opens Waiting with only this project shown, where every title is whole');
    // Cut at two lines with the fade: measured as the sheets' three-line texts are; the class only once it is cut.
    assert.ok(!/\bover\b/.test(small.className));
    small.scrollHeight = 60;
    small.clientHeight = 34;
    await app.resize(360);
    await app.flush();
    assert.match(byClass(keyed(app, 'page-waits'), 'v2-wn')[0].className, /\bover\b/, 'faded once cut');
  } finally {
    app.restore();
  }
  // A deploy, and a card that went missing.
  const { r } = deployRepos();
  const d = await loadSandbox({ config: { ...CONFIG, projects: [{ ...SD3, deploysNeedOwner: true }, v3('Gamma')] }, repos: { 'Service-Desk': r, Gamma: missingRepo() }, hash: '#/p/Service-Desk', now: SD_NOW });
  try {
    await d.advance(1000);
    await d.advance(61_000);
    await d.advance(61_000);
    assert.equal(byClass(keyed(d, 'page-waits'), 'v2-wn')[0].textContent, 'a deploy, run 12');
    await d.go('#/p/Gamma');
    assert.equal(byClass(keyed(d, 'page-waits'), 'v2-wn')[0].textContent, 'P-001 stop-6');
  } finally {
    d.restore();
  }
});

const CSS = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (sel) => {
  const m = [...CSS.matchAll(/([^{}]+)\{([^}]*)\}/g)].find((x) => x[1].trim() === sel);
  return m ? m[2] : '';
};

test('AC89 (c): the row\'s cut — two lines of the small role, hidden past them with no scroll, the fade at the cut ending in the page\'s ground (--bg)', () => {
  assert.match(rule('.v2-wn'), /display: block; position: relative; max-height: calc\(2 \* 1\.4em\); overflow: hidden; overflow: clip;/);
  assert.match(rule('.v2-wn.over::after'), /content: ""; position: absolute; right: 0; bottom: 0;.*height: 1\.4em; pointer-events: none;\s*background: linear-gradient\(to right, transparent, var\(--bg\) 85%\);/s);
  assert.match(rule('.v2-small'), /font: var\(--t-small\)/, 'the small role, 12 px at 1.4');
});

// ---------------------------------------------------------------------------
// (h) Nothing unread reads as read (specs/S-001.md:7884-7896)

test('AC89 (h): a project the desk can\'t read never shows "Phases: reading…" — its tile and page say "Phases: not available" beside "Can\'t read since HH:MM"; its Record notes say "not read"; an unread v2.5 project\'s "Your last action" reads "not available"', async () => {
  const pv = phaseView(v3('X'), null, new Map(), { ready: false }, true);
  assert.equal(pv.why, PHASES_NOT_AVAILABLE);
  assert.equal(PHASES_NOT_AVAILABLE, 'Phases: not available');
  assert.equal(phaseView(v3('X'), null, new Map(), { ready: false }).why, PHASES_READING, 'still being read: "Phases: reading…"');
  const t = textSetup();
  t.repos.Alpha.fail = { kind: 'network' };
  t.repos.Delta.fail = { kind: 'network' };
  const app = await loadSandbox({ ...t, hash: '#/', now: NOW });
  try {
    // Before the first read is answered: still "reading…", which is true.
    assert.ok(app.text().includes('Phases: reading…'));
    await app.advance(1000);
    await app.advance(POLL_MS);
    const since = hhmm(new Date(NOW + 1000), TZ);
    const tile = findAll(app.view, (e) => e.dataset && e.dataset.k === 'card:Alpha')[0];
    assert.ok(tile.textContent.includes('Phases: not available'), tile.textContent);
    assert.ok(tile.textContent.includes(`Can't read since ${since}`));
    assert.ok(!app.text().includes('Phases: reading…'), 'never "Phases: reading…"');
    await app.go('#/p/Alpha');
    assert.ok(app.text().includes('Phases: not available'));
    assert.ok(!app.text().includes('Phases: reading…'));
    assert.ok(app.text().includes(`Can't read since ${since}`));
    assert.ok(app.text().includes("Where it's heading: not available until the project's records are read."), 'its sentence unchanged');
    await app.go('#/p/Alpha/notes');
    assert.ok(app.text().includes('dispatch log: not read'), app.text());
    assert.ok(app.text().includes('governance/ROUTING.toml: not read'));
    assert.ok(!/not found/.test(app.text()), 'no "not found" for a file no read reached');
    await app.go('#/p/Delta');
    assert.ok(app.text().includes('Your last action: not available'), app.text());
    assert.ok(!app.text().includes('records rulings in the ledger'), 'not "not recorded"');
  } finally {
    app.restore();
  }
  // Read, the notes keep "not found" for what the read of the tree did not hold, and a v2.5 project its own words.
  const r = textSetup();
  const ok = await loadSandbox({ ...r, hash: '#/p/Alpha/notes', now: NOW });
  try {
    await ok.advance(1000);
    await ok.advance(POLL_MS);
    assert.ok(ok.text().includes('status/outcomes.jsonl: not found'), ok.text());
    await ok.go('#/p/Delta');
    assert.ok(ok.text().includes('Your last action: not recorded (operating model v2.5.1 records rulings in the ledger)'));
  } finally {
    ok.restore();
  }
});

test('AC89 (h): AC87\'s cap and versions rows say "can\'t be read since HH:MM" alike; a project read and then refused keeps its last-read phase in the cap with " · can\'t be read since HH:MM" after its name', async () => {
  const p = (name, extra = {}) => ({ name, model: 'v3', ...extra });
  const cant = { state: 'cant-read', since: '10:02' };
  const ok = { state: 'ok', since: null };
  const tracked = (phase) => ({ tracked: true, done: false, nowRun: { phase } });
  // Never read: "<project>'s phase: can't be read since HH:MM", as before.
  assert.deepEqual(capView([{ project: p('A'), pv: { tracked: false }, error: false, read: cant }]).parts.map((x) => x.text),
    ['In Build or Launch: none', "A's phase: can't be read since 10:02", 'your cap: no record for this in the model yet']);
  // Read, then refused: its last-read phase kept, the words after its name; counted in Build, or named apart when not counted.
  assert.deepEqual(capView([{ project: p('B'), pv: tracked('Build'), error: false, read: cant }, { project: p('C'), pv: tracked('Launch'), error: false, read: ok }]).parts[0].text,
    "In Build or Launch: B · can't be read since 10:02, C");
  const design = capView([{ project: p('D'), pv: tracked('Design'), error: false, read: cant }]);
  assert.deepEqual(design.parts.map((x) => x.text), ['In Build or Launch: none', "D · can't be read since 10:02", 'your cap: no record for this in the model yet']);
  assert.equal(design.entries[0].phase, 'Design', 'its last-read phase');
  assert.equal(design.entries[0].stale, "can't be read since 10:02");
  // Read and fine: no words added.
  assert.equal(capView([{ project: p('E'), pv: tracked('Design'), error: false, read: ok }]).parts.length, 2);
  // The versions row alike: never read, in place of "not available"; read and then refused, after its last-read words.
  const snapOf = (files) => ({ tree: new Map(Object.keys(files).map((f) => [f, { sha: f }])), records: new Map(Object.entries(files)) });
  const v = versionsView([{ project: p('A'), snap: null, read: cant }, { project: p('B'), snap: snapOf({}), read: cant }, { project: p('C'), snap: snapOf({}), read: ok }]);
  assert.deepEqual(v.rows.map((x) => x.words), ["A: can't be read since 10:02", "B: not recorded · can't be read since 10:02", 'C: not recorded']);
  // On Home: Alpha never read, then (a second opening) Alpha read and then refused.
  const t = textSetup();
  t.repos.Alpha.fail = { kind: 'network' };
  let app = await loadSandbox({ ...t, hash: '#/', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const since = hhmm(new Date(NOW + 1000), TZ);
    const pf = keyed(app, 'portfolio').textContent;
    assert.ok(pf.includes(`Alpha's phase: can't be read since ${since}`), pf);
    assert.ok(pf.includes(`Alpha: can't be read since ${since}`), 'the versions row alike');
    assert.ok(!/Alpha: not available/.test(pf));
  } finally {
    app.restore();
  }
  const u = textSetup();
  app = await loadSandbox({ ...u, hash: '#/', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    u.repos.Alpha.fail = { state: 'cant-read', reason: 'token' };
    await app.advance(POLL_MS);
    const at = app.server.calls.filter((c) => c.project === 'Alpha').at(-1).at;
    const since = hhmm(new Date(at), TZ);
    const pf = keyed(app, 'portfolio').textContent;
    assert.ok(pf.includes(`Alpha · can't be read since ${since}`), pf);
    assert.ok(pf.includes(`Alpha: not recorded · can't be read since ${since}`), 'the versions row alike');
    await app.go('#/pf/cap');
    const row = findAll(app.view, (e) => e.dataset && e.dataset.k === 'pfs:Alpha')[0];
    assert.equal(byClass(row, 'v2-small')[0].textContent, `Now: Design · can't be read since ${since} · not counted`, 'its last-read phase, kept');
  } finally {
    app.restore();
  }
});

test('AC89 (h): the board\'s held-question fold shows its record text in AC81\'s roles, a heading --t-row and the rest --t-body, its lists\' marks kept, as every sheet\'s record does', async () => {
  assert.match(rule('.v2-qfold .sb-record'), /font: var\(--t-body\); overflow-wrap: anywhere;/);
  assert.match(rule('.v2-qfold .sb-record :is(h1, h2, h3, h4, h5, h6)'), /font: var\(--t-row\);/);
  assert.match(rule('.v2-qfold .sb-record :is(p, li, td, th, blockquote)'), /font: var\(--t-body\);/);
  assert.match(rule('.v2-qfold .sb-record ol'), /list-style: decimal;/);
  assert.match(rule('.v2-qfold .sb-record ul'), /list-style: disc;/);
  for (const s of ['.v2-sheet .sb-record', '.v2-sheet .sb-record :is(h1, h2, h3, h4, h5, h6)', '.v2-sheet .sb-record :is(p, li, td, th, blockquote)']) {
    assert.equal(rule(s.replace('.v2-sheet', '.v2-qfold')).trim(), rule(s).trim(), `${s}: the fold's as the sheet's`);
  }
  // The fold itself: AC77's real asked question, held, its record in the fold's article.
  const SID = 'session_012RJPVKAoLga2RkqLYRDcBY';
  const SP = `sessions/chief-of-staff/${SID}.jsonl`;
  const real = (f) => readFileSync(join(NOTIFY_FIX, 'ac77-real', f), 'utf8');
  const sd = repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), 'questions/P-001-next-work.md': real('asked/questions/P-001-next-work.md'), [SP]: real(SP) }, [],
    [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  sd.history = { 'questions/P-001-next-work.md': [{ commit: { committer: { date: '2026-10-18T11:26:23Z' } } }] };
  const om = repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]);
  const app = await loadSandbox({ config: CONFIG, repos: { 'Service-Desk': sd, 'Personal-Org-Operating-Model': om }, hash: '#/waiting/Service-Desk', now: Date.parse('2026-10-18T11:26:23Z') + 54 * 60e3 });
  try {
    await app.advance(1000);
    await app.tap(keyed(app, 'ql:asking'));
    const fold = keyed(app, 'fold:asking');
    assert.ok(/\bv2-qfold\b/.test(fold.className));
    const art = findAll(fold, (e) => e.tag === 'article')[0];
    assert.ok(/\bsb-record\b/.test(art.className), 'its record, under the fold\'s rules');
  } finally {
    app.restore();
  }
});

test('AC89 (h): if the desk\'s own code fails to load, the page says "The desk couldn\'t load. Reload to try again." in place of "Checking…", and never reads as quiet', async () => {
  assert.equal(LOAD_FAILED_WORDS, "The desk couldn't load. Reload to try again.");
  const shown = [];
  const show = (w) => shown.push(w);
  // The module fails to load (a network drop, a stale cache), the loader throws, or the desk throws while starting.
  assert.equal(await startDesk(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module')), show), null);
  assert.equal(await startDesk(() => { throw new Error('no'); }, show), null);
  assert.equal(await startDesk(() => Promise.resolve({ startSandbox: () => { throw new Error('bad'); } }), show), null);
  assert.deepEqual(shown, [LOAD_FAILED_WORDS, LOAD_FAILED_WORDS, LOAD_FAILED_WORDS]);
  // Loaded: the desk starts, and nothing is said.
  shown.length = 0;
  const desk = {};
  assert.equal(await startDesk(() => Promise.resolve({ startSandbox: () => desk }), show), desk);
  assert.deepEqual(shown, []);
  // The page's entry loads the desk this way, and puts the words in the state line (never "Checking…" or "Quiet") and the view.
  const APP = readFileSync(join(SRC, 'public', 'app.js'), 'utf8');
  assert.match(APP, /startDesk\(\(\) => import\('\.\/sandbox\.js'\), \(words\) => \{/);
  const fn = APP.slice(APP.indexOf("startDesk(() => import('./sandbox.js')"));
  assert.match(fn, /stateEl\.textContent = words;/);
  // Rewritten at stage 6b of "After MD3" (AC89 (m), specs/S-001.md:7963-7964, and AC89's "Every screen keeps AC81's tokens
  // and AC88's dark theme", :7810-7811): said once, in the view, on mockup v2's ground as the render-error screen is drawn.
  assert.match(fn, /view\.replaceChildren\(h\('section', \{ class: 'sb-screen' \}, h\('p', \{ class: 'sb-stale', role: 'alert' \}, words\)\)\);/);
  assert.match(fn, /foot\.hidden = true;/, 'the footer\'s "reading…" not left showing');
  assert.doesNotMatch(APP, /import\('\.\/sandbox\.js'\)\.then/, 'no load left unguarded');
  // The page loaded through its entry still starts the desk when its code loads: page-app.test.mjs's cases, kept.
});

test('AC89 (h) with AC80: the v2.5 project shown alone, never read, is AC89 (a)\'s state 2 too', async () => {
  const s = { config: { ...CONFIG, projects: [v25('Delta'), v3('Beta')] }, repos: { Delta: repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }), Beta: repo({ 'README.md': '# Beta\n\nNOT a real project.\n' }) } };
  s.repos.Delta.fail = { kind: 'network' };
  const app = await loadSandbox({ ...s, hash: '#/waiting/Delta', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.equal(sub(app), 'Not read in this opening');
    assert.match(aboveLanes(app), /^Can't read Delta since \d\d:\d\d: network error/);
    assert.equal(empty(app, 'wait'), "Can't read");
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// (i) Sheets, focus and reloads (specs/S-001.md:7896-7903; the amendment's (b) items 4, 17, 21 and 22, :2191-2220)

/** A device's storage, kept across loads (memory only, made up). */
function deviceStore(init = {}) {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } };
}
async function reloadPage(app, setup, store, extra = {}) {
  const hash = app.loc.hash;
  const now = app.now;
  await app.visibility('hidden');
  app.restore();
  const b = await loadSandbox({ ...setup, hash, now, store, ...extra });
  await b.advance(1000);
  await b.advance(POLL_MS);
  return b;
}
const twoOf = () => ({ config: { ...CONFIG, projects: [v3('Alpha'), v3('Beta')] }, repos: { Alpha: fullRepo('Alpha'), Beta: fullRepo('Beta') } });
const Q = 'Alpha|question|questions/Alpha-pick.md';

test('AC89 (i): the "<n> more since <time>" sheet, open when the page reloads, comes back with the lines it held; "last looked" moves past them only once that sheet is closed', async () => {
  const setup = twoOf();
  const LOOKED = NOW - 10 * 3600e3;
  const store = deviceStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: LOOKED }) });
  let app = await loadSandbox({ ...setup, hash: '#/', now: NOW, store });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const more = keyed(app, 'since-more');
    assert.ok(more, 'the "<n> more" line');
    await app.tap(more);
    await app.go(more.attrs.href);
    const lines = () => byClass(keyed(app, 'since-sheet'), 'v2-since')[0].children.map((c) => c.textContent);
    const held = lines();
    assert.ok(held.length > 0);
    await app.advance(20_000); // a window of more than 10 s, which would move "last looked" (AC40)
    app = await reloadPage(app, setup, store);
    assert.equal(JSON.parse(store.m.get('desk-seen-v1')).lastLooked, LOOKED, 'not moved while the sheet is open');
    assert.equal(app.loc.hash, '#/since');
    assert.deepEqual(lines(), held, 'the same lines');
    // Closed: the next window that ends moves "last looked" past them.
    await app.key('Escape');
    await app.advance(20_000);
    await app.visibility('hidden');
    assert.ok(JSON.parse(store.m.get('desk-seen-v1')).lastLooked > NOW, 'moved past them once the sheet is closed');
  } finally {
    app.restore();
  }
});

test('AC89 (i): a sheet a reload brings back puts focus on its close; Escape, the close or a tap outside then returns focus to the card it belongs to', async () => {
  for (const how of ['escape', 'control', 'outside']) {
    const setup = twoOf();
    const store = deviceStore();
    let app = await loadSandbox({ ...setup, hash: `#/waiting/Alpha/card/${encodeURIComponent(Q)}`, now: NOW, store });
    try {
      await app.advance(1000);
      await app.advance(POLL_MS);
      app = await reloadPage(app, setup, store);
      assert.equal(document.activeElement, keyed(app, 'sheet-close'), `${how}: focus on its close`);
      if (how === 'escape') await app.key('Escape');
      else if (how === 'control') await app.tap(keyed(app, 'sheet-close'));
      else {
        await app.tap(keyed(app, 'v2-scrim'));
        await app.go(keyed(app, 'v2-scrim') ? keyed(app, 'v2-scrim').attrs.href : app.loc.hash);
      }
      await app.flush();
      assert.equal(app.loc.hash, '#/waiting/Alpha', `${how}: closed, on Waiting`);
      assert.equal(document.activeElement, keyed(app, `cardlink:${Q}`), `${how}: focus on its card`);
    } finally {
      app.restore();
    }
  }
});

// Stage 2's design review, round 1, B1: a sheet whose opener sits inside a fold a reload keeps closed ("About the phases",
// in the page's "More detail") gives the focus to that fold's own control, never to the page's body.
test('AC89 (i): "About the phases" (#/p/<name>/info) open when the page reloads — focus on its close; Escape, the close or a tap outside then returns focus to the closed "More detail" fold that holds its link; with the fold open, to the link itself', async () => {
  for (const [label, mk, name] of [['Alpha', twoOf, 'Alpha'], ['Service-Desk (sdq)', () => ({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } }), 'Service-Desk']]) {
    for (const how of ['escape', 'control', 'outside']) {
      const setup = mk();
      const store = deviceStore();
      let app = await loadSandbox({ ...setup, hash: `#/p/${name}/info`, now: NOW, store });
      try {
        await app.advance(1000);
        await app.advance(POLL_MS);
        app = await reloadPage(app, setup, store);
        assert.equal(document.activeElement, keyed(app, 'sheet-close'), `${label} · ${how}: focus on its close`);
        if (how === 'escape') await app.key('Escape');
        else if (how === 'control') await app.tap(keyed(app, 'sheet-close'));
        else {
          const scrim = keyed(app, 'scrim') || keyed(app, 'v2-scrim');
          await app.tap(scrim);
          await app.go(scrim.attrs.href);
        }
        await app.flush();
        assert.equal(app.loc.hash, `#/p/${name}`, `${label} · ${how}: closed, on the page`);
        const fold = keyed(app, 'more-detail-fold');
        assert.ok(fold && !fold.hasAttribute('open'), `${label} · ${how}: the fold is closed after the reload`);
        assert.equal(document.activeElement, keyed(app, 'more-detail'), `${label} · ${how}: focus on the fold's own control, not the body`);
        assert.notEqual(document.activeElement, document.body);
      } finally {
        app.restore();
      }
    }
  }
  // Without a reload the fold is open, and the link itself takes the focus back, as before.
  const setup = twoOf();
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const fold = keyed(app, 'more-detail-fold');
    fold.setAttribute('open', '');
    const link = keyed(app, 'info');
    await app.tap(link);
    await app.go(link.attrs.href);
    await app.key('Escape');
    await app.flush();
    assert.equal(app.loc.hash, '#/p/Alpha');
    assert.equal(document.activeElement, keyed(app, 'info'), 'the open fold: its link');
  } finally {
    app.restore();
  }
});

test('AC89 (i): Tab and Shift-Tab stay inside an open sheet — from its last control Tab goes to its first, from its first Shift-Tab to its last, and from outside it Tab goes in', async () => {
  const app = await loadSandbox({ ...twoOf(), hash: `#/waiting/Alpha/card/${encodeURIComponent(Q)}`, now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const sheet = byClass(app.view, 'v2-sheet')[0];
    const focusable = findAll(sheet, (e) => (e.tag === 'a' && e.attrs.href != null) || ['button', 'textarea'].includes(e.tag) || (e.tag === 'summary'));
    assert.ok(focusable.length > 2);
    const first = focusable[0];
    const last = focusable.at(-1);
    assert.equal(first, keyed(app, 'sheet-close'), 'its close is its first control');
    last.focus();
    let r = await app.docEvent('keydown', { key: 'Tab', target: last });
    assert.ok(r.cancelled);
    assert.equal(document.activeElement, first, 'Tab from its last: its first');
    r = await app.docEvent('keydown', { key: 'Tab', shiftKey: true, target: first });
    assert.ok(r.cancelled);
    assert.equal(document.activeElement, last, 'Shift-Tab from its first: its last');
    // In the middle, the browser's own order: nothing is held back.
    const mid = focusable[1];
    mid.focus();
    r = await app.docEvent('keydown', { key: 'Tab', target: mid });
    assert.ok(!r.cancelled);
    // Focus outside the sheet (on the board under it): Tab goes into the sheet.
    keyed(app, `cardlink:${Q}`).focus();
    await app.docEvent('keydown', { key: 'Tab', target: document.activeElement });
    assert.equal(document.activeElement, first);
    // No sheet open: Tab is the browser's.
    await app.key('Escape');
    keyed(app, `cardlink:${Q}`).focus();
    r = await app.docEvent('keydown', { key: 'Tab', target: document.activeElement });
    assert.ok(!r.cancelled);
  } finally {
    app.restore();
  }
});

test('AC89 (i): a gate\'s sheet opened from Plan sits over Plan and closes back to Plan, with focus on its row — by Escape, its close and a tap outside (AC56\'s back rule)', async () => {
  const GATE = 'Service-Desk|gate|queue/P-003-launch-1.md';
  const { waSetup, WORKED, j77Files, memStore } = await import('./wa-fixtures.mjs');
  const log = `${j77Files()['dispatch-log/2026-10.jsonl'].trimEnd()}\n${JSON.stringify({ item: 'P-003', action: 'card', card: 1, gate: 'launch', role: 'user-rep', route: 'launch-gate', stage: 6, gate_n: 1, time: '2026-10-18T15:00:00Z', trigger: 'x' })}\n`;
  for (const how of ['escape', 'control', 'outside']) {
    // AC85's made-up Launch-gate card (NOT a real record), on Service-Desk's J11 records at 77bfeae, as AC86's test uses it.
    const setup = waSetup({ extra: { 'intake/estimates.jsonl': WORKED(), 'queue/P-003-launch-1.md': fixture('ac85/queue/P-003-launch-1.md'), 'dispatch-log/2026-10.jsonl': log } });
    const app = await loadSandbox({ ...setup, hash: '#/', now: Date.parse('2026-10-18T18:00:00Z'), store: memStore() });
    try {
      await app.advance(1000);
      await app.advance(61_000);
      await app.go('#/work');
      const row = keyed(app, `wa-gate:${GATE}`);
      assert.ok(row, 'Plan\'s gate row');
      assert.equal(row.attrs.href, `#/work/card/${encodeURIComponent(GATE)}`);
      await app.tap(row);
      await app.go(row.attrs.href);
      assert.ok(byClass(app.view, 'v2-plan').length === 1, `${how}: Plan stays under the sheet`);
      const sheet = byClass(app.view, 'v2-sheet')[0];
      assert.ok(sheet && /Launch gate/.test(sheet.textContent), `${how}: the gate's sheet`);
      assert.ok(findAll(sheet, (e) => e.tag === 'a' && /^Proceed/.test(e.textContent || '')).length, 'its buttons, as on Waiting');
      if (how === 'escape') await app.key('Escape');
      else if (how === 'control') await app.tap(keyed(app, 'sheet-close'));
      else {
        const scrim = keyed(app, 'v2-scrim');
        assert.equal(scrim.attrs.href, '#/work');
        await app.tap(scrim);
        await app.go(scrim.attrs.href);
      }
      await app.flush();
      assert.equal(app.loc.hash, '#/work', `${how}: back to Plan`);
      assert.equal(byClass(app.view, 'v2-sheet').length, 0);
      assert.equal(document.activeElement, keyed(app, `wa-gate:${GATE}`), `${how}: focus on its row`);
    } finally {
      app.restore();
    }
  }
});
