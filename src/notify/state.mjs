// A sender's memory between runs (spec S-001, J18): one workflow artifact, `desk-notify-state`,
// holding `state.json` and `state.sig`, an HMAC-SHA-256 of its bytes under DESK_NOTIFY_STATE_KEY.
// Taken only from the sender's own successful runs on the default branch, read with limits, and
// used only when its signature matches. Every item key in it is a keyed hash; the JWT and the usage
// part are encrypted. No title, path, number, endpoint, key or usage figure is in clear.
//
// state.json: { form, at, sub (the subscription's keyed hash), gone (the hash of one the push service
// said is gone), refused ({ status, reason, since } while the push service refuses the sender), jwt
// (sealed: the JWT, when minted, its audience), project ({ read, unreadSince }), keys ({ hash: { sent }
// | { unsent, fail, retrySince? } | { gaveUp } }; retrySince, draft 9: the first try-later or unnamed
// failure, AC76's give-up clock), cand (J16's job candidates: { hash of key and head: { seen,
// retried } }), recorded (AC77's questions whose answer's pull request was seen: { hash: when } for an
// end found, or { hash: { seen, pr } } with that pull request's number sealed as the JWT is, draft 9;
// a number is never in clear), usage (sealed: AC78's month, step, pending step and read times),
// rule0 (from stage 1b of "The desk as mockup v2", J16's rule 0; sealed as the JWT is, or null:
// { v: { hash of a verdict blob's sha: 'PASS' | 'FAIL' | 'neither' }, h: { hash of a pull request's
// key and head: { etag, state, after } } }, its entries counted toward the 5,000 with the others) }.

import { createHmac, createCipheriv, createDecipheriv, hkdfSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readZip } from './zip.mjs';

export const FORM = 1;
export const ARTIFACT = 'desk-notify-state';
export const STATE_FILE = 'state.json';
export const SIG_FILE = 'state.sig';
export const WORKFLOW_FILE = 'desk-notify.yml';
export const WORKFLOW_PATH = `.github/workflows/${WORKFLOW_FILE}`;
export const TRIGGERS = ['workflow_run', 'push', 'schedule', 'workflow_dispatch'];
export const LIMITS = Object.freeze({ zip: 1024 * 1024, json: 256 * 1024, keys: 5000 });
const HASH_RE = /^[0-9a-f]{32}$/;
const ISO_RE = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;
const PAD = 256;

const keyBytes = (stateKey) => Buffer.from(String(stateKey), 'utf8');

/** HMAC-SHA-256 of a string under the state key, first 32 hex characters (J18's keyed hash). */
export function keyHash(stateKey, s) {
  return createHmac('sha256', keyBytes(stateKey)).update(String(s), 'utf8').digest('hex').slice(0, 32);
}

/** J17's Topic and tag: the first 32 characters of the base64url HMAC of the key. */
export function topicOf(stateKey, s) {
  return createHmac('sha256', keyBytes(stateKey)).update(String(s), 'utf8').digest('base64url').slice(0, 32);
}

function partKey(stateKey, label) {
  return Buffer.from(hkdfSync('sha256', keyBytes(stateKey), Buffer.alloc(0), Buffer.from(`desk-notify ${label}`), 32));
}

/** Encrypt a part (AES-256-GCM under a key derived from the state key), padded so its size says little. */
export function sealPart(stateKey, label, obj) {
  let text = JSON.stringify(obj);
  text += ' '.repeat(PAD - (Buffer.byteLength(text) % PAD));
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', partKey(stateKey, label), iv);
  c.setAAD(Buffer.from(label));
  const ct = Buffer.concat([c.update(text, 'utf8'), c.final()]);
  return Buffer.concat([iv, ct, c.getAuthTag()]).toString('base64url');
}

/** Decrypt a part, or null when it cannot be read with this key. */
export function openPart(stateKey, label, sealed) {
  if (typeof sealed !== 'string') return null;
  try {
    const buf = Buffer.from(sealed, 'base64url');
    if (buf.length < 28) return null;
    const d = createDecipheriv('aes-256-gcm', partKey(stateKey, label), buf.subarray(0, 12));
    d.setAAD(Buffer.from(label));
    d.setAuthTag(buf.subarray(buf.length - 16));
    const text = Buffer.concat([d.update(buf.subarray(12, buf.length - 16)), d.final()]).toString('utf8');
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function signBytes(stateKey, bytes) {
  return createHmac('sha256', keyBytes(stateKey)).update(bytes).digest('hex');
}

const PR_PART = 'recorded-pr';
/** A recorded question's entry (J18, draft 9): its first-seen time, with its pull request's number sealed. */
export function recordedEntry(stateKey, seen, number) {
  return Number.isInteger(number) ? { seen, pr: sealPart(stateKey, PR_PART, { n: number }) } : seen;
}
/** A recorded entry read: { seen, number|null } (a number that can't be opened reads as none). */
export function readRecorded(stateKey, v) {
  if (typeof v === 'string') return { seen: v, number: null };
  if (!v || typeof v !== 'object') return { seen: null, number: null };
  const p = openPart(stateKey, PR_PART, v.pr);
  return { seen: v.seen, number: p && Number.isInteger(p.n) ? p.n : null };
}

// ---------------------------------------------------------------------------
// Rule 0's part (J18, stage 1b): each verdict the sender read, by the keyed hash of its blob sha,
// with its word as `verdictOf` reads it; and, for each head `ownerCheckHeads` chose, the keyed hash
// of the pull request's key and head with the owner check's ETag and its last answer (its state, and
// whether its description starts "Owner: after agents"). No sha, number, path or description in it.

const R0_PART = 'rule0';
export const R0_WORDS = Object.freeze(['PASS', 'FAIL', 'neither']);
export const R0_STATES = Object.freeze(['error', 'failure', 'pending', 'success']);
/** An ETag as GitHub sends it (strong or weak), in a form safe to send back as a header. */
export const ETAG_RE = /^(W\/)?"[\x21\x23-\x7e]{1,200}"$/;

export const emptyRule0 = () => ({ v: {}, h: {} });
/** The keyed hash a verdict blob is kept by. */
export const verdictHash = (stateKey, sha) => keyHash(stateKey, `verdict-blob|${sha}`);
/** The keyed hash a head's owner check is kept by: the pull request's AC73 key and its head. */
export const headHash = (stateKey, project, number, sha) => keyHash(stateKey, `${project}|pr|${number}|${sha}|owner-check`);

/** Whether an opened rule-0 part is in form. */
export function rule0Problem(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return 'not an object';
  if (Object.keys(p).length !== 2 || !p.v || typeof p.v !== 'object' || Array.isArray(p.v) || !p.h || typeof p.h !== 'object' || Array.isArray(p.h)) return 'its parts';
  for (const [k, w] of Object.entries(p.v)) if (!HASH_RE.test(k) || !R0_WORDS.includes(w)) return 'a verdict';
  for (const [k, e] of Object.entries(p.h)) {
    if (!HASH_RE.test(k) || !e || typeof e !== 'object' || Array.isArray(e) || Object.keys(e).length !== 3) return 'a head';
    if (!(e.etag === null || (typeof e.etag === 'string' && ETAG_RE.test(e.etag)))) return 'a head';
    if (!(e.state === null || R0_STATES.includes(e.state)) || typeof e.after !== 'boolean') return 'a head';
  }
  return null;
}
export const rule0Count = (p) => Object.keys(p.v).length + Object.keys(p.h).length;
export const sealRule0 = (stateKey, p) => sealPart(stateKey, R0_PART, p);
/** A state's rule-0 part opened: an empty part for none (null or absent), null when it can't be opened or is not in form. */
export function openRule0(stateKey, sealed) {
  if (sealed === null || sealed === undefined) return emptyRule0();
  const p = openPart(stateKey, R0_PART, sealed);
  return p && !rule0Problem(p) ? p : null;
}

/** A state with nothing in it yet. */
export function emptyState(nowIso) {
  return { form: FORM, at: nowIso, sub: null, gone: null, refused: null, jwt: null,
    project: { read: true, unreadSince: null }, keys: {}, cand: {}, recorded: {}, usage: null, rule0: null };
}

const isIso = (v) => typeof v === 'string' && ISO_RE.test(v);
const isoOrNull = (v) => v === null || isIso(v);

/**
 * Whether a parsed state is in this form; the reason when not. extra: entries counted toward the
 * 5,000 that only the state key can count (rule 0's sealed part; verifyState opens it).
 */
export function formProblem(s, extra = 0) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return 'not an object';
  if (s.form !== FORM) return 'another form';
  if (!isIso(s.at)) return 'its time';
  if (!(s.sub === null || HASH_RE.test(s.sub)) || !(s.gone === null || HASH_RE.test(s.gone))) return 'its subscription hash';
  if (s.refused !== null && (typeof s.refused !== 'object' || !Number.isInteger(s.refused.status) || !isIso(s.refused.since))) return 'its refusal';
  if (!(s.jwt === null || typeof s.jwt === 'string') || !(s.usage === null || typeof s.usage === 'string')) return 'its sealed parts';
  if (!(s.rule0 === undefined || s.rule0 === null || typeof s.rule0 === 'string')) return 'its sealed parts';
  if (!s.project || typeof s.project.read !== 'boolean' || !isoOrNull(s.project.unreadSince)) return 'its project part';
  if (!s.keys || typeof s.keys !== 'object' || Array.isArray(s.keys) || !s.cand || typeof s.cand !== 'object' || Array.isArray(s.cand)) return 'its keys';
  const keys = Object.keys(s.keys);
  const cands = Object.keys(s.cand);
  if (keys.length + cands.length + extra > LIMITS.keys) return 'too many keys';
  for (const k of keys) {
    const e = s.keys[k];
    if (!HASH_RE.test(k) || !e || typeof e !== 'object') return 'a key';
    const ok = (isIso(e.sent) && Object.keys(e).length === 1) || (isIso(e.gaveUp) && Object.keys(e).length === 1)
      || (isIso(e.unsent) && ['later', 'refused', 'gone', 'other'].includes(e.fail) && Object.keys(e).length === 2)
      || (isIso(e.unsent) && ['later', 'other'].includes(e.fail) && isIso(e.retrySince) && Object.keys(e).length === 3);
    if (!ok) return 'a key';
  }
  for (const k of cands) {
    const e = s.cand[k];
    if (!HASH_RE.test(k) || !e || !isIso(e.seen) || !isoOrNull(e.retried)) return 'a job candidate';
  }
  if (s.recorded !== undefined) {
    if (!s.recorded || typeof s.recorded !== 'object' || Array.isArray(s.recorded)) return 'its recorded questions';
    const rs = Object.keys(s.recorded);
    if (keys.length + cands.length + rs.length + extra > LIMITS.keys) return 'too many keys';
    for (const k of rs) {
      const v = s.recorded[k];
      const ok = isIso(v) || (v && typeof v === 'object' && !Array.isArray(v) && isIso(v.seen) && typeof v.pr === 'string' && Object.keys(v).length === 2);
      if (!HASH_RE.test(k) || !ok) return 'a recorded question';
    }
  }
  return null;
}

/** Check and parse a state's two files: { ok, state } or { ok: false, why: 'forged' | 'form' }. */
export function verifyState(stateKey, jsonBytes, sigBytes) {
  if (!Buffer.isBuffer(jsonBytes) || jsonBytes.length > LIMITS.json) return { ok: false, why: 'form' };
  const want = Buffer.from(signBytes(stateKey, jsonBytes), 'utf8');
  const got = Buffer.from(String(sigBytes == null ? '' : sigBytes).trim(), 'utf8');
  if (got.length !== want.length || !timingSafeEqual(got, want)) return { ok: false, why: 'forged' };
  let s;
  try {
    s = JSON.parse(jsonBytes.toString('utf8'));
  } catch {
    return { ok: false, why: 'form' };
  }
  return stateProblem(stateKey, s) ? { ok: false, why: 'form' } : { ok: true, state: s };
}

/**
 * Whether a parsed state is in form, with the state key (the reason when not): formProblem, with
 * rule 0's sealed part opened, checked and its entries counted toward the 5,000 (J18, stage 1b).
 */
export function stateProblem(stateKey, s) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return 'not an object';
  const r0 = typeof s.rule0 === 'string' ? openRule0(stateKey, s.rule0) : emptyRule0();
  if (!r0) return 'its rule-0 part';
  return formProblem(s, rule0Count(r0));
}

/** The two files' bytes for a state. */
export function stateFiles(stateKey, state) {
  const json = Buffer.from(JSON.stringify(state), 'utf8');
  return { json, sig: Buffer.from(signBytes(stateKey, json), 'utf8') };
}

/** Write the state for the workflow's upload step (only a run that built a state calls this). */
export function writeState(dir, stateKey, state) {
  const { json, sig } = stateFiles(stateKey, state);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, STATE_FILE), json);
  writeFileSync(join(dir, SIG_FILE), sig);
}

const sameRepo = (a, b) => typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();

/** Whether a listed run is one of the sender's own successful default-branch runs (J18). */
export function ownRun(run, repo, defaultBranch) {
  return Boolean(run) && Number.isInteger(run.id) && typeof run.path === 'string' && run.path.split('@')[0] === WORKFLOW_PATH
    && sameRepo(run.repository && run.repository.full_name, repo) && sameRepo(run.head_repository && run.head_repository.full_name, repo)
    && run.head_branch === defaultBranch && TRIGGERS.includes(run.event) && run.conclusion === 'success';
}

const ID_RE = /^[1-9][0-9]{0,19}$/;
const sameId = (v, id) => (typeof v === 'number' || typeof v === 'string') && String(v) === id;

/**
 * Whether a listed `desk-notify-state` artifact passes the checks of J18's that the artifact list
 * itself carries (AC76, draft 7, Critic round 5, finding 1): its `workflow_run` has `head_branch` the
 * default branch (main) and `repository_id` and `head_repository_id` both this repository's id. The
 * list does not carry the workflow's path, and no run is read by id.
 */
export function datingArtifact(a, repoId, defaultBranch) {
  const w = a && a.workflow_run;
  return Boolean(w) && a.name === ARTIFACT && typeof a.created_at === 'string' && Number.isFinite(Date.parse(a.created_at))
    && w.head_branch === defaultBranch && sameId(w.repository_id, repoId) && sameId(w.head_repository_id, repoId);
}

/**
 * The sender's own runs list, or a run's artifact list, failed (the Orchestrator's ruling for AC76,
 * draft 6; draft 7, finding 1): the failure is dated from the created time of the newest
 * `desk-notify-state` artifact that passes `datingArtifact`, read from the repository's artifacts by
 * name, newest first, one page of 100. A branch's or a fork's artifact is passed over, so it can never
 * keep the issue shut. Returns { kind: 'unreadable', why: 'read', unreadableSince, atOnce }: atOnce when
 * the repository's id (GITHUB_REPOSITORY_ID) is missing, or that read fails, or its page has none that
 * passes, so AC76's issue opens at once; otherwise it opens once unreadableSince is 30 minutes old.
 */
export async function datedFailure(gh, repo, repoId, defaultBranch) {
  const atOnce = { kind: 'unreadable', why: 'read', unreadableSince: null, atOnce: true };
  const id = typeof repoId === 'string' ? repoId.trim() : '';
  if (!ID_RE.test(id)) return atOnce;
  const r = await gh.get(`/repos/${repo}/actions/artifacts?name=${ARTIFACT}&per_page=100`);
  const list = r.status === 200 && r.json && Array.isArray(r.json.artifacts) ? r.json.artifacts : null;
  if (!list) return atOnce;
  const times = list.filter((x) => datingArtifact(x, id, defaultBranch)).map((x) => Date.parse(x.created_at));
  if (!times.length) return atOnce;
  return { kind: 'unreadable', why: 'read', unreadableSince: new Date(Math.max(...times)).toISOString(), atOnce: false };
}

/**
 * Find and read the last good state (J18). Returns { kind: 'state', state, at } | { kind: 'none' } |
 * { kind: 'unreadable', why: 'read' | 'forged' | 'form', unreadableSince: ISO|null, atOnce? } (unreadableSince: since when it has
 * been unreadable, the first later run's time; null when this run is the first; for a failed runs or artifact list,
 * datedFailure's). repoId: the runner's GITHUB_REPOSITORY_ID, for datedFailure's checks.
 */
export async function lookupState({ gh, repo, repoId, defaultBranch, stateKey }) {
  let r = await gh.get(`/repos/${repo}/actions/workflows/${WORKFLOW_FILE}/runs?status=success&per_page=100`);
  if (r.status >= 400 && r.status < 500 && r.status !== 401 && r.status !== 403 && r.status !== 404) {
    r = await gh.get(`/repos/${repo}/actions/workflows/${WORKFLOW_FILE}/runs?status=completed&per_page=100`);
  }
  if (r.status !== 200 || !r.json || !Array.isArray(r.json.workflow_runs)) return datedFailure(gh, repo, repoId, defaultBranch);
  const runs = r.json.workflow_runs.filter((x) => ownRun(x, repo, defaultBranch))
    .sort((a, b) => (Date.parse(b.created_at) - Date.parse(a.created_at)) || (b.id - a.id));
  // Since when the state has been unreadable: the first of the sender's runs after the one whose
  // state cannot be read (those runs uploaded nothing), or this run when there is none.
  const since = (run) => {
    const t = Date.parse(run.created_at);
    const after = runs.map((x) => Date.parse(x.created_at)).filter((x) => Number.isFinite(x) && x > t);
    return after.length ? new Date(Math.min(...after)).toISOString() : null;
  };
  for (const run of runs) {
    const a = await gh.get(`/repos/${repo}/actions/runs/${run.id}/artifacts?name=${ARTIFACT}&per_page=10`);
    if (a.status !== 200 || !a.json || !Array.isArray(a.json.artifacts)) return datedFailure(gh, repo, repoId, defaultBranch);
    const art = a.json.artifacts.find((x) => x && x.name === ARTIFACT && x.expired !== true && x.workflow_run && x.workflow_run.id === run.id);
    if (!art) continue;
    const unreadableSince = since(run);
    if (!Number.isInteger(art.id) || !(Number(art.size_in_bytes) <= LIMITS.zip)) return { kind: 'unreadable', why: 'form', unreadableSince };
    const d = await gh.download(`/repos/${repo}/actions/artifacts/${art.id}/zip`, LIMITS.zip);
    if (d.status === -1) return { kind: 'unreadable', why: 'form', unreadableSince };
    if (d.status !== 200 || !d.buf) return { kind: 'unreadable', why: 'read', unreadableSince };
    const files = readZip(d.buf, { maxEntry: LIMITS.json });
    if (!files || files.size !== 2 || !files.has(STATE_FILE) || !files.has(SIG_FILE)) return { kind: 'unreadable', why: 'form', unreadableSince };
    const v = verifyState(stateKey, files.get(STATE_FILE), files.get(SIG_FILE).toString('utf8'));
    if (!v.ok) return { kind: 'unreadable', why: v.why, unreadableSince };
    return { kind: 'state', state: v.state };
  }
  return { kind: 'none' };
}
