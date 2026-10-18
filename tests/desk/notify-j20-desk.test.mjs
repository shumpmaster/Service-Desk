// join-test: S-001/J20 — the desk's side (the sender's is notify-j20-files.test.mjs): open pull
// requests' files in J6's blob call, from REST answers recorded once from Service-Desk's pull requests
// (fixtures/github/notify-pull-*-files.json, as J12's are) and made-up ones: one request per page,
// each page 1 of the call's budget, at most three pages; read again only when a head changes; a
// failed read leaving the question ordinary; and AC77's closed read (draft 6) in the same call.
// join-test: S-001/J6 (the `files` and `closed` fields: their form, their budget, their refusals).
// ac-test: S-001/AC14 (A3: three open pull requests changing heads every 10 minutes for 16 window
// hours: one J20 read per open pull request per head an opening sees, and the day under 10,000 calls).

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

test('J6: `files` and `closed` refused when out of form; each number counts 1 and `closed` 1 against the 25', async () => {
  for (const [body, why] of [[{ files: 'x' }, 'bad files'], [{ files: [0] }, 'bad files'], [{ files: [1.5] }, 'bad files'], [{ files: ['7'] }, 'bad files'],
    [{ closed: 'yes' }, 'bad closed'], [{ files: Array.from({ length: 26 }, (_, i) => i + 1) }, 'too many files'],
    [{ files: [1, 2, 3], blobs: Array.from({ length: 22 }, (_, i) => i.toString(16).padStart(40, 'b')), closed: true }, 'budget 26 is over 25']]) {
    const { res } = await blobCall(body, []);
    assert.equal(res.status, 400, why);
    assert.equal((await res.json()).error, why);
  }
});

test('AC77 (draft 6), J6: `closed` reads one page of the closed pull requests, newest updated first; a failure is a null answer, not a failed call', async () => {
  let r = await blobCall({ closed: true }, [(url) => (url === `${API}/pulls?state=closed&sort=updated&direction=desc&per_page=100` ? { status: 200, body: '[{"number":1}]' } : undefined)]);
  assert.equal(r.json.closed, '[{"number":1}]');
  assert.equal(r.gh.length, 1);
  r = await blobCall({ closed: true, files: [9] }, [(url) => (/state=closed|\/files/.test(url) ? { status: 502, body: 'bad gateway' } : undefined)]);
  assert.equal(r.json.state, 'ok');
  assert.equal(r.json.closed, null);
  assert.equal(r.json.files[9], null);
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

test('AC14 (A3; review round 3, N8): three open pull requests changing heads every 10 minutes for 16 window-hours: exactly one J20 read per pull request per head an opening sees; the day under 10,000 calls', async (t) => {
  const DAY = Date.parse('2026-11-03T00:00:00Z');
  const HOUR = 3_600_000;
  const clock = fakeClock(DAY);
  const repos = world([own(21, '1'.repeat(40)), own(22, '2'.repeat(40)), own(23, '3'.repeat(40))]);
  repos['Service-Desk'].prFiles = { 21: [{ filename: 'src/a.js', status: 'modified' }], 22: [{ filename: 'src/b.js', status: 'modified' }], 23: [{ filename: 'src/c.js', status: 'modified' }] };
  const server = fakeServer(repos, CONFIG, clock);
  const openings = 10;
  const windowMs = (16 * HOUR) / openings;
  const seen = new Set(); // (opening, number, head) the page could see
  let changes = 0;
  let windowTime = 0;
  const setHeads = () => {
    const k = Math.floor(windowTime / (10 * 60_000));
    repos['Service-Desk'].pulls = [21, 22, 23].map((n) => own(n, `${n}${k}`.padStart(40, '0')));
  };
  for (let o = 0; o < openings; o++) {
    const open = DAY + o * 2.4 * HOUR;
    await clock.runUntil(open);
    setHeads();
    const desk = createDesk({ config: CONFIG, call: server.call, clock, store: createStore(null), isVisible: () => true });
    desk.start();
    for (let t = 0; t < windowMs; t += 60_000) {
      // The heads change every 10 minutes of window time (3 × 6 × 16 = 288 changes in the day).
      const before = Math.floor(windowTime / 600_000);
      windowTime += 60_000;
      if (Math.floor(windowTime / 600_000) !== before && t + 60_000 < windowMs) {
        changes += 3;
        setHeads();
      }
      await clock.runUntil(open + t + 60_000);
      for (const p of repos['Service-Desk'].pulls) seen.add(`${o}|${p.number}|${p.head.sha}`);
    }
    desk.stop();
  }
  const reads = server.calls.filter((c) => c.path === '/api/blobs').reduce((n, c) => n + (c.body.files || []).length, 0);
  t.diagnostic(`J20 on the page: ${changes} head changes, ${reads} reads, ${server.calls.length} calls`);
  assert.ok(changes >= 280 && changes <= 288, `${changes} head changes`);
  assert.equal(reads, seen.size, 'one read per pull request per head an opening sees: the head changes, plus each opening\'s first look');
  assert.ok(reads <= changes + 3 * openings);
  assert.ok(server.calls.length < 10_000, `${server.calls.length} calls`);
});
