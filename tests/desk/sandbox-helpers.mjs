// Helpers for the MD sandbox's tests (spec S-001, J11, AC40–AC42, AC48–AC53): J11's fixture as the
// page's reader would hold it, and a small fake DOM for drawing the sandbox page itself.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { FIX } from './helpers.mjs';
import { recordKind, parseRecord } from '../../src/lib/model.js';
import { gitSha } from './fake-desk.mjs';

export const J11_DIR = join(FIX, 'j11-3117150');
export const SD3 = { name: 'Service-Desk', repo: 'shumpmaster/Service-Desk', defaultBranch: 'main', model: 'v3',
  webCommitsToDefault: true, contentPrefill: true, contentParam: 'value' };

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) walk(f, out);
    else out.push(f);
  }
  return out;
}

/** J11's fixture files: { path: text } (README, tree.txt and trace-notes.txt left out). */
export function j11Files() {
  const out = {};
  for (const f of walk(J11_DIR)) {
    const rel = relative(J11_DIR, f);
    if (['README.md', 'tree.txt', 'trace-notes.txt'].includes(rel)) continue;
    out[rel] = readFileSync(f, 'utf8');
  }
  return out;
}

export const treePaths = () => readFileSync(join(J11_DIR, 'tree.txt'), 'utf8').trim().split('\n');
export const traceNotes = () => readFileSync(join(J11_DIR, 'trace-notes.txt'), 'utf8').trim().split('\n').map((l) => l.replace(/^NOTE: /, ''));

/** The page reader's snapshot of the fixture: the tree at 3117150 and every J11 record parsed. */
export function j11Snapshot(extra = {}) {
  const files = { ...j11Files(), ...extra };
  const tree = new Map();
  for (const p of treePaths()) tree.set(p, { sha: gitSha(files[p] != null ? files[p] : `absent:${p}`), size: 0 });
  for (const p of Object.keys(extra)) tree.set(p, { sha: gitSha(files[p]), size: 0 });
  const records = new Map();
  for (const [p, text] of Object.entries(files)) {
    const kind = recordKind(p, 'v3');
    if (kind && tree.has(p)) records.set(p, parseRecord(kind, text, p));
  }
  return { tree, records, history: new Map(), head: 'f'.repeat(40), pullPages: [], checkPages: [], lastSuccessAt: null };
}

// ---------------------------------------------------------------------------
// A fake DOM, enough for the sandbox page (createElement, createElementNS, text, attributes,
// listeners, classList, head), with helpers to find and click.

export class Node0 {
  constructor() { this.children = []; this.text = null; this.parent = null; }
  append(...cs) { this.text = null; for (const c of cs) { const n = typeof c === 'string' ? new Text0(c) : c; n.parent = this; this.children.push(n); } }
  replaceChildren(...cs) { this.children = []; this.append(...cs); }
  contains(n) { if (n === this) return true; return this.children.some((c) => c.contains && c.contains(n)); }
  get textContent() { return this.text != null ? this.text : this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this.children = []; this.text = String(v); }
}
class Text0 extends Node0 { constructor(t) { super(); this.text = t; } }
export class El0 extends Node0 {
  constructor(tag) {
    super(); this.tag = tag; this.attrs = {}; this.className = ''; this.innerHTML = ''; this.listeners = {}; this.value = ''; this.dataset = {};
    this.classList = { add: (c) => { this.className = `${this.className} ${c}`.trim(); } };
  }
  setAttribute(k, v) { this.attrs[k] = String(v); if (k.startsWith('data-')) this.dataset[k.slice(5)] = String(v); if (k === 'class') this.className = String(v); }
  getAttribute(k) { return k === 'class' ? this.className : this.attrs[k]; }
  addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); }
  click() { for (const fn of this.listeners.click || []) fn({ preventDefault() {} }); }
}

export function findAll(node, pred, out = []) {
  for (const c of node.children || []) { if (c instanceof El0 && pred(c)) out.push(c); findAll(c, pred, out); }
  return out;
}
export const byClass = (node, cls) => findAll(node, (e) => ` ${e.className} `.includes(` ${cls} `));
export const linksIn = (node) => findAll(node, (e) => e.tag === 'a').map((a) => ({ href: a.attrs.href, text: a.textContent, el: a }));

// ---------------------------------------------------------------------------
// The sandbox page itself (src/public/sandbox.js) under the fake DOM, fake timers and the fake
// desk function, so the screens drawn and the taps followed are the page's own.

let loads = 0;
export async function loadSandbox({ config, repos, hash = '#/', now: start = Date.parse('2026-10-14T15:00:00Z'), store = null }) {
  const { fakeServer } = await import('./fake-desk.mjs');
  const names = ['document', 'window', 'location', 'Node', 'setTimeout', 'clearTimeout', 'setInterval', 'navigator', 'localStorage'];
  const saved = Object.fromEntries(names.map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  let now = start;
  const realNow = Date.now;
  const timers = new Map();
  let seq = 0;
  const winListeners = {};
  const docListeners = {};
  const els = { view: new El0('main'), 'screen-state': new El0('p'), foot: new El0('footer') };
  const head = new El0('head');
  const set = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
  set('Node', Node0);
  set('document', {
    activeElement: null, title: '', visibilityState: 'visible', head, documentElement: new El0('html'),
    createElement: (t) => new El0(t), createElementNS: (ns, t) => new El0(t), createTextNode: (t) => new Text0(t),
    getElementById: (id) => els[id] || null,
    addEventListener: (t, fn) => { (docListeners[t] ||= []).push(fn); },
  });
  const loc = { hash, search: '?sandbox' };
  set('location', loc);
  set('window', { scrollY: 0, scrollTo() {}, addEventListener: (t, fn) => { (winListeners[t] ||= []).push(fn); },
    setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms) });
  set('setTimeout', (fn, ms) => { const id = ++seq; timers.set(id, { at: now + Math.max(0, ms || 0), fn, id }); return id; });
  set('clearTimeout', (id) => { timers.delete(id); });
  set('setInterval', () => 0);
  set('navigator', { clipboard: { writeText: async () => {} } });
  set('localStorage', store);
  Date.now = () => now;
  const server = fakeServer(repos, config, { now: () => now });
  const flush = async () => { for (let i = 0; i < 10; i++) await new Promise((r) => setImmediate(r)); };
  const mod = await import(`../../src/public/sandbox.js?load=${++loads}`);
  const desk = mod.startSandbox({ config, call: (p, b) => server.call(p, b) });
  const app = {
    els, desk, server, flush, view: els.view, head,
    get now() { return now; },
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
    async go(h) {
      loc.hash = h;
      for (const fn of winListeners.hashchange || []) fn();
      await flush();
    },
    async visibility(state) {
      document.visibilityState = state;
      for (const fn of docListeners.visibilitychange || []) fn();
      await flush();
    },
    text: () => els.view.textContent,
    restore() {
      Date.now = realNow;
      desk.stop();
      for (const k of names) {
        if (saved[k]) Object.defineProperty(globalThis, k, saved[k]);
        else delete globalThis[k];
      }
    },
  };
  return app;
}
