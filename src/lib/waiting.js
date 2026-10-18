// What waits on the owner, kind by kind (spec S-001, AC73; J16's set, shared with the desk's
// `?open=<key>` tap, AC74). Pure: it reads the desk's own read model (src/lib/model.js
// `buildModel`) and adds only the deploys a `deploysNeedOwner` project waits on; it never reads a
// record itself. No network, no DOM, no Node built-ins, so the page can load it too.

export const KINDS = Object.freeze({
  card: 'a decision card',
  gate: 'a gate ruling',
  hold: 'a held loop',
  merge: 'a merge to do by hand',
  'missing-card': 'a card that went missing',
  question: 'a question',
  pr: 'a pull request to merge',
  deploy: 'a deploy to approve',
});

/** The gates whose cards are gate rulings (AC52, AC73): every other gate's card is a decision card. */
export const GATE_RULINGS = Object.freeze(['dor', 'criteria', 'launch']);

/** The words a held loop's notification reads (AC74), whatever its card holds. */
export const HOLD_WHAT = "the default branch's governance run is not green";

/** AC78's tap: More detail, at the "GitHub Actions this month" line. */
export const ACTIONS_USAGE_OPEN = 'actions-usage';

/** AC73's key: `<project>|<kind>|<id>`, the id the record's path, the pull request's number or the run's id. */
export function waitKey(project, kind, id) {
  return `${project}|${kind}|${id}`;
}

/** A key's parts, or null when it is not one of AC73's. */
export function parseWaitKey(key) {
  const s = String(key);
  const a = s.indexOf('|');
  const b = a < 0 ? -1 : s.indexOf('|', a + 1);
  if (a <= 0 || b < 0) return null;
  const kind = s.slice(a + 1, b);
  const id = s.slice(b + 1);
  if (!Object.prototype.hasOwnProperty.call(KINDS, kind) || !id) return null;
  return { project: s.slice(0, a), kind, id };
}

/** AC78's cost notification key, `account|actions-cost|<yyyy-mm>|<step>` (J17's Topic and tag). */
export function costKey(ym, step) {
  return `account|actions-cost|${ym}|${step}`;
}

/** A pull request's author is from outside the project (AC74): none of OWNER, MEMBER or COLLABORATOR. */
export function outsideAuthor(association) {
  return !['OWNER', 'MEMBER', 'COLLABORATOR'].includes(association);
}

/**
 * AC73's set for one project, from the desk's read model of it.
 * input: { project (J7 entry), model (buildModel's answer), deploys: [{ id, title }] (the runs whose
 *   `status` is `waiting`), jobCandidates: Set(pr number) the asks-merge job may still merge (J16),
 *   held: Set(question name) held or being recorded (AC77), outside: Set(pr number) whose author is
 *   from outside the project }.
 * Returns [{ key, kind, id, what, outside }], sorted by key. `what` is the record's own title (or
 * null for an outside author's pull request); the sender cuts and words it (AC74).
 */
export function waitingSet(input) {
  const { project, model } = input;
  const name = project.name;
  const jobs = input.jobCandidates || new Set();
  const held = input.held || new Set();
  const outside = input.outside || new Set();
  const out = [];
  const add = (kind, id, what, extra = {}) => out.push({ key: waitKey(name, kind, id), kind, id: String(id), what, ...extra });
  for (const f of (model && model.flagged) || []) {
    if (f.kind === 'card') {
      const c = f.card;
      const kind = GATE_RULINGS.includes(c.gate) ? 'gate' : 'card';
      add(kind, c.path, (c.parsed && c.parsed.title) || `${c.item} ${c.gate}-${c.n}`);
    } else if (f.kind === 'hold') {
      add('hold', f.hold.path, HOLD_WHAT);
    } else if (f.kind === 'merge') {
      add('merge', f.merge.path, f.title);
    } else if (f.kind === 'status-card') {
      add('missing-card', `status/${String(f.key).replace(/^status:/, '')}.toml`, f.title.replace(/: waiting on you: /, ': '));
    } else if (f.kind === 'question') {
      if (held.has(f.question.name)) continue;
      add('question', f.question.path, f.question.title);
    } else if (f.kind === 'pr') {
      const n = f.pr.number;
      if (jobs.has(n)) continue;
      const isOutside = outside.has(n);
      add('pr', n, isOutside ? null : f.pr.title, { outside: isOutside });
    }
  }
  if (project.deploysNeedOwner === true) {
    for (const d of input.deploys || []) add('deploy', d.id, d.title || 'a deploy');
  }
  out.sort((x, y) => (x.key < y.key ? -1 : x.key > y.key ? 1 : 0));
  return out;
}
