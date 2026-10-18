// ac-test: S-001/AC14 — drives the page's real poll scheduler with a fake clock and a fake
// function: 5 connected projects, 16 window-hours in a day over 10 openings, 100 head changes.
// Fewer than 10,000 function calls are made, and none is a retry sooner than the next poll.
// From 2026-10-17 (the desk follow-ups) the same day again with J12 failing all day for all 5
// projects, v3 projects in the sandbox: fewer than 10,000 calls, no J12 read sooner than J12's
// backoff allows, at most 43 J12 reads a project after a failed one and 53 in all.
// From 2026-10-18 (notifications): the same day with three open pull requests changing heads every 10
// minutes, 288 head changes: one J20 read per pull request per head an opening sees, under 10,000 calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
import { pullsBackoffMs } from '../../src/lib/pulls.js';
import { createStore } from '../../src/lib/store.js';
import { fakeClock, fixture, CONFIG } from './helpers.mjs';
import { repo, fakeServer } from './fake-desk.mjs';
import { madeUp } from './j12-fixture.mjs';

const DAY = Date.parse('2026-11-03T00:00:00Z');
const HOUR = 3_600_000;

function fiveProjects({ allV3 = false } = {}) {
  const base = allV3 ? [CONFIG.projects.find((p) => p.model === 'v3')] : CONFIG.projects;
  const projects = [];
  for (let i = 0; i < 5; i++) {
    const t = base[i % base.length];
    projects.push({ ...t, name: `${t.name}-${i}`, repo: `shumpmaster/${t.name}-${i}` });
  }
  return { ...CONFIG, projects };
}

function repoFor(p) {
  if (p.model === 'v3') {
    const files = {
      'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
      'dispatch-log/2026-11.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
      'dispatch-log/2026-10.jsonl': '',
      'questions/_TEMPLATE.md': fixture('service-desk/questions/_TEMPLATE.md'),
    };
    for (let i = 1; i <= 10; i++) files[`status/Q-${String(i).padStart(3, '0')}.toml`] = `kind = "research"\nstage = 2\nstate = "done"\nsessions = ${i}\n`;
    return repo(files);
  }
  return repo({
    'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'),
    'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md'),
    'docs/sprints/m1.1-foundation.md': fixture('poom/docs/sprints/m1.1-foundation.md'),
  });
}

// `j12`, when given, is the J12 answer every read gets all day (null for a failed read, or a raw
// text): all 5 projects are then v3 projects in the sandbox (j11), so each makes J12's reads.
async function simulate({ failEvery = 0, j12 } = {}) {
  const sandbox = j12 !== undefined;
  const config = fiveProjects({ allV3: sandbox });
  const clock = fakeClock(DAY);
  const repos = Object.fromEntries(config.projects.map((p) => [p.name, repoFor(p)]));
  if (sandbox) for (const r of Object.values(repos)) r.pullsAnswer = j12;
  const opened = [];
  const server = fakeServer(repos, config, clock);
  let n = 0;
  const failed = [];
  const call = async (path, body) => {
    n++;
    if (failEvery && n % failEvery === 0) {
      failed.push({ project: body.project, at: clock.now(), path });
      return n % (2 * failEvery) === 0 ? { ok: false, status: 0, reason: 'network' }
        : { ok: true, status: 200, json: { project: body.project, state: 'cant-read', reason: 'github', retryAfter: null } };
    }
    return server.call(path, body);
  };
  // 10 openings of 96 minutes = 16 window-hours, one every 2 h 24 min, each on a fresh page with
  // an empty cache (the worst case: no blob or history is remembered between openings).
  const openings = 10;
  const windowMs = (16 * HOUR) / openings;
  const changesPerOpening = 10;
  let changes = 0;
  for (let o = 0; o < openings; o++) {
    const open = DAY + o * 2.4 * HOUR;
    await clock.runUntil(open);
    opened.push(open);
    const desk = createDesk({ config, call, clock, store: createStore(null), isVisible: () => true, ...(sandbox ? { j11: true } : {}) });
    desk.start();
    for (let c = 0; c < changesPerOpening; c++) {
      await clock.runUntil(open + ((c + 0.5) * windowMs) / changesPerOpening);
      const p = config.projects[changes % 5];
      const r = repos[p.name];
      if (p.model === 'v3') r.commit({ [`status/Q-00${1 + (changes % 9)}.toml`]: `kind = "research"\nstage = 2\nstate = "done"\nsessions = ${100 + changes}\n` });
      else r.commit({ 'docs/LEDGER.md': `${r.files['docs/LEDGER.md']}\n## L-${1000 + changes} — change ${changes}\ndate: 2026-11-03\n` });
      changes++;
    }
    await clock.runUntil(open + windowMs);
    desk.stop();
  }
  return { calls: server.calls, failed, changes, n, config, opened, windowMs };
}

function checkSpacing(calls, failed) {
  const byProject = new Map();
  for (const c of [...calls, ...failed.map((f) => ({ ...f, failedCall: true }))].sort((a, b) => a.at - b.at)) {
    if (!byProject.has(c.project)) byProject.set(c.project, []);
    byProject.get(c.project).push(c);
  }
  for (const [name, list] of byProject) {
    let lastPoll = null;
    for (const c of list) {
      if (c.path === '/api/poll') {
        // Openings are 48 minutes apart, so even across openings no poll follows another within 60 s.
        if (lastPoll != null) assert.ok(c.at - lastPoll >= POLL_MS, `${name}: poll ${c.at - lastPoll} ms after the last`);
        lastPoll = c.at;
      } else {
        // A blob call belongs to the cycle its poll started, never later than the next poll.
        assert.ok(lastPoll != null && c.at - lastPoll < POLL_MS, `${name}: blob call outside a poll cycle`);
      }
    }
  }
}

test('AC14: 5 projects, 16 window-hours, 10 openings, 100 head changes → fewer than 10,000 calls, no early retries', async (t) => {
  const { calls, changes } = await simulate();
  assert.equal(changes, 100);
  const polls = calls.filter((c) => c.path === '/api/poll').length;
  const blobs = calls.filter((c) => c.path === '/api/blobs').length;
  assert.ok(calls.length < 10_000, `${calls.length} calls`);
  // The spec's arithmetic: 4,800 polls + at most 150 cold-load and 100 change blob calls.
  assert.ok(polls <= 4_800 + 5 * 10, `${polls} polls`);
  assert.ok(blobs <= 150 + 100, `${blobs} blob calls`);
  checkSpacing(calls, []);
  t.diagnostic(`AC14: ${calls.length} calls (${polls} polls, ${blobs} blob calls)`);
});

test('AC14: with failed and refused calls mixed in, still no retry sooner than the next scheduled poll', async () => {
  const { calls, failed } = await simulate({ failEvery: 37 });
  assert.ok(failed.length > 50);
  assert.ok(calls.length + failed.length < 10_000);
  checkSpacing(calls, failed);
});

// J12's reads in the day, per project and opening: [{ project, opening, at }].
function j12Reads(calls, opened) {
  return calls.filter((c) => c.path === '/api/blobs' && c.body.pulls)
    .map((c) => ({ project: c.project, at: c.at, opening: opened.filter((o) => o <= c.at).length - 1 }));
}

for (const [what, answer] of [['"pulls": null', null], ['a `data: null` answer', madeUp('data-null').body]]) {
  test(`AC14 (the desk follow-ups, 2026-10-17): J12 failing all day for all 5 projects (${what}) → fewer than 10,000 calls, no J12 read sooner than its backoff allows, at most 43 J12 reads a project after a failed one, 53 in all`, async (t) => {
    const { calls, changes, config, opened, windowMs } = await simulate({ j12: answer });
    assert.equal(changes, 100);
    assert.ok(config.projects.every((p) => p.model === 'v3'));
    assert.ok(calls.length < 10_000, `${calls.length} calls`);
    checkSpacing(calls, []);
    const reads = j12Reads(calls, opened);
    let most = 0;
    for (const p of config.projects) {
      const mine = reads.filter((x) => x.project === p.name);
      let after = 0;
      for (let o = 0; o < opened.length; o++) {
        const at = mine.filter((x) => x.opening === o).map((x) => x.at);
        assert.ok(at.length >= 1, `${p.name}: opening ${o} made its first J12 read`);
        assert.ok(at[0] - opened[o] < 2 * POLL_MS, `${p.name}: opening ${o}'s first J12 read in its first cycles`);
        assert.ok(at.every((x) => x <= opened[o] + windowMs), 'only while the window is open');
        // Each later read waits at least the backoff's step after the one before: 5, 10, 20, 40, then 60.
        for (let k = 1; k < at.length; k++) {
          assert.ok(at[k] - at[k - 1] >= pullsBackoffMs(k - 1), `${p.name}, opening ${o}: J12 read ${k + 1} came ${(at[k] - at[k - 1]) / 60e3} min after the last, sooner than the ${pullsBackoffMs(k - 1) / 60e3}-minute wait`);
        }
        after += at.length - 1;
      }
      assert.ok(after <= 43, `${p.name}: ${after} J12 reads after a failed one`);
      assert.ok(mine.length <= 53, `${p.name}: ${mine.length} J12 reads in all`);
      most = Math.max(most, mine.length);
    }
    const polls = calls.filter((c) => c.path === '/api/poll').length;
    const blobs = calls.filter((c) => c.path === '/api/blobs').length;
    t.diagnostic(`AC14 with J12 failing (${what}): ${calls.length} calls (${polls} polls, ${blobs} blob calls), ${reads.length} J12 reads, at most ${most} a project`);
  });
}

// From 2026-10-18 (notifications, A3; review round 3, N8; build review round 1, Desk 9): the same day,
// 5 projects and their 100 default-branch changes, with three open pull requests in the first v3
// project changing heads every 10 minutes of window time for the 16 hours: 3 × 6 × 16 = 288 head
// changes. Exactly one J20 read per open pull request per head an opening sees (each change it sees,
// and each opening's first look, since nothing is kept between openings), and the day under 10,000.
test('AC14 (notifications): 5 projects, 100 head changes and 288 open pull request head changes: one J20 read per pull request per head an opening sees; under 10,000 calls', async (t) => {
  const config = fiveProjects();
  const clock = fakeClock(DAY);
  const repos = Object.fromEntries(config.projects.map((p) => [p.name, repoFor(p)]));
  const sd = config.projects.find((p) => p.model === 'v3');
  const own = (n, sha) => ({ number: n, title: `Made-up #${n}`, html_url: `https://github.com/${sd.repo}/pull/${n}`, draft: false, base: { ref: 'main' },
    head: { ref: `cos/x-${n}`, sha, repo: { full_name: sd.repo } }, user: { login: 'shumpmaster' }, created_at: '2026-11-03T00:00:00Z', state: 'open' });
  const NUMS = [21, 22, 23];
  repos[sd.name].prFiles = Object.fromEntries(NUMS.map((n) => [n, [{ filename: `src/f${n}.js`, status: 'modified' }]]));
  const server = fakeServer(repos, config, clock);
  const openings = 10;
  const windowMs = (16 * HOUR) / openings;
  let windowMin = 0;
  let prChanges = 0;
  let changes = 0;
  const setHeads = () => {
    const k = Math.floor(windowMin / 10);
    repos[sd.name].pulls = NUMS.map((n) => own(n, `${n}${k}`.padStart(40, '0')));
  };
  setHeads();
  const seen = new Set();
  for (let o = 0; o < openings; o++) {
    const open = DAY + o * 2.4 * HOUR;
    await clock.runUntil(open);
    const desk = createDesk({ config, call: server.call, clock, store: createStore(null), isVisible: () => true });
    desk.start();
    for (let m = 1; m * 60_000 <= windowMs; m++) {
      await clock.runUntil(open + m * 60_000 - 30_000);
      for (const p of repos[sd.name].pulls) seen.add(`${o}|${p.number}|${p.head.sha}`);
      // The default branches' 10 changes an opening, as the day above.
      if (m % 9 === 5 && changes < (o + 1) * 10) {
        const p = config.projects[changes % 5];
        const r = repos[p.name];
        if (p.model === 'v3') r.commit({ [`status/Q-00${1 + (changes % 9)}.toml`]: `kind = "research"\nstage = 2\nstate = "done"\nsessions = ${100 + changes}\n` });
        else r.commit({ 'docs/LEDGER.md': `${r.files['docs/LEDGER.md']}\n## L-${1000 + changes} — change ${changes}\ndate: 2026-11-03\n` });
        changes++;
      }
      await clock.runUntil(open + m * 60_000);
      const before = Math.floor(windowMin / 10);
      windowMin += 1;
      if (Math.floor(windowMin / 10) !== before) {
        prChanges += NUMS.length;
        setHeads();
      }
    }
    desk.stop();
  }
  const reads = server.calls.filter((c) => c.path === '/api/blobs').reduce((n, c) => n + (c.body.files || []).length, 0);
  t.diagnostic(`AC14 notifications: ${changes} default-branch changes, ${prChanges} pull request head changes, ${reads} J20 reads, ${server.calls.length} calls`);
  assert.equal(changes, 100);
  assert.equal(prChanges, 288, '3 × 6 × 16');
  assert.equal(reads, seen.size, 'one J20 read per pull request per head an opening sees');
  assert.ok(reads <= prChanges + NUMS.length * openings, 'the head changes plus each opening\'s first look');
  assert.ok(server.calls.length < 10_000, `${server.calls.length} calls`);
});
