// Whether a standing asks-merge grant is in the project's ledger (spec S-001, J16's rule (d)), read
// as the model's `find_grant` reads it (governance/checks/asks_merge.py:267-344, with govlib's
// `parse_ledger`, `strip_comment` and `parse_supersedes`). The latest `asks-merge:` entry that is a
// delegation in form, not superseded, decided by the owner in a decisions/questions/ record present
// at the head, and that did not arrive in a merge carrying a `Merged-By:` trailer, is the grant.
// Where it cannot be read, there is no grant, so every pull request waits as any pull request.

import { parseTrailers } from '../lib/pulls.js';
// The ledger's pure form check is shared with the page's AC79 (moved to src/lib/ on 2026-10-19).
import { parseLedger, grantFormProblem, namedRecords, isAsksMergeEntry, LEDGER_REL, ASKS_MERGE_WORKFLOW } from '../lib/ledgergrant.js';

export { LEDGER_REL, ASKS_MERGE_WORKFLOW };

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
  const named = namedRecords(found[0]);
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
    if (!isAsksMergeEntry(e)) continue;
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
