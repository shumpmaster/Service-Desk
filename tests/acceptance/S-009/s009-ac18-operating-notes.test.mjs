// S-009 AC18: the operating notes in the handover package (docs/handover/P-003/**). This test checks
// only what can be checked mechanically: the notes are there and name the mark, the three "not
// shown" lines and the rollback's two steps. Whether they say each of AC18's six points in plain
// words is judged against checks/S-009/AC18-rubric.md at the build's review.
// Covers: AC18.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, MARK } from './s009-lib.mjs';

const DIR = 'docs/handover/P-003';

function texts(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) out.push(...texts(p));
    else if (/\.(md|txt)$/i.test(name)) out.push(fs.readFileSync(p, 'utf8'));
  }
  return out;
}

test('AC18: the operating notes are in the handover package and name what AC18 asks', () => {
  const abs = path.join(ROOT, DIR);
  assert.ok(fs.existsSync(abs), `output does not exist yet: ${DIR}/`);
  const all = texts(abs).join('\n');
  assert.ok(all.trim().length > 0, `no notes under ${DIR}/`);
  const want = [
    [MARK, 'the "No Chief of Staff recommendation yet" mark'],
    ['queue/ could not be read', 'the queue/ line (AC16)'],
    ["the Chief of Staff's notes could not be read", 'the notes line (AC16)'],
    ['the dispatch log could not be read', 'the dispatch-log line (AC17)'],
  ];
  for (const [s, what] of want) assert.ok(all.includes(s), `the operating notes do not name ${what}: "${s}"`);
  assert.ok(/\bheld\b/i.test(all), 'the operating notes do not say what a held decision card is');
  assert.ok(/redeploy/i.test(all) && /revert/i.test(all), 'the operating notes do not give the rollback: redeploy the previous production deployment, then revert the merge');
});
