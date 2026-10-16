// Makes AC62's text snapshot (spec S-001, AC62, "Every word kept"): every sandbox screen's text,
// drawn from tests/desk/screen-text.mjs's fixtures, with the parts AC57 to AC60 and AC65 to AC68
// rebuild left out as they were drawn at the time (OLD_REBUILT). Run once, at commit 2c1acb6 (the
// trial-view notes 2 build's base, whose src/ it draws), from the repository's root:
//   node tests/desk/tools/ac62-snapshot.mjs
// It writes tests/desk/fixtures/ac62-text-2c1acb6.json. Not a test: index.js imports *.test.mjs only.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIX } from '../helpers.mjs';
import { screenTexts, OLD_REBUILT } from '../screen-text.mjs';

const texts = await screenTexts(null, OLD_REBUILT);
const out = { note: 'AC62 snapshot: each sandbox screen\'s text at commit 2c1acb6, outside the parts AC57 to AC60 and AC65 to AC68 rebuild (tests/desk/screen-text.mjs, OLD_REBUILT). Made by tests/desk/tools/ac62-snapshot.mjs.', routes: texts };
writeFileSync(join(FIX, 'ac62-text-2c1acb6.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(`${Object.keys(texts).length} routes`);
