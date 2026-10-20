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

// From 2026-10-19 (AC80) and 2026-10-20 (desk mockup v2; A3's 9,817): the board's worst cases, on the
// page's real scheduler. 5 v3 projects in the sandbox, 5 open pull requests each, every one needing a
// reviewer's verdict by the made-up risk-paths file (NOT real records), each with its verdict file on
// its branch; 288 head changes in the day, each a verdict commit (a new head, a new verdict file),
// across the 10 openings. Case 1: every head's J20 read failing all day and a mark waiting on every
// head (the page's setWaited each minute): at most 5 waited-read calls per head in an opening, none
// after that bound. Case 2: J20 answering, one pull request a project whose verdict blob fails all
// day: at most one verdict call per head in an opening, a failing head's retries inside its 5, the
// failure costing only its own head's call; at most 16 blob calls in any one cycle for a project; at
// most 3 owner-check heads a poll (J1's 11 + 3 + 16 = 30 is the function's test, j6-j8). Both: fewer
// than 10,000 calls. J24's portfolio reads are stage 2's and not built yet, so not here.
async function boardDay({ filesFail }) {
  const { HEAD_POLLS } = await import('../../src/lib/scheduler.js');
  const RISK = 'unmatched = "R1"\n[classes]\nR1 = ["src/**"]\nR0 = ["reviews/**"]\n[reviews]\nR0 = []\nR1 = ["reviewer"]\nR2 = ["reviewer"]\nR3 = ["reviewer", "owner"]\n';
  const config = fiveProjects({ allV3: true });
  const clock = fakeClock(DAY);
  const repos = Object.fromEntries(config.projects.map((p) => [p.name, repoFor(p)]));
  const NUMS = [41, 42, 43, 44, 45];
  const gens = Object.fromEntries(config.projects.map((p) => [p.name, Object.fromEntries(NUMS.map((n) => [n, 0]))]));
  const hex = (s) => createHashOf(s);
  const headOf = (name, n) => hex(`head|${name}|${n}|${gens[name][n]}`);
  const verdictOf = (name, n) => hex(`verdict|${name}|${n}|${gens[name][n]}`);
  const failing = new Set();
  const setPulls = (p) => {
    const r = repos[p.name];
    r.pulls = NUMS.map((n) => ({ number: n, title: `Made-up #${n}`, html_url: `https://github.com/${p.repo}/pull/${n}`, draft: false, base: { ref: 'main', repo: { private: false } },
      head: { ref: `build/builder/x-${n}`, sha: headOf(p.name, n), repo: { full_name: p.repo } }, user: { login: 'shumpmaster' }, created_at: new Date(DAY - n * 60e3).toISOString(), state: 'open' }));
    r.prFiles = Object.fromEntries(NUMS.map((n) => [n, [{ filename: `src/f${n}.js`, status: 'modified' }, { filename: `reviews/${n}/reviewer.md`, status: 'added', sha: verdictOf(p.name, n) }]]));
    r.blobs = Object.fromEntries(NUMS.map((n) => [verdictOf(p.name, n), 'Verdict: PASS\n']));
    r.blobFail = NUMS.filter((n) => n === 45).map((n) => verdictOf(p.name, n));
    for (const v of r.blobFail) failing.add(v);
    r.filesFail = filesFail ? [...NUMS] : [];
  };
  for (const p of config.projects) {
    repos[p.name].commit({ 'governance/risk-paths.toml': RISK });
    setPulls(p);
  }
  const server = fakeServer(repos, config, clock);
  const openings = 10;
  const windowMs = (16 * HOUR) / openings;
  let prChanges = 0;
  const perHead = new Map(); // `${opening}|${project}|${head}` → { waited, verdict }
  const cycles = new Map(); // `${project}|${poll at}` → blob calls
  const lastPoll = new Map();
  let opening = 0;
  let maxOwnerHeads = 0;
  const shaToHead = new Map();
  const waitedCalls = [];
  const call = async (path, body) => {
    const res = await server.call(path, body);
    if (path === '/api/poll') {
      lastPoll.set(body.project, clock.now());
      maxOwnerHeads = Math.max(maxOwnerHeads, (body.ownerChecks || []).length);
      return res;
    }
    if (path !== '/api/blobs') return res;
    const ck = `${body.project}|${lastPoll.get(body.project)}`;
    cycles.set(ck, (cycles.get(ck) || 0) + 1);
    const r = repos[body.project];
    const at = (n) => `${opening}|${body.project}|${r.pulls.find((x) => x.number === n).head.sha}`;
    const solo = Array.isArray(body.files) && body.files.length === 1 && body.blobs.length === 0 && !body.pulls && !body.usage && (!body.history || body.history.length === 0);
    if (solo && filesFail) {
      const k = at(body.files[0]);
      perHead.set(k, { ...(perHead.get(k) || { waited: 0, verdict: 0 }), waited: (perHead.get(k) || { waited: 0 }).waited + 1 });
    }
    const verdictShas = (body.blobs || []).filter((s) => shaToHead.has(s));
    if (verdictShas.length && !body.files) {
      const heads = new Set(verdictShas.map((s) => shaToHead.get(s)));
      assert.equal(heads.size, 1, 'a verdict call holds one head\'s verdict blobs');
      const k = `${opening}|${body.project}|${[...heads][0]}`;
      perHead.set(k, { ...(perHead.get(k) || { waited: 0, verdict: 0 }), verdict: (perHead.get(k) || { verdict: 0 }).verdict + 1, failing: verdictShas.some((s) => failing.has(s)) });
    }
    return res;
  };
  const note = () => { for (const p of config.projects) for (const n of NUMS) shaToHead.set(verdictOf(p.name, n), headOf(p.name, n)); };
  note();
  for (let o = 0; o < openings; o++) {
    opening = o;
    const open = DAY + o * 2.4 * HOUR;
    await clock.runUntil(open);
    const desk = createDesk({ config, call, clock, store: createStore(null), isVisible: () => true, j11: true });
    desk.start();
    for (let m = 1; m * 60_000 <= windowMs; m++) {
      await clock.runUntil(open + m * 60_000 - 30_000);
      // A mark waits on every head's J20 read (the page tells the reader each minute).
      if (filesFail) for (const p of config.projects) desk.setWaited(p.name, NUMS);
      // 288 head changes, each a verdict commit: the 29th minute of every 3, in turn.
      if (m % 3 === 0 && prChanges < 288 && prChanges < (o + 1) * 29) {
        const p = config.projects[prChanges % 5];
        const n = NUMS[Math.floor(prChanges / 5) % 5];
        gens[p.name][n] += 1;
        setPulls(p);
        note();
        prChanges += 1;
      }
      await clock.runUntil(open + m * 60_000);
      // The reader's own count of each head's 5 (J20's retries, the waited reads, the verdicts' retries).
      for (const p of config.projects) {
        const j = desk.j22(p.name);
        for (const pr of repos[p.name].pulls) {
          const k = `${o}|${p.name}|${pr.head.sha}`;
          const e = perHead.get(k) || { waited: 0, verdict: 0 };
          e.hp = Math.max(e.hp || 0, j.headPolls({ number: pr.number, headSha: pr.head.sha }));
          perHead.set(k, e);
        }
      }
    }
    for (const p of config.projects) waitedCalls.push({ opening: o, project: p.name, n: desk.j22(p.name).soloCalls.waited });
    desk.stop();
  }
  return { calls: server.calls.length, perHead, cycles, prChanges, HEAD_POLLS, maxOwnerHeads, failing, waitedCalls };
}
const createHashOf = (s) => {
  let h = 0n;
  for (const c of s) h = (h * 131n + BigInt(c.codePointAt(0))) % (1n << 160n);
  return h.toString(16).padStart(40, '0');
};

test('AC14 (AC80): a mark waiting on each of the 288 heads, every J20 read failing all day: at most 5 waited-read calls per head in an opening, none after; under 10,000 calls', async (t) => {
  const d = await boardDay({ filesFail: true });
  const heads = [...d.perHead.values()];
  const waited = d.waitedCalls.reduce((a, x) => a + x.n, 0);
  t.diagnostic(`AC14 (AC80, case 1): ${d.calls} calls, ${waited} waited-read calls over ${d.perHead.size} heads seen, ${d.prChanges} head changes`);
  assert.equal(d.HEAD_POLLS, 5);
  assert.ok(d.prChanges >= 280, `${d.prChanges} head changes`);
  assert.ok(heads.length > 100);
  // Each head's 5, the waited reads' and J20's own retries' together (the reader's own count); the
  // solo calls beyond them are J20's own retry at its 5-minute wait, the existing cadence.
  assert.ok(Math.max(...heads.map((x) => x.hp)) <= d.HEAD_POLLS, `at most 5 a head (${Math.max(...heads.map((x) => x.hp))})`);
  assert.ok(heads.some((x) => x.hp === d.HEAD_POLLS), 'some heads spent their 5');
  for (const w of d.waitedCalls) {
    const seen = heads.filter((_, i) => [...d.perHead.keys()][i].startsWith(`${w.opening}|${w.project}|`)).length;
    assert.ok(w.n <= d.HEAD_POLLS * seen, `${w.project} opening ${w.opening}: ${w.n} waited calls for ${seen} heads`);
  }
  assert.ok(waited > 0, 'the waited reads were made');
  assert.ok(heads.every((x) => x.verdict === 0), 'with no J20 list, no verdict call');
  assert.ok(d.calls < 10_000, `${d.calls} calls`);
});

test('AC14 (desk mockup v2): 5 pull requests a project with verdict files on their branches, 288 verdict commits, one verdict blob a project failing all day: at most one verdict call per head in an opening, the failing one\'s retries inside its 5; at most 16 blob calls a cycle; at most 3 owner-check heads a poll; under 10,000 calls', async (t) => {
  const d = await boardDay({ filesFail: false });
  const ok = [...d.perHead.values()].filter((x) => !x.failing);
  const bad = [...d.perHead.values()].filter((x) => x.failing);
  t.diagnostic(`AC14 (mockup v2, case 2): ${d.calls} calls, ${[...d.perHead.values()].reduce((a, x) => a + x.verdict, 0)} verdict calls over ${d.perHead.size} heads, the most blob calls in a cycle ${Math.max(...d.cycles.values())}`);
  assert.ok(ok.length > 100 && bad.length > 10);
  assert.ok(ok.every((x) => x.verdict === 1), 'one verdict call per head an opening sees');
  // A failing head: its first call (which uses none of its 5), then its retries at J20's 5 minutes, inside its 5.
  assert.ok(bad.every((x) => x.verdict >= 1 && x.verdict <= 1 + d.HEAD_POLLS), `a failing head's retries inside its 5 (${Math.max(...bad.map((x) => x.verdict))})`);
  assert.ok(Math.max(...[...d.perHead.values()].map((x) => x.hp || 0)) <= d.HEAD_POLLS);
  assert.ok(Math.max(...d.cycles.values()) <= 16, 'A3: 6 + 2 × 5 blob calls at most in a cycle');
  assert.ok(d.maxOwnerHeads <= 3, `${d.maxOwnerHeads} owner-check heads in a poll`);
  assert.ok(d.calls < 10_000, `${d.calls} calls`);
});
