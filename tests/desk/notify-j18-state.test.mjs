// join-test: S-001/J18 — a sender's memory between runs, with a fake artifact store: new keys against
// the last state; a project not read keeping its keys; a key leaving and returning; the bootstrap
// summary; unreadable states sending nothing; the lookup bounded to one page of successful runs; the
// sealed parts; the subscription's hash; no key matched to its item without the state key; and (draft
// 7) the `recorded` part kept across runs, dropped when its question leaves, and counted toward 5,000.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { stateFiles, emptyState, keyHash, openPart, sealPart, verifyState, formProblem, openRule0, emptyRule0, LIMITS } from '../../src/notify/state.mjs';
import { readZip } from '../../src/notify/zip.mjs';
import { REPO, MIN, checkoutOf, harness, makeZip, makeSubscription, cleanScratch, pull, clearView } from './notify-helpers.mjs';

after(cleanScratch);

const Q = (title) => `# Ruling needed: ${title}\n\nMilestone: none (made up)\n\nWHY: made up\n`;
const base = { 'questions/_TEMPLATE.md': '# Ruling needed: <title>\n' };
const co = (names) => checkoutOf({ base, later: names.map((n, i) => ({ files: { [`questions/${n}.md`]: Q(`Made-up ${n}`) }, date: `2026-10-18T11:${String(10 + i).padStart(2, '0')}:00+00:00` })) });

function addArtifact(h, state, o = {}) {
  const id = h.nextRun++;
  const at = new Date(h.clock.now()).toISOString();
  const files = stateFiles(o.key || h.stateKey, state);
  const json = o.json || files.json;
  const zip = o.zip || makeZip({ 'state.json': json, 'state.sig': o.sig || files.sig, ...(o.extra || {}) });
  h.world.stateRuns.push({ id, path: o.path || '.github/workflows/desk-notify.yml', repository: { full_name: REPO },
    head_repository: { full_name: o.headRepo || REPO }, head_branch: o.branch || 'main', event: 'schedule', status: 'completed',
    conclusion: o.conclusion || 'success', created_at: at });
  h.world.artifacts.push({ id: id + 50000, name: 'desk-notify-state', expired: false, size_in_bytes: o.size ?? zip.length, created_at: at, workflow_run: { id }, zip });
  return id;
}

test('J18: the bootstrap summary, then new keys against the last state, a key leaving and returning', async () => {
  const h = harness({ checkout: co(['N-a', 'N-b']) });
  const r1 = await h.run();
  assert.equal(r1.pushes.length, 1);
  assert.equal(r1.payloads[0].notification.body, 'Notifications are on: 2 things wait on you now');
  // From stage 8 (the notification view amendment, specs/S-001.md:1139-1142: "the sender's tap addresses to `/?open=<key>` and `/`").
  assert.equal(r1.payloads[0].notification.navigate, 'https://desk.example.invalid/');
  const s1 = h.state(r1);
  assert.equal(Object.keys(s1.keys).length, 2);
  assert.ok(Object.values(s1.keys).every((e) => e.sent));
  // Nothing new: nothing sent.
  assert.equal((await h.run()).pushes.length, 0);
  // A new question: one push.
  h.checkout = co(['N-a', 'N-b', 'N-c']);
  const r3 = await h.run();
  assert.equal(r3.pushes.length, 1);
  assert.equal(r3.payloads[0].notification.body, 'Waits on you: a question: Made-up N-c');
  // N-a leaves (answered and gone), then returns: sent again.
  h.checkout = co(['N-b', 'N-c']);
  assert.equal((await h.run()).pushes.length, 0);
  assert.equal(Object.keys(h.state().keys).length, 2);
  h.checkout = co(['N-b', 'N-c', 'N-a']);
  const r6 = await h.run();
  assert.equal(r6.pushes.length, 1);
  assert.equal(r6.payloads[0].notification.body, 'Waits on you: a question: Made-up N-a');
});

test('J18: a project not read keeps its last keys, and sends what started meanwhile once it reads again', async () => {
  const h = harness({ checkout: co(['N-a']) });
  await h.run();
  h.world.fail[`/repos/${REPO}/pulls?`] = 502;
  h.checkout = co(['N-a', 'N-b']);
  const r2 = await h.run();
  assert.equal(r2.pushes.length, 0);
  assert.ok(r2.logs.some((l) => /not read \(pull requests\)/.test(l)));
  const s2 = h.state(r2);
  assert.equal(s2.project.read, false);
  assert.equal(Object.keys(s2.keys).length, 1);
  delete h.world.fail[`/repos/${REPO}/pulls?`];
  const r3 = await h.run();
  assert.equal(r3.pushes.length, 1, 'only N-b, once');
  assert.equal(r3.payloads[0].notification.body, 'Waits on you: a question: Made-up N-b');
  assert.equal(h.state(r3).project.read, true);
});

test('J18: an unreadable state sends nothing and uploads nothing: a failed list, a failed download, a forged HMAC, and one over the limits', async () => {
  const setups = {
    'a failed list': (h) => { h.world.fail[`/repos/${REPO}/actions/workflows/desk-notify.yml/runs`] = 502; },
    'a failed artifact list': (h) => { h.world.fail[`/repos/${REPO}/actions/runs/`] = 502; },
    'a failed download': (h) => { h.world.fail[`/repos/${REPO}/actions/artifacts/`] = 502; },
    'a forged HMAC': (h) => { addArtifact(h, { ...emptyState(new Date(h.clock.now()).toISOString()) }, { key: 'a forger without the key, 32 chars or more' }); },
    'an edited state': (h) => {
      const s = emptyState(new Date(h.clock.now()).toISOString());
      const { sig } = stateFiles(h.stateKey, s);
      addArtifact(h, s, { json: Buffer.from(JSON.stringify({ ...s, keys: {} }) + ' '), sig });
    },
    'a zip over 1 MB': (h) => { addArtifact(h, emptyState(new Date(h.clock.now()).toISOString()), { size: LIMITS.zip + 1 }); },
    'a JSON over 256 KB': (h) => {
      const s = emptyState(new Date(h.clock.now()).toISOString());
      const json = Buffer.from(JSON.stringify(s) + ' '.repeat(LIMITS.json));
      addArtifact(h, s, { json, sig: Buffer.from(stateFiles(h.stateKey, s).sig) });
    },
    'more than 5,000 keys': (h) => {
      const s = emptyState(new Date(h.clock.now()).toISOString());
      for (let i = 0; i < 5001; i++) s.keys[randomBytes(16).toString('hex')] = { sent: s.at };
      addArtifact(h, s);
    },
    'a third file in the zip': (h) => { addArtifact(h, emptyState(new Date(h.clock.now()).toISOString()), { extra: { 'run.mjs': Buffer.from('x') } }); },
  };
  for (const [name, setup] of Object.entries(setups)) {
    const h = harness({ checkout: co(['N-a']) });
    await h.run(); // a good state
    h.checkout = co(['N-a', 'N-b']);
    setup(h);
    const r = await h.run();
    assert.equal(r.pushes.length, 0, name);
    assert.equal(r.wrote, false, name);
    assert.ok(r.logs.some((l) => /state: unreadable/.test(l)), name);
  }
});

test('J18: artifacts from another workflow, a branch or another repository are never taken; the last good state is used', async () => {
  for (const o of [{ path: '.github/workflows/other.yml' }, { branch: 'cos/x' }, { headRepo: 'someone/Service-Desk' }]) {
    const h = harness({ checkout: co(['N-a']) });
    await h.run();
    // A newer artifact that would make N-b look sent, signed with the right key but not the sender's own run.
    const s = h.state();
    s.keys[keyHash(h.stateKey, 'Service-Desk|question|questions/N-b.md')] = { sent: s.at };
    addArtifact(h, s, o);
    h.checkout = co(['N-a', 'N-b']);
    const r = await h.run();
    assert.equal(r.pushes.length, 1, JSON.stringify(o));
    assert.equal(r.payloads[0].notification.body, 'Waits on you: a question: Made-up N-b');
  }
});

test('J18: the lookup lists only successful runs, one page: a valid state on the second page is not looked for; 150 skipped runs do not hide one', async () => {
  // 150 newer runs that concluded `skipped`: status=success leaves them out, the state is found.
  const h = harness({ checkout: co(['N-a']) });
  await h.run();
  for (let i = 0; i < 150; i++) h.world.stateRuns.push({ id: h.nextRun++, path: '.github/workflows/desk-notify.yml', repository: { full_name: REPO },
    head_repository: { full_name: REPO }, head_branch: 'main', event: 'workflow_run', status: 'completed', conclusion: 'skipped', created_at: '2026-10-18T13:00:00Z' });
  const r = await h.run();
  assert.ok(r.logs.some((l) => l.endsWith('state: read')));
  assert.equal(r.pushes.length, 0);
  // 100 newer successful runs that uploaded nothing (budget stops): the valid state is on page 2, so "no state".
  const h2 = harness({ checkout: co(['N-a']) });
  await h2.run();
  for (let i = 0; i < 100; i++) h2.world.stateRuns.push({ id: h2.nextRun++, path: '.github/workflows/desk-notify.yml', repository: { full_name: REPO },
    head_repository: { full_name: REPO }, head_branch: 'main', event: 'schedule', status: 'completed', conclusion: 'success', created_at: '2026-10-18T13:00:00Z' });
  const r2 = await h2.run();
  assert.ok(r2.logs.some((l) => /state: none/.test(l)));
  assert.equal(r2.payloads[0].notification.body, 'Notifications are on: 1 thing waits on you now');
  // The status filter refused: status=completed instead, still only successful runs taken.
  const h3 = harness({ checkout: co(['N-a']) });
  await h3.run();
  h3.world.statusFilterRefused = true;
  h3.world.stateRuns.push({ id: h3.nextRun++, path: '.github/workflows/desk-notify.yml', repository: { full_name: REPO }, head_repository: { full_name: REPO },
    head_branch: 'main', event: 'schedule', status: 'completed', conclusion: 'failure', created_at: '2026-10-18T13:00:00Z' });
  const r3 = await h3.run();
  assert.ok(r3.logs.some((l) => l.endsWith('state: read')));
  assert.ok(r3.ghCalls.some((c) => c.path.includes('status=completed')));
});

test('J18: the sealed parts, the subscription\'s hash, and no key matched to its item without the state key', async () => {
  const h = harness({ checkout: co(['N-a', 'N-b']) });
  await h.run({ test: 'true' });
  const s = h.state();
  // The JWT is sealed: unreadable without the key, readable with it.
  assert.equal(openPart('a wrong key, of 32 characters or more', 'jwt', s.jwt), null);
  const jwt = openPart(h.stateKey, 'jwt', s.jwt);
  assert.match(jwt.jwt, /^[\w-]+\.[\w-]+\.[\w-]+$/);
  assert.ok(!JSON.stringify(s).includes(jwt.jwt));
  // The usage part likewise.
  const sealed = sealPart(h.stateKey, 'usage', { ym: '2026-10', step: 2 });
  assert.equal(openPart('a wrong key, of 32 characters or more', 'usage', sealed), null);
  assert.deepEqual(openPart(h.stateKey, 'usage', sealed), { ym: '2026-10', step: 2 });
  assert.equal(openPart(h.stateKey, 'jwt', sealed), null, 'a part opens only under its own label');
  // No title, path, number or endpoint in clear: every needle is looked for in the clear fields. The
  // sealed parts are base64url of random bytes and the keyed hashes random hex, so a short needle of
  // those characters ('N-a') turns up in them by chance (about one run in 385); each is checked as
  // what it is instead (clearView, and the leak scan's own test below).
  const view = clearView(s);
  const leaks = ['N-a', 'questions/', 'Made-up', JSON.parse(h.sub.value).endpoint, 'Service-Desk'];
  for (const leak of leaks) assert.ok(!view.text.includes(leak), leak);
  // Each sealed part (the JWT, and rule 0's, stage 1b): base64url only, opened by no wrong key, opened
  // by the state key, and its clear value not in its bytes (not merely encoded).
  assert.deepEqual(view.sealed.map(([label]) => label), ['jwt', 'rule0']);
  for (const [label, part] of view.sealed) {
    assert.match(part, /^[\w-]+$/, label);
    assert.equal(openPart('a wrong key, of 32 characters or more', label, part), null, label);
    const clear = openPart(h.stateKey, label, part);
    assert.notEqual(clear, null, label);
    assert.ok(!Buffer.from(part, 'base64url').includes(JSON.stringify(clear)), `${label}: not merely encoded`);
  }
  assert.equal(openRule0('a wrong key, of 32 characters or more', s.rule0), null, 'rule 0\'s part: unreadable without the key');
  assert.deepEqual(openRule0(h.stateKey, s.rule0), emptyRule0(), 'readable with it');
  // The keyed hashes are hex only. So a needle no chance can match there or in a sealed part (one with
  // a character outside base64url, or 16 characters or more) is looked for in the whole state too.
  assert.ok(view.hashes.length === 3 && view.hashes.every((x) => /^[0-9a-f]{32}$/.test(x)), view.hashes.join());
  const text = JSON.stringify(s);
  for (const leak of leaks.filter((l) => /[^\w-]/.test(l) || l.length >= 16)) assert.ok(!text.includes(leak), leak);
  // Every key is a keyed hash; with a wrong key none of the items' keys is found.
  const keys = ['Service-Desk|question|questions/N-a.md', 'Service-Desk|question|questions/N-b.md'];
  assert.deepEqual(Object.keys(s.keys).sort(), keys.map((k) => keyHash(h.stateKey, k)).sort());
  for (const wrong of ['a wrong key, of 32 characters or more', randomBytes(32).toString('hex')]) {
    assert.ok(keys.every((k) => !Object.prototype.hasOwnProperty.call(s.keys, keyHash(wrong, k))));
  }
  // A new subscription: its hash changes.
  const before = s.sub;
  h.sub = makeSubscription();
  await h.run();
  assert.notEqual(h.state().sub, before);
  assert.match(h.state().sub, /^[0-9a-f]{32}$/);
});

test('J18: the leak scan reads the clear fields: a needle in a sealed part or a keyed hash by chance is no leak; one in a clear field is found', () => {
  const key = 'k'.repeat(64);
  const s = emptyState('2026-10-18T12:00:00.000Z');
  // A sealed part holding 'N-a' by chance (about 1 seal in 700 of this size), and a keyed hash
  // holding '800' (about 1 in 140): both reachable, well within the bounds.
  let jwt = null;
  for (let i = 0; i < 100000 && !jwt; i++) {
    const x = sealPart(key, 'jwt', { jwt: 'made-up' });
    if (x.includes('N-a')) jwt = x;
  }
  let sub = null;
  for (let i = 0; i < 100000 && !sub; i++) {
    const x = keyHash(key, `made-up subscription ${i}`);
    if (x.includes('800')) sub = x;
  }
  assert.ok(jwt && sub, 'reachable');
  const pr = sealPart(key, 'recorded-pr', { n: 5 });
  Object.assign(s, { jwt, sub, recorded: { [keyHash(key, 'made-up question')]: { seen: s.at, pr } } });
  s.keys[keyHash(key, 'made-up item')] = { sent: s.at };
  // The whole state's text would read as a leak of both; its clear fields hold neither.
  const text = JSON.stringify(s);
  assert.ok(text.includes('N-a') && text.includes('800'), 'the old scan\'s false positive');
  const view = clearView(s);
  assert.ok(!view.text.includes('N-a') && !view.text.includes('800'), view.text);
  assert.deepEqual(view.sealed, [['jwt', jwt], ['recorded-pr', pr]]);
  assert.deepEqual(view.hashes, [sub, ...Object.keys(s.keys), ...Object.keys(s.recorded)]);
  assert.equal(openPart('a wrong key, of 32 characters or more', 'jwt', jwt), null, 'and it stays sealed');
  // Only a sealed part or a hash in its form is taken out: a needle anywhere else is still found.
  const leaky = {
    'the time': { ...s, at: 'N-a' },
    'a refusal': { ...s, refused: { status: 410, reason: 'questions/N-a.md', since: s.at } },
    'a key\'s entry': { ...s, keys: { [sub]: { unsent: s.at, fail: 'N-a' } } },
    'a key not hashed': { ...s, keys: { 'N-a': { sent: s.at } } },
    'a recorded entry': { ...s, recorded: { [sub]: { seen: 'N-a', pr } } },
    'the subscription in clear': { ...s, sub: 'N-a' },
    'a JWT in clear': { ...s, jwt: 'questions/N-a.md' },
    'a usage part in clear': { ...s, usage: { ym: '2026-10', note: 'N-a' } },
    'a pull request in clear': { ...s, recorded: { [sub]: { seen: s.at, pr: { n: 'N-a' } } } },
  };
  for (const [name, st] of Object.entries(leaky)) assert.ok(clearView(st).text.includes('N-a'), name);
});

test('J18: the state\'s two files: the HMAC checked before the JSON is read; the zip reader\'s limits', () => {
  const key = 'k'.repeat(64);
  const s = emptyState('2026-10-18T12:00:00.000Z');
  const f = stateFiles(key, s);
  assert.equal(verifyState(key, f.json, f.sig.toString()).ok, true);
  assert.deepEqual(verifyState('x'.repeat(64), f.json, f.sig.toString()), { ok: false, why: 'forged' });
  // At most 5,000 keys (the JSON's 256 KB binds first in this form, so the count is checked on its own).
  const many = emptyState(s.at);
  for (let i = 0; i < 5001; i++) many.keys[i.toString(16).padStart(32, '0')] = { sent: s.at };
  assert.equal(formProblem(many), 'too many keys');
  delete many.keys[(0).toString(16).padStart(32, '0')];
  assert.equal(formProblem(many), null);
  const files = readZip(makeZip({ 'state.json': f.json, 'state.sig': f.sig }));
  assert.deepEqual([...files.keys()], ['state.json', 'state.sig']);
  assert.equal(readZip(Buffer.from('not a zip')), null);
  assert.equal(readZip(makeZip({ 'big.json': Buffer.alloc(300 * 1024) }), { maxEntry: 256 * 1024 }), null);
});

test('J18: a run that dies after sending and before its upload: the next run sends those keys again, with the same Topic and tag', async () => {
  const h = harness({ checkout: co(['N-a']) });
  await h.run();
  h.checkout = co(['N-a', 'N-b']);
  const r2 = await h.run({ noUpload: true });
  const r3 = await h.run();
  assert.equal(r2.pushes.length, 1);
  assert.equal(r3.pushes.length, 1);
  assert.equal(r3.pushes[0].headers.get('topic'), r2.pushes[0].headers.get('topic'));
  assert.equal(r3.payloads[0].notification.tag, r2.payloads[0].notification.tag);
  void MIN;
});

// Draft 7 (Critic round 5, note 11): the `recorded` part. The question's answer is recorded by an
// open pull request (made up); its keyed hash is kept with when a run first saw it, run after run,
// while the question stays open, and dropped when it leaves (answered or gone).
const ANSWERING = [{ filename: 'decisions/questions/N-r.md', status: 'added' }];

test('J18 (draft 7): `recorded` kept across runs with its first time, dropped when its question leaves', async () => {
  const h = harness({ checkout: co(['N-r', 'N-other']) });
  await h.run();
  h.world.pulls = [pull(120, { title: 'Record the answer to N-r' })];
  h.world.files[120] = ANSWERING;
  let r = await h.run();
  const qh = keyHash(h.stateKey, 'Service-Desk|question|questions/N-r.md');
  const first = h.state(r).recorded[qh].seen;
  assert.ok(first, 'seen being recorded');
  assert.deepEqual(Object.keys(h.state(r).recorded), [qh], 'only that question');
  r = await h.run();
  assert.equal(h.state(r).recorded[qh].seen, first, 'kept, with when a run first saw it');
  // The pull request closes unmerged (read by number, draft 9): the entry stays, so the question waits at once.
  h.world.pulls = [];
  h.world.prs = { 120: { ...pull(120), state: 'closed', closed_at: '2026-10-18T12:20:00Z', merged_at: null } };
  r = await h.run();
  assert.equal(h.state(r).recorded[qh], first);
  assert.deepEqual(r.payloads.map((p) => p.notification.body), ['Waits on you: a question: Made-up N-r']);
  // A project not read keeps it as it was.
  h.world.fail[`/repos/${REPO}/pulls?`] = 502;
  r = await h.run();
  assert.equal(h.state(r).recorded[qh], first);
  delete h.world.fail[`/repos/${REPO}/pulls?`];
  // The question leaves (answered, or its file gone): dropped.
  h.checkout = co(['N-other']);
  r = await h.run();
  assert.deepEqual(h.state(r).recorded, {});
});

test('J18 (draft 7): recorded questions count with the keys and job candidates toward the 5,000; a state over it is not used', async () => {
  const hex = (i, p) => `${p}${i.toString(16).padStart(31, '0')}`;
  const s = emptyState('2026-10-18T12:00:00.000Z');
  for (let i = 0; i < 3000; i++) s.keys[hex(i, 'a')] = { sent: s.at };
  for (let i = 0; i < 1000; i++) s.cand[hex(i, 'b')] = { seen: s.at, retried: null };
  for (let i = 0; i < 1000; i++) s.recorded[hex(i, 'c')] = s.at;
  assert.equal(Object.keys(s.keys).length + Object.keys(s.cand).length + Object.keys(s.recorded).length, LIMITS.keys);
  assert.equal(formProblem(s), null, '5,000 in all: used');
  s.recorded[hex(1000, 'c')] = s.at;
  assert.equal(formProblem(s), 'too many keys', '5,001 with the recorded questions: not used');
  // In a run: such a state is unreadable, so nothing is sent and nothing saved.
  const h = harness({ checkout: co(['N-a']) });
  await h.run();
  addArtifact(h, { ...s, project: { read: true, unreadSince: null } });
  h.checkout = co(['N-a', 'N-b']);
  const r = await h.run();
  assert.ok(r.logs.some((l) => /state: unreadable \(form\)/.test(l)), r.logs.join('\n'));
  assert.equal(r.pushes.length, 0);
  assert.equal(r.wrote, false);
});
