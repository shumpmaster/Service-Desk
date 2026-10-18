// One run of a project's sender (spec S-001, AC73 to AC78, J16 to J18, J21; Workflows 3 and 4).
// Everything outside the program is injected (fetch, the clock, sleep, the checkout, the log), so
// the tests drive it with fakes. Its log holds counts, reasons and keyed hashes only.
//
// Exit codes (Workflow 3): 0 when the run did its work, failed sends and a budget stop included;
// 1 when its first step stops it (a secret missing or malformed, the keys not matching); 2 for an
// internal error (run.mjs).

import { makeGitHub, BudgetStop } from './gh.mjs';
import { firstStep } from './secrets.mjs';
import { lookupState, emptyState, keyHash, topicOf, sealPart, openPart, writeState, FORM } from './state.mjs';
import { collect, waitForDeploy } from './collect.mjs';
import { mintJwt, pushOnce, payload, cut, throwawayVapidKey, JWT_REFRESH_MS, BODY_CUT_413, MAX_PAYLOAD } from './webpush.mjs';
import { syncIssue } from './issue.mjs';
import { usageStep, usageReason, usageConfig } from './costs.mjs';
import { readUsage } from '../lib/usage.js';
import { costKey, ACTIONS_USAGE_OPEN } from '../lib/waiting.js';
import { itemWords, groupWords, summaryWords, backOnWords, testWords, failTestWords, costWords, openUrl, homeUrl } from './words.mjs';

export const RETRY_WAITS_MS = [5e3, 30e3];
export const GIVE_UP_MS = 6 * 3600e3;
export const UNREAD_ISSUE_MS = 30 * 60e3;
export const GROUP_AT = 3;
const DEPLOY_WORKFLOW = '.github/workflows/desk-deploy.yml';
const sameRepo = (a, b) => typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();

/**
 * Run the sender once. o: { project (J7 entry), config (J7), env, fetch, now() → ms, sleep(ms),
 * openCheckout() → checkout, log(line), outDir, apiBase }. Returns the exit code.
 */
export async function runSender(o) {
  const { project, config, env, log } = o;
  const repo = project.repo;
  const say = (line) => log(`desk-notify ${project.name}: ${line}`);
  if (!sameRepo(env.GITHUB_REPOSITORY, repo)) {
    say("stop: GITHUB_REPOSITORY is not this project's repository (src/config/projects.json)");
    return 1;
  }
  const gh = makeGitHub({ token: env.GITHUB_TOKEN || '', fetch: o.fetch, apiBase: o.apiBase || env.GITHUB_API_URL });
  try {
    // The origin gate's second signal (Workflow 3): before any secret's value is read, the
    // triggering run is read through REST and must be this repository's own.
    let trigger = null;
    if (env.GITHUB_EVENT_NAME === 'workflow_run') {
      const id = String(env.DESK_NOTIFY_RUN_ID || '');
      if (!/^[0-9]{1,20}$/.test(id)) {
        say('origin: no triggering run id (DESK_NOTIFY_RUN_ID); nothing done');
        return 0;
      }
      const r = await gh.get(`/repos/${repo}/actions/runs/${id}`);
      if (r.status !== 200 || !r.json) {
        say(`origin: the triggering run could not be read (${r.status}); nothing done`);
        return 0;
      }
      if (!sameRepo(r.json.head_repository && r.json.head_repository.full_name, repo) || !sameRepo(r.json.repository && r.json.repository.full_name, repo)) {
        say('origin: the triggering run is not from this repository; nothing done');
        return 0;
      }
      trigger = { id, path: typeof r.json.path === 'string' ? r.json.path.split('@')[0] : null, status: r.json.status };
    }

    // The first step: the secrets and J7, then the keys' check.
    const fs = firstStep(env, config);
    if (!fs.ok) {
      if (fs.problem === 'keys') {
        say("stop: the notification keys don't match (DESK_VAPID_PRIVATE_KEY and push.vapidPublicKey)");
        await syncIssue({ gh, repo, owner: config.ownerLogin, reasons: [{ code: 'keys' }], goodPush: false, log: say });
      } else if (fs.problem === 'config') {
        say(`stop: ${fs.name} is missing or not in form`);
      } else {
        say(`stop: the secret ${fs.name} is ${fs.problem === 'missing' ? 'missing' : 'not in its form'}`);
      }
      return 1;
    }
    const S = fs.secrets;
    const test = String(env.DESK_NOTIFY_TEST || '').trim();
    if (test === 'fail') return await failTest({ o, gh, S, say });
    if (test === 'usage') return await usageTest({ o, S, say });
    if (test && test !== 'true') {
      say('stop: the input test is not "", "true", "fail" or "usage"');
      return 1;
    }

    // The last state (J18).
    const st = await lookupState({ gh, repo, defaultBranch: project.defaultBranch, stateKey: S.stateKey });
    const nowMs = o.now();
    if (st.kind === 'unreadable') {
      say(`state: unreadable (${st.why}); nothing sent and nothing saved`);
      const reasons = [];
      if (st.why === 'forged') reasons.push({ code: 'forged' });
      // A failed read, 30 minutes in a row; a failed list that cannot be dated (draft 6) at once.
      else if (st.atOnce || (st.unreadableSince && nowMs - Date.parse(st.unreadableSince) >= UNREAD_ISSUE_MS)) reasons.push({ code: 'state-unread' });
      if (reasons.length) await syncIssue({ gh, repo, owner: config.ownerLogin, reasons, goodPush: false, log: say });
      return 0;
    }
    const bootstrap = st.kind === 'none';
    say(bootstrap ? 'state: none (a first run, or none for 7 days)' : 'state: read');
    const prev = bootstrap ? emptyState(new Date(nowMs).toISOString()) : st.state;

    // A deploy requested: wait for it to turn `waiting` (J16's awkward cases).
    if (trigger && trigger.path === DEPLOY_WORKFLOW && project.deploysNeedOwner === true && !['waiting', 'completed'].includes(trigger.status)) {
      await waitForDeploy({ gh, repo, runId: trigger.id, sleep: o.sleep, now: o.now });
    }

    // The set (J16).
    let c;
    let checkout = null;
    try {
      checkout = o.openCheckout();
    } catch {
      checkout = null;
    }
    if (!checkout) c = { read: false, why: 'checkout' };
    else c = await collect({ project, config, checkout, gh, nowMs: o.now(), stateKey: S.stateKey, cand: prev.cand, recorded: prev.recorded || {} });
    if (c.read) {
      say(`read: ${c.counts.waiting} waiting; left out: ${c.counts.held} held in a session, ${c.counts.recording} being recorded, ${c.counts.jobCandidates} the automatic job may still merge`);
    } else {
      say(`not read (${c.why}); the last set is kept`);
      if (bootstrap) {
        say('state: nothing saved, so the next run starts again');
        return 0;
      }
    }

    const t0 = o.now();
    const nowIso = new Date(t0).toISOString();
    const deskUrl = S.push.deskUrl;
    const sub = S.subscription;
    const subHash = keyHash(S.stateKey, `subscription|${sub.endpoint}|${sub.p256dh.toString('base64url')}|${sub.auth.toString('base64url')}`);
    const next = { form: FORM, at: nowIso, sub: subHash, gone: prev.gone, refused: prev.refused, jwt: prev.jwt,
      project: c.read ? { read: true, unreadSince: null } : { read: false, unreadSince: prev.project.unreadSince || nowIso },
      keys: {}, cand: c.read ? c.cand : prev.cand, recorded: c.read ? c.recorded : (prev.recorded || {}), usage: prev.usage };

    // Pushes.
    let jwtRec = prev.jwt ? openPart(S.stateKey, 'jwt', prev.jwt) : null;
    const jwtFresh = () => jwtRec && jwtRec.aud === sub.origin && typeof jwtRec.mintedAt === 'string'
      && o.now() - Date.parse(jwtRec.mintedAt) < JWT_REFRESH_MS && typeof jwtRec.jwt === 'string';
    const mint = () => {
      jwtRec = mintJwt({ privateKey: S.vapid.privateKey, aud: sub.origin, sub: S.subject, nowMs: o.now() });
    };
    const publicB64 = S.vapid.publicRaw.toString('base64url');
    let goodPush = false;
    let stopped = false; // a refusal, a gone subscription or a "try later" stops this run's sends
    const answers = [];
    const deliver = async (words, navigate, key, { quiet = false } = {}) => {
      if (!jwtFresh()) mint();
      const topic = topicOf(S.stateKey, key);
      let body = words.body;
      let text = payload({ title: words.title, body, navigate, tag: topic });
      while (Buffer.byteLength(text) > MAX_PAYLOAD && body.length > 1) {
        body = cut(body, Math.floor(Array.from(body).length / 2));
        text = payload({ title: words.title, body, navigate, tag: topic });
      }
      let reminted = false;
      let recut = false;
      let attempt = 0;
      for (;;) {
        const r = await pushOnce({ fetch: o.fetch, sub, jwt: jwtRec.jwt, publicB64, topic, body: text });
        // AC78's quiet push is never retried in the run (its next read tries again), so it adds no wait.
        if (r.kind === 'later' && !quiet && attempt < RETRY_WAITS_MS.length) {
          await o.sleep(RETRY_WAITS_MS[attempt]);
          attempt++;
          continue;
        }
        if (r.kind === 'refused' && r.status === 403 && r.reason === 'BadJwtToken' && !reminted && !quiet
            && o.now() - Date.parse(jwtRec.mintedAt) >= JWT_REFRESH_MS) {
          reminted = true;
          mint();
          continue;
        }
        if (r.kind === 'too-large' && !recut) {
          recut = true;
          text = payload({ title: words.title, body: cut(body, BODY_CUT_413), navigate, tag: topic });
          continue;
        }
        if (!quiet) answers.push(r.status);
        return r;
      }
    };
    // What an answer does to the run (AC76); a quiet push (AC78's) changes nothing but its own part.
    const settle = (r) => {
      if (r.kind === 'sent') {
        goodPush = true;
        next.refused = null;
      } else if (r.kind === 'gone') {
        next.gone = subHash;
        stopped = true;
      } else if (r.kind === 'refused') {
        next.refused = { status: r.status, reason: r.reason, since: (prev.refused && prev.refused.since) || nowIso };
        stopped = true;
      } else if (r.kind === 'later') stopped = true;
    };

    if (next.gone && next.gone === subHash) say('subscription: gone; nothing is sent until DESK_PUSH_SUBSCRIPTION changes');
    if (next.gone && next.gone !== subHash) {
      // DESK_PUSH_SUBSCRIPTION changed: resume, and say so first.
      const r = await deliver(backOnWords(project.name), homeUrl(deskUrl), `${project.name}|back-on|${subHash}`);
      settle(r);
      if (r.kind === 'sent') {
        next.gone = null;
        say('subscription: changed; notifications are back on');
      }
    }
    // One Topic and tag for every test, so a second test replaces the first (EXP-006 case 6).
    if (test === 'true' && !next.gone && !stopped) settle(await deliver(testWords(), homeUrl(deskUrl), `${project.name}|test`));

    // Usage (AC78): read about hourly, before the bootstrap summary that may name it.
    let usagePart = prev.usage ? openPart(S.stateKey, 'usage', prev.usage) : null;
    const us = await usageStep({ config, token: S.billingToken, fetch: o.fetch, nowMs: o.now(), part: usagePart,
      bootstrap, apiBase: o.billingApiBase });
    usagePart = us.part;

    // The items (AC74, J18).
    let newCount = 0;
    let sentItems = 0;
    let gaveUpNow = 0;
    const toSend = [];
    if (!c.read) next.keys = { ...prev.keys };
    else {
      for (const item of c.set) {
        const h = keyHash(S.stateKey, item.key);
        const e = prev.keys[h];
        if (!bootstrap && e && (e.sent || e.gaveUp)) next.keys[h] = e;
        else if (!bootstrap && e && e.unsent && ['later', 'other'].includes(e.fail) && t0 - Date.parse(e.unsent) >= GIVE_UP_MS) {
          next.keys[h] = { gaveUp: nowIso };
          gaveUpNow++;
        } else {
          if (!e) newCount++;
          toSend.push({ item, h, e });
        }
      }
    }
    const markUnsent = (list, fail) => {
      for (const x of list) next.keys[x.h] = { unsent: (x.e && x.e.unsent) || nowIso, fail };
    };
    const failOf = (r) => (r.kind === 'gone' ? 'gone' : r.kind === 'refused' ? 'refused' : r.kind === 'later' ? 'later' : 'other');
    if (c.read && toSend.length) {
      if (next.gone || stopped) markUnsent(toSend, next.gone ? 'gone' : (next.refused ? 'refused' : 'later'));
      else if (bootstrap) {
        const r = await deliver(summaryWords(c.set.length, project.name, us.summaryLine), homeUrl(deskUrl), `${project.name}|summary|${nowIso}`);
        settle(r);
        if (r.kind === 'sent') {
          for (const x of toSend) next.keys[x.h] = { sent: nowIso };
          sentItems = toSend.length;
        } else markUnsent(toSend, failOf(r));
      } else if (toSend.length >= GROUP_AT) {
        const groupKey = `${project.name}|group|${toSend.map((x) => x.h).sort().join(',')}`;
        const r = await deliver(groupWords(toSend.length, project.name), homeUrl(deskUrl), groupKey);
        settle(r);
        if (r.kind === 'sent') {
          for (const x of toSend) next.keys[x.h] = { sent: nowIso };
          sentItems = toSend.length;
        } else markUnsent(toSend, failOf(r));
      } else {
        for (let i = 0; i < toSend.length; i++) {
          const x = toSend[i];
          if (stopped) {
            markUnsent([x], next.gone ? 'gone' : (next.refused ? 'refused' : 'later'));
            continue;
          }
          const r = await deliver(itemWords(x.item, project.name), openUrl(deskUrl, x.item.key), x.item.key);
          settle(r);
          if (r.kind === 'sent') {
            next.keys[x.h] = { sent: nowIso };
            sentItems++;
          } else markUnsent([x], failOf(r));
        }
      }
    } else if (bootstrap && c.read && !next.gone && !stopped) {
      // Nothing waits: the summary still says notifications are on.
      settle(await deliver(summaryWords(0, project.name, us.summaryLine), homeUrl(deskUrl), `${project.name}|summary|${nowIso}`));
    }

    // AC78's cost notification: on its own, never grouped, never logged or counted.
    if (us.push && !next.gone && !stopped) {
      const r = await deliver(costWords(us.push.step, us.push.cents), openUrl(deskUrl, ACTIONS_USAGE_OPEN), costKey(us.push.ym, us.push.step), { quiet: true });
      if (r.kind === 'sent') usagePart = { ...usagePart, pending: null };
    }

    // The state (J18).
    next.jwt = jwtRec ? sealPart(S.stateKey, 'jwt', jwtRec) : null;
    next.usage = usagePart ? sealPart(S.stateKey, 'usage', usagePart) : null;
    writeState(o.outDir, S.stateKey, next);

    // The log: counts only, with the new keys' keyed hashes.
    const unsent = Object.values(next.keys).filter((e) => e.unsent).length;
    const gaveUp = Object.values(next.keys).filter((e) => e.gaveUp).length;
    say(`new: ${newCount}; sent: ${sentItems}; unsent: ${unsent}; given up: ${gaveUp}${gaveUpNow ? ` (${gaveUpNow} this run)` : ''}`);
    if (newCount) say(`new keys: ${toSend.filter((x) => !x.e).map((x) => x.h.slice(0, 12)).join(' ')}`);
    if (answers.length) say(`push answers: ${answers.join(' ')}`);
    if (next.refused) say(`push refused: ${next.refused.status}${next.refused.reason ? ` ${next.refused.reason}` : ''}`);

    // AC76's issue.
    const reasons = [];
    if (next.gone && next.gone === subHash) reasons.push({ code: 'gone' });
    if (next.refused) reasons.push({ code: 'refused', status: next.refused.status, word: next.refused.reason });
    if (!next.project.read && t0 - Date.parse(next.project.unreadSince) >= UNREAD_ISSUE_MS) reasons.push({ code: 'unread', project: project.name });
    if (gaveUp) reasons.push({ code: 'gave-up', project: project.name, count: gaveUp });
    const ur = usageReason(usagePart, t0);
    if (ur) reasons.push(ur);
    await syncIssue({ gh, repo, owner: config.ownerLogin, reasons, goodPush, log: say });
    return 0;
  } catch (e) {
    if (e instanceof BudgetStop) {
      say('budget: the workflow token has fewer than 300 requests left this hour; nothing sent and nothing saved');
      return 0;
    }
    throw e;
  }
}

/** `test: fail` (J17): exactly one push request, signed by a key made in this run, no retry, no new JWT. */
async function failTest({ o, gh, S, say }) {
  const key = throwawayVapidKey();
  const jwt = mintJwt({ privateKey: key.privateKey, aud: S.subscription.origin, sub: S.subject, nowMs: o.now() });
  const topic = topicOf(S.stateKey, `${o.project.name}|test-fail`);
  const w = failTestWords();
  const r = await pushOnce({ fetch: o.fetch, sub: S.subscription, jwt: jwt.jwt, publicB64: key.publicRaw.toString('base64url'), topic,
    body: payload({ title: w.title, body: w.body, navigate: homeUrl(S.push.deskUrl), tag: topic }) });
  say(`test fail: the push service answered ${r.status}${r.reason ? ` ${r.reason}` : ''}`);
  await syncIssue({ gh, repo: o.project.repo, owner: o.config.ownerLogin, reasons: [{ code: 'test', status: r.status, word: r.reason }], goodPush: false, log: say });
  return 0;
}

/** `test: usage` (Workflow 3, EXP-006 case 11): one J21 read; statuses and whether fields came, never a figure or a name. */
async function usageTest({ o, S, say }) {
  const cfg = usageConfig(o.config);
  if (!cfg) {
    say('test usage: actionsUsage is not set up in src/config/projects.json');
    return 0;
  }
  if (!S.billingToken) {
    say('test usage: DESK_BILLING_TOKEN is not set (Setup N12)');
    return 0;
  }
  const read = await readUsage({ account: cfg.account, token: S.billingToken, fetch: o.fetch, nowMs: o.now(), reported: true, apiBase: o.billingApiBase });
  say(`test usage: summary ${read.statuses.summary}, usage ${read.statuses.usage}, repositories ${read.statuses.repos.join(' ') || 'not read'}; state ${read.state}`);
  const fields = ['product', 'sku', 'unitType', 'quantity', 'netQuantity', 'pricePerUnit', 'netAmount', 'repositoryName'];
  for (const [name, part] of [['summary', read.summary], ['usage', read.usage]]) {
    const actions = part.items.filter((it) => String(it.product).toLowerCase() === 'actions');
    const present = fields.filter((f) => actions.some((it) => it[f] !== undefined));
    say(`test usage: ${name}: ${part.ok ? 'in form' : 'not in form'}; Actions items: ${actions.length ? 'yes' : 'no'}; fields present: ${present.join(' ') || 'none'}`);
  }
  const names = read.usage.items.map((it) => it.repositoryName).filter((x) => typeof x === 'string');
  const owned = names.some((n) => n.includes('/') && n.slice(0, n.indexOf('/')).toLowerCase() === cfg.account.toLowerCase());
  say(`test usage: repositoryName ${names.length ? (owned ? "carries the owner's name before a /" : "does not carry the owner's name before a /") : 'not given'}`);
  return 0;
}
