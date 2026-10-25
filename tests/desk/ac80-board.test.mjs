// ac-test: S-001/AC80 — the waiting-on-you screen as a board (desk mockup v2, frames 1, 2, 3 and 12;
// stage 1a): three lanes, one step a card, marks kept on the device and confirmed by the reads the
// page already makes, at their own cadence. Made-up records (NOT real records, labelled so in
// tests/desk/fixtures/README.md): version 5's eight example cards (tests/desk/fixtures/board-v5/,
// made up from board.html's ITEMS) and AC52's one card of each kind (sandbox-fixtures.mjs); J22's
// real fixture is read by j22-board-rules.test.mjs. The suite has no browser: the page is the
// sandbox's own code under the fake DOM, the fake desk function and the scheduler's fake clock.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG, FIX, SRC, fixture } from './helpers.mjs';
import { repo, pr } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, linksIn, El0 } from './sandbox-helpers.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { AGENTS_WORDS } from '../../src/lib/j22.js';
import { KICK_BACK_MINUTES, DONE_KEEP_HOURS, MARKS_KEY, HOLD_MS, MOUSE_DRAG_PX, FINGER_SLOP_PX, LANE_MARGIN_PX, WORDS, markDone, judgeMarks, noMarks } from '../../src/lib/board.js';
import { twoProjects, v3, fullRepo } from './sandbox-fixtures.mjs';
import { waSetup, memStore } from './wa-fixtures.mjs';

const B5 = join(FIX, 'board-v5');
const b5 = (p) => readFileSync(join(B5, p), 'utf8');
const NOW = Date.parse('2026-10-19T21:00:00Z'); // 16:00 in the owner's time zone (America/Chicago)
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
const EX = { name: 'Example', repo: 'shumpmaster/Example', defaultBranch: 'main', model: 'v3', planning: false, webCommitsToDefault: true,
  contentPrefill: true, contentParam: 'value' };
const sha = (n, v = 'a') => `${String(n).padStart(4, '0')}${v.repeat(36)}`;

/** Version 5's eight example cards (board.html's ITEMS), as made-up records of a made-up project. */
function exampleRepo() {
  const files = {
    'governance/risk-paths.toml': b5('governance/risk-paths.toml'),
    'questions/P-001-board-answer.md': b5('questions/P-001-board-answer.md'),
    'questions/P-001-board-done-keep.md': b5('questions/P-001-board-done-keep.md'),
    'questions/P-001-m3a-done-when.md': b5('questions/P-001-m3a-done-when.md'),
    'README.md': '# Example\n\nNOT a real project: made up for AC80\'s test.\n',
  };
  const at = (min) => iso(NOW - min * 60e3);
  // A public repository's pull requests (J1's `base.repo.private` false), so J22's owner check is read.
  const mk = (n, title, head, created) => ({ ...pr(n, title, { head, headRepo: EX.repo, sha: sha(n), createdAt: created, private: false }), html_url: `https://github.com/${EX.repo}/pull/${n}` });
  const pulls = [
    mk(135, "Show the automatic job's pull requests as being recorded", 'orch/job-prs-recorded', at(35)),
    mk(130, 'Make two notification files high-risk', 'cos/cs23-r3-paths', at(50)),
    mk(126, 'Merge: the first rough estimates', 'cos/estimates-126', at(200)),
    mk(127, 'Merge: your later-work list', 'cos/later-127', at(190)),
    mk(128, 'Merge: Work ahead (M3A)', 'build/builder/work-ahead', at(180)),
  ];
  const r = repo(files, pulls, [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  r.prFiles = {
    135: [{ filename: 'notify/sender.js', status: 'modified' }],
    130: [{ filename: 'notify/paths.toml', status: 'modified' }],
    126: [{ filename: 'docs/estimates.md', status: 'added' }],
    127: [{ filename: 'docs/later.md', status: 'modified' }],
    128: [{ filename: 'docs/work-ahead.md', status: 'modified' }],
  };
  r.statuses = {};
  r.history = {
    'questions/P-001-board-answer.md': [{ commit: { committer: { date: at(173) } } }],
    'questions/P-001-board-done-keep.md': [{ commit: { committer: { date: at(60) } } }],
    'questions/P-001-m3a-done-when.md': [{ commit: { committer: { date: at(20) } } }],
  };
  return r;
}

async function openExample({ hash = '#/waiting', store = null, search = '?sandbox', repos = null, config = null } = {}) {
  const r = repos || { Example: exampleRepo() };
  const app = await loadSandbox({ config: config || { ...CONFIG, projects: [EX] }, repos: r, hash, search, now: NOW, store });
  await app.advance(1000);
  await app.advance(POLL_MS);
  return { app, r: r.Example, repos: r };
}
const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;

/** A browser's local storage, in memory; `refuse` makes every read and write throw. */
function storage({ refuse = false } = {}) {
  const backing = new Map();
  const no = () => { throw new Error('storage refused'); };
  return { backing, getItem: refuse ? no : (k) => (backing.has(k) ? backing.get(k) : null), setItem: refuse ? no : (k, v) => { backing.set(k, String(v)); },
    removeItem: refuse ? no : (k) => { backing.delete(k); }, get length() { return backing.size; }, key: (i) => [...backing.keys()][i] ?? null };
}
const lane = (app, k) => keyed(app, `lane:${k}`);
const cardsIn = (app, k) => byClass(lane(app, k), 'v2-card');
const titles = (app, k) => cardsIn(app, k).map((c) => byClass(c, 'v2-t')[0].textContent);
const cardOf = (app, n) => findAll(app.view, (e) => e.attrs && e.attrs['data-card'] === n)[0] || null;
const badge = (app) => { const b = byClass(app.view, 'v2-badge')[0]; return b ? b.children[0].textContent : null; };
const sheet = (app) => byClass(app.view, 'v2-sheet')[0] || null;
const decodeValue = (href) => decodeURIComponent(/[?&]value=([^&]*)$/.exec(href)[1]);
const PR = (n) => `Example|pr|${n}`;
const Q = (name) => `Example|question|questions/${name}.md`;
async function openSheet(app, id) { await app.go(`#/waiting/card/${encodeURIComponent(id)}`); return sheet(app); }
async function markDoneInSheet(app, id) {
  await openSheet(app, id);
  const b = keyed(app, 'sheet-done');
  assert.ok(b, `"Done ✓" in ${id}'s sheet`);
  // From stage 4 a question's and a gate's sheet say it in frame 3's words, "✓ Move to Done · then
  // answer on GitHub" (specs/S-001.md:6995, AC85: AC80's "Done ✓"); every other sheet keeps "Done ✓".
  // Its two parts read apart, " · " between them (governance/domains/design/README.md, part A, item 19;
  // stage 4's design review, round 1, N3).
  const kind = id.split('|')[1];
  assert.equal(b.textContent, kind === 'question' || kind === 'gate' ? 'Move to Done · then answer on GitHub' : 'Done ✓');
  await app.tap(b);
}

// ---------------------------------------------------------------------------
// The lanes and the cards

// Rewritten in G2 (AC91 (f); AC80's note "After the glance audit": "two lanes, "Waiting on you" and "Done · last 24 h", of
// equal width, with Kicked back as a strip above them and Done shaded"; P-001-glance-lanes.md, C): the lanes' order,
// headings, counts and empty words, with the strip in place of the middle lane; the cards' part unchanged.
test('AC80, rewritten in G2 (AC91 (f)): two lanes, left to right, "Waiting on you" and "Done · last 24 h", their counts and empty words, with Kicked back a strip above them reading "Kicked back · none"; version 5\'s eight cards, each its kind line, meta, lock or clock line and one step', async () => {
  const { app } = await openExample();
  try {
    const lanes = byClass(byClass(app.view, 'v2-lanes')[0], 'v2-lane');
    assert.deepEqual(lanes.map((l) => l.dataset.lane), ['wait', 'done']);
    assert.deepEqual(lanes.map((l) => byClass(l, 'v2-lh')[0].textContent), ['Waiting on you8', 'Done · last 24 h']);
    assert.equal(byClass(lane(app, 'wait'), 'v2-empty').length, 0);
    assert.equal(byClass(lane(app, 'done'), 'v2-empty')[0].textContent, 'Hold a card and drag it here');
    // Kicked back: no column, a strip above the lanes, under the quiet lines, its one quiet line with no count, no
    // fold mark, no control and nothing to drop on.
    const board = byClass(app.view, 'v2-board')[0].children;
    const at = (cls) => board.findIndex((c) => c.className.split(' ').includes(cls));
    assert.equal(at('v2-kstrip'), at('v2-lanes') - 1, 'directly above the lanes');
    assert.ok(at('v2-quiet') < at('v2-kstrip'), 'under the quiet lines');
    assert.equal(lane(app, 'kick').textContent, 'Kicked back · none');
    assert.equal(findAll(lane(app, 'kick'), (e) => ['button', 'a', 'svg'].includes(e.tag)).length, 0, 'no control and no fold mark');
    // In each lane, a project's cards under its name, a folder icon and its count; no card repeats the name.
    const grp = keyed(app, 'grp:wait:Example');
    assert.equal(grp.textContent, 'Example8');
    assert.equal(grp.attrs['aria-label'], 'Show only Example');
    const want = [
      ['Pull request', 'Merge: the first rough estimates', '#126 · R0 · 3 h 21 m', null, 'Merge ↗', 'https://github.com/shumpmaster/Example/pull/126'],
      ['Pull request', 'Merge: your later-work list', '#127 · R0 · 3 h 11 m', null, 'Merge ↗', 'https://github.com/shumpmaster/Example/pull/127'],
      ['Pull request', 'Merge: Work ahead (M3A)', '#128 · R0 · 3 h 1 m', null, 'Merge ↗', 'https://github.com/shumpmaster/Example/pull/128'],
      ['Question', "How should a question's card fill in your answer?", 'MD2 · 2 h 54 m', 'Settles as C · Wed 13:07', 'Answer', `#/waiting/card/${encodeURIComponent(Q('P-001-board-answer'))}`],
      ['Question', 'How long do finished cards stay in Done?', 'MD2 · 1 h 1 m', 'Settles as B · Wed 15:00', 'Answer', `#/waiting/card/${encodeURIComponent(Q('P-001-board-done-keep'))}`],
      ['Pull request', 'Make two notification files high-risk', '#130 · R3 · 51 m', null, 'Verdict ↗', null],
      ['Pull request', "Show the automatic job's pull requests as being recorded", '#135 · R3 · 36 m', null, 'Verdict ↗', null],
      ['Question', 'Approve the new wording of M3A, the Work ahead milestone?', 'M3A · 21 m', 'Settles as A · Wed 15:40', 'Answer', `#/waiting/card/${encodeURIComponent(Q('P-001-m3a-done-when'))}`],
    ];
    const got = cardsIn(app, 'wait').map((c) => [byClass(c, 'v2-kd')[0].textContent, byClass(c, 'v2-t')[0].textContent, byClass(c, 'v2-m')[0].textContent,
      (byClass(c, 'v2-mk')[0] || { textContent: null }).textContent, byClass(c, 'v2-step')[0].textContent]);
    assert.deepEqual(got, want.map((w) => w.slice(0, 5)));
    for (const [i, c] of cardsIn(app, 'wait').entries()) if (want[i][5]) assert.equal(byClass(c, 'v2-step')[0].attrs.href, want[i][5], want[i][1]);
    // The verdict, at the pull request's head branch, AC53's verdict text character for character.
    const v = byClass(cardOf(app, PR(135)), 'v2-step')[0].attrs.href;
    assert.match(v, /^https:\/\/github\.com\/shumpmaster\/Example\/new\/orch\/job-prs-recorded\?filename=reviews%2F135%2Fowner\.md&value=/);
    assert.equal(decodeValue(v), 'Verdict: PASS\n\nAny suggestions to commit along with the verdict:\n\n');
    // The vermilion kind icon while it waits on the owner; the badge, the board's own count.
    for (const c of cardsIn(app, 'wait')) assert.equal(byClass(byClass(c, 'v2-kd')[0], 'v2-k').length, 1);
    assert.equal(badge(app), '8');
    assert.equal(byClass(app.view, 'v2-badge')[0].textContent, '8 8 waiting on you', 'its count, and its words for a screen reader');
  } finally {
    app.restore();
  }
});

test('AC80: a lettered question\'s sheet — one button per letter, "Answer <letter> ↗", each opening its fully filled-in file at the default branch; "Recommended" beside C only, none picked', async () => {
  const { app } = await openExample();
  try {
    const sh = await openSheet(app, Q('P-001-board-answer'));
    assert.ok(sh, 'the sheet');
    assert.equal(byClass(sh, 'v2-stitle')[0].textContent, "How should a question's card fill in your answer?");
    const opts = byClass(sh, 'v2-opt');
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-abtn')[0].textContent), ['Answer A ↗', 'Answer B ↗', 'Answer C ↗']);
    assert.deepEqual(opts.map((o) => byClass(o, 'v2-rec').length), [0, 0, 1], '"Recommended" beside C only');
    assert.equal(findAll(sh, (e) => e.attrs['aria-checked'] === 'true' || e.attrs['aria-pressed'] === 'true').length, 0, 'none picked');
    const c = byClass(opts[2], 'v2-abtn')[0].attrs.href;
    assert.match(c, /^https:\/\/github\.com\/shumpmaster\/Example\/new\/main\?filename=decisions%2Fquestions%2FP-001-board-answer\.md&value=/);
    assert.equal(decodeValue(c), [
      'Ruling: C', '', 'Question: questions/P-001-board-answer.md', 'Milestone: MD2', '',
      "Question, as put: How should a question's card fill in your answer?", 'Options, as put:',
      '  A. One button, you type the letter — "Answer" opens the answer file with everything filled in except the letter after "Ruling:".',
      '  B. One button, recommended letter filled in — "Answer" opens it with the recommended letter already there; you change it if you disagree.',
      '  C. One button per option — "Answer A", "Answer B" and so on, each opening a fully filled-in file; one tap and commit.', ''].join('\n'));
    // Its wait, what it is, why it's here and what was checked. From stage 4 in AC85's layout
    // (specs/S-001.md:6962-6969, 6995-6998): the wait in the head, what it is its title, why it's here
    // its opening (the WHY), and what was checked at the sheet's foot.
    assert.match(byClass(sh, 'v2-shead')[0].textContent, /waiting 2 h 54 m/);
    assert.equal(byClass(sh, 'v2-clip')[0].textContent, 'NOT a real record: made up from board.html\'s ITEMS (version 5\'s example "qa") for AC80\'s test.');
    assert.match(keyed(app, 'foot-checked').textContent, /^What was checked: CI on main's head: /);
    // Closes on "Close", Escape and a tap outside; the close is a 44 × 44 px control.
    assert.ok(byClass(sh, 'v2-x44').length, 'the 44 px close');
    await app.key('Escape');
    assert.equal(sheet(app), null);
    assert.equal(app.loc.hash, '#/waiting');
  } finally {
    app.restore();
  }
});

test('AC80: "Done ✓" in a sheet marks the card at once: it heads Done as "Confirming with GitHub" with its step\'s button and "Undo", leaving every count (the badge, the lane, Home\'s line and the tile); "Undo" returns it', async () => {
  const store = storage();
  const { app } = await openExample({ store });
  try {
    await markDoneInSheet(app, PR(126));
    assert.equal(app.loc.hash, '#/waiting', 'the sheet closes on the mark');
    assert.ok(!titles(app, 'wait').includes('Merge: the first rough estimates'));
    const conf = byClass(lane(app, 'done'), 'v2-card conf');
    assert.equal(conf.length, 1);
    assert.equal(byClass(conf[0], 'v2-kd')[0].textContent, 'Confirming with GitHub');
    assert.equal(byClass(conf[0], 'v2-t')[0].textContent, 'Merge: the first rough estimates');
    assert.equal(byClass(conf[0], 'v2-step')[0].textContent, 'Merge ↗', 'its step\'s button, beside "Undo"');
    assert.ok(findAll(conf[0], (e) => e.tag === 'button' && e.textContent === 'Undo').length);
    assert.equal(badge(app), '7', 'the badge at once');
    assert.equal(byClass(lane(app, 'wait'), 'v2-lc')[0].textContent, '7');
    const kept = JSON.parse(store.backing.get(MARKS_KEY));
    assert.ok(kept.marks[PR(126)], 'kept on the device');
    assert.equal(kept.marks[PR(126)].step, 'merge');
    assert.ok(app.text().includes(WORDS.device), 'the device line under Done');
    await app.go('#/');
    // From stage 2 (AC82): Home's briefing and the tile's "wait on you", in place of today's Home's line and pill.
    assert.match(byClass(app.view, 'v2-brief')[0].textContent, /^7 need you/, 'Home\'s briefing less the mark');
    assert.deepEqual(byClass(app.view, 'v2-wt').map((x) => x.textContent), ['7 wait on you'], 'the tile\'s count, less the mark');
    // From stage 3 (AC83, specs/S-001.md:6773-6775; AC81 "From stage 3", :6456-6458; AC80's counts, :6161-6164) the page, in the Status screen's place: its row "◆ <n> wait on
    // you" with the waiting items' short names, counted as the board counts them (rewritten from the Status
    // screen's queue line, "3 decisions · 4 to merge ›").
    await app.go('#/p/Example');
    const waits = findAll(app.view, (e) => e.dataset && e.dataset.k === 'page-waits')[0];
    assert.equal(byClass(waits, 'v2-prtt')[0].textContent, '7 wait on you', 'the page\'s count, less the mark');
    assert.equal(byClass(waits, 'v2-small')[0].textContent.split(' · ').length, 7, 'seven short names');
    assert.ok(!waits.textContent.includes('Merge: the first rough estimates'), 'the marked card\'s name gone with it');
    assert.equal(waits.attrs.href, '#/waiting/Example', 'opening Waiting with only this project shown');
    await app.go('#/p/Example/team');
    assert.ok(app.text().includes('You · waiting on you: 7 in your queue'), 'the owner\'s tile on the Team screen (AC49)');
    await app.go('#/waiting');
    await app.tap(findAll(lane(app, 'done'), (e) => e.tag === 'button' && e.textContent === 'Undo')[0]);
    assert.ok(titles(app, 'wait').includes('Merge: the first rough estimates'), 'Undo: back in the lane it came from');
    assert.equal(badge(app), '8');
    assert.equal(JSON.parse(store.backing.get(MARKS_KEY)).marks[PR(126)], undefined);
  } finally {
    app.restore();
  }
});

test('AC80: Home reads "Nothing waiting on you · confirming with GitHub" when every card is marked and none confirmed yet', async () => {
  const r = exampleRepo();
  r.pulls = r.pulls.filter((x) => x.number === 126);
  for (const k of Object.keys(r.files)) if (k.startsWith('questions/')) delete r.files[k];
  const { app } = await openExample({ store: storage(), repos: { Example: r } });
  try {
    await markDoneInSheet(app, PR(126));
    assert.equal(badge(app), null, 'no badge: it never stands for "quiet"');
    await app.go('#/');
    assert.ok(app.text().includes(WORDS.quietConfirming), app.text());
  } finally {
    app.restore();
  }
});

test('AC80: local storage throwing — "Done marks not kept on this device", and the mark still made for this opening, nothing else broken', async () => {
  const { app } = await openExample({ store: storage({ refuse: true }) });
  try {
    assert.ok(app.text().includes(WORDS.notKept));
    await markDoneInSheet(app, PR(127));
    assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 1);
    assert.equal(badge(app), '7');
    await app.advance(POLL_MS);
    assert.ok(app.text().includes(WORDS.notKept));
    assert.doesNotMatch(app.text(), /Can't show/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Confirming, and kicking back

test('AC80: a mark is judged only at a successful poll — at 4 minutes 59 seconds still confirming; at the first successful poll after 5 minutes kicked back with its reason, counted again; then confirmed by J1\'s list, it moves to Done by itself', async () => {
  assert.equal(KICK_BACK_MINUTES, 5);
  const { app, r } = await openExample({ store: storage() });
  try {
    // Just after a poll: the next polls come 59 s, 1 m 59 s, … 4 m 59 s and 5 m 59 s after the mark.
    await markDoneInSheet(app, PR(126));
    for (let i = 1; i <= 5; i++) await app.advance(POLL_MS);
    assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 1, 'at 4 m 59 s: still confirming');
    assert.deepEqual(titles(app, 'kick'), []);
    await app.advance(POLL_MS);
    assert.deepEqual(titles(app, 'kick'), ['Merge: the first rough estimates'], 'kicked back at the first successful poll after 5 minutes');
    const k = cardOf(app, PR(126));
    // Rewritten in G2 (AC91 (f)): in the strip, which has no project groups, its kind line names its project.
    assert.equal(byClass(k, 'v2-kd')[0].textContent, 'Kicked back · Example');
    assert.equal(byClass(k, 'v2-why')[0].textContent, "GitHub doesn't show it merged yet");
    assert.equal(byClass(k, 'v2-step')[0].textContent, 'Merge ↗', 'its current step');
    assert.equal(badge(app), '8', 'counted again, everywhere it counted before');
    // GitHub then shows it merged: confirmed, into Done by itself, as "✓ <time>".
    r.pulls = r.pulls.filter((x) => x.number !== 126);
    await app.advance(POLL_MS);
    assert.deepEqual(titles(app, 'kick'), []);
    const rows = byClass(lane(app, 'done'), 'v2-drow');
    assert.equal(rows.length, 1);
    assert.equal(byClass(rows[0], 'v2-dt')[0].textContent, 'Merge: the first rough estimates');
    assert.equal(byClass(rows[0], 'v2-m')[0].textContent, '#126 · 16:08', 'its code, then the time GitHub confirmed it, in the owner\'s time zone');
    assert.equal(findAll(rows[0], (e) => e.tag === 'button' && e.textContent === 'Undo').length, 0, 'once confirmed, only "✓ <time>"');
    assert.equal(badge(app), '7');
  } finally {
    app.restore();
  }
});

test('AC80 + AC83: a kicked-back card counts again on the project\'s page — "◆ <n> wait on you" with its short name, as the badge and the tile count it (specs/S-001.md:6161-6164, :6773-6774; the Reviewer\'s N2, stage 3 round 1)', async () => {
  const { app } = await openExample({ store: storage() });
  try {
    await markDoneInSheet(app, PR(126));
    for (let i = 1; i <= 6; i++) await app.advance(POLL_MS);
    assert.deepEqual(titles(app, 'kick'), ['Merge: the first rough estimates'], 'kicked back');
    assert.equal(badge(app), '8');
    await app.go('#/');
    assert.deepEqual(byClass(app.view, 'v2-wt').map((x) => x.textContent), ['8 wait on you'], 'the tile counts it');
    await app.go('#/p/Example');
    const waits = keyed(app, 'page-waits');
    assert.equal(byClass(waits, 'v2-prtt')[0].textContent, '8 wait on you', 'the page counts it, as the badge and the tile do');
    // Rewritten for AC89 (c) (specs/S-001.md:7863-7870): each item by its short name, a pull request "#<n>", never its title.
    assert.ok(byClass(waits, 'v2-small')[0].textContent.split(' · ').includes('#126'), 'its short name with the others');
  } finally {
    app.restore();
  }
});

test('AC80: a mark from "Kicked back" again, with a new time and a new 5 minutes; "Undo" returns it to "Kicked back"', async () => {
  const { app } = await openExample({ store: storage() });
  try {
    await markDoneInSheet(app, PR(127));
    for (let i = 1; i <= 6; i++) await app.advance(POLL_MS);
    assert.deepEqual(titles(app, 'kick'), ['Merge: your later-work list']);
    await markDoneInSheet(app, PR(127));
    assert.deepEqual(titles(app, 'kick'), []);
    assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 1);
    await app.tap(findAll(lane(app, 'done'), (e) => e.tag === 'button' && e.textContent === 'Undo')[0]);
    assert.deepEqual(titles(app, 'kick'), ['Merge: your later-work list'], '"Undo" returns it to "Kicked back"');
    await markDoneInSheet(app, PR(127));
    for (let i = 1; i <= 5; i++) await app.advance(POLL_MS);
    assert.deepEqual(titles(app, 'kick'), [], 'a new 5 minutes');
    await app.advance(POLL_MS);
    assert.deepEqual(titles(app, 'kick'), ['Merge: your later-work list']);
  } finally {
    app.restore();
  }
});

test('AC80: a verdict confirmed by J20\'s files at its new head holding reviews/<n>/owner.md; reading PASS, its "Step 2 of 2: merge" card joins "Waiting on you"; reading FAIL, "Open ↗" with "You asked for changes", never the merge', async () => {
  for (const word of ['PASS', 'FAIL']) {
    const { app, r } = await openExample({ store: storage() });
    try {
      await markDoneInSheet(app, PR(135));
      assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 1);
      // The verdict's commit: a new head whose files hold reviews/135/owner.md (made up).
      const p = r.pulls.find((x) => x.number === 135);
      p.head = { ...p.head, sha: sha(135, 'b') };
      r.prFiles[135] = [{ filename: 'notify/sender.js', status: 'modified' }, { filename: 'reviews/135/owner.md', status: 'added', sha: 'f'.repeat(40) }];
      r.blobs = { ['f'.repeat(40)]: `Verdict: ${word}\n` };
      await app.advance(POLL_MS);
      await app.advance(POLL_MS);
      const rows = byClass(lane(app, 'done'), 'v2-drow');
      assert.equal(rows.length, 1, `${word}: confirmed, a ✓ row`);
      assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 0);
      const c = cardOf(app, PR(135));
      assert.ok(c && lane(app, 'wait').contains(c), `${word}: the pull request a card again in "Waiting on you"`);
      if (word === 'PASS') {
        assert.equal(byClass(c, 'v2-step')[0].textContent, 'Merge ↗');
        assert.equal(byClass(c, 'v2-why')[0].textContent, 'Verdict in. Next, the merge.');
        const sh = await openSheet(app, PR(135));
        assert.match(sh.textContent, /step 2 of 2/);
        assert.ok(byClass(sh, 'v2-abtn').some((b) => b.textContent === 'Step 2 of 2: merge ↗'), sh.textContent);
      } else {
        assert.equal(byClass(c, 'v2-step')[0].textContent, 'Open ↗');
        assert.equal(byClass(c, 'v2-step')[0].attrs.href, 'https://github.com/shumpmaster/Example/pull/135', 'the pull request\'s page, never the merge');
        assert.ok(byClass(c, 'v2-why').some((x) => x.textContent === 'You asked for changes'));
      }
    } finally {
      app.restore();
    }
  }
});

test('AC80: an answer is confirmed when its answer file is on the default branch; a mark judged against its own step; Done keeps a row 24 hours, "yesterday, <time>" before today, gone at 24 hours', async () => {
  assert.equal(DONE_KEEP_HOURS, 24);
  const { app, r } = await openExample({ store: storage() });
  try {
    await markDoneInSheet(app, Q('P-001-m3a-done-when'));
    r.commit({ 'decisions/questions/P-001-m3a-done-when.md': 'Ruling: A\n\nQuestion: questions/P-001-m3a-done-when.md\nMilestone: M3A\n' });
    r.history['decisions/questions/P-001-m3a-done-when.md'] = [{ commit: { committer: { date: iso(app.now) } } }];
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    const row = () => byClass(lane(app, 'done'), 'v2-drow').find((x) => byClass(x, 'v2-dt')[0].textContent.startsWith('Approve the new wording of M3A'));
    assert.ok(row(), 'confirmed: a ✓ row');
    assert.match(byClass(row(), 'v2-m')[0].textContent, /^P-001-m3a-done-when · 16:0\d$/);
    // 23 hours 59 minutes after the mark: still there, read "yesterday, 16:0x" after midnight.
    await app.advance((23 * 60 + 56) * 60e3);
    assert.ok(row(), 'at 23 h 59 m');
    assert.match(byClass(row(), 'v2-m')[0].textContent, /^P-001-m3a-done-when · yesterday, 16:0\d$/);
    await app.advance(3 * 60e3);
    assert.equal(row(), undefined, 'gone at 24 hours');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// One board for every project, grouped by project


// Rewritten in G2 (AC91 (f): "the strip, above the lanes, under the quiet lines (or, with one project shown, above the
// lanes as frame 2 places them)"): the strip's place, on the whole board and with one project shown.
test('AC80 (2026-10-20), rewritten in G2: one board grouped by project in J7\'s order; a tap on a project\'s name shows only it, a chip with ✕ and "1 of 2 projects", the Kicked back strip directly above the lanes, the quiet lines then under the lanes in one small line; ✕ goes back to every project, replacing its history entry', async () => {
  const setup = twoProjects();
  const app = await loadSandbox({ ...setup, hash: '#/waiting', now: Date.parse('2026-10-14T15:00:00Z') });
  const replaced = [];
  location.replace = (h) => { replaced.push(h); location.hash = h; };
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const groups = findAll(lane(app, 'wait'), (e) => e.dataset && /^grp:wait:/.test(e.dataset.k || '')).map((g) => g.dataset.k.slice('grp:wait:'.length));
    assert.deepEqual(groups, ['Alpha', 'Beta'], 'J7\'s order');
    assert.equal(byClass(app.view, 'v2-filter').length, 0);
    assert.equal(byClass(app.view, 'v2-quiet').length, 0, 'a quiet line shows only when it has any');
    await app.tap(keyed(app, 'grp:wait:Alpha'));
    assert.equal(app.loc.hash, '#/waiting/Alpha', 'its own address');
    const chip = byClass(app.view, 'v2-filter')[0];
    assert.equal(byClass(chip, 'v2-chip')[0].textContent, 'Alpha');
    assert.equal(byClass(chip, 'v2-small')[0].textContent, '1 of 2 projects');
    assert.equal(keyed(app, 'chip-x').attrs['aria-label'], 'Show all projects');
    assert.ok(!app.text().includes('Beta: a change to merge'), 'only Alpha\'s cards');
    assert.equal(findAll(app.view, (e) => e.dataset && /^grp:/.test(e.dataset.k || '')).length, 0, 'no group names: one project');
    const kids2 = byClass(app.view, 'v2-board')[0].children.map((c) => c.className);
    assert.ok(kids2.findIndex((c) => /\bv2-quiet under\b/.test(c)) > kids2.findIndex((c) => /\bv2-lanes\b/.test(c)), 'under the lanes, filtered (frame 2)');
    const strip = kids2.findIndex((c) => /\bv2-kstrip\b/.test(c));
    assert.equal(strip, kids2.findIndex((c) => /\bv2-lanes\b/.test(c)) - 1, 'the strip directly above the lanes, filtered');
    assert.ok(strip > kids2.findIndex((c) => /\bv2-filter\b/.test(c)), 'under the chip');
    assert.equal(lane(app, 'kick').textContent, 'Kicked back · none');
    assert.match(byClass(app.view, 'v2-qsmall')[0].textContent, /^With the agents: 0 · Being recorded by the automatic job: 0$/);
    // A refresh keeps the filter (its address); the bar's Waiting tab is current.
    app.module.refresh();
    await app.flush();
    assert.equal(byClass(app.view, 'v2-filter').length, 1);
    assert.match(findAll(byClass(app.view, 'v2-bar')[0], (e) => e.attrs['aria-current'] === 'page')[0].textContent, /^Waiting/);
    await app.tap(keyed(app, 'chip-x'));
    assert.deepEqual(replaced, ['#/waiting'], '✕ replaces its history entry');
    assert.equal(app.loc.hash, '#/waiting');
    assert.equal(byClass(app.view, 'v2-filter').length, 0);
  } finally {
    delete location.replace;
    app.restore();
  }
});

test('AC80: "Nothing waiting: <project>" for a project read with no card in any lane; "Can\'t read <project> since HH:MM" for one that can\'t be read', async () => {
  const config = { ...CONFIG, projects: [EX, v3('Quiet'), v3('Down')] };
  const quiet = repo({ 'README.md': '# Quiet\n\nNOT a real project.\n' });
  const down = repo({ 'README.md': '# Down\n' });
  down.fail = { kind: 'network' };
  const { app } = await openExample({ config, repos: { Example: exampleRepo(), Quiet: quiet, Down: down } });
  try {
    assert.ok(app.text().includes('Nothing waiting: Quiet'), app.text());
    assert.match(app.text(), /Can't read Down since \d\d:\d\d/);
  } finally {
    app.restore();
  }
});

test('AC80 (2026-10-20, J22 rule 0): a pull request missing a required reviewer\'s verdict is "With the agents", in the quiet line above the lanes and its fold, in no count; once the verdict is on its branch, a card again and counted', async () => {
  const r = exampleRepo();
  r.pulls.push({ ...pr(140, 'A made-up code change', { head: 'build/builder/x-140', headRepo: EX.repo, sha: sha(140), createdAt: iso(NOW - 10 * 60e3) }), html_url: `https://github.com/${EX.repo}/pull/140` });
  r.prFiles[140] = [{ filename: 'src/x.js', status: 'modified' }];
  const { app } = await openExample({ repos: { Example: r } });
  try {
    const kids = byClass(app.view, 'v2-board')[0].children.map((c) => c.className);
    const q = kids.findIndex((c) => /\bv2-quiet\b/.test(c));
    assert.ok(q >= 0 && q < kids.findIndex((c) => /\bv2-lanes\b/.test(c)), `the quiet line above the lanes (${kids.join(' | ')})`);
    const ql = keyed(app, 'ql:agents');
    assert.equal(ql.textContent, 'With the agents: 1');
    assert.ok(!titles(app, 'wait').includes('A made-up code change'));
    assert.equal(badge(app), '8', 'in no count');
    await app.tap(ql);
    const fold = keyed(app, 'fold:agents');
    assert.match(fold.textContent, /A made-up code change#140/);
    assert.equal(byClass(fold, 'v2-fw')[0].textContent, 'Waiting on Reviewer\'s verdict', 'what it waits on, in rule 0\'s words (the roster\'s name)');
    assert.deepEqual(linksIn(fold).map((l) => l.href), ['https://github.com/shumpmaster/Example/pull/140'], 'its link to GitHub');
    await app.go('#/');
    assert.match(app.text(), /8 waiting on you/);
    // The reviewer's verdict arrives on the branch (a new head, made up): no longer with the agents.
    const p = r.pulls.find((x) => x.number === 140);
    p.head = { ...p.head, sha: sha(140, 'c') };
    r.prFiles[140] = [{ filename: 'src/x.js', status: 'modified' }, { filename: 'reviews/140/reviewer.md', status: 'added', sha: 'e'.repeat(40) }];
    r.blobs = { ['e'.repeat(40)]: 'Verdict: PASS\n' };
    await app.go('#/waiting');
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.ok(titles(app, 'wait').includes('A made-up code change'), 'a card again');
    assert.equal(keyed(app, 'ql:agents'), null);
    assert.equal(badge(app), '9');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Dragging a card into Done

/** A layout for the drag: the Done lane's box at x 248–360, y 100–700 (an 8 px margin round it counts). */
function laneLayout() {
  const saved = Object.getOwnPropertyDescriptor(El0.prototype, 'getBoundingClientRect');
  El0.prototype.getBoundingClientRect = function rect() {
    if (this.dataset && this.dataset.k === 'lane:done') return { left: 248, right: 360, top: 100, bottom: 700, width: 112, height: 600 };
    return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
  };
  return () => { if (saved) Object.defineProperty(El0.prototype, 'getBoundingClientRect', saved); else delete El0.prototype.getBoundingClientRect; };
}

// Rewritten in G2 (AC91 (f): "each card in it ... a press and hold dragging it into Done (new drag code, as the option
// said)"): the case's last part carries a card from the Kicked back strip into Done, out of the strip's sideways scroll.
test('AC80, rewritten in G2: a press and hold with a finger (350 ms) lifts a card; dropped over Done (with its 8 px margin) it is marked; a finger that moves more than 8 px before the hold is a scroll; a tap is never a drag; a mouse lifts after 6 px; a card in the Kicked back strip is lifted out of the strip\'s scroll and carried into Done the same way', async () => {
  assert.deepEqual([HOLD_MS, MOUSE_DRAG_PX, FINGER_SLOP_PX, LANE_MARGIN_PX], [350, 6, 8, 8]);
  const undo = laneLayout();
  const { app } = await openExample({ store: storage() });
  const down = async (n, x, y, pointerType = 'touch') => {
    const c = cardOf(app, PR(n));
    c.dispatch('pointerdown', { target: byClass(c, 'v2-t')[0], clientX: x, clientY: y, pointerType });
    await app.flush();
    return c;
  };
  try {
    // A finger held 350 ms: lifted; the page does not scroll under it; dropped 8 px outside Done's box: marked.
    let c = await down(126, 50, 200);
    await app.advance(HOLD_MS - 1);
    assert.ok(!c.className.includes('lifted'), 'not before 350 ms');
    await app.advance(1);
    assert.ok(cardOf(app, PR(126)).className.includes('lifted'), 'lifted at 350 ms');
    assert.equal((await app.docEvent('touchmove', { touches: [{}], cancelable: true })).cancelled, true, 'one finger moves the card, not the page');
    assert.equal((await app.docEvent('touchmove', { touches: [{}, {}], cancelable: true })).cancelled, false, 'two fingers: a pinch, never cancelled (AC63)');
    await app.docEvent('pointermove', { clientX: 200, clientY: 300 });
    await app.docEvent('pointerup', { clientX: 240, clientY: 300 });
    assert.ok(!titles(app, 'wait').includes('Merge: the first rough estimates'), 'dropped over Done: marked');
    assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 1);
    // A finger that moves 9 px before the hold: a scroll, never a drag.
    c = await down(127, 50, 200);
    await app.docEvent('pointermove', { clientX: 50, clientY: 209 });
    await app.advance(HOLD_MS);
    assert.ok(!cardOf(app, PR(127)).className.includes('lifted'));
    await app.docEvent('pointerup', { clientX: 300, clientY: 300 });
    assert.ok(titles(app, 'wait').includes('Merge: your later-work list'), 'not marked');
    // A tap (down and up at once): never a drag.
    c = await down(127, 50, 200);
    await app.docEvent('pointerup', { clientX: 300, clientY: 300 });
    await app.advance(HOLD_MS);
    assert.ok(titles(app, 'wait').includes('Merge: your later-work list'), 'a tap is never a drag');
    // Lifted but dropped outside Done (more than 8 px off): back where it was.
    c = await down(127, 50, 200);
    await app.advance(HOLD_MS);
    await app.docEvent('pointerup', { clientX: 239, clientY: 300 });
    assert.ok(titles(app, 'wait').includes('Merge: your later-work list'), 'dropped 9 px outside: not marked');
    // A mouse: a 6 px drag lifts it, with no hold.
    c = await down(128, 50, 200, 'mouse');
    await app.docEvent('pointermove', { clientX: 55, clientY: 200 });
    assert.ok(!cardOf(app, PR(128)).className.includes('lifted'), '5 px: not yet');
    await app.docEvent('pointermove', { clientX: 56, clientY: 200 });
    assert.ok(cardOf(app, PR(128)).className.includes('lifted'), '6 px: lifted');
    await app.docEvent('pointerup', { clientX: 300, clientY: 650 });
    assert.ok(!titles(app, 'wait').includes('Merge: Work ahead (M3A)'));
    assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 2);
    // A press on a card's own button never starts a drag.
    const q = cardOf(app, Q('P-001-board-answer'));
    q.dispatch('pointerdown', { target: byClass(q, 'v2-step')[0], clientX: 50, clientY: 200, pointerType: 'touch' });
    await app.advance(HOLD_MS);
    assert.ok(!cardOf(app, Q('P-001-board-answer')).className.includes('lifted'));
    await app.docEvent('pointerup', { clientX: 300, clientY: 300 });
  } finally {
    undo();
    app.restore();
  }
  // From the Kicked back strip (G2): the card held 350 ms is lifted, and while it is carried its row is clipped sideways
  // only (`carrying`), so the card shows below the strip; the row is no longer scrolled then, so the card's move makes up
  // the row's scroll and it stays under the finger. Dropped outside Done it is back in the row, the row scrolling again;
  // dropped over Done it is marked, a new 5 minutes, as "Done ✓" from Kicked back marks it. Its only inline style is its
  // move (AC50 + AC41's case, j11-timeline.test.mjs).
  const undo2 = laneLayout();
  const styled = Object.getOwnPropertyDescriptor(El0.prototype, 'style');
  Object.defineProperty(El0.prototype, 'style', { configurable: true, get() { if (!this._st) this._st = {}; return this._st; } });
  const { app: k } = await openExample({ store: storage() });
  try {
    await markDoneInSheet(k, PR(127));
    for (let i = 1; i <= 6; i++) await k.advance(POLL_MS);
    assert.deepEqual(titles(k, 'kick'), ['Merge: your later-work list'], 'kicked back, in the strip');
    const press = async () => {
      const c = cardOf(k, PR(127));
      c.dispatch('pointerdown', { target: byClass(c, 'v2-t')[0], clientX: 60, clientY: 120, pointerType: 'touch' });
      await k.flush();
      await k.advance(HOLD_MS);
      return c;
    };
    const row = byClass(lane(k, 'kick'), 'v2-krow')[0];
    row.scrollLeft = 120; // the row scrolled sideways before the press
    let c = await press();
    assert.ok(c.className.includes('lifted'), 'lifted at 350 ms');
    assert.equal(c.parent.className, 'v2-kslot');
    assert.equal(c.parent.parent, row);
    assert.equal(row.className, 'v2-krow carrying', 'its row clipped sideways only while it is carried');
    await k.docEvent('pointermove', { clientX: 200, clientY: 300 });
    assert.equal(c.style.transform, 'translate(20px, 180px)', 'carried with the finger, the row\'s 120 px of scroll made up');
    assert.deepEqual(Object.keys(c.style), ['transform'], 'its move, its only inline style');
    await k.docEvent('pointerup', { clientX: 100, clientY: 300 });
    assert.deepEqual(titles(k, 'kick'), ['Merge: your later-work list'], 'dropped outside Done: back in the strip');
    assert.deepEqual([c.style.transform, row.className, c.className.includes('lifted')], ['', 'v2-krow', false], 'back in its row, the row scrolling again');
    c = await press();
    await k.docEvent('pointermove', { clientX: 300, clientY: 400 });
    await k.docEvent('pointerup', { clientX: 300, clientY: 400 });
    assert.deepEqual(titles(k, 'kick'), [], 'dropped over Done: marked, out of the strip');
    assert.equal(lane(k, 'kick').textContent, 'Kicked back · none', 'the strip closes to its line');
    assert.equal(byClass(lane(k, 'done'), 'v2-card conf').length, 1);
    for (let i = 1; i <= 5; i++) await k.advance(POLL_MS);
    assert.deepEqual(titles(k, 'kick'), [], 'a new 5 minutes');
  } finally {
    if (styled) Object.defineProperty(El0.prototype, 'style', styled); else delete El0.prototype.style;
    undo2();
    k.restore();
  }
});

// ---------------------------------------------------------------------------
// A notification's tap, and Work ahead

test('AC80 with AC74: a tap\'s address opens the board with that card\'s sheet in whichever lane it is, marked "Opened from a notification"; a key this device marked done opens its Done row\'s sheet', async () => {
  const store = storage();
  let { app } = await openExample({ store });
  try {
    await markDoneInSheet(app, PR(126));
  } finally {
    app.restore();
  }
  ({ app } = await openExample({ store, hash: '', search: `?sandbox&open=${encodeURIComponent(PR(126))}` }));
  try {
    assert.equal(app.loc.hash, `#/waiting/card/${encodeURIComponent(PR(126))}`, 'the marked card\'s sheet, in Done');
    assert.ok(sheet(app).textContent.includes('Opened from a notification'));
    assert.ok(sheet(app).textContent.includes(WORDS.confirming));
    assert.ok(findAll(sheet(app), (e) => e.tag === 'button' && e.textContent === 'Undo').length, 'with its "Undo"');
  } finally {
    app.restore();
  }
  ({ app } = await openExample({ store: storage(), hash: '', search: `?sandbox&open=${encodeURIComponent(PR(130))}` }));
  try {
    assert.equal(app.loc.hash, `#/waiting/card/${encodeURIComponent(PR(130))}`);
    assert.equal(byClass(sheet(app), 'v2-stitle')[0].textContent, 'Make two notification files high-risk');
    assert.ok(sheet(app).textContent.includes('Opened from a notification'));
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// AC52's one card of each kind


test('AC80, rewritten in G3 (AC91 (h)): AC52\'s one card of each kind — a decision card\'s "Answer", a gate card\'s short title, its four buttons and two lines, a hold card\'s and a merge card\'s "Open ↗", a pull request\'s step, a deploy\'s "Approve ↗" in a deploysNeedOwner project', async () => {
  const project = { ...v3('Alpha'), deploysNeedOwner: true };
  const app = await loadSandbox({ config: { ...CONFIG, projects: [project] }, repos: { Alpha: fullRepo('Alpha') }, hash: '#/waiting', now: Date.parse('2026-10-14T15:00:00Z') });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const cards = cardsIn(app, 'wait');
    const by = (kind) => cards.filter((c) => byClass(c, 'v2-kd')[0].textContent === kind);
    const kinds = cards.map((c) => byClass(c, 'v2-kd')[0].textContent).sort();
    assert.deepEqual(kinds, ['Decision', 'Deploy', 'Gate · Build', 'Hold', 'Merge card', 'Pull request', 'Question'].sort(), kinds.join(', '));
    assert.equal(byClass(by('Decision')[0], 'v2-step')[0].textContent, 'Answer');
    const gate = by('Gate · Build')[0];
    // Rewritten in G3 (AC91 (h); AC80's note "After the glance audit": "a gate card's short title"): the made-up Build-gate
    // card (NOT a real record, md-extremes/gate-card.md) has no case line in its section 1, so its title is "<the gate's
    // title> · <item>", never the question its first line asks; every other card keeps its own title.
    assert.equal(byClass(gate, 'v2-t')[0].textContent, 'The Build gate · P-002');
    assert.equal(byClass(by('Decision')[0], 'v2-t')[0].textContent, 'Research Q-020 (Alpha) failed: re-specify, drop or retry?', 'a decision card keeps its section 1\'s first line');
    assert.deepEqual(byClass(gate, 'v2-step').map((b) => b.textContent), ['Proceed', 'Hold', 'Recycle', 'Kill']);
    assert.deepEqual(byClass(gate, 'v2-gl').map((l) => l.textContent.split(':')[0]), ['Critic', 'User rep']);
    const proceed = decodeValue(byClass(gate, 'v2-step')[0].attrs.href);
    assert.match(proceed, /^Decision: proceed\n\n/, 'each its filled-in answer file');
    assert.match(decodeValue(byClass(gate, 'v2-step')[2].attrs.href), /^Decision: recycle\n\nInto: \nReason: \n/, "recycle: `Into: ` and `Reason: ` for the owner to complete, in decisions/README.md's order");
    assert.equal(byClass(by('Hold')[0], 'v2-step')[0].textContent, 'Open ↗');
    assert.equal(byClass(by('Merge card')[0], 'v2-step')[0].textContent, 'Open ↗');
    assert.equal(byClass(by('Deploy')[0], 'v2-step')[0].textContent, 'Approve ↗');
    assert.match(byClass(by('Deploy')[0], 'v2-step')[0].attrs.href, /\/actions\/runs\/\d+$/);
    // A card's sheet holds AC52's case for a gate: its opening paragraph and the links the tree holds.
    await app.go(byClass(gate, 'v2-t')[0].attrs.href);
    const sh = sheet(app);
    assert.ok(sh, 'the gate card\'s sheet');
    assert.ok(byClass(sh, 'v2-quote').length, 'the case\'s opening paragraph, quoted');
    assert.ok(byClass(sh, 'v2-abtn').some((b) => b.textContent.startsWith('Proceed')));
    assert.ok(findAll(sh, (e) => e.tag === 'textarea').length >= 1, 'the owner\'s words box');
  } finally {
    app.restore();
  }
});


test('AC80 with AC24: Work ahead\'s "<n> waiting on you in your Queue" counts as before, less a card marked done on this device, and its link opens the board', async () => {
  const q = fixture('notify/ac77-real/questions/P-001-next-work.md').replace('Milestone: M3A', 'Milestone: MD3').replace('Which piece of later work comes next?', 'A made-up question for MD3');
  const setup = waSetup({ extra: { 'questions/P-001-made-up-md3.md': q } });
  const app = await loadSandbox({ ...setup, hash: '#/work', now: Date.parse('2026-10-18T18:00:00Z'), store: memStore() });
  // From stage 5 the line is on Plan's row (AC86, specs/S-001.md:7041-7046; AC24's words kept).
  const you = () => byClass(app.view, 'v2-plyou').map((x) => x.textContent);
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.deepEqual(you(), ['1 waiting on you in your Queue']);
    await app.go(`#/waiting/card/${encodeURIComponent('Service-Desk|question|questions/P-001-made-up-md3.md')}`);
    await app.tap(keyed(app, 'sheet-done'));
    await app.go('#/work');
    assert.deepEqual(you(), [], 'less the card marked done');
  } finally {
    app.restore();
  }
});

test('AC80: a mark kept from before this opening is judged only at the first successful poll, as any other: still "Confirming" before it, kicked back at it once 5 minutes old', async () => {
  const store = storage();
  let { app } = await openExample({ store });
  try {
    await markDoneInSheet(app, PR(128));
  } finally {
    app.restore();
  }
  // Ten minutes later, a new opening whose first poll fails, then one that answers.
  const r = exampleRepo();
  r.fail = { kind: 'network' };
  app = await loadSandbox({ config: { ...CONFIG, projects: [EX] }, repos: { Example: r }, hash: '#/waiting', now: NOW + 11 * 60e3, store });
  try {
    await app.advance(1000);
    assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 1, 'kept on the device, still confirming');
    assert.deepEqual(titles(app, 'kick'), [], 'never judged by a failed read');
    delete r.fail;
    await app.advance(POLL_MS);
    assert.deepEqual(titles(app, 'kick'), ['Merge: Work ahead (M3A)'], 'judged at the first successful poll');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The look, from the stylesheet (AC42's and AC62's way of reading sandbox.css)

// Rewritten in G2 (AC91 (f): "two lanes ... side by side at every width, of equal width (1 : 1), 6 px apart; AC80's 1.18 : 1 : 1
// goes"): the lanes' columns; the rest of the case unchanged.
test('AC80, rewritten in G2 (AC91 (f)): the CSS — two lanes side by side at every width, of equal width, 6 px apart; every board control at least 24 px tall, a board button 28 px, a gate card\'s 26 px; the sizes AC80 names', () => {
  const css = readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (sel) => {
    const m = new RegExp(`(?:^|\\n)${sel.replace(/[.()[\]>*+]/g, (c) => `\\${c}`)} \\{([^}]*)\\}`).exec(css);
    assert.ok(m, `${sel} has its rule`);
    return m[1];
  };
  assert.match(rule('.v2-lanes'), /display: grid; grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\); gap: 6px;/, 'two columns of equal width, 6 px apart');
  assert.doesNotMatch(css, /1\.18fr/, 'AC80\'s 1.18 : 1 : 1 gone');
  // No media query changes the lanes' columns.
  for (const m of css.matchAll(/@media[^{]*\{([\s\S]*?)\}\s*\}/g)) assert.doesNotMatch(m[1], /v2-lanes/, 'at every width');
  assert.match(rule('.v2-step'), /min-height: 28px;/);
  assert.match(rule('.v2-gatebtns .v2-step'), /min-height: 26px;/);
  assert.match(rule('.v2-undo'), /min-height: 28px;/);
  assert.match(rule('.v2-lh'), /font: 600 11px\/[\d.]+ var\(--font\);/, 'lane headings 600 11 px');
  assert.match(rule('.v2-lc'), /font: var\(--t-mono\);/, 'their counts in Plex Mono 11 px');
  assert.match(rule('.v2-t'), /font: 500 12px\/[\d.]+ var\(--font\);/, 'a card\'s title 500 12 px');
  assert.match(rule('.v2-m'), /font: var\(--t-mono\);/, 'its meta in Plex Mono 11 px');
  assert.match(rule('.v2-dt'), /font: 400 12px\/[\d.]+ var\(--font\);/, 'a Done row\'s title 400 12 px');
  assert.match(rule('.v2-grp'), /font: var\(--t-label\);/, 'a group\'s name 500 11 px');
  // Every control on the board: a tap target at least 24 px tall.
  for (const sel of ['.v2-grp', '.v2-ql', '.v2-qs', '.v2-more', '.v2-x', '.v2-lnk', '.v2-ft', '.v2-undo', '.v2-fold']) {
    const h = /min-height: (\d+)px/.exec(rule(sel)) || /(?:^|;)\s*height: (\d+)px/.exec(rule(sel)) || /(?:^|\s)height: (\d+)px/.exec(rule(sel));
    assert.ok(h && Number(h[1]) >= 24, `${sel}: ${h && h[1]} px`);
  }
});

// ---------------------------------------------------------------------------
// The marks' rules, on the module (made-up marks and cards, NOT real)


test('AC80: going to the agents is no end — a marked card with the agents leaves Done, its mark dropped, no ✓; the item wins — a confirmed row whose item needs the owner again at the same step leaves Done; a mark on an "Open ↗" card whose pull request has a new head leaves Done', () => {
  const T = NOW;
  const card = (n, step, head = sha(n)) => ({ id: PR(n), key: `pr:${n}`, project: 'Example', kind: 'pr', number: n, title: `PR ${n}`, headSha: head, step: { id: step } });
  const base = { project: EX, tree: new Map(), files: new Map(), agentIds: new Set(), heldIds: new Set(), recordingNames: new Set() };
  // With the agents.
  let marks = markDone(noMarks(), card(140, 'merge'), T);
  let out = judgeMarks(marks, EX, { ...base, pulls: [{ number: 140, headSha: sha(140) }], current: new Map(), agentIds: new Set([PR(140)]) }, T + 60e3);
  assert.equal(out.marks[PR(140)], undefined, 'with the agents: the mark dropped, neither confirmed nor kicked back');
  // The item wins: confirmed (the pull request left the open list), then reopened at the same step.
  marks = markDone(noMarks(), card(126, 'merge'), T);
  out = judgeMarks(marks, EX, { ...base, pulls: [], current: new Map() }, T + 60e3);
  assert.equal(out.marks[PR(126)].confirmedAt, T + 60e3, 'confirmed by J1\'s list');
  out = judgeMarks(out, EX, { ...base, pulls: [{ number: 126, headSha: sha(126) }], current: new Map([[PR(126), card(126, 'merge')]]) }, T + 120e3);
  assert.equal(out.marks[PR(126)], undefined, 'reopened: it leaves Done, a card again');
  // "Open ↗", a new head: the owner looked, the agents pushed, and it still waits.
  marks = markDone(noMarks(), card(135, 'open'), T);
  out = judgeMarks(marks, EX, { ...base, pulls: [{ number: 135, headSha: sha(135, 'b') }], current: new Map([[PR(135), card(135, 'open', sha(135, 'b'))]]) }, T + 60e3);
  assert.equal(out.marks[PR(135)], undefined, 'never confirmed by the new head');
  // Not current: a verdict whose J20 read is not in gives "GitHub couldn't be checked yet" once kicked back.
  marks = markDone(noMarks(), card(130, 'verdict'), T);
  out = judgeMarks(marks, EX, { ...base, pulls: [{ number: 130, headSha: sha(130), head: 'cos/x', headRepo: EX.repo }], current: new Map([[PR(130), card(130, 'verdict')]]) }, T + KICK_BACK_MINUTES * 60e3);
  assert.equal(out.marks[PR(130)].kicked.reason, WORDS.cantCheck);
  // A mark at 4 m 59 s: neither confirmed nor kicked back.
  marks = markDone(noMarks(), card(127, 'merge'), T);
  out = judgeMarks(marks, EX, { ...base, pulls: [{ number: 127, headSha: sha(127) }], current: new Map([[PR(127), card(127, 'merge')]]) }, T + KICK_BACK_MINUTES * 60e3 - 1000);
  assert.equal(out.marks[PR(127)].kicked, null);
  assert.equal(out.marks[PR(127)].confirmedAt, null);
});

test('AC80 (settled after stage 1a\'s build review, round 1, finding 2): no pull request card has a check line; its sheet says "Its own checks: not read by the desk; its GitHub page shows them"; no other kind\'s sheet says it', async () => {
  const { app } = await openExample();
  try {
    for (const c of cardsIn(app, 'wait')) {
      assert.doesNotMatch(c.textContent, /check failing|checks? (pass|fail)/i, 'no check line on a card');
      assert.equal(byClass(c, 'v2-why bad').length, 0);
    }
    for (const n of [126, 135]) {
      const sh = await openSheet(app, PR(n));
      assert.equal(keyed(app, 'own-checks').textContent, 'Its own checks: not read by the desk; its GitHub page shows them');
      const blk = byClass(sh, 'v2-blk').find((b) => byClass(b, 'v2-bh')[0] && byClass(b, 'v2-bh')[0].textContent === 'What was checked');
      assert.ok(blk.contains(keyed(app, 'own-checks')), 'under AC29\'s line, in "What was checked"');
    }
    await openSheet(app, Q('P-001-board-answer'));
    assert.equal(keyed(app, 'own-checks'), null, 'a question\'s sheet: not said');
  } finally {
    app.restore();
  }
});

test('AC80 (settled after round 1, finding 7): a gate card\'s Critic line reads "Critic: its view is on GitHub" when the tree holds the Critic\'s file, "Critic: not recorded" when it doesn\'t', async () => {
  for (const [withFile, words] of [[true, 'Critic: its view is on GitHub'], [false, 'Critic: not recorded']]) {
    const r = fullRepo('Alpha');
    if (withFile) r.commit({ 'reviews/P-002/_build-gate-1-critic.md': 'Verdict: PASS\n\nMade up (NOT a real record).\n' });
    const app = await loadSandbox({ config: { ...CONFIG, projects: [v3('Alpha')] }, repos: { Alpha: r }, hash: '#/waiting', now: Date.parse('2026-10-14T15:00:00Z') });
    try {
      await app.advance(1000);
      await app.advance(POLL_MS);
      const gate = cardsIn(app, 'wait').find((c) => byClass(c, 'v2-kd')[0].textContent.startsWith('Gate'));
      assert.equal(byClass(gate, 'v2-gl')[0].textContent, words);
    } finally {
      app.restore();
    }
  }
});

// ---------------------------------------------------------------------------
// J22's rule 0 on the page (stage 1a's build review, round 1, finding 6; made-up, NOT real)

/** The Example project with #140, an R1 change needing the Reviewer's verdict, opened before every other pull request. */
function with140({ reviewer = null, owner = null, check = null } = {}) {
  const r = exampleRepo();
  r.pulls.push({ ...pr(140, 'A made-up code change', { head: 'build/builder/x-140', headRepo: EX.repo, sha: sha(140), createdAt: iso(NOW - 400 * 60e3), private: false }), html_url: `https://github.com/${EX.repo}/pull/140` });
  const files140 = (head, rev, own) => {
    const out = [{ filename: 'src/x.js', status: 'modified' }];
    if (rev) out.push({ filename: 'reviews/140/reviewer.md', status: 'added', sha: rev });
    if (own) out.push({ filename: 'reviews/140/owner.md', status: 'added', sha: own });
    return out;
  };
  r.prFiles[140] = files140(sha(140), reviewer && 'e'.repeat(40), owner && '9'.repeat(40));
  r.blobs = {};
  if (reviewer && reviewer !== 'unread') r.blobs['e'.repeat(40)] = reviewer;
  if (reviewer === 'unread') r.blobFail = ['e'.repeat(40)];
  if (check) r.statuses = { [sha(140)]: check };
  r.files140 = files140;
  return r;
}
const counts = async (app) => {
  const out = { badge: badge(app), lane: byClass(lane(app, 'wait'), 'v2-lc')[0].textContent, agents: keyed(app, 'ql:agents') ? keyed(app, 'ql:agents').textContent : null };
  await app.go('#/');
  // From stage 2 (AC82): Home's briefing ("<n> need you") and each tile's "wait on you".
  out.home = (/^(\d+) needs? you/.exec(byClass(app.view, 'v2-brief')[0].textContent) || [])[1] || null;
  out.pill = byClass(app.view, 'v2-wt').map((x) => x.textContent).join(' | ');
  await app.go('#/waiting');
  return out;
};

test('AC80 + J22 rule 0, on the page: a Reviewer\'s verdict reading FAIL and an owner check reading "Owner: after agents" put the pull request "With the agents", left out of every count (badge, lane, Home\'s line, the tile); a verdict on the branch whose blob is unread counts as given, so a card', async () => {
  for (const [name, setup, withAgents, words] of [
    ['FAIL', { reviewer: 'Verdict: FAIL\n' }, true, 'Reviewer asked for changes'],
    ['Owner: after agents', { reviewer: 'Verdict: PASS\n', check: { state: 'pending', description: 'Owner: after agents · 2 other finding(s)' } }, true, AGENTS_WORDS],
    ['unread', { reviewer: 'unread' }, false, null],
  ]) {
    const { app } = await openExample({ repos: { Example: with140(setup) } });
    try {
      await app.advance(POLL_MS);
      const c = await counts(app);
      if (withAgents) {
        assert.equal(c.agents, 'With the agents: 1', name);
        assert.ok(!titles(app, 'wait').includes('A made-up code change'), `${name}: not a card`);
        assert.deepEqual([c.badge, c.lane, c.home], ['8', '8', '8'], `${name}: in no count`);
        await app.tap(keyed(app, 'ql:agents'));
        assert.ok(byClass(keyed(app, 'fold:agents'), 'v2-fw').some((x) => x.textContent === words), `${name}: ${words}`);
      } else {
        assert.equal(c.agents, null, `${name}: not with the agents`);
        assert.ok(titles(app, 'wait').includes('A made-up code change'), `${name}: a card, the verdict counted as given`);
        assert.deepEqual([c.badge, c.lane, c.home], ['9', '9', '9'], `${name}: counted`);
      }
    } finally {
      app.restore();
    }
  }
});

test('AC80 + J22: rule 0 is never kept across heads — with the agents at head A, its verdict commit gives head B whose J20 read fails: a card at once and counted, judged by (i) alone', async () => {
  const r = with140({});
  const { app } = await openExample({ repos: { Example: r } });
  try {
    assert.equal(keyed(app, 'ql:agents').textContent, 'With the agents: 1');
    assert.equal(badge(app), '8');
    const p = r.pulls.find((x) => x.number === 140);
    p.head = { ...p.head, sha: sha(140, 'b') };
    r.filesFail = [140];
    await app.advance(POLL_MS);
    assert.ok(titles(app, 'wait').includes('A made-up code change'), 'a card at once');
    assert.equal(keyed(app, 'ql:agents'), null);
    assert.equal(badge(app), '9', 'counted');
  } finally {
    app.restore();
  }
});

test('AC80: a marked "Merge ↗" card whose pull request goes to the agents leaves Done for the "With the agents" fold, its mark dropped, no ✓; once rule 0 no longer holds, a card in "Waiting on you"', async () => {
  const store = storage();
  const r = with140({ reviewer: 'Verdict: PASS\n' });
  const { app } = await openExample({ repos: { Example: r }, store });
  try {
    assert.equal(byClass(cardOf(app, PR(140)), 'v2-step')[0].textContent, 'Merge ↗');
    await markDoneInSheet(app, PR(140));
    assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 1);
    // The agents push: head B, the Reviewer's verdict at it reading FAIL.
    const p = r.pulls.find((x) => x.number === 140);
    p.head = { ...p.head, sha: sha(140, 'b') };
    r.prFiles[140] = r.files140(sha(140, 'b'), 'd'.repeat(40));
    r.blobs['d'.repeat(40)] = 'Verdict: FAIL\n';
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.equal(byClass(lane(app, 'done'), 'v2-card conf').length, 0, 'left Done');
    assert.ok(!byClass(lane(app, 'done'), 'v2-drow').some((x) => x.textContent.includes('A made-up code change')), 'no ✓ row');
    assert.equal(keyed(app, 'ql:agents').textContent, 'With the agents: 1');
    assert.equal(JSON.parse(store.backing.get(MARKS_KEY)).marks[PR(140)], undefined, 'its mark dropped');
    // The Reviewer passes it at head C: a card again in "Waiting on you".
    p.head = { ...p.head, sha: sha(140, 'c') };
    r.prFiles[140] = r.files140(sha(140, 'c'), 'c'.repeat(40));
    r.blobs['c'.repeat(40)] = 'Verdict: PASS\n';
    await app.advance(POLL_MS);
    await app.advance(POLL_MS);
    assert.ok(titles(app, 'wait').includes('A made-up code change'));
    assert.equal(keyed(app, 'ql:agents'), null);
  } finally {
    app.restore();
  }
});

// Rewritten in G2 (AC91 (f)): Kicked back is a strip, so its unknown is said in its quiet line, "Kicked back · not read
// yet" or "Kicked back · can't read", never "none" (Part A item 5, as the lanes' words), and "none" once read.
test('AC80 with Part A item 5 (stage 1a\'s build review, round 1, F3), rewritten in G2: before the first read the lanes show no count and no "Nothing here", but "Not read yet", and the strip "Kicked back · not read yet"; with every project unreadable, "Can\'t read" and "Kicked back · can\'t read"; never a 0 or "none"', async () => {
  // Before the first read.
  let app = await loadSandbox({ config: { ...CONFIG, projects: [EX] }, repos: { Example: exampleRepo() }, hash: '#/waiting', now: NOW });
  try {
    assert.ok(!app.text().includes('checked'), 'nothing read yet');
    for (const k of ['wait', 'kick']) {
      assert.equal(cardsIn(app, k).length, 0);
      assert.equal(byClass(lane(app, k), 'v2-lc').length, 0, `${k}: no count before a read`);
    }
    assert.equal(byClass(lane(app, 'wait'), 'v2-empty')[0].textContent, 'Not read yet');
    assert.equal(lane(app, 'kick').textContent, 'Kicked back · not read yet');
    assert.doesNotMatch(byClass(app.view, 'v2-lanes')[0].textContent, /\b0\b|Nothing here/);
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.equal(byClass(lane(app, 'wait'), 'v2-lc')[0].textContent, '8', 'read: its count');
    assert.equal(lane(app, 'kick').textContent, 'Kicked back · none', 'a "none" that is a read value');
  } finally {
    app.restore();
  }
  // Every project unreadable.
  const a = exampleRepo();
  const b = fullRepo('Alpha');
  a.fail = { kind: 'network' };
  b.fail = { kind: 'network' };
  app = await loadSandbox({ config: { ...CONFIG, projects: [EX, v3('Alpha')] }, repos: { Example: a, Alpha: b }, hash: '#/waiting', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.match(app.text(), /Can't read Example since \d\d:\d\d/);
    for (const k of ['wait', 'kick']) assert.equal(byClass(lane(app, k), 'v2-lc').length, 0, `${k}: no count`);
    assert.equal(byClass(lane(app, 'wait'), 'v2-empty')[0].textContent, "Can't read");
    assert.equal(lane(app, 'kick').textContent, "Kicked back · can't read");
    assert.doesNotMatch(byClass(app.view, 'v2-lanes')[0].textContent, /\b0\b|Nothing here/);
    assert.equal(badge(app), null);
    // One project read again: the lanes show real counts.
    delete b.fail;
    await app.advance(POLL_MS);
    assert.ok(byClass(lane(app, 'wait'), 'v2-lc').length === 1, 'a count once a project is read');
  } finally {
    app.restore();
  }
});

// Rewritten for AC89 (a) (specs/S-001.md:7823-7852, the table's states 1 and 2; AC80, changed, :6503-6506): with one project
// shown and no read of it yet in this opening, no count anywhere, and the quiet lines' small line is not drawn (the table:
// "nothing" above the lanes in state 1, the "Can't read" line in state 2); once read, its counts, a 0 being words.
// Rewritten in G2 (AC91 (f)): the strip's quiet line says the project's unknown in AC89 (a)'s words, never "none".
test('AC80 with Part A item 5 (stage 1a\'s build review, round 2, N1 and F3-r2), rewritten for AC89 (a) and in G2: with the board filtered to one project not read yet or not readable, no count anywhere, no "none" in the Kicked back strip, and no small line under the lanes — before the first read, with every project down, and with only that project down', async () => {
  const smallLine = (app) => (byClass(app.view, 'v2-qsmall')[0] || { textContent: null }).textContent;
  const noZero = (app, why) => {
    assert.doesNotMatch(byClass(app.view, 'v2-lanes')[0].textContent, /\b0\b|Nothing here/, `${why}: no 0, and no "Nothing here", in the lanes`);
    assert.match(lane(app, 'kick').textContent, /^Kicked back · (not read yet|can't read)$/, `${why}: the strip says the unknown in words`);
    for (const k of ['wait', 'kick']) assert.equal(byClass(lane(app, k), 'v2-lc').length, 0, `${why}: ${k} has no count`);
    for (const q of byClass(app.view, 'v2-quiet')) assert.doesNotMatch(q.textContent.replace(/\d\d:\d\d/g, ''), /\b\d+\b/, `${why}: no count in a quiet line`);
    assert.equal(smallLine(app), null, `${why}: no small line of counts`);
  };
  const sub = (app) => byClass(app.view, 'v2-sub')[0].textContent;
  // Before the first read (state 1).
  let app = await loadSandbox({ config: { ...CONFIG, projects: [EX, v3('Alpha')] }, repos: { Example: exampleRepo(), Alpha: fullRepo('Alpha') }, hash: '#/waiting/Example', now: NOW });
  try {
    noZero(app, 'pre-read');
    assert.equal(sub(app), 'Checking…');
    assert.equal(byClass(lane(app, 'wait'), 'v2-empty')[0].textContent, 'Not read yet');
    await app.advance(1000);
    await app.advance(POLL_MS);
    assert.equal(smallLine(app), 'With the agents: 0 · Being recorded by the automatic job: 0', 'read: its real counts');
    assert.equal(findAll(byClass(app.view, 'v2-qsmall')[0], (e) => e.tag === 'button').length, 0, 'a 0 is words, opening nothing');
  } finally {
    app.restore();
  }
  // Every project down.
  const a = exampleRepo();
  const b = fullRepo('Alpha');
  a.fail = { kind: 'network' };
  b.fail = { kind: 'network' };
  app = await loadSandbox({ config: { ...CONFIG, projects: [EX, v3('Alpha')] }, repos: { Example: a, Alpha: b }, hash: '#/waiting/Example', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    noZero(app, 'all down');
    assert.equal(sub(app), 'Not read in this opening', 'state 2');
    assert.match(byClass(app.view, 'v2-board')[0].textContent, /Can't read Example since \d\d:\d\d: network error/, 'above the lanes, with its reason');
  } finally {
    app.restore();
  }
  // Only that project down, the other read.
  const c = fullRepo('Alpha');
  c.fail = { kind: 'network' };
  app = await loadSandbox({ config: { ...CONFIG, projects: [EX, v3('Alpha')] }, repos: { Example: exampleRepo(), Alpha: c }, hash: '#/waiting/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    noZero(app, 'one down');
    assert.equal(byClass(lane(app, 'wait'), 'v2-empty')[0].textContent, "Can't read");
    await app.go('#/waiting/Example');
    assert.equal(smallLine(app), 'With the agents: 0 · Being recorded by the automatic job: 0', 'the read project: its counts');
  } finally {
    app.restore();
  }
});

test('AC80 with AC5 (stage 1a\'s build review, round 3, finding 2): filtered to a project read earlier in this opening and now re-checking, the small line says "checking…", never "not read yet"', async () => {
  const { app } = await openExample({ hash: '#/waiting/Example' });
  try {
    assert.equal(byClass(app.view, 'v2-qsmall')[0].textContent, 'With the agents: 0 · Being recorded by the automatic job: 0');
    await app.visibility('hidden');
    await app.advance(10 * 60e3);
    await app.visibility('visible');
    const t = byClass(app.view, 'v2-qsmall')[0].textContent;
    assert.equal(t, 'With the agents: checking… · Being recorded by the automatic job: checking…');
    await app.advance(POLL_MS);
    assert.equal(byClass(app.view, 'v2-qsmall')[0].textContent, 'With the agents: 0 · Being recorded by the automatic job: 0', 'read again: its counts');
  } finally {
    app.restore();
  }
});
