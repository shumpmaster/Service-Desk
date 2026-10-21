// ac-test: S-001/AC73 — from stage 1b of "The desk as mockup v2" (AC73's note, "Changed by AC80"):
// for the same records and the same reads, the sender's set equals the board's "Waiting on you" and
// "Kicked back" before any mark, each pull request J22's rule 0 finds with the agents left out on
// both sides, judged by one module (src/lib/j22.js) through two input layers: the page's real
// scheduler on the fake desk function, and the sender's collect step on the fake GitHub
// (tests/desk/rule0-fixture.mjs). Every record here is made up (NOT real records).
// join-test: S-001/J16 (rule 0 in the sender, against the board's).

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cleanScratch } from './notify-helpers.mjs';
import { scenario, verdict, pageSide, senderSide, headOf, prKey } from './rule0-fixture.mjs';

after(cleanScratch);

const SD = 'Service-Desk';
const POOM_NAME = 'Personal-Org-Operating-Model';
const AFTER = { state: 'pending', description: 'Owner: after agents · 2 other finding(s)' };
const TRIP = { state: 'error', description: 'CI code changed · check the PR' };
const src = (n, path = `src/lib/m${n}.js`) => ({ filename: path, status: 'modified' });
const PASS = 'Verdict: PASS\n';

async function both(sc, opts = {}) {
  const page = await pageSide(sc, opts.page || {});
  const sender = await senderSide(sc, opts.sender || {});
  assert.equal(sender.c.read, true, sender.c.why);
  return { page, sender };
}

test('AC73 + AC80: the sender\'s set equals the board\'s "Waiting on you" and "Kicked back" before any mark; AC80\'s with-the-agents pull requests (a missing verdict, a FAIL, neither, "Owner: after agents") left out on both sides', async () => {
  const sc = scenario({});
  sc.pulls.push({ n: 900, created: '2026-10-18T01:00:00Z', files: [src(900)] }); // waiting on the Reviewer's verdict
  sc.pulls.push({ n: 901, created: '2026-10-18T02:00:00Z', files: [src(901), verdict(sc, 901, 'reviewer', 'Verdict: FAIL\n')] });
  sc.pulls.push({ n: 902, created: '2026-10-18T03:00:00Z', files: [src(902), verdict(sc, 902, 'reviewer', 'Verdict: perhaps\n')] });
  sc.pulls.push({ n: 903, created: '2026-10-18T04:00:00Z', files: [src(903), verdict(sc, 903, 'reviewer', PASS)] });
  sc.statuses[headOf(903)] = AFTER;
  // Cards: a Reviewer's PASS in, an owner-required one by class with "Owner verdict needed", a design change with both verdicts in.
  sc.pulls.push({ n: 904, created: '2026-10-18T05:00:00Z', files: [src(904), verdict(sc, 904, 'reviewer', 'Verdict: PASS\n\n904\n')] });
  sc.pulls.push({ n: 905, created: '2026-10-18T06:00:00Z', files: [{ filename: '.claude/agents/x.md', status: 'modified' }, verdict(sc, 905, 'reviewer', 'Verdict: PASS\n\n905\n')] });
  sc.statuses[headOf(905)] = { state: 'pending', description: 'Owner verdict needed · R3' };
  sc.pulls.push({ n: 906, created: '2026-10-18T07:00:00Z', files: [src(906, 'src/public/app.js'), verdict(sc, 906, 'reviewer', 'Verdict: PASS\n\n906\n'),
    verdict(sc, 906, 'design-reviewer', 'Verdict: PASS\n\nd906\n')] });
  // Not counted on either side: a draft, and a pull request into another branch.
  sc.pulls.push({ n: 907, draft: true, files: [src(907)] });
  const { page, sender } = await both(sc, { page: { polls: 4 } });
  assert.deepEqual(sender.keys, [prKey(SD, 904), prKey(SD, 905), prKey(SD, 906)]);
  assert.deepEqual(sender.keys, page.keys, 'the same set');
  assert.deepEqual(sender.agents, [900, 901, 902, 903]);
  assert.deepEqual(page.agents, sender.agents, 'with the agents alike');
});

test('AC73: a verdict blob unread on the page and failing in the sender counts as given on both: a card, and in the set', async () => {
  const sc = scenario({});
  const v = verdict(sc, 910, 'reviewer', 'Verdict: FAIL\n');
  sc.pulls.push({ n: 910, files: [src(910), v] });
  const { page, sender } = await both(sc, { page: { blobFail: [v.sha] }, sender: { world: (w) => { w.fail[`/repos/shumpmaster/Service-Desk/git/blobs/${v.sha}`] = 502; } } });
  assert.deepEqual(sender.keys, [prKey(SD, 910)]);
  assert.deepEqual(page.keys, sender.keys);
  // Read on both: FAIL, with the agents on both.
  const ok = await both(sc);
  assert.deepEqual([ok.page.agents, ok.sender.agents], [[910], [910]]);
});

test('AC73: (i) applies only to a public v3 project, on both sides: a private v2.5 project\'s pull request whose only sign of rule 0 is "Owner: after agents" counts on both; the same in a public v3 project is left out on both', async () => {
  for (const [model, priv, counted] of [['v2.5', true, true], ['v3', true, true], ['v3', false, false]]) {
    const sc = scenario({ model, priv });
    sc.pulls.push({ n: 920, files: [src(920), verdict(sc, 920, 'reviewer', PASS)] });
    sc.statuses[headOf(920)] = AFTER;
    const { page, sender } = await both(sc);
    const key = prKey(model === 'v3' ? SD : POOM_NAME, 920);
    assert.deepEqual(sender.keys, counted ? [key] : [], `${model} ${priv ? 'private' : 'public'}`);
    assert.deepEqual(page.keys, sender.keys, `${model} ${priv ? 'private' : 'public'}: alike`);
    assert.deepEqual(sender.statusShas, counted ? [] : [headOf(920)]);
  }
});

test('AC73: a new head carries no rule 0 outcome over, on either side', async () => {
  const sc = scenario({});
  sc.pulls.push({ n: 930, files: [src(930), verdict(sc, 930, 'reviewer', PASS)] });
  sc.statuses[headOf(930)] = AFTER;
  const a = await both(sc);
  assert.deepEqual([a.page.agents, a.sender.agents], [[930], [930]]);
  // Head B: nothing posted at B yet.
  sc.pulls[0].sha = headOf(930, 1);
  const pageB = await pageSide(sc, { last: a.page.keep });
  const senderB = await senderSide(sc, { last: a.sender.c.rule0.part });
  assert.deepEqual(senderB.keys, [prKey(SD, 930)]);
  assert.deepEqual(pageB.keys, senderB.keys);
});

test('AC73 draft 3: five open pull requests in a public v3 project, each with "Owner: after agents" and its reviewers\' verdicts in: the three heads ownerCheckHeads chooses left out on both sides, the fourth and fifth counted on both (the owner check "not read")', async () => {
  const sc = scenario({});
  for (let i = 0; i < 5; i++) {
    const n = 940 + i;
    sc.pulls.push({ n, created: `2026-10-18T0${i + 1}:00:00Z`, files: [src(n), verdict(sc, n, 'reviewer', `Verdict: PASS\n\n${n}\n`)] });
    sc.statuses[headOf(n)] = AFTER;
  }
  const { page, sender } = await both(sc, { page: { polls: 4 } });
  assert.deepEqual(sender.agents, [940, 941, 942]);
  assert.deepEqual(page.agents, sender.agents);
  assert.deepEqual(sender.keys, [prKey(SD, 943), prKey(SD, 944)]);
  assert.deepEqual(page.keys, sender.keys);
  assert.deepEqual(page.ownerHeads, sender.statusShas);
});

test('AC73 draft 3: the four verdict texts of J22\'s test (a trailing space, a CR, a tab, a byte-order mark) read PASS on both: a card on the board, and in the set', async () => {
  const sc = scenario({});
  const texts = ['Verdict: PASS \n', 'Verdict: PASS\r\nAny suggestions to commit along with the verdict:\r\n', 'Verdict: PASS\t\n', '﻿Verdict: PASS\n'];
  texts.forEach((t, i) => sc.pulls.push({ n: 950 + i, created: `2026-10-18T0${i + 1}:00:00Z`, files: [src(950 + i), verdict(sc, 950 + i, 'reviewer', t)] }));
  const { page, sender } = await both(sc, { page: { polls: 4 } });
  assert.deepEqual(sender.keys, [950, 951, 952, 953].map((n) => prKey(SD, n)));
  assert.deepEqual(page.keys, sender.keys);
  assert.deepEqual([page.agents, sender.agents], [[], []]);
});

test('AC73 draft 4: an owner-required pull request by class with its Reviewer\'s PASS and "Owner: after agents" is left out on both; with the tripwire\'s error it counts on both; with the sender\'s owner-check reads skipped near the floor, the sender counts it while the board leaves it out (the one way the two may differ: a needless notification only)', async () => {
  const mk = (status) => {
    const sc = scenario({});
    sc.pulls.push({ n: 960, files: [{ filename: '.claude/agents/x.md', status: 'modified' }, verdict(sc, 960, 'reviewer', PASS)] });
    sc.statuses[headOf(960)] = status;
    return sc;
  };
  const a = await both(mk({ state: 'pending', description: 'Owner: after agents · 1 other finding(s)' }));
  assert.deepEqual([a.page.keys, a.sender.keys], [[], []]);
  const t = await both(mk(TRIP));
  assert.deepEqual(t.sender.keys, [prKey(SD, 960)]);
  assert.deepEqual(t.page.keys, t.sender.keys);
  const near = await both(mk({ state: 'pending', description: 'Owner: after agents · 1 other finding(s)' }), {
    sender: { world: (w) => { w.remaining = '399'; } } });
  assert.equal(near.sender.c.rule0.skipped, true);
  assert.deepEqual(near.page.keys, [], 'the board leaves it out (it reads the check on its own)');
  assert.deepEqual(near.sender.keys, [prKey(SD, 960)], 'the sender counts it: a needless notification, never a hidden one');
});
