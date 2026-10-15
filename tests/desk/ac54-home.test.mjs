// AC54 (spec S-001, trial-view notes 1 to 4): Home's brief summary from each project's README, the
// "Latest" line in a bubble, the two-column grid on the phone, and the three collapsible groups.
// ac-test: S-001/AC54
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIX, SRC, CONFIG, fixture } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll, j11Files } from './sandbox-helpers.mjs';
import { NOW, v3, v25, fullRepo, extremes } from './sandbox-fixtures.mjs';
import { readmeSummary, plainInline } from '../../src/lib/j11.js';
import { summaryView, homeGroupOf, groupHeaderWords, NO_SUMMARY, SUMMARY_NOT_AVAILABLE, HOME_GROUPS_KEY } from '../../src/lib/sandbox.js';
import { POLL_MS } from '../../src/lib/scheduler.js';

const tv = (p) => readFileSync(join(FIX, 'trial-view', p), 'utf8');
const SD_SUMMARY = "The owner's phone-first desk over every project the agents run: one card per project showing what waits on the owner, what the team is doing and where the work is heading, with each answer opened in GitHub ready to commit. It reads the projects' records and holds no write access.";
const ROUTING = fixture('service-desk/governance/ROUTING.toml');

async function openHome(config, repos, store = null) {
  const app = await loadSandbox({ config, repos, hash: '#/', now: NOW, store });
  await app.advance(1000);
  return app;
}
const groupBtn = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === `hgroup-btn:${k}`)[0];
const card = (app, name) => findAll(app.view, (e) => e.dataset && e.dataset.k === `card:${name}`)[0] || null;
const latest = (app, name) => findAll(app.view, (e) => e.dataset && e.dataset.k === `latest:${name}`)[0];
const bubbleOf = (app, name) => findAll(app.view, (e) => e.dataset && e.dataset.k === `bubble:${name}`)[0] || null;

// ---------------------------------------------------------------------------
// (a) The brief summary

test('AC54 (a): Service-Desk\'s README at 4433c4f gives its first paragraph exactly; lines joined; inline Markdown as plain text', () => {
  assert.equal(readmeSummary(tv('README-4433c4f.md')), SD_SUMMARY);
  assert.equal(readmeSummary('# T\n\nOne line\n  and the next,\nand a third.\n\nNot this.\n'), 'One line and the next, and a third.');
  assert.equal(readmeSummary('# T\n\nA **bold** and *soft* word, `code`, a [link](https://x.example/y) and __under__ _score_ snake_case.\n'),
    'A bold and soft word, code, a link and under score snake_case.');
  assert.equal(plainInline('see ![the logo](a.png) here'), 'see the logo here');
  // Other blocks are skipped; a heading ends the search.
  assert.equal(readmeSummary('# T\n\n- a list\n- of things\n\n> a quote\n\n| a | table |\n\n<p>html</p>\n\n```\ncode\n\nmore code\n```\n\n1. a number\n\nThe paragraph.\n'), 'The paragraph.');
  assert.equal(readmeSummary('# T\n\n- only a list\n\n## Then a heading\n\nA paragraph too late.\n'), null);
  assert.equal(readmeSummary('No title here.\n\nA paragraph.\n'), null);
  assert.equal(readmeSummary(''), null);
});

test('AC54 (a): "no summary in this project\'s README" with no README, no title or no paragraph; "summary not available" (reason one tap away) before the read or when it fails', () => {
  const P = v3('A');
  const snap = (files, read = true) => {
    const tree = new Map(Object.keys(files).map((p) => [p, { sha: p }]));
    const records = new Map(read ? Object.entries(files).map(([p, t]) => [p, { summary: readmeSummary(t) }]) : []);
    return { tree, records };
  };
  assert.deepEqual(summaryView(P, {}, snap({ 'README.md': tv('README-4433c4f.md') })), { ok: true, text: SD_SUMMARY, why: null });
  assert.equal(summaryView(P, {}, snap({ 'README.md': '# T\n\n- a list\n\n## H\n' })).text, NO_SUMMARY);
  assert.equal(summaryView(P, {}, snap({ 'README.md': 'no title\n' })).text, NO_SUMMARY);
  assert.equal(summaryView(P, {}, snap({ 'other.md': 'x' })).text, NO_SUMMARY);
  const pending = summaryView(P, {}, snap({ 'README.md': '# T\n\nP.\n' }, false));
  assert.equal(pending.text, SUMMARY_NOT_AVAILABLE);
  assert.match(pending.why, /not been read yet, or its read failed/);
  assert.equal(summaryView(P, { read: { read: 'cant-read', words: 'GitHub error' } }, { tree: null }).text, SUMMARY_NOT_AVAILABLE);
});

test('AC54 (a): the cards show the README summary for a v3 and a v2.5 project; a failed README read never makes a project "Can\'t read"', async () => {
  const config = { ...CONFIG, projects: [v3('Alpha'), v25('Delta')] };
  const repos = {
    Alpha: repo({ 'governance/ROUTING.toml': ROUTING, 'README.md': tv('README-4433c4f.md') }),
    Delta: repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), 'README.md': '# Delta\n\nThe *operating model* itself.\n' }),
  };
  const app = await openHome(config, repos);
  try {
    groupBtn(app, 'closed').click();
    await app.flush();
    assert.equal(byClass(card(app, 'Alpha'), 'sb-sum')[0].textContent, SD_SUMMARY);
    assert.equal(byClass(card(app, 'Delta'), 'sb-sum')[0].textContent, 'The operating model itself.', 'read for a v2.5 project too');
    assert.doesNotMatch(app.text(), /Can't read/);
  } finally {
    app.restore();
  }
});

test('AC54 (a) + AC42: at 360 px the 600-character summary is in the card whole: no clipping, ellipsis, line clamp or overflow', async () => {
  const long = readmeSummary(tv('README-600.md'));
  assert.equal(long.length, 600);
  const config = { ...CONFIG, projects: [v3('Alpha')] };
  const app = await openHome(config, { Alpha: repo({ 'governance/ROUTING.toml': ROUTING, 'README.md': tv('README-600.md') }) });
  try {
    assert.equal(byClass(card(app, 'Alpha'), 'sb-sum')[0].textContent, long);
  } finally {
    app.restore();
  }
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  for (const sel of ['.sb-sum', '.sb-pc-main', '.sb-pc', '.sb-grid', '.sb-hgroup', '.sb-bubble', '.sb-bubble-t']) {
    for (const m of css.matchAll(new RegExp(`(?:^|[},\\s])${sel.replace('.', '\\.')}\\s*(?:,[^{]*)?\\{([^}]*)\\}`, 'g'))) {
      assert.doesNotMatch(m[1], /line-clamp|text-overflow|overflow(-x|-y)?:\s*(hidden|clip|scroll|auto)|max-height|white-space:\s*nowrap/, `${sel}: ${m[1]}`);
    }
  }
});

// ---------------------------------------------------------------------------
// (b) The "Latest" bubble

function twoKinds() {
  const config = { ...CONFIG, projects: [v3('Alpha'), v25('Delta')] };
  const repos = { Alpha: fullRepo('Alpha'), Delta: repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }) };
  return { config, repos };
}

test('AC54 (b): the bubble\'s text is AC37\'s line (v3) and AC10\'s headline (v2.5) exactly; the line is not printed on the card', async () => {
  const { config, repos } = twoKinds();
  const app = await openHome(config, repos);
  try {
    groupBtn(app, 'closed').click();
    await app.flush();
    await app.go('#/p/Alpha');
    const where = byClass(app.view, 'sb-lead')[0].textContent;
    await app.go('#/');
    assert.ok(!card(app, 'Alpha').textContent.includes(where), 'not printed on the card');
    latest(app, 'Alpha').dispatch('pointerdown', { pointerType: 'touch' });
    latest(app, 'Alpha').click();
    await app.flush();
    assert.equal(byClass(bubbleOf(app, 'Alpha'), 'sb-bubble-t')[0].textContent, where);
    await app.tapOutside();
    const headline = app.desk.model('Delta').headline.text;
    assert.ok(headline && headline.length > 5);
    assert.ok(!card(app, 'Delta').textContent.includes(headline));
    latest(app, 'Delta').dispatch('pointerdown', { pointerType: 'touch' });
    latest(app, 'Delta').click();
    await app.flush();
    assert.equal(byClass(bubbleOf(app, 'Delta'), 'sb-bubble-t')[0].textContent, headline);
    assert.equal(bubbleOf(app, 'Alpha'), null, 'one bubble at a time');
  } finally {
    app.restore();
  }
});

test('AC54 (b): it opens on hover, on a tap and on keyboard focus, and closes on Escape, a second tap and a tap outside; a tap on it never opens the Project screen', async () => {
  const { config, repos } = twoKinds();
  const app = await openHome(config, repos);
  try {
    const ctl = latest(app, 'Alpha');
    assert.equal(ctl.attrs['aria-label'], 'Latest');
    // Hover, with a pointer: open, then closed once the pointer leaves the control and the bubble.
    ctl.dispatch('pointerenter', { pointerType: 'mouse' });
    await app.flush();
    assert.ok(bubbleOf(app, 'Alpha'), 'hover opens it');
    bubbleOf(app, 'Alpha').dispatch('pointerenter', { pointerType: 'mouse' });
    ctl.dispatch('pointerleave', { pointerType: 'mouse' });
    await app.advance(300);
    assert.ok(bubbleOf(app, 'Alpha'), 'still open while the pointer is over the bubble');
    bubbleOf(app, 'Alpha').dispatch('pointerleave', { pointerType: 'mouse' });
    await app.advance(300);
    assert.equal(bubbleOf(app, 'Alpha'), null, 'closed once the pointer left both');
    // A tap, a second tap, a tap outside.
    await app.advance(2000);
    const tap = async () => { ctl.dispatch('pointerdown', { pointerType: 'touch' }); ctl.click(); await app.flush(); };
    await tap();
    assert.ok(bubbleOf(app, 'Alpha'), 'a tap opens it');
    assert.equal(app.loc.hash, '#/', 'and opens no Project screen');
    await tap();
    assert.equal(bubbleOf(app, 'Alpha'), null, 'a second tap closes it');
    await tap();
    await app.tapOutside();
    assert.equal(bubbleOf(app, 'Alpha'), null, 'a tap outside closes it');
    // Its Close control, at its top.
    await tap();
    const close = byClass(bubbleOf(app, 'Alpha'), 'sb-close')[0];
    assert.equal(close.attrs['aria-label'], 'Close');
    assert.equal(bubbleOf(app, 'Alpha').children[0], byClass(bubbleOf(app, 'Alpha'), 'sb-bubble-top')[0]);
    close.click();
    await app.flush();
    assert.equal(bubbleOf(app, 'Alpha'), null);
    assert.equal(document.activeElement, latest(app, 'Alpha'), 'focus back on the control, and it stays closed');
    // The keyboard: focus opens it, Escape closes it and it stays closed while focus stays; Enter opens it again.
    await app.advance(2000);
    latest(app, 'Alpha').blur();
    latest(app, 'Alpha').focus();
    await app.flush();
    assert.ok(bubbleOf(app, 'Alpha'), 'keyboard focus opens it');
    await app.key('Escape');
    assert.equal(bubbleOf(app, 'Alpha'), null, 'Escape closes it');
    assert.equal(document.activeElement, latest(app, 'Alpha'), 'focus returns to the control');
    latest(app, 'Alpha').dispatch('focus');
    await app.flush();
    assert.equal(bubbleOf(app, 'Alpha'), null, 'closed with Escape, it stays closed while focus stays on its control');
    latest(app, 'Alpha').dispatch('keydown', { key: 'Enter' });
    await app.flush();
    assert.ok(bubbleOf(app, 'Alpha'), 'Enter opens it again');
    await app.key('Escape');
    latest(app, 'Alpha').blur();
    await app.advance(10);
    latest(app, 'Alpha').focus();
    await app.flush();
    assert.ok(bubbleOf(app, 'Alpha'), 'focus leaving and coming back opens it again');
    // A tap elsewhere on the card still opens the Project screen: the card's main link.
    assert.equal(byClass(card(app, 'Alpha'), 'sb-pc-main')[0].attrs.href, '#/p/Alpha');
    assert.ok(!findAll(byClass(card(app, 'Alpha'), 'sb-pc-main')[0], (e) => e === latest(app, 'Alpha')).length, 'the control is not inside the link');
  } finally {
    app.restore();
  }
});

test('AC54 (b) + AC56 (build review B1): one tap on another card\'s "Latest" opens its bubble, after another control had focus or another bubble was open, in a browser\'s real focus order', async () => {
  const setup = extremes();
  const app = await openHome(setup.config, setup.repos);
  try {
    const names = setup.config.projects.map((p) => p.name).filter((n) => latest(app, n)); // the cards shown (closed groups hide theirs)
    const open = () => names.filter((n) => bubbleOf(app, n));
    assert.ok(names.length >= 3 && names.includes('Alpha') && names.includes('Beta') && names.includes('Gamma'), `cards shown: ${names}`);
    const trace = [];
    for (const n of names) for (const t of ['pointerdown', 'blur', 'focusout', 'focus', 'focusin', 'click']) latest(app, n).addEventListener(t, () => trace.push(`${t}:${n}`));
    // The review's touch steps: tap Alpha (opens), tap it again (closes), then tap Beta once.
    await app.tap(latest(app, 'Alpha'));
    assert.deepEqual(open(), ['Alpha'], 'a tap opens Alpha\'s');
    await app.tap(latest(app, 'Alpha'));
    assert.deepEqual(open(), [], 'a second tap closes it');
    trace.length = 0;
    await app.tap(latest(app, 'Beta'));
    assert.deepEqual(trace, ['pointerdown:Beta', 'blur:Alpha', 'focusout:Alpha', 'focus:Beta', 'focusin:Beta', 'click:Beta'], 'the browser\'s order: the old control loses focus between the press and the click');
    assert.deepEqual(open(), ['Beta'], 'one tap opens Beta\'s, with Alpha\'s control having had focus');
    // Straight from an open bubble to each other card's control: one tap each.
    for (const n of names.filter((x) => x !== 'Beta')) {
      await app.tap(latest(app, n));
      assert.deepEqual(open(), [n], `one tap opens ${n}'s, straight from the open one`);
      assert.equal(document.activeElement, latest(app, n));
    }
    // From the keyboard's bubble: focus on Alpha's control opens it; a tap on Beta's opens Beta's.
    await app.tap(latest(app, names[names.length - 1])); // closes the open one
    assert.deepEqual(open(), []);
    latest(app, 'Alpha').focus();
    await app.flush();
    assert.deepEqual(open(), ['Alpha'], 'keyboard focus opens Alpha\'s');
    await app.tap(latest(app, 'Beta'));
    await app.advance(10);
    assert.deepEqual(open(), ['Beta'], 'one tap on Beta\'s, after the keyboard\'s bubble');
    // A tap outside, on the page, then a tap on Gamma's: one tap opens it.
    await app.tap(app.view);
    assert.deepEqual(open(), [], 'a tap outside closes it');
    assert.equal(document.activeElement, latest(app, 'Beta'), 'with focus back on its control (AC56)');
    await app.tap(latest(app, 'Gamma'));
    assert.deepEqual(open(), ['Gamma'], 'and one tap on Gamma\'s then opens it');
    // A tap outside that lands on another card's control: the old bubble closes, the tapped one opens and keeps the focus.
    await app.tap(latest(app, 'Alpha'));
    assert.deepEqual(open(), ['Alpha']);
    assert.equal(document.activeElement, latest(app, 'Alpha'));
    // Later keyboard focus on Gamma's control still opens it: the tap outside left nothing behind.
    latest(app, 'Gamma').focus();
    await app.flush();
    assert.deepEqual(open(), ['Gamma'], 'keyboard focus on a control whose bubble a tap closed opens it');
  } finally {
    app.restore();
  }
});

test('AC54 (b) (build review B1): with a mouse, hover then click keeps the bubble open, with or without another control having had focus', async () => {
  const setup = extremes();
  const app = await openHome(setup.config, setup.repos);
  try {
    const names = setup.config.projects.map((p) => p.name).filter((n) => latest(app, n)); // the cards shown (closed groups hide theirs)
    const open = () => names.filter((n) => bubbleOf(app, n));
    // No control had focus yet.
    await app.tap(latest(app, 'Alpha'), { pointerType: 'mouse' });
    assert.deepEqual(open(), ['Alpha'], 'hover opens it and the click keeps it');
    latest(app, 'Alpha').dispatch('pointerleave', { pointerType: 'mouse' });
    await app.advance(300);
    assert.deepEqual(open(), ['Alpha'], 'clicked, it stays when the pointer leaves');
    // Alpha's control has focus; hover Beta's (it opens), then click it: it stays open.
    latest(app, 'Beta').dispatch('pointerenter', { pointerType: 'mouse' });
    await app.flush();
    assert.deepEqual(open(), ['Beta'], 'hover opens Beta\'s');
    await app.tap(latest(app, 'Beta'), { pointerType: 'mouse', hover: false });
    assert.deepEqual(open(), ['Beta'], 'the click after the hover keeps it open');
    await app.tap(latest(app, 'Beta'), { pointerType: 'mouse', hover: false });
    assert.deepEqual(open(), [], 'a second click closes it');
  } finally {
    app.restore();
  }
});

test('AC54 (b): at 360 px the bubble spans the grid inside the gutters, above or below the control, wrapping, never clipped (the CSS; the browser check is in the pull request)', () => {
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  assert.match(css, /\.sb-bubble\.col-l \{ left: 0; right: calc\(-100% - 8px\); \}/, 'a left-column card\'s bubble spans both columns');
  assert.match(css, /\.sb-bubble\.col-r \{ right: 0; left: calc\(-100% - 8px\); \}/);
  assert.match(css, /\.sb-grid \{ display: grid; grid-template-columns: 1fr 1fr; gap: 8px; \}/, 'the grid\'s gap is the bubble\'s 8 px');
  assert.match(css, /\.sb-bubble\.up \{ top: auto; bottom: calc\(100% \+ 4px\); \}/, 'placed above to fit');
  const block = /@media \(prefers-reduced-motion: no-preference\) \{\s*\.sb-bubble \{ animation/.test(css);
  assert.ok(block, 'its motion only without reduced motion');
});

// ---------------------------------------------------------------------------
// (c) Two columns on the phone

test('AC54 (c): two columns at every width up to 600 px (360 and 414 included); H5\'s extremes with the 600-character README render without error', async () => {
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  const grids = [...css.matchAll(/\.sb-grid \{[^}]*grid-template-columns:\s*([^;]+);/g)].map((m) => m[1]);
  assert.deepEqual(grids, ['1fr 1fr'], 'one rule, two columns, at every width (the page is at most 560 px wide)');
  assert.doesNotMatch(css, /@media \([^)]*width[^)]*\) \{\s*\.sb-grid/, 'no width query changes it');
  const setup = extremes();
  setup.repos.Alpha.commit({ 'README.md': tv('README-600.md') });
  const app = await openHome(setup.config, setup.repos);
  try {
    for (const k of ['done', 'closed']) { groupBtn(app, k).click(); await app.flush(); }
    assert.equal(byClass(app.view, 'sb-pc').length, 5);
    assert.doesNotMatch(app.text(), /Can't show/);
    assert.equal(byClass(card(app, 'Alpha'), 'sb-sum')[0].textContent.length, 600);
    for (const g of byClass(app.view, 'sb-grid')) {
      byClass(g, 'sb-pc').forEach((c, i) => assert.ok(c.className.includes(i % 2 ? 'col-r' : 'col-l'), 'each card knows its column'));
    }
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// (d) Three collapsible groups

const status = (fields) => Object.entries(fields).map(([k, v]) => `${k} = ${typeof v === 'string' ? JSON.stringify(v) : v}`).join('\n');
function snapOf(files) {
  const tree = new Map(Object.keys(files).map((p) => [p, { sha: p }]));
  const records = new Map();
  for (const [p, t] of Object.entries(files)) {
    if (!/^status\/.+\.toml$/.test(p) || t == null) continue;
    const fields = Object.fromEntries(t.split('\n').map((l) => /^(\w+) = "?(.*?)"?$/.exec(l)).filter(Boolean).map((m) => [m[1], m[2]]));
    records.set(p, { ok: true, fields });
  }
  return { tree, records };
}

test('AC54 (d): each group rule — v2.5, Done, closed (drop, kill), closed with re-scope (Active), no project item, not read yet, and an open item', () => {
  const V3 = v3('A');
  assert.equal(homeGroupOf(v25('B'), snapOf({}), null).group, 'closed', 'a v2.5 project is not run through its phases');
  assert.equal(homeGroupOf(V3, snapOf({}), { done: true }).group, 'done');
  assert.equal(homeGroupOf(V3, snapOf({ 'status/P-001.toml': status({ kind: 'project', state: 'closed', outcome: 'drop' }) }), { done: false }).group, 'closed');
  assert.equal(homeGroupOf(V3, snapOf({ 'status/P-001.toml': status({ kind: 'project', state: 'closed', outcome: 'kill' }), 'status/Q-001.toml': status({ kind: 'research', state: 'ready' }) }), { done: false }).group, 'closed',
    'only project items count');
  const rescope = homeGroupOf(V3, snapOf({ 'status/P-001.toml': status({ kind: 'project', state: 'closed', outcome: 're-scope' }) }), { done: false });
  assert.equal(rescope.group, 'active', 'closed with re-scope stays Active until the owner rules');
  assert.match(rescope.why, /question 11/);
  assert.equal(homeGroupOf(V3, snapOf({ 'status/Q-001.toml': status({ kind: 'research', state: 'closed' }) }), { done: false }).group, 'active', 'no project item');
  assert.equal(homeGroupOf(V3, { tree: null }, null).group, 'active', 'not read yet');
  const unread = snapOf({ 'status/P-001.toml': status({ kind: 'project', state: 'closed', outcome: 'drop' }) });
  unread.records.clear();
  assert.equal(homeGroupOf(V3, unread, { done: false }).group, 'active', 'a status not read yet');
  assert.equal(homeGroupOf(V3, snapOf({ 'status/P-001.toml': status({ kind: 'project', state: 'closed', outcome: 'drop' }), 'status/P-002.toml': status({ kind: 'project', state: 'dispatched' }) }), { done: false }).group, 'active');
  assert.deepEqual(groupHeaderWords([{ waiting: 1 }, { waiting: 0, cantRead: true }]).words, '2 projects · 1 waiting on you · 1 can\'t be read');
  assert.equal(groupHeaderWords([]).words, '0 projects');
});

function groupsSetup() {
  const sd = { ...j11Files(), 'decisions/questions/P-001-graduation.md': 'Ruling: graduate\n' };
  const config = { ...CONFIG, projects: [v3('Zeta'), v3('Alpha'), v3('Dropped'), v3('Rescoped'), v3('Done-one'), v25('Delta'), v3('Broken')] };
  const repos = {
    Zeta: fullRepo('Zeta'),
    Alpha: repo({ 'governance/ROUTING.toml': ROUTING }),
    Dropped: repo({ 'governance/ROUTING.toml': ROUTING, 'status/P-001.toml': status({ kind: 'project', stage: 3, state: 'closed', outcome: 'drop' }),
      'questions/Dropped-ask.md': '# Ruling needed: still open\n\nWHY: x\nOPTIONS:\n  A. a\n  B. b\nRECOMMENDATION: A\n' }),
    Rescoped: repo({ 'governance/ROUTING.toml': ROUTING, 'status/P-001.toml': status({ kind: 'project', stage: 3, state: 'closed', outcome: 're-scope' }) }),
    'Done-one': repo(sd),
    Delta: repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }),
    Broken: repo({ 'governance/ROUTING.toml': ROUTING }),
  };
  repos.Broken.fail = { kind: 'network' };
  return { config, repos };
}

test('AC54 (d): the groups in order, AC8\'s order within each, the starting states, and closed headers that still say what waits and what can\'t be read', async () => {
  const { config, repos } = groupsSetup();
  const app = await openHome(config, repos);
  try {
    await app.advance(4 * POLL_MS); // the J11 reads arrive; Broken goes stale
    const heads = byClass(app.view, 'sb-hg-btn');
    assert.deepEqual(heads.map((b) => byClass(b, 'sb-hg-t')[0].textContent), ['Active', 'Done', 'Closed or not applicable']);
    assert.deepEqual(heads.map((b) => b.attrs['aria-expanded']), ['true', 'false', 'false'], 'Active open; Done and Closed closed');
    const active = byClass(app.view, 'sb-hgroup')[0];
    assert.deepEqual(byClass(active, 'sb-nm').map((n) => n.textContent), ['Zeta', 'Broken', 'Alpha', 'Rescoped'], 'AC8: flagged, then can\'t-read, then by name');
    assert.match(heads[0].textContent, /4 projects/);
    assert.match(heads[0].textContent, /6 waiting on you/);
    assert.match(heads[0].textContent, /1 can't be read/);
    assert.match(heads[1].textContent, /1 project\b/);
    assert.equal(byClass(app.view, 'sb-hgroup')[1].children.length, 1, 'a closed group shows only its header');
    assert.match(byClass(heads[2], 'sb-hg-n')[0].textContent, /^2 projects$/);
    assert.equal(byClass(heads[2], 'sb-hg-you')[0].textContent, '1 waiting on you', 'a closed group holding a waiting item says so');
    assert.match(heads[2].textContent, /\(closed\)/, 'its state in words for assistive technology, as well as its mark');
    assert.match(app.text(), /7 waiting on you in all/, 'Home\'s top line counts every group');
    // Opening and closing reorders nothing.
    heads[2].click();
    await app.flush();
    const closed = byClass(app.view, 'sb-hgroup')[2];
    assert.deepEqual(byClass(closed, 'sb-nm').map((n) => n.textContent), ['Dropped', 'Delta']);
    assert.deepEqual(byClass(byClass(app.view, 'sb-hgroup')[0], 'sb-nm').map((n) => n.textContent), ['Zeta', 'Broken', 'Alpha', 'Rescoped']);
  } finally {
    app.restore();
  }
});

test('AC54 (d): a closed group holding a project that can\'t be read says so on its header', async () => {
  const config = { ...CONFIG, projects: [v3('Alpha'), v25('Delta')] };
  const repos = { Alpha: repo({ 'governance/ROUTING.toml': ROUTING }), Delta: repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }) };
  repos.Delta.fail = { kind: 'network' };
  const app = await openHome(config, repos);
  try {
    await app.advance(4 * POLL_MS);
    const h = groupBtn(app, 'closed');
    assert.equal(h.attrs['aria-expanded'], 'false');
    assert.match(byClass(h, 'sb-hg-bad')[0].textContent, /^1 can't be read$/);
  } finally {
    app.restore();
  }
});

test('AC54 (d): each group\'s state survives a reload through desk-home-groups-v1; failing storage gives the starting states with no error', async () => {
  const mem = new Map();
  const backing = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  const { config, repos } = twoKinds();
  let app = await openHome(config, repos, backing);
  try {
    groupBtn(app, 'active').click();
    groupBtn(app, 'closed').click();
    await app.flush();
  } finally {
    app.restore();
  }
  assert.deepEqual(JSON.parse(mem.get(HOME_GROUPS_KEY)), { active: false, done: false, closed: true });
  app = await openHome(config, repos, backing);
  try {
    assert.deepEqual(['active', 'done', 'closed'].map((k) => groupBtn(app, k).attrs['aria-expanded']), ['false', 'false', 'true'], 'kept through the reload');
  } finally {
    app.restore();
  }
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
  app = await openHome(config, repos, broken);
  try {
    assert.deepEqual(['active', 'done', 'closed'].map((k) => groupBtn(app, k).attrs['aria-expanded']), ['true', 'false', 'false']);
    groupBtn(app, 'done').click();
    await app.flush();
    assert.equal(groupBtn(app, 'done').attrs['aria-expanded'], 'true', 'it still opens and closes, for this window');
    assert.doesNotMatch(app.text(), /Can't show/);
  } finally {
    app.restore();
  }
});
