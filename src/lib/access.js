// Cloudflare Access check for the desk function (spec S-001, J8; AC13).
// Every request must carry a `Cf-Access-Jwt-Assertion` that is signed by one of the team's
// public keys (RS256), unexpired, for one of the audience tags in ACCESS_AUD, and for the
// owner's email. There is no other path: no test-only exception, no service tokens.
//
// Settings (Pages environment variables, set by the owner): OWNER_EMAIL, ACCESS_TEAM_DOMAIN (a
// bare host such as team.cloudflareaccess.com) and ACCESS_AUD (one or more tags, comma-separated).
// The keys are fetched at most once per invocation, and not at all while this isolate holds them.
// A token whose key id the isolate doesn't hold triggers one refetch (keys rotated), then 403.

let keyCache = null; // { team, keys: Map(kid → CryptoKey) }

/** Tests only: forget the isolate's keys. */
export function _resetKeyCache() {
  keyCache = null;
}

function b64urlBytes(s) {
  if (typeof s !== 'string' || !/^[A-Za-z0-9_-]*$/.test(s)) throw new Error('bad base64url');
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlJson(s) {
  return JSON.parse(new TextDecoder().decode(b64urlBytes(s)));
}

/** The settings, or null when any is missing or malformed (then every request is refused). */
export function accessSettings(env) {
  const email = typeof env.OWNER_EMAIL === 'string' ? env.OWNER_EMAIL.trim().toLowerCase() : '';
  const team = typeof env.ACCESS_TEAM_DOMAIN === 'string' ? env.ACCESS_TEAM_DOMAIN.trim() : '';
  const auds = typeof env.ACCESS_AUD === 'string'
    ? env.ACCESS_AUD.split(',').map((a) => a.trim()).filter(Boolean) : [];
  if (!email || !auds.length || !/^[A-Za-z0-9.-]+$/.test(team)) return null;
  return { email, team, auds };
}

async function loadKeys(team, fetchImpl) {
  const res = await fetchImpl(`https://${team}/cdn-cgi/access/certs`, { redirect: 'manual' });
  if (!res.ok) throw new Error(`certs answered ${res.status}`);
  const body = await res.json();
  const keys = new Map();
  for (const jwk of (body && body.keys) || []) {
    if (!jwk || jwk.kty !== 'RSA' || typeof jwk.kid !== 'string') continue;
    const key = await crypto.subtle.importKey('jwk', { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    keys.set(jwk.kid, key);
  }
  return keys;
}

/**
 * Check the request's Access JWT. Returns { ok: true, email } or { ok: false, why, keyFetches }.
 * `keyFetches` counts outbound requests made (0 or 1).
 */
export async function checkAccess(request, env, { fetch: fetchImpl = fetch, now = Date.now } = {}) {
  let keyFetches = 0;
  const fail = (why) => ({ ok: false, why, keyFetches });
  const settings = accessSettings(env || {});
  if (!settings) return fail('access settings missing');
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return fail('no token');
  const parts = token.split('.');
  if (parts.length !== 3) return fail('malformed token');
  let header;
  let payload;
  let sig;
  try {
    header = b64urlJson(parts[0]);
    payload = b64urlJson(parts[1]);
    sig = b64urlBytes(parts[2]);
  } catch {
    return fail('malformed token');
  }
  if (!header || header.alg !== 'RS256' || typeof header.kid !== 'string') return fail('wrong algorithm');
  if (!payload || typeof payload !== 'object') return fail('malformed token');

  // Claims first: they need no key, so a stale or foreign token costs no key fetch.
  const nowSec = Math.floor(now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) return fail('expired');
  if (typeof payload.nbf === 'number' && payload.nbf > nowSec + 60) return fail('not yet valid');
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.some((a) => typeof a === 'string' && settings.auds.includes(a))) return fail('wrong audience');
  if (typeof payload.email !== 'string' || payload.email.trim().toLowerCase() !== settings.email) {
    return fail('wrong email');
  }

  // Signature, against the team's public keys.
  if (!keyCache || keyCache.team !== settings.team) keyCache = { team: settings.team, keys: new Map() };
  let key = keyCache.keys.get(header.kid);
  if (!key) {
    try {
      keyFetches++;
      keyCache.keys = await loadKeys(settings.team, fetchImpl);
    } catch {
      return fail('keys unavailable');
    }
    key = keyCache.keys.get(header.kid);
    if (!key) return fail('unknown key');
  }
  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  let valid = false;
  try {
    valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, data);
  } catch {
    valid = false;
  }
  if (!valid) return fail('bad signature');
  return { ok: true, email: settings.email, keyFetches };
}
