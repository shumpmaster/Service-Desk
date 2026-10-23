// The long-text fixture of the amendment "After MD3" ((b) item 30, first part; stage 6a; AC89 (f), specs/S-001.md:7880-7882):
// Service-Desk's J11 records at 77bfeae (real) with made-up records added, each NOT a real record (tests/desk/fixtures/README.md,
// "After MD3, stage 6a"), whose texts run past their three lines so that a bubble opens on every screen that has one:
// - Home: a README summary of many lines, so the tile's summary opens its bubble;
// - the project page: a long ruling as "Your last action", which opens its bubble;
// - Plan: an answered later-work row whose ruling runs long (its bubble on Plan's own ground);
// - a milestone's sheet over Plan: an estimate note of many lines (its bubble on the sheet's ground).
import { waSetup, estLine, memStore } from './wa-fixtures.mjs';

export const LONG_NOW = Date.parse('2026-10-19T18:00:00Z');
const MADE = 'NOT a real record: made up for the long-text fixture';

/** The made-up README: its summary paragraph runs well past three lines on a phone. */
export const LONG_README = `# Service-Desk\n\nA made-up summary for the desk's long-text fixture (${MADE}): the desk reads every connected project's records and shows the owner, on the phone, what waits on them, what each project is doing, what comes next, and what the agents did since the owner last looked, with each word, count and date taken from a record or said to be missing, and nothing the owner does changing a record except through GitHub's own pages.\n`;

/** A long ruling, as an answer file's first line. */
export const LONG_RULING = `Ruling: A — add the ask or jot box as a milestone of its own, after M3C, with one box on the desk to ask, instruct or note an idea, its words sent as a file the Chief of Staff reads at its next session, and nothing sent without the owner's tap (${MADE}).`;

/** Long estimate notes, one per milestone (the sheet's bubble). */
const NOTE = (code) => `${code}: the estimate counts the screens still to change, the reviews each takes, the owner's acceptance on the preview, and a day for what the reviews find, with the stages before it done first (${MADE}).`;

export function longSetup() {
  const t = '2026-10-18T17:00:00Z';
  const est = ['MD1', 'MD2', 'MD3', 'M3A', 'M3B', 'M3C'].map((m, i) => estLine(m, i < 2 ? 0 : 2, i < 2 ? 0 : 4, t, NOTE(m))).join('\n') + '\n';
  const later = `# Later work, not milestones yet\n- Ask or jot box (W1) · one box on the desk to ask, instruct or note an idea · from: decisions/questions/P-001-trial-view-notes-2.md:164\n- Upkeep fixes (W2) · read-access warning, M3B's criteria, more than five projects · from: decisions/questions/P-001-trial-view-notes-2.md:168\n`;
  const answer = 'decisions/questions/P-001-later-work-w1.md';
  const s = waSetup({ extra: { 'README.md': LONG_README, 'intake/estimates.jsonl': est, 'intake/later-work.md': later, [answer]: `${LONG_RULING}\n\nQuestion: questions/P-001-later-work-w1.md\n` } });
  s.repos['Service-Desk'].history[answer] = [{ commit: { committer: { date: '2026-10-19T15:00:00Z' } } }];
  return { ...s, now: LONG_NOW, store: memStore() };
}
