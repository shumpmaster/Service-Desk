// A preload for the sender's exit-2 test (tests/desk/notify-entry.test.mjs): it makes reading
// src/config/projects.json throw an error whose message looks like data, so the test can see that
// run.mjs reports an internal error by its kind and place only, and exits 2. Test-only; nothing
// under src/ loads it.
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';

const original = fs.readFileSync;
fs.readFileSync = function readFileSync(p, ...rest) {
  if (String(p).endsWith('projects.json')) throw new TypeError('made-up message that must not be printed: DESK_SECRET_LOOKALIKE');
  return original.call(this, p, ...rest);
};
syncBuiltinESMExports();
