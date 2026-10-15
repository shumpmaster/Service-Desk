// J11 and the timeline the sandbox draws (spec S-001, MD): the model's timeline ported to the page,
// checked against what `v3_checks.py trace` printed for Service-Desk at 3117150 (the fixture), and
// J11's awkward cases. AC50 (phases, the now run, milestones) and AC51 (the Timeline screen).
// join-test: S-001/J11
// ac-test: S-001/AC50 ac-test: S-001/AC51
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline } from '../../src/lib/timeline.js';
import { parseSurfaces, parseOrchWorkflow, nextCronRun, parseRequest, isGroundwork, milestoneLines, parseProjectDoc,
  parseSpecDoc, j11Kind } from '../../src/lib/j11.js';
import { j11Records, timelineOf, phaseView, finishedWords, phaseMilestones, nowRun, timelineView, standardWord, whereLine,
  teamView, ballLines } from '../../src/lib/sandbox.js';
import { neededReads } from '../../src/lib/model.js';
import { j11Snapshot, j11Files, traceNotes, treePaths, SD3, loadSandbox, linksIn } from './sandbox-helpers.mjs';
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
  assert.equal(finishedWords(pv2), 'Phases not tracked');
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

test('AC50: Service-Desk at 3117150 — Discovery Finished, Design now (Design i2), Build Finished, Launch Not started, not Done', () => {
  const { snap, j, tl } = fixtureTimeline();
  const pv = phaseView(SD3, tl, snap.tree, j);
  assert.deepEqual(pv.phases.map((p) => [p.phase, p.word]), [['Discovery', 'Finished'], ['Design', 'now'], ['Build', 'Finished'], ['Launch', 'Not started']]);
  assert.equal(nowRun(tl).label(), 'Design i2', 'the expected now run: MD2 is its first milestone with no sprint');
  assert.equal(pv.phases[1].iteration, 2);
  assert.equal(pv.done, false);
  assert.equal(finishedWords(pv), '2 of 4 phases finished', 'the count is in words');
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
  // The Status screen's tap: the now phase's run and its milestones, in the words AC50 allows.
  const design = phaseMilestones(SD3, snap.tree, tl, pv.phases[1]);
  assert.equal(design.runLabel, 'Design i2');
  assert.deepEqual(design.own.map((o) => [o.id, o.word]), [['MD1', 'work filed'], ['MD2', 'no work filed yet'], ['MD3', 'no work filed yet']]);
  const build = phaseMilestones(SD3, snap.tree, tl, pv.phases[2]);
  assert.deepEqual(build.own.map((o) => [o.id, o.word]), [['M1', 'work filed'], ['M2', 'work filed'], ['M2B', 'work filed'], ['M3A', 'no work filed yet'], ['M3B', 'no work filed yet']]);
  for (const o of [...design.own, ...build.own]) assert.notEqual(o.word, 'reached', 'a project milestone never reads "reached"');
  assert.deepEqual(build.own[0].sprints.map((s) => s.link), ['https://github.com/shumpmaster/Service-Desk/pull/40', 'https://github.com/shumpmaster/Service-Desk/pull/41']);
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
  assert.equal(finishedWords(pv), 'Phases not tracked');
});

// ---------------------------------------------------------------------------
// AC51

test('AC51: the runs, their labels, a switch between Design i1 and i2, and the strip of four phases then Done', () => {
  const { snap, j, tl } = fixtureTimeline();
  const pv = phaseView(SD3, tl, snap.tree, j);
  const tv = timelineView(SD3, snap.tree, tl, pv, j, null, 'America/Chicago');
  assert.equal(tv.ok, true);
  assert.equal(tv.run.label, 'Design i2', 'opens on the now run');
  assert.deepEqual(tv.switcher.map((s) => s.label), ['Design i1', 'Design i2']);
  assert.deepEqual(tv.strip.map((s) => [s.phase, s.iters]), [['Discovery', 'i1'], ['Design', 'i1 i2'], ['Build', 'i1 i2'], ['Launch', 'i1'], ['Done', '']]);
  assert.equal(tv.strip[4].dashed, true, 'Done stays dashed until the Launch gate is passed');
  assert.match(tv.key, /^Milestones · reached · under way · not started · not recorded$/);
  // The standard milestones' states and the sprints, against the fixture's lines.
  const d1 = timelineView(SD3, snap.tree, tl, pv, j, 'Design-i1', 'UTC');
  assert.deepEqual(d1.run.standard.map((s) => s.word), ['reached', 'not recorded', 'not recorded', 'not recorded', 'not recorded', 'not reached']);
  const b1 = timelineView(SD3, snap.tree, tl, pv, j, 'Build-i1', 'UTC');
  const m1 = b1.run.parts.find((x) => x.code === 'M1');
  // Trial-view notes 12 and 13: a run's steps sit under their milestone, then each sprint, newest first.
  assert.deepEqual(m1.sprints.map((s) => s.id), ['PR #41', 'PR #40']);
  assert.deepEqual(m1.steps.filter((s) => !s.day).map((s) => s.text), ['Pull request #41', 'Pull request #40']);
  const md1 = tv.run.parts.find((x) => x.code === 'MD1');
  assert.ok(md1.detail.includes('Pieces of work: Q-013'));
});

test('AC51: newest at the top; every link is a path the tree holds, a pull request or a merge commit; a step with no file says so', () => {
  const { snap, j, tl } = fixtureTimeline();
  const pv = phaseView(SD3, tl, snap.tree, j);
  const paths = new Set(treePaths());
  let steps = 0;
  let noFile = 0;
  for (const r of tl.runs()) {
    const tv = timelineView(SD3, snap.tree, tl, pv, j, `${r.phase}-i${r.iteration}`, 'UTC');
    for (const part of tv.run.parts) {
      // Newest first within each sprint (trial-view notes 12 and 13 group a run's steps by milestone and sprint).
      for (const sp of part.sprints) {
        const real = sp.steps.filter((s) => !s.day && Number.isFinite(s.pos) && s.pos >= 0);
        for (let i = 1; i < real.length; i++) assert.ok(real[i - 1].pos > real[i].pos, 'newest first');
      }
      for (const s of part.steps) {
        if (s.day) continue;
        steps++;
        if (s.link == null) {
          noFile++;
          continue;
        }
        const m = /^https:\/\/github\.com\/shumpmaster\/Service-Desk\/(?:blob\/main\/(.+)|pull\/\d+|commit\/[0-9a-f]{40})$/.exec(s.link);
        assert.ok(m, s.link);
        if (m[1]) assert.ok(paths.has(decodeURIComponent(m[1])), `${m[1]} is in the tree`);
      }
    }
  }
  assert.ok(steps > 50, `${steps} steps`);
  assert.ok(noFile > 0, 'some steps hold no file');
  // The page draws a step without a link as "no file recorded".
  const src = pageSource();
  assert.ok(src.includes("st.link ? ext(st.link, 'From the record') : 'no file recorded'"));
});

test('AC51: no clock times and no durations on the line, only order (with a marker where the day changes)', () => {
  const { snap, j, tl } = fixtureTimeline();
  const pv = phaseView(SD3, tl, snap.tree, j);
  const tv = timelineView(SD3, snap.tree, tl, pv, j, 'Design-i1', 'UTC');
  const words = tv.run.parts.flatMap((p) => p.steps.map((s) => s.day || `${s.text} ${s.note || ''}`)).join('\n');
  assert.doesNotMatch(words, /\b\d{1,2}:\d{2}\b/, 'no clock times');
  assert.doesNotMatch(words, /\b\d+ (?:min|h|s|d)\b/, 'no durations');
  assert.ok(tv.run.parts.some((p) => p.steps.some((s) => s.day)), 'a day marker');
  assert.match(tv.run.sentence, /^\d+ returns? failed/, 'bad news first');
});

test('AC50 + AC41: no element is sized by a fraction of phases', () => {
  const page = pageSource();
  const css = readFileSync(`${SRC}/public/sandbox.css`, 'utf8');
  assert.doesNotMatch(page, /\.style\./, 'the sandbox sets no inline sizes');
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
    let launch5 = false;
    const seen = await crawl(app, (h) => {
      assert.doesNotMatch(drawn(app.view), /Graduated/, `${h} draws "Graduated"`);
      if (/Done\s*Launch-5/.test(app.view.textContent)) launch5 = true;
    });
    assert.ok(seen.size > 30, `${seen.size} routes`);
    assert.ok(seen.has('#/p/Service-Desk/timeline/Launch-i1'));
    assert.ok(launch5, 'Launch-5 is drawn as "Done"');
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
    await app.go('#/p/Service-Desk/timeline/Launch-i1');
    assert.match(app.view.textContent, /Done\s*Launch-5/);
    assert.doesNotMatch(app.view.textContent, /Graduated/, 'no label on the timeline reads "Graduated"');
  } finally {
    app.restore();
  }
});
