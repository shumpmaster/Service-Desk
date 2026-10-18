// Whether a standing asks-merge grant is in the project's ledger (spec S-001, J16's rule (d)), read
// as the model's `find_grant` reads it (governance/checks/asks_merge.py:267-344, with govlib's
// `parse_ledger`, `strip_comment` and `parse_supersedes`). The latest `asks-merge:` entry that is a
// delegation in form, not superseded, decided by the owner in a decisions/questions/ record present
// at the head, and that did not arrive in a merge carrying a `Merged-By:` trailer, is the grant.
// Where it cannot be read, there is no grant, so every pull request waits as any pull request.

import { pyStrip, parseTrailers } from '../lib/pulls.js';

export const LEDGER_REL = 'docs/LEDGER.md';
export const ASKS_MERGE_WORKFLOW = '.github/workflows/asks-merge.yml';
const ENTRY_HEADING_RE = /^## (L-\d{4,}[a-z]?)\b(.*)$/;
const FIELD_RE = /^([a-z_]+):(.*)$/;
const LEDGER_ID_RE = /^L-\d{4,}[a-z]?$/;
const RECORD_RE = /decisions\/questions\/[A-Za-z0-9][A-Za-z0-9._-]*\.md/g;
// Python's str.splitlines() boundaries.
const SPLITLINES_RE = /\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/;

/** govlib.strip_comment: drop `#` at the start or after white space, then strip. */
export function stripComment(line) {
  const m = /(^|\s)#/.exec(line);
  return pyStrip(m ? line.slice(0, m.index) : line);
}

/** govlib.parse_ledger: [{ id, fields }] (each field its first value, stripped). */
export function parseLedger(text) {
  const entries = [];
  let cur = null;
  const ls = String(text).split(SPLITLINES_RE);
  if (ls.length && ls[ls.length - 1] === '') ls.pop();
  for (const raw of ls) {
    const line = raw.replace(/\r+$/, '');
    const m = ENTRY_HEADING_RE.exec(line);
    if (m) {
      cur = { id: m[1], fields: {} };
      entries.push(cur);
      continue;
    }
    if (!cur) continue;
    const f = FIELD_RE.exec(line);
    if (f && !Object.prototype.hasOwnProperty.call(cur.fields, f[1])) cur.fields[f[1]] = pyStrip(f[2]);
  }
  return entries;
}

/** govlib.parse_supersedes: the ids, or [] for a value out of form. */
export function parseSupersedes(value) {
  if (value == null) return [];
  const v = stripComment(value);
  if (!(v.startsWith('[') && v.endsWith(']'))) return [];
  const inner = pyStrip(v.slice(1, -1));
  if (!inner) return [];
  const ids = [];
  for (const item of inner.split(',')) {
    const id = pyStrip(item).replace(/^['"]+|['"]+$/g, '');
    if (!LEDGER_ID_RE.test(id)) return [];
    ids.push(id);
  }
  return ids;
}

const field = (e, k) => (Object.prototype.hasOwnProperty.call(e.fields, k) ? e.fields[k] : null);

/** asks_merge.grant_form_problem: why an entry is not a standing grant in form, or null. */
export function grantFormProblem(entry, entries) {
  if (stripComment(field(entry, 'type') || '') !== 'delegation') return 'its type is not delegation';
  if (stripComment(field(entry, 'scope') || '') !== 'project') return 'its scope is not project';
  if (stripComment(field(entry, 'expires') || '') !== 'never') return 'it does not expire never';
  if (!pyStrip(field(entry, 'decided_by') || '').startsWith('owner')) return 'its decided_by does not begin owner';
  if (!pyStrip(field(entry, 'decision') || '').startsWith('asks-merge:')) return 'its decision does not begin asks-merge:';
  for (const e of entries) if (parseSupersedes(field(e, 'supersedes')).includes(entry.id)) return `${e.id} supersedes it`;
  return null;
}

function decode(buf) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    return null;
  }
}

function blobAt(git, rev, path) {
  try {
    return git(['cat-file', 'blob', `${rev}:${path}`]);
  } catch {
    return null;
  }
}

/** asks_merge.arrival: the first-parent commit at or before `rev` that brought `id` into the ledger, or null. */
function arrival(git, rev, id) {
  const shas = git(['rev-list', '--first-parent', rev]).toString('utf8').split('\n').filter(Boolean);
  if (!shas.length) return null;
  const check = git(['cat-file', '--batch-check'], Buffer.from(shas.map((s) => `${s}:${LEDGER_REL}\n`).join(''))).toString('utf8').split('\n');
  const blobs = shas.map((_, i) => {
    const parts = (check[i] || '').split(' ');
    return parts.length === 3 && parts[1] === 'blob' ? parts[0] : null;
  });
  const texts = new Map();
  const has = (blob) => {
    if (blob == null) return false;
    if (!texts.has(blob)) texts.set(blob, decode(git(['cat-file', 'blob', blob])));
    const t = texts.get(blob);
    return t != null && parseLedger(t).some((e) => e.id === id);
  };
  for (let i = 0; i < shas.length; i++) {
    const parent = i + 1 < shas.length ? blobs[i + 1] : null;
    if (blobs[i] !== parent && has(blobs[i]) && !has(parent)) return readCommit(git, shas[i]);
  }
  return null;
}

function readCommit(git, sha) {
  const raw = git(['cat-file', 'commit', sha]).toString('utf8');
  const cut = raw.indexOf('\n\n');
  const head = cut < 0 ? raw : raw.slice(0, cut);
  const message = cut < 0 ? '' : raw.slice(cut + 2);
  const parents = head.split('\n').filter((l) => l.startsWith('parent ')).map((l) => l.slice(7).trim());
  return { sha, parents, message };
}

/** asks_merge.grant_problem at `rev`, or null. */
function grantProblem(git, tree, entries, id) {
  const found = entries.filter((e) => e.id === id);
  if (!found.length) return 'no such entry in the ledger';
  const why = grantFormProblem(found[0], entries);
  if (why) return why;
  const named = (field(found[0], 'decided_by') || '').match(RECORD_RE) || [];
  if (!named.some((p) => tree.has(p))) return 'its decided_by names no decisions/questions/ record present there';
  const c = arrival(git, 'HEAD', id);
  if (c && c.parents.length >= 2) {
    const merged = parseTrailers(c.message).filter(([k]) => k.toLowerCase() === 'merged-by');
    if (merged.length) return `it arrived in merge ${c.sha.slice(0, 12)}, which carries a Merged-By: trailer`;
  }
  return null;
}

/**
 * The standing grant at the checkout's head: { id } or null, with why each `asks-merge:` entry is
 * not one. checkout: openCheckout's answer (its `git` runs at the head; `tree` is the head's).
 */
export function findGrant(checkout) {
  const reasons = [];
  if (!checkout.tree.has(LEDGER_REL)) return { grant: null, reasons };
  const buf = blobAt(checkout.git, 'HEAD', LEDGER_REL);
  const text = buf == null ? null : decode(buf);
  if (text == null) return { grant: null, reasons: ['the ledger cannot be read as text'] };
  const entries = parseLedger(text);
  for (const e of [...entries].reverse()) {
    if (!pyStrip(field(e, 'decision') || '').startsWith('asks-merge:')) continue;
    let why;
    try {
      why = grantProblem(checkout.git, checkout.tree, entries, e.id);
    } catch {
      why = 'its history cannot be read';
    }
    if (why == null) return { grant: { id: e.id }, reasons };
    reasons.push(`${e.id}: ${why}`);
  }
  return { grant: null, reasons };
}
