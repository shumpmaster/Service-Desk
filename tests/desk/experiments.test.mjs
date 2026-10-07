// The experiment pieces M1 ships (spec S-001, "Experiments in Build"; AC15): EXP-004's links,
// built as data in src/, and EXP-001's panel logic, driven here by a fake clock and function.
// ac-test: S-001/AC15 (the EXP-001 panel and EXP-004 links that run on the preview after the merge)
// join-test: S-001/J3 (the new-file URL form EXP-004 tests and the EXP-001 result link uses)
import test from 'node:test';
import assert from 'node:assert/strict';
import { newFileUrl, cappedNewFileLink, exp004Links, EXP004_SHORT, blobLink } from '../../src/lib/links.js';
import { plan, heavyBlobs, createRun, summarize, resultMarkdown, rawTable, STEP_MS } from '../../src/lib/exp001.js';
import { fakeClock, fixture, CONFIG, SD, POOM } from './helpers.mjs';
import { repo, fakeServer } from './fake-desk.mjs';

test('J3: the new-file URL form, percent-encoded, matching the spec\'s two examples', () => {
  assert.equal(newFileUrl(SD, 'decisions/P-001/dor-4.md', 'Decision: build\n'),
    'https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2FP-001%2Fdor-4.md&value=Decision%3A%20build%0A');
  assert.equal(newFileUrl(SD, 'decisions/questions/Q-005-sources.md', 'Ruling: A\n\nQuestion: questions/Q-005-sources.md\n'),
    'https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2Fquestions%2FQ-005-sources.md&value=Ruling%3A%20A%0A%0AQuestion%3A%20questions%2FQ-005-sources.md%0A');
  assert.equal(newFileUrl({ ...SD, contentPrefill: false }, 'a.md', 'x'), 'https://github.com/shumpmaster/Service-Desk/new/main?filename=a.md');
  assert.equal(newFileUrl({ ...SD, defaultBranch: 'trunk' }, 'a.md', null), 'https://github.com/shumpmaster/Service-Desk/new/trunk?filename=a.md');
  assert.equal(blobLink(SD, 'queue/P-001-stop-6.md'), 'https://github.com/shumpmaster/Service-Desk/blob/main/queue/P-001-stop-6.md');
});

test('J3: a note with &, #, %, emoji and newlines survives a round trip', () => {
  const url = new URL(newFileUrl(SD, 'x.md', EXP004_SHORT));
  assert.equal(url.searchParams.get('value'), EXP004_SHORT);
  assert.equal(url.searchParams.get('filename'), 'x.md');
  assert.ok(/&/.test(EXP004_SHORT) && /#/.test(EXP004_SHORT) && /%/.test(EXP004_SHORT) && /\u{1F9EA}/u.test(EXP004_SHORT));
  assert.equal(EXP004_SHORT.split('\n').length - 1, 2);
});

test('AC17 rule for the EXP-001 result link: over the cap, only the file name is filled and the text is offered to copy', () => {
  const short = cappedNewFileLink(SD, 'docs/handover/experiments/EXP-001-result.md', 'short', 6000);
  assert.equal(short.copy, null);
  const long = cappedNewFileLink(SD, 'docs/handover/experiments/EXP-001-result.md', 'x'.repeat(7000), 6000);
  assert.equal(long.copy.length, 7000);
  assert.ok(!long.url.includes('value='));
});

test('EXP-004: four links per repository, to docs/exp-004/link-test-<n>.md, at exactly 2,000, 6,000 and 8,000 characters', () => {
  for (const p of [SD, POOM]) {
    const links = exp004Links(p);
    assert.deepEqual(links.map((l) => l.path), [1, 2, 3, 4].map((n) => `docs/exp-004/link-test-${n}.md`));
    assert.deepEqual(links.slice(1).map((l) => l.url.length), [2000, 6000, 8000]);
    for (const l of links) {
      const u = new URL(l.url);
      assert.equal(u.pathname, `/${p.repo}/new/main`);
      assert.equal(u.searchParams.get('value'), l.content, 'content round-trips byte for byte');
      assert.ok(!l.path.startsWith('decisions/'));
    }
    assert.equal(links[0].content, EXP004_SHORT);
  }
});

test('EXP-001 plan: 300 polls alternating between two repositories, 20 cold loads (10 each) and 20 heavy calls', () => {
  const steps = plan(CONFIG.projects, 'Personal-Org-Operating-Model');
  const count = (set) => steps.filter((s) => s.set === set).length;
  assert.equal(count('H1'), 300);
  assert.equal(count('H2'), 20);
  assert.equal(count('H3'), 20);
  assert.equal(steps.filter((s) => s.set === 'H2' && s.project === 'Service-Desk').length, 10);
  assert.ok(steps.filter((s) => s.set === 'H3').every((s) => s.project === 'Personal-Org-Operating-Model'));
  const h1 = steps.filter((s) => s.set === 'H1');
  assert.ok(h1.every((s, i) => s.project === CONFIG.projects[i % 2].name));
});

test('EXP-001 heaviest case: docs/LEDGER.md first, then the largest docs/ and specs/ blobs, 25 in all', () => {
  const tree = new Map([['docs/LEDGER.md', { sha: 'a'.repeat(40), size: 128438 }], ['src/big.js', { sha: 'b'.repeat(40), size: 999999 }]]);
  for (let i = 0; i < 30; i++) tree.set(`specs/S-${i}.md`, { sha: i.toString(16).padStart(40, 'c'), size: 1000 + i });
  const picked = heavyBlobs(tree);
  assert.equal(picked.length, 25);
  assert.equal(picked[0].path, 'docs/LEDGER.md');
  assert.equal(picked[1].path, 'specs/S-29.md');
  assert.ok(!picked.some((b) => b.path === 'src/big.js'));
});

test('EXP-001 run: drives the function on schedule, records each call, stops when hidden, and summarises per set', async () => {
  const clock = fakeClock(Date.parse('2026-11-12T15:00:00Z'));
  const repos = {
    'Service-Desk': repo({ 'status/P-001.toml': 'state = "ready"\n', 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml') }),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), 'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md') }),
  };
  const server = fakeServer(repos, CONFIG, clock);
  let t = 0;
  const vis = { v: true };
  const run = createRun({ config: CONFIG, call: server.call, clock, perf: () => (t += 120), isVisible: () => vis.v });
  const done = run.start();
  await clock.flush();
  await clock.runUntil(clock.now() + 40 * STEP_MS);
  assert.ok(run.index >= 35 && run.index <= 41, `step ${run.index}`);
  const sets = new Set(run.calls.map((c) => c.set));
  for (const s of ['H1', 'H2', 'H3']) assert.ok(sets.has(s), s);
  assert.ok(run.calls.every((c) => c.status === 200 && c.wallMs === 120 && c.github === 3));
  vis.v = false;
  await clock.runUntil(clock.now() + 2 * STEP_MS);
  await done;
  assert.equal(run.state, 'stopped');
  assert.match(run.message, /tab was hidden/);
  const s = summarize(run);
  assert.equal(s.sets.H1.error1102, 0);
  assert.equal(s.sets.H1.pass, true);
  assert.ok(s.repos['Service-Desk'].files >= 2);
  assert.equal(s.repos['Service-Desk'].coldBlobCallsMax, 1);
  const md = resultMarkdown(s);
  assert.match(md, /^# EXP-001 result/);
  assert.match(md, /\| H1 \| \d+ \| 0 \| 0 \| 0 \|/);
  assert.match(rawTable(run), /\| 1 \| H1 \| Service-Desk \| \/api\/poll \| 200 \|/);
});

test('EXP-001 summary: a Cloudflare 1102, a slow call and a call that never reached the function', () => {
  const run = { calls: [
    { set: 'H2', completed: false, cfError: 1102, wallMs: 50, excluded: false },
    { set: 'H2', completed: true, cfError: null, wallMs: 31_000, excluded: false, bytes: 10, github: 25 },
    { set: 'H2', completed: false, cfError: null, wallMs: 5, excluded: true },
    { set: 'H1', completed: true, cfError: null, wallMs: 200, excluded: false, reason: 'rate-limit' },
  ], trees: {}, coldBlobCalls: {}, largestBlob: 0, state: 'done' };
  const s = summarize(run);
  assert.equal(s.sets.H2.error1102, 1);
  assert.equal(s.sets.H2.wallFailures, 1);
  assert.equal(s.sets.H2.notCompleted, 1);
  assert.equal(s.sets.H2.excluded, 1);
  assert.equal(s.sets.H2.pass, false);
  assert.equal(s.sets.H1.rateLimited, 1);
  assert.equal(s.sets.H3.pass, false, 'a set with no calls has not passed');
});
