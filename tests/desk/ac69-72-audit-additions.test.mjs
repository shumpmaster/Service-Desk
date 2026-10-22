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
  '.sb-qrow.g-decisions, .sb-qrow.g-gates, .sb-qrow.g-merges', '.sb-you', '.sb-you-st.you', '.sb-last', '.sb-last-l', '.sb-ask.open', '.sb-axis .bar.card', '.sb-q',
  // AC69, changed by AC80 (the board) and AC81 (the bar): vermilion marks only what waits on the owner,
  // the kind icon of a card in "Waiting on you" or "Kicked back" and the Waiting tab's badge.
  '.v2-badge', '.v2-kd .v2-k',
  // AC69 with AC82 (stage 2): Home's ◆, the diamond beside what waits on the owner (the briefing, a group's
  // header, a tile's "wait on you" and a gate's "Next:", the timeline's gate cell), drawn as an SVG.
  '.v2-s .you', '.v2-k.st-you .you'];

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
  // AC80: nothing in Done or in the quiet lines is coral; a Done card's kind icon is grey; the sheets' gaps grey.
  assert.match(rules().find((r) => r.sel === '.v2-kd.done .v2-k').body, /color: var\(--ink2\)/);
  assert.match(rules().find((r) => r.sel === '.v2-sheet .gap').body, /color: var\(--ink2\)/);
  for (const sel of coral) assert.doesNotMatch(sel, /done|drow|v2-ql|v2-quiet|v2-flist|v2-qfold|gap|v2-wl|v2-unb|v2-src|v2-facts/, sel);
});

test('AC69 + AC80: on Home, Status, Timeline, Team and Waiting (the cards\' sheets), each agents\' gap shows its words in slate, never inside the owner\'s coral, with "for the agents to add" and "for the agents to file"', async () => {
  // From stage 3 (AC83, specs/S-001.md:6768-6771 and :6819; AC84, :6915-6916): the page in the Status screen's place says "<phase> ran again from <date> · why it
  // went back: not recorded" (AC70's words, in AC83's line) and, once per phase list, that no standard
  // milestone's why is written yet (P-001-why-line.md, A), never "why: not recorded" on a row.
  const GAP = /^(Why not recorded yet · for the agents to add|why: not recorded|Why each is taken on or skipped: not written yet\. .+'s Chief of Staff writes its lines\.|[A-Z][a-z]+ ran again from \d+ [A-Z][a-z]{2} · why it went back: not recorded|\d+ sprints? · (\d+ )?for the agents to file|Unblocks: milestone not recorded|Context: not recorded|not recorded|feeds: not tied to a milestone| · sprint: not recorded|Run \d began · why it went back: not recorded)$/;
  const coralClass = /\b(sb-you|sb-needs|sb-pill|sb-badge|sb-btn|sb-last|sb-ask|sb-q|sb-hg-you|who-you|i-you|v2-badge|v2-kd)\b/;
  const seen = new Set();
  const check = (root, where) => {
    const walk = (e, chain) => {
      if (!e || !e.children) return;
      const t = e.textContent ? e.textContent.trim() : '';
      const inBullet = chain.some((x) => /\b(sb-bul|v2-bl)\b/.test(x.className || '')); // v2-bl: AC84's label rows
      if (GAP.test(t) && (t !== 'not recorded' || inBullet) && !e.children.some((c) => c.tag && GAP.test((c.textContent || '').trim()))) {
        const words = t.replace(/^\d+ sprints? · (\d+ )?/, '<n> sprints · ').replace(/Run \d/, 'Run <k>').replace(/^[A-Z][a-z]+ ran again from \d+ [A-Z][a-z]{2}/, '<phase> ran again from <date>')
          .replace(/^Why each is taken on or skipped: not written yet\. .+'s Chief/, 'Why each is taken on or skipped: not written yet. <project>\'s Chief');
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
    // From stage 1a (AC80): the Queue screen goes; Waiting, with only that project shown, in its place.
    for (const s of ['#/', '#/p/Service-Desk', '#/p/Service-Desk/timeline', '#/p/Service-Desk/team', '#/waiting/Service-Desk']) {
      await app.go(s);
      await openFolds(app);
      await openFolds(app, 'v2-fold'); // the page's phase lines and the Timeline's folds (AC83, AC84)
      check(app.view, s);
      // AC83 (P-001-why-line.md, A): on the page no row reads "why: not recorded".
      if (s === '#/p/Service-Desk') assert.doesNotMatch(app.view.textContent, /why: not recorded/, 'the page: never "why: not recorded" on a row');
    }
  } finally {
    app.restore();
  }
  // "why: not recorded" (the Status screen's, on every milestone) gives way to the page's one line per phase
  // (AC83; AC57, changed by AC83), and AC70's words on the page are AC83's "<phase> ran again from <date>".
  for (const w of ['Why not recorded yet · for the agents to add', '<n> sprints · for the agents to file', 'Why each is taken on or skipped: not written yet. <project>\'s Chief of Staff writes its lines.',
    'feeds: not tied to a milestone', 'not recorded', 'Run <k> began · why it went back: not recorded', '<phase> ran again from <date> · why it went back: not recorded']) assert.ok(seen.has(w), `seen: ${w}`);
  // The cards' gaps, in each card's sheet over Waiting (AC80), on AC52's fixture (Service-Desk has nothing waiting at 3117150).
  const a = await (await import('./sandbox-fixtures.mjs')).opened(twoProjects(), '#/waiting/Alpha');
  try {
    const hrefs = byClass(findAll(a.view, (e) => e.dataset && e.dataset.k === 'lane:wait')[0], 'v2-card').map((c) => byClass(c, 'v2-t')[0].attrs.href);
    assert.ok(hrefs.length >= 4, `${hrefs.length} cards`);
    let unb = 0;
    let ctx = 0;
    for (const h of hrefs) {
      await a.go(h);
      await openFolds(a, 'v2-fold');
      check(a.view, `Alpha: the sheet at ${h}`);
      unb += byClass(a.view, 'v2-unb-l').filter((x) => x.textContent === 'Unblocks: milestone not recorded').length;
      ctx += findAll(a.view, (e) => e.textContent === 'Context: not recorded' && /\bgap\b/.test(e.className || '')).length;
    }
    assert.ok(unb > 0 && ctx > 0, `${unb} and ${ctx}`);
  } finally {
    a.restore();
  }
});

// ---------------------------------------------------------------------------
// AC70

// Rewritten in stage 3 (S-001 AC83, specs/S-001.md:6768-6771: "Under the strip, in small text: "<phase> ran
// again from <date> · why it went back: <the reason quoted from its record, with its source | not recorded>"
// for each phase that ran again (AC70, unchanged in its sources)"): the Status screen's line beside the
// curve gives way to the page's line under the strip; the Timeline's stays under its band.
test('AC70, with AC83: "Design ran again from 8 Oct · why it went back: not recorded" under the page\'s strip, and "Run 2 began · why it went back: not recorded" for Design i2 on the Timeline (under the band\'s name), from the same record, in the agents\' grey', async () => {
  const app = await openSD('#/p/Service-Desk');
  try {
    const under = keyed(app, 'under');
    const line = keyed(app, 'again:Design-i2');
    assert.equal(line.textContent, 'Design ran again from 8 Oct · why it went back: not recorded');
    assert.match(line.className, /\bgap\b/, 'the agents\' grey (AC69)');
    assert.equal(under.children.indexOf(line), 0, 'under the strip, before "Your last action"');
    assert.equal(byClass(under, 'v2-small').length, 1, 'no other phase ran again');
    await app.go('#/p/Service-Desk/timeline');
    const blk = findAll(app.view, (e) => e.attrs && e.attrs['data-run'] === 'Design-i2')[0];
    const tb = byClass(blk, 'sb-began')[0];
    assert.equal(tb.textContent, 'Run 2 began · why it went back: not recorded');
    assert.match(tb.className, /\bgap\b/);
    assert.match(tb.className, /\brun2\b/, 'the run\'s shade');
    const band = byClass(blk, 'sb-pband')[0];
    assert.equal(blk.children.indexOf(band), 0, 'the band first');
    const seg = keyed(app, 'seg:Design-i2');
    assert.equal(seg.children.indexOf(tb), 0, 'then, under the band\'s name, at the top of its run');
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

test('AC71: no line when something waits, for a project not Active (Done or Closed), for one that can\'t be read, while its reads are not all in; in slate on the tile under who is at work (AC82); the tiles\' order unchanged', async () => {
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
      // From stage 2 (AC82, frame H5): on the tile, under who is at work and what comes next, in grey.
      const parent = card.parent;
      const next = parent.children.findIndex((c) => /\bv2-ln\b/.test(c.className || '') && /^Next:/.test(c.textContent));
      assert.ok(next >= 0 && parent.children.indexOf(card) === next + 1, 'under the tile\'s "Next:" line, after who is at work');
      assert.ok(parent.className.split(' ').includes('v2-tile'));
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

test('AC72 + AC80: on the page — each waiting deploy an "Approve ↗" card, its sheet holding AC72\'s row words, source and links; a push run and a hand-started one; the approval itself stays on GitHub', async () => {
  const r = sdRepo({ extra: { 'reviews/77/reviewer.md': 'Verdict: PASS\n\nMade up for the test (NOT a real record).\n' } });
  const head = r.head();
  // J12's built answer with PR #77's merge commit made the fake repository's head (NOT as GitHub sent it).
  r.pullsAnswer = answerOf(pullNodes().map((n) => (n.number === 77 ? { ...n, mergeCommit: { oid: head } } : n)));
  r.runs.push({ name: 'desk-deploy', path: '.github/workflows/desk-deploy.yml', status: 'waiting', conclusion: null, event: 'push' },
    { name: 'desk-deploy', path: '.github/workflows/desk-deploy.yml', status: 'waiting', conclusion: null, event: 'workflow_dispatch', run_number: 7,
      headSha: head, title: `deploy ${'e'.repeat(40)} — production` },
    { name: 'desk-deploy', path: '.github/workflows/desk-deploy.yml', status: 'waiting', conclusion: null, event: 'workflow_dispatch', run_number: 8,
      headSha: head, title: 'deploy main — no sha' });
  // AC80: a deploy to approve is a card in a `deploysNeedOwner` project (J7).
  const app = await loadSandbox({ config: { ...CONFIG, projects: [{ ...SD3, deploysNeedOwner: true }] }, repos: { 'Service-Desk': r }, hash: '#/waiting/Service-Desk', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    await app.advance(61_000);
    const cards = byClass(findAll(app.view, (e) => e.dataset && e.dataset.k === 'lane:wait')[0], 'v2-card').filter((c) => byClass(c, 'v2-kd')[0].textContent === 'Deploy');
    assert.equal(cards.length, 3);
    for (const c of cards) {
      const step = byClass(c, 'v2-step')[0];
      assert.equal(step.textContent, 'Approve ↗');
      assert.match(step.attrs.href, /\/actions\/runs\/\d+$/, 'the run on GitHub, where the owner approves');
    }
    // Each card's sheet: AC72's row words, word for word.
    const safe = [];
    for (const c of cards) {
      await app.go(byClass(c, 'v2-t')[0].attrs.href);
      safe.push(byClass(byClass(app.view, 'v2-sheet')[0], 'v2-safe')[0]);
      await app.go('#/waiting/Service-Desk');
    }
    const by = (words) => safe.find((x) => byClass(x, 'v2-safe-l')[0].textContent === words);
    const ok = by("Matches PR #77's merge · Reviewer PASS");
    assert.ok(ok);
    assert.deepEqual(linksIn(byClass(ok, 'v2-small')[0]).map((l) => [l.text, l.href]), [['reviews/77/reviewer.md', 'https://github.com/shumpmaster/Service-Desk/blob/main/reviews/77/reviewer.md'],
      [`the merge commit on main`, `https://github.com/shumpmaster/Service-Desk/commit/${head}`]]);
    const bad = by("Doesn't match a reviewed pull request: don't approve");
    assert.ok(bad);
    assert.equal(findAll(byClass(bad, 'v2-safe-l')[0], (e) => /\bvi-x\b/.test(e.attrs.class || '')).length, 1, 'a ✕ mark, with its words (AC42)');
    assert.match(bad.textContent, /no merge of a passed pull request has this commit/);
    const cant = by("Can't check this deploy yet");
    assert.ok(cant);
    assert.match(cant.textContent, /the deploy's commit isn't readable from its title/, 'the reason in the sheet');
    for (const x of safe) assert.ok(linksIn(x).some((l) => /\/actions\/runs\/\d+$/.test(l.href)), 'the run on GitHub, linked');
  } finally {
    app.restore();
  }
});

test('AC72 (the desk follow-ups, 2026-10-17) + AC80: a push run titled `deploy <sha>` alone, as from Setup CS14 — its `name` and `display_title` both, as GitHub gives them — reads "deploy <sha>: waiting for approval" with "Matches PR #77\'s merge · Reviewer PASS" under it, in its card\'s sheet; a hand-started run keeps `deploy <sha> — <note>`', async () => {
  const r = sdRepo({ extra: { 'reviews/77/reviewer.md': 'Verdict: PASS\n\nMade up for the test (NOT a real record).\n' } });
  const head = r.head();
  // J12's built answer with PR #77's merge commit made the fake repository's head (NOT as GitHub sent it).
  r.pullsAnswer = answerOf(pullNodes().map((n) => (n.number === 77 ? { ...n, mergeCommit: { oid: head } } : n)));
  // Made-up waiting runs (NOT real records): a push run in CS14's title form, its `name` and
  // `display_title` the same, and a hand-started run naming the same commit with a note.
  r.runs.push({ name: `deploy ${head}`, title: `deploy ${head}`, path: '.github/workflows/desk-deploy.yml', status: 'waiting', conclusion: null, event: 'push', run_number: 12 },
    { name: `deploy ${head} — preview redeploy`, title: `deploy ${head} — preview redeploy`, path: '.github/workflows/desk-deploy.yml', status: 'waiting', conclusion: null,
      event: 'workflow_dispatch', run_number: 13, headSha: head });
  // AC80: a deploy to approve is a card in a `deploysNeedOwner` project (J7).
  const app = await loadSandbox({ config: { ...CONFIG, projects: [{ ...SD3, deploysNeedOwner: true }] }, repos: { 'Service-Desk': r }, hash: '#/waiting/Service-Desk', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    await app.advance(61_000);
    const cards = byClass(findAll(app.view, (e) => e.dataset && e.dataset.k === 'lane:wait')[0], 'v2-card').filter((c) => byClass(c, 'v2-kd')[0].textContent === 'Deploy');
    assert.equal(cards.length, 2);
    const sheets = [];
    for (const c of cards) {
      await app.go(byClass(c, 'v2-t')[0].attrs.href);
      sheets.push(byClass(byClass(app.view, 'v2-sheet')[0], 'v2-safe')[0]);
      await app.go('#/waiting/Service-Desk');
    }
    const push = sheets.find((x) => x.textContent.includes('run 12'));
    const hand = sheets.find((x) => x.textContent.includes('run 13'));
    const line = (x) => byClass(x, 'v2-deploy-l')[0].textContent;
    assert.ok(line(push).startsWith(`deploy ${head}: waiting for approval`), line(push));
    assert.ok(!/ — /.test(line(push).split(': waiting for approval')[0]), 'the push run\'s title is `deploy <sha>` alone');
    assert.ok(linksIn(byClass(push, 'v2-deploy-l')[0]).some((l) => /\/actions\/runs\/\d+$/.test(l.href)), 'linked to the run');
    assert.equal(byClass(push, 'v2-safe-l')[0].textContent, "Matches PR #77's merge · Reviewer PASS");
    assert.deepEqual(linksIn(byClass(push, 'v2-small')[0]).map((l) => [l.text, l.href]), [['reviews/77/reviewer.md', 'https://github.com/shumpmaster/Service-Desk/blob/main/reviews/77/reviewer.md'],
      ['the merge commit on main', `https://github.com/shumpmaster/Service-Desk/commit/${head}`]]);
    // The hand-started run keeps its note; its commit is read from that title (AC72's parse).
    assert.ok(line(hand).startsWith(`deploy ${head} — preview redeploy: waiting for approval`), line(hand));
    assert.equal(byClass(hand, 'v2-safe-l')[0].textContent, "Matches PR #77's merge · Reviewer PASS");
  } finally {
    app.restore();
  }
});
