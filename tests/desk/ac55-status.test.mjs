// AC55 (spec S-001, trial-view notes 6 and 7): the Status screen's "Your last action" line, and
// "More detail" rebuilt in the new design inside the sandbox, with the accepted views' facts.
// ac-test: S-001/AC55
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, fixture } from './helpers.mjs';
import { repo, pr } from './fake-desk.mjs';
import { loadApp, findAll as findAllApp } from './page-harness.mjs';
import { loadSandbox, byClass, findAll, linksIn } from './sandbox-helpers.mjs';
import { NOW, iso, v3, v25, fullRepo, twoProjects } from './sandbox-fixtures.mjs';
import { lastAction, ownerActions, doneToday } from '../../src/lib/sandbox.js';
import { POLL_MS } from '../../src/lib/scheduler.js';

const P = v3('A');
const dec = (min, extra = {}) => ({ shape: 'decision', item: 'P-001', gate: 'dor', card: 4, word: 'build', record: 'decisions/P-001/dor-4.md', proxy: false, time: iso(NOW - min * 60e3), ...extra });

/** A snapshot holding the given decisions/questions files: { name: [line-1 text, minutes ago, line-2 Proxy?] }. */
function snapWith(files, { withHistory = true, read = true } = {}) {
  const tree = new Map([['decisions/P-001/dor-4.md', {}]]);
  const records = new Map();
  const history = new Map();
  for (const [name, [line1, min, proxy]] of Object.entries(files)) {
    const path = `decisions/questions/${name}.md`;
    tree.set(path, {});
    if (read) records.set(path, { line1, line2Proxy: Boolean(proxy) });
    if (withHistory) history.set(path, { oldest: iso(NOW - min * 60e3) });
  }
  return { tree, records, history };
}
const la = (model, snap, project = P) => lastAction(project, model, snap, null, new Date(NOW), 'America/Chicago');

test('AC55: "Your last action" — a card answer latest, a ruling latest, a proxy ruling, a profile approval, neither, a v2.5 project, and ruling times not all in', () => {
  const card = la({ allEntries: [dec(30)] }, snapWith({ 'P-001-design-pick': ['Ruling: the five agreed screens are the direction', 90] }));
  assert.equal(card.text, 'Your last action: P-001: you answered dor-4 with build · 09:30');
  assert.equal(card.code, 'P-001 dor-4');
  assert.equal(card.link, 'https://github.com/shumpmaster/A/blob/main/decisions/P-001/dor-4.md');
  const ruling = la({ allEntries: [dec(120)] }, snapWith({ 'P-001-design-pick': ['Ruling: the five agreed screens are the direction', 30] }));
  assert.equal(ruling.text, 'Your last action: the five agreed screens are the direction · 09:30');
  assert.equal(ruling.code, 'P-001-design-pick');
  assert.equal(ruling.link, 'https://github.com/shumpmaster/A/blob/main/decisions/questions/P-001-design-pick.md');
  const proxy = la({ allEntries: [] }, snapWith({ 'P-001-x': ['Ruling: A', 10, true] }));
  assert.equal(proxy.text, 'Your last action: A (proxy) · 09:50');
  const cardProxy = la({ allEntries: [dec(5, { proxy: true })] }, snapWith({}));
  assert.equal(cardProxy.text, 'Your last action: P-001: you answered dor-4 with build (proxy) · 09:55');
  const profile = la({ allEntries: [] }, snapWith({ 'P-002-user-profile-1': ['Decision: approve', 10], 'P-002-other': ['Decision: approve', 5] }));
  assert.equal(profile.text, 'Your last action: approve · 09:50', 'a profile approval counts; a Decision: line elsewhere does not');
  assert.equal(la({ allEntries: [] }, snapWith({})).text, 'Your last action: not recorded');
  assert.equal(la({}, snapWith({}), v25('B')).text, 'Your last action: not recorded (operating model v2.5.1 records rulings in the ledger)');
  const pending = la({ allEntries: [dec(30)] }, snapWith({ 'P-001-design-pick': ['Ruling: x', 90] }, { withHistory: false }));
  assert.equal(pending.text, 'Your last action: not available yet', 'until every ruling\'s time has arrived');
  const unread = la({ allEntries: [dec(30)] }, snapWith({ 'P-001-design-pick': ['Ruling: x', 10] }, { read: false }));
  assert.equal(unread.text, 'Your last action: not available yet', 'a newer ruling not read yet may be the latest');
  const older = la({ allEntries: [dec(5)] }, snapWith({ 'P-001-design-pick': ['Ruling: x', 300] }, { read: false }));
  assert.equal(older.text, 'Your last action: P-001: you answered dor-4 with build · 09:55', 'an older one not read yet cannot be');
});

test('AC55 + AC52: a Critic\'s verdict in decisions/questions/, newer than every ruling and card answer, is never named nor shown in "Done today"; nor is a -notes file', () => {
  const snap = snapWith({ 'P-001-design-pick': ['Ruling: the five agreed screens', 60], 'P-001-milestones-adoption-critic-1': ['Verdict: FAIL', 5] });
  snap.tree.set('decisions/questions/P-001-design-pick-notes.md', {});
  snap.history.set('decisions/questions/P-001-design-pick-notes.md', { oldest: iso(NOW - 60e3) });
  const model = { allEntries: [dec(120)] };
  assert.equal(la(model, snap).text, 'Your last action: the five agreed screens · 09:00');
  assert.ok(!ownerActions(P, model, snap, null).actions.some((a) => /critic/.test(a.code)));
  const done = doneToday(P, model, snap, new Date(NOW), 'America/Chicago');
  assert.ok(!done.some((d) => /critic|Verdict/.test(`${d.text} ${d.code}`)), JSON.stringify(done));
});

test('AC55: the line sits just above the waiting bar, with its link and its code; the reason the merges are missing is one tap away', async () => {
  const setup = twoProjects();
  setup.repos.Alpha.commit({ 'decisions/questions/Alpha-older.md': 'Ruling: A\nProxy: done at the owner\'s request\n' });
  setup.repos.Alpha.history['decisions/questions/Alpha-older.md'] = [{ commit: { committer: { date: iso(NOW - 30 * 60e3) } } }];
  const app = await loadSandbox({ ...setup, hash: '#/p/Alpha', now: NOW });
  try {
    await app.advance(1000);
    await app.advance(POLL_MS);
    const screen = byClass(app.view, 'sb-screen')[0];
    const kids = screen.children;
    const at = kids.findIndex((c) => c.className === 'sb-last');
    assert.ok(at > 0, 'the line is there');
    assert.ok(kids[at + 1].className.includes('sb-actions'), 'just above the bar');
    const bar = byClass(kids[at + 1], 'sb-btn')[0];
    assert.match(bar.textContent, /decision|to merge|gate ruling|Nothing waits on you/, 'the bar says whether anything waits');
    const line = kids[at];
    assert.match(line.textContent, /^Your last action: A \(proxy\) · \d\d:\d\d Alpha-older/);
    assert.equal(linksIn(line).find((l) => l.text === 'Alpha-older').href, 'https://github.com/shumpmaster/Alpha/blob/main/decisions/questions/Alpha-older.md');
    assert.match(line.textContent, /your merges aren't recorded in what the desk reads/);
  } finally {
    app.restore();
  }
});

// ---------------------------------------------------------------------------
// "More detail": the same facts as the accepted views

/** The fixtures AC9–AC12 and AC20–AC23's tests use, together: a card, a question, a ruling, the log, the usage record, a PR; and a v2.5 project. */
function detailRepos() {
  const sd = repo({
    'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'),
    'dispatch-log/2026-10.jsonl': fixture('service-desk/dispatch-log/2026-10.jsonl'),
    'status/outcomes.jsonl': fixture('service-desk/status/outcomes-usage-frozen.jsonl'),
    'status/P-001.toml': fixture('service-desk/status/P-001@d4d0110.toml'),
    'queue/P-001-dor-fail-2.md': fixture('service-desk/queue/P-001-dor-fail-2.md'),
    'queue/P-001-stop-6.md': fixture('service-desk/queue/P-001-stop-6.md'), 'decisions/P-001/stop-6.md': 'Decision: re-scope\n',
    'questions/Q-005-sources.md': fixture('service-desk/questions/Q-005-sources.md'),
  }, [pr(61, 'Desk: a change to merge')], [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  const poom = repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md'), 'docs/sprints/m1.4-v3-build.md': fixture('poom/docs/sprints/m1.4-v3-build.md'),
    'questions/Q-030-x.md': fixture('service-desk/questions/Q-005-sources.md') });
  return { 'Service-Desk': sd, 'Personal-Org-Operating-Model': poom };
}

// Words that only move about the accepted page (its links back and across, its headings naming the page).
const NAV = /^(← All projects|← Service-Desk|← Personal-Org-Operating-Model|Time asked of you|Agents| · |Time asked of you — .*|Agents — .*|Service-Desk|Personal-Org-Operating-Model)$/;

/** The sandbox's own navigation words, and nothing else: its marker, Home, Back and the bottom bar's four tabs. */
const SB_NAV = /^(Sandbox: candidate design|Home|Back|Status|Timeline|Team|Queue)$/;

/** Each element's own text (its text-node children, joined) and each leaf's text, in the accepted view. */
function facts(view) {
  const out = new Set();
  const walk = (n) => {
    for (const c of n.children || []) {
      if (c.tag) {
        const own = c.children.filter((x) => !x.tag).map((x) => x.textContent).join('').replace(/\s+/g, ' ').trim();
        if (own) out.add(own);
        walk(c);
      }
    }
  };
  walk(view);
  return [...out].filter((t) => !NAV.test(t) && /[A-Za-z0-9]/.test(t));
}

const WHEN = Date.parse('2026-10-07T12:00:00Z');

for (const [kind, acceptedHash, sandboxHash] of [
  ['Pipeline', '', 'pipeline'], ['Time asked', 'asked', 'asked'], ['Agents', 'agents', 'agents'],
]) {
  for (const name of ['Service-Desk', 'Personal-Org-Operating-Model']) {
    if (kind === 'Agents' && name !== 'Service-Desk') continue;
    test(`AC55: the rebuilt ${kind} view for ${name} shows the same values and words as the accepted view`, async () => {
      const route = `#/p/${name}${acceptedHash ? `/${acceptedHash}` : ''}`;
      const acc = await loadApp({ hash: route, repos: detailRepos(), now: WHEN });
      let accepted;
      let acceptedText;
      try {
        await acc.advance(1000);
        await acc.advance(POLL_MS);
        accepted = facts(acc.els.view);
        acceptedText = acc.els.view.textContent.replace(/\s+/g, ' ');
      } finally {
        acc.restore();
      }
      assert.ok(accepted.length >= 3, `${accepted.length} facts`);
      if (process.env.SHOW_FACTS) console.log(kind, name, accepted.length, accepted.slice(0, 40));
      const sb = await loadSandbox({ config: CONFIG, repos: detailRepos(), hash: `#/p/${name}/${sandboxHash}`, now: WHEN });
      try {
        await sb.advance(1000);
        await sb.advance(POLL_MS);
        // A fold's words are in the text whether it is open or not, as in the accepted view's details.
        const text = sb.view.textContent.replace(/\s+/g, ' ');
        for (const f of accepted) assert.ok(text.includes(f), `${kind} for ${name}: "${f}" is missing`);
        assert.doesNotMatch(text, /Can't show/);
        // And the other way (build review N1): every value and word of the sandbox's view is in the
        // accepted view, the sandbox's navigation words aside (its marker, Home and Back, the bottom bar's tabs).
        const extra = facts(sb.view).filter((f) => !SB_NAV.test(f) && !acceptedText.includes(f));
        assert.deepEqual(extra, [], `${kind} for ${name}: the sandbox shows words the accepted view does not`);
      } finally {
        sb.restore();
      }
    });
  }
}

test('AC55: no element of the sandbox links to an accepted M1 or M2 view, on any route', async () => {
  const app = await loadSandbox({ config: CONFIG, repos: detailRepos(), hash: '#/', now: WHEN });
  try {
    await app.advance(1000);
    for (const b of byClass(app.view, 'sb-hg-btn')) if (b.attrs['aria-expanded'] === 'false') { b.click(); await app.flush(); }
    const seen = new Set();
    const queue = ['#/'];
    while (queue.length && seen.size < 400) {
      const hsh = queue.shift();
      if (seen.has(hsh)) continue;
      seen.add(hsh);
      await app.go(hsh);
      for (const l of linksIn(app.view)) {
        const href = l.href || '';
        if (!href) continue; // an anchor with no href (a strip phase with no run) links nowhere
        assert.ok(href.startsWith('#/') || href.startsWith('https://github.com/'), `${hsh}: ${href}`);
        if (href.startsWith('#/')) {
          assert.doesNotMatch(href, /^#\/p\/[^/]+\/(card|q|hold|merge)\//, `${hsh}: ${href} is an accepted view`);
          if (!seen.has(href)) queue.push(href);
        }
      }
    }
    assert.ok(seen.has('#/p/Service-Desk/pipeline') && seen.has('#/p/Service-Desk/asked') && seen.has('#/p/Service-Desk/agents'));
    assert.ok(seen.size > 20, `${seen.size} routes`);
  } finally {
    app.restore();
  }
  void findAll;
  void findAllApp;
  void fullRepo;
});
