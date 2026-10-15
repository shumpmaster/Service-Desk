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
import { safeBox, orderBoxes, screenState } from './lib/universe.js';
import { renderMarkdown } from './lib/markdown.js';
import { hhmm, durationText, whenText } from './lib/timefmt.js';
import { v5Footer } from './lib/asked.js';
import { routeParts, guardRender, boot, SIGNED_OUT_STATE } from './lib/page.js';
import { createSeen } from './lib/seen.js';
import {
  SANDBOX_MARKER, DEFERRED_WORDS, NOT_RECORDED, NOT_AVAILABLE, V25_NOT_RECORDED, OWNER_NEXT_LINES,
  j11Records, timelineOf, phaseView, finishedWords, phaseMilestones, whereLine, queueView, pillView, ballLines,
  sheetView, trackerSteps, doneToday, cardBoxText, questionBoxText, VERDICT_START, ruleLine, boxPlan, GROUPS, treeLink, waitWords, youWaitText,
} from './lib/sandbox.js';
import { timelineView, teamView, memberPage, workingNow, summarySheet } from './lib/sandbox.js';

let CONFIG = DEFAULT_CONFIG; // J7; the tests pass their own (AC42's five projects)
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
  if (!(type in el._on)) el.addEventListener(type, (e) => (el._on[type] ? el._on[type](e) : undefined));
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
  chat: ['M5 6h14v9H9l-4 4z'],
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
// State kept for the open window only (never stored): what was opened in GitHub, and items that
// left the queue while the page was open (AC52's confirmation and "Done today").

const session = new Map(); // project → { opened: Set(key), last: Map(key → row), left: [{ key, text }], prev: Set(key) }
function sessionOf(name) {
  if (!session.has(name)) session.set(name, { opened: new Set(), last: new Map(), left: [], prev: null, drafts: new Map(), chosen: new Map() });
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
        s.left.push({ key: k, text: `${r.text}${r.code ? ` (${r.code})` : ''}: no longer open, time not recorded` });
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
  return { project, box, model, snap, j, tl, pv, q, where: whereLine(project, model, tl, pv),
    ball: ballLines(project, model, snap, j, q, now, TZ), pill: pillView(box, q, now.getTime()) };
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

function checklist(pv) {
  const rows = pv.tracked && pv.phases.length ? pv.phases : ['Discovery', 'Design', 'Build', 'Launch'].map((phase) => ({ phase, word: null }));
  return h('div', { class: `sb-ck${pv.done ? ' done' : ''}` },
    h('p', { class: 'sb-ck-hd' }, h('span', {}, 'Phases'), h('span', {}, finishedWords(pv))),
    h('ol', {}, rows.map((p) => h('li', { class: p.now ? 'now' : p.word === 'Finished' ? 'fin' : '' },
      circle(p.word === 'Finished' ? 'tick' : p.now ? 'ring' : 'empty'),
      h('span', { class: 'sb-ck-name' }, p.phase),
      p.word ? h('em', {}, p.now ? `now${p.iteration > 1 ? ` · i${p.iteration}` : ''}` : p.word === 'Finished' ? 'Finished' : p.word) : null)),
    h('li', { class: 'sb-ck-done' }, circle(pv.done ? 'tick' : 'empty'), h('span', { class: 'sb-ck-name' }, 'Done'), h('em', {}, pv.done ? 'Done' : ''))),
    pv.done ? h('span', { class: 'sb-stamp', 'aria-hidden': 'true' }, 'DONE') : null);
}

function ballNode(ball, compact) {
  return h('ul', { class: 'sb-ball' }, (compact ? ball.slice(0, 2) : ball).map((b) => h('li', { class: `who-${b.who}` },
    h('span', { class: `sb-light${b.lit ? ' lit' : ''}`, 'aria-hidden': 'true' }),
    b.who === 'you' ? h('span', { live: () => youWaitText(b.oldest, Date.now()) }) : b.text)));
}

function homeCard(p, seen, now) {
  const { project, box, pill, pv, where, ball, q } = p;
  const name = project.name;
  const newCount = q.rows.filter((r) => seen.isNew(r.raisedAt)).length;
  return h('article', { class: 'sb-pc' },
    h('a', { class: 'sb-pc-main', href: go('p', name) },
      h('div', { class: 'sb-pc-top' }, h('span', { class: 'sb-app' }, icon('project')),
        newCount ? h('span', { class: 'sb-new' }, `${newCount} new since you last looked`) : null),
      h('h2', { class: 'sb-nm' }, name),
      h('p', { class: 'sb-where' }, where.sentence),
      checklist(pv),
      ballNode(ball, true),
      readLine(box)),
    h('a', { class: `sb-pill ${pill.kind}`, href: go('p', name, 'queue') }, pill.text));
}

function renderHome(desk, built, seen, now) {
  const order = orderBoxes(built.map((b) => b.box));
  const total = built.reduce((n, b) => n + (b.box.flaggedCount || 0), 0);
  const s = screenState(built.map((b) => b.box), desk.signedOut);
  const lastRead = Math.max(...built.map((b) => (b.box.read && b.box.read.since) || 0));
  return h('section', { class: 'sb-screen sb-home' },
    marker(),
    h('header', { class: 'sb-hdr home' }, h('div', { class: 'sb-hdr-t' }, h('h1', {}, 'Your desk'))),
    h('p', { class: `sb-top ${s.quiet ? 'quiet' : total ? 'you' : ''}`, role: 'status' },
      desk.signedOut ? SIGNED_OUT_STATE.text : total ? `${total} waiting on you in all` : s.text,
      lastRead ? h('span', { class: 'sb-muted' }, ` · last read ${hhmm(new Date(lastRead), TZ)}`) : null),
    seen.words ? h('p', { class: 'sb-muted small' }, seen.words) : null,
    h('div', { class: 'sb-grid' }, order.map((box) => {
      const b = built.find((x) => x.box === box);
      try {
        if (b.error) throw b.error;
        return homeCard(b, seen, now);
      } catch (err) {
        return h('article', { class: 'sb-pc bad' }, h('h2', { class: 'sb-nm' }, box.name),
          h('p', { class: 'sb-stale' }, box.drawError || `Can't show this project: ${errorText(err)}`));
      }
    })),
    h('p', { class: 'sb-v5' }, v5Line(built)),
    h('div', { class: 'sb-band' },
      h('button', { type: 'button', class: 'sb-composer', 'aria-disabled': 'true', disabled: true },
        icon('chat'), h('span', {}, 'Tell your Chief of Staff…')),
      h('p', { class: 'sb-deferred' }, DEFERRED_WORDS)));
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

function phaseRow(p, ph, openByDefault) {
  const m = phaseMilestones(p.project, p.snap.tree, p.tl, ph);
  const word = ph.now ? `${ph.phase} i${ph.iteration}` : ph.word;
  const det = h('details', { class: `sb-phase${ph.now ? ' now' : ''}`, key: `phase:${ph.phase}`, open: openByDefault ? true : null },
    h('summary', {},
      circle(ph.word === 'Finished' ? 'tick' : ph.now ? 'ring' : 'empty'),
      h('span', { class: 'sb-ph-name' }, ph.phase),
      ph.now ? h('span', { class: 'sb-nowtag' }, 'NOW') : null,
      h('span', { class: 'sb-ph-word' }, word)),
    h('div', { class: 'sb-ms' },
      m.runLabel ? h('p', { class: 'sb-muted small' }, `From the model's timeline, ${m.runLabel}`) : h('p', { class: 'sb-muted small' }, `No run of this phase: ${NOT_RECORDED}`),
      m.standard.length ? h('details', { class: 'sb-std', key: `phase-std:${ph.phase}` },
        h('summary', {}, h('span', {}, 'Standard milestones'), h('span', { class: 'sb-muted' }, m.counts)),
        h('ul', { class: 'sb-mlist' }, m.standard.map((s) => h('li', {}, msMark(s.word), h('span', {}, s.name, ' ', code(s.id)),
          h('em', {}, s.from ? `${s.word} from ${s.from}` : s.word))))) : null,
      m.own.length ? h('ul', { class: 'sb-mlist own' }, m.own.map((o) => h('li', {}, msMark(o.word),
        h('div', {}, h('strong', {}, o.name), ' ', code(o.id),
          h('p', { class: 'sb-muted small' }, `Done when ${o.done}`),
          o.sprints.length ? h('p', { class: 'small' }, 'Sprints: ', o.sprints.map((s, i) => [i ? ', ' : '', s.link ? ext(s.link, s.id) : h('span', {}, s.id, ' (no file recorded)')])) : null),
        h('em', {}, o.word)))) : h('p', { class: 'sb-muted small' }, "This project's own milestones: none in this phase")));
  return det;
}

function msMark(word) {
  if (word === 'reached' || word === 'carried over') return circle('tick');
  if (word === 'work filed' || word === 'not reached') return circle('ring');
  if (word === 'not recorded' || word === 'not needed') return circle('hatch');
  return circle('empty');
}

function renderStatus(p) {
  const { project, model, pv, where, q, ball } = p;
  const name = project.name;
  const queueWords = q.waiting ? `${p.pill.text} ›` : `Nothing waits on you in ${name} ›`;
  const body = [
    marker(),
    projectHeader(name, 'Current status'),
    h('p', { class: 'sb-lead' }, where.sentence),
    h('div', { class: 'sb-actions' },
      h('a', { class: `sb-btn ${q.waiting ? 'you' : ''}`, href: go('p', name, 'queue') }, queueWords),
      h('a', { class: 'sb-btn ghost', href: go('p', name, 'team') }, ball[0].who === 'you' ? null : h('span', { class: `sb-light${ball.some((b) => b.lit) ? ' lit' : ''}`, 'aria-hidden': 'true' }), `Team: ${ball[0].text} ›`)),
    readLine(p.box),
  ];
  if (!pv.tracked) {
    body.push(h('section', { class: 'sb-card' }, h('h2', { class: 'sb-h2' }, pv.why), h('p', { class: 'sb-muted' }, pv.detail)));
  } else {
    body.push(h('h2', { class: 'sb-h2' }, `The four phases, in order · ${finishedWords(pv)}`));
    body.push(h('div', { class: 'sb-phases' }, pv.phases.map((ph) => phaseRow(p, ph, ph.now)),
      h('div', { class: `sb-phase done-row${pv.done ? ' done' : ''}` }, circle(pv.done ? 'tick' : 'empty'), h('span', { class: 'sb-ph-name' }, 'Done'),
        h('span', { class: 'sb-ph-word' }, pv.done ? 'Done' : 'after the Launch gate'))));
  }
  if (project.model !== 'v3' && model) {
    body.push(h('section', { class: 'sb-card' }, h('h2', { class: 'sb-h2' }, 'Reduced view (operating model v2.5.1)'),
      h('dl', { class: 'sb-dl' }, h('dt', {}, 'Sprint'), h('dd', {}, model.sprint.title || model.sprint.note),
        h('dt', {}, 'Latest'), h('dd', {}, model.headline.text), h('dt', {}, 'Next'), h('dd', {}, model.headline.next || NOT_RECORDED),
        h('dt', {}, 'Items'), h('dd', {}, V25_NOT_RECORDED))));
  }
  body.push(h('p', {}, opener('info', go('p', name, 'info'), { class: 'sb-infobtn' }, icon('info'), 'About the phases')));
  body.push(h('details', { class: 'sb-card sb-more', key: 'more-detail-fold' }, h('summary', { key: 'more-detail' }, h('span', { class: 'sb-h2 flat' }, 'More detail')),
    h('p', { class: 'sb-muted small' }, `CI on ${project.defaultBranch}: ${model ? model.ci : NOT_RECORDED}`),
    h('ul', { class: 'sb-links' },
      h('li', {}, h('a', { href: `./#/p/${encodeURIComponent(name)}` }, 'Pipeline, waits, CI and activity'), h('span', { class: 'sb-muted small' }, ' (the current desk view)')),
      h('li', {}, h('a', { href: `./#/p/${encodeURIComponent(name)}/asked` }, 'Time asked of you'), h('span', { class: 'sb-muted small' }, ' (the current desk view)')),
      project.model === 'v3' ? h('li', {}, h('a', { href: `./#/p/${encodeURIComponent(name)}/agents` }, 'Agents and usage'), h('span', { class: 'sb-muted small' }, ' (the current desk view)')) : null)));
  const out = [h('section', { class: 'sb-screen' }, body, bottomBar(name, 'status', q.waiting))];
  if (nav.route.sheet === 'info') {
    out.push(sheetFrame(go('p', name), 'About the phases', [
      h('ol', { class: 'sb-six' }, SIX.map((x) => h('li', {}, x))),
      h('p', { class: 'sb-muted small' }, 'The desk shows the first four, then Done: where a project stands once you pass its Launch gate. A finished phase reads "Finished".')]));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Queue and the response sheet (AC52, AC53)

function queueRow(p, row, s) {
  const opened = s.opened.has(row.key);
  return h('li', { class: `sb-qrow g-${row.group}`, key: `qrow:${row.key}` },
    opener(`row:${row.key}`, go('p', p.project.name, 'queue', row.key), {},
      h('span', { class: 'sb-qt' }, row.text, ' ', code(row.code)),
      h('span', { class: 'sb-muted small' }, h('span', { live: () => waitWords(row.raisedAt, Date.now()) }), opened ? ' · opened in GitHub' : '')));
}

function renderQueue(p, key) {
  const { project, q } = p;
  const name = project.name;
  const s = sessionOf(name);
  const fresh = p.box.read && p.box.read.read === 'ok';
  const body = [marker(), projectHeader(name, 'Queue', q.waiting ? `${q.waiting} waiting on you` : null)];
  if (!q.waiting && fresh) body.push(h('p', { class: 'sb-lead' }, `Nothing waits on you in ${name}`));
  else if (!q.waiting) body.push(readLine(p.box));
  body.push(h('div', { class: 'sb-groups' }, q.groups.map((g) => {
    const head = h('h2', { class: `sb-gh g-${g.key}` }, h('span', { 'aria-hidden': 'true', class: 'sb-shape' }, g.shape), g.title,
      h('span', { class: 'sb-gcount' }, g.count == null ? NOT_RECORDED : g.count ? String(g.count) : 'none'));
    if (g.line) return h('section', { class: `sb-group g-${g.key} empty`, key: `group:${g.key}` }, head, h('p', { class: 'sb-muted small' }, g.line));
    if (!g.items.length) return h('section', { class: `sb-group g-${g.key} empty`, key: `group:${g.key}` }, head);
    if (g.key === 'deploys') {
      return h('section', { class: `sb-group g-${g.key}`, key: `group:${g.key}` }, head,
        h('p', { class: 'sb-muted small' }, 'Shown, not counted: a deploy waiting for approval is not one of the things that need you. Its approver: not recorded.'),
        h('ul', { class: 'sb-qlist' }, g.items.map((d) => h('li', { class: 'sb-qrow g-deploys', key: `qrow:${d.key}` }, ext(d.link, d.text) || d.text, ' ', code(d.code)))));
    }
    return h('section', { class: `sb-group g-${g.key}`, key: `group:${g.key}` }, head, h('ul', { class: 'sb-qlist' }, g.items.map((r) => queueRow(p, r, s))));
  })));
  const done = doneToday(project, p.model, p.snap, new Date(Date.now()), TZ);
  body.push(h('details', { class: 'sb-card sb-donetoday', key: 'done-today' }, h('summary', {}, `Done today (${done.length + s.left.length})`),
    done.length || s.left.length ? h('ul', { class: 'sb-qlist' }, done.map((d) => h('li', {}, d.text, ' ', h('span', { class: 'sb-muted small' }, d.words))),
      s.left.map((x) => h('li', {}, x.text))) : h('p', { class: 'sb-muted small' }, 'Nothing answered today yet.')));
  const out = [h('section', { class: 'sb-screen' }, body, bottomBar(name, 'queue', q.waiting))];
  if (key != null) out.push(sheet(p, key));
  return out;
}

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
    oninput: (e) => {
      draft.text = e && e.target && typeof e.target.value === 'string' ? e.target.value : ta.value;
      draft.edited = true;
      render();
    } });
  ta.value = draft.text;
  const r = ruleLine(target.form, draft.text, target);
  const plan = boxPlan(p.project, CONFIG.linkCap, target, draft.text);
  const nodes = [];
  if (plan.warning) nodes.push(h('p', { class: 'sb-warn' }, plan.warning));
  if (plan.words) nodes.push(h('p', { class: 'sb-muted small' }, plan.words));
  if (plan.offer === 'link') {
    nodes.push(h('a', { class: 'sb-go', key: `go:${key}`, href: plan.url, rel: 'noopener noreferrer', target: '_blank', onclick: () => {
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
  return h('div', { class: 'sb-box' }, ta,
    h('p', { class: `sb-rule ${r.ok ? 'ok' : 'warn'}`, role: 'status' }, r.words),
    h('p', { class: 'sb-muted small' }, plan.path ? `Writes ${plan.path} on ${plan.branch}` : ''),
    h('div', { class: 'sb-act' }, nodes));
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
  } else if (v.options && v.options.length) {
    const chosen = s.chosen.get(key) || null;
    parts.push(h('div', { class: 'sb-sec' }, h('h3', {}, 'Your answer'),
      h('div', { class: 'sb-chips', role: 'radiogroup', 'aria-label': 'Options' }, v.options.map((o) => h('button', {
        type: 'button', class: `sb-chip${chosen === o.value ? ' on' : ''}`, role: 'radio', 'aria-checked': chosen === o.value ? 'true' : 'false', key: `chip:${o.value}`,
        onclick: () => {
          s.chosen.set(key, o.value);
          const d = s.drafts.get(`${row.key}:${v.box.form}`);
          if (d) d.edited = false;
          render();
        },
      }, h('strong', {}, o.value), o.text && v.kind === 'question' ? ` ${o.text}` : ''))),
      v.recommendation ? h('p', { class: 'sb-rec' }, h('span', { class: 'sb-tag' }, 'Recommendation'), ' ', v.recommendation, h('span', { class: 'sb-muted small' }, ' (labelled, never picked for you)')) : null,
      chosen ? h('p', { class: 'small' }, h('strong', {}, 'What happens next: '), (v.options.find((o) => o.value === chosen) || {}).then || NOT_RECORDED) : h('p', { class: 'sb-muted small' }, 'Pick an option: the box below fills in.'),
      chosen ? textBox(p, row, v.box, v.box.form === 'card' ? cardBoxText(chosen, v.gateCard) : questionBoxText(chosen, v.box.name), opened) : null));
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

function stepNode(st) {
  if (st.day) return h('li', { class: 'sb-day' }, st.day);
  return h('li', { class: `sb-step who-${st.who}` }, h('span', { class: 'sb-step-i', 'aria-hidden': 'true' }, st.mark),
    h('div', {}, h('span', {}, st.text, st.note ? h('span', { class: 'sb-note' }, ` · ${st.note}`) : null),
      h('span', { class: 'sb-muted small' }, st.link ? ext(st.link, 'From the record') : 'no file recorded')));
}

function partNode(part) {
  const head = part.kind.startsWith('ms')
    ? h('details', { class: 'sb-mhead', key: `ms:${part.code}`, open: part.open ? true : null },
      h('summary', {}, h('strong', {}, part.heading), ' ', code(part.code), h('em', {}, part.word)),
      h('div', { class: 'sb-mdetail' }, h('p', { class: 'sb-muted small' }, part.detail)))
    : h('h3', { class: 'sb-part-h' }, part.heading);
  return h('li', { class: `sb-part ${part.kind}` }, head, h('ol', { class: 'sb-steps' }, part.steps.map(stepNode)));
}

function renderTimeline(p, runKey) {
  const name = p.project.name;
  const tv = timelineView(p.project, p.snap.tree, p.tl, p.pv, p.j, runKey, TZ);
  const body = [marker(), projectHeader(name, 'Timeline', tv.title)];
  if (!tv.ok) {
    body.push(h('section', { class: 'sb-card' }, h('p', {}, tv.words)));
    return h('section', { class: 'sb-screen' }, body, bottomBar(name, 'timeline', p.q.waiting));
  }
  body.push(h('div', { class: 'sb-strip', role: 'list' }, tv.strip.map((ph) => h('a', {
    role: 'listitem', class: `sb-strip-ph${ph.current ? ' cur' : ''}${ph.done ? ' doneph' : ''}`,
    href: ph.runKey ? go('p', name, 'timeline', ph.runKey) : null, 'aria-current': ph.current ? 'true' : null,
  }, h('span', { class: 'sb-strip-n' }, ph.short), h('span', { class: 'sb-strip-i' }, ph.iters || '–'),
  h('span', { class: 'sb-dots' }, ph.dots.map((d) => h('span', { class: `sb-d ${d.kind}`, title: `${d.name}: ${d.word}`, 'aria-label': `${d.name}: ${d.word}` })))))));
  body.push(h('p', { class: 'sb-key' }, tv.key));
  if (tv.switcher.length > 1) {
    body.push(h('div', { class: 'sb-switch' }, tv.switcher.map((s) => h('a', { class: `sb-chip${s.current ? ' on' : ''}`, href: go('p', name, 'timeline', s.key) }, s.label))));
  }
  const r = tv.run;
  body.push(h('section', { class: 'sb-run', key: `run:${r.key}` },
    h('h2', { class: 'sb-h2' }, r.label),
    h('p', { class: 'sb-lead small' }, r.sentence),
    h('details', { class: 'sb-std', key: `std:${r.key}` }, h('summary', {}, h('span', {}, 'Standard milestones'), h('span', { class: 'sb-muted' }, r.standardCounts)),
      h('ul', { class: 'sb-mlist' }, r.standard.map((s) => h('li', {}, msMark(s.word), h('span', {}, s.name, ' ', code(s.id)), h('em', {}, s.word))))),
    h('ol', { class: 'sb-line' }, r.parts.map(partNode))));
  return h('section', { class: 'sb-screen' }, body, bottomBar(name, 'timeline', p.q.waiting));
}

function renderTeam(p, member, sub, idx) {
  const name = p.project.name;
  const now = new Date(Date.now());
  const tv = teamView(p.project, p.model, p.snap, p.j, p.q, p.ball, now, TZ);
  if (member) return renderMember(p, tv, member, sub, idx, now);
  const body = [marker(), projectHeader(name, 'Team')];
  body.push(h('h2', { class: 'sb-h2' }, 'Who has the ball'), ballNode(p.ball, false));
  if (tv.note) body.push(h('p', { class: 'sb-muted small' }, tv.note));
  const you = tv.owner;
  body.push(h('a', { class: 'sb-you', href: go('p', name, 'team', 'owner') },
    h('p', { class: 'sb-eyebrow' }, 'You'),
    h('p', { class: `sb-you-st ${you.waiting ? 'you' : ''}` }, you.status),
    you.next.length ? h('ol', { class: 'sb-next' }, you.next.map((n, i) => h('li', {}, h('span', { class: 'sb-tag' }, i === 0 ? 'Next' : i === 1 ? 'Then' : 'Later'),
      h('span', {}, n.text, ' ', code(n.code), h('span', { class: 'sb-muted small', live: () => ` · ${waitWords(n.raisedAt, Date.now())}` }))))) : h('p', { class: 'sb-muted small' }, 'Nothing in your queue.')));
  body.push(h('div', { class: 'sb-tiles' }, tv.members.map((m) => h('a', { class: `sb-tile${m.lit ? ' lit' : ''}`, href: go('p', name, 'team', m.id) },
    h('span', { class: `sb-light${m.lit ? ' lit' : ''}${m.glow ? ' glow' : ''}`, 'aria-hidden': 'true' }),
    h('strong', {}, m.label), h('span', { class: 'sb-tile-st' }, m.status), h('span', { class: 'sb-muted small' }, m.last)))));
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
  if (!page.log.length) body.push(h('p', { class: 'sb-muted' }, page.logWords));
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

/** The running log as a branch timeline (AC49): newest at the top, a lane per item, a shade per lane. */
function branchLog(p, page) {
  const lanes = page.lanes;
  const w = 14 + lanes.length * 12;
  return h('ol', { class: 'sb-branch' }, page.log.map((e, i) => {
    const s = document.createElementNS(SVGNS, 'svg');
    s.setAttribute('viewBox', `0 0 ${w} 40`);
    s.setAttribute('width', String(w));
    s.setAttribute('height', '40');
    s.setAttribute('class', 'sb-lanes');
    s.setAttribute('aria-hidden', 'true');
    const line = (x1, y1, x2, y2, cls) => {
      const l = document.createElementNS(SVGNS, 'path');
      l.setAttribute('d', `M${x1} ${y1} L${x2} ${y2}`);
      l.setAttribute('class', cls);
      s.append(l);
    };
    line(6, 0, 6, 40, 'main');
    lanes.forEach((ln, li) => {
      if (e.activeLanes.includes(ln)) line(18 + li * 12, 0, 18 + li * 12, 40, `lane shade-${li % 4}`);
    });
    const li = lanes.indexOf(e.lane);
    const x = li >= 0 ? 18 + li * 12 : 6;
    if (e.joins && li >= 0) line(x, 20, 6, 32, `lane shade-${li % 4}`);
    if (e.opens && li >= 0) line(6, 36, x, 22, `lane shade-${li % 4}`);
    const dot = document.createElementNS(SVGNS, 'circle');
    dot.setAttribute('cx', String(x));
    dot.setAttribute('cy', '20');
    dot.setAttribute('r', e.now ? '5' : '3.5');
    dot.setAttribute('class', `dot shade-${li >= 0 ? li % 4 : 'main'}${e.now ? ' now' : ''}`);
    s.append(dot);
    const href = e.now ? go('p', p.project.name, 'team', page.id, 'now') : go('p', p.project.name, 'team', page.id, 'e', String(i));
    return h('li', { class: `sb-brow${e.now ? ' now' : ''}` }, s,
      opener(e.now ? 'log:now' : `log:${i}`, href, {}, h('span', {}, e.text), e.now ? h('span', { class: 'sb-nowtag' }, 'now') : null, h('span', { class: 'sb-muted small' }, e.lane || 'project')));
  }));
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
  if (kind === 'timeline') return { ...base, key: `p/${name}/timeline`, screen: rest[0] ? go('p', name, 'timeline', rest[0]) : go('p', name, 'timeline'), kind, run: rest[0] || null };
  if (kind === 'team') {
    const member = rest[0] || null;
    if (!member) return { ...base, key: `p/${name}/team`, screen: go('p', name, 'team'), kind };
    const sheet = rest[1] === 'now' ? 'now' : rest[1] === 'e' && rest[2] != null ? `e:${rest[2]}` : null;
    return { ...base, key: `p/${name}/team/${member}`, screen: go('p', name, 'team', member), kind, member, sheet };
  }
  if (kind === 'pipeline' || kind === 'asked' || kind === 'agents') return { ...base, key: `p/${name}/${kind}`, screen: go('p', name, kind), kind };
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
    this.route = parseRoute(location.hash);
    this.lastHash = location.hash;
    this.history = [{ key: this.route.key, hash: this.route.screen }];
  },
  changed() {
    if (location.hash === this.lastHash) return;
    this.lastHash = location.hash;
    const prev = this.route;
    const next = parseRoute(location.hash);
    this.route = next;
    const top = this.history[this.history.length - 1];
    if (this.backing) this.backing = false;
    else if (!top || top.key !== next.key) this.history.push({ key: next.key, hash: next.screen });
    else top.hash = next.screen;
    const moved = prev.key !== next.key || prev.run !== next.run;
    if (!moved && prev.sheet && !next.sheet) this.focusNext = this.sheetOpener;
    else if (!prev.sheet && next.sheet) {
      this.sheetOpener = this.opener;
      this.focusNext = 'sheet-close';
    } else if (moved) this.focusNext = null;
    if (moved) bubble.close();
    render();
    if (moved) window.scrollTo(0, 0);
    focusPending();
  },
};

function focusPending() {
  const k = nav.focusNext;
  nav.focusNext = null;
  if (!k) return;
  const view = document.getElementById('view');
  const el = view ? findKey(view, k) : null;
  if (el && el.focus) {
    try {
      el.focus();
    } catch {
      // focus is a courtesy; the screen is right either way
    }
  }
}

/** The "Latest" bubble on Home (AC54): which card's is open, and how it was opened. */
const bubble = {
  open: null, // the project's name
  via: null, // 'hover' | 'tap' | 'key'
  escaped: null, // a bubble closed with Escape stays closed while focus stays on its control
  close() {
    this.open = null;
    this.via = null;
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
  const desk = createDesk({ config: CONFIG, call, clock, store, isVisible, onChange: () => render(), j11: true });
  nav.start();
  /** Every redraw patches the screen in place (AC56), so a refresh keeps it as the owner left it. */
  const show = (nodes) => {
    const fresh = document.createElement('main');
    for (const n of [nodes].flat(Infinity)) if (n) fresh.append(n);
    morphChildren(view, fresh);
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
          else if (r.kind === 'timeline') node = renderTimeline(b, r.run);
          else if (r.kind === 'team') {
            const [sub, idx] = r.sheet ? r.sheet.split(':') : [null, null];
            node = renderTeam(b, r.member || null, sub, idx);
          } else node = renderStatus(b);
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
  document.addEventListener('visibilitychange', () => {
    if (isVisible()) seen.visible();
    else seen.hidden();
    desk.visibilityChanged();
  });
  window.addEventListener('pagehide', () => seen.hidden());
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

function closeBubbleByEscape() {}

/** Redraw now, as any refresh would (tests: "a redraw with no new data at all"). */
export function refresh() {
  render();
}

export { whenText };
