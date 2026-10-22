// J11's records (spec S-001, MD sandbox; AC48–AC53): the extra blobs the sandbox reads from the tree
// J1 already holds, and their parsers. Pure functions over text: no network, no DOM. Every record
// here is optional (J11): a project is never "Can't read" for want of one of them.
//
// The parsers follow the model's own readers in governance/checks/v3_checks.py and
// governance/checks/spec_check.py (model v3.3.0, S-023), so the timeline the desk draws is the
// model's timeline, not the desk's own reckoning (J11, "The timeline: the model's rules").

export const PROJECT_DOC_PATH = 'docs/PROJECT.md';
export const SURFACES_PATH = 'governance/SURFACES.md';
export const ORCH_WORKFLOW_PATH = '.github/workflows/orchestrator.yml';
export const SPEC_PATH_RE = /^specs\/(S-\d{3,})(?=-|\.md$)[^/]*\.md$/;
export const REQUEST_PATH_RE = /^intake\/requests\/(Q-\d{3,})\.toml$/;
export const GATE_CASE_RE = /^docs\/gates\/([PQE]-\d{3,})\/(design|build|launch)-gate-(\d+)-case\.md$/;
export const HANDOVER_PREFIX = 'docs/handover/';
export const README_PATH = 'README.md'; // AC54: read for every connected project, a v2.5 one too
export const HANDOVER_TEMPLATE = 'docs/handover/_TEMPLATE.md';
// AC60's review mark and AC72's check (J11, 2026-10-16): a verdict file under reviews/<n>/; names
// starting `_`, and README.md, are not verdicts (reviews/README.md).
export const REVIEW_VERDICT_RE = /^reviews\/([0-9]+)\/((?!_)(?!README\.md$)[^/]+\.md)$/;

/** A card gate's phase for its gate document (docs/gates/_GATE.md:4): dor → design, criteria → build, launch → launch. */
export const GATE_PHASE = { dor: 'design', criteria: 'build', launch: 'launch' };
export const GATE_WORDS = ['dor', 'criteria', 'launch'];

/** The J11 kind of a path in a v3 project, or null (not one of J11's records). */
export function j11Kind(path) {
  if (path === PROJECT_DOC_PATH) return 'project-doc';
  if (path === SURFACES_PATH) return 'surfaces';
  if (path === ORCH_WORKFLOW_PATH) return 'orch-workflow';
  if (SPEC_PATH_RE.test(path) && !path.startsWith('specs/_')) return 'spec';
  if (REQUEST_PATH_RE.test(path)) return 'request';
  if (GATE_CASE_RE.test(path)) return 'gate-case';
  if (path === README_PATH) return 'readme-root';
  if (REVIEW_VERDICT_RE.test(path)) return 'review-verdict';
  return null;
}

/** Parse a J11 record. The result is what the page caches by blob sha, so it holds only what is shown. */
export function parseJ11(kind, text, path) {
  switch (kind) {
    case 'project-doc': return parseProjectDoc(text);
    case 'surfaces': return parseSurfaces(text);
    case 'orch-workflow': return parseOrchWorkflow(text);
    case 'spec': return parseSpecDoc(text, path);
    case 'request': return parseRequest(text);
    case 'gate-case': return parseGateCase(text);
    case 'readme-root': return { summary: readmeSummary(text) };
    case 'review-verdict': return { verdict: verdictOf(text) };
    default: return null;
  }
}

const split = (text) => String(text == null ? '' : text).split('\n');

/**
 * A verdict file's verdict, as governance/checks/review_check.py's parse_verdict decides it: one
 * leading BOM dropped; lines split on LF only, one trailing CR dropped; any line holding `Verdict:`
 * anywhere but at its start makes the file malformed; otherwise the first line that starts with
 * `Verdict:` after leading whitespace and format (Cf) characters decides, and it must read exactly
 * `Verdict: PASS` or `Verdict: FAIL`, then only spaces or tabs. Returns 'PASS', 'FAIL', 'other'
 * (malformed: a `Verdict:` line that decides neither) or null (no `Verdict:` at all).
 */
const LEAD_RE = /^[\s\x1c-\x1f\x85\p{Cf}]*/u;
export function verdictOf(text) {
  let s = String(text == null ? '' : text);
  if (s.startsWith('\ufeff')) s = s.slice(1);
  const lines = s.split('\n').map((l) => (l.endsWith('\r') ? l.slice(0, -1) : l));
  if (!lines.some((l) => l.includes('Verdict:'))) return null;
  if (lines.some((l) => l.includes('Verdict:') && !l.startsWith('Verdict:'))) return 'other';
  const line = lines.find((l) => l.replace(LEAD_RE, '').startsWith('Verdict:'));
  const m = /^Verdict: (PASS|FAIL)[ \t]*$/.exec(line);
  return m ? m[1] : 'other';
}

// ---------------------------------------------------------------------------
// README.md (AC54 (a)): the brief project summary on each Home card

const README_NOT_PARAGRAPH_RE = /^(?:#|-|\*|\+|>|\||<|```|~~~|\d+\.)/;
const README_FENCE_RE = /^(```|~~~)/;

/** Inline Markdown as plain text (AC54): emphasis marks and backticks dropped, a link shows only its text. */
export function plainInline(s) {
  return String(s)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(/`/g, '')
    .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '$2')
    .replace(/(^|[^\w*])\*(?=\S)([^*]*?\S)\*(?=$|[^\w*])/g, '$1$2')
    .replace(/(^|[^\w])_(?=\S)([^_]*?\S)_(?=$|[^\w])/g, '$1$2')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '$1');
}

/**
 * The first paragraph after the title (AC54; the parsing rules are the Definer's, C): the title is
 * the first line starting `# `; a block is a run of non-blank lines; the summary is the first
 * block after the title whose first line doesn't start with `#`, `-`, `*`, `+`, `>`, `|`, `<`, a
 * code fence or a number and a full stop; other blocks are skipped; a heading ends the search.
 * Its lines are joined with single spaces and its inline Markdown shown as plain text. Null when
 * there is no title or no such paragraph.
 */
export function readmeSummary(text) {
  const lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
  const t = lines.findIndex((l) => l.startsWith('# '));
  if (t < 0) return null;
  let i = t + 1;
  while (i < lines.length) {
    while (i < lines.length && !lines[i].trim()) i++;
    if (i >= lines.length) return null;
    const first = lines[i].replace(/^ {0,3}/, '');
    if (first.startsWith('#')) return null; // a heading after the title ends the search
    if (README_FENCE_RE.test(first)) {
      const fence = README_FENCE_RE.exec(first)[1];
      i++;
      while (i < lines.length && !lines[i].replace(/^ {0,3}/, '').startsWith(fence)) i++;
      i++;
      continue;
    }
    const block = [];
    while (i < lines.length && lines[i].trim()) block.push(lines[i++]);
    if (README_NOT_PARAGRAPH_RE.test(first)) continue;
    return plainInline(block.map((l) => l.trim()).join(' '));
  }
  return null;
}

// ---------------------------------------------------------------------------
// docs/PROJECT.md (v3_checks.py: part1_sections, value_targets, milestone_lines)

const H1_RE = /^# /;
const SECTION_END_RE = /^#{1,2} /;
const NUMBERED_RE = /^## +(\d+)\./;
const TARGET_RE = /^(V\d+):/;

/** True for a line wholly wrapped in single asterisks (`*...*`), not `**bold**` (v3_checks.is_instruction_line). */
export function isInstructionLine(line) {
  const s = String(line).trim();
  return s.length >= 3 && s[0] === '*' && s[s.length - 1] === '*' && !s.startsWith('**') && !s.endsWith('**');
}

/** { n: { heading, lineno, body: [line] } } for the numbered `## n.` sections of Part 1. */
export function part1Sections(text) {
  const lines = split(text);
  let start = 0;
  let end = lines.length;
  const p1 = lines.findIndex((l) => l.startsWith('# Part 1'));
  if (p1 >= 0) {
    start = p1 + 1;
    const e = lines.findIndex((l, i) => i >= start && H1_RE.test(l));
    end = e >= 0 ? e : lines.length;
  } else {
    const e = lines.findIndex((l) => l.startsWith('# Part 2'));
    end = e >= 0 ? e : lines.length;
  }
  const out = {};
  let current = null;
  for (let i = start; i < end; i++) {
    const line = lines[i];
    if (SECTION_END_RE.test(line)) {
      current = null;
      const m = NUMBERED_RE.exec(line);
      if (m && !(Number(m[1]) in out)) {
        current = Number(m[1]);
        out[current] = { heading: line.trimEnd(), lineno: i + 1, body: [] };
      }
      continue;
    }
    if (current != null) out[current].body.push(line);
  }
  return out;
}

/** Section 6's value-target lines, word for word (AC83's "Value targets" sheet): the first line of each `V<n>:` id. */
export function valueTargetLines(text) {
  const sec = part1Sections(text)[6];
  if (!sec) return [];
  const out = [];
  const seen = new Set();
  for (const line of sec.body) {
    const m = TARGET_RE.exec(line);
    if (m && !seen.has(m[1])) {
      seen.add(m[1]);
      out.push({ id: m[1], text: line.trim() });
    }
  }
  return out;
}

export function valueTargets(text) {
  const sec = part1Sections(text)[6];
  if (!sec) return [];
  const out = [];
  for (const line of sec.body) {
    const m = TARGET_RE.exec(line);
    if (m && !out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

const MILESTONE_MARK_RE = /\(M[0-9A-Z]{1,7}\) · /;
const MILESTONE_LINE_RE = new RegExp('^(?:- )?(?<name>\\S.*?) \\((?<id>M[0-9A-Z]{1,7})\\) · done when (?<done>\\S.*?) · '
  + 'phase: (?<phase>Discovery|Design|Build|Launch)(?: · for: (?<for>P-\\d{3,}))?'
  + '(?: · sprints: (?<sprints>(?:PR #\\d+|[PQE]-\\d{3,})(?:, (?:PR #\\d+|[PQE]-\\d{3,}))*))?'
  // model S-033 AC7 (L-0016, 2026-10-17): ` · reached: <yyyy-mm-dd>`, after ` · sprints:` and before ` · dropped`
  // (v3_checks.py OPTIONAL_PARTS_RE); the why end, after both, is taken off before the line is matched.
  + '(?: · reached: (?<reached>\\d{4}-\\d{2}-\\d{2}))?(?<dropped> · dropped)?$');

/** A real calendar date in `yyyy-mm-dd` (govlib.valid_date): `2026-02-30` is not one. */
export function validDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s == null ? '' : s));
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 1 || mo < 1 || mo > 12 || d < 1) return false;
  const days = [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
  return d <= days;
}
const CODE_FIRST_RE = /^(?:- )?M[0-9A-Z]{1,7}:/;
const NAME_ID_RE = /\b(?:[SDPQE]-\d{3,}|L-\d{4,}|AC\d+|J\d+|V\d+|M\d[0-9A-Z]{0,6})\b/;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * A milestone line's why end (AC61 (a), model S-032 AC4): ` · why: <reason>` at the line's end, after
 * any ` · sprints:` and ` · dropped`; the reason at least one character, starting and ending with a
 * non-space character and holding no ` · `. Returns { line (the line without its why), why, bad }:
 * `bad` names why a why end is out of form (empty, or holding ` · `, which is also how a part after
 * it, such as ` · dropped`, reads); with no why end, why and bad are null.
 */
export function whyEnd(line) {
  const s = String(line);
  const i = s.indexOf(' · why:');
  if (i < 0) return { line: s, why: null, bad: null };
  const rest = s.slice(i + ' · why:'.length);
  const reason = rest.startsWith(' ') ? rest.slice(1) : null;
  if (reason == null || !reason.length || /^\s/.test(reason) || /\s$/.test(reason)) return { line: s.slice(0, i), why: null, bad: 'its why is empty, or starts or ends with a space' };
  if (reason.includes(' · ')) return { line: s.slice(0, i), why: null, bad: 'its why holds " · ", or has another part after it' };
  return { line: s.slice(0, i), why: reason, bad: null };
}

/**
 * Part 1 section 3's milestone lines (v3_checks.milestone_lines): { milestones: [{ lineno, id, name,
 * done, phase, forItem, sprints, reached, dropped, why }], problems: [{ lineno, message }] }. From
 * 2026-10-17 (J11, model S-033 AC7) `reached` is the line's ` · reached: <yyyy-mm-dd>` date as written,
 * or null; a date that is no real calendar date, or the part out of its place, skips the line as the
 * model's reader does. A line out of
 * form is skipped with a problem (J11's awkward case); the rest still show. From 2026-10-16 (AC61
 * (a)) a line's why end is taken off before the line is matched, so a why never changes its name,
 * "done when", phase, sprints or `· dropped`; a line whose why end is out of form is skipped with a
 * problem, as S-032's reader has it.
 */
export function milestoneLines(text) {
  const sec = part1Sections(text || '')[3];
  if (!sec) return { milestones: [], problems: [] };
  const problems = [];
  const raw = [];
  sec.body.forEach((line, j) => {
    const n = sec.lineno + 1 + j;
    const full = line.replace(/\r+$/, '');
    if (CODE_FIRST_RE.test(full)) {
      problems.push({ lineno: n, message: 'a milestone written code first: write the name first: <name> (M<id>) · …' });
      return;
    }
    if (!MILESTONE_MARK_RE.test(full)) return;
    const w = whyEnd(full);
    if (w.bad) {
      problems.push({ lineno: n, message: `a milestone line out of form: ${w.bad}` });
      return;
    }
    const m = MILESTONE_LINE_RE.exec(w.line);
    if (!m || (m.groups.reached && !validDate(m.groups.reached))) {
      problems.push({ lineno: n, message: 'not in the milestone form' });
      return;
    }
    raw.push({ n, g: m.groups, why: w.why });
  });
  const ids = raw.map((r) => r.g.id);
  const seen = new Set();
  const milestones = [];
  for (const { n, g, why } of raw) {
    if (seen.has(g.id)) {
      problems.push({ lineno: n, message: `milestone id ${g.id} is repeated` });
      continue;
    }
    seen.add(g.id);
    const ms = { lineno: n, id: g.id, name: g.name, done: g.done, phase: g.phase, forItem: g.for || null,
      sprints: g.sprints ? g.sprints.split(', ') : [], reached: g.reached || null, dropped: Boolean(g.dropped), why };
    // Both reached and dropped (v3_checks.py's `milestones` finding): read, shown as dropped, and named (J11).
    if (ms.reached && ms.dropped) problems.push({ lineno: n, message: `${ms.id} is marked both reached and dropped: it shows as dropped` });
    let bad = null;
    if (ms.name.includes('`')) bad = 'a backtick';
    else if (NAME_ID_RE.test(ms.name)) bad = `the code ${NAME_ID_RE.exec(ms.name)[0]}`;
    else {
      for (const other of ids) {
        if (new RegExp(`\\b${escapeRe(other)}\\b`).test(ms.name)) {
          bad = `the milestone id ${other}`;
          break;
        }
      }
    }
    if (bad) problems.push({ lineno: n, message: `the name "${ms.name}" holds ${bad}` });
    milestones.push(ms);
  }
  return { milestones, problems };
}

export const STANDARD_LINE_IDS = ['Discovery-1', 'Discovery-2', 'Discovery-3', 'Discovery-4', 'Discovery-5', 'Discovery-6', 'Discovery-7',
  'Discovery-8', 'Design-1', 'Design-2', 'Design-3', 'Design-4', 'Design-5', 'Design-6', 'Build-1', 'Build-2', 'Build-3', 'Build-4',
  'Build-5', 'Launch-1', 'Launch-2', 'Launch-3', 'Launch-4', 'Launch-5'];
const STANDARD_START_RE = /^(?:- )?(\S+) \(standard\)/;
const STANDARD_LINE_RE = /^(?:- )?((?:Discovery|Design|Build|Launch)-[0-9]+) \(standard\) · (taken on|skipped) · why: (.*)$/;

/**
 * Section 3's standard-milestone lines (AC61 (b), model S-032 AC5): `<Phase>-<n> (standard) · taken
 * on · why: <reason>` or `… · skipped · why: <reason>`, after an optional `- `, the reason as a
 * milestone's why. Returns { standard: { id: { state: 'taken on' | 'skipped', why, lineno } },
 * problems }. A line that starts `<id> (standard)` but is not in that form, or names no standard
 * milestone, is skipped with a problem; when two lines name the same milestone, the first counts and
 * the second is a problem.
 */
export function standardLines(text) {
  const sec = part1Sections(text || '')[3];
  const standard = {};
  const problems = [];
  if (!sec) return { standard, problems };
  sec.body.forEach((line, j) => {
    const n = sec.lineno + 1 + j;
    const s = line.replace(/\r+$/, '');
    const start = STANDARD_START_RE.exec(s);
    if (!start) return;
    const m = STANDARD_LINE_RE.exec(s);
    const reason = m ? m[3] : null;
    if (!STANDARD_LINE_IDS.includes(start[1])) {
      problems.push({ lineno: n, message: `a standard-milestone line names ${start[1]}, which is no standard milestone` });
      return;
    }
    if (!m || !reason || /^\s|\s$/.test(reason) || reason.includes(' · ')) {
      problems.push({ lineno: n, message: 'a standard-milestone line out of form: <Phase>-<n> (standard) · taken on (or skipped) · why: <reason>' });
      return;
    }
    if (standard[m[1]]) {
      problems.push({ lineno: n, message: `standard milestone ${m[1]} is repeated: the first line counts` });
      return;
    }
    standard[m[1]] = { state: m[2], why: reason, lineno: n };
  });
  return { standard, problems };
}

/**
 * The first two items of the list under `### Purpose` in docs/PROJECT.md's `## Intent` section
 * (AC59's "What we're delivering" and "Where we started"): each whole, its lines joined with single
 * spaces and its inline Markdown as plain text, as AC54 (a) reads a README. Returns { found, items }:
 * found is 'no-intent', 'no-purpose' or 'ok'; items has at most two strings.
 */
export function purposeItems(text) {
  const lines = split(text).map((l) => l.replace(/\r+$/, ''));
  const intent = lines.findIndex((l) => /^## +Intent\s*$/.test(l));
  if (intent < 0) return { found: 'no-intent', items: [] };
  let end = lines.findIndex((l, i) => i > intent && /^#{1,2} /.test(l));
  if (end < 0) end = lines.length;
  const p = lines.findIndex((l, i) => i > intent && i < end && /^### +Purpose\s*$/.test(l));
  if (p < 0) return { found: 'no-purpose', items: [] };
  const items = [];
  let cur = null;
  for (let i = p + 1; i < end; i++) {
    const l = lines[i];
    if (/^#/.test(l)) break;
    if (/^- /.test(l)) {
      if (cur) items.push(cur);
      cur = [l.slice(2).trim()];
    } else if (cur && /^\s+\S/.test(l)) cur.push(l.trim());
    else if (cur && !l.trim()) continue;
    else if (cur) {
      items.push(cur);
      cur = null;
      break;
    }
  }
  if (cur) items.push(cur);
  return { found: items.length ? 'ok' : 'no-purpose', items: items.slice(0, 2).map((x) => plainInline(x.join(' '))) };
}

/** A text's first sentence (AC59, C): up to and including the first full stop followed by a space or by the text's end. */
export function firstSentence(text) {
  const s = String(text);
  const m = /\.(?= |$)/.exec(s);
  return m ? s.slice(0, m.index + 1) : s;
}

export const OWNER_IS_USER = 'The owner is the user.';

/**
 * docs/PROJECT.md, cut down to what the sandbox shows and the timeline reads: section 3's milestones,
 * section 6's value targets, whether sections 1, 4 and 5 hold a line beyond their instructions
 * (Discovery-7's file part), and section 9's "The owner is the user." (AC52); from 2026-10-16, each
 * milestone's why (AC61 (a)), section 3's standard-milestone lines (AC61 (b)) and the Intent's
 * Purpose items (AC59). `problems` names each line out of form or repeated (AC61, AC68's record notes).
 */
export function parseProjectDoc(text) {
  const secs = part1Sections(text || '');
  const { milestones, problems: msProblems } = milestoneLines(text);
  const std = standardLines(text);
  const problems = [...msProblems, ...std.problems].sort((a, b) => a.lineno - b.lineno);
  const filled = (n) => Boolean(secs[n]) && secs[n].body.some((l) => l.trim() && !isInstructionLine(l));
  const s9 = secs[9] ? secs[9].body.map((l) => l.trim()).filter((l) => l && !isInstructionLine(l)) : null;
  return {
    milestones, problems, valueTargets: valueTargets(text), valueLines: valueTargetLines(text),
    scopeLimitsOwnersFilled: filled(1) && filled(4) && filled(5),
    section9: s9, ownerIsUser: Boolean(s9 && s9.includes(OWNER_IS_USER)),
    standard: std.standard, purpose: purposeItems(text),
  };
}

// ---------------------------------------------------------------------------
// specs/S-*.md (v3_checks.spec_header, spec_milestones, joins; spec_check.facts_violations)

const SPEC_MILESTONES_RE = /^milestones: (M[0-9A-Z]{1,7})((?:, M[0-9A-Z]{1,7})*)$/;
const JOINS_HEADING_RE = /^## +join sheets?\b/i;
const JOIN_RE = /^- \*\*J(\d+) —/;

export function specHeader(text) {
  const out = [];
  for (const line of split(text)) {
    if (line.startsWith('## ')) break;
    out.push(line.replace(/\r+$/, ''));
  }
  return out;
}

/** { state: 'missing' | 'malformed' | 'ok', ids } of a spec's `milestones:` header line. */
export function specMilestones(text) {
  for (const line of specHeader(text)) {
    if (line.startsWith('milestones:')) {
      const m = SPEC_MILESTONES_RE.exec(line);
      if (!m) return { state: 'malformed', ids: [] };
      return { state: 'ok', ids: [m[1], ...m[2].split(', ').filter(Boolean)] };
    }
  }
  return { state: 'missing', ids: [] };
}

/** The `- **J<n> —` lines of the Join sheets section (v3_checks.joins). */
export function joinsOf(text) {
  const lines = split(text);
  const i = lines.findIndex((l) => JOINS_HEADING_RE.test(l));
  if (i < 0) return [];
  const out = [];
  for (let j = i + 1; j < lines.length; j++) {
    if (SECTION_END_RE.test(lines[j])) break;
    const m = JOIN_RE.exec(lines[j]);
    if (m) out.push(m[1]);
  }
  return out;
}

const HEADING_RE = /^#{1,2} /;
const FACTS_HEADING_RE = /^## +facts relied on\b/i;
const LIMITS_HEADING_RE = /^## +known limits?\b/i;
const ITEM_RE = /^[-*+] +(.*)$/;
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})/;
const PATH_LINE_RE = /(?:[\w.-]+\/)*[\w-][\w.-]*\.[A-Za-z0-9]+:\d+|(?:[\w.-]+\/)+[\w.-]*:\d+/;
const PATH_RE = /(?:[\w.-]+\/)+[\w.-]+|\b[\w-]+\.(?:py|sh|ya?ml|toml|md|json|js|ts|txt)\b/;
const BARE_LINE_RE = /(?<![\w/.:]):\d+\b/;
const RESEARCH_RE = /docs\/research\//;
const CODE_RE = /`([^`]+)`/g;
const COMMANDS = new Set(['git', 'gh', 'python', 'python3', 'bash', 'sh', 'curl', 'wget', 'grep', 'rg', 'ls', 'cat', 'find',
  'npm', 'npx', 'node', 'pip', 'pip3', 'make', 'go', 'cargo', 'jq', 'wc', 'diff', 'sed', 'awk', 'head',
  'tail', 'docker', 'wrangler', 'kubectl', 'terraform', 'sqlite3', 'psql', 'dig', 'openssl', 'env']);
const LIMIT_LABEL_RE = /^[*_\s]*known limits?\b/i;
const NONE_RE = /^[*_\s]*(?:known limits?\b[^:]*:)?[*_\s:]*none\b/i;
const ABOVE_TIER_RE = /\babove[ -]tier\b/i;
const PLATFORM_RE = new RegExp('\\b(?:github|gitlab|bitbucket|git|actions?|workflows?|runners?|ubuntu|linux|macos|windows|apis?|'
  + 'https?|tokens?|webhooks?|browsers?|cloudflare|aws|gcp|azure|docker|containers?|npm|pypi|pip|python|'
  + 'node|dns|cdn|platforms?|ci|cron|rate[ -]limits?|quotas?|sdk|oauth|ssh|os)\\b', 'i');

function isCommand(text) {
  const t = String(text).trim();
  if (t.startsWith('$ ')) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 2) return false;
  const first = words[0];
  return COMMANDS.has(first) || first.startsWith('./') || /^[\w./-]+\.(?:py|sh)$/.test(first);
}

function hasEvidence(text, codeLines = []) {
  if (PATH_LINE_RE.test(text) || RESEARCH_RE.test(text)) return true;
  if (PATH_RE.test(text) && BARE_LINE_RE.test(text)) return true;
  for (const m of text.matchAll(CODE_RE)) if (isCommand(m[1])) return true;
  return codeLines.some(isCommand);
}

function sectionItems(text) {
  const out = { facts: [], limits: [], hasFacts: false };
  let section = null;
  let item = null;
  let inFence = false;
  let blank = false;
  const close = () => {
    if (item && section) out[section].push({ lineno: item[0], body: item[1].join('\n'), code: item[2] });
  };
  split(text).forEach((raw, i) => {
    const n = i + 1;
    const line = raw.replace(/\r+$/, '');
    if (inFence) {
      if (FENCE_RE.test(line)) inFence = false;
      else if (item) item[2].push(line);
      return;
    }
    if (HEADING_RE.test(line)) {
      close();
      item = null;
      if (FACTS_HEADING_RE.test(line)) {
        section = 'facts';
        out.hasFacts = true;
      } else if (LIMITS_HEADING_RE.test(line)) section = 'limits';
      else section = null;
      return;
    }
    if (!section) return;
    if (FENCE_RE.test(line)) {
      inFence = true;
      return;
    }
    const m = ITEM_RE.exec(line);
    if (m) {
      close();
      item = [n, [m[1]], []];
    } else if (!line.trim()) {
      blank = true;
      return;
    } else if (item && (/^\s/.test(line[0]) || !blank)) {
      item[1].push(line.trim());
    } else {
      close();
      item = null;
    }
    blank = false;
  });
  close();
  return out;
}

/** The count of spec_check.facts_violations for a spec's text (0: every fact is backed by evidence). */
export function factsViolations(text) {
  const items = sectionItems(text);
  if (!items.hasFacts) return 1;
  let v = 0;
  const limits = [...items.limits];
  for (const f of items.facts) {
    if (LIMIT_LABEL_RE.test(f.body)) limits.push(f);
    else if (!hasEvidence(f.body, f.code)) v++;
  }
  for (const l of limits) {
    if (NONE_RE.test(l.body) || ABOVE_TIER_RE.test(l.body)) continue;
    if (PLATFORM_RE.test(l.body) && !hasEvidence(l.body, l.code)) v++;
  }
  return v;
}

/**
 * A spec, cut down to what the timeline reads (J11: the header lines, and Design-2's and Design-4's
 * file parts): { id, milestones: { state, ids }, hasJoins, factsOk, status }.
 */
export function parseSpecDoc(text, path) {
  const m = SPEC_PATH_RE.exec(path || '');
  const status = (specHeader(text).find((l) => l.startsWith('status:')) || '').replace(/^status:\s*/, '').split(/\s+/)[0] || null;
  return { id: m ? m[1] : null, milestones: specMilestones(text), hasJoins: joinsOf(text).length > 0,
    factsOk: factsViolations(text) === 0, status };
}

// ---------------------------------------------------------------------------
// intake/requests/Q-*.toml: the research question (the Discovery-3 groundwork rule)

export const GROUNDWORK_PREFIXES = ['Groundwork map:', 'Discovery map:'];

/**
 * { question: first non-empty line of the `question` string, or null; sentence: the question's
 * first sentence (AC60's research title, C): its text up to and including the first `.`, `?` or `!`
 * followed by a space or the text's end, its line breaks as spaces }.
 */
export function parseRequest(text) {
  const lines = split(text);
  const i = lines.findIndex((l) => /^question\s*=/.test(l));
  if (i < 0) return { question: null, sentence: null };
  const after = lines[i].replace(/^question\s*=\s*/, '');
  const single = /^"((?:[^"\\]|\\.)*)"\s*$/.exec(after);
  if (single) return { question: single[1].trim() || null, sentence: sentenceOf(single[1]) };
  if (after.startsWith('"""')) {
    const rest = [after.slice(3), ...lines.slice(i + 1)];
    const body = [];
    for (const l of rest) {
      const end = /"""\s*$/.test(l);
      body.push(l.replace(/"""\s*$/, ''));
      if (end) break;
    }
    const first = body.map((l) => l.trim()).find(Boolean) || null;
    return { question: first, sentence: sentenceOf(body.join('\n')) };
  }
  return { question: null, sentence: null };
}

function sentenceOf(text) {
  const s = String(text).replace(/\s+/g, ' ').trim();
  if (!s) return null;
  const m = /[.?!](?= |$)/.exec(s);
  return m ? s.slice(0, m.index + 1) : s;
}

export const isGroundwork = (req) => Boolean(req && req.question && GROUNDWORK_PREFIXES.some((p) => req.question.startsWith(p)));

// ---------------------------------------------------------------------------
// governance/SURFACES.md: the roster block (AC49's members)

/**
 * The ```roster block: { members: [{ id, class, status, authority }], ok, note }. Lines are
 * `<id> <class> <status> <authority>`; `#` lines are skipped. A missing or malformed block gives
 * ok false and a note (J11: the page then names the members the dispatch log names).
 */
export function parseSurfaces(text) {
  const lines = split(text);
  const start = lines.findIndex((l) => l.trim() === '```roster');
  if (start < 0) return { members: [], ok: false, note: 'governance/SURFACES.md has no roster block' };
  const members = [];
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith('```')) return { members, ok: members.length > 0, note: members.length ? null : 'the roster block is empty' };
    if (!l || l.startsWith('#')) continue;
    const parts = l.split(/\s+/);
    if (parts.length !== 4) return { members: [], ok: false, note: `the roster block's line ${i + 1} is not "<id> <class> <status> <authority>"` };
    members.push({ id: parts[0], class: parts[1], status: parts[2], authority: parts[3] });
  }
  return { members: [], ok: false, note: 'the roster block is not closed' };
}

// ---------------------------------------------------------------------------
// .github/workflows/orchestrator.yml: the schedule (J11)

/** { cron: the first `- cron: "<expr>"` line's expression, or null }. */
export function parseOrchWorkflow(text) {
  for (const l of split(text)) {
    const m = /^\s*-\s*cron:\s*["']([^"']*)["']\s*$/.exec(l);
    if (m) return { cron: m[1] };
  }
  return { cron: null };
}

/**
 * The Orchestrator's next run by its schedule (J11): only `*\/<n> * * * *` is understood; the next
 * run is the next UTC minute (after now) divisible by <n>. Any other form gives null ("due time not
 * available").
 */
export function nextCronRun(expr, now) {
  const m = /^\*\/([1-9][0-9]?) \* \* \* \*$/.exec(String(expr == null ? '' : expr).trim());
  if (!m) return null;
  const n = Number(m[1]);
  if (n > 59) return null;
  const t = new Date(now.getTime());
  t.setUTCSeconds(0, 0);
  for (let i = 0; i < 120; i++) {
    t.setUTCMinutes(t.getUTCMinutes() + 1);
    if (t.getUTCMinutes() % n === 0) return new Date(t.getTime());
  }
  return null;
}

// ---------------------------------------------------------------------------
// docs/gates/<item>/<phase>-gate-<n>-case.md: the case's plain-English opening paragraph (AC52)

// From stage 4 (AC85, "Recommended" on the case's recommendation), also its section 1's
// `**The proposer's recommendation:** <proceed, hold, recycle into <Phase>, or kill> — <why>` line
// (docs/gates/_GATE.md:6): the words after the label up to the dash.
const PROPOSER_RE = /^\*\*The proposer's recommendation:\*\* (proceed|hold|recycle(?: into (?:Discovery|Design|Build|Launch))?|kill)\b/;

/**
 * { opening: the first paragraph under "## 1. The ask" that isn't an instruction line, or null;
 * recommendation: the proposer's recommendation in section 1 ("proceed", "recycle into Design" and
 * so on), or null }.
 */
export function parseGateCase(text) {
  const lines = split(text).map((l) => l.replace(/\r+$/, ''));
  const i = lines.findIndex((l) => /^## +1\. /.test(l));
  if (i < 0) return { opening: null, recommendation: null };
  let recommendation = null;
  for (let j = i + 1; j < lines.length && !/^## /.test(lines[j]); j++) {
    const m = PROPOSER_RE.exec(lines[j].trim());
    if (m) {
      recommendation = m[1];
      break;
    }
  }
  const para = [];
  for (let j = i + 1; j < lines.length; j++) {
    const l = lines[j];
    if (SECTION_END_RE.test(l)) break;
    if (!l.trim()) {
      if (para.length) break;
      continue;
    }
    if (isInstructionLine(l) && !para.length) continue;
    para.push(l.trim());
  }
  return { opening: para.length ? para.join(' ') : null, recommendation };
}
