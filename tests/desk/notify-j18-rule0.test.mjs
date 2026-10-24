// join-test: S-001/J18 — a sender's memory between runs, rule 0's part (stage 1b of "The desk as
// mockup v2", J16's rule 0): each verdict read, by the keyed hash of its blob sha, with its word; each
// chosen head's owner-check ETag and last answer, by the keyed hash of its key and head; sealed as the
// JWT is, kept across runs, a verdict dropped when no open file list holds its blob, a head's entry
// dropped when the head moves or the pull request closes, and its entries counted toward the 5,000.
// Every record here is made up (NOT real records).

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanScratch, harness, makeWorld, checkoutOf, pull, clearView } from './notify-helpers.mjs';
import { scenario, verdict, senderSide, headOf, STATE_KEY } from './rule0-fixture.mjs';
import { openPart, openRule0, sealRule0, verifyState, stateFiles, emptyState, formProblem, stateProblem, verdictHash, headHash, rule0Problem, LIMITS } from '../../src/notify/state.mjs';

after(cleanScratch);

const SD = 'Service-Desk';
const AFTER = { state: 'pending', description: 'Owner: after agents · 2 other finding(s)' };
const src = (n) => ({ filename: `src/lib/m${n}.js`, status: 'modified' });
const PASS = 'Verdict: PASS\n';

test('J18 rule 0 (made-up, NOT real): its part is kept across runs, sealed: no sha, number, path or description in clear, and nothing readable without the state key', async () => {
  const sc = scenario({});
  const v = verdict(sc, 800, 'reviewer', PASS);
  const w = makeWorld();
  w.pulls = [pull(800, { sha: headOf(800), private: false })];
  w.files[800] = [src(800), v];
  w.gitBlobs = { ...sc.blobs };
  w.statuses[headOf(800)] = AFTER;
  const h = harness({ checkout: checkoutOf({ base: { ...sc.tree } }), world: w });
  const r1 = await h.run();
  const text = readFileSync(join(r1.outDir, 'state.json'), 'utf8');
  const s1 = h.state(r1);
  assert.equal(typeof s1.rule0, 'string', 'sealed');
  // Every needle is looked for in the clear fields. The sealed parts (base64url of random bytes) and
  // the keyed hashes (random hex) are left out of that, as '800' turns up in them by chance (about one
  // run in 100); each sealed part is checked as what it is instead, and a needle no chance can match
  // there (a character outside base64url, or 16 characters or more) is looked for in the whole file too.
  const view = clearView(JSON.parse(text));
  const clears = [v.sha, headOf(800), '800', 'reviews/', 'after agents', 'PASS', 'pending', 'W/"'];
  for (const clear of clears) assert.ok(!view.text.includes(clear), `${clear} not in clear`);
  assert.deepEqual(view.sealed.map(([label]) => label), ['jwt', 'rule0']);
  for (const [label, part] of view.sealed) {
    assert.match(part, /^[\w-]+$/, label);
    assert.equal(openPart('w'.repeat(64), label, part), null, `${label}: a wrong key opens nothing`);
    const clear = openPart(h.stateKey, label, part);
    assert.notEqual(clear, null, label);
    assert.ok(!Buffer.from(part, 'base64url').includes(JSON.stringify(clear)), `${label}: not merely encoded`);
  }
  assert.ok(view.hashes.length > 0 && view.hashes.every((x) => /^[0-9a-f]{32}$/.test(x)), view.hashes.join());
  for (const clear of clears.filter((c) => /[^\w-]/.test(c) || c.length >= 16)) assert.ok(!text.includes(clear), `${clear} not in the file`);
  const p1 = openRule0(h.stateKey, s1.rule0);
  assert.equal(p1.v[verdictHash(h.stateKey, v.sha)], 'PASS');
  const e = p1.h[headHash(h.stateKey, SD, 800, headOf(800))];
  assert.deepEqual([e.state, e.after], ['pending', true]);
  assert.equal(openRule0('w'.repeat(64), s1.rule0), null, 'a wrong key opens nothing');
  // Hashing the made-up sha and head with a wrong key finds none of the entries.
  assert.equal(p1.v[verdictHash('w'.repeat(64), v.sha)], undefined);
  // Kept across runs: the next run reads no blob, and asks the owner check with the kept ETag.
  const r2 = await h.run();
  assert.equal(w.blobReads, 1);
  assert.equal(w.status304, 1);
  assert.deepEqual(openRule0(h.stateKey, h.state(r2).rule0), p1);
  // A project not read keeps its last part as it was.
  w.fail['/repos/shumpmaster/Service-Desk/pulls/800/files'] = 502;
  const r3 = await h.run();
  assert.ok(r3.logs.some((l) => /not read/.test(l)));
  assert.equal(h.state(r3).rule0, h.state(r2).rule0);
});

test('J18 rule 0 (made-up, NOT real): a verdict is dropped when no open file list holds its blob; a head\'s entry when the head moves or the pull request closes', async () => {
  const sc = scenario({});
  const v1 = verdict(sc, 810, 'reviewer', 'Verdict: PASS\n\nmade-up 810\n');
  const v2 = verdict(sc, 811, 'reviewer', 'Verdict: PASS\n\nmade-up 811\n');
  sc.pulls.push({ n: 810, files: [src(810), v1] }, { n: 811, files: [src(811), v2] });
  sc.statuses[headOf(810)] = AFTER;
  sc.statuses[headOf(811)] = AFTER;
  const a = await senderSide(sc);
  const part = a.c.rule0.part;
  assert.deepEqual(Object.keys(part.v).sort(), [verdictHash(STATE_KEY, v1.sha), verdictHash(STATE_KEY, v2.sha)].sort());
  assert.deepEqual(Object.keys(part.h).sort(), [headHash(STATE_KEY, SD, 810, headOf(810)), headHash(STATE_KEY, SD, 811, headOf(811))].sort());
  // #811 closes; #810 moves to a new head whose list holds another verdict file (a new blob), not the old one.
  const v3 = verdict(sc, 810, 'reviewer', 'Verdict: PASS\n\nmade-up 810, again\n');
  sc.pulls = [{ n: 810, sha: headOf(810, 1), files: [src(810), v3] }];
  sc.statuses[headOf(810, 1)] = AFTER;
  const b = await senderSide(sc, { last: part });
  assert.deepEqual(Object.keys(b.c.rule0.part.v), [verdictHash(STATE_KEY, v3.sha)], 'no open file list holds either old blob');
  assert.deepEqual(Object.keys(b.c.rule0.part.h), [headHash(STATE_KEY, SD, 810, headOf(810, 1))], 'only the new head\'s');
});

test('J18 rule 0 (made-up, NOT real): its entries count toward the 5,000 with the keys, the job candidates and the recorded questions; a state over it, or a part not in form, is not used', () => {
  const key = 'q'.repeat(64);
  const hex = (i, p) => `${p}${i.toString(16).padStart(31, '0')}`;
  // (So many entries are over the JSON's 256 KB; the count is checked as verifyState checks it, with the key.)
  const s = emptyState('2026-10-18T12:00:00.000Z');
  for (let i = 0; i < 2000; i++) s.keys[hex(i, 'a')] = { sent: s.at };
  for (let i = 0; i < 1000; i++) s.cand[hex(i, 'b')] = { seen: s.at, retried: null };
  for (let i = 0; i < 1000; i++) s.recorded[hex(i, 'c')] = s.at;
  const part = { v: {}, h: {} };
  for (let i = 0; i < 500; i++) part.v[hex(i, 'd')] = 'PASS';
  for (let i = 0; i < 500; i++) part.h[hex(i, 'e')] = { etag: 'W/"abc"', state: 'pending', after: true };
  s.rule0 = sealRule0(key, part);
  assert.equal(stateProblem(key, s), null, '5,000 in all: used');
  part.v[hex(500, 'd')] = 'FAIL';
  s.rule0 = sealRule0(key, part);
  assert.equal(stateProblem(key, s), 'too many keys', '5,001 with rule 0\'s: not used');
  assert.equal(formProblem(s), null, 'without the key the sealed part cannot be counted: only verifyState, with it, counts it');
  assert.equal(LIMITS.keys, 5000);
  // verifyState counts it too: a small state whose part is in form is used.
  const small = emptyState(s.at);
  small.rule0 = sealRule0(key, { v: { [hex(1, 'd')]: 'PASS' }, h: {} });
  const f = stateFiles(key, small);
  assert.equal(verifyState(key, f.json, f.sig.toString()).ok, true);
  // A part not in form, or sealed under another key, though the state's signature is good: not used.
  // Each key in form (Reviewer round 1, N1), so each case reaches the check it is about: the word, the
  // ETag, the state, `after`, the entry's fields, and the part's own two fields.
  const good = { etag: 'W/"abc"', state: 'pending', after: true };
  assert.equal(rule0Problem({ v: { [hex(1, 'd')]: 'PASS' }, h: { [hex(1, 'e')]: good } }), null, 'the same keys, in form: no problem');
  for (const [bad, why] of [[{ v: { [hex(1, 'd')]: 'maybe' }, h: {} }, 'a verdict'], [{ v: {}, h: { [hex(1, 'e')]: { ...good, etag: '"a"\r\nX: y' } } }, 'a head'],
    [{ v: {}, h: { [hex(1, 'e')]: { ...good, state: 'weird' } } }, 'a head'], [{ v: {}, h: { [hex(1, 'e')]: { ...good, after: 'yes' } } }, 'a head'],
    [{ v: {}, h: { [hex(1, 'e')]: { ...good, description: 'Owner: after agents' } } }, 'a head'], [{ v: {}, h: {}, extra: 1 }, 'its parts'],
    [{ v: { [hex(1)]: 'PASS' }, h: {} }, 'a verdict'],
    // After MD3, stage 8 ((b) item 37; stage 1b's review, round 2, R2-N1): a head key out of form, its entry in form.
    [{ v: {}, h: { [hex(1)]: good } }, 'a head']]) {
    assert.equal(rule0Problem(bad), why, JSON.stringify(bad));
    const t = emptyState('2026-10-18T12:00:00.000Z');
    t.rule0 = sealRule0(key, bad);
    const g = stateFiles(key, t);
    assert.deepEqual(verifyState(key, g.json, g.sig.toString()), { ok: false, why: 'form' });
  }
  const u = emptyState('2026-10-18T12:00:00.000Z');
  u.rule0 = sealRule0('another key, 32 characters or more', { v: {}, h: {} });
  const g = stateFiles(key, u);
  assert.deepEqual(verifyState(key, g.json, g.sig.toString()), { ok: false, why: 'form' });
  // A state from before stage 1b (no rule0 field) is used, its part empty.
  const old = emptyState('2026-10-18T12:00:00.000Z');
  delete old.rule0;
  const o = stateFiles(key, old);
  assert.equal(verifyState(key, o.json, o.sig.toString()).ok, true);
  assert.deepEqual(openRule0(key, undefined), { v: {}, h: {} });
});
