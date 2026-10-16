// AC69 (the agents' gaps in slate, coral only for the owner), AC70 (why a run began), AC71 (the
// stalled line on a Home card) and AC72 (safe to approve, on each waiting deploy), trial-view notes 2,
// notes 32 to 35 (2026-10-16). From J11's fixture, J12's fixture (built from REST answers, NOT as
// GitHub sent it), AC52's two-project fixtures, and made-up records (NOT real records) where named.
// ac-test: S-001/AC69 ac-test: S-001/AC70 ac-test: S-001/AC71 ac-test: S-001/AC72
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SRC, CONFIG } from './helpers.mjs';
import { byClass, findAll, linksIn, loadSandbox } from './sandbox-helpers.mjs';
import { twoProjects, v3 } from './sandbox-fixtures.mjs';
import { openSD, keyed, models, sdRepo, SD3, TZ, NOW, openFolds, pullNodes, answerOf, node, j11Files } from './tv2-fixtures.mjs';
import { runBegan, stalledLine, deployCheck, deployCommit } from '../../src/lib/feed.js';

const CSS = readFileSync(`${SRC}/public/sandbox.css`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rules = () => [...CSS.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }));

// ---------------------------------------------------------------------------
// AC69

/** The owner's own things AC69 lets take coral (and AC48's own coral uses: the owner tile, the rows that need the owner, the owner's lanes and bars). */
const OWNER_CORAL = ['.sb-top.you', '.sb-ic.i-you', '.sb-hg-you', '.sb-ball li.who-you', '.sb-pill.you', '.sb-badge', '.sb-btn.you', '.sb-gmark.you', '.sb-needs',
  '.sb-qrow.g-decisions, .sb-qrow.g-gates, .sb-qrow.g-merges', '.sb-you', '.sb-you-st.you', '.sb-last', '.sb-last-l', '.sb-ask.open', '.sb-axis .bar.card', '.sb-q'];

test('AC69: coral (--you) is used only for the owner\'s own things — the rules that take it are the owner\'s, none of them a why line, a "Not tied to a milestone" line or a gap', () => {
  const coral = rules().filter((r) => /var\(--you\d?\)/.test(r.body) && !r.sel.startsWith('html')).map((r) => r.sel);
  for (const sel of coral) assert.ok(OWNER_CORAL.includes(sel) || /^\.sb-lanes\.fam-you /.test(sel), `${sel} takes coral`);
  for (const sel of coral) assert.doesNotMatch(sel, /gap|sb-wl|sb-mwhy|untied|i-flag|sb-began|sb-feeds|sb-unb|sb-quote|sb-stall|sb-facts/, sel);
  // The gaps' own rule: slate.
  const gap = rules().find((r) => r.sel.split(/\s*,\s*/).includes('.gap'));
  assert.match(gap.body, /color: var\(--muted\)/);
  for (const s of ['.sb-wl.gap', '.sb-unb-l.gap', '.sb-feeds.gap', '.sb-began.gap', '.sb-meta.gap']) assert.ok(gap.sel.split(/\s*,\s*/).includes(s), s);
  assert.match(rules().find((r) => r.sel === '.sb-ic.i-flag').body, /background: var\(--muted\)/, 'the "Not tied to a milestone" diamond, filled slate');
  assert.match(rules().find((r) => r.sel === '.sb-stall').body, /color: var\(--muted\)/, 'AC71\'s line, slate');
});

test('AC69: on Home, Status, Timeline, Team and Queue, each agents\' gap shows its words in slate, never inside the owner\'s coral, with "for the agents to add" and "for the agents to file"', async () => {
  const GAP = /^(Why not recorded yet · for the agents to add|why: not recorded|\d+ sprints? · (\d+ )?for the agents to file|Unblocks: milestone not recorded|Context: not recorded|not recorded|feeds: not tied to a milestone| · sprint: not recorded|Run \d began · why it went back: not recorded)$/;
  const coralClass = /\b(sb-you|sb-needs|sb-pill|sb-badge|sb-btn|sb-last|sb-ask|sb-q|sb-hg-you|who-you|i-you)\b/;
  const seen = new Set();
  const check = (root, where) => {
    const walk = (e, chain) => {
      if (!e || !e.children) return;
      const t = e.textContent ? e.textContent.trim() : '';
      const inBullet = chain.some((x) => /\bsb-bul\b/.test(x.className || ''));
      if (GAP.test(t) && (t !== 'not recorded' || inBullet) && !e.children.some((c) => c.tag && GAP.test((c.textContent || '').trim()))) {
        const words = t.replace(/^\d+ sprints? · (\d+ )?/, '<n> sprints · ').replace(/Run \d/, 'Run <k>');
        seen.add(words);
        const slate = [e, ...chain.slice(-1)].some((x) => /\bgap\b|\bnone\b/.test(x.className || '')) || /\bsb-mwhy none\b/.test(e.className || '');
        assert.ok(slate, `${where}: "${t}" is slate (${e.className})`);
        for (const a of [e, ...chain]) assert.doesNotMatch(` ${a.className || ''} `.replace(/\bsb-qrow g-(decisions|gates|merges)\b/, ''), coralClass, `${where}: "${t}" inside coral (${a.className})`);
      }
      for (const c of e.children) walk(c, [...chain, e]);
    };
    walk(root, []);
  };
  const app = await openSD('#/');
  try {
    for (const s of ['#/', '#/p/Service-Desk', '#/p/Service-Desk/timeline', '#/p/Service-Desk/team', '#/p/Service-Desk/queue']) {
      await app.go(s);
      await openFolds(app);
      check(app.view, s);
    }
  } finally {
    app.restore();
  }
  for (const w of ['Why not recorded yet · for the agents to add', '<n> sprints · for the agents to file', 'why: not recorded', 'feeds: not tied to a milestone', 'not recorded',
    'Run <k> began · why it went back: not recorded']) assert.ok(seen.has(w), `seen: ${w}`);
  // The Queue's gaps, on AC52's fixture (Service-Desk has nothing waiting at 3117150).
  const a = await (await import('./sandbox-fixtures.mjs')).opened(twoProjects(), '#/p/Alpha/queue');
  try {
    await openFolds(a, 'ctx');
    check(a.view, 'Alpha queue');
    assert.ok(byClass(a.view, 'sb-unb-l').some((x) => x.textContent === 'Unblocks: milestone not recorded'));
    assert.ok(findAll(a.view, (e) => e.textContent === 'Context: not recorded' && /\bgap\b/.test(e.className || '')).length);
  } finally {
    a.restore();
  }
});

// ---------------------------------------------------------------------------
// AC70

test('AC70: "Run 2 began · why it went back: not recorded" for Design i2 with J11\'s fixture, on Status (beside the curve, at the top of the run) and on the Timeline (under the band\'s name), the same words', async () => {
  const app = await openSD('#/p/Service-Desk');
  try {
    const run = keyed(app, 'prun:Design-i2');
    const began = byClass(run, 'sb-began')[0];
    assert.equal(began.textContent, 'Run 2 began · why it went back: not recorded');
    assert.match(began.className, /\bgap\b/, 'slate (AC69)');
    assert.equal(run.children.indexOf(began), 0, 'at the top of the run, where its curve comes in');
    await app.go('#/p/Service-Desk/timeline');
    const blk = findAll(app.view, (e) => e.attrs && e.attrs['data-run'] === 'Design-i2')[0];
    const tb = byClass(blk, 'sb-began')[0];
    assert.equal(tb.textContent, began.textContent);
    const band = byClass(blk, 'sb-pband')[0];
    assert.ok(blk.children.indexOf(tb) === blk.children.indexOf(band) + 1, 'under the band');
    // No other run starts a new column.
    assert.equal(byClass(keyed(app, 'feed'), 'sb-began').length, 1);
  } finally {
    app.restore();
  }
});

test('AC70: with a made-up log (NOT a real record) — a dor recycle line and its answer with a Reason: line, a proxy line, a record with no Reason:, a record the tree does not hold', () => {
  const extra = {
    'decisions/P-001/dor-2.md': 'Decision: recycle\nReason: the design must start again from the owner\'s phone, not the laptop.\n',
    'decisions/P-001/dor-3.md': 'Decision: recycle\n',
  };
  const m = models({ extra });
  const ctx = m.ctx;
  const d2 = ctx.cols.runs.find((r) => r.label() === 'Design i2');
  const rows = ctx.tl.byItem.get('P-001');
  const made = (o) => {
    const run = { ...d2, item: 'P-001', first: 100000 };
    const byItem = new Map(ctx.tl.byItem);
    byItem.set('P-001', [...rows, [99990, { item: 'P-001', trigger: 'decision', gate: 'criteria', word: 'proceed', record: 'decisions/P-001/criteria-1.md', time: '2026-10-08T10:00:00Z' }],
      [99999, { item: 'P-001', trigger: 'decision', gate: 'dor', card: 2, time: '2026-10-08T15:30:00Z', ...o }]]);
    const k = new Map(ctx.cols.k);
    k.set(run, 2);
    const runs = ctx.cols.runs.map((r) => (r === d2 ? run : r));
    return runBegan({ ...ctx, tl: { ...ctx.tl, byItem }, cols: { ...ctx.cols, runs, k } }, run, TZ);
  };
  const a = made({ word: 'recycle', record: 'decisions/P-001/dor-2.md' });
  assert.deepEqual(a, { k: 2, head: 'Run 2 began · 8 Oct', quote: 'the design must start again from the owner\'s phone, not the laptop.',
    source: { words: 'your ruling · decisions/P-001/dor-2.md', href: 'https://github.com/shumpmaster/Service-Desk/blob/main/decisions/P-001/dor-2.md' } });
  assert.equal(made({ word: 'recycle', record: 'decisions/P-001/dor-2.md', proxy: true }).source.words, 'ruling by proxy · decisions/P-001/dor-2.md');
  const c = made({ word: 'recycle', record: 'decisions/P-001/dor-3.md' });
  assert.deepEqual([c.plain, c.code], ['sent back at a gate, with no reason written', 'dor: recycle']);
  assert.equal(made({ word: 'recycle', record: 'decisions/P-001/dor-9.md' }).words, 'Run 2 began · why it went back: not recorded', 'a record the tree does not hold');
  assert.equal(made({ word: 'proceed', record: 'decisions/P-001/dor-2.md' }).words, 'Run 2 began · why it went back: not recorded', 'no boundary word: no boundary line');
  // J11's added read: each boundary line's record is read (optional).
  // (tests/desk/j11-timeline.test.mjs checks reviews/<n>/; here the boundary records.)
});

test('AC70: J11 reads the record each boundary decision line names, and only those', async () => {
  const { neededReads } = await import('../../src/lib/model.js');
  const files = j11Files();
  const logPath = 'dispatch-log/2026-10.jsonl';
  const line = (o) => JSON.stringify({ item: 'P-001', trigger: 'decision', card: 2, time: '2026-10-08T15:30:00Z', ...o });
  const extra = {
    [logPath]: `${files[logPath]}${line({ gate: 'dor', word: 'recycle', record: 'decisions/P-001/dor-2.md' })}\n${line({ gate: 'dor', word: 'proceed', record: 'decisions/P-001/dor-4.md' })}\n`,
    'decisions/P-001/dor-2.md': 'Decision: recycle\nReason: x\n', 'decisions/P-001/dor-4.md': 'Decision: proceed\n',
  };
  const { snap } = models({ extra });
  const n = neededReads(SD3, snap.tree, snap.records, new Date(NOW), { j11: true });
  const paths = n.optional.blobs.map((b) => b.path);
  assert.ok(paths.includes('decisions/P-001/dor-2.md') || snap.records.has('decisions/P-001/dor-2.md'));
  const fresh = new Map([...snap.records].filter(([p]) => !p.startsWith('decisions/P-001/')));
  const n2 = neededReads(SD3, snap.tree, fresh, new Date(NOW), { j11: true }).optional.blobs.map((b) => b.path);
  assert.ok(n2.includes('decisions/P-001/dor-2.md'), 'the boundary line\'s record');
  assert.ok(!n2.includes('decisions/P-001/dor-4.md'), 'not a decision that sends nothing back');
});

// ---------------------------------------------------------------------------
// AC71

const MERGED77 = Date.parse('2026-10-16T11:18:28Z'); // J12's fixture: PR #77, the latest movement at 3117150's records
const H = 3600e3;

test('AC71: the line — none at 71 hours, "No movement for 3 days · last: PR #77 merged, 16 Oct" at 72; each kind of movement as the latest, with its words and date; the tie order', () => {
  const { snap, j } = models();
  const box = (now) => ({ read: { read: 'ok', since: now - 1000 } });
  const at = (now, o = {}) => stalledLine(SD3, box(now), o.snap || snap, o.j || j, o.model || { pulls: [] }, o.group || 'active', o.waiting || 0, now, TZ);
  assert.equal(at(MERGED77 + 71 * H), null);
  assert.deepEqual(at(MERGED77 + 72 * H), { words: 'No movement for 3 days · last: PR #77 merged, 16 Oct' });
  assert.deepEqual(at(MERGED77 + 4 * 24 * H + 5 * H), { words: 'No movement for 4 days · last: PR #77 merged, 16 Oct' });
  // Made up (NOT real records): each kind as the latest.
  const T = MERGED77 + 10 * H;
  const now = T + 80 * H;
  assert.deepEqual(at(now, { model: { pulls: [{ number: 90, updatedAt: new Date(T).toISOString() }] } }).words, 'No movement for 3 days · last: PR #90 updated, 16 Oct');
  const row = { item: 'P-001', action: 'dispatch', role: 'builder', route: 'ready-dispatch', stage: 5, time: new Date(T).toISOString(), trigger: 'step', gate: null };
  assert.match(at(now, { j: { ...j, logRows: [...j.logRows, row] } }).words, /^No movement for 3 days · last: P-001: builder started \(Produce\), 16 Oct$/);
  assert.deepEqual(at(now, { snap: { ...snap, headAt: new Date(T).toISOString() } }).words, 'No movement for 3 days · last: a commit on main, 16 Oct');
  // The tie: a merge, an update, a log entry and the head commit at the same time — the merge is named; then the update; then the entry.
  const tie = new Date(T).toISOString();
  const pulls = { ...snap.pulls, list: [...snap.pulls.list, { number: 91, mergedAt: tie }] };
  const all = { snap: { ...snap, pulls, headAt: tie }, model: { pulls: [{ number: 92, updatedAt: tie }] }, j: { ...j, logRows: [...j.logRows, row] } };
  assert.match(at(now, all).words, /last: PR #91 merged/);
  assert.match(at(now, { ...all, snap: { ...snap, headAt: tie } }).words, /last: PR #92 updated/);
  assert.match(at(now, { snap: { ...snap, headAt: tie }, j: { ...j, logRows: [...j.logRows, row] } }).words, /last: P-001: builder started/);
});

test('AC71: no line when something waits, for a project not Active (Done or Closed), for one that can\'t be read, while its reads are not all in; in slate on the card under who has the ball; the card\'s order unchanged', async () => {
  const { snap, j } = models();
  const now = MERGED77 + 80 * H;
  const box = { read: { read: 'ok', since: now - 1000 } };
  assert.equal(stalledLine(SD3, box, snap, j, { pulls: [] }, 'active', 1, now, TZ), null, 'something waits');
  assert.equal(stalledLine(SD3, box, snap, j, { pulls: [] }, 'done', 0, now, TZ), null, 'Done');
  assert.equal(stalledLine(SD3, box, snap, j, { pulls: [] }, 'closed', 0, now, TZ), null, 'Closed');
  assert.equal(stalledLine(SD3, { read: { read: 'cant-read', since: now - 1000 } }, snap, j, { pulls: [] }, 'active', 0, now, TZ), null, 'can\'t be read');
  assert.equal(stalledLine(SD3, { read: { read: 'ok', since: now - 200e3 } }, snap, j, { pulls: [] }, 'active', 0, now, TZ), null, 'not read in the last 3 minutes');
  assert.equal(stalledLine(SD3, box, { ...snap, pulls: { list: null, failure: 'not read' } }, j, { pulls: [] }, 'active', 0, now, TZ), null, 'its pull requests not in yet');
  assert.equal(stalledLine(SD3, box, snap, { ...j, ready: false }, { pulls: [] }, 'active', 0, now, TZ), null, 'its records not in yet');
  // On the page: Service-Desk (nothing waiting) and Alpha (waiting), at 71 and 72 hours.
  const order = [];
  for (const h of [71, 72]) {
    const config = { ...CONFIG, projects: [SD3, v3('Alpha')] };
    const { fullRepo } = await import('./sandbox-fixtures.mjs');
    const app = await loadSandbox({ config, repos: { 'Service-Desk': sdRepo(), Alpha: fullRepo('Alpha') }, hash: '#/', now: MERGED77 + h * H });
    try {
      await app.advance(1000);
      await app.advance(61_000);
      const card = findAll(app.view, (e) => e.dataset && e.dataset.k === 'stall:Service-Desk')[0];
      assert.equal(card.textContent, h === 71 ? '' : 'No movement for 3 days · last: PR #77 merged, 16 Oct', `${h} h`);
      const alpha = findAll(app.view, (e) => e.dataset && e.dataset.k === 'stall:Alpha')[0];
      assert.equal(alpha.textContent, '', 'Alpha has things waiting: no line');
      const parent = card.parent;
      const ball = parent.children.findIndex((c) => /\bsb-ball\b/.test(c.className || ''));
      assert.ok(ball >= 0 && parent.children.indexOf(card) === ball + 1, 'under who has the ball');
      order.push(findAll(app.view, (e) => e.dataset && /^card:/.test(e.dataset.k || '')).map((e) => e.dataset.k).join(','));
    } finally {
      app.restore();
    }
  }
  assert.equal(order[0], order[1], 'the cards\' order unchanged by the line');
});

// ---------------------------------------------------------------------------
// AC72

const M77 = pullNodes().find((n) => n.number === 77).mergeCommit.oid;

test('AC72: which commit — a push run\'s head_sha; a hand-started run\'s from its title, `deploy <sha> — <note>`; otherwise none', () => {
  const RECORDS_ONLY = 'c'.repeat(40);
  assert.equal(deployCommit({ event: 'push', headSha: M77 }), M77);
  assert.equal(deployCommit({ event: 'workflow_dispatch', headSha: RECORDS_ONLY, title: `deploy ${M77} — preview redeploy` }), M77, 'the commit the owner gave it, not main\'s head');
  for (const title of [`deploy ${M77.slice(0, 12)} — short`, 'desk-deploy', null, `Deploy ${M77} — capital`, `deploy ${M77}0 — 41 hex`]) assert.equal(deployCommit({ event: 'workflow_dispatch', headSha: RECORDS_ONLY, title }), null, String(title));
  assert.equal(deployCommit({ event: 'schedule', headSha: M77 }), null);
});

test('AC72: what the row says — matches a passed PR\'s merge (with its sources and links), a FAIL verdict, no verdict, no matching merge, J12\'s read failed, an unreadable title', () => {
  const pass = models({ extra: { 'reviews/77/reviewer.md': 'Verdict: PASS\n\nMade up for the test (NOT a real record).\n' } }).snap;
  const fail = models({ extra: { 'reviews/77/reviewer.md': 'Verdict: FAIL\n\nMade up (NOT a real record).\n' } }).snap;
  const none = models().snap;
  const push = { event: 'push', headSha: M77 };
  const ok = deployCheck(SD3, pass, push);
  assert.deepEqual(ok, { kind: 'ok', words: "Matches PR #77's merge · Reviewer PASS", sha: M77, sources: [
    { words: 'reviews/77/reviewer.md', href: 'https://github.com/shumpmaster/Service-Desk/blob/main/reviews/77/reviewer.md' },
    { words: 'the merge commit on main', href: `https://github.com/shumpmaster/Service-Desk/commit/${M77}` }] });
  assert.deepEqual(deployCheck(SD3, pass, { event: 'workflow_dispatch', headSha: 'c'.repeat(40), title: `deploy ${M77} — production` }).words, "Matches PR #77's merge · Reviewer PASS", 'a hand-started run, by its title');
  const bad = (s, run = push) => { const c = deployCheck(SD3, s, run); return [c.kind, c.words, c.reason]; };
  assert.deepEqual(bad(fail), ['bad', "Doesn't match a reviewed pull request: don't approve", "PR #77's Reviewer verdict is FAIL"]);
  assert.deepEqual(bad(none), ['bad', "Doesn't match a reviewed pull request: don't approve", 'PR #77 has no Reviewer verdict on main'], 'no reviews/77/ at 3117150');
  assert.deepEqual(bad(pass, { event: 'push', headSha: 'd'.repeat(40) }), ['bad', "Doesn't match a reviewed pull request: don't approve", 'no merge of a passed pull request has this commit']);
  const failed = { ...pass, pulls: { list: null, failure: 'GitHub\'s GraphQL rate limit' } };
  assert.deepEqual(bad(failed).slice(0, 2), ['cant', "Can't check this deploy yet"], 'J12\'s read failed: never a pass by default');
  assert.deepEqual(bad(pass, { event: 'workflow_dispatch', headSha: M77, title: 'deploy abc — no full sha' }), ['cant', "Can't check this deploy yet", "the deploy's commit isn't readable from its title"]);
  // Build review round 1, B1: a list kept from an earlier read is not current — J12's read since has
  // failed, or the read at the current head has not answered (or a cold read is under way). Then
  // "Can't check this deploy yet", never a pass and never a "don't approve" from the old list.
  const stale = { ...pass, pulls: { ...pass.pulls, list: pass.pulls.list.filter((x) => x.number !== 77), failure: "the pull requests' read failed: GitHub could not be reached" } };
  assert.deepEqual(bad(stale), ['cant', "Can't check this deploy yet", "the pull requests' read failed: GitHub could not be reached"], 'a kept list with a failure');
  assert.deepEqual(bad({ ...pass, pulls: { ...pass.pulls, failure: 'GitHub\'s GraphQL rate limit: x' } })[0], 'cant', 'even when the old list would pass');
  const notYet = { ...pass, pulls: { ...pass.pulls, list: pass.pulls.list.filter((x) => x.number !== 77), current: false } };
  assert.deepEqual(bad(notYet), ['cant', "Can't check this deploy yet", "the pull requests at the current head aren't read yet"], 'a head change whose read has not answered');
  const reading = { ...pass, records: new Map([...pass.records].filter(([p]) => p !== 'reviews/77/reviewer.md')) };
  assert.equal(deployCheck(SD3, reading, push).kind, 'cant', 'the verdict\'s blob not yet arrived');
});

test('AC72: on the page — each waiting deploy\'s row with its words, source and links; a push run and a hand-started one; no row offers an approval of its own', async () => {
  const r = sdRepo({ extra: { 'reviews/77/reviewer.md': 'Verdict: PASS\n\nMade up for the test (NOT a real record).\n' } });
  const head = r.head();
  // J12's built answer with PR #77's merge commit made the fake repository's head (NOT as GitHub sent it).
  r.pullsAnswer = answerOf(pullNodes().map((n) => (n.number === 77 ? { ...n, mergeCommit: { oid: head } } : n)));
  r.runs.push({ name: 'desk-deploy', path: '.github/workflows/desk-deploy.yml', status: 'waiting', conclusion: null, event: 'push' },
    { name: 'desk-deploy', path: '.github/workflows/desk-deploy.yml', status: 'waiting', conclusion: null, event: 'workflow_dispatch', run_number: 7,
      headSha: head, title: `deploy ${'e'.repeat(40)} — production` },
    { name: 'desk-deploy', path: '.github/workflows/desk-deploy.yml', status: 'waiting', conclusion: null, event: 'workflow_dispatch', run_number: 8,
      headSha: head, title: 'deploy main — no sha' });
  const app = await loadSandbox({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': r }, hash: '#/p/Service-Desk/queue', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    await app.advance(61_000);
    const rows = byClass(findAll(app.view, (e) => e.dataset && e.dataset.k === 'group:deploys')[0], 'sb-qrow');
    assert.equal(rows.length, 3);
    const safe = rows.map((x) => byClass(x, 'sb-safe')[0]);
    assert.equal(byClass(safe[0], 'sb-safe-l')[0].textContent, "Matches PR #77's merge · Reviewer PASS");
    assert.deepEqual(linksIn(safe[0]).map((l) => [l.text, l.href]), [['reviews/77/reviewer.md', 'https://github.com/shumpmaster/Service-Desk/blob/main/reviews/77/reviewer.md'],
      [`the merge commit on main`, `https://github.com/shumpmaster/Service-Desk/commit/${head}`]]);
    assert.equal(byClass(safe[1], 'sb-safe-l')[0].textContent, "Doesn't match a reviewed pull request: don't approve");
    assert.equal(byClass(safe[1], 'i-cross').length, 1, 'a ✕ mark, with its words (AC42)');
    assert.match(safe[1].textContent, /no merge of a passed pull request has this commit/);
    assert.equal(byClass(safe[2], 'sb-safe-l')[0].textContent, "Can't check this deploy yet");
    const fold = findAll(safe[2], (e) => e.tag === 'button')[0];
    await app.tap(fold);
    assert.match(byClass(rows[2], 'sb-safe')[0].textContent, /the deploy's commit isn't readable from its title/, 'the reason one tap away');
    for (const row of byClass(findAll(app.view, (e) => e.dataset && e.dataset.k === 'group:deploys')[0], 'sb-qrow')) {
      assert.doesNotMatch(row.textContent, /\bApprove\b/);
      assert.ok(findAll(row, (e) => e.tag === 'button').every((b) => b.attrs['aria-expanded'] != null), 'its only buttons are folds');
      assert.ok(linksIn(row).some((l) => /\/actions\/runs\/\d+$/.test(l.href)), 'the run on GitHub, where the owner approves');
    }
  } finally {
    app.restore();
  }
});
