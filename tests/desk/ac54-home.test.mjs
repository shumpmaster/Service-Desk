// AC54 (spec S-001, trial-view notes 1 to 4): Home's brief summary from each project's README, the
// "Latest" line in a bubble, the two-column grid on the phone, and the three collapsible groups. From
// stage 2 (AC82) the cases are on Home's tiles: full width, no "Latest" bubble, frame H5's groups.
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

test('AC54 (a), kept by AC82: the tiles show the README summary for a v3 and a v2.5 project; a failed README read never makes a project "Can\'t read"', async () => {
  const config = { ...CONFIG, projects: [v3('Alpha'), v25('Delta')] };
  const repos = {
    Alpha: repo({ 'governance/ROUTING.toml': ROUTING, 'README.md': tv('README-4433c4f.md') }),
    Delta: repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), 'README.md': '# Delta\n\nThe *operating model* itself.\n' }),
  };
  const app = await openHome(config, repos);
  try {
    // From stage 2 (AC82, frame H5) "Closed or not run by the desk" starts open: the v2.5 tile shows at once.
    assert.equal(groupBtn(app, 'closed').attrs['aria-expanded'], 'true');
    assert.equal(byClass(card(app, 'Alpha'), 'sb-sum')[0].textContent, SD_SUMMARY);
    assert.equal(byClass(card(app, 'Delta'), 'sb-sum')[0].textContent, 'The operating model itself.', 'read for a v2.5 project too');
    assert.ok(card(app, 'Alpha').className.split(' ').includes('v2-tile'), 'on a tile (AC82)');
    assert.doesNotMatch(app.text(), /Can't read/);
  } finally {
    app.restore();
  }
});

test('AC54 (a) + AC42 (2026-10-15): the card holds the 600-character summary whole; its box is exactly three lines high and hides only what follows, with no ellipsis, line clamp or scrolling', async () => {
  const long = readmeSummary(tv('README-600.md'));
  assert.equal(long.length, 600);
  const config = { ...CONFIG, projects: [v3('Alpha')] };
  const app = await openHome(config, { Alpha: repo({ 'governance/ROUTING.toml': ROUTING, 'README.md': tv('README-600.md') }) });
  try {
    assert.equal(byClass(card(app, 'Alpha'), 'sb-sum')[0].textContent, long, 'word for word: nothing shortened');
    clipLines(app, 'Alpha', 31);
    await app.resize(360);
    assert.equal(byClass(card(app, 'Alpha'), 'sb-sum')[0].textContent, long, 'clipped, the card still holds the whole text');
    assert.doesNotMatch(card(app, 'Alpha').textContent, /…|\.\.\./, 'no ellipsis');
  } finally {
    app.restore();
  }
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  // Nothing else on the card clips, clamps, scrolls or keeps text on one line.
  for (const sel of ['.sb-sum', '.sb-sumbox', '.sb-pc-main', '.sb-pc-rest', '.sb-pc', '.sb-grid', '.sb-hgroup', '.sb-bubble', '.sb-bubble-t']) {
    for (const m of css.matchAll(new RegExp(`(?:^|[},\\s])${sel.replace('.', '\\.')}\\s*(?:,[^{]*)?\\{([^}]*)\\}`, 'g'))) {
      // From 2026-10-16 (AC54 (a) and (b), AC55's rule for a bubble taller than the viewport): the
      // bubble alone is held to the viewport's height less a margin and scrolls up and down inside
      // itself, never sideways. Only those declarations are allowed it; the summary never scrolls.
      const decl = sel === '.sb-bubble'
        ? m[1].replace(/max-height: calc\(100d?vh - var\(--sb-clear, 0px\) - 16px\);/g, '').replace('overflow-y: auto; overflow-x: hidden;', '')
        : m[1];
      assert.doesNotMatch(decl, /line-clamp|text-overflow|overflow(-x|-y)?:\s*(hidden|clip|scroll|auto)|max-height|white-space:\s*nowrap/, `${sel}: ${m[1]}`);
    }
  }
  // The summary's box: three lines' height exactly (3 x its line height), the rest hidden, never scrolled, no ellipsis.
  const clip = /\n\.sb-sumclip \{([^}]*)\}/.exec(css);
  assert.ok(clip, 'the summary box has its rule');
  // AC62 (2026-10-16): the summary takes the quoted record's role; its box is three of that role's lines.
  const quote = /--t-quote: \d+ [\d.]+rem\/([\d.]+) var\(--font\);/.exec(css);
  assert.ok(quote, 'the quoted record role');
  const lh = Number(quote[1]);
  assert.match(clip[1], new RegExp(`font: var\\(--t-quote\\); height: ${String(Math.round(3 * lh * 100) / 100).replace('.', '\\.')}em;`), `its height is three of its lines (3 x ${lh}em)`);
  assert.match(clip[1], /overflow: hidden; overflow: clip;/, 'it hides the lines after the third and is no scroll container where the browser has `clip`');
  assert.doesNotMatch(clip[1], /line-clamp|text-overflow|scroll|auto|max-height|nowrap/);
  assert.match(css, /\.sb-sum \{ margin: 0; font: var\(--t-quote\);/, 'the text has the box\'s role, and so its line height');
  assert.match(css, /\nbutton\.sb-sum \{[^}]*height: 100%;[^}]*font: var\(--t-quote\);/, 'the button is the box\'s three lines, in the same type');
  assert.doesNotMatch(css, /line-clamp|text-overflow:\s*ellipsis/, 'no line clamp or ellipsis anywhere in the sandbox');
});

// The fake DOM cannot lay out text, so a test says how tall the summary's text is, as the browser
// would measure it: its box is three lines (52 px at 17.28 px a line) and the text `lines` lines.
const LINE = 17.28;
function clipLines(app, name, lines) {
  const c = findAll(app.view, (e) => e.dataset && e.dataset.k === `sumclip:${name}`)[0];
  assert.ok(c, `${name}'s summary box`);
  c.clientHeight = Math.round(3 * LINE);
  c.scrollHeight = Math.round(Math.max(3, lines) * LINE);
  return c;
}
const sumCtl = (app, name) => findAll(app.view, (e) => e.dataset && e.dataset.k === `sum:${name}`)[0] || null;
const sumBubble = (app, name) => findAll(app.view, (e) => e.dataset && e.dataset.k === `sumbubble:${name}`)[0] || null;
const sumClip = (app, name) => findAll(app.view, (e) => e.dataset && e.dataset.k === `sumclip:${name}`)[0] || null;

/** Alpha with the 600-character summary and Beta with a one-line summary: one grid row. */
function longAndShort() {
  const config = { ...CONFIG, projects: [v3('Alpha'), v3('Beta')] };
  const repos = { Alpha: fullRepo('Alpha'), Beta: fullRepo('Beta') };
  repos.Alpha.commit({ 'README.md': tv('README-600.md') });
  repos.Beta.commit({ 'README.md': '# Beta\n\nA one-line summary.\n' });
  return { config, repos };
}

test('AC54 (a) (2026-10-15), as AC82 keeps it: at 360 px the 600-character summary shows three lines with the fade and is a button named "Show the whole summary of <name>"; a one-line summary shows whole with no fade and no control; one tile a row, and two a row share one height', async () => {
  const { config, repos } = longAndShort();
  const app = await openHome(config, repos);
  try {
    const long = readmeSummary(tv('README-600.md'));
    assert.equal(sumCtl(app, 'Alpha'), null, 'until the browser has measured it, the summary is plain text');
    clipLines(app, 'Alpha', 31);
    clipLines(app, 'Beta', 1);
    await app.resize(360);
    const a = sumCtl(app, 'Alpha');
    assert.ok(a, 'the summary runs past three lines: it is a control');
    assert.equal(a.tag, 'button', 'a real button');
    assert.equal(a.attrs.type, 'button');
    assert.ok(!('tabindex' in a.attrs) && !('disabled' in a.attrs), 'in the tab order');
    assert.equal(a.attrs['aria-label'], 'Show the whole summary of Alpha');
    assert.equal(a.attrs['aria-expanded'], 'false');
    assert.equal(a.textContent, long, 'its text is the whole summary; the box shows the first three lines');
    assert.ok(a.className.split(' ').includes('sb-sum'));
    assert.ok(sumClip(app, 'Alpha').className.split(' ').includes('over'), 'the fade at the cut');
    // Three lines or fewer: whole, no fade, no control.
    assert.equal(sumCtl(app, 'Beta'), null, 'a one-line summary has no control');
    assert.equal(byClass(card(app, 'Beta'), 'sb-sum')[0].tag, 'p');
    assert.equal(byClass(card(app, 'Beta'), 'sb-sum')[0].textContent, 'A one-line summary.');
    assert.ok(!sumClip(app, 'Beta').className.split(' ').includes('over'), 'and no fade');
    // The tiles (AC82; P-001-home-tiles.md, A): full width below 720 px, one a row; two a row from 720 px,
    // where "every tile the same height" holds within a row: the grid stretches its tiles, and the
    // summary box takes exactly three lines' height there.
    assert.equal(card(app, 'Alpha').parent, card(app, 'Beta').parent, 'one group\'s tiles');
    const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
    assert.match(css, /\n\.v2-tiles \{ display: grid; grid-template-columns: minmax\(0, 1fr\); gap: 8px; \}/, 'one column');
    const wide = /@media \(min-width: 720px\) \{([\s\S]*?)\n\}/.exec(css);
    assert.ok(wide, 'the wider screen\'s rules');
    assert.match(wide[1], /\.v2-tiles \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/, 'two a row from 720 px');
    assert.match(wide[1], /\.v2-tile \.sb-sumclip \{ height: calc\(3 \* 1\.4em\); \}/, 'the summary box three lines high there, short or long');
    for (const m of css.matchAll(/(?:^|\n)([^{}\n]*\.v2-tiles[^{}\n]*)\{([^}]*)\}/g)) {
      assert.doesNotMatch(m[2], /align-items|place-items|grid-auto-rows/, `the grid stretches the tiles in a row to one height (${m[1].trim()})`);
    }
    assert.doesNotMatch(/\n\.v2-tile \{([^}]*)\}/.exec(css)[1], /align-self|height:/, 'a tile takes its row\'s height');
    // Three lines at most, the rest hidden, faded into the tile's own ground in both themes (--card is each theme's).
    assert.match(css, /\n\.v2-tile \.sb-sumclip \{ font: var\(--t-small\); height: auto; max-height: calc\(3 \* 1\.4em\); \}/);
    assert.match(css, /\n\.v2-tile \.sb-sumclip\.over::after \{ height: 1\.4em; background: linear-gradient\(to right, transparent, var\(--card\) 85%\); \}/);
    assert.match(/\n\.v2-tile \{([^}]*)\}/.exec(css)[1], /background: var\(--card\);/, 'the tile\'s ground is --card');
    // The button is a separate tap target: not inside the tile's link, which still opens the project.
    const main = byClass(card(app, 'Alpha'), 'v2-ta')[0];
    assert.equal(main.attrs.href, '#/p/Alpha');
    assert.ok(!findAll(main, (e) => e === a).length, 'the control is not inside the link');
  } finally {
    app.restore();
  }
});

test('AC54 (a) (2026-10-15): a tap, Enter and Space open the whole summary in a bubble; its Close, a tap outside, Escape and a second tap close it, focus back on the summary; a tap on it never opens the Project screen', async () => {
  const { config, repos } = longAndShort();
  const app = await openHome(config, repos);
  try {
    const long = readmeSummary(tv('README-600.md'));
    clipLines(app, 'Alpha', 31);
    await app.resize(360);
    const ctl = () => sumCtl(app, 'Alpha');
    const closedWithFocus = (how) => {
      assert.equal(sumBubble(app, 'Alpha'), null, `closed by ${how}`);
      assert.equal(document.activeElement, ctl(), `focus back on the summary (${how})`);
      assert.equal(ctl().attrs['aria-expanded'], 'false');
    };
    for (const how of ['second tap', 'Close', 'outside', 'Escape']) {
      await app.tap(ctl()); // a real tap: the press, the focus it gives, the click
      const bub = sumBubble(app, 'Alpha');
      assert.ok(bub, `a tap opens it (${how})`);
      assert.equal(app.loc.hash, '#/', 'and opens no Project screen');
      assert.equal(ctl().attrs['aria-expanded'], 'true');
      assert.equal(ctl().attrs['aria-controls'], bub.attrs.id);
      assert.equal(bub.attrs.role, 'dialog');
      assert.equal(byClass(bub, 'sb-bubble-t')[0].textContent, long, 'the whole summary, word for word');
      assert.equal(bub.children[0], byClass(bub, 'sb-bubble-top')[0], 'its Close sits at its top');
      const close = byClass(bub.children[0], 'sb-close')[0];
      assert.equal(close.attrs['aria-label'], 'Close');
      if (how === 'second tap') await app.tap(ctl());
      else if (how === 'Close') await app.tap(close);
      else if (how === 'outside') await app.tap(app.view); // the page's background: the press takes focus off the control
      else await app.key('Escape');
      closedWithFocus(how);
    }
    for (const key of ['Enter', ' ']) {
      ctl().focus();
      ctl().dispatch('keydown', { key });
      await app.flush();
      assert.ok(sumBubble(app, 'Alpha'), `${key === ' ' ? 'Space' : key} opens it`);
      assert.equal(byClass(sumBubble(app, 'Alpha'), 'sb-bubble-t')[0].textContent, long);
      await app.key('Escape');
      closedWithFocus(`Escape after ${key === ' ' ? 'Space' : key}`);
    }
    assert.equal(app.loc.hash, '#/');
  } finally {
    app.restore();
  }
});

test('AC54 (a) (2026-10-15), with AC82: one bubble at a time: opening one tile\'s summary closes another\'s; and no tile has a "Latest" control', async () => {
  const { config, repos } = longAndShort();
  repos.Beta.commit({ 'README.md': tv('README-600.md') });
  const app = await openHome(config, repos);
  try {
    clipLines(app, 'Alpha', 31);
    clipLines(app, 'Beta', 31);
    await app.resize(360);
    const open = () => ['Alpha', 'Beta'].filter((n) => sumBubble(app, n));
    await app.tap(sumCtl(app, 'Alpha'));
    assert.deepEqual(open(), ['Alpha']);
    await app.tap(sumCtl(app, 'Beta'));
    assert.deepEqual(open(), ['Beta'], 'opening Beta\'s summary closes Alpha\'s');
    sumCtl(app, 'Alpha').focus();
    sumCtl(app, 'Alpha').dispatch('keydown', { key: 'Enter' });
    await app.advance(10);
    assert.deepEqual(open(), ['Alpha'], 'Enter on Alpha\'s opens it in Beta\'s place');
    assert.equal(findAll(app.view, (e) => e.dataset && /^latest:/.test(e.dataset.k || '')).length, 0, 'no "Latest" control (P-001-latest-bubble.md, A)');
    assert.equal(byClass(app.view, 'sb-latest').length, 0);
  } finally {
    app.restore();
  }
});

test('AC54 (a) (2026-10-15): judged again when the width changes: a summary past three lines at 360 px and within three at 414 px loses its fade and control at 414 px, and gains them back at 360 px', async () => {
  const crossing = readmeSummary(tv('README-crossing.md'));
  assert.equal(crossing, 'A summary of four lines at 360 pixels and three at 414 pixels.');
  const config = { ...CONFIG, projects: [v3('Gamma')] };
  const repos = { Gamma: fullRepo('Gamma') };
  repos.Gamma.commit({ 'README.md': tv('README-crossing.md') });
  const app = await openHome(config, repos);
  try {
    // R4: the fixture is measured in the browser to cross the mark (four lines at 360 px, three at
    // 414 px; the browser check confirms that first). Here the browser's measures are given.
    clipLines(app, 'Gamma', 4);
    await app.resize(360);
    assert.ok(sumCtl(app, 'Gamma'), 'at 360 px: the control');
    assert.ok(sumClip(app, 'Gamma').className.includes('over'), 'at 360 px: the fade');
    await app.tap(sumCtl(app, 'Gamma'));
    assert.ok(sumBubble(app, 'Gamma'), 'its bubble open');
    clipLines(app, 'Gamma', 3);
    await app.resize(414);
    assert.equal(sumCtl(app, 'Gamma'), null, 'at 414 px: no control');
    assert.ok(!sumClip(app, 'Gamma').className.includes('over'), 'at 414 px: no fade');
    assert.equal(sumBubble(app, 'Gamma'), null, 'and the bubble of a summary that now fits is gone');
    assert.equal(byClass(card(app, 'Gamma'), 'sb-sum')[0].textContent, crossing, 'the whole text');
    clipLines(app, 'Gamma', 4);
    await app.resize(360);
    assert.ok(sumCtl(app, 'Gamma') && sumClip(app, 'Gamma').className.includes('over'), 'back at 360 px: the fade and the control again');
    assert.equal(sumBubble(app, 'Gamma'), null, 'and the bubble closed at 414 px stays closed');
    // Nothing measured (no width yet): the last answer stands, the screen is not redrawn for it.
    const c = sumClip(app, 'Gamma');
    delete c.clientHeight;
    delete c.scrollHeight;
    await app.resize(360);
    assert.ok(sumCtl(app, 'Gamma'));
  } finally {
    app.restore();
  }
});

test('AC54 (a) (2026-10-15): "no summary in this project\'s README" and "summary not available" sit in the same three-line box and never get the control', async () => {
  const config = { ...CONFIG, projects: [v3('Alpha'), v3('Beta')] };
  const repos = { Alpha: fullRepo('Alpha'), Beta: fullRepo('Beta') };
  const app = await openHome(config, repos);
  try {
    for (const n of ['Alpha', 'Beta']) {
      assert.equal(byClass(card(app, n), 'sb-sumclip').length, 1);
      clipLines(app, n, 5); // even if it measured past three lines
    }
    await app.resize(360);
    for (const n of ['Alpha', 'Beta']) {
      assert.equal(sumCtl(app, n), null, `${n}: no control for the desk's own words`);
      assert.match(byClass(card(app, n), 'sb-sum')[0].textContent, /no summary in this project's README|summary not available/);
    }
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// (b) The "Latest" bubble

function twoKinds() {
  const config = { ...CONFIG, projects: [v3('Alpha'), v25('Delta')] };
  const repos = { Alpha: fullRepo('Alpha'), Delta: repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }) };
  return { config, repos };
}

test('AC54 (b), changed by AC82: no "Latest" bubble on any tile ("Ruling: A — project tiles drop the "Latest" bubble"); AC37\'s line (v3) and AC10\'s headline (v2.5) are not printed on the tile; "Since you last looked" carries what is new', async () => {
  const { config, repos } = twoKinds();
  const app = await openHome(config, repos);
  try {
    await app.go('#/p/Alpha');
    const where = byClass(app.view, 'sb-lead')[0].textContent;
    await app.go('#/');
    for (const n of ['Alpha', 'Delta']) {
      assert.ok(card(app, n), `${n}'s tile`);
      assert.equal(findAll(card(app, n), (e) => e.attrs && e.attrs['aria-label'] === 'Latest').length, 0, `${n}: no "Latest" control`);
      assert.equal(byClass(card(app, n), 'sb-bubble').length, 0, `${n}: no bubble`);
    }
    assert.ok(!card(app, 'Alpha').textContent.includes(where), 'AC37\'s line not printed on the tile');
    const headline = app.desk.model('Delta').headline.text;
    assert.ok(headline && headline.length > 5);
    assert.ok(!card(app, 'Delta').textContent.includes(headline), 'nor the ledger\'s headline');
    assert.match(findAll(app.view, (e) => e.dataset && e.dataset.k === 'since-h')[0].textContent, /^Since you last looked/, 'what is new is in "Since you last looked"');
  } finally {
    app.restore();
  }
});

test('AC54 (b), changed by AC82: a tap on the tile opens the project\'s Status screen (stage 2, AC81 "Until stage 3"); a tap on its summary\'s control never does', async () => {
  const { config, repos } = longAndShort();
  const app = await openHome(config, repos);
  try {
    clipLines(app, 'Alpha', 31);
    await app.resize(360);
    const link = byClass(card(app, 'Alpha'), 'v2-ta')[0];
    assert.equal(link.tag, 'a');
    assert.equal(link.attrs.href, '#/p/Alpha', 'the tile\'s link: the project\'s Status screen in stage 2');
    assert.equal(link.textContent, 'Alpha', 'named by the project');
    const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
    assert.match(css, /\n\.v2-ta::after \{ content: ""; position: absolute; inset: 0; border-radius: 10px; \}/, 'stretched over the whole tile');
    assert.match(/\n\.v2-tile \{([^}]*)\}/.exec(css)[1], /position: relative;/);
    await app.tap(sumCtl(app, 'Alpha'));
    assert.ok(sumBubble(app, 'Alpha'));
    assert.equal(app.loc.hash, '#/', 'the summary\'s tap opens no screen');
    await app.key('Escape');
    await app.tap(link);
    await app.go(link.attrs.href);
    assert.equal(byClass(app.view, 'sb-lead').length, 1, 'the Status screen');
  } finally {
    app.restore();
  }
});

test('AC54 (a) + AC56 (build review B1), on AC82\'s tiles: one tap on another tile\'s summary opens its bubble, after another control had focus or another bubble was open, in a browser\'s real focus order', async () => {
  const setup = extremes();
  for (const n of ['Alpha', 'Beta', 'Gamma']) setup.repos[n].commit({ 'README.md': tv('README-600.md') });
  const app = await openHome(setup.config, setup.repos);
  try {
    for (const n of ['Alpha', 'Beta', 'Gamma']) clipLines(app, n, 31);
    await app.resize(360);
    const names = ['Alpha', 'Beta', 'Gamma'];
    const open = () => names.filter((n) => sumBubble(app, n));
    const trace = [];
    for (const n of names) for (const t of ['pointerdown', 'blur', 'focusout', 'focus', 'focusin', 'click']) sumCtl(app, n).addEventListener(t, () => trace.push(`${t}:${n}`));
    await app.tap(sumCtl(app, 'Alpha'));
    assert.deepEqual(open(), ['Alpha'], 'a tap opens Alpha\'s');
    await app.tap(sumCtl(app, 'Alpha'));
    assert.deepEqual(open(), [], 'a second tap closes it');
    trace.length = 0;
    await app.tap(sumCtl(app, 'Beta'));
    assert.deepEqual(trace, ['pointerdown:Beta', 'blur:Alpha', 'focusout:Alpha', 'focus:Beta', 'focusin:Beta', 'click:Beta'], 'the browser\'s order: the old control loses focus between the press and the click');
    assert.deepEqual(open(), ['Beta'], 'one tap opens Beta\'s, with Alpha\'s control having had focus');
    for (const n of ['Alpha', 'Gamma']) {
      await app.tap(sumCtl(app, n));
      assert.deepEqual(open(), [n], `one tap opens ${n}'s, straight from the open one`);
      assert.equal(document.activeElement, sumCtl(app, n));
    }
    await app.tap(app.view);
    assert.deepEqual(open(), [], 'a tap outside closes it');
    assert.equal(document.activeElement, sumCtl(app, 'Gamma'), 'with focus back on its control (AC56)');
    await app.tap(sumCtl(app, 'Beta'));
    assert.deepEqual(open(), ['Beta'], 'and one tap on Beta\'s then opens it');
  } finally {
    app.restore();
  }
});

test('AC54 (a) (build review B1), on AC82\'s tiles: with a mouse, a click opens the summary and keeps it when the pointer leaves; a second click closes it; with another control having had focus too', async () => {
  const { config, repos } = longAndShort();
  repos.Beta.commit({ 'README.md': tv('README-600.md') });
  const app = await openHome(config, repos);
  try {
    clipLines(app, 'Alpha', 31);
    clipLines(app, 'Beta', 31);
    await app.resize(360);
    const open = () => ['Alpha', 'Beta'].filter((n) => sumBubble(app, n));
    await app.tap(sumCtl(app, 'Alpha'), { pointerType: 'mouse' });
    assert.deepEqual(open(), ['Alpha'], 'a click opens it');
    sumCtl(app, 'Alpha').dispatch('pointerleave', { pointerType: 'mouse' });
    await app.advance(300);
    assert.deepEqual(open(), ['Alpha'], 'it stays when the pointer leaves');
    await app.tap(sumCtl(app, 'Beta'), { pointerType: 'mouse' });
    assert.deepEqual(open(), ['Beta'], 'a click on Beta\'s, Alpha\'s control having had focus');
    await app.tap(sumCtl(app, 'Beta'), { pointerType: 'mouse', hover: false });
    assert.deepEqual(open(), [], 'a second click closes it');
  } finally {
    app.restore();
  }
});

test('AC54 (a), on AC82\'s tiles: at 360 px the summary\'s bubble spans its tile inside the gutters, above or below the control, wrapping, never clipped (the CSS; the browser check is in the pull request)', () => {
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  assert.match(css, /\n\.v2-tile \.sb-sumbox > \.sb-bubble \{ left: -10px; right: -10px; \}/, 'the tile\'s width, its 10 px padding included (the page keeps its 16 px gutter)');
  assert.match(css, /\.sb-sumbox > \.sb-bubble\.up \{ top: auto; bottom: calc\(100% \+ 4px\); \}/, 'placed above to fit');
  assert.match(css, /\n\.v2-home \.sb-bubble \{ background: var\(--bg\); color: var\(--ink\); border: 1px solid var\(--line2\); border-radius: 12px; box-shadow: var\(--shadow\); \}/, 'on mockup v2\'s tokens');
  assert.match(css, /\n\.v2-home \.sb-bubble-t \{ font: var\(--t-body\); \}/, 'its text wraps in the body role');
  const block = /@media \(prefers-reduced-motion: no-preference\) \{\s*\.sb-bubble \{ animation/.test(css);
  assert.ok(block, 'its motion only without reduced motion');
});

// ---------------------------------------------------------------------------
// (c) Two columns on the phone

test('AC54 (c), changed by AC82 (P-001-home-tiles.md, A): one tile a row below 720 px (360 and 414 included), two from 720 px, Home\'s column at most 960 px there; H5\'s extremes with the 600-character README render without error', async () => {
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  const grids = [...css.matchAll(/\.v2-tiles \{[^}]*grid-template-columns:\s*([^;]+);/g)].map((m) => m[1]);
  assert.deepEqual(grids, ['minmax(0, 1fr)', 'repeat(2, minmax(0, 1fr))'], 'one column, then two');
  const wide = /@media \(min-width: 720px\) \{([\s\S]*?)\n\}/.exec(css)[1];
  assert.match(wide, /\.v2-tiles \{ grid-template-columns: repeat\(2/, 'the two only from 720 px');
  assert.match(wide, /html\.sb\.v2-page\.v2-home body \{ max-width: 960px; \}/, 'Home\'s column widens to at most 960 px');
  assert.doesNotMatch(css.replace(wide, ''), /\.v2-home body \{[^}]*max-width/, 'every other screen keeps its width');
  const setup = extremes();
  setup.repos.Alpha.commit({ 'README.md': tv('README-600.md') });
  const app = await openHome(setup.config, setup.repos);
  try {
    groupBtn(app, 'done').click();
    await app.flush();
    assert.equal(byClass(app.view, 'v2-tile').length, 5, 'one tile per project');
    assert.doesNotMatch(app.text(), /Can't show/);
    assert.equal(byClass(card(app, 'Alpha'), 'sb-sum')[0].textContent.length, 600);
    assert.equal(byClass(app.view, 'sb-pc').length + byClass(app.view, 'sb-grid').length, 0, 'no two-column card grid');
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

test('AC54 (d), as AC82 orders them (frame H5): "Your projects · active", "Closed or not run by the desk", then "Done"; AC8\'s order within each; the first two open and Done closed; and closed headers that still say what waits and what can\'t be read', async () => {
  const { config, repos } = groupsSetup();
  const app = await openHome(config, repos);
  try {
    await app.advance(4 * POLL_MS); // the J11 reads arrive; Broken goes stale
    const heads = byClass(app.view, 'v2-hg');
    assert.deepEqual(heads.map((b) => byClass(b, 'v2-hgt')[0].textContent), ['Your projects · active', 'Closed or not run by the desk', 'Done']);
    assert.deepEqual(heads.map((b) => b.attrs['aria-expanded']), ['true', 'true', 'false'], 'the first two open, Done closed');
    const groups = byClass(app.view, 'v2-hgroup');
    const names = (g) => byClass(g, 'v2-tnm').map((n) => n.textContent);
    assert.deepEqual(names(groups[0]), ['Zeta', 'Broken', 'Alpha', 'Rescoped'], 'AC8: flagged, then can\'t-read, then by name');
    assert.equal(byClass(heads[0], 'v2-hgn')[0].textContent, '4 projects', 'its count (drawn "4"; "projects" for assistive technology)');
    assert.match(heads[0].textContent, /6 waiting on you/);
    assert.match(heads[0].textContent, /1 can't be read/);
    assert.deepEqual(names(groups[1]), ['Dropped', 'Delta']);
    assert.equal(byClass(heads[1], 'v2-hgy')[0].textContent, '1 waiting on you', 'the group holding a waiting item says so');
    assert.equal(groups[2].children.length, 1, 'a closed group shows only its header');
    assert.match(heads[2].textContent, /\(closed\)/, 'its state in words for assistive technology, as well as its mark');
    assert.match(byClass(heads[2], 'v2-hgn')[0].textContent, /^1 project$/);
    // Closed, the Closed group's header still says what waits.
    heads[1].click();
    await app.flush();
    const closed = byClass(app.view, 'v2-hg')[1];
    assert.equal(closed.attrs['aria-expanded'], 'false');
    assert.equal(byClass(closed, 'v2-hgy')[0].textContent, '1 waiting on you', 'closed, it still says what waits');
    assert.match(byClass(app.view, 'v2-brief')[0].textContent, /^7 need you/, 'Home\'s briefing counts every group');
    // Opening and closing reorders nothing.
    heads[2].click();
    await app.flush();
    const g2 = byClass(app.view, 'v2-hgroup');
    assert.deepEqual(names(g2[2]), ['Done-one']);
    assert.deepEqual(names(g2[0]), ['Zeta', 'Broken', 'Alpha', 'Rescoped']);
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
    // From stage 2 (AC82, frame H5) the group starts open; closed by a tap, its header still says so.
    assert.equal(groupBtn(app, 'closed').attrs['aria-expanded'], 'true');
    assert.match(byClass(groupBtn(app, 'closed'), 'v2-hgb')[0].textContent, /^1 can't be read$/);
    groupBtn(app, 'closed').click();
    await app.flush();
    const h = groupBtn(app, 'closed');
    assert.equal(h.attrs['aria-expanded'], 'false');
    assert.match(byClass(h, 'v2-hgb')[0].textContent, /^1 can't be read$/);
  } finally {
    app.restore();
  }
});

test('AC54 (d): each group\'s state survives a reload through desk-home-groups-v1; failing storage gives the starting states (AC82: the first two open, Done closed) with no error', async () => {
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
  assert.deepEqual(JSON.parse(mem.get(HOME_GROUPS_KEY)), { active: false, closed: false, done: false });
  app = await openHome(config, repos, backing);
  try {
    assert.deepEqual(['active', 'closed', 'done'].map((k) => groupBtn(app, k).attrs['aria-expanded']), ['false', 'false', 'false'], 'kept through the reload');
  } finally {
    app.restore();
  }
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
  app = await openHome(config, repos, broken);
  try {
    assert.deepEqual(['active', 'closed', 'done'].map((k) => groupBtn(app, k).attrs['aria-expanded']), ['true', 'true', 'false']);
    groupBtn(app, 'done').click();
    await app.flush();
    assert.equal(groupBtn(app, 'done').attrs['aria-expanded'], 'true', 'it still opens and closes, for this window');
    assert.doesNotMatch(app.text(), /Can't show/);
  } finally {
    app.restore();
  }
});

