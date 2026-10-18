// join-test: S-001/J20 — open pull requests' files, the sender's side: REST answers recorded once from
// Service-Desk's pull requests (#107, #108, #84) and made-up ones; an added answer record; a rename
// split in two; a deleted question read as being recorded in v2.5 and not in v3; a fork's pull request
// ignored; three pages; and a failed read. (The page's read in the blob call, kept by head sha, is the
// brief's step 3.)

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseFilePages, splitChanges, recordedAnswers, jobKindsByPath, filesUrl, FILE_CAP } from '../../src/lib/prfiles.js';
import { collect } from '../../src/notify/collect.mjs';
import { makeGitHub } from '../../src/notify/gh.mjs';
import { FIX } from './helpers.mjs';
import { REPO, T0, checkoutOf, makeWorld, pull, testConfig, makeVapid, cleanScratch } from './notify-helpers.mjs';

after(cleanScratch);

const rec = (name) => JSON.parse(readFileSync(join(FIX, 'github', `${name}.json`), 'utf8'));

test('J20: the recorded answers: an added answer record is "being recorded" in v3; the job\'s kinds by path', () => {
  const p107 = parseFilePages([rec('notify-pull-107-files').body]);
  assert.equal(p107.ok, true);
  const c107 = splitChanges(p107.files);
  assert.deepEqual(c107, [['A', 'decisions/questions/P-001-notify-round4.md'], ['D', 'questions/P-001-notify-round4.md']]);
  assert.deepEqual([...recordedAnswers(c107, 'v3')], ['P-001-notify-round4']);
  assert.deepEqual([...recordedAnswers(c107, 'v2.5')], ['P-001-notify-round4']);
  assert.equal(jobKindsByPath(c107), true);
  const c108 = splitChanges(parseFilePages([rec('notify-pull-108-files').body]).files);
  assert.equal(recordedAnswers(c108, 'v3').size, 0);
  assert.equal(jobKindsByPath(c108), false);
  const c84 = splitChanges(parseFilePages([rec('notify-pull-84-files').body]).files);
  assert.equal(jobKindsByPath(c84), true);
  assert.equal(recordedAnswers(c84, 'v3').size, 0);
});

test('J20: a rename split in two; a deletion alone records nothing in v3 and is being recorded in v2.5; notes files are no answer', () => {
  const ch = splitChanges([{ filename: 'decisions/questions/N-b.md', status: 'renamed', previous: 'decisions/questions/N-a.md' }]);
  assert.deepEqual(ch, [['D', 'decisions/questions/N-a.md'], ['A', 'decisions/questions/N-b.md']]);
  assert.deepEqual([...recordedAnswers(ch, 'v3')], ['N-b']);
  const del = splitChanges([{ filename: 'questions/N-a.md', status: 'removed' }]);
  assert.equal(recordedAnswers(del, 'v3').size, 0, 'a withdrawal in v3');
  assert.deepEqual([...recordedAnswers(del, 'v2.5')], ['N-a']);
  assert.equal(recordedAnswers(splitChanges([{ filename: 'decisions/questions/N-a-notes.md', status: 'added' }]), 'v3').size, 0);
  assert.equal(recordedAnswers(splitChanges([{ filename: 'questions/_TEMPLATE.md', status: 'removed' }]), 'v2.5').size, 0);
  assert.equal(parseFilePages(['{"not": "a list"}']).ok, false);
  assert.equal(parseFilePages(['[{"status": "added"}]']).ok, false);
  assert.equal(filesUrl('https://api.github.com', REPO, 9, 2), `https://api.github.com/repos/${REPO}/pulls/9/files?per_page=100&page=2`);
});

function world() {
  const w = makeWorld();
  w.pulls = [pull(1), pull(2, { headRepo: 'someone/Service-Desk', association: 'NONE' }), pull(3, { draft: true }), pull(4, { base: 'other' }), pull(5, { headRepo: null })];
  w.files[1] = Array.from({ length: 250 }, (_, i) => ({ filename: `src/f${i}.js`, status: 'added' }));
  w.files[1].push({ filename: 'decisions/questions/N-a.md', status: 'added' });
  return w;
}

test('J20: the sender reads files only for its own branches\' open, non-draft pull requests into the default branch, three pages at most', async () => {
  const co = checkoutOf({ base: { 'questions/_TEMPLATE.md': '#\n' }, later: [{ files: { 'questions/N-a.md': '# Ruling needed: A\n\nMilestone: none (x)\n' }, date: '2026-10-18T11:00:00+00:00' }] });
  const w = world();
  const config = testConfig(makeVapid());
  const c = await collect({ project: config.projects[0], config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: 'k'.repeat(64), cand: {} });
  assert.equal(c.read, true, c.why);
  const reads = w.ghCalls.filter((x) => x.path.includes('/files')).map((x) => x.path);
  assert.deepEqual(reads, [`/repos/${REPO}/pulls/1/files?per_page=100`, `/repos/${REPO}/pulls/1/files?per_page=100&page=2`, `/repos/${REPO}/pulls/1/files?per_page=100&page=3`]);
  // The answer on the third page: being recorded, so the question is not in the set.
  assert.equal(c.counts.recording, 1);
  assert.ok(!c.set.some((x) => x.kind === 'question'));
  assert.ok(FILE_CAP === 300);
});

test('J20: a failed files read leaves the project not read this run (the sender keeps its last set)', async () => {
  const co = checkoutOf({ base: { 'questions/_TEMPLATE.md': '#\n' } });
  const w = world();
  w.fail[`/repos/${REPO}/pulls/1/files`] = 502;
  const config = testConfig(makeVapid());
  const c = await collect({ project: config.projects[0], config, checkout: co.open(), gh: makeGitHub({ token: 't', fetch: w.fetch }), nowMs: T0, stateKey: 'k'.repeat(64), cand: {} });
  assert.deepEqual(c, { read: false, why: 'pull request files' });
});
