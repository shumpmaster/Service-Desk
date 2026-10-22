// join-test: S-001/J23 — the version reads (stage 3, for AC83's top line; stage 6a's block reuses them): each
// connected project's governance/OPERATING_MODEL_VERSION and AGENTS.md's `tier:` line, and the root VERSION of
// the project J7 marks `publishesModel`, three optional blobs read once per device and again only when a sha
// changes. Service-Desk's are its real files at 77bfeae (tests/desk/fixtures/j11-77bfeae/, copied with `git
// show 77bfeae:<path>`); Personal-Org-Operating-Model's are in poom/'s placeholder form, made up here and
// never copied from it (NOT real records); every other line is made up and says so.
// join-test: S-001/J7 (`publishesModel`)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIX, CONFIG } from './helpers.mjs';
import { repo, gitSha } from './fake-desk.mjs';
import { loadSandbox } from './sandbox-helpers.mjs';
import { j77Files, poomFiles, snapOf, SD, POOM } from './wa-fixtures.mjs';
import { neededReads, recordKind, parseRecord } from '../../src/lib/model.js';
import { validateConfig } from '../../src/lib/configcheck.js';
import { parseVersion, parseTier, versionWords, projectVersions, topLine, MODEL_VERSION_PATH, AGENTS_PATH, ROOT_VERSION_PATH } from '../../src/lib/versions.js';

const SD_AGENTS = readFileSync(join(FIX, 'j11-77bfeae', 'AGENTS.md'), 'utf8');
const SD_VERSION = readFileSync(join(FIX, 'j11-77bfeae', 'governance', 'OPERATING_MODEL_VERSION'), 'utf8');
const PUB = { ...POOM, publishesModel: true };
/** Personal-Org-Operating-Model's three files in placeholder form (NOT real records: that repository is private). */
const POOM_PLACEHOLDER = { VERSION: '3.5.0\n', 'AGENTS.md': '# (placeholder, NOT a real record)\n\ntier: T1   # placeholder comment\n' };

// ---------------------------------------------------------------------------
// The reads, from the records

test('J23: Service-Desk\'s real files at 77bfeae — the version is the first line, trimmed ("3.5.0"); the tier is the first column-0 `tier:` line\'s value before its `#` comment, trimmed ("T1", from AGENTS.md:3)', () => {
  assert.equal(SD_AGENTS.split('\n')[2], 'tier: T1                  # T0 | T1 | T2 | T3 — change only via a ledger entry', 'AGENTS.md:3 as the spec quotes it');
  assert.equal(SD_VERSION, '3.5.0\n');
  assert.deepEqual(parseVersion(SD_VERSION), { version: '3.5.0', compared: true });
  assert.deepEqual(parseTier(SD_AGENTS), { tier: 'T1', line: true });
  assert.equal(recordKind(MODEL_VERSION_PATH, 'v3'), 'model-version');
  assert.equal(recordKind(AGENTS_PATH, 'v2.5'), 'agents-tier', 'every project\'s, a v2.5 one too');
  assert.equal(recordKind(ROOT_VERSION_PATH, 'v2.5'), 'root-version');
  assert.deepEqual(parseRecord('agents-tier', SD_AGENTS, AGENTS_PATH), { tier: 'T1', line: true }, 'only the tier is kept: a small cached record');
  const snap = snapOf({ ...j77Files() });
  assert.equal(topLine(SD, snap), 'v3 · model 3.5.0 · T1', 'AC83\'s top line for Service-Desk');
});

test('J23: the tier\'s awkward lines (made up, NOT real records) — no comment; no value; a `tier:` not in column 0; the first of two; none at all', () => {
  assert.equal(parseTier('# x\ntier: T2\n').tier, 'T2', 'a `tier:` line with no comment');
  assert.deepEqual(parseTier('# x\ntier:    # only a comment\n'), { tier: null, line: true }, 'one with no value: not recorded');
  assert.deepEqual(parseTier('# x\ntier:\n'), { tier: null, line: true });
  assert.deepEqual(parseTier('# x\n  tier: T3\n'), { tier: null, line: false }, 'not column 0: not the line');
  assert.equal(parseTier('tier: T1 # a\ntier: T3\n').tier, 'T1', 'the first counts');
  assert.deepEqual(parseTier('# no tier here\n'), { tier: null, line: false });
  assert.equal(parseTier('﻿tier: T1\r\n').tier, 'T1', 'a byte-order mark and CRLF line ends');
  const tierOf = (text) => projectVersions(SD, snapOf({ ...j77Files(), [AGENTS_PATH]: text })).tier;
  assert.equal(tierOf('tier: T2\n'), 'T2');
  assert.equal(tierOf('tier:\n'), 'not recorded');
  assert.equal(tierOf('# none\n'), 'not recorded');
});

test('J23: a version file\'s awkward forms (made up) — a trailing newline or spaces trimmed; not three whole numbers: its text, "not compared"; empty or missing: "not recorded"; still to be read: "not available"', () => {
  assert.deepEqual(parseVersion('3.5.0  \n\n'), { version: '3.5.0', compared: true });
  assert.deepEqual(parseVersion('  4.0.0\r\n'), { version: '4.0.0', compared: true });
  for (const v of ['3.5', 'v3.5.0', '3.5.0-rc1', '03.5.0', 'three']) {
    assert.equal(parseVersion(`${v}\n`).compared, false, v);
    assert.equal(versionWords(parseVersion(`${v}\n`)), `${v}, not compared`, v);
  }
  assert.equal(versionWords(parseVersion('\n')), 'not recorded');
  const files = { ...j77Files() };
  delete files[MODEL_VERSION_PATH];
  delete files[AGENTS_PATH];
  assert.equal(topLine(SD, snapOf(files)), 'v3 · model not recorded · tier not recorded', 'neither file in the tree');
  const unread = snapOf({ ...j77Files() });
  unread.records.delete(MODEL_VERSION_PATH);
  unread.records.delete(AGENTS_PATH);
  assert.equal(topLine(SD, unread), 'v3 · model not available · tier not available', 'in the tree, not read yet');
});

test('J23 + J7: only the project J7 marks `publishesModel` has its root VERSION read and shown, "publishes model <its VERSION>" (frame 8); a v2.5 project\'s own version is still its governance/OPERATING_MODEL_VERSION', () => {
  const files = { ...poomFiles(), ...POOM_PLACEHOLDER };
  assert.equal(topLine(PUB, snapOf(files, 'v2.5')), 'v2.5 pipeline · model not recorded · T1 · publishes model 3.5.0');
  assert.equal(topLine(PUB, snapOf({ ...files, [MODEL_VERSION_PATH]: '3.4.0\n' }, 'v2.5')), 'v2.5 pipeline · model 3.4.0 · T1 · publishes model 3.5.0');
  assert.equal(topLine({ ...PUB, publishesModel: false }, snapOf(files, 'v2.5')), 'v2.5 pipeline · model not recorded · T1', 'without it, no VERSION part');
  assert.equal(topLine({ ...SD, publishesModel: true }, snapOf({ ...j77Files(), VERSION: '3.6.0 \n' })), 'v3 · model 3.5.0 · T1 · publishes model 3.6.0',
    'allowed on a v3 project, whose own version is still its OPERATING_MODEL_VERSION');
  assert.equal(topLine(PUB, snapOf(poomFiles(), 'v2.5')), 'v2.5 pipeline · model not recorded · tier not recorded · publishes model not recorded', 'none of its files');
});

// ---------------------------------------------------------------------------
// The reads, registered (A3)

test('J23 (A3): the three are optional blobs, registered in neededReads for every connected project, outside J11\'s v3-only block, only in the sandbox (ctx.j11); VERSION only for the project J7 marks `publishesModel`; none needed, none for the sender', () => {
  const at = new Date('2026-10-19T21:00:00Z');
  const tree = (files) => new Map(Object.entries(files).map(([p, t]) => [p, { sha: gitSha(t), size: t.length }]));
  const sdFiles = { ...j77Files(), VERSION: '9.9.9\n' }; // a VERSION in Service-Desk's tree (made up): not read, it does not publish the model
  const opt = (project, files) => neededReads(project, tree(files), new Map(), at, { j11: true }).optional.blobs.map((b) => b.path);
  const need = (project, files) => neededReads(project, tree(files), new Map(), at, { j11: true }).blobs.map((b) => b.path);
  const v = [MODEL_VERSION_PATH, AGENTS_PATH, ROOT_VERSION_PATH];
  assert.deepEqual(opt(SD, sdFiles).filter((p) => v.includes(p)), [MODEL_VERSION_PATH, AGENTS_PATH], 'a v3 project: the two, not VERSION');
  const pf = { ...poomFiles(), ...POOM_PLACEHOLDER, [MODEL_VERSION_PATH]: '3.4.0\n' };
  assert.deepEqual(opt(PUB, pf).filter((p) => v.includes(p)), [MODEL_VERSION_PATH, AGENTS_PATH, ROOT_VERSION_PATH], 'a v2.5 project marked publishesModel: all three');
  assert.deepEqual(opt(POOM, pf).filter((p) => v.includes(p)), [MODEL_VERSION_PATH, AGENTS_PATH], 'unmarked: not VERSION');
  for (const [p, f] of [[SD, sdFiles], [PUB, pf]]) assert.deepEqual(need(p, f).filter((x) => v.includes(x)), [], `${p.name}: none needed, so none holds a read back`);
  const noJ11 = neededReads(PUB, tree(pf), new Map(), at, {});
  assert.deepEqual([...noJ11.blobs, ...noJ11.optional.blobs].filter((b) => v.includes(b.path)), [], 'without ctx.j11 (the accepted view, the sender): none');
  assert.deepEqual(opt(SD, { 'README.md': '# x\n' }).filter((p) => v.includes(p)), [], 'a file the tree lacks is not asked for');
});

test('J23 (A3): in the sandbox each of the three is asked for once in an opening, inside a blob call the page makes anyway, and again only when its sha changes', async () => {
  const config = { ...CONFIG, projects: [SD, PUB] };
  const repos = { 'Service-Desk': repo({ ...j77Files() }), 'Personal-Org-Operating-Model': repo({ ...poomFiles(), ...POOM_PLACEHOLDER }) };
  const app = await loadSandbox({ config, repos, hash: '#/', now: Date.parse('2026-10-19T21:00:00Z') });
  try {
    await app.advance(1000);
    for (let i = 0; i < 4; i++) await app.advance(61_000);
    // By project: Service-Desk's version file and the placeholder VERSION hold the same text, so the same sha.
    const asked = ([name, sha]) => app.server.calls.filter((c) => c.path === '/api/blobs' && c.project === name && (c.body.blobs || []).includes(sha));
    const SDN = 'Service-Desk';
    const PN = 'Personal-Org-Operating-Model';
    const shas = { sdV: [SDN, gitSha(SD_VERSION)], sdA: [SDN, gitSha(SD_AGENTS)], pV: [PN, gitSha(POOM_PLACEHOLDER.VERSION)], pA: [PN, gitSha(POOM_PLACEHOLDER['AGENTS.md'])] };
    for (const [k, x] of Object.entries(shas)) assert.equal(asked(x).length, 1, `${k}: asked once in the opening`);
    // Each rode a blob call that carried other blobs too: no call of its own.
    for (const [k, x] of Object.entries(shas)) assert.ok(asked(x)[0].body.blobs.length > 1, `${k}: inside a blob call the page makes anyway`);
    await app.go('#/p/Service-Desk');
    assert.match(app.view.textContent, /v3 · model 3\.5\.0 · T1/);
    await app.go('#/p/Personal-Org-Operating-Model');
    assert.match(app.view.textContent, /v2\.5 pipeline · model not recorded · T1 · publishes model 3\.5\.0/);
    // A new head that changes only VERSION: that one blob is asked again, the rest stay cached.
    repos['Personal-Org-Operating-Model'].commit({ VERSION: '3.6.0\n' });
    for (let i = 0; i < 3; i++) await app.advance(61_000);
    assert.equal(asked([PN, gitSha('3.6.0\n')]).length, 1, 'the changed VERSION, read again');
    assert.equal(asked(shas.pA).length, 1, 'AGENTS.md unchanged: not asked again');
    assert.match(app.view.textContent, /publishes model 3\.6\.0/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// J7's `publishesModel`

test('J7 (stage 3, J23): `publishesModel` on Personal-Org-Operating-Model\'s entry; one entry passing, two failing, "yes" failing, on a v3 entry passing, absent meaning false', () => {
  assert.deepEqual(CONFIG.projects.map((p) => [p.name, p.publishesModel === true]), [['Service-Desk', false], ['Personal-Org-Operating-Model', true]]);
  assert.equal('publishesModel' in CONFIG.projects[0], false, 'absent on Service-Desk\'s: false');
  assert.deepEqual(validateConfig(CONFIG), []);
  const set = (fn) => { const c = JSON.parse(JSON.stringify(CONFIG)); fn(c); return validateConfig(c); };
  assert.deepEqual(set((c) => { c.projects[0].publishesModel = true; c.projects[1].publishesModel = false; }), [], 'on a v3 entry: allowed');
  assert.deepEqual(set((c) => { delete c.projects[1].publishesModel; }), [], 'on none: builds');
  assert.match(set((c) => { c.projects[0].publishesModel = true; }).join('\n'), /only one project may hold "publishesModel": true/, 'two entries: the build fails');
  for (const bad of ['yes', 1, null]) {
    assert.match(set((c) => { c.projects[1].publishesModel = bad; }).join('\n'), /projects\[1\]\.publishesModel must be true or false/, JSON.stringify(bad));
  }
});
