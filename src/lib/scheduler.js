// The page's poll scheduler and per-project reader (spec S-001, J6 "The page's side"; AC4, AC5,
// AC14). One cycle per project per 60 s while the page is visible: a poll call, then the blob
// calls its tree change needs. A failed or rate-limited read is never retried before the next
// scheduled poll; a rate-limited project isn't polled again before its retryAfter.

import { neededReads, parseRecord, recordKind, buildModel } from './model.js';
import { parseTree, parseHistory, parseCardPath } from './records.js';

export const POLL_MS = 60_000;
export const STALE_MS = 180_000;
export const BLOB_BATCH = 25;
const MAX_BLOB_CALLS_PER_CYCLE = 6;
const BLOB_CACHE_KEY = 'desk-blobs-v1';
const HISTORY_CACHE_KEY = 'desk-history-v1';

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

/** Split needed reads into blob calls within the budget (a blob counts 1, a history path 2). */
export function batches(blobs, history, budget = BLOB_BATCH) {
  const out = [];
  let cur = { blobs: [], history: [], cost: 0 };
  const push = () => {
    if (cur.cost) out.push({ blobs: cur.blobs, history: cur.history });
    cur = { blobs: [], history: [], cost: 0 };
  };
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
  };
}

/**
 * Create the desk's reader.
 * opts: { config, call(path, body) → Promise<{ ok, status, json?, reason?, words? }>, clock:
 *   { now(), setTimeout(fn, ms), clearTimeout(id) }, store (createStore), isVisible(),
 *   onChange() }
 */
export function createDesk(opts) {
  const { config, call, clock, store } = opts;
  const onChange = opts.onChange || (() => {});
  const isVisible = opts.isVisible || (() => true);
  const states = new Map(config.projects.map((p) => [p.name, newProjectState(p)]));
  const blobCache = new Map(Object.entries((store && store.getJSON(BLOB_CACHE_KEY, {})) || {}));
  const historyCache = new Map(Object.entries((store && store.getJSON(HISTORY_CACHE_KEY, {})) || {}));
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

  function missing(st) {
    const now = new Date(clock.now());
    const records = recordsFor(st);
    const need = neededReads(st.project, st.tree, records, now);
    const shas = [];
    const byPath = new Map();
    for (const b of need.blobs) {
      if (blobCache.has(cacheKey(b.kind, b.sha))) continue;
      if (!shas.includes(b.sha)) shas.push(b.sha);
      byPath.set(b.path, b);
    }
    const history = need.history.filter((p) => !historyCache.has(`${st.project.name}:${p}`));
    return { shas, history, byPath };
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
    }
    if (lost) {
      // A 304 for a page this window never held: forget the ETags so the next poll reads in full.
      st.etags = {};
      return { ok: false, reason: 'github' };
    }
    if (st.partialTree || pl.more || cl.more || r.state === 'partial') return { ok: false, reason: 'too-many' };
    return { ok: true };
  }

  async function blobPhase(st) {
    for (let calls = 0; calls < MAX_BLOB_CALLS_PER_CYCLE; calls++) {
      const need = missing(st);
      if (!need.shas.length && !need.history.length) return { ok: true };
      const [batch] = batches(need.shas, need.history);
      st.blobCalls++;
      const res = await call('/api/blobs', { project: st.project.name, blobs: batch.blobs, history: batch.history });
      if (!res.ok) return res;
      const r = res.json;
      for (const [sha, text] of Object.entries(r.blobs || {})) {
        if (text == null) continue;
        for (const b of need.byPath.values()) {
          if (b.sha === sha) blobCache.set(cacheKey(b.kind, sha), parseRecord(b.kind, text, b.path));
        }
      }
      for (const [path, pages] of Object.entries(r.history || {})) {
        if (!pages) continue;
        const h = parseHistory(pages);
        if (h.ok) {
          historyCache.set(`${st.project.name}:${path}`, {
            oldest: h.oldest ? h.oldest.toISOString() : null, newest: h.newest ? h.newest.toISOString() : null });
        }
      }
      persist();
      if (r.state !== 'ok') return { ok: false, reason: r.reason || 'github', retryAfter: r.retryAfter };
    }
    const need = missing(st);
    return need.shas.length || need.history.length ? { ok: false, reason: 'github' } : { ok: true };
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
          if (outcome.ok || !blobs.ok) outcome = blobs.ok ? outcome : blobs;
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
    } else {
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
      now: new Date(clock.now()), withdrawn: st.withdrawn,
    });
  };
  desk.cacheSize = () => blobCache.size;
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
