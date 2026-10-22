// The question and gate sheets (spec S-001, AC85; desk mockup v2, frames 3, 3b and 4; stage 4). Pure:
// from a card's records as the board already reads them (AC80's cards, J2's parsed question and card
// files, J11's gate case and docs/PROJECT.md) and the clock, the words each sheet shows. The page
// (public/sandbox.js) draws them; nothing here reads, writes or changes what an answer file holds:
// each button's file is still AC80's (board.js's answerButtons), with the words box's text where
// AC53 places it.
//
// The rules: every word comes from a record or is one of the fixed words AC85 and the frames give;
// a field a file lacks says "not given" (AC12) and a record the desk lacks "not recorded" (AC41). How
// a question settles is reported as its file states it, "(per the question file)", never implied
// (AC12; the Chief of Staff records a default, which the owner then merges, AGENTS.md §5).

import { GATE_PHASE } from './j11.js';
import { STANDARD_MILESTONES } from './timeline.js';
import { NOT_RECORDED, NOT_AVAILABLE } from './sandbox.js';
import { defaultLabel } from './records.js';
import { hhmm } from './timefmt.js';

/** The sheets' fixed words (AC85; frames 3, 3b and 4; the gate's reason box as the spec corrects it). */
export const SHEET_WORDS = Object.freeze({
  words: 'Your own words, if you want them in the answer',
  optional: 'Optional',
  // decisions/README.md:13: `Reason:` is needed with `recycle` and with `hold` (the brief's
  // "Where the build differs": the frame's "Recycle or Kill" misstates the record).
  reason: 'Your reason (the answer file asks for one on Hold and Recycle)',
  reasonPlaceholder: 'Optional for Proceed and Kill',
  moveToDone: 'Move to Done',
  moveToDoneThen: 'then answer on GitHub',
  wholeQuestion: 'The whole question',
  wholeCard: 'The whole card',
  wholeThen: 'and the file each answer writes',
  caseOpens: 'The case opens',
  wholeCase: 'Read the whole case ↗',
  noCase: 'The case: no file recorded',
  views: 'Their views',
  critic: 'Critic',
  userRep: 'User representative',
  criticView: "The Critic's view ↗",
  recommended: 'Recommended',
  cantUndo: "Can't be undone",
  readAll: 'Read it all',
  readLess: 'Show less',
  writes: 'writes',
  copies: 'copies this text, for your session',
  atBranch: 'at',
});

const cap = (s) => String(s).replace(/^./, (c) => c.toUpperCase());
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Wed 21 Oct, 13:37" in the owner's time zone (frame 3b's settle time). */
export function settleWhen(ms, tz) {
  const d = new Date(ms);
  let parts = null;
  try {
    parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' })
      .formatToParts(d).map((p) => [p.type, p.value]));
  } catch {
    parts = { weekday: WEEKDAYS[d.getUTCDay()], day: String(d.getUTCDate()), month: MONTHS[d.getUTCMonth()] };
  }
  return `${parts.weekday} ${parts.day} ${parts.month}, ${hhmm(d, tz)}`;
}

/**
 * The rest of an irreversible question's REVERSIBILITY line, after its first word (AC85: "Can't be
 * undone. <the rest of its REVERSIBILITY line>."), as one sentence, or '' when the line says no more.
 */
export function reversibilityRest(rev) {
  const rest = String(rev || '').trim().replace(/^irreversible\b[\s:;,.—–-]*/i, '').trim();
  if (!rest) return '';
  const s = cap(rest);
  return /[.!?]$/.test(s) ? s : `${s}.`;
}

/**
 * Whether a question can be undone, or settles itself (AC85; AC12, changed; AC38), as its file says:
 * - irreversible: the lock, "Can't be undone." and "<the rest>. Never settles itself: it waits for
 *   you (per the question file).";
 * - reversible with DEFAULT and a TIMEOUT in hours: the clock, "Settles itself as <letter>" and
 *   " on <when> if left (per the question file: <TIMEOUT> hours). Reversible." (<when>, its raised
 *   time plus TIMEOUT, in the owner's time zone; with no raised time, said so, C);
 * - otherwise AC12's "not given" words, no icon.
 * Returns { icon: 'lock' | 'clock' | null, bold, text, kind: 'irreversible' | 'settles' | 'other' }.
 */
export function undoLine(q, raisedAt, tz) {
  const rev = String((q && q.reversibility) || '').trim();
  const low = rev.toLowerCase();
  if (low.startsWith('irreversible')) {
    const rest = reversibilityRest(rev);
    return { kind: 'irreversible', icon: 'lock', bold: "Can't be undone.", text: ` ${rest ? `${rest} ` : ''}Never settles itself: it waits for you (per the question file).` };
  }
  const hours = q && q.timeout ? /^[0-9]+(\.[0-9]+)?/.exec(String(q.timeout).trim()) : null;
  const letter = defaultLetter(q);
  if (low.startsWith('reversible') && letter && hours) {
    const h = hours[0];
    const unit = `${h} hour${h === '1' ? '' : 's'}`;
    if (raisedAt == null) {
      return { kind: 'settles', icon: 'clock', bold: `Settles itself as ${letter}`, text: ` ${unit} after it was raised, if left (per the question file: ${unit}; its raised time not recorded). Reversible.` };
    }
    return { kind: 'settles', icon: 'clock', bold: `Settles itself as ${letter}`, text: ` on ${settleWhen(raisedAt + Number(h) * 3600e3, tz)} if left (per the question file: ${unit}). Reversible.` };
  }
  // AC12's words for what the file lacks: its reversibility, and its DEFAULT label.
  return { kind: 'other', icon: null, bold: null,
    text: `Reversibility: ${rev || 'not given'} · Default: ${defaultLabel(q || {}, raisedAt != null ? new Date(raisedAt) : null)}` };
}

/** The option letter a question's DEFAULT names ("C", "C — …"), or null ("none", missing). */
export function defaultLetter(q) {
  const m = q && q.default ? /^([A-Z])\b/.exec(String(q.default).trim()) : null;
  return m ? m[1] : null;
}

/** AC85's eye line, AC12's fields: "Blast radius: <BLAST RADIUS> · risk <RISK CLASS>", each "not given" when the file lacks it. */
export const blastLine = (q) => `Blast radius: ${(q && q.blastRadius) || 'not given'} · risk ${(q && q.riskClass) || 'not given'}`;

/**
 * A lettered choice's words and its description (AC85: "<letter>. <its words>" split as AC52 spells
 * options out, the description under it): split at its first " — ", the form questions/_TEMPLATE.md
 * gives an option ("<choice> — <what happens, …>"); with none, all of it is the words (C).
 */
export function splitChoice(text) {
  const s = String(text || '');
  const i = s.indexOf(' — ');
  return i < 0 ? { words: s, desc: null } : { words: s.slice(0, i), desc: s.slice(i + 3) };
}

/** The question's opening (AC85, AC12): the first paragraph of its WHY, or AC12's "not given". */
export function whyOpening(q) {
  const why = q && typeof q.why === 'string' ? q.why.trim() : '';
  return why ? why.split(/\n\s*\n/)[0].trim() : 'not given';
}

/** A card file's numbered section's lines (`## <n>. …` up to the next `## `), or null. */
function sectionLines(text, n) {
  const ls = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
  const i = ls.findIndex((l) => new RegExp(`^## ${n}\\. `).test(l));
  if (i < 0) return null;
  const out = [];
  for (let j = i + 1; j < ls.length && !/^## /.test(ls[j]); j++) out.push(ls[j]);
  return out;
}

const CRITIC_RE = /^\*\*The Critic's recommendation:\*\* (proceed|hold|recycle into (?:Discovery|Design|Build|Launch)|kill)\b(.*)$/;
const USER_RE = /^\*\*The user representative's verdict:\*\* (approve|reject)\b(.*)$/;

/**
 * The views a gate card quotes (AC85, "Their views"; AC52's source, "the recommendation the gate card
 * quotes"): its section 5 as the Orchestrator writes it (model S-024 and S-025), "The Critic: <the
 * Critic's recommendation line>" and, where the step ran, "The user representative (a simulation, not
 * real users): <the representative's verdict line>", or "The user representative: not needed. …" or
 * "The user representative did not run: …". Returns { critic: { word, line } | null, user: { word,
 * line } | { notNeeded: true } | { notRun: true } | null }, `line` the rest of the record's line after
 * its label, word for word (AC9).
 */
export function gateViews(cardText) {
  const lines = sectionLines(cardText, 5) || [];
  let critic = null;
  let user = null;
  for (const l of lines) {
    const t = l.trim();
    if (t.startsWith('The Critic: ')) {
      const m = CRITIC_RE.exec(t.slice('The Critic: '.length));
      if (m) critic = { word: m[1], line: `${m[1]}${m[2]}`.trim() };
    } else if (t.startsWith('The user representative (a simulation, not real users): ')) {
      const m = USER_RE.exec(t.slice('The user representative (a simulation, not real users): '.length));
      if (m) user = { word: m[1], line: `${m[1]}${m[2]}`.trim() };
    } else if (t.startsWith('The user representative: not needed')) user = { notNeeded: true };
    else if (t.startsWith('The user representative did not run')) user = { notRun: true };
  }
  return { critic, user };
}

/** The gate card's two lines on the board (AC85, "On the board"): the Critic's word and the user representative's. */
export function gateWords(cardText, { criticInTree = false, ownerIsUser = null } = {}) {
  const v = gateViews(cardText);
  // The Critic's word from its record from this stage (AC80, AC85); with none quoted, stage 1a's words
  // stand: what the tree shows of the Critic's file (C).
  const critic = v.critic ? v.critic.word : criticInTree ? 'its view is on GitHub' : NOT_RECORDED;
  let user = NOT_RECORDED;
  if (v.user && v.user.word) user = v.user.word;
  else if ((v.user && v.user.notNeeded) || ownerIsUser === true) user = 'not needed';
  else if (v.user && v.user.notRun) user = 'did not run';
  return { critic, user };
}

/**
 * The gate sheet's "Their views" rows (AC85): the Critic's verdict word and its line, and, where one
 * runs, the user representative's, "not recorded" where no record gives it; nothing for the user
 * representative in a project whose owner is the user (AC52's line). Returns [{ who, text, gap }].
 */
export function viewRows(cardText, ownerIsUser) {
  const v = gateViews(cardText);
  const rows = [{ who: SHEET_WORDS.critic, text: v.critic ? v.critic.line : NOT_RECORDED, gap: !v.critic }];
  if (ownerIsUser === true || (v.user && v.user.notNeeded)) return rows;
  if (v.user && v.user.word) rows.push({ who: SHEET_WORDS.userRep, text: v.user.line, gap: false });
  else if (v.user && v.user.notRun) rows.push({ who: SHEET_WORDS.userRep, text: 'did not run: no proposal was written for this gate', gap: true });
  else rows.push({ who: SHEET_WORDS.userRep, text: NOT_RECORDED, gap: true });
  return rows;
}

/**
 * The gate sheet's title (AC85): "<Phase> gate: <the card's question>", the question the first line
 * of the card's `## 1. The decision` with the model's own lead "The <Phase> gate: " left out, so the
 * phase is not said twice (C).
 */
export function gateTitle(card) {
  const phase = cap(GATE_PHASE[card.gate] || card.gate || '');
  const sec = sectionLines(card.parsed ? card.parsed.text : '', 1) || [];
  const first = (sec.find((l) => l.trim()) || '').trim();
  const q = first.replace(new RegExp(`^The ${phase} gate:\\s*`, 'i'), '');
  return `${phase} gate: ${q ? cap(q) : NOT_RECORDED}`;
}

/**
 * The gate's phase's standard milestones as the project's lines give them (AC85, AC61): "<Phase>'s
 * standard milestones: <k> taken on, <j> skipped"; "not recorded yet" when no line names one; "not
 * available" until docs/PROJECT.md is read (C).
 */
export function standardLine(gate, doc) {
  const phase = cap(GATE_PHASE[gate] || gate || '');
  const head = `${phase}'s standard milestones: `;
  if (!doc) return `${head}${NOT_AVAILABLE}`;
  const ids = STANDARD_MILESTONES.filter((m) => m[1] === phase).map((m) => m[0]);
  const lines = ids.map((id) => (doc.standard || {})[id]).filter(Boolean);
  if (!lines.length) return `${head}not recorded yet`;
  const k = lines.filter((l) => l.state === 'taken on').length;
  const j = lines.filter((l) => l.state === 'skipped').length;
  return `${head}${k} taken on, ${j} skipped`;
}

/** The word the gate case recommends (AC85: "Recommended" on the case's recommendation): proceed, hold, recycle or kill, or null. */
export function caseWord(caseRec) {
  const r = caseRec && typeof caseRec.recommendation === 'string' ? caseRec.recommendation : null;
  if (!r) return null;
  const w = r.split(' ')[0];
  return ['proceed', 'hold', 'recycle', 'kill'].includes(w) ? w : null;
}

/** The parts of a sheet's head that its records give (AC85): "<project> · <kind> · <its name or id> · <milestone> · waiting <age>". */
export const headText = (parts) => parts.filter((x) => x != null && x !== '').join(' · ');

/**
 * What each button writes (AC85's fold, "the file each answer writes", so the owner can see what a tap
 * commits): its label, the path, the branch, and the text exactly as its link carries it (or as it is
 * copied, past `linkCap`). Returns [{ label, path, branch, text }].
 */
export function buttonFiles(buttons, defaultBranch) {
  return buttons.filter((b) => b && typeof b.text === 'string').map((b) => (b.path && b.href !== undefined
    ? { label: /↗$/.test(b.label) ? b.label : `${b.label} ↗`, path: b.path, branch: defaultBranch, text: b.text }
    // A v2.5 question's answer is text to copy into the owner's session (AC19's route), at no path.
    : { label: b.label, path: null, branch: null, text: b.text }));
}
