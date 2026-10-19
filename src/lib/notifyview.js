// The desk's side of notifications (spec S-001, AC74's tap, AC75's control and J19's subscribing,
// AC78's line). Pure, apart from the browser objects the page hands in (window, navigator,
// Notification), so the tests drive it with fakes. No network: the desk sends the subscription
// nowhere (J19); the usage figures arrive in the blob call (J21) and are worded here.

import { parseWaitKey, flaggedWait, ACTIONS_USAGE_OPEN } from './waiting.js';
import { computeUsage, dollars } from './usage.js';

/** base64url (no padding) → bytes, or null when it is not base64url. */
export function b64urlBytes(s) {
  if (typeof s !== 'string' || !/^[A-Za-z0-9_-]*$/.test(s) || s.length % 4 === 1) return null;
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  let bin;
  try {
    bin = atob(b64);
  } catch {
    return null;
  }
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** J7's `push.vapidPublicKey` (J19): 87 characters of base64url, 65 bytes starting 0x04; else null. */
export function decodeVapidKey(s) {
  if (typeof s !== 'string' || s.length !== 87) return null;
  const b = b64urlBytes(s);
  return b && b.length === 65 && b[0] === 0x04 ? b : null;
}

// ---------------------------------------------------------------------------
// AC74: the tap's address, `<deskUrl>/?open=<key>`

/** What `?open=` asks for: { kind: 'item', key, project, itemKind, id } | { kind: 'usage' } | null. */
export function openTarget(search) {
  let v = null;
  try {
    v = new URLSearchParams(String(search || '')).get('open');
  } catch {
    v = null;
  }
  if (v == null || v === '') return null;
  if (v === ACTIONS_USAGE_OPEN) return { kind: 'usage' };
  const k = parseWaitKey(v);
  return k ? { kind: 'item', key: v, project: k.project, itemKind: k.kind, id: k.id } : { kind: 'bad', key: v };
}

export const OPENED_WORDS = 'Opened from a notification';
export const GONE_WORDS = 'That no longer waits on you';
export const CANT_READ_WORDS = `${OPENED_WORDS}: the desk can't read this project just now`;

/**
 * AC74's tap rules, shared by both views (from 2026-10-19 the tap opens the sandbox, which draws
 * them in its own design). input: { target (openTarget's), projects (J7's), box(name) → { read,
 * model } | null, settled(name) → whether AC77's closed read for the arrival has answered or
 * failed }. Returns one of:
 * - { kind: 'wait' }: still reading the project, or waiting for that closed read: decide later;
 * - { kind: 'usage' }: AC78's line;
 * - { kind: 'item', project, f }: the flagged item that waits;
 * - { kind: 'held', project, row }: a question still held or being recorded (AC77): shown as such,
 *   never as "That no longer waits on you" (draft 8);
 * - { kind: 'cant-read', project }: the project can't be read just now: never claimed stopped;
 * - { kind: 'gone', project|null }: it truly stopped waiting (or names no project).
 */
export function tapDecision({ target, projects, box, settled }) {
  if (!target) return null;
  if (target.kind === 'usage') return { kind: 'usage' };
  const project = target.kind === 'item' ? (projects || []).find((p) => p && p.name === target.project) : null;
  if (!project) return { kind: 'gone', project: null };
  const b = box(project.name);
  if (!b || !b.read || b.read.read === 'checking') return { kind: 'wait' };
  if (settled && !settled(project.name)) return { kind: 'wait' };
  const m = b.model;
  const f = m && Array.isArray(m.flagged) ? m.flagged.find((x) => {
    const w = flaggedWait(project.name, x);
    return w && w.key === target.key;
  }) : null;
  if (f) return { kind: 'item', project, f };
  const row = target.itemKind === 'question' && m && Array.isArray(m.asking) ? m.asking.find((a) => a.path === target.id) : null;
  if (row) return { kind: 'held', project, row };
  if (b.read.read === 'cant-read') return { kind: 'cant-read', project };
  return { kind: 'gone', project };
}

/**
 * The same address in the sandbox view (2026-10-19, the owner's ruling "A. Go live now, switch later
 * (Recommended)"): `sandbox` first, every other parameter and the hash kept.
 */
export function sandboxAddress(pathname, search, hash = '') {
  const rest = String(search || '').replace(/^\?/, '').split('&').filter((x) => x && x !== 'sandbox' && !x.startsWith('sandbox='));
  return `${pathname || '/'}?sandbox${rest.length ? `&${rest.join('&')}` : ''}${hash || ''}`;
}

// ---------------------------------------------------------------------------
// AC75: the "Notifications" control

export const NOTIFY_STORE_KEY = 'desk-notify-v1';
export const NOTIFY_WORDS = Object.freeze({
  'not-standalone': 'To get notifications, add the desk to your Home Screen: Share, then Add to Home Screen, then open it from there',
  'no-key': "Notifications aren't set up yet",
  ask: 'Turn on notifications',
  denied: 'Notifications are off for the desk. Turn them on in Settings, Notifications, Service Desk',
  copy: 'Notifications are on for this phone. Copy this value into GitHub:',
  on: 'On for this phone',
  checking: 'Notifications: checking this phone…',
});
export const COPY_DONE_WORDS = "I've added it to GitHub";
export const SHOW_AGAIN_WORDS = 'Show the value again';
export const SEND_TEST_WORDS = 'Send a test from GitHub';

/** Setup N6's steps, for the value the owner copies (J19: the same value in both projects). */
export function copySteps(config) {
  const names = (config.projects || []).map((p) => p.name);
  const first = names[0] || 'Service-Desk';
  const rest = names.slice(1);
  return [
    `In GitHub, open ${first}: Settings, Environments, notify, then Add environment secret.`,
    'Name it DESK_PUSH_SUBSCRIPTION and paste the value (if it is there already, update it instead).',
    ...rest.map((n) => `Do the same in ${n}'s notify Environment.`),
    `Then tap "${COPY_DONE_WORDS}".`,
  ];
}

/** Setup N8's steps, for "Send a test from GitHub". */
export function testSteps(config) {
  const p = (config.projects || [])[0];
  return {
    link: p ? `https://github.com/${p.repo}/actions/workflows/desk-notify.yml` : null,
    steps: ['In GitHub: Actions, desk-notify, Run workflow, with test set to true.',
      'When the run has finished, this phone shows "Test from your desk: notifications work"; tap it.',
      'If no run appears within a minute, run it again.'],
  };
}

/**
 * The control's state (AC75), in the spec's order. env: { standalone, key (J7's public key or
 * null), permission ('default' | 'granted' | 'denied' | null when the browser has no
 * notifications), subscribed (true | false | null while unknown), copied (marked on this device) }.
 */
export function notifyState(env) {
  if (!env.standalone) return 'not-standalone';
  if (!decodeVapidKey(env.key)) return 'no-key';
  if (env.permission === 'denied') return 'denied';
  if (env.permission === 'granted' && env.subscribed === null) return 'checking';
  if (env.permission === 'granted' && env.subscribed) return env.copied ? 'on' : 'copy';
  return 'ask';
}

/** Whether Home's top line still shows the control: until notifications are on for this device (AC75). */
export const onTopLine = (state) => state !== 'on';

/** Whether the page runs from the Home Screen (`display-mode: standalone`, or iOS's navigator.standalone). */
export function isStandalone(win, nav) {
  try {
    if (win && typeof win.matchMedia === 'function' && win.matchMedia('(display-mode: standalone)').matches) return true;
  } catch {
    // no media queries: fall through
  }
  return Boolean(nav && nav.standalone === true);
}

/** The browser's notification permission, or null when it offers none. */
export function permissionOf(Notif) {
  try {
    return Notif && typeof Notif.permission === 'string' ? Notif.permission : null;
  } catch {
    return null;
  }
}

const reasonOf = (e) => {
  try {
    const s = e && (e.message || e.name);
    return s ? String(s).slice(0, 200) : 'no reason given';
  } catch {
    return 'no reason given';
  }
};
export const FAIL_LEAD = "The desk couldn't turn notifications on: ";
export const SW_FALLBACK = " (the desk's service worker, /sw.js, didn't load: if Cloudflare Access answered with its sign-in page, EXP-006's fallback is Setup N10's Access exception)";

/** The subscription the browser holds now, or null (no permission asked: J19's "Show the value again"). */
export async function currentSubscription(win, nav) {
  try {
    if (win && win.pushManager && typeof win.pushManager.getSubscription === 'function') return await win.pushManager.getSubscription();
    if (nav && nav.serviceWorker && typeof nav.serviceWorker.getRegistration === 'function') {
      const reg = await nav.serviceWorker.getRegistration('/');
      return reg && reg.pushManager ? await reg.pushManager.getSubscription() : null;
    }
  } catch {
    return null;
  }
  return null;
}

/** J19's value: the subscription as JSON, its endpoint and keys (V2). */
export const subscriptionValue = (sub) => JSON.stringify(sub);

/**
 * "Turn on notifications" (J19). Call it only from the tap's handler: it asks iOS for permission
 * (the only place the desk does), then subscribes through Declarative Web Push where the page
 * offers `window.pushManager`, else through the service worker `/sw.js`, with `userVisibleOnly`
 * and J7's public key. Returns { ok: true, value, path } or { ok: false, state, words }.
 */
export async function turnOn({ win, nav, Notif, key }) {
  const applicationServerKey = decodeVapidKey(key);
  if (!applicationServerKey) return { ok: false, state: 'no-key', words: NOTIFY_WORDS['no-key'] };
  if (!Notif || typeof Notif.requestPermission !== 'function') {
    return { ok: false, state: 'error', words: `${FAIL_LEAD}this browser offers no notifications` };
  }
  let perm;
  try {
    perm = await Notif.requestPermission();
  } catch (e) {
    return { ok: false, state: 'error', words: `${FAIL_LEAD}${reasonOf(e)}` };
  }
  if (perm === 'denied') return { ok: false, state: 'denied', words: NOTIFY_WORDS.denied };
  if (perm !== 'granted') return { ok: false, state: 'ask', words: `${FAIL_LEAD}permission was not given` };
  const opts = { userVisibleOnly: true, applicationServerKey };
  try {
    if (win && win.pushManager && typeof win.pushManager.subscribe === 'function') {
      const sub = await win.pushManager.subscribe(opts);
      return { ok: true, value: subscriptionValue(sub), path: 'declarative' };
    }
    if (!nav || !nav.serviceWorker || typeof nav.serviceWorker.register !== 'function') {
      return { ok: false, state: 'error', words: `${FAIL_LEAD}this browser offers no push` };
    }
    let reg;
    try {
      reg = await nav.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (e) {
      return { ok: false, state: 'error', words: `${FAIL_LEAD}${reasonOf(e)}${SW_FALLBACK}`, swScript: true };
    }
    if (nav.serviceWorker.ready && typeof nav.serviceWorker.ready.then === 'function') reg = (await nav.serviceWorker.ready) || reg;
    const sub = await reg.pushManager.subscribe(opts);
    return { ok: true, value: subscriptionValue(sub), path: 'service-worker' };
  } catch (e) {
    return { ok: false, state: 'error', words: `${FAIL_LEAD}${reasonOf(e)}` };
  }
}

// ---------------------------------------------------------------------------
// AC78: "GitHub Actions this month"

export const USAGE_TITLE = 'GitHub Actions this month';
export const USAGE_WORDS = Object.freeze({
  'not-configured': 'GitHub Actions use: not set up yet (Setup N12)',
  refused: "GitHub Actions use: can't be read: the usage token was refused, or GitHub doesn't report Actions use for this account",
  unavailable: 'GitHub Actions use: not available just now',
  'not-reported': "GitHub doesn't report Actions use to the desk for this account. Turn on GitHub's own e-mails at 90% and 100% of your included minutes (Setup N11).",
  reading: 'GitHub Actions use: reading…',
});
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const num = (n) => Number(n).toLocaleString('en-US');

/** The figures' words for one good read (AC78). */
function figures(cfg, read, nowMs, tz, whenText) {
  const u = computeUsage(read, cfg);
  if (u.state === 'not-reported') return { state: 'not-reported', words: USAGE_WORDS['not-reported'] };
  if (u.state !== 'ok') return null;
  const m = num(u.minutes);
  const n = num(u.included);
  let words = u.past ? `${m} minutes: past your ${n} included minutes (${u.percent}%)` : `${m} of ${n} included minutes (${u.percent}%)`;
  if (u.mayBeTooHigh) words += " (GitHub didn't name the repository for some minutes, so this may be too high)";
  let estimate = null;
  if (u.estimateCents > 0) {
    estimate = `Estimated cost so far this month: ${u.atLeast ? 'at least ' : ''}${dollars(u.estimateCents)}`
      + `${u.fromDaily ? ' (from the daily report)' : ''}${u.pricesAssumed ? ' (some prices assumed)' : ''}`;
  }
  const p = read.period;
  const next = Date.UTC(p.m === 12 ? p.y + 1 : p.y, p.m === 12 ? 0 : p.m, 1);
  return { state: 'ok', month: MONTHS[p.m - 1], words, bar: u.bar, percent: u.percent, estimate,
    estimateNote: estimate ? "an estimate from GitHub's usage figures, which may lag; GitHub bills the final amount on your billing date" : null,
    reset: `Resets at the start of each month (UTC): ${whenText(new Date(next), new Date(nowMs), tz)}`,
    asOfMs: Date.parse(read.asOf) };
}

/**
 * The line's view (AC78). cfg: J7's `actionsUsage` (or undefined); reads: { current (the latest
 * answer, or null before the first), lastGood (this opening's last good answer, or null) }.
 * Returns { state, words, month?, bar?, estimate?, estimateNote?, reset?, asOf?, stale? }.
 */
export function usageView({ cfg, reads, nowMs, tz, whenText }) {
  if (!cfg) return { state: 'not-configured', words: USAGE_WORDS['not-configured'] };
  if (cfg.reported === false) return { state: 'not-reported', words: USAGE_WORDS['not-reported'] };
  const cur = reads && reads.current;
  if (!cur) return { state: 'reading', words: USAGE_WORDS.reading };
  const asOf = (ms) => `as of ${whenText(new Date(ms), new Date(nowMs), tz)}`;
  if (cur.state === 'ok') {
    const f = figures(cfg, cur, nowMs, tz, whenText);
    if (f) return { ...f, asOf: asOf(f.asOfMs || nowMs) };
  }
  if (cur.state === 'not-reported') return { state: 'not-reported', words: USAGE_WORDS['not-reported'] };
  if (cur.state === 'not-configured') return { state: 'not-configured', words: USAGE_WORDS['not-configured'] };
  // A failed refresh: this opening's last good figures stay, marked so; never a figure without its "as of".
  const good = reads.lastGood ? figures(cfg, reads.lastGood, nowMs, tz, whenText) : null;
  if (good && good.state === 'ok') return { ...good, asOf: `${asOf(good.asOfMs)}; couldn't refresh`, stale: true };
  if (cur.state === 'refused' || cur.state === 'not-found') return { state: 'refused', words: USAGE_WORDS.refused };
  return { state: 'unavailable', words: USAGE_WORDS.unavailable };
}

// ---------------------------------------------------------------------------
// AC77: before an answer link opens, the desk makes sure the item is still open

export const RECHECK_WORDS = Object.freeze({
  checking: 'Checking that it still waits on you…',
  failed: "The desk couldn't check just now",
  anyway: 'Open GitHub anyway',
  recording: 'Your answer is being recorded',
  held: 'Being asked in your session: answer there',
});

/**
 * What the re-read found (AC77), from the model built after it. target: { kind: 'question', name }
 * | { kind: 'card', path }. Returns { kind: 'open' } | { kind: 'answered', words } |
 * { kind: 'recording', words, pr } | { kind: 'held', words } | { kind: 'gone', words }.
 */
export function recheckOutcome(model, target) {
  if (!model) return { kind: 'gone', words: GONE_WORDS };
  if (target.kind === 'question') {
    const r = model.rulings && model.rulings[target.name];
    if (r) return { kind: 'answered', words: `Already answered: ${r.line1 || (r.ruling ? `Ruling: ${r.ruling}` : 'its ruling is on the default branch')}` };
    if ((model.flagged || []).some((f) => f.kind === 'question' && f.question.name === target.name)) return { kind: 'open' };
    const a = (model.asking || []).find((x) => x.name === target.name);
    if (a && a.state === 'recording') return { kind: 'recording', words: RECHECK_WORDS.recording, pr: a.pr };
    if (a) return { kind: 'held', words: RECHECK_WORDS.held };
    return { kind: 'gone', words: GONE_WORDS };
  }
  const done = model.answeredCards && model.answeredCards[target.path];
  if (done) return { kind: 'answered', words: `Already answered: ${done.verdict || 'its answer is on the default branch'}` };
  if ((model.flagged || []).some((f) => f.kind === 'card' && f.card.path === target.path)) return { kind: 'open' };
  return { kind: 'gone', words: GONE_WORDS };
}
