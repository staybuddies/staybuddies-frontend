<template>
  <div>
    <Navbar />

    <div class="messages-layout">
      <ConversationList
        :conversations="conversations"
        :active-id="activeThreadId"
        :loading="loading"
        :error="error"
        @select="openThread"
        @reload="init"
      />

      <ChatWindow
        :conversation="activeConversation"
        :sending="sending"
        @send="sendMessage"
      />

      <UserDetails
        v-if="activeConversation"
        :user="{
          id: activeConversation.otherId,
          name: activeConversation.otherName,
          gender: activeConversation.otherGender,
          location: activeConversation.otherLocation,
        }"
        @view-profile="viewProfile"
        @block="blockUser"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import ConversationList from "@/components/message/ConversationList.vue";
import ChatWindow from "@/components/message/ChatWindow.vue";
import UserDetails from "@/components/message/UserDetails.vue";
import api from "@/api";
import { connect, subscribeJson } from "@/ws/stomp";

/* ---------------- JWT helpers (for myId) ---------------- */
function readToken() {
  let t =
    localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  t = (t || "").trim();
  if (t.startsWith("Bearer ")) t = t.slice(7).trim();
  if (!t || t === "null" || t === "undefined") return null;
  return t;
}
function myIdFromJwt() {
  try {
    const t = readToken();
    if (!t) return null;
    const p = JSON.parse(atob(t.split(".")[1] || ""));
    const raw = p?.uid ?? p?.id ?? p?.userId ?? p?.subId ?? p?.user_id ?? null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}
const myId = ref(myIdFromJwt());

/* ---------- client-side mute helpers ---------- */
const MUTE_KEY = "sb_muted_user_ids";
function readMuted() {
  try {
    return new Set(JSON.parse(localStorage.getItem(MUTE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function writeMuted(set) {
  localStorage.setItem(MUTE_KEY, JSON.stringify([...set]));
}
function isMuted(userId) {
  return readMuted().has(String(userId));
}
function addMute(userId) {
  const s = readMuted();
  s.add(String(userId));
  writeMuted(s);
}
function removeMute(userId) {
  const s = readMuted();
  s.delete(String(userId));
  writeMuted(s);
}
/* --------------------------------------------- */

const route = useRoute();
const router = useRouter();

const conversations = ref([]); // [{ id, otherId, otherName, lastMessage, lastTime, unread, messages: MessageDto[] }]
const activeThreadId = ref(null);
const loading = ref(false);
const sending = ref(false);
const error = ref("");

const activeConversation = computed(
  () => conversations.value.find((c) => c.id === activeThreadId.value) || null
);

/* ----------------------- data loaders ----------------------- */

async function fetchThreads() {
  try {
    loading.value = true;
    error.value = "";
    const { data } = await api.get("/messages/threads");
    conversations.value = (Array.isArray(data) ? data : []).map((c) => ({
      ...c,
      id: Number(c.id),
      unread: Number(c.unread || 0),
      messages: c.messages ?? [],
    }));
  } catch (e) {
    console.error(e);
    error.value = "Failed to load conversations.";
    conversations.value = [];
  } finally {
    loading.value = false;
  }
}

async function ensureThreadWith(otherId) {
  const { data } = await api.post(`/messages/thread-with/${otherId}`);
  return data.threadId;
}

async function fetchMessages(threadId) {
  const { data } = await api.get(`/messages/threads/${threadId}/messages`);
  const idx = conversations.value.findIndex((c) => c.id === threadId);
  if (idx >= 0) {
    conversations.value[idx].messages = Array.isArray(data) ? data : [];
    conversations.value[idx].unread = 0;
  }
}

/* ----------------------- realtime ----------------------- */

let unsubscribeThread = null;
let unsubscribeNoticeA = null; // /user/queue/notice
let unsubscribeNoticeB = null; // /topic/notice.user-{myId}
let heartbeatTimer = null;

/** Tell backend the thread is read, then refresh Navbar badge */
async function markThreadRead(threadId) {
  try {
    await api.put(`/messages/threads/${threadId}/read`);
    window.dispatchEvent(new CustomEvent("sb-unread-refresh"));
  } catch {
    // ignore
  }
}

/** (Re)connect and (re)subscribe if needed – idempotent */
async function ensureWs() {
  try {
    await connect(); // cheap if already connected

    // Global notices
    if (!unsubscribeNoticeA) {
      unsubscribeNoticeA = await subscribeJson("/user/queue/notice", onNotice);
    }
    if (myId.value != null && !unsubscribeNoticeB) {
      unsubscribeNoticeB = await subscribeJson(
        `/topic/notice.user-${myId.value}`,
        onNotice
      );
    }

    // Active thread subscription
    if (activeThreadId.value && !unsubscribeThread) {
      await subscribeToThread(activeThreadId.value);
    }
  } catch {
    // will retry via heartbeat
  }
}

/** Heartbeat to recover from iOS Safari background sleep and stale sockets */
function startWsHeartbeat() {
  stopWsHeartbeat();
  heartbeatTimer = window.setInterval(async () => {
    await ensureWs();
  }, 15000);
}
function stopWsHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

/**
 * Subscribe to live events for the active thread
 * We RELY on the subscribed thread id (tid), not evt.threadId.
 */
async function subscribeToThread(threadId) {
  const tid = Number(threadId);

  if (unsubscribeThread) {
    try {
      unsubscribeThread();
    } catch {}
    unsubscribeThread = null;
  }
  await connect();

  unsubscribeThread = await subscribeJson(
    `/topic/threads/${tid}`,
    async (evt) => {
      // Find the conversation by the subscribed id
      const i = conversations.value.findIndex((c) => c.id === tid);
      if (i < 0) return;

      const otherId = conversations.value[i].otherId;
      if (isMuted(otherId)) return;

      const list =
        conversations.value[i].messages ??
        (conversations.value[i].messages = []);

      // dedupe by message id if server provides it
      if (evt?.id && list.some((m) => m.id === evt.id)) return;

      // normalize server fields: prefer text, fallback to body
      const text = evt?.text ?? evt?.body ?? "";
      const iso = evt?.time ?? new Date().toISOString();

      // Determine author
      const fromMe =
        myId.value != null
          ? Number(evt?.senderId) === Number(myId.value)
          : Number(evt?.senderId) !== Number(otherId);

      list.push({
        id: evt?.id ?? Date.now(),
        fromMe,
        text,
        time: iso,
      });

      conversations.value[i].lastMessage = text;
      conversations.value[i].lastTime = iso;

      // move this conversation to top by lastTime
      const [c] = conversations.value.splice(i, 1);
      conversations.value.unshift(c);

      // If it's the active thread, mark read
      if (activeThreadId.value === tid) {
        await nextTick();
        await markThreadRead(tid);
      }
    }
  );
}

/**
 * Global notice listeners -> increments unread for other threads
 * Backend notice: { type:'MESSAGE', threadId }
 */
function onNotice(notice) {
  if (!notice || String(notice.type).toUpperCase() !== "MESSAGE") return;
  const tid = Number(notice.threadId);
  if (!tid) return;

  // If I'm currently looking at that thread, thread stream will mark it read
  if (activeThreadId.value && Number(activeThreadId.value) === tid) return;

  const i = conversations.value.findIndex((c) => c.id === tid);
  if (i >= 0) {
    conversations.value[i].unread =
      Number(conversations.value[i].unread || 0) + 1;
    const [c] = conversations.value.splice(i, 1);
    conversations.value.unshift(c);
  } else {
    // thread not in list (new conversation)
    fetchThreads();
  }

  window.dispatchEvent(new CustomEvent("sb-unread-refresh"));
}

/* ----------------------- UX actions ----------------------- */

async function sendMessage(text) {
  const body = text?.trim();
  if (!body || !activeThreadId.value) return;

  try {
    sending.value = true;

    // Make sure we're connected/subscribed (helps after iOS resume)
    await ensureWs();

    // POST to server
    const { data } = await api.post(
      `/messages/threads/${activeThreadId.value}`,
      { content: body }
    );

    // Optimistic local add (de-dupe later)
    const idx = conversations.value.findIndex(
      (c) => c.id === activeThreadId.value
    );
    if (idx >= 0) {
      const list =
        conversations.value[idx].messages ??
        (conversations.value[idx].messages = []);

      if (!list.some((m) => m.id === data?.id)) {
        list.push({
          id: data?.id ?? Date.now(),
          fromMe: true,
          text: data?.text ?? body,
          time: data?.time ?? new Date().toISOString(),
        });
        conversations.value[idx].lastMessage = data?.text ?? body;
        conversations.value[idx].lastTime =
          data?.time ?? new Date().toISOString();

        // move to top
        const [c] = conversations.value.splice(idx, 1);
        conversations.value.unshift(c);
      }
    }
  } catch (e) {
    if (e?.response?.status === 409) {
      // canonical thread reconciliation
      const serverOther = e.response?.data?.withUserId;
      const localOther = activeConversation.value?.otherId;
      const otherId = serverOther ?? localOther;
      if (otherId) {
        const canonicalId = await ensureThreadWith(Number(otherId));
        await fetchThreads();
        await openThread(canonicalId);
        return;
      }
      await fetchThreads();
      if (conversations.value.length)
        await openThread(conversations.value[0].id);
      return;
    }
    console.error(e);
    alert("Failed to send message.");
  } finally {
    sending.value = false;
  }
}

async function openThread(threadId) {
  if (!threadId) return;

  // connect first (important for iOS Safari)
  await ensureWs();

  activeThreadId.value = Number(threadId);

  const convo = conversations.value.find((c) => c.id === activeThreadId.value);
  if (!convo || !convo.messages || convo.messages.length === 0) {
    await fetchMessages(activeThreadId.value);
  }

  router.replace({
    path: "/messages",
    query: { thread: String(activeThreadId.value) },
  });

  await subscribeToThread(activeThreadId.value);

  // tell Navbar which thread is active
  window.dispatchEvent(
    new CustomEvent("sb-active-thread", { detail: activeThreadId.value })
  );

  // set local unread to 0 (UI) and mark read on server
  const idx = conversations.value.findIndex(
    (c) => c.id === activeThreadId.value
  );
  if (idx >= 0) conversations.value[idx].unread = 0;

  await nextTick();
  await markThreadRead(activeThreadId.value);
}

/* ----------------------- Profile / Block ----------------------- */

function viewProfile() {
  const otherId = activeConversation.value?.otherId;
  if (!otherId) return;
  router.push({ name: "public-profile", params: { id: String(otherId) } });
}

async function blockUser(passedId) {
  const otherId = Number(passedId ?? activeConversation.value?.otherId);
  if (!otherId) return;
  if (
    !confirm("Block this user? You will no longer receive messages from them.")
  )
    return;

  try {
    // client-side mute
    addMute(otherId);

    // Remove the conversation locally
    const idx = conversations.value.findIndex(
      (c) => Number(c.otherId) === otherId
    );
    const wasActive = activeConversation.value?.otherId === otherId;
    if (idx >= 0) conversations.value.splice(idx, 1);

    if (wasActive && unsubscribeThread) {
      unsubscribeThread();
      unsubscribeThread = null;
    }

    if (conversations.value.length) {
      await openThread(conversations.value[0].id);
    } else {
      activeThreadId.value = null;
      router.replace({ path: "/messages" });
    }
  } catch (e) {
    console.error(e);
    alert("Could not block user. Please try again.");
  }
}

/* ----------------------- init + lifecycle ----------------------- */

async function init() {
  await connect(); // 1) socket ready
  startWsHeartbeat(); // 2) keep-alive / reattach loop

  // Notices after connect
  if (!unsubscribeNoticeA)
    unsubscribeNoticeA = await subscribeJson("/user/queue/notice", onNotice);
  if (myId.value != null && !unsubscribeNoticeB)
    unsubscribeNoticeB = await subscribeJson(
      `/topic/notice.user-${myId.value}`,
      onNotice
    );

  await fetchThreads();

  const threadQ = route.query.thread ? Number(route.query.thread) : null;
  const withQ = route.query.with ? Number(route.query.with) : null;

  let targetId = null;
  if (withQ) {
    targetId = await ensureThreadWith(withQ);
    await fetchThreads();
  } else if (threadQ && conversations.value.some((c) => c.id === threadQ)) {
    targetId = threadQ;
  }

  if (targetId && conversations.value.some((c) => c.id === targetId)) {
    await openThread(targetId);
  } else if (conversations.value.length) {
    await openThread(conversations.value[0].id);
  } else {
    activeThreadId.value = null;
    router.replace({ path: "/messages" });
  }
}

function handleVisibility() {
  if (!document.hidden) ensureWs();
}
function handlePageShow() {
  ensureWs();
}
function handleOnline() {
  ensureWs();
}

onMounted(() => {
  init();
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("pageshow", handlePageShow);
  window.addEventListener("online", handleOnline);
});

onBeforeUnmount(() => {
  if (unsubscribeThread) unsubscribeThread();
  if (unsubscribeNoticeA) unsubscribeNoticeA();
  if (unsubscribeNoticeB) unsubscribeNoticeB();
  stopWsHeartbeat();
  document.removeEventListener("visibilitychange", handleVisibility);
  window.removeEventListener("pageshow", handlePageShow);
  window.removeEventListener("online", handleOnline);
  window.dispatchEvent(new CustomEvent("sb-active-thread", { detail: null }));
});
</script>

<style scoped>
.messages-layout {
  display: grid;
  grid-template-columns: 300px 1fr 260px;
  height: calc(100vh - 60px);
}
@media (max-width: 960px) {
  .messages-layout {
    grid-template-columns: 280px 1fr;
  }
}
</style>
