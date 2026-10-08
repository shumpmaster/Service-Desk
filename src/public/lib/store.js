// Wrapped browser storage (spec S-001, J5's rule applied to J6's cache): every read and write is
// guarded, so a private window or cleared storage costs only the cache, never the page. When
// storage is unavailable the values live in memory for the open window.

export function createStore(backing) {
  const memory = new Map();
  let usable = true;
  let storage = null;
  try {
    storage = backing === undefined ? globalThis.localStorage : backing;
    if (!storage) usable = false;
  } catch {
    usable = false;
  }
  return {
    get usable() {
      return usable;
    },
    getJSON(key, fallback) {
      if (usable) {
        try {
          const raw = storage.getItem(key);
          if (raw != null) return JSON.parse(raw);
          return fallback;
        } catch {
          usable = false;
        }
      }
      return memory.has(key) ? memory.get(key) : fallback;
    },
    remove(key) {
      memory.delete(key);
      if (!usable) return;
      try {
        storage.removeItem(key);
      } catch {
        // a failed removal costs only the space; the key is no longer read
      }
    },
    setJSON(key, value) {
      memory.set(key, value);
      if (!usable) return false;
      try {
        storage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        usable = false;
        return false;
      }
    },
  };
}
