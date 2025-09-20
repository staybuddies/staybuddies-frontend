/* firebase-messaging-sw.js
   Works with FCM "data" payloads or your own Web Push.
   - Shows a system notification
   - Broadcasts BOTH `sb-notice-refresh` and `sb-unread-refresh` to open pages
   - Focuses existing tab or opens a new one on click
*/

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

/** Safely parse push payload into a plain object. */
function parsePayload(event) {
  try {
    if (!event?.data) return {};
    try { return event.data.json() || {}; } catch {}
    const txt = event.data.text();
    try { return JSON.parse(txt) || {}; } catch {}
    return {};
  } catch {
    return {};
  }
}

/** Decide where to navigate when user clicks the notification. */
function buildClickTarget(d) {
  // Prefer explicit URL if backend sends one
  if (typeof d.url === 'string' && d.url.trim()) return d.url.trim();

  // Thread → messages page
  if (d.threadId) return `/messages?thread=${encodeURIComponent(String(d.threadId))}`;

  // Default to notifications page
  return '/notifications';
}

/** Broadcast a message to all open client windows/tabs. */
async function broadcastToPages(message) {
  const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const c of all) {
    try { c.postMessage(message); } catch {}
  }
}

/* PUSH HANDLER */
self.addEventListener('push', (event) => {
  const d = parsePayload(event);

  // Title/body fallbacks based on notice type
  const t = String(d.type || '').toUpperCase();
  const title =
    d.title ||
    (t === 'MATCH_REQUESTED' ? 'New match request' :
     t === 'MATCH_ACCEPTED'  ? 'Match accepted' :
     t === 'MATCH_DECLINED'  ? 'Match declined' :
     t === 'MESSAGE'         ? 'New message' :
     'Notification');

  const body = d.body || (
    t === 'MATCH_ACCEPTED' ? 'They accepted your request. You can start chatting!' :
    t === 'MATCH_REQUESTED' ? 'Review the request and accept or decline.' :
    'You have a new notification.'
  );

  const threadId = d.threadId ? String(d.threadId) : '';
  const url = buildClickTarget(d);

  const opts = {
    body,
    icon:  '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data:  { url, threadId, type: d.type || '' }
  };
  if (threadId) {
    opts.tag = `thread-${threadId}`;
    opts.renotify = true;
  }

  event.waitUntil(Promise.all([
    self.registration.showNotification(title, opts),
    // 🔔 Nudge the app: some pages listen to one or the other
    broadcastToPages({ type: 'sb-notice-refresh', data: d }),
    broadcastToPages({ type: 'sb-unread-refresh' })
  ]));
});

/* CLICK HANDLER: focus an open tab or open a new one */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { url, threadId } = event.notification?.data || {};
  const target = url || (threadId ? `/messages?thread=${encodeURIComponent(threadId)}` : '/notifications');

  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      try {
        // Hint the app to open/route internally if needed
        if (threadId) {
          c.postMessage({ type: 'OPEN_THREAD', threadId: String(threadId) });
        } else {
          c.postMessage({ type: 'OPEN_URL', url: target });
        }
      } catch {}
      return c.focus();
    }
    return clients.openWindow(target);
  })());
});
