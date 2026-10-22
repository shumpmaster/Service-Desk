// J11 and the timeline the sandbox draws (spec S-001, MD): the model's timeline ported to the page,
// checked against what `v3_checks.py trace` printed for Service-Desk at 3117150 (the fixture), and
// J11's awkward cases. AC50 (phases, the now run, milestones), as trial-view notes 2 changed it:
// each phase's word from its latest run. AC51's Timeline screen is AC59 and AC60's now
// (tests/desk/ac59-60-timeline.test.mjs); its link rule stays (tests/desk/ac51-timeline-line.test.mjs).
// join-test: S-001/J11
// ac-test: S-001/AC50
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline } from '../../src/lib/timeline.js';
import { parseSurfaces, parseOrchWorkflow, nextCronRun, parseRequest, isGroundwork, milestoneLines, parseProjectDoc,
  parseSpecDoc, j11Kind, purposeItems } from '../../src/lib/j11.js';
import { j11Records, timelineOf, phaseView, nowRun, standardWord, whereLine, teamView, ballLines } from '../../src/lib/sandbox.js';
import { neededReads, parseRecord } from '../../src/lib/model.js';
import { j11Snapshot, j11Files, traceNotes, treePaths, SD3, loadSandbox, linksIn } from './sandbox-helpers.mjs';
import { findAll } from './sandbox-helpers.mjs';
import { repo } from './fake-desk.mjs';
import { readFileSync } from 'node:fs';
import { SRC } from './helpers.mjs';

const pageSource = () => readFileSync(`${SRC}/public/sandbox.js`, 'utf8');

const fixtureTimeline = (extra) => {
  const snap = j11Snapshot(extra);
  const j = j11Records(SD3, snap);
  return { snap, j, tl: timelineOf(j) };
};

test('J11: the page\'s timeline prints exactly the NOTE lines `v3_checks.py trace` printed for Service-Desk at 3117150', () => {
  const { j, tl } = fixtureTimeline();
  assert.equal(j.ready, true, `every J11 record is in: missing ${j.missing.join(', ')}`);
  assert.deepEqual(tl.lines(), traceNotes());
});

test('J11: runs Discovery i1, Design i1, Build i1, Design i2, Build i2 and Launch i1; MD1, MD2 and MD3 in Design i2', () => {
  const { tl } = fixtureTimeline();
  assert.deepEqual(tl.runs().map((r) => r.label()), ['Discovery i1', 'Design i1', 'Build i1', 'Design i2', 'Build i2', 'Launch i1']);
  const d2 = tl.runs().find((r) => r.label() === 'Design i2');
  assert.deepEqual(d2.project.map((m) => m.id), ['MD1', 'MD2', 'MD3']);
});

test('J11: its reads are J6 blob reads, all optional, and only with the sandbox\'s flag; none is a new kind of call', () => {
  const snap = j11Snapshot();
  const now = new Date('2026-10-14T12:00:00Z');
  const plain = neededReads(SD3, snap.tree, snap.records, now, {});
  const sb = neededReads(SD3, snap.tree, snap.records, now, { j11: true });
  assert.deepEqual(sb.blobs, plain.blobs, 'the needed reads are unchanged: J11 never makes a project "Can\'t read"');
  assert.deepEqual(sb.history, plain.history);
  const added = sb.optional.blobs.map((b) => b.path).filter((p) => !plain.optional.blobs.some((x) => x.path === p));
  for (const p of ['docs/PROJECT.md', 'governance/SURFACES.md', '.github/workflows/orchestrator.yml', 'status/merges.jsonl', 'specs/S-001.md',
    'intake/requests/Q-010.toml']) assert.ok(added.includes(p), `${p} is an optional read`);
  assert.ok(plain.optional.blobs.every((b) => !j11Kind(b.path)), 'without ?sandbox nothing of J11 is read');
});

test('J11 (trial-view notes 2): reviews/<n>/*.md verdict files are optional reads with the sandbox\'s flag; files starting with `_` and README.md are not; each boundary decision\'s record is read', () => {
  const extra = { 'reviews/44/_plan-review-round1-verbatim.md': 'Verdict: FAIL\n', 'reviews/44/README.md': 'Verdict: FAIL\n', 'reviews/S-001-trial-view-2/x.md': 'Verdict: PASS\n',
    'reviews/44/notes/deeper.md': 'Verdict: PASS\n' };
  const snap = j11Snapshot(extra);
  const now = new Date('2026-10-16T12:00:00Z');
  const plain = neededReads(SD3, snap.tree, snap.records, now, {});
  const sb = neededReads(SD3, snap.tree, snap.records, now, { j11: true });
  const paths = sb.optional.blobs.map((b) => b.path);
  const reviews = treePaths().filter((x) => /^reviews\/\d+\/[^/_][^/]*\.md$/.test(x) && !/README\.md$/.test(x));
  assert.ok(reviews.length >= 30, `${reviews.length} verdict files at 3117150`);
  for (const r of reviews) assert.ok(paths.includes(r), r);
  for (const r of Object.keys(extra)) assert.ok(!paths.includes(r), `${r} is not read`);
  assert.ok(!plain.optional.blobs.some((b) => b.path.startsWith('reviews/')), 'only with the sandbox\'s flag');
  // The verdict, as governance/checks/review_check.py's parse_verdict decides it (build review round 1, N3):
  // 'other' wherever parse_verdict says malformed, null with no `Verdict:` at all.
  const v = (text) => parseRecord('review-verdict', text, 'reviews/1/x.md').verdict;
  assert.equal(v('# Review\n\nVerdict: PASS\n'), 'PASS');
  assert.equal(v('Verdict: FAIL\nVerdict: PASS\n'), 'FAIL');
  assert.equal(v('Verdict: FAIL — two blockers\nVerdict: PASS\n'), 'other', 'the first decides, and it is not exactly PASS or FAIL');
  assert.equal(v('  Verdict: PASS\n'), 'other', 'not at the start of a line: malformed');
  // The five cases of build review round 1 (N3), each as parse_verdict reads it.
  assert.equal(v('Verdict:PASS\n'), 'other', 'no space after the colon');
  assert.equal(v('Verdict:  PASS\n'), 'other', 'two spaces after the colon');
  assert.equal(v('Verdict: PASS\nThe return said Verdict: FAIL mid-line\n'), 'other', 'a later line quoting Verdict: mid-line');
  assert.equal(v('  Verdict: FAIL\nVerdict: PASS\n'), 'other', 'an indented Verdict: line first');
  assert.equal(v('\ufeffVerdict: FAIL\nVerdict: PASS\n'), 'FAIL', 'one leading BOM dropped: a real FAIL stays FAIL');
  assert.equal(v('\ufeff\ufeffVerdict: PASS\n'), 'other', 'only one BOM is dropped');
  assert.equal(v('Verdict: PASS \t\r\n'), 'PASS', 'trailing spaces, a tab and one CR allowed');
  assert.equal(v('Verdict: PASS\r\r\n'), 'other', 'only one CR dropped');
  assert.equal(v('Verdict: PASS with notes\n'), 'other');
  assert.equal(v('Verdict: maybe\n'), 'other');
  assert.equal(v('No verdict here.\n'), null);
});

test('J11 (trial-view notes 2): the Intent\'s Purpose items (AC59\'s cards) and a research request\'s first sentence', () => {
  const doc = parseProjectDoc(j11Files()['docs/PROJECT.md']);
  assert.equal(doc.purpose.items.length, 2);
  assert.match(doc.purpose.items[0], /^"I envisioned the service desk/);
  assert.equal(purposeItems('# P\n\n## Intent\n\n### Purpose\n\n- One **bold** item\n- Two `code` item\n- Three\n').items.join(' | '), 'One bold item | Two code item');
  assert.equal(purposeItems('# P\n\n## Other\n').found, 'no-intent');
  const rq = parseRequest('id = "Q-099"\nquestion = "Is this one? And that one."\n', 'intake/requests/Q-099.toml');
  assert.equal(rq.sentence, 'Is this one?');
  assert.equal(parseRequest('id = "Q-098"\nquestion = "No end mark at all"\n', 'intake/requests/Q-098.toml').sentence, 'No end mark at all');
});

test('J11: the Orchestrator\'s schedule — only */<n> * * * * is understood; anything else, or no file, gives "due time not available"', () => {
  const now = new Date('2026-10-14T12:07:30Z');
  assert.equal(parseOrchWorkflow(j11Files()['.github/workflows/orchestrator.yml']).cron, '*/30 * * * *');
  assert.equal(nextCronRun('*/30 * * * *', now).toISOString(), '2026-10-14T12:30:00.000Z');
  assert.equal(nextCronRun('*/15 * * * *', new Date('2026-10-14T12:45:00Z')).toISOString(), '2026-10-14T13:00:00.000Z');
  for (const odd of ['0 * * * *', '*/30 2 * * *', '@hourly', '', null]) assert.equal(nextCronRun(odd, now), null, String(odd));
  assert.deepEqual(parseOrchWorkflow('on:\n  push:\n'), { cron: null });
  // AC49's words for each form, through the ball line of a project with a ready item.
  const model = { items: [{ id: 'P-001', state: 'ready' }], flagged: [] };
  const q = { waiting: 0, rows: [] };
  const words = (cron) => ballLines(SD3, model, { checkPages: [] }, { workflow: { cron } }, q, now, 'UTC').map((b) => b.text);
  assert.deepEqual(words('*/30 * * * *'), ['Next Orchestrator run, due 12:30 by its schedule']);
  assert.deepEqual(words('5 4 * * *'), ['Next Orchestrator run, due time not available']);
  assert.deepEqual(ballLines(SD3, model, { checkPages: [] }, { workflow: null }, q, now, 'UTC').map((b) => b.text), ['Next Orchestrator run, due time not available']);
});

test('J11: the roster block, and a malformed one (the members the dispatch log names, and a note)', () => {
  const ok = parseSurfaces(j11Files()['governance/SURFACES.md']);
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.members.map((m) => m.id), ['definer', 'check-author', 'builder', 'source-checker', 'chief-of-staff', 'input-reader',
    'researcher', 'critic', 'reviewer', 'user-rep']);
  const bad = parseSurfaces('# x\n```roster\n# id class status authority\nbuilder builder installed\n```\n');
  assert.equal(bad.ok, false);
  assert.match(bad.note, /not "<id> <class> <status> <authority>"/);
  assert.equal(parseSurfaces('no block here').ok, false);
  const { snap, j } = fixtureTimeline();
  const tv = teamView(SD3, { items: [] }, snap, { ...j, surfaces: bad }, { waiting: 0, rows: [] }, [], new Date('2026-10-14T12:00:00Z'), 'UTC');
  assert.match(tv.note, /the members are those the dispatch log names/);
  const ids = tv.members.map((m) => m.id);
  assert.ok(ids.includes('researcher') && ids.includes('critic') && ids.includes('definer'), 'the roles the log names');
  assert.equal(ids.filter((x) => x === 'chief-of-staff').length, 1, 'the Chief of Staff gets one tile');
});

test('J11 awkward cases: a milestone line out of form is skipped with a note, the rest still show; a spec with no milestones: header ties no merge', () => {
  const doc = j11Files()['docs/PROJECT.md'].replace('- The desk\'s value targets shown (M3B) · done when', '- The desk\'s value targets shown (M3B) · finished when');
  const ms = milestoneLines(doc);
  assert.ok(!ms.milestones.some((m) => m.id === 'M3B'));
  assert.equal(ms.problems.length, 1);
  assert.equal(ms.milestones.length, 8);
  const spec = j11Files()['specs/S-001.md'].replace(/^milestones: .*$/m, '');
  assert.equal(parseSpecDoc(spec, 'specs/S-001.md').milestones.state, 'missing');
  const { tl } = fixtureTimeline({ 'specs/S-001.md': spec });
  assert.ok(tl.lines().join('\n').includes('untagged'), 'a merge whose spec names no milestone is untagged');
});

test('J11 awkward case: no dispatch-log line for any project item — no runs, every standard milestone "not recorded", phases "not recorded"', () => {
  const files = j11Files();
  const tl = buildTimeline({ project: parseProjectDoc(files['docs/PROJECT.md']), logRows: [], statuses: {}, merges: [], specs: {} });
  assert.ok(tl.lines().filter((l) => /^ {2}[A-Z][a-z]+-\d /.test(l)).every((l) => l.endsWith(': not recorded')));
  const pv = phaseView(SD3, tl, new Map(), { ready: true });
  // The milestones alone: none has work filed (no item runs, so no sprints), so the now run is the first.
  assert.equal(pv.tracked, true);
  const empty = buildTimeline({ project: null, logRows: [] });
  const pv2 = phaseView(SD3, empty, new Map(), { ready: true });
  assert.deepEqual(pv2.phases.map((p) => p.word), ['not recorded', 'not recorded', 'not recorded', 'not recorded']);
});

test('J11: research questions are read from intake/requests (the groundwork prefix); a missing record keeps the view "not available"', () => {
  assert.equal(parseRequest('kind = "research"\nquestion = """\nGroundwork map: what is it?\n"""\n').question, 'Groundwork map: what is it?');
  assert.equal(isGroundwork(parseRequest('question = "Groundwork map: x"')), true);
  assert.equal(isGroundwork(parseRequest(j11Files()['intake/requests/Q-010.toml'])), false);
  const snap = j11Snapshot();
  snap.records.delete('docs/PROJECT.md');
  const j = j11Records(SD3, snap);
  assert.equal(j.ready, false);
  assert.equal(timelineOf(j), null);
  const pv = phaseView(SD3, null, snap.tree, j);
  assert.equal(pv.tracked, false);
  assert.match(whereLine(SD3, null, null, pv).sentence, /not available/);
});

// ---------------------------------------------------------------------------
// AC50

test('AC50 (trial-view notes 2, note 1): Service-Desk at 3117150 — Discovery Finished, Design Now · run 2, Build Run 2 still to come (not Finished), Launch Not started, not Done', () => {
  const { snap, j, tl } = fixtureTimeline();
  const pv = phaseView(SD3, tl, snap.tree, j);
  assert.deepEqual(pv.phases.map((p) => [p.phase, p.word]), [['Discovery', 'Finished'], ['Design', 'Now · run 2'], ['Build', 'Run 2 still to come'], ['Launch', 'Not started']]);
  assert.notEqual(pv.phases[2].word, 'Finished', 'Build no longer reads "Finished": the work is back in Design');
  assert.equal(nowRun(tl).label(), 'Design i2', 'the expected now run: MD2 is its first milestone with no sprint');
  assert.equal(pv.phases[1].iteration, 2);
  assert.equal(pv.done, false);
});

test('AC50 (note 1): the words\' rule order and <k>, the run (the column), never the iteration — a made-up project of three runs (NOT a real record)', () => {
  // The model's timeline lines for runs Discovery i1, Design i1, Build i1, Design i2, Build i2, Launch i1, Build i3 and Launch i2, with Build i3 now.
  const mk = (phase, iteration, own = []) => ({ phase, iteration, project: own, sprints: Object.fromEntries(own.map((m) => [m.id, m.filed ? ['PR #1'] : []])), standard: [], label() { return `${phase} i${iteration}`; } });
  const runs = [mk('Discovery', 1), mk('Design', 1), mk('Build', 1, [{ id: 'M1', filed: true }]), mk('Design', 2), mk('Build', 2, [{ id: 'M2', filed: true }]),
    mk('Launch', 1), mk('Build', 3, [{ id: 'M3', filed: false }]), mk('Launch', 2)];
  const tl = { runs: () => runs, first: null, graduated: false, byItem: new Map() };
  const pv = phaseView(SD3, tl, new Map(), { ready: true });
  assert.deepEqual(pv.phases.map((p) => [p.phase, p.word]), [['Discovery', 'Finished'], ['Design', 'Finished'], ['Build', 'Now · run 3'], ['Launch', 'Run 3 still to come']]);
});

test('AC50: each standard milestone\'s state word is the model\'s, run by run, as the fixture\'s lines give it', () => {
  const { snap, j, tl } = fixtureTimeline();
  const expected = new Map();
  let run = null;
  for (const l of traceNotes()) {
    if (/^[A-Z][a-z]+ i\d+/.test(l)) run = l.split(' (')[0];
    const m = /^ {2}([A-Za-z]+-\d) "[^"]+": (.+)$/.exec(l);
    if (m) expected.set(`${run}/${m[1]}`, standardWord(m[2]));
  }
  const pv = phaseView(SD3, tl, snap.tree, j);
  let checked = 0;
  for (const r of tl.runs()) {
    for (const s of r.standard) {
      assert.equal(standardWord(s.state), expected.get(`${r.label()}/${s.id}`), `${r.label()} ${s.id}`);
      checked++;
    }
  }
  assert.equal(checked, 35);
  void pv;
});

test('AC50: a project is Done when its graduation ruling is on the default branch; "Done", never "Graduated", in the words', () => {
  const { snap, j, tl } = fixtureTimeline({ 'decisions/questions/P-001-graduation.md': 'Ruling: proceed — it goes live\n' });
  const pv = phaseView(SD3, tl, snap.tree, j);
  assert.equal(pv.done, true);
  assert.ok(!JSON.stringify(pv.phases.map((p) => p.word)).includes('Graduated'));
  assert.equal(standardWord('reached (carried over from Design i1)'), 'carried over');
});

test('AC50: a v2.5 project shows "Phases not tracked", never a guess', () => {
  const pv = phaseView({ ...SD3, model: 'v2.5' }, null, new Map(), null);
  assert.equal(pv.tracked, false);
  assert.equal(pv.why, 'Phases not tracked');
});

test('AC50 + AC41: no element is sized by a fraction of phases', () => {
  const page = pageSource();
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  // From stage 1a (AC80): a held card follows the finger while it is dragged, by a transform on that
  // card alone, cleared when it lands; a move, never a size. Nothing else sets an inline style.
  assert.equal((page.match(/\.style\./g) || []).length, (page.match(/drag\.el\.style\.transform = /g) || []).length, 'the only inline style is the dragged card\'s transform');
  assert.doesNotMatch(page, /\.style\.(?!transform = )/, 'the sandbox sets no inline sizes');
  assert.doesNotMatch(css.replace(/width: 100%/g, ''), /width:\s*calc\(|width:\s*\d+(\.\d+)?%/, 'no width by fraction (only full width)');
});

/** Every word, attribute and markdown the page drew under `node`. */
function drawn(node) {
  let out = node.textContent || '';
  const walk = (n) => {
    for (const c of n.children || []) {
      if (c.attrs) out += ` ${Object.values(c.attrs).join(' ')} ${c.innerHTML || ''}`;
      walk(c);
    }
  };
  walk(node);
  return out;
}

async function crawl(app, onRoute) {
  const seen = new Set();
  const queue = ['#/'];
  while (queue.length && seen.size < 500) {
    const h = queue.shift();
    if (seen.has(h)) continue;
    seen.add(h);
    await app.go(h);
    onRoute(h);
    for (const l of linksIn(app.view)) if (l.href && l.href.startsWith('#/') && !seen.has(l.href)) queue.push(l.href);
  }
  return seen;
}

const CONFIG1 = { ownerLogin: 'shumpmaster', ownerTimeZone: 'America/Chicago', v5Clock: { days: ['Mon'], from: '07:00', to: '22:00' }, linkCap: 6000,
  projects: [SD3] };

test('AC50 (review B2): "Graduated" is never a label or a milestone name on any route of the 3117150 fixture; Launch-5 reads "Done"', async () => {
  // The fixture's record files hold no "Graduated" (only the model's table does), so on these
  // records any "Graduated" drawn would be a desk label or a milestone name.
  const files = j11Files();
  assert.ok(Object.values(files).every((t) => !t.includes('Graduated')));
  const app = await loadSandbox({ config: CONFIG1, repos: { 'Service-Desk': repo(files) }, now: Date.parse('2026-10-14T15:00:00Z') });
  try {
    await app.advance(1000);
    const seen = await crawl(app, (h) => {
      assert.doesNotMatch(drawn(app.view), /Graduated/, `${h} draws "Graduated"`);
    });
    assert.ok(seen.size > 30, `${seen.size} routes`);
    assert.ok(seen.has('#/p/Service-Desk/timeline'));
    // From stage 3 the Status screen's open Launch box gives way to the page's Launch line, folded (AC83, specs/S-001.md:6780-6801;
    // AC57 changed by AC83); opened, its standard milestones read id first, then name (frame 6).
    await app.go('#/p/Service-Desk');
    await app.tap(findAll(app.view, (e) => e.tag === 'button' && e.attrs['aria-label'] === 'Launch')[0]);
    assert.doesNotMatch(drawn(app.view), /Graduated/, 'the opened Launch line draws no "Graduated"');
    assert.match(app.view.textContent, /Launch-5\s*Done/, 'Launch-5 is drawn as "Done"');
  } finally {
    app.restore();
  }
});

test('AC50: a record\'s own text holding "Graduated" is drawn exactly as written; the milestone label still reads "Done"', async () => {
  const files = { ...j11Files(),
    'questions/P-001-graduation-wording.md': '# Ruling needed: keep the word Graduated in the model\'s records?\n\nWHY: The model writes Graduated.\nOPTIONS:\n  A. Keep Graduated.\n  B. Change it.\nRECOMMENDATION: A\nRISK CLASS: R0\nREVERSIBILITY: reversible\nBLAST RADIUS: none\nDEFAULT: A\nTIMEOUT: 24\n' };
  const app = await loadSandbox({ config: CONFIG1, repos: { 'Service-Desk': repo(files) }, now: Date.parse('2026-10-14T15:00:00Z') });
  try {
    await app.advance(1000);
    await app.go('#/p/Service-Desk/queue');
    assert.ok(app.view.textContent.includes("keep the word Graduated in the model's records?"), 'the queue row quotes the record');
    await app.go('#/p/Service-Desk/queue/q%3AP-001-graduation-wording');
    assert.ok(app.view.textContent.includes('The model writes Graduated.'), 'the sheet quotes WHY unchanged');
    assert.ok(drawn(app.view).includes('Keep Graduated.'), 'and its options unchanged');
    await app.go('#/p/Service-Desk');
    await app.tap(findAll(app.view, (e) => e.tag === 'button' && e.attrs['aria-label'] === 'Launch')[0]);
    assert.match(app.view.textContent, /Launch-5\s*Done/, 'the page\'s Launch line, opened, names Launch-5 "Done" (AC83, in the Status screen\'s place)');
    await app.go('#/p/Service-Desk/timeline');
    assert.doesNotMatch(app.view.textContent, /Graduated/, 'no label on the timeline reads "Graduated"');
  } finally {
    app.restore();
  }
});
