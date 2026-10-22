// A small CSS cascade for the fake DOM (spec S-001, AC88): the suite has no browser (AC80's method), so
// AC88's test reads src/public/sandbox.css (and style.css, which the page loads first) and works out, for
// each element the sandbox draws, the declarations that reach it, as a browser would: selectors matched
// right to left with their combinators, :is/:where/:not/:has, attribute and structural pseudo-classes,
// @media for the theme and width asked for, specificity and source order, inheritance, and var() with its
// fallback. Each colour keeps where it came from: the custom property that held its literal value, so a
// test can say whether it resolves to one of AC81's tokens. Interaction states (:hover, :focus-visible)
// never match: the screen is read at rest.

/** Strip comments, keeping line breaks. */
const uncomment = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

/** Split at top-level commas (outside parentheses and quotes). */
export function splitTop(s, sep = ',') {
  const out = [];
  let depth = 0;
  let q = null;
  let cur = '';
  for (const c of s) {
    if (q) { cur += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '(' || c === '[') depth++;
    if (c === ')' || c === ']') depth--;
    if (c === sep && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter((x) => x !== '');
}

/** The rules of a stylesheet, in order: { sel, decls: [{ prop, value, important }], media, order, sheet }. */
export function parseCss(text, sheet = 'sheet') {
  const src = uncomment(text);
  const rules = [];
  let order = 0;
  const block = (from) => {
    // from: index just past '{'; returns the index just past the matching '}'
    let depth = 1;
    let i = from;
    for (; i < src.length && depth > 0; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
    }
    return i;
  };
  const walk = (start, end, media) => {
    let i = start;
    while (i < end) {
      const open = src.indexOf('{', i);
      if (open < 0 || open >= end) break;
      const prelude = src.slice(i, open).trim();
      const close = block(open + 1);
      if (prelude.startsWith('@media')) walk(open + 1, close - 1, [...media, prelude.slice(6).trim()]);
      else if (prelude.startsWith('@')) { /* @font-face, @keyframes: no element styles */ } else if (prelude && !/^(from|to|\d+%)$/.test(prelude)) {
        const body = src.slice(open + 1, close - 1);
        const decls = [];
        for (const d of splitTop(body, ';')) {
          const k = d.indexOf(':');
          if (k < 0) continue;
          let value = d.slice(k + 1).trim();
          const important = /!important$/.test(value);
          if (important) value = value.replace(/\s*!important$/, '');
          decls.push({ prop: d.slice(0, k).trim().toLowerCase(), value, important });
        }
        for (const sel of splitTop(prelude)) rules.push({ sel, parsed: parseSelector(sel), decls, media, order: order++, sheet });
      }
      i = close;
    }
  };
  walk(0, src.length, []);
  return rules;
}

// ---------------------------------------------------------------------------
// Selectors

/** A complex selector as compounds right to left: [{ compound, comb }] where comb joins it to the one on its left. */
export function parseSelector(sel) {
  const parts = [];
  let i = 0;
  let cur = '';
  let depth = 0;
  let q = null;
  const push = (comb) => { if (cur.trim()) parts.push({ text: cur.trim(), comb }); cur = ''; };
  let pendingComb = ' ';
  while (i < sel.length) {
    const c = sel[i];
    if (q) { cur += c; if (c === q) q = null; i++; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; i++; continue; }
    if (c === '(' || c === '[') depth++;
    if (c === ')' || c === ']') depth--;
    if (depth === 0 && /[\s>+~]/.test(c)) {
      let j = i;
      let comb = ' ';
      while (j < sel.length && /[\s>+~]/.test(sel[j])) { if (sel[j] !== ' ' && sel[j] !== '\n' && sel[j] !== '\t') comb = sel[j]; j++; }
      if (cur.trim()) { parts.push({ text: cur.trim(), comb: pendingComb }); cur = ''; pendingComb = comb; }
      i = j;
      continue;
    }
    cur += c;
    i++;
  }
  if (cur.trim()) parts.push({ text: cur.trim(), comb: pendingComb });
  // parts[k].comb joins part k to part k-1 (the first's is unused)
  const compounds = parts.map((p) => ({ simple: parseCompound(p.text), comb: p.comb }));
  return compounds;
}

/** A compound selector's simple parts: tag, classes, id, attributes, pseudo-classes, pseudo-element. */
function parseCompound(text) {
  const out = { tag: null, classes: [], id: null, attrs: [], pseudos: [], element: null };
  let i = 0;
  const ident = () => { const m = /^-?[A-Za-z_\\][\w\\-]*/.exec(text.slice(i)); i += m ? m[0].length : 0; return m ? m[0] : ''; };
  const balanced = () => {
    // at '(' : returns the inside
    let depth = 0;
    const s = i;
    for (; i < text.length; i++) {
      if (text[i] === '(') depth++;
      else if (text[i] === ')') { depth--; if (depth === 0) { i++; break; } }
    }
    return text.slice(s + 1, i - 1);
  };
  while (i < text.length) {
    const c = text[i];
    if (c === '*') { i++; continue; }
    if (c === '.') { i++; out.classes.push(ident()); continue; }
    if (c === '#') { i++; out.id = ident(); continue; }
    if (c === '[') {
      const end = text.indexOf(']', i);
      const inner = text.slice(i + 1, end);
      i = end + 1;
      const m = /^([\w-]+)\s*(?:([~|^$*]?=)\s*("([^"]*)"|'([^']*)'|[^\]\s]+))?\s*$/.exec(inner);
      if (m) out.attrs.push({ name: m[1], op: m[2] || null, value: m[4] ?? m[5] ?? (m[3] && !/^["']/.test(m[3]) ? m[3] : m[3] ? '' : null) });
      continue;
    }
    if (c === ':') {
      if (text[i + 1] === ':') { i += 2; out.element = ident().toLowerCase(); if (text[i] === '(') balanced(); continue; }
      i++;
      const name = ident().toLowerCase();
      let arg = null;
      if (text[i] === '(') arg = balanced();
      out.pseudos.push({ name, arg, list: arg != null && ['is', 'where', 'not', 'has'].includes(name) ? splitTop(arg).map(parseSelector) : null });
      continue;
    }
    out.tag = ident().toLowerCase();
  }
  return out;
}

/** [ids, classes, elements] of a parsed complex selector. */
export function specificity(parsed) {
  let a = 0; let b = 0; let c = 0;
  for (const { simple } of parsed) {
    if (simple.id) a++;
    b += simple.classes.length + simple.attrs.length;
    if (simple.tag) c++;
    if (simple.element) c++;
    for (const p of simple.pseudos) {
      if (p.name === 'where') continue;
      if (p.list) {
        const best = p.list.map(specificity).reduce((m, x) => (cmp(x, m) > 0 ? x : m), [0, 0, 0]);
        a += best[0]; b += best[1]; c += best[2];
      } else b++;
    }
  }
  return [a, b, c];
}
const cmp = (x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];

const STATES = new Set(['hover', 'focus', 'focus-visible', 'focus-within', 'active', 'visited', 'checked', 'target', 'placeholder-shown', 'invalid', 'indeterminate']);

function matchCompound(n, s, pseudoEl) {
  if (s.element && s.element !== pseudoEl) return false;
  if (!s.element && pseudoEl) return false;
  if (s.tag && s.tag !== n.tag) return false;
  if (s.id && n.attrs.id !== s.id) return false;
  for (const c of s.classes) if (!n.cls.has(c)) return false;
  for (const a of s.attrs) {
    const v = a.name === 'class' ? [...n.cls].join(' ') : n.attrs[a.name];
    if (v == null) return false;
    if (a.op === '=' && v !== a.value) return false;
    if (a.op === '~=' && !v.split(/\s+/).includes(a.value)) return false;
    if (a.op === '^=' && !v.startsWith(a.value)) return false;
    if (a.op === '*=' && !v.includes(a.value)) return false;
  }
  for (const p of s.pseudos) {
    if (p.name === 'is' || p.name === 'where') { if (!p.list.some((x) => matchComplex(n, x, null))) return false; continue; }
    if (p.name === 'not') { if (p.list.some((x) => matchComplex(n, x, null))) return false; continue; }
    if (p.name === 'has') { if (!p.list.some((x) => descendants(n).some((d) => matchComplex(d, x, null)))) return false; continue; }
    if (p.name === 'root') { if (n.parent) return false; continue; }
    const sibs = n.parent ? n.parent.kids : [n];
    if (p.name === 'first-child') { if (sibs[0] !== n) return false; continue; }
    if (p.name === 'last-child') { if (sibs[sibs.length - 1] !== n) return false; continue; }
    if (p.name === 'only-child') { if (sibs.length !== 1) return false; continue; }
    if (p.name === 'empty') { if (n.kids.length || n.text) return false; continue; }
    if (p.name === 'disabled') { if (!('disabled' in n.attrs)) return false; continue; }
    if (STATES.has(p.name) || p.name.startsWith('-webkit-') || p.name.startsWith('-moz-')) return false;
    return false; // anything else: not matched (none is used for colours)
  }
  return true;
}
const descendants = (n, out = []) => { for (const k of n.kids) { out.push(k); descendants(k, out); } return out; };

/** Whether node n matches a parsed complex selector (for pseudo-element pseudoEl, or the element itself). */
export function matchComplex(n, parsed, pseudoEl) {
  const last = parsed.length - 1;
  if (!matchCompound(n, parsed[last].simple, pseudoEl)) return false;
  const back = (node, k) => {
    if (k < 0) return true;
    const comb = parsed[k + 1].comb;
    const s = parsed[k].simple;
    if (comb === '>') return node.parent ? matchCompound(node.parent, s, null) && back(node.parent, k - 1) : false;
    if (comb === ' ') { for (let a = node.parent; a; a = a.parent) if (matchCompound(a, s, null) && back(a, k - 1)) return true; return false; }
    const sibs = node.parent ? node.parent.kids : [];
    const at = sibs.indexOf(node);
    if (comb === '+') return at > 0 && matchCompound(sibs[at - 1], s, null) && back(sibs[at - 1], k - 1);
    if (comb === '~') { for (let j = at - 1; j >= 0; j--) if (matchCompound(sibs[j], s, null) && back(sibs[j], k - 1)) return true; return false; }
    return false;
  };
  return back(n, last - 1);
}

// ---------------------------------------------------------------------------
// Media

/** Whether an @media condition holds for { width, scheme, reducedMotion }. */
export function mediaHolds(cond, env) {
  return cond.split(/\s+and\s+/).every((part) => {
    const m = /\(\s*([\w-]+)\s*:\s*([^)]+?)\s*\)/.exec(part);
    if (!m) return true;
    const [, f, v] = m;
    if (f === 'prefers-color-scheme') return v === env.scheme;
    if (f === 'prefers-reduced-motion') return v === (env.reducedMotion ? 'reduce' : 'no-preference');
    if (f === 'forced-colors') return v === 'none';
    if (f === 'min-width') return env.width >= parseFloat(v);
    if (f === 'max-width') return env.width <= parseFloat(v);
    return false;
  });
}

// ---------------------------------------------------------------------------
// The tree: the page's root, body and view, then every element the sandbox drew (with renderMarkdown's
// escaped output parsed into elements too, as the browser would parse it).

function nodeOf(tag, cls, attrs, parent) {
  return { tag, cls: new Set(cls.filter(Boolean)), attrs, parent, kids: [], text: '', el: null };
}

/** A tiny parser for renderMarkdown's output: tags with their attributes, and text. */
function htmlKids(html, parent) {
  const VOID = new Set(['br', 'hr', 'img', 'input', 'wbr']);
  let cur = parent;
  for (const m of String(html).matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g)) {
    if (m[4] != null) { cur.text += m[4].replace(/&[a-z#0-9]+;/g, 'x'); continue; }
    const tag = m[2].toLowerCase();
    if (m[1]) { if (cur !== parent) cur = cur.parent; continue; }
    const attrs = {};
    for (const a of m[3].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] ?? '';
    const n = nodeOf(tag, (attrs.class || '').split(/\s+/), attrs, cur);
    cur.kids.push(n);
    if (!VOID.has(tag) && !/\/$/.test(m[3])) cur = n;
  }
}

/** The tree for a sandbox app (tests/desk/sandbox-helpers.mjs): html > body > main#view > what it drew. */
export function treeOf(view, root) {
  const html = nodeOf('html', String(root.className || '').split(/\s+/), { ...(root.attrs || {}) }, null);
  const body = nodeOf('body', [], {}, html);
  html.kids.push(body);
  const main = nodeOf('main', [], { id: 'view' }, body);
  body.kids.push(main);
  const add = (el, parent) => {
    for (const c of el.children || []) {
      if (c.nodeType === 3) { parent.text += String(c.text || ''); continue; }
      if (!c.tag) continue;
      const attrs = { ...c.attrs };
      const n = nodeOf(String(c.tag).toLowerCase(), String(c.className || '').split(/\s+/), attrs, parent);
      n.el = c;
      parent.kids.push(n);
      if (c.text != null && !(c.children || []).length) n.text += String(c.text);
      if (c._html) htmlKids(c._html, n);
      add(c, n);
    }
  };
  add(view, main);
  return html;
}

// ---------------------------------------------------------------------------
// The cascade

const INHERITED = new Set(['color', 'fill', 'stroke', 'font-family', 'font-size', 'font-weight', 'line-height', 'visibility']);
const COLOUR_PROPS = ['color', 'background', 'background-color', 'background-image', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-inline-start', 'outline', 'outline-color', 'fill', 'stroke', 'box-shadow'];
export { COLOUR_PROPS };

/** Rules indexed by their subject compound's first class, else its tag, else '*'. */
function index(rules) {
  const by = new Map();
  for (const r of rules) {
    const s = r.parsed[r.parsed.length - 1].simple;
    const key = s.classes.length ? `.${s.classes[0]}` : s.tag ? s.tag : s.id ? `#${s.id}` : '*';
    if (!by.has(key)) by.set(key, []);
    by.get(key).push(r);
  }
  return by;
}

/**
 * Resolve var() in `value` against `env` (name → { value, from }), keeping each substitution's origin: the
 * returned text marks every substituted literal as ⟦name|value⟧, name the custom property that held it.
 */
export function resolveVars(value, env, seen = new Set()) {
  let out = '';
  let i = 0;
  while (i < value.length) {
    const k = value.indexOf('var(', i);
    if (k < 0) { out += value.slice(i); break; }
    out += value.slice(i, k);
    let depth = 0;
    let j = k + 3;
    for (; j < value.length; j++) {
      if (value[j] === '(') depth++;
      else if (value[j] === ')') { depth--; if (depth === 0) break; }
    }
    const inner = value.slice(k + 4, j);
    const comma = splitTop(inner);
    const name = comma[0];
    const fallback = comma.length > 1 ? inner.slice(inner.indexOf(',') + 1).trim() : null;
    const got = !seen.has(name) && env.get(name);
    if (got && got.value != null) out += got.value;
    else if (fallback != null) out += resolveVars(fallback, env, seen);
    else out += '⟦invalid⟧';
    i = j + 1;
  }
  return out;
}

/**
 * Compute every node's styles: node.custom (name → { value, from }), node.style (prop → resolved text),
 * node.declared (prop → resolved text, only what a rule set on it), node.pseudo.before/after (likewise).
 */
export function cascade(tree, rules, env) {
  const live = rules.filter((r) => r.media.every((m) => mediaHolds(m, env)));
  const by = index(live);
  const spec = new Map(live.map((r) => [r, specificity(r.parsed)]));
  const candidates = (n) => {
    const out = [...(by.get('*') || []), ...(by.get(n.tag) || [])];
    for (const c of n.cls) out.push(...(by.get(`.${c}`) || []));
    if (n.attrs.id) out.push(...(by.get(`#${n.attrs.id}`) || []));
    return out;
  };
  const winners = (n, pseudoEl) => {
    const hits = candidates(n).filter((r) => matchComplex(n, r.parsed, pseudoEl));
    const decls = [];
    for (const r of hits) for (const d of r.decls) decls.push({ ...d, spec: spec.get(r), order: r.order, sel: r.sel });
    decls.sort((a, b) => (a.important - b.important) || cmp(a.spec, b.spec) || a.order - b.order);
    const win = new Map();
    for (const d of decls) win.set(d.prop, d);
    return win;
  };
  const custom = (win, parentEnv) => {
    const own = [...win.values()].filter((d) => d.prop.startsWith('--'));
    const envMap = new Map(parentEnv);
    const raw = new Map(own.map((d) => [d.prop, d.value]));
    const resolving = new Set();
    const get = (name) => {
      if (!raw.has(name)) return envMap.get(name);
      if (resolving.has(name)) return { value: null, from: name };
      resolving.add(name);
      const view = { get: (k) => (k === name ? undefined : get(k)) };
      const text = resolveVars(raw.get(name), view);
      resolving.delete(name);
      // A literal value (no var() in it) is marked with its own name: that name is where its colour comes from.
      const marked = /var\(/.test(raw.get(name)) ? text : `⟦${name}|${text}⟧`;
      const v = { value: /⟦invalid⟧/.test(text) ? null : marked, from: name };
      raw.delete(name);
      envMap.set(name, v);
      return v;
    };
    for (const d of own) get(d.prop);
    return envMap;
  };
  const visit = (n, parent) => {
    const win = winners(n, null);
    n.custom = custom(win, parent ? parent.custom : new Map());
    const view = { get: (k) => n.custom.get(k) };
    n.declared = new Map();
    n.decl = new Map();
    for (const [prop, d] of win) {
      if (prop.startsWith('--')) continue;
      n.declared.set(prop, resolveVars(d.value, view));
      n.decl.set(prop, d);
    }
    // Inherited and shorthand-derived properties.
    n.style = new Map();
    for (const p of INHERITED) if (parent && parent.style.has(p)) n.style.set(p, parent.style.get(p));
    const font = n.declared.get('font');
    if (font && font !== 'inherit') {
      const m = /^(?:(italic|normal)\s+)?(?:(\d{3}|bold|normal)\s+)?([\d.]+)(px|rem|em)(?:\/[\d.]+(?:px)?)?\s+(.+)$/.exec(font.replace(/⟦[^|]*\|([^⟧]*)⟧/g, '$1'));
      if (m) {
        const px = m[4] === 'px' ? Number(m[3]) : m[4] === 'rem' ? Number(m[3]) * 16 : Number(m[3]) * parseFloat(n.style.get('font-size') || '16');
        n.style.set('font-size', `${px}px`);
        n.style.set('font-weight', m[2] === 'bold' ? '700' : m[2] && m[2] !== 'normal' ? m[2] : '400');
        n.style.set('font-family', m[5]);
      } else n.style.set('font', font);
    }
    for (const p of ['font-size', 'font-weight', 'font-family', 'color', 'fill', 'stroke', 'visibility']) {
      const v = n.declared.get(p);
      if (v != null && v !== 'inherit') n.style.set(p, v);
    }
    if (!n.style.has('font-weight') && ['b', 'strong', 'th', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(n.tag)) n.style.set('font-weight', '700');
    n.pseudo = {};
    for (const pe of ['before', 'after']) {
      const pw = winners(n, pe);
      if (!pw.size) continue;
      const pv = { get: (k) => n.custom.get(k) };
      const declared = new Map();
      for (const [prop, d] of pw) if (!prop.startsWith('--')) declared.set(prop, resolveVars(d.value, pv));
      n.pseudo[pe] = { declared, decl: pw };
    }
    for (const k of n.kids) visit(k, n);
  };
  visit(tree, null);
  return tree;
}

/** Every node of a tree, in document order. */
export const nodes = (tree, out = []) => { out.push(tree); for (const k of tree.kids) nodes(k, out); return out; };
