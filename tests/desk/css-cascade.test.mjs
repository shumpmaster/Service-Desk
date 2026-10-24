// ac-test: S-001/AC88 — the css-cascade helper AC88's tests read the stylesheets with (tests/desk/css-cascade.mjs): after MD3,
// stage 8 ((b) item 37; stage 7's review, round 1 note 5 and round 2 note 5), it fails loudly on what it can't read —
// unknown pseudo-classes, pseudo-elements and at-rules — reads `accent-color` and `::placeholder`, keeps each node's
// effective opacity, and merges shorthands with their longhands as a browser does. Every stylesheet here is made up.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './helpers.mjs';
import { parseCss, cascade, nodes, COLOUR_PROPS } from './css-cascade.mjs';

const ENV = { scheme: 'light', width: 360, reducedMotion: false };
/** A small made-up tree: html > body > main > [the given kids], each { tag, cls, kids }. */
function tree(kids) {
  const node = (tag, cls, parent) => ({ tag, cls: new Set(cls), attrs: {}, parent, kids: [], text: '', el: null });
  const html = node('html', [], null);
  const body = node('body', [], html);
  html.kids.push(body);
  const add = (spec, parent) => { const n = node(spec.tag, spec.cls || [], parent); n.text = spec.text || ''; parent.kids.push(n); for (const k of spec.kids || []) add(k, n); return n; };
  for (const k of kids) add(k, body);
  return html;
}
const run = (css, kids) => nodes(cascade(tree(kids), parseCss(css, 'made-up.css'), ENV));
const plain = (t) => String(t).replace(/⟦[^|⟧]*\|([^⟧]*)⟧/g, '$1');

test('css-cascade (stage 8): an unknown pseudo-class, pseudo-element or at-rule throws, never reads as nothing', () => {
  assert.throws(() => run('.a:nth-child(2) { color: red; }', [{ tag: 'p', cls: ['a'] }]), /pseudo-class :nth-child is not read/);
  assert.throws(() => run('.a:lang(en) { color: red; }', [{ tag: 'p', cls: ['a'] }]), /pseudo-class :lang is not read/);
  assert.throws(() => parseCss('.a::selection { color: red; }'), /pseudo-element ::selection is not read/);
  for (const at of ['@supports (display: grid)', '@layer base', '@container (min-width: 10px)']) {
    assert.throws(() => parseCss(`${at} { .a { color: red; } }`), /the at-rule @\w+ is not read/, at);
  }
  // What it does read still reads: @media, @font-face, @keyframes; the states that never match at rest; the structural ones.
  assert.doesNotThrow(() => parseCss('@media (prefers-color-scheme: dark) { .a { color: red; } } @font-face { font-family: x; } @keyframes k { from { opacity: 0; } }'));
  const ns = run('.a:hover { color: red; } .a:focus-visible { color: red; } .a:first-child { color: blue; } .a:not(.b) { font-weight: 600; }', [{ tag: 'p', cls: ['a'] }]);
  const p = ns.find((n) => n.cls.has('a'));
  assert.equal(plain(p.declared.get('color')), 'blue', 'at rest: no hover or focus');
  assert.equal(plain(p.declared.get('font-weight')), '600');
});

test('css-cascade (stage 8): `accent-color` is a colour property; `::placeholder` is cascaded for a text box; each node keeps its effective opacity', () => {
  assert.ok(COLOUR_PROPS.includes('accent-color'));
  const ns = run('.box::placeholder { color: #123456; } .fade { opacity: .5; } .in { opacity: 0.5; }', [{ tag: 'textarea', cls: ['box'] }, { tag: 'div', cls: ['fade'], kids: [{ tag: 'span', cls: ['in'], text: 'x' }] }]);
  const box = ns.find((n) => n.tag === 'textarea');
  assert.equal(plain(box.pseudo.placeholder.declared.get('color')), '#123456', 'the placeholder\'s colour, for AC88\'s token check');
  assert.equal(ns.find((n) => n.cls.has('in')).opacity, 0.25, 'its own times its parent\'s');
  assert.equal(ns.find((n) => n.tag === 'body').opacity, 1);
});

test('css-cascade (stage 8): a shorthand and its longhands are merged as a browser does — a later `font` resets an earlier `font-weight`, a later `background` an earlier `background-color`; a later longhand overrides its part', () => {
  const ns = run('.w { font-weight: 600; } .tap { font: 500 12px/1.4 x; } .g { background-color: #111111; } .h { background: #222222; } .k { background: #333333; } .k2 { background-color: #444444; }',
    [{ tag: 'p', cls: ['w', 'tap'], text: 't' }, { tag: 'div', cls: ['g', 'h'] }, { tag: 'div', cls: ['k', 'k2'] }]);
  const t = ns.find((n) => n.cls.has('tap'));
  assert.equal(t.declared.has('font-weight'), false, 'the shorthand, later, resets it');
  assert.equal(t.style.get('font-weight'), '500', 'stage 7\'s tap line: 500, as a browser shows it');
  const g = ns.find((n) => n.cls.has('g'));
  assert.equal(g.declared.has('background-color'), false);
  assert.equal(plain(g.declared.get('background')), '#222222', 'the later background wins the ground');
  const k = ns.find((n) => n.cls.has('k'));
  assert.equal(plain(k.declared.get('background-color')), '#444444', 'a later longhand overrides its part');
});

test('css-cascade (stage 8): the desk\'s own stylesheets read whole, with nothing it can\'t read', () => {
  assert.doesNotThrow(() => parseCss(readFileSync(join(SRC, 'public', 'style.css'), 'utf8'), 'style.css'));
  assert.doesNotThrow(() => parseCss(readFileSync(join(SRC, 'public', 'sandbox.css'), 'utf8'), 'sandbox.css'));
});
