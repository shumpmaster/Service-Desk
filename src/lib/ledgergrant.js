// The ledger's pure form check for the asks-merge grant (spec S-001, J16's rule (d); AC79), read as
// the model's `find_grant` reads it (governance/checks/asks_merge.py:267-344, with govlib's
// `parse_ledger`, `strip_comment` and `parse_supersedes`), less the history walk. Moved here from
// src/notify/grant.mjs on 2026-10-19 (AC79) so the sender and the page share it: the sender's
// `findGrant` (src/notify/grant.mjs), which needs git for the entry's arrival, builds on these; the
// page, which has the ledger blob and the tree but no history, takes only `formGrant`, and trusts a
// grant only when the job's own grant line names the same entry (AC79). Pure: no network, no git, no
// DOM. An R3 path (Setup CS23): the sender runs it with the notification secrets.

import { pyStrip } from './pulls.js';

export const LEDGER_REL = 'docs/LEDGER.md';
export const ASKS_MERGE_WORKFLOW = '.github/workflows/asks-merge.yml';
const ENTRY_HEADING_RE = /^## (L-\d{4,}[a-z]?)\b(.*)$/;
const FIELD_RE = /^([a-z_]+):(.*)$/;
const LEDGER_ID_RE = /^L-\d{4,}[a-z]?$/;
export const RECORD_RE = /decisions\/questions\/[A-Za-z0-9][A-Za-z0-9._-]*\.md/g;
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

/** An entry's field, its first value stripped, or null. */
export const ledgerField = (e, k) => (Object.prototype.hasOwnProperty.call(e.fields, k) ? e.fields[k] : null);

/** asks_merge.grant_form_problem: why an entry is not a standing grant in form, or null. */
export function grantFormProblem(entry, entries) {
  if (stripComment(ledgerField(entry, 'type') || '') !== 'delegation') return 'its type is not delegation';
  if (stripComment(ledgerField(entry, 'scope') || '') !== 'project') return 'its scope is not project';
  if (stripComment(ledgerField(entry, 'expires') || '') !== 'never') return 'it does not expire never';
  if (!pyStrip(ledgerField(entry, 'decided_by') || '').startsWith('owner')) return 'its decided_by does not begin owner';
  if (!pyStrip(ledgerField(entry, 'decision') || '').startsWith('asks-merge:')) return 'its decision does not begin asks-merge:';
  for (const e of entries) if (parseSupersedes(ledgerField(e, 'supersedes')).includes(entry.id)) return `${e.id} supersedes it`;
  return null;
}

/** The decisions/questions/ records an entry's decided_by names. */
export const namedRecords = (entry) => (ledgerField(entry, 'decided_by') || '').match(RECORD_RE) || [];

/** Whether an entry's decision is an asks-merge one (find_grant looks only at those). */
export const isAsksMergeEntry = (entry) => pyStrip(ledgerField(entry, 'decision') || '').startsWith('asks-merge:');

/**
 * AC79's form check on the page: the latest `asks-merge:` entry that is a standing grant in form
 * (grantFormProblem) and whose decided_by names a decisions/questions/ record present in the tree
 * (`has(path)`), as find_grant takes the latest; { id } or null. It cannot see the entry's arrival
 * (find_grant refuses one that arrived in a `Merged-By:` merge), so the page trusts it only when the
 * job's own grant line names the same id. Text that is not a string is no grant.
 */
export function formGrant(text, has) {
  if (typeof text !== 'string') return null;
  const entries = parseLedger(text);
  for (const e of [...entries].reverse()) {
    if (!isAsksMergeEntry(e)) continue;
    if (grantFormProblem(e, entries)) continue;
    if (!namedRecords(e).some((p) => has(p))) continue;
    return { id: e.id };
  }
  return null;
}
