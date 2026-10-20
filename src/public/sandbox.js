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
import { usageEntry } from './lib/usage.js';
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
  j11Records, timelineOf, phaseView, whereLine, queueView, pillView, ballLines, sheetView, treeLink, youWaitText, optionsBlock, waitWords,
} from './lib/sandbox.js';
import { teamView, memberPage, workingNow, summarySheet } from './lib/sandbox.js';
import { summaryView, latestText, HOME_GROUPS, HOME_GROUPS_KEY, homeGroupOf, groupHeaderWords, lastAction } from './lib/sandbox.js';
import { composeAnswer, questionQuestions, CANT_SPLIT } from './lib/sandbox.js';
import { projectCards, boardView, judgeMarks, markDone, undoMark, readMarks, noMarks, recordDone, answerButtons, metaText, LANES, WORDS, MARKS_KEY,
  boardAge, doneTime, HOLD_MS, MOUSE_DRAG_PX, FINGER_SLOP_PX, LANE_MARGIN_PX } from './lib/board.js';
import { waitKey } from './lib/waiting.js';
import { canRecord } from './lib/model.js';
import { parseWorkflowRuns } from './lib/records.js';
import { V25_RULING_NOTE } from './lib/links.js';
import { runsContext, statusPhases, tilePhases, markerView, feedView, unblocksOf, GROUP_MARK, memberIcon, memberWork, TEAM_KEY, itemFeeds,
  stalledLine, deployRows, FEED_ICONS_KEY, doneTarget, JOB_MERGE_WORDS, ESTIMATE_MERGE_WORDS } from './lib/feed.js';
import { WA, DRAFT_KEY, todayOf } from './lib/workahead.js';
import { workAheadView, readDraft } from './lib/workview.js';

import {
  NOTIFY_WORDS, NOTIFY_STORE_KEY, COPY_DONE_WORDS, SHOW_AGAIN_WORDS, SEND_TEST_WORDS, copySteps, testSteps, notifyState, onTopLine,
  isStandalone, permissionOf, currentSubscription, subscriptionValue, turnOn, USAGE_TITLE, usageView, RECHECK_WORDS, recheckOutcome,
  openTarget, tapDecision, sandboxAddress, OPENED_WORDS, GONE_WORDS, CANT_READ_WORDS,
} from './lib/notifyview.js';

let CONFIG = DEFAULT_CONFIG; // J7; the tests pass their own (AC42's five projects)

// ---------------------------------------------------------------------------
// AC74 from 2026-10-19 (the owner's ruling "A. Go live now, switch later (Recommended)"): a
// notification's tap opens the sandbox, `?sandbox&open=<key>`, with AC74's and AC77's tap rules
// (tapDecision, shared with the accepted view) drawn in the sandbox's own design.

/** The tap being followed: { target, done, banner: { hash, words, key } | null, more: project name | null }. */
const opening = { target: null, done: true, banner: null, more: null };
let openMore = null; // a project whose More detail opens at AC78's line on its next drawing
let scrollToRow = null; // a tapped row's id, brought into view on its next drawing
/** A queue row's element id, from its key. */
const rowId = (key) => `row-${String(key).replace(/[^A-Za-z0-9_-]/g, '-')}`;

/**
 * Follow a tap once its project is read and AC77's closed read for it has answered or failed: the
 * screen to go to, { hash, words, key } (words null: no line), or null while there is nothing to do.
 */
function followOpening(desk, built) {
  if (!opening.target || opening.done) return null;
  const d = tapDecision({ target: opening.target, projects: CONFIG.projects, settled: (n) => desk.closedSettled(n),
    box: (n) => {
      const b = built.find((x) => x.project.name === n);
      return b ? { read: b.box.read, model: b.error ? null : b.model } : null;
    } });
  if (!d || d.kind === 'wait') return null;
  opening.done = true;
  const t = opening.target;
  if (d.kind === 'usage') {
    // AC78's line, in the More detail of the project whose entry holds `actionsUsage` (J7, draft 9).
    const e = usageEntry(CONFIG);
    const name = e ? e.project : CONFIG.projects[0].name;
    openMore = name;
    return { hash: go('p', name), words: null, key: null };
  }
  const name = d.project ? d.project.name : null;
  // AC80 (2026-10-19): the board opens with that card's sheet open, in whichever lane it is, marked
  // "Opened from a notification"; a key this device marked done opens its Done row.
  if (d.kind === 'item') return { hash: go('waiting', 'card', t.key), words: OPENED_WORDS, key: t.key };
  if (d.kind === 'held') {
    // AC77: the "Being asked in your session" fold, open.
    boardState.folds.add('asking');
    return { hash: '#/waiting', words: OPENED_WORDS, key: t.key };
  }
  if (d.kind === 'recording') {
    // AC79: the "Being recorded by the automatic job" fold, open, with that pull request in view.
    boardState.folds.add('recording');
    scrollToRow = rowId(`rec:${d.row.key}`);
    return { hash: '#/waiting', words: OPENED_WORDS, key: t.key };
  }
  if (d.kind === 'cant-read') return { hash: go('p', name), words: CANT_READ_WORDS, key: null };
  const m = boardState.marks.marks[t.key];
  if (m) return { hash: go('waiting', 'card', m.confirmedAt != null ? `${t.key}#${m.step}` : t.key), words: OPENED_WORDS, key: t.key };
  return { hash: name ? go('p', name) : '#/', words: GONE_WORDS, key: null };
}

/** The tap's line, on the screen it opened, until the owner moves on. */
function tapBanner() {
  const b = opening.banner;
  if (!b || b.hash !== location.hash || (nav.route.kind === 'waiting' && nav.route.sheet)) return null; // a sheet's own line says it
  return h('p', { class: `sb-tap ${b.words === GONE_WORDS ? 'gone' : 'opened'}`, role: 'status', key: 'tap-banner' }, b.words);
}
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
    } }, ...kids, ` ${attrs && attrs.class || ''} `.includes(' v2-fold ')
    // AC81: on mockup v2's screens the mark is an inline SVG icon, never ▸ as text (no served file holds it).
    ? vi(open ? 'chevdown' : 'chev')
    : h('span', { class: 'sb-fmark', 'aria-hidden': 'true' }, open ? '▾' : '▸'));
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

// ---------------------------------------------------------------------------
// The project's view model: everything a screen draws, built inside the project's guard (AC30).

function buildProject(desk, project, box, now) {
  const snap = desk.snapshot(project.name);
  const model = box.model;
  const j = project.model === 'v3' ? j11Records(project, snap) : null;
  const tl = j ? timelineOf(j) : null;
  const pv = phaseView(project, tl, snap.tree, j);
  const q = queueView(project, model, snap, now.getTime());
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
function lineBox(id, { words, recCode, title, lead = null, wcls = 'sb-line-w', mark = null, after = () => [], notice = null, lines = 3 }) {
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
    h('div', { class: `sb-lineclip${lines === 2 ? ' two' : ''}${over ? ' over' : ''}`, key: `lineclip:${id}`, 'data-line': id, onscroll: (e, el) => { if (el.scrollTop) el.scrollTop = 0; } }, text),
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
  const el = h('a', { class: `sb-pill ${pillView(box, q, Date.now()).kind}`, href: go('waiting', name), key: `pill:${name}`,
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
  const v = usageView({ cfg: (usageEntry(CONFIG) || {}).cfg, // AC78: J7's actionsUsage, from the entry holding it (draft 9)
    reads: DESK ? DESK.usage : null, nowMs: Date.now(), tz: TZ, whenText });
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

function renderHome(desk, built, seen, now, bd = null) {
  const order = orderBoxes(built.map((b) => b.box));
  // AC48, AC54 (changed by AC80): the count less the cards marked done on this device and the pull
  // requests with the agents; "Quiet" still needs GitHub's word, so a marked card not yet confirmed
  // reads "Nothing waiting on you · confirming with GitHub" in its place.
  const total = built.reduce((n, b) => n + (b.q ? b.q.waiting : b.box.flaggedCount || 0), 0);
  const s0 = screenState(sandboxBoxes(built), desk.signedOut);
  const counted = screenState(built.map((b) => ({ ...b.box, flaggedCount: b.q ? b.q.waiting : b.box.flaggedCount || 0 })), desk.signedOut);
  const s = !s0.quiet && bd && bd.pendingAny && counted.quiet ? { text: WORDS.quietConfirming, quiet: false } : s0;
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
    h('p', { class: `sb-top ${s.quiet ? 'quiet' : total ? 'you' : ''}`, role: 'status', key: 'home-top' },
      desk.signedOut ? SIGNED_OUT_STATE.text : total ? `${total} waiting on you in all` : s.text,
      lastRead ? h('span', { class: 'sb-muted' }, ` · last read ${hhmm(new Date(lastRead), TZ)}`) : null),
    // AC24's way in (from 2026-10-18): one control, "Work ahead", just under Home's top line.
    h('p', { class: 'sb-wa-link', key: 'wa-link' }, h('a', { href: '#/work', key: 'work-ahead' }, `${WA.control} ›`)),
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
    topRow(name, 'status'),
    h('p', { class: 'sb-lead' }, where.sentence),
    lastActionNode(p),
    h('div', { class: 'sb-actions' },
      h('a', { class: `sb-btn ${q.waiting ? 'you' : ''}`, href: go('waiting', name), key: 'status-queue' }, queueWords),
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
  body.push(h('details', { class: 'sb-card sb-more', key: 'more-detail-fold', open: openMore === name ? '' : null }, h('summary', { key: 'more-detail' }, h('span', { class: 'sb-h2 flat' }, 'More detail')),
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
  const out = [h('section', { class: 'sb-screen' }, body)];
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
  return h('section', { class: 'sb-screen sb-detail' }, marker(), projectHeader(name, title), kids);
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
// The bar (AC81) and the board (AC80; desk mockup v2, frames 1, 2 and 12), on mockup v2's tokens
// (sandbox.css's `.v2`). From stage 1a the Queue screen is gone: its address, the project screens'
// "Waiting" link, the Status screen's queue button and today's Home's pill open Waiting with only
// that project shown (AC81, "Until stage 3").

/** A copy button; its "Copied" stays through a redraw (kept per key for this window). */
function copyButton(text, key, label = 'Copy the text', cls = 'sb-btn ghost') {
  const said = copied.get(key);
  return h('button', { type: 'button', class: cls, key: `copy:${key}`, onclick: () => {
    const done = (w) => { copied.set(key, w); render(); };
    try {
      navigator.clipboard.writeText(text).then(() => done('Copied'), () => done('Copy failed: select the text above'));
    } catch {
      done('Copy failed: select the text above');
    }
  } }, said || label);
}
const copied = new Map();
/** F3: a lane's words while nothing is read: never a 0, never "Nothing here". */
const BOARD_UNREAD = Object.freeze({ pending: 'Not read yet', cant: "Can't read" });
/** AC80: a pull request's own checks are not read (the card shows no check line). */
const PR_CHECKS_WORDS = 'Its own checks: not read by the desk; its GitHub page shows them';
const rechecks = new Map(); // AC77: what the re-read before an answer link found, per button, for this window

/** Where a confirmed Done row's sprint is on the Timeline (AC66): a link there, or "sprint: not recorded" in slate. */
function doneLink(p, kind, codeText) {
  const name = p.project.name;
  const fv = p.project.model === 'v3' ? p.feed() : null;
  const at = doneTarget(fv, p.snap, kind, codeText, p.project);
  if (at && at.sprint) return [' ', h('a', { class: 'v2-lnk', href: go('p', name, 'timeline', 'sprint', at.sprint) }, 'On the Timeline')];
  if (at && at.ms) return [' ', h('a', { class: 'v2-lnk', href: go('p', name, 'timeline', 'ms', at.ms) }, 'On the Timeline')];
  if (at && at.job) return h('span', { class: 'v2-small' }, ` · ${JOB_MERGE_WORDS}`);
  if (at && at.estimate) return h('span', { class: 'v2-small' }, ` · ${ESTIMATE_MERGE_WORDS}`);
  return h('span', { class: 'v2-small gap' }, ' · sprint: not recorded');
}

/**
 * Mockup v2's icons (desk-v2.html:385-420), inline SVG in `currentColor`. ◆, ✕, ▸ and ⇅, which no
 * Plex file the desk serves holds, are only ever drawn here, never as text (AC81).
 */
const V2_ICONS = {
  home: { vb: 24, d: ['M4 11l8-6.5 8 6.5V20h-5.5v-5.5h-5V20H4z'] },
  waiting: { vb: 24, d: ['M4 13h4l2 3h4l2-3h4', 'M5 6h14l1 7v5H4v-5z'] },
  plan: { vb: 24, d: ['M9 6h11M9 12h11M9 18h11', 'M4 6h1M4 12h1M4 18h1'] },
  close: { vb: 24, d: ['M6 6l12 12M18 6L6 18'] },
  x: { vb: 16, d: ['M4.5 4.5l7 7M11.5 4.5l-7 7'] },
  pr: { vb: 16, c: [[4, 3.5, 1.6], [4, 12.5, 1.6], [12, 12.5, 1.6]], d: ['M4 5.1v5.8M12 10.9V7a2 2 0 0 0-2-2H7.5M9 3.5L7.5 5 9 6.5'] },
  question: { vb: 16, c: [[8, 8, 6.3]], d: ['M6.2 6.2a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.1v.4'], dot: [8, 11.6, 0.6] },
  card: { vb: 16, d: ['M4 1.8h5.5L12.5 5v9.2H4z', 'M9.5 1.8V5h3', 'M6 8.5h4.5M6 11h3'] },
  missing: { vb: 16, d: ['M4 1.8h5.5L12.5 5v9.2H4z', 'M9.5 1.8V5h3', 'M6.5 8.5l3 3M9.5 8.5l-3 3'] },
  gate: { vb: 16, d: ['M2 3.5h12M3 6h10M4.5 3.5V14M11.5 3.5V14'] },
  deploy: { vb: 16, d: ['M8 13.5V3M4 7l4-4 4 4M3 13.5h10'] },
  hold: { vb: 16, d: ['M5.5 2h5L14 5.5v5L10.5 14h-5L2 10.5v-5z', 'M8 5v3.5M8 10.8v.2'] },
  merge: { vb: 16, c: [[4, 3.5, 1.6], [4, 12.5, 1.6], [12, 8, 1.6]], d: ['M4 5.1v5.8', 'M4 5.1c0 2.4 2.4 2.9 6.4 2.9'] },
  kick: { vb: 16, d: ['M6 4L2.5 7.5 6 11', 'M3 7.5h7a3.5 3.5 0 0 1 0 7H8'] },
  done: { vb: 16, d: ['M3 8.5l3 3 7-7'] },
  lock: { vb: 16, r: [[3.5, 7, 9, 7, 1.5]], d: ['M5.5 7V5a2.5 2.5 0 0 1 5 0v2'] },
  clock: { vb: 16, c: [[8, 8, 6.2]], d: ['M8 4.6V8l2.4 1.6'] },
  agents: { vb: 16, c: [[6, 5.5, 2.3]], d: ['M2 13.5a4 4 0 0 1 8 0M10.5 3.5a2.3 2.3 0 0 1 0 4.4M12 9.6a4 4 0 0 1 2 3.9'] },
  eye: { vb: 16, c: [[8, 8, 2]], d: ['M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z'] },
  proj: { vb: 16, d: ['M2 4.5h4.5l1.3 1.3H14V13H2z'] },
  you: { vb: 16, fill: ['M8 1.8l6.2 6.2L8 14.2 1.8 8z'] },
  chev: { vb: 16, d: ['M6 4l4 4-4 4'] },
  chevdown: { vb: 16, d: ['M4 6l4 4 4-4'] },
  bad: { vb: 16, d: ['M4.5 4.5l7 7M11.5 4.5l-7 7'] },
};
/** One icon: `cls` sizes it (v2-i 20 px for the bar, v2-k 14 px beside a word); hidden from assistive technology, its word beside it. */
function vi(name, cls = 'v2-k') {
  const def = V2_ICONS[name];
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', `0 0 ${def.vb} ${def.vb}`);
  s.setAttribute('class', `${cls} vi-${name}`);
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('focusable', 'false');
  const el = (tag, attrs) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    s.append(n);
  };
  for (const [cx, cy, r] of def.c || []) el('circle', { cx, cy, r });
  for (const [x, y, w, hh, rx] of def.r || []) el('rect', { x, y, width: w, height: hh, rx });
  for (const d of def.d || []) el('path', { d });
  for (const d of def.fill || []) el('path', { d, class: 'fill' });
  if (def.dot) el('circle', { cx: def.dot[0], cy: def.dot[1], r: def.dot[2], class: 'fill' });
  return s;
}

/** The bar (AC81; frames H1, 1, 5 and 11): Home · Waiting · Plan at the foot of every trial-view screen, the current tab named so; Waiting's badge from 1. */
function appBar(current, badge) {
  const tab = (k, label, href) => h('a', { class: 'v2-tab', href, key: `tab:${k}`, 'aria-current': current === k ? 'page' : null },
    vi(k, 'v2-i'), h('span', { class: 'v2-tabw' }, label),
    k === 'waiting' && badge > 0 ? h('span', { class: 'v2-badge', key: 'badge' }, h('span', { 'aria-hidden': 'true' }, String(badge)),
      h('span', { class: 'sb-vh' }, ` ${badge} waiting on you`)) : null);
  return h('nav', { class: 'v2 v2-bar', 'aria-label': 'Main', key: 'app-bar' },
    tab('home', 'Home', '#/'), tab('waiting', 'Waiting', '#/waiting'), tab('plan', 'Plan', '#/work'));
}

/** The project screens' top row until stage 3 (AC81, "Until stage 3"): Status · Timeline · Team · Waiting, the current one named so. */
const TOP_ROW = [['status', 'Status'], ['timeline', 'Timeline'], ['team', 'Team'], ['waiting', 'Waiting']];
function topRow(name, current) {
  return h('nav', { class: 'v2 v2-row', 'aria-label': `${name}: its screens`, key: 'top-row' }, TOP_ROW.map(([k, label]) => h('a', {
    class: 'v2-rl', key: `toprow:${k}`, 'aria-current': k === current ? 'page' : null,
    href: k === 'status' ? go('p', name) : k === 'waiting' ? go('waiting', name) : go('p', name, k),
  }, label)));
}

// --- The board's state on this device: the marks (local storage, wrapped as J5's), and for this
// window the folds, the drafts in the sheets' boxes, each project's last J22 judgement (rule 7) and
// the cards seen to stop needing the owner while the page was open.
const boardState = {
  store: null, marks: noMarks(), kept: true, judged: new Map(), last: new Map(), seen: new Map(), prev: new Map(),
  more: new Set(), folds: new Set(), drafts: new Map(), view: null, cards: new Map(),
  load(store) {
    this.store = store;
    try {
      this.marks = readMarks(store ? store.getJSON(MARKS_KEY, null) : null);
      this.kept = Boolean(store && store.usable);
    } catch {
      this.marks = noMarks();
      this.kept = false;
    }
  },
  save() {
    try {
      if (!this.store || this.store.setJSON(MARKS_KEY, this.marks) === false || !this.store.usable) this.kept = false;
    } catch {
      this.kept = false;
    }
  },
  set(next) {
    this.marks = next;
    this.save();
  },
};

/** A project's read state for the board's quiet lines. */
function readOf(box) {
  const r = (box && box.read) || {};
  return { ok: r.read === 'ok', cantRead: r.read === 'cant-read', since: r.since, words: r.words };
}

/** The queue less what the board does not count (AC48, AC49, AC54, AC55, AC24): the pull requests with the agents and the cards marked done here. */
function countedQueue(q, keep) {
  const has = (r) => keep.has(r.flag ? r.flag.key : r.key);
  const groups = q.groups.map((g) => (g.key === 'verdicts' ? g : { ...g, items: g.items.filter(has), count: g.items.filter(has).length }));
  const rows = q.rows.filter(has);
  const deploys = q.deploysCounted ? q.deploys.filter(has) : q.deploys;
  return { ...q, groups, rows, deploys, waiting: rows.length + (q.deploysCounted ? deploys.length : 0) };
}

/**
 * The board for this drawing (AC80): each project's cards (J22's step for each pull request), the
 * marks judged at each poll in which the project was read successfully (confirming first, then
 * kicking back), the cards seen to stop needing the owner, the reads the marks wait on handed to
 * the reader, and every count less the marked cards. Sets each project's `q` to the counted queue.
 */
function boardOf(built, nowMs, only) {
  const projects = [];
  for (const b of built) {
    const name = b.project.name;
    if (b.error || !b.model) {
      projects.push({ project: b.project, cards: [], agents: [], read: readOf(b.box) });
      continue;
    }
    const j = DESK && DESK.j22 ? DESK.j22(name) : null;
    const rows = [...b.q.rows, ...(b.q.deploysCounted ? b.q.deploys : [])];
    const last = boardState.last.get(name) || new Map();
    const pc = projectCards({ project: b.project, model: b.model, snap: b.snap, j22: j, rows, last, nowMs, tz: TZ, linkCap: CONFIG.linkCap,
      parseRuns: parseWorkflowRuns, projectDoc: b.j ? b.j.projectDoc : null });
    boardState.last.set(name, new Map([...last, ...pc.keep]));
    const current = new Map(pc.cards.map((c) => [c.id, c]));
    const agentIds = new Set(pc.agents.map((a) => a.id));
    const heldIds = new Set((b.model.asking || []).map((a) => waitKey(name, 'question', a.path)));
    // AC79: a pull request the automatic job is recording is still open: it moves to its quiet line, not to Done.
    const recIds = new Set((b.model.beingRecorded || []).filter((r) => r.pr).map((r) => waitKey(name, 'pr', r.pr.number)));
    const st = DESK && DESK.states ? DESK.states.get(name) : null;
    const success = st ? st.lastSuccessAt : null;
    if (!boardState.seen.has(name)) boardState.seen.set(name, []);
    if (success != null && boardState.judged.get(name) !== success && b.box.read && b.box.read.read === 'ok') {
      boardState.judged.set(name, success);
      const ctx = { project: b.project, tree: (b.snap && b.snap.tree) || new Map(), pulls: b.model.pulls || [], files: j ? j.files : null,
        current, agentIds, heldIds, recordingNames: new Set(b.model.recording || []) };
      const next = judgeMarks(boardState.marks, b.project, ctx, nowMs);
      if (JSON.stringify(next) !== JSON.stringify(boardState.marks)) boardState.set(next);
      // A card seen to stop needing the owner while the page was open moves to Done by itself.
      const prev = boardState.prev.get(name);
      if (prev) {
        for (const [id, c] of prev) {
          if (current.has(id) || agentIds.has(id) || heldIds.has(id) || recIds.has(id) || boardState.marks.marks[id]) continue;
          boardState.seen.get(name).push({ id, step: c.step ? c.step.id : 'answer', title: c.title, at: nowMs, kind: c.kind, code: c.number != null ? `#${c.number}` : null });
        }
      }
      boardState.prev.set(name, current);
    }
    // The reads the marks wait on (AC80): a verdict's J20 read of its pull request, and an answer's of every open pull request.
    if (DESK && DESK.setWaited) {
      const waited = new Set();
      for (const m of Object.values(boardState.marks.marks)) {
        if (m.project !== name || m.confirmedAt != null || m.kicked) continue;
        if (m.step === 'verdict' && m.number != null) waited.add(m.number);
        if (m.kind === 'question') for (const pr of b.model.pulls || []) if (canRecord(pr, b.project)) waited.add(pr.number);
      }
      DESK.setWaited(name, [...waited]);
    }
    projects.push({ project: b.project, cards: pc.cards, agents: pc.agents, read: readOf(b.box),
      recording: b.model.beingRecorded || [], asking: (b.model.asking || []).filter((a) => a.state === 'held'),
      answerRecording: (b.model.asking || []).filter((a) => a.state !== 'held'),
      recordRows: recordDone(b.project, b.model, b.snap, b.j, nowMs), seenRows: boardState.seen.get(name) });
  }
  const view = boardView({ projects, marks: boardState.marks, only, nowMs, tz: TZ });
  // Part A item 5 (stage 1a's build review, round 1, F3): before any project is read, or when none can
  // be, an unknown is said in words, never as a 0 or "Nothing here".
  const shown = only ? built.filter((b) => b.project.name === only) : built;
  const readState = (b) => (b.box && b.box.read ? b.box.read.read : null);
  view.unread = shown.some((b) => readState(b) === 'ok') ? null
    : shown.length && shown.every((b) => readState(b) === 'cant-read') ? 'cant' : 'pending';
  boardState.view = view;
  boardState.cards = new Map(projects.flatMap((p) => p.cards.map((c) => [c.id, c])));
  for (const b of built) {
    if (b.error || !b.model) continue;
    b.q0 = b.q;
    b.q = countedQueue(b.q, view.counted.get(b.project.name) || new Set());
    b.agents = (projects.find((p) => p.project.name === b.project.name) || {}).agents || [];
    b.pill = pillView(b.box, b.q, nowMs);
    b.ball = ballLines(b.project, b.model, b.snap, b.j, b.q, new Date(nowMs), TZ);
  }
  return view;
}

/** "checked <age> ago" (AC80; AC82's rule): from the stalest project's last successful read. */
function checkedWords() {
  const states = DESK && DESK.states ? [...DESK.states.values()] : [];
  const times = states.map((s) => s.lastSuccessAt);
  if (!times.length || times.some((x) => x == null)) return 'checking…';
  return `checked ${durationText(Math.max(0, Date.now() - Math.min(...times)))} ago`;
}

const cardRoute = (only, id) => (only ? go('waiting', only, 'card', id) : go('waiting', 'card', id));
const boardRoute = (only) => (only ? go('waiting', only) : '#/waiting');

/** Mark a card done (a drop on Done, or "Done ✓"): it leaves every count at once on this device. */
function markCard(card) {
  boardState.set(markDone(boardState.marks, card, Date.now()));
  render();
}

// --- Dragging a card into Done (AC80: a press and hold with a finger, or a mouse drag; a finger
// that moves before the hold is a scroll, a tap is never a drag). The keyboard and screen readers
// mark with the sheet's "Done ✓".
const drag = { card: null, el: null, x: 0, y: 0, pointer: null, timer: null, lifted: false, swallow: false };
function dragReset() {
  if (drag.timer != null) clearTimeout(drag.timer);
  if (drag.el && drag.el.setAttribute) {
    drag.el.setAttribute('class', String(drag.el.getAttribute('class') || '').replace(/\s*\blifted\b/g, ''));
    if (drag.el.style) drag.el.style.transform = '';
  }
  Object.assign(drag, { card: null, el: null, pointer: null, timer: null, lifted: false });
}
function lift() {
  drag.timer = null;
  if (!drag.el) return;
  drag.lifted = true;
  drag.el.setAttribute('class', `${drag.el.getAttribute('class') || ''} lifted`);
}
/** Whether a point is over the Done lane, with an 8 px margin round it. */
function overDone(x, y) {
  const view = document.getElementById('view');
  const lane = view ? findKey(view, 'lane:done') : null;
  if (!lane || !lane.getBoundingClientRect) return false;
  const r = lane.getBoundingClientRect();
  return x >= r.left - LANE_MARGIN_PX && x <= r.right + LANE_MARGIN_PX && y >= r.top - LANE_MARGIN_PX && y <= r.bottom + LANE_MARGIN_PX;
}
function onDragDown(card, e, el) {
  const t0 = e && e.target;
  for (let n = t0; n && n !== el; n = n.parentNode) {
    const tag = String(n.tagName || '').toLowerCase();
    if ((tag === 'a' || tag === 'button') && !(n.getAttribute && n.getAttribute('data-cardlink') != null)) return; // the card's own buttons stay buttons
  }
  dragReset();
  Object.assign(drag, { card, el, x: e.clientX || 0, y: e.clientY || 0, pointer: e.pointerType || 'touch' });
  if (drag.pointer !== 'mouse') drag.timer = setTimeout(lift, HOLD_MS);
}
function onDragMove(e) {
  if (!drag.card || !e) return;
  const dx = (e.clientX || 0) - drag.x;
  const dy = (e.clientY || 0) - drag.y;
  const dist = Math.hypot(dx, dy);
  if (!drag.lifted) {
    if (drag.pointer === 'mouse' && dist >= MOUSE_DRAG_PX) lift();
    else if (drag.pointer !== 'mouse' && dist > FINGER_SLOP_PX) dragReset(); // a scroll, never a drag
    if (!drag.lifted) return;
  }
  if (e.preventDefault) e.preventDefault();
  if (drag.el && drag.el.style) drag.el.style.transform = `translate(${Math.round(dx)}px, ${Math.round(dy)}px)`;
}
function onDragUp(e) {
  if (!drag.card) return;
  const { card, lifted } = drag;
  const x = e && e.clientX != null ? e.clientX : drag.x;
  const y = e && e.clientY != null ? e.clientY : drag.y;
  dragReset();
  if (!lifted) return;
  drag.swallow = true; // the click that ends a drag opens no sheet
  if (overDone(x, y)) markCard(card);
  else render();
}

// --- Drawing

const laneOf = (key) => LANES.find((l) => l.key === key);

/** A card's kind line: its icon (vermilion while it waits on the owner, grey in Done) and its word, never ranked (AC38). */
function kindLine(card, lane) {
  const icon = lane === 'kick' ? 'kick' : card.kind;
  return h('span', { class: `v2-kd${lane === 'done' ? ' done' : ''}` }, vi(icon), h('span', {}, lane === 'kick' ? 'Kicked back' : card.kindWord));
}

/** An answer button (AC80): its filled-in file in one tap, AC77's re-read first when the project was read more than 30 s ago. */
function answerLink(p, card, btn, cls, kids) {
  const key = `${card.id}:${btn.value || ''}`;
  const plan = btn.plan || { url: btn.href, copy: null };
  const guard = card.kind === 'question' ? { target: { kind: 'question', name: card.flag.question.name }, answerPath: `decisions/questions/${card.flag.question.name}.md` }
    : card.flag && card.flag.card ? { target: { kind: 'card', path: card.flag.card.path }, answerPath: card.flag.card.answerPath } : null;
  const said = rechecks.get(key);
  const a = h('a', { class: cls, key: `ans:${key}`, href: plan.url, rel: 'noopener noreferrer', target: '_blank', 'aria-label': btn.aria || null,
    onclick: (e) => {
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
          // the text stays in the sheet's fold, to select by hand
        }
      }
    } }, kids);
  const out = [a];
  if (said) {
    out.push(h('span', { class: 'v2-recheck', role: 'status', key: `recheck:${key}` }, said.words,
      said.pr ? [' ', ext(said.pr.url, `PR #${said.pr.number}, which records it`, 'v2-lnk')] : null,
      said.anyway ? [' ', h('a', { class: 'v2-lnk', href: said.anyway, rel: 'noopener noreferrer', target: '_blank', key: `anyway:${key}` }, said.again || RECHECK_WORDS.anyway)] : null));
  }
  return out;
}

/** A card's step button, as it shows on the card (AC80's step table). */
function stepButton(p, card, lane) {
  const s = card.step;
  if (!s) return null;
  if (s.opensSheet) return h('a', { class: 'v2-step', href: cardRoute(boardState.view && boardState.view.only, card.id), key: `step:${card.id}`, onclick: () => { nav.opener = `card:${card.id}`; } }, s.label);
  if (!s.href) return h('span', { class: 'v2-step off' }, `${s.label.replace(/ ↗$/, '')}: no link`);
  return ext(s.href, s.label, 'v2-step');
}

function cardNode(p, card, lane, only) {
  if (card.kind === 'gate' && lane !== 'done') {
    return h('li', { class: `v2-card gate${lane === 'kick' ? ' kick' : ''}`, key: `card:${card.id}`, 'data-card': card.id,
      onpointerdown: (e, el) => onDragDown(card, e, el) },
    kindLine(card, lane),
    h('a', { class: 'v2-t', href: cardRoute(only, card.id), 'data-cardlink': '', key: `cardlink:${card.id}`, onclick: (e) => cardTap(card, e) }, card.title),
    h('span', { class: 'v2-gl' }, h('span', { class: 'v2-gk' }, 'Critic:'), ` ${card.critic}`),
    h('span', { class: 'v2-gl' }, h('span', { class: 'v2-gk' }, 'User rep:'), ` ${card.userRep}`),
    h('span', { class: 'v2-m', live: () => metaText(card, Date.now()) }),
    lane === 'kick' && card.kicked ? h('span', { class: 'v2-why' }, card.kicked.reason) : null,
    h('span', { class: 'v2-gatebtns' }, card.buttons.map((b) => answerLink(p, card, b, 'v2-step', [b.label]))));
  }
  return h('li', { class: `v2-card${lane === 'kick' ? ' kick' : ''}`, key: `card:${card.id}`, 'data-card': card.id,
    onpointerdown: (e, el) => onDragDown(card, e, el) },
  kindLine(card, lane),
  h('a', { class: 'v2-t', href: cardRoute(only, card.id), 'data-cardlink': '', key: `cardlink:${card.id}`, onclick: (e) => cardTap(card, e) }, card.title),
  h('span', { class: 'v2-m', live: () => metaText(card, Date.now()) }),
  card.mark ? h('span', { class: 'v2-mk' }, vi(card.mark.icon), h('span', {}, card.mark.words)) : null,
  lane === 'kick' && card.kicked ? h('span', { class: 'v2-why' }, card.kicked.reason) : null,
  card.note ? h('span', { class: 'v2-why' }, card.note) : null,
  card.changes ? h('span', { class: 'v2-why' }, 'You asked for changes') : null,
  // No check line on a pull request's card: no read gives its own checks (AC80, settled after round 1).
  stepButton(p, card, lane));
}

/** A tap on a card outside its button opens its sheet; the click that ends a drag opens nothing. */
function cardTap(card, e) {
  if (drag.swallow) {
    drag.swallow = false;
    if (e && e.preventDefault) e.preventDefault();
    return;
  }
  nav.opener = `cardlink:${card.id}`;
}

/** A row in Done: a pending mark is a card ("Confirming with GitHub", its step's button and "Undo"); a confirmed one a ✓, its title and time. */
function doneNode(p, r, only) {
  if (r.pending) {
    return h('li', { class: 'v2-card conf', key: `done:${r.id}` },
      h('span', { class: 'v2-kd done' }, vi('clock'), h('span', {}, WORDS.confirming)),
      h('a', { class: 'v2-t', href: cardRoute(only, r.id), key: `donelink:${r.id}`, onclick: () => { nav.opener = `donelink:${r.id}`; } }, r.title),
      h('span', { class: 'v2-m', live: () => `moved ${boardAge(Date.now() - r.at)} ago` }),
      h('span', { class: 'v2-steps' }, r.card ? stepButton(p, r.card, 'done') : null,
        h('button', { type: 'button', class: 'v2-undo', key: `undo:${r.id}`, onclick: () => { boardState.set(undoMark(boardState.marks, r.id)); render(); } }, 'Undo')));
  }
  return h('li', { class: 'v2-drow', key: `done:${r.id}#${r.step || ''}` }, vi('done', 'v2-k ok'),
    h('a', { class: 'v2-dt', href: cardRoute(only, `${r.id}#${r.step || ''}`), key: `drowlink:${r.id}#${r.step || ''}`,
      onclick: () => { nav.opener = `drowlink:${r.id}#${r.step || ''}`; } }, r.title),
    // Its small line (its code, as frame 1's "#135 · 12:28"), then its time; the ✓ is the row's mark.
    h('span', { class: 'v2-m' }, r.code ? h('span', { class: 'v2-dc' }, r.code) : null, r.code ? ' · ' : null, doneTime(r.at, Date.now(), TZ)));
}

function laneNode(bd, built, laneKey, only) {
  const l = bd.lanes.find((x) => x.key === laneKey);
  const pOf = (name) => built.find((b) => b.project.name === name);
  const groups = l.groups.map((g) => {
    const p = pOf(g.project);
    const head = only ? null : h('button', { type: 'button', class: 'v2-grp', key: `grp:${laneKey}:${g.project}`, 'aria-label': `Show only ${g.project}`,
      onclick: () => nav.to(go('waiting', g.project)) }, vi('proj'), h('span', { class: 'v2-gn' }, g.project), h('span', { class: 'v2-gc' }, String(laneKey === 'done' ? g.all.length : g.rows.length)));
    if (laneKey === 'done') {
      const open = boardState.more.has(g.project);
      const rows = open ? g.all : g.rows;
      return [head, h('ol', { class: 'v2-list', key: `list:${laneKey}:${g.project}` }, rows.map((r) => doneNode(p, r, only))),
        g.more > 0 ? h('button', { type: 'button', class: 'v2-more', key: `more:${g.project}`, 'aria-expanded': open ? 'true' : 'false',
          onclick: () => { if (open) boardState.more.delete(g.project); else boardState.more.add(g.project); render(); } }, open ? 'Fewer' : `${g.more} more`, vi(open ? 'chevdown' : 'chev')) : null];
    }
    return [head, h('ol', { class: 'v2-list', key: `list:${laneKey}:${g.project}` }, g.rows.map((c) => cardNode(p, c, laneKey, only)))];
  });
  const unknown = bd.unread && laneKey !== 'done' && !groups.length;
  return h('section', { class: `v2-lane lane-${laneKey}`, key: `lane:${laneKey}`, 'data-lane': laneKey, 'aria-label': l.title },
    h('h2', { class: 'v2-lh' }, h('span', {}, l.title), laneKey === 'done' || unknown ? null : h('span', { class: 'v2-lc' }, String(l.count))),
    groups.length ? groups : h('p', { class: `v2-empty${unknown ? ' unknown' : ''}` },
      unknown ? (bd.unread === 'cant' ? BOARD_UNREAD.cant : BOARD_UNREAD.pending) : laneKey === 'done' ? WORDS.emptyDone : WORDS.empty));
}

/** A quiet line (AC80): shown only when it has any; a tap opens its fold. */
function quietLine(k, icon, words, n, fold) {
  const open = boardState.folds.has(k);
  return [h('button', { type: 'button', class: 'v2-ql', key: `ql:${k}`, 'aria-expanded': open ? 'true' : 'false',
    onclick: () => { if (open) boardState.folds.delete(k); else boardState.folds.add(k); render(); } },
  vi(icon), h('span', {}, `${words}: `, h('b', {}, String(n))), vi(open ? 'chevdown' : 'chev')),
  open ? h('div', { class: 'v2-qfold', key: `fold:${k}`, role: 'region', 'aria-label': words }, fold()) : null];
}

function quietLines(bd, built, only) {
  const q = bd.quiet;
  const lines = [];
  const pOf = (name) => built.find((b) => b.project.name === name);
  const agentsFold = () => h('ul', { class: 'v2-flist' }, q.agents.map((a) => h('li', { key: `agent:${a.id}` },
    ext(a.link, a.title, 'v2-ft'), h('span', { class: 'v2-m' }, `#${a.number}`), a.waits.map((w) => h('span', { class: 'v2-fw' }, w)))));
  const recFold = () => h('ul', { class: 'v2-flist' }, q.recording.map((r) => h('li', { key: `rec:${r.key}`, id: rowId(`rec:${r.key}`) },
    ext(r.link, r.pr.title, 'v2-ft'), h('span', { class: 'v2-m' }, `#${r.pr.number}`), h('span', { class: 'v2-fw' }, r.recordingWords),
    r.answerWords ? h('span', { class: 'v2-fw' }, r.answerWords) : null)));
  const askFold = () => h('ul', { class: 'v2-flist' }, q.asking.map((a) => {
    const proj = built.find((b) => b.model && (b.model.asking || []).includes(a));
    const pname = proj ? proj.project.name : null;
    return h('li', { key: `asking:${a.name}` }, h('span', { class: 'v2-fw strong' }, a.words), h('span', { class: 'v2-ft' }, a.title), h('span', { class: 'v2-m' }, a.name),
      a.parsed ? h('details', { class: 'v2-fd', key: `asking-text:${a.name}` }, h('summary', {}, 'The question and its options, to read'),
        h('article', { class: 'sb-record', html: renderMarkdown(a.parsed.text || '') })) : null,
      h('button', { type: 'button', class: 'v2-step', key: `answer-here:${a.name}`, onclick: () => { if (DESK && pname) DESK.answerHere(pname, a.name); } }, 'Answer it here instead'));
  }));
  const ansFold = () => h('ul', { class: 'v2-flist' }, q.answerRecording.map((a) => h('li', { key: `ansrec:${a.name}` },
    h('span', { class: 'v2-fw strong' }, a.words), h('span', { class: 'v2-ft' }, a.title), a.pr ? ext(a.pr.url, `PR #${a.pr.number}`, 'v2-lnk') : null)));
  if (only) {
    // Filtered (frame 2): the two counts in one small line under the lanes, "With the agents: <n> ·
    // Being recorded by the automatic job: <n>", each count's words a control opening its fold below.
    const small = (k, words, n) => {
      const open = boardState.folds.has(k);
      return h('button', { type: 'button', class: 'v2-qs', key: `ql:${k}`, 'aria-expanded': open ? 'true' : 'false',
        onclick: () => { if (open) boardState.folds.delete(k); else boardState.folds.add(k); render(); } }, `${words}: ${n}`);
    };
    if (bd.unread) {
      // The project not read yet, or not readable: no count for an unknown (Part A item 5; stage 1a's
      // build review, round 2, N1 and F3-r2), the words only, with no fold to open.
      const w = bd.unread === 'cant' ? BOARD_UNREAD.cant.toLowerCase() : BOARD_UNREAD.pending.toLowerCase();
      lines.push(h('p', { class: 'v2-small v2-qsmall unknown', key: 'qsmall' }, `${WORDS.agents}: ${w} · ${WORDS.recording}: ${w}`));
      return h('div', { class: 'v2-quiet under', key: 'quiet' }, lines);
    }
    lines.push(h('p', { class: 'v2-small v2-qsmall', key: 'qsmall' },
      small('agents', WORDS.agents, q.agents.length), ' · ', small('recording', WORDS.recording, q.recording.length)));
    if (boardState.folds.has('agents')) lines.push(h('div', { class: 'v2-qfold', key: 'fold:agents', role: 'region', 'aria-label': WORDS.agents }, agentsFold()));
    if (boardState.folds.has('recording')) lines.push(h('div', { class: 'v2-qfold', key: 'fold:recording', role: 'region', 'aria-label': WORDS.recording }, recFold()));
  } else {
    if (q.agents.length) lines.push(quietLine('agents', 'agents', WORDS.agents, q.agents.length, agentsFold));
    if (bd.nothingWaiting.length) lines.push(h('p', { class: 'v2-ql still', key: 'ql:nothing' }, vi('eye'), h('span', {}, `${WORDS.nothing}: ${bd.nothingWaiting.join(', ')}`)));
    for (const c of bd.cantRead) lines.push(h('p', { class: 'v2-ql still bad', key: `ql:cant:${c.project}` }, vi('bad'), h('span', {}, `Can't read ${c.project} since ${hhmm(new Date(c.since), TZ)}`)));
    if (q.recording.length) lines.push(quietLine('recording', 'eye', WORDS.recording, q.recording.length, recFold));
  }
  if (q.asking.length) lines.push(quietLine('asking', 'clock', WORDS.asking, q.asking.length, askFold));
  if (q.answerRecording.length) lines.push(quietLine('answerRecording', 'clock', WORDS.answerRecording, q.answerRecording.length, ansFold));
  return lines.length ? h('div', { class: `v2-quiet${only ? ' under' : ''}`, key: 'quiet' }, lines) : null;
}

/** The Waiting tab (AC80, frames 1 and 2): the title, "checked <age> ago", the quiet lines, the lanes; a card's sheet over it. */
function renderWaiting(bd, built, only, sheetId) {
  const name = only && built.some((b) => b.project.name === only) ? only : null;
  const body = [marker(),
    h('header', { class: 'v2-top' }, h('h1', { class: 'v2-title' }, 'Waiting')),
    h('p', { class: 'v2-sub', live: checkedWords })];
  if (name) {
    body.push(h('div', { class: 'v2-filter', key: 'filter' }, h('span', { class: 'v2-chip' }, vi('proj'), h('span', {}, name),
      h('button', { type: 'button', class: 'v2-x', key: 'chip-x', 'aria-label': 'Show all projects', onclick: () => nav.replace('#/waiting') }, vi('x'))),
    h('span', { class: 'v2-small' }, `1 of ${bd.of} project${bd.of === 1 ? '' : 's'}`)));
  } else body.push(quietLines(bd, built, null));
  body.push(h('div', { class: 'v2-lanes', key: 'lanes' }, LANES.map((l) => laneNode(bd, built, l.key, name))));
  if (name) body.push(quietLines(bd, built, name));
  body.push(h('p', { class: 'v2-small v2-device', key: 'device' }, boardState.kept ? WORDS.device : WORDS.notKept));
  const out = [h('section', { class: 'sb-screen v2 v2-board', key: 'board' }, body)];
  if (sheetId != null) out.push(cardSheet(bd, built, name, sheetId));
  return out;
}

// --- The card's sheet (AC80; AC52's contents and, from 2026-10-20, the words box; stage 4 gives it
// AC85's layout). It rises from the bottom, closes on its 44 px close, a tap outside or Escape, and
// focus goes back to the card.

/** The card each open sheet's address was drawn for (AC56: a sheet whose card leaves stays open and says so). */
const sheetCards = new Map();
/** A Done row's sheet, as it was when it opened (AC56). */
const heldDone = new Map();

function sheetShell(back, title, parts, key) {
  return [h('a', { class: 'v2-scrim', key: 'v2-scrim', href: back, 'aria-label': 'Close', tabindex: '-1', onclick: (e) => { if (e && e.preventDefault) e.preventDefault(); nav.to(back); } }),
    h('div', { class: 'v2 v2-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title, key },
      h('span', { class: 'v2-grab', 'aria-hidden': 'true' }), parts)];
}
function sheetHead(meta, title, back) {
  return h('div', { class: 'v2-shead' }, h('div', { class: 'v2-blk' }, meta ? h('p', { class: 'v2-mono', live: typeof meta === 'function' ? meta : null }, typeof meta === 'function' ? null : meta) : null,
    h('h2', { class: 'v2-stitle' }, title)),
  h('button', { type: 'button', class: 'v2-x44', key: 'sheet-close', 'aria-label': 'Close', onclick: () => nav.to(back) }, vi('close', 'v2-i')));
}
const blk = (head, ...kids) => h('div', { class: 'v2-blk' }, h('h3', { class: 'v2-bh' }, head), kids);

/** The owner's own words for a sheet (AC80, AC85): a 16 px box, kept per card for this window through every refresh (AC56). */
function wordsBox(id, label, n = 1) {
  const k = `${id}#${n}`;
  const ta = h('textarea', { rows: '3', key: `words:${k}`, class: 'v2-input', 'aria-label': label, placeholder: 'Optional',
    oninput: (e, self) => { boardState.drafts.set(k, self.value); render(); } });
  ta.value = boardState.drafts.get(k) || '';
  return h('label', { class: 'v2-field', key: `field:${k}` }, h('span', { class: 'v2-label' }, label), ta);
}
const draftOf = (id, n = 1) => boardState.drafts.get(`${id}#${n}`) || '';

function cardSheet(bd, built, only, sheetId) {
  const back = boardRoute(only);
  const [cardIdRaw, stepPart] = String(sheetId).split('#');
  // The card's AC73 key, or (from a Queue address kept from before stage 1a) the model's own key for it.
  const byKey = [...boardState.cards.values()].find((c) => c.key === cardIdRaw && (!only || c.project === only)) || null;
  const card = boardState.cards.get(cardIdRaw) || byKey;
  const cardId = card ? card.id : cardIdRaw;
  const mark = boardState.marks.marks[cardId] || null;
  const fromTap = opening.banner && opening.banner.hash === location.hash ? h('p', { class: 'v2-tap', role: 'status', key: 'tap-banner' }, opening.banner.words) : null;
  if (stepPart != null && !card) {
    // A confirmed Done row's small sheet: its whole title, AC52's ruled words, "On the Timeline" where AC66 gives one.
    const fresh = bd.lanes.find((l) => l.key === 'done').groups.flatMap((g) => g.all).find((x) => x.id === cardId && (x.step || '') === stepPart) || null;
    // AC56 (AC55's hold, for a Done row's sheet): while it is open a refresh leaves it as it was; when
    // its row changes or leaves Done, it says so, and closed and opened again it shows the latest.
    const sig = (x) => (x ? `${x.title}|${doneTime(x.at, Date.now(), TZ)}` : null);
    let held = heldDone.get(String(sheetId)) || null;
    if (!held && fresh) {
      held = { row: fresh, sig: sig(fresh), when: doneTime(fresh.at, Date.now(), TZ) };
      heldDone.set(String(sheetId), held);
    }
    if (!held) return sheetShell(back, 'Done', [sheetHead(null, 'This is no longer in Done', back), h('p', { class: 'v2-acts', key: 'acts' }, h('button', { type: 'button', class: 'v2-abtn ghost', key: 'sheet-close2', onclick: () => nav.to(back) }, 'Close'))], `sheet:${sheetId}`);
    const r = held.row;
    const notice = sig(fresh) !== held.sig ? HELD_NOTICE : null;
    const p = built.find((b) => b.project.name === (r.mark ? r.mark.project : String(r.id).split('|')[0]));
    return sheetShell(back, r.title, [sheetHead(`${p ? p.project.name : ''} · done ${held.when}`, r.title, back), fromTap,
      r.code ? h('p', { class: 'v2-small' }, r.link ? ext(r.link, r.code, 'v2-lnk') : r.code, p ? doneLink(p, r.kind === 'ruling' ? 'ruling' : r.kind === 'pr' ? 'pr' : 'card', r.kind === 'pr' ? `PR ${r.code}` : r.code) : null) : null,
      notice ? h('p', { class: 'v2-tap', role: 'status', key: 'held-notice' }, notice) : null,
      h('p', { class: 'v2-acts', key: 'acts' }, h('button', { type: 'button', class: 'v2-abtn ghost', key: 'sheet-close2', onclick: () => nav.to(back) }, 'Close'))], `sheet:${sheetId}`);
  }
  if (!card) {
    // AC56: when what an open sheet is about stops waiting, the sheet stays open and says so until the
    // owner closes it; what the owner typed stays.
    const was = sheetCards.get(String(sheetId)) || null;
    const id = was ? was.id : cardId;
    const typed = [...boardState.drafts.keys()].filter((k) => k.startsWith(`${id}#`) && boardState.drafts.get(k));
    const inDone = bd.lanes.find((l) => l.key === 'done').groups.some((g) => g.all.some((x) => x.id === id));
    // AC79: a pull request the automatic job is recording no longer waits on the owner, but it has not
    // gone: the sheet says so, with its link only, never "That no longer waits on you".
    const rec = bd.quiet.recording.find((r) => r.pr && built.some((b) => waitKey(b.project.name, 'pr', r.pr.number) === id
      && (b.model.beingRecorded || []).includes(r)));
    if (rec) {
      return sheetShell(back, rec.pr.title, [sheetHead(null, rec.pr.title, back), fromTap,
        h('p', { class: 'v2-mark', role: 'status', key: 'rec-notice' }, vi('eye'), h('span', {}, rec.recordingWords)),
        rec.answerWords ? h('p', { class: 'v2-body' }, rec.answerWords) : null,
        h('p', { class: 'v2-small' }, ext(rec.link, `PR #${rec.pr.number} ↗`, 'v2-lnk')),
        typed.map((k) => wordsBox(id, 'Your own words, if you want them in the answer', Number(k.split('#')[1]) || 1)),
        h('p', { class: 'v2-acts', key: 'acts' }, h('button', { type: 'button', class: 'v2-abtn ghost', key: 'sheet-close2', onclick: () => nav.to(back) }, 'Close'))], `sheet:${sheetId}`);
    }
    return sheetShell(back, was ? was.title : 'No longer waiting', [sheetHead(null, was ? was.title : GONE_WORDS, back), fromTap,
      h('p', { class: 'v2-mark', role: 'status', key: 'left-notice' }, vi('done'), h('span', {}, GONE_WORDS, inDone ? ': it is in Done.' : '.')),
      // AC77: what the re-read before an answer found (an answer already on GitHub, or one being recorded) stays said.
      [...rechecks.entries()].filter(([k]) => k.startsWith(`${id}:`)).map(([k, said]) => h('p', { class: 'v2-recheck', role: 'status', key: `recheck:${k}` }, said.words,
        said.pr ? [' ', ext(said.pr.url, `PR #${said.pr.number}, which records it`, 'v2-lnk')] : null)),
      h('p', { class: 'v2-body' }, 'It is no longer on the board: answered, merged, withdrawn, or not read yet.'),
      typed.map((k) => wordsBox(id, 'Your own words, if you want them in the answer', Number(k.split('#')[1]) || 1)),
      h('p', { class: 'v2-acts', key: 'acts' }, h('button', { type: 'button', class: 'v2-abtn ghost', key: 'sheet-close2', onclick: () => nav.to(back) }, 'Close'))], `sheet:${sheetId}`);
  }
  sheetCards.set(String(sheetId), { id: card.id, title: card.title });
  const p = built.find((b) => b.project.name === card.project);
  const project = p.project;
  const row = (p.q0 || p.q).rows.find((x) => x.flag && x.flag.key === card.key) || (p.q0 || p.q).deploys.find((x) => x.flag && x.flag.key === card.key)
    || { key: card.key, text: card.title, code: null, wait: null, flag: card.flag, raisedAt: card.raisedAt };
  const v = sheetView(project, p.model, p.snap, p.j, row);
  const pending = mark && mark.confirmedAt == null && !mark.kicked;
  const kicked = mark && mark.confirmedAt == null && mark.kicked ? mark.kicked : null;
  const lane = pending ? 'done' : kicked ? 'kick' : 'wait';
  const k2 = card.step && card.step.twoStep ? ` · step ${card.step.twoStep} of 2` : '';
  const headMeta = () => [project.name, card.kindWord.toLowerCase(), card.kind === 'question' ? card.name : card.number != null ? `#${card.number}` : null,
    card.raisedAt != null ? `waiting ${boardAge(Date.now() - card.raisedAt)}` : 'wait not recorded'].filter(Boolean).join(' · ');
  const parts = [sheetHead(headMeta, card.title, back), fromTap,
    h('p', { class: 'v2-small' }, `${lane === 'kick' ? 'Kicked back' : pending ? WORDS.confirming : card.kindWord}${k2}`),
    kicked ? h('p', { class: 'v2-mark' }, vi('kick'), h('span', {}, kicked.reason)) : null,
    card.note ? h('p', { class: 'v2-mark' }, vi('done'), h('span', {}, card.note)) : null];
  // What it is, why it's here, what was checked (AC52), each from its record.
  parts.push(blk('What it is', h('p', { class: 'v2-body' }, v.what || card.title, ' ', v.code ? h('span', { class: 'v2-mono' }, v.code) : null)));
  // A card's question, from its "## 1." section (AC53).
  if ((card.kind === 'card' || card.kind === 'gate') && v.question) parts.push(blk('The question', h('p', { class: 'v2-lead', key: 'card-q' }, v.question)));
  if (card.kind === 'deploy') {
    const dr = deployRows(project, p.snap).find((x) => x.run && card.deploy && x.run.runNumber === card.deploy.runNumber && x.run.path === card.deploy.path);
    parts.push(blk('Why it is here', h('p', { class: 'v2-body' }, card.flag.words || NOT_RECORDED)));
    // AC72's row words, word for word (AC72, changed by AC80): the run, linked, with its code; then
    // whether its commit is a reviewed pull request's merge, a mark beside the words (AC42), and the
    // sources or the reason. The approval itself stays on GitHub (the card's "Approve ↗").
    const check = dr ? dr.check : null;
    parts.push(h('div', { class: `v2-blk v2-safe${check ? ` ${check.kind}` : ''}`, key: `safe:${card.key}` },
      h('p', { class: 'v2-bh' }, 'Whether it matches a reviewed pull request'),
      h('p', { class: 'v2-body v2-deploy-l' }, row.link ? ext(row.link, row.text, 'v2-lnk') : row.text, row.code ? [' ', h('span', { class: 'v2-mono' }, row.code)] : null),
      check ? [h('p', { class: 'v2-mark v2-safe-l' }, vi(check.kind === 'ok' ? 'done' : check.kind === 'bad' ? 'x' : 'clock'), h('span', {}, check.words)),
        check.sources ? h('p', { class: 'v2-small' }, check.sources.map((x, i) => [i ? ' · ' : '', x.href ? ext(x.href, x.words, 'v2-lnk') : x.words]))
          : h('p', { class: 'v2-small' }, check.reason)] : null));
  } else {
    // AC77 and AC79: an answer record's pull request names the answer it records; one the automatic job
    // left says so.
    const f = card.flag || {};
    parts.push(blk('Why it is here', h('p', { class: 'v2-body' }, v.why || NOT_RECORDED),
      f.leftWords ? h('p', { class: 'v2-mark', key: 'left-words' }, vi('kick'), h('span', {}, f.leftWords)) : null,
      f.answerWords ? h('p', { class: 'v2-body', key: 'answer-words' }, f.answerWords) : null));
  }
  parts.push(blk('What was checked', h('p', { class: 'v2-body' }, v.checked),
    // AC80 (settled after stage 1a's build review, round 1): no read gives a pull request's own checks,
    // so its card has no check line, and its sheet says so, never letting a missing line pass for passing.
    card.kind === 'pr' ? h('p', { class: 'v2-small', key: 'own-checks' }, PR_CHECKS_WORDS) : null));
  // AC66: the milestone it unblocks, its why, and the facts behind the ask one tap away.
  if (project.model === 'v3' && ['question', 'card', 'gate', 'pr'].includes(card.kind)) {
    const u = unblocksOf(p.ctx, row);
    const ck = `ctx:${card.key}`;
    const open = isOpenFold(project.name, ck, false);
    parts.push(h('div', { class: 'v2-blk', key: `unb:${card.key}` },
      u.none ? h('p', { class: 'v2-body v2-unb-l' }, `Unblocks no milestone: ${u.none}`)
        : u.missing ? h('p', { class: 'v2-body v2-unb-l gap' }, 'Unblocks: milestone not recorded')
          : u.milestones.map((m) => [h('p', { class: 'v2-body v2-unb-l' }, h('span', { class: 'v2-label' }, 'Unblocks'), ' ', m.name ? h('b', {}, m.name) : null, ' ', h('span', { class: 'v2-mono' }, m.code),
            u.byPr ? h('span', { class: 'v2-small' }, ' · named by its pull request, not yet in the plan') : null),
          m.why ? h('p', { class: 'v2-quote v2-wl' }, h('span', { class: 'v2-label' }, 'Why'), ' ', h('span', {}, m.why.text), h('span', { class: 'v2-src' }, m.why.source))
            : h('p', { class: 'v2-small v2-wl gap' }, 'Why not recorded yet · for the agents to add')]),
      foldButton(project.name, ck, false, { class: 'v2-fold' }, 'Context · the facts behind this ask'),
      open ? (u.context ? h('ul', { class: 'v2-facts', key: `facts:${card.key}` }, u.context.map((c) => h('li', {}, c.fact, c.exception ? null : h('span', { class: 'v2-src' }, c.source || 'source not recorded'))))
        : h('p', { class: 'v2-small gap', key: `facts:${card.key}` }, 'Context: not recorded')) : null));
  }
  if (v.gate) {
    parts.push(blk('The case opens', h('p', { class: 'v2-quote' }, v.gate.opening),
      h('p', { class: 'v2-small' }, ext(v.gate.caseLink, 'Read the whole case ↗', 'v2-lnk') || 'The case: no file recorded', ' · ',
        ext(v.gate.criticLink, "The Critic's view ↗", 'v2-lnk') || "The Critic's view: no file recorded"),
      h('p', { class: 'v2-small' }, `User representative: ${v.gate.userRep}`)));
  }
  if (v.noAnswer) parts.push(blk('What you do', h('p', { class: 'v2-body' }, v.noAnswer)));
  // The why line (AC80), and GitHub's owner check whenever J22 has read it.
  if (card.kind === 'pr') {
    if (card.why) parts.push(h('p', { class: 'v2-body', key: 'why-line' }, card.why));
    if (card.check != null) parts.push(h('p', { class: 'v2-small', key: 'owner-check' }, `GitHub's owner check: ${card.check}`));
  }
  if (card.kind === 'question' || card.kind === 'card' || card.kind === 'gate') {
    const rec = v.recommendation;
    parts.push(h('p', { class: 'v2-body', key: 'rec-line' }, rec ? [h('span', { class: 'v2-rec' }, 'Recommended'), ' ', rec] : 'No recommendation given'));
  }
  // The buttons, in full: one per option, each opening a fully filled-in file (the box's words in it).
  if (card.kind === 'question' && !card.v25) {
    const p0 = card.flag.question.parsed;
    const qs = p0 ? questionQuestions(p0.text, p0.title) : null;
    if (qs && qs.form === 'numbered') {
      const words = Object.fromEntries(qs.questions.map((x) => [x.n, draftOf(card.id, x.n)]));
      parts.push(h('div', { class: 'v2-opts', key: 'numbered' }, qs.questions.map((x) => h('div', { class: 'v2-opt', key: `q:${x.n}` },
        h('div', { class: 'v2-ot' }, h('span', { class: 'v2-ol' }, `${x.n}. ${x.text}`), x.recommendation ? h('span', { class: 'v2-od' }, [h('span', { class: 'v2-rec' }, 'Recommended'), ' ', x.recommendation]) : null),
        wordsBox(card.id, `Your answer to ${x.n}`, x.n)))));
      const btn = answerButtons(project, card.flag, CONFIG.linkCap, words)[0];
      parts.push(h('p', { class: 'v2-steps' }, answerLink(p, card, btn, 'v2-abtn', [btn.label])));
    } else {
      const btns = answerButtons(project, card.flag, CONFIG.linkCap, draftOf(card.id));
      if (qs && qs.form === 'fallback') parts.push(h('p', { class: 'v2-small' }, `${CANT_SPLIT} (${qs.why}).`));
      parts.push(h('div', { class: 'v2-opts', key: 'opts', role: 'list' }, btns.map((b) => h('div', { class: 'v2-opt', role: 'listitem', key: `opt:${b.value || 'one'}` },
        // P-001-answer-choice-spacing: the letter its own element, set apart from its words by a real space.
        h('div', { class: 'v2-ot' }, b.value ? h('span', { class: 'v2-ol' }, h('b', { class: 'v2-letter' }, `${b.value}.`), ' ', h('span', { class: 'v2-ow' }, b.words || ''))
          : h('span', { class: 'v2-ol' }, 'Your ruling, in your own words'),
          b.recommended ? h('span', { class: 'v2-rec' }, 'Recommended') : null),
        answerLink(p, card, b, 'v2-abtn', [b.label])))));
      parts.push(wordsBox(card.id, 'Your own words, if you want them in the answer'));
    }
  } else if (card.kind === 'question' && card.v25) {
    const p0 = card.flag.question.parsed;
    const letters = p0 ? p0.options.map((o) => o.letter) : [];
    parts.push(h('p', { class: 'v2-small' }, V25_RULING_NOTE));
    parts.push(h('div', { class: 'v2-opts', key: 'opts' }, (letters.length ? letters : ['']).map((l) => {
      const text = composeAnswer({ kind: 'question', name: card.name, qs: { form: 'lettered', title: card.title, block: optionsBlock(p0 ? p0.text : '').lines, questions: [] } },
        { 1: { choice: l, words: draftOf(card.id) } }).text;
      return h('div', { class: 'v2-opt', key: `opt:${l}` }, h('div', { class: 'v2-ot' }, h('span', { class: 'v2-ol' }, l ? `${l}. ${(p0.options.find((o) => o.letter === l) || {}).text || ''}` : 'Your ruling')),
        copyButton(text, `v25:${card.id}:${l}`, l ? `Copy answer ${l}` : 'Copy the answer', 'v2-abtn'));
    })));
    parts.push(wordsBox(card.id, 'Your own words, if you want them in the answer'));
  } else if (card.kind === 'card' || card.kind === 'gate') {
    const gate = card.kind === 'gate';
    const btns = answerButtons(project, card.flag, CONFIG.linkCap, draftOf(card.id));
    parts.push(h('div', { class: 'v2-opts', key: 'opts', role: 'list' }, btns.map((b) => {
      const then = (v.options || []).find((o) => o.value === b.value);
      return h('div', { class: 'v2-opt', role: 'listitem', key: `opt:${b.value}` },
        h('div', { class: 'v2-ot' }, h('span', { class: 'v2-ol' }, gate ? b.label : b.value), h('span', { class: 'v2-od' }, then ? then.then : NOT_RECORDED),
          b.recommended ? h('span', { class: 'v2-rec' }, 'Recommended') : null),
        answerLink(p, card, b, 'v2-abtn', [gate ? `${b.label} ↗` : b.label]));
    })));
    parts.push(wordsBox(card.id, gate ? 'Your reason (it goes on the Reason: line for Hold and Recycle)' : 'Your own words, if you want them in the answer'));
  } else {
    const s = card.step;
    const btns = [];
    if (s && s.href) btns.push(ext(s.href, s.sheetLabel ? `${s.sheetLabel} ↗` : s.label, 'v2-abtn'));
    if (s && s.verdict && s.verdict.href) btns.push(ext(s.verdict.href, s.verdict.label, 'v2-abtn'));
    if (s && s.plan && s.plan.copy) btns.push(copyButton(s.plan.copy, `verdict:${card.id}`, 'Copy the verdict', 'v2-abtn'));
    if (s && s.verdict && s.verdict.plan && s.verdict.plan.copy) btns.push(copyButton(s.verdict.plan.copy, `verdict2:${card.id}`, 'Copy the verdict', 'v2-abtn'));
    parts.push(h('p', { class: 'v2-steps', key: 'step-btns' }, btns));
  }
  if (v.links && v.links.length) parts.push(h('p', { class: 'v2-small', key: 'links' }, v.links.map((l, i) => [i ? ' · ' : '', ext(l.href, l.text, 'v2-lnk') || `${l.text}: no file recorded`])));
  if (v.fullText) parts.push(h('details', { class: 'v2-fd', key: 'full-text' }, h('summary', {}, 'The whole record'), h('article', { class: 'sb-record', html: renderMarkdown(v.fullText) })));
  // "Done ✓" from Waiting on you or Kicked back; "Undo" while it is confirming; then "Close".
  const acts = [];
  if (!pending) {
    acts.push(h('button', { type: 'button', class: 'v2-abtn done', key: 'sheet-done', onclick: () => { markCard(card); nav.to(back); } }, 'Done ✓'));
  } else acts.push(h('button', { type: 'button', class: 'v2-abtn', key: 'sheet-undo', onclick: () => { boardState.set(undoMark(boardState.marks, card.id)); render(); } }, 'Undo'));
  acts.push(h('button', { type: 'button', class: 'v2-abtn ghost', key: 'sheet-close2', onclick: () => nav.to(back) }, 'Close'));
  parts.push(h('p', { class: 'v2-acts', key: 'acts' }, acts));
  return sheetShell(back, card.title, parts, `sheet:${sheetId}`);
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
  const body = [marker(), projectHeader(name, 'Timeline'), markerNode(p, 'timeline'), topRow(name, 'timeline')];
  if (!fv.ok) {
    body.push(h('section', { class: 'sb-card' }, h('p', {}, fv.words)));
    return h('section', { class: 'sb-screen' }, body);
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
  return h('section', { class: 'sb-screen' }, body);
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
  // Work ahead's notes (AC24; J4, J14, J15) go to the planning project's, as J14 says.
  if (p.project.planning === true && p.project.model === 'v3') {
    try {
      const v = workView(Date.now());
      if (v) out.push(...v.notes);
    } catch {
      // Work ahead's own screen says what went wrong
    }
  }
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
  const body = [marker(), projectHeader(name, 'Team'), markerNode(p, 'team'), topRow(name, 'team')];
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
  return h('section', { class: 'sb-screen' }, body);
}

function renderMember(p, tv, id, sub, idx, now) {
  const name = p.project.name;
  const page = memberPage(p.project, p.model, p.snap, p.j, p.q, tv, id, now, TZ);
  if (!page) return h('section', { class: 'sb-screen' }, marker(), projectHeader(name, 'Team'), h('p', {}, 'No such member.'));
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
  const out = [h('section', { class: 'sb-screen' }, body)];
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
// Work ahead (AC24; J4, J14, J15; M3A, from 2026-10-18): the connected v3 projects' milestones not
// yet reached, in the owner's order, each with its state, the Chief of Staff's latest rough estimate
// and a rough finish; the owner's draft order kept on the device; "Record plan" as a J3-form link.

let lastBuilt = null; // the projects as the current drawing built them
let waDay = null; // the owner's today when Work ahead was last drawn
let waMemo = null; // Work ahead's view, worked out once per drawing

/**
 * The owner's draft order, kept on the device under `desk-plan-draft-v1` (AC24), every read and write
 * wrapped as J5's are: a failure shows "draft not kept on this device", the draft then living in
 * memory for the open window, and nothing else breaks.
 */
const planDraft = {
  mem: undefined, // undefined: not read yet; null: none
  failed: false,
  aside: false, // a newer plan landed and the draft was set aside: said until the next move
  moved: null, // the key of the row last moved (its gold edge, "moved"), until the next move
  focus: null, // the control to give the focus back to after a move
  read() {
    if (this.mem !== undefined) return this.mem;
    this.mem = null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      this.mem = raw == null ? null : readDraft(JSON.parse(raw));
    } catch {
      this.failed = true;
    }
    return this.mem;
  },
  write(v) {
    this.mem = v;
    try {
      if (v) localStorage.setItem(DRAFT_KEY, JSON.stringify(v));
      else localStorage.removeItem(DRAFT_KEY);
    } catch {
      this.failed = true;
    }
  },
};

/** Work ahead's view for this drawing (shared by its screen and the planning project's record notes). */
function workView(nowMs) {
  if (waMemo) return waMemo;
  const built = lastBuilt || [];
  const entries = built.map((b) => ({ project: b.project, j: b.j || null, ctx: b.ctx || null, rows: b.q ? b.q.rows : [], model: b.model || null,
    error: b.error || null }));
  const snaps = new Map(built.filter((b) => b.snap).map((b) => [b.project.name, b.snap]));
  waMemo = workAheadView({ config: CONFIG, entries, snaps, nowMs, tz: TZ, draft: planDraft.read() });
  return waMemo;
}

/** Move a row one place up (-1) or down (+1) in the draft (AC24): every finish follows at once. */
function moveRow(key, dir) {
  const v = workView(Date.now());
  const i = v.order.indexOf(key);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= v.order.length) return;
  const order = [...v.order];
  [order[i], order[j]] = [order[j], order[i]];
  const same = order.join('\n') === v.baseOrder.join('\n');
  planDraft.write(same ? null : { base: v.plan.name || null, order });
  planDraft.aside = false;
  planDraft.moved = key;
  planDraft.focus = `wa-${dir < 0 ? 'up' : 'down'}:${key}`;
  render();
}

/** A move control (AC24): a real button, used by a tap, a click, or Enter or Space; at an end it says it is disabled and does nothing, keeping the focus. */
function moveButton(r, dir) {
  const off = dir < 0 ? r.first : r.last;
  const words = dir < 0 ? WA.moveUp(r.code) : WA.moveDown(r.code);
  const act = () => { if (!off) moveRow(r.key, dir); };
  return h('button', { type: 'button', class: 'sb-wa-mv', key: `wa-${dir < 0 ? 'up' : 'down'}:${r.key}`, 'aria-label': words, 'aria-disabled': off ? 'true' : null,
    onclick: act,
    onkeydown: (e) => {
      if (!e || (e.key !== 'Enter' && e.key !== ' ')) return;
      if (e.preventDefault) e.preventDefault();
      act();
    } }, h('span', { 'aria-hidden': 'true' }, dir < 0 ? '▲' : '▼'));
}

/** One milestone's row (AC24, as the mockup draws it, version 2). */
function waRow(v, r) {
  const moved = planDraft.moved === r.key;
  const est = r.estimate;
  const kids = [
    h('p', { class: 'sb-wa-name' }, r.name),
    h('p', { class: 'sb-wa-meta' }, code(r.code), v.many ? h('span', { class: 'sb-wa-proj' }, r.project.name) : null,
      r.phase ? h('span', { class: `sb-wa-ph ${r.phaseClass || ''}` }, r.phase) : null,
      h('span', { class: 'sb-wa-st' }, mk(r.state.mark), r.state.words)),
    r.notInPlan ? h('p', { class: 'sb-wa-tag' }, WA.notInPlan) : null,
    r.done ? h('p', { class: 'sb-wa-done' }, `Done when ${r.done}`) : null,
    h('p', { class: `sb-wa-est ${est.kind}` }, est.kind === 'missing' || est.kind === 'na'
      ? est.words : [h('span', { class: 'sb-wa-k' }, WA.estimateKey), ' ', h('span', {}, est.words)]),
    est.note ? h('div', { class: 'sb-wa-note' }, lineBox(`wa-note:${r.key}`, { words: est.note, recCode: `${r.code}'s estimate note`, title: 'Estimate note', lines: 2 })) : null,
    est.newer ? h('p', { class: 'sb-wa-newer' }, WA.newerUnreadable) : null,
    r.finish ? h('p', { class: `sb-wa-fin${r.finish.na ? ' na' : ''}` }, `${WA.finish}: `, h('b', {}, r.finish.words)) : null,
    r.waiting ? h('p', { class: 'sb-wa-you' }, h('a', { href: go('waiting', r.project.name), key: `wa-q:${r.key}` },
      `${r.waiting} waiting on you in your Queue`)) : null,
  ];
  return h('li', { class: `sb-wa-row${r.phaseClass ? ` ${r.phaseClass}` : ''}${moved ? ' moved' : ''}`, key: `wa-row:${r.key}` },
    h('span', { class: 'sb-wa-ord' }, h('span', { 'aria-hidden': 'true' }, r.place), h('span', { class: 'sb-vh' }, `${r.placeWords}${moved ? ', moved' : ''}`)),
    h('div', { class: 'sb-wa-body' }, kids),
    h('div', { class: 'sb-wa-move' }, moveButton(r, -1), moveButton(r, 1)));
}

/** "Record plan" (AC24, J4): the J3-form link holding every row in the order shown, or why there is none. */
function recordNode(v) {
  if (!v.record.ok) {
    return [h('button', { type: 'button', class: 'sb-btn sb-wa-rec', key: 'wa-record', disabled: true }, WA.record),
      h('p', { class: 'sb-muted small sb-wa-why' }, v.record.words)];
  }
  const link = v.record.link;
  const a = h('a', { class: 'sb-btn sb-wa-rec', key: 'wa-record', href: link.url, rel: 'noopener noreferrer', target: '_blank', onclick: () => {
    if (!link.copy) return;
    try {
      navigator.clipboard.writeText(link.copy).catch(() => {});
    } catch {
      // the copy button below still holds it
    }
  } }, WA.record);
  return [a];
}

/** AC17's fallback, seen (J3, J15): why the link opens with the file name only, the text, and a "Copy" button. */
function copyFallback(words, text, key, label) {
  return h('div', { class: 'sb-wa-copy', key: `wa-copy:${key}` }, h('p', { class: 'sb-muted small' }, words),
    h('pre', { class: 'sb-value' }, text), copyButton(text, key, label));
}

/** "Not milestones yet" (AC24, J15). */
function laterNode(v) {
  const kids = [h('h2', { class: 'sb-h2' }, WA.notYet), h('p', { class: 'sb-muted small' }, WA.notYetLine)];
  if (v.later.kind === 'none') kids.push(h('p', { class: 'sb-muted' }, WA.noLaterWork));
  else if (v.later.kind === 'na') kids.push(h('p', { class: 'sb-muted' }, `Later work: ${WA.notAvailable}`));
  else {
    if (!v.later.rows.length && !v.later.notAdded.length) kids.push(h('p', { class: 'sb-muted' }, WA.noLaterWork));
    kids.push(h('ul', { class: 'sb-wa-later' }, v.later.rows.map((x) => {
      let act;
      if (x.state === 'tap') {
        act = h('a', { class: 'sb-wa-ask', key: `wa-ask:${x.item.w}`, href: x.ask.link.url, rel: 'noopener noreferrer', target: '_blank', onclick: () => {
          if (!x.ask.link.copy) return;
          try {
            navigator.clipboard.writeText(x.ask.link.copy).catch(() => {});
          } catch {
            // the text is short; AC17's fallback is the copy button
          }
        } }, x.words);
        if (x.ask.link.copy) act = [act, copyFallback(x.ask.copyWords, x.ask.link.copy, `wa-ask:${x.item.w}`, 'Copy the ask')];
      } else if (x.state === 'question') act = h('a', { class: 'sb-wa-ask', key: `wa-q:${x.item.w}`, href: go('waiting', v.planner) }, x.words);
      else if (x.state === 'answered' && x.line1 != null) {
        act = h('div', { class: 'sb-wa-ans' }, lineBox(`wa-ans:${x.item.w}`, { words: x.line1, recCode: x.answerPath.replace(/^decisions\/questions\/|\.md$/g, ''), title: 'Answered',
          lead: x.words.slice(0, x.words.length - x.line1.length) }));
      } else act = h('p', { class: 'sb-muted small' }, x.words);
      return h('li', { class: 'sb-wa-mini', key: `wa-later:${x.item.w}` }, h('p', {}, h('span', { class: 'sb-wa-t' }, x.item.name), ' ', h('span', { class: 'sb-muted small' }, x.item.note)), act);
    })));
    if (v.later.notAdded.length) {
      const fk = 'wa-notadded';
      kids.push(foldButton(WA_FOLDS, fk, false, { class: 'sb-more sb-wa-fold' }, `${WA.notAdded} · ${v.later.notAdded.length}`));
      if (isOpenFold(WA_FOLDS, fk, false)) {
        kids.push(h('ul', { class: 'sb-wa-later', key: 'wa-notadded-l' }, v.later.notAdded.map((x) => h('li', { class: 'sb-wa-mini' },
          h('p', {}, h('span', { class: 'sb-wa-t' }, x.name), ' ', h('span', { class: 'sb-muted small' }, x.note))))));
      }
    }
  }
  return h('section', { class: 'sb-wa-group', key: 'wa-later' }, kids);
}
const WA_FOLDS = '#work'; // the folds' keeper for this screen (AC56: kept through every refresh)

/** "Reached · <m>" and "Dropped · <n>" (AC24): folded, opening on a tap. */
function foldList(key, words, list, extra) {
  const open = isOpenFold(WA_FOLDS, key, false);
  return h('section', { class: 'sb-wa-group', key: `wa-g:${key}` }, foldButton(WA_FOLDS, key, false, { class: 'sb-more sb-wa-fold' }, words),
    open ? h('ul', { class: 'sb-wa-later', key: `wa-l:${key}` }, list.map((x) => h('li', { class: `sb-wa-mini ${key}` },
      h('p', {}, h('span', { class: 'sb-wa-t' }, x.name), ' ', code(x.code), extra(x))))) : null);
}

function renderWorkAhead(built, nowMs) {
  const v = workView(nowMs);
  if (v.setAside) {
    planDraft.write(null);
    planDraft.aside = v.setAside === 'notice'; // the owner's own plan landing clears the draft silently (C)
    planDraft.moved = null;
    waMemo = null;
    return renderWorkAhead(built, nowMs);
  }
  if (v.ready && !v.changed && planDraft.read()) planDraft.write(null); // moved back to the order it started from
  waDay = v.today;
  const body = [marker(), projectHeader(v.header.eyebrow, v.header.title, v.header.sub)];
  body.push(h('p', { class: `sb-wa-state ${v.stateLine.kind}`, key: 'wa-state' }, v.stateLine.lead ? [h('b', {}, v.stateLine.lead), ' '] : null, h('span', {}, v.stateLine.rest)));
  if (planDraft.aside) body.push(h('p', { class: 'sb-wa-notice', role: 'status', key: 'wa-aside' }, WA.setAside));
  if (planDraft.failed) body.push(h('p', { class: 'sb-muted small', key: 'wa-nokeep' }, WA.draftNotKept));
  body.push(h('section', { class: 'sb-wa-card', key: 'wa-card' }, h('p', { class: 'sb-wa-k' }, WA.cardTitle), h('p', { class: 'sb-wa-big' }, v.card),
    h('p', { class: 'sb-muted small' }, WA.cardNote)));
  if (v.orderLine) body.push(h('p', { class: 'sb-muted small sb-wa-order', key: 'wa-order' }, v.orderLine));
  for (const name of v.unread) body.push(h('p', { class: 'sb-muted small' }, `${name}: its milestones are ${NOT_AVAILABLE}`));
  body.push(v.rows.length ? h('ol', { class: 'sb-wa-plan', key: 'wa-plan', 'aria-label': 'Milestones in your order' }, v.rows.map((r) => waRow(v, r)))
    : h('p', { class: 'sb-muted' }, 'No milestones to go'));
  body.push(laterNode(v));
  if (v.reached.length) body.push(foldList('reached', `${WA.reached} · ${v.reached.length}`, v.reached, (x) => [' ', h('span', { class: 'sb-muted small' }, x.date)]));
  if (v.dropped.length) body.push(foldList('dropped', `${WA.dropped} · ${v.dropped.length}`, v.dropped, () => null));
  for (const o of v.older) {
    const b = built.find((x) => x.project === o.project);
    const href = o.path && b && b.snap ? treeLink(o.project, b.snap.tree, o.path) : null;
    body.push(h('section', { class: 'sb-wa-group', key: `wa-old:${o.project.name}` }, h('h2', { class: 'sb-h2' }, o.project.name),
      h('p', {}, href ? ext(href, o.words) : o.words), h('p', { class: 'sb-muted small' }, WA.olderPipeline)));
  }
  if (v.notes.length && v.planner) {
    body.push(h('p', { class: 'small' }, h('a', { href: go('p', v.planner, 'notes'), key: 'wa-notes' }, `Record notes (${v.notes.length})`)));
  }
  body.push(h('div', { class: 'sb-wa-bar', key: 'wa-bar' }, h('p', { class: 'sb-muted small', role: 'status' }, v.changed ? WA.changed : WA.noChanges), recordNode(v)));
  // AC17's fallback for the plan, under the bar rather than in it, so the sticky bar stays one line high.
  if (v.record.ok && v.record.link.copy) body.push(copyFallback(v.record.copyWords, v.record.link.copy, 'wa-record', 'Copy the plan'));
  return h('section', { class: 'sb-screen sb-wa' }, body);
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
  // AC24 (from 2026-10-18): Work ahead, across projects, a screen of its own: from stage 1a the Plan tab (AC81).
  if (r0 === 'work') return { key: 'work', screen: '#/work', kind: 'work', name: null, sheet: null };
  // AC80, AC81: Waiting, `waiting` or, with only one project shown, `waiting/<name>`; a card's sheet
  // over it at `…/card/<id>` (a sheet is not a screen: it adds nothing to the history).
  if (r0 === 'waiting') {
    const parts = [name, kind, ...rest].filter((x) => x != null);
    let only = null;
    let i = 0;
    if (parts[0] != null && parts[0] !== 'card') {
      only = parts[0];
      i = 1;
    }
    const sheet = parts[i] === 'card' && parts.length > i + 1 ? parts.slice(i + 1).join('/') : null;
    const screen = only ? go('waiting', only) : '#/waiting';
    return { key: only ? `waiting/${only}` : 'waiting', screen, kind: 'waiting', name: null, only, sheet };
  }
  if (r0 !== 'p' || !name) return { key: 'home', screen: '#/', kind: 'home', name: null, sheet: null };
  const base = { name, sheet: null };
  // From stage 1a the Queue screen is gone (AC81, "Until stage 3"): its address opens Waiting with only
  // the project shown, and `queue/<key>` that card's sheet over it (nav replaces the history entry).
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

/** Set the address without a history entry of its own. */
function replaceHash(to) {
  try {
    if (typeof location.replace === 'function') location.replace(to);
    else location.hash = to;
  } catch {
    location.hash = to;
  }
}

/**
 * The address a route opens in its place, or null (AC68: a v3 project's Pipeline is its Timeline at
 * Now; AC81, "Until stage 3": the Queue's `p/<name>/queue` is `waiting/<name>`, and its
 * `p/<name>/queue/<key>` that card's sheet over it).
 */
function redirectOf(r) {
  const proj = r.name ? CONFIG.projects.find((x) => x.name === r.name) : null;
  if (r.kind === 'pipeline' && proj && proj.model === 'v3') return go('p', r.name, 'timeline');
  if (r.kind === 'queue') return r.sheet ? go('waiting', r.name, 'card', r.sheet) : go('waiting', r.name);
  return null;
}

const nav = {
  route: parseRoute(''),
  history: [], // [{ key, hash }]: the screens, oldest first
  opener: null, // the key of the control that last opened a sheet
  sheetOpener: null,
  focusNext: null,
  lastHash: null,
  backing: false,
  replacing: false,
  canBack() { return this.history.length > 1; },
  /** Go to a hash now (setting location.hash also fires hashchange later; the same hash is ignored). */
  to(hash) {
    location.hash = hash;
    this.changed();
  },
  /** Go to a hash in place of the current screen's history entry (the filter chip's ✕, AC81). */
  replace(hash) {
    this.replacing = true;
    replaceHash(hash);
    this.changed();
    this.replacing = false;
  },
  back() {
    if (this.history.length < 2) return;
    this.history.pop();
    this.backing = true;
    this.to(this.history[this.history.length - 1].hash);
  },
  start() {
    const to = redirectOf(parseRoute(location.hash));
    if (to) replaceHash(to);
    this.route = parseRoute(location.hash);
    this.lastHash = location.hash;
    this.history = [{ key: this.route.key, hash: this.route.screen }];
    this.scrollTo = this.route.kind === 'timeline' ? this.route.at : null;
    if (this.scrollTo && this.scrollTo.sprint) this.openSprint = { name: this.route.name, sprint: this.scrollTo.sprint };
  },
  changed() {
    if (location.hash === this.lastHash) return;
    let next = parseRoute(location.hash);
    // AC68: a v3 project's Pipeline route opens the Timeline at Now in its place, and from stage 1a
    // (AC81) the Queue's address opens Waiting with only that project shown, replacing the history
    // entry rather than adding one, so "Back" never returns to it.
    const to = redirectOf(next);
    if (to) {
      replaceHash(to);
      next = parseRoute(to);
    }
    this.lastHash = location.hash;
    const prev = this.route;
    this.route = next;
    const top = this.history[this.history.length - 1];
    if (this.backing) this.backing = false;
    else if (this.replacing && top) this.history[this.history.length - 1] = { key: next.key, hash: next.screen };
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
    const dock = findClass(view, 'v2-bar'); // AC81: the bar at every screen's foot
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

/** The boxes as the trial view counts them: a pull request with the agents is not flagged (Terms; AC80, J22's rule 0). */
function sandboxBoxes(built) {
  return built.map((b) => ({ ...b.box, flaggedCount: Math.max(0, (b.box.flaggedCount || 0) - (b.agents ? b.agents.length : 0)) }));
}
/** Whether a sheet's address names a card, a mark or a Done row on the board. */
function sheetFound(sheetId, only) {
  const [id, step] = String(sheetId).split('#');
  if (boardState.cards.has(id) || boardState.marks.marks[id]) return true;
  if ([...boardState.cards.values()].some((c) => c.key === id && (!only || c.project === only))) return true;
  const v = boardState.view;
  return Boolean(step != null && v && v.lanes.find((l) => l.key === 'done').groups.some((g) => g.all.some((x) => x.id === id && (x.step || '') === step)));
}
/** Whether the project a sheet's address is for has been read (or can't be), so a missing card truly waits no longer. */
function settledFor(built, sheetId, only) {
  const name = only || String(sheetId).split('|')[0];
  const b = built.find((x) => x.project.name === name);
  const list = b ? [b] : built;
  return list.every((x) => x.box && x.box.read && (x.box.read.read === 'ok' || x.box.read.read === 'cant-read'));
}

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
  // AC80: the Done marks, in a store of their own, so a failure there shows "Done marks not kept on
  // this device" and nothing else breaks.
  boardState.load(createStore());
  // J12: the pull requests are kept under their own key in a store of their own, so a write that
  // fails there (the device's storage full) turns off only that key, never the blob cache.
  const pullsStore = createStore();
  // AC80: the waited reads' 5 a head, kept across openings under desk-board-waits-v1.
  const waitsStore = createStore();
  const desk = createDesk({ config: CONFIG, call, clock, store, pullsStore, waitsStore, isVisible, onChange: () => render(), j11: true });
  DESK = desk;
  ns.store = store;
  ns.looked = false;
  // AC74: `?sandbox&open=<key>`: followed once its project is read; the address keeps `?sandbox` only.
  Object.assign(opening, { target: openTarget(location.search), done: false, banner: null });
  if (!opening.target) opening.done = true;
  try {
    if (opening.target && typeof history !== 'undefined' && history.replaceState) history.replaceState(null, '', sandboxAddress(location.pathname, '', location.hash));
  } catch {
    // the address keeps its ?open=; a reload follows it again
  }
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
    waMemo = null;
    const built = lastBuilt = CONFIG.projects.map((project) => {
      const box = safeBox(project.name, () => desk.model(project.name), desk.states.get(project.name), desk, now.getTime());
      if (box.drawError) return { project, box, error: new Error(box.drawError.replace(/^Can't show this project: /, '')) };
      try {
        return buildProject(desk, project, box, now);
      } catch (err) {
        box.drawError = `Can't show this project: ${errorText(err)}`;
        return { project, box, error: err };
      }
    });
    // AC80: the board, its marks judged at each successful poll; every count less the marked cards.
    const bd = boardOf(built, now.getTime(), nav.route.kind === 'waiting' ? nav.route.only : null);
    // AC74: a notification's tap, once its project is read: going there draws that screen (nav.to renders).
    const tap = followOpening(desk, built);
    if (tap) {
      opening.banner = tap.words ? { hash: tap.hash, words: tap.words, key: tap.key } : null;
      if (location.hash !== tap.hash) {
        nav.to(tap.hash);
        return;
      }
    }
    // In the trial view a pull request with the agents is not flagged (Terms, from stage 1a): Quiet leaves it out.
    const s = screenState(sandboxBoxes(built), desk.signedOut);
    if (stateEl) stateEl.textContent = desk.signedOut ? SIGNED_OUT_STATE.text : s.text;
    document.title = `Sandbox — ${desk.signedOut ? SIGNED_OUT_STATE.text : s.text}`;
    const r = nav.route;
    let node;
    if (r.kind === 'waiting') {
      // A sheet's address for a key no card on the board has (it waits no longer): Waiting, with no sheet.
      if (r.sheet != null && !sheetCards.has(String(r.sheet)) && !sheetFound(r.sheet, r.only) && settledFor(built, r.sheet, r.only)) {
        nav.replace(r.screen);
        return;
      }
      for (const k of [...heldDone.keys()]) if (k !== String(r.sheet)) heldDone.delete(k);
      for (const k of [...sheetCards.keys()]) if (k !== String(r.sheet)) sheetCards.delete(k);
      try {
        node = renderWaiting(bd, built, r.only, r.sheet);
      } catch (err) {
        node = h('section', { class: 'sb-screen' }, marker(), h('p', { class: 'sb-stale' }, `Can't show Waiting: ${errorText(err)}`));
      }
    } else if (r.name) {
      const name = r.name;
      const b = built.find((x) => x.project.name === name);
      if (!b) node = h('section', { class: 'sb-screen' }, marker(), h('p', {}, 'No such project. ', h('a', { href: '#/' }, 'Home')));
      else if (b.error) {
        node = h('section', { class: 'sb-screen' }, marker(), projectHeader(name, 'Current status'),
          h('p', { class: 'sb-stale' }, b.box.drawError || `Can't show this project: ${errorText(b.error)}`));
      } else {
        try {
          if (r.kind === 'timeline') {
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
    } else if (r.kind === 'work') {
      try {
        node = renderWorkAhead(built, now.getTime());
      } catch (err) {
        node = h('section', { class: 'sb-screen' }, marker(), projectHeader(WA.eyebrow, WA.title), h('p', { class: 'sb-stale' }, `Can't show Work ahead: ${errorText(err)}`));
      }
    } else node = renderHome(desk, built, seen, now.getTime(), bd);
    // AC81: the bar Home · Waiting · Plan, the only bar at the foot of every trial-view screen; a
    // project's screens count as Home's.
    try {
      // The Waiting screen is drawn on mockup v2's ground (sandbox.css, html.v2-page).
      document.documentElement.classList.toggle('v2-page', r.kind === 'waiting');
    } catch {
      // the screen still draws, on the page's ground
    }
    show([tapBanner(), node, appBar(r.kind === 'waiting' ? 'waiting' : r.kind === 'work' ? 'plan' : 'home', bd.badge)]);
    // AC24: after a move, focus stays on the control used.
    if (planDraft.focus) {
      const k = planDraft.focus;
      planDraft.focus = null;
      focusKey(k);
    }
    // AC78: a cost tap opens that project's More detail at the line (a fold already drawn keeps its
    // state through the morph, so it is opened here), and brings the line into view.
    if (openMore && r.name === openMore) {
      const fold = findKey(view, 'more-detail-fold');
      if (fold && fold.setAttribute) fold.setAttribute('open', '');
      let line = null;
      eachElement(view, (e) => { if (!line && e.getAttribute && e.getAttribute('id') === 'actions-usage') line = e; });
      if (line && line.getBoundingClientRect && typeof window.scrollTo === 'function') {
        window.scrollTo(0, Math.max(0, Math.round((window.scrollY || 0) + line.getBoundingClientRect().top - 8)));
      }
      if (fold) openMore = null;
    }
    if (scrollToRow) {
      let row = null;
      eachElement(view, (e) => { if (!row && e.getAttribute && e.getAttribute('id') === scrollToRow) row = e; });
      if (row) {
        scrollToRow = null;
        if (row.getBoundingClientRect && typeof window.scrollTo === 'function') {
          window.scrollTo(0, Math.max(0, Math.round((window.scrollY || 0) + row.getBoundingClientRect().top - 8)));
        }
      }
    }
  }
  window.addEventListener('hashchange', () => nav.changed());
  // AC74, AC77: a tap reaching this window already open (sw.js hands the sandbox its address): the
  // closed read runs again before the item shows, and a cost tap reads the usage again (AC78). The
  // reply tells the service worker the page took it, so it need not navigate.
  try {
    const sw = typeof navigator !== 'undefined' ? navigator.serviceWorker : null;
    if (sw && typeof sw.addEventListener === 'function') {
      sw.addEventListener('message', (e) => {
        const d = e && e.data;
        if (!d || d.kind !== 'desk-open' || typeof d.navigate !== 'string') return;
        const q = /\?[^#]*/.exec(d.navigate);
        const target = openTarget(q ? q[0] : '');
        Object.assign(opening, { target, done: !target, banner: null });
        desk.arrival();
        if (target && target.kind === 'usage') desk.refreshUsage();
        try {
          if (e.ports && e.ports[0]) e.ports[0].postMessage({ ok: true });
        } catch {
          // the service worker then navigates the window instead
        }
        render();
      });
    }
  } catch {
    // no service worker here: a tap then loads the page afresh
  }
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
  // AC80: dragging a card into Done (a press and hold with a finger, or a mouse drag).
  document.addEventListener('pointermove', onDragMove);
  document.addEventListener('pointerup', onDragUp);
  document.addEventListener('pointercancel', () => dragReset());
  try {
    // Once a card is lifted (AC80), the one finger holding it moves it rather than scrolling the page;
    // a touch of two fingers or more is never cancelled, so pinch-to-zoom always works (AC63).
    document.addEventListener('touchmove', (e) => {
      if (drag.lifted && e && e.touches && e.touches.length === 1 && e.cancelable && e.preventDefault) e.preventDefault();
    }, { passive: false });
  } catch {
    // no touch events here
  }
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
  setInterval(() => {
    if (!isVisible()) return;
    tick(view);
    // Work ahead's today moves at ownerTimeZone's midnight, on this tick (AC24, step 1): every finish is redrawn.
    if (nav.route.kind === 'work' && waDay && todayOf(Date.now(), TZ) !== waDay) render();
  }, 15_000);
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
