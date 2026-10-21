// join-test: S-001/J22 — a pull request's risk class, its verdict files and GitHub's owner check →
// the board's step, and rule 0, "with the agents" (AC80; desk mockup v2, 2026-10-20). Real-on-real
// against the model's own tools at recorded commits (tests/desk/fixtures/j22/, README there), and
// made-up cases, each labelled NOT real.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { FIX } from './helpers.mjs';
import { parseRiskPaths, pathClass, requiredReviewers, pathFlags, ruleZero, ownerCheckHeads, prStep, judgeFiles, ownerCheckFrom,
  verdictWord, globMatch, WHY, AGENTS_WORDS, STEP2_NOTE, OWNER_CHECK_HEADS } from '../../src/lib/j22.js';
import { parseFilePages, splitChanges, verdictFiles } from '../../src/lib/prfiles.js';
import { verdictOf } from '../../src/lib/j11.js';

const J = join(FIX, 'j22');
const read = (f) => readFileSync(join(J, f), 'utf8');
const SD = { name: 'Service-Desk', repo: 'shumpmaster/Service-Desk', defaultBranch: 'main', model: 'v3' };
const RP = parseRiskPaths(read('risk-paths-304144d.toml'));

/** J20's kept list for a recorded pull request: its pages read as the page reads them. */
function recordedFiles(n) {
  const pages = [1, 2].map((p) => `files-${n}-p${p}.json`).filter((f) => existsSync(join(J, f))).map(read);
  const fp = parseFilePages(pages);
  return { pages, parsed: fp, f: { headSha: null, changes: splitChanges(fp.files), capped: fp.capped, verdicts: verdictFiles(fp.files) } };
}
const HEADS = { 126: '153824c7240a1741da4f79aa14a9b31a2336273b', 128: 'f8f54efc82464cb95fd670ac65b27e08b6435d61', 130: '58923ad6f3ea20efb23b1fc8553be05b898d9dd2',
  135: 'a00be9ddb0cf1eb9e91cef361ac3b4b87d4160c6', 148: 'd1d964bac673f079df3b4c2fd35b853cd8813809' };
const TOML = { 126: 'risk-paths-pr126.toml', 128: 'risk-paths-pr126.toml', 130: 'risk-paths-304144d.toml', 135: 'risk-paths-304144d.toml', 148: 'risk-paths-pr148.toml' };
const pr = (n, extra = {}) => ({ number: n, title: `PR ${n}`, url: `https://github.com/shumpmaster/Service-Desk/pull/${n}`, draft: false, base: 'main',
  head: `branch-${n}`, headRepo: 'shumpmaster/Service-Desk', headSha: HEADS[n] || `${String(n).padStart(4, '0')}${'a'.repeat(36)}`, createdAt: '2026-10-19T15:00:00Z',
  baseRepoPrivate: false, ...extra });

/** A J22 context (what desk.j22 hands the board), from files, verdict texts by sha and owner checks by sha. */
function ctx({ rp = RP, files = new Map(), blobs = {}, checks = {}, tree = {}, project = SD } = {}) {
  return { project, rp, files, checksRead: true,
    verdictBlob: (sha) => (sha in blobs ? (blobs[sha] === null ? { state: 'failed', at: 0 } : { state: 'read', verdict: verdictOf(blobs[sha]) }) : null),
    treeVerdict: (path) => (path in tree ? { inTree: true, read: tree[path] !== undefined, verdict: tree[path] === undefined ? null : verdictOf(tree[path]) } : { inTree: false, read: false, verdict: null }),
    ownerCheck: (sha) => (sha in checks ? checks[sha] : null) };
}
/** A made-up J20 list (NOT real): [[status, path, sha?]]. */
function list(n, head, entries) {
  const files = entries.map(([status, filename, sha, previous]) => ({ filename, status, previous: previous || null, ...(sha ? { sha } : {}) }));
  return [n, { headSha: head, changes: splitChanges(files), capped: false, verdicts: verdictFiles(files) }];
}
const sha = (c) => c.repeat(40);

test('J22 real-on-real, the class: the page\'s class for every path in Service-Desk\'s tree at 304144d equals review_check.py classify (1,277 paths: 612 R0, 574 R1, 91 R3)', () => {
  assert.ok(RP.ok);
  const lines = read('classify-304144d.txt').trim().split('\n');
  assert.equal(lines.length, 1277);
  const tally = {};
  for (const l of lines) {
    const i = l.lastIndexOf(': ');
    const path = l.slice(0, i);
    const cls = l.slice(i + 2);
    assert.equal(pathClass(RP.rp, path), cls, path);
    tally[cls] = (tally[cls] || 0) + 1;
  }
  assert.deepEqual(tally, { R0: 612, R1: 574, R3: 91 });
});

test('J22 real-on-real, the requirement: #126, #128, #130, #135 and #148 need the owner (and their reviewers) as review_check.py pr says', () => {
  const out = read('review-check-pr.txt');
  for (const n of [126, 128, 130, 135, 148]) {
    const block = out.split('== #').find((b) => b.startsWith(`${n} `));
    const want = /Required reviews: (.*)/.exec(block)[1].trim();
    const cls = /Risk class: (R\d)/.exec(block)[1];
    const { f } = recordedFiles(n);
    const rp = parseRiskPaths(read(TOML[n])).rp;
    const r = requiredReviewers(rp, f.changes.map(([, p]) => p));
    const flags = pathFlags(rp, f.changes);
    const ids = [...r.required.keys(), ...(flags.length && !r.required.has('owner') ? ['owner'] : [])].sort();
    assert.equal(ids.join(', ') || 'none', want, `#${n}`);
    assert.equal(r.cls, cls, `#${n}`);
  }
  // #128's list ran over two pages (128 files), as J20 reads it.
  const r128 = recordedFiles(128);
  assert.equal(r128.pages.length, 2);
  assert.equal(r128.parsed.files.length, 128);
});

test('J22 real statuses: #126 "Owner not required", #130 "Owner approved", #128 and #135 the tripwire\'s error, each its step', () => {
  const st = (n) => ownerCheckFrom(read(`status-${n}.json`));
  assert.deepEqual(st(126), { state: 'success', description: 'Owner not required' });
  assert.deepEqual(st(130), { state: 'success', description: 'Owner approved' });
  assert.deepEqual(st(128), { state: 'error', description: 'CI code changed · check the PR' });
  assert.deepEqual(st(135), { state: 'error', description: 'CI code changed · check the PR' });
  // The step each gives, with its list at its head and no verdict blob read yet (the owner's own verdicts were on their branches).
  const step = (n, verdicts = {}) => {
    const { f } = recordedFiles(n);
    const rp = parseRiskPaths(read(TOML[n]));
    const files = new Map([[n, { ...f, headSha: HEADS[n] }]]);
    const blobs = {};
    for (const [path, e] of f.verdicts) if (e.sha) blobs[e.sha] = verdicts[path] !== undefined ? verdicts[path] : 'Verdict: PASS\n';
    return prStep(pr(n), ctx({ rp, files, blobs, checks: { [HEADS[n]]: { read: true, ...st(n) } } }));
  };
  // #126: its owner's verdict on the branch reads PASS (as it did): the merge, at once (the owner's three pull requests of 19 Oct).
  assert.equal(step(126).step, 'merge');
  // #130 "Owner approved": the merge.
  assert.equal(step(130).step, 'merge');
  assert.equal(step(130).twoStep, 2);
  // #128 and #135: their verdict files on the branch decide (rule 1), so the tripwire changes nothing.
  assert.equal(step(128).step, 'merge');
  assert.equal(step(135).step, 'merge');
  // Without the owner's verdict file read yet: "Your verdict is on GitHub; reading it…", never "Verdict ↗".
  const { f } = recordedFiles(135);
  const files = new Map([[135, { ...f, headSha: HEADS[135] }]]);
  const s = prStep(pr(135), ctx({ files, checks: { [HEADS[135]]: { read: true, ...st(135) } } }));
  assert.equal(s.step, 'open');
  assert.equal(s.why, WHY.reading);
});

test('J22 rule 0, real-on-real: the required reviewers of #126, #128, #130, #135 and #148 are review_check\'s "Required reviews" less the owner', () => {
  const out = read('review-check-pr.txt');
  for (const n of [126, 128, 130, 135, 148]) {
    const block = out.split('== #').find((b) => b.startsWith(`${n} `));
    const want = /Required reviews: (.*)/.exec(block)[1].split(', ').filter((x) => x && x !== 'none' && x !== 'owner');
    const { f } = recordedFiles(n);
    const rp = parseRiskPaths(read(TOML[n]));
    const a = judgeFiles(pr(n), ctx({ rp, files: new Map([[n, { ...f, headSha: HEADS[n] }]]) }));
    assert.deepEqual([...a.required.keys()].filter((x) => x !== 'owner').sort(), want.sort(), `#${n}`);
    // Their verdict files were on their branches and read PASS: none is with the agents.
    const blobs = {};
    for (const [, e] of f.verdicts) if (e.sha) blobs[e.sha] = 'Verdict: PASS\n';
    assert.equal(ruleZero(pr(n), ctx({ rp, files: new Map([[n, { ...f, headSha: HEADS[n] }]]), blobs })).withAgents, false, `#${n}`);
  }
});

test('J22 the verdict reader, real-on-real: four PASS texts read PASS as review_check.parse_verdict does; "pass" and no Verdict: line read neither', () => {
  // review_check.parse_verdict's answers on the same texts (tests/desk/fixtures/j22/README.md, the command and its output).
  const cases = [['Verdict: PASS \n', 'PASS'], ['Verdict: PASS\r\nAny suggestions to commit along with the verdict:\r\n', 'PASS'], ['Verdict: PASS\t\n', 'PASS'],
    ['﻿Verdict: PASS\n', 'PASS'], ['Verdict: FAIL\n', 'FAIL'], ['Verdict: pass\n', 'other'], ['No verdict line here\n', null]];
  for (const [text, want] of cases) assert.equal(verdictOf(text), want, JSON.stringify(text));
  // Each as a required reviewer's verdict (the pull request leaves rule 0) and as the owner's (the merge).
  const H = sha('1');
  for (const [text, want] of cases) {
    const files = new Map([list(301, H, [['modified', 'src/lib/x.js'], ['added', 'reviews/301/reviewer.md', sha('2')], ['added', 'reviews/301/owner.md', sha('3')]])]);
    const c = ctx({ files, blobs: { [sha('2')]: text, [sha('3')]: text } });
    const p = pr(301, { headSha: H });
    assert.equal(ruleZero(p, c).withAgents, want !== 'PASS', JSON.stringify(text));
    if (want === 'PASS') assert.equal(prStep(p, c).step, 'merge');
    if (want === 'other' || want === null) assert.equal(prStep(p, c).why, WHY.neither);
  }
});

test('J22 made-up (NOT real): a [paths."<glob>"] domain table raising a path and naming owner; the two path-only flags; the error tripwire masking them', () => {
  const rp = parseRiskPaths('unmatched = "R1"\n[classes]\nR1 = ["src/**"]\n[reviews]\nR0 = []\nR1 = ["reviewer"]\nR2 = ["reviewer"]\nR3 = ["reviewer", "owner"]\n[paths."src/pay/**"]\nrisk = "R2"\nreviews = ["owner", "security"]\n');
  assert.ok(rp.ok);
  assert.equal(pathClass(rp.rp, 'src/pay/card.js'), 'R2');
  const r = requiredReviewers(rp.rp, ['src/pay/card.js']);
  assert.deepEqual([...r.required.keys()].sort(), ['owner', 'reviewer', 'security']);
  // A changed src/package.json, a deleted test and a renamed test on an R1 change (Service-Desk's own file).
  const H = sha('4');
  const files = new Map([list(302, H, [['modified', 'src/package.json'], ['removed', 'tests/desk/old.test.mjs'], ['renamed', 'tests/desk/new.test.mjs', null, 'tests/desk/was.test.mjs'],
    ['modified', 'src/lib/a.js']])]);
  const flags = pathFlags(RP.rp, files.get(302).changes);
  assert.deepEqual(flags.map((f) => [f.flag, f.path]), [['manifest', 'src/package.json'], ['test', 'tests/desk/old.test.mjs'], ['test', 'tests/desk/was.test.mjs']]);
  const p = pr(302, { headSha: H });
  const c = ctx({ files, checks: { [H]: { read: true, state: 'error', description: 'CI code changed · check the PR' } } });
  const s = prStep(p, c);
  assert.equal(s.step, 'verdict'); // (a) comes before the tripwire: it can hide a needed verdict, never read as "no verdict"
  assert.match(s.why, /^Its files need your verdict before the merge: a dependency manifest changed; a test file deleted or renamed/);
  // A pattern without "/" matches the name at any depth; `*` never crosses "/".
  assert.ok(globMatch('requirements*.txt', 'requirements-dev.txt'));
  assert.ok(!globMatch('src/*.js', 'src/lib/a.js'));
  assert.ok(globMatch('src/**', 'src'));
  assert.ok(globMatch('**/migrations/**', 'a/b/migrations/x.sql'));
});

test('J22 made-up (NOT real): each owner check and verdict gives its step and why line, character for character', () => {
  const H = sha('5');
  const r1 = new Map([list(303, H, [['modified', 'src/lib/a.js'], ['added', 'reviews/303/reviewer.md', sha('6')]])]);
  const blobs = { [sha('6')]: 'Verdict: PASS\n' };
  const p = pr(303, { headSha: H });
  const at = (check, extra = {}) => prStep(p, ctx({ files: r1, blobs, checks: check ? { [H]: { read: true, ...check } } : {}, ...extra }));
  assert.deepEqual([at({ state: 'pending', description: 'Owner verdict needed · test-weakening' }).step, at({ state: 'pending', description: 'Owner verdict needed · test-weakening' }).why],
    ['verdict', "GitHub's owner check asks for your verdict: Owner verdict needed · test-weakening"]);
  assert.deepEqual([at({ state: 'failure', description: 'Owner requested changes' }).step, at({ state: 'failure', description: 'Owner requested changes' }).why], ['open', 'You asked for changes.']);
  assert.deepEqual([at({ state: 'success', description: 'Owner not required' }).step, at({ state: 'success', description: 'Owner not required' }).why], ['merge', 'It needs no verdict from you, only the merge.']);
  const trip = at({ state: 'error', description: 'CI code changed · check the PR' });
  assert.deepEqual([trip.step, trip.why, trip.verdictLink], ['open', "GitHub flagged a change to this project's code or checks: look at the changes, then merge or add your verdict.", true]);
  assert.equal(trip.check, 'CI code changed · check the PR');
  assert.deepEqual([at({ state: 'error', description: 'Owner state unknown · review check error' }).why], ["GitHub's owner check couldn't decide."]);
  // Not read (not yet posted, past the cap, failed): the hedged words.
  assert.equal(at(null).why, "By its files, it needs no verdict from you, only the merge; GitHub's owner check: not read yet.");
  // An R3 change by class needs the verdict: "A high-risk (R3) change, …".
  const r3 = new Map([list(304, sha('7'), [['modified', '.claude/agents/x.md'], ['added', 'reviews/304/reviewer.md', sha('6')]])]);
  const s3 = prStep(pr(304, { headSha: sha('7') }), ctx({ files: r3, blobs }));
  assert.deepEqual([s3.step, s3.why, s3.twoStep], ['verdict', 'A high-risk (R3) change, so it needs your verdict before the merge.', 1]);
  // Its verdict lands, reading PASS: "Step 2 of 2: merge"; FAIL: "You asked for changes"; neither: its words.
  for (const [text, step, why] of [['Verdict: PASS\n', 'merge', null], ['Verdict: FAIL\n', 'open', 'You asked for changes.'], ['Verdict: maybe\n', 'open', WHY.neither]]) {
    const r = new Map([list(304, sha('8'), [['modified', '.claude/agents/x.md'], ['added', 'reviews/304/reviewer.md', sha('6')], ['added', 'reviews/304/owner.md', sha('9')]])]);
    const s = prStep(pr(304, { headSha: sha('8') }), ctx({ files: r, blobs: { ...blobs, [sha('9')]: text } }), s3.keep);
    assert.deepEqual([s.step, s.why], [step, why]);
    if (step === 'merge') assert.deepEqual([s.twoStep, s.note], [2, STEP2_NOTE]);
  }
  // A verdict file on the branch whose blob is unread, and one whose read failed: "Open ↗" with "reading it…", never "Verdict ↗".
  const r4 = new Map([list(304, sha('a'), [['modified', '.claude/agents/x.md'], ['added', 'reviews/304/reviewer.md', sha('6')], ['added', 'reviews/304/owner.md', sha('b')]])]);
  for (const b of [{}, { [sha('b')]: null }]) {
    const s = prStep(pr(304, { headSha: sha('a') }), ctx({ files: r4, blobs: { ...blobs, ...b } }));
    assert.deepEqual([s.step, s.why], ['open', 'Your verdict is on GitHub; reading it…']);
  }
  // Not known: the list not read at the first head seen, a fork's, 300 files or more, the file missing or unreadable.
  const nk = (p2, c) => prStep(p2, c);
  assert.equal(nk(pr(305), ctx()).why, WHY.notKnown);
  assert.equal(nk(pr(305, { headRepo: 'someone/fork' }), ctx()).why, WHY.notKnown);
  const big = new Map([[305, { headSha: pr(305).headSha, changes: [], capped: true, verdicts: new Map() }]]);
  assert.equal(nk(pr(305), ctx({ files: big })).why, WHY.notKnown);
  assert.equal(nk(pr(305), ctx({ rp: { ok: false } })).why, WHY.notKnown);
  assert.equal(parseRiskPaths('[classes\nR1 = 3').ok, false);
  // A head change keeps the last head's judgement until J20 reads the new head (rule 7), never "not known" for that wait.
  const kept = prStep(pr(304, { headSha: sha('c') }), ctx({ files: new Map() }), s3.keep);
  assert.equal(kept.step, 'verdict');
});

test('J22 rule 0 (made-up, NOT real): a missing reviewer, a design reviewer, a FAIL, neither, unread (counted as given), "Owner: after agents"; a fork by (i) alone; each leaves rule 0 once its verdicts are in', () => {
  const H = sha('d');
  const rp148 = parseRiskPaths(read('risk-paths-pr148.toml'));
  const base = [['modified', 'src/public/app.js']];
  const p = pr(310, { headSha: H });
  const z = (entries, blobs = {}, extra = {}) => ruleZero(p, ctx({ rp: rp148, files: new Map([list(310, H, [...base, ...entries])]), blobs, ...extra }));
  assert.deepEqual(z([]).waits, ["Waiting on Design reviewer's verdict", "Waiting on Reviewer's verdict"]);
  assert.deepEqual(z([['added', 'reviews/310/reviewer.md', sha('e')]], { [sha('e')]: 'Verdict: PASS\n' }).waits, ["Waiting on Design reviewer's verdict"]);
  assert.deepEqual(z([['added', 'reviews/310/reviewer.md', sha('e')], ['added', 'reviews/310/design-reviewer.md', sha('f')]], { [sha('e')]: 'Verdict: PASS\n', [sha('f')]: 'Verdict: FAIL\n' }).waits,
    ['Design reviewer asked for changes']);
  assert.deepEqual(z([['added', 'reviews/310/reviewer.md', sha('e')], ['added', 'reviews/310/design-reviewer.md', sha('f')]], { [sha('e')]: 'Verdict: PASS\n', [sha('f')]: 'Verdict: perhaps\n' }).waits,
    ["Design reviewer's verdict reads neither PASS nor FAIL"]);
  // On the branch but unread: counted as given, so the pull request is a card.
  assert.equal(z([['added', 'reviews/310/reviewer.md', sha('e')], ['added', 'reviews/310/design-reviewer.md', sha('f')]], {}).withAgents, false);
  // "Owner: after agents · 2 other finding(s)": (i).
  const i = z([['added', 'reviews/310/reviewer.md', sha('e')], ['added', 'reviews/310/design-reviewer.md', sha('f')]], {}, { checks: { [H]: { read: true, state: 'pending', description: 'Owner: after agents · 2 other finding(s)' } } });
  assert.deepEqual([i.withAgents, i.waits], [true, [AGENTS_WORDS]]);
  // A fork's pull request: (i) alone.
  const fork = pr(311, { headRepo: 'x/fork' });
  assert.equal(ruleZero(fork, ctx({ files: new Map() })).withAgents, false);
  assert.equal(ruleZero(fork, ctx({ checks: { [fork.headSha]: { read: true, state: 'pending', description: 'Owner: after agents · 1 other finding(s)' } } })).withAgents, true);
  // A verdict file only in the default branch's tree: read with J11's blobs, counted; unread, counted as given; shown removed in J20's list, not counted.
  const t = (tree, entries = []) => ruleZero(pr(312, { headSha: H }), ctx({ files: new Map([list(312, H, [['modified', 'src/lib/a.js'], ...entries])]), tree })).withAgents;
  assert.equal(t({ 'reviews/312/reviewer.md': 'Verdict: PASS\n' }), false);
  assert.equal(t({ 'reviews/312/reviewer.md': undefined }), false);
  assert.equal(t({ 'reviews/312/reviewer.md': 'Verdict: PASS\n' }, [['removed', 'reviews/312/reviewer.md']]), true);
  // A project whose risk-paths can't be read: (i) alone.
  assert.equal(ruleZero(p, ctx({ rp: { ok: false }, files: new Map([list(310, H, base)]) })).withAgents, false);
});

test('J22 rule 0 is never kept across heads: with the agents at head A, its verdict commit gives head B with J20\'s read of B failing: a card at once by (i) alone; with "Owner: after agents" at B, with the agents', () => {
  const A = sha('1');
  const B = sha('2');
  const atA = ruleZero(pr(320, { headSha: A }), ctx({ files: new Map([list(320, A, [['modified', 'src/lib/a.js']])]) }));
  assert.equal(atA.withAgents, true);
  const atB = ruleZero(pr(320, { headSha: B }), ctx({ files: new Map([list(320, A, [['modified', 'src/lib/a.js']])]) }));
  assert.equal(atB.withAgents, false);
  const atB2 = ruleZero(pr(320, { headSha: B }), ctx({ files: new Map([list(320, A, [['modified', 'src/lib/a.js']])]), checks: { [B]: { read: true, state: 'pending', description: 'Owner: after agents · 1 other finding(s)' } } }));
  assert.equal(atB2.withAgents, true);
});

test('J22 ownerCheckHeads: the same 3 of 5 heads for the page and the sender, in AC52\'s order (lower number first on a tie), leaving out the settled and the ones with the agents by (ii)', () => {
  const t0 = '2026-10-19T10:00:00Z';
  const H = (n) => `${String(n).padStart(2, '0')}${'c'.repeat(38)}`;
  const mk = (n, created, extra = {}) => pr(n, { headSha: H(n), createdAt: created, ...extra });
  const files = new Map([
    // #401: its owner's verdict on the branch reads PASS: settled, left out.
    list(401, H(401), [['modified', '.claude/x.md'], ['added', 'reviews/401/reviewer.md', sha('5')], ['added', 'reviews/401/owner.md', sha('6')]]),
    // #402: with the agents by (ii): no reviewer's verdict yet: left out.
    list(402, H(402), [['modified', 'src/lib/a.js']]),
    // #403: an R3 change outside the signal-code paths (a .claude/** change, as #148 was), reviewer PASS: chosen.
    list(403, H(403), [['modified', '.claude/agents/x.md'], ['added', 'reviews/403/reviewer.md', sha('5')]]),
    list(406, H(406), [['modified', 'docs/x.md']]),
  ]);
  const c = ctx({ files, blobs: { [sha('5')]: 'Verdict: PASS\n', [sha('6')]: 'Verdict: PASS\n' } });
  // #404 and #405: same created_at; #405 listed first. #404 has no J20 list at its head: chosen like any other.
  const pulls = [mk(405, '2026-10-19T11:00:00Z'), mk(406, '2026-10-19T12:00:00Z'), mk(404, '2026-10-19T11:00:00Z'), mk(403, t0), mk(402, t0), mk(401, t0)];
  const page = ownerCheckHeads(pulls, c).map((p) => p.number);
  const sender = ownerCheckHeads([...pulls].reverse(), c).map((p) => p.number);
  assert.deepEqual(page, [403, 404, 405]);
  assert.deepEqual(sender, page);
  assert.equal(OWNER_CHECK_HEADS, 3);
  // The fourth (#406) is "not read": judged without it.
  assert.equal(prStep(mk(406, '2026-10-19T12:00:00Z'), c).why, WHY.byFiles);
  // #403 with "Owner: after agents · 1 other finding(s)": with the agents; with the tripwire's error instead, rule 2's "Verdict ↗" (the known limit).
  const after = ctx({ files, blobs: { [sha('5')]: 'Verdict: PASS\n' }, checks: { [H(403)]: { read: true, state: 'pending', description: 'Owner: after agents · 1 other finding(s)' } } });
  assert.equal(ruleZero(mk(403, t0), after).withAgents, true);
  const trip = ctx({ files, blobs: { [sha('5')]: 'Verdict: PASS\n' }, checks: { [H(403)]: { read: true, state: 'error', description: 'CI code changed · check the PR' } } });
  assert.equal(ruleZero(mk(403, t0), trip).withAgents, false);
  assert.equal(prStep(mk(403, t0), trip).step, 'verdict');
});

test('J22 the owner check\'s body: its owner-verdict entry, none posted (null), malformed (undefined)', () => {
  assert.deepEqual(ownerCheckFrom('{"state":"pending","statuses":[{"context":"ci","state":"success"},{"context":"owner-verdict","state":"pending","description":"Owner: after agents · 2 other finding(s)"}]}'),
    { state: 'pending', description: 'Owner: after agents · 2 other finding(s)' });
  assert.equal(ownerCheckFrom('{"state":"pending","statuses":[]}'), null);
  assert.equal(ownerCheckFrom('not json'), undefined);
  assert.equal(ownerCheckFrom('{"x":1}'), undefined);
});

test('J22 the verdict word: branch, removed, tree, missing', () => {
  const H = sha('3');
  const files = new Map([list(330, H, [['added', 'reviews/330/reviewer.md', sha('4')], ['removed', 'reviews/330/owner.md']])]);
  const c = ctx({ files, blobs: { [sha('4')]: 'Verdict: PASS\n' }, tree: { 'reviews/330/x.md': 'Verdict: FAIL\n' } });
  const l = { state: 'read', f: files.get(330) };
  const p = pr(330, { headSha: H });
  assert.deepEqual([verdictWord(p, 'reviewer', l, c).word, verdictWord(p, 'owner', l, c).word, verdictWord(p, 'x', l, c).word, verdictWord(p, 'y', l, c).word],
    ['PASS', 'missing', 'FAIL', 'missing']);
});

test('J22 rule 7 keeps the owner\'s verdict across a head change (build review 1, finding 1; made-up, NOT real): an R3 change with the owner\'s PASS on its branch, then a new head whose list is unread, stays "Merge ↗", never "Verdict ↗" again; FAIL stays "Open ↗"', () => {
  for (const [text, step] of [['Verdict: PASS\n', 'merge'], ['Verdict: FAIL\n', 'open']]) {
    const A = sha('d');
    const files = new Map([list(304, A, [['modified', '.claude/agents/x.md'], ['added', 'reviews/304/reviewer.md', sha('6')], ['added', 'reviews/304/owner.md', sha('9')]])]);
    const blobs = { [sha('6')]: 'Verdict: PASS\n', [sha('9')]: text };
    const atA = prStep(pr(304, { headSha: A }), ctx({ files, blobs }));
    assert.equal(atA.step, step, `at head A: ${text.trim()}`);
    // Head B (main merged into the branch, say): J20 has not read it, or its read failed.
    for (const filesB of [new Map(), new Map([[304, { headSha: A, changes: [], capped: false, verdicts: new Map() }]])]) {
      const atB = prStep(pr(304, { headSha: sha('e') }), ctx({ files: filesB, blobs }), atA.keep);
      assert.equal(atB.step, step, `${text.trim()}: the owner's verdict kept at the unread head`);
      assert.notEqual(atB.step, 'verdict');
      if (step === 'merge') assert.deepEqual([atB.twoStep, atB.note], [2, STEP2_NOTE]);
      else assert.equal(atB.why, 'You asked for changes.');
      // And kept again at the head after (the keep carries it on).
      const atC = prStep(pr(304, { headSha: sha('f') }), ctx({ files: new Map(), blobs }), atB.keep);
      assert.equal(atC.step, step);
    }
  }
});
