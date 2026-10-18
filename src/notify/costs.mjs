// AC78's $50 notifications, the sender's side (spec S-001, J21; Workflow 3's sender only): an
// hourly usage read with the shared reader in src/lib/usage.js, the month's step kept in J18's
// encrypted usage part, one notification each time the estimate passes a new $50 step. Nothing here
// logs: no figure, step or send of it ever reaches a log line, an issue or the state in clear.

import { readUsage, computeUsage, costStep, usageEntry } from '../lib/usage.js';
import { usageSummaryLine } from './words.mjs';

export const READ_EVERY_MS = 60 * 60e3;
export const UNREAD_ISSUE_MS = 24 * 3600e3;
const LOGIN_RE = /^[A-Za-z0-9-]{1,39}$/;

/**
 * J7's `actionsUsage` for this sender's project, when that project's entry holds it and it is in
 * form; else null, so no read (draft 9, Sec 5: only that project's sender reads usage, whatever
 * secrets are set).
 */
export function usageConfig(config, project) {
  const e = usageEntry(config);
  if (!e || !project || e.project !== project.name) return null;
  const a = e.cfg;
  if (!a || typeof a !== 'object' || typeof a.account !== 'string' || !LOGIN_RE.test(a.account)) return null;
  if (!Number.isInteger(a.includedMinutes) || a.includedMinutes <= 0) return null;
  if (!(a.reported === undefined || a.reported === true || a.reported === false)) return null;
  return { account: a.account, includedMinutes: a.includedMinutes, reported: a.reported !== false };
}

const FAIL_WHY = {
  refused: 'the usage token was refused',
  'not-found': "the usage token was refused, or GitHub doesn't report Actions use for this account",
  unavailable: "GitHub's usage report was not available, or answered in another form",
};

/** AC76's issue reason for the usage part as it stands, or null. */
export function usageReason(part, nowMs) {
  if (!part || !part.lastFail) return null;
  if (part.lastFail === 'refused' || (part.unreadSince && nowMs - Date.parse(part.unreadSince) >= UNREAD_ISSUE_MS)) {
    return { code: 'usage', why: FAIL_WHY[part.lastFail] || FAIL_WHY.unavailable };
  }
  return null;
}

/**
 * The run's usage step. input: { config, token, fetch, nowMs, part (the decrypted usage part, or
 * null), bootstrap (the run has no state at all), apiBase }. Returns { part, push: { step, cents,
 * ym } | null, summaryLine, read: boolean, state }.
 */
export async function usageStep(input) {
  const cfg = usageConfig(input.config, input.project);
  const nowMs = input.nowMs;
  const part = input.part ? { ...input.part } : null;
  const out = { part, push: null, summaryLine: null, read: false, state: null };
  if (!cfg || !cfg.reported || !input.token) return out;
  const due = !part || !part.readAt || nowMs - Date.parse(part.readAt) >= READ_EVERY_MS;
  if (!due) return out;
  const read = await readUsage({ account: cfg.account, token: input.token, fetch: input.fetch, nowMs, reported: true, apiBase: input.apiBase });
  const c = computeUsage(read, cfg);
  out.read = true;
  out.state = c.state;
  const readAt = new Date(nowMs).toISOString();
  if (c.state === 'ok' || c.state === 'not-reported') {
    const ym = c.ym;
    const sameMonth = part && part.ym === ym;
    const last = sameMonth ? part.step : 0;
    const pendingBefore = sameMonth ? part.pending : null;
    if (c.state === 'not-reported') {
      out.part = { ym, step: last, pending: null, readAt, unreadSince: null, lastFail: null };
      return out;
    }
    const step = costStep(c.estimateCents);
    if (input.bootstrap) {
      out.part = { ym, step: Math.max(step, last), pending: null, readAt, unreadSince: null, lastFail: null };
      if (c.estimateCents > 0) out.summaryLine = usageSummaryLine(c.estimateCents);
      return out;
    }
    const pending = step > last ? step : (pendingBefore != null && pendingBefore <= step ? step : null);
    out.part = { ym, step: Math.max(step, last), pending: pending && pending >= 1 ? pending : null, readAt, unreadSince: null, lastFail: null };
    if (out.part.pending) out.push = { step: out.part.pending, cents: c.estimateCents, ym };
    return out;
  }
  // A failed read keeps the last step and sends nothing.
  const base = part || { ym: null, step: 0, pending: null };
  out.part = { ...base, readAt, unreadSince: (part && part.unreadSince) || readAt,
    lastFail: c.state === 'refused' ? 'refused' : c.state === 'not-found' ? 'not-found' : 'unavailable' };
  return out;
}
