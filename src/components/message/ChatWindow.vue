<template>
  <section class="chat">
    <header class="chat-head" v-if="conversation">
      <div class="name">{{ conversation.otherName }}</div>
      <div class="meta">
        <span>{{ conversation.otherGender }}</span>
        <span v-if="conversation.otherLocation"
          >• {{ conversation.otherLocation }}</span
        >
      </div>
    </header>
    <header class="chat-head empty" v-else>
      <div class="name">Messages</div>
      <div class="meta">Select a conversation to start</div>
    </header>

    <main ref="scrollBox" class="messages">
      <div
        v-for="m in conversation?.messages || []"
        :key="m.id"
        :class="['bubble', m.fromMe ? 'me' : 'them']"
      >
        <div class="text">{{ m.text ?? m.body }}</div>
        <div class="time">{{ formatTime(m.time) }}</div>
      </div>
    </main>

    <footer class="composer">
      <input
        v-model="draft"
        :disabled="!conversation || sending"
        type="text"
        placeholder="Type a message…"
        @keydown.enter.prevent="submit"
      />
      <button
        class="send"
        :disabled="!draft.trim() || !conversation || sending"
        @click="submit"
      >
        Send
      </button>
    </footer>
  </section>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
const props = defineProps({ conversation: Object, sending: Boolean });
const emit = defineEmits(["send"]);
const draft = ref("");
const scrollBox = ref(null);

function formatTime(t) {
  try {
    return new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
function scrollToBottom() {
  nextTick(() => {
    if (scrollBox.value)
      scrollBox.value.scrollTop = scrollBox.value.scrollHeight;
  });
}
function submit() {
  const text = draft.value.trim();
  if (!text || !props.conversation) return;
  emit("send", text);
  draft.value = "";
  scrollToBottom();
}
watch(
  () => props.conversation?.messages?.length,
  () => scrollToBottom()
);
watch(
  () => props.conversation?.id,
  () => {
    draft.value = "";
    scrollToBottom();
  }
);
</script>

<style scoped>
.chat {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  background: #faffd6;
}
.chat-head {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}
.chat-head .name {
  font-weight: 900;
  color: #0c4a23;
}
.chat-head .meta {
  color: #555;
  font-size: 0.9rem;
}
.chat-head.empty {
  color: #777;
}

.messages {
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.bubble {
  max-width: 70%;
  padding: 0.6rem 0.75rem;
  border-radius: 14px;
  font-size: 0.95rem;
  line-height: 1.25rem;
  display: inline-flex;
  flex-direction: column;
}
.bubble.me {
  align-self: flex-end;
  background: #1b9536;
  color: white;
}
.bubble.them {
  align-self: flex-start;
  background: #ffffff;
  border: 1px solid #dfeee5;
  color: #0c4a23;
}
.time {
  opacity: 0.7;
  font-size: 0.75rem;
  margin-top: 0.15rem;
  align-self: flex-end;
}
.composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  padding: 0.6rem;
  background: #fff;
  border-top: 1px solid #e5e7eb;
}
.composer input {
  border: 1px solid #1b9536;
  border-radius: 8px;
  padding: 0.6rem 0.7rem;
  outline: none;
}
.composer input:disabled {
  background: #f3f4f6;
}
.send {
  background: #1b9536;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 0.9rem;
  font-weight: 700;
  cursor: pointer;
}
.send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
