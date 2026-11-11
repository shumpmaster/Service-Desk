// S-007 "baseline run": the recorded output names the base commit and was committed on the build
// branch before any change under src/. Needs full git history (CI: fetch-depth 0).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { baseline, BASELINE_PATH, ROOT, git, gitOk } from './lib.mjs';
import { FAIL_MODES, NON_DECISION, D1, D2, NOT_ON_LIST_IDS, SEQUENCES } from './scenarios.mjs';

const rel = path.relative(ROOT, BASELINE_PATH).split(path.sep).join('/');

test('baseline — lives under tests/desk/ and names a base commit that is an ancestor of HEAD', () => {
  assert.ok(rel.startsWith('tests/desk/'), `baseline file is under tests/desk/ (${rel})`);
  const b = baseline();
  assert.equal(b.spec, 'S-007');
  assert.match(b.baseCommit, /^[0-9a-f]{40}$/);
  assert.ok(gitOk('merge-base', '--is-ancestor', b.baseCommit, 'HEAD'), 'base commit is an ancestor of HEAD');
});

test('baseline — holds every recorded case the checks compare against', () => {
  const b = baseline();
  for (const m of FAIL_MODES) {
    assert.ok(b.ac9?.[m]?.snap && b.ac9[m].sheets && Array.isArray(b.ac9[m].notices), `ac9 ${m}`);
    for (const id of [...NON_DECISION, D1, D2]) assert.ok(b.ac9[m].sheets[id], `ac9 ${m} sheet ${id}`);
  }
  for (const id of NOT_ON_LIST_IDS) assert.ok(b.notOnList?.[id]?.link && b.notOnList[id].notice, `notOnList ${id}`);
  assert.ok(Array.isArray(b.ac10?.requests) && b.ac10.requests.length > 0, 'ac10');
  for (const n of Object.keys(SEQUENCES)) assert.ok(Array.isArray(b.ac14?.[n]) && b.ac14[n].length === SEQUENCES[n].length, `ac14 ${n}`);
});

test('baseline — committed before any change under src/, and never re-recorded', () => {
  const b = baseline();
  const adds = git('log', '--diff-filter=A', '--format=%H', 'HEAD', '--', rel).split('\n').filter(Boolean);
  assert.ok(adds.length >= 1, `${rel} is committed`);
  const added = adds.at(-1); // the oldest commit that added it
  assert.ok(gitOk('merge-base', '--is-ancestor', b.baseCommit, added), 'baseline added after the base commit');
  const srcBefore = git('log', '--format=%H', `${b.baseCommit}..${added}`, '--', 'src/').split('\n').filter(Boolean);
  assert.deepEqual(srcBefore, [], 'no change under src/ before (or with) the baseline commit');
  const later = git('log', '--format=%H', `${added}..HEAD`, '--', rel).split('\n').filter(Boolean);
  assert.deepEqual(later, [], 'the baseline file is not changed after it was recorded');
  assert.ok(gitOk('diff', '--quiet', 'HEAD', '--', rel), 'the baseline file has no uncommitted change');
});
