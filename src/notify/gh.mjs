// The sender's REST reads and writes with the workflow's own token (spec S-001, J16, J18, AC76),
// with J16's budget guard: the first answer that carries `X-RateLimit-Remaining` decides; below
// 300, the run makes no further request, sends nothing and uploads no state.

export const BUDGET_FLOOR = 300;
export const DEFAULT_API = 'https://api.github.com';

/** The run stops: the workflow token's hourly budget is nearly spent (J16). */
export class BudgetStop extends Error {
  constructor() {
    super('budget');
    this.name = 'BudgetStop';
  }
}

/** A read the run needs failed. `what` is a fixed word naming the read, never a path or a title. */
export class ReadFailed extends Error {
  constructor(what, status) {
    super(`${what} (${status})`);
    this.name = 'ReadFailed';
    this.what = what;
    this.status = status;
  }
}

/** Read a body, at most `cap` bytes; null when it is longer. */
export async function readCapped(res, cap) {
  const len = Number(res.headers.get('content-length'));
  if (Number.isFinite(len) && len > cap) return null;
  if (!res.body) return Buffer.alloc(0);
  const chunks = [];
  let n = 0;
  for await (const c of res.body) {
    n += c.length;
    if (n > cap) return null;
    chunks.push(Buffer.from(c));
  }
  return Buffer.concat(chunks);
}

/**
 * A GitHub client. opts: { token, fetch, apiBase }. Every method throws BudgetStop once the guard
 * has stopped the run; GETs return { status, json, text, link, headers } and never throw for an
 * HTTP status, only for a network failure (status 0).
 */
export function makeGitHub(opts) {
  const fetchImpl = opts.fetch;
  const apiBase = (opts.apiBase || DEFAULT_API).replace(/\/+$/, '');
  const floor = opts.budgetFloor ?? BUDGET_FLOOR;
  const state = { checked: false, stopped: false, requests: 0 };
  const headers = (extra = {}) => ({ Authorization: `Bearer ${opts.token}`, Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'service-desk-notify', ...extra });
  const url = (path) => (/^https:\/\//.test(path) ? path : `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`);

  async function send(method, path, { body, accept, redirect } = {}) {
    if (state.stopped) throw new BudgetStop();
    state.requests++;
    let res;
    try {
      res = await fetchImpl(url(path), { method, headers: headers({ ...(accept ? { Accept: accept } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) }),
      body: body !== undefined ? JSON.stringify(body) : undefined, redirect: redirect || 'follow' });
    } catch {
      return { status: 0, headers: new Headers(), res: null };
    }
    if (!state.checked) {
      const rem = res.headers.get('x-ratelimit-remaining');
      if (rem != null && /^[0-9]+$/.test(rem.trim())) {
        state.checked = true;
        if (Number(rem) < floor) {
          state.stopped = true;
          throw new BudgetStop();
        }
      }
    }
    return { status: res.status, headers: res.headers, res };
  }

  async function get(path, { cap = 8 * 1024 * 1024, accept } = {}) {
    const r = await send('GET', path, { accept });
    const out = { status: r.status, headers: r.headers, json: null, text: null, link: null };
    if (!r.res) return out;
    out.link = r.headers.get('link');
    const buf = await readCapped(r.res, cap).catch(() => null);
    if (buf == null) {
      out.status = -1; // too large to read
      return out;
    }
    out.text = buf.toString('utf8');
    if (r.status >= 200 && r.status < 300) {
      try {
        out.json = JSON.parse(out.text);
      } catch {
        out.json = undefined;
      }
    }
    return out;
  }

  /** Every page of a list (`?per_page=100` already in the path), at most `maxPages`; { ok, items, more }. */
  async function list(path, { key = null, maxPages = 3 } = {}) {
    const items = [];
    const pages = [];
    for (let page = 1; page <= maxPages; page++) {
      const r = await get(page === 1 ? path : `${path}${path.includes('?') ? '&' : '?'}page=${page}`);
      if (r.status !== 200) return { ok: false, status: r.status, items, pages, more: false };
      const chunk = key ? (r.json && r.json[key]) : r.json;
      if (!Array.isArray(chunk)) return { ok: false, status: r.status, items, pages, more: false };
      items.push(...chunk);
      pages.push(r.text);
      const next = /rel="next"/.test(r.link || '');
      if (!next) return { ok: true, status: 200, items, pages, more: false };
      if (page === maxPages) return { ok: true, status: 200, items, pages, more: true };
    }
    return { ok: true, status: 200, items, pages, more: false };
  }

  /**
   * A download GitHub answers with a redirect (a job's log, an artifact's zip): the redirect is not
   * followed with the token; its address is fetched with no credential. { status, buf }.
   */
  async function download(path, cap) {
    const r = await send('GET', path, { redirect: 'manual' });
    if (!r.res) return { status: 0, buf: null };
    let res = r.res;
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc || !/^https:\/\//.test(loc)) return { status: res.status, buf: null };
      try {
        res = await fetchImpl(loc, { method: 'GET', headers: { 'User-Agent': 'service-desk-notify' }, redirect: 'follow' });
      } catch {
        return { status: 0, buf: null };
      }
    }
    if (res.status !== 200) return { status: res.status, buf: null };
    const buf = await readCapped(res, cap).catch(() => null);
    return { status: buf == null ? -1 : 200, buf };
  }

  async function write(method, path, body) {
    const r = await send(method, path, { body });
    let json = null;
    if (r.res) {
      try {
        json = await r.res.json();
      } catch {
        json = null;
      }
    }
    return { status: r.status, json };
  }

  return { get, list, download, write, state, apiBase };
}
