// ac-test: S-001/AC67 ac-test: S-001/AC90 — the Team screen after MD3 (stage 4 of "After MD3", specs/S-001.md:2326):
// "Ruling: B — the Team screen folds idle members into one line and drops its five-mark key"
// (decisions/questions/P-001-audit-team.md, line 1; AC67, changed, :6093-6111), and AC90's Team part, a shared reason said
// once at the head of the opened idle list (:8029-8032). Fixtures: Service-Desk's J11 records at 3117150 (real), AC52's one
// item of each kind (made up, NOT real), md-extremes (made up), a v2.5 project in poom/'s placeholder form, and J13's
// made-up session files.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from './helpers.mjs';
import { loadSandbox, byClass, findAll, openIdle } from './sandbox-helpers.mjs';
import { textSetup } from './screen-text.mjs';
import { NOW, extremes } from './sandbox-fixtures.mjs';
import { SD3, sdRepo } from './tv2-fixtures.mjs';
import { memStore } from './wa-fixtures.mjs';
import { POLL_MS } from '../../src/lib/scheduler.js';
import { IDLE_LINE, teamOnce, TEAM_IDLE_KEY } from '../../src/public/sandbox.js';

const keyed = (app, k) => findAll(app.view, (e) => e.dataset && e.dataset.k === k)[0] || null;
const cards = (app) => findAll(app.view, (e) => e.attrs && e.attrs['data-member'] != null);
const ids = (els) => els.map((e) => e.attrs['data-member']);
const statusOf = (card) => byClass(card, 'sb-tile-st')[0].textContent;
const inIdle = (app) => { const l = keyed(app, 'team-idle-list'); return l ? ids(cards({ view: l })) : []; };
async function team(setup, name, { store = null } = {}) {
  const app = await loadSandbox({ ...setup, hash: `#/p/${encodeURIComponent(name)}/team`, now: NOW, store });
  await app.advance(1000);
  await app.advance(POLL_MS);
  return app;
}

test('AC67 (after MD3): from every fixture — no key; idle members folded into "<n> idle ›", counted against the members whose word is "Idle"; their cards absent until a tap, then as built, folded again on a second tap; every other card in place, in AC49\'s order', async () => {
  assert.equal(IDLE_LINE(1), '1 idle ›', 'its singular');
  assert.equal(IDLE_LINE(10), '10 idle ›');
  let screens = 0;
  for (const s of [textSetup(), extremes(), { config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } }]) {
    for (const p of s.config.projects) {
      const app = await team(s, p.name);
      try {
        screens++;
        assert.equal(byClass(app.view, 'sb-tkey').length + byClass(app.view, 'sb-keye').length, 0, `${p.name}: no key`);
        const shown = cards(app);
        assert.ok(shown.every((c) => statusOf(c) !== 'Idle'), `${p.name}: no idle card before the tap`);
        const line = keyed(app, 'team-idle');
        // Open them: every member's card, in AC49's order, as teamView gives the members.
        if (!line) {
          assert.ok(shown.length >= 1);
          continue;
        }
        assert.equal(line.attrs['aria-expanded'], 'false');
        await app.tap(line);
        const idle = inIdle(app);
        assert.equal(keyed(app, 'team-idle').textContent, IDLE_LINE(idle.length), `${p.name}: the count`);
        const all = cards(app);
        assert.ok(all.filter((c) => idle.includes(c.attrs['data-member'])).every((c) => statusOf(c) === 'Idle'), `${p.name}: each opened card is an idle member's`);
        assert.ok(all.filter((c) => !idle.includes(c.attrs['data-member'])).every((c) => statusOf(c) !== 'Idle'), `${p.name}: every other card is not`);
        assert.deepEqual(ids(shown), ids(all).filter((x) => !idle.includes(x)), `${p.name}: the other cards in place`);
        assert.equal(keyed(app, 'team-idle').attrs['aria-expanded'], 'true');
        // Each opened card as built: its icon, its name linking to the member's page.
        for (const c of all.filter((x) => idle.includes(x.attrs['data-member']))) {
          assert.equal(byClass(c, 'i-planned').length, 1, 'idle: the empty dashed circle');
          assert.match(byClass(c, 'sb-tile-n')[0].attrs.href, new RegExp(`/team/${c.attrs['data-member']}$`));
        }
        await app.tap(keyed(app, 'team-idle'));
        assert.deepEqual(inIdle(app), [], `${p.name}: folded again`);
        assert.ok(cards(app).every((c) => statusOf(c) !== 'Idle'));
      } finally {
        app.restore();
      }
    }
  }
  assert.ok(screens >= 8, `${screens} Team screens`);
});

test('AC67 (after MD3): the members\' order is AC49\'s — the cards first, then the idle ones as opened, each list in teamView\'s order; with none idle (a v2.5 project), no line', async () => {
  const s = { config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } };
  const app = await team(s, 'Service-Desk');
  try {
    await openIdle(app);
    const order = ids(cards(app));
    const sorted = (xs) => [...xs].sort();
    assert.deepEqual(sorted(order), sorted(['chief-of-staff', 'orchestrator', 'definer', 'check-author', 'builder', 'source-checker', 'input-reader', 'researcher', 'critic', 'reviewer', 'user-rep']));
    const idle = inIdle(app);
    assert.deepEqual(order, [...order.filter((x) => !idle.includes(x)), ...idle], 'the other cards, then the idle ones');
    assert.equal(keyed(app, 'team-idle').textContent, '10 idle ›', 'Service-Desk at 3117150: ten idle, the Chief of Staff not ("No session recorded yet")');
  } finally {
    app.restore();
  }
  const t = textSetup();
  const d = await team(t, 'Delta');
  try {
    assert.equal(keyed(d, 'team-idle'), null, 'none idle: no line');
    assert.equal(cards(d).length, 1);
  } finally {
    d.restore();
  }
});

test('AC67 (after MD3): the fold\'s state is kept through a refresh and a full reload, on this device, under its own key', async () => {
  const s = { config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } };
  const store = memStore();
  let app = await team(s, 'Service-Desk', { store });
  try {
    await app.tap(keyed(app, 'team-idle'));
    assert.equal(inIdle(app).length, 10);
    app.module.refresh();
    await app.flush();
    await app.advance(POLL_MS);
    assert.equal(inIdle(app).length, 10, 'a refresh leaves it open');
    assert.deepEqual(JSON.parse(store.m.get(TEAM_IDLE_KEY)), { 'Service-Desk': true });
    app.restore();
    app = await team(s, 'Service-Desk', { store });
    assert.equal(inIdle(app).length, 10, 'a reload too');
    await app.tap(keyed(app, 'team-idle'));
    app.restore();
    app = await team(s, 'Service-Desk', { store });
    assert.equal(inIdle(app).length, 0, 'folded, it stays folded');
  } finally {
    app.restore();
  }
});

test('AC90 (Team part): in the opened idle list, "not recorded in what the desk reads" is said once at the list\'s head, "<k> of <n> members · last work not recorded in what the desk reads"; the cards it covers drop it; a card whose record names its work keeps its "last:"', async () => {
  assert.equal(teamOnce(5, 10), '5 of 10 members · last work not recorded in what the desk reads');
  assert.equal(teamOnce(3, 3), '3 members · last work not recorded in what the desk reads');
  const s = { config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } };
  const app = await team(s, 'Service-Desk');
  try {
    assert.equal(keyed(app, 'team-once:idle'), null, 'folded: no line');
    await openIdle(app);
    const list = keyed(app, 'team-idle-list');
    const head = keyed(app, 'team-once:idle');
    assert.equal(head.textContent, '5 of 10 members · last work not recorded in what the desk reads');
    assert.equal(list.children[0], head, 'at the head of the opened list');
    assert.equal(findAll(app.view, (e) => / sb-tonce /.test(` ${e.className} `)).length, 1, 'said once');
    assert.doesNotMatch(list.textContent.replace(head.textContent, ''), /not recorded in what the desk reads/, 'none on the cards it covers');
    const card = (m) => cards(app).find((c) => c.attrs['data-member'] === m);
    for (const m of ['check-author', 'builder', 'input-reader', 'reviewer', 'user-rep']) assert.doesNotMatch(card(m).textContent, /last:|not recorded in what/, m);
    assert.match(card('researcher').textContent, /last: Q-013: researcher finished — ok, 8 Oct/, 'its own record\'s words');
    // The other cards: no reason shared, so no line (the Chief of Staff's "last: not recorded" is its own).
    assert.equal(keyed(app, 'team-once:cards'), null);
  } finally {
    app.restore();
  }
});

// The Reviewer's round 1 of stage 4 (mutations I1 and I6): only "Idle" folds; and AC90's line needs two or more cards.
test('AC67 (after MD3): a member whose word is "Just finished" stays a card and is never folded — Service-Desk\'s real log read at 22:00 UTC on 8 Oct, eight minutes after the source checker\'s last outcome and twelve after the researcher\'s', async () => {
  const s = { config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': sdRepo() } };
  const app = await loadSandbox({ ...s, hash: `#/p/${encodeURIComponent('Service-Desk')}/team`, now: Date.parse('2026-10-08T22:00:00Z') });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const shown = cards(app);
    const just = shown.filter((c) => statusOf(c) === 'Just finished');
    assert.deepEqual(ids(just).sort(), ['researcher', 'source-checker'], 'both cards, before any tap');
    assert.equal(keyed(app, 'team-idle').textContent, '8 idle ›', 'the two not counted');
    await openIdle(app);
    const idle = inIdle(app);
    assert.equal(idle.length, 8);
    assert.ok(!idle.includes('researcher') && !idle.includes('source-checker'), 'never in the folded list');
    assert.ok(cards(app).filter((c) => idle.includes(c.attrs['data-member'])).every((c) => statusOf(c) === 'Idle'));
  } finally {
    app.restore();
  }
});

test('AC90 (Team part): a reason only one card of a list has stays on that card, with no line at the list\'s head — Service-Desk at 3117150 with four made-up outcome lines (NOT real records), leaving only the user representative without recorded work', async () => {
  const r = sdRepo();
  const path = 'dispatch-log/2026-10.jsonl';
  // Made up, NOT real records (tests/desk/fixtures/README.md, "After MD3, stage 4"): one outcome line each, days before NOW.
  const made = ['check-author', 'builder', 'input-reader', 'reviewer'].map((role, i) => JSON.stringify({ item: 'Q-013', record: null, result: 'ok', role,
    session: `Q-013:made-up:2026-10-08T23:0${i}:00Z`, time: `2026-10-08T23:0${i}:30Z`, trigger: 'outcome', verdict: 'none' }));
  r.files[path] = `${r.files[path].replace(/\n$/, '')}\n${made.join('\n')}\n`;
  const app = await team({ config: { ...CONFIG, projects: [SD3] }, repos: { 'Service-Desk': r } }, 'Service-Desk');
  try {
    await openIdle(app);
    assert.equal(keyed(app, 'team-once:idle'), null, 'one card: no line at the head');
    assert.equal(findAll(app.view, (e) => / sb-tonce /.test(` ${e.className} `)).length, 0);
    const card = (m) => cards(app).find((c) => c.attrs['data-member'] === m);
    assert.match(card('user-rep').textContent, /not recorded in what the desk reads/, 'it stays on its one card');
    for (const m of ['check-author', 'builder', 'input-reader', 'reviewer']) assert.match(card(m).textContent, /last: /, `${m}: its made-up line`);
  } finally {
    app.restore();
  }
});
