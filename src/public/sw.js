// The desk's service worker (spec S-001, AC75; J17, J19): same-origin, served as JavaScript, the
// path the desk subscribes through when the page offers no Declarative Web Push (window.pushManager).
// It reads the one payload form J17 sends, `{"web_push": 8030, "notification": {"title", "body",
// "navigate", "tag"}}`. Every push shows a notification, so Safari never revokes the permission (W8);
// a tap opens the desk only at an address on the desk's own origin, else at its root (X7); and when
// the subscription changes it says so, since it cannot change a GitHub secret itself (V10).
// It caches nothing and reads no record.

'use strict';

const DESK_TITLE = 'Service Desk';
const FALLBACK_BODY = 'Something waits on you: open the desk';
const AGAIN_BODY = 'Desk notifications need turning on again: open the desk';
// AC74 (draft 8): how long an open desk has to take a tap's address before it is navigated instead.
const HANDOVER_MS = 1000;

function origin() {
  return self.location.origin;
}

/** The address a tap opens: the payload's own when it is on the desk's origin, else the desk's root. */
function safeAddress(navigate) {
  const root = `${origin()}/`;
  if (typeof navigate !== 'string' || navigate === '') return root;
  try {
    const u = new URL(navigate, root);
    return u.origin === origin() ? u.href : root;
  } catch (e) {
    return root;
  }
}

/** The notification a push asks for, from its payload; one that can't be read still shows (W8). */
function fromPayload(data) {
  let v = null;
  try {
    v = data ? data.json() : null;
  } catch (e) {
    v = null;
  }
  const n = v && typeof v === 'object' && v.notification && typeof v.notification === 'object' ? v.notification : null;
  const title = n && typeof n.title === 'string' && n.title ? n.title : DESK_TITLE;
  const body = n && typeof n.body === 'string' ? n.body : FALLBACK_BODY;
  const options = { body, data: { navigate: safeAddress(n && n.navigate) } };
  if (n && typeof n.tag === 'string' && n.tag) options.tag = n.tag;
  return { title, options };
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const { title, options } = fromPayload(event.data);
  event.waitUntil(self.registration.showNotification(title, options));
});

/** Hand an open desk window the address; resolves true once the page says it took it. */
function handOver(client, target) {
  if (typeof MessageChannel !== 'function' || typeof client.postMessage !== 'function') return Promise.resolve(false);
  return new Promise((resolve) => {
    const ch = new MessageChannel();
    const timer = setTimeout(() => {
      ch.port1.close();
      resolve(false);
    }, HANDOVER_MS);
    ch.port1.onmessage = (e) => {
      clearTimeout(timer);
      ch.port1.close();
      resolve(Boolean(e && e.data && e.data.ok === true));
    };
    try {
      client.postMessage({ kind: 'desk-open', navigate: target }, [ch.port2]);
    } catch (e) {
      clearTimeout(timer);
      resolve(false);
    }
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = safeAddress(data.navigate);
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const own = (list || []).find((c) => {
      try {
        return new URL(c.url).origin === origin();
      } catch (e) {
        return false;
      }
    });
    if (own) {
      // AC74, AC77 (draft 8): an open desk is focused and handed the address, so it stays loaded and
      // runs its closed read again before showing the item; a page that doesn't take it within a
      // second is navigated instead.
      const navigate = () => (typeof own.navigate === 'function'
        ? own.navigate(target).then((c) => (c || own).focus(), () => self.clients.openWindow(target))
        : self.clients.openWindow(target));
      const focus = typeof own.focus === 'function' ? Promise.resolve().then(() => own.focus()).catch(() => null) : Promise.resolve();
      return focus.then(() => handOver(own, target)).then((taken) => (taken ? null : navigate()));
    }
    return self.clients.openWindow(target);
  }));
});

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(self.registration.showNotification(DESK_TITLE, { body: AGAIN_BODY, tag: 'desk-subscription-change',
    data: { navigate: `${origin()}/` } }));
});
