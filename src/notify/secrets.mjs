// The sender's first step (spec S-001, J17, AC76): every secret present and in form, never printed;
// then the keys' check, that DESK_VAPID_PRIVATE_KEY's public half equals J7's `push.vapidPublicKey`.

import { parseSubscription, parseVapidKey, decodePublicKey } from './webpush.mjs';

export const SECRET_NAMES = ['DESK_VAPID_PRIVATE_KEY', 'DESK_VAPID_SUBJECT', 'DESK_PUSH_SUBSCRIPTION', 'DESK_NOTIFY_STATE_KEY'];

/** J7's `push`, when in form: { vapidPublicKey, publicRaw, deskUrl } (the address with no trailing `/`), or null. */
export function pushConfig(config) {
  const p = config && config.push;
  if (!p || typeof p !== 'object') return null;
  const publicRaw = decodePublicKey(p.vapidPublicKey);
  if (!publicRaw || typeof p.deskUrl !== 'string') return null;
  let u;
  try {
    u = new URL(p.deskUrl);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' || u.search || u.hash || u.username || u.password) return null;
  return { vapidPublicKey: p.vapidPublicKey, publicRaw, deskUrl: p.deskUrl.replace(/\/+$/, '') };
}

const SUBJECT_RE = /^(mailto:[^\s@]+@[^\s@]+|https:\/\/[^\s]+)$/;

/**
 * Check the run's secrets and J7. Returns { ok: true, secrets } or { ok: false, problem, name },
 * problem 'missing' | 'malformed' | 'keys' | 'config', name the secret's or setting's name only.
 */
export function firstStep(env, config) {
  const push = pushConfig(config);
  if (!push) return { ok: false, problem: 'config', name: 'push in src/config/projects.json' };
  if (!env.GITHUB_TOKEN) return { ok: false, problem: 'missing', name: 'GITHUB_TOKEN' };
  for (const n of SECRET_NAMES) if (!env[n] || !String(env[n]).trim()) return { ok: false, problem: 'missing', name: n };
  const vapid = parseVapidKey(String(env.DESK_VAPID_PRIVATE_KEY));
  if (!vapid) return { ok: false, problem: 'malformed', name: 'DESK_VAPID_PRIVATE_KEY' };
  const subject = String(env.DESK_VAPID_SUBJECT).trim();
  if (!SUBJECT_RE.test(subject)) return { ok: false, problem: 'malformed', name: 'DESK_VAPID_SUBJECT' };
  const subscription = parseSubscription(env.DESK_PUSH_SUBSCRIPTION);
  if (!subscription) return { ok: false, problem: 'malformed', name: 'DESK_PUSH_SUBSCRIPTION' };
  const stateKey = String(env.DESK_NOTIFY_STATE_KEY).trim();
  if (stateKey.length < 32 || /\s/.test(stateKey)) return { ok: false, problem: 'malformed', name: 'DESK_NOTIFY_STATE_KEY' };
  if (!vapid.publicRaw.equals(push.publicRaw)) return { ok: false, problem: 'keys', name: 'DESK_VAPID_PRIVATE_KEY' };
  return { ok: true, secrets: { vapid, subject, subscription, subscriptionRaw: String(env.DESK_PUSH_SUBSCRIPTION).trim(), stateKey,
    token: String(env.GITHUB_TOKEN), billingToken: env.DESK_BILLING_TOKEN ? String(env.DESK_BILLING_TOKEN).trim() : null, push } };
}
