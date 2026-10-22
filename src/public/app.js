// The desk page's entry (spec S-001). From stage 8 (AC44, step 4: "the candidate step 3 recorded becomes the
// desk's default view, the sandbox and the unchosen candidates are removed"; the owner's pick,
// decisions/questions/P-001-desk-v2-pick.md, A), `/` is mockup v2 as built (sandbox.js, its routes under #/),
// and the accepted M1 and M2 views (AC43) are gone. A `?sandbox` address, from an old Home Screen icon or
// an old notification, opens the same screen at `/`, its other parameters and its route kept (the
// notification view amendment: "a `?sandbox` address ... opens `/` with its other parameters kept, so
// nothing on the phone breaks"). ?exp=001 and ?exp=004 stay the experiment panels.

import CONFIG from './lib/config.js';
import { callFunction } from './lib/scheduler.js';
import { exp004Links, cappedNewFileLink } from './lib/links.js';
import { createRun, summarize, resultMarkdown, rawTable } from './lib/exp001.js';
import { deskAddress } from './lib/notifyview.js';

const view = document.getElementById('view');
const stateEl = document.getElementById('screen-state');

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
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

const clock = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
};
const isVisible = () => document.visibilityState === 'visible';
const params = new URLSearchParams(location.search);

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

/**
 * The notification view amendment (S-001, AC74 and AC75 from stage 8): a `?sandbox` address opens `/` with its
 * other parameters and its route kept. The address is put right in place, with no history step and no second
 * load, and the desk then starts on it, so a tap's `open=<key>` is still followed (AC74).
 */
function dropSandbox() {
  try {
    const to = deskAddress(location.pathname || '/', location.search, location.hash || '');
    if (typeof history !== 'undefined' && history.replaceState) history.replaceState(null, '', to);
  } catch {
    // the address keeps its `sandbox`; the desk is drawn the same
  }
}

const exp = params.get('exp');
if (exp === '001') startExp001();
else if (exp === '004') startExp004();
else {
  if (params.has('sandbox')) dropSandbox();
  import('./sandbox.js').then((m) => m.startSandbox()); // the desk: mockup v2 as built (AC44, step 4)
}
