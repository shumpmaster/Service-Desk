// J23's version reads (spec S-001, J23 "The version reads, from the connected projects"; AC83's top
// line; stage 3, reused by stage 6a's block). Three optional blobs per connected project, each from
// the tree J1 already reads, read once per device and again only when its sha changes:
// governance/OPERATING_MODEL_VERSION, AGENTS.md for its `tier:` line, and, only in the project whose
// J7 entry holds `"publishesModel": true`, the root VERSION. Pure: text in, words out; no network.

export const MODEL_VERSION_PATH = 'governance/OPERATING_MODEL_VERSION';
export const AGENTS_PATH = 'AGENTS.md';
export const ROOT_VERSION_PATH = 'VERSION';
export const NOT_RECORDED = 'not recorded';
export const NOT_AVAILABLE = 'not available';

/** The record kind of one of J23's paths, or null. */
export function versionKind(path) {
  if (path === MODEL_VERSION_PATH) return 'model-version';
  if (path === AGENTS_PATH) return 'agents-tier';
  if (path === ROOT_VERSION_PATH) return 'root-version';
  return null;
}

const firstLine = (text) => String(text == null ? '' : text).replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n')[0];

/**
 * A version file (J23): its first line, trimmed; an empty one is not recorded (null). `compared` is
 * false for a version that is not three whole numbers joined by dots: it reads as its text, compared
 * with nothing ("<text>, not compared").
 */
export function parseVersion(text) {
  const v = firstLine(text).trim();
  if (!v) return { version: null, compared: false };
  return { version: v, compared: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(v) };
}

/**
 * AGENTS.md's tier (J23, AC83): the first column-0 `tier:` line, its value the text after `tier:` up
 * to any `#`, trimmed (`T1` from Service-Desk's `tier: T1                  # T0 | T1 | …`). Only that
 * line is kept, so the cached record is small. A line with no value is not recorded (null).
 */
export function parseTier(text) {
  const lines = String(text == null ? '' : text).replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  const line = lines.find((l) => l.startsWith('tier:'));
  if (line == null) return { tier: null, line: false };
  const v = line.slice(5).split('#')[0].trim();
  return { tier: v || null, line: true };
}

/** Parse one of J23's records by its kind. */
export function parseVersionRecord(kind, text) {
  if (kind === 'agents-tier') return parseTier(text);
  if (kind === 'model-version' || kind === 'root-version') return parseVersion(text);
  return null;
}

/** A version in words (J23): "3.5.0", "<text>, not compared", or "not recorded". */
export function versionWords(rec) {
  if (!rec || !rec.version) return NOT_RECORDED;
  return rec.compared ? rec.version : `${rec.version}, not compared`;
}

/**
 * One of J23's reads for a project, from its tree and records: 'absent' (the tree does not hold it:
 * "not recorded"), 'pending' (held, not read yet: "not available"), or the parsed record. Exported
 * for stage 6a's block (AC87), which compares versions and so needs the record, not only its words.
 */
export function readOf(snap, path) {
  const tree = snap && snap.tree;
  if (!tree) return { state: 'pending' };
  if (!tree.has(path)) return { state: 'absent' };
  const rec = snap.records ? snap.records.get(path) : undefined;
  if (rec === undefined || rec === null) return { state: 'pending' };
  return { state: 'ok', rec };
}

/**
 * The project's versions (J23): { model, version, tier, publishes }, each in words. `model` is J7's
 * (`v3`, or `v2.5 pipeline`); `publishes` is the root VERSION's words for the project J7 marks
 * `publishesModel`, else null.
 */
export function projectVersions(project, snap) {
  const words = (path, fn) => {
    const r = readOf(snap, path);
    if (r.state === 'absent') return NOT_RECORDED;
    if (r.state === 'pending') return NOT_AVAILABLE;
    return fn(r.rec);
  };
  return {
    model: project.model === 'v3' ? 'v3' : 'v2.5 pipeline',
    version: words(MODEL_VERSION_PATH, versionWords),
    tier: words(AGENTS_PATH, (rec) => rec.tier || NOT_RECORDED),
    publishes: project.publishesModel === true ? words(ROOT_VERSION_PATH, versionWords) : null,
  };
}

/**
 * AC83's top line, in Plex Mono: "<model> · model <version> · <tier>", then " · publishes model
 * <its VERSION file>" for the project J7 marks `publishesModel` (frame 8). A tier not recorded reads
 * "tier not recorded", so the words say what is missing (C).
 */
export function topLine(project, snap) {
  const v = projectVersions(project, snap);
  const tier = v.tier === NOT_RECORDED || v.tier === NOT_AVAILABLE ? `tier ${v.tier}` : v.tier;
  return `${v.model} · model ${v.version} · ${tier}${v.publishes != null ? ` · publishes model ${v.publishes}` : ''}`;
}
