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

  // Register (or update) our SW
  const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  // Ask permission if needed
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission !== 'granted') {
    console.warn('Notifications permission not granted.');
    return;
  }

  // Init Firebase from .env
  const app = initializeApp({
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  });

  const messaging = getMessaging(app);

  // Get a Web Push token via VAPID
  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });

  if (!token) {
    console.warn('No FCM token received.');
    return;
  }

  // Send token to backend (JWT required)
  await api.post('/push/token', { token, platform: 'WEB' });

  // Foreground messages → nudge the navbar badge immediately
  onMessage(messaging, (payload) => {
    window.dispatchEvent(new CustomEvent('sb-unread-refresh'));
    try {
      const d = payload?.data || {};
      if (document.hidden) new Notification(d.title || 'New message', { body: d.body || '' });
    } catch {}
  });
}
