// A minimal fake DOM and loader for the page itself (src/public/app.js): fake timers and a fake
// desk function, so the start-up, render and answering paths the browser runs are the ones tested.
import { CONFIG } from './helpers.mjs';
import { fakeServer } from './fake-desk.mjs';

export class FakeNode {
  constructor() {
    this.children = [];
    this.text = null;
  }
  append(...cs) {
    this.text = null;
    for (const c of cs) this.children.push(typeof c === 'string' ? new FakeText(c) : c);
  }
  replaceChildren(...cs) {
    this.children = [];
    this.append(...cs);
  }
  get textContent() {
    return this.text != null ? this.text : this.children.map((c) => c.textContent).join('');
  }
  set textContent(v) {
    this.children = [];
    this.text = String(v);
  }
}
class FakeText extends FakeNode {
  constructor(t) {
    super();
    this.text = t;
  }
}
class FakeElement extends FakeNode {
  constructor(tag) {
    super();
    this.tag = tag;
    this.attrs = {};
    this.className = '';
    this.innerHTML = '';
    this.listeners = {};
  }
  setAttribute(k, v) {
    this.attrs[k] = String(v);
  }
  addEventListener(type, fn) {
    (this.listeners[type] ||= []).push(fn);
  }
}

/**
 * Load app.js once under fake globals. opts: { hash, repos, breakView, now (ms, default the real clock) }. Returns handles to drive
 * it: the screen-state and view elements, the timers, the calls made, and `advance(ms)`.
 */
let loads = 0;
export async function loadApp({ hash = '', repos, breakView = false, now: start = null }) {
  const names = ['document', 'window', 'location', 'Node', 'setTimeout', 'clearTimeout', 'setInterval', 'fetch'];
  const saved = Object.fromEntries(names.map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  let now = start == null ? Date.now() : start;
  const realNow = Date.now;
  const els = { view: new FakeElement('main'), 'screen-state': new FakeElement('p'), foot: new FakeElement('footer') };
  if (breakView) els.view.replaceChildren = () => { throw new Error('view is broken'); };
  const docListeners = {};
  const timers = new Map();
  let seq = 0;
  const server = fakeServer(repos, CONFIG, { now: () => now });
  const fetchCalls = [];
  const set = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
  set('Node', FakeNode);
  set('document', {
    title: '', visibilityState: 'visible',
    createElement: (t) => new FakeElement(t),
    createTextNode: (t) => new FakeText(t),
    getElementById: (id) => els[id] || null,
    addEventListener: (type, fn) => { (docListeners[type] ||= []).push(fn); },
  });
  set('window', { scrollY: 0, scrollTo() {}, addEventListener() {} });
  set('location', { hash, search: '' });
  set('setTimeout', (fn, ms) => { const id = ++seq; timers.set(id, { at: now + Math.max(0, ms || 0), fn, id }); return id; });
  set('clearTimeout', (id) => { timers.delete(id); });
  set('setInterval', () => 0);
  set('fetch', async (path, init) => {
    fetchCalls.push({ path, at: now });
    const r = await server.call(path, JSON.parse(init.body));
    if (!r.ok) return { status: r.status || 500, ok: false, type: 'basic', text: async () => 'error' };
    return { status: 200, ok: true, type: 'basic', text: async () => JSON.stringify(r.json) };
  });
  Date.now = () => now;
  const flush = async () => { for (let i = 0; i < 8; i++) await new Promise((r) => setImmediate(r)); };
  const app = {
    els, timers, fetchCalls, flush,
    state: () => els['screen-state'],
    async advance(ms) {
      const until = now + ms;
      for (;;) {
        let next = null;
        for (const t of timers.values()) if (t.at <= until && (!next || t.at < next.at || (t.at === next.at && t.id < next.id))) next = t;
        if (!next) break;
        timers.delete(next.id);
        now = next.at;
        next.fn();
        await flush();
      }
      now = until;
      await flush();
    },
    restore() {
      Date.now = realNow;
      for (const k of names) {
        if (saved[k]) Object.defineProperty(globalThis, k, saved[k]);
        else delete globalThis[k];
      }
    },
  };
  try {
    await import(`../../src/public/app.js?load=${++loads}`);
  } catch (e) {
    app.restore();
    throw e;
  }
  return app;
}


/** Every element under `node` (depth first) for which `pred` holds. */
export function findAll(node, pred, out = []) {
  for (const c of node.children || []) {
    if (pred(c)) out.push(c);
    findAll(c, pred, out);
  }
  return out;
}

/** The first element under `node` for which `pred` holds, or null. */
export function find(node, pred) {
  return findAll(node, pred)[0] || null;
}
