// The desk page (spec S-001, M1: AC1–AC12; M2: AC16–AC23, AC29–AC34, AC46, AC47; the EXP-001
// panel and EXP-004 links). Renders the read model with DOM text nodes; record text goes through
// the escaping markdown renderer only. Routes: #/ (Universe), #/p/<project>, and under it
// card/<path>, q/<name>, hold/<path>, merge/<path>, asked and agents; ?exp=001 and ?exp=004 are
// the experiment panels.

import CONFIG from './lib/config.js';
import { createDesk, callFunction } from './lib/scheduler.js';
import { createStore } from './lib/store.js';
import { safeBox, orderBoxes, boxStateText, screenState } from './lib/universe.js';
import { renderMarkdown } from './lib/markdown.js';
import { whenText, hhmm, dateTimeText, durationText, hoursMinutes } from './lib/timefmt.js';
import { defaultLabel } from './lib/records.js';
import { blobLink, exp004Links, cappedNewFileLink, answerPlan } from './lib/links.js';
import { usageView, v5Line } from './lib/asked.js';
import { createRun, summarize, resultMarkdown, rawTable } from './lib/exp001.js';
import { routeParts, guardRender, boot, SIGNED_OUT_STATE } from './lib/page.js';
import { errorText } from './lib/scheduler.js';

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

function projectByName(name) {
  return CONFIG.projects.find((p) => p.name === name) || null;
}

function ciNode(ci) {
  return h('span', { class: /^[a-z-]+$/.test(String(ci)) ? `ci-${ci}` : 'ci-other' }, ci);
}

// AC30: each project's box is built on its own; one that throws says "Can't show this project".
function boxes(desk) {
  const now = Date.now();
  return CONFIG.projects.map((p) => safeBox(p.name, () => desk.model(p.name), desk.states.get(p.name), desk, now));
}

function cantShowBox(b, err) {
  const words = b.drawError || `Can't show this project: ${errorText(err)}`;
  return h('a', { class: 'box cant-read', href: `#/p/${encodeURIComponent(b.name)}` },
    h('h2', {}, b.name), h('p', { class: 'state' }, words));
}

function renderUniverse(desk, list = orderBoxes(boxes(desk))) {
  return h('section', {},
    list.map((b) => {
      if (b.drawError) return cantShowBox(b);
      try {
        return universeBox(b);
      } catch (err) {
        b.drawError = `Can't show this project: ${errorText(err)}`;
        return cantShowBox(b);
      }
    }));
}

function universeBox(b) {
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
}

const href = (name, ...parts) => `#/p/${[name, ...parts].map(encodeURIComponent).join('/')}`;

function flaggedList(m, name) {
  if (!m.flagged.length) return h('p', { class: 'muted' }, 'Nothing waiting on you here.');
  return h('ul', { class: 'plain flagged-list' }, m.flagged.map((f) => {
    let target;
    if (f.kind === 'card') target = h('a', { class: 'item', href: href(name, 'card', f.card.path) }, f.title);
    else if (f.kind === 'question') target = h('a', { class: 'item', href: href(name, 'q', f.question.name) }, f.title);
    else if (f.kind === 'hold') target = h('a', { class: 'item', href: href(name, 'hold', f.hold.path) }, f.title);
    else if (f.kind === 'merge') target = h('a', { class: 'item', href: href(name, 'merge', f.merge.path) }, f.title);
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
        let what;
        if (i.waiting.answered) what = `${label} — answered${i.waiting.verdict ? `: ${i.waiting.verdict}` : ''}${i.waiting.recording ? ' (recording…)' : ''}`;
        else if (i.waiting.path) what = h('a', { href: href(name, 'card', i.waiting.path) }, label);
        else what = label;
        rows.push(h('div', { class: i.waiting.answered ? '' : 'flag' }, what));
      }
      if (i.next) rows.push(h('div', {}, i.next));
      rows.push(h('div', { class: 'muted' }, `as of ${i.asOf ? when(i.asOf) : 'not recorded'}`));
      return h('li', {}, rows);
    })) : h('p', { class: 'muted' }, 'No open items.'),
    done.length ? h('details', {}, h('summary', {}, `${done.length} finished`),
      h('ul', { class: 'plain' }, done.map((i) => h('li', {}, `${i.id} (${i.kind}): ${i.finished}`)))) : null,
  ];
}

// Each project-level view is built inside the project's own guard (AC30).
function guardedView(desk, name, build) {
  const project = projectByName(name);
  if (!project) return h('p', {}, 'No such project. ', h('a', { href: '#/' }, 'Back'));
  const box = safeBox(name, () => desk.model(name), desk.states.get(name), desk, Date.now());
  try {
    if (box.drawError) throw new Error(box.drawError.replace(/^Can't show this project: /, ''));
    return build(box, project);
  } catch (err) {
    return h('section', {}, h('p', {}, h('a', { href: '#/' }, '← All projects')), h('h2', {}, name),
      h('p', { class: 'flag' }, box.drawError || `Can't show this project: ${errorText(err)}`));
  }
}

function renderProject(desk, name) {
  return guardedView(desk, name, (box) => projectView(box, name));
}

function projectView(box, name) {
  const m = box.model;
  return h('section', {},
    h('p', {}, h('a', { href: '#/' }, '← All projects')),
    h('h2', {}, name),
    h('p', { class: 'state' }, boxStateText(box, TZ)),
    h('p', { class: 'muted' }, 'CI on ', m.defaultBranch, ': ', ciNode(m.ci)),
    h('p', { class: 'nav' }, h('a', { href: href(name, 'asked') }, 'Time asked of you'),
      m.model === 'v3' ? [' · ', h('a', { href: href(name, 'agents') }, 'Agents')] : null),
    h('h3', {}, 'Waiting on you'),
    flaggedList(m, name),
    pipeline(m, name),
    h('h3', {}, 'Activity'),
    m.activity.length ? h('ul', { class: 'plain' }, m.activity.map((a) => h('li', {}, a.link ? ext(a.link, a.text) : a.text)))
      : h('p', { class: 'muted' }, 'No recent activity.'),
    m.notes.length ? h('details', {}, h('summary', {}, `${m.notes.length} notes`),
      h('ul', {}, m.notes.map((n) => h('li', { class: 'note' }, n)))) : null);
}

// ---------------------------------------------------------------------------
// Answering (AC16–AC19): the owner picks an option and may type a note; the desk builds J3's link.
// Drafts survive the page's re-renders, and a note being typed is never redrawn under the owner.

const drafts = new Map();

function copyButton(text) {
  const btn = h('button', { type: 'button' }, 'Copy');
  btn.addEventListener('click', () => {
    const done = () => { btn.textContent = 'Copied'; };
    try {
      navigator.clipboard.writeText(text).then(done, () => { btn.textContent = 'Copy failed: select the text above'; });
    } catch {
      btn.textContent = 'Copy failed: select the text above';
    }
  });
  return btn;
}

function planNodes(plan) {
  if (plan.offer === 'none') return [h('p', { class: 'answered' }, plan.words)];
  if (plan.offer === 'choose') return [h('p', { class: 'muted' }, 'Pick an option to get the answer.')];
  if (plan.offer === 'copy') {
    return [h('p', {}, plan.words), h('pre', { class: 'copy' }, plan.copy), copyButton(plan.copy)];
  }
  const out = [];
  if (plan.warning) out.push(h('p', { class: 'warn' }, plan.warning));
  if (plan.copy) out.push(h('p', {}, plan.words), h('pre', { class: 'copy' }, plan.copy), copyButton(plan.copy));
  else out.push(h('details', {}, h('summary', {}, 'What will be committed'), h('pre', { class: 'copy' }, plan.content)));
  out.push(h('p', {}, h('a', { class: 'go', href: plan.url, rel: 'noopener noreferrer', target: '_blank' },
    `Open GitHub to commit ${plan.path}`)));
  out.push(h('p', { class: 'muted' }, 'The desk writes nothing to GitHub: you commit the answer on the page that opens.'));
  return out;
}

/** The answer box. choices: [{ value, text, recommended }]. */
function answerBox(project, target, choices) {
  const key = `${project.name}:${target.kind}:${target.answerPath || target.name}`;
  const draft = drafts.get(key) || { choice: null, note: '' };
  drafts.set(key, draft);
  const result = h('div', { class: 'answer-result' });
  const update = () => result.replaceChildren(...planNodes(answerPlan(project, CONFIG.linkCap, target, draft.choice, draft.note)));
  update();
  const first = answerPlan(project, CONFIG.linkCap, target, null, '');
  if (first.offer === 'none') return h('div', { class: 'answer' }, h('h3', {}, 'Answer'), result);
  const radios = choices.map((c) => {
    const input = h('input', { type: 'radio', name: `choice-${key}`, value: c.value });
    if (draft.choice === c.value) input.checked = true;
    input.addEventListener('change', () => { draft.choice = c.value; update(); });
    return h('label', { class: 'choice' }, input, ' ', h('code', {}, c.value), c.text ? ` ${c.text}` : '',
      c.recommended ? h('span', { class: 'tag' }, 'recommended') : null);
  });
  const note = h('textarea', { 'data-keep': '1', rows: '3', placeholder: 'Optional note' });
  note.value = draft.note;
  note.addEventListener('input', () => { draft.note = note.value; update(); });
  return h('div', { class: 'answer' }, h('h3', {}, 'Answer'), h('div', { class: 'choices' }, radios),
    h('label', {}, 'Note (optional)', note), result);
}

const backTo = (name) => h('p', {}, h('a', { href: href(name) }, `← ${name}`));

function renderCard(desk, name, path) {
  return guardedView(desk, name, (box, project) => {
    const m = box.model;
    const f = m.flagged.find((x) => x.kind === 'card' && x.card.path === path);
    if (!f) {
      const done = m.answeredCards && m.answeredCards[path];
      if (done) {
        // AC16: the answer file already exists — no link.
        return h('section', {}, backTo(name), h('h2', {}, path),
          h('p', { class: 'answered' }, `already answered: ${done.verdict || 'not recorded'}`));
      }
      return h('section', {}, backTo(name), h('p', {}, `${path} is not waiting on you (answered, withdrawn, or not read yet).`));
    }
    const c = f.card;
    const parsed = c.parsed;
    const target = { kind: 'card', answerPath: c.answerPath, item: c.item, options: parsed ? parsed.options.map((o) => o.word) : [], answered: null };
    return h('section', {}, backTo(name),
      h('h2', {}, f.title),
      h('p', { class: 'muted' }, `Raised ${c.raisedAt ? when(c.raisedAt) : 'not recorded'}`),
      c.cantParse ? h('p', { class: 'flag' }, `Can't parse: ${c.cantParse}. It stays flagged until answered.`) : null,
      h('p', {}, 'Answer path: ', h('code', {}, parsed && parsed.answerPath ? parsed.answerPath : c.answerPath)),
      parsed && parsed.options.length
        ? answerBox(project, target, parsed.options.map((o) => ({ value: o.word, text: o.text.replace(/^`[^`]+`\s*/, '') })))
        : h('p', { class: 'muted' }, parsed ? 'The card lists no options the desk can read; answer it on GitHub.' : 'Loading the card…'),
      h('p', {}, ext(blobLink(project, c.path), 'Open the card on GitHub')),
      parsed ? h('article', { class: 'record', html: renderMarkdown(parsed.text) }) : null);
  });
}

function renderQuestion(desk, name, qname) {
  return guardedView(desk, name, (box, project) => {
    const m = box.model;
    const f = m.flagged.find((x) => x.kind === 'question' && x.question.name === qname);
    if (!f) {
      const done = m.rulings && m.rulings[qname];
      if (done) {
        return h('section', {}, backTo(name), h('h2', {}, `questions/${qname}.md`),
          h('p', { class: 'answered' }, `already answered: ${done.ruling || 'not recorded'}`));
      }
      return h('section', {}, backTo(name), h('p', {}, `questions/${qname}.md is not waiting on you (answered, deleted, or not read yet).`));
    }
    const q = f.question;
    const p = q.parsed;
    const given = (v) => (v == null || v === '' ? 'not given' : v);
    if (!p) return h('section', {}, backTo(name), h('h2', {}, f.title), h('p', {}, 'Loading the question…'));
    const target = { kind: 'question', name: qname, options: p.options.map((o) => o.letter), answered: null };
    return h('section', {}, backTo(name),
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
      p.options.length
        ? answerBox(project, target, p.options.map((o) => ({ value: o.letter, text: o.text, recommended: o.letter === p.recommendationLetter })))
        : null,
      h('p', {}, ext(blobLink(project, q.path), 'Open the question on GitHub')),
      h('h3', {}, 'Full text'), h('article', { class: 'record', html: renderMarkdown(p.text) }));
  });
}

// AC46: a hold card — what it says, and no answer link.
function renderHold(desk, name, path) {
  return guardedView(desk, name, (box, project) => {
    const f = box.model.flagged.find((x) => x.kind === 'hold' && x.hold.path === path);
    if (!f) return h('section', {}, backTo(name), h('p', {}, `${path} is not waiting on you (cleared, replaced, or not read yet).`));
    const p = f.hold.parsed;
    const nr = (v) => (v == null ? 'not recorded' : v);
    return h('section', {}, backTo(name),
      h('h2', {}, f.title),
      h('p', {}, "the default branch's governance run is not green"),
      h('dl', { class: 'fields' },
        h('dt', {}, 'tip'), h('dd', {}, h('code', {}, nr(p && p.tip))),
        h('dt', {}, 'state'), h('dd', {}, nr(p && p.state)),
        h('dt', {}, 'held for'), h('dd', {}, p && p.heldFor != null ? `${p.heldFor} minutes` : 'not recorded')),
      h('p', { class: 'answered' }, answerPlan(project, CONFIG.linkCap, { kind: 'hold' }).words),
      h('h3', {}, 'What to do'),
      p && p.whatToDo != null ? h('article', { class: 'record', html: renderMarkdown(p.whatToDo) }) : h('p', {}, p ? 'not given' : 'Loading the card…'),
      h('p', {}, ext(f.hold.actionsLink, 'Open governance runs in the Actions tab'), ' · ', ext(f.hold.link, 'the card on GitHub')));
  });
}

// AC47: a merge card — the item, the step, its tip and sections, and no answer link.
function renderMerge(desk, name, path) {
  return guardedView(desk, name, (box, project) => {
    const f = box.model.flagged.find((x) => x.kind === 'merge' && x.merge.path === path);
    if (!f) return h('section', {}, backTo(name), h('p', {}, `${path} is not waiting on you (merged, closed, or not read yet).`));
    const mc = f.merge;
    const p = mc.parsed;
    const sec = (title, text) => [h('h3', {}, title),
      text != null ? h('article', { class: 'record', html: renderMarkdown(text) }) : h('p', {}, p ? 'not given' : 'Loading the card…')];
    return h('section', {}, backTo(name),
      h('h2', {}, f.title),
      h('dl', { class: 'fields' },
        h('dt', {}, 'item'), h('dd', {}, mc.item),
        h('dt', {}, 'step'), h('dd', {}, mc.stepWords),
        h('dt', {}, 'item tip'), h('dd', {}, h('code', {}, p && p.tip ? p.tip : 'not recorded'))),
      h('p', { class: 'answered' }, answerPlan(project, CONFIG.linkCap, { kind: 'merge', item: mc.item }).words),
      sec('The decision', p && p.decision), sec('Why', p && p.why), sec('What to do', p && p.whatToDo),
      h('p', {}, ext(mc.branchLink, `Open item/${mc.item} on GitHub`), ' · ', ext(mc.link, 'the card on GitHub')));
  });
}

// ---------------------------------------------------------------------------
// AC20: Time asked of you

const waitText = (ms) => (ms == null ? 'not recorded' : durationText(ms));
const proxyText = (p) => (p === true ? 'proxy' : p === false ? 'not a proxy' : 'proxy not recorded');

function askedRow(r) {
  let answered;
  if (r.state === 'answered') answered = when(r.answeredAt);
  else if (r.state === 'recording') answered = 'recording…';
  else if (r.state === 'withdrawn') answered = 'withdrawn';
  else answered = 'open';
  const wait = r.state === 'open' ? `${waitText(r.waitMs)} so far` : waitText(r.waitMs);
  return h('li', {}, h('strong', {}, r.label),
    h('div', { class: 'muted' }, `raised ${r.raisedAt != null ? when(r.raisedAt) : 'not recorded'} · answered ${answered} · wait ${wait}`
      + (r.state === 'answered' ? ` · ${proxyText(r.proxy)}` : '')
      + (r.word ? ` · ${r.word}` : '') + (r.ruling ? ` · Ruling: ${r.ruling}` : '')));
}

function renderAsked(desk, name) {
  return guardedView(desk, name, (box) => {
    const t = box.model.timeAsked;
    const out = [backTo(name), h('h2', {}, `Time asked of you — ${name}`)];
    if (t.cards) {
      out.push(h('p', { class: 'state' }, t.summary.count
        ? `Last 14 days: ${t.summary.count} card${t.summary.count === 1 ? '' : 's'}, median wait ${durationText(t.summary.medianMs)} (open cards with their wait so far)`
        : 'Last 14 days: no cards'));
      out.push(h('h3', {}, 'Cards, last 30 days'),
        t.cards.length ? h('ul', { class: 'plain' }, t.cards.map(askedRow)) : h('p', { class: 'muted' }, 'No cards raised in the last 30 days.'));
    } else {
      out.push(h('p', {}, t.cardsText));
    }
    out.push(h('h3', {}, 'Owner questions, last 30 days'),
      t.questions.length ? h('ul', { class: 'plain' }, t.questions.map(askedRow)) : h('p', { class: 'muted' }, 'No owner questions in the last 30 days.'));
    if (t.answeredText) out.push(h('p', { class: 'muted' }, t.answeredText));
    return h('section', {}, out);
  });
}

// ---------------------------------------------------------------------------
// AC22 and AC23: Agents

const num = (v) => (typeof v === 'number' ? v.toLocaleString('en-US') : v);

function usageNode(s) {
  const u = usageView(s);
  if (!u.recorded) return h('div', { class: 'muted' }, 'Usage: not recorded');
  const pct = typeof u.context_peak_percent === 'number' ? `${u.context_peak_percent}%` : u.context_peak_percent;
  return h('div', { class: 'muted' },
    `Tokens: input ${num(u.input_tokens)}, output ${num(u.output_tokens)}, cache read ${num(u.cache_read_tokens)}, cache write ${num(u.cache_write_tokens)} · turns ${num(u.turns)}`,
    h('br'),
    `Context peak: ${num(u.context_peak_tokens)} tokens, ${pct} of a ${num(u.context_window_tokens)}-token window (derived from per-turn usage)`);
}

function sessionNode(s) {
  const end = s.running ? `running, ${durationText(s.runMs)} so far` : s.noOutcome ? 'no outcome recorded' : `${when(s.end)}, ran ${durationText(s.runMs)}`;
  const result = s.result ? ` · ${s.result}${s.verdict && s.verdict !== 'none' ? `, verdict ${s.verdict}` : ''}` : '';
  return h('li', {}, h('strong', {}, `${s.item} ${s.role}`), s.retry ? h('span', { class: 'tag' }, 'retry') : null,
    h('div', { class: 'muted' }, `started ${when(s.start)} · ended ${end}${result}`), usageNode(s));
}

function timelineNode(tl) {
  const span = Math.max(1, tl.to - tl.from);
  return h('li', {}, h('strong', {}, tl.item),
    h('ol', { class: 'timeline' }, tl.events.map((e) => {
      const bar = h('span', { class: `bar ${e.kind}${e.open ? ' open' : ''}` });
      if (bar.style) {
        bar.style.marginLeft = `${(((e.start - tl.from) / span) * 100).toFixed(1)}%`;
        bar.style.width = `${Math.max(1, ((((e.end ?? e.start) - e.start) / span) * 100)).toFixed(1)}%`;
      }
      const label = e.kind === 'card' ? `${e.label}: waiting on you` : `${e.label} session`;
      const until = e.end == null ? 'no end recorded' : e.open ? 'now' : when(e.end);
      return h('li', {}, h('div', { class: 'track' }, bar), h('div', { class: 'muted' }, `${label}, ${when(e.start)} to ${until}`));
    })));
}

function renderAgents(desk, name) {
  return guardedView(desk, name, (box) => {
    const m = box.model;
    if (!m.sessions) return h('section', {}, backTo(name), h('h2', {}, `Agents — ${name}`), h('p', {}, m.runningText));
    return h('section', {}, backTo(name), h('h2', {}, `Agents — ${name}`),
      h('h3', {}, 'Sessions, last 14 days'),
      m.sessions.length ? h('ul', { class: 'plain' }, m.sessions.map(sessionNode)) : h('p', { class: 'muted' }, 'No sessions in the last 14 days.'),
      h('h3', {}, 'Timeline by item'),
      m.timelines.length ? h('ul', { class: 'plain' }, m.timelines.map(timelineNode)) : h('p', { class: 'muted' }, 'Nothing to show.'));
  });
}

function startDesk() {
  const store = createStore();
  const desk = createDesk({
    config: CONFIG, call: (path, body) => callFunction(path, body), clock, store, isVisible, onChange: () => render(),
  });
  const setState = (state) => {
    stateEl.textContent = state.text;
    stateEl.className = state.className;
    document.title = `Service Desk — ${state.text}`;
  };
  // A throw while drawing shows an error state, never a frozen "Quiet" (review N4), and never in
  // place of "Signed out" (AC32).
  const render = guardRender(draw, (state) => {
    setState(state);
    view.replaceChildren(h('section', {}, h('p', { class: 'flag' }, state.text), h('p', {}, h('a', { href: '#/' }, 'All projects'))));
  }, () => desk.signedOut);
  function draw() {
    // AC32: the signed-out line is set first, before any box is built.
    if (desk.signedOut) setState(SIGNED_OUT_STATE);
    const bx = boxes(desk);
    const [r0, name, kind, ...rest] = routeParts(location.hash); // malformed → Universe (review N6)
    const y = window.scrollY;
    let node;
    if (r0 === 'p' && kind === 'card') node = renderCard(desk, name, rest.join('/'));
    else if (r0 === 'p' && kind === 'q') node = renderQuestion(desk, name, rest.join('/'));
    else if (r0 === 'p' && kind === 'hold') node = renderHold(desk, name, rest.join('/'));
    else if (r0 === 'p' && kind === 'merge') node = renderMerge(desk, name, rest.join('/'));
    else if (r0 === 'p' && kind === 'asked') node = renderAsked(desk, name);
    else if (r0 === 'p' && kind === 'agents') node = renderAgents(desk, name);
    else if (r0 === 'p' && name) node = renderProject(desk, name);
    else node = renderUniverse(desk, orderBoxes(bx)); // marks a box that failed to draw (AC30)
    // The state line counts every box, those that couldn't be shown included (AC30).
    const s = screenState(bx, desk.signedOut);
    stateEl.textContent = s.text;
    stateEl.className = s.quiet ? 'quiet' : desk.signedOut ? 'signed-out' : bx.some((b) => b.flaggedCount) ? 'flagged'
      : bx.some((b) => b.read.read === 'cant-read' || b.drawError) ? 'cant-read' : '';
    document.title = s.quiet ? 'Service Desk — quiet' : `Service Desk — ${s.text}`;
    // A note being typed is never redrawn under the owner (AC16, AC19).
    const active = document.activeElement;
    if (!(active && active.dataset && active.dataset.keep && view.contains && view.contains(active))) {
      view.replaceChildren(node);
      window.scrollTo(0, y);
    }
    footer(bx);
  }
  // AC21: V5 against its goal, over every v3 project whose box could be built.
  function footer(bx) {
    let line;
    try {
      const waits = bx.filter((b) => b.model && b.model.model === 'v3').flatMap((b) => b.model.v5Waits || []);
      line = v5Line(waits, hoursMinutes);
    } catch (err) {
      line = `Median answer time: can't show it (${errorText(err)})`;
    }
    document.getElementById('foot').textContent = `${line}. ${store.usable ? '' : 'Cache not kept on this device. '}Updated ${hhmm(new Date(), TZ)}.`;
  }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  document.addEventListener('visibilitychange', () => desk.visibilityChanged());
  setInterval(() => { if (isVisible()) render(); }, 15_000);
  boot(render, desk); // desk.start() runs even if the first render throws (review N6)
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

