// GitHub's billing usage for the owner's account (spec S-001, J21; AC78): the one reader the desk's
// function and Service-Desk's sender share, so they agree. It makes the three fixed reads with the
// billing token, keeps only the fields AC78 computes from, and computes the bar's minutes, its
// percent and the estimated cost. It uses only `fetch` (injected), so it runs in a Pages Function
// and in Node alike. It never returns or logs the token.

export const USAGE_API = 'https://api.github.com';
export const REPOS_MAX_PAGES = 3;
export const LINUX_PRICE = 0.006; // GitHub's price for standard Linux 2-core runners from 2026-01-01 (Q-015 F4.1, F4.2)
export const STATES = ['ok', 'not-configured', 'refused', 'not-found', 'unavailable', 'not-reported'];

const KEPT = ['product', 'sku', 'unitType', 'quantity', 'netQuantity', 'pricePerUnit', 'netAmount', 'repositoryName'];
const NUMS = new Set(['quantity', 'netQuantity', 'pricePerUnit', 'netAmount']);
const LOGIN_RE = /^[A-Za-z0-9-]{1,39}$/;
// A standard runner's minutes SKU, in either form (Q-015 F1.4: `actions_linux` or "Actions Linux").
const STANDARD_SKU_RE = /^actions[ _](linux|windows|macos)$/i;
const LINUX_SKU_RE = /^actions[ _]linux$/i;

/** The year and month of a read, taken once from the UTC date (J21). */
export function usagePeriod(nowMs) {
  const d = new Date(nowMs);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, day: d.getUTCDate(),
    ym: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}` };
}

/** The three requests' fixed form (J21): nothing in them comes from the page. */
export function usageUrls(account, period, apiBase = USAGE_API) {
  const base = `${apiBase}/users/${encodeURIComponent(account)}`;
  return {
    summary: `${base}/settings/billing/usage/summary?year=${period.y}&month=${period.m}&product=Actions`,
    usage: `${base}/settings/billing/usage?year=${period.y}&month=${period.m}`,
    repos: (page) => `${base}/repos?type=owner&per_page=100${page > 1 ? `&page=${page}` : ''}`,
  };
}

function keptItems(body) {
  if (!body || typeof body !== 'object' || !Array.isArray(body.usageItems)) return null;
  const out = [];
  for (const it of body.usageItems) {
    if (!it || typeof it !== 'object' || typeof it.product !== 'string') continue;
    const k = {};
    for (const f of KEPT) {
      const v = it[f];
      if (NUMS.has(f) ? (typeof v === 'number' && Number.isFinite(v)) : typeof v === 'string') k[f] = v;
    }
    out.push(k);
  }
  return out;
}

const isActions = (it) => typeof it.product === 'string' && it.product.toLowerCase() === 'actions';

async function getJson(fetchImpl, url, token) {
  let res;
  try {
    res = await fetchImpl(url, { method: 'GET', headers: {
      Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'service-desk' } });
  } catch {
    return { status: 0, body: null, next: false };
  }
  let body = null;
  if (res.status === 200) {
    try {
      body = await res.json();
    } catch {
      body = undefined; // not JSON: another form
    }
  }
  const link = res.headers.get('Link') || res.headers.get('link') || '';
  return { status: res.status, body, next: /rel="next"/.test(link) };
}

/**
 * One read (J21). input: { account, token, fetch, nowMs, reported, apiBase }. Returns
 * { state, asOf, period, summary: { ok, items }, usage: { ok, items }, publicRepos: [name] | null,
 * statuses: { summary, usage, repos: [status] } }. No read is made when `reported` is false
 * ('not-reported') or there is no token ('not-configured').
 */
export async function readUsage(input) {
  const nowMs = input.nowMs;
  const period = usagePeriod(nowMs);
  const out = { state: 'unavailable', asOf: new Date(nowMs).toISOString(), period, summary: { ok: false, items: [] },
    usage: { ok: false, items: [] }, publicRepos: null, statuses: { summary: null, usage: null, repos: [] } };
  if (input.reported === false) {
    out.state = 'not-reported';
    return out;
  }
  if (!input.token) {
    out.state = 'not-configured';
    return out;
  }
  if (typeof input.account !== 'string' || !LOGIN_RE.test(input.account)) return out;
  const urls = usageUrls(input.account, period, input.apiBase || USAGE_API);
  const f = input.fetch;
  const s = await getJson(f, urls.summary, input.token);
  const u = await getJson(f, urls.usage, input.token);
  out.statuses.summary = s.status;
  out.statuses.usage = u.status;
  const sItems = s.status === 200 ? keptItems(s.body) : null;
  const uItems = u.status === 200 ? keptItems(u.body) : null;
  out.summary = { ok: sItems != null, items: sItems || [] };
  out.usage = { ok: uItems != null, items: uItems || [] };
  if (uItems == null) {
    if ([401, 403].includes(s.status) || [401, 403].includes(u.status)) out.state = 'refused';
    else if (s.status === 404 && u.status === 404) out.state = 'not-found';
    else out.state = 'unavailable';
    return out;
  }
  const names = [];
  for (let page = 1; page <= REPOS_MAX_PAGES; page++) {
    const r = await getJson(f, urls.repos(page), input.token);
    out.statuses.repos.push(r.status);
    if (r.status !== 200 || !Array.isArray(r.body)) {
      out.state = [401, 403].includes(r.status) ? 'refused' : 'unavailable';
      return out;
    }
    for (const repo of r.body) {
      if (repo && typeof repo.name === 'string' && repo.private !== true && repo.visibility !== 'private') names.push(repo.name);
    }
    if (!r.next) break;
  }
  out.publicRepos = names;
  out.state = 'ok';
  return out;
}

const cents = (x) => Math.round(x * 100);

/**
 * AC78's figures from a read. config: { account, includedMinutes }. Returns
 * { state, notReported, minutes, included, percent, bar, past, mayBeTooHigh, estimateCents,
 *   fromDaily, pricesAssumed, atLeast, ym }. `state` is the read's, or 'not-reported' (AC78: both
 * endpoints answered 200 with no Actions item on any day but the month's 1st).
 */
export function computeUsage(read, config) {
  const out = { state: read.state, notReported: read.state === 'not-reported', minutes: null, included: config.includedMinutes,
    percent: null, bar: null, past: false, mayBeTooHigh: false, estimateCents: null, fromDaily: false,
    pricesAssumed: false, atLeast: false, ym: read.period.ym };
  if (read.state !== 'ok') return out;
  const uActions = read.usage.items.filter(isActions);
  const sActions = read.summary.ok ? read.summary.items.filter(isActions) : [];
  if (read.summary.ok && uActions.length === 0 && sActions.length === 0 && read.period.day !== 1) {
    out.state = 'not-reported';
    out.notReported = true;
    return out;
  }
  // Minutes: Actions minutes items of /usage, less public repositories' (J21's name match).
  const pub = new Set((read.publicRepos || []).map((n) => n.toLowerCase()));
  const account = String(config.account || '').toLowerCase();
  const isPublic = (rn) => {
    const r = rn.toLowerCase();
    if (pub.has(r)) return true;
    const i = r.indexOf('/');
    return i > 0 && r.slice(0, i) === account && pub.has(r.slice(i + 1));
  };
  let minutes = 0;
  for (const it of uActions) {
    if (typeof it.unitType !== 'string' || it.unitType.toLowerCase() !== 'minutes' || typeof it.quantity !== 'number') continue;
    if (typeof it.repositoryName !== 'string') {
      out.mayBeTooHigh = true;
      minutes += it.quantity;
      continue;
    }
    if (isPublic(it.repositoryName)) continue;
    minutes += it.quantity;
  }
  out.minutes = minutes;
  const n = config.includedMinutes;
  let p = Math.floor((100 * minutes) / n);
  // A charge on standard runners' minutes means the included minutes are used up (C).
  const charged = (items) => items.some((it) => typeof it.sku === 'string' && STANDARD_SKU_RE.test(it.sku)
    && typeof it.unitType === 'string' && it.unitType.toLowerCase() === 'minutes' && typeof it.netAmount === 'number' && it.netAmount > 0);
  if (p < 100 && (charged(sActions) || charged(uActions))) p = 100;
  out.percent = p;
  out.bar = Math.min(p, 100);
  out.past = p > 100 || minutes > n;
  // The estimate: the summary's Actions items, all SKUs; else /usage's, "(from the daily report)".
  const items = read.summary.ok ? sActions : uActions;
  out.fromDaily = !read.summary.ok;
  let sum = 0;
  for (const it of items) {
    if (typeof it.netAmount === 'number') {
      sum += it.netAmount;
      continue;
    }
    const q = typeof it.quantity === 'number' ? it.quantity : (typeof it.netQuantity === 'number' ? it.netQuantity : null);
    if (q != null && typeof it.pricePerUnit === 'number') {
      sum += q * it.pricePerUnit;
      continue;
    }
    if (q != null && typeof it.sku === 'string' && LINUX_SKU_RE.test(it.sku) && typeof it.unitType === 'string' && it.unitType.toLowerCase() === 'minutes') {
      sum += q * LINUX_PRICE;
      out.pricesAssumed = true;
      continue;
    }
    out.atLeast = true;
  }
  out.estimateCents = Math.max(0, cents(sum));
  return out;
}

/** "$<x.xx>" for a whole number of cents. */
export function dollars(c) {
  const v = Math.max(0, Math.round(c));
  return `$${Math.floor(v / 100).toLocaleString('en-US')}.${String(v % 100).padStart(2, '0')}`;
}

/** The $50 step of an estimate in cents (AC78): floor(x ÷ 50). */
export function costStep(estimateCents) {
  return Math.floor(Math.max(0, estimateCents) / 5000);
}
