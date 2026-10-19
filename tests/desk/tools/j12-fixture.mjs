// Builds J12's fixture (spec S-001, J12, "The fixture"): GraphQL is not reachable from the agents'
// sessions, so the answer is built in GraphQL's answer shape from REST answers for Service-Desk, a
// public repository, and is NOT as GitHub sent it. Usage, from the repository's root:
//   gh api 'repos/shumpmaster/Service-Desk/pulls?state=all&per_page=100' > <dir>/pulls-all-page1.json
//   gh api 'repos/shumpmaster/Service-Desk/pulls?state=all&per_page=100&page=2' > <dir>/pulls-all-page2.json   (empty: 72 in all)
//   gh api 'repos/shumpmaster/Service-Desk/commits/<head sha>/check-runs?per_page=100' > <dir>/checks-<n>.json   (for #40, #44, #52, #75, #77)
//   gh api 'repos/shumpmaster/Service-Desk/pulls/<n>' > <dir>/pull-<n>.json             (each pull request kept)
//   gh api 'repos/shumpmaster/Service-Desk/pulls/<n>/files?per_page=100' > <dir>/files-<n>.json
//   node tests/desk/tools/j12-fixture.mjs <dir> [--upto <n>]
// It writes tests/desk/fixtures/github/j12-pulls-built.json. `--upto <n>` keeps only pull requests
// numbered n or lower (from 2026-10-19: 77, the 72 the fixture held when it was first built on
// 2026-10-16, so the tests' cases stay as they were). Each REST field is mapped to the
// query's name: number, title, body, state (open → OPEN; closed with merged_at → MERGED; closed
// without → CLOSED), created_at → createdAt, merged_at → mergedAt, closed_at → closedAt, head.ref →
// headRefName, merge_commit_sha → mergeCommit.oid (null unless merged). The check rollup of the last
// commit is built from that commit's check runs, only for the pull requests above (any run not
// completed: PENDING; else any concluded failure, timed_out, cancelled or action_required: FAILURE;
// else SUCCESS), and null for the rest. Only pull requests into main are kept, newest first by
// creation, as the query asks; one page, so hasNextPage is false; endCursor is made up.
// From 2026-10-19 (S-001 draft 5 of "Work ahead by milestones", J12 and AC60's estimate-only
// exception): changed_files from REST pulls/<n> → changedFiles, and the first two paths of REST
// pulls/<n>/files → files { nodes { path } }, as the query's `files(first: 2)` asks.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { FIX } from '../helpers.mjs';

const dir = process.argv[2];
const upto = process.argv.includes('--upto') ? Number(process.argv[process.argv.indexOf('--upto') + 1]) : Infinity;
const pages = ['pulls-all-page1.json', 'pulls-all-page2.json', 'pulls-all-page3.json'].filter((f) => existsSync(join(dir, f)));
const rest = pages.flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));
const own = (n, name) => {
  const f = join(dir, `${name}-${n}.json`);
  if (!existsSync(f)) throw new Error(`${f} is missing: fetch it as the header says`);
  return JSON.parse(readFileSync(f, 'utf8'));
};
const changed = (n) => {
  const pull = own(n, 'pull');
  if (pull.number !== n) throw new Error(`pull-${n}.json holds #${pull.number}`);
  const files = own(n, 'files');
  if (!Array.isArray(files) || files.length !== pull.changed_files) throw new Error(`#${n}: ${files.length} files listed, changed_files ${pull.changed_files}`);
  return { changedFiles: pull.changed_files, files: { nodes: files.slice(0, 2).map((x) => ({ path: x.filename })) } };
};
const rollup = (n) => {
  const f = join(dir, `checks-${n}.json`);
  if (!existsSync(f)) return null;
  const runs = JSON.parse(readFileSync(f, 'utf8')).check_runs || [];
  if (!runs.length) return null;
  if (runs.some((r) => r.status !== 'completed')) return { state: 'PENDING' };
  if (runs.some((r) => ['failure', 'timed_out', 'cancelled', 'action_required'].includes(r.conclusion))) return { state: 'FAILURE' };
  return { state: 'SUCCESS' };
};
const nodes = rest.filter((p) => p.base && p.base.ref === 'main' && p.number <= upto)
  .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
  .map((p) => ({
    number: p.number, title: p.title, body: p.body || '',
    state: p.state === 'open' ? 'OPEN' : p.merged_at ? 'MERGED' : 'CLOSED',
    createdAt: p.created_at, mergedAt: p.merged_at || null, closedAt: p.closed_at || null, headRefName: p.head.ref,
    mergeCommit: p.merged_at && p.merge_commit_sha ? { oid: p.merge_commit_sha } : null,
    ...changed(p.number),
    commits: { nodes: [{ commit: { statusCheckRollup: rollup(p.number) } }] },
  }));
const answer = { data: { repository: { pullRequests: { pageInfo: { hasNextPage: false, endCursor: 'Y3Vyc29yOnYyOpHOMADE-UP' }, nodes } } } };
const out = {
  note: 'NOT as GitHub sent it: J12\'s answer built in GraphQL\'s answer shape from REST answers for shumpmaster/Service-Desk, recorded 2026-10-19 (tests/desk/tools/j12-fixture.mjs says how; tests/desk/fixtures/README.md lists it). The endCursor is made up.',
  status: 200, body: JSON.stringify(answer),
};
writeFileSync(join(FIX, 'github', 'j12-pulls-built.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(`${nodes.length} pull requests`);
