// Entry point for `node --test ../tests/desk/` (spec S-001, Toolchain "Tests"): Node 22 runs a
// directory argument as a module, which resolves to this file (package.json "main"). It imports
// every *.test.mjs file in this folder, in name order, so each one's tests run and report, all in
// one process. From G9's round 2, `npm --prefix src test` runs `node --test ../tests/desk/*.test.mjs`
// instead, each file in its own process: in one process every page load (sandbox-helpers.mjs's
// loadSandbox) stays in memory, and the suite outgrew Node's default heap (specs/S-001.md, Known
// limits, after the glance audit, 1). This entry is kept so the directory form still runs.
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(here).filter((f) => f.endsWith('.test.mjs')).sort();
if (files.length === 0) throw new Error('no *.test.mjs files found in tests/desk/');
for (const f of files) await import(pathToFileURL(`${here}/${f}`).href);
