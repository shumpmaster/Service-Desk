// S-009 AC18: the operating notes in the handover package (docs/handover/P-003/**). AC18 asks for
// plain words, not fixed text, so this test checks only that the notes are there and name the one
// term AC18 quotes, the "No Chief of Staff recommendation yet" mark (either apostrophe, any case,
// any spacing). Whether they say each of AC18's six points is judged against
// checks/S-009/AC18-rubric.md at the build's review.
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

const norm = (t) => t.replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').toLowerCase();

test('AC18: the operating notes are in the handover package and name the mark', () => {
  const abs = path.join(ROOT, DIR);
  assert.ok(fs.existsSync(abs), `output does not exist yet: ${DIR}/`);
  const all = norm(texts(abs).join('\n'));
  assert.ok(all.trim().length > 0, `no notes under ${DIR}/`);
  assert.ok(all.includes(norm(MARK)), `the operating notes do not name the "${MARK}" mark`);
});
