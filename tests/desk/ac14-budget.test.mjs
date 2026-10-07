// ac-test: S-001/AC14 — drives the page's real poll scheduler with a fake clock and a fake
// function: 5 connected projects, 16 window-hours in a day over 10 openings, 100 head changes.
// Fewer than 10,000 function calls are made, and none is a retry sooner than the next poll.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { fakeClock, fixture, CONFIG } from './helpers.mjs';
import { repo, fakeServer } from './fake-desk.mjs';

const DAY = Date.parse('2026-11-03T00:00:00Z');
const HOUR = 3_600_000;

function fiveProjects() {
  const base = CONFIG.projects;
  const projects = [];
  for (let i = 0; i < 5; i++) {
    const t = base[i % 2];
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

async function simulate({ failEvery = 0 } = {}) {
  const config = fiveProjects();
  const clock = fakeClock(DAY);
  const repos = Object.fromEntries(config.projects.map((p) => [p.name, repoFor(p)]));
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
    const desk = createDesk({ config, call, clock, store: createStore(null), isVisible: () => true });
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
  return { calls: server.calls, failed, changes, n, config };
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
