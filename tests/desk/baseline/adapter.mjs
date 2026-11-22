// The baseline adapter (spec S-014, line 23 and J7; J8's failed reads). It runs one J7 case through the desk's own
// code at whatever commit it sits in, and writes what that code gives, in J7's output form:
//
//   node tests/desk/baseline/adapter.mjs <case file> <output file>      (from the repository root, no network)
//
// It works out no output field itself. Each field is taken from what an entry point returns, from the caught push
// call, or from the page's text. The adapter only decrypts a caught push call's body, parses it, picks fields, sorts,
// and writes `<id>` for an `open` case's card id, for its key (raw or encoded) and for its title. An error, a missing
// field or a field of the wrong type fails the run: nothing is written and the exit code is 1.
//
// The clock. Before any src/ code is imported, the global `Date` is replaced by one whose `Date.now()` and `new Date()`
// give the case's `moment`. The moment then reaches each entry point thus:
//   - the page (loadSandbox): its own `now` option is the moment. loadSandbox's fake clock starts there and is the
//     fake server's clock too (tests/desk/sandbox-helpers.mjs: `fakeServer(repos, config, { now: () => now })`).
//     The page is read with `advance(0)`, so the clock never moves past the moment.
//   - the sender (`runSender`): `now: () => moment`, and `sleep` resolves at once without moving it. Every run of a
//     `sender` case is at the moment.
//
// The entry points called. All exist at the base commit and the reading names them (reviews/S-009/_src-reading.md):
//   - `desk` and `open` cases: the page end to end through `loadSandbox` (tests/desk/sandbox-helpers.mjs), with one
//     fake-server repository (tests/desk/fake-desk.mjs `repo`) keyed by path. Its `blobNull` (J7's `path` form) and
//     `blobFail` (J7's `call` form, by the blob's sha, `gitSha` of its text) are fields of that repository object,
//     which loadSandbox hands to `fakeServer` unchanged.
//   - the notices of a `desk` case: `runSender` (src/notify/sender.mjs), once (a first run), with `openCheckout`
//     giving the checkout-shaped object below.
//   - `sender` cases: `runSender` once for each run of the case, with AC14's stand-in (below) giving each run's list.
//
// What the page is read from. Keys are formed as the sender forms them (src/lib/waiting.js `waitKey`, `flaggedWait`):
// a card `Service-Desk|card|queue/<id>.md` (`gate` for `card` on a dor, criteria or launch card), a question
// `Service-Desk|question|questions/<name>.md`, a pull request `Service-Desk|pr|<number>`.
//   - `on_list`: the queue. Its address `#/p/Service-Desk/queue` is opened and the page puts Waiting with the one
//     project shown in its place (src/public/sandbox.js `redirectOf`, AC81). True when the page draws an element
//     whose `data-card` is the key.
//   - `on_board`: the board, `#/waiting` (every project). True as for `on_list`.
//   - `buttons`: the card sheet, `#/waiting/card/<encoded key>`. True when the sheet draws an answer control, an
//     element whose `data-k` starts `ans:<key>:`. A card the page does not hold gets no sheet (the page puts
//     `#/waiting` in place of the address), so false.
//   - `marked`: the word `<w>` of the sheet's option element (`data-k` `opt:<w>`) that holds the page's
//     "Recommended" mark (an element of class `v2-rec`); null when no option holds one.
//   - `home_count`: Home (`#/`), its head (class `v2-bt1`) in the form "<n> need(s) you" (src/lib/home.js
//     `briefingView`, from `bd.badge`). When the head is in another form, the badge on Home's Waiting tab
//     (`data-k` `badge`), which the page draws only when the count is above 0 (src/public/sandbox.js `appBar`), so 0
//     when it draws none.
//   - `lines`: the page's notice lines, in the order drawn: first the queue's quiet lines (each element of class
//     `v2-ql`: today's "Can't read <project> ..." line, the signed-out line, and the other lines about reads and
//     records), then Home's brief lines (each element of class `v2-bt3` in the brief, `data-k` `brief`, with text,
//     such as its "Can't read <project> ..." lines) and each project tile's red line (class `v2-ln bad` in an
//     element of class `v2-tile`, such as "Can't read in this opening: <words>"). Each line's text is trimmed.
//   - `open` cases: the page is loaded at the notice's address (`search` `?open=<encoded key>`, hash '') or at the
//     direct link (hash `#/waiting/card/<encoded key>`). `lands` is the page's hash once it has followed it; `shows`
//     is, for a notice, the arrival line the page draws (`data-k` `tap-banner`), and for a link, the visible text of
//     the card sheet the page draws there (class `v2-sheet`), '' when it draws none; `buttons` is true when the page
//     draws an answer control for the key anywhere (`data-k` starting `ans:<key>:`).
//
// The records, made into the forms the code reads (J7, from reviews/S-009/_src-reading.md:205-250):
//   - a card file `queue/<id>.md`: `# Card`, a `## 1. The decision` section holding the fixed title line `Pick one`,
//     and a `## 4. Options` section with one line `` - `<word>` — <word> `` per word; no `## 5.` (the reading's sample
//     card, :229-236).
//   - a gate case `docs/gates/<item>/<phase>-gate-<n>-case.md` (phase design, build or launch for dor, criteria or
//     launch), whose `## 1.` section holds `**The proposer's recommendation:** <word> — the case's reason` (:243-249).
//   - a notes file `decisions/<item>/<gate>-<n>-notes.md` holding the case's text.
//   - `card` entries `{ "action": "card", "time", "item", "gate", "card" }` (J1's fields, src/lib/records.js `parseLog`),
//     one line each, in `dispatch-log/<yyyy-mm>.jsonl` of the raise time's UTC month.
//   - an owner question `questions/<name>.md`, `# Ruling needed: <name>` then a `WHY:` line, the form
//     tests/desk/ac11-12-views.test.mjs:88 uses (src/lib/records.js `parseQuestion`, questions/_TEMPLATE.md's form).
//   - an open pull request: on the fake server tests/desk/fake-desk.mjs `pr(number, title)`; on the sender's fake
//     GitHub tests/desk/notify-helpers.mjs `pull(number, { title })` (REST's form).
// A listed read fails for every file of its kind (J7, J8): `queue` every card file, `notes` every notes file, `log`
// every month file. On the desk in the `path` form those paths are the repository's `blobNull`; in the `call` form
// their blobs' shas are its `blobFail`. On the sender, in either form, the checkout's `blobs(paths)` throws when the
// paths include one of them (J8).
//
// The sender's world, all in this file: the checkout-shaped object `{ head, shallow: false, tree, blobs, oldestAdd,
// isAncestor, git }` holding the case's records (`oldestAdd` gives null and `isAncestor` null, since a case has no
// history; `git` throws); a fake `fetch` that answers as GitHub (the state lookup, J18; the open pull requests and
// their files; the waiting runs; AC76's issue list), as the push service (every push accepted, 201) and as the
// artifact download, and throws on any other request; and a scratch `outDir` per run, in a fresh folder outside the
// repository for each case. Between two runs the state the sender wrote there (state.json, state.sig) is zipped with
// tests/desk/notify-helpers.mjs's `makeZip` and handed back as the next run's artifact, as that file's `harness`
// does (:505-515). Its environment holds exactly GITHUB_REPOSITORY, GITHUB_REPOSITORY_ID, GITHUB_EVENT_NAME
// (`schedule`), GITHUB_TOKEN (made up), DESK_VAPID_PRIVATE_KEY and DESK_VAPID_SUBJECT (`makeVapid`),
// DESK_PUSH_SUBSCRIPTION (`makeSubscription`, one for all of a case's runs) and DESK_NOTIFY_STATE_KEY (one for all of
// a case's runs); no DESK_NOTIFY_TEST and no DESK_BILLING_TOKEN. The config is tests/desk/notify-helpers.mjs's
// `testConfig` with its Service-Desk project only, for the page and the sender alike.
//
// A notice (J7, line 155). Each push call the fake `fetch` catches at the subscription's endpoint (the call
// src/notify/webpush.mjs `pushOnce` makes) has its body decrypted with tests/desk/notify-helpers.mjs's `decryptPush`
// and the subscription made here, and the text parsed as JSON, as that file's harness does (:516-522). Its payload is
// `{ web_push, notification: { title, body, navigate, tag } }` (webpush.mjs `payload`). The notice written is
// `{ "words": notification.title + "\n" + notification.body, "opens": notification.navigate }`, as decrypted, in the
// order caught. Nothing else is kept.
//
// AC14's stand-in (`sender` cases only). The sender takes its list where src/notify/collect.mjs calls
// `waitingSet` (src/lib/waiting.js) on the desk's model (J5's point). For a `sender` case a module hook (node:module
// `registerHooks`) gives collect.mjs, and only it, in place of src/lib/waiting.js a module that re-exports all of it
// but `waitingSet`, whose stand-in calls the real `waitingSet` on the model with its `flagged` list made from this
// run's list: a card `<item>-<gate>-<n>` as `{ kind: 'card', card: parseCardPath('queue/<id>.md') }` (src/lib/records.js,
// no parsed record, so its title is the real fallback `<item> <gate>-<n>`); a question `question:<name>` as
// `{ kind: 'question', question: { path: 'questions/<name>.md', name, title: name } }` (the path `QUESTION_RE` reads,
// src/lib/records.js:12; the title buildModel gives a question with no record, src/lib/model.js); a pull request
// `pr:<n>` as `{ kind: 'pr', pr: { number: n, title: null } }`. So each item's key, kind, id and words are the real
// `waitingSet`'s and `flaggedWait`'s; the run's `content` tag rides on each item as a field the sender does not read.
// The checkout for a `sender` case holds no records. No file under src/notify/** changes.
//
// Files read: the case file; the src/ code imported; the helpers imported from tests/desk/ (sandbox-helpers.mjs,
// fake-desk.mjs, notify-helpers.mjs, and helpers.mjs through them, which reads tests/desk/fixtures/config/projects.json
// when it loads); and the state files in the scratch `outDir`. Paths are taken from this file's own place, never from
// the checkout's.

import { registerHooks } from 'node:module';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

const [caseFile, outFile] = process.argv.slice(2);
const RealDate = Date;
const fail = (why) => { throw new Error(why); };
const isStr = (v) => typeof v === 'string';
const ID_RE = /^([A-Z]+-[0-9]+)-(.+)-([0-9]+)$/;
const GATES = ['dor', 'criteria', 'launch'];
const PHASE = { dor: 'design', criteria: 'build', launch: 'launch' };
const PROJECT = 'Service-Desk';
const TITLE_LINE = 'Pick one';
const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

async function main() {
  if (!isStr(caseFile) || !isStr(outFile)) fail('usage: node tests/desk/baseline/adapter.mjs <case file> <output file>');
  const c = JSON.parse(readFileSync(caseFile, 'utf8'));
  if (!c || !isStr(c.case) || !['desk', 'sender', 'open'].includes(c.kind) || !isStr(c.moment)) fail('case: no case id, kind or moment');
  const moment = RealDate.parse(c.moment);
  if (!Number.isFinite(moment)) fail(`case ${c.case}: moment ${c.moment} is not a time`);

  // The clock, fixed before any src/ code loads.
  class FixedDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(FixedDate.now()); else super(...a); }
    static now() { return moment; }
  }
  globalThis.Date = FixedDate;

  if (c.kind === 'sender') installStandIn();

  // Every import that reaches src/ comes after the clock and the stand-in.
  const nh = await import('../notify-helpers.mjs');
  const { makeVapid, makeSubscription, testConfig } = nh;
  const vapid = makeVapid();
  const base = testConfig(vapid);
  const config = { ...base, projects: base.projects.filter((p) => p.name === PROJECT) };
  const project = config.projects[0];
  if (!project) fail('config: no Service-Desk project');

  let result;
  if (c.kind === 'sender') {
    if (!Array.isArray(c.runs) || !c.runs.length) fail(`case ${c.case}: no runs`);
    const world = await senderWorld({ nh, config, project, vapid, moment });
    const notices = [];
    for (const list of c.runs) {
      if (!Array.isArray(list)) fail(`case ${c.case}: a run is not a list`);
      globalThis[STAND_IN] = list;
      notices.push(await world.run({ tree: new Map(), texts: new Map(), failing: new Set() }));
    }
    world.done();
    result = { notices };
  } else {
    const R = c.records;
    if (!R || typeof R !== 'object') fail(`case ${c.case}: no records`);
    const recs = recordFiles(R);
    const failing = new Set();
    for (const kind of c.fail || []) {
      if (!['queue', 'notes', 'log'].includes(kind)) fail(`case ${c.case}: unknown failure ${kind}`);
      for (const p of recs.of[kind]) failing.add(p);
    }
    const form = c.form || 'path';
    if (!['path', 'call'].includes(form)) fail(`case ${c.case}: unknown form ${form}`);
    if (c.kind === 'desk') {
      const page = await deskPage({ c, R, recs, failing, form, config, moment });
      const world = await senderWorld({ nh, config, project, vapid, moment });
      const texts = new Map(Object.entries(recs.files));
      const { gitSha } = await import('../fake-desk.mjs');
      const tree = new Map(Object.keys(recs.files).map((p) => [p, { sha: gitSha(recs.files[p]), mode: '100644' }]));
      const ns = await world.run({ tree, texts, failing, pulls: R.pulls });
      world.done();
      result = { ...page, notices: ns };
    } else {
      result = await openPage({ c, R, recs, failing, form, config, moment });
    }
  }
  const out = { case: c.case, result };
  check(c, out);
  writeFileSync(outFile, `${JSON.stringify(out, null, 2)}\n`);
}

// ---------------------------------------------------------------------------------------------------------------
// The records as files, keyed by path, and the paths of each failing kind.

function recordFiles(R) {
  const files = {};
  const of = { queue: [], notes: [], log: [] };
  const parts = (id) => { const m = ID_RE.exec(id); if (!m) fail(`card id ${id} is not <item>-<gate>-<n>`); return { item: m[1], gate: m[2], n: m[3] }; };
  for (const [id, words] of Object.entries(R.queue || {})) {
    if (!Array.isArray(words) || !words.every(isStr)) fail(`queue ${id}: words are not a list of words`);
    parts(id);
    const p = `queue/${id}.md`;
    files[p] = `# Card\n\n## 1. The decision\n${TITLE_LINE}\n\n## 4. Options\n${words.map((w) => `- \`${w}\` — ${w}`).join('\n')}\n`;
    of.queue.push(p);
  }
  for (const [id, word] of Object.entries(R.cases || {})) {
    const { item, gate, n } = parts(id);
    if (!PHASE[gate] || !isStr(word)) fail(`cases ${id}: not a gate card's case`);
    files[`docs/gates/${item}/${PHASE[gate]}-gate-${n}-case.md`] = `# Case\n\n## 1. The ask\n**The proposer's recommendation:** ${word} — the case's reason\n`;
  }
  for (const [id, text] of Object.entries(R.notes || {})) {
    const { item, gate, n } = parts(id);
    if (!isStr(text)) fail(`notes ${id}: not a text`);
    const p = `decisions/${item}/${gate}-${n}-notes.md`;
    files[p] = text;
    of.notes.push(p);
  }
  for (const e of R.log || []) {
    const { item, gate, n } = parts(e && e.card);
    const t = RealDate.parse(e.raised);
    if (!Number.isFinite(t)) fail(`log ${e.card}: raised ${e.raised} is not a time`);
    const p = `dispatch-log/${new RealDate(t).toISOString().slice(0, 7)}.jsonl`;
    files[p] = (files[p] || '') + `${JSON.stringify({ action: 'card', time: e.raised, item, gate, card: Number(n) })}\n`;
    if (!of.log.includes(p)) of.log.push(p);
  }
  for (const q of R.questions || []) {
    if (!isStr(q)) fail('a question is not a name');
    files[`questions/${q}.md`] = `# Ruling needed: ${q}\n\nWHY: made up for the baseline run.\n`;
  }
  for (const pr of R.pulls || []) if (!pr || !Number.isInteger(pr.number) || !isStr(pr.title)) fail('a pull request has no number or title');
  return { files, of };
}

const cardKey = (id) => `${PROJECT}|${GATES.includes(ID_RE.exec(id)[2]) ? 'gate' : 'card'}|queue/${id}.md`;
const entries = (R) => [
  ...Object.keys(R.queue || {}).map((id) => ({ id, key: cardKey(id) })),
  ...(R.questions || []).map((q) => ({ id: `question:${q}`, key: `${PROJECT}|question|questions/${q}.md` })),
  ...(R.pulls || []).map((p) => ({ id: `pr:${p.number}`, key: `${PROJECT}|pr|${p.number}` })),
];

// ---------------------------------------------------------------------------------------------------------------
// The page.

async function loadPage({ R, recs, failing, form, config, moment, hash, search }) {
  const { repo, pr, gitSha } = await import('../fake-desk.mjs');
  const { loadSandbox } = await import('../sandbox-helpers.mjs');
  const r = repo(recs.files, (R.pulls || []).map((p) => pr(p.number, p.title)));
  if (failing.size) {
    if (form === 'path') r.blobNull = [...failing];
    else r.blobFail = [...failing].map((p) => gitSha(recs.files[p]));
  }
  const app = await loadSandbox({ config, repos: { [PROJECT]: r }, hash, search, now: moment });
  await app.advance(0);
  if (!app.server.calls.some((x) => x.path === '/api/poll')) fail('the page made no read');
  return app;
}

const walk = (n, pred, out = []) => { for (const ch of (n && n.children) || []) { if (ch && ch.tag) { if (pred(ch)) out.push(ch); walk(ch, pred, out); } } return out; };
const hasClass = (e, cls) => ` ${e.className} `.includes(` ${cls} `);
const dk = (e) => (e.dataset && e.dataset.k) || '';
const textOf = (e) => String(e.textContent).trim();

async function deskPage({ R, recs, failing, form, config, moment }) {
  const app = await loadPage({ R, recs, failing, form, config, moment, hash: '#/', search: '' });
  try {
    const want = entries(R);
    // Home.
    if (app.loc.hash !== '#/' && app.loc.hash !== '') fail(`Home's address became ${app.loc.hash}`);
    const head = walk(app.view, (e) => hasClass(e, 'v2-bt1'))[0];
    if (!head) fail('Home drew no head');
    const hm = /^(\d+) needs? you$/.exec(textOf(head));
    let homeCount;
    if (hm) homeCount = Number(hm[1]);
    else {
      const badge = walk(app.view, (e) => dk(e) === 'badge')[0];
      const bn = badge ? /^\d+$/.exec(textOf(badge.children.find((x) => x.tag) || badge)) : null;
      if (badge && !bn) fail(`Home's badge is not a count: ${textOf(badge)}`);
      homeCount = bn ? Number(bn[0]) : 0;
    }
    const brief = walk(app.view, (e) => dk(e) === 'brief')[0];
    const homeLines = [
      ...(brief ? walk(brief, (e) => hasClass(e, 'v2-bt3')).map(textOf).filter(Boolean) : []),
      ...walk(app.view, (e) => hasClass(e, 'v2-tile')).flatMap((t) => walk(t, (e) => hasClass(e, 'v2-ln') && hasClass(e, 'bad')).map(textOf)),
    ];
    // The queue.
    await app.go(`#/p/${PROJECT}/queue`);
    if (!/^#\/waiting\//.test(app.loc.hash)) fail(`the queue's address became ${app.loc.hash}`);
    const drawn = (key) => walk(app.view, (e) => e.dataset && e.dataset.card === key).length > 0;
    const onList = new Map(want.map((w) => [w.id, drawn(w.key)]));
    const queueLines = walk(app.view, (e) => hasClass(e, 'v2-ql')).map(textOf);
    // The board.
    await app.go('#/waiting');
    if (app.loc.hash !== '#/waiting') fail(`the board's address became ${app.loc.hash}`);
    const onBoard = new Map(want.map((w) => [w.id, drawn(w.key)]));
    // Each card's sheet.
    const sheets = new Map();
    for (const w of want) {
      await app.go(`#/waiting/card/${encodeURIComponent(w.key)}`);
      const sheet = walk(app.view, (e) => hasClass(e, 'v2-sheet'))[0] || null;
      const buttons = sheet ? walk(sheet, (e) => dk(e).startsWith(`ans:${w.key}:`)).length > 0 : false;
      let marked = null;
      if (sheet) {
        const opts = walk(sheet, (e) => /^opt:/.test(dk(e)) && walk(e, (x) => hasClass(x, 'v2-rec')).length > 0);
        if (opts.length > 1) fail(`${w.id}: more than one option marked Recommended`);
        if (opts.length) marked = dk(opts[0]).slice(4);
      }
      sheets.set(w.id, { buttons, marked });
      await app.go('#/waiting');
    }
    const cards = want.map((w) => ({ id: w.id, on_list: onList.get(w.id), on_board: onBoard.get(w.id), buttons: sheets.get(w.id).buttons, marked: sheets.get(w.id).marked }))
      .sort(byId);
    return { cards, home_count: homeCount, lines: [...queueLines, ...homeLines] };
  } finally {
    app.restore();
  }
}

async function openPage({ c, R, recs, failing, form, config, moment }) {
  const o = c.open;
  if (!o || !isStr(o.id) || !ID_RE.test(o.id) || !['notice', 'link'].includes(o.via)) fail(`case ${c.case}: no open id or via`);
  const key = cardKey(o.id);
  const enc = encodeURIComponent(key);
  const at = o.via === 'notice' ? { hash: '', search: `?open=${enc}` } : { hash: `#/waiting/card/${enc}`, search: '' };
  const app = await loadPage({ R, recs, failing, form, config, moment, ...at });
  try {
    const lands = app.loc.hash;
    let shows;
    if (o.via === 'notice') {
      const b = walk(app.view, (e) => dk(e) === 'tap-banner')[0];
      if (!b) fail('the page drew no arrival line for the notice');
      shows = textOf(b);
    } else {
      const sheet = walk(app.view, (e) => hasClass(e, 'v2-sheet'))[0];
      shows = sheet ? textOf(sheet) : '';
    }
    const buttons = walk(app.view, (e) => dk(e).startsWith(`ans:${key}:`)).length > 0;
    const asId = (t) => [enc, key, o.id, TITLE_LINE].reduce((s, x) => s.split(x).join('<id>'), t);
    return { buttons, lands: asId(lands), shows: asId(shows) };
  } finally {
    app.restore();
  }
}

// ---------------------------------------------------------------------------------------------------------------
// The sender: its fake world and one run at a time.

async function senderWorld({ nh, config, project, vapid, moment }) {
  const { makeSubscription, makeZip, decryptPush, pull, REPO_ID, ownWorkflowRun } = nh;
  const { runSender } = await import('../../../src/notify/sender.mjs');
  const { repo: fakeRepo } = await import('../fake-desk.mjs');
  const sub = makeSubscription();
  const stateKey = randomBytes(32).toString('hex');
  const scratch = mkdtempSync(join(tmpdir(), 'baseline-adapter-'));
  const R = project.repo;
  const stateRuns = [];
  const artifacts = [];
  let pulls = [];
  let pushes = [];
  const ART_HOST = 'artifacts.example.invalid';
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'x-ratelimit-remaining': '4000' } });
  const fetch = async (url, init = {}) => {
    const u = new URL(String(url));
    const method = (init.method || 'GET').toUpperCase();
    if (String(url) === sub.endpoint) {
      pushes.push(Buffer.from(init.body || []));
      return new Response('', { status: 201 });
    }
    if (u.hostname === ART_HOST) {
      const a = artifacts.find((x) => `/zip/${x.id}` === u.pathname);
      return a ? new Response(a.zip, { status: 200 }) : new Response('', { status: 404 });
    }
    if (u.hostname !== 'api.github.com') fail(`the sender asked an unknown host: ${u.hostname}`);
    const p = u.pathname;
    const q = u.searchParams;
    const base = `/repos/${R}`;
    if (method === 'GET' && p === `${base}/actions/workflows/desk-notify.yml/runs`) {
      const runs = stateRuns.filter((r) => (q.get('status') === 'success' ? r.conclusion === 'success' : r.status === 'completed')).sort((a, b) => b.id - a.id);
      return json(200, { total_count: runs.length, workflow_runs: runs });
    }
    let m = /^\/repos\/[^/]+\/[^/]+\/actions\/runs\/(\d+)\/artifacts$/.exec(p);
    if (method === 'GET' && m) return json(200, { artifacts: artifacts.filter((a) => a.workflow_run.id === Number(m[1])).map(({ zip, ...a }) => a) });
    m = /^\/repos\/[^/]+\/[^/]+\/actions\/artifacts\/(\d+)\/zip$/.exec(p);
    if (method === 'GET' && m) return new Response(null, { status: 302, headers: { location: `https://${ART_HOST}/zip/${m[1]}`, 'x-ratelimit-remaining': '4000' } });
    if (method === 'GET' && p === `${base}/actions/artifacts`) return json(200, { total_count: 0, artifacts: [] });
    if (method === 'GET' && p === `${base}/pulls` && q.get('state') === 'open') return json(200, q.get('page') && q.get('page') !== '1' ? [] : pulls);
    m = /^\/repos\/[^/]+\/[^/]+\/pulls\/(\d+)\/files$/.exec(p);
    if (method === 'GET' && m) return json(200, []);
    if (method === 'GET' && p === `${base}/actions/runs` && q.get('status') === 'waiting') return json(200, { total_count: 0, workflow_runs: [] });
    if (method === 'GET' && p === `${base}/issues`) return json(200, []);
    fail(`the sender made a request the fake GitHub does not answer: ${method} ${p}${u.search}`);
  };
  let nextRun = 1000;
  return {
    async run({ tree, texts, failing, pulls: casePulls = [] }) {
      pulls = casePulls.map((x) => pull(x.number, { title: x.title }));
      pushes = [];
      const id = nextRun++;
      const outDir = join(scratch, `run-${id}`);
      mkdirSync(outDir);
      const head = fakeRepo(Object.fromEntries(texts)).head();
      const checkout = {
        head, shallow: false, tree,
        blobs(paths) {
          if (paths.some((x) => failing.has(x))) throw new Error('a failing record');
          const out = new Map();
          for (const x of paths) if (tree.has(x)) out.set(x, texts.get(x));
          return out;
        },
        oldestAdd: () => null,
        isAncestor: () => null,
        git: () => { throw new Error('no git in the baseline checkout'); },
      };
      const logs = [];
      const env = { GITHUB_REPOSITORY: R, GITHUB_REPOSITORY_ID: String(REPO_ID), GITHUB_EVENT_NAME: 'schedule', GITHUB_TOKEN: 'made-up-workflow-token',
        DESK_VAPID_PRIVATE_KEY: vapid.pem, DESK_VAPID_SUBJECT: 'mailto:owner@example.invalid', DESK_PUSH_SUBSCRIPTION: sub.value, DESK_NOTIFY_STATE_KEY: stateKey };
      let code;
      try {
        code = await runSender({ project, config, env, fetch, now: () => moment, sleep: async () => {}, openCheckout: () => checkout, log: (l) => logs.push(l), outDir });
      } catch (e) {
        fail(`the sender threw: ${e && e.stack ? e.stack : e}\n${logs.join('\n')}`);
      }
      if (code !== 0) fail(`the sender exited ${code}:\n${logs.join('\n')}`);
      // Workflow 3's upload step, as tests/desk/notify-helpers.mjs's harness makes it.
      const at = new RealDate(moment).toISOString();
      stateRuns.push({ id, path: '.github/workflows/desk-notify.yml', repository: { full_name: R }, head_repository: { full_name: R }, head_branch: 'main',
        event: 'schedule', status: 'completed', conclusion: 'success', created_at: at });
      if (existsSync(join(outDir, 'state.json'))) {
        const zip = makeZip({ 'state.json': readFileSync(join(outDir, 'state.json')), 'state.sig': readFileSync(join(outDir, 'state.sig')) });
        artifacts.push({ id: id + 50000, name: 'desk-notify-state', expired: false, size_in_bytes: zip.length, created_at: at, workflow_run: ownWorkflowRun(id), zip });
      }
      return pushes.map((body) => {
        const n = JSON.parse(decryptPush(body, sub).text).notification;
        if (!n || !isStr(n.title) || !isStr(n.body) || !isStr(n.navigate)) fail('a caught push is not a notification with title, body and navigate');
        return { words: `${n.title}\n${n.body}`, opens: n.navigate };
      });
    },
    done() { rmSync(scratch, { recursive: true, force: true }); },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// AC14's stand-in: src/lib/waiting.js as collect.mjs imports it, with `waitingSet` giving this run's list.

const STAND_IN = Symbol.for('baseline-adapter.run-list');
function installStandIn() {
  const waitingUrl = new URL('../../../src/lib/waiting.js', import.meta.url).href;
  const recordsUrl = new URL('../../../src/lib/records.js', import.meta.url).href;
  const collectUrl = new URL('../../../src/notify/collect.mjs', import.meta.url).href;
  const standInUrl = `${waitingUrl}?baseline-stand-in`;
  const source = `export * from ${JSON.stringify(waitingUrl)};
import * as real from ${JSON.stringify(waitingUrl)};
import { parseCardPath, questionName } from ${JSON.stringify(recordsUrl)};
export function waitingSet(input) {
  const list = globalThis[Symbol.for('baseline-adapter.run-list')];
  const flagged = list.map((x) => {
    if (x.kind === 'question') {
      const name = String(x.id).replace(/^question:/, '');
      const path = 'questions/' + name + '.md';
      if (questionName(path) !== name) throw new Error('not a question id: ' + x.id);
      return { kind: 'question', question: { path, name, title: name } };
    }
    if (x.kind === 'pr') {
      const n = Number(String(x.id).replace(/^pr:/, ''));
      if (!Number.isInteger(n)) throw new Error('not a pull request id: ' + x.id);
      return { kind: 'pr', pr: { number: n, title: null } };
    }
    const card = parseCardPath('queue/' + x.id + '.md');
    if (!card || card.gate !== x.kind) throw new Error('not a card id of kind ' + x.kind + ': ' + x.id);
    return { kind: 'card', card: { ...card, parsed: null } };
  });
  const items = real.waitingSet({ ...input, model: { ...(input.model || {}), flagged } });
  const content = new Map(list.map((x) => [x.id, x.content]));
  return items.map((it) => ({ ...it, content: content.get(it.kind === 'question' ? 'question:' + questionName(it.id) : it.kind === 'pr' ? 'pr:' + it.id : it.id.replace(/^queue\\//, '').replace(/\\.md$/, '')) }));
}
`;
  registerHooks({
    resolve(specifier, context, next) {
      const r = next(specifier, context);
      if (context.parentURL === collectUrl && r.url === waitingUrl) return { ...r, url: standInUrl, shortCircuit: true };
      return r;
    },
    load(url, context, next) {
      if (url === standInUrl) return { format: 'module', source, shortCircuit: true };
      return next(url, context);
    },
  });
}

// ---------------------------------------------------------------------------------------------------------------
// The output's form (J7, lines 153-157): a missing field or a wrong type fails the run.

function check(c, out) {
  const r = out.result;
  const isNotice = (n) => n && isStr(n.words) && isStr(n.opens) && Object.keys(n).length === 2;
  if (c.kind === 'desk') {
    if (!Array.isArray(r.cards) || !r.cards.every((e) => isStr(e.id) && [e.on_list, e.on_board, e.buttons].every((b) => typeof b === 'boolean') && (e.marked === null || isStr(e.marked)))) fail('cards not in form');
    if (!Number.isInteger(r.home_count)) fail('home_count is not an integer');
    if (!Array.isArray(r.lines) || !r.lines.every(isStr)) fail('lines not in form');
    if (!Array.isArray(r.notices) || !r.notices.every(isNotice)) fail('notices not in form');
  } else if (c.kind === 'sender') {
    if (!Array.isArray(r.notices) || r.notices.length !== c.runs.length || !r.notices.every((ns) => Array.isArray(ns) && ns.every(isNotice))) fail('notices not in form');
  } else if (typeof r.buttons !== 'boolean' || !isStr(r.lands) || !isStr(r.shows)) fail('open result not in form');
}

main().then(() => process.exit(0), (e) => {
  process.stderr.write(`baseline adapter: ${e && e.stack ? e.stack : e}\n`);
  process.exit(1);
});
