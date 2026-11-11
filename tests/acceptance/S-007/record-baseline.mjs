#!/usr/bin/env node
// Records the S-007 baseline runs (spec S-007, "baseline run"; AC9, AC10, AC14, AC15, AC16, AC17).
// Run by the Builder at the build's base commit, BEFORE any change under src/:
//   node tests/acceptance/S-007/record-baseline.mjs
// It refuses to run if src/ differs from the seam's baseCommit, and writes
// tests/desk/S-007-baseline.json, which the Builder commits before touching src/.
import fs from 'node:fs';
import path from 'node:path';
import { seam, BASELINE_PATH, git, gitOk } from './lib.mjs';
import {
  FAIL_MODES, ac9Records, AC9_MOMENT, NON_DECISION, D1, D2,
  NOT_ON_LIST_IDS, notOnListRecords, NOT_ON_LIST_MOMENT,
  ac10Records, AC10_MOMENT, SEQUENCES,
} from './scenarios.mjs';

const base = seam.baseCommit;
if (!/^[0-9a-f]{40}$/.test(base ?? '')) throw new Error('seam.baseCommit must be a full 40-hex commit id');
if (!gitOk('cat-file', '-e', `${base}^{commit}`)) throw new Error(`base commit ${base} not found`);
// src/ in the working tree (committed or not) must equal src/ at the base commit.
if (!gitOk('diff', '--quiet', base, '--', 'src/')) throw new Error('src/ differs from the base commit; record the baseline before any change under src/');
if (git('status', '--porcelain', '--', 'src/') !== '') throw new Error('src/ has uncommitted or untracked changes');
if (fs.existsSync(BASELINE_PATH) && gitOk('ls-files', '--error-unmatch', BASELINE_PATH)) {
  throw new Error(`${BASELINE_PATH} is already committed; a baseline is recorded once and never re-recorded`);
}

const out = { spec: 'S-007', baseCommit: base, ac9: {}, notOnList: {}, ac10: null, ac14: {} };

for (const mode of FAIL_MODES) {
  const desk = await seam.openDesk();
  const snap = await desk.read({ records: ac9Records(mode), moment: AC9_MOMENT });
  const sheets = {};
  for (const id of [...NON_DECISION, D1, D2]) sheets[id] = await desk.open(id, 'link');
  await desk.close?.();
  const sender = await seam.openSender();
  const run = await sender.run({ records: ac9Records(mode), moment: AC9_MOMENT });
  await sender.close?.();
  out.ac9[mode] = { snap, sheets, notices: run.notices };
}

{
  const desk = await seam.openDesk();
  await desk.read({ records: notOnListRecords(), moment: NOT_ON_LIST_MOMENT });
  for (const id of NOT_ON_LIST_IDS) {
    out.notOnList[id] = { link: await desk.open(id, 'link'), notice: await desk.open(id, 'notice') };
  }
  await desk.close?.();
}

{
  const desk = await seam.openDesk();
  const snap = await desk.read({ records: ac10Records(), moment: AC10_MOMENT });
  out.ac10 = { requests: snap.requests };
  await desk.close?.();
}

for (const [name, steps] of Object.entries(SEQUENCES)) {
  out.ac14[name] = await seam.senderFromLists(steps.map((s) => s.list));
}

fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
fs.writeFileSync(BASELINE_PATH, JSON.stringify(out, null, 2) + '\n');
console.log(`S-007 baseline written to ${BASELINE_PATH} for base commit ${base}`);
