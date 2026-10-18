// Open pull requests' files (spec S-001, J20): "Your answer is being recorded" (AC77) and the
// asks-merge job's candidates by path (J16). Pure: it reads the raw REST pages of
// `GET /repos/<repo>/pulls/<n>/files` (at most 3 pages of 100) and hands back what they give. No
// network, no DOM, no Node built-ins.

import { questionName, questionAnswerName } from './records.js';

export const FILES_PER_PAGE = 100;
export const FILES_MAX_PAGES = 3;
/** The asks-merge job's own cap (asks_merge.py COMPARE_FILE_CAP): 300 files or more is no job candidate (J16). */
export const FILE_CAP = 300;

// The asks-merge job's kinds by path (governance/checks/asks_merge.py:81-83, :99-100).
const JOB_QUESTION_RE = /^questions\/([^/]+)\.md$/;
const JOB_ANSWER_RE = /^decisions\/questions\/([^/]+)\.md$/;
const JOB_SESSION_RE = /^sessions\/chief-of-staff\/([A-Za-z0-9_-]{1,100})\.jsonl$/;
const nameOk = (n) => Boolean(n) && !n.includes('/') && !n.startsWith('_');

/** The URL of one page of a pull request's files (J20). */
export function filesUrl(apiBase, repo, number, page) {
  return `${apiBase}/repos/${repo}/pulls/${number}/files?per_page=${FILES_PER_PAGE}${page > 1 ? `&page=${page}` : ''}`;
}

/**
 * Raw file pages (JSON text) → { ok, files: [{ filename, status, previous }], capped }. `capped`:
 * 300 files or more were listed (J16's cap; a fourth page is never read). A page that is not a list,
 * or an entry without a string `filename`, makes the read not ok.
 */
export function parseFilePages(pages) {
  const files = [];
  for (const raw of pages || []) {
    let v;
    try {
      v = JSON.parse(raw);
    } catch {
      return { ok: false, files: [], capped: false };
    }
    if (!Array.isArray(v)) return { ok: false, files: [], capped: false };
    for (const f of v) {
      if (!f || typeof f.filename !== 'string') return { ok: false, files: [], capped: false };
      files.push({ filename: f.filename, status: typeof f.status === 'string' ? f.status : null,
        previous: typeof f.previous_filename === 'string' ? f.previous_filename : null });
    }
  }
  return { ok: true, files, capped: files.length >= FILE_CAP };
}

/**
 * The files as asks-merge splits them (asks_merge.py:564-577): [[status, path]] with status A, D or M;
 * a rename is one deletion and one addition. Any other status (`copied`, `changed`, `unchanged`, a
 * rename with no previous name) is kept as [null, path]: a change no kind covers.
 */
export function splitChanges(files) {
  const out = [];
  for (const f of files || []) {
    if (f.status === 'added') out.push(['A', f.filename]);
    else if (f.status === 'removed') out.push(['D', f.filename]);
    else if (f.status === 'modified') out.push(['M', f.filename]);
    else if (f.status === 'renamed' && typeof f.previous === 'string') out.push(['D', f.previous], ['A', f.filename]);
    else out.push([null, f.filename]);
  }
  return out;
}

/**
 * The open questions whose answer these changes record (J20, AC77): in a v3 project an added
 * `decisions/questions/<name>.md`, whether or not the question is also deleted; in a v2.5 project a
 * deleted `questions/<name>.md`. A v3 deletion alone (a withdrawal) records nothing. Set(name).
 */
export function recordedAnswers(changes, model) {
  const names = new Set();
  for (const [st, path] of changes || []) {
    if (model === 'v3') {
      const n = st === 'A' ? questionAnswerName(path) : null;
      if (n) names.add(n);
    } else {
      const n = st === 'D' ? questionName(path) : null;
      if (n) names.add(n);
    }
  }
  return names;
}

/**
 * Whether every change is one of the asks-merge job's four kinds by path (J16; asks_merge.py:29-38,
 * `classify`'s path rules only): an added or deleted `questions/<name>.md`, an added
 * `decisions/questions/<name>.md`, each `<name>` holding no `/` and not starting `_`; or an added or
 * changed `sessions/chief-of-staff/<id>.jsonl`. An empty list is not.
 */
export function jobKindsByPath(changes) {
  if (!changes || changes.length === 0) return false;
  for (const [st, path] of changes) {
    const q = JOB_QUESTION_RE.exec(path);
    const a = JOB_ANSWER_RE.exec(path);
    const s = JOB_SESSION_RE.exec(path);
    if (q && nameOk(q[1]) && (st === 'A' || st === 'D')) continue;
    if (a && nameOk(a[1]) && st === 'A') continue;
    if (s && (st === 'A' || st === 'M')) continue;
    return false;
  }
  return true;
}

// AC77's closed read (draft 7, Critic round 5, finding 5; J1's limit): the project's closed pull
// requests, newest updated first, 100 to a page, read by both the sender and the desk's function.
export const CLOSED_MAX_PAGES = 3;

/**
 * Whether AC77's closed read goes on to the next page: the page names a next one (it is full), and
 * its last pull request was updated after `sinceMs`, the earliest held question's raised time (or its
 * time can't be read: the safe side). Past that, every later pull request was updated, so closed, at
 * or before the raised time, and ends nothing. Needing a fourth page is a failed read (AC77).
 */
export function closedNeedsNext(list, hasNext, sinceMs) {
  if (!hasNext || !Array.isArray(list) || !list.length) return false;
  const last = list[list.length - 1];
  const t = last && typeof last.updated_at === 'string' ? Date.parse(last.updated_at) : NaN;
  return !(Number.isFinite(t) && t <= sinceMs);
}

/**
 * Whether a closed pull request (REST's form) can end a held question's hold (AC77, J20): from the
 * project's own branches into the default branch, closed unmerged, not a draft (`draft` false), and
 * closed after `sinceMs`. Its files are then read to see whose answer it recorded.
 */
export function closedCanEnd(p, project, sinceMs) {
  if (!p || !Number.isInteger(p.number) || p.merged_at != null || typeof p.closed_at !== 'string') return false;
  if (p.draft !== false) return false; // a closed draft never ends a hold (draft 7, note 6)
  if (!(Date.parse(p.closed_at) > sinceMs) || !p.base || p.base.ref !== project.defaultBranch) return false;
  const headRepo = p.head && p.head.repo && p.head.repo.full_name;
  return typeof headRepo === 'string' && headRepo.toLowerCase() === String(project.repo).toLowerCase();
}
