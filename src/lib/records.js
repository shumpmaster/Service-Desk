// Record parsers for the desk page (spec S-001, J1's CI rule, J2, J9 and J10).
// Pure functions over text: no network, no DOM. Shared by the page (as a copy under
// public/lib/, kept identical by the build) and the tests.

// ---------------------------------------------------------------------------
// Paths (J2, J9)

export const CARD_RE = /^queue\/([A-Z]+-[0-9]+)-([^/]+)-([0-9]+)\.md$/;
export const ANSWER_RE = /^decisions\/([A-Z]+-[0-9]+)\/([^/]+)-([0-9]+)\.md$/;
export const QUESTION_RE = /^questions\/([^/]+)\.md$/;
export const QUESTION_ANSWER_RE = /^decisions\/questions\/([^/]+)\.md$/;
export const STATUS_RE = /^status\/([A-Z]+-[0-9]+)\.toml$/;
export const LOG_RE = /^dispatch-log\/([0-9]{4}-[0-9]{2})\.jsonl$/;
export const ROUTING_PATH = 'governance/ROUTING.toml';
export const LEDGER_PATH = 'docs/LEDGER.md';
export const SPRINT_RE = /^docs\/sprints\/([^/]+\.md)$/;
// From M2: the Orchestrator's hold cards (AC46) and merge cards (AC47), and the merge gate's record.
export const HOLD_RE = /^queue\/ci-hold-([0-9a-f]{12})\.md$/;
export const MERGE_CARD_RE = /^queue\/([A-Z]+-[0-9]+)-merge-(conflict|by-hand)\.md$/;
export const MERGES_PATH = 'status/merges.jsonl';
export const OUTCOMES_PATH = 'status/outcomes.jsonl';
const SPRINT_SKIP = new Set(['PROGRESS.md', 'SPRINT_PLAN.md']);

/** A card path's parts, or null. `queue/P-001-dor-fail-2.md` → P-001, dor-fail, 2. */
export function parseCardPath(path) {
  const m = CARD_RE.exec(path);
  if (!m) return null;
  const [, item, gate, n] = m;
  return { path, item, gate, n: Number(n), answerPath: `decisions/${item}/${gate}-${n}.md` };
}

/** An answer path's parts, or null. `-notes.md` files are notes, not answers. */
export function parseAnswerPath(path) {
  if (path.endsWith('-notes.md')) return null;
  const m = ANSWER_RE.exec(path);
  if (!m) return null;
  return { path, item: m[1], gate: m[2], n: Number(m[3]) };
}

/** An owner question's name, or null (questions/_TEMPLATE.md is not a question). */
export function questionName(path) {
  const m = QUESTION_RE.exec(path);
  if (!m || m[1] === '_TEMPLATE') return null;
  return m[1];
}

/** A question answer's (ruling's) name, or null. `-notes.md` files are notes. */
export function questionAnswerName(path) {
  if (path.endsWith('-notes.md')) return null;
  const m = QUESTION_ANSWER_RE.exec(path);
  return m ? m[1] : null;
}

/** True for a v2.5 sprint file the desk reads (not PROGRESS.md or SPRINT_PLAN.md). */
export function isSprintPath(path) {
  const m = SPRINT_RE.exec(path);
  return Boolean(m) && !SPRINT_SKIP.has(m[1]);
}

/** A merge card path's parts (AC47), or null: `queue/P-001-merge-by-hand.md` → P-001, by-hand. */
export function parseMergeCardPath(path) {
  const m = MERGE_CARD_RE.exec(path);
  return m ? { path, item: m[1], step: m[2] } : null;
}

/**
 * Classify a path under queue/ (J2). Returns { kind: 'card', card } | { kind: 'hold' } |
 * { kind: 'merge-card', merge } | { kind: 'readme' } | { kind: 'merge-note' } | { kind: 'unparsed' } | null.
 */
export function classifyQueuePath(path) {
  if (!path.startsWith('queue/')) return null;
  if (path === 'queue/README.md') return { kind: 'readme' };
  if (path.startsWith('queue/merge/')) return { kind: 'merge-note' };
  if (HOLD_RE.test(path)) return { kind: 'hold' };
  const merge = parseMergeCardPath(path);
  if (merge) return { kind: 'merge-card', merge };
  const card = parseCardPath(path);
  if (card) return { kind: 'card', card };
  return { kind: 'unparsed' };
}

// ---------------------------------------------------------------------------
// Card text (J2)

function lines(text) {
  return String(text).replace(/\r\n?/g, '\n').split('\n');
}

function sectionLines(all, heading) {
  const start = all.findIndex((l) => l.trim() === heading);
  if (start < 0) return null;
  const out = [];
  for (let i = start + 1; i < all.length; i++) {
    if (/^## /.test(all[i])) break;
    out.push(all[i]);
  }
  return out;
}

/**
 * Parse a card's text. Returns { title, options, answerPath, notes }.
 * title: the first line under `## 1. The decision`; options: the backquoted word at the start of
 * each line under `## 4. Options`; answerPath: the first backquoted text on the `answer:` line.
 */
export function parseCard(text) {
  const all = lines(text);
  const notes = [];
  const decision = sectionLines(all, '## 1. The decision');
  const title = decision ? (decision.find((l) => l.trim() !== '') || '').trim() || null : null;
  if (!title) notes.push('no title under "## 1. The decision"');
  const optionLines = sectionLines(all, '## 4. Options');
  const options = [];
  if (optionLines) {
    for (const l of optionLines) {
      const m = /^- `([^`]+)`/.exec(l);
      if (m) options.push({ word: m[1], text: l.replace(/^- /, '') });
    }
  }
  if (options.length === 0) notes.push('no options under "## 4. Options"');
  const answerLine = all.find((l) => /^answer:/.test(l));
  let answerPath = null;
  if (answerLine) {
    const m = /`([^`]+)`/.exec(answerLine);
    if (m) answerPath = m[1];
  }
  if (!answerPath) notes.push('no answer path on the "answer:" line');
  const head = /^# (.+)$/.exec(all[0] || '');
  return { heading: head ? head[1] : null, title, options, answerPath, notes };
}

/** The text of a `## <heading>` section (J2), trimmed, or null when the section is missing. */
export function sectionText(text, heading) {
  const sec = sectionLines(lines(text), heading);
  return sec ? sec.join('\n').trim() : null;
}

/**
 * A hold card's text (AC46; `hold_card`, governance/checks/orchestrator_git.py:1233–1245):
 * { title, tip, state, heldFor, whatToDo, notes }. A line that doesn't match is named in notes;
 * the card is still flagged while open.
 */
export function parseHoldCard(text) {
  const all = lines(text);
  const notes = [];
  const head = /^# (.+)$/.exec(all[0] || '');
  if (!head) notes.push('line 1 is not a "# " title');
  const m = /^tip: ([0-9a-f]{40}) +state: (\S+) +held for: ([0-9]+) minutes$/.exec(all[2] || '');
  if (!m) notes.push('line 3 is not "tip: <sha>   state: <state>   held for: <n> minutes"');
  const whatToDo = sectionText(text, '## 2. What to do');
  if (whatToDo == null) notes.push('no "## 2. What to do" section');
  return { title: head ? head[1].trim() : null, tip: m ? m[1] : null, state: m ? m[2] : null,
    heldFor: m ? Number(m[3]) : null, whatToDo, notes };
}

// The Orchestrator's own pattern for a merge card's tip (orchestrator_git.py:3031, CARD_TIP_RE).
export const MERGE_TIP_RE = /^item: [PQE]-[0-9]+ +tip: ([0-9a-f]{40})\b/m;

/**
 * A merge card's text (AC47; `MergeGate.fail`, orchestrator_git.py:2887–2910):
 * { title, tip, decision, why, whatToDo, notes }. A card whose tip can't be read is named in notes
 * and still flagged.
 */
export function parseMergeCard(text) {
  const all = lines(text);
  const notes = [];
  const head = /^# (.+)$/.exec(all[0] || '');
  const t = MERGE_TIP_RE.exec(lines(text).join('\n'));
  if (!t) notes.push('no "item: <item>   tip: <40-hex sha>" line; its tip is unknown');
  const out = { title: head ? head[1].trim() : null, tip: t ? t[1] : null, notes };
  for (const [k, h] of [['decision', '## The decision'], ['why', '## Why'], ['whatToDo', '## What to do']]) {
    out[k] = sectionText(text, h);
    if (out[k] == null) notes.push(`no "${h}" section`);
  }
  return out;
}

/** status/merges.jsonl (the merge gate's own merges): [{ item, tip }] and notes. */
export function parseMerges(text) {
  const merges = [];
  const notes = [];
  lines(text).forEach((l, i) => {
    if (l.trim() === '') return;
    let v;
    try {
      v = JSON.parse(l);
    } catch {
      notes.push(`${MERGES_PATH} line ${i + 1} is not JSON; skipped`);
      return;
    }
    if (!v || typeof v.item !== 'string' || typeof v.item_tip !== 'string') {
      notes.push(`${MERGES_PATH} line ${i + 1} has no item and item_tip strings; skipped`);
      return;
    }
    merges.push({ item: v.item, tip: v.item_tip });
  });
  return { merges, notes };
}

/** A compare answer's status (J1: ahead, identical, behind or diverged), or null. */
export function compareStatus(raw) {
  if (typeof raw !== 'string') return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v.status === 'string' ? v.status : null;
  } catch {
    return null;
  }
}

/** Line 1 of an answer file: the text after `Decision: `, or null. */
export function parseAnswer(text) {
  const first = lines(text)[0] || '';
  const m = /^Decision: (.+)$/.exec(first);
  return m ? m[1].trim() : null;
}

/** Line 1 of a ruling file: the text after `Ruling: `, or null. */
export function parseRuling(text) {
  const first = lines(text)[0] || '';
  const m = /^Ruling: (.+)$/.exec(first);
  return m ? m[1].trim() : null;
}

// ---------------------------------------------------------------------------
// Owner questions (J2, AC12)

const QUESTION_LABELS = ['WHY', 'OPTIONS', 'RECOMMENDATION', 'RISK CLASS', 'REVERSIBILITY',
  'BLAST RADIUS', 'DEFAULT', 'TIMEOUT'];
const LABEL_ALT = QUESTION_LABELS.map((l) => l.replace(/ /g, '\\s')).join('|');

function labelValue(all, label) {
  const re = new RegExp(`(?:^|\\s)${label.replace(/ /g, '\\s')}:[ \\t]*(.*?)(?=\\s+(?:${LABEL_ALT}):|$)`);
  for (const l of all) {
    const m = re.exec(l);
    if (m) return m[1].trim();
  }
  return null;
}

/**
 * Parse an owner question in the form of questions/_TEMPLATE.md. Missing fields are null; the
 * view shows them as "not given". `name` stands in as the title when line 1 is missing.
 */
export function parseQuestion(text, name) {
  const all = lines(text);
  const head = /^# Ruling needed: (.+)$/.exec(all[0] || '');
  const title = head ? head[1].trim() : name;
  const options = [];
  const start = all.findIndex((l) => /^OPTIONS:/.test(l));
  if (start >= 0) {
    for (let i = start + 1; i < all.length; i++) {
      if (/^[A-Z][A-Z ]*:/.test(all[i])) break;
      const m = /^\s+([A-Z])\. (.+)$/.exec(all[i]);
      if (m) options.push({ letter: m[1], text: m[2].trim() });
    }
  }
  const recText = labelValue(all, 'RECOMMENDATION');
  const recLetter = recText ? (/[A-Z]/.exec(recText) || [null])[0] : null;
  return {
    title,
    titleFromFile: Boolean(head),
    why: labelValue(all, 'WHY'),
    options,
    recommendation: recText,
    recommendationLetter: recLetter,
    riskClass: labelValue(all, 'RISK CLASS'),
    reversibility: labelValue(all, 'REVERSIBILITY'),
    blastRadius: labelValue(all, 'BLAST RADIUS'),
    default: labelValue(all, 'DEFAULT'),
    timeout: labelValue(all, 'TIMEOUT'),
  };
}

/**
 * The DEFAULT label (AC12). It only reports what the file says; nothing adopts a default.
 * raisedAt: Date | null (the oldest commit of the question file).
 */
export function defaultLabel(q, raisedAt, fmt) {
  const rev = (q.reversibility || '').toLowerCase();
  if (rev.startsWith('irreversible')) return 'per the question file: never defaults';
  if (!q.default) return 'not given';
  const letter = (/[A-Z]/.exec(q.default) || [q.default])[0];
  if (!rev.startsWith('reversible')) {
    return `per the question file: DEFAULT ${q.default} (reversibility not given)`;
  }
  const hours = q.timeout && /^[0-9]+(\.[0-9]+)?/.exec(q.timeout.trim());
  if (!hours) return `per the question file: defaults to ${letter} (TIMEOUT not given)`;
  if (!raisedAt) {
    return `per the question file: defaults to ${letter} at its raised time + ${hours[0]} hours (raised time not recorded)`;
  }
  const at = new Date(raisedAt.getTime() + Number(hours[0]) * 3600e3);
  return `per the question file: defaults to ${letter} at ${fmt ? fmt(at) : at.toISOString()}`;
}

// ---------------------------------------------------------------------------
// Commit history pages (J1 history request; J2 raised and answered times)

/**
 * From the raw history pages [page1, lastPage?], the oldest and newest commit times, or nulls.
 * Oldest: the last entry of the last page (or of page 1 when there is no last page).
 */
export function parseHistory(pages) {
  const parse = (raw) => {
    if (raw == null) return null;
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : null;
    } catch {
      return null;
    }
  };
  const p1 = parse(pages && pages[0]);
  if (!p1) return { oldest: null, newest: null, ok: false };
  const last = pages.length > 1 ? parse(pages[1]) : null;
  const dateOf = (c) => {
    const d = c && c.commit && c.commit.committer && c.commit.committer.date;
    return d ? new Date(d) : null;
  };
  const tail = last && last.length ? last : p1;
  return {
    ok: true,
    newest: p1.length ? dateOf(p1[0]) : null,
    oldest: tail.length ? dateOf(tail[tail.length - 1]) : null,
  };
}

// ---------------------------------------------------------------------------
// v3 status files (J9)

export const STAGE_NAMES = { 2: 'Shape', 3: 'Define', 4: 'Lock the checks', 5: 'Produce', 6: 'Launch', 8: 'Evidence' };
export const STATES = ['ready', 'dispatched', 'returned', 'waiting-owner', 'done', 'closed'];

export function stageName(n) {
  if (n == null) return 'not recorded';
  return STAGE_NAMES[n] ? `${n} ${STAGE_NAMES[n]}` : `stage ${n}`;
}

// J9's field types (AC31): a value of the wrong type is named in notes (file, line, field) and
// skipped, so the field shows "not recorded", never a wrong value or zero. Unknown keys are ignored.
const ISO_UTC_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?Z$/;
export const STATUS_TYPES = {
  stage: 'integer', card: 'integer', plan_round: 'integer', build_round: 'integer', attempts: 'integer',
  sessions: 'integer', confirm_used: 'boolean', kind: 'string', role: 'string', last_verdict: 'string',
  gate: 'string', spec: 'string', outcome: 'string', dispatched_at: 'time', state: 'state',
};

/** Whether `v` has J9's type `type` (null allowed only where `nullable`). */
export function hasType(v, type, nullable = false) {
  if (v === null) return nullable;
  switch (type) {
    case 'integer': return Number.isInteger(v);
    case 'boolean': return typeof v === 'boolean';
    case 'string': return typeof v === 'string';
    case 'time': return typeof v === 'string' && ISO_UTC_RE.test(v) && !Number.isNaN(Date.parse(v));
    case 'state': return typeof v === 'string' && STATES.includes(v);
    default: return true;
  }
}

const TYPE_WORDS = { integer: 'an integer', boolean: 'true or false', string: 'a string', time: 'an ISO UTC time',
  state: `one of ${STATES.join(', ')}` };

/** Parse a status file: `key = <JSON value>` lines. Returns { fields, notes, ok }. */
export function parseStatus(text, path = 'status file') {
  const fields = {};
  const notes = [];
  lines(text).forEach((l, i) => {
    if (l.trim() === '' || l.startsWith('#')) return;
    const m = /^([a-z_]+) = (.+)$/.exec(l);
    if (!m) {
      notes.push(`${path} line ${i + 1} skipped: ${l.slice(0, 80)}`);
      return;
    }
    let v;
    try {
      v = JSON.parse(m[2]);
    } catch {
      notes.push(`${path} line ${i + 1} skipped (value is not JSON): ${l.slice(0, 80)}`);
      return;
    }
    const type = STATUS_TYPES[m[1]];
    if (type && !hasType(v, type)) {
      notes.push(`${path} line ${i + 1} field ${m[1]}: expected ${TYPE_WORDS[type]}; skipped`);
      return;
    }
    fields[m[1]] = v;
  });
  const ok = typeof fields.state === 'string' && STATES.includes(fields.state);
  if (!ok) notes.push(`${path}: no valid state`);
  return { fields, notes, ok };
}

/** ROUTING.toml's [limits] and [time_limits] as integer maps (J9). */
export function parseRouting(text) {
  const tables = {};
  let current = null;
  for (const raw of lines(text)) {
    const l = raw.replace(/#.*$/, '').trim();
    if (l === '') continue;
    const t = /^\[([a-z_]+)\]$/.exec(l);
    if (t) {
      current = t[1];
      continue;
    }
    if (/^\[\[/.test(l)) {
      current = null;
      continue;
    }
    if (current !== 'limits' && current !== 'time_limits') continue;
    const m = /^([A-Za-z0-9_-]+)\s*=\s*(-?[0-9]+)$/.exec(l);
    if (m) (tables[current] ||= {})[m[1]] = Number(m[2]);
  }
  return { limits: tables.limits || {}, timeLimits: tables.time_limits || {} };
}

/** A role's limit in minutes, plus the stall grace (J9). Falls back to 30 and 15. */
export function timeLimitMinutes(routing, role) {
  const notes = [];
  let limit = 30;
  let grace = 15;
  if (!routing) {
    notes.push('ROUTING.toml not read; using 30 + 15 minutes');
  } else {
    const t = routing.timeLimits;
    if (t && Number.isInteger(t[role])) limit = t[role];
    else if (t && Number.isInteger(t.default)) limit = t.default;
    else notes.push('no time limit in ROUTING.toml; using 30 minutes');
    if (routing.limits && Number.isInteger(routing.limits.stall_grace_minutes)) {
      grace = routing.limits.stall_grace_minutes;
    } else notes.push('no stall_grace_minutes in ROUTING.toml; using 15');
  }
  return { minutes: limit + grace, notes };
}

// ---------------------------------------------------------------------------
// Dispatch log (J9)

/** The shape of one dispatch-log entry, or null when it matches none. */
export function entryShape(e) {
  if (!e || typeof e !== 'object' || Array.isArray(e)) return null;
  if (e.trigger === 'request') return 'request';
  if (e.action === 'dispatch') return 'dispatch';
  if (e.action === 'card') return 'card';
  if (e.action === 'done') return 'done';
  if (e.trigger === 'outcome') return 'outcome';
  if (e.trigger === 'decision') return 'decision';
  if (e.trigger === 'anomaly' && e.error != null) return 'anomaly';
  return null;
}

// J9's key types for dispatch-log and outcomes.jsonl lines (AC31). Strings may be null where the
// samples show null; `time` never is.
export const LOG_TYPES = {
  item: 'string', role: 'string', route: 'string', time: 'string', session: 'string', result: 'string',
  verdict: 'string', record: 'string', gate: 'string', word: 'string', error: 'string', stage: 'integer',
  card: 'integer', proxy: 'boolean', strike: 'boolean',
};
// The keys each shape needs: a wrong-typed one skips the whole line.
const NEEDED = {
  request: ['item', 'time'], dispatch: ['item', 'role', 'route', 'time'], outcome: ['session', 'time'],
  card: ['item', 'gate', 'card', 'time'], decision: ['record', 'time'], done: ['item', 'time'], anomaly: ['time'],
};

/**
 * Check one log line's keys against LOG_TYPES. A wrong-typed key the shape needs (or `time`, which
 * may never be null) skips the line: returns { skip: note }. Any other wrong-typed key is dropped and
 * named: returns { entry, notes }.
 */
export function typeCheckEntry(e, shape, where) {
  const notes = [];
  const entry = { ...e };
  for (const [k, type] of Object.entries(LOG_TYPES)) {
    if (!(k in entry)) continue;
    const nullable = k !== 'time';
    if (hasType(entry[k], type, nullable) && !(entry[k] === null && (NEEDED[shape] || []).includes(k))) continue;
    if ((NEEDED[shape] || []).includes(k)) return { skip: `${where} field ${k}: expected ${TYPE_WORDS[type]}; line skipped` };
    notes.push(`${where} field ${k}: expected ${TYPE_WORDS[type]}; field skipped`);
    delete entry[k];
  }
  for (const k of NEEDED[shape] || []) {
    if (!(k in entry)) return { skip: `${where} has no ${k}; line skipped` };
  }
  return { entry, notes };
}

/** Parse a dispatch-log month. Returns { entries: [{...e, shape, line}], notes }. */
export function parseLog(text, label = 'dispatch log') {
  const entries = [];
  const notes = [];
  lines(text).forEach((l, i) => {
    if (l.trim() === '') return;
    let e;
    try {
      e = JSON.parse(l);
    } catch {
      notes.push(`${label} line ${i + 1} is not JSON; skipped`);
      return;
    }
    const shape = entryShape(e);
    if (!shape) {
      notes.push(`${label} line ${i + 1} matches no known shape; skipped`);
      return;
    }
    const checked = typeCheckEntry(e, shape, `${label} line ${i + 1}`);
    if (checked.skip) {
      notes.push(checked.skip);
      return;
    }
    notes.push(...checked.notes);
    entries.push({ ...checked.entry, shape, line: i + 1, label });
  });
  return { entries, notes };
}

/** The words for one log entry (J9's headline forms). `t` is the formatted time. */
export function entryWords(e, t) {
  const stage = e.stage != null ? stageName(e.stage).replace(/^[0-9]+ /, '') : 'stage not recorded';
  switch (e.shape) {
    case 'request':
      return `${e.item} created, ${t}`;
    case 'dispatch':
      return `${e.item}: ${e.role} started (${stage}), ${t}`;
    case 'outcome':
      if (e.verdict != null && e.verdict !== 'none') {
        return `${e.item}: ${e.role} finished — ${e.result}, verdict ${e.verdict}, ${t}`;
      }
      return `${e.item}: ${e.role} finished — ${e.result}, ${t}`;
    case 'card':
      return `${e.item}: waiting on you — card ${e.gate}-${e.card}, ${t}`;
    case 'decision': {
      const proxy = e.proxy === true ? ' (proxy)' : '';
      if (typeof e.result === 'string' && e.result.startsWith('closed/')) {
        return `${e.item} closed: ${e.word} (card ${e.gate}-${e.card}), ${t}${proxy}`;
      }
      return `${e.item}: you answered ${e.gate}-${e.card} with ${e.word}, ${t}${proxy}`;
    }
    case 'done':
      return `${e.item} done, ${t}`;
    case 'anomaly':
      return `${e.item}: Orchestrator anomaly, ${t}`;
    default:
      return null;
  }
}

/**
 * Mark retries: a dispatch of the same item and role right after an outcome of that item with
 * result `error` (J9). Mutates and returns entries (each gets `retry: true|undefined`).
 */
export function markRetries(entries) {
  const lastOutcome = new Map();
  for (const e of entries) {
    if (e.shape === 'outcome') lastOutcome.set(e.item, e);
    if (e.shape === 'dispatch') {
      const o = lastOutcome.get(e.item);
      if (o && o.result === 'error' && o.role === e.role) e.retry = true;
      lastOutcome.delete(e.item);
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Session usage (J10, AC23): status/outcomes.jsonl

// J10's proposed `usage` form (to D7.1). EXP-003 found each figure in the session runner's
// stream-json output; the record names below are J10's, not the tool's (see the EXP-003 result).
export const USAGE_KEYS = ['input_tokens', 'output_tokens', 'cache_read_tokens', 'cache_write_tokens', 'turns',
  'context_peak_tokens', 'context_window_tokens'];
export const NOT_AVAILABLE = 'not available';

/**
 * Parse status/outcomes.jsonl: one line per session. Returns { bySession: { session → { item,
 * role, result, verdict, usage } }, notes } (a plain object, so the page can keep it in storage). `usage` is null for a line without one ("not
 * recorded"); otherwise each J10 key maps to an integer, NOT_AVAILABLE (null, or not reported), or
 * 'not recorded' (a value of the wrong type, named in notes). A line whose `session` isn't a
 * string is named and skipped (AC31).
 */
export function parseOutcomes(text) {
  const bySession = {};
  const notes = [];
  lines(text).forEach((l, i) => {
    if (l.trim() === '') return;
    const where = `${OUTCOMES_PATH} line ${i + 1}`;
    let v;
    try {
      v = JSON.parse(l);
    } catch {
      notes.push(`${where} is not JSON; skipped`);
      return;
    }
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
      notes.push(`${where} is not an object; skipped`);
      return;
    }
    if (typeof v.session !== 'string' || v.session === '__proto__') {
      notes.push(`${where} field session: expected a string; line skipped`);
      return;
    }
    const row = { session: v.session };
    for (const k of ['item', 'role', 'result', 'verdict', 'record']) {
      if (v[k] == null) continue;
      if (typeof v[k] === 'string') row[k] = v[k];
      else notes.push(`${where} field ${k}: expected a string; field skipped`);
    }
    let usage = null;
    if ('usage' in v && v.usage !== null) {
      if (typeof v.usage !== 'object' || Array.isArray(v.usage)) {
        notes.push(`${where} field usage: expected an object; shown as not recorded`);
      } else {
        usage = {};
        for (const k of USAGE_KEYS) {
          const x = v.usage[k];
          if (x === undefined || x === null) usage[k] = NOT_AVAILABLE;
          else if (Number.isInteger(x) && x >= 0) usage[k] = x;
          else {
            usage[k] = 'not recorded';
            notes.push(`${where} field usage.${k}: expected a whole number; shown as not recorded`);
          }
        }
      }
    }
    row.usage = usage;
    bySession[v.session] = row;
  });
  return { bySession, notes };
}

// ---------------------------------------------------------------------------
// v2.5 reduced view (J9)

/** A sprint file: { title, open }. */
export function parseSprint(text) {
  const all = lines(text);
  const titleLine = all.find((l) => /^# /.test(l));
  const statusLine = all.find((l) => /^status:/.test(l));
  return {
    title: titleLine ? titleLine.slice(2).trim() : null,
    open: Boolean(statusLine && /^status:\s*open\s*$/.test(statusLine)),
  };
}

/** The ledger's last entry: { id, title, next, date } (each null when missing). */
export function parseLedger(text) {
  const all = lines(text);
  let idx = -1;
  let m = null;
  for (let i = all.length - 1; i >= 0; i--) {
    const mm = /^## (L-[0-9]+) — (.+)$/.exec(all[i]);
    if (mm) {
      idx = i;
      m = mm;
      break;
    }
  }
  if (idx < 0) return { id: null, title: null, next: null, date: null };
  let next = null;
  let date = null;
  for (let i = idx + 1; i < all.length && !/^## /.test(all[i]); i++) {
    const n = /^licenses_next:\s*(.*)$/.exec(all[i]);
    if (n && next === null) next = n[1].trim();
    const d = /^date:\s*(.*)$/.exec(all[i]);
    if (d && date === null) date = d[1].trim();
  }
  return { id: m[1], title: m[2].trim(), next, date };
}

// ---------------------------------------------------------------------------
// Pull requests (J2, AC2)

/** Parse raw PR pages into the fields the desk reads. Bad pages are reported, not thrown. */
export function parsePulls(pages) {
  const pulls = [];
  const notes = [];
  (pages || []).forEach((raw, i) => {
    if (raw == null) return;
    let arr;
    try {
      arr = JSON.parse(raw);
    } catch {
      notes.push(`PR page ${i + 1} is not JSON`);
      return;
    }
    if (!Array.isArray(arr)) {
      notes.push(`PR page ${i + 1} is not a list`);
      return;
    }
    for (const p of arr) {
      pulls.push({
        number: p.number,
        title: p.title,
        url: p.html_url,
        draft: p.draft === true,
        base: p.base && p.base.ref,
        head: p.head && p.head.ref,
        // The head's repository (null for a fork that was deleted). It comes in the same list
        // response J1 already reads, so it costs no request.
        headRepo: (p.head && p.head.repo && typeof p.head.repo.full_name === 'string') ? p.head.repo.full_name : null,
        login: p.user && p.user.login,
        createdAt: p.created_at,
      });
    }
  });
  return { pulls, notes };
}

export const ITEM_BRANCH_RE = /^item\/[A-Za-z0-9._-]+$/;

/**
 * Whether a PR needs the owner (Terms, AC2): open (the list holds only open PRs), not a draft,
 * based on the default branch, and not an Orchestrator item branch in a v3 project. An item
 * branch is `item/<id>` (one segment of letters, digits, `.`, `_`, `-`) whose head repository is
 * the project's own: a fork's PR from a branch of that name is flagged like any other (review N7).
 * Returns { flagged: boolean, why: string }.
 */
export function classifyPull(pr, project) {
  if (pr.draft) return { flagged: false, why: 'draft' };
  if (pr.base !== project.defaultBranch) return { flagged: false, why: `into ${pr.base}` };
  if (project.model === 'v3' && typeof pr.head === 'string' && ITEM_BRANCH_RE.test(pr.head)
    && typeof pr.headRepo === 'string' && pr.headRepo.toLowerCase() === String(project.repo).toLowerCase()) {
    return { flagged: false, why: 'item branch (the Orchestrator merges it)' };
  }
  return { flagged: true, why: 'waiting on your review or merge' };
}

// ---------------------------------------------------------------------------
// CI (J1's reduction rule, from workflow runs: AC29)

const FAILING = new Set(['failure', 'timed_out', 'action_required', 'startup_failure']);
const NOT_FAILING = new Set(['success', 'neutral', 'skipped', 'cancelled', 'stale']);

/** Reduce runs ({ status, conclusion }) to failing | running | passing | none (J1). */
export function reduceChecks(runs) {
  if (runs.some((r) => r.status === 'completed' && FAILING.has(r.conclusion))) return 'failing';
  if (runs.some((r) => r.status !== 'completed')) return 'running';
  if (runs.some((r) => r.conclusion === 'success') && runs.every((r) => NOT_FAILING.has(r.conclusion))) {
    return 'passing';
  }
  return 'none';
}

/** The workflows whose runs are activity, never CI (J1): deploys wait for approval; the
 * Orchestrator's own runs are cancelled and skipped by design. Paths a project lacks never match. */
export const DEPLOY_WORKFLOW = '.github/workflows/desk-deploy.yml';
export const ORCHESTRATOR_WORKFLOW = '.github/workflows/orchestrator.yml';
export const GOVERNANCE_WORKFLOW = '.github/workflows/governance.yml';
export const ACTIVITY_WORKFLOWS = [DEPLOY_WORKFLOW, ORCHESTRATOR_WORKFLOW];

/**
 * Parse raw workflow-run pages (J1's 3a and 3b, in J6's `checks`) into runs:
 * [{ path, name, event, status, conclusion, runNumber, headSha, url }]. A page that isn't a run
 * list, and a run without a `path` or a whole-number `run_number`, are named in notes and skipped.
 */
export function parseWorkflowRuns(pages) {
  const runs = [];
  const notes = [];
  (pages || []).forEach((raw, i) => {
    if (raw == null) return;
    let v;
    try {
      v = JSON.parse(raw);
    } catch {
      notes.push(`workflow-run page ${i + 1} is not JSON`);
      return;
    }
    if (!v || !Array.isArray(v.workflow_runs)) {
      notes.push(`workflow-run page ${i + 1} has no workflow_runs list`);
      return;
    }
    for (const r of v.workflow_runs) {
      if (!r || typeof r.path !== 'string' || !Number.isInteger(r.run_number)) {
        notes.push(`workflow-run page ${i + 1}: a run without a path or run_number; skipped`);
        continue;
      }
      runs.push({ path: r.path.replace(/@.*$/, ''), name: typeof r.name === 'string' ? r.name : r.path,
        event: r.event, status: r.status, conclusion: r.conclusion, runNumber: r.run_number,
        headSha: typeof r.head_sha === 'string' ? r.head_sha : null, url: typeof r.html_url === 'string' ? r.html_url : null });
    }
  });
  return { runs, notes };
}

/** Latest run per workflow (J1): grouped by `path`, the greatest `run_number` in each. */
export function latestPerWorkflow(runs) {
  const by = new Map();
  for (const r of runs) {
    const cur = by.get(r.path);
    if (!cur || r.runNumber > cur.runNumber) by.set(r.path, r);
  }
  return by;
}

/** A run's words: its conclusion when completed, else its status. */
function runWord(r) {
  return r.status === 'completed' ? (r.conclusion || 'no conclusion') : (r.status || 'status not recorded');
}

/** The words for desk-deploy's latest run (J1): "deploy <short sha>: <what happened>". */
export function deployWords(r) {
  const sha = r.headSha ? r.headSha.slice(0, 7) : 'sha not recorded';
  let what;
  if (r.status === 'waiting') what = 'waiting for approval';
  else if (r.status !== 'completed') what = r.status || 'status not recorded';
  else if (r.conclusion === 'success') what = 'deployed';
  // A run whose deploy the owner rejected and one whose job failed both conclude `failure` as far
  // as the run list shows (C: J1 says the first rejected deploy shows how GitHub concludes it).
  else if (r.conclusion === 'failure') what = 'failed or rejected';
  else what = r.conclusion || 'no conclusion';
  return `deploy ${sha}: ${what}`;
}

/**
 * J1's CI result for a head from its workflow runs (3a and 3b together): the latest run per
 * workflow; desk-deploy and the Orchestrator are activity; the rest reduce to failing | running |
 * passing | none. Returns { ci, activity: [text], governance: run|null, latest: Map }.
 */
export function reduceWorkflowRuns(runs) {
  const latest = latestPerWorkflow(runs);
  const activity = [];
  const counted = [];
  for (const [path, r] of latest) {
    if (path === DEPLOY_WORKFLOW) activity.push({ text: deployWords(r), url: r.url });
    else if (path === ORCHESTRATOR_WORKFLOW) activity.push({ text: `Orchestrator run: ${runWord(r)}`, url: r.url });
    else counted.push(r);
  }
  return { ci: reduceChecks(counted), activity, governance: latest.get(GOVERNANCE_WORKFLOW) || null, latest };
}

// ---------------------------------------------------------------------------
// Tree (J1, J6)

/** Parse a raw tree: { blobs: Map(path → {sha, size}), truncated, ok }. */
export function parseTree(raw) {
  let v;
  try {
    v = JSON.parse(raw);
  } catch {
    return { ok: false, blobs: new Map(), truncated: false };
  }
  const blobs = new Map();
  for (const e of v.tree || []) {
    if (e.type === 'blob') blobs.set(e.path, { sha: e.sha, size: e.size });
  }
  return { ok: true, blobs, truncated: v.truncated === true };
}
