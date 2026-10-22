// ac-test: S-001/AC87 — the portfolio, read only, its 6b parts (stage 6b, the stage table's row 6b at specs/S-001.md:1819;
// AC87 at :7070-7148, "When the portfolio is connected (6b; J23)" at :7121-7138 and its test at :7144-7148): Home's foot
// and Plan's "Ideas · from the portfolio" from a made-up portfolio in placeholder form (NOT real, tests/desk/pf-fixtures.mjs):
// ideas in each state and one unreadable; an empty queue and one card on the board under "Portfolio" with its count, its
// sheet, "Open ↗" and its confirmation; the rarer records' sheet; Quiet failing past 6 minutes unread; the phone note; and
// a failed or refused portfolio read leaving every project's read untouched. With them, J24's "An idea moved to <state>"
// (:11514-11516). 6a's cases, with no `portfolio` in J7, stay in ac87-portfolio.test.mjs.
//
// Service-Desk's records are the real ones at 77bfeae (tests/desk/fixtures/j11-77bfeae/); Personal-Org-Operating-Model is
// in poom/'s placeholder form; the portfolio is wholly made up: that repository is private and none of its files is
// copied or read here.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSandbox, findAll, byClass } from './sandbox-helpers.mjs';
import { findKeyed } from './sandbox-fixtures.mjs';
import { textRuns } from './screen-text.mjs';
import { CONFIG, J7_FILE } from './helpers.mjs';
import { PORTFOLIO_REPO } from './fake-desk.mjs';
import { waSetup, memStore } from './wa-fixtures.mjs';
import { pfFiles, cardText, IDEAS, withPortfolio, addPortfolio } from './pf-fixtures.mjs';
import { PF_WORDS, PF_ROWS, PF_BOARD, SEEN_IDEAS_KEY } from '../../src/lib/portfolio.js';
import { WA } from '../../src/lib/workahead.js';
import { KICK_BACK_MINUTES } from '../../src/lib/board.js';

const NOW = Date.parse('2026-10-22T18:00:00Z'); // 13:00 in ownerTimeZone (America/Chicago)
const CARD = 'queue/PF-001-explore-1.md';
const CARD_ID = `${PF_BOARD}|portfolio|${CARD}`;
const CARD_LINK = 'https://github.com/shumpmaster/portfolio/blob/main/queue/PF-001-explore-1.md';
const ONE = () => pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1) } });

async function open({ pf = pfFiles(), hash = '#/', store = null, fail = null, noPortfolio = false } = {}) {
  const setup = waSetup({});
  if (!noPortfolio) setup.config = withPortfolio(setup.config);
  let r = null;
  if (pf) {
    r = addPortfolio(setup.repos, pf);
    if (fail) r.fail = fail;
  }
  const app = await loadSandbox({ ...setup, hash, now: NOW, store });
  await app.advance(1000);
  await app.advance(61_000);
  app.pf = r;
  return app;
}
const block = (app) => findKeyed(app, 'portfolio');
const row = (app, k) => findKeyed(app, `pf:${k}`);
const rowLine = (app, k) => byClass(row(app, k), 'v2-small')[0];
const brief = (app) => findKeyed(app, 'brief');
const badge = (app) => { const b = byClass(app.view, 'v2-badge')[0]; return b ? b.children[0].textContent : null; };
const sheet = (app) => byClass(app.view, 'v2-sheet')[0];
const lane = (app, k) => findKeyed(app, `lane:${k}`);
const hrefs = (el) => findAll(el, (e) => e.tag === 'a').map((a) => a.attrs.href);

// ---------------------------------------------------------------------------
// Home's foot, from what the portfolio holds

test('AC87 (6b): with J7\'s `portfolio`, Home\'s foot moves from 6a\'s words to what the portfolio holds — an empty queue (only its templates) "None in the portfolio\'s queue" with the ✓; "Rarely needed"; the line under the rows as drawn, "Ideas are in Plan."; no 6a word left in the block', async () => {
  assert.deepEqual(J7_FILE.portfolio, { repo: 'shumpmaster/portfolio', defaultBranch: 'main' }, 'J7 names it (Setup P1 done)');
  const app = await open();
  try {
    assert.equal(rowLine(app, 'decisions').textContent, "None in the portfolio's queue");
    const marks = findAll(rowLine(app, 'decisions'), (e) => e.tag === 'svg').map((s) => s.attrs.class.split(' ').find((c) => c.startsWith('st-')));
    assert.deepEqual(marks, ['st-check'], 'frame H4\'s ✓ beside it');
    assert.equal(rowLine(app, 'rare').textContent, 'Rarely needed');
    assert.equal(block(app).children[block(app).children.length - 1].textContent,
      'The desk reads your portfolio repository and never changes it (your ruling, P-001-portfolio-read). Ideas are in Plan.');
    assert.doesNotMatch(block(app).textContent, /isn't connected|will read|once you add it/, 'no 6a words');
    assert.deepEqual(byClass(block(app), 'v2-prtt').map((t) => t.textContent).slice(0, 3), ['The cap on work at once', 'Decisions across projects', 'Scorecard'], 'the rows as 6a built them');
  } finally {
    app.restore();
  }
});

test('AC87 (6b): one card in the portfolio\'s queue — "1 in the portfolio\'s queue · waiting on Waiting, under "Portfolio""; on the board a group of its own named "Portfolio", after the projects\', with its count; the card\'s kind "Decision", its title from "## 1. The decision", its file, and its one step "Open ↗" opening the card file on GitHub; counted in Waiting\'s badge and Home\'s briefing', async () => {
  const app = await open({ pf: ONE() });
  try {
    assert.equal(rowLine(app, 'decisions').textContent, '1 in the portfolio\'s queue · waiting on Waiting, under "Portfolio"');
    assert.equal(badge(app), '1', 'Waiting\'s badge');
    assert.equal(byClass(brief(app), 'v2-bt1')[0].textContent, '1 needs you', 'Home\'s briefing');
    assert.match(brief(app).textContent, /1 waiting/);
    await app.go('#/waiting');
    const wait = lane(app, 'wait');
    const head = findKeyed(app, `grp:wait:${PF_BOARD}`);
    assert.ok(head, 'its group');
    assert.equal(head.tag, 'p', 'not a project, so no "show only" control');
    assert.deepEqual(textRuns(head, () => false), ['Portfolio', '1']);
    assert.equal(byClass(wait, 'v2-lc')[0].textContent, '1', 'the lane\'s count');
    const card = findKeyed(app, `card:${CARD_ID}`);
    assert.ok(card);
    assert.equal(byClass(card, 'v2-kd')[0].textContent, 'Decision');
    assert.equal(byClass(card, 'v2-t')[0].textContent, 'Whether to explore the made-up reading-list app as a project');
    assert.equal(byClass(card, 'v2-m')[0].textContent, 'PF-001-explore-1.md');
    const step = byClass(card, 'v2-step')[0];
    assert.deepEqual([step.textContent, step.attrs.href, step.attrs.target, step.attrs.rel], ['Open ↗', CARD_LINK, '_blank', 'noopener noreferrer']);
    assert.doesNotMatch(lane(app, 'wait').textContent, /Answer/, 'no answer link');
    // The projects' groups first, in J7's order; the portfolio's last.
    const groups = findAll(app.view, (e) => e.dataset && /^grp:wait:/.test(e.dataset.k || '')).map((e) => e.dataset.k);
    assert.equal(groups[groups.length - 1], `grp:wait:${PF_BOARD}`);
  } finally {
    app.restore();
  }
});

test('AC87 (6b): the portfolio card\'s sheet shows the card\'s sections as AC52 shows a card\'s — the question, why it is here, each option with what follows, the recommendation labelled, the whole record — with "Open on GitHub ↗" to the card file, no answer link, the phone note "Your phone isn\'t told about portfolio cards yet", "Done ✓" and "Close"', async () => {
  const app = await open({ pf: ONE(), hash: `#/waiting/card/${encodeURIComponent(CARD_ID)}` });
  try {
    const s = sheet(app);
    assert.ok(s, 'its sheet');
    const t = textRuns(s, () => false);
    assert.equal(byClass(s, 'v2-stitle')[0].textContent, 'Whether to explore the made-up reading-list app as a project');
    // Review round 1, N3: its milestone from the card's own `Milestone:` line (J23: "its `Milestone:` line when it has one").
    assert.ok(t.includes('portfolio · decision · PF-001-explore-1.md · PM1 · wait not recorded'), 'its head: its milestone; no raised time is read for it (J23 reads no history)');
    assert.doesNotMatch(s.textContent, /can't parse/, 'a card in the template\'s form, with no answer: line, is no parse problem (review round 1, B2)');
    for (const w of ['The question', 'Why it is here', 'A made-up idea reached shaping in the made-up idea log.', 'The options', 'explore', 'park',
      'Recommended', PF_WORDS.phoneNote, PF_WORDS.noAnswerLink]) assert.ok(t.some((x) => x.includes(w)), w);
    assert.match(s.textContent, /open it as a project \(made up\)/, 'what follows each option');
    const links = findAll(s, (e) => e.tag === 'a' && /^https:/.test(e.attrs.href || ''));
    assert.deepEqual(links.map((a) => [a.textContent, a.attrs.href]), [['Open on GitHub ↗', CARD_LINK]], 'its one link: the card file, never a new-file page');
    assert.ok(findAll(s, (e) => e.tag === 'details').some((d) => /The whole record/.test(d.textContent)), 'the whole record one tap away');
    assert.equal(findKeyed(app, 'sheet-done').textContent, 'Done ✓');
    assert.equal(findKeyed(app, 'sheet-close2').textContent, 'Close');
    assert.equal(findAll(s, (e) => e.tag === 'textarea').length, 0, 'no words box: nothing is answered here');
  } finally {
    app.restore();
  }
});

test('AC87 + AC80 (6b): "Done ✓" on a portfolio card leaves every count at once and is confirmed when the file has left the portfolio\'s queue, at its next read; a mark the queue still holds 5 minutes on is kicked back, "The card file is still in the portfolio\'s queue", and counts again', async () => {
  const app = await open({ pf: ONE(), hash: `#/waiting/card/${encodeURIComponent(CARD_ID)}`, store: memStore() });
  try {
    await app.tap(findKeyed(app, 'sheet-done'));
    await app.go('#/waiting');
    assert.equal(badge(app), null, 'out of the badge at once');
    assert.match(lane(app, 'done').textContent, /Confirming with GitHub/);
    await app.go('#/');
    assert.equal(byClass(brief(app), 'v2-bt1')[0].textContent, 'Nothing waiting on you · confirming with GitHub');
    app.pf.commit({ [CARD]: null }); // the owner answered it in the portfolio (made up): its file leaves the queue
    await app.advance(5 * 60_000);
    await app.go('#/waiting');
    const done = lane(app, 'done');
    assert.doesNotMatch(done.textContent, /Confirming/);
    assert.match(done.textContent, /Whether to explore the made-up reading-list app as a project/, 'a Done row, confirmed');
    assert.equal(byClass(done, 'v2-drow').length, 1);
    await app.go('#/');
    assert.equal(rowLine(app, 'decisions').textContent, "None in the portfolio's queue");
  } finally {
    app.restore();
  }
  const kick = await open({ pf: ONE(), hash: `#/waiting/card/${encodeURIComponent(CARD_ID)}`, store: memStore() });
  try {
    await kick.tap(findKeyed(kick, 'sheet-done'));
    // Judged at each portfolio read that succeeded (every 5 minutes): the first one KICK_BACK_MINUTES or more after the mark.
    await kick.advance(KICK_BACK_MINUTES * 60_000);
    await kick.go('#/waiting');
    assert.match(lane(kick, 'done').textContent, /Confirming with GitHub/, 'the read 4 minutes after the mark: not yet');
    await kick.advance(5 * 60_000);
    await kick.go('#/waiting');
    const k = lane(kick, 'kick');
    assert.match(k.textContent, /The card file is still in the portfolio's queue/);
    assert.equal(badge(kick), '1', 'it counts again');
  } finally {
    kick.restore();
  }
});

test('AC87 (6b): "Decisions across projects"\' sheet lists each card with its file and its place on Waiting, and the phone note; the rarer records\' sheet: the files under rulings/ and library/facts/ by name and count, "none yet" where a folder holds only its README, whether intent/ holds a file beyond its template, and "Track records: no record for this in the model yet"', async () => {
  const app = await open({ pf: pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1) }, more: { 'library/facts/F-001-made-up.md': 'Made up, NOT a real record.\n' } }) });
  try {
    await app.go('#/pf/decisions');
    const d = textRuns(sheet(app), () => false);
    assert.ok(sheet(app).textContent.includes('1 in the portfolio\'s queue · waiting on Waiting, under "Portfolio"'));
    assert.ok(d.includes('Whether to explore the made-up reading-list app as a project') && d.includes(CARD));
    assert.ok(d.includes(PF_WORDS.eachWaits) && d.includes(PF_WORDS.phoneNote));
    assert.ok(hrefs(sheet(app)).includes(`#/waiting/card/${encodeURIComponent(CARD_ID)}`), 'the card one tap away on Waiting');
    await app.go('#/pf/rare');
    const r = textRuns(sheet(app), () => false);
    // Each line whole (its names drawn in Plex Mono from Design review round 1, F2, so read as each item's text).
    const items = (app) => byClass(sheet(app), 'v2-pfsi').map((li) => li.textContent);
    assert.ok(items(app).includes('Rulings: 2 · R-001-made-up.md, R-002-made-up.md'));
    assert.ok(items(app).includes('Library facts: 1 · F-001-made-up.md'));
    assert.ok(r.includes('Standing intent: none yet'), 'its README and its template only');
    assert.ok(r.includes('Track records: no record for this in the model yet'));
    assert.deepEqual(findAll(sheet(app), (e) => e.tag === 'svg').map((s) => s.attrs.class.split(' ').find((c) => c.startsWith('st-'))).filter(Boolean), ['st-nomodel']);
  } finally {
    app.restore();
  }
  const none = await open({ pf: pfFiles({ more: { 'intent/2026-standing.md': 'Made up, NOT a real record.\n' } }) });
  try {
    await none.go('#/pf/rare');
    const r = textRuns(sheet(none), () => false);
    assert.ok(r.includes('Library facts: none yet'));
    assert.ok(byClass(sheet(none), 'v2-pfsi').map((li) => li.textContent).includes('Standing intent: 1 · 2026-standing.md'));
  } finally {
    none.restore();
  }
});

// ---------------------------------------------------------------------------
// Plan's "Ideas · from the portfolio"

test('AC87 + AC86 (6b): Plan\'s "Ideas · from the portfolio" lists each idea in the idea log, newest first, with its count, its state in words and its date in Plex Mono; an idea whose state the desk can\'t read "state not recorded"; "No ideas in the log yet" with none', async () => {
  const app = await open({ hash: '#/work' });
  try {
    const sec = findKeyed(app, 'wa-ideas');
    const head = sec.children[0];
    assert.deepEqual(textRuns(head, () => false), [WA.ideas, '7']);
    const rows = byClass(sec, 'v2-plidea');
    assert.deepEqual(rows.map((r) => [byClass(r, 'v2-plname')[0].textContent, byClass(r, 'v2-plm')[0].textContent]), [
      ['A made-up idea with another value', 'state not recorded · 2026-10-21'],
      ['A made-up idea with no state line', 'state not recorded · 2026-10-20'],
      ['A made-up habit log', 'stopped · 2026-10-19'],
      ['A made-up route planner', 're-aimed · 2026-10-18'],
      ['A made-up price tracker', 'approved · 2026-10-17'],
      ['A made-up weekly digest', 'captured · 2026-10-16'],
      ['A made-up reading-list app', 'shaping · 2026-10-15']]);
    for (const r of rows) assert.ok(byClass(r, 'v2-mono')[0].textContent.match(/^\d{4}-\d\d-\d\d$/), 'its date in Plex Mono');
    // Each state's mark beside its words, never alone (AC42); the template's own heading not an idea.
    assert.deepEqual(rows.map((r) => findAll(r, (e) => e.tag === 'svg')[0].attrs.class.split(' ').find((c) => c.startsWith('st-'))),
      ['st-unrec', 'st-unrec', 'st-cross', 'st-half', 'st-check', 'st-planned', 'st-half']);
    assert.doesNotMatch(sec.textContent, /YYYY|isn't connected/);
  } finally {
    app.restore();
  }
  const empty = await open({ hash: '#/work', pf: pfFiles({ ideas: null }) });
  try {
    assert.deepEqual(textRuns(findKeyed(empty, 'wa-ideas'), () => false), [WA.ideas, '0', PF_WORDS.noIdeas]);
  } finally {
    empty.restore();
  }
});

// ---------------------------------------------------------------------------
// Quiet's 6-minute rule (Terms; AC82's "Nothing needs you")

test('AC87 + AC82 (6b): Quiet also needs the portfolio read successfully within the last 6 minutes — "Checking…" before its first read; "Nothing needs you" while it is; past 6 minutes unread, "Can\'t read your portfolio since HH:MM" in its place, and never quiet', async () => {
  const setup = waSetup({});
  setup.config = withPortfolio(setup.config);
  const r = addPortfolio(setup.repos, pfFiles());
  r.fail = { kind: 'network' };
  // Its first read held off (the network failing) and then answering: "Checking…" is never claimed as quiet.
  const app = await loadSandbox({ ...setup, hash: '#/', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    assert.equal(byClass(brief(app), 'v2-bt1')[0].textContent, "Can't read your portfolio since 13:00", 'never read, failing: not quiet');
    r.fail = null;
    await app.advance(4 * 60_000);
    assert.equal(byClass(brief(app), 'v2-bt1')[0].textContent, 'Nothing needs you', 'read at 13:05');
    r.fail = { state: 'cant-read', reason: 'github' };
    await app.advance(5 * 60_000 + 1000); // 13:10: its read fails; read successfully 5 minutes ago
    assert.equal(byClass(brief(app), 'v2-bt1')[0].textContent, 'Nothing needs you', 'within its 6 minutes');
    await app.advance(2 * 60_000); // 13:12: past 6 minutes since 13:05 (the next drawing, at the projects' poll)
    assert.equal(byClass(brief(app), 'v2-bt1')[0].textContent, "Can't read your portfolio since 13:10", 'AC5\'s words for the portfolio');
    assert.ok(brief(app).className.split(' ').includes('k-cant'));
    assert.match(app.els['screen-state'].textContent, /Can't read your portfolio since 13:10/, 'the page\'s state is not "Quiet" either');
    assert.equal(rowLine(app, 'decisions').textContent, "Can't read your portfolio since 13:10 · None in the portfolio's queue", 'the row: why, then the queue as last read');
  } finally {
    app.restore();
  }
  const first = await loadSandbox({ ...(() => { const s = waSetup({}); s.config = withPortfolio(s.config); addPortfolio(s.repos, pfFiles()); return s; })(), hash: '#/', now: NOW });
  try {
    // Before any read has come back: "Checking…" (every project and the portfolio unread).
    assert.equal(byClass(brief(first), 'v2-bt1')[0].textContent, 'Checking…');
    assert.equal(rowLine(first, 'decisions').textContent, 'Checking…');
  } finally {
    first.restore();
  }
});

test('AC87 (6b; J23\'s failures): a 403 or a 404 on the portfolio\'s branch shows "Can\'t read your portfolio: the desk\'s read access doesn\'t include it" with Setup P1 named — on the block, in its sheets, on Home\'s briefing and on Waiting; a 500, "Can\'t read your portfolio since HH:MM"', async () => {
  for (const [fail, words] of [[{ state: 'cant-read', reason: 'no-access' }, "Can't read your portfolio: the desk's read access doesn't include it (Setup P1)"],
    [{ state: 'cant-read', reason: 'github' }, "Can't read your portfolio since 13:00"]]) {
    const app = await open({ fail });
    try {
      assert.equal(rowLine(app, 'decisions').textContent, words);
      assert.equal(rowLine(app, 'rare').textContent, `Rarely needed · ${words}`);
      assert.equal(byClass(brief(app), 'v2-bt1')[0].textContent, words);
      await app.go('#/pf/decisions');
      const t = textRuns(sheet(app), () => false);
      assert.ok(t.includes(words));
      if (/Setup P1/.test(words)) assert.ok(t.includes(PF_WORDS.setupP1Line), 'Setup P1 in full in its sheet');
      await app.go('#/waiting');
      assert.equal(findKeyed(app, 'ql:cant:portfolio').textContent, words, 'Waiting\'s quiet lines, in its own words');
      await app.go('#/work');
      assert.equal(textRuns(findKeyed(app, 'wa-ideas'), () => false).slice(-1)[0], words);
    } finally {
      app.restore();
    }
  }
});

test('AC87 (6b): a failed or refused portfolio read leaves every project\'s read untouched — the projects\' calls, their tiles, their board groups and Plan\'s milestones are the same as with no portfolio at all', async () => {
  const projectText = async (app) => {
    const calls = app.server.calls.filter((c) => c.target !== 'portfolio').map((c) => `${c.at}|${c.path}|${c.project}|${JSON.stringify(c.body)}`);
    await app.go('#/');
    const tiles = findAll(app.view, (e) => e.dataset && /^card:/.test(e.dataset.k || '')).map((e) => e.textContent);
    const cap = rowLine(app, 'cap').textContent;
    const versions = rowLine(app, 'versions').textContent;
    await app.go('#/waiting');
    const groups = findAll(app.view, (e) => e.dataset && /^list:/.test(e.dataset.k || '') && !e.dataset.k.includes(PF_BOARD)).map((e) => e.textContent);
    const nothing = (findKeyed(app, 'ql:nothing') || { textContent: null }).textContent;
    await app.go('#/work');
    const plan = findAll(app.view, (e) => e.dataset && /^wa-grp:/.test(e.dataset.k || '')).map((e) => e.textContent);
    return { calls, tiles, cap, versions, groups, nothing, plan };
  };
  // One page at a time (the harness's globals): the same day with no portfolio in J7, then with each failure.
  const run = async (opts) => {
    const app = await open(opts);
    try {
      await app.advance(6 * 60_000);
      return await projectText(app);
    } finally {
      app.restore();
    }
  };
  const ref = await run({ pf: null, noPortfolio: true });
  assert.ok(ref.calls.length > 0 && ref.tiles.length === 2);
  for (const fail of [{ state: 'cant-read', reason: 'no-access' }, { state: 'cant-read', reason: 'github' }, { kind: 'network' }, { kind: 'cloudflare' }, { kind: 'signed-out' }]) {
    assert.deepEqual(await run({ fail }), ref, JSON.stringify(fail));
  }
  assert.deepEqual(await run({ pf: null }), ref, 'J7 names it, the token can\'t see it (GitHub\'s 404)');
});

// ---------------------------------------------------------------------------
// "Since you last looked": an idea's change of state (J24, from 6b)

test('AC87 + J24 (6b): "Since you last looked" lists an idea\'s change of state, "An idea moved to <state>: <its name>", with a folder\'s icon and "portfolio · ideas", one tap from Plan — found by comparing each idea\'s state with the one this device kept at "last looked", under desk-seen-ideas-v1; "Mark as seen" clears it', async () => {
  const store = memStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: NOW - 3600e3 }) });
  const app = await open({ store });
  try {
    assert.ok(store.m.has(SEEN_IDEAS_KEY), 'the states kept at "last looked"');
    assert.doesNotMatch(findKeyed(app, 'since') ? findKeyed(app, 'since').textContent : '', /An idea moved/, 'nothing moved yet');
    app.pf.commit({ 'ideas/IDEAS.md': IDEAS.replace('## 2026-10-16 A made-up weekly digest\nstate: captured', '## 2026-10-16 A made-up weekly digest\nstate: approved') });
    await app.advance(5 * 60_000);
    const list = findKeyed(app, 'since');
    assert.ok(list, 'the list');
    const line = findAll(list, (e) => e.tag === 'a' && /An idea moved/.test(e.textContent))[0];
    assert.ok(line, list.textContent);
    assert.equal(byClass(line, 'v2-e1')[0].textContent, 'An idea moved to approved: A made-up weekly digest');
    assert.equal(byClass(line, 'v2-e2')[0].textContent, 'portfolio · ideas');
    assert.equal(line.attrs.href, '#/work', 'one tap from Plan');
    assert.ok(findAll(line, (e) => e.tag === 'svg').some((s) => / vi-proj\b/.test(` ${s.attrs.class}`)), 'a folder for an idea');
    assert.equal(byClass(line, 'v2-tm')[0].textContent, '13:05', 'when the desk first read it, at its 5-minute read (C)');
    const kept = JSON.parse(store.m.get(SEEN_IDEAS_KEY));
    assert.equal(kept.looked[0].at, NOW - 3600e3);
    await app.tap(findKeyed(app, 'mark-seen'));
    assert.ok(!findKeyed(app, 'since') || !/An idea moved/.test(findKeyed(app, 'since').textContent), 'marked as seen: gone');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Read only

test('AC87 (6b; read only): the desk never writes to the portfolio — every portfolio call is its poll (target, head, etags) or its blob call (target, blobs); its links are the card files\' GitHub pages and the desk\'s own screens; no control in the block or its sheets writes', async () => {
  const app = await open({ pf: ONE() });
  try {
    for (const k of PF_ROWS) await app.go(`#/pf/${k}`);
    await app.go(`#/waiting/card/${encodeURIComponent(CARD_ID)}`);
    await app.go('#/');
    const calls = app.server.calls.filter((c) => c.target === 'portfolio');
    assert.ok(calls.length >= 2);
    for (const c of calls) assert.deepEqual(Object.keys(c.body).sort(), c.path === '/api/poll' ? ['etags', 'head', 'target'] : ['blobs', 'target']);
    assert.ok(app.server.calls.every((c) => ['/api/poll', '/api/blobs'].includes(c.path)), 'no new kind of call');
    for (const k of PF_ROWS) {
      await app.go(`#/pf/${k}`);
      for (const h of hrefs(sheet(app))) assert.ok(/^#\//.test(h) || h.startsWith('https://github.com/shumpmaster/portfolio/blob/main/'), `${k}: ${h}`);
      assert.equal(findAll(sheet(app), (e) => ['input', 'textarea', 'form'].includes(e.tag)).length, 0);
    }
    await app.go('#/');
    assert.deepEqual(hrefs(block(app)), PF_ROWS.map((k) => `#/pf/${k}`));
    assert.equal(findAll(block(app), (e) => ['button', 'input', 'textarea', 'form'].includes(e.tag)).length, 0);
    assert.ok(app.server.calls.filter((c) => c.target === 'portfolio').every((c) => !JSON.stringify(c.body).includes('Service-Desk')));
    assert.equal(app.pf.polls >= 1, true);
    assert.equal(PORTFOLIO_REPO, ':portfolio');
  } finally {
    app.restore();
  }
});

test('AC87 (6b): notifications do not cover a portfolio card — no sender reads the portfolio (AC73\'s senders read only their own repositories, src/notify/ names no portfolio); the card shows on the desk while it is open, and its sheet says "Your phone isn\'t told about portfolio cards yet"', async () => {
  const { readdirSync, readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { SRC } = await import('./helpers.mjs');
  for (const f of readdirSync(join(SRC, 'notify'))) assert.doesNotMatch(readFileSync(join(SRC, 'notify', f), 'utf8'), /portfolio/i, `src/notify/${f}`);
  assert.equal(PF_WORDS.phoneNote, "Your phone isn't told about portfolio cards yet");
  const app = await open({ pf: ONE(), hash: `#/waiting/card/${encodeURIComponent(CARD_ID)}` });
  try {
    assert.ok(textRuns(sheet(app), () => false).includes(PF_WORDS.phoneNote));
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Review round 1 (the Reviewer's B1, B2, N2 and N3)

const bt1 = (app) => byClass(brief(app), 'v2-bt1')[0].textContent;
const briefAll = (app) => `${brief(app).textContent} | state: ${app.els['screen-state'].textContent}`;

test('AC87 + AC82 (review round 1, B1): back from the background after more than 6 minutes, with no read failed, Home says "Checking…" until the reads answer, as it does with no portfolio — never "Can\'t read your portfolio"; then "Nothing needs you"', async () => {
  const run = async (noPortfolio) => {
    const app = await open({ noPortfolio });
    try {
      assert.equal(bt1(app), 'Nothing needs you');
      await app.visibility('hidden');
      await app.advance(30 * 60_000);
      await app.visibility('visible');
      const back = briefAll(app);
      await app.advance(1000);
      await app.advance(1000);
      return { back, after: bt1(app) };
    } finally {
      app.restore();
    }
  };
  const pf = await run(false);
  const none = await run(true);
  assert.doesNotMatch(pf.back, /Can't read/, pf.back);
  assert.match(pf.back, /^Checking…/, 'not quiet while its read is due');
  assert.equal(pf.back, none.back, 'the same words as with no portfolio in J7');
  assert.equal(pf.after, 'Nothing needs you', 'once the portfolio\'s read answers');
});

test('AC87 (review round 1, B1): a first read still filling in its blobs (more than one blob call\'s 25) has failed nowhere — no "Can\'t read your portfolio" anywhere while it fills in, every card waiting; read whole at its next read', async () => {
  const queue = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`PF-${100 + i}-made-up.md`, cardText(100 + i, `A made-up decision ${i}`)]));
  const app = await open({ pf: pfFiles({ queue }) });
  try {
    assert.ok(app.desk.portfolio().checking, 'still filling in');
    assert.equal(app.desk.portfolio().failure, null);
    assert.doesNotMatch(briefAll(app), /Can't read/);
    assert.doesNotMatch(block(app).textContent, /Can't read/);
    assert.equal(bt1(app), '30 need you', 'every card waits, read or not');
    await app.go('#/waiting');
    assert.equal(findKeyed(app, 'ql:cant:portfolio'), null);
    await app.advance(5 * 60_000);
    assert.equal(app.desk.portfolio().checking, false);
    assert.ok(app.desk.portfolio().lastSuccessAt != null);
    assert.ok(!/not read yet/.test(lane(app, 'wait').textContent), 'every card read');
  } finally {
    app.restore();
  }
});

test('AC87 + J23 (review round 1, N2): on the page, a blob over GitHub\'s 1 MB contents limit is never asked for and its card reads "too large to read", a blob just under it is read; a truncated tree is not a good read — the rows say so and Home is not quiet', async () => {
  const files = pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1), 'PF-002-big.md': cardText(2, 'A made-up big card') } });
  const r0 = { 'queue/PF-002-big.md': 2_000_000, 'queue/PF-001-explore-1.md': 999_999 };
  const setup = waSetup({});
  setup.config = withPortfolio(setup.config);
  const r = addPortfolio(setup.repos, files);
  r.sizes = r0;
  let app = await loadSandbox({ ...setup, hash: '#/waiting', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    const asked = (r.blobCalls || []).flat();
    const { gitSha } = await import('./fake-desk.mjs');
    assert.ok(!asked.includes(gitSha(files['queue/PF-002-big.md'])), 'over the limit: never asked for');
    assert.ok(asked.includes(gitSha(files['queue/PF-001-explore-1.md'])), 'just under it: read');
    assert.match(lane(app, 'wait').textContent, /PF-002-big\.md: too large to read/);
    assert.match(lane(app, 'wait').textContent, /Whether to explore the made-up reading-list app/);
  } finally {
    app.restore();
  }
  const cut = waSetup({});
  cut.config = withPortfolio(cut.config);
  addPortfolio(cut.repos, ONE()).truncated = true;
  app = await loadSandbox({ ...cut, hash: '#/', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(61_000);
    assert.equal(app.desk.portfolio().lastSuccessAt, null, 'not read successfully');
    assert.equal(app.desk.portfolio().failure.reason, 'too-many');
    assert.equal(rowLine(app, 'decisions').textContent, "not read: the portfolio's tree was too large");
    assert.equal(bt1(app), "Can't read your portfolio since 13:00", 'never quiet over a tree it couldn\'t read');
    await app.advance(10 * 60_000);
    assert.equal(app.desk.portfolio().lastSuccessAt, null, 'still not, at its later reads');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Review round 2 (the Reviewer's B3 and N7)

test('AC87 + Terms\' Quiet (review round 2, B3): the state line and the tab title count each portfolio card as a project\'s waiting item is counted — "1 waiting on you", "30 waiting on you" while both projects are quiet — and never say "Quiet" while one waits; "Quiet" once none does and the portfolio is read', async () => {
  for (const n of [1, 30]) {
    const queue = Object.fromEntries(Array.from({ length: n }, (_, i) => [`PF-${100 + i}-made-up.md`, cardText(100 + i, `A made-up decision ${i}`)]));
    const app = await open({ pf: pfFiles({ queue }) });
    try {
      if (n === 30) await app.advance(5 * 60_000); // its second read fills in the blobs past one call's 25
      assert.ok([...app.desk.states.values()].every((x) => x.lastSuccessAt != null && !x.failure), 'both projects read');
      assert.equal(app.module && findKeyed(app, 'card:Service-Desk').textContent.includes('Nothing waiting'), true, 'both projects quiet');
      assert.equal(bt1(app), `${n} need${n === 1 ? 's' : ''} you`);
      assert.equal(app.els['screen-state'].textContent, `${n} waiting on you`, `${n}: the state line`);
      // From stage 8 (AC44, step 4, specs/S-001.md:2918-2921): the tab is the desk's, "Service Desk — <the state line>" ("Sandbox — " until then).
      assert.equal(document.title, `Service Desk — ${n} waiting on you`, `${n}: the tab title`);
      assert.doesNotMatch(`${app.els['screen-state'].textContent} ${document.title}`, /Quiet/);
    } finally {
      app.restore();
    }
  }
  const quiet = await open();
  try {
    assert.equal(quiet.els['screen-state'].textContent, 'Quiet', 'an empty queue, read: quiet');
    assert.equal(document.title, 'Service Desk — Quiet');
  } finally {
    quiet.restore();
  }
});

test('AC87 + Terms\' Quiet (review round 2, B3): a project waiting too adds to the same count; a portfolio read that has failed adds its words to the line, and a project\'s failure and the portfolio\'s card both say so — never "Quiet"', async () => {
  const { portfolioScreenState } = await import('../../src/lib/portfolio.js');
  const ok = { read: 'ok' };
  const fresh = { fresh: true, quietWords: null };
  assert.deepEqual(portfolioScreenState([{ flaggedCount: 0, read: ok }, { flaggedCount: 0, read: ok }], false, fresh, 1), { text: '1 waiting on you', quiet: false });
  assert.deepEqual(portfolioScreenState([{ flaggedCount: 2, read: ok }], false, fresh, 3), { text: '5 waiting on you', quiet: false });
  assert.deepEqual(portfolioScreenState([{ flaggedCount: 0, read: { read: 'cant-read' } }], false, fresh, 1), { text: '1 waiting on you · can\'t read 1 project', quiet: false });
  const failed = { fresh: false, quietWords: "Can't read your portfolio since 13:10" };
  assert.deepEqual(portfolioScreenState([{ flaggedCount: 0, read: ok }], false, failed, 0), { text: "Not quiet: Can't read your portfolio since 13:10", quiet: false });
  assert.deepEqual(portfolioScreenState([{ flaggedCount: 0, read: ok }], false, failed, 2), { text: "2 waiting on you · Can't read your portfolio since 13:10", quiet: false });
  assert.deepEqual(portfolioScreenState([{ flaggedCount: 0, read: ok }], false, { fresh: false, quietWords: null }, 0), { text: 'Checking…', quiet: false }, 'a read due, none failed');
  assert.deepEqual(portfolioScreenState([{ flaggedCount: 0, read: ok }], false, fresh, 0), { text: 'Quiet', quiet: true });
  assert.deepEqual(portfolioScreenState([{ flaggedCount: 0, read: ok }], true, fresh, 1).text, 'Signed out — reload to sign in');
});

test('AC87 + AC82 (review round 2, N7): back from the background, the projects\' reads answered and the portfolio\'s still in flight — Home says "Checking…", never "Nothing needs you" over an unread portfolio; the state line too; then quiet once it answers', async () => {
  const app = await open();
  try {
    assert.equal(bt1(app), 'Nothing needs you');
    let release;
    app.pf.hold = new Promise((r) => { release = r; });
    await app.visibility('hidden');
    await app.advance(30 * 60_000);
    await app.visibility('visible');
    await app.advance(1000);
    await app.advance(1000);
    const projects = [...app.desk.states.values()];
    assert.ok(projects.every((x) => x.lastSuccessAt != null && app.now - x.lastSuccessAt < 5000), 'every project read again');
    assert.ok(app.server.calls.some((c) => c.target === 'portfolio' && c.at > NOW + 30 * 60_000), 'the portfolio\'s read made, still in flight');
    assert.equal(app.desk.portfolio().lastSuccessAt < NOW + 30 * 60_000, true);
    assert.equal(bt1(app), 'Checking…');
    assert.equal(app.els['screen-state'].textContent, 'Checking…');
    assert.doesNotMatch(briefAll(app), /Nothing needs you|Quiet|Can't read/);
    app.pf.hold = null;
    release();
    await app.advance(1000);
    assert.equal(bt1(app), 'Nothing needs you', 'once it answers');
    assert.equal(app.els['screen-state'].textContent, 'Quiet');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Design review round 1 (F1 and F2)

test('AC87 + Terms\' Quiet (Design review round 1, F1): a portfolio card marked Done here still counts on the state line and the tab title until its file leaves the queue, as a project\'s marked card does (screenState counts what needs the owner, marks aside) — after the mark, after a kick-back, and "Quiet" only once it is confirmed', async () => {
  const state = (app) => [app.els['screen-state'].textContent, document.title];
  const kick = await open({ pf: ONE(), hash: `#/waiting/card/${encodeURIComponent(CARD_ID)}`, store: memStore() });
  try {
    assert.deepEqual(state(kick), ['1 waiting on you', 'Service Desk — 1 waiting on you']);
    await kick.tap(findKeyed(kick, 'sheet-done'));
    await kick.go('#/');
    assert.equal(bt1(kick), 'Nothing waiting on you · confirming with GitHub', 'Home\'s briefing, as before');
    assert.deepEqual(state(kick), ['1 waiting on you', 'Service Desk — 1 waiting on you'], 'marked, not yet confirmed: never "Quiet"');
    await kick.advance(10 * 60_000);
    await kick.go('#/waiting');
    assert.match(lane(kick, 'kick').textContent, /The card file is still in the portfolio's queue/);
    assert.deepEqual(state(kick), ['1 waiting on you', 'Service Desk — 1 waiting on you'], 'kicked back');
  } finally {
    kick.restore();
  }
  const done = await open({ pf: ONE(), hash: `#/waiting/card/${encodeURIComponent(CARD_ID)}`, store: memStore() });
  try {
    await done.tap(findKeyed(done, 'sheet-done'));
    assert.deepEqual(state(done), ['1 waiting on you', 'Service Desk — 1 waiting on you']);
    done.pf.commit({ [CARD]: null });
    await done.advance(5 * 60_000);
    await done.go('#/waiting');
    assert.equal(byClass(lane(done, 'done'), 'v2-drow').length, 1, 'confirmed');
    assert.deepEqual(state(done), ['Quiet', 'Service Desk — Quiet'], 'its file gone from the queue: quiet');
  } finally {
    done.restore();
  }
});

test('AC87 (Design review round 1, F2; the rulebook\'s part A, items 19 and 23): file and repository names in the portfolio\'s sheets — the queue\'s paths in "Decisions across projects", the rarer records\' file names, the repository\'s name — resolve to Plex Mono at the code size (11 px), in light and dark', async () => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { SRC } = await import('./helpers.mjs');
  const { parseCss, treeOf, cascade, nodes } = await import('./css-cascade.mjs');
  const a = parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css');
  const b = parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + a.length }));
  const RULES = [...a, ...b];
  const app = await open({ pf: pfFiles({ queue: { 'PF-001-explore-1.md': cardText(1) } }) });
  try {
    for (const [hash, names] of [['#/pf/decisions', ['queue/PF-001-explore-1.md', 'shumpmaster/portfolio']], ['#/pf/rare', ['R-001-made-up.md', 'R-002-made-up.md', 'shumpmaster/portfolio']]]) {
      await app.go(hash);
      for (const theme of ['light', 'dark']) {
        const root = document.documentElement;
        const tree = treeOf(app.view, { className: root.className, attrs: { ...(root.attrs || {}), ...(theme === 'dark' ? { 'data-theme': 'dark' } : {}) } });
        cascade(tree, RULES, { scheme: 'light', width: 360, reducedMotion: false });
        for (const name of names) {
          const n = nodes(tree).find((x) => x.text.trim() === name);
          assert.ok(n, `${hash}: ${name} drawn on its own`);
          assert.match(n.style.get('font-family') || '', /^"IBM Plex Mono"/, `${hash} ${theme}: ${name} in ${n.style.get('font-family')}`);
          assert.equal(n.style.get('font-size'), '11px', `${hash} ${theme}: ${name}`);
        }
      }
    }
  } finally {
    app.restore();
  }
});
