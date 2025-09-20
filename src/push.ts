import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import api from '@/api';

let started = false;

export async function startPushOnce() {
  if (started) return;
  started = true;

  if (!(await isSupported())) {
    console.warn('FCM not supported on this browser.');
    return;
  }

  const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission !== 'granted') {
    console.warn('Notifications permission not granted.');
    return;
  }

  const app = initializeApp({
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  });

  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });
  if (!token) { console.warn('No FCM token received.'); return; }

  // send to backend (NOTE: using your /api/v1/notifications/register-token)
  await api.post('/notifications/register-token', { token, platform: 'WEB' });

  // Foreground pushes -> nudge notices & optionally show system notification
  onMessage(messaging, (payload) => {
    const d = payload?.data || {};
    // Bell pulse + unread refresh for unified notices
    window.dispatchEvent(new CustomEvent('sb-notice-refresh'));

    // Backward compat if you still use message-only counter elsewhere
    window.dispatchEvent(new CustomEvent('sb-unread-refresh'));

    try {
      if (document.hidden) {
        new Notification(d.title || 'Notification', { body: d.body || '' });
      }
    } catch {}
  });
}
