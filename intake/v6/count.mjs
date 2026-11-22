// V6 past-records count, by docs/handover/P-003/operating-notes.md ("J6's check moments and the two figures").
// Run from the Service-Desk root: node <this> <main-ref> <end ISO>
// The rule's code is the working tree's (M4's, main at 3a6613a). The records at each commit are read with
// openCheckout on a git runner whose HEAD is that commit (equivalent to the recipe's detached worktree:
// openCheckout reads HEAD only through `rev-parse --verify HEAD^{commit}`); spot-checked against worktrees.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const root = process.cwd();
const { openCheckout, gitIn } = await import(resolve(root, 'src/notify/checkout.mjs'));
const { readRecords } = await import(resolve(root, 'src/notify/collect.mjs'));
const { decisionStates } = await import(resolve(root, 'src/lib/model.js'));
const config = (await import(resolve(root, 'src/lib/config.js'))).default;
const project = config.projects.find((p) => p.name === 'Service-Desk');
const ref = process.argv[2] || 'origin/main';
const end = new Date(process.argv[3] || new Date().toISOString());
const git = (args) => execFileSync('git', ['-C', root, '-c', 'core.quotepath=off', ...args], { maxBuffer: 1 << 30 }).toString('utf8');
const base = gitIn(root);
function checkoutAt(sha) {
  return openCheckout(root, (args, input) => base(args.map((a) => (a === 'HEAD^{commit}' ? `${sha}^{commit}` : a)), input));
}
// The main line, oldest first.
const line = git(['log', '--first-parent', '--reverse', '--format=%H %cI', ref]).trim().split('\n').map((l) => {
  const [sha, t] = l.split(' '); return { sha, t: Date.parse(t), iso: t };
});
const trees = new Map();
function hasFile(sha, path) {
  if (!trees.has(sha)) trees.set(sha, new Set(git(['ls-tree', '-r', '--name-only', '--full-tree', sha]).split('\n')));
  return trees.get(sha).has(path);
}
// Commits on the main line changing the watched paths.
const watched = new Set(git(['log', '--first-parent', '--format=%H', ref, '--', 'queue/', 'dispatch-log/', 'src/lib/model.js', ':(glob)decisions/*/*-notes.md'])
  .trim().split('\n'));
function currentAt(ms) { let c = null; for (const x of line) { if (x.t <= ms) c = x; else break; } return c; }
const cache = new Map();
function stateAt(sha, ms, id) {
  const key = sha + '@' + ms;
  if (!cache.has(key)) {
    const now = new Date(ms);
    const { tree, records } = readRecords(project, checkoutAt(sha), now);
    const r = decisionStates({ tree, records, now });
    cache.set(key, { cards: r.cards, notRead: r.notRead, withoutNotes: r.withoutNotes });
  }
  const r = cache.get(key);
  if (r.notRead.length) return 'failed read';
  const e = [...r.cards.values()].find((x) => x.id === id);
  if (!e) return r.withoutNotes ? 'failed read' : 'not listed';
  return e.state;
}
// Every decision card file that ever reached the main line.
const added = git(['log', '--first-parent', '--diff-filter=A', '--name-only', '--format=', ref, '--', 'queue/']).split('\n')
  .filter((p) => /^queue\/[A-Z]-\d+-(dor-fail|stop|failure)-\d+\.md$/.test(p));
const cards = [...new Set(added)].sort();
function moments(path, dueMs) {
  const out = [];
  const endMs = end.getTime();
  if (dueMs > endMs) return out;
  out.push(dueMs);
  for (const x of line) if (x.t > dueMs && x.t <= endMs && watched.has(x.sha)) out.push(x.t);
  return out;
}
function figure(path, id, dueMs) {
  let held = [], failed = [], seen = false;
  for (const ms of moments(path, dueMs)) {
    const c = currentAt(ms);
    if (!c) continue;
    const there = hasFile(c.sha, path);
    if (!there) { if (seen) break; else continue; }
    seen = true;
    const s = stateAt(c.sha, ms, id);
    if (s === 'held') held.push([new Date(ms).toISOString(), c.sha.slice(0, 7)]);
    if (s === 'failed read') failed.push([new Date(ms).toISOString(), c.sha.slice(0, 7)]);
  }
  return { held, failed, checked: seen };
}
const rows = [];
for (const path of cards) {
  const id = path.slice(6, -3);
  const arrivals = git(['log', '--first-parent', '--diff-filter=A', '--format=%cI', ref, '--', path]).trim().split('\n');
  const arrival = Date.parse(arrivals[arrivals.length - 1]);
  // Raise time as recorded: the rule's `raised` at the arrival commit and moment.
  const ac = currentAt(arrival);
  const k = ac.sha + '@' + arrival; stateAt(ac.sha, arrival, id);
  const e = [...cache.get(k).cards.values()].find((x) => x.id === id);
  const raised = e ? e.raised : 'not listed at arrival';
  const v6 = raised && raised !== 'not recorded' && raised !== 'not listed at arrival' ? figure(path, id, Date.parse(raised) + 864e5) : null;
  const second = figure(path, id, arrival + 864e5);
  rows.push({ id, arrival: new Date(arrival).toISOString(), raised, v6Miss: v6 ? v6.held.length > 0 : false, v6Held: v6 ? v6.held : [],
    v6Failed: v6 ? v6.failed : [], v6Checked: v6 ? v6.checked : false, secondHeld: second.held, secondFailed: second.failed, secondChecked: second.checked });
  process.stderr.write(`${id} done\n`);
}
console.log(JSON.stringify({ ref: git(['rev-parse', ref]).trim(), end: end.toISOString(), cards: rows.length,
  v6Misses: rows.filter((r) => r.v6Miss).length, secondReported: rows.filter((r) => r.secondHeld.length).length, rows }, null, 1));
