// join-test: S-001/J20 — the desk's side (the sender's is notify-j20-files.test.mjs): open pull
// requests' files in J6's blob call, from REST answers recorded once from Service-Desk's pull requests
// (fixtures/github/notify-pull-*-files.json, as J12's are) and made-up ones: one request per page,
// each page 1 of the call's budget, at most three pages; read again only when a head changes; a
// failed read leaving the question ordinary; and AC77's closed read (draft 6) in the same call.
// join-test: S-001/J6 (the `files` and `closed` fields: their form, their budget, their refusals).
// (AC14's notifications case, three open pull requests changing heads every 10 minutes for 16 window
// hours across AC42's 5 projects, is in ac14-budget.test.mjs from draft 9, build review round 1, Desk 9.)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../../src/lib/api.js';
import { _resetKeyCache } from '../../src/lib/access.js';
import { createDesk } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { makeKey, signJwt, goodClaims, certsRoute, request, fakeFetch, ENV, NOW, recorded, fakeClock, fixture, CONFIG } from './helpers.mjs';
import { repo, fakeServer } from './fake-desk.mjs';

const key = await makeKey('kid-1');
const jwt = await signJwt(key, goodClaims());
const API = 'https://api.github.com/repos/shumpmaster/Service-Desk';
const filesBody = (n) => JSON.parse(recorded(`notify-pull-${n}-files`).body);

async function blobCall(body, routes) {
  _resetKeyCache();
  const f = fakeFetch([certsRoute([key]), ...routes]);
  const res = await handle({ request: request('/api/blobs', { jwt, body: { project: 'Service-Desk', blobs: [], history: [], ...body } }), env: ENV }, 'blobs',
    { fetch: f, now: () => NOW });
  return { res, json: res.status === 200 ? await res.json() : null, gh: f.calls.filter((c) => c.url.startsWith('https://api.github.com/')) };
}

test('J20, J6: the blob call\'s `files` reads each pull request\'s files, the recorded answers returned raw', async () => {
  const { json, gh } = await blobCall({ files: [107, 108] }, [
    (url) => (url === `${API}/pulls/107/files?per_page=100` ? recorded('notify-pull-107-files') : undefined),
    (url) => (url === `${API}/pulls/108/files?per_page=100` ? recorded('notify-pull-108-files') : undefined),
  ]);
  assert.equal(json.state, 'ok');
  assert.deepEqual(JSON.parse(json.files[107][0]), filesBody(107));
  assert.deepEqual(JSON.parse(json.files[108][0]), filesBody(108));
  assert.equal(gh.length, 2, 'one request a pull request');
  assert.equal(json.cost.github, 2);
});

test('J20: three pages read through Link, each counting 1 of the budget; a fourth never; with no budget left the answer is null (read again later)', async () => {
  const page = (n, next) => ({ status: 200, headers: next ? { Link: `<${API}/pulls/5/files?per_page=100&page=${n + 1}>; rel="next"` } : {},
    body: JSON.stringify(Array.from({ length: 100 }, (_, i) => ({ filename: `src/f${n}-${i}.js`, status: 'added' }))) });
  const routes = [(url) => {
    const m = /\/pulls\/5\/files\?per_page=100(?:&page=(\d))?$/.exec(url);
    return m ? page(Number(m[1] || 1), true) : undefined;
  }];
  let r = await blobCall({ files: [5] }, routes);
  assert.equal(r.json.files[5].length, 3);
  assert.equal(r.gh.length, 3, 'three pages, never a fourth');
  // 24 of the 25 already asked for: page 2 has no budget, so the answer is null.
  r = await blobCall({ files: [5], blobs: Array.from({ length: 24 }, (_, i) => i.toString(16).padStart(40, 'b')) },
    [...routes, (url) => (url.includes('/git/blobs/') ? { status: 200, body: 'x' } : undefined)]);
  assert.equal(r.json.files[5], null);
  assert.equal(r.gh.filter((c) => /\/files/.test(c.url)).length, 1);
});

test('J6: `files`, `closed` and `prs` refused when out of form; each number counts 1, `closed` 3 (its worst case) against the 25', async () => {
  const since = '2026-10-18T11:26:23.000Z';
  for (const [body, why] of [[{ files: 'x' }, 'bad files'], [{ files: [0] }, 'bad files'], [{ files: [1.5] }, 'bad files'], [{ files: ['7'] }, 'bad files'],
    [{ closed: 'yes' }, 'bad closed'], [{ closed: true }, 'bad closed'], [{ closed: {} }, 'bad closed'], [{ closed: { since: 'yesterday' } }, 'bad closed'],
    [{ closed: { since, more: 1 } }, 'bad closed'], [{ prs: [0] }, 'bad prs'], [{ prs: '5' }, 'bad prs'],
    [{ prs: Array.from({ length: 11 }, (_, i) => i + 1) }, 'too many prs'],
    [{ files: Array.from({ length: 26 }, (_, i) => i + 1) }, 'too many files'],
    [{ files: [1, 2, 3], blobs: Array.from({ length: 19 }, (_, i) => i.toString(16).padStart(40, 'b')), closed: { since }, prs: [4] }, 'budget 26 is over 25']]) {
    const { res } = await blobCall(body, []);
    assert.equal(res.status, 400, why);
    assert.equal((await res.json()).error, why);
  }
});

// AC77 (draft 7, finding 5): the closed read pages while a full page's last pull request was updated
// after `since`, up to 3; a fourth needed, or a failure, is a null answer, never a failed call; each pull
// request cut to the fields the page reads.
const CLOSED_URL = `${API}/pulls?state=closed&sort=updated&direction=desc&per_page=100`;
function closedRoutes(pages) {
  return [(url) => {
    if (!url.startsWith(CLOSED_URL)) return undefined;
    const m = /&page=(\d+)$/.exec(url);
    const n = m ? Number(m[1]) : 1;
    const list = pages[n - 1] || [];
    return { status: 200, headers: n < pages.length ? { Link: `<${CLOSED_URL}&page=${n + 1}>; rel="next"` } : {}, body: JSON.stringify(list) };
  }];
}
const cpr = (n, updated, o = {}) => ({ number: n, title: 'Secret-ish title', body: 'Secret-ish body', state: 'closed', draft: false, merged_at: null,
  closed_at: updated, updated_at: updated, base: { ref: 'main' }, head: { sha: 'a'.repeat(40), repo: { full_name: 'shumpmaster/Service-Desk' } }, ...o });
const full = (from, updated) => Array.from({ length: 100 }, (_, i) => cpr(from + i, updated));

test('AC77 (draft 7), J6: `closed` reads the next page only while a full page\'s last was updated after `since`, up to 3; a fourth needed or a failure is null', async () => {
  const since = '2026-10-18T11:26:23.000Z';
  // One page, not full: one request; the fields kept, never a title or body.
  let r = await blobCall({ closed: { since } }, closedRoutes([[cpr(1, '2026-10-18T12:00:00Z')]]));
  assert.equal(r.gh.length, 1);
  assert.equal(r.json.closed.pulls.length, 1);
  assert.deepEqual(Object.keys(r.json.closed.pulls[0]).sort(), ['base', 'closed_at', 'draft', 'head', 'merged_at', 'number', 'state', 'updated_at']);
  assert.ok(!JSON.stringify(r.json).includes('Secret-ish'));
  // A full first page whose last was updated after `since`: the second is read.
  r = await blobCall({ closed: { since } }, closedRoutes([full(1, '2026-10-18T13:00:00Z'), [cpr(200, '2026-10-18T12:00:00Z')]]));
  assert.equal(r.gh.length, 2);
  assert.equal(r.json.closed.pulls.length, 101);
  // A full page whose last was updated at `since`: no next page.
  r = await blobCall({ closed: { since } }, closedRoutes([full(1, since), [cpr(200, '2026-10-18T10:00:00Z')]]));
  assert.equal(r.gh.length, 1);
  // Three full pages all after `since`, a fourth there: a failed read, three requests.
  r = await blobCall({ closed: { since } }, closedRoutes([full(1, '2026-10-18T13:00:00Z'), full(101, '2026-10-18T13:00:00Z'), full(201, '2026-10-18T13:00:00Z'), [cpr(400, '2026-10-18T12:00:00Z')]]));
  assert.equal(r.gh.length, 3, 'never a fourth');
  assert.equal(r.json.state, 'ok');
  assert.equal(r.json.closed, null);
  // A failure: a null answer, not a failed call.
  r = await blobCall({ closed: { since }, files: [9] }, [(url) => (/state=closed|\/files/.test(url) ? { status: 502, body: 'bad gateway' } : undefined)]);
  assert.equal(r.json.state, 'ok');
  assert.equal(r.json.closed, null);
  assert.equal(r.json.files[9], null);
});

test('AC77 (draft 7), J6: `prs` reads each pull request alone, cut to the kept fields; a failure is a null answer', async () => {
  const r = await blobCall({ prs: [91, 92] }, [
    (url) => (url === `${API}/pulls/91` ? { status: 200, body: JSON.stringify(cpr(91, '2026-10-18T12:00:00Z', { merged_at: '2026-10-18T12:00:00Z' })) } : undefined),
    (url) => (url === `${API}/pulls/92` ? { status: 502, body: 'bad gateway' } : undefined),
  ]);
  assert.equal(r.json.state, 'ok');
  assert.equal(r.gh.length, 2, 'one request each');
  assert.equal(r.json.prs[91].merged_at, '2026-10-18T12:00:00Z');
  assert.equal(r.json.prs[91].state, 'closed');
  assert.ok(!JSON.stringify(r.json).includes('Secret-ish'));
  assert.equal(r.json.prs[92], null);
});

// ---------------------------------------------------------------------------
// The page: read once per head sha, a failure leaving the question ordinary

const NOW0 = Date.parse('2026-10-18T15:00:00Z');
const own = (n, sha) => ({ number: n, title: `Made-up #${n}`, html_url: `https://github.com/shumpmaster/Service-Desk/pull/${n}`, draft: false,
  base: { ref: 'main' }, head: { ref: `cos/x-${n}`, sha, repo: { full_name: 'shumpmaster/Service-Desk' } }, user: { login: 'shumpmaster' },
  created_at: '2026-10-18T11:00:00Z', state: 'open' });

function world(pulls) {
  const sd = repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), 'questions/N-a.md': '# Ruling needed: A\n\nMilestone: none (made up)\n\nWHY: x\n' }, pulls,
    [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  const poom = repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], []);
  return { 'Service-Desk': sd, 'Personal-Org-Operating-Model': poom };
}
const fileReads = (server, n) => server.calls.filter((c) => c.path === '/api/blobs' && (c.body.files || []).includes(n)).length;

test('J20: on the page, each own-branch pull request\'s files read once per head sha; a head change reads again, an unchanged head not; a fork\'s and a draft\'s never', async () => {
  const clock = fakeClock(NOW0);
  const fork = { ...own(12, 'c'.repeat(40)), head: { ref: 'x', sha: 'c'.repeat(40), repo: { full_name: 'someone/Service-Desk' } } };
  const draft = { ...own(13, 'd'.repeat(40)), draft: true };
  const repos = world([own(11, 'a'.repeat(40)), fork, draft]);
  repos['Service-Desk'].prFiles = { 11: [{ filename: 'decisions/questions/N-a.md', status: 'added' }] };
  const server = fakeServer(repos, CONFIG, clock);
  const desk = createDesk({ config: CONFIG, call: server.call, clock, store: createStore(null), isVisible: () => true });
  desk.start();
  await clock.runUntil(NOW0 + 1000);
  assert.equal(fileReads(server, 11), 1);
  assert.deepEqual(desk.model('Service-Desk').asking.map((a) => [a.name, a.state]), [['N-a', 'recording']]);
  await clock.runUntil(NOW0 + 5 * 60_000);
  assert.equal(fileReads(server, 11), 1, 'unchanged head: not read again');
  assert.equal(fileReads(server, 12) + fileReads(server, 13), 0, 'a fork\'s and a draft\'s files are never read');
  repos['Service-Desk'].pulls[0] = own(11, 'b'.repeat(40));
  repos['Service-Desk'].prFiles = { 11: [{ filename: 'src/x.js', status: 'modified' }] };
  await clock.runUntil(NOW0 + 6 * 60_000 + 1000);
  assert.equal(fileReads(server, 11), 2, 'a new head: read again');
  desk.stop();
});

test('J20: a failed read leaves the question ordinary, waiting with its link, and never touches "read successfully"; it is tried again later', async () => {
  const clock = fakeClock(NOW0);
  const repos = world([own(14, 'e'.repeat(40))]);
  repos['Service-Desk'].prFiles = { 14: [{ filename: 'decisions/questions/N-a.md', status: 'added' }] };
  repos['Service-Desk'].filesFail = [14];
  const server = fakeServer(repos, CONFIG, clock);
  const desk = createDesk({ config: CONFIG, call: server.call, clock, store: createStore(null), isVisible: () => true });
  desk.start();
  await clock.runUntil(NOW0 + 1000);
  const m = desk.model('Service-Desk');
  assert.ok(m.flagged.some((f) => f.kind === 'question' && f.question.name === 'N-a'), 'ordinary, waiting');
  assert.equal(desk.states.get('Service-Desk').failure, null, 'the project is still read');
  assert.ok(desk.states.get('Service-Desk').lastSuccessAt != null);
  repos['Service-Desk'].filesFail = [];
  await clock.runUntil(NOW0 + 7 * 60_000);
  assert.equal(desk.model('Service-Desk').asking[0].state, 'recording', 'read again after its wait');
  desk.stop();
});
