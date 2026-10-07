// Entry point for `node --test ../tests/desk/` (spec S-001, Toolchain "Tests"): Node 22 runs a
// directory argument as a module, which resolves to this file (package.json "main"). It imports
// every *.test.mjs file in this folder, in name order, so each one's tests run and report.
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(here).filter((f) => f.endsWith('.test.mjs')).sort();
if (files.length === 0) throw new Error('no *.test.mjs files found in tests/desk/');
for (const f of files) await import(pathToFileURL(`${here}/${f}`).href);
