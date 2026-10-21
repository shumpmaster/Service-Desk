// join-test: S-001/J24 — what changed since the owner last looked → Home (page side; added 2026-10-20,
// AC82). REST answers for a pull request's commits recorded once from Service-Desk's real pull requests
// #148 and #177 (fixtures/j24/, the command in fixtures/README.md), and made-up records (NOT real records,
// as fixtures/README.md says) for each kind, each awkward case, the reader's calls and the function's field.
// join-test: S-001/J6 (the blob call's `commits` field: its form, its budget, its pages).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { handle } from '../../src/lib/api.js';
import { _resetKeyCache } from '../../src/lib/access.js';
import { createDesk, POLL_MS, FILES_RETRY_MS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { makeKey, signJwt, goodClaims, certsRoute, request, fakeFetch, ENV, fakeClock, CONFIG, FIX, NOW as JWT_NOW } from './helpers.mjs';
import { repo, pr, fakeServer } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { v3, v25 } from './sandbox-fixtures.mjs';
import { parseCommitPages, projectEvents, sinceView, commitWho, rosterOf, SINCE_LINES, COMMIT_LINES } from '../../src/lib/home.js';
import { COMMITS_COST, MAX_COMMITS_PRS } from '../../src/lib/github.js';

const TZ = CONFIG.ownerTimeZone;
const real = (n) => readFileSync(join(FIX, 'j24', `commits-${n}-p1.json`), 'utf8');
const SD = { name: 'Service-Desk', repo: 'shumpmaster/Service-Desk', defaultBranch: 'main', model: 'v3', webCommitsToDefault: true, contentPrefill: true, contentParam: 'value' };
const ROSTER = { ok: true, members: [{ id: 'builder', class: 'builder' }, { id: 'chief-of-staff', class: 'builder' }, { id: 'reviewer', class: 'reviewer' }, { id: 'design-reviewer', class: 'reviewer' }] };
const iso = (ms) => new Date(ms).toISOString();
const T0 = Date.parse('2026-10-20T15:00:00Z'); // after #148's last commit (14:37:41Z on 20 Oct)

/** One project's events, the page's way: a model and snapshot made up around the given parts. */
function events({ project = SD, pulls = [], questions = [], log = [], kept = null, tree = {}, records = {}, history = {}, commits = new Map(), doc = null, nowMs = T0, titles = null } = {}) {
  const snap = { tree: new Map(Object.keys(tree).map((p) => [p, { sha: p }])), records: new Map(Object.entries(records)), history: new Map(Object.entries(history)),
    pulls: kept ? { list: kept } : null };
  const j = { ready: true, logRows: log, surfaces: ROSTER, projectDoc: doc };
  return projectEvents({ project, model: { pulls, questions, allEntries: [] }, snap, j, commits, ownerLogin: 'shumpmaster', nowMs, tz: TZ, titles });
}
const prOf = (n, extra = {}) => ({ number: n, title: `Made-up #${n}`, url: `https://github.com/${SD.repo}/pull/${n}`, createdAt: iso(T0 - 50 * 3600e3), updatedAt: iso(T0 - 60e3), headSha: `${n}`.padEnd(40, 'a'), ...extra });
const read = (pages, headSha = 'h'.repeat(40)) => ({ headSha, state: 'read', ...parseCommitPages(pages) });
const made = (sha, date, { msg = 'A made-up change', name = 'Someone', email = 'someone@example.invalid', login = null, parents = 1 } = {}) =>
  ({ sha: sha.padEnd(40, '0'), parents: Array.from({ length: parents }, (_, i) => ({ sha: String(i).repeat(40) })), commit: { message: `${msg}\n\nIts body.`, author: { name, email }, committer: { date } }, author: login ? { login } : null });

// ---------------------------------------------------------------------------
// The commits read, real on real

test('J24 (real, #148 as recorded): each commit\'s first line as written, "You" for the owner\'s login, the role in the roster\'s words for <id>@agents.invalid, merge commits skipped; newest first; three lines then "<n> more on #148"', () => {
  const p = parseCommitPages([real(148)]);
  assert.equal(p.ok, true);
  assert.equal(p.commits.length, 33, 'GitHub\'s 33, as recorded');
  assert.equal(p.commits.filter((c) => c.parents >= 2).length, 10, 'ten of them merge commits');
  assert.equal(p.capped, false);
  const ev = events({ pulls: [prOf(148, { title: 'Set up the Design reviewer', createdAt: '2026-10-19T20:55:14Z' })], commits: new Map([[148, read([real(148)])]]) });
  const lines = ev.filter((e) => e.pr === 148);
  assert.equal(lines.length, 23, 'every commit but the ten merges');
  const v = sinceView({ events: ev, since: Date.parse('2026-10-19T20:00:00Z'), off: false, nowMs: T0, tz: TZ });
  assert.deepEqual(v.lines.map((e) => e.words), [
    'You: Create owner.md',
    "Orchestrator: Record the Reviewer's confirmation verdict on #148: PASS, verbatim",
    "Orchestrator: Record the Reviewer's second confirmation check on the Design reviewer's setup",
    '20 more on #148',
  ], 'the newest three, then the rest behind one line');
  assert.deepEqual(v.lines[0].codes, ['#148', 'd1d964b'], '"<project> · <its codes>": the pull request and the commit');
  assert.equal(v.lines[0].target.href, `https://github.com/${SD.repo}/pull/148`, 'a tap opens the pull request on GitHub');
  // The Chief of Staff's own commits are listed as anyone's, in the roster's words (frame H1's #148 lines).
  const cos = lines.filter((e) => /^Chief of Staff: /.test(e.words)).map((e) => e.words);
  assert.ok(cos.includes('Chief of Staff: Design rulebook, round 2: the owner\'s newest rulings, later rulings replace earlier ones, fixtures that exist'), cos.join('\n'));
  assert.equal(lines.filter((e) => /^Merge /.test(e.words.replace(/^[^:]+: /, ''))).length, 0, 'no merge commit');
  assert.ok(v.rest.some((e) => e.words === 'Opened: Set up the Design reviewer'), 'its "Opened" line, older, in the rest');
});

test('J24 (real, #177 as recorded): a Builder\'s commit in the roster\'s words; the owner\'s commit by its login', () => {
  const ev = events({ pulls: [prOf(177)], commits: new Map([[177, read([real(177)])]]), nowMs: Date.parse('2026-10-21T20:00:00Z') });
  const words = ev.filter((e) => e.pr === 177).map((e) => e.words);
  assert.deepEqual(words, [
    'Builder: Leave out of the sender\'s set the pull requests rule 0 finds with the agents (S-001 stage 1b)',
    'Builder: Test the sender\'s rule 0 read limits so each check is reached (S-001 stage 1b, review round 1)',
    'Orchestrator: Record stage 1b\'s reviews: the Reviewer\'s two rounds and the Design reviewer\'s, verbatim',
    'Orchestrator: Record the Reviewer\'s and the Design reviewer\'s PASS on stage 1b (#177)',
    'You: Create owner.md',
  ], 'in GitHub\'s order as gathered; the two merges skipped');
});

// ---------------------------------------------------------------------------
// Each kind (made up, NOT real records)

test('J24: each kind with its time and words — a question raised, answers recorded (gathered in one minute), a card raised and answered, a pull request opened and merged (not the job\'s, not an item branch\'s), an agent run\'s outcome, a milestone reached (its date, no time); newest first; four lines, then "<n> more since <time> ›"', () => {
  const at = (min) => iso(T0 - min * 60e3);
  const ev = events({
    questions: [{ path: 'questions/P-001-pick.md', name: 'P-001-pick', title: 'Pick a colour?', raisedAt: new Date(T0 - 30 * 60e3) }],
    tree: { 'decisions/questions/P-001-a.md': 1, 'decisions/questions/P-001-b.md': 1, 'questions/P-001-b.md': 1, 'queue/P-002-dor-1.md': 1, 'decisions/P-002/dor-1.md': 1 },
    records: { 'decisions/questions/P-001-a.md': { line1: 'Ruling: A — yes', ruling: 'A — yes', line2Proxy: false },
      'decisions/questions/P-001-b.md': { line1: 'Ruling: B', ruling: 'B', line2Proxy: false },
      'questions/P-001-b.md': { title: 'Keep the bar?' }, 'queue/P-002-dor-1.md': { title: 'Ready to design?' } },
    history: { 'decisions/questions/P-001-a.md': { oldest: at(20) }, 'decisions/questions/P-001-b.md': { oldest: iso(T0 - 20 * 60e3 + 30e3) } },
    titles: new Map([['Service-Desk|P-001-a', 'Is the board right?']]),
    log: [
      { item: 'P-002', action: 'card', gate: 'dor', card: 1, time: at(40), role: 'critic', route: 'x', stage: 3, trigger: 'x' },
      { record: 'decisions/P-002/dor-1.md', trigger: 'decision', item: 'P-002', gate: 'dor', card: 1, word: 'approve', time: at(10) },
      { trigger: 'outcome', item: 'P-002', role: 'reviewer', session: 's1', result: 'ok', verdict: 'PASS', time: at(5) },
    ],
    pulls: [prOf(90, { title: 'A made-up change', createdAt: at(50) })],
    kept: [{ number: 80, title: 'Merged by the owner', mergedAt: at(60), head: 'cos/x' }, { number: 81, title: 'The job\'s', mergedAt: at(61), head: 'cos/y', job: true },
      { number: 82, title: 'An item branch', mergedAt: at(62), head: 'item/P-002' }],
    doc: { milestones: [{ id: 'M1', name: 'The first thing works', reached: '2026-10-20' }, { id: 'M0', name: 'Older', reached: '2026-10-01' }] },
  });
  // "Last looked" the evening before (22:00 in ownerTimeZone): a milestone reached today, which sorts at its date's start, is newer (C).
  const v = sinceView({ events: ev, since: T0 - 12 * 3600e3, off: false, nowMs: T0, tz: TZ });
  const all = [...v.lines, ...v.rest];
  assert.deepEqual(all.map((e) => e.words), [
    'P-002: reviewer finished — ok, verdict PASS',
    'Card answered: Ready to design? · approve',
    'Your answers recorded: Is the board right? · A; Keep the bar? · B',
    'New question: Pick a colour?',
    'New card: Ready to design?',
    'Opened: A made-up change',
    'Merged: Merged by the owner',
    'Reached: The first thing works',
  ], 'newest first; the job\'s merge and the item branch\'s not listed; M0 reached before "last looked"');
  assert.equal(v.lines.length, SINCE_LINES);
  assert.equal(v.more, '4 more since yesterday, 22:00 ›', 'the rest behind one line, "last looked" at 22:00 yesterday in ownerTimeZone');
  assert.deepEqual(all.map((e) => e.icon), ['eye', 'done', 'done', 'question', 'card', 'pr', 'merge', 'flag'], 'an eye for a reviewer\'s, a ✓ for the owner\'s own answer');
  const reached = all.find((e) => e.id.endsWith('|reached|M1'));
  assert.equal(reached.dateOnly, true, 'its date and no time');
  assert.equal(reached.at, Date.parse('2026-10-20T05:00:00Z'), 'at that date\'s start in ownerTimeZone');
  assert.deepEqual(reached.target, { hash: '#/p/Service-Desk/timeline/ms/M1' }, 'a milestone opens on its project\'s Timeline');
  assert.deepEqual(all.find((e) => /^New question/.test(e.words)).target, { hash: `#/waiting/card/${encodeURIComponent('Service-Desk|question|questions/P-001-pick.md')}` }, 'a question opens on Waiting');
  assert.equal(all.find((e) => /^Your answers/.test(e.words)).target.hash, `#/waiting/card/${encodeURIComponent('Service-Desk|question|questions/P-001-b.md')}${encodeURIComponent('#answer')}`, 'answers within 24 hours open their Done row');
  assert.deepEqual(all.find((e) => /^Your answers/.test(e.words)).codes, ['P-001-a', 'P-001-b']);
});

test('J24: no "last looked" on the device (or storage failing): no list, AC40\'s words; none newer: "Nothing new since <time>"; older than 7 days: the last 7 days', () => {
  const ev = events({ pulls: [prOf(5, { createdAt: iso(T0 - 9 * 86400e3) }), prOf(6, { createdAt: iso(T0 - 3 * 86400e3) })] });
  const off = sinceView({ events: ev, since: null, off: true, nowMs: T0, tz: TZ });
  assert.deepEqual([off.off, off.heading, off.lines.length], [true, 'Since you last looked', 0]);
  const none = sinceView({ events: ev, since: T0 - 3600e3, off: false, nowMs: T0, tz: TZ });
  assert.equal(none.none, 'Nothing new since 09:00');
  assert.equal(none.heading, 'Since you last looked · 09:00');
  assert.equal(sinceView({ events: ev, since: T0 - 30 * 3600e3, off: false, nowMs: T0, tz: TZ }).heading, 'Since you last looked · yesterday, 04:00');
  assert.equal(sinceView({ events: ev, since: T0 - 4 * 86400e3, off: false, nowMs: T0, tz: TZ }).heading, 'Since you last looked · 16 Oct, 10:00');
  const week = sinceView({ events: ev, since: T0 - 20 * 86400e3, off: false, nowMs: T0, tz: TZ });
  assert.equal(week.heading, 'Since you last looked · in the last 7 days');
  assert.deepEqual(week.lines.map((e) => e.words), ['Opened: Made-up #6'], 'nothing older than 7 days');
});

// ---------------------------------------------------------------------------
// The awkward cases (made up)

test('J24\'s awkward cases: a force-push\'s new dates shown as new; a commit more than 10 minutes ahead shown at now; no GitHub account (its name); a bot (its login); two at the same minute in the record\'s order, newest first', () => {
  const list = [
    made('a1', iso(T0 - 9 * 60e3), { msg: 'Rewritten by a force-push', name: 'Agent' }),
    made('a2', iso(T0 - 9 * 60e3), { msg: 'The next one, the same minute', name: 'Agent' }),
    made('a3', iso(T0 + 3600e3), { msg: 'Dated ahead of the page', name: 'Agent' }),
    made('a4', iso(T0 - 2 * 60e3), { msg: 'By a bot', login: 'dependabot[bot]', name: 'dependabot[bot]' }),
  ];
  const ev = events({ pulls: [prOf(7)], commits: new Map([[7, read([JSON.stringify(list)])]]) }).filter((e) => e.pr === 7);
  const v = sinceView({ events: ev, since: T0 - 10 * 60e3, off: false, nowMs: T0, tz: TZ });
  assert.deepEqual(v.lines.map((e) => e.words), ['Agent: Dated ahead of the page', 'dependabot[bot]: By a bot', 'Agent: The next one, the same minute', '1 more on #7']);
  assert.equal(v.lines[0].at, T0, 'ahead of the page: at the page\'s now');
  assert.deepEqual(commitWho({ name: 'A person', email: 'p@example.invalid', login: null }, 'shumpmaster', rosterOf(null)).words, 'A person', 'no GitHub account: its name');
  assert.equal(commitWho({ name: 'x', email: 'stranger@agents.invalid', login: null }, 'shumpmaster', rosterOf({ surfaces: ROSTER })).words, 'x', 'not a roster id: its author\'s name');
  assert.equal(commitWho({ name: 'x', email: 'reviewer@agents.invalid', login: null }, 'shumpmaster', rosterOf({ surfaces: ROSTER })).icon, 'eye', 'a reviewer\'s work: an eye');
});

test('J24\'s awkward cases: a third page of 50 says "more commits than the desk reads"; a fork\'s pull request only its "Opened" line; a closed one\'s commits not listed, its merge listed if merged; a v2.5 project\'s merges not listed', () => {
  const page = (n, from) => JSON.stringify(Array.from({ length: n }, (_, i) => made(`c${from + i}`, iso(T0 - (300 - from - i) * 60e3))));
  const capped = read([page(100, 0), page(100, 100), page(50, 200)]);
  assert.equal(capped.capped, true, 'a pull request of exactly 250 says so too');
  assert.equal(read([page(100, 0), page(100, 100), page(49, 200)]).capped, false);
  const ev = events({ pulls: [prOf(8), prOf(9, { title: 'From a fork' })], commits: new Map([[8, capped]]),
    kept: [{ number: 7, title: 'Closed and merged since', mergedAt: iso(T0 - 60e3), head: 'cos/z' }] });
  assert.ok(ev.some((e) => e.words === '#8: more commits than the desk reads'));
  assert.deepEqual(ev.filter((e) => /#9\b|From a fork/.test(e.words)).map((e) => e.words), ['Opened: From a fork'], 'J20 reads nothing for a fork: only its "Opened" line');
  assert.ok(ev.some((e) => e.words === 'Merged: Closed and merged since') && !ev.some((e) => e.pr === 7));
  const old = events({ project: { ...SD, name: 'POOM', model: 'v2.5' }, pulls: [prOf(3)], kept: [{ number: 2, title: 'A v2.5 merge', mergedAt: iso(T0 - 60e3), head: 'x' }] });
  assert.deepEqual(old.map((e) => e.words), ['Opened: Made-up #3'], 'J12 reads v3 projects only: a known limit, its opened pull requests still listed');
});

test('J24: the Chief of Staff\'s sessions are not a kind (P-001-cos-sessions-on-desk.md, A): no line for a session\'s start or end, while its commit on an open pull request is listed', () => {
  const cos = made('cs1', iso(T0 - 5 * 60e3), { msg: 'Design rulebook, round 2', name: 'chief-of-staff', email: 'chief-of-staff@agents.invalid' });
  const ev = events({ pulls: [prOf(148)], commits: new Map([[148, read([JSON.stringify([cos])])]]),
    tree: { 'sessions/chief-of-staff/s-1.jsonl': 1 },
    records: { 'sessions/chief-of-staff/s-1.jsonl': { ok: true, lines: [{ event: 'start', at: T0 - 6 * 60e3 }, { event: 'end', at: T0 - 4 * 60e3 }] } },
    log: [{ item: 'cos', trigger: 'session', event: 'start', time: iso(T0 - 6 * 60e3) }] });
  assert.deepEqual(ev.filter((e) => e.at > T0 - 3600e3).map((e) => e.words), ['Chief of Staff: Design rulebook, round 2']);
});

test('J24: a failed commits read: one line "Commits on #<n> couldn\'t be read", the pull request\'s commits left out', () => {
  const ev = events({ pulls: [prOf(11)], commits: new Map([[11, { headSha: 'x', state: 'failed', commits: [], capped: false }]]) });
  assert.deepEqual(ev.filter((e) => e.codes.includes('#11') && !/^Opened/.test(e.words)).map((e) => e.words), ["Commits on #11 couldn't be read"]);
  assert.equal(parseCommitPages(['{"message":"Not Found"}']).ok, false, 'a page that is not a list is a failed read');
  assert.equal(parseCommitPages(null).ok, false);
});

// ---------------------------------------------------------------------------
// The reader: the read rides J20's calls, and never adds one of its own

const NUMS = [21, 22, 23, 24, 25];
function readerSetup({ prs = NUMS, commits = 3, fail = false } = {}) {
  const config = { ...CONFIG, projects: [v3('Alpha')] };
  const r = repo({ 'README.md': '# Alpha\n\nA made-up project.\n' });
  const setHeads = (gen = 0) => {
    r.pulls = prs.map((n) => ({ ...pr(n, `Made-up #${n}`, { head: `cos/x-${n}`, headRepo: 'shumpmaster/Alpha', sha: `${n}${gen}`.padEnd(40, 'c'), createdAt: iso(T0 - 3600e3) }),
      html_url: `https://github.com/shumpmaster/Alpha/pull/${n}`, updated_at: iso(T0 - 60e3) }));
  };
  setHeads();
  r.prFiles = Object.fromEntries(prs.map((n) => [n, [{ filename: `src/f${n}.js`, status: 'modified' }]]));
  // 3 pages (250 commits, the most GitHub lists) or one page of 5 each.
  r.prCommits = Object.fromEntries(prs.map((n) => [n, Array.from({ length: commits === 3 ? 250 : 5 }, (_, i) => made(`${n}x${i}`, iso(T0 - (300 - i) * 60e3)))]));
  if (fail) r.commitsFail = prs;
  return { config, repos: { Alpha: r }, setHeads };
}
async function reader(setup, { lastLooked = T0 - 86400e3, start = T0 } = {}) {
  const clock = fakeClock(start);
  const server = fakeServer(setup.repos, setup.config, clock);
  const calls = [];
  const call = (p, b) => { calls.push({ p, b: JSON.parse(JSON.stringify(b)), at: clock.now() }); return server.call(p, b); };
  const desk = createDesk({ config: setup.config, call, clock, store: createStore(null), isVisible: () => true, onChange() {}, j11: true, lastLooked: () => lastLooked });
  desk.start();
  await clock.runUntil(start + 1000);
  return { desk, clock, calls, server };
}
const blobCalls = (calls) => calls.filter((c) => c.p === '/api/blobs');

test('J24 (A3): at an opening, 5 open pull requests of 3 pages each: every commits read rides the optional loop with J20\'s, at most one call more than with no read at all; each read 1 to 3 pages, counting 3 of the 25', async () => {
  const on = await reader(readerSetup());
  const off = await reader(readerSetup(), { lastLooked: null });
  try {
    const withCommits = blobCalls(on.calls).filter((c) => c.b.commits);
    assert.deepEqual(withCommits.flatMap((c) => c.b.commits).sort(), NUMS, 'each pull request\'s commits read once');
    assert.ok(blobCalls(on.calls).length - blobCalls(off.calls).length <= 1, `${blobCalls(on.calls).length} blob calls with J24, ${blobCalls(off.calls).length} without: at most one more`);
    for (const c of withCommits) {
      const cost = (c.b.blobs || []).length + 2 * (c.b.history || []).length + (c.b.files || []).length + c.b.commits.length * COMMITS_COST + (c.b.pulls ? 5 : 0) + (c.b.usage ? 5 : 0);
      assert.ok(cost <= 25, `a call within its 25 (${cost})`);
    }
    assert.ok(withCommits.length <= 2, `${withCommits.length} calls carry them`);
    assert.equal(on.server.calls.length > 0, true);
    assert.equal(on.desk.commits('Alpha').get(21).commits.length, 250, 'three pages read');
    assert.equal(on.desk.commits('Alpha').get(21).capped, true);
    assert.equal(blobCalls(off.calls).filter((c) => c.b.commits).length, 0, 'with no "last looked" on the device, no commits read');
  } finally {
    on.desk.stop();
    off.desk.stop();
  }
});

test('J24 (A3): at a head change the commits read rides that head\'s J20 call, adding none; a pull request not updated since "last looked" is not read at all', async () => {
  const setup = readerSetup({ prs: [31, 32], commits: 1 });
  const on = await reader(setup);
  try {
    const before = blobCalls(on.calls).length;
    // A new head on #31 (made up): its files and its commits read again, together.
    setup.repos.Alpha.pulls = setup.repos.Alpha.pulls.map((p) => (p.number === 31 ? { ...p, head: { ...p.head, sha: '9'.repeat(40) }, updated_at: iso(T0 + 30e3) } : p));
    await on.clock.runUntil(T0 + POLL_MS + 1000);
    const after = blobCalls(on.calls).slice(before);
    const commitCalls = after.filter((c) => c.b.commits);
    assert.equal(commitCalls.length, 1);
    assert.deepEqual(commitCalls[0].b.commits, [31]);
    assert.ok((commitCalls[0].b.files || []).includes(31), 'in the call that reads J20\'s files of the same head');
    assert.equal(after.length, 1, 'no call of its own: the head change\'s one blob call');
  } finally {
    on.desk.stop();
  }
  const stale = readerSetup({ prs: [41], commits: 1 });
  const s = await reader(stale, { lastLooked: T0 });
  try {
    assert.equal(blobCalls(s.calls).filter((c) => c.b.commits).length, 0, 'updated before "last looked", its head unchanged: not read');
  } finally {
    s.desk.stop();
  }
});

test('J24: a failed read is asked again only inside a call of the optional loop made anyway, at most once in J20\'s 5 minutes: a cycle with nothing else to read makes no call for it; never in a verdict call (one due alongside it carries no commits page)', async () => {
  const setup = readerSetup({ prs: [51], commits: 1, fail: true });
  // #51's owner verdict file on its branch: the reader makes a verdict call of its own for it (J22).
  setup.repos.Alpha.prFiles[51].push({ filename: 'reviews/51/owner.md', status: 'added', sha: 'e'.repeat(40) });
  setup.repos.Alpha.blobs = { ['e'.repeat(40)]: 'Verdict: PASS\n' };
  // J12 answered (no merged pull requests), so no read of its own falls due again.
  setup.repos.Alpha.pullsAnswer = JSON.stringify({ data: { repository: { pullRequests: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] } } } });
  const on = await reader(setup);
  try {
    assert.equal(on.desk.commits('Alpha').get(51).state, 'failed');
    const first = blobCalls(on.calls).filter((c) => c.b.commits);
    assert.equal(first.length, 1, 'its one first read');
    const verdict = blobCalls(on.calls).filter((c) => (c.b.blobs || []).includes('e'.repeat(40)));
    assert.ok(verdict.length >= 1, 'a verdict call made');
    assert.ok(verdict.every((c) => !c.b.commits && !c.b.files), 'the verdict call holds the verdict blob and nothing else');
    // Nothing else due for 10 minutes: no call at all for the retry.
    const n0 = blobCalls(on.calls).length;
    await on.clock.runUntil(T0 + FILES_RETRY_MS + 3 * POLL_MS);
    assert.equal(blobCalls(on.calls).length, n0, 'a cycle with nothing else to read makes no call for it');
    // Something else due (a new README, an optional read): the retry rides that call, once.
    setup.repos.Alpha.commit({ 'README.md': '# Alpha\n\nA new made-up summary.\n' });
    await on.clock.runUntil(T0 + FILES_RETRY_MS + 5 * POLL_MS);
    const rides = blobCalls(on.calls).slice(n0).filter((c) => c.b.commits);
    assert.equal(rides.length, 1, 'asked again in the call made anyway');
    assert.ok((rides[0].b.blobs || []).length > 0, 'with that call\'s own read');
    assert.equal(on.desk.j24('Alpha').alone, 0, 'never a call of its own');
  } finally {
    on.desk.stop();
  }
});

test('J24 (A3): `updated_at` moving past "last looked" mid-opening with no head change (a comment, a label) makes no call of its own: no J20 read to ride, so the read waits for a call made anyway (the Reviewer\'s B2 and probe p1-alone, stage 2 round 1)', async () => {
  const setup = readerSetup({ prs: [71], commits: 1 });
  const r = setup.repos.Alpha;
  r.pulls = r.pulls.map((p) => ({ ...p, updated_at: iso(T0 - 2 * 3600e3) }));
  // J12 answered (no merged pull requests), so no read of its own falls due again.
  r.pullsAnswer = JSON.stringify({ data: { repository: { pullRequests: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] } } } });
  const on = await reader(setup, { lastLooked: T0 - 3600e3 });
  try {
    await on.clock.runUntil(T0 + 3 * POLL_MS);
    assert.equal(blobCalls(on.calls).filter((c) => c.b.commits).length, 0, 'updated before "last looked": not read at the opening');
    const n0 = blobCalls(on.calls).length;
    // A comment on #71 (made up): its `updated_at` moves past "last looked"; its head does not.
    r.pulls = r.pulls.map((p) => ({ ...p, updated_at: iso(T0 + 2 * POLL_MS) }));
    await on.clock.runUntil(T0 + 8 * POLL_MS);
    assert.equal(blobCalls(on.calls).length, n0, 'no blob call for it: nothing else to read');
    assert.equal(on.desk.commits('Alpha').get(71), undefined, 'not read yet');
    // Something else due (a new README, an optional read): the commits read rides that call.
    r.commit({ 'README.md': '# Alpha\n\nA new made-up summary.\n' });
    await on.clock.runUntil(T0 + 10 * POLL_MS);
    const rides = blobCalls(on.calls).slice(n0).filter((c) => c.b.commits);
    assert.equal(rides.length, 1, 'read in the call made anyway');
    assert.deepEqual(rides[0].b.commits, [71]);
    assert.ok((rides[0].b.blobs || []).length > 0, 'with that call\'s own read');
    assert.equal(on.desk.commits('Alpha').get(71).state, 'read');
    assert.equal(on.desk.j24('Alpha').alone, 0, 'never a call holding commits alone');
  } finally {
    on.desk.stop();
  }
});

test('J24\'s awkward cases, in the reader: a fork\'s pull request, updated after "last looked", has no commits asked for it, while the project\'s own one beside it is read (the Reviewer\'s B3, stage 2 round 1)', async () => {
  const setup = readerSetup({ prs: [81, 82], commits: 1 });
  const r = setup.repos.Alpha;
  // #82 from a fork (made up): its head in another repository. Its commits are there to read, so only the
  // rule keeps them out.
  r.pulls = r.pulls.map((p) => (p.number === 82 ? { ...p, head: { ...p.head, repo: { full_name: 'someone-else/Alpha' } }, updated_at: iso(T0 - 30e3) } : p));
  const on = await reader(setup, { lastLooked: T0 - 3600e3 });
  try {
    await on.clock.runUntil(T0 + 3 * POLL_MS);
    const asked = blobCalls(on.calls).flatMap((c) => c.b.commits || []);
    assert.ok(asked.includes(81), 'the own-repository pull request\'s commits read');
    assert.ok(!asked.includes(82), 'no commits asked for the fork\'s');
    assert.equal(on.desk.commits('Alpha').get(82), undefined);
  } finally {
    on.desk.stop();
  }
});

const J12_NONE = JSON.stringify({ data: { repository: { pullRequests: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] } } } });

test('J24 (A3): at an opening, 6 open pull requests of 3 pages each: the reads past a call\'s 25 go in the cycle\'s next call, J20\'s read of their heads having been asked in this cycle; every one read at once, the only call holding commits alone that overflow (the Reviewer\'s N-1, probe p6-overflow, stage 2 round 2)', async () => {
  const nums = [21, 22, 23, 24, 25, 26];
  const setup = readerSetup({ prs: nums, commits: 3 });
  setup.repos.Alpha.pullsAnswer = J12_NONE;
  const on = await reader(setup);
  try {
    const withCommits = blobCalls(on.calls).filter((c) => c.b.commits);
    assert.deepEqual(withCommits.flatMap((c) => c.b.commits).sort(), nums, 'all six read in the opening\'s first cycle');
    assert.ok(nums.every((n) => on.desk.commits('Alpha').get(n).state === 'read'));
    assert.equal(withCommits.length, 2, 'J20\'s call, then its overflow');
    assert.ok(withCommits[0].b.files.length === nums.length && !withCommits[1].b.files, 'the overflow\'s heads were in the first call\'s J20 read');
    assert.equal(on.desk.j24('Alpha').alone, 1, 'one call of commits alone: the overflow, in the opening\'s first cycle');
    for (const c of withCommits) assert.ok(c.b.commits.length * COMMITS_COST + (c.b.files || []).length + (c.b.blobs || []).length + (c.b.pulls ? 5 : 0) <= 25);
  } finally {
    on.desk.stop();
  }
});

test('J24 (A3): `updated_at` moving past "last looked" while J20\'s read of the head waits out its 5 minutes after a failure: J20\'s read is not due, so the commits read has nothing to ride and makes no call (the Reviewer\'s N-2, probe p7-filesfail, stage 2 round 2)', async () => {
  const setup = readerSetup({ prs: [91], commits: 1 });
  const r = setup.repos.Alpha;
  r.pulls = r.pulls.map((p) => ({ ...p, updated_at: iso(T0 - 2 * 3600e3) }));
  r.filesFail = [91];
  r.pullsAnswer = J12_NONE;
  const on = await reader(setup, { lastLooked: T0 - 3600e3 });
  try {
    await on.clock.runUntil(T0 + POLL_MS / 4);
    assert.ok(blobCalls(on.calls).some((c) => (c.b.files || []).includes(91)), 'J20\'s read of #91 made, and failed');
    const n0 = blobCalls(on.calls).length;
    // A comment on #91 (made up), inside J20's 5 minutes.
    r.pulls = r.pulls.map((p) => ({ ...p, updated_at: iso(T0 + POLL_MS / 2) }));
    await on.clock.runUntil(T0 + 4 * POLL_MS);
    assert.equal(blobCalls(on.calls).length, n0, 'no blob call');
    assert.equal(on.desk.j24('Alpha').alone, 0);
    assert.equal(on.desk.commits('Alpha').get(91), undefined);
  } finally {
    on.desk.stop();
  }
});

// ---------------------------------------------------------------------------
// On the page: the list, "Mark as seen"

test('J24 + AC40: on Home the list holds the reader\'s commits; "Mark as seen" sets "last looked" to now on this device and empties the list', async () => {
  const mem = new Map([['desk-seen-v1', JSON.stringify({ lastLooked: T0 - 6 * 3600e3 })]]);
  const store = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  const setup = readerSetup({ prs: [61], commits: 1 });
  const app = await loadSandbox({ config: setup.config, repos: setup.repos, hash: '#/', now: T0, store });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const since = findAll(app.view, (e) => e.dataset && e.dataset.k === 'since')[0];
    assert.ok(since, 'the list');
    assert.match(since.textContent, /Someone: A made-up change/, 'a commit line, the reader\'s read');
    const btn = findAll(app.view, (e) => e.dataset && e.dataset.k === 'mark-seen')[0];
    assert.equal(btn.textContent, 'Mark as seen');
    btn.click();
    await app.flush();
    assert.equal(JSON.parse(mem.get('desk-seen-v1')).lastLooked, app.now, 'kept on this device, at once');
    assert.equal(findAll(app.view, (e) => e.dataset && e.dataset.k === 'since').length, 0, 'the list emptied');
    assert.equal(findAll(app.view, (e) => e.dataset && e.dataset.k === 'since-none')[0].textContent, 'Nothing new since 10:01', 'the time it was marked: 10:01 in ownerTimeZone');
    assert.equal(byClass(app.view, 'v2-shw')[0].textContent, 'Since you last looked · 10:01');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The function: the blob call's `commits` field (J6)

const key = await makeKey('kid-1');
const jwt = await signJwt(key, goodClaims());
const API = 'https://api.github.com/repos/shumpmaster/Service-Desk';
async function call(body, routes) {
  _resetKeyCache();
  const f = fakeFetch([certsRoute([key]), ...routes]);
  const res = await handle({ request: request('/api/blobs', { jwt, body: { project: 'Service-Desk', blobs: [], history: [], ...body } }), env: ENV }, 'blobs',
    { fetch: f, now: () => JWT_NOW });
  return { res, json: res.status === 200 ? await res.json() : null, gh: f.calls.filter((c) => c.url.startsWith('https://api.github.com/')) };
}

test('J24, J6: the blob call\'s `commits` reads each pull request\'s commits, the recorded answer returned raw; the next page only through Link, never a fourth', async () => {
  const one = await call({ commits: [148] }, [(url) => (url === `${API}/pulls/148/commits?per_page=100` ? { status: 200, body: real(148) } : undefined)]);
  assert.equal(one.json.state, 'ok');
  assert.deepEqual(JSON.parse(one.json.commits[148][0]), JSON.parse(real(148)));
  assert.equal(one.gh.length, 1);
  const page = (n) => ({ status: 200, headers: { Link: `<${API}/pulls/5/commits?per_page=100&page=${n + 1}>; rel="next"` }, body: JSON.stringify(Array.from({ length: n === 3 ? 50 : 100 }, (_, i) => made(`p${n}x${i}`, iso(T0)))) });
  const three = await call({ commits: [5] }, [(url) => { const m = /\/pulls\/5\/commits\?per_page=100(?:&page=(\d))?$/.exec(url); return m ? page(Number(m[1] || 1)) : undefined; }]);
  assert.equal(three.json.commits[5].length, 3);
  assert.equal(three.gh.length, 3, 'three pages, never a fourth');
  assert.equal(parseCommitPages(three.json.commits[5]).capped, true);
});

test('J24, J6: a failed commits read is a null answer, the call still answered; a rate limit stops the call', async () => {
  const miss = await call({ commits: [6], blobs: ['a'.repeat(40)] }, [
    (url) => (url.endsWith('/pulls/6/commits?per_page=100') ? { status: 404, body: '{"message":"Not Found"}' } : undefined),
    (url) => (url.includes('/git/blobs/') ? { status: 200, body: 'x' } : undefined)]);
  assert.equal(miss.json.state, 'ok');
  assert.equal(miss.json.commits[6], null);
  assert.equal(miss.json.blobs['a'.repeat(40)], 'x', 'the rest of the call answered');
  const limited = await call({ commits: [6] }, [(url) => (url.endsWith('/pulls/6/commits?per_page=100')
    ? { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(Math.floor(JWT_NOW / 1000) + 600) }, body: '{}' } : undefined)]);
  assert.equal(limited.json.state, 'cant-read');
  assert.equal(limited.json.reason, 'rate-limit');
});

test('J24, J6: `commits` refused when out of form; each number counts 3 (its worst case) against the 25; at most 8 numbers', async () => {
  assert.equal(COMMITS_COST, 3);
  for (const [body, why] of [[{ commits: 'x' }, 'bad commits'], [{ commits: [0] }, 'bad commits'], [{ commits: [1.5] }, 'bad commits'], [{ commits: ['7'] }, 'bad commits'],
    [{ commits: Array.from({ length: MAX_COMMITS_PRS + 1 }, (_, i) => i + 1) }, 'too many commits'],
    [{ commits: [1, 2, 3], files: [1, 2, 3], blobs: Array.from({ length: 14 }, (_, i) => i.toString(16).padStart(40, 'b')) }, 'budget 26 is over 25']]) {
    const { res } = await call(body, []);
    assert.equal(res.status, 400, why);
    assert.equal((await res.json()).error, why);
  }
  const ok = await call({ commits: [1, 2, 3], files: [1, 2, 3], blobs: Array.from({ length: 13 }, (_, i) => i.toString(16).padStart(40, 'b')) },
    [(url) => ({ status: 200, body: url.includes('/git/blobs/') ? 'x' : '[]' })]);
  assert.equal(ok.res.status, 200, 'exactly 25');
  void COMMIT_LINES; void v25;
});
