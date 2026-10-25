// The portfolio's block at Home's foot (spec S-001, AC87; desk mockup v2, frame H4): "Across your projects ·
// read only": the projects in Build or Launch against the cap, the decisions in the portfolio's queue, the
// scorecard, each project's model version against the latest (J23's version reads, built in stage 3,
// src/lib/versions.js), and the portfolio's rarer records. Stage 6a built it from what the desk reads
// without the portfolio; from stage 6b (J23's portfolio read, once the owner has done Setup P1 and J7 names
// `portfolio`) the portfolio's parts show what it holds: the decisions in its queue (each a card on the
// board, under "Portfolio"), its idea log (Plan's "Ideas · from the portfolio") and its rarer records by
// name. With no `portfolio` in J7, every portfolio part still reads 6a's words. Pure: from each project's
// entry as the page holds it and the portfolio as last read (the reader's `desk.portfolio()`), words out;
// no network, no DOM, no storage. Nothing here can change the portfolio.

import { readOf, versionWords, MODEL_VERSION_PATH, ROOT_VERSION_PATH, NOT_RECORDED, NOT_AVAILABLE } from './versions.js';
import { WA } from './workahead.js';
import { parseCard, firstMilestoneLine, milestoneValue } from './records.js';
import { hhmm } from './timefmt.js';

/** The block's rows, in frame H4's order; each opens a sheet over Home at `#/pf/<key>`. */
export const PF_ROWS = Object.freeze(['cap', 'decisions', 'scorecard', 'versions', 'rare']);

/** AC87's words, 6a's where 6a and 6b differ (specs/S-001.md:7101-7130). */
export const PF_WORDS = Object.freeze({
  head: 'Across your projects · read only',
  mono: 'portfolio',
  cap: 'The cap on work at once',
  inBuild: 'In Build or Launch',
  none: 'none',
  capNoRecord: 'your cap: no record for this in the model yet',
  decisions: 'Decisions across projects',
  // The same words as Plan's "Ideas · from the portfolio" before 6b (AC86, AC87).
  notRead: WA.ideasNotRead,
  scorecard: 'Scorecard',
  targets: 'Targets: no record for this in the model yet',
  time: 'your time across projects: not recorded yet',
  versions: 'Model versions',
  rare: 'Rulings, standing intent, library facts, track records',
  rareNotRead: "Rarely needed · not read yet: your portfolio isn't connected",
  foot: "The desk will read your portfolio repository and never change it, once you add it to the desk's read access (your ruling, P-001-portfolio-read).",
  // The sheets' own lines (C: each restates a row's record or its reason, no new fact).
  capCounted: 'counted',
  capNotCounted: 'not counted',
  capModelOpen: 'The model leaves its number open.',
  capResearch: 'Research sub-projects are not counted: no record marks one.',
  capV25: 'older pipeline: sprints, not phases',
  capDone: 'Done',
  // Its file paths are drawn in Plex Mono (the page's code form): [words, path, words, path, words].
  versionsFrom: Object.freeze(['Each project\'s version is its ', 'governance/OPERATING_MODEL_VERSION', '; the latest is the root ', 'VERSION', ' of the project that publishes the model.']),
  noPublisher: 'No connected project is marked as publishing the model, so the latest is not recorded.',
  waitsOnP1: 'It waits on Setup P1: you add the portfolio repository to the desk\'s read access, read only.',
  // From stage 6b (J23's portfolio read; specs/S-001.md:7100-7140, :11425-11455).
  noneQueued: "None in the portfolio's queue",
  queued: (n) => `${n} in the portfolio's queue`,
  queuedWhere: 'waiting on Waiting, under "Portfolio"',
  rareRead: 'Rarely needed',
  footRead: 'The desk reads your portfolio repository and never changes it (your ruling, P-001-portfolio-read). Ideas are in Plan.',
  cantAccess: "Can't read your portfolio: the desk's read access doesn't include it",
  setupP1: 'Setup P1',
  setupP1Line: "Setup P1: add the portfolio repository to the desk's read token, with read permissions only.",
  cantSince: (t) => `Can't read your portfolio since ${t}`,
  cantNoTime: "Can't read your portfolio",
  checking: 'Checking…',
  treeTooLarge: "not read: the portfolio's tree was too large",
  tooLarge: 'too large to read',
  notReadYet: 'not read yet',
  noIdeas: 'No ideas in the log yet',
  stateNotRecorded: 'state not recorded',
  dateNotRecorded: 'date not recorded',
  phoneNote: "Your phone isn't told about portfolio cards yet",
  noAnswerLink: 'The desk offers no answer link for a portfolio card: you answer it in the portfolio, on GitHub.',
  whatItIs: "A decision card in your portfolio's queue:",
  eachWaits: 'Each card waits on Waiting, under "Portfolio", while its file is in the queue.',
  rulings: 'Rulings',
  facts: 'Library facts',
  intent: 'Standing intent',
  // J23, changed after MD3: the model template's own intent file, whose words a read of names alone can't judge.
  intentFile: 'intent/PORTFOLIO-INTENT.md',
  wordsNotRead: '(its words not read)',
  noneYet: 'none yet',
  trackRecords: 'Track records: no record for this in the model yet',
  ideaMoved: (state, name) => `An idea moved to ${state}: ${name}`,
  readFrom: (repo) => `Read from ${repo}, read only.`,
});

/** J23's state words: they follow a colon ("latest: not recorded"), where a version follows a space ("latest 3.5.0"). */
const isState = (w) => w === NOT_RECORDED || w === NOT_AVAILABLE || /^can't be (read|shown)\b/.test(w);
const after = (w) => (isState(w) ? `: ${w}` : ` ${w}`);

// ---------------------------------------------------------------------------
// The cap on work at once (AC87; AC50's now phase)

/**
 * Why a v3 project's phase isn't known, in the words of its read state, the one Home's tile takes
 * (public/sandbox.js, readStateOf; AC5): a read refused or failed, "can't be read since HH:MM" (or
 * "can't be read" with no time; from G8c, "can't be read in this opening" where no read of it has
 * succeeded in this opening); the first read still pending, "not read yet"; read, but no now run,
 * "not recorded". From stage G8d (AC91 (c); the owner's "Say "can't be shown" (Recommended)"), a project the desk can
 * read but can't draw, "can't be shown", with no time. `read`: { state: 'ok' | 'checking' | 'cant-read' | 'cant-show'
 * (G8d: its box's `drawError`, its read not failing), since: 'HH:MM' | null, opening: whether no read of it has succeeded
 * in this opening (as the tile's corner takes it) }, or absent.
 */
function unknownWhy(pv, error, read) {
  if (read && read.state === 'cant-show') return CANT_SHOWN;
  if (error || (read && read.state === 'cant-read')) return cantWords(read);
  if (read ? read.state === 'checking' : pv && pv.why === 'Phases: reading…') return 'not read yet';
  return NOT_RECORDED;
}

/**
 * "can't be read since HH:MM" (or "can't be read" with no time), the cap's and the versions row's words alike (AC89 (h));
 * from stage G8c (AC91 (c); P-001-glance-opening-wording.md, B), "can't be read in this opening" for a project no read of
 * which has succeeded in this opening (`read.opening`), with or without a time held, as the tile's corner says it.
 */
const cantWords = (read) => (read && read.opening ? "can't be read in this opening" : read && read.since ? `can't be read since ${read.since}` : "can't be read");
/** From stage G8d (AC91 (c), AC89 (h)): the cap's, its sheet's and the versions row's words for a project the desk can read but can't draw. */
export const CANT_SHOWN = "can't be shown";
/**
 * The words for a project read earlier in this opening and now refused or failing (AC89 (h)), or, from G8d, one the desk
 * can read but can't draw ("can't be shown"), else null.
 */
const nowCant = (read) => (read && read.state === 'cant-read' ? cantWords(read) : read && read.state === 'cant-show' ? CANT_SHOWN : null);

/**
 * Where a project stands for the cap (AC87): each connected v3 project whose now phase (AC50) is Build
 * or Launch is counted, from its records as last read, as its tile draws them. A Done project, or one in
 * Discovery or Design, is not; a v2.5 project has no phases; a v3 project whose phase the desk can't give
 * is named with why (unknownWhy), never left out silently (C: "none" would otherwise claim what no record
 * says). Returns { name, v3, phase, counted, why }.
 */
export function capEntry({ project, pv, error, read }) {
  const name = project.name;
  if (project.model !== 'v3') return { name, v3: false, phase: null, counted: false, why: PF_WORDS.capV25 };
  if (error || !pv || !pv.tracked) return { name, v3: true, phase: null, counted: false, why: unknownWhy(pv, error, read) };
  // AC89 (h) (stage 6a's design round 2, N7): a project read and then refused keeps its last-read phase, with
  // " · can't be read since HH:MM" after its name (`stale`).
  const stale = nowCant(read);
  if (pv.done) return { name, v3: true, phase: 'Done', counted: false, why: null, stale };
  const now = pv.nowRun;
  // Records read, no now run in them: "not recorded", as the tile's "Now: not recorded".
  if (!now) return { name, v3: true, phase: null, counted: false, why: NOT_RECORDED, stale };
  return { name, v3: true, phase: now.phase, counted: now.phase === 'Build' || now.phase === 'Launch', why: null, stale };
}

/**
 * The cap's row (AC87): "In Build or Launch: <names>" or "none"; "<project>'s phase: <why>" for each v3
 * project whose phase isn't known; then "your cap: no record for this in the model yet" with the
 * slashed circle. Returns { entries, parts: [{ text, mark }] }, the parts joined by " · ".
 */
export function capView(entries) {
  const all = entries.map(capEntry);
  const named = (e) => (e.stale ? `${e.name} · ${e.stale}` : e.name);
  const counted = all.filter((e) => e.counted).map(named);
  const parts = [{ text: `${PF_WORDS.inBuild}: ${counted.length ? counted.join(', ') : PF_WORDS.none}`, mark: null }];
  for (const e of all) if (e.v3 && e.why) parts.push({ text: `${e.name}'s phase: ${e.why}${e.stale ? ` · ${e.stale}` : ''}`, mark: null });
  // A project not counted, read earlier and now refused, is still named, so the cap never leaves out silently that it
  // can't say where that project is now.
  for (const e of all) if (e.v3 && !e.why && !e.counted && e.stale) parts.push({ text: named(e), mark: null });
  parts.push({ text: PF_WORDS.capNoRecord, mark: 'nomodel' });
  return { entries: all, parts };
}

// ---------------------------------------------------------------------------
// Model versions (AC87; J23's version reads)

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const nums = (v) => SEMVER.exec(v).slice(1).map(Number);
const plural = (k, one, many) => `${k} ${k === 1 ? one : many}`;

/**
 * How far a version is behind the latest (AC87): null when it isn't lower; "<k> behind" counted in
 * minor releases within the same major; a lower patch in the same minor, "<k> patch release(s)
 * behind"; a lower major, "<k> major release(s) behind" (C: AC87 counts minors within a major and
 * says nothing of the other two). Both must be three whole numbers.
 */
export function behindWords(version, latest) {
  if (!SEMVER.test(version || '') || !SEMVER.test(latest || '')) return null;
  const [a, b, c] = nums(version);
  const [x, y, z] = nums(latest);
  if (a < x) return `${plural(x - a, 'major release', 'major releases')} behind`;
  if (a > x) return null;
  if (b < y) return `${y - b} behind`;
  if (b > y) return null;
  if (c < z) return `${plural(z - c, 'patch release', 'patch releases')} behind`;
  return null;
}

/** A version record compared with the latest (J23): its words, then ", <k> behind" where it is lower. */
function comparedWords(rec, latestRec) {
  const words = versionWords(rec);
  if (!rec || !rec.compared || !latestRec || !latestRec.compared) return words;
  const b = behindWords(rec.version, latestRec.version);
  return b ? `${words}, ${b}` : words;
}

/** One of J23's reads in words, with its record when read: { words, rec }. */
function versionRead(snap, path) {
  const r = readOf(snap, path);
  if (r.state === 'absent') return { words: NOT_RECORDED, rec: null };
  if (r.state === 'pending') return { words: NOT_AVAILABLE, rec: null };
  return { words: versionWords(r.rec), rec: r.rec };
}

/**
 * The model versions row (AC87): title "Model versions · latest <v>" ("latest: not recorded" with no
 * project marked `publishesModel` or no VERSION file); each connected project "<project> <version>"
 * from its governance/OPERATING_MODEL_VERSION, "<version>, <k> behind" where lower than the latest,
 * "<project>: not recorded" where the file is missing; and the project J7 marks `publishesModel`
 * "<project> runs the v2.5 pipeline, publishes <its VERSION>" (a v3 one, "<project> <version>,
 * publishes <its VERSION>"). Returns { title, latest, publisher, rows: [{ name, words, own }], line }.
 */
export function versionsView(entries) {
  const pub = entries.find((e) => e.project.publishesModel === true) || null;
  const latest = pub ? versionRead(pub.snap, ROOT_VERSION_PATH) : { words: NOT_RECORDED, rec: null };
  const rows = entries.map(({ project, snap, read }) => {
    const own = versionRead(snap, MODEL_VERSION_PATH);
    // AC89 (h): a project that can't be read says "can't be read since HH:MM", as the cap does: in place of "not
    // available" when it was never read, and after its last-read version when it was read and is now refused; from G8d,
    // one the desk can read but can't draw says "can't be shown" in the same places.
    const cant = nowCant(read);
    const ownWords = own.rec ? comparedWords(own.rec, latest.rec) : cant && own.words === NOT_AVAILABLE ? cant : own.words;
    let words;
    if (pub && project === pub.project) {
      words = project.model === 'v3' ? `${project.name}${after(ownWords)}, publishes${after(latest.words)}` : `${project.name} runs the v2.5 pipeline, publishes${after(latest.words)}`;
    } else words = `${project.name}${after(ownWords)}`;
    if (cant && ownWords !== cant) words = `${words} · ${cant}`;
    return { name: project.name, words, own: ownWords };
  });
  return { title: `${PF_WORDS.versions} · latest${after(latest.words)}`, latest: latest.words, publisher: pub ? pub.project.name : null, rows, line: rows.map((r) => r.words).join(' · ') };
}


// ---------------------------------------------------------------------------
// The portfolio's read (stage 6b; J23, "The portfolio's part"): what the page takes from it

/** Its paths (J23): the idea log; the queue's files (each directly under `queue/` whose name does not start with `_`); the rarer records' folders, by name from the tree only. */
export const IDEAS_PATH = 'ideas/IDEAS.md';
// J23, changed after MD3 (AC89 (l)): a card is a Markdown file (`.md`) directly under `queue/` whose name does not start
// with `_` and is not `README.md`; a `.gitkeep`, or any other file, is never a card.
export const QUEUE_FILE_RE = /^queue\/((?!README\.md$)[^/_][^/]*\.md)$/;
export const RARE_DIRS = Object.freeze({ rulings: 'rulings/', facts: 'library/facts/', intent: 'intent/' });
/** The idea log's states, in the model's portfolio template's order (J23; inventory §5). */
export const IDEA_STATES = Object.freeze(['captured', 'shaping', 'approved', 're-aimed', 'stopped']);
/** GitHub's contents limit (1 MB): a blob the tree gives as larger is not asked for, its row "too large to read" (J23's awkward cases). */
export const PORTFOLIO_BLOB_MAX = 1_000_000;
/** Quiet's portfolio rule (Terms; AC87): read successfully within the last 6 minutes (its read every 5, and one minute's grace). */
export const PORTFOLIO_QUIET_MS = 6 * 60_000;
/** The board's group for the portfolio's cards (AC87: "a group of its own named "Portfolio""): its key can never be a project's name (J7's names are plain). */
export const PF_BOARD = ':portfolio';
export const PF_LABEL = 'Portfolio';

/** The record kind of a portfolio path the page reads (J23), or null: the idea log, or a card in the queue. */
export function portfolioKind(path) {
  if (path === IDEAS_PATH) return 'pf-ideas';
  if (QUEUE_FILE_RE.test(path)) return 'pf-card';
  return null;
}

const DATE_RE = /\b(\d{4}-\d{2}-\d{2})\b/;
// The template's own example heading (its placeholders), never an idea: `<…>`, or `YYYY-MM-DD` (C).
const TEMPLATE_HEADING = /<[^>]*>|YYYY-MM-DD/i;

/**
 * The idea log (J23): each level-2 heading is an idea, holding its date and name; its state is the first
 * line under it, before the next heading, that starts `state:`, its value one of IDEA_STATES (backquotes
 * and case aside); any other value, or no such line, "state not recorded". A heading repeated is two ideas
 * (both shown); the template's own heading is none. Returns { ideas: [{ key, heading, date, name, state,
 * at }] } in the file's order (`at`: its place, for "newest first" among ideas of one date).
 */
export function parseIdeas(text) {
  const lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
  const ideas = [];
  const seen = new Map();
  let cur = null;
  for (const line of lines) {
    const h2 = /^## +(.+?)\s*#*\s*$/.exec(line);
    if (h2) {
      const heading = h2[1].trim();
      if (TEMPLATE_HEADING.test(heading)) {
        cur = null;
        continue;
      }
      const n = (seen.get(heading) || 0) + 1;
      seen.set(heading, n);
      const d = DATE_RE.exec(heading);
      const name = (d ? heading.replace(d[0], '') : heading).replace(/^[\s·:|—–-]+|[\s·:|—–-]+$/g, '').trim() || heading;
      cur = { key: `${heading}#${n}`, heading, date: d ? d[1] : null, name, state: null, at: ideas.length };
      ideas.push(cur);
      continue;
    }
    if (/^#{1,2} /.test(line)) {
      cur = null;
      continue;
    }
    if (cur && cur.state === null && /^state:/.test(line)) {
      const v = line.slice('state:'.length).trim().replace(/^`+|`+$/g, '').trim().toLowerCase();
      cur.state = IDEA_STATES.includes(v) ? v : false;
    }
  }
  for (const i of ideas) if (!i.state) i.state = null;
  return { ideas };
}

/**
 * J2's note for a card with no `answer:` line. A portfolio card has none: the model's portfolio template
 * writes no answer form, and J23 reads none ("No answer path is read or built", C), so it is no parse problem.
 */
export const NO_ANSWER_NOTE = 'no answer path on the "answer:" line';

/**
 * A portfolio record parsed by its kind (J23): the idea log, or a card read as J2 reads a card's sections
 * (`## 1. The decision`, `## 4. Options` and the rest) and its `Milestone:` line when it has one (its first
 * column-0 one: a portfolio card has no `answer:` line for it to follow). `problems`: what can't be read as
 * a card (no decision, no options), never the missing answer path.
 */
export function parsePortfolioRecord(kind, text) {
  if (kind === 'pf-ideas') return parseIdeas(text);
  if (kind === 'pf-card') {
    const c = parseCard(text);
    const line = firstMilestoneLine(text);
    return { text: String(text == null ? '' : text), ...c, problems: c.notes.filter((n) => n !== NO_ANSWER_NOTE), milestoneLine: line, milestone: milestoneValue(line) };
  }
  return null;
}

/** A portfolio card's milestone for its sheet's head: its ids, or null (none recorded, or `none (<why>)`). */
export const cardMilestone = (rec) => (rec && rec.milestone && Array.isArray(rec.milestone.ids) && rec.milestone.ids.length ? rec.milestone.ids.join(', ') : null);

/** A file's page on GitHub (the card's "Open ↗"), at the portfolio's default branch. */
export function portfolioLink(pf, path) {
  return `https://github.com/${pf.repo}/blob/${encodeURIComponent(pf.defaultBranch)}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

/**
 * The portfolio as last read, in the words the page draws (J23, AC87). snap: the reader's
 * `desk.portfolio()` ({ repo, defaultBranch, tree: Map | null, truncated, records: Map(path → parsed),
 * lastSuccessAt, failure: { kind: 'access' | 'other', since } | null, readAt }), or null with no `portfolio`
 * in J7 (6a). Returns null for 6a, else { state: 'pending' | 'ok' | 'access' | 'failing' | 'truncated',
 * problem (the words for a read that isn't current, or null), ideas, cards, rare, fresh, quietWords }.
 */
export function portfolioRead(snap, nowMs, tz) {
  if (!snap) return null;
  const tree = snap.tree || null;
  const f = snap.failure || null;
  const time = (ms) => (Number.isFinite(ms) ? hhmm(new Date(ms), tz) : null);
  let state = 'ok';
  if (f && f.kind === 'access') state = 'access';
  else if (snap.truncated && (!f || f.reason === 'too-many')) state = 'truncated';
  else if (f) state = 'failing';
  else if (!tree) state = 'pending';
  const sinceWords = f && time(f.since) ? PF_WORDS.cantSince(time(f.since)) : PF_WORDS.cantNoTime;
  const problem = state === 'access' ? `${PF_WORDS.cantAccess} (${PF_WORDS.setupP1})` : state === 'failing' ? sinceWords
    : state === 'truncated' ? PF_WORDS.treeTooLarge : state === 'pending' ? PF_WORDS.checking : null;
  const records = snap.records || new Map();
  const blobState = (path) => {
    const e = tree ? tree.get(path) : null;
    if (!e) return { state: 'absent' };
    if (Number.isFinite(e.size) && e.size > PORTFOLIO_BLOB_MAX) return { state: 'too-large' };
    if (!records.has(path)) return { state: 'pending' };
    return { state: 'read', rec: records.get(path) };
  };
  // The idea log.
  let ideas;
  if (!tree || snap.truncated) ideas = { state: 'unread', list: [], words: snap.truncated ? PF_WORDS.treeTooLarge : problem };
  else {
    const b = blobState(IDEAS_PATH);
    if (b.state === 'absent') ideas = { state: 'none', list: [], words: PF_WORDS.noIdeas };
    else if (b.state === 'too-large') ideas = { state: 'too-large', list: [], words: `${IDEAS_PATH}: ${PF_WORDS.tooLarge}` };
    else if (b.state === 'pending') ideas = { state: 'pending', list: [], words: `${IDEAS_PATH}: ${PF_WORDS.notReadYet}` };
    else {
      const list = ideasNewestFirst((b.rec && b.rec.ideas) || []);
      ideas = { state: list.length ? 'ok' : 'none', list, words: list.length ? null : PF_WORDS.noIdeas };
    }
  }
  // The queue: each file not starting with `_`, a card waiting on the owner while it is there.
  const cards = [];
  if (tree && !snap.truncated) {
    for (const [path, e] of tree) {
      const m = QUEUE_FILE_RE.exec(path);
      if (!m) continue;
      const b = blobState(path);
      const rec = b.state === 'read' ? b.rec : null;
      const notes = rec && Array.isArray(rec.problems) ? rec.problems : [];
      cards.push({ path, file: m[1], sha: e.sha, rec, state: b.state, cantParse: rec && notes.length ? notes.join('; ') : null,
        link: portfolioLink(snap, path) });
    }
    cards.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  }
  const fresh = snap.lastSuccessAt != null && nowMs - snap.lastSuccessAt <= PORTFOLIO_QUIET_MS && !snap.truncated;
  // Quiet's words when the portfolio isn't read within its 6 minutes (AC87, AC82): for an actual failure,
  // the access words with Setup P1 named, or "Can't read your portfolio since HH:MM" (the failure's start).
  // With no failure (a read due or under way: back from the background, or a first read still filling in
  // its blobs) there are none, and Home says "Checking…" as it does for a project (`checking`): never quiet,
  // never "Can't read".
  let quietWords = null;
  if (!fresh && f) quietWords = state === 'access' ? problem : time(f.since) ? PF_WORDS.cantSince(time(f.since)) : PF_WORDS.cantNoTime;
  return { state, problem, ideas, cards, rare: tree && !snap.truncated ? rareView(tree) : null, fresh,
    pending: state === 'pending', checking: !fresh && !quietWords, quietWords, repo: snap.repo, defaultBranch: snap.defaultBranch, lastSuccessAt: snap.lastSuccessAt };
}

/** Ideas newest first (AC87): by their date, latest first; one with no date last; ideas of one date, the later in the file first (C). */
export function ideasNewestFirst(list) {
  return [...list].sort((a, b) => {
    if (a.date && b.date && a.date !== b.date) return a.date < b.date ? 1 : -1;
    if (Boolean(a.date) !== Boolean(b.date)) return a.date ? -1 : 1;
    return b.at - a.at;
  });
}

/** An idea's state in words (AC87): the state, or "state not recorded". */
export const ideaStateWords = (i) => i.state || PF_WORDS.stateNotRecorded;

/**
 * The rarer records (J23: names and counts only, no blob): the files under `rulings/` and `library/facts/`
 * by name and count, "none yet" where a folder holds only its README (or nothing), and `library/facts/_TEMPLATE.md`,
 * the model template's file, never a fact (J23, changed after MD3, specs/S-001.md:12335-12337: that one file, no other);
 * and whether `intent/` holds a file beyond its template's (C, as built in stage 6b: a name starting `_`, the portfolio
 * template's form for its templates, as the queue's `_DECISION_CARD.md`, or its README).
 */
export const FACTS_TEMPLATE = '_TEMPLATE.md';
export function rareView(tree) {
  const under = (dir) => [...tree.keys()].filter((p) => p.startsWith(dir) && p.length > dir.length).map((p) => p.slice(dir.length)).sort();
  const notReadme = (n) => n !== 'README.md';
  const notTemplate = (n) => !n.split('/').pop().startsWith('_');
  const rulings = under(RARE_DIRS.rulings).filter(notReadme);
  // J23, changed after MD3 (AC89 (l)): `library/facts/_TEMPLATE.md` is the model template's file, not a fact; every
  // other file there is one, by name and count (AC87), an owner's `_draft.md` or a nested `_TEMPLATE.md` among them.
  const facts = under(RARE_DIRS.facts).filter((n) => notReadme(n) && n !== FACTS_TEMPLATE);
  // Standing intent is written into the template's own `intent/PORTFOLIO-INTENT.md`: names alone can't tell whether
  // any is written, so that file is named apart (`intentFile`), its words not read (Known limits, after MD3, 7).
  const file = PF_WORDS.intentFile.slice(RARE_DIRS.intent.length);
  const intentAll = under(RARE_DIRS.intent).filter((n) => notReadme(n) && notTemplate(n));
  return { rulings, facts, intent: intentAll.filter((n) => n !== file), intentFile: intentAll.includes(file) };
}

/**
 * The standing intent's line (J23, changed after MD3, specs/S-001.md:12338-12339): where the template's own file is
 * there, the spec's row and nothing more, "Standing intent: intent/PORTFOLIO-INTENT.md (its words not read)" (stage 7's
 * review, round 1, N1: the spec gives no words for other files beside it; the open case is the Definer's); otherwise
 * as rareLine, as built in stage 6b.
 */
export function intentLine(r) {
  if (!r.intentFile) return rareLine(PF_WORDS.intent, r.intent);
  return `${PF_WORDS.intent}: ${PF_WORDS.intentFile} ${PF_WORDS.wordsNotRead}`;
}

/** A rarer record's line in its sheet: "<what>: <n> · <names>", or "<what>: none yet". */
export function rareLine(what, names) {
  return names.length ? `${what}: ${names.length} · ${names.join(', ')}` : `${what}: ${PF_WORDS.noneYet}`;
}

// ---------------------------------------------------------------------------
// The board's "Portfolio" group (AC87, AC80)

/**
 * The portfolio's cards for the board (AC87): one for each file in the queue, in a group of its own named
 * "Portfolio", its kind "Decision", its title the card's decision (J2's `## 1. The decision`), its meta its
 * file's name, its one step "Open ↗" opening the card file on GitHub, no answer link (C: no portfolio
 * answer form is read, J23), and AC30's "can't parse" for a card that can't be read whole (it still waits).
 * read: portfolioRead's answer. Returns [card].
 */
export function portfolioCards(read) {
  if (!read) return [];
  return read.cards.map((c) => {
    const title = c.rec && c.rec.title ? c.rec.title : c.state === 'too-large' ? `${c.file}: ${PF_WORDS.tooLarge}` : c.state === 'pending' ? `${c.file}: ${PF_WORDS.notReadYet}` : c.file;
    const step = { id: 'open', label: 'Open ↗', sheetLabel: 'Open on GitHub', href: c.link };
    return { id: `${PF_BOARD}|portfolio|${c.path}`, key: `portfolio:${c.path}`, project: PF_BOARD, kind: 'portfolio', kindWord: 'Decision', portfolio: true,
      // AC89 (k): a card whose title is its file's name names the file once (no meta beside it).
      title, raisedAt: null, flag: null, mark: null, why: null, note: c.cantParse ? `can't parse: ${c.cantParse}` : null, meta: title === c.file ? [] : [c.file], buttons: [step], step,
      path: c.path, file: c.file, rec: c.rec, state: c.state, link: c.link };
  });
}

// ---------------------------------------------------------------------------
// The block (frame H4)

/**
 * The block: entries [{ project, pv, snap, error, read }], one for each connected project in J7's order
 * (`read`: its tile's read state, capEntry), and the portfolio as last read (portfolioRead's answer), or
 * null with no `portfolio` in J7: then every portfolio part reads 6a's words.
 * Returns { head, mono, rows: [{ key, title, soft, parts: [{ text, mark }] }], foot, cap, versions, pf }.
 */
export function portfolioView(entries, pf = null) {
  const cap = capView(entries);
  const versions = versionsView(entries);
  let decisions = [{ text: PF_WORDS.notRead, mark: null }];
  let rare = [{ text: PF_WORDS.rareNotRead, mark: null }];
  let foot = PF_WORDS.foot;
  if (pf) {
    // 6b: what the portfolio holds; a read that isn't current says why first, then the records as last read.
    const lead = pf.problem ? [{ text: pf.problem, mark: null }] : [];
    const read = pf.state !== 'pending' && pf.state !== 'truncated' && (pf.state === 'ok' || pf.lastSuccessAt != null);
    const n = pf.cards.length;
    decisions = [...lead, ...(!read ? [] : n ? [{ text: PF_WORDS.queued(n), mark: null }, { text: PF_WORDS.queuedWhere, mark: null }]
      : [{ text: PF_WORDS.noneQueued, mark: pf.problem ? null : 'check' }])];
    rare = [{ text: PF_WORDS.rareRead, mark: null }, ...lead];
    foot = PF_WORDS.footRead;
  }
  const rows = [
    { key: 'cap', title: PF_WORDS.cap, soft: false, parts: cap.parts },
    { key: 'decisions', title: PF_WORDS.decisions, soft: false, parts: decisions },
    { key: 'scorecard', title: PF_WORDS.scorecard, soft: false, parts: [{ text: PF_WORDS.targets, mark: 'nomodel' }, { text: PF_WORDS.time, mark: 'unrec' }] },
    { key: 'versions', title: versions.title, soft: false, parts: [{ text: versions.line || NOT_RECORDED, mark: null }] },
    { key: 'rare', title: PF_WORDS.rare, soft: true, parts: rare },
  ];
  return { head: PF_WORDS.head, mono: PF_WORDS.mono, rows, foot, cap, versions, pf };
}

/** A row's line as text: its parts joined by " · " (the screen draws each mark before its part). */
export const rowText = (row) => row.parts.map((p) => p.text).join(' · ');

// ---------------------------------------------------------------------------
// Plan's "Ideas · from the portfolio" (AC87, AC86; frame 11)

/**
 * The section: 6a's words with no `portfolio` in J7; else each idea in the log, newest first, its state
 * in words and its date (drawn in Plex Mono), "No ideas in the log yet" with none, or why it can't be shown.
 * Returns { count (null when not read), rows: [{ key, name, state, date }], words }.
 */
export function ideasView(pf) {
  if (!pf) return { count: null, rows: [], words: PF_WORDS.notRead };
  const list = pf.ideas.list.map((i) => ({ key: i.key, name: i.name, state: ideaStateWords(i), date: i.date || PF_WORDS.dateNotRecorded, recorded: Boolean(i.state) }));
  const words = pf.problem && pf.state !== 'pending' ? [...new Set([pf.problem, list.length ? null : pf.ideas.words].filter(Boolean))].join(' · ') : pf.ideas.words;
  return { count: pf.ideas.state === 'ok' || pf.ideas.state === 'none' ? list.length : null, rows: list, words: words || null };
}

// ---------------------------------------------------------------------------
// "Since you last looked": an idea's change of state (J24, from 6b)

export const SEEN_IDEAS_KEY = 'desk-seen-ideas-v1';

/** The ideas' states as this device keeps them: { key: state } (a state not recorded is kept as null). */
export const ideaStates = (pf) => Object.fromEntries(pf.ideas.list.map((i) => [i.key, i.state || null]));

/**
 * What the device keeps under `desk-seen-ideas-v1` (J24, C): for each "last looked" in use (AC40's, the one
 * this window marks against and the newest kept), the ideas' states the device had then, and each change
 * of state found since with when the desk first read it. Malformed parts dropped.
 */
export function readSeenIdeas(raw) {
  const out = { v: 1, looked: [] };
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.looked)) return out;
  for (const e of raw.looked.slice(0, 2)) {
    if (!e || !Number.isFinite(e.at) || !e.states || typeof e.states !== 'object') continue;
    const states = {};
    for (const [k, v] of Object.entries(e.states)) if (v === null || IDEA_STATES.includes(v)) states[k] = v;
    const moved = {};
    for (const [k, v] of Object.entries(e.moved && typeof e.moved === 'object' ? e.moved : {})) {
      if (v && IDEA_STATES.includes(v.state) && Number.isFinite(v.at) && typeof v.name === 'string') moved[k] = { state: v.state, at: v.at, name: v.name };
    }
    out.looked.push({ at: e.at, states, moved });
  }
  return out;
}

/**
 * Bring the kept states up to date (J24): `reference`, the "last looked" this window marks against;
 * `latest`, the newest one kept on the device; `pf`, the portfolio as read (its ideas read in full), and
 * `readAt` the read's time. The states at `latest` are kept the first time the desk has both; each idea
 * whose state differs from the one kept at `reference` (and is one of the five) is a change, kept with the
 * time the desk first read it. Returns { kept, changed }.
 */
export function noteIdeas(kept, { reference, latest, pf, readAt }) {
  const k = readSeenIdeas(kept);
  if (!pf || pf.ideas.state !== 'ok' && pf.ideas.state !== 'none') return { kept: k, changed: false };
  let changed = false;
  const now = ideaStates(pf);
  const want = [reference, latest].filter((x) => Number.isFinite(x));
  for (const at of want) {
    if (!k.looked.some((e) => e.at === at)) {
      k.looked.push({ at, states: { ...now }, moved: {} });
      changed = true;
    }
  }
  const before = k.looked.length;
  k.looked = k.looked.filter((e) => want.includes(e.at));
  if (k.looked.length !== before) changed = true;
  const base = k.looked.find((e) => e.at === reference);
  if (base) {
    for (const i of pf.ideas.list) {
      if (!(i.key in base.states) || !i.state || base.states[i.key] === i.state) {
        if (base.moved[i.key] && base.moved[i.key].state !== i.state) {
          delete base.moved[i.key];
          changed = true;
        }
        continue;
      }
      if (!base.moved[i.key] || base.moved[i.key].state !== i.state) {
        base.moved[i.key] = { state: i.state, at: readAt, name: i.name };
        changed = true;
      }
    }
  }
  return { kept: k, changed };
}

/** The idea lines of "Since you last looked" (J24): "An idea moved to <state>: <its name>", a folder's icon, "portfolio · ideas", one tap from Plan. */
export function ideaEvents(kept, reference) {
  const base = readSeenIdeas(kept).looked.find((e) => e.at === reference);
  if (!base) return [];
  return Object.entries(base.moved).map(([key, m], seq) => ({ id: `portfolio|idea|${key}|${m.state}`, project: 'portfolio', seq, dateOnly: false, at: m.at, icon: 'proj',
    words: PF_WORDS.ideaMoved(m.state, m.name), codes: ['ideas'], target: { hash: '#/work' } }));
}

// ---------------------------------------------------------------------------
// The trial view's state line and tab title (Terms' Quiet, from 6b; review round 2, B3)

/**
 * The screen's headline with the portfolio in it, in the words the state line already uses for projects
 * (universe.js `screenState`): the portfolio's waiting cards (`waiting`: each card in its queue, marked Done
 * on this device or not, as screenState counts a project's flagged items) are added to "<n> waiting on you"; a portfolio read that isn't current adds its own
 * words to the tail ("Checking…" while one is due with none failed; its failure words otherwise). "Quiet"
 * only when every project is quiet, no portfolio card waits and the portfolio was read within its 6 minutes.
 * boxes: [{ flaggedCount, read, drawError }]; pf: portfolioRead's answer, or null with no `portfolio` in J7.
 * Returns { text, quiet }.
 */
export function portfolioScreenState(boxes, signedOut, pf, waiting = 0) {
  if (signedOut) return { text: 'Signed out — reload to sign in', quiet: false };
  const flagged = boxes.reduce((n, b) => n + (b.flaggedCount || 0), 0) + (pf ? waiting : 0);
  const cantRead = boxes.filter((b) => b.read && b.read.read === 'cant-read').length;
  const checking = boxes.filter((b) => b.read && b.read.read === 'checking').length;
  const cantShow = boxes.filter((b) => b.drawError).length;
  const tail = [];
  if (cantRead) tail.push(`can't read ${cantRead} project${cantRead === 1 ? '' : 's'}`);
  if (cantShow) tail.push(`can't show ${cantShow} project${cantShow === 1 ? '' : 's'}`);
  const pfCant = Boolean(pf && !pf.fresh && pf.quietWords);
  if (pfCant) tail.push(pf.quietWords);
  if (checking || (pf && !pf.fresh && !pf.quietWords)) tail.push(PF_WORDS.checking);
  if (flagged) return { text: [`${flagged} waiting on you`, ...tail].join(' · '), quiet: false };
  if (cantRead || cantShow || pfCant) return { text: `Not quiet: ${tail.join(' · ')}`, quiet: false };
  if (tail.length) return { text: PF_WORDS.checking, quiet: false };
  return { text: 'Quiet', quiet: true };
}
