// The accepted M1 and M2 views' facts for AC55's comparison (spec S-001, AC55: "the same facts as the accepted
// views"): the fixtures AC9–AC12 and AC20–AC23's tests used, together, and the reading of a screen's facts.
// At stage 8 (AC44, step 4) the accepted views are removed with the trial view becoming the desk; their
// facts for these fixtures were recorded at bd4097d, the last commit that drew them, by
// tests/desk/tools/accepted-views-snapshot.mjs, into tests/desk/fixtures/accepted-views-bd4097d.json, and
// AC55's test compares the desk's views with that record.
import { fixture } from './helpers.mjs';
import { repo, pr } from './fake-desk.mjs';

/** A card, a question, a ruling, the log, the usage record, a PR; and a v2.5 project. */
export function detailRepos() {
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

/** Words that only moved about the accepted page (its links back and across, its headings naming the page). */
export const NAV = /^(← All projects|← Service-Desk|← Personal-Org-Operating-Model|Time asked of you|Agents| · |Time asked of you — .*|Agents — .*|Service-Desk|Personal-Org-Operating-Model)$/;

/** Each element's own text (its text-node children, joined) and each leaf's text; the bar at every screen's foot left out (AC81). */
export function facts(view) {
  const out = new Set();
  const walk = (n) => {
    for (const c of n.children || []) {
      if (c.tag && ` ${c.className || ''} `.includes(' v2-bar ')) continue;
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

export const WHEN = Date.parse('2026-10-07T12:00:00Z');

/** The views compared: [kind, the accepted view's route under #/p/<name>, the desk's], and the projects each is for. */
export const CASES = [['Pipeline', '', 'pipeline', ['Personal-Org-Operating-Model']], ['Time asked', 'asked', 'asked', ['Service-Desk', 'Personal-Org-Operating-Model']],
  ['Agents', 'agents', 'agents', ['Service-Desk']]];
