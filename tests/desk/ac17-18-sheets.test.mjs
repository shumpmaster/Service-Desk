// ac-test: S-001/AC17 ac-test: S-001/AC18 — the desk's answer sheets (AC80's decision card, AC85's lettered and
// numbered questions and its gate card) from stage 8, when the accepted card and question views that drew AC17's and
// AC18's fallbacks are gone (AC44, step 4, specs/S-001.md:2918-2921). AC53 keeps both on every answer link: "every
// link follows AC53's 'When it would not fit' (AC17's copy route past `linkCap`, or where `contentPrefill` is
// `false`) and AC18's message where `webCommitsToDefault` is `false`, as today" (:6077-6080).
// - AC18 (:2536-2541): before the link, J7's message word for word; the link itself J3's URL, unchanged.
// - AC17 (:2531-2535): the answer text shown with a "Copy" button, and the new-file page opened with only the file name.
// Fixtures: Service-Desk's real P-001-stop-6 card (tests/desk/fixtures/service-desk/) for the decision sheet, and AC85's
// made-up "Letters" project (NOT real records, tests/desk/fixtures/ac85/README.md) for the questions and the gate.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, CONFIG } from './helpers.mjs';
import { repo } from './fake-desk.mjs';
import { loadSandbox, byClass, findAll } from './sandbox-helpers.mjs';
import { lettersRepo, LETTERS, NOW, Q, GATE } from './ac85-fixtures.mjs';
import { webCommitsWarning } from '../../src/lib/links.js';

const POLL = 60_000;
const COPY_WORDS = 'Too long to prefill, or this repository takes no prefilled content: the button copies the text and opens the page with only the file name.';
const route = (id) => `#/waiting/card/${encodeURIComponent(id)}`;
const sheetOf = (app) => byClass(app.view, 'v2-sheet')[0] || null;
const answerLinks = (sh) => findAll(sh, (e) => e.tag === 'a' && /\/new\//.test(e.attrs.href || ''));
const order = (root, el) => findAll(root, () => true).indexOf(el);

/** The four sheets that answer, each with its project: [label, config's project, repos, card id, J7's word for what stays flagged]. */
function sheets(change = {}) {
  const sdProject = { ...CONFIG.projects.find((p) => p.name === 'Service-Desk'), ...change };
  const sd = repo({
    'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
    'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
    'queue/P-001-stop-6.md': fixture('service-desk/queue/P-001-stop-6.md'),
  }, [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  const letters = { ...LETTERS, ...change };
  return [
    ['the decision card', sdProject, { 'Service-Desk': sd }, 'Service-Desk|card|queue/P-001-stop-6.md', 'card', Date.parse('2026-10-07T12:00:00Z')],
    ['a lettered question', letters, { Letters: lettersRepo() }, Q('P-003-send-issue'), 'question', NOW],
    ['a numbered question', letters, { Letters: lettersRepo() }, Q('P-001-design-lab-open'), 'question', NOW],
    ['the gate card', letters, { Letters: lettersRepo() }, GATE, 'card', NOW],
  ];
}

async function open(project, repos, id, now, globals = {}) {
  const app = await loadSandbox({ config: { ...CONFIG, projects: [project] }, repos, hash: route(id), now, globals });
  await app.advance(1000);
  await app.advance(POLL);
  return app;
}

test('AC18 on every sheet that answers (from stage 8): with webCommitsToDefault false, J7\'s message word for word before the first answer link; the links J3\'s, unchanged; none where web commits are taken', async () => {
  const open1 = sheets();
  const closed = sheets({ webCommitsToDefault: false });
  for (let i = 0; i < open1.length; i++) {
    const [label, project, repos, id, what, now] = open1[i];
    let hrefs;
    let app = await open(project, repos, id, now);
    try {
      const sh = sheetOf(app);
      assert.ok(sh, `${label}: its sheet`);
      hrefs = answerLinks(sh).map((a) => a.attrs.href);
      assert.ok(hrefs.length >= 1, `${label}: its answer links`);
      assert.equal(byClass(sh, 'v2-webwarn').length, 0, `${label}: no message where web commits are taken`);
    } finally {
      app.restore();
    }
    const [, cp, cr] = closed[i];
    app = await open(cp, cr, id, now);
    try {
      const sh = sheetOf(app);
      const warn = byClass(sh, 'v2-webwarn');
      assert.equal(warn.length, 1, `${label}: the message once`);
      assert.equal(warn[0].textContent, webCommitsWarning('main', what), `${label}: J7's words`);
      const links = answerLinks(sh);
      assert.ok(links.every((a) => order(sh, warn[0]) < order(sh, a)), `${label}: before the links`);
      assert.deepEqual(links.map((a) => a.attrs.href), hrefs, `${label}: the links J3's URLs, unchanged`);
    } finally {
      app.restore();
    }
  }
});

test('AC17 on every sheet that answers (from stage 8): with contentPrefill false, the words naming why, each answer\'s text shown with its own "Copy", and each link opening the new-file page with only the file name; none where content prefills', async () => {
  for (const [label, project, repos, id, , now] of sheets()) {
    const app = await open(project, repos, id, now);
    try {
      assert.equal(byClass(sheetOf(app), 'v2-copyto').length, 0, `${label}: no copy route where the content prefills`);
      assert.ok(answerLinks(sheetOf(app)).every((a) => /&value=/.test(a.attrs.href)), `${label}: each link prefilled`);
    } finally {
      app.restore();
    }
  }
  for (const [label, project, repos, id, , now] of sheets({ contentPrefill: false })) {
    const copied = [];
    const app = await open(project, repos, id, now, { navigator: { clipboard: { writeText: async (t) => { copied.push(t); } } } });
    try {
      const sh = sheetOf(app);
      const route17 = byClass(sh, 'v2-copyto');
      assert.equal(route17.length, 1, `${label}: the copy route`);
      assert.equal(byClass(route17[0], 'v2-small')[0].textContent, COPY_WORDS, `${label}: the words naming why`);
      const links = answerLinks(sh);
      assert.ok(links.length >= 1);
      for (const a of links) {
        assert.doesNotMatch(a.attrs.href, /[?&]value=/, `${label}: ${a.textContent} opens with only the file name`);
        assert.match(a.attrs.href, /\/new\/main\?filename=/);
      }
      const texts = findAll(route17[0], (e) => e.tag === 'pre').map((p) => p.textContent);
      const buttons = findAll(route17[0], (e) => e.tag === 'button');
      assert.equal(texts.length, links.length, `${label}: each answer's text shown`);
      assert.equal(buttons.length, links.length, `${label}: each with its own button`);
      assert.ok(buttons.every((b) => /^Copy\b/.test(b.textContent)), `${label}: "Copy"`);
      for (const t of texts) assert.ok(t.trim().length > 0, `${label}: a text to copy`);
      assert.ok(order(sh, route17[0]) < order(sh, links[0]), `${label}: before the links`);
      buttons[0].dispatch('click');
      await app.flush();
      assert.deepEqual(copied, [texts[0]], `${label}: "Copy" puts that text on the clipboard`);
      assert.equal(buttons[0].textContent, 'Copied');
    } finally {
      app.restore();
    }
  }
});
