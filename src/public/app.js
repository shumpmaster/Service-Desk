// The desk page (spec S-001, M1: AC1–AC12; the EXP-001 panel and EXP-004 links).
// Renders the read model with DOM text nodes; record text goes through the escaping markdown
// renderer only. Routes: #/ (Universe), #/p/<project>, #/p/<project>/card/<path>,
// #/p/<project>/q/<name>; ?exp=001 and ?exp=004 are the experiment panels.

import CONFIG from './lib/config.js';
import { createDesk, callFunction } from './lib/scheduler.js';
import { createStore } from './lib/store.js';
import { makeBox, orderBoxes, boxStateText, screenState } from './lib/universe.js';
import { renderMarkdown } from './lib/markdown.js';
import { whenText, hhmm, dateTimeText } from './lib/timefmt.js';
import { defaultLabel } from './lib/records.js';
import { blobLink, exp004Links, cappedNewFileLink } from './lib/links.js';
import { createRun, summarize, resultMarkdown, rawTable } from './lib/exp001.js';

const TZ = CONFIG.ownerTimeZone;
const view = document.getElementById('view');
const stateEl = document.getElementById('screen-state');

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v; // only ever renderMarkdown's escaped output
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
const ext = (href, text) => h('a', { href, rel: 'noopener noreferrer', target: '_blank' }, text);
const when = (d) => (d ? whenText(new Date(d), new Date(), TZ) : 'not recorded');

const clock = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
};
const isVisible = () => document.visibilityState === 'visible';
const params = new URLSearchParams(location.search);

// ---------------------------------------------------------------------------
// The desk

function routeParts() {
  return location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent).filter((s) => s !== '');
}

function projectByName(name) {
  return CONFIG.projects.find((p) => p.name === name) || null;
}

function ciNode(ci) {
  return h('span', { class: `ci-${ci}` }, ci);
}

function boxes(desk) {
  const now = Date.now();
  return CONFIG.projects.map((p) => makeBox(desk.model(p.name), desk.states.get(p.name), desk, now));
}

function renderUniverse(desk) {
  const list = orderBoxes(boxes(desk));
  return h('section', {},
    list.map((b) => {
      const m = b.model;
      const cls = b.flaggedCount ? 'box flagged' : b.read.read === 'cant-read' ? 'box cant-read' : 'box';
      let work;
      if (m.model === 'v2.5') {
        work = h('p', {}, 'Sprint: ', m.sprint.title || m.sprint.note);
      } else if (!m.openItems || m.openItems.length === 0) {
        work = h('p', { class: 'muted' }, 'No open items');
      } else {
        work = h('ul', { class: 'plain' }, m.openItems.map((i) => h('li', {}, `${i.id} — ${i.loading ? 'loading…' : i.unreadable ? "can't read status" : `${i.stage}, ${i.state}`}`)));
      }
      return h('a', { class: cls, href: `#/p/${encodeURIComponent(b.name)}` },
        h('h2', {}, b.name),
        h('p', { class: 'state' }, boxStateText(b, TZ)),
        b.flaggedCount ? h('ul', { class: 'plain flagged-list' }, m.flagged.map((f) => h('li', { class: 'flag' }, '● ', f.title))) : null,
        h('p', {}, m.headline.text),
        work,
        h('p', { class: 'muted' }, 'CI on ', m.defaultBranch, ': ', ciNode(m.ci)));
    }));
}

function flaggedList(m, name) {
  if (!m.flagged.length) return h('p', { class: 'muted' }, 'Nothing waiting on you here.');
  return h('ul', { class: 'plain flagged-list' }, m.flagged.map((f) => {
    let target;
    if (f.kind === 'card') target = h('a', { class: 'item', href: `#/p/${encodeURIComponent(name)}/card/${encodeURIComponent(f.card.path)}` }, f.title);
    else if (f.kind === 'question') target = h('a', { class: 'item', href: `#/p/${encodeURIComponent(name)}/q/${encodeURIComponent(f.question.name)}` }, f.title);
    else target = ext(f.link, f.title);
    return h('li', {}, h('span', { class: 'flag' }, '● '), target, h('div', { class: 'muted' }, f.words,
      f.card && f.card.cantParse ? ` · can't parse: ${f.card.cantParse}` : ''));
  }));
}

function pipeline(m, name) {
  if (m.model !== 'v3') {
    return [
      h('h3', {}, 'Reduced view (operating model v2.5.1)'),
      h('dl', { class: 'fields' },
        h('dt', {}, 'Sprint'), h('dd', {}, m.sprint.title || m.sprint.note),
        h('dt', {}, 'Headline'), h('dd', {}, m.headline.text),
        h('dt', {}, 'Next'), h('dd', {}, m.headline.next || 'not recorded'),
        h('dt', {}, 'As of'), h('dd', {}, m.headline.asOf || 'not recorded'),
        h('dt', {}, 'Items'), h('dd', {}, m.itemsText),
        h('dt', {}, 'Running now'), h('dd', {}, m.runningText)),
    ];
  }
  const open = m.items.filter((i) => !i.finished);
  const done = m.items.filter((i) => i.finished);
  return [
    h('h3', {}, 'Pipeline'),
    h('p', {}, 'Latest: ', m.headline.text),
    open.length ? h('ul', { class: 'plain' }, open.map((i) => {
      if (i.loading) return h('li', {}, `${i.id}: loading…`);
      if (i.unreadable) return h('li', {}, `${i.id}: can't read status `, ext(i.link, 'status file'));
      const rows = [h('strong', {}, i.id), ` (${i.kind}) — stage ${i.stage}, ${i.state}`];
      if (i.running) {
        rows.push(h('div', {}, `Running now: ${i.running.role}, for ${i.running.elapsed}${i.running.pastLimit ? ' (past its limit)' : ''}`));
      }
      if (i.waiting) {
        const label = `Waiting on you: card ${i.waiting.gate}-${i.waiting.card}`;
        rows.push(h('div', { class: i.waiting.answered ? '' : 'flag' }, i.waiting.answered
          ? `${label} — answered${i.waiting.verdict ? `: ${i.waiting.verdict}` : ''}${i.waiting.recording ? ' (recording…)' : ''}`
          : h('a', { href: `#/p/${encodeURIComponent(name)}/card/${encodeURIComponent(i.waiting.path)}` }, label)));
      }
      if (i.next) rows.push(h('div', {}, i.next));
      rows.push(h('div', { class: 'muted' }, `as of ${i.asOf ? when(i.asOf) : 'not recorded'}`));
      return h('li', {}, rows);
    })) : h('p', { class: 'muted' }, 'No open items.'),
    done.length ? h('details', {}, h('summary', {}, `${done.length} finished`),
      h('ul', { class: 'plain' }, done.map((i) => h('li', {}, `${i.id} (${i.kind}): ${i.finished}`)))) : null,
  ];
}

function renderProject(desk, name) {
  const project = projectByName(name);
  if (!project) return h('p', {}, 'No such project. ', h('a', { href: '#/' }, 'Back'));
  const m = desk.model(name);
  const box = makeBox(m, desk.states.get(name), desk, Date.now());
  return h('section', {},
    h('p', {}, h('a', { href: '#/' }, '← All projects')),
    h('h2', {}, name),
    h('p', { class: 'state' }, boxStateText(box, TZ)),
    h('p', { class: 'muted' }, 'CI on ', m.defaultBranch, ': ', ciNode(m.ci)),
    h('h3', {}, 'Waiting on you'),
    flaggedList(m, name),
    pipeline(m, name),
    h('h3', {}, 'Activity'),
    m.activity.length ? h('ul', { class: 'plain' }, m.activity.map((a) => h('li', {}, a.link ? ext(a.link, a.text) : a.text)))
      : h('p', { class: 'muted' }, 'No recent activity.'),
    m.notes.length ? h('details', {}, h('summary', {}, `${m.notes.length} notes`),
      h('ul', {}, m.notes.map((n) => h('li', { class: 'note' }, n)))) : null);
}

function renderCard(desk, name, path) {
  const project = projectByName(name);
  const m = project && desk.model(name);
  const f = m && m.flagged.find((x) => x.kind === 'card' && x.card.path === path);
  const back = h('p', {}, h('a', { href: `#/p/${encodeURIComponent(name)}` }, `← ${name}`));
  if (!f) return h('section', {}, back, h('p', {}, `${path} is not waiting on you (answered, withdrawn, or not read yet).`));
  const c = f.card;
  const parsed = c.parsed;
  return h('section', {}, back,
    h('h2', {}, f.title),
    h('p', { class: 'muted' }, `Raised ${c.raisedAt ? when(c.raisedAt) : 'not recorded'}`),
    c.cantParse ? h('p', { class: 'flag' }, `Can't parse: ${c.cantParse}. It stays flagged until answered.`) : null,
    h('p', {}, 'Answer path: ', h('code', {}, parsed && parsed.answerPath ? parsed.answerPath : c.answerPath)),
    parsed && parsed.options.length ? [h('h3', {}, 'Options'),
      h('ul', { class: 'options' }, parsed.options.map((o) => h('li', {}, h('code', {}, o.word))))] : null,
    h('p', {}, ext(blobLink(project, c.path), 'Open the card on GitHub'),
      ' (answering from the desk comes in M2)'),
    parsed ? h('article', { class: 'record', html: renderMarkdown(parsed.text) }) : h('p', {}, 'Loading the card…'));
}

function renderQuestion(desk, name, qname) {
  const project = projectByName(name);
  const m = project && desk.model(name);
  const f = m && m.flagged.find((x) => x.kind === 'question' && x.question.name === qname);
  const back = h('p', {}, h('a', { href: `#/p/${encodeURIComponent(name)}` }, `← ${name}`));
  if (!f) return h('section', {}, back, h('p', {}, `questions/${qname}.md is not waiting on you (answered, deleted, or not read yet).`));
  const q = f.question;
  const p = q.parsed;
  const given = (v) => (v == null || v === '' ? 'not given' : v);
  if (!p) return h('section', {}, back, h('h2', {}, f.title), h('p', {}, 'Loading the question…'));
  return h('section', {}, back,
    h('h2', {}, p.title),
    h('p', { class: 'muted' }, `Raised ${q.raisedAt ? when(q.raisedAt) : 'not recorded'}`),
    h('dl', { class: 'fields' },
      h('dt', {}, 'WHY'), h('dd', {}, given(p.why)),
      h('dt', {}, 'OPTIONS'), h('dd', {}, p.options.length
        ? h('ul', { class: 'options' }, p.options.map((o) => h('li', { class: o.letter === p.recommendationLetter ? 'recommended' : '' },
          `${o.letter}. ${o.text}`, o.letter === p.recommendationLetter ? h('span', { class: 'tag' }, 'recommended') : null)))
        : 'not given'),
      h('dt', {}, 'RECOMMENDATION'), h('dd', {}, given(p.recommendation)),
      h('dt', {}, 'RISK CLASS'), h('dd', {}, given(p.riskClass)),
      h('dt', {}, 'REVERSIBILITY'), h('dd', {}, given(p.reversibility)),
      h('dt', {}, 'BLAST RADIUS'), h('dd', {}, given(p.blastRadius)),
      h('dt', {}, 'DEFAULT'), h('dd', {}, defaultLabel(p, q.raisedAt, (d) => dateTimeText(d, TZ)))),
    h('p', {}, ext(blobLink(project, q.path), 'Open the question on GitHub')),
    h('h3', {}, 'Full text'), h('article', { class: 'record', html: renderMarkdown(p.text) }));
}

function startDesk() {
  const store = createStore();
  const desk = createDesk({
    config: CONFIG, call: (path, body) => callFunction(path, body), clock, store, isVisible, onChange: render,
  });
  function render() {
    const bx = boxes(desk);
    const s = screenState(bx, desk.signedOut);
    stateEl.textContent = s.text;
    stateEl.className = s.quiet ? 'quiet' : desk.signedOut ? 'signed-out' : bx.some((b) => b.flaggedCount) ? 'flagged'
      : bx.some((b) => b.read.read === 'cant-read') ? 'cant-read' : '';
    document.title = s.quiet ? 'Service Desk — quiet' : `Service Desk — ${s.text}`;
    const [r0, name, kind, ...rest] = routeParts();
    const y = window.scrollY;
    let node;
    if (r0 === 'p' && kind === 'card') node = renderCard(desk, name, rest.join('/'));
    else if (r0 === 'p' && kind === 'q') node = renderQuestion(desk, name, rest.join('/'));
    else if (r0 === 'p' && name) node = renderProject(desk, name);
    else node = renderUniverse(desk);
    view.replaceChildren(node);
    window.scrollTo(0, y);
    document.getElementById('foot').textContent = `Read-only: the desk links to GitHub; answering from the desk comes later. ${store.usable ? '' : 'Cache not kept on this device. '}Updated ${hhmm(new Date(), TZ)}.`;
  }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  document.addEventListener('visibilitychange', () => desk.visibilityChanged());
  setInterval(() => { if (isVisible()) render(); }, 15_000);
  render();
  desk.start();
}

// ---------------------------------------------------------------------------
// EXP-004: the prefilled-link test (experiments/EXP-004-prefilled-link-per-repo.md)

function startExp004() {
  stateEl.textContent = 'EXP-004 — prefilled links';
  view.replaceChildren(h('section', {},
    h('p', {}, 'For each link: open it on the phone, choose “Create a new branch” named ', h('code', {}, 'desk-link-test'),
      ' at commit, and record whether the file name and the content were filled, and any error page. On link (a), also record whether “Commit directly to the main branch” is offered (Q1). Afterwards delete the branch.'),
    h('p', {}, 'Q4: on the Universe screen, record each box’s CI field.'),
    CONFIG.projects.map((p) => h('div', { class: 'record' },
      h('h3', {}, p.name),
      h('ul', { class: 'plain' }, exp004Links(p).map((l) => h('li', {},
        ext(l.url, `${l.label}`), h('div', { class: 'muted' }, `${l.path} · link length ${l.length} · content ${l.content.length} characters`),
        h('details', {}, h('summary', {}, 'Expected content'), h('pre', {}, l.content)))))))));
}

// ---------------------------------------------------------------------------
// EXP-001: the CPU and wall-time panel (experiments/EXP-001-o3-cpu-walltime.md)

function startExp001() {
  stateEl.textContent = 'EXP-001 — CPU and wall time';
  const resultsProject = CONFIG.projects.find((p) => p.planning) || CONFIG.projects[0];
  const status = h('p', {}, 'Ready. The run takes about an hour; keep this tab in the foreground on a desktop browser.');
  const out = h('div', {});
  const progress = (run) => {
    const done = run.index;
    status.textContent = `${run.state}: step ${done} of ${run.steps.length}, ${run.calls.length} calls${run.message ? ` — ${run.message}` : ''}`;
    if (run.state === 'done' || run.state === 'stopped') showResult(run);
  };
  const run = createRun({
    config: CONFIG, call: (path, body) => callFunction(path, body), clock, perf: () => performance.now(), isVisible, onProgress: progress,
  });
  const showResult = (r) => {
    const s = summarize(r);
    const md = resultMarkdown(s);
    const link = cappedNewFileLink(resultsProject, 'docs/handover/experiments/EXP-001-result.md', md, CONFIG.linkCap);
    const raw = rawTable(r);
    out.replaceChildren(
      h('h3', {}, 'Summary'), h('pre', {}, md),
      h('p', {}, ext(link.url, link.copy ? 'Open the new-file page (paste the summary there)' : 'Commit the summary on GitHub (prefilled)')),
      link.copy ? h('p', {}, h('button', { onclick: () => navigator.clipboard.writeText(md) }, 'Copy the summary')) : null,
      h('p', {}, h('button', { onclick: () => navigator.clipboard.writeText(raw) }, 'Copy the raw table'),
        ' and paste it at the end of the file before committing.'),
      h('details', {}, h('summary', {}, 'Raw table'), h('div', { class: 'scroll' }, h('pre', {}, raw))));
  };
  view.replaceChildren(h('section', {},
    h('p', {}, '300 steady polls, 20 cold loads and 20 heaviest-case blob calls, one step every 10 seconds. Every call goes through your own Access session.'),
    status,
    h('p', {}, h('button', { onclick: () => run.start() }, 'Start'), ' ', h('button', { onclick: () => { run.stop(); progress(run); } }, 'Stop')),
    out));
  document.addEventListener('visibilitychange', () => { if (!isVisible() && run.state === 'running') progress(run); });
}

const exp = params.get('exp');
if (exp === '001') startExp001();
else if (exp === '004') startExp004();
else startDesk();

