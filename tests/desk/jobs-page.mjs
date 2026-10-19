// AC79's page judgment driven with the same reads the sender makes (tests only): the real function code
// (src/lib/github.js: the poll call's `jobs` part and the blob call's `commitTime` and `jobLog`) against a
// fake GitHub world (tests/desk/notify-helpers.mjs `makeWorld`), feeding the page's own cycle
// (src/lib/jobwatch.js `partDue`, `applyPollAnswer` and `runPhase`, as src/lib/scheduler.js calls them),
// poll by poll. No network.

import { readJobsPart, readBlobs } from '../../src/lib/github.js';
import { jobsPart } from '../../src/lib/api.js';
import { newJobsState, partDue, pollPart, applyPollAnswer, runPhase } from '../../src/lib/jobwatch.js';
import { classifyPull } from '../../src/lib/records.js';

/**
 * One page opening's state over the world. ctx: { project, world, tree: Map(path → { sha }), ledgerText,
 * pulls: [parsePulls' pull], files: Map(number → { headSha, changes, capped }), ledgerFail? }. Returns
 * { js, poll(nowMs), calls }: poll runs one cycle's AC79 part and resolves to the verdicts.
 */
export function pageJobs(ctx) {
  const js = newJobsState();
  const deps = { token: 'read-token', fetch: (u, i) => ctx.world.fetch(u, i), now: () => 0 };
  const calls = { blob: 0, jobLog: [], commitTime: [], ledger: 0, pollParts: [] };
  async function poll(nowMs) {
    const tree = ctx.tree;
    if (partDue(js, ctx.project, tree)) {
      const part = pollPart(js);
      calls.pollParts.push(part);
      const r = await readJobsPart(ctx.project, jobsPart(JSON.parse(JSON.stringify(part)), ctx.project), deps);
      applyPollAnswer(js, new Set(part.heads.map((x) => x.sha)), r.jobs);
    }
    const flaggedPulls = (ctx.pulls || []).filter((pr) => classifyPull(pr, ctx.project).flagged);
    return runPhase(js, { project: ctx.project, tree, flaggedPulls, files: ctx.files, nowMs,
      blobCall: async (body) => {
        calls.blob++;
        calls.jobLog.push(...(body.jobLog || []));
        calls.commitTime.push(...(body.commitTime || []));
        let answer = { state: 'ok', blobs: {} };
        if (body.commitTime || body.jobLog) {
          answer = await readBlobs({ project: ctx.project, blobs: [], history: [], compare: [], commitTime: body.commitTime || [], commitTimeNull: [],
            jobLog: body.jobLog || [], jobLogNull: [], spare: 0 }, deps);
        }
        if (body.blobs.length) {
          calls.ledger++;
          answer.blobs = { [body.blobs[0]]: ctx.ledgerFail ? null : ctx.ledgerText };
        }
        return ctx.failCall && ctx.failCall(calls.blob) ? null : answer;
      } });
  }
  return { js, poll, calls };
}

/** The page's verdicts after enough polls for every read to settle (a fresh opening, the same records). */
export async function settledVerdicts(ctx, nowMs, polls = 4) {
  const p = pageJobs(ctx);
  let v = null;
  for (let i = 0; i < polls; i++) v = await p.poll(nowMs);
  return { verdicts: v, page: p };
}
