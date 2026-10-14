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
