// J12's fixture for the tests (spec S-001, J12, "The fixture"): the answer built in GraphQL's
// answer shape from REST answers for Service-Desk (NOT as GitHub sent it; fixtures/README.md), the
// made-up answers with an error, and helpers that build an answer from nodes of the same shape.
import { fixture } from './helpers.mjs';

const read = (name) => JSON.parse(fixture(`github/${name}.json`));

/** The built answer's raw text (72 pull requests into main, one page). */
export const pullsAnswer = () => read('j12-pulls-built').body;
/** The built answer's nodes. */
export const pullNodes = () => JSON.parse(pullsAnswer()).data.repository.pullRequests.nodes;
/** A made-up answer with an error: 'data-null', 'rate-limited', 'rate-limited-403' or 'field-error'. */
export const madeUp = (name) => read(`j12-made-up-${name}`);

/** An answer of these nodes, in the query's shape. */
export function answerOf(nodes, { hasNext = false, cursor = 'Y3Vyc29yOk1BREUtVVA=' } = {}) {
  return JSON.stringify({ data: { repository: { pullRequests: { pageInfo: { hasNextPage: hasNext, endCursor: cursor }, nodes } } } });
}

/** The asks-merge job's trailer paragraph, as S-033 AC4 writes it (made up). */
export const JOB_TRAILERS = `Merged-By: orchestrator\nDelegation: L-0017\nMerged-Head: ${'c'.repeat(40)}`;

/**
 * A made-up node (NOT a real record), in the query's shape. Its merge commit's message is the
 * repository's merge message (its title with "(#<n>)", then its description, docs/SETUP.md step 5),
 * by `author` (the owner by default); `job: true` makes it the asks-merge job's (its trailers and
 * `github-actions[bot]`), and `message: null` an answer with no message (J12 has not read it).
 */
export function node(number, { title = `Made-up pull request ${number}`, body = '', mergedAt = '2026-10-12T12:00:00Z', createdAt = null, head = `made-up-${number}`,
  merge = null, checks = 'SUCCESS', state = null, job = false, author = null, message } = {}) {
  const msg = message !== undefined ? message : `${title} (#${number})\n\n${body}${job ? `\n\n${JOB_TRAILERS}` : ''}`;
  const mc = { oid: merge || String(number).padStart(40, 'a').slice(-40) };
  if (msg !== null) Object.assign(mc, { message: msg, author: { name: author || (job ? 'github-actions[bot]' : 'shumpmaster') } });
  return { number, title, body, state: state || (mergedAt ? 'MERGED' : 'OPEN'), createdAt: createdAt || mergedAt || '2026-10-12T10:00:00Z', mergedAt, closedAt: mergedAt,
    headRefName: head, mergeCommit: mergedAt ? mc : null,
    commits: { nodes: [{ commit: { statusCheckRollup: checks ? { state: checks } : null } }] } };
}

/** J12's answer for the asks-merge job's merges (#84 real-on-real, #951 to #959 made up), and the model's verdict on each message. */
export const asksMergeAnswer = () => read('j12-asks-merge').body;
export const asksMergeNodes = () => JSON.parse(asksMergeAnswer()).data.repository.pullRequests.nodes;
export const asksMergeModel = () => read('j12-asks-merge').model;
export const builtModel = () => read('j12-pulls-built').model;
