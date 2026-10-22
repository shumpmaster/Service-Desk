// ac-test: S-001/AC14 — drives the page's real poll scheduler with a fake clock and a fake
// function: 5 connected projects, 16 window-hours in a day over 10 openings, 100 head changes.
// Fewer than 10,000 function calls are made, and none is a retry sooner than the next poll.
// From 2026-10-17 (the desk follow-ups) the same day again with J12 failing all day for all 5
// projects, v3 projects in the sandbox: fewer than 10,000 calls, no J12 read sooner than J12's
// backoff allows, at most 43 J12 reads a project after a failed one and 53 in all.
// From 2026-10-18 (notifications): the same day with three open pull requests changing heads every 10
// minutes, 288 head changes: one J20 read per pull request per head an opening sees, under 10,000 calls.
// From 2026-10-19 (AC79, draft 4): that day with every head a job candidate in all 5 projects (below).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
import { pullsBackoffMs } from '../../src/lib/pulls.js';
import { createStore } from '../../src/lib/store.js';
import { fakeClock, fixture, CONFIG, PORTFOLIO } from './helpers.mjs';
import { repo, fakeServer, PORTFOLIO_REPO } from './fake-desk.mjs';
import { pfFiles, cardText } from './pf-fixtures.mjs';
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

// From 2026-10-19 (AC79; draft 4; A3's sum, 7,577): the notifications day again with every pull request
// head a job candidate, in all 5 projects (v3, in the sandbox, J12 failing in all 5), 5 candidate heads
// open in each across all 10 openings, 288 head changes, 100 default-branch changes each a ledger change,
// the asks-merge runs page changing every 5 minutes, the grant read failing all day (the newest judging
// run's log fails) and half the heads with no counted check and a failing head-time read. Asserts: fewer
// than 10,000 calls; no AC79 blob call in a poll whose conditional reads all answered 304 (nothing else
// changing); at most 3 AC79 blob calls per candidate head in an opening, the failing ones included; a
// failed grant read asked again only at the next opening or ledger change; and each completed run's log
// read at most once per opening. The reads are made up (NOT real records); the ledger is Service-Desk's
// real one at ef8daf4, with its grant record.
test('AC14 (AC79): every head a job candidate in 5 projects, 288 head changes, 100 ledger changes, the grant read failing: under 10,000 calls, the cap held', async (t) => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { NOTIFY_FIX } = await import('./notify-helpers.mjs');
  const sdFile = (p) => readFileSync(join(NOTIFY_FIX, 'sd-ef8daf4', p), 'utf8');
  const config = fiveProjects({ allV3: true });
  const clock = fakeClock(DAY);
  const repos = Object.fromEntries(config.projects.map((p) => [p.name, repoFor(p)]));
  const LEDGER = sdFile('docs/LEDGER.md');
  const NUMS = [31, 32, 33, 34, 35];
  const iso = (ms) => new Date(ms).toISOString();
  const gens = Object.fromEntries(config.projects.map((p) => [p.name, 0]));
  const sha = (name, n, g) => `${name.length}${n}${g}`.replace(/[^0-9]/g, '').padStart(40, 'a').slice(-40);
  const ok = (id) => ({ id, name: 'build', status: 'completed', conclusion: 'success', completed_at: iso(DAY), check_suite: { id: 10 } });
  for (const p of config.projects) {
    const r = repos[p.name];
    r.commit({ 'docs/LEDGER.md': LEDGER, 'decisions/questions/P-001-asks-merge.md': sdFile('decisions/questions/P-001-asks-merge.md'),
      '.github/workflows/asks-merge.yml': sdFile('.github/workflows/asks-merge.yml') });
    r.pullsAnswer = null; // J12 failing all day
    r.prFiles = Object.fromEntries(NUMS.map((n) => [n, [{ filename: `questions/N${n}.md`, status: 'added' }]]));
    r.jobs = { asksRuns: [], checks: {}, runJobs: {}, logs: {}, commits: {}, fail: { logs: [], commitTime: [] } };
  }
  const setHeads = (p) => {
    const r = repos[p.name];
    const g = gens[p.name];
    r.pulls = NUMS.map((n) => ({ number: n, title: `Made-up #${n}`, html_url: `https://github.com/${p.repo}/pull/${n}`, draft: false, base: { ref: 'main' },
      head: { ref: `cos/x-${n}`, sha: sha(p.name, n, g), repo: { full_name: p.repo } }, user: { login: 'shumpmaster' }, created_at: iso(DAY), state: 'open' }));
    for (const pr of r.pulls) {
      // Half the heads have no counted check, and their head-time read fails: they spend their cap.
      const none = pr.number % 2 === 1;
      r.jobs.checks[pr.head.sha] = { checkRuns: none ? [] : [ok(pr.number)], statuses: [], workflowRuns: none ? [] : [{ check_suite_id: 10, path: '.github/workflows/desk-build.yml' }] };
      if (none) r.jobs.fail.commitTime.push(pr.head.sha);
    }
  };
  for (const p of config.projects) setHeads(p);
  // The asks-merge runs: a skipped run every 5 minutes (the page changes), a judging run every 15 whose log fails.
  let runId = 1;
  const addRuns = (at) => {
    for (const p of config.projects) {
      const J = repos[p.name].jobs;
      const id = runId++;
      const judging = Math.floor((at - DAY) / 60e3) % 15 === 0;
      J.asksRuns = [{ id, event: 'workflow_run', head_branch: 'main', status: 'completed', conclusion: judging ? 'success' : 'skipped', run_started_at: iso(at), updated_at: iso(at) },
        ...J.asksRuns].slice(0, 30);
      J.runJobs[id] = [{ id: id * 10, name: 'merge', status: 'completed', conclusion: judging ? 'success' : 'skipped' }];
      if (judging) J.fail.logs.push(String(id));
    }
  };
  const server = fakeServer(repos, config, clock);
  // Each poll's answer, for the "all 304" check: per project, the latest poll's state.
  const lastPoll = new Map();
  const ac79 = [];
  const call = async (path, body) => {
    const res = await server.call(path, body);
    if (path === '/api/poll') {
      const j = res.json && res.json.jobs;
      const all304 = Boolean(body.jobs) && j != null && (j.runs === null || j.runs === undefined) && Object.values(j.heads || {}).every((x) => x && Object.values(x).every((v) => v === null))
        && res.json.pulls && res.json.pulls.every((x) => x === null) && res.json.tree == null;
      lastPoll.set(body.project, { at: clock.now(), all304 });
    } else if (body.jobLog || body.commitTime || (Array.isArray(body.blobs) && body.blobs.length === 1 && !body.files && !body.pulls && body.history.length === 0
      && repos[body.project].files['docs/LEDGER.md'] && gitShaOf(repos[body.project].files['docs/LEDGER.md']) === body.blobs[0])) {
      ac79.push({ project: body.project, at: clock.now(), body, poll: lastPoll.get(body.project) });
    }
    return res;
  };
  const { gitSha: gitShaOf } = await import('./fake-desk.mjs');
  const openings = 10;
  const windowMs = (16 * HOUR) / openings;
  let changes = 0;
  let prChanges = 0;
  const ledgerChanges = Object.fromEntries(config.projects.map((p) => [p.name, []]));
  const perOpening = [];
  const failedEpochs = Object.fromEntries(config.projects.map((p) => [p.name, new Set()]));
  let maxCalls = 0;
  for (let o = 0; o < openings; o++) {
    const open = DAY + o * 2.4 * HOUR;
    await clock.runUntil(open);
    const desk = createDesk({ config, call, clock, store: createStore(null), isVisible: () => true, j11: true });
    desk.start();
    for (let m = 1; m * 60_000 <= windowMs; m++) {
      await clock.runUntil(open + m * 60_000 - 30_000);
      if (m % 5 === 0) addRuns(open + m * 60_000 - 30_000);
      // 10 default-branch changes an opening, each a ledger change.
      if (m % 9 === 5 && changes < (o + 1) * 10) {
        const p = config.projects[changes % 5];
        const r = repos[p.name];
        r.commit({ 'docs/LEDGER.md': `${r.files['docs/LEDGER.md']}\n## L-${2000 + changes} — a made-up reading ${changes}\ndate: 2026-11-03\ntype: reading\n` });
        ledgerChanges[p.name].push(clock.now());
        changes++;
      }
      // 288 pull request head changes in the day: 30 an opening (the 29th minute of every 3, in turn), then 18 in the last.
      if (m % 3 === 0 && prChanges < 288 && prChanges < (o + 1) * 29) {
        const p = config.projects[prChanges % 5];
        gens[p.name] += 1;
        setHeads(p);
        prChanges += 1;
      }
      await clock.runUntil(open + m * 60_000);
      // The grant line's epochs (the opening, then each ledger change) in which its read failed.
      for (const p of config.projects) {
        const g = desk.states.get(p.name).jobs.grant;
        if (g.failed) failedEpochs[p.name].add(`${o}|${g.since}`);
      }
    }
    desk.stop();
    // The cap, per candidate head in this opening.
    for (const p of config.projects) {
      for (const h of desk.states.get(p.name).jobs.heads.values()) {
        assert.ok(h.calls <= 3, `${p.name} opening ${o}: head ${h.sha.slice(0, 8)} had ${h.calls} AC79 blob calls`);
        maxCalls = Math.max(maxCalls, h.calls);
      }
    }
    perOpening.push({ open, end: open + windowMs });
  }
  assert.ok(Object.values(failedEpochs).some((x) => x.size > 0), 'the grant read did fail');
  assert.equal(maxCalls, 3, 'some heads spent their whole cap');
  const calls = server.calls.length;
  t.diagnostic(`AC14 (AC79): ${calls} calls, ${ac79.length} AC79 blob calls, ${changes} ledger changes, ${prChanges} head changes`);
  assert.equal(changes, 100);
  assert.ok(prChanges >= 280, `${prChanges} head changes`);
  assert.ok(calls < 10_000, `${calls} calls`);
  // No AC79 blob call in a poll whose conditional reads all answered 304 (and nothing else changed).
  for (const c of ac79) assert.ok(!(c.poll && c.poll.all304 && c.at - c.poll.at < 60_000), `${c.project}: an AC79 blob call after an all-304 poll`);
  // Each completed run's log read at most once per opening; the failing grant run's too.
  for (const { open, end } of perOpening) {
    for (const p of config.projects) {
      const asked = ac79.filter((c) => c.project === p.name && c.at >= open && c.at <= end).flatMap((c) => c.body.jobLog || []);
      assert.equal(new Set(asked).size, asked.length, `${p.name}: a log asked twice in one opening`);
      // A failed grant read is asked again only at the next opening or ledger change: one failed epoch at most for each.
      const o = perOpening.findIndex((x) => x.open === open);
      const epochs = [...failedEpochs[p.name]].filter((e) => e.startsWith(`${o}|`)).length;
      const lc = ledgerChanges[p.name].filter((x) => x >= open && x <= end).length;
      assert.ok(epochs <= 1 + lc, `${p.name}: ${epochs} failed grant epochs with ${lc} ledger changes`);
    }
  }
});

// From 2026-10-19 (AC80) and 2026-10-20 (desk mockup v2; A3's 9,355 and 9,817), as settled after stage
// 1a's build review, round 1 (finding 3), and run per worst case after round 2 (N2): each worst case AC14
// names, at full, in AC79's day. AC79's day above, with its 288 candidate
// heads in all 5 projects, J12 failing in all 5, a judging run's log and the grant read failing all
// day and 100 ledger changes, and on top of it the board's and mockup v2's cases: every pull request
// needs a reviewer's verdict by the made-up risk-paths file (NOT real records); a mark waits on every
// head (the page tells the reader each minute); three pull requests a project have their J20 read
// failing all day, so they are waited on at every opening, and two have their verdict files read, one
// of them its verdict blob failing all day; every head change is a verdict commit (a new head, a new
// verdict file). The cache is empty at every opening (the worst case), while the waited reads' 5 a head
// are kept on the device across openings (desk-board-waits-v1). Then the same day with local storage
// throwing: no waited read at all. From stage 2 (AC82, J24; `j24`: 'ok' or 'fail'), the same day with every
// open pull request updated since "last looked" and 250 commits on each (three pages, the most GitHub
// lists; NOT real records), read riding J20's calls, or failing all day. From stage 6b (J23; `portfolio: true`), the
// same day with the portfolio read too (a made-up portfolio, NOT real records: its idea log and a card in its queue),
// its every 5 minutes, each opening's first read at once and its cold blob call (the cache empty at every opening),
// and one in five of A4's 100 changes a day made in the portfolio instead of a project's ledger.
async function combinedDay({ worst, storageThrows = false, j24 = null, portfolio = false } = {}) {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { NOTIFY_FIX } = await import('./notify-helpers.mjs');
  const { HEAD_POLLS } = await import('../../src/lib/scheduler.js');
  const sdFile = (p) => readFileSync(join(NOTIFY_FIX, 'sd-ef8daf4', p), 'utf8');
  const RISK = 'unmatched = "R1"\n[classes]\nR1 = ["src/**", "questions/**"]\nR0 = ["reviews/**"]\n[reviews]\nR0 = []\nR1 = ["reviewer"]\nR2 = ["reviewer"]\nR3 = ["reviewer", "owner"]\n';
  const config = portfolio ? { ...fiveProjects({ allV3: true }), portfolio: PORTFOLIO } : fiveProjects({ allV3: true });
  const clock = fakeClock(DAY);
  const repos = Object.fromEntries(config.projects.map((p) => [p.name, repoFor(p)]));
  if (portfolio) repos[PORTFOLIO_REPO] = repo(pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1) } }));
  let pfChanges = 0;
  const LEDGER = sdFile('docs/LEDGER.md');
  const NUMS = [31, 32, 33, 34, 35];
  // Each worst case AC14 names, at full (stage 1a's build review, round 2, N2): 'waited', a mark on every
  // head with its J20 read failing all day (all 5 open pull requests a project); 'verdicts', all 5 with
  // their verdict files on the branch, read, one a project with its verdict blob failing all day.
  assert.ok(worst === 'waited' || worst === 'verdicts', worst);
  const WAITED = worst === 'waited' ? [31, 32, 33, 34, 35] : [];
  const iso = (ms) => new Date(ms).toISOString();
  // Each pull request its own generation: one head change moves one pull request's head (288 heads in the day, as A3 counts them).
  const gens = Object.fromEntries(config.projects.map((p) => [p.name, Object.fromEntries([31, 32, 33, 34, 35].map((n) => [n, 0]))]));
  const hex = (s) => { let h = 0n; for (const c of s) h = (h * 131n + BigInt(c.codePointAt(0))) % (1n << 160n); return h.toString(16).padStart(40, '0'); };
  const headOf = (name, n, g) => hex(`head|${name}|${n}|${g}`);
  const verdictOf = (name, n, g) => hex(`verdict|${name}|${n}|${g}`);
  const ok = (id) => ({ id, name: 'build', status: 'completed', conclusion: 'success', completed_at: iso(DAY), check_suite: { id: 10 } });
  const shaToHead = new Map();
  const failingVerdicts = new Set();
  for (const p of config.projects) {
    const r = repos[p.name];
    r.commit({ 'docs/LEDGER.md': LEDGER, 'decisions/questions/P-001-asks-merge.md': sdFile('decisions/questions/P-001-asks-merge.md'),
      '.github/workflows/asks-merge.yml': sdFile('.github/workflows/asks-merge.yml'), 'governance/risk-paths.toml': RISK });
    r.pullsAnswer = null; // J12 failing all day
    r.jobs = { asksRuns: [], checks: {}, runJobs: {}, logs: {}, commits: {}, fail: { logs: [], commitTime: [] } };
    r.filesFail = [...WAITED];
    if (j24) r.prCommits = Object.fromEntries([31, 32, 33, 34, 35].map((n) => [n, COMMITS250]));
    if (j24 === 'fail') r.commitsFail = [31, 32, 33, 34, 35];
    r.blobs = {};
    r.blobFail = [];
  }
  const setHeads = (p) => {
    const r = repos[p.name];
    const G = gens[p.name];
    r.pulls = NUMS.map((n) => ({ number: n, title: `Made-up #${n}`, html_url: `https://github.com/${p.repo}/pull/${n}`, draft: false, base: { ref: 'main', repo: { private: false } },
      head: { ref: `cos/x-${n}`, sha: headOf(p.name, n, G[n]), repo: { full_name: p.repo } }, user: { login: 'shumpmaster' }, created_at: iso(DAY - n * 60e3), state: 'open',
      updated_at: iso(DAY + G[n] * 60e3) }));
    r.prFiles = Object.fromEntries(NUMS.map((n) => [n, [{ filename: `questions/N${n}.md`, status: 'added' }, { filename: `reviews/${n}/reviewer.md`, status: 'added', sha: verdictOf(p.name, n, G[n]) }]]));
    for (const n of NUMS) {
      const v = verdictOf(p.name, n, G[n]);
      shaToHead.set(v, headOf(p.name, n, G[n]));
      r.blobs[v] = 'Verdict: PASS\n';
      if (n === 34 && worst === 'verdicts') { r.blobFail.push(v); failingVerdicts.add(v); }
    }
    for (const pr of r.pulls) {
      const none = pr.number % 2 === 1;
      r.jobs.checks[pr.head.sha] = { checkRuns: none ? [] : [ok(pr.number)], statuses: [], workflowRuns: none ? [] : [{ check_suite_id: 10, path: '.github/workflows/desk-build.yml' }] };
      if (none) r.jobs.fail.commitTime.push(pr.head.sha);
    }
  };
  for (const p of config.projects) setHeads(p);
  let runId = 1;
  const addRuns = (at) => {
    for (const p of config.projects) {
      const J = repos[p.name].jobs;
      const id = runId++;
      const judging = Math.floor((at - DAY) / 60e3) % 15 === 0;
      J.asksRuns = [{ id, event: 'workflow_run', head_branch: 'main', status: 'completed', conclusion: judging ? 'success' : 'skipped', run_started_at: iso(at), updated_at: iso(at) },
        ...J.asksRuns].slice(0, 30);
      J.runJobs[id] = [{ id: id * 10, name: 'merge', status: 'completed', conclusion: judging ? 'success' : 'skipped' }];
      if (judging) J.fail.logs.push(String(id));
    }
  };
  const server = fakeServer(repos, config, clock);
  const lastPoll = new Map();
  const cycles = new Map();
  const verdictCalls = new Map(); // `${opening}|${head}` → { n, failing }
  let maxOwnerHeads = 0;
  let opening = 0;
  const soloLog = new Map(); // `${opening}|${project}|${number}@${head}` → solo calls in the call log
  const span = new Map(); // the same key → { first, last }: when the reader saw that head open in that opening
  // J24 (stage 2): each blob call carrying commits, by opening and project, and when in the opening; and any
  // call that holds a verdict blob and a commits read together (there must be none).
  const j24Calls = [];
  let openAt = 0;
  const call = async (path, body) => {
    const res = await server.call(path, body);
    if (path === '/api/poll') {
      lastPoll.set(body.project, clock.now());
      maxOwnerHeads = Math.max(maxOwnerHeads, (body.ownerChecks || []).length);
    } else if (path === '/api/blobs') {
      // The call log's own count of the waited reads' shape: one pull request's files alone.
      if (Array.isArray(body.files) && body.files.length === 1 && (body.blobs || []).length === 0 && !body.pulls && !body.usage
        && (!body.compare || body.compare.length === 0) && (!body.history || body.history.length === 0)) {
        const pr = repos[body.project].pulls.find((x) => x.number === body.files[0]);
        const hk = `${opening}|${body.project}|${body.files[0]}@${pr ? pr.head.sha : '?'}`;
        soloLog.set(hk, (soloLog.get(hk) || 0) + 1);
      }
      const k = `${body.project}|${lastPoll.get(body.project)}`;
      cycles.set(k, (cycles.get(k) || 0) + 1);
      if (Array.isArray(body.commits) && body.commits.length) {
        const alone = !(body.files || []).length && !(body.blobs || []).length && !(body.history || []).length && !body.pulls && !body.usage && !body.closed && !(body.prs || []).length;
        j24Calls.push({ opening, project: body.project, alone, inFiles: body.commits.every((n) => (body.files || []).includes(n)), sinceOpen: clock.now() - openAt,
          verdict: (body.blobs || []).some((x) => shaToHead.has(x)) });
      }
      const vs = (body.blobs || []).filter((s) => shaToHead.has(s));
      if (vs.length && !body.files) {
        const heads = new Set(vs.map((s) => shaToHead.get(s)));
        assert.equal(heads.size, 1, 'a verdict call holds one head\'s verdict blobs');
        const key = `${opening}|${[...heads][0]}`;
        const e = verdictCalls.get(key) || { n: 0, failing: false };
        verdictCalls.set(key, { n: e.n + 1, failing: e.failing || vs.some((s) => failingVerdicts.has(s)) });
      }
    }
    return res;
  };
  // The device: the cache empty at every opening, the waited reads' counts kept (or throwing).
  const waitsBacking = new Map();
  const no = () => { throw new Error('storage refused'); };
  const device = storageThrows ? { getItem: no, setItem: no, removeItem: no }
    : { getItem: (k) => (waitsBacking.has(k) ? waitsBacking.get(k) : null), setItem: (k, v) => { waitsBacking.set(k, String(v)); }, removeItem: (k) => { waitsBacking.delete(k); } };
  const openings = 10;
  const windowMs = (16 * HOUR) / openings;
  let changes = 0;
  let prChanges = 0;
  let waited = 0;
  const waitedByOpening = [];
  const perHead = new Map(); // `${project}|${number}@${head}` → the most of the head's 5 used, over the day
  for (let o = 0; o < openings; o++) {
    opening = o;
    const open = DAY + o * 2.4 * HOUR;
    await clock.runUntil(open);
    openAt = clock.now();
    const desk = createDesk({ config, call, clock, store: createStore(null), waitsStore: createStore(device), isVisible: () => true, j11: true,
      ...(j24 ? { lastLooked: () => DAY - 86400e3 } : {}) });
    desk.start();
    for (let m = 1; m * 60_000 <= windowMs; m++) {
      await clock.runUntil(open + m * 60_000 - 30_000);
      for (const p of config.projects) desk.setWaited(p.name, NUMS);
      if (m % 5 === 0) addRuns(open + m * 60_000 - 30_000);
      if (m % 9 === 5 && changes < (o + 1) * 10) {
        if (portfolio && changes % 5 === 4) {
          const r = repos[PORTFOLIO_REPO];
          r.commit({ 'ideas/IDEAS.md': `${r.files['ideas/IDEAS.md']}\n## 2026-11-03 A made-up idea ${changes}\nstate: captured\n` });
          pfChanges++;
        } else {
          const p = config.projects[changes % 5];
          const r = repos[p.name];
          r.commit({ 'docs/LEDGER.md': `${r.files['docs/LEDGER.md']}\n## L-${2000 + changes} — a made-up reading ${changes}\ndate: 2026-11-03\ntype: reading\n` });
        }
        changes++;
      }
      if (m % 3 === 0 && prChanges < 288 && prChanges < (o + 1) * 29) {
        const p = config.projects[prChanges % 5];
        gens[p.name][NUMS[Math.floor(prChanges / 5) % 5]] += 1;
        setHeads(p);
        prChanges += 1;
      }
      await clock.runUntil(open + m * 60_000);
      for (const p of config.projects) {
        const j = desk.j22(p.name);
        for (const pr of repos[p.name].pulls) {
          // How long each head is open in this opening, for J20's own retries at its 5 minutes.
          const sk = `${o}|${p.name}|${pr.number}@${pr.head.sha}`;
          const sp = span.get(sk) || { first: clock.now(), last: clock.now() };
          sp.last = clock.now();
          span.set(sk, sp);
          if (!WAITED.includes(pr.number)) continue;
          const k = `${p.name}|${pr.number}@${pr.head.sha}`;
          perHead.set(k, Math.max(perHead.get(k) || 0, j.headPolls({ number: pr.number, headSha: pr.head.sha })));
        }
      }
    }
    for (const p of config.projects) {
      waited += desk.j22(p.name).soloCalls.waited;
      waitedByOpening.push({ opening: o, project: p.name, n: desk.j22(p.name).soloCalls.waited });
    }
    desk.stop();
  }
  const pfCalls = server.calls.filter((c) => c.target === 'portfolio');
  return { calls: server.calls.length, changes, prChanges, waited, perHead, verdictCalls, cycles, maxOwnerHeads, HEAD_POLLS, waitsBacking, soloLog, waitedByOpening, span, j24Calls,
    pfChanges, pfPolls: pfCalls.filter((c) => c.path === '/api/poll'), pfBlobs: pfCalls.filter((c) => c.path === '/api/blobs'), openings, windowMs };
}


const { FILES_RETRY_MS: RETRY } = await import('../../src/lib/scheduler.js');
// 250 made-up commits (NOT real records), one list shared by every pull request: three pages each.
const COMMITS250 = Array.from({ length: 250 }, (_, i) => ({ sha: i.toString(16).padStart(40, 'd'), parents: [{ sha: 'e'.repeat(40) }],
  commit: { message: `A made-up commit ${i}`, author: { name: 'Builder', email: 'builder@agents.invalid' }, committer: { date: new Date(DAY - (300 - i) * 60e3).toISOString() } }, author: null }));
// The mockup-v2 worst case without J24, run once and shared by the cases that compare with it.
let verdictsDay = null;
const verdictsBase = () => (verdictsDay ||= combinedDay({ worst: 'verdicts' }));

test('AC14 (AC80), the board\'s worst case at full in AC79\'s day: a mark on every head of all 5 open pull requests a project, each J20 read failing all day — under 10,000 calls; at most 5 waited-read calls a head over the whole day, by the reader\'s own count and by the call log\'s', async (t) => {
  const d = await combinedDay({ worst: 'waited' });
  const heads = [...d.perHead.values()];
  const logTotal = [...d.soloLog.values()].reduce((a, b) => a + b, 0);
  t.diagnostic(`AC14 (AC80 worst case): ${d.calls} calls, ${d.waited} waited-read calls (reader) over ${d.perHead.size} heads, ${logTotal} single-file calls in the log, ${d.prChanges} head changes, ${d.changes} ledger changes`);
  assert.equal(d.changes, 100);
  assert.ok(d.prChanges >= 280, `${d.prChanges} head changes`);
  assert.ok(d.calls < 10_000, `${d.calls} calls`);
  assert.ok(heads.length > 250, `${heads.length} heads waited on`);
  // The reader's own count, kept across openings.
  assert.ok(Math.max(...heads) <= d.HEAD_POLLS, `at most 5 a head over the day (${Math.max(...heads)})`);
  assert.ok(heads.some((x) => x === d.HEAD_POLLS), 'some heads spent their 5');
  assert.ok(d.waited <= d.HEAD_POLLS * heads.length && d.waited > 0, `${d.waited} waited calls for ${heads.length} heads`);
  // The call log's own count, independent of the reader: a waited read is a call of one pull request's
  // files alone, as J20's own retry at its 5 minutes can be. Per opening and project, every waited read
  // the reader counts is in the log, and the rest are no more than J20's own retries; per head over the
  // day, the single-file calls beyond J20's retries are at most 5.
  const retriesOf = (k) => { const sp = d.span.get(k); return sp ? Math.floor((sp.last - sp.first) / RETRY) + 1 : 1; };
  for (const w of d.waitedByOpening) {
    const keys = [...d.soloLog.keys()].filter((k) => k.startsWith(`${w.opening}|${w.project}|`));
    const log = keys.reduce((a, k) => a + d.soloLog.get(k), 0);
    const retries = keys.reduce((a, k) => a + retriesOf(k), 0);
    assert.ok(w.n <= log, `${w.project} opening ${w.opening}: ${w.n} waited reads, ${log} in the log`);
    assert.ok(log - w.n <= retries, `${w.project} opening ${w.opening}: ${log - w.n} other single-file calls, at most ${retries} J20 retries`);
  }
  const day = new Map();
  for (const [k, n] of d.soloLog) {
    const hk = k.split('|').slice(1).join('|');
    day.set(hk, (day.get(hk) || 0) + Math.max(0, n - retriesOf(k)));
  }
  assert.ok(Math.max(...day.values()) <= d.HEAD_POLLS, `the log: at most 5 a head over the day beyond J20's retries (${Math.max(...day.values())})`);
  assert.ok([...d.verdictCalls.values()].every((x) => x.n === 0) || d.verdictCalls.size === 0, 'with no J20 list, no verdict call');
  assert.ok(Math.max(...d.cycles.values()) <= 16, 'A3: 6 + 2 × 5');
  assert.ok(d.maxOwnerHeads <= 3);
});

test('AC14 (desk mockup v2), its worst case at full in AC79\'s day: all 5 open pull requests a project with verdict files on their branches, read, one a project with its verdict blob failing all day — under 10,000 calls; one verdict call a head an opening, a failing one\'s retries inside its 5 and failing only its own head\'s call; at most 16 blob calls a cycle; at most 3 owner-check heads a poll', async (t) => {
  const d = await verdictsBase();
  const v = [...d.verdictCalls.values()];
  t.diagnostic(`AC14 (mockup v2 worst case): ${d.calls} calls, ${v.reduce((a, x) => a + x.n, 0)} verdict calls over ${d.verdictCalls.size} heads an opening, ${d.waited} waited-read calls, the most blob calls in a cycle ${Math.max(...d.cycles.values())}, ${d.prChanges} head changes`);
  assert.equal(d.changes, 100);
  assert.ok(d.prChanges >= 280);
  assert.ok(d.calls < 10_000, `${d.calls} calls`);
  assert.equal(d.waited, 0, 'every J20 read answers: nothing waited on');
  const okV = v.filter((x) => !x.failing);
  const badV = v.filter((x) => x.failing);
  assert.ok(okV.length > 200 && badV.length > 40, `${okV.length} and ${badV.length}`);
  assert.ok(okV.every((x) => x.n === 1), 'one verdict call a head an opening sees: a failing head costs only its own call');
  assert.ok(badV.every((x) => x.n >= 1 && x.n <= 1 + d.HEAD_POLLS), `a failing head: its first call, then its retries inside its 5 (${Math.max(...badV.map((x) => x.n))})`);
  assert.ok(Math.max(...d.cycles.values()) <= 16, 'A3: 6 + 2 × 5');
  assert.ok(d.maxOwnerHeads <= 3);
});

test('AC14 (AC80), the board\'s worst case with local storage throwing: no waited-read call at all; under 10,000 calls', async (t) => {
  const d = await combinedDay({ worst: 'waited', storageThrows: true });
  t.diagnostic(`AC14 (AC80 worst case, storage throwing): ${d.calls} calls, ${d.waited} waited-read calls`);
  assert.equal(d.waited, 0);
  assert.ok(d.calls < 10_000, `${d.calls} calls`);
});

// From stage 2 (AC82, J24; A3's 9,817): the same worst case with J24's commits read — every open pull request
// updated since "last looked", three pages of commits each, at every opening and every head change.
function j24Bounds(d, base, label) {
  const byOpening = new Map();
  for (const c of d.j24Calls) if (c.alone) byOpening.set(`${c.opening}|${c.project}`, (byOpening.get(`${c.opening}|${c.project}`) || 0) + 1);
  assert.ok(d.calls < 10_000, `${label}: ${d.calls} calls`);
  assert.ok(d.calls - base.calls <= 10 * 5, `${label}: ${d.calls - base.calls} calls more than without J24: at most one a project an opening (A3: 10 × 5 = 50)`);
  assert.ok(Math.max(0, ...byOpening.values()) <= 1, `${label}: at most one call of commits alone a project an opening`);
  assert.ok(d.j24Calls.filter((c) => c.alone).every((c) => c.sinceOpen < 2 * POLL_MS), `${label}: that one in the opening's first cycle, the overflow of a call's 25, never a retry`);
  assert.equal(d.j24Calls.filter((c) => c.verdict).length, 0, `${label}: never in a verdict call`);
  assert.ok(Math.max(...d.cycles.values()) <= 16, `${label}: A3: 6 + 2 × 5`);
}

test('AC14 (desk mockup v2, J24): the worst case with J24\'s commits read at every opening and head change — under 10,000 calls (A3\'s 9,817); its pages riding the head\'s J20 call at a head change, with no call of their own, and at most one call more a project an opening', async (t) => {
  const base = await verdictsBase();
  const d = await combinedDay({ worst: 'verdicts', j24: 'ok' });
  const ride = d.j24Calls.filter((c) => !c.alone);
  t.diagnostic(`AC14 (J24): ${d.calls} calls (${base.calls} without J24), ${d.j24Calls.length} calls carrying commits, ${d.j24Calls.filter((c) => c.alone).length} of them alone`);
  j24Bounds(d, base, 'J24 read');
  assert.ok(ride.length > 280, `${ride.length} calls carry commits with J20's`);
  assert.ok(ride.filter((c) => c.sinceOpen >= 2 * POLL_MS).every((c) => c.inFiles), 'at a head change, in the call reading J20\'s files of the same head');
});

test('AC14 (desk mockup v2, J24): J24\'s commits read failing at every opening — its retries add no call', async (t) => {
  const base = await verdictsBase();
  const d = await combinedDay({ worst: 'verdicts', j24: 'fail' });
  t.diagnostic(`AC14 (J24 failing): ${d.calls} calls (${base.calls} without J24), ${d.j24Calls.length} calls carrying commits`);
  j24Bounds(d, base, 'J24 failing');
  assert.ok(d.j24Calls.some((c) => c.sinceOpen > RETRY), 'retries made, inside calls the day makes anyway');
});

// From stage 6b (J23; A3's 9,817, specs/S-001.md:13086-13094): the worst case of mockup v2's day with J24's commits read
// and the portfolio's read — one poll call every 5 minutes while open (12 an hour, 192 in A1's 16 hours), each opening's
// first read made at once (10) and its cold blob call (10), and a blob call on each portfolio head change, among A4's 100.
test('AC14 (desk mockup v2, J23): the worst case with the portfolio read too — under 10,000 calls (A3\'s 9,817); the portfolio\'s polls at most 12 an hour of open window plus each opening\'s first read, its blob calls at most one an opening plus one a head change, and the projects\' cycles still at most 16 blob calls', async (t) => {
  const d = await combinedDay({ worst: 'verdicts', j24: 'ok', portfolio: true });
  const openHours = (d.openings * d.windowMs) / 3600e3;
  t.diagnostic(`AC14 (J23): ${d.calls} calls, the portfolio's ${d.pfPolls.length} polls and ${d.pfBlobs.length} blob calls over ${openHours.toFixed(1)} open hours and ${d.pfChanges} of its head changes`);
  assert.ok(d.calls < 10_000, `${d.calls} calls`);
  assert.equal(d.changes, 100, 'A4\'s 100 changes, the portfolio\'s among them');
  assert.ok(d.pfChanges >= 15, `${d.pfChanges} portfolio head changes`);
  assert.ok(d.pfPolls.length <= Math.ceil(openHours * 12) + d.openings, `${d.pfPolls.length} polls: 12 an hour open, plus at most one more an opening`);
  assert.ok(d.pfPolls.length >= Math.floor(openHours * 12), 'read every 5 minutes while open');
  assert.ok(d.pfBlobs.length <= d.openings + d.pfChanges, `${d.pfBlobs.length} blob calls: the cold one an opening, then one a head change`);
  assert.ok(d.pfPolls.length + d.pfBlobs.length <= 212 + d.pfChanges, `the portfolio's ${d.pfPolls.length + d.pfBlobs.length} calls: A3's 212, and its head changes' among A4's`);
  for (const c of [...d.pfPolls, ...d.pfBlobs]) assert.ok(!('project' in c.body), 'never a project\'s call');
  assert.ok(Math.max(...d.cycles.values()) <= 16, 'A3: 6 + 2 × 5');
});
