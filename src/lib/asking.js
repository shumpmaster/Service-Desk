// A question being asked in a session, or answered there with its answer on its way (spec S-001,
// AC77, J2's `Asked in session:` line, J13's end lines, J20's "being recorded"). Pure: no network,
// no DOM, no Node built-ins. The sender (J16) uses it to leave such a question out of what waits;
// the desk's page uses the same rule to show it (AC77, the brief's step 3).

import { utcParts } from './cos.js';

export const ASKED_LINE_RE = /^Asked in session: ([A-Za-z0-9_-]{1,100})$/;
/** The fallback end of a hold: 8 hours after the question's raised time (AC77, J13's own limit). */
export const HOLD_FALLBACK_MS = 8 * 3600e3;

function lines(text) {
  return String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
}

/**
 * The session id of a question's `Asked in session:` line, read only in its model's place (J2,
 * AC77): in a v3 question the line directly after its first column-0 `Milestone:` line; in a v2.5
 * question the first line after its `# Ruling needed:` line that is not blank. A line in another
 * form or place is ignored (null).
 */
export function askedInSession(text, model) {
  const ls = lines(text);
  let at = -1;
  if (model === 'v3') {
    const i = ls.findIndex((l) => l.startsWith('Milestone:'));
    if (i >= 0) at = i + 1;
  } else {
    const i = ls.findIndex((l) => l.startsWith('# Ruling needed:'));
    if (i >= 0) {
      for (let j = i + 1; j < ls.length; j++) {
        if (ls[j].trim() !== '') {
          at = j;
          break;
        }
      }
    }
  }
  if (at < 0 || at >= ls.length) return null;
  const m = ASKED_LINE_RE.exec(ls[at]);
  return m ? m[1] : null;
}

/**
 * Whether a session file (J13's parsed form, `parseSessionFile`) holds an end line in form whose
 * `time` is after `raisedMs`, compared as instants to the microsecond (AC77). An end line at or
 * before the raised time ends nothing, and nor does a start line.
 */
export function endedAfter(sessionFile, raisedMs) {
  if (!sessionFile || !Array.isArray(sessionFile.lines) || !Number.isFinite(raisedMs)) return false;
  for (const l of sessionFile.lines) {
    if (l.event !== 'end') continue;
    const p = utcParts(l.time);
    if (!p) continue;
    if (p.ms > raisedMs || (p.ms === raisedMs && p.us > 0)) return true;
  }
  return false;
}

/**
 * The state of an open question under AC77: 'recording' (an open pull request records its answer,
 * J20), 'held' (being asked in a session) or 'open' (an ordinary waiting question).
 * input: { model: 'v3'|'v2.5', text, raisedMs (the oldest commit of the question file, or null),
 *   seenMs (this device first saw it; the page only, while the raised time is unread), sessionFile
 *   (J13's parsed `sessions/chief-of-staff/<id>.jsonl`, or null), nowMs, recording: boolean,
 *   recordedBefore: boolean (an answer's pull request was seen open for it before: the hold ended
 *   then, so a pull request closed unmerged leaves the question open, AC77) }.
 * Returns { state, session } (the session id, or null).
 */
export function questionHold(input) {
  if (input.recording) return { state: 'recording', session: null };
  const session = askedInSession(input.text, input.model);
  if (!session || input.recordedBefore) return { state: 'open', session };
  const base = Number.isFinite(input.raisedMs) ? input.raisedMs : (Number.isFinite(input.seenMs) ? input.seenMs : null);
  if (base != null && input.nowMs - base >= HOLD_FALLBACK_MS) return { state: 'open', session };
  // Only a v3 project's Chief of Staff sessions are recorded; while the raised time is unread, no
  // end line ends the hold (the safe side; the 8-hour fallback still runs).
  if (input.model === 'v3' && Number.isFinite(input.raisedMs) && endedAfter(input.sessionFile, input.raisedMs)) {
    return { state: 'open', session };
  }
  return { state: 'held', session };
}
