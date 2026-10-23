// The desk (spec S-001): mockup v2 as built, the owner's pick (decisions/questions/P-001-desk-v2-pick.md, A),
// at `/` from stage 8 (AC44, step 4), where it was the trial view at `?sandbox` until then (AC43 B; stages
// 1a to 7). Home, Waiting and Plan, each project's page, Timeline and Team, and their sheets, against the
// desk's live data; app.js starts it.
//
// - It reuses the page's one poll scheduler and its data (AC14, AC42): J11's records are optional
//   blob reads through the same calls.
// - It answers cards and questions through J3's links, and nothing else.
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
import { createSeen, MARKERS_OFF } from './lib/seen.js';
import {
  NOT_RECORDED, NOT_AVAILABLE, V25_NOT_RECORDED, OWNER_NEXT_LINES,
  j11Records, timelineOf, phaseView, whereLine, queueView, pillView, ballLines, sheetView, treeLink, youWaitText, optionsBlock, waitWords,
} from './lib/sandbox.js';
import { teamView, memberPage, workingNow, summarySheet, cosWorkingNow, cosPieceOf, cosPieceWords } from './lib/sandbox.js';
import { summaryView, HOME_GROUPS, HOME_GROUPS_KEY, homeGroupOf, groupHeaderWords, lastAction } from './lib/sandbox.js';
import { HOME_WORDS, briefingView, projectEvents, sinceView, lineTime, tileTimeline, sprintStrip, nowLine, atWorkLine, nextLine, tileWaits, unreadLines, WHY_BACK_ONCE, nowOwnPart } from './lib/home.js';
import { GATE_PHASE } from './lib/j11.js';
import { composeAnswer, questionQuestions, CANT_SPLIT } from './lib/sandbox.js';
import { SHEET_WORDS, undoLine, blastLine, splitChoice, whyOpening, viewRows, gateTitle, standardLine, headText, buttonFiles } from './lib/sheets.js';
import { projectCards, boardView, judgeMarks, markDone, undoMark, readMarks, noMarks, recordDone, answerButtons, metaText, LANES, WORDS, MARKS_KEY,
  boardAge, doneTime, HOLD_MS, MOUSE_DRAG_PX, FINGER_SLOP_PX, LANE_MARGIN_PX, oneProjectView, ONE_WORDS, shortName, DRAFTS_KEY, readDrafts, draftsRecord, draftsToDrop, DRAFT_KEEP_DAYS } from './lib/board.js';
import { waitKey } from './lib/waiting.js';
import { canRecord } from './lib/model.js';
import { parseWorkflowRuns } from './lib/records.js';
import { V25_RULING_NOTE } from './lib/links.js';
import { runsContext, feedView, unblocksOf, GROUP_MARK, memberIcon, memberWork, itemFeeds,
  stalledLine, deployRows, FEED_ICONS_KEY, doneTarget, JOB_MERGE_WORDS, ESTIMATE_MERGE_WORDS } from './lib/feed.js';
import { WA, DRAFT_KEY, todayOf, groupOnce } from './lib/workahead.js';
import { PAGE_WORDS, STANDARD_TOTAL, pageSentence, phaseLine, phaseStrip, ranAgainLines, milestonesByPhase, restRows, v25Rows, finishWords } from './lib/projectpage.js';
import { topLine } from './lib/versions.js';
import { portfolioView, PF_ROWS, PF_WORDS, cardMilestone, portfolioScreenState, portfolioRead, portfolioCards, ideasView, rareLine, noteIdeas, ideaEvents, SEEN_IDEAS_KEY, PF_BOARD, PF_LABEL } from './lib/portfolio.js';
import { workAheadView, readDraft } from './lib/workview.js';

import {
  NOTIFY_WORDS, NOTIFY_STORE_KEY, COPY_DONE_WORDS, SHOW_AGAIN_WORDS, SEND_TEST_WORDS, copySteps, testSteps, notifyState, onTopLine,
  isStandalone, permissionOf, currentSubscription, subscriptionValue, turnOn, USAGE_TITLE, usageView, RECHECK_WORDS, recheckOutcome,
  openTarget, tapDecision, deskAddress, OPENED_WORDS, GONE_WORDS, CANT_READ_WORDS,
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
const cap = (w) => (w ? w[0].toUpperCase() + w.slice(1) : w);
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
  const pv = phaseView(project, tl, snap.tree, j, Boolean(box.read && box.read.read === 'cant-read'));
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
// Home's pieces kept from AC54 and AC49: the summary box and its bubble (AC54 (a), on the tile from
// stage 2), a ruling's whole line (AC55, AC52), who has the ball (AC49, on the Team screen)

/** Who has the ball (AC49), each line with its mark: the coral diamond for what waits on the owner, the half-filled circle for work under way (AC67: no light, no glow). */
function ballNode(ball, compact) {
  return h('ul', { class: 'sb-ball' }, (compact ? ball.slice(0, 2) : ball).map((b) => h('li', { class: `who-${b.who}` },
    b.who === 'you' ? ic('you') : b.lit ? ic('half') : null,
    b.who === 'you' ? h('span', { live: () => youWaitText(b.oldest, Date.now()) }) : b.text)));
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

// ---------------------------------------------------------------------------
// Home (AC82; desk mockup v2, frames H1 to H5; J24), from stage 2: the briefing, "Since you last
// looked", the tiles in their three groups, and "More detail" folded last at the foot. Every rule
// is lib/home.js's; this draws it, on mockup v2's tokens (sandbox.css, `.v2`).

/** A status circle as mockup v2 draws it (desk-v2.html's ST): an icon in a plain circle; the ◆ in vermilion. Hidden from assistive technology: its words are beside it. */
const ST_PATHS = {
  check: { ring: 'solid', d: ['M5 8.2l2 2 4-4.2'] },
  pastcheck: { ring: 'solid', d: ['M5 8.2l2 2 4-4.2'], soft: true },
  half: { ring: 'solid', fill: ['M8 1.75a6.25 6.25 0 0 1 0 12.5z'] },
  planned: { ring: 'dash', soft: true },
  unrec: { ring: 'dash', d: ['M6.5 6.5a1.6 1.6 0 1 1 2.2 1.5c-.4.2-.7.5-.7.9v.3'], dot: [8, 11.2, 0.6], soft: true },
  you: { you: true },
  // From stage 3 (AC83, AC84; desk-v2.html's ST): next to reach (the gold ring), not reached, skipped or not
  // used, no record in the model (a slashed circle), and the agents' grey diamond for "Not tied to a milestone".
  next: { gold: true },
  cross: { ring: 'solid', d: ['M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8'] },
  skip: { ring: 'solid', d: ['M5 8h6'], soft: true },
  nomodel: { ring: 'solid', d: ['M3.7 12.3l8.6-8.6'], soft: true },
  flag: { agents: true },
};
function stc(kind, cls = 'v2-s') {
  const def = ST_PATHS[kind] || ST_PATHS.unrec;
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', '0 0 16 16');
  s.setAttribute('class', `${cls} st-${kind}${def.soft ? ' soft' : ''}`);
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('focusable', 'false');
  const el = (tag, attrs) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    s.append(n);
  };
  if (def.you) el('path', { d: 'M8 1.8l6.2 6.2L8 14.2 1.8 8z', class: 'you' });
  if (def.agents) el('path', { d: 'M8 2.5l5.5 5.5L8 13.5 2.5 8z', class: 'agents' });
  if (def.gold) el('circle', { cx: 8, cy: 8, r: 6, class: 'gold' });
  if (def.ring) el('circle', { cx: 8, cy: 8, r: 6.25, class: def.ring === 'dash' ? 'ring dash' : 'ring' });
  for (const d of def.d || []) el('path', { d, class: 'mk' });
  for (const d of def.fill || []) el('path', { d, class: 'fill' });
  if (def.dot) el('circle', { cx: def.dot[0], cy: def.dot[1], r: def.dot[2], class: 'fill' });
  return s;
}

/** Home's state for this window: the question titles this opening saw (J24's answers), the lines on the screen (AC40's no-reorder rule), "<n> newer". */
const homeState = { titles: new Map(), accepted: null, since: null };

/** The stalest project's last successful read in this opening, or null before every project has one (AC82: "checked <age> ago"). */
function stalestRead() {
  const states = DESK && DESK.states ? [...DESK.states.values()] : [];
  const times = states.map((s) => s.lastSuccessAt);
  if (!times.length || times.some((x) => x == null)) return null;
  return Math.min(...times);
}
function homeChecked() {
  const t = stalestRead();
  return t == null ? HOME_WORDS.checking : `checked ${durationText(Math.max(0, Date.now() - t))} ago`;
}

/** The briefing (AC82, frames H1 and H3): one block, a tap anywhere on it opening Waiting. */
function briefingNode(desk, built, bd) {
  const reads = built.map((b) => ({ name: b.project.name, read: b.box.read, drawError: b.box.drawError || null }));
  const flagged = sandboxBoxes(built).reduce((n, b) => n + (b.flaggedCount || 0), 0);
  const v3 = (name) => { const p = CONFIG.projects.find((x) => x.name === name); return Boolean(p && p.model === 'v3'); };
  const view = (nowMs) => briefingView({ bd, reads, flagged, signedOut: desk.signedOut, v3, lastReadMs: stalestRead(), nowMs, tz: TZ,
    portfolio: lastPf ? portfolioRead(desk.portfolio(), nowMs, TZ) : null });
  const v = view(Date.now());
  const mark = v.kind === 'you' ? stc('you') : v.kind === 'quiet' ? stc('check') : v.kind === 'cant' ? vi('bad', 'v2-k bad') : vi('clock');
  return h('a', { class: `v2-brief k-${v.kind}`, href: '#/waiting', key: 'brief', 'aria-label': `${v.head}: open Waiting` },
    h('span', { class: 'v2-bi' }, mark),
    h('span', { class: 'v2-bt1' }, v.head),
    h('span', { class: 'v2-go' }, HOME_WORDS.waitingGo),
    v.parts ? h('span', { class: 'v2-bt2', key: 'brief-parts', live: () => view(Date.now()).parts || '' }) : null,
    v.sub ? h('span', { class: 'v2-bt3', key: 'brief-sub', live: () => view(Date.now()).sub || '' }) : null,
    v.cant.map((w, i) => h('span', { class: 'v2-bt3 bad', key: `brief-cant:${i}` }, w)));
}

/** One line of "Since you last looked" (AC82, frame H1): its time in Plex Mono, its icon, the record's own words, then "<project> · <its codes>"; a tap opens where it happened. */
function eventNode(e, nowMs, where) {
  const t = lineTime(e, nowMs, TZ);
  const k = `${where}:${e.id}`;
  const inner = [
    h('span', { class: 'v2-tm' }, t.day ? h('span', { class: 'v2-tmd' }, t.day) : null, t.time ? h('span', {}, t.time) : null),
    e.icon === 'you' ? stc('you', 'v2-k') : vi(e.icon, `v2-k${e.icon === 'bad' ? ' bad' : ''}`),
    // Past three lines, the third fades at its end (rulebook item 16; the Design reviewer's N3, stage 2
    // round 1), measured as the summary's is (measureClips).
    h('span', { class: 'v2-et' }, h('span', { class: `v2-e1${sinceOver.get(k) === true ? ' over' : ''}`, 'data-since': k }, e.words),
      h('span', { class: 'v2-e2' }, [e.project, ...e.codes].join(' · '))),
    vi('chev', 'v2-k v2-chev')];
  const link = e.target && e.target.href
    ? h('a', { class: 'v2-ev', key: k, href: e.target.href, rel: 'noopener noreferrer', target: '_blank' }, inner)
    : h('a', { class: 'v2-ev', key: k, href: (e.target && e.target.hash) || '#/', onclick: () => { nav.opener = k; } }, inner);
  return h('li', { key: `li:${k}` }, link);
}

/**
 * "Since you last looked" (AC82, J24), with "Mark as seen". Opening Home never moves a line under
 * the owner's thumb (AC40): new lines join only while the page is scrolled to its top; otherwise they
 * wait behind "<n> newer ›" at the list's top (C).
 */
function sinceModel(built, seen, nowMs) {
  for (const b of built) for (const q of (b.model && b.model.questions) || []) homeState.titles.set(`${b.project.name}|${q.name}`, q.title);
  const events = [];
  for (const b of built) {
    if (b.error || !b.model) continue;
    try {
      events.push(...projectEvents({ project: b.project, model: b.model, snap: b.snap, j: b.j, commits: DESK && DESK.commits ? DESK.commits(b.project.name) : null,
        ownerLogin: CONFIG.ownerLogin, titles: homeState.titles, nowMs, tz: TZ }));
    } catch {
      // a project whose records the lines can't be read from adds none; its tile says why
    }
  }
  const since = seen.off ? null : seen.reference;
  // From stage 6b (J24): an idea's change of state, from the states kept at "last looked" under desk-seen-ideas-v1.
  try {
    events.push(...ideaLines(seen, since));
  } catch {
    // the idea lines can't be read: the projects' lines stand
  }
  if (homeState.since !== since) {
    homeState.since = since;
    homeState.accepted = null;
  }
  const atTop = !(typeof window !== 'undefined' && (window.scrollY || 0) > 0);
  const ids = new Set(events.map((e) => e.id));
  if (!homeState.accepted || atTop) homeState.accepted = ids;
  const shown = events.filter((e) => homeState.accepted.has(e.id));
  const held = sinceView({ events, since, off: seen.off, nowMs, tz: TZ });
  const view = sinceView({ events: shown, since, off: seen.off, nowMs, tz: TZ });
  const count = (v) => v.lines.length + v.rest.length;
  view.newer = Math.max(0, count(held) - count(view));
  return view;
}

/**
 * J24's idea lines (from stage 6b): the states kept on this device at each "last looked" (desk-seen-ideas-v1,
 * through the wrapped store, as J5's are), brought up to date from the portfolio as last read, and each
 * change of state against the states kept at the "last looked" this window marks against.
 */
function ideaLines(seen, since) {
  if (!lastPf || since == null || !ns.store) return [];
  const store = ns.store;
  const kept = store.getJSON(SEEN_IDEAS_KEY, null);
  const snap = DESK && DESK.portfolio ? DESK.portfolio() : null;
  const r = noteIdeas(kept, { reference: since, latest: seen.latest, pf: lastPf, readAt: snap && snap.readAt != null ? snap.readAt : Date.now() });
  if (r.changed) store.setJSON(SEEN_IDEAS_KEY, r.kept);
  return ideaEvents(r.kept, since);
}

function sinceNode(sv, seen, nowMs) {
  const head = h('div', { class: 'v2-sh', key: 'since-h' }, h('h2', { class: 'v2-shw' }, sv.heading),
    sv.off ? null : h('button', { type: 'button', class: 'v2-seen', key: 'mark-seen', onclick: () => {
      seen.markSeen();
      homeState.accepted = null;
      render();
    } }, HOME_WORDS.markSeen));
  if (sv.off) return [head, h('p', { class: 'v2-small', key: 'since-off' }, MARKERS_OFF)];
  const out = [head];
  if (sv.newer > 0) {
    out.push(h('button', { type: 'button', class: 'v2-more', key: 'since-newer', onclick: () => {
      homeState.accepted = null;
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') window.scrollTo(0, 0);
      render();
    } }, `${sv.newer} newer`, vi('chev')));
  }
  if (sv.none) out.push(h('p', { class: 'v2-small', key: 'since-none' }, sv.none));
  else out.push(h('ol', { class: 'v2-since', key: 'since' }, sv.lines.map((e) => eventNode(e, nowMs, 'ev'))));
  if (sv.more) out.push(h('a', { class: 'v2-more', href: '#/since', key: 'since-more', onclick: () => { nav.opener = 'since-more'; } }, sv.more.replace(/ ›$/, ''), vi('chev')));
  return out;
}

/** The rest of the list, in a sheet over Home (AC82: "<n> more since <time> ›"; AC56's rules: its 44 px close, a tap outside, Escape). */
function sinceSheet(sv, nowMs) {
  const title = sv.heading;
  return sheetShell('#/', title, [sheetHead(null, title, '#/'),
    h('ol', { class: 'v2-since', key: 'since-all' }, sv.rest.map((e) => eventNode(e, nowMs, 'evs')))], 'since-sheet');
}

/** A tile's timeline (AC82, frame H5): drawn left to right, hidden from assistive technology, one sentence in words carrying it. */
function timelineNode(tl, name) {
  const n = tl.rows[0] ? tl.rows[0].cells.length : 5;
  const row = (r) => h('span', { class: 'v2-rwl' }, h('span', { class: 'v2-rk' }, r.label),
    h('span', { class: `v2-rw n${n}` }, r.cells.map((c, i) => {
      const drop = i === r.down;
      const rise = i === r.up;
      if (!c) return h('span', { class: `v2-c${drop ? ' dn' : ''}${rise ? ' up' : ''}` }, drop || rise ? h('i', {}) : null);
      return h('span', { class: `v2-c ${c.cls || 'ph-none'} s-${c.state}${c.l ? ' l' : ''}${c.r ? ' r' : ''}${drop ? ' dn' : ''}${rise ? ' up' : ''}` },
        drop || rise ? h('i', {}) : null, stc(c.icon, 'v2-s'));
    })));
  return [h('div', { class: `v2-ptl${tl.sprints ? ' sprints' : ''}`, key: `ptl:${name}`, 'aria-hidden': 'true' },
    tl.rows.map(row),
    h('span', { class: 'v2-lbl' }, h('span', {}), h('span', { class: `v2-lb n${n}` }, tl.labels.map((l) => (l.now ? h('b', {}, l.phase) : h('span', {}, l.phase)))))),
  h('p', { class: 'sb-vh', key: `ptl-words:${name}` }, tl.words)];
}

/**
 * The gate card waiting on the owner in a project, as the board has it (AC80: in "Waiting on you" or
 * "Kicked back", less a card marked done here), or null. Home's tile (AC82) and Plan's gate row (AC86)
 * both take it from here, so the two never differ.
 */
function gateCardOf(bd, name) {
  const lanes = bd ? bd.lanes.filter((l) => l.key !== 'done').flatMap((l) => l.groups.filter((g) => g.project === name).flatMap((g) => g.rows)) : [];
  return lanes.find((c) => c.kind === 'gate' && c.flag && c.flag.card) || null;
}

/** One tile (AC82, frame H5): its name and what waits, the README summary, the phases as a timeline, "Now:", who is at work, what comes next. A tap opens the project's Status screen until stage 3. */
function tileNode(b, bd, group, nextRows, whyOnce = null) {
  const { project, box } = b;
  const name = project.name;
  const counts = bd && bd.counts ? bd.counts.get(name) : null;
  const n = counts ? counts.waiting + counts.kicked : 0;
  const rs = readStateOf(box);
  const read = rs.state;
  const waits = tileWaits(n, read);
  const sum = summaryView(project, box, b.snap);
  // The gate card waiting on the owner (AC82: the ◆ in its phase, and "Next: <the gate>, after your ruling").
  const gateCard = gateCardOf(bd, name);
  const gate = gateCard ? cap(GATE_PHASE[gateCard.flag.card.gate] || '') : null;
  let tl;
  let now;
  let next;
  if (project.model === 'v3') {
    tl = tileTimeline(b.ctx, gate);
    now = nowLine(b.ctx, TZ);
    // AC90: the group's head says "why their run went back: not recorded" once; the tile keeps its own date.
    if (whyOnce && whyOnce.has(name)) now = nowOwnPart(now);
    next = nextLine(project, { gate, row: nextRows ? nextRows.get(name) || null : null, docRead: Boolean(b.j && b.j.ready && b.j.projectDoc), unknown: !nextRows });
  } else {
    tl = sprintStrip(b.snap);
    now = { lead: `Now: ${tl.open ? `sprint ${tl.open}` : 'no open sprint'}`, rest: HOME_WORDS.olderPipeline };
    next = nextLine(project, { gate: null, sprint: tl.open });
  }
  let work = atWorkLine(project, b.model, b.ball, b.j, TZ);
  // No records held yet, or none ever read: "not available" (home.js, unreadLines).
  if (read !== 'ok' && !(b.snap && b.snap.tree)) ({ now, work, next } = unreadLines(project));
  return h('article', { class: 'v2-tile', key: `card:${name}` },
    h('div', { class: 'v2-thd' }, h('h3', { class: 'v2-tnm' }, h('a', { class: 'v2-ta', href: go('p', name), key: `tile-a:${name}` }, name)),
      h('span', { class: `v2-wt${waits.you ? ' you' : ''}` }, waits.you ? stc('you', 'v2-k') : null, waits.words)),
    summaryBox(name, sum, ''),
    sum.ok ? null : h('details', { class: 'v2-why', key: `sum-why:${name}` }, h('summary', {}, 'Why'), h('p', {}, sum.why)),
    tl.tracked ? timelineNode(tl, name) : h('p', { class: 'v2-small v2-tnone' }, tl.words),
    now ? h('p', { class: 'v2-ln now' }, h('span', {}), h('span', {}, h('b', {}, now.lead), now.rest ? h('span', { class: 'v2-g' }, ` · ${now.rest}`) : null)) : null,
    h('p', { class: 'v2-ln' }, vi('agents'), h('span', { class: 'v2-g' }, work)),
    h('p', { class: 'v2-ln' }, stc(next.icon, 'v2-k'), h('span', {}, h('span', { class: 'v2-g' }, 'Next:'), ` ${next.words}`)),
    stallNode(b, group),
    read === 'cant-read' && rs.since != null ? h('p', { class: 'v2-ln bad' }, vi('bad'), h('span', {}, `Can't read since ${hhmm(new Date(rs.since), TZ)}: ${box.read.words}`)) : null);
}

/**
 * A project's read state as Home draws it (AC82's tile; AC5): 'cant-read' for a project that can't be
 * drawn or whose read is refused or failing, 'checking' while its first read is pending, else its
 * read's own; with the time it began failing. The tile and the portfolio's cap (AC87) both take it from
 * here, so the two never differ.
 */
function readStateOf(box) {
  return { state: box.drawError ? 'cant-read' : box.read ? box.read.read : 'checking', since: box.read && box.read.since != null ? box.read.since : null };
}

function renderHome(desk, built, seen, nowMs, bd = null) {
  const order = orderBoxes(built.map((b) => b.box));
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
  // Each v3 project's first milestone not reached in the owner's order, with AC24's rough finish.
  // `null`: Work ahead's view couldn't be built, so no tile can say what comes next (the Reviewer's N-4,
  // stage 2 round 2): each v3 tile reads "Next: not available", and Plan says why.
  let nextRows = new Map();
  try {
    for (const r of workView(nowMs).rows) if (!nextRows.has(r.project.name)) nextRows.set(r.project.name, r);
  } catch {
    nextRows = null;
  }
  const groups = HOME_GROUPS.map((g) => {
    const members = placed.filter((x) => x.group === g.key);
    const counted = (x) => { const c = bd && bd.counts ? bd.counts.get(x.b.project.name) : null; return c ? c.waiting + c.kicked : 0; };
    const words = groupHeaderWords(members.map((x) => ({ waiting: counted(x), cantRead: Boolean(x.box.drawError || (x.box.read && x.box.read.read === 'cant-read')) })));
    const isOpen = homeGroups.isOpen(g.key);
    const id = `grp-${g.key}`;
    // AC90 (P-001-audit-repeat.md, A): a run's missing why shared by two or more of the group's tiles, said once at its head.
    const backNames = members.filter((x) => {
      try {
        const nl = !x.b.error && x.b.project.model === 'v3' ? nowLine(x.b.ctx, TZ) : null;
        return Boolean(nl && nl.missing);
      } catch {
        return false;
      }
    }).map((x) => x.b.project.name);
    const whyOnce = backNames.length >= 2 ? new Set(backNames) : null;
    return h('section', { class: 'v2-hgroup', key: `hgroup:${g.key}` },
      h('h2', { class: 'v2-hgh' }, h('button', { type: 'button', class: 'v2-hg', key: `hgroup-btn:${g.key}`, 'aria-expanded': isOpen ? 'true' : 'false', 'aria-controls': isOpen ? id : null,
        onclick: () => { homeGroups.toggle(g.key); render(); } },
      h('span', { class: 'v2-hgt' }, g.title),
      words.waiting ? h('span', { class: 'v2-hgy' }, stc('you', 'v2-k'), words.waiting) : null,
      words.cant ? h('span', { class: 'v2-hgb' }, words.cant) : null,
      h('span', { class: 'v2-hgn' }, String(members.length), h('span', { class: 'sb-vh' }, ` ${members.length === 1 ? 'project' : 'projects'}`)),
      vi(isOpen ? 'chevdown' : 'chev'),
      h('span', { class: 'sb-vh' }, isOpen ? ' (open)' : ' (closed)'))),
      isOpen && whyOnce ? h('p', { class: 'v2-small gap v2-hgonce', key: `hgonce:${g.key}` }, WHY_BACK_ONCE(whyOnce.size, members.length)) : null,
      isOpen ? h('div', { class: 'v2-tiles', id, key: `tiles:${g.key}` }, members.map(({ b, box }) => {
        try {
          if (b.error) throw b.error;
          return tileNode(b, bd, g.key, nextRows, whyOnce);
        } catch (err) {
          return h('article', { class: 'v2-tile bad', key: `card:${box.name}` }, h('div', { class: 'v2-thd' }, h('h3', { class: 'v2-tnm' }, box.name)),
            h('p', { class: 'v2-ln bad' }, box.drawError || `Can't show this project: ${errorText(err)}`));
        }
      })) : null);
  });
  const sv = sinceModel(built, seen, nowMs);
  const pf = portfolioOf(built);
  const body = [
    h('header', { class: 'v2-top' }, h('h1', { class: 'v2-title' }, HOME_WORDS.title)),
    h('p', { class: 'v2-sub', key: 'home-checked', live: homeChecked }),
    // AC75: "Notifications" on Home's top line until notifications are on for this device; its control is also in the fold at the foot.
    onTopLine(notifyState(notifyEnv())) ? notifyNode(true) : null,
    briefingNode(desk, built, bd),
    sinceNode(sv, seen, nowMs),
    h('div', { class: 'v2-hgroups', key: 'hgroups' }, groups),
    // Home's foot (AC82, specs/S-001.md:6696-6700): the portfolio's block, read only (AC87, from stage
    // 6a); then "More detail", closed, below everything else on Home (P-001-settings-place.md, A).
    portfolioNode(pf),
    h('details', { class: 'v2-mdetail', key: 'home-more-detail' }, h('summary', { class: 'v2-mds', key: 'home-more' }, h('span', {}, HOME_WORDS.moreDetail), vi('chev')),
      h('section', { class: 'sb-notify-line', key: 'notify-line' }, h('h3', { class: 'sb-h3' }, 'Notifications'), notifyNode(false)),
      usageNode(),
      h('p', { class: 'v2-small sb-v5' }, v5Line(built))),
  ];
  const out = [h('section', { class: 'sb-screen v2 v2-home', key: 'home' }, body)];
  if (nav.route.sheet === 'since' && !sv.off && sv.rest.length) out.push(sinceSheet(sv, nowMs));
  if (pf.view && nav.route.sheet && nav.route.sheet.startsWith('pf:')) out.push(portfolioSheet(pf, nav.route.sheet.slice(3), built));
  return out;
}

// ---------------------------------------------------------------------------
// The portfolio's block at Home's foot (AC87; frame H4), stage 6a: from what the desk reads today
// (each project's phase, AC50, and J23's version reads, stage 3); every part that needs the portfolio
// says it isn't connected yet. Read only: nothing here writes, and nothing reads the portfolio (6b).
// Every word is lib/portfolio.js's.

/** The block's view from the projects as drawn, or why it can't be shown: { view, error }. */
function portfolioOf(built) {
  try {
    return { view: portfolioView(built.map((b) => {
      // The tile's read state (readStateOf), its time in ownerTimeZone as the tile's "Can't read since HH:MM".
      const rs = readStateOf(b.box);
      const read = { state: rs.state, since: rs.state === 'cant-read' && rs.since != null ? hhmm(new Date(rs.since), TZ) : null };
      return { project: b.project, pv: b.error ? null : b.pv, snap: b.error ? null : b.snap, error: Boolean(b.error), read };
    }), lastPf), error: null };
  } catch (err) {
    return { view: null, error: err };
  }
}

/** A row's line (AC87): its parts joined by " · ", each state's mark drawn just before the words it marks (the slashed circle, the dashed "?"). */
function pfLine(row) {
  return row.parts.map((p, i) => {
    if (!p.mark) return [i ? ' · ' : null, p.text];
    // The mark is kept on the line of the first word it marks (it never ends a line alone).
    const sp = p.text.indexOf(' ');
    const first = sp < 0 ? p.text : p.text.slice(0, sp);
    return [i ? ' · ' : null, h('span', { class: 'v2-pfnb' }, stc(p.mark, 'v2-s v2-pfmk'), first), sp < 0 ? null : p.text.slice(sp)];
  });
}

/** The block (frame H4): its head with "portfolio" in Plex Mono at its right, one row each opening its sheet, then the one line under the rows. */
function portfolioNode(pf) {
  if (!pf.view) {
    return h('section', { class: 'v2-pf', key: 'portfolio' }, h('h2', { class: 'v2-sh v2-pfh' }, h('span', { class: 'v2-shw' }, PF_WORDS.head), h('span', { class: 'v2-mono' }, PF_WORDS.mono)),
      h('p', { class: 'v2-small bad' }, `Can't show this: ${errorText(pf.error)}`));
  }
  const v = pf.view;
  return h('section', { class: 'v2-pf', key: 'portfolio', 'aria-labelledby': 'pf-head' },
    h('h2', { class: 'v2-sh v2-pfh' }, h('span', { class: 'v2-shw', id: 'pf-head' }, v.head), h('span', { class: 'v2-mono' }, v.mono)),
    h('ol', { class: 'v2-rows v2-pfrows', key: 'pf-rows' }, v.rows.map((r) => pageRow(`pf:${r.key}`, go('pf', r.key), null, r.title, pfLine(r),
      { cls: r.soft ? 'soft' : '', onclick: () => { nav.opener = `pf:${r.key}`; } }))),
    h('p', { class: 'v2-small v2-pffoot', key: 'pf-foot' }, v.foot));
}

/** A row's sheet over Home (AC87: "each opening a sheet with its detail"; AC56's close, tap outside and Escape). */
function portfolioSheet(pf, key, built) {
  const v = pf.view;
  const row = v.rows.find((r) => r.key === key);
  if (!row) return null;
  const back = '#/';
  const item = (k, title, ...lines) => h('li', { class: 'v2-pfsi', key: `pfs:${k}` }, h('span', { class: 'v2-prtt' }, title), lines);
  const mark = (kind, words) => h('p', { class: 'v2-mark' }, stc(kind), h('span', {}, words));
  let parts;
  if (key === 'cap') {
    parts = [h('ol', { class: 'v2-rows v2-pfsl', key: 'pfs-cap' }, v.cap.entries.map((e) => item(e.name, e.name,
        h('span', { class: 'v2-small' }, [e.phase ? (e.phase === 'Done' ? PF_WORDS.capDone : `Now: ${e.phase}`) : e.v3 ? `Phase: ${e.why}` : cap(e.why), e.stale || null, e.counted ? PF_WORDS.capCounted : PF_WORDS.capNotCounted].filter(Boolean).join(' · '))))),
      mark('nomodel', `${cap(PF_WORDS.capNoRecord)}. ${PF_WORDS.capModelOpen}`),
      h('p', { class: 'v2-small' }, PF_WORDS.capResearch)];
  } else if (key === 'scorecard') {
    // Each mark beside its own words, and no key (mockup v2's rule, part B item 35; specs/S-001.md:6820-6821).
    parts = [mark('nomodel', PF_WORDS.targets), mark('unrec', cap(PF_WORDS.time))];
  } else if (key === 'versions') {
    parts = [h('ol', { class: 'v2-rows v2-pfsl', key: 'pfs-versions' }, v.versions.rows.map((r) => {
      const b = built.find((x) => x.project.name === r.name);
      let top = null;
      try {
        top = b && !b.error ? topLine(b.project, b.snap) : null;
      } catch {
        top = null;
      }
      return item(r.name, r.words, top ? h('span', { class: 'v2-mono' }, top) : null);
    })),
    h('p', { class: 'v2-small v2-pffrom' }, v.versions.publisher ? PF_WORDS.versionsFrom.map((w, i) => (i % 2 ? code(w) : w)) : PF_WORDS.noPublisher)];
  } else if (!v.pf) {
    // "Decisions across projects" and the rarer records with no `portfolio` in J7: 6a's words (J23).
    parts = [h('p', { class: 'v2-body' }, pfLine(row)), h('p', { class: 'v2-small' }, PF_WORDS.waitsOnP1), h('p', { class: 'v2-small' }, v.foot)];
  } else {
    parts = portfolioReadParts(v.pf, key, row, v.foot);
  }
  return sheetShell(back, row.title, [sheetHead(v.head, row.title, back), h('div', { class: 'v2-blk v2-pfs', key: `pfs-body:${key}` }, parts)], 'pf-sheet');
}

/**
 * The sheets of the portfolio's own rows, from stage 6b (AC87; J23): "Decisions across projects", each card
 * in the queue with its file and its place on Waiting, and the phone note; the rarer records, the files
 * under rulings/ and library/facts/ by name and count, whether intent/ holds one beyond its template, and
 * track records' "no record in the model"; each saying first why the read isn't current, when it isn't.
 */
function portfolioReadParts(pf, key, row, foot) {
  const problem = pf.problem && pf.state !== 'pending' ? h('p', { class: 'v2-mark', key: 'pfs-problem' }, vi('bad', 'v2-k bad'), h('span', {}, pf.problem)) : null;
  const access = pf.state === 'access' ? h('p', { class: 'v2-small', key: 'pfs-p1' }, PF_WORDS.setupP1Line) : null;
  // File and repository names in Plex Mono at the code size (the rulebook's part A, items 19 and 23; Design review round 1, F2).
  const from = h('p', { class: 'v2-small', key: 'pfs-from' }, 'Read from ', h('span', { class: 'v2-mono' }, pf.repo), ', read only.',
    pf.lastSuccessAt != null ? ` Last read ${hhmm(new Date(pf.lastSuccessAt), TZ)}.` : '');
  // "<what>: <n> · <names>" (rareLine's words), each name in Plex Mono.
  const rareNode = (k, what, names) => h('li', { class: 'v2-pfsi', key: `pfs:${k}` }, h('span', { class: 'v2-body' },
    names.length ? [`${what}: ${names.length} · `, names.map((x, i) => [i ? ', ' : null, h('span', { class: 'v2-mono' }, x)])] : rareLine(what, names)));
  if (key === 'decisions') {
    const cards = portfolioCards(pf);
    // The row's line, less the problem already said above it.
    const rest = { ...row, parts: row.parts.filter((x) => !problem || x.text !== pf.problem) };
    return [problem, access, rest.parts.length ? h('p', { class: 'v2-body', key: 'pfs-line' }, pfLine(rest)) : null,
      cards.length ? h('ol', { class: 'v2-rows v2-pfsl', key: 'pfs-cards' }, cards.map((c) => h('li', { class: 'v2-pfsi', key: `pfs:${c.id}` },
        h('a', { class: 'v2-prtt', href: go('waiting', 'card', c.id), key: `pfs-card:${c.id}` }, c.title), h('span', { class: 'v2-mono' }, c.path)))) : null,
      cards.length ? h('p', { class: 'v2-small', key: 'pfs-each' }, PF_WORDS.eachWaits) : null,
      h('p', { class: 'v2-mark', key: 'pfs-phone' }, vi('clock'), h('span', {}, PF_WORDS.phoneNote)), from, h('p', { class: 'v2-small', key: 'pfs-foot' }, foot)];
  }
  const r = pf.rare;
  return [problem, access,
    r ? h('ul', { class: 'v2-rows v2-pfsl', key: 'pfs-rare' },
      rareNode('rulings', PF_WORDS.rulings, r.rulings), rareNode('facts', PF_WORDS.facts, r.facts), rareNode('intent', PF_WORDS.intent, r.intent)) : h('p', { class: 'v2-body', key: 'pfs-rare-none' }, pf.problem || NOT_AVAILABLE),
    h('p', { class: 'v2-mark', key: 'pfs-track' }, stc('nomodel'), h('span', {}, PF_WORDS.trackRecords)), from, h('p', { class: 'v2-small', key: 'pfs-foot' }, foot)];
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
// A project's page (AC83; desk mockup v2, frames 5, 6, 6b and 8), from stage 3: at `p/<name>`, in the
// Status screen's place (AC81, "From stage 3"). Overview and Timeline at its top; the one sentence;
// the phase strip; why a phase ran again and the owner's last action; what waits and who is at work;
// the milestones by phase, the project's own and the model's standard ones together; then the rest.
// Every rule is lib/projectpage.js's (and AC57's, in lib/feed.js); this draws it on mockup v2's tokens.


/** Why a run began (AC70): its date, the ruling's reason quoted, its source one tap from the whole record; or "not recorded" in the agents' grey (AC69). */
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

/**
 * The back control on a project's page, its Timeline and its Team screen (AC56; frames 5 and 7b): one
 * screen back in the sandbox's own history, or, with no earlier screen, up to where the screen sits
 * (the page to Home, the Timeline and the Team screen to the page). 44 by 44, named "Back".
 */
function backControl(up, cls = 'v2-round') {
  if (nav.canBack()) return h('button', { type: 'button', class: cls, key: 'nav-back', 'aria-label': 'Back', onclick: () => nav.back() }, vi('back', 'v2-i'));
  return h('a', { class: cls, key: 'nav-back', href: up, 'aria-label': 'Back' }, vi('back', 'v2-i'));
}

/** The switch "Overview | Timeline" (AC83, AC84), the current one shaded and named so (`aria-current`). */
function pageSwitch(name, current) {
  const seg = (k, label, href) => h('a', { class: 'v2-sega', key: `seg:${k}`, href, 'aria-current': current === k ? 'page' : null }, label);
  return h('nav', { class: 'v2-seg', key: 'page-switch', 'aria-label': `${name}: Overview or Timeline` },
    seg('overview', PAGE_WORDS.overview, go('p', name)), seg('timeline', PAGE_WORDS.timeline, go('p', name, 'timeline')));
}

/** AC24's rough finish for each of a project's own milestones, from Work ahead's view (null where it can't be built). */
function finishLookup(name) {
  let rows = null;
  try {
    rows = workView(Date.now()).rows;
  } catch {
    rows = null;
  }
  return (code) => {
    const r = rows ? rows.find((x) => x.project.name === name && x.code === code) : null;
    return r ? r.finish : null;
  };
}
/** The Timeline's band for a run (its frame 7b dates), from the drawing's feed. */
function bandLookup(p) {
  let fv = null;
  try {
    fv = p.project.model === 'v3' ? p.feed() : null;
  } catch {
    fv = null;
  }
  return (r) => {
    const b = fv && fv.ok ? fv.blocks.find((x) => x.key === `${r.phase}-i${r.iteration}`) : null;
    return b ? b.band : null;
  };
}

/** What waits on the owner in this project, as the board counts it (AC80): { n, read, names }. */
function pageWaits(p, bd) {
  const name = p.project.name;
  const c = bd && bd.counts ? bd.counts.get(name) : null;
  const n = c ? c.waiting + c.kicked : 0;
  const read = p.box.drawError ? 'cant-read' : p.box.read ? p.box.read.read : 'checking';
  const rows = bd ? bd.lanes.filter((l) => l.key !== 'done').flatMap((l) => l.groups.filter((g) => g.project === name).flatMap((g) => g.rows)) : [];
  // AC89 (c): each by its short name, from its kind and its own id (board.js, shortName), never a reworded title.
  return { n, read, names: rows.map((r) => shortName(r) || [{ text: r.kindWord ? r.kindWord.toLowerCase() : NOT_RECORDED, id: false }]) };
}

/** A row of the page (frames 5 and 8): its mark, its title and its small line, a chevron; a tap opens where it says. */
function pageRow(key, href, mark, title, small, { cls = '', smallCls = 'v2-small', live = null, onclick = null, clip = null } = {}) {
  return h('li', { key: `li:${key}` }, h('a', { class: `v2-prow${cls ? ` ${cls}` : ''}`, key, href, onclick },
    mark || h('span', { class: 'v2-pmk', 'aria-hidden': 'true' }),
    h('span', { class: 'v2-prt' }, h('span', { class: 'v2-prtt' }, title), small != null || live ? h('span', { class: smallCls, live, 'data-clip': clip }, small) : null),
    vi('chev', 'v2-k v2-chev')));
}

/**
 * The two rows (AC83, frame 5): "◆ <n> wait on you" with the waiting items' short names, opening
 * Waiting with only this project shown (AC80, frame 2); or "Nothing waiting on you" with a ✓ and
 * "checked <age> ago" (frame 8); or AC5's and "Checking…"'s words. Then, for a v3 project, "At work
 * now: <who has the ball>" with "with the agents: <n>", opening the Team screen (P-001-team-screen.md, A).
 */
function pageTwoRows(p, bd) {
  const name = p.project.name;
  const w = pageWaits(p, bd);
  const to = go('waiting', name);
  let waits;
  if (w.n > 0) {
    // AC89 (c): the short names joined by " · ", each id in Plex Mono (AC48), cut at two lines with the fade (part A
    // item 16; measured as a sheet's three-line text is, measureClips); the tap opens Waiting, where every title is whole.
    const clip = `page-waits:${name}`;
    const names = w.names.map((parts, i) => [i ? ' · ' : null, parts.map((x) => (x.id ? h('span', { class: 'v2-mono' }, x.text) : x.text))]);
    waits = pageRow('page-waits', to, stc('you'), `${w.n} ${w.n === 1 ? 'waits' : 'wait'} on you`, names,
      { cls: 'you', smallCls: `v2-small v2-wn${clipOver.get(clip) === true ? ' over' : ''}`, clip });
  }
  else if (w.read === 'cant-read') {
    const r = p.box.read || {};
    waits = pageRow('page-waits', to, vi('bad', 'v2-k bad'), p.box.drawError || (r.since != null ? `Can't read since ${hhmm(new Date(r.since), TZ)}` : "Can't read"), r.words || null, { cls: 'bad' });
  } else if (w.read !== 'ok') waits = pageRow('page-waits', to, vi('clock'), PAGE_WORDS.checking, null);
  else waits = pageRow('page-waits', to, stc('check'), PAGE_WORDS.nothingWaiting, null, { live: checkedWords });
  const rows = [waits];
  if (p.project.model === 'v3') {
    // No records held yet, or none ever read: "not available", as Home's tile says (home.js, unreadLines), never a zero.
    const unread = w.read !== 'ok' && !(p.snap && p.snap.tree);
    const at = unread ? `At work: ${NOT_AVAILABLE}` : atWorkLine(p.project, p.model, p.ball, p.j, TZ);
    const who = /^At work: /.test(at) ? at.slice('At work: '.length) : `${at[0].toLowerCase()}${at.slice(1)}`;
    const n = !unread && p.model && Array.isArray(p.agents) ? p.agents.length : NOT_AVAILABLE;
    rows.push(pageRow('page-work', go('p', name, 'team'), vi('agents'), `At work now: ${who}`, `${WORDS.agents.toLowerCase()}: ${n}`));
  }
  return rows;
}

/** The phase strip (AC83, frame 5; a v2.5 project's sprints, frame 8): hidden from nothing, each cell's words its own. */
function stripNode(st) {
  if (!st.tracked) return h('p', { class: 'v2-small', key: 'strip-none' }, st.words);
  return h('ol', { class: `v2-strip${st.sprints ? ' sprints' : ''}`, key: 'strip', 'aria-label': st.sprints ? 'Sprints, the last four' : 'Phases, start to finish' },
    st.cells.map((c) => h('li', { class: `v2-ph ${c.cls || 'ph-none'} b-${c.bar}${c.now ? ' now' : ''}`, key: `ph:${c.phase}` },
      h('span', { class: 'v2-bar3', 'aria-hidden': 'true' }),
      h('span', { class: 'v2-pn' }, stc(c.icon), h('span', { class: st.sprints ? 'v2-pnm mono' : 'v2-pnm' }, c.phase)),
      h('span', { class: 'v2-ps' }, c.words))));
}

/** One milestone in an opened phase (AC83, frames 6 and 6b): its icon, its id in Plex Mono, its name, its state in words under it. */
function smRow(x) {
  return h('li', { class: `v2-sm${x.soft ? ' soft' : ''}${x.old ? ' old' : ''}`, key: `sm:${x.kind}:${x.id}`, 'data-ms': x.id },
    stc(x.icon), h('span', { class: 'v2-smt' }, h('span', { class: 'v2-smn' }, h('span', { class: 'v2-id' }, x.id), ' ', x.name),
      h('span', { class: 'v2-sms' }, x.words)));
}

/** An opened phase (AC83, frame 6): a thin line with an arrow pointing up; the latest run in full, then each earlier run, smaller. */
function phaseOpenNode(line) {
  const kids = [h('span', { class: 'v2-arrow', 'aria-hidden': 'true' }, vi('up', 'v2-k'))];
  for (const r of line.runs) {
    kids.push(h('p', { class: `v2-runh${r.latest ? '' : ' old'}`, key: `runh:${r.key}` }, r.head));
    if (r.latest) {
      if (r.own.length) kids.push(h('p', { class: 'v2-subh', key: `yours:${r.key}` }, PAGE_WORDS.yours), h('ol', { class: 'v2-sml', key: `own:${r.key}` }, r.own.map(smRow)));
      if (r.std.length) kids.push(h('p', { class: 'v2-subh', key: `stdh:${r.key}` }, PAGE_WORDS.standardOf(r.stdCount)), h('ol', { class: 'v2-sml', key: `std:${r.key}` }, r.std.map(smRow)));
    } else {
      kids.push(h('ol', { class: 'v2-sml old', key: `old:${r.key}` }, [...r.own, ...r.std].map(smRow),
        r.gathered ? h('li', { class: 'v2-sm old soft', key: `gather:${r.key}` }, stc('unrec'), h('span', { class: 'v2-smt' }, h('span', { class: 'v2-smn' }, r.gathered.words))) : null));
    }
  }
  if (line.whyOnce) kids.push(h('p', { class: 'v2-callout gap', key: `why:${line.phase}` }, vi('eye'), h('span', { class: 'gap' }, line.whyOnce)));
  return h('div', { class: 'v2-stdl', key: `stdl:${line.phase}`, id: `phase-${line.phase}`, role: 'region', 'aria-label': `${line.phase}: its milestones, read from the bottom up` }, kids);
}

/** Milestones by phase (AC83, frames 5, 6 and 6b): one folded line per phase, bottom up; a tap, Enter or Space opens one below itself. */
function milestonesNode(p) {
  const name = p.project.name;
  const mv = milestonesByPhase(p.ctx, { finishOf: finishLookup(name), bandOf: bandLookup(p),
    ruled: Boolean(p.snap && p.snap.tree && p.snap.tree.has('decisions/questions/P-001-standard-milestones.md')) });
  const head = h('div', { class: 'v2-sh', key: 'ms-h' }, h('h2', { class: 'v2-shw' }, PAGE_WORDS.milestonesHead(STANDARD_TOTAL)), h('span', { class: 'v2-mono' }, PAGE_WORDS.startFoot));
  if (!mv.tracked) return [head, h('p', { class: 'v2-small', key: 'ms-none' }, mv.words)];
  return [head, h('ol', { class: 'v2-std', key: 'ms-lines' }, mv.lines.map((l) => {
    const fk = `phase:${l.phase}`;
    const open = isOpenFold(name, fk, false);
    const d = l.detail;
    const detail = h('span', { class: 'v2-sd', id: `phase-d-${l.phase}` },
      d.yours ? `Yours: ${d.yours}` : null, ...d.earlier.map((e) => ` · ${e}`), d.yours || d.earlier.length ? ' · ' : null,
      'Standard: ', h('b', {}, d.std.bold), d.std.rest);
    return h('li', { key: `line:${l.phase}`, 'data-phase': l.phase },
      foldButton(name, fk, false, { class: `v2-stdr v2-fold ${l.cls}`, 'aria-label': l.phase, 'aria-describedby': `phase-d-${l.phase}`, 'aria-controls': open ? `phase-${l.phase}` : null },
        h('span', { class: 'v2-dot', 'aria-hidden': 'true' }), h('span', { class: 'v2-sn' }, l.phase), h('span', { class: 'v2-sv' }, l.word), detail),
      open ? phaseOpenNode(l) : null);
  }))];
}

/** The rest (AC83, frame 5): "Value targets", "Experiments" and "Details", each a row with a chevron. */
function restNode(p) {
  const name = p.project.name;
  const rr = restRows(p.j, p.snap && p.snap.tree);
  const rows = [];
  if (p.project.model === 'v3' && rr.values) rows.push(pageRow('rest:values', go('p', name, 'values'), stc('planned'), rr.values.title, rr.values.small, { onclick: () => { nav.opener = 'rest:values'; } }));
  if (p.project.model === 'v3') rows.push(pageRow('rest:experiments', go('p', name, 'experiments'), stc('half'), rr.experiments.title, rr.experiments.small, { onclick: () => { nav.opener = 'rest:experiments'; } }));
  return [h('h2', { class: 'v2-sh v2-shw', key: 'rest-h' }, PAGE_WORDS.rest), rows.length ? h('ol', { class: 'v2-rows', key: 'rest-rows' }, rows) : null, detailsNode(p)];
}

/**
 * "Details" (AC83): "Agents and usage · time asked of you · CI · record notes", opening AC55's views as
 * built, so every M1 and M2 view stays reachable (AC36); with the desk's own lines (AC75, AC78), so a
 * cost tap still opens at its line (AC74). A fold, the row its summary (C).
 */
function detailsNode(p) {
  const { project, model } = p;
  const name = project.name;
  return h('details', { class: 'v2-pdetail sb-more', key: 'more-detail-fold', open: openMore === name ? '' : null },
    h('summary', { class: 'v2-prow', key: 'more-detail' }, h('span', { class: 'v2-pmk', 'aria-hidden': 'true' }),
      h('span', { class: 'v2-prt' }, h('span', { class: 'v2-prtt soft' }, PAGE_WORDS.details), h('span', { class: 'v2-small' }, PAGE_WORDS.detailsSmall)), vi('chev', 'v2-k v2-chev')),
    h('section', { class: 'v2-pdbody' },
      // No model yet (nothing read): "not available", never "not recorded" (the Reviewer's N-d, stage 3 round 2).
      h('p', { class: 'v2-small' }, `CI on ${project.defaultBranch}: ${model ? model.ci : NOT_AVAILABLE}`),
      // AC68: a v3 project's Pipeline view folds into the Timeline; its record notes get their own screen.
      h('ul', { class: 'v2-links' },
        project.model === 'v3' ? null : h('li', {}, h('a', { class: 'v2-lnk', href: go('p', name, 'pipeline'), key: 'more:pipeline' }, 'Reduced view and waits')),
        h('li', {}, h('a', { class: 'v2-lnk', href: go('p', name, 'asked'), key: 'more:asked' }, 'Time asked of you')),
        h('li', {}, h('a', { class: 'v2-lnk', href: go('p', name, 'agents'), key: 'more:agents' }, 'Agents: sessions, timeline and usage')),
        project.model === 'v3' && recordNotes(p).length ? h('li', {}, h('a', { class: 'v2-lnk', href: go('p', name, 'notes'), key: 'more:notes' }, `Record notes (${recordNotes(p).length})`)) : null,
        project.model === 'v3' ? h('li', {}, opener('info', go('p', name, 'info'), { class: 'v2-lnk' }, 'About the phases')) : null)),
    // AC75 and AC78: the desk's own lines, the same in every project's Details.
    h('section', { class: 'sb-notify-line', key: 'notify-line' }, h('h3', { class: 'sb-h3' }, 'Notifications'), notifyNode(false)),
    usageNode());
}

/** A v2.5 project's page (frame 8): the waits row, CI, the ledger's latest, the records, then "Not used by this project". */
function v25PageNodes(p, bd) {
  const v = v25Rows(p.project, p.model, p.snap, Date.now(), TZ);
  const name = p.project.name;
  const ledger = treeLink(p.project, p.snap && p.snap.tree, 'docs/LEDGER.md');
  const rows = [...pageTwoRows(p, bd),
    pageRow('page-ci', go('p', name, 'pipeline'), stc(/passing/.test(v.ci) ? 'check' : 'unrec'), v.ci, null),
    pageRow('page-ledger', ledger || go('p', name, 'pipeline'), null, PAGE_WORDS.ledgerLatest, v.latest, { smallCls: 'v2-mono' }),
    pageRow('page-records', go('p', name, 'pipeline'), null, PAGE_WORDS.records, v.records, { smallCls: 'v2-mono', cls: 'soft' })];
  return [h('ol', { class: 'v2-rows', key: 'page-rows' }, rows),
    h('div', { class: 'v2-sh', key: 'notused-h' }, h('h2', { class: 'v2-shw' }, PAGE_WORDS.notUsed), h('span', { class: 'v2-mono' }, PAGE_WORDS.olderPipeline)),
    h('ul', { class: 'v2-notused', key: 'notused' }, v.notUsed.map((x) => h('li', { key: `nu:${x.title}` }, stc('skip'),
      h('span', { class: 'v2-smt' }, h('span', { class: 'v2-nt' }, x.title), h('span', { class: 'v2-nw' }, x.words)))))];
}

/** The page (AC83): its top, the sentence, the strip, the lines under it, the two rows, the milestones by phase, the rest. */
function renderPage(p, bd) {
  const { project } = p;
  const name = project.name;
  const w = pageWaits(p, bd);
  const sentence = pageSentence(p.ctx, { snap: p.snap, waits: w });
  const under = [];
  if (project.model === 'v3') {
    for (const x of ranAgainLines(p.ctx, TZ, bandLookup(p))) {
      under.push(h('p', { class: `v2-small${x.missing ? ' gap' : ''}`, key: x.key }, x.words,
        x.source ? [' · ', x.source.href ? ext(x.source.href, x.source.words, 'v2-inl') : x.source.words] : null));
    }
  }
  const body = [
    h('header', { class: 'v2-ptop', key: 'page-top' }, backControl('#/')),
    h('div', { class: 'v2-phead', key: 'page-head' }, h('h1', { class: 'v2-title' }, name), h('p', { class: 'v2-mono', key: 'top-line' }, topLine(project, p.snap))),
    project.model === 'v3' ? pageSwitch(name, 'overview') : null,
    h('p', { class: 'v2-lead', key: 'sentence' }, sentence),
    stripNode(phaseStrip(p.ctx, p.snap)),
    h('div', { class: 'v2-under', key: 'under' }, under, lastActionNode(p)),
  ];
  if (project.model === 'v3') body.push(h('ol', { class: 'v2-rows', key: 'page-rows' }, pageTwoRows(p, bd)), ...milestonesNode(p), ...restNode(p));
  else body.push(...v25PageNodes(p, bd), detailsNode(p));
  const out = [h('section', { class: 'sb-screen v2 v2-proj', key: 'page' }, body)];
  const back = go('p', name);
  const sheet = nav.route.sheet;
  if (sheet === 'info') {
    out.push(sheetShell(back, 'About the phases', [sheetHead(null, 'About the phases', back),
      h('ol', { class: 'v2-six' }, SIX.map((x) => h('li', {}, x))),
      h('p', { class: 'v2-small' }, 'The desk shows the first four, then Done: where a project stands once you pass its Launch gate. A finished phase reads "Finished".')], 'page-sheet'));
  }
  if (sheet === 'values' || sheet === 'experiments') {
    const rr = restRows(p.j, p.snap && p.snap.tree);
    if (sheet === 'values') {
      const title = rr.values ? rr.values.title : PAGE_WORDS.values;
      out.push(sheetShell(back, title, [sheetHead(null, title, back),
        rr.values ? h('p', { class: 'v2-small' }, `${rr.values.small} · docs/PROJECT.md, section 6`) : null,
        rr.values ? h('ul', { class: 'v2-qlist' }, rr.values.lines.map((l) => h('li', { class: 'v2-quote', key: `vt:${l.id}` }, l.text)))
          : h('p', { class: 'v2-small' }, 'No value targets in docs/PROJECT.md, section 6.')], 'page-sheet'));
    } else {
      out.push(sheetShell(back, PAGE_WORDS.experiments, [sheetHead(null, PAGE_WORDS.experiments, back),
        h('p', { class: 'v2-small' }, `${rr.experiments.small} · experiments/`),
        rr.experiments.names.length ? h('ul', { class: 'v2-qlist v2-explist' }, rr.experiments.names.map((n) => h('li', { class: 'v2-mono ink', key: `exp:${n}` },
          ext(treeLink(project, p.snap.tree, `experiments/${n}.md`), n, 'v2-inl v2-exl') || n)))
          : rr.experiments.read ? h('p', { class: 'v2-small' }, 'No experiment is registered in experiments/.') : null], 'page-sheet'));
    }
  }
  return out;
}

/** "About the phases": the model's six, of which the desk shows four (AC50). */
const SIX = ['Discovery', 'Design', 'Build', 'Launch', 'Operate', 'Review'];
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
  return h('section', { class: 'sb-screen sb-detail' }, projectHeader(name, title), kids);
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
  flag: { vb: 16, d: ['M4 14V2.5', 'M4 3h8l-1.8 3L12 9H4'] },
  you: { vb: 16, fill: ['M8 1.8l6.2 6.2L8 14.2 1.8 8z'] },
  back: { vb: 24, d: ['M15 5l-7 7 7 7'] },
  up: { vb: 16, fill: ['M8 3.5l4.5 7.5h-9z'] },
  down: { vb: 16, fill: ['M8 12.5l4.5-7.5h-9z'] },
  order: { vb: 24, d: ['M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4'] },
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
  // AC56, changed after MD3 (P-001-audit-reload.md, A): the words typed in a sheet's boxes are kept on this device under
  // DRAFTS_KEY, in a store of their own, so a full reload brings them back; where it can't be written, a reload clears them.
  draftsStore: null, draftAt: new Map(),
  loadDrafts(store, nowMs) {
    this.draftsStore = store;
    try {
      const m = readDrafts(store ? store.getJSON(DRAFTS_KEY, null) : null, nowMs);
      this.drafts = new Map([...m].map(([k, e]) => [k, e.text]));
      this.draftAt = new Map([...m].map(([k, e]) => [k, e.at]));
    } catch {
      this.drafts = new Map();
      this.draftAt = new Map();
    }
    this.saveDrafts();
  },
  setDraft(k, text, nowMs) {
    if (text) {
      this.drafts.set(k, text);
      this.draftAt.set(k, nowMs);
    } else {
      // An emptied box drops its words.
      this.drafts.delete(k);
      this.draftAt.delete(k);
    }
    this.saveDrafts();
  },
  dropDrafts(keys) {
    if (!keys.length) return;
    for (const k of keys) {
      this.drafts.delete(k);
      this.draftAt.delete(k);
    }
    this.saveDrafts();
  },
  saveDrafts() {
    try {
      if (!this.draftsStore) return;
      const m = new Map([...this.drafts].filter(([, t]) => t).map(([k, t]) => [k, { text: t, at: this.draftAt.get(k) ?? Date.now() }]));
      if (m.size) this.draftsStore.setJSON(DRAFTS_KEY, draftsRecord(m));
      else this.draftsStore.remove(DRAFTS_KEY);
    } catch {
      // the words stay for this window only; nothing else changes
    }
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
  // AC87 (stage 6b): the portfolio's cards, in a group of their own named "Portfolio", after the projects'.
  // Their marks are judged at each portfolio read that succeeded: confirmed once the card file has left
  // the queue, kicked back after KICK_BACK_MINUTES otherwise.
  if (lastPf) {
    try {
      projects.push(portfolioBoard(nowMs));
    } catch {
      // the portfolio's group can't be drawn: the projects' board stands
    }
  }
  const view = boardView({ projects, marks: boardState.marks, only, nowMs, tz: TZ });
  // Part A item 5 (stage 1a's build review, round 1, F3): before any project is read, or when none can
  // be, an unknown is said in words, never as a 0 or "Nothing here".
  const shown = only ? built.filter((b) => b.project.name === only) : built;
  const readState = (b) => (b.box && b.box.read ? b.box.read.read : null);
  view.unread = shown.some((b) => readState(b) === 'ok') ? null
    : shown.length && shown.every((b) => readState(b) === 'cant-read') ? 'cant' : 'pending';
  // AC89 (a): with one project shown, the view follows that project's own read state (one of the table's five).
  view.one = null;
  const one = only ? built.find((b) => b.project.name === only) : null;
  if (one && one.box) {
    const st = DESK && DESK.states ? DESK.states.get(only) : null;
    view.one = oneProjectView({ name: only, read: one.box.read, lastSuccessAt: st ? st.lastSuccessAt : null, tz: TZ });
    view.unread = view.one.unknown ? (view.one.state === 2 ? 'cant' : 'pending') : null;
  }
  boardState.view = view;
  boardState.cards = new Map(projects.flatMap((p) => p.cards.map((c) => [c.id, c])));
  // AC56, changed: kept words are dropped once their item no longer waits on the owner and its sheet is closed, judged
  // only for a project read successfully (a project not read yet, or failing, keeps them), and after DRAFT_KEEP_DAYS.
  try {
    const present = new Set(projects.flatMap((p) => [...p.cards.map((c) => c.id), ...(p.agents || []).map((a) => a.id),
      ...(p.asking || []).concat(p.answerRecording || []).map((a) => waitKey(p.project.name, 'question', a.path))]));
    const okRead = new Set(built.filter((b) => !b.error && b.box && b.box.read && b.box.read.read === 'ok').map((b) => b.project.name));
    const drop = draftsToDrop(boardState.drafts, { present, readOk: (name) => okRead.has(name), openId: openSheetCard() });
    for (const [k, at] of boardState.draftAt) if (nowMs - at > DRAFT_KEEP_DAYS * 86400e3 && !drop.includes(k)) drop.push(k);
    boardState.dropDrafts(drop);
  } catch {
    // the words stay; nothing else changes
  }
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

/** The card whose sheet is open now (on Waiting, or over Plan), as its id, or null (AC56: its words stay while it is open). */
function openSheetCard() {
  const r = nav.route;
  if (r.kind === 'waiting' && r.sheet) return String(r.sheet).split('#')[0];
  if (r.kind === 'work' && r.sheet && r.sheet.startsWith('card:')) return r.sheet.slice(5);
  return null;
}

/** The board's entry for the portfolio (AC87): its cards from its queue, its marks judged at each of its reads that succeeded. */
function portfolioBoard(nowMs) {
  const cards = portfolioCards(lastPf);
  const current = new Map(cards.map((c) => [c.id, c]));
  const snap = DESK && DESK.portfolio ? DESK.portfolio() : null;
  const success = snap ? snap.lastSuccessAt : null;
  if (!boardState.seen.has(PF_BOARD)) boardState.seen.set(PF_BOARD, []);
  const project = { name: PF_BOARD, label: PF_LABEL, portfolio: true, repo: lastPf.repo, defaultBranch: lastPf.defaultBranch, model: null };
  if (success != null && snap.readAt === success && boardState.judged.get(PF_BOARD) !== success) {
    boardState.judged.set(PF_BOARD, success);
    const ctx = { project, tree: snap.tree || new Map(), pulls: [], files: null, current, agentIds: new Set(), heldIds: new Set(), recordingNames: new Set() };
    const next = judgeMarks(boardState.marks, project, ctx, nowMs);
    if (JSON.stringify(next) !== JSON.stringify(boardState.marks)) boardState.set(next);
    // A card seen to leave the queue while the page was open moves to Done by itself.
    const prev = boardState.prev.get(PF_BOARD);
    if (prev) {
      for (const [id, c] of prev) {
        if (current.has(id) || boardState.marks.marks[id]) continue;
        boardState.seen.get(PF_BOARD).push({ id, step: 'open', title: c.title, at: nowMs, kind: 'portfolio', code: c.file });
      }
    }
    boardState.prev.set(PF_BOARD, current);
  }
  return { project, cards, agents: [], read: { ok: lastPf.fresh, cantRead: false, since: null, words: null },
    recording: [], asking: [], answerRecording: [], recordRows: [], seenRows: boardState.seen.get(PF_BOARD) };
}

/**
 * Sandbox's screen state (the state line and the tab title): Quiet also needs no card in the portfolio's queue
 * and the portfolio read within its 6 minutes (Terms, from 6b); with no `portfolio` in J7, the projects' own
 * (universe.js `screenState`). Review round 2, B3: a portfolio card is counted as a project's is, never set
 * beside "Quiet".
 */
function withPortfolio(s, boxes, signedOut) {
  if (!lastPf || !s || s.text === SIGNED_OUT_STATE.text) return s;
  // Each card in the portfolio's queue, marked Done here or not, as screenState counts a project's flagged
  // items (marks are this device's only, AC80): it counts until its file has left the queue (Design review
  // round 1, F1); the board's own counts leave marked cards out, so they are not used here.
  return portfolioScreenState(boxes, signedOut, lastPf, lastPf.cards.length);
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
  const icon = lane === 'kick' ? 'kick' : card.kind === 'portfolio' ? 'card' : card.kind;
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
  // A gate card's step is its four buttons (P-001-gate-buttons.md, A), on its Done card too while it is
  // confirming (P-001-board-done-button.md, A); it has no one label of its own.
  if (s.gate) return h('span', { class: 'v2-gatebtns', key: `gatebtns:${card.id}:${lane}` }, card.buttons.map((b) => answerLink(p, card, b, 'v2-step', [b.label])));
  // Its key is the opener, so closing the sheet gives the focus back to this step (AC85: "focus going back to the card").
  if (s.opensSheet) return h('a', { class: 'v2-step', href: cardRoute(boardState.view && boardState.view.only, card.id), key: `step:${card.id}`, onclick: () => { nav.opener = `step:${card.id}`; } }, s.label);
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
    const n = String(laneKey === 'done' ? g.all.length : g.rows.length);
    // AC87: the portfolio's group, "Portfolio", is not a project, so its name shows no single project (a heading, not a control).
    const head = only ? null : g.portfolio ? h('p', { class: 'v2-grp pf', key: `grp:${laneKey}:${g.project}` }, vi('proj'), h('span', { class: 'v2-gn' }, g.label), h('span', { class: 'v2-gc' }, n))
      : h('button', { type: 'button', class: 'v2-grp', key: `grp:${laneKey}:${g.project}`, 'aria-label': `Show only ${g.project}`,
        onclick: () => nav.to(go('waiting', g.project)) }, vi('proj'), h('span', { class: 'v2-gn' }, g.project), h('span', { class: 'v2-gc' }, n));
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
      laneKey === 'done' ? WORDS.emptyDone : bd.one ? bd.one.empty
        : unknown ? (bd.unread === 'cant' ? BOARD_UNREAD.cant : BOARD_UNREAD.pending) : WORDS.empty));
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
    // A count of 0 is words, not a control: a quiet line opens a fold only when it has any (AC89 (a); AC80).
    const small = (k, words, n) => {
      const open = boardState.folds.has(k);
      if (!n) return `${words}: ${n}`;
      return h('button', { type: 'button', class: 'v2-qs', key: `ql:${k}`, 'aria-expanded': open ? 'true' : 'false',
        onclick: () => { if (open) boardState.folds.delete(k); else boardState.folds.add(k); render(); } }, `${words}: ${n}`);
    };
    const one = bd.one;
    if (one && one.counts !== 'read') {
      // AC89 (a): state 4 (not fresh after a read) says "checking…" for the two counts, as main did; states 1, 2
      // and 5 have no such line (the table: nothing above the lanes, or the "Can't read" line there instead).
      if (one.counts === 'checking') lines.push(h('p', { class: 'v2-small v2-qsmall unknown', key: 'qsmall' }, `${WORDS.agents}: ${ONE_WORDS.countsChecking} · ${WORDS.recording}: ${ONE_WORDS.countsChecking}`));
    } else if (!one && bd.unread) {
      // The project not read yet, or not readable: no count for an unknown (Part A item 5; stage 1a's
      // build review, round 2, N1 and F3-r2), the words only, with no fold to open. Only the two counts
      // take them: the held question's and the recorded answer's lines still follow (round 3, finding 1).
      // A project read earlier in this opening and now re-checking says AC5's "checking…" (round 3, finding 2).
      const w = bd.unread === 'cant' ? BOARD_UNREAD.cant.toLowerCase() : DESK && DESK.states && DESK.states.get(only) && DESK.states.get(only).lastSuccessAt != null ? 'checking…' : BOARD_UNREAD.pending.toLowerCase();
      lines.push(h('p', { class: 'v2-small v2-qsmall unknown', key: 'qsmall' }, `${WORDS.agents}: ${w} · ${WORDS.recording}: ${w}`));
    } else {
      lines.push(h('p', { class: 'v2-small v2-qsmall', key: 'qsmall' },
        small('agents', WORDS.agents, q.agents.length), ' · ', small('recording', WORDS.recording, q.recording.length)));
      if (boardState.folds.has('agents')) lines.push(h('div', { class: 'v2-qfold', key: 'fold:agents', role: 'region', 'aria-label': WORDS.agents }, agentsFold()));
      if (boardState.folds.has('recording')) lines.push(h('div', { class: 'v2-qfold', key: 'fold:recording', role: 'region', 'aria-label': WORDS.recording }, recFold()));
    }
  } else {
    if (q.agents.length) lines.push(quietLine('agents', 'agents', WORDS.agents, q.agents.length, agentsFold));
    if (bd.nothingWaiting.length) lines.push(h('p', { class: 'v2-ql still', key: 'ql:nothing' }, vi('eye'), h('span', {}, `${WORDS.nothing}: ${bd.nothingWaiting.join(', ')}`)));
    for (const c of bd.cantRead) lines.push(h('p', { class: 'v2-ql still bad', key: `ql:cant:${c.project}` }, vi('bad'), h('span', {}, `Can't read ${c.project} since ${hhmm(new Date(c.since), TZ)}`)));
    // AC87 (stage 6b; J23's failures): the portfolio's read that isn't current, in its own words, never a project's.
    if (lastPf && lastPf.problem && lastPf.state !== 'pending') lines.push(h('p', { class: 'v2-ql still bad', key: 'ql:cant:portfolio' }, vi('bad'), h('span', {}, lastPf.problem)));
    if (q.recording.length) lines.push(quietLine('recording', 'eye', WORDS.recording, q.recording.length, recFold));
  }
  if (q.asking.length) lines.push(quietLine('asking', 'clock', WORDS.asking, q.asking.length, askFold));
  if (q.answerRecording.length) lines.push(quietLine('answerRecording', 'clock', WORDS.answerRecording, q.answerRecording.length, ansFold));
  return lines.length ? h('div', { class: `v2-quiet${only ? ' under' : ''}`, key: 'quiet' }, lines) : null;
}

/** The Waiting tab (AC80, frames 1 and 2): the title, "checked <age> ago", the quiet lines, the lanes; a card's sheet over it. */
function renderWaiting(bd, built, only, sheetId) {
  const name = only && built.some((b) => b.project.name === only) ? only : null;
  // AC89 (a): with one project shown, the line under the title is that project's own ("Checking…", "Not read in
  // this opening", or "checked <age> ago" from its own last read in this opening).
  const one = name ? bd.one : null;
  const body = [
    h('header', { class: 'v2-top' }, h('h1', { class: 'v2-title' }, 'Waiting')),
    h('p', { class: 'v2-sub', live: one ? () => one.under(Date.now()) : checkedWords })];
  if (name) {
    body.push(h('div', { class: 'v2-filter', key: 'filter' }, h('span', { class: 'v2-chip' }, vi('proj'), h('span', {}, name),
      h('button', { type: 'button', class: 'v2-x', key: 'chip-x', 'aria-label': 'Show all projects', onclick: () => nav.replace('#/waiting') }, vi('x'))),
    h('span', { class: 'v2-small' }, `1 of ${bd.of} project${bd.of === 1 ? '' : 's'}`)));
    // AC89 (a), states 2 and 5: "Can't read <project> since HH:MM", with AC5's reason in words, above the lanes.
    if (one && one.cant) body.push(h('div', { class: 'v2-quiet', key: 'quiet-cant' }, h('p', { class: 'v2-ql still bad', key: `ql:cant:${name}` }, vi('bad'), h('span', {}, one.cant))));
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
function wordsBox(id, label, n = 1, placeholder = SHEET_WORDS.optional) {
  const k = `${id}#${n}`;
  const ta = h('textarea', { rows: '3', key: `words:${k}`, class: 'v2-input', 'aria-label': label, placeholder,
    oninput: (e, self) => { boardState.setDraft(k, self.value, Date.now()); render(); } });
  ta.value = boardState.drafts.get(k) || '';
  return h('label', { class: 'v2-field', key: `field:${k}` }, h('span', { class: 'v2-label' }, label), ta);
}
const draftOf = (id, n = 1) => boardState.drafts.get(`${id}#${n}`) || '';

/**
 * AC17 and AC18 on a sheet, before its buttons (AC53: "every link follows AC53's 'When it would not fit' ... and
 * AC18's message where `webCommitsToDefault` is `false`, as today", specs/S-001.md:6077-6080; the accepted card view
 * drew them until stage 8, AC44 step 4): J7's web-commit message, word for word; and where a button's link copies,
 * the words naming why with that answer's text and its "Copy". The words are lib/links.js's and lib/sandbox.js's.
 */
function linkNotes(card, btns) {
  const plans = btns.map((b) => b.plan).filter(Boolean);
  const warn = plans.find((x) => x.warning);
  const copies = btns.filter((b) => b.plan && b.plan.copy);
  const out = [];
  // Its mark the sheet's neutral note mark (the eye, as on the blast-radius line), never ✕ (the Design reviewer, stage 8 round 1).
  if (warn) out.push(h('p', { class: 'v2-mark v2-webwarn', key: 'web-warn', role: 'note' }, vi('eye'), h('span', {}, warn.warning)));
  if (copies.length) {
    out.push(h('div', { class: 'v2-blk v2-copyto', key: 'copy-route' }, h('p', { class: 'v2-small' }, copies[0].plan.words),
      copies.map((b) => [h('pre', { class: 'v2-pre', key: `copytext:${b.value || ''}` }, b.plan.copy),
        h('p', { class: 'v2-steps', key: `copybtn:${b.value || ''}` }, copyButton(b.plan.copy, `ans:${card.id}:${b.value || ''}`, copies.length > 1 ? `Copy ${b.value}` : 'Copy', 'v2-abtn'))])));
  }
  return out;
}

// ---------------------------------------------------------------------------
// The question's and the gate's sheets (AC85; frames 3, 3b and 4; stage 4): what is asked in plain
// words, whether it can be undone or settles itself, each choice in its own box with what follows and
// its own button opening AC80's filled-in file, the recommendation labelled and never picked, a 16 px
// box for the owner's own words, "Move to Done", and the whole record one tap away. The words are
// lib/sheets.js's; every file a button opens is still board.js's answerButtons'.

/** Each sheet head's kind word (AC85: "<project> · <kind> · …", frames 3, 3b and 4 in lower case). */
const HEAD_KIND = { question: 'question', gate: 'gate', card: 'decision', missing: 'decision', pr: 'pull request', deploy: 'deploy', hold: 'hold', merge: 'merge card' };

/** AC66: the milestone it unblocks, its why, and the facts behind the ask one tap away. */
function unblocksNode(p, card, row) {
  const project = p.project;
  const u = unblocksOf(p.ctx, row);
  const ck = `ctx:${card.key}`;
  const open = isOpenFold(project.name, ck, false);
  return h('div', { class: 'v2-blk', key: `unb:${card.key}` },
    u.none ? h('p', { class: 'v2-body v2-unb-l' }, `Unblocks no milestone: ${u.none}`)
      : u.missing ? h('p', { class: 'v2-body v2-unb-l gap' }, 'Unblocks: milestone not recorded')
        : u.milestones.map((m) => [h('p', { class: 'v2-body v2-unb-l' }, h('span', { class: 'v2-label' }, 'Unblocks'), ' ', m.name ? h('b', {}, m.name) : null, ' ', h('span', { class: 'v2-mono' }, m.code),
          u.byPr ? h('span', { class: 'v2-small' }, ' · named by its pull request, not yet in the plan') : null),
        m.why ? h('p', { class: 'v2-quote v2-wl' }, h('span', { class: 'v2-label' }, 'Why'), ' ', h('span', {}, m.why.text), h('span', { class: 'v2-src' }, m.why.source))
          : h('p', { class: 'v2-small v2-wl gap' }, 'Why not recorded yet · for the agents to add')]),
    foldButton(project.name, ck, false, { class: 'v2-fold' }, 'Context · the facts behind this ask'),
    open ? (u.context ? h('ul', { class: 'v2-facts', key: `facts:${card.key}` }, u.context.map((c) => h('li', {}, c.fact, c.exception ? null : h('span', { class: 'v2-src' }, c.source || 'source not recorded'))))
      : h('p', { class: 'v2-small gap', key: `facts:${card.key}` }, 'Context: not recorded')) : null);
}

/**
 * Text held to three lines (AC85: the question's opening and the gate's case, "three lines at most,
 * faded at the cut", P-001-tile-summary-clip.md's rule): the browser measures whether it runs past
 * them (`measureClips`, as the tile's summary); only then is it faded, with "Read it all" under it
 * opening the whole in place (`toggle`; the gate's case is a link to the whole case instead). Three
 * lines or fewer: shown whole, no fade, no control. Opened, it stays open through every refresh (AC56).
 */
const clipOver = new Map();
const clipOpen = new Set();
function clipNode(id, text, cls, toggle = true) {
  const over = clipOver.get(id) === true;
  const open = over && clipOpen.has(id);
  const box = h('div', { class: `v2-clip ${cls}${over && !open ? ' over' : ''}${open ? ' open' : ''}`, key: `clip:${id}`, 'data-clip': id }, text);
  if (!over || !toggle) return box;
  return [box, h('button', { type: 'button', class: 'v2-fold', key: `clipbtn:${id}`, 'aria-expanded': open ? 'true' : 'false',
    onclick: () => {
      if (clipOpen.has(id)) clipOpen.delete(id);
      else clipOpen.add(id);
      render();
    } }, open ? SHEET_WORDS.readLess : SHEET_WORDS.readAll, vi(open ? 'chevdown' : 'chev'))];
}

/**
 * A card's words with their `code` drawn as code (the card's own Markdown, as its whole record renders it):
 * each pair of backticks becomes a code element holding the words between, as text; a lone backtick stays.
 */
function codeWords(text) {
  const parts = String(text).split('`');
  if (parts.length < 3) return text;
  const out = [];
  parts.forEach((t, i) => {
    if (i % 2 === 1 && i < parts.length - 1) out.push(h('code', { class: 'v2-code' }, t));
    else out.push(i % 2 === 1 ? `\`${t}` : t);
  });
  return out;
}

/** A sheet's state under its head: kicked back with its reason, or confirming, with a two-step pull request's step; the step 2 note. */
function sheetState(sx) {
  const { card, lane, pending, kicked, k2 } = sx;
  return [lane === 'kick' || pending ? h('p', { class: 'v2-small', key: 'sheet-state' }, `${lane === 'kick' ? 'Kicked back' : WORDS.confirming}${k2}`) : null,
    kicked ? h('p', { class: 'v2-mark', key: 'kicked' }, vi('kick'), h('span', {}, kicked.reason)) : null,
    card.note ? h('p', { class: 'v2-mark', key: 'note' }, vi('done'), h('span', {}, card.note)) : null];
}

/**
 * "✓ Move to Done · then answer on GitHub" (AC85, AC80's "Done ✓" with frame 3's words), from Waiting
 * on you or Kicked back; "Undo" while it is confirming. Then "▸ <the whole record> · and the file each
 * answer writes": the file rendered whole (AC12) and each button's path, branch and text, exactly as
 * its link carries it, so the owner can see what a tap commits. The fold is kept through every refresh.
 */
function sheetList(sx, wholeWords, fullText, files) {
  const { p, card, back, pending } = sx;
  const name = p.project.name;
  const fk = `whole:${card.id}`;
  const open = isOpenFold(name, fk, false);
  const toggle = () => {
    setFold(name, fk, !isOpenFold(name, fk, false));
    render();
  };
  const done = pending
    ? h('button', { type: 'button', class: 'v2-sitem', key: 'sheet-undo', onclick: () => { boardState.set(undoMark(boardState.marks, card.id)); render(); } }, vi('kick'), h('span', {}, 'Undo'))
    : h('button', { type: 'button', class: 'v2-sitem', key: 'sheet-done', onclick: () => { markCard(card); nav.to(back); } },
      vi('done'), h('span', {}, SHEET_WORDS.moveToDone), h('span', { class: 'v2-sv' }, h('span', { class: 'sb-vh' }, ' · '), SHEET_WORDS.moveToDoneThen));
  const fold = h('button', { type: 'button', class: 'v2-sitem', key: `fold:${fk}`, 'aria-expanded': open ? 'true' : 'false', onclick: toggle },
    vi(open ? 'chevdown' : 'chev'), h('span', {}, wholeWords), h('span', { class: 'v2-sv' }, h('span', { class: 'sb-vh' }, ' · '), SHEET_WORDS.wholeThen));
  return h('div', { class: 'v2-slist', key: 'slist' }, done, fold,
    open ? h('div', { class: 'v2-whole', key: `wholebody:${card.id}` },
      fullText ? h('article', { class: 'sb-record', key: 'whole-record', html: renderMarkdown(fullText, { numbers: true }) }) : h('p', { class: 'v2-small gap' }, `The file: ${NOT_AVAILABLE}`),
      h('ul', { class: 'v2-files', key: 'whole-files' }, files.map((f) => h('li', { key: `file:${f.label}` },
        h('p', { class: 'v2-small' }, h('b', {}, f.label), f.path ? [` ${SHEET_WORDS.writes} `, h('span', { class: 'v2-mono' }, f.path), ` ${SHEET_WORDS.atBranch} `, h('span', { class: 'v2-mono' }, f.branch)] : ` ${SHEET_WORDS.copies}`),
        h('pre', { class: 'v2-pre' }, f.text))))) : null);
}

/**
 * One step down at the sheet's foot, below what frames 3, 3b and 4 draw (C: no frame draws them):
 * AC66's "Unblocks" with its why and Context fold, why it is here (a card's), what was checked (AC52,
 * AC29) and the record's links.
 */
function sheetFoot(sx, why, unblocks = null) {
  const { v } = sx;
  return h('div', { class: 'v2-blk v2-foot', key: 'sheet-foot' }, unblocks,
    why ? h('p', { class: 'v2-small', key: 'foot-why' }, h('span', { class: 'v2-fk' }, 'Why it is here: '), codeWords(why)) : null,
    h('p', { class: 'v2-small', key: 'foot-checked' }, h('span', { class: 'v2-fk' }, 'What was checked: '), v.checked),
    v.links && v.links.length ? h('p', { class: 'v2-small', key: 'links' }, v.links.map((l, i) => [i ? ' · ' : '', ext(l.href, l.text, 'v2-lnk') || `${l.text}: no file recorded`])) : null);
}

/** A question's sheet (AC85; frames 3 and 3b). */
function questionSheetParts(sx) {
  const { p, card, row, back, fromTap, headMeta } = sx;
  const project = p.project;
  const q = card.flag.question;
  const p0 = q.parsed;
  const parts = [sheetHead(headMeta, card.title, back), fromTap, sheetState(sx)];
  // Its opening: the first paragraph of its WHY, in --t-lead, three lines at most, the whole one tap away.
  parts.push(p0 ? clipNode(`why:${card.id}`, whyOpening(p0), 'v2-lead') : h('p', { class: 'v2-small gap', key: 'why-reading' }, `The question file: ${NOT_AVAILABLE}`));
  // Whether it can be undone, or settles itself, by icon and words (AC38), and its blast radius and risk.
  if (p0) {
    const u = undoLine(p0, card.raisedAt, TZ);
    parts.push(h('div', { class: 'v2-marks', key: 'marks' },
      h('p', { class: `v2-mark ${u.kind}`, key: 'undo' }, u.icon ? vi(u.icon) : h('span', { 'aria-hidden': 'true' }), h('span', {}, u.bold ? h('b', {}, u.bold) : null, u.text)),
      h('p', { class: 'v2-mark', key: 'blast' }, vi('eye'), h('span', {}, blastLine(p0)))));
  }
  let files = [];
  if (!card.v25) {
    const qs = p0 ? questionQuestions(p0.text, p0.title) : null;
    if (qs && qs.form === 'numbered') {
      // One box per question (P-001-sheet-boxes.md, A): each number, its recommendation and its own box; one "Answer ↗".
      const words = Object.fromEntries(qs.questions.map((x) => [x.n, draftOf(card.id, x.n)]));
      parts.push(h('div', { class: 'v2-opts', key: 'numbered' }, qs.questions.map((x) => h('div', { class: 'v2-opt num', key: `q:${x.n}` },
        h('div', { class: 'v2-ot' }, h('span', { class: 'v2-ol' }, `${x.n}. ${x.text}`), x.recommendation ? h('span', { class: 'v2-od' }, [h('span', { class: 'v2-rec' }, SHEET_WORDS.recommended), ' ', x.recommendation]) : null),
        wordsBox(card.id, `Your answer to ${x.n}`, x.n)))));
      const btn = answerButtons(project, card.flag, CONFIG.linkCap, words)[0];
      files = [btn];
      parts.push(linkNotes(card, [btn]));
      parts.push(h('p', { class: 'v2-steps', key: 'numbered-btn' }, answerLink(p, card, btn, 'v2-abtn', [btn.label])));
    } else {
      const btns = answerButtons(project, card.flag, CONFIG.linkCap, draftOf(card.id));
      files = btns;
      if (qs && qs.form === 'fallback') {
        // AC53's one-box fallback: the line saying so, the file shown whole, its link (at the foot) and one box.
        parts.push(h('p', { class: 'v2-small', key: 'cant-split' }, `${CANT_SPLIT} (${qs.why}).`));
        parts.push(h('article', { class: 'sb-record', key: 'fallback-text', html: renderMarkdown(p0.text, { numbers: true }) }));
      }
      parts.push(linkNotes(card, btns));
      // One box per option: "<letter>. <its words>", the description under it, "Recommended" on one only, its own button.
      parts.push(h('div', { class: 'v2-opts', key: 'opts', role: 'list' }, btns.map((b) => {
        const c = splitChoice(b.words);
        return h('div', { class: 'v2-opt', role: 'listitem', key: `opt:${b.value || 'one'}` },
          // P-001-answer-choice-spacing: the letter its own element, set apart from its words by a real space.
          h('div', { class: 'v2-ot' }, b.value ? [h('span', { class: 'v2-ol' }, h('b', { class: 'v2-letter' }, `${b.value}.`), ' ', h('span', { class: 'v2-ow' }, c.words)),
            c.desc ? h('span', { class: 'v2-od' }, c.desc) : null]
            : h('span', { class: 'v2-ol' }, 'Your ruling, in your own words'),
          b.recommended ? h('span', { class: 'v2-rec' }, SHEET_WORDS.recommended) : null),
          answerLink(p, card, b, 'v2-abtn', [b.label]));
      })));
      parts.push(recLine(p0));
      parts.push(wordsBox(card.id, SHEET_WORDS.words));
    }
  } else {
    // A v2.5 question: AC19's copy route, as today (AC53).
    const letters = p0 ? p0.options.map((o) => o.letter) : [];
    parts.push(h('p', { class: 'v2-small', key: 'v25-note' }, V25_RULING_NOTE));
    parts.push(h('div', { class: 'v2-opts', key: 'opts' }, (letters.length ? letters : ['']).map((l) => {
      const text = composeAnswer({ kind: 'question', name: card.name, qs: { form: 'lettered', title: card.title, block: optionsBlock(p0 ? p0.text : '').lines, questions: [] } },
        { 1: { choice: l, words: draftOf(card.id) } }).text;
      files.push({ label: l ? `Copy answer ${l}` : 'Copy the answer', text });
      const c = splitChoice(l ? (p0.options.find((o) => o.letter === l) || {}).text || '' : '');
      return h('div', { class: 'v2-opt', key: `opt:${l}` }, h('div', { class: 'v2-ot' },
        l ? [h('span', { class: 'v2-ol' }, h('b', { class: 'v2-letter' }, `${l}.`), ' ', h('span', { class: 'v2-ow' }, c.words)), c.desc ? h('span', { class: 'v2-od' }, c.desc) : null]
          : h('span', { class: 'v2-ol' }, 'Your ruling')),
        copyButton(text, `v25:${card.id}:${l}`, l ? `Copy answer ${l}` : 'Copy the answer', 'v2-abtn'));
    })));
    parts.push(recLine(p0));
    parts.push(wordsBox(card.id, SHEET_WORDS.words));
  }
  if (files.length && files[0].form === 'numbered') parts.push(recLine(p0));
  parts.push(sheetList(sx, SHEET_WORDS.wholeQuestion, p0 ? p0.text : null, buttonFiles(files, project.defaultBranch)));
  parts.push(sheetFoot(sx, null, project.model === 'v3' ? unblocksNode(p, card, row) : null));
  return parts;
}

/** AC80's why line for a question, under its boxes: "Recommended: <the RECOMMENDATION: line's words>", or "No recommendation given". */
function recLine(p0) {
  const rec = p0 && p0.recommendation;
  return h('p', { class: 'v2-small', key: 'rec-line' }, rec ? `Recommended: ${rec}` : 'No recommendation given');
}

/** A gate's sheet (AC85; frame 4; P-001-gate-card.md, A). */
function gateSheetParts(sx) {
  const { p, card, row, v, back, fromTap, headMeta } = sx;
  const project = p.project;
  const c = card.flag.card;
  const doc = p.j && p.j.projectDoc ? p.j.projectDoc : null;
  const parts = [sheetHead(headMeta, gateTitle(c), back), fromTap, sheetState(sx)];
  // "The case opens": its plain-English opening, quoted, three lines at most, faded; the whole case one tap away.
  const g = v.gate || {};
  parts.push(blk(SHEET_WORDS.caseOpens, clipNode(`case:${card.id}`, g.opening || NOT_RECORDED, 'v2-quote', false),
    g.caseLink ? ext(g.caseLink, SHEET_WORDS.wholeCase, 'v2-lnk') : h('p', { class: 'v2-small gap' }, SHEET_WORDS.noCase)));
  // "Their views": the Critic's verdict word and its line, and the user representative's where one runs.
  const rows = viewRows(c.parsed ? c.parsed.text : '', doc ? doc.ownerIsUser === true : null);
  parts.push(blk(SHEET_WORDS.views, h('div', { class: 'v2-verd', key: 'views' }, rows.map((r) => [h('span', { class: 'v2-vw' }, r.who), h('span', { class: `v2-vt${r.gap ? ' gap' : ''}` }, r.text)])),
    g.criticLink ? ext(g.criticLink, SHEET_WORDS.criticView, 'v2-lnk') : null));
  // The phase's standard milestones as the project's lines give them (AC61).
  parts.push(h('p', { class: 'v2-small', key: 'std-line' }, standardLine(c.gate, doc)));
  // The four choices (and any older words the card lists), each in its box with what follows, "Recommended"
  // on the case's recommendation, a lock and "Can't be undone" on Kill, and its own button.
  const btns = answerButtons(project, card.flag, CONFIG.linkCap, draftOf(card.id), { caseRec: card.caseRec });
  parts.push(linkNotes(card, btns));
  parts.push(h('div', { class: 'v2-opts', key: 'opts', role: 'list' }, btns.map((b) => {
    const then = (v.options || []).find((o) => o.value === b.value);
    const kill = b.value === 'kill';
    return h('div', { class: 'v2-opt', role: 'listitem', key: `opt:${b.value}` },
      h('div', { class: 'v2-ot' }, h('span', { class: 'v2-ol' }, b.label), h('span', { class: 'v2-od' }, then ? codeWords(then.then) : NOT_RECORDED),
        b.recommended ? h('span', { class: 'v2-rec' }, SHEET_WORDS.recommended) : null,
        kill ? h('span', { class: 'v2-mk v2-undo1', key: 'kill-lock' }, vi('lock'), h('span', {}, SHEET_WORDS.cantUndo)) : null),
      answerLink(p, card, b, `v2-abtn${kill ? ' danger' : ''}`, [`${b.label} ↗`]));
  })));
  // "Your reason": the `Reason: ` line for Hold and Recycle (decisions/README.md:13), after a blank line for Proceed and Kill.
  parts.push(wordsBox(card.id, SHEET_WORDS.reason, 1, SHEET_WORDS.reasonPlaceholder));
  parts.push(sheetList(sx, SHEET_WORDS.wholeCard, c.parsed ? c.parsed.text : null, buttonFiles(btns, project.defaultBranch)));
  parts.push(sheetFoot(sx, v.why, project.model === 'v3' ? unblocksNode(p, card, row) : null));
  return parts;
}

function cardSheet(bd, built, only, sheetId, backTo = null) {
  // AC89 (i): a sheet closes back to the screen it was opened from (Waiting, or Plan for a gate's sheet opened there).
  const back = backTo || boardRoute(only);
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
  if (card.portfolio) return portfolioCardSheet(card, mark, back, fromTap, sheetId);
  const p = built.find((b) => b.project.name === card.project);
  const project = p.project;
  const row = (p.q0 || p.q).rows.find((x) => x.flag && x.flag.key === card.key) || (p.q0 || p.q).deploys.find((x) => x.flag && x.flag.key === card.key)
    || { key: card.key, text: card.title, code: null, wait: null, flag: card.flag, raisedAt: card.raisedAt };
  const v = sheetView(project, p.model, p.snap, p.j, row);
  const pending = mark && mark.confirmedAt == null && !mark.kicked;
  const kicked = mark && mark.confirmedAt == null && mark.kicked ? mark.kicked : null;
  const lane = pending ? 'done' : kicked ? 'kick' : 'wait';
  const k2 = card.step && card.step.twoStep ? ` · step ${card.step.twoStep} of 2` : '';
  // AC85 (every sheet): "<project> · <kind> · <its name or id> · <milestone> · waiting <age>", each part
  // only when its record gives it; the wait from its raised time, or "wait not recorded" (AC52).
  const u0 = project.model === 'v3' && ['question', 'card', 'gate', 'pr'].includes(card.kind) ? unblocksOf(p.ctx, row) : null;
  const msPart = u0 && u0.milestones && u0.milestones.length ? u0.milestones.map((m) => m.code).join(', ') : null;
  const headMeta = () => headText([project.name, HEAD_KIND[card.kind] || card.kindWord.toLowerCase(), card.kind === 'question' ? card.name : card.meta[0] || null, msPart,
    card.raisedAt != null ? `waiting ${boardAge(Date.now() - card.raisedAt)}` : 'wait not recorded']);
  if (card.kind === 'question' || card.kind === 'gate') {
    const sx = { p, card, row, v, back, lane, pending, kicked, fromTap, headMeta, k2 };
    return sheetShell(back, card.kind === 'gate' ? gateTitle(card.flag.card) : card.title, card.kind === 'gate' ? gateSheetParts(sx) : questionSheetParts(sx), `sheet:${sheetId}`);
  }
  const parts = [sheetHead(headMeta, card.title, back), fromTap,
    h('p', { class: 'v2-small' }, `${lane === 'kick' ? 'Kicked back' : pending ? WORDS.confirming : card.kindWord}${k2}`),
    kicked ? h('p', { class: 'v2-mark' }, vi('kick'), h('span', {}, kicked.reason)) : null,
    card.note ? h('p', { class: 'v2-mark' }, vi('done'), h('span', {}, card.note)) : null];
  // What it is, why it's here, what was checked (AC52), each from its record.
  parts.push(blk('What it is', h('p', { class: 'v2-body' }, v.what || card.title, ' ', v.code ? h('span', { class: 'v2-mono' }, v.code) : null)));
  // A card's question, from its "## 1." section (AC53).
  if (card.kind === 'card' && v.question) parts.push(blk('The question', h('p', { class: 'v2-lead', key: 'card-q' }, v.question)));
  if (card.kind === 'deploy') {
    const dr = deployRows(project, p.snap).find((x) => x.run && card.deploy && x.run.runNumber === card.deploy.runNumber && x.run.path === card.deploy.path);
    parts.push(blk('Why it is here', h('p', { class: 'v2-body' }, v.why)));
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
  if (project.model === 'v3' && ['card', 'pr'].includes(card.kind)) parts.push(unblocksNode(p, card, row));
  if (v.noAnswer) parts.push(blk('What you do', h('p', { class: 'v2-body' }, v.noAnswer)));
  // The why line (AC80), and GitHub's owner check whenever J22 has read it.
  if (card.kind === 'pr') {
    if (card.why) parts.push(h('p', { class: 'v2-body', key: 'why-line' }, card.why));
    if (card.check != null) parts.push(h('p', { class: 'v2-small', key: 'owner-check' }, `GitHub's owner check: ${card.check}`));
  }
  if (card.kind === 'card') {
    const rec = v.recommendation;
    parts.push(h('p', { class: 'v2-body', key: 'rec-line' }, rec ? [h('span', { class: 'v2-rec' }, 'Recommended'), ' ', rec] : 'No recommendation given'));
  }
  // The buttons, in full: one per option, each opening a fully filled-in file (the box's words in it).
  if (card.kind === 'card') {
    // A decision card's sheet keeps stage 1a's form (AC80); AC85 lays out the question's and the gate's.
    const btns = answerButtons(project, card.flag, CONFIG.linkCap, draftOf(card.id));
    parts.push(linkNotes(card, btns));
    parts.push(h('div', { class: 'v2-opts', key: 'opts', role: 'list' }, btns.map((b) => {
      const then = (v.options || []).find((o) => o.value === b.value);
      return h('div', { class: 'v2-opt', role: 'listitem', key: `opt:${b.value}` },
        h('div', { class: 'v2-ot' }, h('span', { class: 'v2-ol' }, b.value), h('span', { class: 'v2-od' }, then ? codeWords(then.then) : NOT_RECORDED),
          b.recommended ? h('span', { class: 'v2-rec' }, 'Recommended') : null),
        answerLink(p, card, b, 'v2-abtn', [b.label]));
    })));
    parts.push(wordsBox(card.id, SHEET_WORDS.words));
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

/**
 * A portfolio card's sheet (AC87): the card's sections as AC52 shows a card's (what it is, the question, why
 * it is here, each option with what follows, the recommendation, the whole record), its step "Open on
 * GitHub ↗" opening the card file, no answer link (C: no portfolio answer form is read, J23), the phone
 * note, "Done ✓" (confirmed once the file has left the queue) or "Undo", and "Close".
 */
function portfolioCardSheet(card, mark, back, fromTap, sheetId) {
  const pending = mark && mark.confirmedAt == null && !mark.kicked;
  const kicked = mark && mark.confirmedAt == null && mark.kicked ? mark.kicked : null;
  const pfProject = { name: PF_LABEL, repo: lastPf ? lastPf.repo : '', defaultBranch: lastPf ? lastPf.defaultBranch : 'main' };
  const snap = DESK && DESK.portfolio ? DESK.portfolio() : null;
  const tree = (snap && snap.tree) || new Map();
  const row = { key: card.key, text: card.title, code: null, wait: null, raisedAt: null,
    flag: { kind: 'card', key: card.key, card: { path: card.path, answerPath: null, gate: null, n: null, item: null, parsed: card.rec } } };
  const v = sheetView(pfProject, null, { tree }, null, row);
  // AC85's head: "<project> · <kind> · <its name> · <milestone> · …", its milestone from the card's own `Milestone:` line when it has one (J23).
  const headMeta = headText(['portfolio', 'decision', card.file, cardMilestone(card.rec), 'wait not recorded']);
  const parts = [sheetHead(headMeta, card.title, back), fromTap,
    h('p', { class: 'v2-small' }, kicked ? 'Kicked back' : pending ? WORDS.confirming : card.kindWord),
    kicked ? h('p', { class: 'v2-mark' }, vi('kick'), h('span', {}, kicked.reason)) : null,
    card.note ? h('p', { class: 'v2-mark', key: 'pf-note' }, vi('bad'), h('span', {}, card.note)) : null,
    blk('What it is', h('p', { class: 'v2-body' }, PF_WORDS.whatItIs, ' ', h('span', { class: 'v2-mono' }, card.path)))];
  if (card.rec) {
    parts.push(blk('The question', h('p', { class: 'v2-lead', key: 'pf-q' }, v.question)));
    parts.push(blk('Why it is here', h('p', { class: 'v2-body' }, v.why || NOT_RECORDED)));
    parts.push(blk('The options', v.options && v.options.length ? h('ul', { class: 'v2-flist', key: 'pf-opts' }, v.options.map((o) => h('li', { key: `pfo:${o.value}` },
      h('span', { class: 'v2-mono' }, o.value), ' ', codeWords(o.then)))) : h('p', { class: 'v2-body' }, NOT_RECORDED)));
    parts.push(h('p', { class: 'v2-body', key: 'rec-line' }, v.recommendation ? [h('span', { class: 'v2-rec' }, 'Recommended'), ' ', codeWords(v.recommendation)] : 'No recommendation given'));
  }
  parts.push(blk('What you do', h('p', { class: 'v2-body' }, PF_WORDS.noAnswerLink), h('p', { class: 'v2-mark', key: 'pf-phone' }, vi('clock'), h('span', {}, PF_WORDS.phoneNote))));
  parts.push(h('p', { class: 'v2-steps', key: 'step-btns' }, ext(card.step.href, `${card.step.sheetLabel} ↗`, 'v2-abtn')));
  if (v.fullText) parts.push(h('details', { class: 'v2-fd', key: 'full-text' }, h('summary', {}, 'The whole record'), h('article', { class: 'sb-record', html: renderMarkdown(v.fullText) })));
  const acts = [];
  if (!pending) acts.push(h('button', { type: 'button', class: 'v2-abtn done', key: 'sheet-done', onclick: () => { markCard(card); nav.to(back); } }, 'Done ✓'));
  else acts.push(h('button', { type: 'button', class: 'v2-abtn', key: 'sheet-undo', onclick: () => { boardState.set(undoMark(boardState.marks, card.id)); render(); } }, 'Undo'));
  acts.push(h('button', { type: 'button', class: 'v2-abtn ghost', key: 'sheet-close2', onclick: () => nav.to(back) }, 'Close'));
  parts.push(h('p', { class: 'v2-acts', key: 'acts' }, acts));
  return sheetShell(back, card.title, parts, `sheet:${sheetId}`);
}

// ---------------------------------------------------------------------------
// Timeline (AC51) and Team (AC49)

// AC59, AC60 and AC61 (trial-view notes 2): the Timeline as the project's breakdown, read from the
// bottom up: what we're delivering at the top, each phase run as a band pinned while its stretch
// scrolls by, its milestones in delivery order with their status icons, "Done when" and why, their
// sprints folded under them, the Now line, and where we started at the bottom. From stage 3 (AC84;
// frame 7b and its full-length capture) its content and order stand and its look is cleaned up as the
// owner asked ("merging the visual formatting elements of linear into it"): a compact pinned header,
// the short phase line, lighter pinned bands, a thin rail in the phase's colour, one status icon in a
// circle per milestone, sprints folded, Technical, Context and Why as small grey words, and the Now
// line the only heavy rule on the screen.

/** Mockup v2's circle for each of AC59's icons (desk-v2.html's ST; the Timeline's, as the page's). */
const FEED_STC = { check: 'check', pastcheck: 'pastcheck', half: 'half', next: 'next', planned: 'planned', cross: 'cross', skip: 'skip', unrec: 'unrec', flag: 'flag' };

/**
 * A sprint's mark (AC60): a mark and a word, never colour alone; its reason one tap away when it has
 * one. ✕, which no Plex file the desk serves holds, is drawn as an icon, its word beside it (AC81;
 * AC84 "every word stays"), and named for assistive technology, "failed", as the icon is hidden from
 * it (AC81: an icon-drawn mark "keeps its word or its accessible name"); ✓ and – are Plex's own, as
 * frame 7b writes them.
 */
const MARK_ICON = { '✕': { icon: 'bad', name: 'failed' } };
function markNode(m) {
  const icon = MARK_ICON[m.mark];
  const words = [icon ? [vi(icon.icon, 'v2-k v2-smk'), h('span', { class: 'sb-vh' }, `${icon.name} `)] : m.mark ? `${m.mark} ` : null, m.word];
  if (!m.why) return h('span', { class: 'sb-mkw' }, words);
  return h('details', { class: 'sb-mkw sb-why' }, h('summary', {}, words), h('p', { class: 'v2-small' }, m.why));
}

/**
 * Context or Why longer than three lines (AC84): cut at three, "<n> more ▸" opening the rest (AC60's
 * text, unchanged). The control shows only when something is hidden: in the browser the page
 * measures the cut text (measureClips) and counts the parts not wholly shown; before it has measured,
 * and where nothing can be measured, it judges by length.
 */
const LONG_CHARS = 160; // about three lines of 12 px text in the 360 px label row's text column (C)
/** Each cut text's parts not wholly shown, by its key, as last measured (0: nothing hidden). */
const moreHidden = new Map();
function longText(name, key, items, render) {
  const total = items.reduce((n, x) => n + String(x.text).length, 0);
  const fk = `more:${key}`;
  const open = isOpenFold(name, fk, false);
  const guess = items.length > 1 || total > LONG_CHARS ? Math.max(1, items.length - 1) : 0;
  const hidden = moreHidden.has(key) ? moreHidden.get(key) : guess;
  const text = h('span', { class: `v2-bt${open ? '' : ' cut'}`, key: `bt:${key}`, 'data-bt': open ? null : key }, items.map(render));
  if (!open && !hidden) return text;
  const more = items.length > 1 ? `${hidden} more` : 'more';
  return [text, foldButton(name, fk, false, { class: 'v2-fold v2-inmore', 'data-more': key }, open ? 'less' : more)];
}

/** How many of a cut text's parts are not wholly shown; null where the browser can't say. */
function hiddenParts(el) {
  const [sh, ch] = [el.scrollHeight, el.clientHeight];
  if (typeof sh !== 'number' || typeof ch !== 'number' || !ch) return null;
  if (!(sh > ch + 1)) return 0;
  const box = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  const kids = [...(el.children || [])];
  if (!box || !(box.height > 0) || !kids.length) return 1;
  return Math.max(1, kids.filter((k) => k.getBoundingClientRect && k.getBoundingClientRect().bottom > box.bottom + 1).length);
}

/** One sprint, top to bottom (AC60, frame 7b): date and code, its marks at the right; its title as recorded; Technical, Context and Why as three grey-labelled rows; and the link to its tasks. */
function sprintNode(p, s) {
  const name = p.project.name;
  if (s.missing) {
    return h('article', { class: 'v2-sp', key: `sprint:${s.key}`, 'data-sprint': s.id },
      h('div', { class: 'v2-sph' }, h('span', { class: 'v2-mono' }, s.code), ' ', h('span', { class: 'v2-small' }, s.missing)),
      s.reason ? h('details', { class: 'sb-why' }, h('summary', {}, 'Why'), h('p', { class: 'v2-small' }, s.reason)) : null);
  }
  const lbl = (cls, label, value) => h('div', { class: `v2-bl ${cls}` }, h('span', { class: 'v2-bn' }, label), value);
  const tech = h('span', { class: 'v2-bt mono' }, s.technical.map((x, i) => [i ? ' · ' : '', x.href ? ext(x.href, x.text) : x.text]));
  const ctx = s.context
    ? longText(name, `${s.key}:ctx`, s.context.map((c) => ({ text: c.fact, c })), (x, i) => h('span', { class: 'v2-fact', key: `f${i}` }, i ? ' · ' : null, x.c.fact,
      x.c.exception ? null : h('span', { class: 'v2-src' }, ` · ${x.c.source || 'source not recorded'}`)))
    : h('span', { class: 'v2-bt nr gap' }, 'not recorded');
  const why = s.why ? longText(name, `${s.key}:why`, s.why.map((w) => ({ text: w })), (x, i) => h('span', { class: 'sb-para', key: `w${i}` }, x.text))
    : h('span', { class: 'v2-bt nr gap' }, 'not recorded');
  return h('article', { class: 'v2-sp', key: `sprint:${s.key}`, 'data-sprint': s.id },
    h('div', { class: 'v2-sph' }, h('span', { class: 'v2-mono' }, `${s.date} · ${s.code}`), h('span', { class: 'v2-stats' }, s.marks.map(markNode))),
    h('h4', { class: 'v2-spt' }, s.title), s.none ? h('p', { class: 'v2-small' }, `no milestone: ${s.none}`) : null,
    lbl('tech', 'Technical', tech), lbl('ctx', 'Context', ctx), lbl('why', 'Why', why),
    s.tasks.href ? [h('a', { class: 'v2-lnk', href: s.tasks.href, rel: 'noopener noreferrer', target: '_blank' }, 'Tasks in this sprint ↗'), h('p', { class: 'v2-small' }, s.tasks.line)]
      : h('p', { class: 'v2-small gap' }, s.tasks.none));
}

/** "<n> sprints" (AC84: "<n> sprints ▸", folded), from AC60's fold words. */
const sprintsWords = (n) => `${n} sprint${n === 1 ? '' : 's'}`;

/** A milestone on the Timeline (AC59, AC84): its icon in a plain circle on the rail; its name; "<id> · <state> · <rough finish>" in Plex Mono; "Done when" and "Why"; its sprints folded. */
function mileNode(p, x, finishOf, whyOnce = null) {
  const name = p.project.name;
  const fk = `sprints:${x.key}`;
  const nk = `named:${x.key}`;
  const open = isOpenFold(name, fk, false);
  const nOpen = isOpenFold(name, nk, false);
  const fin = x.kind === 'ms' && x.rule !== 1 && !/^reached/.test(x.words) && finishOf ? finishWords(finishOf(x.code), { label: false }) : null;
  return h('div', { class: `v2-ms${x.icon === 'planned' || x.icon === 'next' ? ' planned' : ''}`, key: `mile:${x.key}`, 'data-ms': x.code },
    h('span', { class: 'v2-msi' }, stc(FEED_STC[x.icon] || 'unrec')),
    h('p', { class: 'v2-mstt' }, x.name),
    h('p', { class: 'v2-msm' }, [x.code, x.words, fin].filter(Boolean).join(' · ')),
    x.doneWhen ? h('p', { class: 'v2-msd' }, h('b', {}, 'Done when'), ' ', x.doneWhen) : null,
    x.why ? h('p', { class: 'v2-msd' }, h('b', {}, 'Why'), ' ', x.why.text, h('span', { class: 'v2-src' }, ` · ${x.why.source}`))
      : whyOnce && whyOnce.has(x.key) ? null : h('p', { class: 'v2-msd gap' }, h('b', {}, 'Why'), ' not recorded yet · for the agents to add'),
    x.sprints.length ? foldButton(name, fk, false, { class: 'v2-fold', 'data-sprints': x.key }, sprintsWords(x.sprints.length)) : h('p', { class: 'v2-small' }, x.fold),
    x.sprints.length && open ? h('div', { class: 'v2-sps', key: `tasks:${x.key}` }, x.sprints.map((s) => sprintNode(p, s))) : null,
    x.namedFold ? foldButton(name, nk, false, { class: 'v2-fold', 'data-sprints': `${x.key}:named` }, x.namedFold) : null,
    x.namedFold && nOpen ? h('div', { class: 'v2-sps', key: `named:${x.key}` }, x.named.map((s) => sprintNode(p, s))) : null);
}

/** The run's "Not tied to a milestone" line (AC60, AC69): the grey diamond, its count, who files them, the fixed sentence and its sprints folded. */
function untiedNode(p, x) {
  const name = p.project.name;
  const fk = `sprints:${x.key}`;
  const open = isOpenFold(name, fk, false);
  return h('div', { class: 'v2-ms untied', key: `mile:${x.key}`, 'data-ms': 'untied' },
    h('span', { class: 'v2-msi' }, stc('flag')),
    h('p', { class: 'v2-mstt' }, x.name),
    h('p', { class: 'v2-msm gap' }, x.words),
    h('p', { class: 'v2-small' }, x.sentence),
    foldButton(name, fk, false, { class: 'v2-fold', 'data-sprints': x.key }, sprintsWords(x.sprints.length)),
    open ? h('div', { class: 'v2-sps', key: `tasks:${x.key}` }, x.sprints.map((s) => sprintNode(p, s))) : null);
}

/** A run's gathered standard milestones (AC59): one line, listing them in place on a tap. */
function gatherNode(p, x) {
  const name = p.project.name;
  const open = isOpenFold(name, x.key, false);
  return h('div', { class: 'v2-gather', key: `gather:${x.key}` }, foldButton(name, x.key, false, { class: 'v2-fold' }, x.words),
    open ? h('ul', { class: 'v2-glist' }, x.items.map((i) => h('li', {}, i.name, ' ', h('span', { class: 'v2-mono' }, i.code), ' ', h('span', { class: 'v2-small' }, i.words)))) : null);
}

function feedRow(p, x, finishOf, whyOnce = null) {
  if (x.kind === 'ms') return mileNode(p, x, finishOf, whyOnce);
  if (x.kind === 'untied') return untiedNode(p, x);
  return gatherNode(p, x);
}

/** "What we're delivering" and "Where we started" (AC59), quoted from docs/PROJECT.md's Intent, or "not recorded". */
function goalNode(g, kind) {
  return h('article', { class: `v2-goal ${kind}`, key: `goal:${kind}` }, h('h3', { class: 'v2-label' }, g.label),
    h('p', { class: `v2-gq${g.recorded ? '' : ' gap'}` }, g.text),
    h('p', { class: 'v2-small' }, g.source.href ? ext(g.source.href, g.source.words, 'v2-inl') : g.source.words),
    g.finish ? h('p', { class: 'v2-mono' }, g.finish) : null);
}

/**
 * The status icons in words (AC59's key), folded at the Timeline's foot (AC84: frame 7b draws no key, so
 * its words stay one tap away; every icon carries its word beside it on each row). The bullets' colour
 * key is gone with their colours (AC60, changed by AC84).
 */
function feedKeys(p, fv) {
  const name = p.project.name;
  const open = isOpenFold(name, 'feed-keys', false);
  return h('div', { class: 'v2-fkeys', key: 'feed-keys' }, foldButton(name, 'feed-keys', false, { class: 'v2-fold' }, 'Status icons'),
    open ? h('ul', { class: 'v2-keyl' }, fv.iconsKey.map(([k, w]) => h('li', { key: `fk:${k}` }, stc(FEED_STC[k] || 'unrec'), h('span', {}, w)))) : null);
}

/**
 * The short phase line (AC84; AC68, changed; P-001-timeline-marker.md, A): the now phase's small square
 * in its colour, then the first part of AC83's sentence, the same component with the same words on the
 * Timeline and the Team screen. A real link, "Open the Timeline at Now": on the Timeline a tap scrolls
 * back to Now; on the Team screen it opens the Timeline at Now.
 */
function phaseLineNode(p, screen) {
  const pl = phaseLine(p.ctx, { snap: p.snap });
  const href = go('p', p.project.name, 'timeline');
  const open = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (screen === 'timeline') scrollToTarget({ now: true });
    else nav.to(href);
  };
  return h('a', { class: 'v2-phl', key: 'phase-line', href, 'aria-label': `${pl.words}. Open the Timeline at Now`,
    onclick: (e) => { if (screen === 'timeline') open(e); },
    onkeydown: (e) => { if (e && (e.key === 'Enter' || e.key === ' ')) open(e); } },
  h('span', { class: `v2-dot ${pl.cls || 'ph-none'}`, 'aria-hidden': 'true' }), h('span', { class: 'v2-phlw' }, pl.words));
}

/** The Timeline's compact pinned header (AC84, frame 7b's top): the back control, the project's name and the Overview | Timeline switch; the phase line under it. */
function timelineHead(p) {
  const name = p.project.name;
  return h('div', { class: 'v2-tlhead', key: 'tl-head' },
    h('header', { class: 'v2-thead' }, backControl(go('p', name), 'v2-round flat'), h('h1', { class: 'v2-tn' }, name),
      p.project.model === 'v3' ? pageSwitch(name, 'timeline') : null),
    phaseLineNode(p, 'timeline'));
}

function renderTimeline(p) {
  const fv = p.feed();
  const body = [timelineHead(p)];
  if (!fv.ok) {
    body.push(h('p', { class: 'v2-small v2-tlnone', key: 'tl-none' }, fv.words));
    return h('section', { class: 'sb-screen v2 v2-timeline', key: 'timeline' }, body);
  }
  const finishOf = finishLookup(p.project.name);
  const blocks = fv.blocks.map((b) => {
    // AC90 (P-001-audit-repeat.md, A; AC59, changed): a why not recorded yet for two or more of the run's milestones is said
    // once under its band, and those milestones show no why line until each has one.
    const mss = [...(b.plannedRows || []), ...b.rows].filter((x) => x.kind === 'ms');
    const noWhy = mss.filter((x) => !x.why);
    const whyOnce = noWhy.length >= 2 ? new Set(noWhy.map((x) => x.key)) : null;
    const row = (x) => feedRow(p, x, finishOf, whyOnce);
    return h('section', { class: `v2-tblk ${b.band.cls}${b.plan ? ' plan' : ''}`, key: `blk:${b.key}`, 'data-run': b.key },
    h('h2', { class: 'v2-tph sb-pband', key: `band:${b.key}` }, h('span', { class: 'v2-dot', 'aria-hidden': 'true' }),
      h('span', { class: 'v2-tpn' }, b.band.name), h('span', { class: 'v2-tpd' }, b.band.label)),
    whyOnce ? h('p', { class: 'v2-msd gap v2-tonce', key: `whyonce:${b.key}` }, h('b', {}, 'Why'), ` not recorded yet for ${noWhy.length} of ${mss.length} milestones · for the agents to add`) : null,
    b.nowLine ? [
      b.plannedRows.length ? h('div', { class: 'v2-tseg plan', key: `seg:${b.key}:plan` }, b.plannedRows.map(row)) : null,
      h('p', { class: 'v2-nowl', key: 'nowline', 'data-now': '1' }, h('span', { class: 'v2-nowt' }, b.nowLine.words), ' ',
        h('span', { class: 'v2-nows' }, b.nowLine.sub), b.nowLine.note ? h('span', { class: 'v2-nows' }, ` · ${b.nowLine.note}`) : null)] : null,
    h('div', { class: `v2-tseg${b.plan ? ' plan' : ''}`, key: `seg:${b.key}` }, b.began ? beganNode(b.began) : null, b.rows.map(row)));
  });
  body.push(goalNode(fv.top, 'finish'), h('div', { class: 'v2-feed', key: 'feed' }, blocks), goalNode(fv.bottom, 'start'));
  for (const n of fv.notes) body.push(h('p', { class: 'v2-small v2-feednote' }, n));
  body.push(feedKeys(p, fv));
  return h('section', { class: 'sb-screen v2 v2-timeline', key: 'timeline' }, body);
}

/** In the browser: the bands pin just under the Timeline's pinned header and phase line, whatever their height (AC84): a class names that height to the next 8 px (sandbox.css, `.tlh-<px>`). */
export const TLH_STEPS = { min: 64, max: 208, step: 8 };
function fitTimelineHead() {
  try {
    const view = document.getElementById('view');
    const head = view ? findClass(view, 'v2-tlhead') : null;
    const scr = view ? findClass(view, 'v2-timeline') : null;
    if (!head || !scr || !head.getBoundingClientRect || !scr.classList) return;
    // Measured at its own height: the class also sets the header's height to the step (sandbox.css),
    // so the bands sit flush under it, with no gap for the feed to show through (the Design reviewer's 3).
    const had = String((scr.getAttribute && scr.getAttribute('class')) || '').split(/\s+/).filter((c) => /^tlh-\d+$/.test(c));
    for (const c of had) scr.classList.remove(c);
    const hh = head.getBoundingClientRect().height;
    if (!(hh > 0)) {
      for (const c of had) scr.classList.add(c);
      return;
    }
    const n = Math.min(TLH_STEPS.max, Math.max(TLH_STEPS.min, Math.ceil(hh / TLH_STEPS.step) * TLH_STEPS.step));
    scr.classList.add(`tlh-${n}`);
  } catch {
    // the bands keep their default place under the header
  }
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
  // From stage 3 (AC84): the compact header and the phase line are pinned above the band, so the Now
  // line (or the sprint) comes to rest just under both.
  const head = findClass(view, 'v2-tlhead');
  const hh = head && head.getBoundingClientRect ? head.getBoundingClientRect().height : 0;
  const y = (window.scrollY || 0) + el.getBoundingClientRect().top - hh - bh - 8;
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
  // From stage 3 (AC84; AC68, changed; P-001-timeline-marker.md, A): the Team screen opens with the
  // Timeline's short phase line, the same component with the same words, under its title, pinned, in
  // place of AC68's boxed marker; the rest keeps its layout until stage 7 (AC88).
  const body = [projectHeader(name, 'Team'), h('div', { class: 'v2 v2-phlpin', key: 'phase-line-pin' }, phaseLineNode(p, 'team'))];
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
  // AC67, changed after MD3 ("Ruling: B — the Team screen folds idle members into one line and drops its five-mark key",
  // P-001-audit-team.md): no key above the cards (each mark keeps its word beside it on its card).
  const rows = tv.rows || [];
  const tileOf = (m, once) => {
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
      // AC90's Team part: a reason the list's head says once is not repeated on the card.
      once && last === NOT_IN_READS ? null : h('span', { class: 'sb-muted small' }, last),
      feeds ? (feeds.feeds ? h('span', { class: 'sb-feeds' }, 'feeds ', h('b', {}, feeds.feeds.code), ` · ${feeds.feeds.name}`)
        : h('span', { class: 'sb-feeds gap' }, 'feeds: not tied to a milestone')) : noFeeds ? h('span', { class: 'sb-feeds gap' }, 'feeds: not recorded') : null,
      place ? h('a', { class: 'sb-tlink', href: go('p', name, 'timeline', 'sprint', item) }, 'On the Timeline ›') : null);
  };
  // Each card's "last:" as drawn, for AC90's rule (the same words on two or more cards of one list).
  const lastOf = (m) => {
    if (m.id === 'chief-of-staff') return m.card || NOT_RECORDED;
    if (m.status === 'Working') return m.last;
    const work = p.project.model === 'v3' ? memberWork(p.ctx, fv, rows, m.id, TZ, m.helper || null) : null;
    return work ? work.last : m.last;
  };
  /** A list of cards, with AC90's line at its head when two or more of them share "not recorded in what the desk reads". */
  const cardList = (ms, k) => {
    const covered = ms.filter((m) => lastOf(m) === NOT_IN_READS);
    const once = covered.length >= 2;
    return [once ? h('p', { class: 'sb-muted small sb-tonce', key: `team-once:${k}` }, teamOnce(covered.length, ms.length)) : null,
      h('div', { class: 'sb-tiles', key: `tiles:${k}` }, ms.map((m) => tileOf(m, once)))];
  };
  const idle = tv.members.filter((m) => m.status === 'Idle');
  const others = tv.members.filter((m) => m.status !== 'Idle');
  if (others.length) body.push(cardList(others, 'cards'));
  // Idle members fold into one line after the other cards, "<n> idle ›"; a tap opens them in place, and the choice is kept
  // on the device (AC54 (d)'s way). With none idle, no line.
  if (idle.length) {
    const open = teamIdle.isOpen(name);
    body.push(h('button', { type: 'button', class: 'sb-idle', key: 'team-idle', 'aria-expanded': open ? 'true' : 'false',
      onclick: () => { teamIdle.toggle(name); render(); } }, IDLE_LINE(idle.length)));
    if (open) body.push(h('div', { class: 'sb-idlelist', key: 'team-idle-list', role: 'region', 'aria-label': `${idle.length} idle` }, cardList(idle, 'idle')));
  }
  return h('section', { class: 'sb-screen' }, body);
}

/** AC67, changed: the idle members' one line, "<n> idle ›" (one: "1 idle ›"). */
export const IDLE_LINE = (n) => `${n} idle ›`;

/** AC90's Team part (P-001-audit-repeat.md, A): "<k> members · last work not recorded in what the desk reads" ("<k> of <n> …" for some of the list). */
const NOT_IN_READS = 'not recorded in what the desk reads';
export const teamOnce = (k, n) => `${k === n ? `${n} members` : `${k} of ${n} members`} · last work ${NOT_IN_READS}`;

/** Whether each project's idle members are opened on the Team screen (AC67, changed), kept on the device under its own key, as Home's groups are. */
export const TEAM_IDLE_KEY = 'desk-team-idle-v1';
const teamIdle = {
  store: null,
  state: {},
  load(store) {
    this.store = store;
    try {
      const v = store ? store.getJSON(TEAM_IDLE_KEY, null) : null;
      this.state = v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).filter(([, x]) => typeof x === 'boolean')) : {};
    } catch {
      this.state = {};
    }
  },
  isOpen(name) {
    return this.state[name] === true;
  },
  toggle(name) {
    this.state = { ...this.state, [name]: !this.isOpen(name) };
    try {
      if (this.store) this.store.setJSON(TEAM_IDLE_KEY, this.state);
    } catch {
      // storage failing costs only the memory of the fold (AC54 (d)'s way)
    }
  },
};

function renderMember(p, tv, id, sub, idx, now) {
  const name = p.project.name;
  const page = memberPage(p.project, p.model, p.snap, p.j, p.q, tv, id, now, TZ);
  if (!page) return h('section', { class: 'sb-screen' }, projectHeader(name, 'Team'), h('p', {}, 'No such member.'));
  const body = [projectHeader(name, page.label, page.status)];
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
  // AC49 (changed after MD3, stage 4): a Chief of Staff "now" row opens the Working now sheet of its own piece
  // (`now/<lane>`), so with pieces under way at once the tapped row's piece is named in full; `now` alone is the
  // piece started last, as its tile names it (J13).
  const piece = sub === 'now' && idx != null && page.cos ? cosPieceOf(page.cos, idx) : null;
  if (sub === 'now' && idx != null && page.cos) {
    out.push(piece && piece.state === 'working' ? workingSheet(p, id, cosWorkingNow(page.cos.cs, piece, now, TZ))
      : piece ? sheetFrame(go('p', name, 'team', id), 'Working now', [h('p', {}, `${page.label}: ${cosPieceWords(piece, now, TZ)}`)])
        : sheetFrame(go('p', name, 'team', id), 'Working now', [h('p', {}, 'This entry is no longer in the running log the desk reads.')]));
  } else if (sub === 'now') {
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
      // AC49 (after MD3, stage 4): on the Chief of Staff's log, each "now" row opens its own piece's Working now sheet.
      const own = e.now && page.cos && e.lane ? e.lane : null;
      const href = e.now ? (own ? go('p', p.project.name, 'team', page.id, 'now', own) : go('p', p.project.name, 'team', page.id, 'now')) : go('p', p.project.name, 'team', page.id, 'e', String(i));
      const lane = L.lanes.find((l) => l.id === e.lane);
      return h('li', { class: `sb-brow${e.now ? ' now' : ''}`, key: `brow:${i}` },
        opener(e.now ? (own ? `log:now:${own}` : 'log:now') : `log:${i}`, href, {}, h('span', { class: 'sb-brow-t' }, e.text),
          // AC49 (stage 4): a Chief of Staff helper or end row names its piece, cut at one line with the fade; whole in its sheet.
          e.of != null ? h('span', { class: `sb-brow-of${clipOver.get(`brow-of:${page.id}:${i}`) === true ? ' over' : ''}`, 'data-clip': `brow-of:${page.id}:${i}`, key: `brow-of:${i}` }, ` · ${e.of}`) : null,
          e.now ? h('span', { class: 'sb-nowtag' }, 'now') : null,
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
let lastPf = null; // J23 (stage 6b): the portfolio as this drawing read it (portfolioRead), or null with no `portfolio` in J7
let waDay = null; // the owner's today when Work ahead was last drawn
let waMemo = null; // Work ahead's view, worked out once per drawing
let lastBoard = null; // the board as the current drawing built it (AC86: each project's waiting gate card)

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
  const gates = new Map();
  for (const b of built) {
    const c = gateCardOf(lastBoard, b.project.name);
    if (c) gates.set(b.project.name, c);
  }
  waMemo = workAheadView({ config: CONFIG, entries, snaps, nowMs, tz: TZ, draft: planDraft.read(), gates });
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

/** A move control (AC24): a real button, used by a tap, a click, or Enter or Space; at an end it says it is disabled and does nothing, keeping the focus. Its arrow an icon (AC81: no served file holds ▲ or ▼). */
function moveButton(r, dir) {
  const off = dir < 0 ? r.first : r.last;
  const words = dir < 0 ? WA.moveUp(r.code) : WA.moveDown(r.code);
  const act = () => { if (!off) moveRow(r.key, dir); };
  return h('button', { type: 'button', class: 'v2-plmv', key: `wa-${dir < 0 ? 'up' : 'down'}:${r.key}`, 'aria-label': words, 'aria-disabled': off ? 'true' : null,
    onclick: act,
    onkeydown: (e) => {
      if (!e || (e.key !== 'Enter' && e.key !== ' ')) return;
      if (e.preventDefault) e.preventDefault();
      act();
    } }, vi(dir < 0 ? 'up' : 'down', 'v2-k'));
}

// ---------------------------------------------------------------------------
// Plan (AC86; desk mockup v2, frame 11), from stage 5: AC24's Work ahead in the Plan tab, top down,
// next first (P-001-plan-order.md, A). Every rule is AC24's, in lib/workview.js; only its place and
// look change. The title "Plan" with "⇅", which opens AC24's ordering; the line under it; one group
// for each connected v3 project, each row its icon, name, "<id> · <phase> · about <low>–<high> days"
// and its value at the right, a tap opening its sheet with AC24's whole row; then the v2.5 lines,
// "Not milestones yet" and "Ideas · from the portfolio".

/** The address of a milestone's sheet over Plan (AC86): its whole row in AC24's words. */
const planMsRoute = (r) => go('work', 'ms', r.project.name, r.code);

/** "<n> waiting on you in your Queue" (AC24), linked to the board with that project shown (AC80); the ◆ beside it in the owner's vermilion (AC69, AC81). */
function planYou(r, where) {
  return h('p', { class: 'v2-plyou', key: `wa-you:${where}:${r.key}` }, h('a', { href: go('waiting', r.project.name), key: `wa-q:${where === 'row' ? '' : 'sheet:'}${r.key}` },
    stc('you', 'v2-k'), `${r.waiting} waiting on you in your Queue`));
}

/**
 * One milestone's row on Plan (AC86, frame 11; AC24's rules): its icon (AC57's state as the page draws
 * it, or the vermilion ◆ where a gate card waits on the owner), its name, "<id> · <phase> · about
 * <low>–<high> days", and at the right its rough finish, "your acceptance" or "after your ruling". Where
 * AC24 gives no estimate or no finish, the row says so in AC24's words. In the ordering (⇅): its place
 * and the two move controls (AC24).
 */
function planRow(v, r, ordering, once = null) {
  const moved = planDraft.moved === r.key;
  const est = r.estimate;
  const under = [];
  // AC90: a reason the group's head says once is not repeated on the row; the row's sheet still says it in full.
  const estOnce = once && once.estimate.has(r.key);
  const finOnce = once && once.finish.has(r.key);
  if (!estOnce && (est.kind === 'missing' || est.kind === 'na' || est.kind === 'past')) under.push(h('p', { class: 'v2-small v2-plgap', key: `gap:est:${r.key}` }, est.words));
  // J14 (specs/S-001.md:10361-10364): under the estimate the row shows, a newer line that can't be read is said.
  if (est.newer) under.push(h('p', { class: 'v2-small v2-plgap v2-plnewer', key: `gap:newer:${r.key}` }, WA.newerUnreadable));
  if (!finOnce && r.finish && r.finish.na) under.push(h('p', { class: 'v2-small v2-plgap', key: `gap:fin:${r.key}` }, `${WA.finish}: ${r.finish.words}`));
  if (r.notInPlan) under.push(h('p', { class: 'v2-small v2-pltag', key: `gap:tag:${r.key}` }, WA.notInPlan));
  if (r.waiting) under.push(planYou(r, 'row'));
  const place = h('span', { class: 'v2-plord' }, ordering ? h('span', { 'aria-hidden': 'true' }, r.place) : null,
    h('span', { class: 'sb-vh' }, `${r.placeWords}${moved ? ', moved' : ''}`));
  const main = h('a', { class: 'v2-plrow', key: `wa-open:${r.key}`, href: planMsRoute(r), onclick: () => { nav.opener = `wa-open:${r.key}`; } },
    place, stc(r.icon),
    h('span', { class: 'v2-prt' }, h('span', { class: 'v2-prtt v2-plname' }, r.name),
      h('span', { class: 'v2-mono v2-plm' }, v.many && ordering ? `${r.mono} · ${r.project.name}` : r.mono),
      h('span', { class: 'sb-vh' }, `: ${r.state.words}`)),
    h('span', { class: `v2-plv${r.right ? ` ${r.right.kind}` : ''}` }, r.right ? r.right.words : null));
  return h('li', { class: `v2-plli${ordering ? ' ord' : ''}${moved ? ' moved' : ''}`, key: `wa-row:${r.key}`, 'data-row': r.code },
    main, under.length ? h('div', { class: 'v2-plunder' }, under) : null,
    ordering ? h('div', { class: 'v2-plmove' }, moveButton(r, -1), moveButton(r, 1)) : null);
}

/**
 * A gate card waiting on the owner, as a row of its own at the top of its project's group (AC86, frame 11:
 * "Launch gate · waits on you", desk-v2.html:840): the vermilion ◆, the card's title as the board shows it,
 * "<Phase> gate · waits on you" and "after your ruling". A tap opens the card's own sheet on Waiting
 * (AC80, AC85), where its four choices are; it is in no order, no plan and no rough finish.
 */
function planGateRow(g) {
  return h('li', { class: 'v2-plli gate', key: `wa-row:${g.key}`, 'data-gate': g.id },
    h('a', { class: 'v2-plrow', key: `wa-gate:${g.id}`, href: go('work', 'card', g.id), onclick: () => { nav.opener = `wa-gate:${g.id}`; } },
      h('span', { class: 'v2-plord' }), stc(g.icon),
      h('span', { class: 'v2-prt' }, h('span', { class: 'v2-prtt v2-plname' }, g.name), h('span', { class: 'v2-mono v2-plm' }, g.mono)),
      h('span', { class: `v2-plv ${g.right.kind}` }, g.right.words)));
}

/** A milestone's sheet over Plan (AC86): AC24's whole row, its state beside its icon, "Done when", the estimate and its note, the rough finish, what waits, and the milestone on the Timeline. */
function planSheet(v, key) {
  const r = v.rows.find((x) => x.key === key);
  if (!r) return null; // no longer ahead (reached or dropped since): Plan alone
  const back = '#/work';
  const est = r.estimate;
  // AC24: its code, then its phase in words with its phase colour (AC48); its project where more than one v3 project is connected.
  const meta = [r.code, r.phase ? [' · ', h('span', { class: `v2-plph ${r.phaseClass || ''}` }, r.phase)] : null, v.many ? ` · ${r.project.name}` : null];
  const parts = [sheetHead(meta, r.name, back),
    h('p', { class: 'v2-mark v2-plst', key: 'wa-st' }, stc(r.state.icon), h('span', {}, r.state.words)),
    r.notInPlan ? h('p', { class: 'v2-small v2-pltag', key: 'wa-tag' }, WA.notInPlan) : null,
    r.waiting ? planYou(r, 'sheet') : null,
    r.done ? blk(WA.doneWhen, h('p', { class: 'v2-body v2-pldone' }, r.done)) : null,
    blk(WA.estimateKey, h('p', { class: `v2-body v2-plest ${est.kind}` }, est.words),
      est.note ? h('div', { class: 'v2-plnote' }, lineBox(`wa-note:${r.key}`, { words: est.note, recCode: `${r.code}'s estimate note`, title: 'Estimate note', lines: 2 })) : null,
      est.newer ? h('p', { class: 'v2-small v2-plnewer' }, WA.newerUnreadable) : null),
    r.finish ? blk(WA.finish, h('p', { class: `v2-body v2-plfin${r.finish.na ? ' na' : ''}` }, r.finish.words),
      h('p', { class: 'v2-small' }, WA.sheetFinishNote)) : null,
    h('p', { class: 'v2-acts', key: 'wa-tl' }, h('a', { class: 'v2-lnk', key: 'wa-timeline', href: go('p', r.project.name, 'timeline', 'ms', r.code) }, WA.onTimeline))];
  return sheetShell(back, r.name, parts, 'wa-sheet');
}

/** "Record plan" (AC24, J4): the J3-form link holding every row in the order shown, or why there is none. */
function recordNode(v) {
  if (!v.record.ok) {
    return [h('button', { type: 'button', class: 'v2-abtn v2-plrec', key: 'wa-record', disabled: true }, WA.record),
      h('p', { class: 'v2-small v2-plwhy' }, v.record.words)];
  }
  const link = v.record.link;
  const a = h('a', { class: 'v2-abtn v2-plrec', key: 'wa-record', href: link.url, rel: 'noopener noreferrer', target: '_blank', onclick: () => {
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
  return h('div', { class: 'v2-plcopy', key: `wa-copy:${key}` }, h('p', { class: 'v2-small' }, words),
    h('pre', { class: 'v2-pre' }, text), copyButton(text, key, label, 'v2-abtn ghost'));
}

/** A section's head on Plan (frame 11): its words, a folder before a project's name, and its count at the right in Plex Mono. */
function planHead(words, n, { proj = false } = {}) {
  return h('h2', { class: 'v2-sh v2-plh' }, h('span', { class: 'v2-shw v2-plhw' }, proj ? vi('proj') : null, h('span', {}, words)),
    n == null ? null : h('span', { class: 'v2-mono' }, String(n)));
}

/** Each idea state's mark (frame 11 draws captured with the dashed ring and shaping half filled; C for the rest): its words always beside it. */
const IDEA_MARK = { captured: 'planned', shaping: 'half', approved: 'check', 're-aimed': 'half', stopped: 'cross' };

/**
 * Plan's "Ideas · from the portfolio" (AC87, AC86; frame 11): with its count, each idea in the log, newest
 * first, its name, its state in words and its date in Plex Mono; "No ideas in the log yet"; or why it
 * can't be shown. With no `portfolio` in J7, 6a's words.
 */
function ideasNode() {
  const iv = ideasView(lastPf);
  return h('section', { class: 'v2-plgrp', key: 'wa-ideas' }, planHead(WA.ideas, iv.count),
    iv.words ? h('p', { class: 'v2-small v2-plideas', key: 'wa-ideas-words' }, iv.words) : null,
    iv.rows.length ? h('ol', { class: 'v2-rows', key: 'wa-ideas-list', 'aria-label': WA.ideas }, iv.rows.map((i) => h('li', { class: 'v2-plli idea', key: `wa-idea:${i.key}` },
      h('div', { class: 'v2-plrow v2-plidea' }, h('span', { class: 'v2-plord' }), stc(i.recorded ? IDEA_MARK[i.state] : 'unrec'),
        h('span', { class: 'v2-prt' }, h('span', { class: 'v2-prtt v2-plname' }, i.name),
          h('span', { class: 'v2-small v2-plm' }, h('span', {}, i.state), ' · ', h('span', { class: 'v2-mono' }, i.date))))))) : null);
}

/** "Not milestones yet" (AC24, J15; frame 11): its head with the count, AC24's line, then each row, "<name>" over "<W-id> · <project>", its note and its state in AC24's words. */
function laterNode(v) {
  const n = v.later.kind === 'ok' ? v.later.rows.length : null;
  const kids = [planHead(WA.notYet, n), h('p', { class: 'v2-small v2-plline' }, WA.notYetLine)];
  if (v.later.kind === 'none') kids.push(h('p', { class: 'v2-small' }, WA.noLaterWork));
  else if (v.later.kind === 'na') kids.push(h('p', { class: 'v2-small' }, `Later work: ${WA.notAvailable}`));
  else {
    if (!v.later.rows.length && !v.later.notAdded.length) kids.push(h('p', { class: 'v2-small' }, WA.noLaterWork));
    kids.push(h('ol', { class: 'v2-rows v2-pllater' }, v.later.rows.map((x) => {
      const w = x.item.w;
      const text = (state) => h('span', { class: 'v2-prt' }, h('span', { class: 'v2-prtt v2-plname' }, x.item.name), h('span', { class: 'v2-mono' }, `${w} · ${v.planner}`),
        h('span', { class: 'v2-small v2-plnote2' }, x.item.note), state);
      let row;
      let after = null;
      if (x.state === 'tap') {
        row = h('a', { class: 'v2-plrow later', key: `wa-ask:${w}`, href: x.ask.link.url, rel: 'noopener noreferrer', target: '_blank', onclick: () => {
          if (!x.ask.link.copy) return;
          try {
            navigator.clipboard.writeText(x.ask.link.copy).catch(() => {});
          } catch {
            // the text is short; AC17's fallback is the copy button
          }
        } }, stc('planned'), text(h('span', { class: 'v2-small v2-plw' }, x.words)), vi('chev', 'v2-k v2-chev'));
        if (x.ask.link.copy) after = copyFallback(x.ask.copyWords, x.ask.link.copy, `wa-ask:${w}`, 'Copy the ask');
      } else if (x.state === 'question') {
        row = h('a', { class: 'v2-plrow later', key: `wa-q:${w}`, href: go('waiting', v.planner) }, stc('planned'), text(h('span', { class: 'v2-small v2-plw' }, x.words)), vi('chev', 'v2-k v2-chev'));
      } else if (x.state === 'answered' && x.line1 != null) {
        row = h('div', { class: 'v2-plrow later', key: `wa-l:${w}` }, stc('planned'), text(h('span', { class: 'v2-small v2-plw v2-plans' },
          lineBox(`wa-ans:${w}`, { words: x.line1, recCode: x.answerPath.replace(/^decisions\/questions\/|\.md$/g, ''), title: 'Answered',
            lead: x.words.slice(0, x.words.length - x.line1.length) }))), h('span', {}));
      } else row = h('div', { class: 'v2-plrow later', key: `wa-l:${w}` }, stc('planned'), text(h('span', { class: 'v2-small v2-plw' }, x.words)), h('span', {}));
      return h('li', { class: 'v2-plli', key: `wa-later:${w}` }, row, after);
    })));
    if (v.later.notAdded.length) {
      const fk = 'wa-notadded';
      kids.push(foldButton(WA_FOLDS, fk, false, { class: 'v2-fold v2-plfold' }, `${WA.notAdded} · ${v.later.notAdded.length}`));
      if (isOpenFold(WA_FOLDS, fk, false)) {
        kids.push(h('ul', { class: 'v2-plmini', key: 'wa-notadded-l' }, v.later.notAdded.map((x) => h('li', { class: 'v2-small' },
          h('span', { class: 'v2-plt' }, x.name), ' ', h('span', {}, x.note)))));
      }
    }
  }
  return h('section', { class: 'v2-plgrp', key: 'wa-later' }, kids);
}
const WA_FOLDS = '#work'; // the folds' keeper for this screen (AC56: kept through every refresh)

/** "Reached · <m>" and "Dropped · <n>" (AC24): folded, opening on a tap. */
function foldList(key, words, list, extra) {
  const open = isOpenFold(WA_FOLDS, key, false);
  return h('section', { class: 'v2-plgrp v2-plfolds', key: `wa-g:${key}` }, foldButton(WA_FOLDS, key, false, { class: 'v2-fold v2-plfold' }, words),
    open ? h('ul', { class: 'v2-plmini', key: `wa-l:${key}` }, list.map((x) => h('li', { class: `v2-small ${key}` },
      h('span', { class: 'v2-plt' }, x.name), ' ', h('span', { class: 'v2-mono' }, x.code), extra(x)))) : null);
}

/** "⇅", named "Change the order" (AC86, frame 11's pill): it opens AC24's ordering, and closes it; kept through every refresh (AC56). */
function orderToggle(ordering) {
  const toggle = () => {
    setFold(WA_FOLDS, 'order', !ordering);
    render();
  };
  return h('div', { class: 'v2-pill', key: 'plan-pill' }, h('button', { type: 'button', class: 'v2-ib', key: 'plan-order', 'aria-label': WA.changeOrder,
    'aria-pressed': ordering ? 'true' : 'false', onclick: toggle,
    onkeydown: (e) => {
      if (!e || (e.key !== 'Enter' && e.key !== ' ')) return;
      if (e.preventDefault) e.preventDefault();
      toggle();
    } }, vi('order', 'v2-i')));
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
  const ordering = isOpenFold(WA_FOLDS, 'order', false);
  const body = [
    h('header', { class: 'v2-pltop', key: 'plan-top' }, h('h1', { class: 'v2-title' }, v.tab.title), orderToggle(ordering)),
    h('p', { class: 'v2-sub', key: 'plan-sub' }, v.tab.sub)];
  // AC24's state line: in the ordering, always; on Plan itself once it says more than "No changes yet".
  if (ordering || v.changed || v.stateLine.kind === 'current') {
    body.push(h('p', { class: `v2-small v2-plstate ${v.stateLine.kind}`, key: 'wa-state' }, v.stateLine.lead ? [h('b', {}, v.stateLine.lead), ' '] : null, h('span', {}, v.stateLine.rest)));
  }
  if (planDraft.aside) body.push(h('p', { class: 'v2-small v2-plnotice', role: 'status', key: 'wa-aside' }, WA.setAside));
  if (planDraft.failed) body.push(h('p', { class: 'v2-small', key: 'wa-nokeep' }, WA.draftNotKept));
  if (v.orderLine) body.push(h('p', { class: 'v2-small v2-plorder', key: 'wa-order' }, v.orderLine));
  for (const name of v.unread) body.push(h('p', { class: 'v2-small', key: `wa-unread:${name}` }, `${name}: its milestones are ${NOT_AVAILABLE}`));
  if (ordering) {
    body.push(h('section', { class: 'v2-plcard', key: 'wa-card' }, h('p', { class: 'v2-label' }, WA.cardTitle), h('p', { class: 'v2-plbig' }, v.card),
      h('p', { class: 'v2-small' }, WA.cardNote)));
    body.push(v.rows.length ? h('ol', { class: 'v2-rows v2-plflat', key: 'wa-plan', 'aria-label': 'Milestones in your order' }, v.rows.map((r) => planRow(v, r, true)))
      : h('p', { class: 'v2-small', key: 'wa-none' }, 'No milestones to go'));
  } else {
    for (const g of v.groups) {
      // AC90 (P-001-audit-repeat.md, A): a reason two or more of the group's rows share, said once at its head.
      const once = groupOnce(g.rows);
      body.push(h('section', { class: 'v2-plgrp', key: `wa-grp:${g.key}` }, planHead(g.words, g.rows.length, { proj: true }),
        once.lines.length ? h('div', { class: 'v2-plonce', key: `wa-once:${g.key}` }, once.lines.map((l) => h('p', { class: 'v2-small v2-plgap', key: `once:${l.kind}:${l.words}` }, l.words))) : null,
        h('ol', { class: 'v2-rows', 'aria-label': g.words }, g.gate ? planGateRow(g.gate) : null, g.rows.map((r) => planRow(v, r, false, once)))));
    }
    if (!v.rows.length) body.push(h('p', { class: 'v2-small', key: 'wa-none' }, 'No milestones to go'));
  }
  if (ordering || v.changed) {
    body.push(h('div', { class: 'v2-plbar', key: 'wa-bar' }, h('p', { class: 'v2-small v2-plsay', role: 'status' }, v.changed ? WA.changed : WA.noChanges), recordNode(v)));
    // AC17's fallback for the plan, under the bar rather than in it, so the sticky bar stays one line high.
    if (v.record.ok && v.record.link.copy) body.push(copyFallback(v.record.copyWords, v.record.link.copy, 'wa-record', 'Copy the plan'));
  }
  if (v.reached.length) body.push(foldList('reached', `${WA.reached} · ${v.reached.length}`, v.reached, (x) => [' ', h('span', {}, x.date)]));
  if (v.dropped.length) body.push(foldList('dropped', `${WA.dropped} · ${v.dropped.length}`, v.dropped, () => null));
  // AC24's v2.5 lines, after the milestones (AC86: "then AC24's v2.5 lines (not drawn, C); then "Not milestones yet"").
  for (const o of v.older) {
    const b = built.find((x) => x.project === o.project);
    const href = o.path && b && b.snap ? treeLink(o.project, b.snap.tree, o.path) : null;
    body.push(h('section', { class: 'v2-plgrp', key: `wa-old:${o.project.name}` }, planHead(o.project.name, null, { proj: true }),
      h('p', { class: 'v2-body' }, href ? ext(href, o.words, 'v2-inl') : o.words), h('p', { class: 'v2-small' }, WA.olderPipeline)));
  }
  body.push(laterNode(v));
  // AC86, AC87: ideas from the portfolio's idea log, from stage 6b; with no `portfolio` in J7, 6a's words.
  body.push(ideasNode());
  if (v.notes.length && v.planner) {
    body.push(h('p', { class: 'v2-small' }, h('a', { class: 'v2-lnk', href: go('p', v.planner, 'notes'), key: 'wa-notes' }, `Record notes (${v.notes.length})`)));
  }
  const out = [h('section', { class: `sb-screen v2 v2-plan${ordering ? ' ordering' : ''}`, key: 'plan' }, body)];
  const sheet = nav.route.sheet;
  if (sheet && sheet.startsWith('ms:')) {
    const s = planSheet(v, sheet.slice(3));
    if (s) out.push(s);
  }
  return out;
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
  // From stage 5 (AC86): a milestone's sheet over Plan at `work/ms/<project>/<id>` (a sheet is not a screen: no history step).
  // From M3D stage 2 (AC89 (i)): a gate card's sheet opened from Plan sits over Plan, at `work/card/<id>`, so it closes back to Plan.
  if (r0 === 'work') {
    const sheet = name === 'ms' && kind && rest[0] ? `ms:${kind}|${rest[0]}` : name === 'card' && kind ? `card:${[kind, ...rest].join('/')}` : null;
    return { key: 'work', screen: '#/work', kind: 'work', name: null, sheet };
  }
  // AC82: the rest of "Since you last looked", in a sheet over Home (a sheet is not a screen: no history step).
  if (r0 === 'since') return { key: 'home', screen: '#/', kind: 'home', name: null, sheet: 'since' };
  // AC87 (stage 6a): a row of the portfolio's block opens its sheet over Home at `pf/<row>` (a sheet is not a screen: no history step).
  if (r0 === 'pf') return { key: 'home', screen: '#/', kind: 'home', name: null, sheet: PF_ROWS.includes(name) ? `pf:${name}` : null };
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
    const sheet = rest[1] === 'now' ? (rest[2] != null ? `now:${rest[2]}` : 'now') : rest[1] === 'e' && rest[2] != null ? `e:${rest[2]}` : null;
    return { ...base, key: `p/${name}/team/${member}`, screen: go('p', name, 'team', member), kind, member, sheet };
  }
  if (kind === 'pipeline' || kind === 'asked' || kind === 'agents' || kind === 'notes') return { ...base, key: `p/${name}/${kind}`, screen: go('p', name, kind), kind };
  // From stage 3 (AC81, AC83): the project's page, at the Status screen's address, with its sheets over
  // it: "About the phases" (`info`), and the rest's "Value targets" (`values`) and "Experiments" (`experiments`).
  return { ...base, key: `p/${name}`, screen: go('p', name), kind: 'status', sheet: ['info', 'values', 'experiments'].includes(kind) ? kind : null };
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
    // AC89 (i): a sheet a reload brings back puts focus on its close (once it is drawn); closing it returns focus to the
    // card or row it belongs to.
    if (this.route.sheet) {
      this.reopened = true;
      this.sheetOpener = openerOf(this.route);
    }
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
    if (!moved && prev.sheet && !next.sheet) this.focusNext = this.sheetOpener || openerOf(prev);
    else if (!prev.sheet && next.sheet) {
      this.sheetOpener = this.opener;
      this.focusNext = 'sheet-close';
    } else if (moved) this.focusNext = null;
    if (moved || !next.sheet) this.reopened = false;
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

/**
 * The control a sheet belongs to, from its route (AC89 (i)), for a sheet a reload brought back, whose opener this window
 * never saw: its card on the board (its title, or its Done row), its row on Plan, or the control that opens it.
 * Returns a list of keys, the first drawn taking the focus.
 */
function openerOf(r) {
  const sh = r && r.sheet ? String(r.sheet) : null;
  if (!sh) return null;
  if (r.kind === 'waiting') {
    const [id, step] = sh.split('#');
    return step != null ? [`drowlink:${sh}`] : [`cardlink:${id}`, `donelink:${id}`, `step:${id}`];
  }
  if (r.kind === 'work') {
    if (sh.startsWith('card:')) return [`wa-gate:${sh.slice(5)}`];
    if (sh.startsWith('ms:')) {
      const [proj, code] = sh.slice(3).split('|');
      let key = null;
      try {
        const row = workView(Date.now()).rows.find((x) => x.project.name === proj && x.code === code);
        key = row ? `wa-open:${row.key}` : null;
      } catch {
        key = null;
      }
      return key ? [key] : null;
    }
  }
  if (sh === 'since') return ['since-more'];
  if (sh.startsWith('pf:')) return [sh];
  if (sh === 'info') return ['info'];
  if (sh === 'values' || sh === 'experiments') return [`rest:${sh}`];
  if (sh === 'now') return ['log:now'];
  if (sh.startsWith('now:')) return [`log:${sh}`];
  if (sh.startsWith('e:')) return [`log:${sh.slice(2)}`];
  return null;
}

function focusPending() {
  const want = nav.focusNext;
  nav.focusNext = null;
  if (!want) return;
  const view = document.getElementById('view');
  const keys = Array.isArray(want) ? want : [want];
  let el = null;
  let k = keys[0];
  for (const x of keys) {
    el = view ? findKey(view, x) : null;
    if (el) {
      k = x;
      break;
    }
  }
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
/** The same for a "Since you last looked" line (AC82): at most three lines (CSS), the third faded when cut. */
const sinceOver = new Map();
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
    const bt = el.getAttribute('data-bt');
    if (bt != null) {
      const n = hiddenParts(el);
      if (n != null && moreHidden.get(bt) !== n) {
        moreHidden.set(bt, n);
        changed = true;
      }
      return;
    }
    // AC85: a sheet's three-line text (the question's opening, the gate's case). Opened whole, it holds
    // no clip to measure, so its answer stands until it is closed again.
    const clip = el.getAttribute('data-clip');
    if (clip != null) {
      if (clipOpen.has(clip)) return;
      const [csh, cch] = [el.scrollHeight, el.clientHeight];
      if (typeof csh !== 'number' || typeof cch !== 'number' || !cch) return;
      const cover = csh > cch + 1;
      if (clipOver.get(clip) !== cover) {
        clipOver.set(clip, cover);
        changed = true;
      }
      return;
    }
    const sum = el.getAttribute('data-sum');
    const line = el.getAttribute('data-line');
    const ev = el.getAttribute('data-since');
    if (sum == null && line == null && ev == null) return;
    const [sh, ch] = [el.scrollHeight, el.clientHeight];
    if (typeof sh !== 'number' || typeof ch !== 'number' || !ch) return;
    let over = sh > ch + 1;
    if (line != null) {
      if (over && lineOver.get(line) !== true) lineAt.set(line, { text: lineText.get(line), width: window.innerWidth });
      else if (lineOver.get(line) === true && lineStaysOver(line)) over = true;
    }
    const [map, name, k] = sum != null ? [summaryOver, sum, `sum:${sum}`] : line != null ? [lineOver, line, `line:${line}`] : [sinceOver, ev, null];
    if (map.get(name) !== over) {
      map.set(name, over);
      changed = true;
      // A text that now fits has no control, so its bubble closes.
      if (!over && k && bubble.open === k) bubble.close();
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
  // AC87 (stage 6b): a portfolio card's address waits for the portfolio's first read, not the projects'.
  if (name === PF_BOARD) return Boolean(lastPf && lastPf.state !== 'pending');
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
    // From stage 7 (AC88): every trial-view screen is drawn on mockup v2's ground and tokens, the
    // render-error screen among them (sandbox.css, html.v2-page).
    document.documentElement.classList.add('v2-page');
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
  teamIdle.load(store);
  // AC80: the Done marks, in a store of their own, so a failure there shows "Done marks not kept on
  // this device" and nothing else breaks.
  boardState.load(createStore());
  // AC56, changed after MD3: the words typed in sheets' boxes, in a store of their own (DRAFTS_KEY).
  boardState.loadDrafts(createStore(), Date.now());
  // AC56, changed after MD3: the screen's and the open sheet's scroll, kept when the page is hidden, for a full reload.
  const scrollStore = createStore();
  scrollKept.pending = readScroll(scrollStore);
  // J12: the pull requests are kept under their own key in a store of their own, so a write that
  // fails there (the device's storage full) turns off only that key, never the blob cache.
  const pullsStore = createStore();
  // AC80: the waited reads' 5 a head, kept across openings under desk-board-waits-v1.
  const waitsStore = createStore();
  // J24: the commits read is due only for a pull request updated since AC40's "last looked" (or whose head changed while open).
  const desk = createDesk({ config: CONFIG, call, clock, store, pullsStore, waitsStore, isVisible, onChange: () => render(), j11: true,
    lastLooked: () => (seen.off ? null : seen.reference) });
  DESK = desk;
  ns.store = store;
  ns.looked = false;
  // AC74: `?sandbox&open=<key>`: followed once its project is read; the address keeps `?sandbox` only.
  Object.assign(opening, { target: openTarget(location.search), done: false, banner: null });
  if (!opening.target) opening.done = true;
  try {
    if (opening.target && typeof history !== 'undefined' && history.replaceState) history.replaceState(null, '', deskAddress(location.pathname, '', location.hash));
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
    fitTimelineHead();
    measureClips();
    // AC89 (i): a sheet a reload brought back takes the focus on its close, once it is drawn.
    if (nav.reopened && nav.route.sheet && findKey(view, 'sheet-close')) {
      nav.reopened = false;
      focusKey('sheet-close');
    }
    // AC56, changed: after a full reload, the screen's and the sheet's scroll as they were, once there is room for it.
    restoreScroll(view, desk);
    // The Timeline just opened: scroll to its Now line (or the sprint) once it is drawn (AC59).
    if (nav.scrollTo && nav.route.kind === 'timeline') {
      const t = nav.scrollTo;
      if (scrollToTarget(t)) nav.scrollTo = null;
    }
  };
  render = guardRender(draw, (state) => {
    if (stateEl) stateEl.textContent = state.text;
    show(h('section', { class: 'sb-screen' }, h('p', { class: 'sb-stale' }, state.text), h('p', {}, h('a', { href: '#/' }, 'Home'))));
  }, () => desk.signedOut);
  function draw() {
    const now = new Date(Date.now());
    // AC89 (i): while the "<n> more" sheet is open, "last looked" holds, so a reload brings it back with its lines.
    seen.hold(nav.route.kind === 'home' && nav.route.sheet === 'since');
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
    // J23 (stage 6b): the portfolio as last read, in words; null with no `portfolio` in J7 (6a's state).
    try {
      lastPf = portfolioRead(desk.portfolio ? desk.portfolio() : null, now.getTime(), TZ);
    } catch {
      lastPf = null;
    }
    // AC80: the board, its marks judged at each successful poll; every count less the marked cards.
    const bd = boardOf(built, now.getTime(), nav.route.kind === 'waiting' ? nav.route.only : null);
    lastBoard = bd;
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
    const boxes = sandboxBoxes(built);
    const s = withPortfolio(screenState(boxes, desk.signedOut), boxes, desk.signedOut);
    if (stateEl) stateEl.textContent = desk.signedOut ? SIGNED_OUT_STATE.text : s.text;
    document.title = `Service Desk — ${desk.signedOut ? SIGNED_OUT_STATE.text : s.text}`; // the desk's name, then its state line (from stage 8; "Sandbox — " before)
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
        node = h('section', { class: 'sb-screen' }, h('p', { class: 'sb-stale' }, `Can't show Waiting: ${errorText(err)}`));
      }
    } else if (r.name) {
      const name = r.name;
      const b = built.find((x) => x.project.name === name);
      if (!b) node = h('section', { class: 'sb-screen' }, h('p', {}, 'No such project. ', h('a', { href: '#/' }, 'Home')));
      else if (b.error) {
        node = h('section', { class: 'sb-screen v2 v2-proj' }, h('header', { class: 'v2-ptop' }, backControl('#/')),
          h('h1', { class: 'v2-title' }, name), h('p', { class: 'v2-small bad' }, b.box.drawError || `Can't show this project: ${errorText(b.error)}`));
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
            const cut = r.sheet ? r.sheet.indexOf(':') : -1;
            const [sub, idx] = !r.sheet ? [null, null] : cut < 0 ? [r.sheet, null] : [r.sheet.slice(0, cut), r.sheet.slice(cut + 1)];
            node = renderTeam(b, r.member || null, sub, idx);
          } else if (r.kind === 'pipeline') node = b.project.model === 'v3' ? renderTimeline(b) : renderPipeline(b);
          else if (r.kind === 'asked') node = renderAsked(b);
          else if (r.kind === 'agents') node = renderAgents(b);
          else node = renderPage(b, bd);
        } catch (err) {
          node = h('section', { class: 'sb-screen v2 v2-proj' }, h('header', { class: 'v2-ptop' }, backControl('#/')),
            h('h1', { class: 'v2-title' }, name), h('p', { class: 'v2-small bad' }, `Can't show this project: ${errorText(err)}`));
        }
      }
    } else if (r.kind === 'work') {
      try {
        node = renderWorkAhead(built, now.getTime());
        // AC89 (i): a gate card's sheet over Plan, closing back to Plan with focus on its row.
        if (r.sheet && r.sheet.startsWith('card:')) node = [node, cardSheet(bd, built, null, r.sheet.slice(5), '#/work')];
      } catch (err) {
        node = h('section', { class: 'sb-screen v2 v2-plan' }, h('header', { class: 'v2-pltop' }, h('h1', { class: 'v2-title' }, WA.planTitle)),
          h('p', { class: 'v2-small bad' }, `Can't show Plan: ${errorText(err)}`));
      }
    } else node = renderHome(desk, built, seen, now.getTime(), bd);
    // AC81: the bar Home · Waiting · Plan, the only bar at the foot of every trial-view screen; a
    // project's screens count as Home's.
    try {
      // The Waiting screen is drawn on mockup v2's ground (sandbox.css, html.v2-page); from stage 3 the
      // project's page and its Timeline too (AC83, AC84); from stage 5 Plan (AC86); and from stage 7
      // every trial-view screen, the ones no frame redraws among them, in both themes (AC88).
      document.documentElement.classList.add('v2-page');
      // AC82: Home's column widens to two tiles a row from 720 px (sandbox.css). The root's class is its
      // own: Home's section is `.v2-home`, a grid, which the root must not become (the Design reviewer's
      // B1, stage 2 round 1).
      document.documentElement.classList.toggle('v2-home-page', r.kind === 'home');
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
    if (isVisible()) {
      seen.visible();
      // Back without a reload: the page kept its own scroll, so the kept one is not needed.
      forgetScroll(scrollStore);
    } else {
      seen.hidden();
      keepScroll(scrollStore, view);
    }
    desk.visibilityChanged();
  });
  window.addEventListener('pagehide', () => {
    seen.hidden();
    keepScroll(scrollStore, view);
  });
  // The owner's own scrolling or tapping ends a scroll still being put back (AC56, changed).
  for (const t of ['pointerdown', 'wheel', 'touchstart', 'keydown']) {
    try {
      document.addEventListener(t, () => { scrollKept.pending = null; }, { passive: true });
    } catch {
      // no such event here
    }
  }
  // AC89 (i): Tab and Shift-Tab stay inside an open sheet.
  document.addEventListener('keydown', (e) => trapTab(e, view));
  window.addEventListener('resize', () => {
    fitBranches();
    fitTimelineHead();
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

// ---------------------------------------------------------------------------
// AC56, changed after MD3 (P-001-audit-reload.md, A): the scroll of the screen and of the open sheet comes back after a
// full reload, on this device only (SCROLL_KEY, through the wrapped store). It is kept when the page is hidden, which
// comes before iOS reloads a Home Screen app, and put back after the reload while the address is the same, at each
// drawing until every project has been read once (so the screen is tall enough) or the owner scrolls or taps first.

export const SCROLL_KEY = 'desk-scroll-v1';
const scrollKept = { pending: null };
function readScroll(store) {
  try {
    const v = store.getJSON(SCROLL_KEY, null);
    store.remove(SCROLL_KEY);
    if (!v || typeof v.hash !== 'string' || !Number.isFinite(v.y)) return null;
    return { hash: v.hash, y: Math.max(0, v.y), sheetY: Number.isFinite(v.sheetY) ? Math.max(0, v.sheetY) : 0 };
  } catch {
    return null;
  }
}
const openSheetEl = (view) => findClass(view, 'v2-sheet') || findClass(view, 'sb-sheet');
function keepScroll(store, view) {
  try {
    const sh = openSheetEl(view);
    store.setJSON(SCROLL_KEY, { hash: location.hash || '', y: Math.round(window.scrollY || 0), sheetY: sh ? Math.round(sh.scrollTop || 0) : 0 });
  } catch {
    // a reload then opens at the top, as before
  }
}
function forgetScroll(store) {
  try {
    store.remove(SCROLL_KEY);
  } catch {
    // nothing kept
  }
}
function restoreScroll(view, desk) {
  const k = scrollKept.pending;
  if (!k) return;
  if (k.hash !== (location.hash || '')) {
    scrollKept.pending = null;
    return;
  }
  try {
    if (k.y && typeof window.scrollTo === 'function') window.scrollTo(0, k.y);
    const sh = openSheetEl(view);
    if (sh && k.sheetY) sh.scrollTop = k.sheetY;
    const states = desk && desk.states ? [...desk.states.values()] : [];
    const allRead = states.length > 0 && states.every((st) => st.lastSuccessAt != null || st.failure);
    // Done once both are where they were, or a few drawings after every project was first read (the screen is then as
    // tall as it gets; a shorter one keeps the browser's nearest place).
    const there = Math.abs((window.scrollY || 0) - k.y) <= 1 && (!k.sheetY || (sh && Math.abs((sh.scrollTop || 0) - k.sheetY) <= 1));
    if (allRead) k.tries = (k.tries || 0) + 1;
    if (allRead && (there || k.tries > 5)) scrollKept.pending = null;
  } catch {
    scrollKept.pending = null;
  }
}

// AC89 (i): Tab and Shift-Tab stay inside an open sheet (each sheet is a modal dialog, AC56).
function focusables(root) {
  const out = [];
  const closedIn = (el) => {
    for (let n = el.parentNode; n && n !== root && n.tagName; n = n.parentNode) {
      if (tagOf(n) === 'details' && !(n.hasAttribute && n.hasAttribute('open')) && !(tagOf(el) === 'summary' && el.parentNode === n)) return true;
    }
    return false;
  };
  eachElement(root, (el) => {
    const tag = tagOf(el);
    const attr = (a) => (el.getAttribute ? el.getAttribute(a) : null);
    const can = (tag === 'a' && attr('href') != null) || ['button', 'textarea', 'input', 'select', 'summary'].includes(tag) || (attr('tabindex') != null && attr('tabindex') !== '-1');
    if (!can || attr('tabindex') === '-1' || attr('disabled') != null || el.hidden || closedIn(el)) return;
    if (tag === 'summary' && !(el.parentNode && tagOf(el.parentNode) === 'details')) return;
    out.push(el);
  });
  return out;
}
function trapTab(e, view) {
  if (!e || e.key !== 'Tab' || !nav.route.sheet) return;
  let dialog = null;
  eachElement(view, (el) => { if (!dialog && el.getAttribute && el.getAttribute('role') === 'dialog' && el.getAttribute('aria-modal') === 'true') dialog = el; });
  if (!dialog) return;
  const list = focusables(dialog);
  if (!list.length) return;
  const i = list.indexOf(document.activeElement);
  let to = null;
  if (e.shiftKey) to = i <= 0 ? list[list.length - 1] : null;
  else to = i === -1 || i === list.length - 1 ? list[0] : null;
  if (!to) return;
  if (e.preventDefault) e.preventDefault();
  try {
    to.focus();
  } catch {
    // focus is a courtesy
  }
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
