// The desk page's start-up and render guards (spec S-001, AC4, AC5; review N4 and N6). No DOM
// here, so the tests drive the same functions the page runs.
//
// - A malformed route (a hash such as `#/p/%E0`) falls back to the Universe view instead of
//   throwing.
// - A render that throws shows an error state ("Can't show …") on the screen instead of leaving
//   whatever it said before, so the screen is never a frozen "Quiet".
// - The desk starts polling even if the first render throws.

import { errorText } from './scheduler.js';

/** The route's parts from a location hash (`#/p/<project>/…`). Malformed → [] (the Universe). */
export function routeParts(hash) {
  const raw = String(hash == null ? '' : hash).replace(/^#\/?/, '').split('/');
  try {
    return raw.map(decodeURIComponent).filter((s) => s !== '');
  } catch {
    return [];
  }
}

/** AC32: the state line while signed out. It is set before and apart from the boxes. */
export const SIGNED_OUT_STATE = { text: 'Signed out — reload to sign in', quiet: false, className: 'signed-out' };

/** The screen's state while a render has failed: never quiet. */
export function renderErrorState(err) {
  return {
    text: `Can't show the desk: ${errorText(err)}. Still reading; it retries on the next update.`,
    quiet: false,
    className: 'cant-read',
  };
}

/**
 * Wrap the page's render: when `draw` throws, `showError(state, err)` is called with
 * renderErrorState's state, or with the signed-out state when `isSignedOut()` says so (AC32: a
 * render error never replaces "Signed out"). Never throws itself. Returns the wrapped function.
 */
export function guardRender(draw, showError, isSignedOut = () => false) {
  return function render() {
    try {
      draw();
    } catch (err) {
      try {
        let out = false;
        try {
          out = Boolean(isSignedOut());
        } catch {
          out = false;
        }
        showError(out ? SIGNED_OUT_STATE : renderErrorState(err), err);
      } catch {
        // Nothing more the page can do; polling goes on regardless.
      }
    }
  };
}

/** Render once, then start the desk, whatever the render did. */
export function boot(render, desk) {
  try {
    render();
  } catch {
    // render is guarded; this is belt and braces so desk.start() always runs.
  } finally {
    desk.start();
  }
}

/** AC89 (h): the page's words when the desk's own code fails to load (stage 8's review, round 1, note 4). */
export const LOAD_FAILED_WORDS = "The desk couldn't load. Reload to try again.";

/**
 * Load the desk's code and start it (AC44 step 4: `/` is the desk). If the code can't be loaded, or it throws while
 * starting, `show(LOAD_FAILED_WORDS)` puts AC89 (h)'s words in place of "Checking…", so the page never reads as
 * quiet or as still checking for good. Never throws itself. Returns a promise of the started desk, or null.
 */
export function startDesk(load, show) {
  let loading;
  try {
    loading = Promise.resolve(load());
  } catch (err) {
    loading = Promise.reject(err);
  }
  return loading.then((m) => m.startSandbox()).catch((err) => {
    // A real bug keeps its trace (stage 1's review note).
    try {
      console.error(err);
    } catch {
      // no console here
    }
    try {
      show(LOAD_FAILED_WORDS);
    } catch {
      // nothing more the page can do
    }
    return null;
  });
}
