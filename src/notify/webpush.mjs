// Web Push from the sender to the desk on the phone (spec S-001, J17): VAPID (RFC 8292) with an
// ES256 JWT, the payload encrypted with `aes128gcm` (RFC 8291), in the Declarative Web Push form,
// with Node's built-in crypto only.

import { createECDH, createHmac, createCipheriv, createPrivateKey, createPublicKey, generateKeyPairSync, randomBytes, sign } from 'node:crypto';

export const TTL = '86400';
export const URGENCY = 'high';
export const RECORD_SIZE = 4096;
export const MAX_PAYLOAD = 4096;
export const JWT_EXP_MS = 2 * 3600e3;
export const JWT_REFRESH_MS = 60 * 60e3;
export const BODY_CUT = 140;
export const BODY_CUT_413 = 60;

/** base64url with no padding, strictly: null when the text is not in that form. */
export function b64urlDecode(s) {
  if (typeof s !== 'string' || !/^[A-Za-z0-9_-]+$/.test(s)) return null;
  const buf = Buffer.from(s, 'base64url');
  return buf.toString('base64url') === s ? buf : null;
}

/** A J7 public key: 65 bytes starting 0x04, as 87 base64url characters; the bytes, or null. */
export function decodePublicKey(s) {
  const buf = b64urlDecode(s);
  return buf && s.length === 87 && buf.length === 65 && buf[0] === 0x04 ? buf : null;
}

/**
 * DESK_PUSH_SUBSCRIPTION (J17, J19's value): `{"endpoint", "expirationTime", "keys": {"p256dh",
 * "auth"}}`. Returns { endpoint, origin, p256dh, auth } or null when it isn't that form.
 */
export function parseSubscription(raw) {
  let v;
  try {
    v = JSON.parse(String(raw));
  } catch {
    return null;
  }
  if (!v || typeof v !== 'object' || Array.isArray(v) || typeof v.endpoint !== 'string') return null;
  if (!(v.expirationTime === undefined || v.expirationTime === null || (typeof v.expirationTime === 'number' && Number.isFinite(v.expirationTime)))) return null;
  let url;
  try {
    url = new URL(v.endpoint);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  const k = v.keys;
  if (!k || typeof k !== 'object') return null;
  const p256dh = b64urlDecode(k.p256dh);
  const auth = b64urlDecode(k.auth);
  if (!p256dh || p256dh.length !== 65 || p256dh[0] !== 0x04 || !auth || auth.length !== 16) return null;
  try {
    createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: p256dh.subarray(1, 33).toString('base64url'), y: p256dh.subarray(33).toString('base64url') }, format: 'jwk' });
  } catch {
    return null; // not a point on the curve
  }
  return { endpoint: v.endpoint, origin: url.origin, p256dh, auth };
}

/** The raw 65-byte public half of a P-256 key object. */
export function rawPublicKey(keyObject) {
  const jwk = createPublicKey(keyObject).export({ format: 'jwk' });
  return Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, 'base64url'), Buffer.from(jwk.y, 'base64url')]);
}

/** DESK_VAPID_PRIVATE_KEY (a PEM of a P-256 key, Setup N1) → { privateKey, publicRaw }, or null. */
export function parseVapidKey(pem) {
  if (typeof pem !== 'string' || !pem.includes('-----BEGIN')) return null;
  let key;
  try {
    key = createPrivateKey({ key: pem, format: 'pem' });
  } catch {
    return null;
  }
  if (key.asymmetricKeyType !== 'ec' || (key.asymmetricKeyDetails && key.asymmetricKeyDetails.namedCurve !== 'prime256v1')) return null;
  return { privateKey: key, publicRaw: rawPublicKey(key) };
}

/** A throwaway VAPID key pair made in the run (J17's `test: fail`). */
export function throwawayVapidKey() {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  return { privateKey, publicRaw: rawPublicKey(privateKey) };
}

/** A VAPID JWT (RFC 8292): ES256, `aud` the endpoint's origin, `exp` 2 hours on, `sub` the subject. */
export function mintJwt({ privateKey, aud, sub, nowMs }) {
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const head = enc({ typ: 'JWT', alg: 'ES256' });
  const claims = enc({ aud, exp: Math.floor((nowMs + JWT_EXP_MS) / 1000), sub });
  const sig = sign('sha256', Buffer.from(`${head}.${claims}`), { key: privateKey, dsaEncoding: 'ieee-p1363' });
  return { jwt: `${head}.${claims}.${sig.toString('base64url')}`, mintedAt: new Date(nowMs).toISOString(), aud };
}

const hmac = (key, data) => createHmac('sha256', key).update(data).digest();

/**
 * Encrypt a payload for a subscription (RFC 8291, `aes128gcm`, one record). `opts.asPrivate` and
 * `opts.salt` fix the sender's key and the salt, for the RFC's worked example only.
 */
export function encrypt(plaintext, sub, opts = {}) {
  const ecdh = createECDH('prime256v1');
  if (opts.asPrivate) ecdh.setPrivateKey(opts.asPrivate);
  else ecdh.generateKeys();
  const asPublic = ecdh.getPublicKey();
  const secret = ecdh.computeSecret(sub.p256dh);
  const salt = opts.salt || randomBytes(16);
  const prkKey = hmac(sub.auth, secret);
  const ikm = hmac(prkKey, Buffer.concat([Buffer.from('WebPush: info\0'), sub.p256dh, asPublic, Buffer.from([1])]));
  const prk = hmac(salt, ikm);
  const cek = hmac(prk, Buffer.concat([Buffer.from('Content-Encoding: aes128gcm\0'), Buffer.from([1])])).subarray(0, 16);
  const nonce = hmac(prk, Buffer.concat([Buffer.from('Content-Encoding: nonce\0'), Buffer.from([1])])).subarray(0, 12);
  const c = createCipheriv('aes-128-gcm', cek, nonce);
  const ct = Buffer.concat([c.update(Buffer.concat([Buffer.from(plaintext), Buffer.from([2])])), c.final(), c.getAuthTag()]);
  const rs = Buffer.alloc(4);
  rs.writeUInt32BE(RECORD_SIZE);
  return Buffer.concat([salt, rs, Buffer.from([asPublic.length]), asPublic, ct]);
}

/** Cut a text to `n` characters (code points), ending "…" when cut. */
export function cut(text, n) {
  const chars = Array.from(String(text));
  return chars.length <= n ? chars.join('') : `${chars.slice(0, n - 1).join('')}…`;
}

/** The Declarative Web Push payload (J17), which the service worker reads too: the tag inside `notification`. */
export function payload({ title, body, navigate, tag }) {
  return JSON.stringify({ web_push: 8030, notification: { title, body, navigate, tag } });
}

/** What an answer means (J17, AC76): sent, later (retry), gone, refused, too-large, or other. */
export function answerKind(status) {
  if (status >= 200 && status < 300) return 'sent';
  if (status === 429 || status >= 500 || status === 0) return 'later';
  if (status === 404 || status === 410) return 'gone';
  if (status === 400 || status === 401 || status === 403) return 'refused';
  if (status === 413) return 'too-large';
  return 'other';
}

/**
 * One push request. input: { fetch, sub, jwt, publicB64, topic, body (the payload text) }.
 * Returns { status, kind, reason } (Apple's JSON `reason` when given, else null). It never
 * logs and never throws.
 */
export async function pushOnce(input) {
  const encrypted = encrypt(Buffer.from(input.body, 'utf8'), input.sub);
  let res;
  try {
    res = await input.fetch(input.sub.endpoint, { method: 'POST', redirect: 'manual', body: encrypted, headers: {
      TTL, Urgency: URGENCY, Topic: input.topic, 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream',
      Authorization: `vapid t=${input.jwt}, k=${input.publicB64}` } });
  } catch {
    return { status: 0, kind: 'later', reason: null };
  }
  let reason = null;
  if (res.status >= 400) {
    try {
      const text = (await res.text()).slice(0, 2048);
      const v = JSON.parse(text);
      if (v && typeof v.reason === 'string' && /^[A-Za-z0-9_ -]{1,64}$/.test(v.reason)) reason = v.reason;
    } catch {
      reason = null;
    }
  }
  return { status: res.status, kind: answerKind(res.status), reason };
}
