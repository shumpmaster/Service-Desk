// Home in the trial view (spec S-001, AC82; J24; AC40 as AC82 changes it; AC54 and AC65 as noted in
// AC82; desk mockup v2, frames H1 to H5), as data. Pure: from what the page already holds (each
// project's read model, its records as last read, the board's view, J24's commits read) and the
// clock, everything Home draws: the briefing, "Since you last looked", and each tile's lines and
// timeline. No network, no DOM, no storage; the page (public/sandbox.js) draws what these return.
//
// The rules everywhere: every word, count and date comes from a record or is one of the fixed words
// AC82 and J24 quote; the desk never rewords a record (AC9): a commit's first line and a title are
// shown as written; a value no record gives says so in words (AC41).

import { hhmm, dayKey, durationText, zonedToUtc, dayDateTime } from './timefmt.js';
import { weekdayTime } from './board.js';
import { entryShape, defaultLetter } from './records.js';
import { dayWords, headlineWords, branchShape, runBegan, PHASE_CLASS } from './feed.js';
import { GATE_PHASE } from './j11.js';
import { ownerActions, memberLabel, NOT_RECORDED, pullLink, treeLink } from './sandbox.js';
import { waitKey } from './waiting.js';
import { WA } from './workahead.js';

export { parseCommitPages } from './prfiles.js';

/** "Since you last looked": four lines, then "<n> more" (P-001-since-count.md, A). */
export const SINCE_LINES = 4;
/** At most the last 7 days (AC82, C). */
export const SINCE_DAYS = 7;
/** At most three commit lines a pull request in the list, then "<n> more on #<n>" (J24, C). */
export const COMMIT_LINES = 3;
/** Answers recorded in one minute in the same project gather into one line (J24). */
export const GATHER_MS = 60_000;
/** A commit dated more than 10 minutes after the page's clock is shown at the page's now (J24, C; as AC79 treats a head time ahead). */
export const AHEAD_MS = 10 * 60_000;
/** Tiles two to a row from this width, Home's column widening to at most HOME_WIDE_PX (AC82, C). */
export const TWO_UP_PX = 720;
export const HOME_WIDE_PX = 960;
/** The desk's own words on Home (AC82, J24, AC40). */
export const HOME_WORDS = Object.freeze({
  title: 'Home',
  checking: 'Checking…',
  nothing: 'Nothing needs you',
  confirming: 'Nothing waiting on you · confirming with GitHub',
  waitingGo: 'Waiting ›',
  since: 'Since you last looked',
  markSeen: 'Mark as seen',
  lastWeek: 'in the last 7 days',
  moreDetail: 'More detail',
  nothingWaiting: 'Nothing waiting',
  cantRead: "Can't read",
  noDispatchLog: 'No dispatch log: not used here',
  olderPipeline: 'older pipeline: sprints, not phases',
});

const enc = (...parts) => parts.map(encodeURIComponent).join('/');
const go = (...parts) => `#/${enc(...parts)}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ms = (v) => (v == null ? NaN : typeof v === 'number' ? v : v instanceof Date ? v.getTime() : Date.parse(v));
const joinAnd = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

// ---------------------------------------------------------------------------
// Times

/** The board's age form, brief (AC82's "oldest <age>": "35 m", "4 h", "2 d"): the largest whole unit. */
export function briefAge(age) {
  if (!Number.isFinite(age) || age < 0) return NOT_RECORDED;
  const s = Math.floor(age / 1000);
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)} m`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} d`;
}

/** A day before `today` in the zone: "yesterday", else "18 Oct" (with its year when not this year). */
function dayPart(at, nowMs, tz) {
  const today = dayKey(new Date(nowMs), tz);
  const k = dayKey(new Date(at), tz);
  if (k === today) return null;
  const [y, mo, d] = today.split('-').map(Number);
  const yesterday = dayKey(new Date(zonedToUtc(y, mo, d, 12, 0, tz) - 86400e3), tz);
  if (k === yesterday) return 'yesterday';
  const [ky, km, kd] = k.split('-').map(Number);
  return `${kd} ${MONTHS[km - 1]}${ky !== y ? ` ${ky}` : ''}`;
}

/** "Since you last looked"'s time (AC82): "15:40" today, "yesterday, 15:40", "18 Oct, 15:40" before. */
export function sinceWords(at, nowMs, tz) {
  const d = dayPart(at, nowMs, tz);
  return d ? `${d}, ${hhmm(new Date(at), tz)}` : hhmm(new Date(at), tz);
}

/** A line's time, as the heading's (AC82): { day: null | "yesterday" | "18 Oct", time: "16:26" | null (a date with no time) }. */
export function lineTime(e, nowMs, tz) {
  if (e.dateOnly) return { day: dayPart(e.at, nowMs, tz) || 'today', time: null };
  return { day: dayPart(e.at, nowMs, tz), time: hhmm(new Date(e.at), tz) };
}

/** A settle time (AC82): "Wed 13:37" within the next 7 days, "21 Oct, 13:37" beyond (and before now), in ownerTimeZone. */
export function settleWords(at, nowMs, tz) {
  if (at >= nowMs && at - nowMs <= 7 * 86400e3) return weekdayTime(at, tz);
  return dayDateTime(at, nowMs, tz);
}

// ---------------------------------------------------------------------------
// The briefing (frames H1 and H3; the README, "Home's briefing counts what the board counts")

/** A counted question's settle time (AC12's sum: its raised time plus TIMEOUT hours), when its file gives both DEFAULT: and TIMEOUT:; else null. */
export function settleAt(q, raisedAt) {
  if (!q || raisedAt == null) return null;
  const rev = String(q.reversibility || '').toLowerCase();
  // The card's and the sheet's rule (records.js's defaultLetter): a DEFAULT naming no letter settles nothing.
  if (!rev.startsWith('reversible') || !defaultLetter(q) || !q.timeout) return null;
  const h = /^[0-9]+(\.[0-9]+)?/.exec(String(q.timeout).trim());
  return h ? raisedAt + Number(h[0]) * 3600e3 : null;
}
export const irreversible = (q) => Boolean(q) && String(q.reversibility || '').toLowerCase().startsWith('irreversible');

/**
 * The briefing. input: { bd (the board's view, every project shown), reads: [{ name, read, drawError }],
 * flagged (the trial view's flagged count over every project: Quiet's rule, Terms), signedOut,
 * v3 (name → whether the project is v3), lastReadMs (the stalest project's last successful read, or
 * null), nowMs, tz }. Returns { kind: 'you' | 'quiet' | 'confirming' | 'checking' | 'cant' |
 * 'signed-out', head, parts (the second line, or null), due (the lines under it, each { key: 'past' |
 * 'coming' | 'undo', icon: 'clock' | 'lock', words }, AC91 (a)), sub (the third line, or null), cant (lines) }.
 */
export function briefingView(input) {
  const { bd, reads, nowMs, tz } = input;
  const cant = reads.filter((r) => r.drawError || (r.read && r.read.read === 'cant-read'))
    .map((r) => (r.read && r.read.read === 'cant-read' && Number.isFinite(r.read.since)
      ? `Can't read ${r.name} since ${hhmm(new Date(r.read.since), tz)}`
      : `Can't show ${r.name}`));
  if (input.signedOut) return { kind: 'signed-out', head: 'Signed out — reload to sign in', parts: null, due: [], sub: null, cant: [] };
  // From stage 6b (Terms' Quiet; AC87): the portfolio read within its 6 minutes, or its own words, one line
  // as a project's (`portfolio`: portfolioRead's answer, or null with no portfolio in J7).
  const pf = input.portfolio || null;
  if (pf && pf.quietWords) cant.push(pf.quietWords);
  const n = bd ? bd.badge : 0;
  if (n > 0) {
    const lane = (k) => (bd.lanes.find((l) => l.key === k) || { groups: [] }).groups.flatMap((g) => g.rows);
    const wait = lane('wait');
    const kick = lane('kick');
    let w = 0;
    let k = 0;
    for (const c of bd.counts.values()) {
      w += c.waiting;
      k += c.kicked;
    }
    const parts = [];
    const first = [w ? `${w} waiting` : null, k ? `${k} kicked back` : null].filter(Boolean).join(', ');
    if (first) parts.push(first);
    // "oldest": the longest wait among "Waiting on you"'s cards that have a raised time (AC20's rules).
    const raised = wait.map((c) => c.raisedAt).filter((x) => x != null && Number.isFinite(x));
    if (raised.length) parts.push(`oldest ${briefAge(nowMs - Math.min(...raised))}`);
    // The counted v3 owner questions: settling themselves, and those that can't be undone (AC12, AC38).
    // After the glance audit (AC91 (a)): each is a line of its own under the parts, with its clock or lock, in
    // home.js's order — a time already past, a time to come, then what can't be undone — its words AC82's and
    // AC89 (j)'s, but for the capital.
    const due = [];
    const questions = [...wait, ...kick].filter((c) => c.kind === 'question' && !c.v25 && input.v3 && input.v3(c.project));
    const settles = questions.map((c) => settleAt(c.flag && c.flag.question ? c.flag.question.parsed : null, c.raisedAt)).filter((x) => x != null).sort((a, b) => a - b);
    // AC89 (j): a settle time already past, on a question that still waits, says so, its time always a date.
    const past = settles.filter((x) => x < nowMs);
    const ahead = settles.filter((x) => x >= nowMs);
    if (past.length === 1) due.push({ key: 'past', icon: 'clock', words: `One question was due to settle itself ${dayDateTime(past[0], nowMs, tz)}` });
    else if (past.length > 1) due.push({ key: 'past', icon: 'clock', words: `${past.length} questions were due to settle themselves, the first ${dayDateTime(past[0], nowMs, tz)}` });
    if (ahead.length === 1) due.push({ key: 'coming', icon: 'clock', words: `One question settles itself ${settleWords(ahead[0], nowMs, tz)}` });
    else if (ahead.length > 1) due.push({ key: 'coming', icon: 'clock', words: `${ahead.length} questions settle themselves, the first ${settleWords(ahead[0], nowMs, tz)}` });
    const irr = questions.filter((c) => irreversible(c.flag && c.flag.question ? c.flag.question.parsed : null)).length;
    if (irr === 1) due.push({ key: 'undo', icon: 'lock', words: "One can't be undone" });
    else if (irr > 1) due.push({ key: 'undo', icon: 'lock', words: `${irr} can't be undone` });
    return { kind: 'you', head: `${n} need${n === 1 ? 's' : ''} you`, n, parts: parts.join(' · ') || null, due, sub: null, cant };
  }
  const unread = reads.some((r) => !r.drawError && (!r.read || r.read.read === 'checking')) || Boolean(pf && !pf.fresh && !pf.quietWords);
  if (cant.length) return { kind: 'cant', head: cant[0], parts: null, due: [], sub: null, cant: cant.slice(1) };
  if (unread) return { kind: 'checking', head: HOME_WORDS.checking, parts: null, due: [], sub: null, cant: [] };
  // Nothing on the board, but Quiet still needs GitHub's word: a mark not yet confirmed (AC80).
  if (input.flagged > 0 || (bd && bd.pendingAny)) return { kind: 'confirming', head: HOME_WORDS.confirming, parts: null, due: [], sub: null, cant: [] };
  const agents = bd ? bd.quiet.agents.length : 0;
  const age = input.lastReadMs != null ? `Every project read ${durationText(Math.max(0, nowMs - input.lastReadMs))} ago` : null;
  return { kind: 'quiet', head: HOME_WORDS.nothing, parts: null, due: [], sub: [age, agents ? `with the agents: ${agents}` : null].filter(Boolean).join(' · ') || null, cant: [] };
}

// ---------------------------------------------------------------------------
// J24: what changed since the owner last looked

/** The roster, for J24's `<who>` and its icons: id → class (AC49's members: the Chief of Staff and the Orchestrator always, then the roster block's). */
export function rosterOf(j) {
  const out = new Map([['chief-of-staff', 'builder'], ['orchestrator', 'orchestrator']]);
  if (j && j.surfaces && j.surfaces.ok) for (const m of j.surfaces.members) out.set(m.id, m.class);
  return out;
}

/** A commit's `<who>` (J24): "You" for the owner's login, the role in the roster's words for `<id>@agents.invalid`, a bot's login, else its author's name. */
export function commitWho(c, ownerLogin, roster) {
  if (c.login && ownerLogin && c.login === ownerLogin) return { words: 'You', icon: 'agents' };
  const m = /^([a-z0-9][a-z0-9-]*)@agents\.invalid$/i.exec(c.email || '');
  if (m && roster.has(m[1])) return { words: memberLabel(m[1]), icon: roster.get(m[1]) === 'reviewer' ? 'eye' : 'agents' };
  if (c.login && /\[bot\]$/.test(c.login)) return { words: c.login, icon: 'agents' };
  return { words: c.name || c.login || NOT_RECORDED, icon: 'agents' };
}

/** A ruling's letter or word (J24's "Your answer recorded: <title> · <its letter or word>"): its leading letter, or a short ruling's words; else null. */
export function rulingChoice(ruling) {
  const r = String(ruling || '').trim();
  const m = /^([A-Z])(?=$|[\s,.:;—–-])/.exec(r);
  if (m) return m[1];
  return r && r.split(/\s+/).length <= 3 ? r : null;
}

const SHAPED = (o) => ({ ...o, shape: entryShape(o) });

/**
 * One project's J24 events, newest last as gathered (the list sorts them): input: { project, model,
 * snap, j (J11's records, or null), commits (Map(number → J24's read: { headSha, state, commits,
 * capped })), ownerLogin, titles (Map("<project>|<question name>" → title) as this opening saw them), nowMs, tz }. Each event: { id, at, seq, dateOnly, icon, words,
 * codes: [..], target: { hash } | { href } }. The Chief of Staff's sessions are not a kind
 * (P-001-cos-sessions-on-desk.md, A); its commits are, as anyone's.
 */
export function projectEvents(input) {
  const { project, model, snap, j, nowMs, tz } = input;
  const name = project.name;
  const v3 = project.model === 'v3';
  const tree = (snap && snap.tree) || new Map();
  const records = (snap && snap.records) || new Map();
  const roster = rosterOf(j);
  const out = [];
  let seq = 0;
  const add = (e) => out.push({ project: name, seq: seq++, dateOnly: false, codes: [], ...e });
  const doneRow = (id, at) => (nowMs - at <= 24 * 3600e3 ? { hash: `${go('waiting', 'card', id)}${encodeURIComponent('#answer')}` } : null);
  if (!model) return out;

  // A question raised (J2's raised time).
  for (const q of model.questions || []) {
    const at = ms(q.raisedAt);
    if (!Number.isFinite(at)) continue;
    add({ id: `${name}|q|${q.path}`, at, icon: 'question', words: `New question: ${q.title}`, codes: [q.name],
      target: { hash: go('waiting', 'card', waitKey(name, 'question', q.path)) } });
  }

  // An answer recorded: AC52's "Done today" time, its oldest commit; gathered in one minute.
  if (v3) {
    let actions = [];
    try {
      actions = ownerActions(project, model, snap, j).actions;
    } catch {
      actions = [];
    }
    const rulings = actions.filter((a) => a.kind === 'ruling' && Number.isFinite(a.at)).sort((a, b) => a.at - b.at);
    const groups = [];
    for (const a of rulings) {
      const g = groups[groups.length - 1];
      if (g && a.at - g[0].at < GATHER_MS) g.push(a);
      else groups.push([a]);
    }
    for (const g of groups) {
      const parts = g.map((a) => {
        const qpath = `questions/${a.code}.md`;
        const qrec = tree.has(qpath) ? records.get(qpath) : null;
        const rec = records.get(a.path) || {};
        // The question's own title while its file is in the tree, or as this opening saw it open;
        // else its name: the answer record keeps no title (J2), and the desk writes none of its own (AC41).
        const title = (qrec && qrec.title) || (input.titles && input.titles.get(`${name}|${a.code}`)) || a.code;
        const choice = rulingChoice(rec.ruling);
        return `${title}${choice ? ` · ${choice}` : ''}`;
      });
      const last = g[g.length - 1];
      const one = g.length === 1;
      add({ id: `${name}|ans|${g.map((a) => a.code).join(',')}`, at: last.at, icon: 'done',
        words: `${one ? 'Your answer recorded' : 'Your answers recorded'}: ${parts.join('; ')}`, codes: g.map((a) => a.code),
        target: doneRow(waitKey(name, 'question', `questions/${last.code}.md`), last.at) || (last.link ? { href: last.link } : { hash: '#/waiting' }) });
    }
  }

  // A card raised or answered; an agent run's outcome (the dispatch log, J2, J9).
  if (v3) {
    const rows = j && j.ready ? j.logRows.map(SHAPED) : (model.allEntries || []);
    for (const e of rows) {
      const at = ms(e.time);
      if (!Number.isFinite(at)) continue;
      if (e.shape === 'card' && e.item != null && e.gate != null && e.card != null) {
        const path = `queue/${e.item}-${e.gate}-${e.card}.md`;
        const rec = tree.has(path) ? records.get(path) : null;
        const title = (rec && rec.title) || `${e.item} card ${e.gate}-${e.card}`;
        const kind = GATE_PHASE[e.gate] ? 'gate' : 'card';
        add({ id: `${name}|card|${path}|${e.time}`, at, icon: 'card', words: `New card: ${title}`, codes: [`${e.item} ${e.gate}-${e.card}`],
          target: { hash: go('waiting', 'card', waitKey(name, kind, path)) } });
      } else if (e.shape === 'decision') {
        const rec = typeof e.record === 'string' ? e.record : `decisions/${e.item}/${e.gate}-${e.card}.md`;
        const cm = /^decisions\/([A-Z]+-[0-9]+)\/(.+)-([0-9]+)\.md$/.exec(rec);
        const path = cm ? `queue/${cm[1]}-${cm[2]}-${cm[3]}.md` : null;
        const crec = path && tree.has(path) ? records.get(path) : null;
        const title = (crec && crec.title) || (cm ? `${cm[1]} card ${cm[2]}-${cm[3]}` : rec);
        const kind = cm && GATE_PHASE[cm[2]] ? 'gate' : 'card';
        add({ id: `${name}|dec|${rec}|${e.time}`, at, icon: 'done', words: `Card answered: ${title}${e.word ? ` · ${e.word}` : ''}${e.proxy === true ? ' (proxy)' : ''}`,
          codes: [cm ? `${cm[1]} ${cm[2]}-${cm[3]}` : rec],
          target: (path && doneRow(waitKey(name, kind, path), at)) || (treeLink(project, tree, rec) ? { href: treeLink(project, tree, rec) } : { hash: '#/waiting' }) });
      } else if (e.shape === 'outcome') {
        const words = headlineWords(e);
        if (!words) continue;
        add({ id: `${name}|out|${e.session || ''}|${e.time}`, at, icon: roster.get(e.role) === 'reviewer' ? 'eye' : 'agents', words, codes: [e.item].filter(Boolean),
          target: { hash: go('p', name, 'team') } });
      }
    }
  }

  // A pull request opened (J1's open list) and its commits (J24's one read).
  for (const pr of model.pulls || []) {
    const at = ms(pr.createdAt);
    if (Number.isFinite(at)) add({ id: `${name}|open|${pr.number}`, at, icon: 'pr', words: `Opened: ${pr.title}`, codes: [`#${pr.number}`], target: { href: pr.url || pullLink(project, pr.number) } });
    const c = input.commits ? input.commits.get(pr.number) : null;
    if (!c) continue;
    const href = pr.url || pullLink(project, pr.number);
    const upd = ms(pr.updatedAt);
    const near = Number.isFinite(upd) ? upd : at;
    if (c.state === 'failed') {
      if (Number.isFinite(near)) add({ id: `${name}|cfail|${pr.number}`, at: near, icon: 'bad', words: `Commits on #${pr.number} couldn't be read`, codes: [`#${pr.number}`], target: { href } });
      continue;
    }
    // In GitHub's order (oldest first), so two at the same time keep it, the later one newer. A merge
    // commit (two or more parents) is skipped (C); one dated more than 10 minutes ahead shows at now.
    for (const x of c.commits || []) {
      const t0 = ms(x.date);
      if (x.parents >= 2 || !Number.isFinite(t0)) continue;
      const who = commitWho(x, input.ownerLogin, roster);
      add({ id: `${name}|commit|${x.sha}`, at: t0 > nowMs + AHEAD_MS ? nowMs : t0, icon: who.icon, words: `${who.words}: ${x.line}`, codes: [`#${pr.number}`, x.sha.slice(0, 7)],
        target: { href }, pr: pr.number });
    }
    if (c.capped && Number.isFinite(near)) add({ id: `${name}|capped|${pr.number}`, at: near, icon: 'pr', words: `#${pr.number}: more commits than the desk reads`, codes: [`#${pr.number}`], target: { href } });
  }

  // A pull request merged (J12's kept list; v3 projects only, src/lib/api.js: a v2.5 project's merges are not listed, a known limit).
  if (v3 && snap && snap.pulls && Array.isArray(snap.pulls.list)) {
    for (const p of snap.pulls.list) {
      const at = ms(p.mergedAt);
      if (!Number.isFinite(at) || p.job === true || (typeof p.head === 'string' && /^item\//.test(p.head))) continue;
      add({ id: `${name}|merged|${p.number}`, at, icon: 'merge', words: `Merged: ${p.title}`, codes: [`#${p.number}`], target: { href: pullLink(project, p.number) } });
    }
  }

  // A milestone reached (J11's ` · reached: <date>`): its date, no time, at that date's start.
  if (v3 && j && j.projectDoc && Array.isArray(j.projectDoc.milestones)) {
    for (const m of j.projectDoc.milestones) {
      const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(m.reached || ''));
      if (!d) continue;
      const at = zonedToUtc(Number(d[1]), Number(d[2]), Number(d[3]), 0, 0, tz);
      add({ id: `${name}|reached|${m.id}`, at, dateOnly: true, icon: 'flag', words: `Reached: ${m.name}`, codes: [m.id], target: { hash: go('p', name, 'timeline', 'ms', m.id) } });
    }
  }
  return out;
}

/**
 * "Since you last looked" (AC82, J24): events newer than "last looked", newest first, at most the
 * last 7 days; the first four, then "<n> more since <time> ›". input: { events (every project's),
 * since (AC40's "last looked", or null), off (no record on the device, or storage failing), nowMs,
 * tz }. Commit lines are cut to three a pull request, then "<n> more on #<n>". Returns { off,
 * heading, time, lines, rest, more, none }.
 */
export function sinceView({ events, since, off, nowMs, tz }) {
  if (off || since == null || !Number.isFinite(since)) return { off: true, heading: HOME_WORDS.since, time: null, lines: [], rest: [], more: null, none: null };
  const floor = nowMs - SINCE_DAYS * 86400e3;
  const older = since < floor;
  const bound = Math.max(since, floor);
  const when = older ? HOME_WORDS.lastWeek : sinceWords(since, nowMs, tz);
  // Two events at the same time keep the records' order, newest first.
  const all = events.filter((e) => e.at > bound).sort((a, b) => b.at - a.at || (a.project === b.project ? b.seq - a.seq : 0));
  const list = [];
  const perPr = new Map();
  for (const e of all) {
    if (e.pr == null) {
      list.push(e);
      continue;
    }
    const k = `${e.project}#${e.pr}`;
    const n = (perPr.get(k) || 0) + 1;
    perPr.set(k, n);
    if (n <= COMMIT_LINES) list.push(e);
    if (n === COMMIT_LINES + 1) list.push({ ...e, id: `${e.project}|cmore|${e.pr}`, moreOf: k, icon: 'agents', codes: [`#${e.pr}`], words: null });
  }
  for (const e of list) if (e.moreOf) e.words = `${perPr.get(e.moreOf) - COMMIT_LINES} more on #${e.pr}`;
  const lines = list.slice(0, SINCE_LINES);
  const rest = list.slice(SINCE_LINES);
  return {
    off: false, heading: `${HOME_WORDS.since} · ${when}`, time: when, lines, rest,
    more: rest.length ? `${rest.length} more ${older ? HOME_WORDS.lastWeek : `since ${when}`} ›` : null,
    none: list.length ? null : `Nothing new since ${when}`,
  };
}

// ---------------------------------------------------------------------------
// The tiles (frame H5)

const PHASES = ['Discovery', 'Design', 'Build', 'Launch', 'Done'];
const ICON = { filled: 'check', light: 'pastcheck', gold: 'half', half: 'half', todo: 'planned', dashed: 'unrec' };
const STATE = { filled: 'done', light: 'gone', gold: 'now', half: 'now', todo: 'ahead', dashed: 'unrec' };

/**
 * The tile's phases as a timeline (AC82, frame H5; left to right, P-001-tile-direction.md, A): one
 * row per run, a cell for each of Discovery, Design, Build, Launch and Done, each phase's name once
 * under the rows (the now phase's in bold), each cell's icon, its line solid or dashed, a later run
 * dropping from the phase it went back to; and one sentence carrying it. `gatePhase`: the phase
 * whose gate card waits on the owner, or null (the vermilion ◆). Returns { tracked, rows, labels,
 * words } or { tracked: false, words }.
 */
export function tileTimeline(ctx, gatePhase = null) {
  const { project, pv } = ctx;
  if (project.model !== 'v3' || !ctx.tl || !pv || !pv.tracked) return { tracked: false, words: pv && pv.why ? pv.why : 'Phases not tracked' };
  const shape = branchShape(ctx);
  const runs = shape.cols;
  if (!runs) return { tracked: false, words: 'Phases: not recorded' };
  const rows = [];
  for (let k = 1; k <= runs; k++) {
    const cells = PHASES.map((phase) => {
      const d = shape.dots.find((x) => x.k === k && x.phase === phase);
      if (!d) return null;
      return { phase, cls: PHASE_CLASS[phase], icon: ICON[d.mark] || 'unrec', state: STATE[d.mark] || 'unrec' };
    });
    rows.push({ k, label: `run ${k}`, cells });
  }
  // The gate waiting on the owner, in the latest run: ◆ on its phase still ahead (or now).
  if (gatePhase) {
    const last = rows[rows.length - 1].cells;
    const c = last.find((x) => x && x.phase === gatePhase && (x.state === 'ahead' || x.state === 'now'));
    if (c) Object.assign(c, { icon: 'you', state: c.state === 'now' ? 'now' : 'ahead', gate: true });
  }
  // Each cell's halves (a line to its neighbours in the row), and each later run's drop from the run above.
  for (const r of rows) {
    r.cells.forEach((c, i) => {
      if (!c) return;
      c.l = i > 0 && Boolean(r.cells[i - 1]);
      c.r = i < r.cells.length - 1 && Boolean(r.cells[i + 1]);
    });
  }
  for (let i = 1; i < rows.length; i++) {
    const at = rows[i].cells.findIndex(Boolean);
    if (at < 0) continue;
    rows[i].up = at;
    rows[i - 1].down = at;
  }
  const nowPhase = ctx.now ? ctx.now.phase : pv.done ? 'Done' : null;
  const labels = PHASES.map((phase) => ({ phase, now: phase === nowPhase }));
  return { tracked: true, rows, labels, words: timelineWords(rows) };
}

/** The sentence that carries the drawing (AC82, as drawn: "Phases: Discovery finished; Design and Build run 1 gone back over; now Design run 2; Build, Launch and Done ahead"). */
export function timelineWords(rows) {
  const seen = new Map();
  for (const r of rows) for (const c of r.cells) if (c) seen.set(c.phase, (seen.get(c.phase) || 0) + 1);
  const multi = rows.length > 1;
  const q = (c, k) => (multi && seen.get(c.phase) > 1 ? `${c.phase} run ${k}` : c.phase);
  const parts = [];
  const ahead = [];
  // AC89 (k) (the Design reviewer's N4, stage 2 round 1): each phase named once — a phase still ahead in one run is
  // said where it last appears (a later run's gate, now or ahead), never "ahead" twice.
  const laterSaid = (ri, phase) => rows.slice(ri + 1).some((r) => r.cells.some((c) => c && c.phase === phase && (c.gate || c.state === 'now' || c.state === 'ahead')));
  for (const [ri, r] of rows.entries()) {
    let cur = null;
    const flush = () => {
      if (!cur) return;
      const names = cur.cells.map((c) => c.phase);
      const runWord = multi && cur.cells.some((c) => seen.get(c.phase) > 1) ? ` run ${r.k}` : '';
      if (cur.state === 'done') parts.push(`${joinAnd(names)}${runWord} finished`);
      else if (cur.state === 'gone') parts.push(`${joinAnd(names)}${runWord} gone back over`);
      else if (cur.state === 'unrec') parts.push(`${joinAnd(names)}${runWord} not recorded`);
      cur = null;
    };
    for (const c of r.cells) {
      if (!c) continue;
      if (c.gate) {
        flush();
        parts.push(`the ${c.phase} gate waits on you`);
        continue;
      }
      if (c.state === 'now') {
        flush();
        parts.push(`now ${q(c, r.k)}`);
        continue;
      }
      if (c.state === 'ahead') {
        flush();
        if (!laterSaid(ri, c.phase)) ahead.push(c.phase);
        continue;
      }
      if (cur && cur.state === c.state) cur.cells.push(c);
      else {
        flush();
        cur = { state: c.state, cells: [c] };
      }
    }
    flush();
    if (ahead.length) {
      parts.push(`${joinAnd(ahead)} ahead`);
      ahead.length = 0;
    }
  }
  return `Phases: ${parts.join('; ')}`;
}

/** A sprint file's id (J9): its name before the first `-` (`m1.4` from `m1.4-v3-build.md`), C. */
export const sprintId = (path) => String(path).replace(/^docs\/sprints\//, '').replace(/\.md$/, '').split('-')[0];

/**
 * A v2.5 project's strip (frame H5's operating-model tile): its sprint files in place of phases (J9),
 * one cell each, closed ones checked, the open one half-filled, at most the last four (C).
 */
export function sprintStrip(snap) {
  const tree = (snap && snap.tree) || null;
  if (!tree) return { tracked: false, words: 'Sprints: not read yet' };
  const paths = [...tree.keys()].filter((p) => /^docs\/sprints\/[^/]+\.md$/.test(p) && !/\/(PROGRESS|SPRINT_PLAN)\.md$/.test(p)).sort();
  if (!paths.length) return { tracked: false, words: 'Sprints: none found' };
  const last = paths.slice(-4);
  const cells = last.map((p) => {
    const rec = snap.records ? snap.records.get(p) : undefined;
    const id = sprintId(p);
    if (!rec) return { phase: id, id, icon: 'unrec', state: 'unrec' };
    return rec.open ? { phase: id, id, icon: 'half', state: 'now' } : { phase: id, id, icon: 'check', state: 'done' };
  });
  cells.forEach((c, i) => { c.l = i > 0; c.r = i < cells.length - 1; c.cls = null; });
  const open = cells.filter((c) => c.state === 'now');
  const closed = cells.filter((c) => c.state === 'done');
  const unread = cells.filter((c) => c.state === 'unrec');
  const words = [closed.length ? `${joinAnd(closed.map((c) => c.id))} closed` : null, open.length ? `${joinAnd(open.map((c) => c.id))} open` : null,
    unread.length ? `${joinAnd(unread.map((c) => c.id))} not read yet` : null].filter(Boolean).join('; ');
  return { tracked: true, sprints: true, rows: [{ k: 1, label: 'sprints', cells }], labels: cells.map((c) => ({ phase: c.id, now: c.state === 'now' })),
    words: `Sprints: ${words}`, open: open.length === 1 ? open[0].id : null };
}

/**
 * The tile's "Now:" line (AC82, frame H5): "Now: <phase>, run <k>", then why that run began, quoted
 * from its record (AC70), or "went back on <date>, why not recorded" (with no dated line, AC70's own
 * "why it went back: not recorded"); nothing after it in a first run. Returns { lead, rest }.
 */
export function nowLine(ctx, tz) {
  const { project, pv } = ctx;
  if (project.model !== 'v3') return null;
  if (!ctx.tl || !pv || !pv.tracked) return { lead: `Now: ${NOT_RECORDED}`, rest: pv && pv.why ? pv.why : null };
  if (pv.done) return { lead: 'Now: Done', rest: null };
  const now = ctx.now;
  if (!now) return { lead: `Now: ${NOT_RECORDED}`, rest: null };
  const k = ctx.cols.k.get(now);
  const lead = `Now: ${now.phase}, run ${k}`;
  // Why this run's column began: the first run of the now column (AC70).
  const first = ctx.cols.runs.find((r) => ctx.cols.k.get(r) === k);
  if (!(k > 1) || !first) return { lead, rest: null };
  const b = runBegan(ctx, first, tz);
  if (b && b.quote) return { lead, rest: `“${b.quote}”`, source: b.source };
  if (b && b.plain) return { lead, rest: b.plain, source: b.source };
  if (b && b.reading) return { lead, rest: b.words };
  // No record gives why (AC70): with the run's first routed line, its date in the frame's form; a run the
  // model builds from the plan's order alone has no line, so no date either: AC70's own words.
  const t = first.routed && first.routed.length ? ms(first.routed[0][1].time) : NaN;
  return { lead, rest: Number.isFinite(t) ? `went back on ${dayWords(t, tz)}, why not recorded` : 'why it went back: not recorded', missing: true };
}

/**
 * AC90's Home part (P-001-audit-repeat.md, A; AC82, changed): "why it went back: not recorded" shared by two or more
 * tiles of one group is said once at the group's head, "<k> projects · why their run went back: not recorded" ("<k> of
 * <n> projects · …" when it covers only some of the group's tiles, AC90's rule), and each such tile's Now line keeps only
 * its own "went back on <date>" where its record gives the date.
 */
export const WHY_BACK_ONCE = (k, n) => `${k === n ? `${n} projects` : `${k} of ${n} projects`} · why their run went back: not recorded`;
/** A Now line (nowLine's) less the reason its group's head says once: its own "went back on <date>", or nothing. */
export function nowOwnPart(nl) {
  if (!nl || !nl.missing) return nl;
  const m = /^(went back on .+), why not recorded$/.exec(String(nl.rest || ''));
  return { ...nl, rest: m ? m[1] : null, once: true };
}

/**
 * The tile's "At work" line (AC82; AC49's who has the ball, in a line): "At work: <role> on <its
 * item>", each working member joined by ", "; else "No agent run recorded since <date>" from the
 * dispatch log's latest line (J9); a v2.5 project, "No dispatch log: not used here".
 */
export function atWorkLine(project, model, ball, j, tz) {
  if (project.model !== 'v3') return HOME_WORDS.noDispatchLog;
  const working = [];
  for (const i of (model && model.items) || []) if (i.state === 'dispatched') working.push(`${i.running && i.running.role ? memberLabel(i.running.role) : NOT_RECORDED} on ${i.id}`);
  if ((ball || []).some((b) => b.who === 'cos')) working.push('Chief of Staff working');
  if (working.length) return `At work: ${working.join(', ')}`;
  const rows = j && j.ready ? j.logRows : (model && model.allEntries) || [];
  const times = rows.map((o) => ms(o && o.time)).filter(Number.isFinite);
  if (!times.length) return 'No agent run recorded';
  return `No agent run recorded since ${dayWords(Math.max(...times), tz)}`;
}

/**
 * The tile's "Next:" line (AC82): the first milestone not reached in the owner's order with its
 * rough finish (AC24's), "no estimate yet" without one; the ◆ and "<the gate>, after your ruling"
 * while a gate card waits; a v2.5 project's open sprint. Returns { icon, lead: 'Next:', words }.
 */
export function nextLine(project, { gate, row, sprint, docRead, unknown = false }) {
  if (gate) return { icon: 'you', words: `the ${gate} gate, after your ruling` };
  if (project.model !== 'v3') return { icon: 'half', words: sprint ? `sprint ${sprint} · no estimate filed` : 'no open sprint · no estimate filed' };
  // Work ahead's view not built (`unknown`): which milestone comes next isn't known, not "none left".
  if (!row && unknown) return { icon: 'half', words: WA.notAvailable };
  if (!row) return { icon: 'half', words: docRead ? 'no milestone left to reach' : NOT_RECORDED };
  const f = row.finish;
  // AC89 (k): " · may be out of date", or " · a newer estimate line could not be read", where J14 says so of the
  // estimate the finish comes from (the row's own, as Plan's row marks it).
  const est = row.estimate || {};
  const stale = est.newer ? ` · ${WA.newerUnreadable}` : est.stale ? ` · ${WA.mayBeOld}` : '';
  if (f && !f.na && f.words) return { icon: 'half', words: `${row.code} · rough finish ${f.words}${stale}` };
  // "no estimate yet" only where none is filed for it (the Reviewer's B1, stage 2 round 1). Where AC24
  // marks the finish not available for another cause (past its estimate, or an earlier milestone in the
  // order with none), its own words, as Plan shows them; with the estimates read failed, AC24 gives no
  // finish at all: "not available", with no cause to name.
  if (est.kind === 'missing') return { icon: 'half', words: `${row.code} · no estimate yet` };
  // AC89 (k): "<id> · rough finish not available: <AC24's reason, its own code left out>", so the tile names its own
  // code once ("MD1 · rough finish not available: past its estimate"); a reason naming another milestone names it, and
  // another project's as "<project>'s <code>", as Plan's row beside it does (the Design reviewer's B-new, stage 2 round 2).
  if (f && f.na && f.stop) {
    const other = f.stop.project && f.stop.project !== project.name;
    const why = other ? `${f.stop.project}'s ${f.stop.code} ${f.stop.why}`
      : f.stop.code !== row.code ? `${f.stop.code} ${f.stop.why}` : f.stop.why.replace(/^(is|has) /, '');
    return { icon: 'half', words: `${row.code} · rough finish ${WA.notAvailable}: ${why}${stale}` };
  }
  if (f && f.na && f.words) return { icon: 'half', words: `${row.code} · rough finish ${f.words}${stale}` };
  return { icon: 'half', words: `${row.code} · rough finish: ${WA.notAvailable}` };
}

/**
 * A tile whose project's records the page doesn't hold (its first read still "Checking…", or none ever
 * read and now "Can't read"): its "Now", "At work" and "Next" lines say "not available", the desk's word
 * for records it couldn't read (Status's "not available yet"), not "not recorded", which says the records
 * were read and hold nothing (the Design reviewer's N2, stage 2 round 1). A v2.5 project's "No dispatch
 * log: not used here" is the model's, read or not, so it stays.
 */
export function unreadLines(project) {
  return { now: { lead: `Now: ${WA.notAvailable}`, rest: null }, work: project.model === 'v3' ? `At work: ${WA.notAvailable}` : HOME_WORDS.noDispatchLog,
    next: { icon: 'unrec', words: WA.notAvailable } };
}

/**
 * "◆ <n> wait on you" (one: "◆ 1 waits on you"), counted as the board counts the project's cards; else "Nothing
 * waiting", "Checking…", or, for a project whose read fails (after the glance audit, AC91 (c)), "✕ Can't read since
 * HH:MM" in `--bad` (`bad`), "✕ Can't read" where no time is held. `since`: the failure's time as "HH:MM", or null.
 * With cards waiting the corner keeps what waits, and the failure is said at the tile's foot (tileFoot).
 */
export function tileWaits(n, read, since = null) {
  if (n > 0) return { you: true, bad: false, words: `${n} ${n === 1 ? 'waits' : 'wait'} on you` };
  if (read === 'cant-read') return { you: false, bad: true, words: since ? `${HOME_WORDS.cantRead} since ${since}` : HOME_WORDS.cantRead };
  if (read !== 'ok') return { you: false, bad: false, words: HOME_WORDS.checking };
  return { you: false, bad: false, words: HOME_WORDS.nothingWaiting };
}

/**
 * The tile's foot line for a project whose read fails (AC91 (c); AC5's reason in `reason`), saying the time once:
 * beside a corner that says "Can't read since HH:MM" or "Can't read", "Reason: <reason>" in grey (`bad` false);
 * beside a corner that says what waits, "✕ Can't read since HH:MM: <reason>", or "✕ Can't read: <reason>" with no
 * time held, in `--bad`, so the failure is always on the tile. Null when the read doesn't fail or no reason is held.
 */
export function tileFoot(n, read, since, reason) {
  if (read !== 'cant-read' || !reason) return null;
  if (n > 0) return { bad: true, words: `${HOME_WORDS.cantRead}${since ? ` since ${since}` : ''}: ${reason}` };
  return { bad: false, words: `Reason: ${reason}` };
}

/**
 * "At work:" and its value (AC91 (d); P-001-glance-at-work.md, A): for a line naming who is at work, the label
 * stays grey and the value, each "<role> on <its item>" joined by ", ", is in ink, as the Next line's is. Null for
 * the lines that stay wholly grey: "No agent run recorded since <date>", "At work: not available" and "No dispatch
 * log: not used here".
 */
export function atWorkParts(line) {
  const m = /^At work: (.+)$/.exec(String(line || ''));
  if (!m || m[1] === WA.notAvailable) return null;
  return { label: 'At work:', value: m[1] };
}

/**
 * "Since you last looked"'s empty line while any connected project can't be read (AC91 (c); signed out included):
 * "Not read since HH:MM", the earliest "since" among those projects (AC5; AC89 (a)'s rule for the 3-minute cause), or
 * "Not read in this opening" where one of them has had no read succeed in this opening (AC89 (a)'s state 2 words,
 * C: its lines since "last looked" are all missing, so no time would be true for it). Never "Nothing new since
 * <time>", which would read as quiet (the rulebook's part A item 4). reads: [{ read, succeeded }]; null when every
 * project can be read.
 */
export function sinceUnreadWords(reads, tz) {
  const cant = (reads || []).filter((r) => r && r.read && r.read.read === 'cant-read');
  if (!cant.length) return null;
  if (cant.some((r) => !r.succeeded)) return 'Not read in this opening';
  const times = cant.map((r) => r.read.since).filter((x) => x != null && Number.isFinite(x));
  return times.length ? `Not read since ${hhmm(new Date(Math.min(...times)), tz)}` : 'Not read in this opening';
}
