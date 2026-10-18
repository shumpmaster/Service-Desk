// The page's poll scheduler and per-project reader (spec S-001, J6 "The page's side"; AC4, AC5,
// AC14). One cycle per project per 60 s while the page is visible: a poll call, then the blob
// calls its tree change needs. A failed or rate-limited read is never retried before the next
// scheduled poll; a rate-limited project isn't polled again before its retryAfter.

import { neededReads, parseRecord, recordKind, buildModel } from './model.js';
import { parseTree, parseHistory, parseCardPath, compareStatus } from './records.js';
import { judgePulls, mergePulls, pullsBackoffMs, PULLS_KEY, PULLS_MAX_PAGES, PULLS_RATE_MS } from './pulls.js';
import { dayKey } from './timefmt.js';

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
// Staff's session files, J2, J6, J11 and J13), and list the old keys here so their entries are
// dropped, not left to fill storage.
export const BLOB_CACHE_KEY = 'desk-blobs-v6';
export const OLD_BLOB_CACHE_KEYS = ['desk-blobs-v1', 'desk-blobs-v2', 'desk-blobs-v3', 'desk-blobs-v4', 'desk-blobs-v5'];
const HISTORY_CACHE_KEY = 'desk-history-v1';
const COMPARE_CACHE_KEY = 'desk-compare-v1';

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
  };
}

/**
 * Create the desk's reader.
 * opts: { config, call(path, body) → Promise<{ ok, status, json?, reason?, words? }>, clock:
 *   { now(), setTimeout(fn, ms), clearTimeout(id) }, store (createStore), isVisible(),
 *   onChange(), j11 (true in the MD sandbox only: also read J11's optional records) }
 */
export function createDesk(opts) {
  const { config, call, clock, store } = opts;
  const onChange = opts.onChange || (() => {});
  const isVisible = opts.isVisible || (() => true);
  const states = new Map(config.projects.map((p) => [p.name, newProjectState(p)]));
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
  const desk = {
    openedAt: clock.now(), visibleSince: clock.now(), signedOut: false, running: false, states,
  };

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
    const res = await call('/api/blobs', body);
    if (!res.ok) {
      if (batch.pulls) applyPulls(st, batch.pulls, null);
      return { res, progress: false };
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
    return { res, progress, pulled: Boolean(batch.pulls) };
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
    for (; calls < MAX_BLOB_CALLS_PER_CYCLE; calls++) {
      const need = missing(st);
      const pl = pullsDue(st);
      if (!need.optional.shas.length && !need.optional.history.length && !pl) break;
      const budget = pl ? BLOB_BATCH - PULLS_COST : BLOB_BATCH;
      // The MD sandbox (opts.j11) asks for its optional blobs before the rulings' history reads, so
      // its screens fill in the first cycle; without it the order is M2's.
      const [batch] = opts.j11 && need.optional.shas.length ? batches(need.optional.shas, [], budget)
        : batches(need.optional.shas, need.optional.history, budget);
      const b = batch || { blobs: [], history: [], compare: [] };
      if (pl) b.pulls = pl;
      const { res, progress, pulled } = await blobCall(st, need, b);
      // An optional read that fails is tried again on a later cycle (a J12 read after its backoff);
      // it never fails the project, except a rate limit, which every read must respect.
      if (!res.ok || res.json.state !== 'ok') {
        if (res.ok && res.json.reason === 'rate-limit') return { ok: false, reason: 'rate-limit', retryAfter: res.json.retryAfter };
        break;
      }
      if (!progress && !pulled) break;
    }
    return { ok: true };
  }

  async function cycle(st) {
    st.pending = true;
    const start = clock.now();
    st.lastPollStart = start;
    st.polls++;
    const etags = {};
    for (const [u, tag] of Object.entries(st.etags)) etags[u] = tag;
    let res = null;
    let outcome;
    try {
      res = await call('/api/poll', { project: st.project.name, head: st.head, etags: st.head ? etags : {} });
      if (!res.ok) {
        outcome = res;
      } else if (res.json.state === 'cant-read') {
        outcome = { ok: false, reason: res.json.reason || 'github', retryAfter: res.json.retryAfter, words: res.json.words };
      } else {
        outcome = applyPoll(st, res.json);
        if (st.tree) {
          const blobs = await blobPhase(st);
          // A blob failure outranks the poll's own outcome; "still checking" only replaces a success.
          if (!blobs.ok && (outcome.ok || !blobs.pending)) outcome = blobs;
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
    st.pending = false;
    // A throw while the page renders (or builds the model it renders) must never stop polling
    // (review N4): the next poll is scheduled whatever onChange does.
    try {
      onChange();
    } catch {
      // The page shows its own error state (page.js); here the only job is to keep polling.
    } finally {
      schedule(st);
    }
  }

  function schedule(st) {
    if (st.timer != null) clock.clearTimeout(st.timer);
    st.timer = null;
    if (!desk.running || !isVisible() || st.pending) return;
    const at = Math.max(st.lastPollStart + POLL_MS, st.retryUntil, clock.now());
    st.timer = clock.setTimeout(() => {
      st.timer = null;
      if (desk.running && isVisible() && !st.pending) cycle(st);
    }, at - clock.now());
  }

  desk.start = () => {
    desk.running = true;
    desk.visibleSince = clock.now();
    for (const st of states.values()) schedule(st);
  };
  desk.stop = () => {
    desk.running = false;
    for (const st of states.values()) {
      if (st.timer != null) clock.clearTimeout(st.timer);
      st.timer = null;
    }
  };
  desk.visibilityChanged = () => {
    if (isVisible()) {
      desk.visibleSince = clock.now();
      for (const st of states.values()) schedule(st);
    } else {
      for (const st of states.values()) {
        if (st.timer != null) clock.clearTimeout(st.timer);
        st.timer = null;
      }
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
    });
  };
  desk.cacheSize = () => blobCache.size;
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
