// join-test: S-001/J23 — the portfolio repository → the desk's function → the page (stage 6b; specs/S-001.md:11425-11476):
// J7's `portfolio` rules (:9515-9520, the J7 join test's 2026-10-20 cases); the function refusing a portfolio read with no
// `portfolio` in J7, and allowing only the branch, the tree and the blob forms with one, never steered to another
// repository or path; a made-up portfolio in placeholder form (NOT real, tests/desk/pf-fixtures.mjs) for the idea log,
// the queue and the rarer records, with every awkward case J23 lists; the 5-minute cadence on a fake clock, in the
// scheduler's own queue after the projects' polls, never delaying them; and a 403, a 404 and a 500 on the portfolio,
// each leaving the projects' reads untouched.
// join-test: S-001/J7 — the `portfolio` key's cases (absent passing; present and well formed passing; a bad `repo`, a
// missing `defaultBranch`, an extra key and a connected project's `repo` each failing).
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig, MAX_PROJECTS } from '../../src/lib/configcheck.js';
import { handle } from '../../src/lib/api.js';
import { _resetKeyCache } from '../../src/lib/access.js';
import { portfolioUrls } from '../../src/lib/github.js';
import { createDesk, PORTFOLIO_POLL_MS, POLL_MS, PORTFOLIO_CACHE_KEY } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { parseIdeas, portfolioRead, portfolioCards, rareView, ideasView, PF_WORDS, PORTFOLIO_BLOB_MAX, PF_BOARD, IDEA_STATES } from '../../src/lib/portfolio.js';
import { makeKey, signJwt, goodClaims, certsRoute, request, fakeFetch, ENV, NOW, CONFIG, J7_FILE, PORTFOLIO, fakeClock, recorded, SD, POOM } from './helpers.mjs';
import { fakeServer, repo, gitSha, PORTFOLIO_REPO } from './fake-desk.mjs';
import { pfFiles, cardText, IDEAS, MADE_UP, withPortfolio } from './pf-fixtures.mjs';
import { parseCard } from '../../src/lib/records.js';

const TZ = 'America/Chicago';

// ---------------------------------------------------------------------------
// J7's `portfolio` (stage 6b)

test('J7 (J23, stage 6b): `portfolio` absent builds (6a\'s state); present and well formed builds; the committed file names shumpmaster/portfolio at main and passes; not counted toward AC26\'s five entries', () => {
  assert.deepEqual(validateConfig(CONFIG), [], 'absent');
  assert.deepEqual(J7_FILE.portfolio, { repo: 'shumpmaster/portfolio', defaultBranch: 'main' }, 'the committed entry (Setup P1 done, 2026-10-22)');
  assert.deepEqual(validateConfig(J7_FILE), []);
  assert.deepEqual(validateConfig(withPortfolio()), []);
  const five = { ...withPortfolio(), projects: Array.from({ length: MAX_PROJECTS }, (_, i) => ({ ...CONFIG.projects[0], name: `P${i}`, repo: `example/p${i}`, planning: i === 0, deploysNeedOwner: false, actionsUsage: undefined })) };
  assert.deepEqual(validateConfig(five), [], 'five projects and the portfolio: the portfolio is not a sixth entry');
});

test('J7 (J23, stage 6b): a `repo` not in owner/name form, a missing or empty `defaultBranch`, any other key, a value not an object, or a `repo` equal to a connected project\'s (in any case) fails the build with a message', () => {
  const fails = (pf) => validateConfig({ ...CONFIG, portfolio: pf });
  const cases = [
    [{ repo: 'portfolio', defaultBranch: 'main' }, /portfolio\.repo must be owner\/name/],
    [{ repo: 'shumpmaster/portfolio/extra', defaultBranch: 'main' }, /portfolio\.repo must be owner\/name/],
    [{ repo: 'https://github.com/shumpmaster/portfolio', defaultBranch: 'main' }, /portfolio\.repo must be owner\/name/],
    [{ repo: 'shumpmaster/portfolio' }, /portfolio\.defaultBranch must be a branch name/],
    [{ repo: 'shumpmaster/portfolio', defaultBranch: '' }, /portfolio\.defaultBranch must be a branch name/],
    [{ repo: 'shumpmaster/portfolio', defaultBranch: 'main', model: 'v3' }, /portfolio\.model is not one of the portfolio's keys/],
    [{ repo: 'shumpmaster/portfolio', defaultBranch: 'main', name: 'Portfolio' }, /portfolio\.name is not one of the portfolio's keys/],
    [{ repo: 'shumpmaster/Service-Desk', defaultBranch: 'main' }, /is a connected project's repository: the portfolio is never a project/],
    [{ repo: 'SHUMPMASTER/service-desk', defaultBranch: 'main' }, /is a connected project's repository/],
    ['shumpmaster/portfolio', /portfolio must be \{ repo, defaultBranch \}/],
    [null, /portfolio must be \{ repo, defaultBranch \}/],
    [['shumpmaster/portfolio'], /portfolio must be \{ repo, defaultBranch \}/],
  ];
  for (const [pf, re] of cases) {
    const errs = fails(pf);
    assert.ok(errs.some((e) => re.test(e)), `${JSON.stringify(pf)}: ${JSON.stringify(errs)}`);
  }
  // A project named "portfolio" is still a project, with its own repository: allowed (J23: the portfolio is never a project).
  const named = { ...withPortfolio(), projects: [...CONFIG.projects, { ...CONFIG.projects[0], name: 'portfolio', repo: 'example/portfolio-app', planning: false, deploysNeedOwner: false, actionsUsage: undefined }] };
  assert.deepEqual(validateConfig(named), []);
});

// ---------------------------------------------------------------------------
// The function: the allow-list's read target "portfolio"

const key = await makeKey('kid-pf');
const P = portfolioUrls(PORTFOLIO);
const HEAD = 'a'.repeat(40);
const TREE = 'b'.repeat(40);
const BLOB = 'c'.repeat(40);
// A made-up branch answer for the portfolio (NOT a real record; its form is GitHub's, as recorded for Service-Desk in fixtures/github/branch-main.json).
const branchBody = (sha = HEAD) => JSON.stringify({ name: 'main', commit: { sha, commit: { tree: { sha: TREE }, committer: { date: '2026-10-22T15:00:00Z' } } } });
const pfRoutes = (over = {}) => [
  certsRoute([key]),
  (url) => (url === P.branch ? over.branch || { status: 200, headers: { ETag: '"pf-1"', 'Content-Type': 'application/json' }, body: branchBody() } : undefined),
  (url) => (url === P.tree(TREE) ? { status: 200, body: JSON.stringify({ sha: TREE, truncated: false, tree: [{ path: 'ideas/IDEAS.md', type: 'blob', sha: BLOB, size: 10 }] }) } : undefined),
  (url) => (url.startsWith(`${P.blob('')}`) ? over.blob || { status: 200, headers: { 'Content-Type': 'application/vnd.github.raw+json' }, body: `# Ideas (${MADE_UP})\n` } : undefined),
];
const jwt = await signJwt(key, goodClaims());
async function fn(kind, body, f, config = withPortfolio()) {
  _resetKeyCache();
  const res = await handle({ request: request(`/api/${kind}`, { jwt, body }), env: ENV }, kind, { fetch: f, now: () => NOW, config });
  return { status: res.status, json: res.status === 200 ? await res.json() : await res.text() };
}
const github = (f) => f.calls.filter((c) => c.url.startsWith('https://api.github.com/')).map((c) => c.url);

test('J23 (the function): with no `portfolio` in J7 a portfolio read is refused (400) and makes no GitHub call; a `target` other than "portfolio" is refused', async () => {
  for (const kind of ['poll', 'blobs']) {
    const f = fakeFetch(pfRoutes());
    const r = await fn(kind, kind === 'poll' ? { target: 'portfolio', head: null, etags: {} } : { target: 'portfolio', blobs: [BLOB] }, f, CONFIG);
    assert.equal(r.status, 400, kind);
    assert.match(r.json, /no portfolio in J7/);
    assert.deepEqual(github(f), []);
    for (const target of ['Portfolio', 'Service-Desk', 'portfolio/', '', null, 1, ['portfolio']]) {
      const g = fakeFetch(pfRoutes());
      const t = await fn(kind, kind === 'poll' ? { target, head: null, etags: {} } : { target, blobs: [] }, g);
      assert.equal(t.status, 400, `${kind} ${JSON.stringify(target)}`);
      assert.deepEqual(github(g), []);
    }
  }
});

test('J23 (the function): the portfolio\'s poll makes J1\'s request 1 (the branch) and, on a new head, request 4 (the tree), and nothing else — no pull request list, no workflow runs, no owner checks; a matching ETag is the branch alone (304, "unchanged"); every URL is J7\'s repository\'s', async () => {
  const f = fakeFetch(pfRoutes());
  const r = await fn('poll', { target: 'portfolio', head: null, etags: {} }, f);
  assert.equal(r.status, 200);
  assert.deepEqual(github(f), [P.branch, P.tree(TREE)]);
  assert.equal(P.branch, 'https://api.github.com/repos/shumpmaster/portfolio/branches/main');
  assert.deepEqual([r.json.target, r.json.state, r.json.head.sha, r.json.head.committedAt], ['portfolio', 'ok', HEAD, '2026-10-22T15:00:00Z']);
  assert.match(r.json.tree, /ideas\/IDEAS\.md/);
  assert.deepEqual(r.json.etags, { [P.branch]: '"pf-1"' });
  assert.equal(r.json.cost.github, 2);
  for (const k of ['pulls', 'checks', 'jobs', 'ownerChecks', 'project']) assert.equal(k in r.json, false, `no ${k}`);
  // The same head: the branch only, no tree.
  const g = fakeFetch(pfRoutes());
  const same = await fn('poll', { target: 'portfolio', head: HEAD, etags: {} }, g);
  assert.deepEqual(github(g), [P.branch]);
  assert.equal(same.json.tree, null);
  // A matching ETag: GitHub's 304, "unchanged", the branch only.
  const h = fakeFetch(pfRoutes({ branch: { status: 304, headers: { ETag: '"pf-1"' } } }));
  const un = await fn('poll', { target: 'portfolio', head: HEAD, etags: { [P.branch]: '"pf-1"' } }, h);
  assert.deepEqual(github(h), [P.branch]);
  assert.equal(h.calls.find((c) => c.url === P.branch).headers.get('If-None-Match'), '"pf-1"');
  assert.equal(un.json.state, 'unchanged');
  // The read token, as for every read (J8, G1 unchanged in form): no new secret.
  assert.equal(f.calls.find((c) => c.url === P.branch).headers.get('Authorization'), `Bearer ${ENV.GITHUB_READ_TOKEN}`);
});

test('J23 (the function): the portfolio\'s blob call reads `git/blobs/<sha>` of J7\'s repository and nothing else, at most 25, each sha 40 lowercase hex', async () => {
  const f = fakeFetch(pfRoutes());
  const r = await fn('blobs', { target: 'portfolio', blobs: [BLOB, BLOB] }, f);
  assert.equal(r.status, 200);
  assert.deepEqual(github(f), [P.blob(BLOB)]);
  assert.equal(P.blob(BLOB), `https://api.github.com/repos/shumpmaster/portfolio/git/blobs/${BLOB}`);
  assert.equal(r.json.blobs[BLOB], `# Ideas (${MADE_UP})\n`);
  assert.equal(f.calls[f.calls.length - 1].headers.get('Accept'), 'application/vnd.github.raw+json');
  const many = Array.from({ length: 26 }, (_, i) => i.toString(16).padStart(40, '0'));
  for (const blobs of [many, ['C'.repeat(40)], ['../../repos/x/y'], [`${BLOB}/../../contents/x`], ['abc'], 'x']) {
    const g = fakeFetch(pfRoutes());
    const t = await fn('blobs', { target: 'portfolio', blobs }, g);
    assert.equal(t.status, 400, JSON.stringify(blobs).slice(0, 60));
    assert.deepEqual(github(g), []);
  }
  const ok25 = await fn('blobs', { target: 'portfolio', blobs: many.slice(0, 25) }, fakeFetch(pfRoutes()));
  assert.equal(ok25.status, 200, '25 is the budget');
});

test('J23 (the function): a portfolio read can\'t be steered to another repository or path — any key beyond its own (a project, history, compare, pull requests, files, commits, closed, single pull requests, usage, jobs, owner checks, head times, job logs, a repo or a branch of the page\'s) is refused with no GitHub call; ETags only for its branch; a project\'s body never reads the portfolio', async () => {
  const pollExtras = { project: 'Service-Desk', repo: 'shumpmaster/other', defaultBranch: 'dev', path: 'secrets.md', jobs: {}, ownerChecks: [], blobs: [BLOB], tree: TREE, url: 'https://api.github.com/repos/x/y' };
  for (const [k, v] of Object.entries(pollExtras)) {
    const f = fakeFetch(pfRoutes());
    const r = await fn('poll', { target: 'portfolio', head: null, etags: {}, [k]: v }, f);
    assert.equal(r.status, 400, `poll + ${k}`);
    assert.match(r.json, /takes only target, head, etags/);
    assert.deepEqual(github(f), [], `poll + ${k}: no GitHub call`);
  }
  const blobExtras = { project: 'Service-Desk', history: ['questions/x.md'], compare: [{ base: HEAD, head: HEAD }], pulls: { after: null }, files: [1], commits: [1],
    closed: { since: '2026-10-22T00:00:00Z' }, prs: [1], usage: true, commitTime: [HEAD], jobLog: ['1'], head: HEAD, etags: {}, repo: 'shumpmaster/other' };
  for (const [k, v] of Object.entries(blobExtras)) {
    const f = fakeFetch(pfRoutes());
    const r = await fn('blobs', { target: 'portfolio', blobs: [BLOB], [k]: v }, f);
    assert.equal(r.status, 400, `blobs + ${k}`);
    assert.match(r.json, /takes only target, blobs/);
    assert.deepEqual(github(f), [], `blobs + ${k}: no GitHub call`);
  }
  for (const etags of [{ 'https://api.github.com/repos/shumpmaster/Service-Desk/branches/main': '"x"' }, { [P.branch]: 1 }, { [P.branch]: 'x'.repeat(201) }, [], 'x']) {
    const f = fakeFetch(pfRoutes());
    const r = await fn('poll', { target: 'portfolio', head: HEAD, etags }, f);
    assert.equal(r.status, 400, JSON.stringify(etags).slice(0, 60));
    assert.deepEqual(github(f), []);
  }
  for (const head of ['A'.repeat(40), '../x', 'main']) assert.equal((await fn('poll', { target: 'portfolio', head, etags: {} }, fakeFetch(pfRoutes()))).status, 400, head);
  // A project's poll and blob call read only that project's repository, J7's `portfolio` there or not.
  const sdRoutes = [certsRoute([key]), () => ({ status: 200, body: '[]' })];
  const f = fakeFetch(sdRoutes);
  await fn('poll', { project: 'Service-Desk', head: null, etags: {} }, f);
  assert.ok(github(f).length > 0 && github(f).every((u) => u.startsWith('https://api.github.com/repos/shumpmaster/Service-Desk/')), github(f).join(' '));
  const g = fakeFetch(sdRoutes);
  await fn('blobs', { project: 'Service-Desk', blobs: [BLOB], history: [] }, g);
  assert.deepEqual(github(g), [`https://api.github.com/repos/shumpmaster/Service-Desk/git/blobs/${BLOB}`]);
  // "portfolio" as a project's name reaches no portfolio read: it is a project J7 doesn't name.
  const h = fakeFetch(pfRoutes());
  assert.equal((await fn('poll', { project: 'portfolio', head: null, etags: {} }, h)).status, 400);
  assert.deepEqual(github(h), []);
});

test('J23 (the function\'s failures): a 403 or 404 on the portfolio\'s branch is `no-access` (Setup P1); a rate-limited 403 is `rate-limit`; a 401 is `token`; a 500 or a network failure `github`; a failing tree or blob is the call\'s failure; no token is `token`', async () => {
  const cases = [
    [{ status: 403, body: '{"message":"Resource not accessible by personal access token"}' }, 'no-access'],
    [{ status: 404, body: '{"message":"Not Found"}' }, 'no-access'],
    [{ status: 403, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(Math.floor(NOW / 1000) + 90) }, body: '{}' }, 'rate-limit'],
    [{ status: 401, body: '{}' }, 'token'],
    [{ status: 500, body: '{}' }, 'github'],
    ['throw', 'github'],
  ];
  for (const [branch, reason] of cases) {
    const f = fakeFetch(pfRoutes({ branch }));
    const r = await fn('poll', { target: 'portfolio', head: null, etags: {} }, f);
    assert.equal(r.status, 200);
    assert.deepEqual([r.json.state, r.json.reason], ['cant-read', reason], JSON.stringify(branch));
    assert.deepEqual(github(f), [P.branch], 'the branch only');
    assert.equal(r.json.tree, null);
  }
  const b = await fn('blobs', { target: 'portfolio', blobs: [BLOB] }, fakeFetch(pfRoutes({ blob: { status: 500, body: '{}' } })));
  assert.deepEqual([b.json.state, b.json.reason, b.json.blobs[BLOB]], ['cant-read', 'github', null]);
  _resetKeyCache();
  const res = await handle({ request: request('/api/poll', { jwt, body: { target: 'portfolio', head: null, etags: {} } }), env: { ...ENV, GITHUB_READ_TOKEN: '' } }, 'poll',
    { fetch: fakeFetch(pfRoutes()), now: () => NOW, config: withPortfolio() });
  assert.deepEqual([(await res.json()).reason], ['token']);
  // Access first: no JWT, a 403 and no GitHub call, as for every request (J8).
  _resetKeyCache();
  const f = fakeFetch(pfRoutes());
  const no = await handle({ request: request('/api/poll', { body: { target: 'portfolio', head: null, etags: {} } }), env: ENV }, 'poll', { fetch: f, now: () => NOW, config: withPortfolio() });
  assert.equal(no.status, 403);
  assert.deepEqual(github(f), []);
});

// ---------------------------------------------------------------------------
// The page: what it takes from the idea log, the queue and the rarer records (made up, NOT real)

test('J23 (the idea log, made up): each level-2 heading an idea holding its date and name; its state the first `state:` line under it, one of captured, shaping, approved, re-aimed or stopped; no such line, or another value, "state not recorded"; two `state:` lines, the first counts; a repeated heading, both; the template\'s own heading none', () => {
  const { ideas } = parseIdeas(IDEAS);
  assert.deepEqual(ideas.map((i) => [i.date, i.name, i.state]), [
    ['2026-10-15', 'A made-up reading-list app', 'shaping'],
    ['2026-10-16', 'A made-up weekly digest', 'captured'],
    ['2026-10-17', 'A made-up price tracker', 'approved'],
    ['2026-10-18', 'A made-up route planner', 're-aimed'],
    ['2026-10-19', 'A made-up habit log', 'stopped'],
    ['2026-10-20', 'A made-up idea with no state line', null],
    ['2026-10-21', 'A made-up idea with another value', null]]);
  assert.deepEqual(IDEA_STATES, ['captured', 'shaping', 'approved', 're-aimed', 'stopped']);
  const twice = parseIdeas(`## 2026-10-01 · Same (${MADE_UP})\nstate: captured\n\n## 2026-10-01 · Same (${MADE_UP})\nstate: shaping\n`).ideas;
  assert.deepEqual(twice.map((i) => [i.name, i.state]), [[`Same (${MADE_UP})`, 'captured'], [`Same (${MADE_UP})`, 'shaping']], 'both shown');
  assert.notEqual(twice[0].key, twice[1].key);
  // A state line under a later heading never counts for the one before; a ### heading stays in its idea.
  const nested = parseIdeas('## 2026-10-02 First\n### Notes\nstate: approved\n## 2026-10-03 Second\n').ideas;
  assert.deepEqual(nested.map((i) => i.state), ['approved', null]);
  assert.deepEqual(parseIdeas('').ideas, []);
  assert.deepEqual(parseIdeas(`# Ideas\n\n## YYYY-MM-DD <name>\nstate: captured\n`).ideas, [], 'only its template\'s lines');
  const noDate = parseIdeas('## An idea with no date\nstate: captured\n').ideas[0];
  assert.deepEqual([noDate.date, noDate.name], [null, 'An idea with no date']);
});

/** The reader's snapshot for a made-up portfolio's files (as `desk.portfolio()` gives it). */
function snapOf(files, { truncated = false, sizes = {}, unread = [], failure = null, lastSuccessAt = NOW } = {}) {
  const tree = new Map(Object.entries(files).map(([p, t]) => [p, { sha: gitSha(t), size: sizes[p] || t.length }]));
  const records = new Map();
  for (const [p, t] of Object.entries(files)) {
    if (unread.includes(p)) continue;
    if (p === 'ideas/IDEAS.md') records.set(p, parseIdeas(t));
    else if (/^queue\/[^/_][^/]*$/.test(p)) records.set(p, { text: t, ...parseCard(t) });
  }
  return { ...PORTFOLIO, head: HEAD, tree, truncated, records, lastSuccessAt, failure, readAt: lastSuccessAt };
}

test('J23 (awkward cases, made up): no ideas/IDEAS.md, an empty one, or one with only its template\'s lines — "No ideas in the log yet"; the queue holding only _DECISION_CARD.md and _CRITIQUE_DIGEST.md — none waiting; a card that can\'t be parsed waits, "can\'t parse"; a blob over GitHub\'s contents limit "too large to read"; a truncated tree "not read: the portfolio\'s tree was too large"', () => {
  for (const ideas of [null, '', `# Ideas (${MADE_UP})\n\n## YYYY-MM-DD <name>\nstate: captured\n`]) {
    const r = portfolioRead(snapOf(pfFiles({ ideas })), NOW, TZ);
    assert.deepEqual([ideasView(r).count, ideasView(r).words, ideasView(r).rows.length], [0, PF_WORDS.noIdeas, 0], JSON.stringify(ideas));
  }
  const templates = portfolioRead(snapOf(pfFiles()), NOW, TZ);
  assert.deepEqual(templates.cards, [], 'only the templates: none waiting');
  assert.deepEqual(portfolioCards(templates), []);
  const odd = portfolioRead(snapOf(pfFiles({ queue: { 'PF-002-odd.md': `Not a card at all (${MADE_UP})\n` } })), NOW, TZ);
  const [c] = portfolioCards(odd);
  assert.equal(c.title, 'PF-002-odd.md', 'it waits, named by its file');
  assert.match(c.note, /^can't parse: no title under "## 1\. The decision"/);
  assert.equal(c.id, `${PF_BOARD}|portfolio|queue/PF-002-odd.md`);
  const big = pfFiles({ queue: { 'PF-003-big.md': cardText(3) } });
  const large = portfolioRead(snapOf(big, { sizes: { 'ideas/IDEAS.md': PORTFOLIO_BLOB_MAX + 1, 'queue/PF-003-big.md': PORTFOLIO_BLOB_MAX + 1 }, unread: ['ideas/IDEAS.md', 'queue/PF-003-big.md'] }), NOW, TZ);
  assert.equal(ideasView(large).words, 'ideas/IDEAS.md: too large to read');
  assert.equal(portfolioCards(large)[0].title, 'PF-003-big.md: too large to read', 'it still waits');
  const cut = portfolioRead(snapOf(big, { truncated: true, failure: { kind: 'other', reason: 'too-many', since: NOW } }), NOW, TZ);
  assert.equal(cut.state, 'truncated');
  assert.equal(cut.problem, "not read: the portfolio's tree was too large");
  assert.equal(ideasView(cut).words, "not read: the portfolio's tree was too large");
  assert.deepEqual(portfolioCards(cut), []);
  assert.equal(cut.fresh, false, 'not read successfully: Quiet waits');
});

test('J23 (the rarer records, made up): names and counts only, from the tree, no blob — the files under rulings/ and library/facts/ by name, "none yet" where a folder holds only its README; whether intent/ holds a file beyond its template', () => {
  const r = rareView(snapOf(pfFiles()).tree);
  assert.deepEqual(r, { rulings: ['R-001-made-up.md', 'R-002-made-up.md'], facts: [], intent: [] });
  const more = rareView(snapOf(pfFiles({ more: { 'intent/2026-standing.md': `Made up (${MADE_UP})\n`, 'library/facts/F-1.md': `Made up (${MADE_UP})\n` } })).tree);
  assert.deepEqual([more.intent, more.facts], [['2026-standing.md'], ['F-1.md']]);
  assert.deepEqual(rareView(new Map()), { rulings: [], facts: [], intent: [] }, 'no folders at all: none yet');
});

// ---------------------------------------------------------------------------
// The page's reads on a fake clock

/** A desk reading two projects and the made-up portfolio, through the fake function. */
function deskWith({ pf = pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1) } }), config = withPortfolio(), store = createStore(null), fail = null, start = NOW } = {}) {
  const clock = fakeClock(start);
  const sdFiles = { 'questions/_TEMPLATE.md': '# template\n', 'governance/ROUTING.toml': '[time_limits]\n' };
  const repos = { 'Service-Desk': repo(sdFiles), 'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': '# Ledger\n' }) };
  if (pf) repos[PORTFOLIO_REPO] = repo(pf);
  if (fail && repos[PORTFOLIO_REPO]) repos[PORTFOLIO_REPO].fail = fail;
  const server = fakeServer(repos, config, clock);
  const desk = createDesk({ config, call: server.call, clock, store, isVisible: () => true, j11: true });
  return { desk, server, clock, repos };
}
const pfCalls = (s) => s.server.calls.filter((c) => c.target === 'portfolio');
const projectCalls = (s) => s.server.calls.filter((c) => c.target !== 'portfolio').map((c) => `${c.at}|${c.path}|${c.project}|${JSON.stringify(c.body)}`);

test('J23 (cadence, fake clock): the opening\'s first portfolio read at once, after the projects\' first polls; then every 5 minutes (PORTFOLIO_POLL_MS = 300,000) while the page is open, in the scheduler\'s own queue after the projects\' polls; the projects\' 60-second polls never moved by it', async () => {
  assert.equal(PORTFOLIO_POLL_MS, 300_000);
  const s = deskWith();
  s.desk.start();
  await s.clock.runUntil(NOW + 16 * 60_000);
  const polls = pfCalls(s).filter((c) => c.path === '/api/poll');
  assert.deepEqual(polls.map((c) => c.at - NOW), [0, 300_000, 600_000, 900_000], 'at once, then each 5 minutes');
  // In each turn, after every project's poll of that minute (the calls' order), never between a project's poll and its blob calls.
  for (const p of polls) {
    const i = s.server.calls.indexOf(p);
    const before = s.server.calls.slice(0, i).filter((c) => c.at === p.at && c.path === '/api/poll' && c.project);
    assert.deepEqual(before.map((c) => c.project).sort(), ['Personal-Org-Operating-Model', 'Service-Desk'], `at ${p.at - NOW}: after both projects' polls`);
    assert.ok(s.server.calls.slice(i + 1).filter((c) => c.at === p.at && c.project).length === 0, 'no project call of that moment waits behind it');
  }
  // The projects' polls: exactly every 60 s, as with no portfolio at all.
  const none = deskWith({ config: CONFIG });
  none.desk.start();
  await none.clock.runUntil(NOW + 16 * 60_000);
  const at = (x, name) => x.server.calls.filter((c) => c.path === '/api/poll' && c.project === name).map((c) => c.at - NOW);
  for (const name of ['Service-Desk', 'Personal-Org-Operating-Model']) assert.deepEqual(at(s, name), at(none, name), `${name}: never delayed`);
  assert.deepEqual(projectCalls(s), projectCalls(none), 'every project call the same, at the same time, with the same body');
  assert.deepEqual(pfCalls(none), [], 'no `portfolio` in J7: no portfolio read');
  // Blobs: the idea log and the queue's card in the first read's one blob call; none again while no sha changes.
  const blobs = pfCalls(s).filter((c) => c.path === '/api/blobs');
  assert.equal(blobs.length, 1);
  assert.equal(blobs[0].at, NOW, 'in the first read');
  assert.deepEqual(new Set(blobs[0].body.blobs), new Set([gitSha(IDEAS), gitSha(cardText(1))]), 'only the idea log and the queue\'s files not starting with _; the rarer records by name only');
  for (const c of pfCalls(s)) assert.deepEqual(Object.keys(c.body).sort(), c.path === '/api/poll' ? ['etags', 'head', 'target'] : ['blobs', 'target']);
  s.desk.stop();
  none.desk.stop();
});

test('J23: its blobs read once per device and again only when a sha changes (kept under their own key); a head change reads the tree again and only the changed blob; hidden, no read; back in the foreground at its 5 minutes', async () => {
  const backing = new Map();
  const storage = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, String(v)), removeItem: (k) => backing.delete(k) };
  const s = deskWith({ store: createStore(storage) });
  s.desk.start();
  await s.clock.runUntil(NOW + 60_000);
  assert.ok(backing.has(PORTFOLIO_CACHE_KEY));
  s.repos[PORTFOLIO_REPO].commit({ 'ideas/IDEAS.md': IDEAS.replace('state: shaping', 'state: approved') });
  await s.clock.runUntil(NOW + 5 * 60_000 + 1000);
  const blobs = pfCalls(s).filter((c) => c.path === '/api/blobs').map((c) => c.body.blobs);
  assert.deepEqual(blobs, [blobs[0], [gitSha(IDEAS.replace('state: shaping', 'state: approved'))]], 'the changed blob alone');
  assert.equal(s.desk.portfolio().records.get('ideas/IDEAS.md').ideas[0].state, 'approved');
  s.desk.stop();
  // A second opening on the same device: the tree read again (a new opening), no blob call.
  const t = deskWith({ store: createStore(storage), pf: s.repos[PORTFOLIO_REPO].files });
  t.desk.start();
  await t.clock.runUntil(NOW + 60_000);
  assert.deepEqual(pfCalls(t).map((c) => c.path), ['/api/poll'], 'read once per device');
  assert.equal(t.desk.portfolio().records.size, 2);
  t.desk.stop();
  // Hidden: no portfolio read; back in the foreground, at once only when its last read began 5 minutes ago or more.
  let vis = true;
  const clock = fakeClock(NOW);
  const repos = { 'Service-Desk': repo({}), 'Personal-Org-Operating-Model': repo({}), [PORTFOLIO_REPO]: repo(pfFiles()) };
  const server = fakeServer(repos, withPortfolio(), clock);
  const d = createDesk({ config: withPortfolio(), call: server.call, clock, store: createStore(null), isVisible: () => vis, j11: true });
  d.start();
  await clock.runUntil(NOW + 60_000);
  vis = false;
  d.visibilityChanged();
  await clock.runUntil(NOW + 20 * 60_000);
  const n = server.calls.filter((c) => c.target === 'portfolio' && c.path === '/api/poll').length;
  assert.equal(n, 1, 'no read while hidden');
  vis = true;
  d.visibilityChanged();
  await clock.runUntil(NOW + 20 * 60_000 + 1000);
  assert.equal(server.calls.filter((c) => c.target === 'portfolio' && c.path === '/api/poll').length, 2, 'at once: its last read began 20 minutes ago');
  d.stop();
});

test('J23 (failures): a 403, a 404 and a 500 on the portfolio — each leaving every project\'s reads untouched (the same calls, at the same times, the same "read successfully"); 403 and 404 read "Can\'t read your portfolio: the desk\'s read access doesn\'t include it" with Setup P1 named, asked again only at the next 5-minute read; a 500 "Can\'t read your portfolio since HH:MM"', async () => {
  const base = deskWith({ config: CONFIG });
  base.desk.start();
  await base.clock.runUntil(NOW + 11 * 60_000);
  const states = (d) => [...d.desk.states.values()].map((x) => [x.project.name, x.lastSuccessAt, x.failure, x.polls]);
  for (const [fail, kind] of [[{ state: 'cant-read', reason: 'no-access' }, 'access'], [null, 'access'], [{ state: 'cant-read', reason: 'github' }, 'other'], [{ kind: 'network' }, 'other'], [{ kind: 'cloudflare' }, 'other']]) {
    // `null` with no portfolio repository: GitHub's 404 for a repository the token can't see.
    const s = deskWith({ pf: fail ? pfFiles() : null, fail });
    s.desk.start();
    await s.clock.runUntil(NOW + 11 * 60_000);
    assert.deepEqual(projectCalls(s), projectCalls(base), `${JSON.stringify(fail)}: every project's call the same`);
    assert.deepEqual(states(s), states(base), `${JSON.stringify(fail)}: every project's read the same`);
    const p = s.desk.portfolio();
    assert.equal(p.failure.kind, kind);
    assert.equal(p.failure.since, NOW, 'since its first failure');
    assert.deepEqual(pfCalls(s).map((c) => c.at - NOW), [0, 300_000, 600_000], 'asked again only at the next 5-minute read');
    const r = portfolioRead(p, NOW + 11 * 60_000, TZ);
    if (kind === 'access') {
      assert.equal(r.problem, "Can't read your portfolio: the desk's read access doesn't include it (Setup P1)");
      assert.equal(r.quietWords, r.problem);
    } else {
      assert.equal(r.problem, "Can't read your portfolio since 17:00", 'AC5\'s words for the portfolio, in ownerTimeZone (22:00 UTC)');
      assert.equal(r.quietWords, "Can't read your portfolio since 17:00");
    }
    s.desk.stop();
  }
  base.desk.stop();
  // A blob call that fails after a good poll: the portfolio not read successfully, the projects as before.
  const b = deskWith({ pf: pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1) } }) });
  b.repos[PORTFOLIO_REPO].blobFail = [gitSha(cardText(1))];
  b.desk.start();
  await b.clock.runUntil(NOW + 2 * 60_000);
  assert.equal(b.desk.portfolio().lastSuccessAt, null);
  assert.equal(b.desk.portfolio().failure.kind, 'other');
  assert.ok([...b.desk.states.values()].every((x) => x.lastSuccessAt != null && !x.failure));
  b.desk.stop();
});

test('J23: the portfolio and a project sharing a name — a project named "portfolio" is read as a project, and the portfolio as itself, apart; the portfolio\'s cards in the board\'s own group, never the project\'s', async () => {
  const config = { ...withPortfolio(), projects: [SD, { ...POOM, name: 'portfolio', repo: 'example/portfolio-app' }] };
  const clock = fakeClock(NOW);
  const repos = { 'Service-Desk': repo({}), portfolio: repo({ 'docs/LEDGER.md': '# Ledger\n' }), [PORTFOLIO_REPO]: repo(pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1) } })) };
  const server = fakeServer(repos, config, clock);
  const d = createDesk({ config, call: server.call, clock, store: createStore(null), isVisible: () => true, j11: true });
  d.start();
  await clock.runUntil(NOW + 60_000);
  const proj = server.calls.filter((c) => c.project === 'portfolio');
  assert.ok(proj.length && proj.every((c) => !('target' in c.body)), 'the project\'s own calls');
  assert.ok(server.calls.filter((c) => c.target === 'portfolio').every((c) => !('project' in c.body)), 'the portfolio\'s, no project named');
  const [card] = portfolioCards(portfolioRead(d.portfolio(), NOW, TZ));
  assert.equal(card.project, PF_BOARD);
  assert.notEqual(PF_BOARD, 'portfolio');
  assert.doesNotMatch(PF_BOARD, /^[A-Za-z0-9._-]+$/, 'no J7 name can be the board\'s portfolio key');
  d.stop();
});

test('J23 (outside the MD sandbox): the accepted view\'s reader reads no portfolio, J7\'s `portfolio` there or not (AC43: the accepted views unchanged until stage 8)', async () => {
  const clock = fakeClock(NOW);
  const repos = { 'Service-Desk': repo({}), 'Personal-Org-Operating-Model': repo({}), [PORTFOLIO_REPO]: repo(pfFiles()) };
  const server = fakeServer(repos, withPortfolio(), clock);
  const d = createDesk({ config: withPortfolio(), call: server.call, clock, store: createStore(null), isVisible: () => true });
  d.start();
  await clock.runUntil(NOW + 10 * 60_000);
  assert.equal(server.calls.filter((c) => c.target === 'portfolio').length, 0);
  assert.equal(d.portfolio(), null);
  assert.equal(recorded('branch-main').status, 200, 'the recorded branch form the made-up one follows');
  d.stop();
});
