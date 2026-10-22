// join-test: S-001/J17 — the sender → the push service → the desk on the phone: RFC 8291's worked
// example byte for byte, the VAPID JWT (RFC 8292) and its hourly minting, the keys' check, `test:
// fail`, the headers, the payload's form and size, each answer code, and no secret in any log line.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createPublicKey, verify } from 'node:crypto';
import { encrypt, mintJwt, parseSubscription, parseVapidKey, decodePublicKey, payload, answerKind, cut } from '../../src/notify/webpush.mjs';
import { firstStep, pushConfig } from '../../src/notify/secrets.mjs';
import { CONFIG } from './helpers.mjs';
import { harness, makeVapid, makeSubscription, testConfig, decryptPush, checkoutOf, cleanScratch, MIN, HOUR } from './notify-helpers.mjs';

after(cleanScratch);

const d = (s) => Buffer.from(s, 'base64url');

test('J17: aes128gcm reproduces RFC 8291 Appendix A byte for byte', () => {
  // The worked example's inputs and its message (RFC 8291, Appendix A).
  const plaintext = d('V2hlbiBJIGdyb3cgdXAsIEkgd2FudCB0byBiZSBhIHdhdGVybWVsb24');
  assert.equal(plaintext.toString(), 'When I grow up, I want to be a watermelon');
  const sub = { p256dh: d('BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4'), auth: d('BTBZMqHH6r4Tts7J_aSIgg') };
  const out = encrypt(plaintext, sub, { asPrivate: d('yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw'), salt: d('DGv6ra1nlYgDCS1FRnbzlw') });
  assert.equal(out.toString('base64url'),
    'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN');
  // And the phone's side decrypts it with the user agent's private key.
  const back = decryptPush(out, { uaPrivate: d('q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94'), uaPublic: sub.p256dh, auth: sub.auth });
  assert.equal(back.text, 'When I grow up, I want to be a watermelon');
  assert.equal(back.rs, 4096);
});

test('J17: a round trip with a fresh key and salt each time', () => {
  const s = makeSubscription();
  const sub = parseSubscription(s.value);
  const a = encrypt(Buffer.from('hello'), sub);
  const b = encrypt(Buffer.from('hello'), sub);
  assert.notEqual(a.toString('hex'), b.toString('hex'));
  assert.equal(decryptPush(a, s).text, 'hello');
  assert.equal(decryptPush(b, s).text, 'hello');
});

test('J17: the JWT: ES256, its header and claims, a signature that verifies with the public key', () => {
  const v = makeVapid();
  const key = parseVapidKey(v.pem);
  assert.ok(key.publicRaw.equals(v.raw));
  const nowMs = Date.parse('2026-10-18T12:00:00Z');
  const j = mintJwt({ privateKey: key.privateKey, aud: 'https://web.push.apple.com', sub: 'mailto:owner@example.invalid', nowMs });
  const [h, c, s] = j.jwt.split('.');
  assert.deepEqual(JSON.parse(d(h)), { typ: 'JWT', alg: 'ES256' });
  assert.deepEqual(JSON.parse(d(c)), { aud: 'https://web.push.apple.com', exp: nowMs / 1000 + 7200, sub: 'mailto:owner@example.invalid' });
  const pub = createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: v.raw.subarray(1, 33).toString('base64url'), y: v.raw.subarray(33).toString('base64url') }, format: 'jwk' });
  assert.equal(d(s).length, 64);
  assert.ok(verify('sha256', Buffer.from(`${h}.${c}`), { key: pub, dsaEncoding: 'ieee-p1363' }, d(s)));
  assert.equal(j.mintedAt, '2026-10-18T12:00:00.000Z');
});

test('J17: the subscription and the keys: forms accepted and refused', () => {
  const s = makeSubscription();
  assert.ok(parseSubscription(s.value));
  const v = JSON.parse(s.value);
  for (const bad of ['', 'not json', '[]', JSON.stringify({ ...v, endpoint: 'http://push.example.invalid/x' }),
    JSON.stringify({ ...v, keys: { ...v.keys, auth: 'short' } }), JSON.stringify({ ...v, keys: { ...v.keys, p256dh: v.keys.p256dh.slice(0, 40) } }),
    JSON.stringify({ ...v, keys: { ...v.keys, p256dh: `B${'A'.repeat(86)}` } }), JSON.stringify({ endpoint: v.endpoint })]) {
    assert.equal(parseSubscription(bad), null, bad.slice(0, 60));
  }
  const vap = makeVapid();
  assert.ok(decodePublicKey(vap.publicB64));
  assert.equal(vap.publicB64.length, 87);
  assert.equal(decodePublicKey(`${vap.publicB64}=`), null);
  assert.equal(decodePublicKey(vap.publicB64.slice(1)), null);
  assert.equal(parseVapidKey('-----BEGIN EC PRIVATE KEY-----\nnot a key\n-----END EC PRIVATE KEY-----\n'), null);
});

test('J17: the keys\' check at the first step, and each secret missing or malformed, by name only', () => {
  const v = makeVapid();
  const s = makeSubscription();
  const env = { GITHUB_TOKEN: 't', DESK_VAPID_PRIVATE_KEY: v.pem, DESK_VAPID_SUBJECT: 'mailto:o@example.invalid', DESK_PUSH_SUBSCRIPTION: s.value,
    DESK_NOTIFY_STATE_KEY: 'a'.repeat(64) };
  assert.equal(firstStep(env, testConfig(v)).ok, true);
  const other = makeVapid();
  assert.deepEqual(firstStep(env, testConfig(other)), { ok: false, problem: 'keys', name: 'DESK_VAPID_PRIVATE_KEY' });
  for (const n of ['DESK_VAPID_PRIVATE_KEY', 'DESK_VAPID_SUBJECT', 'DESK_PUSH_SUBSCRIPTION', 'DESK_NOTIFY_STATE_KEY']) {
    assert.deepEqual(firstStep({ ...env, [n]: '' }, testConfig(v)), { ok: false, problem: 'missing', name: n });
  }
  assert.equal(firstStep({ ...env, DESK_PUSH_SUBSCRIPTION: '{"endpoint":1}' }, testConfig(v)).problem, 'malformed');
  assert.equal(firstStep({ ...env, DESK_VAPID_SUBJECT: 'owner@example.invalid' }, testConfig(v)).problem, 'malformed');
  assert.equal(firstStep({ ...env, DESK_NOTIFY_STATE_KEY: 'short' }, testConfig(v)).problem, 'malformed');
  assert.equal(firstStep(env, { ...testConfig(v), push: undefined }).problem, 'config');
  assert.equal(firstStep(env, { ...testConfig(v), push: { vapidPublicKey: 'x', deskUrl: 'https://d.example.invalid' } }).problem, 'config');
});

// The committed J7 (src/config/projects.json), with the owner's public key (Setup N1, CS18). The
// owner's private key is never here: a throwaway key's public half is put in a copy of the real config.
test('J17, J7: the sender\'s first step on the committed config: push is in form, the key a P-256 point; with a matching private key the step passes, with any other it stops at the keys\' check', () => {
  const real = pushConfig(CONFIG);
  assert.ok(real, 'J7\'s committed push is in form');
  assert.equal(real.vapidPublicKey.length, 87);
  assert.equal(real.publicRaw.length, 65);
  assert.equal(real.publicRaw[0], 0x04, 'uncompressed');
  const jwk = { kty: 'EC', crv: 'P-256', x: real.publicRaw.subarray(1, 33).toString('base64url'), y: real.publicRaw.subarray(33).toString('base64url') };
  assert.equal(createPublicKey({ key: jwk, format: 'jwk' }).asymmetricKeyDetails.namedCurve, 'prime256v1', 'a point on P-256');
  assert.equal(real.deskUrl, 'https://service-desk-preview.pages.dev', 'the tap opens the preview until launch');
  const v = makeVapid();
  const s = makeSubscription();
  const env = { GITHUB_TOKEN: 't', DESK_VAPID_PRIVATE_KEY: v.pem, DESK_VAPID_SUBJECT: 'mailto:o@example.invalid', DESK_PUSH_SUBSCRIPTION: s.value,
    DESK_NOTIFY_STATE_KEY: 'a'.repeat(64) };
  const matching = { ...CONFIG, push: { ...CONFIG.push, vapidPublicKey: v.publicB64 } };
  const r = firstStep(env, matching);
  assert.equal(r.ok, true, 'a private key whose public half is J7\'s passes');
  assert.equal(r.secrets.push.deskUrl, 'https://service-desk-preview.pages.dev');
  assert.deepEqual(firstStep(env, CONFIG), { ok: false, problem: 'keys', name: 'DESK_VAPID_PRIVATE_KEY' }, 'the throwaway key is not the owner\'s');
});

test('J17: the answers', () => {
  assert.equal(answerKind(201), 'sent');
  assert.equal(answerKind(429), 'later');
  for (const s of [500, 502, 503]) assert.equal(answerKind(s), 'later');
  assert.equal(answerKind(410), 'gone');
  assert.equal(answerKind(404), 'gone');
  for (const s of [400, 401, 403]) assert.equal(answerKind(s), 'refused');
  assert.equal(answerKind(413), 'too-large');
  assert.equal(cut('x'.repeat(200), 140).length, 140);
  assert.ok(cut('x'.repeat(200), 140).endsWith('…'));
  assert.equal(cut('short', 140), 'short');
});

function oneQuestion() {
  return checkoutOf({ base: { 'questions/_TEMPLATE.md': '# Ruling needed: <title>\n' },
    later: [{ files: { 'questions/N-made-up.md': '# Ruling needed: A made-up question\n\nMilestone: none (made up)\n\nWHY: made up\n' }, date: '2026-10-18T11:00:00+00:00' }] });
}

test('J17: the headers, the payload\'s form and size, and the Topic and tag', async () => {
  const h = harness({ checkout: oneQuestion() });
  await h.run(); // the bootstrap summary
  h.world.files = {};
  const co = checkoutOf({ base: { 'questions/_TEMPLATE.md': '#\n' }, later: [
    { files: { 'questions/N-made-up.md': '# Ruling needed: A made-up question\n\nMilestone: none (made up)\n' }, date: '2026-10-18T11:00:00+00:00' },
    { files: { 'questions/N-second.md': `# Ruling needed: ${'Long title '.repeat(30)}\n\nMilestone: none (made up)\n` }, date: '2026-10-18T12:01:00+00:00' }] });
  h.checkout = co;
  const r = await h.run();
  assert.equal(r.pushes.length, 1);
  const p = r.pushes[0];
  assert.equal(p.headers.get('ttl'), '86400');
  assert.equal(p.headers.get('urgency'), 'high');
  assert.equal(p.headers.get('content-encoding'), 'aes128gcm');
  assert.match(p.headers.get('topic'), /^[A-Za-z0-9_-]{32}$/);
  assert.match(p.headers.get('authorization'), new RegExp(`^vapid t=[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+, k=${h.vapid.publicB64}$`));
  assert.ok(p.body.length < 4096);
  const pl = r.payloads[0];
  assert.deepEqual(Object.keys(pl), ['web_push', 'notification']);
  assert.equal(pl.web_push, 8030);
  assert.deepEqual(Object.keys(pl.notification), ['title', 'body', 'navigate', 'tag']);
  assert.equal(pl.notification.tag, p.headers.get('topic'));
  assert.equal(pl.notification.title, 'Service-Desk');
  assert.ok(Buffer.byteLength(JSON.stringify(pl)) < 4096);
});

test('J17: minting at most hourly; a BadJwtToken 403 mints anew only once the JWT is an hour old', async () => {
  const h = harness({ checkout: oneQuestion() });
  const jwtOf = (p) => /t=([^,]+),/.exec(p.headers.get('authorization'))[1];
  let answer = { status: 201 };
  h.world.push = () => answer;
  const r1 = await h.run({ test: 'true', after: 20 * MIN });
  const first = jwtOf(r1.pushes[0]);
  // 20 and 40 minutes on: the same JWT.
  const r2 = await h.run({ test: 'true', after: 20 * MIN });
  assert.equal(jwtOf(r2.pushes[0]), first);
  // 40 minutes on, Apple says BadJwtToken: no new JWT (it is not an hour old), the item is kept unsent.
  answer = { status: 403, body: { reason: 'BadJwtToken' } };
  const r3 = await h.run({ test: 'true', after: 20 * MIN });
  assert.equal(r3.pushes.length, 1);
  assert.equal(jwtOf(r3.pushes[0]), first);
  // An hour on: the run mints a new one, and Apple takes it.
  answer = { status: 201 };
  const r4 = await h.run({ test: 'true' });
  assert.notEqual(jwtOf(r4.pushes[0]), first);
  assert.equal(r4.code, 0);
});

test('J17: test: true sends "Test from your desk: notifications work", opening Home, with one tag for every test (EXP-006 case 6)', async () => {
  const h = harness({ checkout: oneQuestion() });
  await h.run();
  const a = await h.run({ test: 'true', after: 1 * MIN });
  const b = await h.run({ test: 'true' });
  assert.deepEqual([a.pushes.length, b.pushes.length], [1, 1]);
  assert.equal(a.payloads[0].notification.body, 'Test from your desk: notifications work');
  // From stage 8 (the notification view amendment, specs/S-001.md:1139-1142: "the sender's tap addresses to `/?open=<key>` and `/`").
  assert.equal(a.payloads[0].notification.navigate, 'https://desk.example.invalid/');
  assert.equal(a.pushes[0].headers.get('topic'), b.pushes[0].headers.get('topic'));
  assert.equal(a.payloads[0].notification.tag, b.payloads[0].notification.tag);
});

test('J17: test: fail makes exactly one request, signed with a key that is not J7\'s, with no retry and no new JWT', async () => {
  const h = harness({ checkout: oneQuestion() });
  h.world.push = () => ({ status: 403, body: { reason: 'VapidPkHashMismatch' } });
  const r = await h.run({ test: 'fail' });
  assert.equal(r.code, 0);
  assert.equal(r.pushes.length, 1);
  const k = /k=([A-Za-z0-9_-]+)$/.exec(r.pushes[0].headers.get('authorization'))[1];
  assert.notEqual(k, h.vapid.publicB64);
  assert.equal(r.wrote, false);
  assert.equal(h.world.issues.length, 1);
  assert.match(h.world.issues[0].body, /^- \(test\) /m);
  // A 5xx answer to test: fail is not retried either.
  h.world.push = () => ({ status: 503 });
  const r2 = await h.run({ test: 'fail' });
  assert.equal(r2.pushes.length, 1);
  assert.equal(h.clock.sleeps.length, 0);
});

test('J17: no log line holds the endpoint, a key, the JWT, the subject or a token', async () => {
  const h = harness({ checkout: oneQuestion(), billingToken: 'made-up-billing-token' });
  const jwts = [];
  h.world.push = (req) => {
    jwts.push(/t=([^,]+),/.exec(req.headers.get('authorization'))[1]);
    return { status: 201 };
  };
  const runs = [await h.run({ test: 'true' }), await h.run({ test: 'fail' }), await h.run({ test: 'usage' }), await h.run()];
  const all = runs.flatMap((r) => r.logs).join('\n');
  const sub = JSON.parse(h.sub.value);
  for (const secret of [sub.endpoint, sub.keys.p256dh, sub.keys.auth, h.stateKey, 'owner@example.invalid', 'made-up-workflow-token',
    'made-up-billing-token', ...jwts, ...h.vapid.pem.split('\n').filter((l) => l.length > 20)]) {
    assert.ok(!all.includes(secret), `a log line holds ${secret.slice(0, 16)}…`);
  }
  assert.ok(runs.every((r) => r.code === 0));
});

test('J17: 413 sends once more with the body cut to 60 characters', async () => {
  const h = harness({ checkout: oneQuestion() });
  await h.run();
  h.checkout = checkoutOf({ base: { 'questions/_TEMPLATE.md': '#\n' }, later: [
    { files: { 'questions/N-made-up.md': '# Ruling needed: A made-up question\n' }, date: '2026-10-18T11:00:00+00:00' },
    { files: { 'questions/N-long.md': `# Ruling needed: ${'A long title '.repeat(20)}\n` }, date: '2026-10-18T12:01:00+00:00' }] });
  let n = 0;
  h.world.push = () => (n++ === 0 ? { status: 413 } : { status: 201 });
  const r = await h.run();
  assert.equal(r.pushes.length, 2);
  assert.ok(Array.from(r.payloads[0].notification.body).length > 60);
  assert.equal(Array.from(r.payloads[1].notification.body).length, 60);
  assert.ok(r.payloads[1].notification.body.endsWith('…'));
});
