#!/usr/bin/env node
// The desk's notification sender (spec S-001, J16; Workflows 3 and 4): a Node program with no
// dependencies, run by each project's own workflow for that project alone.
//
//   node src/notify/run.mjs --project <name> [--root <checkout>] [--out <dir>]
//
// --project names the J7 entry (src/config/projects.json, read from beside this program); --root is
// the workflow's checkout of that project's default branch, with its history (default: the current
// directory); --out is where the state is written for the workflow's upload step (default
// `desk-notify-state` in the current directory), only when the run built a state.
//
// Every value from the event or a secret comes from the environment (Workflow 3: through `env:`):
//   GITHUB_REPOSITORY, GITHUB_REPOSITORY_ID, GITHUB_EVENT_NAME, GITHUB_API_URL   set by the runner
//                               (GITHUB_REPOSITORY_ID: AC76's dating read; missing, a failed state lookup opens the issue at once)
//   GITHUB_TOKEN                the workflow's own token
//   DESK_NOTIFY_RUN_ID          github.event.workflow_run.id, for a workflow_run event
//   DESK_NOTIFY_TEST            inputs.test: "", "true", "fail" or "usage"
//   DESK_VAPID_PRIVATE_KEY, DESK_VAPID_SUBJECT, DESK_PUSH_SUBSCRIPTION, DESK_NOTIFY_STATE_KEY
//   DESK_BILLING_TOKEN          Service-Desk's notify Environment only (J21)
//
// Exit codes: 0 the run did its work (failed sends and a budget stop included); 1 its first step
// stopped it; 2 an internal error.

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSender } from './sender.mjs';
import { openCheckout } from './checkout.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

function args(argv) {
  const out = { project: null, root: '.', out: 'desk-notify-state' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--project' || a === '--root' || a === '--out') {
      if (i + 1 >= argv.length) return null;
      out[a.slice(2)] = argv[++i];
    } else return null;
  }
  return out.project ? out : null;
}

async function main() {
  const a = args(process.argv.slice(2));
  if (!a) {
    console.log('usage: node src/notify/run.mjs --project <name> [--root <checkout>] [--out <dir>]');
    return 1;
  }
  const config = JSON.parse(readFileSync(join(HERE, '..', 'config', 'projects.json'), 'utf8'));
  const project = (config.projects || []).find((p) => p && p.name === a.project);
  if (!project) {
    console.log('desk-notify: stop: --project names no entry in src/config/projects.json');
    return 1;
  }
  const root = resolve(a.root);
  return runSender({
    project, config, env: process.env, fetch: globalThis.fetch,
    now: () => Date.now(), sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    openCheckout: () => openCheckout(root), log: (line) => console.log(line), outDir: resolve(a.out),
  });
}

main().then((code) => {
  process.exitCode = code;
}, (e) => {
  // Only the error's kind and where it was thrown: a message can hold data.
  const at = String((e && e.stack) || '').split('\n').find((l) => /src\/notify\/|src\/lib\//.test(l));
  console.log(`desk-notify: internal error (${(e && e.name) || 'Error'})${at ? ` ${at.trim().replace(/^at /, 'at ').replace(/\(.*(src\/)/, '($1')}` : ''}`);
  process.exitCode = 2;
});
