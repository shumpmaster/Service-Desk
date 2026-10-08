// The read model of one connected project (spec S-001, Terms, J2, J6, J9; AC1–AC3, AC6–AC12).
// Pure: given the tree, the parsed records, the PR and workflow-run pages and the clock, it says
// what is flagged, what is activity, and what each view shows. No network, no DOM.

import {
  parseCardPath, parseAnswerPath, questionName, questionAnswerName, classifyQueuePath,
  STATUS_RE, LOG_RE, ROUTING_PATH, LEDGER_PATH, isSprintPath, HOLD_RE, MERGES_PATH, OUTCOMES_PATH,
  parseMergeCardPath, parseHoldCard, parseMergeCard, parseMerges,
  parseCard, parseAnswer, parseRuling, parseOutcomes, parseQuestion, parseStatus, parseRouting, parseLog, parseSprint,
  parseLedger, parsePulls, classifyPull, parseWorkflowRuns, reduceWorkflowRuns, entryWords, markRetries,
  stageName, timeLimitMinutes,
} from './records.js';
import { whenText, durationText } from './timefmt.js';
import { cardRows, questionRows, cardSummary, v5Waits, sessionRows, timelines, V25_NO_CARDS, V25_ANSWERED } from './asked.js';

export const NOT_RECORDED = 'not recorded';
export const CI_CANT_READ = "can't read CI (the read token needs Actions: read)";
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
    if (HOLD_RE.test(path)) return 'hold';
    if (parseMergeCardPath(path)) return 'merge-card';
    if (path === MERGES_PATH) return 'merges';
    if (path === OUTCOMES_PATH) return 'outcomes';
    if (questionAnswerName(path)) return 'ruling';
  } else {
    if (path === LEDGER_PATH) return 'ledger';
    if (isSprintPath(path)) return 'sprint';
  }
  return null;
}

/** Parse a blob's text as its kind. The result is what the page caches by blob sha. */
export function parseRecord(kind, text, path) {
  switch (kind) {
    case 'status': return parseStatus(text, path);
    case 'routing': return parseRouting(text);
    case 'log': {
      const { entries, notes } = parseLog(text, path);
      return { entries, notes };
    }
    case 'card': return { text, ...parseCard(text) };
    case 'answer': return { verdict: parseAnswer(text) };
    case 'hold': return { text, ...parseHoldCard(text) };
    case 'merge-card': return { text, ...parseMergeCard(text) };
    case 'merges': return parseMerges(text);
    case 'outcomes': return parseOutcomes(text);
    case 'ruling': return { ruling: parseRuling(text), proxy: /^Proxy:/m.test(String(text)) };
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

export const TIME_ASKED_DAYS = 30;
const DAY_MS = 86400e3;

/** The Orchestrator's hold cards in the tree (AC46): [path]. */
function holdPaths(tree) {
  return [...tree.keys()].filter((p) => HOLD_RE.test(p)).sort();
}

/**
 * The newest hold card (J2): with one in the tree it is the newest; with several, the one whose
 * oldest commit (its creation, from J1's history read) is latest. Returns { newest, older, unknown }
 * where `unknown` lists cards whose creation time isn't known yet.
 */
export function newestHold(tree, history) {
  const paths = holdPaths(tree);
  if (paths.length <= 1) return { newest: paths[0] || null, older: [], unknown: [] };
  const known = [];
  const unknown = [];
  for (const p of paths) {
    const h = history.get(p);
    if (h && h.oldest) known.push({ p, at: Date.parse(h.oldest) });
    else unknown.push(p);
  }
  if (unknown.length) return { newest: null, older: [], unknown };
  known.sort((a, b) => b.at - a.at || (a.p < b.p ? 1 : -1));
  return { newest: known[0].p, older: known.slice(1).map((k) => k.p), unknown: [] };
}

/** The item's status state, or null. */
function itemState(records, item) {
  const st = records.get(`status/${item}.toml`);
  return st && st.ok ? st.fields.state : null;
}

/**
 * Whether a merge card is still open (J2, the Orchestrator's rule): the item isn't `closed`; no
 * merges.jsonl line has this item and tip; and the tip isn't merged by hand (a compare answer of
 * ahead or identical). An unknown tip, an unread record or a failed compare never clears it.
 * Returns { open, why }.
 */
function mergeCardState(card, rec, records, merges, compare) {
  if (itemState(records, card.item) === 'closed') return { open: false, why: `${card.item} is closed` };
  const tip = rec && rec.tip;
  if (!tip) return { open: true, why: 'its tip is unknown' };
  if (merges.some((m) => m.item === card.item && m.tip === tip)) return { open: false, why: 'merged by the merge gate' };
  if (compare.get(tip) === 'merged') return { open: false, why: 'its tip is merged into the default branch' };
  return { open: true, why: null };
}

/**
 * Which blobs, history paths and compares the page needs for this project now (J6, "Which blobs
 * it fetches"). `records` maps path → parsed record and ctx.history path → { oldest, newest }, for
 * the passes that depend on what was read first. ctx.head is the default-branch head the page last
 * read; ctx.compare maps an item tip → 'merged' (final) or its answer at that head.
 * Returns { blobs: [{ path, sha, kind }], history: [path], compare: [{ base, head }] }.
 */
export function neededReads(project, tree, records, now, ctx = {}) {
  const history = ctx.history || new Map();
  const compareState = ctx.compare || new Map();
  const want = [];
  const hist = [];
  const compare = [];
  const add = (path) => {
    const e = tree.get(path);
    const kind = recordKind(path, project.model);
    if (e && kind && !want.some((w) => w.path === path)) want.push({ path, sha: e.sha, kind });
  };
  if (project.model === 'v3') {
    for (const path of tree.keys()) if (STATUS_RE.test(path)) add(path);
    add(ROUTING_PATH);
    for (const m of logMonths(now)) add(`dispatch-log/${m}.jsonl`);
    add(OUTCOMES_PATH); // J10 (AC22, AC23)
    for (const card of openCards(tree)) add(card.path);
    // An answer committed before the Orchestrator logs it (J2): read its verdict. That covers a
    // waiting-owner status's card and any card raised in the two log months (AC16, AC20).
    const logged = new Set();
    const raised = [];
    for (const m of logMonths(now)) {
      const log = records.get(`dispatch-log/${m}.jsonl`);
      for (const e of (log && log.entries) || []) {
        if (e.shape === 'decision') logged.add(e.record);
        if (e.shape === 'card') raised.push(`decisions/${e.item}/${e.gate}-${e.card}.md`);
      }
    }
    for (const path of tree.keys()) {
      const st = STATUS_RE.exec(path) && records.get(path);
      if (!st || !st.ok || st.fields.state !== 'waiting-owner' || st.fields.gate == null || st.fields.card == null) continue;
      raised.push(`decisions/${STATUS_RE.exec(path)[1]}/${st.fields.gate}-${st.fields.card}.md`);
    }
    for (const ans of raised) if (tree.has(ans) && !logged.has(ans)) add(ans);

    // Hold cards (AC46): only the newest is read (review N3: they are never deleted, so the rest
    // cost nothing but their creation time, read once per path and kept).
    const holds = holdPaths(tree);
    if (holds.length > 1) for (const p of holds) if (!history.has(p)) hist.push(p);
    const { newest } = newestHold(tree, history);
    if (newest) add(newest);

    // Merge cards (AC47), merges.jsonl when one is present, and one compare per open card and head.
    const mergeCards = [...tree.keys()].map(parseMergeCardPath).filter(Boolean);
    if (mergeCards.length) add(MERGES_PATH);
    const mergesRec = records.get(MERGES_PATH);
    for (const card of mergeCards) {
      add(card.path);
      const rec = records.get(card.path);
      if (!rec || !rec.tip || !ctx.head || (tree.has(MERGES_PATH) && !mergesRec)) continue;
      const st = mergeCardState(card, rec, records, (mergesRec && mergesRec.merges) || [], compareState);
      if (st.open && !compareState.has(rec.tip) && !compare.some((c) => c.base === rec.tip)) {
        compare.push({ base: rec.tip, head: ctx.head });
      }
    }

    // Rulings (AC20): each ruling's answered time; for those inside the 30 days, its question's
    // raised time; for those whose question has a history, the ruling's `Ruling:` line.
    for (const path of tree.keys()) {
      const name = questionAnswerName(path);
      if (!name) continue;
      const h = history.get(path);
      if (!h) {
        hist.push(path);
        continue;
      }
      if (!h.oldest || now - Date.parse(h.oldest) > TIME_ASKED_DAYS * DAY_MS) continue;
      const qpath = `questions/${name}.md`;
      const qh = history.get(qpath);
      if (!qh) hist.push(qpath);
      else if (qh.oldest) add(path);
    }
  } else {
    add(LEDGER_PATH);
    for (const path of tree.keys()) if (isSprintPath(path)) add(path);
  }
  for (const q of openQuestions(tree, project.model)) {
    add(q.path);
    if (!hist.includes(q.path)) hist.push(q.path);
  }
  return { blobs: want, history: hist, compare };
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

  // --- CI (J1, AC29): the workflow runs of the default-branch head
  let ci;
  let governance = null; // the latest governance run on the head, or null (unknown or none)
  let ciKnown = false;
  if (input.checksState === 'cant-read') ci = CI_CANT_READ;
  else if (input.checkPages == null) ci = 'not read yet';
  else {
    const { runs, notes: ciNotes } = parseWorkflowRuns(input.checkPages);
    notes.push(...ciNotes);
    const red = reduceWorkflowRuns(runs);
    ci = red.ci;
    governance = red.governance;
    ciKnown = true;
    for (const a of red.activity) activity.push({ kind: 'run', text: a.text, link: a.url || undefined });
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
    return finishV25({ project, records, tree, flagged, activity, notes, ci, questions, otherPulls, pulls, t, history, now });
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
    notes.push(...rec.notes); // AC31: skipped lines and fields are named in the project's notes
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
    if (f.state === 'waiting-owner' && (f.gate == null || f.card == null)) {
      // AC31: the gate or card was skipped (or missing), so the card can't be named. A skipped
      // field never un-flags anything: the item's open card files are flagged through J2 below;
      // with none, the safety net flags the status itself.
      item.waiting = { gate: f.gate ?? NOT_RECORDED, card: f.card ?? NOT_RECORDED, path: null, link: null, answered: false };
      const anyOpen = openCards(tree).some((c) => c.item === id);
      if (!anyOpen) {
        flagged.push({ kind: 'status-card', key: `status:${id}`, link: item.link, raisedAt: null,
          title: `${id}: waiting on you: card ${f.gate ?? NOT_RECORDED}-${f.card ?? NOT_RECORDED} (card file not found)`,
          words: 'from its status file' });
      }
    } else if (f.state === 'waiting-owner') {
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

  // --- Hold cards (J2, AC46): only the newest counts; it is open until the latest governance run on
  // the head (J1's 3a and 3b) concluded success. Unknown CI (not read, or no Actions: read) keeps it
  // flagged (review N2 on the amendment).
  const hold = newestHold(tree, history);
  const holdFlag = (path, why) => {
    const rec = records.get(path) || null;
    const link = blobUrl(project, path);
    if (rec && rec.notes.length) notes.push(...rec.notes.map((n) => `${path}: ${n}`));
    flagged.push({ kind: 'hold', key: `hold:${path}`, link, raisedAt: null,
      title: rec && rec.title ? rec.title : "Hold card — the default branch's governance run is not green",
      words: why, hold: { path, link, parsed: rec, actionsLink: `https://github.com/${project.repo}/actions/workflows/governance.yml` } });
  };
  const governanceGreen = ciKnown && governance && governance.status === 'completed' && governance.conclusion === 'success';
  if (hold.newest) {
    if (governanceGreen) activity.push({ kind: 'hold', text: `hold card cleared — governance passed on the head: ${hold.newest}`, link: blobUrl(project, hold.newest) });
    else {
      const why = !ciKnown ? `the default branch's governance run is not green (governance on the head: ${ci})`
        : `the default branch's governance run is not green (latest on the head: ${governance ? (governance.status === 'completed' ? governance.conclusion : governance.status) : 'none'})`;
      holdFlag(hold.newest, why);
    }
    for (const p of hold.older) activity.push({ kind: 'hold', text: `replaced by a newer hold card: ${p}`, link: blobUrl(project, p) });
  }
  // While the hold cards' creation times are still being read, each one is flagged (it errs
  // towards flagging); the project isn't read successfully until they arrive.
  if (!governanceGreen) for (const p of hold.unknown) holdFlag(p, "the default branch's governance run is not green (finding the newest hold card)");

  // --- Merge cards (J2, AC47)
  const mergesRec = records.get(MERGES_PATH);
  if (mergesRec && mergesRec.notes.length) notes.push(...mergesRec.notes);
  const compare = input.compare || new Map();
  for (const path of [...tree.keys()].sort()) {
    const card = parseMergeCardPath(path);
    if (!card) continue;
    const rec = records.get(path) || null;
    const st = mergeCardState(card, rec, records, (mergesRec && mergesRec.merges) || [], compare);
    const link = blobUrl(project, path);
    const step = card.step === 'conflict' ? 'merge conflict' : 'merge by hand';
    if (!st.open) {
      activity.push({ kind: 'merge-card', text: `${card.item} ${step}: no longer waiting (${st.why})`, link });
      continue;
    }
    if (rec && rec.notes.length) notes.push(...rec.notes.map((n) => `${path}: ${n}`));
    const asked = rec && rec.tip ? compare.get(rec.tip) : undefined;
    flagged.push({ kind: 'merge', key: `merge:${path}`, link, raisedAt: null,
      title: `${card.item}: ${step}`,
      words: rec && rec.tip ? `item tip ${rec.tip.slice(0, 12)}${asked === 'failed' ? " (couldn't ask GitHub whether it is merged)" : ''}`
        : 'item tip not recorded',
      merge: { ...card, stepWords: step, link, parsed: rec,
        branchLink: `https://github.com/${project.repo}/tree/item/${encodeURIComponent(card.item)}` } });
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

  // --- Answered cards and rulings, for "already answered" (AC16, AC19)
  const answeredCards = {};
  for (const path of tree.keys()) {
    const card = parseCardPath(path);
    if (!card || !tree.has(card.answerPath)) continue;
    const d = decisions.get(card.answerPath);
    const ans = records.get(card.answerPath);
    answeredCards[path] = { verdict: (d && typeof d.word === 'string' ? d.word : null) || (ans && ans.verdict) || null };
  }
  const rulings = {};
  for (const path of tree.keys()) {
    const name = questionAnswerName(path);
    if (!name) continue;
    const rec = records.get(path);
    rulings[name] = { ruling: (rec && rec.ruling) || null };
  }

  // --- Time asked (AC20), V5 (AC21), agents and usage (AC22, AC23)
  const nowMs = now.getTime();
  const askedCards = cardRows(entries, tree, nowMs);
  const timeAsked = { cards: askedCards, cardsText: null, summary: cardSummary(askedCards, nowMs),
    questions: questionRows('v3', tree, records, history, nowMs), answeredText: null };
  const outcomesRec = records.get(OUTCOMES_PATH);
  if (outcomesRec) notes.push(...outcomesRec.notes);
  else if (!tree.has(OUTCOMES_PATH)) notes.push(`${OUTCOMES_PATH}: not found`);
  const sessions = sessionRows(entries, outcomesRec ? outcomesRec.bySession : null, statusDispatch, nowMs);

  const openItems = items.filter((i) => !i.finished);
  return {
    name: project.name, model: project.model, repo: project.repo, defaultBranch: project.defaultBranch,
    flagged, activity, notes, ci, headline, items, openItems, questions, pulls, otherPulls,
    sprint: null, answeredCards, rulings, timeAsked, v5Waits: v5Waits(askedCards, nowMs, config),
    sessions, timelines: timelines(sessions, askedCards, nowMs),
  };
}

function finishV25({ project, records, tree, flagged, activity, notes, ci, questions, otherPulls, pulls, t, history, now }) {
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
    answeredCards: {}, rulings: {}, v5Waits: [], sessions: null, timelines: [],
    timeAsked: { cards: null, cardsText: V25_NO_CARDS, summary: null,
      questions: questionRows('v2.5', tree, records, history, now.getTime()), answeredText: V25_ANSWERED },
  };
}
