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

<!-- src/pages/Messages.vue -->
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
async function myIdFallbackFromMe() {
  try {
    const { data } = await api.get("/me");
    const id = Number(data?.id);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}
function myIdFromJwt() {
  try {
    const t = readToken();
    if (!t) return null;
    const p = JSON.parse(atob(t.split(".")[1] || ""));
    const raw =
      p?.uid ?? p?.id ?? p?.userId ?? p?.subId ?? p?.user_id ?? p?.sub ?? null;
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

const route = useRoute();
const router = useRouter();

const conversations = ref([]);
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
    console.error("[messages] /messages/threads failed", e);
    error.value = "Failed to load conversations.";
    conversations.value = [];
  } finally {
    loading.value = false;
  }
}

async function ensureThreadWith(otherId) {
  try {
    const { data } = await api.post(`/messages/thread-with/${otherId}`);
    if (data && data.threadId) return Number(data.threadId);
  } catch {}
  try {
    const { data } = await api.post(`/messages/thread-with`, {
      withUserId: otherId,
    });
    if (data && data.threadId) return Number(data.threadId);
  } catch {}
  try {
    const { data } = await api.post(`/messages/threads`, {
      withUserId: otherId,
    });
    if (data && data.threadId) return Number(data.threadId);
  } catch {}
  return null;
}

async function fetchMessages(threadId) {
  try {
    const { data } = await api.get(`/messages/threads/${threadId}/messages`);
    const idx = conversations.value.findIndex((c) => c.id === threadId);
    if (idx >= 0) {
      conversations.value[idx].messages = Array.isArray(data) ? data : [];
      conversations.value[idx].unread = 0;
    }
  } catch (e) {
    console.warn("[messages] load messages failed", e);
  }
}

/* ----------------------- realtime ----------------------- */
let unsubscribeThread = null;
let unsubscribeNoticeA = null;
let unsubscribeNoticeB = null;
let heartbeatTimer = null;

async function markThreadRead(threadId) {
  try {
    await api.put(`/messages/threads/${threadId}/read`);
    window.dispatchEvent(new CustomEvent("sb-unread-refresh"));
  } catch {}
}

async function ensureWs() {
  // Fire and forget — do not block UI
  connect().catch(() => {});
  if (myId.value == null) myId.value = await myIdFallbackFromMe();

  // Attach global notice subscriptions once connected
  // We’ll attempt (idempotently) every time ensureWs is called
  try {
    if (!unsubscribeNoticeA) {
      unsubscribeNoticeA = await subscribeJson("/user/queue/notice", onNotice);
    }
    if (myId.value != null && !unsubscribeNoticeB) {
      unsubscribeNoticeB = await subscribeJson(
        `/topic/notice.user-${myId.value}`,
        onNotice
      );
    }
  } catch {}
  // Active thread sub is managed separately
}

function startWsHeartbeat() {
  stopWsHeartbeat();
  heartbeatTimer = window.setInterval(() => ensureWs(), 15000);
}
function stopWsHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

async function subscribeToThread(threadId) {
  const tid = Number(threadId);
  if (!tid) return;

  if (unsubscribeThread) {
    try {
      unsubscribeThread();
    } catch {}
    unsubscribeThread = null;
  }

  // Don’t await connect here — we already made it non-blocking
  try {
    unsubscribeThread = await subscribeJson(
      `/topic/threads/${tid}`,
      async (evt) => {
        const i = conversations.value.findIndex((c) => c.id === tid);
        if (i < 0) {
          await fetchThreads();
          return;
        }

        const otherId = conversations.value[i].otherId;
        if (isMuted(otherId)) return;

        const list =
          conversations.value[i].messages ??
          (conversations.value[i].messages = []);
        if (evt?.id && list.some((m) => m.id === evt.id)) return;

        const text = evt?.text ?? evt?.body ?? evt?.content ?? "";
        const iso = evt?.time ?? new Date().toISOString();

        let fromMe = false;
        if (myId.value != null)
          fromMe = Number(evt?.senderId) === Number(myId.value);
        else fromMe = Number(evt?.senderId) !== Number(otherId);

        list.push({ id: evt?.id ?? Date.now(), fromMe, text, time: iso });

        conversations.value[i].lastMessage = text;
        conversations.value[i].lastTime = iso;

        const [c] = conversations.value.splice(i, 1);
        conversations.value.unshift(c);

        if (activeThreadId.value === tid) {
          await nextTick();
          await markThreadRead(tid);
        }
      }
    );
  } catch {}
}

function onNotice(notice) {
  if (!notice || String(notice.type).toUpperCase() !== "MESSAGE") return;
  const tid = Number(notice.threadId);
  if (!tid) return;
  if (activeThreadId.value && Number(activeThreadId.value) === tid) return;

  const i = conversations.value.findIndex((c) => c.id === tid);
  if (i >= 0) {
    conversations.value[i].unread =
      Number(conversations.value[i].unread || 0) + 1;
    const [c] = conversations.value.splice(i, 1);
    conversations.value.unshift(c);
  } else {
    fetchThreads();
  }
  window.dispatchEvent(new CustomEvent("sb-unread-refresh"));
}

/* ----------------------- UX actions ----------------------- */
async function sendMessage(text) {
  const body = text?.trim();
  if (!body || !activeThreadId.value) return;

  // Try to keep WS up, but don’t block sending
  ensureWs();

  try {
    sending.value = true;
    const { data } = await api.post(
      `/messages/threads/${activeThreadId.value}`,
      { content: body }
    );

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
          text: data?.text ?? data?.content ?? body,
          time: data?.time ?? new Date().toISOString(),
        });
        conversations.value[idx].lastMessage =
          data?.text ?? data?.content ?? body;
        conversations.value[idx].lastTime =
          data?.time ?? new Date().toISOString();
        const [c] = conversations.value.splice(idx, 1);
        conversations.value.unshift(c);
      }
    }
  } catch (e) {
    if (e?.response?.status === 409) {
      const serverOther = e.response?.data?.withUserId;
      const localOther = activeConversation.value?.otherId;
      const otherId = serverOther ?? localOther;
      if (otherId) {
        const canonicalId = await ensureThreadWith(Number(otherId));
        await fetchThreads();
        if (canonicalId) await openThread(canonicalId);
        return;
      }
      await fetchThreads();
      if (conversations.value.length)
        await openThread(conversations.value[0].id);
      return;
    }
    console.error("[messages] send failed", e);
    alert("Failed to send message.");
  } finally {
    sending.value = false;
  }
}

async function openThread(threadId) {
  if (!threadId) return;

  ensureWs(); // fire & forget
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

  window.dispatchEvent(
    new CustomEvent("sb-active-thread", { detail: activeThreadId.value })
  );

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
    addMute(otherId);
    const idx = conversations.value.findIndex(
      (c) => Number(c.otherId) === otherId
    );
    const wasActive = activeConversation.value?.otherId === otherId;
    if (idx >= 0) conversations.value.splice(idx, 1);
    if (wasActive && unsubscribeThread) {
      try {
        unsubscribeThread();
      } catch {}
      unsubscribeThread = null;
    }

    if (conversations.value.length) await openThread(conversations.value[0].id);
    else {
      activeThreadId.value = null;
      router.replace({ path: "/messages" });
    }
  } catch (e) {
    console.error("[messages] block failed", e);
    alert("Could not block user. Please try again.");
  }
}

/* ----------------------- init + lifecycle ----------------------- */
async function init() {
  // 1) Start WS in background (don’t await)
  ensureWs();
  startWsHeartbeat();

  // 2) If navigated with ?with=USER_ID ensure a thread exists
  const withQ = route.query.with ? Number(route.query.with) : null;
  let targetThreadId = null;
  if (withQ) {
    targetThreadId = await ensureThreadWith(withQ);
  }

  // 3) Load threads regardless of WS state
  await fetchThreads();

  // 4) Prefer opening ensured or existing thread with that user
  if (
    targetThreadId &&
    conversations.value.some((c) => c.id === targetThreadId)
  ) {
    await openThread(targetThreadId);
    return;
  }
  if (withQ) {
    const existing = conversations.value.find(
      (c) => Number(c.otherId) === withQ
    );
    if (existing) {
      await openThread(existing.id);
      return;
    }
  }

  // 5) Otherwise open most recent
  if (conversations.value.length) {
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
  try {
    unsubscribeThread && unsubscribeThread();
  } catch {}
  try {
    unsubscribeNoticeA && unsubscribeNoticeA();
  } catch {}
  try {
    unsubscribeNoticeB && unsubscribeNoticeB();
  } catch {}
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
  /* left list | chat | right details  */
  grid-template-columns: 280px minmax(0, 1fr) 300px;
  /* add breathing room between columns */
  column-gap: 16px;
  height: calc(100vh - 60px);
  /* keep the whole grid from sitting under the browser edge on tiny rounding */
  padding: 0 8px 8px;
  box-sizing: border-box;
}

/* Large-ish screens: a little narrower right pane */
@media (max-width: 1400px) {
  .messages-layout {
    grid-template-columns: 270px minmax(0, 1fr) 280px;
    column-gap: 14px;
  }
}

/* Tablet: hide the details panel so chat has space */
@media (max-width: 1024px) {
  .messages-layout {
    grid-template-columns: 260px minmax(0, 1fr);
  }
}

/* Narrow: slightly smaller left list */
@media (max-width: 820px) {
  .messages-layout {
    grid-template-columns: 220px minmax(0, 1fr);
    padding: 0 6px 6px;
    column-gap: 10px;
  }
}
</style>
