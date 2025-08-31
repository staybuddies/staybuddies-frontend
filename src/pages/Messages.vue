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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import ConversationList from "@/components/message/ConversationList.vue";
import ChatWindow from "@/components/message/ChatWindow.vue";
import UserDetails from "@/components/message/UserDetails.vue";
import api from "@/api";
import { connect, subscribeJson } from "@/ws/stomp";

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

const conversations = ref([]); // [{ id, otherId, otherName, messages: MessageDto[] }]
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
// --- for message icon showing the unread messages ---
async function markThreadRead(threadId) {
  try {
    await api.put(`/messages/threads/${threadId}/read`);
    // Ask Navbar to refresh the unread badge
    window.dispatchEvent(new CustomEvent("sb-unread-refresh"));
  } catch (e) {
    // ignore
  }
}
/**
 * Subscribe to /topic/threads/{id}
 * Backend event shape we handle:
 *   { threadId, id, senderId, text, time }
 */
async function subscribeToThread(threadId) {
  if (unsubscribeThread) {
    unsubscribeThread();
    unsubscribeThread = null;
  }
  await connect();

  unsubscribeThread = await subscribeJson(
    `/topic/threads/${threadId}`,
    async (evt) => {
      // <-- make the handler async
      const i = conversations.value.findIndex((c) => c.id === evt.threadId);
      if (i < 0) return;

      // Ignore if muted
      const otherId = conversations.value[i].otherId;
      if (isMuted(otherId)) return;

      const list =
        conversations.value[i].messages ??
        (conversations.value[i].messages = []);

      // de-dupe by message id
      if (list.some((m) => m.id === evt.id)) return;

      const fromMe = evt.senderId !== otherId;

      list.push({
        id: evt.id,
        fromMe,
        text: evt.text,
        time: evt.time,
      });

      conversations.value[i].lastMessage = evt.text;
      conversations.value[i].lastTime = evt.time;

      if (activeThreadId.value !== evt.threadId) {
        conversations.value[i].unread =
          (conversations.value[i].unread ?? 0) + 1;
      } else {
        // I'm viewing this thread → mark as read on server & refresh Navbar badge
        await markThreadRead(evt.threadId);
      }
    }
  );
}

/* ----------------------- UX actions ----------------------- */
async function sendMessage(text) {
  const body = text?.trim();
  if (!body || !activeThreadId.value) return;

  try {
    sending.value = true;

    // POST to server
    const { data } = await api.post(
      `/messages/threads/${activeThreadId.value}`,
      { content: body }
    );

    // Optimistic local add (guard against duplicate when websocket echo arrives)
    const idx = conversations.value.findIndex(
      (c) => c.id === activeThreadId.value
    );
    if (idx >= 0) {
      const list =
        conversations.value[idx].messages ??
        (conversations.value[idx].messages = []);

      if (!list.some((m) => m.id === data?.id)) {
        list.push({
          id: data?.id ?? Date.now(), // fallback id just in case
          fromMe: true,
          text: data?.text ?? body,
          time: data?.time ?? new Date().toISOString(),
        });
        conversations.value[idx].lastMessage = data?.text ?? body;
        conversations.value[idx].lastTime =
          data?.time ?? new Date().toISOString();
      }
    }
    // Since I'm on this thread, no unread bump needed; nothing else to do.
  } catch (e) {
    // Handle “canonical thread” merge if your backend returns 409
    if (e?.response?.status === 409) {
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

  // tell Navbar which thread is active (so it won't increment on pushes for this one)
  window.dispatchEvent(
    new CustomEvent("sb-active-thread", { detail: activeThreadId.value })
  );

  // set local unread to 0 for this conversation (UI), then mark read on server (source of truth)
  const idx = conversations.value.findIndex(
    (c) => c.id === activeThreadId.value
  );
  if (idx >= 0) conversations.value[idx].unread = 0;

  await markThreadRead(activeThreadId.value);
}

/* ----------------------- Profile / Block ----------------------- */

/**
 * View Profile:
 * Go to the public profile page of the other user.
 * Requires route: { path: '/users/:id', name: 'public-profile', component: ... }
 */
function viewProfile() {
  const otherId = activeConversation.value?.otherId;
  if (!otherId) return;
  router.push({ name: "public-profile", params: { id: String(otherId) } });
}

/**
 * Block (client-side "mute"):
 * Adds the user to a localStorage set and removes the conversation.
 * 👉 When you add a real backend block, call it where marked.
 */
async function blockUser(passedId) {
  const otherId = Number(passedId ?? activeConversation.value?.otherId);
  if (!otherId) return;
  if (
    !confirm("Block this user? You will no longer receive messages from them.")
  )
    return;

  try {
    // 👉 UPGRADE HERE if you add a backend block endpoint:
    // await api.post(`/blocks/${otherId}`);

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

/* ----------------------- init ----------------------- */

async function init() {
  await fetchThreads();
  await connect();

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

onMounted(init);
onBeforeUnmount(() => {
  if (unsubscribeThread) unsubscribeThread();
  window.dispatchEvent(new CustomEvent("sb-active-thread", { detail: null })); // clear hint for Navbar
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
