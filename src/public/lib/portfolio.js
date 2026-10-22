// The portfolio's block at Home's foot (spec S-001, AC87; desk mockup v2, frame H4), stage 6a: from
// what the desk reads today. "Across your projects · read only": the projects in Build or Launch
// against the cap, the decisions in the portfolio's queue, the scorecard, each project's model
// version against the latest (J23's version reads, built in stage 3, src/lib/versions.js), and the
// portfolio's rarer records. Each part the desk can read today shows its record; each part that needs
// the portfolio says plainly that the portfolio isn't connected yet (6b, J23's portfolio read, waits
// on the owner's Setup P1). Pure: from each project's entry as the page holds it (J7's entry, AC50's
// phase view, its records as last read), words out; no network, no DOM, no storage. Nothing here can
// change the portfolio, and nothing here reads it.

import { readOf, versionWords, MODEL_VERSION_PATH, ROOT_VERSION_PATH, NOT_RECORDED, NOT_AVAILABLE } from './versions.js';
import { WA } from './workahead.js';

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
});

/** J23's state words: they follow a colon ("latest: not recorded"), where a version follows a space ("latest 3.5.0"). */
const isState = (w) => w === NOT_RECORDED || w === NOT_AVAILABLE;
const after = (w) => (isState(w) ? `: ${w}` : ` ${w}`);

// ---------------------------------------------------------------------------
// The cap on work at once (AC87; AC50's now phase)

/**
 * Why a v3 project's phase isn't known, in the words of its read state, the one Home's tile takes
 * (public/sandbox.js, readStateOf; AC5): a read refused or failed, "can't be read since HH:MM" (or
 * "can't be read" with no time); the first read still pending, "not read yet"; read, but no now run,
 * "not recorded". `read`: { state: 'ok' | 'checking' | 'cant-read', since: 'HH:MM' | null }, or absent.
 */
function unknownWhy(pv, error, read) {
  if (error || (read && read.state === 'cant-read')) return read && read.since ? `can't be read since ${read.since}` : "can't be read";
  if (read ? read.state === 'checking' : pv && pv.why === 'Phases: reading…') return 'not read yet';
  return NOT_RECORDED;
}

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
  if (pv.done) return { name, v3: true, phase: 'Done', counted: false, why: null };
  const now = pv.nowRun;
  // Records read, no now run in them: "not recorded", as the tile's "Now: not recorded".
  if (!now) return { name, v3: true, phase: null, counted: false, why: NOT_RECORDED };
  return { name, v3: true, phase: now.phase, counted: now.phase === 'Build' || now.phase === 'Launch', why: null };
}

/**
 * The cap's row (AC87): "In Build or Launch: <names>" or "none"; "<project>'s phase: <why>" for each v3
 * project whose phase isn't known; then "your cap: no record for this in the model yet" with the
 * slashed circle. Returns { entries, parts: [{ text, mark }] }, the parts joined by " · ".
 */
export function capView(entries) {
  const all = entries.map(capEntry);
  const counted = all.filter((e) => e.counted).map((e) => e.name);
  const parts = [{ text: `${PF_WORDS.inBuild}: ${counted.length ? counted.join(', ') : PF_WORDS.none}`, mark: null }];
  for (const e of all) if (e.v3 && e.why) parts.push({ text: `${e.name}'s phase: ${e.why}`, mark: null });
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
  const rows = entries.map(({ project, snap }) => {
    const own = versionRead(snap, MODEL_VERSION_PATH);
    const ownWords = own.rec ? comparedWords(own.rec, latest.rec) : own.words;
    let words;
    if (pub && project === pub.project) {
      words = project.model === 'v3' ? `${project.name}${after(ownWords)}, publishes${after(latest.words)}` : `${project.name} runs the v2.5 pipeline, publishes${after(latest.words)}`;
    } else words = `${project.name}${after(ownWords)}`;
    return { name: project.name, words, own: ownWords };
  });
  return { title: `${PF_WORDS.versions} · latest${after(latest.words)}`, latest: latest.words, publisher: pub ? pub.project.name : null, rows, line: rows.map((r) => r.words).join(' · ') };
}

// ---------------------------------------------------------------------------
// The block (frame H4), 6a

/**
 * The block, 6a: entries [{ project, pv, snap, error, read }], one for each connected project in J7's order
 * (`read`: its tile's read state, capEntry).
 * Returns { head, mono, rows: [{ key, title, soft, parts: [{ text, mark }] }], foot, cap, versions }.
 * Every portfolio part reads 6a's words: nothing reads the portfolio before 6b (J23).
 */
export function portfolioView(entries) {
  const cap = capView(entries);
  const versions = versionsView(entries);
  const rows = [
    { key: 'cap', title: PF_WORDS.cap, soft: false, parts: cap.parts },
    { key: 'decisions', title: PF_WORDS.decisions, soft: false, parts: [{ text: PF_WORDS.notRead, mark: null }] },
    { key: 'scorecard', title: PF_WORDS.scorecard, soft: false, parts: [{ text: PF_WORDS.targets, mark: 'nomodel' }, { text: PF_WORDS.time, mark: 'unrec' }] },
    { key: 'versions', title: versions.title, soft: false, parts: [{ text: versions.line || NOT_RECORDED, mark: null }] },
    { key: 'rare', title: PF_WORDS.rare, soft: true, parts: [{ text: PF_WORDS.rareNotRead, mark: null }] },
  ];
  return { head: PF_WORDS.head, mono: PF_WORDS.mono, rows, foot: PF_WORDS.foot, cap, versions };
}

/** A row's line as text: its parts joined by " · " (the screen draws each mark before its part). */
export const rowText = (row) => row.parts.map((p) => p.text).join(' · ');
