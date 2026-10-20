// J22 (spec S-001, AC80; desk mockup v2, 2026-10-20): a pull request's risk class, its verdict files
// and GitHub's owner check → the board's step, and rule 0, "with the agents". Pure: it reads what
// the page (and, from stage 1b, the notification sender) already holds and hands back judgements. No
// network, no DOM, no Node built-ins, so the page and the sender load the same file.
//
// This is the rule module stage 1a names for Setup CS24: `ruleZero` and `ownerCheckHeads` are the
// two the sender is to share (J16), with everything they rest on (the risk-paths reader, the class
// and the required reviewers). Every verdict file is decided by `verdictOf` (src/lib/j11.js), which
// decides as governance/checks/review_check.py's `parse_verdict` does.

import { verdictOf } from './j11.js';
import { classifyPull } from './records.js';
import { FILE_CAP } from './prfiles.js';

export const RISK_PATHS_PATH = 'governance/risk-paths.toml';
export const OWNER_CHECK_CONTEXT = 'owner-verdict';
/** J22: the owner check is read for at most 3 heads a project (J1's 30 requests a poll call: 11 + 3 + 16). */
export const OWNER_CHECK_HEADS = 3;
export const OWNER = 'owner';
export const CLASSES = ['R0', 'R1', 'R2', 'R3'];
// The model's defaults (governance/checks/govlib.py:968-977), taken when the file has no such table or key.
export const TESTS_DEFAULT = ['tests/**', '**/*_test.py', '**/test_*.py', '**/*.test.js', '**/*.spec.ts'];
export const MANIFESTS_DEFAULT = ['requirements*.txt', 'pyproject.toml', 'package.json', 'package-lock.json', 'go.mod', 'Cargo.toml'];

// The owner check's descriptions (governance/checks/owner_signal.py:63, :148-182).
export const AFTER_AGENTS = 'Owner: after agents';
export const VERDICT_NEEDED = 'Owner verdict needed';
export const NOT_REQUIRED = 'Owner not required';
export const APPROVED = 'Owner approved';
export const CHANGES = 'Owner requested changes';
export const TRIPWIRE = 'CI code changed';

// ---------------------------------------------------------------------------
// The part of TOML governance/risk-paths.toml uses (J22, "The file's read"): `key = "string"`,
// `key = [ "string", … ]` over one or more lines, `[table]` and `[paths."<glob>"]` headers, and
// comments after `#` outside a string. Anything else (an inline table, an array of tables, a dotted
// key) makes the file unreadable: "not known", never a class.

class TomlError extends Error {}

function tokens(text) {
  const out = [];
  const s = String(text).replace(/\r\n/g, '\n');
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '#') {
      while (i < s.length && s[i] !== '\n') i++;
    } else if (c === '\n') {
      out.push({ t: 'nl' });
      i++;
    } else if (c === ' ' || c === '\t') i++;
    else if ('[]=,.'.includes(c)) {
      out.push({ t: c });
      i++;
    } else if (c === '"') {
      let v = '';
      i++;
      for (;;) {
        if (i >= s.length || s[i] === '\n') throw new TomlError('an unclosed string');
        const d = s[i];
        if (d === '"') {
          i++;
          break;
        }
        if (d === '\\') {
          const e = s[i + 1];
          const map = { '"': '"', '\\': '\\', n: '\n', t: '\t', r: '\r', b: '\b', f: '\f' };
          if (e in map) {
            v += map[e];
            i += 2;
          } else if (e === 'u' || e === 'U') {
            const len = e === 'u' ? 4 : 8;
            const hex = s.slice(i + 2, i + 2 + len);
            if (!/^[0-9A-Fa-f]+$/.test(hex) || hex.length !== len) throw new TomlError('a bad escape');
            v += String.fromCodePoint(parseInt(hex, 16));
            i += 2 + len;
          } else throw new TomlError('a bad escape');
        } else {
          v += d;
          i++;
        }
      }
      out.push({ t: 'str', v });
    } else if (c === "'") {
      const end = s.indexOf("'", i + 1);
      if (end < 0 || s.slice(i + 1, end).includes('\n')) throw new TomlError('an unclosed string');
      out.push({ t: 'str', v: s.slice(i + 1, end) });
      i = end + 1;
    } else if (/[A-Za-z0-9_+-]/.test(c)) {
      let v = '';
      while (i < s.length && /[A-Za-z0-9_+:-]/.test(s[i])) v += s[i++];
      out.push({ t: 'bare', v });
    } else throw new TomlError(`an unexpected character ${JSON.stringify(c)}`);
  }
  out.push({ t: 'nl' });
  return out;
}

function parseToml(text) {
  const tk = tokens(text);
  let p = 0;
  const peek = () => tk[p];
  const take = (t) => {
    const x = tk[p];
    if (!x || x.t !== t) throw new TomlError(`expected ${t}`);
    p++;
    return x;
  };
  const skipNl = () => {
    while (peek() && peek().t === 'nl') p++;
  };
  const key = () => {
    const x = peek();
    if (x && (x.t === 'str' || x.t === 'bare')) {
      p++;
      return x.v;
    }
    throw new TomlError('expected a key');
  };
  const value = () => {
    const x = peek();
    if (!x) throw new TomlError('expected a value');
    if (x.t === 'str') {
      p++;
      return x.v;
    }
    if (x.t === 'bare') {
      p++;
      if (x.v === 'true') return true;
      if (x.v === 'false') return false;
      if (/^[+-]?[0-9_]+$/.test(x.v)) return Number(x.v.replace(/_/g, ''));
      throw new TomlError('a value this reader does not take');
    }
    if (x.t === '[') {
      p++;
      const arr = [];
      for (;;) {
        skipNl();
        if (peek().t === ']') {
          p++;
          return arr;
        }
        arr.push(value());
        skipNl();
        if (peek().t === ',') {
          p++;
          continue;
        }
        skipNl();
        take(']');
        return arr;
      }
    }
    throw new TomlError('a value this reader does not take');
  };
  const root = {};
  let table = root;
  const seenTables = new Set();
  for (;;) {
    skipNl();
    const x = peek();
    if (!x) break;
    if (x.t === '[') {
      p++;
      if (peek().t === '[') throw new TomlError('an array of tables');
      const path = [key()];
      while (peek().t === '.') {
        p++;
        path.push(key());
      }
      take(']');
      if (peek().t !== 'nl') throw new TomlError('text after a table header');
      const id = JSON.stringify(path);
      if (seenTables.has(id)) throw new TomlError('a table defined twice');
      seenTables.add(id);
      let t = root;
      for (const k of path) {
        if (t[k] === undefined) t[k] = {};
        else if (typeof t[k] !== 'object' || Array.isArray(t[k])) throw new TomlError('a key used as a table');
        t = t[k];
      }
      table = t;
      continue;
    }
    const k = key();
    if (peek().t === '.') throw new TomlError('a dotted key');
    take('=');
    const v = value();
    if (peek().t !== 'nl') throw new TomlError('text after a value');
    if (Object.prototype.hasOwnProperty.call(table, k)) throw new TomlError('a key defined twice');
    table[k] = v;
  }
  return root;
}

const strList = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string' && x.trim());
const isTable = (v) => v != null && typeof v === 'object' && !Array.isArray(v);

/**
 * governance/risk-paths.toml → { ok: true, rp } | { ok: false, why }. rp: { unmatched, classes:
 * { Rn: [glob] }, reviews: { Rn: [id] }, domains: [{ glob, risk, reviews }] (file order), tests:
 * [glob], manifests: [glob] }. Keys the model would reject are taken as the model takes them
 * (govlib.parse_risk_paths: a wrong value is skipped, the default kept); every other key is skipped.
 */
export function parseRiskPaths(text) {
  let data;
  try {
    data = parseToml(text);
  } catch (e) {
    return { ok: false, why: `governance/risk-paths.toml can't be read: ${e instanceof TomlError ? e.message : 'an error'}` };
  }
  const rp = { unmatched: 'R1', classes: {}, reviews: {}, domains: [], tests: [...TESTS_DEFAULT], manifests: [...MANIFESTS_DEFAULT] };
  if (CLASSES.includes(data.unmatched)) rp.unmatched = data.unmatched;
  if (isTable(data.classes)) for (const k of CLASSES) if (strList(data.classes[k])) rp.classes[k] = [...data.classes[k]];
  if (isTable(data.reviews)) for (const k of CLASSES) if (strList(data.reviews[k])) rp.reviews[k] = [...data.reviews[k]];
  if (isTable(data.paths)) {
    for (const [glob, t] of Object.entries(data.paths)) {
      if (!isTable(t) || !glob.trim()) continue;
      const risk = CLASSES.includes(t.risk) ? t.risk : null;
      const reviews = strList(t.reviews) ? [...t.reviews] : [];
      rp.domains.push({ glob, risk, reviews });
    }
  }
  if (isTable(data.tests) && strList(data.tests.globs)) rp.tests = [...data.tests.globs];
  if (isTable(data.dependencies) && strList(data.dependencies.manifests)) rp.manifests = [...data.dependencies.manifests];
  return { ok: true, rp };
}

// ---------------------------------------------------------------------------
// Globs, as the model's (governance/checks/govlib.py:285-325): `**/` matches any leading
// directories, a trailing `dir/**` matches that directory and everything below it, `*` and `?`
// never cross `/`, and the rest is literal.

const normalizePath = (p) => {
  let s = String(p).trim().replace(/\\/g, '/');
  while (s.startsWith('./')) s = s.slice(2);
  return s;
};
const reEscape = (ch) => ch.replace(/[\\^$.*+?()[\]{}|]/g, (c) => `\\${c}`);
const segment = (seg) => [...seg].map((ch) => (ch === '*' ? '[^/]*' : ch === '?' ? '[^/]' : reEscape(ch))).join('');
const GLOBS = new Map();

/** A glob as an anchored regular expression (govlib's `glob_to_regex`). */
export function globRegex(pattern) {
  const parts = [];
  for (const seg of normalizePath(pattern).replace(/^\/+/, '').split('/')) {
    if (seg === '**' && parts.length && parts[parts.length - 1] === '**') continue;
    parts.push(seg);
  }
  const n = parts.length;
  let out = '';
  parts.forEach((seg, i) => {
    const last = i === n - 1;
    if (seg === '**') out += last ? (i === 0 ? '.*' : '(?:/.*)?') : '(?:[^/]+/)*';
    else {
      out += segment(seg);
      const nextTrailing = i + 1 === n - 1 && parts[i + 1] === '**';
      if (!last && !nextTrailing) out += '/';
    }
  });
  return new RegExp(`^${out}$`, 'u');
}
export function globMatch(pattern, path) {
  let rx = GLOBS.get(pattern);
  if (!rx) {
    rx = globRegex(pattern);
    GLOBS.set(pattern, rx);
  }
  return rx.test(path);
}

// ---------------------------------------------------------------------------
// The class and the required reviewers (govlib's `path_class`, `change_class` and `required`).

/** A path's class: the highest any [classes] rule gives it, raised by a matching domain's `risk`, else `unmatched`. */
export function pathClass(rp, path) {
  let best = null;
  for (const c of CLASSES) if ((rp.classes[c] || []).some((g) => globMatch(g, path))) best = c;
  for (const d of rp.domains) if (d.risk && globMatch(d.glob, path) && (best == null || d.risk > best)) best = d.risk;
  return best == null ? rp.unmatched : best;
}

/** A change's class: the highest of its paths' (R0 with none). */
export function changeClass(rp, paths) {
  let best = null;
  for (const p of new Set(paths)) {
    const c = pathClass(rp, p);
    if (best == null || c > best) best = c;
  }
  return best == null ? 'R0' : best;
}

/** The reviewers a change needs by its files: its class's [reviews] list and every matching domain's `reviews`. Map(id → [reasons]). */
export function requiredReviewers(rp, paths) {
  const cls = changeClass(rp, paths);
  const req = new Map();
  for (const id of rp.reviews[cls] || []) req.set(id, [cls]);
  const all = [...new Set(paths)].sort();
  for (const d of rp.domains) {
    if (!all.some((p) => globMatch(d.glob, p))) continue;
    for (const id of d.reviews) {
      const r = req.get(id) || [];
      if (!r.includes(`domain ${d.glob}`)) r.push(`domain ${d.glob}`);
      req.set(id, r);
    }
  }
  return { cls, required: req };
}

/** A dependency manifest (govlib's `is_manifest`): a pattern without `/` matches the file's name at any depth. */
export function isManifest(rp, path) {
  const name = path.split('/').pop();
  return rp.manifests.some((g) => globMatch(g, path) || (!g.includes('/') && globMatch(g, name)));
}
export const isTest = (rp, path) => rp.tests.some((g) => globMatch(g, path));

/**
 * The two flags that need only paths (J22's (a); review_check.py:156-162, :255-285): a manifest the
 * change adds, changes or deletes (both names of a renamed one), and a test file deleted or renamed
 * away (`--no-renames`). changes: J20's [[status, path]] (A, D, M or null; a rename split in two).
 * Returns [{ path, flag, words }].
 */
export function pathFlags(rp, changes) {
  const out = [];
  const seen = new Set();
  for (const [st, path] of changes || []) {
    if (isManifest(rp, path) && !seen.has(`m:${path}`)) {
      seen.add(`m:${path}`);
      out.push({ path, flag: 'manifest', words: 'a dependency manifest changed' });
    }
    if (st === 'D' && isTest(rp, path) && !seen.has(`t:${path}`)) {
      seen.add(`t:${path}`);
      out.push({ path, flag: 'test', words: 'a test file deleted or renamed' });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// What the page (and the sender) hold for a pull request, and what they mean.

/** A pull request from the project's own repository (J20 reads only these). */
export const ownBranch = (pr, project) => typeof pr.headRepo === 'string' && pr.headRepo.toLowerCase() === String(project.repo).toLowerCase();

/** `reviews/<n>/<id>.md`, the verdict file path J22 reads. */
export const verdictPath = (n, id) => `reviews/${n}/${id}.md`;
export const VERDICT_FILE_RE = /^reviews\/([0-9]+)\/((?!_)(?!README\.md$)[^/]+)\.md$/;

/**
 * J20's list at a head as J22 reads it: the files whose changes are known at that head, or why not.
 * files: Map(number → { headSha, changes, capped, verdicts: Map(path → { present, sha }) }).
 * Returns { state: 'read', f } | { state: 'unread', why: 'fork' | 'not-read' | 'too-many' }.
 */
export function listAt(pr, project, files) {
  if (!ownBranch(pr, project)) return { state: 'unread', why: 'fork' };
  const f = files ? files.get(pr.number) : null;
  if (!f || !f.changes || !pr.headSha || f.headSha !== pr.headSha) return { state: 'unread', why: 'not-read' };
  if (f.capped) return { state: 'unread', why: 'too-many' };
  return { state: 'read', f };
}

/**
 * A verdict file's word, as `verdictOf` reads it: 'PASS' | 'FAIL' | 'neither' | 'unread' | 'missing'.
 * ctx.verdictBlob(sha) → { state: 'read', verdict } | { state: 'failed' } | null (not read yet);
 * ctx.treeVerdict(path) → { inTree, read, verdict }. On the branch: J20's list at the head holds the
 * file (added, modified or renamed to it), read by its blob sha; else, unless the list shows it
 * removed, the default branch's tree (J11's blob); a blob not read yet counts as given ("unread").
 */
export function verdictWord(pr, id, list, ctx) {
  const path = verdictPath(pr.number, id);
  const onBranch = list && list.state === 'read' ? list.f.verdicts && list.f.verdicts.get(path) : null;
  const word = (v) => (v === 'PASS' || v === 'FAIL' ? v : 'neither');
  if (onBranch && onBranch.present) {
    const b = onBranch.sha && ctx.verdictBlob ? ctx.verdictBlob(onBranch.sha) : null;
    if (!b || b.state !== 'read') return { word: 'unread', where: 'branch', failed: Boolean(b && b.state === 'failed'), sha: onBranch.sha || null };
    return { word: word(b.verdict), where: 'branch', sha: onBranch.sha };
  }
  if (onBranch && !onBranch.present) return { word: 'missing', where: 'removed' };
  const t = ctx.treeVerdict ? ctx.treeVerdict(path) : null;
  if (t && t.inTree) return t.read ? { word: word(t.verdict), where: 'tree' } : { word: 'unread', where: 'tree' };
  return { word: 'missing', where: null };
}

/** The roster's words for a reviewer id ("design-reviewer" → "Design reviewer"). */
export const reviewerWords = (id) => (id === OWNER ? 'You' : String(id).replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()));

/**
 * The owner check at a head, as the page or the sender read it: ctx.ownerCheck(sha) → { read: true,
 * state, description } | { read: true, state: null } (read, but no `owner-verdict` entry yet) |
 * null (not read: not this project's, past the 3-head cap, failed). Returns { read, state, description }.
 */
export function ownerCheckAt(pr, ctx) {
  const c = ctx.ownerCheck && pr.headSha ? ctx.ownerCheck(pr.headSha) : null;
  if (!c || !c.read || c.state == null) return { read: false, posted: Boolean(c && c.read), state: null, description: null };
  return { read: true, posted: true, state: c.state, description: typeof c.description === 'string' ? c.description : '' };
}

/** GitHub's combined status (`commits/{sha}/status`, raw JSON) → its `owner-verdict` entry: { state, description } | null (none posted) | undefined (malformed). */
export function ownerCheckFrom(raw) {
  let v;
  try {
    v = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return undefined;
  }
  if (!v || typeof v !== 'object' || !Array.isArray(v.statuses)) return undefined;
  const e = v.statuses.find((s) => s && s.context === OWNER_CHECK_CONTEXT);
  if (!e) return null;
  return { state: typeof e.state === 'string' ? e.state : null, description: typeof e.description === 'string' ? e.description : '' };
}

// ---------------------------------------------------------------------------
// (a): the owner's verdict needed by the files

/**
 * J22's (a) at the pull request's current head: { state: 'known', needs, cls, flags, required (Map) }
 * or { state: 'unknown', why } (J20's list not read at the head, a fork's, 300 files or more, or
 * governance/risk-paths.toml missing or not readable).
 */
export function judgeFiles(pr, ctx) {
  const rp = ctx.rp && ctx.rp.ok ? ctx.rp.rp : null;
  if (!rp) return { state: 'unknown', why: 'risk-paths' };
  const list = listAt(pr, ctx.project, ctx.files);
  if (list.state !== 'read') return { state: 'unknown', why: list.why };
  const paths = list.f.changes.map(([, p]) => p);
  const { cls, required } = requiredReviewers(rp, paths);
  const flags = pathFlags(rp, list.f.changes);
  return { state: 'known', needs: required.has(OWNER) || flags.length > 0, cls, flags, required, list };
}

// ---------------------------------------------------------------------------
// Rule 0: with the agents (P-001-board-after-agents.md and P-001-domain-review-count.md, both A)

export const AGENTS_WORDS = 'The agents still have findings to fix first.';

/**
 * Rule 0, judged afresh at the pull request's current head, never kept across heads: with the
 * agents while (i) its owner check reads pending "Owner: after agents…", in a project whose checks
 * are read, or (ii) a reviewer its change requires, other than the owner, has no verdict file at
 * its head, or one that reads FAIL or neither. (ii) needs J20's list at the head and the file's
 * rules; without them only (i) judges. Returns { withAgents, waits: [words], by: 'i' | 'ii' | null }.
 */
export function ruleZero(pr, ctx) {
  const waits = [];
  const oc = ownerCheckAt(pr, ctx);
  const i = oc.read && oc.state === 'pending' && oc.description.startsWith(AFTER_AGENTS);
  if (i) waits.push(AGENTS_WORDS);
  const a = judgeFiles(pr, ctx);
  let ii = false;
  if (a.state === 'known') {
    for (const id of [...a.required.keys()].filter((x) => x !== OWNER).sort()) {
      const v = verdictWord(pr, id, a.list, ctx);
      if (v.word === 'missing') waits.push(`Waiting on ${reviewerWords(id)}'s verdict`);
      else if (v.word === 'FAIL') waits.push(`${reviewerWords(id)} asked for changes`);
      else if (v.word === 'neither') waits.push(`${reviewerWords(id)}'s verdict reads neither PASS nor FAIL`);
      else continue;
      ii = true;
    }
  }
  return { withAgents: i || ii, waits, by: ii ? 'ii' : i ? 'i' : null };
}

/**
 * The heads whose owner check is read (J22, "Which heads"; draft 4), the same choice for the page
 * and the sender: the open pull requests that need the owner by Terms (classifyPull), leaving out
 * only one settled by its owner's verdict file (J20's list at its head holds reviews/<n>/owner.md
 * and verdictOf reads it PASS or FAIL) and one already with the agents by (ii); in AC52's order,
 * `created_at` oldest first, two alike by the lower number; the first 3. pulls: parsePulls' list.
 */
export function ownerCheckHeads(pulls, ctx) {
  const noCheck = { ...ctx, ownerCheck: () => null };
  const out = [];
  for (const pr of pulls || []) {
    if (!pr || !pr.headSha || !classifyPull(pr, ctx.project).flagged) continue;
    const list = listAt(pr, ctx.project, ctx.files);
    if (list.state === 'read') {
      const own = verdictWord(pr, OWNER, list, ctx);
      if (own.where === 'branch' && (own.word === 'PASS' || own.word === 'FAIL')) continue;
    }
    const r0 = ruleZero(pr, noCheck);
    if (r0.by === 'ii') continue;
    out.push(pr);
  }
  const t = (pr) => {
    const ms = Date.parse(pr.createdAt);
    return Number.isFinite(ms) ? ms : Infinity;
  };
  out.sort((a, b) => t(a) - t(b) || a.number - b.number);
  return out.slice(0, OWNER_CHECK_HEADS);
}

// ---------------------------------------------------------------------------
// Rules 1 to 7: the step of a pull request that is a card

export const WHY = Object.freeze({
  notRequired: 'It needs no verdict from you, only the merge.',
  byFiles: "By its files, it needs no verdict from you, only the merge; GitHub's owner check: not read yet.",
  changes: 'You asked for changes.',
  neither: 'Your verdict file reads neither PASS nor FAIL',
  tripwire: "GitHub flagged a change to this project's code or checks: look at the changes, then merge or add your verdict.",
  undecided: "GitHub's owner check couldn't decide.",
  notKnown: 'Whether it needs your verdict: not known yet',
  reading: 'Your verdict is on GitHub; reading it…',
});

/** The note on a card whose verdict is in (AC80, frame 1's step 2). */
export const STEP2_NOTE = 'Verdict in. Next, the merge.';

const CLASS_WORDS = { R3: 'high-risk (R3)', R2: 'R2', R1: 'R1', R0: 'R0' };

/** The why line for a verdict needed by (a) or (b). */
function verdictWhy(a, oc) {
  if (a && a.state === 'known' && a.needs) {
    if (a.required.has(OWNER)) return `A ${CLASS_WORDS[a.cls] || a.cls} change, so it needs your verdict before the merge.`;
    return `Its files need your verdict before the merge: ${a.flags.map((f) => f.words).join('; ')}.`;
  }
  return `GitHub's owner check asks for your verdict: ${oc.description}`;
}

/**
 * J22's step for a pull request rule 0 does not hold for. last: the judgement kept from an earlier
 * head (rule 7: until J20 reads a new head the card keeps the last head's (a) and verdict), or null.
 * Returns { step: 'merge' | 'verdict' | 'open', twoStep (1 | 2 | 0), why, note, check (the owner
 * check's description when read), verdictLink (the tripwire's "Add your verdict ↗"), reading,
 * keep (what to keep for the next head) }.
 */
export function prStep(pr, ctx, last = null) {
  const oc = ownerCheckAt(pr, ctx);
  let a = judgeFiles(pr, ctx);
  // Rule 7's keep: the last head's judgement stands while the new head's list is not read.
  if (a.state === 'unknown' && a.why === 'not-read' && last && last.number === pr.number && last.a && last.a.state === 'known') a = last.a;
  const list = a.state === 'known' && a.list && a.list.f && a.list.f.headSha === pr.headSha ? a.list : listAt(pr, ctx.project, ctx.files);
  const neededBefore = (a.state === 'known' && a.needs) || (oc.read && oc.state === 'pending' && oc.description.startsWith(VERDICT_NEEDED))
    || Boolean(last && last.number === pr.number && last.needed);
  const check = oc.read ? oc.description : null;
  const keep = { number: pr.number, head: pr.headSha, a: a.state === 'known' ? { ...a, list: null } : a, needed: neededBefore };
  const out = (step, why, extra = {}) => ({ step, why, check, twoStep: 0, reading: false, verdictLink: false, keep, ...extra });
  // Rule 1: the owner's verdict, on its branch, or as GitHub's check reads it.
  if (oc.read && oc.state === 'failure' && oc.description.startsWith(CHANGES)) return out('open', WHY.changes, { changes: true });
  if (oc.read && oc.state === 'success' && oc.description.startsWith(APPROVED)) return out('merge', null, { twoStep: 2, note: STEP2_NOTE });
  const own = list.state === 'read' ? verdictWord(pr, OWNER, list, ctx) : null;
  if (own && own.where === 'branch') {
    if (own.word === 'unread') return out('open', WHY.reading, { reading: true, failed: own.failed === true, sha: own.sha });
    if (own.word === 'PASS') return out('merge', null, { twoStep: neededBefore ? 2 : 0, note: STEP2_NOTE });
    if (own.word === 'FAIL') return out('open', WHY.changes, { changes: true });
    return out('open', WHY.neither);
  }
  // Rule 2: (a), by class or by a path-only flag.
  if (a.state === 'known' && a.needs) return out('verdict', verdictWhy(a, oc), { twoStep: 1 });
  // Rule 3: (b), GitHub's owner check asks for it.
  if (oc.read && oc.state === 'pending' && oc.description.startsWith(VERDICT_NEEDED)) return out('verdict', verdictWhy(null, oc), { twoStep: 1 });
  // Rule 4: the owner check can't say (its tripwire among them).
  if (oc.read && oc.state === 'error') {
    const trip = oc.description.startsWith(TRIPWIRE);
    return out('open', trip ? WHY.tripwire : WHY.undecided, { tripwire: trip, verdictLink: trip && !(own && own.where === 'branch') });
  }
  // Rule 5: "Owner not required".
  if (oc.read && oc.state === 'success' && oc.description.startsWith(NOT_REQUIRED)) return out('merge', WHY.notRequired);
  // Rule 6: (a) found no need, the owner check not read.
  if (a.state === 'known') return out('merge', WHY.byFiles);
  // Rule 7: not known.
  return out('open', WHY.notKnown);
}

export { verdictOf, FILE_CAP };
