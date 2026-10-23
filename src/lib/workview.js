// Work ahead's screen, as data (spec S-001, AC24; J4, J14, J15; M3A, from 2026-10-18): everything
// the sandbox's "Work ahead" screen draws, worked out from the records the desk already reads (J11's
// milestone lines, AC57's rules, J2's queue) and the planning project's optional reads (the current
// plan, the estimates, the later-work list), the owner's draft order and the clock. Pure: no network,
// no DOM, no storage. The sandbox (src/public/sandbox.js) draws it.

import { milestoneRule, STATUS_MARK, FEED_ICON, sprintList, ownParts, PHASE_CLASS } from './feed.js';
import { GATE_PHASE, GATE_WORDS } from './j11.js';
import { reachedDateWords } from './sandbox.js';
import { cappedNewFileLink } from './links.js';
import {
  WA, planningProject, planFiles, planPath, nextPlanName, planTime, planBody, ESTIMATES_PATH, LATER_WORK_PATH, latestEstimates,
  estimateStanding, estimateWords, pastWords, roughFinish, dateWords, todayOf, msKey, laterRows, askPath, askBody, shortRange, aboutDays,
} from './workahead.js';
import { dayKey, hhmm } from './timefmt.js';

const ORD_WORDS = (n) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  return `${n}${s}`;
};
/** A row's place as its accessible text (AC24): "1st of 6". */
export const placeWords = (i, n) => `${ORD_WORDS(i + 1)} of ${n}`;

/** The owner's draft as kept on the device (AC24, `desk-plan-draft-v1`): { base: plan name | null, order: [key] }, or null. */
export function readDraft(v) {
  if (!v || typeof v !== 'object' || !Array.isArray(v.order) || !v.order.every((k) => typeof k === 'string')) return null;
  if (v.base !== null && typeof v.base !== 'string') return null;
  return { base: v.base, order: [...v.order] };
}

/**
 * A milestone's state on Work ahead (AC24): AC57's rule and mark for the same milestone on Status,
 * in Status's words, so the two never differ. { words, mark, underway }. Under way (for the rough
 * finish only): work filed (its sprints) and not reached.
 */
function stateOf(ctx, m) {
  const run = ctx && ctx.cols ? ctx.cols.runs.find((r) => r.project.some((x) => x.id === m.id)) : null;
  const sprints = run ? run.sprints[m.id] || [] : m.sprints || [];
  const underway = sprints.length > 0 && !m.reached;
  if (!run) {
    // No run holds it (the model's timeline not read): the words from its plan line alone.
    return { words: underway ? `Work filed: ${sprintList(sprints)}` : WA.noWork, mark: underway ? 'dashed' : 'empty', icon: underway ? 'unrec' : 'planned', underway, rule: null };
  }
  const x = milestoneRule(ctx, run, 'own', run.project.find((y) => y.id === m.id));
  const mark = STATUS_MARK[x.rule];
  // From stage 5 (AC86): the row's icon is the one the project's page gives the same milestone (AC59's,
  // FEED_ICON, as frame 11 draws them), so Plan and the page never differ.
  // AC89 (k): a rule-3 row with work filed (in a run still to come) takes AC86's half-filled icon, "work filed".
  const icon = x.rule === 3 && sprints.length > 0 ? 'half' : FEED_ICON[x.rule];
  if (x.rule === 2) return { words: WA.nextToReach, mark, icon, underway, rule: 2 };
  if (x.rule === 4) return { words: WA.goneBack, mark, icon, underway, rule: 4 };
  if (x.rule === 7) return { words: WA.noWork, mark: 'empty', icon, underway, rule: 7 };
  // Rules 3 and 6 in Status's own words; rule 9 (work filed in a run not recorded) as Status shows it.
  return { words: x.status, mark, icon, underway, rule: x.rule };
}

/**
 * How many questions and cards in a project's Queue name a milestone on their own `Milestone:` line (AC24, AC66). A gate
 * card is never counted (AC89 (k); AC24's note): its own row on Plan says it waits.
 */
function waitingOn(rows, id) {
  let n = 0;
  for (const row of rows || []) {
    const f = row && row.flag;
    if (!f) continue;
    if (f.kind === 'card' && f.card && GATE_WORDS.includes(f.card.gate)) continue;
    let parts = null;
    if (f.kind === 'question' && f.question && f.question.parsed) parts = ownParts(f.question.parsed.text || '', 'question');
    else if (f.kind === 'card' && f.card && f.card.parsed) parts = ownParts(f.card.parsed.text || '', 'card');
    if (parts && parts.milestone && parts.milestone.ids && parts.milestone.ids.includes(id)) n++;
  }
  return n;
}

/**
 * A gate card waiting on the owner, as a row of its own in its project's group (AC86, frame 11:
 * "Launch gate · waits on you", desk-v2.html:840; the build review's B1, round 1): the vermilion ◆, the
 * card's title as the board shows it, "<Phase> gate · waits on you" and "after your ruling" at its right.
 * `card` is the board's card (AC80, kind `gate`). It is never one of the milestones, so it is in no
 * order, no plan and no rough finish, and no milestone row loses its state or finish to it.
 */
export function gateRow(card) {
  const g = card && card.flag && card.flag.card ? card.flag.card.gate : null;
  const phase = GATE_PHASE[g] || g || '';
  const Phase = phase ? phase[0].toUpperCase() + phase.slice(1) : '';
  return { key: `gate:${card.id}`, id: card.id, name: card.title, icon: 'you', mono: `${Phase} gate · ${WA.waitsOnYou}`,
    right: { kind: 'ruling', words: WA.afterRuling } };
}

/** "not available: <project>'s <code> has no estimate yet" (or "… is past its estimate"): a milestone of another project, as Home's tile names it (AC82). */
const otherWords = (stop) => `${WA.notAvailable}: ${stop.project}'s ${stop.code} ${stop.why}`;

/**
 * AC17's fallback words for a link that copies (J3, J15): they name the cause, a link too long, or a
 * repository that takes no prefilled content (build review round 1, F). null when the link holds it all.
 */
export function copyWords(project, link, what) {
  if (!link || !link.copy) return null;
  if (project && project.contentPrefill === false) return WA.copyPrefill(what);
  return WA.copyLength(what);
}

/** J15's ask for a piece of later work, its path, body and link (AC17's fallback words with it). */
function askOf(planner, item, nowMs, linkCap) {
  const path = askPath(item.w, nowMs);
  const body = askBody(item);
  const link = cappedNewFileLink(planner, path, body, linkCap);
  return { path, body, link, copyWords: copyWords(planner, link, 'the ask') };
}

/**
 * Work ahead's view. input:
 * - config: J7 (its projects, linkCap);
 * - entries: [{ project, j, ctx, rows (the Queue's rows), model (J9's, for a v2.5 project), error }] in J7's order;
 * - snaps: name → the reader's snapshot (tree, records, history), for the planning project's reads;
 * - nowMs, tz (ownerTimeZone); draft (readDraft's, or null);
 * - gates: name → the board's gate cards waiting on the owner in that project (AC80), in its order, or none: each a
 *   row of its own at the top of its group (AC86's gate rows; stage 6a's review, B1). One card alone is taken too.
 */
export function workAheadView({ config, entries, snaps, nowMs, tz, draft, gates = null }) {
  const today = todayOf(nowMs, tz);
  const v3 = entries.filter((e) => e.project.model === 'v3');
  const many = v3.length > 1;
  const notes = [];
  const toGo = []; // in section 3's order, project by project
  const reached = [];
  const dropped = [];
  const unread = [];
  const held = new Map(); // project → Set(every id section 3 holds)
  for (const e of v3) {
    const doc = e.j && e.j.ready !== false && e.j.projectDoc ? e.j.projectDoc : null;
    if (!doc || e.error) {
      unread.push(e.project.name);
      continue;
    }
    held.set(e.project.name, new Set(doc.milestones.map((m) => m.id)));
    for (const m of [...doc.milestones].sort((a, b) => a.lineno - b.lineno)) {
      const base = { key: msKey(e.project.name, m.id), project: e.project, code: m.id, name: m.name, m, entry: e };
      if (m.dropped) dropped.push(base);
      else if (m.reached) reached.push({ ...base, date: reachedDateWords(m.reached, nowMs, tz) });
      else toGo.push(base);
    }
  }
  const byKey = new Map(toGo.map((x) => [x.key, x]));

  // J4: the plan, in the planning project.
  const planner = planningProject(config);
  const psnap = planner ? (snaps && snaps.get ? snaps.get(planner.name) : null) || null : null;
  const ptree = (psnap && psnap.tree) || new Map();
  const precs = (psnap && psnap.records) || new Map();
  const pf = planFiles(psnap && psnap.tree ? ptree : null);
  for (const p of pf.odd) notes.push(`${p}: can't parse (not a plan's name)`);
  let plan = { kind: 'none', name: null, keys: [] };
  if (pf.current) {
    const rec = precs.get(planPath(pf.current));
    if (rec === undefined) plan = { kind: 'unread', name: pf.current, keys: [] };
    else if (!rec || !rec.ok) plan = { kind: 'cant', name: pf.current, keys: [], why: rec && rec.why };
    else {
      if (rec.planLine !== pf.current) notes.push(`plan ${pf.current}: its Plan: line ${rec.planLine == null ? 'is missing' : `reads ${rec.planLine}`}, not its name`);
      if (rec.supersedes == null) notes.push(`plan ${pf.current}: no Supersedes: line`);
      const keys = [];
      for (const r of rec.rows) {
        const proj = (config.projects || []).find((p) => p && p.name === r.project);
        if (!proj || proj.model !== 'v3' || !held.has(r.project) || !held.get(r.project).has(r.milestone)) {
          if (!proj || proj.model !== 'v3' || held.has(r.project)) notes.push(`the plan names ${r.project} ${r.milestone}, which is not a milestone the desk reads`);
          continue;
        }
        const k = msKey(r.project, r.milestone);
        if (keys.includes(k)) {
          notes.push(`the plan lists ${r.project} ${r.milestone} again (row ${r.order}); its first place counts`);
          continue;
        }
        keys.push(k);
      }
      plan = { kind: rec.rows.length ? 'current' : 'empty', name: pf.current, keys };
    }
  }

  // The order the plan gives (or section 3's), then the owner's draft over it.
  const listed = plan.kind === 'current' ? plan.keys.filter((k) => byKey.has(k)) : [];
  const unlisted = toGo.map((x) => x.key).filter((k) => !listed.includes(k));
  const baseOrder = [...listed, ...unlisted];
  const marked = new Set(plan.kind === 'current' ? unlisted : []);
  let setAside = false;
  let order = baseOrder;
  let keep = null; // the draft to keep on the device, or null to remove it
  // The draft is judged only once every milestone list and the planning project's tree are read,
  // so a drawing before the reads are in never sets a draft aside or drops it.
  const ready = !unread.length && (!planner || Boolean(psnap && psnap.tree)) && plan.kind !== 'unread';
  if (draft) {
    const d = draft.order.filter((k, i) => byKey.has(k) && draft.order.indexOf(k) === i);
    const drafted = [...d, ...baseOrder.filter((k) => !d.includes(k))];
    // A newer plan landed: the draft is set aside. When that plan's order is the draft's own (the
    // owner recorded it), it is cleared silently; the notice shows only when the orders differ (the
    // Orchestrator's ruling on build review round 1, C).
    if (ready && (draft.base || null) !== (pf.current || null)) setAside = drafted.join('\n') === baseOrder.join('\n') ? 'quiet' : 'notice';
    else order = drafted;
  }
  const changed = order.join('\n') !== baseOrder.join('\n');
  if (changed) keep = { base: pf.current || null, order };

  // J14: the estimates.
  let est = { kind: 'na' }; // 'na' (no planning project, or the read failed), 'none' (no file), 'ok'
  if (planner && psnap && psnap.tree) {
    if (!ptree.has(ESTIMATES_PATH)) est = { kind: 'none' };
    else {
      const rec = precs.get(ESTIMATES_PATH);
      if (rec && Array.isArray(rec.lines)) {
        const l = latestEstimates({ lines: rec.lines, nowMs, projects: config.projects, held });
        est = { kind: 'ok', ...l };
        notes.push(...l.notes);
      }
    }
  }

  // Each row, its estimate and the rough finish, in the order shown.
  const rows = order.map((k, i) => {
    const x = byKey.get(k);
    const st = stateOf(x.entry.ctx, x.m);
    const r = { ...x, index: i, place: String(i + 1), placeWords: placeWords(i, order.length), state: st, notInPlan: marked.has(k),
      phase: x.m.phase, phaseClass: PHASE_CLASS[x.m.phase] || null, done: x.m.done, waiting: waitingOn(x.entry.rows, x.code),
      first: i === 0, last: i === order.length - 1 };
    r.estimate = { kind: est.kind === 'ok' ? 'missing' : est.kind === 'none' ? 'missing' : 'na', words: est.kind === 'na' ? WA.estimateNA : WA.noEstimate, note: null, newer: false };
    r.standing = null;
    if (est.kind === 'ok') {
      const e = est.latest.get(k);
      r.estimate.newer = est.unreadable.has(k);
      if (e) {
        const s = estimateStanding(e, st.underway, today, tz);
        const made = dateWords(s.dateKey, today);
        r.standing = s.kind === 'past' ? null : s;
        r.past = s.kind === 'past';
        if (s.kind === 'zero') r.estimate = { kind: 'zero', words: `${WA.zeroZero} · ${WA.byCoS}, ${made}`, note: e.note || null, newer: r.estimate.newer };
        else if (s.kind === 'past') r.estimate = { kind: 'past', words: pastWords(e, made), note: e.note || null, newer: r.estimate.newer };
        else r.estimate = { kind: 'ok', words: `${estimateWords(e.low, e.high)} · ${WA.byCoS}, ${made}${s.stale ? ` · ${WA.mayBeOld}` : ''}`, stale: s.stale, note: e.note || null, newer: r.estimate.newer };
        // AC86: "about <low>–<high> days" on the row where J14 gives an estimate (its own days of work).
        if (s.kind === 'ok') r.days = aboutDays(e.low, e.high);
      }
    }
    // Plan's row (AC86, frame 11): "<id> · <phase>", then the estimate's days where there is one.
    r.mono = [r.code, r.phase, r.days || null, r.estimate.stale ? WA.mayBeOld : null].filter(Boolean).join(' · ');
    return r;
  });
  let card = WA.notAvailable;
  if (est.kind !== 'na') {
    const rf = roughFinish(rows.map((r) => ({ code: r.code, standing: r.past ? { kind: 'past' } : r.standing })), today);
    rows.forEach((r, i) => {
      r.finish = rf.rows[i];
      if (r.finish.stop) {
        r.finish.stop = { ...r.finish.stop, project: rows[r.finish.stop.index].project.name };
        // The milestone it names is another project's: its project said too, as Home's tile says it (AC82;
        // the Design reviewer's finding 1, stage 5 round 1). Within one project, AC24's words as they are.
        if (r.finish.stop.project !== r.project.name) r.finish.words = otherWords(r.finish.stop);
      }
    });
    card = rows.length ? rf.card : WA.notAvailable;
    // The card adds up every project's milestones: with more than one, the milestone it names says whose it is.
    const last = rows.length ? rows[rows.length - 1].finish : null;
    if (many && last && last.stop) card = otherWords(last.stop);
  }
  // Each row's value at its right (AC86, frame 11): its rough finish, shorter ("22–25 Oct"); "your
  // acceptance" for AC24's "once you accept it". None where the finish is not available: the row then
  // says why, in AC24's words. Its icon is always its own state's: a gate card is a row of its own (below).
  for (const r of rows) {
    if (r.finish && r.finish.accept) r.right = { kind: 'accept', words: WA.yourAcceptance };
    else if (r.finish && r.finish.from) r.right = { kind: 'finish', words: shortRange(r.finish.from, r.finish.to, today) };
    else r.right = null;
    r.icon = r.state.icon;
  }
  // One group for each connected v3 project, in the order of its first milestone in the order shown
  // (AC86: one owner order across projects, shown grouped, as drawn); a project whose gate card waits on
  // the owner has its gate's row at the top of its group, as frame 11 draws it, as the next thing that
  // waits on the owner, and a group even with no milestone ahead.
  const groups = [];
  const groupOf = (project) => {
    let g = groups.find((x) => x.project === project);
    if (!g) {
      g = { project, key: project.name, words: WA.ahead(project.name), rows: [], gates: [] };
      groups.push(g);
    }
    return g;
  };
  for (const r of rows) groupOf(r.project).rows.push(r);
  for (const e of v3) {
    const cards = gates && gates.get ? gates.get(e.project.name) : null;
    const list = Array.isArray(cards) ? cards : cards ? [cards] : [];
    if (list.length) groupOf(e.project).gates = list.map(gateRow);
  }

  // The state line and the bar (AC24, "Recording the plan").
  let stateLine;
  if (!changed && (plan.kind === 'current' || plan.kind === 'empty')) {
    const t = planTime(plan.name);
    stateLine = { kind: 'current', lead: WA.current, rest: `· recorded ${dateWords(dayKey(new Date(t), tz), today)}, ${hhmm(new Date(t), tz)}` }; // AC24: "Current plan · recorded <date>, <time>"
  } else if (changed) stateLine = { kind: 'draft', lead: 'Draft', rest: `not recorded · ${WA.draftChanged}` };
  // No move made, with no plan recorded, a plan that can't be read or one not read yet: nothing has
  // changed (the Orchestrator's ruling on build review round 1, D; the Definer's draft 6). "No plan
  // recorded yet" still heads the order.
  else stateLine = { kind: 'draft', lead: null, rest: WA.noChanges };
  let orderLine = null;
  if (plan.kind === 'none') orderLine = WA.noPlan;
  else if (plan.kind === 'cant') orderLine = `Your latest plan can't be read: ${plan.name}; shown in the project document's order`;
  else if (plan.kind === 'unread') orderLine = `Your latest plan, ${plan.name}: ${WA.notAvailable}; shown in the project document's order`;

  // "Record plan": J4's form, every row in the order shown.
  let record = { ok: false, words: WA.cantRecord };
  // Offered only once every read is in and a milestone shows, so it never records a plan with no
  // rows over the owner's current one (build review round 1, B).
  if (planner && (!ready || !rows.length)) record = { ok: false, words: WA.recordOff };
  else if (planner) {
    const name = nextPlanName(ptree, nowMs);
    if (!name) record = { ok: false, words: 'Every plan name for this minute is taken; try again in a minute' };
    else {
      const path = planPath(name);
      const body = planBody(name, pf.current, rows.map((r) => ({ project: r.project.name, milestone: r.code })));
      const link = cappedNewFileLink(planner, path, body, config.linkCap);
      record = { ok: true, path, body, link, copyWords: copyWords(planner, link, 'the plan'), project: planner.name };
    }
  }

  // J15: "Not milestones yet", in the planning project.
  let later = { kind: 'na', rows: [], notAdded: [] };
  if (planner && psnap && psnap.tree) {
    if (!ptree.has(LATER_WORK_PATH)) later = { kind: 'none', rows: [], notAdded: [] };
    else {
      const rec = precs.get(LATER_WORK_PATH);
      if (rec && Array.isArray(rec.items)) {
        const lr = laterRows({ list: rec, tree: ptree, history: psnap.history || new Map(), records: precs, held: held.get(planner.name) || new Set(), tz, todayKey: today });
        notes.push(...lr.notes);
        later = { kind: 'ok', rows: lr.rows.map((x) => (x.state === 'tap'
          ? { ...x, ask: askOf(planner, x.item, nowMs, config.linkCap) }
          : x)), notAdded: lr.notAdded };
      }
    }
  }

  // Each v2.5 project's group (J9's sprint rule).
  const older = entries.filter((e) => e.project.model !== 'v3').map((e) => {
    const s = e.model && e.model.sprint;
    let words;
    let path = null;
    if (!s) words = WA.notAvailable;
    else if (s.open === 1 && s.title) {
      words = `Open sprint: ${s.title}`;
      path = s.path || null;
    } else if (s.open === 0) words = WA.noOpenSprint; // J9 reads none as "sprint unclear"; said plainly here (AC24, C)
    else words = WA.sprintUnclear;
    return { project: e.project, words, path };
  });

  return {
    header: { eyebrow: WA.eyebrow, title: WA.title, sub: WA.toGo(toGo.length, reached.length) },
    // From stage 5 (AC86, frame 11): the title, its line, the groups, and the ideas' words until the desk reads the portfolio (AC87).
    tab: { title: WA.planTitle, sub: WA.planSub(dateWords(today, today)), ideas: WA.ideasNotRead },
    groups, many, rows, order, baseOrder, changed, keep, setAside, ready, plan, orderLine, stateLine, card, est: est.kind, record, later,
    reached, dropped, older, unread, notes, planner: planner ? planner.name : null, today,
  };
}
