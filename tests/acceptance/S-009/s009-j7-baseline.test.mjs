// join-test: S-009/J7
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

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  ROOT, ADAPTER, RECORD, NOTE, BASE_COMMIT, loadRecord, loadBaselineCases, validateOutput, sha256File,
  runAdapterRaw, run, twinOf, logTargetOf, deskProjection, openProjection, isDecisionId, isCantReadLine,
  withCards, openCase, normHashes, HASH_KEY_FORM, adapterTestImports,
} from './s009-lib.mjs';

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
        // rule (b)
        assert.ok(r.notices.length > 0, `${c.case}: rule (b), no-failure result sends no notice`);
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
      assert.ok(res(c).result.notices.some((n) => n.length > 0), `${c.case}: sender case sends no notice`);
    }
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
      assert.deepEqual(built.notices, rec.byCase.get(c.case).result.notices, `${c.case}: notices differ from the baseline run`);
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
