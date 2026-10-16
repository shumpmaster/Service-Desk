// Builds J12's fixture (spec S-001, J12, "The fixture"): GraphQL is not reachable from the agents'
// sessions, so the answer is built in GraphQL's answer shape from REST answers for Service-Desk, a
// public repository, and is NOT as GitHub sent it. Usage, from the repository's root:
//   gh api 'repos/shumpmaster/Service-Desk/pulls?state=all&per_page=100' > <dir>/pulls-all-page1.json
//   gh api 'repos/shumpmaster/Service-Desk/pulls?state=all&per_page=100&page=2' > <dir>/pulls-all-page2.json   (empty: 72 in all)
//   gh api 'repos/shumpmaster/Service-Desk/commits/<head sha>/check-runs?per_page=100' > <dir>/checks-<n>.json   (for #40, #44, #52, #75, #77)
//   node tests/desk/tools/j12-fixture.mjs <dir>
// It writes tests/desk/fixtures/github/j12-pulls-built.json. Each REST field is mapped to the
// query's name: number, title, body, state (open → OPEN; closed with merged_at → MERGED; closed
// without → CLOSED), created_at → createdAt, merged_at → mergedAt, closed_at → closedAt, head.ref →
// headRefName, merge_commit_sha → mergeCommit.oid (null unless merged). The check rollup of the last
// commit is built from that commit's check runs, only for the pull requests above (any run not
// completed: PENDING; else any concluded failure, timed_out, cancelled or action_required: FAILURE;
// else SUCCESS), and null for the rest. Only pull requests into main are kept, newest first by
// creation, as the query asks; one page, so hasNextPage is false; endCursor is made up.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { FIX } from '../helpers.mjs';

const dir = process.argv[2];
const rest = [...JSON.parse(readFileSync(join(dir, 'pulls-all-page1.json'), 'utf8')), ...JSON.parse(readFileSync(join(dir, 'pulls-all-page2.json'), 'utf8'))];
const rollup = (n) => {
  const f = join(dir, `checks-${n}.json`);
  if (!existsSync(f)) return null;
  const runs = JSON.parse(readFileSync(f, 'utf8')).check_runs || [];
  if (!runs.length) return null;
  if (runs.some((r) => r.status !== 'completed')) return { state: 'PENDING' };
  if (runs.some((r) => ['failure', 'timed_out', 'cancelled', 'action_required'].includes(r.conclusion))) return { state: 'FAILURE' };
  return { state: 'SUCCESS' };
};
const nodes = rest.filter((p) => p.base && p.base.ref === 'main')
  .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
  .map((p) => ({
    number: p.number, title: p.title, body: p.body || '',
    state: p.state === 'open' ? 'OPEN' : p.merged_at ? 'MERGED' : 'CLOSED',
    createdAt: p.created_at, mergedAt: p.merged_at || null, closedAt: p.closed_at || null, headRefName: p.head.ref,
    mergeCommit: p.merged_at && p.merge_commit_sha ? { oid: p.merge_commit_sha } : null,
    commits: { nodes: [{ commit: { statusCheckRollup: rollup(p.number) } }] },
  }));
const answer = { data: { repository: { pullRequests: { pageInfo: { hasNextPage: false, endCursor: 'Y3Vyc29yOnYyOpHOMADE-UP' }, nodes } } } };
const out = {
  note: 'NOT as GitHub sent it: J12\'s answer built in GraphQL\'s answer shape from REST answers for shumpmaster/Service-Desk, 2026-10-16 (tests/desk/tools/j12-fixture.mjs says how; tests/desk/fixtures/README.md lists it). The endCursor is made up.',
  status: 200, body: JSON.stringify(answer),
};
writeFileSync(join(FIX, 'github', 'j12-pulls-built.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(`${nodes.length} pull requests`);
