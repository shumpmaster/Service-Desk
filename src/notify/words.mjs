// What each notification says (spec S-001, AC74, AC76, AC78, J17, J18): plain words, no codes
// before the words, no record text beyond the title, and no secret.

import { KINDS, HOLD_WHAT, ACTIONS_USAGE_OPEN } from '../lib/waiting.js';
import { dollars } from '../lib/usage.js';
import { cut, BODY_CUT } from './webpush.mjs';

export const DESK_TITLE = 'Service Desk';

/** A record's title as data: control characters and line breaks made spaces, runs of space made one. */
export function clean(text) {
  return String(text == null ? '' : text).replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** The tap's address for a key: `<deskUrl>/?open=<key>`, the key URL-encoded (AC74). */
export function openUrl(deskUrl, key) {
  return `${deskUrl}/?open=${encodeURIComponent(key)}`;
}

export function homeUrl(deskUrl) {
  return `${deskUrl}/`;
}

/** One item's notification (AC74): title the project's name; body "Waits on you: <kind words>: <what>". */
export function itemWords(item, projectName, cutTo = BODY_CUT) {
  let body;
  if (item.kind === 'hold') body = `Waits on you: ${KINDS.hold}: ${HOLD_WHAT}`;
  else if (item.kind === 'pr' && item.outside) body = 'Waits on you: a pull request from someone outside the project';
  else body = `Waits on you: ${KINDS[item.kind]}: ${cut(clean(item.what) || 'untitled', cutTo)}`;
  return { title: projectName, body };
}

/** The grouped notification (AC74): three or more newly waiting in one run. */
export function groupWords(n, projectName) {
  return { title: DESK_TITLE, body: `${n} things now wait on you in ${projectName}` };
}

/** J18's bootstrap summary, with AC78's figure when the estimate is above $0.00. */
export function summaryWords(n, projectName, usageLine) {
  const what = n === 0 ? 'nothing waits on you now' : n === 1 ? '1 thing waits on you now' : `${n} things wait on you now`;
  return { title: projectName, body: `Notifications are on: ${what}${usageLine ? `. ${usageLine}` : ''}` };
}

export function backOnWords(projectName) {
  return { title: projectName, body: 'Notifications are back on' };
}

export function testWords() {
  return { title: DESK_TITLE, body: 'Test from your desk: notifications work' };
}

/** `test: fail`'s push: readable, should the push service ever accept it (J17: never a push the phone cannot read). */
export function failTestWords() {
  return { title: DESK_TITLE, body: 'Test from your desk: this test should have been refused' };
}

/** AC78's cost notification. */
export function costWords(step, estimateCents) {
  return { title: DESK_TITLE,
    body: `GitHub Actions: this month's estimated cost has passed $${(50 * step).toLocaleString('en-US')} (about ${dollars(estimateCents)}, an estimate)` };
}

/** The bootstrap summary's usage line (AC78). */
export function usageSummaryLine(estimateCents) {
  return `GitHub Actions: about ${dollars(estimateCents)} so far this month (an estimate)`;
}

export { ACTIONS_USAGE_OPEN };
