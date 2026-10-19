// ac-test: S-001/AC78 (the sender's side: the hourly read and the $50 steps; the page's line and
// bar are the brief's step 3b) and join-test: S-001/J21 (the shared usage reader in src/lib/usage.js).
// Every billing answer here is MADE UP, in the form GitHub's REST reference gives (research Q-015's
// documented fields), written inline below; no real billing figure is in this repository.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readUsage, computeUsage, usageUrls, usagePeriod, costStep, dollars } from '../../src/lib/usage.js';
import { openPart } from '../../src/notify/state.mjs';
import { harness, checkoutOf, clock, MIN, HOUR, cleanScratch, makeWorld } from './notify-helpers.mjs';

after(cleanScratch);

const OCT2 = Date.parse('2026-10-02T12:00:00Z');
const OCT1 = Date.parse('2026-10-01T09:00:00Z');
const CFG = { account: 'shumpmaster', includedMinutes: 3000 };
const TOKEN = 'made-up-billing-token';

/** A made-up /usage item and summary item (Q-015 F1.1, F1.2). */
const uItem = (o) => ({ date: '2026-10-02T00:00:00Z', product: 'Actions', sku: 'Actions Linux', quantity: 0, unitType: 'minutes', pricePerUnit: 0.006,
  grossAmount: 0, discountAmount: 0, netAmount: 0, repositoryName: 'shumpmaster/Personal-Org-Operating-Model', ...o });
const sItem = (o) => ({ product: 'Actions', sku: 'actions_linux', unitType: 'minutes', pricePerUnit: 0.006, grossQuantity: 0, grossAmount: 0,
  discountQuantity: 0, discountAmount: 0, netQuantity: 0, netAmount: 0, ...o });

/** A fake billing API: answers by request kind; `repos` pages of public repositories. */
function billing({ summary = { usageItems: [] }, usage = { usageItems: [] }, repos = [[{ name: 'Service-Desk', private: false, visibility: 'public' }]],
  statuses = {} } = {}) {
  const calls = [];
  const fetch = async (url, init) => {
    const u = new URL(url);
    calls.push({ url: String(url), headers: new Headers(init.headers) });
    let kind = u.pathname.endsWith('/usage/summary') ? 'summary' : u.pathname.endsWith('/settings/billing/usage') ? 'usage' : 'repos';
    if (statuses[kind]) return new Response(JSON.stringify({ message: 'made up' }), { status: statuses[kind] });
    if (kind === 'repos') {
      const page = Number(u.searchParams.get('page') || 1);
      const more = page < repos.length;
      return new Response(JSON.stringify(repos[page - 1] || []), { status: 200, headers: more ? { link: `<${url}&page=${page + 1}>; rel="next"` } : {} });
    }
    const body = kind === 'summary' ? summary : usage;
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status: 200 });
  };
  fetch.calls = calls;
  return fetch;
}
const read = (f, nowMs = OCT2, o = {}) => readUsage({ account: 'shumpmaster', token: TOKEN, fetch: f, nowMs, ...o });

test('J21: the three requests\' fixed form, the year and month from the UTC date', async () => {
  const f = billing();
  // 23:30 in Chicago on 31 October is 1 November in UTC.
  const nowMs = Date.parse('2026-11-01T04:30:00Z');
  await read(f, nowMs);
  assert.deepEqual(f.calls.map((c) => c.url), [
    'https://api.github.com/users/shumpmaster/settings/billing/usage/summary?year=2026&month=11&product=Actions',
    'https://api.github.com/users/shumpmaster/settings/billing/usage?year=2026&month=11',
    'https://api.github.com/users/shumpmaster/repos?type=owner&per_page=100',
  ]);
  for (const c of f.calls) {
    assert.equal(c.headers.get('authorization'), `Bearer ${TOKEN}`);
    assert.equal(c.headers.get('accept'), 'application/vnd.github+json');
    assert.equal(c.headers.get('x-github-api-version'), '2022-11-28');
  }
  assert.deepEqual(usagePeriod(nowMs), { y: 2026, m: 11, day: 1, ym: '2026-11' });
  assert.ok(!usageUrls('shumpmaster', usagePeriod(nowMs)).summary.includes('/settings/billing/actions'));
});

test('J21: each state, from 200, 401, 403, 404, 5xx and a body in another form; no read without a token or while reported is false', async () => {
  assert.equal((await read(billing())).state, 'ok');
  assert.equal((await read(billing({ statuses: { summary: 401, usage: 401 } }))).state, 'refused');
  assert.equal((await read(billing({ statuses: { usage: 403 } }))).state, 'refused');
  assert.equal((await read(billing({ statuses: { summary: 404, usage: 404 } }))).state, 'not-found');
  assert.equal((await read(billing({ statuses: { usage: 404 } }))).state, 'unavailable');
  assert.equal((await read(billing({ statuses: { summary: 503, usage: 503 } }))).state, 'unavailable');
  assert.equal((await read(billing({ usage: '<html>' }))).state, 'unavailable');
  assert.equal((await read(billing({ usage: { items: [] } }))).state, 'unavailable');
  assert.equal((await read(billing({ statuses: { repos: 502 } }))).state, 'unavailable');
  const none = billing();
  assert.equal((await read(none, OCT2, { token: '' })).state, 'not-configured');
  assert.equal((await read(none, OCT2, { reported: false })).state, 'not-reported');
  assert.equal(none.calls.length, 0);
  // The kept fields only, and never the token.
  const r = await read(billing({ usage: { usageItems: [uItem({ quantity: 5, extra: 'dropped', grossAmount: 1 })] } }));
  assert.deepEqual(Object.keys(r.usage.items[0]).sort(), ['netAmount', 'pricePerUnit', 'product', 'quantity', 'repositoryName', 'sku', 'unitType']);
  assert.ok(!JSON.stringify(r).includes(TOKEN));
});

test('AC78, J21: the minutes, the percent, the 100% rule, the estimate and its notes', async () => {
  const c = async (o, nowMs = OCT2) => computeUsage(await read(billing(o), nowMs), CFG);
  let u = await c({ usage: { usageItems: [uItem({ quantity: 2130 })] } });
  assert.deepEqual([u.minutes, u.percent, u.bar, u.past], [2130, 71, 71, false]);
  u = await c({ usage: { usageItems: [uItem({ quantity: 3000 })] } });
  assert.deepEqual([u.percent, u.bar, u.past], [100, 100, false]);
  u = await c({ usage: { usageItems: [uItem({ quantity: 4100, netAmount: 6.6 })] }, summary: { usageItems: [sItem({ netQuantity: 1100, netAmount: 6.6 })] } });
  assert.deepEqual([u.percent, u.bar, u.past, u.estimateCents], [136, 100, true, 660]);
  assert.equal(dollars(u.estimateCents), '$6.60');
  // A public repository's minutes left out, in both name forms.
  u = await c({ usage: { usageItems: [uItem({ quantity: 1000 }), uItem({ quantity: 9000, repositoryName: 'shumpmaster/Service-Desk' }), uItem({ quantity: 500, repositoryName: 'Service-Desk' })] } });
  assert.equal(u.minutes, 1000);
  // An item with no repositoryName counted, and "may be too high".
  u = await c({ usage: { usageItems: [uItem({ quantity: 1000 }), uItem({ quantity: 200, repositoryName: undefined })] } });
  assert.deepEqual([u.minutes, u.mayBeTooHigh], [1200, true]);
  // 1,800 minutes with a standard runner charged: at least 100%; only a larger runner charged: 60%.
  u = await c({ usage: { usageItems: [uItem({ quantity: 1800 })] }, summary: { usageItems: [sItem({ netAmount: 0.5 })] } });
  assert.equal(u.percent, 100);
  u = await c({ usage: { usageItems: [uItem({ quantity: 1800 })] }, summary: { usageItems: [sItem({ sku: 'actions_linux_4_core', netAmount: 0.5 })] } });
  assert.equal(u.percent, 60);
  // Storage's netAmount is in the estimate.
  u = await c({ summary: { usageItems: [sItem({ netAmount: 1.25 }), sItem({ sku: 'actions_storage', unitType: 'GigabyteHours', netAmount: 0.75 })] } });
  assert.equal(u.estimateCents, 200);
  // The summary failing: /usage's items, "(from the daily report)".
  u = await c({ summary: 'not json', usage: { usageItems: [uItem({ quantity: 10, netAmount: 3 }), uItem({ quantity: 10, netAmount: 4 })] } });
  assert.deepEqual([u.estimateCents, u.fromDaily], [700, true]);
  // Priced by its own pricePerUnit; by $0.006 a Linux minute, "(some prices assumed)"; unpriced, "at least".
  u = await c({ summary: { usageItems: [sItem({ netAmount: undefined, netQuantity: 1000, pricePerUnit: 0.008 })] } });
  assert.deepEqual([u.estimateCents, u.pricesAssumed, u.atLeast], [800, false, false]);
  u = await c({ summary: { usageItems: [sItem({ netAmount: undefined, netQuantity: 1000, pricePerUnit: undefined })] } });
  assert.deepEqual([u.estimateCents, u.pricesAssumed], [600, true]);
  u = await c({ summary: { usageItems: [sItem({ sku: 'actions_macos', netAmount: undefined, netQuantity: 1000, pricePerUnit: undefined }), sItem({ netAmount: 2 })] } });
  assert.deepEqual([u.estimateCents, u.atLeast], [200, true]);
  // Two empty 200 answers: "Not reported" on the 2nd; 0% on the 1st.
  u = await c({});
  assert.deepEqual([u.state, u.notReported, u.percent], ['not-reported', true, null]);
  u = await c({}, OCT1);
  assert.deepEqual([u.state, u.minutes, u.percent, u.estimateCents], ['ok', 0, 0, 0]);
  // Three pages of repositories.
  const f = billing({ usage: { usageItems: [uItem({ quantity: 10, repositoryName: 'shumpmaster/r3' })] }, repos: [[{ name: 'r1' }], [{ name: 'r2' }], [{ name: 'r3' }]] });
  u = computeUsage(await read(f), CFG);
  assert.equal(u.minutes, 0);
  assert.equal(f.calls.filter((x) => x.url.includes('/repos?')).length, 3);
  assert.equal(costStep(4999), 0);
  assert.equal(costStep(5001), 1);
  assert.equal(costStep(15100), 3);
});

/** A harness whose billing figures are set by `est` (dollars), read through the world's usage route. */
function costHarness(o = {}) {
  const h = harness({ checkout: checkoutOf({ base: { 'questions/_TEMPLATE.md': '#\n' } }), billingToken: TOKEN, clock: clock(o.start || OCT2), stateKey: o.stateKey,
    sub: o.sub, vapid: o.vapid, world: o.world || makeWorld() });
  h.est = o.est ?? 0;
  h.usageStatus = 200;
  h.world.usage = (path) => {
    if (h.usageStatus !== 200) return { status: h.usageStatus, body: { message: 'made up' } };
    if (path.includes('/usage/summary')) return { status: 200, body: { usageItems: h.empty ? [] : [sItem({ netAmount: h.est })] } };
    if (path.includes('/settings/billing/usage')) return { status: 200, body: { usageItems: h.empty ? [] : [uItem({ quantity: 4000, netAmount: h.est })] } };
    return { status: 200, body: [{ name: 'Service-Desk' }] };
  };
  h.reads = () => h.world.usageCalls.filter((c) => c.path.includes('/usage/summary')).length;
  h.costPushes = (r) => r.payloads.filter((p) => p && p.notification.navigate.endsWith('/?sandbox&open=actions-usage'));
  return h;
}

test('AC78: reads at most once an hour: twelve runs in an hour make one read', async () => {
  const h = costHarness({ est: 10 });
  for (let i = 0; i < 12; i++) await h.run();
  assert.equal(h.reads(), 1);
  await h.run();
  assert.equal(h.reads(), 2, 'the 13th run is an hour after the first');
});

test('AC78: the $50 steps: $49.99 → $50.01 one push, → $99.00 none, → $151.00 one naming $150, the same step an hour later none, a new month\'s first $50 one', async () => {
  const h = costHarness({ est: 49.99 });
  const r0 = await h.run({ after: HOUR });
  assert.equal(r0.payloads[0].notification.body, 'Notifications are on: nothing waits on you now. GitHub Actions: about $49.99 so far this month (an estimate)');
  const step = async (est) => {
    h.est = est;
    return h.costPushes(await h.run({ after: HOUR }));
  };
  let p = await step(50.01);
  assert.equal(p.length, 1);
  assert.deepEqual(p[0].notification, { title: 'Service Desk', body: "GitHub Actions: this month's estimated cost has passed $50 (about $50.01, an estimate)",
    navigate: 'https://desk.example.invalid/?sandbox&open=actions-usage', tag: p[0].notification.tag });
  assert.equal((await step(99)).length, 0);
  p = await step(151);
  assert.equal(p.length, 1);
  assert.equal(p[0].notification.body, "GitHub Actions: this month's estimated cost has passed $150 (about $151.00, an estimate)");
  assert.equal((await step(151)).length, 0, 'the same step an hour later');
  // A new month starts at step 0: its first $50 notifies again.
  h.clock.t = Date.parse('2026-11-02T12:00:00Z');
  p = await step(52);
  assert.equal(p.length, 1);
  assert.equal(p[0].notification.body, "GitHub Actions: this month's estimated cost has passed $50 (about $52.00, an estimate)");
});

test('AC78: the bootstrap mid-month at $73.00 sends no step push; a state with no usage part sends one naming $50 at $73.00, none at $20.00', async () => {
  const h = costHarness({ est: 73 });
  const r = await h.run({ after: HOUR });
  assert.equal(h.costPushes(r).length, 0);
  assert.match(r.payloads[0].notification.body, /GitHub Actions: about \$73\.00 so far this month \(an estimate\)$/);
  assert.equal((await h.run({ after: HOUR })).payloads.length, 0);
  // The usual start: the state exists (N7, N8) before the token (N12).
  for (const [est, n] of [[73, 1], [20, 0]]) {
    const g = costHarness({ est });
    const token = g.env;
    g.env.DESK_BILLING_TOKEN = '';
    await g.run({ after: HOUR });
    assert.equal(g.reads(), 0, 'no token, no read');
    delete token.DESK_BILLING_TOKEN;
    const rr = await g.run({ after: HOUR });
    const p = g.costPushes(rr);
    assert.equal(p.length, n, String(est));
    if (n) assert.equal(p[0].notification.body, "GitHub Actions: this month's estimated cost has passed $50 (about $73.00, an estimate)");
  }
});

test('AC78: the cost push is in no logged count or line: the run\'s log reads the same with or without it; a failed one is sent at the next read', async () => {
  const shared = { stateKey: 'k'.repeat(64) };
  const a = costHarness({ ...shared, est: 10 });
  const b = costHarness({ ...shared, est: 10 });
  await a.run({ after: HOUR });
  await b.run({ after: HOUR });
  a.est = 10;
  b.est = 60;
  const ra = await a.run({ after: HOUR });
  const rb = await b.run({ after: HOUR });
  assert.equal(a.costPushes(ra).length, 0);
  assert.equal(b.costPushes(rb).length, 1);
  assert.deepEqual(rb.logs, ra.logs);
  // A failed cost push: kept unsent, sent at the next read (an hour on), still without a log line.
  const c = costHarness({ ...shared, est: 10 });
  await c.run({ after: HOUR });
  c.est = 60;
  c.world.push = (req) => (c.world.pushes.length && req ? { status: 503 } : { status: 201 });
  const r1 = await c.run({ after: 30 * MIN });
  assert.equal(r1.pushes.length, 1, 'no retry for it in the run');
  c.world.push = () => ({ status: 201 });
  assert.equal(c.costPushes(await c.run({ after: 30 * MIN })).length, 0, 'not before the next read');
  const r3 = await c.run({ after: HOUR });
  assert.equal(c.costPushes(r3).length, 1);
  assert.deepEqual(r3.logs, ra.logs);
});

test('AC78: no token, figure or step in any log line, issue body or the state\'s clear part; an unreadable state sends nothing', async () => {
  const h = costHarness({ est: 151.37 });
  await h.run({ after: HOUR });
  h.est = 251.37;
  await h.run({ after: HOUR });
  h.usageStatus = 401;
  await h.run({ after: HOUR });
  const logs = h.runs.flatMap((r) => r.logs).join('\n');
  const issues = h.world.issues.map((i) => i.body).join('\n');
  // The state's clear part: everything but its sealed parts and keyed hashes.
  const clear = JSON.stringify({ ...h.state(), jwt: null, usage: null, sub: null, keys: Object.values(h.state().keys) });
  for (const text of [logs, issues, clear]) {
    for (const leak of [TOKEN, '151.37', '251.37', '$', '4000', '4,000', 'step', 'estimate']) assert.ok(!text.includes(leak), `${leak} in ${text.slice(0, 80)}`);
  }
  assert.deepEqual(openPart(h.stateKey, 'usage', h.state().usage).step, 5);
  // An unreadable state: nothing sent, the cost push included.
  h.usageStatus = 200;
  h.est = 400;
  h.world.fail['/repos/shumpmaster/Service-Desk/actions/artifacts/'] = 502;
  const r = await h.run({ after: HOUR });
  assert.equal(r.pushes.length, 0);
});

test('AC78: "Not reported": reported false makes no read; two empty 200 answers on the 2nd give no step push and no issue', async () => {
  const h = costHarness({ est: 400 });
  h.config.projects[0].actionsUsage = { account: 'shumpmaster', includedMinutes: 3000, reported: false };
  await h.run({ after: HOUR });
  await h.run({ after: HOUR });
  assert.equal(h.world.usageCalls.length, 0);
  const g = costHarness();
  g.empty = true;
  await g.run({ after: HOUR });
  const r = await g.run({ after: HOUR });
  assert.equal(g.reads(), 2);
  assert.equal(g.costPushes(r).length, 0);
  assert.equal(g.world.issues.length, 0);
});

test('AC78: refused (401 or 403) opens the issue at once; any other failure after 24 hours in a row; it closes once it reads again', async () => {
  for (const status of [401, 403]) {
    const h = costHarness({ est: 10 });
    await h.run({ after: HOUR });
    h.usageStatus = status;
    await h.run({ after: HOUR });
    assert.match(h.world.issues.find((i) => i.state === 'open').body, /GitHub Actions use can't be read: the usage token was refused/);
    h.usageStatus = 200;
    await h.run({ after: HOUR });
    assert.equal(h.world.issues.find((i) => i.state === 'open'), undefined);
  }
  const h = costHarness({ est: 10 });
  await h.run({ after: HOUR });
  h.usageStatus = 503;
  for (let i = 0; i < 24; i++) await h.run({ after: HOUR });
  assert.equal(h.world.issues.length, 0, 'under 24 hours');
  await h.run({ after: HOUR });
  assert.match(h.world.issues.find((i) => i.state === 'open').body, /GitHub Actions use can't be read/);
  // Between reads the reason stands, so the issue does not close in the hour between them.
  await h.run({ after: 5 * MIN });
  assert.ok(h.world.issues.find((i) => i.state === 'open'));
  h.usageStatus = 200;
  await h.run({ after: HOUR });
  await h.run({ after: HOUR });
  assert.equal(h.world.issues.find((i) => i.state === 'open'), undefined);
  // A failed read keeps the last step and sends nothing.
  const p = openPart(h.stateKey, 'usage', h.state().usage);
  assert.equal(p.step, 0);
  void MIN;
});

// Draft 9 (build review round 1, Sec 3): the cost push is tried once a read, with no 413 re-send.
test('AC78 (draft 9): a 413 to the cost push is not re-sent within the run: one request, sent at the next read', async () => {
  const c = costHarness({ est: 10 });
  await c.run({ after: HOUR });
  c.est = 60;
  c.world.push = () => ({ status: 413 });
  const r1 = await c.run({ after: HOUR });
  assert.equal(r1.pushes.length, 1, 'exactly one request');
  c.world.push = () => ({ status: 201 });
  const r2 = await c.run({ after: HOUR });
  assert.equal(c.costPushes(r2).length, 1, 'kept, and sent at the next read');
});

// Draft 9 (Sec 5): usage is read only for the project whose J7 entry holds actionsUsage, whatever
// secrets are set: Workflow 4's sender (Personal-Org-Operating-Model) never reads it, nor its `test: usage`.
test('J21 (draft 9): a sender whose project\'s entry holds no actionsUsage reads no usage, even with DESK_BILLING_TOKEN set', async () => {
  const h = harness({ project: 'Personal-Org-Operating-Model', checkout: checkoutOf({ base: { 'docs/LEDGER.md': '# Ledger\n' } }), billingToken: TOKEN, clock: clock(OCT2) });
  h.world.usage = () => ({ status: 200, body: { usageItems: [] } });
  for (let i = 0; i < 3; i++) await h.run({ after: HOUR });
  const t = await h.run({ test: 'usage' });
  assert.equal(h.world.usageCalls.length, 0, 'no usage request');
  assert.ok(t.logs.some((l) => /holds no actionsUsage in form, so its sender reads no usage/.test(l)), t.logs.join('\n'));
  // Service-Desk's sender, whose entry holds it, does read.
  const sd = costHarness({ est: 10 });
  await sd.run({ after: HOUR });
  assert.equal(sd.reads(), 1);
});
