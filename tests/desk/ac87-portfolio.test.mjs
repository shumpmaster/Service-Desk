// ac-test: S-001/AC87 — the portfolio, read only (desk mockup v2, frame H4; stage 6a, specs/S-001.md:7070-7148,
// the stage table's row 6a at :1818): "Across your projects · read only" at Home's foot, from what the desk reads
// today. Its 6a parts only: rendered from the fixtures with no portfolio in J7, 6a's words in every row that needs
// the portfolio (and in Plan's "Ideas · from the portfolio"), the cap from J11's phases (AC50), and the model
// versions from each fixture's version file (J23's version reads, stage 3), one behind, one missing, and no
// latest; each row opening its sheet; and nothing reading or changing the portfolio. The made-up portfolio
// cases of AC87's test (ideas, the queue, Quiet, the phone note, a failed portfolio read) are 6b's, after the
// owner's Setup P1 (:7144-7148).
//
// Service-Desk's records and its version file are the real ones at 77bfeae (tests/desk/fixtures/j11-77bfeae/).
// Everything else is made up and NOT a real record (tests/desk/fixtures/README.md): "Example" and the other
// extra projects are Service-Desk's records under another name with a sprint added to a milestone line (so
// their now phase moves on), a graduation ruling, or another version file; Personal-Org-Operating-Model is in
// poom/'s placeholder form, its root VERSION a placeholder written here (that repository is private).
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSandbox, findAll, byClass } from './sandbox-helpers.mjs';
import { findKeyed } from './sandbox-fixtures.mjs';
import { textRuns } from './screen-text.mjs';
import { CONFIG } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { SD, POOM, waSetup, j77Files, poomFiles, snapOf } from './wa-fixtures.mjs';
import { j11Records, timelineOf, phaseView } from '../../src/lib/sandbox.js';
import { portfolioView, versionsView, capView, behindWords, rowText, PF_WORDS, PF_ROWS } from '../../src/lib/portfolio.js';
import { WA } from '../../src/lib/workahead.js';

const NOW = Date.parse('2026-10-18T18:00:00Z');
const VERSION_PATH = 'governance/OPERATING_MODEL_VERSION';
const DOC = j77Files()['docs/PROJECT.md'];
/** Service-Desk's section 3 with a made-up sprint on each milestone given (NOT a real record): work filed, so AC50's now run moves on. */
const filed = (ids) => ids.reduce((d, id) => d.replace(new RegExp(`(\\(${id}\\) · done when [^\\n]*? · phase: [A-Za-z]+)\\n`), '$1 · sprints: PR #900\n'), DOC);
/** A made-up v3 project (NOT real): Service-Desk's records at 77bfeae under another name, with `files` changed. */
const made = (name) => ({ ...SD, name, repo: `example/${name.toLowerCase().replace(/ /g, '-')}`, planning: false });
const files = ({ ids = [], version = '3.4.0\n', more = {} } = {}) => {
  const f = { ...j77Files(), 'docs/PROJECT.md': ids.length ? filed(ids) : DOC, ...more };
  if (version == null) delete f[VERSION_PATH];
  else f[VERSION_PATH] = version;
  return f;
};
const EX = made('Example');
/** Personal-Org-Operating-Model as J7 holds it (`publishesModel`), with a placeholder root VERSION (NOT a real record) or none. */
const PUB = { ...POOM, publishesModel: true };
const poom = (version = '3.5.0\n') => ({ ...poomFiles(), ...(version == null ? {} : { VERSION: version }) });

async function open({ projects = [SD, EX, PUB], more = { Example: repo(files({ ids: ['MD3'] })) }, poomV = '3.5.0\n', hash = '#/' } = {}) {
  const setup = waSetup({ projects, poom: poom(poomV) });
  Object.assign(setup.repos, more);
  const app = await loadSandbox({ ...setup, hash, now: NOW });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
const block = (app) => findKeyed(app, 'portfolio');
const row = (app, k) => findKeyed(app, `pf:${k}`);
const rowLine = (app, k) => byClass(row(app, k), 'v2-small')[0];
const marksIn = (el) => findAll(el, (e) => e.tag === 'svg').map((s) => s.attrs.class.split(' ').find((c) => c.startsWith('st-')));

/** An entry as the page builds it (public/sandbox.js, buildProject), from files alone. */
function entry(project, f) {
  const model = project.model === 'v3' ? 'v3' : 'v2.5';
  const snap = snapOf(f, model);
  const j = model === 'v3' ? j11Records(project, snap) : null;
  const tl = j ? timelineOf(j) : null;
  return { project, snap, pv: phaseView(project, tl, snap.tree, j), error: false };
}

// ---------------------------------------------------------------------------
// Where it sits, and its words

test('AC87 (AC82\'s foot, specs/S-001.md:6696-6700): Home\'s foot is the portfolio\'s block, then "More detail", closed, last; the block is headed "Across your projects · read only" with "portfolio" in Plex Mono at its right, and holds five rows in frame H4\'s order, then one line', async () => {
  const app = await open();
  try {
    const home = byClass(app.view, 'v2-home')[0];
    const keys = home.children.map((c) => c.dataset.k || c.className.split(' ')[0]);
    assert.deepEqual(keys.slice(-3), ['hgroups', 'portfolio', 'home-more-detail'], 'after the groups, before the fold');
    const b = block(app);
    assert.equal(b.tag, 'section');
    const head = b.children[0];
    assert.equal(head.tag, 'h2');
    assert.deepEqual(textRuns(head, () => false), ['Across your projects · read only', 'portfolio']);
    assert.ok(head.children[1].className.split(' ').includes('v2-mono'), '"portfolio" in Plex Mono (--t-mono)');
    assert.deepEqual(byClass(b, 'v2-prow').map((r) => r.dataset.k), PF_ROWS.map((k) => `pf:${k}`));
    assert.deepEqual(byClass(b, 'v2-prtt').map((t) => t.textContent),
      ['The cap on work at once', 'Decisions across projects', 'Scorecard', 'Model versions · latest 3.5.0', 'Rulings, standing intent, library facts, track records']);
    assert.ok(row(app, 'rare').className.split(' ').includes('soft'), 'the rarer records in softer text');
    assert.ok(!row(app, 'cap').className.split(' ').includes('soft'));
    assert.equal(b.children[b.children.length - 1].textContent,
      'The desk will read your portfolio repository and never change it, once you add it to the desk\'s read access (your ruling, P-001-portfolio-read).', '6a\'s line under the rows');
  } finally {
    app.restore();
  }
});

test('AC87 (6a): with no portfolio in J7, every part that needs the portfolio says plainly it isn\'t connected yet — "Decisions across projects", the rarer records, the line under the rows, and Plan\'s "Ideas · from the portfolio"; no count, no "None in the portfolio\'s queue"', async () => {
  assert.equal('portfolio' in CONFIG, false, 'src/config/projects.json names no portfolio (6a\'s state, J7)');
  const app = await open();
  try {
    assert.equal(rowLine(app, 'decisions').textContent, 'Not read yet: your portfolio isn\'t connected to the desk');
    assert.equal(rowLine(app, 'rare').textContent, 'Rarely needed · not read yet: your portfolio isn\'t connected');
    assert.doesNotMatch(block(app).textContent, /None in the portfolio|in the portfolio's queue|Ideas are in Plan|The desk reads your portfolio/, 'no 6b words before 6b');
    assert.deepEqual(marksIn(row(app, 'decisions')).filter(Boolean), [], 'no "reached" check for a queue nobody read (frame H4 draws one for 6b\'s "None")');
    await app.go('#/work');
    assert.deepEqual(textRuns(findKeyed(app, 'wa-ideas'), () => false), [WA.ideas, PF_WORDS.notRead], 'Plan\'s ideas section, the same words (AC86)');
  } finally {
    app.restore();
  }
});

test('AC87: "Scorecard" reads "Targets: no record for this in the model yet · your time across projects: not recorded yet", each part with its state\'s mark before it (the slashed circle; the dashed "?"), the marks hidden from assistive technology so the words carry the meaning', async () => {
  const app = await open();
  try {
    const line = rowLine(app, 'scorecard');
    assert.equal(line.textContent, 'Targets: no record for this in the model yet · your time across projects: not recorded yet');
    const kids = line.children;
    assert.equal(kids[0].tag, 'svg');
    assert.match(kids[0].attrs.class, /\bst-nomodel\b/, 'no record in the model: the slashed circle');
    const q = kids.findIndex((k, i) => i > 0 && k.tag === 'svg');
    assert.match(kids[q].attrs.class, /\bst-unrec\b/, 'not recorded yet: the dashed circle with "?"');
    for (const s of findAll(line, (e) => e.tag === 'svg')) assert.equal(s.attrs['aria-hidden'], 'true');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// The cap on work at once, from J11's phases (AC50)

test('AC87: "The cap on work at once" — "In Build or Launch: <each connected v3 project whose now phase is Build or Launch>" from J11\'s records, then "your cap: no record for this in the model yet" with the slashed circle; Service-Desk at 77bfeae (Design) and the v2.5 project not counted', async () => {
  const app = await open();
  try {
    assert.equal(rowLine(app, 'cap').textContent, 'In Build or Launch: Example · your cap: no record for this in the model yet');
    assert.deepEqual(marksIn(rowLine(app, 'cap')), ['st-nomodel'], 'the slashed circle, before the cap\'s part');
    assert.doesNotMatch(rowLine(app, 'cap').textContent, /research|not set yet|OM §3/, 'research sub-projects not counted (no record marks one); not the frame\'s "not set yet"');
  } finally {
    app.restore();
  }
  const none = await open({ projects: [SD, PUB], more: {} });
  try {
    assert.equal(rowLine(none, 'cap').textContent, 'In Build or Launch: none · your cap: no record for this in the model yet', '"none" when every v3 project\'s now phase is known and none is in Build or Launch');
  } finally {
    none.restore();
  }
});

test('AC87 + AC50 (made up, NOT real): Build and Launch counted, in J7\'s order; Discovery or Design, Done, and a v2.5 project not; a v3 project whose phase the desk can\'t give yet is named with why, never left out of a "none"', () => {
  const graduated = files({ more: { 'decisions/questions/P-001-graduation.md': 'Ruling: graduate (made up, NOT a real record)\n' } });
  const entries = [entry(SD, j77Files()), entry(made('In Build'), files({ ids: ['MD3'] })), entry(made('In Launch'), files({ ids: ['MD3', 'M3A', 'M3B'] })),
    entry(made('Finished'), graduated), entry(PUB, poom())];
  assert.equal(entries[3].pv.done, true, 'the graduation ruling makes it Done (AC50)');
  const v = capView(entries);
  assert.deepEqual(v.entries.map((e) => [e.name, e.phase, e.counted]), [['Service-Desk', 'Design', false], ['In Build', 'Build', true], ['In Launch', 'Launch', true],
    ['Finished', 'Done', false], ['Personal-Org-Operating-Model', null, false]]);
  assert.equal(rowText({ parts: v.parts }), 'In Build or Launch: In Build, In Launch · your cap: no record for this in the model yet');
  // Not read yet, a read that failed to draw, and a timeline with no now run.
  const unread = { project: made('Unread'), snap: null, pv: phaseView(made('Unread'), null, null, { ready: false }), error: false };
  const broken = { project: made('Broken'), snap: null, pv: null, error: true };
  const w = capView([entries[0], unread, broken]);
  assert.equal(rowText({ parts: w.parts }), 'In Build or Launch: none · Unread\'s phase: not read yet · Broken\'s phase: can\'t be read · your cap: no record for this in the model yet');
  const norun = { project: made('No run'), snap: null, pv: { tracked: true, nowRun: null, done: false }, error: false };
  assert.match(rowText({ parts: capView([norun]).parts }), /^In Build or Launch: none · No run's phase: not recorded · /);
});

test('AC87 (on the page): a project not read yet is named in the cap\'s line with "not read yet", and the line never says "none" alone over it', async () => {
  const down = repo(files({ ids: ['MD3'] }));
  down.fail = { kind: 'network' };
  const app = await open({ more: { Example: down } });
  try {
    assert.equal(rowLine(app, 'cap').textContent, 'In Build or Launch: none · Example\'s phase: not read yet · your cap: no record for this in the model yet');
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// Model versions, from each project's version file (J23's version reads, stage 3)

test('AC87 + J23: "Model versions · latest <v>" — the latest is the `publishesModel` project\'s root VERSION; each project "<project> <version>" from its governance/OPERATING_MODEL_VERSION (Service-Desk\'s real 3.5.0), one behind "3.4.0, 1 behind", and the publisher "runs the v2.5 pipeline, publishes <its VERSION>"', async () => {
  const app = await open();
  try {
    assert.equal(byClass(row(app, 'versions'), 'v2-prtt')[0].textContent, 'Model versions · latest 3.5.0');
    assert.equal(rowLine(app, 'versions').textContent, 'Service-Desk 3.5.0 · Example 3.4.0, 1 behind · Personal-Org-Operating-Model runs the v2.5 pipeline, publishes 3.5.0');
  } finally {
    app.restore();
  }
});

test('AC87 + J23: one version file missing reads "<project>: not recorded"; no latest ("latest: not recorded": no VERSION file, or no project marked `publishesModel`) compares nothing', async () => {
  const missing = await open({ more: { Example: repo(files({ ids: ['MD3'], version: null })) } });
  try {
    assert.equal(rowLine(missing, 'versions').textContent, 'Service-Desk 3.5.0 · Example: not recorded · Personal-Org-Operating-Model runs the v2.5 pipeline, publishes 3.5.0');
  } finally {
    missing.restore();
  }
  const noVersion = await open({ poomV: null });
  try {
    assert.equal(byClass(row(noVersion, 'versions'), 'v2-prtt')[0].textContent, 'Model versions · latest: not recorded');
    assert.equal(rowLine(noVersion, 'versions').textContent, 'Service-Desk 3.5.0 · Example 3.4.0 · Personal-Org-Operating-Model runs the v2.5 pipeline, publishes: not recorded', 'nothing "behind" with no latest');
  } finally {
    noVersion.restore();
  }
  const noPublisher = await open({ projects: [SD, EX, POOM] });
  try {
    assert.equal(byClass(row(noPublisher, 'versions'), 'v2-prtt')[0].textContent, 'Model versions · latest: not recorded');
    assert.equal(rowLine(noPublisher, 'versions').textContent, 'Service-Desk 3.5.0 · Example 3.4.0 · Personal-Org-Operating-Model: not recorded', 'a v2.5 project with no version file of its own');
  } finally {
    noPublisher.restore();
  }
});

test('AC87 + J23 (made up, NOT real): "<k> behind" counted in minor releases within the same major; a lower patch or major said as such; equal, higher, or a version not three whole numbers never "behind" ("<text>, not compared"); a file not read yet "not available"', () => {
  assert.equal(behindWords('3.4.0', '3.5.0'), '1 behind');
  assert.equal(behindWords('3.2.7', '3.5.0'), '3 behind', 'minor releases, whatever the patch');
  assert.equal(behindWords('3.5.0', '3.5.2'), '2 patch releases behind');
  assert.equal(behindWords('3.5.0', '3.5.1'), '1 patch release behind');
  assert.equal(behindWords('2.9.0', '3.5.0'), '1 major release behind');
  for (const [v, l] of [['3.5.0', '3.5.0'], ['3.6.0', '3.5.0'], ['4.0.0', '3.5.0'], ['v3.4', '3.5.0'], ['3.4.0', 'three']]) assert.equal(behindWords(v, l), null, `${v} against ${l}`);
  const v = versionsView([entry(SD, j77Files()), entry(made('Odd'), files({ version: 'v3.4\n' })), entry(made('Lower'), files({ version: '3.4.0  \n' })), entry(PUB, poom('3.5.0\n'))]);
  assert.equal(v.line, 'Service-Desk 3.5.0 · Odd v3.4, not compared · Lower 3.4.0, 1 behind · Personal-Org-Operating-Model runs the v2.5 pipeline, publishes 3.5.0');
  const odd = versionsView([entry(SD, j77Files()), entry(PUB, poom('3.5\n'))]);
  assert.equal(odd.title, 'Model versions · latest 3.5, not compared');
  assert.equal(odd.line, 'Service-Desk 3.5.0 · Personal-Org-Operating-Model runs the v2.5 pipeline, publishes 3.5, not compared');
  const pending = entry(SD, j77Files());
  pending.snap.records.delete(VERSION_PATH);
  assert.equal(versionsView([pending]).line, 'Service-Desk: not available', 'in the tree, not read yet (J23)');
  const v3pub = versionsView([entry({ ...SD, publishesModel: true }, { ...j77Files(), VERSION: '3.6.0\n' })]);
  assert.deepEqual([v3pub.title, v3pub.line], ['Model versions · latest 3.6.0', 'Service-Desk 3.5.0, 1 behind, publishes 3.6.0'], 'a v3 publisher: its own version is still its OPERATING_MODEL_VERSION (J23)');
});

// ---------------------------------------------------------------------------
// Each row opens its sheet

test('AC87: each row opens a sheet with its detail over Home (`#/pf/<row>`, no history step); its title is the row\'s; it closes on its 44 px close, a tap outside and Escape, the focus back on the row', async () => {
  const app = await open();
  try {
    for (const k of PF_ROWS) {
      const r = row(app, k);
      assert.equal(r.tag, 'a');
      assert.equal(r.attrs.href, `#/pf/${k}`);
      await app.tap(r);
      await app.go(`#/pf/${k}`);
      const sheet = byClass(app.view, 'v2-sheet')[0];
      assert.ok(sheet, `${k}: a sheet`);
      assert.equal(sheet.attrs.role, 'dialog');
      assert.equal(byClass(sheet, 'v2-stitle')[0].textContent, byClass(r, 'v2-prtt')[0].textContent, `${k}: titled as its row`);
      assert.ok(byClass(app.view, 'v2-home').length, `${k}: over Home`);
      assert.equal(findKeyed(app, 'sheet-close').attrs['aria-label'], 'Close');
      await app.key('Escape');
      assert.equal(byClass(app.view, 'v2-sheet').length, 0, `${k}: Escape closes it`);
      assert.equal(app.loc.hash, '#/');
      assert.equal(document.activeElement && document.activeElement.dataset.k, `pf:${k}`, `${k}: the focus back on its row`);
    }
    await app.go('#/pf/versions');
    await app.tap(findKeyed(app, 'sheet-close'));
    assert.equal(app.loc.hash, '#/', 'its close');
    await app.go('#/pf/cap');
    await app.tap(findKeyed(app, 'v2-scrim'));
    assert.equal(app.loc.hash, '#/', 'a tap outside it');
    assert.equal(byClass(app.view, 'v2-sheet').length, 0);
    await app.go('#/pf/nothing');
    assert.equal(byClass(app.view, 'v2-sheet').length, 0, 'an address for no row: Home alone');
  } finally {
    app.restore();
  }
});

test('AC87: the sheets\' detail — the cap: each connected project with its now phase and whether it is counted, the cap\'s mark and why no record holds it; the versions: each project\'s line with AC83\'s top line; decisions and the rarer records: 6a\'s words and what they wait on (Setup P1); the scorecard: each part with its mark', async () => {
  const app = await open();
  const sheetText = async (k) => {
    await app.go(`#/pf/${k}`);
    return textRuns(byClass(app.view, 'v2-sheet')[0], () => false);
  };
  try {
    assert.deepEqual(await sheetText('cap'), ['Across your projects · read only', 'The cap on work at once', 'Service-Desk', 'Now: Design · not counted', 'Example', 'Now: Build · counted',
      'Personal-Org-Operating-Model', 'Older pipeline: sprints, not phases · not counted', 'Your cap: no record for this in the model yet. The model leaves its number open.',
      'Research sub-projects are not counted: no record marks one.']);
    assert.deepEqual(await sheetText('versions'), ['Across your projects · read only', 'Model versions · latest 3.5.0', 'Service-Desk 3.5.0', 'v3 · model 3.5.0 · T1', 'Example 3.4.0, 1 behind',
      'v3 · model 3.4.0 · T1', 'Personal-Org-Operating-Model runs the v2.5 pipeline, publishes 3.5.0', 'v2.5 pipeline · model not recorded · tier not recorded · publishes model 3.5.0',
      PF_WORDS.versionsFrom]);
    for (const k of ['decisions', 'rare']) {
      const t = await sheetText(k);
      assert.ok(t.includes(PF_WORDS.waitsOnP1) && t.includes(PF_WORDS.foot), k);
      assert.ok(t.includes(rowText(portfolioView([]).rows.find((r) => r.key === k))), `${k}: 6a's words`);
    }
    const sc = await sheetText('scorecard');
    assert.deepEqual(sc.slice(2), ['Targets: no record for this in the model yet', 'Your time across projects: not recorded yet', PF_WORDS.marks]);
    assert.deepEqual(marksIn(byClass(app.view, 'v2-sheet')[0]).filter(Boolean), ['st-nomodel', 'st-unrec'], 'each part\'s mark (the close\'s icon aside)');
  } finally {
    app.restore();
  }
  const none = await open({ projects: [SD, EX, POOM] });
  try {
    await none.go('#/pf/versions');
    assert.ok(textRuns(byClass(none.view, 'v2-sheet')[0], () => false).includes(PF_WORDS.noPublisher), 'no project marked `publishesModel`: said so');
  } finally {
    none.restore();
  }
});

// ---------------------------------------------------------------------------
// Read only, and no new reads

test('AC87 (read only; A3): stage 6a reads nothing new — every call the page makes is for a connected project, none names the portfolio, and the block holds no link to GitHub and no control that writes', async () => {
  const app = await open();
  try {
    for (const k of PF_ROWS) await app.go(`#/pf/${k}`);
    await app.go('#/');
    const projects = new Set(app.server.calls.map((c) => c.project));
    assert.deepEqual([...projects].sort(), ['Example', 'Personal-Org-Operating-Model', 'Service-Desk']);
    assert.ok(app.server.calls.every((c) => !/portfolio/i.test(JSON.stringify(c.body))), 'no portfolio read (6b, J23)');
    const links = findAll(block(app), (e) => e.tag === 'a').map((a) => a.attrs.href);
    assert.deepEqual(links, PF_ROWS.map((k) => `#/pf/${k}`), 'only the rows\' own sheets');
    assert.equal(findAll(block(app), (e) => ['button', 'input', 'textarea', 'form'].includes(e.tag)).length, 0);
  } finally {
    app.restore();
  }
});
