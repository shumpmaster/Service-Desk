// join-test: S-001/J16 — "Rule 0 in the sender" (stage 1b of "The desk as mockup v2"): the sender's
// set leaves out a pull request J22's rule 0 finds with the agents, through the shared module
// (src/lib/j22.js) fed the page's inputs; its reads (each verdict blob by its sha, once; a verdict
// file on the default branch from the checkout; the owner check only where the page reads it, for
// the heads `ownerCheckHeads` chooses, conditional, last in the run, skipped below 400 left), and
// J16's failure rules. Real-on-real against the page's real scheduler for Service-Desk's real pull
// requests #126, #128, #130, #135 and #148 (tests/desk/fixtures/j22/, README there); every other
// case made up (NOT real records), labelled so.
// join-test: S-001/J18 (rule 0's memory: verdicts by blob sha, owner-check ETags) — its own cases in
// notify-j18-rule0.test.mjs; here as each read case needs it.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { FIX } from './helpers.mjs';
import { cleanScratch, harness, makeWorld, checkoutOf, pull, REPO, MIN } from './notify-helpers.mjs';
import { scenario, verdict, pageSide, senderSide, headOf, prKey, blobSha, RISK, STATE_KEY } from './rule0-fixture.mjs';
import { ruleZero, verdictOf, ownerChecksApply, AGENTS_WORDS, OWNER_CHECK_HEADS } from '../../src/lib/j22.js';
import { OWNER_CHECK_FLOOR, VERDICT_MAX_BYTES } from '../../src/notify/rule0.mjs';
import { verdictHash, headHash, openRule0 } from '../../src/notify/state.mjs';
import { openCheckout } from '../../src/notify/checkout.mjs';

after(cleanScratch);

const SD = 'Service-Desk';
const J = join(FIX, 'j22');
const read = (f) => readFileSync(join(J, f), 'utf8');
const AFTER = { state: 'pending', description: 'Owner: after agents · 2 other finding(s)' };
const TRIP = { state: 'error', description: 'CI code changed · check the PR' };
const src = (n, path = `src/lib/m${n}.js`) => ({ filename: path, status: 'modified' });
const PASS = 'Verdict: PASS\n';

// ---------------------------------------------------------------------------
// Real-on-real

const REAL = [126, 128, 130, 135, 148];
const HEADS = { 126: '153824c7240a1741da4f79aa14a9b31a2336273b', 128: 'f8f54efc82464cb95fd670ac65b27e08b6435d61', 130: '58923ad6f3ea20efb23b1fc8553be05b898d9dd2',
  135: 'a00be9ddb0cf1eb9e91cef361ac3b4b87d4160c6', 148: 'd1d964bac673f079df3b4c2fd35b853cd8813809' };
const TOML = { 126: 'risk-paths-pr126.toml', 128: 'risk-paths-pr126.toml', 130: 'risk-paths-304144d.toml', 135: 'risk-paths-304144d.toml', 148: 'risk-paths-pr148.toml' };
const realFiles = (n) => [1, 2].map((k) => `files-${n}-p${k}.json`).filter((f) => existsSync(join(J, f))).flatMap((f) => JSON.parse(read(f)));
const REAL_BLOBS = Object.fromEntries(readdirSync(join(J, 'blobs')).map((sha) => [sha, readFileSync(join(J, 'blobs', sha), 'utf8')]));

function realScenario(n, { dropReviewer = false } = {}) {
  const sc = scenario({ tree: { 'governance/risk-paths.toml': read(TOML[n]) } });
  let files = realFiles(n);
  if (dropReviewer) files = files.filter((f) => f.filename !== `reviews/${n}/reviewer.md`);
  sc.pulls.push({ n, sha: HEADS[n], created: '2026-10-19T15:00:00Z', files });
  Object.assign(sc.blobs, REAL_BLOBS);
  sc.statuses[HEADS[n]] = read(`status-${n}.json`);
  return sc;
}

test('J16 rule 0, real-on-real: the sender\'s rule 0 equals the page\'s for #126, #128, #130, #135 and #148 (their recorded file lists, their real verdict blobs and statuses): none with the agents; without the Reviewer\'s verdict, each that needs one is', async () => {
  for (const n of REAL) {
    for (const dropReviewer of [false, true]) {
      const sc = realScenario(n, { dropReviewer });
      const page = await pageSide(sc);
      const s = await senderSide(sc);
      assert.equal(s.c.read, true, `#${n}: ${s.c.why}`);
      assert.deepEqual(s.agents, page.agents, `#${n} (reviewer dropped: ${dropReviewer}): the same pull requests with the agents`);
      assert.deepEqual(s.keys, page.keys, `#${n}: the same cards`);
      // The same module's answer, fed the page's own context (its real scheduler's reads).
      const prPage = page.model.pulls.find((p) => p.number === n);
      assert.deepEqual(s.c.rule0.outcomes.get(n), ruleZero(prPage, page.ctx), `#${n}: ruleZero alike`);
      // #126 is R0 (no reviewer); the others need the Reviewer (review_check.py pr's "Required reviews").
      assert.equal(s.agents.includes(n), dropReviewer && n !== 126, `#${n}`);
      if (dropReviewer && n !== 126) assert.deepEqual(s.c.rule0.outcomes.get(n).waits, ["Waiting on Reviewer's verdict"]);
    }
  }
});

// ---------------------------------------------------------------------------
// (ii), the verdicts

test('J16 rule 0 (made-up, NOT real): a required reviewer\'s verdict missing, a FAIL and one reading neither each leave the pull request out; a PASS keeps it in the set', async () => {
  const sc = scenario({});
  sc.pulls.push({ n: 601, files: [src(601)] });
  sc.pulls.push({ n: 602, files: [src(602), verdict(sc, 602, 'reviewer', 'Verdict: FAIL\nfix the tests\n')] });
  sc.pulls.push({ n: 603, files: [src(603), verdict(sc, 603, 'reviewer', 'Verdict: maybe\n')] });
  sc.pulls.push({ n: 604, files: [src(604), verdict(sc, 604, 'reviewer', PASS)] });
  // A design reviewer, by the [paths."src/public/**"] table.
  sc.pulls.push({ n: 605, files: [src(605, 'src/public/app.js'), verdict(sc, 605, 'reviewer', PASS)] });
  const s = await senderSide(sc);
  assert.deepEqual(s.agents, [601, 602, 603, 605]);
  assert.deepEqual(s.keys, [prKey(SD, 604)]);
  const w = (n) => s.c.rule0.outcomes.get(n).waits;
  assert.deepEqual(w(601), ["Waiting on Reviewer's verdict"]);
  assert.deepEqual(w(602), ['Reviewer asked for changes']);
  assert.deepEqual(w(603), ["Reviewer's verdict reads neither PASS nor FAIL"]);
  assert.deepEqual(w(605), ["Waiting on Design reviewer's verdict"]);
  // Each verdict blob read once, by its sha (PASS twice in the lists, one read).
  assert.equal(s.w.blobReads, 3);
  assert.ok(s.w.ghCalls.filter((x) => x.path.includes('/git/blobs/')).every((x) => /\/git\/blobs\/[0-9a-f]{40}$/.test(x.path)));
});

test('J16 rule 0 (made-up, NOT real): a verdict blob whose read fails, is refused, answers 404, is over 1 MB, isn\'t UTF-8 text or is not in form counts as given, so the pull request is in the set; it is not kept, and is asked again next run', async () => {
  const cases = {
    'a failed read (502)': (w, sha) => { w.fail[`/repos/${REPO}/git/blobs/${sha}`] = 502; },
    'refused (403)': (w, sha) => { w.fail[`/repos/${REPO}/git/blobs/${sha}`] = 403; },
    'a 404': (w, sha) => { delete w.gitBlobs[sha]; },
    'over 1 MB': (w, sha) => { w.blobAnswer = (x) => (x === sha ? { status: 200, body: { sha, size: VERDICT_MAX_BYTES + 1, encoding: 'base64', content: 'VmVyZGljdDogRkFJTAo=' } } : null); },
    'over 1 MB, the answer itself': (w, sha) => { w.blobAnswer = (x) => (x === sha ? { status: 200, body: { sha, size: 3, encoding: 'base64', content: 'A'.repeat(2 * 1024 * 1024) } } : null); },
    'not UTF-8 text': (w, sha) => { w.blobAnswer = (x) => (x === sha ? { status: 200, body: { sha, size: 4, encoding: 'base64', content: Buffer.from([0xff, 0xfe, 0x00, 0x41]).toString('base64') } } : null); },
    'another blob\'s bytes': (w, sha) => { w.blobAnswer = (x) => (x === sha ? { status: 200, body: { sha, size: 14, encoding: 'base64', content: Buffer.from('Verdict: PASS\n').toString('base64') } } : null); },
    'another sha': (w, sha) => { w.blobAnswer = (x) => (x === sha ? { status: 200, body: { sha: 'f'.repeat(40), size: 14, encoding: 'base64', content: Buffer.from('Verdict: FAIL\n').toString('base64') } } : null); },
    'not JSON': (w, sha) => { w.blobAnswer = (x) => (x === sha ? { status: 200, body: 'not json' } : null); },
  };
  for (const [name, breakIt] of Object.entries(cases)) {
    const sc = scenario({});
    const v = verdict(sc, 610, 'reviewer', 'Verdict: FAIL\n');
    sc.pulls.push({ n: 610, files: [src(610), v] });
    const s = await senderSide(sc, { world: (w) => breakIt(w, v.sha) });
    assert.equal(s.c.read, true, name);
    assert.deepEqual(s.keys, [prKey(SD, 610)], `${name}: counted as given, so in the set`);
    assert.equal(s.c.rule0.part.v[verdictHash(STATE_KEY, v.sha)], undefined, `${name}: not kept`);
    // The next run asks again, and this time reads FAIL.
    const s2 = await senderSide(sc, { last: s.c.rule0.part });
    assert.equal(s2.w.blobReads, 1, `${name}: asked again`);
    assert.deepEqual(s2.agents, [610], `${name}: read at last`);
  }
});

test('J16 + J18 (made-up, NOT real): a kept blob sha is not read again on the next run, at the same head, nor at a new head holding the same file', async () => {
  const sc = scenario({});
  sc.pulls.push({ n: 620, files: [src(620), verdict(sc, 620, 'reviewer', 'Verdict: FAIL\n')] });
  const s1 = await senderSide(sc);
  assert.equal(s1.w.blobReads, 1);
  assert.deepEqual(s1.agents, [620]);
  const s2 = await senderSide(sc, { last: s1.c.rule0.part });
  assert.equal(s2.w.blobReads, 0, 'the same head: nothing read');
  assert.deepEqual(s2.agents, [620]);
  sc.pulls[0].sha = headOf(620, 1);
  sc.pulls[0].files = [src(620), src(620, 'src/lib/other.js'), sc.pulls[0].files[1]];
  const s3 = await senderSide(sc, { last: s2.c.rule0.part });
  assert.equal(s3.w.blobReads, 0, 'a new head holding the same file: nothing read');
  assert.deepEqual(s3.agents, [620]);
});

test('J16 rule 0 (made-up; real verdict-reader answers, tests/desk/fixtures/README.md): the four PASS texts (a trailing space, a CR, a tab, a byte-order mark) read PASS through the sender\'s blob read, so the pull request leaves rule 0; "pass" and no Verdict: line read neither', async () => {
  // review_check.parse_verdict's answers on the same texts, recorded in tests/desk/fixtures/README.md (stage 1a).
  const texts = [['Verdict: PASS \n', 'PASS'], ['Verdict: PASS\r\nAny suggestions to commit along with the verdict:\r\n', 'PASS'], ['Verdict: PASS\t\n', 'PASS'],
    ['﻿Verdict: PASS\n', 'PASS'], ['Verdict: pass\n', 'other'], ['No verdict line here\n', null]];
  for (const [text, want] of texts) {
    assert.equal(verdictOf(text), want);
    const sc = scenario({});
    sc.pulls.push({ n: 630, files: [src(630), verdict(sc, 630, 'reviewer', text)] });
    const s = await senderSide(sc);
    assert.equal(s.agents.includes(630), want !== 'PASS', JSON.stringify(text));
    assert.equal(s.c.rule0.part.v[verdictHash(STATE_KEY, blobSha(text))], want === 'PASS' ? 'PASS' : 'neither', 'kept as its word');
  }
});

test('J16 rule 0 (made-up, NOT real): a required reviewer\'s verdict only on the default branch\'s checkout counts, read with no request; the same file shown removed in the list does not; one reading FAIL there leaves the pull request out', async () => {
  const sc = scenario({ tree: { 'governance/risk-paths.toml': RISK, 'reviews/640/reviewer.md': PASS, 'reviews/641/reviewer.md': PASS, 'reviews/642/reviewer.md': 'Verdict: FAIL\n' } });
  sc.pulls.push({ n: 640, files: [src(640)] });
  sc.pulls.push({ n: 641, files: [src(641), { filename: 'reviews/641/reviewer.md', status: 'removed' }] });
  sc.pulls.push({ n: 642, files: [src(642)] });
  const s = await senderSide(sc);
  assert.deepEqual(s.keys, [prKey(SD, 640)]);
  assert.deepEqual(s.agents, [641, 642]);
  assert.equal(s.w.blobReads, 0, 'the checkout, no request');
  // The page alike.
  const page = await pageSide(sc);
  assert.deepEqual(page.keys, s.keys);
  assert.deepEqual(page.agents, s.agents);
});

// ---------------------------------------------------------------------------
// (i), the owner check

test('J16 rule 0 (made-up, NOT real): the owner check: a 200 reading "Owner: after agents" leaves the pull request out; next run it is asked with its ETag and a 304 gives the kept answer; a failed or refused read is "not read", so (i) does not hold', async () => {
  const sc = scenario({});
  sc.pulls.push({ n: 650, files: [src(650), verdict(sc, 650, 'reviewer', PASS)] });
  sc.statuses[headOf(650)] = AFTER;
  const s1 = await senderSide(sc);
  assert.deepEqual(s1.statusShas, [headOf(650)]);
  assert.deepEqual(s1.agents, [650]);
  assert.deepEqual(s1.c.rule0.outcomes.get(650).waits, [AGENTS_WORDS]);
  const kept = s1.c.rule0.part.h[headHash(STATE_KEY, SD, 650, headOf(650))];
  assert.equal(kept.state, 'pending');
  assert.equal(kept.after, true);
  assert.match(kept.etag, /^W\/"[0-9a-f]{40}"$/);
  const s2 = await senderSide(sc, { last: s1.c.rule0.part });
  const call = s2.w.ghCalls.find((x) => x.path.includes('/status'));
  assert.equal(new Headers(call.headers).get('if-none-match'), kept.etag, 'its ETag sent back');
  assert.equal(s2.w.status304, 1);
  assert.deepEqual(s2.agents, [650], 'a 304: the kept answer');
  assert.deepEqual(s2.c.rule0.part.h[headHash(STATE_KEY, SD, 650, headOf(650))], kept);
  for (const status of [502, 403, 404]) {
    const s3 = await senderSide(sc, { last: s1.c.rule0.part, world: (w) => { w.fail[`/repos/${REPO}/commits/${headOf(650)}/status`] = status; } });
    assert.deepEqual(s3.keys, [prKey(SD, 650)], `${status}: not read, so in the set`);
    assert.deepEqual(s3.c.rule0.part.h[headHash(STATE_KEY, SD, 650, headOf(650))], kept, `${status}: the kept ETag stays for the next run`);
  }
  // Malformed: not read, nothing kept from it.
  const s4 = await senderSide(sc, { world: (w) => { w.statuses[headOf(650)] = 'not json'; } });
  assert.deepEqual(s4.keys, [prKey(SD, 650)]);
  // None posted yet: read, (i) does not hold.
  const s5 = await senderSide(sc, { world: (w) => { delete w.statuses[headOf(650)]; } });
  assert.deepEqual(s5.keys, [prKey(SD, 650)]);
});

test('J16 rule 0 (made-up, NOT real): a private repository and a v2.5 project never read the owner check (Workflow 4); (ii) still judges', async () => {
  // The one rule both sides use (src/lib/j22.js): v3, and every listed pull request's base repository public.
  const v3 = { model: 'v3' };
  assert.equal(ownerChecksApply(v3, [{ baseRepoPrivate: false }, { baseRepoPrivate: false }]), true);
  assert.equal(ownerChecksApply(v3, [{ baseRepoPrivate: false }, { baseRepoPrivate: null }]), false, 'not given: not read');
  assert.equal(ownerChecksApply(v3, [{ baseRepoPrivate: true }]), false);
  assert.equal(ownerChecksApply(v3, []), false, 'no pull request lists it');
  assert.equal(ownerChecksApply({ model: 'v2.5' }, [{ baseRepoPrivate: false }]), false);
  for (const [model, priv] of [['v3', true], ['v2.5', true], ['v2.5', false]]) {
    const sc = scenario({ model, priv });
    sc.pulls.push({ n: 660, files: [src(660), verdict(sc, 660, 'reviewer', PASS)] });
    sc.pulls.push({ n: 661, files: [src(661)] });
    sc.statuses[headOf(660)] = AFTER;
    const s = await senderSide(sc);
    assert.equal(s.c.read, true, s.c.why);
    assert.deepEqual(s.statusShas, [], `${model} ${priv ? 'private' : 'public'}: no status read`);
    const name = model === 'v3' ? SD : 'Personal-Org-Operating-Model';
    assert.deepEqual(s.keys, [prKey(name, 660)], 'its only sign "Owner: after agents": counted');
    assert.deepEqual(s.agents, [661], '(ii) still applies');
  }
});

test('J16 rule 0 (made-up, NOT real): a fork\'s pull request and one listing 300 files or more are judged by (i) alone', async () => {
  const sc = scenario({});
  sc.pulls.push({ n: 670, headRepo: 'someone/Service-Desk' });
  const many = Array.from({ length: 300 }, (_, i) => ({ filename: `src/lib/f${i}.js`, status: 'modified' }));
  sc.pulls.push({ n: 671, files: many });
  const s = await senderSide(sc);
  assert.deepEqual(s.keys, [prKey(SD, 670), prKey(SD, 671)], 'no verdict, yet no (ii): in the set');
  assert.ok(!s.w.ghCalls.some((x) => x.path.includes('/pulls/670/files')), 'a fork is never read for files');
  sc.statuses[headOf(670)] = AFTER;
  sc.statuses[headOf(671)] = AFTER;
  const s2 = await senderSide(sc);
  assert.deepEqual(s2.agents, [670, 671], '(i) alone');
});

test('J16 rule 0 (made-up, NOT real): the checkout\'s governance/risk-paths.toml missing, unreadable as TOML, or not UTF-8: every pull request judged by (i) alone', async () => {
  for (const [name, tree] of [['missing', {}], ['not TOML', { 'governance/risk-paths.toml': '[classes\nR1 = 3\n' }],
    ['not UTF-8', { 'governance/risk-paths.toml': Buffer.from([0xff, 0xfe, 0x5b]) }]]) {
    const sc = scenario({ tree: { 'README.md': '# Service Desk\n', ...tree } });
    sc.pulls.push({ n: 680, files: [src(680)] });
    sc.pulls.push({ n: 681, files: [src(681)] });
    sc.statuses[headOf(681)] = AFTER;
    const s = await senderSide(sc);
    assert.equal(s.c.read, true, name);
    assert.deepEqual(s.keys, [prKey(SD, 680)], `${name}: no (ii)`);
    assert.deepEqual(s.agents, [681], `${name}: (i) alone`);
  }
});

test('J16 rule 0 (made-up, NOT real): never across heads: with the agents at head A, by (i) and by (ii); at head B nothing is carried over', async () => {
  const sc = scenario({});
  sc.pulls.push({ n: 690, files: [src(690), verdict(sc, 690, 'reviewer', PASS)] });
  sc.pulls.push({ n: 691, files: [src(691)] });
  sc.statuses[headOf(690)] = AFTER;
  const a = await senderSide(sc);
  assert.deepEqual(a.agents, [690, 691]);
  // Head B for each: no owner check posted at B yet; #691's verdict commit gives PASS.
  sc.pulls[0].sha = headOf(690, 1);
  sc.pulls[1].sha = headOf(691, 1);
  sc.pulls[1].files = [src(691), verdict(sc, 691, 'reviewer', PASS)];
  const b = await senderSide(sc, { last: a.c.rule0.part });
  assert.deepEqual(b.agents, []);
  assert.deepEqual(b.keys, [prKey(SD, 690), prKey(SD, 691)]);
  assert.equal(b.c.rule0.part.h[headHash(STATE_KEY, SD, 690, headOf(690))], undefined, 'head A\'s entry dropped: the head moved');
});

test('J16 + J18 rule 0 (made-up, NOT real): rule 0 ending makes the pull request new, notified once', async () => {
  const sc = scenario({});
  sc.pulls.push({ n: 700, files: [src(700)] });
  const co = checkoutOf({ base: { ...sc.tree } });
  const w = makeWorld();
  w.pulls = [pull(700, { sha: headOf(700), private: false })];
  w.files[700] = sc.pulls[0].files;
  const h = harness({ checkout: co, world: w });
  const r1 = await h.run();
  assert.equal(r1.code, 0);
  assert.ok(r1.logs.some((l) => /1 with the agents/.test(l)), r1.logs.join('\n'));
  assert.equal(r1.payloads.length, 1, 'the start-up summary');
  assert.equal(r1.payloads[0].notification.body, 'Notifications are on: nothing waits on you now');
  const r2 = await h.run();
  assert.equal(r2.pushes.length, 0, 'still with the agents: nothing');
  // The Reviewer's PASS lands: head B.
  const v = verdict(sc, 700, 'reviewer', PASS);
  w.pulls = [pull(700, { sha: headOf(700, 1), private: false })];
  w.files[700] = [src(700), v];
  w.gitBlobs[v.sha] = PASS;
  const r3 = await h.run();
  assert.equal(r3.payloads.length, 1, 'newly waiting: one notification');
  assert.equal(r3.payloads[0].notification.navigate, `https://desk.example.invalid/?sandbox&open=${encodeURIComponent(prKey(SD, 700))}`);
  const r4 = await h.run();
  assert.equal(r4.pushes.length, 0, 'once');
  assert.equal(w.blobReads, 1, 'its verdict read once, then kept');
});

// ---------------------------------------------------------------------------
// The heads, the order and the floor

test('J16 + J22 (made-up, NOT real): ownerCheckHeads on five open own-branch pull requests in a public v3 project: the sender reads the status for the same 3 heads as the page\'s poll call; the fourth and fifth are in the set, never left out by (i)', async () => {
  const sc = scenario({});
  for (let i = 0; i < 5; i++) {
    const n = 710 + i;
    sc.pulls.push({ n, created: `2026-10-18T0${i + 1}:00:00Z`, files: [src(n), verdict(sc, n, 'reviewer', `Verdict: PASS\n\nmade-up ${n}\n`)] });
    sc.statuses[headOf(n)] = AFTER;
  }
  const page = await pageSide(sc, { polls: 4 });
  const s = await senderSide(sc);
  assert.equal(OWNER_CHECK_HEADS, 3);
  assert.deepEqual(s.statusShas, [headOf(710), headOf(711), headOf(712)]);
  assert.deepEqual(page.ownerHeads, s.statusShas, 'one function, two input layers');
  assert.deepEqual(s.agents, [710, 711, 712]);
  assert.deepEqual(s.keys, [prKey(SD, 713), prKey(SD, 714)]);
  assert.deepEqual(page.keys, s.keys);
});

test('J16 draft 4 (made-up, NOT real): an owner-required pull request by class (a .claude/** change) with its Reviewer\'s PASS and "Owner: after agents" is chosen and left out; with the tripwire\'s error, chosen and in the set; one with the agents by (ii) is not chosen, its place going to the next; two alike in created_at, the lower number first, in either order', async () => {
  const mk = (trip, order) => {
    const sc = scenario({});
    const at = '2026-10-18T05:00:00Z';
    sc.pulls.push({ n: 720, created: '2026-10-18T01:00:00Z', files: [{ filename: '.claude/agents/x.md', status: 'modified' }, verdict(sc, 720, 'reviewer', PASS)] });
    sc.pulls.push({ n: 721, created: '2026-10-18T02:00:00Z', files: [src(721)] }); // with the agents by (ii)
    const later = [{ n: 724, created: at, files: [src(724), verdict(sc, 724, 'reviewer', PASS)] }, { n: 723, created: at, files: [src(723), verdict(sc, 723, 'reviewer', PASS)] },
      { n: 722, created: at, files: [src(722), verdict(sc, 722, 'reviewer', PASS)] }];
    sc.pulls.push(...(order ? later : [...later].reverse()));
    sc.statuses[headOf(720)] = trip ? TRIP : { state: 'pending', description: 'Owner: after agents · 1 other finding(s)' };
    return sc;
  };
  for (const order of [true, false]) {
    const s = await senderSide(mk(false, order));
    assert.deepEqual(s.statusShas, [headOf(720), headOf(722), headOf(723)], 'the (ii) one not chosen; ties by the lower number');
    assert.deepEqual(s.agents, [720, 721]);
    assert.deepEqual(s.keys, [prKey(SD, 722), prKey(SD, 723), prKey(SD, 724)]);
    const t = await senderSide(mk(true, order));
    assert.deepEqual(t.statusShas, [headOf(720), headOf(722), headOf(723)]);
    assert.deepEqual(t.agents, [721], 'the tripwire never gives (i): a card, and notified (the known limit, J22)');
  }
});

test('J16 (made-up, NOT real): the owner-check reads are the run\'s last GitHub reads, after every other read (a recorded order); after them only AC76\'s issue', async () => {
  const sc = scenario({});
  sc.pulls.push({ n: 730, files: [src(730), verdict(sc, 730, 'reviewer', PASS)] });
  sc.pulls.push({ n: 731, files: [src(731), verdict(sc, 731, 'reviewer', 'Verdict: PASS \n')] });
  sc.statuses[headOf(730)] = AFTER;
  const w = makeWorld();
  w.pulls = sc.pulls.map((p) => pull(p.n, { sha: headOf(p.n), private: false }));
  for (const p of sc.pulls) w.files[p.n] = p.files;
  w.gitBlobs = { ...sc.blobs };
  w.statuses = { ...sc.statuses };
  w.waiting = [{ id: 7101, status: 'waiting', display_title: 'deploy made-up' }];
  const h = harness({ checkout: checkoutOf({ base: { ...sc.tree } }), world: w });
  await h.run();
  const r = await h.run();
  const paths = r.ghCalls.map((x) => x.path.split('?')[0]);
  const first = paths.findIndex((p) => /\/commits\/[0-9a-f]{40}\/status$/.test(p));
  const last = paths.length - 1 - [...paths].reverse().findIndex((p) => /\/commits\/[0-9a-f]{40}\/status$/.test(p));
  assert.ok(first > 0);
  assert.ok(paths.slice(0, first).some((p) => p.endsWith('/actions/runs')), 'the deploys read before');
  assert.ok(paths.slice(0, first).some((p) => /\/pulls\/\d+\/files$/.test(p)), 'the files before');
  assert.ok(paths.slice(last + 1).every((p) => /\/issues$/.test(p)), `after them only AC76's issue: ${paths.slice(last + 1).join(' ')}`);
  const firstRun = h.runs[0].ghCalls.map((x) => x.path.split('?')[0]);
  const fb = firstRun.findIndex((p) => p.includes('/git/blobs/'));
  const fs = firstRun.findIndex((p) => /\/status$/.test(p));
  assert.ok(fb >= 0 && fs > fb, 'the verdict blobs before the owner checks');
});

test('J16 (made-up, NOT real): the last answer before the owner-check reads showing 399 left skips them all: (i) does not hold, the pull request is in the set, the kept ETag and answer stay; 400 reads them; no header skips them', async () => {
  const sc = scenario({});
  sc.pulls.push({ n: 740, files: [src(740), verdict(sc, 740, 'reviewer', PASS)] });
  sc.statuses[headOf(740)] = AFTER;
  const s1 = await senderSide(sc);
  assert.deepEqual(s1.agents, [740]);
  const hk = headHash(STATE_KEY, SD, 740, headOf(740));
  const kept = s1.c.rule0.part.h[hk];
  assert.equal(OWNER_CHECK_FLOOR, 400);
  for (const [rem, reads] of [['399', false], ['400', true], [null, false]]) {
    const s = await senderSide(sc, { last: s1.c.rule0.part, world: (w) => {
      w.remaining = '4000';
      w.remainingAt = (path) => (path.startsWith(`/repos/${REPO}/pulls?`) ? '4000' : rem);
    } });
    assert.equal(s.c.read, true);
    assert.equal(s.c.rule0.skipped, !reads, `${rem}`);
    assert.deepEqual(s.statusShas, reads ? [headOf(740)] : [], `${rem}: owner-check reads`);
    if (reads) assert.deepEqual(s.agents, [740], '400: read (a 304, the kept answer)');
    else {
      assert.deepEqual(s.keys, [prKey(SD, 740)], `${rem}: (i) not read, so in the set (a needless notification at worst)`);
      assert.deepEqual(s.c.rule0.part.h[hk], kept, `${rem}: the kept ETag and answer unchanged`);
    }
  }
  // A whole run at 399 throughout: the first answer passes the guard (300), the owner check is skipped, the run says so.
  const w = makeWorld();
  w.pulls = [pull(740, { sha: headOf(740), private: false })];
  w.files[740] = sc.pulls[0].files;
  w.gitBlobs = { ...sc.blobs };
  w.statuses = { ...sc.statuses };
  w.remaining = '399';
  const h = harness({ checkout: checkoutOf({ base: { ...sc.tree } }), world: w });
  const r = await h.run();
  assert.equal(r.code, 0);
  assert.ok(!r.ghCalls.some((x) => /\/status\?/.test(x.path)));
  assert.ok(r.logs.some((l) => /rule 0: the owner check not read for 1 head\(s\): under 400 requests left before it/.test(l)), r.logs.join('\n'));
  assert.equal(r.payloads.length, 1);
  assert.equal(r.payloads[0].notification.body, 'Notifications are on: 1 thing waits on you now');
});

test('J16 + J18 (made-up, NOT real): a quiet day on a fake clock, 288 runs: the memory holds the blob reads to the verdict commits and the status reads to at most 3 a run, each counted as a 200', async () => {
  const sc = scenario({});
  for (const n of [750, 751, 752, 753]) sc.pulls.push({ n, created: `2026-10-18T0${n - 749}:00:00Z`, files: [src(n)] });
  const co = checkoutOf({ base: { ...sc.tree } });
  const opened = openCheckout(co.root);
  const w = makeWorld();
  const heads = { 750: 0, 751: 0, 752: 0, 753: 0 };
  const setPulls = () => {
    w.pulls = sc.pulls.map((p) => pull(p.n, { sha: headOf(p.n, heads[p.n]), created: p.created, private: false }));
  };
  setPulls();
  for (const p of sc.pulls) w.files[p.n] = p.files;
  for (const n of [750, 751, 752, 753]) w.statuses[headOf(n, 0)] = AFTER;
  const h = harness({ checkout: () => opened, world: w });
  // Three verdict commits during the day, each a new head with a verdict file on it (a new blob each).
  const commits = { 60: 750, 140: 751, 220: 752 };
  let statusReads = 0;
  let maxRun = 0;
  for (let run = 0; run < 288; run++) {
    if (commits[run] != null) {
      const n = commits[run];
      heads[n]++;
      const v = verdict(sc, n, 'reviewer', `Verdict: PASS\n\nmade-up day ${run}\n`);
      w.files[n] = [src(n), v];
      w.gitBlobs[v.sha] = sc.blobs[v.sha];
      w.statuses[headOf(n, heads[n])] = { state: 'success', description: 'Owner not required' };
      setPulls();
    }
    const before = w.statusReads;
    const r = await h.run();
    assert.equal(r.code, 0);
    const n = w.statusReads - before;
    assert.ok(n <= 3, `run ${run}: ${n} status reads`);
    maxRun = Math.max(maxRun, n);
    statusReads += n;
  }
  assert.equal(w.blobReads, 3, 'one blob read per verdict file, at its commit');
  assert.equal(maxRun, 3);
  // Every status read counted as a 200 (J16: whether a 304 under a new run's token is uncounted is not known).
  const counted = w.ghCalls.filter((x) => /\/commits\/[0-9a-f]{40}\/status\?/.test(x.path)).length;
  assert.equal(counted, statusReads);
  assert.ok(w.status304 > 0 && w.status304 < statusReads, 'most answered 304 with the kept ETag, and each still counted');
  assert.ok(statusReads <= 288 * 3);
});
