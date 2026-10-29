// HD1's fixtures (spec S-001, AC98; stage HD1, the headers sized up): glance-fixtures.mjs's `mix` (Service-Desk's records at
// 77bfeae, real; Personal-Org-Operating-Model in poom/'s placeholder form; the made-up project Alpha, NOT real), opened with
// "last looked" kept on the device at a made-up time (NOT a real record), so Home's "Since you last looked" reads with a clock
// time ("yesterday, 14:00") or with "in the last 7 days". Labelled in tests/desk/fixtures/README.md.
import { loadSandbox, findAll } from './sandbox-helpers.mjs';
import { memStore } from './wa-fixtures.mjs';
import { mixState, NOW } from './glance-fixtures.mjs';

export const H = 3600e3;
/** A device's "last looked" (AC40's record, `desk-seen-v1`), made up. */
export const lookedAt = (ms, extra = {}) => memStore({ 'desk-seen-v1': JSON.stringify({ lastLooked: ms }), ...extra });
/** `mix` opened at its clock with "last looked" `ago` ms before it, read once. */
export async function hd1Open({ ago = 20 * H, hash = '#/', state = mixState() } = {}) {
  const app = await loadSandbox({ ...state, hash, now: NOW, store: lookedAt(NOW - ago) });
  await app.advance(1000);
  await app.advance(61_000);
  return app;
}
/** Every phase on a project's page opened, as a tap on each phase's line opens it (as the stage-8 walk opens them). */
export async function openPhases(app) {
  for (const ph of ['Launch', 'Build', 'Design', 'Discovery']) {
    const b = findAll(app.view, (e) => e.tag === 'button' && e.attrs && e.attrs['aria-label'] === ph)[0];
    if (b) await app.tap(b);
  }
}

/**
 * The list under "Since you last looked" left out of the walk, as G7b's walk leaves it out (ac88-dark.test.mjs, G7B_OPENS): each
 * line's two-line cut (`span.v2-e1`, G1's AC91 (e)) differs from bd4097d's, a change of G1's that G1_ONCE doesn't pin and the
 * walks never reached; AC82's and AC91's own cases lock it. HD1's walk reads the heading above it.
 */
export async function withoutSinceList(app) {
  for (const e of findAll(app.view, (x) => / v2-e1 /.test(` ${x.className || ''} `))) {
    let li = e;
    while (li && li.tag !== 'li') li = li.parent;
    if (li && li.parent) li.parent.removeChild(li);
  }
}

// HD1_OPENS: the screens HD1's cascade walk reads (tests/desk/ac88-dark.test.mjs), two page loads, each [where, open() → app,
// [[hash, prepare(app)?]]]. Made up, NOT real.
export const HD1_OPENS = [
  ['mix, last looked 20 h before (made up): Home with "Since you last looked · <time>", a project\'s page with its phases opened, Plan',
    () => hd1Open(), [['#/', withoutSinceList], ['#/p/Service-Desk', openPhases], ['#/work']]],
  ['mix, last looked 9 days before (made up): Home with "Since you last looked · in the last 7 days"', () => hd1Open({ ago: 9 * 24 * H }), [['#/', withoutSinceList]]],
];
