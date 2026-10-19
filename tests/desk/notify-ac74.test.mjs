// ac-test: S-001/AC74 — the sender with a fake clock, a fake GitHub and a fake push service: one push
// per newly waiting key, with its title, body and tap address; none for a key already sent, one that
// stopped waiting, a job candidate or a held question; a key that stops and starts again sent again;
// three new keys in one grouped push; a body cut at 140 characters; an outside author's pull request
// with no title. (The desk's side of the tap, `/?sandbox&open=<key>` from 2026-10-19, is in notify-ac74-desk.test.mjs.)

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIX } from './helpers.mjs';
import { NOTIFY_FIX, checkoutOf, filesUnder, harness, pull, cleanScratch } from './notify-helpers.mjs';

after(cleanScratch);

const T = { 'questions/_TEMPLATE.md': '# Ruling needed: <title>\n' };
const madeUp = filesUnder(join(NOTIFY_FIX, 'made-up'));
const pick = (...paths) => Object.fromEntries(paths.map((p) => [p, madeUp[p]]));
const m2 = (p) => readFileSync(join(FIX, 'orchestrator-m2', p));
const Q = (title, extra = '') => `# Ruling needed: ${title}\n\nMilestone: none (made up)\n${extra}\nWHY: made up\n`;
const D = 'https://desk.example.invalid';

/** A harness whose first run (the bootstrap) sees nothing, so later runs show what each new record sends. */
async function started(extraWorld = (w) => w) {
  const h = harness({ checkout: checkoutOf({ base: T }) });
  extraWorld(h.world);
  const r = await h.run();
  assert.equal(r.payloads[0].notification.body, 'Notifications are on: nothing waits on you now');
  return h;
}
const later = (files) => checkoutOf({ base: T, later: [{ files, date: '2026-10-18T11:30:00+00:00' }] });

test('AC74: one notification per newly waiting thing, its title the project, its body the kind and title, its tap the item on the desk', async () => {
  const cases = [
    [pick('queue/P-951-stop-1.md'), "Waits on you: a decision card: A made-up decision for the sender's tests: what happens next?", 'Service-Desk|card|queue/P-951-stop-1.md'],
    [pick('queue/P-952-criteria-1.md'), 'Waits on you: a gate ruling: A made-up gate ruling: are the criteria right?', 'Service-Desk|gate|queue/P-952-criteria-1.md'],
    [pick('status/P-950.toml'), 'Waits on you: a card that went missing: P-950: card stop-1 (card file not found)', 'Service-Desk|missing-card|status/P-950.toml'],
    [pick('questions/N-open.md'), 'Waits on you: a question: A made-up open question', 'Service-Desk|question|questions/N-open.md'],
    [{ 'queue/Q-007-merge-by-hand.md': m2('queue/Q-007-merge-by-hand.md') }, 'Waits on you: a merge to do by hand: Q-007: merge by hand', 'Service-Desk|merge|queue/Q-007-merge-by-hand.md'],
    [{ 'queue/ci-hold-e2ab9c55e561.md': m2('queue/ci-hold-e2ab9c55e561.md') }, "Waits on you: a held loop: the default branch's governance run is not green", 'Service-Desk|hold|queue/ci-hold-e2ab9c55e561.md'],
  ];
  for (const [files, body, key] of cases) {
    const h = await started();
    h.checkout = later(files);
    const r = await h.run();
    assert.equal(r.pushes.length, 1, key);
    assert.deepEqual(r.payloads[0].notification, { title: 'Service-Desk', body, navigate: `${D}/?sandbox&open=${encodeURIComponent(key)}`, tag: r.pushes[0].headers.get('topic') }, key);
    // Sent once, never repeated.
    assert.equal((await h.run()).pushes.length, 0, key);
  }
});

test('AC74: a pull request, a deploy, and an outside author\'s pull request with no title', async () => {
  const h = await started();
  h.world.pulls = [pull(41, { title: 'Add the made-up thing' })];
  let r = await h.run();
  assert.equal(r.payloads[0].notification.body, 'Waits on you: a pull request to merge: Add the made-up thing');
  assert.equal(r.payloads[0].notification.navigate, `${D}/?sandbox&open=${encodeURIComponent('Service-Desk|pr|41')}`);
  h.world.pulls.push(pull(42, { title: 'Words a stranger chose', headRepo: 'someone/Service-Desk', association: 'NONE', login: 'someone' }));
  r = await h.run();
  assert.equal(r.payloads[0].notification.body, 'Waits on you: a pull request from someone outside the project');
  assert.ok(!JSON.stringify(r.payloads).includes('stranger'));
  for (const assoc of ['CONTRIBUTOR', 'FIRST_TIME_CONTRIBUTOR', 'FIRST_TIMER', 'MANNEQUIN', 'NONE']) {
    h.world.pulls = [pull(43, { title: 'x', association: assoc })];
    const rr = await h.run();
    assert.equal(rr.payloads[0].notification.body, 'Waits on you: a pull request from someone outside the project', assoc);
    h.world.pulls = [];
    await h.run();
  }
  h.world.pulls = [pull(44, { title: 'A collaborator\'s work', association: 'COLLABORATOR' })];
  r = await h.run();
  assert.equal(r.payloads[0].notification.body, "Waits on you: a pull request to merge: A collaborator's work");
  h.world.waiting = [{ id: 9001, status: 'waiting', display_title: 'deploy 1234567' }];
  r = await h.run();
  assert.equal(r.payloads[0].notification.body, 'Waits on you: a deploy to approve: deploy 1234567');
  assert.equal(r.payloads[0].notification.navigate, `${D}/?sandbox&open=${encodeURIComponent('Service-Desk|deploy|9001')}`);
  // Draft 9 (build review round 1, Sec 8): a waiting run from another repository (a fork's) puts no
  // title on the lock screen: its kind's words alone, as for an outside author's pull request.
  h.world.waiting.push({ id: 9002, status: 'waiting', display_title: 'Words a fork author chose', head_repository: { full_name: 'someone/Service-Desk' } });
  r = await h.run();
  assert.deepEqual(r.payloads.map((p) => p.notification.body), ['Waits on you: a deploy to approve']);
  assert.ok(!JSON.stringify(r.payloads).includes('fork author'));
  assert.equal(r.payloads[0].notification.navigate, `${D}/?sandbox&open=${encodeURIComponent('Service-Desk|deploy|9002')}`);
  // A run whose head repository GitHub doesn't give: no title either.
  h.world.waiting.push({ id: 9003, status: 'waiting', display_title: 'Unknown origin', head_repository: null });
  r = await h.run();
  assert.deepEqual(r.payloads.map((p) => p.notification.body), ['Waits on you: a deploy to approve']);
});

test('AC74: no push for one that stopped waiting, for a held question, or for a job candidate; a key that stops and starts again is sent again', async () => {
  const h = await started();
  h.world.pulls = [pull(51)];
  assert.equal((await h.run()).pushes.length, 1);
  h.world.pulls = [];
  assert.equal((await h.run()).pushes.length, 0, 'nothing when it stops');
  h.world.pulls = [pull(51)];
  assert.equal((await h.run()).pushes.length, 1, 'waiting anew, a run having seen it stop');
  // Turned into a draft and back between two runs: not seen to stop (the known limit).
  h.world.pulls = [pull(51)];
  assert.equal((await h.run()).pushes.length, 0);
  // A held question: nothing.
  h.checkout = later(pick('questions/N-held.md', 'sessions/chief-of-staff/s-made-up.jsonl'));
  assert.equal((await h.run()).pushes.length, 0);
  // A job candidate (the real ledger's grant, at ef8daf4): nothing while the job may merge it; one
  // push once it waits on the owner (its check failed, rule (a)).
  const j = harness({ checkout: checkoutOf({ base: filesUnder(join(NOTIFY_FIX, 'sd-ef8daf4')) }) });
  await j.run();
  const sha = '8'.repeat(40);
  j.world.pulls = [pull(81, { sha })];
  j.world.files[81] = [{ filename: 'questions/N-filed.md', status: 'added' }];
  const run = (status, conclusion) => ({ id: 1, name: 'build', status, conclusion, completed_at: null, check_suite: { id: 10 } });
  j.world.checks[sha] = { checkRuns: [run('in_progress', null)], workflowRuns: [{ check_suite_id: 10, path: '.github/workflows/desk-build.yml' }], statuses: [] };
  const rj = await j.run();
  assert.equal(rj.pushes.length, 0);
  assert.ok(rj.logs.some((l) => /1 the automatic job may still merge/.test(l)));
  j.world.checks[sha].checkRuns = [run('completed', 'failure')];
  const rj2 = await j.run();
  assert.equal(rj2.pushes.length, 1);
  assert.equal(rj2.payloads[0].notification.navigate, `${D}/?sandbox&open=${encodeURIComponent('Service-Desk|pr|81')}`);
});

test('AC74: three or more newly waiting in one run give one grouped notification opening Home', async () => {
  const h = await started();
  h.world.pulls = [pull(61), pull(62)];
  h.checkout = later(pick('questions/N-open.md'));
  const r = await h.run();
  assert.equal(r.pushes.length, 1);
  assert.deepEqual(r.payloads[0].notification, { title: 'Service Desk', body: '3 things now wait on you in Service-Desk', navigate: `${D}/?sandbox`, tag: r.pushes[0].headers.get('topic') });
  assert.equal((await h.run()).pushes.length, 0);
  // Two new: one each.
  h.world.pulls.push(pull(63), pull(64));
  const r2 = await h.run();
  assert.equal(r2.pushes.length, 2);
  assert.ok(r2.payloads.every((p) => p.notification.title === 'Service-Desk'));
});

test('AC74: the body cut to 140 characters with "…", record text beyond the title never sent', async () => {
  const h = await started();
  const long = `${'A very long made-up title, '.repeat(10)}end`;
  h.checkout = later({ 'questions/N-long.md': Q(long, '\nThe text beyond the title, which never reaches the phone.\n') });
  const r = await h.run();
  const body = r.payloads[0].notification.body;
  assert.ok(body.startsWith('Waits on you: a question: A very long'));
  const what = body.slice('Waits on you: a question: '.length);
  assert.equal(Array.from(what).length, 140);
  assert.ok(what.endsWith('…'));
  assert.ok(!JSON.stringify(r.payloads[0]).includes('never reaches'));
  // A title holding line breaks and control characters reaches the phone as plain words.
  h.world.pulls = [pull(71, { title: 'Line one\nline two\u0007' })];
  const r2 = await h.run();
  assert.equal(r2.payloads[0].notification.body, 'Waits on you: a pull request to merge: Line one line two');
});

// From 2026-10-19 (the owner's ruling "A. Go live now, switch later (Recommended)"): every tap opens
// the sandbox view: an item's at `/?sandbox&open=<key>`, Home's at `/?sandbox` (AC74, J17).
test('AC74, J17 (2026-10-19): the tap addresses open the sandbox: /?sandbox&open=<key> for an item, /?sandbox for Home', async () => {
  const { openUrl, homeUrl } = await import('../../src/notify/words.mjs');
  assert.equal(openUrl('https://service-desk-preview.pages.dev', 'Service-Desk|question|questions/N-a.md'),
    'https://service-desk-preview.pages.dev/?sandbox&open=Service-Desk%7Cquestion%7Cquestions%2FN-a.md');
  assert.equal(openUrl('https://service-desk-preview.pages.dev', 'actions-usage'), 'https://service-desk-preview.pages.dev/?sandbox&open=actions-usage');
  assert.equal(homeUrl('https://service-desk-preview.pages.dev'), 'https://service-desk-preview.pages.dev/?sandbox');
});
