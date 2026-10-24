// ac-test: S-001/AC17 ac-test: S-001/AC18 — the desk's answer sheets (AC80's decision card, AC85's lettered and
// numbered questions and its gate card) from stage 8, when the accepted card and question views that drew AC17's and
// AC18's fallbacks are gone (AC44, step 4, specs/S-001.md:2918-2921). AC53 keeps both on every answer link: "every
// link follows AC53's 'When it would not fit' (AC17's copy route past `linkCap`, or where `contentPrefill` is
// `false`) and AC18's message where `webCommitsToDefault` is `false`, as today" (:6077-6080).
// - AC18 (:2536-2541): before the link, J7's message word for word; the link itself J3's URL, unchanged.
// - AC17 (:2531-2535): the answer text shown with a "Copy" button, and the new-file page opened with only the file name;
//   changed after MD3 (:2911-2927): each choice's box holds its own "Copy", the texts one tap down in the sheet's fold.
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

async function open(project, repos, id, now, globals = {}, linkCap = CONFIG.linkCap) {
  const app = await loadSandbox({ config: { ...CONFIG, linkCap, projects: [project] }, repos, hash: route(id), now, globals });
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

// AC17, changed after MD3 (specs/S-001.md:2911-2927; "Ruling: A — when an answer is too long to prefill, a Copy sits
// inside each choice's box, with the text one tap down", decisions/questions/P-001-audit-copy.md, line 1; stage 5 of
// "After MD3"): this case replaces stage 8's, which checked the texts and their buttons stacked above the choices.
const boxesOf = (sh) => {
  const opts = byClass(sh, 'v2-opt').filter((o) => answerLinks(o).length);
  return opts.length ? opts : findAll(sh, (e) => e.dataset && e.dataset.k === 'numbered-btn');
};
const copiesIn = (el) => findAll(el, (e) => e.tag === 'button' && /^(Copy|Copied)$/.test(e.textContent));
/** The texts in the sheet's fold that holds each answer's file (opened first where it is a fold button). */
async function foldTexts(app, id) {
  const fold = findAll(sheetOf(app), (e) => e.dataset && e.dataset.k === `fold:whole:${id}`)[0];
  if (fold && fold.attrs['aria-expanded'] !== 'true') await app.tap(fold);
  const files = findAll(sheetOf(app), (e) => e.dataset && e.dataset.k === 'whole-files')[0];
  assert.ok(files, 'the fold holds each answer\'s file');
  return findAll(files, (e) => e.tag === 'pre').map((p) => p.textContent);
}
async function typeWords(app, text) {
  const ta = findAll(sheetOf(app), (e) => e.tag === 'textarea' && /#1$/.test(e.dataset.k || ''))[0];
  assert.ok(ta, 'the sheet\'s box');
  ta.value = text;
  ta.dispatch('input', { target: ta });
  await app.flush();
}

test('AC17, changed after MD3 (P-001-audit-copy, A): on each sheet with choices, with contentPrefill false and with a text past linkCap — one "Copy" in each choice\'s box and none above the choices; each Copy\'s text equal, character for character, to that choice\'s file in the fold, with and without the owner\'s words; each answer button\'s link holding the file name only; the cause\'s words under the choices; none of it where content prefills', async () => {
  for (const [label, project, repos, id, , now] of sheets()) {
    const app = await open(project, repos, id, now);
    try {
      const sh = sheetOf(app);
      assert.equal(copiesIn(sh).length, 0, `${label}: no "Copy" where the content prefills`);
      assert.ok(!sh.textContent.includes(COPY_WORDS), `${label}: no cause's words`);
      assert.ok(answerLinks(sh).every((a) => /&value=/.test(a.attrs.href)), `${label}: each link prefilled`);
    } finally {
      app.restore();
    }
  }
  const ways = [['contentPrefill false', sheets({ contentPrefill: false }), CONFIG.linkCap], ['a text past linkCap', sheets(), 60]];
  for (const [way, list, linkCap] of ways) {
    for (const [name, project, repos, id, , now] of list) {
      const label = `${name}, ${way}`;
      const copied = [];
      const app = await open(project, repos, id, now, { navigator: { clipboard: { writeText: async (t) => { copied.push(t); } } } }, linkCap);
      try {
        const sh = sheetOf(app);
        const boxes = boxesOf(sh);
        const links = answerLinks(sh);
        assert.ok(boxes.length >= 1, `${label}: its choices`);
        assert.equal(boxes.length, links.length, `${label}: each answer button in its choice's box`);
        for (const b of boxes) {
          assert.equal(copiesIn(b).length, 1, `${label}: one "Copy" in each choice's box`);
          assert.equal(answerLinks(b).length, 1, `${label}: beside its one answer button`);
        }
        assert.equal(copiesIn(sh).length, boxes.length, `${label}: no other "Copy" on the sheet`);
        const first = order(sh, boxes[0]);
        assert.ok(findAll(sh, (e) => e.tag === 'pre' || (e.tag === 'button' && /^Copy/.test(e.textContent))).every((e) => order(sh, e) > first), `${label}: nothing stacked above the choices`);
        assert.equal(byClass(sh, 'v2-copyto').length, 0, `${label}: no copy route block`);
        for (const a of links) {
          assert.doesNotMatch(a.attrs.href, /[?&]value=/, `${label}: ${a.textContent} opens with only the file name`);
          assert.match(a.attrs.href, /\/new\/main\?filename=/);
        }
        const cause = findAll(sh, (e) => e.tag === 'p' && e.textContent === COPY_WORDS);
        assert.equal(cause.length, 1, `${label}: the cause's words, once`);
        assert.ok(order(sh, cause[0]) > order(sh, boxes[boxes.length - 1]), `${label}: under the choices`);
        // Each Copy's text is that choice's file in the fold, character for character: first with the box empty, then with words.
        for (const words of [null, 'Made-up words for AC17\'s test (NOT a real ruling).\nA second line.']) {
          if (words) await typeWords(app, words);
          const texts = await foldTexts(app, id);
          assert.equal(texts.length, boxes.length, `${label}: one file in the fold for each choice`);
          if (words) assert.ok(texts.every((t) => t.includes('Made-up words for AC17')), `${label}: the owner's words in each file`);
          copied.length = 0;
          const now2 = boxesOf(sheetOf(app));
          for (let i = 0; i < now2.length; i++) {
            copiesIn(boxesOf(sheetOf(app))[i])[0].dispatch('click');
            await app.flush();
          }
          assert.deepEqual(copied, texts, `${label}${words ? ', with words' : ''}: each "Copy" copies its choice's file`);
          assert.ok(copiesIn(sheetOf(app)).every((b) => b.textContent === 'Copied'), `${label}: each says it copied`);
        }
      } finally {
        app.restore();
      }
    }
  }
});
