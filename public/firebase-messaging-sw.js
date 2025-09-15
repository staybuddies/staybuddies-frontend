self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  try {
    if (!event.data) return; 

    const data = (() => {
      try { return event.data.json() || {}; } catch { return {}; }
    })();

    const title = data.title || 'New message';
    const body  = data.body  || 'You have a new message';
    const threadId = data.threadId ? String(data.threadId) : '';

    const opts = {
      body,
      icon:  '/icons/icon-192.png',   
      badge: '/icons/badge-72.png',
      data:  { threadId }
    };
    if (threadId) {
      opts.tag = `thread-${threadId}`;
      opts.renotify = true;
    }

    event.waitUntil(self.registration.showNotification(title, opts));
  } catch {
  }
});

// Focus/open app when the user clicks the system notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const threadId = event.notification?.data?.threadId || '';

  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      c.postMessage({ type: 'OPEN_THREAD', threadId });
      return c.focus();
    }
    return clients.openWindow(
      threadId ? `/messages?thread=${encodeURIComponent(threadId)}` : '/messages'
    );
  })());
});
