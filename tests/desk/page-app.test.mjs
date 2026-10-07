// The page itself (src/public/app.js), loaded under a minimal fake DOM with fake timers and a fake
// desk function, so the start-up and render paths the browser runs are the ones tested
// (PR #40 review, N4 and N6).
// ac-test: S-001/AC4 ac-test: S-001/AC5
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, CONFIG } from './helpers.mjs';
import { repo, fakeServer, BAD_LOG_LINE } from './fake-desk.mjs';

class FakeNode {
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
 * Load app.js once under fake globals. opts: { hash, repos, breakView }. Returns handles to drive
 * it: the screen-state and view elements, the timers, the calls made, and `advance(ms)`.
 */
let loads = 0;
async function loadApp({ hash = '', repos, breakView = false }) {
  const names = ['document', 'window', 'location', 'Node', 'setTimeout', 'clearTimeout', 'setInterval', 'fetch'];
  const saved = Object.fromEntries(names.map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  let now = Date.now();
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

function cleanRepos({ badLog = false } = {}) {
  const sd = (p) => fixture(`service-desk/${p}`);
  return {
    'Service-Desk': repo({
      'queue/README.md': sd('queue/README.md'),
      'governance/ROUTING.toml': sd('governance/ROUTING.toml'),
      'status/P-001.toml': fixture('service-desk/status/P-001@7da0fd7.toml'),
      'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl') + (badLog ? `${BAD_LOG_LINE}\n` : ''),
    }, [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]),
    'Personal-Org-Operating-Model': repo({
      'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'),
      'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md'),
    }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]),
  };
}

const polls = (app) => app.fetchCalls.filter((c) => c.path === '/api/poll').length;

test('Page (review N6): opened at #/p/%E0, the desk shows the Universe, starts polling and reaches Quiet', async () => {
  const app = await loadApp({ hash: '#/p/%E0', repos: cleanRepos() });
  try {
    assert.equal(app.state().textContent, 'Checking…');
    const view = app.els.view.textContent;
    for (const p of CONFIG.projects) assert.ok(view.includes(p.name), `the Universe lists ${p.name}`);
    assert.equal(app.timers.size, CONFIG.projects.length, 'desk.start() scheduled one poll per project');
    await app.advance(1000);
    assert.equal(polls(app), CONFIG.projects.length);
    assert.equal(app.state().textContent, 'Quiet');
    await app.advance(60_000);
    assert.equal(polls(app), 2 * CONFIG.projects.length, 'and keeps polling');
  } finally {
    app.restore();
  }
});

test('Page (review N4): the dispatch-log example makes render throw; the screen shows an error state, never "Quiet", and polling goes on', async () => {
  const app = await loadApp({ repos: cleanRepos({ badLog: true }) });
  try {
    await app.advance(1000);
    const s = app.state();
    assert.match(s.textContent, /^Can't show the desk: /);
    assert.equal(s.className, 'cant-read');
    assert.notEqual(s.textContent, 'Quiet');
    assert.match(app.els.view.textContent, /Can't show the desk/);
    const first = polls(app);
    await app.advance(2 * 60_000);
    assert.equal(polls(app), first + 2 * CONFIG.projects.length, 'polled every 60 s after the throw');
    assert.match(app.state().textContent, /^Can't show the desk: /);
  } finally {
    app.restore();
  }
});

test('Page (review N6): when even the first render\'s error state can\'t be drawn, the desk still starts', async () => {
  const app = await loadApp({ hash: '#/p/%E0', repos: cleanRepos(), breakView: true });
  try {
    assert.match(app.state().textContent, /^Can't show the desk: view is broken/);
    assert.equal(app.timers.size, CONFIG.projects.length, 'desk.start() ran');
    await app.advance(1000);
    assert.equal(polls(app), CONFIG.projects.length);
    assert.notEqual(app.state().textContent, 'Quiet');
  } finally {
    app.restore();
  }
});
