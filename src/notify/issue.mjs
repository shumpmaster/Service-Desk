// AC76's issue (spec S-001): one issue in the sender's own repository, "Desk notifications have
// stopped", labelled `desk-notify`, assigned to the owner, saying why in plain words, and closed once
// every reason is gone. It names projects and counts only: never an item's title, path or number.

export const ISSUE_TITLE = 'Desk notifications have stopped';
export const ISSUE_LABEL = 'desk-notify';
export const TEST_MARK = '(test)';

const STEPS_SUBSCRIPTION = [
  'On the iPhone (Setup N5): open the desk from its Home Screen icon, signing in if asked; in More detail, tap "Turn on notifications", then Allow; tap "Copy".',
  'The subscription secret (Setup N6): in each project, Settings, Environments, `notify`, update the secret `DESK_PUSH_SUBSCRIPTION` with the value you copied; then "I\'ve added it to GitHub" on the desk.',
  'A test (Setup N8): Actions, desk-notify, Run workflow, `test` = `true`; when the run has finished, the iPhone shows "Test from your desk: notifications work". If no run appears within a minute, run it again.',
];

/**
 * A reason's words. reason: { code, project?, count?, status?, word?, why? }.
 * Codes: keys, gone, refused, unread, forged, state-unread (a failed read, 30 minutes or more), state-undated
 * (a failed read GitHub gave no time for, at once: AC76, draft 7), gave-up, usage, test.
 */
export function reasonText(r) {
  switch (r.code) {
    case 'keys': return "The notification keys don't match: the public half of the secret `DESK_VAPID_PRIVATE_KEY` is not the desk's public key (`push.vapidPublicKey` in src/config/projects.json), so the sender stops at its first step.";
    case 'gone': return 'Your phone\'s subscription has expired or is no longer valid (the push service answered that it is gone). The sender sends nothing more until the secret `DESK_PUSH_SUBSCRIPTION` changes.';
    case 'refused': {
      const what = r.word ? ` (${r.status}, ${r.word})` : ` (${r.status})`;
      const jwt = r.word === 'BadJwtToken' ? ' The sender makes a new signature at most once an hour, as Apple asks, and tries again each run.'
        : ' The sender makes no new signature for this, and tries again each run.';
      return `The push service refused the sender's requests${what}: there is an error with the notification keys or the contact address.${jwt}`;
    }
    case 'unread': return `Desk notifications can't read ${r.project}: its records could not be read for 30 minutes or more. Nothing is lost: what started waiting meanwhile is sent once it reads again.`;
    case 'forged': return "The sender's memory could not be trusted: its saved state's signature does not match, so the sender sends nothing until a good state is read.";
    case 'state-unread': return "The sender's memory could not be read for 30 minutes or more, so it sends nothing until it can.";
    case 'state-undated': return "The sender's memory could not be read, and GitHub didn't say for how long, so it sends nothing until it can. If this was a passing GitHub failure, this closes by itself.";
    case 'gave-up': return `${r.project}: ${r.count} ${r.count === 1 ? 'notification was' : 'notifications were'} given up after 6 hours of the push service saying "try later". The desk shows everything when you open it.`;
    case 'usage': return `GitHub Actions use can't be read: ${r.why}.`;
    case 'test': return `${TEST_MARK} The test from GitHub (\`test: fail\`) ${r.status >= 200 && r.status < 300 ? 'was accepted by the push service although it was signed with a key that is not yours' : `was refused by the push service, as a test should be (${r.status}${r.word ? `, ${r.word}` : ''})`}. This closes on the next notification that is sent.`;
    default: return 'The sender found a problem.';
  }
}

/** The issue's body for a list of reasons, in a fixed order so a body that has not changed is not rewritten. */
export function issueBody(reasons, keptTestLine = null) {
  const order = ['keys', 'gone', 'refused', 'forged', 'state-unread', 'state-undated', 'unread', 'gave-up', 'usage', 'test'];
  const sorted = [...reasons].sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code)
    || String(a.project || '').localeCompare(String(b.project || '')));
  const lines = sorted.map((r) => `- ${reasonText(r)}`);
  if (keptTestLine && !sorted.some((r) => r.code === 'test')) lines.push(keptTestLine);
  const needSteps = sorted.some((r) => ['gone', 'refused', 'keys'].includes(r.code));
  const out = ['The desk\'s notification sender found a problem. Nothing that waits on you is lost: the desk shows everything when you open it.',
    '', 'Why, in plain words:', '', ...lines, ''];
  if (needSteps) {
    out.push('What to do:', '');
    if (sorted.some((r) => r.code === 'keys')) out.push('- Check that `DESK_VAPID_PRIVATE_KEY` in the `notify` Environment holds the whole text of the key whose public half you gave your Chief of Staff (Setup N1, N4).');
    STEPS_SUBSCRIPTION.forEach((s, i) => out.push(`${i + 1}. ${s}`));
    out.push('');
  }
  out.push('This issue names projects and counts only. The sender closes it once notifications work again.');
  return out.join('\n');
}

/** The "(test)" line of an open issue's body, if it holds one. */
export function testLineOf(body) {
  const l = String(body || '').split('\n').find((x) => x.startsWith(`- ${TEST_MARK}`));
  return l || null;
}

/**
 * Open, update or close the issue. input: { gh, repo, owner, reasons, goodPush, log }. A failure is
 * logged and leaves the issue as it is; it never stops the run.
 */
export async function syncIssue({ gh, repo, owner, reasons, goodPush, log }) {
  const r = await gh.get(`/repos/${repo}/issues?state=open&labels=${ISSUE_LABEL}&per_page=30`);
  if (r.status !== 200 || !Array.isArray(r.json)) {
    log('issue: the open issues could not be read; left as they are');
    return { ok: false };
  }
  const open = r.json.find((i) => i && !i.pull_request && i.title === ISSUE_TITLE && Number.isInteger(i.number));
  const kept = !goodPush && open ? testLineOf(open.body) : null;
  if (!reasons.length && !kept) {
    if (!open) return { ok: true, action: 'none' };
    const w = await gh.write('PATCH', `/repos/${repo}/issues/${open.number}`, { state: 'closed', state_reason: 'completed' });
    log(w.status === 200 ? 'issue: closed' : `issue: could not be closed (${w.status})`);
    return { ok: w.status === 200, action: 'closed' };
  }
  const body = issueBody(reasons, kept);
  if (open) {
    if (open.body === body) return { ok: true, action: 'unchanged' };
    const w = await gh.write('PATCH', `/repos/${repo}/issues/${open.number}`, { body });
    log(w.status === 200 ? 'issue: updated' : `issue: could not be updated (${w.status})`);
    return { ok: w.status === 200, action: 'updated' };
  }
  let w = await gh.write('POST', `/repos/${repo}/issues`, { title: ISSUE_TITLE, body, labels: [ISSUE_LABEL], assignees: [owner] });
  if (w.status === 422) w = await gh.write('POST', `/repos/${repo}/issues`, { title: ISSUE_TITLE, body, labels: [ISSUE_LABEL] });
  log(w.status === 201 ? 'issue: opened' : `issue: could not be opened (${w.status})`);
  return { ok: w.status === 201, action: 'opened' };
}
