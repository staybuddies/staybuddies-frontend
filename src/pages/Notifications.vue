<!-- src/views/Notifications.vue -->
<template>
  <section class="notices">
    <!-- Header -->
    <header class="page-header">
      <button class="icon-btn back" @click="goBack" aria-label="Back">
        <svg viewBox="0 0 24 24" class="chev" aria-hidden="true">
          <path
            d="M15 18l-6-6 6-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="label">Back</span>
      </button>

      <h1>Notifications</h1>

      <div class="tools">
        <span v-if="unread" class="chip">{{ unread }} unread</span>
        <button class="btn btn-outline" @click="refresh" :disabled="loading">
          {{ loading ? "Refreshing…" : "Refresh" }}
        </button>
        <button
          class="btn btn-outline"
          @click="markAll"
          :disabled="loading || !unread"
        >
          Mark all as read
        </button>
      </div>
    </header>

    <!-- Body -->
    <div class="panel">
      <div v-if="loading" class="muted">Loading…</div>
      <div v-else-if="!items.length" class="muted empty">
        No notifications yet.
      </div>

      <ul class="list" v-else>
        <li
          v-for="n in items"
          :key="n.id"
          :class="['row', { unread: !n.read }]"
        >
          <!-- Icon -->
          <div class="leading">
            <span class="dot" :class="iconClass(n.type)">{{
              icon(n.type)
            }}</span>
          </div>

          <!-- Text -->
          <div class="main">
            <div class="title">
              <strong v-if="n.fromName">{{ n.fromName }}</strong>
              <span v-if="n.title"> • {{ n.title }}</span>
              <span v-else> • {{ humanTitle(n) }}</span>
            </div>
            <div class="body">{{ n.body || humanBody(n) }}</div>
            <small class="time">{{ when(n.createdAt) }}</small>
          </div>

          <!-- Actions ONLY -->
          <div class="actions">
            <!-- Pending received: Accept / Decline -->
            <template v-if="isPendingReceived(n)">
              <button
                class="btn btn-accept"
                @click="accept(n)"
                :disabled="busyId === n.id || loading"
              >
                {{ busyId === n.id ? "Accepting…" : "Accept" }}
              </button>
              <button
                class="btn btn-decline"
                @click="decline(n)"
                :disabled="busyId === n.id || loading"
              >
                {{ busyId === n.id ? "Declining…" : "Decline" }}
              </button>
            </template>

            <!-- Matched: Message -->
            <button
              v-else-if="isAccepted(n)"
              class="btn btn-accept"
              @click="message(n)"
              :disabled="busyId === n.id || loading"
            >
              {{ busyId === n.id ? "Opening…" : "Message" }}
            </button>

            <!-- Message notice: open thread -->
            <router-link
              v-else-if="n.type === 'MESSAGE' && n.threadId"
              class="btn btn-accept"
              :to="{ path: '/messages', query: { thread: String(n.threadId) } }"
              @click="read(n.id)"
            >
              Open
            </router-link>

            <!-- Always show View Profile when possible -->
            <router-link
              v-if="fromUser(n)"
              class="btn btn-outline"
              :to="{
                name: 'roomfinder-public',
                params: { id: String(fromUser(n)) },
              }"
              @click="read(n.id)"
            >
              View Profile
            </router-link>

            <!-- Fallback for odd cases -->
            <button
              class="btn btn-outline"
              v-if="showMarkReadFallback(n)"
              @click="read(n.id)"
            >
              Mark read
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";
import { useNotices } from "@/composables/useNotices";
import type { Notice } from "@/types/notice";

const router = useRouter();
const goBack = () => router.back();

const {
  unread,
  items,
  fetchUnread,
  fetchLatest,
  startLive,
  stopLive, // not used here, but fine
  markRead,
  markAllRead,
} = useNotices();

const loading = ref(false);
const busyId = ref<number | null>(null);

/** Match index (from /matches) : userId -> {status, requestId, threadId} */
const matchIndex = ref<
  Record<
    number,
    { status: string; requestId: number | null; threadId: number | null }
  >
>({});

function fromUser(n: Notice) {
  return Number((n as any).fromUserId ?? 0) || null;
}

async function loadMatchIndex() {
  try {
    const { data } = await api.get("/matches");
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.matches)
      ? data.matches
      : [];

    const idx: Record<number, any> = {};
    for (const m of list) {
      const uid = Number(m.userId ?? m.id);
      if (!uid) continue;
      idx[uid] = {
        status: String(m.relationStatus || "NONE").toUpperCase(),
        requestId: m.requestId ?? null,
        threadId: m.threadId ?? null,
      };
    }
    matchIndex.value = idx;
  } catch {
    matchIndex.value = {};
  }
}

/* helpers & labels */
function icon(t: Notice["type"]) {
  switch (t) {
    case "MESSAGE":
      return "💬";
    case "MATCH_REQUESTED":
      return "🤝";
    case "MATCH_ACCEPTED":
      return "✅";
    case "MATCH_DECLINED":
      return "🚫";
    default:
      return "🔔";
  }
}
function iconClass(t: Notice["type"]) {
  return t === "MESSAGE"
    ? "msg"
    : t === "MATCH_ACCEPTED"
    ? "ok"
    : t === "MATCH_DECLINED"
    ? "warn"
    : "info";
}
function when(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}
function humanTitle(n: Notice) {
  const t = (n.type || "").toString().toUpperCase();
  if (t === "MESSAGE") return "sent you a message";
  if (t.includes("MATCH_REQUEST")) return "sent you a match request";
  if (t === "MATCH_ACCEPTED") return "accepted your match request";
  if (t === "MATCH_DECLINED") return "declined your match request";
  return "";
}
function humanBody(n: Notice) {
  const t = (n.type || "").toString().toUpperCase();
  if (t === "MESSAGE") return "Tap to open the conversation.";
  if (t.includes("MATCH_REQUEST")) return "You can review and respond.";
  if (t === "MATCH_ACCEPTED") return "You can start chatting now.";
  if (t === "MATCH_DECLINED") return "You can explore other matches.";
  return "";
}

/* relation from index */
function relation(n: Notice) {
  const uid = fromUser(n);
  return uid ? matchIndex.value[uid]?.status : undefined;
}
function isAccepted(n: Notice) {
  const r = relation(n);
  if (r) return r === "ACCEPTED";
  return String(n.type || "").toUpperCase() === "MATCH_ACCEPTED";
}
function isDeclined(n: Notice) {
  const r = relation(n);
  return r
    ? r === "DECLINED"
    : String(n.type || "").toUpperCase() === "MATCH_DECLINED";
}
function isPendingReceived(n: Notice) {
  const r = relation(n);
  if (r) return r === "PENDING_RECEIVED";
  if (isAccepted(n) || isDeclined(n)) return false;
  const t = String(n.type || "").toUpperCase();
  if (t.includes("MATCH_REQUEST")) return true;
  const title = (n.title || "").toLowerCase();
  const body = (n.body || "").toLowerCase();
  return title.includes("match request") || body.includes("match request");
}

/* show fallback mark read? */
function showMarkReadFallback(n: Notice) {
  // Show fallback if there are no actionable buttons and no profile to view
  const uid = fromUser(n);
  const hasActions =
    isPendingReceived(n) ||
    isAccepted(n) ||
    (n.type === "MESSAGE" && (n as any).threadId);
  return !hasActions && !uid;
}

/* lifecycle */
async function refresh() {
  loading.value = true;
  try {
    await Promise.all([fetchUnread(), fetchLatest(), loadMatchIndex()]);
  } finally {
    loading.value = false;
  }
}
onMounted(async () => {
  await refresh();
  await startLive();
});

/* requestId resolver */
async function resolveRequestId(n: Notice): Promise<number | null> {
  const rid = (n as any).requestId;
  if (typeof rid === "number" && rid > 0) return rid;
  const uid = fromUser(n);
  const cached = uid ? matchIndex.value[uid]?.requestId : null;
  if (cached) return cached;
  await loadMatchIndex();
  return uid ? matchIndex.value[uid]?.requestId ?? null : null;
}

/* actions */
function read(id: number) {
  markRead(id);
}

async function accept(n: Notice) {
  busyId.value = n.id;
  try {
    const requestId = await resolveRequestId(n);
    if (!requestId)
      return alert("Couldn't find the match request. Try Refresh.");
    await api.post(`/matches/${requestId}/accept`);
    markRead(n.id);
    const uid = fromUser(n);
    if (uid)
      matchIndex.value[uid] = {
        ...(matchIndex.value[uid] || {}),
        status: "ACCEPTED",
      };
    await refresh();
  } catch (e) {
    console.error("Accept failed:", e);
    alert("Could not accept request.");
  } finally {
    busyId.value = null;
  }
}

async function decline(n: Notice) {
  busyId.value = n.id;
  try {
    const requestId = await resolveRequestId(n);
    if (!requestId)
      return alert("Couldn't find the match request. Try Refresh.");
    await api.post(`/matches/${requestId}/decline`);
    markRead(n.id);
    const uid = fromUser(n);
    if (uid)
      matchIndex.value[uid] = {
        ...(matchIndex.value[uid] || {}),
        status: "DECLINED",
      };
    await refresh();
  } catch (e) {
    console.error("Decline failed:", e);
    alert("Could not decline request.");
  } finally {
    busyId.value = null;
  }
}

async function message(n: Notice) {
  busyId.value = n.id;
  try {
    const uid = fromUser(n);
    let threadId = uid ? matchIndex.value[uid]?.threadId : (n as any).threadId;
    if (!threadId && uid) {
      const { data } = await api.post(`/messages/thread-with/${uid}`);
      threadId = data?.threadId;
    }
    if (threadId) {
      router.push({ path: "/messages", query: { thread: String(threadId) } });
    } else if (uid) {
      router.push({ path: "/messages", query: { with: String(uid) } });
    }
    markRead(n.id);
  } catch (e) {
    console.error("Open message failed:", e);
    alert("Could not open messages.");
  } finally {
    busyId.value = null;
  }
}

async function markAll() {
  await markAllRead();
}
</script>

<style>
:root {
  --brand: #25ac42;
  --brand-600: #147a2c;
  --brand-50: #eafbf0;
  --text: #0c4a23;
  --muted: #6b7a72;
  --bar-border: #e9ecef;
  --soft-green-bg: rgba(27, 149, 54, 0.06);
  --soft-green-border: rgba(27, 149, 54, 0.25);

  --danger: #d23d32;
  --danger-dark: #b91c1c;
}

.notices {
  background: #fff;
  min-height: 100vh;
  padding: 16px clamp(12px, 3vw, 24px);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--bar-border);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 8px 6px;
  margin: -16px -6px 16px;
}
.page-header h1 {
  color: var(--brand-600);
  font-weight: 900;
  letter-spacing: -0.05em;
  margin: 20px;
  font-size: 2rem;
}

.icon-btn.back {
  appearance: none;
  border: 1px solid var(--soft-green-border);
  background: var(--soft-green-bg);
  color: var(--brand);
  height: 38px;
  padding: 0 15px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.icon-btn.back .chev {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
}
.icon-btn.back:hover {
  background: rgba(27, 149, 54, 0.12);
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(27, 149, 54, 0.14);
}
@media (max-width: 480px) {
  .icon-btn.back .label {
    display: none;
  }
  .icon-btn.back {
    padding: 0 10px;
  }
}

.tools {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
}
.chip {
  display: inline-block;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: var(--soft-green-bg);
  border: 1px solid var(--soft-green-border);
  color: var(--brand);
  font-weight: 800;
  font-size: 0.85rem;
}

.panel {
  background: #f6fff9;
  border: 1px solid #edf5ef;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}
.muted {
  color: var(--muted);
}
.empty {
  padding: 1rem;
  text-align: center;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}
.row {
  display: grid;
  grid-template-columns: auto 1fr auto; /* icon | main | actions */
  gap: 0.8rem;
  align-items: center;
  background: #fff;
  border: 1px solid #e9f3ea;
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.row:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  border-color: #dff2e6;
}
.row.unread {
  border-color: #b8f1ce;
  background: #fafffb;
  box-shadow: 0 6px 18px rgba(27, 149, 54, 0.06);
}

.leading .dot {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 18px;
  border: 1px solid var(--soft-green-border);
  flex-shrink: 0;
}
.dot.msg {
  background: #e8f7ff;
  border-color: #cfeeff;
}
.dot.info {
  background: #eafbf0;
}
.dot.ok {
  background: #e8fdd5;
}
.dot.warn {
  background: #ffe8e8;
  border-color: #ffd4d4;
}

.main {
  min-width: 0;
}
.title {
  color: var(--text);
  font-weight: 800;
}
.body {
  color: #475569;
  margin-top: 2px;
}
.time {
  color: var(--muted);
  margin-top: 6px;
  display: inline-block;
}

.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Buttons */
.btn {
  border-radius: 999px;
  padding: 0.55rem 0.95rem;
  font-weight: 800;
  border: 1px solid transparent;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.06s ease, box-shadow 0.2s ease, background 0.2s ease,
    filter 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.875rem;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: #fff;
  color: var(--brand-600);
  border-color: var(--brand-600);
}
.btn-outline:hover:not(:disabled) {
  background: var(--brand-50);
}

.btn-accept {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}
.btn-accept:hover:not(:disabled) {
  filter: brightness(1.05);
  box-shadow: 0 8px 20px rgba(27, 149, 54, 0.22);
  transform: translateY(-1px);
}

.btn-decline {
  background: var(--danger);
  color: #fff;
  border-color: var(--danger);
}
.btn-decline:hover:not(:disabled) {
  background: var(--danger-dark);
  border-color: var(--danger-dark);
  transform: translateY(-1px);
}

/* Mobile */
@media (max-width: 767px) {
  .row {
    grid-template-columns: auto 1fr;
    grid-auto-rows: auto;
  }
  .actions {
    grid-column: 1 / -1;
  }
}
</style>
