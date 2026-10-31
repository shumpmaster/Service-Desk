// ac-test: S-001/AC27 — the operating notes, whole (stage LA1 of "The desk live at the needs-you address: M3C, through
// the Launch gate"; AC27 as changed for LA1): docs/handover/desk-operations.md holds one heading per job AC27 lists, by
// its words; each job's heading gives its minutes, under 10, except the launch's, whose every step gives its own, each
// under 10; the first paragraph says every job is written, and no longer that the rest "are written with M3's launch
// work"; in the launch section, the step that disables `needs-you-page` comes before the step that approves the
// `production` job, and the archive step after the step that checks needs-you serves the desk (AC28's order, step 3);
// the rollback section names "Rollback to this deployment". And the handover package, docs/handover/service-desk.md,
// holds docs/handover/_TEMPLATE.md's seven headings in order, each with a line beyond its instruction, opening with a
// plain paragraph. The test reads headings and order, not prose (the plan's reading, "LA1's test reads headings and
// order").
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const NOTES = read('docs/handover/desk-operations.md');
const PACKAGE = read('docs/handover/service-desk.md');
const TEMPLATE = read('docs/handover/_TEMPLATE.md');

/** The `## ` sections of a Markdown file, in order: { title, body } (the body up to the next `## ` or `# `). */
function sections(md) {
  const out = [];
  let cur = null;
  for (const line of md.split('\n')) {
    const h = /^## (.+)$/.exec(line);
    if (h) {
      cur = { title: h[1].trim(), lines: [] };
      out.push(cur);
    } else if (/^# /.test(line)) {
      cur = null;
    } else if (cur) {
      cur.lines.push(line);
    }
  }
  return out.map((s) => ({ title: s.title, body: s.lines.join('\n') }));
}

// "(about <n> minutes…)" or "(<n> minute…)": the first figure in a parenthesis that gives minutes.
const MINUTES = /\((?:about )?(\d+) minutes?\b[^)]*\)/;
const minutesOf = (text) => {
  const m = MINUTES.exec(text);
  return m ? Number(m[1]) : null;
};

// AC27's jobs, by its words, in its order.
const JOBS = [
  ['renewing the read token', /^Renewing the read token\b/],
  ['checking the Access applications', /^Checking the Access applications\b/],
  ['adding a project (AC26)', /^Adding a project\b/],
  ['switching a project from v2.5 to v3', /^Switching a project from v2\.5 to v3\b/],
  ['rolling back', /^Rolling back\b/],
  ['questions answered from the desk', /^Questions answered from the desk\b/],
  ['checking the deploy gate', /^Checking the deploy gate\b/],
  ['approving a deploy', /^Approving a deploy\b/],
  ['launching, once', /^Launching, once\b/],
];

const NOTE_SECTIONS = sections(NOTES);
const jobSection = (re) => NOTE_SECTIONS.filter((s) => re.test(s.title));

test('AC27: one heading per job AC27 lists, by its words, in its order', () => {
  const at = [];
  for (const [job, re] of JOBS) {
    const found = jobSection(re);
    assert.equal(found.length, 1, `exactly one "## " heading for ${job}; found ${found.map((s) => s.title).join(' | ') || 'none'}`);
    at.push(NOTE_SECTIONS.indexOf(found[0]));
  }
  assert.deepEqual([...at].sort((a, b) => a - b), at, 'the jobs in AC27\'s order');
});

test('AC27: each job\'s heading gives its minutes, under 10, the launch\'s excepted', () => {
  for (const [job, re] of JOBS.filter(([j]) => j !== 'launching, once')) {
    const [s] = jobSection(re);
    const n = minutesOf(s.title);
    assert.notEqual(n, null, `${job}: its heading gives "(about <n> minutes)" or "(<n> minute…)": ${s.title}`);
    assert.ok(n < 10, `${job}: ${n} minutes, under 10`);
  }
  // The rollback's parts each give their own minutes too, each under 10.
  const [rollback] = jobSection(/^Rolling back\b/);
  const parts = rollback.body.split('\n').filter((l) => /^### /.test(l));
  assert.ok(parts.length >= 3, 'the old page back, an earlier desk back, and the address and the phone\'s subscription back');
  for (const p of parts) {
    const n = minutesOf(p);
    assert.ok(n !== null && n < 10, `rollback part with its minutes, under 10: ${p}`);
  }
});

// The launch's steps: list items opening with a bold step id (O8 (a) to (d), O9, L0 to L11 with L2a, L2b, L9a, L9b).
const STEP = /^\s*(?:\d+\.|-)\s+\*\*((?:O\d+(?: \([a-d]\))?)|(?:L\d+[ab]?))(?!\w)/;
function launchSteps() {
  const [s] = jobSection(/^Launching, once\b/);
  const steps = [];
  let cur = null;
  for (const line of s.body.split('\n')) {
    const m = STEP.exec(line);
    if (m) {
      cur = { id: m[1], first: line, text: line };
      steps.push(cur);
    } else if (/^#{3,} /.test(line)) {
      cur = null;
    } else if (cur && line.trim() !== '') {
      cur.text += `\n${line}`;
    } else if (cur && line.trim() === '') {
      cur.text += '\n';
    }
  }
  return steps;
}

test('AC27: the launch, once: the owner\'s steps O8 and L0 to L11, in order, each giving its minutes, each under 10', () => {
  const steps = launchSteps();
  const ids = steps.map((s) => s.id);
  const want = ['O8 (a)', 'O8 (b)', 'O8 (c)', 'O8 (d)', 'L0', 'L1', 'L2a', 'L2b', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9a',
    'L9b', 'L10', 'L11'];
  const inOrder = ids.filter((id) => want.includes(id));
  assert.deepEqual(inOrder, want, 'every step, once each, in the plan\'s order');
  for (const s of steps) {
    const n = minutesOf(s.first);
    assert.notEqual(n, null, `${s.id} gives its minutes on its first line: ${s.first.trim()}`);
    assert.ok(n < 10, `${s.id}: ${n} minutes, under 10`);
  }
});

test('AC27 with AC28\'s order: needs-you-page disabled before the production job is approved; archived after needs-you is checked', () => {
  const steps = launchSteps();
  const find = (what, pred) => {
    const i = steps.findIndex((s) => pred(s.text));
    assert.ok(i >= 0, `a launch step that ${what}`);
    assert.equal(steps.filter((s) => pred(s.text)).length, 1, `one launch step that ${what}`);
    return i;
  };
  const disable = find('disables `needs-you-page`', (t) => /`needs-you-page`/.test(t) && /Disable workflow/.test(t));
  const approve = find('approves the `production` job', (t) => /Approve its `production` job/.test(t));
  const serves = find('checks needs-you serves the desk', (t) => /needs-you serves the desk/.test(t));
  const archive = find('archives Operations-Hub', (t) => /Archive this repository/.test(t));
  assert.ok(disable < approve, 'the old page\'s deploys are stopped first (AC28, step 1 before step 2)');
  assert.ok(approve < serves, 'the production job before the check');
  assert.ok(serves < archive, 'the archive last, after needs-you is checked (AC28, step 3)');
});

test('AC27: the first paragraph says every job is written, and no longer that the rest "are written with M3\'s launch work"', () => {
  const [first] = NOTE_SECTIONS;
  assert.equal(first.title, 'What this means for you');
  const para = first.body.trim().split(/\n\s*\n/)[0].replace(/\s+/g, ' ');
  assert.doesNotMatch(NOTES, /are written with M3's launch work/);
  assert.match(para, /Every job the desk needs is written here/);
});

test('AC27: the rollback section names "Rollback to this deployment"', () => {
  const [rollback] = jobSection(/^Rolling back\b/);
  assert.match(rollback.body, /"Rollback to this deployment"/);
});

test('Launch-2 to Launch-4: the handover package holds the template\'s seven headings in order, each with a line beyond its instruction', () => {
  const want = sections(TEMPLATE).map((s) => s.title);
  assert.equal(want.length, 7, 'the template\'s seven sections');
  const got = sections(PACKAGE);
  assert.deepEqual(got.map((s) => s.title), want);
  const instruction = (l) => /^\*[^*].*\*$/.test(l.trim());
  for (const s of got) {
    const lines = s.body.split('\n').filter((l) => l.trim() !== '' && !instruction(l));
    assert.ok(lines.length > 0, `${s.title}: a line beyond its instruction`);
  }
  assert.match(PACKAGE, /^# Handover package — Service-Desk$/m);
});

test('Launch-2 and Launch-4: the package opens with a plain paragraph, names the operating team, and its monitoring section names a record for each part', () => {
  const got = sections(PACKAGE);
  const first = got[0].body.trim().split(/\n\s*\n/)[0].replace(/\s+/g, ' ');
  const words = first.split(' ').length;
  assert.ok(words >= 15 && words <= 150, `the plain paragraph is 15 to 150 words: ${words}`);
  assert.doesNotMatch(first, /`|\b[\w-]+\/[\w./-]+\.\w+\b|\b(?:AC|CS|EXP-|S-|P-|L-)\d/, 'no file paths, code or ids');
  // The operating team (Launch-2), as its own block in "How to run it": one bullet per member, by its words.
  const run = got.find((s) => s.title === 'How to run it').body;
  const team = /\*\*The operating team:\*\*\n((?:- .*\n(?: {2}.*\n)*)+)/.exec(`${run}\n`);
  assert.ok(team, 'How to run it holds "**The operating team:**" and its list');
  const members = team[1].split('\n').filter((l) => /^- /.test(l)).map((l) => (/^- \*\*([^*]+):\*\*/.exec(l) || [])[1]);
  assert.deepEqual(members, ['the owner', 'Service-Desk\'s Chief of Staff', 'the Builder', 'the Reviewer and the Design reviewer',
    'the Orchestrator'], 'the operating team as the plan names it');
  const monitoring = got.find((s) => s.title === 'Its own monitoring and feedback').body;
  const rows = monitoring.split('\n').filter((l) => /^\| /.test(l) && !/^\| ?-/.test(l)).slice(1);
  assert.ok(rows.length >= 6, 'each part in its row');
  for (const r of rows) {
    const cells = r.split('|').slice(1, -1).map((c) => c.trim());
    assert.equal(cells.length, 4, r);
    assert.ok(cells.every((c) => c.length > 0), `each part names what it does, where it runs, and its record: ${cells[0]}`);
  }
});

// From LA1's review, round 1 (B1): each job's heading equals its steps' minutes added up, honestly, so a heading can't
// understate its job. A job's numbered steps (top-level, each giving its minutes on its first line) are added up; a job
// of alternatives (bold bullets, each giving its minutes) takes its longest; a job done in parts (sub-headings, each
// with its own minutes) is checked part by part, and its heading gives its longest part. Every total is under 10.
const STEP_LINE = /^\d+\.\s+\*\*/;
const ALT_LINE = /^- \*\*[^*]*\((?:about )?\d+ minutes?\b/;

/** The direct sub-sections of a section's body at heading level `level` (2 for `###` inside a `##`). */
function parts(body, level) {
  const mark = `${'#'.repeat(level + 1)} `;
  const out = [];
  let cur = null;
  for (const line of body.split('\n')) {
    if (line.startsWith(mark)) {
      cur = { title: line.slice(mark.length).trim(), lines: [] };
      out.push(cur);
    } else if (cur) {
      cur.lines.push(line);
    }
  }
  return out.map((p) => ({ title: p.title, body: p.lines.join('\n') }));
}

/** Checks one job against its steps; returns its heading's minutes. `capped`: its total is under 10 (every job but the
 * launch, a one-time job whose every step is under 10 instead). */
function checkJob(title, body, level, path = title, capped = true) {
  const n = minutesOf(title);
  assert.notEqual(n, null, `${path}: its heading gives its minutes`);
  if (capped) assert.ok(n < 10, `${path}: ${n} minutes, under 10`);
  const ps = parts(body, level);
  if (ps.length > 0) {
    const each = ps.map((p) => checkJob(p.title, p.body, level + 1, `${path} › ${p.title}`, capped));
    assert.equal(n, Math.max(...each), `${path}: done in parts, its heading gives its longest part (${each.join(', ')})`);
    return n;
  }
  const lines = body.split('\n');
  const steps = lines.filter((l) => STEP_LINE.test(l));
  if (steps.length > 0) {
    const mins = steps.map((l) => {
      const m = minutesOf(l);
      assert.notEqual(m, null, `${path}: a step gives its minutes on its first line: ${l.trim()}`);
      return m;
    });
    const sum = mins.reduce((a, b) => a + b, 0);
    assert.equal(n, sum, `${path}: the heading's ${n} minutes equal its steps' ${mins.join(' + ')} = ${sum}`);
    return n;
  }
  const alts = lines.filter((l) => ALT_LINE.test(l)).map((l) => minutesOf(l));
  assert.ok(alts.length > 0, `${path}: no counted steps`);
  assert.equal(n, Math.max(...alts), `${path}: a job of alternatives is headed with its longest (${alts.join(', ')})`);
  return n;
}

test('AC27 (LA1 review B1): each job\'s heading equals its steps\' minutes added up, part by part, each under 10', () => {
  for (const [job, re] of JOBS.filter(([j]) => j !== 'launching, once')) {
    const [s] = jobSection(re);
    checkJob(s.title, s.body, 2, job);
  }
  // The launch: each of its parts that gives minutes adds up (the step before the sitting, the sitting, after).
  const [launch] = jobSection(/^Launching, once\b/);
  const counted = parts(launch.body, 2).filter((p) => minutesOf(p.title) !== null);
  assert.deepEqual(counted.map((p) => p.title.replace(/ \(.*$/, '')), ['Before the sitting, any day', 'The sitting', 'After the sitting']);
  for (const p of counted) checkJob(p.title, p.body, 3, `launching › ${p.title}`, false);
  assert.equal(minutesOf(launch.title), minutesOf(counted[1].title), 'the launch\'s heading gives the sitting\'s minutes');
});

test('AC27 (LA1 review B1): the notifications\' and the usage token\'s jobs add up too', () => {
  const want = ['Turning notifications on again', 'Updating the subscription', 'Sending a test', 'The switch',
    'If the notification keys may have leaked', 'The usage token'];
  const jobs = [];
  for (const area of ['Notifications', 'GitHub Actions use on the desk']) {
    const [s] = NOTE_SECTIONS.filter((x) => x.title === area);
    assert.ok(s, area);
    for (const p of parts(s.body, 2)) {
      if (minutesOf(p.title) === null) continue;
      jobs.push(p.title);
      checkJob(p.title, p.body, 3, p.title);
    }
  }
  assert.deepEqual(jobs.map((t) => want.find((w) => t.startsWith(w))), want, `every one of them counted: ${jobs.join(' | ')}`);
});
