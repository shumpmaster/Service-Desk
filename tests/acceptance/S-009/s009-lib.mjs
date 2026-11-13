// S-009 locked checks: shared helpers (Check author, written from specs/S-009.md, frozen).
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
export const BASE_COMMIT = '04b722ecd45fd5ffb3f133a29475b8777c9bab1f'; // spec line 23

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
    if (!isStrArr(r.notices)) errs.push('notices is not an array of strings');
  } else if (caseData.kind === 'sender') {
    if (!Array.isArray(r.notices) || !r.notices.every(isStrArr)) errs.push('notices is not an array of arrays of strings');
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
  if (!fs.existsSync(of)) return { ok: false, error: `no output written (${diag})` };
  let out;
  try { out = JSON.parse(fs.readFileSync(of, 'utf8')); } catch (e) { return { ok: false, error: `output is not JSON: ${e.message}` }; }
  const errs = validateOutput(caseData, out);
  if (p.status !== 0) errs.unshift(`adapter exited non-zero (${diag})`);
  if (errs.length) return { ok: false, out, error: errs.join('; ') };
  return { ok: true, out, text: fs.readFileSync(of, 'utf8') };
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
// AC11/J4: every view of one desk result agrees about card `id`.
export function assertViewsAgree(result, id, { sender = true } = {}) {
  const e = entry(result, id);
  assert.equal(e.on_board, e.on_list, `${id}: on_board ${e.on_board} but on_list ${e.on_list}`);
  assert.equal(e.buttons, e.on_list, `${id}: buttons ${e.buttons} but on_list ${e.on_list}`);
  if (!e.on_list) assert.equal(e.marked, null, `${id}: off the list but marked ${e.marked}`);
  if (sender) assert.equal(result.notices.includes(id), e.on_list, `${id}: notices ${JSON.stringify(result.notices)} vs on_list ${e.on_list}`);
}

// ---------- J7 comparison (lines 163-167) ----------
export function deskProjection(result) {
  const nd = result.cards.filter((c) => !isDecisionId(c.id)).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return {
    cards: nd.map((c) => ({ id: c.id, on_list: c.on_list, on_board: c.on_board, buttons: c.buttons, marked: c.marked })),
    notices: result.notices.filter((n) => !isDecisionId(n)),
    home_count_less_decision_on_list: result.home_count - result.cards.filter((c) => isDecisionId(c.id) && c.on_list).length,
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
