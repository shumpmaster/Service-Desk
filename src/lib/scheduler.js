// The page's poll scheduler and per-project reader (spec S-001, J6 "The page's side"; AC4, AC5,
// AC14). One cycle per project per 60 s while the page is visible: a poll call, then the blob
// calls its tree change needs. A failed or rate-limited read is never retried before the next
// scheduled poll; a rate-limited project isn't polled again before its retryAfter.

import { neededReads, parseRecord, recordKind, buildModel, canRecord, recordingAnswers } from './model.js';
import { parseTree, parseHistory, parseCardPath, compareStatus, parsePulls, questionName, classifyPull } from './records.js';
import { parseFilePages, splitChanges, recordedAnswers, closedCanEnd, verdictFiles, parseCommitPages } from './prfiles.js';
import { judgePulls, mergePulls, pullsBackoffMs, PULLS_KEY, OLD_PULLS_KEYS, PULLS_MAX_PAGES, PULLS_RATE_MS } from './pulls.js';
import { dayKey } from './timefmt.js';
import { usageEntry } from './usage.js';
import { newJobsState, partDue, runPhase, pollPart, applyPollAnswer } from './jobwatch.js';
import { RISK_PATHS_PATH, OWNER, listAt, ownerCheckHeads, ownerChecksApply, ownerCheckFrom, judgeFiles, verdictPath, ownBranch, verdictOf } from './j22.js';
import { portfolioKind, parsePortfolioRecord, PORTFOLIO_BLOB_MAX } from './portfolio.js';

// J12 (2026-10-16): the pull-request read counts 5 of a blob call's budget of 25.
export const PULLS_COST = 5;

export const POLL_MS = 60_000;
export const STALE_MS = 180_000;
export const BLOB_BATCH = 25;
const MAX_BLOB_CALLS_PER_CYCLE = 6;
// The blob cache holds parsed records, so its key names the parse's shape: bump it whenever a
// parser's output changes (v2: model S-020's frozen `usage` form, J10; v3: J11's log rows and merge shas; v4: a ruling's
// line 1 and its line-2 `Proxy:`, AC52 and AC55; v5: docs/PROJECT.md's why lines, standard lines and Purpose items,
// an answer's `Reason:` and the review verdict files, AC57 to AC61 and AC70; v6, model 3.5.0's records,
// 2026-10-17: a milestone's ` · reached:` part, an answer record's `Milestone:` line and the Chief of
// Staff's session files, J2, J6, J11 and J13; v7, stage 4 of mockup v2, 2026-10-22: a gate case's
// proposer's recommendation, AC85), and list the old keys here so their entries are dropped, not
// left to fill storage.
export const BLOB_CACHE_KEY = 'desk-blobs-v7';
export const OLD_BLOB_CACHE_KEYS = ['desk-blobs-v1', 'desk-blobs-v2', 'desk-blobs-v3', 'desk-blobs-v4', 'desk-blobs-v5', 'desk-blobs-v6'];
const HISTORY_CACHE_KEY = 'desk-history-v1';
// AC77 (2026-10-18; draft 7): what this device keeps of questions asked in a session, per project:
// `recorded`, each question whose answer's pull request it saw recording, with that pull request's
// number; `ended`, those it found closed unmerged; `here`, those the owner chose to answer here
// instead; and `seen`, when it first saw each open question. Names and numbers only.
export const ASKING_KEY = 'desk-asking-v1';
// J20: an open pull request's files are read once per head sha; a failed read is tried again after this.
export const FILES_RETRY_MS = 5 * 60_000;
export const FILES_PER_CALL = 10;
// AC77: before an answer link opens, a project read more than this long ago is read again first.
export const RECHECK_AFTER_MS = 30_000;
// J21 (AC78): the account's Actions use, at most once an hour while an opening stays open.
export const USAGE_EVERY_MS = 3600_000;
export const USAGE_COST = 5;
// AC77 (draft 7): the closed read counts its worst case, 3 pages; a single pull request read, 1.
export const CLOSED_COST = 3;
export const PR_COST = 1;
export const PRS_PER_CALL = 10;
// J24 (2026-10-20, AC82): a pull request's commits read counts its worst case, 3 pages, of a blob call's 25.
export const COMMITS_COST = 3;
export const COMMITS_PER_CALL = 8;
// AC80 (2026-10-19; draft 4): a pull request head's solo blob calls, the waited J20 read and the
// verdict call's retries together, are at most this many, whoever waits on it (A3). From the points
// settled after stage 1a's build review, round 1 (finding 3), the count holds across openings, kept on
// the device under WAITS_KEY by project, pull request number and head sha.
export const WAITS_KEY = 'desk-board-waits-v1';
export const HEAD_POLLS = 5;
const COMPARE_CACHE_KEY = 'desk-compare-v1';
// J23 (stage 6b): the portfolio's read, every 5 minutes while the page is open (C: the portfolio changes
// rarely, and V1's 5 minutes is the bound for anything waiting on the owner), in the scheduler's own
// queue after the projects' polls, never delaying them; at most one blob call a read. Its parsed blobs are
// kept on the device under their own key, by kind and sha (read once per device, again only when a sha
// changes), apart from the projects' cache.
export const PORTFOLIO_POLL_MS = 300_000;
// v2 (review round 1, B2 and N3): a card's parse keeps its problems apart from the answer path it never has,
// and its `Milestone:` line; v1's entries are dropped and read again.
export const PORTFOLIO_CACHE_KEY = 'desk-portfolio-blobs-v2';
export const OLD_PORTFOLIO_CACHE_KEYS = ['desk-portfolio-blobs-v1'];

export const REASON_WORDS = {
  token: 'the read token was rejected or has expired',
  'rate-limit': "GitHub's rate limit",
  github: 'GitHub error, or the network between Cloudflare and GitHub',
  config: 'the configured default branch was not found',
  'too-many': 'more open PRs, workflow runs or tree entries than one read can page through',
  cloudflare: 'Cloudflare or desk-function error',
  network: "network error: the desk's function could not be reached",
  stale: 'no successful read for 3 minutes',
  page: "the desk page hit an error reading this project's records",
};

/** An error's message, safely: the error itself may be any value, even one that can't be printed. */
export function errorText(err) {
  try {
    if (err && typeof err.message === 'string' && err.message) return err.message.slice(0, 200);
  } catch {
    // fall through
  }
  return 'unknown error';
}

/** Split needed reads into blob calls within the budget (a blob counts 1, a history path 2, a
 * compare 1). */
export function batches(blobs, history, budget = BLOB_BATCH, compare = []) {
  const out = [];
  let cur = { blobs: [], history: [], compare: [], cost: 0 };
  const push = () => {
    if (cur.cost) out.push({ blobs: cur.blobs, history: cur.history, compare: cur.compare });
    cur = { blobs: [], history: [], compare: [], cost: 0 };
  };
  for (const c of compare) {
    if (cur.cost + 1 > budget) push();
    cur.compare.push(c);
    cur.cost += 1;
  }
  for (const path of history) {
    if (cur.cost + 2 > budget) push();
    cur.history.push(path);
    cur.cost += 2;
  }
  for (const sha of blobs) {
    if (cur.cost + 1 > budget) push();
    cur.blobs.push(sha);
    cur.cost += 1;
  }
  push();
  return out;
}

function newProjectState(project) {
  return {
    project, head: null, tree: null, etags: {}, pages: new Map(), pullUrls: [], checkUrls: [],
    checksState: 'ok', checksRead: false, pending: false, lastPollStart: -Infinity, retryUntil: 0,
    lastSuccessAt: null, failure: null, timer: null, withdrawn: [], partialTree: false, polls: 0, blobCalls: 0,
    headAt: null,
    // J12: what the device keeps of the project's pull requests, and where its reads stand.
    // `step` counts failed reads in a row (RATE_LIMITED aside), for J12's backoff; in memory only, so
    // each opening starts it again.
    j12: { pulls: null, day: null, head: null, tooMany: false, cold: null, wait: null, failure: null, fieldError: null, step: 0 },
    // J20 (2026-10-18): each pull request's files by head sha, in memory for this opening; a failed
    // read's time, so it is tried again only after FILES_RETRY_MS.
    files: new Map(), filesTried: new Map(), filesReads: 0, recheckedAt: null,
    // AC77's closed read (drafts 6 to 9): 'none' (due), 'asking' (in flight), 'done' (answered: not
    // made again at the polls that follow) or 'failed' (tried again at the next poll); `poll` is the
    // cycle it was tried in, `gen` the request it answers. `closedGen` counts the times it was asked
    // for again (a `?open=` arrival, a return to the foreground); `closedSettled`: the read asked for
    // last has answered or failed, so a tapped item may show (AC74). An answer to a read issued before
    // the latest arrival settles nothing (draft 9, Desk 7).
    closed: { state: 'none', pulls: [], poll: null, gen: 0 }, closedGen: 0, closedSettled: false,
    // AC77 (draft 7, finding 2b): a recorded answer's pull request that left the open list, read by
    // number: number → { state: 'open' | 'merged' | 'closed' | 'failed', poll }.
    single: new Map(),
    // AC79 (2026-10-19): the asks-merge job's candidates, their conditional reads and the page's verdicts,
    // in memory for this opening only (src/lib/jobwatch.js).
    jobs: newJobsState(), jobsCalls: 0,
    // AC80, J22 (2026-10-19; rule 0 from 2026-10-20), in memory for this opening only: GitHub's owner
    // check by head sha ({ read, state, description, etag }), the heads whose read answered `false`
    // (sha → when; asked again FILES_RETRY_MS later), each verdict blob's word by sha ({ state: 'read', verdict } |
    // { state: 'failed', at }), each pull request head's solo calls (HEAD_POLLS), and the pull
    // requests the page's marks wait on J20 for (`desk.setWaited`).
    j22: { checks: new Map(), refused: new Map(), verdicts: new Map(), headPolls: new Map(), waited: new Set(), verdictCalls: 0, waitedCalls: 0,
      lastSolo: 0 },
    // J24 (2026-10-20, AC82; the MD sandbox only), in memory for this opening: each open pull request's
    // commits by head sha ({ headSha, state: 'read' | 'failed', commits, capped }); a failed read's head
    // and time (asked again at most once in FILES_RETRY_MS, only in a call made anyway); each pull
    // request's first head this opening (a head change while open is due); and the counts.
    j24: { commits: new Map(), tried: new Map(), firstHead: new Map(), rode: new Map(), reads: 0, calls: 0, alone: 0 },
  };
}

/**
 * Create the desk's reader.
 * opts: { config, call(path, body) → Promise<{ ok, status, json?, reason?, words? }>, clock:
 *   { now(), setTimeout(fn, ms), clearTimeout(id) }, store (createStore), pullsStore and waitsStore
 *   (createStore each, J12's list and AC80's waited-read counts, kept apart from the cache), isVisible(),
 *   onChange(), j11 (true in the MD sandbox only: also read J11's optional records), lastLooked() (the MD
 *   sandbox only, J24: AC40's "last looked" in ms, or null with no record, when no commits are read) }
 */
export function createDesk(opts) {
  const { config, call, clock, store } = opts;
  const onChange = opts.onChange || (() => {});
  const isVisible = opts.isVisible || (() => true);
  const states = new Map(config.projects.map((p) => [p.name, newProjectState(p)]));
  // AC80: each head's 5, kept on the device (opts.waitsStore, a store of its own as J12's is), read once
  // at the opening: { project: { "<number>@<head sha>": polls used } }. When that store can't be read or
  // written, the counts live in memory for this opening and no waited read is made at all.
  const waitsStore = opts.waitsStore || null;
  let waits = {};
  let waitsKept = false;
  if (waitsStore) {
    const v = waitsStore.getJSON(WAITS_KEY, {});
    waitsKept = Boolean(waitsStore.usable);
    if (waitsKept && v && typeof v === 'object' && !Array.isArray(v)) {
      for (const [proj, heads] of Object.entries(v)) {
        if (!heads || typeof heads !== 'object') continue;
        const ok = {};
        for (const [k, n] of Object.entries(heads)) if (/^\d+@[0-9a-f]{40}$/.test(k) && Number.isInteger(n) && n >= 0) ok[k] = Math.min(n, 1000);
        waits[proj] = ok;
      }
    }
  }
  const saveWaits = () => {
    if (!waitsStore || !waitsKept) return;
    if (!waitsStore.setJSON(WAITS_KEY, waits)) waitsKept = false;
  };
  // A store that reads but refuses writes (a full quota, some private modes) can't keep the counts
  // either: a write at the opening finds out before any waited read is decided (round 2, N3).
  saveWaits();
  if (store && store.remove) for (const k of OLD_BLOB_CACHE_KEYS) store.remove(k);
  const blobCache = new Map(Object.entries((store && store.getJSON(BLOB_CACHE_KEY, {})) || {}));
  const historyCache = new Map(Object.entries((store && store.getJSON(HISTORY_CACHE_KEY, {})) || {}));
  // AC47: compare answers. `<project>:<tip>` → 'merged' is final (the tip is an ancestor of the
  // head, and stays one); `<project>:<tip>@<head>` → the answer at that head ('behind', 'diverged'
  // or 'failed'), asked again only when the head changes.
  const compareCache = new Map(Object.entries((store && store.getJSON(COMPARE_CACHE_KEY, {})) || {}));
  // J12: kept on the device under their own key, in a store of their own (opts.pullsStore), so that a
  // write that fails there turns off only this key, never the blob cache.
  const pullsStore = opts.pullsStore || null;
  if (opts.j11) {
    // J12's kept list moved to desk-pulls-v2 (2026-10-17): v1's entries lack the job's yes or no, so they are removed and read again.
    if (pullsStore && pullsStore.remove) for (const k of OLD_PULLS_KEYS) pullsStore.remove(k);
    let saved = {};
    try {
      saved = (pullsStore && pullsStore.getJSON(PULLS_KEY, {})) || {};
    } catch {
      saved = {};
    }
    for (const st of states.values()) {
      const e = saved[st.project.name];
      if (e && Array.isArray(e.pulls)) Object.assign(st.j12, { pulls: e.pulls, day: e.day || null, head: e.head || null, tooMany: e.tooMany === true });
    }
  }
  // AC77: kept on the device, per project (see ASKING_KEY).
  let askingSaved = {};
  try {
    askingSaved = (store && store.getJSON(ASKING_KEY, {})) || {};
  } catch {
    askingSaved = {};
  }
  for (const st of states.values()) {
    const e = askingSaved[st.project.name] || {};
    // `recorded` as a list (the form before draft 7, with no numbers) is dropped: the reads find the same ends.
    const rec = e.recorded && typeof e.recorded === 'object' && !Array.isArray(e.recorded) ? e.recorded : {};
    st.asking = {
      recorded: new Map(Object.entries(rec).filter(([, v]) => Number.isInteger(v) && v > 0)),
      ended: new Set(Array.isArray(e.ended) ? e.ended.filter((x) => typeof x === 'string') : []),
      hereInstead: new Set(Array.isArray(e.here) ? e.here : []),
      seen: new Map(Object.entries(e.seen && typeof e.seen === 'object' ? e.seen : {}).filter(([, v]) => Number.isFinite(v))) };
  }
  const desk = {
    openedAt: clock.now(), visibleSince: clock.now(), signedOut: false, running: false, states,
    // J21 (AC78): the usage read, per opening, in the page's memory only.
    usage: { current: null, lastGood: null, at: null, forced: false, asking: false, reads: 0 },
  };

  // ---------------------------------------------------------------------------
  // J23 (stage 6b): the portfolio's read, the MD sandbox's only (opts.j11), and only when J7 names a
  // `portfolio`. It is a read target of its own, never a project: its state, its calls and its failures
  // are its own, and none of them ever touches a project's "read successfully", its counts or its reads.
  const pfConf = opts.j11 && config.portfolio && typeof config.portfolio.repo === 'string' && typeof config.portfolio.defaultBranch === 'string'
    ? { repo: config.portfolio.repo, defaultBranch: config.portfolio.defaultBranch } : null;
  const pf = pfConf ? {
    head: null, headAt: null, etags: {}, tree: null, truncated: false, pending: false, timer: null, turn: false, lastPollStart: -Infinity,
    retryUntil: 0, lastSuccessAt: null, failure: null, readAt: null, polls: 0, blobCalls: 0, checking: false,
  } : null;
  const pfCache = new Map();
  if (pf && store && store.remove) for (const k of OLD_PORTFOLIO_CACHE_KEYS) store.remove(k);
  if (pf && store) {
    try {
      const v = store.getJSON(PORTFOLIO_CACHE_KEY, {});
      if (v && typeof v === 'object' && !Array.isArray(v)) for (const [k, rec] of Object.entries(v)) if (/^pf-(ideas|card):[0-9a-f]{40}$/.test(k)) pfCache.set(k, rec);
    } catch {
      // a cache that can't be read costs only its blobs, read again
    }
  }
  const pfRecords = () => {
    const out = new Map();
    if (!pf || !pf.tree) return out;
    for (const [path, e] of pf.tree) {
      const kind = portfolioKind(path);
      if (kind && pfCache.has(`${kind}:${e.sha}`)) out.set(path, pfCache.get(`${kind}:${e.sha}`));
    }
    return out;
  };
  /** The blobs the portfolio's tree needs now (J23): the idea log and each queue file, not kept yet, within GitHub's contents limit. */
  const pfMissing = () => {
    const out = [];
    if (!pf || !pf.tree || pf.truncated) return out;
    for (const [path, e] of pf.tree) {
      const kind = portfolioKind(path);
      if (!kind || !/^[0-9a-f]{40}$/.test(e.sha || '') || pfCache.has(`${kind}:${e.sha}`)) continue;
      if (Number.isFinite(e.size) && e.size > PORTFOLIO_BLOB_MAX) continue;
      out.push({ path, sha: e.sha, kind });
    }
    return out;
  };
  const pfPersist = () => {
    if (!store) return;
    const live = new Set();
    if (pf.tree) for (const [path, e] of pf.tree) { const k = portfolioKind(path); if (k) live.add(`${k}:${e.sha}`); }
    for (const k of [...pfCache.keys()]) if (!live.has(k)) pfCache.delete(k);
    try {
      store.setJSON(PORTFOLIO_CACHE_KEY, Object.fromEntries(pfCache));
    } catch {
      // kept in memory for this opening
    }
  };
  // A project's poll under way, or due now (its timer set for this moment or before): the portfolio's read goes after it.
  const anyProjectPending = () => [...states.values()].some((s) => s.pending || (s.timer != null && s.dueAt != null && s.dueAt <= clock.now()));
  function pfSchedule() {
    if (!pf) return;
    if (pf.timer != null) clock.clearTimeout(pf.timer);
    pf.timer = null;
    if (!desk.running || !isVisible() || pf.pending) return;
    const at = Math.max(pf.lastPollStart + PORTFOLIO_POLL_MS, pf.retryUntil, clock.now());
    pf.timer = clock.setTimeout(() => {
      pf.timer = null;
      if (!desk.running || !isVisible() || pf.pending) return;
      // Its own queue, after the projects' polls: while a project's poll is under way it waits its turn,
      // taken as the last of them ends; a project's poll never waits for it.
      if (anyProjectPending()) pf.turn = true;
      else pfCycle();
    }, at - clock.now());
  }
  /** Called as each project's cycle ends: the portfolio's read, if it was waiting its turn, once no project's is under way. */
  function pfTurn() {
    if (!pf || !pf.turn || anyProjectPending() || pf.pending || !desk.running || !isVisible()) return;
    pf.turn = false;
    pfCycle();
  }
  async function pfCycle() {
    pf.pending = true;
    pf.lastPollStart = clock.now();
    pf.polls++;
    let outcome;
    try {
      const res = await call('/api/poll', { target: 'portfolio', head: pf.head, etags: pf.head ? { ...pf.etags } : {} });
      if (!res.ok) outcome = { ok: false, reason: res.reason || 'network' };
      else if (res.json.state === 'cant-read') outcome = { ok: false, reason: res.json.reason || 'github', retryAfter: res.json.retryAfter };
      else {
        const r = res.json;
        pf.etags = r.etags && typeof r.etags === 'object' ? r.etags : {};
        outcome = { ok: true };
        if (r.head && r.head.sha !== pf.head) {
          const tree = r.tree == null ? null : parseTree(r.tree);
          if (!tree || !tree.ok) {
            pf.etags = {};
            outcome = { ok: false, reason: 'github' };
          } else {
            pf.tree = tree.blobs;
            pf.truncated = tree.truncated;
            pf.head = r.head.sha;
            pf.headAt = r.head.committedAt || null;
          }
        }
        if (outcome.ok && pf.truncated) outcome = { ok: false, reason: 'too-many', keep: true };
        if (outcome.ok) {
          // At most one blob call a read (A3): what passes its 25 waits for the next read.
          const need = pfMissing();
          if (need.length) {
            const batch = need.slice(0, BLOB_BATCH);
            pf.blobCalls++;
            const b = await call('/api/blobs', { target: 'portfolio', blobs: [...new Set(batch.map((x) => x.sha))] });
            if (!b.ok) outcome = { ok: false, reason: b.reason || 'network' };
            else if (b.json.state !== 'ok') outcome = { ok: false, reason: b.json.reason || 'github', retryAfter: b.json.retryAfter };
            else {
              for (const x of batch) {
                const text = b.json.blobs ? b.json.blobs[x.sha] : null;
                if (typeof text === 'string') pfCache.set(`${x.kind}:${x.sha}`, parsePortfolioRecord(x.kind, text));
              }
              pfPersist();
              if (pfMissing().length) outcome = { ok: false, pending: true };
            }
          }
        }
      }
    } catch {
      outcome = { ok: false, reason: 'page' };
    }
    pf.readAt = clock.now();
    if (outcome.ok) {
      pf.lastSuccessAt = clock.now();
      pf.failure = null;
      pf.checking = false;
    } else if (outcome.pending) {
      pf.checking = true;
    } else {
      pf.checking = false;
      if (outcome.reason === 'rate-limit' && outcome.retryAfter) pf.retryUntil = clock.now() + outcome.retryAfter * 1000;
      // A 403 or 404 on its branch (the read token doesn't include it yet: Setup P1) is asked again only at
      // the next 5-minute read; any other failure is AC5's "Can't read your portfolio since HH:MM".
      pf.failure = { kind: outcome.reason === 'no-access' ? 'access' : 'other', reason: outcome.reason, since: pf.failure ? pf.failure.since : clock.now() };
    }
    pf.pending = false;
    try {
      onChange();
    } catch {
      // as in cycle: a failed render never changes what is read
    } finally {
      pfSchedule();
    }
  }

  /** Keep AC77's per-device record, pruned to the questions still open. */
  function persistAsking() {
    if (!store) return;
    const out = {};
    for (const st of states.values()) {
      const a = st.asking;
      const open = st.tree ? new Set([...st.tree.keys()].map(questionName).filter(Boolean)) : null;
      const keep = (n) => !open || open.has(n);
      out[st.project.name] = { recorded: Object.fromEntries([...a.recorded].filter(([n]) => keep(n))), ended: [...a.ended].filter(keep),
        here: [...a.hereInstead].filter(keep),
        seen: Object.fromEntries([...a.seen].filter(([p]) => !st.tree || st.tree.has(p))) };
    }
    try {
      store.setJSON(ASKING_KEY, out);
    } catch {
      // a failed write costs only this device's memory of the holds
    }
  }

  /** The project's open pull requests, as last read. */
  const pullsOf = (st) => parsePulls(st.pullRaws || []).pulls;

  /**
   * AC77, J20: what the device notes after a read: each open question first seen now; each question
   * whose answer an open pull request records, with that pull request's number (its hold ends then,
   * so that pull request closing unmerged leaves the question open); and each question whose hold a
   * closed pull request ended, found by the closed read (closed unmerged after the question was
   * raised) or by the single read of its recorded pull request (draft 7).
   */
  function noteAsking(st) {
    if (!st.tree) return;
    const a = st.asking;
    const now = clock.now();
    let changed = false;
    for (const path of st.tree.keys()) {
      if (questionName(path) && !a.seen.has(path)) {
        a.seen.set(path, now);
        changed = true;
      }
    }
    for (const [n, pr] of recordingAnswers(st.project, pullsOf(st), st.files)) {
      if (a.recorded.get(n) !== pr.number) {
        a.recorded.set(n, pr.number);
        changed = true;
      }
      if (a.ended.delete(n)) changed = true;
    }
    if (st.closed.state === 'done') {
      const history = historyFor(st);
      for (const c of st.closed.pulls) {
        const f = st.files.get(c.number);
        if (!f || f.headSha !== c.headSha) continue;
        for (const n of recordedAnswers(f.changes, st.project.model)) {
          const h = history.get(`questions/${n}.md`);
          const raised = h && h.oldest ? Date.parse(h.oldest) : NaN;
          if (!Number.isFinite(raised) || !(c.closedMs > raised)) continue;
          const r = a.recorded.get(n);
          if (r != null && r !== c.number) continue; // another pull request records it: that one decides
          if (r === c.number) a.recorded.delete(n);
          if (!a.ended.has(n)) a.ended.add(n);
          changed = true;
        }
      }
    }
    for (const [n, num] of [...a.recorded]) {
      const one = st.single.get(num);
      if (one && one.state === 'closed') {
        a.recorded.delete(n);
        a.ended.add(n);
        changed = true;
      }
    }
    // An entry whose question has left (answered or gone) is dropped, so the record stays pruned.
    const gone = (n) => !st.tree.has(`questions/${n}.md`);
    for (const n of [...a.recorded.keys()]) if (gone(n) && a.recorded.delete(n)) changed = true;
    for (const set of [a.ended, a.hereInstead]) for (const n of [...set]) if (gone(n) && set.delete(n)) changed = true;
    for (const p of [...a.seen.keys()]) if (!st.tree.has(p) && a.seen.delete(p)) changed = true;
    if (changed) persistAsking();
  }

  /** Each held question's raised time (ms), or NaN while its history read has not arrived. */
  function raisedTimes(st, held) {
    const history = historyFor(st);
    return held.map((q) => {
      const h = history.get(q.path);
      return h && h.oldest ? Date.parse(h.oldest) : NaN;
    });
  }

  /**
   * AC77 (draft 7, finding 2b): the recorded answers' pull requests to read by number now: the
   * question still open, its pull request gone from the open list, and no answer yet that settles it
   * (merged or closed); a failed or "still open" answer is read again at the next poll.
   */
  function singlesDue(st) {
    if (!st.tree) return [];
    const open = new Set(pullsOf(st).map((p) => p.number));
    const out = [];
    for (const [n, num] of st.asking.recorded) {
      if (!st.tree.has(`questions/${n}.md`) || open.has(num) || out.includes(num)) continue;
      const one = st.single.get(num);
      if (one && (one.state === 'merged' || one.state === 'closed' || one.poll === st.polls)) continue;
      out.push(num);
    }
    return out.slice(0, PRS_PER_CALL);
  }

  /** The held questions (AC77), from the model the page would draw now. */
  function heldQuestions(st) {
    try {
      return (desk.model(st.project.name).asking || []).filter((x) => x.state === 'held');
    } catch {
      return [];
    }
  }

  /**
   * The extra reads a blob call can carry now (J20, AC77's closed and single reads, J21): { files: [n],
   * closed: null | { since }, prs: [n], usage }. Each is optional: a failure never touches "read
   * successfully". The closed read is made only once every held question's raised time has arrived,
   * with the earliest as its limit (draft 7, finding 2a); while one is unread it waits.
   */
  function extrasDue(st) {
    const now = clock.now();
    const files = [];
    const want = (n, headSha) => {
      if (!headSha || files.includes(n)) return;
      const f = st.files.get(n);
      if (f && f.headSha === headSha) return;
      const tried = st.filesTried.get(n);
      // An open pull request's failed read waits J20's 5 minutes; a found closed one's is tried again at
      // the next poll (draft 9, Desk 4).
      if (tried && tried.headSha === headSha && (closedOne ? tried.poll === st.polls : now - tried.at < FILES_RETRY_MS)) return;
      files.push(n);
    };
    let closedOne = false;
    for (const pr of pullsOf(st)) if (canRecord(pr, st.project)) want(pr.number, pr.headSha);
    closedOne = true;
    if (st.closed.state === 'done') for (const c of st.closed.pulls) want(c.number, c.headSha);
    let closed = null;
    const due = st.closed.state === 'none' || (st.closed.state === 'failed' && st.closed.poll !== st.polls);
    const held = due && st.tree ? heldQuestions(st) : [];
    if (held.length) {
      const raised = raisedTimes(st, held);
      if (raised.every(Number.isFinite)) closed = { since: new Date(Math.min(...raised)).toISOString() };
    }
    const prs = singlesDue(st);
    const u = desk.usage;
    const ue = usageEntry(config);
    const cfg = ue ? ue.cfg : null;
    const usage = Boolean(cfg && cfg.reported !== false && !u.asking && (u.at == null || u.forced || now - u.at >= USAGE_EVERY_MS));
    return { files: files.slice(0, FILES_PER_CALL), closed, prs, usage, any: files.length > 0 || Boolean(closed) || prs.length > 0 || usage };
  }

  /**
   * J24's commits read (the MD sandbox only): for each open, non-draft pull request into the default
   * branch from the project's own repository (J20's), one not read at its head in this opening, whose
   * `updated_at` in J1's list is later than "last looked" or whose head changed while the page was open.
   * { first: [n] } ride the cycle's optional loop with J20's read of the same head, due now or asked in
   * this cycle (the overflow of a call's 25 in its next call); { wait: [n] }, a first read with no J20
   * read of its head to ride (its `updated_at` moved, its head did not: a comment or a label), and
   * { retry: [n] }, a failed read asked again at most once in FILES_RETRY_MS, go only in a call of the
   * optional loop made anyway, never a call of their own (the Reviewer's B2, stage 2 round 1).
   */
  function commitsDue(st) {
    const out = { first: [], wait: [], retry: [] };
    const since = opts.lastLooked ? opts.lastLooked() : null;
    if (!opts.j11 || since == null || !Number.isFinite(since)) return out;
    const now = clock.now();
    for (const pr of pullsOf(st)) {
      if (!canRecord(pr, st.project) || !pr.headSha) continue;
      if (!st.j24.firstHead.has(pr.number)) st.j24.firstHead.set(pr.number, pr.headSha);
      const have = st.j24.commits.get(pr.number);
      if (have && have.headSha === pr.headSha && have.state === 'read') continue;
      const changed = st.j24.firstHead.get(pr.number) !== pr.headSha;
      const updated = Date.parse(pr.updatedAt) > since;
      if (!changed && !updated) continue;
      const tried = st.j24.tried.get(pr.number);
      if (tried && tried.headSha === pr.headSha) {
        if (now - tried.at >= FILES_RETRY_MS) out.retry.push(pr.number);
        continue;
      }
      // J20's read of this head: due now (not kept at this head, and no failed read in its last 5
      // minutes), or asked in this cycle's calls.
      const f = st.files.get(pr.number);
      const ft = st.filesTried.get(pr.number);
      const filesDue = !(f && f.headSha === pr.headSha) && !(ft && ft.headSha === pr.headSha && now - ft.at < FILES_RETRY_MS);
      const rode = st.j24.rode.get(pr.number);
      const asked = Boolean(rode && rode.headSha === pr.headSha && rode.poll === st.polls);
      (filesDue || asked ? out.first : out.wait).push(pr.number);
    }
    return out;
  }

  /**
   * AC77's closed read (drafts 6 and 7): the closed pull requests that could have recorded a held
   * question's answer: own-branch, non-draft, into the default branch, closed unmerged after `since`.
   * No answer (a failed read, or a fourth page needed) keeps the hold, and is tried at the next poll.
   */
  function applyClosed(st, ans, sinceMs, gen) {
    if (gen !== st.closedGen) return; // asked for again since this read was issued: it settles nothing
    if (!ans || !Array.isArray(ans.pulls)) {
      st.closed = { state: 'failed', pulls: [], poll: st.polls, gen };
      return;
    }
    const pulls = [];
    for (const p of ans.pulls) {
      if (!closedCanEnd(p, st.project, sinceMs) || !p.head || typeof p.head.sha !== 'string') continue;
      pulls.push({ number: p.number, headSha: p.head.sha, closedMs: Date.parse(p.closed_at) });
    }
    st.closed = { state: 'done', pulls, poll: st.polls, gen };
  }

  /** AC77 (draft 7, finding 2b): a single pull request's answer, kept for this opening. */
  function applySingle(st, n, p) {
    let state = 'failed';
    if (p && p.number === n) {
      if (p.state === 'open') state = 'open';
      else if (p.state === 'closed') state = p.merged_at != null ? 'merged' : 'closed';
    }
    st.single.set(n, { state, poll: st.polls });
  }

  /**
   * AC77 (draft 8): run the closed read again for a project holding a question (a `?open=` arrival,
   * a return to the foreground). Returns whether it holds one.
   */
  function closedAgain(st, { keepAsking = false } = {}) {
    if (!st.tree || !heldQuestions(st).length) return false;
    if (keepAsking && st.closed.state === 'asking') return true; // a read for a tap is already under way
    st.closedGen++;
    st.closed = { state: 'none', pulls: [], poll: null, gen: st.closedGen };
    st.closedSettled = false;
    return true;
  }

  /**
   * AC74, AC77 (draft 9, Desk 5 and 7): a `?open=` arrival's closed read, at once, in a blob call of its
   * own, then the found pull requests' files; the tapped item shows once it has answered or failed. A
   * held question's raised time not read counts as the read failing.
   */
  async function closedNow(st) {
    const gen = st.closedGen;
    try {
      const ex = extrasDue(st);
      if (ex.closed) {
        await blobCall(st, { byPath: new Map() }, { blobs: [], history: [], compare: [], closed: ex.closed });
        if (st.closedGen === gen && st.closed.state === 'done') {
          const files = st.closed.pulls.filter((c) => {
            const f = st.files.get(c.number);
            return !f || f.headSha !== c.headSha;
          }).map((c) => c.number).slice(0, FILES_PER_CALL);
          if (files.length) await blobCall(st, { byPath: new Map() }, { blobs: [], history: [], compare: [], files });
        }
      } else if (st.closedGen === gen) st.closed = { state: 'failed', pulls: [], poll: st.polls, gen };
    } catch {
      if (st.closedGen === gen) st.closed = { state: 'failed', pulls: [], poll: st.polls, gen };
    }
    if (st.closedGen === gen && (st.closed.state === 'done' || st.closed.state === 'failed')) st.closedSettled = true;
    try {
      onChange();
    } catch {
      // as in cycle
    }
  }

  const cacheKey = (kind, sha) => `${kind}:${sha}`;

  function persist() {
    if (!store) return;
    const live = new Set();
    for (const st of states.values()) {
      if (!st.tree) continue;
      for (const [path, e] of st.tree) {
        const kind = recordKind(path, st.project.model);
        if (kind) live.add(cacheKey(kind, e.sha));
      }
    }
    const keep = {};
    for (const [k, v] of blobCache) if (live.has(k)) keep[k] = v;
    store.setJSON(BLOB_CACHE_KEY, keep);
    store.setJSON(HISTORY_CACHE_KEY, Object.fromEntries(historyCache));
    const heads = new Set([...states.values()].map((x) => `${x.project.name}:${x.head}`));
    const compares = {};
    for (const [k, v] of compareCache) {
      const at = k.indexOf('@');
      if (at < 0 || heads.has(`${k.slice(0, k.indexOf(':'))}:${k.slice(at + 1)}`)) compares[k] = v;
    }
    store.setJSON(COMPARE_CACHE_KEY, compares);
  }

  function persistPulls() {
    if (!pullsStore) return;
    const out = {};
    for (const st of states.values()) {
      const j = st.j12;
      if (j.pulls) out[st.project.name] = { day: j.day, head: j.head, tooMany: j.tooMany, pulls: j.pulls };
    }
    try {
      pullsStore.setJSON(PULLS_KEY, out);
    } catch {
      // a failed write costs only what this key keeps; the pull requests stay in memory for the window
    }
  }

  /**
   * The J12 read a project needs now, or null (J12, "When the page reads it"; v3 projects in the MD
   * sandbox only): the next page of a cold read under way; a cold read (the first load on this device,
   * and the first each day after midnight in ownerTimeZone), from the first page; or, on a head
   * change, the first page only. After a RATE_LIMITED answer, none for 60 minutes, then the read
   * again (draft 6, N2); after any other failed read, none until J12's backoff has passed (5, 10, 20,
   * 40, then 60 minutes; the desk follow-ups of 2026-10-17). During either wait no J12 read is made,
   * head change or not; when it ends, the read made is whatever is due then.
   */
  function pullsDue(st) {
    if (!opts.j11 || st.project.model !== 'v3' || !st.head) return null;
    const j = st.j12;
    const now = clock.now();
    if (j.wait && now < j.wait.until) return null;
    if (j.cold) return { after: j.cold.after, cold: true };
    if (j.pulls == null || j.day !== dayKey(new Date(now), config.ownerTimeZone)) return { after: null, cold: true };
    if (j.head !== st.head) return { after: null, cold: false };
    return null;
  }

  /** One J12 answer (raw, or null), for the read `asked` made at the project's head. */
  function applyPulls(st, asked, raw) {
    const j = st.j12;
    const now = clock.now();
    const v = judgePulls(raw);
    if (!v.ok) {
      j.failure = v.reason;
      j.rate = v.rate;
      j.cold = null;
      if (v.rate) {
        // A rate limit: its plain 60 minutes; the backoff's step neither advances nor resets.
        j.wait = { until: now + PULLS_RATE_MS };
      } else {
        // Any other failed read: J12's backoff, one step further for each failure in a row.
        j.wait = { until: now + pullsBackoffMs(j.step) };
        j.step = (j.step || 0) + 1;
      }
      return;
    }
    j.failure = null;
    j.rate = false;
    j.wait = null;
    j.step = 0;
    j.fieldError = v.fieldError;
    j.pulls = mergePulls(j.pulls || [], v.pulls);
    if (asked.cold) {
      const page = (j.cold ? j.cold.page : 0) + 1;
      if (v.hasNext && v.cursor && page < PULLS_MAX_PAGES) j.cold = { after: v.cursor, page };
      else {
        j.cold = null;
        j.day = dayKey(new Date(now), config.ownerTimeZone);
        j.tooMany = v.hasNext;
        j.head = st.head;
      }
    } else j.head = st.head;
    persistPulls();
  }

  function recordsFor(st) {
    const records = new Map();
    if (!st.tree) return records;
    for (const [path, e] of st.tree) {
      const kind = recordKind(path, st.project.model);
      if (!kind) continue;
      const v = blobCache.get(cacheKey(kind, e.sha));
      if (v !== undefined) records.set(path, v);
    }
    return records;
  }

  function historyFor(st) {
    const out = new Map();
    for (const [k, v] of historyCache) {
      const prefix = `${st.project.name}:`;
      if (k.startsWith(prefix)) out.set(k.slice(prefix.length), v);
    }
    return out;
  }

  /** The compare answers for this project at its current head: tip → 'merged' | answer. */
  function compareFor(st) {
    const out = new Map();
    const prefix = `${st.project.name}:`;
    for (const [k, v] of compareCache) {
      if (!k.startsWith(prefix)) continue;
      const rest = k.slice(prefix.length);
      const at = rest.indexOf('@');
      if (at < 0) out.set(rest, v);
      else if (rest.slice(at + 1) === st.head && !out.has(rest.slice(0, at))) out.set(rest.slice(0, at), v);
    }
    return out;
  }

  function missing(st) {
    const now = new Date(clock.now());
    const records = recordsFor(st);
    const need = neededReads(st.project, st.tree, records, now, { history: historyFor(st), head: st.head, compare: compareFor(st),
      j11: Boolean(opts.j11) });
    const byPath = new Map();
    const shasOf = (list) => {
      const out = [];
      for (const b of list) {
        if (blobCache.has(cacheKey(b.kind, b.sha))) continue;
        if (!out.includes(b.sha)) out.push(b.sha);
        byPath.set(b.path, b);
      }
      return out;
    };
    const unread = (paths) => paths.filter((p) => !historyCache.has(`${st.project.name}:${p}`));
    const shas = shasOf(need.blobs);
    const optional = { shas: shasOf(need.optional.blobs).filter((x) => !shas.includes(x)), history: unread(need.optional.history) };
    return { shas, history: unread(need.history), byPath, compare: need.compare, optional };
  }

  // AC34: a run of failures keeps the time of its first ("since": the project hasn't been read
  // since then), and its reason and words follow the latest failure, so a page error that changes
  // shows the new error (review N5 on PR #41). A success ends the run.
  function fail(st, reason, words) {
    const now = clock.now();
    const text = words || REASON_WORDS[reason] || reason;
    st.failure = { reason, words: text, since: st.failure ? st.failure.since : now };
  }

  function applyPoll(st, r) {
    for (const [url, tag] of Object.entries(r.etags || {})) st.etags[url] = tag;
    const takeList = (pages, urls, next) => {
      const out = [];
      let more = false;
      (urls || []).forEach((url, i) => {
        let page = st.pages.get(url);
        if (pages[i] != null) {
          page = { raw: pages[i], next: next[i] === true };
          st.pages.set(url, page);
        }
        if (!page) return out.push(undefined);
        out.push(page.raw);
        // A list's third page that names a next page: more than one read can page through (J1).
        // `checks` holds two lists (3a then 3b), so the page number is read from each URL.
        if (/[?&]page=3$/.test(url) && page.next) more = true;
      });
      return { raws: out, more };
    };
    const pl = takeList(r.pulls || [], r.pullUrls || [], r.pullNext || []);
    const cl = takeList(r.checks || [], r.checkUrls || [], r.checkNext || []);
    // Keep only the pages this poll used, and their ETags (J6: at most 10 entries).
    const used = new Set([...(r.pullUrls || []), ...(r.checkUrls || [])]);
    for (const url of [...st.pages.keys()]) if (!used.has(url)) st.pages.delete(url);
    const branchUrl = Object.keys(r.etags || {}).find((u) => !used.has(u));
    const keep = {};
    for (const [u, tag] of Object.entries(st.etags)) if (used.has(u) || u === branchUrl) keep[u] = tag;
    st.etags = keep;
    st.pullUrls = r.pullUrls || [];
    st.checkUrls = r.checkUrls || [];
    st.pullRaws = pl.raws;
    st.checksState = r.checksState || 'ok';
    st.checkRaws = st.checksState === 'cant-read' ? [] : cl.raws;
    st.checksRead = true;
    const lost = pl.raws.includes(undefined) || cl.raws.includes(undefined);
    if (r.head && r.head.sha !== st.head) {
      if (r.tree == null) return { ok: false, reason: 'github' };
      const tree = parseTree(r.tree);
      if (!tree.ok) return { ok: false, reason: 'github' };
      if (st.tree) {
        for (const path of st.tree.keys()) {
          const card = parseCardPath(path);
          if (card && !tree.blobs.has(path) && !tree.blobs.has(card.answerPath)) {
            st.withdrawn = [...st.withdrawn, path].slice(-10);
          }
        }
      }
      st.tree = tree.blobs;
      st.partialTree = tree.truncated;
      st.head = r.head.sha;
      st.headAt = r.head.committedAt || null; // AC71: the head commit's time, a movement
    }
    if (lost) {
      // A 304 for a page this window never held: forget the ETags so the next poll reads in full.
      st.etags = {};
      return { ok: false, reason: 'github' };
    }
    if (st.partialTree || pl.more || cl.more || r.state === 'partial') return { ok: false, reason: 'too-many' };
    return { ok: true };
  }

  /** One blob call for these reads; returns { res, progress } (progress: anything asked arrived). */
  async function blobCall(st, need, batch) {
    st.blobCalls++;
    const body = { project: st.project.name, blobs: batch.blobs, history: batch.history };
    if (batch.compare.length) body.compare = batch.compare;
    if (batch.pulls) body.pulls = { after: batch.pulls.after };
    if (batch.files && batch.files.length) body.files = batch.files;
    if (batch.commits && batch.commits.length) {
      body.commits = batch.commits;
      st.j24.calls++;
      if (!body.files && !body.blobs.length && !body.history.length && !batch.pulls && !batch.closed && !(batch.prs && batch.prs.length) && !batch.usage
        && !(batch.compare && batch.compare.length)) st.j24.alone++;
    }
    const closedGen = st.closedGen;
    if (batch.closed) {
      body.closed = batch.closed;
      st.closed = { ...st.closed, state: 'asking', gen: closedGen };
    }
    if (batch.prs && batch.prs.length) body.prs = batch.prs;
    if (batch.usage) {
      body.usage = true;
      desk.usage.asking = true;
    }
    const heads = new Map();
    for (const pr of pullsOf(st)) heads.set(pr.number, pr.headSha);
    for (const c of st.closed.pulls) if (!heads.has(c.number)) heads.set(c.number, c.headSha);
    const res = await call('/api/blobs', body);
    const r0 = res.ok ? res.json : null;
    let extras = false;
    // J20: each answer kept by the head sha it was asked at; a failed one tried again later.
    for (const n of batch.files || []) {
      st.filesReads++;
      st.j24.rode.set(n, { headSha: heads.get(n) || null, poll: st.polls });
      const raw = r0 && r0.files ? r0.files[n] : null;
      const parsed = Array.isArray(raw) ? parseFilePages(raw) : { ok: false };
      if (parsed.ok) {
        st.files.set(n, { headSha: heads.get(n) || null, changes: splitChanges(parsed.files), capped: parsed.capped, verdicts: verdictFiles(parsed.files) });
        st.filesTried.delete(n);
        extras = true;
      } else st.filesTried.set(n, { headSha: heads.get(n) || null, at: clock.now(), poll: st.polls });
    }
    // J24: each commits read kept by the head sha it was asked at; a failed one asked again later.
    for (const n of batch.commits || []) {
      st.j24.reads++;
      const parsed = parseCommitPages(r0 && r0.commits ? r0.commits[n] : null);
      if (parsed.ok) {
        st.j24.commits.set(n, { headSha: heads.get(n) || null, state: 'read', commits: parsed.commits, capped: parsed.capped });
        st.j24.tried.delete(n);
        extras = true;
      } else {
        st.j24.commits.set(n, { headSha: heads.get(n) || null, state: 'failed', commits: [], capped: false });
        st.j24.tried.set(n, { headSha: heads.get(n) || null, at: clock.now() });
      }
    }
    if (batch.closed) {
      applyClosed(st, r0 && Object.prototype.hasOwnProperty.call(r0, 'closed') ? r0.closed : null, Date.parse(batch.closed.since), closedGen);
      extras = true;
    }
    for (const n of batch.prs || []) {
      applySingle(st, n, r0 && r0.prs ? r0.prs[n] : null);
      extras = true;
    }
    if (batch.usage) {
      const u = desk.usage;
      u.asking = false;
      u.at = clock.now();
      u.forced = false;
      u.reads++;
      u.current = r0 && r0.usage && typeof r0.usage.state === 'string' ? r0.usage : { state: 'unavailable', asOf: new Date(clock.now()).toISOString() };
      if (u.current.state === 'ok') u.lastGood = u.current;
      extras = true;
    }
    if (extras) noteAsking(st);
    if (!res.ok) {
      if (batch.pulls) applyPulls(st, batch.pulls, null);
      return { res, progress: false, extras };
    }
    const r = res.json;
    let progress = false;
    // The call answered: its `pulls` is J12's answer (null when it failed or the call stopped first).
    if (batch.pulls) applyPulls(st, batch.pulls, r && Object.prototype.hasOwnProperty.call(r, 'pulls') ? r.pulls : null);
    for (const [sha, text] of Object.entries(r.blobs || {})) {
      if (text == null) continue;
      for (const b of need.byPath.values()) {
        if (b.sha === sha) {
          blobCache.set(cacheKey(b.kind, sha), parseRecord(b.kind, text, b.path));
          progress = true;
        }
      }
    }
    for (const [path, pages] of Object.entries(r.history || {})) {
      if (!pages) continue;
      const h = parseHistory(pages);
      if (h.ok) {
        historyCache.set(`${st.project.name}:${path}`, {
          oldest: h.oldest ? h.oldest.toISOString() : null, newest: h.newest ? h.newest.toISOString() : null });
        progress = true;
      }
    }
    for (const c of batch.compare) {
      const key = `${c.base}...${c.head}`;
      if (!r.compare || !(key in r.compare)) continue; // not answered (the call stopped): ask again
      const status = compareStatus(r.compare[key]);
      if (status === 'ahead' || status === 'identical') compareCache.set(`${st.project.name}:${c.base}`, 'merged');
      else compareCache.set(`${st.project.name}:${c.base}@${c.head}`, status || 'failed');
      progress = true;
    }
    persist();
    return { res, progress, pulled: Boolean(batch.pulls), extras };
  }

  /**
   * J22: whether the page reads this project's owner check: a v3 project whose repository J1's open
   * list gives as public (`base.repo.private` false on its pull requests).
   */
  function checksRead(st) {
    return ownerChecksApply(st.project, pullsOf(st)); // the same rule as the sender's (src/lib/j22.js)
  }

  /** What J22 judges a project's pull requests from, as last read (src/lib/j22.js's ctx). */
  function j22Ctx(st) {
    const tree = st.tree || new Map();
    const records = recordsFor(st);
    let rp;
    if (!tree.has(RISK_PATHS_PATH)) rp = { ok: false, why: 'missing' };
    else if (!records.has(RISK_PATHS_PATH)) rp = { ok: false, why: 'unread' };
    else rp = records.get(RISK_PATHS_PATH) || { ok: false, why: 'unread' };
    const reads = checksRead(st);
    return {
      project: st.project, rp, files: st.files, checksRead: reads,
      verdictBlob: (sha) => st.j22.verdicts.get(sha) || null,
      treeVerdict: (path) => {
        const r = records.get(path);
        return { inTree: tree.has(path), read: r != null && typeof r === 'object' && 'verdict' in r, verdict: r ? r.verdict : null };
      },
      ownerCheck: (sha) => (reads ? st.j22.checks.get(sha) || null : null),
    };
  }

  /** J22: the owner-check part of this poll call: [{ sha, etag }] for the heads `ownerCheckHeads` chooses, or null. */
  function ownerChecksDue(st) {
    if (!opts.j11 || !checksRead(st)) return null;
    // A head not read (`false`: a 403, a 5xx or a network failure alike) keeps its place among the 3 and
    // is asked again at the first poll FILES_RETRY_MS later, inside this poll call (J22, settled after
    // stage 1a's build review, round 1, finding 4).
    const now = clock.now();
    const heads = ownerCheckHeads(pullsOf(st), j22Ctx(st)).filter((pr) => {
      const at = st.j22.refused.get(pr.headSha);
      return at == null || now - at >= FILES_RETRY_MS;
    });
    if (!heads.length) return null;
    return heads.map((pr) => {
      const c = st.j22.checks.get(pr.headSha);
      return { sha: pr.headSha, etag: c && c.etag ? c.etag : null };
    });
  }

  /** J22: the poll's owner-check answers: a 200's body read for its `owner-verdict` entry, a 304 keeping the last, `false` not read. */
  function applyOwnerChecks(st, sent, answers, etags) {
    const heads = new Set(pullsOf(st).map((p) => p.headSha));
    for (const sha of [...st.j22.checks.keys()]) if (!heads.has(sha)) st.j22.checks.delete(sha);
    for (const sha of [...st.j22.refused.keys()]) if (!heads.has(sha)) st.j22.refused.delete(sha);
    if (!answers || typeof answers !== 'object') return;
    for (const { sha } of sent) {
      const a = answers[sha];
      if (a === null) { st.j22.refused.delete(sha); continue; } // 304: the last answer stands (none: still not read)
      if (typeof a !== 'string') {
        // Not read (a failed or refused read): "not read", never "not required"; asked again 5 minutes on.
        st.j22.checks.delete(sha);
        st.j22.refused.set(sha, clock.now());
        continue;
      }
      st.j22.refused.delete(sha); // a 200 ends the wait, as a 304 does
      const e = ownerCheckFrom(a);
      const etag = etags && typeof etags[sha] === 'string' ? etags[sha] : null;
      if (e === undefined) st.j22.checks.delete(sha); // malformed: not read
      else if (e === null) st.j22.checks.set(sha, { read: true, state: null, description: null, etag });
      else st.j22.checks.set(sha, { read: true, state: e.state, description: e.description, etag });
    }
  }

  const headKey = (pr) => `${pr.number}@${pr.headSha}`;
  const headPolls = (st, pr) => {
    const kept = (waits[st.project.name] || {})[headKey(pr)] || 0;
    return Math.max(kept, st.j22.headPolls.get(headKey(pr)) || 0);
  };
  const usePoll = (st, pr) => {
    const n = headPolls(st, pr) + 1;
    st.j22.headPolls.set(headKey(pr), n);
    if (waitsKept) {
      waits[st.project.name] = { ...(waits[st.project.name] || {}), [headKey(pr)]: n };
      saveWaits();
    }
  };
  /** After a successful read of the open list: drop the kept counts of heads it no longer shows open. */
  const pruneWaits = (st) => {
    const mine = waits[st.project.name];
    if (!mine) return;
    const open = new Set(pullsOf(st).filter((p) => p.headSha).map(headKey));
    const next = Object.fromEntries(Object.entries(mine).filter(([k]) => open.has(k)));
    if (Object.keys(next).length === Object.keys(mine).length) return;
    waits[st.project.name] = next;
    saveWaits();
  };
  /** AC52's order: `created_at`, oldest first; two alike by the lower number. */
  const byRaised = (a, b) => {
    const t = (p) => (Number.isFinite(Date.parse(p.createdAt)) ? Date.parse(p.createdAt) : Infinity);
    return t(a) - t(b) || a.number - b.number;
  };

  /**
   * J22's verdict calls (rule 0's "One verdict call per head"; rule 1), made after a blob phase that
   * returned `ok`, outside the optional loop and outside MAX_BLOB_CALLS_PER_CYCLE: for each open pull
   * request head in AC52's order, its verdict blobs on the branch (the owner's and every required
   * reviewer's) not read yet in this opening, or failed and due again after FILES_RETRY_MS within the
   * head's HEAD_POLLS, in one call of their own and nothing else. A failed call is noted for its
   * retry and the next head's call is still made; only a rate limit or a 401 stops the rest.
   */
  async function verdictPhase(st) {
    const ctx = j22Ctx(st);
    const now = clock.now();
    for (const pr of pullsOf(st).filter((p) => ownBranch(p, st.project)).sort(byRaised)) {
      const list = listAt(pr, st.project, st.files);
      if (list.state !== 'read') continue;
      const a = judgeFiles(pr, ctx);
      const ids = [OWNER, ...(a.state === 'known' ? [...a.required.keys()].filter((x) => x !== OWNER) : [])];
      const shas = [];
      let retry = false;
      for (const id of ids) {
        const e = list.f.verdicts ? list.f.verdicts.get(verdictPath(pr.number, id)) : null;
        if (!e || !e.present || !e.sha || shas.includes(e.sha)) continue;
        const v = st.j22.verdicts.get(e.sha);
        if (!v) shas.push(e.sha);
        else if (v.state === 'failed' && now - v.at >= FILES_RETRY_MS && headPolls(st, pr) < HEAD_POLLS) {
          shas.push(e.sha);
          retry = true;
        }
      }
      if (!shas.length) continue;
      if (retry) usePoll(st, pr);
      st.blobCalls++;
      st.j22.verdictCalls++;
      st.j22.lastSolo++;
      const res = await call('/api/blobs', { project: st.project.name, blobs: shas, history: [] });
      const ok = res.ok && res.json && res.json.state === 'ok';
      for (const sha of shas) {
        const text = ok && res.json.blobs ? res.json.blobs[sha] : null;
        st.j22.verdicts.set(sha, typeof text === 'string' ? { state: 'read', verdict: verdictOf(text) } : { state: 'failed', at: now });
      }
      if (!ok && res.ok && res.json && (res.json.reason === 'rate-limit' || res.json.reason === 'token')) {
        if (res.json.reason === 'rate-limit' && res.json.retryAfter) st.retryUntil = Math.max(st.retryUntil, clock.now() + res.json.retryAfter * 1000);
        break;
      }
    }
  }

  /**
   * AC80's waited J20 read (draft 4): while a mark waits on J20's read of a pull request head that
   * failed, that read is asked at each poll, alone in a blob call of its own, until it answers, at
   * most HEAD_POLLS for that head in this opening, whoever waits on it (`desk.setWaited`).
   */
  async function waitedPhase(st) {
    // No device storage for the counts: no waited read at all, the mark waiting on J20's own retry.
    if (!waitsKept) return;
    for (const pr of pullsOf(st).filter((p) => st.j22.waited.has(p.number)).sort(byRaised)) {
      if (!pr.headSha || !ownBranch(pr, st.project)) continue;
      const f = st.files.get(pr.number);
      if (f && f.headSha === pr.headSha) continue; // read at this head
      const tried = st.filesTried.get(pr.number);
      if (!tried || tried.headSha !== pr.headSha || tried.poll === st.polls) continue; // not a failed read, or tried this poll
      if (headPolls(st, pr) >= HEAD_POLLS) continue;
      usePoll(st, pr);
      if (!waitsKept) return; // its count could not be written: no waited read (AC80)
      st.j22.waitedCalls++;
      st.j22.lastSolo++;
      const { res } = await blobCall(st, { byPath: new Map() }, { blobs: [], history: [], compare: [], files: [pr.number] });
      if (res.ok && res.json && res.json.state !== 'ok' && res.json.reason === 'rate-limit') break;
    }
  }

  /** AC79: whether this poll carries the `jobs` part (src/lib/jobwatch.js `partDue`). */
  const jobsDue = (st) => partDue(st.jobs, st.project, st.tree);

  /**
   * AC79's staged judgment, after the cycle's own reads (src/lib/jobwatch.js `runPhase`): in a poll where
   * something changed, one blob call of its own for what the dry pass says is needed, within the cap of 3
   * a head per opening; then the verdicts. It never touches the project's read.
   */
  async function jobsPhase(st) {
    const flaggedPulls = pullsOf(st).filter((pr) => classifyPull(pr, st.project).flagged);
    await runPhase(st.jobs, { project: st.project, tree: st.tree, flaggedPulls, files: st.files, nowMs: clock.now(),
      blobCall: async (body) => {
        st.blobCalls++;
        st.jobsCalls++;
        const res = await call('/api/blobs', { project: st.project.name, history: [], ...body });
        return res.ok && res.json ? res.json : null;
      } });
  }

  /**
   * The blob calls a cycle makes, at most MAX_BLOB_CALLS_PER_CYCLE. The needed reads come first;
   * once they are all in, the optional ones (AC20's rulings) use what is left of the cap.
   * - A call that fails, or brings back nothing it asked for, is a failure (reason as the call says,
   *   else `github`).
   * - Reaching the cap while still making progress is not a failure (review N1): the project is
   *   "Checking…" ({ ok: false, pending: true }) and the next cycle carries on.
   */
  async function blobPhase(st) {
    let calls = 0;
    for (; calls < MAX_BLOB_CALLS_PER_CYCLE; calls++) {
      const need = missing(st);
      if (!need.shas.length && !need.history.length && !need.compare.length) break;
      // J12 rides in the cycle's first blob call when one is due (A3: a head change adds its first
      // page to that minute's call), within what is left of the budget.
      const pl = calls === 0 ? pullsDue(st) : null;
      const [batch] = batches(need.shas, need.history, pl ? BLOB_BATCH - PULLS_COST : BLOB_BATCH, need.compare);
      if (pl) batch.pulls = pl;
      const { res, progress } = await blobCall(st, need, batch);
      if (!res.ok) return res;
      if (res.json.state !== 'ok') return { ok: false, reason: res.json.reason || 'github', retryAfter: res.json.retryAfter };
      if (!progress) return { ok: false, reason: 'github' };
    }
    const left = missing(st);
    if (left.shas.length || left.history.length || left.compare.length) return { ok: false, pending: true };
    noteAsking(st);
    for (; calls < MAX_BLOB_CALLS_PER_CYCLE; calls++) {
      const need = missing(st);
      const pl = pullsDue(st);
      const ex = extrasDue(st);
      const cd = commitsDue(st);
      // J24: a first commits read rides with J20's read of the same head (a call's overflow going into the
      // next); one with no such read to ride, and a retry, never make a call of their own.
      if (!need.optional.shas.length && !need.optional.history.length && !pl && !ex.any && !cd.first.length) break;
      const fixed = BLOB_BATCH - (pl ? PULLS_COST : 0) - ex.files.length - (ex.closed ? CLOSED_COST : 0) - ex.prs.length * PR_COST
        - (ex.usage ? USAGE_COST : 0);
      const firsts = cd.first.slice(0, Math.min(COMMITS_PER_CALL, Math.max(0, Math.floor(fixed / COMMITS_COST))));
      const budget = fixed - firsts.length * COMMITS_COST;
      // The MD sandbox (opts.j11) asks for its optional blobs before the rulings' history reads, so
      // its screens fill in the first cycle; without it the order is M2's.
      // With nothing of the 25 left (J12, J20 and J24's reads take it all), no optional blob rides this
      // call: `batches` always places one, which would take the call past its 25.
      const [batch] = budget <= 0 ? [] : opts.j11 && need.optional.shas.length ? batches(need.optional.shas, [], budget)
        : batches(need.optional.shas, need.optional.history, budget);
      const b = batch || { blobs: [], history: [], compare: [] };
      if (pl) b.pulls = pl;
      if (ex.files.length) b.files = ex.files;
      if (ex.closed) b.closed = ex.closed;
      if (ex.prs.length) b.prs = ex.prs;
      if (ex.usage) b.usage = true;
      // The retries take what room is left in this call, which is made anyway.
      const used = b.blobs.length + 2 * b.history.length;
      const room = Math.max(0, budget - used);
      const retries = [...cd.wait, ...cd.retry].slice(0, Math.max(0, Math.min(COMMITS_PER_CALL - firsts.length, Math.floor(room / COMMITS_COST))));
      if (firsts.length || retries.length) b.commits = [...firsts, ...retries];
      const { res, progress, pulled, extras } = await blobCall(st, need, b);
      // An optional read that fails is tried again on a later cycle (a J12 read after its backoff);
      // it never fails the project, except a rate limit, which every read must respect.
      if (!res.ok || res.json.state !== 'ok') {
        if (res.ok && res.json.reason === 'rate-limit') return { ok: false, reason: 'rate-limit', retryAfter: res.json.retryAfter };
        break;
      }
      if (!progress && !pulled && !extras) break;
    }
    return { ok: true };
  }

  async function cycle(st) {
    st.pending = true;
    const gen = st.closedGen;
    const start = clock.now();
    st.lastPollStart = start;
    st.polls++;
    const etags = {};
    for (const [u, tag] of Object.entries(st.etags)) etags[u] = tag;
    let res = null;
    let outcome;
    try {
      // AC79: the candidates' conditional reads ride the poll call, read last by the function (J1, J6).
      const jobsSent = jobsDue(st);
      const pollBody = { project: st.project.name, head: st.head, etags: st.head ? etags : {} };
      if (jobsSent) pollBody.jobs = pollPart(st.jobs);
      // J22 (AC80): the owner check for at most 3 heads, read after the core reads and before `jobs` (J1, J6).
      const owner = ownerChecksDue(st);
      if (owner) pollBody.ownerChecks = owner;
      res = await call('/api/poll', pollBody);
      if (!res.ok) {
        outcome = res;
      } else if (res.json.state === 'cant-read') {
        outcome = { ok: false, reason: res.json.reason || 'github', retryAfter: res.json.retryAfter, words: res.json.words };
      } else {
        if (jobsSent) applyPollAnswer(st.jobs, new Set(pollBody.jobs.heads.map((x) => x.sha)), res.json.jobs);
        outcome = applyPoll(st, res.json);
        if (outcome.ok) pruneWaits(st);
        if (pollBody.ownerChecks) applyOwnerChecks(st, pollBody.ownerChecks, res.json.ownerChecks, res.json.ownerCheckEtags);
        if (st.tree) {
          st.j22.lastSolo = 0;
          const blobs = await blobPhase(st);
          // A blob failure outranks the poll's own outcome; "still checking" only replaces a success.
          if (!blobs.ok && (outcome.ok || !blobs.pending)) outcome = blobs;
          // J22 (AC80): each head's verdict call, only after a blob phase that returned `ok`; then the
          // reads the page's marks wait on. Both optional, outside the cycle's MAX_BLOB_CALLS_PER_CYCLE.
          if (opts.j11 && blobs.ok) await verdictPhase(st);
          if (opts.j11) await waitedPhase(st);
          // AC79: optional, after the project's own reads; it never touches the outcome.
          await jobsPhase(st);
        }
      }
    } catch (err) {
      // Record content the page's parsers didn't anticipate must not end this project's polling:
      // the project can't be read this cycle, and the next poll is still scheduled.
      outcome = { ok: false, reason: 'page', words: `${REASON_WORDS.page} (${errorText(err)})` };
    }
    // A 403 from the function means the Access session is gone; any project's says so.
    st.signedOut = Boolean(res && res.reason === 'signed-out');
    desk.signedOut = [...states.values()].some((x) => x.signedOut);
    if (outcome.ok) {
      st.lastSuccessAt = clock.now();
      st.failure = null;
      st.checking = false;
    } else if (outcome.pending) {
      // Review N1: the cycle's call budget ran out while reads were still arriving. Not a failure:
      // the project is "Checking…" until a cycle completes (readState).
      st.checking = true;
      st.failure = null;
    } else {
      st.checking = false;
      if (outcome.reason === 'rate-limit' && outcome.retryAfter) st.retryUntil = clock.now() + outcome.retryAfter * 1000;
      let words = outcome.words || REASON_WORDS[outcome.reason];
      if (outcome.reason === 'rate-limit') words = `${REASON_WORDS['rate-limit']}; next read after ${new Date(st.retryUntil).toISOString().slice(11, 16)} UTC`;
      if (outcome.reason === 'signed-out') words = 'Signed out — reload to sign in';
      fail(st, outcome.reason, words);
    }
    // AC77 (draft 8): a closed read due but not made this cycle (a held question's raised time not
    // read, or the read stopped first) counts as failed: the hold stands, a tapped item may show, and
    // it is tried again at the next poll. Asked for again while this cycle was past its reads, it waits
    // for the next poll, where it rides (draft 9, Desk 5).
    try {
      if (st.closed.state === 'none' && st.closedGen === gen && st.tree && heldQuestions(st).length) {
        st.closed = { state: 'failed', pulls: [], poll: st.polls, gen };
      }
    } catch {
      // a model that can't be built holds no question to wait for
    }
    if (st.closed.gen === st.closedGen && (st.closed.state === 'done' || st.closed.state === 'failed')) st.closedSettled = true;
    st.pending = false;
    // A throw while the page renders (or builds the model it renders) must never stop polling
    // (review N4): the next poll is scheduled whatever onChange does.
    try {
      onChange();
    } catch {
      // The page shows its own error state (page.js); here the only job is to keep polling.
    } finally {
      schedule(st);
      // J23: the portfolio's read, waiting its turn behind the projects' polls, goes once none is under way.
      pfTurn();
    }
  }

  function schedule(st) {
    if (st.timer != null) clock.clearTimeout(st.timer);
    st.timer = null;
    if (!desk.running || !isVisible() || st.pending) return;
    const at = Math.max(st.lastPollStart + POLL_MS, st.retryUntil, clock.now());
    st.dueAt = at;
    st.timer = clock.setTimeout(() => {
      st.timer = null;
      if (desk.running && isVisible() && !st.pending) cycle(st);
    }, at - clock.now());
  }

  desk.start = () => {
    desk.running = true;
    desk.visibleSince = clock.now();
    for (const st of states.values()) schedule(st);
    // J23: the opening's first portfolio read is made at once, after the projects' first polls.
    pfSchedule();
  };
  desk.stop = () => {
    desk.running = false;
    for (const st of states.values()) {
      if (st.timer != null) clock.clearTimeout(st.timer);
      st.timer = null;
    }
    if (pf && pf.timer != null) clock.clearTimeout(pf.timer);
    if (pf) Object.assign(pf, { timer: null, turn: false });
  };
  desk.visibilityChanged = () => {
    if (isVisible()) {
      desk.visibleSince = clock.now();
      // AC77 (drafts 8 and 9): a return to the foreground runs the closed read again for a project
      // holding a question, riding its next poll: at once if the last poll started 60 seconds ago or
      // more, else at that poll's 60-second mark (A2's one poll a minute; Desk 5).
      for (const st of states.values()) {
        closedAgain(st, { keepAsking: true });
        schedule(st);
      }
      // J23: on its own 5 minutes: at once if its last read started 5 minutes ago or more, else at that mark.
      pfSchedule();
    } else {
      for (const st of states.values()) {
        if (st.timer != null) clock.clearTimeout(st.timer);
        st.timer = null;
      }
      if (pf && pf.timer != null) clock.clearTimeout(pf.timer);
      if (pf) Object.assign(pf, { timer: null, turn: false });
    }
    try {
      onChange();
    } catch {
      // As in cycle: a failed render never changes what is polled.
    }
  };
  desk.model = (name) => {
    const st = states.get(name);
    return buildModel({
      project: st.project, config, tree: st.tree, records: recordsFor(st), history: historyFor(st),
      pullPages: st.pullRaws || [], checkPages: st.checksRead ? st.checkRaws : null, checksState: st.checksState,
      now: new Date(clock.now()), withdrawn: st.withdrawn, compare: compareFor(st),
      asking: { files: st.files, recorded: st.asking.recorded, ended: st.asking.ended, hereInstead: st.asking.hereInstead, seen: st.asking.seen },
      jobs: st.jobs.verdicts,
    });
  };
  /**
   * AC74, AC77 (draft 8): a `?open=` arrival on a page already loaded (the service worker's message):
   * the closed read runs again, now, for each project holding a question.
   */
  desk.arrival = () => {
    for (const st of states.values()) if (closedAgain(st)) closedNow(st);
  };
  /**
   * AC74 (draft 8): whether a tapped item in this project may show: it holds no question, or the
   * closed read asked for last has answered or failed (a raised time not read counting as failed).
   */
  desk.closedSettled = (name) => {
    const st = states.get(name);
    if (!st || !st.tree) return true;
    if (st.closedSettled) return true;
    try {
      return heldQuestions(st).length === 0;
    } catch {
      return true;
    }
  };
  /** AC77: "Answer it here instead", on this device only. */
  desk.answerHere = (name, qname) => {
    const st = states.get(name);
    if (!st) return;
    st.asking.hereInstead.add(qname);
    persistAsking();
    try {
      onChange();
    } catch {
      // as in cycle
    }
  };
  /** J21 (AC78): read the usage again at the next blob call (a cost notification's tap). */
  desk.refreshUsage = () => {
    if (desk.usage.at != null) desk.usage.forced = true;
    const first = states.values().next().value;
    if (first && desk.running && !first.pending) {
      if (first.timer != null) clock.clearTimeout(first.timer);
      first.timer = null;
      cycle(first);
    }
  };
  /** Whether an answer link needs AC77's re-read first: the project's last read is more than 30 seconds old. */
  desk.needsRecheck = (name) => {
    const st = states.get(name);
    if (!st) return false;
    const last = Math.max(st.lastSuccessAt == null ? -Infinity : st.lastSuccessAt, st.recheckedAt == null ? -Infinity : st.recheckedAt);
    return !(clock.now() - last <= RECHECK_AFTER_MS);
  };
  /**
   * AC77's re-read before an answer link opens: one poll call, then at most one blob call with J20's
   * files for any new open pull request and, when the answer path has appeared, its blob. Returns
   * { ok } (false: the re-read failed, "The desk couldn't check just now").
   */
  desk.recheck = async (name, answerPath) => {
    const st = states.get(name);
    if (!st) return { ok: false };
    try {
      const etags = {};
      for (const [u, tag] of Object.entries(st.etags)) etags[u] = tag;
      const res = await call('/api/poll', { project: st.project.name, head: st.head, etags: st.head ? etags : {} });
      if (!res.ok || res.json.state === 'cant-read') return { ok: false };
      const out = applyPoll(st, res.json);
      if (!out.ok) return { ok: false };
      const files = [];
      for (const pr of pullsOf(st)) {
        if (!canRecord(pr, st.project) || !pr.headSha) continue;
        const f = st.files.get(pr.number);
        if (!f || f.headSha !== pr.headSha) files.push(pr.number);
      }
      const need = { byPath: new Map() };
      const blobs = [];
      const e = answerPath && st.tree ? st.tree.get(answerPath) : null;
      const kind = e ? recordKind(answerPath, st.project.model) : null;
      if (e && kind && !blobCache.has(cacheKey(kind, e.sha))) {
        blobs.push(e.sha);
        need.byPath.set(answerPath, { path: answerPath, sha: e.sha, kind });
      }
      if (files.length || blobs.length) {
        const r = await blobCall(st, need, { blobs, history: [], compare: [], files: files.slice(0, FILES_PER_CALL) });
        if (!r.res.ok || r.res.json.state !== 'ok') return { ok: false };
        if (blobs.length && !r.progress) return { ok: false };
        // Read at each pull request's current head, or the re-read failed (draft 9, Desk 1).
        const heads = new Map(pullsOf(st).map((p) => [p.number, p.headSha]));
        if (files.some((n) => { const f = st.files.get(n); return !f || f.headSha !== heads.get(n); })) return { ok: false };
      }
      noteAsking(st);
      st.recheckedAt = clock.now();
      return { ok: true };
    } catch {
      return { ok: false };
    } finally {
      try {
        onChange();
      } catch {
        // as in cycle
      }
    }
  };
  desk.cacheSize = () => blobCache.size;
  /**
   * J23 (stage 6b): the portfolio as last read, or null with no `portfolio` in J7 (6a's state) or outside
   * the MD sandbox: { repo, defaultBranch, head, headAt, tree, truncated, records (path → parsed), lastSuccessAt,
   * failure: { kind: 'access' | 'other', reason, since } | null, readAt, checking, polls, blobCalls }.
   */
  desk.portfolio = () => (pf ? { ...pfConf, head: pf.head, headAt: pf.headAt, tree: pf.tree, truncated: pf.truncated, records: pfRecords(),
    lastSuccessAt: pf.lastSuccessAt, failure: pf.failure, readAt: pf.readAt, checking: pf.checking, polls: pf.polls, blobCalls: pf.blobCalls } : null);
  /** J22 (the MD sandbox): what the board judges a project's pull requests from, as last read. */
  desk.j22 = (name) => {
    const st = states.get(name);
    return { ...j22Ctx(st), headPolls: (pr) => headPolls(st, pr), soloCalls: { verdict: st.j22.verdictCalls, waited: st.j22.waitedCalls, lastCycle: st.j22.lastSolo },
      filesTried: (n) => st.filesTried.get(n) || null };
  };
  /** J24 (the MD sandbox): each open pull request's commits as read in this opening, and the read's counts (tests). */
  desk.commits = (name) => {
    const st = states.get(name);
    return st ? st.j24.commits : new Map();
  };
  desk.j24 = (name) => {
    const st = states.get(name);
    return st ? { reads: st.j24.reads, calls: st.j24.calls, alone: st.j24.alone, tried: new Map(st.j24.tried) } : null;
  };
  /** AC80: the pull requests the page's marks wait on J20's read for (asked at each poll while it fails, HEAD_POLLS a head). */
  desk.setWaited = (name, numbers) => {
    const st = states.get(name);
    if (st) st.j22.waited = new Set(numbers || []);
  };
  /** J11 (the MD sandbox): the project's tree, its parsed records and its run pages, as last read. */
  desk.snapshot = (name) => {
    const st = states.get(name);
    const j = st.j12;
    return { tree: st.tree, records: recordsFor(st), history: historyFor(st), head: st.head, headAt: st.headAt,
      pullPages: st.pullRaws || [], checkPages: st.checksRead ? st.checkRaws : null, lastSuccessAt: st.lastSuccessAt,
      // J12: the pull requests kept (null until a read has answered on this device), and how the reads stand.
      // current: the kept list is today's read at this head, with no failure since and no cold read under way (AC72).
      pulls: { list: j.pulls, failure: j.failure, rate: j.rate === true, tooMany: j.tooMany, fieldError: j.fieldError, reading: Boolean(j.cold),
        current: Boolean(j.pulls) && !j.failure && !j.cold && j.head === st.head } };
  };
  return desk;
}

export const CALL_TIMEOUT_MS = 30_000;
const TIMED_OUT = Symbol('timed out');

/**
 * The page's call to the desk function (J6). Classifies what came back:
 * 403 → signed-out (the Access JWT is invalid); 5xx or a non-JSON answer → cloudflare (with the
 * Cloudflare error code when the page shows one); a failed fetch → network. A call that hasn't
 * answered in full within `timeoutMs` (30 s) is aborted and counts as network too (review N5), so
 * a hung request can never hold a project's cycle open.
 */
export async function callFunction(path, body, fetchImpl = fetch, { timeoutMs = CALL_TIMEOUT_MS } = {}) {
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  let timer = null;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      if (ctl) ctl.abort();
      resolve(TIMED_OUT);
    }, timeoutMs);
  });
  const timedOut = (status) => ({ ok: false, status, reason: 'network',
    words: `${REASON_WORDS.network} (no answer within ${Math.round(timeoutMs / 1000)} s)` });
  try {
    return await classify();
  } finally {
    clearTimeout(timer);
  }

  async function classify() {
    let res;
    try {
      res = await Promise.race([fetchImpl(path, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        credentials: 'same-origin', redirect: 'manual', cache: 'no-store', signal: ctl ? ctl.signal : undefined,
      }), timeout]);
    } catch {
      return ctl && ctl.signal.aborted ? timedOut(0) : { ok: false, status: 0, reason: 'network' };
    }
    if (res === TIMED_OUT) return timedOut(0);
    if (res.type === 'opaqueredirect' || res.status === 403 || (res.status >= 300 && res.status < 400)) {
      return { ok: false, status: res.status, reason: 'signed-out' };
    }
    let text = '';
    try {
      text = await Promise.race([res.text(), timeout]);
    } catch {
      return ctl && ctl.signal.aborted ? timedOut(res.status) : { ok: false, status: res.status, reason: 'network' };
    }
    if (text === TIMED_OUT) return timedOut(res.status);
    return finish(res, text);
  }
}

function finish(res, text) {
  const code = /error(?: code)?:?\s*(1[0-9]{3})\b/i.exec(text);
  if (!res.ok) {
    return { ok: false, status: res.status, reason: 'cloudflare', cfError: code ? Number(code[1]) : null,
      words: `${REASON_WORDS.cloudflare} (HTTP ${res.status}${code ? `, Error ${code[1]}` : ''})` };
  }
  try {
    return { ok: true, status: res.status, json: JSON.parse(text), bytes: text.length };
  } catch {
    return { ok: false, status: res.status, reason: 'cloudflare', cfError: code ? Number(code[1]) : null,
      words: `${REASON_WORDS.cloudflare} (not JSON${code ? `, Error ${code[1]}` : ''})` };
  }
}
