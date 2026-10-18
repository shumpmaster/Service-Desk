// The build's check of src/config/projects.json (spec S-001, J7; AC26's limit of 5).
// Returns a list of errors; an empty list passes.

import { decodeVapidKey } from './notifyview.js';

export const MAX_PROJECTS = 5;
const MODELS = new Set(['v3', 'v2.5']);
const DAYS = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
const HHMM = /^([01][0-9]|2[0-4]):[0-5][0-9]$/;

export function validateConfig(c) {
  const errors = [];
  if (!c || typeof c !== 'object' || Array.isArray(c)) return ['projects.json is not a JSON object'];
  if (typeof c.ownerLogin !== 'string' || !/^[A-Za-z0-9-]+$/.test(c.ownerLogin)) errors.push('ownerLogin must be a GitHub login');
  if (typeof c.ownerTimeZone !== 'string') errors.push('ownerTimeZone must be an IANA time zone');
  else {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: c.ownerTimeZone });
    } catch {
      errors.push(`ownerTimeZone ${c.ownerTimeZone} is not a time zone`);
    }
  }
  if (c.v5Clock !== null) {
    const k = c.v5Clock;
    if (!k || typeof k !== 'object' || !Array.isArray(k.days) || !k.days.every((d) => DAYS.has(d))
        || !HHMM.test(k.from || '') || !HHMM.test(k.to || '') || k.from >= k.to) {
      errors.push('v5Clock must be null or { days: [Mon…Sun], from: "HH:MM", to: "HH:MM" } with from before to');
    }
  }
  if (!Number.isInteger(c.linkCap) || c.linkCap < 100) errors.push('linkCap must be an integer of at least 100');
  // From 2026-10-18 (AC74, AC75, J19): `push`; missing alone builds, and the desk says "Notifications aren't set up yet".
  if (c.push !== undefined) {
    const p = c.push;
    if (!p || typeof p !== 'object' || Array.isArray(p)) errors.push('push must be { vapidPublicKey, deskUrl }');
    else {
      if (!decodeVapidKey(p.vapidPublicKey)) errors.push('push.vapidPublicKey must be 87 characters of base64url decoding to 65 bytes starting 0x04 (Setup N1)');
      let u = null;
      try {
        u = typeof p.deskUrl === 'string' ? new URL(p.deskUrl) : null;
      } catch {
        u = null;
      }
      if (!u || u.protocol !== 'https:' || u.search || u.hash || u.username || u.password || !/^https:\/\/[^/]+\/?$/.test(p.deskUrl)) {
        errors.push('push.deskUrl must be the desk\'s https address, with no path, query or fragment');
      }
    }
  }
  // From 2026-10-18, draft 4 (AC78, J21): `actionsUsage`; missing builds, and the line reads "not set up yet".
  if (c.actionsUsage !== undefined) {
    const a = c.actionsUsage;
    if (!a || typeof a !== 'object' || Array.isArray(a)) errors.push('actionsUsage must be { account, includedMinutes }');
    else {
      if (typeof a.account !== 'string' || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(a.account)) errors.push('actionsUsage.account must be a GitHub login');
      if (!Number.isInteger(a.includedMinutes) || a.includedMinutes <= 0) errors.push('actionsUsage.includedMinutes must be a whole number above 0');
      if (a.reported !== undefined && typeof a.reported !== 'boolean') errors.push('actionsUsage.reported must be true or false');
    }
  }
  if (!Array.isArray(c.projects) || c.projects.length === 0) {
    errors.push('projects must be a non-empty list');
    return errors;
  }
  if (c.projects.length > MAX_PROJECTS) {
    errors.push(`projects.json has ${c.projects.length} projects; ${MAX_PROJECTS} is the limit`);
  }
  const names = new Set();
  c.projects.forEach((p, i) => {
    const at = `projects[${i}]`;
    if (!p || typeof p !== 'object') {
      errors.push(`${at} is not an object`);
      return;
    }
    if (typeof p.name !== 'string' || !/^[A-Za-z0-9._-]+$/.test(p.name)) errors.push(`${at}.name must be a plain name`);
    else if (names.has(p.name)) errors.push(`${at}.name ${p.name} is used twice`);
    else names.add(p.name);
    if (typeof p.repo !== 'string' || !/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(p.repo)) errors.push(`${at}.repo must be owner/name`);
    if (typeof p.defaultBranch !== 'string' || p.defaultBranch === '' || /[\s?#&%]|\.\./.test(p.defaultBranch)) {
      errors.push(`${at}.defaultBranch must be a branch name`);
    }
    if (!MODELS.has(p.model)) errors.push(`${at}.model must be "v3" or "v2.5", not ${JSON.stringify(p.model)}`);
    for (const k of ['planning', 'webCommitsToDefault', 'contentPrefill']) {
      if (typeof p[k] !== 'boolean') errors.push(`${at}.${k} must be true or false`);
    }
    // From 2026-10-18 (Terms, AC52): absent means false; a value that is not true or false fails.
    if (p.deploysNeedOwner !== undefined && typeof p.deploysNeedOwner !== 'boolean') errors.push(`${at}.deploysNeedOwner must be true or false`);
    if (typeof p.contentParam !== 'string' || !/^[A-Za-z0-9_]+$/.test(p.contentParam)) {
      errors.push(`${at}.contentParam must be a parameter name`);
    }
  });
  return errors;
}
