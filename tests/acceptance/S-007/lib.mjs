// Locked checks for spec S-007 (P-003): shared helpers.
// Written by check-author from the frozen spec (specs/S-007.md) alone; see README.md for the seam contract.
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SPEC = 'S-007';
export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../../..');

// ---- the seam (README.md, "Why there is a seam") ------------------------------------------
export const SEAM_PATH = process.env.S007_SEAM
  ? path.resolve(ROOT, process.env.S007_SEAM)
  : path.join(ROOT, 'tests/desk/s007-seam.mjs');

// A missing seam makes every test file fail at import. That is intended: no seam, no pass.
export const seam = await import(pathToFileURL(SEAM_PATH).href);

export const BASELINE_PATH = process.env.S007_BASELINE
  ? path.resolve(ROOT, process.env.S007_BASELINE)
  : path.join(ROOT, 'tests/desk/S-007-baseline.json');

export function baseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    throw new Error(`S-007: baseline file missing at ${BASELINE_PATH}; run tests/acceptance/S-007/record-baseline.mjs at the base commit`);
  }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
}

export function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}
export function gitOk(...args) {
  try { execFileSync('git', args, { cwd: ROOT, stdio: 'ignore' }); return true; } catch { return false; }
}

// ---- time ---------------------------------------------------------------------------------
export const T0 = '2026-11-10T10:00:00.000Z';
export function at(base, hours = 0, minutes = 0) {
  return new Date(Date.parse(base) + hours * 3600e3 + minutes * 60e3).toISOString();
}
export function sameInstant(a, b) {
  return typeof a === 'string' && typeof b === 'string' && Date.parse(a) === Date.parse(b);
}

// ---- record builders (neutral form; README.md, "Records") -----------------------------------
export const WORDS = ['drop', 're-specify', 'resubmit'];
export const GATE_WORDS = ['proceed', 'recycle', 'drop'];

export function parseId(id) {
  const m = /^([A-Z]+-\d+)-(.+)-(\d+)$/.exec(id);
  if (!m) throw new Error(`bad card id ${id}`);
  return { item: m[1], gate: m[2], n: m[3] };
}
export function notesPath(id) {
  const { item, gate, n } = parseId(id);
  return `decisions/${item}/${gate}-${n}-notes.md`;
}
export function card(id, section5 = 're-specify', words = WORDS) {
  return { id, words: [...words], section5 };
}
export function gateCard(id, section5 = 'proceed') {
  return { id, words: [...GATE_WORDS], section5 };
}
export function entry(id, raised) {
  return { card: id, raised };
}
export function notes(word, { preamble = true } = {}) {
  const head = preamble ? '# Chief of Staff notes\n\nRead the card and the record.\n\n' : '';
  return `${head}Recommendation: \`${word}\`\n\nReasons follow.\n`;
}
export function records({ cards = [], others = [], files = {}, log = [], otherRefs = {}, fail = {} } = {}) {
  return { cards, others, files, log, otherRefs, fail };
}

// ---- states, flags, lines -------------------------------------------------------------------
export const HELD = 'held';
export const NOREC = 'shown, no recommendation yet';
export const rec = (w) => `shown, recommended ${w}`;
export const STATE_RE = /^(held|shown, no recommendation yet|shown, recommended \S+)$/;

export const LINES = {
  queue: 'Decision cards not shown: queue/ could not be read',
  notes: "Decision cards not shown: the Chief of Staff's notes could not be read",
  log: 'Decision cards without Chief of Staff notes not shown: the dispatch log could not be read',
};
export const MARK = 'No Chief of Staff recommendation yet';
export const NEW_LINES = Object.values(LINES);

export function norm(s) {
  return String(s ?? '').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
}
export function hasLine(lines, which) {
  return (lines ?? []).some((l) => norm(l) === LINES[which]);
}
export function withoutNewLines(lines) {
  return (lines ?? []).map(norm).filter((l) => !NEW_LINES.includes(l));
}

export function hasFlag(flags, which) {
  const fs_ = (flags ?? []).map(norm);
  if (which === 'queue') return fs_.some((f) => f.startsWith('decision cards not read:') && f.includes('queue/'));
  if (which === 'notes') return fs_.some((f) => f.startsWith('decision cards not read:') && /\bnotes\b/.test(f));
  if (which === 'log') return fs_.some((f) => f === 'decision cards without notes not read: dispatch log');
  throw new Error(which);
}

export function stateIn(list, id) {
  const c = (list.cards ?? []).find((x) => x.id === id);
  return c ? c.state : undefined;
}
export function decisionStates(list) {
  const out = {};
  for (const c of list.cards ?? []) if (c.kind === 'decision') out[c.id] = c.state;
  return out;
}

export const marked = (sheet) => (sheet?.buttons ?? []).filter((b) => b.recommended).map((b) => b.word);

// AC2: "Its card sheet says the Chief of Staff recommends that word." True when one line of the
// sheet's visible text names the Chief of Staff and says recommend, and the word is on that line
// or the next non-empty one, and the sheet does not carry the no-recommendation mark.
export function saysRecommends(text, word) {
  const t = String(text ?? '').replace(/[‘’]/g, "'");
  if (norm(t).includes(MARK)) return false;
  const esc = word.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
  const wordRe = new RegExp(`(^|[^A-Za-z-])${esc}([^A-Za-z-]|$)`);
  const lines = t.split(/\n/).map((l) => l.trim()).filter(Boolean);
  return lines.some((l, i) => /Chief of Staff/.test(l) && /recommend/i.test(l) && (wordRe.test(l) || wordRe.test(lines[i + 1] ?? '')));
}

// A state as the desk's views show it, from one snapshot plus the sheet for the id.
export async function viewState(desk, snap, id) {
  const inQueue = snap.queue.some((r) => r.id === id);
  const onBoard = snap.board.some((r) => r.id === id);
  if (!inQueue && !onBoard) return 'not shown';
  if (inQueue !== onBoard) return `inconsistent (queue ${inQueue}, board ${onBoard})`;
  const sheet = await desk.open(id, 'link');
  const m = marked(sheet);
  const hasMark = norm(sheet.text).includes(MARK);
  if (!sheet.answerable) return 'bad sheet (not answerable while shown)';
  if (m.length === 1 && !hasMark) return rec(m[0]);
  if (m.length === 0 && hasMark) return NOREC;
  return `bad sheet (marked ${JSON.stringify(m)}, mark ${hasMark})`;
}

export function ids(rows) {
  return (rows ?? []).map((r) => r.id).sort();
}
export function noticeIds(run) {
  return (run.notices ?? []).map((n) => n.id).sort();
}

// Runs fn with the process clock moved to `nowIso`; the rule must not notice (AC11, AC13).
export async function withFakeClock(nowIso, fn) {
  const Real = globalThis.Date;
  const fixed = Real.parse(nowIso);
  class FakeDate extends Real {
    constructor(...a) { if (a.length === 0) super(fixed); else super(...a); }
    static now() { return fixed; }
  }
  globalThis.Date = FakeDate;
  try { return await fn(); } finally { globalThis.Date = Real; }
}
