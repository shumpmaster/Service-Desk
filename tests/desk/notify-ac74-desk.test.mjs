// ac-test: S-001/AC74 — the desk's side of the tap (the sender's side is notify-ac74.test.mjs): the
// desk opened at `/?open=<key>` opens that project, shows the item with "Opened from a notification"
// and opens its view (a card's or question's full text, a pull request's row with its link, a
// deploy's row with its run link); a key that no longer waits says "That no longer waits on you" and
// shows the project; `?open=actions-usage` opens More detail at the GitHub Actions line.
// The records are made up (tests/desk/fixtures/notify/made-up, labelled NOT real in the README).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixture } from './helpers.mjs';
import { repo, pr } from './fake-desk.mjs';
import { loadApp, findAll } from './page-harness.mjs';
import { openTarget, OPENED_WORDS, GONE_WORDS } from '../../src/lib/notifyview.js';
import { NOTIFY_FIX } from './notify-helpers.mjs';

const made = (p) => readFileSync(join(NOTIFY_FIX, 'made-up', p), 'utf8');
const SEARCH = (key) => `?open=${encodeURIComponent(key)}`;
const NOW = Date.parse('2026-10-18T15:00:00Z');

function repos() {
  return {
    'Service-Desk': repo({
      'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
      'questions/N-open.md': made('questions/N-open.md'),
      'queue/P-951-stop-1.md': made('queue/P-951-stop-1.md'),
    }, [pr(108, 'A made-up pull request to merge')], [
      { name: 'governance', status: 'completed', conclusion: 'success' },
      { path: '.github/workflows/desk-deploy.yml', name: 'desk-deploy', status: 'waiting', conclusion: null, id: 7001, run_number: 40 },
    ]),
    'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]),
  };
}

async function opened(key, extra = {}) {
  const app = await loadApp({ repos: repos(), search: SEARCH(key), now: NOW, ...extra });
  await app.advance(1000);
  return app;
}

test('AC74: the tap\'s address is read as AC73\'s key, the cost tap as actions-usage; anything else opens Home', () => {
  assert.deepEqual(openTarget(SEARCH('Service-Desk|question|questions/N-open.md')),
    { kind: 'item', key: 'Service-Desk|question|questions/N-open.md', project: 'Service-Desk', itemKind: 'question', id: 'questions/N-open.md' });
  assert.deepEqual(openTarget('?open=actions-usage'), { kind: 'usage' });
  assert.equal(openTarget(''), null);
  assert.equal(openTarget('?open=Service-Desk%7Cnot-a-kind%7Cx').kind, 'bad');
});

test('AC74: /?open=<a question\'s key> opens it: the question\'s full text, marked "Opened from a notification"', async () => {
  const app = await opened('Service-Desk|question|questions/N-open.md');
  try {
    assert.equal(app.loc.hash, '#/p/Service-Desk/q/N-open');
    const v = app.els.view.textContent;
    assert.ok(v.includes(OPENED_WORDS));
    assert.ok(v.includes('A made-up open question'));
    assert.ok(v.includes('Full text'));
  } finally {
    app.restore();
  }
});

test('AC74: a card\'s key opens the card\'s view with its full text; a pull request\'s and a deploy\'s keys open the project at their rows, with their links', async () => {
  let app = await opened('Service-Desk|card|queue/P-951-stop-1.md');
  try {
    assert.equal(app.loc.hash, '#/p/Service-Desk/card/queue%2FP-951-stop-1.md');
    assert.ok(app.els.view.textContent.includes(OPENED_WORDS));
    assert.ok(app.els.view.textContent.includes('A made-up decision for the sender\'s tests'));
  } finally {
    app.restore();
  }
  app = await opened('Service-Desk|pr|108');
  try {
    assert.equal(app.loc.hash, '#/p/Service-Desk');
    const row = findAll(app.els.view, (e) => e.attrs && e.attrs.id === 'item-pr-108')[0];
    assert.ok(row, 'the pull request\'s row');
    assert.ok(row.textContent.includes(OPENED_WORDS));
    assert.ok(findAll(row, (e) => e.tag === 'a' && e.attrs.href === 'https://github.com/shumpmaster/Service-Desk/pull/108').length, 'its link to GitHub');
    assert.ok(app.scrolled().some((e) => e.attrs.id === 'item-pr-108'), 'scrolled to it');
  } finally {
    app.restore();
  }
  app = await opened('Service-Desk|deploy|7001');
  try {
    const row = findAll(app.els.view, (e) => e.attrs && e.attrs.id === 'item-deploy--github-workflows-desk-deploy-yml-40')[0];
    assert.ok(row, 'the deploy\'s row');
    assert.ok(row.textContent.includes(OPENED_WORDS));
    assert.ok(row.textContent.includes('waiting for your approval'));
    assert.ok(findAll(row, (e) => e.tag === 'a' && /\/actions\/runs\//.test(e.attrs.href)).length, 'its run link');
  } finally {
    app.restore();
  }
});

test('AC74: a key that no longer waits says "That no longer waits on you" and shows the project; an unknown project shows Home', async () => {
  let app = await opened('Service-Desk|question|questions/N-answered-already.md');
  try {
    assert.equal(app.loc.hash, '#/p/Service-Desk');
    const v = app.els.view.textContent;
    assert.ok(v.includes(GONE_WORDS));
    assert.ok(v.includes('Waiting on you'), 'the project\'s view');
    assert.ok(!v.includes(OPENED_WORDS));
  } finally {
    app.restore();
  }
  app = await opened('Somewhere-Else|pr|1');
  try {
    assert.equal(app.loc.hash, '#/');
    assert.ok(app.els.view.textContent.includes(GONE_WORDS));
  } finally {
    app.restore();
  }
});

test('AC74: the tap is followed once the project is read, not before; and only once', async () => {
  const r = repos();
  r['Service-Desk'].fail = { kind: 'network' };
  const app = await loadApp({ repos: r, search: SEARCH('Service-Desk|question|questions/N-open.md'), now: NOW });
  try {
    await app.advance(1000);
    // Can't read: it opens the project and says so, rather than claiming the item no longer waits.
    await app.advance(4 * 60_000);
    assert.equal(app.loc.hash, '#/p/Service-Desk');
    assert.ok(!app.els.view.textContent.includes(GONE_WORDS));
    assert.ok(app.els.view.textContent.includes(`${OPENED_WORDS}: the desk can't read this project just now`));
    delete r['Service-Desk'].fail;
    app.loc.hash = '#/';
    await app.advance(60_000);
    assert.equal(app.loc.hash, '#/', 'followed once only');
  } finally {
    app.restore();
  }
});

test('AC74, AC78: /?open=actions-usage opens More detail at the "GitHub Actions this month" line', async () => {
  const app = await opened('actions-usage');
  try {
    assert.equal(app.loc.hash, '#/');
    const more = findAll(app.els.view, (e) => e.attrs && e.attrs.id === 'more-detail')[0];
    assert.equal(more.attrs.open, 'open');
    const line = findAll(more, (e) => e.attrs && e.attrs.id === 'actions-usage')[0];
    assert.ok(line.textContent.startsWith('GitHub Actions this month'));
    assert.ok(app.scrolled().some((e) => e.attrs.id === 'actions-usage'), 'scrolled to the line');
  } finally {
    app.restore();
  }
});
