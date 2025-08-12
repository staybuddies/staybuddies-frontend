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
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import ConversationList from "@/components/message/ConversationList.vue";
import ChatWindow from "@/components/message/ChatWindow.vue";
import UserDetails from "@/components/message/UserDetails.vue";
import api from "@/api";

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

async function fetchThreads() {
  try {
    loading.value = true;
    error.value = "";
    const { data } = await api.get("/messages/threads");
    conversations.value = (Array.isArray(data) ? data : []).map((c) => ({
      ...c,
      id: Number(c.id), // ensure number
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
}

async function sendMessage(text) {
  const body = text?.trim();
  if (!body || !activeThreadId.value) return;

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
      const msg = {
        id: data.id,
        fromMe: data.fromMe ?? true,
        text: data.text ?? data.body ?? body,
        time: data.time ?? new Date().toISOString(),
      };
      conversations.value[idx].messages.push(msg);
      conversations.value[idx].lastMessage = msg.text;
      conversations.value[idx].lastTime = msg.time;
    }
  } catch (e) {
    if (e.response?.status === 409) {
      // Prefer server hint; otherwise use the current conversation’s otherId
      const serverOther = e.response?.data?.withUserId;
      const localOther = activeConversation.value?.otherId;
      const otherId = serverOther ?? localOther;

      if (otherId) {
        // Ask backend for my canonical thread with this user
        const canonicalId = await ensureThreadWith(otherId); // POST /messages/thread-with/:id
        await fetchThreads(); // refresh my list (now includes canonicalId)
        await openThread(canonicalId); // switches UI + updates ?thread=
        return;
      }

      // worst-case fallback: resync and open the first conversation
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

async function init() {
  await fetchThreads();

  const threadQ = route.query.thread ? Number(route.query.thread) : null;
  const withQ = route.query.with ? Number(route.query.with) : null;

  let targetId = null;

  if (withQ) {
    // Ask the server for my canonical thread with that user
    targetId = await ensureThreadWith(withQ);
    await fetchThreads(); // refresh list to include/reflect it
  } else if (threadQ && conversations.value.some((c) => c.id === threadQ)) {
    // Only accept ?thread= if it’s in MY list
    targetId = threadQ;
  }

  if (targetId && conversations.value.some((c) => c.id === targetId)) {
    await openThread(targetId);
  } else if (conversations.value.length) {
    await openThread(conversations.value[0].id);
  } else {
    activeThreadId.value = null;
    // strip stale query
    router.replace({ path: "/messages" });
  }
}

onMounted(init);
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
