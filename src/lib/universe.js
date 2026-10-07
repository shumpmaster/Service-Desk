// The Universe screen's state (spec S-001, Terms "Read successfully" and "Quiet"; AC4, AC5, AC8).
// Pure: from each project's reader state and model, what each box says, the box order, and the
// screen's headline. "Quiet" needs no flagged item anywhere AND every project read successfully
// within the last 3 minutes; until every project has been read since opening it says "Checking…".

import { STALE_MS, REASON_WORDS } from './scheduler.js';
import { hhmm } from './timefmt.js';

/**
 * A project's read state: { read: 'ok' | 'checking' | 'cant-read', since, reason, words }.
 * st: { lastSuccessAt, failure }; desk: { openedAt, visibleSince }.
 */
export function readState(st, desk, now) {
  if (st.failure) return { read: 'cant-read', since: st.failure.since, reason: st.failure.reason, words: st.failure.words };
  const fresh = st.lastSuccessAt != null && st.lastSuccessAt >= desk.openedAt && now - st.lastSuccessAt <= STALE_MS;
  if (fresh) return { read: 'ok', since: st.lastSuccessAt, reason: null, words: null };
  const base = st.lastSuccessAt != null && st.lastSuccessAt >= desk.openedAt ? st.lastSuccessAt : desk.openedAt;
  if (now - Math.max(base, desk.visibleSince) > STALE_MS) {
    return { read: 'cant-read', since: base, reason: 'stale', words: REASON_WORDS.stale };
  }
  return { read: 'checking', since: null, reason: null, words: null };
}

/** Rank for AC8: flagged 0, can't read 1, default branch failing 2, the rest 3. */
export function boxRank(box) {
  if (box.flaggedCount > 0) return 0;
  if (box.read.read === 'cant-read') return 1;
  if (box.ci === 'failing') return 2;
  return 3;
}

/** Order boxes worst first, then by name. */
export function orderBoxes(boxes) {
  return [...boxes].sort((a, b) => boxRank(a) - boxRank(b) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/** The words of a box's state line (AC5, AC8). */
export function boxStateText(box, timeZone) {
  const parts = [];
  if (box.flaggedCount > 0) parts.push(`${box.flaggedCount} waiting on you`);
  if (box.read.read === 'cant-read') {
    parts.push(`Can't read since ${hhmm(new Date(box.read.since), timeZone)}: ${box.read.words}`);
  } else if (box.read.read === 'checking') {
    parts.push('Checking…');
  } else if (box.flaggedCount === 0) {
    parts.push('quiet');
  }
  return parts.join(' · ');
}

/**
 * The screen's headline. boxes: [{ flaggedCount, read }]. Returns { text, quiet }.
 */
export function screenState(boxes, signedOut) {
  if (signedOut) return { text: 'Signed out — reload to sign in', quiet: false };
  const flagged = boxes.reduce((n, b) => n + b.flaggedCount, 0);
  const cantRead = boxes.filter((b) => b.read.read === 'cant-read').length;
  const checking = boxes.filter((b) => b.read.read === 'checking').length;
  const tail = [];
  if (cantRead) tail.push(`can't read ${cantRead} project${cantRead === 1 ? '' : 's'}`);
  if (checking) tail.push('Checking…');
  if (flagged) {
    return { text: [`${flagged} waiting on you`, ...tail].join(' · '), quiet: false };
  }
  if (cantRead) return { text: `Not quiet: ${tail.join(' · ')}`, quiet: false };
  if (checking) return { text: 'Checking…', quiet: false };
  return { text: 'Quiet', quiet: true };
}

/** Build a box from a project's model and reader state. */
export function makeBox(model, st, desk, now) {
  return {
    name: model.name,
    model,
    flaggedCount: model.flagged.length,
    read: readState(st, desk, now),
    ci: model.ci,
  };
}
