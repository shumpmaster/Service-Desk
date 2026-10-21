// J16's "Rule 0 in the sender" (spec S-001, stage 1b of "The desk as mockup v2"; AC73's note, J18,
// J22): the sender leaves out of its set a pull request J22's rule 0 finds with the agents, judged by
// the pure module the page uses (src/lib/j22.js: `ruleZero`, `ownerCheckHeads`, `ownerChecksApply`),
// fed the same inputs the page feeds it. This file holds only the sender's reads for it and their
// memory (J18's rule-0 part); the judgment is the shared module's, never forked here.
//
// Its reads, all through the sender's guarded GitHub client (gh.mjs: the budget guard, sizes):
//   (ii) each required verdict file in J20's list at the head, added or modified, by the blob sha the
//        list gives it (`git/blobs/{sha}`), once per blob sha (kept in J18 by its keyed hash); one
//        only on the default branch is read from the checkout, with no request;
//   (i)  the owner check (`commits/{sha}/status`), only where the page reads it, for the heads
//        `ownerCheckHeads` chooses, conditional with J18's ETag, made last in the run and skipped
//        when the last answer before them shows fewer than 400 requests left (or no header).
// Every answer is untrusted data: a blob is decided only from bytes whose git blob sha is the one
// asked for, under 1 MB and UTF-8 text; anything else counts as given (the safe side, V1) and is
// not kept, so the next run asks again. A failed owner check is "not read", so (i) does not hold.

import { createHash } from 'node:crypto';
import { ruleZero, ownerCheckHeads, ownerChecksApply, parseRiskPaths, listAt, judgeFiles, verdictPath, ownerCheckFrom,
  RISK_PATHS_PATH, OWNER, AFTER_AGENTS, VERDICT_FILE_RE } from '../lib/j22.js';
import { verdictOf } from '../lib/j11.js';
import { classifyPull } from '../lib/records.js';
import { BUDGET_FLOOR } from './gh.mjs';
import { verdictHash, headHash, emptyRule0, R0_STATES, ETAG_RE } from './state.mjs';

/** A verdict blob over this is counted as given, never read (J16's failure rules). */
export const VERDICT_MAX_BYTES = 1024 * 1024;
/** The blob read's whole answer at most: 1 MB as base64, GitHub's line breaks in it, and the JSON around it. */
export const BLOB_ANSWER_CAP = 1536 * 1024;
export const STATUS_ANSWER_CAP = 1024 * 1024;
/** J16: the owner-check reads are skipped below the guard's floor plus 100 (about four quiet runs' reads). */
export const OWNER_CHECK_FLOOR = BUDGET_FLOOR + 100;

const SHA_RE = /^[0-9a-f]{40}$/;
const B64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

/** git's blob sha of some bytes (`git hash-object`). */
export const gitBlobSha = (buf) => createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');

/** UTF-8 text, or null when the bytes are not (a byte-order mark kept, for `verdictOf` to drop as review_check does). */
function utf8(buf) {
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(buf);
  } catch {
    return null;
  }
}

/** `verdictOf`'s answer as J18 keeps it: PASS, FAIL or neither (its 'other' and null). */
const wordOf = (v) => (v === 'PASS' || v === 'FAIL' ? v : 'neither');
/** A kept word as the shared module reads a blob's verdict. */
const verdictOfWord = (w) => (w === 'PASS' || w === 'FAIL' ? w : 'other');

/**
 * One verdict blob by its sha (`GET /repos/{o}/{r}/git/blobs/{sha}`, base64). Returns its text, or
 * null when the read fails, is refused, answers 404, is over 1 MB, is not UTF-8 text, or is not in
 * form (another sha, another encoding, bytes whose blob sha is not the one asked for).
 */
export async function readVerdictBlob(gh, repo, sha) {
  if (!SHA_RE.test(sha || '')) return null;
  const r = await gh.get(`/repos/${repo}/git/blobs/${sha}`, { cap: BLOB_ANSWER_CAP });
  if (r.status !== 200 || !r.json || typeof r.json !== 'object' || Array.isArray(r.json)) return null;
  const j = r.json;
  if (j.sha !== sha || j.encoding !== 'base64' || typeof j.content !== 'string') return null;
  if (!Number.isInteger(j.size) || j.size < 0 || j.size > VERDICT_MAX_BYTES) return null;
  const b64 = j.content.replace(/\r?\n/g, '');
  if (b64.length % 4 !== 0 || !B64_RE.test(b64)) return null;
  const buf = Buffer.from(b64, 'base64');
  if (buf.length !== j.size || buf.length > VERDICT_MAX_BYTES || gitBlobSha(buf) !== sha) return null;
  return utf8(buf);
}

/** governance/risk-paths.toml from the checkout of the default branch: parseRiskPaths' answer, or why not. */
export function riskPathsFrom(checkout) {
  if (!checkout.tree.has(RISK_PATHS_PATH)) return { ok: false, why: 'missing' };
  let text = null;
  try {
    text = checkout.blobs([RISK_PATHS_PATH]).get(RISK_PATHS_PATH);
  } catch {
    text = null;
  }
  return typeof text === 'string' ? parseRiskPaths(text) : { ok: false, why: 'unread' };
}

/**
 * The sender's rule 0 for one project, after every other read of the run. input: { project, repo,
 * checkout, gh, pulls (parsePulls' open list, J1's), flagged (the model's pull requests that need the
 * owner), files (Map(number → { headSha, changes, capped, verdicts }), J20's at each head), last (J18's
 * opened rule-0 part), stateKey }. Returns { agents: Set(number), outcomes: Map(number → ruleZero's
 * answer), heads: [sha] (the heads `ownerCheckHeads` chose), checked: [sha] (their reads made),
 * skipped (the owner-check reads skipped near the floor), applies, blobReads, part (J18's next part) }.
 */
export async function senderRuleZero(input) {
  const { project, repo, checkout, gh, stateKey } = input;
  const pulls = input.pulls || [];
  const files = input.files || new Map();
  const last = input.last || emptyRule0();
  const part = emptyRule0();
  const rp = riskPathsFrom(checkout);
  const applies = ownerChecksApply(project, pulls);

  // A required verdict file only on the default branch: read from the checkout, by the same reader,
  // with no request (J16). A blob that is not UTF-8 text, or over 1 MB, counts as given.
  const treeRead = new Map();
  const treeVerdict = (path) => {
    if (!checkout.tree.has(path)) return { inTree: false, read: false, verdict: null };
    if (!VERDICT_FILE_RE.test(path)) return { inTree: true, read: false, verdict: null };
    if (!treeRead.has(path)) {
      let text = null;
      try {
        text = checkout.blobs([path]).get(path);
      } catch {
        text = null;
      }
      const ok = typeof text === 'string' && Buffer.byteLength(text, 'utf8') <= VERDICT_MAX_BYTES;
      treeRead.set(path, ok ? { inTree: true, read: true, verdict: verdictOf(text) } : { inTree: true, read: false, verdict: null });
    }
    return treeRead.get(path);
  };

  // (ii)'s verdicts, and the owner's for the selection: each blob sha read once, or taken from J18.
  const blobs = new Map(); // sha → { state: 'read', verdict } | { state: 'failed' }
  const ctx = { project, rp, files, checksRead: applies, verdictBlob: (sha) => blobs.get(sha) || null, treeVerdict, ownerCheck: () => null };
  const want = [];
  const byRaised = (a, b) => {
    const t = (p) => (Number.isFinite(Date.parse(p.createdAt)) ? Date.parse(p.createdAt) : Infinity);
    return t(a) - t(b) || a.number - b.number;
  };
  for (const pr of [...(input.flagged || [])].sort(byRaised)) {
    const list = listAt(pr, project, files);
    if (list.state !== 'read') continue;
    const a = judgeFiles(pr, ctx);
    const ids = [...(applies ? [OWNER] : []), ...(a.state === 'known' ? [...a.required.keys()].filter((x) => x !== OWNER).sort() : [])];
    for (const id of ids) {
      const e = list.f.verdicts ? list.f.verdicts.get(verdictPath(pr.number, id)) : null;
      if (e && e.present && e.sha && !want.includes(e.sha)) want.push(e.sha);
    }
  }
  let blobReads = 0;
  for (const sha of want) {
    const kept = last.v[verdictHash(stateKey, sha)];
    if (kept) {
      blobs.set(sha, { state: 'read', verdict: verdictOfWord(kept) });
      continue;
    }
    blobReads++;
    const text = await readVerdictBlob(gh, repo, sha);
    blobs.set(sha, typeof text === 'string' ? { state: 'read', verdict: verdictOf(text) } : { state: 'failed' });
  }
  // J18: a verdict is kept while an open pull request's file list still holds its blob; a failed read is never kept.
  for (const f of files.values()) {
    for (const e of (f.verdicts || new Map()).values()) {
      if (!e.present || !e.sha) continue;
      const h = verdictHash(stateKey, e.sha);
      const b = blobs.get(e.sha);
      if (b && b.state === 'read') part.v[h] = wordOf(b.verdict);
      else if (last.v[h]) part.v[h] = last.v[h];
    }
  }

  // (i), the owner check: the run's last GitHub reads, for the heads the page reads it for.
  const heads = applies ? ownerCheckHeads(pulls, ctx) : [];
  const answers = new Map(); // sha → { read: true, state, description }
  const checked = [];
  const rem = gh.state.lastRemaining;
  const skipped = heads.length > 0 && !(typeof rem === 'number' && rem >= OWNER_CHECK_FLOOR);
  const answerOf = (e) => ({ read: true, state: e.state, description: e.after ? AFTER_AGENTS : '' });
  for (const pr of heads) {
    if (!SHA_RE.test(pr.headSha || '')) continue;
    const h = headHash(stateKey, project.name, pr.number, pr.headSha);
    const kept = last.h[h] || null;
    if (skipped) {
      if (kept) part.h[h] = kept; // kept for the next run; not read this run, so (i) does not hold
      continue;
    }
    checked.push(pr.headSha);
    const r = await gh.get(`/repos/${repo}/commits/${pr.headSha}/status?per_page=100`, { cap: STATUS_ANSWER_CAP,
      ifNoneMatch: kept && kept.etag ? kept.etag : undefined });
    if (r.status === 304 && kept && kept.etag) {
      part.h[h] = kept;
      answers.set(pr.headSha, answerOf(kept));
      continue;
    }
    if (r.status !== 200 || typeof r.text !== 'string') {
      if (kept) part.h[h] = kept; // failed or refused: "not read" this run, its ETag kept for the next
      continue;
    }
    const e = ownerCheckFrom(r.text);
    if (e === undefined) continue; // malformed: "not read", and nothing kept from it
    const tag = r.headers && r.headers.get('etag');
    const entry = e === null ? { etag: null, state: null, after: false }
      : { etag: null, state: R0_STATES.includes(e.state) ? e.state : null, after: e.description.startsWith(AFTER_AGENTS) };
    entry.etag = typeof tag === 'string' && ETAG_RE.test(tag) ? tag : null;
    part.h[h] = entry;
    answers.set(pr.headSha, answerOf(entry));
  }
  // J18: a head's entry is kept while that head is open (a head chosen before and not this run too).
  for (const pr of pulls) {
    if (!pr || !Number.isInteger(pr.number) || !SHA_RE.test(pr.headSha || '')) continue;
    const h = headHash(stateKey, project.name, pr.number, pr.headSha);
    if (!part.h[h] && last.h[h]) part.h[h] = last.h[h];
  }

  // The judgment: the shared module's, at each pull request's current head, never kept across heads.
  const judged = { ...ctx, ownerCheck: (sha) => (applies ? answers.get(sha) || null : null) };
  const agents = new Set();
  const outcomes = new Map();
  for (const pr of input.flagged || []) {
    if (!classifyPull(pr, project).flagged) continue;
    const r0 = ruleZero(pr, judged);
    outcomes.set(pr.number, r0);
    if (r0.withAgents) agents.add(pr.number);
  }
  return { agents, outcomes, heads: heads.map((p) => p.headSha), checked, skipped, applies, blobReads, part };
}
