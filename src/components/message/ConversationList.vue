<template>
  <aside class="list">
    <div class="head">
      <h3>Chats</h3>
      <button class="reload" @click="$emit('reload')" title="Reload">⟳</button>
    </div>

    <div v-if="loading" class="state">Loading…</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="!conversations.length" class="state">
      No conversations yet
    </div>

    <ul v-else class="items">
      <li
        v-for="c in conversations"
        :key="c.id"
        :class="['item', { active: c.id === activeId }]"
        @click="$emit('select', c.id)"
      >
        <div class="title-row">
          <div class="name">{{ c.otherName }}</div>
          <div class="time">{{ c.lastTime ? formatTime(c.lastTime) : "" }}</div>
        </div>
        <div class="preview">
          <span>{{ c.lastMessage || "Start chatting…" }}</span>
          <span v-if="c.unread" class="badge">{{ c.unread }}</span>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script setup>
defineProps({
  conversations: { type: Array, default: () => [] },
  activeId: { type: Number, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});
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
</script>

<style scoped>
.list {
  border-right: 1px solid #e5e7eb;
  background: #fff;
  height: 100%;
  overflow: auto;
  padding: 0.5rem;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.25rem 0.5rem;
}
.reload {
  border: 1px solid #1b9536;
  background: white;
  color: #1b9536;
  border-radius: 6px;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
}
.state {
  color: #666;
  padding: 0.5rem;
}
.state.error {
  color: #c92a2a;
}
.items {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item {
  padding: 0.6rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
}
.item:hover {
  background: #f3f6f4;
}
.item.active {
  background: #e9f7ee;
}
.title-row {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  color: #0c4a23;
}
.preview {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  color: #555;
  font-size: 0.92rem;
}
.badge {
  background: #1b9536;
  color: white;
  border-radius: 999px;
  padding: 0 0.45rem;
  font-size: 0.75rem;
}
</style>
