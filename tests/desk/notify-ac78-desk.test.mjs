// ac-test: S-001/AC78 — the page's side (the sender's is notify-ac78-j21.test.mjs): the line "GitHub
// Actions this month" and its bar, from fake function answers; the can't-be-read and "Not reported"
// words; the last good figures kept on a failed refresh; "as of"; the reset line; the page's reads
// per opening; the line not counted and "Quiet" unchanged.
// join-test: S-001/J21 — the function's read in the blob call with GITHUB_BILLING_TOKEN, never the
// read token: the kept fields only, the token in no answer; no read while `reported` is false.
// Every billing answer here is MADE UP, in the form GitHub's REST reference gives (Q-015's documented
// fields), written inline; no real billing figure is in this public repository.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../../src/lib/api.js';
import { _resetKeyCache } from '../../src/lib/access.js';
import { readUsage } from '../../src/lib/usage.js';
import { createDesk } from '../../src/lib/scheduler.js';
import { createStore } from '../../src/lib/store.js';
import { usageView, USAGE_WORDS } from '../../src/lib/notifyview.js';
import { whenText } from '../../src/lib/timefmt.js';
import { makeKey, signJwt, goodClaims, certsRoute, request, fakeFetch, ENV, NOW, fakeClock, fixture, CONFIG, withUsage } from './helpers.mjs';
import { repo, fakeServer } from './fake-desk.mjs';
import { loadApp, findAll } from './page-harness.mjs';
import { loadSandbox, byClass, findAll as sbFindAll } from './sandbox-helpers.mjs';

const CFG = { account: 'shumpmaster', includedMinutes: 3000 };
const TZ = 'America/Chicago';
const OCT2 = Date.parse('2026-10-02T17:00:00Z');
const OCT1 = Date.parse('2026-10-01T17:00:00Z');
const uItem = (o) => ({ date: '2026-10-02T00:00:00Z', product: 'Actions', sku: 'Actions Linux', quantity: 0, unitType: 'minutes', pricePerUnit: 0.006,
  grossAmount: 0, discountAmount: 0, netAmount: 0, repositoryName: 'shumpmaster/Personal-Org-Operating-Model', ...o });
const sItem = (o) => ({ product: 'Actions', sku: 'actions_linux', unitType: 'minutes', pricePerUnit: 0.006, netQuantity: 0, netAmount: 0, ...o });

/** A made-up billing API answering the three reads. */
function billing({ summary = { usageItems: [] }, usage = { usageItems: [] }, repos = [{ name: 'Service-Desk', private: false, visibility: 'public' }], statuses = {} } = {}) {
  const calls = [];
  const f = async (url, init) => {
    const u = new URL(url);
    calls.push({ url: String(url), auth: new Headers(init.headers).get('authorization') });
    const kind = u.pathname.endsWith('/usage/summary') ? 'summary' : u.pathname.endsWith('/settings/billing/usage') ? 'usage' : 'repos';
    if (statuses[kind]) return new Response('{"message":"made up"}', { status: statuses[kind] });
    const body = kind === 'summary' ? summary : kind === 'usage' ? usage : repos;
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status: 200 });
  };
  f.calls = calls;
  return f;
}
const read = (o, nowMs = OCT2) => readUsage({ account: 'shumpmaster', token: 'made-up', fetch: billing(o), nowMs });
const view = (cur, nowMs = OCT2, lastGood = null, cfg = CFG) => usageView({ cfg, reads: { current: cur, lastGood }, nowMs, tz: TZ, whenText });

// ---------------------------------------------------------------------------
// The words and the bar

test('AC78: 2,130 private minutes of 3,000 read "2,130 of 3,000 included minutes (71%)", the bar at 71; 3,000 exactly at 100%; "October"', async () => {
  let v = view(await read({ usage: { usageItems: [uItem({ quantity: 2130 })] } }));
  assert.equal(v.words, '2,130 of 3,000 included minutes (71%)');
  assert.equal(v.bar, 71);
  assert.equal(v.month, 'October');
  assert.equal(v.estimate, null, 'no estimate at $0.00');
  v = view(await read({ usage: { usageItems: [uItem({ quantity: 3000 })] } }));
  assert.equal(v.words, '3,000 of 3,000 included minutes (100%)');
  assert.equal(v.bar, 100);
});

test('AC78: 4,100 minutes and a netAmount of $6.60 read 136%, the full bar and "Estimated cost so far this month: $6.60", with the estimate\'s words', async () => {
  const v = view(await read({ usage: { usageItems: [uItem({ quantity: 4100 })] }, summary: { usageItems: [sItem({ netAmount: 6.6 })] } }));
  assert.equal(v.words, '4,100 minutes: past your 3,000 included minutes (136%)');
  assert.equal(v.bar, 100);
  assert.equal(v.estimate, 'Estimated cost so far this month: $6.60');
  assert.equal(v.estimateNote, "an estimate from GitHub's usage figures, which may lag; GitHub bills the final amount on your billing date");
});

test('AC78: a public repository\'s minutes left out; an item with no repositoryName counted, "may be too high"; the 100% rule for standard runners only', async () => {
  let v = view(await read({ usage: { usageItems: [uItem({ quantity: 1000 }), uItem({ quantity: 5000, repositoryName: 'Service-Desk' })] } }));
  assert.equal(v.words, '1,000 of 3,000 included minutes (33%)');
  v = view(await read({ usage: { usageItems: [uItem({ quantity: 1000, repositoryName: undefined })] } }));
  assert.equal(v.words, "1,000 of 3,000 included minutes (33%) (GitHub didn't name the repository for some minutes, so this may be too high)");
  v = view(await read({ usage: { usageItems: [uItem({ quantity: 1800 })] }, summary: { usageItems: [sItem({ netAmount: 0.5 })] } }));
  assert.equal(v.words, '1,800 of 3,000 included minutes (100%)');
  v = view(await read({ usage: { usageItems: [uItem({ quantity: 1800 })] }, summary: { usageItems: [sItem({ sku: 'actions_linux_16_core', netAmount: 0.5 })] } }));
  assert.equal(v.words, '1,800 of 3,000 included minutes (60%)');
});

test('AC78: storage in the estimate; "(from the daily report)"; an own price, "(some prices assumed)" and "at least"', async () => {
  let v = view(await read({ usage: { usageItems: [uItem({ quantity: 10 })] }, summary: { usageItems: [sItem({ netAmount: 1 }), sItem({ sku: 'actions_storage', unitType: 'GigabyteHours', netAmount: 0.25 })] } }));
  assert.equal(v.estimate, 'Estimated cost so far this month: $1.25');
  v = view(await read({ usage: { usageItems: [uItem({ quantity: 3500, netAmount: 3 })] }, summary: 'not json' }));
  assert.equal(v.estimate, 'Estimated cost so far this month: $3.00 (from the daily report)');
  v = view(await read({ usage: { usageItems: [uItem({ quantity: 10 })] }, summary: { usageItems: [{ product: 'Actions', sku: 'actions_macos', unitType: 'minutes', netQuantity: 100, pricePerUnit: 0.062 }] } }));
  assert.equal(v.estimate, 'Estimated cost so far this month: $6.20');
  v = view(await read({ usage: { usageItems: [uItem({ quantity: 10 })] }, summary: { usageItems: [{ product: 'Actions', sku: 'actions_linux', unitType: 'minutes', netQuantity: 1000 }] } }));
  assert.equal(v.estimate, 'Estimated cost so far this month: $6.00 (some prices assumed)');
  v = view(await read({ usage: { usageItems: [uItem({ quantity: 10 })] }, summary: { usageItems: [sItem({ netAmount: 2 }), { product: 'Actions', sku: 'actions_mystery', unitType: 'minutes', netQuantity: 5 }] } }));
  assert.equal(v.estimate, 'Estimated cost so far this month: at least $2.00');
});

test('AC78: each can\'t-be-read case\'s words, a 404 included; the last good figures kept on a failed refresh with "couldn\'t refresh"; "as of"; the reset line', async () => {
  assert.equal(view(await readUsage({ account: 'shumpmaster', token: '', fetch: billing(), nowMs: OCT2 })).words, 'GitHub Actions use: not set up yet (Setup N12)');
  assert.equal(view(await read({ statuses: { summary: 401, usage: 401 } })).words, USAGE_WORDS.refused);
  assert.equal(view(await read({ statuses: { usage: 403 } })).words, USAGE_WORDS.refused);
  assert.equal(view(await read({ statuses: { summary: 404, usage: 404 } })).words,
    "GitHub Actions use: can't be read: the usage token was refused, or GitHub doesn't report Actions use for this account");
  assert.equal(view(await read({ statuses: { usage: 502 } })).words, 'GitHub Actions use: not available just now');
  assert.equal(view(await read({ usage: '<html>' })).words, 'GitHub Actions use: not available just now');
  assert.equal(view(null).words, USAGE_WORDS.reading);
  assert.equal(usageView({ cfg: undefined, reads: null, nowMs: OCT2, tz: TZ, whenText }).words, 'GitHub Actions use: not set up yet (Setup N12)');
  const good = await read({ usage: { usageItems: [uItem({ quantity: 2130 })] } });
  let v = view(good);
  assert.equal(v.asOf, 'as of 12:00', 'the read\'s time, as J9\'s <t> in ownerTimeZone');
  assert.equal(v.reset, 'Resets at the start of each month (UTC): Oct 31 19:00', 'next month\'s 1st, 00:00 UTC, in Chicago');
  v = view(await read({ statuses: { usage: 502 } }, OCT2 + 3600e3), OCT2 + 3600e3, good);
  assert.equal(v.words, '2,130 of 3,000 included minutes (71%)');
  assert.equal(v.asOf, "as of 12:00; couldn't refresh");
  // December's reset names January's 1st.
  const dec = await readUsage({ account: 'shumpmaster', token: 'made-up', fetch: billing({ usage: { usageItems: [uItem({ quantity: 1 })] } }), nowMs: Date.parse('2026-12-10T12:00:00Z') });
  assert.equal(view(dec, Date.parse('2026-12-10T12:00:00Z')).reset, 'Resets at the start of each month (UTC): Dec 31 18:00');
});

test('AC78: "Not reported" from reported: false (no read made) and from two empty 200 answers on the 2nd; an empty answer on the 1st reads 0%', async () => {
  assert.equal(view(null, OCT2, null, { ...CFG, reported: false }).words,
    "GitHub doesn't report Actions use to the desk for this account. Turn on GitHub's own e-mails at 90% and 100% of your included minutes (Setup N11).");
  let v = view(await read({}));
  assert.equal(v.state, 'not-reported');
  assert.equal(v.bar, undefined, 'no bar');
  v = view(await read({}, OCT1), OCT1);
  assert.equal(v.words, '0 of 3,000 included minutes (0%)');
  assert.equal(v.bar, 0);
});

// ---------------------------------------------------------------------------
// The function's read in the blob call

const key = await makeKey('kid-1');
const jwt = await signJwt(key, goodClaims());
async function usageCall(env, f, config) {
  _resetKeyCache();
  const g = fakeFetch([certsRoute([key]), (url, init) => (url.startsWith('https://api.github.com/users/') ? 'billing' : undefined)]);
  const fetchAll = async (url, init) => (String(url).startsWith('https://api.github.com/users/') ? f(url, init) : g(url, init));
  const res = await handle({ request: request('/api/blobs', { jwt, body: { project: 'Service-Desk', blobs: [], history: [], usage: true } }), env }, 'blobs',
    { fetch: fetchAll, now: () => OCT2, ...(config ? { config } : {}) });
  return { status: res.status, text: await res.text() };
}

test('J21: the function reads with GITHUB_BILLING_TOKEN, never the read token, and answers the kept fields only, the token in no answer', async () => {
  const f = billing({ usage: { usageItems: [uItem({ quantity: 2130, grossAmount: 12.78, discountAmount: 12.78, date: '2026-10-02T00:00:00Z' })] } });
  const env = { ...ENV, GITHUB_BILLING_TOKEN: 'made-up-billing-token-123' };
  const r = await usageCall(env, f);
  assert.equal(r.status, 200);
  assert.equal(f.calls.length, 3, 'the three fixed reads');
  assert.ok(f.calls.every((c) => c.auth === 'Bearer made-up-billing-token-123'));
  assert.ok(!f.calls.some((c) => c.auth === `Bearer ${ENV.GITHUB_READ_TOKEN}`));
  assert.ok(!r.text.includes('made-up-billing-token-123'), 'the token in no answer');
  const j = JSON.parse(r.text);
  assert.equal(j.usage.state, 'ok');
  assert.deepEqual(Object.keys(j.usage.usage.items[0]).sort(), ['netAmount', 'pricePerUnit', 'product', 'quantity', 'repositoryName', 'sku', 'unitType']);
  assert.ok(!r.text.includes('grossAmount') && !r.text.includes('"date"'), 'nothing but the kept fields');
  assert.equal(j.cost.github, 3);
  // The same reader as the sender's: the same figures on the page.
  assert.equal(view(j.usage).words, '2,130 of 3,000 included minutes (71%)');
  const none = await usageCall({ ...ENV }, billing());
  assert.equal(JSON.parse(none.text).usage.state, 'not-configured');
  const refused = await usageCall(env, billing({ statuses: { summary: 401, usage: 401 } }));
  assert.equal(JSON.parse(refused.text).usage.state, 'refused');
  const off = billing();
  const notRep = await usageCall(env, off, withUsage(CONFIG, { ...CFG, reported: false }));
  assert.equal(JSON.parse(notRep.text).usage.state, 'not-reported');
  assert.equal(off.calls.length, 0, 'no read while reported is false');
});

test('J6: `usage` counts 5 of the 25; anything but true is refused', async () => {
  _resetKeyCache();
  const g = fakeFetch([certsRoute([key])]);
  const send = async (body) => handle({ request: request('/api/blobs', { jwt, body: { project: 'Service-Desk', history: [], ...body } }), env: ENV }, 'blobs', { fetch: g, now: () => NOW });
  let res = await send({ blobs: Array.from({ length: 21 }, (_, i) => i.toString(16).padStart(40, 'b')), usage: true });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'budget 26 is over 25');
  res = await send({ blobs: [], usage: 'yes' });
  assert.equal((await res.json()).error, 'bad usage');
});

// ---------------------------------------------------------------------------
// The page's reads per opening

function world() {
  const sd = repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml') }, [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  const poom = repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]);
  return { 'Service-Desk': sd, 'Personal-Org-Operating-Model': poom };
}
const usageCalls = (server) => server.calls.filter((c) => c.path === '/api/blobs' && c.body.usage).map((c) => c.at);

test('AC78, J21: the page reads once at an opening, at most once an hour while it stays open, again on a cost tap, and afresh at a second opening within the hour', async () => {
  const clock = fakeClock(OCT2);
  const repos = world();
  let answer = 0;
  repos['Service-Desk'].usageAnswer = (now) => ({ state: 'ok', asOf: new Date(now).toISOString(), period: { y: 2026, m: 10, day: 2, ym: '2026-10' },
    summary: { ok: true, items: [] }, usage: { ok: true, items: [{ product: 'Actions', unitType: 'minutes', quantity: 100 + (answer++), repositoryName: 'x/private' }] }, publicRepos: [] });
  const server = fakeServer(repos, CONFIG, clock);
  let desk = createDesk({ config: CONFIG, call: server.call, clock, store: createStore(null), isVisible: () => true });
  desk.start();
  await clock.runUntil(OCT2 + 1000);
  assert.equal(usageCalls(server).length, 1, 'once at the opening');
  await clock.runUntil(OCT2 + 59 * 60_000);
  assert.equal(usageCalls(server).length, 1, 'not again within the hour');
  await clock.runUntil(OCT2 + 61 * 60_000);
  assert.equal(usageCalls(server).length, 2, 'once an hour while open');
  desk.refreshUsage();
  await clock.runUntil(OCT2 + 61 * 60_000 + 1000);
  assert.equal(usageCalls(server).length, 3, 'again on a cost notification\'s tap');
  desk.stop();
  desk = createDesk({ config: CONFIG, call: server.call, clock, store: createStore(null), isVisible: () => true });
  desk.start();
  await clock.runUntil(OCT2 + 62 * 60_000 + 1000);
  assert.equal(usageCalls(server).length, 4, 'afresh at a second opening within the hour: nothing kept across openings');
  desk.stop();
  // With reported: false, none is made.
  const s2 = fakeServer(world(), withUsage(CONFIG, { ...CFG, reported: false }), clock);
  const d2 = createDesk({ config: withUsage(CONFIG, { ...CFG, reported: false }), call: s2.call, clock, store: createStore(null), isVisible: () => true });
  d2.start();
  await clock.runUntil(OCT2 + 70 * 60_000);
  assert.equal(usageCalls(s2).length, 0);
  d2.stop();
});

test('AC78: on the page, More detail shows the line with its bar and aria values; the line is not counted and "Quiet" is unchanged', async () => {
  const repos = world();
  repos['Service-Desk'].usageAnswer = () => ({ state: 'ok', asOf: '2026-10-02T17:00:00.000Z', period: { y: 2026, m: 10, day: 2, ym: '2026-10' },
    summary: { ok: true, items: [{ product: 'Actions', sku: 'actions_linux', unitType: 'minutes', netAmount: 6.6 }] },
    usage: { ok: true, items: [{ product: 'Actions', sku: 'Actions Linux', unitType: 'minutes', quantity: 4100, repositoryName: 'shumpmaster/Personal-Org-Operating-Model' }] }, publicRepos: ['Service-Desk'] });
  const app = await loadApp({ repos, now: OCT2 });
  try {
    await app.advance(1000);
    const line = findAll(app.els.view, (e) => e.attrs && e.attrs.id === 'actions-usage')[0];
    assert.ok(line.textContent.includes('October: 4,100 minutes: past your 3,000 included minutes (136%)'));
    const bar = findAll(line, (e) => e.attrs && e.attrs.role === 'progressbar')[0];
    assert.equal(bar.tag, 'progress');
    assert.deepEqual([bar.attrs['aria-valuemin'], bar.attrs['aria-valuemax'], bar.attrs['aria-valuenow'], bar.attrs.value], ['0', '100', '100', '100']);
    assert.ok(line.textContent.includes('Estimated cost so far this month: $6.60'));
    assert.ok(line.textContent.includes('as of 12:00'));
    assert.equal(app.state().textContent, 'Quiet', 'not counted');
  } finally {
    app.restore();
  }
});

// Draft 9 (build review round 1, Desk 2; the Reviewer's probe A): a cost notification's tap reads the
// usage again, through the page's own wiring, whether it reaches an open desk (sw.js's handover) or
// loads the page (the opening's read). From 2026-10-19 the tap opens the sandbox, so both are the
// sandbox's: its More detail opens at the line.
test('AC78, J21 (draft 9; 2026-10-19): a cost tap reaching an open sandbox reads the usage again; one that loads it reads it at the opening and opens its More detail', async () => {
  const usageAnswer = (now) => ({ state: 'ok', asOf: new Date(now).toISOString(), period: { y: 2026, m: 10, day: 2, ym: '2026-10' },
    summary: { ok: true, items: [sItem({ netAmount: 0 })] }, usage: { ok: true, items: [uItem({ quantity: 100 })] }, publicRepos: [] });
  const quiet = () => ({ 'Service-Desk': repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml') }, [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]) });
  const nav = { listeners: [], replies: [] };
  nav.serviceWorker = { addEventListener: (t, fn) => { if (t === 'message') nav.listeners.push(fn); } };
  let r = quiet();
  r['Service-Desk'].usageAnswer = usageAnswer;
  let app = await loadSandbox({ config: CONFIG, repos: r, now: OCT2, hash: '#/', globals: { navigator: nav } });
  const reads = () => app.server.calls.filter((c) => c.path === '/api/blobs' && c.body.usage).length;
  try {
    await app.advance(1000);
    assert.equal(reads(), 1, 'at the opening');
    await app.advance(10 * 60_000);
    assert.equal(reads(), 1);
    for (const fn of nav.listeners) fn({ data: { kind: 'desk-open', navigate: 'https://desk.example.invalid/?sandbox&open=actions-usage' }, ports: [{ postMessage: (m) => nav.replies.push(m) }] });
    await app.advance(1000);
    assert.deepEqual(nav.replies, [{ ok: true }]);
    assert.equal(reads(), 2, 'read again on the tap, not an hour on');
    assert.equal(app.loc.hash, '#/p/Service-Desk');
    const more = byClass(app.view, 'sb-more')[0];
    assert.ok(more && 'open' in more.attrs, 'its More detail open');
    assert.ok(sbFindAll(more, (e) => e.attrs && e.attrs.id === 'actions-usage').length);
  } finally {
    app.restore();
  }
  r = quiet();
  r['Service-Desk'].usageAnswer = usageAnswer;
  app = await loadSandbox({ config: CONFIG, repos: r, now: OCT2, hash: '', search: '?sandbox&open=actions-usage' });
  try {
    await app.advance(1000);
    assert.equal(app.server.calls.filter((c) => c.path === '/api/blobs' && c.body.usage).length, 1, 'read at the opening the tap made');
    const more = byClass(app.view, 'sb-more')[0];
    assert.ok(more && 'open' in more.attrs);
  } finally {
    app.restore();
  }
  // An older address reaching the accepted view goes on to the sandbox.
  app = await loadApp({ repos: quiet(), now: OCT2, hash: '', search: '?open=actions-usage' });
  try {
    await app.advance(1000);
    assert.deepEqual(app.replaced, ['/?sandbox&open=actions-usage']);
  } finally {
    app.restore();
  }
});
