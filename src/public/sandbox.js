// The MD sandbox view (spec S-001, AC43 B; AC35–AC42, AC48–AC53; J11), entered by `?sandbox`.
// It renders the design lab's agreed screens against the desk's live data: Home, then inside each
// project Status, Timeline, Team and Queue, with the response sheet over the queue. Without
// `?sandbox` the page is the accepted M2 view (app.js); nothing here runs.
//
// - Every screen carries the marker "Sandbox: candidate design".
// - It reuses the page's one poll scheduler and its data (AC14, AC42): J11's records are optional
//   blob reads through the same calls.
// - It answers cards and questions through the same J3 links as the real view, and nothing else.
//   The desk writes nothing: every answer is a GitHub new-file page the owner commits.
// - Record text is drawn as text nodes; card and question text only through the escaping markdown
//   renderer. Nothing loads from another origin (the CSP is unchanged).

import DEFAULT_CONFIG from './lib/config.js';
import { createDesk, callFunction, errorText } from './lib/scheduler.js';
import { createStore } from './lib/store.js';
import { safeBox, orderBoxes, screenState, boxStateText } from './lib/universe.js';
import { renderMarkdown } from './lib/markdown.js';
import { hhmm, durationText, whenText } from './lib/timefmt.js';
import { v5Footer, usageLines, notReadText } from './lib/asked.js';
import { routeParts, guardRender, boot, SIGNED_OUT_STATE } from './lib/page.js';
import { createSeen } from './lib/seen.js';
import {
  SANDBOX_MARKER, NOT_RECORDED, NOT_AVAILABLE, V25_NOT_RECORDED, OWNER_NEXT_LINES,
  j11Records, timelineOf, phaseView, whereLine, queueView, pillView, ballLines,
  sheetView, trackerSteps, doneToday, cardBoxText, questionBoxText, VERDICT_START, ruleLine, boxPlan, GROUPS, treeLink, waitWords, youWaitText,
} from './lib/sandbox.js';
import { teamView, memberPage, workingNow, summarySheet } from './lib/sandbox.js';
import { summaryView, latestText, HOME_GROUPS, HOME_GROUPS_KEY, homeGroupOf, groupHeaderWords, lastAction } from './lib/sandbox.js';
import { composeAnswer, numberedRuleLine, CANT_SPLIT, NO_RECOMMENDATION } from './lib/sandbox.js';
import { runsContext, statusPhases, tilePhases, markerView, feedView, unblocksOf, GROUP_MARK, memberIcon, memberWork, TEAM_KEY, itemFeeds,
  stalledLine, deployRows, FEED_ICONS_KEY, doneTarget, JOB_MERGE_WORDS } from './lib/feed.js';

import {
  NOTIFY_WORDS, NOTIFY_STORE_KEY, COPY_DONE_WORDS, SHOW_AGAIN_WORDS, SEND_TEST_WORDS, copySteps, testSteps, notifyState, onTopLine,
  isStandalone, permissionOf, currentSubscription, subscriptionValue, turnOn, USAGE_TITLE, usageView, RECHECK_WORDS, recheckOutcome,
} from './lib/notifyview.js';

let CONFIG = DEFAULT_CONFIG; // J7; the tests pass their own (AC42's five projects)
let DESK = null; // the reader, once started: AC77's re-read and "Answer it here instead", AC78's figures
let TZ = CONFIG.ownerTimeZone;
const SVGNS = 'http://www.w3.org/2000/svg';

// ---------------------------------------------------------------------------
// DOM helpers: text nodes only; `html` only ever takes renderMarkdown's escaped output.

/**
 * One listener per event type, dispatching to `el._on[type]`, so a redraw that keeps the element
 * (morph below) can hand it the new handler: no handler ever closes over a discarded element.
 */
function on(el, type, fn) {
  if (!el._on) el._on = {};
  // The handler gets the element that is on the screen (a redraw may have kept an older one).
  if (!(type in el._on)) el.addEventListener(type, (e) => (el._on[type] ? el._on[type](e, el) : undefined));
  el._on[type] = fn;
}

/**
 * attrs: `class`, `html` (only renderMarkdown's escaped output), `on<event>`, `key` (a stable
 * name, `data-k`, so a redraw keeps that element and the focus, scroll and folds on it), `live` (a
 * function giving the element's text: the 15-second tick calls it again, AC56) and any attribute.
 */
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'html') {
      el.innerHTML = v; // only ever renderMarkdown's escaped output
      el._html = v;
    } else if (k === 'live') el._live = v;
    else if (k === 'key') el.setAttribute('data-k', v);
    else if (k.startsWith('on')) on(el, k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  // Record text is drawn exactly as written. AC50's "Done" for "Graduated" is applied to the desk's
  // own labels and the model's milestone names only (lib/sandbox.js, deskWords).
  if (el._live) el.append(document.createTextNode(String(el._live())));
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

// ---------------------------------------------------------------------------
// A refresh patches the screen in place (AC56): the new drawing is compared with what is on the
// screen, and only what changed is changed. An element that stays keeps its focus, its scroll, the
// text being typed in it with its cursor, and every fold the owner opened or closed.

const tagOf = (n) => String(n.tagName || n.tag || '').toLowerCase();
const keyOf = (n) => (n.nodeType === 1 && n.getAttribute ? n.getAttribute('data-k') : null);
const attrNames = (n) => (n.getAttributeNames ? n.getAttributeNames() : []);
const sameKind = (a, b) => a.nodeType === b.nodeType && (a.nodeType !== 1 || (tagOf(a) === tagOf(b) && keyOf(a) === keyOf(b)));

function morphNode(o, n) {
  if (o.nodeType !== 1) {
    if (o.textContent !== n.textContent) o.textContent = n.textContent;
    return;
  }
  for (const name of attrNames(n)) {
    // A fold keeps the state the owner left it in; only its first drawing sets it.
    if (name === 'open' && tagOf(o) === 'details') continue;
    const v = n.getAttribute(name);
    if (o.getAttribute(name) !== v) o.setAttribute(name, v);
  }
  for (const name of attrNames(o)) {
    if (name === 'open' && tagOf(o) === 'details') continue;
    if (!n.hasAttribute(name)) o.removeAttribute(name);
  }
  if (n._on) for (const [type, fn] of Object.entries(n._on)) on(o, type, fn);
  if (o._on) for (const type of Object.keys(o._on)) if (!n._on || !(type in n._on)) o._on[type] = null;
  o._live = n._live;
  o._liveClass = n._liveClass;
  if (tagOf(o) === 'textarea' || tagOf(o) === 'input') {
    if (o.value !== n.value) o.value = n.value; // the draft is the truth; equal text leaves the cursor alone
    return;
  }
  if (n._html != null || o._html != null) {
    if (o._html !== n._html) {
      o.innerHTML = n._html || '';
      o._html = n._html;
    }
    return;
  }
  morphChildren(o, n);
}

function morphChildren(oldP, newP) {
  const olds = [...oldP.childNodes];
  const news = [...newP.childNodes];
  const keyed = new Map();
  for (const o of olds) {
    const k = keyOf(o);
    if (k != null && !keyed.has(k)) keyed.set(k, o);
  }
  const used = new Set();
  let cursor = 0;
  news.forEach((n, i) => {
    let match = null;
    const k = keyOf(n);
    if (k != null) {
      const o = keyed.get(k);
      if (o && !used.has(o) && sameKind(o, n)) match = o;
    } else {
      while (cursor < olds.length && (used.has(olds[cursor]) || keyOf(olds[cursor]) != null)) cursor++;
      const o = olds[cursor];
      if (o && sameKind(o, n)) {
        match = o;
        cursor++;
      }
    }
    let node = n;
    if (match) {
      used.add(match);
      morphNode(match, n);
      node = match;
    }
    const at = oldP.childNodes[i];
    if (at !== node) oldP.insertBefore(node, at || null);
  });
  while (oldP.childNodes.length > news.length) oldP.removeChild(oldP.childNodes[oldP.childNodes.length - 1]);
}

/** Every element under `root`, depth first. */
function eachElement(root, fn) {
  for (const c of [...(root.childNodes || [])]) {
    if (c.nodeType !== 1) continue;
    fn(c);
    eachElement(c, fn);
  }
}
const findKey = (root, k) => {
  let out = null;
  eachElement(root, (e) => { if (!out && keyOf(e) === k) out = e; });
  return out;
};

/** A quiet line icon (AC48: thin grey lines on a plain tile). `d` is a list of SVG path strings. */
const ICONS = {
  project: ['M5 5h6v6H5z', 'M13 5h6v6h-6z', 'M5 13h6v6H5z', 'M13 13h6v6h-6z'],
  status: ['M5 7h14', 'M5 12h14', 'M5 17h9'],
  timeline: ['M7 4v16', 'M7 8h5a3 3 0 0 1 3 3v1', 'M7 16h9'],
  team: ['M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M3.5 19a5.5 5.5 0 0 1 11 0', 'M16 11a2.5 2.5 0 1 0 0-5', 'M17 19a4.5 4.5 0 0 0-2.4-4'],
  queue: ['M4 13l2-8h12l2 8', 'M4 13v6h16v-6', 'M4 13h5l1 2h4l1-2h5'],
  back: ['M15 5l-7 7 7 7'],
  home: ['M4 11l8-6 8 6', 'M6 10v9h12v-9'],
  chevron: ['M9 6l6 6-6 6'],
  info: ['M12 8h.01', 'M11 12h1v5h1', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  latest: ['M12 8v4l2.5 2.5', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z'],
};
function icon(name, cls = 'ic') {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('class', cls);
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('focusable', 'false');
  for (const d of ICONS[name] || []) {
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d);
    s.append(p);
  }
  return s;
}
/** A status circle (AC50): a filled tick, a gold ring, or an empty ring; never colour alone. */
function circle(kind) {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', '0 0 20 20');
  s.setAttribute('class', `circ ${kind}`);
  s.setAttribute('aria-hidden', 'true');
  const c = document.createElementNS(SVGNS, 'circle');
  c.setAttribute('cx', '10');
  c.setAttribute('cy', '10');
  c.setAttribute('r', '8');
  s.append(c);
  if (kind === 'tick') {
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', 'M6 10.5l2.6 2.6L14 7.6');
    s.append(p);
  }
  if (kind === 'hatch') {
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', 'M5 13L13 5M7 15l8-8');
    s.append(p);
  }
  return s;
}
const ext = (href, text, cls) => (href ? h('a', { href, rel: 'noopener noreferrer', target: '_blank', class: cls }, text) : null);
const code = (c) => (c ? h('span', { class: 'code' }, c) : null);
const enc = (...parts) => parts.map(encodeURIComponent).join('/');
const go = (...parts) => `#/${enc(...parts)}`;

// ---------------------------------------------------------------------------
// Trial-view notes 2 (AC57 to AC72): plain-circle marks, folds, the phase marker.

/** A plain-circle icon (AC59, AC65, AC67): `kind` is check, pastcheck, half, next, planned, cross, skip, unrec, flag or you. Its words always sit beside it. */
const ic = (kind, extra = '') => h('span', { class: `sb-ic i-${kind}${extra ? ` ${extra}` : ''}`, 'aria-hidden': 'true' });

/** The folds the owner opened or closed in a project, kept for the window through every refresh (AC56). */
function foldsOf(name) {
  const s = sessionOf(name);
  if (!s.folds) s.folds = new Map();
  return s.folds;
}
const isOpenFold = (name, key, dflt) => (foldsOf(name).has(key) ? foldsOf(name).get(key) : dflt);
function setFold(name, key, open) {
  foldsOf(name).set(key, open);
}

/**
 * A disclosure control (AC57, AC59, AC60, AC66): a real button, opened and closed by a tap, a click,
 * or Enter or Space, its state its accessible state and a mark beside its words, never colour alone.
 */
function foldButton(name, key, dflt, attrs, ...kids) {
  const open = isOpenFold(name, key, dflt);
  const toggle = () => {
    setFold(name, key, !isOpenFold(name, key, dflt));
    render();
  };
  return h('button', { type: 'button', ...attrs, key: `fold:${key}`, 'aria-expanded': open ? 'true' : 'false', onclick: toggle,
    onkeydown: (e) => {
      if (!e || (e.key !== 'Enter' && e.key !== ' ')) return;
      if (e.preventDefault) e.preventDefault();
      toggle();
    } }, ...kids, h('span', { class: 'sb-fmark', 'aria-hidden': 'true' }, open ? '▾' : '▸'));
}

/**
 * The phase marker (AC68), under the project's name and the screen's title on Status, Timeline, Team
 * and Queue: the now phase in its colour, its run and the next milestone to reach. A real link,
 * "Open the Timeline at Now"; a tap, Enter or Space opens the Timeline scrolled to Now (one screen
 * step), and on the Timeline itself scrolls back to Now.
 */
function markerNode(p, screen) {
  const mv = markerView(p.ctx);
  if (!mv.link) return h('p', { class: 'sb-pmark none', key: 'pmark' }, h('b', { class: 'sb-pmark-run' }, mv.words));
  const href = go('p', p.project.name, 'timeline');
  const open = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (screen === 'timeline') scrollToTarget({ now: true });
    else nav.to(href);
  };
  return h('a', { class: `sb-pmark${mv.cls ? ` ${mv.cls}` : ''}`, key: 'pmark', href, 'aria-label': 'Open the Timeline at Now',
    onclick: (e) => { if (screen === 'timeline') open(e); },
    onkeydown: (e) => { if (e && (e.key === 'Enter' || e.key === ' ')) open(e); } },
  mv.run ? [h('span', { class: 'sb-phchip', 'aria-hidden': 'true' }), h('b', { class: 'sb-pmark-run' }, mv.run), ' ', h('span', { class: 'sb-pmark-sub' }, mv.next)]
    : h('b', { class: 'sb-pmark-run' }, mv.words),
  ' ', h('span', { class: 'sb-pmark-go' }, 'Timeline ›'));
}

// The branch drawing (AC57, AC58, AC65): one column per run; its geometry, before the browser's
// measure fits each dot to its phase name's row.
const RAIL = {
  status: { x0: 16, gap: 16, r: 6, rowH: 72 },
  tile: { x0: 11, gap: 13, r: 5, rowH: 30 },
};
const ROWS_TOP_DOWN = ['Done', 'Launch', 'Build', 'Design', 'Discovery'];
const railShapes = new Map(); // a drawing's key → { shape, kind }, for fitting it to the rows as laid out

/** The drawing: hidden from assistive technology (the words carry it), drawn at nominal rows until the browser lays them out. */
function railSvg(key, shape, kind) {
  railShapes.set(key, { shape, kind });
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', `sb-rail rail-${kind}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const g = RAIL[kind];
  const ys = {};
  ROWS_TOP_DOWN.forEach((ph, i) => { ys[ph] = i * g.rowH + g.rowH / 2; });
  drawRail(svg, shape, ys, ROWS_TOP_DOWN.length * g.rowH, kind);
  return svg;
}

const PHASE_OF_ROW = ['Discovery', 'Design', 'Build', 'Launch', 'Done'];

/** Draw a branch shape into `svg`, each phase's row centred at ys[phase]. */
function drawRail(svg, shape, ys, height, kind) {
  const g = RAIL[kind];
  const X = (k) => g.x0 + (k - 1) * g.gap;
  const Y = (row) => ys[PHASE_OF_ROW[row]];
  const width = X(Math.max(1, shape.cols)) + g.r + 6;
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(Math.max(1, Math.ceil(height))));
  svg.setAttribute('viewBox', `0 0 ${width} ${Math.max(1, Math.ceil(height))}`);
  const kids = [];
  const r1 = (v) => Math.round(v * 10) / 10;
  const el = (tag, attrs) => {
    kids.push({ tag, attrs });
  };
  const shade = runShade;
  for (const l of shape.lines) {
    const x = X(l.k);
    const y1 = r1(Y(l.from));
    const y2 = r1(Y(l.to));
    el('line', { x1: x, y1, x2: x, y2, class: `ln ${shade(l.k)}${l.dashed ? ' dash' : ''}`, 'data-kind': 'line', 'data-col': l.k, 'data-dashed': l.dashed ? '1' : '0' });
    const ym = r1((y1 + y2) / 2);
    el('path', { d: `M${x - 3} ${r1(ym + 2)}L${x} ${r1(ym - 2)}L${x + 3} ${r1(ym + 2)}`, class: `arr ${shade(l.k)}`, 'data-kind': 'arrow', 'data-dir': y2 < y1 ? 'up' : 'down' });
  }
  for (const c of shape.curves) {
    const x0 = X(c.fromK);
    const y0 = r1(Y(c.fromRow));
    const x1 = X(c.toK);
    const y1 = r1(Y(c.toRow));
    el('path', { d: `M${x0} ${y0}C${r1(x0 + g.gap * 0.9)} ${y0} ${x1} ${r1(y0 - (y0 - y1) * 0.25)} ${x1} ${y1}`, class: `ln curve ${shade(c.toK)}`, 'data-kind': 'curve', 'data-from': c.fromK, 'data-to': c.toK });
  }
  for (const d of shape.dots) {
    const cx = X(d.k);
    const cy = r1(Y(d.row));
    const mark = kind === 'tile' ? d.icon : d.mark;
    el('circle', { cx, cy, r: g.r, class: `dot m-${mark}`, 'data-kind': 'dot', 'data-phase': d.phase, 'data-col': d.k, 'data-mark': mark });
    if (mark === 'half') el('path', { d: `M${cx} ${r1(cy - g.r + 1.5)}A${g.r - 1.5} ${g.r - 1.5} 0 0 0 ${cx} ${r1(cy + g.r - 1.5)}Z`, class: 'dot-in half', 'data-kind': 'glyph' });
    if (mark === 'check' || mark === 'pastcheck') {
      el('path', { d: `M${r1(cx - 2.6)} ${r1(cy + 0.2)}l1.8 1.8 3.6-3.8`, class: `dot-in ${mark}`, 'data-kind': 'glyph' });
    }
  }
  // The same shapes as drawn already: their places are set in place, so no element changes but where it sits (AC57's "Still and plain").
  const now = [...svg.childNodes];
  if (now.length === kids.length && now.every((n, i) => String(n.tagName || n.tag).toLowerCase() === kids[i].tag)) {
    now.forEach((n, i) => {
      for (const [k, v] of Object.entries(kids[i].attrs)) if (n.getAttribute(k) !== String(v)) n.setAttribute(k, String(v));
    });
    return;
  }
  svg.replaceChildren(...kids.map(({ tag, attrs }) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    return n;
  }));
}

/** In the browser: each drawing redrawn with every dot level with its phase name's row, as laid out (and again after a fold or a new width). */
function fitRails() {
  const view = document.getElementById('view');
  if (!view) return;
  const boxes = [];
  eachElement(view, (el) => { if (el.getAttribute && el.getAttribute('data-rail')) boxes.push(el); });
  for (const box of boxes) fitRail(box);
}
/** One drawing fitted to its box's phase names (the fake DOM's tests call it with their own measures). */
export function fitRail(box) {
  const entry = railShapes.get(box.getAttribute('data-rail'));
  if (!entry || !box.getBoundingClientRect) return;
  const svg = findClass(box, 'sb-rail');
  if (!svg) return;
  const top = box.getBoundingClientRect().top;
  const ys = {};
  eachElement(box, (el) => {
    const ph = el.getAttribute && el.getAttribute('data-pname');
    if (ph && el.getBoundingClientRect) {
      const r = el.getBoundingClientRect();
      ys[ph] = r.top - top + r.height / 2;
    }
  });
  if (ROWS_TOP_DOWN.some((ph) => typeof ys[ph] !== 'number' || !Number.isFinite(ys[ph]))) return;
  drawRail(svg, entry.shape, ys, box.getBoundingClientRect().height, entry.kind);
}

// ---------------------------------------------------------------------------
// State kept for the open window only (never stored): what was opened in GitHub, and items that
// left the queue while the page was open (AC52's confirmation and "Done today").

const session = new Map(); // project → { opened: Set(key), last: Map(key → row), left: [{ key, text }], prev: Set(key) }
function sessionOf(name) {
  if (!session.has(name)) session.set(name, { opened: new Set(), last: new Map(), left: [], prev: null, drafts: new Map(), chosen: new Map(), answers: new Map() });
  return session.get(name);
}

function noteDepartures(name, q) {
  const s = sessionOf(name);
  const now = new Set(q.rows.map((r) => r.key));
  for (const r of q.rows) s.last.set(r.key, r);
  if (s.prev) {
    for (const k of s.prev) {
      if (now.has(k)) continue;
      const r = s.last.get(k);
      if (r && (r.kind === 'pr' || r.kind === 'hold' || r.kind === 'merge') && !s.left.some((x) => x.key === k)) {
        s.left.push({ key: k, title: r.text, code: r.code, text: `${r.text}${r.code ? ` (${r.code})` : ''}: no longer open, time not recorded` });
      }
    }
  }
  s.prev = now;
}

// ---------------------------------------------------------------------------
// The project's view model: everything a screen draws, built inside the project's guard (AC30).

function buildProject(desk, project, box, now) {
  const snap = desk.snapshot(project.name);
  const model = box.model;
  const j = project.model === 'v3' ? j11Records(project, snap) : null;
  const tl = j ? timelineOf(j) : null;
  const pv = phaseView(project, tl, snap.tree, j);
  const q = queueView(project, model, snap, now.getTime());
  noteDepartures(project.name, q);
  const ctx = runsContext(project, snap, j, tl, pv, now.getTime(), TZ);
  let feed = null;
  return { project, box, model, snap, j, tl, pv, q, ctx, where: whereLine(project, model, tl, pv),
    ball: ballLines(project, model, snap, j, q, now, TZ), pill: pillView(box, q, now.getTime()),
    // The Timeline's model (AC59, AC60), built once per drawing when a screen needs it.
    feed: () => feed || (feed = feedView(ctx, model, now.getTime(), TZ)) };
}

// ---------------------------------------------------------------------------
// Shared chrome

function marker() {
  return h('p', { class: 'sb-marker', role: 'note' }, h('span', { class: 'sb-dot', 'aria-hidden': 'true' }), SANDBOX_MARKER);
}

const TABS = [['status', 'Status'], ['timeline', 'Timeline'], ['team', 'Team'], ['queue', 'Queue']];
function bottomBar(name, current, waiting) {
  return h('nav', { class: 'sb-dock', 'aria-label': 'Project screens' },
    TABS.map(([k, label]) => h('a', { class: 'sb-tab', href: k === 'status' ? go('p', name) : go('p', name, k), 'aria-current': k === current ? 'page' : null },
      icon(k), h('span', {}, label),
      k === 'queue' && waiting ? h('span', { class: 'sb-badge', 'aria-label': `${waiting} waiting on you` }, String(waiting)) : null)));
}

/**
 * Every screen but Home: the control to Home ("Home") and, beside it, the one that goes back one
 * screen in the sandbox's own history ("Back"), shown only when there is an earlier screen (AC56).
 */
function projectHeader(name, title, sub) {
  return h('header', { class: 'sb-hdr' },
    h('div', { class: 'sb-navs' },
      nav.canBack() ? h('button', { type: 'button', class: 'sb-prev', key: 'nav-back', 'aria-label': 'Back', onclick: () => nav.back() },
        icon('back'), h('span', { class: 'sb-vh' }, 'Back')) : null,
      h('a', { class: 'sb-back', key: 'nav-home', href: '#/', 'aria-label': 'Home' }, icon('home'), h('span', { class: 'sb-vh' }, 'Home'))),
    h('div', { class: 'sb-hdr-t' }, h('p', { class: 'sb-eyebrow' }, name), h('h1', {}, title), sub ? h('p', { class: 'sb-sub' }, sub) : null));
}

/** A sheet or bubble's visible close control, at its top (AC56): "Close", 44 by 44 at least. */
function closeControl(onClose, key = 'sheet-close') {
  return h('button', { type: 'button', class: 'sb-close', key, 'aria-label': 'Close', onclick: onClose }, icon('close'), h('span', { class: 'sb-vh' }, 'Close'));
}

/** A link that opens a sheet: it remembers itself, so closing the sheet gives it the focus back. */
function opener(key, href, attrs, ...children) {
  return h('a', { ...attrs, key, href, onclick: () => { nav.opener = key; } }, ...children);
}

function readLine(box) {
  const r = box.read || {};
  if (r.read === 'cant-read') return h('p', { class: 'sb-stale' }, `Can't read since ${hhmm(new Date(r.since), TZ)}: ${r.words}`);
  if (r.read === 'checking') return h('p', { class: 'sb-muted' }, 'Checking…');
  // Time-dependent (AC56): the 15-second tick redraws this text only.
  return h('p', { class: 'sb-muted', live: () => `Read ${hhmm(new Date(r.since), TZ)}${Date.now() - r.since > 90e3 ? ` (${durationText(Date.now() - r.since)} ago)` : ''}` });
}

// ---------------------------------------------------------------------------
// Home (AC35, AC48, AC50's checklist, AC49's ball line, AC52's pill)

/**
 * The Home tile's phases (AC65, AC58): the where-it-is line after a chip in the now phase's colour;
 * then each phase in its own small box, from the top Done to Discovery, with its stripe and the
 * tile's words; and beside them, inside the boxes on the left, the compact branch drawing in plain
 * circles with icons. Not a control of its own: a tap on it is the card's (AC48, AC54).
 */
function tileNode(p) {
  const tv = tilePhases(p.ctx);
  const name = p.project.name;
  const rk = `tile:${name}`;
  return h('div', { class: `sb-tph${tv.done ? ' done' : ''}${tv.shape ? ` cols-${tv.shape.cols}` : ''}`, key: `tph:${name}`, 'data-rail': tv.shape ? rk : null },
    h('p', { class: `sb-where${tv.cls ? ` ${tv.cls}` : ''}` }, tv.cls ? h('span', { class: 'sb-phchip', 'aria-hidden': 'true' }) : null, tv.line),
    h('ol', { class: 'sb-trows' }, tv.rows.map((r) => h('li', { class: `sb-trow ${r.cls}${r.now ? ' now' : ''}${r.done ? ' end' : ''}` },
      h('span', { class: 'sb-tp', 'data-pname': r.phase }, r.phase), r.word ? h('span', { class: `sb-ts${r.now ? ' now' : ''}` }, r.word) : null))),
    tv.shape ? railSvg(rk, tv.shape, 'tile') : null,
    tv.done ? h('span', { class: 'sb-stamp', 'aria-hidden': 'true' }, 'DONE') : null);
}

/** Who has the ball (AC49), each line with its mark: the coral diamond for what waits on the owner, the half-filled circle for work under way (AC67: no light, no glow). */
function ballNode(ball, compact) {
  return h('ul', { class: 'sb-ball' }, (compact ? ball.slice(0, 2) : ball).map((b) => h('li', { class: `who-${b.who}` },
    b.who === 'you' ? ic('you') : b.lit ? ic('half') : null,
    b.who === 'you' ? h('span', { live: () => youWaitText(b.oldest, Date.now()) }) : b.text)));
}

/** The "Latest" control and, when open, its bubble (AC54 (b)): one open at a time, never clipped. */
function latestControl(p, col) {
  const name = p.project.name;
  const k = `latest:${name}`; // the control's key, and the open bubble's name in `bubble`
  const isOpen = bubble.open === k;
  const id = `latest-${enc(name).replace(/[^A-Za-z0-9_-]/g, '_')}`;
  const ctl = h('button', {
    type: 'button', class: `sb-latest${isOpen ? ' on' : ''}`, key: k, 'aria-label': 'Latest', 'aria-expanded': isOpen ? 'true' : 'false',
    'aria-controls': isOpen ? id : null,
    onpointerdown: (e) => { bubble.pointer = e && e.pointerType ? e.pointerType : 'touch'; bubble.pointerFocus = k; },
    onpointerenter: (e) => { if (e && e.pointerType === 'mouse') bubbleHover(k, true, 'ctl'); },
    onpointerleave: (e) => { if (e && e.pointerType === 'mouse') bubbleHover(k, false, 'ctl'); },
    onclick: (e) => bubbleTap(k, e),
    onkeydown: (e) => {
      if (!e || (e.key !== 'Enter' && e.key !== ' ')) return;
      if (e.preventDefault) e.preventDefault();
      bubbleOpen(k, 'key');
    },
    onfocus: () => {
      // On focus from the keyboard (a pointer's own focus is its tap); not after Escape (AC54).
      if (bubble.pointerFocus === k) {
        bubble.pointerFocus = null;
        return;
      }
      if (bubble.escaped === k) return;
      bubbleOpen(k, 'key');
    },
    onblur: () => {
      // Only this control's own pressed pointer is forgotten here: when a tap moves focus from this
      // control to another, the other's pointerdown has already marked the focus that follows as its tap's.
      if (bubble.pointerFocus === k) bubble.pointerFocus = null;
      if (bubble.escaped === k) bubble.escaped = null; // focus left: it may open on focus again
      setTimeout(() => {
        const a = document.activeElement;
        const inside = a && a.closest && a.closest('[data-bubble]');
        if (bubble.open === k && bubble.via === 'key' && !inside) {
          bubble.close();
          render();
        }
      }, 0);
    },
  }, icon('latest'), h('span', { class: 'sb-latest-w' }, 'Latest'));
  const out = [ctl];
  if (isOpen) {
    out.push(h('div', {
      class: `sb-bubble ${col} ${placeClass()}`, id, role: 'dialog', 'aria-label': `Latest: ${name}`, key: bubbleKey(k), 'data-bubble': k,
      onpointerenter: (e) => { if (e && e.pointerType === 'mouse') bubbleHover(k, true, 'bubble'); },
      onpointerleave: (e) => { if (e && e.pointerType === 'mouse') bubbleHover(k, false, 'bubble'); },
    }, h('div', { class: 'sb-bubble-top' }, h('p', { class: 'sb-eyebrow' }, 'Latest'),
      closeControl(() => { bubble.close(); bubble.escaped = k; render(); focusKey(k); }, `bubble-close:${name}`)),
    h('p', { class: 'sb-bubble-t' }, latestText(p.project, p.model, p.where))));
  }
  return out;
}

/**
 * The card's summary (AC54 (a)): its first three lines, in a box that always takes exactly three
 * lines' height. When the whole summary runs past three lines at the card's width as drawn (the
 * browser measures it, `measureClips`, again on each redraw and when the width changes), the
 * third line fades into the card's background and the three lines are a button of their own that
 * opens the whole summary, word for word, in a bubble (the "Latest" bubble's machinery: one open at
 * a time). The card always holds the whole summary; the box only hides the lines after the third.
 */
function summaryBox(name, sum, col) {
  const k = `sum:${name}`;
  const over = sum.ok && summaryOver.get(name) === true;
  const isOpen = over && bubble.open === k;
  const id = `sumbub-${enc(name).replace(/[^A-Za-z0-9_-]/g, '_')}`;
  const cls = `sb-sum${sum.ok ? '' : ' none'}`;
  const text = over
    ? h('button', {
      type: 'button', class: cls, key: k, 'aria-label': `Show the whole summary of ${name}`, 'aria-expanded': isOpen ? 'true' : 'false',
      'aria-controls': isOpen ? id : null,
      onpointerdown: (e) => { bubble.pointer = e && e.pointerType ? e.pointerType : 'touch'; },
      onclick: (e) => bubbleTap(k, e),
      onkeydown: (e) => {
        if (!e || (e.key !== 'Enter' && e.key !== ' ')) return;
        if (e.preventDefault) e.preventDefault();
        if (bubble.open === k) {
          bubble.close();
          render();
          focusKey(k);
        } else bubbleOpen(k, 'key');
      },
    }, sum.text)
    : h('p', { class: cls }, sum.text);
  return h('div', { class: 'sb-sumbox', key: `sumbox:${name}` },
    // Nothing scrolls in the box: where a browser lacks `overflow: clip`, focus scrolling the text is undone.
    h('div', { class: `sb-sumclip${over ? ' over' : ''}`, key: `sumclip:${name}`, 'data-sum': name, onscroll: (e, el) => { if (el.scrollTop) el.scrollTop = 0; } }, text),
    isOpen ? h('div', {
      class: `sb-bubble ${col} ${placeClass()}`, id, role: 'dialog', 'aria-label': `Summary: ${name}`, key: bubbleKey(k), 'data-bubble': k,
    }, h('div', { class: 'sb-bubble-top' }, h('p', { class: 'sb-eyebrow' }, 'Summary'),
      closeControl(() => { bubble.close(); render(); focusKey(k); }, `sumbubble-close:${name}`)),
    h('p', { class: 'sb-bubble-t' }, sum.text)) : null);
}

/**
 * A ruling's line 1 where the sandbox shows it (AC55's "Your last action", AC52's "Done today"; the
 * owner's follow-up ruling, answer 2): when its words take more than three lines at the width as
 * drawn (measured as the summary is, `measureClips`), the box shows the first three, faded at the
 * cut, and is a button of its own, "Show the whole of <code>", opening line 1, word for word, in a
 * bubble (AC54 (a)'s machinery: one open at a time, closed as AC56 says); `mark` (" (proxy)") and
 * `after` (the time and code) follow the box, outside the button and the bubble. Three lines or
 * fewer: the one-line form, words, mark and `after` on the same line, at its own height, no fade, no
 * control. `id` names it on its screen; `lead` is text before the words ("Your last action: "),
 * `wcls` the words' own class, `after(inline)` gives the nodes that follow, and `notice` a line the
 * open bubble adds when a refresh would change the line under it (AC55, draft 4).
 */
function lineBox(id, { words, recCode, title, lead = null, wcls = 'sb-line-w', mark = null, after = () => [], notice = null }) {
  const k = `line:${id}`;
  lineText.set(id, words);
  const over = lineOver.get(id) === true;
  const isOpen = over && bubble.open === k;
  const bid = `linebub-${id.replace(/[^A-Za-z0-9_-]/g, '_')}`;
  // Short, the mark follows the words as part of the line ("… (proxy)"); clipped, it follows the box.
  const inner = [lead, h('span', { class: wcls }, over ? words : `${words}${mark || ''}`)];
  const text = over
    ? h('button', {
      type: 'button', class: 'sb-line', key: k, 'aria-label': `Show the whole of ${recCode}`, 'aria-expanded': isOpen ? 'true' : 'false',
      'aria-controls': isOpen ? bid : null,
      onpointerdown: (e) => { bubble.pointer = e && e.pointerType ? e.pointerType : 'touch'; },
      onclick: (e) => bubbleTap(k, e),
      onkeydown: (e) => {
        if (!e || (e.key !== 'Enter' && e.key !== ' ')) return;
        if (e.preventDefault) e.preventDefault();
        if (bubble.open === k) {
          bubble.close();
          render();
          focusKey(k);
        } else bubbleOpen(k, 'key');
      },
    }, inner)
    : h('span', { class: 'sb-line' }, inner, after(true));
  return [h('div', { class: 'sb-linebox', key: `linebox:${id}` },
    // Nothing scrolls in the box: where a browser lacks `overflow: clip`, focus scrolling the text is undone.
    h('div', { class: `sb-lineclip${over ? ' over' : ''}`, key: `lineclip:${id}`, 'data-line': id, onscroll: (e, el) => { if (el.scrollTop) el.scrollTop = 0; } }, text),
    isOpen ? h('div', {
      class: `sb-bubble sb-linebub ${placeClass()}`, id: bid, role: 'dialog', 'aria-label': `${title}: ${recCode}`, key: bubbleKey(k), 'data-bubble': k,
    }, h('div', { class: 'sb-bubble-top' }, h('p', { class: 'sb-eyebrow' }, title),
      closeControl(() => { bubble.close(); render(); focusKey(k); }, `linebubble-close:${id}`)),
    h('p', { class: 'sb-bubble-t' }, words),
    notice ? h('p', { class: 'sb-bubble-note', role: 'status', key: 'line-notice' }, notice) : null) : null),
  over ? h('span', { class: 'sb-line-m' }, mark ? h('span', { class: 'sb-line-mark' }, mark.trim()) : null, after(Boolean(mark))) : null];
}

function homeCard(p, seen, col, group) {
  const { project, box, ball, q } = p;
  const name = project.name;
  const newCount = q.rows.filter((r) => seen.isNew(r.raisedAt)).length;
  const sum = summaryView(project, box, p.snap);
  // The card's link holds its name; the whole card opens the Project screen through it (its ::after),
  // except the controls that sit above it: "Latest", the summary's button, "Why" and the pill.
  return h('article', { class: `sb-pc ${col}`, key: `card:${name}` },
    h('div', { class: 'sb-pc-top' }, h('span', { class: 'sb-app' }, icon('project')),
      newCount ? h('span', { class: 'sb-new' }, `${newCount} new`) : null,
      latestControl(p, col)),
    h('a', { class: 'sb-pc-main', href: go('p', name) }, h('h2', { class: 'sb-nm' }, name)),
    summaryBox(name, sum, col),
    h('div', { class: 'sb-pc-rest' },
      tileNode(p),
      ballNode(ball, true),
      stallNode(p, group),
      readLine(box)),
    sum.ok ? null : h('details', { class: 'sb-why', key: `sum-why:${name}` }, h('summary', {}, 'Why'), h('p', { class: 'small' }, sum.why)),
    newCount ? h('p', { class: 'sb-vh' }, `${newCount} new since you last looked`) : null,
    pillNode(box, q, name));
}

/**
 * The stalled line (AC71), under who has the ball, in slate: after 72 hours with no movement and
 * nothing waiting on the owner. It depends on the time, so the 15-second tick works it out again.
 */
function stallNode(p, group) {
  const line = () => {
    try {
      const st = stalledLine(p.project, p.box, p.snap, p.j, p.model, group, p.q.waiting, Date.now(), TZ);
      return st ? st.words : '';
    } catch {
      return '';
    }
  };
  return h('p', { class: 'sb-stall', key: `stall:${p.project.name}`, live: line });
}

/** The pill (AC48): its words and its look both depend on the time ("All clear" goes stale), so both are live. */
function pillNode(box, q, name) {
  const el = h('a', { class: `sb-pill ${pillView(box, q, Date.now()).kind}`, href: go('p', name, 'queue'), key: `pill:${name}`,
    live: () => pillView(box, q, Date.now()).text });
  el._liveClass = () => `sb-pill ${pillView(box, q, Date.now()).kind}`;
  return el;
}

// ---------------------------------------------------------------------------
// AC75: "Notifications", in More detail and on Home's top line until it is on; AC78: "GitHub Actions this month"

const ns = { subscribed: null, value: null, error: null, showValue: false, busy: false, store: null, looked: false };
const pushKey = () => (CONFIG.push && typeof CONFIG.push.vapidPublicKey === 'string' ? CONFIG.push.vapidPublicKey : null);
const gNav = () => (typeof navigator === 'undefined' ? null : navigator);
const gWin = () => (typeof window === 'undefined' ? null : window);
const gNotif = () => (typeof Notification === 'undefined' ? null : Notification);
function copiedMark() {
  try {
    const v = ns.store ? ns.store.getJSON(NOTIFY_STORE_KEY, null) : null;
    return Boolean(v && v.copied === true && ns.value && v.value === ns.value);
  } catch {
    return false;
  }
}
const notifyEnv = () => ({ standalone: isStandalone(gWin(), gNav()), key: pushKey(), permission: permissionOf(gNotif()), subscribed: ns.subscribed, copied: copiedMark() });
function lookSubscription() {
  if (ns.looked) return;
  ns.looked = true;
  const env = notifyEnv();
  if (!env.standalone || env.permission !== 'granted') {
    ns.subscribed = false;
    return;
  }
  currentSubscription(gWin(), gNav()).then((sub) => {
    ns.subscribed = Boolean(sub);
    ns.value = sub ? subscriptionValue(sub) : null;
    render();
  }, () => {
    ns.subscribed = false;
    render();
  });
}
function notifyNode(compact) {
  lookSubscription();
  const state = notifyState(notifyEnv());
  const kids = [];
  const k = compact ? 'top' : 'more';
  if (state === 'ask') {
    kids.push(h('button', { type: 'button', class: 'sb-btn', key: `notify-on:${k}`, onclick: () => {
      if (ns.busy) return;
      ns.busy = true;
      ns.error = null;
      turnOn({ win: gWin(), nav: gNav(), Notif: gNotif(), key: pushKey() }).then((r) => {
        ns.busy = false;
        if (r.ok) {
          ns.subscribed = true;
          ns.value = r.value;
          ns.showValue = true;
        } else ns.error = r.state === 'denied' ? null : r.words;
        render();
      });
    } }, NOTIFY_WORDS.ask));
    if (ns.error) kids.push(h('p', { class: 'sb-warn' }, ns.error));
  } else if (state === 'copy' || (state === 'on' && ns.showValue)) {
    kids.push(h('p', { class: 'small' }, NOTIFY_WORDS.copy), h('pre', { class: 'sb-value' }, ns.value || ''), copyButton(ns.value || '', `notify:${k}`, 'Copy'));
    if (!compact) kids.push(h('ol', { class: 'sb-steps small' }, copySteps(CONFIG).map((x) => h('li', {}, x))));
    kids.push(h('button', { type: 'button', class: 'sb-btn ghost', key: `notify-done:${k}`, onclick: () => {
      try {
        if (ns.store) ns.store.setJSON(NOTIFY_STORE_KEY, { copied: true, value: ns.value });
      } catch {
        // kept for this window only
      }
      ns.showValue = false;
      render();
    } }, COPY_DONE_WORDS));
  } else if (state === 'on') {
    const t = testSteps(CONFIG);
    kids.push(h('p', { class: 'small' }, NOTIFY_WORDS.on, ' ', h('button', { type: 'button', class: 'sb-btn ghost small', key: `notify-again:${k}`, onclick: () => {
      currentSubscription(gWin(), gNav()).then((sub) => {
        ns.value = sub ? subscriptionValue(sub) : ns.value;
        ns.showValue = true;
        render();
      });
    } }, SHOW_AGAIN_WORDS)));
    if (!compact) {
      kids.push(h('details', { class: 'small', key: `notify-test:${k}` }, h('summary', {}, SEND_TEST_WORDS),
        h('ol', { class: 'sb-steps' }, t.steps.map((x) => h('li', {}, x))), t.link ? h('p', {}, ext(t.link, 'Open desk-notify on GitHub')) : null));
    }
  } else kids.push(h('p', { class: `small ${state === 'denied' ? 'sb-warn' : 'sb-muted'}` }, NOTIFY_WORDS[state]));
  return h('div', { class: `sb-notify n-${state}`, key: `notify:${k}` }, kids);
}
function usageNode() {
  const v = usageView({ cfg: CONFIG.actionsUsage, reads: DESK ? DESK.usage : null, nowMs: Date.now(), tz: TZ, whenText });
  const kids = [h('h3', { class: 'sb-h3' }, USAGE_TITLE)];
  if (v.state !== 'ok') kids.push(h('p', { class: 'small usage-words' }, v.words));
  else {
    // A native progress element draws the fill itself: no inline size (AC41, AC50), words always beside it.
    kids.push(h('p', { class: 'small' }, h('span', { class: 'usage-month' }, v.month), ': ', h('span', { class: 'usage-words' }, v.words)),
      h('progress', { class: 'sb-actions-bar', max: '100', value: String(v.bar), role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100',
        'aria-valuenow': String(v.bar), 'aria-label': `${USAGE_TITLE}: ${v.words}` }, `${v.bar}%`));
    if (v.estimate) kids.push(h('p', { class: 'small' }, v.estimate), h('p', { class: 'sb-muted small' }, v.estimateNote));
    kids.push(h('p', { class: 'sb-muted small' }, v.reset), h('p', { class: 'sb-muted small' }, v.asOf));
  }
  return h('section', { class: 'sb-actions-usage', key: 'actions-usage', id: 'actions-usage' }, kids);
}

function renderHome(desk, built, seen, now) {
  const order = orderBoxes(built.map((b) => b.box));
  const total = built.reduce((n, b) => n + (b.box.flaggedCount || 0), 0);
  const s = screenState(built.map((b) => b.box), desk.signedOut);
  const lastRead = Math.max(...built.map((b) => (b.box.read && b.box.read.since) || 0));
  const placed = order.map((box) => {
    const b = built.find((x) => x.box === box);
    let group = 'active';
    try {
      if (!b.error) group = homeGroupOf(b.project, b.snap, b.pv).group;
    } catch {
      group = 'active';
    }
    return { b, box, group };
  });
  const groups = HOME_GROUPS.map((g) => {
    const members = placed.filter((x) => x.group === g.key);
    const words = groupHeaderWords(members.map((x) => ({ waiting: x.b.q ? x.b.q.waiting : x.box.flaggedCount || 0,
      cantRead: Boolean(x.box.drawError || (x.box.read && x.box.read.read === 'cant-read')) })));
    const isOpen = homeGroups.isOpen(g.key);
    const id = `grp-${g.key}`;
    return h('section', { class: `sb-hgroup${isOpen ? ' open' : ''}`, key: `hgroup:${g.key}` },
      h('h2', { class: 'sb-hg-h' }, h('button', { type: 'button', class: 'sb-hg-btn', key: `hgroup-btn:${g.key}`, 'aria-expanded': isOpen ? 'true' : 'false', 'aria-controls': id,
        onclick: () => { homeGroups.toggle(g.key); render(); } },
      h('span', { class: 'sb-hg-mark', 'aria-hidden': 'true' }, isOpen ? '▾' : '▸'),
      h('span', { class: 'sb-hg-t' }, g.title),
      h('span', { class: 'sb-hg-n' }, words.count),
      words.waiting ? h('span', { class: 'sb-hg-you' }, words.waiting) : null,
      words.cant ? h('span', { class: 'sb-hg-bad' }, words.cant) : null,
      h('span', { class: 'sb-vh' }, isOpen ? ' (open)' : ' (closed)'))),
      isOpen ? h('div', { class: 'sb-grid', id }, members.map(({ b, box }, i) => {
        const col = i % 2 ? 'col-r' : 'col-l';
        try {
          if (b.error) throw b.error;
          return homeCard(b, seen, col, g.key);
        } catch (err) {
          return h('article', { class: `sb-pc bad ${col}`, key: `card:${box.name}` }, h('h2', { class: 'sb-nm' }, box.name),
            h('p', { class: 'sb-stale' }, box.drawError || `Can't show this project: ${errorText(err)}`));
        }
      })) : null);
  });
  return h('section', { class: 'sb-screen sb-home' },
    marker(),
    h('header', { class: 'sb-hdr home' }, h('div', { class: 'sb-hdr-t' }, h('h1', {}, 'Your desk'))),
    h('p', { class: `sb-top ${s.quiet ? 'quiet' : total ? 'you' : ''}`, role: 'status' },
      desk.signedOut ? SIGNED_OUT_STATE.text : total ? `${total} waiting on you in all` : s.text,
      lastRead ? h('span', { class: 'sb-muted' }, ` · last read ${hhmm(new Date(lastRead), TZ)}`) : null),
    seen.words ? h('p', { class: 'sb-muted small' }, seen.words) : null,
    onTopLine(notifyState(notifyEnv())) ? notifyNode(true) : null,
    h('div', { class: 'sb-hgroups' }, groups),
    // No bottom band (AC48, 2026-10-16: the owner dropped the "Tell your Chief of Staff…" bar, the
    // band's only content): with no sheet or bubble open, nothing is fixed to the bottom of Home.
    h('p', { class: 'sb-v5' }, v5Line(built)));
}

function v5Line(built) {
  try {
    return v5Footer(built.map((b) => ({ name: b.project.name, v3: b.project.model === 'v3', readOk: Boolean(b.box.read && b.box.read.read === 'ok'),
      model: b.box.model })), (ms) => {
      const m = Math.round(ms / 60000);
      return `${Math.floor(m / 60)}h ${m % 60}m`;
    });
  } catch (err) {
    return `Median answer time: can't show it (${errorText(err)})`;
  }
}

// ---------------------------------------------------------------------------
// Status (AC37, AC50; AC36's one-tap-down detail)

const SIX = ['Discovery', 'Design', 'Build', 'Launch', 'Operate', 'Review'];

/** A milestone's or a run's mark on the Status screen (AC57): beside its words, never alone. */
const mk = (mark) => h('span', { class: `sb-mk m-${mark}`, 'aria-hidden': 'true' });

/** The key above the boxes (AC57): each entry with its mark; the gold ring is "next to reach", never "now" alone. */
function statusKey(key) {
  return h('div', { class: 'sb-skey', key: 'status-key' },
    h('p', { class: 'sb-keyh' }, 'Runs'), h('p', { class: 'sb-keyl' }, key.runs.map(([m, w]) => h('span', { class: 'sb-keye' }, mk(m), w))),
    h('p', { class: 'sb-keyh' }, 'Milestones'), h('p', { class: 'sb-keyl' }, key.milestones.map(([m, w]) => h('span', { class: 'sb-keye' }, mk(m), w))));
}

/** Why a run began (AC70): its date, the ruling's reason quoted, its source one tap from the whole record; or the slate "not recorded". */
function beganNode(b) {
  if (b.missing) {
    return h('p', { class: `sb-began gap ${runShade(b.k)}`, key: `began:${b.k}` }, h('span', { class: 'sb-began-k' }, b.head),
      h('span', { class: 'gap' }, b.words.slice(b.head.length)));
  }
  return h('div', { class: `sb-began ${runShade(b.k)}`, key: `began:${b.k}` }, h('p', { class: 'sb-began-h' }, b.head),
    b.quote ? h('p', { class: 'sb-quote' }, `"${b.quote}"`) : b.plain ? h('p', { class: 'sb-began-p' }, b.plain, ' ', code(b.code)) : h('p', { class: 'sb-muted' }, b.words),
    h('p', { class: 'sb-src' }, b.source.href ? ext(b.source.href, b.source.words) : b.source.words));
}

/** A run's own shade (AC57, draft 6): run 1, run 2, then runs 3 and 4 in turn (run 5 as run 3, run 6 as run 4). */
export function runShade(k) {
  const n = Number(k) || 1;
  return `run${n <= 2 ? n : 3 + ((n - 3) % 2)}`;
}

/** One milestone on the Status screen (AC57): its mark, name, code, state in words and why line; softened for rules 1 and 9. */
function msItem(m) {
  return h('li', { class: `sb-ms${m.soft ? ' soft' : ''}`, key: `ms:${m.code}` }, mk(m.mark),
    h('span', { class: 'sb-mname' }, m.name, ' ', code(m.code)),
    h('span', { class: 'sb-mstate' }, m.words),
    h('span', { class: `sb-mwhy${m.why.recorded ? '' : ' none'}` }, m.why.text));
}

/** A run in its phase's box (AC57): "Run <k> · <Phase> i<n> · <state>", its milestones from the last at the top, AC70's line where it began. */
function runNode(p, r) {
  const name = p.project.name;
  const gk = `gather:${r.key}`;
  const gOpen = isOpenFold(name, gk, false);
  return h('div', { class: `sb-prun${r.latest ? '' : ' old'}`, key: `prun:${r.key}`, 'data-run': r.key },
    r.began ? beganNode(r.began) : null,
    h('p', { class: 'sb-rhead' }, h('span', { class: `sb-rtag ${runShade(r.k)}` }, r.tag), ' ', h('span', { class: 'sb-rwords' }, `· ${r.head}`)),
    r.stdLine ? h('p', { class: 'sb-stdline' }, r.stdLine) : null,
    r.gatherWords ? foldButton(name, gk, false, { class: 'sb-more' }, r.gatherWords) : null,
    r.gatherWords && gOpen ? h('ol', { class: 'sb-mslist gathered', key: `gathered:${r.key}` }, r.gathered.map(msItem)) : null,
    h('ol', { class: 'sb-mslist', key: `mslist:${r.key}` }, [...r.milestones, ...r.standard].map(msItem)));
}

/**
 * The Status screen's phases (AC57): read from the bottom up, Discovery at the bottom and Done at
 * the top, each in its own box with its colour stripe, folding on a tap of its name; one column of
 * dots per run inside the boxes on the left, branching right where the work went back.
 */
function statusBoxes(p) {
  const sv = statusPhases(p.ctx, TZ);
  if (!sv.tracked) return [h('section', { class: 'sb-card', key: 'phases-untracked' }, h('h2', { class: 'sb-h2' }, sv.why), h('p', { class: 'sb-muted' }, p.pv.detail || ''))];
  const name = p.project.name;
  const boxes = sv.boxes.map((b) => {
    const fk = `pbox:${b.phase}`;
    const open = b.foldable ? isOpenFold(name, fk, !b.startFolded) : true;
    const head = h('div', { class: 'sb-pbox-h' },
      b.foldable ? foldButton(name, fk, !b.startFolded, { class: 'sb-pname', 'data-pname': b.phase }, b.phase)
        : h('span', { class: 'sb-pname', 'data-pname': b.phase }, b.phase),
      h('span', { class: `sb-pstate${b.now ? ' now' : ''}` }, b.word));
    return h('section', { class: `sb-pbox ${b.cls}${b.now ? ' now' : ''}${b.done ? ' end' : ''}${open ? '' : ' folded'}`, key: `pbox:${b.phase}`, 'data-phase': b.phase },
      head, open ? b.runs.map((r) => runNode(p, r)) : null);
  });
  return [h('h2', { class: 'sb-h2', key: 'phases-h' }, 'The phases, read from the bottom up'), statusKey(sv.key),
    h('div', { class: `sb-pboxes cols-${sv.shape.cols}`, key: 'pboxes', 'data-rail': `status:${name}` }, boxes, railSvg(`status:${name}`, sv.shape, 'status'))];
}

function renderStatus(p) {
  const { project, model, pv, where, q, ball } = p;
  const name = project.name;
  const queueWords = q.waiting ? `${p.pill.text} ›` : `Nothing waits on you in ${name} ›`;
  const body = [
    marker(),
    projectHeader(name, 'Current status'),
    markerNode(p, 'status'),
    h('p', { class: 'sb-lead' }, where.sentence),
    lastActionNode(p),
    h('div', { class: 'sb-actions' },
      h('a', { class: `sb-btn ${q.waiting ? 'you' : ''}`, href: go('p', name, 'queue') }, queueWords),
      h('a', { class: 'sb-btn ghost', href: go('p', name, 'team') }, ball[0].who !== 'you' && ball.some((b) => b.lit) ? ic('half') : null, `Team: ${ball[0].text} ›`)),
    readLine(p.box),
  ];
  if (!pv.tracked) {
    body.push(h('section', { class: 'sb-card' }, h('h2', { class: 'sb-h2' }, pv.why), h('p', { class: 'sb-muted' }, pv.detail)));
  } else body.push(...statusBoxes(p));
  if (project.model !== 'v3' && model) {
    body.push(h('section', { class: 'sb-card' }, h('h2', { class: 'sb-h2' }, 'Reduced view (operating model v2.5.1)'),
      h('dl', { class: 'sb-dl' }, h('dt', {}, 'Sprint'), h('dd', {}, model.sprint.title || model.sprint.note),
        h('dt', {}, 'Latest'), h('dd', {}, model.headline.text), h('dt', {}, 'Next'), h('dd', {}, model.headline.next || NOT_RECORDED),
        h('dt', {}, 'Items'), h('dd', {}, V25_NOT_RECORDED))));
  }
  body.push(h('p', {}, opener('info', go('p', name, 'info'), { class: 'sb-infobtn' }, icon('info'), 'About the phases')));
  // AC55 (note 7): "More detail" opens the Pipeline, Time asked and Agents views drawn in the new
  // design inside the sandbox; nothing here links to the accepted views.
  body.push(h('details', { class: 'sb-card sb-more', key: 'more-detail-fold' }, h('summary', { key: 'more-detail' }, h('span', { class: 'sb-h2 flat' }, 'More detail')),
    h('p', { class: 'sb-muted small' }, `CI on ${project.defaultBranch}: ${model ? model.ci : NOT_RECORDED}`),
    // AC68: a v3 project's Pipeline view folds into the Timeline; its record notes get their own screen.
    h('ul', { class: 'sb-links' },
      project.model === 'v3' ? null : h('li', {}, h('a', { href: go('p', name, 'pipeline'), key: 'more:pipeline' }, 'Reduced view and waits')),
      h('li', {}, h('a', { href: go('p', name, 'asked'), key: 'more:asked' }, 'Time asked of you')),
      h('li', {}, h('a', { href: go('p', name, 'agents'), key: 'more:agents' }, 'Agents: sessions, timeline and usage')),
      project.model === 'v3' && recordNotes(p).length ? h('li', {}, h('a', { href: go('p', name, 'notes'), key: 'more:notes' }, `Record notes (${recordNotes(p).length})`)) : null),
    // AC75 and AC78: the desk's own lines, the same in every project's More detail.
    h('section', { class: 'sb-notify-line', key: 'notify-line' }, h('h3', { class: 'sb-h3' }, 'Notifications'), notifyNode(false)),
    usageNode()));
  const out = [h('section', { class: 'sb-screen' }, body, bottomBar(name, 'status', q.waiting))];
  if (nav.route.sheet === 'info') {
    out.push(sheetFrame(go('p', name), 'About the phases', [
      h('ol', { class: 'sb-six' }, SIX.map((x) => h('li', {}, x))),
      h('p', { class: 'sb-muted small' }, 'The desk shows the first four, then Done: where a project stands once you pass its Launch gate. A finished phase reads "Finished".')]));
  }
  return out;
}

/**
 * "Your last action" (AC55, note 6): just above the bar that says whether anything waits on the owner.
 * A ruling's words longer than three lines are clipped to three, faded, with the whole line one tap
 * away (lineBox); the time and code follow, outside the control.
 */
function lastActionNode(p) {
  const fresh = lastAction(p.project, p.model, p.snap, p.j, new Date(Date.now()), TZ);
  const name = p.project.name;
  // While its whole-line bubble is open, a refresh leaves the line and the bubble as they were
  // (AC55, draft 4; AC56): what changed waits until the owner closes it, and the bubble says so.
  let la = fresh;
  let notice = null;
  if (bubble.open === 'line:last' && heldLast && heldLast.name === name) {
    la = heldLast.la;
    if (laSig(fresh) !== laSig(la)) notice = HELD_NOTICE;
  } else if (bubble.open === 'line:last' && fresh.state === 'ok') heldLast = { name, la: fresh };
  else heldLast = null;
  const lead = h('span', { class: 'sb-last-l' }, 'Your last action: ');
  let line;
  if (la.state !== 'ok') line = h('p', { class: 'sb-last-t' }, la.text);
  else {
    const proxy = la.action.kind === 'ruling' && la.action.proxy;
    const after = (sep) => [sep ? h('span', { class: 'sb-sep' }, ' · ') : null, h('span', { class: 'sb-last-when', live: () => whenText(new Date(la.action.at), new Date(Date.now()), TZ) }),
      ' ', la.link ? ext(la.link, la.code, 'code') : code(la.code)];
    line = la.action.clip
      ? h('div', { class: 'sb-last-t' }, lineBox('last', { words: la.action.words, recCode: la.code, title: 'Your last action', lead, mark: proxy ? ' (proxy)' : null, after, notice }))
      : h('p', { class: 'sb-last-t' }, lead, h('span', { class: 'sb-line-w' }, la.words), after(true));
  }
  // tabindex -1: where focus goes when a held bubble closes and its control has gone (AC56, draft 5).
  return h('div', { class: 'sb-last', key: 'last-action', tabindex: '-1' }, line,
    h('details', { class: 'sb-why', key: `last-why:${name}` }, h('summary', {}, 'Your merges?'), h('p', { class: 'small' }, `Not in this line: ${la.merges} (the desk reads only open pull requests).`)));
}
/** What "Your last action" shows, as one string, to tell whether a refresh would change it. */
const laSig = (la) => `${la.state}|${la.text}|${la.code || ''}`;
/** The one notice of a held whole-line bubble (AC55, draft 6): its line or row changed under it. */
const HELD_NOTICE = 'This has changed since you opened it. Close this to see the latest.';
let heldLast = null; // { name, la }: the line as it was when its bubble opened

// ---------------------------------------------------------------------------
// AC55: the Pipeline, Time asked and Agents views, in the new design, with the same facts as the
// accepted views (AC9–AC12, AC20–AC23): the same values and words, from the same records.

const whenOr = (d) => (d ? whenText(new Date(d), new Date(Date.now()), TZ) : 'not recorded');

function detailScreen(p, title, kids) {
  const name = p.project.name;
  return h('section', { class: 'sb-screen sb-detail' }, marker(), projectHeader(name, title), kids, bottomBar(name, 'status', p.q.waiting));
}

/** AC11 and AC12's waits, each opening its response sheet in the queue (never the accepted views). */
function waitsNode(p) {
  const m = p.model;
  const name = p.project.name;
  if (!m.flagged.length) return h('p', { class: 'sb-muted' }, 'Nothing waiting on you here.');
  return h('ul', { class: 'sb-qlist' }, m.flagged.map((f) => {
    const target = f.kind === 'pr' ? ext(f.link, f.title) : opener(`wait:${f.key}`, go('p', name, 'queue', f.key), {}, f.title);
    return h('li', { class: 'sb-qrow g-decisions sb-wait' }, h('div', { class: 'sb-wait-b' }, h('span', { class: 'sb-qt' }, target),
      h('span', { class: 'sb-muted small' }, f.words, f.card && f.card.cantParse ? ` · can't parse: ${f.card.cantParse}` : '')));
  }));
}

/** The v2.5 reduced view and its waits (AC10, AC55); a v3 project's Pipeline view folds into the Timeline (AC68). */
function renderPipeline(p) {
  const m = p.model;
  const kids = [];
  kids.push(h('p', { class: 'sb-lead small' }, boxStateText(p.box, TZ)));
  kids.push(h('p', { class: 'sb-muted small' }, `CI on ${m.defaultBranch}: ${m.ci}`));
  kids.push(h('h2', { class: 'sb-h2' }, 'Waiting on you'), waitsNode(p));
  kids.push(h('h2', { class: 'sb-h2' }, 'Reduced view (operating model v2.5.1)'),
    h('dl', { class: 'sb-dl sb-card' },
      h('dt', {}, 'Sprint'), h('dd', {}, m.sprint.title || m.sprint.note),
      h('dt', {}, 'Headline'), h('dd', {}, m.headline.text),
      h('dt', {}, 'Next'), h('dd', {}, m.headline.next || 'not recorded'),
      h('dt', {}, 'As of'), h('dd', {}, m.headline.asOf || 'not recorded'),
      h('dt', {}, 'Items'), h('dd', {}, m.itemsText),
      h('dt', {}, 'Running now'), h('dd', {}, m.runningText)));
  kids.push(h('h2', { class: 'sb-h2' }, 'Activity'));
  kids.push(m.activity.length ? h('ul', { class: 'sb-qlist' }, m.activity.map((a) => h('li', {}, a.link ? ext(a.link, a.text) : a.text)))
    : h('p', { class: 'sb-muted' }, 'No recent activity.'));
  if (m.notes.length) {
    kids.push(h('details', { class: 'sb-card', key: 'pipe-notes' }, h('summary', {}, `${m.notes.length} notes`),
      h('ul', { class: 'sb-qlist' }, m.notes.map((n) => h('li', { class: 'small' }, n)))));
  }
  return detailScreen(p, 'Reduced view', kids);
}

const askWait = (ms) => (ms == null ? 'not recorded' : durationText(ms));
const proxyWords = (x) => (x === true ? 'proxy' : x === false ? 'not a proxy' : 'proxy not recorded');

function askedRow(r) {
  let answered;
  if (r.state === 'answered') answered = whenOr(r.answeredAt);
  else if (r.state === 'recording') answered = 'recording…';
  else if (r.state === 'withdrawn') answered = 'withdrawn';
  else answered = 'open';
  let wait = r.state === 'open' ? `${askWait(r.waitMs)} so far` : askWait(r.waitMs);
  if (r.raisedLoading) wait = 'loading…';
  return h('li', { class: `sb-ask${r.state === 'open' ? ' open' : ''}` }, h('strong', {}, r.label),
    h('span', { class: 'sb-muted small' }, `raised ${r.raisedAt != null ? whenOr(r.raisedAt) : r.raisedLoading ? 'loading…' : 'not recorded'} · answered ${answered} · wait ${wait}`
      + (r.state === 'answered' ? ` · ${proxyWords(r.proxy)}` : '')
      + (r.word ? ` · ${r.word}` : '') + (r.ruling ? ` · Ruling: ${r.ruling}` : '')));
}

function renderAsked(p) {
  const name = p.project.name;
  const t = p.model.timeAsked;
  const ready = p.box.read.read === 'ok' && t.ready;
  const unread = notReadText([name]);
  const kids = [];
  if (t.cards) {
    let summary;
    if (!ready) summary = `Last 14 days: ${unread}`;
    else if (t.summary.count) summary = `Last 14 days: ${t.summary.count} card${t.summary.count === 1 ? '' : 's'}, median wait ${durationText(t.summary.medianMs)} (open cards with their wait so far)`;
    else summary = 'Last 14 days: no cards';
    kids.push(h('p', { class: 'sb-lead' }, summary));
    let list;
    if (!ready) list = h('p', { class: 'sb-muted' }, `Cards: ${unread}.`);
    else if (t.cards.length) list = h('ul', { class: 'sb-asks' }, t.cards.map(askedRow));
    else list = h('p', { class: 'sb-muted' }, 'No cards raised in the last 30 days.');
    kids.push(h('h2', { class: 'sb-h2' }, 'Cards, last 30 days'), list);
  } else kids.push(h('p', { class: 'sb-lead' }, t.cardsText));
  let qlist;
  if (!ready) qlist = [h('p', { class: 'sb-muted' }, `Owner questions: ${unread}.`)];
  else {
    qlist = [t.questions.length ? h('ul', { class: 'sb-asks' }, t.questions.map(askedRow))
      : h('p', { class: 'sb-muted' }, t.questionsPending ? 'None listed yet.' : 'No owner questions in the last 30 days.')];
    if (t.questionsPending) qlist.push(h('p', { class: 'sb-muted' }, `Loading: ${t.questionsPending} answered question${t.questionsPending === 1 ? '' : 's'} not checked yet.`));
  }
  kids.push(h('h2', { class: 'sb-h2' }, 'Owner questions, last 30 days'), ...qlist);
  if (t.answeredText) kids.push(h('p', { class: 'sb-muted' }, t.answeredText));
  return detailScreen(p, 'Time asked of you', kids);
}

function sessionNode(s) {
  const end = s.running ? `running, ${durationText(s.runMs)} so far` : s.noOutcome ? 'no outcome recorded' : `${whenOr(s.end)}, ran ${durationText(s.runMs)}`;
  const result = s.result ? ` · ${s.result}${s.verdict && s.verdict !== 'none' ? `, verdict ${s.verdict}` : ''}` : '';
  return h('li', { class: 'sb-sess' }, h('details', { key: `sess:${s.item}:${s.role}:${s.start ? new Date(s.start).getTime() : ''}` },
    h('summary', {}, h('span', { class: 'sb-sess-h' }, h('strong', {}, `${s.item} ${s.role}`), s.retry ? h('span', { class: 'sb-tag' }, 'retry') : null),
      h('span', { class: 'sb-muted small' }, `started ${whenOr(s.start)} · ended ${end}${result}`)),
    h('ul', { class: 'sb-usage' }, usageLines(s).map((l) => h('li', { class: 'sb-muted small' }, l)))));
}

/** AC22's per-item timeline keeps its time axis: each bar drawn in SVG at its place on the item's span. */
function timeBar(tl, e) {
  const span = Math.max(1, tl.to - tl.from);
  const x = ((e.start - tl.from) / span) * 100;
  const w = Math.max(1, (((e.end ?? e.start) - e.start) / span) * 100);
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 6');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'sb-axis');
  svg.setAttribute('aria-hidden', 'true');
  const track = document.createElementNS(SVGNS, 'rect');
  for (const [k, v] of Object.entries({ x: 0, y: 2.5, width: 100, height: 1, class: 'track' })) track.setAttribute(k, String(v));
  const bar = document.createElementNS(SVGNS, 'rect');
  for (const [k, v] of Object.entries({ x: x.toFixed(1), y: 0, width: Math.min(w, 100 - x).toFixed(1), height: 6, class: `bar ${e.kind}${e.open ? ' open' : ''}` })) bar.setAttribute(k, String(v));
  svg.append(track, bar);
  return svg;
}

function renderAgents(p) {
  const m = p.model;
  if (!m.sessions) return detailScreen(p, 'Agents', [h('p', { class: 'sb-lead' }, m.runningText)]);
  return detailScreen(p, 'Agents', [
    h('h2', { class: 'sb-h2' }, 'Sessions, last 14 days'),
    m.sessions.length ? h('ul', { class: 'sb-sessions' }, m.sessions.map(sessionNode)) : h('p', { class: 'sb-muted' }, 'No sessions in the last 14 days.'),
    h('h2', { class: 'sb-h2' }, 'Timeline by item'),
    m.timelines.length ? h('ul', { class: 'sb-tlx' }, m.timelines.map((tl) => h('li', { class: 'sb-card' }, h('strong', {}, tl.item),
      h('ol', { class: 'sb-tlx-ev' }, tl.events.map((e) => {
        const label = e.kind === 'card' ? `${e.label}: waiting on you` : `${e.label} session`;
        const until = e.end == null ? 'no end recorded' : e.open ? 'now' : whenOr(e.end);
        return h('li', { class: `sb-tlx-e ${e.kind}` }, timeBar(tl, e), h('span', { class: 'sb-muted small' }, `${label}, ${whenOr(e.start)} to ${until}`));
      }))))) : h('p', { class: 'sb-muted' }, 'Nothing to show.'),
  ]);
}

// ---------------------------------------------------------------------------
// Queue and the response sheet (AC52, AC53)

/**
 * A queue row (AC52, as AC66 changed it): what it is and how long it has waited, opening its
 * response sheet; then the milestone it unblocks and that milestone's why, each from a record; and
 * the facts behind the ask one tap away. An item that waits on the owner keeps the coral edge (AC69).
 */
function queueRow(p, row, s) {
  const opened = s.opened.has(row.key);
  const name = p.project.name;
  const out = [opener(`row:${row.key}`, go('p', name, 'queue', row.key), { class: 'sb-qa' },
    h('span', { class: 'sb-qt' }, row.text, ' ', code(row.code)),
    h('span', { class: 'sb-muted small' }, h('span', { live: () => waitWords(row.raisedAt, Date.now()) }), opened ? ' · opened in GitHub' : ''))];
  if (p.project.model === 'v3') {
    const u = unblocksOf(p.ctx, row);
    const ck = `ctx:${row.key}`;
    const open = isOpenFold(name, ck, false);
    out.push(h('div', { class: 'sb-unb', key: `unb:${row.key}` },
      u.none ? h('p', { class: 'sb-unb-l' }, `Unblocks no milestone: ${u.none}`)
        : u.missing ? h('p', { class: 'sb-unb-l gap' }, 'Unblocks: milestone not recorded')
          : u.milestones.map((m) => [h('p', { class: 'sb-unb-l' }, h('span', { class: 'sb-lbl' }, 'Unblocks'), ' ', m.name ? h('b', {}, m.name) : null, ' ', code(m.code),
            u.byPr ? h('span', { class: 'sb-meta' }, ' · named by its pull request, not yet in the plan') : null),
          m.why ? h('p', { class: 'sb-wl' }, h('span', { class: 'sb-lbl' }, 'Why'), ' ', h('span', { class: 'sb-quote' }, m.why.text), h('span', { class: 'sb-src' }, m.why.source))
            : h('p', { class: 'sb-wl gap' }, h('span', { class: 'sb-lbl' }, 'Why'), ' not recorded yet · for the agents to add')]),
      foldButton(name, ck, false, { class: 'sb-fold ctx' }, 'Context · the facts behind this ask'),
      open ? (u.context ? h('ul', { class: 'sb-facts', key: `facts:${row.key}` }, u.context.map((c) => h('li', {}, c.fact,
        c.exception ? null : h('span', { class: 'sb-src' }, c.source || 'source not recorded'))))
        : h('p', { class: 'sb-meta gap', key: `facts:${row.key}` }, 'Context: not recorded')) : null));
  }
  return h('li', { class: `sb-qrow g-${row.group}`, key: `qrow:${row.key}` }, out);
}

/** A waiting deploy's row (AC52, AC72): the run, linked, and whether its commit is a reviewed pull request's merge; the approval stays on GitHub. */
function deployRow(p, d, check) {
  const name = p.project.name;
  const k = `deploy-why:${d.key}`;
  return h('li', { class: 'sb-qrow g-deploys', key: `qrow:${d.key}` }, h('p', {}, ext(d.link, d.text) || d.text, ' ', code(d.code)),
    check ? h('div', { class: `sb-safe ${check.kind}`, key: `safe:${d.key}` },
      h('p', { class: 'sb-safe-l' }, check.kind === 'ok' ? ic('check') : check.kind === 'bad' ? ic('cross') : ic('unrec'), check.words),
      check.sources ? h('p', { class: 'sb-src' }, check.sources.map((x, i) => [i ? ' · ' : '', x.href ? ext(x.href, x.words) : x.words]))
        : check.kind === 'bad' ? h('p', { class: 'sb-src' }, check.reason)
          : [foldButton(name, k, false, { class: 'sb-fold soft' }, 'Why'), isOpenFold(name, k, false) ? h('p', { class: 'sb-meta' }, check.reason) : null]) : null);
}

/** Where a "Done today" row's sprint is on the Timeline (AC66): a link there, or "sprint: not recorded" in slate. */
function doneLink(p, kind, codeText) {
  const name = p.project.name;
  const fv = p.project.model === 'v3' ? p.feed() : null;
  const at = doneTarget(fv, p.snap, kind, codeText);
  if (at && at.sprint) return [' ', h('a', { class: 'sb-tlink', href: go('p', name, 'timeline', 'sprint', at.sprint) }, 'On the Timeline')];
  if (at && at.ms) return [' ', h('a', { class: 'sb-tlink', href: go('p', name, 'timeline', 'ms', at.ms) }, 'On the Timeline')];
  if (at && at.job) return h('span', { class: 'sb-meta' }, ` · ${JOB_MERGE_WORDS}`);
  return h('span', { class: 'sb-meta gap' }, ' · sprint: not recorded');
}

function renderQueue(p, key) {
  const { project, q } = p;
  const name = project.name;
  const s = sessionOf(name);
  const fresh = p.box.read && p.box.read.read === 'ok';
  const body = [marker(), projectHeader(name, 'Queue', q.waiting ? `${q.waiting} waiting on you` : null), markerNode(p, 'queue')];
  if (!q.waiting && fresh) body.push(h('p', { class: 'sb-lead' }, `Nothing waits on you in ${name}`));
  else if (!q.waiting) body.push(readLine(p.box));
  body.push(h('div', { class: 'sb-groups' }, q.groups.map((g) => {
    // AC66: the groups' marks go neutral; one holding anything that waits on the owner shows the coral diamond, "needs you".
    const needs = (['decisions', 'gates', 'merges'].includes(g.key) || (g.key === 'deploys' && q.deploysCounted)) && g.items.length > 0;
    const head = h('h2', { class: `sb-gh g-${g.key}` }, needs ? h('span', { class: 'sb-gmark you' }, ic('you'), h('span', { class: 'sb-vh' }, 'needs you'))
      : h('span', { 'aria-hidden': 'true', class: 'sb-gmark' }, GROUP_MARK[g.key]), g.title,
      needs ? h('span', { class: 'sb-needs', 'aria-hidden': 'true' }, 'needs you') : null,
      h('span', { class: 'sb-gcount' }, g.count == null ? NOT_RECORDED : g.count ? String(g.count) : 'none'));
    if (g.line) return h('section', { class: `sb-group g-${g.key} empty`, key: `group:${g.key}` }, head, h('p', { class: 'sb-muted small' }, g.line));
    if (!g.items.length) return h('section', { class: `sb-group g-${g.key} empty`, key: `group:${g.key}` }, head);
    if (g.key === 'deploys') {
      return h('section', { class: `sb-group g-${g.key}`, key: `group:${g.key}` }, head,
        h('p', { class: 'sb-muted small' }, q.deploysCounted ? 'Each waits for your approval on GitHub. Its approver: not recorded.'
          : 'Shown, not counted: a deploy waiting for approval is not one of the things that need you. Its approver: not recorded.'),
        h('ul', { class: 'sb-qlist' }, g.items.map((d) => {
          const dr = deployRows(project, p.snap).find((x) => `deploy:${x.run.path}:${x.run.runNumber}` === d.key);
          return deployRow(p, d, dr ? dr.check : null);
        })));
    }
    return h('section', { class: `sb-group g-${g.key}`, key: `group:${g.key}` }, head, h('ul', { class: 'sb-qlist' }, g.items.map((r) => queueRow(p, r, s))));
  })));
  // AC77: a question asked in a session, or whose answer is on its way: shown, not counted, no answer link.
  if (q.asking.length) {
    body.push(h('section', { class: 'sb-card sb-asking', key: 'asking' }, h('h2', { class: 'sb-h2' }, 'Asked in your session'),
      h('ul', { class: 'sb-qlist' }, q.asking.map((a) => h('li', { class: 'sb-qrow', key: `asking:${a.name}` },
        h('p', { class: 'sb-qt' }, a.title, ' ', code(a.name)),
        h('p', { class: 'sb-strong small', role: 'status' }, a.words, a.pr ? [' · ', ext(a.pr.url, `PR #${a.pr.number}`)] : null),
        a.state === 'held' ? h('button', { type: 'button', class: 'sb-btn ghost small', key: `answer-here:${a.name}`, onclick: () => { if (DESK) DESK.answerHere(name, a.name); } },
          'Answer it here instead') : null,
        a.parsed ? h('details', { class: 'small', key: `asking-text:${a.name}` }, h('summary', {}, 'The question and its options, to read'),
          h('article', { class: 'sb-record', html: renderMarkdown(a.parsed.text || '') })) : null)))));
  }
  // "Done today" (AC52, note 10): what was ruled, in words, with its code after.
  // While a row's whole-line bubble is open, a refresh leaves the fold as it was (AC55's hold, for
  // "Done today": draft 5), the day turning at midnight included; the bubble says so when it changed.
  const freshDone = doneToday(project, p.model, p.snap, new Date(Date.now()), TZ, p.j);
  let done = freshDone;
  let notice = null;
  const rowOpen = bubble.open && bubble.open.startsWith('line:done:');
  if (rowOpen && heldDone && heldDone.name === name) {
    done = heldDone.done;
    // The notice is the open row's: it says so when a refresh would remove or change that row.
    const openRow = (rows) => rows.find((d) => `line:done:${d.code}` === bubble.open);
    const was = openRow(done);
    const is = openRow(freshDone);
    if (!was || !is || doneSig([was]) !== doneSig([is])) notice = HELD_NOTICE;
  } else if (rowOpen) heldDone = { name, done: freshDone };
  else heldDone = null;
  // Opening the fold lays its rows out: a ruling's line is judged against three lines then (AC52).
  body.push(h('details', { class: 'sb-card sb-donetoday', key: 'done-today', ontoggle: () => measureClips() }, h('summary', { key: 'done-today-h' }, ic('check'), `Done today (${done.length + s.left.length})`),
    done.length || s.left.length ? h('ul', { class: 'sb-qlist sb-done' }, done.map((d) => h('li', { class: 'sb-done-r', key: `done:${d.kind}:${d.code}` },
      d.clip
        ? lineBox(`done:${d.code}`, { words: d.line, recCode: d.code, title: 'Done today', wcls: 'sb-done-w', mark: d.proxy ? ' (proxy)' : null,
          notice: bubble.open === `line:done:${d.code}` ? notice : null,
          after: () => [' ', d.link ? ext(d.link, d.code, 'code') : code(d.code), ' ', h('span', { class: 'sb-muted small' }, d.words), doneLink(p, d.kind, d.code)] })
        : [h('span', { class: 'sb-done-w' }, d.text), ' ', d.link ? ext(d.link, d.code, 'code') : code(d.code), ' ', h('span', { class: 'sb-muted small' }, d.words), doneLink(p, d.kind, d.code)])),
    s.left.map((x) => h('li', { class: 'sb-done-r' }, h('span', { class: 'sb-done-w' }, x.title), ' ', code(x.code), ' ', h('span', { class: 'sb-muted small' }, 'no longer open, time not recorded'),
      doneLink(p, /^PR #/.test(x.code || '') ? 'pr' : 'other', x.code))))
      : h('p', { class: 'sb-muted small' }, 'Nothing answered today yet.')));
  const out = [h('section', { class: 'sb-screen' }, body, bottomBar(name, 'queue', q.waiting))];
  if (key != null) out.push(sheet(p, key));
  return out;
}

/** What "Done today" rows show, as one string, to tell whether a refresh would change them. */
const doneSig = (rows) => rows.map((d) => `${d.kind}|${d.code}|${d.text}|${d.at}`).join('\n');
let heldDone = null; // { name, done }: the fold's rows as they were when a row's bubble opened

function trackerNode(steps) {
  return h('ol', { class: 'sb-tracker' }, steps.map((st) => h('li', { class: st.done ? 'done' : '' }, circle(st.done ? 'tick' : 'empty'), st.words)));
}

/** A copy button; its "Copied" stays through a redraw (kept per key for this window). */
function copyButton(text, key, label = 'Copy the text') {
  const said = copied.get(key);
  return h('button', { type: 'button', class: 'sb-btn ghost', key: `copy:${key}`, onclick: () => {
    const done = (w) => { copied.set(key, w); render(); };
    try {
      navigator.clipboard.writeText(text).then(() => done('Copied'), () => done('Copy failed: select the text above'));
    } catch {
      done('Copy failed: select the text above');
    }
  } }, said || label);
}
const copied = new Map();
const rechecks = new Map(); // AC77: what the re-read before an answer link found, per box, for this window

/**
 * A prefilled text box (AC53): the box, its rule line (updated as the owner types) and its one
 * button. What the owner types is kept per project and item for this window, and survives every
 * refresh (AC56): a handler only updates that draft and redraws; it holds no element.
 */
function textBox(p, row, target, startText, onOpened) {
  const s = sessionOf(p.project.name);
  const key = `${row.key}:${target.form}`;
  const draft = s.drafts.get(key) || { text: startText, edited: false };
  if (!draft.edited) draft.text = startText;
  s.drafts.set(key, draft);
  const ta = h('textarea', { rows: '6', key: `box:${key}`, 'data-keep': key, 'aria-label': 'The text GitHub will commit', spellcheck: 'false',
    oninput: (e, self) => {
      draft.text = self.value;
      draft.edited = true;
      render();
    } });
  ta.value = draft.text;
  const r = target.numbered ? numberedRuleLine(draft.text, target.numbered, target.joined, target.milestone || null) : ruleLine(target.form, draft.text, target);
  const rebuild = draft.edited && draft.text !== startText
    ? h('button', { type: 'button', class: 'sb-btn ghost small', key: `rebuild:${key}`, onclick: () => { draft.edited = false; render(); } }, 'Rebuild from my answers') : null;
  const plan = boxPlan(p.project, CONFIG.linkCap, target, draft.text);
  const nodes = [];
  if (plan.warning) nodes.push(h('p', { class: 'sb-warn' }, plan.warning));
  if (plan.words) nodes.push(h('p', { class: 'sb-muted small' }, plan.words));
  const said = rechecks.get(key);
  if (plan.offer === 'link') {
    const guard = row.kind === 'card' ? { target: { kind: 'card', path: row.flag.card.path }, answerPath: row.flag.card.answerPath }
      : row.kind === 'question' ? { target: { kind: 'question', name: row.flag.question.name }, answerPath: `decisions/questions/${row.flag.question.name}.md` } : null;
    nodes.push(h('a', { class: 'sb-go', key: `go:${key}`, href: plan.url, rel: 'noopener noreferrer', target: '_blank', onclick: (e) => {
      // AC77: a project read more than 30 seconds ago is read again first; the link opens only if the item is still open.
      if (guard && DESK && DESK.needsRecheck(p.project.name)) {
        if (e && e.preventDefault) e.preventDefault();
        rechecks.set(key, { words: RECHECK_WORDS.checking });
        render();
        DESK.recheck(p.project.name, guard.answerPath).then((r) => {
          if (!r.ok) rechecks.set(key, { words: RECHECK_WORDS.failed, anyway: plan.url });
          else {
            const o = recheckOutcome(DESK.model(p.project.name), guard.target);
            if (o.kind === 'open') {
              rechecks.delete(key);
              let w = null;
              try {
                w = window.open(plan.url, '_blank');
                if (w) w.opener = null;
              } catch {
                w = null;
              }
              if (!w) rechecks.set(key, { words: 'Still open:', anyway: plan.url, again: 'open GitHub' });
              else onOpened();
            } else rechecks.set(key, { words: o.words, pr: o.pr || null });
          }
          render();
        });
        return;
      }
      if (plan.copy) {
        try {
          navigator.clipboard.writeText(plan.copy).catch(() => {});
        } catch {
          // the text stays in the box to select by hand
        }
      }
      onOpened();
    } }, plan.copy ? 'Copy and open GitHub' : 'Open GitHub with this written'));
  } else if (plan.offer === 'copy') nodes.push(copyButton(plan.copy, key));
  if (said) {
    nodes.push(h('div', { class: 'sb-recheck', role: 'status', key: `recheck:${key}` }, h('p', { class: 'sb-strong small' }, said.words),
      said.pr ? h('p', { class: 'small' }, ext(said.pr.url, `PR #${said.pr.number}, which records it`)) : null,
      said.anyway ? h('p', { class: 'small' }, h('a', { href: said.anyway, rel: 'noopener noreferrer', target: '_blank', key: `anyway:${key}` }, said.again || RECHECK_WORDS.anyway)) : null));
  }
  return h('div', { class: 'sb-box' }, ta, rebuild,
    h('p', { class: `sb-rule ${r.ok ? 'ok' : 'warn'}`, role: 'status' }, r.words),
    h('p', { class: 'sb-muted small' }, plan.path ? `Writes ${plan.path} on ${plan.branch}` : ''),
    h('div', { class: 'sb-act' }, nodes));
}

/**
 * AC53 (note 15): each question on its own, followed by its own answer box (its choices when it
 * lists them, the recommendation labelled and never picked, and a text box for the owner's own
 * words); the answers then prefill the ruling file the owner commits, in the box below. Every
 * answer is kept through a refresh (AC56).
 */
function answerBoxes(p, row, v, opened) {
  const s = sessionOf(p.project.name);
  const key = row.key;
  if (!s.answers.has(key)) s.answers.set(key, {});
  const answers = s.answers.get(key);
  const isCard = v.kind === 'card';
  const qs = isCard ? null : v.qs;
  const questions = isCard
    ? [{ n: 1, text: v.question, choices: v.options.map((o) => ({ value: o.value, text: '' })), recommendation: v.recommendation || null }]
    : qs.questions;
  const box = isCard ? v.box : { ...v.box, letters: qs.form === 'lettered' ? qs.questions[0].choices.map((c) => c.value) : [] };
  const set = (n, patch) => {
    answers[n] = { ...(answers[n] || {}), ...patch };
    render();
  };
  const out = [];
  if (!isCard && qs.form === 'fallback') {
    out.push(h('div', { class: 'sb-sec sb-q', key: 'q:whole' }, h('p', { class: 'sb-warn' }, CANT_SPLIT, ` (${qs.why}).`),
      h('article', { class: 'sb-record', html: renderMarkdown(v.fullText || '') }),
      h('p', { class: 'small' }, ext(v.links[0] && v.links[0].href, 'The question on GitHub') || 'The question: no file recorded'),
      wordsBox(key, 1, answers, set, 'Your answer, in your own words')));
  } else {
    questions.forEach((q) => {
      const a = answers[q.n] || {};
      out.push(h('div', { class: 'sb-sec sb-q', key: `q:${q.n}` },
        h('h3', {}, questions.length > 1 ? `Question ${q.n}` : 'The question'),
        h('p', { class: 'sb-q-t' }, q.text),
        q.choices.length ? h('div', { class: `sb-chips${q.choices.some((c) => c.text) ? ' sb-choices' : ''}`, role: 'radiogroup', 'aria-label': questions.length > 1 ? `Question ${q.n}: options` : 'Options' }, q.choices.map((c) => h('button', {
          type: 'button', class: `sb-chip${a.choice === c.value ? ' on' : ''}`, role: 'radio', 'aria-checked': a.choice === c.value ? 'true' : 'false', key: `chip:${q.n}:${c.value}`,
          onclick: () => set(q.n, { choice: c.value }),
        }, c.text ? choiceFace(c) : h('strong', {}, c.value)))) : null,
        h('p', { class: 'sb-rec' }, q.recommendation ? [h('span', { class: 'sb-tag' }, 'Recommended'), ' ', q.recommendation, h('span', { class: 'sb-muted small' }, ' (labelled, never picked for you)')]
          : h('span', { class: 'sb-muted small' }, NO_RECOMMENDATION)),
        isCard && a.choice ? h('p', { class: 'small' }, h('strong', {}, 'What happens next: '), (v.options.find((o) => o.value === a.choice) || {}).then || NOT_RECORDED) : null,
        wordsBox(key, q.n, answers, set, isCard && v.gateCard && (a.choice === 'hold' || a.choice === 'recycle') ? 'Your reason (it goes on the Reason: line)' : 'Your own words')));
    });
  }
  const composed = composeAnswer(isCard ? { kind: 'card', gateCard: v.gateCard } : { kind: 'question', name: v.box.name, qs, milestone: v.box.milestone || null }, answers);
  const target = qs && qs.form === 'numbered' ? { ...box, numbered: qs, joined: composed.joined } : box;
  out.push(h('div', { class: 'sb-sec sb-final', key: 'final' }, h('h3', {}, isCard ? 'The answer file' : 'The ruling file'),
    h('p', { class: 'sb-muted small' }, 'Filled in from your answers above; you can edit it before you commit.'),
    textBox(p, row, target, composed.text, opened)));
  return h('div', { class: 'sb-answers' }, out);
}

/**
 * A lettered choice (P-001-answer-choice-spacing): its letter in a column of its own, apart from its
 * text, and the wrapped lines lined up under the text. The space between them is a real character,
 * kept out of sight, so the choice reads "C Drop it", never "CDrop it".
 */
function choiceFace(c) {
  return [h('strong', { class: 'sb-choice-l' }, c.value), h('span', { class: 'sb-vh' }, ' '), h('span', { class: 'sb-choice-t' }, c.text)];
}

/** The owner's own words for one question: a text box kept per item and number (AC53, AC56). */
function wordsBox(key, n, answers, set, label) {
  const a = answers[n] || {};
  const ta = h('textarea', { rows: '3', key: `words:${key}:${n}`, 'aria-label': label, class: 'sb-words',
    oninput: (e, self) => set(n, { words: self.value }) });
  ta.value = a.words || '';
  return h('label', { class: 'sb-words-l' }, h('span', { class: 'small' }, label), ta);
}

function sheet(p, key) {
  const { project, q } = p;
  const s = sessionOf(project.name);
  const live = q.rows.find((r) => r.key === key);
  const row = live || s.last.get(key);
  const back = go('p', project.name, 'queue');
  if (!row) {
    return sheetFrame(back, 'Response', [h('p', {}, 'This item is not in the queue (answered, withdrawn, or not read yet).')]);
  }
  const v = sheetView(project, p.model, p.snap, p.j, { ...row, stillOpen: Boolean(live) });
  const parts = [h('p', { class: 'sb-eyebrow' }, GROUPS.find((g) => g.key === row.group).title),
    h('h2', { class: 'sb-sheet-t' }, v.what, ' ', code(v.code)),
    h('p', { class: 'sb-muted small', live: () => waitWords(row.raisedAt, Date.now()) })];
  const opened = () => {
    s.opened.add(key);
    window.setTimeout(() => render(), 0);
  };
  // AC56: when what the sheet is about leaves the queue, the sheet stays open and says so, in the
  // tracker's words, until the owner closes it; what the owner typed stays.
  if (!live) {
    parts.push(h('div', { class: 'sb-left', role: 'status', key: 'left-notice' }, h('p', { class: 'sb-strong' }, 'This has left your queue.'),
      trackerNode(trackerSteps(project, { ...row, stillOpen: false }, p.snap, p.model ? p.model.allEntries : [])),
      h('p', {}, h('a', { href: go('p', project.name, 'timeline') }, 'See it on the timeline'))));
  }
  parts.push(h('div', { class: 'sb-sec' }, h('h3', {}, 'Why it is here'), h('p', {}, v.why)));
  parts.push(h('div', { class: 'sb-sec' }, h('h3', {}, 'What was checked'), h('p', {}, v.checked)));
  if (v.gate) {
    parts.push(h('div', { class: 'sb-sec' }, h('h3', {}, 'The case'), h('blockquote', {}, v.gate.opening),
      h('p', { class: 'small' }, ext(v.gate.caseLink, 'The case') || 'The case: no file recorded', ' · ', ext(v.gate.criticLink, "The Critic's view") || "The Critic's view: no file recorded"),
      h('p', { class: 'small' }, `User representative: ${v.gate.userRep}`)));
  }
  if (v.noAnswer) {
    parts.push(h('div', { class: 'sb-sec' }, h('h3', {}, 'What you do'), h('p', { class: 'sb-strong' }, v.noAnswer)));
  } else if (v.kind === 'pr') {
    parts.push(h('div', { class: 'sb-sec' }, h('a', { class: 'sb-go', href: v.openLink, rel: 'noopener noreferrer', target: '_blank' }, 'Open the pull request in GitHub')));
    parts.push(h('div', { class: 'sb-sec' }, h('h3', {}, 'Your own verdict'),
      h('p', { class: 'sb-muted small' }, `Whether reviews/${row.flag.pr.number}/owner.md already exists on its branch: ${NOT_RECORDED} (the desk reads only ${project.defaultBranch}).`),
      textBox(p, row, v.verdictBox, VERDICT_START, opened)));
    parts.push(h('div', { class: 'sb-sec' }, h('h3', {}, "The Reviewer's statement · Commit it unchanged"), h('p', { class: 'sb-muted small' }, v.reviewerBox.words)));
  } else if ((v.kind === 'card' && v.options && v.options.length) || (v.kind === 'question' && v.qs)) {
    parts.push(answerBoxes(p, row, v, opened));
  } else if (v.loading) {
    parts.push(h('p', { class: 'sb-muted' }, 'Reading the record…'));
  } else {
    parts.push(h('p', { class: 'sb-muted' }, 'The record lists no options the desk can read; answer it on GitHub.'));
  }
  if (live && s.opened.has(key)) {
    parts.push(h('div', { class: 'sb-confirm', role: 'status' }, h('p', {}, 'Opened in GitHub. Once you commit there, the record arrives here on the next read and the steps below tick.'),
      trackerNode(trackerSteps(project, row, p.snap, p.model ? p.model.allEntries : [])),
      h('a', { href: go('p', project.name, 'timeline') }, 'See it on the timeline')));
  }
  if (v.fullText) parts.push(h('details', { class: 'sb-sec', key: 'full-text' }, h('summary', {}, 'The full text'), h('article', { class: 'sb-record', html: renderMarkdown(v.fullText) })));
  parts.push(h('p', { class: 'small' }, v.links.map((l, i) => [i ? ' · ' : '', ext(l.href, l.text) || `${l.text}: no file recorded`])));
  return sheetFrame(back, 'Response', parts, `sheet:${key}`, false);
}

// ---------------------------------------------------------------------------
// Timeline (AC51) and Team (AC49)

// AC59, AC60 and AC61 (trial-view notes 2): the Timeline as the project's breakdown, read from the
// bottom up: what we're delivering at the top, each phase run as a coloured band pinned while its
// stretch scrolls by, its milestones in delivery order with their status icons, "Done when" and why,
// their sprints folded under them, the gold Now line, and where we started at the bottom.

/** A sprint's mark (AC60): a mark and a word, never colour alone; its reason one tap away when it has one. */
function markNode(m) {
  const words = `${m.mark ? `${m.mark} ` : ''}${m.word}`;
  if (!m.why) return h('span', { class: 'sb-mkw' }, words);
  return h('details', { class: 'sb-mkw sb-why' }, h('summary', {}, words), h('p', { class: 'sb-meta' }, m.why));
}

/** One sprint, top to bottom (AC60): date, code and marks; its title as recorded; Technical, Context and Why; and the link to its tasks. */
function sprintNode(s) {
  if (s.missing) {
    return h('div', { class: 'sb-task', key: `sprint:${s.key}`, 'data-sprint': s.id },
      h('p', { class: 'sb-ehead' }, code(s.code), ' ', h('span', { class: 'sb-meta' }, s.missing)),
      s.reason ? h('details', { class: 'sb-why' }, h('summary', {}, 'Why'), h('p', { class: 'sb-meta' }, s.reason)) : null);
  }
  const ctx = s.context
    ? s.context.map((c) => h('span', { class: 'sb-fact' }, c.fact, c.exception ? null : h('span', { class: 'sb-src' }, c.source || 'source not recorded')))
    : h('span', { class: 'gap' }, 'not recorded');
  const why = s.why ? s.why.map((x) => h('span', { class: 'sb-quote sb-para' }, x)) : h('span', { class: 'gap' }, 'not recorded');
  return h('div', { class: 'sb-task', key: `sprint:${s.key}`, 'data-sprint': s.id },
    h('div', { class: 'sb-ehead' }, h('span', { class: 'sb-date' }, s.date), ' ', code(s.code), h('span', { class: 'sb-marks' }, s.marks.map(markNode))),
    h('p', { class: 'sb-etitle' }, s.title), s.none ? h('p', { class: 'sb-meta' }, `no milestone: ${s.none}`) : null,
    h('ul', { class: 'sb-bul' },
      h('li', { class: 'b-tech' }, h('span', { class: 'sb-k' }, 'Technical'), h('span', { class: 'sb-v code' }, s.technical.map((x, i) => [i ? ' · ' : '', x.href ? ext(x.href, x.text) : x.text]))),
      h('li', { class: 'b-ctx' }, h('span', { class: 'sb-k' }, 'Context'), h('span', { class: 'sb-v' }, ctx)),
      h('li', { class: 'b-why' }, h('span', { class: 'sb-k' }, 'Why'), h('span', { class: 'sb-v' }, why))),
    s.tasks.href ? [h('p', { class: 'sb-tlink-p' }, ext(s.tasks.href, 'Tasks in this sprint →', 'sb-tlink')), h('p', { class: 'sb-meta' }, s.tasks.line)]
      : h('p', { class: 'sb-meta gap' }, s.tasks.none));
}

/** A milestone row on the Timeline (AC59): its icon in a plain neutral circle on the line, name, code, words, "Done when", why, and its sprints folded under it. */
function mileNode(p, x) {
  const name = p.project.name;
  const fk = `sprints:${x.key}`;
  const nk = `named:${x.key}`;
  const open = isOpenFold(name, fk, false);
  const nOpen = isOpenFold(name, nk, false);
  return h('div', { class: `sb-mile${x.icon === 'planned' || x.icon === 'next' ? ' planned' : ''}`, key: `mile:${x.key}`, 'data-ms': x.code },
    ic(x.icon, 'sb-mdot'),
    h('p', { class: 'sb-mhead' }, h('span', { class: 'sb-mtitle' }, x.name), ' ', code(x.code), ' ', h('span', { class: `sb-mst${x.icon === 'next' ? ' now' : ''}` }, x.words)),
    x.doneWhen ? h('p', { class: 'sb-dw' }, h('span', { class: 'sb-lbl' }, 'Done when'), ' ', x.doneWhen) : null,
    x.why ? h('p', { class: 'sb-wl' }, h('span', { class: 'sb-lbl' }, 'Why'), ' ', h('span', { class: 'sb-quote' }, x.why.text), h('span', { class: 'sb-src' }, x.why.source))
      : h('p', { class: 'sb-wl gap' }, h('span', { class: 'sb-lbl' }, 'Why'), ' not recorded yet · for the agents to add'),
    x.sprints.length ? foldButton(name, fk, false, { class: 'sb-fold', 'data-sprints': x.key }, x.fold) : h('p', { class: 'sb-meta' }, x.fold),
    x.sprints.length && open ? h('div', { class: 'sb-tasks', key: `tasks:${x.key}` }, x.sprints.map(sprintNode)) : null,
    x.namedFold ? foldButton(name, nk, false, { class: 'sb-fold', 'data-sprints': `${x.key}:named` }, x.namedFold) : null,
    x.namedFold && nOpen ? h('div', { class: 'sb-tasks', key: `named:${x.key}` }, x.named.map(sprintNode)) : null);
}

/** The run's "Not tied to a milestone" line (AC60, AC69): the slate diamond, its count, who files them, the fixed sentence and its sprints folded. */
function untiedNode(p, x) {
  const name = p.project.name;
  const fk = `sprints:${x.key}`;
  const open = isOpenFold(name, fk, false);
  return h('div', { class: 'sb-mile untied', key: `mile:${x.key}`, 'data-ms': 'untied' },
    ic('flag', 'sb-mdot'),
    h('p', { class: 'sb-mhead' }, h('span', { class: 'sb-mtitle' }, x.name), ' ', h('span', { class: 'sb-mst gap' }, x.words)),
    h('p', { class: 'sb-meta' }, x.sentence),
    foldButton(name, fk, false, { class: 'sb-fold', 'data-sprints': x.key }, `${x.sprints.length} sprint${x.sprints.length === 1 ? '' : 's'}`),
    open ? h('div', { class: 'sb-tasks', key: `tasks:${x.key}` }, x.sprints.map(sprintNode)) : null);
}

/** A run's gathered standard milestones (AC59): one line, listing them in place on a tap. */
function gatherNode(p, x) {
  const name = p.project.name;
  const open = isOpenFold(name, x.key, false);
  return h('div', { class: 'sb-gather', key: `gather:${x.key}` }, foldButton(name, x.key, false, { class: 'sb-fold soft' }, x.words),
    open ? h('ul', { class: 'sb-glist' }, x.items.map((i) => h('li', {}, i.name, ' ', code(i.code), ' ', h('span', { class: 'sb-meta' }, i.words)))) : null);
}

function feedRow(p, x) {
  if (x.kind === 'ms') return mileNode(p, x);
  if (x.kind === 'untied') return untiedNode(p, x);
  return gatherNode(p, x);
}

/** "What we're delivering" and "Where we started" (AC59), quoted from docs/PROJECT.md's Intent, or "not recorded". */
function goalNode(g, kind) {
  return h('article', { class: `sb-goal ${kind}`, key: `goal:${kind}` }, h('p', { class: 'sb-lbl' }, g.label),
    h('p', { class: `sb-gq${g.recorded ? '' : ' gap'}` }, g.text),
    h('p', { class: 'sb-src' }, g.source.href ? ext(g.source.href, g.source.words) : g.source.words),
    g.finish ? h('p', { class: 'sb-meta' }, g.finish) : null);
}

/** The keys above the feed (AC59, AC60): the status icons in words, and the three bullet colours. */
function feedKeys(fv) {
  return h('div', { class: 'sb-fkeys', key: 'feed-keys' },
    h('p', { class: 'sb-keyh' }, 'Status icons'), h('p', { class: 'sb-keyl' }, fv.iconsKey.map(([k, w]) => h('span', { class: 'sb-keye' }, ic(k), w))),
    h('p', { class: 'sb-keyl sb-bkey' }, fv.bulletsKey.map((b, i) => h('span', { class: `sb-k ${['b-tech', 'b-ctx', 'b-why'][i]}` }, b))));
}

function renderTimeline(p) {
  const name = p.project.name;
  const fv = p.feed();
  const body = [marker(), projectHeader(name, 'Timeline'), markerNode(p, 'timeline')];
  if (!fv.ok) {
    body.push(h('section', { class: 'sb-card' }, h('p', {}, fv.words)));
    return h('section', { class: 'sb-screen' }, body, bottomBar(name, 'timeline', p.q.waiting));
  }
  const blocks = fv.blocks.map((b) => h('section', { class: `sb-blk ${b.band.cls}${b.plan ? ' plan' : ''}`, key: `blk:${b.key}`, 'data-run': b.key },
    h('div', { class: `sb-pband${b.plan ? ' plan' : ''}`, key: `band:${b.key}` }, h('span', { class: 'sb-phchip', 'aria-hidden': 'true' }),
      h('h2', { class: 'sb-pband-n' }, b.band.name), h('span', { class: 'sb-pband-s' }, b.band.words)),
    b.began ? beganNode(b.began) : null,
    b.nowLine ? [
      b.plannedRows.length ? h('div', { class: 'sb-seg plan', key: `seg:${b.key}:plan` }, b.plannedRows.map((x) => feedRow(p, x))) : null,
      h('div', { class: 'sb-nowline', key: 'nowline', 'data-now': '1' }, h('span', { class: 'sb-now-t' }, b.nowLine.words), ' ',
        h('span', { class: 'sb-now-s' }, b.nowLine.sub), b.nowLine.note ? h('span', { class: 'sb-now-s' }, ` · ${b.nowLine.note}`) : null)] : null,
    h('div', { class: `sb-seg${b.plan ? ' plan' : ''}`, key: `seg:${b.key}` }, b.rows.map((x) => feedRow(p, x)))));
  body.push(feedKeys(fv), h('div', { class: 'sb-feed', key: 'feed' }, goalNode(fv.top, 'finish'), blocks, goalNode(fv.bottom, 'start')));
  for (const n of fv.notes) body.push(h('p', { class: 'sb-meta sb-feednote' }, n));
  return h('section', { class: 'sb-screen' }, body, bottomBar(name, 'timeline', p.q.waiting));
}

/**
 * Where the Timeline opens (AC59): with the Now line just under the pinned band; or, from a link to
 * one of its sprints (AC66, AC67), with that sprint's milestone's sprints opened and the sprint in
 * view. Only when the owner opens the Timeline, never on a refresh (AC56).
 */
function scrollToTarget(target) {
  const view = document.getElementById('view');
  if (!view || typeof window.scrollTo !== 'function') return false;
  let el = null;
  if (target.now) el = findKey(view, 'nowline');
  else {
    const [attr, want] = target.ms ? ['data-ms', target.ms] : ['data-sprint', target.sprint];
    eachElement(view, (e) => { if (!el && e.getAttribute && e.getAttribute(attr) === want) el = e; });
  }
  if (!el || !el.getBoundingClientRect) return Boolean(el);
  let blk = el.parentNode;
  while (blk && !(blk.getAttribute && blk.getAttribute('data-run'))) blk = blk.parentNode;
  const band = blk ? findClass(blk, 'sb-pband') : null;
  const bh = band && band.getBoundingClientRect ? band.getBoundingClientRect().height : 0;
  const y = (window.scrollY || 0) + el.getBoundingClientRect().top - bh - 8;
  window.scrollTo(0, Math.max(0, Math.round(y)));
  return true;
}

/** Opening the Timeline at a sprint: its milestone's sprints opened first (AC66, AC67). */
function openSprintFolds(p, sprint) {
  const fv = p.feed();
  if (!fv.ok) return;
  const at = fv.index.get(sprint);
  if (at) setFold(p.project.name, `sprints:${at.row}`, true);
}

/** Record notes (AC68): each record line or field skipped (AC31) and each plan line out of form or repeated (AC61), word for word. */
function recordNotes(p) {
  const out = [...((p.model && p.model.notes) || [])];
  const doc = p.j && p.j.projectDoc;
  for (const x of (doc && doc.problems) || []) out.push(`docs/PROJECT.md line ${x.lineno}: ${x.message}`);
  return out;
}
function renderNotes(p) {
  const notes = recordNotes(p);
  return detailScreen(p, 'Record notes', [notes.length ? h('ul', { class: 'sb-qlist' }, notes.map((n) => h('li', { class: 'sb-meta' }, n))) : h('p', { class: 'sb-muted' }, 'No record notes.')]);
}

/**
 * The Team screen (AC49, as AC67 changed its cards): who has the ball; the owner's tile with its
 * next lines and what each unblocks; and one card per member, its state in a plain circle with its
 * word, its last recorded work with its date, the milestone that work feeds, and a link into the
 * Timeline at that sprint. No light and no glow: nothing on a card moves.
 */
function renderTeam(p, member, sub, idx) {
  const name = p.project.name;
  const now = new Date(Date.now());
  const tv = teamView(p.project, p.model, p.snap, p.j, p.q, p.ball, now, TZ);
  if (member) return renderMember(p, tv, member, sub, idx, now);
  const body = [marker(), projectHeader(name, 'Team'), markerNode(p, 'team')];
  body.push(h('h2', { class: 'sb-h2' }, 'Who has the ball'), ballNode(p.ball, false));
  if (tv.note) body.push(h('p', { class: 'sb-muted small' }, tv.note));
  const you = tv.owner;
  const fv = p.project.model === 'v3' ? p.feed() : null;
  const unb = (r) => {
    if (p.project.model !== 'v3' || !r.flag) return null;
    const u = unblocksOf(p.ctx, r);
    if (u.none) return ` · unblocks no milestone: ${u.none}`;
    return u.milestones.length ? ` · unblocks ${u.milestones.map((m) => m.code).join(', ')}` : ' · unblocks: milestone not recorded';
  };
  body.push(h('div', { class: 'sb-you', key: 'you-tile' },
    h('a', { class: 'sb-you-a', href: go('p', name, 'team', 'owner') }, h('p', { class: `sb-you-st ${you.waiting ? 'you' : ''}` }, you.waiting ? ic('you') : null,
      you.waiting ? `You · waiting on you: ${p.q.waiting} in your queue` : `You · ${you.status}`)),
    you.next.length ? h('ol', { class: 'sb-next' }, you.next.map((n, i) => {
      const row = p.q.rows[i];
      return h('li', {}, h('span', { class: 'sb-tag' }, i === 0 ? 'Next' : i === 1 ? 'Then' : 'Later'),
        h('span', {}, n.text, ' ', code(n.code), h('span', { class: 'sb-muted small', live: () => ` · ${waitWords(n.raisedAt, Date.now())}` }),
          h('span', { class: `sb-unb-t${row && /not recorded/.test(unb(row) || '') ? ' gap' : ''}` }, row ? unb(row) : null)));
    })) : h('p', { class: 'sb-muted small' }, 'Nothing in your queue.')));
  body.push(h('p', { class: 'sb-keyl sb-tkey' }, TEAM_KEY.map(([k, w]) => h('span', { class: 'sb-keye' }, ic(k), w))));
  const rows = tv.rows || [];
  body.push(h('div', { class: 'sb-tiles' }, tv.members.map((m) => {
    const isCos = m.id === 'chief-of-staff';
    const v3 = p.project.model === 'v3' && !isCos;
    const work = v3 ? memberWork(p.ctx, fv, rows, m.id, TZ, m.helper || null) : null;
    const item = m.status === 'Working' ? m.item : work ? work.item : null;
    // The Chief of Staff's card (AC67, J13): "last: <doing>, <date>" from its session lines, which name no item or sprint.
    const last = isCos ? (m.card || NOT_RECORDED) : m.status === 'Working' ? m.last : work ? work.last : m.last;
    const feeds = v3 && item ? { feeds: itemFeeds(p.ctx, item) } : null;
    const noFeeds = (isCos && p.project.model === 'v3') || (work && work.helper && m.status !== 'Working');
    const place = item && fv && fv.ok ? fv.index.get(item) : null;
    return h('div', { class: 'sb-tile', key: `tile:${m.id}`, 'data-member': m.id },
      h('a', { class: 'sb-tile-n', href: go('p', name, 'team', m.id) }, ic(memberIcon(m.status)), h('strong', {}, m.label)),
      h('span', { class: 'sb-tile-st' }, m.status),
      h('span', { class: 'sb-muted small' }, last),
      feeds ? (feeds.feeds ? h('span', { class: 'sb-feeds' }, 'feeds ', h('b', {}, feeds.feeds.code), ` · ${feeds.feeds.name}`)
        : h('span', { class: 'sb-feeds gap' }, 'feeds: not tied to a milestone')) : noFeeds ? h('span', { class: 'sb-feeds gap' }, 'feeds: not recorded') : null,
      place ? h('a', { class: 'sb-tlink', href: go('p', name, 'timeline', 'sprint', item) }, 'On the Timeline ›') : null);
  })));
  return h('section', { class: 'sb-screen' }, body, bottomBar(name, 'team', p.q.waiting));
}

function renderMember(p, tv, id, sub, idx, now) {
  const name = p.project.name;
  const page = memberPage(p.project, p.model, p.snap, p.j, p.q, tv, id, now, TZ);
  if (!page) return h('section', { class: 'sb-screen' }, marker(), projectHeader(name, 'Team'), h('p', {}, 'No such member.'), bottomBar(name, 'team', p.q.waiting));
  const body = [marker(), projectHeader(name, page.label, page.status)];
  body.push(h('h2', { class: 'sb-h2' }, 'Responsible for'));
  body.push(h('div', { class: 'sb-resp' }, page.groups.map((g) => h('details', { class: 'sb-card', key: `resp:${g.title}` },
    h('summary', {}, h('strong', {}, g.title), h('span', { class: 'sb-gcount' }, g.count == null ? NOT_RECORDED : String(g.count)),
      h('span', { class: 'sb-muted small sb-latest' }, g.latest || (g.count == null ? g.why : g.count === 0 ? 'none yet' : g.latestWhy || 'latest: not recorded'))),
    g.items && g.items.length ? h('ul', { class: 'sb-qlist' }, g.items.map((it) => h('li', {}, it.link ? ext(it.link, it.text) : it.text))) : h('p', { class: 'sb-muted small' }, g.why || 'None.')))));
  body.push(h('h2', { class: 'sb-h2' }, 'Running log'));
  if (page.upNext.length) body.push(h('div', { class: 'sb-upnext' }, h('p', { class: 'sb-eyebrow' }, 'Up next (from the records)'), h('ul', {}, page.upNext.map((u) => h('li', {}, u)))));
  if (!page.log.length) body.push(h('p', { class: `sb-muted${page.sessionLines ? ' sb-logw' : ''}` }, page.logWords));
  else body.push(branchLog(p, page));
  const out = [h('section', { class: 'sb-screen' }, body, bottomBar(name, 'team', p.q.waiting))];
  if (sub === 'now') {
    out.push(page.working ? workingSheet(p, id, workingNow(p.project, p.model, p.snap, p.j, id, page, now, TZ))
      : sheetFrame(go('p', name, 'team', id), 'Working now', [h('p', {}, `${page.label} is not working now: the work this sheet was about has ended.`)]));
  }
  if (sub === 'e' && idx != null) {
    out.push(page.log[Number(idx)] ? summaryNode(p, id, summarySheet(p.project, p.snap, page.log[Number(idx)], p.q))
      : sheetFrame(go('p', name, 'team', id), 'Summary', [h('p', {}, 'This entry is no longer in the running log the desk reads.')]));
  }
  return out;
}

/** The running log's geometry (AC49): rows ROW_H tall, the main line at X(0), lane places 14 px apart. */
export const ROW_H = 44;
const LANE_X = (slot) => 9 + slot * 14;
const branchLayouts = new Map(); // the drawing's key → { layout, family }, for fitting it to the rows the browser laid out

/**
 * The running log as a branch timeline (AC49, note 11): newest at the top; one drawing behind all
 * its rows (branchLayout's shapes), a lane per item, a shade of the member's colour per lane.
 */
function branchLog(p, page) {
  const L = page.layout;
  const key = `branch:${page.id}`;
  const family = page.id === 'owner' ? 'you' : 'agent';
  branchLayouts.set(key, { layout: L, family });
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', `sb-lanes fam-${family}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  drawBranch(svg, L, page.log.map((_, i) => i * ROW_H + ROW_H / 2), page.log.length * ROW_H);
  return h('div', { class: 'sb-branch', key },
    svg,
    h('ol', { class: 'sb-brows' }, page.log.map((e, i) => {
      const href = e.now ? go('p', p.project.name, 'team', page.id, 'now') : go('p', p.project.name, 'team', page.id, 'e', String(i));
      const lane = L.lanes.find((l) => l.id === e.lane);
      return h('li', { class: `sb-brow${e.now ? ' now' : ''}`, key: `brow:${i}` },
        opener(e.now ? 'log:now' : `log:${i}`, href, {}, h('span', { class: 'sb-brow-t' }, e.text), e.now ? h('span', { class: 'sb-nowtag' }, 'now') : null,
          h('span', { class: `sb-brow-lane${lane ? ` shade-${lane.shade}` : ''}` }, e.lane || 'project')));
    })));
}

/** Draw branchLayout's shapes into `svg`, each row's centre at centres[i] (the drawing's own rows, or the browser's). */
function drawBranch(svg, L, centres, height) {
  const width = LANE_X(L.slots) + 12;
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(Math.max(1, Math.ceil(height))));
  svg.setAttribute('viewBox', `0 0 ${width} ${Math.max(1, Math.ceil(height))}`);
  const kids = [];
  const el = (tag, attrs) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    kids.push(n);
    return n;
  };
  const y = (i) => centres[i];
  const r = (v) => Math.round(v * 10) / 10;
  const x0 = LANE_X(0);
  const bend = ROW_H * 0.6;
  if (L.rows) el('line', { x1: x0, y1: r(y(0)), x2: x0, y2: r(height), class: 'main', 'data-kind': 'main' });
  for (const l of L.lanes) {
    const x = LANE_X(l.slot);
    const cls = `lane shade-${l.shade}`;
    el('line', { x1: x, y1: r(y(l.top)), x2: x, y2: r(l.edge ? height : y(l.bottom)), class: cls, 'data-kind': 'lane', 'data-lane': l.id });
    if (l.fork) {
      el('path', { d: `M${x0} ${r(y(l.bottom) + bend)} Q${x0} ${r(y(l.bottom))} ${x} ${r(y(l.bottom))}`, class: cls, 'data-kind': 'fork', 'data-lane': l.id, 'data-row': l.bottom });
    }
    if (l.join != null) {
      el('path', { d: `M${x} ${r(y(l.join))} Q${x} ${r(y(l.join) - bend)} ${x0} ${r(y(l.join) - bend)}`, class: cls, 'data-kind': 'join', 'data-lane': l.id, 'data-row': l.join });
    }
    if (l.stub) el('line', { x1: x, y1: r(y(l.top)), x2: x, y2: r(y(l.top) - 14), class: `${cls} stub`, 'data-kind': 'stub', 'data-lane': l.id });
  }
  for (const d of L.dots) {
    const lane = L.lanes.find((l) => l.slot === d.slot && l.top <= d.row && l.bottom >= d.row);
    const cls = `dot ${lane ? `shade-${lane.shade}` : 'shade-main'}${d.now ? ' now' : ''}`;
    if (d.now) el('circle', { cx: LANE_X(d.slot), cy: r(y(d.row)), r: 8, class: 'ring', 'data-kind': 'ring', 'data-row': d.row });
    el('circle', { cx: LANE_X(d.slot), cy: r(y(d.row)), r: d.now ? 5 : 4.5, class: cls, 'data-kind': 'dot', 'data-row': d.row, 'data-slot': d.slot });
  }
  svg.replaceChildren(...kids);
}

/** In the browser: redraw each running log at the centres of the rows as laid out, should a row have wrapped taller. */
function fitBranches() {
  const view = document.getElementById('view');
  if (!view || !view.querySelectorAll) return;
  for (const box of view.querySelectorAll('.sb-branch')) {
    const entry = branchLayouts.get(box.getAttribute('data-k'));
    const svg = box.querySelector('svg');
    const list = box.querySelector('ol');
    if (!entry || !svg || !list) continue;
    const rows = [...list.children];
    if (!rows.length || typeof rows[0].offsetTop !== 'number') continue;
    const top = list.offsetTop;
    const centres = rows.map((li) => li.offsetTop - top + li.offsetHeight / 2);
    const height = list.offsetHeight;
    const off = centres.some((c, i) => Math.abs(c - (i * ROW_H + ROW_H / 2)) > 0.5) || Math.abs(height - rows.length * ROW_H) > 0.5;
    if (off) drawBranch(svg, entry.layout, centres, height);
  }
}

/**
 * A sheet (AC56): a scrim behind it that closes it on a tap outside, a visible "Close" at its top,
 * and Escape (the page's keydown). `back` is the screen under it; closing returns focus to the
 * control that opened it.
 */
function sheetFrame(back, title, parts, key = 'sheet', heading = true) {
  return [h('a', { class: 'sb-scrim', key: 'scrim', href: back, 'aria-label': 'Close', tabindex: '-1', onclick: (e) => { if (e && e.preventDefault) e.preventDefault(); nav.to(back); } }),
    h('div', { class: 'sb-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title, key },
      h('div', { class: 'sb-sheet-top' }, h('span', { class: 'sb-grab', 'aria-hidden': 'true' }), closeControl(() => nav.to(back))),
      heading ? h('h2', { class: 'sb-sheet-t' }, title) : null, parts)];
}

function workingSheet(p, id, wn) {
  const back = go('p', p.project.name, 'team', id);
  return sheetFrame(back, 'Working now', [
    h('p', { class: 'sb-lead' }, wn.doing),
    h('div', { class: 'sb-kpis' }, wn.tiles.map((t) => h('div', { class: 'sb-kpi' }, h('span', { class: 'sb-eyebrow' }, t.label),
      t.since != null ? h('strong', { live: () => durationText(Math.max(0, Date.now() - t.since)) }) : h('strong', {}, t.value),
      t.why ? h('span', { class: 'sb-muted small' }, t.why) : null))),
    h('ul', { class: 'sb-kv' }, wn.lines.map((l) => h('li', {}, h('strong', {}, `${l.label}: `), l.value, l.why ? h('span', { class: 'sb-muted small' }, ` (${l.why})`) : null))),
    h('p', { class: 'sb-muted small' }, 'The desk reads only what has landed in GitHub: no live narration.')]);
}

function summaryNode(p, id, sm) {
  const back = go('p', p.project.name, 'team', id);
  return sheetFrame(back, 'Summary', [
    h('div', { class: 'sb-sec' }, h('h3', {}, 'What happened'), h('p', {}, sm.what), sm.quote ? h('pre', { class: 'sb-quote' }, sm.quote) : null,
      sm.figures ? h('ul', { class: 'sb-kv sb-figs' }, sm.figures.map((f) => h('li', {}, f))) : null,
      h('p', { class: 'small' }, sm.link ? ext(sm.link, 'From the record') : 'no file recorded')),
    h('div', { class: 'sb-sec' }, h('h3', {}, 'Why'), h('p', {}, sm.why)),
    h('div', { class: 'sb-sec' }, h('h3', {}, 'For you'), h('p', {}, sm.forYou)),
    h('p', { class: 'sb-muted small' }, 'The standard summary, from the record\'s own fields. A written summary needs a model change.')]);
}

// ---------------------------------------------------------------------------
// Moving about (AC56): routes, the sandbox's own history of screens, and where the focus goes.

/**
 * A route: the screen it shows and any sheet over it. Sheets and bubbles are not screens, so
 * opening one adds nothing to the history. Returns { key, screen (its hash), kind, name, run,
 * member, sheet }.
 */
export function parseRoute(hash) {
  const [r0, name, kind, ...rest] = routeParts(hash);
  if (r0 !== 'p' || !name) return { key: 'home', screen: '#/', kind: 'home', name: null, sheet: null };
  const base = { name, sheet: null };
  if (kind === 'queue') return { ...base, key: `p/${name}/queue`, screen: go('p', name, 'queue'), kind, sheet: rest.length ? rest.join('/') : null };
  // AC59: the Timeline opens at Now; `timeline/sprint/<id>` at a sprint and `timeline/ms/<code>` at a milestone (AC66, AC67).
  if (kind === 'timeline') {
    const at = (rest[0] === 'sprint' || rest[0] === 'ms') && rest[1] ? { [rest[0]]: rest[1] } : { now: true };
    return { ...base, key: `p/${name}/timeline`, screen: at.now ? go('p', name, 'timeline') : go('p', name, 'timeline', rest[0], rest[1]), kind, at };
  }
  if (kind === 'team') {
    const member = rest[0] || null;
    if (!member) return { ...base, key: `p/${name}/team`, screen: go('p', name, 'team'), kind };
    const sheet = rest[1] === 'now' ? 'now' : rest[1] === 'e' && rest[2] != null ? `e:${rest[2]}` : null;
    return { ...base, key: `p/${name}/team/${member}`, screen: go('p', name, 'team', member), kind, member, sheet };
  }
  if (kind === 'pipeline' || kind === 'asked' || kind === 'agents' || kind === 'notes') return { ...base, key: `p/${name}/${kind}`, screen: go('p', name, kind), kind };
  return { ...base, key: `p/${name}`, screen: go('p', name), kind: 'status', sheet: kind === 'info' ? 'info' : null };
}

const nav = {
  route: parseRoute(''),
  history: [], // [{ key, hash }]: the screens, oldest first
  opener: null, // the key of the control that last opened a sheet
  sheetOpener: null,
  focusNext: null,
  lastHash: null,
  backing: false,
  canBack() { return this.history.length > 1; },
  /** Go to a hash now (setting location.hash also fires hashchange later; the same hash is ignored). */
  to(hash) {
    location.hash = hash;
    this.changed();
  },
  back() {
    if (this.history.length < 2) return;
    this.history.pop();
    this.backing = true;
    this.to(this.history[this.history.length - 1].hash);
  },
  start() {
    const r0 = parseRoute(location.hash);
    const proj = r0.name ? CONFIG.projects.find((x) => x.name === r0.name) : null;
    if (r0.kind === 'pipeline' && proj && proj.model === 'v3') {
      // AC68: opened on a v3 project's Pipeline route, the sandbox shows the Timeline at Now in its place.
      const to = go('p', r0.name, 'timeline');
      try {
        if (typeof location.replace === 'function') location.replace(to);
        else location.hash = to;
      } catch {
        location.hash = to;
      }
    }
    this.route = parseRoute(location.hash);
    this.lastHash = location.hash;
    this.history = [{ key: this.route.key, hash: this.route.screen }];
    this.scrollTo = this.route.kind === 'timeline' ? this.route.at : null;
    if (this.scrollTo && this.scrollTo.sprint) this.openSprint = { name: this.route.name, sprint: this.scrollTo.sprint };
  },
  changed() {
    if (location.hash === this.lastHash) return;
    let next = parseRoute(location.hash);
    // AC68: a v3 project's Pipeline route opens the Timeline at Now in its place, replacing the
    // history entry rather than adding one, so "Back" never returns to it.
    const proj = next.name ? CONFIG.projects.find((x) => x.name === next.name) : null;
    if (next.kind === 'pipeline' && proj && proj.model === 'v3') {
      const to = go('p', next.name, 'timeline');
      try {
        if (typeof location.replace === 'function') location.replace(to);
        else location.hash = to;
      } catch {
        location.hash = to;
      }
      next = parseRoute(to);
    }
    this.lastHash = location.hash;
    const prev = this.route;
    this.route = next;
    const top = this.history[this.history.length - 1];
    if (this.backing) this.backing = false;
    else if (!top || top.key !== next.key) this.history.push({ key: next.key, hash: next.screen });
    else top.hash = next.screen;
    const moved = prev.key !== next.key || JSON.stringify(prev.at || null) !== JSON.stringify(next.at || null);
    if (!moved && prev.sheet && !next.sheet) this.focusNext = this.sheetOpener;
    else if (!prev.sheet && next.sheet) {
      this.sheetOpener = this.opener;
      this.focusNext = 'sheet-close';
    } else if (moved) this.focusNext = null;
    if (moved) bubble.close();
    // The Timeline scrolls to Now (or to a sprint) only when it is opened, never on a refresh (AC56, AC59).
    this.scrollTo = moved && next.kind === 'timeline' ? next.at : null;
    if (this.scrollTo && this.scrollTo.sprint) this.openSprint = { name: next.name, sprint: this.scrollTo.sprint };
    const toTop = moved && !this.scrollTo;
    render();
    if (toTop) window.scrollTo(0, 0);
    focusPending();
  },
};

function focusPending() {
  const k = nav.focusNext;
  nav.focusNext = null;
  if (!k) return;
  const view = document.getElementById('view');
  let el = view ? findKey(view, k) : null;
  // A held whole-line bubble closed, its control gone with the old line or row: focus goes to the
  // line or fold heading it belonged to (AC56, draft 5).
  if (!el && view && k.startsWith('line:')) el = findKey(view, k === 'line:last' ? 'last-action' : 'done-today-h');
  if (el && el.focus) {
    try {
      el.focus();
    } catch {
      // focus is a courtesy; the screen is right either way
    }
  }
}

/**
 * The sandbox's bubbles: Home's "Latest" and whole-summary bubbles (AC54), and the whole-line
 * bubbles of "Your last action" and "Done today" (AC55, AC52). One is open at a time: `open` names
 * it by its control's key (`latest:<name>`, `sum:<name>` or `line:<id>`).
 */
const bubble = {
  open: null, // the open bubble's control key
  via: null, // 'hover' | 'tap' | 'key'
  place: null, // 'down' | 'up' | 'held': below or above its control, or held in the viewport (taller than the room)
  escaped: null, // a "Latest" bubble closed with Escape stays closed while focus stays on its control
  pointer: null,
  pointerFocus: null, // a pointer pressed on this control: the focus that follows is its tap's, not the keyboard's
  returnTo: null, // a bubble closed by a tap outside: its control takes the focus back when the tap's click lands
  hover: { ctl: false, bubble: false },
  close() {
    this.open = null;
    this.via = null;
    this.place = null;
    this.hover = { ctl: false, bubble: false };
  },
};

/** The bubble element's key for a control's key: `bubble:<name>` for "Latest", `sumbubble:<name>` for the summary, `linebubble:<id>` for a whole line. */
function bubbleKey(k) {
  if (k.startsWith('sum:')) return `sumbubble:${k.slice(4)}`;
  if (k.startsWith('line:')) return `linebubble:${k.slice(5)}`;
  return `bubble:${k.slice(7)}`;
}
/** The open bubble's place, as its class. */
const placeClass = () => (bubble.place === 'up' || bubble.place === 'held' ? bubble.place : 'down');

function focusKey(k) {
  nav.focusNext = k;
  focusPending();
}

function bubbleOpen(k, via) {
  if (bubble.open === k) {
    if (via !== 'hover') bubble.via = via;
  } else {
    bubble.close();
    bubble.open = k;
    bubble.via = via;
  }
  bubble.escaped = null;
  render();
  placeBubble();
}

/** A tap on the control: opens it, and a second tap closes it (AC54). A mouse click on a hovered bubble keeps it. */
function bubbleTap(k, e) {
  const pointer = (e && e.pointerType) || bubble.pointer;
  if (bubble.pointerFocus === k) bubble.pointerFocus = null; // the tap is done; a later focus is the keyboard's
  if (bubble.open === k) {
    if (bubble.via === 'hover' && pointer === 'mouse') {
      bubble.via = 'tap';
      return;
    }
    bubble.close();
    render();
    // The summary's and a whole line's control keep the focus (a phone's tap may not give a button
    // focus); the "Latest" control already has it, and focusing it again would reopen it.
    if (!k.startsWith('latest:')) focusKey(k);
    return;
  }
  bubbleOpen(k, 'tap');
}

/** With a pointer: open on hover over the control; close once the pointer has left both the control and the bubble. */
function bubbleHover(k, inside, part) {
  if (inside) {
    bubble.hover[part] = true;
    if (bubble.open !== k) bubbleOpen(k, 'hover');
    return;
  }
  if (bubble.open !== k) return;
  bubble.hover[part] = false;
  setTimeout(() => {
    if (bubble.open === k && bubble.via === 'hover' && !bubble.hover.ctl && !bubble.hover.bubble) {
      bubble.close();
      render();
    }
  }, 120);
}

function closeBubbleByEscape() {
  const k = bubble.open;
  bubble.close();
  bubble.escaped = k;
  render();
  focusKey(k);
}

/** Whether a tapped element sits in something that takes focus itself (a link, a control, a field). */
function inFocusable(t) {
  for (let n = t; n && n.tagName; n = n.parentNode) {
    const tag = String(n.tagName).toLowerCase();
    if (['a', 'button', 'input', 'textarea', 'select', 'summary'].includes(tag)) return true;
    if (n.getAttribute && n.getAttribute('tabindex') != null) return true;
  }
  return false;
}

/**
 * A tap outside an open bubble closes it, with focus back on its control (AC54, AC56). A tap on
 * something that takes focus itself (another card's control, a link) leaves the focus to it. The
 * focus goes back once the tap's click has landed, after the browser has moved focus for the press,
 * and the control does not reopen on it.
 */
function outsideTap(e) {
  bubble.returnTo = null;
  if (!bubble.open) return;
  const t = e && e.target;
  const inBubble = t && t.closest && (t.closest('[data-bubble]') || (t.closest('[data-k]') && t.closest('[data-k]').getAttribute('data-k') === bubble.open));
  if (inBubble) return;
  const k = bubble.open;
  bubble.close();
  if (!inFocusable(t)) bubble.returnTo = k;
  render();
}

/** The click that ends a tap outside: the closed bubble's control takes the focus back. */
function outsideTapEnd() {
  const k = bubble.returnTo;
  bubble.returnTo = null;
  if (!k || bubble.open) return;
  const a = document.activeElement;
  if (a && a !== document.body && inFocusable(a)) return; // the tap gave focus to something of its own
  bubble.escaped = k;
  focusKey(k);
}

/** The first element under `root` with the class `cls`. */
function findClass(root, cls) {
  let out = null;
  eachElement(root, (e) => { if (!out && ` ${e.getAttribute ? e.getAttribute('class') || '' : ''} `.includes(` ${cls} `)) out = e; });
  return out;
}

function setPlace(el, place) {
  bubble.place = place;
  el.setAttribute('class', el.getAttribute('class').replace(/\b(down|up|held)\b/, place));
}

/**
 * Where the open bubble sits (AC54, AC55, AC56): wholly inside the viewport, a margin from its
 * edges, and clear of the project screens' bottom bar (Home has none). Below its control; above it
 * when below would leave that room; scrolled into it when neither fits as it stands. A bubble taller
 * than the room (its height is held to it, CSS) or one the page cannot scroll into it is held in the
 * viewport itself, scrolling up and down inside, its "Close" in view at its top.
 */
const BUBBLE_MARGIN = 8;
function placeBubble() {
  if (!bubble.open || bubble.place) return;
  const view = document.getElementById('view');
  const el = view ? findKey(view, bubbleKey(bubble.open)) : null;
  bubble.place = 'down';
  if (!el || !el.getBoundingClientRect || typeof window.innerHeight !== 'number') return;
  try {
    const dock = findClass(view, 'sb-dock');
    const dockTop = dock && dock.getBoundingClientRect ? dock.getBoundingClientRect().top : window.innerHeight;
    const top = BUBBLE_MARGIN;
    const bottom = Math.min(window.innerHeight, dockTop) - BUBBLE_MARGIN;
    let r = el.getBoundingClientRect();
    if (el.scrollHeight > el.clientHeight + 1 || r.height > bottom - top) {
      setPlace(el, 'held');
      return;
    }
    const anchor = el.offsetParent || el.parentNode;
    const a = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : null;
    if (r.bottom > bottom && a && a.top - 4 - r.height >= top) {
      setPlace(el, 'up');
      r = el.getBoundingClientRect();
    }
    if (typeof window.scrollBy === 'function') {
      if (r.top < top) window.scrollBy(0, r.top - top);
      else if (r.bottom > bottom) window.scrollBy(0, Math.min(r.bottom - bottom, r.top - top));
    }
    r = el.getBoundingClientRect();
    if (r.top < top - 0.5 || r.bottom > bottom + 0.5) setPlace(el, 'held'); // the page could not scroll far enough
  } catch {
    // placement is a courtesy; the bubble still opens below
  }
}

/**
 * Whether each card's summary runs past three lines (AC54 (a)), as drawn: its box is three lines
 * high and hides the rest, so the summary runs past three lines when the box's content is taller
 * than the box. Measured after every redraw and when the width changes; when the answer changes for
 * a card, the screen is drawn again (before the browser paints). Where nothing can be measured, the
 * last answer stands (none: the summary shows as it fits).
 */
const summaryOver = new Map();
/** The same for a ruling's line (AC55, AC52): its box holds at most three lines (CSS) and hides the rest. */
const lineOver = new Map();
const lineText = new Map(); // id → the words drawn (lineBox)
const lineAt = new Map(); // id → { text, width } when last judged over
/**
 * Short, the one-line form also holds the time and code in the box, so a line whose words alone
 * fit in three lines may still run past them with the time and code; once judged over at a width,
 * it stays over for the same words at that width (no flip back and forth), and is judged afresh
 * when either changes.
 */
function lineStaysOver(id) {
  const at = lineAt.get(id);
  return Boolean(at && at.text === lineText.get(id) && at.width === window.innerWidth);
}
function measureClips() {
  const view = document.getElementById('view');
  if (!view) return;
  let changed = false;
  eachElement(view, (el) => {
    if (!el.getAttribute) return;
    const sum = el.getAttribute('data-sum');
    const line = el.getAttribute('data-line');
    if (sum == null && line == null) return;
    const [sh, ch] = [el.scrollHeight, el.clientHeight];
    if (typeof sh !== 'number' || typeof ch !== 'number' || !ch) return;
    let over = sh > ch + 1;
    if (line != null) {
      if (over && lineOver.get(line) !== true) lineAt.set(line, { text: lineText.get(line), width: window.innerWidth });
      else if (lineOver.get(line) === true && lineStaysOver(line)) over = true;
    }
    const [map, name, k] = sum != null ? [summaryOver, sum, `sum:${sum}`] : [lineOver, line, `line:${line}`];
    if (map.get(name) !== over) {
      map.set(name, over);
      changed = true;
      // A text that now fits has no control, so its bubble closes.
      if (!over && bubble.open === k) bubble.close();
    }
  });
  // A guard: a few redraws in a row from measuring alone, then the answers stand until the next one.
  measureClips.runs = changed ? (measureClips.runs || 0) + 1 : 0;
  if (changed && !measureClips.queued && measureClips.runs <= 3) {
    measureClips.queued = true;
    Promise.resolve().then(() => {
      measureClips.queued = false;
      const a = document.activeElement;
      const ak = a && a.getAttribute ? a.getAttribute('data-k') : null;
      render();
      // A line that now fits has no control: if that control had the focus (a held bubble just
      // closed onto a new, shorter line), focus goes to the line or fold heading (AC56, draft 5).
      const view = document.getElementById('view');
      if (ak && ak.startsWith('line:') && view && !findKey(view, ak)) focusKey(ak);
    });
  }
}

/** Home's groups' open or closed state (AC54 (d)), kept on the device under its own key, wrapped as J5's storage is. */
const homeGroups = {
  store: null,
  state: null,
  load(store) {
    this.store = store;
    const start = Object.fromEntries(HOME_GROUPS.map((g) => [g.key, g.open]));
    let saved = null;
    try {
      saved = store ? store.getJSON(HOME_GROUPS_KEY, null) : null;
    } catch {
      saved = null;
    }
    this.state = { ...start };
    if (saved && typeof saved === 'object') for (const g of HOME_GROUPS) if (typeof saved[g.key] === 'boolean') this.state[g.key] = saved[g.key];
  },
  isOpen(k) {
    return this.state ? Boolean(this.state[k]) : HOME_GROUPS.find((g) => g.key === k).open;
  },
  toggle(k) {
    if (!this.state) this.load(null);
    this.state[k] = !this.state[k];
    try {
      if (this.store) this.store.setJSON(HOME_GROUPS_KEY, this.state);
    } catch {
      // storage failing costs only the memory of the groups (AC54)
    }
  },
};

// ---------------------------------------------------------------------------
// Start

let render = () => {};

/**
 * Start the sandbox. opts (tests only): { config, call } in place of J7's config and the desk
 * function; the page itself passes nothing.
 */
export function startSandbox(opts = {}) {
  if (opts.config) {
    CONFIG = opts.config;
    TZ = CONFIG.ownerTimeZone;
  }
  const call = opts.call || ((path, body) => callFunction(path, body));
  const view = document.getElementById('view');
  const stateEl = document.getElementById('screen-state');
  try {
    document.documentElement.classList.add('sb');
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'sandbox.css');
    document.head.append(link);
  } catch {
    // the page still renders, unstyled
  }
  const store = createStore();
  const clock = { now: () => Date.now(), setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: (id) => clearTimeout(id) };
  const isVisible = () => document.visibilityState === 'visible';
  const seen = createSeen({ store, now: () => Date.now() });
  homeGroups.load(store);
  // J12: the pull requests are kept under their own key in a store of their own, so a write that
  // fails there (the device's storage full) turns off only that key, never the blob cache.
  const pullsStore = createStore();
  const desk = createDesk({ config: CONFIG, call, clock, store, pullsStore, isVisible, onChange: () => render(), j11: true });
  DESK = desk;
  ns.store = store;
  ns.looked = false;
  nav.start();
  /** Every redraw patches the screen in place (AC56), so a refresh keeps it as the owner left it. */
  const show = (nodes) => {
    const fresh = document.createElement('main');
    for (const n of [nodes].flat(Infinity)) if (n) fresh.append(n);
    morphChildren(view, fresh);
    fitBranches();
    fitRails();
    measureClips();
    // The Timeline just opened: scroll to its Now line (or the sprint) once it is drawn (AC59).
    if (nav.scrollTo && nav.route.kind === 'timeline') {
      const t = nav.scrollTo;
      if (scrollToTarget(t)) nav.scrollTo = null;
    }
  };
  render = guardRender(draw, (state) => {
    if (stateEl) stateEl.textContent = state.text;
    show(h('section', { class: 'sb-screen' }, marker(), h('p', { class: 'sb-stale' }, state.text), h('p', {}, h('a', { href: '#/' }, 'Home'))));
  }, () => desk.signedOut);
  function draw() {
    const now = new Date(Date.now());
    const built = CONFIG.projects.map((project) => {
      const box = safeBox(project.name, () => desk.model(project.name), desk.states.get(project.name), desk, now.getTime());
      if (box.drawError) return { project, box, error: new Error(box.drawError.replace(/^Can't show this project: /, '')) };
      try {
        return buildProject(desk, project, box, now);
      } catch (err) {
        box.drawError = `Can't show this project: ${errorText(err)}`;
        return { project, box, error: err };
      }
    });
    const s = screenState(built.map((b) => b.box), desk.signedOut);
    if (stateEl) stateEl.textContent = desk.signedOut ? SIGNED_OUT_STATE.text : s.text;
    document.title = `Sandbox — ${desk.signedOut ? SIGNED_OUT_STATE.text : s.text}`;
    const r = nav.route;
    let node;
    if (r.name) {
      const name = r.name;
      const b = built.find((x) => x.project.name === name);
      if (!b) node = h('section', { class: 'sb-screen' }, marker(), h('p', {}, 'No such project. ', h('a', { href: '#/' }, 'Home')));
      else if (b.error) {
        node = h('section', { class: 'sb-screen' }, marker(), projectHeader(name, 'Current status'),
          h('p', { class: 'sb-stale' }, b.box.drawError || `Can't show this project: ${errorText(b.error)}`));
      } else {
        try {
          if (r.kind === 'queue') node = renderQueue(b, r.sheet);
          else if (r.kind === 'timeline') {
            if (nav.openSprint && nav.openSprint.name === name) {
              openSprintFolds(b, nav.openSprint.sprint);
              nav.openSprint = null;
            }
            node = renderTimeline(b);
          } else if (r.kind === 'notes') node = renderNotes(b);
          else if (r.kind === 'team') {
            const [sub, idx] = r.sheet ? r.sheet.split(':') : [null, null];
            node = renderTeam(b, r.member || null, sub, idx);
          } else if (r.kind === 'pipeline') node = b.project.model === 'v3' ? renderTimeline(b) : renderPipeline(b);
          else if (r.kind === 'asked') node = renderAsked(b);
          else if (r.kind === 'agents') node = renderAgents(b);
          else node = renderStatus(b);
        } catch (err) {
          node = h('section', { class: 'sb-screen' }, marker(), projectHeader(name, 'Current status'),
            h('p', { class: 'sb-stale' }, `Can't show this project: ${errorText(err)}`));
        }
      }
    } else node = renderHome(desk, built, seen, now.getTime());
    show(node);
  }
  window.addEventListener('hashchange', () => nav.changed());
  // Escape closes the open sheet, or the open bubble (AC54, AC56).
  document.addEventListener('keydown', (e) => {
    if (!e || e.key !== 'Escape') return;
    if (nav.route.sheet) {
      nav.to(nav.route.screen);
      return;
    }
    if (bubble.open) closeBubbleByEscape();
  });
  document.addEventListener('pointerdown', outsideTap);
  document.addEventListener('click', outsideTapEnd);
  document.addEventListener('visibilitychange', () => {
    if (isVisible()) seen.visible();
    else seen.hidden();
    desk.visibilityChanged();
  });
  window.addEventListener('pagehide', () => seen.hidden());
  window.addEventListener('resize', () => {
    fitBranches();
    fitRails();
    measureClips(); // a turned phone or a resized window: judged again at the new width (AC54 (a))
    // An open bubble is placed again for the new screen: inside it, clear of the bottom bar (N2).
    if (bubble.open) {
      bubble.place = null;
      render();
      placeBubble();
    }
  });
  // The 15-second tick (AC56) changes only the text that depends on the time, in place.
  setInterval(() => { if (isVisible()) tick(view); }, 15_000);
  boot(render, desk);
  return desk;
}

/** The tick: each time-dependent text (`live`) is worked out again; no other element is touched. */
export function tick(root) {
  eachElement(root, (el) => {
    if (el._live) {
      const t = String(el._live());
      if (el.textContent !== t) el.textContent = t;
    }
    if (el._liveClass) {
      const c = el._liveClass();
      if (el.getAttribute('class') !== c) el.setAttribute('class', c);
    }
  });
}

/** Redraw now, as any refresh would (tests: "a redraw with no new data at all"). */
export function refresh() {
  render();
}

export { whenText };
