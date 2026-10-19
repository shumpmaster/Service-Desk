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
 * The AC73 key and kind of one of the desk's flagged items (buildModel's `flagged`), or null for an
 * item AC73 does not name. The desk's `?open=<key>` tap (AC74) and the sender's set both read it.
 * A deploy's key is its run's id (J1's run lists, in a `deploysNeedOwner` project).
 */
export function flaggedWait(projectName, f) {
  if (!f) return null;
  if (f.kind === 'card') {
    const c = f.card;
    const kind = GATE_RULINGS.includes(c.gate) ? 'gate' : 'card';
    return { kind, id: c.path, key: waitKey(projectName, kind, c.path), what: (c.parsed && c.parsed.title) || `${c.item} ${c.gate}-${c.n}` };
  }
  if (f.kind === 'hold') return { kind: 'hold', id: f.hold.path, key: waitKey(projectName, 'hold', f.hold.path), what: HOLD_WHAT };
  if (f.kind === 'merge') return { kind: 'merge', id: f.merge.path, key: waitKey(projectName, 'merge', f.merge.path), what: f.title };
  if (f.kind === 'status-card') {
    const id = `status/${String(f.key).replace(/^status:/, '')}.toml`;
    return { kind: 'missing-card', id, key: waitKey(projectName, 'missing-card', id), what: f.title.replace(/: waiting on you: /, ': ') };
  }
  if (f.kind === 'question') return { kind: 'question', id: f.question.path, key: waitKey(projectName, 'question', f.question.path), what: f.question.title };
  if (f.kind === 'pr') return { kind: 'pr', id: String(f.pr.number), key: waitKey(projectName, 'pr', f.pr.number), what: f.pr.title };
  if (f.kind === 'deploy' && f.deploy && f.deploy.id != null) {
    return { kind: 'deploy', id: String(f.deploy.id), key: waitKey(projectName, 'deploy', f.deploy.id), what: f.deploy.title };
  }
  return null;
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
    // The desk's own deploys are the head's only (J1); the sender lists every waiting run (below).
    if (f.kind === 'deploy') continue;
    const w = flaggedWait(name, f);
    if (!w) continue;
    if (w.kind === 'question' && held.has(f.question.name)) continue;
    if (w.kind === 'pr') {
      const n = f.pr.number;
      if (jobs.has(n)) continue;
      const isOutside = outside.has(n);
      add('pr', n, isOutside ? null : f.pr.title, { outside: isOutside });
      continue;
    }
    add(w.kind, w.id, w.what);
  }
  if (project.deploysNeedOwner === true) {
    // A run with no title, or one from outside the repository (its title is not used), reads in its kind's words alone.
    for (const d of input.deploys || []) add('deploy', d.id, d.title || null, { untitled: !d.title });
  }
  out.sort((x, y) => (x.key < y.key ? -1 : x.key > y.key ? 1 : 0));
  return out;
}
