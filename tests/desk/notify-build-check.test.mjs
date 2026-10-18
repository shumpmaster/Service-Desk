// The build's check on the sender's imports (spec S-001, J16, Toolchain: "a Node program with no
// dependencies"; build review round 1, Sec 9): src/tools/build.mjs fails when src/notify/ imports
// anything but `node:` built-ins and modules under notify/ and lib/. Run on a scratch copy of src/
// (never the tree itself): the clean copy passes; a bare import, an import from ../functions/ and a
// dynamic import each fail it, naming the file.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '../../src');
const dir = mkdtempSync(join(tmpdir(), 'notify-build-'));
after(() => rmSync(dir, { recursive: true, force: true }));
cpSync(SRC, join(dir, 'src'), { recursive: true, filter: (p) => !p.split(/[\\/]/).includes('node_modules') });
const WORDS = join(dir, 'src', 'notify', 'words.mjs');
const clean = readFileSync(WORDS, 'utf8');

function build() {
  const r = spawnSync(process.execPath, [join(dir, 'src', 'tools', 'build.mjs')], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

test('Sec 9: the clean copy builds', () => {
  const r = build();
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /build: PASS/);
});

for (const [what, line, said] of [
  ['a bare import', "import evil from 'evil';\n", /notify[\\/]words\.mjs imports "evil"; the sender imports only node: built-ins and its own modules/],
  ['an import from ../functions/', "import '../functions/api/poll.js';\n", /notify[\\/]words\.mjs imports \.\.\/functions\/api\/poll\.js, outside notify\/ and lib\//],
  ['a dynamic import', "export const later = () => import('evil');\n", /notify[\\/]words\.mjs imports "evil"/],
]) {
  test(`Sec 9: ${what} in src/notify/ fails the build, naming the file`, () => {
    writeFileSync(WORDS, `${line}${clean}`);
    try {
      const r = build();
      assert.notEqual(r.code, 0, r.out);
      assert.match(r.out, said);
    } finally {
      writeFileSync(WORDS, clean);
    }
  });
}
