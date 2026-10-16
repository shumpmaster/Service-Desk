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

/** A made-up node (NOT a real record), in the query's shape. */
export function node(number, { title = `Made-up pull request ${number}`, body = '', mergedAt = '2026-10-12T12:00:00Z', createdAt = null, head = `made-up-${number}`,
  merge = null, checks = 'SUCCESS', state = null } = {}) {
  return { number, title, body, state: state || (mergedAt ? 'MERGED' : 'OPEN'), createdAt: createdAt || mergedAt || '2026-10-12T10:00:00Z', mergedAt, closedAt: mergedAt,
    headRefName: head, mergeCommit: mergedAt ? { oid: merge || String(number).padStart(40, 'a').slice(-40) } : null,
    commits: { nodes: [{ commit: { statusCheckRollup: checks ? { state: checks } : null } }] } };
}
