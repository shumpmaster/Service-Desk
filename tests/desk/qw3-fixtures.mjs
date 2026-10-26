// The fixture states of stage QW3 of "After the questions request" (spec S-001, AC96 and AC95's blocker parts; the amendment's
// stage note: "a question held as asked in a session, with and without a `Blocks:` line; … questions whose `Blocks:` lines
// name waiting and not-waiting items; the blocker cases AC95 works through"). Every question file and `Blocks:` line below is
// made up, NOT a real record: no owner was asked any of them, no Chief of Staff wrote any of them. Each is labelled NOT real in
// tests/desk/fixtures/README.md.
//
// - `qw3BusiestState`: QW2's busiest state (QW1's busiest board, md-extremes/' five projects, with Alpha holding twelve cards;
//   tests/desk/qw2-fixtures.mjs), its made-up questions given `Blocks:` lines, as the approved picture's frame 1 draws them
//   (docs/design/builds/m3g-picture/, made up too):
//   - Alpha: its first question (`Alpha-pick`, raised 30 hours before NOW) blocks pull request #81 and the decision card
//     Q-020-stop-1; its second (`Alpha-second`, 6 hours) blocks the same card and pull request #82, kicked back on this device;
//     so both are blockers, "1 of 12" and "2 of 12", the card "Waits on questions 1 and 2". A made-up question held as being
//     asked in a session (`Alpha-held`, its `Asked in session:` line under its `Milestone:` line, its `Blocks:` line after
//     them) blocks #80 and the hold card, "Answer first · cards 4 and 10 wait on it" as in the picture, and names itself
//     (dropped), Beta's held question (another project's path: not found here), a pull request not open (#999), a card file
//     not there and an entry in no form;
//   - Beta: its question, kicked back on this device (QW1's), blocks Beta's pull request #80 and names Beta's held question
//     (which has no `Blocks:` line), so the held question sits after it ("After the blockers");
//   - Gamma: its numbered question blocks Gamma's merge card, kicked back on this device (QW2's), so a strip card says "Waits
//     on question 1".
// - `QW3_OPENS`: the screens QW3's cascade checks walk (tests/desk/ac88-dark.test.mjs), opened as the owner opens them.
import { CONFIG } from './helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { qw2BusiestState, qw2Open, Q_SECOND, NOW } from './qw2-fixtures.mjs';
import { Q_ALPHA, Q_BETA, Q_GAMMA, qFile, SID, QPATH, HELD_PATH, qid } from './qw1-fixtures.mjs';

export { NOW, CONFIG };
const H = 3600e3;
const hist = (ms) => [{ commit: { committer: { date: new Date(ms).toISOString() } } }];

/**
 * A question file (QW1's made-up form, NOT real) with a `Blocks:` line put where `at` says: 'top' (after the title, before
 * any `Milestone:` line), 'after' (after its `Milestone:` and `Asked in session:` lines, before `WHY:`), 'why' (after the
 * `WHY:` line: not read), or 'end' (the file's last line).
 */
export function withBlocks(text, line, at = 'after') {
  const ls = text.replace(/\n$/, '').split('\n');
  if (at === 'end') return `${[...ls, line].join('\n')}\n`;
  if (at === 'top') return `${[ls[0], '', line, ...ls.slice(1)].join('\n')}\n`;
  const why = ls.findIndex((l) => l.startsWith('WHY:'));
  if (at === 'why') return `${[...ls.slice(0, why + 1), line, ...ls.slice(why + 1)].join('\n')}\n`;
  return `${[...ls.slice(0, why), line, ...ls.slice(why)].join('\n')}\n`;
}

/** The busiest state's held blocker in Alpha (made up, NOT real): the picture's held question, its line after `Asked in session:`. */
export const ALPHA_HELD = 'questions/Alpha-held.md';
export const ALPHA_BLOCKS = {
  pick: 'Blocks: #81, queue/Q-020-stop-1.md',
  second: 'Blocks: queue/Q-020-stop-1.md, #82',
  held: `Blocks: #80, queue/ci-hold-4a2448939173.md, ${ALPHA_HELD}, ${HELD_PATH}, #999, queue/P-404-stop-1.md, card 7`,
};
export const Q_ALPHA_HELD = withBlocks(qFile({ title: 'Should Plan show estimates in days or in weeks? (Alpha\'s, made up)', milestone: 'M3B', asked: SID, def: 'A', timeout: '72',
  options: ['A. Days, as now.', 'B. Weeks, rounded up.', 'C. Both, days first.', 'D. Neither — hide the estimates until the launch.'], rec: 'A — as now.' }), ALPHA_BLOCKS.held);

/**
 * Alpha's twelve places in `qw3BusiestState` (AC95's order with the blockers first): its two blockers, then every other card
 * oldest first (QW2's ALPHA_TWELVE less the two questions), the cards with no raised time last.
 */
export const ALPHA_QW3 = [
  'Alpha|question|questions/Alpha-pick.md', // a blocker, raised 30 hours before NOW
  'Alpha|question|questions/Alpha-second.md', // a blocker, raised 6 hours before NOW
  'Alpha|pr|83',
  'Alpha|pr|80', // held up by the held question
  'Alpha|pr|81', // held up by question 1
  'Alpha|gate|queue/P-002-criteria-1.md',
  'Alpha|card|queue/Q-020-stop-1.md', // held up by questions 1 and 2
  'Alpha|pr|82', // held up by question 2 (kicked back here)
  'Alpha|deploy|1001',
  'Alpha|hold|queue/ci-hold-4a2448939173.md', // held up by the held question
  'Alpha|merge|queue/P-002-merge-conflict.md',
  'Alpha|missing-card|status/P-009.toml',
];

/** QW3's busiest state (see above): QW2's with the made-up `Blocks:` lines and Alpha's held blocker. */
export function qw3BusiestState({ kicked = true, held = true } = {}) {
  const s = qw2BusiestState({ kicked, held });
  const a = s.repos.Alpha;
  a.commit({
    [QPATH.Alpha]: withBlocks(Q_ALPHA, ALPHA_BLOCKS.pick),
    [Q_SECOND]: withBlocks(qFile({ title: 'Which day should the weekly review run?', options: ['A. Monday.', 'B. Friday.'], rec: 'B — Friday.' }), ALPHA_BLOCKS.second, 'top'),
    ...(held ? { [ALPHA_HELD]: Q_ALPHA_HELD } : {}),
  });
  if (held) a.history[ALPHA_HELD] = hist(NOW - 3 * H);
  s.repos.Beta.commit({ [QPATH.Beta]: withBlocks(Q_BETA, `Blocks: #80, ${HELD_PATH}`) });
  s.repos.Gamma.commit({ [QPATH.Gamma]: withBlocks(Q_GAMMA, 'Blocks: queue/P-002-merge-conflict.md') });
  s.store = (extra = {}) => memStore({ ...s.seed, ...extra });
  return s;
}

export const qw3Open = qw2Open;
export { qid, HELD_PATH, QPATH };

/**
 * QW3's screens (each made-up part NOT real), for the cascade checks (tests/desk/ac88-dark.test.mjs): the busiest board, with
 * blockers in three projects, a held blocker, a kicked-back blocker, "Answer first", "Waits on question <k>" on lane, strip and
 * gate-less cards, and "Waits on a question being asked in your session"; and a blocker's sheet with its "Cards waiting on it"
 * and the entries that do not count, opened from the board.
 */
export const QW3_OPENS = [
  ['Waiting, the busiest case with blockers in three projects and a held blocker', () => qw3Open(qw3BusiestState(), '#/waiting')],
  ['the held blocker\'s sheet over Waiting, its "Cards waiting on it" and the entries that do not count', async () => {
    const app = await qw3Open(qw3BusiestState(), '#/waiting');
    await app.go(`#/waiting/card/${encodeURIComponent(qid('Alpha', ALPHA_HELD))}`);
    return app;
  }],
];
