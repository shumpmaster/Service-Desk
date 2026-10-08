// Time asked of the owner (AC20, V5 for AC21) and the Agents view (AC22, AC23) — spec S-001, J2,
// J10. Pure: from a v3 project's dispatch log, tree, records and history reads, and the clock.

import { parseCardPath, questionName, questionAnswerName, USAGE_KEYS, USAGE_OTHER_KEYS, NOT_AVAILABLE, NOT_RECORDED } from './records.js';
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
 * question has no history was asked in a session and isn't listed. Returns { rows, pending }:
 * `pending` counts the rulings whose history reads haven't returned yet, so the view can say the
 * list isn't complete; an open question whose history hasn't returned is listed with
 * `raisedLoading` (shown "loading…", never "not recorded").
 */
export function questionRows(model, tree, records, history, nowMs, days = ASKED_DAYS) {
  const rows = [];
  let pending = 0;
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
    rows.push({ kind: 'question', label: name, path, raisedAt, raisedLoading: raised === undefined, answeredAt: null,
      state: 'open', waitMs: raisedAt == null ? null : Math.max(0, nowMs - raisedAt), proxy: null, ruling: null });
  }
  if (model === 'v3') {
    for (const path of tree.keys()) {
      const name = questionAnswerName(path);
      if (!name || listed.has(name)) continue;
      const answered = oldest(path);
      if (answered === undefined) {
        pending++;
        continue;
      }
      if (answered == null || nowMs - answered > days * DAY) continue; // answered before the window
      const raised = oldest(`questions/${name}.md`);
      if (raised === undefined) {
        pending++;
        continue;
      }
      if (raised == null || !inWindow(raised)) continue; // asked in a session, or raised before the window
      const rec = records.get(path);
      rows.push({ kind: 'question', label: name, path: `questions/${name}.md`, rulingPath: path, raisedAt: raised,
        raisedLoading: false, answeredAt: answered, state: 'answered', waitMs: Math.max(0, answered - raised),
        proxy: rec ? rec.proxy : null, ruling: rec ? rec.ruling : null });
    }
  }
  rows.sort((a, b) => (b.raisedAt ?? Infinity) - (a.raisedAt ?? Infinity));
  return { rows, pending };
}

/** The words for a figure that can't be shown yet (B1): never a zero or "none". */
export function notReadText(names) {
  return `not available until ${names.join(', ')} ${names.length === 1 ? 'has' : 'have'} been read`;
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

const V5_HEAD = 'Median answer time, weekday cards, last 14 days: ';

/**
 * AC21's footer over every v3 project (B1). entries: [{ name, v3, readOk, model }], where readOk
 * says the project's latest read succeeded and model is null when its box couldn't be built.
 * Until every v3 project has been read, with its log months loaded, the line says which ones it
 * waits for, instead of a median over what it happens to hold.
 */
export function v5Footer(entries, fmt) {
  const v3 = entries.filter((e) => e.v3);
  const waiting = v3.filter((e) => !e.readOk || !e.model || !e.model.logLoaded).map((e) => e.name);
  if (waiting.length) return `${V5_HEAD}${notReadText(waiting)}`;
  return v5Line(v3.flatMap((e) => e.model.v5Waits || []), fmt);
}

/** AC21's footer line from every v3 project's counted waits (all of them read). */
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

/** A percentage to one decimal of `part` over `whole`, only when both are figures (AC23's rule). */
function percent(part, whole) {
  return Number.isInteger(part) && Number.isInteger(whole) && whole > 0
    ? Math.round((part / whole) * 1000) / 10 : NOT_AVAILABLE;
}

/**
 * AC23's figures for one session, in model S-020's form (J10): each figure as its value,
 * 'not available' (null or unreported) or 'not recorded' (a value of the wrong kind); the peak as a
 * percentage of the window and of the compaction threshold, each only when both its figures are
 * present. A session without a `usage` key: { recorded: false, words: 'not recorded' }.
 */
export function usageView(row) {
  if (!row.usage) return { recorded: false, words: NOT_RECORDED };
  const u = row.usage;
  const fig = (k) => (Object.prototype.hasOwnProperty.call(u, k) ? u[k] : NOT_AVAILABLE);
  const out = { recorded: true };
  for (const k of [...USAGE_KEYS, ...USAGE_OTHER_KEYS]) out[k] = fig(k);
  out.context_peak_percent = percent(out.context_peak, out.context_window);
  out.threshold_percent = percent(out.context_peak, out.autocompact_threshold);
  return out;
}

const fmtNum = (v) => (typeof v === 'number' ? v.toLocaleString('en-US') : v);
const fmtPct = (v) => (typeof v === 'number' ? `${v.toFixed(1)}%` : v);
export const DERIVED_LABEL = 'derived from per-turn usage';

/** True when J10's `derived` names the figure `k` (and `derived` is a list). */
const isDerived = (u, k) => Array.isArray(u.derived) && u.derived.includes(k);

/** A whole-number figure for display, with " (derived from per-turn usage)" when `derived` names it. */
function figText(u, k) {
  const v = u[k];
  return typeof v === 'number' && isDerived(u, k) ? `${fmtNum(v)} (${DERIVED_LABEL})` : fmtNum(v);
}

/** A run time in ms, to the nearest second: "18 s", "2 min 5 s", "1 h 0 min 3 s". */
export function runTimeText(ms) {
  if (typeof ms !== 'number') return ms;
  if (!Number.isFinite(ms) || ms < 0) return NOT_AVAILABLE;
  const s = Math.round(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h} h ${m} min ${sec} s`;
  if (m > 0) return `${m} min ${sec} s`;
  return `${sec} s`;
}

/**
 * AC23's context line (review N2): the peak as tokens and as a percentage of the window when both
 * are figures; "(derived from per-turn usage)" goes only with a real peak figure that J10's
 * `derived` names. A missing peak or window shows its words, never garbled numbers.
 */
export function contextText(u) {
  const peak = u.context_peak;
  const win = u.context_window;
  const tag = isDerived(u, 'context_peak') ? ` (${DERIVED_LABEL})` : '';
  if (typeof peak !== 'number') {
    return `Context peak: ${peak}${typeof win === 'number' ? `; window ${fmtNum(win)} tokens` : ''}`;
  }
  if (typeof win !== 'number') return `Context peak: ${fmtNum(peak)} tokens${tag}; window: ${win}`;
  return `Context peak: ${fmtNum(peak)} tokens, ${fmtPct(u.context_peak_percent)} of a ${fmtNum(win)}-token window${tag}`;
}

/** The peak as a percentage of the compaction threshold (owner's answer 5), or its words. */
export function thresholdText(u) {
  if (typeof u.threshold_percent !== 'number') return `Peak, share of the compaction threshold: ${NOT_AVAILABLE}`;
  return `Peak, share of the compaction threshold: ${fmtPct(u.threshold_percent)} of ${figText(u, 'autocompact_threshold')} tokens`;
}

/**
 * Whole cents from dollars, rounded half up on the decimal value as written (1.005 → 101), not on
 * its binary approximation (1.005 * 100 = 100.49999…). Falls back to the plain product for a
 * number whose text already has an exponent.
 */
function cents(v) {
  const c = Math.round(Number(`${v}e2`));
  return Number.isFinite(c) ? c : Math.round(v * 100);
}

/** The cost estimate: "estimate $x.xx", never a charge (the account is billed by subscription). */
export function costText(v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return v;
  const c = cents(v);
  if (!Number.isSafeInteger(c)) return `estimate $${v.toFixed(2)}`;
  const sign = c < 0 ? '-' : ''; // -0 and a cost that rounds to zero print "0.00", never "-0.00"
  const a = Math.abs(c);
  return `estimate ${sign}$${Math.floor(a / 100)}.${String(a % 100).padStart(2, '0')}`;
}

/** "yes", "no" or its words. */
const yesNo = (v) => (v === true ? 'yes' : v === false ? 'no' : v);

/**
 * AC23's drill-down for one session: the lines shown behind the session's tap, never on its
 * timeline row. A session without `usage` gives one line, "Usage: not recorded".
 */
export function usageLines(row) {
  const u = usageView(row);
  if (!u.recorded) return [`Usage: ${u.words}`];
  const out = [
    `Tokens: input ${figText(u, 'input_tokens')}, output ${figText(u, 'output_tokens')}, cache read ${figText(u, 'cache_read_input_tokens')}, cache write ${figText(u, 'cache_creation_input_tokens')} · turns ${figText(u, 'num_turns')}`,
    `Run time (agent tool): ${runTimeText(u.duration_ms)}${typeof u.duration_ms === 'number' && isDerived(u, 'duration_ms') ? ` (${DERIVED_LABEL})` : ''}`,
    contextText(u),
    thresholdText(u),
    `Would have stopped: ${yesNo(u.would_have_stopped)}`,
    `Compactions: ${figText(u, 'compactions')}`,
    `Cost: ${costText(u.cost_usd_estimate)}`,
  ];
  if (u.derived === NOT_RECORDED) out.push(`Which figures are derived: ${NOT_RECORDED}`);
  return out;
}
