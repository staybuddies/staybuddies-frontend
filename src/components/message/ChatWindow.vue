<template>
  <section class="chat">
    <header class="chat-head" v-if="conversation">
      <button
        class="back-btn"
        @click="$emit('back')"
        aria-label="Back to conversations"
      >
        ←
      </button>
      <div class="header-content">
        <div class="name">{{ conversation.otherName }}</div>
        <div class="meta">
          <span>{{ conversation.otherGender }}</span>
          <span v-if="conversation.otherLocation"
            >• {{ conversation.otherLocation }}</span
          >
        </div>
      </div>
      <button
        class="info-btn"
        @click="showDetails = true"
        aria-label="User info"
      >
        ⋮
      </button>
    </header>
    <header class="chat-head empty" v-else>
      <div class="header-content">
        <div class="name">Messages</div>
        <div class="meta">Select a conversation to start</div>
      </div>
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

    <!-- Mobile User Details Modal -->
    <div
      v-if="showDetails && conversation"
      class="details-modal"
      @click.self="showDetails = false"
    >
      <div class="details-content">
        <div class="modal-header">
          <h3>User Details</h3>
          <button class="close-btn" @click="showDetails = false">✕</button>
        </div>

        <div class="modal-body">
          <UserDetails
            :user="{
              id: conversation.otherId,
              name: conversation.otherName,
              gender: conversation.otherGender,
              location: conversation.otherLocation,
            }"
            @view-profile="handleViewProfile"
            @block="handleBlock"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import UserDetails from "./UserDetails.vue";

const props = defineProps({ conversation: Object, sending: Boolean });
const emit = defineEmits(["send", "back"]);
const draft = ref("");
const scrollBox = ref(null);
const showDetails = ref(false);

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

function handleViewProfile(userId) {
  showDetails.value = false;
  // Emit to parent to handle navigation
  emit("view-profile", userId);
}

function handleBlock(userId) {
  showDetails.value = false;
  emit("block", userId);
}

watch(
  () => props.conversation?.messages?.length,
  () => scrollToBottom()
);
watch(
  () => props.conversation?.id,
  () => {
    draft.value = "";
    showDetails.value = false;
    scrollToBottom();
  }
);
</script>

<style scoped>
.chat {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  background: #fbfde9;
}
.chat-head {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.header-content {
  flex: 1;
  min-width: 0;
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

/* Back button - hidden by default, shown on mobile */
.back-btn {
  display: none;
  background: #f4fff7;
  border: 1px solid #bfe7cc;
  color: #1b9536;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.back-btn:hover {
  background: #e6fff1;
}

/* Info button - hidden by default, shown on mobile */
.info-btn {
  display: none;
  background: #f4fff7;
  border: 1px solid #bfe7cc;
  color: #1b9536;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.8rem;
  font-weight: 900;
  line-height: 1;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.info-btn:hover {
  background: #e6fff1;
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
  font-size: 1rem;
  line-height: 1.25rem;
  display: inline-flex;
  flex-direction: column;
}
.bubble.me {
  align-self: flex-end;
  background: #1b9234;
  color: white;
  font-weight: 400;
}
.bubble.them {
  align-self: flex-start;
  background: #eae9e9fd;
  border: 1px solid #dfeee5;
  color: black;
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

/* Mobile Details Modal */
.details-modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.details-content {
  position: absolute;
  top: 0;
  right: 0;
  width: min(400px, 90vw);
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e6e6e6;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  color: #0c4a23;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Mobile styles */
@media (max-width: 1024px) {
  .details-modal {
    display: none;
  }

  .details-modal[style*="display: none"] {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .back-btn,
  .info-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bubble {
    max-width: 85%;
  }

  .composer {
    padding: 0.5rem;
  }

  /* Show modal on mobile */
  .details-modal {
    display: flex;
  }
}

@media (max-width: 480px) {
  .chat-head {
    padding: 0.6rem 0.8rem;
  }

  .back-btn,
  .info-btn {
    width: 32px;
    height: 32px;
  }

  .back-btn {
    font-size: 1.3rem;
  }

  .info-btn {
    font-size: 1.6rem;
  }

  .chat-head .name {
    font-size: 1rem;
  }

  .chat-head .meta {
    font-size: 0.85rem;
  }

  .messages {
    padding: 0.75rem;
  }

  .bubble {
    font-size: 0.95rem;
    padding: 0.5rem 0.65rem;
  }

  .details-content {
    width: 100vw;
  }
}
</style>
