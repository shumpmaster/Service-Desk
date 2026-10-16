// J12 on the page's side (spec S-001, MD sandbox; AC60, AC61, AC72; trial-view notes 2): the
// GraphQL answer the function hands back raw, judged here, and each pull request cut down to what
// the Timeline and the Queue's deploy check use. Also AC61 (c)'s reader of a pull request's body:
// its `Milestone:` line, its Context bullets and its Why. Pure: no network, no DOM, no storage.

import { plainInline } from './j11.js';

export const NOT_RECORDED = 'not recorded';
export const PULLS_MAX = 300; // J12: at most 3 pages of 100 are read, and at most 300 kept, the newest
export const PULLS_MAX_PAGES = 3;
export const PULLS_KEY = 'desk-pulls-v1'; // J12: the device's own store for them, apart from the blob cache
export const PULLS_RATE_MS = 60 * 60e3; // J12: after a RATE_LIMITED answer, no read for 60 minutes and until the next head change (C)
export const TOO_MANY_WORDS = 'older pull requests not read (over 300)';
export const CANT_READ_CHECKS = "the desk's token can't read checks";
export const NO_CHECKS = 'no checks recorded for this pull request';

const CHECK_STATES = new Set(['SUCCESS', 'FAILURE', 'ERROR', 'PENDING', 'EXPECTED']);

// ---------------------------------------------------------------------------
// AC61 (c): a pull request body's `Milestone:` line, Context and Why (model S-032 AC6, its draft of
// 2026-10-16). The desk reads exactly these and checks no form (S-032's own check does that).

const MILESTONE_RE = /^Milestone:[ \t]*(.*)$/;
const NONE_RE = /^none \((.+)\)$/;
const HEADING_RE = /^#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/;
const OPENING_RE = /^#{1,6}[ \t]+what this means for you:?[ \t]*$/i;
const EXCEPTION_RE = /^none beyond the ruling quoted in why\.?$/i;
const SOURCE_TAIL = ' (source: ';

const headingWord = (l) => {
  const m = HEADING_RE.exec(l);
  return m ? m[1].replace(/:$/, '').trim().toLowerCase() : null;
};

/** The lines of a section whose heading (any level, a colon allowed, case ignored) is `word`: from it to the next heading or the end; the first such counts. */
function sectionOf(lines, word) {
  const i = lines.findIndex((l) => headingWord(l) === word);
  if (i < 0) return null;
  const out = [];
  for (let j = i + 1; j < lines.length; j++) {
    if (HEADING_RE.test(lines[j])) break;
    out.push(lines[j]);
  }
  return out;
}

/** Where the `## What this means for you` paragraph ends (the line after it), or 0 with no such heading (C: the whole body is read). */
function afterOpening(lines) {
  const i = lines.findIndex((l) => OPENING_RE.test(l));
  if (i < 0) return 0;
  let j = i + 1;
  while (j < lines.length && !lines[j].trim()) j++;
  while (j < lines.length && lines[j].trim() && !HEADING_RE.test(lines[j])) j++;
  return j;
}

/**
 * One Context bullet, its continuation lines joined with one space (AC61 (c)): { fact, source }:
 * the source is the text inside the bullet's last ` (source: ` and its closing `)` at the end; the
 * exception bullet has `exception: true` and no source; a bullet not in that form keeps its words
 * as the fact with source null ("source not recorded"). An empty fact or source is "not recorded".
 */
export function contextBullet(text) {
  const t = String(text).trim();
  if (EXCEPTION_RE.test(t)) return { fact: t, source: null, exception: true };
  const at = t.lastIndexOf(SOURCE_TAIL);
  if (at >= 0 && t.endsWith(')')) {
    const fact = t.slice(0, at).trim();
    const source = t.slice(at + SOURCE_TAIL.length, -1).trim();
    return { fact: fact || NOT_RECORDED, source: source || NOT_RECORDED, exception: false };
  }
  return { fact: t || NOT_RECORDED, source: null, exception: false };
}

/**
 * A pull request body's parts as AC61 (c) reads them: { milestone: null | { none: reason } | { ids },
 * context: null | [{ fact, source, exception }], why: null | [paragraph] }. Nothing else of the body
 * is kept (J12).
 */
export function prBodyParts(body) {
  const lines = String(body == null ? '' : body).replace(/\r\n?/g, '\n').split('\n');
  let milestone = null;
  for (let i = afterOpening(lines); i < lines.length; i++) {
    const m = MILESTONE_RE.exec(lines[i]);
    if (!m) continue;
    const v = m[1].trim();
    const none = NONE_RE.exec(v);
    milestone = none ? { none: none[1].trim() } : { ids: v.split(', ').map((x) => x.trim()).filter(Boolean) };
    break;
  }
  let context = null;
  const ctx = sectionOf(lines, 'context');
  if (ctx) {
    context = [];
    let cur = null;
    for (const l of ctx) {
      if (/^- /.test(l)) {
        if (cur != null) context.push(contextBullet(cur));
        cur = l.slice(2);
      } else if (cur != null && /^[ \t]+\S/.test(l)) cur += ` ${l.trim()}`;
      else {
        if (cur != null) context.push(contextBullet(cur));
        cur = null; // a line in the section that is no bullet is not shown
      }
    }
    if (cur != null) context.push(contextBullet(cur));
  }
  let why = null;
  const w = sectionOf(lines, 'why');
  if (w) {
    const paras = [];
    let p = [];
    for (const l of w) {
      const t = l.replace(/^>[ \t]?/, '').trim();
      if (!t) {
        if (p.length) paras.push(plainInline(p.join(' ')));
        p = [];
      } else p.push(t);
    }
    if (p.length) paras.push(plainInline(p.join(' ')));
    why = paras;
  }
  return { milestone, context, why };
}

// ---------------------------------------------------------------------------
// J12: the GraphQL answer, judged by the page (the function does not parse it).

/** A pull request as the page keeps it (J12, "What the page keeps"): never the rest of its body. */
export function keptPull(n, checks) {
  return {
    number: n.number, title: n.title, state: n.state, mergedAt: n.mergedAt || null, createdAt: n.createdAt || null,
    closedAt: n.closedAt || null, head: typeof n.headRefName === 'string' ? n.headRefName : null,
    mergeCommit: n.mergeCommit && typeof n.mergeCommit.oid === 'string' ? n.mergeCommit.oid : null,
    checks, parts: prBodyParts(n.body),
  };
}

/** The check rollup state of a node's last commit (J12): one of CHECK_STATES, or null. */
function rollupOf(n) {
  const nodes = n && n.commits && Array.isArray(n.commits.nodes) ? n.commits.nodes : [];
  const last = nodes[nodes.length - 1];
  const s = last && last.commit && last.commit.statusCheckRollup ? last.commit.statusCheckRollup.state : null;
  return CHECK_STATES.has(s) ? s : null;
}

/**
 * Judge one J12 answer (raw text, or null for a failed read). Returns
 * { ok: true, pulls: [kept], hasNext, cursor, fieldError } or { ok: false, rate, reason }:
 * - null, or not JSON: a failed read;
 * - an error whose `type` is RATE_LIMITED: a rate limit for J12 only (rate: true);
 * - `data` null or missing, or no `repository`: a failed read, the first error's message (or the answer's own) as the reason;
 * - an error whose `path` ends in the check rollup, with the rest of `data` present: the rest is used,
 *   each pull request's checks holding that error's message (AC60's "the desk's token can't read checks").
 */
export function judgePulls(raw) {
  if (raw == null) return { ok: false, rate: false, reason: "the pull requests' read failed: GitHub could not be reached" };
  let v;
  try {
    v = JSON.parse(raw);
  } catch {
    return { ok: false, rate: false, reason: "the pull requests' read failed: GitHub's answer is not JSON" };
  }
  const errors = v && Array.isArray(v.errors) ? v.errors : [];
  if (errors.some((e) => e && e.type === 'RATE_LIMITED')) {
    const e = errors.find((x) => x && x.type === 'RATE_LIMITED');
    return { ok: false, rate: true, reason: `GitHub's GraphQL rate limit: ${typeof e.message === 'string' ? e.message : 'no message'}` };
  }
  const repo = v && v.data && v.data.repository;
  const conn = repo && repo.pullRequests;
  if (!repo || !conn || !Array.isArray(conn.nodes)) {
    const first = errors.find((e) => e && typeof e.message === 'string');
    const msg = first ? first.message : v && typeof v.message === 'string' ? v.message : 'no repository in the answer';
    return { ok: false, rate: false, reason: `the pull requests' read failed: ${msg}` };
  }
  const fieldErr = errors.find((e) => e && Array.isArray(e.path) && e.path[e.path.length - 1] === 'statusCheckRollup');
  const fieldError = fieldErr ? (typeof fieldErr.message === 'string' ? fieldErr.message : 'no message') : null;
  const pulls = conn.nodes.filter((n) => n && Number.isInteger(n.number) && typeof n.title === 'string')
    .map((n) => keptPull(n, fieldError ? { error: fieldError } : { state: rollupOf(n) }));
  const info = conn.pageInfo || {};
  return { ok: true, pulls, hasNext: info.hasNextPage === true, cursor: typeof info.endCursor === 'string' ? info.endCursor : null, fieldError };
}

/** Merge a page into what is kept (J12): each one replaces the one kept under its number; at most 300, the newest by creation. */
export function mergePulls(kept, page) {
  const by = new Map((kept || []).map((p) => [p.number, p]));
  for (const p of page) by.set(p.number, p);
  return [...by.values()].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || b.number - a.number).slice(0, PULLS_MAX);
}

/** A pull request's checks mark (AC60): { mark, word, why } from what J12 gave. */
export function checksMark(pr) {
  const c = pr && pr.checks;
  if (c && c.error) return { mark: '–', word: 'checks', why: `checks not recorded: ${CANT_READ_CHECKS}` };
  const s = c && c.state;
  if (s === 'SUCCESS') return { mark: '✓', word: 'checks', why: null };
  if (s === 'FAILURE' || s === 'ERROR') return { mark: '✕', word: 'checks', why: null };
  if (s === 'PENDING' || s === 'EXPECTED') return { mark: '…', word: 'checks', why: null };
  return { mark: '–', word: 'checks', why: `checks not recorded: ${NO_CHECKS}` };
}
