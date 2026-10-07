// Shared helpers for the desk's tests: fixtures, a fake fetch, Access JWTs signed with a test key,
// and a fake clock that drives the page's real scheduler. No network, no tokens.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const FIX = join(HERE, 'fixtures');
export const SRC = join(HERE, '..', '..', 'src');

export function fixture(rel) {
  return readFileSync(join(FIX, rel), 'utf8');
}

/** A recorded GitHub response (fixtures/github/<name>.json): { status, headers, body }. */
export function recorded(name) {
  return JSON.parse(fixture(`github/${name}.json`));
}

export const CONFIG = JSON.parse(readFileSync(join(SRC, 'config', 'projects.json'), 'utf8'));
export const SD = CONFIG.projects.find((p) => p.name === 'Service-Desk');
export const POOM = CONFIG.projects.find((p) => p.name === 'Personal-Org-Operating-Model');

/** A Response from a recorded fixture or a plain description. */
export function response({ status = 200, headers = {}, body = '' }) {
  const h = new Headers();
  for (const [k, v] of Object.entries(headers)) h.set(k, v);
  return new Response(status === 304 || status === 204 ? null : body, { status, headers: h });
}

/**
 * A fake fetch. routes: [(url, init) → response description | undefined]. Records every call as
 * { url, headers, at }. Tracks the most requests in flight at once.
 */
export function fakeFetch(routes) {
  const calls = [];
  let inFlight = 0;
  const f = async (url, init = {}) => {
    const headers = new Headers(init.headers || {});
    calls.push({ url: String(url), headers, init });
    inFlight++;
    f.maxInFlight = Math.max(f.maxInFlight, inFlight);
    try {
      await new Promise((r) => setImmediate(r));
      for (const route of routes) {
        const out = route(String(url), init, headers);
        if (out === 'throw') throw new TypeError('network failure');
        if (out) return response(out);
      }
      return response({ status: 599, body: `no route for ${url}` });
    } finally {
      inFlight--;
    }
  };
  f.calls = calls;
  f.maxInFlight = 0;
  return f;
}

// ---------------------------------------------------------------------------
// Access JWTs (J8), signed with a key made for the test run.

const b64url = (bytes) => Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function makeKey(kid = 'kid-1') {
  const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  return { kid, privateKey: pair.privateKey, jwk: { kty: 'RSA', kid, n: jwk.n, e: jwk.e, alg: 'RS256', use: 'sig' } };
}

export async function signJwt(key, claims, header = {}) {
  const head = b64url(Buffer.from(JSON.stringify({ alg: 'RS256', kid: key.kid, typ: 'JWT', ...header })));
  const body = b64url(Buffer.from(JSON.stringify(claims)));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key.privateKey, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(new Uint8Array(sig))}`;
}

export const ENV = {
  OWNER_EMAIL: 'owner@example.com',
  ACCESS_TEAM_DOMAIN: 'team.cloudflareaccess.com',
  ACCESS_AUD: 'aud-tag-1',
  GITHUB_READ_TOKEN: 'test-read-token',
};
export const NOW = Date.parse('2026-10-06T22:00:00Z');

export function goodClaims(over = {}) {
  return { aud: ['aud-tag-1'], email: 'owner@example.com', exp: Math.floor(NOW / 1000) + 3600,
    iat: Math.floor(NOW / 1000) - 60, iss: 'https://team.cloudflareaccess.com', ...over };
}

export function certsRoute(keys) {
  return (url) => (url === 'https://team.cloudflareaccess.com/cdn-cgi/access/certs'
    ? { status: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keys: keys.map((k) => k.jwk) }) }
    : undefined);
}

export function request(path, { method = 'POST', jwt, contentType = 'application/json', origin, body } = {}) {
  const headers = {};
  if (jwt) headers['Cf-Access-Jwt-Assertion'] = jwt;
  if (contentType) headers['Content-Type'] = contentType;
  if (origin) headers.Origin = origin;
  return new Request(`https://service-desk-preview.pages.dev${path}`, {
    method, headers, body: method === 'GET' || method === 'HEAD' ? undefined : (typeof body === 'string' ? body : JSON.stringify(body || {})),
  });
}

// ---------------------------------------------------------------------------
// A fake clock with timers, for the page's scheduler.

export function fakeClock(start) {
  let now = start;
  let seq = 0;
  const timers = new Map();
  const clock = {
    now: () => now,
    setTimeout(fn, ms) {
      const id = ++seq;
      timers.set(id, { at: now + Math.max(0, ms), fn, id });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    async flush() {
      for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r));
    },
    /** Run every timer due up to `until`, in time order, letting each cycle's promises settle. */
    async runUntil(until) {
      for (;;) {
        let next = null;
        for (const t of timers.values()) if (t.at <= until && (!next || t.at < next.at || (t.at === next.at && t.id < next.id))) next = t;
        if (!next) break;
        timers.delete(next.id);
        now = next.at;
        next.fn();
        await clock.flush();
      }
      now = until;
      await clock.flush();
    },
    pending: () => timers.size,
  };
  return clock;
}

/** Build a tree JSON as GitHub sends it, from { path: { sha, size } }. */
export function treeJson(files, truncated = false) {
  return JSON.stringify({
    sha: 'f'.repeat(40), truncated,
    tree: Object.entries(files).map(([path, e]) => ({ path, mode: '100644', type: 'blob', sha: e.sha, size: e.size || 10 })),
  });
}

let shaSeq = 0;
/** A fresh 40-hex sha. */
export function sha() {
  shaSeq++;
  return shaSeq.toString(16).padStart(40, '0');
}
