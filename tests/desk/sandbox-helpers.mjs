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
  get nodeType() { return 1; }
  get childNodes() { return this.children; }
  get parentNode() { return this.parent; }
  append(...cs) { this.text = null; for (const c of cs) { const n = typeof c === 'string' ? new Text0(c) : c; if (n.parent) n.parent.removeChild(n); n.parent = this; this.children.push(n); } }
  appendChild(n) { this.append(n); return n; }
  insertBefore(n, ref) {
    if (ref == null) return this.appendChild(n);
    if (n.parent) n.parent.removeChild(n);
    this.text = null;
    const i = this.children.indexOf(ref);
    n.parent = this;
    this.children.splice(i < 0 ? this.children.length : i, 0, n);
    return n;
  }
  removeChild(n) { const i = this.children.indexOf(n); if (i >= 0) this.children.splice(i, 1); n.parent = null; return n; }
  replaceChildren(...cs) { for (const c of this.children) c.parent = null; this.children = []; this.append(...cs); }
  contains(n) { if (n === this) return true; return this.children.some((c) => c.contains && c.contains(n)); }
  get textContent() { return this.text != null ? this.text : this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { for (const c of this.children) c.parent = null; this.children = []; this.text = String(v); }
}
class Text0 extends Node0 { constructor(t) { super(); this.text = t; } get nodeType() { return 3; } }
export class El0 extends Node0 {
  constructor(tag) {
    super(); this.tag = tag; this.attrs = {}; this.className = ''; this.innerHTML = ''; this.listeners = {}; this.value = ''; this.dataset = {};
    this.scrollTop = 0; this.selectionStart = 0; this.selectionEnd = 0;
    this.classList = { add: (c) => { this.className = `${this.className} ${c}`.trim(); }, remove: (c) => { this.className = this.className.split(' ').filter((x) => x && x !== c).join(' '); },
      contains: (c) => this.className.split(' ').includes(c), toggle: (c, on) => { const want = on === undefined ? !this.className.split(' ').includes(c) : Boolean(on); if (want) { if (!this.className.split(' ').includes(c)) this.className = `${this.className} ${c}`.trim(); } else this.className = this.className.split(' ').filter((x) => x && x !== c).join(' '); return want; } };
  }
  get tagName() { return this.tag.toUpperCase(); }
  setAttribute(k, v) { this.attrs[k] = String(v); if (k.startsWith('data-')) this.dataset[k.slice(5)] = String(v); if (k === 'class') this.className = String(v); }
  getAttribute(k) { return k === 'class' ? (this.className || null) : (k in this.attrs ? this.attrs[k] : null); }
  hasAttribute(k) { return k === 'class' ? Boolean(this.className) : k in this.attrs; }
  removeAttribute(k) { delete this.attrs[k]; if (k.startsWith('data-')) delete this.dataset[k.slice(5)]; if (k === 'class') this.className = ''; }
  getAttributeNames() { return [...(this.className ? ['class'] : []), ...Object.keys(this.attrs)]; }
  addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); }
  dispatch(t, ev = {}) { const e = { type: t, target: this, preventDefault() {}, stopPropagation() {}, ...ev }; for (const fn of this.listeners[t] || []) fn(e); return e; }
  click() { this.dispatch('click'); }
  /** As a browser does: the element that had focus loses it first (blur, focusout), then this one gains it (focus, focusin). */
  focus() {
    const was = globalThis.document.activeElement;
    if (was === this) return;
    if (was && was.blur) was.blur();
    globalThis.document.activeElement = this;
    this.dispatch('focus');
    this.dispatch('focusin');
  }
  blur() {
    if (globalThis.document.activeElement !== this) return;
    globalThis.document.activeElement = null;
    this.dispatch('blur');
    this.dispatch('focusout');
  }
  setSelectionRange(a, b) { this.selectionStart = a; this.selectionEnd = b; }
  closest(sel) {
    const m = /^\[data-([a-z-]+)\]$/.exec(sel);
    for (let n = this; n && n instanceof El0; n = n.parent) if (m ? m[1] in n.dataset : false) return n;
    return null;
  }
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
/**
 * The desk page under the fake DOM. From stage 8 (AC44, step 4) it is the desk at `/`, so `search` is '' unless a test
 * gives an address of its own. `entry: true` loads the page's own entry, src/public/app.js, as index.html does, which
 * imports the desk itself with J7's committed config (src/config/projects.json): the fake desk function then answers
 * through `fetch`, and `desk` is null.
 */
export async function loadSandbox({ config, repos, hash = '#/', search = '', now: start = Date.parse('2026-10-14T15:00:00Z'), store = null, win = {}, globals = {}, entry = false, breakView = false, visibility = 'visible', serverConfig = null }) {
  const { fakeServer } = await import('./fake-desk.mjs');
  const names = ['document', 'window', 'location', 'Node', 'setTimeout', 'clearTimeout', 'setInterval', 'navigator', 'localStorage', 'Notification', 'history', 'fetch'];
  const saved = Object.fromEntries(names.map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  let now = start;
  const realNow = Date.now;
  const timers = new Map();
  let seq = 0;
  const winListeners = {};
  const docListeners = {};
  const docCapture = {}; // from VT3's round 4: the document's capture-phase listeners, run before the target's own
  const els = { view: new El0('main'), 'screen-state': new El0('p'), foot: new El0('footer') };
  const head = new El0('head');
  // `breakView`: every change to the view throws, so no drawing, the render-error screen's included, can reach it (PR #40 review, N6).
  if (breakView) for (const m of ['append', 'appendChild', 'insertBefore', 'removeChild', 'replaceChildren']) els.view[m] = () => { throw new Error('view is broken'); };
  const set = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
  set('Node', Node0);
  set('document', {
    activeElement: null, title: '', visibilityState: visibility, head, documentElement: new El0('html'),
    createElement: (t) => new El0(t), createElementNS: (ns, t) => new El0(t), createTextNode: (t) => new Text0(t),
    getElementById: (id) => els[id] || null,
    addEventListener: (t, fn, opt) => { ((opt === true || (opt && opt.capture)) ? (docCapture[t] ||= []) : (docListeners[t] ||= [])).push(fn); },
  });
  // From 2026-10-19 the tap's `?sandbox&open=<key>` (search); history.replaceState records the address left after it.
  const loc = { hash, search, pathname: '/' };
  set('location', loc);
  const addresses = [];
  set('history', { replaceState: (s0, t, u) => { addresses.push(u); } });
  const scrolls = [];
  const intervals = [];
  set('window', { scrollY: 0, innerWidth: 360, innerHeight: 740, scrollTo(x, y) { scrolls.push([x, y]); }, addEventListener: (t, fn) => { (winListeners[t] ||= []).push(fn); },
    setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms), ...win });
  set('setTimeout', (fn, ms) => { const id = ++seq; timers.set(id, { at: now + Math.max(0, ms || 0), fn, id }); return id; });
  set('clearTimeout', (id) => { timers.delete(id); });
  set('setInterval', (fn, ms) => { intervals.push({ fn, ms }); return intervals.length; });
  set('navigator', { clipboard: { writeText: async () => {} }, ...(globals.navigator || {}) });
  set('localStorage', store);
  set('Notification', globals.Notification); // AC75's control (from 2026-10-18); none by default
  Date.now = () => now;
  // `serverConfig` (from VT3's round 2): the desk function's own J7 where a test gives the page keys the function's check
  // would refuse (J7's `portfolio` takes `repo` and `defaultBranch` alone), so the page's drawing of them can be tested.
  const server = fakeServer(repos, serverConfig || config, { now: () => now });
  const held = { server };
  const flush = async () => { for (let i = 0; i < 10; i++) await new Promise((r) => setImmediate(r)); };
  let mod = null;
  let desk = null;
  if (entry) {
    set('fetch', async (path, init) => {
      const r = await held.server.call(path, JSON.parse(init.body));
      if (!r.ok) return { status: r.status || 500, ok: false, type: 'basic', text: async () => 'error' };
      return { status: 200, ok: true, type: 'basic', text: async () => JSON.stringify(r.json) };
    });
    await import(`../../src/public/app.js?load=${++loads}`);
    await flush();
  } else {
    mod = await import(`../../src/public/sandbox.js?load=${++loads}`);
    desk = mod.startSandbox({ config, call: (p, b) => held.server.call(p, b) });
  }
  const app = {
    els, desk, server, flush, view: els.view, head, scrolls, loc, module: mod, addresses,
    /** The sandbox's 15-second tick (setInterval), run once. */
    async tick() { for (const i of intervals) if (i.ms === 15_000) i.fn(); await flush(); },
    /** A key pressed on the document (Escape and the like). */
    async key(k) { for (const fn of docListeners.keydown || []) fn({ key: k, target: document.activeElement, preventDefault() {} }); await flush(); },
    /** An event that reaches the document's own listeners (AC80's drag: pointermove, pointerup, touchmove). */
    async docEvent(type, ev = {}) {
      let cancelled = false;
      const e = { type, target: els.view, preventDefault() { cancelled = true; }, stopPropagation() {}, ...ev };
      for (const fn of docListeners[type] || []) fn(e);
      await flush();
      return { cancelled };
    },
    /** A tap on the document's background, outside any sheet or bubble. */
    async tapOutside(target = els.view) { for (const t of ['pointerdown', 'click']) for (const fn of docListeners[t] || []) fn({ type: t, target, pointerType: 'touch', preventDefault() {} }); await flush(); },
    /**
     * A real tap or click on an element, in a browser's order: pointerdown on it (then on the
     * document, as it bubbles), the old focus lost (blur, focusout), focus on it (focus, focusin),
     * then click on it (then on the document). A mouse first hovers it (pointerenter).
     */
    async tap(el, { pointerType = 'touch', hover = pointerType === 'mouse' } = {}) {
      const ev = (type) => ({ type, target: el, pointerType, preventDefault() {}, stopPropagation() {} });
      if (hover) { el.dispatch('pointerenter', ev('pointerenter')); await flush(); }
      for (const fn of docCapture.pointerdown || []) fn(ev('pointerdown'));
      el.dispatch('pointerdown', ev('pointerdown'));
      for (const fn of docListeners.pointerdown || []) fn(ev('pointerdown'));
      await flush();
      // A press on something that takes focus focuses it; a press anywhere else leaves focus on the page.
      const focusable = (n) => { for (; n && n instanceof El0; n = n.parent) if (['a', 'button', 'input', 'textarea', 'select', 'summary'].includes(n.tag) || 'tabindex' in n.attrs) return n; return null; };
      const into = focusable(el);
      if (into) into.focus();
      else if (globalThis.document.activeElement && globalThis.document.activeElement.blur) globalThis.document.activeElement.blur();
      await flush();
      for (const fn of docCapture.click || []) fn(ev('click'));
      el.dispatch('click', ev('click'));
      for (const fn of docListeners.click || []) fn(ev('click'));
      await flush();
    },
    /**
     * A keyboard activation of a control (Enter or Space): no pointer, so no pointerdown; the focus on it, then its click, the
     * document's capture-phase listeners first, then the control's own, then the document's (from VT3's round 4).
     */
    async press(el) {
      const ev = (type) => ({ type, target: el, pointerType: '', detail: 0, preventDefault() {}, stopPropagation() {} });
      if (el.focus) el.focus();
      await flush();
      for (const fn of docCapture.click || []) fn(ev('click'));
      el.dispatch('click', ev('click'));
      for (const fn of docListeners.click || []) fn(ev('click'));
      await flush();
    },
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
    /** The window resized (a turned phone, a resized window): its width changes and its resize listeners run. */
    async resize(width) {
      window.innerWidth = width;
      for (const fn of winListeners.resize || []) fn();
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
    /** An event that reaches the window's own listeners (pagehide, an unload, and pageshow: AC25's windows, from VT2), with `props`. */
    async winEvent(type, props = {}) {
      for (const fn of winListeners[type] || []) fn({ type, ...props });
      await flush();
    },
    text: () => els.view.textContent,
    restore() {
      Date.now = realNow;
      if (desk) desk.stop();
      held.server = null;
      for (const k of names) {
        if (saved[k]) Object.defineProperty(globalThis, k, saved[k]);
        else delete globalThis[k];
      }
    },
  };
  return app;
}

/**
 * AC67, changed after MD3 (stage 4; P-001-audit-team.md, B): the Team screen folds its idle members into "<n> idle ›".
 * Opens them as the owner's tap does, so a test can read every member's card and link; nothing when none is idle or
 * they are open already.
 */
export async function openIdle(app) {
  const b = findAll(app.view, (e) => e.dataset && e.dataset.k === 'team-idle')[0];
  if (b && b.attrs['aria-expanded'] === 'false') await app.tap(b);
}
