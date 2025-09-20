import { ref, computed } from 'vue';
import api from '@/api';
import { connect, subscribeJson } from '@/ws/stomp';
import type { Notice } from '@/types/notice';

const unread = ref(0);
const items  = ref<Notice[]>([]);

let unsubUserQueue: null | (() => void) = null;
let unsubFallback:  null | (() => void) = null;
let myId: number | null = null;
let connected = false;

export function useNotices() {
  /** Try new endpoint if present, else fall back to message threads. */
  async function fetchUnread() {
    try {
      const res = await api.get('/notifications/unread-count', { validateStatus: () => true });
      const d = res?.data ?? {};
      if (typeof d.count !== 'undefined') {
        unread.value = Number(d.count || 0);
        return;
      }
      if (typeof d.unread !== 'undefined') {
        unread.value = Number(d.unread || 0);
        return;
      }
    } catch { /* ignore and fall back */ }

    try {
      const { data } = await api.get('/messages/threads');
      const list = Array.isArray(data) ? data : [];
      unread.value = list.reduce((sum, c) => sum + Number(c.unread || 0), 0);
    } catch {
      unread.value = 0;
    }
  }

  /** Optional list endpoint (safe if you don’t have it yet). */
  async function fetchLatest(limit = 50) {
    try {
      const res = await api.get('/notifications', {
        params: { limit },
        validateStatus: () => true,
      });
      items.value = Array.isArray(res.data) ? res.data : [];
    } catch {
      items.value = [];
    }
  }

  function prepend(n: Notice) {
    items.value = [n, ...items.value];
    if (!n.read) unread.value = Math.min(99, unread.value + 1);
    window.dispatchEvent(new CustomEvent('sb-notice-refresh'));
  }

  async function markRead(id: number) {
    try {
      await api.post(`/notifications/${id}/read`);
      const n = items.value.find(x => x.id === id);
      if (n && !n.read) {
        n.read = true;
        unread.value = Math.max(0, unread.value - 1);
      }
    } catch {}
  }

  async function markAllRead() {
    try {
      await api.post('/notifications/read-all');
      items.value.forEach(n => (n.read = true));
      unread.value = 0;
    } catch {}
  }

  async function startLive() {
    if (connected) return;

    // Try STOMP (ok if it fails; push will still nudge)
    try {
      await connect();
      connected = true;
    } catch {
      connected = false;
    }

    // Per-user queue
    try {
      unsubUserQueue = await subscribeJson('/user/queue/notice', (notice: Notice) => {
        if (!notice) return;
        prepend(normalizeNotice(notice));
      });
    } catch {}

    // Fallback topic by my numeric id
    if (!myId) {
      try {
        const { data } = await api.get('/me');
        myId = data?.id ?? null;
      } catch {
        myId = null;
      }
    }
    if (myId) {
      try {
        unsubFallback = await subscribeJson(`/topic/notice.user-${myId}`, (notice: Notice) => {
          if (!notice) return;
          prepend(normalizeNotice(notice));
        });
      } catch {}
    }

    // Foreground web-push nudges:
    // (1) legacy message counter — keep it
    const onUnread = () => { fetchUnread(); };
    window.addEventListener('sb-unread-refresh', onUnread);

    // (2) ✅ notice refresh — update counter and list
    const onNotice = () => {
      fetchUnread();
      fetchLatest().catch(() => {});
    };
    window.addEventListener('sb-notice-refresh', onNotice);

    // stash handlers so we can remove later
    (window as any).__sb_onUnread = onUnread;
    (window as any).__sb_onNotice = onNotice;
  }

  function stopLive() {
    if (unsubUserQueue) unsubUserQueue();
    if (unsubFallback)  unsubFallback();
    unsubUserQueue = null;
    unsubFallback  = null;

    const onUnread = (window as any).__sb_onUnread;
    const onNotice = (window as any).__sb_onNotice;
    if (onUnread) window.removeEventListener('sb-unread-refresh', onUnread);
    if (onNotice) window.removeEventListener('sb-notice-refresh', onNotice);
    (window as any).__sb_onUnread = undefined;
    (window as any).__sb_onNotice = undefined;

    connected = false;
  }

  return {
    // state
    unread: computed(() => unread.value),
    items,
    // ops
    fetchUnread,
    fetchLatest,
    startLive,
    stopLive,
    markRead,
    markAllRead,
  };
}

/** Normalize incoming payloads so the UI never crashes on missing fields. */
function normalizeNotice(n: any): Notice {
  return {
    id: Number(n.id ?? Date.now()),
    type: String(n.type ?? 'UNKNOWN') as Notice['type'],
    fromUserId: n.fromUserId != null ? Number(n.fromUserId) : undefined,
    fromName: n.fromName,
    threadId: n.threadId != null ? Number(n.threadId) : undefined,
    matchRequestId: n.matchRequestId != null ? Number(n.matchRequestId) : undefined,
    targetUserId: n.targetUserId != null ? Number(n.targetUserId) : undefined,
    title: n.title,
    body: n.body,
    createdAt: String(n.createdAt ?? new Date().toISOString()),
    read: Boolean(n.read ?? false),
  };
}
