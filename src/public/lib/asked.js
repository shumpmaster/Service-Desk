// Time asked of the owner (AC20, V5 for AC21) and the Agents view (AC22, AC23) — spec S-001, J2,
// J10. Pure: from a v3 project's dispatch log, tree, records and history reads, and the clock.

import { parseCardPath, questionName, questionAnswerName, USAGE_KEYS, NOT_AVAILABLE } from './records.js';
import { countedMs, median } from './timefmt.js';

export const ASKED_DAYS = 30;
export const SUMMARY_DAYS = 14;
export const AGENT_DAYS = 14;
const DAY = 86400e3;
export const V25_NO_CARDS = 'no cards in operating model v2.5.1';
export const V25_ANSWERED = 'answered questions: not recorded (operating model v2.5.1 records rulings in the ledger)';

const time = (s) => (typeof s === 'string' ? Date.parse(s) : NaN);

/**
 * The cards raised in the window, from the log's `card` entries (J2): one row each with raised,
 * answered, wait and proxy. state: 'answered' | 'open' | 'recording' (answer on main, its log entry
 * not yet written) | 'withdrawn' (card file deleted without an answer).
 */
export function cardRows(entries, tree, nowMs, days = ASKED_DAYS) {
  const decisions = new Map();
  for (const e of entries) if (e.shape === 'decision' && typeof e.record === 'string') decisions.set(e.record, e);
  const rows = [];
  const seen = new Set();
  for (const e of entries) {
    if (e.shape !== 'card') continue;
    const raisedAt = time(e.time);
    if (!Number.isFinite(raisedAt) || nowMs - raisedAt > days * DAY || raisedAt > nowMs) continue;
    const path = `queue/${e.item}-${e.gate}-${e.card}.md`;
    if (seen.has(path)) continue;
    seen.add(path);
    const answerPath = `decisions/${e.item}/${e.gate}-${e.card}.md`;
    const d = decisions.get(answerPath);
    const row = { kind: 'card', item: e.item, label: `${e.item} ${e.gate}-${e.card}`, path, answerPath, raisedAt,
      answeredAt: null, waitMs: null, proxy: null, word: null, state: 'open' };
    if (d && Number.isFinite(time(d.time))) {
      row.state = 'answered';
      row.answeredAt = time(d.time);
      row.waitMs = Math.max(0, row.answeredAt - raisedAt);
      row.proxy = typeof d.proxy === 'boolean' ? d.proxy : null;
      row.word = typeof d.word === 'string' ? d.word : null;
    } else if (tree.has(answerPath)) {
      row.state = 'recording';
    } else if (!tree.has(path)) {
      row.state = 'withdrawn';
    } else {
      row.waitMs = Math.max(0, nowMs - raisedAt);
    }
    rows.push(row);
  }
  return rows.sort((a, b) => b.raisedAt - a.raisedAt);
}

/**
 * The owner questions raised in the window (J2): open ones in the tree, and (v3) answered ones from
 * their rulings. Raised is the question path's oldest commit; answered the ruling's. A ruling whose
 * question has no history was asked in a session and isn't listed.
 */
export function questionRows(model, tree, records, history, nowMs, days = ASKED_DAYS) {
  const rows = [];
  const inWindow = (t) => t == null || (nowMs - t <= days * DAY && t <= nowMs);
  const oldest = (p) => {
    const h = history.get(p);
    if (!h) return undefined; // not read yet
    return h.oldest ? Date.parse(h.oldest) : null; // null: no history
  };
  const listed = new Set();
  for (const path of tree.keys()) {
    const name = questionName(path);
    if (!name) continue;
    if (model === 'v3' && tree.has(`decisions/questions/${name}.md`)) continue;
    const raised = oldest(path);
    const raisedAt = raised == null ? null : raised;
    if (!inWindow(raisedAt)) continue;
    listed.add(name);
    rows.push({ kind: 'question', label: name, path, raisedAt, answeredAt: null, state: 'open',
      waitMs: raisedAt == null ? null : Math.max(0, nowMs - raisedAt), proxy: null, ruling: null });
  }
  if (model === 'v3') {
    for (const path of tree.keys()) {
      const name = questionAnswerName(path);
      if (!name || listed.has(name)) continue;
      const answered = oldest(path);
      const raised = oldest(`questions/${name}.md`);
      if (answered == null || raised == null) continue; // not read yet, or asked in a session
      if (!inWindow(raised)) continue;
      const rec = records.get(path);
      rows.push({ kind: 'question', label: name, path: `questions/${name}.md`, rulingPath: path, raisedAt: raised,
        answeredAt: answered, state: 'answered', waitMs: Math.max(0, answered - raised),
        proxy: rec ? rec.proxy : null, ruling: rec ? rec.ruling : null });
    }
  }
  return rows.sort((a, b) => (b.raisedAt ?? Infinity) - (a.raisedAt ?? Infinity));
}

/** AC20's summary: count and median wait over the cards raised in the last 14 days, open ones
 * with their wait so far; "recording…" and withdrawn cards are left out. */
export function cardSummary(rows, nowMs, days = SUMMARY_DAYS) {
  const waits = rows.filter((r) => nowMs - r.raisedAt <= days * DAY && r.waitMs != null).map((r) => r.waitMs);
  return { count: waits.length, medianMs: median(waits) };
}

/**
 * V5's counted waits for this project (AC21, J2): each card raised in the last 14 days, answered
 * or open, its wait counted only inside the v5Clock windows in ownerTimeZone.
 */
export function v5Waits(rows, nowMs, config, days = SUMMARY_DAYS) {
  const out = [];
  for (const r of rows) {
    if (nowMs - r.raisedAt > days * DAY) continue;
    if (r.state === 'answered') out.push(countedMs(r.raisedAt, r.answeredAt, config.v5Clock, config.ownerTimeZone));
    else if (r.state === 'open') out.push(countedMs(r.raisedAt, nowMs, config.v5Clock, config.ownerTimeZone));
  }
  return out;
}

/** AC21's footer line from every v3 project's counted waits. */
export function v5Line(waits, fmt) {
  if (!waits.length) return 'Median answer time, weekday cards, last 14 days: no weekday cards in the last 14 days';
  return `Median answer time, weekday cards, last 14 days: ${fmt(median(waits))} (goal under 4h; ${waits.length} card${waits.length === 1 ? '' : 's'})`;
}

/**
 * The agent sessions of the last 14 days (J10): each `dispatch` entry joined to the `outcome` whose
 * `session` is `<item>:<route>:<time>`, and to its status/outcomes.jsonl line for usage.
 * statusDispatch: item → dispatched_at of an item still `dispatched` (that session is running).
 */
export function sessionRows(entries, outcomes, statusDispatch, nowMs, days = AGENT_DAYS) {
  const outcomeBy = new Map();
  for (const e of entries) if (e.shape === 'outcome') outcomeBy.set(e.session, e);
  const rows = [];
  for (const e of entries) {
    if (e.shape !== 'dispatch') continue;
    const start = time(e.time);
    if (!Number.isFinite(start) || nowMs - start > days * DAY) continue;
    const session = `${e.item}:${e.route}:${e.time}`;
    const o = outcomeBy.get(session);
    const line = outcomes && Object.prototype.hasOwnProperty.call(outcomes, session) ? outcomes[session] : null;
    const row = { session, item: e.item, role: e.role, route: e.route, start, end: null, runMs: null,
      result: null, verdict: null, retry: e.retry === true, running: false, noOutcome: false,
      usage: line ? line.usage : null, hasOutcomeLine: Boolean(line) };
    if (o && Number.isFinite(time(o.time))) {
      row.end = time(o.time);
      row.runMs = Math.max(0, row.end - start);
      row.result = o.result ?? null;
      row.verdict = o.verdict ?? null;
    } else if (statusDispatch.get(e.item) === e.time) {
      row.running = true;
      row.runMs = Math.max(0, nowMs - start);
    } else {
      row.noOutcome = true;
    }
    rows.push(row);
  }
  return rows.sort((a, b) => b.start - a.start);
}

/**
 * Each item's timeline (AC22): its sessions and its card waits on one time axis, in time order.
 * Returns [{ item, from, to, events: [{ kind: 'session' | 'card', label, start, end, open }] }].
 */
export function timelines(sessions, cards, nowMs) {
  const by = new Map();
  const add = (item, ev) => {
    if (!by.has(item)) by.set(item, []);
    by.get(item).push(ev);
  };
  for (const s of sessions) {
    add(s.item, { kind: 'session', label: `${s.role}${s.retry ? ' (retry)' : ''}`, start: s.start,
      end: s.end ?? (s.running ? nowMs : null), open: s.running });
  }
  for (const c of cards) {
    if (c.state === 'withdrawn') continue;
    add(c.item, { kind: 'card', label: `card ${c.label.replace(/^\S+ /, '')}`, start: c.raisedAt,
      end: c.answeredAt ?? (c.state === 'open' ? nowMs : null), open: c.state === 'open' });
  }
  const out = [];
  for (const [item, events] of by) {
    events.sort((a, b) => a.start - b.start);
    const from = Math.min(...events.map((e) => e.start));
    const to = Math.max(...events.map((e) => e.end ?? e.start));
    out.push({ item, from, to, events });
  }
  return out.sort((a, b) => b.to - a.to);
}

/**
 * AC23's figures for one session: each J10 figure as a number, 'not available' or 'not recorded';
 * the peak's percentage of the window only when both are numbers.
 */
export function usageView(row) {
  if (!row.usage) return { recorded: false, words: 'not recorded' };
  const u = row.usage;
  const fig = (k) => (k in u ? u[k] : NOT_AVAILABLE);
  const out = { recorded: true };
  for (const k of USAGE_KEYS) out[k] = fig(k);
  const peak = out.context_peak_tokens;
  const win = out.context_window_tokens;
  out.context_peak_percent = Number.isInteger(peak) && Number.isInteger(win) && win > 0
    ? Math.round((peak / win) * 1000) / 10 : NOT_AVAILABLE;
  return out;
}
