// "New since you last looked" (spec S-001, AC40). "Last looked" is the end of the last window in
// which the desk was visible on this device for at least 10 s in a row; a shorter flash doesn't
// count. It is kept on the device only, under its own key, through the wrapped store (J5's rule),
// and nothing is stored on Cloudflare. With no record (first visit, a private window, cleared or
// failing storage) nothing is marked new and the desk says so.

export const SEEN_KEY = 'desk-seen-v1';
export const SEEN_MIN_MS = 10_000; // 10 s (C, a constant to tune in the lab)
export const MARKERS_OFF = 'new-since markers off on this device';

/**
 * createSeen({ store, now }) → { visible(), hidden(), isNew(time), reference, off, words }.
 * - `reference` is the "last looked" this window marks against; it moves only when a window of
 *   10 s or more ends, and then only for the next window, so marks never change under the owner.
 */
export function createSeen({ store, now }) {
  let stored = null;
  try {
    const v = store ? store.getJSON(SEEN_KEY, null) : null;
    stored = v && Number.isFinite(v.lastLooked) ? v.lastLooked : null;
  } catch {
    stored = null;
  }
  let reference = stored;
  let windowStart = now();
  let open = true;
  const seen = {
    get reference() {
      return reference;
    },
    get off() {
      return reference == null || !store || !store.usable;
    },
    get words() {
      return seen.off ? MARKERS_OFF : null;
    },
    /** The page became visible: a new window starts, marking against the latest "last looked". */
    visible() {
      if (open) return;
      open = true;
      windowStart = now();
      reference = stored;
    },
    /** The page was hidden (or closed): a window of 10 s or more moves "last looked" to its end. */
    hidden() {
      if (!open) return;
      open = false;
      const end = now();
      if (end - windowStart >= SEEN_MIN_MS) {
        stored = end;
        try {
          if (store) store.setJSON(SEEN_KEY, { lastLooked: end });
        } catch {
          // the store already falls back to memory; markers then go off on the next opening
        }
      }
    },
    /**
     * "Mark as seen" (AC40 as AC82 changes it, frame H1): "last looked" is now, at once, on this
     * device, for this window too; the 10-second rule still moves it otherwise.
     */
    markSeen() {
      const t = now();
      stored = t;
      reference = t;
      windowStart = t;
      try {
        if (store) store.setJSON(SEEN_KEY, { lastLooked: t });
      } catch {
        // the store already falls back to memory; markers then go off on the next opening
      }
    },
    /** True when `time` (ms or ISO text) is after "last looked"; never with no record. */
    isNew(time) {
      if (seen.off) return false;
      const at = typeof time === 'string' ? Date.parse(time) : time instanceof Date ? time.getTime() : time;
      return Number.isFinite(at) && at > reference;
    },
  };
  return seen;
}
