// The read model of one connected project (spec S-001, Terms, J2, J6, J9; AC1–AC3, AC6–AC12).
// Pure: given the tree, the parsed records, the PR and check-run pages and the clock, it says
// what is flagged, what is activity, and what each view shows. No network, no DOM.

import {
  parseCardPath, parseAnswerPath, questionName, questionAnswerName, classifyQueuePath,
  STATUS_RE, LOG_RE, ROUTING_PATH, LEDGER_PATH, isSprintPath,
  parseCard, parseAnswer, parseQuestion, parseStatus, parseRouting, parseLog, parseSprint,
  parseLedger, parsePulls, classifyPull, parseCheckRuns, reduceChecks, entryWords, markRetries,
  stageName, timeLimitMinutes,
} from './records.js';
import { whenText, durationText } from './timefmt.js';

export const NOT_RECORDED = 'not recorded';
export const V25_NOT_RECORDED = "not recorded in this repository's records (operating model v2.5.1)";

/** The two dispatch-log months J2 reads: the current one and the one before, in UTC. */
export function logMonths(now) {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const fmt = (yy, mm) => `${yy}-${String(mm + 1).padStart(2, '0')}`;
  const prev = m === 0 ? fmt(y - 1, 11) : fmt(y, m - 1);
  return [prev, fmt(y, m)];
}

/** The kind of record a path holds, for parsing and caching (null: not read by the desk). */
export function recordKind(path, model) {
  if (questionName(path)) return 'question';
  if (model === 'v3') {
    if (STATUS_RE.test(path)) return 'status';
    if (path === ROUTING_PATH) return 'routing';
    if (LOG_RE.test(path)) return 'log';
    if (parseCardPath(path)) return 'card';
    if (parseAnswerPath(path)) return 'answer';
  } else {
    if (path === LEDGER_PATH) return 'ledger';
    if (isSprintPath(path)) return 'sprint';
  }
  return null;
}

/** Parse a blob's text as its kind. The result is what the page caches by blob sha. */
export function parseRecord(kind, text, path) {
  switch (kind) {
    case 'status': return parseStatus(text);
    case 'routing': return parseRouting(text);
    case 'log': {
      const { entries, notes } = parseLog(text, path);
      return { entries, notes };
    }
    case 'card': return { text, ...parseCard(text) };
    case 'answer': return { verdict: parseAnswer(text) };
    case 'question': return { text, ...parseQuestion(text, (questionName(path) || path)) };
    case 'ledger': return parseLedger(text);
    case 'sprint': return parseSprint(text);
    default: return null;
  }
}

function openCards(tree) {
  const cards = [];
  for (const path of tree.keys()) {
    const card = parseCardPath(path);
    if (card && !tree.has(card.answerPath)) cards.push(card);
  }
  return cards;
}

function openQuestions(tree, model) {
  const out = [];
  for (const path of tree.keys()) {
    const name = questionName(path);
    if (!name) continue;
    if (model === 'v3' && tree.has(`decisions/questions/${name}.md`)) continue;
    out.push({ name, path });
  }
  return out;
}

/**
 * Which blobs and history paths the page needs for this project now (J6, "Which blobs it
 * fetches", M1's part). `records` maps path → parsed record (for the second pass: answer blobs
 * of cards whose status still says waiting-owner and whose decision isn't logged yet).
 * Returns { blobs: [{ path, sha, kind }], history: [path] }.
 */
export function neededReads(project, tree, records, now) {
  const want = [];
  const add = (path) => {
    const e = tree.get(path);
    const kind = recordKind(path, project.model);
    if (e && kind) want.push({ path, sha: e.sha, kind });
  };
  if (project.model === 'v3') {
    for (const path of tree.keys()) if (STATUS_RE.test(path)) add(path);
    add(ROUTING_PATH);
    for (const m of logMonths(now)) add(`dispatch-log/${m}.jsonl`);
    for (const card of openCards(tree)) add(card.path);
    // An answer committed before the Orchestrator logs it (J2): read its verdict.
    const logged = new Set();
    for (const m of logMonths(now)) {
      const log = records.get(`dispatch-log/${m}.jsonl`);
      for (const e of (log && log.entries) || []) if (e.shape === 'decision') logged.add(e.record);
    }
    for (const path of tree.keys()) {
      const st = STATUS_RE.exec(path) && records.get(path);
      if (!st || !st.ok || st.fields.state !== 'waiting-owner') continue;
      const ans = `decisions/${STATUS_RE.exec(path)[1]}/${st.fields.gate}-${st.fields.card}.md`;
      if (tree.has(ans) && !logged.has(ans)) add(ans);
    }
  } else {
    add(LEDGER_PATH);
    for (const path of tree.keys()) if (isSprintPath(path)) add(path);
  }
  const history = [];
  for (const q of openQuestions(tree, project.model)) {
    add(q.path);
    history.push(q.path);
  }
  return { blobs: want, history };
}

function blobUrl(project, path) {
  return `https://github.com/${project.repo}/blob/${encodeURIComponent(project.defaultBranch)}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

/**
 * Build the project's read model.
 * input: { project, config, tree: Map|null, records: Map(path → parsed), history: Map(path →
 *   { oldest, newest }), pullPages, checkPages, checksState: 'ok'|'cant-read', now: Date,
 *   withdrawn: [path] }
 */
export function buildModel(input) {
  const { project, config, now } = input;
  const tz = config.ownerTimeZone;
  const t = (d) => whenText(d instanceof Date ? d : new Date(d), now, tz);
  const tree = input.tree || new Map();
  const records = input.records || new Map();
  const history = input.history || new Map();
  const notes = [];
  const flagged = [];
  const activity = [];
  const isV3 = project.model === 'v3';

  // --- Pull requests (AC2)
  const { pulls, notes: pullNotes } = parsePulls(input.pullPages || []);
  notes.push(...pullNotes);
  const otherPulls = [];
  for (const pr of pulls) {
    const c = classifyPull(pr, project);
    const who = pr.login === config.ownerLogin ? 'yours' : `opened by ${pr.login}`;
    const row = { ...pr, who, why: c.why, raisedAt: pr.createdAt ? new Date(pr.createdAt) : null };
    if (c.flagged) {
      flagged.push({ kind: 'pr', key: `pr:${pr.number}`, title: `PR #${pr.number}: ${pr.title}`, link: pr.url,
        raisedAt: row.raisedAt, words: `${who}, opened ${row.raisedAt ? t(row.raisedAt) : NOT_RECORDED}`, pr: row });
    } else {
      otherPulls.push(row);
      activity.push({ kind: 'pr', text: `PR #${pr.number} (${c.why}): ${pr.title}`, link: pr.url });
    }
  }

  // --- CI (J1)
  let ci;
  if (input.checksState === 'cant-read') ci = "can't read checks";
  else if (input.checkPages == null) ci = 'not read yet';
  else {
    const { runs, notes: ciNotes } = parseCheckRuns(input.checkPages);
    notes.push(...ciNotes);
    ci = reduceChecks(runs);
  }
  if (ci === 'failing') activity.push({ kind: 'ci', text: `CI failing on ${project.defaultBranch}'s head` });

  // --- Owner questions (both models; AC3, AC12)
  const questions = [];
  for (const q of openQuestions(tree, project.model)) {
    const rec = records.get(q.path);
    const h = history.get(q.path);
    const raisedAt = h && h.oldest ? new Date(h.oldest) : null;
    const title = rec ? rec.title : q.name;
    const row = { ...q, title, parsed: rec || null, raisedAt, link: blobUrl(project, q.path) };
    questions.push(row);
    flagged.push({ kind: 'question', key: `q:${q.name}`, title: `Question: ${title}`, link: row.link, raisedAt,
      words: `raised ${raisedAt ? t(raisedAt) : NOT_RECORDED}`, question: row });
  }

  // --- Queue paths (J2)
  for (const path of tree.keys()) {
    const c = classifyQueuePath(path);
    if (!c || !isV3) continue;
    if (c.kind === 'merge-note') activity.push({ kind: 'merge-note', text: `merge-gate note: ${path}`, link: blobUrl(project, path) });
    if (c.kind === 'unparsed') activity.push({ kind: 'unparsed', text: `can't parse: ${path}`, link: blobUrl(project, path) });
  }
  for (const path of input.withdrawn || []) activity.push({ kind: 'withdrawn', text: `withdrawn: ${path}` });

  if (!isV3) {
    return finishV25({ project, records, tree, flagged, activity, notes, ci, questions, otherPulls, pulls, t });
  }

  // --- Dispatch log (J9)
  const entries = [];
  let logFound = 0;
  for (const m of logMonths(now)) {
    const path = `dispatch-log/${m}.jsonl`;
    const rec = records.get(path);
    if (!tree.has(path)) continue;
    logFound++;
    if (!rec) continue;
    entries.push(...rec.entries);
    notes.push(...rec.notes);
  }
  if (logFound === 0) notes.push('dispatch log: not found');
  markRetries(entries);
  const cardTimes = new Map();
  const decisions = new Map();
  const outcomeSessions = new Set();
  const lastByItem = new Map();
  for (const e of entries) {
    if (e.shape === 'card') cardTimes.set(`${e.item}/${e.gate}-${e.card}`, new Date(e.time));
    if (e.shape === 'decision') decisions.set(e.record, e);
    if (e.shape === 'outcome') outcomeSessions.add(e.session);
    if (e.item) lastByItem.set(e.item, new Date(e.time));
  }
  const last = entries.length ? entries[entries.length - 1] : null;
  const headline = last ? { text: entryWords(last, t(new Date(last.time))) } : { text: NOT_RECORDED };

  // --- Status files (J9, AC9)
  const routingRec = records.get(ROUTING_PATH);
  if (!tree.has(ROUTING_PATH)) notes.push('governance/ROUTING.toml: not found');
  const items = [];
  const statusByItem = new Map();
  for (const path of [...tree.keys()].sort()) {
    const m = STATUS_RE.exec(path);
    if (!m) continue;
    const id = m[1];
    const rec = records.get(path);
    const item = { id, path, link: blobUrl(project, path), asOf: lastByItem.get(id) || null };
    if (!rec) {
      item.loading = true;
      items.push(item);
      continue;
    }
    statusByItem.set(id, rec);
    if (!rec.ok) {
      item.unreadable = true;
      item.notes = rec.notes;
      items.push(item);
      activity.push({ kind: 'status', text: `${id}: can't read status`, link: item.link });
      continue;
    }
    const f = rec.fields;
    item.kind = f.kind ?? NOT_RECORDED;
    item.stage = f.stage != null ? stageName(f.stage) : NOT_RECORDED;
    item.state = f.state;
    item.notes = rec.notes;
    if (f.state === 'dispatched') {
      const since = f.dispatched_at ? new Date(f.dispatched_at) : null;
      const lim = timeLimitMinutes(routingRec || null, f.role);
      const elapsed = since ? now - since : NaN;
      item.running = { role: f.role ?? NOT_RECORDED, since, elapsed: since ? durationText(elapsed) : NOT_RECORDED,
        pastLimit: since ? elapsed > lim.minutes * 60e3 : false };
      if (item.running.pastLimit) {
        activity.push({ kind: 'overrun', text: `${id}: ${f.role} running for ${durationText(elapsed)}, past its limit` });
      }
      notes.push(...lim.notes.map((n) => `${id}: ${n}`));
    }
    if (f.state === 'waiting-owner') {
      const cardPath = `queue/${id}-${f.gate}-${f.card}.md`;
      const answerPath = `decisions/${id}/${f.gate}-${f.card}.md`;
      item.waiting = { gate: f.gate ?? NOT_RECORDED, card: f.card ?? NOT_RECORDED, path: cardPath,
        link: blobUrl(project, cardPath), answered: tree.has(answerPath) };
      if (!tree.has(cardPath) && !tree.has(answerPath)) {
        flagged.push({ kind: 'status-card', key: `status:${id}`, link: item.link, raisedAt: null,
          title: `${id}: waiting on you: card ${f.gate}-${f.card} (card file not found)`, words: 'from its status file' });
      }
      if (tree.has(answerPath)) {
        const d = decisions.get(answerPath);
        const ans = records.get(answerPath);
        item.waiting.verdict = d ? d.word : (ans && ans.verdict) || null;
        item.waiting.recording = !d;
      }
    }
    if (f.state === 'ready') item.next = `next: ${f.role ?? NOT_RECORDED} (${item.stage.replace(/^[0-9]+ /, '')})`;
    if (f.state === 'returned') {
      item.next = `next: the Orchestrator routes the ${f.role ?? NOT_RECORDED}'s return (verdict ${f.last_verdict ?? NOT_RECORDED})`;
    }
    if (f.state === 'done') item.finished = 'done';
    if (f.state === 'closed') item.finished = `closed: ${f.outcome ?? NOT_RECORDED}`;
    items.push(item);
  }

  // --- Cards (J2, AC1, AC7, AC11)
  for (const card of openCards(tree)) {
    const rec = records.get(card.path);
    const raisedAt = cardTimes.get(`${card.item}/${card.gate}-${card.n}`) || null;
    const row = { ...card, parsed: rec || null, raisedAt, link: blobUrl(project, card.path), cantParse: null };
    if (rec) {
      const problems = [...rec.notes];
      if (rec.answerPath && rec.answerPath !== card.answerPath) {
        problems.push(`its answer line names ${rec.answerPath}, not ${card.answerPath}`);
      }
      if (problems.length) {
        row.cantParse = problems.join('; ');
        activity.push({ kind: 'unparsed', text: `can't parse ${card.path}: ${row.cantParse}`, link: row.link });
      }
    }
    const title = rec && rec.title ? rec.title : `card ${card.gate}-${card.n}`;
    flagged.push({ kind: 'card', key: `card:${card.path}`, title: `${card.item} ${card.gate}-${card.n}: ${title}`,
      link: row.link, raisedAt, words: `raised ${raisedAt ? t(raisedAt) : NOT_RECORDED}`, card: row });
  }

  // --- Recent dispatch-log events as activity (AC6)
  const statusDispatch = new Map();
  for (const [id, rec] of statusByItem) {
    if (rec.ok && rec.fields.state === 'dispatched') statusDispatch.set(id, rec.fields.dispatched_at);
  }
  for (const e of entries.slice(-15).reverse()) {
    let text = entryWords(e, t(new Date(e.time)));
    if (e.retry) text += ' — retry';
    if (e.shape === 'anomaly') text += `: ${e.error}`;
    if (e.shape === 'dispatch' && !outcomeSessions.has(`${e.item}:${e.route}:${e.time}`)
        && statusDispatch.get(e.item) !== e.time) text += ' — no outcome recorded';
    activity.push({ kind: 'log', text, at: new Date(e.time) });
  }

  const openItems = items.filter((i) => !i.finished);
  return {
    name: project.name, model: project.model, repo: project.repo, defaultBranch: project.defaultBranch,
    flagged, activity, notes, ci, headline, items, openItems, questions, pulls, otherPulls,
    sprint: null,
  };
}

function finishV25({ project, records, tree, flagged, activity, notes, ci, questions, otherPulls, pulls, t }) {
  const open = [];
  let sprintFiles = 0;
  for (const path of [...tree.keys()].sort()) {
    if (!isSprintPath(path)) continue;
    sprintFiles++;
    const rec = records.get(path);
    if (rec && rec.open) open.push({ path, title: rec.title || path });
  }
  let sprint;
  if (open.length === 1) sprint = { title: open[0].title, note: null };
  else if (sprintFiles === 0) sprint = { title: null, note: 'sprint: not found' };
  else sprint = { title: null, note: 'sprint unclear' };
  const ledger = records.get(LEDGER_PATH);
  let headline;
  if (!tree.has(LEDGER_PATH)) {
    headline = { text: NOT_RECORDED, next: NOT_RECORDED, asOf: null };
    notes.push('docs/LEDGER.md: not found');
  } else if (!ledger) {
    headline = { text: 'loading…', next: null, asOf: null };
  } else {
    headline = { text: ledger.title ? `${ledger.id} — ${ledger.title}` : NOT_RECORDED,
      next: ledger.next || NOT_RECORDED, asOf: ledger.date || NOT_RECORDED };
  }
  return {
    name: project.name, model: project.model, repo: project.repo, defaultBranch: project.defaultBranch,
    flagged, activity, notes, ci, headline, items: null, openItems: null, questions, pulls, otherPulls,
    sprint, itemsText: V25_NOT_RECORDED, runningText: V25_NOT_RECORDED,
  };
}
