// V6 count, by docs/handover/P-003/operating-notes.md ("J6's check moments and the two figures") and specs/S-014.md J6.
// Run from the Service-Desk root, with the main branch's full history:
//   node intake/v6/count.mjs <main-ref> <end ISO> [<from ISO>]
// <from> (optional) is the window's start: only check moments at or after it are judged, so a weekly run counts
// the V6 window (from the moment M4 went live) and the past-records run (no <from>) counts the whole history.
// The rule's code is, at each check moment, the code at the commit current then (J6); for a commit before M4 was
// merged (M4_MERGE below), the code as M4 merged it. Each code tree is exported once, by its tree id, with
// `git archive`, into a temporary directory and imported from there; the working tree's src/ is not used.
// The records at each commit are read with openCheckout on a git runner whose HEAD is that commit (equivalent to the
// recipe's detached worktree: openCheckout reads HEAD only through `rev-parse --verify HEAD^{commit}`).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const M4_MERGE = '2783b4852b754bf7e99da732ae03fd3fc1790bb5'; // PR #465, the card fix built (S-014)
const root = process.cwd();
const ref = process.argv[2] || 'origin/main';
const end = new Date(process.argv[3] || new Date().toISOString());
const from = process.argv[4] ? new Date(process.argv[4]) : null;
const git = (args) => execFileSync('git', ['-C', root, '-c', 'core.quotepath=off', ...args], { maxBuffer: 1 << 30 }).toString('utf8');
// The main line, oldest first.
const line = git(['log', '--first-parent', '--reverse', '--format=%H %cI', ref]).trim().split('\n').map((l) => {
  const [sha, t] = l.split(' '); return { sha, t: Date.parse(t), iso: t };
});
const index = new Map(line.map((x, i) => [x.sha, i]));
if (!index.has(M4_MERGE)) throw new Error(`M4's merge ${M4_MERGE} is not on ${ref}'s main line`);
const m4At = index.get(M4_MERGE);
// The rule's code at a commit: its own src/ from M4's merge on, M4's before it.
const work = mkdtempSync(join(tmpdir(), 'v6-count-'));
process.on('exit', () => rmSync(work, { recursive: true, force: true }));
const codes = new Map();
async function codeAt(sha) {
  const tree = git(['rev-parse', `${index.get(sha) < m4At ? M4_MERGE : sha}:src`]).trim();
  if (!codes.has(tree)) {
    const dir = join(work, tree);
    mkdirSync(dir);
    execFileSync('sh', ['-c', 'git -C "$1" archive "$2" | tar -x -C "$3"', 'sh', root, tree, dir]);
    const load = (p) => import(pathToFileURL(join(dir, p)).href);
    const { openCheckout, gitIn } = await load('notify/checkout.mjs');
    const { readRecords } = await load('notify/collect.mjs');
    const { decisionStates } = await load('lib/model.js');
    const config = (await load('lib/config.js')).default;
    codes.set(tree, { tree, openCheckout, gitIn, readRecords, decisionStates, project: config.projects.find((p) => p.name === 'Service-Desk') });
  }
  return codes.get(tree);
}
const trees = new Map();
function hasFile(sha, path) {
  if (!trees.has(sha)) trees.set(sha, new Set(git(['ls-tree', '-r', '--name-only', '--full-tree', sha]).split('\n')));
  return trees.get(sha).has(path);
}
// Commits on the main line changing the watched paths: the records, the rule's code in src/lib/, and the two
// record readers the count runs (reviews/S-009/reviewer.md, N3 and open question 3).
const watched = new Set(git(['log', '--first-parent', '--format=%H', ref, '--', 'queue/', 'dispatch-log/', 'src/lib/',
  'src/notify/collect.mjs', 'src/notify/checkout.mjs', ':(glob)decisions/*/*-notes.md']).trim().split('\n'));
function currentAt(ms) { let c = null; for (const x of line) { if (x.t <= ms) c = x; else break; } return c; }
const cache = new Map();
async function rawAt(sha, ms) {
  const key = sha + '@' + ms;
  if (!cache.has(key)) {
    const c = await codeAt(sha);
    const base = c.gitIn(root);
    const checkout = c.openCheckout(root, (args, input) => base(args.map((a) => (a === 'HEAD^{commit}' ? `${sha}^{commit}` : a)), input));
    const now = new Date(ms);
    const { tree, records } = c.readRecords(c.project, checkout, now);
    const r = c.decisionStates({ tree, records, now });
    cache.set(key, { cards: r.cards, notRead: r.notRead, withoutNotes: r.withoutNotes, code: c.tree });
  }
  return cache.get(key);
}
async function stateAt(sha, ms, id) {
  const r = await rawAt(sha, ms);
  if (r.notRead.length) return 'failed read';
  const e = [...r.cards.values()].find((x) => x.id === id);
  if (!e) return r.withoutNotes ? 'failed read' : 'not listed';
  return e.state;
}
// Every decision card file that ever reached the main line. The item is capital letters, a hyphen and digits
// (specs/S-014.md J1), so P-003 and a longer prefix both match (N5).
const added = git(['log', '--first-parent', '--diff-filter=A', '--name-only', '--format=', ref, '--', 'queue/']).split('\n')
  .filter((p) => /^queue\/[A-Z]+-\d+-(dor-fail|stop|failure)-\d+\.md$/.test(p));
const cards = [...new Set(added)].sort();
const endMs = end.getTime();
const fromMs = from ? from.getTime() : -Infinity;
// A card's check moments from a due time: the due time, then each later watched commit's time, to the end; only
// those at or after <from> are judged. Each moment's commit is the commit current then.
function moments(dueMs) {
  const out = [];
  if (dueMs > endMs) return out;
  out.push(dueMs);
  for (const x of line) if (x.t > dueMs && x.t <= endMs && watched.has(x.sha)) out.push(x.t);
  return out;
}
async function figure(path, id, dueMs) {
  const held = [], failed = []; let seen = false, judged = 0;
  for (const ms of moments(dueMs)) {
    const c = currentAt(ms);
    if (!c) continue;
    const there = hasFile(c.sha, path);
    if (!there) { if (seen) break; else continue; }
    seen = true;
    if (ms < fromMs) continue;
    judged += 1;
    const s = await stateAt(c.sha, ms, id);
    if (s === 'held') held.push([new Date(ms).toISOString(), c.sha.slice(0, 7)]);
    if (s === 'failed read') failed.push([new Date(ms).toISOString(), c.sha.slice(0, 7)]);
  }
  return { held, failed, checked: judged > 0 };
}
// The raise time as recorded: the rule's `raised` at the first of the card's moments (its arrival, then each later
// watched commit while its file is there) at which the rule lists it with a recorded time, so a card whose `card`
// entry reaches the main line after its file still gets a V6 due time (N5).
async function raiseTime(path, id, arrival) {
  const at = [arrival, ...line.filter((x) => x.t > arrival && x.t <= endMs && watched.has(x.sha)).map((x) => x.t)];
  let first = null;
  for (const ms of at) {
    const c = currentAt(ms);
    if (!hasFile(c.sha, path)) break;
    const r = await rawAt(c.sha, ms);
    const e = [...r.cards.values()].find((x) => x.id === id);
    const raised = e ? e.raised : 'not listed';
    if (first === null) first = raised;
    if (raised && raised !== 'not recorded' && raised !== 'not listed') return { raised, at: new Date(ms).toISOString() };
  }
  return { raised: first === 'not listed' ? 'not listed at arrival' : first, at: null };
}
const rows = [];
for (const path of cards) {
  const id = path.slice(6, -3);
  const arrivals = git(['log', '--first-parent', '--diff-filter=A', '--format=%cI', ref, '--', path]).trim().split('\n');
  const arrival = Date.parse(arrivals[arrivals.length - 1]);
  if (arrival > endMs) continue;
  const { raised, at } = await raiseTime(path, id, arrival);
  const timed = raised && raised !== 'not recorded' && raised !== 'not listed at arrival';
  const v6 = timed ? await figure(path, id, Date.parse(raised) + 864e5) : null;
  const second = await figure(path, id, arrival + 864e5);
  rows.push({ id, arrival: new Date(arrival).toISOString(), raised, raisedSeenAt: at, v6Miss: v6 ? v6.held.length > 0 : false,
    v6Held: v6 ? v6.held : [], v6Failed: v6 ? v6.failed : [], v6Checked: v6 ? v6.checked : false,
    secondHeld: second.held, secondFailed: second.failed, secondChecked: second.checked });
  process.stderr.write(`${id} done\n`);
}
console.log(JSON.stringify({ ref: git(['rev-parse', ref]).trim(), from: from ? from.toISOString() : null, end: end.toISOString(),
  ruleCode: [...codes.keys()], cards: rows.length, v6Checked: rows.filter((r) => r.v6Checked).length,
  v6Misses: rows.filter((r) => r.v6Miss).length, secondReported: rows.filter((r) => r.secondHeld.length).length,
  failedReads: rows.filter((r) => r.v6Failed.length || r.secondFailed.length).length, rows }, null, 1));
