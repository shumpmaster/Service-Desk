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
 * renderErrorState's state. Never throws itself. Returns the wrapped function.
 */
export function guardRender(draw, showError) {
  return function render() {
    try {
      draw();
    } catch (err) {
      try {
        showError(renderErrorState(err), err);
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
