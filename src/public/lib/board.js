// The board (spec S-001, AC80; desk mockup v2, frames 1, 2 and 12; J22), the trial view's Waiting
// tab. Pure: from each project's read model, its records as last read, J22's reads and this device's
// marks, what the board shows: three lanes, "Waiting on you", "Kicked back" and "Done · last 24 h",
// each project's cards together under its name, the quiet lines above them, and every count less the
// cards marked done here. No network, no DOM; the page (public/sandbox.js) draws it and keeps the
// marks in local storage (`desk-board-marks-v1`), every read and write wrapped as J5's are.
//
// Marks never change what needs the owner, "Quiet" or what is notified (Terms, "Board"): they live
// on this device only, and only the board's own counts leave a marked card out.

import { flaggedWait, waitKey } from './waiting.js';
import { GATE_PHASE, GATE_WORDS } from './j11.js';
import { ruleZero, prStep, judgeFiles, listAt, verdictPath, OWNER, STEP2_NOTE, WHY, ownerCheckAt } from './j22.js';
import { durationText, hhmm, dayKey } from './timefmt.js';
import { composeAnswer, questionQuestions, boxPlan, VERDICT_START, GATE_STANDARD_WORDS, ownerActions, treeLink } from './sandbox.js';
import { milestoneValue, firstMilestoneLine } from './records.js';
import { canRecord } from './model.js';
import { gateWords, caseWord, defaultLetter } from './sheets.js';

export const KICK_BACK_MINUTES = 5; // P-001-board-bounce.md: "after about 5 minutes" (C, a setting to tune)
export const DONE_KEEP_HOURS = 24; // P-001-board-done-keep.md, B
export const MARKS_KEY = 'desk-board-marks-v1';
export const DONE_GROUP_ROWS = 3; // each project's Done group shows its newest three rows, the rest behind "<n> more ›"
export const HOLD_MS = 350; // version 5's press and hold, kept (mockup v2 draws no drag)
export const MOUSE_DRAG_PX = 6;
export const FINGER_SLOP_PX = 8;
export const LANE_MARGIN_PX = 8;

export const LANES = [
  { key: 'wait', title: 'Waiting on you' },
  { key: 'kick', title: 'Kicked back' },
  { key: 'done', title: 'Done · last 24 h' },
];
export const WORDS = Object.freeze({
  empty: 'Nothing here',
  emptyDone: 'Hold a card and drag it here',
  device: 'Your Done marks are kept on this device; other devices show them once GitHub confirms.',
  notKept: 'Done marks not kept on this device',
  confirming: 'Confirming with GitHub',
  quietConfirming: 'Nothing waiting on you · confirming with GitHub',
  agents: 'With the agents',
  recording: 'Being recorded by the automatic job',
  asking: 'Being asked in your session',
  answerRecording: 'Your answer is being recorded',
  nothing: 'Nothing waiting',
  cantCheck: "GitHub couldn't be checked yet",
});

/** The board's age form: "35 m", "2 h 53 m" (frame 1). */
export const boardAge = (ms) => durationText(Math.max(0, ms)).replace(/ min\b/, ' m');
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** "Wed 13:37" in the owner's time zone (frame 1's settle line). */
export function weekdayTime(ms, tz) {
  const d = new Date(ms);
  let wd = null;
  try {
    wd = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(d);
  } catch {
    wd = WEEKDAYS[d.getUTCDay()];
  }
  return `${wd} ${hhmm(d, tz)}`;
}
/** A Done row's time: "<HH:MM>" today, "yesterday, <HH:MM>" before today, in ownerTimeZone. */
export function doneTime(ms, nowMs, tz) {
  const today = dayKey(new Date(nowMs), tz);
  return dayKey(new Date(ms), tz) === today ? hhmm(new Date(ms), tz) : `yesterday, ${hhmm(new Date(ms), tz)}`;
}

const t = (v) => (v == null ? null : typeof v === 'number' ? v : v instanceof Date ? v.getTime() : Date.parse(v));
const KIND_WORDS = { pr: 'Pull request', question: 'Question', card: 'Decision', missing: 'Decision', gate: 'Gate', deploy: 'Deploy', hold: 'Hold', merge: 'Merge card' };
const cap = (s) => String(s).replace(/^./, (c) => c.toUpperCase());

// ---------------------------------------------------------------------------
// One project's cards

/**
 * A question's lock or clock line on its card (AC85): "Can't be undone" or "Settles as <letter> ·
 * <when>". From stage 4 the clock shows only where the sheet says it settles itself (sheets.js's
 * undoLine): reversible, a DEFAULT naming a letter, and a TIMEOUT in hours; a file whose DEFAULT or
 * TIMEOUT is "none" or missing settles nothing, so its card says nothing of it (AC12: the desk must
 * not imply a default). With no raised time, "Settles as <letter>".
 */
export function questionMark(q, raisedAt, tz) {
  if (!q) return null;
  const rev = String(q.reversibility || '').toLowerCase();
  if (rev.startsWith('irreversible')) return { icon: 'lock', words: "Can't be undone" };
  const letter = defaultLetter(q);
  const hours = q.timeout && /^[0-9]+(\.[0-9]+)?/.exec(String(q.timeout).trim());
  if (!rev.startsWith('reversible') || !letter || !hours) return null;
  if (raisedAt == null) return { icon: 'clock', words: `Settles as ${letter}` };
  return { icon: 'clock', words: `Settles as ${letter} · ${weekdayTime(raisedAt + Number(hours[0]) * 3600e3, tz)}` };
}

/**
 * The filled-in answer file a board button opens (AC80, AC53): form 'lettered' (one per letter),
 * 'card' (one per option word), 'numbered' or 'fallback' (one button, `Ruling: ` to complete), with
 * the owner's words from the sheet's box where AC53 places them. Returns { text, path, form }.
 */
export function answerText(f, choice, words = '') {
  if (f.kind === 'card') {
    const gateCard = GATE_WORDS.includes(f.card.gate);
    return { form: 'card', path: f.card.answerPath, text: composeAnswer({ kind: 'card', gateCard }, { 1: { choice, words } }).text };
  }
  const q = f.question;
  const p = q.parsed;
  const qs = p ? questionQuestions(p.text, p.title) : null;
  const milestone = p ? firstMilestoneLine(p.text) : null;
  const ctx = { kind: 'question', name: q.name, qs: qs || { form: 'fallback', title: q.title, block: [], questions: [] }, milestone };
  const answers = ctx.qs.form === 'numbered' ? Object.fromEntries(ctx.qs.questions.map((x) => [x.n, { words: (words && words[x.n]) || '' }]))
    : { 1: { choice: choice || '', words: typeof words === 'string' ? words : '' } };
  return { form: ctx.qs.form, path: `decisions/questions/${q.name}.md`, text: composeAnswer(ctx, answers).text };
}

/**
 * The buttons a question's or a card's sheet (and a gate card) offers: one per option (AC80). For a
 * gate card, `opts.caseRec` (its case as J11 read it) names the recommended word: the case's own
 * recommendation from stage 4 (AC85), else the card's (AC52).
 */
export function answerButtons(project, f, linkCap, words = '', opts = {}) {
  const plan = (text, path, form) => boxPlan(project, linkCap, { form: form === 'card' ? 'card' : 'question', path }, text);
  if (f.kind === 'card') {
    const c = f.card;
    const gate = GATE_WORDS.includes(c.gate);
    const listed = c.parsed ? c.parsed.options.map((o) => o.word) : [];
    const recWord = (gate ? caseWord(opts.caseRec) : null) || recommendedWord(c);
    const wordsList = gate ? [...GATE_STANDARD_WORDS, ...listed.filter((w) => !GATE_STANDARD_WORDS.includes(w))] : listed;
    return wordsList.map((w) => {
      const a = answerText(f, w, words);
      const p = plan(a.text, a.path, 'card');
      return { value: w, label: gate ? cap(w) : `Answer: ${w} ↗`, gate, text: a.text, path: a.path, plan: p, href: p.url, recommended: recWord === w };
    });
  }
  const q = f.question;
  if (project.model !== 'v3') {
    // AC19's route, as today (AC53): a v2.5 project's ruling is text to copy into the owner's session.
    return [{ value: null, label: 'Answer', v25: true }];
  }
  const p = q.parsed;
  const qs = p ? questionQuestions(p.text, p.title) : null;
  if (qs && qs.form === 'lettered') {
    const rec = qs.recLetter;
    return qs.questions[0].choices.map((c) => {
      const a = answerText(f, c.value, words);
      const pl = plan(a.text, a.path, 'question');
      return { value: c.value, label: `Answer ${c.value} ↗`, words: c.text, text: a.text, path: a.path, plan: pl, href: pl.url, recommended: rec === c.value };
    });
  }
  const a = answerText(f, '', words);
  const pl = plan(a.text, a.path, 'question');
  return [{ value: null, label: 'Answer ↗', text: a.text, path: a.path, plan: pl, href: pl.url, recommended: false, form: qs ? qs.form : 'fallback' }];
}

/**
 * The word a card's `## 5.` recommendation names, when it names one of its words. On a gate card the
 * section's quoted views, "The Critic: …" and the user representative's line (model S-024, S-025), are
 * theirs, not the recommendation (AC85: "Recommended" on the case's recommendation), so they are passed over.
 */
function recommendedWord(c) {
  const text = c.parsed && c.parsed.text ? String(c.parsed.text) : '';
  const m = /^## 5\.[^\n]*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(text);
  if (!m) return null;
  const words = c.parsed.options.map((o) => o.word);
  const gate = GATE_WORDS.includes(c.gate) ? GATE_STANDARD_WORDS : [];
  const all = [...new Set([...words, ...gate])];
  const body = gate.length ? m[1].split('\n').filter((l) => !/^\s*The (Critic|user representative)\b/.test(l)).join('\n') : m[1];
  const first = body.split('\n').find((l) => l.trim()) || '';
  const hit = all.find((w) => new RegExp(`\`${w}\``).test(body)) || all.find((w) => new RegExp(`\\b${w}\\b`, 'i').test(first));
  return hit || null;
}

/** A pull request card's step and its button (J22, AC80's step table). */
function prStepView(project, pr, s, linkCap) {
  const verdictTarget = { form: 'verdict', path: verdictPath(pr.number, OWNER), branch: pr.head || null, fork: !(typeof pr.headRepo === 'string' && pr.headRepo.toLowerCase() === String(project.repo).toLowerCase()) };
  const verdictPlan = boxPlan(project, linkCap, verdictTarget, VERDICT_START);
  if (s.step === 'merge') {
    return { id: 'merge', label: 'Merge ↗', sheetLabel: s.twoStep === 2 ? 'Step 2 of 2: merge' : 'Merge on GitHub', href: pr.url, twoStep: s.twoStep };
  }
  if (s.step === 'verdict') {
    return { id: 'verdict', label: 'Verdict ↗', sheetLabel: 'Step 1 of 2: add your verdict', href: verdictPlan.url, plan: verdictPlan, twoStep: 1 };
  }
  return { id: 'open', label: 'Open ↗', sheetLabel: 'Open on GitHub', href: pr.url, twoStep: 0,
    verdict: s.verdictLink ? { label: 'Add your verdict ↗', href: verdictPlan.url, plan: verdictPlan } : null };
}

/** The governance run that is not green (AC46): the latest on the head, else the workflow's page. */
function holdLink(snap, f, parseRuns) {
  const runs = snap && snap.checkPages && parseRuns ? parseRuns(snap.checkPages).runs.filter((r) => r.path === '.github/workflows/governance.yml') : [];
  const latest = runs.reduce((a, b) => (!a || b.runNumber > a.runNumber ? b : a), null);
  return latest && latest.url ? latest.url : f.hold.actionsLink;
}

/**
 * One project's cards (AC80): every item that needs the owner (the model's `flagged`, as AC52's
 * rows), each with its kind, title, meta, marks and its one step; the pull requests J22's rule 0
 * finds with the agents set apart, never a card. input: { project, model, snap, j22 (desk.j22's
 * ctx), rows (AC52's rows, queueView's), last: Map(number → J22's keep), nowMs, tz, linkCap,
 * parseRuns }. Returns { cards, agents, keep }.
 */
export function projectCards(input) {
  const { project, model, snap, j22, rows, nowMs, tz, linkCap } = input;
  const last = input.last || new Map();
  const cards = [];
  const agents = [];
  const keep = new Map();
  const tree = (snap && snap.tree) || new Map();
  for (const row of rows || []) {
    const f = row.flag;
    const w = flaggedWait(project.name, f);
    const id = w ? w.key : `${project.name}|${f.key}`;
    const raisedAt = row.raisedAt != null ? row.raisedAt : null;
    const base = { id, key: f.key, project: project.name, title: '', raisedAt, flag: f, mark: null, why: null, note: null,
      meta: [], buttons: [], critic: null, userRep: null };
    if (f.kind === 'pr') {
      const pr = f.pr;
      const r0 = j22 ? ruleZero(pr, j22) : { withAgents: false, waits: [] };
      if (r0.withAgents) {
        agents.push({ id, project: project.name, number: pr.number, title: pr.title, link: pr.url, waits: r0.waits, headSha: pr.headSha, flag: f });
        continue;
      }
      const s = j22 ? prStep(pr, j22, last.get(pr.number) || null) : { step: 'open', why: WHY.notKnown, twoStep: 0, keep: null };
      if (s.keep) keep.set(pr.number, s.keep);
      const a = j22 ? judgeFiles(pr, j22) : { state: 'unknown' };
      const cls = a.state === 'known' ? a.cls : s.keep && s.keep.a && s.keep.a.state === 'known' ? s.keep.a.cls : null;
      const step = prStepView(project, pr, s, linkCap);
      const oc = j22 ? ownerCheckAt(pr, j22) : { read: false };
      cards.push({ ...base, kind: 'pr', kindWord: KIND_WORDS.pr, title: pr.title, number: pr.number, headSha: pr.headSha, headRef: pr.head,
        meta: [`#${pr.number}`, cls].filter(Boolean), why: s.why, note: s.note || null, step, buttons: [step],
        check: oc.read ? oc.description : null, reading: s.reading === true, changes: s.changes === true,
        judge: s, link: pr.url });
      continue;
    }
    if (f.kind === 'question') {
      const q = f.question;
      const p = q.parsed;
      const ms = p ? milestoneValue(firstMilestoneLine(p.text)) : null;
      const step = { id: 'answer', label: 'Answer', sheetLabel: null, href: null, opensSheet: true };
      cards.push({ ...base, kind: 'question', kindWord: KIND_WORDS.question, title: q.title, name: q.name,
        meta: [ms && ms.ids && ms.ids.length ? ms.ids.join(', ') : null].filter(Boolean),
        mark: questionMark(p, raisedAt, tz), step, buttons: [step], v25: project.model !== 'v3' });
      continue;
    }
    if (f.kind === 'card') {
      const c = f.card;
      const gate = GATE_WORDS.includes(c.gate);
      const title = c.parsed && c.parsed.title ? c.parsed.title : `card ${c.gate}-${c.n}`;
      if (gate) {
        const phase = GATE_PHASE[c.gate];
        const casePath = `docs/gates/${c.item}/${phase}-gate-${c.n}-case.md`;
        const criticPath = `reviews/${c.item}/_${phase}-gate-${c.n}-critic.md`;
        const doc = input.projectDoc || null;
        const caseRec = snap && snap.records ? snap.records.get(casePath) || null : null;
        const buttons = answerButtons(project, f, linkCap, '', { caseRec });
        // AC85 ("On the board"): "Critic: <its word>" and "User rep: <its word>", each from its record.
        const gw = gateWords(c.parsed ? c.parsed.text : '', { criticInTree: tree.has(criticPath), ownerIsUser: doc ? doc.ownerIsUser === true : null });
        cards.push({ ...base, kind: 'gate', kindWord: `Gate · ${cap(phase)}`, title, meta: [c.item],
          critic: gw.critic, userRep: gw.user, casePath, criticPath, caseRec, step: { id: 'answer', gate: true }, buttons });
        continue;
      }
      const step = { id: 'answer', label: 'Answer', opensSheet: true };
      cards.push({ ...base, kind: 'card', kindWord: KIND_WORDS.card, title, meta: [c.item], step, buttons: [step] });
      continue;
    }
    if (f.kind === 'deploy') {
      const step = { id: 'approve', label: 'Approve ↗', sheetLabel: 'Approve on GitHub', href: f.link };
      cards.push({ ...base, kind: 'deploy', kindWord: KIND_WORDS.deploy, title: f.deploy.title, meta: [`run ${f.deploy.runNumber}`],
        step, buttons: [step], deploy: f.deploy });
      continue;
    }
    if (f.kind === 'hold') {
      const step = { id: 'open', label: 'Open ↗', sheetLabel: 'Open on GitHub', href: holdLink(snap, f, input.parseRuns) };
      cards.push({ ...base, kind: 'hold', kindWord: KIND_WORDS.hold, title: "The default branch's governance run is not green",
        meta: [f.hold.path.replace(/^queue\//, '')], step, buttons: [step] });
      continue;
    }
    if (f.kind === 'merge') {
      const title = f.merge.step === 'conflict' ? `Merge ${f.merge.item}: a merge conflict` : `Merge ${f.merge.item} by hand`;
      const step = { id: 'open', label: 'Open ↗', sheetLabel: 'Open on GitHub', href: treeLink(project, tree, f.merge.path) || f.link };
      cards.push({ ...base, kind: 'merge', kindWord: KIND_WORDS.merge, title, meta: [f.merge.item], step, buttons: [step] });
      continue;
    }
    // A card that went missing (Terms): its status file on GitHub.
    const step = { id: 'open', label: 'Open ↗', sheetLabel: 'Open on GitHub', href: f.link };
    cards.push({ ...base, kind: 'missing', kindWord: KIND_WORDS.missing, title: f.title, meta: [], step, buttons: [step] });
  }
  return { cards, agents, keep };
}

/** A card's meta line in Plex Mono: `#148 · R3 · 35 m` (the board's age form), the wait from its raised time. */
export function metaText(card, nowMs) {
  return [...card.meta, card.raisedAt != null ? boardAge(nowMs - card.raisedAt) : null].filter(Boolean).join(' · ');
}

// ---------------------------------------------------------------------------
// Marks: kept on this device under MARKS_KEY, each by its AC73 key, the step it was made on and the
// pull request's head then, with its time.

/** A fresh, empty set of marks. */
export const noMarks = () => ({ v: 1, marks: {} });

/** Marks as read back from storage: anything malformed dropped. */
export function readMarks(raw) {
  const out = noMarks();
  if (!raw || typeof raw !== 'object' || !raw.marks || typeof raw.marks !== 'object') return out;
  for (const [id, m] of Object.entries(raw.marks)) {
    if (!m || typeof m !== 'object' || typeof m.step !== 'string' || !Number.isFinite(m.at) || typeof m.project !== 'string') continue;
    out.marks[id] = { project: m.project, step: m.step, head: typeof m.head === 'string' ? m.head : null, at: m.at,
      title: typeof m.title === 'string' ? m.title : '', kicked: m.kicked && Number.isFinite(m.kicked.at) ? { at: m.kicked.at, reason: String(m.kicked.reason || '') } : null,
      prevKick: m.prevKick && Number.isFinite(m.prevKick.at) ? { at: m.prevKick.at, reason: String(m.prevKick.reason || ''), markAt: m.prevKick.markAt } : null,
      confirmedAt: Number.isFinite(m.confirmedAt) ? m.confirmedAt : null, number: Number.isInteger(m.number) ? m.number : null,
      kind: typeof m.kind === 'string' ? m.kind : null, name: typeof m.name === 'string' ? m.name : null };
  }
  return out;
}

/** Mark a card done (by dragging it into Done, or "Done ✓"): from "Waiting on you", or again from "Kicked back". */
export function markDone(marks, card, nowMs) {
  const prev = marks.marks[card.id];
  const m = { project: card.project, step: card.step && card.step.id ? card.step.id : 'answer', head: card.headSha || null, at: nowMs, title: card.title,
    kicked: null, prevKick: prev && prev.kicked ? { ...prev.kicked, markAt: prev.at, step: prev.step } : null, confirmedAt: null,
    number: card.number != null ? card.number : null, kind: card.kind, name: card.name || null };
  return { ...marks, marks: { ...marks.marks, [card.id]: m } };
}

/** "Undo": the card returns to the lane it came from ("Kicked back" for a re-mark made there). */
export function undoMark(marks, id) {
  const m = marks.marks[id];
  if (!m) return marks;
  const next = { ...marks.marks };
  if (m.prevKick) next[id] = { ...m, at: m.prevKick.markAt != null ? m.prevKick.markAt : m.at, kicked: { at: m.prevKick.at, reason: m.prevKick.reason }, prevKick: null };
  else delete next[id];
  return { ...marks, marks: next };
}

const REASONS = {
  merge: "GitHub doesn't show it merged yet",
  answerQuestion: 'GitHub shows no answer file, or pull request for one, yet',
  answerCard: 'GitHub shows no answer file yet',
  approve: 'The deploy run is still waiting',
  hold: 'The governance run is still not green',
  merge_card: 'The merge card is still open',
  missing: "The card file still isn't there",
  openPr: 'The pull request is still open as it was',
};
export const verdictReason = (n) => `GitHub doesn't show reviews/${n}/owner.md on the branch yet`;
export { REASONS };

/**
 * Whether a mark's own step is confirmed from the reads the page already makes (AC80's table), and
 * whether those reads are current. ctx: { project, tree, pulls (open list), files (J20), model,
 * current: Map(id → card) (the cards that need the owner now), agentIds: Set }. Returns
 * { confirmed, current, reason }.
 */
export function confirmMark(id, m, ctx) {
  const parts = id.split('|');
  const kind = parts[1];
  const ref = parts.slice(2).join('|');
  const open = (n) => (ctx.pulls || []).find((p) => p.number === n) || null;
  const card = ctx.current.get(id) || null;
  // Whatever the step, a card is also confirmed once its item no longer needs the owner (merged,
  // closed, answered, approved or gone); going to the agents is not such an end (below).
  const gone = !card && !(ctx.agentIds && ctx.agentIds.has(id)) && !(ctx.heldIds && ctx.heldIds.has(id));
  if (kind === 'pr') {
    const n = Number(ref);
    const pr = open(n);
    if (!pr) return { confirmed: true, current: true, reason: null };
    if (m.step === 'merge') return { confirmed: false, current: true, reason: REASONS.merge };
    if (m.step === 'verdict') {
      const list = listAt(pr, ctx.project, ctx.files);
      if (list.state !== 'read') return { confirmed: false, current: false, reason: WORDS.cantCheck };
      const e = list.f.verdicts ? list.f.verdicts.get(verdictPath(n, OWNER)) : null;
      if (e && e.present) return { confirmed: true, current: true, reason: null };
      return { confirmed: false, current: true, reason: verdictReason(n) };
    }
    return { confirmed: gone, current: true, reason: REASONS.openPr };
  }
  if (gone) return { confirmed: true, current: true, reason: null };
  if (kind === 'question') {
    const name = (/^questions\/([^/]+)\.md$/.exec(ref) || [])[1];
    const v3 = ctx.project.model === 'v3';
    const answered = v3 ? ctx.tree.has(`decisions/questions/${name}.md`) : !ctx.tree.has(ref);
    if (answered) return { confirmed: true, current: true, reason: null };
    if ((ctx.recordingNames || new Set()).has(name)) return { confirmed: true, current: true, reason: null };
    // J20's answers count as current only at each open pull request's current head.
    const unread = (ctx.pulls || []).some((p) => canRecord(p, ctx.project) && listAt(p, ctx.project, ctx.files).state !== 'read' && !(ctx.files && ctx.files.get(p.number) && ctx.files.get(p.number).capped));
    if (unread) return { confirmed: false, current: false, reason: WORDS.cantCheck };
    return { confirmed: false, current: true, reason: REASONS.answerQuestion };
  }
  if (kind === 'card' || kind === 'gate') {
    const p = (/^queue\/(.+)-(.+)-([0-9]+)\.md$/.exec(ref));
    const ans = card && card.flag && card.flag.card ? card.flag.card.answerPath : null;
    if (ans && ctx.tree.has(ans)) return { confirmed: true, current: true, reason: null };
    return { confirmed: false, current: true, reason: p ? REASONS.answerCard : REASONS.answerCard };
  }
  if (kind === 'deploy') return { confirmed: false, current: true, reason: REASONS.approve };
  if (kind === 'hold') return { confirmed: false, current: true, reason: REASONS.hold };
  if (kind === 'merge') return { confirmed: false, current: true, reason: REASONS.merge_card };
  return { confirmed: false, current: true, reason: REASONS.missing };
}

/**
 * Each poll in which a project was read successfully (Terms): first confirm every mark it can, then
 * judge the rest: a mark at least KICK_BACK_MINUTES old whose step is not confirmed moves its card to
 * "Kicked back" with its reason. Also: a marked card gone to the agents leaves Done, its mark dropped;
 * a card whose item needs the owner again under the same key and step leaves Done (the item wins); a
 * mark on an "Open ↗" pull request card whose pull request has a new head leaves Done; and a
 * kicked-back card whose item no longer needs the owner is dropped once confirmed (it shows in Done).
 * Returns the new marks.
 */
export function judgeMarks(marks, project, ctx, nowMs) {
  const next = { ...marks.marks };
  for (const [id, m] of Object.entries(marks.marks)) {
    if (m.project !== project.name) continue;
    const card = ctx.current.get(id) || null;
    if (m.confirmedAt != null) {
      // The item wins: needs the owner again under the same key and step.
      if (card && card.step && card.step.id === m.step) delete next[id];
      else if (nowMs - m.confirmedAt > DONE_KEEP_HOURS * 3600e3 && nowMs - m.at > DONE_KEEP_HOURS * 3600e3) delete next[id];
      continue;
    }
    if (ctx.agentIds && ctx.agentIds.has(id)) {
      delete next[id]; // with the agents: neither confirmed nor kicked back, no ✓ (AC80)
      continue;
    }
    if (m.step === 'open' && /\|pr\|/.test(id) && card && card.headSha && m.head && card.headSha !== m.head) {
      delete next[id]; // the owner looked, the agents pushed, and it still waits
      continue;
    }
    const c = confirmMark(id, m, ctx);
    if (c.confirmed) {
      next[id] = { ...m, kicked: null, prevKick: null, confirmedAt: nowMs };
      continue;
    }
    if (!m.kicked && nowMs - m.at >= KICK_BACK_MINUTES * 60e3) next[id] = { ...m, kicked: { at: nowMs, reason: c.reason }, prevKick: null };
    else if (m.kicked) next[id] = { ...m, kicked: { ...m.kicked, reason: c.reason } };
  }
  return { ...marks, marks: next };
}

// ---------------------------------------------------------------------------
// The lanes

/**
 * The records' Done rows (AC80, "Done keeps the last 24 hours"): AC52's "Done today" items over the
 * last 24 hours (a ruling by the oldest commit of its answer, a card by its decision entry's time)
 * and the pull requests J12's kept list shows merged into the default branch in the last 24 hours,
 * other than an `item/` branch's or the asks-merge job's. Each { id, step, title, at, code, link, kind }.
 */
export function recordDone(project, model, snap, j, nowMs) {
  const out = [];
  const since = nowMs - DONE_KEEP_HOURS * 3600e3;
  let actions = [];
  try {
    actions = project.model === 'v3' ? ownerActions(project, model, snap, j).actions : [];
  } catch {
    actions = [];
  }
  for (const a of actions) {
    if (!(a.at >= since && a.at <= nowMs)) continue;
    if (a.kind === 'ruling') {
      // AC52's row words: a ruling by proxy keeps its " (proxy)" mark.
      out.push({ id: waitKey(project.name, 'question', `questions/${a.code}.md`), step: 'answer', title: `${a.words}${a.proxy === true ? ' (proxy)' : ''}`, at: a.at, code: a.code, link: a.link, kind: 'ruling', clip: a.clip, path: a.path });
    } else {
      const m = /^decisions\/([A-Z]+-[0-9]+)\/(.+)-([0-9]+)\.md$/.exec(a.path || '');
      const cardPath = m ? `queue/${m[1]}-${m[2]}-${m[3]}.md` : a.path;
      const kind = m && GATE_WORDS.includes(m[2]) ? 'gate' : 'card';
      out.push({ id: waitKey(project.name, kind, cardPath), step: 'answer', title: a.words, at: a.at, code: a.code, link: a.link, kind: 'card', path: a.path });
    }
  }
  const kept = snap && snap.pulls && Array.isArray(snap.pulls.list) ? snap.pulls.list : [];
  for (const p of kept) {
    const at = t(p.mergedAt);
    if (at == null || !(at >= since && at <= nowMs)) continue;
    if (typeof p.head === 'string' && /^item\//.test(p.head)) continue;
    if (p.job === true) continue;
    out.push({ id: waitKey(project.name, 'pr', p.number), step: 'merge', title: p.title, at, code: `#${p.number}`, link: `https://github.com/${project.repo}/pull/${p.number}`, kind: 'pr' });
  }
  return out;
}

/**
 * The whole board (AC80): input: { projects: [{ project, cards, agents, read: { ok, cantRead,
 * since }, recording: [], asking: [], answerRecording: [], recordRows: [], seenRows: [] }] in J7's
 * order, marks, only (a project's name, or null), nowMs, tz }. Returns { lanes: [{ key, title,
 * count, groups: [{ project, rows, more }] }], counts: Map(project → { waiting, kicked }), badge,
 * quiet, only, of, nothingWaiting, cantRead, done, pending }.
 */
export function boardView(input) {
  const { marks, nowMs, tz } = input;
  const only = input.only || null;
  const lanes = { wait: [], kick: [], done: [] };
  const counts = new Map();
  const counted = new Map(); // project → Set(the model's keys of the cards counted: "Waiting on you" and "Kicked back")
  const quiet = { agents: [], recording: [], asking: [], answerRecording: [] };
  const nothingWaiting = [];
  const cantRead = [];
  let pendingAny = false;
  for (const p of input.projects) {
    const name = p.project.name;
    const mine = Object.entries(marks.marks).filter(([, m]) => m.project === name);
    const byId = new Map(mine);
    const waitRows = [];
    const kickRows = [];
    const doneRows = [];
    for (const c of p.cards) {
      const m = byId.get(c.id);
      if (m && m.confirmedAt == null && m.kicked) {
        kickRows.push({ ...c, kicked: m.kicked, markAt: m.at, kindWord: 'Kicked back', origKindWord: c.kindWord });
        continue;
      }
      if (m && m.confirmedAt == null) continue; // pending: in Done
      if (m && m.confirmedAt != null && c.step && c.step.id === m.step) continue; // judged at the next poll: the item wins then
      waitRows.push(c);
    }
    // Done: pending marks (a card headed "Confirming with GitHub"), confirmed marks, cards seen to
    // stop needing the owner while open, and the records' rows; one row per AC73 key and step.
    const seenKeys = new Set();
    for (const [id, m] of mine) {
      if (m.confirmedAt == null && m.kicked) continue;
      const k = `${id}#${m.step}`;
      if (seenKeys.has(k)) continue;
      seenKeys.add(k);
      if (m.confirmedAt == null) {
        const card = p.cards.find((c) => c.id === id) || null;
        doneRows.push({ id, pending: true, title: m.title || (card ? card.title : ''), at: m.at, step: card ? card.step : null, card, mark: m });
        pendingAny = true;
      } else if (nowMs - m.at <= DONE_KEEP_HOURS * 3600e3) {
        // Its small line, as the records' rows have it: a pull request's number, a question's name.
        const pr = m.number != null && m.kind === 'pr';
        const code = pr ? `#${m.number}` : m.kind === 'question' && m.name ? m.name : null;
        const link = pr ? `https://github.com/${p.project.repo}/pull/${m.number}` : null;
        doneRows.push({ id, pending: false, title: m.title, at: m.confirmedAt, mark: m, code, link, kind: pr ? 'pr' : m.kind === 'question' ? 'ruling' : 'card' });
      }
    }
    for (const r of [...(p.seenRows || []), ...(p.recordRows || [])]) {
      const k = `${r.id}#${r.step}`;
      if (seenKeys.has(k) || !(nowMs - r.at <= DONE_KEEP_HOURS * 3600e3)) continue;
      seenKeys.add(k);
      doneRows.push({ ...r, pending: false });
    }
    // Waiting on you: AC52's order (the earliest raised first, one with no raised time last); Kicked
    // back and Done: the newest first.
    waitRows.sort((a, b) => {
      if (a.raisedAt == null && b.raisedAt == null) return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      if (a.raisedAt == null) return 1;
      if (b.raisedAt == null) return -1;
      return a.raisedAt - b.raisedAt || (a.id < b.id ? -1 : 1);
    });
    kickRows.sort((a, b) => b.kicked.at - a.kicked.at);
    doneRows.sort((a, b) => (b.pending === a.pending ? b.at - a.at : b.pending ? 1 : -1));
    counts.set(name, { waiting: waitRows.length, kicked: kickRows.length, pending: doneRows.filter((r) => r.pending).length });
    counted.set(name, new Set([...waitRows, ...kickRows].map((c) => c.key)));
    if (!only || only === name) {
      if (waitRows.length) lanes.wait.push({ project: name, rows: waitRows });
      if (kickRows.length) lanes.kick.push({ project: name, rows: kickRows });
      if (doneRows.length) lanes.done.push({ project: name, rows: doneRows.slice(0, DONE_GROUP_ROWS), more: doneRows.length - DONE_GROUP_ROWS, all: doneRows });
      quiet.agents.push(...p.agents);
      quiet.recording.push(...(p.recording || []));
      quiet.asking.push(...(p.asking || []));
      quiet.answerRecording.push(...(p.answerRecording || []));
      if (p.read && p.read.cantRead) cantRead.push({ project: name, since: p.read.since, words: p.read.words });
      else if (p.read && p.read.ok && !waitRows.length && !kickRows.length && !doneRows.length) nothingWaiting.push(name);
    }
  }
  const lane = (k) => lanes[k].reduce((n, g) => n + (k === 'done' ? g.all.length : g.rows.length), 0);
  let badge = 0;
  for (const c of counts.values()) badge += c.waiting + c.kicked;
  return {
    lanes: LANES.map((l) => ({ ...l, count: lane(l.key), groups: lanes[l.key] })),
    counts, counted, badge, quiet, only, of: input.projects.length, nothingWaiting, cantRead, pendingAny,
  };
}

export { STEP2_NOTE };
