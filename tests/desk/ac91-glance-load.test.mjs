// ac-test: S-001/AC91 — G4 of "After the glance audit": the failed-load screen, part (k) (specs/S-001.md, AC91 (k): "when
// the desk's own code fails to load (app.js:124-140), the page shows "The desk couldn't load." in `--t-lead` `--ink`, with
// a ✕ in `--bad` before it, and under it a "Reload" button, at least 44 px tall, in 500 15 px (the briefing's pair), which
// reloads the page; nothing else, and never anything that reads as quiet. app.js draws the ✕ itself, as an inline SVG,
// since sandbox.js, whose `vi()` draws the desk's icons, is the code that failed; where sandbox.css can't load either, the
// words and the button still show and work in style.css's look"), with AC89 (h)'s changed part.
// ac-test: S-001/AC89
//
// The page's own entry, src/public/app.js, copied byte for byte into a scratch folder beside a link to src/public/lib/
// and with no sandbox.js, so its `import('./sandbox.js')` fails as a network drop or a stale cache makes it fail in the
// browser; it runs under the desk's fake DOM (sandbox-helpers.mjs's elements). The look is the cascade of the page's own
// stylesheets over what it drew (tests/desk/css-cascade.mjs), with sandbox.css and with style.css alone, in light and
// dark. The Chromium captures are the stage's (tests/desk/tools/glance-shots.mjs, `g4-failed-load`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, copyFileSync, symlinkSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { SRC } from './helpers.mjs';
import { El0, Node0, byClass, findAll } from './sandbox-helpers.mjs';
import { parseCss, treeOf, cascade, nodes } from './css-cascade.mjs';
import { LOAD_FAILED_WORDS } from '../../src/lib/page.js';

const PUBLIC = join(SRC, 'public');
const STYLE = parseCss(readFileSync(join(PUBLIC, 'style.css'), 'utf8'), 'style.css');
const SANDBOX = parseCss(readFileSync(join(PUBLIC, 'sandbox.css'), 'utf8'), 'sandbox.css').map((r) => ({ ...r, order: r.order + STYLE.length }));
/** A text node of the fake DOM (nodeType 3), for app.js's own `h()`. */
class Text1 extends Node0 {
  constructor(t) { super(); this.text = t; }
  get nodeType() { return 3; }
}
const plain = (v) => String(v == null ? '' : v).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');

/** app.js loaded with the desk's code missing: { view, els, html, head, reloads, title, restore }. */
async function failedLoad() {
  const dir = mkdtempSync(join(tmpdir(), 'g4-failed-load-'));
  copyFileSync(join(PUBLIC, 'app.js'), join(dir, 'app.js'));
  symlinkSync(join(PUBLIC, 'lib'), join(dir, 'lib'), 'dir');
  assert.ok(!existsSync(join(dir, 'sandbox.js')), 'no desk code beside it');
  const names = ['document', 'window', 'location', 'Node', 'history', 'fetch'];
  const saved = Object.fromEntries(names.map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  const set = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
  const els = { view: new El0('main'), 'screen-state': new El0('p'), foot: new El0('footer'), top: new El0('header') };
  els.view.append(Object.assign(new El0('p'), { text: 'Checking…' }));
  const html = new El0('html');
  const one = html.classList.add;
  html.classList.add = (...cs) => { for (const c of cs) one(c); }; // as the browser's DOMTokenList.add, which takes several
  const head = new El0('head');
  const out = { view: els.view, els, html, head, reloads: 0 };
  set('Node', Node0);
  set('document', { title: 'Service Desk', head, documentElement: html, visibilityState: 'visible', getElementById: (id) => els[id] || null,
    createElement: (t) => new El0(t), createElementNS: (ns, t) => Object.assign(new El0(t), { ns }), createTextNode: (t) => new Text1(t),
    querySelector: () => null, addEventListener: () => {} });
  set('location', { search: '', hash: '#/', pathname: '/', reload: () => { out.reloads++; } });
  set('window', { addEventListener: () => {} });
  set('history', { replaceState: () => {} });
  const quiet = console.error;
  console.error = () => {}; // the failed import's trace, which the page keeps (startDesk), is expected here
  try {
    await import(`${pathToFileURL(join(dir, 'app.js')).href}?t=${Date.now()}`);
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  } finally {
    console.error = quiet;
    out.title = globalThis.document.title;
    rmSync(dir, { recursive: true, force: true });
  }
  /** Put the globals back (after the test's taps, which reach `location.reload`). */
  out.restore = () => {
    for (const k of names) {
      if (saved[k]) Object.defineProperty(globalThis, k, saved[k]);
      else delete globalThis[k];
    }
  };
  return out;
}

/** Each drawn element's cascaded look: el → { style(prop), decl(prop) }, with `rules`, in a theme, at 360 px. */
function looks(app, rules, theme) {
  const attrs = { ...(app.html.attrs || {}) };
  if (theme === 'dark') attrs['data-theme'] = 'dark'; else delete attrs['data-theme'];
  const tree = cascade(treeOf(app.view, { className: app.html.className, attrs }), rules, { scheme: 'light', width: 360, reducedMotion: false });
  const m = new Map();
  for (const n of nodes(tree)) if (n.el) m.set(n.el, { style: (p) => plain(n.style.get(p)), decl: (p) => plain(n.declared.get(p)) });
  return m;
}

test('AC91 (k): the desk\'s code failing to load — app.js shows "The desk couldn\'t load." with its own ✕ (an inline SVG) before it and a "Reload" button under it, nothing else; the button reloads the page; never "Checking…" or anything quiet', async () => {
  assert.equal(LOAD_FAILED_WORDS, "The desk couldn't load.");
  const app = await failedLoad();
  try {
    const screen = app.view.children;
    assert.equal(screen.length, 1, 'one screen in the view');
    const [section] = screen;
    assert.equal(section.tag, 'section');
    assert.equal(section.className, 'sb-screen v2-loadfail');
    assert.deepEqual(section.children.map((c) => c.tag), ['p', 'button'], 'the words, then the button: nothing else');
    const [line, button] = section.children;
    assert.equal(line.className, 'v2-lf');
    assert.equal(line.attrs.role, 'alert', 'said to assistive technology as it appears');
    assert.equal(line.textContent, "The desk couldn't load.");
    // The ✕: drawn by app.js, as an inline SVG, sized and stroked by its own attributes; hidden from assistive technology.
    const [x, words] = line.children;
    assert.equal(x.tag, 'svg');
    assert.equal(x.ns, 'http://www.w3.org/2000/svg');
    assert.equal(x.className, 'v2-k v2-lfx');
    assert.deepEqual([x.attrs.viewBox, x.attrs.width, x.attrs.height, x.attrs.fill, x.attrs.stroke, x.attrs['aria-hidden'], x.attrs.focusable],
      ['0 0 16 16', '16', '16', 'none', 'currentColor', 'true', 'false']);
    assert.deepEqual(x.children.map((p) => [p.tag, p.attrs.d]), [['path', 'M4.5 4.5l7 7M11.5 4.5l-7 7']], 'the desk\'s own ✕ (sandbox.js\'s V2_ICONS.bad)');
    assert.match(readFileSync(join(PUBLIC, 'sandbox.js'), 'utf8'), /\n {2}bad: \{ vb: 16, d: \['M4\.5 4\.5l7 7M11\.5 4\.5l-7 7'\] \},/, 'the same drawing as vi(\'bad\')');
    assert.equal(words.textContent, "The desk couldn't load.");
    // The button: "Reload", a real button, which reloads the page.
    assert.equal(button.textContent, 'Reload');
    assert.equal(button.attrs.type, 'button');
    assert.equal(button.className, 'v2-reload');
    assert.equal(app.reloads, 0);
    button.dispatch('click');
    assert.equal(app.reloads, 1, 'a tap reloads the page (location.reload)');
    // Said once on screen; the state line that also holds the words sits in the hidden header; the tab's title says it.
    assert.equal(app.els['screen-state'].textContent, "The desk couldn't load.");
    assert.equal(app.els.foot.hidden, true, 'the footer\'s "reading…" never shown');
    assert.equal(app.title, "Service Desk — The desk couldn't load.");
    assert.ok(!/Checking…|Quiet|Nothing/.test(app.view.textContent), 'never "Checking…", and nothing that reads as quiet');
    // On mockup v2's ground and tokens: the page's classes and sandbox.css asked for, as the desk itself does.
    assert.ok(app.html.classList.contains('sb') && app.html.classList.contains('v2-page'));
    assert.deepEqual(findAll(app.head, (e) => e.tag === 'link').map((l) => [l.attrs.rel, l.attrs.href]), [['stylesheet', 'sandbox.css']]);
  } finally {
    app.restore();
  }
});

test('AC91 (k): its look with sandbox.css, in light and dark — the words --t-lead (400 15 px/1.45) in --ink, the ✕ 16 px in --bad, the button at least 44 px tall in 500 15 px (the briefing\'s pair) in --ink', async () => {
  const app = await failedLoad();
  app.restore(); // the look only: nothing here is tapped
  const [section] = app.view.children;
  const [line, button] = section.children;
  const [x, words] = line.children;
  for (const [theme, ink, bad] of [['light', '#18191c', '#b3162a'], ['dark', '#ecedef', '#ff6b78']]) {
    const L = looks(app, [...STYLE, ...SANDBOX], theme);
    assert.equal(L.get(line).decl('font'), '400 15px/1.45 "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', `${theme}: --t-lead`);
    assert.equal(L.get(words).style('font-size'), '15px');
    assert.equal(L.get(words).style('font-weight'), '400');
    assert.equal(L.get(words).style('color'), ink, `${theme}: the words in --ink`);
    assert.equal(L.get(x).style('color'), bad, `${theme}: the ✕ in --bad`);
    assert.deepEqual([L.get(x).decl('width'), L.get(x).decl('height')], ['16px', '16px']);
    assert.equal(L.get(button).decl('min-height'), '44px', `${theme}: at least 44 px tall`);
    assert.equal(L.get(button).decl('font'), '500 15px/1.35 "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', `${theme}: 500 15 px`);
    assert.equal(L.get(button).style('color'), ink);
  }
  // Not the render-error screen's 12 px line (`.sb-stale`), which stays the desk's own for a drawing that throws.
  assert.ok(!byClass(app.view, 'sb-stale').length);
});

test('AC91 (k): with sandbox.css missing too, the words and the button still show and work in style.css\'s look — the ✕ in style.css\'s red, sized by its own attributes, the button still 44 px tall', async () => {
  const app = await failedLoad();
  try {
    const [section] = app.view.children;
    const [line, button] = section.children;
    const [x, words] = line.children;
    for (const [theme, fg, red] of [['light', '#1b1b1b', '#b3261e']]) {
      const L = looks(app, STYLE, theme);
      assert.equal(L.get(words).style('color'), fg, 'the words in the page\'s ink');
      assert.equal(L.get(x).style('color'), red, 'the ✕ in style.css\'s red (--flag), --bad being sandbox.css\'s');
      assert.equal(L.get(line).decl('display'), 'flex', 'the ✕ beside the words');
      assert.equal(L.get(button).decl('min-height'), '44px', 'still at least 44 px tall');
      assert.match(L.get(button).decl('padding'), /^8px 14px$/, 'style.css\'s own button');
    }
    assert.equal(x.attrs.width, '16', 'sized without any stylesheet');
    button.dispatch('click');
    assert.equal(app.reloads, 1, 'and it still reloads');
  } finally {
    app.restore();
  }
});
