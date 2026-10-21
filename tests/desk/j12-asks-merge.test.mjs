// The asks-merge job's merges (spec S-001, model 3.5.0's records, 2026-10-17; the owner's answer
// "B. Off the Timeline (Recommended)", decisions/questions/P-001-asks-merge-on-desk.md): J12 reads each
// merge commit's message and author in the query it already makes; a merge whose final trailer
// paragraph holds one `Merged-By: orchestrator`, by `github-actions[bot]`, is the job's, and is never a
// sprint and gives no run a time unless a plan line lists it (AC59, AC60); its "Done today" row reads
// "not on the Timeline: merged by the automatic job" (AC66). While open, it is any pull request.
//
// Fixtures: tests/desk/fixtures/github/j12-asks-merge.json (#84 real-on-real from pulls/84 and
// commits/21bc250; #951 to #959 MADE UP) and j12-pulls-built.json's merge messages, each with the
// model's `govlib.parse_trailers` output and author beside it (tests/desk/tools/j12-merge-messages.py).
// join-test: S-001/J12
// ac-test: S-001/AC59 ac-test: S-001/AC60 ac-test: S-001/AC66
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIX, CONFIG, fakeClock } from './helpers.mjs';
import { pr, fakeServer } from './fake-desk.mjs';
import { byClass, linksIn } from './sandbox-helpers.mjs';
import { models, keyed, sdRepo, SD3, j11Files } from './tv2-fixtures.mjs';
import { loadSandbox } from './sandbox-helpers.mjs';
import { NOW } from './sandbox-fixtures.mjs';
import { pullsAnswer, pullNodes, answerOf, node, asksMergeAnswer, asksMergeNodes, asksMergeModel, builtModel } from './j12-fixture.mjs';
import { PULLS_QUERY } from '../../src/lib/github.js';
import { parseTrailers, isJobMerge, keptPull, judgePulls, PULLS_KEY, OLD_PULLS_KEYS } from '../../src/lib/pulls.js';
import { createDesk, POLL_MS } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';

const NOW18 = Date.parse('2026-10-18T12:00:00Z');
const JOB = [84, 956, 957, 958, 959];
const NOT_JOB = [951, 952, 953, 954, 955];
const DOC = j11Files()['docs/PROJECT.md'];
const MD3_LINE = /(\(MD3\) · done when [^\n]* · phase: Design)\n/;
const listing = (prs) => DOC.replace(MD3_LINE, `$1 · sprints: ${prs.map((n) => `PR #${n}`).join(', ')}\n`);
const both = () => answerOf([...asksMergeNodes(), ...pullNodes()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
const block = (feed, key) => feed.blocks.find((b) => b.key === key);
const rowsOf = (b) => [...(b.plannedRows || []), ...b.rows];
const allSprintIds = (feed) => feed.blocks.flatMap((b) => rowsOf(b).flatMap((x) => [...(x.sprints || []), ...(x.named || [])].map((s) => s.id)));

// ---------------------------------------------------------------------------
// J12: the query, the rule and the kept yes or no

test('J12 (asks-merge): the fixed query asks for `mergeCommit { oid message author { name } }`, in the same one query', () => {
  assert.ok(PULLS_QUERY.includes('mergeCommit { oid message author { name } }'));
  assert.equal((PULLS_QUERY.match(/pullRequests\(/g) || []).length, 1, 'one connection: no request is added');
});

test('J12 (asks-merge): #84\'s merge (21bc250) is the job\'s; the description quoting the line mid-text, the other author, the other value, two trailers and the mixed final paragraph are not; a `#` comment line after the trailers and Signed-off-by with two plain lines are', () => {
  const by = new Map(asksMergeNodes().map((n) => [n.number, n]));
  for (const n of JOB) assert.equal(isJobMerge(by.get(n).mergeCommit), true, `#${n}`);
  for (const n of NOT_JOB) assert.equal(isJobMerge(by.get(n).mergeCommit), false, `#${n}`);
  assert.equal(by.get(84).mergeCommit.oid, '21bc25099676f7207eb388147cec9998d8c59509');
  assert.equal(by.get(84).mergeCommit.author.name, 'github-actions[bot]');
  assert.deepEqual(parseTrailers(by.get(84).mergeCommit.message), [['Merged-By', 'orchestrator'], ['Delegation', 'L-0017'],
    ['Merged-Head', '6c34acb6a72d6d94c791c65e4084269d9a6a3974']]);
  assert.deepEqual(parseTrailers(by.get(958).mergeCommit.message), [['Signed-off-by', 'A <a@x>'], ['Merged-By', 'orchestrator']]);
  assert.deepEqual(parseTrailers(by.get(955).mergeCommit.message), []);
  assert.equal(isJobMerge(null), false, 'a null merge commit is not the job\'s');
  assert.equal(isJobMerge({ oid: 'x' }), null, 'no message: J12 has not read it');
  assert.equal(isJobMerge({ oid: 'x', message: 't\n\nmerged-by:  orchestrator  ', author: { name: 'github-actions[bot]' } }), true, 'the key in any case, the value stripped');
  assert.equal(isJobMerge({ oid: 'x', message: 't\n\nMerged-By: orchestrator', author: null }), false, 'no author');
});

test('J12 (asks-merge): the desk\'s yes or no, and its trailers, agree with `parse_trailers`\' output and the author for every message in both fixtures', () => {
  const check = (nodes, model) => {
    let n = 0;
    for (const x of nodes) {
      if (!x.mergeCommit) continue;
      const m = model[String(x.number)];
      assert.ok(m, `#${x.number} has the model's verdict beside it`);
      assert.deepEqual(parseTrailers(x.mergeCommit.message), m.parse_trailers, `#${x.number}'s trailers`);
      assert.equal(x.mergeCommit.author.name, m.author);
      assert.equal(isJobMerge(x.mergeCommit), m.job, `#${x.number}`);
      n++;
    }
    return n;
  };
  assert.equal(check(asksMergeNodes(), asksMergeModel()), 10);
  assert.equal(check(pullNodes(), builtModel()), 71, 'every merge message of the built fixture');
  // More cases for the port of parse_trailers, with git's own rules.
  assert.deepEqual(parseTrailers('Only a title'), [], 'the title never holds trailers');
  assert.deepEqual(parseTrailers('t\n\nKey: a\n  continued here\nOther: b'), [['Key', 'a continued here'], ['Other', 'b']], 'a continuation unfolded');
  assert.deepEqual(parseTrailers('t\r\n\r\nKey: a\r\n'), [['Key', 'a']], 'CRLF made LF');
  assert.deepEqual(parseTrailers('t\n\nbody\n\nKey: a\n\n# comment\n\n'), [['Key', 'a']], 'trailing comments and blank lines dropped');
  // Each checked against the model's own parse_trailers (python3 -c, 2026-10-18).
  assert.deepEqual(parseTrailers('t\n\nplain\nwords\nmore\nKey: a\n(cherry picked from commit abc)'), [['Key', 'a']], 'a git line, and a quarter or more trailers');
  assert.deepEqual(parseTrailers('t\n\none\ntwo\nthree\nfour\nfive\nsix\nseven\n(cherry picked from commit abc)'), [], 'a git line, but under a quarter trailers');
  // Build review round 1, N1: white space as Python has it (U+001C to U+001F and U+0085 count, U+FEFF does not);
  // each expected value is govlib.parse_trailers' own output (python3 -c, 2026-10-18).
  const m90 = 'File a question (#90)\n\nbody text\n\n';
  assert.deepEqual(parseTrailers(`${m90}Merged-By: orchestrator\x1c\nDelegation: L-0017\nMerged-Head: abc`), [['Merged-By', 'orchestrator'], ['Delegation', 'L-0017'], ['Merged-Head', 'abc']]);
  assert.deepEqual(parseTrailers(`${m90}Merged-By: orchestrator\ufeff\nDelegation: L-0017`), [['Merged-By', 'orchestrator\ufeff'], ['Delegation', 'L-0017']]);
  assert.deepEqual(parseTrailers(`${m90}Merged-By: orchestrator\n\x85continued\nDelegation: L-0017`), [['Merged-By', 'orchestrator continued'], ['Delegation', 'L-0017']], 'U+0085 starts a continuation');
  assert.deepEqual(parseTrailers('File a question (#90)\n\nbody text\n\x1c\nMerged-By: orchestrator'), [['Merged-By', 'orchestrator']], 'a line of U+001C is blank');
  assert.deepEqual(parseTrailers('File a question (#90)\n\nbody text\n\ufeff\nMerged-By: orchestrator'), [], 'a line of U+FEFF is not blank');
  const bot = (message) => isJobMerge({ oid: 'x', message, author: { name: 'github-actions[bot]' } });
  assert.equal(bot(`${m90}Merged-By: orchestrator\x1c\nDelegation: L-0017\nMerged-Head: abc`), true, 'the model reads orchestrator: the job\'s');
  assert.equal(bot(`${m90}Merged-By: orchestrator\ufeff\nDelegation: L-0017`), false, 'the model reads orchestrator\ufeff: not the job\'s');
});

test('J12 (asks-merge): the kept entry holds the yes or no and never the message', () => {
  const v = judgePulls(asksMergeAnswer());
  assert.equal(v.ok, true);
  for (const p of v.pulls) {
    assert.equal(p.job, JOB.includes(p.number), `#${p.number}`);
    assert.doesNotMatch(JSON.stringify(p), /Merged-By: |Delegation: L-0017|Merged-Head: |github-actions\[bot\]/, `#${p.number}: no message, no author`);
    assert.ok(!('message' in p) && !('author' in p));
  }
  assert.equal('job' in keptPull(node(1, { message: null }), null), false, 'an answer with no message: no yes or no');
  assert.equal(keptPull(node(2, { mergedAt: null }), null).job, false, 'open: no merge commit, not the job\'s');
});

function deskOn(r, { pullsStore = createStore(null), start = Date.parse('2026-10-18T09:00:00Z') } = {}) {
  const clock = fakeClock(start);
  const config = { ...CONFIG, projects: [SD3] };
  const server = fakeServer({ [SD3.name]: r }, config, clock);
  const desk = createDesk({ config, call: (p, b) => server.call(p, b), clock, store: createStore(null), pullsStore, isVisible: () => true, j11: true });
  return { clock, server, desk, pullCalls: () => server.calls.filter((c) => c.path === '/api/blobs' && c.body.pulls) };
}

// From 2026-10-19 (draft 4 of "Work ahead by milestones") the kept list moved on again, to
// desk-pulls-v3 (j12-ac60-ac66-estimates.test.mjs checks v2's removal); a v1 entry is still removed on
// load and read again, as here.
test('J12 (asks-merge): the kept list moved on from desk-pulls-v1 (to desk-pulls-v3 from 2026-10-19); desk-pulls-v1 is removed on load and its entries read again from J12; the requests per J12 read are unchanged', async () => {
  assert.equal(PULLS_KEY, 'desk-pulls-v3');
  assert.deepEqual(OLD_PULLS_KEYS, ['desk-pulls-v1', 'desk-pulls-v2']);
  // A v1 entry, as a device that loaded the desk before this deploy holds it: no job's yes or no.
  const v1 = { [SD3.name]: { day: '2026-10-18', head: null, tooMany: false, pulls: judgePulls(pullsAnswer()).pulls.map((p) => { const q = { ...p }; delete q.job; return q; }) } };
  const backing = new Map([['desk-pulls-v1', JSON.stringify(v1)]]);
  const storage = { getItem: (k) => (backing.has(k) ? backing.get(k) : null), setItem: (k, v) => backing.set(k, v), removeItem: (k) => backing.delete(k) };
  const r = sdRepo({ answer: both() });
  const { clock, desk, pullCalls } = deskOn(r, { pullsStore: createStore(storage) });
  assert.equal(backing.has('desk-pulls-v1'), false, 'removed on load');
  desk.start();
  await clock.runUntil(clock.now() + 3 * POLL_MS);
  desk.stop();
  assert.equal(pullCalls().length, 1, 'one J12 read, one blob call carrying it, as before: no request added');
  const kept = JSON.parse(backing.get(PULLS_KEY))[SD3.name].pulls;
  assert.ok(kept.every((p) => typeof p.job === 'boolean'), 'every entry read again from J12, with its yes or no');
  assert.deepEqual(kept.filter((p) => p.job).map((p) => p.number).sort((a, b) => a - b), JOB);
});

// ---------------------------------------------------------------------------
// AC59 and AC60: never a sprint, no run's time, unless the plan lists it

test('AC60 (asks-merge): #84 and the job\'s other merges on no milestone and under no "Not tied to a milestone" line; #956, naming MD3, not under MD3\'s "not yet in the plan"; the not-the-job\'s cases placed as any merged pull request', () => {
  const { feed } = models({ answer: both(), now: NOW18 });
  const ids = allSprintIds(feed);
  for (const n of JOB) assert.ok(!ids.includes(`PR #${n}`), `#${n} is no sprint`);
  for (const n of NOT_JOB) assert.ok(ids.includes(`PR #${n}`), `#${n} is placed as any merged pull request`);
  const md3 = rowsOf(block(feed, 'Design-i2')).find((x) => x.code === 'MD3');
  assert.equal(md3.namedFold, null, 'no "named by its pull request, not yet in the plan" line');
  const untied = rowsOf(block(feed, 'Design-i2')).find((x) => x.kind === 'untied');
  assert.ok(untied.sprints.some((s) => s.id === 'PR #951'), 'the description quoting the line mid-text: untied, as any');
  assert.ok(!untied.sprints.some((s) => JOB.includes(Number(s.id.slice(4)))));
});

test('AC59 + AC60 (asks-merge): a run whose only untied pull requests are the job\'s has no "Not tied to a milestone" line, and the job\'s merges give it no time', () => {
  const jobOnly = answerOf(asksMergeNodes().filter((n) => JOB.includes(n.number)));
  const none = models({ answer: answerOf([]), now: NOW18 }).feed;
  const { feed } = models({ answer: jobOnly, now: NOW18 });
  const d2 = block(feed, 'Design-i2');
  assert.equal(rowsOf(d2).find((x) => x.kind === 'untied'), undefined, 'no such line');
  assert.equal(d2.band.words, block(none, 'Design-i2').band.words, 'the same dates as with no pull requests');
  assert.equal(d2.band.words, '8 Oct · now');
  // A merge that is not the job's on the same day does give the run its time.
  const one = models({ answer: answerOf(asksMergeNodes().filter((n) => n.number === 951)), now: NOW18 }).feed;
  assert.equal(block(one, 'Design-i2').band.words, '8 Oct to 17 Oct · now');
});

test('AC60 (asks-merge): a job\'s merge that a plan line lists under MD3 is MD3\'s sprint, with its merge time among its run\'s times (the plan wins)', () => {
  const doc = listing([959]);
  const { feed } = models({ answer: answerOf(asksMergeNodes().filter((n) => JOB.includes(n.number))), extra: { 'docs/PROJECT.md': doc }, now: NOW18 });
  const md3 = rowsOf(block(feed, 'Design-i2')).find((x) => x.code === 'MD3');
  assert.deepEqual(md3.sprints.map((s) => s.id), ['PR #959']);
  assert.equal(md3.sprints[0].date, '17 Oct');
  assert.ok(!md3.sprints[0].missing);
  assert.equal(block(feed, 'Design-i2').band.words, '8 Oct to 17 Oct · now', 'its merge time counts toward its run\'s times');
});

test('AC60 (asks-merge): a merge J12 has not read (no yes or no) is shown as a listed pull request J12 lacks under a plan line that lists it, and nowhere else', () => {
  const unread = node(960, { message: null, mergedAt: '2026-10-17T20:00:00Z', body: 'Milestone: MD3\n' });
  const loose = node(961, { message: null, mergedAt: '2026-10-17T21:00:00Z' });
  const { feed } = models({ answer: answerOf([unread, loose]), extra: { 'docs/PROJECT.md': listing([960]) }, now: NOW18 });
  const md3 = rowsOf(block(feed, 'Design-i2')).find((x) => x.code === 'MD3');
  assert.equal(md3.sprints[0].id, 'PR #960');
  assert.equal(md3.sprints[0].missing, 'not recorded in what the desk reads', 'as J12\'s awkward cases show a listed pull request it lacks');
  assert.equal(md3.namedFold, null, 'never by its Milestone: line');
  assert.ok(!allSprintIds(feed).includes('PR #961'), 'not under "Not tied to a milestone"');
  assert.equal(block(feed, 'Design-i2').band.words, '8 Oct · now', 'no run\'s time');
});

// ---------------------------------------------------------------------------
// AC66: "Done today" as a job's merge leaves the queue

test('AC66 (asks-merge) + AC80: a job\'s merge leaving the board — its Done row\'s sheet reads "sprint: not recorded" before J12 reads it, then "not on the Timeline: merged by the automatic job"; the answer it carried keeps its own row and link; one not the job\'s links to its sprint; a plan-listed job\'s merge links under MD3', async () => {
  const before = answerOf(pullNodes());
  const repo = sdRepo({ answer: before, extra: { 'docs/PROJECT.md': listing([959]) } });
  repo.pulls.push(pr(84, 'Chief of Staff session line', { head: 'cos/session-012RJ-start-2' }), pr(951, 'A made-up merge quoting the trailer mid-text', { head: 'cos/made-up-951' }),
    pr(959, 'A made-up job merge a plan line lists', { head: 'cos/made-up-959' }));
  const page = await loadSandbox({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': repo }, hash: '#/waiting/Service-Desk', now: NOW });
  // From stage 1a (AC80): the board's Done lane in place of "Done today"; a row's small sheet carries
  // AC66's link or words. Each read opens the row's sheet and closes it, so the next opening shows the latest.
  const sheetOfRow = async (codeText) => {
    const back = '#/waiting/Service-Desk';
    await page.go(back);
    // Each project's Done group shows its newest three rows, the rest behind "<n> more".
    const more = keyed(page, 'more:Service-Desk');
    if (more && more.attrs['aria-expanded'] === 'false') await page.tap(more);
    const row = byClass(keyed(page, 'lane:done'), 'v2-drow').find((x) => byClass(x, 'v2-dc').some((c) => c.textContent === codeText));
    assert.ok(row, `a Done row for ${codeText}`);
    await page.go(byClass(row, 'v2-dt')[0].attrs.href);
    const sheet = byClass(page.view, 'v2-sheet')[0];
    const out = { text: sheet.textContent, tl: linksIn(sheet).find((l) => l.text === 'On the Timeline') };
    await page.go(back);
    return out;
  };
  try {
    await page.advance(1000);
    await page.advance(POLL_MS);
    assert.ok(byClass(keyed(page, 'lane:wait'), 'v2-card').some((c) => c.textContent.includes('Chief of Staff session line')), 'while open: a card on the board as any pull request');
    // Merged: gone from J1's open list, and the answer it carried on the default branch; J12 has not read it yet.
    repo.pulls = repo.pulls.filter((x) => ![84, 951, 959].includes(x.number));
    repo.commit({ 'decisions/questions/P-001-asks-merge-on-desk.md': readFileSync(join(FIX, 's033', 'decisions', 'questions', 'P-001-asks-merge-on-desk.md'), 'utf8') });
    repo.history['decisions/questions/P-001-asks-merge-on-desk.md'] = [{ commit: { committer: { date: new Date(page.now).toISOString() } } }];
    await page.advance(POLL_MS);
    await page.advance(POLL_MS);
    let r = await sheetOfRow('#84');
    assert.match(r.text, /#84 · sprint: not recorded/, 'before J12 has read it');
    assert.equal(r.tl, undefined);
    // A plan-listed one's sprint is on the Timeline already, shown as a listed pull request J12 lacks: its row links there.
    assert.match((await sheetOfRow('#959')).tl.href, /^#\/p\/Service-Desk\/timeline\/sprint\//);
    assert.equal((await sheetOfRow('P-001-asks-merge-on-desk')).tl.href, '#/p/Service-Desk/timeline/ms/MD2', 'the answer it carried: its own row and link');
    // J12 reads the merges on the next head change.
    repo.pullsAnswer = both();
    repo.commit({ 'a-later-commit.txt': 'x' });
    await page.advance(POLL_MS);
    await page.advance(POLL_MS);
    r = await sheetOfRow('#84');
    assert.match(r.text, /#84 · not on the Timeline: merged by the automatic job/);
    assert.equal(r.tl, undefined, 'no Timeline link');
    assert.match((await sheetOfRow('#951')).tl.href, /^#\/p\/Service-Desk\/timeline\/sprint\/PR(%20| )(%23|#)951$/, 'not the job\'s: links to its sprint as before');
    const listed = (await sheetOfRow('#959')).tl.href;
    assert.match(listed, /^#\/p\/Service-Desk\/timeline\/sprint\//, 'a plan-listed job\'s merge: the plan wins');
    assert.equal((await sheetOfRow('P-001-asks-merge-on-desk')).tl.href, '#/p/Service-Desk/timeline/ms/MD2', 'still its own row and link');
    // The plan-listed one's link opens its sprint under MD3.
    await page.go(listed);
    assert.equal(keyed(page, 'fold:sprints:Design-i2:MD3').attrs['aria-expanded'], 'true');
  } finally {
    page.restore();
  }
});
