// S-009 locked checks: shared helpers (Check author, written from specs/S-009.md, frozen).
// Rewritten under specs/S-014.md (frozen; it supersedes S-009 and changes only J7's notice form)
// and the owner's ruling decisions/questions/P-003-S-009-adapter-stop.md (:19): the notice form
// (S-014 lines 154-155), its comparisons (lines 164, 166), coverage (line 169), a card's count
// difference (line 173), and the base commit (line 23). Line numbers below are S-014's; its
// lines 1-288 are numbered as S-009's.
// Stdlib only. Not a test file: the *.test.mjs files beside it import it.
//
// Every check here reaches the code only through the forms J7 fixes (spec lines 146-173):
//   node tests/desk/baseline/adapter.mjs <case file> <output file>   (from the repository root)
// and reads the baseline record and its note in place, at the paths line 23 fixes.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

export const ROOT = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
export const ADAPTER = 'tests/desk/baseline/adapter.mjs';
export const RECORD = 'reviews/S-009/baseline/record.json';
export const NOTE = 'reviews/S-009/baseline/note.md';
export const BASELINE_CASES_DIR = 'tests/acceptance/S-009/cases/baseline';
export const BASE_COMMIT = 'fca41700eb6dbedb6a4f00ab74c28112b16fb83f'; // S-014 line 23 (main's tip at its freeze)

// Exact words fixed by the criteria.
export const MARK = 'No Chief of Staff recommendation yet'; // AC4, AC5, AC6
export const L_QUEUE = 'Decision cards not shown: queue/ could not be read'; // AC16
export const L_NOTES = "Decision cards not shown: the Chief of Staff's notes could not be read"; // AC16
export const L_LOG = 'Decision cards without Chief of Staff notes not shown: the dispatch log could not be read'; // AC17
export const NEW_LINES = [L_QUEUE, L_NOTES, L_LOG];

export const DECISION_WORDS = ['drop', 're-specify', 'resubmit'];
export const GATE_WORDS = ['proceed', 'hold', 'recycle', 'kill'];

const ID_RE = /^([A-Z]+-\d+)-(.+)-(\d+)$/;
// J1: a decision card if <gate> is dor-fail, stop or failure (never matched by the prefix `dor`).
export function isDecisionId(id) {
  const m = ID_RE.exec(id);
  return !!m && ['dor-fail', 'stop', 'failure'].includes(m[2]);
}
export function isCantReadLine(line) {
  // J7 line 169: a line that begins with the words "Can't read" (either apostrophe accepted).
  return /^\s*Can['’]t read/.test(line);
}

// ---------- files ----------
export function rel(p) { return path.join(ROOT, p); }
export function exists(p) { return fs.existsSync(rel(p)); }
export function sha256File(abs) { return createHash('sha256').update(fs.readFileSync(abs)).digest('hex'); }

export function loadBaselineCases(root = ROOT) {
  const dir = path.join(root, BASELINE_CASES_DIR);
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => ({
    file: path.join(BASELINE_CASES_DIR, f),
    data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')),
  }));
}

// ---------- the record (line 23, J7 line 158) ----------
export class RecordMissing extends Error {}
export function loadRecord() {
  if (!exists(RECORD)) throw new RecordMissing(`baseline record not there yet: ${RECORD}`);
  if (!exists(NOTE)) throw new RecordMissing(`baseline note not there yet: ${NOTE}`);
  const text = fs.readFileSync(rel(RECORD), 'utf8');
  const rec = JSON.parse(text);
  // "puts the text of each case's output file, unchanged, into results": accept each entry as the
  // output object itself or as its text.
  const results = (rec.results || []).map((r) => (typeof r === 'string' ? JSON.parse(r) : r));
  const byCase = new Map(results.map((r) => [r.case, r]));
  return { raw: rec, results, byCase, sha256: sha256File(rel(RECORD)), noteText: fs.readFileSync(rel(NOTE), 'utf8') };
}

// ---------- output form (J7 lines 153-157) ----------
const isBool = (v) => typeof v === 'boolean';
const isStr = (v) => typeof v === 'string';
const isStrArr = (v) => Array.isArray(v) && v.every(isStr);
// S-014 line 155: a notice is { "words": "<text>", "opens": "<address>" }, and "Nothing else is
// recorded", so a notice with any other field is not in the form.
const isNotice = (n) => !!n && typeof n === 'object' && !Array.isArray(n) && isStr(n.words) && isStr(n.opens) &&
  Object.keys(n).length === 2;
const isNoticeArr = (v) => Array.isArray(v) && v.every(isNotice);
export function validateOutput(caseData, out) {
  const errs = [];
  if (!out || typeof out !== 'object') return ['output is not an object'];
  if (out.case !== caseData.case) errs.push(`case id ${JSON.stringify(out.case)} is not ${caseData.case}`);
  const r = out.result;
  if (!r || typeof r !== 'object') return [...errs, 'result missing'];
  if (caseData.kind === 'desk') {
    if (!Array.isArray(r.cards)) errs.push('cards is not an array');
    else for (const c of r.cards) {
      if (!c || !isStr(c.id) || !isBool(c.on_list) || !isBool(c.on_board) || !isBool(c.buttons) || !(c.marked === null || isStr(c.marked))) errs.push(`bad card entry ${JSON.stringify(c)}`);
    }
    if (!Number.isInteger(r.home_count)) errs.push('home_count is not an integer');
    if (!isStrArr(r.lines)) errs.push('lines is not an array of strings');
    if (!isNoticeArr(r.notices)) errs.push(`notices is not an array of notices { "words", "opens" } (S-014 line 155): ${JSON.stringify(r.notices)}`);
  } else if (caseData.kind === 'sender') {
    if (!Array.isArray(r.notices) || !r.notices.every(isNoticeArr)) errs.push(`notices is not an array, one per run, of arrays of notices { "words", "opens" } (S-014 line 155): ${JSON.stringify(r.notices)}`);
    else if (r.notices.length !== caseData.runs.length) errs.push(`notices has ${r.notices.length} runs, case has ${caseData.runs.length}`);
  } else if (caseData.kind === 'open') {
    if (!isBool(r.buttons)) errs.push('buttons is not a boolean');
    if (!isStr(r.lands)) errs.push('lands is not a string');
    if (!isStr(r.shows)) errs.push('shows is not a string');
  } else errs.push(`unknown kind ${caseData.kind}`);
  return errs;
}

// ---------- running the adapter (J7 line 147) ----------
let scratch;
function scratchDir() {
  if (!scratch) scratch = fs.mkdtempSync(path.join(os.tmpdir(), 's009-check-'));
  return scratch;
}
const cache = new Map();

// Runs one case through the adapter in `root` (default: the working tree, i.e. the built code).
// Returns { ok, out, error }. Never throws for a failed run; throws only if the adapter is absent.
export function runAdapterRaw(caseData, { root = ROOT, caseFile } = {}) {
  const adapterAbs = path.join(root, ADAPTER);
  if (!fs.existsSync(adapterAbs)) {
    throw new Error(`output does not exist yet: the adapter ${ADAPTER} is not there yet`);
  }
  const dir = fs.mkdtempSync(path.join(scratchDir(), 'run-'));
  let cf = caseFile;
  if (!cf) { cf = path.join(dir, `${caseData.case}.json`); fs.writeFileSync(cf, JSON.stringify(caseData, null, 2)); }
  const of = path.join(dir, `${caseData.case}.out.json`);
  const p = spawnSync(process.execPath, [ADAPTER, cf, of], { cwd: root, encoding: 'utf8', timeout: 300000 });
  const diag = `exit ${p.status}${p.signal ? ' signal ' + p.signal : ''}${p.error ? ' ' + p.error.message : ''}\n${(p.stderr || '').slice(-2000)}`;
  if (!fs.existsSync(of)) return { ok: false, wroteResult: false, error: `no output written (${diag})` };
  let out;
  try { out = JSON.parse(fs.readFileSync(of, 'utf8')); } catch (e) { return { ok: false, wroteResult: false, error: `output is not JSON: ${e.message}` }; }
  const errs = validateOutput(caseData, out);
  // wroteResult: the run wrote a result in J7's form, whatever its exit code (the poison run, J7
  // line 171: "A run that writes a result shows that the adapter does not need src/").
  const wroteResult = errs.length === 0;
  if (p.status !== 0) errs.unshift(`adapter exited non-zero (${diag})`);
  if (errs.length) return { ok: false, wroteResult, out, error: errs.join('; ') };
  return { ok: true, wroteResult, out, text: fs.readFileSync(of, 'utf8') };
}

// Runs a case on the built code and returns its result; fails the calling test on a failed run.
export function run(caseData, opts = {}) {
  const key = JSON.stringify(caseData) + '|' + (opts.caseFile || '');
  if (!opts.fresh && cache.has(key)) return cache.get(key);
  const r = runAdapterRaw(caseData, opts);
  if (!r.ok) throw new Error(`failed run of case ${caseData.case}: ${r.error}`);
  if (!opts.fresh) cache.set(key, r.out.result);
  return r.out.result;
}

// ---------- building built-only cases (J7 line 150 form) ----------
export function deskCase(id, moment, records, extra = {}) {
  return { case: id, kind: 'desk', moment, records: normRecords(records), fail: extra.fail || [], form: extra.form || 'path' };
}
export function openCase(id, moment, records, open, extra = {}) {
  return { case: id, kind: 'open', moment, records: normRecords(records), fail: extra.fail || [], form: extra.form || 'path', open };
}
export function senderCase(id, moment, runs) { return { case: id, kind: 'sender', moment, runs }; }
function normRecords(r) {
  return { queue: r.queue || {}, cases: r.cases || {}, notes: r.notes || {}, log: r.log || [], questions: r.questions || [], pulls: r.pulls || [] };
}
// A plain background every built desk case carries: a gate card, a question and a pull request.
export function background() {
  return {
    queue: { 'P-100-dor-1': GATE_WORDS },
    log: [{ card: 'P-100-dor-1', raised: '2026-11-01T08:00:00Z' }],
    questions: ['release-timing'],
    pulls: [{ number: 7, title: 'Update the board legend' }],
  };
}
export function withCards(base, cards) {
  // cards: [{ id, words?, raised? (omit for no log entry), raisedAll?: [..], notes? }]
  const r = { queue: { ...(base.queue || {}) }, cases: { ...(base.cases || {}) }, notes: { ...(base.notes || {}) }, log: [...(base.log || [])], questions: [...(base.questions || [])], pulls: [...(base.pulls || [])] };
  for (const c of cards) {
    r.queue[c.id] = c.words || DECISION_WORDS;
    const times = c.raisedAll || (c.raised ? [c.raised] : []);
    for (const t of times) r.log.push({ card: c.id, raised: t });
    if (c.notes !== undefined) r.notes[c.id] = c.notes;
  }
  return r;
}

// ---------- reading results ----------
export function entry(result, id) {
  const e = result.cards.find((c) => c.id === id);
  assert.ok(e, `no entry for ${id} in cards: ${JSON.stringify(result.cards.map((c) => c.id))}`);
  return e;
}
export function hasLine(result, line) { return result.lines.some((l) => l.trim() === line); }
// The card's state as the views show it: 'held' (or not shown), 'rec:<word>', or 'norec'.
export function stateOf(result, id) {
  const e = entry(result, id);
  if (!e.on_list) return 'off';
  return e.marked ? `rec:${e.marked}` : 'norec';
}
// AC11/J4: every view of one desk result agrees about card `id`. The sender part (S-014 line 173)
// is read by the card's count difference: 1 if it is `on_list`, 0 if not. It needs the desk case
// the result came from (`of`), to run the same records and moment with the card left out.
export function assertViewsAgree(result, id, { sender = true, of } = {}) {
  const e = entry(result, id);
  assert.equal(e.on_board, e.on_list, `${id}: on_board ${e.on_board} but on_list ${e.on_list}`);
  assert.equal(e.buttons, e.on_list, `${id}: buttons ${e.buttons} but on_list ${e.on_list}`);
  if (!e.on_list) assert.equal(e.marked, null, `${id}: off the list but marked ${e.marked}`);
  if (sender) {
    assert.ok(of && of.kind === 'desk', `${id}: assertViewsAgree's sender part needs the desk case ({ of })`);
    const d = countDifference(of, id);
    assert.equal(d, e.on_list ? 1 : 0, `${id}: count difference ${d} (the sender's first-run summary, S-014 line 173) vs on_list ${e.on_list}`);
  }
}

// ---------- reading a notice (S-014 line 155) ----------
// From `words` and `opens` alone. `opens` ending `/?open=<key>`, the key decoding to
// `<project>|<kind>|<id>`, is an item notice: count 1, its card the key's <id> (for a card
// `queue/<id>.md`, read as <id>). `opens` ending `/` (the desk's Home address) names no card: its
// count is the first whole number in digits in the body (the part of `words` after its first
// newline), 0 if none (line 173), and it is a summary on a case's first run, a group on a later one.
// Anything else is kind 'other' and fails coverage (line 169). `desk` is the desk's address, the
// part of `opens` before that ending.
const ITEM_OPENS = /^(.*)\/\?open=([^&#]*)$/;
const HOME_OPENS = /^(.*)\/$/;
const KEY_FORM = /^([^|]+)\|([^|]+)\|(.+)$/;
export function noticeBody(n) { const i = n.words.indexOf('\n'); return i < 0 ? '' : n.words.slice(i + 1); }
export function readNotice(n, { firstRun }) {
  const im = ITEM_OPENS.exec(n.opens);
  if (im) {
    let key = null;
    try { key = decodeURIComponent(im[2]); } catch { key = null; }
    const k = key === null ? null : KEY_FORM.exec(key);
    if (!k) return { kind: 'other', desk: im[1], count: null };
    // a card's <id> is `queue/<id>.md`; a question's is `questions/<name>.md` (the real sender's key,
    // as the Reviewer read it), read as <name>; any other <id> is taken as written
    const q = /^queue\/(.+)\.md$/.exec(k[3]) || (k[2] === 'question' ? /^questions\/(.+)\.md$/.exec(k[3]) : null);
    return { kind: 'item', desk: im[1], key, keyKind: k[2], card: q ? q[1] : k[3], count: 1 };
  }
  const hm = HOME_OPENS.exec(n.opens);
  if (hm) {
    const d = /\d+/.exec(noticeBody(n));
    return { kind: firstRun ? 'summary' : 'group', desk: hm[1], count: d ? Number(d[0]) : 0, hasDigits: !!d };
  }
  return { kind: 'other', desk: null, count: null };
}
// An item notice names list item `id` when its key's <id> is that id (a card's `queue/<id>.md` read
// as <id>), or, for a list id `<kind>:<rest>` (a question or pull request), when the key is
// `<project>|<kind>|<rest>` (a question's `<project>|question|questions/<rest>.md` read so).
export function names(info, id) {
  return info.kind === 'item' && (info.card === id || `${info.keyKind}:${info.card}` === id);
}
// A sender result's notices, read run by run (run 0 is the case's first run).
export function senderInfos(result) { return result.notices.map((ns, i) => ns.map((n) => readNotice(n, { firstRun: i === 0 }))); }
// Line 164: the words with the count written `<n>` (the first whole number in the body).
export function wordsWithN(n) {
  const i = n.words.indexOf('\n');
  if (i < 0) return n.words;
  return n.words.slice(0, i + 1) + n.words.slice(i + 1).replace(/\d+/, '<n>');
}

// ---------- a card's count difference (S-014 line 173) ----------
export function withoutCard(records, id) {
  const r = JSON.parse(JSON.stringify(records));
  delete r.queue[id];
  delete r.notes[id];
  r.log = r.log.filter((e) => e.card !== id);
  return r;
}
// A desk result's summary count, or null when it has no notice (a failed read). A desk result's
// notices are empty or one summary (line 169).
export function summaryCount(result, label = 'desk result') {
  if (result.notices.length === 0) return null;
  assert.equal(result.notices.length, 1, `${label}: a desk result's notices are empty or one summary (S-014 line 169): ${JSON.stringify(result.notices)}`);
  const info = readNotice(result.notices[0], { firstRun: true });
  assert.equal(info.kind, 'summary', `${label}: its one notice is not a summary opening Home: ${JSON.stringify(result.notices[0])}`);
  return info.count;
}
// The summary's count for desk case `c` less the summary's count for the same records and moment
// (and the same failures) with decision card `id` left out (its queue entry, notes and `card`
// entries). Worked out here, not by the adapter. null when `c`'s result has no summary.
export function countDifference(c, id) {
  assert.ok(isDecisionId(id) && id in c.records.queue, `count difference: ${id} is not a decision card in ${c.case}'s queue`);
  const withIt = summaryCount(run(c), c.case);
  if (withIt === null) return null;
  const wo = { ...c, case: `${c.case}-without-${id}`, records: withoutCard(c.records, id) };
  const without = summaryCount(run(wo), wo.case);
  assert.notEqual(without, null, `${wo.case}: no summary with ${id} left out, though ${c.case} has one`);
  return withIt - without;
}

// ---------- J7 comparison (S-014 lines 163-167) ----------
export function deskProjection(result) {
  const decOnList = result.cards.filter((c) => isDecisionId(c.id) && c.on_list).length;
  const nd = result.cards.filter((c) => !isDecisionId(c.id)).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return {
    cards: nd.map((c) => ({ id: c.id, on_list: c.on_list, on_board: c.on_board, buttons: c.buttons, marked: c.marked })),
    // S-014 line 164: the same number of notices, in the order caught, each with the same `opens`,
    // the same `words` once its count is written `<n>`, and the same count less this result's
    // decision-card entries that are `on_list`.
    notices: result.notices.map((n) => {
      const info = readNotice(n, { firstRun: true });
      return { opens: n.opens, words: info.kind === 'summary' ? wordsWithN(n) : n.words, count_less_decision_on_list: info.count === null ? null : info.count - decOnList };
    }),
    home_count_less_decision_on_list: result.home_count - decOnList,
    lines: result.lines.filter((l) => !NEW_LINES.includes(l.trim())),
  };
}
export function stripNewLines(text) {
  let t = text;
  for (const l of NEW_LINES) t = t.split(l).join('');
  return t.replace(/\s+/g, ' ').trim();
}
export function openProjection(result) {
  return { buttons: result.buttons, lands: result.lands, shows: stripNewLines(result.shows) };
}

// ---------- twins and the case set (J7 line 169) ----------
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function sameRecords(a, b) {
  try { assert.deepStrictEqual(a.records, b.records); return true; } catch { return false; }
}
export function twinOf(c, all) {
  return all.find((o) => o.kind === c.kind && o.fail.length === 0 && o.moment === c.moment && sameRecords(o, c) && (c.kind !== 'open' || same(o.open, c.open)));
}
export function logTargetOf(c, all) {
  // J7 line 165: the record's result for the same records with `log` failing in the same form.
  const form = c.form || 'path';
  return all.find((o) => o.kind === c.kind && o.moment === c.moment && sameRecords(o, c) && same(o.fail, ['log']) && (o.form || 'path') === form && (c.kind !== 'open' || same(o.open, c.open)));
}

// ---------- the record's hash keys (Critic N6) ----------
// The record's `hashes` keys are taken as paths from the repository root, POSIX separators; a
// leading "./" or "/" is ignored.
export const HASH_KEY_FORM = 'a path from the repository root with "/" separators, e.g. tests/desk/baseline/adapter.mjs';
export function normKey(k) { return k.replace(/\\/g, '/').replace(/^(\.\/)+/, '').replace(/^\/+/, ''); }
export function normHashes(h) { return Object.fromEntries(Object.entries(h).map(([k, v]) => [normKey(k), v])); }

// ---------- the files under tests/ the adapter reads (Critic N1) ----------
// Found statically: the adapter's relative imports (static `from '...'`, bare `import '...'`, and
// `import('...')` with a literal), followed through every imported file under tests/. A file it
// reads by another route cannot be found this way; the Reviewer's confirmation covers it (line 23).
export function adapterTestImports(root = ROOT) {
  const seen = new Set();
  const visit = (relPath) => {
    const abs = path.join(root, relPath);
    if (seen.has(relPath) || !fs.existsSync(abs)) return;
    seen.add(relPath);
    const text = fs.readFileSync(abs, 'utf8');
    const re = /(?:\bfrom\s*|\bimport\s*\(?\s*)['"](\.{1,2}\/[^'"]+)['"]/g;
    for (const m of text.matchAll(re)) {
      const target = path.relative(root, path.resolve(path.dirname(abs), m[1])).split(path.sep).join('/');
      if (target.startsWith('tests/')) visit(target);
    }
  };
  visit(ADAPTER);
  seen.delete(ADAPTER);
  return [...seen].sort();
}
