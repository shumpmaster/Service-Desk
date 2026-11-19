// join-test: S-009/J7
// join-test: S-014/J7
// S-009 line 23's locked check (spec line 173): the baseline record, its note, its hashes and
// coverage, the poison run, then the adapter run on the built code and compared with the record.
// Covers: AC9 (gate cards, questions, pull-request cards as today, with each read failing),
//         AC12 (the adapter, unchanged since the record, runs on the built code with no new setting),
//         AC14 (the sender's two cases equal the baseline run),
//         AC15 (a held or not-shown decision card's notice and link open what the base commit opens),
//         AC16 and AC17 (gate cards, questions and pull-request cards on a failed read equal the
//         baseline run with the same failure, or with the log failing for a notes failure).
// It reads the record and note in place (reviews/S-009/baseline/), and no branch history.
// Until the record exists the first step fails with "baseline record not there yet"; that is right.
// Rewritten under specs/S-014.md (it supersedes S-009; line numbers are S-014's) and
// decisions/questions/P-003-S-009-adapter-stop.md (:19): `notices` in J7's notice form (lines 154-155),
// compared as lines 164 and 166 say, with line 169's coverage rules on that form; base commit, line 23.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  ROOT, ADAPTER, RECORD, NOTE, BASE_COMMIT, loadRecord, loadBaselineCases, validateOutput, sha256File,
  runAdapterRaw, run, twinOf, logTargetOf, deskProjection, openProjection, isDecisionId, isCantReadLine,
  withCards, openCase, normHashes, HASH_KEY_FORM, adapterTestImports, readNotice, senderInfos,
} from './s009-lib.mjs';

const noticeText = (ns) => ns.map((n) => ({ words: n.words, opens: n.opens }));

const cases = loadBaselineCases();
const all = cases.map((c) => c.data);
const ok = { record: false, hashes: false, coverage: false, poison: false };
let rec;

const gate = (t, ...need) => {
  const missing = need.filter((k) => !ok[k]);
  if (missing.length) { t.skip(`not run: an earlier step of the locked check did not pass (${missing.join(', ')})`); return false; }
  return true;
};

test('S-009 line 23 locked check', { concurrency: false }, async (t) => {
  await t.test('the record and its note are there, and the note holds the record\'s SHA-256', () => {
    rec = loadRecord(); // throws "baseline record not there yet" until the session commits it
    const m = /^sha256: ([0-9a-f]{64})\s*$/m.exec(rec.noteText);
    assert.ok(m, `${NOTE} has no line "sha256: <64 hex digits>"`);
    assert.equal(m[1], rec.sha256, `${RECORD}'s SHA-256 differs from its note`);
    assert.equal(rec.raw.base_commit, BASE_COMMIT, 'record names a base commit other than line 23\'s');
    assert.equal(typeof rec.raw.node, 'string', 'record has no node version');
    assert.ok(rec.raw.hashes && typeof rec.raw.hashes === 'object', 'record has no hashes');
    ok.record = true;
  });

  await t.test('every hashed file matches the record, including the adapter and every case file', (st) => {
    if (!gate(st, 'record')) return;
    const h = normHashes(rec.raw.hashes);
    const form = `(hash keys are read as ${HASH_KEY_FORM})`;
    assert.ok(ADAPTER in h, `record does not hash the adapter ${ADAPTER} ${form}`);
    for (const c of cases) assert.ok(c.file in h, `record does not hash case file ${c.file} ${form}`);
    for (const f of adapterTestImports()) assert.ok(f in h, `record does not hash ${f}, a file under tests/ the adapter imports ${form}`);
    for (const [p, want] of Object.entries(h)) {
      const abs = path.join(ROOT, p);
      assert.ok(fs.existsSync(abs), `hashed file ${p} is missing`);
      assert.equal(sha256File(abs), want, `hash of ${p} differs from the record`);
    }
    ok.hashes = true;
  });

  await t.test('the record covers every case and stands for today (J7 line 169)', (st) => {
    if (!gate(st, 'record', 'hashes')) return;
    const res = (c) => rec.byCase.get(c.case);
    for (const c of all) {
      const r = res(c);
      assert.ok(r, `record has no result for case ${c.case}`);
      assert.deepEqual(validateOutput(c, r), [], `record's result for ${c.case} is not in J7's output form`);
    }
    for (const c of all.filter((c) => c.kind === 'desk')) {
      const r = res(c).result;
      const ids = new Set(r.cards.map((e) => e.id));
      const want = [...Object.keys(c.records.queue), ...c.records.questions.map((q) => `question:${q}`), ...c.records.pulls.map((p) => `pr:${p.number}`)];
      for (const id of want) assert.ok(ids.has(id), `${c.case}: record has no cards entry for ${id}`);
      if (c.fail.length === 0) {
        for (const e of r.cards.filter((e) => !isDecisionId(e.id))) assert.ok(e.on_list, `${c.case}: ${e.id} is not on_list in a no-failure result`);
        // rule (b): one summary opening Home whose count is at least the number of its open cards
        const open = Object.keys(c.records.queue).length + c.records.questions.length + c.records.pulls.length;
        assert.equal(r.notices.length, 1, `${c.case}: rule (b), a no-failure result's notices are not one summary: ${JSON.stringify(r.notices)}`);
        const s0 = readNotice(r.notices[0], { firstRun: true });
        assert.equal(s0.kind, 'summary', `${c.case}: rule (b), its notice is not a summary opening Home: ${JSON.stringify(r.notices[0])}`);
        assert.ok(s0.count >= open, `${c.case}: rule (b), the summary counts ${s0.count}, fewer than its ${open} open cards`);
        assert.ok(!r.lines.some(isCantReadLine), `${c.case}: rule (b), no-failure result has a can't-read line`);
        // the gate case's mark
        for (const [dor, word] of Object.entries(c.records.cases)) {
          if (/^[A-Z]+-\d+-dor-\d+$/.test(dor) && c.records.notes[dor]) {
            assert.equal(r.cards.find((e) => e.id === dor).marked, word, `${c.case}: ${dor}'s mark is not its gate case's word`);
          }
        }
      }
      const twin = twinOf(c, all);
      if (c.fail.includes('notes')) {
        assert.deepEqual(r, res(twin).result, `${c.case}: the base commit's notes-failing result differs from its no-failure result, so the base reads notes`);
      }
      if (c.fail.includes('queue') || c.fail.includes('log')) {
        // rule (a)
        const tl = res(twin).result.lines;
        assert.ok(r.lines.some((l) => !tl.includes(l)), `${c.case}: rule (a), no line its no-failure twin lacks`);
        assert.deepEqual(r.notices, [], `${c.case}: rule (a), notices not empty on a failed read`);
      }
    }
    for (const c of all.filter((c) => c.kind === 'sender')) {
      // the `sender` rule: the first run sends exactly one notice, a summary opening Home whose count
      // is at least the number of items on that run's list
      const first = res(c).result.notices[0];
      assert.equal(first.length, 1, `${c.case}: the first run does not send exactly one notice: ${JSON.stringify(first)}`);
      const s0 = readNotice(first[0], { firstRun: true });
      assert.equal(s0.kind, 'summary', `${c.case}: the first run's notice is not a summary opening Home: ${JSON.stringify(first[0])}`);
      assert.ok(s0.count >= c.runs[0].length, `${c.case}: the first run's summary counts ${s0.count}, fewer than the ${c.runs[0].length} items on its list`);
    }
    // the rules on every notice in the record (line 169, read as line 155 says)
    for (const c of all.filter((c) => c.kind === 'desk' || c.kind === 'sender')) {
      const r = res(c).result;
      const desks = new Set();
      const infos = c.kind === 'desk' ? [r.notices.map((n) => readNotice(n, { firstRun: true }))] : senderInfos(r);
      const raw = c.kind === 'desk' ? [r.notices] : r.notices;
      infos.forEach((run, i) => run.forEach((n, j) => {
        assert.ok(n.kind !== 'other', `${c.case}: a notice opens neither the desk's Home address nor /?open=<project>|<kind>|<id>: ${JSON.stringify(raw[i][j])}`);
        desks.add(n.desk);
        if (n.kind === 'summary' || n.kind === 'group') assert.ok(n.hasDigits, `${c.case}: a ${n.kind}'s words hold no whole number in digits: ${JSON.stringify(raw[i][j])}`);
      }));
      // "the desk's address, as the adapter gives it to the sender" (line 155) is one address within a
      // case: every notice in one case's result opens from the same one (Critic round 1, N1: held per
      // case, since no line says the adapter gives one address to every case)
      assert.ok(desks.size <= 1, `${c.case}: its notices open from more than one desk address: ${JSON.stringify([...desks])}`);
      if (c.kind === 'desk') {
        assert.ok(r.notices.length === 0 || (r.notices.length === 1 && infos[0][0].kind === 'summary'), `${c.case}: a desk result's notices are neither empty nor one summary: ${JSON.stringify(r.notices)}`);
      }
    }
    assert.ok(all.filter((c) => c.kind === 'sender').some((c) => senderInfos(res(c).result).some((run, i) => i > 0 && run.some((n) => n.kind === 'item'))),
      'no sender case has an item notice on a run after its first, so the record shows no card named and no state handed back between runs');
    for (const c of all.filter((c) => c.kind === 'open' && c.open.via === 'notice' && c.fail.includes('log'))) {
      const a = res(c).result, b = res(twinOf(c, all)).result;
      assert.ok(a.shows !== b.shows || a.lands !== b.lands, `${c.case}: rule (c), same shows and lands as its no-failure twin`);
    }
    ok.coverage = true;
  });

  await t.test('poison run: with every file under src/ replaced, the adapter fails on every case', (st) => {
    if (!gate(st, 'record', 'hashes', 'coverage')) return;
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 's009-poison-'));
    const copy = path.join(tmp, 'tree');
    fs.cpSync(ROOT, copy, { recursive: true, verbatimSymlinks: true, filter: (src) => path.relative(ROOT, src).split(path.sep)[0] !== '.git' });
    const srcDir = path.join(copy, 'src');
    assert.ok(fs.existsSync(srcDir), 'the working tree has no src/');
    const poison = (dir) => {
      for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        const st = fs.lstatSync(p);
        if (st.isSymbolicLink()) { fs.unlinkSync(p); fs.writeFileSync(p, "throw new Error('baseline-poison')\n"); }
        else if (st.isDirectory()) poison(p);
        else fs.writeFileSync(p, "throw new Error('baseline-poison')\n");
      }
    };
    poison(srcDir);
    for (const c of cases) {
      const r = runAdapterRaw(c.data, { root: copy, caseFile: path.join(copy, c.file) });
      assert.ok(!r.wroteResult, `${c.data.case}: the adapter wrote a result with src/ poisoned, so it does not need src/`);
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    ok.poison = true;
  });

  const ready = (st) => gate(st, 'record', 'hashes', 'coverage', 'poison');

  // line 164: non-decision cards field by field, Home's count and the summary's count each less the
  // result's decision cards on the list, `lines` without the AC16/AC17 lines, and `notices` with their
  // words' count written <n> (deskProjection in s009-lib.mjs); line 165 for a notes-failing case.
  await t.test('AC9, AC12, AC16, AC17: desk cases on the built code equal the record (non-decision cards)', async (st) => {
    if (!ready(st)) return;
    for (const c of all.filter((c) => c.kind === 'desk')) {
      const target = c.fail.includes('notes') ? logTargetOf(c, all) : c;
      assert.ok(target, `${c.case}: no record case with the same records and log failing in the same form`);
      const built = run(c, { caseFile: path.join(ROOT, cases.find((x) => x.data === c).file) });
      assert.deepEqual(deskProjection(built), deskProjection(rec.byCase.get(target.case).result),
        `${c.case}: built result for cards that are not decision cards differs from the record's ${target.case}`);
    }
  });

  await t.test('AC14: sender cases on the built code equal the record', (st) => {
    if (!ready(st)) return;
    for (const c of all.filter((c) => c.kind === 'sender')) {
      const built = run(c, { caseFile: path.join(ROOT, cases.find((x) => x.data === c).file) });
      // line 166: run by run, the same notices in the same order, each with the same words and opens, as text
      assert.deepEqual(built.notices.map(noticeText), rec.byCase.get(c.case).result.notices.map(noticeText), `${c.case}: notices differ from the baseline run`);
    }
  });

  await t.test('AC15: an id not in queue/ opens on the built code as at the base commit', (st) => {
    if (!ready(st)) return;
    for (const c of all.filter((c) => c.kind === 'open')) {
      const built = run(c, { caseFile: path.join(ROOT, cases.find((x) => x.data === c).file) });
      assert.deepEqual(openProjection(built), openProjection(rec.byCase.get(c.case).result), `${c.case}: differs from the record`);
    }
  });

  await t.test('AC15 (J7 line 167): a held, or not-shown, decision card opens as the record\'s card not on the list', (st) => {
    if (!ready(st)) return;
    for (const via of ['notice', 'link']) {
      const base = all.find((c) => c.kind === 'open' && c.open.via === via && c.fail.length === 0);
      const baseLog = all.find((c) => c.kind === 'open' && c.open.via === via && JSON.stringify(c.fail) === '["log"]');
      const id = base.open.id;
      // the same id, now in queue/ with no notes, raised an hour before the moment: held (AC1)
      const records = withCards(base.records, [{ id, raised: new Date(Date.parse(base.moment) - 3600e3).toISOString() }]);
      const held = run(openCase(`S009-X-ac15-held-${via}`, base.moment, records, { id, via }));
      assert.deepEqual(openProjection(held), openProjection(rec.byCase.get(base.case).result), `held ${id} via ${via} differs from the record's ${base.case}`);
      assert.equal(held.buttons, false, `held ${id} via ${via} offers answer buttons`);
      // the same, with the log failing in the path form: not shown (AC17)
      const off = run(openCase(`S009-X-ac15-log-${via}`, base.moment, records, { id, via }, { fail: ['log'] }));
      assert.deepEqual(openProjection(off), openProjection(rec.byCase.get(baseLog.case).result), `not-shown ${id} via ${via} differs from the record's ${baseLog.case}`);
      assert.equal(off.buttons, false, `not-shown ${id} via ${via} offers answer buttons`);
    }
  });
});
